'use server';

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getTransfers() {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    const transfers = await prisma.transfer.findMany({
      where: {
        OR: [
          { senderId: session.id },
          { recipientId: session.id }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, transfers };
  } catch (error) {
    console.error("Error fetching transfers:", error);
    return { success: false, error: "Failed to load transfers." };
  }
}

export async function createTransfer(recipientEmail: string, amount: number, notes: string, pin: string) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    if (amount <= 0) {
      return { success: false, error: "Transfer amount must be greater than zero." };
    }

    const recipient = await prisma.user.findUnique({
      where: { email: recipientEmail.trim().toLowerCase() }
    });

    if (!recipient) {
      return { success: false, error: `Recipient with email "${recipientEmail}" not found.` };
    }

    if (recipient.id === session.id) {
      return { success: false, error: "You cannot transfer money to yourself." };
    }

    // Verify Transaction PIN
    const user = await prisma.user.findUnique({
      where: { id: session.id }
    });

    if (user?.transactionPin) {
      if (!pin) {
        return { success: false, error: "Transaction PIN is required to complete this transfer." };
      }
      const isPinCorrect = await bcrypt.compare(pin, user.transactionPin);
      if (!isPinCorrect) {
        return { success: false, error: "Incorrect Transaction PIN. Authorization Denied." };
      }
    }

    // Fetch or create "Internal Transfer" category for both users
    let expenseCategory = await prisma.category.findFirst({
      where: { name: "Internal Transfer", type: "EXPENSE", userId: session.id }
    });
    if (!expenseCategory) {
      expenseCategory = await prisma.category.create({
        data: { name: "Internal Transfer", type: "EXPENSE", color: "#6366F1", userId: session.id }
      });
    }

    let incomeCategory = await prisma.category.findFirst({
      where: { name: "Internal Transfer", type: "INCOME", userId: recipient.id }
    });
    if (!incomeCategory) {
      incomeCategory = await prisma.category.create({
        data: { name: "Internal Transfer", type: "INCOME", color: "#10B981", userId: recipient.id }
      });
    }

    const currencyCode = user?.currencyCode || "USD";

    // Run as prisma transactions
    await prisma.$transaction([
      // Create transfer audit log
      prisma.transfer.create({
        data: {
          senderId: session.id,
          senderEmail: session.email,
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          amount: amount,
          notes: notes.trim()
        }
      }),
      // Create expense for sender
      prisma.expense.create({
        data: {
          user_id: session.id,
          category_id: expenseCategory.id,
          vendor: `Transfer to ${recipient.email}`,
          amount: amount,
          currency: currencyCode,
          transaction_date: new Date(),
          payment_mode: "Internal Transfer",
          notes: notes.trim()
        }
      }),
      // Create income for recipient
      prisma.income.create({
        data: {
          user_id: recipient.id,
          category_id: incomeCategory.id,
          source: `Transfer from ${session.email}`,
          amount: amount,
          currency: currencyCode,
          transaction_date: new Date(),
          payment_mode: "Internal Transfer",
          notes: notes.trim()
        }
      }),
      // Send notification email to recipient
      prisma.internalEmail.create({
        data: {
          senderId: null,
          senderEmail: "system@finance.local",
          recipientId: recipient.id,
          recipientEmail: recipient.email,
          subject: `Payment Received: ${amount} ${currencyCode}`,
          body: `
            <div style="font-family: 'Outfit', sans-serif; padding: 24px; max-width: 500px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
              <div style="text-align: center; margin-bottom: 16px;">
                <span style="font-size: 40px;">💰</span>
              </div>
              <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 20px; font-weight: 700; text-align: center;">Payment Received</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 24px;">
                You have received an internal transfer of <strong>${amount} ${currencyCode}</strong> from <strong>${session.name}</strong> (${session.email}).
              </p>
              
              <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 8px;"><strong style="font-size: 12px; color: #64748b; uppercase tracking-wider;">Amount:</strong><br><span style="font-size: 18px; font-weight: 700; color: #10b981;">${amount} ${currencyCode}</span></div>
                <div><strong style="font-size: 12px; color: #64748b; uppercase tracking-wider;">Notes:</strong><br><span style="font-size: 14px; color: #0f172a;">${notes.trim() || 'No notes provided.'}</span></div>
              </div>
              
              <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px; border-t: 1px solid #f1f5f9; padding-top: 16px;">
                This transaction has been successfully added to your Income ledger page.
              </p>
            </div>
          `.trim(),
          category: "PRIMARY",
          system: true
        }
      }),
      // Send notification email to sender
      prisma.internalEmail.create({
        data: {
          senderId: null,
          senderEmail: "system@finance.local",
          recipientId: session.id,
          recipientEmail: session.email,
          subject: `Payment Sent: ${amount} ${currencyCode}`,
          body: `
            <div style="font-family: 'Outfit', sans-serif; padding: 24px; max-width: 500px; margin: auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
              <div style="text-align: center; margin-bottom: 16px;">
                <span style="font-size: 40px;">📤</span>
              </div>
              <h2 style="color: #0f172a; margin-top: 0; margin-bottom: 8px; font-size: 20px; font-weight: 700; text-align: center;">Payment Sent</h2>
              <p style="color: #475569; font-size: 14px; line-height: 1.5; text-align: center; margin-bottom: 24px;">
                You have successfully transferred <strong>${amount} ${currencyCode}</strong> to <strong>${recipient.name}</strong> (${recipient.email}).
              </p>
              
              <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <div style="margin-bottom: 8px;"><strong style="font-size: 12px; color: #64748b; uppercase tracking-wider;">Recipient:</strong><br><span style="font-size: 14px; color: #0f172a;">${recipient.name} (${recipient.email})</span></div>
                <div style="margin-bottom: 8px;"><strong style="font-size: 12px; color: #64748b; uppercase tracking-wider;">Amount:</strong><br><span style="font-size: 18px; font-weight: 700; color: #ef4444;">${amount} ${currencyCode}</span></div>
                <div><strong style="font-size: 12px; color: #64748b; uppercase tracking-wider;">Notes:</strong><br><span style="font-size: 14px; color: #0f172a;">${notes.trim() || 'No notes provided.'}</span></div>
              </div>
              
              <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px; border-t: 1px solid #f1f5f9; padding-top: 16px;">
                This transaction has been successfully added to your Expense ledger page.
              </p>
            </div>
          `.trim(),
          category: "PRIMARY",
          system: true
        }
      })
    ]);

    revalidatePath("/transfers");
    revalidatePath("/dashboard");
    revalidatePath("/income");
    revalidatePath("/expenses");
    
    return { success: true, message: "Transfer processed successfully!" };
  } catch (error) {
    console.error("Error creating transfer:", error);
    return { success: false, error: "Failed to process internal transfer." };
  }
}
