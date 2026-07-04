import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, Pressable, Alert } from "react-native";
import { Video } from "@/app/Universal-components/Video/Video";
import styles from "./OnePostStyles";
import { theme } from "@/app/theme";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Post as PostData } from "@/generated-api"; //This is suuuuper bad practice but the component has the same name
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { openTabOnTopAction, TabType } from "@/app/store/Navigation/navigationSlice";
import dayjs from "dayjs";
import {
  retrievePostReactions,
  postReactionToPost,
  setPostReactionTab,
  SendFollowUser,
} from "@/app/store/Home-store/feedSlice";
import { BASE_URL } from "@/app/config/baseUrl";
import PostFilePreview from "@/app/pages/Home/Post-modal/Post-modal-components/File-preview/PostFilePreview";
import { getImageSource } from "@/constants/imageFallbacks";

export interface Props {
  post: PostData;
  follow?: [string, string, string, string];
}

const OnePost = (props: Props) => {
  const dispatch = useAppDispatch();

  const [expanded, setExpanded] = useState(false);
  const [reactionType, setReactionType] = useState(props.post.current_user_reaction ?? "default");
  const [isReactionModalVisible, setReactionModalVisible] = useState(false);
  const [isFollowMenuVisible, setFollowMenuVisible] = useState(false);
  const currentUserId = useAppSelector((state) => state.user.id);

  const resolveMediaUrl = (url?: string) => {
    if (!url) {
      return "";
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  const postMedia: Array<{ uri: string; type: string; name?: string }> = (
    props.post.media_files ?? []
  )
    .filter((item) => !!item?.uri && !!item?.type)
    .map((item) => ({
      uri: item.uri ?? "",
      type: item.type ?? "image/jpeg",
      name: item.name,
    }));

  const changeReaction = (reaction: string) => {
    // runs when a user selects a reaction from the pop up
    if (reaction === "reverseReaction" && reactionType === "default") {
      dispatch(postReactionToPost({ postId: props.post.id ?? 0, reactionType: "like" }));
      setReactionType("like");
    } else if (reaction === "reverseReaction" && reactionType !== "default") {
      dispatch(postReactionToPost({ postId: props.post.id ?? 0, reactionType: reactionType }));
      setReactionType("default");
    } else if (reactionType !== reaction) {
      dispatch(postReactionToPost({ postId: props.post.id ?? 0, reactionType: reaction }));
      setReactionType(reaction);
      setReactionModalVisible(false);
    } else {
      dispatch(postReactionToPost({ postId: props.post.id ?? 0, reactionType: reactionType }));
      setReactionType("default");
      setReactionModalVisible(false);
    }
  };

  const displayReactions = () => {
    setReactionModalVisible(true);
  };

  const CHAR_LIMIT = 200;
  const isLongText = (props.post.content?.length || 0) > CHAR_LIMIT;

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  const openProfile = () => {
    if (props.post.author_id) {
      dispatch(
        openTabOnTopAction({ type: TabType.PROFILE, data: { userId: props.post.author_id } }),
      );
    }
  };

  const displayIndividualPost = (tab: string) => {
    dispatch(retrievePostReactions({ postId: props.post.id ?? 0 }));
    dispatch(openTabOnTopAction({ type: TabType.INDIVIDUAL_POST, data: props.post }));
    dispatch(setPostReactionTab(tab));
  };

  const followType = props.follow?.[1] ?? "";
  const friendshipStatus = props.follow?.[3] ?? "";
  const isFollowing = !!props.follow;
  const isFriend = friendshipStatus === "friend";
  const isFriendRequestPending = followType === "friend" && friendshipStatus === "requested";

  const followButtonLabel = (() => {
    if (isFriend) {
      return "Friend";
    }
    if (isFriendRequestPending) {
      return "Requested";
    }
    if (isFollowing) {
      return "Following";
    }
    return "Follow";
  })();

  const sendFollowReq = (action: string) => {
    // runs when a user clicks follow/friend/unfollow from the pop up
    const targetId = props.post.author_id ?? "";
    if (!targetId) {
      setFollowMenuVisible(false);
      return;
    }

    if (action === "basic") {
      dispatch(
        SendFollowUser({
          keycloakId: targetId,
          action: "follow",
          type: "basic",
        }),
      );
      setFollowMenuVisible(false);
      return;
    }

    if (action === "friend") {
      dispatch(
        SendFollowUser({
          keycloakId: targetId,
          action: "follow",
          type: "friend",
        }),
      );
      setFollowMenuVisible(false);
      return;
    }

    if (action === "unfollow") {
      const doUnfollow = () => {
        dispatch(
          SendFollowUser({
            keycloakId: targetId,
            action: "unfollow",
            type: isFriend ? "friend" : "basic",
          }),
        );
        setFollowMenuVisible(false);
      };

      if (isFriend) {
        Alert.alert(
          "Remove friend?",
          "This user will also be removed from your friend list, are you sure you want to proceed?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Proceed", style: "destructive", onPress: doUnfollow },
          ],
        );
        return;
      }

      doUnfollow();
    }
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeaderContent}>
        <View style={styles.profileImageContainer}>
          <Image
            style={styles.profileImage}
            source={getImageSource(resolveMediaUrl(props.post.author_pic), "profile")}
          />
          <View style={styles.profileInfoContainer}>
            <TouchableOpacity style={styles.profileName} onPress={openProfile}>
              <Text style={styles.profileNameText}>{props.post.author}</Text>
            </TouchableOpacity>
            <Text style={styles.timePosted}>
              {props.post.timestamp
                ? dayjs(props.post.timestamp).format("MMM D, YYYY h:mm A")
                : "Unknown date"}
            </Text>
          </View>
        </View>
        {props.post.author_id && props.post.author_id !== currentUserId && (
          <View style={{ justifyContent: "center", alignItems: "flex-end", maxWidth: "42%" }}>
            <TouchableOpacity onPress={() => setFollowMenuVisible(true)}>
              {isFollowing ? (
                <View style={styles.viewProfile}>
                  <Text style={styles.buttonText}>{followButtonLabel}</Text>
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={theme.colors.textOnPrimary}
                    style={{ marginLeft: 5 }}
                  />
                </View>
              ) : (
                <Text style={styles.followUserText}>Follow</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
      {postMedia.length > 0 && (
        <View style={styles.postMediaWrapper}>
          <PostFilePreview file={postMedia} showNextPreview />
        </View>
      )}

      <Text style={styles.postContent}>
        {expanded || !isLongText
          ? props.post.content
          : `${props.post.content?.substring(0, CHAR_LIMIT)}...`}
      </Text>

      <View style={styles.seeLessAndLikeContainer}>
        <View style={{ ...styles.likeButtonContainer, backgroundColor: "white" }}>
          <View style={styles.likeAndCommentContainer}>
            <TouchableOpacity
              style={[styles.likeIcon, { marginRight: 8 }]}
              onPress={() => changeReaction("reverseReaction")}
              onLongPress={displayReactions}
            >
              {reactionType === "default" && (
                <Ionicons name="thumbs-up-outline" size={24} style={styles.likeIcon} />
              )}
              {reactionType === "like" && (
                <Ionicons name="thumbs-up-sharp" size={24} color="blue" />
              )}
              {reactionType === "love" && (
                <Ionicons name="heart" size={24} color={theme.colors.danger} />
              )}
              {reactionType === "laugh" && (
                <FontAwesome6 name="laugh" size={24} color={theme.colors.textPrimary} />
              )}
            </TouchableOpacity>
            <Text>{props.post.likes}</Text>
          </View>
          <View style={styles.likeAndCommentContainer}>
            <FontAwesome6
              onPress={() => displayIndividualPost("comments")}
              name="comment-dots"
              size={24}
              style={styles.likeIcon}
            />
            <Text style={styles.numberOfLikesAndComments}>{props.post.comments} </Text>
          </View>
        </View>
        {isLongText && (
          <TouchableOpacity onPress={handleToggle}>
            <Text style={{ color: theme.colors.textPrimary, marginTop: 10 }}>
              {expanded ? "See Less" : "See More"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={isReactionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setReactionModalVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
          onPress={() => setReactionModalVisible(false)}
        >
          <Pressable
            style={{
              width: "92%",
              maxWidth: 380,
              backgroundColor: theme.colors.surface,
              borderRadius: 14,
              paddingVertical: 18,
              paddingHorizontal: 14,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: theme.colors.textPrimary,
                marginBottom: 14,
                textAlign: "center",
              }}
            >
              Choose reaction
            </Text>
            <View
              style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center" }}
            >
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 80,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: theme.colors.surfaceAlt,
                }}
                onPress={() => changeReaction("like")}
              >
                <Ionicons name="thumbs-up-sharp" size={28} color="blue" />
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    fontWeight: "600",
                    color: theme.colors.textPrimary,
                  }}
                >
                  Like
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 80,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: theme.colors.surfaceAlt,
                }}
                onPress={() => changeReaction("love")}
              >
                <Ionicons name="heart" size={28} color={theme.colors.danger} />
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    fontWeight: "600",
                    color: theme.colors.textPrimary,
                  }}
                >
                  Love
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 80,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: theme.colors.surfaceAlt,
                }}
                onPress={() => changeReaction("laugh")}
              >
                <FontAwesome6 name="laugh" size={28} color={theme.colors.textPrimary} />
                <Text
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    fontWeight: "600",
                    color: theme.colors.textPrimary,
                  }}
                >
                  Laugh
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={isFollowMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFollowMenuVisible(false)}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: theme.colors.overlay,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
          onPress={() => setFollowMenuVisible(false)}
        >
          <Pressable
            style={{
              width: "86%",
              maxWidth: 360,
              backgroundColor: theme.colors.surface,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {!isFollowing && (
              <TouchableOpacity
                style={styles.followMenuOptions}
                onPress={() => sendFollowReq("basic")}
              >
                <Text style={styles.followMenuPopUpText}>Follow</Text>
              </TouchableOpacity>
            )}
            {(!isFollowing || (isFollowing && followType !== "friend")) && (
              <TouchableOpacity
                style={styles.followMenuOptions}
                onPress={() => sendFollowReq("friend")}
              >
                <Text style={styles.followMenuPopUpText}>Follow as friend</Text>
              </TouchableOpacity>
            )}
            {isFollowing && isFriendRequestPending && (
              <TouchableOpacity
                style={styles.followMenuOptions}
                onPress={() => sendFollowReq("friend")}
              >
                <Text style={styles.followMenuPopUpText}>Send friend request again</Text>
              </TouchableOpacity>
            )}
            {isFollowing && (
              <TouchableOpacity
                style={styles.followMenuOptions}
                onPress={() => sendFollowReq("unfollow")}
              >
                <Text style={styles.followMenuPopUpText}>Unfollow</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default OnePost;
