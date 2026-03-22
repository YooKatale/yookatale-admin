import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const settingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAppSettings: builder.mutation({
      query: () => ({
        url: `${BACKEND_URL}/api/admin/settings`,
        method: "GET",
      }),
    }),
    updateAppSettings: builder.mutation({
      query: (data) => ({
        url: `${BACKEND_URL}/api/admin/settings`,
        method: "PUT",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAppSettingsMutation,
  useUpdateAppSettingsMutation,
} = settingsApiSlice;
