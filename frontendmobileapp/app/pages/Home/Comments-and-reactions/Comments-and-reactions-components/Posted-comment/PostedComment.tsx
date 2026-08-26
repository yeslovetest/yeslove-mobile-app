import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styles from "./PostedCommentStyles";
import { Comment } from "@/generated-api";
import dayjs from "dayjs";
import { getImageSource } from "@/constants/imageFallbacks";

interface Props {
  key: number;
  comment: Comment;
}

const PostedComment = (props: Props) => {
  return (
    <View style={[styles.postContainer, styles.indCommentContainer]}>
      <View style={styles.profileImageContainer}>
        <Image
          style={styles.profileImage}
          source={getImageSource(props.comment.picture, "profile", { treatBareAsMediaId: true })}
        />
        <View style={styles.profileInfoContainer}>
          <TouchableOpacity style={styles.profileName}>
            <Text>{props.comment.author}</Text>
          </TouchableOpacity>
          <Text style={styles.timePosted}>
            {props.comment.timestamp
              ? dayjs(props.comment.timestamp).format("MMM D, YYYY h:mm A")
              : "Unknown date"}
          </Text>
        </View>
      </View>

      <Text style={styles.postContent}>{props.comment.content}</Text>
    </View>
  );
};

export default PostedComment;
