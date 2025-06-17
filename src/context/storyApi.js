import { api } from "./api";

export const storyApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAllStories: builder.query({
            query: ({ startDay, endDay } = {}) => {
                const params = new URLSearchParams({
                    startDay: startDay,
                    endDay: endDay,
                });
                return `/story/all?${params.toString()}`;
            },
        }),
        getStoriesByPatientId: builder.query({
            query: (id) => `/story/patient/${id}`,
        }),
        getStoriesByDoctorId: builder.query({
            query: (id) => `/story/doctor/${id}`,
        }),
        updateStory: builder.mutation({
            query: ({ id, data }) => ({
                url: `/story/update/${id}`,
                method: 'PUT',
                body: data,
            }),
        }),
    }),
});

export const {
    useGetAllStoriesQuery,
    useGetStoriesByPatientIdQuery,
    useGetStoriesByDoctorIdQuery,
    useUpdateStoryMutation,
} = storyApi;