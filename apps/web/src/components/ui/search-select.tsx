'use client';

import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

interface SearchSelectProps {
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

export function SearchSelect({ options, value, onChange, placeholder = "Select...", hasError }: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm(""); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 bg-white border rounded-md text-sm outline-none transition-colors ${
          hasError ? 'border-red-300 focus:border-red-500 ring-1 ring-red-500/20' : 'border-border hover:border-primary/50 focus:border-primary ring-1 ring-transparent focus:ring-primary/20'
        }`}
      >
        <span className={selectedOption ? "text-foreground" : "text-muted-foreground"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* UPDATED: Added z-[100] so it completely overrides the sticky table header */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-border rounded-lg shadow-premium overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          
          <div className="flex items-center px-3 py-2 border-b border-border bg-secondary/30">
            <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
              autoFocus 
            />
          </div>

          <ul className="max-h-[250px] overflow-y-auto py-1 bg-white">
            <li 
              onClick={() => { onChange(''); setIsOpen(false); setSearchTerm(''); }}
              className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-secondary/50 transition-colors ${!value ? 'bg-primary/5 text-primary font-medium' : 'text-muted-foreground'}`}
            >
              -- Ignore --
              {!value && <Check className="w-4 h-4" />}
            </li>
            
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-3 text-sm text-muted-foreground text-center">No results found.</li>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <li
                    key={opt.value}
                    onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(''); }}
                    className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer hover:bg-secondary/50 transition-colors ${
                      isSelected ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'
                    }`}
                  >
                    {opt.label}
                    {isSelected && <Check className="w-4 h-4" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
