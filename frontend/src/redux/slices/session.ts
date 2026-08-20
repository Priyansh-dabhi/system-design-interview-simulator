import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DimensionScore = { score: number; comment: string };

export type SummaryData = {
    strengths: string[];
    missed_topics: string[];
    suggestions: string[];
    // Rich fields (present for interviews scored by the upgraded summary model).
    overall_score?: number;
    dimension_scores?: Record<string, DimensionScore>;
    topic_coverage?: { topic: string; covered: boolean }[];
    study_plan?: { topic: string; why: string }[];
    ideal_answer?: string;
    durationSeconds?: number;
};

type SessionState = {
    sessionId: string | null;
    openingMessage: string | null;
    problem: string | null;
    durationMinutes: number | null;
    difficultyLevel: 'junior' | 'mid' | 'senior' | null;
    hintCount: number;
    summary: SummaryData | null;
    messages: { role: string; text: string }[];
};

const initialState: SessionState = {
    sessionId: null,
    openingMessage: null,
    problem: null,
    durationMinutes: null,
    difficultyLevel: null,
    hintCount: 0,
    summary: null,
    messages: [],
};

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        setSession: (
            state,
            action: PayloadAction<{ sessionId: string; openingMessage: string; problem: string; durationMinutes: number; difficultyLevel: 'junior' | 'mid' | 'senior' }>
        ) => {
            state.sessionId = action.payload.sessionId;
            state.openingMessage = action.payload.openingMessage;
            state.problem = action.payload.problem;
            state.durationMinutes = action.payload.durationMinutes;
            state.difficultyLevel = action.payload.difficultyLevel;
            state.hintCount = 0;
        },
        setSummary: (state, action: PayloadAction<SummaryData>) => {
            state.summary = action.payload;
        },
        clearSession: (state) => {
            state.sessionId = null;
            state.openingMessage = null;
            state.problem = null;
            state.durationMinutes = null;
            state.difficultyLevel = null;
            state.hintCount = 0;
            state.summary = null;
            state.messages = [];
        },
        incrementHintCount: (state) => {
            state.hintCount += 1;
        },
        setMessages: (state, action: PayloadAction<{ role: string; text: string }[]>) => {
            state.messages = action.payload;
        },
    },
});

export const { setSession, setSummary, clearSession, incrementHintCount, setMessages } = sessionSlice.actions;

export default sessionSlice.reducer;
