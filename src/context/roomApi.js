import { api } from "./api";

export const roomApi = api.injectEndpoints({
    endpoints: (builder) => ({
        createRoom: builder.mutation({
            query: (roomData) => ({
                url: "/room/create",
                method: "POST",
                body: roomData,
            }),
            invalidatesTags: [{ type: "Room", id: "LIST" }],
        }),

        getRooms: builder.query({
            query: () => "/room/all",
            providesTags: [{ type: "Room", id: "LIST" }],
        }),

        getRoomStories: builder.query({
            query: () => "/room/stories",
            providesTags: [{ type: "Room", id: "STORIES" }],
        }),

        getRoomById: builder.query({
            query: (id) => `/room/${id}`,
            providesTags: (result, error, id) => [{ type: "Room", id }],
        }),

        updateRoom: builder.mutation({
            query: ({ id, ...roomData }) => ({
                url: `/room/update/${id}`,
                method: "PUT",
                body: roomData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Room", id },
                { type: "Room", id: "LIST" },
            ],
        }),

        deleteRoom: builder.mutation({
            query: (id) => ({
                url: `/room/delete/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Room", id: "LIST" }],
        }),

        closeRoom: builder.mutation({
            query: (id) => ({
                url: `/room/closeRoom/${id}`,
                method: "PATCH",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "Room", id },
                { type: "Room", id: "LIST" },
            ],
        }),

        addPatientToRoom: builder.mutation({
            query: ({ id, ...patientData }) => ({
                url: `/room/addPatient/${id}`,
                method: "PATCH",
                body: patientData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Room", id },
                { type: "Room", id: "LIST" },
            ],
        }),

        removePatientFromRoom: builder.mutation({
            query: ({ id, ...patientData }) => ({
                url: `/room/removePatient/${id}`,
                method: "POST",
                body: patientData,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Room", id },
                { type: "Room", id: "LIST" },
            ],
        }),

        payForRoom: builder.mutation({
            query: (paymentData) => ({
                url: "/room/pay",
                method: "POST",
                body: paymentData,
            }),
            invalidatesTags: [{ type: "Room", id: "LIST" }],
        }),


        changeTreatingDays: builder.mutation({
            query: (daysData) => ({
                url: "/roomStory/changeDays",
                method: "PATCH",
                body: daysData,
            }),
            invalidatesTags: [{ type: "Room", id: "STORIES" }],
        }),
        updateRoomCleanStatus: builder.mutation({
            query: ({ id, isCleaned }) => ({
                url: `/roomStatus/update/${id}`,
                method: "PUT",
                body: { isCleaned },
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "Room", id },
                { type: "Room", id: "LIST" },
            ],
        }),
    }),
});

export const {
    useCreateRoomMutation,
    useGetRoomsQuery,
    useGetRoomStoriesQuery,
    useGetRoomByIdQuery,
    useUpdateRoomMutation,
    useDeleteRoomMutation,
    useCloseRoomMutation,
    useAddPatientToRoomMutation,
    useRemovePatientFromRoomMutation,
    usePayForRoomMutation,
    useChangeTreatingDaysMutation,
    useUpdateRoomCleanStatusMutation
} = roomApi;