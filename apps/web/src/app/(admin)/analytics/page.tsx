import { PieChart, Download } from "lucide-react";
import { DateFilter } from "@/components/dashboard/date-filter";
import { verifySession } from "@/lib/session";
import { getUserPermissions } from "@/server/actions/permission-actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.canViewIncome && !perms.canViewExpense) {
    redirect("/settings");
  }

  const canExportPDF = perms.isMasterAdmin || perms.role === "SUPERADMIN";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep dive into your financial metrics and trends.</p>
        </div>
        <div className="flex items-center gap-3">
          <DateFilter />
          {canExportPDF && (
            <button className="px-4 py-2 bg-white border border-border rounded-md text-sm font-medium shadow-sm hover:bg-secondary transition-all flex items-center gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-border rounded-xl shadow-sm h-80 flex flex-col items-center justify-center text-muted-foreground">
          <PieChart className="w-8 h-8 mb-2 opacity-20" />
          Income Distribution
        </div>
        <div className="bg-white border border-border rounded-xl shadow-sm h-80 flex flex-col items-center justify-center text-muted-foreground">
          <PieChart className="w-8 h-8 mb-2 opacity-20" />
          Expense Breakdown
        </div>
        <div className="bg-white border border-border rounded-xl shadow-sm h-80 flex flex-col items-center justify-center text-muted-foreground">
          <PieChart className="w-8 h-8 mb-2 opacity-20" />
          Savings Rate Trend
        </div>
      </div>
    </div>
  );
}
