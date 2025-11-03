'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MapPin,
  Phone,
  Mail,
  User,
  Filter,
  Search
} from 'lucide-react';

export default function StaffBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const user = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('user') || '{}') : {};
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${baseUrl}/api/bookings/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) throw new Error('Failed to load bookings');

      const data = await response.json();
      const list = Array.isArray(data) ? data : (data.results || []);

      // Map to UI-friendly shape expected below
      const mapped = list.map(b => ({
        id: b.id,
        booking_id: b.booking_id,
        customer_name: b.customer_name,
        service_name: b.service_name,
        status: b.status,
        scheduled_date: b.scheduled_date,
        scheduled_time: (b.scheduled_time || '').slice(0,5),
        address: b.address,
        total_amount: Number(b.total_amount || 0),
        special_instructions: b.special_instructions || '',
      }));

      // Attach assignment info and compute isAssigned for current user
      const myIds = [user?.id, user?.staff?.id, user?.profile?.id].filter(Boolean);
      const withAssigned = await Promise.all(mapped.map(async (b) => {
        try {
          const asgRes = await fetch(`${baseUrl}/api/bookings/${b.id}/assignments/`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          }).catch(() => ({ ok: true, status: 404, json: async () => [] }));
          const assignments = asgRes.status === 404 ? [] : (await asgRes.json());
          const asgList = Array.isArray(assignments) ? assignments : (assignments.results || []);
          const isAssigned = asgList.some(a => myIds.includes(a?.staff?.id || a?.staff));
          return { ...b, isAssigned };
        } catch {
          return { ...b, isAssigned: false };
        }
      }));

      setBookings(withAssigned);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const user = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('user') || '{}') : {};
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Authorization guard: only assigned staff or admin can change status
      try {
        const asgRes = await fetch(`${baseUrl}/api/bookings/${bookingId}/assignments/`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
        }).catch(() => ({ ok: true, status: 404, json: async () => [] }));
        const assignments = asgRes.status === 404 ? [] : (await asgRes.json());
        const asgList = Array.isArray(assignments) ? assignments : (assignments.results || []);
        const myIds = [user?.id, user?.staff?.id, user?.profile?.id].filter(Boolean);
        const isAssigned = asgList.some(a => myIds.includes(a?.staff?.id || a?.staff));
        const isAdmin = (user?.user_type === 'admin');
        if (!isAssigned && !isAdmin) {
          alert('You are not assigned to this booking. Only assigned staff or admin can change status.');
          return;
        }
      } catch {
        // If assignments could not be verified, fall back to allowing admin-only
        const isAdmin = (user?.user_type === 'admin');
        if (!isAdmin) {
          alert('Unable to verify assignment. Only assigned staff or admin can change status.');
          return;
        }
      }

      // Update via BookingDetailView
      const response = await fetch(`${baseUrl}/api/bookings/${bookingId}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setBookings(bookings.map(booking => 
          booking.id === bookingId ? { ...booking, status: newStatus } : booking
        ));
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
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

  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch = searchTerm === '' || 
      (booking.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.service_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/staff" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Assigned Bookings</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {booking.booking_id}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {booking.service_name || '-'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer Details</h4>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {booking.customer_name || '-'}
                          </span>
                        </div>
                        {/* Email/phone are not included in BookingSerializer; omit for now */}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service Details</h4>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(booking.scheduled_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {booking.scheduled_time}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {booking.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {booking.special_instructions && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Instructions</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{booking.special_instructions}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${booking.total_amount}
                    </div>
                    <div className="flex space-x-2">
                      {booking.isAssigned && booking.status === 'pending' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'in_progress')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Start Service
                        </button>
                      )}
                      {booking.isAssigned && booking.status === 'in_progress' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Mark Complete
                        </button>
                      )}
                      <Link
                        href={`/dashboard/staff/bookings/${booking.id}`}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No bookings found</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'You don\'t have any bookings assigned yet.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
