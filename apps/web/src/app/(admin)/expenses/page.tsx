import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { ExpenseTable } from "@/components/expenses/expense-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { AddExpenseModal } from "@/components/expenses/add-expense-modal";
import { verifySession } from "@/lib/session";
import { getUserPermissions } from "@/server/actions/permission-actions";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const session = await verifySession();
  if (!session) {
    redirect("/login");
  }

  const perms = await getUserPermissions(session.id);
  if (!perms.canViewExpense) {
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

  if (resolvedParams?.search) whereClause.vendor = { contains: resolvedParams.search };
  if (resolvedParams?.category) whereClause.category_id = resolvedParams.category;

  const expenses = await prisma.expense.findMany({ where: whereClause, include: { category: true }, orderBy: { transaction_date: 'desc' } });
  const categories = await prisma.category.findMany({ where: { type: 'EXPENSE' }, orderBy: { name: 'asc' } });

  const serializedExpenses = expenses.map(exp => ({
    id: exp.id, vendor: exp.vendor, amount: Number(exp.amount), category: exp.category?.name || "Uncategorized",
    formatted_date: exp.transaction_date.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })
  }));

  const user = session.id ? await prisma.user.findUnique({
    where: { id: session.id },
    select: { transactionPin: true }
  }) : null;
  const hasPin = !!user?.transactionPin;

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">Expense Tracking</h1>
        <div className="flex items-center gap-3">
          <DateRangePicker />
          {perms.canCreateExpense && (
            <AddExpenseModal categories={categories} sym={sym} hasPin={hasPin} />
          )}
        </div>
      </div>
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <ExpenseTable 
          data={serializedExpenses} 
          sym={sym} 
          categories={categories}
          currentCategory={resolvedParams?.category || ''}
          currentSearch={resolvedParams?.search || ''}
          canDelete={perms.canDeleteExpense}
        />
      </div>
    </div>
  );
}
