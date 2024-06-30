import React from 'react';
import { getSession } from 'next-auth/react';

const ProductEditorPage = ({ session }) => {
  if (!session || session.user.role !== 'productEditor') {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      <h1>Product Editor Page</h1>
      {/* product editor  content */}
    </div>
  );
};

export async function getServerSideProps(context) {
  const session = await getSession(context);
  return {
    props: { session },
  };
}

export default ProductEditorPage;
