import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard') && !token) {
    const loginUrl = new URL('/secretlogin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user away from /secretlogin to /dashboard
  if (pathname === '/secretlogin' && token) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Redirect root / to /dashboard
  if (pathname === '/') {
    const targetUrl = new URL(token ? '/dashboard' : '/secretlogin', request.url);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/secretlogin', '/dashboard/:path*'],
};
