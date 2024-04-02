"use client";

import React, { useState } from 'react';
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import { useVendorGetQuery } from "@Slices/vendorPageApiSlice";
import VendorDetailsPopup from "@components/VendorDetailsPopup"; 

const VendorPage = () => {
  const { data: vendors, error, isLoading, refetch } = useVendorGetQuery();
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleRowClick = (vendor) => {
    setSelectedVendor(vendor);
    setIsPopupOpen(true);
  };

  const handleVerify = (vendorId) => {
    console.log("Verifying vendor with ID:", vendorId);
  };


  return (
    <div>
      <Navbar />
      <Sidenav />
      <div className="ml-72 p-8"> 
      <br />
        <br />
        <h1 className="text-2xl font-bold mb-4">Registered Vendors</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : error ? (
          <p>Error: {error.message}</p>
        ) : vendors && vendors.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
            {vendors.map((vendor) => (
  <tr key={vendor.id} className="bg-white hover:bg-gray-100 cursor-pointer" >
    <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleRowClick(vendor)}>{vendor.name}</td>
    <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleRowClick(vendor)}>{vendor.address}</td>
    <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleRowClick(vendor)}>{vendor.phone}</td>
    <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleRowClick(vendor)}>{vendor.emailAddress}</td>
    <td className="px-6 py-4 whitespace-nowrap" onClick={() => handleRowClick(vendor)}>{vendor.category}</td>
    <td className="px-6 py-4 whitespace-nowrap">
      {vendor.verified ? (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Verified</span>
      ) : (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Not Verified</span>
      )}
    </td>
    <td className="px-6 py-4 whitespace-nowrap">
      {!vendor.verified && (
        <button onClick={() => handleVerify(vendor.id)} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer">
          Verify
        </button>
      )}
    </td>
  </tr>
))}
            </tbody>
          </table>
        ) : (
          <div className="flex justify-center" style={{marginTop:"20%"}}>
            <p>No vendors found</p>
          </div>
        )}
      </div>
      {isPopupOpen && selectedVendor && (
        <VendorDetailsPopup vendor={selectedVendor} onClose={() => setIsPopupOpen(false)} />
      )}
    </div>
  );
};

export default VendorPage;
