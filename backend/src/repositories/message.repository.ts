import prisma from "../config/prisma.js";
import { withDbErrorHandling } from "../utils/prisma-error-mapper.js";

export const getConversationForOwnedSession = async (sessionId: string, userId: number) => {
    const messages = await withDbErrorHandling(() => prisma.interviewMessage.findMany({
        where: {
            sessionId,
            session: {
                userId,
            },
        },
        orderBy: { createdAt: "asc" },
        select: {
            role: true,
            content: true,
        },
    }));

    // Convert to string format for LLM (same as before)
    return messages
        .map((msg: { role: string; content: string }) => 
        `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n");
};

export const saveMessage = async (
    sessionId: string,
    userId: number,
    role: "user" | "ai",
    content: string
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

        await tx.interviewMessage.create({
            data: {
                sessionId,
                role,
                content,
            },
        });
    }));
};

export const getMessageCountForOwnedSession = async (sessionId: string, userId: number): Promise<number> => {
    return withDbErrorHandling(() => prisma.interviewMessage.count({
        where: {
            sessionId,
            session: {
                userId,
            },
        },
    }));
};
