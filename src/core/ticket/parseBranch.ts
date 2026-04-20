import { Env } from "../../config/env";

export type ParsedBranch = {
  type: string;
  ticket: string | null;
};

/**
 * Parse branch name into type and ticket ID.
 * Examples:
 * - feat/PL-123-dashboard -> { type: "feat", ticket: "PL-123" }
 * - feat/OPS-123-dashboard -> { type: "feat", ticket: "OPS-123" }
 * - fix/927-login-issue -> { type: "fix", ticket: "927" }
 */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extracts the branch type and ticket token from a branch name using the
 * configured ticket prefixes plus the always-supported numeric format.
 */
export function parseBranch(
  branchName: string,
  prefixes: string[] = Env.MR_AI_TICKET_PREFIXES
): ParsedBranch {
  const prefixPattern = prefixes.map(escapeRegex).join("|");
  const ticketPattern = prefixPattern
    ? `((?:${prefixPattern})-\\d+|\\d+)`
    : "(\\d+)";
  const match = branchName.match(
    new RegExp(`^([A-Za-z][\\w-]*)[/-]${ticketPattern}`)
  );
  const type = match?.[1] ?? "other";
  const ticket = match?.[2] ?? null;
  return { type, ticket };
}
