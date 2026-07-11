import { verifySession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getRolePermissions } from "@/server/actions/permission-actions";
import { PermissionsClient } from "./permissions-client";

export const dynamic = 'force-dynamic';

export default async function PermissionsPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  // Only Master Admin and Superadmin can access
  const isMasterAdmin = session.isMasterAdmin;
  const isSuperAdmin = session.role === "SUPERADMIN";

  if (!isMasterAdmin && !isSuperAdmin) {
    redirect("/dashboard");
  }

  const rolePermissions: Record<string, any> = {};
  
  if (isMasterAdmin) {
    rolePermissions["MASTER ADMIN"] = {
      canViewDashboard: true,
      canViewIncome: true,
      canCreateIncome: true,
      canUpdateIncome: true,
      canDeleteIncome: true,
      canViewExpense: true,
      canCreateExpense: true,
      canUpdateExpense: true,
      canDeleteExpense: true,
      canViewImports: true,
      canImportExcel: true,
      canTruncateDatabase: true,
      canViewInbox: true,
      canComposeEmail: true,
      canViewSettings: true,
      canManageContacts: true,
      canManagePermissions: true,
    };
  }

  const rolesToFetch = ["SUPERADMIN", "MEMBER", "USER"];
  for (const role of rolesToFetch) {
    rolePermissions[role] = await getRolePermissions(role);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Roles & Permissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure module access and CRUD privileges for user groups in the system.
        </p>
      </div>

      <PermissionsClient 
        initialPermissions={rolePermissions} 
        isMasterAdmin={isMasterAdmin}
      />
    </div>
  );
}
