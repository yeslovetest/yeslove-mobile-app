import React, { useState } from 'react'
import { ImageBackground, Text, View, Image } from 'react-native';
import styles from './ProfileHeaderAndBioStyles';
import { useFocusEffect } from "@react-navigation/native";
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { ProfileApiFactory } from '@/generated-api';
import { setProfileInformationAction, getEmailNotificationSettings, getProfileVisibilitySettings, updateProfile } from '@/app/store/Profile-store/profileSlice';
import axios from 'axios';
import { uploadMedia } from '@/app/store/Profile-store/mediaSlice';

function dataURLtoFile(dataUrl: string, filename: string) {
    // covert base64/URLEncoded data component to raw binary data held in a string - 
    // for web browser testing (not needed on mobile)
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

const ProfileHeaderAndBio = () => {
  const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
  const tabStack = useAppSelector((state) => state.navigation.tabStack);
  const userName = useAppSelector((state) => state.profile.profiles[userId]?.username ?? "");
  const bio = useAppSelector((state) => state.profile.profiles[userId]?.bio ?? "");
  const profileImage = useAppSelector((state) => state.profile.profiles[userId]?.profile_pic ?? "");
  const userPosts = useAppSelector((state) => state.profile.profiles[userId]?.user_posts ?? 0);
  const userFollowers = useAppSelector((state) => state.profile.profiles[userId]?.user_followers ?? 0);
  const userFollowing = useAppSelector((state) => state.profile.profiles[userId]?.user_following ?? 0);
  const dispatch = useAppDispatch();
  const [selectedFile, setSelectedFile] = useState<{ uri: string; type: string; name?: string } | null>(null);

  useFocusEffect(React.useCallback(() => {
    ProfileApiFactory()
      .getUserProfile(userId)
      .then((response) => {
        dispatch(setProfileInformationAction({id: tabStack.at(-1)?.data?.userId, data: response.data}));
      });
  }, [tabStack]));  
  
  const uploadProfilePic = (text: string) => {
    const mediaData = new FormData(); // form data for profile pic upload

    if (selectedFile) {
      const fieldName = "profile_pic"; 
      
      // detect if it's base64 or file URI
      if (selectedFile.uri.startsWith("file:")) {
        // handle both image and video here
        const file = selectedFile;
        mediaData.append(fieldName, file as any);
      } 
      else if (selectedFile.uri.startsWith("data:")) {
        // handle base64 (e.g., for web)
        const file: File | any = dataURLtoFile(
          selectedFile.uri,
          selectedFile.name ??
            (selectedFile.type.startsWith("video") ? "video.mp4" : "photo.jpg") 
        );
        mediaData.append(fieldName, file);
      }
    
      dispatch(updateProfile({file: mediaData}));  
    }
  };


  return (
    <View>
      <View style={styles.profileImageContainer}>
        <ImageBackground style={styles.profileBackgroundImage} imageStyle={{ borderRadius: 15 }} source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/dummy-banner.jpg" }}>
          <View style={styles.overlay}></View>
          <Image style={styles.profileImage} source={{ uri:   axios.defaults.baseURL + "/api/media/" +  profileImage}} />
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


