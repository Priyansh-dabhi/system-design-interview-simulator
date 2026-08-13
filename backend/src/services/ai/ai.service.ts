import { summaryChain } from "./chains.js";
import { findRelevantChunks } from "../rag/retriever.service.js";
import {
    emptySummaryResult,
    InterviewSummaryResult,
} from "./summarySchema.js";

export interface GenerateSummaryContext {
    difficulty?: string;
    stage?: string;
    durationMinutes?: number | null;
    messageCount?: number;
}

export const generateSummary = async (
    problem: string,
    conversation: string,
    ctx: GenerateSummaryContext = {}
): Promise<InterviewSummaryResult> => {
    // Ground the coverage map, study plan and ideal answer in the knowledge base.
    let context = "";
    try {
        const chunks = await findRelevantChunks(problem, 5);
        context = chunks.join("\n\n");
    } catch (e) {
        console.warn("Summary retriever unavailable or error:", e);
    }

    try {
        const response = await summaryChain.invoke({
            problem,
            conversation,
            context,
            difficulty: ctx.difficulty ?? "mid",
            stage: ctx.stage ?? "evaluation",
            durationMinutes: ctx.durationMinutes ?? "unspecified",
            messageCount: ctx.messageCount ?? 0,
        });
        return response as InterviewSummaryResult;
    } catch (e) {
        // Graceful degradation: never fail the end-of-interview flow because the
        // model returned malformed output — return an empty (but valid) summary.
        console.error("Structured summary generation failed:", e);
        return emptySummaryResult();
    }
};
