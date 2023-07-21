// "use client";

import { BACKEND_URL } from "@constants/contant";
import { apiSlice } from "./apiSlice";

export const yoocardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    yoocardCreatePost: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/subscription/card`,
        method: "POST",
        body: data,
      }),
    }),
    yoocardsFetch: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/subscription`,
        method: "GET",
      }),
    }),
  }),
});

export const { useYoocardCreatePostMutation, useYoocardsFetchMutation } =
  yoocardApiSlice;
