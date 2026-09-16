import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';
import { ensureAccessLogLocationSchema } from '@/lib/ensure-access-log-location-schema';

function readBodyCoordinate(value: unknown, min: number, max: number) {
  const coordinate = typeof value === 'number' ? value : Number.NaN;
  return Number.isFinite(coordinate) && coordinate >= min && coordinate <= max
    ? String(coordinate)
    : null;
}

function readLocationAccuracy(value: unknown) {
  const accuracy = typeof value === 'number' ? value : Number.NaN;
  return Number.isFinite(accuracy) && accuracy >= 0 && accuracy <= 1_000_000
    ? String(Math.round(accuracy))
    : null;
}

export async function POST(request: Request) {
  try {
    const { identifier, password, location } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Por favor complete todos los campos (usuario/correo y contraseña)' },
        { status: 400 }
      );
    }

    // Buscar usuario por correo o nombre de usuario
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase().trim() },
          { username: identifier.trim() },
        ],
      },
      include: {
        priceList: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifique su usuario y contraseña.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Esta cuenta ha sido desactivada. Comuníquese con administración.' },
        { status: 403 }
      );
    }

    // Verificar estado de aprobación de la cuenta
    if (user.status === 'PENDING') {
      return NextResponse.json(
        { error: '⏳ Tu solicitud de acceso está pendiente de aprobación por el administrador de YZ DIGITAL. Te notificaremos por WhatsApp.' },
        { status: 403 }
      );
    }

    if (user.status === 'REJECTED') {
      return NextResponse.json(
        { error: 'Tu solicitud de acceso no fue aprobada. Comunícate por WhatsApp con administración para más detalles.' },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifique su usuario y contraseña.' },
        { status: 401 }
      );
    }

    // La ubicación se exige a mayoristas para registrar cada acceso,
    // pero nunca se usa para bloquear por cambio de red, región o dispositivo.
    const currentIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                      request.headers.get('x-real-ip') ||
                      '127.0.0.1';
    const currentUserAgent = request.headers.get('user-agent') || 'Dispositivo Web';
    const deviceLatitude = readBodyCoordinate(location?.latitude, -90, 90);
    const deviceLongitude = readBodyCoordinate(location?.longitude, -180, 180);
    const locationAccuracy = readLocationAccuracy(location?.accuracy);
    const hasPreciseDeviceLocation = Boolean(
      deviceLatitude &&
      deviceLongitude &&
      locationAccuracy !== null &&
      Number(locationAccuracy) <= 500
    );

    if (user.role !== 'ADMIN' && !hasPreciseDeviceLocation) {
      return NextResponse.json(
        {
          error: '📍 Por seguridad, debes activar y permitir la ubicación precisa para usar YZ DIGITAL. Verifica el permiso de ubicación e inténtalo nuevamente.',
          locationRequired: true,
        },
        { status: 428 }
      );
    }

    // Actualizar última conexión y contador de accesos.
    const now = new Date();
    try {
      await ensureAccessLogLocationSchema();

      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: now,
          lastActiveAt: now,
          loginCount: { increment: 1 },
        },
      });

      await prisma.accessLog.create({
        data: {
          userId: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          action: 'LOGIN',
          ipAddress: currentIp,
          userAgent: currentUserAgent,
          locationCity: null,
          locationRegion: null,
          locationCountry: null,
          locationLatitude: deviceLatitude,
          locationLongitude: deviceLongitude,
          locationSource: hasPreciseDeviceLocation ? 'DEVICE' : null,
          locationAccuracy,
        },
      });
    } catch (e) {
      console.error('Error al registrar acceso de usuario:', e);
    }

    // Crear token JWT con información de sesión
    const sessionPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as 'ADMIN' | 'WHOLESALER',
      companyName: user.companyName,
      priceListId: user.priceListId,
    };

    const token = await createSessionToken(sessionPayload);

    // Configurar cookie HttpOnly
    cookies().set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // El dominio sin www redirige las API a www; compartir la sesión evita perderla en ese salto.
      ...(process.env.NODE_ENV === 'production' ? { domain: '.yzdigital.com.do' } : {}),
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        companyName: user.companyName,
        priceListId: user.priceListId,
        priceList: user.priceList,
      },
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error en el servidor al intentar iniciar sesión.' },
      { status: 500 }
    );
  }
}
