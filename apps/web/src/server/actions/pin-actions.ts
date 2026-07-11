'use server';

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { sendPinResetEmail } from "@/lib/mail";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function requestPinReset() {
  try {
    const session = await verifySession();
    if (!session) {
      return { success: false, error: "Not authorized. Please log in again." };
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: session.id },
      select: { transactionPin: true }
    });
    const hasPin = !!userRecord?.transactionPin;
    const actionType = hasPin ? "Reset" : "Configure";

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour expiration

    await prisma.user.update({
      where: { id: session.id },
      data: {
        pinResetToken: token,
        pinResetExpires: expires
      }
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/settings/reset-pin?token=${token}`;

    // Send INTERNAL email (This works 100% of the time, in-system!)
    const internalEmailBody = `
      <div style="font-family: 'Outfit', sans-serif; padding: 24px; max-width: 500px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
        <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 20px; font-weight: 700; text-align: center;">Transaction PIN ${actionType}</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 24px;">You requested to ${hasPin ? 'reset' : 'configure'} your transaction security PIN for the Finance Admin Platform.</p>
        
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="${resetLink}" target="_top" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; transition: background-color 0.2s;">${actionType} Secure PIN</a>
        </div>
        
        <p style="color: #64748b; font-size: 11px; text-align: center; margin-top: 24px; border-t: 1px solid #f1f5f9; padding-top: 16px;">
          This link will expire in 1 hour. If you did not request this update, please review your account activity.
        </p>
      </div>
    `;

    await prisma.internalEmail.create({
      data: {
        senderId: null, // system sender
        senderEmail: "system@finance.local",
        recipientId: session.id,
        recipientEmail: session.email,
        subject: `${actionType} Your Transaction PIN`,
        body: internalEmailBody.trim(),
        category: "PRIMARY",
        system: true
      }
    });

    // Send optional external SMTP as secondary
    let smtpWarning = undefined;
    try {
      const emailResult = await sendPinResetEmail(session.email, resetLink);
      if (!emailResult.success && emailResult.warning) {
        smtpWarning = emailResult.warning;
      }
    } catch (e) {
      // Ignore SMTP failure since internal email succeeded
    }

    return { 
      success: true, 
      message: `PIN ${hasPin ? 'reset' : 'configuration'} link has been delivered to your internal inbox!`,
      warning: smtpWarning || "Note: You can check your dashboard Inbox to click the link."
    };
  } catch (error) {
    console.error("Error requesting PIN reset:", error);
    return { success: false, error: "An unexpected error occurred while requesting PIN update." };
  }
}

export async function verifyPinResetToken(token: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        pinResetToken: token,
        pinResetExpires: { gt: new Date() }
      }
    });
    return { valid: !!user };
  } catch (error) {
    return { valid: false };
  }
}

export async function resetPin(token: string, pin: string) {
  try {
    if (!/^\d{4}$/.test(pin)) {
      return { success: false, error: "PIN must be exactly 4 numeric digits." };
    }

    const user = await prisma.user.findFirst({
      where: {
        pinResetToken: token,
        pinResetExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return { success: false, error: "Invalid or expired PIN configuration link." };
    }

    const hashedPin = await bcrypt.hash(pin, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        transactionPin: hashedPin,
        pinResetToken: null,
        pinResetExpires: null
      }
    });

    return { success: true, message: "Transaction PIN configured successfully!" };
  } catch (error) {
    console.error("Error setting transaction PIN:", error);
    return { success: false, error: "Failed to configure Transaction PIN." };
  }
}

export async function hasTransactionPin() {
  try {
    const session = await verifySession();
    if (!session) return { hasPin: false };

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { transactionPin: true }
    });

    return { hasPin: !!user?.transactionPin };
  } catch (error) {
    return { hasPin: false };
  }
}
