import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { 
    get_learning_topics, 
    get_topic_lessons, 
    get_lesson_detail, 
    complete_lesson_and_quiz 
} from "../controllers/learning.controller.js";

const router = Router();

router.get("/topics", authenticate, get_learning_topics);
router.get("/topics/:slug/lessons", authenticate, get_topic_lessons);
router.get("/lessons/:id", authenticate, get_lesson_detail);
router.post("/lessons/:id/complete", authenticate, complete_lesson_and_quiz);

export default router;
