'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { redirectToLogin } from '../../lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAuthAndRedirect = async () => {
      try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (resp.status === 401) {
          redirectToLogin(router, '/dashboard');
          return;
        }

        if (!resp.ok) {
          throw new Error('Failed to load profile');
        }

        const user = await resp.json();
        let dest = searchParams.get('redirect') || '/dashboard/customer';

        if (user?.user_type === 'admin') dest = '/dashboard/admin';
        else if (user?.user_type === 'staff') dest = '/dashboard/staff';

        router.replace(dest);
      } catch (e) {
        redirectToLogin(router, '/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRedirect();
  }, [router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return null;
}
