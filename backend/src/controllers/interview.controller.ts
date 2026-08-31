import { Request, Response } from "express";
import { generateSummary, generateHint } from "../services/ai/ai.service.js";
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

export const scoreFromOverall = (overall: number): "good" | "average" | "needs_improvement" => {
    if (overall >= 75) {
        return "good";
    }

    if (overall >= 50) {
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
    const { problem, durationMinutes, difficultyLevel } = req.body;
    const userId = req.user!.userId;
    const session = await sessionRepo.createSession(userId, problem, durationMinutes, difficultyLevel);

    const { response: openingQuestion, stage } = await orchestrateResponse(
        session.id,
        problem,
        "",
        0,
        difficultyLevel ?? "mid"
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
        messageCount,
        ownedSession.difficultyLevel
    );

    await messageRepo.saveMessage(sessionId, req.user.userId, "ai", aiResponse);
    await sessionRepo.updateOwnedSessionStage(sessionId, req.user.userId, stage);

    res.json({ message: aiResponse, stage });
};

export const interview_hint = async (req: AuthRequest, res: Response) => {
    const { sessionId } = req.body;
    const ownedSession = await getOwnedSessionOrRespond(req, res, sessionId);

    if (!ownedSession || !req.user) {
        return;
    }

    const conversation = await messageRepo.getConversationForOwnedSession(sessionId, req.user.userId);
    const problem = ownedSession.problemName;

    const { hint } = await generateHint(
        problem,
        conversation,
        ownedSession.difficultyLevel,
        ownedSession.stage
    );

    await sessionRepo.incrementHintCount(sessionId, req.user.userId);

    // Return the updated hint count (current + 1)
    res.json({ hint, hintCount: ownedSession.hintCount + 1 });
};

export const interview_summary = async (req: AuthRequest, res: Response) => {
    const { sessionId, problem } = req.body;
    const ownedSession = await getOwnedSessionOrRespond(req, res, sessionId);

    if (!ownedSession || !req.user) {
        return;
    }

    const conversation = await messageRepo.getConversationForOwnedSession(sessionId, req.user.userId);
    const messageCount = await messageRepo.getMessageCountForOwnedSession(sessionId, req.user.userId);
    const userMessageCount = await messageRepo.getUserMessageCountForOwnedSession(sessionId, req.user.userId);

    if (userMessageCount === 0) {
        await sessionRepo.deleteSession(sessionId);
        return res.json({ status: "cancelled", message: "Session cancelled due to inactivity" });
    }

    const result = await generateSummary(problem ?? ownedSession.problemName, conversation, {
        difficulty: ownedSession.difficultyLevel,
        stage: ownedSession.stage,
        durationMinutes: ownedSession.durationMinutes,
        messageCount,
    });

    await summaryRepo.saveSummary(sessionId, req.user.userId, result);

    let durationSeconds = Math.max(
        0,
        Math.floor((Date.now() - new Date(ownedSession.createdAt).getTime()) / 1000)
    );

    if (ownedSession.durationMinutes) {
        durationSeconds = Math.min(durationSeconds, ownedSession.durationMinutes * 60);
    }

    res.json({ ...result, durationSeconds });
};

export const interview_history = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized", code: "UNAUTHORIZED" });
    }

    const sessions = await sessionRepo.getHistoryForUser(userId);
    const completedSessions = sessions.filter(session => session.status === "completed");

    const history = completedSessions.map((session) => {
        const strengths = parseSummaryList(session.summary?.strengths);
        const missedTopics = parseSummaryList(session.summary?.missedTopics);
        const suggestions = parseSummaryList(session.summary?.suggestions);
        const overallScore = session.summary?.overallScore ?? null;

        // Prefer the stored 0-100 score; fall back to the legacy heuristic for
        // summaries created before rich scoring existed.
        const score = session.summary
            ? (typeof overallScore === "number"
                ? scoreFromOverall(overallScore)
                : getScore(missedTopics.length))
            : "average";

        return {
            id: session.id,
            topic: session.problemName,
            status: session.status,
            stage: session.stage,
            date: session.createdAt.toISOString(),
            messageCount: session.messages.length,
            overallScore,
            score,
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

    // --- Phase 2C Analytics ---
    
    // 1. Score Over Time (last 20 completed interviews with a score)
    const scoredInterviews = completed
        .filter(item => typeof item.overallScore === 'number')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const scoreOverTime = scoredInterviews.slice(-20).map(item => ({
        date: item.date,
        score: item.overallScore as number,
    }));

    // 2. Topic Mastery (avg score per topic)
    const topicMasteryMap = scoredInterviews.reduce<Record<string, { sum: number, count: number }>>((acc, item) => {
        if (!acc[item.topic]) {
            acc[item.topic] = { sum: 0, count: 0 };
        }
        acc[item.topic].sum += item.overallScore as number;
        acc[item.topic].count += 1;
        return acc;
    }, {});

    const topicMastery = Object.entries(topicMasteryMap).map(([topic, stats]) => ({
        topic,
        avgScore: Math.round(stats.sum / stats.count),
        count: stats.count
    })).sort((a, b) => b.avgScore - a.avgScore);

    // 3. Streaks (score >= 50)
    let currentStreak = 0;
    let bestStreak = 0;
    
    for (const session of scoredInterviews) {
        if (session.overallScore! >= 50) {
            currentStreak += 1;
            bestStreak = Math.max(bestStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
    }

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
            scoreOverTime,
            topicMastery,
            currentStreak,
            bestStreak,
        },
    });
};
