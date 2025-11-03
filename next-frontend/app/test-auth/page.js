'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isAuthenticated, getUser, getToken, redirectToLogin, redirectAfterLogin } from '../../lib/auth';
import { toast } from 'react-hot-toast';

export default function TestAuthPage() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    user: null,
    token: null,
    localStorage: {}
  });
  
  const router = useRouter();

  useEffect(() => {
    // Check authentication state
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      const user = getUser();
      const token = getToken();
      
      setAuthState({
        isAuthenticated: isAuth,
        user,
        token,
        localStorage: {
          token: localStorage.getItem('token'),
          refreshToken: localStorage.getItem('refreshToken'),
          user: localStorage.getItem('user')
        }
      });
    };

    // Check auth on mount
    checkAuth();

    // Listen for storage changes
    const handleStorageChange = () => checkAuth();
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    try {
      console.log('[TestAuth] Logging out...');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Force a page reload to clear any cached state
      window.location.href = '/login';
    } catch (error) {
      console.error('[TestAuth] Error during logout:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };
  
  const handleForceLogin = () => {
    redirectToLogin(router, '/test-auth');
  };
  
  const handleForceRedirect = () => {
    redirectAfterLogin(router, '/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-6">Authentication Test Page</h1>
        
        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Authentication State</h2>
          <pre className="text-xs md:text-sm bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
            {JSON.stringify(authState, (key, value) => 
              key === 'password' ? '***' : value, 2)}
          </pre>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/login')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm md:text-base"
            >
              Go to Login Page
            </button>
            <button
              onClick={handleForceLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm md:text-base"
            >
              Force Login Redirect
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm md:text-base"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleForceRedirect}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm md:text-base"
            >
              Force Dashboard Redirect
            </button>
          </div>
          
          <div className="pt-4 border-t">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors w-full md:w-auto"
            >
              Logout (Clear All Auth Data)
            </button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <h3 className="font-semibold text-yellow-800">Debug Information</h3>
          <div className="mt-2 text-sm text-yellow-700 space-y-1">
            <p>• Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
            <p>• Is Client: {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
            <p>• Auth Status: {authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
            {authState.user && (
              <p>• User Role: {authState.user.role || 'No role assigned'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
