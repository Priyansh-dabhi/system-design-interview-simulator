import {createApi, fetchBaseQuery, } from "@reduxjs/toolkit/query/react"
import { API_URL } from "@/src/config/api"

export const createSessionStartAPi = createApi({
    reducerPath: "interviewApi",

    baseQuery: fetchBaseQuery({
        baseUrl: `${API_URL}/api/interview`,
        prepareHeaders: (headers, { getState }) => {
        const token = (getState() as any).auth?.token;
        if (token) {
            headers.set('authorization', `Bearer ${token}`);
        }
        return headers;
        },
    }),
    
    endpoints: (builder)=> ({
        startSession: builder.mutation({
            query: (problemName: string)=> ({
                url: "/api/interview/start_session",
                method: "POST",
                body: {problemName},
            })
        })
    })
})

export const { useStartSessionMutation } = createSessionStartAPi ;