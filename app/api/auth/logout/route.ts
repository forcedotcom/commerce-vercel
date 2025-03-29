import { NextResponse } from 'next/server';
import { deleteSfdcAuthToken } from 'app/api/auth/authUtil';

export async function POST() {
  await deleteSfdcAuthToken()
  return NextResponse.json({ success: true }, { status: 200 });
}
