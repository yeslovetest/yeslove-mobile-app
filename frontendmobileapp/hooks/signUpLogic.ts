import { useState } from 'react';
import { useAppDispatch } from '../app/store/hooks';
import { setLoginStateAction, LoginState } from '../app/store/authSlice';

export const useSignup = () => {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleUsernameChange = (input: string) => setUsername(input);
  const handlePasswordChange = (input: string) => setPassword(input);
  const handleConfirmPassword = (input: string) => setConfirmPassword(input);
  const handleEmailChange = (input: string) => setEmail(input);
  const handlePhoneChange = (input: string) => setPhone(input);
  const handleFirstNameChange = (input: string) => setFirstName(input);
  const handleLastNameChange = (input: string) => setLastName(input);

 
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
  
  const handleSignup = () => {
    //to be done
  };

  return {
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
  };
};