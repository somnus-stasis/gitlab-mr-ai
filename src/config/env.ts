import dotenv from "dotenv";

dotenv.config();

export const Env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GITLAB_TOKEN: process.env.GITLAB_TOKEN || "",
  GITLAB_API_URL: process.env.GITLAB_API_URL || "https://gitlab.com/api/v4",
  GITLAB_PROJECT_ID: process.env.GITLAB_PROJECT_ID || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-1.5-flash",
};
