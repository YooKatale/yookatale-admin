"use client";

import React, { useState } from "react";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import {
  useFetchVendorsQuery,
  useVerifyVendorMutation,
} from "@Slices/vendorPageApiSlice";
import { useVendorGetMutation } from "@Slices/vendorApiSlice";
import VendorDetailsPopup from "@components/VendorDetailsPopup";

const VendorPage = () => {
  const { data: vendors, isLoading, isError, error } = useFetchVendorsQuery();
  const [verifyVendor] = useVerifyVendorMutation();

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleRowClick = (vendor) => {
    console.log(vendors);
    console.log("Vendor clicked:", vendor);
    setSelectedVendor(vendor);
    setIsPopupOpen(true);
  };

  const handleVerify = async (vendorId) => {
    try {
      await verifyVendor(vendorId).unwrap();
      console.log("Vendor verified successfully");
    } catch (error) {
      console.error("Failed to verify vendor:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <Sidenav />
      <div className="ml-72 p-8">
        <br />
        <br />
        <br />
        <h1 className="text-2xl font-bold mb-4 text-center">
          Registered Vendors
        </h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : isError ? (
          <p>Error: {error.message}</p>
        ) : vendors && vendors.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-r">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-r">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-r">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-r">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-r">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-r">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr
                  key={vendor._id}
                  className="bg-white hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleRowClick(vendor)}
                >
                  <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                    {vendor.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                    {vendor.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                    {vendor.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                    {vendor.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                    {vendor.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                    {vendor.status === "Verified" ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Not Verified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b">
                    {vendor.status === "Unverified" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerify(vendor._id);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
                      >
                        Verify
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center" style={{ marginTop: "20%" }}>
            <p>No vendors found</p>
          </div>
        )}
      </div>
      {isPopupOpen && selectedVendor && (
        <VendorDetailsPopup
          vendor={selectedVendor}
          onClose={() => setIsPopupOpen(false)}
        />
      )}
    </div>
  );
};

export default VendorPage;
