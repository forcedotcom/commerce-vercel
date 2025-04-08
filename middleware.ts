import { deleteCsrfTokenCookie, deleteSfdcAuthToken, generateGuestUuid, getIsGuestUserFromCookie, getSfdcAuthToken, updateIsGuestUserToDefaultInCookie } from 'app/api/auth/authUtil';
import { GUEST_COOKIE_AGE, IS_GUEST_USER_COOKIE_NAME, SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME, } from 'lib/constants';
import { fetchSessionContextDetails } from 'lib/sfdc';
import { NextRequest, NextResponse } from 'next/server';


export async function middleware(req: NextRequest) {
  console.log('middleware');

  const res = NextResponse.next();

  const isGuestUserInCookie = req.cookies.get(IS_GUEST_USER_COOKIE_NAME)?.value;
  if (!isGuestUserInCookie) {
    res.cookies.set(IS_GUEST_USER_COOKIE_NAME, JSON.stringify(true), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });
    res.headers.set('x-guest-user', JSON.stringify(true));
  }

  const guestUuidInCookie = req.cookies.get(SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME)?.value;
  if (!guestUuidInCookie) {
    const newGuestUuid = generateGuestUuid();
    res.cookies.set(SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME, newGuestUuid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: GUEST_COOKIE_AGE
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

// const authToken = await getSfdcAuthToken(); // sid
// const isGuestUser = await fetchSessionContextDetails();

// console.log('middleware authToken', authToken);
// console.log('middleware sessionContextRes', isGuestUser);

// // delete the auth tokens when session context is guest user
// if (authToken && isGuestUser) {
//   await deleteSfdcAuthToken();
//   await updateIsGuestUserToDefaultInCookie();
//   await deleteCsrfTokenCookie();
// }