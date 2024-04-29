"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@components/Navbar";
import Sidenav from "@components/Sidenav";
import { useFetchPartnersQuery } from "@Slices/partnersPageApiSlice";

const PartnerPage = () => {
  const { data: partners, isLoading, isError, error } = useFetchPartnersQuery();

  return (
    <div className="flex">
      <Navbar />
      <div className="flex flex-col w-full">
        <Sidenav marginTop={true} />
        <div className="w-full pl-0 lg:pl-72 bg-gray-100 p-4 sm:p-6 lg:p-8">
          {isLoading ? (
            <p className="text-gray-600 text-center">Loading...</p>
          ) : isError ? (
            <p className="text-red-500 text-center">
              Error: {error && error.message}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <br />
              <br />
              <h1 className="text-3xl font-bold mb-6 text-center">
                Delivery Partners
              </h1>
              {partners.length > 0 ? (
                <table className="w-full table-auto lg:ml-3">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Business Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Business Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Business Hours
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Number Plate
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Transport Means
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b border-r">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider border-b">
                        Verification
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr
                        key={partner._id}
                        className="bg-white border-t border-gray-300"
                      >
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.businessName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.businessAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.businessHours}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.numberPlate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.transport}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-r">
                          {partner.status}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap border-b">
                          <button className="bg-blue-500 text-white py-1 px-2 rounded mr-2">
                            Verify
                          </button>
                          <button className="bg-red-500 text-white py-1 px-2 rounded">
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-600 text-center">No partners found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartnerPage;
