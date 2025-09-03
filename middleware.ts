import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/conferences',
  '/attendees',
  '/sessions',
  '/badges',
  '/checkin',
  '/networking',
  '/analytics',
  '/audit',
  '/roles',
  '/venue',
  '/my-events'
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/register-simple',
  '/forgot-password',
  '/reset-password'
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  
  // Get the access token from cookies or headers
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  // If it's a protected route and no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If there's a token but it's expired or invalid, clear it and redirect to login
  if (isProtectedRoute && token) {
    try {
      // Basic JWT token validation - check if it's expired
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      
      if (payload.exp && payload.exp < currentTime) {
        // Token is expired, clear it and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url))
        response.cookies.delete('accessToken')
        response.cookies.delete('refreshToken')
        return response
      }
    } catch (error) {
      // Invalid token format, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('accessToken')
      response.cookies.delete('refreshToken')
      return response
    }
  }
  
  // For protected routes, if no token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // If user is already authenticated and trying to access auth pages, redirect to dashboard
  if (token && (pathname === '/login' || pathname === '/register' || pathname === '/register-simple')) {
    // Check if there's a redirect parameter and use it, otherwise go to dashboard
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    const redirectUrl = redirectParam && redirectParam !== '/login' ? redirectParam : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
