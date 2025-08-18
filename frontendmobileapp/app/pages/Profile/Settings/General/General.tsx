import React, { useState } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import sharedStyles from '../../ProfileSharedStyles'
import styles from './GeneralStyles'
import Header from '@/app/Universal-components/Header/Header'
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAppDispatch } from '@/app/store/hooks'
import { logoutAction } from '@/app/store/Auth-store/authSlice'
import { TOKEN_REFRESH_SERVICE } from '@/ts/token-service'
import DeleteAccountModal from './Delete-account/Modal/DeleteAccountModal'
import ChangePasswordModal from './Change-password/ChangePasswordModal'

const General = () => {
    const dispatch = useAppDispatch()
    const [changePasswordSection, setChangePasswordSection] = useState(false);
    const [deleteAccountSection, setDeleteAccountSection] = useState(false);

    const logOut = async () => {
        try {
            const refreshToken = await TOKEN_REFRESH_SERVICE.loadRefreshTokenFromLocalStorage();
            dispatch(logoutAction(refreshToken || ''));
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <>
            <Header />
            <View style={sharedStyles.container}>
                {/* Logout */}
                <View style={styles.settingsOptionContainer}>
                    <TouchableOpacity onPress={logOut} style={styles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <Feather name="log-out" size={24} color="black" />
                            <Text style={styles.settingsOptionText}>Log out</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Change password */}
                <View style={styles.settingsOptionContainer}>
                    <TouchableOpacity
                        onPress={() => setChangePasswordSection(true)}
                        style={styles.settingsOptionButton}
                    >
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <MaterialIcons name="password" size={24} color="black" />
                            <Text style={styles.settingsOptionText}>Change password</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Delete account */}
                <View style={styles.settingsOptionContainer}>
                    <TouchableOpacity
                        onPress={() => setDeleteAccountSection(true)}
                        style={styles.settingsOptionButton}
                    >
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <AntDesign name="deleteuser" size={24} color="black" />
                            <Text style={styles.settingsOptionText}>Delete account</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Modals */}
                <ChangePasswordModal
                    visible={changePasswordSection}
                    onClose={() => setChangePasswordSection(false)}
                />

                <DeleteAccountModal
                    visible={deleteAccountSection}
                    onClose={() => setDeleteAccountSection(false)}
                />
            </View>
        </>
    )
}

export default General
