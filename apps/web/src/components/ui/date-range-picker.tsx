'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Calendar, X } from 'lucide-react';
import { useRef } from 'react';

export function DateRangePicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  const handleDateChange = (type: 'from' | 'to', value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(type, value);
    else params.delete(type);
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearDates = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('from');
    params.delete('to');
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 bg-white border border-border rounded-lg px-3 py-2 shadow-sm transition-all hover:border-primary/50 relative">
      <Calendar className="w-4 h-4 text-muted-foreground" />
      
      <div className="relative cursor-pointer flex items-center" onClick={() => fromRef.current?.showPicker()}>
        <input 
          ref={fromRef} type="date" value={from} onChange={(e) => handleDateChange('from', e.target.value)}
          className="text-sm outline-none bg-transparent text-foreground cursor-pointer focus:ring-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
        />
      </div>

      <span className="text-muted-foreground text-sm font-medium mx-1">to</span>
      
      <div className="relative cursor-pointer flex items-center" onClick={() => toRef.current?.showPicker()}>
        <input 
          ref={toRef} type="date" value={to} onChange={(e) => handleDateChange('to', e.target.value)}
          className="text-sm outline-none bg-transparent text-foreground cursor-pointer focus:ring-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer" 
        />
      </div>

      {/* UPDATED: Red Clear Button */}
      {(from || to) && (
        <button 
          onClick={clearDates} 
          className="ml-2 p-1 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors"
          title="Clear Dates"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
