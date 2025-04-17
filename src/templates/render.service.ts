import fs from "fs/promises";
import path from "path";
import Mustache from "mustache";

export async function renderTemplate(
  templateInput: string,
  context: Record<string, any>
): Promise<string> {
  const isPath =
    templateInput.endsWith(".md") ||
    templateInput.includes("/") ||
    templateInput.includes("\\");
  const templatePath = isPath
    ? path.resolve(templateInput)
    : path.resolve(__dirname, "../../templates", `${templateInput}.md`);

  const template = await fs.readFile(templatePath, "utf-8");
  return Mustache.render(template, context);
}
