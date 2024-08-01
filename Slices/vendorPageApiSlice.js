import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const vendorPageApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchVendors: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/api/vendors`,
        method: "GET",
      }),
      transformResponse: (response) => {
        if (response.status === "Success") {
          return response.data;
        } else {
          throw new Error("Failed to fetch vendors");
        }
      },
    }),
    verifyVendor: builder.mutation({
      query: (vendorId) => ({
        url: `${BACKEND_URL}/admin/verify-vendor/${vendorId}`,
        method: "PUT",
      }),
    }),
    createVendor: builder.mutation({
      query: (vendorData) => ({
        url: `${BACKEND_URL}/api/vendor/new`,
        method: "POST",
        body: vendorData,
      }),
    }),
  }),
});

export const { useFetchVendorsQuery, useVerifyVendorMutation } =
  vendorPageApiSlice;
