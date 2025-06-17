import { api } from "./api";

export const materialApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getAllMaterials: builder.query({
      query: () => "/material/all",
      providesTags: ["Materials"],
    }),

    createMaterial: builder.mutation({
      query: (newMaterial) => ({
        url: "/material/create",
        method: "POST",
        body: newMaterial,
      }),
      invalidatesTags: ["Materials"],
    }),

    updateMaterial: builder.mutation({
      query: ({ id, body }) => ({
        url: `/material/update/${id}`,
        method: "PUT",
        body: body,
      }),
      invalidatesTags: ["Materials"],
    }),

    deleteMaterial: builder.mutation({
      query: (id) => ({
        url: `/material/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Materials"],
    }),
  }),
});
export const {
  useGetAllMaterialsQuery,
  useCreateMaterialMutation,
  useUpdateMaterialMutation,
  useDeleteMaterialMutation,
} = materialApi;
