import { useState } from "react";
import { useAppDispatch } from "../app/store/hooks";
import {
  logInAction,
  setLoginStateAction,
  LoginState,
  setErrorMessage,
} from "../app/store/Auth-store/authSlice";
import axios from "axios";
import { theme } from "@/app/theme";
import { activateLoadingScreen } from "@/app/store/Profile-store/profileSlice";
import { BASE_URL } from "@/app/config/baseUrl";

axios.defaults.baseURL = BASE_URL;

type LoginIdentifierMode = "username" | "email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useLogin = () => {
  const dispatch = useAppDispatch();

  const [identifierMode, setIdentifierMode] = useState<LoginIdentifierMode>("username");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const initialBdColor = [theme.colors.border, theme.colors.primary];
  const [passwordBdColor, setPasswordBdColor] = useState(initialBdColor);
  const [identifierBdColor, setIdentifierBdColor] = useState(initialBdColor);

  const handleIdentifierModeChange = (mode: LoginIdentifierMode) => {
    setIdentifierMode(mode);
    setIdentifier("");
    setIdentifierBdColor(initialBdColor);
    setPasswordBdColor(initialBdColor);
    dispatch(setErrorMessage(""));
  };

  const handleIdentifierChange = (input: string) => {
    setIdentifier(input);
    setIdentifierBdColor(initialBdColor);
  };

  const handlePasswordChange = (input: string) => {
    setPassword(input);
    setPasswordBdColor(initialBdColor);
  };

  const validateInputs = (): [boolean, string] => {
    const normalizedIdentifier = identifier.trim();

    if (!normalizedIdentifier) {
      return [false, "identifierRequired"];
    }

    if (identifierMode === "email" && !EMAIL_REGEX.test(normalizedIdentifier)) {
      return [false, "emailFormat"];
    }

    if (identifierMode === "username" && normalizedIdentifier.includes("@")) {
      return [false, "usernameFormat"];
    }

    if (!password) {
      return [false, "password"];
    }

    return [true, ""];
  };

  const handleLogin = () => {
    const [result, field] = validateInputs();
    if (result) {
      const normalizedIdentifier = identifier.trim();
      dispatch(logInAction({ username: normalizedIdentifier, password }));
      dispatch(activateLoadingScreen(true));
    } else if (field == "identifierRequired") {
      setIdentifierBdColor([theme.colors.danger, theme.colors.danger]);
      setPasswordBdColor([theme.colors.border, theme.colors.primary]);
      dispatch(
        setErrorMessage(
          identifierMode === "email"
            ? "Empty Field: Please type in email."
            : "Empty Field: Please type in username.",
        ),
      );
    } else if (field == "emailFormat") {
      setIdentifierBdColor([theme.colors.danger, theme.colors.danger]);
      setPasswordBdColor([theme.colors.border, theme.colors.primary]);
      dispatch(setErrorMessage("Invalid email format. Please enter a valid email address."));
    } else if (field == "usernameFormat") {
      setIdentifierBdColor([theme.colors.danger, theme.colors.danger]);
      setPasswordBdColor([theme.colors.border, theme.colors.primary]);
      dispatch(
        setErrorMessage("Username cannot contain @. Switch to Email to sign in with email."),
      );
    } else if (field == "password") {
      setPasswordBdColor([theme.colors.danger, theme.colors.danger]);
      setIdentifierBdColor([theme.colors.border, theme.colors.primary]);
      dispatch(setErrorMessage("Empty Field: Please type in password."));
    }
  };

  const handleLoginStateChange = (action: string) => {
    action == "sign-up"
      ? dispatch(setLoginStateAction(LoginState.SIGN_UP))
      : dispatch(setLoginStateAction(LoginState.LOGGED_OUT));
  };

  return {
    identifier,
    identifierMode,
    password,
    passwordBdColor,
    identifierBdColor,
    handleIdentifierModeChange,
    handleIdentifierChange,
    handlePasswordChange,
    handleLogin,
    handleLoginStateChange,
  };
};
