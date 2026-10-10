import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

import { theme } from "@/app/theme";
import { ACCOUNT_SECURITY_URL, BROWSER_SIGN_IN_ENABLED } from "@/app/services/oidc";
import { SUPPORT_EMAIL } from "@/constants/legal";

export const SECURITY_PROMPT_TITLE = "Protect your account";

export const lostPhoneHelp = (supportEmail: string): string =>
  supportEmail
    ? `Lost your phone? Use a recovery code if you saved one, or write to ${supportEmail}. We will check it is you before we reset anything.`
    : "Lost your phone? Use a recovery code if you saved one, or use the contact details on our website. We will check it is you before we reset anything.";

/**
 * Invites members to set up two-step verification on Keycloak's own account page. Shown only in
 * browser sign-in builds: a password-form build has no account page to send them to.
 */
const SecurityPrompt = () => {
  if (!BROWSER_SIGN_IN_ENABLED) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.colors.primarySoft,
      }}
    >
      <Text
        accessibilityRole="header"
        style={{ fontSize: 17, fontWeight: "700", color: theme.colors.textPrimary }}
      >
        {SECURITY_PROMPT_TITLE}
      </Text>
      <Text style={{ marginTop: 6, color: theme.colors.textSecondary }}>
        Two-step verification asks for a 6-digit code from an authenticator app as well as your
        password, so someone who finds your password still cannot get in.
      </Text>
      <Text style={{ marginTop: 8, color: theme.colors.textSecondary }}>
        1. Install an authenticator app, such as Google Authenticator or Microsoft Authenticator.
        {"\n"}2. Tap the button below and choose to set up an authenticator app.
        {"\n"}3. Scan the code, type the 6 digits and save. If recovery codes are offered, keep
        them somewhere safe.
      </Text>
      <TouchableOpacity
        onPress={() => WebBrowser.openBrowserAsync(ACCOUNT_SECURITY_URL)}
        accessibilityRole="button"
        accessibilityLabel="Set up two-step verification"
        style={{
          marginTop: 12,
          backgroundColor: theme.colors.primary,
          borderRadius: 10,
          paddingVertical: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#ffffff", fontWeight: "700" }}>Set up two-step verification</Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 10, color: theme.colors.textSecondary }}>
        {lostPhoneHelp(SUPPORT_EMAIL)}
      </Text>
    </View>
  );
};

export default SecurityPrompt;
