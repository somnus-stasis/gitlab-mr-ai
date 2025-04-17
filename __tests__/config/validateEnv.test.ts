import { validateEnv } from "../../src/config/validateEnv";

describe("validateEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should exit if a required env is missing", () => {
    delete process.env.GEMINI_API_KEY;

    const spyExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("exit called");
    });

    expect(() => validateEnv()).toThrow("exit called");

    spyExit.mockRestore();
  });

  it("should pass if all required env vars exist", () => {
    process.env.GEMINI_API_KEY = "dummy";
    process.env.GITLAB_TOKEN = "dummy";
    process.env.GITLAB_PROJECT_ID = "123";

    expect(() => validateEnv()).not.toThrow();
  });
});
