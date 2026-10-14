import prisma from "../config/prisma.js";
import { withDbErrorHandling } from "../utils/prisma-error-mapper.js";

export const createSession = async (userId: number, problem: string, durationMinutes?: number, difficultyLevel?: string) => {
    return withDbErrorHandling(() => prisma.interviewSession.create({
        data: {
            userId,
            problemName: problem,
            durationMinutes: durationMinutes ?? null,
            difficultyLevel: difficultyLevel ?? "mid",
        },
        select: {
            id: true,
        },
    }));
};

export const findOwnedSessionById = async (sessionId: string, userId: number) => {
    return withDbErrorHandling(() => prisma.interviewSession.findFirst({
        where: {
            id: sessionId,
            userId,
        },
        select: {
            id: true,
            userId: true,
            problemName: true,
            status: true,
            stage: true,
            difficultyLevel: true,
            durationMinutes: true,
            hintCount: true,
            createdAt: true,
            endedAt: true,
        },
    }));
};

export const incrementHintCount = async (sessionId: string, userId: number) => {
    return withDbErrorHandling(() => prisma.interviewSession.updateMany({
        where: {
            id: sessionId,
            userId,
        },
        data: {
            hintCount: {
                increment: 1,
            },
        },
    }));
};

export const updateOwnedSessionStage = async (sessionId: string, userId: number, stage: string) => {
    return withDbErrorHandling(() => prisma.interviewSession.updateMany({
        where: {
            id: sessionId,
            userId,
        },
        data: { stage },
    }));
};

export const getHistoryForUser = async (userId: number) => {
    return withDbErrorHandling(() => prisma.interviewSession.findMany({
        where: {
            userId,
        },
        orderBy: {
            createdAt: "desc",
        },
        include: {
            summary: true,
            messages: {
                select: {
                    id: true,
                },
            },
        },
    }));
};

export const findOwnedSessionWithFullDetail = async (sessionId: string, userId: number) => {
    return withDbErrorHandling(() => prisma.interviewSession.findFirst({
        where: {
            id: sessionId,
            userId,
        },
        include: {
            summary: true,
            messages: {
                orderBy: { createdAt: "asc" },
                select: {
                    id: true,
                    role: true,
                    content: true,
                    createdAt: true,
                },
            },
        },
    }));
};

export const deleteSession = async (sessionId: string) => {
    return withDbErrorHandling(() => prisma.interviewSession.delete({
        where: {
            id: sessionId,
        },
    }));
};

export const getDailyInterviewUsage = async (userId: number, email?: string) => {
    return withDbErrorHandling(async () => {
        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(startOfDay);
        endOfDay.setUTCDate(endOfDay.getUTCDate() + 1);

        const used = await prisma.interviewSession.count({
            where: {
                userId,
                createdAt: {
                    gte: startOfDay,
                },
            },
        });

        const isReviewer = Boolean(
            process.env.REVIEWER_EMAIL &&
            email &&
            email.toLowerCase() === process.env.REVIEWER_EMAIL.toLowerCase()
        );

        let defaultLimit = 2;
        if (process.env.NODE_ENV === "test") {
            defaultLimit = 100;
        }

        const envLimit = process.env.DAILY_INTERVIEW_LIMIT
            ? parseInt(process.env.DAILY_INTERVIEW_LIMIT, 10)
            : defaultLimit;

        const limit = isReviewer ? 100 : (Number.isFinite(envLimit) && envLimit >= 0 ? envLimit : 2);
        const remaining = Math.max(0, limit - used);

        return {
            limit,
            used,
            remaining,
            resetsAt: endOfDay.toISOString(),
        };
    });
};

