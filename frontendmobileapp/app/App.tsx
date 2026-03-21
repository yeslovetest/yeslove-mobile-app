import React from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "./Universal-components/Footer/Footer";
import { useAppDispatch, useAppSelector } from "./store/hooks";
import ProfileRoot from "./pages/Profile/Profile-root/ProfileRoot";
import HomeRoot from "./pages/Home/Home-root/HomeRoot";
import GetHelpRoot from "./pages/Get-help/Get-help-root/GetHelpRoot";
import LoginPage from "./pages/Login/LoginPage/LoginPage";
import SignUpRoot from "./pages/Sign-up/Sign-up-root/SignUpRoot";
import {
  attemptRefreshFromLocalStorageAction,
  LoginState,
  setLoginStateAction,
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
import EditProfileInformation from "./pages/Profile/Edit-profile-information/EditProfileInformation";
import ProfileInformation from "./pages/Profile/Profile-information/ProfileInformation";
import EmailNtfnSettings from "./pages/Profile/Settings/Email/EmailNtfnSetting";
import ProfileVisibilitySettings from "./pages/Profile/Settings/Profile-visibility/ProfileVisibilitySettings";
import NotificationPreferences from "./pages/Profile/Settings/Preferences/Notifications";
import Chatbot from "./pages/Home/Messages/Chatbot/Chatbot";

const App = () => {
  const dispatch = useAppDispatch();
  const [showSlowLoadingHelp, setShowSlowLoadingHelp] = React.useState(false);

  React.useEffect(() => {
    dispatch(attemptRefreshFromLocalStorageAction());
  }, [dispatch]);

  const currentActiveTab = useAppSelector(
    (state) => state.navigation.tabStack.at(-1)
  );
  const loginState = useAppSelector((state) => state.auth.loginState);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (loginState === LoginState.LOADING) {
      setShowSlowLoadingHelp(false);
      timer = setTimeout(() => {
        setShowSlowLoadingHelp(true);
      }, 8000);
    } else {
      setShowSlowLoadingHelp(false);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [loginState]);

  React.useEffect(() => {
    if (loginState !== LoginState.LOADING) {
      return;
    }

    // Last-resort guard: never allow indefinite LOADING if bootstrap saga gets stuck.
    const hardFallbackTimer = setTimeout(() => {
      dispatch(setLoginStateAction(LoginState.LOGGED_OUT));
    }, 10000);

    return () => {
      clearTimeout(hardFallbackTimer);
    };
  }, [dispatch, loginState]);

  return (
    // Apply safe-area insets globally so screens do not overlap status/navigation UI.
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {loginState == LoginState.LOADING && (
        <View style={styles.container}>
          <LoginRoot
            showSlowLoadingHelp={showSlowLoadingHelp}
          ></LoginRoot>
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
                 NOTIFICATION_PREFERENCES: <NotificationPreferences></NotificationPreferences>,
                 EXPORT_DATA: <ExportData></ExportData>,

              NOTIFICATIONS: <NotificationsRoot></NotificationsRoot>,
                 MESSAGES: <MessagesRoot></MessagesRoot>,
                    CONVERSATION: <Conversation></Conversation>,
                       CHATBOT: <Chatbot></Chatbot>,
              INDIVIDUAL_EVENT: <EventInfoPage />,
              INDIVIDUAL_BLOG: <IndividualBlog />,
              INDIVIDUAL_POST: <IndividualPost />,
            }[currentActiveTab?.type ?? TabType.HOME]
          }
          <Footer></Footer>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
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
