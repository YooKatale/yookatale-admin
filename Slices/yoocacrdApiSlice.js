// "use client";

import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

const parseJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const requestWithFallback = async (urlCandidates, init = {}) => {
  let lastErr = null;

  for (const url of urlCandidates) {
    try {
      const response = await fetch(url, {
        credentials: "include",
        ...init,
        headers: {
          Accept: "application/json",
          ...(init.headers || {}),
        },
      });

      const data = await parseJsonResponse(response);
      const requestSucceeded =
        response.ok &&
        data?.success !== false &&
        (!data?.status || data.status === "Success" || data.status === "success") &&
        data?.success !== false;
      if (requestSucceeded) {
        return { data };
      }

      lastErr = new Error(data?.message || `Request failed for ${url}`);
      lastErr.data = data;
      lastErr.status = response.status;
      if (response.status !== 404) throw lastErr;
    } catch (error) {
      lastErr = error;
      if (error?.status !== 404) throw error;
    }
  }

  throw lastErr || new Error("Request failed");
};

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
    // Subscription packages are managed through the authenticated admin API.
    subscriptionPackagesFetch: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/admin/subscription-packages`,
        method: "GET",
      }),
    }),
    subscriptionPackageCreate: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/subscription-packages`,
        method: "POST",
        body: data,
      }),
    }),
    subscriptionPackageUpdate: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `${BACKEND_URL}/admin/subscription-packages/${id}`,
        method: "PUT",
        body,
      }),
    }),
    subscriptionPackageDelete: builder.mutation({
      query: (id) => ({
        url: `${BACKEND_URL}/admin/subscription-packages/${id}`,
        method: "DELETE",
      }),
    }),
    mealCalendarOverridesFetch: builder.mutation({
      queryFn: async () => {
        const candidates = [
          `${BACKEND_URL}/api/meal-calendar/overrides`,
          `${BACKEND_URL}/api/mealcalendar/overrides`,
          `${BACKEND_URL}/admin/meal-calendar/overrides`,
        ];
        return requestWithFallback(candidates, { method: "GET" });
      },
    }),
    mealCalendarOverrideUpsert: builder.mutation({
      queryFn: async (body) => {
        const candidates = [
          `${BACKEND_URL}/api/meal-calendar/overrides`,
          `${BACKEND_URL}/api/mealcalendar/overrides`,
          `${BACKEND_URL}/admin/meal-calendar/overrides`,
        ];
        return requestWithFallback(candidates, {
          method: "PUT",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        });
      },
    }),
    mealSlotsFetch: builder.mutation({
      queryFn: async (params) => {
        const q = params ? `?${new URLSearchParams(params).toString()}` : "";
        const candidates = [
          `${BACKEND_URL}/api/meal-calendar/slots${q}`,
          `${BACKEND_URL}/api/mealcalendar/slots${q}`,
          `${BACKEND_URL}/admin/meal-calendar/slots${q}`,
        ];
        return requestWithFallback(candidates, { method: "GET" });
      },
    }),
    mealSlotUpsert: builder.mutation({
      queryFn: async (body) => {
        const candidates = [
          `${BACKEND_URL}/api/meal-calendar/slots`,
          `${BACKEND_URL}/api/mealcalendar/slots`,
          `${BACKEND_URL}/admin/meal-calendar/slots`,
        ];
        return requestWithFallback(candidates, {
          method: "PUT",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        });
      },
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
