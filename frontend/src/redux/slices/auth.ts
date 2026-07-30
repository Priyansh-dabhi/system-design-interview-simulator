import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { clearSelectedTopic } from "./problem";
import { clearSession } from "./session";
import { createSessionStartAPi } from "../api/interview_api";
import {
    AuthApiError,
    loginWithGoogleToken,
    loginUser,
    logoutAllSessionsRequest,
    logoutUserRequest,
    refreshSession,
    registerUser,
    acceptTermsRequest,
} from "../../services/auth.api";
import { signOutFirebaseSession } from "../../services/googleAuth";
import { clearStoredAuth, getStoredRefreshToken, getStoredUser, setStoredRefreshToken, setStoredUser } from "../../storage/authStorage";
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
            // Network error — device is offline. Preserve stored credentials
            // and load cached user so the AuthGuard doesn't redirect to login.
            if (error instanceof AuthApiError && error.category === "network") {
                const cachedUser = await getStoredUser();
                return {
                    accessToken: null,
                    user: cachedUser,       // Keep the user "logged in"
                    authNotice: null,
                };
            }

            // Genuine auth failure (expired token, revoked session, etc.)
            // — clear everything and force re-login.
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
            const message = error instanceof Error ? error.message : "Login failed";
            return rejectWithValue(message);
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
            const message = error instanceof Error ? error.message : "Google login failed";
            return rejectWithValue(message);
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
            const message = error instanceof Error ? error.message : "Registration failed";
            return rejectWithValue(message);
        }
    }
);

export const acceptTerms = createAsyncThunk(
    "auth/acceptTerms",
    async (_, { getState, rejectWithValue }) => {
        const state = getState() as { auth: AuthState };
        const accessToken = state.auth.accessToken;

        if (!accessToken) {
            return rejectWithValue("Not authenticated");
        }

        try {
            const payload = await acceptTermsRequest(accessToken);
            await setStoredUser(payload.user);
            return payload;
        } catch (error) {
            const message = error instanceof Error ? error.message : "Accepting terms failed";
            return rejectWithValue(message);
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
            dispatch({ type: "interviewApi/resetApiState" });
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
            .addCase(acceptTerms.pending, (state) => {
                state.isSubmitting = true;
                state.authNotice = null;
            })
            .addCase(acceptTerms.fulfilled, (state, action) => {
                state.user = action.payload.user;
                state.isSubmitting = false;
            })
            .addCase(acceptTerms.rejected, (state) => {
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
