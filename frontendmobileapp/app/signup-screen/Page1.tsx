import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import Input from '@/components/signup-components/Input';
import { useSignup } from '@/hooks/signUpLogic';
import styles from "../../Styles/page-styles/SignupStyles"
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setErrorMessage } from '../store/authSlice';


const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const Page1 = () => {
  const dispatch = useAppDispatch();
  const {
    email,
    password,
    confirmPassword,
    pageNumber,
    emailBdColor,
    passwordBdColor,
    ...signupAction
  } = useSignup();

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
  }, [emailBdColor, passwordBdColor, errorMessage]);

  return (
    <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
        <View style={styles.innerContainer}>
        <Text style={styles.title}>SIGN UP TO YESLOVE!</Text>

            <Text style={{...styles.errorMessage, display: String(errorDisplay) }}>{errorMessage}</Text>
            <Text style={styles.label}>Email</Text>
            <Input
            placeholder="Enter email"
            keyboardType='email-address'
            borderColor={emailBdColor[0]}
            borderBottomColor={emailBdColor[1]}
            onChangeText={signupAction.handleEmailChange}
            /> 

            <Text style={styles.label}>Password</Text>
            <Input
            placeholder="Enter password"
            borderColor={passwordBdColor[0]}
            borderBottomColor={passwordBdColor[1]}
            onChangeText={signupAction.handlePasswordChange}
            secureTextEntry = {true}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <Input
            placeholder="Confirm password"
            borderColor={passwordBdColor[0]}
            borderBottomColor={passwordBdColor[1]}
            onChangeText={signupAction.handleConfirmPassword}
            secureTextEntry = {true}
            />

            <TouchableOpacity style={styles.buttonNext} onPress={signupAction.moveToNext}>
            <Text style={styles.buttonText}><Text style={styles.greyText}>Let's get to know you more!.</Text> Next</Text>
            </TouchableOpacity> 

    
        <Text style={styles.containerFooter}>
        Already have an account?
            <Text style={styles.footerLink} onPress={() => signupAction.handleLoginStateChange('login')}> Login</Text>
        </Text>
        </View>
    </ImageBackground>
      
  );
};

export default Page1;