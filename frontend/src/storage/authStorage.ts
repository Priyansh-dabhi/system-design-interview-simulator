import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { User } from "../types/types";

const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

const isSecureStoreAvailable = async () => {
    if (Platform.OS === "web") {
        return false;
    }

    return SecureStore.isAvailableAsync();
};

export const getStoredRefreshToken = async () => {
    const secureStoreAvailable = await isSecureStoreAvailable();

    if (secureStoreAvailable) {
        const secureToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

        if (secureToken) {
            return secureToken;
        }
    }

    const legacyToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

    if (legacyToken && secureStoreAvailable) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, legacyToken);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    }

    return legacyToken;
};

export const setStoredRefreshToken = async (refreshToken: string) => {
    if (await isSecureStoreAvailable()) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
        await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
        return;
    }

    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const removeStoredRefreshToken = async () => {
    if (await isSecureStoreAvailable()) {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }

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
    await removeStoredRefreshToken();
    await AsyncStorage.removeItem(USER_KEY);
};
