import { api } from "./api";

export const ProductionSystemApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get all finished products
        getFinishedProducts: builder.query({
            query: () => ({
                url: "/finished-products",
                method: "GET",
            }),
            transformResponse: (response) => response.innerData, // Extract innerData from response
            providesTags: ["FinishedProducts"], // For cache invalidation
        }),

        // Get production history
        getProductionHistory: builder.query({
            query: () => ({
                url: "/production-history",
                method: "GET",
            }),
            transformResponse: (response) => response.innerData, // Extract innerData from response
            providesTags: ["ProductionHistory"], // For cache invalidation
        }),

        // Initiate production process
        startProductionProcess: builder.mutation({
            query: ({ productNormaId, quantityToProduce, selectedMarket }) => ({
                url: "/production-process",
                method: "POST",
                body: { productNormaId, quantityToProduce, selectedMarket },
            }),
            transformResponse: (response) => response.innerData, // Extract innerData from response
            invalidatesTags: ["FinishedProducts", "ProductionHistory"], // Invalidate related caches
        }),

        //router.post("/production/bn5"
        createBn5Production: builder.mutation({
            query: (data) => ({
                url: "/production/bn5",
                method: "POST",
                body: data,
            }),
            transformResponse: (response) => response.innerData, // Extract innerData from response
            invalidatesTags: ["FinishedProducts", "ProductionHistory"], // Invalidate related caches
        }),
    }),
});

// Export hooks for usage in components
export const {
    useGetFinishedProductsQuery,
    useGetProductionHistoryQuery,
    useStartProductionProcessMutation,
    useCreateBn5ProductionMutation
} = ProductionSystemApi;