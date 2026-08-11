import { GoogleSignin, statusCodes } from "@react-native-google-signin/google-signin";
import { GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { getFirebaseAuth, googleAuthConfig, isFirebaseConfigured } from "../config/firebase";
import { Platform } from "react-native";

type GoogleAuthErrorCode = "cancelled" | "config" | "oauth" | "firebase";

export class GoogleAuthError extends Error {
    code: GoogleAuthErrorCode;

    constructor(message: string, code: GoogleAuthErrorCode) {
        super(message);
        this.name = "GoogleAuthError";
        this.code = code;
    }
}

export const signInWithGoogleAsync = async () => {
    if (Platform.OS === "web") {
        throw new GoogleAuthError(
            "Native Google Sign-In is not available on the web platform.",
            "config"
        );
    }

    if (!isFirebaseConfigured()) {
        throw new GoogleAuthError(
            "Google sign-in is not configured. Add the Firebase app settings first.",
            "config"
        );
    }

    if (!googleAuthConfig.webClientId) {
        throw new GoogleAuthError(
            "Google sign-in is not configured for this platform. Add the matching EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID value.",
            "config"
        );
    }

    GoogleSignin.configure({
        webClientId: googleAuthConfig.webClientId,
        ...(googleAuthConfig.iosClientId ? { iosClientId: googleAuthConfig.iosClientId } : {}),
        offlineAccess: false,
    });

    try {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        
        // This opens the native Google sign-in UI
        const response = await GoogleSignin.signIn();
        
        let idToken: string | null | undefined = null;
        
        if ('type' in response) {
            // new API format (v11+)
            if (response.type === 'cancelled') {
                 throw new GoogleAuthError("Google sign-in was cancelled.", "cancelled");
            }
            if (response.type === 'success') {
                idToken = response.data?.idToken;
            }
        } else {
             // fallback for older API versions
             idToken = (response as any).idToken;
        }
        if (!idToken) {
            throw new GoogleAuthError("Google did not return an ID token.", "oauth");
        }

        const auth = getFirebaseAuth();
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const firebaseIdToken = await userCredential.user.getIdToken(true);

        return { firebaseIdToken };
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED || error.message?.includes('cancelled')) {
             throw new GoogleAuthError("Google sign-in was cancelled.", "cancelled");
        } else if (error.code === statusCodes.IN_PROGRESS) {
             throw new GoogleAuthError("Sign in is in progress.", "oauth");
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
             throw new GoogleAuthError("Play services not available or outdated.", "oauth");
        } else if (error instanceof GoogleAuthError) {
             throw error;
        }

        const message = error instanceof Error ? error.message : "Unknown sign-in error";
        throw new GoogleAuthError(`Google/Firebase sign-in failed: ${message}`, "firebase");
    }
};

export const signOutFirebaseSession = async () => {
    try {
        const auth = getFirebaseAuth();

        if (auth.currentUser) {
            await signOut(auth);
        }

        if (Platform.OS !== "web") {
            // Also sign out from Google locally
            await GoogleSignin.signOut();
        }
    } catch {
        // Ignore Firebase/Google sign-out failures so local cleanup can still finish.
    }
};
