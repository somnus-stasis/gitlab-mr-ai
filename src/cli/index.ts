#!/usr/bin/env node
import { Command } from "commander";
import { validateEnv } from "../config/validateEnv";
import { generateMrSummary } from "../main";

validateEnv();

const program = new Command();

program
  .name("mr-ai")
  .description("AI-powered GitLab Merge Request summarizer")
  .version("1.0.0");

program
  .command("generate")
  .description("Generate summary for a merge request")
  .option("-m, --mr <id>", "Merge request ID")
  .option(
    "-t, --template <name or path>",
    "Template to use (e.g. standard, bug-fix, general, or ./my.md)"
  )
  .option("-p, --prompt <path>", "Path to custom prompt file")
  .option(
    "-o, --output <target>",
    "Output mode: console | file | post",
    "console"
  )
  .action(async (options) => {
    try {
      if (!options.mr) {
        console.error("❌ Missing required --mr <id>");
        process.exit(1);
      }

      console.log("Generating summary for MR ID:", options.mr);

      await generateMrSummary({
        mrId: options.mr,
        template: options.template,
        prompt: options.prompt,
        output: options.output,
      });
    } catch (error: any) {
      console.error("❌ Unhandled error during MR summary generation:");
      console.error(error.message || error);
      process.exit(1);
    }
  });

program.parse(process.argv);
