import { api } from "./api";

export const doctorApi = api.injectEndpoints({
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

        getPotsentsLength: builder.query({
            query: () => '/admin/for_reception',
            providesTags: ['Potsents'],
        }),



        //   const response = await axios.put(`/api/admins/${adminId}/servicesId`, { servicesId });
        updateServicesId: builder.mutation({
            query: ({ adminId, servicesId }) => ({
                url: `/admin/${adminId}/servicesId`,
                method: 'PUT',
                body: { servicesId },
            }),
        }),
        updateRoomId: builder.mutation({
            query: ({ adminId, roomId }) => ({
                url: `/admins/${adminId}/room`,
                method: 'PUT',
                body: { roomId },
            }),
            invalidatesTags: ['Workers'], // Invalidate cache for admins to refresh data
        }),
    }),
});

export const {
    useGetWorkersQuery,
    useAddWorkerMutation,
    useUpdateWorkerMutation,
    useDeleteWorkerMutation,
    useGetByIdWorkerMutation,
    useGetPotsentsLengthQuery,
    useUpdateServicesIdMutation,
    useUpdateRoomIdMutation
} = doctorApi;
