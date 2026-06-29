import { Prisma } from "@prisma/client";
import { mapPrismaError, withDbErrorHandling } from "../../utils/prisma-error-mapper.js";
import { DatabaseError, AppError } from "../../utils/errors.js";
import { globalErrorHandler } from "../../middleware/error.middleware.js";
import { Request, Response, NextFunction } from "express";

describe("Error Handling", () => {
    describe("mapPrismaError", () => {
        it("should map P2002 to unique violation", () => {
            const error = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
                code: "P2002",
                clientVersion: "7.4.2",
            });
            const mapped = mapPrismaError(error) as DatabaseError;
            expect(mapped).toBeInstanceOf(DatabaseError);
            expect(mapped.code).toBe("DB_UNIQUE_VIOLATION");
            expect(mapped.statusCode).toBe(409);
        });

        it("should map P2025 to not found", () => {
            const error = new Prisma.PrismaClientKnownRequestError("Record to update not found", {
                code: "P2025",
                clientVersion: "7.4.2",
            });
            const mapped = mapPrismaError(error) as DatabaseError;
            expect(mapped).toBeInstanceOf(DatabaseError);
            expect(mapped.code).toBe("DB_NOT_FOUND");
            expect(mapped.statusCode).toBe(404);
        });

        it("should map initialization error to connection failed", () => {
            const error = new Prisma.PrismaClientInitializationError("Could not reach DB", "7.4.2");
            const mapped = mapPrismaError(error) as DatabaseError;
            expect(mapped).toBeInstanceOf(DatabaseError);
            expect(mapped.code).toBe("DB_CONNECTION_FAILED");
            expect(mapped.statusCode).toBe(503);
        });
    });

    describe("withDbErrorHandling", () => {
        it("should return the result if operation is successful", async () => {
            const result = await withDbErrorHandling(async () => "success");
            expect(result).toBe("success");
        });

        it("should throw mapped DatabaseError if operation fails with Prisma error", async () => {
            const error = new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
                code: "P2002",
                clientVersion: "7.4.2",
            });
            await expect(withDbErrorHandling(async () => {
                throw error;
            })).rejects.toThrow(DatabaseError);
        });
    });

    describe("globalErrorHandler", () => {
        let mockReq: Partial<Request>;
        let mockRes: Partial<Response>;
        let mockNext: NextFunction;
        let originalConsoleError: typeof console.error;

        beforeEach(() => {
            mockReq = {};
            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            };
            mockNext = jest.fn();
            originalConsoleError = console.error;
            console.error = jest.fn(); // Suppress console error in tests
        });

        afterEach(() => {
            console.error = originalConsoleError;
        });

        it("should handle AppError with correct status and code", () => {
            const error = new AppError("Test error", 400, "TEST_ERROR");
            globalErrorHandler(error, mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Test error",
                code: "TEST_ERROR",
            }));
        });

        it("should fallback to 500 for generic Error", () => {
            const error = new Error("Generic failure");
            globalErrorHandler(error, mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: "Generic failure",
                code: "INTERNAL_SERVER_ERROR",
            }));
        });
    });
});
