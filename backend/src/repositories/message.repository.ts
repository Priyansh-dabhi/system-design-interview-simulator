import prisma from "../config/prisma.js";

export const getConversation = async (sessionId: string) => {
    const messages = await prisma.interviewMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: "asc" },
        select: {
            role: true,
            content: true,
        },
    });

    // Convert to string format for LLM (same as before)
    return messages
        .map((msg: { role: string; content: string }) => 
        `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n");
};

export const saveMessage = async (
    sessionId: string,
    role: "user" | "ai",
    content: string
) => {
    await prisma.interviewMessage.create({
        data: {
            sessionId,
            role,
            content,
        },
    });
};