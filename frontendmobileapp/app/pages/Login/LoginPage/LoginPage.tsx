import { View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView, useWindowDimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { useLogin } from "../../../../hooks/loginLogic"
import styles from './LoginPageStyles';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { setErrorMessage } from '../../../store/Auth-store/authSlice';
import LoadingOverlay from '@/app/Universal-components/LoadingScreen/Screen';

const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const LoginPage = () => {
  const { height } = useWindowDimensions();
  const isCompactScreen = height < 700;

  const dispatch = useAppDispatch();
  const {
    identifier,
    identifierMode,
    password,
    passwordBdColor,
    identifierBdColor,
    handleIdentifierModeChange,
    handleIdentifierChange,
    handlePasswordChange,
    handleLogin,
    handleLoginStateChange,
  } = useLogin();

    
  const errorMessage = useAppSelector((state) => state.auth.errorMessage);
  const isLoadingScreen = useAppSelector(state => state.profile.loadingScreenActive);

  const [errorDisplay, setErrorDisplay ] = useState<'none' | 'flex'>('none');
  const [hasTriedLogin, setHasTriedLogin] = useState(false);

  const handleLoginPress = () => {
    setHasTriedLogin(true);
    handleLogin();
  };

  const hideError = () => {
    setErrorDisplay('none');
    dispatch(setErrorMessage(''));

  }

  useEffect(() => {
    setErrorDisplay('flex');
    const timer = setTimeout(() => {
      hideError(); 
    }, 5000);
    return () => clearTimeout(timer);
  }, [identifierBdColor, passwordBdColor, errorMessage]);



  return (
    <ImageBackground source={image} style={[styles.container, isCompactScreen ? styles.compactContainer : undefined]} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.innerContainer, isCompactScreen ? styles.compactInnerContainer : undefined]}>
        <Text style={[styles.title, isCompactScreen ? styles.compactTitle : undefined]}>LOGIN</Text>

        <Text style={{...styles.errorMessage, ...(isCompactScreen ? styles.compactErrorMessage : undefined), display: errorDisplay }}>{errorMessage}</Text>

        <View style={[styles.modeToggleContainer, isCompactScreen ? styles.compactModeToggleContainer : undefined]}>
          <TouchableOpacity
            style={[
              styles.modeToggleButton,
              identifierMode === 'username' ? styles.modeToggleButtonActive : undefined,
            ]}
            onPress={() => handleIdentifierModeChange('username')}
          >
            <Text
              style={[
                styles.modeToggleText,
                identifierMode === 'username' ? styles.modeToggleTextActive : undefined,
              ]}
            >
              Username
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeToggleButton,
              identifierMode === 'email' ? styles.modeToggleButtonActive : undefined,
            ]}
            onPress={() => handleIdentifierModeChange('email')}
          >
            <Text
              style={[
                styles.modeToggleText,
                identifierMode === 'email' ? styles.modeToggleTextActive : undefined,
              ]}
            >
              Email
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, isCompactScreen ? styles.compactLabel : undefined]}>{identifierMode === 'email' ? 'Email' : 'Username'}</Text>
        <TextInput
          onChangeText={handleIdentifierChange}
          value={identifier}
          style={{...styles.input, ...(isCompactScreen ? styles.compactInput : undefined), borderColor: identifierBdColor[0], borderBottomColor: identifierBdColor[1]}}
          placeholder={identifierMode === 'email' ? 'Enter email' : 'Enter username'}
          placeholderTextColor="#6b7280"
          keyboardType={identifierMode === 'email' ? 'email-address' : 'default'}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={[styles.helperText, isCompactScreen ? styles.compactHelperText : undefined]}>
          {identifierMode !== 'email' && hasTriedLogin && !!errorMessage
            ? 'Are you logging in for the first time? use your email instead of username.'
            : ''}
        </Text>

        <Text style={[styles.label, isCompactScreen ? styles.compactLabel : undefined]}>Password</Text>
        <TextInput
          onChangeText={handlePasswordChange}
          value={password}
          style={{...styles.input, ...(isCompactScreen ? styles.compactInput : undefined), borderColor: passwordBdColor[0], borderBottomColor: passwordBdColor[1]}}
          placeholder="Enter password"
          placeholderTextColor="#6b7280"
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, isCompactScreen ? styles.compactButton : undefined]} onPress={handleLoginPress}>
          <Text style={[styles.buttonText, isCompactScreen ? styles.compactButtonText : undefined]}>LOGIN</Text>
        </TouchableOpacity>

        <Text style={[styles.containerFooter, isCompactScreen ? styles.compactContainerFooter : undefined]}>
          Not Registered?
          <Text style={styles.footerLink} onPress={() => handleLoginStateChange('sign-up')}> Sign up!</Text>
        </Text> 
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <LoadingOverlay visible={isLoadingScreen}/>
    </ImageBackground>
  );
};

export default LoginPage;
