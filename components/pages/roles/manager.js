import React from 'react';
import { getSession } from 'next-auth/react';

const ManagerPage = ({ session }) => {
  if (!session || session.user.role !== 'manager') {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Manager Page</h1>
      {/* manager content */}
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
    props: { session },
  };
}

export default ManagerPage;
