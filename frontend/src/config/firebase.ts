import Constants from "expo-constants";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth } from "firebase/auth";

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

type ExtraConfig = {
    firebase?: Partial<FirebaseConfig>;
    googleAuth?: Partial<GoogleAuthConfig>;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExtraConfig;

export const firebaseConfig: FirebaseConfig = {
    apiKey: extra.firebase?.apiKey ?? "",
    authDomain: extra.firebase?.authDomain ?? "",
    projectId: extra.firebase?.projectId ?? "",
    storageBucket: extra.firebase?.storageBucket ?? "",
    messagingSenderId: extra.firebase?.messagingSenderId ?? "",
    appId: extra.firebase?.appId ?? "",
};

export const googleAuthConfig: GoogleAuthConfig = {
    androidClientId: extra.googleAuth?.androidClientId ?? "",
    iosClientId: extra.googleAuth?.iosClientId ?? "",
    webClientId: extra.googleAuth?.webClientId ?? "",
};

const hasRequiredFirebaseConfig = () =>
    Boolean(
        firebaseConfig.apiKey &&
            firebaseConfig.authDomain &&
            firebaseConfig.projectId &&
            firebaseConfig.appId
    );

let authInstance: Auth | null = null;

export const isFirebaseConfigured = () => hasRequiredFirebaseConfig();

export const getFirebaseApp = (): FirebaseApp => {
    if (!hasRequiredFirebaseConfig()) {
        throw new Error("Firebase is not configured. Add the required EXPO_PUBLIC_FIREBASE_* values.");
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

    authInstance = getAuth(getFirebaseApp());
    return authInstance;
};
