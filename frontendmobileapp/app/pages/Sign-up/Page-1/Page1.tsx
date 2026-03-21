import { View, Text, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import Input from '../Sign-up-root/Sign-up-components/Input/Input';
import { useSignup } from '@/hooks/signUpLogic';
import sharedStyles from '../SignUpSharedStyles';
import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setErrorMessage } from '../../../store/Auth-store/authSlice';


const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const Page1 = () => {
  const { height } = useWindowDimensions();
  const isCompactScreen = height < 700;

  const dispatch = useAppDispatch();
  const {
    email,
    confirmEmail,
    password,
    confirmPassword,
    pageNumber,
    emailBdColor,
    confirmEmailBdColor,
    passwordBdColor,
    ...signupAction
  } = useSignup();

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
  }, [emailBdColor, confirmEmailBdColor, passwordBdColor, errorMessage]);

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
        <Text style={[sharedStyles.title, isCompactScreen ? sharedStyles.compactTitle : undefined]}>SIGN UP</Text>

            <Text style={{...sharedStyles.errorMessage, ...(isCompactScreen ? sharedStyles.compactErrorMessage : undefined), display: errorDisplay }}>{errorMessage}</Text>
            <Text style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}>Email</Text>
            <Input
            placeholder="Enter email"
            keyboardType='email-address'
            borderColor={emailBdColor[0]}
            borderBottomColor={emailBdColor[1]}
            onChangeText={signupAction.handleEmailChange}
            /> 

            <Text style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}>Confirm Email</Text>
            <Input
            placeholder="Re-enter email"
            keyboardType='email-address'
            borderColor={confirmEmailBdColor[0]}
            borderBottomColor={confirmEmailBdColor[1]}
            onChangeText={signupAction.handleConfirmEmailChange}
            />

            <Text style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}>Password</Text>
            <Input
            placeholder="Enter password"
            borderColor={passwordBdColor[0]}
            borderBottomColor={passwordBdColor[1]}
            onChangeText={signupAction.handlePasswordChange}
            secureTextEntry = {true}
            />

            <Text style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}>Confirm Password</Text>
            <Input
            placeholder="Confirm password"
            borderColor={passwordBdColor[0]}
            borderBottomColor={passwordBdColor[1]}
            onChangeText={signupAction.handleConfirmPassword}
            secureTextEntry = {true}
            />

            <TouchableOpacity style={[sharedStyles.buttonNext, isCompactScreen ? sharedStyles.compactButtonNext : undefined]} onPress={signupAction.moveToNext}>
              <Text style={[sharedStyles.buttonText, isCompactScreen ? sharedStyles.compactButtonText : undefined]}><Text style={[sharedStyles.greyText, isCompactScreen ? sharedStyles.compactGreyText : undefined]}>Let us get to know you more!.</Text> Next</Text>
            </TouchableOpacity> 

    
        <Text style={[sharedStyles.containerFooter, isCompactScreen ? sharedStyles.compactContainerFooter : undefined]}>
        Already have an account?
            <Text style={sharedStyles.footerLink} onPress={() => signupAction.handleLoginStateChange('login')}> Login</Text>
        </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
      
  );
};

export default Page1;