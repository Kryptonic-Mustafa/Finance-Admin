'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { verifySession } from "@/lib/session";

export async function createUser(data: any) {
  try {
    const session = await verifySession();
    if (!session || (!session.isMasterAdmin && session.role !== "SUPERADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return { success: false, error: "Email already exists." };

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password, // Remember to hash in prod!
        role: data.role,
        status: data.status,
      }
    });
    
    revalidatePath('/users');
    return { success: true, message: "User created successfully." };
  } catch (error) {
    return { success: false, error: "Failed to create user." };
  }
}

export async function updateUser(id: string, data: any) {
  try {
    const session = await verifySession();
    if (!session || (!session.isMasterAdmin && session.role !== "SUPERADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return { success: false, error: "User not found." };

    // Prevent non-master admin from modifying a Master Admin
    if (targetUser.isMasterAdmin && !session.isMasterAdmin) {
      return { success: false, error: "Forbidden: Only Master Admin can modify Master Admin accounts." };
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      status: data.status,
    };
    
    // Only update password if provided
    if (data.password && data.password.trim() !== '') {
      updateData.password = data.password; 
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });
    
    revalidatePath('/users');
    return { success: true, message: "User updated successfully." };
  } catch (error) {
    return { success: false, error: "Failed to update user." };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await verifySession();
    if (!session || (!session.isMasterAdmin && session.role !== "SUPERADMIN")) {
      return { success: false, error: "Unauthorized access." };
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) return { success: false, error: "User not found." };

    // Prevent deleting a Master Admin
    if (targetUser.isMasterAdmin) {
      return { success: false, error: "Forbidden: Master Admin accounts cannot be deleted." };
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath('/users');
    return { success: true, message: "User deleted successfully." };
  } catch (error) {
    return { success: false, error: "Failed to delete user." };
  }
}
