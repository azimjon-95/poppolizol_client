import { api } from "./api";

export const expenseApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createExpense: builder.mutation({
            query: (expenseData) => ({
                url: '/expense',
                method: 'POST',
                body: expenseData,
            }),
            invalidatesTags: ['Expenses'],
        }),
        getExpenses: builder.query({
            query: ({ startDate, endDate } = {}) => ({
                url: '/expense',
                params: { startDate, endDate },
            }),
            providesTags: ['Expenses'],
        }),
        updateExpense: builder.mutation({
            query: ({ id, ...updates }) => ({
                url: `/expense/${id}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: ['Expenses'],
        }),
        deleteExpense: builder.mutation({
            query: (id) => ({
                url: `/expense/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Expenses'],
        }),
        getBalance: builder.query({
            query: () => ({
                url: '/balance'
            }),
            providesTags: ['Expenses'],
        }),
    }),
});

export const {
    useCreateExpenseMutation,
    useGetExpensesQuery,
    useUpdateExpenseMutation,
    useDeleteExpenseMutation,
    useGetBalanceQuery
} = expenseApi;