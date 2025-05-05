import { deleteCsrfTokenCookie, deleteSfdcAuthToken } from 'app/api/auth/cookieUtils';
import { generateGuestUuid } from 'app/api/auth/authUtil';
import { CSRF_TOKEN_COOKIE_NAME, GUEST_COOKIE_AGE, IS_GUEST_USER_COOKIE_NAME, SFDC_AUTH_TOKEN_COOKIE_NAME, SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME, } from 'lib/constants';
import { fetchSessionContextDetails } from 'lib/sfdc';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();

  const guestUuidInCookie = request.cookies.get(SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME)?.value;
  const authToken = request.cookies.get(SFDC_AUTH_TOKEN_COOKIE_NAME)?.value;

  let isGuestUserRes = true; // Default to true (guest user)

  if (authToken) {
    try {
      // Only check session context when auth token exists
      const sessionInfo = await fetchSessionContextDetails();
      isGuestUserRes = sessionInfo;
    } catch (err) {
      console.error('Error fetching session context:', err);
    }
  }

  // Scenario 1: Auth token exists but session is invalid (i.e. user is actually guest)
  if (authToken && isGuestUserRes === true) {
    await deleteSfdcAuthToken();
    await deleteCsrfTokenCookie();

    res.cookies.delete(SFDC_AUTH_TOKEN_COOKIE_NAME);
    res.cookies.delete(CSRF_TOKEN_COOKIE_NAME);
  }

  // Set isGuestUser cookie
  res.cookies.set(IS_GUEST_USER_COOKIE_NAME, JSON.stringify(isGuestUserRes), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  res.headers.set('x-guest-user', JSON.stringify(isGuestUserRes));

  // Scenario 3: Generate guest UUID if not present
  if (!guestUuidInCookie) {
    const newGuestUuid = generateGuestUuid();
    res.cookies.set(SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME, newGuestUuid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      maxAge: GUEST_COOKIE_AGE,
    });
    res.headers.set('x-guest-uuid', newGuestUuid);
  }

  return res;
}

// Configure middleware to run on specific paths
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
};