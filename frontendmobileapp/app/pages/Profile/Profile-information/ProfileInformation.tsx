import React from 'react'
import { View, Text, Image, ScrollView } from 'react-native'
import styles from './ProfileInformationStyles'
import Header from '@/app/Universal-components/Header/Header'
import { useAppSelector } from '@/app/store/hooks'

const ProfileInformation = () => {
  const userId = useAppSelector(state => state.navigation.tabStack.at(-1)?.data?.userId);
  const name = useAppSelector(state => state.profile.profiles[userId].contact_info?.name ?? "");
  const email = useAppSelector(state => state.profile.profiles[userId].contact_info?.email ?? "");
  const phone = useAppSelector(state => state.profile.profiles[userId].contact_info?.phone ?? "");
  const address = useAppSelector(state => state.profile.profiles[userId].contact_info?.address ?? "");
  const website = useAppSelector(state => state.profile.profiles[userId].contact_info?.website ?? ""); 

  return (
    <>
    <Header></Header>
    <View style={styles.container}>
        <ScrollView>
          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Name</Text>
            <Text style={styles.viewItemInfo}>{name}</Text>
          </View>

          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Email</Text>
            <Text style={styles.viewItemInfo}>{email}</Text>
          </View>

          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Phone</Text>
            <Text style={styles.viewItemInfo}>{phone}</Text>
          </View>

          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Address</Text>
            <Text style={styles.viewItemInfo}>{address}</Text>
          </View>

          <View style={styles.viewItemContainer}>
            <Text style={styles.viewItemText}>Website</Text>
            <Text style={styles.viewItemInfo}>{website}</Text>
          </View>

          {/* Friends section */}
          <View style={styles.friendsContainer}>
            <View style={styles.friends}>
              <View style={styles.friendsItem}>
                <Text style={styles.activeFriendsText}>
                  My Friends
                </Text>
                <View style={styles.activeIndicator} />
              </View>

              {/* Friends */}
              <View style={styles.friend}>
                <Image
                  source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/avatar/bp-avatar.png" }}
                  style={styles.friendImage}
                />
                <Text style={styles.friendName}>Friend username</Text>
              </View>
            </View>
          </View>
        </ScrollView>  
        </View>
    </>
  )
}

export default ProfileInformation
