import prisma from "../config/prisma.js";
import { withDbErrorHandling } from "../utils/prisma-error-mapper.js";

export const createSession = async (userId: number, problem: string, durationMinutes?: number) => {
    return withDbErrorHandling(() => prisma.interviewSession.create({
        data: {
            userId,
            problemName: problem,
            durationMinutes: durationMinutes ?? null,
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
            createdAt: true,
            endedAt: true,
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
