import { generateSummaryFromChanges } from "../../src/infrastructure/gemini.client";
import * as fs from "fs/promises";

jest.mock("fs/promises", () => ({
  readFile: jest.fn(() => Promise.resolve("PROMPT_TEMPLATE")),
}));

// Mock SDK structure dari @google/generative-ai
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockImplementation(() =>
        Promise.resolve({
          response: {
            text: () => "```markdown\nFallback raw markdown response\n```",
          },
        })
      ),
    }),
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
    const { GoogleGenerativeAI } = jest.requireMock("@google/generative-ai");
    GoogleGenerativeAI.mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: () =>
          Promise.resolve({
            response: {
              text: () =>
                JSON.stringify({
                  description: "Real summary",
                  keyChanges: ["- file1.ts: updated function"],
                }),
            },
          }),
      }),
    }));

    const result = await generateSummaryFromChanges("dummy-prompt.txt", []);
    expect(result.description).toBe("Real summary");
    expect(result.keyChanges).toContain("- file1.ts: updated function");
  });
});
