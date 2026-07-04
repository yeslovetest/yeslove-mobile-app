import React from "react";
import Email from "./Email";
import { useAppSelector } from "@/app/store/hooks";

const EmailNtfnSettings = () => {
  const TotalEmailNotificationSettings = 11; // Total number of email notification settings
  const emailSettings = useAppSelector((state) => state.profile.settings.emailNotificationSettings);

  const currentEmailNotificationSettings = React.useMemo(() => {
    // create changes on screen from redux store
    const updated = Array(TotalEmailNotificationSettings).fill(false); // default unchecked
    emailSettings.forEach((setting) => {
      updated[Number(setting.setting_id)] = setting.value;
    });
    return updated;
  }, [emailSettings]);

  return <Email settings={currentEmailNotificationSettings}></Email>;
};

export default EmailNtfnSettings;
