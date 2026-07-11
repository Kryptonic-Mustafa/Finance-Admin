'use client';

import { useState, useTransition } from "react";
import { resetPin } from "@/server/actions/pin-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";

export function ResetPinForm({ token }: { token: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^\d{4}$/.test(pin)) {
      toast.error("PIN must be exactly 4 numeric digits.");
      return;
    }

    if (pin !== confirmPin) {
      toast.error("PINs do not match.");
      return;
    }

    const toastId = toast.loading("Configuring transaction PIN...");
    startTransition(async () => {
      const res = await resetPin(token, pin);
      if (res.success) {
        toast.success(res.message, { id: toastId });
        router.push("/settings");
        router.refresh();
      } else {
        toast.error(res.error, { id: toastId });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">New PIN (4 digits)</label>
        <div className="relative">
          <input
            type={showPin ? "text" : "password"}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            required
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").substring(0, 4))}
            className="w-full px-3 py-2.5 bg-white border border-border rounded-md text-center text-xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
            placeholder="••••"
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Confirm PIN</label>
        <div className="relative">
          <input
            type={showConfirmPin ? "text" : "password"}
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            required
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").substring(0, 4))}
            className="w-full px-3 py-2.5 bg-white border border-border rounded-md text-center text-xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12"
            placeholder="••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPin(!showConfirmPin)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-slate-100 transition-colors"
          >
            {showConfirmPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || pin.length !== 4}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium shadow-premium hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <CheckCircle2 className="w-5 h-5" /> {isPending ? "Configuring..." : "Configure PIN"}
      </button>
    </form>
  );
}
