import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const partnerApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    partnerGet: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/partners`,
        method: "GET",
      }),
    }),
  }),
});

export const {
    usePartnerGetMutation
} = partnerApiSlice;
