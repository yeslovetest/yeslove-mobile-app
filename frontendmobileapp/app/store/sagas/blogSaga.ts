import { call, put, takeEvery } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";

import { BlogApiFactory, BlogPostList, BlogPostModel } from "@/generated-api";

import { openTabOnTopAction, TabType } from "../Navigation/navigationSlice";
import {
  fetchBlogPosts,
  fetchOneBlogPost,
  setBlogPosts,
  setOneBlogPost,
} from "../Get-help-store/getHelpSlice";

function* handleGetBlogPost(
  action: PayloadAction<{ searchquery?: string; perPage?: number; currentPage?: number }>,
) {
  try {
    const response = (
      (yield call(
        BlogApiFactory().getBlogPosts,
        action.payload.searchquery ?? undefined,
        action.payload.perPage ?? undefined,
        action.payload.currentPage ?? undefined,
      )) as AxiosResponse<BlogPostList>
    ).data as BlogPostList;
    yield put(setBlogPosts({ blogs: response }));
  } catch (error) {
    console.error("failed to fetch blog posts", error);
  }
}

function* handleGetOneBlogPost(action: PayloadAction<{ blogId: number }>) {
  try {
    const blog = (
      (yield call(
        BlogApiFactory().getGetSingleBlog,
        action.payload.blogId,
      )) as AxiosResponse<BlogPostModel>
    ).data as BlogPostModel;
    yield put(setOneBlogPost(blog));
    yield put(openTabOnTopAction({ type: TabType.INDIVIDUAL_BLOG, data: blog }));
  } catch (error) {
    console.error("failed to fetch blog post", error);
  }
}

export default function* blogSaga() {
  yield takeEvery(fetchBlogPosts.type, handleGetBlogPost);
  yield takeEvery(fetchOneBlogPost.type, handleGetOneBlogPost);
}
