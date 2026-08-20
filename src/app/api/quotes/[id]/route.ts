import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true,
            phone: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: 'Cotización no encontrada' }, { status: 404 });
    }

    if (session.role !== 'ADMIN' && quote.userId !== session.id) {
      return NextResponse.json({ error: 'Acceso no permitido' }, { status: 403 });
    }

    return NextResponse.json({ quote });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener cotización' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;
    const { status, notes } = await request.json();

    const quote = await prisma.quote.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    return NextResponse.json({ success: true, quote });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al actualizar cotización' }, { status: 500 });
  }
}
