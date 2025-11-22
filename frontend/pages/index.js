import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // For local development: directly go to dashboard
    router.push('/dashboard');
  }, []);

  return <div>Redirecting to dashboard...</div>;
}
