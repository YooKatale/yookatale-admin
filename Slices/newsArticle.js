// "use client";

import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const newsArticleApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    newsArticleCreatePost: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/newsarticle`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useNewsArticleCreatePostMutation } = newsArticleApiSlice;
