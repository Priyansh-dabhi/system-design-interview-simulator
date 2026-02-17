import { interviewerPrompt, summaryPrompt } from "./promptTemplates.js";
import { summaryParser } from "./parser.js";
import { model } from "./model.js";

export const interviewChain = interviewerPrompt.pipe(model);

export const summaryChain = summaryPrompt
.pipe(model)
.pipe(summaryParser);