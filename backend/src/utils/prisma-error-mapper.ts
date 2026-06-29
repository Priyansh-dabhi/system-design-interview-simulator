import { Prisma } from "@prisma/client";
import { DatabaseError } from "./errors.js";

export function mapPrismaError(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002":
                return new DatabaseError("Duplicate entry", "DB_UNIQUE_VIOLATION", 409);
            case "P2025":
                return new DatabaseError("Record not found", "DB_NOT_FOUND", 404);
            case "P2003":
                return new DatabaseError("Related record not found", "DB_FOREIGN_KEY_VIOLATION", 400);
            case "P2024":
                return new DatabaseError("Connection pool timeout", "DB_TIMEOUT", 503);
            default:
                return new DatabaseError(`Database request error: ${error.code}`, "DB_KNOWN_ERROR", 500);
        }
    }
    
    if (error instanceof Prisma.PrismaClientInitializationError) {
        return new DatabaseError("Database connection failed", "DB_CONNECTION_FAILED", 503);
    }
    
    if (error instanceof Prisma.PrismaClientRustPanicError) {
        return new DatabaseError("Critical database engine failure", "DB_UNKNOWN", 500);
    }
    
    if (error instanceof Prisma.PrismaClientValidationError) {
        return new DatabaseError("Database validation failed", "DB_VALIDATION_FAILED", 400);
    }

    // Pass through non-Prisma errors (or wrap them if preferred)
    if (error instanceof Error) {
        if (error.message === "SESSION_NOT_FOUND") {
            return new DatabaseError("Session not found", "DB_NOT_FOUND", 404);
        }
        return error;
    }

    return new DatabaseError("Unknown database error occurred", "DB_UNKNOWN", 500);
}

export async function withDbErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        throw mapPrismaError(error);
    }
}
