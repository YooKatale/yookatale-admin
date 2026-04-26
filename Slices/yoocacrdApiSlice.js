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
    // Meal plans (subscription packages) — used on /subscription page
    subscriptionPackagesFetch: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/subscription/package/get`,
        method: "GET",
      }),
    }),
    subscriptionPackageCreate: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/api/subscription/package/`,
        method: "POST",
        body: data,
      }),
    }),
    subscriptionPackageUpdate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `${BACKEND_URL}/api/subscription-packages/${id}`,
        method: "PUT",
        body,
      }),
    }),
    subscriptionPackageDelete: builder.mutation({
      query: (id) => ({
        url: `${BACKEND_URL}/api/subscription-packages/${id}`,
        method: "DELETE",
      }),
    }),
    mealCalendarOverridesFetch: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/meal-calendar/overrides`,
        method: "GET",
      }),
    }),
    mealCalendarOverrideUpsert: builder.mutation({
      query: (body) => ({
        url: `${BACKEND_URL}/api/meal-calendar/overrides`,
        method: "PUT",
        body,
      }),
    }),
    mealSlotsFetch: builder.mutation({
      query: (params) => {
        const q = params ? `?${new URLSearchParams(params).toString()}` : "";
        return { url: `${BACKEND_URL}/api/meal-calendar/slots${q}`, method: "GET" };
      },
    }),
    mealSlotUpsert: builder.mutation({
      query: (body) => ({
        url: `${BACKEND_URL}/api/meal-calendar/slots`,
        method: "PUT",
        body,
      }),
    }),
    subscriptionsReject: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/subscriptions/${data}/reject`,
        method: "PATCH",
      }),
    }),
    subscriptionsBulkDelete: builder.mutation({
      query: (body) => ({
        url: `${BACKEND_URL}/admin/subscriptions/bulk-delete`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useYoocardCreatePostMutation,
  useYoocardsFetchMutation,
  useSubscriptionsFetchMutation,
  useSubscriptionsApproveMutation,
  useSubscriptionPackagesFetchMutation,
  useSubscriptionPackageCreateMutation,
  useSubscriptionPackageUpdateMutation,
  useSubscriptionPackageDeleteMutation,
  useMealCalendarOverridesFetchMutation,
  useMealCalendarOverrideUpsertMutation,
  useMealSlotsFetchMutation,
  useMealSlotUpsertMutation,
  useSubscriptionsRejectMutation,
  useSubscriptionsBulkDeleteMutation,
} = yoocardApiSlice;
