'use client';

import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet, CreditCard, PiggyBank } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  amount: string;
  trend: number;
  icon: React.ElementType;
}

function StatCard({ title, amount, trend, icon: Icon }: StatCardProps) {
  const isPositive = trend >= 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-border shadow-sm hover:shadow-premium transition-shadow duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-3xl font-semibold text-foreground">{amount}</span>
        <div className="flex items-center gap-1 mt-1">
          {isPositive ? (
            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          )}
          <span className={clsx(
            "text-sm font-medium",
            isPositive ? "text-emerald-600" : "text-red-600"
          )}>
            {Math.abs(trend)}%
          </span>
          <span className="text-sm text-muted-foreground ml-1">vs last month</span>
        </div>
      </div>
    </div>
  );
}

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Balance" amount="$124,563.00" trend={12.5} icon={Wallet} />
      <StatCard title="Monthly Income" amount="$14,230.50" trend={8.2} icon={DollarSign} />
      <StatCard title="Monthly Expenses" amount="$4,820.00" trend={-2.4} icon={CreditCard} />
      <StatCard title="Total Savings" amount="$105,512.50" trend={15.3} icon={PiggyBank} />
    </div>
  );
}
