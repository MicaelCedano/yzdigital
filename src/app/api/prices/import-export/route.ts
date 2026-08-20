import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const priceListId = searchParams.get('priceListId');
    const format = searchParams.get('format') || 'xlsx'; // 'xlsx' | 'csv' | 'json'

    let targetPriceList = null;
    if (priceListId) {
      targetPriceList = await prisma.priceList.findUnique({ where: { id: priceListId } });
    }
    if (!targetPriceList) {
      targetPriceList = await prisma.priceList.findFirst({ where: { isDefault: true } });
    }
    if (!targetPriceList) {
      targetPriceList = await prisma.priceList.findFirst();
    }

    if (!targetPriceList) {
      return NextResponse.json({ error: 'No se encontró una lista de precios' }, { status: 400 });
    }

    // Obtener todos los productos con el precio de esta lista
    const products = await prisma.product.findMany({
      include: {
        category: true,
        prices: {
          where: { priceListId: targetPriceList.id },
        },
      },
      orderBy: [{ brand: 'asc' }, { model: 'asc' }],
    });

    const exportRows = products.map((p) => {
      const price = p.prices[0];
      return {
        SKU: p.sku,
        Marca: p.brand,
        Modelo: p.model,
        Capacidad: p.capacity,
        Color: p.color || '',
        Categoria: p.category.name,
        Stock: p.stock,
        Moneda: price ? price.currency : targetPriceList.currency,
        'Precio_1_a_9_uds': price ? price.priceTier1 : 0,
        'Precio_10_a_49_uds': price ? price.priceTier2 : 0,
        'Precio_50_mas_uds': price ? price.priceTier3 : 0,
        Estado_Precio: price ? (price.isActive ? 'ACTIVO' : 'INACTIVO') : 'SIN PRECIO',
        Descripcion: p.description || '',
      };
    });

    if (format === 'json') {
      return NextResponse.json({ rows: exportRows, priceList: targetPriceList });
    }

    // Generar archivo Excel con SheetJS
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lista_Precios');

    if (format === 'csv') {
      const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
      return new NextResponse(csvOutput, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="lista_precios_${targetPriceList.name.replace(/\s+/g, '_')}.csv"`,
        },
      });
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="lista_precios_${targetPriceList.name.replace(/\s+/g, '_')}.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Error al exportar lista:', error);
    return NextResponse.json({ error: error.message || 'Error al exportar' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const { items, priceListId, reason } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'No se enviaron datos para importar' }, { status: 400 });
    }

    let targetPriceListId = priceListId;
    if (!targetPriceListId) {
      const defaultList = await prisma.priceList.findFirst({ where: { isDefault: true } });
      targetPriceListId = defaultList?.id;
    }

    if (!targetPriceListId) {
      return NextResponse.json({ error: 'Debe especificar una lista de precios de destino' }, { status: 400 });
    }

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    // Procesar cada fila
    for (let index = 0; index < items.length; index++) {
      const row = items[index];
      const sku = (row.SKU || row.sku || row.Sku || '').toString().trim();
      const brand = (row.Marca || row.marca || row.Brand || row.brand || '').toString().trim();
      const model = (row.Modelo || row.modelo || row.Model || row.model || '').toString().trim();
      const capacity = (row.Capacidad || row.capacidad || row.Capacity || '').toString().trim();
      const color = (row.Color || row.color || '').toString().trim();
      const categoryName = (row.Categoria || row.categoria || row.Category || 'General').toString().trim();
      const stock = Number(row.Stock || row.stock || 0);
      const currency = (row.Moneda || row.moneda || 'USD').toString().trim();

      const tier1 = Number(row.Precio_1_a_9_uds || row.precio_1_a_9 || row.Tier1 || row.tier1 || row.Precio || row.precio || 0);
      const tier2 = Number(row.Precio_10_a_49_uds || row.precio_10_a_49 || row.Tier2 || row.tier2 || tier1);
      const tier3 = Number(row.Precio_50_mas_uds || row.precio_50_mas || row.Tier3 || row.tier3 || tier2);

      if (!sku) {
        errors.push(`Fila ${index + 1}: SKU vacío ignorado.`);
        continue;
      }

      try {
        // 1. Buscar o crear categoría
        let category = await prisma.category.findFirst({
          where: { name: { equals: categoryName } },
        });
        if (!category) {
          category = await prisma.category.create({
            data: {
              name: categoryName,
              slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            },
          });
        }

        // 2. Buscar o crear producto
        let product = await prisma.product.findUnique({ where: { sku } });
        if (!product) {
          if (!brand || !model) {
            errors.push(`Fila ${index + 1} (${sku}): Falta marca o modelo para crear nuevo producto.`);
            continue;
          }
          product = await prisma.product.create({
            data: {
              sku,
              brand,
              model,
              capacity: capacity || 'N/A',
              color: color || null,
              stock,
              categoryId: category.id,
              isActive: true,
            },
          });
          createdCount++;
        } else {
          // Actualizar producto si se brindan nuevos datos
          await prisma.product.update({
            where: { id: product.id },
            data: {
              stock: stock !== undefined ? stock : product.stock,
              color: color || product.color,
            },
          });
          updatedCount++;
        }

        // 3. Crear o actualizar precio
        const existingPrice = await prisma.productPrice.findUnique({
          where: {
            productId_priceListId: {
              productId: product.id,
              priceListId: targetPriceListId,
            },
          },
        });

        const oldData = existingPrice ? JSON.stringify(existingPrice) : null;

        const savedPrice = await prisma.productPrice.upsert({
          where: {
            productId_priceListId: {
              productId: product.id,
              priceListId: targetPriceListId,
            },
          },
          update: {
            priceTier1: tier1,
            priceTier2: tier2,
            priceTier3: tier3,
            currency,
            isActive: true,
            updatedById: admin.id,
          },
          create: {
            productId: product.id,
            priceListId: targetPriceListId,
            currency,
            priceTier1: tier1,
            priceTier2: tier2,
            priceTier3: tier3,
            isActive: true,
            createdById: admin.id,
            updatedById: admin.id,
          },
        });

        // Registrar auditoría de la importación
        await prisma.priceAuditLog.create({
          data: {
            productId: product.id,
            productPriceId: savedPrice.id,
            userId: admin.id,
            action: 'IMPORT',
            oldData,
            newData: JSON.stringify({
              priceTier1: tier1,
              priceTier2: tier2,
              priceTier3: tier3,
              currency,
            }),
            reason: reason || 'Importación masiva Excel/CSV',
          },
        });
      } catch (err: any) {
        errors.push(`Fila ${index + 1} (${sku}): ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Importación completada: ${createdCount} productos nuevos, ${updatedCount} actualizados.`,
      createdCount,
      updatedCount,
      errors,
    });
  } catch (error: any) {
    console.error('Error en importación:', error);
    return NextResponse.json({ error: error.message || 'Error al procesar archivo' }, { status: 500 });
  }
}
