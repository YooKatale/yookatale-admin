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
    register: builder.mutation({
      query: (data) => ({
        url: `${PROD_BACKEND_URL}/admin/register`,
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${PROD_BACKEND_URL}/api/users/logout`,
        method: "POST",
      }),
    }),
    accountsGet: builder.mutation({
      query: () => ({
        url: `${PROD_BACKEND_URL}/admin/accounts`,
        method: "GET",
      }),
    }),
    accountUpdate: builder.mutation({
      query: (data) => ({
        url: `${PROD_BACKEND_URL}/admin/account`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useAccountsGetMutation,
  useRegisterMutation,
  useAccountUpdateMutation,
} = usersApiSlice;
