import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { setLoginStateAction, LoginState, increasePageNo, decreasePageNo, signupAction,
   setSignupEmail, setSignupPassword, setSignupConfirmPassword, setSignupMessage, setErrorMessage } from '../app/store/authSlice';
import theme from '@/Styles/Variables';

export const useSignup = () => {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const initialBdColor = ['#ccc', theme.colors.primaryBlue];
  const [passwordBdColor, setPasswordBdColor] = useState(initialBdColor);
  const [emailBdColor, setEmailBdColor] = useState(initialBdColor);
  const [usernameBdColor, setUsernameBdColor] = useState(initialBdColor);
  const [firstNameBdColor, setFirstNameBdColor] = useState(initialBdColor);
  const [lastNameBdColor, setLastNameBdColor] = useState(initialBdColor);
  const [phoneBdColor, setPhoneBdColor] = useState(initialBdColor);
  
  const handleUsernameChange = (input: string) => setUsername(input);
  const handlePasswordChange = (input: string) => setPassword(input);
  const handleConfirmPassword = (input: string) => setConfirmPassword(input);
  const handleEmailChange = (input: string) => setEmail(input);
  const handlePhoneNumberChange = (input: string) => setPhoneNumber(input);
  const handleFirstNameChange = (input: string) => setFirstName(input);
  const handleLastNameChange = (input: string) => setLastName(input);

  const pageNumber = useAppSelector((state) => state.auth.SignupPageNo );
 
  const handleLoginStateChange = (action: string) => {
    if (action=='sign-up') {
        dispatch(setLoginStateAction(LoginState.SIGN_UP));
    }
    else if (action=='login') {
        dispatch(setLoginStateAction(LoginState.LOGGED_OUT));
    }
    else if (action=='refresh-login') {
        dispatch(setLoginStateAction(LoginState.LOGGED_OUT));
        dispatch(decreasePageNo(2));
    } 
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
      if (!username){
        return [false, 'username'];
      }
      else if (!firstName) {
        return [false, 'firstName'];
      }
      else if (!lastName) {
        return [false, 'lastName'];
      }
      else {
        const phoneNumberNumberPattern = /^0\d{10}$/;
        return [phoneNumberNumberPattern.test(phoneNumber), 'phoneNumber'];
      }
    }
  };

  const moveToNext = () => {
    const [result, field] = validateInputs(1);
    if (result){
        dispatch(increasePageNo(pageNumber))
        dispatch(setSignupEmail(email));
        dispatch(setSignupPassword(password));
        dispatch(setSignupConfirmPassword(confirmPassword));
    }
    else if (field == 'password') {
        setPasswordBdColor(['red', 'red']);
        setEmailBdColor(['#ccc', theme.colors.primaryBlue])
        dispatch(setErrorMessage('Password does not match or is empty'));
    }
    else if (field == 'email') {
      setEmailBdColor(['red', 'red']);
      setPasswordBdColor(['#ccc', theme.colors.primaryBlue]);
      dispatch(setErrorMessage('Invalid Field: Email.'));
    }
    
  };

  const moveToPrevious = () => {
     
    dispatch(decreasePageNo(pageNumber))
  };
  
  const handleSignup = (email: string, password: string, confirmPassword: string) => {
    const [result, field] = validateInputs(2);
    if (result){
        let confirm_password = confirmPassword;
        let first_name = firstName;
        let last_name = lastName;
        let phone_number = phoneNumber;
        
        dispatch(setSignupMessage(''));
        dispatch(signupAction({email, password, confirm_password, first_name, last_name, phone_number, username}));
        dispatch(increasePageNo(pageNumber));
    }
    else if (field == 'username') {
        setUsernameBdColor(['red', 'red']);
        setFirstNameBdColor(initialBdColor);
        setLastNameBdColor(initialBdColor);
        setPhoneBdColor(initialBdColor);
        dispatch(setErrorMessage('Empty Field: Please type in username.'));
    }
    else if (field == 'firstName') {
        setFirstNameBdColor(['red', 'red']);
        setUsernameBdColor(initialBdColor);
        setLastNameBdColor(initialBdColor);
        setPhoneBdColor(initialBdColor);
        dispatch(setErrorMessage('Empty Field: Please type in first name.'));
    }
    else if (field == 'lastName') {
        setLastNameBdColor(['red', 'red']);
        setUsernameBdColor(initialBdColor);
        setFirstNameBdColor(initialBdColor);
        setPhoneBdColor(initialBdColor);
        dispatch(setErrorMessage('Empty Field: Please type in last name.'));
    }
    else if (field == 'phoneNumber') {
        setPhoneBdColor(['red', 'red']);
        setUsernameBdColor(initialBdColor);
        setFirstNameBdColor(initialBdColor);
        setLastNameBdColor(initialBdColor);
        dispatch(setErrorMessage('Invalid Field: Phone number.'));
    }
    

  };

  

  return {
    email,
    password,
    confirmPassword,
    pageNumber,
    emailBdColor,
    passwordBdColor,
    usernameBdColor,
    firstNameBdColor,
    lastNameBdColor,
    phoneBdColor,
    handleUsernameChange,
    handlePasswordChange,
    handleConfirmPassword,
    handleEmailChange,
    handlePhoneNumberChange,
    handleFirstNameChange,
    handleLastNameChange,
    handleLoginStateChange,
    handleSignup,
    validateInputs,
    moveToNext,
    moveToPrevious,
  };
};