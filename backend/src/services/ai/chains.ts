import { summaryPrompt } from "./promptTemplates.js";
import { model } from "./model.js";
import { summarySchema } from "./summarySchema.js";
import { hintPrompt } from "./hintPrompt.js";
import { hintSchema } from "./hintSchema.js";

// `withStructuredOutput` makes Gemini return schema-valid JSON directly,
// replacing the fragile free-text + JsonOutputParser approach.
export const summaryChain = summaryPrompt.pipe(
    model.withStructuredOutput(summarySchema, { name: "interview_summary" })
);

export const hintChain = hintPrompt.pipe(
    model.withStructuredOutput(hintSchema, { name: "interview_hint" })
);
