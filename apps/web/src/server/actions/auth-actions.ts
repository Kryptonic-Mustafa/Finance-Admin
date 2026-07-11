'use server';

import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import { prisma } from '@/lib/prisma';

async function ensureCurrenciesExist() {
  const count = await prisma.currency.count();
  if (count === 0) {
    await prisma.currency.createMany({
      data: [
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' }
      ]
    });
  }
}

export async function handleLogin(email: string, password: string, rememberMe: boolean = false) {
  const SECRET_KEY = new TextEncoder().encode(process.env.SESSION_SECRET || 'enterprise-super-secret-key-change-in-prod');
  await ensureCurrenciesExist();

  if (email === 'admin@finance.local') {
    const adminExists = await prisma.user.findUnique({ where: { email: 'admin@finance.local' } });
    if (!adminExists) {
      await prisma.user.create({
        data: { name: "Master Admin", email: "admin@finance.local", password: "admin123", role: "SUPERADMIN", status: "ACTIVE", currencyCode: "USD" }
      });
    }
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || user.password !== password) return { success: false, error: 'Invalid email or password' };
  if (user.status !== 'ACTIVE') return { success: false, error: 'This account has been suspended.' };

  // Fetch the actual symbol for the user's currency
  const currency = await prisma.currency.findUnique({ where: { code: user.currencyCode || 'USD' } });
  const symbol = currency?.symbol || '$';

  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

  const token = await new SignJWT({ email: user.email, role: user.role, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(rememberMe ? '30d' : '24h')
    .sign(SECRET_KEY);

  const cookieStore = await cookies();
  
  cookieStore.set('auth_token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge });
  cookieStore.set('auth_role', user.role, { path: '/', maxAge });
  cookieStore.set('auth_name', user.name, { path: '/', maxAge });
  cookieStore.set('auth_user_id', user.id, { path: '/', maxAge });
  cookieStore.set('auth_currency_symbol', symbol, { path: '/', maxAge }); // NEW: Save symbol globally

  if (user.role === 'SUPERADMIN') {
    try {
      await prisma.income.updateMany({ where: { user_id: 'default-user' }, data: { user_id: user.id } });
      await prisma.expense.updateMany({ where: { user_id: 'default-user' }, data: { user_id: user.id } });
    } catch(e) {}
  }

  return { success: true };
}

export async function handleLogout() {
  const cookieStore = await cookies();
  ['auth_token', 'auth_role', 'auth_name', 'auth_user_id', 'impersonated_user', 'auth_currency_symbol'].forEach(c => cookieStore.delete(c));
  return { success: true };
}

export async function setImpersonationView(userId: string) {
  const cookieStore = await cookies();
  if (userId === 'all') {
    cookieStore.delete('impersonated_user');
  } else {
    cookieStore.set('impersonated_user', userId, { path: '/' });
  }
}

// NEW ACTION: Update user's currency
export async function updateUserCurrency(userId: string, currencyCode: string) {
  try {
    await prisma.user.update({ where: { id: userId }, data: { currencyCode } });
    const currency = await prisma.currency.findUnique({ where: { code: currencyCode } });
    
    // Update cookie so UI immediately reflects change
    const cookieStore = await cookies();
    cookieStore.set('auth_currency_symbol', currency?.symbol || '$', { path: '/', maxAge: 60 * 60 * 24 });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update currency." };
  }
}
