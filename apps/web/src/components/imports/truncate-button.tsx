'use client';

import { Trash2 } from "lucide-react";
import { wipeDatabase } from "@/server/actions/import-actions";
import { useTransition } from "react";
import { toast } from "sonner";
import Swal from 'sweetalert2';

export function TruncateButton({ userRole }: { userRole: string }) {
  const [isPending, startTransition] = useTransition();

  const handleWipe = () => {
    // 1. Set the correct warning text based on who is logged in
    const titleText = userRole === 'SUPERADMIN' ? 'Wipe Global Database?' : 'Wipe Your Data?';
    const warningText = userRole === 'SUPERADMIN' 
      ? "This will permanently delete ALL incomes and expenses for ALL users. You cannot revert this!"
      : "This will permanently delete all of YOUR incomes and expenses. You cannot revert this!";

    // FIRST QUESTION: Wipe the Records?
    Swal.fire({
      title: titleText,
      text: warningText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, wipe records!',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        title: 'text-xl font-semibold text-foreground',
        htmlContainer: 'text-sm text-muted-foreground',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        
        // SECOND QUESTION: Wipe the Categories too? (Asked to EVERYONE)
        Swal.fire({
          title: 'Delete Categories too?',
          text: userRole === 'SUPERADMIN' 
            ? "Do you want to wipe the global Category master list as well?" 
            : "Do you want to delete the custom categories that you created?",
          icon: 'question',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonColor: '#EF4444',
          denyButtonColor: '#10B981',
          cancelButtonColor: '#6B7280',
          confirmButtonText: 'Yes, wipe categories too',
          denyButtonText: 'No, keep categories',
          cancelButtonText: 'Cancel'
        }).then((catResult) => {
          if (catResult.isDismissed) return; // User clicked Cancel on step 2

          const includeCategories = catResult.isConfirmed; // True if they clicked 'Yes, wipe categories too'
          const toastId = toast.loading("Wiping database...");
          
          startTransition(async () => {
            const res = await wipeDatabase(includeCategories);
            if (res.success) {
              toast.success("Database wiped.", { id: toastId });
              Swal.fire({
                title: 'Wiped!',
                text: includeCategories ? 'Records and Categories have been deleted.' : 'Records deleted. Categories preserved.',
                icon: 'success',
                confirmButtonColor: '#10B981'
              });
            } else {
              toast.error(res.error || "Failed to wipe database.", { id: toastId });
            }
          });
        });
      }
    });
  };

  return (
    <button 
      onClick={handleWipe} 
      disabled={isPending}
      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-medium shadow-sm hover:bg-red-100 transition-all flex items-center gap-2 whitespace-nowrap shrink-0"
    >
      <Trash2 className="w-4 h-4" /> 
      {isPending ? "Wiping..." : "Truncate Data"}
    </button>
  );
}
