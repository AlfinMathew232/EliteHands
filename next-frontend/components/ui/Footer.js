'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null);
  const [settings, setSettings] = useState({ address: '157 Gorge Rd E #402, Victoria, BC V9A 6Y2, Canada', map_embed_url: '' });

  useEffect(() => {
    setMapLoaded(true);
    // Try to fetch persisted settings if a token exists (admin or staff session)
    const loadSettings = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const token = (typeof window !== 'undefined') ? (localStorage.getItem('token') || localStorage.getItem('accessToken')) : null;
        if (!token) return; // footer is public; only try when token exists
        const resp = await fetch(`${apiBase}/api/admin/settings/`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!resp.ok) return;
        const data = await resp.json();
        setSettings({ address: data.address || settings.address, map_embed_url: data.map_embed_url || '' });
      } catch {}
    };
    loadSettings();
  }, []);

  // Lightweight auth detection (token or cookie)
  useEffect(() => {
    const computeLoggedIn = () => {
      try {
        const hasToken = !!(localStorage.getItem('token') || localStorage.getItem('accessToken'));
        const cookieAuth = typeof document !== 'undefined' && document.cookie.includes('isAuthenticated=true');
        setIsLoggedIn(!!hasToken || !!cookieAuth);
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
    const onStorage = () => computeLoggedIn();
    window.addEventListener('storage', onStorage);
    const interval = setInterval(computeLoggedIn, 1000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/clear-auth', { method: 'POST' });
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/logout/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
    } catch {}
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userType');
    } catch {}
    document.cookie = 'isAuthenticated=; Max-Age=0; Path=/';
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Google Map */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md h-[300px]">
            {mapLoaded && (
              <iframe 
                src={settings.map_embed_url || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2647.2893726022053!2d-123.37440642328143!3d48.43798997134452!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548f7383a38aef6f%3A0x552078eb3ddbbd5a!2s157%20Gorge%20Rd%20E%20%23402%2C%20Victoria%2C%20BC%20V9A%206Y2%2C%20Canada!5e0!3m2!1sen!2sus!4v1715481600000!5m2!1sen!2sus"}
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="EliteHands Location"
                className="w-full h-full"
              />
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">EliteHands</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-xs">
              Professional services delivered with care and precision for all your moving, cleaning, and event needs.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-all duration-300 hover:scale-110">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-all duration-300 hover:scale-110">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-all duration-300 hover:scale-110">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-all duration-300 hover:scale-110">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                  Services
                </Link>
              </li>
              {/* Role-aware links */}
              {isLoggedIn && (
                userType === 'staff' ? (
                  <li>
                    <Link href="/dashboard/staff" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                      Dashboard
                    </Link>
                  </li>
                ) : userType === 'admin' ? (
                  <li>
                    <Link href="/dashboard/admin" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <li>
                    <Link href="/my-bookings" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                      My Bookings
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Our Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/moving" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                  Moving Services
                </Link>
              </li>
              <li>
                <Link href="/services/cleaning" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                  Cleaning Services
                </Link>
              </li>
              <li>
                <Link href="/services/events" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all duration-300">
                  Event Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                <span className="text-gray-600 dark:text-gray-400">{settings.address}</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">+1 (416) 555-0123</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                <span className="text-gray-600 dark:text-gray-400">contact@elitehands.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © {currentYear} EliteHands. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}