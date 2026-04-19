import { BaseQueryApi, BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../../config/api";
import { clearAuthState, setSession } from "../slices/auth";
import { clearStoredAuth, getStoredRefreshToken, getStoredUser, setStoredRefreshToken } from "../../storage/authStorage";
import { RefreshResponse } from "../../types/types";
import { clearSelectedTopic } from "../slices/problem";
import { clearSession } from "../slices/session";

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
            const [refreshToken, user] = await Promise.all([
                getStoredRefreshToken(),
                getStoredUser(),
            ]);

            if (!refreshToken || !user) {
                await clearStoredAuth();
                api.dispatch(clearAuthState());
                api.dispatch(clearSession());
                api.dispatch(clearSelectedTopic());
                return null;
            }

            const refreshResult = await rawBaseQuery(
                {
                    url: "/api/auth/refresh",
                    method: "POST",
                    body: { refreshToken },
                },
                api,
                {}
            );

            if (!refreshResult.data) {
                await clearStoredAuth();
                api.dispatch(clearAuthState());
                api.dispatch(clearSession());
                api.dispatch(clearSelectedTopic());
                return null;
            }

            const tokens = refreshResult.data as RefreshResponse;
            await setStoredRefreshToken(tokens.refreshToken);
            api.dispatch(setSession({ accessToken: tokens.accessToken, user }));
            return tokens.accessToken;
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
