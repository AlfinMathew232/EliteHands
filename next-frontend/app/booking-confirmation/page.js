'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
export default function BookingConfirmation() {
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get booking data from localStorage (set by booking page)
    const lastBooking = localStorage.getItem('lastBooking');
    if (lastBooking) {
      try {
        const bookingData = JSON.parse(lastBooking);
        // Normalize backend response to UI shape
        const normalized = {
          id: bookingData.booking_id || bookingData.id,
          service: bookingData.service_name || bookingData.service || 'Service',
          date: bookingData.scheduled_date || bookingData.date,
          time: bookingData.scheduled_time || bookingData.time,
          address: bookingData.address,
          price: Number(bookingData.total_amount ?? bookingData.price ?? 0),
          status: bookingData.status || 'confirmed',
        };
        setBooking(normalized);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing booking data:', error);
        setError('Failed to load booking details');
        setLoading(false);
      }
    } else {
      // Fallback to mock data if no booking found
      setBooking({
        id: 'BK-12345',
        service: 'Deep House Cleaning',
        date: '2023-12-15',
        time: '10:00 AM - 12:00 PM',
        address: '123 Main St, Anytown, USA',
        price: 120.0,
        status: 'confirmed',
      });
      setLoading(false);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Booking Error</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">{error}</p>
        <Link href="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
        <div className="bg-primary-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-white hover:text-primary-100 transition-colors">
              {React.createElement(ArrowLeft, { className: 'h-6 w-6' })}
            </Link>
            <h1 className="text-2xl font-bold">Booking Confirmation</h1>
            <div className="w-6"></div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <motion.div variants={itemVariants} className="flex items-center justify-center mb-8">
            <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
              {React.createElement(CheckCircle, { className: 'h-12 w-12 text-green-600 dark:text-green-400' })}
            </div>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
            Booking Confirmed!
          </motion.h2>
          <motion.p variants={itemVariants} className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Your booking has been confirmed. We've sent a confirmation email with all the details.
          </motion.p>

          <motion.div variants={itemVariants} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Booking Details</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">{React.createElement(Calendar, { className: 'h-5 w-5 text-primary-600 dark:text-primary-400' })}</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Date</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{booking.date}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">{React.createElement(Clock, { className: 'h-5 w-5 text-primary-600 dark:text-primary-400' })}</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Time</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{booking.time}</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">{React.createElement(MapPin, { className: 'h-5 w-5 text-primary-600 dark:text-primary-400' })}</div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">Address</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{booking.address}</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Service Information</h3>
            <div className="flex items-center">
              <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                <span className="text-2xl text-primary-600 dark:text-primary-400">🧹</span>
              </div>
              <div className="ml-4">
                <p className="font-medium text-gray-800 dark:text-white">{booking.service}</p>
                <p className="text-gray-600 dark:text-gray-300">${(typeof booking.price === 'number' ? booking.price : Number(booking.price || 0)).toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/my-bookings" className="btn btn-primary w-full text-center">View My Bookings</Link>
            <Link href="/" className="btn btn-outline w-full text-center">Return Home</Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}