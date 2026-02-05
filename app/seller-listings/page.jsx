"use client";

import React, { useState } from "react";
import {
  useFetchListingsQueueQuery,
  useApproveListingMutation,
  useRejectListingMutation,
} from "@Slices/sellerListingsApiSlice";
import { Box } from "@chakra-ui/react";

export default function SellerListingsPage() {
  const [status, setStatus] = useState("pending");
  const { data: listings, isLoading, isError, error, refetch } = useFetchListingsQueueQuery(status);
  const [approveListing] = useApproveListingMutation();
  const [rejectListing] = useRejectListingMutation();
  const [rejectReason, setRejectReason] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const handleApprove = async (listingId) => {
    setLoadingId(listingId);
    try {
      await approveListing(listingId).unwrap();
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (listingId) => {
    const reason = rejectReason[listingId] || "";
    setLoadingId(listingId);
    try {
      await rejectListing({ listingId, reason }).unwrap();
      setRejectReason((p) => ({ ...p, [listingId]: "" }));
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Box marginTop={20}>
      <h1 className="text-2xl font-bold mb-4 text-center">Seller Listings Queue</h1>
      <div className="mb-4 flex gap-2 justify-center">
        <button
          type="button"
          onClick={() => setStatus("pending")}
          className={`px-4 py-2 rounded ${status === "pending" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Pending
        </button>
        <button
          type="button"
          onClick={() => setStatus("approved")}
          className={`px-4 py-2 rounded ${status === "approved" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Approved
        </button>
        <button
          type="button"
          onClick={() => setStatus("rejected")}
          className={`px-4 py-2 rounded ${status === "rejected" ? "bg-green-600 text-white" : "bg-gray-200"}`}
        >
          Rejected
        </button>
      </div>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : isError ? (
        <p className="text-center text-red-600">Error: {error?.message}</p>
      ) : listings?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="divide-y divide-gray-200 w-full max-w-4xl mx-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {status === "pending" && (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing._id} className="bg-white hover:bg-gray-50 border-b">
                  <td className="px-4 py-3">{listing.title}</td>
                  <td className="px-4 py-3">
                    {listing.sellerId
                      ? [listing.sellerId.firstname, listing.sellerId.lastname].filter(Boolean).join(" ") || listing.sellerId.email
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{listing.categoryId?.name ?? "—"}</td>
                  <td className="px-4 py-3">UGX {(listing.price ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{listing.status}</td>
                  {status === "pending" && (
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Rejection reason (optional)"
                        value={rejectReason[listing._id] ?? ""}
                        onChange={(e) => setRejectReason((p) => ({ ...p, [listing._id]: e.target.value }))}
                        className="border rounded px-2 py-1 text-sm mr-2 w-40"
                      />
                      <button
                        type="button"
                        onClick={() => handleApprove(listing._id)}
                        disabled={loadingId === listing._id}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm mr-1 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(listing._id)}
                        disabled={loadingId === listing._id}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No listings found.</p>
      )}
    </Box>
  );
}
