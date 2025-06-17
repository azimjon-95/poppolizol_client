// src/services/nursesApi.js
import { api } from "./api";

export const nursesApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all nurses
        getNurses: builder.query({
            query: () => ({
                url: '/nurses',
                method: 'GET',
            }),
            providesTags: ['Nurses'],
        }),

        // Get night shifts
        getNightShifts: builder.query({
            query: (params = {}) => ({
                url: '/night-shifts',
                method: 'GET',
                params: {
                    startDate: params.startDate,
                    endDate: params.endDate,
                    nurseId: params.nurseId,
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: 'NightShifts', id: _id })),
                        { type: 'NightShifts', id: 'LIST' },
                    ]
                    : [{ type: 'NightShifts', id: 'LIST' }],
        }),

        // Create night shift
        createNightShift: builder.mutation({
            query: (data) => ({
                url: '/night-shifts',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'NightShifts', id: 'LIST' }],
        }),

        // Update night shift
        updateNightShift: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/night-shifts/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'NightShifts', id }],
        }),

        // Delete night shift
        deleteNightShift: builder.mutation({
            query: (id) => ({
                url: `/night-shifts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'NightShifts', id }],
        }),

        // Remove nurse from shift
        removeNurseFromShift: builder.mutation({
            query: ({ shiftId, nurseId }) => ({
                url: `/night-shifts/${shiftId}/nurses/${nurseId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { shiftId }) => [
                { type: 'NightShifts', id: shiftId },
            ],
        }),

        // Start shift
        startShift: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/night-shifts/${id}/start`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'NightShifts', id }],
        }),

        // End shift
        endShift: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/night-shifts/${id}/end`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'NightShifts', id }],
        }),

        // Auto schedule shifts
        autoScheduleShifts: builder.mutation({
            query: (data) => ({
                url: '/night-shifts/auto-schedule',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'NightShifts', id: 'LIST' }],
        }),

        // Create shift report
        createShiftReport: builder.mutation({
            query: (data) => ({
                url: '/shift-reports',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: [{ type: 'ShiftReports', id: 'LIST' }],
        }),

        // Get shift statistics
        getShiftStatistics: builder.query({
            query: (params = {}) => ({
                url: '/statistics/shifts',
                method: 'GET',
                params: {
                    startDate: params.startDate,
                    endDate: params.endDate,
                },
            }),
            providesTags: ['ShiftStatistics'],
        }),

        // Get nurse earnings
        getNurseEarnings: builder.query({
            query: ({ nurseId, ...params }) => ({
                url: `/statistics/nurse-earnings/${nurseId}`,
                method: 'GET',
                params,
            }),
            providesTags: (result, error, { nurseId }) => [
                { type: 'NurseEarnings', id: nurseId },
            ],
        }),
        getShiftReports: builder.query({
            query: (filters) => ({
                url: '/statistics/reports',
                params: {
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo,
                    nurseId: filters.nurseId || undefined,
                },
            }),
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetNursesQuery,
    useGetNightShiftsQuery,
    useCreateNightShiftMutation,
    useUpdateNightShiftMutation,
    useDeleteNightShiftMutation,
    useRemoveNurseFromShiftMutation,
    useStartShiftMutation,
    useEndShiftMutation,
    useAutoScheduleShiftsMutation,
    useCreateShiftReportMutation,
    useGetShiftStatisticsQuery,
    useGetNurseEarningsQuery,
    useGetShiftReportsQuery
} = nursesApi;