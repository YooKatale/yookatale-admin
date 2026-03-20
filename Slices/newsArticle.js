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
    newsArticlesFetch: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/admin/newsarticles`,
        method: "GET",
      }),
    }),
    newsArticleUpdate: builder.mutation({
      query: ({ id, data }) => ({
        url: `${BACKEND_URL}/admin/newsarticle/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    newsArticleDelete: builder.mutation({
      query: (id) => ({
        url: `${BACKEND_URL}/admin/newsarticle/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useNewsArticleCreatePostMutation,
  useNewsArticlesFetchMutation,
  useNewsArticleUpdateMutation,
  useNewsArticleDeleteMutation,
} = newsArticleApiSlice;
