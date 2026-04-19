import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSessionStartAPi } from "../api/interview_api";
import { clearSelectedTopic } from "./problem";
import { clearSession } from "./session";
import {
    loginUser,
    logoutAllSessionsRequest,
    logoutUserRequest,
    refreshSession,
    registerUser,
} from "../../services/auth.api";
import { clearStoredAuth, getStoredRefreshToken, getStoredUser, setStoredRefreshToken, setStoredUser } from "../../storage/authStorage";
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../../types/types";

type AuthState = {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isHydrating: boolean;
    isSubmitting: boolean;
};

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isHydrating: true,
    isSubmitting: false,
};

const persistSession = async (payload: AuthResponse) => {
    await Promise.all([
        setStoredRefreshToken(payload.refreshToken),
        setStoredUser(payload.user),
    ]);
};

export const bootstrapAuth = createAsyncThunk(
    "auth/bootstrap",
    async () => {
        const [refreshToken, user] = await Promise.all([
            getStoredRefreshToken(),
            getStoredUser(),
        ]);

        if (!refreshToken || !user) {
            await clearStoredAuth();
            return null;
        }

        try {
            const refreshedSession = await refreshSession(refreshToken);
            await setStoredRefreshToken(refreshedSession.refreshToken);

            return {
                accessToken: refreshedSession.accessToken,
                user,
            };
        } catch {
            await clearStoredAuth();
            return null;
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async (credentials: LoginCredentials) => {
        const payload = await loginUser(credentials);
        await persistSession(payload);
        return payload;
    }
);

export const register = createAsyncThunk(
    "auth/register",
    async (credentials: RegisterCredentials) => {
        const payload = await registerUser(credentials);
        await persistSession(payload);
        return payload;
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { dispatch, getState }) => {
        const state = getState() as { auth: AuthState };
        const refreshToken = await getStoredRefreshToken();

        try {
            if (refreshToken) {
                await logoutUserRequest(refreshToken, state.auth.accessToken);
            }
        } finally {
            await clearStoredAuth();
            dispatch(authSlice.actions.clearAuthState());
            dispatch(clearSession());
            dispatch(clearSelectedTopic());
            dispatch(createSessionStartAPi.util.resetApiState());
        }
    }
);

export const logoutAll = createAsyncThunk(
    "auth/logoutAll",
    async (_, { dispatch, getState }) => {
        const state = getState() as { auth: AuthState };

        try {
            if (state.auth.accessToken) {
                await logoutAllSessionsRequest(state.auth.accessToken);
            }
        } finally {
            await clearStoredAuth();
            dispatch(authSlice.actions.clearAuthState());
            dispatch(clearSession());
            dispatch(clearSelectedTopic());
            dispatch(createSessionStartAPi.util.resetApiState());
        }
    }
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setSession: (
            state,
            action: PayloadAction<{ accessToken: string; user: User }>
        ) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.isAuthenticated = true;
        },
        clearAuthState: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.isSubmitting = false;
        },
        finishHydration: (state) => {
            state.isHydrating = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(bootstrapAuth.pending, (state) => {
                state.isHydrating = true;
            })
            .addCase(bootstrapAuth.fulfilled, (state, action) => {
                state.user = action.payload?.user ?? null;
                state.accessToken = action.payload?.accessToken ?? null;
                state.isAuthenticated = Boolean(action.payload?.accessToken && action.payload?.user);
                state.isHydrating = false;
            })
            .addCase(bootstrapAuth.rejected, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.isHydrating = false;
            })
            .addCase(login.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                state.isSubmitting = false;
            })
            .addCase(login.rejected, (state) => {
                state.isSubmitting = false;
            })
            .addCase(register.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                state.isSubmitting = false;
            })
            .addCase(register.rejected, (state) => {
                state.isSubmitting = false;
            })
            .addCase(logout.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.isHydrating = false;
                state.isSubmitting = false;
            })
            .addCase(logout.rejected, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.isHydrating = false;
                state.isSubmitting = false;
            })
            .addCase(logoutAll.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.isHydrating = false;
                state.isSubmitting = false;
            });
    },
});

export const { clearAuthState, finishHydration, setSession } = authSlice.actions;

export default authSlice.reducer;
