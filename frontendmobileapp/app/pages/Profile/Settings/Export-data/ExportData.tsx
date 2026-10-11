import Header from "@/app/Universal-components/Header/Header";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/app/theme";
import sharedStyles from "../../ProfileSharedStyles";
import settingsSharedStyles from "../SettingsSharedStyles";
import { exportMyData } from "@/app/services/dataExport";
import { getApiMessage } from "@/app/store/sagas/sagaHelpers";

const ExportData = () => {
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    try {
      const result = await exportMyData();
      if (result.status === "unavailable") {
        Alert.alert("Can't share files here", "This device can't open the share sheet.");
      }
    } catch (error) {
      Alert.alert(
        "Couldn't export your data",
        getApiMessage(error) || "Please check your connection and try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Header></Header>
      <ScrollView
        style={sharedStyles.container}
        contentContainerStyle={sharedStyles.contentContainer}
      >
        <View style={settingsSharedStyles.pageHeaderRow}>
          <Text accessibilityRole="header" style={settingsSharedStyles.pageTitle}>
            Export your data
          </Text>
          <Text style={settingsSharedStyles.pageSubtitle}>
            Download a copy of the personal data YesLove holds about you: your account details,
            posts, comments, messages, followers, uploaded files, notifications and settings.
          </Text>
        </View>

        <View style={settingsSharedStyles.settingsOptionContainer}>
          <TouchableOpacity
            onPress={handleExport}
            disabled={busy}
            style={settingsSharedStyles.settingsOptionButton}
            accessibilityRole="button"
            accessibilityLabel="Download my data"
            accessibilityState={{ disabled: busy, busy }}
          >
            <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
              <Ionicons name="download-outline" size={24} color={theme.colors.textPrimary} />
              <Text style={settingsSharedStyles.settingsOptionText}>Download my data</Text>
            </View>
            {busy && <ActivityIndicator color={theme.colors.primary} />}
          </TouchableOpacity>
        </View>

        <Text style={[settingsSharedStyles.pageSubtitle, { marginTop: theme.spacing.md }]}>
          The file is a JSON document. Messages include both sides of each conversation. It contains
          personal information, so keep it somewhere safe.
        </Text>
      </ScrollView>
    </>
  );
};

export default ExportData;
