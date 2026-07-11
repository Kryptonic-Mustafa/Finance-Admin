'use client';

import { useState, useTransition } from "react";
import { Plus, Edit, Trash2, ArrowUpRight, ArrowDownRight, User, X, CheckCircle2 } from "lucide-react";
import { createCategory, updateCategory, deleteCategory } from "@/server/actions/category-actions";
import { toast } from "sonner";

export function CategoryManager({ categories, canCreate = true, canUpdate = true, canDelete = true }: { categories: any[], canCreate?: boolean, canUpdate?: boolean, canDelete?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  const [formData, setFormData] = useState({ name: '', type: 'EXPENSE', color: '#EF4444' });

  const incomeCategories = categories.filter(c => c.type === "INCOME");
  const expenseCategories = categories.filter(c => c.type === "EXPENSE");

  const openAddModal = (type: 'INCOME' | 'EXPENSE') => {
    setEditingCategory(null);
    setFormData({ name: '', type, color: type === 'INCOME' ? '#10B981' : '#EF4444' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setFormData({ name: cat.name, type: cat.type, color: cat.color || '#000000' });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this category? (Will fail if transactions are actively using it)")) {
      const toastId = toast.loading("Deleting...");
      startTransition(async () => {
        const res = await deleteCategory(id);
        if (res.success) toast.success(res.message, { id: toastId });
        else toast.error(res.error, { id: toastId });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Saving category...");
    startTransition(async () => {
      const res = editingCategory 
        ? await updateCategory(editingCategory.id, formData)
        : await createCategory(formData);

      if (res.success) {
        toast.success(res.message, { id: toastId });
        setIsModalOpen(false);
      } else {
        toast.error(res.error, { id: toastId });
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Shared family tags for incomes and expenses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* INCOME COLUMN */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-md border border-emerald-100"><ArrowUpRight className="w-5 h-5 text-emerald-600" /></div>
              <h2 className="text-lg font-medium text-foreground">Income</h2>
            </div>
            {canCreate && (
              <button onClick={() => openAddModal('INCOME')} className="p-1.5 bg-white border border-border rounded shadow-sm hover:text-emerald-600 transition-colors"><Plus className="w-4 h-4" /></button>
            )}
          </div>
          <ul className="divide-y divide-border overflow-y-auto flex-1">
            {incomeCategories.map(cat => (
              <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#10B981' }} />
                  <span className="font-medium text-sm text-foreground">{cat.name}</span>
                  <span className="flex items-center gap-1 text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                    <User className="w-3 h-3" /> {cat.user?.name || "System"}
                  </span>
                </div>
                {/* REMOVED opacity-0 group-hover:opacity-100 to make buttons always visible */}
                <div className="flex items-center gap-2">
                  {canUpdate && (
                    <button onClick={() => openEditModal(cat)} className="p-1.5 text-muted-foreground hover:text-primary bg-white border border-border shadow-sm rounded hover:bg-secondary transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-muted-foreground hover:text-red-600 bg-white border border-border shadow-sm rounded hover:bg-red-50 hover:border-red-200 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* EXPENSE COLUMN */}
        <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-md border border-red-100"><ArrowDownRight className="w-5 h-5 text-red-600" /></div>
              <h2 className="text-lg font-medium text-foreground">Expense</h2>
            </div>
            {canCreate && (
              <button onClick={() => openAddModal('EXPENSE')} className="p-1.5 bg-white border border-border rounded shadow-sm hover:text-red-600 transition-colors"><Plus className="w-4 h-4" /></button>
            )}
          </div>
          <ul className="divide-y divide-border overflow-y-auto flex-1">
            {expenseCategories.map(cat => (
              <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#EF4444' }} />
                  <span className="font-medium text-sm text-foreground">{cat.name}</span>
                  <span className="flex items-center gap-1 text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded-full border border-border">
                    <User className="w-3 h-3" /> {cat.user?.name || "System"}
                  </span>
                </div>
                {/* REMOVED opacity-0 group-hover:opacity-100 to make buttons always visible */}
                <div className="flex items-center gap-2">
                  {canUpdate && (
                    <button onClick={() => openEditModal(cat)} className="p-1.5 text-muted-foreground hover:text-primary bg-white border border-border shadow-sm rounded hover:bg-secondary transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                  )}
                  {canDelete && (
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-muted-foreground hover:text-red-600 bg-white border border-border shadow-sm rounded hover:bg-red-50 hover:border-red-200 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CRUD MODAL REMAINS UNCHANGED */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-premium border border-border w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-border bg-secondary/30">
              <h3 className="text-lg font-semibold text-foreground">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Category Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="e.g. Groceries" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Type</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Label Color</label>
                  <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full h-[38px] p-1 bg-white border border-border rounded-md cursor-pointer" />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-border text-foreground rounded-md text-sm font-medium hover:bg-secondary">Cancel</button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-premium hover:bg-primary/90 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
