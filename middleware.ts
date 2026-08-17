import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_jwt_secret_key_change_me'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  let isAuthenticated = false;

  // 1. Verify Token
  if (token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      // Token is invalid or expired
      isAuthenticated = false;
    }
  }

  // 2. Define Protected and Auth Routes
  const isAuthPage = pathname === '/' || pathname === '/login';
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname.startsWith('/profile');

  // Case A: Unauthenticated user trying to access a protected page
  if (!isAuthenticated && isProtectedRoute) {
    const response = NextResponse.redirect(new URL('/', request.url));
    // Clear expired or bad cookie
    response.cookies.delete('auth_token');
    return response;
  }

  // Case B: Already authenticated user trying to visit landing or login page
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Config: Define routes that middleware should monitor
export const config = {
  matcher: ['/', '/login', '/dashboard/:path*', '/admin/:path*', '/profile/:path*'],
};