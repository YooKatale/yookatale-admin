// "use client";

import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const ratingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppRatings: builder.mutation({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.platform) queryParams.append('platform', params.platform);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        
        const queryString = queryParams.toString();
        return {
          url: `${BACKEND_URL}/api/ratings/app${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
    }),
    getPlatformFeedback: builder.mutation({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.platform) queryParams.append('platform', params.platform);
        if (params.category) queryParams.append('category', params.category);
        if (params.startDate) queryParams.append('startDate', params.startDate);
        if (params.endDate) queryParams.append('endDate', params.endDate);
        
        const queryString = queryParams.toString();
        return {
          url: `${BACKEND_URL}/api/ratings/platform${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
    }),
    getProductRatings: builder.mutation({
      query: () => {
        return {
          url: `${BACKEND_URL}/api/ratings/products`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useGetAppRatingsMutation,
  useGetPlatformFeedbackMutation,
  useGetProductRatingsMutation,
} = ratingsApiSlice;
