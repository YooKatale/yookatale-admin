// "use client";

import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/auth`,
        method: "POST",
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/register`,
        method: "POST",
        body: data,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/auth/logout`,
        method: "POST",
      }),
    }),
    accountsGet: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/admin/accounts`,
        method: "GET",
      }),
    }),
    accountUpdate: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/account`,
        method: "PUT",
        body: data,
      }),
    }),
    dashboardData: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/admin/dashboard`,
        method: "GET",
      }),
    }),
    auditlogsget: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/admin/auditlogs`,
        method: "GET",
      }),
    }),
    updateAdminUserAccount: builder.mutation({
      query: (data)=>({
        url: `${BACKEND_URL}/admin/updateAdminUserAccount`,
        method: "PUT",
        body: data,
      })
    }),
    deleteUserAccount: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/deleteAdminUserAccount/${data}`,
        method: "DELETE",
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
  useDashboardDataMutation,
  useAuditlogsgetMutation,
  useUpdateAdminUserAccountMutation,
  useDeleteUserAccountMutation
} = usersApiSlice;
