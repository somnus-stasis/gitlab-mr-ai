import { summarizeFromDiff } from "../../../src/core/summarize/summarizeFromDiff";

jest.mock("../../../src/infrastructure/gemini.client", () => ({
  generateSummaryFromChanges: jest.fn(() =>
    Promise.resolve({
      description: "Mocked description from Gemini",
      keyChanges: ["- file1.ts: updated logic", "- file2.ts: fixed bug"],
    })
  ),
}));

describe("summarizeFromDiff", () => {
  it("should return summary description and keyChanges from mocked Gemini", async () => {
    const mockDiff = [{ new_path: "file1.ts", diff: "+ some code" }];
    const result = await summarizeFromDiff(mockDiff, "summary-base.txt");

    expect(result.description).toBe("Mocked description from Gemini");
    expect(result.keyChanges).toContain("file1.ts");
  });
});
