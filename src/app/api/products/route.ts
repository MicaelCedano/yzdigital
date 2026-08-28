import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getCurrentUser();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const brand = searchParams.get('brand') || '';
    const onlyActiveList = searchParams.get('onlyActiveList') === 'true' || searchParams.get('includeAll') !== 'true';

    // Determinar la lista de precios predeterminada
    const defaultList = await prisma.priceList.findFirst({
      where: { isDefault: true },
    }) || await prisma.priceList.findFirst();

    const targetPriceListId = defaultList?.id || null;

    // Filtro de productos
    const whereClause: any = {
      isActive: true,
    };

    // Si es vista de cliente o se pide solo lista activa:
    if (onlyActiveList && searchParams.get('includeAll') !== 'true') {
      whereClause.inActiveList = true;
    }

    if (search) {
      whereClause.OR = [
        { brand: { contains: search } },
        { model: { contains: search } },
        { capacity: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category && category !== 'all') {
      whereClause.categoryId = category;
    }

    if (brand && brand !== 'all') {
      whereClause.brand = brand;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        prices: {
          where: {
            isActive: true,
            ...(targetPriceListId ? { priceListId: targetPriceListId } : {}),
          },
        },
      },
      orderBy: [
        { sortOrder: 'asc' },
        { brand: 'asc' },
        { model: 'asc' },
      ],
    });

    const formattedProducts = products.map((product) => {
      const currentPrice = product.prices && product.prices.length > 0 ? product.prices[0] : null;
      return {
        ...product,
        currentPrice,
      };
    });

    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    const allBrands = await prisma.product.findMany({
      where: { isActive: true },
      select: { brand: true },
      distinct: ['brand'],
    });

    const brands = allBrands.map((b) => b.brand).filter(Boolean);

    return NextResponse.json({
      products: formattedProducts,
      categories,
      brands,
      totalCount: formattedProducts.length,
    });
  } catch (error: any) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: error.message || 'Error al consultar catálogo' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const data = await request.json();

    const {
      brand,
      model,
      capacity,
      imageUrl,
      price,
      priceTier2,
      priceTier3,
      inActiveList,
      categoryId,
    } = data;

    if (!brand || !model) {
      return NextResponse.json(
        { error: 'Marca y Modelo son obligatorios.' },
        { status: 400 }
      );
    }

    const brandUpper = brand.trim().toUpperCase();
    const modelTrim = model.trim();
    const capacityTrim = (capacity || 'N/A').trim();
    const priceNum = parseFloat(price) || 0;
    const priceTier2Num = priceTier2 == null ? Math.max(0, priceNum - 100) : Number(priceTier2) || 0;
    const priceTier3Num = priceTier3 == null ? Math.max(0, priceNum - 200) : Number(priceTier3) || 0;

    // Usar el grupo elegido; mantener compatibilidad con productos creados sin grupo explícito.
    let category = categoryId
      ? await prisma.category.findUnique({ where: { id: categoryId } })
      : await prisma.category.findFirst({ where: { name: { equals: brandUpper } } });

    if (categoryId && !category) {
      return NextResponse.json({ error: 'El grupo seleccionado no existe.' }, { status: 400 });
    }

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: brandUpper,
          slug: brandUpper.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          headerColor: '#111827',
          sortOrder: 99,
        },
      });
    }

    // Lista de precios predeterminada
    const defaultList = await prisma.priceList.findFirst({
      where: { isDefault: true },
    }) || await prisma.priceList.findFirst();

    if (!defaultList) {
      return NextResponse.json({ error: 'No se encontró lista de precios' }, { status: 400 });
    }

    const count = await prisma.product.count();
    const sku = `${brandUpper}-${modelTrim}-${capacityTrim}-${count + 1}`.replace(/[\s\/]+/g, '-');

    const product = await prisma.$transaction(async (tx) => {
      const newProd = await tx.product.create({
        data: {
          brand: brandUpper,
          model: modelTrim,
          capacity: capacityTrim,
          sku,
          imageUrl: imageUrl || null,
          inActiveList: inActiveList !== undefined ? Boolean(inActiveList) : true,
          stock: 20,
          isActive: true,
          categoryId: category.id,
          sortOrder: count + 1,
        },
      });

      await tx.productPrice.create({
        data: {
          productId: newProd.id,
          priceListId: defaultList.id,
          currency: defaultList.currency || 'DOP',
          priceTier1: priceNum,
          priceTier2: priceTier2Num,
          priceTier3: priceTier3Num,
          isActive: true,
          createdById: admin.id,
        },
      });

      return newProd;
    });

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: error.message || 'Error al guardar el producto' }, { status: 500 });
  }
}
