
import axios from "axios";
import { Provider } from "react-redux";
import store from "./store/store";
import App from "./App";

const Login = () => {
  axios.defaults.baseURL = "http://localhost:5000";

  return (
    <Provider store={store}>
      <App></App>
    </Provider>
  );
};

export default Login;
