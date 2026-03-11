
import axios from "axios";
import { Provider } from "react-redux";
import store from "./store/store";
import App from "./App";

const envBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || "").trim();
export const BASE_URL = (envBaseUrl || "http://localhost:5000").replace(/\/+$/, "");

const Login = () => {
  axios.defaults.baseURL = BASE_URL;

  return (
    <Provider store={store}>
      <App></App>
    </Provider>
  );
};

export default Login;
