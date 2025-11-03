import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Delete cookies by setting Max-Age=0
  for (const name of ['isAuthenticated', 'userType', 'accessToken']) {
    res.cookies.set(name, '', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 0,
    });
  }
  return res;
}
