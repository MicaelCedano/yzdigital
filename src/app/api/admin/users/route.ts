import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifySessionToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
