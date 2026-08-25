import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAdmin } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        prices: {
          where: { isActive: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const currentPrice = product.prices[0] || null;

    return NextResponse.json({
      product: {
        ...product,
        currentPrice,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al obtener producto' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    const { id } = params;
    const data = await request.json();

    const {
      brand,
      model,
      capacity,
      imageUrl,
      price,
      inActiveList,
      isActive,
      categoryId: requestedCategoryId,
    } = data;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { prices: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }

    const brandUpper = brand ? brand.trim().toUpperCase() : existing.brand;
    const modelTrim = model !== undefined ? model.trim() : existing.model;
    const capacityTrim = capacity !== undefined ? capacity.trim() : existing.capacity;

    // El grupo se puede cambiar independientemente de la marca.
    let categoryId = requestedCategoryId || existing.categoryId;
    if (requestedCategoryId) {
      const selectedCategory = await prisma.category.findUnique({ where: { id: requestedCategoryId } });
      if (!selectedCategory) {
        return NextResponse.json({ error: 'El grupo seleccionado no existe.' }, { status: 400 });
      }
    } else if (brand && brandUpper !== existing.brand) {
      let cat = await prisma.category.findFirst({ where: { name: brandUpper } });
      if (!cat) {
        cat = await prisma.category.create({
          data: {
            name: brandUpper,
            slug: brandUpper.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            headerColor: '#111827',
          },
        });
      }
      categoryId = cat.id;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const prod = await tx.product.update({
        where: { id },
        data: {
          brand: brandUpper,
          model: modelTrim,
          capacity: capacityTrim,
          imageUrl: imageUrl !== undefined ? imageUrl : existing.imageUrl,
          inActiveList: inActiveList !== undefined ? Boolean(inActiveList) : existing.inActiveList,
          isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
          categoryId,
        },
      });

      if (price !== undefined) {
        const priceNum = parseFloat(price) || 0;
        const defaultList = await tx.priceList.findFirst({ where: { isDefault: true } }) || await tx.priceList.findFirst();
        if (defaultList) {
          await tx.productPrice.upsert({
            where: {
              productId_priceListId: {
                productId: id,
                priceListId: defaultList.id,
              },
            },
            update: {
              priceTier1: priceNum,
              priceTier2: priceNum,
              priceTier3: priceNum,
              isActive: true,
              updatedById: admin.id,
            },
            create: {
              productId: id,
              priceListId: defaultList.id,
              currency: defaultList.currency || 'DOP',
              priceTier1: priceNum,
              priceTier2: priceNum,
              priceTier3: priceNum,
              isActive: true,
              createdById: admin.id,
            },
          });
        }
      }

      return prod;
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json({ error: error.message || 'Error al actualizar producto' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { id } = params;

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Producto eliminado' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al eliminar producto' }, { status: 500 });
  }
}
