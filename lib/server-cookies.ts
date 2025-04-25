import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { CookieOptions, defaultCookieOptions } from './sfdc/types';
import { 
  CART_ID_COOKIE_NAME, 
  CSRF_TOKEN_COOKIE_NAME, 
  GUEST_COOKIE_AGE,
  IS_GUEST_USER_COOKIE_NAME, 
  SFDC_AUTH_TOKEN_COOKIE_NAME, 
  SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME, 
  SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME 
} from './constants';

export class ServerCookieManager {
  private static instance: ServerCookieManager;
  private request?: NextRequest;

  private constructor(request?: NextRequest) {
    this.request = request;
  }

  public static getInstance(request?: NextRequest): ServerCookieManager {
    if (!ServerCookieManager.instance || request) {
      ServerCookieManager.instance = new ServerCookieManager(request);
    }
    return ServerCookieManager.instance;
  }

  private async getServerCookies() {
    try {
      return cookies();
    } catch (error) {
      // If cookies() fails (during static generation), return null
      return null;
    }
  }

  private async getCookieValue(name: string): Promise<string | null> {
    if (this.request) {
      return this.request.cookies.get(name)?.value || null;
    }
    const serverCookies = await this.getServerCookies();
    return serverCookies?.get(name)?.value || null;
  }

  private async setCookieValue(name: string, value: string, options: CookieOptions = {}) {
    const opts = { ...defaultCookieOptions, ...options };
    if (this.request) {
      this.request.cookies.set({
        name,
        value,
        ...opts
      });
    } else {
      const serverCookies = await this.getServerCookies();
      if (serverCookies) {
        serverCookies.set({
          name,
          value,
          ...opts
        });
      }
    }
  }

  private async deleteCookieValue(name: string) {
    if (this.request) {
      this.request.cookies.delete(name);
    } else {
      const serverCookies = await this.getServerCookies();
      if (serverCookies) {
        serverCookies.delete(name);
      }
    }
  }

  // Auth Token Methods
  async getAuthToken(): Promise<string | null> {
    return this.getCookieValue(SFDC_AUTH_TOKEN_COOKIE_NAME);
  }

  async setAuthToken(token: string, options: CookieOptions = {}) {
    await this.setCookieValue(SFDC_AUTH_TOKEN_COOKIE_NAME, token, options);
  }

  async deleteAuthToken() {
    await this.deleteCookieValue(SFDC_AUTH_TOKEN_COOKIE_NAME);
  }

  // CSRF Token Methods
  async getCsrfToken(): Promise<string | null> {
    return this.getCookieValue(CSRF_TOKEN_COOKIE_NAME);
  }

  async setCsrfToken(token: string, options: CookieOptions = {}) {
    await this.setCookieValue(CSRF_TOKEN_COOKIE_NAME, token, options);
  }

  async deleteCsrfToken() {
    await this.deleteCookieValue(CSRF_TOKEN_COOKIE_NAME);
  }

  // Guest User Methods
  async getIsGuestUser(): Promise<boolean | null> {
    const cookie = await this.getCookieValue(IS_GUEST_USER_COOKIE_NAME);
    if (!cookie) return null;
    try {
      return JSON.parse(cookie);
    } catch {
      return null;
    }
  }

  async setIsGuestUser(isGuest: boolean, options: CookieOptions = {}) {
    await this.setCookieValue(IS_GUEST_USER_COOKIE_NAME, JSON.stringify(isGuest), options);
  }

  // Cart Methods
  async getCartId(): Promise<string | null> {
    return this.getCookieValue(CART_ID_COOKIE_NAME);
  }

  async setCartId(cartId: string, options: CookieOptions = {}) {
    await this.setCookieValue(CART_ID_COOKIE_NAME, cartId, options);
  }

  async deleteCartId() {
    await this.deleteCookieValue(CART_ID_COOKIE_NAME);
  }

  // Guest UUID Methods
  async getGuestEssentialUuid(): Promise<string | null> {
    return this.getCookieValue(SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME);
  }

  async setGuestEssentialUuid(uuid: string, options: CookieOptions = {}) {
    const opts = { ...defaultCookieOptions, maxAge: GUEST_COOKIE_AGE, ...options };
    await this.setCookieValue(SFDC_GUEST_ESSENTIAL_ID_COOKIE_NAME, uuid, opts);
  }

  // Guest Cart Session Methods
  async getGuestCartSessionUuid(): Promise<string | null> {
    return this.getCookieValue(SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME);
  }

  async setGuestCartSessionUuid(uuid: string, options: CookieOptions = {}) {
    await this.setCookieValue(SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME, uuid, options);
  }

  async deleteGuestCartSessionUuid() {
    await this.deleteCookieValue(SFDC_GUEST_CART_SESSION_ID_COOKIE_NAME);
  }

  public async getCookie(name: string): Promise<string | undefined> {
    const value = await this.getCookieValue(name);
    return value ?? undefined;
  }
}

export async function getCookie(name: string): Promise<string | undefined> {
  const cookieManager = ServerCookieManager.getInstance();
  return cookieManager.getCookie(name);
} 