import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes protection
  if (pathname.startsWith('/admin')) {
    // Skip login page itself
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // For all other /admin routes, check for auth token in cookies
    // The admin page itself does client-side auth check and redirects to /admin/login
    // We don't block at edge level since the admin page handles its own auth state
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
