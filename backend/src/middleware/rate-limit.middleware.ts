import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware.js";

// Helper to disable rate limiting during automated tests (like Jest)
const isTestEnv = process.env.NODE_ENV === "test";

// If in test env, return a dummy middleware that does nothing.
// Otherwise, return the configured express-rate-limit middleware.
const createLimiter = (options: any) => {
    if (isTestEnv) {
        return (req: Request, res: Response, next: NextFunction) => next();
    }
    return rateLimit(options);
};

// Custom error response matching our AppError structure
const rateLimitErrorHandler = (req: Request, res: Response) => {
    res.status(429).json({
        message: "Too many requests, please try again later",
        code: "RATE_LIMIT_EXCEEDED"
    });
};

/**
 * 1. Strict Auth Limiter (Login / Register)
 * Prevents brute force attacks and credential stuffing
 * Limit: 10 requests per 15 minutes per IP
 */
export const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: rateLimitErrorHandler,
    // Using default keyGenerator for IP
});

/**
 * 2. Chat API Limiter
 * Protects strict Gemini free tier quotas (15 RPM / 1M TPM / 1500 RPD)
 * Limit: 30 requests per 1 minute per authenticated User ID
 */
export const chatLimiter = createLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitErrorHandler,
    keyGenerator: (req: Request) => {
        // We typecast to AuthRequest to access the user object attached by auth.middleware
        const authReq = req as AuthRequest;
        if (authReq.user) return authReq.user.userId.toString();
        // Use the ipKeyGenerator helper to properly handle IPv6 addresses
        return ipKeyGenerator(req.ip ?? "");
    }
});

/**
 * 3. General API Limiter
 * Broad protection for all other API endpoints
 * Limit: 100 requests per 1 minute per IP
 */
export const generalLimiter = createLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: rateLimitErrorHandler,
    // Using default keyGenerator for IP
});
