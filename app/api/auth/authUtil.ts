import { v4 as uuidv4 } from 'uuid';
import { APEX_EXECUTE, SFDC_SITE_WEBRUNTIME_API_URL, SFDC_SITE_WEBRUNTIME_URL, CSRF_TOKEN_URL } from 'lib/constants';

// If you need cookie utilities here, import from './cookieUtils'
// import * as cookieUtils from './cookieUtils';

// -----------------------------
// Guest Utilities
// -----------------------------

/** Generate a new UUID for guest users. */
export function generateGuestUuid() {
    return uuidv4();
}

// -----------------------------
// SFDC Login & Session Helpers
// -----------------------------

/**
 * Authenticate with Salesforce and get a redirect URL containing a session ID (SID).
 * Returns null if authentication fails.
 */
export async function getLoginRedirectUrl(username: string, password: string): Promise<string | null> {
  const endpoint = SFDC_SITE_WEBRUNTIME_API_URL + APEX_EXECUTE;
  const payload = {
    namespace: 'applauncher',
    classname: 'LoginFormController',
    method: 'loginGetPageRefUrl',
    isContinuation: false,
    params: { username, password, startUrl: '' },
    cacheable: false,
  };
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  return data?.returnValue || null;
}

/**
 * Exchange the redirect URL for a long-lived SID by hitting frontdoor.jsp.
 * Returns the SID string or null if not found.
 */
export async function exchangeSidForLongLivedSid(redirectUrl: string): Promise<string | null> {
  const fdResp = await fetch(redirectUrl, {
    method: 'GET',
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });
  const setCookieHeader = fdResp.headers.get('set-cookie');
  return setCookieHeader?.match(/sid=([^;]+)/)?.[1] || null;
}

/**
 * Fetch a CSRF token using the long-lived SID.
 * Returns the token string or null if not found.
 */
export async function fetchCsrfToken(longLivedSid: string): Promise<string | null> {
  const csrfResp = await fetch(`${SFDC_SITE_WEBRUNTIME_URL}${CSRF_TOKEN_URL}`, {
    method: 'GET',
    headers: { 'Cookie': `sid=${longLivedSid}` },
  });
  if (!csrfResp.ok) return null;
  const raw = await csrfResp.text();
  const match = raw.match(/return\s+"([^"]+)"/);
  return match && match[1] ? JSON.parse(`"${match[1]}"`) : null;
}
