"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getCsrfToken, CSRF_HEADER } from "@/lib/csrf";

const baseQuery = fetchBaseQuery({
  baseUrl: "/",
  credentials: "include",
  prepareHeaders: (headers) => {
    // Attach CSRF token to every mutating request
    const token = getCsrfToken();
    if (token) {
      headers.set(CSRF_HEADER, token);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["User", "Orders", "Deliveries"],
  endpoints: (builder) => ({}),
});
