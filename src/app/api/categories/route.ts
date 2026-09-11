import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function categorySlug(name: string) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';

    if (!name) {
      return NextResponse.json({ error: 'Escribe el nombre del grupo.' }, { status: 400 });
    }
    if (name.length > 60) {
      return NextResponse.json({ error: 'El nombre del grupo no puede pasar de 60 caracteres.' }, { status: 400 });
    }

    const normalizedName = name.toUpperCase();
    const slug = categorySlug(normalizedName);
    if (!slug) {
      return NextResponse.json({ error: 'El nombre debe incluir letras o números.' }, { status: 400 });
    }

    const existing = await prisma.category.findFirst({
      where: { name: { equals: normalizedName, mode: 'insensitive' } },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un grupo con ese nombre.' }, { status: 409 });
    }

    const lastCategory = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    });
    const category = await prisma.category.create({
      data: {
        name: normalizedName,
        slug,
        headerColor: '#111827',
        sortOrder: (lastCategory?.sortOrder ?? 0) + 10,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === 'UNAUTHORIZED' || error.message === 'FORBIDDEN')) {
      return NextResponse.json({ error: 'Acceso exclusivo para administradores.' }, { status: 403 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Ya existe un grupo con ese nombre.' }, { status: 409 });
    }
    console.error('Error al crear grupo de catálogo:', error);
    return NextResponse.json({ error: 'No se pudo crear el grupo.' }, { status: 500 });
  }
}
