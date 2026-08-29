import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso exclusivo para administradores' }, { status: 403 });
    }

    const body = await request.json();
    const data: { name?: string; email?: string; shippingAddress?: string | null; passwordHash?: string } = {};
    if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
    if (typeof body.email === 'string' && body.email.trim()) data.email = body.email.trim().toLowerCase();
    if (typeof body.shippingAddress === 'string') data.shippingAddress = body.shippingAddress.trim() || null;
    if (typeof body.password === 'string' && body.password.length > 0) {
      if (body.password.length < 8) {
        return NextResponse.json({ error: 'La contraseña debe tener mínimo 8 caracteres.' }, { status: 400 });
      }
      data.passwordHash = await hashPassword(body.password);
    }
    if (!Object.keys(data).length) {
      return NextResponse.json({ error: 'No hay cambios para guardar.' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data,
      select: { id: true, name: true, username: true, email: true, role: true, status: true, isActive: true },
    });
    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'El correo ya está registrado.' }, { status: 409 });
    }
    console.error('Error al editar usuario admin:', error);
    return NextResponse.json({ error: 'No se pudo editar el usuario.' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso exclusivo para administradores' }, { status: 403 });
    }

    if (session.id === params.id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, status: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'La cuenta no existe.' }, { status: 404 });
    }

    if (target.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Solo se pueden eliminar cuentas rechazadas.' }, { status: 409 });
    }

    await prisma.$transaction(async (tx) => {
      // Estas relaciones no tienen borrado en cascada porque deben conservarse.
      await tx.productPrice.updateMany({
        where: { createdById: params.id },
        data: { createdById: null },
      });
      await tx.productPrice.updateMany({
        where: { updatedById: params.id },
        data: { updatedById: null },
      });
      await tx.user.delete({ where: { id: params.id } });
    });

    return NextResponse.json({ success: true, message: `La cuenta de ${target.name} fue eliminada.` });
  } catch (error) {
    console.error('Error al eliminar usuario rechazado:', error);
    return NextResponse.json({ error: 'No se pudo eliminar la cuenta.' }, { status: 500 });
  }
}
