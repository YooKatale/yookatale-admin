// "use client";

import { DEV_BACKEND_URL, PROD_BACKEND_URL } from "@constants/contant";
import { apiSlice } from "./apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    productsGet: builder.mutation({
      query: () => ({
        url: `${PROD_BACKEND_URL}/products`,
        method: "GET",
      }),
    }),
    productCreate: builder.mutation({
      query: (data) => ({
        url: `${PROD_BACKEND_URL}/product/new`,
        method: "POST",
        body: data,
      }),
    }),
    productGet: builder.mutation({
      query: (data) => ({
        url: `${PROD_BACKEND_URL}/product/${data}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useProductsGetMutation,
  useProductCreateMutation,
  useProductGetMutation,
} = productApiSlice;
