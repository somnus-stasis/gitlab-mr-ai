/**
 * Determine which template to use based on branch type.
 * - "fix" → "bug-fix"
 * - others → "standard"
 */
export function detectTemplate(type: string): "bug-fix" | "standard" {
  return type === "fix" ? "bug-fix" : "standard";
}
