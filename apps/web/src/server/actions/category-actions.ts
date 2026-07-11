'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/session";

export async function createCategory(data: any) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    const existing = await prisma.category.findFirst({ 
      where: { name: data.name, type: data.type } 
    });
    
    if (existing) return { success: false, error: "A category with this name already exists for this type." };

    await prisma.category.create({
      data: {
        name: data.name,
        type: data.type,
        color: data.color || (data.type === 'INCOME' ? '#10B981' : '#EF4444'),
        userId: session.id
      }
    });
    
    revalidatePath('/categories');
    return { success: true, message: "Category created successfully." };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category." };
  }
}

export async function updateCategory(id: string, data: any) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return { success: false, error: "Category not found." };

    if (category.userId !== session.id && session.role !== 'SUPERADMIN') {
      return { success: false, error: "Forbidden. You do not own this category." };
    }

    await prisma.category.update({
      where: { id },
      data: { name: data.name, type: data.type, color: data.color }
    });
    
    revalidatePath('/categories');
    revalidatePath('/dashboard');
    return { success: true, message: "Category updated successfully." };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteCategory(id: string) {
  try {
    const session = await verifySession();
    if (!session) return { success: false, error: "Unauthorized. Please log in again." };

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return { success: false, error: "Category not found." };

    if (category.userId !== session.id && session.role !== 'SUPERADMIN') {
      return { success: false, error: "Forbidden. You do not own this category." };
    }

    await prisma.category.delete({ where: { id } });
    revalidatePath('/categories');
    revalidatePath('/dashboard');
    return { success: true, message: "Category deleted." };
  } catch (error: any) {
    // Prevent deletion if transactions are using this category
    if (error.code === 'P2003') {
      return { success: false, error: "Cannot delete: This category is currently being used by existing transactions." };
    }
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category." };
  }
}
