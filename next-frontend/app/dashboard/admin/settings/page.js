'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Save, 
  Upload, 
  Mail, 
  Bell, 
  Shield, 
  Globe,
  Database,
  Key,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    general: {
      siteName: 'EliteHands',
      siteDescription: 'Professional cleaning and moving services',
      siteLogo: '',
      contactEmail: 'info@elitehands.com',
      contactPhone: '+1 (555) 123-4567',
      address: '123 Main St, Toronto, ON M5V 3A8',
      timezone: 'America/Toronto'
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@elitehands.com',
      fromName: 'EliteHands'
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      bookingNotifications: true,
      paymentNotifications: true,
      reviewNotifications: true
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      requirePhoneVerification: false,
      twoFactorAuth: false
    },
    business: {
      businessHours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { open: '09:00', close: '17:00', closed: false },
        wednesday: { open: '09:00', close: '17:00', closed: false },
        thursday: { open: '09:00', close: '17:00', closed: false },
        friday: { open: '09:00', close: '17:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '10:00', close: '16:00', closed: true }
      },
      defaultServiceDuration: 2,
      cancellationPolicy: '24 hours',
      refundPolicy: 'Full refund within 24 hours'
    }
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/settings/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/settings/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setSettings(prev => ({
      ...prev,
      business: {
        ...prev.business,
        businessHours: {
          ...prev.business.businessHours,
          [day]: {
            ...prev.business.businessHours[day],
            [field]: value
          }
        }
      }
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'business', name: 'Business', icon: Globe }
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your application settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          {saved && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span className="text-sm">Saved</span>
            </div>
          )}
          <button
            onClick={saveSettings}
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.general.siteName}
                  onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.general.contactEmail}
                  onChange={(e) => handleInputChange('general', 'contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={settings.general.contactPhone}
                  onChange={(e) => handleInputChange('general', 'contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.general.timezone}
                  onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="America/Toronto">Eastern Time (Toronto)</option>
                  <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                  <option value="America/Edmonton">Mountain Time (Edmonton)</option>
                  <option value="America/Winnipeg">Central Time (Winnipeg)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Site Description
              </label>
              <textarea
                value={settings.general.siteDescription}
                onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Address
              </label>
              <textarea
                value={settings.general.address}
                onChange={(e) => handleInputChange('general', 'address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={settings.email.smtpHost}
                  onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Port
                </label>
                <input
                  type="number"
                  value={settings.email.smtpPort}
                  onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={settings.email.smtpUsername}
                  onChange={(e) => handleInputChange('email', 'smtpUsername', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SMTP Password
                </label>
                <input
                  type="password"
                  value={settings.email.smtpPassword}
                  onChange={(e) => handleInputChange('email', 'smtpPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Email
                </label>
                <input
                  type="email"
                  value={settings.email.fromEmail}
                  onChange={(e) => handleInputChange('email', 'fromEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Name
                </label>
                <input
                  type="text"
                  value={settings.email.fromName}
                  onChange={(e) => handleInputChange('email', 'fromName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h3>
            <div className="space-y-4">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {key === 'emailNotifications' && 'Send email notifications to users'}
                      {key === 'smsNotifications' && 'Send SMS notifications to users'}
                      {key === 'pushNotifications' && 'Send push notifications to users'}
                      {key === 'bookingNotifications' && 'Notify users about booking updates'}
                      {key === 'paymentNotifications' && 'Notify users about payment status'}
                      {key === 'reviewNotifications' && 'Notify users about new reviews'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleInputChange('notifications', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Login Attempts
                </label>
                <input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(settings.security).filter(([key]) => typeof settings.security[key] === 'boolean').map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {key === 'requireEmailVerification' && 'Require email verification for new accounts'}
                      {key === 'requirePhoneVerification' && 'Require phone verification for new accounts'}
                      {key === 'twoFactorAuth' && 'Enable two-factor authentication'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleInputChange('security', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Business Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Service Duration (hours)
                </label>
                <input
                  type="number"
                  value={settings.business.defaultServiceDuration}
                  onChange={(e) => handleInputChange('business', 'defaultServiceDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cancellation Policy
                </label>
                <input
                  type="text"
                  value={settings.business.cancellationPolicy}
                  onChange={(e) => handleInputChange('business', 'cancellationPolicy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Refund Policy
              </label>
              <textarea
                value={settings.business.refundPolicy}
                onChange={(e) => handleInputChange('business', 'refundPolicy', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Business Hours</h4>
              <div className="space-y-3">
                {days.map((day) => (
                  <div key={day} className="flex items-center space-x-4">
                    <div className="w-24">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {day}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={!settings.business.businessHours[day].closed}
                        onChange={(e) => handleBusinessHoursChange(day, 'closed', !e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-500">Open</span>
                    </div>
                    {!settings.business.businessHours[day].closed && (
                      <>
                        <input
                          type="time"
                          value={settings.business.businessHours[day].open}
                          onChange={(e) => handleBusinessHoursChange(day, 'open', e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={settings.business.businessHours[day].close}
                          onChange={(e) => handleBusinessHoursChange(day, 'close', e.target.value)}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}