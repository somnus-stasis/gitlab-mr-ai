import fs from "fs/promises";
import path from "path";
import Mustache from "mustache";
import { Env } from "../config/env";

export async function renderTemplate(
  templateName: string,
  context: Record<string, any>
): Promise<string> {
  const templatePath = path.resolve(Env.TEMPLATE_DIR, `${templateName}.md`);
  const template = await fs.readFile(templatePath, "utf-8");
  return Mustache.render(template, context);
}
