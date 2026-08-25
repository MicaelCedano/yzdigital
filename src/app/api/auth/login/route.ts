import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createSessionToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

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

    // -------------------------------------------------------------
    // BLOQUEO ANTI-COMPARTIR CUENTA / DISPOSITIVO ÚNICO (24 HORAS)
    // -------------------------------------------------------------
    const currentIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                      request.headers.get('x-real-ip') ||
                      '127.0.0.1';
    const currentUserAgent = request.headers.get('user-agent') || 'Dispositivo Web';
    const currentDeviceFingerprint = `${currentUserAgent.slice(0, 100)}|${currentIp}`;

    if (user.role !== 'ADMIN') {
      const hasBoundDevice = Boolean(user.lockedDevice);

      if (hasBoundDevice) {
        const isSameDevice = user.lockedDevice === currentDeviceFingerprint || user.lockedIp === currentIp;

        if (!isSameDevice) {
          // Dispositivo / ubicación diferente: verificar si pasaron 24 horas desde la última conexión
          const referenceTime = user.lastActiveAt
            ? new Date(user.lastActiveAt)
            : user.lastLoginAt
            ? new Date(user.lastLoginAt)
            : new Date(user.createdAt);
          const timeElapsedMs = Date.now() - referenceTime.getTime();
          const twentyFourHoursMs = 24 * 60 * 60 * 1000;

          if (timeElapsedMs < twentyFourHoursMs) {
            const hoursLeft = Math.ceil((twentyFourHoursMs - timeElapsedMs) / (60 * 60 * 1000));
            return NextResponse.json(
              {
                error: `🔒 Acceso restringido: Esta cuenta ya está vinculada a otro dispositivo/ubicación. Por políticas de seguridad mayorista, no se puede compartir ni abrir en otro lugar hasta que pasen 24 horas (faltan aprox. ${hoursLeft}h) o solicites al Administrador de YZ DIGITAL que desvincule tu dispositivo anterior.`
              },
              { status: 403 }
            );
          }
        }
      }
    }

    // Actualizar última conexión, vinculación de dispositivo y contador de accesos
    const now = new Date();
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: now,
          lastActiveAt: now,
          lockedDevice: currentDeviceFingerprint,
          lockedIp: currentIp,
          lastDeviceChangeAt: now,
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
