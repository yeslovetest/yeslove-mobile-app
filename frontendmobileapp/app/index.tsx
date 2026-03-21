
import axios from "axios";
import { Provider } from "react-redux";
import store from "./store/store";
import App from "./App";
import BASE_URL from "./config/baseUrl";

const Login = () => {
  axios.defaults.baseURL = BASE_URL;

  return (
    <Provider store={store}>
      <App></App>
    </Provider>
  );
};

export default Login;
