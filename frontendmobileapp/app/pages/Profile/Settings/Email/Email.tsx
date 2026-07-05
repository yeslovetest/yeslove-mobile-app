import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import CheckBoxList from "../Settings-components/Checkbox/CheckBoxList";
import styles from "./EmailStyles";
import sharedStyles from "../../ProfileSharedStyles";
import { useMsgToggle } from "@/hooks/messageToggle";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  setEmailNotification,
  updateEmailNotificationSettings,
} from "@/app/store/Profile-store/profileSlice";
import Header from "@/app/Universal-components/Header/Header";

interface Props {
  settings?: boolean[];
}

const Email = (props: Props) => {
  const dispatch = useAppDispatch();
  const currentSettings = props?.settings ?? [];
  const msgToggle = useMsgToggle();
  const msg = useAppSelector((state) => state.auth.message);

  const checkBoxList1 = [
    { label: "when tagged in an any post or comment", onPress: () => changeEmailSetting(0) },
    { label: "when your post or comment gets a reply", onPress: () => changeEmailSetting(1) },
  ];
  const checkBoxList2 = [
    { label: "when you receive a new message", onPress: () => changeEmailSetting(2) },
  ];
  const checkBoxList3 = [
    { label: "when you receive a membership invitation", onPress: () => changeEmailSetting(3) },
  ];
  const checkBoxList4 = [
    { label: "when you receive a friendship request", onPress: () => changeEmailSetting(4) },
    {
      label: "when a member accepts your friendship request",
      onPress: () => changeEmailSetting(5),
    },
  ];
  const checkBoxList5 = [
    { label: "when you receive an invite to join a group", onPress: () => changeEmailSetting(6) },
    { label: "when group information is updated", onPress: () => changeEmailSetting(7) },
    {
      label: "when you a promoted to group admin or moderator",
      onPress: () => changeEmailSetting(8),
    },
    {
      label: "when a member requests to join a group for which you are an admin",
      onPress: () => changeEmailSetting(9),
    },
    {
      label: "when you get a response to your request for joining a group",
      onPress: () => changeEmailSetting(10),
    },
  ];

  useEffect(() => {
    //make the message appear for 3s
    msgToggle.toggleMsg(msg);
  }, [msgToggle.errorMsg, msg]);

  const changeEmailSetting = (settingId: number) => {
    //change one email notification setting
    dispatch(setEmailNotification({ id: settingId }));
  };

  const saveEmailNotificationSettings = () => {
    // update the database
    const updatedSettings = currentSettings.map((value, id) => ({
      setting_id: String(id),
      value: value,
    }));
    dispatch(updateEmailNotificationSettings({ settings: updatedSettings }));
  };

  return (
    <>
      <Header></Header>
      <ScrollView
        contentContainerStyle={sharedStyles.contentContainer}
        style={sharedStyles.container}
      >
        <View style={styles.settingsNavItemContainer}>
          <Text style={styles.mainHeaderText}>receive email notifications for</Text>

          <CheckBoxList
            header="Activity"
            items={checkBoxList1}
            state={[currentSettings[0], currentSettings[1]]}
          />

          <CheckBoxList header="Messages" items={checkBoxList2} state={[currentSettings[2]]} />

          <CheckBoxList header="Members" items={checkBoxList3} state={[currentSettings[3]]} />

          <CheckBoxList
            header="Friends"
            items={checkBoxList4}
            state={[currentSettings[4], currentSettings[5]]}
          />

          <CheckBoxList
            header="Groups"
            items={checkBoxList5}
            state={[
              currentSettings[6],
              currentSettings[7],
              currentSettings[8],
              currentSettings[9],
              currentSettings[10],
            ]}
          />

          {msgToggle.msg && (
            <View style={styles.settingsNavItemContent}>
              <Text style={{ ...styles.sectionText, color: "blue", alignSelf: "center" }}>
                {msgToggle.msg}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.saveChangesButton}
            onPress={saveEmailNotificationSettings}
          >
            <Text style={styles.saveChangesButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default Email;
