import { NextRequest } from 'next/server';
import {
  SFDC_AUTH_TOKEN_COOKIE_NAME,
  SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME,
  SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME,
  CSRF_TOKEN_COOKIE_NAME,
} from 'lib/constants';
import { getCsrfTokenFromCookie, getGuestCartSessionUuid, getGuestEssentialUuidFromCookie, getIsGuestUserFromCookie, getSfdcAuthToken } from 'app/api/auth/cookieUtils';

export enum HttpMethod {
  GET = 'GET',
  PUT = 'PUT',
  POST = 'POST',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export async function makeSfdcApiCall(endpoint: string, httpMethod: HttpMethod, body?: object, req?: NextRequest): Promise<Response> {
  try {
    // get is guest user from cookie
    const isGuestUserHeader = req?.headers.get('x-guest-user') ?? null;
    const isGuestUser =
      isGuestUserHeader !== null
        ? JSON.parse(isGuestUserHeader)
        : await getIsGuestUserFromCookie();

    const headers = await setApiheaders(isGuestUser, httpMethod, endpoint, req);
    endpoint += endpoint.includes('?')
      ? `&isGuest=${isGuestUser ? 'true' : 'false'}`
      : `?isGuest=${isGuestUser ? 'true' : 'false'}`;

    const fetchOptions: RequestInit = {
      method: httpMethod,
      headers,
      body: body ? JSON.stringify(body) : null,
      credentials: 'include',
    };

    const response = await fetch(endpoint, fetchOptions);
    if (!response.ok) {
      console.log('HTTP error! ', response);
    }
    return response;
  } catch (error) {
    console.log('Fetch Error:', error);
    throw error;
  }
}

export async function setApiheaders(isGuestUser: boolean, httpMethod: HttpMethod, endpoint: string, req?: NextRequest) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Authenticated User
  if (!isGuestUser) {
    const cookiesArr = [];
    const authToken = await getSfdcAuthToken();
    if (authToken) {
      cookiesArr.push(`${SFDC_AUTH_TOKEN_COOKIE_NAME}=${authToken}`);
    }
    if (cookiesArr.length) {
      headers['Cookie'] = cookiesArr.join('; ');
    }
    const csrfToken = await getCsrfTokenFromCookie();
    if (csrfToken && endpoint.match('cart-items') && (httpMethod === HttpMethod.POST || httpMethod === HttpMethod.PATCH || httpMethod === HttpMethod.DELETE)) {
      headers[CSRF_TOKEN_COOKIE_NAME] = csrfToken;
    }
  }

  // Guest User
  if (isGuestUser) {
    const cookiesArr = [];

    // add cart cookies in request headres
    if (endpoint.match('carts')) {
      const guestUuid =
        req?.headers.get('x-guest-uuid') ??
        (await getGuestEssentialUuidFromCookie());
      if (guestUuid) {
        cookiesArr.push(`${SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME}=${guestUuid}`);
      }
      const guestCartSessionUuid = await getGuestCartSessionUuid(req);
      if (guestCartSessionUuid) {
        cookiesArr.push(`${SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME}=${guestCartSessionUuid}`);
      }
    }
    if (cookiesArr.length) {
      headers['Cookie'] = cookiesArr.join('; ');
    }
  }
  return headers;
}