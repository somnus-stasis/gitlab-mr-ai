jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

describe("Env", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should default GEMINI_MODEL to gemini-2.5-flash when env is empty", async () => {
    delete process.env.GEMINI_MODEL;

    const { Env } = await import("../../src/config/env");

    expect(Env.GEMINI_MODEL).toBe("gemini-2.5-flash");
  });

  it("should keep GEMINI_MODEL override from the environment", async () => {
    process.env.GEMINI_MODEL = "gemini-2.0-flash";

    const { Env } = await import("../../src/config/env");

    expect(Env.GEMINI_MODEL).toBe("gemini-2.0-flash");
  });

  it("should expose an empty Gemini API version when env is not set", async () => {
    delete process.env.MR_AI_GENAI_API_VERSION;

    const { Env } = await import("../../src/config/env");

    expect(Env.MR_AI_GENAI_API_VERSION).toBe("");
  });

  it("should keep MR_AI_GENAI_API_VERSION override from the environment", async () => {
    process.env.MR_AI_GENAI_API_VERSION = "v1";

    const { Env } = await import("../../src/config/env");

    expect(Env.MR_AI_GENAI_API_VERSION).toBe("v1");
  });
});
