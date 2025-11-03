import { NextResponse } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/dashboard/admin',
  '/dashboard/staff',
  '/dashboard/customer',
  '/my-bookings',
  '/profile',
  '/moving-services',
  '/cleaning-services',
  '/event-services'
];

// Define auth routes that should not be accessible when logged in
const authRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
];

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/about',
  '/services',
  '/contact'
];

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const url = request.nextUrl.clone();
  
  // Skip middleware for API routes, static files, and _next paths
  if (
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/_vercel/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // Check for authentication in cookies or headers
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');
  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticatedCookie = request.cookies.get('isAuthenticated')?.value;
  // Also consider Django session cookie when using SessionAuthentication
  const djangoSessionId = request.cookies.get('sessionid')?.value;
  
  // Determine authentication status from available tokens, auth cookie, or Django session
  const isAuthenticated = !!token || !!accessToken || isAuthenticatedCookie === 'true' || !!djangoSessionId;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Handle protected routes for unauthenticated users
  if (isProtectedRoute && !isAuthenticated) {
    // Store the intended URL for redirecting back after login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + search);
    return NextResponse.redirect(loginUrl);
  }
  
  // Allow auth routes even if authenticated; client-side code will redirect appropriately.
  // This avoids double navigations that can cause refresh loops between middleware and client.
  if (isAuthRoute) {
    return NextResponse.next();
  }
  
  // For all other cases, continue with the request
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
