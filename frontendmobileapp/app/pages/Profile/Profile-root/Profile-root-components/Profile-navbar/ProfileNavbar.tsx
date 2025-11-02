import React from 'react'
import { Text, View, TouchableOpacity } from 'react-native';
import styles from './ProfileNavbarStyles';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { setActiveTabAction } from '@/app/store/Profile-store/profileSlice';
import { useFocusEffect } from '@react-navigation/native';
import { fetchMediaItems } from '@/app/store/Profile-store/mediaSlice';

const navBarItems = ["Timeline", "Media"]


const ProfileNavbar = () => {
  let activeTab = useAppSelector(state => state.profile.view.activeTab);
  let dispatch = useAppDispatch();

  const userDBID = useAppSelector(
    (state) => state.user.userDBID
  );

  useFocusEffect(
    React.useCallback(() => {
      // Fetch media items when the Media tab is active and userDBID is available
      console.log(userDBID)
      if (activeTab === "Media" && userDBID !== -1) {
        dispatch(fetchMediaItems(userDBID));
      }
    }, [activeTab, userDBID])
  );

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
