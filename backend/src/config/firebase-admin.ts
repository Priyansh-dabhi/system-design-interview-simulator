import "dotenv/config";
import { App, applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { DecodedIdToken, getAuth } from "firebase-admin/auth";
import { AuthServiceError } from "../services/auth-errors.js";

type VerifiedGoogleIdentity = {
    uid: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
};

type ServiceAccountEnv = {
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
    project_id?: string;
    client_email?: string;
    private_key?: string;
};

const getPrivateKey = () => {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!privateKey) {
        return undefined;
    }

    return privateKey.replace(/\\n/g, "\n");
};

const getServiceAccountFromJson = () => {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!) as ServiceAccountEnv;
    const projectId = serviceAccount.projectId ?? serviceAccount.project_id;
    const clientEmail = serviceAccount.clientEmail ?? serviceAccount.client_email;
    const privateKey = serviceAccount.privateKey ?? serviceAccount.private_key;

    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "Firebase service account JSON must include project_id, client_email, and private_key."
        );
    }

    return {
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
    };
};

const buildFirebaseApp = (): App => {
    if (getApps().length > 0) {
        return getApp();
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = getServiceAccountFromJson();

        return initializeApp({
            credential: cert({
                projectId: serviceAccount.projectId,
                clientEmail: serviceAccount.clientEmail,
                privateKey: serviceAccount.privateKey,
            }),
        });
    }

    if (
        process.env.FIREBASE_PROJECT_ID &&
        process.env.FIREBASE_CLIENT_EMAIL &&
        process.env.FIREBASE_PRIVATE_KEY
    ) {
        return initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: getPrivateKey()!,
            }),
        });
    }

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return initializeApp({
            credential: applicationDefault(),
        });
    }

    throw new Error(
        "Firebase Admin credentials are not configured. Set FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY, or GOOGLE_APPLICATION_CREDENTIALS."
    );
};

const getFirebaseAdminApp = () => buildFirebaseApp();

const validateDecodedToken = (decodedToken: DecodedIdToken): VerifiedGoogleIdentity => {
    if (!decodedToken.email || !decodedToken.email_verified) {
        throw new AuthServiceError("Google account email must be verified", 401);
    }

    const signInProvider = decodedToken.firebase?.sign_in_provider;

    if (signInProvider !== "google.com") {
        throw new AuthServiceError("Invalid Google sign-in provider", 401);
    }

    return {
        uid: decodedToken.uid,
        email: decodedToken.email.toLowerCase(),
        fullName: decodedToken.name?.trim() || decodedToken.email.split("@")[0],
        avatarUrl: decodedToken.picture ?? null,
    };
};

export const verifyGoogleIdToken = async (idToken: string): Promise<VerifiedGoogleIdentity> => {
    if (!idToken.trim()) {
        throw new AuthServiceError("Firebase ID token is required", 400);
    }

    try {
        const decodedToken = await getAuth(getFirebaseAdminApp()).verifyIdToken(idToken, true);
        return validateDecodedToken(decodedToken);
    } catch (error) {
        if (error instanceof AuthServiceError) {
            throw error;
        }

        throw new AuthServiceError("Invalid or expired Firebase ID token", 401);
    }
};
