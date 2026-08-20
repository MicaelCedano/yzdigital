import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

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
      select: { lastActiveAt: true },
    });

    const now = new Date();
    // Si la última actividad fue hace más de 30 minutos, se cuenta como un nuevo regreso/visita
    const isReturningVisit = !user?.lastActiveAt || (now.getTime() - new Date(user.lastActiveAt).getTime() > 30 * 60 * 1000);

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
