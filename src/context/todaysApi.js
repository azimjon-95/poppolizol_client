import { api } from "./api";

export const todaysApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAllTodays: builder.query({
            query: () => '/story/todays',
        }),
    }),
});

export const {
    useGetAllTodaysQuery
} = todaysApi;