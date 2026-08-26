import React from "react";
import { View } from "react-native";
import { useFocusEffect } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { fetchFollowedUsers, updatePostsForFeedAction } from "@/app/store/Home-store/feedSlice";
import OnePost from "../../Post/One-post/OnePost";
import ListStateView from "@/app/Universal-components/List-state/ListStateView";
import { useSettleAfter } from "@/app/Universal-components/List-state/useSettleAfter";

const FriendsPosts = () => {
  const dispatch = useAppDispatch();
  useFocusEffect(
    React.useCallback(() => {
      dispatch(updatePostsForFeedAction({ feedType: "friends" }));
      dispatch(fetchFollowedUsers());
    }, []),
  );

  const posts = useAppSelector((state) => state.feed.feed.friends);
  const followedUsers = useAppSelector((state) => state.feed.followedUsers);
  const settled = useSettleAfter();

  return (
    <View>
      {posts.map((post, index) => (
        <OnePost key={index} post={post} follow={followedUsers[post?.author_id ?? ""]} />
      ))}
      {posts.length === 0 && (
        <ListStateView
          loading={!settled}
          loadingText="Loading posts..."
          emptyText="No posts from people you follow yet."
        />
      )}
    </View>
  );
};

export default FriendsPosts;
