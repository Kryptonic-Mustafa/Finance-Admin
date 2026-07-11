'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownRight, 
  FolderTree, 
  FileSpreadsheet, 
  Users, 
  Wallet,
  Settings,
  Mail,
  ArrowLeftRight,
  X,
  ShieldCheck
} from "lucide-react";

export function Sidebar({ allowedPaths = [] }: { allowedPaths?: string[] }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);
    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  const mainLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Income", href: "/income", icon: ArrowUpRight },
    { name: "Expenses", href: "/expenses", icon: ArrowDownRight },
    { name: "Categories", href: "/categories", icon: FolderTree },
    { name: "Internal Transfers", href: "/transfers", icon: ArrowLeftRight },
    { name: "Inbox", href: "/inbox", icon: Mail },
    { name: "Excel Imports", href: "/imports", icon: FileSpreadsheet },
    { name: "User Management", href: "/users", icon: Users },
    { name: "Roles & Permissions", href: "/permissions", icon: ShieldCheck },
  ];

  const visibleLinks = mainLinks.filter(link => allowedPaths.includes(link.href));

  return (
    <>
      {/* Desktop Sidebar (visible on md screens and up) */}
      <aside className="w-64 bg-white border-r border-border flex flex-col hidden md:flex shrink-0 z-10">
        {/* BRANDING */}
        <div className="h-16 flex items-center px-6 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
            <Wallet className="w-6 h-6" /> 
            <span>Finance<span className="text-foreground">Admin</span></span>
          </div>
        </div>
        
        {/* NAVIGATION LINKS */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2 mt-2">
            Main Menu
          </div>
          
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-premium" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        {/* BOTTOM SECTION */}
        <div className="p-4 border-t border-border">
          <Link
            href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              pathname === '/settings'
                ? "bg-primary text-primary-foreground shadow-premium" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Settings className={`w-4 h-4 ${pathname === '/settings' ? "text-primary-foreground" : "text-muted-foreground"}`} />
            Settings
          </Link>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay Drawer (visible on < md screens) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <aside 
            className="w-64 h-full bg-white flex flex-col shadow-2xl animate-in slide-in-from-left duration-300"
            onClick={e => e.stopPropagation()}
          >
            {/* BRANDING WITH CLOSE BUTTON */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-slate-50">
              <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
                <Wallet className="w-6 h-6" /> 
                <span>Finance<span className="text-foreground">Admin</span></span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-md transition-colors text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* NAVIGATION LINKS */}
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2 mt-2">
                Main Menu
              </div>
              
              {visibleLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-premium" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* BOTTOM SECTION */}
            <div className="p-4 border-t border-border">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  pathname === '/settings'
                    ? "bg-primary text-primary-foreground shadow-premium" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Settings className={`w-4 h-4 ${pathname === '/settings' ? "text-primary-foreground" : "text-muted-foreground"}`} />
                Settings
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
