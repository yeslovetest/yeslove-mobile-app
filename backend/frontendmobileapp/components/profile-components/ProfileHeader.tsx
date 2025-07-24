import React from 'react'
import { ImageBackground, Text, View, Image } from 'react-native';
import styles from "../../Styles/page-styles/ProfileStyles";
import { useFocusEffect } from "@react-navigation/native";
import { setProfileInformationAction } from "../../app/store/profileSlice";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { ProfileApiFactory } from '@/generated-api';


const ProfileHeader = () => {
  const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
  const tabStack = useAppSelector((state) => state.navigation.tabStack);
  const userName = useAppSelector((state) => state.profile.profiles[userId]?.username ?? "");
  const bio = useAppSelector((state) => state.profile.profiles[userId]?.bio ?? "");
  const dispatch = useAppDispatch();

  useFocusEffect(React.useCallback(() => {
    ProfileApiFactory()
      .getUserProfile(userId)
      .then((response) => {
        dispatch(setProfileInformationAction({id: tabStack.at(-1)?.data?.userId, data: response.data}));
      });
  }, [tabStack]));




  return (
    <View>
      <View style={styles.profileImageContainer}>
        <ImageBackground style={styles.profileBackgroundImage} imageStyle={{ borderRadius: 15 }} source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/dummy-banner.jpg" }}>
          <View style={styles.overlay}></View>
          <Image style={styles.profileImage} source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/avatar/bp-avatar.png" }} />
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.userStatsContainer}>
            <Text style={styles.userStats}>Posts: <Text style={styles.userStatsNumber}>0</Text></Text>
            <Text style={styles.userStats}>Comments: <Text style={styles.userStatsNumber}>0</Text></Text>
            <Text style={styles.userStats}>Views: <Text style={styles.userStatsNumber}>0</Text></Text>
          </View>
        </ImageBackground>
      </View>


      {/* User bio */}

      <View style={styles.userBioContainer}>
        <Text style={styles.userBioText}>{bio}</Text></View>
    </View>

  )
}

export default ProfileHeader
