import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const schedulesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchSchedules: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/admin/schedules`,
        method: "GET",
      }),
    }),
  }),
});

export const { useFetchSchedulesMutation } = schedulesApiSlice;
