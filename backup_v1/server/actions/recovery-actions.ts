'use server';

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// ==========================================
// 1. PASSWORD RECOVERY ACTIONS (HYBRID)
// ==========================================

async function sendSystemEmailDirect(recipientId: string, recipientEmail: string, subject: string, body: string) {
  return await prisma.internalEmail.create({
    data: {
      senderId: null, // NULL senderId indicates System sender
      senderEmail: "security@finance.local",
      recipientId,
      recipientEmail,
      subject,
      body,
      category: "PRIMARY",
      system: true
    }
  });
}

export async function initiatePasswordRecovery(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return { success: false, error: "User with this email was not found." };
    }

    return { 
      success: true, 
      hasPin: !!user.transactionPin,
      name: user.name
    };
  } catch (error) {
    console.error("Error initiating recovery:", error);
    return { success: false, error: "An error occurred. Please try again." };
  }
}

export async function verifyPinAndSendOtp(email: string, pin: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    if (!user.transactionPin) {
      return { success: false, error: "Verification failed: No Transaction PIN configured." };
    }

    const isPinCorrect = await bcrypt.compare(pin.trim(), user.transactionPin);
    if (!isPinCorrect) {
      return { success: false, error: "Verification failed: PIN is incorrect." };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOtp: otp,
        passwordResetOtpExpires: expiry,
        familyHelpApproved: false,
        familyHelpRequestedAt: null
      }
    });

    // Return the OTP directly — user is logged out so they cannot access the inbox.
    // The OTP is displayed on-screen as a secure one-time code.
    return { success: true, otp, message: "Your verification code has been generated." };
  } catch (error) {
    console.error("Error verifying PIN & sending OTP:", error);
    return { success: false, error: "Failed to send OTP code." };
  }
}

export async function resendRecoveryOtp(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetOtp: otp,
        passwordResetOtpExpires: expiry
      }
    });

    // Return the new OTP directly — user is logged out so they cannot access the inbox.
    return { success: true, otp };
  } catch (error) {
    console.error("Error resending OTP:", error);
    return { success: false, error: "Failed to resend OTP." };
  }
}

export async function verifyOtp(email: string, otp: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) return { success: false, error: "User not found." };
    if (!user.passwordResetOtp || user.passwordResetOtp !== otp.trim()) {
      return { success: false, error: "Verification failed: OTP is incorrect." };
    }

    if (!user.passwordResetOtpExpires || user.passwordResetOtpExpires < new Date()) {
      return { success: false, error: "Verification failed: OTP has expired." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: "Verification failed." };
  }
}

export async function requestFamilyHelp(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) return { success: false, error: "User not found." };

    await prisma.user.update({
      where: { id: user.id },
      data: {
        familyHelpRequestedAt: new Date(),
        familyHelpApproved: false,
        passwordResetOtp: null,
        passwordResetOtpExpires: null
      }
    });

    // Send alert emails to all other users in the system
    const otherUsers = await prisma.user.findMany({
      where: { id: { not: user.id } }
    });

    for (const u of otherUsers) {
      await sendSystemEmailDirect(
        u.id,
        u.email,
        "ALERT: Password Reset Verification Request",
        `<div style="font-family: sans-serif; padding: 20px; color: #334155;">
          <h2 style="color: #e11d48; margin-bottom: 16px;">Security Authorization Alert</h2>
          <p><strong>${user.name}</strong> (${user.email}) is locked out and has requested password reset assistance.</p>
          <p>If you recognize this request, please log in and approve it in <strong>System Settings</strong> to allow them to reset their password.</p>
        </div>`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error requesting family help:", error);
    return { success: false, error: "Failed to submit request." };
  }
}

export async function checkFamilyHelpStatus(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { familyHelpApproved: true }
    });

    return { success: true, approved: user?.familyHelpApproved || false };
  } catch (error) {
    console.error("Error checking help status:", error);
    return { success: false, approved: false };
  }
}

export async function resetPasswordAfterRecovery(email: string, newPassword: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });

    if (!user) return { success: false, error: "User not found." };

    // Reset password and clear recovery flags
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPassword,
        passwordResetOtp: null,
        passwordResetOtpExpires: null,
        familyHelpApproved: false,
        familyHelpRequestedAt: null
      }
    });

    return { success: true };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Failed to reset password." };
  }
}

// ==========================================
// 2. CONTACTS MANAGEMENT ACTIONS
// ==========================================

export async function getContacts() {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    const contacts = await prisma.contact.findMany({
      where: { userId: session.id },
      orderBy: { name: "asc" }
    });

    return { success: true, contacts };
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return { success: false, error: "Failed to fetch contacts." };
  }
}

export async function createContact(name: string, email: string, groupName: string = "Family") {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    if (!name.trim() || !email.trim()) {
      return { success: false, error: "Name and email are required." };
    }

    const contact = await prisma.contact.create({
      data: {
        userId: session.id,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        groupName: groupName.trim()
      }
    });

    revalidatePath("/settings");
    revalidatePath("/inbox");
    return { success: true, contact };
  } catch (error) {
    console.error("Error creating contact:", error);
    return { success: false, error: "Failed to create contact." };
  }
}

export async function deleteContact(id: string) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact || contact.userId !== session.id) {
      return { success: false, error: "Contact not found or forbidden." };
    }

    await prisma.contact.delete({ where: { id } });

    revalidatePath("/settings");
    revalidatePath("/inbox");
    return { success: true };
  } catch (error) {
    console.error("Error deleting contact:", error);
    return { success: false, error: "Failed to delete contact." };
  }
}

// Action for co-members to view and approve help requests
export async function getPendingHelpRequests() {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    const requests = await prisma.user.findMany({
      where: {
        id: { not: session.id },
        familyHelpRequestedAt: { not: null },
        familyHelpApproved: false
      },
      select: {
        id: true,
        name: true,
        email: true,
        familyHelpRequestedAt: true
      }
    });

    return { success: true, requests };
  } catch (error) {
    console.error("Error fetching help requests:", error);
    return { success: false, error: "Failed to fetch help requests." };
  }
}

export async function approveFamilyHelpRequest(targetUserId: string) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        familyHelpApproved: true
      }
    });

    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("Error approving help request:", error);
    return { success: false, error: "Failed to approve request." };
  }
}
