'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Persisted theme
    const saved = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    if (saved) setTheme(saved);

    const checkAuth = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = (typeof window !== 'undefined') ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;
        const res = await fetch(`${apiBase}/api/auth/profile/`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });
        if (res.status === 401) { router.push('/login'); return; }
        if (!res.ok) throw new Error('Failed to load profile');
        const data = await res.json();
        if (data.user_type !== 'admin') { router.push('/unauthorized'); return; }
        setUser(data);
      } catch (e) {
        console.error('Admin auth error:', e);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [theme]);

  const navLink = (href, label) => (
    <Link
      href={href}
      className={`${pathname === href ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-gray-900'} px-3 py-2 text-sm`}
    >
      {label}
    </Link>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-bold text-indigo-600">EliteHands</span>
            {navLink('/', 'Home')}
            {navLink('/services', 'Services')}
            {navLink('/dashboard/admin', 'Dashboard')}
            {navLink('/dashboard/admin/analytics', 'Analytics')}
            {navLink('/dashboard/admin/users', 'Users')}
            {navLink('/dashboard/admin/services', 'Services')}
            {navLink('/dashboard/admin/bookings', 'Bookings')}
            {navLink('/dashboard/admin/reviews', 'Reviews')}
            {navLink('/dashboard/admin/leave-requests', 'Leave Requests')}
          </div>
          <div className="flex items-center space-x-4">
            {/* Day/Night toggle */}
            <button
              onClick={() => {
                const next = theme === 'light' ? 'dark' : 'light';
                setTheme(next);
                try { localStorage.setItem('theme', next); } catch {}
              }}
              aria-label="Toggle Theme"
              className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200"
              title="Day/Night"
            >
              {theme === 'light' ? '☀️' : '🌙'}
            </button>

            {/* Profile */}
            <div className="text-sm text-gray-700 dark:text-gray-200">{user?.first_name || 'Admin'}</div>

            {/* Logout */}
            <button
              onClick={() => {
                try { localStorage.removeItem('accessToken'); } catch {}
                try { localStorage.removeItem('user'); } catch {}
                document.cookie = 'isAuthenticated=; Max-Age=0; Path=/';
                router.push('/login');
              }}
              className="px-3 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
