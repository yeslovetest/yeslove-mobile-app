import { LoginRequest, SignupRequest } from "@/generated-api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";


export enum LoginState{
    LOADING = "LOADING",
    LOGGED_IN = "LOGGED_IN",
    LOGGED_OUT = "LOGGED_OUT",
    SIGN_UP = "SIGN_UP"
}

const SignupPageNo = 1;
const authSlice = createSlice({
    name: "auth",
    initialState: { loginState: LoginState.LOADING, SignupPageNo: 1, signupEmail: '', signupPassword: '', signupResponse: ""}, //defines initial state
    reducers: {
        setLoginStateAction: (state, action: PayloadAction<LoginState>) => {
            state.loginState = action.payload; 
        },
        logInAction: (state, action: PayloadAction<LoginRequest>) => {},
        attemptRefreshFromLocalStorageAction: (state, action: PayloadAction<void>) => {},
        increasePageNo: (state, action: PayloadAction<number>) => {
            state.SignupPageNo = action.payload + 1;
        },
        decreasePageNo: (state, action: PayloadAction<number>) => {
            state.SignupPageNo = action.payload - 1;
        },
        signupAction: (state, action: PayloadAction<SignupRequest>) => {},
        setSignupMessage: (state, action: PayloadAction<string>) => {
            state.signupResponse = action.payload;
        },
        setSignupEmail: (state, action: PayloadAction<string>) => {
            state.signupEmail = action.payload;
        },
        setSignupPassword: (state, action: PayloadAction<string>) => {
            state.signupPassword = action.payload;
        },
        
    },
})

export const { setLoginStateAction, logInAction, attemptRefreshFromLocalStorageAction, increasePageNo, decreasePageNo, signupAction, setSignupMessage,
     setSignupEmail, setSignupPassword} = authSlice.actions; 
export default authSlice.reducer;