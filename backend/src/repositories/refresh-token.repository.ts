import prisma from "../config/prisma.js";
import { withDbErrorHandling } from "../utils/prisma-error-mapper.js";

type RefreshTokenRecordInput = {
    userId: number;
    tokenHash: string;
    deviceInfo?: string | null;
    expiresAt: Date;
};

export const createRefreshTokenRecord = async ({
    userId,
    tokenHash,
    deviceInfo,
    expiresAt,
}: RefreshTokenRecordInput) => {
    return withDbErrorHandling(() => prisma.refreshToken.create({
        data: {
            userId,
            tokenHash,
            deviceInfo,
            expiresAt,
        },
    }));
};

export const findRefreshTokenByHash = async (tokenHash: string) => {
    return withDbErrorHandling(() => prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                },
            },
        },
    }));
};

export const revokeRefreshTokenById = async (id: string) => {
    return withDbErrorHandling(() => prisma.refreshToken.update({
        where: { id },
        data: { revokedAt: new Date() },
    }));
};

export const revokeRefreshTokenByHash = async (tokenHash: string) => {
    return withDbErrorHandling(() => prisma.refreshToken.updateMany({
        where: {
            tokenHash,
            revokedAt: null,
        },
        data: { revokedAt: new Date() },
    }));
};

export const revokeAllRefreshTokensForUser = async (userId: number) => {
    return withDbErrorHandling(() => prisma.refreshToken.updateMany({
        where: {
            userId,
            revokedAt: null,
        },
        data: { revokedAt: new Date() },
    }));
};
