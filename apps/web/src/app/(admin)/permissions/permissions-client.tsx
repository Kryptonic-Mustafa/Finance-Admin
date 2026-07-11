'use client';

import { useState, useTransition } from "react";
import { updateRolePermissions, RolePermissionData } from "@/server/actions/permission-actions";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileSpreadsheet, 
  Mail, 
  Settings, 
  Save, 
  Check, 
  AlertTriangle 
} from "lucide-react";

export function PermissionsClient({
  initialPermissions,
  isMasterAdmin
}: {
  initialPermissions: Record<string, RolePermissionData>;
  isMasterAdmin: boolean;
}) {
  const roles = Object.keys(initialPermissions);
  const [activeRole, setActiveRole] = useState(roles[0]);
  const [permissions, setPermissions] = useState<Record<string, RolePermissionData>>(initialPermissions);
  const [isPending, startTransition] = useTransition();

  const isEditable = activeRole !== "MASTER ADMIN" && (activeRole !== "SUPERADMIN" || isMasterAdmin);

  const handleToggle = (role: string, field: keyof RolePermissionData) => {
    if (!isEditable) return;
    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: !prev[role][field]
      }
    }));
  };

  const handleSave = () => {
    const roleData = permissions[activeRole];
    startTransition(async () => {
      const res = await updateRolePermissions(activeRole, roleData);
      if (res.success) {
        toast.success(`Permissions for ${activeRole} saved successfully.`);
      } else {
        toast.error(res.error || "Failed to update permissions.");
      }
    });
  };

  // Compare if current permissions differ from the baseline ones
  const hasChanges = JSON.stringify(permissions[activeRole]) !== JSON.stringify(initialPermissions[activeRole]);

  const permissionGroups = [
    {
      title: "Dashboard & Analytics",
      icon: LayoutDashboard,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      description: "Controls the main landing screen access and chart metrics.",
      items: [
        { key: "canViewDashboard", label: "View Dashboard Overview", desc: "Allows viewing dashboard charts, summaries, and stats." }
      ]
    },
    {
      title: "Income Management",
      icon: ArrowUpRight,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: "Configure CRUD access levels for income ledger entries.",
      items: [
        { key: "canViewIncome", label: "View Incomes", desc: "View the list and details of income records." },
        { key: "canCreateIncome", label: "Create Income", desc: "Add new income entries to the system." },
        { key: "canUpdateIncome", label: "Update Income", desc: "Modify details of existing income records." },
        { key: "canDeleteIncome", label: "Delete Income", desc: "Permanently delete income records.", danger: true }
      ]
    },
    {
      title: "Expense Management",
      icon: ArrowDownRight,
      color: "bg-orange-50 text-orange-600 border-orange-100",
      description: "Configure CRUD access levels for expense logs and categories.",
      items: [
        { key: "canViewExpense", label: "View Expenses", desc: "View the list and details of expense records." },
        { key: "canCreateExpense", label: "Create Expense", desc: "Add new expense entries to the system." },
        { key: "canUpdateExpense", label: "Update Expense", desc: "Modify details of existing expense records." },
        { key: "canDeleteExpense", label: "Delete Expense", desc: "Permanently delete expense records.", danger: true }
      ]
    },
    {
      title: "Imports & Automations",
      icon: FileSpreadsheet,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      description: "Excel uploads, column mapper templates, and database resets.",
      items: [
        { key: "canViewImports", label: "View Imports Module", desc: "Access the Excel import dashboard." },
        { key: "canImportExcel", label: "Upload Excel Files", desc: "Trigger Excel parser job logs and upload new data." },
        { key: "canTruncateDatabase", label: "Truncate Database", desc: "Wipe all transaction records from the ledger.", danger: true }
      ]
    },
    {
      title: "Internal Inbox",
      icon: Mail,
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
      description: "In-app messaging client, system logs notifications, and folder tabs.",
      items: [
        { key: "canViewInbox", label: "Access Inbox", desc: "Read received/sent system messages and notification alerts." },
        { key: "canComposeEmail", label: "Compose & Send Messages", desc: "Draft and send messages to other contacts." }
      ]
    },
    {
      title: "Settings & System Control",
      icon: Settings,
      color: "bg-slate-50 text-slate-600 border-slate-100",
      description: "Configure contact directories, roles, and administrative tasks.",
      items: [
        { key: "canViewSettings", label: "View Settings Tab", desc: "Access the settings and recovery configuration view." },
        { key: "canManageContacts", label: "Manage Contacts", desc: "Create, edit, or remove contacts from the group directory." },
        { key: "canManagePermissions", label: "Manage Roles & Permissions", desc: "Modify role permissions checkboxes.", danger: true }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Role Selection Tabs */}
      <div className="flex border-b border-border bg-slate-50 p-1.5 rounded-xl gap-1 shrink-0">
        {roles.map(role => {
          const isActive = activeRole === role;
          return (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg transition-all ${
                isActive 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/50 font-bold" 
                  : "text-muted-foreground hover:text-slate-700 hover:bg-white/50"
              }`}
            >
              {role}
            </button>
          );
        })}
      </div>

      {/* Permissions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {permissionGroups.map(group => {
          const GroupIcon = group.icon;
          return (
            <div key={group.title} className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              {/* Group Header */}
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl border ${group.color} shrink-0`}>
                  <GroupIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">{group.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{group.description}</p>
                </div>
              </div>

              {/* Group Items List */}
              <div className="divide-y divide-slate-100 border-t border-slate-100 pt-2">
                {group.items.map(item => {
                  const val = permissions[activeRole]?.[item.key as keyof RolePermissionData] ?? false;
                  return (
                    <label 
                      key={item.key} 
                      className={`flex items-start justify-between py-3.5 select-none ${
                        isEditable ? "cursor-pointer group" : "cursor-not-allowed opacity-75"
                      }`}
                    >
                      <div className="space-y-0.5 max-w-[80%]">
                        <span className="text-xs font-medium text-slate-700 group-hover:text-slate-900 transition-colors flex items-center gap-1.5">
                          {item.label}
                          {item.danger && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-red-50 text-[9px] font-semibold text-red-600 uppercase border border-red-100">
                              <AlertTriangle className="w-2.5 h-2.5" /> Danger
                            </span>
                          )}
                        </span>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>

                      {/* iOS-style Toggle Switch */}
                      <div className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={val}
                          disabled={isPending || !isEditable}
                          onChange={() => handleToggle(activeRole, item.key as keyof RolePermissionData)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Action Bar */}
      <div className="bg-white border border-border p-4 rounded-2xl flex items-center justify-between shadow-sm sticky bottom-4 z-10 backdrop-blur-md bg-white/95">
        <div className="flex items-center gap-2">
          {!isEditable ? (
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Read-only role. System settings cannot be modified.
            </span>
          ) : hasChanges ? (
            <span className="text-xs text-amber-600 font-medium flex items-center gap-1.5 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="w-3.5 h-3.5" /> You have unsaved changes.
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5 text-emerald-500" /> Settings synced with DB.
            </span>
          )}
        </div>

        {isEditable && (
          <button
            onClick={handleSave}
            disabled={isPending || !hasChanges}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-600/10 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:shadow-none transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}
