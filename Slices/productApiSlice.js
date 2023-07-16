// "use client";

import { DEV_BACKEND_URL, PROD_BACKEND_URL } from "@constants/contant";
import { apiSlice } from "./apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    productsGet: builder.mutation({
      query: () => ({
        url: `${PROD_BACKEND_URL}/api/products`,
        method: "GET",
      }),
    }),
    productCreate: builder.mutation({
      query: (data) => ({
        url: `${PROD_BACKEND_URL}/admin/product/new`,
        method: "POST",
        body: data,
      }),
    }),
    productEdit: builder.mutation({
      query: (data) => ({
        url: `${PROD_BACKEND_URL}/admin/product/edit`,
        method: "PUT",
        body: data,
      }),
    }),
    productGet: builder.mutation({
      query: (data) => ({
        url: `${PROD_BACKEND_URL}/api/product/${data}`,
        method: "GET",
      }),
    }),
    productDelete: builder.mutation({
      query: (data) => ({
        url: `${PROD_BACKEND_URL}/admin/product/${data}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useProductsGetMutation,
  useProductCreateMutation,
  useProductGetMutation,
  useProductDeleteMutation,
  useProductEditMutation,
} = productApiSlice;
