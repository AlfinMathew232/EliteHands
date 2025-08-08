'use client'

import { motion } from 'framer-motion'
import { Shield, Eye, Lock, Database, Mail } from 'lucide-react'

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction',
    icon: Shield,
    content: `EliteHands ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services or visit our website.

This policy applies to all information collected through our services, website, mobile applications, and any related services, sales, marketing, or events.`
  },
  {
    id: 'information-collected',
    title: '2. Information We Collect',
    icon: Database,
    content: `We collect information in several ways:

Personal Information:
• Name, email address, phone number
• Billing and shipping addresses
• Payment information (processed securely by third-party providers)
• Service preferences and special requirements

Service Information:
• Service location addresses
• Service dates and times
• Special instructions or requests
• Service history and preferences

Technical Information:
• IP address and device information
• Browser type and version
• Website usage data and analytics
• Cookies and similar tracking technologies`
  },
  {
    id: 'how-we-use',
    title: '3. How We Use Your Information',
    icon: Eye,
    content: `We use your information to:

Service Delivery:
• Schedule and provide requested services
• Communicate about appointments and service details
• Process payments and manage billing
• Provide customer support

Business Operations:
• Improve our services and website
• Send service updates and promotional communications
• Conduct market research and analytics
• Comply with legal obligations

Marketing (with your consent):
• Send newsletters and promotional offers
• Personalize your experience
• Recommend relevant services`
  },
  {
    id: 'information-sharing',
    title: '4. Information Sharing',
    icon: Lock,
    content: `We do not sell your personal information. We may share information with:

Service Providers:
• Payment processors for billing
• Background check companies for staff screening
• Technology providers for website and app functionality
• Marketing platforms (with your consent)

Legal Requirements:
• When required by law or legal process
• To protect our rights and safety
• To prevent fraud or illegal activities
• In connection with business transfers

With Your Consent:
• When you explicitly agree to sharing
• For specific purposes you've authorized`
  },
  {
    id: 'data-security',
    title: '5. Data Security',
    icon: Shield,
    content: `We implement appropriate security measures to protect your information:

Technical Safeguards:
• Encryption of sensitive data in transit and at rest
• Secure servers and databases
• Regular security audits and updates
• Access controls and authentication

Operational Safeguards:
• Employee training on privacy and security
• Background checks for staff with data access
• Incident response procedures
• Regular backup and recovery procedures

However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security.`
  },
  {
    id: 'data-retention',
    title: '6. Data Retention',
    content: `We retain your information for as long as necessary to:

• Provide ongoing services
• Comply with legal obligations
• Resolve disputes and enforce agreements
• Maintain business records

Specific retention periods:
• Active customer data: Retained while account is active
• Service history: 7 years for business records
• Marketing data: Until you opt out
• Website analytics: 26 months

You may request deletion of your data subject to legal and business requirements.`
  },
  {
    id: 'your-rights',
    title: '7. Your Privacy Rights',
    content: `Under Canadian privacy laws, you have the right to:

Access and Portability:
• Request a copy of your personal information
• Receive your data in a portable format
• Know what information we have about you

Correction and Updates:
• Correct inaccurate information
• Update your preferences
• Modify your contact information

Deletion and Restriction:
• Request deletion of your information
• Restrict processing in certain circumstances
• Withdraw consent where applicable

To exercise these rights, contact us using the information provided below.`
  },
  {
    id: 'cookies',
    title: '8. Cookies and Tracking',
    content: `Our website uses cookies and similar technologies:

Essential Cookies:
• Required for website functionality
• Remember your preferences
• Maintain security

Analytics Cookies:
• Track website usage and performance
• Help us improve user experience
• Generate usage statistics

Marketing Cookies (with consent):
• Personalize advertisements
• Track campaign effectiveness
• Provide relevant content

You can control cookies through your browser settings, but some website features may not function properly if cookies are disabled.`
  },
  {
    id: 'third-party',
    title: '9. Third-Party Services',
    content: `Our website and services may contain links to third-party websites or integrate with third-party services:

Payment Processors:
• Stripe, PayPal, and other payment providers
• Subject to their own privacy policies
• We do not store full payment card information

Analytics Services:
• Google Analytics for website usage
• Social media platforms for marketing
• Customer support platforms

We are not responsible for the privacy practices of third-party services. We encourage you to review their privacy policies.`
  },
  {
    id: 'children',
    title: '10. Children\'s Privacy',
    content: `Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.

If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately. We will delete such information from our records.`
  },
  {
    id: 'changes',
    title: '11. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Changes will be:

• Posted on this page with the updated date
• Communicated via email for material changes
• Effective immediately unless otherwise specified

We encourage you to review this policy periodically to stay informed about how we protect your information.`
  },
  {
    id: 'contact',
    title: '12. Contact Information',
    icon: Mail,
    content: `If you have questions about this Privacy Policy or our privacy practices, contact us:

Privacy Officer
EliteHands
Email: privacy@elitehands.ca
Phone: 1-800-ELITE-HANDS (1-800-354-8342)
Mail: [Physical Address]

We will respond to privacy inquiries within 30 days.`
  }
]

export default function PrivacyPage() {
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
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-4">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Lock className="w-4 h-4" />
              <span>Last updated: December 2024</span>
            </div>
          </motion.div>

          {/* Privacy Commitment */}
          <motion.div variants={itemVariants} className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 mb-12">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                  Our Privacy Commitment
                </h3>
                <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                  At EliteHands, we are committed to protecting your privacy and maintaining the confidentiality of your personal information. 
                  We comply with all applicable Canadian privacy laws, including the Personal Information Protection and Electronic Documents Act (PIPEDA).
                </p>
              </div>
            </div>
          </motion.div>

          {/* Privacy Content */}
          <div className="space-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon
              return (
                <motion.div
                  key={section.id}
                  variants={itemVariants}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
                >
                  <div className="flex items-start space-x-4 mb-4">
                    {Icon && (
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Contact Section */}
          <motion.div variants={itemVariants} className="mt-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-4">Privacy Questions?</h3>
            <p className="mb-6 opacity-90">
              If you have any questions about our privacy practices or this policy, we're here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="mailto:privacy@elitehands.ca"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Email Privacy Officer
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="/contact"
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-lg font-medium hover:bg-white/30 transition-colors"
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
