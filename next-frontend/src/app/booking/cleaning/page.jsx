'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail,
  ArrowRight,
  CheckCircle,
  Star,
  DollarSign
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../components/providers/Providers'
import apiService from '../../../services/api'
import toast from 'react-hot-toast'

const cleaningServices = [
  {
    id: 1,
    name: 'Deep Cleaning',
    description: 'Comprehensive cleaning for your entire home',
    duration: '4-6 hours',
    price: 150,
    features: ['Kitchen deep clean', 'Bathroom sanitization', 'Floor care', 'Dust removal'],
    icon: Sparkles,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 2,
    name: 'Regular Maintenance',
    description: 'Weekly or bi-weekly cleaning service',
    duration: '2-3 hours',
    price: 80,
    features: ['Surface cleaning', 'Vacuum & mop', 'Bathroom refresh', 'Kitchen tidy'],
    icon: Sparkles,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 3,
    name: 'Move-in/Move-out',
    description: 'Thorough cleaning for moving transitions',
    duration: '6-8 hours',
    price: 200,
    features: ['Complete home cleaning', 'Appliance cleaning', 'Window cleaning', 'Carpet cleaning'],
    icon: Sparkles,
    color: 'from-purple-500 to-purple-600'
  }
]

export default function CleaningBookingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedService, setSelectedService] = useState(null)
  const [bookingData, setBookingData] = useState({
    service: '',
    date: '',
    time: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
    special_instructions: '',
    contact_name: '',
    contact_phone: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleServiceSelect = (service) => {
    setSelectedService(service)
    setBookingData(prev => ({ ...prev, service: service.id }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please log in to book a service')
      router.push('/login')
      return
    }

    if (!selectedService) {
      toast.error('Please select a service')
      return
    }

    if (!bookingData.date || !bookingData.time || !bookingData.address) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)

    try {
      const bookingPayload = {
        service: selectedService.id,
        scheduled_date: bookingData.date,
        scheduled_time: bookingData.time,
        address: bookingData.address,
        city: bookingData.city,
        province: bookingData.province,
        postal_code: bookingData.postal_code,
        special_instructions: bookingData.special_instructions,
        total_amount: selectedService.price
      }

      await apiService.createBooking(bookingPayload)
      toast.success('Booking created successfully!')
      router.push('/dashboard')
    } catch (error) {
      console.error('Booking error:', error)
      toast.error('Failed to create booking. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Book Cleaning Service
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Choose from our professional cleaning services and schedule your appointment
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Selection */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
                Select Service
              </h2>
              
              <div className="space-y-4">
                {cleaningServices.map((service) => {
                  const Icon = service.icon
                  const isSelected = selectedService?.id === service.id
                  
                  return (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleServiceSelect(service)}
                      className={`card cursor-pointer transition-all duration-300 ${
                        isSelected 
                          ? 'ring-2 ring-green-500 bg-green-50 dark:bg-green-900/20' 
                          : 'hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {service.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-lg font-bold text-green-600">
                                ${service.price}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-300 mb-3">
                            {service.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{service.duration}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>4.8/5</span>
                            </div>
                          </div>
                          
                          <ul className="space-y-1">
                            {service.features.map((feature, index) => (
                              <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {isSelected && (
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Booking Form */}
            <motion.div variants={itemVariants} className="card">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
                Booking Details
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Preferred Date</label>
                    <input
                      type="date"
                      required
                      value={bookingData.date}
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Preferred Time</label>
                    <select
                      required
                      value={bookingData.time}
                      onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select Time</option>
                      <option value="09:00">9:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="12:00">12:00 PM</option>
                      <option value="13:00">1:00 PM</option>
                      <option value="14:00">2:00 PM</option>
                      <option value="15:00">3:00 PM</option>
                      <option value="16:00">4:00 PM</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="form-label">Service Address</label>
                  <textarea
                    required
                    value={bookingData.address}
                    onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                    className="form-input"
                    rows={3}
                    placeholder="Enter your full address"
                  />
                </div>

                {/* City, Province, Postal Code */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="form-label">City</label>
                    <input
                      type="text"
                      value={bookingData.city}
                      onChange={(e) => setBookingData({ ...bookingData, city: e.target.value })}
                      className="form-input"
                      placeholder="City"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Province</label>
                    <select
                      value={bookingData.province}
                      onChange={(e) => setBookingData({ ...bookingData, province: e.target.value })}
                      className="form-input"
                    >
                      <option value="">Select Province</option>
                      <option value="Ontario">Ontario</option>
                      <option value="Quebec">Quebec</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Alberta">Alberta</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="New Brunswick">New Brunswick</option>
                      <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                      <option value="Prince Edward Island">Prince Edward Island</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      value={bookingData.postal_code}
                      onChange={(e) => setBookingData({ ...bookingData, postal_code: e.target.value })}
                      className="form-input"
                      placeholder="A1A 1A1"
                    />
                  </div>
                </div>

                {/* Special Instructions */}
                <div>
                  <label className="form-label">Special Instructions</label>
                  <textarea
                    value={bookingData.special_instructions}
                    onChange={(e) => setBookingData({ ...bookingData, special_instructions: e.target.value })}
                    className="form-input"
                    rows={3}
                    placeholder="Any special requirements or notes..."
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Contact Name</label>
                    <input
                      type="text"
                      value={bookingData.contact_name}
                      onChange={(e) => setBookingData({ ...bookingData, contact_name: e.target.value })}
                      className="form-input"
                      placeholder="Contact person name"
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">Contact Phone</label>
                    <input
                      type="tel"
                      value={bookingData.contact_phone}
                      onChange={(e) => setBookingData({ ...bookingData, contact_phone: e.target.value })}
                      className="form-input"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={isLoading || !selectedService}
                  className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Book Service</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 