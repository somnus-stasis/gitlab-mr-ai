import { parseBranch } from "../../../src/core/ticket/parseBranch";

describe("parseBranch", () => {
  it("should extract type and ticket from branch name with Trello format", () => {
    const result = parseBranch("fix/927-login-error");
    expect(result).toEqual({ type: "fix", ticket: "927" });
  });

  it("should extract type and ticket from branch name with Plane format", () => {
    const result = parseBranch("feat/PL-123-dashboard");
    expect(result).toEqual({ type: "feat", ticket: "PL-123" });
  });

  it("should return null ticket if format is invalid", () => {
    const result = parseBranch("hotfix/this-is-invalid");
    expect(result).toEqual({ type: "other", ticket: null });
  });
});
