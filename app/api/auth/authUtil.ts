import { cookies } from 'next/headers';
import { CART_ID_COOKIE_NAME, CSRF_TOKEN_COOKIE_NAME, IS_GUEST_USER_COOKIE_NAME, SFDC_AUTH_TOKEN_COOKIE_NAME, SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME, SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME } from '../../../lib/constants';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';
import { decode } from 'js-base64';

export async function getSfdcAuthToken(): Promise<string | undefined> {
    return (await cookies()).get(SFDC_AUTH_TOKEN_COOKIE_NAME)?.value || undefined;
}

export async function getCsrfTokenFromCookie(): Promise<string | null> {
    const cookie = (await cookies()).get(CSRF_TOKEN_COOKIE_NAME)?.value;
    if (!cookie) return null;
    return decode(cookie);
}

export async function updateIsGuestUserToDefaultInCookie() {
    (await cookies()).set(IS_GUEST_USER_COOKIE_NAME, JSON.stringify(true));
}

export async function getIsGuestUserFromCookie(): Promise<boolean | null> {
    const isGuestUser = null;
    const cookie = (await cookies()).get(IS_GUEST_USER_COOKIE_NAME)?.value;
    if (!cookie) return isGuestUser;
    try {
        return JSON.parse(cookie);
    } catch {
        return isGuestUser;
    }
}

export async function deleteSfdcAuthToken(): Promise<void> {
    (await cookies()).delete(SFDC_AUTH_TOKEN_COOKIE_NAME);
}

export async function deleteGuestCartSessionIdCookie(): Promise<void> {
    (await cookies()).delete(SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME);
}

export async function deleteCartIdCookie(): Promise<void> {
    (await cookies()).delete(CART_ID_COOKIE_NAME);
}

export async function deleteCsrfTokenCookie(): Promise<void> {
    (await cookies()).delete(CSRF_TOKEN_COOKIE_NAME);
}

export function generateGuestUuid() {
    return uuidv4();
}

export async function getGuestEssentialUuidFromCookie(): Promise<string | null> {
    const cookie = (await cookies()).get(SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME)?.value;
    if (!cookie) return null;
    return cookie;
}

export async function getCartIdFromCookie(): Promise<string | null> {
    const cookie = (await cookies()).get(CART_ID_COOKIE_NAME)?.value;
    if (!cookie) return null;
    return cookie;
}

export async function setCartIdInCookie(cartId: string) {
    (await cookies()).set('cartId', cartId);
}

/**
 * Get the Guest Cart Session Id Cookie value based on environment (server-side or client-side)
 */
export async function getGuestCartSessionUuid(req?: NextRequest): Promise<string | null | undefined> {
    let guestCartSessionUuid: string | undefined | null = null;

    if (typeof window === 'undefined') {
        // Server-side: Retrieve cookie from request or response headers
        guestCartSessionUuid = req ? req.cookies.get(SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME)?.value : (await cookies()).get(SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME)?.value;
    } else {
        // Client-side: Retrieve from document.cookie
        guestCartSessionUuid = document.cookie
            .split('; ')
            .find(row => row.startsWith(SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME + '='))
            ?.split('=')[1] || null;
    }
    return guestCartSessionUuid;
}
