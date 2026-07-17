'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function deleteIncome(id: string) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    const income = await prisma.income.findUnique({ where: { id } });
    if (!income) return { success: false, error: "Transaction not found." };

    if (income.user_id !== session.id && session.role !== 'SUPERADMIN') {
      return { success: false, error: "Forbidden. You do not own this transaction." };
    }

    await prisma.income.delete({ where: { id } });
    revalidatePath('/income');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error deleting income:", error);
    return { success: false, error: "Failed to delete transaction." };
  }
}

export async function deleteExpense(id: string) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) return { success: false, error: "Transaction not found." };

    if (expense.user_id !== session.id && session.role !== 'SUPERADMIN') {
      return { success: false, error: "Forbidden. You do not own this transaction." };
    }

    await prisma.expense.delete({ where: { id } });
    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, error: "Failed to delete transaction." };
  }
}

export async function createIncome(data: {
  source: string;
  amount: number;
  category_id: string;
  transaction_date: string;
  notes?: string;
  pin?: string;
}) {
  try {
    const session = await verifySession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    // Verify Transaction PIN if set
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { transactionPin: true, currencyCode: true }
    });

    if (user?.transactionPin) {
      if (!data.pin) {
        return { success: false, error: "Transaction PIN is required to add income." };
      }
      const isPinValid = await bcrypt.compare(data.pin, user.transactionPin);
      if (!isPinValid) {
        return { success: false, error: "Incorrect Transaction PIN. Access Denied." };
      }
    }

    const currency = user?.currencyCode || 'USD';

    await prisma.income.create({
      data: {
        user_id: session.id,
        category_id: data.category_id,
        source: data.source,
        amount: data.amount,
        currency,
        transaction_date: new Date(data.transaction_date),
        notes: data.notes || '',
      }
    });

    revalidatePath('/income');
    revalidatePath('/dashboard');
    return { success: true, message: "Income added successfully." };
  } catch (error) {
    console.error("Error creating income:", error);
    return { success: false, error: "Failed to add income." };
  }
}

export async function createExpense(data: {
  vendor: string;
  amount: number;
  category_id: string;
  transaction_date: string;
  notes?: string;
  pin?: string;
}) {
  try {
    const session = await verifySession();
    if (!session) {
      return { success: false, error: "Unauthorized. Please log in again." };
    }

    // Verify Transaction PIN if set
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { transactionPin: true, currencyCode: true }
    });

    if (user?.transactionPin) {
      if (!data.pin) {
        return { success: false, error: "Transaction PIN is required to add expense." };
      }
      const isPinValid = await bcrypt.compare(data.pin, user.transactionPin);
      if (!isPinValid) {
        return { success: false, error: "Incorrect Transaction PIN. Access Denied." };
      }
    }

    const currency = user?.currencyCode || 'USD';

    await prisma.expense.create({
      data: {
        user_id: session.id,
        category_id: data.category_id,
        vendor: data.vendor,
        amount: data.amount,
        currency,
        transaction_date: new Date(data.transaction_date),
        notes: data.notes || '',
      }
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: true, message: "Expense added successfully." };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to add expense." };
  }
}

export async function deleteIncomes(ids: string[]) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    if (session.role === 'SUPERADMIN') {
      await prisma.income.deleteMany({ where: { id: { in: ids } } });
    } else {
      // Normal user can only delete their own
      await prisma.income.deleteMany({
        where: {
          id: { in: ids },
          user_id: session.id
        }
      });
    }

    revalidatePath('/income');
    revalidatePath('/dashboard');
    return { success: true, message: `${ids.length} income(s) deleted.` };
  } catch (error) {
    console.error("Error deleting incomes:", error);
    return { success: false, error: "Failed to delete incomes." };
  }
}

export async function deleteExpenses(ids: string[]) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    if (session.role === 'SUPERADMIN') {
      await prisma.expense.deleteMany({ where: { id: { in: ids } } });
    } else {
      // Normal user can only delete their own
      await prisma.expense.deleteMany({
        where: {
          id: { in: ids },
          user_id: session.id
        }
      });
    }

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: true, message: `${ids.length} expense(s) deleted.` };
  } catch (error) {
    console.error("Error deleting expenses:", error);
    return { success: false, error: "Failed to delete expenses." };
  }
}

export async function updateIncome(id: string, data: {
  source: string;
  amount: number;
  category_id: string;
  transaction_date: string;
  notes?: string;
  pin?: string;
}) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    const income = await prisma.income.findUnique({ where: { id } });
    if (!income) return { success: false, error: "Transaction not found." };

    if (income.user_id !== session.id && session.role !== 'SUPERADMIN') {
      return { success: false, error: "Forbidden. You do not own this transaction." };
    }

    // Verify Transaction PIN if set
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { transactionPin: true }
    });

    if (user?.transactionPin) {
      if (!data.pin) {
        return { success: false, error: "Transaction PIN is required to update income." };
      }
      const isPinValid = await bcrypt.compare(data.pin, user.transactionPin);
      if (!isPinValid) {
        return { success: false, error: "Incorrect Transaction PIN. Access Denied." };
      }
    }

    await prisma.income.update({
      where: { id },
      data: {
        category_id: data.category_id,
        source: data.source,
        amount: data.amount,
        transaction_date: new Date(data.transaction_date),
        notes: data.notes || '',
      }
    });

    revalidatePath('/income');
    revalidatePath('/dashboard');
    return { success: true, message: "Income updated successfully." };
  } catch (error) {
    console.error("Error updating income:", error);
    return { success: false, error: "Failed to update income." };
  }
}

export async function updateExpense(id: string, data: {
  vendor: string;
  amount: number;
  category_id: string;
  transaction_date: string;
  notes?: string;
  pin?: string;
}) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) return { success: false, error: "Transaction not found." };

    if (expense.user_id !== session.id && session.role !== 'SUPERADMIN') {
      return { success: false, error: "Forbidden. You do not own this transaction." };
    }

    // Verify Transaction PIN if set
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { transactionPin: true }
    });

    if (user?.transactionPin) {
      if (!data.pin) {
        return { success: false, error: "Transaction PIN is required to update expense." };
      }
      const isPinValid = await bcrypt.compare(data.pin, user.transactionPin);
      if (!isPinValid) {
        return { success: false, error: "Incorrect Transaction PIN. Access Denied." };
      }
    }

    await prisma.expense.update({
      where: { id },
      data: {
        category_id: data.category_id,
        vendor: data.vendor,
        amount: data.amount,
        transaction_date: new Date(data.transaction_date),
        notes: data.notes || '',
      }
    });

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    return { success: true, message: "Expense updated successfully." };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { success: false, error: "Failed to update expense." };
  }
}
