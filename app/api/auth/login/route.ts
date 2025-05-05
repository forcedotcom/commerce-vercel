import { encode } from 'js-base64';
import {
    CSRF_TOKEN_COOKIE_NAME,
    IS_GUEST_USER_COOKIE_NAME,
    SFDC_AUTH_TOKEN_COOKIE_NAME,
} from 'lib/constants';
import {
    getLoginRedirectUrl,
    exchangeSidForLongLivedSid,
    fetchCsrfToken
} from 'app/api/auth/authUtil';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Handles user login by:
 * 1. Authenticating with Salesforce and retrieving a redirect URL containing a session ID (SID).
 * 2. Exchanging the SID for a long-lived session ID via frontdoor.jsp.
 * 3. Fetching a CSRF token using the long-lived SID.
 * 4. Setting authentication and session cookies for the client.
 *
 * Note: The CSRF token is required to perform operations on the cart for site users (e.g., adding, updating, or removing items).
 * The frontend must include this token in requests for all cart operations to protect against CSRF attacks.
 */
export async function POST(req: NextRequest) {
    try {
        // Parse credentials from request body
        const { username, password } = await req.json();

        // Step 1: Authenticate and get redirect URL with SID
        const redirectUrl = await getLoginRedirectUrl(username, password);
        if (!redirectUrl || !redirectUrl.includes('sid=')) {
            return NextResponse.json({ error: 'Invalid login response' }, { status: 500 });
        }

        // Step 2: Exchange for long-lived SID
        const longLivedSid = await exchangeSidForLongLivedSid(redirectUrl);
        if (!longLivedSid) {
            return NextResponse.json({ error: 'SID not found in Set-Cookie' }, { status: 500 });
        }

        // Step 3: Fetch CSRF token using the long-lived SID
        const csrfToken = await fetchCsrfToken(longLivedSid);
        if (!csrfToken) {
            return NextResponse.json({ error: 'CSRF token not found' }, { status: 500 });
        }

        // Step 4: Set authentication and session cookies for the client
        // - SFDC_AUTH_TOKEN_COOKIE_NAME: Stores the long-lived SID (server authentication)
        // - CSRF_TOKEN_COOKIE_NAME: Stores the CSRF token (client-side JS access)
        // - IS_GUEST_USER_COOKIE_NAME: Indicates the user is not a guest
        const res = NextResponse.json({ success: true });
        res.cookies.set({
            name: SFDC_AUTH_TOKEN_COOKIE_NAME,
            value: longLivedSid,
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
        });
        res.cookies.set({
            name: CSRF_TOKEN_COOKIE_NAME,
            value: encode(csrfToken),
            httpOnly: false, // MUST be accessible to client-side JS
            secure: true,
            sameSite: 'lax',
            path: '/',
        });
        res.cookies.set(IS_GUEST_USER_COOKIE_NAME, JSON.stringify(false), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            path: '/',
        });
        // Also set a response header for guest user status
        res.headers.set('x-guest-user', JSON.stringify(false));
        return res;
    } catch (error) {
        // Catch-all for unexpected errors
        return NextResponse.json({ error: 'Unexpected error', details: String(error) }, { status: 500 });
    }
}
