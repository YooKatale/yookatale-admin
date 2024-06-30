import Link from 'next/link';
import { useSession } from 'next-auth/react';

const Navigation = () => {
  const { data: session } = useSession();

  return (
    <nav>
      <ul>
        <li><Link href="/">Home</Link></li>
        {session && session.user.role === 'manager' && (
          <li><Link href="/roles/manager">Manager</Link></li>
        )}
        {session && session.user.role === 'productEditor' && (
          <li><Link href="/roles/productEditor">Product Editor</Link></li>
        )}
        {session && session.user.role === 'customerService' && (
          <li><Link href="/roles/customerService">Customer Service</Link></li>
        )}
      </ul>
    </nav>
  );
};

export default Navigation;
