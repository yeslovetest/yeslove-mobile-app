import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './ProfileNavbarStyles';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setActiveTabAction } from '@/app/store/Profile-store/profileSlice';

const navBarItems = ["Timeline", "About", "Media", "Invitations"]



const ProfileNavbar = () => {
  let activeTab = useAppSelector(state => state.profile.view.activeTab);
  let dispatch = useAppDispatch();
    return (
        <View style={styles.navBarContainer}>
          <View style={styles.navBar}>
            {navBarItems.map((tab) => (
              <TouchableOpacity key={tab} style={[styles.navItem, activeTab === tab && styles.activeNavItem]} onPress={() => dispatch(setActiveTabAction(tab))}>
                <Text style={[styles.navText, activeTab === tab && styles.activeNavText]}>{tab}</Text>
                {activeTab === tab && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
}

export default ProfileNavbar
