import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: { name: " ", id: "", password: "" }, //defines initial state
    reducers: {
        setName: (state, action) => {
            state.name = action.payload; // updates name state
        },
        setUserId: (state, action) => {  // user's keycloak id
            state.id = action.payload;
        },
        setPassword: (state, action) => {
            state.password = action.payload;
        }
    },
})

export const { setName, setUserId, setPassword } = userSlice.actions; 
export default userSlice.reducer;