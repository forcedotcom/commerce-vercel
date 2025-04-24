import { deleteCsrfTokenCookie, deleteSfdcAuthToken, generateGuestUuid } from 'app/api/auth/authUtil';
import { CSRF_TOKEN_COOKIE_NAME, GUEST_COOKIE_AGE, IS_GUEST_USER_COOKIE_NAME, SFDC_AUTH_TOKEN_COOKIE_NAME, SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME, } from 'lib/constants';
import { fetchSessionContextDetails } from 'lib/sfdc';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('middleware');
  const res = NextResponse.next();

  const guestUuidInCookie = req.cookies.get(SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME)?.value;
  const authToken = req.cookies.get(SFDC_AUTH_TOKEN_COOKIE_NAME)?.value;

  let isGuestUserRes = true;

  try {
    // Check session context to identify if the user is guest or authenticated
    const sessionInfo = await fetchSessionContextDetails();
    isGuestUserRes = sessionInfo ?? true;
  } catch (err) {
    console.error('Error fetching session context:', err);
    isGuestUserRes = true; // fallback to guest
  }

  // Scenario 1: Auth token exists but session is invalid (i.e. user is actually guest)
  if (authToken && isGuestUserRes) {
    await deleteSfdcAuthToken();
    await deleteCsrfTokenCookie();

    res.cookies.delete(SFDC_AUTH_TOKEN_COOKIE_NAME);
    res.cookies.delete(CSRF_TOKEN_COOKIE_NAME);
  }

  // Scenario 2: Set isGuestUser cookie based on actual session
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

// Apply middleware to all routes except API routes (optional)
export const config = {
  matcher: [
    '/',
    '/product/:path*',
    '/search/:path*',
  ],
};