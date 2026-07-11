'use client';

import { LogOut, User, Users, Globe, Menu, ChevronDown, Settings } from "lucide-react";
import { handleLogout, setImpersonationView, updateUserCurrency } from "@/server/actions/auth-actions";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { toast } from "sonner";

interface UserData { id: string; name: string; email: string; }
interface CurrencyData { code: string; symbol: string; name: string; }

export function Topbar({ 
  userRole, userName, authUserId, allUsers, currentView, currencies, currentCurrency, isMasterAdmin = false
}: { 
  userRole: string, userName: string, authUserId: string, allUsers: UserData[], currentView: string, currencies: CurrencyData[], currentCurrency: string, isMasterAdmin?: boolean
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const handleClickOutside = () => setShowUserDropdown(false);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUserDropdown(prev => !prev);
  };

  const onLogout = async () => {
    await handleLogout();
    router.push('/login');
  };

  const handleUserSwitch = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await setImpersonationView(e.target.value);
    window.location.reload();
  };

  const handleCurrencySwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCode = e.target.value;
    startTransition(async () => {
      const res = await updateUserCurrency(authUserId, newCode);
      if (res.success) {
        toast.success("Currency updated globally.");
        window.location.reload();
      }
    });
  };

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Menu Trigger */}
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
          className="block md:hidden p-1.5 hover:bg-slate-100 rounded-md text-slate-600 active:bg-slate-200 transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>

        {/* MASTER ADMIN SWITCHER */}
        {isMasterAdmin && (
          <div className="flex items-center gap-2 bg-secondary/50 border border-border px-3 py-1.5 rounded-lg">
            <Users className="w-4 h-4 text-muted-foreground" />
            <select value={currentView} onChange={handleUserSwitch} className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer">
              <option value="all">Global View (All Data)</option>
              {allUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
        )}

        {/* CURRENCY SWITCHER */}
        <div className="flex items-center gap-2 bg-secondary/50 border border-border px-3 py-1.5 rounded-lg">
          <Globe className="w-4 h-4 text-muted-foreground" />
          <select disabled={isPending} value={currentCurrency} onChange={handleCurrencySwitch} className="bg-transparent text-sm font-medium text-foreground outline-none cursor-pointer">
            {currencies.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <button 
          onClick={toggleDropdown}
          className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer select-none border border-transparent active:border-border"
          title="User Account"
        >
          {/* Avatar Icon */}
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 shrink-0">
            {userName[0]?.toUpperCase() || 'U'}
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200" style={{ transform: showUserDropdown ? 'rotate(180deg)' : 'none' }} />
        </button>

        {showUserDropdown && (
          <div 
            onClick={e => e.stopPropagation()}
            className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {/* Header info */}
            <div className="px-4 py-2 border-b border-border">
              <p className="text-xs text-muted-foreground">Logged in as</p>
              <p className="text-sm font-semibold text-slate-800 truncate" title={userName}>{userName}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-full">{isMasterAdmin ? "MASTER ADMIN" : userRole}</span>
            </div>

            {/* Menu items */}
            <div className="p-1.5 space-y-0.5">
              <button 
                onClick={() => {
                  setShowUserDropdown(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors text-left font-medium"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                Settings
              </button>

              <button 
                onClick={() => {
                  setShowUserDropdown(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors text-left font-medium"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
