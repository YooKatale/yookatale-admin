// "use client";

import { BACKEND_URL } from "@constants/contant";
import { apiSlice } from "./apiSlice";

export const newsblogApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    newsblogCreatePost: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/newsblog`,
        method: "POST",
        body: data,
      }),
    }),
    newsblogsFetch: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/newsblogs`,
        method: "GET",
      }),
    }),
    newsblogFetch: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/api/newsblog/${data}`,
        method: "GET",
      }),
    }),
    newsblogDelete: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/newsblog/${data}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useNewsblogCreatePostMutation,
  useNewsblogsFetchMutation,
  useNewsblogDeleteMutation,
  useNewsblogFetchMutation,
} = newsblogApiSlice;
