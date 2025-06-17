
// authSlice.js - Enhanced Redux slice with better state management
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    adminFullname: localStorage.getItem("admin_fullname") || null,
    role: localStorage.getItem("role") || null,
    token: localStorage.getItem("token") || null,
    isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { adminFullname, role, token } = action.payload;

            state.adminFullname = adminFullname;
            state.role = role;
            state.token = token;
            state.isAuthenticated = true;

            // Store in localStorage
            localStorage.setItem("admin_fullname", adminFullname);
            localStorage.setItem("role", role);
            localStorage.setItem("token", token);
        },

        logout: (state) => {
            // Clear Redux state
            state.adminFullname = null;
            state.role = null;
            state.token = null;
            state.isAuthenticated = false;

            // Clear localStorage
            const itemsToRemove = [
                "token",
                "role",
                "admin_fullname",
                "doctor",
                "activeSubPath",
                "activeMenu",
                "openMenus"
            ];

            itemsToRemove.forEach((item) => localStorage.removeItem(item));
        },

        // Action to check and restore auth state from localStorage
        restoreAuthState: (state) => {
            const token = localStorage.getItem("token");
            const role = localStorage.getItem("role");
            const adminFullname = localStorage.getItem("admin_fullname");

            if (token && role) {
                state.token = token;
                state.role = role;
                state.adminFullname = adminFullname;
                state.isAuthenticated = true;
            }
        }
    },
});

export const { setCredentials, logout, restoreAuthState } = authSlice.actions;
export default authSlice.reducer;