import prisma from "../config/prisma.js";
import { comparePassword, hashPassword } from "../utils/password.js";
import { issueAuthSession } from "./refresh-token.service.js";

const toAuthUser = (user: { id: number; fullName: string; email: string }) => ({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
});

export const registerUser = async (full_name: string, email: string, password: string, deviceInfo?: string | null) => {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
        data: {
            fullName: full_name,
            email,
            password: passwordHash,
        },
        select: {
            id: true,
            fullName: true,
            email: true,
        },
    });

    const { accessToken, refreshToken } = await issueAuthSession(user, deviceInfo);

    return { user: toAuthUser(user), accessToken, refreshToken };
};

export const loginUser = async (email: string, password: string, deviceInfo?: string | null) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const { accessToken, refreshToken } = await issueAuthSession(user, deviceInfo);

    return {
        accessToken,
        refreshToken,
        user: toAuthUser(user),
    };
};
