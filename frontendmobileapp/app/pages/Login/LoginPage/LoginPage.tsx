import { View, Text, TextInput, TouchableOpacity, ImageBackground } from 'react-native';
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

  const [errorDisplay, setErrorDisplay ] = useState("none");

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
    <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>LOGIN</Text>

        <Text style={{...styles.errorMessage, display: String(errorDisplay) }}>{errorMessage}</Text>

        <View style={styles.modeToggleContainer}>
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

        <Text style={styles.label}>{identifierMode === 'email' ? 'Email' : 'Username'}</Text>
        <TextInput
          onChangeText={handleIdentifierChange}
          value={identifier}
          style={{...styles.input, borderColor: identifierBdColor[0], borderBottomColor: identifierBdColor[1]}}
          placeholder={identifierMode === 'email' ? 'Enter email' : 'Enter username'}
          keyboardType={identifierMode === 'email' ? 'email-address' : 'default'}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.helperText}>
          {identifierMode === 'email'
            ? ''
            : 'Are you logging in for the first time? use your email instead of username.'}
        </Text>

        <Text style={styles.label}>Password</Text>
        <TextInput
          onChangeText={handlePasswordChange}
          value={password}
          style={{...styles.input, borderColor: passwordBdColor[0], borderBottomColor: passwordBdColor[1]}}
          placeholder="Enter password"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <Text style={styles.containerFooter}>
          Not Registered?
          <Text style={styles.footerLink} onPress={() => handleLoginStateChange('sign-up')}> Sign up!</Text>
        </Text> 
      </View>
      <LoadingOverlay visible={isLoadingScreen}/>
    </ImageBackground>
  );
};

export default LoginPage;
