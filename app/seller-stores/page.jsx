"use client";

import React, { useState } from "react";
import {
  useFetchStoresQueueQuery,
  useApproveStoreMutation,
  useRejectStoreMutation,
} from "@Slices/sellerStoresApiSlice";
import { Box } from "@chakra-ui/react";

export default function SellerStoresPage() {
  const [status, setStatus] = useState("pending");
  const { data: stores, isLoading, isError, error, refetch } = useFetchStoresQueueQuery(status);
  const [approveStore] = useApproveStoreMutation();
  const [rejectStore] = useRejectStoreMutation();
  const [rejectReason, setRejectReason] = useState({});
  const [loadingId, setLoadingId] = useState(null);

  const handleApprove = async (storeId) => {
    setLoadingId(storeId);
    try {
      await approveStore(storeId).unwrap();
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (storeId) => {
    const reason = rejectReason[storeId] || "";
    setLoadingId(storeId);
    try {
      await rejectStore({ storeId, reason }).unwrap();
      setRejectReason((p) => ({ ...p, [storeId]: "" }));
      refetch();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Box marginTop={20}>
      <h1 className="text-2xl font-bold mb-4 text-center">Seller Stores Queue</h1>
      <div className="mb-4 flex gap-2 justify-center">
        <button type="button" onClick={() => setStatus("pending")} className={"px-4 py-2 rounded " + (status === "pending" ? "bg-green-600 text-white" : "bg-gray-200")}>Pending</button>
        <button type="button" onClick={() => setStatus("approved")} className={"px-4 py-2 rounded " + (status === "approved" ? "bg-green-600 text-white" : "bg-gray-200")}>Approved</button>
        <button type="button" onClick={() => setStatus("rejected")} className={"px-4 py-2 rounded " + (status === "rejected" ? "bg-green-600 text-white" : "bg-gray-200")}>Rejected</button>
      </div>
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : isError ? (
        <p className="text-center text-red-600">Error: {error?.message}</p>
      ) : stores?.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="divide-y divide-gray-200 w-full max-w-4xl mx-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Store name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Seller</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {status === "pending" ? <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => (
                <tr key={store._id} className="bg-white hover:bg-gray-50 border-b">
                  <td className="px-4 py-3">{store.name}</td>
                  <td className="px-4 py-3">{store.sellerId ? [store.sellerId.firstname, store.sellerId.lastname].filter(Boolean).join(" ") || store.sellerId.email : "—"}</td>
                  <td className="px-4 py-3">{store.locationId?.name ?? store.addressLine ?? "—"}</td>
                  <td className="px-4 py-3">{store.status}</td>
                  {status === "pending" ? (
                    <td className="px-4 py-3">
                      <input type="text" placeholder="Rejection reason" value={rejectReason[store._id] ?? ""} onChange={(e) => setRejectReason((p) => ({ ...p, [store._id]: e.target.value }))} className="border rounded px-2 py-1 text-sm mr-2 w-40" />
                      <button type="button" onClick={() => handleApprove(store._id)} disabled={loadingId === store._id} className="bg-green-600 text-white px-3 py-1 rounded text-sm mr-1 disabled:opacity-50">Approve</button>
                      <button type="button" onClick={() => handleReject(store._id)} disabled={loadingId === store._id} className="bg-red-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50">Reject</button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No stores found.</p>
      )}
    </Box>
  );
}
