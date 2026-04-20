import { parseBranch } from "../../../src/core/ticket/parseBranch";

describe("parseBranch", () => {
  it("should extract type and ticket from branch name with numeric format", () => {
    const result = parseBranch("fix/927-login-error");
    expect(result).toEqual({ type: "fix", ticket: "927" });
  });

  it("should extract type and ticket from branch name with default legacy prefix", () => {
    const result = parseBranch("feat/PL-123-dashboard");
    expect(result).toEqual({ type: "feat", ticket: "PL-123" });
  });

  it("should extract type and ticket from branch name with a custom prefix", () => {
    const result = parseBranch("feat/OPS-123-dashboard", ["OPS"]);
    expect(result).toEqual({ type: "feat", ticket: "OPS-123" });
  });

  it("should extract type and ticket from branch name with multiple allowed prefixes", () => {
    const result = parseBranch("feat/WEB-123-dashboard", ["OPS", "WEB"]);
    expect(result).toEqual({ type: "feat", ticket: "WEB-123" });
  });

  it("should extract type and ticket from branch types containing hyphens", () => {
    const result = parseBranch("hot-fix/123-login-error");
    expect(result).toEqual({ type: "hot-fix", ticket: "123" });
  });

  it("should return null ticket if prefixed format is not allowed", () => {
    const result = parseBranch("feat/OPS-123-dashboard", ["PL"]);
    expect(result).toEqual({ type: "other", ticket: null });
  });

  it("should return null ticket if format is invalid", () => {
    const result = parseBranch("hotfix/this-is-invalid");
    expect(result).toEqual({ type: "other", ticket: null });
  });
});
