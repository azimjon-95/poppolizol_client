import { api } from "./api";

export const alarApi = api.injectEndpoints({
    endpoints: (builder) => ({
        getAllEmployeesSalaryInfo: builder.query({
            query: ({ month, year }) => `/employees/${month}/${year}`,
        }),
        getEmployeeSalaryInfo: builder.query({
            query: ({ employeeId, month, year }) => `/employee/${employeeId}/${month}/${year}`,
        }),
        paySalary: builder.mutation({
            query: (data) => ({
                url: "/pay",
                method: "POST",
                body: data,
            }),
        }),
        addPenalty: builder.mutation({
            query: (data) => ({
                url: "/penalty",
                method: "POST",
                body: data,
            }),
        }),
        getMonthlySalaryReport: builder.query({
            query: ({ month, year }) => `/report/${month}/${year}`,
        }),
        getEmployeePenalties: builder.query({
            query: ({ employeeId, month, year }) =>
                `/penalties/${employeeId}/${month}/${year}`,
        }),
        handleOverpayment: builder.mutation({
            query: (data) => ({
                url: "/overpayment",
                method: "POST",
                body: data,
            }),
        }),
    }),
});

export const {
    useGetAllEmployeesSalaryInfoQuery,
    useGetEmployeeSalaryInfoQuery,
    usePaySalaryMutation,
    useAddPenaltyMutation,
    useGetMonthlySalaryReportQuery,
    useGetEmployeePenaltiesQuery,
    useHandleOverpaymentMutation,
} = alarApi;
