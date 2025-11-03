'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Truck, Shield, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

// Sample data - replace with API call in production
const movingServices = [
  { 
    id: 1, 
    name: 'Residential Moving', 
    price: 299.99, 
    duration: 4, 
    popular: true,
    description: 'Stress-free moving services for homes and apartments',
    includes: [
      'Packing and unpacking',
      'Furniture disassembly/reassembly',
      'Loading and unloading',
      'Transportation',
      'Basic insurance coverage'
    ]
  },
  { 
    id: 2, 
    name: 'Commercial Moving', 
    price: 499.99, 
    duration: 6, 
    popular: false,
    description: 'Efficient office and business relocation services',
    includes: [
      'After-hours moving available',
      'IT equipment handling',
      'Furniture installation',
      'Secure document handling',
      'Minimal business disruption'
    ]
  },
  { 
    id: 3, 
    name: 'Long Distance Moving', 
    price: 800, 
    duration: 24, 
    popular: true,
    description: 'Reliable long-distance relocation services',
    includes: [
      'Cross-country moving',
      'Vehicle transportation',
      'Temporary storage solutions',
      'Packing materials provided',
      'Real-time tracking'
    ]
  },
  { 
    id: 4, 
    name: 'Storage Solutions', 
    price: 150, 
    duration: 4, 
    popular: false,
    description: 'Secure and accessible storage options',
    includes: [
      'Climate-controlled units',
      '24/7 security monitoring',
      'Short and long-term options',
      'Easy access to stored items',
      'Inventory management'
    ]
  },
  { 
    id: 5, 
    name: 'Specialty Item Moving', 
    price: 400, 
    duration: 6, 
    popular: false,
    description: 'Expert handling of valuable and fragile items',
    includes: [
      'Piano moving',
      'Artwork transportation',
      'Antique handling',
      'Special packaging',
      'White glove service'
    ]
  },
];

export default function MovingServicesPage() {
  const router = useRouter();
  const [expandedService, setExpandedService] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Force a re-render when returning to this tab/page to avoid occasional blank UI
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Reset any expanded state and trigger re-render
        setExpandedService(null);
        setRefreshTick(t => t + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const handleBookNow = (serviceName) => {
    if (!isClient) return;
    
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem('token');
    
    if (isAuthenticated) {
      router.push(`/booking?service=${encodeURIComponent(serviceName)}`);
    } else {
      toast.error('Please login to book a service');
      router.push(`/login?redirect=/booking?service=${encodeURIComponent(serviceName)}`);
    }
  };

  const toggleServiceDetails = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error Loading Services</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div key={refreshTick} className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
            Moving Services
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500 dark:text-gray-400">
            Professional and reliable moving services for all your relocation needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {movingServices.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {service.name}
                  </h3>
                  {service.popular && (
                    <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                      Popular
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {service.description}
                </p>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">{service.duration} hours</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm font-medium text-primary-600">
                    ${service.price.toFixed(2)}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => handleBookNow(service.name)}
                      className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400"
                    >
                      Book Now
                    </button>
                    <button
                      onClick={() => toggleServiceDetails(service.id)}
                      className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                    >
                      {expandedService === service.id ? 'Less' : 'More'} details
                      <ArrowRight 
                        className={`ml-1 h-4 w-4 transition-transform ${expandedService === service.id ? 'rotate-90' : ''}`} 
                      />
                    </button>
                  </div>

                  {expandedService === service.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                    >
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Service Includes:</h4>
                      <ul className="space-y-2">
                        {service.includes.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
