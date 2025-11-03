# Environment Setup Guide

## Frontend Environment Configuration

### 1. Create Environment File

Create a `.env.local` file in the `next-frontend` directory with the following content:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Configuration
NEXT_PUBLIC_APP_NAME=EliteHands
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development
NODE_ENV=development
```

### 2. Alternative: Set Environment Variables

If you cannot create the `.env.local` file, you can set environment variables in your terminal:

**Windows (PowerShell):**
```powershell
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"
$env:NEXT_PUBLIC_APP_NAME="EliteHands"
$env:NEXT_PUBLIC_APP_VERSION="1.0.0"
$env:NODE_ENV="development"
```

**Windows (Command Prompt):**
```cmd
set NEXT_PUBLIC_API_URL=http://localhost:8000
set NEXT_PUBLIC_APP_NAME=EliteHands
set NEXT_PUBLIC_APP_VERSION=1.0.0
set NODE_ENV=development
```

**macOS/Linux:**
```bash
export NEXT_PUBLIC_API_URL=http://localhost:8000
export NEXT_PUBLIC_APP_NAME=EliteHands
export NEXT_PUBLIC_APP_VERSION=1.0.0
export NODE_ENV=development
```

### 3. Verify Configuration

After setting up the environment variables, restart your Next.js development server:

```bash
npm run dev
```

The application should now properly connect to the backend API at `http://localhost:8000`.

## Backend Environment Configuration

### 1. Django Settings

The backend is already configured to work with the default settings. If you need to modify the backend configuration, edit the `elite_backend/elite_backend/settings.py` file.

### 2. Database Configuration

The project uses SQLite by default for development. The database file is located at `elite_backend/db.sqlite3`.

### 3. CORS Configuration

CORS is already configured to allow requests from `http://localhost:3000` and `http://localhost:3001`.

## Troubleshooting

### Common Issues

1. **API Connection Failed**: Make sure the backend is running on `http://localhost:8000`
2. **CORS Errors**: Verify that the frontend URL is in the CORS allowed origins
3. **Environment Variables Not Working**: Restart the development server after setting environment variables

### Testing the Connection

You can test if the API is working by visiting:
- `http://localhost:8000/api/health/` - Should return a health check response
- `http://localhost:8000/api/services/categories/` - Should return service categories

### Default User Accounts

The following default accounts are created when you run the populate command:

- **Admin**: admin@elitehands.com / admin123
- **Staff**: staff@elitehands.com / staff123  
- **Customer**: customer@elitehands.com / customer123

## Production Configuration

For production deployment, you'll need to:

1. Set `DEBUG = False` in Django settings
2. Configure proper database (PostgreSQL recommended)
3. Set up proper CORS origins
4. Configure email settings for notifications
5. Set up proper static file serving
6. Use environment variables for sensitive settings
