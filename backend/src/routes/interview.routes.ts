import { start_session, interview_chat, interview_summary, interview_history, interview_hint, get_session_detail, delete_session, get_interview_quota } from "../controllers/interview.controller.js"
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { startSessionSchema } from "../validation/interview.validation.js";

const router = Router();

router.get("/quota", authenticate, get_interview_quota);
router.get("/history", authenticate, interview_history);
router.get("/session/:id", authenticate, get_session_detail);
router.delete("/session/:id", authenticate, delete_session);
router.post("/start_session", authenticate, validateBody(startSessionSchema), start_session);
router.post("/chat", authenticate, interview_chat);
router.post("/summary", authenticate, interview_summary);
router.post("/hint", authenticate, interview_hint);

export default router
