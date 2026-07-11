import { prisma } from "@/lib/prisma";
import { UserTable } from "@/components/users/user-table";
import { verifySession } from "@/lib/session";
import { getUserPermissions } from "@/server/actions/permission-actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.isMasterAdmin && perms.role !== "SUPERADMIN") {
    redirect("/settings");
  }

  // Fetch real users from the database
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <UserTable initialUsers={users} isMasterAdmin={perms.isMasterAdmin} />
    </div>
  );
}
