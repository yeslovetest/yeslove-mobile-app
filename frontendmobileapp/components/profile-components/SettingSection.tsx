import React, { useEffect, useState } from 'react'
import { Text, View, TouchableOpacity } from 'react-native';
import CheckBox from './CheckBox';
import styles from "../../Styles/page-styles/ProfileStyles";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {  setProfileVisibility, updateProfileVisibilitySettings } from '@/app/store/profileSlice';
import { useFocusEffect } from '@react-navigation/native';
import { useMsgToggle } from "@/hooks/messageToggle";
import GeneralSetting from './GeneralSettings';
import EmailNtfnSetting from './EmailNtfnSettings';

const SettingSection = () => { 

  const dispatch = useAppDispatch();
  const TotalEmailNotificationSettings = 11;  // Total number of email notification settings
  const [currentEmailNotificationSettings, setCurrentEmailNotificationSettings] = useState(Array(TotalEmailNotificationSettings).fill(true));
  const TotalProfileVisibilitySettings = 8;  // Total number of profile visibility settings
  const items = ["General", "Email", "Profile Visibility", "Export Data"];
  const [activeTab, setActiveTab] = useState('General');
  
  const initialVisibilityValues = Array.from({length: TotalProfileVisibilitySettings}, 
    (_, i) => ['visible', i < 4 ? 'Contact' : 'Education and Other Information']);
  const [currentProfileVisibilitySettings, setCurrentProfileVisibilitySettings] = useState(initialVisibilityValues);
  const msg = useAppSelector(state => state.auth.message);
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
  



  const changeProfileSetting = (settingId: number, category: string) => {
    //change one profile visibility setting
    dispatch(setProfileVisibility({id: settingId, category: category }));
  }

  const saveProfileVisibilitySettings = () => {  // update the database
    const updatedSettings = currentProfileVisibilitySettings.map((value, id) => ({
      setting_id: String(id),
      value: value[0],
      category: value[1]
    }));
    dispatch(updateProfileVisibilitySettings({ settings: updatedSettings }));
  }

  


  


 


  return (
    <View>
        <View style={styles.aboutNavBarContainer}>
          <View style={{...styles.aboutNavBar, justifyContent: 'space-evenly'}}>
            {items.map((tab) => (
              <TouchableOpacity key={tab} style={[styles.settingsNavItem, activeTab === tab && styles.activeAboutItem]} 
                onPress={() => setActiveTab(tab)}>
                <Text style={[styles.navText, activeTab === tab && styles.activeAboutNavText]}>{tab}</Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </View>

              {/**Settings (General Tab) */}
               {activeTab === "General" && (
                  <GeneralSetting/>
                )}

                {/**Settings (Email Notification Settings Tab) */}
                {activeTab === "Email" && (
                  <EmailNtfnSetting  />
                )}

                {/**Settings (Profile visibility Settings Tab) */}
                {activeTab === "Profile Visibility" && (
                  <View style={styles.settingsNavItemContainer}>
                    <Text style={styles.headerText}>Make your profile information visible to others</Text>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Contact</Text>
                      <CheckBox text='Email' 
                        value={currentProfileVisibilitySettings[0][0] === 'visible'}
                        btnPress={() => changeProfileSetting(0, 'Contact')}/>
                      <CheckBox text='Phone'
                        value={currentProfileVisibilitySettings[1][0] === 'visible'}
                        btnPress={() => changeProfileSetting(1, 'Contact')}/>   
                      <CheckBox text='Address'
                        value={currentProfileVisibilitySettings[2][0] === 'visible'}
                        btnPress={() => changeProfileSetting(2, 'Contact')}/>  
                      <CheckBox text='Website'
                        value={currentProfileVisibilitySettings[3][0] === 'visible'}
                        btnPress={() => changeProfileSetting(3, 'Contact')}/>    
                    </View>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Education And Other Info</Text>
                      <CheckBox text='Birthday'
                        value={currentProfileVisibilitySettings[4][0] === 'visible'}
                        btnPress={() => changeProfileSetting(4, 'Education And Other Info')}/>
                      <CheckBox text='Education'
                        value={currentProfileVisibilitySettings[5][0] === 'visible'}
                        btnPress={() => changeProfileSetting(5, 'Education And Other Info')}/>   
                      <CheckBox text='Institution'
                        value={currentProfileVisibilitySettings[6][0] === 'visible'}
                        btnPress={() => changeProfileSetting(6, 'Education And Other Info')}/>  
                      <CheckBox text='Employment'
                        value={currentProfileVisibilitySettings[7][0] === 'visible'}
                        btnPress={() => changeProfileSetting(7, 'Education And Other Info')}/>  
                      {msg && (
                        <Text style={{...styles.sectionText, color: 'blue', alignSelf: 'center'}}> {msg}</Text>
                      )}     
                    </View>
                    <TouchableOpacity style={styles.saveChangesButton} onPress={saveProfileVisibilitySettings}>
                      <Text style={styles.saveChangesButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/**Settings (Export Data Tab) */}
                {activeTab === "Export Data" && (
                  <View style={styles.settingsNavItemContainer}>
                    <Text style={styles.sectionText}>Export your profile data to your local drive</Text>
                  </View>
                )}
        </View>  
    </View>
  )
}

export default SettingSection;