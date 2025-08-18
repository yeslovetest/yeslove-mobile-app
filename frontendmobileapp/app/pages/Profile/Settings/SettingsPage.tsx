import Header from '@/app/Universal-components/Header/Header'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import styles from './SettingsStyles'
import sharedStyles from '../ProfileSharedStyles'
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAppDispatch } from '@/app/store/hooks'
import { openTabOnTopAction, TabType } from '@/app/store/Navigation/navigationSlice'

const SettingsPage = () => {
    const dispatch = useAppDispatch()

const openGeneral = () => {
  dispatch(openTabOnTopAction( { type: TabType.GENERAL} ))
}

const openEmail = () => {
  dispatch(openTabOnTopAction( { type: TabType.EMAIL} ))
}

const openProfileVisibility = () => {
  dispatch(openTabOnTopAction( { type: TabType.PROFILE_VISIBILITY} ))
}

const openExportData = () => {
  dispatch(openTabOnTopAction( { type: TabType.EXPORT_DATA} ))
}

    return (
        <>
            <Header></Header>
            <View style={sharedStyles.container}>
                <View style={styles.settingsOptionContainer}>
                    <TouchableOpacity onPress={openGeneral} style={styles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <MaterialIcons name="display-settings" size={24} color="black" />
                            <Text style={styles.settingsOptionText}>General</Text>
                        </View>
                        <AntDesign name="right" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={styles.settingsOptionContainer}>
                    <TouchableOpacity onPress={openEmail} style={styles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <Fontisto name="email" size={24} color="black" />
                            <Text style={styles.settingsOptionText}>Email</Text>
                        </View>
                        <AntDesign name="right" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={styles.settingsOptionContainer}>
                    <TouchableOpacity onPress={openProfileVisibility} style={styles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <Fontisto name="low-vision" size={24} color="black" />
                            <Text style={styles.settingsOptionText}>Profile Visibility</Text>
                        </View>
                        <AntDesign name="right" size={24} color="black" />
                    </TouchableOpacity>
                </View>

                <View style={styles.settingsOptionContainer}>
                    <TouchableOpacity onPress={openExportData} style={styles.settingsOptionButton}>
                        <View style={{ flexDirection: "row", height: "100%", alignItems: "center" }}>
                            <AntDesign name="export" size={24} color="black" />
                            <Text style={styles.settingsOptionText}>Export Data</Text>
                        </View>
                        <AntDesign name="right" size={24} color="black" />
                    </TouchableOpacity>
                </View>
            </View>
        </>
    )
}

export default SettingsPage
