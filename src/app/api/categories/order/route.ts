import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const categoryIds = Array.isArray(body.categoryIds) ? body.categoryIds : [];

    if (categoryIds.length === 0 || categoryIds.some((id: unknown) => typeof id !== 'string')) {
      return NextResponse.json({ error: 'Debes enviar el orden de los grupos.' }, { status: 400 });
    }

    await prisma.$transaction(
      categoryIds.map((id: string, index: number) =>
        prisma.category.update({
          where: { id },
          data: { sortOrder: (index + 1) * 10 },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al ordenar grupos:', error);
    return NextResponse.json({ error: error.message || 'No se pudo guardar el orden' }, { status: 500 });
  }
}
