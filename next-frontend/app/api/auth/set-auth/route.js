import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { isAuthenticated = true, userType = null, accessToken = null } = body || {};

    const res = NextResponse.json({ ok: true });
    // Set an HttpOnly cookie so middleware (server) can read it reliably
    // SameSite=Lax allows same-site navigations; Secure is omitted for http://localhost
    res.cookies.set('isAuthenticated', isAuthenticated ? 'true' : 'false', {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });

    if (userType) {
      res.cookies.set('userType', userType, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });
    }

    if (accessToken) {
      res.cookies.set('accessToken', accessToken, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
      });
    }

    return res;
  } catch (err) {
    return NextResponse.json({ ok: false, error: 'Failed to set auth cookie' }, { status: 500 });
  }
}
