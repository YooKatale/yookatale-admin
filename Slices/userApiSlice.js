"use client";

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
      invalidatesTags: ["Accounts"],
    }),

    logout: builder.mutation({
      query: () => ({
        // TO DO: "/api/auth/logout" — fix to match the /admin prefix used everywhere else
        url: `${BACKEND_URL}/api/auth/logout`,
        method: "POST",
      }),
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/forgot-password`,
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/reset-password`,
        method: "POST",
        body: data,
      }),
    }),

    // GET requests converted from mutation -> query for caching/auto-refetch
    getAccounts: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/admin/accounts`,
        method: "GET",
      }),
      providesTags: ["Accounts"],
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
      invalidatesTags: ["Accounts"],
    }),

    getDashboardData: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/admin/dashboard`,
        method: "GET",
      }),
    }),

    dashboardData: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/admin/dashboard`,
        method: "GET",
      }),
    }),

    getAuditLogs: builder.query({
      query: () => ({
        url: `${BACKEND_URL}/admin/auditlogs`,
        method: "GET",
      }),
      providesTags: ["AuditLogs"],
    }),

    auditlogsget: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/admin/auditlogs`,
        method: "GET",
      }),
    }),

    updateAdminUserAccount: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/updateAdminUserAccount`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Accounts"],
    }),

    deleteUserAccount: builder.mutation({
      query: (id) => ({
        url: `${BACKEND_URL}/admin/deleteAdminUserAccount/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Accounts"],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useGetAccountsQuery,
  useLazyGetAccountsQuery,
  useAccountsGetMutation,
  useRegisterMutation,
  useAccountUpdateMutation,
  useGetDashboardDataQuery,
  useLazyGetDashboardDataQuery,
  useDashboardDataMutation,
  useGetAuditLogsQuery,
  useLazyGetAuditLogsQuery,
  useAuditlogsgetMutation,
  useUpdateAdminUserAccountMutation,
  useDeleteUserAccountMutation,
} = usersApiSlice;