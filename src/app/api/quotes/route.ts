import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { getTierPrice } from '@/lib/utils';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const where: any = {};
    if (session.role !== 'ADMIN') {
      where.userId = session.id;
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            companyName: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ quotes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener cotizaciones' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Debe iniciar sesión para generar una cotización' }, { status: 401 });
    }

    const data = await request.json();
    const { items, notes, companyName, phone } = data;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'La cotización no contiene productos' }, { status: 400 });
    }

    // Generar consecutivo de cotización
    const count = await prisma.quote.count();
    const currentYear = new Date().getFullYear();
    const quoteNumber = `COT-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

    // Obtener detalles actualizados de los productos y calcular precios exactos desde el servidor (no confiar solo en frontend)
    let totalAmount = 0;
    let totalUnits = 0;
    let currency = 'USD';

    // Obtener la lista de precios asignada al usuario
    let targetPriceListId = session.priceListId;
    if (!targetPriceListId) {
      const defaultList = await prisma.priceList.findFirst({ where: { isDefault: true } });
      targetPriceListId = defaultList?.id;
    }

    const quoteItemsData: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          prices: {
            where: {
              isActive: true,
              ...(targetPriceListId ? { priceListId: targetPriceListId } : {}),
            },
          },
        },
      });

      if (!product) {
        continue;
      }

      const priceRecord = product.prices[0] || (await prisma.productPrice.findFirst({ where: { productId: product.id, isActive: true } }));
      if (!priceRecord) {
        continue;
      }

      currency = priceRecord.currency;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const { price: unitPrice, tierLabel } = getTierPrice(qty, {
        tier1: priceRecord.priceTier1,
        tier2: priceRecord.priceTier2,
        tier3: priceRecord.priceTier3,
      });

      const subtotal = unitPrice * qty;
      totalAmount += subtotal;
      totalUnits += qty;

      quoteItemsData.push({
        productId: product.id,
        productName: `${product.brand} ${product.model} ${product.capacity}`,
        brand: product.brand,
        model: product.model,
        capacity: product.capacity,
        color: product.color || null,
        quantity: qty,
        unitPrice,
        subtotal,
        tierApplied: tierLabel,
      });
    }

    if (quoteItemsData.length === 0) {
      return NextResponse.json({ error: 'No se pudieron calcular precios válidos para los productos' }, { status: 400 });
    }

    // Crear la cotización en base de datos
    const quote = await prisma.quote.create({
      data: {
        quoteNumber,
        userId: session.id,
        customerName: session.name,
        customerEmail: session.email,
        companyName: companyName || session.companyName || null,
        phone: phone || null,
        notes: notes || null,
        currency,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalUnits,
        status: 'PENDING',
        items: {
          create: quoteItemsData,
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({ success: true, quote });
  } catch (error: any) {
    console.error('Error al generar cotización:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar la cotización' }, { status: 500 });
  }
}
