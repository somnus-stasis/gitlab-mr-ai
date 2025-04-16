import { GoogleGenerativeAI } from "@google/generative-ai";
import { Env } from "../config/env";
import fs from "fs/promises";
import path from "path";

const genAI = new GoogleGenerativeAI(Env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: Env.GEMINI_MODEL });

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

  const result = await model.generateContent(finalPrompt);
  const response = await result.response;

  let text = response.text().trim();

  // Strip ```json ... ``` if present
  if (text.startsWith("```json")) {
    text = text
      .replace(/^```json/, "")
      .replace(/```$/, "")
      .trim();
  }

  const parsed = JSON.parse(text);

  return {
    title: parsed.title,
    description: parsed.description,
    keyChanges: parsed.keyChanges,
  };
}
