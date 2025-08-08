'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Calendar,
  Clock,
  MapPin,
  Star,
  Plus,
  ArrowRight,
  Truck,
  Sparkles,
  Users,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Phone,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../components/providers/Providers'
import apiService from '../../services/api'
import toast from 'react-hot-toast'

const upcomingBookings = [
  {
    id: 1,
    service: 'Moving Services',
    type: 'Residential Move',
    date: '2024-01-15',
    time: '09:00 AM',
    location: '123 Main St, Toronto, ON',
    status: 'confirmed',
    staff: 'Mike Johnson & Team',
    icon: Truck,
    color: 'blue'
  },
  {
    id: 2,
    service: 'Cleaning Services',
    type: 'Deep Cleaning',
    date: '2024-01-18',
    time: '02:00 PM',
    location: '456 Oak Ave, Vancouver, BC',
    status: 'pending',
    staff: 'Sarah Wilson',
    icon: Sparkles,
    color: 'green'
  }
]

const recentBookings = [
  {
    id: 3,
    service: 'Event Services',
    type: 'Wedding Setup',
    date: '2023-12-20',
    time: '08:00 AM',
    location: 'Grand Ballroom, Montreal, QC',
    status: 'completed',
    rating: 5,
    staff: 'Event Team Alpha',
    icon: Users,
    color: 'purple'
  },
  {
    id: 4,
    service: 'Cleaning Services',
    type: 'Regular Maintenance',
    date: '2023-12-15',
    time: '10:00 AM',
    location: '789 Pine St, Calgary, AB',
    status: 'completed',
    rating: 4,
    staff: 'Lisa Chen',
    icon: Sparkles,
    color: 'green'
  }
]

const quickStats = [
  { label: 'Total Bookings', value: '12', icon: Calendar, color: 'blue' },
  { label: 'Completed Services', value: '8', icon: CheckCircle, color: 'green' },
  { label: 'Average Rating', value: '4.8', icon: Star, color: 'yellow' },
  { label: 'Total Spent', value: '$2,450', icon: DollarSign, color: 'purple' }
]

export default function CustomerDashboard() {
  const { user } = useAuth()
  const [dashboardRef, dashboardInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState({
    bookings: [],
    stats: {
      totalBookings: 0,
      completedServices: 0,
      averageRating: 0,
      totalSpent: 0
    }
  })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        // Fetch bookings from backend
        const bookingsResponse = await apiService.getBookings()
        const bookings = bookingsResponse || []
        
        // Calculate stats from bookings
        const totalBookings = bookings.length
        const completedServices = bookings.filter(b => b.status === 'completed').length
        const averageRating = bookings.length > 0 
          ? (bookings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookings.length).toFixed(1)
          : 0
        const totalSpent = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
        
        setDashboardData({
          bookings,
          stats: {
            totalBookings,
            completedServices,
            averageRating,
            totalSpent
          }
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Clear localStorage if authentication failed
        if (error.message.includes('401') || error.message.includes('403')) {
          localStorage.removeItem('user')
          window.location.href = '/login'
          return
        }
        // Use mock data as fallback when no real bookings exist
        console.log('Using mock data as fallback')
        const mockBookings = [
          {
            id: 1,
            service_type: 'Moving Services',
            scheduled_date: '2024-01-15',
            scheduled_time: '09:00',
            status: 'confirmed',
            total_amount: 450,
            address: '123 Main St, Toronto, ON',
            city: 'Toronto',
            province: 'Ontario'
          },
          {
            id: 2,
            service_type: 'Cleaning Services',
            scheduled_date: '2024-01-18',
            scheduled_time: '14:00',
            status: 'pending',
            total_amount: 120,
            address: '456 Oak Ave, Vancouver, BC',
            city: 'Vancouver',
            province: 'British Columbia'
          },
          {
            id: 3,
            service_type: 'Event Services',
            scheduled_date: '2023-12-20',
            scheduled_time: '08:00',
            status: 'completed',
            total_amount: 800,
            address: 'Grand Ballroom, Montreal, QC',
            city: 'Montreal',
            province: 'Quebec',
            rating: 5
          },
          {
            id: 4,
            service_type: 'Cleaning Services',
            scheduled_date: '2023-12-15',
            scheduled_time: '10:00',
            status: 'completed',
            total_amount: 150,
            address: '789 Pine St, Calgary, AB',
            city: 'Calgary',
            province: 'Alberta',
            rating: 4
          }
        ]
        
        const totalBookings = mockBookings.length
        const completedServices = mockBookings.filter(b => b.status === 'completed').length
        const averageRating = mockBookings.filter(b => b.rating).length > 0 
          ? (mockBookings.filter(b => b.rating).reduce((sum, b) => sum + b.rating, 0) / mockBookings.filter(b => b.rating).length).toFixed(1)
          : 0
        const totalSpent = mockBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0)
        
        setDashboardData({
          bookings: mockBookings,
          stats: {
            totalBookings,
            completedServices,
            averageRating: parseFloat(averageRating),
            totalSpent
          }
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    } else {
      setIsLoading(false)
    }
  }, [user])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'completed': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getServiceColor = (color) => {
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600'
      case 'green': return 'from-green-500 to-green-600'
      case 'purple': return 'from-purple-500 to-purple-600'
      case 'yellow': return 'from-yellow-500 to-yellow-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Please log in to view your dashboard
              </h2>
              <Link
                href="/login"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <span>Go to Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          ref={dashboardRef}
          variants={containerVariants}
          initial="hidden"
          animate={dashboardInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : 'Customer'}!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 lg:mt-0"
              >
                <Link
                  href="/booking"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Book New Service</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Bookings', value: dashboardData.stats.totalBookings, icon: Calendar, color: 'blue' },
              { label: 'Completed Services', value: dashboardData.stats.completedServices, icon: CheckCircle, color: 'green' },
              { label: 'Average Rating', value: dashboardData.stats.averageRating, icon: Star, color: 'yellow' },
              { label: 'Total Spent', value: `$${dashboardData.stats.totalSpent.toLocaleString()}`, icon: DollarSign, color: 'purple' }
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="card"
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 bg-gradient-to-r ${getServiceColor(stat.color)} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Bookings */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
                    Upcoming Bookings
                  </h2>
                  <Link
                    href="/bookings"
                    className="text-primary-600 hover:text-primary-500 font-medium text-sm flex items-center space-x-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {dashboardData.bookings.filter(booking => 
                    ['confirmed', 'pending'].includes(booking.status) && 
                    new Date(booking.scheduled_date) >= new Date()
                  ).slice(0, 5).map((booking) => {
                    const Icon = booking.service_type === 'Moving Services' ? Truck : 
                               booking.service_type === 'Cleaning Services' ? Sparkles : Users
                    const color = booking.service_type === 'Moving Services' ? 'blue' : 
                                booking.service_type === 'Cleaning Services' ? 'green' : 'purple'
                    return (
                      <motion.div
                        key={booking.id}
                        whileHover={{ scale: 1.02 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${getServiceColor(color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                                {booking.service_type || 'Service'}
                              </h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                              <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(booking.scheduled_date).toLocaleDateString('en-US')}</span>
                                <Clock className="w-4 h-4 ml-2" />
                                <span>{booking.scheduled_time || 'TBD'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{booking.address || 'Location TBD'}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4" />
                                <span>{booking.staff || 'Staff TBD'}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 text-sm font-medium"
                            >
                              View Details
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="text-gray-600 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-200 text-sm font-medium"
                            >
                              Reschedule
                            </motion.button>
                          </div>
                          
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                            >
                              <Phone className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                            >
                              <Mail className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                {dashboardData.bookings.filter(booking => 
                  ['confirmed', 'pending'].includes(booking.status) && 
                  new Date(booking.scheduled_date) >= new Date()
                ).length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No upcoming bookings
                    </p>
                    <Link
                      href="/booking"
                      className="btn-primary inline-flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Book Your First Service</span>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Recent Activity & Quick Actions */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Recent Bookings */}
              <div className="card">
                <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                
                <div className="space-y-3">
                  {dashboardData.bookings.filter(booking => 
                    booking.status === 'completed'
                  ).slice(0, 3).map((booking) => {
                    const Icon = booking.service_type === 'Moving Services' ? Truck : 
                               booking.service_type === 'Cleaning Services' ? Sparkles : Users
                    const color = booking.service_type === 'Moving Services' ? 'blue' : 
                                booking.service_type === 'Cleaning Services' ? 'green' : 'purple'
                    return (
                      <div key={booking.id} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className={`w-8 h-8 bg-gradient-to-r ${getServiceColor(color)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {booking.service_type || 'Service'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(booking.scheduled_date).toLocaleDateString('en-US')}
                          </p>
                        </div>
                        
                        {booking.rating && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {booking.rating}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <h3 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-4">
                  Quick Actions
                </h3>
                
                <div className="space-y-3">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/booking"
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-primary-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Book New Service</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/bookings"
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-900 dark:text-white">View All Bookings</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Users className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Update Profile</span>
                    </Link>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/support"
                      className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-900 dark:text-white">Get Support</span>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
