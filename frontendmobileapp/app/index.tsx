
import axios from "axios";
import { Provider } from "react-redux";
import store from "./store/store";
import App from "./App";

export const BASE_URL = "http://localhost:5000";

const Login = () => {
  axios.defaults.baseURL = BASE_URL;

  return (
    <Provider store={store}>
      <App></App>
    </Provider>
  );
};

export default Login;
