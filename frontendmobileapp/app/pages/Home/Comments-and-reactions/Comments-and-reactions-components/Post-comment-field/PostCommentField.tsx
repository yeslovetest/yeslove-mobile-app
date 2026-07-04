import React, { useState } from "react";
import { View, TouchableOpacity, TextInput, Text, Image, Keyboard } from "react-native";
import styles from "./PostCommentFieldStyles";
import { theme } from "@/app/theme";
import { postComment, retrievePostReactions } from "@/app/store/Home-store/feedSlice";
import { useAppDispatch } from "@/app/store/hooks";
import { getImageSource } from "@/constants/imageFallbacks";

interface Props {
  id: number;
  pic?: string;
}

const PostCommentField = ({ id, pic }: Props) => {
  const dispatch = useAppDispatch();
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentButton = async () => {
    if (!userComment.trim()) {
      return;
    }

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(postComment({ postId: id, content: userComment }));
      setUserComment("");
      Keyboard.dismiss();
      dispatch(retrievePostReactions({ postId: id ?? 0 }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.commentContainer}>
      <View style={styles.postCommentContainer}>
        <Image style={styles.commentProfileImage} source={getImageSource(pic, "profile")} />
        <TextInput
          style={styles.commentBox}
          onChangeText={(val) => setUserComment(val)}
          value={userComment}
          placeholder="Write a comment..."
          placeholderTextColor={theme.colors.textMuted}
          multiline
          numberOfLines={3}
          maxLength={500}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.submitCommentButton,
            !userComment.trim() && styles.submitCommentButtonDisabled,
          ]}
          onPress={handleCommentButton}
          disabled={!userComment.trim() || isSubmitting}
        >
          <Text style={styles.submitCommentButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostCommentField;
