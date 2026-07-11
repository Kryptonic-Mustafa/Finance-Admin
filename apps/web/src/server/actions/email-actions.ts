'use server';

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getEmails(category: string = "PRIMARY", type: "inbox" | "sent" = "inbox") {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    const emails = await prisma.internalEmail.findMany({
      where: type === "inbox" 
        ? { recipientId: session.id, category } 
        : { senderId: session.id },
      orderBy: { createdAt: "desc" }
    });

    return { success: true, emails };
  } catch (error) {
    console.error("Error fetching emails:", error);
    return { success: false, error: "Failed to load emails." };
  }
}

export async function sendEmail(
  recipientEmailOrEmails: string | string[],
  subject: string,
  body: string,
  category: string = "PRIMARY",
  ccEmails: string[] = [],
  bccEmails: string[] = []
) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    const toEmails = Array.isArray(recipientEmailOrEmails) ? recipientEmailOrEmails : [recipientEmailOrEmails];
    
    const uniqueTo = Array.from(new Set(toEmails.map(e => e.trim().toLowerCase()).filter(Boolean)));
    const uniqueCc = Array.from(new Set(ccEmails.map(e => e.trim().toLowerCase()).filter(Boolean)));
    const uniqueBcc = Array.from(new Set(bccEmails.map(e => e.trim().toLowerCase()).filter(Boolean)));

    const allRecipientEmails = Array.from(new Set([...uniqueTo, ...uniqueCc, ...uniqueBcc]));

    let sentCount = 0;
    for (const email of allRecipientEmails) {
      const recipient = await prisma.user.findUnique({
        where: { email }
      });

      if (recipient) {
        // Build a header summary in body for CC/BCC awareness
        let formattedBody = body.trim();
        const headerInfo = [];
        if (uniqueTo.length > 0) headerInfo.push(`To: ${uniqueTo.join(", ")}`);
        if (uniqueCc.length > 0) headerInfo.push(`Cc: ${uniqueCc.join(", ")}`);
        
        // Append header info at the very bottom of the body
        if (headerInfo.length > 0) {
          formattedBody += `\n\n---\n<span style="font-size: 11px; color: #94a3b8;">${headerInfo.join(" | ")}</span>`;
        }

        await prisma.internalEmail.create({
          data: {
            senderId: session.id,
            senderEmail: session.email,
            recipientId: recipient.id,
            recipientEmail: recipient.email,
            subject: subject.trim(),
            body: formattedBody,
            category,
            system: false
          }
        });
        sentCount++;
      }
    }

    if (sentCount === 0) {
      return { success: false, error: "No valid registered recipients found." };
    }

    revalidatePath("/inbox");
    return { success: true, message: `Email sent successfully to ${sentCount} recipient(s).` };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send email." };
  }
}

export async function markEmailAsRead(id: string) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized." };

    const email = await prisma.internalEmail.findUnique({ where: { id } });
    if (!email) return { success: false, error: "Email not found." };

    if (email.recipientId !== session.id) {
      return { success: false, error: "Forbidden." };
    }

    await prisma.internalEmail.update({
      where: { id },
      data: { read: true }
    });

    revalidatePath("/inbox");
    return { success: true };
  } catch (error) {
    console.error("Error marking email as read:", error);
    return { success: false, error: "Failed to mark email as read." };
  }
}

export async function getUnreadEmailCount() {
  try {
    const session = await verifySession();
    if (!session) return 0;

    const count = await prisma.internalEmail.count({
      where: {
        recipientId: session.id,
        read: false
      }
    });

    return count;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
}
