import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types/types";

const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const getStoredRefreshToken = async () => {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setStoredRefreshToken = async (refreshToken: string) => {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const removeStoredRefreshToken = async () => {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const getStoredUser = async (): Promise<User | null> => {
    const rawUser = await AsyncStorage.getItem(USER_KEY);

    if (!rawUser) {
        return null;
    }

    try {
        return JSON.parse(rawUser) as User;
    } catch {
        await AsyncStorage.removeItem(USER_KEY);
        return null;
    }
};

export const setStoredUser = async (user: User) => {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearStoredAuth = async () => {
    await AsyncStorage.multiRemove([REFRESH_TOKEN_KEY, USER_KEY]);
};
