// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { serialize } from 'cookie';
import { SALESFORCE_TOKEN_URL, SFDC_AUTH_TOKEN_KEY } from 'lib/constants';

export async function POST(req: Request) {
    console.log('POST');
    const { username, password } = await req.json();
    
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('client_id', process.env.SALESFORCE_CONSUMER_KEY || '');
    params.append('client_secret', process.env.SALESFORCE_CONSUMER_SECRET || '');
    params.append('username', username);
    params.append('password', password);
      
    const response = await fetch(SALESFORCE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(), // Convert URLSearchParams to a string
    });

    const data = await response.json();
    if (!response.ok) {
        return NextResponse.json({ error: data.error_description || 'Invalid credentials' }, { status: 401 });
    }

    const cookie = serialize(SFDC_AUTH_TOKEN_KEY, data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600,
        path: '/',
    });

    return new NextResponse(null, {
        status: 200,
        headers: { 'Set-Cookie': cookie },
    });
}