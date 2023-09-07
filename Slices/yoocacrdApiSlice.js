// "use client";

import { BACKEND_URL } from "@constants/constant";
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
    subscriptionsFetch: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/subscriptions/${data}`,
        method: "GET",
      }),
    }),
    subscriptionsApprove: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/subscriptions/${data}`,
        method: "PUT",
      }),
    }),
  }),
});

export const {
  useYoocardCreatePostMutation,
  useYoocardsFetchMutation,
  useSubscriptionsFetchMutation,
  useSubscriptionsApproveMutation,
} = yoocardApiSlice;
