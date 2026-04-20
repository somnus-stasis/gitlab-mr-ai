import fs from "fs/promises";
import { generateMrSummary } from "../src/main";
import {
  getMergeRequestChanges,
  updateMergeRequestDescription,
} from "../src/infrastructure/gitlab.client";
import { summarizeFromDiff } from "../src/core/summarize/summarizeFromDiff";
import { renderTemplate } from "../src/templates/render.service";

jest.mock("fs/promises", () => ({
  __esModule: true,
  default: {
    writeFile: jest.fn(),
  },
}));

jest.mock("../src/infrastructure/gitlab.client", () => ({
  getMergeRequestChanges: jest.fn(),
  updateMergeRequestDescription: jest.fn(),
}));

jest.mock("../src/core/summarize/summarizeFromDiff", () => ({
  summarizeFromDiff: jest.fn(),
}));

jest.mock("../src/templates/render.service", () => ({
  renderTemplate: jest.fn(),
}));

const mockedWriteFile = fs.writeFile as jest.MockedFunction<typeof fs.writeFile>;
const mockedGetMergeRequestChanges =
  getMergeRequestChanges as jest.MockedFunction<typeof getMergeRequestChanges>;
const mockedUpdateMergeRequestDescription =
  updateMergeRequestDescription as jest.MockedFunction<
    typeof updateMergeRequestDescription
  >;
const mockedSummarizeFromDiff =
  summarizeFromDiff as jest.MockedFunction<typeof summarizeFromDiff>;
const mockedRenderTemplate =
  renderTemplate as jest.MockedFunction<typeof renderTemplate>;

describe("generateMrSummary", () => {
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    mockedSummarizeFromDiff.mockResolvedValue({
      description: "Mocked summary",
      keyChanges: "- src/main.ts: updated behavior",
    });
    mockedRenderTemplate.mockResolvedValue("Rendered summary");
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("should use bug-fix template and keep prefixed tickets unchanged", async () => {
    mockedGetMergeRequestChanges.mockResolvedValue({
      changes: [],
      sourceBranch: "fix/PL-12-login",
    });

    await generateMrSummary({
      mrId: "101",
      output: "console",
    });

    expect(mockedRenderTemplate).toHaveBeenCalledWith(
      "bug-fix",
      expect.objectContaining({
        ticket: "PL-12",
      })
    );
  });

  it("should use standard template for non-fix branches with allowed prefixes", async () => {
    mockedGetMergeRequestChanges.mockResolvedValue({
      changes: [],
      sourceBranch: "feat/PL-77-dashboard",
    });

    await generateMrSummary({
      mrId: "102",
      output: "console",
    });

    expect(mockedRenderTemplate).toHaveBeenCalledWith(
      "standard",
      expect.objectContaining({
        ticket: "PL-77",
      })
    );
  });

  it("should format numeric tickets with # prefix", async () => {
    mockedGetMergeRequestChanges.mockResolvedValue({
      changes: [],
      sourceBranch: "fix/123-login",
    });

    await generateMrSummary({
      mrId: "103",
      output: "console",
    });

    expect(mockedRenderTemplate).toHaveBeenCalledWith(
      "bug-fix",
      expect.objectContaining({
        ticket: "#123",
      })
    );
  });

  it("should fall back to general template for invalid branches", async () => {
    mockedGetMergeRequestChanges.mockResolvedValue({
      changes: [],
      sourceBranch: "chore/update-readme",
    });

    await generateMrSummary({
      mrId: "104",
      output: "console",
    });

    expect(mockedRenderTemplate).toHaveBeenCalledWith(
      "general",
      expect.objectContaining({
        ticket: "#104",
      })
    );
  });

  it("should write rendered output to file when output mode is file", async () => {
    mockedGetMergeRequestChanges.mockResolvedValue({
      changes: [],
      sourceBranch: "fix/123-login",
    });

    await generateMrSummary({
      mrId: "105",
      output: "file",
    });

    expect(mockedWriteFile).toHaveBeenCalledWith(
      "mr-summary-105.md",
      "Rendered summary"
    );
  });

  it("should post rendered output to gitlab when output mode is post", async () => {
    mockedGetMergeRequestChanges.mockResolvedValue({
      changes: [],
      sourceBranch: "fix/123-login",
    });

    await generateMrSummary({
      mrId: "106",
      output: "post",
    });

    expect(mockedUpdateMergeRequestDescription).toHaveBeenCalledWith(
      "106",
      "Rendered summary"
    );
  });
});
