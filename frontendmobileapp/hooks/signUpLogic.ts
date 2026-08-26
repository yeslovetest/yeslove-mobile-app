import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/store/hooks";
import {
  setLoginStateAction,
  LoginState,
  increasePageNo,
  decreasePageNo,
  signupAction,
  setSignupEmail,
  setSignupConfirmEmail,
  setSignupPassword,
  setSignupConfirmPassword,
  setSignupMessage,
  setErrorMessage,
  setLastSignupPayload,
} from "../app/store/Auth-store/authSlice";
import { theme } from "@/app/theme";

export const useSignup = () => {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const initialBdColor = [theme.colors.border, theme.colors.primary];
  const [passwordBdColor, setPasswordBdColor] = useState(initialBdColor);
  const [emailBdColor, setEmailBdColor] = useState(initialBdColor);
  const [confirmEmailBdColor, setConfirmEmailBdColor] = useState(initialBdColor);
  const [usernameBdColor, setUsernameBdColor] = useState(initialBdColor);
  const [firstNameBdColor, setFirstNameBdColor] = useState(initialBdColor);
  const [lastNameBdColor, setLastNameBdColor] = useState(initialBdColor);

  const handleUsernameChange = (input: string) => setUsername(input);
  const handlePasswordChange = (input: string) => setPassword(input);
  const handleConfirmPassword = (input: string) => setConfirmPassword(input);
  const handleEmailChange = (input: string) => setEmail(input);
  const handleConfirmEmailChange = (input: string) => setConfirmEmail(input);
  const handleFirstNameChange = (input: string) => setFirstName(input);
  const handleLastNameChange = (input: string) => setLastName(input);

  const pageNumber = useAppSelector((state) => state.auth.SignupPageNo);
  const signupConfirmEmail = useAppSelector((state) => state.auth.signupConfirmEmail);

  const handleLoginStateChange = (action: string) => {
    if (action == "sign-up") {
      dispatch(setLoginStateAction(LoginState.SIGN_UP));
    } else if (action == "login") {
      dispatch(setLoginStateAction(LoginState.LOGGED_OUT));
    } else if (action == "refresh-login") {
      dispatch(setLoginStateAction(LoginState.LOGGED_OUT));
      dispatch(decreasePageNo(2));
    }
  };

  const validateInputs = (page: number) => {
    if (page == 1) {
      // Validate password pair before validating email fields.
      if (!password || password.length < 6) {
        return [false, "passwordLength"];
      }

      if (password !== confirmPassword) {
        return [false, "password"];
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email) || !emailPattern.test(confirmEmail)) {
        return [false, "email"];
      }

      if (email.trim().toLowerCase() !== confirmEmail.trim().toLowerCase()) {
        return [false, "confirmEmail"];
      }

      return [true, "email"];
    } else {
      if (!username) {
        return [false, "username"];
      } else if (!firstName) {
        return [false, "firstName"];
      } else if (!lastName) {
        return [false, "lastName"];
      } else {
        return [true, "lastName"];
      }
    }
  };

  const moveToNext = () => {
    const [result, field] = validateInputs(1);
    if (result) {
      dispatch(increasePageNo(pageNumber));
      dispatch(setSignupEmail(email));
      dispatch(setSignupConfirmEmail(confirmEmail));
      dispatch(setSignupPassword(password));
      dispatch(setSignupConfirmPassword(confirmPassword));
    } else if (field == "passwordLength") {
      setPasswordBdColor([theme.colors.danger, theme.colors.danger]);
      setEmailBdColor(initialBdColor);
      setConfirmEmailBdColor(initialBdColor);
      dispatch(setErrorMessage("Password must be at least 6 characters."));
    } else if (field == "password") {
      setPasswordBdColor([theme.colors.danger, theme.colors.danger]);
      setEmailBdColor(initialBdColor);
      setConfirmEmailBdColor(initialBdColor);
      dispatch(setErrorMessage("Password confirmation does not match."));
    } else if (field == "email") {
      setEmailBdColor([theme.colors.danger, theme.colors.danger]);
      setConfirmEmailBdColor([theme.colors.danger, theme.colors.danger]);
      setPasswordBdColor([theme.colors.border, theme.colors.primary]);
      dispatch(setErrorMessage("Invalid Field: Email or Confirm Email."));
    } else if (field == "confirmEmail") {
      setConfirmEmailBdColor([theme.colors.danger, theme.colors.danger]);
      setEmailBdColor(initialBdColor);
      setPasswordBdColor(initialBdColor);
      dispatch(setErrorMessage("Email and confirm email do not match."));
    }
  };

  const moveToPrevious = () => {
    dispatch(decreasePageNo(pageNumber));
  };

  const handleSignup = (email: string, password: string, confirmPassword: string) => {
    const [result, field] = validateInputs(2);
    if (result) {
      let confirm_password = confirmPassword;
      let first_name = firstName;
      let last_name = lastName;
      // Persist exact request body so the failure screen can retry immediately.
      const signupPayload = {
        email,
        // Use the value user confirmed on Page 1; fallback keeps old state compatible.
        confirm_email: signupConfirmEmail || email,
        password,
        confirm_password,
        first_name,
        last_name,
        // Phone number is no longer collected in the app; send empty to satisfy the API contract.
        phone_number: "",
        username,
      };

      dispatch(setSignupMessage(""));
      dispatch(setLastSignupPayload(signupPayload));
      dispatch(signupAction(signupPayload));
      dispatch(increasePageNo(pageNumber));
    } else if (field == "username") {
      setUsernameBdColor([theme.colors.danger, theme.colors.danger]);
      setFirstNameBdColor(initialBdColor);
      setLastNameBdColor(initialBdColor);
      dispatch(setErrorMessage("Empty Field: Please type in username."));
    } else if (field == "firstName") {
      setFirstNameBdColor([theme.colors.danger, theme.colors.danger]);
      setUsernameBdColor(initialBdColor);
      setLastNameBdColor(initialBdColor);
      dispatch(setErrorMessage("Empty Field: Please type in first name."));
    } else if (field == "lastName") {
      setLastNameBdColor([theme.colors.danger, theme.colors.danger]);
      setUsernameBdColor(initialBdColor);
      setFirstNameBdColor(initialBdColor);
      dispatch(setErrorMessage("Empty Field: Please type in last name."));
    }
  };

  return {
    email,
    confirmEmail,
    password,
    confirmPassword,
    pageNumber,
    emailBdColor,
    confirmEmailBdColor,
    passwordBdColor,
    usernameBdColor,
    firstNameBdColor,
    lastNameBdColor,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPassword,
    handleEmailChange,
    handleConfirmEmailChange,
    handleFirstNameChange,
    handleLastNameChange,
    handleLoginStateChange,
    handleSignup,
    validateInputs,
    moveToNext,
    moveToPrevious,
  };
};
