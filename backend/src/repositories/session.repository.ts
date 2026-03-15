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

export const updateStage = async (sessionId: string, stage: string) => {
    await prisma.interviewSession.update({
        where: { id: sessionId },
        data: { stage },
    });
};