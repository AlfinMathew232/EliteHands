// Helper functions for authentication

/**
 * Verify if the current token is valid
 * @returns {Promise<boolean>} True if token is valid, false otherwise
 */
export const verifyToken = async () => {
  try {
    if (typeof window === 'undefined') return false;

    // Prefer checking session via profile first
    const profileResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    if (profileResp.ok) return true;

    // Fallback to JWT if available
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (!token) return false;

    const jwtResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/profile/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    return jwtResp.ok;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
};

/**

/**
 * Check if user is authenticated by verifying the presence of a valid token
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  try {
    if (typeof window === 'undefined') {
      console.debug('[Auth] Running on server side, no authentication');
      return false;
    }
    
    const token = localStorage.getItem('token');
    const hasToken = !!token;
    
    if (hasToken) {
      console.debug('[Auth] User is authenticated');
    } else {
      console.debug('[Auth] No authentication token found');
    }
    
    return hasToken;
  } catch (error) {
    console.error('[Auth] Error checking authentication:', error);
    return false;
  }
};

/**
 * Get the authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
export const getToken = () => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('token');
  } catch (error) {
    console.error('[Auth] Error getting token:', error);
    return null;
  }
};

/**
 * Get the current user data from localStorage
 * @returns {Object|null} The user object or null if not found
 */
export const getUser = () => {
  try {
    if (typeof window === 'undefined') {
      return null;
    }
    
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.debug('[Auth] No user data found in localStorage');
      return null;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.debug('[Auth] Retrieved user data:', user);
      return user;
    } catch (e) {
      console.error('[Auth] Error parsing user data:', e);
      return null;
    }
  } catch (error) {
    console.error('[Auth] Error getting user data:', error);
    return null;
  }
};

/**
 * Redirect to login page with a return URL
 * @param {Object} router - Next.js router instance
 * @param {string} [redirectPath] - Optional custom redirect path after login
 */
export const redirectToLogin = (router, redirectPath) => {
  console.log('[Auth] Redirecting to login');
  try {
    if (typeof window !== 'undefined') {
      const currentPath = redirectPath || window.location.pathname + window.location.search;
      const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
      console.log('[Auth] Login redirect URL:', loginUrl);
      window.location.href = loginUrl;
    } else if (router) {
      router.push('/login');
    }
  } catch (error) {
    console.error('[Auth] Error during login redirect:', error);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};

/**
 * Redirect after successful login
 * @param {Object} router - Next.js router instance
 * @param {string} [defaultPath='/dashboard'] - Default path to redirect to if no redirect URL is found
 */
export const redirectAfterLogin = (router, defaultPath = '/dashboard') => {
  console.log('[Auth] Processing post-login redirect');
  try {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      let redirectUrl = urlParams.get('redirect') || defaultPath;
      
      // Ensure the URL is local
      if (!redirectUrl.startsWith('/')) {
        console.warn('[Auth] Invalid redirect URL, using default');
        redirectUrl = defaultPath;
      }
      
      // Get user role from localStorage to determine correct dashboard
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!redirectUrl || redirectUrl === '/dashboard') {
        // Set specific dashboard based on user role
        if (user.user_type === 'admin') {
          redirectUrl = '/dashboard/admin';
        } else if (user.user_type === 'staff') {
          redirectUrl = '/dashboard/staff';
        } else {
          redirectUrl = '/dashboard/customer';
        }
      }
      
      console.log('[Auth] Redirecting to:', redirectUrl);
      // Use router.replace instead of router.push to prevent redirection issues
      if (router) {
        router.replace(redirectUrl);
      } else {
        window.location.replace(redirectUrl);
      }
    } else if (router) {
      router.replace(defaultPath);
    }
  } catch (error) {
    console.error('[Auth] Error during post-login redirect:', error);
    if (typeof window !== 'undefined' && router) {
      router.replace(defaultPath);
    } else if (typeof window !== 'undefined') {
      window.location.replace(defaultPath);
    } else if (router) {
      router.replace(defaultPath);
    }
  }
};
