import { useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View, Text } from "react-native"
import { logoutAction, setDeleteConfirmation, setUserPassword } from "@/app/store/Auth-store/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import styles from "./GeneralContentStyles";
import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";
import { useMsgToggle } from "@/hooks/messageToggle";

const GeneralContent = () => {
    const dispatch = useAppDispatch();
    const [changePasswordSection, setChangePasswordSection] = useState(false);
    const [deleteAccountSection, setDeleteAccountSection] = useState(false);
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const msgToggle = useMsgToggle();
    const currentPassword = useAppSelector(state => state.user.password);
    const msg = useAppSelector(state => state.auth.message);

    useEffect(() => {   //make the message appear for 3s
        msgToggle.toggleMsg(msg)
      }, [msgToggle.errorMsg, msg]);

      
    const logOut = async () => {
       try {
         const refreshToken = await TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage();
         dispatch(logoutAction(refreshToken || ''));
         
       } catch (error) {
         console.error('Logout error:', error);
       }
    };


    const changePassword = () => {
       if (password === currentPassword) {
         if (newPassword && newPassword === confirmPassword) {
             dispatch(setUserPassword({'new_password':newPassword}));
         }
         else {
           msgToggle.updateErrorMsg('new password does not match or is invalid');
         }
       } 
      else {
         msgToggle.updateErrorMsg('password incorrect');
        }
     }   
    

    const deleteAccount = () => {
        dispatch(setDeleteConfirmation({'confirmation': true}));
    }

   
    return (
        <View style={styles.settingsNavItemContainer}>
            
            <TouchableOpacity style={styles.settingsNavItemContent} 
            onPress={() => setChangePasswordSection((prev) => !prev)}>
                <Text style={styles.sectionText}>Change password</Text>
            </TouchableOpacity>
            {/**Change Password section */}
            {changePasswordSection && (
                <View style={styles.settingsSubSection}>
                {msgToggle.errorMsg && (
                    <Text style={{...styles.sectionText, color: 'red'}}> {msgToggle.errorMsg}</Text>
                )}
                {msgToggle.msg && (
                    <Text style={{...styles.sectionText, color: 'blue'}}> {msgToggle.msg}</Text>
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
            {/**Logout section */}
            <TouchableOpacity style={styles.settingsNavItemContent} onPress={logOut}>
                <Text style={styles.sectionText}>Log out</Text>
            </TouchableOpacity> 
            {/**Delete account section */}
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
    )
};

export default GeneralContent;