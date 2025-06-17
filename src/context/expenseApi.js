import { api } from "./api";

export const expenseApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createExpense: builder.mutation({
            query: (expense) => ({
                url: '/expense/create',
                method: 'POST',
                body: expense,
            }),
            invalidatesTags: ['Expenses'],
        }),
        getExpenses: builder.query({
            query: () => '/expense/all',
        },
            {
                providesTags: ['Expenses'],
            }
        ),
    }),
});

export const { useCreateExpenseMutation, useGetExpensesQuery } = expenseApi;