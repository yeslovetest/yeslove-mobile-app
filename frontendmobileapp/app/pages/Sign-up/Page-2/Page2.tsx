import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  Linking,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { PRIVACY_POLICY_URL, TERMS_URL } from "@/constants/legal";
import Input from "../Sign-up-root/Sign-up-components/Input/Input";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { useSignup } from "@/hooks/signUpLogic";
import sharedStyles from "../SignUpSharedStyles";
import { theme } from "@/app/theme";
import { setErrorMessage } from "../../../store/Auth-store/authSlice";
import { useEffect, useState } from "react";
import image from "@/assets/images/auth-background.png";

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
    ...signupAction
  } = useSignup();

  const signupEmail = useAppSelector((state) => state.auth.signupEmail);
  const signupPassword = useAppSelector((state) => state.auth.signupPassword);
  const signupConfirmPassword = useAppSelector((state) => state.auth.signupConfirmPassword);
  const errorMessage = useAppSelector((state) => state.auth.errorMessage);

  const [errorDisplay, setErrorDisplay] = useState<"none" | "flex">("none");
  const hideError = () => {
    dispatch(setErrorMessage(""));
    setErrorDisplay("none");
  };

  useEffect(() => {
    setErrorDisplay("flex");
    const timer = setTimeout(() => {
      hideError();
    }, 5000);
    return () => clearTimeout(timer);
  }, [firstNameBdColor, lastNameBdColor, usernameBdColor, errorMessage]);

  return (
    <ImageBackground
      source={image}
      style={[sharedStyles.container, isCompactScreen ? sharedStyles.compactContainer : undefined]}
      resizeMode="cover"
      imageStyle={{ opacity: 1, height: "110%" }}
    >
      <KeyboardAvoidingView
        style={sharedStyles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={sharedStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              sharedStyles.innerContainer,
              isCompactScreen ? sharedStyles.compactInnerContainer : undefined,
            ]}
          >
            <Text
              style={[sharedStyles.title, isCompactScreen ? sharedStyles.compactTitle : undefined]}
            >
              SIGN UP TO YESLOVE!
            </Text>

            <Text
              style={{
                ...sharedStyles.errorMessage,
                ...(isCompactScreen ? sharedStyles.compactErrorMessage : undefined),
                display: errorDisplay,
              }}
            >
              {errorMessage}
            </Text>
            <Text
              style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}
            >
              First Name
            </Text>
            <Input
              placeholder="Enter first name"
              borderColor={firstNameBdColor[0]}
              borderBottomColor={firstNameBdColor[1]}
              onChangeText={signupAction.handleFirstNameChange}
            />

            <Text
              style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}
            >
              Last Name
            </Text>
            <Input
              placeholder="Enter last name"
              borderColor={lastNameBdColor[0]}
              borderBottomColor={lastNameBdColor[1]}
              onChangeText={signupAction.handleLastNameChange}
            />

            <Text
              style={[sharedStyles.label, isCompactScreen ? sharedStyles.compactLabel : undefined]}
            >
              Username
            </Text>
            <Input
              placeholder="Enter username"
              borderColor={usernameBdColor[0]}
              borderBottomColor={usernameBdColor[1]}
              onChangeText={signupAction.handleUsernameChange}
            />

            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", marginTop: 12, minHeight: 44 }}
              onPress={() => signupAction.setTermsAccepted(!signupAction.termsAccepted)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: signupAction.termsAccepted }}
              accessibilityLabel="I agree to the Terms and Privacy Policy"
            >
              <Ionicons
                name={signupAction.termsAccepted ? "checkbox" : "square-outline"}
                size={26}
                color={theme.colors.primary}
              />
              <Text style={{ flex: 1, marginLeft: 8, color: theme.colors.textSecondary }}>
                I agree to the{" "}
                <Text
                  style={{ color: theme.colors.primary, textDecorationLine: "underline" }}
                  onPress={() => Linking.openURL(TERMS_URL).catch(() => undefined)}
                  accessibilityRole="link"
                >
                  Terms
                </Text>{" "}
                and{" "}
                <Text
                  style={{ color: theme.colors.primary, textDecorationLine: "underline" }}
                  onPress={() => Linking.openURL(PRIVACY_POLICY_URL).catch(() => undefined)}
                  accessibilityRole="link"
                >
                  Privacy Policy
                </Text>
                .
              </Text>
            </TouchableOpacity>

            <View style={sharedStyles.buttonContainer}>
              <TouchableOpacity
                style={[
                  sharedStyles.button,
                  isCompactScreen ? sharedStyles.compactButton : undefined,
                ]}
                onPress={() =>
                  signupAction.handleSignup(signupEmail, signupPassword, signupConfirmPassword)
                }
                accessibilityRole="button"
                accessibilityLabel="Sign up"
              >
                <Text
                  style={[
                    sharedStyles.buttonText,
                    isCompactScreen ? sharedStyles.compactButtonText : undefined,
                  ]}
                >
                  SIGN UP
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                sharedStyles.containerFooter,
                isCompactScreen ? sharedStyles.compactContainerFooter : undefined,
              ]}
            >
              Go{" "}
              <Text
                style={{
                  ...sharedStyles.footerLink,
                  color: theme.colors.textMuted,
                  textDecorationLine: "underline",
                }}
                onPress={signupAction.moveToPrevious}
              >
                Back{" "}
              </Text>
              to previous page
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Page2;
