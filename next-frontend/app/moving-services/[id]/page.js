'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Check, MapPin, Phone, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for services - in a real app, this would come from an API
const movingServices = [
  {
    id: 1,
    title: 'Residential Moving',
    description: 'Comprehensive moving solutions for homes of all sizes, from apartments to large estates, with personalized care for your belongings.',
    image: '/images/move-in-out-cleaning.jpg.jpg',
    features: [
      'Professional packing and unpacking with premium materials',
      'Expert furniture disassembly and reassembly',
      'Specialized handling for fragile and valuable items',
      'Efficient loading and unloading with protective equipment',
      'GPS-tracked transportation for peace of mind'
    ],
    price: 'From $300',
    popular: true,
    longDescription: "Our residential moving service is designed to make your home relocation as stress-free as possible. We understand that moving your home involves more than just transporting items—it's about safely relocating your life and memories. Our team of experienced professionals handles every aspect of your move with the utmost care and attention to detail. From carefully packing your belongings with premium materials to expertly disassembling and reassembling furniture, we ensure everything arrives at your new home in perfect condition. Our specialized handling techniques for fragile and valuable items provide extra peace of mind, while our efficient loading and unloading processes with protective equipment safeguard both your possessions and your property. With GPS-tracked transportation, you can monitor your belongings throughout the journey, knowing they're in safe hands from start to finish."
  },
  {
    id: 2,
    title: 'Commercial Moving',
    description: 'Streamlined relocation services for businesses of all sizes, minimizing downtime and ensuring business continuity throughout the move.',
    image: '/images/move-in-out-cleaning.jpg.jpg',
    features: [
      'Strategic planning to minimize operational disruption',
      'Specialized handling of sensitive office equipment',
      'IT infrastructure relocation with technical expertise',
      'Flexible weekend and after-hours service options',
      'Comprehensive inventory management system'
    ],
    price: 'From $500',
    popular: false,
    longDescription: 'Our commercial moving service is tailored to businesses that need to relocate without significant disruption to their operations. We recognize that business moves require strategic planning and execution to minimize downtime and maintain productivity. Our team works closely with your organization to develop a customized moving plan that addresses your specific needs and timeline. We provide specialized handling for sensitive office equipment, ensuring everything from computers and printers to specialized machinery is transported safely. Our IT infrastructure relocation service includes technical expertise to disconnect, transport, and reconnect your technology systems efficiently. With flexible weekend and after-hours service options, we can schedule your move during off-peak business hours to minimize operational impact. Our comprehensive inventory management system tracks every item throughout the move, providing accountability and organization from start to finish.'
  },
  {
    id: 3,
    title: 'Long Distance Moving',
    description: 'Expert long-distance relocation services across Canada with dedicated move coordinators and transparent pricing.',
    image: '/images/move-in-out-cleaning.jpg.jpg',
    features: [
      'Experienced interstate moving specialists',
      'Advanced secure transportation and load-securing methods',
      'Real-time GPS shipment tracking system',
      'Climate-controlled transportation options for sensitive items',
      'Flexible delivery scheduling with guaranteed timeframes'
    ],
    price: 'From $1200',
    popular: false,
    longDescription: "Our long-distance moving service provides comprehensive solutions for relocations across Canada. We understand that long-distance moves present unique challenges and require specialized expertise. Our team of experienced interstate moving specialists is trained to handle the complexities of cross-country relocations with precision and care. We employ advanced secure transportation and load-securing methods to ensure your belongings remain safe and stable throughout the journey. Our real-time GPS shipment tracking system allows you to monitor your shipment's progress at any time, providing transparency and peace of mind. For items sensitive to temperature or humidity, we offer climate-controlled transportation options to maintain optimal conditions. Our flexible delivery scheduling with guaranteed timeframes allows you to plan your arrival at your new location with confidence, knowing exactly when your belongings will arrive."
  }
];

export default function ServiceDetail() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchService = () => {
      setIsLoading(true);
      try {
        const id = parseInt(params.id);
        const foundService = movingServices.find(s => s.id === id);
        
        if (foundService) {
          setService(foundService);
          setError(null);
        } else {
          setError('Service not found');
        }
      } catch (err) {
        setError('Error loading service details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        <p className="mb-8">The service you're looking for could not be found.</p>
        <Link href="/moving-services" className="btn btn-primary">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Moving Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <Link 
                href="/moving-services" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 group"
              >
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Back to Moving Services
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 font-heading">
                {service.title}
              </h1>
              <div className="flex items-center mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="ml-2 text-gray-600 dark:text-gray-300">5.0 (120+ reviews)</span>
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                {service.description}
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
                <Link href="/booking" className="btn btn-primary group">
                  Book Now
                  <Calendar className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/contact" className="btn btn-outline group">
                  Contact Us
                  <Phone className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </Link>
              </div>
              <div className="flex items-center">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {service.price}
                </div>
                {service.popular && (
                  <div className="ml-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative h-80 md:h-96 w-full overflow-hidden rounded-2xl shadow-2xl bg-black">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  style={{ objectFit: 'contain' }}
                  className="rounded-2xl hover:scale-110 transition-transform duration-700 ease-in-out"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Details */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-2">
              <h2 className="text-3xl font-bold mb-6 font-heading">Service Details</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p>{service.longDescription}</p>
              </div>
              
              <h3 className="text-2xl font-bold mt-12 mb-6 font-heading">What's Included</h3>
              <ul className="space-y-4 mb-12">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4">
                      <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                  </li>
                ))}
              </ul>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6 mb-12">
                <h3 className="text-xl font-bold mb-4 font-heading">Why Choose Our {service.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  With over 15 years of experience, our team has the expertise to handle your move with precision and care. We pride ourselves on our attention to detail, professional staff, and commitment to customer satisfaction.
                </p>
                <div className="flex items-center">
                  <div className="flex -space-x-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-10 w-10 rounded-full bg-gray-200 border-2 border-white dark:border-gray-800 flex items-center justify-center overflow-hidden">
                        <Image 
                          src={'/images/move-in-out-cleaning.jpg.jpg'} 
                          alt="Team member" 
                          width={40} 
                          height={40}
                          className="object-contain bg-black"
                        />
                      </div>
                    ))}
                  </div>
                  <p className="ml-4 text-sm text-gray-600 dark:text-gray-400">Join our 10,000+ satisfied customers</p>
                </div>
              </div>
            </div>
            
            <div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold mb-6 font-heading">Book This Service</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Available 7 days a week</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Serving all of Canada</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-blue-600 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Free estimates</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Starting price</span>
                    <span className="font-bold">{service.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Final price depends on the specifics of your move. Contact us for a personalized quote.
                  </p>
                </div>
                <Link 
                  href="/booking" 
                  className="btn btn-primary w-full justify-center mb-4"
                >
                  Book Now
                </Link>
                <Link 
                  href="/contact" 
                  className="btn btn-outline w-full justify-center"
                >
                  Request Quote
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Services */}
      <section className="py-20 bg-gray-100 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center font-heading">Related Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {movingServices.filter(s => s.id !== service.id).map((relatedService) => (
              <div 
                key={relatedService.id}
                className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={relatedService.image}
                    alt={relatedService.title}
                    fill
                    style={{ objectFit: 'contain' }}
                    className="bg-black"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 font-heading">{relatedService.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">{relatedService.description}</p>
                  <Link 
                    href={`/moving-services/${relatedService.id}`}
                    className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                  >
                    View Details
                    <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}