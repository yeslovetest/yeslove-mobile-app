import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import CheckBoxList from "../Settings-components/Checkbox/CheckBoxList";
import styles from "../Email/EmailStyles";
import sharedStyles from "../../ProfileSharedStyles";
import { useMsgToggle } from "@/hooks/messageToggle";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import Header from "@/app/Universal-components/Header/Header";
import { changeNotificationPreference, updateNotificationPreferences } from "@/app/store/Notification-store/notificationSlice";



const NotificationPreferences = () => {
    const dispatch = useAppDispatch();
    const currentSettings = useAppSelector(state => state.notification.notificationPreferences);
    const msgToggle = useMsgToggle();
    const msg = useAppSelector(state => state.auth.message);


    const changePreference = (key: string) => {
        dispatch(changeNotificationPreference({ key: key}));
    };

    const saveNotificationPreferences = () => {
        dispatch(updateNotificationPreferences({preferences: currentSettings}));
    };

    const checkBoxList = [
        { label: "Posts", onPress: () => changePreference("posts") },
        { label: "Likes", onPress: () => changePreference("likes") },
        { label: "Comments", onPress: () => changePreference("comments") },
        { label: "Events", onPress: () => changePreference("events") },
        { label: "Blogs", onPress: () => changePreference("blogs") },
    ];

 

    useEffect(() => {
        // make the message appear for 3s
        msgToggle.toggleMsg(msg);
    }, [msgToggle.errorMsg, msg]);

    return (
        <>
        <Header></Header>
        <ScrollView contentContainerStyle={sharedStyles.contentContainer}
                style={sharedStyles.container}>
        <View style={styles.settingsNavItemContainer}>
            <Text style={styles.mainHeaderText}>
                Change Push Notification Settings
            </Text>

            <CheckBoxList
                header="Push Notification"
                items={checkBoxList}
                state={[currentSettings.posts, currentSettings.likes, currentSettings.comments,
                    currentSettings.events, currentSettings.blogs]}
            />

            {msgToggle.msg && (
                <View
                    style={{
                        ...styles.settingsNavItemContent,
                        alignItems: "flex-start",
                    }}
                >
                    <Text
                        style={{
                            ...styles.sectionText,
                            color: "blue",
                            alignSelf: "center",
                        }}
                    >
                        {msgToggle.msg}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                style={styles.saveChangesButton}
                onPress={saveNotificationPreferences}
            >
                <Text style={styles.saveChangesButtonText}>Save Changes</Text>
            </TouchableOpacity>
        </View>
        </ScrollView>
        </>
    );
};

export default NotificationPreferences;
