import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import Input from '@/components/signup-components/Input';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { useSignup } from '@/hooks/signUpLogic';
import styles from "../../Styles/page-styles/SignupStyles"
import theme from '@/Styles/Variables';
import { setErrorMessage } from '../store/authSlice';
import { useEffect, useState } from 'react';

const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const Page2 = () => {
  const dispatch = useAppDispatch();
  const {
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
    ...signupAction
  } = useSignup();

  const signupEmail = useAppSelector((state) => state.auth.signupEmail);
  const signupPassword = useAppSelector((state) => state.auth.signupPassword);
  const signupConfirmPassword = useAppSelector((state) => state.auth.signupConfirmPassword);
  const errorMessage = useAppSelector((state) => state.auth.errorMessage);

  const [errorDisplay, setErrorDisplay ] = useState("none");
  const hideError = () => {
    dispatch(setErrorMessage(''));
    setErrorDisplay('none');
    
  }

  useEffect(() => {
    setErrorDisplay('flex');
    const timer = setTimeout(() => {
      hideError(); 
    }, 5000);
    return () => clearTimeout(timer);
  }, [firstNameBdColor, lastNameBdColor, phoneBdColor, usernameBdColor, errorMessage]);

  return (
    
    <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
    <View style={styles.innerContainer}>
        <Text style={styles.title}>SIGN UP TO YESLOVE!</Text>

        <Text style={{...styles.errorMessage, display: String(errorDisplay) }}>{errorMessage}</Text>
        <Text style={styles.label}>First Name</Text>
        <Input
        placeholder="Enter first name"
        borderColor={firstNameBdColor[0]}
        borderBottomColor={firstNameBdColor[1]}
        onChangeText={signupAction.handleFirstNameChange}
        />

        <Text style={styles.label}>Last Name</Text>
        <Input
        placeholder="Enter last name"
        borderColor={lastNameBdColor[0]}
        borderBottomColor={lastNameBdColor[1]}
        onChangeText={signupAction.handleLastNameChange}
        />

        <Text style={styles.label}>Phone Number</Text>
        <Input
        placeholder="Enter phone number"
        borderColor={phoneBdColor[0]}
        borderBottomColor={phoneBdColor[1]}
        onChangeText={signupAction.handlePhoneNumberChange}
        />

        <Text style={styles.label}>Username</Text>
        <Input
        placeholder="Enter username"
        borderColor={usernameBdColor[0]}
        borderBottomColor={usernameBdColor[1]}
        onChangeText={signupAction.handleUsernameChange}
        />

        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => signupAction.handleSignup(signupEmail, signupPassword, signupConfirmPassword)}>
            <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>  
        </View>
    
        <Text style={styles.containerFooter}>
        Go  <Text style={{...styles.footerLink, color: theme.colors.footerFontColor, textDecorationLine: 'underline'}} onPress={signupAction.moveToPrevious}>Back  </Text> 
            to  previous  page
        </Text>
    </View>
    </ImageBackground>    
  );
};

export default Page2;