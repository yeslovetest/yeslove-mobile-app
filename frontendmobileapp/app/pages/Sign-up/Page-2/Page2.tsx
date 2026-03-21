import { View, Text, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import Input from '../Sign-up-root/Sign-up-components/Input/Input';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { useSignup } from '@/hooks/signUpLogic';
import sharedStyles from '../SignUpSharedStyles';
import theme from '@/assets/variables/Variables';
import { setErrorMessage } from '../../../store/Auth-store/authSlice';
import { useEffect, useState } from 'react';

const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const Page2 = () => {
  const { height } = useWindowDimensions();
  const isCompactScreen = height < 700;

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

  const [errorDisplay, setErrorDisplay ] = useState<'none' | 'flex'>('none');
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
    
    <ImageBackground source={image} style={[sharedStyles.container, isCompactScreen ? sharedStyles.compactContainer : undefined]} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
      <KeyboardAvoidingView
        style={sharedStyles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={sharedStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[sharedStyles.innerContainer, isCompactScreen ? sharedStyles.compactInnerContainer : undefined]}>
        <Text style={[sharedStyles.title, isCompactScreen ? sharedStyles.compactTitle : undefined]}>SIGN UP TO YESLOVE!</Text>

        <Text style={{...sharedStyles.errorMessage, ...(isCompactScreen ? sharedStyles.compactErrorMessage : undefined), display: errorDisplay }}>{errorMessage}</Text>
        <Text style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}>First Name</Text>
        <Input
        placeholder="Enter first name"
        borderColor={firstNameBdColor[0]}
        borderBottomColor={firstNameBdColor[1]}
        onChangeText={signupAction.handleFirstNameChange}
        />

        <Text style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}>Last Name</Text>
        <Input
        placeholder="Enter last name"
        borderColor={lastNameBdColor[0]}
        borderBottomColor={lastNameBdColor[1]}
        onChangeText={signupAction.handleLastNameChange}
        />

        <Text style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}>Phone Number</Text>
        <Input
        placeholder="Enter phone number"
        borderColor={phoneBdColor[0]}
        borderBottomColor={phoneBdColor[1]}
        onChangeText={signupAction.handlePhoneNumberChange}
        />

        <Text style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}>Username</Text>
        <Input
        placeholder="Enter username"
        borderColor={usernameBdColor[0]}
        borderBottomColor={usernameBdColor[1]}
        onChangeText={signupAction.handleUsernameChange}
        />

        <View style={sharedStyles.buttonContainer}>
          <TouchableOpacity style={[sharedStyles.button, isCompactScreen ? sharedStyles.compactButton : undefined]} onPress={() => signupAction.handleSignup(signupEmail, signupPassword, signupConfirmPassword)}>
          <Text style={[sharedStyles.buttonText, isCompactScreen ? sharedStyles.compactButtonText : undefined]}>SIGN UP</Text>
            </TouchableOpacity>  
        </View>
    
        <Text style={[sharedStyles.containerFooter, isCompactScreen ? sharedStyles.compactContainerFooter : undefined]}>
        Go  <Text style={{...sharedStyles.footerLink, color: theme.colors.footerFontColor, textDecorationLine: 'underline'}} onPress={signupAction.moveToPrevious}>Back  </Text> 
            to  previous  page
        </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>    
  );
};

export default Page2;