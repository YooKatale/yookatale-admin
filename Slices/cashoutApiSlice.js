"use client";

import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const cashoutApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCashoutUsers: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/admin/cashout/users`,
        method: "GET",
        credentials: "include",
      }),
    }),
    creditUserCashout: builder.mutation({
      query: (body) => ({
        url: `${BACKEND_URL}/admin/cashout/credit`,
        method: "PUT",
        body,
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useGetCashoutUsersMutation,
  useCreditUserCashoutMutation,
} = cashoutApiSlice;
