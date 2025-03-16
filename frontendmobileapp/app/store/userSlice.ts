import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: { name: " ",
        email: "",
        userID: "",
        profileImage: "",
    }, 
    reducers: {
        setUser: (state, action) => {
            return {...state, ...action.payload};
        },
    clearUser: () => ({
        name: " ",
        email: "",
        userID: "",
        profileImage: "",
    })
    },
})

export const { setUser, clearUser } = userSlice.actions; 
export default userSlice.reducer;