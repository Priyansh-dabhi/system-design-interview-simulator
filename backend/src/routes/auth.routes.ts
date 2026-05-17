import { Router } from "express";
import { googleLogin, login, logout, logoutAll, me, refresh, register } from "../controllers/auth.controller.js";
import {authenticate} from '../middleware/auth.middleware.js'
import { validateBody } from "../middleware/validate.middleware.js";
import { googleLoginSchema, loginSchema, logoutSchema, refreshSchema, registerSchema } from "../validation/auth.validation.js";

const router = Router();

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);
router.post("/google", validateBody(googleLoginSchema), googleLogin);
router.post("/refresh", validateBody(refreshSchema), refresh);
router.get("/me", authenticate, me);
router.post("/logout", authenticate, validateBody(logoutSchema), logout);
router.post("/logout-all", authenticate, logoutAll);

export default router
