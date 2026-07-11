'use client';

import { useState, useTransition, useMemo, useEffect } from "react";
import { 
  Inbox, 
  Send, 
  Search, 
  ArrowLeft, 
  Plus, 
  X, 
  Tag, 
  Users as UsersIcon, 
  FileText, 
  Mail, 
  Check, 
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { sendEmail, markEmailAsRead } from "@/server/actions/email-actions";
import { getContacts } from "@/server/actions/recovery-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Email {
  id: string;
  senderId: string | null;
  senderEmail: string;
  recipientId: string;
  recipientEmail: string;
  subject: string;
  body: string;
  read: boolean;
  category: string;
  system: boolean;
  createdAt: Date;
}

interface User {
  name: string;
  email: string;
}

interface InboxClientProps {
  received: Email[];
  sent: Email[];
  users: User[];
  currentUserId: string;
}

type Folder = "inbox" | "sent";
type Category = "PRIMARY" | "UPDATES" | "SOCIAL";

export function InboxClient({ received, sent, users, currentUserId }: InboxClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Navigation State
  const [activeFolder, setActiveFolder] = useState<Folder>("inbox");
  const [activeCategory, setActiveCategory] = useState<Category>("PRIMARY");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // Compose State
  const [isComposing, setIsComposing] = useState(false);
  const [toRecipients, setToRecipients] = useState<string[]>([]);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);

  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");

  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [composeCategory, setComposeCategory] = useState<Category>("PRIMARY");

  const [activeField, setActiveField] = useState<'to' | 'cc' | 'bcc'>('to');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showRecipientsDirectory, setShowRecipientsDirectory] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

  // Contacts state loaded dynamically
  const [contacts, setContacts] = useState<{ id: string; name: string; email: string; groupName: string }[]>([]);

  useEffect(() => {
    async function loadContacts() {
      const res = await getContacts();
      if (res.success && res.contacts) {
        setContacts(res.contacts);
      }
    }
    loadContacts();
  }, []);

  // Suggestions for currently active field
  const suggestions = useMemo(() => {
    const val = activeField === 'to' ? toInput : activeField === 'cc' ? ccInput : bccInput;
    if (!val) return [];
    const query = val.toLowerCase();
    const currentList = activeField === 'to' ? toRecipients : activeField === 'cc' ? ccRecipients : bccRecipients;

    // Combine system users and personal contacts with their respective group tags
    const systemPool = users.map(u => ({ ...u, source: "System", groupName: "System" }));
    const contactsPool = contacts.map(c => ({ ...c, source: "Contact", groupName: c.groupName }));
    const combinedPool = [...systemPool, ...contactsPool];

    // Deduplicate by email address, prioritizing personal contacts
    const uniquePoolMap = new Map<string, typeof combinedPool[number]>();
    for (const item of combinedPool) {
      const emailLower = item.email.toLowerCase();
      if (uniquePoolMap.has(emailLower)) {
        if (item.source === "Contact") {
          uniquePoolMap.set(emailLower, item);
        }
      } else {
        uniquePoolMap.set(emailLower, item);
      }
    }

    const deduplicatedPool = Array.from(uniquePoolMap.values());

    return deduplicatedPool.filter(u => 
      !currentList.some(r => r.toLowerCase() === u.email.toLowerCase()) &&
      (u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
    );
  }, [activeField, toInput, ccInput, bccInput, toRecipients, ccRecipients, bccRecipients, users, contacts]);

  // Validation check for currently active text
  const activeInputText = useMemo(() => {
    return activeField === 'to' ? toInput : activeField === 'cc' ? ccInput : bccInput;
  }, [activeField, toInput, ccInput, bccInput]);

  const isValidInputRecipient = useMemo(() => {
    const isSystemUser = users.some(u => u.email.toLowerCase() === activeInputText.toLowerCase());
    const isContactUser = contacts.some(c => c.email.toLowerCase() === activeInputText.toLowerCase());
    return isSystemUser || isContactUser;
  }, [activeInputText, users, contacts]);

  const isInputEmailFormat = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(activeInputText);
  }, [activeInputText]);

  const handleSelectSuggestion = (email: string, field: 'to' | 'cc' | 'bcc') => {
    const setInput = field === 'to' ? setToInput : field === 'cc' ? setCcInput : setBccInput;
    const recipientsList = field === 'to' ? toRecipients : field === 'cc' ? ccRecipients : bccRecipients;
    const setRecipientsList = field === 'to' ? setToRecipients : field === 'cc' ? setCcRecipients : setBccRecipients;

    if (!recipientsList.includes(email)) {
      setRecipientsList([...recipientsList, email]);
    }
    setInput("");
    setFocusedSuggestionIndex(-1);
    setShowSuggestions(false);
  };

  const handleRemoveRecipient = (email: string, field: 'to' | 'cc' | 'bcc') => {
    const recipientsList = field === 'to' ? toRecipients : field === 'cc' ? ccRecipients : bccRecipients;
    const setRecipientsList = field === 'to' ? setToRecipients : field === 'cc' ? setCcRecipients : setBccRecipients;
    setRecipientsList(recipientsList.filter(r => r !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: 'to' | 'cc' | 'bcc') => {
    const val = field === 'to' ? toInput : field === 'cc' ? ccInput : bccInput;
    const setInput = field === 'to' ? setToInput : field === 'cc' ? setCcInput : setBccInput;
    const recipientsList = field === 'to' ? toRecipients : field === 'cc' ? ccRecipients : bccRecipients;
    const setRecipientsList = field === 'to' ? setToRecipients : field === 'cc' ? setCcRecipients : setBccRecipients;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedSuggestionIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < suggestions.length) {
        const selected = suggestions[focusedSuggestionIndex];
        if (!recipientsList.includes(selected.email)) {
          setRecipientsList([...recipientsList, selected.email]);
        }
        setInput("");
        setFocusedSuggestionIndex(-1);
        setShowSuggestions(false);
      } else if (val.trim()) {
        const trimmed = val.trim().replace(/,$/, "");
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          if (!recipientsList.includes(trimmed)) {
            setRecipientsList([...recipientsList, trimmed]);
          }
          setInput("");
          setShowSuggestions(false);
        } else {
          toast.error("Please enter a valid email format.");
        }
      }
    } else if (e.key === 'Backspace' && !val && recipientsList.length > 0) {
      setRecipientsList(recipientsList.slice(0, -1));
    }
  };

  // Filter Emails
  const filteredEmails = useMemo(() => {
    const pool = activeFolder === "inbox" ? received : sent;
    return pool.filter(email => {
      // Category filter for inbox
      if (activeFolder === "inbox" && email.category !== activeCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSender = email.senderEmail.toLowerCase().includes(query);
        const matchesRecipient = email.recipientEmail.toLowerCase().includes(query);
        const matchesSubject = email.subject.toLowerCase().includes(query);
        const matchesBody = email.body.toLowerCase().includes(query);
        return matchesSender || matchesRecipient || matchesSubject || matchesBody;
      }
      return true;
    });
  }, [activeFolder, activeCategory, searchQuery, received, sent]);

  // Unread counts per folder/category
  const unreadInboxCount = useMemo(() => received.filter(e => !e.read).length, [received]);
  const categoryUnreadCounts = useMemo(() => {
    return {
      PRIMARY: received.filter(e => !e.read && e.category === "PRIMARY").length,
      UPDATES: received.filter(e => !e.read && e.category === "UPDATES").length,
      SOCIAL: received.filter(e => !e.read && e.category === "SOCIAL").length,
    };
  }, [received]);

  const handleSelectEmail = (email: Email) => {
    setSelectedEmail(email);
    if (activeFolder === "inbox" && !email.read) {
      startTransition(async () => {
        const res = await markEmailAsRead(email.id);
        if (res.success) {
          router.refresh();
        }
      });
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();

    if (toRecipients.length === 0) {
      toast.error("Please specify at least one recipient in the 'To' field.");
      return;
    }

    const toastId = toast.loading("Sending email...");
    startTransition(async () => {
      const res = await sendEmail(toRecipients, composeSubject, composeBody, composeCategory, ccRecipients, bccRecipients);
      if (res.success) {
        toast.success("Message sent successfully!", { id: toastId });
        setIsComposing(false);
        setToRecipients([]);
        setCcRecipients([]);
        setBccRecipients([]);
        setToInput("");
        setCcInput("");
        setBccInput("");
        setShowCc(false);
        setShowBcc(false);
        setComposeSubject("");
        setComposeBody("");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to send email.", { id: toastId });
      }
    });
  };

  const formatDate = (dateObj: Date) => {
    const date = new Date(dateObj);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex bg-white border border-border rounded-2xl h-full overflow-hidden relative">
      
      {/* 1. LEFT SIDEBAR */}
      <aside className="w-64 border-r border-border bg-slate-50/50 flex flex-col shrink-0 p-4 space-y-4">
        
        {/* Compose Button */}
        <button
          onClick={() => {
            setToRecipients([]);
            setCcRecipients([]);
            setBccRecipients([]);
            setToInput("");
            setCcInput("");
            setBccInput("");
            setShowCc(false);
            setShowBcc(false);
            setComposeSubject("");
            setComposeBody("");
            setShowSuggestions(false);
            setShowRecipientsDirectory(false);
            setFocusedSuggestionIndex(-1);
            setIsComposing(true);
          }}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/10 transition-all"
        >
          <Plus className="w-4 h-4" /> Compose
        </button>

        {/* Folders */}
        <div className="space-y-1">
          <button
            onClick={() => {
              setActiveFolder("inbox");
              setSelectedEmail(null);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeFolder === "inbox" 
                ? "bg-blue-50 text-blue-700" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4" />
              <span>Inbox</span>
            </div>
            {unreadInboxCount > 0 && (
              <span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full text-xs">
                {unreadInboxCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveFolder("sent");
              setSelectedEmail(null);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeFolder === "sent" 
                ? "bg-blue-50 text-blue-700" 
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sent Mail</span>
          </button>
        </div>

        {/* Categories (Inbox-only filters) */}
        {activeFolder === "inbox" && (
          <div className="pt-4 border-t border-border space-y-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
              Categories
            </div>
            
            <button
              onClick={() => {
                setActiveCategory("PRIMARY");
                setSelectedEmail(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === "PRIMARY" 
                  ? "bg-slate-100 text-foreground font-semibold" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                <span>Primary</span>
              </div>
              {categoryUnreadCounts.PRIMARY > 0 && (
                <span className="text-muted-foreground text-xs font-semibold">
                  {categoryUnreadCounts.PRIMARY}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveCategory("UPDATES");
                setSelectedEmail(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === "UPDATES" 
                  ? "bg-slate-100 text-foreground font-semibold" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/20" />
                <span>Updates</span>
              </div>
              {categoryUnreadCounts.UPDATES > 0 && (
                <span className="text-muted-foreground text-xs font-semibold">
                  {categoryUnreadCounts.UPDATES}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setActiveCategory("SOCIAL");
                setSelectedEmail(null);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === "SOCIAL" 
                  ? "bg-slate-100 text-foreground font-semibold" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2">
                <UsersIcon className="w-3.5 h-3.5 text-purple-500 fill-purple-500/20" />
                <span>Social</span>
              </div>
              {categoryUnreadCounts.SOCIAL > 0 && (
                <span className="text-muted-foreground text-xs font-semibold">
                  {categoryUnreadCounts.SOCIAL}
                </span>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* 2. MAIN INBOX CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        
        {/* Header Search */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search in ${activeFolder === 'inbox' ? activeCategory.toLowerCase() : 'sent mail'}...`}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
          </div>
        </div>

        {/* View Detail or Inbox List */}
        {selectedEmail ? (
          /* EMAIL READ VIEW */
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setSelectedEmail(null)}
                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  selectedEmail.system 
                    ? "bg-amber-100 text-amber-800 border border-amber-200" 
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}>
                  {selectedEmail.system ? "System Notification" : "User Mail"}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{selectedEmail.subject}</h1>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-600 border border-slate-200">
                      {selectedEmail.senderEmail[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">
                        {selectedEmail.system ? "Platform Security Daemon" : selectedEmail.senderEmail}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        To: {selectedEmail.recipientEmail === currentUserId ? "Me" : selectedEmail.recipientEmail}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground" suppressHydrationWarning>
                    {new Date(selectedEmail.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Body inside secure isolated IFrame to preserve layout styling */}
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-slate-50/20">
                {selectedEmail.body.includes("<div") || selectedEmail.body.includes("<html") ? (
                  <iframe
                    srcDoc={`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <base target="_top">
                          <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 12px; color: #334155; }
                          </style>
                        </head>
                        <body>
                          ${selectedEmail.body}
                        </body>
                      </html>
                    `}
                    title="Email Viewer"
                    className="w-full min-h-[350px] border-none"
                    sandbox="allow-popups allow-same-origin allow-top-navigation"
                  />
                ) : (
                  <div className="p-6 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedEmail.body}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* EMAIL LIST VIEW */
          <div className="flex-1 overflow-y-auto">
            {filteredEmails.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-muted-foreground mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-md font-semibold text-slate-700">No emails found</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  {searchQuery ? "Try refining your search terms." : "This category is completely clean and empty."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border border-b border-border">
                {filteredEmails.map(email => (
                  <div
                    key={email.id}
                    onClick={() => handleSelectEmail(email)}
                    className={`flex items-center gap-4 px-6 py-3 cursor-pointer transition-colors text-sm hover:bg-slate-50/50 ${
                      activeFolder === "inbox" && !email.read ? "bg-blue-50/30 font-semibold text-slate-900 border-l-2 border-blue-500" : "text-slate-600"
                    }`}
                  >
                    {/* Unread indicator */}
                    <div className="w-2 h-2 rounded-full flex-shrink-0">
                      {activeFolder === "inbox" && !email.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      )}
                    </div>

                    {/* Sender / Recipient */}
                    <div className="w-48 truncate font-medium">
                      {activeFolder === "inbox" 
                        ? (email.system ? "🛡️ System Notification" : email.senderEmail)
                        : `To: ${email.recipientEmail}`
                      }
                    </div>

                    {/* Subject + Snippet */}
                    <div className="flex-1 min-w-0 flex items-baseline gap-2">
                      <span className={`${activeFolder === "inbox" && !email.read ? "text-slate-900" : "text-slate-800"}`}>
                        {email.subject}
                      </span>
                      <span className="text-xs text-muted-foreground truncate font-normal">
                        — {email.body.replace(/<[^>]*>/g, '').substring(0, 80)}
                      </span>
                    </div>

                    {/* System Badge */}
                    {email.system && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 border border-amber-200 uppercase font-semibold">
                        System
                      </span>
                    )}

                    {/* Date */}
                    <div className="text-xs text-muted-foreground w-16 text-right whitespace-nowrap" suppressHydrationWarning>
                      {formatDate(email.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. DOCKED COMPOSE WINDOW (GMAIL STYLE!) */}
      {isComposing && (
        <div className="fixed bottom-0 right-12 w-[500px] bg-white border border-border rounded-t-2xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300">
          
          {/* Header Title Bar */}
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-semibold">New Message</span>
            <button 
              onClick={() => setIsComposing(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-4 flex-1 flex flex-col space-y-3">
            
            {/* 1. To Field */}
            <div className="flex items-start border-b border-border py-1.5 min-h-[44px]">
              <label className="text-xs font-semibold text-slate-500 w-16 pt-2 shrink-0">To:</label>
              <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0 relative pr-2">
                {toRecipients.map(r => (
                  <span key={r} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {r}
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(r, 'to')}
                      className="text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  placeholder={toRecipients.length === 0 ? "Enter recipient email..." : ""}
                  value={toInput}
                  onChange={e => {
                    setToInput(e.target.value);
                    setActiveField('to');
                    setShowSuggestions(true);
                    setFocusedSuggestionIndex(-1);
                  }}
                  onFocus={() => {
                    setActiveField('to');
                    setShowSuggestions(true);
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  onKeyDown={e => handleKeyDown(e, 'to')}
                  className="flex-1 min-w-[120px] bg-transparent text-sm outline-none border-none py-1 focus:ring-0 text-slate-800"
                />

                {/* Validation Badge for Active Field */}
                {activeField === 'to' && toInput && (
                  <div className="flex items-center shrink-0 mr-1">
                    {isValidInputRecipient ? (
                      <div className="flex items-center gap-0.5 text-emerald-600">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                        <span className="text-[9px] font-bold bg-emerald-50 px-1 py-0.5 rounded">System</span>
                      </div>
                    ) : isInputEmailFormat ? (
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-bold bg-amber-50 px-1 py-0.5 rounded">External</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5 text-red-500">
                        <X className="w-3.5 h-3.5 stroke-[3]" />
                        <span className="text-[9px] font-bold bg-red-50 px-1 py-0.5 rounded">Invalid</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Suggestions List for To */}
                {activeField === 'to' && suggestions.length > 0 && showSuggestions && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-premium max-h-48 overflow-y-auto z-50 animate-in fade-in duration-100">
                    {suggestions.map((u, idx) => (
                      <button
                        key={u.email}
                        type="button"
                        onMouseDown={() => handleSelectSuggestion(u.email, 'to')}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors border-b border-slate-50 last:border-b-0 ${
                          idx === focusedSuggestionIndex ? 'bg-blue-50 text-blue-900' : 'hover:bg-secondary/50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground">{u.email}</span>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                          u.groupName === 'System' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : u.groupName === 'Family'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : u.groupName === 'Friends'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : u.groupName === 'Work'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {u.groupName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons for CC/BCC/Recipients */}
              <div className="flex items-center gap-2 pt-1 shrink-0">
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="text-xs text-muted-foreground hover:text-slate-700 font-semibold"
                  >
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    type="button"
                    onClick={() => setShowBcc(true)}
                    className="text-xs text-muted-foreground hover:text-slate-700 font-semibold"
                  >
                    Bcc
                  </button>
                )}
                <button
                  type="button"
                  title="Recipients"
                  onClick={() => {
                    setActiveField('to');
                    setShowRecipientsDirectory(!showRecipientsDirectory);
                  }}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <UsersIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 2. CC Field */}
            {showCc && (
              <div className="flex items-start border-b border-border py-1.5 min-h-[44px]">
                <label className="text-xs font-semibold text-slate-500 w-16 pt-2 shrink-0">Cc:</label>
                <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0 relative pr-2">
                  {ccRecipients.map(r => (
                    <span key={r} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {r}
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(r, 'cc')}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={ccRecipients.length === 0 ? "Cc..." : ""}
                    value={ccInput}
                    onChange={e => {
                      setCcInput(e.target.value);
                      setActiveField('cc');
                      setShowSuggestions(true);
                      setFocusedSuggestionIndex(-1);
                    }}
                    onFocus={() => {
                      setActiveField('cc');
                      setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onKeyDown={e => handleKeyDown(e, 'cc')}
                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none border-none py-1 focus:ring-0 text-slate-800"
                  />

                  {/* Validation Badge for Active Field */}
                  {activeField === 'cc' && ccInput && (
                    <div className="flex items-center shrink-0 mr-1">
                      {isValidInputRecipient ? (
                        <div className="flex items-center gap-0.5 text-emerald-600">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span className="text-[9px] font-bold bg-emerald-50 px-1 py-0.5 rounded">System</span>
                        </div>
                      ) : isInputEmailFormat ? (
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-bold bg-amber-50 px-1 py-0.5 rounded">External</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5 text-red-500">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                          <span className="text-[9px] font-bold bg-red-50 px-1 py-0.5 rounded">Invalid</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggestions List for Cc */}
                  {activeField === 'cc' && suggestions.length > 0 && showSuggestions && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-premium max-h-48 overflow-y-auto z-50 animate-in fade-in duration-100">
                      {suggestions.map((u, idx) => (
                        <button
                          key={u.email}
                          type="button"
                          onMouseDown={() => handleSelectSuggestion(u.email, 'cc')}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors border-b border-slate-50 last:border-b-0 ${
                            idx === focusedSuggestionIndex ? 'bg-blue-50 text-blue-900' : 'hover:bg-secondary/50'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground">{u.email}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                            u.groupName === 'System' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : u.groupName === 'Family'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : u.groupName === 'Friends'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : u.groupName === 'Work'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {u.groupName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1 shrink-0">
                  <button
                    type="button"
                    title="Cc Recipients"
                    onClick={() => {
                      setActiveField('cc');
                      setShowRecipientsDirectory(!showRecipientsDirectory);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <UsersIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove Cc"
                    onClick={() => {
                      setShowCc(false);
                      setCcRecipients([]);
                      setCcInput("");
                    }}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* 3. Bcc Field */}
            {showBcc && (
              <div className="flex items-start border-b border-border py-1.5 min-h-[44px]">
                <label className="text-xs font-semibold text-slate-500 w-16 pt-2 shrink-0">Bcc:</label>
                <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0 relative pr-2">
                  {bccRecipients.map(r => (
                    <span key={r} className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {r}
                      <button
                        type="button"
                        onClick={() => handleRemoveRecipient(r, 'bcc')}
                        className="text-slate-400 hover:text-slate-600 focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder={bccRecipients.length === 0 ? "Bcc..." : ""}
                    value={bccInput}
                    onChange={e => {
                      setBccInput(e.target.value);
                      setActiveField('bcc');
                      setShowSuggestions(true);
                      setFocusedSuggestionIndex(-1);
                    }}
                    onFocus={() => {
                      setActiveField('bcc');
                      setShowSuggestions(true);
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    onKeyDown={e => handleKeyDown(e, 'bcc')}
                    className="flex-1 min-w-[120px] bg-transparent text-sm outline-none border-none py-1 focus:ring-0 text-slate-800"
                  />

                  {/* Validation Badge for Active Field */}
                  {activeField === 'bcc' && bccInput && (
                    <div className="flex items-center shrink-0 mr-1">
                      {isValidInputRecipient ? (
                        <div className="flex items-center gap-0.5 text-emerald-600">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span className="text-[9px] font-bold bg-emerald-50 px-1 py-0.5 rounded">System</span>
                        </div>
                      ) : isInputEmailFormat ? (
                        <div className="flex items-center gap-0.5 text-amber-500">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-bold bg-amber-50 px-1 py-0.5 rounded">External</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5 text-red-500">
                          <X className="w-3.5 h-3.5 stroke-[3]" />
                          <span className="text-[9px] font-bold bg-red-50 px-1 py-0.5 rounded">Invalid</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggestions List for Bcc */}
                  {activeField === 'bcc' && suggestions.length > 0 && showSuggestions && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-premium max-h-48 overflow-y-auto z-50 animate-in fade-in duration-100">
                      {suggestions.map((u, idx) => (
                        <button
                          key={u.email}
                          type="button"
                          onMouseDown={() => handleSelectSuggestion(u.email, 'bcc')}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors border-b border-slate-50 last:border-b-0 ${
                            idx === focusedSuggestionIndex ? 'bg-blue-50 text-blue-900' : 'hover:bg-secondary/50'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">{u.name}</span>
                            <span className="text-[10px] text-muted-foreground">{u.email}</span>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
                            u.groupName === 'System' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : u.groupName === 'Family'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : u.groupName === 'Friends'
                              ? 'bg-sky-50 text-sky-700 border-sky-200'
                              : u.groupName === 'Work'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {u.groupName}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 pt-1 shrink-0">
                  <button
                    type="button"
                    title="Bcc Recipients"
                    onClick={() => {
                      setActiveField('bcc');
                      setShowRecipientsDirectory(!showRecipientsDirectory);
                    }}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <UsersIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    title="Remove Bcc"
                    onClick={() => {
                      setShowBcc(false);
                      setBccRecipients([]);
                      setBccInput("");
                    }}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Recipients Directory Popup (Global for activeField) */}
            {showRecipientsDirectory && (
              <div className="absolute right-12 top-20 w-64 bg-white border border-border rounded-lg shadow-premium z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="p-2 border-b border-border bg-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Directory ({activeField.toUpperCase()})
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRecipientsDirectory(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto p-1 space-y-0.5">
                  {(() => {
                    const currentList = activeField === 'to' ? toRecipients : activeField === 'cc' ? ccRecipients : bccRecipients;
                    
                    const systemPool = users.map(u => ({ ...u, source: "System", groupName: "System" }));
                    const contactsPool = contacts.map(c => ({ ...c, source: "Contact", groupName: c.groupName }));
                    const combinedPool = [...systemPool, ...contactsPool];

                    const uniquePoolMap = new Map<string, typeof combinedPool[number]>();
                    for (const item of combinedPool) {
                      const emailLower = item.email.toLowerCase();
                      if (uniquePoolMap.has(emailLower)) {
                        if (item.source === "Contact") {
                          uniquePoolMap.set(emailLower, item);
                        }
                      } else {
                        uniquePoolMap.set(emailLower, item);
                      }
                    }

                    const deduplicatedPool = Array.from(uniquePoolMap.values());
                    const filteredPool = deduplicatedPool.filter(u => 
                      !currentList.some(r => r.toLowerCase() === u.email.toLowerCase())
                    );

                    return filteredPool.map(u => (
                      <button
                        key={u.email}
                        type="button"
                        onClick={() => {
                          handleSelectSuggestion(u.email, activeField);
                          setShowRecipientsDirectory(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-blue-50/50 rounded-md flex items-center justify-between transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-slate-800">{u.name}</span>
                          <span className="text-[10px] text-muted-foreground">{u.email}</span>
                        </div>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                          u.groupName === 'System' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : u.groupName === 'Family'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : u.groupName === 'Friends'
                            ? 'bg-sky-50 text-sky-700 border-sky-200'
                            : u.groupName === 'Work'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}>
                          {u.groupName}
                        </span>
                      </button>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Subject Input */}
            <div className="flex items-center border-b border-border pb-2">
              <label className="text-xs font-semibold text-slate-500 w-16 pt-1 shrink-0">Subject:</label>
              <input
                type="text"
                required
                placeholder="Subject of the message"
                value={composeSubject}
                onChange={e => setComposeSubject(e.target.value)}
                className="flex-1 bg-transparent text-sm outline-none border-none py-1 focus:ring-0 text-slate-800"
              />
            </div>

            {/* Category Select */}
            <div className="flex items-center border-b border-border pb-2">
              <label className="text-xs font-semibold text-muted-foreground w-20 shrink-0">Category:</label>
              <select
                value={composeCategory}
                onChange={e => setComposeCategory(e.target.value as Category)}
                className="bg-transparent text-xs outline-none border-none py-1 focus:ring-0 text-slate-700 cursor-pointer"
              >
                <option value="PRIMARY">Primary Inbox</option>
                <option value="UPDATES">Updates Folder</option>
                <option value="SOCIAL">Social Tab</option>
              </select>
            </div>

            {/* Body TextArea */}
            <textarea
              required
              rows={8}
              placeholder="Write your email here..."
              value={composeBody}
              onChange={e => setComposeBody(e.target.value)}
              className="w-full flex-1 bg-transparent text-sm outline-none border-none resize-none focus:ring-0 text-slate-800"
            />

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg text-sm transition-all shadow-md shadow-blue-600/10 flex items-center gap-1.5"
              >
                Send <Send className="w-3.5 h-3.5" />
              </button>
              
              <button
                type="button"
                onClick={() => setIsComposing(false)}
                className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all"
              >
                Cancel
              </button>
            </div>

          </form>

        </div>
      )}

    </div>
  );
}
