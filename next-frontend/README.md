# EliteHands - Premium Service Platform

A modern, responsive web application for booking premium moving, cleaning, and event services across Canada. Built with Next.js 14, TypeScript, and Tailwind CSS with beautiful animations and modern design trends.

## 🚀 Features

### Modern Design & UX
- **Scroll-based animations** using Framer Motion
- **Hover effects** on buttons, cards, and images
- **Glassmorphism** and **Neumorphism** design elements
- **Dark/Light mode** toggle
- **Mobile-first responsive** design
- **Gradient overlays** and modern color schemes

### Core Functionality
- **Service Booking System** for Moving, Cleaning, and Events
- **User Authentication** with role-based access (Customer, Staff, Admin)
- **Real-time Availability** calendar
- **Automated Notifications** system
- **Multi-step Booking Wizard**
- **Customer Dashboard** with booking management
- **Staff Portal** for job management
- **Admin Console** for system oversight

### Pages Included

#### Public Pages (Unauthenticated)
- **Homepage** - Service showcase with modern animations
- **Service Pages** - Moving, Cleaning, Events with detailed information
- **Registration** - Multi-step account creation
- **Login** - Authentication with social login options
- **Contact Us** - Contact form with office locations

#### Customer Pages (Authenticated)
- **Dashboard** - Booking overview and quick actions
- **Booking Wizard** - Multi-step service booking
- **Booking Details** - Service confirmation and management
- **Profile** - Personal data management

#### Staff Pages
- **Work Portal** - Task management and job overview
- **Customer Details** - Assigned job information
- **Staff Directory** - Team contact list
- **Availability** - Schedule management

#### Admin Pages
- **Admin Console** - System oversight dashboard
- **Staff Management** - Employee lifecycle management
- **Service Config** - Pricing and service templates
- **Customer Database** - Client records management
- **Reporting** - Business analytics

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hook Form** - Form management
- **React Hot Toast** - Notifications
- **Lucide React** - Modern icons

### Backend (Django)
- **Django** - Python web framework
- **PostgreSQL** - Database (planned)
- **Django REST Framework** - API development

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 🎨 Design Features

### Animations
- **Scroll-triggered animations** with Intersection Observer
- **Staggered animations** for lists and grids
- **Hover effects** with scale and translate transforms
- **Loading animations** and skeleton screens
- **Page transitions** with smooth effects

### Color Scheme
- **Primary**: Blue gradient (#3b82f6 to #2563eb)
- **Secondary**: Green gradient (#22c55e to #16a34a)
- **Accent**: Red gradient (#ef4444 to #dc2626)
- **Neutral**: Gray scale with dark mode support

### Typography
- **Headings**: Poppins font family
- **Body**: Inter font family
- **Responsive** font sizes with fluid scaling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Python 3.8+ (for Django backend)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EliteHands-main
   ```

2. **Frontend Setup**
   ```bash
   cd next-frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd elite_backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver
   ```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8000

## 📱 Responsive Design

The application is built with a mobile-first approach and includes:

- **Mobile** (320px+): Optimized for smartphones
- **Tablet** (768px+): Enhanced layout for tablets
- **Desktop** (1024px+): Full-featured desktop experience
- **Large Desktop** (1280px+): Expanded layouts

## 🎯 Key Components

### Layout Components
- `Navbar` - Responsive navigation with animations
- `Footer` - Comprehensive footer with links and newsletter
- `Providers` - Context providers for theme and auth

### Page Components
- `HomePage` - Landing page with hero and services
- `ServicePages` - Individual service detail pages
- `Dashboard` - Customer dashboard with statistics
- `ContactPage` - Contact form and information

### Utility Components
- Theme toggle functionality
- Form validation and handling
- Animation wrappers
- Loading states

## 🔐 Authentication

The application includes a complete authentication system:

- **Registration** with email verification
- **Login** with remember me option
- **Social login** integration (Google, Facebook)
- **Role-based access** control
- **Password reset** functionality

## 📊 Features by User Role

### Customers
- Browse and book services
- Manage bookings and appointments
- View service history
- Update profile information
- Leave reviews and ratings

### Staff
- View assigned jobs
- Update job status
- Access customer information
- Manage availability
- Track performance metrics

### Administrators
- Oversee all operations
- Manage staff and customers
- Configure services and pricing
- Generate reports
- System settings management

## 🌟 Modern Web Trends Implemented

1. **Glassmorphism Effects** - Translucent cards with backdrop blur
2. **Neumorphism Design** - Soft, extruded surfaces
3. **Gradient Overlays** - Beautiful color transitions
4. **Micro-interactions** - Subtle hover and click effects
5. **Skeleton Loading** - Improved perceived performance
6. **Progressive Enhancement** - Works without JavaScript
7. **Accessibility** - WCAG compliant design
8. **Performance Optimization** - Lazy loading and code splitting

## 🚀 Deployment

### Frontend (Vercel)
```bash
npm run build
# Deploy to Vercel
```

### Backend (Production)
```bash
# Configure environment variables
# Set up PostgreSQL database
# Deploy to your preferred platform
```

## 📈 Future Enhancements

- **AI Integration** - Demand forecasting and chatbot
- **Payment Processing** - Stripe integration
- **Real-time Chat** - Customer support
- **Mobile App** - React Native version
- **Analytics Dashboard** - Advanced reporting
- **Loyalty Program** - Customer rewards system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- **Email**: hello@elitehands.ca
- **Phone**: 1-800-ELITE-HANDS
- **Website**: https://elitehands.ca

---

**EliteHands** - Transforming service booking with modern technology and exceptional user experience.
