import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import store from "./store/store";
import App from "./App";
import { configureHttpClient, registerAuthFailureHandler } from "./config/httpClient";
import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";
import { LoginState, setErrorMessage, setLoginStateAction } from "./store/Auth-store/authSlice";

// Configure the shared axios instance once, before any request is made.
configureHttpClient();

// When reactive token refresh fails, stop the refresh loop and route to sign-in.
registerAuthFailureHandler(() => {
  TOKEN_REFRESH_SERVICE.stopRefreshingToken();
  store.dispatch(setErrorMessage("Your session has expired. Please sign in again."));
  store.dispatch(setLoginStateAction(LoginState.LOGGED_OUT));
});

const Login = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <App></App>
      </Provider>
    </SafeAreaProvider>
  );
};

export default Login;
