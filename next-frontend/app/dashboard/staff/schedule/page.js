'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function StaffSchedulePage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [currentDate]);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/bookings/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) throw new Error('Failed to load schedule');
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data.results || []);

      // Filter by selected date (YYYY-MM-DD)
      const dateStr = currentDate.toISOString().split('T')[0];
      const filtered = list.filter(b => b.scheduled_date === dateStr).map(b => ({
        id: b.id,
        booking_id: b.booking_id,
        customer_name: b.customer_name,
        service_name: b.service_name,
        scheduled_time: (b.scheduled_time || '').slice(0,5),
        address: b.address,
        status: b.status,
        // duration_hours not in serializer; omit
      }));
      setBookings(filtered);
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 18; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Schedule</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Date Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate(-1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {formatDate(currentDate)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''} scheduled
              </p>
            </div>
            
            <button
              onClick={() => navigateDate(1)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Schedule</h3>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {timeSlots.map((slot) => {
              const slotBookings = bookings.filter(booking => {
                const bookingHour = parseInt((booking.scheduled_time || '00:00').split(':')[0]);
                return bookingHour === slot.hour;
              });

              return (
                <div key={slot.time} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center">
                    <div className="w-20 flex-shrink-0">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {slot.time}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 ml-4">
                      {slotBookings.length > 0 ? (
                        <div className="space-y-2">
                          {slotBookings.map((booking) => (
                            <div key={booking.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3">
                                    <div>
                                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {booking.booking_id}
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {booking.service_name || '-'}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <User className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {booking.customer_name || '-'}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-gray-400" />
                                      <span className="text-sm text-gray-600 dark:text-gray-300">
                                        {booking.address}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                    {booking.status.replace('_', ' ')}
                                  </span>
                                  <Link
                                    href={`/dashboard/staff/bookings/${booking.id}`}
                                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium"
                                  >
                                    View Details
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <span className="text-sm text-gray-500 dark:text-gray-400">No bookings scheduled</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/dashboard/staff/bookings"
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            View All Bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
