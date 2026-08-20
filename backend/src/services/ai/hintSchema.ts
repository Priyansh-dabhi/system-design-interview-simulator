import { z } from "zod";

export const hintSchema = z.object({
    hint: z.string().describe("A short, helpful hint or nudge to guide the candidate."),
});

export type HintResult = z.infer<typeof hintSchema>;
