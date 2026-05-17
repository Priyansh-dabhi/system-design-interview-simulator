import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createSessionStartAPi } from "../api/interview_api";
import { clearSelectedTopic } from "./problem";
import { clearSession } from "./session";
import {
    AuthApiError,
    loginWithGoogleToken,
    loginUser,
    logoutAllSessionsRequest,
    logoutUserRequest,
    refreshSession,
    registerUser,
} from "../../services/auth.api";
import { signOutFirebaseSession } from "../../services/googleAuth";
import { clearStoredAuth, getStoredRefreshToken, setStoredRefreshToken, setStoredUser } from "../../storage/authStorage";
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from "../../types/types";

const getSessionRecoveryNotice = (error: unknown) => {
    if (error instanceof AuthApiError) {
        if (error.category === "auth" || error.category === "validation") {
            return "Session expired. Please sign in again.";
        }

        if (error.category === "network") {
            return "We couldn't restore your session. Check your connection and sign in again.";
        }

        if (error.category === "config") {
            return "The app API URL is not configured. Update the app configuration and sign in again.";
        }
    }

    return "We couldn't restore your session. Please sign in again.";
};

type AuthState = {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isHydrating: boolean;
    isSubmitting: boolean;
    authNotice: string | null;
    googleAuthPhase: "idle" | "browser" | "redirecting";
};

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isHydrating: true,
    isSubmitting: false,
    authNotice: null,
    googleAuthPhase: "idle",
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
        const refreshToken = await getStoredRefreshToken();

        if (!refreshToken) {
            await clearStoredAuth();
            return { accessToken: null, user: null, authNotice: null };
        }

        try {
            const refreshedSession = await refreshSession(refreshToken);
            await Promise.all([
                setStoredRefreshToken(refreshedSession.refreshToken),
                setStoredUser(refreshedSession.user),
            ]);

            return {
                accessToken: refreshedSession.accessToken,
                user: refreshedSession.user,
                authNotice: null,
            };
        } catch (error) {
            await clearStoredAuth();
            await signOutFirebaseSession();
            return {
                accessToken: null,
                user: null,
                authNotice: getSessionRecoveryNotice(error),
            };
        }
    }
);

export const login = createAsyncThunk(
    "auth/login",
    async (credentials: LoginCredentials, { rejectWithValue }) => {
        try {
            const payload = await loginUser(credentials);
            await persistSession(payload);
            return payload;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error : "Login failed");
        }
    }
);

export const loginWithGoogle = createAsyncThunk(
    "auth/loginWithGoogle",
    async (firebaseIdToken: string, { rejectWithValue }) => {
        try {
            const payload = await loginWithGoogleToken(firebaseIdToken);
            await persistSession(payload);
            return payload;
        } catch (error) {
            await signOutFirebaseSession();
            return rejectWithValue(error instanceof Error ? error : "Google login failed");
        }
    }
);

export const register = createAsyncThunk(
    "auth/register",
    async (credentials: RegisterCredentials, { rejectWithValue }) => {
        try {
            const payload = await registerUser(credentials);
            await persistSession(payload);
            return payload;
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error : "Registration failed");
        }
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
            await signOutFirebaseSession();
            dispatch(authSlice.actions.clearAuthNotice());
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
            await signOutFirebaseSession();
            dispatch(authSlice.actions.clearAuthNotice());
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
            state.authNotice = null;
        },
        clearAuthState: (state) => {
            state.user = null;
            state.accessToken = null;
            state.isAuthenticated = false;
            state.isSubmitting = false;
            state.googleAuthPhase = "idle";
        },
        setAuthNotice: (state, action: PayloadAction<string>) => {
            state.authNotice = action.payload;
        },
        clearAuthNotice: (state) => {
            state.authNotice = null;
        },
        setGoogleAuthPhase: (
            state,
            action: PayloadAction<AuthState["googleAuthPhase"]>
        ) => {
            state.googleAuthPhase = action.payload;
        },
        clearGoogleAuthPhase: (state) => {
            state.googleAuthPhase = "idle";
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
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = Boolean(action.payload.accessToken && action.payload.user);
                state.isHydrating = false;
                state.authNotice = action.payload.authNotice;
            })
            .addCase(bootstrapAuth.rejected, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.isHydrating = false;
            })
            .addCase(login.pending, (state) => {
                state.isSubmitting = true;
                state.authNotice = null;
                state.googleAuthPhase = "idle";
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                state.isSubmitting = false;
                state.authNotice = null;
            })
            .addCase(login.rejected, (state) => {
                state.isSubmitting = false;
            })
            .addCase(loginWithGoogle.pending, (state) => {
                state.isSubmitting = true;
                state.authNotice = null;
            })
            .addCase(loginWithGoogle.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                state.isSubmitting = false;
                state.authNotice = null;
                state.googleAuthPhase = "idle";
            })
            .addCase(loginWithGoogle.rejected, (state) => {
                state.isSubmitting = false;
                state.googleAuthPhase = "idle";
            })
            .addCase(register.pending, (state) => {
                state.isSubmitting = true;
                state.authNotice = null;
                state.googleAuthPhase = "idle";
            })
            .addCase(register.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.isAuthenticated = true;
                state.isSubmitting = false;
                state.authNotice = null;
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
                state.googleAuthPhase = "idle";
            })
            .addCase(logout.rejected, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.isHydrating = false;
                state.isSubmitting = false;
                state.googleAuthPhase = "idle";
            })
            .addCase(logoutAll.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.isAuthenticated = false;
                state.isHydrating = false;
                state.isSubmitting = false;
                state.googleAuthPhase = "idle";
            });
    },
});

export const {
    clearAuthNotice,
    clearAuthState,
    clearGoogleAuthPhase,
    finishHydration,
    setAuthNotice,
    setGoogleAuthPhase,
    setSession,
} = authSlice.actions;

export default authSlice.reducer;
