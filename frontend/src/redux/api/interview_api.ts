import { createApi } from "@reduxjs/toolkit/query/react";
import { InterviewHistoryResponse } from "../../types/types";
import { baseQueryWithReauth } from "./baseQuery";

export const createSessionStartAPi = createApi({
    reducerPath: "interviewApi",

    baseQuery: baseQueryWithReauth,

    tagTypes: ["InterviewHistory"],

    endpoints: (builder) => ({
        startSession: builder.mutation({
            query: ({ problem, durationMinutes, difficultyLevel }: { problem: string; durationMinutes: number; difficultyLevel: string }) => ({
                url: "/api/interview/start_session",
                method: "POST",
                body: { problem, durationMinutes, difficultyLevel },
            }),
            invalidatesTags: ["InterviewHistory"],
        }),
        chat: builder.mutation({
            query: ({ sessionId, problem, message }) => ({
                url: "/api/interview/chat",
                method: "POST",
                body: { sessionId, problem, message },
            })
        }),
        endSession: builder.mutation({
            query: ({ sessionId, problem }) => ({
                url: "/api/interview/summary",
                method: "POST",
                body: { sessionId, problem },
            }),
            invalidatesTags: ["InterviewHistory"],
        }),
        getHint: builder.mutation({
            query: ({ sessionId }: { sessionId: string }) => ({
                url: "/api/interview/hint",
                method: "POST",
                body: { sessionId },
            }),
        }),
        getHistory: builder.query<InterviewHistoryResponse, void>({
            query: () => ({
                url: "/api/interview/history",
                method: "GET",
            }),
            providesTags: ["InterviewHistory"],
        }),
        getSessionDetail: builder.query<{
            id: string;
            topic: string;
            status: string;
            stage: string;
            difficultyLevel?: string;
            durationMinutes?: number | null;
            durationSeconds?: number;
            date: string;
            endedAt?: string | null;
            summary: InterviewHistoryResponse['history'][0]['summary'] | null;
            messages: { id: string; role: 'interviewer' | 'user'; text: string; createdAt: string }[];
        }, { sessionId: string }>({
            query: ({ sessionId }) => ({
                url: `/api/interview/session/${sessionId}`,
                method: "GET",
            }),
            providesTags: (_result, _error, { sessionId }) => [{ type: "InterviewHistory", id: sessionId }],
        }),
        deleteSession: builder.mutation<{ success: boolean; message: string }, { sessionId: string }>({
            query: ({ sessionId }) => ({
                url: `/api/interview/session/${sessionId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["InterviewHistory"],
        }),
    }),
});

// custom hooks
export const {
    useStartSessionMutation,
    useChatMutation,
    useEndSessionMutation,
    useGetHistoryQuery,
    useGetSessionDetailQuery,
    useDeleteSessionMutation,
    useGetHintMutation,
} = createSessionStartAPi;
