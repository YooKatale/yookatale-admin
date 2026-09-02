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
      if (response.ok || data?.status === "Success" || data?.success) {
        return { data: data?.data ?? data };
      }

      lastErr = new Error(data?.message || `Request failed for ${url}`);
      lastErr.data = data;
    } catch (error) {
      lastErr = error;
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
    // Meal plans (subscription packages) — used on /subscription page
    subscriptionPackagesFetch: builder.mutation({
      queryFn: async () => {
        const candidates = [
          `${BACKEND_URL}/api/subscription/package/get`,
          `${BACKEND_URL}/api/subscription-packages`,
          `${BACKEND_URL}/api/subscription/packages`,
          `${BACKEND_URL}/admin/subscription/packages`,
        ];
        return requestWithFallback(candidates, { method: "GET" });
      },
    }),
    subscriptionPackageCreate: builder.mutation({
      queryFn: async (data) => {
        const candidates = [
          `${BACKEND_URL}/api/subscription/package`,
          `${BACKEND_URL}/api/subscription/package/`,
          `${BACKEND_URL}/api/subscription-packages`,
          `${BACKEND_URL}/admin/subscription/packages`,
        ];
        return requestWithFallback(candidates, {
          method: "POST",
          body: JSON.stringify(data),
          headers: { "Content-Type": "application/json" },
        });
      },
    }),
    subscriptionPackageUpdate: builder.mutation({
      queryFn: async ({ id, ...body }) => {
        const candidates = [
          `${BACKEND_URL}/api/subscription-packages/${id}`,
          `${BACKEND_URL}/api/subscription/package/${id}`,
          `${BACKEND_URL}/api/subscription/packages/${id}`,
          `${BACKEND_URL}/admin/subscription/packages/${id}`,
        ];
        return requestWithFallback(candidates, {
          method: "PUT",
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        });
      },
    }),
    subscriptionPackageDelete: builder.mutation({
      queryFn: async (id) => {
        const candidates = [
          `${BACKEND_URL}/api/subscription-packages/${id}`,
          `${BACKEND_URL}/api/subscription/package/${id}`,
          `${BACKEND_URL}/api/subscription/packages/${id}`,
          `${BACKEND_URL}/admin/subscription/packages/${id}`,
        ];
        return requestWithFallback(candidates, { method: "DELETE" });
      },
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
