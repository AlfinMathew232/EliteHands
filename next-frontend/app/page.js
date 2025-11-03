'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  ArrowRight, 
  Star, 
  Users, 
  Clock, 
  Shield,
  CheckCircle,
  Truck,
  Sparkles,
  Calendar,
  Award,
  MapPin,
  Phone,
  Briefcase,
  Mop
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

const services = [
  {
    id: 'moving',
    title: 'Moving Services',
    description: 'Premium residential and commercial moving services with exceptional care for your belongings.',
    icon: Truck,
    features: ['Professional Packing & Unpacking', 'Furniture Disassembly & Assembly', 'Secure Storage Solutions', 'Comprehensive Insurance Coverage', 'Specialized Item Handling'],
    color: 'from-blue-500 to-blue-600',
    href: '/moving-services'
  },
  {
    id: 'cleaning',
    title: 'Cleaning Services',
    description: 'Comprehensive cleaning solutions using eco-friendly products for homes, offices, and commercial spaces.',
    icon: Sparkles,
    features: ['Deep Cleaning & Sanitization', 'Regular Maintenance Programs', 'Post-Construction Cleanup', 'Eco-Friendly Products', 'Allergen Reduction Treatments'],
    color: 'from-green-500 to-green-600',
    href: '/cleaning-services'
  },
  {
    id: 'events',
    title: 'Event Services',
    description: 'Full-service event management from planning to execution for corporate and private occasions.',
    icon: Calendar,
    features: ['Comprehensive Event Planning', 'Professional Setup & Breakdown', 'Catering Coordination', 'Custom Decoration Design', 'Audio-Visual Equipment Setup'],
    color: 'from-purple-500 to-purple-600',
    href: '/event-services'
  }
]

const stats = [
  { label: 'Happy Customers', value: '10,000+', icon: Users },
  { label: 'Services Completed', value: '25,000+', icon: CheckCircle },
  { label: 'Cities Served', value: '50+', icon: MapPin },
  { label: 'Years Experience', value: '15+', icon: Award },
]

const fallbackTestimonials = [
  { id: 1, name: 'Customer', location: '', rating: 5, text: 'Great service!', service: 'Service' },
];

export default function HomePage() {
  
  const [heroRef, heroInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [servicesRef, servicesInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [statsRef, statsInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [testimonialsRef, testimonialsInView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [ctaRef, ctaInView] = useInView({ threshold: 0.1, triggerOnce: true })
  
  // State for rotating testimonials
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0)
  const [testimonials, setTestimonials] = useState(fallbackTestimonials)
  
  // Effect to rotate testimonials every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonialIndex(prevIndex => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    }, 60000); // 60000ms = 1 minute
    
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Load published reviews for homepage testimonials
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const resp = await fetch(`${apiBase}/api/reviews/?published=true`, { credentials: 'include' });
        if (!resp.ok) throw new Error('Failed to fetch reviews');
        const data = await resp.json();
        const arr = Array.isArray(data) ? data : (data.results || []);
        const mapped = arr.map((r, idx) => ({
          id: r.id ?? idx,
          name: r.customer_name || 'Customer',
          location: r.location || '',
          rating: Number(r.rating) || 5,
          text: r.comment || '',
          service: r.service_name || 'Service',
        }));
        if (!cancelled && mapped.length) setTestimonials(mapped);
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  }, []);

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

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }
  
  const slideInLeftVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }
  
  const slideInRightVariants = {
    hidden: { x: 50, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }
  
  const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate={heroInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="flex flex-col md:flex-row items-center"
          >
            <motion.div variants={slideInLeftVariants} className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text font-heading leading-tight">
                Premium <span className="text-primary-600 dark:text-primary-400">Service</span> Solutions
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Elite Hands delivers exceptional moving, cleaning, and event services tailored to your needs. Our experienced professionals ensure quality, reliability, and customer satisfaction for both residential and commercial clients.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link href="/services" className="btn btn-gradient group">
                  Our Services
                  {React.createElement(ArrowRight, { className: "ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" })}
                </Link>
                <Link href="/contact" className="btn btn-outline group">
                  Contact Us
                  {React.createElement(Phone, { className: "ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" })}
                </Link>
              </div>
            </motion.div>
            <motion.div variants={slideInRightVariants} className="md:w-1/2">
              <div className="relative h-80 md:h-96 w-full overflow-hidden rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-300 ease-in-out bg-black">
                <Image
                  src="/images/move-in-out-cleaning.jpg.jpg"
                  alt="Professional Cleaning"
                  fill
                  style={{ objectFit: 'contain' }}
                  className="rounded-2xl hover:scale-110 transition-transform duration-700 ease-in-out"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-6">
                    <p className="text-white font-medium text-lg">Experience the Elite Hands difference</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              initial="hidden"
              animate={servicesInView ? "visible" : "hidden"}
              variants={fadeInVariants}
              className="text-3xl md:text-4xl font-bold mb-4 gradient-text font-heading"
            >
              Our Premium Services
            </motion.h2>
            <motion.p 
              initial="hidden"
              animate={servicesInView ? "visible" : "hidden"}
              variants={fadeInVariants}
              className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            >
              We offer a wide range of cleaning services to meet your needs. Our team is trained to handle any cleaning challenge with precision and care.            
            </motion.p>
          </div>
          
          <motion.div
            initial="hidden"
            animate={servicesInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className={`p-8 rounded-xl shadow-lg ${service.bgColor} dark:bg-gray-800 border border-gray-100 dark:border-gray-700 card-hover`}
              >
                <div className={`w-16 h-16 rounded-full ${service.iconBg || 'bg-primary-100 dark:bg-primary-900/30'} flex items-center justify-center mb-6 transform transition-transform duration-500 hover:rotate-12`}>
                  {React.createElement(service.icon, { className: "h-8 w-8 text-primary-600 dark:text-primary-400" })}
                </div>
                <h3 className="text-2xl font-bold mb-3 font-heading">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{service.description}</p>
                <ul className="space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start group">
                      <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <span className="dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href={service.href} 
                  className="inline-flex items-center text-primary-600 dark:text-primary-400 font-medium hover-scale group"
                >
                  Learn more
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={containerVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => {
              return (
                <motion.div
                  key={stat.label}
                  variants={scaleVariants}
                  whileHover={{ y: -5, scale: 1.05, transition: { duration: 0.3 } }}
                  className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md card-hover"
                >
                  <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    {React.createElement(stat.icon, { className: "w-8 h-8 text-primary-600 dark:text-primary-400" })}
                  </div>
                  <div className="text-5xl font-bold text-primary-600 dark:text-primary-400 mb-3 font-heading">{stat.value}</div>
                  <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsRef} className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={testimonialsInView ? "visible" : "hidden"}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-3xl md:text-5xl font-heading font-bold text-gray-900 dark:text-white mb-6"
            >
              What Our <span className="gradient-text">Clients</span> Say
            </motion.h2>
            <motion.p 
              variants={itemVariants}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Don't just take our word for it. Here's what our satisfied customers 
              have to say about their experience with EliteHands.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id}
                variants={scaleVariants}
                initial="hidden"
                animate={testimonialsInView ? "visible" : "hidden"}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -5 }}
                className={`card ${index === activeTestimonialIndex ? 'ring-2 ring-primary-500 ring-offset-2' : ''}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      React.createElement(Star, { key: i, className: "w-5 h-5 text-yellow-400 fill-current" })
                    ))}
                  </div>
                  {index === activeTestimonialIndex && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Featured
                    </span>
                  )}
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    {testimonial.location ? (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.location}</div>
                    ) : null}
                  </div>
                  <div className="text-sm text-primary-600 font-medium">
                    {testimonial.service}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
              Ready to Experience Elite Service?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of satisfied customers across Canada. Book your service today 
              and discover the EliteHands difference.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
              >
                <Link
                  href="/register"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center space-x-2"
                >
                  <span>Get Started Today</span>
                  {React.createElement(ArrowRight, { className: "w-5 h-5" })}
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={itemVariants}
              >
                <Link
                  href="/contact"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all duration-300 flex items-center space-x-2"
                >
                  {React.createElement(Phone, { className: "w-5 h-5" })}
                  <span>Call Us Now</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}