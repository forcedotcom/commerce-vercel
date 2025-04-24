import { NextResponse } from 'next/server';
import { deleteCartIdCookie, deleteCsrfTokenCookie, deleteSfdcAuthToken, updateIsGuestUserToDefaultInCookie } from 'app/api/auth/authUtil';

export async function POST() {
  await deleteSfdcAuthToken();
  await deleteCsrfTokenCookie();
  await deleteCartIdCookie();
  await updateIsGuestUserToDefaultInCookie();
  return NextResponse.json({ success: true }, { status: 200 });
}
