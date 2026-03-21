import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import sharedStyles from '../../ProfileSharedStyles'
import settingsSharedStyles from '../SettingsSharedStyles'
import Header from '@/app/Universal-components/Header/Header'
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DeleteAccountModal from './Delete-account/DeleteAccountModal'
import ChangePasswordModal from './Change-password/ChangePasswordModal'
import LogoutModal from './Logout/LogoutModal'
import LoadingOverlay from '@/app/Universal-components/LoadingScreen/Screen';
import { useAppSelector } from '@/app/store/hooks'

const General = () => {
    const [changePasswordSection, setChangePasswordSection] = useState(false);
    const [deleteAccountSection, setDeleteAccountSection] = useState(false);
    const [logoutSection, setLogoutSection] = useState(false)
    const loadingActive = useAppSelector(state => state.profile.loadingScreenActive); //display loading screen when user logging out

    return (
        <>
            <Header />
            <View style={sharedStyles.container}>
                {/* Logout */}
                <View style={settingsSharedStyles.settingsOptionContainer}>
                    <TouchableOpacity onPress={() => setLogoutSection(true)} style={settingsSharedStyles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <Feather name="log-out" size={24} color="black" />
                            <Text style={settingsSharedStyles.settingsOptionText}>Log out</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Change password */}
                <View style={settingsSharedStyles.settingsOptionContainer}>
                    <TouchableOpacity
                        onPress={() => setChangePasswordSection(true)}
                        style={settingsSharedStyles.settingsOptionButton}
                    >
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <MaterialIcons name="password" size={24} color="black" />
                            <Text style={settingsSharedStyles.settingsOptionText}>Change password</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Delete account */}
                <View style={settingsSharedStyles.settingsOptionContainer}>
                    <TouchableOpacity
                        onPress={() => setDeleteAccountSection(true)}
                        style={settingsSharedStyles.settingsOptionButton}
                    >
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <MaterialIcons name="delete-outline" size={24} color="black" />
                            <Text style={settingsSharedStyles.settingsOptionText}>Delete account</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Modals */}
                <LogoutModal  visible={logoutSection}
                    onClose={() => setLogoutSection(false)}></LogoutModal>

                <ChangePasswordModal
                    visible={changePasswordSection}
                    onClose={() => setChangePasswordSection(false)}
                />

                <DeleteAccountModal
                    visible={deleteAccountSection}
                    onClose={() => setDeleteAccountSection(false)}
                />
                
            </View>
            <LoadingOverlay visible={loadingActive} />
        </>
    )
}

export default General
