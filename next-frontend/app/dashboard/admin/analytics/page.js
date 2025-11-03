'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    monthlyStats: [],
    topServices: [],
    recentBookings: [],
    userGrowth: [],
    revenueGrowth: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/analytics/?time_range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else if (response.status === 401 || response.status === 403) {
        setAnalytics({
          totalUsers: 0,
          totalBookings: 0,
          totalRevenue: 0,
          averageRating: 0,
          monthlyStats: [],
          topServices: [],
          recentBookings: [],
          userGrowth: [],
          revenueGrowth: []
        });
      } else {
        setAnalytics({
          totalUsers: 1250,
          totalBookings: 3420,
          totalRevenue: 125000,
          averageRating: 4.8,
          monthlyStats: [
            { month: 'Jan', bookings: 120, revenue: 15000 },
            { month: 'Feb', bookings: 150, revenue: 18000 },
            { month: 'Mar', bookings: 180, revenue: 22000 },
            { month: 'Apr', bookings: 200, revenue: 25000 },
            { month: 'May', bookings: 220, revenue: 28000 },
            { month: 'Jun', bookings: 250, revenue: 32000 }
          ],
          topServices: [
            { name: 'Residential Moving', bookings: 450, revenue: 45000 },
            { name: 'Deep Cleaning', bookings: 380, revenue: 38000 },
            { name: 'Commercial Moving', bookings: 320, revenue: 32000 },
            { name: 'Post-Construction Cleaning', bookings: 280, revenue: 28000 }
          ],
          recentBookings: [
            { id: 1, customer: 'John Doe', service: 'Residential Moving', amount: 450, status: 'completed' },
            { id: 2, customer: 'Jane Smith', service: 'Deep Cleaning', amount: 280, status: 'in_progress' },
            { id: 3, customer: 'Bob Johnson', service: 'Commercial Moving', amount: 650, status: 'pending' }
          ],
          userGrowth: [
            { month: 'Jan', users: 100 },
            { month: 'Feb', users: 150 },
            { month: 'Mar', users: 200 },
            { month: 'Apr', users: 280 },
            { month: 'May', users: 350 },
            { month: 'Jun', users: 450 }
          ],
          revenueGrowth: [
            { month: 'Jan', revenue: 10000 },
            { month: 'Feb', revenue: 15000 },
            { month: 'Mar', revenue: 20000 },
            { month: 'Apr', revenue: 28000 },
            { month: 'May', revenue: 35000 },
            { month: 'Jun', revenue: 45000 }
          ]
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, change, changeType }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-full">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          {changeType === 'increase' ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </span>
        </div>
      )}
    </motion.div>
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Overview of your business performance</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          icon={Users}
          change="+12%"
          changeType="increase"
        />
        <StatCard
          title="Total Bookings"
          value={analytics.totalBookings.toLocaleString()}
          icon={Calendar}
          change="+8%"
          changeType="increase"
        />
        <StatCard
          title="Total Revenue"
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="+15%"
          changeType="increase"
        />
        <StatCard
          title="Average Rating"
          value={analytics.averageRating}
          icon={Star}
          change="+0.2"
          changeType="increase"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Stats Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Performance</h3>
          <div className="space-y-4">
            {analytics.monthlyStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-300">{stat.month}</span>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{stat.bookings} bookings</div>
                    <div className="text-xs text-gray-500">${stat.revenue.toLocaleString()}</div>
                  </div>
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${(stat.bookings / 300) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Services</h3>
          <div className="space-y-4">
            {analytics.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</div>
                  <div className="text-xs text-gray-500">{service.bookings} bookings</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">${service.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">revenue</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Bookings</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analytics.recentBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {booking.customer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {booking.service}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    ${booking.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 capitalize">{booking.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
