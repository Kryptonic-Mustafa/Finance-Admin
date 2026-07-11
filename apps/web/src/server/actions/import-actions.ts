'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";

export async function processImportedData(data: { incomes: any[], expenses: any[] }) {
  try {
    const session = await verifySession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    const cookieStore = await cookies();
    const impersonated = cookieStore.get('impersonated_user')?.value;

    let targetUserId = session.id;
    if (session.role === 'SUPERADMIN' && impersonated && impersonated !== 'all') {
      targetUserId = impersonated;
    }

    const uniqueIncCats = Array.from(new Set(data.incomes.map(i => (i.categoryName || "Uncategorized") as string)));
    const incCatMap: Record<string, string> = {};
    for (const name of uniqueIncCats) {
      let cat = await prisma.category.findFirst({ where: { name: name, type: "INCOME" } });
      if (!cat) cat = await prisma.category.create({ data: { name: name, type: "INCOME", color: "#10B981", userId: targetUserId } });
      incCatMap[name] = cat.id;
    }

    const uniqueExpCats = Array.from(new Set(data.expenses.map(e => (e.categoryName || "Uncategorized") as string)));
    const expCatMap: Record<string, string> = {};
    for (const name of uniqueExpCats) {
      let cat = await prisma.category.findFirst({ where: { name: name, type: "EXPENSE" } });
      if (!cat) cat = await prisma.category.create({ data: { name: name, type: "EXPENSE", color: "#EF4444", userId: targetUserId } });
      expCatMap[name] = cat.id;
    }

    if (data.incomes.length > 0) {
      const incomePayload = data.incomes.map(inc => ({
        user_id: targetUserId, category_id: incCatMap[inc.categoryName || "Uncategorized"], source: inc.source, amount: Number(inc.amount), transaction_date: new Date(inc.transaction_date || Date.now()), notes: "Imported from Excel"
      }));
      await prisma.income.createMany({ data: incomePayload });
    }

    if (data.expenses.length > 0) {
      const expensePayload = data.expenses.map(exp => ({
        user_id: targetUserId, category_id: expCatMap[exp.categoryName || "Uncategorized"], vendor: exp.vendor, amount: Number(exp.amount), transaction_date: new Date(exp.transaction_date || Date.now()), notes: "Imported from Excel"
      }));
      await prisma.expense.createMany({ data: expensePayload });
    }

    revalidatePath('/dashboard'); revalidatePath('/income'); revalidatePath('/expenses'); revalidatePath('/categories');
    return { success: true, message: `Imported Successfully.` };
  } catch (error) {
    console.error("Error importing data:", error);
    return { success: false, error: "Failed to save to database." };
  }
}

// UPDATED LOGIC: Smart Wipe (Native Prisma)
export async function wipeDatabase(includeCategories: boolean = false) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    if (session.role === 'SUPERADMIN') {
      // Superadmin wipes everything globally
      await prisma.income.deleteMany({});
      await prisma.expense.deleteMany({});
      
      if (includeCategories) {
        await prisma.category.deleteMany({});
      }
    } else {
      // Normal user only wipes THEIR data
      await prisma.income.deleteMany({ where: { user_id: session.id } });
      await prisma.expense.deleteMany({ where: { user_id: session.id } });
      
      if (includeCategories) {
        await prisma.category.deleteMany({ where: { userId: session.id } });
      }
    }
    
    revalidatePath('/dashboard'); revalidatePath('/income'); revalidatePath('/expenses'); revalidatePath('/categories');
    return { success: true };
  } catch (error) {
    console.error("Error wiping database:", error);
    return { success: false, error: "Failed to reset database." };
  }
}
