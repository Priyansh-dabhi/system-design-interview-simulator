import { start_session, interview_chat, interview_summary } from "../controllers/interview.controller.js"
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/start_session",authenticate, start_session);
router.post("/chat",authenticate, interview_chat);
router.post("/summary",authenticate, interview_summary);

export default router   