import { API_URL } from "../config/api";
import { AuthResponse, LoginCredentials, RegisterCredentials } from "../types/types";

export const registerUser = async (data: RegisterCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Registration failed");
    }

    return res.json();
};

export const loginUser = async (data: LoginCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
    }

    return res.json();
};
