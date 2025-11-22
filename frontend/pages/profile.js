import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { isAuthenticated } from '../lib/auth';

export default function ProfilePage() {
  const router = useRouter();

  if (!isAuthenticated()) {
    router.push('/login');
    return null;
  }

  return (
    <Layout>
      <h1>Profile</h1>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p>User profile page - To be implemented</p>
        <p>This page would allow users to view and update their profile information.</p>
      </div>
    </Layout>
  );
}

