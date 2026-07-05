import React from "react";
import { TouchableOpacity, View, Text, Image } from "react-native";
import styles from "./PostingUserProfileStyles";
import { getFallbackImageSource, getImageSource } from "@/constants/imageFallbacks";

export interface PostingUserProfileProps {
  profilePic: string;
  username: string;
}

const PostingUserProfile: React.FC<PostingUserProfileProps> = ({ profilePic, username }) => {
  const [imageLoadFailed, setImageLoadFailed] = React.useState(false);

  React.useEffect(() => {
    setImageLoadFailed(false);
  }, [profilePic]);

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <Image
          style={styles.profileImage}
          source={
            imageLoadFailed
              ? getFallbackImageSource("profile")
              : getImageSource(profilePic, "profile", { treatBareAsMediaId: true })
          }
          onError={() => setImageLoadFailed(true)}
        />
        <View style={styles.profileInfoContainer}>
          <TouchableOpacity>
            <Text style={styles.profileName}>{username}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default PostingUserProfile;
