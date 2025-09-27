import { TouchableOpacity, View, Text, Image } from "react-native"
import { useAppDispatch } from "@/app/store/hooks";
import { fetchChatMessages } from "@/app/store/Chat/chatSlice";
import { openTabOnTopAction, TabType } from "@/app/store/Navigation/navigationSlice";
import styles from "./MessageInboxStyles"
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

    
    const displayChatSection = () => {
        dispatch(fetchChatMessages(props.friend?.userId ?? ''));
        dispatch(openTabOnTopAction({ type: TabType.Chat_Section, data: props.friend}));      
    }
      
    
    return (
        <View style={styles.messageContainer} key={props?.key ?? ''}>  
            <TouchableOpacity onPress={displayChatSection}>
                <View style={styles.messageContent}>
                    <Image style={styles.messageImageIcon} source={{ uri: props?.friend?.profilePic }} />
                    <Text style={styles.messageHeaderText}>{props?.friend?.username}</Text>
                </View>
            </TouchableOpacity>
        </View>
    )
};

export default MessageInbox;