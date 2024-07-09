import React, { useState, useEffect } from 'react';
import { useFetchVendorsQuery, useActivateVendorMutation } from './vendorPageApiSlice';

const AdminDashboard = ({ data }) => {
  const { data: vendors, error, isLoading, refetch } = useFetchVendorsQuery();
  const [activateVendor] = useActivateVendorMutation();

  const handleActivateVendor = async (vendorId) => {
    try {
      await activateVendor(vendorId);
      refetch(); // refresh the vendor list after activation
    } catch (error) {
      console.error('Failed to activate vendor:', error);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Real-Time Data</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <h2>Vendor Notifications</h2>
      {isLoading && <p>Loading vendors...</p>}
      {error && <p>Error loading vendors: {error.message}</p>}
      {vendors && (
        <ul>
          {vendors.map((vendor) => (
            <li key={vendor.id}>
              {vendor.name} - {vendor.status}
              {vendor.status === 'Pending' && (
                <button onClick={() => handleActivateVendor(vendor.id)}>Activate</button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminDashboard;
