import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '../components/providers/Providers'
import { Navbar } from '../components/layout/Navbar'
import { Footer } from '../components/layout/Footer'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
})

export const metadata = {
  title: 'EliteHands - Premium Moving, Cleaning & Event Services in Canada',
  description: 'Professional moving, cleaning, and event services across Canada. Book instantly with real-time availability, automated confirmations, and expert staff.',
  keywords: 'moving services canada, cleaning services, event services, professional movers, house cleaning, commercial cleaning',
  authors: [{ name: 'EliteHands Team' }],
  creator: 'EliteHands',
  publisher: 'EliteHands',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://elitehands.ca'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EliteHands - Premium Moving, Cleaning & Event Services',
    description: 'Professional services across Canada with instant booking and real-time availability.',
    url: 'https://elitehands.ca',
    siteName: 'EliteHands',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EliteHands Services',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EliteHands - Premium Services in Canada',
    description: 'Professional moving, cleaning, and event services with instant booking.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}
