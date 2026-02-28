"use client";

import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const homepageConfigApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getHomepageConfig: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/homepage-config`,
        method: "GET",
      }),
    }),
    updateHomepageConfig: builder.mutation({
      query: (body) => ({
        url: `${BACKEND_URL}/admin/homepage-config`,
        method: "PUT",
        body,
      }),
    }),
    uploadSideCardImage: builder.mutation({
      query: ({ index, formData }) => ({
        url: `${BACKEND_URL}/admin/homepage-config/upload-side-card-image`,
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useGetHomepageConfigMutation,
  useUpdateHomepageConfigMutation,
  useUploadSideCardImageMutation,
} = homepageConfigApiSlice;
