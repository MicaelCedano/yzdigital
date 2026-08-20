import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getAdminSession() {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  return session?.role === 'ADMIN' ? session : null;
}

export async function POST(request: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: 'Acceso exclusivo para administradores' }, { status: 403 });
    }

    const body = await request.json();
    const name = String(body.name || '').trim();
    const username = String(body.username || '').trim().toLowerCase();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = body.role === 'WHOLESALER' ? 'WHOLESALER' : 'ADMIN';
    const companyName = String(body.companyName || '').trim() || null;
    const phone = String(body.phone || '').trim() || null;
    const city = String(body.city || '').trim() || null;

    if (!name || !username || !email || password.length < 8) {
      return NextResponse.json(
        { error: 'Nombre, usuario, correo y una contraseña de mínimo 8 caracteres son obligatorios.' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: 'El usuario o correo ya está registrado.' }, { status: 409 });
    }

    const created = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash: await hashPassword(password),
        role,
        status: 'APPROVED',
        isActive: true,
        companyName,
        phone,
        city,
        ...(role === 'WHOLESALER'
          ? { priceListId: (await prisma.priceList.findFirst({ where: { isDefault: true } }))?.id }
          : {}),
      },
      select: { id: true, name: true, username: true, email: true, role: true, status: true },
    });

    return NextResponse.json({ success: true, user: created }, { status: 201 });
  } catch (error) {
    console.error('Error al crear administrador:', error);
    return NextResponse.json({ error: 'No se pudo crear el administrador.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso exclusivo para administradores' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status'); // 'PENDING' | 'APPROVED' | 'REJECTED' | 'ONLINE'

    // Obtener todos los usuarios
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        status: true,
        companyName: true,
        city: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        lastActiveAt: true,
        loginCount: true,
        lockedDevice: true,
        lockedIp: true,
        lastDeviceChangeAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calcular usuarios en línea (activos en los últimos 5 minutos)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const usersWithOnlineStatus = allUsers.map((u) => {
      const isOnline = u.lastActiveAt ? new Date(u.lastActiveAt) > fiveMinutesAgo : false;
      return {
        ...u,
        isOnline,
      };
    });

    // Contadores
    const stats = {
      total: allUsers.length,
      pending: allUsers.filter((u) => u.status === 'PENDING').length,
      approved: allUsers.filter((u) => u.status === 'APPROVED').length,
      rejected: allUsers.filter((u) => u.status === 'REJECTED').length,
      onlineNow: usersWithOnlineStatus.filter((u) => u.isOnline).length,
    };

    // Obtener últimos logs de acceso
    const recentAccessLogs = await prisma.accessLog.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    let filteredUsers = usersWithOnlineStatus;
    if (statusFilter === 'ONLINE') {
      filteredUsers = usersWithOnlineStatus.filter((u) => u.isOnline);
    } else if (statusFilter) {
      filteredUsers = usersWithOnlineStatus.filter((u) => u.status === statusFilter);
    }

    return NextResponse.json({
      success: true,
      users: filteredUsers,
      stats,
      recentAccessLogs,
    });
  } catch (error) {
    console.error('Error al listar usuarios admin:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
  }
}
