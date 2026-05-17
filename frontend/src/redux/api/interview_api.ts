import { createApi } from "@reduxjs/toolkit/query/react";
import { InterviewHistoryResponse } from "../../types/types";
import { baseQueryWithReauth } from "./baseQuery";

export const createSessionStartAPi = createApi({
    reducerPath: "interviewApi",

    baseQuery: baseQueryWithReauth,

    tagTypes: ["InterviewHistory"],

    endpoints: (builder) => ({
        startSession: builder.mutation({
            query: (problemName: string) => ({
                url: "/api/interview/start_session",
                method: "POST",
                body: { problem: problemName },
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
export const { useStartSessionMutation, useChatMutation, useEndSessionMutation, useGetHistoryQuery } = createSessionStartAPi;
