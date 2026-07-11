'use client';

import { useState, useTransition } from "react";
import { Plus, Edit, Trash2, Shield, User as UserIcon, X, CheckCircle2 } from "lucide-react";
import { createUser, updateUser, deleteUser } from "@/server/actions/user-actions";
import { toast } from "sonner";

export function UserTable({ initialUsers, isMasterAdmin }: { initialUsers: any[]; isMasterAdmin: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'USER', status: 'ACTIVE'
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', password: '', role: 'USER', status: 'ACTIVE' });
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role, status: user.status });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this user?")) {
      const toastId = toast.loading("Deleting user...");
      startTransition(async () => {
        const res = await deleteUser(id);
        if (res.success) toast.success(res.message, { id: toastId });
        else toast.error(res.error, { id: toastId });
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(editingUser ? "Updating user..." : "Creating user...");
    
    startTransition(async () => {
      let res;
      if (editingUser) {
        res = await updateUser(editingUser.id, formData);
      } else {
        if (!formData.password) {
          toast.error("Password is required for new users.", { id: toastId });
          return;
        }
        res = await createUser(formData);
      }

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
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Access Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage RBAC, family accounts, and system permissions.</p>
        </div>
        <button onClick={openAddModal} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-premium hover:bg-primary/90 flex items-center gap-2 transition-all">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase font-semibold border-b border-border">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role / Authorization</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {initialUsers.map((u) => (
              <tr key={u.id} className="hover:bg-secondary/30 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
                    <UserIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${u.role === 'SUPERADMIN' ? 'text-purple-600' : 'text-blue-600'}`} />
                    <span className="font-medium text-foreground">{u.role}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${u.status === 'ACTIVE' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-red-700 bg-red-50 border border-red-200'}`}>
                    {u.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Only show Edit button if current user has permission */}
                    {(isMasterAdmin || (u.role !== 'SUPERADMIN' && !u.isMasterAdmin)) && (
                      <button onClick={() => openEditModal(u)} className="p-2 text-muted-foreground bg-white border border-border shadow-sm hover:text-primary hover:bg-secondary rounded-md transition-all" title="Edit User">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {/* Only show Delete button if current user has permission and user is not a Master Admin */}
                    {!u.isMasterAdmin && (isMasterAdmin || u.role !== 'SUPERADMIN') && (
                      <button onClick={() => handleDelete(u.id)} className="p-2 text-muted-foreground bg-white border border-border shadow-sm hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-md transition-all" title="Delete User">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {initialUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No users found. Create one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CRUD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-premium border border-border w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/30">
              <h3 className="text-lg font-semibold text-foreground">{editingUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="john@example.com" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Password {editingUser && <span className="text-muted-foreground font-normal">(Leave blank to keep current)</span>}
                </label>
                <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none" placeholder="••••••••" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                    <option value="USER">User</option>
                    <option value="MEMBER">Member</option>
                    {isMasterAdmin && <option value="SUPERADMIN">Superadmin</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full px-3 py-2 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                    <option value="ACTIVE">Active</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-white border border-border text-foreground rounded-md text-sm font-medium shadow-sm hover:bg-secondary transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-premium hover:bg-primary/90 transition-all flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
