import { api } from "./api";

export const workersApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getWorkers: builder.query({
            query: () => '/admin/all',
            providesTags: ['Workers'],
        }),
        addWorker: builder.mutation({
            query: (worker) => ({
                url: '/admin/create',
                method: 'POST',
                body: worker,
            }),
            invalidatesTags: ['Workers'],
        }),
        updateWorker: builder.mutation({
            query: ({ id, ...worker }) => ({
                url: `/admin/update/${id}`,
                method: 'PUT',
                body: worker,
            }),
            invalidatesTags: ['Workers'],
        }),
        deleteWorker: builder.mutation({
            query: (id) => ({
                url: `/admin/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Workers'],
        }),
        getByIdWorker: builder.mutation({
            query: (id) => ({
                url: `/admin/${id}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetWorkersQuery,
    useAddWorkerMutation,
    useUpdateWorkerMutation,
    useDeleteWorkerMutation,
    useGetByIdWorkerMutation
} = workersApi;
