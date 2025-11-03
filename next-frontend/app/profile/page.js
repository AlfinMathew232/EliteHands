'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, Edit2 } from 'lucide-react';
import Link from 'next/link';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    province: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  // Helper: fetch CSRF token from backend
  const getCsrfToken = async () => {
    try {
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/csrf/`, {
        method: 'GET',
        credentials: 'include',
      });
      if (resp.ok) {
        const data = await resp.json();
        return data?.csrfToken || null;
      }
    } catch {}
    return null;
  };

  // Load profile from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (resp.status === 401) {
          // Redirect to login with return URL
          if (typeof window !== 'undefined') {
            const returnTo = encodeURIComponent('/profile');
            window.location.href = `/login?redirect=${returnTo}`;
          }
          return;
        }
        if (!resp.ok) throw new Error('Failed to load profile');
        const data = await resp.json();
        const mapped = {
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || '',
          phone: data.phone || '',
          city: data.city || '',
          province: data.province || '',
        };
        setUser(data);
        setFormData(prev => ({
          ...prev,
          ...mapped,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    // Only validate password fields if any of them have values
    if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) newErrors.currentPassword = 'Current password is required';
      if (!formData.newPassword) newErrors.newPassword = 'New password is required';
      else if (formData.newPassword.length < 8) newErrors.newPassword = 'Password must be at least 8 characters';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
      const csrfToken = await getCsrfToken();
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        province: formData.province,
      };
      const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const msg = err?.message || 'Failed to update profile';
        throw new Error(msg);
      }
      const updated = await resp.json();
      // Update local state
      setUser(updated);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setEditMode(false);
    } catch (err) {
      console.error('Update profile failed', err);
      alert(err.message || 'Failed to update profile');
    }
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {editMode ? 'Cancel' : 'Edit Profile'}
            {!editMode && React.createElement(Edit2, { className: "ml-2 h-4 w-4" })}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {React.createElement(User, { className: "h-5 w-5 text-gray-400" })}
                    </div>
                    <input
                      type="text"
                      name="firstName"
                      id="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`block w-full pl-10 py-2 sm:text-sm rounded-md ${!editMode ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} ${errors.firstName ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`}
                    />
                  </div>
                  {errors.firstName && <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {React.createElement(User, { className: "h-5 w-5 text-gray-400" })}
                    </div>
                    <input
                      type="text"
                      name="lastName"
                      id="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`block w-full pl-10 py-2 sm:text-sm rounded-md ${!editMode ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} ${errors.lastName ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`}
                    />
                  </div>
                  {errors.lastName && <p className="mt-2 text-sm text-red-600">{errors.lastName}</p>}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {React.createElement(Mail, { className: "h-5 w-5 text-gray-400" })}
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`block w-full pl-10 py-2 sm:text-sm rounded-md ${!editMode ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} ${errors.email ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`}
                    />
                  </div>
                  {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {React.createElement(Phone, { className: "h-5 w-5 text-gray-400" })}
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`block w-full pl-10 py-2 sm:text-sm rounded-md ${!editMode ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} ${errors.phone ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`}
                    />
                  </div>
                  {errors.phone && <p className="mt-2 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Province/State
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="province"
                      id="province"
                      value={formData.province}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`block w-full py-2 sm:text-sm rounded-md ${!editMode ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} ${errors.province ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`}
                    />
                  </div>
                  {errors.province && <p className="mt-2 text-sm text-red-600">{errors.province}</p>}
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    City
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!editMode}
                      className={`block w-full py-2 sm:text-sm rounded-md ${!editMode ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} ${errors.city ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500'}`}
                    />
                  </div>
                  {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
                </div>
              </div>
            </div>

            {editMode && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-6 border-b border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Change Password</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {React.createElement(Lock, { className: "h-5 w-5 text-gray-400" })}
                      </div>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 py-2 sm:text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-primary-500 focus:border-primary-500 ${errors.currentPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.currentPassword && <p className="mt-2 text-sm text-red-600">{errors.currentPassword}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {React.createElement(Lock, { className: "h-5 w-5 text-gray-400" })}
                      </div>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 py-2 sm:text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-primary-500 focus:border-primary-500 ${errors.newPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {React.createElement(Lock, { className: "h-5 w-5 text-gray-400" })}
                      </div>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`block w-full pl-10 py-2 sm:text-sm rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 focus:ring-primary-500 focus:border-primary-500 ${errors.confirmPassword ? 'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500' : ''}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-750 flex justify-between items-center">
              <Link href="/" className="text-sm text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-400">
                Return to Home
              </Link>
              
              {editMode && (
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {React.createElement(Save, { className: "mr-2 h-4 w-4" })}
                  Save Changes
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}