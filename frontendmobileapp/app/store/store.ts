import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import profileReducer from "./profileSlice";
import feedReducer from "./feedSlice";
import authReducer from "./authSlice";
import eventsReducer from "./eventsSlice"
import createSagaMiddleWare from "redux-saga"
import appSaga from "./effects";
import { navigationReducer } from "./navigationSlice";

export const sagaMiddleWare = createSagaMiddleWare();

export const store = configureStore({
    reducer: { 
        user: userReducer,
        profile: profileReducer,
        feed: feedReducer,
        navigation: navigationReducer,
        auth: authReducer,
        events: eventsReducer
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleWare)
})

sagaMiddleWare.run(appSaga)

export type State = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export default store