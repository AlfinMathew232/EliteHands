'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Calendar, 
  Heart, 
  Building2, 
  PartyPopper, 
  Shield, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight,
  Calculator,
  Users,
  Music,
  Camera,
  Utensils
} from 'lucide-react'
import Link from 'next/link'

const eventServices = [
  {
    title: 'Wedding Events',
    description: 'Complete wedding planning and coordination services.',
    features: ['Venue setup & decoration', 'Catering coordination', 'Photography assistance', 'Timeline management'],
    price: 'Starting at $1,200',
    popular: true,
    icon: Heart
  },
  {
    title: 'Corporate Events',
    description: 'Professional business events and conferences.',
    features: ['Meeting setup', 'AV equipment coordination', 'Catering services', 'Registration management'],
    price: 'Starting at $800',
    popular: false,
    icon: Building2
  },
  {
    title: 'Private Parties',
    description: 'Birthday parties, anniversaries, and celebrations.',
    features: ['Theme decoration', 'Entertainment coordination', 'Food & beverage service', 'Cleanup service'],
    price: 'Starting at $500',
    popular: false,
    icon: PartyPopper
  }
]

const eventTypes = [
  {
    name: 'Weddings',
    description: 'Your perfect day, flawlessly executed',
    icon: Heart,
    color: 'from-pink-500 to-rose-500',
    services: ['Ceremony setup', 'Reception coordination', 'Vendor management', 'Day-of coordination']
  },
  {
    name: 'Corporate',
    description: 'Professional events that impress',
    icon: Building2,
    color: 'from-blue-500 to-indigo-500',
    services: ['Conference planning', 'Team building events', 'Product launches', 'Board meetings']
  },
  {
    name: 'Social Events',
    description: 'Memorable celebrations for every occasion',
    icon: PartyPopper,
    color: 'from-purple-500 to-violet-500',
    services: ['Birthday parties', 'Anniversary celebrations', 'Holiday parties', 'Graduation events']
  },
  {
    name: 'Entertainment',
    description: 'Music, shows, and live performances',
    icon: Music,
    color: 'from-green-500 to-emerald-500',
    services: ['Concert setup', 'DJ coordination', 'Live band management', 'Sound & lighting']
  }
]

const planningProcess = [
  {
    step: 1,
    title: 'Consultation',
    description: 'We discuss your vision, budget, and requirements',
    icon: Users
  },
  {
    step: 2,
    title: 'Planning',
    description: 'Detailed event planning and vendor coordination',
    icon: Calendar
  },
  {
    step: 3,
    title: 'Setup',
    description: 'Professional setup and decoration on event day',
    icon: Building2
  },
  {
    step: 4,
    title: 'Execution',
    description: 'Seamless event management and coordination',
    icon: Star
  }
]

const whyChooseUs = [
  {
    icon: Users,
    title: 'Expert Coordinators',
    description: 'Experienced event professionals who bring your vision to life.'
  },
  {
    icon: Shield,
    title: 'Fully Insured',
    description: 'Complete insurance coverage for all events and activities.'
  },
  {
    icon: Camera,
    title: 'Vendor Network',
    description: 'Extensive network of trusted vendors and suppliers.'
  },
  {
    icon: Star,
    title: 'Flawless Execution',
    description: 'Meticulous attention to detail ensures perfect events.'
  }
]

export default function EventServicesPage() {
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [servicesRef, servicesInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [typesRef, typesInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [processRef, processInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [whyRef, whyInView] = useInView({ threshold: 0.1, triggerOnce: true })

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
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section ref={heroRef} className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.div variants={itemVariants} className="flex items-center space-x-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <span className="text-purple-600 font-semibold">Event Services</span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6"
              >
                Unforgettable <span className="gradient-text">Events</span> Made Simple
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                From intimate gatherings to grand celebrations, we create memorable experiences 
                that exceed expectations. Let us handle every detail while you enjoy your special moment.
              </motion.p>

              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/booking/events"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-medium text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2"
                  >
                    <span>Plan Your Event</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button className="btn-outline text-lg px-8 py-4 flex items-center space-x-2">
                    <Calculator className="w-5 h-5" />
                    <span>Get Quote</span>
                  </button>
                </motion.div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="flex items-center space-x-8 mt-8 text-sm text-gray-500 dark:text-gray-400"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Fully Insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>On-Time Execution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>5-Star Rated</span>
                </div>
              </motion.div>
            </div>

            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <div className="aspect-square bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl p-8 text-white">
                <div className="h-full flex flex-col justify-center items-center text-center space-y-6">
                  <Calendar className="w-24 h-24" />
                  <h3 className="text-2xl font-bold">Perfect Events</h3>
                  <p className="text-purple-100">Every detail planned to perfection</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 w-full">
                    <div className="text-3xl font-bold">500+</div>
                    <div className="text-purple-100">Successful Events This Year</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Event Types */}
      <section ref={typesRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={typesInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6"
            >
              Event <span className="gradient-text">Specialties</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              We specialize in a wide range of events, each tailored to create 
              unique and memorable experiences.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {eventTypes.map((type, index) => {
              const Icon = type.icon
              return (
                <motion.div
                  key={type.name}
                  variants={itemVariants}
                  initial="hidden"
                  animate={typesInView ? "visible" : "hidden"}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="card text-center"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${type.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {type.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {type.description}
                  </p>
                  
                  <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                    {type.services.map((service, idx) => (
                      <li key={idx} className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>{service}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={servicesInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6"
            >
              Event <span className="gradient-text">Packages</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Choose from our comprehensive event packages designed to meet 
              different needs and budgets.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {eventServices.map((service, index) => {
              const Icon = service.icon
              return (
                <motion.div
                  key={service.title}
                  variants={itemVariants}
                  initial="hidden"
                  animate={servicesInView ? "visible" : "hidden"}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className={`card h-full relative ${service.popular ? 'ring-2 ring-purple-500' : ''}`}
                >
                  {service.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {service.description}
                    </p>
                    <div className="text-3xl font-bold text-purple-600 mb-6">
                      {service.price}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-auto"
                  >
                    <Link
                      href="/booking/events"
                      className={`w-full inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                        service.popular 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' 
                          : 'border-2 border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white'
                      }`}
                    >
                      <span>Select Package</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </motion.div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Planning Process */}
      <section ref={processRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={processInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6"
            >
              Planning <span className="gradient-text">Process</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Our systematic approach ensures every event is perfectly planned and executed.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {planningProcess.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  variants={itemVariants}
                  initial="hidden"
                  animate={processInView ? "visible" : "hidden"}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center relative"
                >
                  {index < planningProcess.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-purple-200 dark:bg-purple-800 transform translate-x-4"></div>
                  )}
                  
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                      <Icon className="w-8 h-8 text-white" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-purple-500 font-bold text-sm">
                        {step.step}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section ref={whyRef} className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={whyInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6"
            >
              Why Choose <span className="gradient-text">EliteHands</span>?
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  variants={itemVariants}
                  initial="hidden"
                  animate={whyInView ? "visible" : "hidden"}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-purple-700 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
              Ready to Create Magic?
            </h2>
            <p className="text-xl mb-8 text-purple-100">
              Let us turn your vision into an unforgettable experience. Start planning your perfect event today!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/booking/events"
                  className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Start Planning</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/contact"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-purple-600 transition-all duration-300"
                >
                  Consultation Call
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
