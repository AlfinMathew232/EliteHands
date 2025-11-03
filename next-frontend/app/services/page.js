'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ChevronDown, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]); // all ACTIVE services
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [expandedServices, setExpandedServices] = useState({});
  const [showRefresh, setShowRefresh] = useState(false);
  
  // Fetch categories and active services from backend
  useEffect(() => {
    const load = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const [catResp, svcResp] = await Promise.all([
          fetch(`${apiBase}/api/services/categories/`),
          fetch(`${apiBase}/api/services/`), // returns only is_active=True
        ]);
        if (!catResp.ok) throw new Error('Failed to load categories');
        if (!svcResp.ok) throw new Error('Failed to load services');
        const catRaw = await catResp.json();
        const svcRaw = await svcResp.json();
        const catList = Array.isArray(catRaw) ? catRaw : (catRaw?.results || []);
        const svcList = Array.isArray(svcRaw) ? svcRaw : (svcRaw?.results || []);
        setCategories(catList.map(c => ({ id: c.id, name: c.name, description: c.description || '' })));
        // normalize services
        setServices(svcList.map(s => ({
          id: s.id,
          name: s.name,
          price: Number(s.price || 0),
          duration: Number(s.duration_hours || 1),
          description: s.description || '',
          category: s.category, // id
          category_name: s.category_name || '',
        })));
      } catch (e) {
        setCategories([]);
        setServices([]);
      }
    };
    load();
  }, []);

  // Derived data for current tab
  let filteredServices = services;
  if (activeCategoryId === 'uncategorized') {
    filteredServices = services.filter(s => !s.category);
  } else if (activeCategoryId !== 'all') {
    filteredServices = services.filter(s => String(s.category) === String(activeCategoryId));
  }
  let headerTitle = '';
  let headerDesc = '';
  if (activeCategoryId === 'all') {
    headerTitle = 'All Services';
    headerDesc = 'Browse all available services';
  } else if (activeCategoryId === 'uncategorized') {
    headerTitle = 'Uncategorized';
    headerDesc = 'Services not yet assigned to a category';
  } else {
    const cat = categories.find(c => String(c.id) === String(activeCategoryId));
    headerTitle = cat?.name || '';
    headerDesc = cat?.description || '';
  }

  // Handle category change
  const handleCategoryChange = (category) => {
    setShowRefresh(true);
    setActiveCategoryId(category?.id ?? 'all');
    
    // Scroll to services section
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  const servicesRef = useRef(null);
  const servicesInView = useInView(servicesRef, { once: true, amount: 0.2 });

  // Toggle service details expansion
  const toggleService = (serviceId) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Animation variants
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-bold mb-6 gradient-text font-heading">
              Our Services
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              We offer a comprehensive range of professional services to meet all your needs. From moving and cleaning to event planning, our expert team delivers exceptional results every time.
            </motion.p>
            <motion.div variants={itemVariants}>
              <a href="#services" className="btn btn-gradient inline-flex items-center">
                Explore All Services
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" ref={servicesRef} className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div
            initial="hidden"
            animate={servicesInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            {/* Active Category Services */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {headerTitle}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  {headerDesc}
                </p>
              </div>

              {filteredServices.length === 0 ? (
                <div className="text-center text-gray-500">No services available in this category.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredServices.map((service) => (
                      <motion.div
                        key={service.id}
                        variants={itemVariants}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              {service.name}
                            </h3>
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
                                  <Link 
                                    href={`/booking?service=${encodeURIComponent(service.name)}`}
                                    className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-500 dark:hover:text-primary-400"
                                  >
                                    Book Now
                                  </Link>
                                  <button
                                    onClick={() => toggleService(service.id)}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
                                  >
                                    {expandedServices[service.id] ? 'Less' : 'More'} details
                                    <ChevronDown 
                                      className={`ml-1 h-4 w-4 transition-transform ${expandedServices[service.id] ? 'rotate-180' : ''}`} 
                                    />
                                  </button>
                                </div>

                                <AnimatePresence>
                                  {expandedServices[service.id] && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: 'auto' }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700"
                                    >
                                      <p className="text-sm text-gray-600 dark:text-gray-400">No additional details.</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-900 dark:to-primary-700">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to experience the Elite Hands difference?</h2>
            <p className="text-lg text-primary-100 mb-8">Book your service today and enjoy professional, reliable service you can trust.</p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link 
                href="/booking" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              >
                Book a Service
              </Link>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-700 bg-opacity-80 hover:bg-opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
