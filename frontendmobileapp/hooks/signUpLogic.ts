import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { setLoginStateAction, LoginState, increasePageNo, decreasePageNo } from '../app/store/authSlice';
import theme from '@/Styles/Variables';

export const useSignup = () => {
  const dispatch = useAppDispatch();
   const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passwordBdColor, setPasswordBdColor] = useState(['#ccc', theme.colors.primaryBlue]);
  const [emailBdColor, setEmailBdColor] = useState(['#ccc', theme.colors.primaryBlue]);
  
  const handleUsernameChange = (input: string) => setUsername(input);
  const handlePasswordChange = (input: string) => setPassword(input);
  const handleConfirmPassword = (input: string) => setConfirmPassword(input);
  const handleEmailChange = (input: string) => setEmail(input);
  const handlePhoneChange = (input: string) => setPhone(input);
  const handleFirstNameChange = (input: string) => setFirstName(input);
  const handleLastNameChange = (input: string) => setLastName(input);

  const pageNumber = useAppSelector((state) => state.auth.SignupPageNo );
 
  const handleLoginStateChange = (action: string) => {
    action == 'sign-up' ? 
    dispatch(setLoginStateAction(LoginState.SIGN_UP)) : 
    dispatch(setLoginStateAction(LoginState.LOGGED_OUT))
  }

  const validateInputs = (page: number) => {
    if (page == 1) {
      if (password && password === confirmPassword) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return [emailPattern.test(email), 'email'];
      }
      else {
        return [false, 'password'];
      }
    }
    else {
      if (username){
        const phoneNumberPattern = /^0\d{10}$/;
        return [phoneNumberPattern.test(phone), 'phone'];
      }
      else {
        return [false, 'username'];
      }
    }
  };

  const moveToNext = () => {
    const [result, field] = validateInputs(1);
    if (result){
        dispatch(increasePageNo(pageNumber))
    }
    else {
      if (field == 'password') {
        setPasswordBdColor(['red', 'red']);
        setEmailBdColor(['#ccc', theme.colors.primaryBlue])
      }
      else if (field == 'email') {
        setEmailBdColor(['red', 'red']);
        setPasswordBdColor(['#ccc', theme.colors.primaryBlue]);
      }
    }
    
  };

  const moveToPrevious = () => {
     
    dispatch(decreasePageNo(pageNumber))
  };
  
  const handleSignup = () => {
    //to be done
  };

  

  return {
    email,
    password,
    confirmPassword,
    pageNumber,
    emailBdColor,
    passwordBdColor,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPassword,
    handleEmailChange,
    handlePhoneChange,
    handleFirstNameChange,
    handleLastNameChange,
    handleLoginStateChange,
    handleSignup,
    validateInputs,
    moveToNext,
    moveToPrevious,
  };
};