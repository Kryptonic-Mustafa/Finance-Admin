import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { TransferClient } from "./transfer-client";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getUserPermissions } from "@/server/actions/permission-actions";

export const dynamic = 'force-dynamic';

export default async function TransfersPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.canViewIncome && !perms.canViewExpense) {
    redirect("/settings");
  }

  // Fetch potential recipients, transfers, and pin setup info concurrently
  const [otherUsers, transfers, userRecord] = await Promise.all([
    prisma.user.findMany({
      where: { 
        id: { not: session.id },
        status: "ACTIVE"
      },
      select: {
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    }),
    prisma.transfer.findMany({
      where: {
        OR: [
          { senderId: session.id },
          { recipientId: session.id }
        ]
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.findUnique({
      where: { id: session.id },
      select: { transactionPin: true }
    })
  ]);

  const hasPin = !!userRecord?.transactionPin;

  // Retrieve currency symbol
  const cookieStore = await cookies();
  const sym = cookieStore.get('auth_currency_symbol')?.value || '$';

  // Serialize transfers Decimal to number
  const serializedTransfers = transfers.map(t => ({
    id: t.id,
    senderId: t.senderId,
    senderEmail: t.senderEmail,
    recipientId: t.recipientId,
    recipientEmail: t.recipientEmail,
    amount: Number(t.amount),
    notes: t.notes,
    createdAt: t.createdAt
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Internal Transfers</h1>
        <p className="text-sm text-muted-foreground">Instantly transfer funds between family member accounts in real-time.</p>
      </div>

      <TransferClient 
        users={otherUsers} 
        transfers={serializedTransfers} 
        hasPin={hasPin} 
        sym={sym} 
        currentUserEmail={session.email} 
        canCreate={perms.canCreateIncome || perms.canCreateExpense}
      />
    </div>
  );
}
