import React from 'react'
import { ImageBackground, Text, View } from 'react-native';
import styles from './ProfileHeaderAndBioStyles';
import { useFocusEffect } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { ProfileApiFactory } from '@/generated-api';
import { setProfileInformationAction } from '@/app/store/Profile-store/profileSlice';
import ProfilePicture from './Profile-picture/ProfilePicture';


const ProfileHeaderAndBio = () => {
  const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
  const tabStack = useAppSelector((state) => state.navigation.tabStack);
  const userName = useAppSelector((state) => state.profile.profiles[userId]?.username ?? "");
  const bio = useAppSelector((state) => state.profile.profiles[userId]?.bio ?? "");
  const userPosts = useAppSelector((state) => state.profile.profiles[userId]?.user_posts ?? 0);
  const userFollowers = useAppSelector((state) => state.profile.profiles[userId]?.user_followers ?? 0);
  const userFollowing = useAppSelector((state) => state.profile.profiles[userId]?.user_following ?? 0);

 

  return (
    <View>
      <View style={styles.profileImageContainer}>
        <ImageBackground style={styles.profileBackgroundImage} imageStyle={{ borderRadius: 15 }} source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/dummy-banner.jpg" }}>
          <View style={styles.overlay}></View>
          <ProfilePicture />
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.userStatsContainer}>
            <Text style={styles.userStats}>Posts: <Text style={styles.userStatsNumber}>{userPosts}</Text></Text>
            <Text style={styles.userStats}>Followers: <Text style={styles.userStatsNumber}>{userFollowers}</Text></Text>
            <Text style={styles.userStats}>Following: <Text style={styles.userStatsNumber}>{userFollowing}</Text></Text>
          </View>
        </ImageBackground>
      </View>


      {/* User bio */}

      <View style={styles.userBioContainer}>
        <Text style={styles.userBioText}>{bio}</Text></View>
    </View>

  )
}

export default ProfileHeaderAndBio
