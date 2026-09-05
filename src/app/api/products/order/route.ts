import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { categoryId, productIds, automatic } = body;
    if (typeof categoryId !== 'string' || !Array.isArray(productIds) ||
        productIds.length === 0 || productIds.some((id: unknown) => typeof id !== 'string') ||
        new Set(productIds).size !== productIds.length || typeof automatic !== 'boolean') {
      return NextResponse.json({ error: 'El orden enviado no es válido.' }, { status: 400 });
    }
    const saved = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { categoryId, isActive: true, inActiveList: true }, select: { id: true } });
      const ids = new Set(productIds);
      if (products.length !== ids.size || products.some((p) => !ids.has(p.id))) return false;
      for (const [index, id] of (productIds as string[]).entries()) {
        await tx.product.update({ where: { id }, data: { sortOrder: automatic ? 0 : index - productIds.length } });
      }
      return true;
    }, { timeout: 30000 });
    if (!saved) return NextResponse.json({ error: 'Los productos del grupo cambiaron. Recarga la página antes de ordenar.' }, { status: 409 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const status = message === 'UNAUTHORIZED' ? 401 : message === 'FORBIDDEN' ? 403 : error instanceof SyntaxError ? 400 : 500;
    return NextResponse.json({ error: status === 500 ? 'No se pudo guardar el orden.' : status === 400 ? 'Solicitud inválida.' : 'Acceso no autorizado.' }, { status });
  }
}
