'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Check, MapPin, Phone, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Mock data for services - in a real app, this would come from an API
const cleaningServices = [
  {
    id: 1,
    title: 'Residential Cleaning',
    description: 'Premium cleaning services for homes of all sizes using eco-friendly products and advanced techniques for a healthier living environment.',
    image: '/images/move-in-out-cleaning.jpg.jpg',
    features: [
      'Thorough deep cleaning of all living spaces',
      'Advanced kitchen and bathroom sanitization protocols',
      'HEPA-filtered vacuuming for allergen reduction',
      'Specialized floor washing and polishing techniques',
      'Streak-free window and surface cleaning'
    ],
    price: 'From $120',
    popular: true,
    longDescription: "Our residential cleaning service provides premium cleaning solutions for homes of all sizes. We understand that a clean home is essential for your health, comfort, and peace of mind. Our team uses eco-friendly products and advanced techniques to create a healthier living environment for you and your family. We perform thorough deep cleaning of all living spaces, paying special attention to high-touch areas and hidden corners that often accumulate dust and allergens. Our advanced kitchen and bathroom sanitization protocols ensure these critical areas are not just clean but properly disinfected. We use HEPA-filtered vacuuming equipment to significantly reduce allergens in your home, providing relief for allergy sufferers. Our specialized floor washing and polishing techniques are tailored to different flooring materials, ensuring optimal cleaning without damage. We also provide streak-free window and surface cleaning, leaving your home sparkling from every angle."
  },
  {
    id: 2,
    title: 'Commercial Cleaning',
    description: 'Customized cleaning solutions for businesses of all sizes, maintaining a professional environment while adhering to industry-specific sanitation standards.',
    image: '/images/move-in-out-cleaning.jpg.jpg',
    features: [
      'Comprehensive workspace cleaning and disinfection',
      'Hospital-grade restroom sanitization',
      'Professional floor maintenance and restoration',
      'Streak-free window and glass surface treatment',
      'Environmentally responsible waste management'
    ],
    price: 'From $200',
    popular: false,
    longDescription: 'Our commercial cleaning service offers customized solutions for businesses of all sizes. We understand that a clean, well-maintained workplace is essential for productivity, employee health, and creating a positive impression on clients and visitors. Our team is trained to maintain a professional environment while adhering to industry-specific sanitation standards. We provide comprehensive workspace cleaning and disinfection, focusing on high-traffic areas and shared spaces to reduce the spread of germs. Our hospital-grade restroom sanitization ensures these critical areas meet the highest hygiene standards. We offer professional floor maintenance and restoration services tailored to various flooring types found in commercial settings, from carpets to hardwood to tile. Our streak-free window and glass surface treatment keeps your office looking pristine and professional. We also implement environmentally responsible waste management practices, helping your business maintain its commitment to sustainability.'
  },
  {
    id: 3,
    title: 'Deep Cleaning',
    description: 'Intensive top-to-bottom cleaning service that eliminates built-up dirt, allergens, and bacteria from every corner and surface of your space.',
    image: '/images/move-in-out-cleaning.jpg.jpg',
    features: [
      'Meticulous cleaning of all areas including hard-to-reach spaces',
      'Comprehensive behind and under furniture cleaning',
      'Detailed appliance interior and exterior cleaning and sanitization',
      'Complete cabinet and drawer organization and cleaning',
      'Thorough baseboards, vent, and air duct cleaning'
    ],
    price: 'From $250',
    popular: false,
    longDescription: 'Our deep cleaning service provides an intensive top-to-bottom cleaning experience that goes far beyond regular maintenance cleaning. This service is perfect for annual spring cleaning, preparing a home for sale, moving into a new space, or simply resetting your environment to a pristine state. We eliminate built-up dirt, allergens, and bacteria from every corner and surface of your space. Our team performs meticulous cleaning of all areas including hard-to-reach spaces that are often overlooked in routine cleaning. We move and clean behind and under furniture to ensure no area is left untouched. Our detailed appliance interior and exterior cleaning and sanitization service ensures these frequently used items are thoroughly cleaned. We provide complete cabinet and drawer organization and cleaning, helping you restore order to your space. Our thorough baseboards, vent, and air duct cleaning improves indoor air quality and removes accumulated dust and allergens from these often neglected areas.'
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
        const foundService = cleaningServices.find(s => s.id === id);
        
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
        <Link href="/cleaning-services" className="btn btn-primary">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back to Cleaning Services
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <Link 
                href="/cleaning-services" 
                className="inline-flex items-center text-green-600 hover:text-green-700 mb-6 group"
              >
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Back to Cleaning Services
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
                  <div className="ml-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
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
              
              <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-6 mb-12">
                <h3 className="text-xl font-bold mb-4 font-heading">Why Choose Our {service.title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  With over 15 years of experience, our team has the expertise to handle your cleaning needs with precision and care. We pride ourselves on our attention to detail, eco-friendly products, and commitment to customer satisfaction.
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
                    <Calendar className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Available 7 days a week</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Serving all of Canada</span>
                  </div>
                  <div className="flex items-center">
                    <Sparkles className="h-5 w-5 text-green-600 mr-3" />
                    <span className="text-gray-700 dark:text-gray-300">Eco-friendly products</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600 dark:text-gray-400">Starting price</span>
                    <span className="font-bold">{service.price}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Final price depends on the size and condition of your space. Contact us for a personalized quote.
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
            {cleaningServices.filter(s => s.id !== service.id).map((relatedService) => (
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
                    href={`/cleaning-services/${relatedService.id}`}
                    className="text-green-600 hover:text-green-700 font-medium inline-flex items-center"
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