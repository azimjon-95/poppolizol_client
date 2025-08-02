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
            query: ({ startDate, endDate }) => ({
                url: `/production-history?startDate=${startDate}&endDate=${endDate}`,
                method: "GET",
            }),
            transformResponse: (response) => response.innerData, // Extract innerData from response
            providesTags: ["ProductionHistory"], // For cache invalidation
        }),

        // Initiate production process
        startProductionProcess: builder.mutation({
            query: (
                {
                    productNormaId,
                    productName,
                    quantityToProduce,
                    defectiveDescription,
                    defectiveReason,
                    isDefective,
                    consumedMaterials,
                    materialStatistics
                }
            ) => ({
                url: "/production-process",
                method: "POST",
                body: {
                    productNormaId,
                    productName,
                    quantityToProduce,
                    consumedMaterials,
                    materialStatistics,
                    defectiveDescription,
                    defectiveReason,
                    isDefective,
                },
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

        //router.post("/production/salesBN5",
        productionForSalesBN5: builder.mutation({
            query: (data) => ({
                url: "/production/salesBN5",
                method: "POST",
                body: data,
            }),
            transformResponse: (response) => response.innerData, // Extract innerData from response
            invalidatesTags: ["FinishedProducts", "ProductionHistory"], // Invalidate related caches
        }),

        // router.get("/production/inventory",
        getInventory: builder.query({

            query: ({ startDate, endDate }) => ({
                url: `/inventory?startDate=${startDate || new Date().toISOString().split('T')[0]}&endDate=${endDate || new Date().toISOString().split('T')[0]}`,
                method: "GET",
            }),
            providesTags: ["Inventory"], // For cache invalidation
        }),

        // router.put("/finished-products/:id", productionSystem.updateFinished);
        // router.delete("/finished-products/:id", productionSystem.deleteFinished);
        updateFinished: builder.mutation({
            query: ({ id, data }) => ({
                url: `/finished-products/${id}`,
                method: "PUT",
                body: data,
            }),
            transformResponse: (response) => response.innerData, // Extract innerData from response
            invalidatesTags: ["FinishedProducts"], // Invalidate related caches
        }),

        deleteFinished: builder.mutation({
            query: (id) => ({
                url: `/finished-products/${id}`,
                method: "DELETE",
            }),
            transformResponse: (response) => response.innerData, // Extract innerData from response
            invalidatesTags: ["FinishedProducts"], // Invalidate related caches
        }),

    }),
});

// Export hooks for usage in components
export const {
    useGetFinishedProductsQuery,
    useGetProductionHistoryQuery,
    useStartProductionProcessMutation,
    useCreateBn5ProductionMutation,
    useGetInventoryQuery,
    useProductionForSalesBN5Mutation,
    useUpdateFinishedMutation,
    useDeleteFinishedMutation
} = ProductionSystemApi;