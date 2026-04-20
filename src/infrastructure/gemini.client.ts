import { GoogleGenAI } from "@google/genai";
import { Env } from "../config/env";
import fs from "fs/promises";
import path from "path";
import { GitLabMRChange } from "../types/gitlab.types";

type SummaryResponse = {
  title: string;
  description: string;
  keyChanges: string[];
};

type AiClient = Pick<GoogleGenAI, "models">;
type SummaryGenerator = (
  promptPath: string,
  changesJson: GitLabMRChange[]
) => Promise<SummaryResponse>;

/**
 * Creates the Gemini SDK client used by the summary generator.
 */
export function createAiClient(): AiClient {
  return new GoogleGenAI({
    apiKey: Env.GEMINI_API_KEY,
    ...(Env.MR_AI_GENAI_API_VERSION
      ? { apiVersion: Env.MR_AI_GENAI_API_VERSION }
      : {}),
  });
}

/**
 * Translates SDK-level Gemini errors into clearer application-level messages.
 */
function toGeminiError(error: unknown): Error {
  if (
    !error ||
    typeof error !== "object" ||
    typeof (error as { status?: unknown }).status !== "number"
  ) {
    return error instanceof Error
      ? error
      : new Error("Unexpected Gemini SDK error.");
  }

  const apiError = error as Error & { status: number };

  if (apiError.status === 401 || apiError.status === 403) {
    return new Error(
      "Gemini API authentication failed. Check GEMINI_API_KEY and permissions."
    );
  }

  if (apiError.status === 404) {
    return new Error(
      `Gemini model '${Env.GEMINI_MODEL}' was not found. Check GEMINI_MODEL.`
    );
  }

  if (apiError.status === 429) {
    return new Error(
      "Gemini API rate limit or quota exceeded. Retry later or review your quota."
    );
  }

  if (apiError.status >= 500) {
    return new Error("Gemini API is temporarily unavailable. Please retry.");
  }

  return new Error(
    `Gemini API request failed (${apiError.status}): ${apiError.message}`
  );
}

/**
 * Builds the prompt sent to Gemini by combining the prompt template and diff.
 */
async function buildSummaryPrompt(
  promptPath: string,
  changesJson: GitLabMRChange[]
): Promise<string> {
  const promptBase = await fs.readFile(path.resolve(promptPath), "utf-8");

  return `${promptBase}\n\nHere is the list of changes as JSON:\n\n${JSON.stringify(
    changesJson,
    null,
    2
  )}`;
}

/**
 * Calls Gemini with the prepared prompt and returns the raw text response.
 */
async function requestSummaryText(
  ai: AiClient,
  prompt: string
): Promise<string> {
  const response = await ai.models.generateContent({
    model: Env.GEMINI_MODEL,
    contents: prompt,
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("Gemini API returned an empty response.");
  }

  return text;
}

/**
 * Removes a single fenced code block wrapper so the response can be parsed as
 * JSON or treated as plain markdown text.
 */
function stripCodeFence(text: string): string {
  const fencedMatch = text.match(/^```(?:json|markdown)?\s*([\s\S]*?)\s*```$/);
  return fencedMatch ? fencedMatch[1].trim() : text;
}

/**
 * Parses the model response into the internal summary shape, with a safe
 * fallback for non-JSON answers.
 */
function parseSummaryResponse(
  text: string
): SummaryResponse {
  const cleaned = stripCodeFence(text.trim());

  try {
    const parsed = JSON.parse(cleaned) as Partial<{
      title: string;
      description: string;
      keyChanges: string[];
    }>;

    const description =
      typeof parsed.description === "string" && parsed.description.trim()
        ? parsed.description
        : cleaned;
    const title = typeof parsed.title === "string" ? parsed.title : "";
    const keyChanges = Array.isArray(parsed.keyChanges)
      ? parsed.keyChanges.filter(
          (change): change is string =>
            typeof change === "string" && change.trim().length > 0
        )
      : [];

    return {
      title,
      description,
      keyChanges,
    };
  } catch {
    return {
      title: "",
      description: cleaned,
      keyChanges: [],
    };
  }
}

/**
 * Production entry point for generating summaries from GitLab diff changes.
 */
export async function generateSummaryFromChanges(
  promptPath: string,
  changesJson: GitLabMRChange[]
): Promise<SummaryResponse> {
  return createSummaryGenerator()(promptPath, changesJson);
}

/**
 * Builds a summary generator with an injectable AI client factory to keep the
 * production path simple while making tests deterministic.
 */
export function createSummaryGenerator(
  aiClientFactory: () => AiClient = createAiClient
): SummaryGenerator {
  return async function generateSummary(
    promptPath: string,
    changesJson: GitLabMRChange[]
  ): Promise<SummaryResponse> {
    try {
      const ai = aiClientFactory();
      const prompt = await buildSummaryPrompt(promptPath, changesJson);
      const text = await requestSummaryText(ai, prompt);
      return parseSummaryResponse(text);
    } catch (error) {
      throw toGeminiError(error);
    }
  };
}
