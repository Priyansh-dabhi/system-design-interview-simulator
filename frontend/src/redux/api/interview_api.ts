import { createApi } from "@reduxjs/toolkit/query/react";
import { InterviewHistoryResponse } from "../../types/types";
import { baseQueryWithReauth } from "./baseQuery";

export const createSessionStartAPi = createApi({
    reducerPath: "interviewApi",

    baseQuery: baseQueryWithReauth,

    // Automatically refetch all queries when the device regains network connectivity
    // or when the app comes back into focus. This fixes the stale "0 data" bug
    // that occurs when the app is opened while offline.
    refetchOnReconnect: true,
    refetchOnFocus: true,

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
        })
    }),


})

// custom hooks
export const { useStartSessionMutation, useChatMutation, useEndSessionMutation, useGetHistoryQuery, useGetHintMutation } = createSessionStartAPi;
