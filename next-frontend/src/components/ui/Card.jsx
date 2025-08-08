'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'

export const Card = forwardRef(
  ({ className = '', variant = 'default', hover = true, children, ...props }, ref) => {
    const baseClasses = 'rounded-xl transition-all duration-300'
    
    const variants = {
      default: 'bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700',
      glass: 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 shadow-xl',
      neumorphism: 'bg-gray-100 dark:bg-gray-800 shadow-neumorphism dark:shadow-neumorphism-dark',
      gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-lg border border-gray-200 dark:border-gray-700'
    }
    
    const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : ''
    
    return (
      <motion.div
        ref={ref}
        whileHover={hover ? { y: -4, scale: 1.02 } : {}}
        className={`
          ${baseClasses}
          ${variants[variant]}
          ${hoverClasses}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'

export function CardHeader({ 
  className = '', 
  children, 
  ...props 
}) {
  return (
    <div 
      className={`p-6 pb-0 ${className}`} 
      {...props}
    >
      {children}
    </div>
  )
}

export function CardContent({ 
  className = '', 
  children, 
  ...props 
}) {
  return (
    <div 
      className={`p-6 ${className}`} 
      {...props}
    >
      {children}
    </div>
  )
}

export function CardFooter({ 
  className = '', 
  children, 
  ...props 
}) {
  return (
    <div 
      className={`p-6 pt-0 ${className}`} 
      {...props}
    >
      {children}
    </div>
  )
}
