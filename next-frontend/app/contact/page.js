'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Send, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [headerRef, headerInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [formRef, formInView] = useInView({ threshold: 0.1, triggerOnce: true });
  const [infoRef, infoInView] = useInView({ threshold: 0.1, triggerOnce: true });
  
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
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/contact/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      toast.success('Your message has been sent successfully!');
    } catch (error) {
      console.error('Contact form error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
              Get in Touch
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Have questions or need a quote? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>
      
      {/* Contact Form and Info Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              ref={formRef}
              initial="hidden"
              animate={formInView ? "visible" : "hidden"}
              variants={containerVariants}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8"
            >
              <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6 font-heading dark:text-white">
                Send Us a Message
              </motion.h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <motion.div variants={itemVariants}>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Your Name*
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address*
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </motion.div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <motion.div variants={itemVariants}>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="(123) 456-7890"
                    />
                  </motion.div>
                  
                  <motion.div variants={itemVariants}>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="How can we help?"
                    />
                  </motion.div>
                </div>
                
                <motion.div variants={itemVariants} className="mb-6">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Message*
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full px-4 py-3 rounded-lg border ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="Please provide details about your inquiry..."
                  ></textarea>
                  {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                </motion.div>
                
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
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        Send Message <Send className="ml-2 h-5 w-5" />
                      </span>
                    )}
                  </button>
                </motion.div>
              </form>
            </motion.div>
            
            {/* Contact Information */}
            <motion.div
              ref={infoRef}
              initial="hidden"
              animate={infoInView ? "visible" : "hidden"}
              variants={containerVariants}
            >
              <motion.h2 variants={itemVariants} className="text-2xl font-bold mb-6 font-heading dark:text-white">
                Contact Information
              </motion.h2>
              
              <div className="space-y-8">
                <motion.div variants={itemVariants} className="flex items-start">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                    <MapPin className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 dark:text-white">Our Location</h3>
                    <p className="text-gray-600 dark:text-gray-300">157 Gorge Rd E #402, Victoria, BC V9A 1L1, Canada</p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex items-start">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                    <Phone className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 dark:text-white">Phone Number</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <a href="tel:+12505551234" className="hover:text-primary-600 dark:hover:text-primary-400">(250) 555-1234</a>
                    </p>
                  </div>
                </motion.div>
                
                <motion.div variants={itemVariants} className="flex items-start">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full mr-4">
                    <Mail className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 dark:text-white">Email Address</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      <a href="mailto:info@elitehands.com" className="hover:text-primary-600 dark:hover:text-primary-400">info@elitehands.com</a>
                    </p>
                  </div>
                </motion.div>
              </div>
              
              <motion.div variants={itemVariants} className="mt-12">
                <h3 className="text-lg font-semibold mb-4 dark:text-white">Business Hours</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  <li className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>8:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Saturday:</span>
                    <span>9:00 AM - 4:00 PM</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Sunday:</span>
                    <span>Closed</span>
                  </li>
                </ul>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mt-12">
                <Link 
                  href="/booking"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-lg"
                >
                  Book a Service
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 font-heading dark:text-white">Find Us</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Visit our office or reach out to us online. We're conveniently located in Victoria, BC.
            </p>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-xl h-[400px]">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2647.2044334371947!2d-123.37290492328746!3d48.43290997129452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548f7485d5a1c2b1%3A0x5b5da5a3d97f3f0!2s157%20Gorge%20Rd%20E%20%23402%2C%20Victoria%2C%20BC%20V9A%201L1%2C%20Canada!5e0!3m2!1sen!2sus!4v1696547345539!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}