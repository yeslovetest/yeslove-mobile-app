jest.mock("@/generated-api");

import { BlogApiFactory } from "@/generated-api";
import blogSaga from "@/app/store/sagas/blogSaga";
import getHelpReducer, { fetchBlogPosts } from "@/app/store/Get-help-store/getHelpSlice";
import { runSagaStore, flushPromises, stopSagas } from "../helpers/sagaTestStore";

const mockedBlogApiFactory = BlogApiFactory as jest.MockedFunction<typeof BlogApiFactory>;

describe("blogSaga", () => {
  afterEach(() => {
    stopSagas();
    jest.clearAllMocks();
  });

  it("fetches blogs and stores them in state", async () => {
    const getBlogPosts = jest.fn().mockResolvedValue({
      data: { items: [{ id: 1 }, { id: 2 }], total: 2, page: 1, per_page: 10 },
    });
    mockedBlogApiFactory.mockReturnValue({ getBlogPosts } as any);

    const store = runSagaStore({ getHelp: getHelpReducer }, blogSaga);
    store.dispatch(fetchBlogPosts({ searchquery: "anxiety" }));
    await flushPromises();

    expect(getBlogPosts).toHaveBeenCalledWith("anxiety", undefined, undefined);
    expect(store.getState().getHelp.blogs).toHaveLength(2);
    expect(store.getState().getHelp.totalBlogs).toBe(2);
  });

  it("swallows the error and leaves state untouched on failure", async () => {
    const getBlogPosts = jest.fn().mockRejectedValue(new Error("network"));
    mockedBlogApiFactory.mockReturnValue({ getBlogPosts } as any);
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const store = runSagaStore({ getHelp: getHelpReducer }, blogSaga);
    store.dispatch(fetchBlogPosts({}));
    await flushPromises();

    expect(getBlogPosts).toHaveBeenCalled();
    expect(store.getState().getHelp.blogs).toEqual([]);
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
