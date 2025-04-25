import { v4 as uuidv4 } from 'uuid';
import { NextRequest } from 'next/server';
import { decode } from 'js-base64';
import { ServerCookieManager } from '../../../lib/server-cookies';

export function generateGuestUuid() {
    return uuidv4();
}

export async function getSfdcAuthToken(): Promise<string | undefined> {
    const cookieManager = ServerCookieManager.getInstance();
    return await cookieManager.getAuthToken() || undefined;
}

export async function getCsrfTokenFromCookie(): Promise<string | null> {
    const cookieManager = ServerCookieManager.getInstance();
    const token = await cookieManager.getCsrfToken();
    if (!token) return null;
    return decode(token);
}

export async function getIsGuestUserFromCookie(): Promise<boolean | null> {
    const cookieManager = ServerCookieManager.getInstance();
    return await cookieManager.getIsGuestUser();
}

export async function getCartIdFromCookie(): Promise<string | null> {
    const cookieManager = ServerCookieManager.getInstance();
    return await cookieManager.getCartId();
}

export async function getGuestCartSessionUuid(req?: NextRequest): Promise<string | null | undefined> {
    const cookieManager = ServerCookieManager.getInstance(req);
    return await cookieManager.getGuestCartSessionUuid();
}

export async function getGuestEssentialUuidFromCookie(): Promise<string | null> {
    const cookieManager = ServerCookieManager.getInstance();
    return await cookieManager.getGuestEssentialUuid();
}

export async function setCartIdInCookie(cartId: string) {
    const cookieManager = ServerCookieManager.getInstance();
    await cookieManager.setCartId(cartId);
}

export async function updateIsGuestUserToDefaultInCookie() {
    const cookieManager = ServerCookieManager.getInstance();
    await cookieManager.setIsGuestUser(true);
}

export async function deleteSfdcAuthToken(): Promise<void> {
    const cookieManager = ServerCookieManager.getInstance();
    await cookieManager.deleteAuthToken();
}

export async function deleteGuestCartSessionIdCookie(): Promise<void> {
    const cookieManager = ServerCookieManager.getInstance();
    await cookieManager.deleteGuestCartSessionUuid();
}

export async function deleteCartIdCookie(): Promise<void> {
    const cookieManager = ServerCookieManager.getInstance();
    await cookieManager.deleteCartId();
}

export async function deleteCsrfTokenCookie(): Promise<void> {
    const cookieManager = ServerCookieManager.getInstance();
    await cookieManager.deleteCsrfToken();
}
