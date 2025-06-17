import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    selectedMonth: '2025-01', // Default value
};

const monthSlice = createSlice({
    name: 'month',
    initialState,
    reducers: {
        setSelectedMonth: (state, action) => {
            state.selectedMonth = action.payload;
        },
    },
});

export const { setSelectedMonth } = monthSlice.actions;
export default monthSlice.reducer;