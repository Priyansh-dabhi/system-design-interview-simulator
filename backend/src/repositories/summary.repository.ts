import prisma from "../config/prisma.js";
import { withDbErrorHandling } from "../utils/prisma-error-mapper.js";

export const saveSummary = async (
    sessionId: string,
    userId: number,
    strengths: string[],
    missedTopics: string[],
    suggestions: string[]
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
                strengths: JSON.stringify(strengths),
                missedTopics: JSON.stringify(missedTopics),
                suggestions: JSON.stringify(suggestions),
            },
        });

        await tx.interviewSession.update({
            where: { id: sessionId },
            data: { status: "completed" },
        });
    }));
};
