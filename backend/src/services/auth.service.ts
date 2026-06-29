import prisma from "../config/prisma.js";
import { verifyGoogleIdToken } from "../config/firebase-admin.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { issueAuthSession } from "./refresh-token.service.js";
import { AuthServiceError } from "./auth-errors.js";
import { Prisma } from "@prisma/client";
import { withDbErrorHandling } from "../utils/prisma-error-mapper.js";
import { DatabaseError } from "../utils/errors.js";
import crypto from "crypto";

const toAuthUser = (user: { id: number; fullName: string; email: string }) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
});

const createOauthPasswordPlaceholder = async () => {
    return hashPassword(crypto.randomUUID());
};

const resolveLinkedAuthProvider = (currentAuthProvider: string, oauthEnabled: boolean) => {
    if (oauthEnabled || currentAuthProvider === "google" || currentAuthProvider === "password_google") {
        return "password_google";
    }

    if (currentAuthProvider === "password") {
        return "password_google";
    }

    return currentAuthProvider;
};

export const registerUser = async (full_name: string, email: string, password: string, deviceInfo?: string | null) => {
    try {
        const passwordHash = await hashPassword(password);

        const user = await withDbErrorHandling(() => prisma.user.create({
            data: {
                fullName: full_name,
                email,
                password: passwordHash,
                authProvider: "password",
            },
            select: {
                id: true,
                fullName: true,
                email: true,
            },
        }));

        const { accessToken, refreshToken } = await issueAuthSession(user, deviceInfo);

        return { user: toAuthUser(user), accessToken, refreshToken };
    } catch (error) {
        if (
            error instanceof DatabaseError &&
            error.code === "DB_UNIQUE_VIOLATION"
        ) {
            throw new AuthServiceError("Email already in use", 409, "AUTH_EMAIL_IN_USE");
        }

        throw error;
    }
};

export const loginUser = async (email: string, password: string, deviceInfo?: string | null) => {
    const user = await withDbErrorHandling(() => prisma.user.findUnique({
        where: { email },
    }));

    if (!user) throw new AuthServiceError("Invalid credentials", 401, "AUTH_INVALID_CREDENTIALS");
    if (!user.password) throw new AuthServiceError("Invalid credentials", 401, "AUTH_INVALID_CREDENTIALS");

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new AuthServiceError("Invalid credentials", 401, "AUTH_INVALID_CREDENTIALS");

    const { accessToken, refreshToken } = await issueAuthSession(user, deviceInfo);

    return {
        accessToken,
        refreshToken,
        user: toAuthUser(user),
    };
};

export const loginWithGoogle = async (firebaseIdToken: string, deviceInfo?: string | null) => {
    const identity = await verifyGoogleIdToken(firebaseIdToken);

    const existingByProvider = await withDbErrorHandling(() => prisma.user.findUnique({
        where: { providerId: identity.uid },
        select: {
            id: true,
            fullName: true,
            email: true,
            password: true,
            authProvider: true,
            providerId: true,
            avatarUrl: true,
            oauthEnabled: true,
        },
    }));

    if (existingByProvider && existingByProvider.email !== identity.email) {
        throw new AuthServiceError("Google account is already linked to another user", 409, "AUTH_GOOGLE_ALREADY_LINKED");
    }

    const existingByEmail = await withDbErrorHandling(() => prisma.user.findUnique({
        where: { email: identity.email },
        select: {
            id: true,
            fullName: true,
            email: true,
            password: true,
            authProvider: true,
            providerId: true,
            avatarUrl: true,
            oauthEnabled: true,
        },
    }));

    if (existingByProvider && existingByEmail && existingByProvider.id !== existingByEmail.id) {
        throw new AuthServiceError("Google account could not be linked safely", 409, "AUTH_GOOGLE_LINK_FAILED");
    }

    const user =
        existingByProvider ||
        (existingByEmail
            ? await withDbErrorHandling(() => prisma.user.update({
                  where: { id: existingByEmail.id },
                  data: {
                      providerId: existingByEmail.providerId ?? identity.uid,
                      avatarUrl: identity.avatarUrl ?? existingByEmail.avatarUrl,
                      oauthEnabled: true,
                      authProvider: resolveLinkedAuthProvider(
                          existingByEmail.authProvider,
                          existingByEmail.oauthEnabled
                      ),
                      fullName: existingByEmail.fullName || identity.fullName,
                  },
                  select: {
                      id: true,
                      fullName: true,
                      email: true,
                  },
              }))
            : await withDbErrorHandling(async () => prisma.user.create({
                  data: {
                      fullName: identity.fullName,
                      email: identity.email,
                      password: await createOauthPasswordPlaceholder(),
                      providerId: identity.uid,
                      avatarUrl: identity.avatarUrl,
                      oauthEnabled: true,
                      authProvider: "google",
                  },
                  select: {
                      id: true,
                      fullName: true,
                      email: true,
                  },
              })));

    const { accessToken, refreshToken } = await issueAuthSession(user, deviceInfo);

    return {
        accessToken,
        refreshToken,
        user: toAuthUser(user),
    };
};

export const getAuthenticatedUser = async (userId: number) => {
    const user = await withDbErrorHandling(() => prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            fullName: true,
            email: true,
        },
    }));

    if (!user) {
        throw new AuthServiceError("User not found", 404, "AUTH_USER_NOT_FOUND");
    }

    return toAuthUser(user);
};
