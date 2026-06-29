import { Request, Response } from "express";
import { generateSummary } from "../services/ai/ai.service.js";
import { orchestrateResponse } from "../services/ai/interviewOrchestrator.js";
import * as messageRepo from "../repositories/message.repository.js";
import * as summaryRepo from "../repositories/summary.repository.js";
import * as sessionRepo from "../repositories/session.repository.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

export const parseSummaryList = (value: string | null | undefined): string[] => {
    if (!value) {
        return [];
    }

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
        return [];
    }
};

export const getScore = (missedTopicsCount: number): "good" | "average" | "needs_improvement" => {
    if (missedTopicsCount <= 1) {
        return "good";
    }

    if (missedTopicsCount <= 3) {
        return "average";
    }

    return "needs_improvement";
};

const getOwnedSessionOrRespond = async (
    req: AuthRequest,
    res: Response,
    sessionId: string
) => {
    const userId = req.user?.userId;

    if (!userId) {
        res.status(401).json({ message: "Unauthorized", code: "UNAUTHORIZED" });
        return null;
    }

    const session = await sessionRepo.findOwnedSessionById(sessionId, userId);

    if (!session) {
        res.status(404).json({ message: "Interview session not found", code: "NOT_FOUND" });
        return null;
    }

    return session;
};

export const start_session = async (req: AuthRequest, res: Response) => {
    const { problem } = req.body;
    const userId = req.user!.userId;
    const session = await sessionRepo.createSession(userId, problem);

    const { response: openingQuestion, stage } = await orchestrateResponse(
        session.id,
        problem,
        "",
        0
    );

    await messageRepo.saveMessage(session.id, userId, "ai", openingQuestion);
    await sessionRepo.updateOwnedSessionStage(session.id, userId, stage);

    res.status(201).json({
        sessionId: session.id,
        message: openingQuestion,
        stage,
    });
};

export const interview_chat = async (req: AuthRequest, res: Response) => {
    const { sessionId, problem, message } = req.body;
    const ownedSession = await getOwnedSessionOrRespond(req, res, sessionId);

    if (!ownedSession || !req.user) {
        return;
    }

    await messageRepo.saveMessage(sessionId, req.user.userId, "user", message);
    const conversation = await messageRepo.getConversationForOwnedSession(sessionId, req.user.userId);
    const messageCount = await messageRepo.getMessageCountForOwnedSession(sessionId, req.user.userId);

    const { response: aiResponse, stage } = await orchestrateResponse(
        sessionId,
        problem ?? ownedSession.problemName,
        conversation,
        messageCount
    );

    await messageRepo.saveMessage(sessionId, req.user.userId, "ai", aiResponse);
    await sessionRepo.updateOwnedSessionStage(sessionId, req.user.userId, stage);

    res.json({ message: aiResponse, stage });
};

export const interview_summary = async (req: AuthRequest, res: Response) => {
    const { sessionId, problem } = req.body;
    const ownedSession = await getOwnedSessionOrRespond(req, res, sessionId);

    if (!ownedSession || !req.user) {
        return;
    }

    const conversation = await messageRepo.getConversationForOwnedSession(sessionId, req.user.userId);
    const result = await generateSummary(problem ?? ownedSession.problemName, conversation);

    await summaryRepo.saveSummary(
        sessionId,
        req.user.userId,
        result.strengths,
        result.missed_topics,
        result.suggestions
    );

    res.json(result);
};

export const interview_history = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized", code: "UNAUTHORIZED" });
    }

    const sessions = await sessionRepo.getHistoryForUser(userId);
    const history = sessions.map((session) => {
        const strengths = parseSummaryList(session.summary?.strengths);
        const missedTopics = parseSummaryList(session.summary?.missedTopics);
        const suggestions = parseSummaryList(session.summary?.suggestions);

        return {
            id: session.id,
            topic: session.problemName,
            status: session.status,
            stage: session.stage,
            date: session.createdAt.toISOString(),
            messageCount: session.messages.length,
            score: session.summary ? getScore(missedTopics.length) : "average",
            summary: {
                strengths,
                missed_topics: missedTopics,
                suggestions,
            },
        };
    });

    const completed = history.filter((item) => item.status === "completed");
    const strong = completed.filter((item) => item.score === "good").length;
    const average = completed.filter((item) => item.score === "average").length;
    const needsImprovement = completed.filter((item) => item.score === "needs_improvement").length;
    const topicCounts = completed.reduce<Record<string, number>>((acc, item) => {
        acc[item.topic] = (acc[item.topic] ?? 0) + 1;
        return acc;
    }, {});
    const strongestDomain = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "Not enough data";

    return res.json({
        history,
        stats: {
            total: history.length,
            completed: completed.length,
            active: history.length - completed.length,
            strong,
            average,
            needsImprovement,
            strongestDomain,
        },
    });
};
