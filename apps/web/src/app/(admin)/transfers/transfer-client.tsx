'use client';

import { useState, useTransition } from "react";
import { createTransfer } from "@/server/actions/transfer-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { 
  Send, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  AlertCircle, 
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  Mail
} from "lucide-react";

interface User {
  name: string;
  email: string;
}

interface TransferRecord {
  id: string;
  senderId: string;
  senderEmail: string;
  recipientId: string;
  recipientEmail: string;
  amount: number;
  notes: string | null;
  createdAt: Date;
}

interface TransferClientProps {
  users: User[];
  transfers: TransferRecord[];
  hasPin: boolean;
  sym: string;
  currentUserEmail: string;
  canCreate?: boolean;
}

export function TransferClient({ users, transfers, hasPin, sym, currentUserEmail, canCreate = true }: TransferClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [pin, setPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient) {
      toast.error("Please choose a recipient.");
      return;
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid transfer amount.");
      return;
    }

    if (hasPin && !pin) {
      toast.error("Please enter your Transaction PIN.");
      return;
    }

    const toastId = toast.loading("Processing secure transfer...");
    startTransition(async () => {
      const res = await createTransfer(recipient, numericAmount, notes, pin);

      if (res.success) {
        toast.success(res.message, { id: toastId });
        setRecipient("");
        setAmount("");
        setNotes("");
        setPin("");
        router.refresh();
      } else {
        toast.error(res.error, { id: toastId });
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. TRANSFER FORM */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" /> Send Money Instantly
          </h2>

          {!canCreate ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Lock className="w-10 h-10 mx-auto text-slate-400 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700">Transfer Privileges Disabled</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Your role does not have permission to execute internal funds transfers. Please contact an administrator.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Recipient Selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Recipient family member</label>
                <select
                  required
                  value={recipient}
                  onChange={e => setRecipient(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                >
                  <option value="">Choose Recipient...</option>
                  {users.map(u => (
                    <option key={u.email} value={u.email}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount & Currency */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Amount</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-muted-foreground sm:text-sm font-semibold">{sym}</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="block w-full pl-8 pr-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Notes / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Shared grocery expense, Allowance, Pocket money"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
              </div>

              {/* Transaction PIN Authorization (if configured) */}
              {hasPin ? (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
                  <label className="block text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Security Transaction PIN Required
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={4}
                    required
                    value={pin}
                    onChange={e => setPin(e.target.value.replace(/\D/g, "").substring(0, 4))}
                    placeholder="••••"
                    className="w-full px-3 py-2 text-center text-xl tracking-[0.5em] font-mono bg-white border border-border rounded-lg outline-none transition-all focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                  <p className="text-[10px] text-amber-700">Enter your family security PIN to authorize and sign this transfer.</p>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-border rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted-foreground">
                    You do not have a Transaction PIN configured. To secure transfers and transactions, set a PIN in your settings page.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold shadow-premium hover:bg-primary/95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-5 h-5" /> {isPending ? "Executing secure transfer..." : "Send Transfer"}
              </button>

            </form>
          )}
        </div>

        {/* 2. TRANSFER HISTORY TABLE */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-slate-50/20">
            <h3 className="text-md font-semibold text-foreground">Transfer History Logs</h3>
          </div>
          
          {transfers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No internal transfer logs recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-border text-muted-foreground font-medium text-xs uppercase tracking-wider">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Party info</th>
                    <th className="px-6 py-3">Notes</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transfers.map(t => {
                    const isOutgoing = t.senderEmail === currentUserEmail;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 text-muted-foreground whitespace-nowrap" suppressHydrationWarning>
                          {new Date(t.createdAt).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isOutgoing ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                              <ArrowUpRight className="w-3.5 h-3.5" /> Outgoing
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <ArrowDownLeft className="w-3.5 h-3.5" /> Incoming
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground whitespace-nowrap">
                          {isOutgoing ? `To: ${t.recipientEmail}` : `From: ${t.senderEmail}`}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                          {t.notes || "—"}
                        </td>
                        <td className={`px-6 py-4 text-right font-bold whitespace-nowrap ${isOutgoing ? "text-red-600" : "text-emerald-600"}`}>
                          {isOutgoing ? "-" : "+"} {sym}{t.amount.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 3. SIDE INFO RULES CARD */}
      <div className="space-y-6">
        <div className="bg-slate-50 border border-border rounded-xl p-6 space-y-4">
          <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-600" /> Secure Ledger Rules
          </h3>
          
          <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
            <div className="flex gap-2.5">
              <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                <TrendingDown className="w-3 h-3 text-blue-600" />
              </div>
              <p>
                <strong>Double-Entry Posting:</strong> Sending funds creates an immediate <strong>Expense</strong> in your ledger (tagged as "Internal Transfer") and a matching <strong>Income</strong> record for the recipient.
              </p>
            </div>

            <div className="flex gap-2.5">
              <div className="w-5 h-5 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <Lock className="w-3 h-3 text-amber-600" />
              </div>
              <p>
                <strong>PIN Requirement:</strong> Transactions require your family PIN (if configured) before executing to guarantee session integrity and safety.
              </p>
            </div>

            <div className="flex gap-2.5">
              <div className="w-5 h-5 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0 mt-0.5">
                <Mail className="w-3 h-3 text-purple-600" />
              </div>
              <p>
                <strong>In-System Notifications:</strong> System-generated receipt and confirmation emails are immediately dispatched to both parties' internal inboxes.
              </p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
