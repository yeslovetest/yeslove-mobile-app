import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { View, TextInput } from 'react-native';
import styles from './PostInputStyles';


interface PostInputProps {
  userPost: string;
  setUserPost: (text: string) => void;
}

const PostInput: React.FC<PostInputProps> = ({ userPost, setUserPost }) => {
  return (
    <View style={styles.userPostBoxContainer}>
      <TextInput
        value={userPost}
        onChangeText={setUserPost}
        style={styles.postInput}
        multiline
        placeholder="Share what you're thinking..."
        placeholderTextColor="gray"
      />
      <View style={styles.postIcons}>
        <FontAwesome name="picture-o" size={24} color="black" />
        <Entypo name="video-camera" size={24} color="black" />
        <AntDesign name="sound" size={24} color="black" />
        <Ionicons name="newspaper" size={24} color="black" />
      </View>
    </View>
  );
};

export default PostInput;
