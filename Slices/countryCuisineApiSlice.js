"use client";

import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const countryCuisineApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCountryCuisines: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/country-cuisines`,
        method: "GET",
      }),
    }),
    uploadCountryCuisineImage: builder.mutation({
      query: ({ code, formData }) => ({
        url: `${BACKEND_URL}/admin/country-cuisines/${encodeURIComponent(code)}/image`,
        method: "PUT",
        body: formData,
      }),
    }),
    updateCountryCuisine: builder.mutation({
      query: ({ code, menuName, specialty, desc }) => ({
        url: `${BACKEND_URL}/admin/country-cuisines/${encodeURIComponent(code)}`,
        method: "PUT",
        body: { menuName, specialty, desc },
      }),
    }),
  }),
});

export const {
  useGetCountryCuisinesMutation,
  useUploadCountryCuisineImageMutation,
  useUpdateCountryCuisineMutation,
} = countryCuisineApiSlice;
