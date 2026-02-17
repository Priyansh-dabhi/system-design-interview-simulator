import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";

export interface AuthRequest extends Request {
    user?: { userId: number };
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
        req.user = decoded;
        console.log("AUTH HEADER:", authHeader);
        console.log("DECODED:", decoded);
        next();

    } catch {
        res.status(401).json({ message: "Invalid token" });
    }
};
