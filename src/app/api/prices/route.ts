import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, getCurrentUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const priceListId = searchParams.get('priceListId');

    const priceLists = await prisma.priceList.findMany({
      orderBy: { createdAt: 'asc' },
    });

    let pricesQuery: any = {
      include: {
        product: {
          include: { category: true },
        },
        priceList: true,
        updatedBy: {
          select: { id: true, name: true, username: true },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    };

    if (priceListId) {
      pricesQuery.where = { priceListId };
    }

    const prices = await prisma.productPrice.findMany(pricesQuery);

    return NextResponse.json({ priceLists, prices });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al obtener precios' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const data = await request.json();

    const { action } = data; // 'CREATE_LIST', 'UPDATE_PRICE', 'DEACTIVATE_PRICE'

    if (action === 'CREATE_LIST') {
      const { name, description, currency, isDefault } = data;
      if (!name) {
        return NextResponse.json({ error: 'El nombre de la lista es requerido' }, { status: 400 });
      }

      if (isDefault) {
        // Desmarcar otras listas predeterminadas
        await prisma.priceList.updateMany({
          data: { isDefault: false },
        });
      }

      const newList = await prisma.priceList.create({
        data: {
          name,
          description: description || null,
          currency: currency || 'USD',
          isDefault: Boolean(isDefault),
        },
      });

      return NextResponse.json({ success: true, priceList: newList });
    }

    // UPDATE OR CREATE PRODUCT PRICE
    const {
      productId,
      priceListId,
      priceTier1,
      priceTier2,
      priceTier3,
      currency,
      validFrom,
      validUntil,
      isActive,
      reason,
    } = data;

    if (!productId || !priceListId) {
      return NextResponse.json({ error: 'Producto y Lista de Precios son requeridos' }, { status: 400 });
    }

    const tier1 = Number(priceTier1) || 0;
    // Si el administrador deja un nivel vacío, conserva el comportamiento
    // automático histórico. Un valor enviado explícitamente se respeta como manual.
    const tier2 = priceTier2 === null || priceTier2 === undefined || priceTier2 === ''
      ? Math.max(0, tier1 - 100)
      : Number(priceTier2);
    const tier3 = priceTier3 === null || priceTier3 === undefined || priceTier3 === ''
      ? Math.max(0, tier1 - 200)
      : Number(priceTier3);

    const existingPrice = await prisma.productPrice.findUnique({
      where: {
        productId_priceListId: {
          productId,
          priceListId,
        },
      },
    });

    const result = await prisma.$transaction(async (tx) => {
      let savedPrice;
      let auditAction = 'UPDATE';
      let oldData = null;

      if (existingPrice) {
        oldData = JSON.stringify({
          priceTier1: existingPrice.priceTier1,
          priceTier2: existingPrice.priceTier2,
          priceTier3: existingPrice.priceTier3,
          currency: existingPrice.currency,
          isActive: existingPrice.isActive,
          validFrom: existingPrice.validFrom,
          validUntil: existingPrice.validUntil,
        });

        if (isActive === false && existingPrice.isActive) {
          auditAction = 'DEACTIVATE';
        }

        savedPrice = await tx.productPrice.update({
          where: { id: existingPrice.id },
          data: {
            priceTier1: tier1,
            priceTier2: tier2,
            priceTier3: tier3,
            currency: currency || existingPrice.currency,
            validFrom: validFrom ? new Date(validFrom) : existingPrice.validFrom,
            validUntil: validUntil ? new Date(validUntil) : null,
            isActive: isActive !== undefined ? Boolean(isActive) : existingPrice.isActive,
            updatedById: admin.id,
          },
        });
      } else {
        auditAction = 'CREATE';
        savedPrice = await tx.productPrice.create({
          data: {
            productId,
            priceListId,
            priceTier1: tier1,
            priceTier2: tier2,
            priceTier3: tier3,
            currency: currency || 'USD',
            validFrom: validFrom ? new Date(validFrom) : new Date(),
            validUntil: validUntil ? new Date(validUntil) : null,
            isActive: isActive !== undefined ? Boolean(isActive) : true,
            createdById: admin.id,
            updatedById: admin.id,
          },
        });
      }

      const newData = JSON.stringify({
        priceTier1: savedPrice.priceTier1,
        priceTier2: savedPrice.priceTier2,
        priceTier3: savedPrice.priceTier3,
        currency: savedPrice.currency,
        isActive: savedPrice.isActive,
        validFrom: savedPrice.validFrom,
        validUntil: savedPrice.validUntil,
      });

      // Crear registro en la tabla de auditoría
      await tx.priceAuditLog.create({
        data: {
          productId,
          productPriceId: savedPrice.id,
          userId: admin.id,
          action: auditAction,
          oldData,
          newData,
          reason: reason || (auditAction === 'CREATE' ? 'Asignación de precio' : 'Ajuste de lista mayorista'),
        },
      });

      return savedPrice;
    });

    return NextResponse.json({ success: true, price: result });
  } catch (error: any) {
    console.error('Error al actualizar precios:', error);
    return NextResponse.json({ error: error.message || 'Error en gestión de precios' }, { status: 500 });
  }
}
