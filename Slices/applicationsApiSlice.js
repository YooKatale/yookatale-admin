"use client";

import { apiSlice } from "./apiSlice";
import { BACKEND_URL } from "@constants/constant";

export const applicationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}admin/careers/applications`,
        method: "GET",
      }),
    }),
  }),
});

export const { useGetApplicationsMutation } = applicationsApiSlice;
