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
      console.log("partnersData:", partnersData);
      console.log("isLoading:", isLoading);
      console.log("isError:", isError);
      console.log("error:", error);
  
      if (!isLoading && !isError) {
        setPartners(partnersData || []);
        setLoading(false);
      }
    }, [partnersData, isLoading, isError]);
  

    console.log("partners:", partners);
  
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
              {partners && partners.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Location</th>
                      <th>Business Name</th>
                      <th>business Address</th>
                      <th>business Hours</th>
                      <th>Number Plate</th>
                      <th>Transport Means</th>
                      <th>Status</th>
                      <th>Verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr key={partner._id}>
                        <td>{partner.fullName}</td>
                        <td>{partner.phone}</td>
                        <td>{partner.email}</td>
                        <td>{partner.location}</td>
                        <td>{partner.businessName}</td>
                        <td>{partner.businessAddress}</td>
                        <td>{partner.businessHours}</td>
                        <td>{partner.numberPlate}</td>
                        <td>{partner.transport}</td>
                        <td>{partner.status}</td>
                        <td>
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
  



