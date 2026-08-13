import { summaryPrompt } from "./promptTemplates.js";
import { model } from "./model.js";
import { summarySchema } from "./summarySchema.js";

// `withStructuredOutput` makes Gemini return schema-valid JSON directly,
// replacing the fragile free-text + JsonOutputParser approach.
export const summaryChain = summaryPrompt.pipe(
    model.withStructuredOutput(summarySchema, { name: "interview_summary" })
);
