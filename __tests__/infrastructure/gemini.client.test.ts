import { generateSummaryFromChanges } from "../../src/infrastructure/gemini.client";
import { GitLabMRChange } from "../../src/types/gitlab.types";
import * as fs from "fs/promises";
import { ApiError } from "@google/genai";

jest.mock("fs/promises", () => ({
  readFile: jest.fn(() => Promise.resolve("PROMPT_TEMPLATE")),
}));

// Mock SDK structure dari @google/genai
jest.mock("@google/genai", () => ({
  ApiError: class ApiError extends Error {
    status: number;

    constructor(options: { status: number; message: string }) {
      super(options.message);
      this.status = options.status;
    }
  },
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

function createChange(overrides: Partial<GitLabMRChange> = {}): GitLabMRChange {
  return {
    old_path: "file1.ts",
    new_path: "file1.ts",
    a_mode: "100644",
    b_mode: "100644",
    new_file: false,
    renamed_file: false,
    deleted_file: false,
    diff: "+ const a = 1;",
    ...overrides,
  };
}

describe("generateSummaryFromChanges", () => {
  it("should fallback to raw text if AI response is not valid JSON", async () => {
    const result = await generateSummaryFromChanges("dummy-prompt.txt", [
      createChange(),
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

  it("should sanitize malformed JSON payload fields", async () => {
    const { GoogleGenAI } = jest.requireMock("@google/genai");
    GoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: () =>
          Promise.resolve({
            text: JSON.stringify({
              title: 123,
              description: "",
              keyChanges: ["- file1.ts: updated function", 42, ""],
            }),
          }),
      },
    }));

    const result = await generateSummaryFromChanges("dummy-prompt.txt", []);

    expect(result.title).toBe("");
    expect(result.description).toContain('"description":""');
    expect(result.keyChanges).toEqual(["- file1.ts: updated function"]);
  });

  it("should translate authentication errors into a clearer message", async () => {
    const { GoogleGenAI } = jest.requireMock("@google/genai");
    GoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: () =>
          Promise.reject(
            new ApiError({
              status: 401,
              message: "Unauthorized",
            })
          ),
      },
    }));

    await expect(
      generateSummaryFromChanges("dummy-prompt.txt", [createChange()])
    ).rejects.toThrow(
      "Gemini API authentication failed. Check GEMINI_API_KEY and permissions."
    );
  });

  it("should translate missing model errors into a clearer message", async () => {
    const { GoogleGenAI } = jest.requireMock("@google/genai");
    GoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: () =>
          Promise.reject(
            new ApiError({
              status: 404,
              message: "Not Found",
            })
          ),
      },
    }));

    await expect(
      generateSummaryFromChanges("dummy-prompt.txt", [createChange()])
    ).rejects.toThrow("Gemini model");
  });

  it("should translate quota errors into a clearer message", async () => {
    const { GoogleGenAI } = jest.requireMock("@google/genai");
    GoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: () =>
          Promise.reject(
            new ApiError({
              status: 429,
              message: "Too Many Requests",
            })
          ),
      },
    }));

    await expect(
      generateSummaryFromChanges("dummy-prompt.txt", [createChange()])
    ).rejects.toThrow(
      "Gemini API rate limit or quota exceeded. Retry later or review your quota."
    );
  });

  it("should fail with a clear message when the model returns no text", async () => {
    const { GoogleGenAI } = jest.requireMock("@google/genai");
    GoogleGenAI.mockImplementation(() => ({
      models: {
        generateContent: () =>
          Promise.resolve({
            text: "",
          }),
      },
    }));

    await expect(
      generateSummaryFromChanges("dummy-prompt.txt", [createChange()])
    ).rejects.toThrow("Gemini API returned an empty response.");
  });

  it("should pass apiVersion to the Gemini client when configured", async () => {
    jest.resetModules();
    process.env.MR_AI_GENAI_API_VERSION = "v1";

    const { GoogleGenAI } = jest.requireMock("@google/genai");
    GoogleGenAI.mockClear();

    const { generateSummaryFromChanges } = await import(
      "../../src/infrastructure/gemini.client"
    );

    await generateSummaryFromChanges("dummy-prompt.txt", [createChange()]);

    expect(GoogleGenAI).toHaveBeenCalledWith(
      expect.objectContaining({
        apiVersion: "v1",
      })
    );

    delete process.env.MR_AI_GENAI_API_VERSION;
  });
});
