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
        const errorMessage = typeof errorData.message === 'string' 
            ? errorData.message 
            : (errorData.message?.message || JSON.stringify(errorData.message) || "Registration failed");
        throw new Error(errorMessage);
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
        const errorMessage = typeof errorData.message === 'string' 
            ? errorData.message 
            : (errorData.message?.message || JSON.stringify(errorData.message) || "Login failed");
        throw new Error(errorMessage);
    }

    return res.json();
};
