import React, { useState } from 'react'
import { Text, View } from 'react-native';
import styles from "../../Styles/page-styles/ProfileStyles";
import { useAppSelector } from '@/app/store/hooks';
import { useFocusEffect } from '@react-navigation/native';
import GeneralSetting from './GeneralSettings';
import EmailNtfnSetting from './EmailNtfnSettings';
import ProfileVisSetting from './ProfileVisSettings';
import SectionNavBar from './SectionNavBar';

const SettingSection = () => { 

  const items = ["General", "Email", "Profile Visibility", "Export Data"];
  const [activeTab, setActiveTab] = useState('General');
  const TotalEmailNotificationSettings = 11;  // Total number of email notification settings
  const [currentEmailNotificationSettings, setCurrentEmailNotificationSettings] = useState(Array(TotalEmailNotificationSettings).fill(true));
  const TotalProfileVisibilitySettings = 8;  // Total number of profile visibility settings
  const initialVisibilityValues = Array.from({length: TotalProfileVisibilitySettings}, 
    (_, i) => ['visible', i < 4 ? 'Contact' : 'Education and Other Information']);
  const [currentProfileVisibilitySettings, setCurrentProfileVisibilitySettings] = useState(initialVisibilityValues);
  const emailSettings = useAppSelector(state => state.profile.settings.emailNotificationSettings);
  const profileSettings = useAppSelector(state => state.profile.settings.profileVisibilitySettings);

  useFocusEffect(   // update the email settings on the page
    React.useCallback(() => {
      setCurrentEmailNotificationSettings((prev) => {
        const updated = [...prev];
        emailSettings.forEach(setting => {
          updated[Number(setting.setting_id)] = setting.value;
        });
        return updated;
      });
      }, [emailSettings])
  );

  useFocusEffect(   // update the profile visibility settings on the page
  React.useCallback(() => {
    setCurrentProfileVisibilitySettings((prev) => {
      const updated = [...prev];
      profileSettings.forEach(setting => {
        updated[Number(setting.setting_id)][0] = setting.value;
      });
      return updated;
    });
    }, [profileSettings])
  );

  
  return (
    <View style={styles.aboutNavBarContainer}>
      <SectionNavBar tabItems={items} defaultTab={activeTab}
      onChangeTab={(currentTab) => setActiveTab(currentTab)}/>

      {/**Settings (General Tab) */}
      {activeTab === "General" && (
        <GeneralSetting/>
      )}

      {/**Settings (Email Notification Settings Tab) */}
      {activeTab === "Email" && (
        <EmailNtfnSetting  settings={currentEmailNotificationSettings || []}/>
      )}

      {/**Settings (Profile visibility Settings Tab) */}
      {activeTab === "Profile Visibility" && (
        <ProfileVisSetting settings={currentProfileVisibilitySettings || []}/>
      )}

      {/**Settings (Export Data Tab) */}
      {activeTab === "Export Data" && (
        <View style={styles.settingsNavItemContainer}>
          <Text style={styles.sectionText}>Export your profile data to your local drive</Text>
        </View>
      )}
    </View>  
  )
}

export default SettingSection;