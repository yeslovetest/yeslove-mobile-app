import { useState } from 'react';
import { useAppDispatch } from '../app/store/hooks';
import { logInAction, setLoginStateAction, LoginState, setErrorMessage } from '../app/store/Auth-store/authSlice';
import axios from 'axios';
import theme from '@/assets/variables/Variables';
import { activateLoadingScreen } from '@/app/store/Profile-store/profileSlice';
import { BASE_URL } from '@/constants/api';

axios.defaults.baseURL = BASE_URL;

export const useLogin = () => {
  const dispatch = useAppDispatch();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleUsernameChange = (input: string) => setUsername(input);
  const handlePasswordChange = (input: string) => setPassword(input);

  const initialBdColor = ['#ccc', theme.colors.primaryBlue];
  const [passwordBdColor, setPasswordBdColor] = useState(initialBdColor);
  const [usernameBdColor, setUsernameBdColor] = useState(initialBdColor);

  const validateInputs = () => {
  
    if (!username){
      return [false, 'username'];
    }
    else if (!password) {
      return [false, 'password'];
    }
    else {
      return [true, ''];
    }
  }

  const handleLogin = () => {
    const [result, field] = validateInputs();
    if (result){
      dispatch(logInAction({ username, password }));
      dispatch(activateLoadingScreen(true));
    }
    else if (field == 'username') {
      setUsernameBdColor(['red', 'red']);
      setPasswordBdColor(['#ccc', theme.colors.primaryBlue]);
      dispatch(setErrorMessage('Empty Field: Please type in username.'));
    }
    else if (field == 'password') {
      setPasswordBdColor(['red', 'red']);
      setUsernameBdColor(['#ccc', theme.colors.primaryBlue]);
      dispatch(setErrorMessage('Empty Field: Please type in password.'));
    }  
  };

  const handleLoginStateChange = (action: string) => {
    action == 'sign-up' ? 
    dispatch(setLoginStateAction(LoginState.SIGN_UP)) : 
    dispatch(setLoginStateAction(LoginState.LOGGED_OUT))
  };


  


  return {
    username,
    password,
    passwordBdColor,
    usernameBdColor,
    handleUsernameChange,
    handlePasswordChange,
    handleLogin,
    handleLoginStateChange,
  };
};
