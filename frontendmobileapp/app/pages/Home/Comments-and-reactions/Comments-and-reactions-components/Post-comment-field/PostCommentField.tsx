import React, { useState } from 'react'
import { View, TouchableOpacity, TextInput, Text, Image } from "react-native";
import styles from './PostCommentFieldStyles';
import { postComment, retrievePostReactions } from '@/app/store/Home-store/feedSlice';
import { useAppDispatch } from '@/app/store/hooks';

interface Props {
  id: number;
  pic?: string;
}

const PostCommentField = ({ id, pic }: Props) => {
  
  const dispatch = useAppDispatch();
  const [userComment, setUserComment] = useState('');


  const handleCommentButton = () => {
      if (!userComment.trim()) {
      return;
      }

     dispatch(postComment({postId: id, content: userComment}));
     setUserComment("");
     dispatch(retrievePostReactions({postId: id ?? 0}));
  }

  
  return (
    <View style={styles.commentContainer}>
                    <View style={styles.postCommentContainer}>
                        <Image style={styles.commentProfileImage} source={{ uri: pic }} />
                        <TextInput
                          style={styles.commentBox}
                          onChangeText={(val) => setUserComment(val)}
                          value={userComment}
                          placeholder="Write a comment..."
                          placeholderTextColor="#8f8f8f"
                          multiline
                          numberOfLines={3}
                          maxLength={500}
                          textAlignVertical="top"
                        />
    
                        <TouchableOpacity
                          style={[styles.submitCommentButton, !userComment.trim() && styles.submitCommentButtonDisabled]}
                          onPress={handleCommentButton}
                          disabled={!userComment.trim()}
                        >
                            <Text style={styles.submitCommentButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
  )
}

export default PostCommentField
