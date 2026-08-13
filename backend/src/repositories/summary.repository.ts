import prisma from "../config/prisma.js";
import { withDbErrorHandling } from "../utils/prisma-error-mapper.js";
import type { InterviewSummaryResult } from "../services/ai/summarySchema.js";

export const saveSummary = async (
    sessionId: string,
    userId: number,
    result: InterviewSummaryResult
) => {
    await withDbErrorHandling(() => prisma.$transaction(async (tx) => {
        const ownedSession = await tx.interviewSession.findFirst({
            where: {
                id: sessionId,
                userId,
            },
            select: {
                id: true,
            },
        });

        if (!ownedSession) {
            throw new Error("SESSION_NOT_FOUND");
        }

        await tx.interviewSummary.create({
            data: {
                sessionId,
                // Keep the original three lists as JSON strings for back-compat.
                strengths: JSON.stringify(result.strengths),
                missedTopics: JSON.stringify(result.missed_topics),
                suggestions: JSON.stringify(result.suggestions),
                // Rich fields.
                overallScore: result.overall_score,
                dimensionScores: result.dimension_scores,
                topicCoverage: result.topic_coverage,
                studyPlan: result.study_plan,
                idealAnswer: result.ideal_answer,
            },
        });

        await tx.interviewSession.update({
            where: { id: sessionId },
            data: { status: "completed", endedAt: new Date() },
        });
    }));
};
