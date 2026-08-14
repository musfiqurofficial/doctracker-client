import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAuthenticatedFlag = request.cookies.get('is_authenticated')?.value;
  const hasAuth = !!(token || isAuthenticatedFlag);

  const { pathname } = request.nextUrl;

  // Protect all /dashboard routes
  if (pathname.startsWith('/dashboard') && !hasAuth) {
    const loginUrl = new URL('/secretlogin', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated user away from /secretlogin to /dashboard
  if (pathname === '/secretlogin' && hasAuth) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Redirect root / to /dashboard or /secretlogin
  if (pathname === '/') {
    const targetUrl = new URL(hasAuth ? '/dashboard' : '/secretlogin', request.url);
    return NextResponse.redirect(targetUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/secretlogin', '/dashboard/:path*'],
};
