import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { IncomeTable } from "@/components/income/income-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { AddIncomeModal } from "@/components/income/add-income-modal";
import { verifySession } from "@/lib/session";
import { getUserPermissions } from "@/server/actions/permission-actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function IncomePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.canViewIncome) {
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

  // --- FILTER LOGIC ---
  const whereClause: any = (perms.isMasterAdmin && (!impersonated || impersonated === 'all')) ? {} : { user_id: targetUserId };
  
  let dateFilter: any = {};
  if (resolvedParams?.from) dateFilter.gte = new Date(resolvedParams.from);
  if (resolvedParams?.to) {
    const toDate = new Date(resolvedParams.to);
    toDate.setHours(23, 59, 59, 999);
    dateFilter.lte = toDate;
  }
  if (Object.keys(dateFilter).length > 0) whereClause.transaction_date = dateFilter;

  if (resolvedParams?.search) whereClause.source = { contains: resolvedParams.search };
  if (resolvedParams?.category) whereClause.category_id = resolvedParams.category;

  // Fetch Data & Categories for dropdown
  const incomes = await prisma.income.findMany({ where: whereClause, include: { category: true }, orderBy: { transaction_date: 'desc' } });
  const categories = await prisma.category.findMany({ where: { type: 'INCOME' }, orderBy: { name: 'asc' } });

  const serializedIncomes = incomes.map(inc => ({
    id: inc.id, source: inc.source, amount: Number(inc.amount), category: inc.category?.name || "Uncategorized",
    formatted_date: inc.transaction_date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
  }));

  const user = session.id ? await prisma.user.findUnique({
    where: { id: session.id },
    select: { transactionPin: true }
  }) : null;
  const hasPin = !!user?.transactionPin;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Income Management</h1>
        <div className="flex items-center gap-3">
          <DateRangePicker />
          {perms.canCreateIncome && (
            <AddIncomeModal categories={categories} sym={sym} hasPin={hasPin} />
          )}
        </div>
      </div>
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <IncomeTable 
          data={serializedIncomes} 
          sym={sym} 
          categories={categories}
          currentCategory={resolvedParams?.category || ''}
          currentSearch={resolvedParams?.search || ''}
          canDelete={perms.canDeleteIncome}
        />
      </div>
    </div>
  );
}
