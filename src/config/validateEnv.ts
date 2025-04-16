export function validateEnv(): void {
  const requiredVars = ["GEMINI_API_KEY", "GITLAB_TOKEN", "GITLAB_PROJECT_ID"];
  const missing = requiredVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`❌ Missing required .env variables: ${missing.join(", ")}`);
    process.exit(1);
  }
}
