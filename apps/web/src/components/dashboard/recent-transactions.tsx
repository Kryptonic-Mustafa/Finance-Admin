'use client';

import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function RecentTransactions({ transactions, sym }: { transactions: any[], sym: string }) {
  return (
    <div className="bg-white border border-border rounded-xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No recent transactions found.</p>
        ) : (
          transactions.map((tx, i) => (
            <div key={i} className="flex items-center justify-between p-3 hover:bg-secondary/30 rounded-lg transition-colors border border-transparent hover:border-border">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.isIncome ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {tx.isIncome ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-sm text-foreground">{tx.desc}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
              </div>
              <div className={`font-semibold ${tx.isIncome ? 'text-emerald-600' : 'text-foreground'}`}>
                {tx.isIncome ? '+' : '-'}{sym}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
