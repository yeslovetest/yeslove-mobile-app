import React from "react";
import { View } from "react-native";
import Post from "../../Post/One-post/OnePost";
import { fetchFollowedUsers, updatePostsForFeedAction } from "@/app/store/Home-store/feedSlice";
import { useFocusEffect } from "expo-router";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import ListStateView from "@/app/Universal-components/List-state/ListStateView";
import { useSettleAfter } from "@/app/Universal-components/List-state/useSettleAfter";

const AllUpdatesPosts = () => {
  const dispatch = useAppDispatch();
  useFocusEffect(
    React.useCallback(() => {
      dispatch(updatePostsForFeedAction({ feedType: "all" }));
      dispatch(fetchFollowedUsers());
    }, []),
  );

  const posts = useAppSelector((state) => state.feed.feed.posts);
  const followedUsers = useAppSelector((state) => state.feed.followedUsers);
  const settled = useSettleAfter();

  return (
    <View>
      {posts.map((post, index) => (
        <Post key={index} post={post} follow={followedUsers[post?.author_id ?? ""]} />
      ))}
      {posts.length === 0 && (
        <ListStateView
          loading={!settled}
          loadingText="Loading posts..."
          emptyText="No posts yet. Be the first to share something."
        />
      )}
    </View>
  );
};

export default AllUpdatesPosts;
