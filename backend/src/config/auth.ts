import dotenv from "dotenv";

dotenv.config();

const requireEnv = (name: string, fallback?: string) => {
    const value = process.env[name] || (fallback ? process.env[fallback] : undefined);

    if (!value) {
        throw new Error(`Missing required environment variable: ${name}${fallback ? ` (or ${fallback})` : ""}`);
    }

    return value;
};

export const ACCESS_TOKEN_SECRET = requireEnv("ACCESS_TOKEN_SECRET", "JWT_SECRET");
export const ACCESS_TOKEN_EXPIRES_IN = "15m";
export const REFRESH_TOKEN_TTL_DAYS = 90;
