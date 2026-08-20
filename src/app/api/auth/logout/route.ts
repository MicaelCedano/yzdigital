import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    cookies().delete(COOKIE_NAME);
    return NextResponse.json({ success: true, message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error al cerrar sesión' }, { status: 500 });
  }
}
