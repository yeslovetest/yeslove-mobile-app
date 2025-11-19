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
    username,
    password,
    passwordBdColor,
    usernameBdColor,
    handleUsernameChange,
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
  }, [usernameBdColor, passwordBdColor, errorMessage]);



  return (
    <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>LOGIN</Text>

        <Text style={{...styles.errorMessage, display: String(errorDisplay) }}>{errorMessage}</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          onChangeText={handleUsernameChange}
          value={username}
          style={{...styles.input, borderColor: usernameBdColor[0], borderBottomColor: usernameBdColor[1]}}
          placeholder="Enter username"
        />

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
