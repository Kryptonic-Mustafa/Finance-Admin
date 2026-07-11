import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    // API Key authentication check
    const apiKey = request.headers.get('x-api-key');
    const expectedKey = process.env.INTERNAL_API_KEY || 'finance-admin-secret-api-key';
    if (!apiKey || apiKey !== expectedKey) {
      return NextResponse.json({ success: false, error: "Forbidden: Invalid API key" }, { status: 403 });
    }

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { familyHelpApproved: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Return status without caching headers
    const response = NextResponse.json({ 
      success: true, 
      approved: user.familyHelpApproved 
    });

    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
    return response;
  } catch (error) {
    console.error("Error in recovery status API:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
