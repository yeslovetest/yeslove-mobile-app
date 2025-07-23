import React, { useEffect, useState } from 'react'
import { Text, View, TouchableOpacity, TextInput, Button } from 'react-native';
import CheckBox from './CheckBox';
import styles from "../../Styles/page-styles/ProfileStyles";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { TOKEN_REFRESH_SERVICE } from '@/ts/token-service';
import { AuthApiFactory } from '@/generated-api';
import { LoginState, setLoginStateAction, setMessage, setUserPassword } from '@/app/store/authSlice';
import { changeTabAction, TabType } from '@/app/store/navigationSlice';
import { setFeedDataAction } from '@/app/store/feedSlice';


const SettingSection = () => {  
  const dispatch = useAppDispatch();

  const items = ["General", "Email", "Profile Visibility", "Export Data"];
  const [activeTab, setActiveTab] = useState('General');
  const [changePasswordSection, setChangePasswordSection] = useState(false);
  const [deleteAccountSection, setDeleteAccountSection] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const currentPassword = useAppSelector(state => state.user.password);
  const msg = useAppSelector(state => state.auth.message);
  
  const logOut = async () => {
  try {
    const refreshToken = await TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage();
    await AuthApiFactory().postLogout({ refresh_token: refreshToken || '' })
    TOKEN_REFRESH_SERVICE.stopRefreshingToken();
    await TOKEN_REFRESH_SERVICE.saveRefreshTokenToLocalStorage('');
    await TOKEN_REFRESH_SERVICE.saveUserIdToLocalStorage('');
    dispatch(setLoginStateAction(LoginState.LOGGED_OUT));
    dispatch(changeTabAction({ type: TabType.HOME }));
    dispatch(setFeedDataAction([]))
  } catch (error) {
    console.error('Logout error:', error);
  }
  };
  
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDisplay, setErrorDisplay ] = useState("none");
  const [msgDisplay, setMsgDisplay ] = useState("none");

  const hideError = () => {
    setErrorMessage('');
    setErrorDisplay('none');
    dispatch(setMessage(''));
    setMsgDisplay('none')
  }

  useEffect(() => {
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

               {activeTab === "General" && (
                  <View style={styles.settingsNavItemContainer}>
    
                    <TouchableOpacity style={styles.settingsNavItemContent} 
                    onPress={() => setChangePasswordSection((prev) => !prev)}>
                      <Text style={styles.sectionText}>Change password</Text>
                    </TouchableOpacity>

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
                    <TouchableOpacity style={styles.settingsNavItemContent} onPress={logOut}>
                      <Text style={styles.sectionText}>Log out</Text>
                    </TouchableOpacity> 
                    <TouchableOpacity style={styles.settingsNavItemContent} onPress={() => setDeleteAccountSection((prev) => !prev)}>
                      <Text style={styles.sectionText}>Delete account</Text>
                    </TouchableOpacity>
                    {deleteAccountSection && (
                      <View style={styles.settingsSubSection}>
                        <Text>Are you sure you want to delete this account? </Text>
                        <TouchableOpacity style={styles.saveChangesButton}>
                          <Text style={styles.saveChangesButtonText}>Delete Account</Text>
                        </TouchableOpacity>
                      </View>
                    )} 
                  </View>
                )}

                {activeTab === "Email" && (
                  <View style={styles.settingsNavItemContainer}>
                    <Text style={styles.headerText}>receive email notifications for</Text>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Activity</Text>
                      <CheckBox text='when tagged in an any post or comment'/>
                      <CheckBox text='when your post or comment gets a reply'/>         
                    </View>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Messages</Text>
                      <CheckBox text='when you receive a new message'/>         
                    </View>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Members</Text>
                      <CheckBox text='when you receive a membership invitation'/>         
                    </View>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Friends</Text>
                      <CheckBox text='when you receive a friendship request'/>  
                      <CheckBox text='when a memeber accepts your friendship request'/>       
                    </View>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Groups</Text>
                      <CheckBox text='when you receive an invite to join a group'/>  
                      <CheckBox text='when group information is updated'/>   
                      <CheckBox text='when you a promoted to group admin or moderator'/>
                      <CheckBox text='when a member requests to join a group for which you are an admin'/>
                      <CheckBox text='when you get a response to your request for joining a group'/>    
                    </View>

                    <TouchableOpacity style={styles.saveChangesButton}>
                      <Text style={styles.saveChangesButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {activeTab === "Profile Visibility" && (
                  <View style={styles.settingsNavItemContainer}>
                    <Text style={styles.headerText}>Make your profile information visible to others</Text>
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Contact</Text>
                      <CheckBox text='Email'/>
                      <CheckBox text='Phone'/>   
                      <CheckBox text='Address'/>  
                      <CheckBox text='Website'/>    
                    </View>
                   
                    <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >
                      <Text style={[styles.headerText, styles.headerText2]}>Education And Other Info</Text>
                      <CheckBox text='Birthday'/>
                      <CheckBox text='Education'/>   
                      <CheckBox text='Institution'/>  
                      <CheckBox text='Employment'/>     
                    </View>

                    <TouchableOpacity style={styles.saveChangesButton}>
                      <Text style={styles.saveChangesButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {activeTab === "Export Data" && (
                  <View style={styles.settingsNavItemContainer}>
                    <Text style={styles.sectionText}>Export your profile data to your local drive</Text>
                  </View>
                )}

        </View>  

         {/***
                      {<TouchableOpacity key={tab} style={styles.navItem} onPress={logOut}>
                <Text style={styles.navText}>{tab}</Text>
              
              </TouchableOpacity> */ }
    </View>
  )
}

export default SettingSection;