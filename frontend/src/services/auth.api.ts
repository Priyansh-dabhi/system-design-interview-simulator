import { API_URL } from "../config/api";
import { AuthResponse, LoginCredentials, RefreshResponse, RegisterCredentials } from "../types/types";

const getErrorMessage = async (res: Response) => {
    try {
        const errorData = await res.json();
        return typeof errorData.message === "string"
            ? errorData.message
            : JSON.stringify(errorData.message ?? "Request failed");
    } catch {
        return `Request failed with status ${res.status}`;
    }
};

export const registerUser = async (data: RegisterCredentials): Promise<AuthResponse> => {
    const url = `${API_URL}/api/auth/register`;
    console.log(`[Diagnostic] Attempting registration at: ${url}`);
    
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorMessage = await getErrorMessage(res);
            console.error(`[Diagnostic] Registration failed with status ${res.status}:`, errorMessage);
            throw new Error(errorMessage);
        }

        return res.json();
    } catch (error: any) {
        console.error(`[Diagnostic] Network error during registration for ${url}:`, error.message);
        throw new Error(`Network request failed: ${error.message} (URL: ${url})`);
    }
};

export const loginUser = async (data: LoginCredentials): Promise<AuthResponse> => {
    const url = `${API_URL}/api/auth/login`;
    console.log(`[Diagnostic] Attempting login at: ${url}`);
    
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) {
            const errorMessage = await getErrorMessage(res);
            console.error(`[Diagnostic] Login failed with status ${res.status}:`, errorMessage);
            throw new Error(errorMessage);
        }

        return res.json();
    } catch (error: any) {
        console.error(`[Diagnostic] Network error during login for ${url}:`, error.message);
        throw new Error(`Network request failed: ${error.message} (URL: ${url})`);
    }
};

export const refreshSession = async (refreshToken: string): Promise<RefreshResponse> => {
    const url = `${API_URL}/api/auth/refresh`;

    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
        throw new Error(await getErrorMessage(res));
    }

    return res.json();
};

export const logoutUserRequest = async (refreshToken: string, accessToken?: string | null) => {
    const url = `${API_URL}/api/auth/logout`;

    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
    });
};

export const logoutAllSessionsRequest = async (accessToken: string) => {
    const url = `${API_URL}/api/auth/logout-all`;

    await fetch(url, {
        method: "POST",
        headers: {
            authorization: `Bearer ${accessToken}`,
        },
    });
};
