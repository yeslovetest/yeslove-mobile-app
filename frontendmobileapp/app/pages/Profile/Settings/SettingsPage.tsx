import Header from '@/app/Universal-components/Header/Header'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import settingsSharedStyles from './SettingsSharedStyles'
import sharedStyles from '../ProfileSharedStyles'
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppDispatch } from '@/app/store/hooks'
import { openTabOnTopAction, TabType } from '@/app/store/Navigation/navigationSlice'
import { useFocusEffect } from "@react-navigation/native";
import { getEmailNotificationSettings, getProfileVisibilitySettings } from '@/app/store/Profile-store/profileSlice'
import { fetchNotificationPreferences } from '@/app/store/Notification-store/notificationSlice'

const SettingsPage = () => {
    const dispatch = useAppDispatch()

    useFocusEffect(React.useCallback(() => {
        dispatch(getEmailNotificationSettings());
        dispatch(getProfileVisibilitySettings());
        dispatch(fetchNotificationPreferences());
    }, []));



    const openGeneral = () => {
    dispatch(openTabOnTopAction( { type: TabType.GENERAL} ))
    }

    const openEmail = () => {
    dispatch(openTabOnTopAction( { type: TabType.EMAIL } ))
    }

    const openProfileVisibility = () => {
    dispatch(openTabOnTopAction( { type: TabType.PROFILE_VISIBILITY } ))
    }

    const openNotificationPreferences = () => {
    dispatch(openTabOnTopAction( { type: TabType.NOTIFICATION_PREFERENCES} ))
    }

    const openExportData = () => {
    dispatch(openTabOnTopAction( { type: TabType.EXPORT_DATA} ))
    }

    return (
        <>
            <Header></Header>
            <View style={sharedStyles.container}>
                <View style={settingsSharedStyles.settingsOptionContainer}>
                    <TouchableOpacity onPress={openGeneral} style={settingsSharedStyles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <MaterialIcons name="display-settings" size={24} color="black" />
                            <Text style={settingsSharedStyles.settingsOptionText}>General</Text>
                        </View>
                        <AntDesign name="right" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={settingsSharedStyles.settingsOptionContainer}>
                    <TouchableOpacity onPress={openEmail} style={settingsSharedStyles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <Fontisto name="email" size={24} color="black" />
                            <Text style={settingsSharedStyles.settingsOptionText}>Email</Text>
                        </View>
                        <AntDesign name="right" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={settingsSharedStyles.settingsOptionContainer}>
                    <TouchableOpacity onPress={openProfileVisibility} style={settingsSharedStyles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <Fontisto name="low-vision" size={24} color="black" />
                            <Text style={settingsSharedStyles.settingsOptionText}>Profile Visibility</Text>
                        </View>
                        <AntDesign name="right" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={settingsSharedStyles.settingsOptionContainer}>
                    <TouchableOpacity onPress={openNotificationPreferences} style={settingsSharedStyles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <Fontisto name="bell" size={24} color="black" />
                            <Text style={settingsSharedStyles.settingsOptionText}>Push Notification Settings</Text>
                        </View>
                        <AntDesign name="right" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={settingsSharedStyles.settingsOptionContainer}>
                    <TouchableOpacity onPress={openExportData} style={settingsSharedStyles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <AntDesign name="export" size={24} color="black" />
                            <Text style={settingsSharedStyles.settingsOptionText}>Export Data</Text>
                        </View>
                        <AntDesign name="right" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

export default SettingsPage
