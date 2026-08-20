import { start_session, interview_chat, interview_summary, interview_history, interview_hint } from "../controllers/interview.controller.js"
import { Router } from "express"
import { authenticate } from "../middleware/auth.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { startSessionSchema } from "../validation/interview.validation.js";

const router = Router();

router.get("/history",authenticate, interview_history);
router.post("/start_session",authenticate, validateBody(startSessionSchema), start_session);
router.post("/chat",authenticate, interview_chat);
router.post("/summary",authenticate, interview_summary);
router.post("/hint",authenticate, interview_hint);

export default router
