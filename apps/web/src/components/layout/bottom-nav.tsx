'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ArrowDownRight, Mail, Settings } from "lucide-react";

export function BottomNav({ allowedPaths = [] }: { allowedPaths?: string[] }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Income", href: "/income", icon: ArrowUpRight },
    { name: "Expenses", href: "/expenses", icon: ArrowDownRight },
    { name: "Inbox", href: "/inbox", icon: Mail },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const visibleItems = navItems.filter(item => allowedPaths.includes(item.href));

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border flex items-center justify-around px-2 z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative ${
              isActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-slate-100"}`}>
              <Icon className="w-5.5 h-5.5" />
            </div>
            <span className="text-[10px] tracking-wide font-medium">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
