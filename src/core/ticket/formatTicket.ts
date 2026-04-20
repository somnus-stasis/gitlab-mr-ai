/**
 * Formats a parsed ticket for display in templates.
 * Numeric tickets are rendered as Git-style issue references.
 */
export function formatTicket(ticket: string): string {
  return /^\d+$/.test(ticket) ? `#${ticket}` : ticket;
}
