import { prisma } from "@/lib/prisma";
import { ExcelUploader } from "@/components/imports/excel-uploader";
import { TruncateButton } from "@/components/imports/truncate-button";
import { verifySession } from "@/lib/session";
import { getUserPermissions } from "@/server/actions/permission-actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ImportsPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.canViewImports) {
    redirect("/settings");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Excel Imports</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload your raw bank statements or custom Excel files.</p>
        </div>
        {perms.canTruncateDatabase && (
          <TruncateButton userRole={session.role} />
        )}
      </div>

      <ExcelUploader categories={categories} disabled={!perms.canImportExcel} />
    </div>
  );
}
