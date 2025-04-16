import fs from "fs/promises";
import path from "path";
import { generateSummaryFromChanges } from "../../infrastructure/gemini.client";

export async function summarizeFromDiff(
  diffJson: any[],
  promptName = "summary-base.txt"
) {
  const promptPath = path.resolve("src/prompts", promptName);
  const summary = await generateSummaryFromChanges(promptPath, diffJson);

  return {
    description: summary.description,
    keyChanges: summary.keyChanges.join("\n"),
  };
}
