'use client';
import { Search, FolderTree, XCircle, Trash2 } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { SearchSelect } from "@/components/ui/search-select";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { deleteIncome, deleteIncomes } from "@/server/actions/crud-actions";

export function IncomeTable({ data, sym, categories, currentCategory, currentSearch, canDelete = true }: { data: any[], sym: string, categories: any[], currentCategory: string, currentSearch: string, canDelete?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isDeleteMode, setIsDeleteMode] = useState(false);
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

        {/* Delete Mode controls */}
        {canDelete && (!isDeleteMode ? (
          <button 
            type="button" 
            onClick={enterDeleteMode} 
            className="px-3 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors ml-auto"
          >
            <Trash2 className="w-4 h-4" /> Delete Mode
          </button>
        ) : (
          <div className="flex items-center gap-2 ml-auto">
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
              {isDeleteMode && <th className="px-6 py-4 text-right w-24">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={isDeleteMode ? 6 : 4} className="px-6 py-12 text-center text-muted-foreground">
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
                    {isDeleteMode && (
                      <td className="px-6 py-4 text-right">
                        <button 
                          type="button"
                          onClick={() => handleSingleDelete(row.id, row.source)} 
                          className="p-1 text-muted-foreground hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
