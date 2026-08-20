import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function PATCH(
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
    const body = await request.json();
    const { status, isActive } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(typeof isActive === 'boolean' ? { isActive } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Usuario ${updatedUser.name} actualizado con estado: ${updatedUser.status}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        username: updatedUser.username,
        status: updatedUser.status,
        isActive: updatedUser.isActive,
      },
    });
  } catch (error) {
    console.error('Error al actualizar estado de usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
  }
}
