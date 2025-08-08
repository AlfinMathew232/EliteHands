'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Truck, 
  Package, 
  Shield, 
  Clock, 
  Star,
  CheckCircle,
  ArrowRight,
  Calculator,
  MapPin,
  Users
} from 'lucide-react'
import Link from 'next/link'

const movingServices = [
  {
    title: 'Residential Moving',
    description: 'Complete home moving services from apartments to large houses.',
    features: ['Professional packing', 'Furniture disassembly/assembly', 'Fragile item protection', 'Storage solutions'],
    price: 'Starting at $299',
    popular: false
  },
  {
    title: 'Commercial Moving',
    description: 'Office and business relocations with minimal downtime.',
    features: ['After-hours service', 'IT equipment handling', 'Document management', 'Workspace setup'],
    price: 'Starting at $599',
    popular: true
  },
  {
    title: 'Long Distance Moving',
    description: 'Cross-province and cross-country moving services.',
    features: ['GPS tracking', 'Climate-controlled transport', 'Door-to-door service', 'Insurance coverage'],
    price: 'Custom quote',
    popular: false
  }
]

const pricingFactors = [
  { icon: MapPin, title: 'Distance', description: 'Local, long-distance, or cross-country moves' },
  { icon: Package, title: 'Volume', description: 'Number of rooms and items to be moved' },
  { icon: Users, title: 'Services', description: 'Packing, assembly, and additional services' },
  { icon: Clock, title: 'Timeline', description: 'Flexible scheduling and rush services' }
]

const whyChooseUs = [
  {
    icon: Shield,
    title: 'Fully Insured',
    description: 'Comprehensive coverage for your belongings during the entire moving process.'
  },
  {
    icon: Users,
    title: 'Trained Professionals',
    description: 'Experienced movers with proper training and background checks.'
  },
  {
    icon: Truck,
    title: 'Modern Equipment',
    description: 'Well-maintained trucks and professional moving equipment.'
  },
  {
    icon: Star,
    title: '5-Star Service',
    description: 'Consistently rated as the top moving service across Canada.'
  }
]

export default function MovingServicesPage() {
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [servicesRef, servicesInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [pricingRef, pricingInView] = useInView({ threshold: 0.1, triggerOnce: true })
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
      <section ref={heroRef} className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.div variants={itemVariants} className="flex items-center space-x-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-blue-600 font-semibold">Moving Services</span>
              </motion.div>

              <motion.h1 
                variants={itemVariants}
                className="text-4xl md:text-6xl font-heading font-bold text-gray-900 dark:text-white mb-6"
              >
                Professional <span className="gradient-text">Moving</span> Services
              </motion.h1>

              <motion.p 
                variants={itemVariants}
                className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed"
              >
                Stress-free moving with Canada's most trusted professionals. From local moves 
                to cross-country relocations, we handle every detail with care and precision.
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
                    href="/booking/moving"
                    className="btn-primary text-lg px-8 py-4 flex items-center space-x-2"
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
                  <Shield className="w-5 h-5 text-green-500" />
                  <span>Fully Insured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  <span>On-Time Guarantee</span>
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
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl p-8 text-white">
                <div className="h-full flex flex-col justify-center items-center text-center space-y-6">
                  <Truck className="w-24 h-24" />
                  <h3 className="text-2xl font-bold">Ready to Move?</h3>
                  <p className="text-blue-100">Get an instant quote in under 2 minutes</p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 w-full">
                    <div className="text-3xl font-bold">2,500+</div>
                    <div className="text-blue-100">Successful Moves This Year</div>
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
              Moving <span className="gradient-text">Solutions</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Whether you're moving across the street or across the country, 
              we have the perfect solution for your needs.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {movingServices.map((service, index) => (
              <motion.div
                key={service.title}
                variants={itemVariants}
                initial="hidden"
                animate={servicesInView ? "visible" : "hidden"}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`card h-full relative ${service.popular ? 'ring-2 ring-blue-500' : ''}`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
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
                  <div className="text-3xl font-bold text-blue-600 mb-6">
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
                    href="/booking/moving"
                    className={`w-full inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                      service.popular 
                        ? 'bg-blue-500 text-white hover:bg-blue-600' 
                        : 'border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white'
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

      {/* Pricing Factors */}
      <section ref={pricingRef} className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={pricingInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6"
            >
              Transparent <span className="gradient-text">Pricing</span>
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Our pricing is based on several factors to ensure you get the most accurate quote for your move.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingFactors.map((factor, index) => {
              const Icon = factor.icon
              return (
                <motion.div
                  key={factor.title}
                  variants={itemVariants}
                  initial="hidden"
                  animate={pricingInView ? "visible" : "hidden"}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {factor.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {factor.description}
                  </p>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate={pricingInView ? "visible" : "hidden"}
            className="text-center mt-12"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="btn-primary text-lg px-8 py-4 flex items-center space-x-2 mx-auto">
                <Calculator className="w-5 h-5" />
                <span>Calculate Your Moving Cost</span>
              </button>
            </motion.div>
          </motion.div>
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
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
              Ready to Move with Confidence?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Get your free quote today and experience Canada's most trusted moving service.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/booking/moving"
                  className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Book Your Move</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href="/contact"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all duration-300"
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
