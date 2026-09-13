import Constants from "expo-constants";

export const API_URL =
    process.env.EXPO_PUBLIC_API_URL ||
    Constants.expoConfig?.extra?.API_URL ||
    "https://system-design-interview-simulator-6y2k.onrender.com";
