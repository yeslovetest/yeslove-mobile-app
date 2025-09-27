import React from "react";
import { View, StyleSheet } from "react-native";
import Footer from "./Universal-components/Footer/Footer";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import ProfileRoot from "./pages/Profile/Profile-root/ProfileRoot";
import HomeRoot from "./pages/Home/Home-root/HomeRoot";
import GetHelpRoot from "./pages/Get-help/Get-help-root/GetHelpRoot";
import LoginPage from "./pages/Login/LoginPage/LoginPage";
import SignUpRoot from "./pages/Sign-up/Sign-up-root/SignUpRoot";
import { useFocusEffect } from "expo-router";
import {
  attemptRefreshFromLocalStorageAction,
  LoginState,
} from "./store/Auth-store/authSlice";
import LoginRoot from "./pages/Login/Login-root/LoginRoot";
import { TabType } from "./store/Navigation/navigationSlice";
import EventsRoot from "./pages/Events/Events-root/EventsRoot";
import EventInfoPage from "./pages/Events/Event-info/EventInfoPage";
import IndividualBlog from "@/app/pages/Get-help/Blog-info/BlogInfoPage";
import IndividualPost from "@/app/pages/Home/Comments-and-reactions/CommentsAndReactionsPage";
import NotificationsRoot from "./pages/Notifications/Notifications-root/NotificationsRoot";
import SettingsPage from "./pages/Profile/Settings/SettingsPage";
import General from "./pages/Profile/Settings/General/General";
import ExportData from "./pages/Profile/Settings/Export-data/ExportData";
import MessagesRoot from "./pages/Home/Messages/Messages-root/MessagesRoot";
import Conversation from "./pages/Home/Messages/Conversation/Conversation";
import ChatSection from "./pages/Notifications/ChatSection";
import EditProfileInformation from "./pages/Profile/Edit-profile-information/EditProfileInformation";
import ProfileInformation from "./pages/Profile/Profile-information/ProfileInformation";
import EmailNtfnSettings from "./pages/Profile/Settings/Email/EmailNtfnSetting";
import ProfileVisibilitySettings from "./pages/Profile/Settings/Profile-visibility/ProfileVisibilitySettings";

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
          <LoginRoot></LoginRoot>
        </View>
      )}
      {loginState == LoginState.LOGGED_OUT && (
        <View style={styles.container}>
          <LoginPage></LoginPage>
        </View>
      )}
       {loginState == LoginState.SIGN_UP && (
        <View style={styles.container}>
          <SignUpRoot></SignUpRoot>
        </View>
      )}
      {loginState == LoginState.LOGGED_IN && (
        <View style={styles.container}>
          {
            {
              HOME: <HomeRoot></HomeRoot>,
              GET_HELP: <GetHelpRoot />,
              EVENTS: <EventsRoot></EventsRoot>,
              PROFILE: <ProfileRoot></ProfileRoot>,
              SETTINGS: <SettingsPage></SettingsPage>,
              EDIT_PROFILE_INFORMATION: <EditProfileInformation></EditProfileInformation>,
              PROFILE_INFORMATION: <ProfileInformation></ProfileInformation>,

              /*settings folders pages */
                 GENERAL: <General></General>,
                 EMAIL: <EmailNtfnSettings></EmailNtfnSettings>,
                 PROFILE_VISIBILITY: <ProfileVisibilitySettings></ProfileVisibilitySettings>,
                 EXPORT_DATA: <ExportData></ExportData>,

              NOTIFICATIONS: <NotificationsRoot></NotificationsRoot>,
                 MESSAGES: <MessagesRoot></MessagesRoot>,
                    CONVERSATION: <Conversation></Conversation>,
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
    backgroundColor: "#fafafa",
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
