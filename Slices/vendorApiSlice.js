// "use client";

import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const vendorApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    vendorGet: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/vendors`,
        method: "GET",
      }),
    }),
    verifyVendor: builder.mutation({
      query: (vendorId) => ({
        url: `${BACKEND_URL}/admin/verify-vendor/${vendorId}`,
        method: "PUT",
      }),
    }),
    rejectVendor: builder.mutation({
      query: (vendorId) => ({
        url: `${BACKEND_URL}/admin/reject-vendor/${vendorId}`,
        method: "PUT",
      }),
    }),
  }),
});

export const { useVendorGetMutation, useVerifyVendorMutation, useRejectVendorMutation } = vendorApiSlice;
