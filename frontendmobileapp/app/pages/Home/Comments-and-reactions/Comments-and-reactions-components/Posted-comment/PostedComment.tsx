import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import styles from "./PostedCommentStyles";
import { Comment } from "@/generated-api";
import dayjs from "dayjs";
import { getImageSource } from "@/constants/imageFallbacks";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "@/app/theme";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { retrievePostReactions } from "@/app/store/Home-store/feedSlice";
import ReportBlockSheet from "@/app/Universal-components/Report-block/ReportBlockSheet";

interface Props {
  key: number;
  comment: Comment;
  postId?: number;
}

const PostedComment = (props: Props) => {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.user.id);
  const [sheetVisible, setSheetVisible] = useState(false);
  // author_id is returned by the API but is not in the generated Comment type yet.
  const authorId = (props.comment as Comment & { author_id?: string | null }).author_id;
  const canModerate = !!props.comment.id && authorId !== currentUserId;

  return (
    <View style={[styles.postContainer, styles.indCommentContainer]}>
      <View style={styles.profileImageContainer}>
        <Image
          style={styles.profileImage}
          source={getImageSource(props.comment.picture, "profile", { treatBareAsMediaId: true })}
        />
        <View style={styles.profileInfoContainer}>
          {/* No onPress: purely displays the commenter's name here. */}
          <TouchableOpacity style={styles.profileName} accessible={false}>
            <Text>{props.comment.author}</Text>
          </TouchableOpacity>
          <Text style={styles.timePosted}>
            {props.comment.timestamp
              ? dayjs(props.comment.timestamp).format("MMM D, YYYY h:mm A")
              : "Unknown date"}
          </Text>
        </View>
        {canModerate && (
          <TouchableOpacity
            onPress={() => setSheetVisible(true)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginLeft: "auto", justifyContent: "center" }}
            accessibilityRole="button"
            accessibilityLabel="Report or block"
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.postContent}>{props.comment.content}</Text>

      {canModerate && (
        <ReportBlockSheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          contentType="comment"
          contentId={props.comment.id as number}
          authorId={authorId}
          authorName={props.comment.author}
          onBlocked={() => {
            if (props.postId) {
              dispatch(retrievePostReactions({ postId: props.postId }));
            }
          }}
        />
      )}
    </View>
  );
};

export default PostedComment;
