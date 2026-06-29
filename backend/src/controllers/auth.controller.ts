import { Request, Response } from "express";
import { registerUser, loginUser, loginWithGoogle, getAuthenticatedUser } from "../services/auth.service.js";
import {
    refreshAuthSession,
    revokeAllUserSessions,
    revokeRefreshSession,
} from "../services/refresh-token.service.js";
import { AuthRequest } from "../middleware/auth.middleware.js";

const getDeviceInfo = (req: Request) => {
    const headerDeviceInfo = req.headers["x-device-info"];
    const userAgent = req.headers["user-agent"];

    if (typeof headerDeviceInfo === "string" && headerDeviceInfo.trim()) {
        return headerDeviceInfo.trim();
    }

    if (typeof userAgent === "string" && userAgent.trim()) {
        return userAgent.trim();
    }

    return "unknown-device";
};

export const register = async (req: Request, res: Response) => {
    const { full_name, email, password } = req.body;
    const user = await registerUser(full_name, email, password, getDeviceInfo(req));
    res.status(201).json(user);
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await loginUser(email, password, getDeviceInfo(req));
    res.json(result);
};

export const googleLogin = async (req: Request, res: Response) => {
    const { firebaseIdToken } = req.body;
    const result = await loginWithGoogle(firebaseIdToken, getDeviceInfo(req));
    res.json(result);
};

export const refresh = async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ message: "Refresh token is required", code: "BAD_REQUEST" });
    }

    const refreshedSession = await refreshAuthSession(refreshToken, getDeviceInfo(req));
    return res.json(refreshedSession);
};

export const me = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized", code: "UNAUTHORIZED" });
    }

    const user = await getAuthenticatedUser(req.user.userId);
    return res.json({ user });
};

export const logout = async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;

    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized", code: "UNAUTHORIZED" });
    }

    await revokeRefreshSession(refreshToken);
    return res.status(204).send();
};

export const logoutAll = async (req: AuthRequest, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized", code: "UNAUTHORIZED" });
    }

    await revokeAllUserSessions(req.user.userId);
    return res.status(204).send();
};
