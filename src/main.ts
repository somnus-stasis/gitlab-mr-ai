import fs from "fs/promises";
import {
  getMergeRequestChanges,
  updateMergeRequestDescription,
} from "./infrastructure/gitlab.client";
import { renderTemplate } from "./templates/render.service";
import { summarizeFromDiff } from "./core/summarize/summarizeFromDiff";
import { parseBranch } from "./core/ticket/parseBranch";
import { detectTemplate } from "./core/ticket/detectTemplate";

export async function generateMrSummary(options: {
  mrId: string;
  template?: string;
  prompt?: string;
  output: "console" | "file" | "post";
}) {
  const { mrId, output } = options;
  let template = options.template;
  let ticket = `#${mrId}`;

  const { changes, sourceBranch } = await getMergeRequestChanges(mrId);
  const promptInput = options.prompt || "summary-base.txt";
  const { description, keyChanges } = await summarizeFromDiff(
    changes,
    promptInput
  );

  if (!template) {
    const parsed = parseBranch(sourceBranch);
    const isRecognized = parsed.ticket !== null;
    template = isRecognized ? detectTemplate(parsed.type) : "general";
    if (parsed.ticket) {
      ticket = parsed.ticket.startsWith("PL-")
        ? parsed.ticket
        : `#${parsed.ticket}`;
    }
  }

  const context = {
    ticket,
    notes: `${description}\n\n**Key Changes:**\n${keyChanges}`,
    evidence: "<!-- Please attach logs or screenshots -->",
  };

  const rendered = await renderTemplate(template, context);

  if (output === "file") {
    await fs.writeFile(`mr-summary-${mrId}.md`, rendered);
    console.log(`📄 Summary written to mr-summary-${mrId}.md`);
  } else if (output === "post") {
    await updateMergeRequestDescription(mrId, rendered);
    console.log("✅ MR description successfully updated in GitLab.");
  } else {
    console.log("📄 Merge Request Summary:\n");
    console.log(rendered);
  }
}
