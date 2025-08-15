import React, { useState } from 'react'
import { View, TouchableOpacity, TextInput, Text, Image } from "react-native";
import styles from './PostCommentFieldStyles';
import { postComment, retrievePostReactions } from '@/app/store/Home-store/feedSlice';
import { useAppDispatch } from '@/app/store/hooks';

const PostCommentField = ({id, pic }) => {
  
  const dispatch = useAppDispatch();
  const [userComment, setUserComment] = useState('');


  const handleCommentButton = () => {
     dispatch(postComment({postId: id, content: userComment}));
     setUserComment("");
     dispatch(retrievePostReactions({postId: id ?? 0}));
  }

  
  return (
    <View style={styles.commentContainer}>
                    <View style={styles.postCommentContainer}>
                        <Image style={styles.commentProfileImage} source={{ uri: pic }} />
                        <TextInput style={styles.commentBox} onChangeText={(val) => setUserComment(val)} value={userComment}></TextInput>
    
                        <TouchableOpacity style={styles.submitCommentButton} onPress={handleCommentButton}>
                            <Text style={styles.submitCommentButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
  )
}

export default PostCommentField
