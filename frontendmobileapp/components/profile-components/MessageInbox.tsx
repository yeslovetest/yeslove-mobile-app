import { useEffect, useState } from "react";
import { TextInput, TouchableOpacity, View, Text } from "react-native"
import { logoutAction, setDeleteConfirmation, setUserPassword } from "@/app/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import styles from "@/Styles/page-styles/ProfileStyles"
import { TOKEN_REFRESH_SERVICE } from "@/ts/token-service";
import { useMsgToggle } from "@/hooks/messageToggle";
import { TabType } from "@/app/store/navigationSlice";

export interface Friend {
    username: string,
    userId: string,  
    profilePic: string,
}

interface Props {
    friend?: Friend,
    key?: any,  
}

const MessageInbox = (props: Props) => {
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
    
    const displayChatSection = () => {
        dispatch(retrievePostReactions({postId: props.post.id ?? 0}));
        dispatch(openTabOnTopAction({ type: TabType.Chat_Section, data: props.friend}));
        dispatch(setPostReactionTab(tab))   
    }
      
    
    return (
        <View style={styles.settingsNavItemContainer} key={props?.key ?? ''}>  
            <TouchableOpacity style={styles.settingsNavItemContent} 
            onPress={displayChatSection}>
                <Image style={styles.profileImage} source={{ uri: props?.friend?.profilePic }} />
                <Text style={styles.sectionText}>{props?.friend?.username}</Text>
            </TouchableOpacity>
        </View>
    )
};

export default MessageInbox;