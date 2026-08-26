import feedReducer, {
  FeedTabs,
  setActiveHomeTabAction,
  setFeedDataAction,
  setPostReactionTab,
  setDetailedPost,
  setFollowing,
  setScrollViewPosition,
  removePostFromFeed,
} from "@/app/store/Home-store/feedSlice";
import type { FollowedUser, Post } from "@/generated-api";

const posts = (ids: number[]): Post[] => ids.map((id) => ({ id }) as unknown as Post);

describe("feedSlice", () => {
  it("switches the active home tab", () => {
    const state = feedReducer(undefined, setActiveHomeTabAction(FeedTabs.FRIENDS));
    expect(state.view.activeHomeTab).toBe(FeedTabs.FRIENDS);
  });

  describe("setFeedDataAction", () => {
    it("replaces the 'all' feed on page 1", () => {
      const seeded = feedReducer(
        undefined,
        setFeedDataAction({ post: posts([1]), feedType: "all", pagination: { page: 1 } }),
      );
      const state = feedReducer(
        seeded,
        setFeedDataAction({ post: posts([9]), feedType: "all", pagination: { page: 1 } }),
      );
      expect(state.feed.posts.map((p) => p.id)).toEqual([9]);
    });

    it("appends to the 'all' feed on later pages", () => {
      const seeded = feedReducer(
        undefined,
        setFeedDataAction({ post: posts([1, 2]), feedType: "all", pagination: { page: 1 } }),
      );
      const state = feedReducer(
        seeded,
        setFeedDataAction({ post: posts([3]), feedType: "all", pagination: { page: 2 } }),
      );
      expect(state.feed.posts.map((p) => p.id)).toEqual([1, 2, 3]);
    });

    it("routes 'friends' posts into the friends feed and updates pagination", () => {
      const state = feedReducer(
        undefined,
        setFeedDataAction({
          post: posts([7]),
          feedType: "friends",
          pagination: { page: 1, has_next: true, total_pages: 4 },
        }),
      );
      expect(state.feed.friends.map((p) => p.id)).toEqual([7]);
      expect(state.feed.posts).toEqual([]);
      expect(state.paginationValues.hasNextPage).toBe(true);
      expect(state.paginationValues.totalPages).toBe(4);
    });
  });

  describe("removePostFromFeed", () => {
    it("removes the post from both the 'all' and 'friends' feeds", () => {
      let state = feedReducer(
        undefined,
        setFeedDataAction({ post: posts([1, 2, 3]), feedType: "all", pagination: { page: 1 } }),
      );
      state = feedReducer(
        state,
        setFeedDataAction({ post: posts([2, 4]), feedType: "friends", pagination: { page: 1 } }),
      );

      state = feedReducer(state, removePostFromFeed({ postId: 2 }));

      expect(state.feed.posts.map((p) => p.id)).toEqual([1, 3]);
      expect(state.feed.friends.map((p) => p.id)).toEqual([4]);
    });

    it("leaves the feeds untouched when the post id is absent", () => {
      const seeded = feedReducer(
        undefined,
        setFeedDataAction({ post: posts([1, 2]), feedType: "all", pagination: { page: 1 } }),
      );

      const state = feedReducer(seeded, removePostFromFeed({ postId: 99 }));

      expect(state.feed.posts.map((p) => p.id)).toEqual([1, 2]);
    });
  });

  it("reduces the followed-users list into a record keyed by id", () => {
    const users = [
      { id: "u1", follow_type: "friend", profile_pic: "p1.jpg", friendship_status: "accepted" },
      { id: "u2", follow_type: "basic", profile_pic: "p2.jpg" },
    ] as unknown as FollowedUser[];

    const state = feedReducer(undefined, setFollowing(users));

    expect(state.followedUsers.u1).toEqual(["u1", "friend", "p1.jpg", "accepted"]);
    expect(state.followedUsers.u2).toEqual(["u2", "basic", "p2.jpg", ""]);
  });

  it("stores reaction tab, detailed post, and scroll position", () => {
    let state = feedReducer(undefined, setPostReactionTab("reactions"));
    state = feedReducer(state, setDetailedPost({ id: 3 } as unknown as Post));
    state = feedReducer(state, setScrollViewPosition(200));

    expect(state.postReactionTab).toBe("reactions");
    expect(state.detailedPost).toEqual({ id: 3 });
    expect(state.scrollViewPosition).toBe(200);
  });
});
