import React from 'react'
import { View, TouchableOpacity, TextInput, Text, Image } from "react-native";
import styles from '../../Styles/page-styles/HomeStyles';

const PostCommentField = ( { image }) => {
  return (
    <View style={styles.commentContainer}>
                    <View style={styles.postCommentContainer}>
                        <Image style={styles.commentProfileImage} source={{ uri: image }} />
                        <TextInput style={styles.commentBox}></TextInput>
    
                        <TouchableOpacity style={styles.submitCommentButton}>
                            <Text style={styles.submitCommentButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
  )
}

export default PostCommentField
