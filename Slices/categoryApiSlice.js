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
  }),
});

export const {
  useCategoriesGetMutation,
  useCategoryCreateMutation,
} = categoryApiSlice;

