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
  }),
});

export const { useVendorGetMutation } = vendorApiSlice;
