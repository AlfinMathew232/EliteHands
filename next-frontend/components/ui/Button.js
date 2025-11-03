'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700 shadow hover:shadow-lg',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 shadow hover:shadow-lg',
        outline: 'border border-gray-300 dark:border-gray-600 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
        ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300',
        gradient: 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow hover:shadow-lg hover:from-primary-700 hover:to-secondary-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow hover:shadow-lg',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
      animation: {
        none: '',
        pulse: 'animate-pulse',
        bounce: 'hover:animate-bounce',
        scale: 'hover:scale-105',
        shake: 'hover:animate-shake',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      animation: 'scale',
    },
  }
);

// Add the missing utility function
const utils = {
  cn: (...classes) => {
    return classes.filter(Boolean).join(' ');
  }
};

const Button = forwardRef(({ 
  className, 
  variant, 
  size, 
  animation,
  href, 
  children, 
  ...props 
}, ref) => {
  if (href) {
    return (
      <Link
        href={href}
        className={utils.cn(buttonVariants({ variant, size, animation, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={utils.cn(buttonVariants({ variant, size, animation, className }))}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export { Button, buttonVariants };