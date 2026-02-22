import { Request, Response } from "express";
import { generateFollowUp, generateSummary } from "../services/ai/ai.service.js";
import * as messageRepo from "../repositories/message.repository.js";
import * as summaryRepo from "../repositories/summary.repository.js";
import * as sessionRepo from "../repositories/session.repository.js";
import { AuthRequest } from "../middleware/auth.middleware.js";


export const start_session = async (req: AuthRequest, res: Response) => {
    try {
        const { problem } = req.body;

        const userId = req.user!.userId; // from JWT middleware
        // const userId = (req as any).user.userId;
        // Create session in DB
        const session = await sessionRepo.createSession(userId, problem);

        // Generate first AI question
        const openingQuestion = await generateFollowUp(
            problem,
            "Start the interview."
        );

        // Save AI opening message
        await messageRepo.saveMessage(session.id, "ai", openingQuestion);

        res.status(201).json({
            sessionId: session.id,
            message: openingQuestion,
        });
        console.log("check REQ.USER:", (req as any).user);

    } catch (err) {
        console.error("Start session error:", err);
        res.status(500).json({ message: "Failed to start session" });
    }
};


export const interview_chat = async (req: Request, res: Response) => {
    try {
        const { sessionId, problem, message } = req.body;

        // 1️⃣ Save user message
        await messageRepo.saveMessage(sessionId, "user", message);

        // 2️⃣ Fetch conversation from DB (better than trusting frontend)
        const conversation = await messageRepo.getConversation(sessionId);

        // 3️⃣ Generate AI follow-up
        const aiResponse = await generateFollowUp(problem, conversation);

        // 4️⃣ Save AI message
        await messageRepo.saveMessage(sessionId, "ai", aiResponse);

        res.json({ message: aiResponse });

    } catch (err) {
        console.error("AI response error:", err);
        res.status(500).json({ message: "Chat failed" });
    }
};


export const interview_summary = async (req: Request, res: Response) => {
    try {
        const { sessionId, problem } = req.body;

        // 1️⃣ Get full conversation from DB
        const conversation = await messageRepo.getConversation(sessionId);

        // 2️⃣ Generate summary (JSON parsed already)
        const result = await generateSummary(problem, conversation);

        // 3️⃣ Save summary in DB
        await summaryRepo.saveSummary(
            sessionId,
            result.strengths,
            result.missed_topics,
            result.suggestions
        );

        res.json(result);

    } catch (err) {
        console.error("Summary error:", err);
        res.status(500).json({ message: "Summary generation failed" });
    }
};
