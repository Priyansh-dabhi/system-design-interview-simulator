import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service.js";
import {
    AuthServiceError,
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

const getAuthErrorMessage = (error: unknown) => {
    if (error instanceof AuthServiceError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return "Authentication failed";
};

export const register = async (req: Request, res: Response) => {
    try {
        const {full_name, email, password } = req.body;
        const user = await registerUser(full_name, email, password, getDeviceInfo(req));
        res.status(201).json(user);
    } catch (err: any) {
        console.log("Registration error: ", err)
        res.status(400).json({ message: err.message || "Registration failed" });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password, getDeviceInfo(req));
        res.json(result);
    } catch (err) {
        console.log("Login error: ",err)
        res.status(401).json({ message: "Invalid credentials" });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token is required" });
        }

        const refreshedSession = await refreshAuthSession(refreshToken, getDeviceInfo(req));
        return res.json(refreshedSession);
    } catch (error) {
        const message = getAuthErrorMessage(error);
        const statusCode = error instanceof AuthServiceError ? error.statusCode : 401;
        return res.status(statusCode).json({ message });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            await revokeRefreshSession(refreshToken);
        }

        return res.status(204).send();
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(204).send();
    }
};

export const logoutAll = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await revokeAllUserSessions(req.user.userId);
        return res.status(204).send();
    } catch (error) {
        console.error("Logout-all error:", error);
        return res.status(500).json({ message: "Failed to revoke sessions" });
    }
};
