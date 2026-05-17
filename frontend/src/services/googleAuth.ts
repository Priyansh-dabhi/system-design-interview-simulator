import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { Alert, Platform } from "react-native";
import { GoogleAuthProvider, signInWithCredential, signOut } from "firebase/auth";
import { getFirebaseAuth, googleAuthConfig, isFirebaseConfigured } from "../config/firebase";

WebBrowser.maybeCompleteAuthSession();

type GoogleAuthErrorCode = "cancelled" | "config" | "oauth" | "firebase";

const EXPO_PROJECT_FULL_NAME = "@priyansh_dabhi/systemdesigninterviewer";
const EXPO_PROXY_REDIRECT_URI = `https://auth.expo.io/${EXPO_PROJECT_FULL_NAME}`;
const EXPO_AUTH_SESSION_PATH = `${EXPO_PROXY_REDIRECT_URI}/start`;

const googleDiscovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const createNonce = () =>
    Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

export class GoogleAuthError extends Error {
    code: GoogleAuthErrorCode;

    constructor(message: string, code: GoogleAuthErrorCode) {
        super(message);
        this.name = "GoogleAuthError";
        this.code = code;
    }
}

const getGoogleClientId = () => {
    // Expo proxy redirects (`https://auth.expo.io/...`) must be registered on a Web OAuth client.
    // Native Android/iOS client IDs are tied to package/bundle IDs and do not accept redirect URIs.
    if (Platform.OS === "android" || Platform.OS === "ios") {
        return googleAuthConfig.webClientId || googleAuthConfig.androidClientId || googleAuthConfig.iosClientId;
    }

    return googleAuthConfig.webClientId;
};

export const signInWithGoogleAsync = async () => {
    if (!isFirebaseConfigured()) {
        throw new GoogleAuthError(
            "Google sign-in is not configured. Add the Firebase app settings first.",
            "config"
        );
    }

    const clientId = getGoogleClientId();

    if (!clientId) {
        throw new GoogleAuthError(
            "Google sign-in is not configured for this platform. Add the matching EXPO_PUBLIC_GOOGLE_*_CLIENT_ID value.",
            "config"
        );
    }

    const request = new AuthSession.AuthRequest({
        clientId,
        redirectUri: (() => {
            const redirectUri = EXPO_PROXY_REDIRECT_URI;

            // Alert.alert("Google Redirect URI", redirectUri);
            return redirectUri;
        })(),
        responseType: AuthSession.ResponseType.IdToken,
        scopes: ["openid", "profile", "email"],
        prompt: AuthSession.Prompt.SelectAccount,
        extraParams: {
            nonce: createNonce(),
        },
        usePKCE: false,
    });

    const authUrl = await request.makeAuthUrlAsync(googleDiscovery);
    const returnUrl = AuthSession.getDefaultReturnUrl();
    const startUrl = `${EXPO_AUTH_SESSION_PATH}?${new URLSearchParams({
        authUrl,
        returnUrl,
    }).toString()}`;
    const browserResult = await WebBrowser.openAuthSessionAsync(startUrl, returnUrl);

    if (browserResult.type !== "success") {
        if (browserResult.type === "dismiss" || browserResult.type === "cancel") {
            throw new GoogleAuthError("Google sign-in was cancelled.", "cancelled");
        }

        throw new GoogleAuthError("Google sign-in did not complete successfully.", "oauth");
    }

    const result = request.parseReturnUrl(browserResult.url);

    if (result.type === "dismiss" || result.type === "cancel") {
        throw new GoogleAuthError("Google sign-in was cancelled.", "cancelled");
    }

    if (result.type !== "success") {
        throw new GoogleAuthError("Google sign-in did not complete successfully.", "oauth");
    }

    const googleIdToken = result.params.id_token;

    if (!googleIdToken) {
        throw new GoogleAuthError("Google did not return an ID token.", "oauth");
    }

    try {
        const auth = getFirebaseAuth();
        const credential = GoogleAuthProvider.credential(googleIdToken);
        const userCredential = await signInWithCredential(auth, credential);
        const firebaseIdToken = await userCredential.user.getIdToken(true);

        return { firebaseIdToken };
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown Firebase sign-in error";
        throw new GoogleAuthError(`Firebase sign-in failed: ${message}`, "firebase");
    }
};

export const signOutFirebaseSession = async () => {
    try {
        const auth = getFirebaseAuth();

        if (auth.currentUser) {
            await signOut(auth);
        }
    } catch {
        // Ignore Firebase sign-out failures so local JWT cleanup can still finish.
    }
};
