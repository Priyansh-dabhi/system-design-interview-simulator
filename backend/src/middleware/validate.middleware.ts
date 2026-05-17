import { NextFunction, Request, Response } from "express";
import { ZodTypeAny } from "zod";

const formatPath = (path: PropertyKey[]) => {
    if (path.length === 0) {
        return "body";
    }

    return path
        .filter((segment): segment is string | number => typeof segment === "string" || typeof segment === "number")
        .join(".");
};

export const validateBody = (schema: ZodTypeAny) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                message: "Validation failed",
                errors: parsed.error.issues.map((issue) => ({
                    field: formatPath(issue.path),
                    message: issue.message,
                })),
            });
        }

        req.body = parsed.data;
        next();
    };
};
