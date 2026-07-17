'use client';
import { Search, FolderTree, XCircle, Trash2, Edit2, Calendar, CheckCircle2, Lock } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SearchSelect } from "@/components/ui/search-select";
import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { deleteIncome, deleteIncomes, updateIncome } from "@/server/actions/crud-actions";

export function IncomeTable({ 
  data, 
  sym, 
  categories, 
  currentCategory, 
  currentSearch, 
  canDelete = true, 
  canUpdate = true, 
  hasPin = false 
}: { 
  data: any[], 
  sym: string, 
  categories: any[], 
  currentCategory: string, 
  currentSearch: string, 
  canDelete?: boolean, 
  canUpdate?: boolean, 
  hasPin?: boolean 
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.delete('category');
    router.push(`${pathname}?${params.toString()}`);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(d => d.id));
    }
  };

  const enterDeleteMode = () => {
    Swal.fire({
      title: 'Enter Delete Mode?',
      text: 'Are you sure you want to enter Delete Mode? This mode allows you to permanently delete transactions.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, enter mode',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        title: 'text-lg font-semibold text-foreground',
        htmlContainer: 'text-sm text-muted-foreground',
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setIsDeleteMode(true);
        setIsUpdateMode(false);
      }
    });
  };

  const handleSingleDelete = (id: string, source: string) => {
    const row = data.find(d => d.id === id);
    if (!row) return;

    const tableHtml = `
      <div style="text-align: left; margin-bottom: 12px; font-size: 14px; color: #4B5563;">
        Are you sure you want to permanently delete this transaction?
      </div>
      <div style="border: 1px solid #E5E7EB; border-radius: 8px; text-align: left; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
          <thead style="background-color: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
            <tr>
              <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; color: #6B7280; text-transform: uppercase; border-right: 1px solid #E5E7EB;">Date</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; color: #6B7280; text-transform: uppercase; border-right: 1px solid #E5E7EB;">Source</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; color: #6B7280; text-transform: uppercase; border-right: 1px solid #E5E7EB;">Category</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 600; color: #6B7280; text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #E5E7EB;">
              <td style="padding: 10px 12px; text-align: left; font-size: 12px; color: #4B5563; border-right: 1px solid #E5E7EB;">${row.formatted_date}</td>
              <td style="padding: 10px 12px; text-align: left; font-weight: 500; font-size: 12px; color: #111827; border-right: 1px solid #E5E7EB;">${row.source}</td>
              <td style="padding: 10px 12px; text-align: left; font-size: 11px; border-right: 1px solid #E5E7EB;"><span style="background-color: #F3F4F6; border: 1px solid #E5E7EB; padding: 2px 6px; border-radius: 4px; color: #374151;">${row.category}</span></td>
              <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #059669; font-size: 12px;">+${sym}${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: 'Confirm Deletion',
      html: tableHtml,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      width: '600px',
      background: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        const toastId = toast.loading("Deleting transaction...");
        startTransition(async () => {
          const res = await deleteIncome(id);
          if (res.success) {
            toast.success("Transaction deleted successfully.", { id: toastId });
            setSelectedIds(prev => prev.filter(x => x !== id));
          } else {
            toast.error(res.error || "Failed to delete transaction.", { id: toastId });
          }
        });
      }
    });
  };

  const handleBulkDelete = () => {
    const selectedRows = data.filter(d => selectedIds.includes(d.id));
    const tableRowsHtml = selectedRows.map(row => `
      <tr style="border-bottom: 1px solid #E5E7EB;">
        <td style="padding: 10px 12px; text-align: left; font-size: 12px; color: #4B5563; border-right: 1px solid #E5E7EB;">${row.formatted_date}</td>
        <td style="padding: 10px 12px; text-align: left; font-weight: 500; font-size: 12px; color: #111827; border-right: 1px solid #E5E7EB;">${row.source}</td>
        <td style="padding: 10px 12px; text-align: left; font-size: 11px; border-right: 1px solid #E5E7EB;"><span style="background-color: #F3F4F6; border: 1px solid #E5E7EB; padding: 2px 6px; border-radius: 4px; color: #374151;">${row.category}</span></td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #059669; font-size: 12px;">+${sym}${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
    `).join('');

    const tableHtml = `
      <div style="text-align: left; margin-bottom: 12px; font-size: 14px; color: #4B5563;">
        Are you sure you want to permanently delete the following ${selectedIds.length} transaction(s)?
      </div>
      <div style="max-height: 250px; overflow-y: auto; border: 1px solid #E5E7EB; border-radius: 8px; text-align: left; overflow: hidden;">
        <table style="width: 100%; border-collapse: collapse; font-family: sans-serif;">
          <thead style="background-color: #F9FAFB; border-bottom: 1px solid #E5E7EB; position: sticky; top: 0; z-index: 10;">
            <tr>
              <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; color: #6B7280; text-transform: uppercase; border-right: 1px solid #E5E7EB;">Date</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; color: #6B7280; text-transform: uppercase; border-right: 1px solid #E5E7EB;">Source</th>
              <th style="padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 600; color: #6B7280; text-transform: uppercase; border-right: 1px solid #E5E7EB;">Category</th>
              <th style="padding: 10px 12px; text-align: right; font-size: 10px; font-weight: 600; color: #6B7280; text-transform: uppercase;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${tableRowsHtml}
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: 'Confirm Bulk Deletion',
      html: tableHtml,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, delete them!',
      cancelButtonText: 'Cancel',
      width: '600px',
      background: '#ffffff'
    }).then((result) => {
      if (result.isConfirmed) {
        const toastId = toast.loading("Deleting transactions...");
        startTransition(async () => {
          const res = await deleteIncomes(selectedIds);
          if (res.success) {
            toast.success(res.message || "Transactions deleted.", { id: toastId });
            setSelectedIds([]);
            setIsDeleteMode(false);
          } else {
            toast.error(res.error || "Failed to delete transactions.", { id: toastId });
          }
        });
      }
    });
  };

  const categoryOptions = categories.map(c => ({ label: c.name, value: c.id }));

  return (
    <div className="flex flex-col h-full max-h-[600px] relative"> 
      {/* CRITICAL FIX: Added z-20 and relative positioning to the filter container.
        This forces the entire filter bar (and its dropdowns) to render ABOVE the table.
      */}
      <div className="p-4 border-b border-border bg-secondary/30 flex flex-wrap items-center gap-4 shrink-0 relative z-20">
        
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" placeholder="Search source..." defaultValue={currentSearch}
            onBlur={(e) => updateFilter('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', e.currentTarget.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none transition-shadow" 
          />
        </div>

        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <FolderTree className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="pl-7">
             <SearchSelect 
                options={categoryOptions}
                value={currentCategory}
                onChange={(val) => updateFilter('category', val)}
                placeholder="All Categories"
             />
          </div>
        </div>

        {(currentCategory || currentSearch) && (
          <button onClick={clearFilters} className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors">
            <XCircle className="w-4 h-4" /> Clear
          </button>
        )}

        {/* Action Modes (Delete & Update) */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Delete Mode controls */}
          {!isUpdateMode && canDelete && (!isDeleteMode ? (
            <button 
              type="button" 
              onClick={enterDeleteMode} 
              className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Mode
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground mr-2">{selectedIds.length} selected</span>
              <button
                type="button"
                onClick={handleBulkDelete}
                disabled={selectedIds.length === 0 || isPending}
                className="px-3 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Selected
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDeleteMode(false);
                  setSelectedIds([]);
                }}
                className="px-3 py-2 text-sm font-medium bg-white border border-border text-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          ))}

          {/* Update Mode controls */}
          {!isDeleteMode && canUpdate && (!isUpdateMode ? (
            <button 
              type="button" 
              onClick={() => {
                setIsUpdateMode(true);
                setIsDeleteMode(false);
              }} 
              className="px-3 py-2 text-sm font-medium text-primary border border-primary/20 hover:bg-primary/5 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> Update Mode
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-primary mr-2">Update Mode Active</span>
              <button
                type="button"
                onClick={() => {
                  setIsUpdateMode(false);
                }}
                className="px-3 py-2 text-sm font-medium bg-white border border-border text-slate-700 hover:bg-secondary rounded-lg transition-colors"
              >
                Exit Update Mode
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-y-auto flex-1 relative z-10 flex flex-col">
        {/* Mobile View: Cards List */}
        <div className="block md:hidden divide-y divide-border overflow-y-auto flex-1">
          {data.length === 0 ? (
            <div className="px-6 py-12 text-center text-muted-foreground">
              No income records found for these filters.
            </div>
          ) : (
            data.map((row) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <div key={row.id} className={`p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    {isDeleteMode && (
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        onChange={() => toggleSelect(row.id)} 
                        className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer shrink-0" 
                      />
                    )}
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm truncate block">{row.source}</span>
                        <span className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] text-slate-600 font-medium shrink-0">{row.category}</span>
                      </div>
                      <span className="text-xs text-muted-foreground block">{row.formatted_date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="font-semibold text-emerald-600 text-sm text-right">
                      +{sym}{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    {isDeleteMode && (
                      <button 
                        type="button"
                        onClick={() => handleSingleDelete(row.id, row.source)} 
                        className="p-2 text-muted-foreground hover:text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {isUpdateMode && (
                      <button 
                        type="button"
                        onClick={() => setEditingRow(row)} 
                        className="p-2 text-muted-foreground hover:text-primary rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Table */}
        <table className="w-full text-sm text-left relative hidden md:table">
          <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold border-b border-border sticky top-0 z-10 backdrop-blur-sm">
            <tr>
              {isDeleteMode && (
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === data.length && data.length > 0} 
                    onChange={toggleSelectAll} 
                    className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                  />
                </th>
              )}
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Source</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount</th>
              {(isDeleteMode || isUpdateMode) && <th className="px-6 py-4 text-right w-24">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={isDeleteMode ? 6 : (isUpdateMode ? 5 : 4)} className="px-6 py-12 text-center text-muted-foreground">
                  No income records found for these filters.
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isSelected = selectedIds.includes(row.id);
                return (
                  <tr key={row.id} className={`hover:bg-secondary/30 transition-colors ${isSelected ? 'bg-primary/5 hover:bg-primary/10' : ''}`}>
                    {isDeleteMode && (
                      <td className="px-6 py-4 w-12 text-center">
                        <input 
                          type="checkbox" 
                          checked={isSelected} 
                          onChange={() => toggleSelect(row.id)} 
                          className="rounded border-border text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer" 
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 text-muted-foreground">{row.formatted_date}</td>
                    <td className="px-6 py-4 font-medium">{row.source}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-secondary border border-border rounded-md text-xs">{row.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-emerald-600">
                      +{sym}{row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    {(isDeleteMode || isUpdateMode) && (
                      <td className="px-6 py-4 text-right">
                        {isDeleteMode ? (
                          <button 
                            type="button"
                            onClick={() => handleSingleDelete(row.id, row.source)} 
                            className="p-1 text-muted-foreground hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => setEditingRow(row)} 
                            className="p-1 text-muted-foreground hover:text-primary rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingRow && (
        <EditIncomeModal 
          row={editingRow} 
          categories={categories} 
          sym={sym} 
          hasPin={hasPin} 
          onClose={() => setEditingRow(null)} 
        />
      )}
    </div>
  );
}

function EditIncomeModal({ 
  row, 
  categories, 
  sym, 
  hasPin, 
  onClose 
}: { 
  row: any, 
  categories: any[], 
  sym: string, 
  hasPin: boolean, 
  onClose: () => void 
}) {
  const [formData, setFormData] = useState({
    source: row.source,
    amount: String(row.amount),
    category_id: row.category_id || '',
    transaction_date: row.transaction_date,
    notes: row.notes || ''
  });
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'details' | 'pin'>('details');
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [isPending, startTransition] = useTransition();
  const dateRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'details') {
      const errors: any = {};
      if (!formData.category_id) errors.category_id = true;
      if (!formData.source.trim()) errors.source = true;
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
      if (!pin || pin.length !== 4) {
        setValidationErrors({ pin: true });
        toast.error("Please enter a valid 4-digit security PIN.");
        return;
      }
      executeSubmit();
    }
  };

  const executeSubmit = () => {
    const toastId = toast.loading("Updating income transaction...");
    startTransition(async () => {
      const res = await updateIncome(row.id, {
        source: formData.source.trim(),
        amount: Number(formData.amount),
        category_id: formData.category_id,
        transaction_date: formData.transaction_date,
        notes: formData.notes.trim(),
        pin: hasPin ? pin : undefined
      });

      if (res.success) {
        toast.success(res.message || "Income updated successfully.", { id: toastId });
        onClose();
      } else {
        toast.error(res.error || "Failed to update income.", { id: toastId });
      }
    });
  };

  const categoryOptions = categories.map(c => ({
    label: c.name,
    value: c.id
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white rounded-xl shadow-premium border border-border w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/30 shrink-0">
          <h3 className="text-md font-semibold text-foreground">
            {step === 'pin' ? "Security Authentication" : "Edit Income Transaction"}
          </h3>
          <button 
            type="button"
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          
          {/* Fields Area */}
          <div className="p-5 space-y-3.5">
            
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

                {/* Row 2: Source/Description & Amount */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Source/Description Input */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Source / Description</label>
                    <input
                      type="text"
                      required
                      value={formData.source}
                      onChange={e => {
                        setFormData({ ...formData, source: e.target.value });
                        setValidationErrors({ ...validationErrors, source: false });
                      }}
                      placeholder="e.g. Salary, Consulting"
                      className={`w-full px-3 py-2 bg-white border rounded-md text-sm outline-none transition-all ${
                        validationErrors.source ? 'border-red-300 focus:border-red-500 ring-1 ring-red-500/20' : 'border-border hover:border-primary/50 focus:ring-2 focus:ring-primary/20'
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
                  onClose();
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
              {isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
