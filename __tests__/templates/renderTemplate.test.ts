import { renderTemplate } from "../../src/templates/render.service";

jest.mock("fs/promises", () => ({
  readFile: jest.fn(() => Promise.resolve("Hello {{name}}!")),
}));

describe("renderTemplate", () => {
  it("should render template with given context", async () => {
    const result = await renderTemplate("dummy", { name: "Zero" });
    expect(result).toBe("Hello Zero!");
  });
});
