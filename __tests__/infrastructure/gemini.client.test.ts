import { generateSummaryFromChanges } from "../../src/infrastructure/gemini.client";
import * as fs from "fs/promises";

jest.mock("fs/promises", () => ({
  readFile: jest.fn(() => Promise.resolve("PROMPT_TEMPLATE")),
}));

// Mock SDK structure dari @google/genai
jest.mock("@google/genai", () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn().mockImplementation(() =>
        Promise.resolve({
          text: "```markdown\nFallback raw markdown response\n```",
        })
      ),
    },
  })),
}));

describe("generateSummaryFromChanges", () => {
  it("should fallback to raw text if AI response is not valid JSON", async () => {
    const result = await generateSummaryFromChanges("dummy-prompt.txt", [
      { new_path: "file1.ts", diff: "+ const a = 1;" },
    ]);

    expect(result.description).toContain("Fallback raw markdown response");
    expect(result.keyChanges).toEqual([]);
  });

  it("should parse valid JSON if AI response is valid", async () => {
    // Override mock untuk test ini saja
    const { GoogleGenAI } = jest.requireMock("@google/genai");
    GoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: () =>
          Promise.resolve({
            text: JSON.stringify({
              title: "Judul",
              description: "Real summary",
              keyChanges: ["- file1.ts: updated function"],
            }),
          }),
      },
    }));

    const result = await generateSummaryFromChanges("dummy-prompt.txt", []);
    expect(result.title).toBe("Judul");
    expect(result.description).toBe("Real summary");
    expect(result.keyChanges).toContain("- file1.ts: updated function");
  });
});
