import { SFDC_AUTH_TOKEN_KEY } from 'lib/constants';
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const authToken = req.cookies.get(SFDC_AUTH_TOKEN_KEY)?.value;
  console.log('middleware');
  const loginPath = '/login';

  // If user is NOT authenticated, redirect to login page
  if (!authToken && req.nextUrl.pathname !== loginPath) {
    return NextResponse.redirect(new URL(loginPath, req.url));
  }

  return NextResponse.next();
}

// Apply middleware to all routes except API routes (optional)
export const config = {
  matcher: [
    '/',
    '/product/:path*',
  ],
};
