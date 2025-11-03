'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Moon, Sun, ArrowLeft } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  // Check if user is logged in
  useEffect(() => {
    const computeLoggedIn = () => {
      try {
        const hasToken = !!(localStorage.getItem('token') || localStorage.getItem('accessToken'));
        const flagAuth = localStorage.getItem('isAuthenticated') === 'true';
        const cookieAuth = typeof document !== 'undefined' && document.cookie.includes('isAuthenticated=true');
        setIsLoggedIn(!!hasToken || !!flagAuth || !!cookieAuth);
        // detect userType for role-based nav
        const ltUserType = localStorage.getItem('userType');
        let cookieUserType = null;
        try {
          cookieUserType = document.cookie.split('; ').find(c => c.startsWith('userType='))?.split('=')[1] || null;
        } catch {}
        setUserType(ltUserType || cookieUserType || null);
      } catch {
        setIsLoggedIn(false);
        setUserType(null);
      }
    };

    computeLoggedIn();
    // Listen to storage changes (login from other tabs)
    const onStorage = () => computeLoggedIn();
    window.addEventListener('storage', onStorage);
    // Re-evaluate on route changes as well
    const interval = setInterval(computeLoggedIn, 1000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle dark mode
  useEffect(() => {
    // Check user preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear frontend cookies (HttpOnly via API route)
      await fetch('/api/auth/clear-auth', { method: 'POST' });
      // Clear backend session
      // Get CSRF token first
      let csrfToken = null;
      try {
        const csrfResp = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/csrf/`, {
          method: 'GET',
          credentials: 'include',
        });
        if (csrfResp.ok) {
          const data = await csrfResp.json();
          csrfToken = data?.csrfToken || null;
        }
      } catch {}
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRFToken': csrfToken } : {}),
        },
      }).catch(() => {});
    } catch {}
    try {
      // Clear local storage hints
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userType');
    } catch {}
    // Expire non-HttpOnly cookie as well
    document.cookie = 'isAuthenticated=; Max-Age=0; Path=/';
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  const handleBack = () => {
    router.back();
  };

  // Check if we should show the back button (not on landing page)
  const showBackButton = pathname !== '/';

  const navLinks = (() => {
    const base = [
      { name: 'Home', href: '/' },
      { name: 'Services', href: '/services' },
    ];
    if (!isLoggedIn) return base;
    // Role-based link for logged-in users
    if (userType === 'staff') {
      return [...base, { name: 'Dashboard', href: '/dashboard/staff' }];
    }
    if (userType === 'admin') {
      return [...base, { name: 'Dashboard', href: '/dashboard/admin' }];
    }
    // Default: customer sees Dashboard + My Bookings
    return [
      ...base,
      { name: 'Dashboard', href: '/dashboard/customer' },
      { name: 'My Bookings', href: '/my-bookings' },
    ];
  })();

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-md' : 'bg-transparent'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Back button and Logo */}
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <button
                onClick={handleBack}
                className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex-shrink-0">
              <Link 
                href="/" 
                className="flex items-center"
              >
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent transition-all duration-300 hover:scale-105">EliteHands</span>
              </Link>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ${pathname === link.href ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:scale-105'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Dark mode toggle */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleDarkMode}
              className="p-2 mr-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 shadow-lg">
          {showBackButton && (
            <button
              onClick={() => {
                handleBack();
                setIsOpen(false);
              }}
              className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </button>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400'}`}
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {isLoggedIn ? (
            <>
              <Link 
                href="/profile" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </Link>
              <button 
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
                onClick={() => setIsOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}