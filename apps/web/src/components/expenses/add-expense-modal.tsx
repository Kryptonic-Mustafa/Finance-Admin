'use client';

import { useState, useRef, useTransition } from "react";
import { Plus, X, Calendar, CheckCircle2, Lock } from "lucide-react";
import { SearchSelect } from "@/components/ui/search-select";
import { createExpense } from "@/server/actions/crud-actions";
import { toast } from "sonner";

interface AddExpenseModalProps {
  categories: any[];
  sym: string;
  hasPin?: boolean;
}

export function AddExpenseModal({ categories, sym, hasPin = false }: AddExpenseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSmart, setShowSmart] = useState(false);
  const [catSearch, setCatSearch] = useState('');
  const [isPending, startTransition] = useTransition();
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'details' | 'pin'>('details');
  const dateRef = useRef<HTMLInputElement>(null);

  // Get local YYYY-MM-DD date string
  const getLocalDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    vendor: '',
    amount: '',
    category_id: '',
    transaction_date: getLocalDateString(),
    notes: ''
  });

  const [validationErrors, setValidationErrors] = useState<{
    category_id?: boolean;
    vendor?: boolean;
    amount?: boolean;
    transaction_date?: boolean;
    pin?: boolean;
  }>({});

  const handleOpen = () => {
    setFormData({
      vendor: '',
      amount: '',
      category_id: '',
      transaction_date: getLocalDateString(),
      notes: ''
    });
    setPin('');
    setStep('details');
    setShowSmart(false);
    setCatSearch('');
    setValidationErrors({});
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'details') {
      // Validation for step 1 details
      const errors: typeof validationErrors = {};
      if (!formData.category_id) errors.category_id = true;
      if (!formData.vendor.trim()) errors.vendor = true;
      if (!formData.amount || Number(formData.amount) <= 0) errors.amount = true;
      if (!formData.transaction_date) errors.transaction_date = true;

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast.error("Please fill in all required fields correctly.");
        return;
      }

      if (hasPin) {
        setStep('pin');
      } else {
        executeSubmit();
      }
    } else {
      // Validation for step 2 PIN
      if (!pin || pin.length !== 4) {
        setValidationErrors({ pin: true });
        toast.error("Please enter a valid 4-digit security PIN.");
        return;
      }
      executeSubmit();
    }
  };

  const executeSubmit = () => {
    const toastId = toast.loading("Adding expense transaction...");
    startTransition(async () => {
      const res = await createExpense({
        vendor: formData.vendor.trim(),
        amount: Number(formData.amount),
        category_id: formData.category_id,
        transaction_date: formData.transaction_date,
        notes: formData.notes.trim(),
        pin: hasPin ? pin : undefined
      });

      if (res.success) {
        toast.success(res.message || "Expense added successfully.", { id: toastId });
        setIsOpen(false);
      } else {
        toast.error(res.error || "Failed to add expense.", { id: toastId });
      }
    });
  };

  const categoryOptions = categories.map(c => ({
    label: c.name,
    value: c.id
  }));

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(catSearch.toLowerCase())
  );

  return (
    <>
      <button
        onClick={handleOpen}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-premium hover:bg-primary/90 flex items-center gap-2 transition-all shrink-0"
      >
        <Plus className="w-4 h-4" /> Add Expense
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className={`bg-white rounded-xl shadow-premium border border-border w-full transition-all duration-300 overflow-hidden flex flex-col md:flex-row ${
            showSmart && step === 'details' ? 'max-w-3xl md:h-[450px]' : 'max-w-md'
          }`}>
            
            {/* Main Form Area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30 shrink-0">
                <h3 className="text-md font-semibold text-foreground">
                  {step === 'pin' ? "Security Authentication" : "Add Expense Transaction"}
                </h3>
                <div className="flex items-center gap-2">
                  {step === 'details' && (
                    <button
                      type="button"
                      onClick={() => setShowSmart(!showSmart)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                        showSmart 
                          ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' 
                          : 'bg-white hover:bg-slate-50 text-slate-600 border-border'
                      }`}
                    >
                      ⚡ Smart Category
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                
                {/* Fields Area */}
                <div className="p-5 space-y-3.5 flex-1 overflow-y-auto">
                  
                  {step === 'details' ? (
                    <>
                      {/* Row 1: Date & Category */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Date Input */}
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">Date</label>
                          <div 
                            className={`flex items-center gap-2 px-3 py-2 bg-white border rounded-md text-sm cursor-pointer transition-all relative ${
                              validationErrors.transaction_date ? 'border-red-300 focus-within:border-red-500 ring-1 ring-red-500/20' : 'border-border hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20'
                            }`}
                            onClick={() => dateRef.current?.showPicker()}
                          >
                            <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                            <input
                              ref={dateRef}
                              type="date"
                              required
                              value={formData.transaction_date}
                              onChange={e => {
                                setFormData({ ...formData, transaction_date: e.target.value });
                                setValidationErrors({ ...validationErrors, transaction_date: false });
                              }}
                              className="w-full text-sm outline-none bg-transparent text-foreground cursor-pointer focus:ring-0 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                            />
                          </div>
                        </div>

                        {/* Category SearchSelect */}
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">Category</label>
                          <SearchSelect
                            options={categoryOptions}
                            value={formData.category_id}
                            onChange={val => {
                              setFormData({ ...formData, category_id: val });
                              setValidationErrors({ ...validationErrors, category_id: false });
                            }}
                            placeholder="Category..."
                            hasError={validationErrors.category_id}
                          />
                        </div>
                      </div>

                      {/* Row 2: Vendor/Description & Amount */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Vendor Input */}
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">Vendor / Description</label>
                          <input
                            type="text"
                            required
                            value={formData.vendor}
                            onChange={e => {
                              setFormData({ ...formData, vendor: e.target.value });
                              setValidationErrors({ ...validationErrors, vendor: false });
                            }}
                            placeholder="e.g. Walmart, AWS, Uber"
                            className={`w-full px-3 py-2 bg-white border rounded-md text-sm outline-none transition-all ${
                              validationErrors.vendor ? 'border-red-300 focus:border-red-500 ring-1 ring-red-500/20' : 'border-border hover:border-primary/50 focus:ring-2 focus:ring-primary/20'
                            }`}
                          />
                        </div>

                        {/* Amount Input */}
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">Amount</label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-muted-foreground sm:text-sm font-medium">{sym}</span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              required
                              value={formData.amount}
                              onChange={e => {
                                setFormData({ ...formData, amount: e.target.value });
                                setValidationErrors({ ...validationErrors, amount: false });
                              }}
                              placeholder="0.00"
                              className={`block w-full pl-8 pr-3 py-2 bg-white border rounded-md text-sm outline-none transition-all ${
                                validationErrors.amount ? 'border-red-300 focus:border-red-500 ring-1 ring-red-500/20' : 'border-border hover:border-primary/50 focus:ring-2 focus:ring-primary/20'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Notes Area (Compact Text Input) */}
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Notes (Optional)</label>
                        <input
                          type="text"
                          value={formData.notes}
                          onChange={e => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional details..."
                          className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm outline-none transition-all hover:border-primary/50 focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </>
                  ) : (
                    /* STEP 2: PIN SCREEN */
                    <div className="space-y-4 py-4 animate-in fade-in duration-300">
                      <div className="text-center space-y-1.5">
                        <div className="w-10 h-10 bg-amber-50 border border-amber-200 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-1">
                          <Lock className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-semibold text-foreground">Verify Transaction PIN</h4>
                        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                          Please enter your 4-digit security PIN to authorize and save this record.
                        </p>
                      </div>

                      <div className="relative max-w-[180px] mx-auto">
                        <input
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={4}
                          autoComplete="new-password"
                          required
                          value={pin}
                          onChange={e => {
                            setPin(e.target.value.replace(/\D/g, "").substring(0, 4));
                            setValidationErrors({ ...validationErrors, pin: false });
                          }}
                          placeholder="••••"
                          className={`w-full px-3 py-2 text-center text-xl tracking-[0.5em] font-mono bg-white border rounded-lg outline-none transition-all ${
                            validationErrors.pin ? 'border-red-300 focus:border-red-500 ring-1 ring-red-500/20' : 'border-border focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500'
                          }`}
                          autoFocus
                        />
                      </div>
                      
                      <div className="text-center">
                        <button
                          type="button"
                          onClick={() => setStep('details')}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          ← Back to Edit Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pinned Action Footer */}
                <div className="px-5 py-4 border-t border-border bg-slate-50/50 flex justify-end gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (step === 'pin') {
                        setStep('details');
                      } else {
                        setIsOpen(false);
                      }
                    }}
                    className="px-4 py-2 bg-white border border-border text-foreground rounded-md text-sm font-medium shadow-sm hover:bg-secondary transition-all"
                  >
                    {step === 'pin' ? 'Back' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-premium hover:bg-primary/90 transition-all flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 
                    {isPending 
                      ? "Saving..." 
                      : step === 'pin' 
                        ? "Verify & Save" 
                        : "Save Expense"
                    }
                  </button>
                </div>

              </form>
            </div>

            {/* Smart Category Sidebar */}
            {showSmart && step === 'details' && (
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-border bg-slate-50/50 flex flex-col shrink-0 h-[300px] md:h-auto overflow-hidden">
                {/* Sidebar Header */}
                <div className="px-5 py-4 border-b border-border bg-slate-100/50 flex items-center justify-between shrink-0">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Smart Categories</span>
                  <span className="text-[10px] text-muted-foreground">Select to autofill</span>
                </div>
                {/* Search Bar */}
                <div className="p-4 border-b border-border/60 shrink-0 bg-white">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={catSearch}
                    onChange={e => setCatSearch(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-border rounded-md text-xs outline-none focus:ring-1 focus:ring-primary/20"
                  />
                </div>
                {/* Categories Scroll Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {filteredCategories.map(cat => {
                    const lastTx = cat.expenses?.[0];
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            category_id: cat.id,
                            vendor: lastTx?.vendor || cat.name,
                            notes: lastTx?.notes || ''
                          });
                          toast.success(`Loaded category: ${cat.name}`);
                        }}
                        className="w-full text-left p-2.5 bg-white border border-border hover:border-primary/40 rounded-lg transition-all hover:shadow-sm flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-slate-800 text-xs truncate flex items-center gap-1.5">
                            {cat.color && (
                              <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: cat.color }} />
                            )}
                            {cat.name}
                          </div>
                          {lastTx && (
                            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                              Last: {lastTx.vendor}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          Autofill →
                        </span>
                      </button>
                    );
                  })}
                  {filteredCategories.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400">No categories found.</div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}
