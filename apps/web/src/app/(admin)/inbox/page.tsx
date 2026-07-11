import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { InboxClient } from "@/components/inbox/inbox-client";
import { getUserPermissions } from "@/server/actions/permission-actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function InboxPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.canViewInbox) {
    redirect("/settings");
  }

  // Fetch all emails received by the user
  const receivedEmails = await prisma.internalEmail.findMany({
    where: { recipientId: session.id },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch all emails sent by the user
  const sentEmails = await prisma.internalEmail.findMany({
    where: { senderId: session.id },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch list of all other users in the system for the compose dropdown
  const otherUsers = await prisma.user.findMany({
    where: { 
      id: { not: session.id },
      status: "ACTIVE"
    },
    select: {
      name: true,
      email: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-7xl mx-auto h-[calc(100dvh-12rem)] md:h-[calc(100vh-8rem)] min-h-[400px]">
      <InboxClient 
        received={receivedEmails} 
        sent={sentEmails} 
        users={otherUsers} 
        currentUserId={session.id}
        canCompose={perms.canComposeEmail}
      />
    </div>
  );
}
