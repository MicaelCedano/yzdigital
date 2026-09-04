import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super-secret-mayorista-price-list-token-key-2026'
);

export const COOKIE_NAME = 'auth_session_token';
export const WHOLESALER_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export interface UserSession {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'WHOLESALER';
  companyName?: string | null;
  priceListId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<UserSession | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const session = await verifySessionToken(token);
    if (!session) return null;

    // La expiración por inactividad aplica únicamente a cuentas mayoristas.
    // Se valida contra la actividad persistida para que también cubra llamadas directas a la API.
    if (session.role === 'WHOLESALER') {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
        select: { isActive: true, lastActiveAt: true },
      });

      if (!user?.isActive || !user.lastActiveAt || Date.now() - user.lastActiveAt.getTime() >= WHOLESALER_IDLE_TIMEOUT_MS) {
        return null;
      }
    }

    return session;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(): Promise<UserSession> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

export async function requireAdmin(): Promise<UserSession> {
  const user = await requireAuth();
  if (user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN');
  }
  return user;
}
