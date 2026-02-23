import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    categoriesGet: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/categories`,
        method: "GET",
      }),
    }),
    categoryCreate: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/api/categories`,
        method: "POST",
        body: data,
      }),
    }),
    categoryUpdate: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${BACKEND_URL}/api/categories/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    categoryDelete: builder.mutation({
      query: (id) => ({
        url: `${BACKEND_URL}/api/categories/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCategoriesGetMutation,
  useCategoryCreateMutation,
  useCategoryUpdateMutation,
  useCategoryDeleteMutation,
} = categoryApiSlice;

