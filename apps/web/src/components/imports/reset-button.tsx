'use client';
import { AlertTriangle } from "lucide-react";
import { wipeDatabase } from "@/server/actions/import-actions";
import { toast } from "sonner";
import { useState } from "react";

export function DatabaseResetButton() {
  const [isWiping, setIsWiping] = useState(false);

  const handleWipe = async () => {
    if (confirm("WARNING: This will permanently delete ALL incomes and expenses and reset their IDs to 1. Are you absolutely sure?")) {
      setIsWiping(true);
      const toastId = toast.loading("Nuking database...");
      const res = await wipeDatabase();
      if (res.success) {
        toast.success("Database has been reset completely.", { id: toastId });
      } else {
        toast.error("Failed to reset database.", { id: toastId });
      }
      setIsWiping(false);
    }
  };

  return (
    <button 
      onClick={handleWipe}
      disabled={isWiping}
      className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md text-sm font-medium shadow-sm hover:bg-red-100 transition-all flex items-center gap-2"
    >
      <AlertTriangle className="w-4 h-4" /> 
      {isWiping ? "Resetting..." : "Truncate Database"}
    </button>
  );
}
