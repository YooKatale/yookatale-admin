import React from 'react';
import { getSession } from 'next-auth/react';

const CustomerServicePage = ({ session }) => {
  if (!session || session.user.role !== 'customerService') {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Customer Service Page</h1>
      {/* customer service specific content */}
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
    props: { session },
  };
}

export default CustomerServicePage;
