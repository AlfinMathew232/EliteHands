# EliteHands Setup Guide

This guide will help you set up the EliteHands project with both the Django backend and Next.js frontend.

## Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

## Demo Accounts

Use these demo credentials after setup to log in:

- Customer: customer@elitehands.ca / password123
- Staff: staff@elitehands.ca / password123
- Admin: admin@elitehands.ca / password123

To seed or reset these demo users locally:

```bash
cd elite_backend
python manage.py migrate
python manage.py populate_default_data
```

## Backend Setup (Django)

### 1. Navigate to the backend directory
```bash
cd elite_backend
```

### 2. Create and activate virtual environment
```bash
# On Windows
python -m venv venv
venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Run database migrations
```bash
# First, run the setup script to handle migrations properly
python setup.py

# Or manually run migrations
python manage.py makemigrations elite_app
python manage.py migrate
```

### 5. Create a superuser (optional)
```bash
python manage.py createsuperuser
```

### 6. Run the development server
```bash
python manage.py runserver
```

The Django backend will be available at `http://localhost:8000`

## Frontend Setup (Next.js)

### 1. Navigate to the frontend directory
```bash
cd next-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
Create a `.env.local` file in the `next-frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Run the development server
```bash
npm run dev
```

The Next.js frontend will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Services
- `GET /api/services/categories/` - List service categories
- `GET /api/services/` - List all services
- `GET /api/services/?category=<id>` - List services by category
- `GET /api/services/<id>/` - Get service details

### Bookings
- `GET /api/bookings/` - List user bookings
- `POST /api/bookings/` - Create new booking
- `GET /api/bookings/<id>/` - Get booking details
- `PUT /api/bookings/<id>/` - Update booking
- `DELETE /api/bookings/<id>/` - Delete booking

### Reviews
- `GET /api/reviews/` - List user reviews
- `POST /api/reviews/` - Create new review

### Notifications
- `GET /api/notifications/` - List user notifications
- `POST /api/notifications/<id>/mark-read/` - Mark notification as read

### Health Check
- `GET /api/health/` - API health check

## Database Models

### User
- Custom user model extending Django's AbstractUser
- Additional fields: user_type, phone, address, city, province, postal_code, profile_picture, is_verified

### ServiceCategory
- Categories for services (Moving, Cleaning, Events)
- Fields: name, description, icon, is_active

### Service
- Individual services within categories
- Fields: category, name, description, price, duration_hours, is_active

### Booking
- Service bookings with status tracking
- Fields: booking_id (UUID), customer, service, provider, scheduled_date, scheduled_time, status, total_amount, special_instructions, address details

### Review
- Customer reviews for services
- Fields: booking, customer, provider, rating, comment

### Notification
- User notifications
- Fields: user, notification_type, title, message, is_read

## Features

### Backend Features
- ✅ Django REST Framework API
- ✅ CORS configuration for frontend communication
- ✅ Custom User model
- ✅ Session-based authentication
- ✅ Comprehensive API endpoints
- ✅ Admin interface
- ✅ Database models for all features

### Frontend Features
- ✅ Next.js 14 with App Router
- ✅ Tailwind CSS for styling
- ✅ Framer Motion for animations
- ✅ React Hot Toast for notifications
- ✅ API service for backend communication
- ✅ Authentication context
- ✅ Responsive design
- ✅ Dark mode support

## Development

### Backend Development
- The Django backend uses SQLite for development
- CORS is configured to allow requests from the frontend
- All API endpoints are prefixed with `/api/`
- Session authentication is used for user management

### Frontend Development
- The frontend communicates with the backend via the API service
- Authentication state is managed through React context
- All API calls include credentials for session management
- Error handling is implemented for all API requests

## Production Deployment

### Backend
- Use PostgreSQL instead of SQLite
- Set `DEBUG = False` in settings
- Configure proper CORS origins
- Use environment variables for sensitive settings
- Set up proper static file serving

### Frontend
- Build the Next.js app: `npm run build`
- Deploy to Vercel, Netlify, or similar
- Set environment variables for API URL
- Configure proper domain in CORS settings

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the frontend URL is in `CORS_ALLOWED_ORIGINS`
2. **Database Errors**: Run migrations after model changes
3. **Authentication Issues**: Check session configuration
4. **API Connection**: Verify the API URL in environment variables

### Backend Issues

1. **User Model Conflicts**: 
   - The custom User model is properly configured
   - Run `python setup.py` to handle migrations properly

2. **Migration Issues**:
   ```bash
   # Delete existing migrations if needed
   rm -rf elite_app/migrations/*
   python manage.py makemigrations elite_app
   python manage.py migrate
   ```

3. **Pillow Installation**:
   ```bash
   pip install Pillow
   ```

### Frontend Issues

1. **Chunk Loading Errors**: 
   - The frontend now has fallback mechanisms for API calls
   - If the backend is not running, the frontend will use mock data

2. **API Connection Issues**:
   - Check that the backend is running on `http://localhost:8000`
   - Verify the API URL in `.env.local`
   - The frontend will gracefully fall back to mock data if API is unavailable

### Useful Commands

```bash
# Backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
npm run dev
npm run build
npm run lint
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test both frontend and backend
4. Submit a pull request

## License

This project is licensed under the MIT License.
