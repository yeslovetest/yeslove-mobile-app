import { View, Text, TouchableOpacity } from "react-native";
import CheckBox from "./CheckBox";
import styles from "@/Styles/page-styles/ProfileStyles";
import { useMsgToggle } from "@/hooks/messageToggle";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import React, { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { setEmailNotification, updateEmailNotificationSettings } from "@/app/store/profileSlice";


interface props
const EmailNtfnSetting = (props: props) => {
    const dispatch = useAppDispatch();
    const TotalEmailNotificationSettings = 11;  // Total number of email notification settings
    const [currentEmailNotificationSettings, setCurrentEmailNotificationSettings] = useState(Array(TotalEmailNotificationSettings).fill(true));
    const msgToggle = useMsgToggle();
    const emailSettings = useAppSelector(state => state.profile.settings.emailNotificationSettings);
    const msg = useAppSelector(state => state.auth.message);
    
    useEffect(() => {   //make the message appear for 3s
        msgToggle.toggleMsg(msg);
    }, [msgToggle.errorMsg, msg]);




    const changeEmailSetting = (settingId: number) => { 
    //change one email notification setting
    dispatch(setEmailNotification({id: settingId}));
    }


    const saveEmailNotificationSettings = () => {  // update the database
        const updatedSettings = settings.map((value, id) => ({
            setting_id: String(id),
            value: value
        }));
        dispatch(updateEmailNotificationSettings({ settings: updatedSettings }));
    }


    return (
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
                <CheckBox text='when a member accepts your friendship request'
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
                {msgToggle.msg && (
                    <Text style={{...styles.sectionText, color: 'blue', alignSelf: 'center'}}> 
                        {msgToggle.msg}
                    </Text>
                )}     
            </View>
            <TouchableOpacity style={styles.saveChangesButton} onPress={saveEmailNotificationSettings}>
                <Text style={styles.saveChangesButtonText}>Save Changes</Text>
            </TouchableOpacity>
            </View>
    )
};

export default EmailNtfnSetting;