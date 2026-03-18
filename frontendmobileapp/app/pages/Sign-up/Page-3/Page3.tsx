import React from "react";
import { ActivityIndicator, View, Text, TouchableOpacity, ImageBackground, } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { useSignup } from '@/hooks/signUpLogic';
import LoginLoadingScreen from "../../Login/Login-root/LoginRoot";
import { signupAction } from '../../../store/Auth-store/authSlice';
import styles from "./Page3Styles"


const image = {
  uri: "https://images.unsplash.com/vector-1741103791953-12eca7b8e3c7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTAwfHxibHVlJTIwYWJzdHJhY3QlMjBzaGFwZXMlMjB3aGl0ZSUyMGJhY2tncm91bmR8ZW58MHx8MHx8fDA%3D"
};

const Page3 = () => {
    const dispatch = useAppDispatch();
  const signupEmail = useAppSelector((state) => state.auth.signupEmail);
  const signupResponse= useAppSelector((state) => state.auth.signupResponse);
    const lastSignupPayload = useAppSelector((state) => state.auth.lastSignupPayload);
        const isSignupSubmitting = useAppSelector((state) => state.auth.isSignupSubmitting);
  const signupActions = useSignup();

    const normalizedResponse = (signupResponse || "").trim();
    const normalizedLower = normalizedResponse.toLowerCase();

    // Keep result-state checks resilient across provider message wording changes.
    const isLoading = normalizedResponse === "";
    const isSuccess =
        normalizedLower.includes("user created") ||
        normalizedLower.includes("verification") ||
        normalizedLower.includes("check your email");
    const isAccountExists =
        normalizedLower.includes("already exists") ||
        normalizedLower.includes("already registered");
    const isFailure = !isLoading && !isSuccess && !isAccountExists;

    /**
     * Retry signup in-place using the last valid payload captured on Page 2.
     * If payload is unavailable, return user to previous step to review details.
     */
    const retrySignupNow = React.useCallback(() => {
        if (isSignupSubmitting) {
            return;
        }

        if (!lastSignupPayload) {
            signupActions.moveToPrevious();
            return;
        }

        dispatch(signupAction(lastSignupPayload));
    }, [dispatch, isSignupSubmitting, lastSignupPayload, signupActions]);
 

  return (
        <>  {isLoading && (
            <View  style={styles.container} >
                <LoginLoadingScreen></LoginLoadingScreen>
            </View>
        )}

                {isSuccess && (
            <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Thank you for signing up!</Text>

                                        <Text style={styles.label}>
                                            {normalizedResponse || `We have sent a verification link to your email address: ${signupEmail}`}
                                        </Text>

                    <TouchableOpacity style={styles.baseButton} onPress={() => signupActions.handleLoginStateChange('refresh-login')}>
                    <Text style={styles.baseButtonText}>Login after Verification</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.baseButton, styles.backButton]} onPress={signupActions.moveToPrevious}>
                    <Text style={[styles.baseButtonText, styles.backButtonText]}>Go Back</Text>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        )}
       
        {isAccountExists && (
            <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>User already exists</Text>

                    <Text style={styles.label}>{normalizedResponse}</Text>


                    <TouchableOpacity style={styles.baseButton} onPress={() => signupActions.handleLoginStateChange('refresh-login')}>
                    <Text style={styles.baseButtonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.baseButton, styles.backButton]} onPress={signupActions.moveToPrevious}>
                    <Text style={[styles.baseButtonText, styles.backButtonText]}>Go Back</Text>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        )} 

        {isFailure && (
            <ImageBackground source={image} style={styles.container} resizeMode="cover" imageStyle={{ opacity: 1, height: "110%" }}>
                <View style={styles.innerContainer}>
                    <Text style={styles.title}>Sign up failed</Text>

                    <Text style={styles.label}>{normalizedResponse}</Text>

                                        <TouchableOpacity
                                            style={[styles.baseButton, isSignupSubmitting ? styles.disabledButton : null]}
                                            onPress={retrySignupNow}
                                            disabled={isSignupSubmitting}
                                        >
                                        <Text style={styles.baseButtonText}>{isSignupSubmitting ? 'Trying Again...' : 'Try Again'}</Text>
                    </TouchableOpacity>

                                        {isSignupSubmitting && (
                                            <View style={styles.retryIndicatorRow}>
                                                <ActivityIndicator size="small" color="#1976d2" />
                                                <Text style={styles.retryIndicatorText}>Submitting your details...</Text>
                                            </View>
                                        )}

                                        {/* Keep users on this screen while retry is processing to avoid flow interruption. */}
                                        <TouchableOpacity
                                            style={[styles.baseButton, styles.backButton, isSignupSubmitting ? styles.disabledButton : null]}
                                            onPress={signupActions.moveToPrevious}
                                            disabled={isSignupSubmitting}
                                        >
                    <Text style={[styles.baseButtonText, styles.backButtonText]}>Go Back</Text>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        )}
    </>    
  );
};

export default Page3;