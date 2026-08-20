import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso exclusivo para administradores' }, { status: 403 });
    }

    const { id } = params;

    // Resetear dispositivo e IP vinculada
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        lockedDevice: null,
        lockedIp: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Dispositivo desvinculado con éxito para ${updatedUser.name}. Ahora puede iniciar sesión desde un nuevo dispositivo inmediatamente.`,
    });
  } catch (error) {
    console.error('Error al resetear dispositivo:', error);
    return NextResponse.json({ error: 'Error al resetear dispositivo del usuario' }, { status: 500 });
  }
}
