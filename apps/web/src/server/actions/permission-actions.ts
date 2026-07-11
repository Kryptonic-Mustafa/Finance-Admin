'use server';

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export type RolePermissionData = {
  canViewDashboard: boolean;
  canViewIncome: boolean;
  canCreateIncome: boolean;
  canUpdateIncome: boolean;
  canDeleteIncome: boolean;
  canViewExpense: boolean;
  canCreateExpense: boolean;
  canUpdateExpense: boolean;
  canDeleteExpense: boolean;
  canViewImports: boolean;
  canImportExcel: boolean;
  canTruncateDatabase: boolean;
  canViewInbox: boolean;
  canComposeEmail: boolean;
  canViewSettings: boolean;
  canManageContacts: boolean;
  canManagePermissions: boolean;
};

// Seed/Get permissions for a role
export async function getRolePermissions(role: string): Promise<RolePermissionData> {
  const normalizedRole = role.toUpperCase();
  
  // Find or create default permissions
  let perm = await prisma.rolePermission.findUnique({
    where: { role: normalizedRole }
  });

  if (!perm) {
    let defaults: RolePermissionData = {
      canViewDashboard: true,
      canViewIncome: true,
      canCreateIncome: normalizedRole !== "USER",
      canUpdateIncome: normalizedRole !== "USER",
      canDeleteIncome: normalizedRole === "SUPERADMIN",
      canViewExpense: true,
      canCreateExpense: normalizedRole !== "USER",
      canUpdateExpense: normalizedRole !== "USER",
      canDeleteExpense: normalizedRole === "SUPERADMIN",
      canViewImports: normalizedRole === "SUPERADMIN",
      canImportExcel: normalizedRole === "SUPERADMIN",
      canTruncateDatabase: false,
      canViewInbox: normalizedRole !== "USER",
      canComposeEmail: normalizedRole !== "USER",
      canViewSettings: normalizedRole !== "USER",
      canManageContacts: normalizedRole !== "USER",
      canManagePermissions: normalizedRole === "SUPERADMIN",
    };

    try {
      perm = await prisma.rolePermission.create({
        data: {
          role: normalizedRole,
          ...defaults
        }
      });
    } catch (err: any) {
      if (err.code === 'P2002') {
        perm = await prisma.rolePermission.findUnique({
          where: { role: normalizedRole }
        });
      }
      if (!perm) {
        throw err;
      }
    }
  }

  return {
    canViewDashboard: perm.canViewDashboard,
    canViewIncome: perm.canViewIncome,
    canCreateIncome: perm.canCreateIncome,
    canUpdateIncome: perm.canUpdateIncome,
    canDeleteIncome: perm.canDeleteIncome,
    canViewExpense: perm.canViewExpense,
    canCreateExpense: perm.canCreateExpense,
    canUpdateExpense: perm.canUpdateExpense,
    canDeleteExpense: perm.canDeleteExpense,
    canViewImports: perm.canViewImports,
    canImportExcel: perm.canImportExcel,
    canTruncateDatabase: perm.canTruncateDatabase,
    canViewInbox: perm.canViewInbox,
    canComposeEmail: perm.canComposeEmail,
    canViewSettings: perm.canViewSettings,
    canManageContacts: perm.canManageContacts,
    canManagePermissions: perm.canManagePermissions,
  };
}

// Fetch all permissions for a user
export async function getUserPermissions(userId: string): Promise<RolePermissionData & { isMasterAdmin: boolean; role: string }> {
  if (!userId) {
    return {
      isMasterAdmin: false,
      role: "USER",
      canViewDashboard: true,
      canViewIncome: true,
      canCreateIncome: false,
      canUpdateIncome: false,
      canDeleteIncome: false,
      canViewExpense: true,
      canCreateExpense: false,
      canUpdateExpense: false,
      canDeleteExpense: false,
      canViewImports: false,
      canImportExcel: false,
      canTruncateDatabase: false,
      canViewInbox: false,
      canComposeEmail: false,
      canViewSettings: false,
      canManageContacts: false,
      canManagePermissions: false,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isMasterAdmin: true, role: true }
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Master Admin has absolute privileges everywhere
  if (user.isMasterAdmin) {
    return {
      isMasterAdmin: true,
      role: user.role,
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

  // Otherwise, load role-based permissions
  const perms = await getRolePermissions(user.role);
  return {
    isMasterAdmin: false,
    role: user.role,
    ...perms
  };
}

// Update role permissions (restricted to Master Admin / Superadmin)
export async function updateRolePermissions(targetRole: string, data: Partial<RolePermissionData>) {
  const session = await verifySession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: { isMasterAdmin: true, role: true }
  });

  if (!currentUser) {
    return { success: false, error: "User not found" };
  }

  const normTarget = targetRole.toUpperCase();

  // Security Validation:
  // 1. Only Master Admin or Superadmin can change permissions
  if (!currentUser.isMasterAdmin && currentUser.role !== "SUPERADMIN") {
    return { success: false, error: "Forbidden: Insufficient privileges" };
  }

  // 2. Superadmin cannot modify SUPERADMIN permissions (only Master Admin can!)
  if (normTarget === "SUPERADMIN" && !currentUser.isMasterAdmin) {
    return { success: false, error: "Forbidden: Only Master Admin can modify Superadmin permissions" };
  }

  // 3. Prevent modifying Master Admin (not stored as role record)
  if (normTarget === "MASTER") {
    return { success: false, error: "Forbidden: Master Admin permissions cannot be modified" };
  }

  // Make sure the role permissions row exists
  await getRolePermissions(normTarget);

  await prisma.rolePermission.update({
    where: { role: normTarget },
    data: data
  });

  revalidatePath("/settings", "layout");
  return { success: true };
}

// Compute allowed paths for sidebar and page route guards
export async function getAllowedPaths(userId: string): Promise<string[]> {
  try {
    const perms = await getUserPermissions(userId);
    const paths = ["/settings"]; // Settings is always allowed

    if (perms.canViewDashboard) paths.push("/dashboard");
    if (perms.canViewIncome) paths.push("/income");
    if (perms.canViewExpense) paths.push("/expenses");
    if (perms.canViewIncome || perms.canViewExpense) {
      paths.push("/categories");
      paths.push("/transfers");
    }
    if (perms.canViewInbox) paths.push("/inbox");
    if (perms.canViewImports) paths.push("/imports");

    // User management and roles permissions are only accessible to Master Admin and Superadmin
    if (perms.isMasterAdmin || perms.role === "SUPERADMIN") {
      paths.push("/users");
      paths.push("/permissions");
    }

    return paths;
  } catch (error) {
    console.error("Error computing allowed paths:", error);
    return ["/settings"];
  }
}
