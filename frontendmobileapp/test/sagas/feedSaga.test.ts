jest.mock("@/generated-api");

import { FeedApiFactory } from "@/generated-api";
import feedSaga from "@/app/store/sagas/feedSaga";
import feedReducer, {
  deletePostAction,
  setFeedDataAction,
  updatePostsForFeedAction,
} from "@/app/store/Home-store/feedSlice";
import { runSagaStore, flushPromises, stopSagas } from "../helpers/sagaTestStore";

const mockedFeedApiFactory = FeedApiFactory as jest.MockedFunction<typeof FeedApiFactory>;

describe("feedSaga", () => {
  afterEach(() => {
    stopSagas();
    jest.clearAllMocks();
  });

  it("fetches the 'all' feed and stores posts + pagination", async () => {
    const getFeed = jest.fn().mockResolvedValue({
      data: {
        posts: [{ id: 1 }, { id: 2 }],
        pagination: { page: 1, has_next: true, total_pages: 3 },
      },
    });
    mockedFeedApiFactory.mockReturnValue({ getFeed } as any);

    const store = runSagaStore({ feed: feedReducer }, feedSaga);
    store.dispatch(updatePostsForFeedAction({ feedType: "all" }));
    await flushPromises();

    expect(getFeed).toHaveBeenCalledWith(undefined, undefined, "all");
    expect(store.getState().feed.feed.posts).toHaveLength(2);
    expect(store.getState().feed.paginationValues.hasNextPage).toBe(true);
    expect(store.getState().feed.paginationValues.totalPages).toBe(3);
  });

  it("routes 'friends' posts into the friends feed", async () => {
    const getFeed = jest.fn().mockResolvedValue({
      data: { posts: [{ id: 9 }], pagination: { page: 1 } },
    });
    mockedFeedApiFactory.mockReturnValue({ getFeed } as any);

    const store = runSagaStore({ feed: feedReducer }, feedSaga);
    store.dispatch(updatePostsForFeedAction({ feedType: "friends" }));
    await flushPromises();

    expect(store.getState().feed.feed.friends).toHaveLength(1);
    expect(store.getState().feed.feed.posts).toEqual([]);
  });

  it("removes a post from the feed when deletePostAction is dispatched", async () => {
    mockedFeedApiFactory.mockReturnValue({} as any);

    const store = runSagaStore({ feed: feedReducer }, feedSaga);
    store.dispatch(
      setFeedDataAction({
        post: [{ id: 1 }, { id: 2 }] as any,
        feedType: "all",
        pagination: { page: 1 },
      }),
    );
    store.dispatch(deletePostAction({ postId: 1 }));
    await flushPromises();

    expect(store.getState().feed.feed.posts.map((p) => p.id)).toEqual([2]);
  });
});
