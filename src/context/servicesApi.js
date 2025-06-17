import { api } from "./api";

const serviceApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getServices: builder.query({
            query: () => '/services',
            providesTags: ['Services'],
        }),
        getServiceById: builder.query({
            query: (id) => `/services/${id}`,
            providesTags: ['Services'],
        }),
        createService: builder.mutation({
            query: (service) => ({
                url: '/services',
                method: 'POST',
                body: service,
            }),
            invalidatesTags: ['Services'],
        }),
        updateService: builder.mutation({
            query: ({ id, ...service }) => ({
                url: `/services/${id}`,
                method: 'PUT',
                body: service,
            }),
            invalidatesTags: ['Services'],
        }),
        deleteService: builder.mutation({
            query: (id) => ({
                url: `/services/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Services'],
        }),
        addServiceItem: builder.mutation({
            query: ({ id, serviceItem }) => ({
                url: `/services/${id}/add`,
                method: 'POST',
                body: serviceItem,
            }),
            invalidatesTags: ['Services'],
        }),
        deleteServiceItem: builder.mutation({
            query: ({ id, serviceId }) => ({
                url: `/services/${id}/remove`,
                method: 'DELETE',
                body: { serviceId },
            }),
            invalidatesTags: ['Services'],
        }),
    }),
});

export const {
    useGetServicesQuery,
    useCreateServiceMutation,
    useUpdateServiceMutation,
    useDeleteServiceMutation,
    useAddServiceItemMutation,
    useDeleteServiceItemMutation,
} = serviceApi;