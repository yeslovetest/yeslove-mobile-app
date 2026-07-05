import getHelpReducer, {
  setActiveGetHelpTabAction,
  setSearchQuery,
  setBlogPosts,
  setProfessionals,
  setOneBlogPost,
} from "@/app/store/Get-help-store/getHelpSlice";
import type { BlogPostList, BlogPostModel, ProfessionalResponse } from "@/generated-api";

describe("getHelpSlice", () => {
  it("sets the active tab and search query", () => {
    let state = getHelpReducer(undefined, setActiveGetHelpTabAction("Blogs"));
    state = getHelpReducer(state, setSearchQuery("anxiety"));

    expect(state.view.activeTab).toBe("Blogs");
    expect(state.currentSearchQuery).toBe("anxiety");
  });

  it("maps a blog list response with totals and pagination", () => {
    const blogs = {
      items: [{ id: 1 }, { id: 2 }],
      total: 5,
      page: 2,
      per_page: 10,
    } as unknown as BlogPostList;

    const state = getHelpReducer(undefined, setBlogPosts({ blogs }));
    expect(state.blogs).toHaveLength(2);
    expect(state.totalBlogs).toBe(5);
    expect(state.blogPage).toBe(2);
    expect(state.blogsPerPage).toBe(10);
  });

  it("defaults blog pagination when the response omits fields", () => {
    const state = getHelpReducer(
      undefined,
      setBlogPosts({ blogs: { items: undefined } as unknown as BlogPostList }),
    );
    expect(state.blogs).toEqual([]);
    expect(state.totalBlogs).toBe(0);
    expect(state.blogPage).toBe(1);
    expect(state.blogsPerPage).toBe(10);
  });

  it("maps a professionals response", () => {
    const items = [{ username: "carrie" }] as unknown as ProfessionalResponse[];
    const state = getHelpReducer(
      undefined,
      setProfessionals({ items, total: 1, page: 1, per_page: 20 }),
    );
    expect(state.professionals).toEqual(items);
    expect(state.totalProfessionals).toBe(1);
  });

  it("stores a single blog post", () => {
    const blog = { id: 3, title: "t" } as unknown as BlogPostModel;
    const state = getHelpReducer(undefined, setOneBlogPost(blog));
    expect(state.oneBlog).toEqual(blog);
  });
});
