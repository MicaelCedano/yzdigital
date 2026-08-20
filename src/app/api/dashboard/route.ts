import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalProductsAvailable, totalPriceUpdatesRecent, totalOutOfStock, totalPendingQuotes] =
      await Promise.all([
        prisma.product.count({
          where: {
            isActive: true,
            stock: { gt: 0 },
            prices: {
              some: { isActive: true },
            },
          },
        }),
        prisma.productPrice.count({
          where: {
            isActive: true,
            updatedAt: { gte: sevenDaysAgo },
          },
        }),
        prisma.product.count({
          where: {
            isActive: true,
            stock: { lte: 0 },
          },
        }),
        prisma.quote.count({
          where: {
            status: 'PENDING',
            ...(session.role !== 'ADMIN' ? { userId: session.id } : {}),
          },
        }),
      ]);

    return NextResponse.json({
      metrics: {
        totalProductsAvailable,
        totalPriceUpdatesRecent,
        totalOutOfStock,
        totalPendingQuotes,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener métricas' }, { status: 500 });
  }
}
