import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors.js";

export const globalErrorHandler = (
    err: unknown,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) => {
    let statusCode = 500;
    let message = "Internal server error";
    let code = "INTERNAL_SERVER_ERROR";

    // 1. Check if it's our custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        code = err.code;
    } 
    // 2. Fallback for other standard Errors
    else if (err instanceof Error) {
        message = err.message;
    }

    // Log the full error to the console for server-side debugging
    console.error(`[Error Handler] ${new Date().toISOString()} - ${code}:`, err);

    // Prepare response, omitting stack trace in production
    const errorResponse: Record<string, unknown> = {
        message,
        code,
    };

    if (process.env.NODE_ENV !== "production") {
        errorResponse.stack = err instanceof Error ? err.stack : undefined;
    }

    res.status(statusCode).json(errorResponse);
};
