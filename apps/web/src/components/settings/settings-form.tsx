'use client';

import { useState, useTransition, useEffect } from "react";
import { 
  CheckCircle2, 
  Lock, 
  KeyRound, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  UserPlus, 
  Users 
} from "lucide-react";
import { updateUser } from "@/server/actions/user-actions";
import { requestPinReset } from "@/server/actions/pin-actions";
import { 
  getContacts, 
  createContact, 
  deleteContact, 
  getPendingHelpRequests, 
  approveFamilyHelpRequest 
} from "@/server/actions/recovery-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SettingsForm({ user, hasPin: initialHasPin, canManageContacts = true }: { user: any; hasPin: boolean; canManageContacts?: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPinPending, startPinTransition] = useTransition();
  const [hasPin, setHasPin] = useState(initialHasPin);
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    password: '',
    role: user.role,
    status: 'ACTIVE'
  });

  // Contacts State
  const [contacts, setContacts] = useState<any[]>([]);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactGroup, setContactGroup] = useState("Family");
  const [isAddingContact, setIsAddingContact] = useState(false);

  // Recovery Help Requests State
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);

  // Fetch Data on Mount
  useEffect(() => {
    loadContacts();
    loadHelpRequests();
  }, []);

  async function loadContacts() {
    const res = await getContacts();
    if (res.success && res.contacts) {
      setContacts(res.contacts);
    }
  }

  async function loadHelpRequests() {
    const res = await getPendingHelpRequests();
    if (res.success && res.requests) {
      setPendingRequests(res.requests);
    }
  }

  const handleApproveRequest = async (targetUserId: string) => {
    const toastId = toast.loading("Approving recovery request...");
    const res = await approveFamilyHelpRequest(targetUserId);
    if (res.success) {
      toast.success("Recovery request approved! The locked user can now set a new password.", { id: toastId });
      loadHelpRequests();
    } else {
      toast.error(res.error || "Failed to approve request.", { id: toastId });
    }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim()) {
      toast.error("Please fill in all contact fields.");
      return;
    }
    setIsAddingContact(true);
    const res = await createContact(contactName, contactEmail, contactGroup);
    setIsAddingContact(false);
    if (res.success) {
      toast.success("Contact added successfully.");
      setContactName("");
      setContactEmail("");
      loadContacts();
    } else {
      toast.error(res.error || "Failed to add contact.");
    }
  };

  const handleDeleteContact = async (id: string) => {
    const toastId = toast.loading("Deleting contact...");
    const res = await deleteContact(id);
    if (res.success) {
      toast.success("Contact deleted.", { id: toastId });
      loadContacts();
    } else {
      toast.error(res.error || "Failed to delete contact.", { id: toastId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading("Updating profile...");
    
    startTransition(async () => {
      const res = await updateUser(user.id, formData);

      if (res.success) {
        toast.success("Profile updated! The header will refresh shortly.", { id: toastId });
        setFormData(prev => ({ ...prev, password: '' }));
        router.refresh();
      } else {
        toast.error(res.error, { id: toastId });
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Pending Recovery Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-3 animate-in fade-in duration-300">
          <h4 className="text-sm font-semibold text-rose-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Pending Password Recovery Requests
          </h4>
          <p className="text-xs text-rose-600">
            The following family members/users are currently locked out and requested system help. Confirming their request will authorize them to reset their password.
          </p>
          <div className="space-y-2">
            {pendingRequests.map(req => (
              <div key={req.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-rose-100 p-3 rounded-lg text-xs gap-3">
                <div>
                  <span className="font-semibold text-slate-800">{req.name}</span>
                  <span className="text-slate-500 ml-1">({req.email})</span>
                  <span className="text-[10px] text-slate-400 block sm:inline sm:ml-2">
                    Requested: {new Date(req.familyHelpRequestedAt).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleApproveRequest(req.id)}
                  className="px-3.5 py-1.5 bg-rose-600 text-white rounded-md font-medium hover:bg-rose-700 transition-colors whitespace-nowrap"
                >
                  Approve Password Reset
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Main Profile Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-border pb-2">Profile Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full px-3 py-2.5 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              className="w-full px-3 py-2.5 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800" 
            />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Security
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              New Password <span className="text-muted-foreground font-normal">(Leave blank to keep current password)</span>
            </label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              className="w-full px-3 py-2.5 bg-white border border-border rounded-md text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-slate-800" 
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-border">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> Transaction PIN
          </h3>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-secondary/20 rounded-xl border border-border gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Status:</span>
                {hasPin ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" /> Active (Secure)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <ShieldAlert className="w-3.5 h-3.5" /> Not Configured
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground max-w-md">
                A 4-6 digit numeric PIN required when adding transaction records to verify family identity and prevent accidental/fraudulent edits.
              </p>
            </div>

            <button
              type="button"
              disabled={isPinPending}
              onClick={() => {
                const toastId = toast.loading("Generating secure configuration link...");
                startPinTransition(async () => {
                  const res = await requestPinReset();
                  if (res.success) {
                    toast.success(res.message, { id: toastId, duration: 8000 });
                    if (res.warning) {
                      toast.warning(res.warning, { duration: 10000 });
                    }
                  } else {
                    toast.error(res.error, { id: toastId });
                  }
                });
              }}
              className="px-4 py-2 bg-secondary hover:bg-secondary/80 border border-border text-foreground font-medium rounded-lg text-sm transition-colors whitespace-nowrap"
            >
              {isPinPending ? "Requesting..." : hasPin ? "Reset Transaction PIN" : "Configure Transaction PIN"}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <button 
            type="submit" 
            disabled={isPending}
            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium shadow-premium hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* 3. Personal Contacts Management Section */}
      {canManageContacts && (
        <div className="pt-6 border-t border-border space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider border-b border-border pb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> Personal Contacts & Groups
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Add contacts categorized by groups (Family, Friends, Work, etc.) to make recipient type-ahead autocomplete and search easy in Compose.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Add Contact Form */}
            <div className="bg-slate-50 border border-border p-4 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <UserPlus className="w-4 h-4" /> Add New Contact
              </h4>
              <form onSubmit={handleAddContact} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Contact Name</label>
                  <input 
                    type="text"
                    required
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-2.5 py-2 bg-white border border-border rounded-md text-xs outline-none focus:ring-2 focus:ring-primary/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="e.g. john@finance.local"
                    className="w-full px-2.5 py-2 bg-white border border-border rounded-md text-xs outline-none focus:ring-2 focus:ring-primary/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Group / Tag</label>
                  <select
                    value={contactGroup}
                    onChange={e => setContactGroup(e.target.value)}
                    className="w-full px-2.5 py-2 bg-white border border-border rounded-md text-xs outline-none focus:ring-2 focus:ring-primary/20 text-slate-800"
                  >
                    <option value="Family">Family</option>
                    <option value="Friends">Friends</option>
                    <option value="Work">Work</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isAddingContact}
                  className="w-full py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Contact
                </button>
              </form>
            </div>

            {/* Contact List */}
            <div className="lg:col-span-2 border border-border rounded-xl overflow-hidden bg-white max-h-[360px] overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">No personal contacts added yet.</p>
                </div>
              ) : (
                <>
                  {/* Mobile view card list */}
                  <div className="block md:hidden divide-y divide-border">
                    {contacts.map(contact => (
                      <div key={contact.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50">
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-800 truncate block text-xs">{contact.name}</span>
                            <span className={`inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border shrink-0 ${
                              contact.groupName === 'Family'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : contact.groupName === 'Friends'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : contact.groupName === 'Work'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {contact.groupName}
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono truncate block">{contact.email}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteContact(contact.id)}
                          title="Delete contact"
                          className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors ml-2 shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Desktop view table */}
                  <table className="w-full text-left border-collapse hidden md:table">
                    <thead>
                      <tr className="bg-slate-50 border-b border-border text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-2.5">Name</th>
                        <th className="px-4 py-2.5">Email</th>
                        <th className="px-4 py-2.5">Group</th>
                        <th className="px-4 py-2.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border text-xs text-slate-700">
                      {contacts.map(contact => (
                        <tr key={contact.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-medium">{contact.name}</td>
                          <td className="px-4 py-2.5 font-mono text-[11px]">{contact.email}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${
                              contact.groupName === 'Family'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : contact.groupName === 'Friends'
                                ? 'bg-sky-50 text-sky-700 border-sky-200'
                                : contact.groupName === 'Work'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {contact.groupName}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(contact.id)}
                              title="Delete contact"
                              className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
