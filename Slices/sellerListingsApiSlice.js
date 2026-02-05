import { BACKEND_URL } from "@constants/constant";
import { apiSlice } from "./apiSlice";

export const sellerListingsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    fetchListingsQueue: builder.query({
      query: (status = "pending") => ({
        url: `${BACKEND_URL}/admin/listings?status=${status}`,
        method: "GET",
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (response?.status === "Success") return response.data ?? [];
        throw new Error("Failed to fetch listings");
      },
    }),
    approveListing: builder.mutation({
      query: (listingId) => ({
        url: `${BACKEND_URL}/admin/listings/approve/${listingId}`,
        method: "PUT",
        credentials: "include",
      }),
    }),
    rejectListing: builder.mutation({
      query: ({ listingId, reason }) => ({
        url: `${BACKEND_URL}/admin/listings/reject/${listingId}`,
        method: "PUT",
        body: reason != null ? { reason } : {},
        credentials: "include",
      }),
    }),
  }),
});

export const {
  useFetchListingsQueueQuery,
  useApproveListingMutation,
  useRejectListingMutation,
} = sellerListingsApiSlice;
