export type ParsedBranch = {
  type: string;
  ticket: string | null;
};

/**
 * Parse branch name into type and ticket ID.
 * Examples:
 * - feat/PL-123-dashboard -> { type: "feat", ticket: "PL-123" }
 * - fix/927-login-issue -> { type: "fix", ticket: "927" }
 */
export function parseBranch(branchName: string): ParsedBranch {
  const match = branchName.match(/^(\w+)[\/\-](PL-\d+|\d+)/);
  const type = match?.[1] ?? "other";
  const ticket = match?.[2] ?? null;
  return { type, ticket };
}
