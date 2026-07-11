import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { prisma } from './prisma';

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  name: string;
  isMasterAdmin: boolean;
}

export async function verifySession(): Promise<SessionUser | null> {
  try {
    const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET || 'enterprise-super-secret-key-change-in-prod');
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    if (!payload.email) return null;

    const user = await prisma.user.findUnique({
      where: { email: payload.email as string },
      select: { id: true, email: true, role: true, name: true, status: true, isMasterAdmin: true }
    });

    if (!user || user.status !== 'ACTIVE') return null;

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      isMasterAdmin: user.isMasterAdmin
    };
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}
