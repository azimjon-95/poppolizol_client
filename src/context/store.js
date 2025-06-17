
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./actions/authSlice";
import searchSlice from "./actions/authSearch";
import patientSlice from "./actions/patientSlice"
import monthReducer from "./actions/monthSlice"


import { api } from "./api";

export const store = configureStore({
    reducer: {
        [api.reducerPath]: api.reducer,
        auth: authReducer,
        search: searchSlice,
        patient: patientSlice,
        month: monthReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(api.middleware),
});