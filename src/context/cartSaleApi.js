import { api } from "./api";

// Define the API slice for sales
export const cartSaleApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Create a new sale
        createCartSale: builder.mutation({
            query: (saleData) => ({
                url: '/sales',
                method: 'POST',
                body: saleData,
            }),
            invalidatesTags: ['Sale'],
        }),

        // Get a sale by ID
        getSaleCartById: builder.query({
            query: (id) => `/sales/${id}`,
            providesTags: (result, error, id) => [{ type: 'Sale', id }],
        }),

        // Update a sale
        updateCartSale: builder.mutation({
            query: ({ id, ...saleData }) => ({
                url: `/sales/${id}`,
                method: 'PUT',
                body: saleData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Sale', id }],
        }),

        // Delete a sale
        deleteCartSale: builder.mutation({
            query: (id) => ({
                url: `/sales/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Sale'],
        }),

        // Mark a sale as delivered
        markAsDelivered: builder.mutation({
            query: (id) => ({
                url: `/sales/${id}/delivered`,
                method: 'PATCH',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Sale', id }],
        }),

        // Process debt payment
        payDebt: builder.mutation({
            query: ({ id, ...paymentData }) => ({
                url: `/sales/${id}/pay-debt`,
                method: 'POST',
                body: paymentData,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Sale', id }],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useCreateCartSaleMutation,
    useGetSaleCartByIdQuery,
    useUpdateCartSaleMutation,
    useDeleteCartSaleMutation,
    useMarkAsDeliveredMutation,
    usePayDebtMutation,
} = cartSaleApi;