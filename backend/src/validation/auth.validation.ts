import { z } from "zod";

const trimmedString = (fieldName: string) =>
    z
        .string()
        .trim()
        .min(1, `${fieldName} is required`);

const normalizedEmail = trimmedString("Email")
    .email("Email must be valid")
    .transform((email) => email.toLowerCase());

const registrationPassword = trimmedString("Password")
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Za-z]/, "Password must include at least one letter")
    .regex(/\d/, "Password must include at least one number");

export const registerSchema = z.object({
    full_name: trimmedString("Full name").max(120, "Full name must be 120 characters or fewer"),
    email: normalizedEmail,
    password: registrationPassword,
});

export const loginSchema = z.object({
    email: normalizedEmail,
    password: trimmedString("Password"),
});

export const googleLoginSchema = z
    .object({
        firebaseIdToken: trimmedString("Firebase ID token").optional(),
        idToken: trimmedString("Firebase ID token").optional(),
    })
    .refine((data) => Boolean(data.firebaseIdToken || data.idToken), {
        message: "Firebase ID token is required",
        path: ["firebaseIdToken"],
    })
    .transform((data) => ({
        firebaseIdToken: data.firebaseIdToken ?? data.idToken!,
    }));

export const refreshSchema = z.object({
    refreshToken: trimmedString("Refresh token"),
});

export const logoutSchema = z.object({
    refreshToken: trimmedString("Refresh token"),
});
