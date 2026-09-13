import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected paths that require authentication
const protectedPaths = [
  '/principal',
  '/hod',
  '/incharge',
  '/simulator',
  '/files',
  '/early-warning',
  '/modules',
  '/reports',
  '/audit-logs',
  '/settings'
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token');
  const path = request.nextUrl.pathname;

  // If user is trying to access a protected route without a token
  if (protectedPaths.some(p => path.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and tries to access login page
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/principal', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/principal/:path*',
    '/hod/:path*',
    '/incharge/:path*',
    '/simulator/:path*',
    '/files/:path*',
    '/early-warning/:path*',
    '/modules/:path*',
    '/reports/:path*',
    '/audit-logs/:path*',
    '/settings/:path*',
    '/login'
  ],
};
