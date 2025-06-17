import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import styles from "../../Styles/page-styles/HomeStyles";
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks'
import { FeedApiFactory } from '@/generated-api';
import { postNewPostAction, setFeedDataAction } from '@/app/store/feedSlice';

const UserPostBox = () => {
const dispatch = useAppDispatch()
const [userPost, setUserPost] = useState("")

const handleUserPost = (input: React.SetStateAction<string>) => {
   setUserPost(input)
}

const handleUserPostButton = () => {
   dispatch(postNewPostAction({content: userPost}));
   setUserPost("")
}

  return (
    <View>
      <View style={styles.userPostBoxContainer}>
           <View style={styles.decorBox}>
              <Entypo name="open-book" size={24} color="gray" />
           </View>
           <View style={styles.userPostBox}>
              <TextInput onChangeText={handleUserPost} value={userPost} style={styles.postInput} multiline={true} placeholder="Share what you're thinking..." placeholderTextColor="gray"></TextInput>
           </View>
           <View style={styles.postIcons}>
              <FontAwesome name="picture-o" size={24} color="black" />
              <Entypo name="video-camera" size={24} color="black" />
              <AntDesign name="sound" size={24} color="black" />
              <Ionicons name="newspaper" size={24} color="black" />
           </View>
           <TouchableOpacity style={styles.postButton} onPress={handleUserPostButton}>
              <Text style={styles.postButtonText}>Post</Text>
           </TouchableOpacity>
      </View>
    </View>
  )
}

export default UserPostBox
