"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import { usePartnerGetQuery } from "@Slices/partnersPageApiSlice";

const PartnerPage = () => {
const [partners, setPartners] = useState([]);
const [loading, setLoading] = useState(true);

const { data: partnersData, isLoading, isError, error } = usePartnerGetQuery();

useEffect(() => {
  if (!isLoading && !isError) {
    setPartners(partnersData.data || []); 
    setLoading(false);
  }
}, [partnersData, isLoading, isError]);

return (
  <div>
    <Navbar />
    <Sidenav />
    <div className="ml-72 p-8"> 
      <br />
      <br />
      <h1 className="text-3xl font-bold mb-6">Delivery Partners</h1>
      
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : isError ? (
        <p className="text-red-500">Error: {error.message}</p>
      ) : (
        <div>
          {partners.length > 0 ? (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number Plate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transport Means</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verification</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner._id} className="border-t border-gray-200">
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.businessName}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.businessAddress}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.businessHours}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.numberPlate}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.transport}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-r border-gray-300">{partner.status}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="bg-blue-500 text-white py-1 px-2 rounded mr-2">Verify</button>
                      <button className="bg-red-500 text-white py-1 px-2 rounded">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-600">No partners found.</p>
          )}
        </div>
      )}
    </div>
  </div>
);
};

export default PartnerPage;
