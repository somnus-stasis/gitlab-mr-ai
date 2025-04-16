import fs from "fs/promises";
import path from "path";
import { generateSummaryFromChanges } from "../../infrastructure/gemini.client";

export async function summarizeFromDiff(
  diffJson: any[],
  promptInput: string = "summary-base.txt"
) {
  const isCustomPath = promptInput.includes("/") || promptInput.includes("\\");
  const promptPath = isCustomPath
    ? path.resolve(promptInput)
    : path.resolve("src/prompts", promptInput); // << fallback default

  const summary = await generateSummaryFromChanges(promptPath, diffJson);

  return {
    description: summary.description,
    keyChanges: summary.keyChanges.join("\n"),
  };
}
