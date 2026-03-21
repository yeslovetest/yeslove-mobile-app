
import axios from "axios";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import store from "./store/store";
import App from "./App";
import { BASE_URL } from "./config/baseUrl";

const Login = () => {
  axios.defaults.baseURL = BASE_URL;

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <App></App>
      </Provider>
    </SafeAreaProvider>
  );
};

export default Login;
