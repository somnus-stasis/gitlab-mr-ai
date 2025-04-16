import dotenv from "dotenv";
dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
}

export const Env = {
  GEMINI_API_KEY: required("GEMINI_API_KEY"),
  GITLAB_TOKEN: required("GITLAB_TOKEN"),
  GITLAB_API_URL: process.env.GITLAB_API_URL || "https://gitlab.com/api/v4",
  GITLAB_PROJECT_ID: required("GITLAB_PROJECT_ID"),
  TEMPLATE_DIR: process.env.TEMPLATE_DIR || "templates",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
};
