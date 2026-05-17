import { BaseQueryApi, BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../config/api";
import { clearAuthState, setAuthNotice, setSession } from "../slices/auth";
import { clearStoredAuth, getStoredRefreshToken, setStoredRefreshToken, setStoredUser } from "../../storage/authStorage";
import { clearSelectedTopic } from "../slices/problem";
import { clearSession } from "../slices/session";
import { AuthApiError, refreshSession } from "../../services/auth.api";
import { signOutFirebaseSession } from "../../services/googleAuth";

const getSessionRecoveryNotice = (error: unknown) => {
    if (error instanceof AuthApiError) {
        if (error.category === "auth" || error.category === "validation") {
            return "Session expired. Please sign in again.";
        }

        if (error.category === "network") {
            return "We couldn't refresh your session. Check your connection and sign in again.";
        }

        if (error.category === "config") {
            return "The app API URL is not configured. Update the app configuration and sign in again.";
        }
    }

    return "We couldn't refresh your session. Please sign in again.";
};

let activeRefreshPromise: Promise<string | null> | null = null;

const rawBaseQuery = fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as { auth: { accessToken: string | null } };
        const accessToken = state.auth.accessToken;

        if (accessToken) {
            headers.set("authorization", `Bearer ${accessToken}`);
        }

        return headers;
    },
});

const performTokenRefresh = async (api: BaseQueryApi) => {
    if (!activeRefreshPromise) {
        activeRefreshPromise = (async () => {
            const refreshToken = await getStoredRefreshToken();

            if (!refreshToken) {
                await clearStoredAuth();
                await signOutFirebaseSession();
                api.dispatch(clearAuthState());
                api.dispatch(clearSession());
                api.dispatch(clearSelectedTopic());
                api.dispatch(setAuthNotice("Session expired. Please sign in again."));
                return null;
            }

            try {
                const tokens = await refreshSession(refreshToken);
                await Promise.all([
                    setStoredRefreshToken(tokens.refreshToken),
                    setStoredUser(tokens.user),
                ]);
                api.dispatch(setSession({ accessToken: tokens.accessToken, user: tokens.user }));
                return tokens.accessToken;
            } catch (error) {
                await clearStoredAuth();
                await signOutFirebaseSession();
                api.dispatch(clearAuthState());
                api.dispatch(clearSession());
                api.dispatch(clearSelectedTopic());
                api.dispatch(setAuthNotice(getSessionRecoveryNotice(error)));
                return null;
            }
        })().finally(() => {
            activeRefreshPromise = null;
        });
    }

    return activeRefreshPromise;
};

export const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions
) => {
    let result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
        const nextAccessToken = await performTokenRefresh(api);

        if (nextAccessToken) {
            result = await rawBaseQuery(args, api, extraOptions);
        }
    }

    return result;
};
