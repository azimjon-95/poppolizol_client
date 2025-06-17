import { api } from "./api";

export const attendanceApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getDailyReport: builder.query({
            query: (date) => `/daily-report?date=${date}`,
            transformResponse: (response) => response.data,

        }),

        // get('/employee-history/:employee_id',
        getEmployeeHistory: builder.query({
            query: (employeeId) => `/employee-history/${employeeId}`,
            transformResponse: (response) => response.data,
        }),
    }),
});
export const { useGetDailyReportQuery, getEmployeeHistory } = attendanceApi;