import React from "react";
import { View, StyleSheet } from "react-native";
import Footer from "./Universal-components/Footer/Footer";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import ProfilePage from "./tabs/profile";
import HomeRoot from "./pages/Home/Home-root/HomeRoot";
import GetHelpRoot from "./pages/Get-help/Get-help-root/GetHelpRoot";
import LoginScreen from "./pages/Login/Login-components/LoginScreen";
import SignUpScreen from "./pages/Sign-up/Sign-up-components/SignUpScreen";
import { useFocusEffect } from "expo-router";
import {
  attemptRefreshFromLocalStorageAction,
  LoginState,
} from "./store/Auth-store/authSlice";
import LoginLoadingScreen from "./pages/Login/Login-components/LoginLoadingScreen";
import { TabType } from "./store/Navigation/navigationSlice";
import EventsRoot from "./pages/Events/Events-root/EventsRoot";
import EventInfoPage from "./pages/Events/Event-info/EventInfoPage";
import IndividualBlog from "@/app/pages/Get-help/Blog-info/BlogInfoPage";
import IndividualPost from "@/app/pages/Home/Comments-and-reactions/CommentsAndReactionsPage";
import NotificationsRoot from "./pages/Notifications/Notifications-root/NotificationsRoot";

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
       {loginState == LoginState.SIGN_UP && (
        <View style={styles.container}>
          <SignUpScreen></SignUpScreen>
        </View>
      )}
      {loginState == LoginState.LOGGED_IN && (
        <View style={styles.container}>
          {
            {
              HOME: <HomeRoot></HomeRoot>,
              GET_HELP: <GetHelpRoot />,
              EVENTS: <EventsRoot></EventsRoot>,
              PROFILE: <ProfilePage></ProfilePage>,
              NOTIFICATIONS: <NotificationsRoot></NotificationsRoot>,
              INDIVIDUAL_EVENT: <EventInfoPage />,
              INDIVIDUAL_BLOG: <IndividualBlog />,
              INDIVIDUAL_POST: <IndividualPost />,
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
