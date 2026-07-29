import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, initializeAuth, Persistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

type FirebaseConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
};

type GoogleAuthConfig = {
    androidClientId: string;
    iosClientId: string;
    webClientId: string;
};

export const firebaseConfig: FirebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

export const googleAuthConfig: GoogleAuthConfig = {
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? "",
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? "",
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
};

const hasRequiredFirebaseConfig = () => {
    const missingKeys: string[] = [];
    if (!firebaseConfig.apiKey) missingKeys.push("EXPO_PUBLIC_FIREBASE_API_KEY");
    if (!firebaseConfig.authDomain) missingKeys.push("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
    if (!firebaseConfig.projectId) missingKeys.push("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
    if (!firebaseConfig.appId) missingKeys.push("EXPO_PUBLIC_FIREBASE_APP_ID");

    return {
        isValid: missingKeys.length === 0,
        missingKeys,
    };
};

let authInstance: Auth | null = null;

export const isFirebaseConfigured = () => hasRequiredFirebaseConfig().isValid;

export const getFirebaseApp = (): FirebaseApp => {
    const { isValid, missingKeys } = hasRequiredFirebaseConfig();
    if (!isValid) {
        throw new Error(`Firebase is not configured. Missing required values: ${missingKeys.join(", ")}`);
    }

    if (getApps().length > 0) {
        return getApp();
    }

    return initializeApp(firebaseConfig);
};

export const getFirebaseAuth = (): Auth => {
    if (authInstance) {
        return authInstance;
    }

    const app = getFirebaseApp();

    if (Platform.OS === "web") {
        authInstance = getAuth(app);
    } else {
        // Narrow runtime require — TS declarations don't reliably export
        // getReactNativePersistence, but the native Firebase JS runtime does.
        // Loaded inside the native branch so it never runs on web.
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getReactNativePersistence } = require("firebase/auth") as {
            getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
        };

        try {
            authInstance = initializeAuth(app, {
                persistence: getReactNativePersistence(AsyncStorage),
            });
        } catch (error) {
            // Only fall back to getAuth(app) if Auth was already initialized
            // (e.g., Fast Refresh / HMR). Detect by error code, not message text.
            const code = (error as { code?: string }).code;

            if (code === "auth/already-initialized") {
                authInstance = getAuth(app);
            } else {
                console.error("[Firebase Auth] Persistence initialization failed:", error);
                throw error;
            }
        }
    }

    return authInstance;
};

