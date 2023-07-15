// "use client";

import { DEV_BACKEND_URL, PROD_BACKEND_URL } from "@constants/contant";
import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${PROD_BACKEND_URL}/admin/auth`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useLoginMutation } = usersApiSlice;
