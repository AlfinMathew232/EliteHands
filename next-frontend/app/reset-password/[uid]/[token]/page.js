'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ResetPasswordPage({ params }) {
  const { uid, token } = params;
  const [formData, setFormData] = useState({ new_password1: '', new_password2: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isValidToken, setIsValidToken] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  // Validate token on mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/auth/password/reset/verify/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid, token }),
        });
        setIsValidToken(res.ok);
        if (!res.ok) setApiError('Invalid or expired reset link');
      } catch (err) {
        setApiError('Error validating reset link');
      }
    };
    validateToken();
  }, [uid, token]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.new_password1) newErrors.new_password1 = 'Required';
    else if (formData.new_password1.length < 6) newErrors.new_password1 = 'Min 6 characters';
    if (formData.new_password1 !== formData.new_password2) {
      newErrors.new_password2 = 'Passwords must match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/auth/password/reset/confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, ...formData }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Password reset failed');
      }
      
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValidToken && !apiError) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {success ? 'Password Reset!' : 'Reset Password'}
          </h2>
        </div>
        
        {apiError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <p className="text-sm text-red-700">{apiError}</p>
          </div>
        )}
        
        {success ? (
          <div className="bg-green-50 border-l-4 border-green-500 p-4">
            <p className="text-sm text-green-700">Password reset successful! Redirecting to login...</p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="new_password1"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.new_password1 ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                  value={formData.new_password1}
                  onChange={(e) => setFormData({...formData, new_password1: e.target.value})}
                />
                {errors.new_password1 && <p className="mt-1 text-sm text-red-600">{errors.new_password1}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  name="new_password2"
                  className={`mt-1 block w-full px-3 py-2 border ${errors.new_password2 ? 'border-red-300' : 'border-gray-300'} rounded-md`}
                  value={formData.new_password2}
                  onChange={(e) => setFormData({...formData, new_password2: e.target.value})}
                />
                {errors.new_password2 && <p className="mt-1 text-sm text-red-600">{errors.new_password2}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
        
        <div className="text-sm text-center">
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
