import { GoogleGenAI } from "@google/genai";
import { Env } from "../config/env";
import fs from "fs/promises";
import path from "path";

const ai = new GoogleGenAI({ apiKey: Env.GEMINI_API_KEY });

export async function generateSummaryFromChanges(
  promptPath: string,
  changesJson: any[]
): Promise<{ title: string; description: string; keyChanges: string[] }> {
  const promptBase = await fs.readFile(path.resolve(promptPath), "utf-8");
  const finalPrompt = `${promptBase}\n\nHere is the list of changes as JSON:\n\n${JSON.stringify(
    changesJson,
    null,
    2
  )}`;

  const response = await ai.models.generateContent({
    model: Env.GEMINI_MODEL,
    contents: finalPrompt,
  });

  const text = response.text?.trim();

  if (!text) {
    throw new Error("No response text from Gemini API.");
  }

  let cleaned = text;

  // Strip ```json ... ``` if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();
  }

  const parsed = JSON.parse(cleaned);

  return {
    title: parsed.title,
    description: parsed.description,
    keyChanges: parsed.keyChanges,
  };
}
