import React from 'react'
import { Text, View } from 'react-native';
import styles from '../Profile-styles/ProfileStyles';
import AboutSection from "./AboutSection"
import SettingSection from './SettingSection';
import { useAppSelector } from '@/app/store/hooks';

const ProfileContent = () => {
  let activeTab = useAppSelector(state => state.profile.view.activeTab);
  return (
    <View style={styles.content}>
      {activeTab === "Timeline" && <Text>Timeline Page Content</Text>}
      {activeTab === "About" && <AboutSection/>}
      {activeTab === "Videos" && <Text>Videos Page Content</Text>}
      {activeTab === "Notifications" && <Text>Notifications Page Content</Text>}
      {activeTab === "Photos" && <Text>Photos Page Content</Text>}
      {activeTab === "Settings" && <SettingSection/>}
      {activeTab === "Messages" && <Text>Messages Page Content</Text>}
      {activeTab === "Invitations" && <Text>Invitations Page Content</Text>}
    </View>
  )
}

export default ProfileContent
