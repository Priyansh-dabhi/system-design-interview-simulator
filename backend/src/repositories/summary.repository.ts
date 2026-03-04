import prisma from "../config/prisma.js";

export const saveSummary = async (
    sessionId: string,
    strengths: string[],
    missedTopics: string[],
    suggestions: string[]
) => {
    await prisma.$transaction([
        prisma.interviewSummary.create({
            data: {
                sessionId,
                strengths: JSON.stringify(strengths),
                missedTopics: JSON.stringify(missedTopics),
                suggestions: JSON.stringify(suggestions),
            },
        }),

        prisma.interviewSession.update({
            where: { id: sessionId },
            data: { status: "completed" },
        }),
    ]);
};