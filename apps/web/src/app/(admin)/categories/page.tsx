import { prisma } from "@/lib/prisma";
import { CategoryManager } from "@/components/categories/category-manager";
import { verifySession } from "@/lib/session";
import { getUserPermissions } from "@/server/actions/permission-actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.canViewIncome && !perms.canViewExpense) {
    redirect("/settings");
  }

  // Fetch categories AND include the user who created them
  const categories = await prisma.category.findMany({
    include: { user: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
      <CategoryManager 
        categories={categories} 
        canCreate={perms.canCreateIncome || perms.canCreateExpense}
        canUpdate={perms.canUpdateIncome || perms.canUpdateExpense}
        canDelete={perms.canDeleteIncome || perms.canDeleteExpense}
      />
    </div>
  );
}
