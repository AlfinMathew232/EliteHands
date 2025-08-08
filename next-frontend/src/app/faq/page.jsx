'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react'

const faqCategories = [
  {
    id: 'general',
    title: 'General Questions',
    faqs: [
      {
        question: 'What services does EliteHands offer?',
        answer: 'EliteHands provides premium moving, cleaning, and event services across Canada. Our moving services include residential and commercial relocations, packing, and storage. Our cleaning services cover deep cleaning, regular maintenance, and specialized cleaning. Our event services include planning, setup, coordination, and cleanup for various events.'
      },
      {
        question: 'Which areas do you serve?',
        answer: 'We currently serve major cities across Canada including Toronto, Vancouver, Montreal, Calgary, Edmonton, Ottawa, and Winnipeg. We also provide services to surrounding metropolitan areas. Contact us to confirm service availability in your specific location.'
      },
      {
        question: 'How do I get a quote?',
        answer: 'You can get a quote through our online booking system, by calling us at 1-800-ELITE-HANDS, or by filling out our contact form. For accurate pricing, we may need to conduct a virtual or in-person assessment depending on the service requested.'
      },
      {
        question: 'Are you licensed and insured?',
        answer: 'Yes, EliteHands is fully licensed and insured. We carry comprehensive liability insurance and our team members are bonded. All our services comply with local and provincial regulations.'
      }
    ]
  },
  {
    id: 'moving',
    title: 'Moving Services',
    faqs: [
      {
        question: 'How far in advance should I book my move?',
        answer: 'We recommend booking your move at least 2-4 weeks in advance, especially during peak moving season (May-September). However, we can often accommodate last-minute moves based on availability.'
      },
      {
        question: 'What is included in your moving service?',
        answer: 'Our standard moving service includes professional movers, moving truck, basic tools and equipment, furniture padding, and basic liability coverage. Additional services like packing, unpacking, and storage are available for an extra fee.'
      },
      {
        question: 'Do you provide packing materials?',
        answer: 'Yes, we offer a full range of packing materials including boxes, tape, bubble wrap, packing paper, and specialty boxes for fragile items. You can purchase these separately or as part of our full-service packing option.'
      },
      {
        question: 'What items cannot be moved?',
        answer: 'We cannot move hazardous materials, perishable food items, plants, pets, personal documents, jewelry, or items of extraordinary value. We provide a complete list of restricted items during the booking process.'
      }
    ]
  },
  {
    id: 'cleaning',
    title: 'Cleaning Services',
    faqs: [
      {
        question: 'What does a deep cleaning service include?',
        answer: 'Our deep cleaning service includes thorough cleaning of all rooms, inside appliances, baseboards, light fixtures, windows, and detailed bathroom and kitchen cleaning. It typically takes 4-8 hours depending on home size.'
      },
      {
        question: 'Do you bring your own cleaning supplies?',
        answer: 'Yes, we bring all necessary cleaning supplies and equipment. We use eco-friendly, non-toxic products by default. If you have specific product preferences or allergies, please let us know in advance.'
      },
      {
        question: 'How often should I schedule regular cleaning?',
        answer: 'This depends on your lifestyle and preferences. Most clients choose weekly, bi-weekly, or monthly service. We can help you determine the best frequency based on your home size, family size, and cleanliness preferences.'
      },
      {
        question: 'What if I\'m not satisfied with the cleaning?',
        answer: 'We offer a 24-hour satisfaction guarantee. If you\'re not completely satisfied with our service, contact us within 24 hours and we\'ll return to address any issues at no additional charge.'
      }
    ]
  },
  {
    id: 'events',
    title: 'Event Services',
    faqs: [
      {
        question: 'What types of events do you handle?',
        answer: 'We handle a wide variety of events including corporate meetings, weddings, birthday parties, holiday celebrations, fundraisers, and community events. Our services are scalable from intimate gatherings to large celebrations.'
      },
      {
        question: 'How far in advance should I book event services?',
        answer: 'For best availability, we recommend booking 4-8 weeks in advance for small events and 2-3 months for large events or during peak seasons. However, we can often accommodate shorter notice based on availability.'
      },
      {
        question: 'Do you provide catering services?',
        answer: 'While we don\'t provide catering directly, we work with trusted catering partners and can coordinate catering services as part of our event planning. We can also provide serving staff and cleanup services.'
      },
      {
        question: 'Can you help with venue selection?',
        answer: 'Yes, our event planning team can assist with venue selection based on your event type, guest count, budget, and preferences. We have relationships with various venues across our service areas.'
      }
    ]
  },
  {
    id: 'booking',
    title: 'Booking & Payment',
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, e-transfers, and cash. Payment is typically due upon completion of service, though we may require a deposit for large jobs.'
      },
      {
        question: 'Can I reschedule or cancel my booking?',
        answer: 'Yes, you can reschedule or cancel your booking. We require at least 24 hours notice for cancellations to avoid cancellation fees. Rescheduling is subject to availability and may incur additional charges depending on timing.'
      },
      {
        question: 'Do you offer any guarantees?',
        answer: 'Yes, we stand behind our work with various guarantees depending on the service. All services come with our satisfaction guarantee, and we carry comprehensive insurance for your peace of mind.'
      },
      {
        question: 'How do I track my service request?',
        answer: 'Once you book a service, you\'ll receive a confirmation email with tracking information. You can also log into your customer dashboard to view booking details, track progress, and communicate with your service team.'
      }
    ]
  }
]

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('general')
  const [openFAQ, setOpenFAQ] = useState(null)

  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  const toggleFAQ = (categoryId, faqIndex) => {
    const faqId = `${categoryId}-${faqIndex}`
    setOpenFAQ(openFAQ === faqId ? null : faqId)
  }

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Find answers to common questions about our services, booking process, and policies.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search frequently asked questions..."
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Category Navigation */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Categories
                </h3>
                <nav className="space-y-2">
                  {faqCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setActiveCategory(category.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeCategory === category.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category.title}
                    </button>
                  ))}
                </nav>
              </div>
            </motion.div>

            {/* FAQ Content */}
            <motion.div variants={itemVariants} className="lg:col-span-3">
              <div className="space-y-6">
                {(searchTerm ? filteredFAQs : faqCategories.filter(cat => cat.id === activeCategory)).map((category) => (
                  <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                      {category.title}
                    </h2>
                    <div className="space-y-4">
                      {category.faqs.map((faq, index) => {
                        const faqId = `${category.id}-${index}`
                        const isOpen = openFAQ === faqId
                        
                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                            <button
                              onClick={() => toggleFAQ(category.id, index)}
                              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-lg"
                            >
                              <span className="font-medium text-gray-900 dark:text-white pr-4">
                                {faq.question}
                              </span>
                              {isOpen ? (
                                <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                              )}
                            </button>
                            
                            <AnimatePresence>
                              {isOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3, ease: "easeInOut" }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-6 pb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Contact Section */}
              <motion.div variants={itemVariants} className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-8 text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
                <p className="mb-6 opacity-90">
                  Can't find the answer you're looking for? Our friendly customer support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="tel:1-800-354-8342"
                    className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                  >
                    Call 1-800-ELITE-HANDS
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
        </motion.div>
      </div>
    </div>
  )
}
