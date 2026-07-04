import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import CheckBoxList from "../Settings-components/Checkbox/CheckBoxList";
import styles from "../Email/EmailStyles";
import sharedStyles from "../../ProfileSharedStyles";
import { useMsgToggle } from "@/hooks/messageToggle";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setProfileVisibility,
  updateProfileVisibilitySettings,
} from "@/app/store/Profile-store/profileSlice";
import Header from "@/app/Universal-components/Header/Header";

interface Props {
  settings?: string[][];
}

const ProfileVisibility = (props: Props) => {
  const dispatch = useAppDispatch();
  const currentSettings = props?.settings ?? [];
  const msgToggle = useMsgToggle();
  const msg = useAppSelector((state) => state.auth.message);

  const isVisible = (index: number) => currentSettings[index]?.[0] === "visible";

  const changeProfileSetting = (settingId: number, category: string) => {
    dispatch(setProfileVisibility({ id: settingId, category }));
  };

  const saveProfileVisibilitySettings = () => {
    const updatedSettings = currentSettings.map((value, id) => ({
      setting_id: String(id),
      value: value?.[0] ?? "hidden",
      category: value?.[1] ?? "",
    }));
    dispatch(updateProfileVisibilitySettings({ settings: updatedSettings }));
  };

  const checkBoxList1 = [
    { label: "Email", onPress: () => changeProfileSetting(0, "Contact") },
    { label: "Phone", onPress: () => changeProfileSetting(1, "Contact") },
    { label: "Address", onPress: () => changeProfileSetting(2, "Contact") },
    { label: "Website", onPress: () => changeProfileSetting(3, "Contact") },
  ];

  const checkBoxList2 = [
    { label: "Birthday", onPress: () => changeProfileSetting(4, "Education And Other Info") },
    { label: "Education", onPress: () => changeProfileSetting(5, "Education And Other Info") },
    { label: "Institution", onPress: () => changeProfileSetting(6, "Education And Other Info") },
    { label: "Employment", onPress: () => changeProfileSetting(7, "Education And Other Info") },
  ];

  useEffect(() => {
    // make the message appear for 3s
    msgToggle.toggleMsg(msg);
  }, [msgToggle.errorMsg, msg]);

  return (
    <>
      <Header></Header>
      <ScrollView
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
      >
        <View style={styles.settingsNavItemContainer}>
          <Text style={styles.mainHeaderText}>Make your profile information visible to others</Text>

          <CheckBoxList
            header="Contact"
            items={checkBoxList1}
            state={[isVisible(0), isVisible(1), isVisible(2), isVisible(3)]}
          />

          <CheckBoxList
            header="Education And Other Info"
            items={checkBoxList2}
            state={[isVisible(4), isVisible(5), isVisible(6), isVisible(7)]}
          />

          {msgToggle.msg && (
            <View
              style={{
                ...styles.settingsNavItemContent,
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  ...styles.sectionText,
                  color: "blue",
                  alignSelf: "center",
                }}
              >
                {msgToggle.msg}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.saveChangesButton}
            onPress={saveProfileVisibilitySettings}
          >
            <Text style={styles.saveChangesButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default ProfileVisibility;
