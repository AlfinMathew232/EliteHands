'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function StaffBookingDetailPage() {
  const router = useRouter();
  const { id } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);
  const [canControl, setCanControl] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        setLoading(true);
        const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${baseUrl}/api/bookings/${id}/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (!res.ok) throw new Error('Failed to fetch booking');
        const data = await res.json();
        setBooking(data);

        // Fetch assignments to determine if current user can control status
        try {
          const user = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('user') || '{}') : {};
          const asgRes = await fetch(`${baseUrl}/api/bookings/${id}/assignments/`, {
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
          }).catch(() => ({ ok: true, status: 404, json: async () => [] }));
          const assignments = asgRes.status === 404 ? [] : (await asgRes.json());
          const asgList = Array.isArray(assignments) ? assignments : (assignments.results || []);
          const myIds = [user?.id, user?.staff?.id, user?.profile?.id].filter(Boolean);
          const isAssigned = asgList.some(a => myIds.includes(a?.staff?.id || a?.staff));
          const isAdmin = (user?.user_type === 'admin');
          setCanControl(Boolean(isAssigned || isAdmin));
        } catch {
          setCanControl(false);
        }
      } catch (e) {
        console.error('Error fetching booking:', e);
        setError('Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const updateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Authorization guard: only assigned staff or admin can change status
      try {
        const user = (typeof window !== 'undefined') ? JSON.parse(localStorage.getItem('user') || '{}') : {};
        const asgRes = await fetch(`${baseUrl}/api/bookings/${id}/assignments/`, {
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
          setUpdating(false);
          return;
        }
      } catch {
        setUpdating(false);
        alert('Unable to verify assignment. Only assigned staff or admin can change status.');
        return;
      }
      const res = await fetch(`${baseUrl}/api/bookings/${id}/`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json().catch(() => null);
      setBooking((prev) => ({ ...(prev || {}), status: newStatus, ...(updated || {}) }));
    } catch (e) {
      console.error('Error updating status:', e);
      setError('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleString();
    } catch {
      return String(d);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <div className="mt-4">
          <Link href="/dashboard/staff/bookings" className="text-primary-600 hover:underline">← Back to Bookings</Link>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">No booking found</h2>
        <p className="text-gray-600">The requested booking could not be found.</p>
        <div className="mt-4">
          <Link href="/dashboard/staff/bookings" className="text-primary-600 hover:underline">← Back to Bookings</Link>
        </div>
      </div>
    );
  }

  // Normalize fields to support different serializer shapes
  const bookingIdDisplay = booking.booking_id || booking.booking_number || `#${booking.id}`;
  const serviceName = booking.service_name || booking.service?.name || '-';
  const customerName = booking.customer_name || (booking.customer ? `${booking.customer.first_name || ''} ${booking.customer.last_name || ''}`.trim() : '-') || '-';
  const amount = (booking.total_amount ?? booking.total_price ?? 0);
  const notes = booking.notes || booking.special_instructions || '';
  const status = booking.status;

  const canStart = status === 'pending';
  const canComplete = status === 'in_progress';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/dashboard/staff/bookings" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 mr-4">
                ← Back to Bookings
              </Link>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Booking {bookingIdDisplay}</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Customer</h3>
              <p className="text-gray-900 dark:text-white">{customerName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Service</h3>
              <p className="text-gray-900 dark:text-white">{serviceName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time</h3>
              <p className="text-gray-900 dark:text-white">
                {formatDate(booking.scheduled_date || booking.booking_time)}
                {booking.scheduled_time ? ` at ${String(booking.scheduled_time).slice(0,5)}` : ''}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</h3>
              <p className="text-gray-900 dark:text-white">{booking.address || '-'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount</h3>
              <p className="text-gray-900 dark:text-white">${Number(amount).toFixed(2)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</h3>
              <p className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 capitalize">
                {String(status || '').replace('_', ' ')}
              </p>
            </div>
          </div>

          {notes && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
              <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          {canControl && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">Change status to:</span>
            <button
              onClick={() => updateStatus('in_progress')}
              disabled={updating || status === 'in_progress' || status === 'completed' || status === 'cancelled'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updating && status !== 'in_progress' ? 'Updating...' : 'In Progress'}
            </button>
            <button
              onClick={() => updateStatus('completed')}
              disabled={updating || status === 'completed' || status === 'cancelled'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {updating && status !== 'completed' ? 'Updating...' : 'Completed'}
            </button>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
