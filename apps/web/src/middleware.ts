import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET || 'enterprise-super-secret-key-change-in-prod');
  const token = request.cookies.get('auth_token')?.value;
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  let isValid = false;
  if (token) {
    try {
      await jwtVerify(token, SECRET_KEY);
      isValid = true;
    } catch (e) {
      console.error("Middleware JWT verification failed:", e);
      isValid = false;
    }
  }

  // 1. No token or invalid token, and trying to access protected routes -> Auto Logout to /login
  if (!isValid && !isAuthPage) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    const cookiesToDelete = ['auth_token', 'auth_role', 'auth_name', 'auth_user_id', 'auth_currency_symbol', 'impersonated_user'];
    cookiesToDelete.forEach(c => response.cookies.delete(c));
    return response;
  }

  // 2. Has valid token and trying to access /login -> Redirect to dashboard
  if (isValid && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
