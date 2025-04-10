import { encode } from 'js-base64';
import {
    APEX_EXECUTE,
    CSRF_TOKEN_COOKIE_NAME,
    CSRF_TOKEN_URL,
    IS_GUEST_USER_COOKIE_NAME,
    SFDC_AUTH_TOKEN_COOKIE_NAME,
    SFDC_SITE_WEBRUNTIME_API_URL,
    SFDC_SITE_WEBRUNTIME_URL,
} from 'lib/constants';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { username, password } = body;

    const endpoint = SFDC_SITE_WEBRUNTIME_API_URL + APEX_EXECUTE;

    const payload = {
        namespace: 'applauncher',
        classname: 'LoginFormController',
        method: 'loginGetPageRefUrl',
        isContinuation: false,
        params: {
            username,
            password,
            startUrl: '',
        },
        cacheable: false,
    };

    // Step 1: Get the redirect URL with SID
    const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!resp.ok) {
        return NextResponse.json({ error: 'Login failed' }, { status: 401 });
    }

    const data = await resp.json();
    const redirectUrl = data?.returnValue;

    if (!redirectUrl || !redirectUrl.includes('sid=')) {
        return NextResponse.json({ error: 'Invalid login response' }, { status: 500 });
    }

    // Step 2: Hit frontdoor.jsp to exchange for long-lived SID
    const fdResp = await fetch(redirectUrl, {
        method: 'GET',
        headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    const setCookieHeader = fdResp.headers.get('set-cookie');
    const sidMatch = setCookieHeader?.match(/sid=([^;]+)/);
    const longLivedSid = sidMatch?.[1];

    if (!longLivedSid) {
        return NextResponse.json({ error: 'SID not found in Set-Cookie' }, { status: 500 });
    }

    // Step 3: Use that SID to get CSRF token
    const csrfResp = await fetch(`${SFDC_SITE_WEBRUNTIME_URL}${CSRF_TOKEN_URL}`, {
        method: 'GET',
        headers: {
            'Cookie': `sid=${longLivedSid}`,
        },
    });

    if (!csrfResp.ok) {
        return NextResponse.json({ error: 'Failed to fetch CSRF token' }, { status: 500 });
    }

    const reader = csrfResp.body?.getReader();

    if (!reader) {
        throw new Error('Failed to get response reader');
    }

    let raw = '';
    const decoder = new TextDecoder('utf-8');

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        raw += decoder.decode(value, { stream: true });
    }

    raw += decoder.decode(); // finalize

    // Now extract the token string (before Unicode escaping gets interpreted)
    const match = raw.match(/return\s+"([^"]+)"/);
    if (!match || !match[1]) {
        throw new Error('CSRF token not found');
    }

    // Decode any escaped characters like \u003d using JSON.parse
    const csrfToken = JSON.parse(`"${match[1]}"`);


    // Step 4: Store SID as secure cookie and CSRF token in a base64 session context cookie
    const res = NextResponse.json({ success: true });
    res.cookies.set({
        name: SFDC_AUTH_TOKEN_COOKIE_NAME,
        value: longLivedSid,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
    });

    // Store CSRF token (and optionally firstName, guestUser, etc.)
    res.cookies.set({
        name: CSRF_TOKEN_COOKIE_NAME,
        value: encode(csrfToken),
        httpOnly: false, // MUST be accessible to client-side JS
        secure: true,
        sameSite: 'lax',
        path: '/',
    });

    // Set Is Guest user to false
    res.cookies.set(IS_GUEST_USER_COOKIE_NAME, JSON.stringify(false), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    });
    res.headers.set('x-guest-user', JSON.stringify(false));

    return res;
}
