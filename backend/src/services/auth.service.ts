import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/jwt.js";
import { comparePassword, hashPassword } from "../utils/password.js";

export const registerUser = async (full_name: string, email: string, password: string) => {
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

    const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    return { user, token };
};

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
};