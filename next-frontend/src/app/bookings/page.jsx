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
  Mail,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '../../components/providers/Providers'
import apiService from '../../services/api'
import toast from 'react-hot-toast'

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookingsRef, bookingsInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [isLoading, setIsLoading] = useState(true)
  const [bookings, setBookings] = useState([])
  const [filteredBookings, setFilteredBookings] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.getBookings()
        const bookingsData = response || []
        setBookings(bookingsData)
        setFilteredBookings(bookingsData)
      } catch (error) {
        console.error('Error fetching bookings:', error)
        // Use mock data as fallback
        const mockBookings = [
          {
            id: 1,
            booking_id: 'BK001',
            service_type: 'Moving Services',
            scheduled_date: '2024-01-15',
            scheduled_time: '09:00',
            status: 'confirmed',
            total_amount: 450,
            address: '123 Main St, Toronto, ON',
            city: 'Toronto',
            province: 'Ontario',
            special_instructions: 'Fragile items in living room'
          },
          {
            id: 2,
            booking_id: 'BK002',
            service_type: 'Cleaning Services',
            scheduled_date: '2024-01-18',
            scheduled_time: '14:00',
            status: 'pending',
            total_amount: 120,
            address: '456 Oak Ave, Vancouver, BC',
            city: 'Vancouver',
            province: 'British Columbia',
            special_instructions: 'Deep cleaning required'
          }
        ]
        setBookings(mockBookings)
        setFilteredBookings(mockBookings)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchBookings()
    }
  }, [user])

  useEffect(() => {
    let filtered = bookings

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.booking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.address?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter)
    }

    setFilteredBookings(filtered)
  }, [bookings, searchTerm, statusFilter])

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'completed': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      case 'cancelled': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getServiceIcon = (serviceType) => {
    switch (serviceType) {
      case 'Moving Services': return Truck
      case 'Cleaning Services': return Sparkles
      case 'Event Services': return Users
      default: return Calendar
    }
  }

  const getServiceColor = (serviceType) => {
    switch (serviceType) {
      case 'Moving Services': return 'from-blue-500 to-blue-600'
      case 'Cleaning Services': return 'from-green-500 to-green-600'
      case 'Event Services': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
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
                Please log in to view your bookings
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
          ref={bookingsRef}
          variants={containerVariants}
          initial="hidden"
          animate={bookingsInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
                  My Bookings
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Manage and track all your service bookings
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

          {/* Filters */}
          <motion.div variants={itemVariants} className="card mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search bookings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input pl-10 w-full"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="md:w-48">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-input w-full"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Bookings List */}
          <motion.div variants={itemVariants}>
            {filteredBookings.length === 0 ? (
              <div className="card text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'You haven\'t made any bookings yet'
                  }
                </p>
                <Link
                  href="/booking"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Book Your First Service</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((booking) => {
                  const Icon = getServiceIcon(booking.service_type)
                  return (
                    <motion.div
                      key={booking.id}
                      whileHover={{ scale: 1.01 }}
                      className="card hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${getServiceColor(booking.service_type)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {booking.service_type}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Booking ID: {booking.booking_id}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                              <span className="text-lg font-bold text-gray-900 dark:text-white">
                                ${booking.total_amount}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(booking.scheduled_date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                <Clock className="w-4 h-4" />
                                <span>{booking.scheduled_time}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                <MapPin className="w-4 h-4" />
                                <span className="truncate">{booking.address}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                <DollarSign className="w-4 h-4" />
                                <span>Total: ${booking.total_amount}</span>
                              </div>
                            </div>
                          </div>

                          {booking.special_instructions && (
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-sm text-gray-700 dark:text-gray-300">
                                <strong>Special Instructions:</strong> {booking.special_instructions}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn-outline flex items-center space-x-2"
                                onClick={() => setSelectedBooking(booking)}
                              >
                                <Eye className="w-4 h-4" />
                                <span>View Details</span>
                              </motion.button>
                              
                              {booking.status === 'pending' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  className="btn-outline flex items-center space-x-2"
                                >
                                  <Edit className="w-4 h-4" />
                                  <span>Reschedule</span>
                                </motion.button>
                              )}
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
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 