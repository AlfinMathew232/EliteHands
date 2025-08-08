'use client'

import { motion } from 'framer-motion'
import { FileText, Shield, AlertCircle } from 'lucide-react'

const sections = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    content: `By accessing and using EliteHands services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
  },
  {
    id: 'services',
    title: '2. Service Description',
    content: `EliteHands provides premium moving, cleaning, and event services across Canada. Our services include but are not limited to:
    
    • Residential and commercial moving services
    • Professional cleaning and maintenance services  
    • Event planning, coordination, and support services
    • Related logistics and support services
    
    Service availability may vary by location and is subject to scheduling and resource availability.`
  },
  {
    id: 'booking',
    title: '3. Booking and Scheduling',
    content: `All service bookings are subject to availability and confirmation. By making a booking, you agree to:
    
    • Provide accurate and complete information
    • Be present or have an authorized representative present during service
    • Provide safe and reasonable access to the service location
    • Pay all fees as agreed upon booking confirmation
    
    We reserve the right to refuse service or cancel bookings at our discretion.`
  },
  {
    id: 'payment',
    title: '4. Payment Terms',
    content: `Payment terms vary by service type:
    
    • Payment is typically due upon completion of service
    • Some services may require a deposit or advance payment
    • We accept major credit cards, debit cards, e-transfers, and cash
    • Late payment may result in additional fees
    • Disputed charges must be reported within 30 days
    
    All prices are in Canadian dollars and include applicable taxes unless otherwise specified.`
  },
  {
    id: 'cancellation',
    title: '5. Cancellation and Rescheduling',
    content: `Cancellation and rescheduling policies:
    
    • Cancellations must be made at least 24 hours in advance
    • Cancellations with less than 24 hours notice may incur fees
    • Rescheduling is subject to availability
    • No-shows will be charged the full service fee
    • Weather-related cancellations will be rescheduled at no additional charge
    
    Emergency cancellations will be handled on a case-by-case basis.`
  },
  {
    id: 'liability',
    title: '6. Liability and Insurance',
    content: `EliteHands carries comprehensive liability insurance for all services. However:
    
    • Our liability is limited to the value of the service provided
    • Customers are responsible for securing valuable items
    • Pre-existing damage must be reported before service begins
    • Claims must be reported within 48 hours of service completion
    • We are not liable for damage due to customer negligence or failure to follow instructions
    
    Detailed insurance information is available upon request.`
  },
  {
    id: 'privacy',
    title: '7. Privacy and Data Protection',
    content: `We are committed to protecting your privacy:
    
    • Personal information is collected only as necessary for service delivery
    • Information is not shared with third parties without consent
    • Data is stored securely and in compliance with Canadian privacy laws
    • You may request access to or deletion of your personal data
    • Cookies and tracking technologies may be used on our website
    
    See our Privacy Policy for complete details.`
  },
  {
    id: 'conduct',
    title: '8. Customer Conduct',
    content: `Customers agree to:
    
    • Treat our staff with respect and professionalism
    • Provide a safe working environment
    • Not interfere with service delivery
    • Report any concerns promptly and professionally
    • Comply with all applicable laws and regulations
    
    We reserve the right to terminate service for inappropriate conduct.`
  },
  {
    id: 'intellectual',
    title: '9. Intellectual Property',
    content: `All content on our website and marketing materials is protected by copyright and other intellectual property laws. You may not:
    
    • Copy, reproduce, or distribute our content without permission
    • Use our trademarks or branding without authorization
    • Reverse engineer or attempt to access our proprietary systems
    • Create derivative works based on our content
    
    All rights are reserved by EliteHands.`
  },
  {
    id: 'modifications',
    title: '10. Modifications to Terms',
    content: `We reserve the right to modify these terms at any time. Changes will be:
    
    • Posted on our website with the effective date
    • Communicated to active customers via email when material changes occur
    • Effective immediately upon posting unless otherwise specified
    
    Continued use of our services after changes constitutes acceptance of the new terms.`
  },
  {
    id: 'governing',
    title: '11. Governing Law',
    content: `These terms are governed by the laws of Canada and the province in which services are provided. Any disputes will be resolved through:
    
    • Good faith negotiation as the first step
    • Mediation if negotiation is unsuccessful
    • Binding arbitration if mediation fails
    • Courts of competent jurisdiction as a last resort
    
    You agree to the jurisdiction of Canadian courts for any legal proceedings.`
  },
  {
    id: 'contact',
    title: '12. Contact Information',
    content: `For questions about these terms or our services, contact us:
    
    • Phone: 1-800-ELITE-HANDS (1-800-354-8342)
    • Email: legal@elitehands.ca
    • Mail: EliteHands Legal Department, [Address]
    • Website: www.elitehands.ca/contact
    
    We will respond to inquiries within 2 business days.`
  }
]

export default function TermsPage() {
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

  return (
    <div className="min-h-screen pt-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Terms & <span className="gradient-text">Conditions</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              Please read these terms and conditions carefully before using our services.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <AlertCircle className="w-4 h-4" />
              <span>Last updated: December 2024</span>
            </div>
          </motion.div>

          {/* Important Notice */}
          <motion.div variants={itemVariants} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-12">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Important Legal Agreement
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  These Terms and Conditions constitute a legally binding agreement between you and EliteHands. 
                  By using our services, you acknowledge that you have read, understood, and agree to be bound by these terms. 
                  If you do not agree with any part of these terms, please do not use our services.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Terms Content */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <motion.div
                key={section.id}
                variants={itemVariants}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {section.title}
                </h2>
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer Notice */}
          <motion.div variants={itemVariants} className="mt-16 bg-gray-100 dark:bg-gray-800 rounded-xl p-8 text-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Questions About These Terms?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              If you have any questions about these Terms and Conditions, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:legal@elitehands.ca"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Email Legal Team
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/contact"
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
              >
                Contact Us
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
