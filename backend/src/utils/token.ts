import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_EXPIRES_IN, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_TTL_DAYS } from "../config/auth.js";

type AccessTokenPayload = {
    userId: number;
    email: string;
};

export const signAccessToken = (payload: AccessTokenPayload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
};

export const verifyAccessToken = (token: string) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET) as AccessTokenPayload;
};

export const generateRefreshToken = () => {
    return crypto.randomBytes(48).toString("hex");
};

export const hashRefreshToken = (token: string) => {
    return crypto.createHash("sha256").update(token).digest("hex");
};

export const getRefreshTokenExpiryDate = () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);
    return expiresAt;
};
