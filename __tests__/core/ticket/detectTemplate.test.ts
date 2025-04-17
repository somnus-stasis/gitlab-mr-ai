import { detectTemplate } from "../../../src/core/ticket/detectTemplate";

describe("detectTemplate", () => {
  it("should return 'bug-fix' for fix type", () => {
    expect(detectTemplate("fix")).toBe("bug-fix");
  });

  it("should return 'standard' for feat type", () => {
    expect(detectTemplate("feat")).toBe("standard");
  });

  it("should return 'standard' for unknown type", () => {
    expect(detectTemplate("chore")).toBe("standard");
  });
});
