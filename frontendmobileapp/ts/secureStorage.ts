import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Cross-platform secure key/value storage for auth secrets.
 *
 * - Native (iOS/Android): values are stored encrypted via expo-secure-store
 *   (Keychain / Keystore). Any legacy plaintext value left in AsyncStorage by an
 *   older build is transparently migrated into SecureStore on first read, so
 *   existing sessions survive the upgrade.
 * - Web: SecureStore is unavailable, so we keep the previous localStorage +
 *   AsyncStorage behavior.
 */

// SecureStore is native-only.
const useSecureStore = Platform.OS !== "web";

const readWeb = async (key: string): Promise<string | null> => {
  try {
    if (typeof localStorage !== "undefined") {
      const value = localStorage.getItem(key);
      if (value !== null) {
        return value;
      }
    }
  } catch {
    // Ignore localStorage errors in non-web contexts.
  }
  return AsyncStorage.getItem(key);
};

const writeWeb = async (key: string, value: string): Promise<void> => {
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(key, value);
    }
  } catch {
    // Ignore localStorage errors in non-web contexts.
  }
  await AsyncStorage.setItem(key, value);
};

/**
 * Read a stored value. On native, prefers encrypted SecureStore and migrates any
 * legacy plaintext AsyncStorage value into it on first read.
 */
export const secureGet = async (key: string): Promise<string | null> => {
  if (!useSecureStore) {
    return readWeb(key);
  }

  try {
    const secureValue = await SecureStore.getItemAsync(key);
    if (secureValue !== null) {
      return secureValue;
    }
  } catch {
    // Fall through to the legacy read if SecureStore is unavailable.
  }

  const legacyValue = await AsyncStorage.getItem(key);
  if (legacyValue) {
    // Migrate the plaintext value into SecureStore, then drop the plaintext copy.
    try {
      await SecureStore.setItemAsync(key, legacyValue);
      await AsyncStorage.removeItem(key);
    } catch {
      // Keep returning the legacy value if migration fails.
    }
  }
  return legacyValue;
};

/**
 * Write a stored value. On native, writes to encrypted SecureStore (deleting the
 * entry when the value is empty) and clears any legacy plaintext copy. Falls back
 * to AsyncStorage if SecureStore is unavailable so auth keeps working.
 */
export const secureSet = async (key: string, value: string): Promise<void> => {
  if (!useSecureStore) {
    return writeWeb(key, value);
  }

  try {
    if (value) {
      await SecureStore.setItemAsync(key, value);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
    // Remove any legacy plaintext copy from the previous storage.
    await AsyncStorage.removeItem(key).catch(() => {});
  } catch {
    // SecureStore unavailable — degrade to AsyncStorage so auth still functions.
    await AsyncStorage.setItem(key, value);
  }
};
