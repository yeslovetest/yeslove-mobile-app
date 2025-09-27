
import React from 'react'
import { TouchableOpacity, View, Text, Image } from 'react-native'
import styles from './PostingUserProfileStyles'

export interface PostingUserProfileProps {
  profilePic: string;
  username: string
}

const PostingUserProfile: React.FC<PostingUserProfileProps> = ({ profilePic, username }) => {



  return (
    <View style={styles.container}>
    <View style={styles.profileImageContainer}>
      <Image style={styles.profileImage} source={{ uri: profilePic }} />
      <View style={styles.profileInfoContainer}>
        <TouchableOpacity>
          <Text style={styles.profileName}>{username}</Text>
        </TouchableOpacity>
      </View>
    </View>
    </View>
  );
};

export default PostingUserProfile
