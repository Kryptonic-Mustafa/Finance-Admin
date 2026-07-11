import { prisma } from "@/lib/prisma";
import { SettingsForm } from "@/components/settings/settings-form";
import { UserCircle } from "lucide-react";
import { verifySession } from "@/lib/session";
import { getUserPermissions } from "@/server/actions/permission-actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.canViewSettings) {
    redirect("/dashboard");
  }

  // Fetch the actual current user data from the database
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, role: true, transactionPin: true }
  });

  if (!user) return null;

  const hasPin = !!user.transactionPin;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your profile, preferences, and account security.</p>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/30 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <UserCircle className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-secondary text-muted-foreground border border-border rounded-full">
              {user.role}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <SettingsForm user={user} hasPin={hasPin} canManageContacts={perms.canManageContacts} />
        </div>
      </div>
    </div>
  );
}
