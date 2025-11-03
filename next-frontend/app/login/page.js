/*
  // If already authenticated, redirect away from login immediately
  useEffect(() => {
    const checkAlreadyAuthed = async () => {
      try {
        const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (resp.ok) {
          // Determine redirect target
          let redirectUrl = searchParams.get('redirect');
          if (redirectUrl) {
            try { redirectUrl = decodeURIComponent(redirectUrl); } catch {}
          }
          if (!redirectUrl) {
            // choose dashboard based on userType
            const userType = (typeof window !== 'undefined') ? (localStorage.getItem('userType') || document.cookie.split('; ').find(c=>c.startsWith('userType='))?.split('=')[1]) : null;
            if (userType === 'admin') redirectUrl = '/dashboard/admin';
            else if (userType === 'staff') redirectUrl = '/dashboard/staff';
            else redirectUrl = '/dashboard/customer';
          }
          window.location.replace(redirectUrl);
        }
        if (!redirectUrl) {
          // choose dashboard based on userType
          const userType = (typeof window !== 'undefined') ? (localStorage.getItem('userType') || document.cookie.split('; ').find(c=>c.startsWith('userType='))?.split('=')[1]) : null;
          if (userType === 'admin') redirectUrl = '/dashboard/admin';
          else if (userType === 'staff') redirectUrl = '/dashboard/staff';
          else redirectUrl = '/dashboard/customer';
        }
        window.location.replace(redirectUrl);
      }
    } catch {}
  };
  checkAlreadyAuthed();
}, [searchParams]);
*/

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { redirectAfterLogin } from '../../lib/auth';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If already authenticated, redirect away from login immediately
  useEffect(() => {
    let cancelled = false;
    const checkAlreadyAuthed = async () => {
      try {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!cancelled && resp.ok) {
          let redirectUrl = searchParams.get('redirect');
          if (redirectUrl) {
            try { redirectUrl = decodeURIComponent(redirectUrl); } catch {}
          }
          if (!redirectUrl) {
            const cookieUserType = typeof document !== 'undefined' ? (document.cookie.split('; ').find(c => c.startsWith('userType='))?.split('=')[1]) : null;
            const userType = (typeof window !== 'undefined') ? (localStorage.getItem('userType') || cookieUserType) : cookieUserType;
            if (userType === 'admin') redirectUrl = '/dashboard/admin';
            else if (userType === 'staff') redirectUrl = '/dashboard/staff';
            else redirectUrl = '/dashboard/customer';
          }
          window.location.replace(redirectUrl);
        }
      } catch {}
    };
    checkAlreadyAuthed();
    return () => { cancelled = true; };
  }, [searchParams]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });

  // Auto-fill email if provided in query params
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setFormData(prev => ({
        ...prev,
        email: emailParam
      }));
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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

  // Function to get CSRF token from Django
  const getCsrfToken = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/csrf/`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const data = await response.json();
      return data.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, get the CSRF token
      const csrfToken = await getCsrfToken();
      
      const requestBody = {
        email: formData.email,
        password: formData.password,
      };
      
      console.log('[Login] Sending request to:', `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login/`);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include', // Important for session cookies
        body: JSON.stringify(requestBody),
      });
      
      console.log('[Login] Request body:', JSON.stringify(requestBody));
      
      const data = await response.json();
      console.log('[Login] Response data:', data);
      
      if (!response.ok) {
        const errorMessage = data.detail || data.message || data.error || 'Login failed. Please check your credentials.';
        console.error('[Login] Error response:', errorMessage);
        throw new Error(errorMessage);
      }
      
      // Store user data in localStorage for client-side access
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userType', data.user.user_type);
        // If backend provided JWT tokens, store them for API calls
        if (data.access) {
          localStorage.setItem('token', data.access);
        }
        if (data.refresh) {
          localStorage.setItem('refreshToken', data.refresh);
        }

        // Set lightweight cookies so Next.js middleware can detect auth status
        // 1 day expiry to match session config; adjust as needed
        document.cookie = `isAuthenticated=true; Path=/; Max-Age=86400; SameSite=Lax`;
        if (data.access) {
          document.cookie = `accessToken=${data.access}; Path=/; Max-Age=86400; SameSite=Lax`;
        }
        if (data.user?.user_type) {
          document.cookie = `userType=${data.user.user_type}; Path=/; Max-Age=86400; SameSite=Lax`;
        }
        
        console.log('[Login] Session authentication successful, user data saved to localStorage and cookie set');
      } else {
        console.error('[Login] Unexpected response format:', data);
        throw new Error('Unexpected response format from server');
      }
      
      console.log('[Login] Login successful, user data saved to localStorage');
      
      // Show success message
      toast.success('Login successful! Redirecting...');

      // Ensure server (middleware) can read auth via HttpOnly cookie on this origin
      try {
        await fetch('/api/auth/set-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            isAuthenticated: true,
            userType: data.user?.user_type,
            accessToken: data.access || localStorage.getItem('token') || null,
          }),
        });
        console.log('[Login] HttpOnly auth cookie set via /api/auth/set-auth');
      } catch (cookieErr) {
        console.warn('[Login] Failed to set HttpOnly cookie, proceeding with client cookie only', cookieErr);
      }
      
      // Get redirect URL from query params or use default based on user_type
      let redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        try { redirectUrl = decodeURIComponent(redirectUrl); } catch {}
      }
      
      if (!redirectUrl) {
        // Determine dashboard based on user type
        // Get user type from either response or localStorage
        const userType = data.user?.user_type || localStorage.getItem('userType');
        console.log('[Login] User type for redirection:', userType);
        
        switch(userType) {
          case 'admin':
            redirectUrl = '/dashboard/admin';
            break;
          case 'staff':
            redirectUrl = '/dashboard/staff';
            break;
          case 'customer':
            redirectUrl = '/dashboard/customer';
            break;
          default:
            // Fallback to customer dashboard if type is unknown
            console.warn('[Login] Unknown user type:', userType);
            redirectUrl = '/dashboard/customer';
        }
      }
      
      console.log('[Login] Redirecting to (hard reload):', redirectUrl);
      // Hard reload to ensure middleware sees updated cookies
      window.location.href = redirectUrl;
    } catch (error) {
      console.error('[Login] Error:', error);
      
      let errorMessage = 'An error occurred during login. Please try again.';
      
      // Handle different types of errors with more specific messages
      if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('401') || error.message.toLowerCase().includes('invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (error.message.includes('400') || error.message.toLowerCase().includes('bad request')) {
        errorMessage = 'Invalid request. Please check your input and try again.';
      } else if (error.message.includes('403') || error.message.toLowerCase().includes('forbidden')) {
        errorMessage = 'Access denied. Please contact support if you believe this is an error.';
      } else if (error.message.includes('404')) {
        errorMessage = 'The requested resource was not found. Please try again later.';
      } else if (error.message.includes('500') || error.message.toLowerCase().includes('server error')) {
        errorMessage = 'A server error occurred. Our team has been notified. Please try again later.';
      } else if (error.message) {
        // Use the error message from the server if available
        errorMessage = error.message;
      }
      
      setApiError(errorMessage);
      toast.error(errorMessage, {
        duration: 5000,
        position: 'top-center',
        style: {
          background: '#FEE2E2',
          color: '#B91C1C',
          border: '1px solid #FCA5A5',
          padding: '12px',
          borderRadius: '8px',
          maxWidth: '100%',
        },
      });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>
      
      <motion.div 
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        variants={containerVariants}
        className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-gray-800 rounded-xl shadow-xl relative z-10 card-hover"
      >
        <motion.div variants={itemVariants} className="text-center">
          <h2 className="mt-6 text-3xl font-bold gradient-text font-heading">Welcome Back</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 hover-scale inline-block">
              Sign up now
              <ArrowRight className="inline-block ml-1 h-4 w-4" />
            </Link>
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
        
        <motion.form 
          variants={itemVariants}
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            {/* Email Input */}
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`pl-10 appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                  placeholder="••••••••"
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link 
                href="/forgot-password" 
                className="font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 hover-scale inline-block"
              >
                Forgot password?
              </Link>
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
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : 'Sign in'}
            </motion.button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
