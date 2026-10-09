import { BACKEND_URL } from "@constants/constant";
import { getAuthToken } from "./authSlice";
import { apiSlice } from "./apiSlice";

const adminRequest = async (path, { method = "GET", body } = {}, api) => {
  const token = getAuthToken(api.getState()?.auth?.userInfo);
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  try {
    const response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      credentials: "include",
      cache: "no-store",
      headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }
    }
    if (!response.ok) {
      return {
        error: {
          status: response.status,
          data: data?.message || data?.error ? data : { ...data, message: `Request failed (${response.status})` },
        },
      };
    }
    if (data?.status && !["Success", "success"].includes(data.status)) {
      return { error: { status: "CUSTOM_ERROR", data } };
    }
    return { data };
  } catch (error) {
    return {
      error: {
        status: "FETCH_ERROR",
        error: error instanceof Error ? error.message : "Network request failed",
      },
    };
  }
};

export const adminCommercialApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPartnerPlansAdmin: builder.query({
      queryFn: (_, api) => adminRequest("/admin/partner-plans", {}, api),
    }),
    createPartnerPlanAdmin: builder.mutation({
      queryFn: (body, api) => adminRequest("/admin/partner-plans", { method: "POST", body }, api),
    }),
    updatePartnerPlanAdmin: builder.mutation({
      queryFn: ({ id, ...body }, api) =>
        adminRequest(`/admin/partner-plans/${encodeURIComponent(id)}`, { method: "PATCH", body }, api),
    }),
    deactivatePartnerPlanAdmin: builder.mutation({
      queryFn: (id, api) =>
        adminRequest(`/admin/partner-plans/${encodeURIComponent(id)}`, { method: "DELETE" }, api),
    }),
    getPartnerPlanEnrollmentsAdmin: builder.query({
      queryFn: (params = {}, api) => {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
        });
        return adminRequest(`/admin/partner-plan-enrollments?${query.toString()}`, {}, api);
      },
    }),
    getAdvertisementPricingAdmin: builder.query({
      queryFn: (_, api) => adminRequest("/admin/advertisement-pricing", {}, api),
    }),
    updateAdvertisementPricingAdmin: builder.mutation({
      queryFn: (body, api) => adminRequest("/admin/advertisement-pricing", { method: "PUT", body }, api),
    }),
  }),
});

export const {
  useGetPartnerPlansAdminQuery,
  useCreatePartnerPlanAdminMutation,
  useUpdatePartnerPlanAdminMutation,
  useDeactivatePartnerPlanAdminMutation,
  useGetPartnerPlanEnrollmentsAdminQuery,
  useGetAdvertisementPricingAdminQuery,
  useUpdateAdvertisementPricingAdminMutation,
} = adminCommercialApiSlice;
