import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken, COOKIE_NAME, WHOLESALER_IDLE_TIMEOUT_MS } from '@/lib/auth';

export async function POST() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { lastActiveAt: true, role: true, isActive: true },
    });

    if (!user?.isActive) {
      cookies().set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        ...(process.env.NODE_ENV === 'production' ? { domain: '.yzdigital.com.do' } : {}),
        maxAge: 0,
      });
      return NextResponse.json({ error: 'La cuenta no está activa' }, { status: 401 });
    }

    const now = new Date();
    const isWholesalerIdle = user.role === 'WHOLESALER' &&
      (!user.lastActiveAt || now.getTime() - new Date(user.lastActiveAt).getTime() >= WHOLESALER_IDLE_TIMEOUT_MS);

    if (isWholesalerIdle) {
      cookies().set(COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        ...(process.env.NODE_ENV === 'production' ? { domain: '.yzdigital.com.do' } : {}),
        maxAge: 0,
      });
      return NextResponse.json({ error: 'Sesión cerrada por 30 minutos de inactividad' }, { status: 401 });
    }

    // Si la última actividad fue hace más de 30 minutos, se cuenta como un nuevo regreso/visita.
    const isReturningVisit = !user.lastActiveAt || (now.getTime() - new Date(user.lastActiveAt).getTime() > WHOLESALER_IDLE_TIMEOUT_MS);

    await prisma.user.update({
      where: { id: payload.id },
      data: {
        lastActiveAt: now,
        ...(isReturningVisit ? { lastLoginAt: now, loginCount: { increment: 1 } } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      activeAt: now.toISOString(),
      isReturningVisit,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Error en heartbeat' }, { status: 500 });
  }
}
