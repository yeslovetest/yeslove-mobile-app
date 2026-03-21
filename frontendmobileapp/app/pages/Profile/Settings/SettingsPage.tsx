import Header from '@/app/Universal-components/Header/Header'
import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import settingsSharedStyles from './SettingsSharedStyles'
import sharedStyles from '../ProfileSharedStyles'
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
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



    const openSettingsTab = (type: TabType) => {
        dispatch(openTabOnTopAction({ type }));
    };

    const settingsItems: Array<{
        key: string;
        label: string;
        icon: React.ReactNode;
        tab: TabType;
    }> = [
        {
            key: 'general',
            label: 'General',
            icon: <MaterialIcons name="display-settings" size={22} color="#1f1f1f" />,
            tab: TabType.GENERAL,
        },
        {
            key: 'email',
            label: 'Email',
            icon: <Fontisto name="email" size={20} color="#1f1f1f" />,
            tab: TabType.EMAIL,
        },
        {
            key: 'profileVisibility',
            label: 'Profile Visibility',
            icon: <Fontisto name="low-vision" size={20} color="#1f1f1f" />,
            tab: TabType.PROFILE_VISIBILITY,
        },
        {
            key: 'notifications',
            label: 'Push Notification Settings',
            icon: <Fontisto name="bell" size={20} color="#1f1f1f" />,
            tab: TabType.NOTIFICATION_PREFERENCES,
        },
        {
            key: 'export',
            label: 'Export Data',
            icon: <Ionicons name="share-social-outline" size={20} color="#1f1f1f" />,
            tab: TabType.EXPORT_DATA,
        },
    ];

    return (
        <>
            <Header></Header>
            <ScrollView
                style={sharedStyles.container}
                contentContainerStyle={sharedStyles.contentContainer}
                keyboardShouldPersistTaps="handled"
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
            >
                <View style={settingsSharedStyles.pageHeaderRow}>
                    <Text style={settingsSharedStyles.pageTitle}>Settings</Text>
                    <Text style={settingsSharedStyles.pageSubtitle}>Manage privacy, notifications, and account preferences.</Text>
                </View>

                {settingsItems.map((item) => (
                    <View key={item.key} style={settingsSharedStyles.settingsOptionContainer}>
                        <TouchableOpacity onPress={() => openSettingsTab(item.tab)} style={settingsSharedStyles.settingsOptionButton}>
                            <View style={settingsSharedStyles.settingsOptionLeftRow}>
                                {item.icon}
                                <Text style={settingsSharedStyles.settingsOptionText}>{item.label}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#4e4e4e" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </>
    )
}

export default SettingsPage
