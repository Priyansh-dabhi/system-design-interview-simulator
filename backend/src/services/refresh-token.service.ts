import prisma from "../config/prisma.js";
import * as refreshTokenRepository from "../repositories/refresh-token.repository.js";
import { generateRefreshToken, getRefreshTokenExpiryDate, hashRefreshToken, signAccessToken } from "../utils/token.js";
import { AuthServiceError } from "./auth-errors.js";
import { withDbErrorHandling } from "../utils/prisma-error-mapper.js";

type SessionUser = {
    id: number;
    fullName: string;
    email: string;
    acceptedTermsAt?: Date | null;
};

const buildTokenPair = async (user: SessionUser, deviceInfo?: string | null) => {
    const accessToken = signAccessToken({
        userId: user.id,
        email: user.email,
    });

    const refreshToken = generateRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);

    await refreshTokenRepository.createRefreshTokenRecord({
        userId: user.id,
        tokenHash,
        deviceInfo,
        expiresAt: getRefreshTokenExpiryDate(),
    });

    return {
        accessToken,
        refreshToken,
    };
};

export const issueAuthSession = async (user: SessionUser, deviceInfo?: string | null) => {
    return buildTokenPair(user, deviceInfo);
};

export const refreshAuthSession = async (refreshToken: string, deviceInfo?: string | null) => {
    const tokenHash = hashRefreshToken(refreshToken);
    const existingToken = await refreshTokenRepository.findRefreshTokenByHash(tokenHash);

    if (!existingToken) {
        throw new AuthServiceError("Invalid refresh token", 401, "AUTH_INVALID_TOKEN");
    }

    if (existingToken.revokedAt) {
        await refreshTokenRepository.revokeAllRefreshTokensForUser(existingToken.userId);
        throw new AuthServiceError("Refresh token has been revoked", 401, "AUTH_TOKEN_REVOKED");
    }

    if (existingToken.expiresAt <= new Date()) {
        await refreshTokenRepository.revokeRefreshTokenById(existingToken.id);
        throw new AuthServiceError("Refresh token expired", 401, "AUTH_TOKEN_EXPIRED");
    }

    const nextRefreshToken = generateRefreshToken();
    const nextTokenHash = hashRefreshToken(nextRefreshToken);
    const accessToken = signAccessToken({
        userId: existingToken.user.id,
        email: existingToken.user.email,
    });

    await withDbErrorHandling(() => prisma.$transaction(async (tx) => {
        await tx.refreshToken.update({
            where: { id: existingToken.id },
            data: { revokedAt: new Date() },
        });

        await tx.refreshToken.create({
            data: {
                userId: existingToken.user.id,
                tokenHash: nextTokenHash,
                deviceInfo: deviceInfo ?? existingToken.deviceInfo,
                expiresAt: getRefreshTokenExpiryDate(),
            },
        });
    }));

    return {
        accessToken,
        refreshToken: nextRefreshToken,
        user: {
            id: existingToken.user.id,
            fullName: existingToken.user.fullName,
            email: existingToken.user.email,
            acceptedTermsAt: existingToken.user.acceptedTermsAt ? existingToken.user.acceptedTermsAt.toISOString() : null,
        },
    };
};

export const revokeRefreshSession = async (refreshToken: string) => {
    const tokenHash = hashRefreshToken(refreshToken);
    await refreshTokenRepository.revokeRefreshTokenByHash(tokenHash);
};

export const revokeAllUserSessions = async (userId: number) => {
    await refreshTokenRepository.revokeAllRefreshTokensForUser(userId);
};
