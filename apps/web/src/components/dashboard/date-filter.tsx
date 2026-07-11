'use client';

import { Calendar } from "lucide-react";
import { useRef } from "react";

export function DateFilter() {
  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  const openPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    try {
      ref.current?.showPicker();
    } catch (e) {
      // Fallback for older browsers
      ref.current?.focus();
    }
  };

  return (
    <div className="flex items-center bg-white border border-border rounded-md shadow-sm px-3 py-1.5 transition-all focus-within:ring-2 focus-within:ring-primary/20">
      <Calendar 
        className="w-4 h-4 text-muted-foreground mr-2 cursor-pointer hover:text-primary transition-colors" 
        onClick={() => openPicker(fromRef)}
      />
      <input 
        ref={fromRef}
        type="date" 
        className="text-sm bg-transparent border-none focus:outline-none text-foreground cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden" 
        defaultValue="2024-01-01"
        onClick={() => openPicker(fromRef)}
      />
      <span className="text-muted-foreground mx-2 text-sm font-medium">to</span>
      <input 
        ref={toRef}
        type="date" 
        className="text-sm bg-transparent border-none focus:outline-none text-foreground cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden" 
        defaultValue="2024-12-31" 
        onClick={() => openPicker(toRef)}
      />
      <Calendar 
        className="w-4 h-4 text-muted-foreground ml-2 cursor-pointer hover:text-primary transition-colors" 
        onClick={() => openPicker(toRef)}
      />
    </div>
  );
}
