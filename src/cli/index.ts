#!/usr/bin/env node
import { Command } from "commander";
import dotenv from "dotenv";
import { generateMrSummary } from "../main";

dotenv.config();

const program = new Command();

program
  .name("mr-ai")
  .description("AI-powered GitLab Merge Request summarizer")
  .version("0.1.0");

program
  .command("generate")
  .description("Generate summary for a merge request")
  .option("-m, --mr <id>", "Merge request ID")
  .option("-t, --template <name>", "Template name (standard | bug-fix)")
  .option(
    "-o, --output <target>",
    "Output mode: console | file | post",
    "console"
  )
  .action(async (options) => {
    if (!options.mr) {
      console.error("❌ Missing required --mr <id> argument.");
      process.exit(1);
    }

    await generateMrSummary({
      mrId: options.mr,
      template: options.template,
      output: options.output,
    });
  });

program.parse(process.argv);
