import { createSessionStartAPi } from "./interview_api";

export const learningApi = createSessionStartAPi.injectEndpoints({
    endpoints: (builder) => ({
        getTopics: builder.query<any, void>({
            query: () => "/api/learning/topics",
            providesTags: ["LearningTopics"],
        }),
        getTopicLessons: builder.query<any, string>({
            query: (slug) => `/api/learning/topics/${slug}/lessons`,
            providesTags: (result, error, slug) => [{ type: "LearningTopic", id: slug }],
        }),
        getLessonDetail: builder.query<any, number>({
            query: (id) => `/api/learning/lessons/${id}`,
            providesTags: (result, error, id) => [{ type: "LearningLesson", id }],
        }),
        completeLessonQuiz: builder.mutation<any, { lessonId: number, score: number, totalQuestions: number, correctAnswers: number, topicId: number }>({
            query: ({ lessonId, ...body }) => ({
                url: `/api/learning/lessons/${lessonId}/complete`,
                method: "POST",
                body,
            }),
            invalidatesTags: ["LearningTopics", "LearningTopic"],
        }),
    }),
});

export const {
    useGetTopicsQuery,
    useGetTopicLessonsQuery,
    useGetLessonDetailQuery,
    useCompleteLessonQuizMutation,
} = learningApi;
