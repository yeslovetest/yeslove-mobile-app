import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: { name: " ", id: ""}, //defines initial state
    reducers: {
        setName: (state, action) => {
            state.name = action.payload; // updates name state
        },
        setUserId: (state, action) => {
            state.id = action.payload;
        },
    },
})

export const { setName, setUserId } = userSlice.actions; 
export default userSlice.reducer;