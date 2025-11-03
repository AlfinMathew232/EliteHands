'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Canadian provinces and cities data
const provinces = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Northwest Territories',
  'Nova Scotia',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon'
];

// Major cities by province
const citiesByProvince = {
  'Alberta': ['Calgary', 'Edmonton', 'Fort McMurray', 'Lethbridge', 'Red Deer'],
  'British Columbia': ['Burnaby', 'Kelowna', 'Surrey', 'Vancouver', 'Victoria'],
  'Manitoba': ['Brandon', 'Steinbach', 'Thompson', 'Winnipeg'],
  'New Brunswick': ['Fredericton', 'Moncton', 'Saint John'],
  'Newfoundland and Labrador': ['Corner Brook', 'St. John\'s'],
  'Northwest Territories': ['Yellowknife'],
  'Nova Scotia': ['Dartmouth', 'Halifax', 'Sydney'],
  'Nunavut': ['Iqaluit'],
  'Ontario': ['Brampton', 'Hamilton', 'Mississauga', 'Ottawa', 'Toronto'],
  'Prince Edward Island': ['Charlottetown', 'Summerside'],
  'Quebec': ['Laval', 'Montreal', 'Quebec City'],
  'Saskatchewan': ['Regina', 'Saskatoon'],
  'Yukon': ['Whitehorse']
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    province: '',
    user_type: 'customer', // Default to customer, staff/admin can only be set by admin
  });
  
  // No longer need to filter cities based on province since we're using text inputs
  const availableCities = [];
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  const validateForm = () => {
    const newErrors = {};
    
    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // City validation
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    // Province validation
    if (!formData.province.trim()) {
      newErrors.province = 'Province/State is required';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password
    if (!formData.password2) {
      newErrors.password2 = 'Please confirm your password';
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    
    // Clear API error when user types
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Step 1: Register the user
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2,
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          city: formData.city,
          province: formData.province,
          user_type: formData.user_type,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle validation errors from the server
        if (data.errors) {
          const serverErrors = {};
          Object.keys(data.errors).forEach(key => {
            serverErrors[key] = data.errors[key].join(' ');
          });
          setErrors(serverErrors);
          throw new Error('Please fix the errors in the form.');
        }
        throw new Error(data.detail || 'Registration failed. Please try again.');
      }
      
      // Step 2: Auto-login after successful registration
      try {
        console.log('[Register] Attempting auto-login with:', {
          username: formData.username
        });
        
        const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for session cookies
            body: JSON.stringify({
              email: formData.email, // Use email for login as it's more reliable
              password: formData.password,
            }),
          });
        
        console.log('[Register] Auto-login response status:', loginResponse.status);
        
        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
          console.error('[Register] Auto-login failed with status:', loginResponse.status);
          throw new Error(loginData.detail || 'Auto-login failed. Please log in manually.');
        }
        
        console.log('[Register] Auto-login successful, response data:', loginData);
        
        // Store user data in localStorage for client-side access
        if (loginData.user) {
          localStorage.setItem('user', JSON.stringify(loginData.user));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userType', loginData.user.user_type);
          
          console.log('[Register] Session authentication successful, user data saved to localStorage');
        } else {
          console.error('[Register] Unexpected response format:', loginData);
          throw new Error('Unexpected response format from server');
        }
        
        // Show success message
        setSuccessMessage('Registration successful! Redirecting to dashboard...');
        toast.success('Registration successful!');
        
        // Redirect to customer dashboard immediately
        window.location.href = '/dashboard/customer';
        
      } catch (loginError) {
        console.error('Auto-login error:', loginError);
        // If auto-login fails, redirect to login page
        setSuccessMessage('Registration successful! Redirecting to login...');
        toast.success('Registration successful! Please log in.');
        
        // Redirect to login immediately
        router.replace('/login');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setApiError(error.message || 'An error occurred during registration. Please try again.');
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
      
      <motion.div 
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl relative z-10 card-hover"
      >
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="mt-6 text-3xl font-bold gradient-text font-heading">Join Elite Hands</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 hover-scale inline-block">
              Sign in
              <ArrowRight className="inline-block ml-1 h-4 w-4" />
            </Link>
          </p>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
            Note: This registration is for customers only. Staff and admin accounts are managed by administrators.
          </p>
        </motion.div>
        
        {apiError && (
          <motion.div 
            variants={itemVariants}
            className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 p-4 rounded-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        {successMessage && (
          <motion.div 
            variants={itemVariants}
            className="bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 p-4 rounded-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700 dark:text-green-400">{successMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
        
        <motion.form 
          variants={itemVariants}
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.first_name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                {errors.first_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.first_name}</p>}
              </div>
              
              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.last_name ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
                {errors.last_name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.last_name}</p>}
              </div>
            </div>
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.username ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
              {errors.username && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>}
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  required
                  className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.phone ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1234567890"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>}
            </div>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Province/State
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="province"
                    name="province"
                    type="text"
                    required
                    placeholder="Enter your province"
                    className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.province ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    value={formData.province}
                    onChange={handleChange}
                  />
                </div>
                {errors.province && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.province}</p>}
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    placeholder="Enter your city"
                    className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.city ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                {errors.city && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.city}</p>}
              </div>
              </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>}
            </div>
            
            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password2"
                  name="password2"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.password2 ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  value={formData.password2}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password2 && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password2}</p>}
            </div>
          </div>

          <div>
            <motion.button
              type="submit"
              disabled={isLoading}
              className="btn btn-gradient w-full py-2 px-4 flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </>
              ) : 'Create Account'}
            </motion.button>
          </div>
          
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <Link href="/terms" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500">
              Privacy Policy
            </Link>.
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
