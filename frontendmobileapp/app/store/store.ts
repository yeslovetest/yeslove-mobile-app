import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./Profile-store/userSlice";
import profileReducer from "./Profile-store/profileSlice";
import feedReducer from "./Home-store/feedSlice";
import authReducer from "./Auth-store/authSlice";
import eventsReducer from "./Events-store/eventsSlice";
import getHelpReducer from "./Get-help-store/getHelpSlice";
import chatReducer from "./Chat/chatSlice";
import createSagaMiddleWare from "redux-saga"
import appSaga from "./Effects/effects";
import { navigationReducer } from "./Navigation/navigationSlice";

//const createSagaMiddleWare = require('redux-saga').default;
export const sagaMiddleWare = createSagaMiddleWare();

export const store = configureStore({
    reducer: { 
        user: userReducer,
        profile: profileReducer,
        feed: feedReducer,
        navigation: navigationReducer,
        auth: authReducer,
        events: eventsReducer,
        getHelp: getHelpReducer,
        chat: chatReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleWare)
})

sagaMiddleWare.run(appSaga)

export type State = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch;

export default store;