import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, companyName, phone, city, username, email, password } = body;

    if (!name || !username || !password || !phone) {
      return NextResponse.json(
        { error: 'Por favor complete todos los campos requeridos (Nombre, Usuario, Contraseña y Teléfono/WhatsApp).' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    // El usuario inicia sesión con username; este valor solo satisface la
    // columna email heredada y no se muestra como correo de contacto.
    const cleanEmail = (email && email.trim()) ? email.trim().toLowerCase() : `${cleanUsername}@cuentas.yzdigital.local`;
    const cleanPhone = phone.trim();

    // Validar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: cleanEmail },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Ya existe una solicitud pendiente de aprobación con este usuario o correo.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Este nombre de usuario o correo ya está registrado en el sistema.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Crear usuario con estado PENDING
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        companyName: companyName ? companyName.trim() : null,
        city: city ? city.trim() : null,
        phone: cleanPhone,
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        role: 'WHOLESALER',
        status: 'PENDING',
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Solicitud de acceso enviada correctamente. El administrador revisará tu cuenta y la activará en breve.',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Error en registro de solicitud:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error al procesar tu solicitud. Intenta nuevamente.' },
      { status: 500 }
    );
  }
}
