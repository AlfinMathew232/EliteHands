'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetToken = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';
  
  const [formData, setFormData] = useState({ 
    new_password: '', 
    new_password2: '' 
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if no token is provided
  if (!resetToken && typeof window !== 'undefined' && !success) {
    router.push('/forgot-password');
  }

  const validateForm = () => {
    const newErrors = {};
    
    // Password validation
    if (!formData.new_password) {
      newErrors.new_password = 'Password is required';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (!formData.new_password2) {
      newErrors.new_password2 = 'Please confirm your password';
    } else if (formData.new_password !== formData.new_password2) {
      newErrors.new_password2 = 'Passwords do not match';
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
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear API error when user starts typing again
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setApiError('');
    
    try {
      console.log('[ResetPassword] Sending password reset confirmation for email:', email);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/password/reset/confirm/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          email: email,
          password: formData.new_password
        }),
      });
      
      console.log('[ResetPassword] Reset confirmation response status:', response.status);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }
      
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      setApiError(error.message || 'An error occurred while resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Password Reset Successful
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Your password has been reset successfully. Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your new password below
          </p>
        </div>
        
        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              id="new_password"
              name="new_password"
              type="password"
              autoComplete="new-password"
              required
              className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.new_password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="Enter new password"
              value={formData.new_password}
              onChange={handleChange}
            />
            {errors.new_password && <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>}
          </div>
          
          <div>
            <label htmlFor="new_password2" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <input
              id="new_password2"
              name="new_password2"
              type="password"
              autoComplete="new-password"
              required
              className={`mt-1 appearance-none block w-full px-3 py-2 border ${errors.new_password2 ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
              placeholder="Confirm new password"
              value={formData.new_password2}
              onChange={handleChange}
            />
            {errors.new_password2 && <p className="mt-1 text-sm text-red-600">{errors.new_password2}</p>}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
          
          <div className="text-sm text-center">
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}