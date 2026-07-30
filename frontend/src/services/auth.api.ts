import { API_URL } from "../config/api";
import { AuthResponse, LoginCredentials, RefreshResponse, RegisterCredentials, User } from "../types/types";

type ApiErrorCategory = "auth" | "validation" | "network" | "server" | "config";

type ApiErrorPayload = {
    message: string;
    errors?: Array<{ field?: string; message: string }>;
};

export class AuthApiError extends Error {
    category: ApiErrorCategory;
    status?: number;
    errors?: Array<{ field?: string; message: string }>;

    constructor(
        message: string,
        category: ApiErrorCategory,
        options?: {
            status?: number;
            errors?: Array<{ field?: string; message: string }>;
        }
    ) {
        super(message);
        this.name = "AuthApiError";
        this.category = category;
        this.status = options?.status;
        this.errors = options?.errors;
    }
}

const resolveApiUrl = (path: string) => {
    if (!API_URL) {
        throw new AuthApiError(
            "App API URL is not configured. Set Expo extra.API_URL or EXPO_PUBLIC_API_URL.",
            "config"
        );
    }

    return `${API_URL}${path}`;
};

const getErrorPayload = async (res: Response): Promise<ApiErrorPayload> => {
    try {
        const errorData = await res.json();
        const message =
            typeof errorData.message === "string"
                ? errorData.message
                : `Request failed with status ${res.status}`;

        return {
            message,
            errors: Array.isArray(errorData.errors) ? errorData.errors : undefined,
        };
    } catch {
        return { message: `Request failed with status ${res.status}` };
    }
};

const getErrorCategory = (status: number): ApiErrorCategory => {
    if (status === 400 || status === 409) {
        return "validation";
    }

    if (status === 401 || status === 403) {
        return "auth";
    }

    return "server";
};

const requestJson = async <T>(path: string, init: RequestInit): Promise<T> => {
    const url = resolveApiUrl(path);
    let res: Response;

    try {
        res = await fetch(url, init);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown network error";
        throw new AuthApiError(`Network request failed: ${message}`, "network");
    }

    if (!res.ok) {
        const errorPayload = await getErrorPayload(res);
        throw new AuthApiError(errorPayload.message, getErrorCategory(res.status), {
            status: res.status,
            errors: errorPayload.errors,
        });
    }

    return res.json();
};

const requestNoContent = async (path: string, init: RequestInit) => {
    const url = resolveApiUrl(path);

    try {
        await fetch(url, init);
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown network error";
        throw new AuthApiError(`Network request failed: ${message}`, "network");
    }
};

export const registerUser = async (data: RegisterCredentials): Promise<AuthResponse> => {
    return requestJson<AuthResponse>("/api/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
};

export const loginUser = async (data: LoginCredentials): Promise<AuthResponse> => {
    return requestJson<AuthResponse>("/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
};

export const loginWithGoogleToken = async (firebaseIdToken: string): Promise<AuthResponse> => {
    return requestJson<AuthResponse>("/api/auth/google", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            firebaseIdToken,
        }),
    });
};

export const refreshSession = async (refreshToken: string): Promise<RefreshResponse> => {
    return requestJson<RefreshResponse>("/api/auth/refresh", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });
};

export const logoutUserRequest = async (refreshToken: string, accessToken?: string | null) => {
    return requestNoContent("/api/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
    });
};

export const logoutAllSessionsRequest = async (accessToken: string) => {
    return requestNoContent("/api/auth/logout-all", {
        method: "POST",
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    });
};

export const acceptTermsRequest = async (accessToken: string): Promise<{ user: User }> => {
    return requestJson<{ user: User }>("/api/auth/accept-terms", {
        method: "POST",
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    });
};
