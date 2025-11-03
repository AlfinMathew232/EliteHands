'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Edit, Trash2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First try session profile
        const profileResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        let authed = false;
        if (profileResp.ok) {
          const userData = await profileResp.json();
          setUser(userData);
          authed = true;
        } else {
          // Fallback to JWT if available
          const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
          if (!token) {
            setAuthError('Please log in to view your bookings.');
          } else {
            const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
            });
            if (resp.ok) {
              const userData = await resp.json();
              setUser(userData);
              authed = true;
            } else {
              setAuthError('Authentication failed');
            }
          }
        }

        // Fetch user's bookings if authenticated
        if (authed) {
          const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
          const bookingsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/bookings/`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            },
          });

          if (bookingsResponse.ok) {
            const bookingsData = await bookingsResponse.json();
            // Normalize backend bookings to UI shape
            const normalized = (Array.isArray(bookingsData) ? bookingsData : (bookingsData?.results || [])).map(b => {
              const id = b.booking_id || b.id;
              const service = b.service_name || (typeof b.service === 'object' ? b.service?.name : b.service) || 'Service';
              const date = b.scheduled_date;
              const time = b.scheduled_time;
              const address = b.address;
              const price = Number(b.total_amount || 0);
              const status = b.status;
              // Determine if past by comparing scheduled datetime to now; if completed, force past
              let eventDT = null;
              if (date && time) {
                // Attempt to construct ISO-like string; fallback to Date(date)
                const iso = `${date}T${String(time).slice(0,8)}`; // ensure HH:MM:SS
                const d = new Date(iso);
                eventDT = isNaN(d) ? new Date(date) : d;
              } else if (date) {
                eventDT = new Date(date);
              }
              const now = new Date();
              const isPast = (String(status).toLowerCase() === 'completed') || (eventDT instanceof Date && !isNaN(eventDT) && eventDT < now);

              return {
                id,
                service,
                date,
                time,
                address,
                price,
                status,
                isPast,
              };
            });
            setBookings(normalized);
          } else {
            // If API is not available, use sample data
            setBookings([
              {
                id: 'BK-12345',
                service: 'Deep House Cleaning',
                date: '2023-12-15',
                time: '10:00 AM - 12:00 PM',
                address: '123 Main St, Anytown, USA',
                price: 120.00,
                status: 'confirmed',
                isPast: false
              },
              {
                id: 'BK-12346',
                service: 'Office Cleaning',
                date: '2023-12-20',
                time: '09:00 AM - 11:00 AM',
                address: '456 Business Ave, Anytown, USA',
                price: 150.00,
                status: 'confirmed',
                isPast: false
              },
              {
                id: 'BK-12340',
                service: 'Window Cleaning',
                date: '2023-11-10',
                time: '02:00 PM - 04:00 PM',
                address: '123 Main St, Anytown, USA',
                price: 80.00,
                status: 'completed',
                isPast: true
              },
            ]);
          }
        } else {
          // Not authenticated: navigate to login with return URL
          router.push('/login?redirect=/my-bookings');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setAuthError('Authentication error');
        router.push('/login?redirect=/my-bookings');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const statusMap = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    },
    confirmed: {
      label: 'Confirmed',
      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    },
    in_progress: {
      label: 'In Progress',
      className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    },
  };

  const getStatusMeta = (status) => statusMap[status] || statusMap['pending'];

  const filteredBookings = bookings.filter(booking => 
    activeTab === 'upcoming' ? !booking.isPast : booking.isPast
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertCircle size={48} />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-4">Authentication Error</h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{authError}</p>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-4xl mx-auto"
      >
        <motion.h1 variants={itemVariants} className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          My Bookings
        </motion.h1>

        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'upcoming' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'past' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
              Past
            </button>
          </div>

          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex justify-center mb-4">
                  {React.createElement(AlertCircle, { className: "h-12 w-12 text-gray-400" })}
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No {activeTab} bookings
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {activeTab === 'upcoming' ? "You don't have any upcoming bookings." : "You don't have any past bookings."}
                </p>
                {activeTab === 'upcoming' && (
                  <Link href="/services" className="btn btn-primary">
                    Book a Service
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => (
                  <motion.div 
                    key={booking.id}
                    variants={itemVariants}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="bg-gray-50 dark:bg-gray-750 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Booking ID:</span>
                        <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">{booking.id}</span>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusMeta(booking.status).className}`}>
                          {getStatusMeta(booking.status).label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        {booking.service}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {React.createElement(Calendar, { className: "h-5 w-5 text-primary-600 dark:text-primary-400" })}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                            <p className="text-sm text-gray-900 dark:text-white">{booking.date}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="flex-shrink-0 mt-1">
                            {React.createElement(Clock, { className: "h-5 w-5 text-primary-600 dark:text-primary-400" })}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</p>
                            <p className="text-sm text-gray-900 dark:text-white">{booking.time}</p>
                          </div>
                        </div>

                        <div className="flex items-start md:col-span-2">
                          <div className="flex-shrink-0 mt-1">
                            {React.createElement(MapPin, { className: "h-5 w-5 text-primary-600 dark:text-primary-400" })}
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                            <p className="text-sm text-gray-900 dark:text-white">{booking.address}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div>
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Price:</span>
                          <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">${booking.price.toFixed(2)}</span>
                        </div>
                        
                        {!booking.isPast && (
                          <div className="flex space-x-2">
                            <Link 
                              href={`/reschedule-booking/${booking.id}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            >
                              {React.createElement(Edit, { className: "h-4 w-4 mr-1" })}
                              Reschedule
                            </Link>
                            <button 
                              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              {React.createElement(Trash2, { className: "h-4 w-4 mr-1" })}
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="text-center">
          <Link href="/" className="btn btn-outline">
            Return Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}