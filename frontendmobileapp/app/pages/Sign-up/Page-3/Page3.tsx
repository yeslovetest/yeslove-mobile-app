import React from "react";
import { View, Text, TouchableOpacity, ImageBackground, } from 'react-native';
import { useAppSelector } from '../../../store/hooks';
import { useSignup } from '@/hooks/signUpLogic';
import LoginLoadingScreen from "../../Login/Login-root/LoginRoot";
import styles from "./Page3Styles"


const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const Page3 = () => {
  const signupEmail = useAppSelector((state) => state.auth.signupEmail);
  const signupResponse= useAppSelector((state) => state.auth.signupResponse);
  const signupActions = useSignup();
 

  return (
    <>  {signupResponse == "" && (
            <View  style={styles.container} >
                <LoginLoadingScreen></LoginLoadingScreen>
            </View>
        )}

        {signupResponse == "User created in Keycloak and email verification sent" && (
            <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Thank you for signing up!</Text>

                    <Text style={styles.label}>We have sent a verification link to you email address: {signupEmail}</Text>

                    <TouchableOpacity style={styles.baseButton} onPress={() => signupActions.handleLoginStateChange('refresh-login')}>
                    <Text style={styles.baseButtonText}>Login after Verification</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.baseButton, styles.backButton]} onPress={signupActions.moveToPrevious}>
                    <Text style={[styles.baseButtonText, styles.backButtonText]}>Go Back</Text>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        )}
       
        {signupResponse.includes('409') && (
            <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>User already exists</Text>


                    <TouchableOpacity style={styles.baseButton} onPress={() => signupActions.handleLoginStateChange('refresh-login')}>
                    <Text style={styles.baseButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.baseButton, styles.backButton]} onPress={signupActions.moveToPrevious}>
                    <Text style={[styles.baseButtonText, styles.backButtonText]}>Go Back</Text>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        )} 

        {(signupResponse.includes('500') || signupResponse.includes('400')) || (signupResponse.includes('Error')) &&
            (
            <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Sign up failed</Text>

                    <TouchableOpacity style={[styles.baseButton, styles.backButton]} onPress={signupActions.moveToPrevious}>
                    <Text style={[styles.baseButtonText, styles.backButtonText]}>Go Back</Text>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
            )
        }
    </>    
  );
};

export default Page3;