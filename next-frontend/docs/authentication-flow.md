# Authentication Flow Documentation

## Overview

This document outlines the authentication flow in the EliteHands application, including recent changes to improve reliability and security.

## Authentication Methods

The application supports multiple authentication methods:

1. **Token-based Authentication** - Using JWT tokens (access and refresh)
2. **Cookie-based Authentication** - For server-side rendering and middleware protection
3. **User Data Authentication** - Fallback method when tokens are not available

## Key Components

### Login Flow

1. User submits credentials (email/username and password)
2. Backend validates credentials and returns:
   - User data
   - Access token (JWT)
   - Refresh token (JWT)
3. Frontend stores authentication data in:
   - LocalStorage (for client-side access)
   - Cookies (for server-side access)
4. User is redirected based on user type (customer/staff)

### Registration Flow

1. User submits registration form
2. Backend validates and creates user account
3. Auto-login is performed
4. Authentication data is stored in both localStorage and cookies
5. User is redirected to appropriate dashboard

### Password Reset Flow

1. User requests password reset with email
2. Backend generates OTP and sends to user's email
3. User verifies OTP
4. Backend validates OTP and provides reset token
5. User sets new password with reset token
6. User is redirected to login page

## Recent Changes

### 1. Improved Token Handling

- Added support for multiple token formats
- Implemented fallback to user data when tokens are not available
- Added comprehensive logging for debugging

### 2. Enhanced Server-Side Authentication

- Added cookie-based authentication for server-side rendering
- Updated middleware to check multiple authentication sources
- Implemented consistent cookie settings (path, expiry, SameSite)

### 3. UI Improvements

- Fixed icon imports in login page
- Added better error handling and user feedback
- Improved redirection logic based on user type

### 4. Backend Changes

- Updated email backend configuration for better debugging
- Enhanced password reset flow with OTP verification

## Security Considerations

- Cookies use SameSite=Lax for CSRF protection
- Tokens have appropriate expiration times
- Password validation follows security best practices
- Authentication state is verified on both client and server