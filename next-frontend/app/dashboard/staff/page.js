'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  MapPin,
  Phone,
  Mail,
  Star,
  Package,
  DollarSign
} from 'lucide-react';

export default function StaffDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    completedBookings: 0,
    pendingBookings: 0,
    averageRating: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    try {
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const userData = await response.json();
      if (userData.user_type !== 'staff') {
        router.push('/unauthorized');
        return;
      }

      setUser(userData);
    } catch (error) {
      console.error('Authentication error:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/bookings/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load bookings');
      }
      const data = await response.json();
      const bookings = Array.isArray(data) ? data : (data.results || []);

      // Compute stats client-side
      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => b.status === 'completed').length;
      const pendingBookings = bookings.filter(b => b.status === 'pending').length;
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayBookings = bookings.filter(b => b.scheduled_date === todayStr).length;
      setStats({
        totalBookings,
        todayBookings,
        completedBookings,
        pendingBookings,
        averageRating: 0,
      });

      // Map to recent bookings table format (latest 5 by created_at if available)
      const sorted = [...bookings].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      const recent = sorted.slice(0, 5).map(b => ({
        id: b.id,
        customer: b.customer_name || (b.customer && (b.customer.first_name + ' ' + b.customer.last_name)) || '-',
        service: b.service_name || (b.service && b.service.name) || '-',
        date: b.scheduled_date,
        time: (b.scheduled_time || '').slice(0,5),
        status: b.status,
        address: b.address,
        amount: Number(b.total_amount || 0),
      }));
      setRecentBookings(recent);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(s => ({ ...s }));
      setRecentBookings([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header (no logout here; global navbar handles it) */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Staff Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Welcome, {user?.first_name} {user?.last_name}</p>
        </div>
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pendingBookings}</p>
              </div>
            </div>
          </div>

          {/* Earnings removed per requirements */}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <Link href="/dashboard/staff/assignments" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">My Assignments</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">See tasks assigned to you</p>
              </div>
            </div>
          </Link>

          <Link href="/dashboard/staff/leave" className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Leave</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Create and track leave requests</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {booking.customer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {booking.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {booking.date} at {booking.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {booking.address}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      ${booking.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/staff/bookings/${booking.id}`}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}