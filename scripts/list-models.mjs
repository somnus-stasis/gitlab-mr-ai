import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
  console.error(
    "Missing API key. Set GEMINI_API_KEY or GOOGLE_API_KEY before listing models."
  );
  process.exit(1);
}

const pageSize = Number(process.env.GENAI_LIST_PAGE_SIZE || "20");
const queryBase = process.env.GENAI_QUERY_BASE !== "false";

async function main() {
  const ai = new GoogleGenAI({ apiKey });
  const pager = await ai.models.list({
    config: {
      pageSize,
      queryBase,
    },
  });

  for await (const model of pager) {
    console.log(
      JSON.stringify(
        {
          name: model.name,
          displayName: model.displayName,
          description: model.description,
          versionState: model.versionState,
          modelStage: model.modelStatus?.modelStage,
        },
        null,
        2
      )
    );
  }
}

main().catch((error) => {
  console.error("Failed to list Gemini models.");
  console.error(error);
  process.exit(1);
});
