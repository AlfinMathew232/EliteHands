'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function RescheduleBooking({ params }) {
  const { id } = params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch booking details from the API
    // For now, we'll simulate booking data
    setTimeout(() => {
      setBooking({
        id,
        service: 'Deep House Cleaning',
        date: '2023-12-15',
        time: '10:00 AM - 12:00 PM',
        address: '123 Main St, Anytown, USA',
        price: 120.00,
        status: 'confirmed'
      });
      
      // Simulate available dates (next 7 days)
      const dates = [];
      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        });
      }
      setAvailableDates(dates);
      
      setLoading(false);
    }, 1000);
  }, [id]);

  useEffect(() => {
    // When a date is selected, update available times
    if (selectedDate) {
      // In a real app, you would fetch available times for the selected date from the API
      // For now, we'll simulate available times
      const times = [
        { value: '09:00 AM - 11:00 AM', label: '9:00 AM - 11:00 AM' },
        { value: '11:00 AM - 01:00 PM', label: '11:00 AM - 1:00 PM' },
        { value: '01:00 PM - 03:00 PM', label: '1:00 PM - 3:00 PM' },
        { value: '03:00 PM - 05:00 PM', label: '3:00 PM - 5:00 PM' },
      ];
      setAvailableTimes(times);
    } else {
      setAvailableTimes([]);
    }
  }, [selectedDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedDate || !selectedTime) {
      alert('Please select both date and time');
      return;
    }
    
    setIsSubmitting(true);
    
    // In a real app, you would send the reschedule request to the API
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
        >
          <div className="bg-primary-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <Link href="/my-bookings" className="text-white hover:text-primary-100 transition-colors">
                {React.createElement(ArrowLeft, { className: "h-6 w-6" })}
              </Link>
              <h1 className="text-2xl font-bold">Booking Rescheduled</h1>
              <div className="w-6"></div> {/* Empty div for flex alignment */}
            </div>
          </div>

          <div className="p-6 md:p-8 text-center">
            <motion.div variants={itemVariants} className="flex items-center justify-center mb-8">
              <div className="bg-green-100 dark:bg-green-900 rounded-full p-4">
                {React.createElement(Check, { className: "h-12 w-12 text-green-600 dark:text-green-400" })}
              </div>
            </motion.div>

            <motion.h2 variants={itemVariants} className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Success!
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300 mb-6">
              Your booking has been successfully rescheduled to:
            </motion.p>

            <motion.div variants={itemVariants} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-8 inline-block">
              <div className="flex items-center space-x-2 text-lg font-medium text-gray-800 dark:text-white">
                <span>{React.createElement(Calendar, { className: "h-5 w-5 text-primary-600" })}</span>
                <span>{selectedDate && new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center space-x-2 text-lg font-medium text-gray-800 dark:text-white mt-2">
                <span>{React.createElement(Clock, { className: "h-5 w-5 text-primary-600" })}</span>
                <span>{selectedTime}</span>
              </div>
            </motion.div>

            <motion.p variants={itemVariants} className="text-gray-600 dark:text-gray-300 mb-8">
              We've sent a confirmation email with all the details.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
              <Link href="/my-bookings" className="btn btn-primary">
                View My Bookings
              </Link>
              <Link href="/" className="btn btn-outline">
                Return Home
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="bg-primary-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <Link href="/my-bookings" className="text-white hover:text-primary-100 transition-colors">
              {React.createElement(ArrowLeft, { className: "h-6 w-6" })}
            </Link>
            <h1 className="text-2xl font-bold">Reschedule Booking</h1>
            <div className="w-6"></div> {/* Empty div for flex alignment */}
          </div>
        </div>

        <div className="p-6 md:p-8">
          <motion.div variants={itemVariants} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Current Booking</h2>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2">{booking.service}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span>{React.createElement(Calendar, { className: "h-5 w-5 text-primary-600 mr-2" })}</span>
                  <span className="text-gray-600 dark:text-gray-300">{booking.date}</span>
                </div>
                
                <div className="flex items-center">
                  <span>{React.createElement(Clock, { className: "h-5 w-5 text-primary-600 mr-2" })}</span>
                  <span className="text-gray-600 dark:text-gray-300">{booking.time}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form variants={itemVariants} onSubmit={handleSubmit}>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Select New Date & Time</h2>
            
            <div className="space-y-6">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Date
                </label>
                <select
                  id="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                >
                  <option value="">Select a date</option>
                  {availableDates.map((date) => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Time
                </label>
                <select
                  id="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select a time</option>
                  {availableTimes.map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
                </select>
                {!selectedDate && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Please select a date first
                  </p>
                )}
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                disabled={!selectedDate || !selectedTime || isSubmitting}
                className="btn btn-primary flex-1 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                ) : null}
                Confirm Reschedule
              </button>
              
              <Link href="/my-bookings" className="btn btn-outline flex-1 text-center">
                Cancel
              </Link>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </div>
  );
}