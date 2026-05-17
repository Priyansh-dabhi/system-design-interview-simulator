import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SummaryData = {
    strengths: string[];
    missed_topics: string[];
    suggestions: string[];
};

type SessionState = {
    sessionId: string | null;
    openingMessage: string | null;
    problem: string | null;
    summary: SummaryData | null;
};

const initialState: SessionState = {
    sessionId: null,
    openingMessage: null,
    problem: null,
    summary: null,
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setSession: (
            state,
            action: PayloadAction<{ sessionId: string; openingMessage: string; problem: string }>
        ) => {
            state.sessionId = action.payload.sessionId;
            state.openingMessage = action.payload.openingMessage;
            state.problem = action.payload.problem;
        },
        setSummary: (state, action: PayloadAction<SummaryData>) => {
            state.summary = action.payload;
        },
        clearSession: (state) => {
            state.sessionId = null;
            state.openingMessage = null;
            state.problem = null;
            state.summary = null;
        },
    },
});

export const { setSession, setSummary, clearSession } = sessionSlice.actions;

export default sessionSlice.reducer;
