import React, { useMemo, useState } from 'react'
import { ActivityIndicator, Alert, ImageBackground, Text, View, Image, TouchableOpacity } from 'react-native';
import styles from './ProfileHeaderAndBioStyles';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { updateProfile } from '@/app/store/Profile-store/profileSlice';
import axios from 'axios';
import dataURLtoFile from '@/utils/mediaUrlConverter';
import * as ImagePicker from 'expo-image-picker';
import { MEDIA_UPLOAD_LIMITS, formatSizeMb } from '@/constants/mediaLimits';
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

type SelectedProfileFile = {
  uri: string;
  type: string;
  name?: string;
  fileSize?: number;
};

const ProfileHeaderAndBio = () => {
  const userId = useAppSelector((state) => state.navigation.tabStack.at(-1)?.data?.userId);
  const userName = useAppSelector((state) => state.profile.profiles[userId]?.username ?? "");
  const bio = useAppSelector((state) => state.profile.profiles[userId]?.bio ?? "");
  const profileImage = useAppSelector((state) => state.profile.profiles[userId]?.profile_pic ?? "");
  const userPosts = useAppSelector((state) => state.profile.profiles[userId]?.user_posts ?? 0);
  const userFollowers = useAppSelector((state) => state.profile.profiles[userId]?.user_followers ?? 0);
  const userFollowing = useAppSelector((state) => state.profile.profiles[userId]?.user_following ?? 0);
  const isCurrentUserProfile = useAppSelector((state) => state.profile.isCurrentUserProfile);
  const isProfileImageUploading = useAppSelector((state) => state.profile.isProfileImageUploading);
  const dispatch = useAppDispatch();
  const [selectedFile, setSelectedFile] = useState<SelectedProfileFile | null>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const currentProfileImageUri = useMemo(() => {
    if (!profileImage) {
      return '';
    }

    return `${axios.defaults.baseURL}/api/media/${profileImage}`;
  }, [profileImage]);

  const displayedProfileImageUri = selectedFile?.uri || currentProfileImageUri;

  const validateAndSetSelectedImage = (asset: ImagePicker.ImagePickerAsset) => {
    const detectedType = asset.mimeType || 'image/jpeg';

    if (!SUPPORTED_IMAGE_TYPES.includes(detectedType)) {
      setValidationMessage('Please select a JPG, PNG, or WEBP image.');
      return;
    }

    if (asset.fileSize && asset.fileSize > MEDIA_UPLOAD_LIMITS.profileImageMaxBytes) {
      setValidationMessage(
        `Image must be ${formatSizeMb(MEDIA_UPLOAD_LIMITS.profileImageMaxBytes)} or smaller.`
      );
      return;
    }

    setSelectedFile({
      uri: asset.uri,
      type: detectedType,
      name: asset.fileName || `profile_${Date.now()}.jpg`,
      fileSize: asset.fileSize,
    });
  };

  const pickFromGallery = async () => {
    setValidationMessage('');
    setSuccessMessage('');

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to choose a profile picture.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      validateAndSetSelectedImage(result.assets[0]);
    } catch (error) {
      console.error('failed to pick profile image', error);
      setValidationMessage('Unable to open image picker right now.');
    }
  };

  const takePhoto = async () => {
    setValidationMessage('');
    setSuccessMessage('');

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission needed', 'Please allow camera access to take a profile picture.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      validateAndSetSelectedImage(result.assets[0]);
    } catch (error) {
      console.error('failed to capture profile image', error);
      setValidationMessage('Unable to open camera right now.');
    }
  };

  const openPhotoSourcePicker = () => {
    if (isProfileImageUploading) {
      return;
    }

    Alert.alert('Update Profile Picture', 'Choose how you want to add your photo.', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Library', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const clearSelection = () => {
    if (isProfileImageUploading) {
      return;
    }

    setSelectedFile(null);
    setValidationMessage('');
    setSuccessMessage('');
  };

  const uploadProfilePic = async () => {
    if (!selectedFile) {
      setValidationMessage('Please choose an image first.');
      return;
    }

    setValidationMessage('');
    setSuccessMessage('');

    const mediaData = new FormData(); // form data for profile pic upload
    const fieldName = 'profile_pic';

    if (selectedFile.uri.startsWith('file:')) {
      mediaData.append(fieldName, {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name || 'photo.jpg',
      } as any);
    } else if (selectedFile.uri.startsWith('data:')) {
      const file = dataURLtoFile(selectedFile.uri, selectedFile.name || 'photo.jpg');
      mediaData.append(fieldName, file as any);
    }

    try {
      await new Promise<void>((resolve, reject) => {
        dispatch(updateProfile({ file: mediaData, resolve, reject }));
      });

      setSuccessMessage('Profile picture updated successfully.');
      setSelectedFile(null);
    } catch (error) {
      console.error('failed to upload profile picture', error);
      setValidationMessage('Upload failed. Please try again.');
    }
  };


  return (
    <View>
      <View style={styles.profileImageContainer}>
        <ImageBackground style={styles.profileBackgroundImage} imageStyle={{ borderRadius: 15 }} source={{ uri: "https://yeslove.co.uk/wp-content/themes/cirkle/assets/img/dummy-banner.jpg" }}>
          <View style={styles.overlay}></View>
          <View style={styles.profileImageWrapper}>
            <Image
              style={styles.profileImage}
              source={{ uri: displayedProfileImageUri || 'https://i.pravatar.cc/300?img=12' }}
            />

            {isCurrentUserProfile && (
              <TouchableOpacity style={styles.changePhotoBadge} onPress={openPhotoSourcePicker}>
                <Text style={styles.changePhotoBadgeText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {isCurrentUserProfile && selectedFile && (
            <View style={styles.previewActionsContainer}>
              <Text style={styles.previewMessage}>Preview selected. Upload to apply.</Text>

              <View style={styles.previewButtonsRow}>
                <TouchableOpacity
                  style={[styles.previewButton, styles.cancelButton]}
                  onPress={clearSelection}
                  disabled={isProfileImageUploading}
                >
                  <Text style={[styles.previewButtonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.previewButton, styles.uploadButton, isProfileImageUploading ? styles.disabledButton : undefined]}
                  onPress={uploadProfilePic}
                  disabled={isProfileImageUploading}
                >
                  {isProfileImageUploading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.previewButtonText}>Upload Photo</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}

          {validationMessage ? <Text style={styles.validationMessage}>{validationMessage}</Text> : null}
          {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}

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
        <Text style={styles.userBioText}>{bio}</Text>
      </View>
    </View>

  )
}

export default ProfileHeaderAndBio


