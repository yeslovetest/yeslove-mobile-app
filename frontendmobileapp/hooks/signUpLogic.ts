import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/store/hooks';
import { setLoginStateAction, LoginState, increasePageNo, decreasePageNo, signupAction, setSignupEmail, setSignupPassword, setSignupMessage } from '../app/store/authSlice';
import theme from '@/Styles/Variables';

export const useSignup = () => {
  const dispatch = useAppDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm_password, setconfirm_password] = useState('');
  const [email, setEmail] = useState('');
  const [phone_number, setphone_number] = useState('');
  const [first_name, setfirst_name] = useState('');
  const [last_name, setlast_name] = useState('');

  const initialBdColor = ['#ccc', theme.colors.primaryBlue];
  const [passwordBdColor, setPasswordBdColor] = useState(initialBdColor);
  const [emailBdColor, setEmailBdColor] = useState(initialBdColor);
  const [usernameBdColor, setUsernameBdColor] = useState(initialBdColor);
  const [firstNameBdColor, setFirstNameBdColor] = useState(initialBdColor);
  const [lastNameBdColor, setLastNameBdColor] = useState(initialBdColor);
  const [phoneBdColor, setPhoneBdColor] = useState(initialBdColor);
  
  const handleUsernameChange = (input: string) => setUsername(input);
  const handlePasswordChange = (input: string) => setPassword(input);
  const handleconfirm_password = (input: string) => setconfirm_password(input);
  const handleEmailChange = (input: string) => setEmail(input);
  const handlephone_numberChange = (input: string) => setphone_number(input);
  const handlefirst_nameChange = (input: string) => setfirst_name(input);
  const handlelast_nameChange = (input: string) => setlast_name(input);

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
      if (password && password === confirm_password) {
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
      else if (!first_name) {
        return [false, 'firstName'];
      }
      else if (!last_name) {
        return [false, 'lastName'];
      }
      else {
        const phone_numberNumberPattern = /^0\d{10}$/;
        return [phone_numberNumberPattern.test(phone_number), 'phoneNumber'];
      }
    }
  };

  const moveToNext = () => {
    const [result, field] = validateInputs(1);
    if (result){
        dispatch(increasePageNo(pageNumber))
        dispatch(setSignupEmail(email));
        dispatch(setSignupPassword(password));
    }
    else if (field == 'password') {
        setPasswordBdColor(['red', 'red']);
        setEmailBdColor(['#ccc', theme.colors.primaryBlue])
    }
    else if (field == 'email') {
      setEmailBdColor(['red', 'red']);
      setPasswordBdColor(['#ccc', theme.colors.primaryBlue]);
    }
    
  };

  const moveToPrevious = () => {
     
    dispatch(decreasePageNo(pageNumber))
  };
  
  const handleSignup = (email: string, password: string, confirm_password: string) => {
    const [result, field] = validateInputs(2);
    if (result){
        dispatch(setSignupMessage(''));
        dispatch(signupAction({email, password, confirm_password, first_name, last_name, phone_number, username}));
        dispatch(increasePageNo(pageNumber));
    }
    else if (field == 'username') {
        setUsernameBdColor(['red', 'red']);
        setFirstNameBdColor(initialBdColor);
        setLastNameBdColor(initialBdColor);
        setPhoneBdColor(initialBdColor);
    }
    else if (field == 'firstName') {
        setFirstNameBdColor(['red', 'red']);
        setUsernameBdColor(initialBdColor);
        setLastNameBdColor(initialBdColor);
        setPhoneBdColor(initialBdColor);
    }
    else if (field == 'lastName') {
        setLastNameBdColor(['red', 'red']);
        setUsernameBdColor(initialBdColor);
        setFirstNameBdColor(initialBdColor);
        setPhoneBdColor(initialBdColor);
    }
    else if (field == 'phoneNumber') {
        setPhoneBdColor(['red', 'red']);
        setUsernameBdColor(initialBdColor);
        setFirstNameBdColor(initialBdColor);
        setLastNameBdColor(initialBdColor);
    }
    

  };

  

  return {
    email,
    password,
    confirm_password,
    pageNumber,
    emailBdColor,
    passwordBdColor,
    usernameBdColor,
    firstNameBdColor,
    lastNameBdColor,
    phoneBdColor,
    handleUsernameChange,
    handlePasswordChange,
    handleconfirm_password,
    handleEmailChange,
    handlephone_numberChange,
    handlefirst_nameChange,
    handlelast_nameChange,
    handleLoginStateChange,
    handleSignup,
    validateInputs,
    moveToNext,
    moveToPrevious,
  };
};