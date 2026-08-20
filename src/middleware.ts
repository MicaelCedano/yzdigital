import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-mayorista-price-list-token-key-2026'
);

const COOKIE_NAME = 'auth_session_token';

// Rutas públicas que no requieren inicio de sesión
const PUBLIC_PATHS = [
  '/login',
  '/api/auth/login',
  '/api/auth/register-request',
  '/logo.png',
  '/favicon.ico',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorar archivos estáticos de Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Permitir rutas públicas explícitas
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  let session: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      session = payload;
    } catch (err) {
      session = null;
    }
  }

  // 1. Si NO tiene sesión iniciada -> Redirigir siempre al Login
  if (!session) {
    // Si es una llamada a la API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Debes iniciar sesión para acceder a los precios y datos mayoristas.' },
        { status: 401 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/' && pathname !== '/lista-precios') {
      loginUrl.searchParams.set('callbackUrl', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 2. Si intenta entrar a /admin/* y no es administrador
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (session.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Acceso exclusivo para administradores' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/lista-precios', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
