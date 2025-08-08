'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Truck, 
  Sparkles, 
  Calendar,
  ArrowRight,
  CheckCircle,
  MapPin,
  Clock,
  User,
  Phone,
  Mail
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const services = [
  {
    id: 'moving',
    title: 'Moving Services',
    description: 'Professional residential and commercial moving',
    icon: Truck,
    color: 'from-blue-500 to-blue-600',
    href: '/booking/moving',
    features: ['Packing & Unpacking', 'Furniture Assembly', 'Storage Solutions']
  },
  {
    id: 'cleaning',
    title: 'Cleaning Services',
    description: 'Deep cleaning and maintenance services',
    icon: Sparkles,
    color: 'from-green-500 to-green-600',
    href: '/booking/cleaning',
    features: ['Deep Cleaning', 'Regular Maintenance', 'Eco-Friendly Products']
  },
  {
    id: 'events',
    title: 'Event Services',
    description: 'Complete event planning and coordination',
    icon: Calendar,
    color: 'from-purple-500 to-purple-600',
    href: '/booking/events',
    features: ['Event Planning', 'Setup & Breakdown', 'Catering Support']
  }
]

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState('')

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Book Your <span className="gradient-text">Service</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Choose from our premium services and get started with instant booking and real-time availability.
            </p>
          </motion.div>

          {/* Service Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="card h-full relative group cursor-pointer"
                  onClick={() => setSelectedService(service.id)}
                >
                  <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${service.color}`}></div>
                  
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {service.description}
                    </p>

                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        href={service.href}
                        className={`inline-flex items-center space-x-2 bg-gradient-to-r ${service.color} text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300`}
                      >
                        <span>Book Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Contact */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-4">
                Need Help Choosing?
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Our experts are here to help you select the perfect service for your needs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="tel:1-800-354-8342"
                className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Phone className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Call Us</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">1-800-ELITE-HANDS</div>
                </div>
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="mailto:hello@elitehands.ca"
                className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Email Us</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">hello@elitehands.ca</div>
                </div>
              </motion.a>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/contact"
                  className="flex items-center space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Contact Form</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Get personalized help</div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
