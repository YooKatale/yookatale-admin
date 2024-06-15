import React from 'react';

const AdminDashboard = ({ data }) => {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Real-Time Data</h2>
      <ul>
        {data.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
