import { NextRequest } from 'next/server';
import { decode } from 'js-base64';
import { ServerCookieManager } from '../../../lib/server-cookies';

// -----------------------------
// Cookie Getters
// -----------------------------

/** Get the SFDC Auth Token from cookies. */
export async function getSfdcAuthToken(): Promise<string | undefined> {
    return (await ServerCookieManager.getInstance().getAuthToken()) || undefined;
}

/** Get the CSRF token from cookies and decode it. */
export async function getCsrfTokenFromCookie(): Promise<string | null> {
    const token = await ServerCookieManager.getInstance().getCsrfToken();
    return token ? decode(token) : null;
}

/** Get the guest user status from cookies. */
export async function getIsGuestUserFromCookie(): Promise<boolean | null> {
    return await ServerCookieManager.getInstance().getIsGuestUser();
}

/** Get the cart ID from cookies. */
export async function getCartIdFromCookie(): Promise<string | null> {
    return await ServerCookieManager.getInstance().getCartId();
}

/** Get the guest cart session UUID from cookies (optionally using a request). */
export async function getGuestCartSessionUuid(req?: NextRequest): Promise<string | null | undefined> {
    return await ServerCookieManager.getInstance(req).getGuestCartSessionUuid();
}

/** Get the guest essential UUID from cookies. */
export async function getGuestEssentialUuidFromCookie(): Promise<string | null> {
    return await ServerCookieManager.getInstance().getGuestEssentialUuid();
}

// -----------------------------
// Cookie Setters & Deleters
// -----------------------------

/** Set the cart ID in cookies. */
export async function setCartIdInCookie(cartId: string) {
    await ServerCookieManager.getInstance().setCartId(cartId);
}

/** Set guest user status to default (true) in cookies. */
export async function updateIsGuestUserToDefaultInCookie() {
    await ServerCookieManager.getInstance().setIsGuestUser(true);
}

/** Delete the SFDC Auth Token from cookies. */
export async function deleteSfdcAuthToken(): Promise<void> {
    await ServerCookieManager.getInstance().deleteAuthToken();
}

/** Delete the guest cart session ID from cookies. */
export async function deleteGuestCartSessionIdCookie(): Promise<void> {
    await ServerCookieManager.getInstance().deleteGuestCartSessionUuid();
}

/** Delete the cart ID from cookies. */
export async function deleteCartIdCookie(): Promise<void> {
    await ServerCookieManager.getInstance().deleteCartId();
}

/** Delete the CSRF token from cookies. */
export async function deleteCsrfTokenCookie(): Promise<void> {
    await ServerCookieManager.getInstance().deleteCsrfToken();
} 