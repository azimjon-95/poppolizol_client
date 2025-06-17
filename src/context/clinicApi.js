import { api } from "./api";

export const clinicApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getClinics: builder.query({
            query: () => '/clinic/info',
            providesTags: ['Clinics'],
        }),
        createClinic: builder.mutation({
            query: (clinicData) => ({
                url: '/clinic/create',
                method: 'POST',
                body: clinicData,
            }),
            invalidatesTags: ['Clinics'],
        }),
        updateClinic: builder.mutation({
            query: ({ id, ...clinicData }) => ({
                url: `/clinic/update/${id}`,
                method: 'PUT',
                body: clinicData,
            }),
            invalidatesTags: ['Clinics'],
        }),
        deleteClinic: builder.mutation({
            query: (id) => ({
                url: `/clinic/delete/${id}`, // Assuming a delete endpoint exists
                method: 'DELETE',
            }),
            invalidatesTags: ['Clinics'],
        }),
    }),
});

export const {
    useGetClinicsQuery,
    useCreateClinicMutation,
    useUpdateClinicMutation,
    useDeleteClinicMutation,
} = clinicApi;