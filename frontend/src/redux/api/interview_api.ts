import { API_URL } from "@/src/config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react";

export const createSessionStartAPi = createApi({
    reducerPath: "interviewApi",

    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/interview`,
        prepareHeaders: async (headers) => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),

    endpoints: (builder) => ({
        startSession: builder.mutation({
            query: (problemName: string) => ({
                url: "/start_session",
                method: "POST",
                body: { problem: problemName },
            })
        }),
        chat: builder.mutation({
            query: ({ sessionId, problem, message }) => ({
                url: "/chat",
                method: "POST",
                body: { sessionId, problem, message },
            })
        }),
        endSession: builder.mutation({
            query: ({ sessionId, problem }) => ({
                url: "/summary",
                method: "POST",
                body: { sessionId, problem },
            })
        }),
        getHistory: builder.query({
            query: () => ({
                url: "/history",
                method: "GET",
            })
        })
    }),


})

// custom hooks
export const { useStartSessionMutation, useChatMutation, useEndSessionMutation, useGetHistoryQuery } = createSessionStartAPi;