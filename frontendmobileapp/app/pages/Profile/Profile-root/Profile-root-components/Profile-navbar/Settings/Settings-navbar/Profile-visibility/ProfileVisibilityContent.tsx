import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import CheckBoxList from "../Checkbox/CheckBoxList";
import styles from "./ProfileVisibilityContentStyles";
import { useMsgToggle } from "@/hooks/messageToggle";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setProfileVisibility, updateProfileVisibilitySettings} from "@/app/store/Profile-store/profileSlice";

interface Props {
    settings?: string[][];  
 }

const ProfileVisibilityContent = (props: Props) => {
    const dispatch = useAppDispatch();
    const currentSettings = props?.settings ?? [];
    const msgToggle = useMsgToggle();
    const msg = useAppSelector(state => state.auth.message);
    const checkBoxList1 = [
        {label: 'Email',
         onPress: () => changeProfileSetting(0, 'Contact')
        },
        {label: 'Phone' ,
         onPress: () => changeProfileSetting(1, 'Contact')
        },
        {label: 'Address',
         onPress: () => changeProfileSetting(2, 'Contact')
        },
        {label: 'Website',
         onPress: () => changeProfileSetting(3, 'Contact')
        },
    ];
    const checkBoxList2 = [
        {label: 'Birthday',
         onPress: () => changeProfileSetting(4, 'Education And Other Info')
        },
        {label: 'Education',
         onPress: () => changeProfileSetting(5, 'Education And Other Info')
        },
        {label: 'Institution',
         onPress: () => changeProfileSetting(6, 'Education And Other Info')
        },
        {label: 'Employment',
         onPress: () => changeProfileSetting(7, 'Education And Other Info')
        },
    ];
   

    useEffect(() => {   //make the message appear for 3s
        msgToggle.toggleMsg(msg);
    }, [msgToggle.errorMsg, msg]);

    const changeProfileSetting = (settingId: number, category: string) => {
    //change one profile visibility setting
        dispatch(setProfileVisibility({id: settingId, category: category }));
    }
    
    const saveProfileVisibilitySettings = () => {  // update the database
        const updatedSettings = currentSettings.map((value, id) => ({
            setting_id: String(id),
            value: value[0],
            category: value[1]
        }));
        dispatch(updateProfileVisibilitySettings({ settings: updatedSettings }));
    }

    return (
        <View style={styles.settingsNavItemContainer}>
            <Text style={styles.mainHeaderText}>Make your profile information visible to others</Text>
            
            <CheckBoxList header="Contact" items={checkBoxList1} 
            state={[currentSettings[0][0]==='visible', currentSettings[1][0]==='visible', 
            currentSettings[2][0]==='visible', currentSettings[3][0]==='visible']}/>         

            <CheckBoxList header="Education And Other Info" items={checkBoxList2} 
            state={[currentSettings[4][0]==='visible', currentSettings[5][0]==='visible', 
            currentSettings[6][0]==='visible', currentSettings[7][0]==='visible']}/>
            
            {msgToggle.msg && (
                <View style={{...styles.settingsNavItemContent, alignItems: 'flex-start'}} >  
                    <Text style={{...styles.sectionText, color: 'blue', alignSelf: 'center'}}> 
                        {msgToggle.msg}
                    </Text>
                </View>
            )}     
            
            <TouchableOpacity style={styles.saveChangesButton} onPress={saveProfileVisibilitySettings}>
                <Text style={styles.saveChangesButtonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>
    )
};

export default ProfileVisibilityContent