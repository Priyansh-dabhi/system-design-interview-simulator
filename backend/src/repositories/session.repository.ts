import prisma from "../config/prisma.js";

export const createSession = async (userId: number, problem: string) => {
    const session = await prisma.interviewSession.create({
        data: {
            userId,
            problemName: problem,
        },
        select: {
            id: true,
        },
    });

    return session;
};

export const findOwnedSessionById = async (sessionId: string, userId: number) => {
    return prisma.interviewSession.findFirst({
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
        },
    });
};

export const updateOwnedSessionStage = async (sessionId: string, userId: number, stage: string) => {
    return prisma.interviewSession.updateMany({
        where: {
            id: sessionId,
            userId,
        },
        data: { stage },
    });
};

export const getHistoryForUser = async (userId: number) => {
    return prisma.interviewSession.findMany({
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
    });
};
