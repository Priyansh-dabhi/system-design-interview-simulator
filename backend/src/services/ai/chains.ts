import { summaryPrompt } from "./promptTemplates.js";
import { summaryParser } from "./parser.js";
import { model } from "./model.js";

export const summaryChain = summaryPrompt
.pipe(model)
.pipe(summaryParser);