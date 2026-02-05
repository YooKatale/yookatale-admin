import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const sellerStoresApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchStoresQueue: builder.query({
      query: (status = "pending") => ({
        url: `${BACKEND_URL}/admin/stores?status=${status}`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (response?.status === "Success") return response.data ?? [];
        throw new Error("Failed to fetch stores");
      },
    }),
    approveStore: builder.mutation({
      query: (storeId) => ({
        url: `${BACKEND_URL}/admin/stores/approve/${storeId}`,
        method: "PUT",
        credentials: "include",
      }),
    }),
    rejectStore: builder.mutation({
      query: ({ storeId, reason }) => ({
        url: `${BACKEND_URL}/admin/stores/reject/${storeId}`,
        method: "PUT",
        body: reason != null ? { reason } : {},
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useFetchStoresQueueQuery,
  useApproveStoreMutation,
  useRejectStoreMutation,
} = sellerStoresApiSlice;
