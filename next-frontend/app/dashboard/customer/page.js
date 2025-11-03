'use client';
import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, Clock4, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { redirectToLogin } from '../../../lib/auth';

export default function CustomerDashboard() {
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [reviewOpenId, setReviewOpenId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewsByBooking, setReviewsByBooking] = useState({}); // bookingId -> { rating, comment }
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Prefer JWT if available; fallback to session cookies
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/bookings/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });

        if (response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          redirectToLogin(router, '/dashboard/customer');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        const now = new Date();
        
        // Filter bookings
        const upcoming = data.filter(booking => new Date(booking.scheduled_date) >= now);
        const past = data.filter(booking => new Date(booking.scheduled_date) < now);
        
        // Update state once with filtered data
        setUpcomingBookings(upcoming);
        setPastBookings(past);
        // Seed existing reviews if present on booking payload
        const initial = {};
        [...upcoming, ...past].forEach((b) => {
          const r = b.review || b.latest_review;
          if (r && typeof r === 'object') {
            initial[b.id] = { id: r.id, rating: Number(r.rating) || 0, comment: r.comment || '' };
          }
        });
        setReviewsByBooking(initial);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        toast.error('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const submitReview = async (booking) => {
    try {
      if (booking.status?.toLowerCase() !== 'completed') {
        toast.error('You can only review completed bookings.');
        return;
      }
      if (!reviewRating || reviewRating < 1 || reviewRating > 5) {
        toast.error('Rating must be between 1 and 5');
        return;
      }
      const csrfResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/csrf/`, {
        credentials: 'include',
      });
      if (!csrfResp.ok) {
        toast.error('Failed to get CSRF token');
        return;
      }
      const { csrfToken } = await csrfResp.json();

      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const existing = reviewsByBooking[booking.id];
      const isEdit = !!(existing && existing.id);
      const urlBase = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}`;
      const endpoint = isEdit ? `${urlBase}/api/reviews/${existing.id}/` : `${urlBase}/api/reviews/`;
      const resp = await fetch(endpoint, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          ...(isEdit ? {} : { booking: Number(booking.id) }),
          rating: Number(reviewRating),
          comment: reviewComment
        }),
      });
      if (!resp.ok) {
        let message = 'Failed to submit review';
        try {
          const data = await resp.json();
          if (typeof data === 'object' && data) {
            if (data.detail) message = data.detail;
            else if (data.non_field_errors?.length) message = data.non_field_errors[0];
            else {
              const firstKey = Object.keys(data)[0];
              const val = data[firstKey];
              if (Array.isArray(val)) message = val[0]; else if (typeof val === 'string') message = val;
            }
          }
        } catch {}
        toast.error(message);
        return;
      }
      // Parse returned review to capture its ID for future edits
      let saved;
      try {
        saved = await resp.json();
      } catch {
        saved = null;
      }
      const savedId = saved?.id || existing?.id; // ensure we store id after create
      toast.success(isEdit ? 'Review updated' : 'Review submitted');
      setReviewOpenId(null);
      setReviewRating(5);
      setReviewComment('');
      setReviewsByBooking((prev) => ({
        ...prev,
        [booking.id]: { id: savedId, rating: Number(reviewRating), comment: reviewComment },
      }));
    } catch (e) {
      toast.error('Error submitting review');
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Completed</span>;
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Confirmed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pending</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Cancelled</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 rounded-full">Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const renderBookings = (bookings) => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      );
    }

    if (bookings.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No {activeTab} bookings</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming bookings. Book a service now!"
              : "You don't have any past bookings."}
          </p>
          {activeTab === 'upcoming' && (
            <div className="mt-6">
              <Link
                href="/services"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Book a Service
              </Link>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{booking.service?.name || booking.service_name || 'Service'}</h3>
                {getStatusBadge(booking.status)}
              </div>
              {booking.service?.description && (
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{booking.service.description}</p>
              )}

              {reviewOpenId === booking.id && (
                <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rating</label>
                      <select
                        className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={reviewRating}
                        onChange={(e) => setReviewRating(parseInt(e.target.value, 10))}
                      >
                        {[5,4,3,2,1].map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Comment (optional)</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience"
                      />
                    </div>
                    <div className="self-end">
                      <button
                        type="button"
                        onClick={() => submitReview(booking)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Date & Time</p>
                    <p className="text-sm text-gray-900">
                      {formatDate(booking.scheduled_date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock4 className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Duration</p>
                    <p className="text-sm text-gray-900">
                      {booking.service?.duration_hours || 1} hours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className="text-sm text-gray-900 capitalize">
                      {booking.status || 'Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-5 w-5 mr-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-sm text-gray-900">
                      ${booking.total_amount ? parseFloat(booking.total_amount).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-1">
                <p className="text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-200">Service:</span>{' '}
                  <span className="text-gray-900 dark:text-gray-100">{booking.service?.name || booking.service_name || 'Service'}</span>
                </p>
                {booking.special_instructions && (
                  <p className="text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-200">Your Notes:</span>{' '}
                    <span className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{booking.special_instructions}</span>
                  </p>
                )}
              </div>

              {/* Review section and actions */}
              <div className="mt-5 flex flex-col gap-3">
                {booking.status?.toLowerCase() === 'completed' ? (
                  <>
                    {reviewsByBooking[booking.id] ? (
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 mr-2">Your Review:</span>
                        <span className="text-yellow-500">
                          {'★'.repeat(reviewsByBooking[booking.id]?.rating || 0)}
                          {'☆'.repeat(5 - (reviewsByBooking[booking.id]?.rating || 0))}
                        </span>
                        {reviewsByBooking[booking.id]?.comment && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{reviewsByBooking[booking.id].comment}</p>
                        )}
                        <div className="mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReviewOpenId(booking.id);
                              setReviewRating(reviewsByBooking[booking.id]?.rating || 5);
                              setReviewComment(reviewsByBooking[booking.id]?.comment || '');
                            }}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          >
                            Edit Review
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setReviewOpenId(reviewOpenId === booking.id ? null : booking.id);
                          if (reviewOpenId !== booking.id) { setReviewRating(5); setReviewComment(''); }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        {reviewOpenId === booking.id ? 'Close Review' : 'Write Review'}
                      </button>
                    )}
                  </>
                ) : (
                  <Link
                    href={`/my-bookings/${booking.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    View Details
                  </Link>
                )}
                
                {booking.status?.toLowerCase() === 'confirmed' && (
                  <Link
                    href={`/reschedule-booking/${booking.id}`}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Reschedule
                  </Link>
                )}
                
                {booking.status?.toLowerCase() === 'pending' && (
                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      // Refresh the bookings
      setUpcomingBookings(upcomingBookings.filter(booking => booking.id !== bookingId));
      toast.success('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Welcome back! Here's an overview of your bookings.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/booking"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
          >
            Book a New Service
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`${activeTab === 'upcoming' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Upcoming Bookings
              {upcomingBookings.length > 0 && (
                <span className="ml-2 bg-primary-100 text-primary-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {upcomingBookings.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('past')}
              className={`${activeTab === 'past' 
                ? 'border-primary-500 text-primary-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} 
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Past Bookings
              {pastBookings.length > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pastBookings.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'upcoming' ? renderBookings(upcomingBookings) : renderBookings(pastBookings)}
        </div>
      </div>
    </div>
  );
}
