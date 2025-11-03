'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Check, MapPin, Phone, Star, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for services - in a real app, this would come from an API
const eventServices = [
  {
    id: 1,
    title: 'Corporate Events',
    description: 'Comprehensive event planning and management for professional corporate gatherings, conferences, and team-building activities with meticulous attention to detail.',
    image: '/images/move-in-out-cleaning.jpg.jpg',
    features: [
      'Strategic venue selection and professional setup',
      'Premium catering coordination with dietary accommodations',
      'State-of-the-art audio-visual equipment and technical support',
      'Streamlined registration and attendee management',
      'Thorough post-event cleanup and sustainability practices'
    ],
    price: 'From $1500',
    popular: true,
    longDescription: "Our corporate event service provides comprehensive planning and management for professional gatherings, conferences, and team-building activities. We understand that successful corporate events require meticulous attention to detail and a professional touch that reflects your company's standards and goals. Our team handles strategic venue selection and professional setup, ensuring the space is optimally arranged for your specific event type and attendee count. We coordinate premium catering services with dietary accommodations to meet the diverse needs of your guests. Our state-of-the-art audio-visual equipment and technical support ensure seamless presentations and communications throughout your event. We implement streamlined registration and attendee management systems to create a professional and organized experience from start to finish. After your event concludes, our thorough post-event cleanup and sustainability practices leave the venue in perfect condition while minimizing environmental impact."
  },
  {
    id: 2,
    title: 'Wedding Services',
    description: 'Bespoke wedding planning and coordination services that transform your vision into an unforgettable celebration, handling every detail from concept to execution.',
    image: '/images/move-in-out-cleaning.jpg.jpg',
    features: [
      'Customized venue decoration and ambiance design',
      'Seamless ceremony and reception coordination',
      'Comprehensive vendor selection and management',
      'Detailed timeline planning and execution',
      'Dedicated day-of coordination team'
    ],
    price: 'From $2000',
    popular: true,
    longDescription: 'Our wedding services offer bespoke planning and coordination that transform your vision into an unforgettable celebration. We handle every detail from concept to execution, allowing you to fully enjoy your special day without stress or worry. Our team creates customized venue decoration and ambiance design that reflects your personal style and wedding theme, creating a magical atmosphere for your celebration. We provide seamless ceremony and reception coordination, ensuring smooth transitions and perfect timing throughout the day. Our comprehensive vendor selection and management service connects you with trusted professionals while handling all communications and logistics. We develop detailed timeline planning and execution strategies that account for every moment of your wedding day. On the day itself, our dedicated coordination team is present to oversee all aspects of your wedding, addressing any issues that arise and ensuring everything proceeds exactly as planned.'
  },
  {
    id: 3,
    title: 'Private Parties',
    description: 'Personalized party planning services for milestone birthdays, anniversaries, and special occasions, creating memorable experiences tailored to your unique preferences.',
    image: '/images/move-in-out-cleaning.jpg.jpg',
    features: [
      'Creative theme development and conceptualization',
      'Custom decoration design and professional setup',
      'Curated entertainment booking and coordination',
      'Gourmet food and beverage service options',
      'Comprehensive guest management and experience planning'
    ],
    price: 'From $800',
    popular: false,
    longDescription: "Our private party planning services create memorable experiences for milestone birthdays, anniversaries, and special occasions, tailored to your unique preferences. We understand that personal celebrations should reflect your individual style and create lasting memories for you and your guests. Our team provides creative theme development and conceptualization, helping you select and refine the perfect theme for your event. We design custom decorations and handle professional setup to transform your venue into an immersive environment that brings your theme to life. Our curated entertainment booking and coordination services connect you with performers and activities that enhance your party atmosphere. We offer gourmet food and beverage service options that complement your theme and satisfy your guests' palates. Our comprehensive guest management and experience planning ensures every attendee enjoys a seamless and memorable experience from arrival to departure."
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
        const foundService = eventServices.find(s => s.id === id);
        
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
        <Link href="/event-services" className="btn btn-primary">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Event Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-purple-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <Link 
                href="/event-services" 
                className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-6 group"
              >
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Back to Event Services
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
                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                  {service.price}
                </div>
                {service.popular && (
                  <div className="ml-4 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
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
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mr-4">
                      <Check className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{feature}</p>
                  </li>
                ))}
              </ul>
              
              <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-6 mb-12">
                <h3 className="text-xl font-bold mb-4 font-heading">Why Choose Our {service.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  With over 15 years of experience, our team has the expertise to handle your event with precision and care. We pride ourselves on our attention to detail, creative solutions, and commitment to customer satisfaction.
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
                    <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Available 7 days a week</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Serving all of Canada</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Experienced event coordinators</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Starting price</span>
                    <span className="font-bold">{service.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Final price depends on the specifics of your event. Contact us for a personalized quote.
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
            {eventServices.filter(s => s.id !== service.id).map((relatedService) => (
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
                    href={`/event-services/${relatedService.id}`}
                    className="text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
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