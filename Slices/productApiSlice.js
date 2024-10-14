// "use client";

import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    productsGet: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/products`,
        method: "GET",
      }),
    }),
    productCreate: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/product/new`,
        method: "POST",
        body: data,
      }),
    }),
    // productEdit: builder.mutation({
    //   query: (data) => ({
    //     url: `${BACKEND_URL}/admin/product/edit/${data.id}`,
    //     method: "PUT",
    //     body: data,
    //   }),
    // }),
    productEdit: builder.mutation({
      query: (data) => {
        const isFormData = data instanceof FormData;
        return {
          url: `${BACKEND_URL}/admin/product/edit/${data.id}`, // Fixed missing slash
          method: "PUT",
          body: isFormData ? data : JSON.stringify(data), // If it's FormData, pass it as-is; otherwise, stringify
        };
      },
    }),
    productGet: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/api/product/${data}`,
        method: "GET",
      }),
    }),
    productDelete: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/admin/product/${data}`,
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
