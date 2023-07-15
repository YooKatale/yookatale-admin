// "use client";

import { apiSlice } from "./apiSlice";

// const USERS_URL = "https://yookatale-server-app.onrender.com/api";

const USERS_URL = "http://localhost:8000/api";

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/admin/auth`,
        method: "POST",
        body: data,
      }),
    }),
    productsGet: builder.mutation({
      query: () => ({
        url: `${USERS_URL}/products`,
        method: "GET",
      }),
    }),
    productCreate: builder.mutation({
      query: (data) => ({
        url: `${USERS_URL}/product/new`,
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useProductsGetMutation,
  useProductCreateMutation,
} = usersApiSlice;
