import React from "react";
import { View, StyleSheet, Text } from "react-native";
import Footer from "./footer/Footer";
import Header from "./Header";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import ProfilePage from "./tabs/profile";
import HomeScreen from "./tabs/home";
import GetHelpPage from "./tabs/gethelp";
import LoginScreen from "./login-screen/LoginScreen";
import { useFocusEffect } from "expo-router";
import {
  attemptRefreshFromLocalStorageAction,
  LoginState,
} from "./store/authSlice";
import LoginLoadingScreen from "./login-screen/LoginLoadingScreen";
import { TabType } from "./store/navigationSlice";
import EventsPage from "./tabs/events";
import IndividualEvent from "@/components/events-components/IndividualEvent";

const App = () => {
  const dispatch = useAppDispatch();
  useFocusEffect(
    React.useCallback(() => {
      dispatch(attemptRefreshFromLocalStorageAction());
    }, [])
  );
  const currentActiveTab = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)
  );
  const loginState = useAppSelector((state) => state.auth.loginState);
  return (
    <>
      {loginState == LoginState.LOADING && (
        <View style={styles.container}>
          <LoginLoadingScreen></LoginLoadingScreen>
        </View>
      )}
      {loginState == LoginState.LOGGED_OUT && (
        <View style={styles.container}>
          <LoginScreen></LoginScreen>
        </View>
      )}
      {loginState == LoginState.LOGGED_IN && (
        <View style={styles.container}>
          <Header></Header>
          {
            {
              HOME: <HomeScreen></HomeScreen>,
              GET_HELP: <GetHelpPage></GetHelpPage>,
              EVENTS: <EventsPage></EventsPage>,
              PROFILE: <ProfilePage></ProfilePage>,
              INDIVIDUAL_EVENT: <IndividualEvent />
            }[currentActiveTab?.type ?? TabType.HOME]
          }
          <Footer></Footer>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    marginBottom: 5,
    color: "#666",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default App;
