import { LoginRequest } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Router } from "expo-router";

export enum LoginState{
    LOADING = "LOADING",
    LOGGED_IN = "LOGGED_IN",
    LOGGED_OUT = "LOGGED_OUT",
    SIGN_UP = "SIGN_UP"
}

const authSlice = createSlice({
    name: "auth",
    initialState: { loginState: LoginState.LOADING}, //defines initial state
    reducers: {
        setLoginStateAction: (state, action: PayloadAction<LoginState>) => {
            state.loginState = action.payload; 
        },
        logInAction: (state, action: PayloadAction<LoginRequest>) => {},
        attemptRefreshFromLocalStorageAction: (state, action: PayloadAction<void>) => {},
    },
})

export const { setLoginStateAction, logInAction, attemptRefreshFromLocalStorageAction} = authSlice.actions; 
export default authSlice.reducer;