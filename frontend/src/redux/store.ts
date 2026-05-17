import { configureStore } from "@reduxjs/toolkit";
import { createSessionStartAPi } from "./api/interview_api";
import authReducer from "./slices/auth";
import problemReducer from "./slices/problem";
import sessionReducer from "./slices/session";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    problem: problemReducer,
    session: sessionReducer,
    [createSessionStartAPi.reducerPath]: createSessionStartAPi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(createSessionStartAPi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
