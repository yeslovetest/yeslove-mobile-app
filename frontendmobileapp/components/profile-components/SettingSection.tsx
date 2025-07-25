import React, { useEffect, useState } from 'react'
import { Text, View, TouchableOpacity, TextInput } from 'react-native';
import CheckBox from './CheckBox';
import styles from "../../Styles/page-styles/ProfileStyles";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { TOKEN_REFRESH_SERVICE } from '@/ts/token-service';
import { logoutAction, setDeleteConfirmation, setMessage, setUserPassword } from '@/app/store/authSlice';
import { setEmailNotification, setProfileVisibility, updateEmailNotificationSettings, updateProfileVisibilitySettings } from '@/app/store/profileSlice';
import { useFocusEffect } from '@react-navigation/native';


const SettingSection = () => { 

  const dispatch = useAppDispatch();
  const TotalEmailNotificationSettings = 11;  // Total number of email notification settings
  const TotalProfileVisibilitySettings = 8;  // Total number of profile visibility settings
  const items = ["General", "Email", "Profile Visibility", "Export Data"];
  const [activeTab, setActiveTab] = useState('General');
  const [changePasswordSection, setChangePasswordSection] = useState(false);
  const [deleteAccountSection, setDeleteAccountSection] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDisplay, setErrorDisplay ] = useState("none");
  const [msgDisplay, setMsgDisplay ] = useState("none");
  const [currentEmailNotificationSettings, setCurrentEmailNotificationSettings] = useState(Array(TotalEmailNotificationSettings).fill(true));
  const initialVisibilityValues = Array.from({length: TotalProfileVisibilitySettings}, 
    (_, i) => ['visible', i < 4 ? 'Contact' : 'Education and Other Information']);
  const [currentProfileVisibilitySettings, setCurrentProfileVisibilitySettings] = useState(initialVisibilityValues);
  const currentPassword = useAppSelector(state => state.user.password);
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
  


  const logOut = async () => {
    try {
      const refreshToken = await TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage();
      dispatch(logoutAction(refreshToken || ''));
      
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const changeEmailSetting = (settingId: number) => { 
    //change one email notification setting
    dispatch(setEmailNotification({id: settingId}));
  }

  const saveEmailNotificationSettings = () => {  // update the database
    const updatedSettings = currentEmailNotificationSettings.map((value, id) => ({
      setting_id: String(id),
      value: value
    }));
    dispatch(updateEmailNotificationSettings({ settings: updatedSettings }));
  }

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


  const hideError = () => {
    setErrorMessage('');
    setErrorDisplay('none');
    dispatch(setMessage(''));
    setMsgDisplay('none')
  }

  useEffect(() => {   //make the message appear for 3s
    if (errorMessage){
      setErrorDisplay('flex');
    } else if (msg) {
      setMsgDisplay('flex');
    }
    
    const timer = setTimeout(() => {
      hideError(); 
    }, 3000);
    return () => clearTimeout(timer);
  }, [errorMessage, msg]);


  const changePassword = () => {
    if (password === currentPassword) {
      if (newPassword && newPassword === confirmPassword) {
          dispatch(setUserPassword({'new_password':newPassword}));
      }
      else {
        setErrorMessage('new password does not match or is invalid');
      }
    } 
    else {
      setErrorMessage('password incorrect');
     }
  }  

  const deleteAccount = () => {
    dispatch(setDeleteConfirmation({'confirmation': true}));
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
                  <View style={styles.settingsNavItemContainer}>
    
                    <TouchableOpacity style={styles.settingsNavItemContent} 
                    onPress={() => setChangePasswordSection((prev) => !prev)}>
                      <Text style={styles.sectionText}>Change password</Text>
                    </TouchableOpacity>
                    {/**(General Tab)-Change Password section */}
                    {changePasswordSection && (
                      <View style={styles.settingsSubSection}>
                        {errorMessage && (
                          <Text style={{...styles.sectionText, color: 'red'}}> {errorMessage}</Text>
                        )}
                        {msg && (
                          <Text style={{...styles.sectionText, color: 'blue'}}> {msg}</Text>
                        )}
                        <TextInput
                          style={styles.subSectionInput}
                          placeholder='Enter current password'
                          value={password}
                          onChangeText={(val) => setPassword(val)}
                          secureTextEntry
                        />
                        <TextInput
                          style={styles.subSectionInput}
                          placeholder='Enter new password'
                          value={newPassword}
                          onChangeText={(val) => setNewPassword(val)}
                          secureTextEntry
                        />
                        <TextInput
                          style={styles.subSectionInput}
                          placeholder='Confirm new password'
                          value={confirmPassword}
                          onChangeText={(val) => setConfirmPassword(val)}
                          secureTextEntry
                        />
                        <TouchableOpacity style={styles.saveChangesButton} onPress={changePassword}>
                          <Text style={styles.saveChangesButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                      </View>
                    )} 
                    {/**(General Tab)-Logout section */}
                    <TouchableOpacity style={styles.settingsNavItemContent} onPress={logOut}>
                      <Text style={styles.sectionText}>Log out</Text>
                    </TouchableOpacity> 
                    {/**(General Tab)-Delete account section */}
                    <TouchableOpacity style={styles.settingsNavItemContent} onPress={() => setDeleteAccountSection((prev) => !prev)}>
                      <Text style={styles.sectionText}>Delete account</Text>
                    </TouchableOpacity>
                    {deleteAccountSection && (
                      <View style={styles.settingsSubSection}>
                        <Text>Are you sure you want to delete this account? </Text>
                        <TouchableOpacity style={styles.saveChangesButton} onPress={deleteAccount}>
                          <Text style={styles.saveChangesButtonText}>Delete Account</Text>
                        </TouchableOpacity>
                      </View>
                    )} 
                  </View>
                )}

                {/**Settings (Email Notification Settings Tab) */}
                {activeTab === "Email" && (
                  <View style={styles.settingsNavItemContainer}>
                    <Text style={styles.headerText}>receive email notifications for</Text>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Activity</Text>
                      <CheckBox text='when tagged in an any post or comment' 
                        value={currentEmailNotificationSettings[0]}
                        btnPress={() => changeEmailSetting(0)}/>
                      <CheckBox text='when your post or comment gets a reply' 
                        value={currentEmailNotificationSettings[1]}
                        btnPress={() => changeEmailSetting(1)}/>         
                    </View>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Messages</Text>
                      <CheckBox text='when you receive a new message'
                        value={currentEmailNotificationSettings[2]}
                        btnPress={() => changeEmailSetting(2)}/>        
                    </View>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Members</Text>
                      <CheckBox text='when you receive a membership invitation'
                        value={currentEmailNotificationSettings[3]}
                        btnPress={() => changeEmailSetting(3)}/>         
                    </View>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Friends</Text>
                      <CheckBox text='when you receive a friendship request'
                        value={currentEmailNotificationSettings[4]}
                        btnPress={() => changeEmailSetting(4)}/>  
                      <CheckBox text='when a memeber accepts your friendship request'
                        value={currentEmailNotificationSettings[5]}
                        btnPress={() => changeEmailSetting(5)}/>       
                    </View>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Groups</Text>
                      <CheckBox text='when you receive an invite to join a group'
                        value={currentEmailNotificationSettings[6]}
                        btnPress={() => changeEmailSetting(6)}/>  
                      <CheckBox text='when group information is updated'
                        value={currentEmailNotificationSettings[7]}
                        btnPress={() => changeEmailSetting(7)}/>   
                      <CheckBox text='when you a promoted to group admin or moderator'
                        value={currentEmailNotificationSettings[8]}
                        btnPress={() => changeEmailSetting(8)}/>
                      <CheckBox text='when a member requests to join a group for which you are an admin'
                        value={currentEmailNotificationSettings[9]}
                        btnPress={() => changeEmailSetting(9)}/>
                      <CheckBox text='when you get a response to your request for joining a group'
                        value={currentEmailNotificationSettings[10]}
                        btnPress={() => changeEmailSetting(10)}/>  
                      {msg && (
                        <Text style={{...styles.sectionText, color: 'blue', alignSelf: 'center'}}> {msg}</Text>
                      )}     
                    </View>
                    <TouchableOpacity style={styles.saveChangesButton} onPress={saveEmailNotificationSettings}>
                      <Text style={styles.saveChangesButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
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