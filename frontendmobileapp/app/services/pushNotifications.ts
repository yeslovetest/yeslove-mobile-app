import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { pushApiFactory } from "@/push-client-api/api";
import { secureGet, secureSet } from "@/ts/secureStorage";

const PUSH_TOKEN_KEY = "pushToken";
const INSTALL_ID_KEY = "pushInstallId";

// Show notifications that arrive while the app is open instead of silently dropping them.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// A stable id per install lets the backend replace this device's old token on refresh.
const getInstallId = async (): Promise<string> => {
  const existing = await secureGet(INSTALL_ID_KEY);
  if (existing) return existing;
  const created = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  await secureSet(INSTALL_ID_KEY, created);
  return created;
};

export type PushRegistrationResult =
  | { status: "registered"; token: string }
  | { status: "unsupported" } // simulator, or push not configured for this build
  | { status: "denied" }
  | { status: "failed" };

/**
 * Asks for permission (once, after sign-in), fetches this device's Expo push token and
 * registers it with the backend. Safe to call on every sign-in.
 */
export const registerForPushNotifications = async (): Promise<PushRegistrationResult> => {
  // Push tokens can only be issued on a physical device.
  if (!Device.isDevice) return { status: "unsupported" };

  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      ({ status } = await Notifications.requestPermissionsAsync());
    }
    if (status !== "granted") return { status: "denied" };

    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    if (!projectId) return { status: "unsupported" };

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });

    await pushApiFactory.registerDevice({
      token,
      platform: Platform.OS === "ios" ? "ios" : "android",
      device_id: await getInstallId(),
    });
    await secureSet(PUSH_TOKEN_KEY, token);
    return { status: "registered", token };
  } catch (error) {
    console.warn("Push registration failed", error);
    return { status: "failed" };
  }
};

/** Stops pushes to this device. Call before the auth header is cleared on logout. */
export const unregisterPushNotifications = async (): Promise<void> => {
  try {
    const token = await secureGet(PUSH_TOKEN_KEY);
    if (!token) return;
    await pushApiFactory.unregisterDevice(token);
    await secureSet(PUSH_TOKEN_KEY, "");
  } catch (error) {
    console.warn("Push unregistration failed", error);
  }
};
