import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: { name: true, headerColor: true },
    });

    const colors: Record<string, string> = {};
    categories.forEach((cat) => {
      colors[cat.name.toUpperCase()] = cat.headerColor;
    });

    return NextResponse.json({ success: true, colors });
  } catch (error) {
    console.error('Error fetching brand colors:', error);
    return NextResponse.json({ error: 'Error al obtener colores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { colors } = body; // { [brandName]: "#HEX" }

    if (!colors || typeof colors !== 'object') {
      return NextResponse.json({ error: 'Formato de colores inválido' }, { status: 400 });
    }

    // Actualizar cada categoría en la base de datos
    const updates = Object.entries(colors).map(async ([brandName, color]) => {
      const b = brandName.toUpperCase();
      const existing = await prisma.category.findFirst({
        where: { name: { equals: b } },
      });

      if (existing) {
        return prisma.category.update({
          where: { id: existing.id },
          data: { headerColor: color as string },
        });
      }
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Colores actualizados correctamente' });
  } catch (error) {
    console.error('Error updating brand colors:', error);
    return NextResponse.json({ error: 'Error al guardar colores' }, { status: 500 });
  }
}
