import { NextResponse } from 'next/server';
import { deleteCartIdCookie, deleteCsrfTokenCookie, deleteSfdcAuthToken, updateIsGuestUserToDefaultInCookie } from 'app/api/auth/cookieUtils';

export async function POST() {
  await deleteSfdcAuthToken();
  await deleteCsrfTokenCookie();
  await updateIsGuestUserToDefaultInCookie();
  return NextResponse.json({ success: true }, { status: 200 });
}
