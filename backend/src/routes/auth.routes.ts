import { Router } from "express";
import { login, logout, logoutAll, refresh, register } from "../controllers/auth.controller.js";
import {authenticate} from '../middleware/auth.middleware.js'

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.post("/logout-all", authenticate, logoutAll);

export default router
