import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ArrowDownRight, ArrowUpRight, Wallet } from "lucide-react";
import { TransactionChart } from "@/components/dashboard/transaction-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { DateRangePicker } from "@/components/ui/date-range-picker";

import { verifySession } from "@/lib/session";
import { getUserPermissions } from "@/server/actions/permission-actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.canViewDashboard) {
    redirect("/settings");
  }

  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const impersonated = cookieStore.get('impersonated_user')?.value || session.id;
  const sym = cookieStore.get('auth_currency_symbol')?.value || '$';

  let targetUserId = session.id;
  if (perms.isMasterAdmin && impersonated && impersonated !== 'all') {
    targetUserId = impersonated;
  }

  // --- DATE FILTERING LOGIC ---
  let dateFilter: any = {};
  if (resolvedParams?.from) dateFilter.gte = new Date(resolvedParams.from);
  if (resolvedParams?.to) {
    const toDate = new Date(resolvedParams.to);
    toDate.setHours(23, 59, 59, 999); // Include entire end day
    dateFilter.lte = toDate;
  }

  const whereClause: any = (perms.isMasterAdmin && (!impersonated || impersonated === 'all')) ? {} : { user_id: targetUserId };
  if (Object.keys(dateFilter).length > 0) {
    whereClause.transaction_date = dateFilter;
  }

  const incomes = await prisma.income.findMany({ where: whereClause, include: { category: true } });
  const expenses = await prisma.expense.findMany({ where: whereClause, include: { category: true } });

  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const balance = totalIncome - totalExpense;

  const serializedIncomes = incomes.map(i => ({ amount: Number(i.amount), transaction_date: i.transaction_date.toISOString(), category: i.category?.name || "Uncategorized", desc: i.source }));
  const serializedExpenses = expenses.map(e => ({ amount: Number(e.amount), transaction_date: e.transaction_date.toISOString(), category: e.category?.name || "Uncategorized", desc: e.vendor }));

  const allTx = [
    ...incomes.map(i => ({ desc: i.source, amount: Number(i.amount), dateRaw: i.transaction_date, isIncome: true })),
    ...expenses.map(e => ({ desc: e.vendor, amount: Number(e.amount), dateRaw: e.transaction_date, isIncome: false }))
  ].sort((a, b) => b.dateRaw.getTime() - a.dateRaw.getTime()).slice(0, 5);

  const formattedTx = allTx.map(tx => ({ ...tx, date: tx.dateRaw.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' }) }));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold text-foreground tracking-tight">Dashboard Overview</h1></div>
        {/* NEW: Date Picker Added to Dashboard */}
        <DateRangePicker />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4"><span className="text-sm font-medium text-muted-foreground">Total Balance</span><div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center"><Wallet className="w-5 h-5 text-primary" /></div></div>
          <span className="text-3xl font-semibold text-foreground">{sym}{balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4"><span className="text-sm font-medium text-muted-foreground">Total Income</span><div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center"><ArrowUpRight className="w-5 h-5 text-emerald-600" /></div></div>
          <span className="text-3xl font-semibold text-emerald-600">{sym}{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4"><span className="text-sm font-medium text-muted-foreground">Total Expenses</span><div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><ArrowDownRight className="w-5 h-5 text-red-600" /></div></div>
          <span className="text-3xl font-semibold text-foreground">{sym}{totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionChart incomes={serializedIncomes} expenses={serializedExpenses} sym={sym} />
        </div>
        <div className="lg:col-span-1">
          <div className="bg-primary text-primary-foreground p-6 rounded-xl shadow-premium h-[400px] flex flex-col justify-between">
            <div><h3 className="text-lg font-semibold">Data Visibility</h3><p className="text-primary-foreground/70 text-sm mt-1">{impersonated === 'all' ? 'Showing Global Data' : 'Showing User Filtered Data'}</p></div>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm"><div className="text-sm text-primary-foreground/80 mb-1">Incomes Found</div><div className="text-2xl font-semibold">{incomes.length} Records</div></div>
              <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm"><div className="text-sm text-primary-foreground/80 mb-1">Expenses Found</div><div className="text-2xl font-semibold">{expenses.length} Records</div></div>
            </div>
          </div>
        </div>
      </div>
      <RecentTransactions transactions={formattedTx} sym={sym} />
    </div>
  );
}
