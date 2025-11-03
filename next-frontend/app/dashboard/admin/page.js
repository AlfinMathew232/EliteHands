'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Phone } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState({ totalUsers: 0, totalBookings: 0, totalRevenue: 0, activeServices: 0, reviewsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = (typeof window !== 'undefined') ? (localStorage.getItem('accessToken') || localStorage.getItem('token')) : null;

        // Profile
        const profRes = await fetch(`${apiBase}/api/auth/profile/`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: 'include',
        });
        if (profRes.status === 401) { router.push('/login'); return; }
        if (!profRes.ok) throw new Error('Failed to load profile');
        const prof = await profRes.json();
        if (prof.user_type !== 'admin') { router.push('/unauthorized'); return; }
        setUser(prof);

        // Analytics
        const anaRes = await fetch(`${apiBase}/api/admin/analytics/?time_range=30d`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        });
        if (anaRes.ok) {
          const data = await anaRes.json();
          // activeServices not directly provided; derive from services endpoint
          setAnalytics((prev) => ({ ...prev, ...data }));
        }

        // Services (to compute active count)
        const svcRes = await fetch(`${apiBase}/api/services/`);
        if (svcRes.ok) {
          const services = await svcRes.json();
          const activeCount = Array.isArray(services) ? services.filter(s => s.is_active).length : 0;
          setAnalytics((prev) => ({ ...prev, activeServices: activeCount }));
        }
      } catch (e) {
        console.error('Admin dashboard load error:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Stats and Reviews */}
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome, {user?.first_name}!</h2>
              <p className="text-gray-600 mb-4">This is your admin dashboard. Use the navigation above to manage the application.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-700">Total Users</h3>
                  <p className="text-2xl font-bold text-indigo-600">{analytics.totalUsers?.toLocaleString?.() || analytics.totalUsers}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-700">Total Bookings</h3>
                  <p className="text-2xl font-bold text-indigo-600">{analytics.totalBookings?.toLocaleString?.() || analytics.totalBookings}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-700">Active Services</h3>
                  <p className="text-2xl font-bold text-indigo-600">{analytics.activeServices}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-gray-700">Revenue</h3>
                  <p className="text-2xl font-bold text-indigo-600">${(analytics.totalRevenue || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-6">
                <Link href="/dashboard/admin/reviews" className="block w-full bg-indigo-50 hover:bg-indigo-100 p-4 rounded-lg border border-indigo-200 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-indigo-700">Customer Reviews</h3>
                      <p className="text-sm text-indigo-600">Manage testimonials and feedback</p>
                    </div>
                    {/* <div className="bg-white p-2 rounded-full shadow-sm">
                      <span className="text-xl font-bold text-indigo-600">{analytics.reviewsCount || 0}</span>
                    </div> */}
                  </div>
                </Link>
              </div>
            </div>

            {/* Right: Location */}
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Business Location</h2>
              <div className="h-64 w-full relative">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2647.2893726022053!2d-123.37440642328143!3d48.43798997134452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548f7383a38aef6f%3A0x552078eb3ddbbd5a!2s157%20Gorge%20Rd%20E%20%23402%2C%20Victoria%2C%20BC%20V9A%206Y2%2C%20Canada!5e0!3m2!1sen!2sus!4v1715481600000!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="EliteHands Business Location"
                  className="rounded-lg shadow-md"
                ></iframe>
              </div>
              <div className="mt-4">
                <p className="text-gray-700 flex items-center">
                  <MapPin className="h-5 w-5 text-indigo-600 mr-2" />
                  157 Gorge Rd E #402, Victoria, BC V9A 6Y2, Canada
                </p>
                <p className="text-gray-700 flex items-center mt-2">
                  <Phone className="h-5 w-5 text-indigo-600 mr-2" />
                  +1 (416) 555-0123
                </p>
              </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
