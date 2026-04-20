import dotenv from "dotenv";

dotenv.config();

export const DEFAULT_TICKET_PREFIXES = ["PL"] as const;

/**
 * Normalizes the configured ticket prefixes and falls back to the legacy
 * default when the env var is missing or empty.
 */
function parseTicketPrefixes(input: string | undefined): string[] {
  const prefixes = input
    ?.split(",")
    .map((prefix) => prefix.trim().toUpperCase())
    .filter(Boolean);
  const uniquePrefixes = prefixes ? [...new Set(prefixes)] : undefined;

  return uniquePrefixes && uniquePrefixes.length > 0
    ? uniquePrefixes
    : [...DEFAULT_TICKET_PREFIXES];
}

export const Env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  GITLAB_TOKEN: process.env.GITLAB_TOKEN || "",
  GITLAB_API_URL: process.env.GITLAB_API_URL || "https://gitlab.com/api/v4",
  GITLAB_PROJECT_ID: process.env.GITLAB_PROJECT_ID || "",
  GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  MR_AI_GENAI_API_VERSION: process.env.MR_AI_GENAI_API_VERSION || "",
  MR_AI_TICKET_PREFIXES: parseTicketPrefixes(process.env.MR_AI_TICKET_PREFIXES),
};
