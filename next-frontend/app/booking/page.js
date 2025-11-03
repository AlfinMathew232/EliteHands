'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, Clock, MapPin, DollarSign, CheckCircle, Info, ArrowLeft, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { verifyToken, redirectToLogin } from '../../lib/auth';

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get service type from URL if available
  const serviceTypeFromUrl = searchParams.get('service');
  const redirectUrl = searchParams.get('redirect');
  
  // Check authentication on component mount (optimistic: do not redirect here)
  useEffect(() => {
    const checkAuth = async () => {
      setIsClient(true);

      // Quick client-side signal
      let quickAuth = false;
      try {
        const hasToken = !!(localStorage.getItem('token') || localStorage.getItem('accessToken'));
        const cookieAuth = typeof document !== 'undefined' && document.cookie.includes('isAuthenticated=true');
        quickAuth = !!hasToken || !!cookieAuth;
      } catch {}

      if (quickAuth) {
        setIsLoggedIn(true);
        setIsLoading(false);
      }

      // Background verification (do not redirect here)
      try {
        const valid = await verifyToken();
        setIsLoggedIn(valid);
      } catch {
        // keep current state
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, serviceTypeFromUrl, redirectUrl]);
  
  const [formData, setFormData] = useState({
    serviceType: serviceTypeFromUrl || '',
    serviceDetails: '',
    date: '',
    time: '',
    address: '',
    city: '',
    postalCode: '',
    specialInstructions: '',
    // Moving-specific
    originAddress: '',
    destinationAddress: '',
    numberOfRooms: '',
    numberOfMovers: '',
    elevatorAvailable: 'no',
    // Cleaning-specific
    cleaningRooms: '',
    cleaningBathrooms: '',
    cleaningSquareFeet: '',
    numberOfCleaners: '',
    // Event-specific
    eventType: '',
    attendeeCount: '',
    venueAddress: '',
    eventStart: '',
    eventEnd: '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [headerRef, headerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [formRef, formInView] = useInView({ threshold: 0.1, triggerOnce: true });
  
  // State for services data
  const [serviceTypes, setServiceTypes] = useState([]);
  const [serviceDetailsData, setServiceDetailsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in and fetch services
  useEffect(() => {
    // Detect auth via cookie or either token
    try {
      const hasToken = !!(localStorage.getItem('token') || localStorage.getItem('accessToken'));
      const cookieAuth = typeof document !== 'undefined' && document.cookie.includes('isAuthenticated=true');
      setIsLoggedIn(!!hasToken || !!cookieAuth);
    } catch {
      setIsLoggedIn(false);
    }

    // Fetch service types and details
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/services/categories/`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Format service types for dropdown
          const formattedTypes = data.map(type => ({
            value: type.id,
            label: type.name
          }));
          
          setServiceTypes(formattedTypes);
          
          // Create service details object
          const detailsObj = {};
          data.forEach(type => {
            detailsObj[type.id] = type.services.map(service => ({
              value: service.id,
              label: service.name
            }));
          });
          
          setServiceDetailsData(detailsObj);

          // Preselect based on ?service=NAME if provided
          if (serviceTypeFromUrl) {
            // Find the category that contains this service name
            let foundCategoryId = null;
            let foundServiceId = null;
            for (const cat of data) {
              const svc = (cat.services || []).find(s => (s.name || '').toLowerCase() === serviceTypeFromUrl.toLowerCase());
              if (svc) {
                foundCategoryId = cat.id;
                foundServiceId = svc.id;
                break;
              }
            }
            if (foundCategoryId && foundServiceId) {
              setFormData(prev => ({ ...prev, serviceType: foundCategoryId, serviceDetails: foundServiceId }));
            }
          }
        } else {
          // If no data, set fallback data
          setServiceTypes([
            { value: 'moving', label: 'Moving Services' },
            { value: 'cleaning', label: 'Cleaning Services' },
            { value: 'event', label: 'Event Services' }
          ]);
          
          setServiceDetailsData({
            moving: [
              { value: 'residential', label: 'Residential Moving' },
              { value: 'commercial', label: 'Commercial Moving' },
              { value: 'long-distance', label: 'Long Distance Moving' },
              { value: 'storage', label: 'Storage Solutions' },
              { value: 'specialty', label: 'Specialty Item Moving' },
            ],
            cleaning: [
              { value: 'residential', label: 'Residential Cleaning' },
              { value: 'commercial', label: 'Commercial Cleaning' },
              { value: 'deep', label: 'Deep Cleaning' }
            ],
            event: [
              { value: 'corporate', label: 'Corporate Events' },
              { value: 'wedding', label: 'Wedding Services' },
              { value: 'private', label: 'Private Parties' }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Unable to load services. Please try again later.');
        
        // Set fallback data
        setServiceTypes([
          { value: 'moving', label: 'Moving Services' },
          { value: 'cleaning', label: 'Cleaning Services' },
          { value: 'event', label: 'Event Services' }
        ]);
        
        setServiceDetailsData({
          moving: [
            { value: 'residential', label: 'Residential Moving' },
            { value: 'commercial', label: 'Commercial Moving' },
            { value: 'long-distance', label: 'Long Distance Moving' },
            { value: 'storage', label: 'Storage Solutions' },
            { value: 'specialty', label: 'Specialty Item Moving' },
          ],
          cleaning: [
            { value: 'residential', label: 'Residential Cleaning' },
            { value: 'commercial', label: 'Commercial Cleaning' },
            { value: 'deep', label: 'Deep Cleaning' }
          ],
          event: [
            { value: 'corporate', label: 'Corporate Events' },
            { value: 'wedding', label: 'Wedding Services' },
            { value: 'private', label: 'Private Parties' }
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };
  
  // Service details are now fetched from API and stored in serviceDetailsData state
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Reset service details when service type changes
    if (name === 'serviceType') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        serviceDetails: ''
      }));
    } else if (name === 'eventStart') {
      // When eventStart changes, also populate generic date/time to keep backend payload consistent
      let newDate = '';
      let newTime = '';
      try {
        if (value) {
          // value format from datetime-local: YYYY-MM-DDTHH:MM
          const [d, t] = value.split('T');
          newDate = d || '';
          newTime = (t || '').slice(0,5); // HH:MM
        }
      } catch {}
      setFormData(prev => ({
        ...prev,
        [name]: value,
        date: newDate || prev.date,
        time: newTime || prev.time,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.serviceType) {
      newErrors.serviceType = 'Service type is required';
    }
    
    if (!formData.serviceDetails) {
      newErrors.serviceDetails = 'Service details are required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    
    if (!formData.address) {
      newErrors.address = 'Address is required';
    }

    // Category-specific validations
    const selectedType = serviceTypes.find(t => t.value === formData.serviceType) || {};
    const typeLabel = (selectedType.label || '').toLowerCase();
    if (typeLabel.includes('moving')) {
      if (!formData.originAddress) newErrors.originAddress = 'Origin address is required';
      if (!formData.destinationAddress) newErrors.destinationAddress = 'Destination address is required';
      if (!formData.numberOfRooms) newErrors.numberOfRooms = 'Number of rooms is required';
      if (!formData.numberOfMovers) newErrors.numberOfMovers = 'Number of movers is required';
    } else if (typeLabel.includes('cleaning')) {
      if (!formData.cleaningRooms) newErrors.cleaningRooms = 'Number of rooms is required';
      if (!formData.cleaningBathrooms) newErrors.cleaningBathrooms = 'Number of bathrooms is required';
      if (!formData.cleaningSquareFeet) newErrors.cleaningSquareFeet = 'Square footage is required';
      if (!formData.numberOfCleaners) newErrors.numberOfCleaners = 'Number of cleaners is required';
    } else if (typeLabel.includes('event')) {
      if (!formData.eventType) newErrors.eventType = 'Event type is required';
      if (!formData.attendeeCount) newErrors.attendeeCount = 'Attendee count is required';
      if (!formData.venueAddress) newErrors.venueAddress = 'Venue address is required';
      if (!formData.eventStart) newErrors.eventStart = 'Event start is required';
      if (!formData.eventEnd) newErrors.eventEnd = 'Event end is required';
      // Validate chronological order when both provided
      if (formData.eventStart && formData.eventEnd) {
        const start = new Date(formData.eventStart);
        const end = new Date(formData.eventEnd);
        if (end < start) {
          newErrors.eventEnd = 'Event end cannot be before start';
        }
      }
    }
    
    if (!formData.city) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.postalCode) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Please enter a valid Canadian postal code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      // Save booking data to localStorage for after login
      try { localStorage.setItem('pendingBooking', JSON.stringify(formData)); } catch {}
      toast.info('Please log in to complete your booking');
      const currentPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      // Ensure CSRF token is present (Django requires with session cookies)
      let csrfToken = null;
      try {
        const csrfResp = await fetch(`${apiBase}/api/auth/csrf/`, { credentials: 'include' });
        if (csrfResp.ok) {
          const c = await csrfResp.json();
          csrfToken = c?.csrfToken || null;
        }
      } catch {}
      const response = await fetch(`${apiBase}/api/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          service: formData.serviceDetails,
          scheduled_date: formData.date,
          scheduled_time: formData.time,
          special_instructions: formData.specialInstructions,
          address: formData.address,
          city: formData.city,
          province: 'BC', // Default to BC
          postal_code: formData.postalCode,
          extra_details: {
            // Moving
            origin_address: formData.originAddress || undefined,
            destination_address: formData.destinationAddress || undefined,
            number_of_rooms: formData.numberOfRooms || undefined,
            number_of_movers: formData.numberOfMovers || undefined,
            elevator_available: formData.elevatorAvailable || undefined,
            // Cleaning
            rooms: formData.cleaningRooms || undefined,
            bathrooms: formData.cleaningBathrooms || undefined,
            square_feet: formData.cleaningSquareFeet || undefined,
            number_of_cleaners: formData.numberOfCleaners || undefined,
            // Event
            event_type: formData.eventType || undefined,
            attendee_count: formData.attendeeCount || undefined,
            venue_address: formData.venueAddress || undefined,
            event_start: formData.eventStart || undefined,
            event_end: formData.eventEnd || undefined,
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
      
      const bookingData = await response.json();
      
      // Store booking data for confirmation page
      localStorage.setItem('lastBooking', JSON.stringify(bookingData));
      
      toast.success('Booking created successfully!');
      router.push('/booking-confirmation');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to book service. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  // Get today's date in YYYY-MM-DD format for min date attribute
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="min-h-screen pt-16">
      {/* Header Section */}
      <section ref={headerRef} className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6 gradient-text font-heading">
              Book Your Service
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Fill out the form below to schedule your service. Our team will confirm your booking and provide you with all the details you need.
            </motion.p>
          </motion.div>
        </div>
      </section>
      
      {/* Booking Form Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <motion.div
            ref={formRef}
            initial="hidden"
            animate={formInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8"
          >
            <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6 font-heading dark:text-white">
              Service Details
            </motion.h2>
            
            {Object.keys(errors).length > 0 && (
              <motion.div 
                variants={itemVariants}
                className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 rounded-md mb-6"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-400">Please fix the following errors:</p>
                    <ul className="list-disc pl-5 mt-1 text-sm text-red-700 dark:text-red-400">
                      {Object.values(errors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
            
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : error && serviceTypes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Info className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Services Available</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">We're currently updating our service offerings. Please check back soon!</p>
                <Link href="/contact" className="btn btn-primary">
                  Contact Us
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
              {/* Warning if services failed to load from API but fallback is being used */}
              {error && (
                <motion.div 
                  variants={itemVariants}
                  className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        We couldn't load live services. Showing fallback options.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Service Type */}
              <motion.div variants={itemVariants} className="mb-6">
                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Service Type*
                </label>
                <select
                  id="serviceType"
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border ${errors.serviceType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                >
                  <option value="">Select a service type</option>
                  {serviceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
                {errors.serviceType && <p className="mt-1 text-sm text-red-500">{errors.serviceType}</p>}
              </motion.div>
              
              {/* Service Details */}
              {formData.serviceType && (
                <motion.div variants={itemVariants} className="mb-6">
                  <label htmlFor="serviceDetails" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Service Details*
                  </label>
                  <select
                    id="serviceDetails"
                    name="serviceDetails"
                    value={formData.serviceDetails}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.serviceDetails ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                  >
                    <option value="">Select service details</option>
                    {serviceDetailsData[formData.serviceType]?.map(detail => (
                      <option key={detail.value} value={detail.value}>{detail.label}</option>
                    ))}
                  </select>
                  {errors.serviceDetails && <p className="mt-1 text-sm text-red-500">{errors.serviceDetails}</p>}
                </motion.div>
              )}

              {/* Category-specific extra fields */}
              {(() => {
                const selectedType = serviceTypes.find(t => t.value === formData.serviceType) || {};
                const typeLabel = (selectedType.label || '').toLowerCase();
                if (typeLabel.includes('moving')) {
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <motion.div variants={itemVariants}>
                          <label htmlFor="originAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Origin address*</label>
                          <input
                            type="text"
                            id="originAddress"
                            name="originAddress"
                            value={formData.originAddress}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.originAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                            placeholder="From address"
                          />
                          {errors.originAddress && <p className="mt-1 text-sm text-red-500">{errors.originAddress}</p>}
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label htmlFor="destinationAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Destination address*</label>
                          <input
                            type="text"
                            id="destinationAddress"
                            name="destinationAddress"
                            value={formData.destinationAddress}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.destinationAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                            placeholder="To address"
                          />
                          {errors.destinationAddress && <p className="mt-1 text-sm text-red-500">{errors.destinationAddress}</p>}
                        </motion.div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <motion.div variants={itemVariants}>
                          <label htmlFor="numberOfRooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of rooms*</label>
                          <input
                            type="number"
                            min="0"
                            id="numberOfRooms"
                            name="numberOfRooms"
                            value={formData.numberOfRooms}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.numberOfRooms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                            placeholder="e.g., 3"
                          />
                          {errors.numberOfRooms && <p className="mt-1 text-sm text-red-500">{errors.numberOfRooms}</p>}
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label htmlFor="numberOfMovers" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of movers*</label>
                          <input
                            type="number"
                            min="1"
                            id="numberOfMovers"
                            name="numberOfMovers"
                            value={formData.numberOfMovers}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.numberOfMovers ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                            placeholder="e.g., 2"
                          />
                          {errors.numberOfMovers && <p className="mt-1 text-sm text-red-500">{errors.numberOfMovers}</p>}
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label htmlFor="elevatorAvailable" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Elevator available</label>
                          <select
                            id="elevatorAvailable"
                            name="elevatorAvailable"
                            value={formData.elevatorAvailable}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </motion.div>
                      </div>
                    </>
                  );
                } else if (typeLabel.includes('cleaning')) {
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <motion.div variants={itemVariants}>
                          <label htmlFor="cleaningRooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rooms*</label>
                          <input
                            type="number"
                            min="0"
                            id="cleaningRooms"
                            name="cleaningRooms"
                            value={formData.cleaningRooms}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.cleaningRooms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                          />
                          {errors.cleaningRooms && <p className="mt-1 text-sm text-red-500">{errors.cleaningRooms}</p>}
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label htmlFor="cleaningBathrooms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bathrooms*</label>
                          <input
                            type="number"
                            min="0"
                            id="cleaningBathrooms"
                            name="cleaningBathrooms"
                            value={formData.cleaningBathrooms}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.cleaningBathrooms ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                          />
                          {errors.cleaningBathrooms && <p className="mt-1 text-sm text-red-500">{errors.cleaningBathrooms}</p>}
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label htmlFor="cleaningSquareFeet" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Square feet*</label>
                          <input
                            type="number"
                            min="0"
                            id="cleaningSquareFeet"
                            name="cleaningSquareFeet"
                            value={formData.cleaningSquareFeet}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.cleaningSquareFeet ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                            placeholder="e.g., 1200"
                          />
                          {errors.cleaningSquareFeet && <p className="mt-1 text-sm text-red-500">{errors.cleaningSquareFeet}</p>}
                        </motion.div>
                      </div>
                      <motion.div variants={itemVariants} className="mb-6">
                        <label htmlFor="numberOfCleaners" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of cleaners*</label>
                        <input
                          type="number"
                          min="1"
                          id="numberOfCleaners"
                          name="numberOfCleaners"
                          value={formData.numberOfCleaners}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.numberOfCleaners ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                          placeholder="e.g., 2"
                        />
                        {errors.numberOfCleaners && <p className="mt-1 text-sm text-red-500">{errors.numberOfCleaners}</p>}
                      </motion.div>
                    </>
                  );
                } else if (typeLabel.includes('event')) {
                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <motion.div variants={itemVariants}>
                          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event type*</label>
                          <input
                            type="text"
                            id="eventType"
                            name="eventType"
                            value={formData.eventType}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.eventType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                            placeholder="e.g., Wedding"
                          />
                          {errors.eventType && <p className="mt-1 text-sm text-red-500">{errors.eventType}</p>}
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label htmlFor="attendeeCount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Attendee count*</label>
                          <input
                            type="number"
                            min="1"
                            id="attendeeCount"
                            name="attendeeCount"
                            value={formData.attendeeCount}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.attendeeCount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                            placeholder="e.g., 150"
                          />
                          {errors.attendeeCount && <p className="mt-1 text-sm text-red-500">{errors.attendeeCount}</p>}
                        </motion.div>
                      </div>
                      <motion.div variants={itemVariants} className="mb-6">
                        <label htmlFor="venueAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Venue address*</label>
                        <input
                          type="text"
                          id="venueAddress"
                          name="venueAddress"
                          value={formData.venueAddress}
                          onChange={handleChange}
                          className={`w-full px-4 py-3 rounded-lg border ${errors.venueAddress ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                          placeholder="Venue location"
                        />
                        {errors.venueAddress && <p className="mt-1 text-sm text-red-500">{errors.venueAddress}</p>}
                      </motion.div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <motion.div variants={itemVariants}>
                          <label htmlFor="eventStart" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event start*</label>
                          <input
                            type="datetime-local"
                            id="eventStart"
                            name="eventStart"
                            value={formData.eventStart}
                            onChange={handleChange}
                            min={`${today}T00:00`}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.eventStart ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                          />
                          {errors.eventStart && <p className="mt-1 text-sm text-red-500">{errors.eventStart}</p>}
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <label htmlFor="eventEnd" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event end*</label>
                          <input
                            type="datetime-local"
                            id="eventEnd"
                            name="eventEnd"
                            value={formData.eventEnd}
                            onChange={handleChange}
                            min={formData.eventStart || undefined}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.eventEnd ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                          />
                          {errors.eventEnd && <p className="mt-1 text-sm text-red-500">{errors.eventEnd}</p>}
                        </motion.div>
                      </div>
                    </>
                  );
                }
                return null;
              })()}
              
              {/* Date and Time (hidden for Event; use eventStart instead) */}
              {(() => {
                const selectedType = serviceTypes.find(t => t.value === formData.serviceType) || {};
                const typeLabel = (selectedType.label || '').toLowerCase();
                if (typeLabel.includes('event')) {
                  return null;
                }
                return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div variants={itemVariants}>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      min={today}
                      value={formData.date}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                    />
                  </div>
                  {errors.date && <p className="mt-1 text-sm text-red-500">{errors.date}</p>}
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                    >
                      <option value="">Select a time</option>
                      <option value="08:00">8:00 AM</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                      <option value="17:00">5:00 PM</option>
                    </select>
                  </div>
                  {errors.time && <p className="mt-1 text-sm text-red-500">{errors.time}</p>}
                </motion.div>
              </div>
                );
              })()}
              
              {/* Address */}
              <motion.div variants={itemVariants} className="mb-6">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address*
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="123 Main St, Apt 4B"
                  />
                </div>
                {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
              </motion.div>
              
              {/* City and Postal Code */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <motion.div variants={itemVariants}>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    City*
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="Victoria"
                  />
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city}</p>}
                </motion.div>
                
                <motion.div variants={itemVariants}>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Postal Code*
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg border ${errors.postalCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="V8V 1Z8"
                  />
                  {errors.postalCode && <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>}
                </motion.div>
              </div>
              
              {/* Special Instructions */}
              <motion.div variants={itemVariants} className="mb-8">
                <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Any special requirements or additional information we should know..."
                ></textarea>
              </motion.div>
              
              {/* Login Notice */}
              {!isLoggedIn && (
                <motion.div variants={itemVariants} className="mb-8 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Info className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Login Required</h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                        <p>
                          You need to be logged in to book a service. Please{' '}
                          <Link href="/login?redirect=booking" className="font-medium underline hover:text-yellow-600 dark:hover:text-yellow-200">
                            log in
                          </Link>{' '}
                          or{' '}
                          <Link href="/register?redirect=booking" className="font-medium underline hover:text-yellow-600 dark:hover:text-yellow-200">
                            register
                          </Link>{' '}
                          to continue.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Submit Button */}
              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium py-3 px-6 rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Book Now <CheckCircle className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </button>
              </motion.div>
            </form>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Benefits Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-heading dark:text-white">Why Book With Us</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the EliteHands difference with our professional and reliable services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Professional Service</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our team of trained professionals ensures high-quality service every time.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Flexible Scheduling</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Book at your convenience with our flexible scheduling options.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-8 rounded-xl shadow-md">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6">
                <DollarSign className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white">Competitive Pricing</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get the best value for your money with our transparent and competitive pricing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}