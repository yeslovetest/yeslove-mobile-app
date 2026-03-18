import { LoginRequest, SignupRequest, ChangePasswordRequest, DeleteAccountRequest } from "@/generated-api";
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
    initialState: { loginState: LoginState.LOADING, SignupPageNo: 1, 
        signupEmail: '', signupConfirmEmail: '', signupPassword: '', signupConfirmPassword: '', 
        signupResponse: "",  errorMessage: '', message: '',
        // Keep the latest signup request payload for one-tap retry on error screens.
        lastSignupPayload: null as SignupRequest | null,
        // Prevent duplicate signup calls while a request is in-flight.
        isSignupSubmitting: false}, //defines initial state
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
        setSignupSubmitting: (state, action: PayloadAction<boolean>) => {
            state.isSignupSubmitting = action.payload;
        },
        setLastSignupPayload: (state, action: PayloadAction<SignupRequest | null>) => {
            state.lastSignupPayload = action.payload;
        },
        setSignupMessage: (state, action: PayloadAction<string>) => {
            state.signupResponse = action.payload;
        },
        setSignupEmail: (state, action: PayloadAction<string>) => {
            state.signupEmail = action.payload;
        },
        setSignupConfirmEmail: (state, action: PayloadAction<string>) => {
            state.signupConfirmEmail = action.payload;
        },
        setSignupPassword: (state, action: PayloadAction<string>) => {
            state.signupPassword = action.payload;
        },
        setSignupConfirmPassword: (state, action: PayloadAction<string>) => {
            state.signupConfirmPassword = action.payload;
        },
        setErrorMessage: (state, action: PayloadAction<string>) => {
            state.errorMessage = action.payload;
        },
        setUserPassword: (state, action: PayloadAction<ChangePasswordRequest>) => {},
        setMessage: (state, action: PayloadAction<string>) => {
            state.message = action.payload;
        },
        setDeleteConfirmation: (state, action: PayloadAction<DeleteAccountRequest>) => {},
        logoutAction: (state, action: PayloadAction<string>) => {},
    },
})

export const { setLoginStateAction, logInAction, attemptRefreshFromLocalStorageAction, increasePageNo, decreasePageNo, signupAction, setSignupMessage,
    setSignupEmail, setSignupConfirmEmail, setSignupPassword, setSignupConfirmPassword, 
    setErrorMessage, setUserPassword, setMessage, setDeleteConfirmation, logoutAction,
    setLastSignupPayload, setSignupSubmitting} = authSlice.actions; 
export default authSlice.reducer;