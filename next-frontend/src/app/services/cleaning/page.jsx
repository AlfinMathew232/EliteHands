'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Sparkles, 
  Home, 
  Building, 
  Shield, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight,
  Calculator,
  Leaf,
  Users,
  Award
} from 'lucide-react'
import Link from 'next/link'

const cleaningServices = [
  {
    title: 'Residential Cleaning',
    description: 'Complete home cleaning services for houses and apartments.',
    features: ['Deep cleaning', 'Regular maintenance', 'Move-in/out cleaning', 'Post-construction cleanup'],
    price: 'Starting at $120',
    popular: true
  },
  {
    title: 'Commercial Cleaning',
    description: 'Professional office and business cleaning solutions.',
    features: ['Daily office cleaning', 'Floor maintenance', 'Restroom sanitization', 'Window cleaning'],
    price: 'Starting at $200',
    popular: false
  },
  {
    title: 'Specialized Cleaning',
    description: 'Carpet, upholstery, and specialized surface cleaning.',
    features: ['Carpet deep cleaning', 'Upholstery care', 'Tile & grout cleaning', 'Pressure washing'],
    price: 'Custom quote',
    popular: false
  }
]

const cleaningProcess = [
  {
    step: 1,
    title: 'Assessment',
    description: 'We evaluate your space and cleaning needs',
    icon: Home
  },
  {
    step: 2,
    title: 'Planning',
    description: 'Custom cleaning plan tailored to your requirements',
    icon: Users
  },
  {
    step: 3,
    title: 'Execution',
    description: 'Professional cleaning with eco-friendly products',
    icon: Sparkles
  },
  {
    step: 4,
    title: 'Quality Check',
    description: 'Final inspection to ensure perfect results',
    icon: Award
  }
]

const whyChooseUs = [
  {
    icon: Leaf,
    title: 'Eco-Friendly Products',
    description: 'Safe, non-toxic cleaning products that protect your family and environment.'
  },
  {
    icon: Shield,
    title: 'Bonded & Insured',
    description: 'Fully licensed, bonded, and insured for your peace of mind.'
  },
  {
    icon: Users,
    title: 'Trained Professionals',
    description: 'Background-checked staff with extensive cleaning expertise.'
  },
  {
    icon: Star,
    title: 'Satisfaction Guarantee',
    description: 'We guarantee your satisfaction or we\'ll return to make it right.'
  }
]

export default function CleaningServicesPage() {
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [servicesRef, servicesInView] = useInView({ threshold: 0.1, triggerOnce: true })
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
      <section ref={heroRef} className="py-20 bg-gradient-to-br from-green-50 via-white to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.div variants={itemVariants} className="flex items-center space-x-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-green-600 font-semibold">Cleaning Services</span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6"
              >
                Professional <span className="gradient-text">Cleaning</span> Services
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                Transform your space with Canada's most trusted cleaning professionals. 
                From regular maintenance to deep cleaning, we deliver spotless results every time.
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
                    href="/booking/cleaning"
                    className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2"
                  >
                    <span>Book Now</span>
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
                  <Leaf className="w-5 h-5 text-green-500" />
                  <span>Eco-Friendly</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-500" />
                  <span>Bonded & Insured</span>
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
              <div className="aspect-square bg-gradient-to-br from-green-400 to-green-600 rounded-3xl p-8 text-white">
                <div className="h-full flex flex-col justify-center items-center text-center space-y-6">
                  <Sparkles className="w-24 h-24" />
                  <h3 className="text-2xl font-bold">Spotless Results</h3>
                  <p className="text-green-100">Professional cleaning with eco-friendly products</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 w-full">
                    <div className="text-3xl font-bold">99.8%</div>
                    <div className="text-green-100">Customer Satisfaction Rate</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-20 bg-white dark:bg-gray-900">
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
              Cleaning <span className="gradient-text">Solutions</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              From residential homes to commercial spaces, we provide comprehensive 
              cleaning solutions tailored to your specific needs.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cleaningServices.map((service, index) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                initial="hidden"
                animate={servicesInView ? "visible" : "hidden"}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`card h-full relative ${service.popular ? 'ring-2 ring-green-500' : ''}`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-2xl font-heading font-bold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {service.description}
                  </p>
                  <div className="text-3xl font-bold text-green-600 mb-6">
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
                    href="/booking/cleaning"
                    className={`w-full inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      service.popular 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white'
                    }`}
                  >
                    <span>Select Plan</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cleaning Process */}
      <section ref={processRef} className="py-20 bg-gray-50 dark:bg-gray-800">
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
              Our <span className="gradient-text">Process</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              We follow a systematic approach to ensure consistent, high-quality results every time.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cleaningProcess.map((step, index) => {
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
                  {index < cleaningProcess.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-green-200 dark:bg-green-800 transform translate-x-4"></div>
                  )}
                  
                  <div className="relative">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                      <Icon className="w-8 h-8 text-white" />
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-green-500 font-bold text-sm">
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
      <section ref={whyRef} className="py-20 bg-white dark:bg-gray-900">
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
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
              Ready for a Spotless Space?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Experience the difference professional cleaning makes. Book your service today!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/booking/cleaning"
                  className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Book Cleaning Service</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/contact"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-green-600 transition-all duration-300"
                >
                  Get Free Quote
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
