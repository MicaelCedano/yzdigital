import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = Number(searchParams.get('limit')) || 50;

    const where: any = {};
    if (productId) {
      where.productId = productId;
    }

    const logs = await prisma.priceAuditLog.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            brand: true,
            model: true,
            capacity: true,
            sku: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener auditoría' }, { status: 500 });
  }
}
