import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    cookies().set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      ...(process.env.NODE_ENV === 'production' ? { domain: '.yzdigital.com.do' } : {}),
      maxAge: 0,
    });
    return NextResponse.json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 });
  }
}
