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
          url: `${BACKEND_URL}/ratings/app${queryString ? `?${queryString}` : ''}`,
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
          url: `${BACKEND_URL}/ratings/platform${queryString ? `?${queryString}` : ''}`,
          method: "GET",
        };
      },
    }),
  }),
});

export const {
  useGetAppRatingsMutation,
  useGetPlatformFeedbackMutation,
} = ratingsApiSlice;
