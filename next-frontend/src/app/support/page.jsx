'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  HelpCircle,
  FileText,
  Users,
  Star,
  ArrowRight,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

const faqData = [
  {
    question: "How do I book a service?",
    answer: "You can book a service by clicking the 'Book New Service' button on your dashboard or navigating to the booking page. Select your service type, choose a date and time, and complete the booking form."
  },
  {
    question: "Can I reschedule my booking?",
    answer: "Yes, you can reschedule your booking up to 24 hours before the scheduled time. Go to your bookings page and click the 'Reschedule' button on any pending booking."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, debit cards, and digital wallets including PayPal, Apple Pay, and Google Pay. Payment is processed securely at the time of booking."
  },
  {
    question: "What if I need to cancel my booking?",
    answer: "You can cancel your booking up to 24 hours before the scheduled time for a full refund. Cancellations within 24 hours may incur a cancellation fee."
  },
  {
    question: "How do I contact my service provider?",
    answer: "You can contact your service provider through the messaging system in your booking details, or call our support team who will connect you directly."
  },
  {
    question: "What areas do you serve?",
    answer: "We currently serve all major Canadian cities including Toronto, Vancouver, Montreal, Calgary, Edmonton, Ottawa, and surrounding areas. Check our service areas page for complete coverage."
  }
]

const supportOptions = [
  {
    title: "Live Chat",
    description: "Get instant help from our support team",
    icon: MessageCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900",
    href: "#"
  },
  {
    title: "Phone Support",
    description: "Call us directly for immediate assistance",
    icon: Phone,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900",
    href: "tel:1-800-ELITE-HANDS"
  },
  {
    title: "Email Support",
    description: "Send us a detailed message",
    icon: Mail,
    color: "text-purple-600",
    bgColor: "bg-purple-100 dark:bg-purple-900",
    href: "mailto:support@elitehands.ca"
  },
  {
    title: "FAQ",
    description: "Find answers to common questions",
    icon: HelpCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-100 dark:bg-orange-900",
    href: "/faq"
  }
]

export default function SupportPage() {
  const [supportRef, supportInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [expandedFaq, setExpandedFaq] = useState(null)

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

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          ref={supportRef}
          variants={containerVariants}
          initial="hidden"
          animate={supportInView ? "visible" : "hidden"}
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h1 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-4">
              Support Center
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're here to help you get the most out of EliteHands. Choose the best way to reach us.
            </p>
          </motion.div>

          {/* Contact Information */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="card text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Available 24/7</p>
              <a 
                href="tel:1-800-ELITE-HANDS" 
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                1-800-ELITE-HANDS
              </a>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Response within 2 hours</p>
              <a 
                href="mailto:support@elitehands.ca" 
                className="text-green-600 dark:text-green-400 font-medium hover:underline"
              >
                support@elitehands.ca
              </a>
            </div>

            <div className="card text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Business Hours</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Monday - Friday</p>
              <p className="text-gray-900 dark:text-white font-medium">8:00 AM - 8:00 PM EST</p>
            </div>
          </motion.div>

          {/* Support Options */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6 text-center">
              How can we help you?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportOptions.map((option, index) => {
                const Icon = option.icon
                return (
                  <motion.div
                    key={option.title}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="card hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => option.href !== '#' && window.open(option.href, '_blank')}
                  >
                    <div className={`w-12 h-12 ${option.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${option.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {option.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {option.description}
                    </p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div variants={itemVariants} className="mb-12">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {faqData.map((faq, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.01 }}
                  className="card cursor-pointer"
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {faq.question}
                    </h3>
                    <motion.div
                      animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </motion.div>
                  </div>
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: expandedFaq === index ? 'auto' : 0,
                      opacity: expandedFaq === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-600 dark:text-gray-300 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      {faq.answer}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Additional Resources */}
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Still need help?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Us</span>
              </Link>
              <Link
                href="/faq"
                className="btn-outline inline-flex items-center space-x-2"
              >
                <HelpCircle className="w-4 h-4" />
                <span>View All FAQs</span>
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 