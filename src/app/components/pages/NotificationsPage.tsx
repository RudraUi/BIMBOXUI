import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  Search,
  Check,
  Trash2,
  Archive,
  Mail,
  Settings,
  ChevronRight,
  Calendar,
  MessageSquare,
  Video,
  AlertTriangle,
  FileText,
  X,
  Moon,
  ArrowRight,
  Shield,
  SlidersHorizontal,
  BellRing
} from "lucide-react";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  type: "meeting" | "mention" | "system" | "invoice" | "task" | "clash";
  title: string;
  sender: {
    name: string;
    avatar?: string;
    role?: string;
  };
  project?: string;
  description: string;
  time: string;
  unread: boolean;
  archived: boolean;
  details?: {
    dueDate?: string;
    meetingTime?: string;
    meetingUrl?: string;
    amount?: string;
    clashesCount?: number;
    assignedTasks?: string[];
  };
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"inbox" | "unread" | "mentions" | "invites" | "system" | "archived" | "settings">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Roster notifications data
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      type: "meeting",
      title: "MEP Clash Coordination Meeting",
      sender: { name: "Ashish Dalei", role: "MEP Lead Coordinator" },
      project: "Assotech Iconic Tower A",
      description: "You have been invited to review 24 critical clash intersections detected between mechanical ducts and structural columns in Basement 1.",
      time: "Just now",
      unread: true,
      archived: false,
      details: {
        meetingTime: "Today, 3:30 PM - 4:30 PM",
        meetingUrl: "https://meet.bimbox.ai/ysk-21h3-y673"
      }
    },
    {
      id: "notif-2",
      type: "mention",
      title: "New Mention in Design Thread",
      sender: { name: "Joy Henderson", role: "Design Coordinator" },
      project: "Assotech Iconic Tower A",
      description: "@Samuel please verify the updated WBS schedule and structural drawing links on Sheet S-03. We need to submit this for the client sign-off tomorrow.",
      time: "12 mins ago",
      unread: true,
      archived: false,
      details: {
        assignedTasks: ["Review WBS Phase 2", "Validate Sheet S-03 Load Calculations"]
      }
    },
    {
      id: "notif-3",
      type: "clash",
      title: "BIM Clash Detection Completed",
      sender: { name: "BIMBOX Automated Engine", role: "System Service" },
      project: "Utkal Pleasant Square",
      description: "Auto-scan check #104 finished. 142 total intersections analyzed. 12 critical structural vs fire-safety clashes remaining. View report below.",
      time: "2 hours ago",
      unread: true,
      archived: false,
      details: {
        clashesCount: 12
      }
    },
    {
      id: "notif-4",
      type: "invoice",
      title: "Invoice #INV-2026-089 Pending Approval",
      sender: { name: "Steelco Ltd", role: "Vendor Finance Department" },
      project: "Assotech Iconic Tower A",
      description: "Vendor Steelco Ltd has uploaded a supply invoice of $48,500.00 for reinforcement bars delivery. Due date for payment is in 10 days.",
      time: "5 hours ago",
      unread: false,
      archived: false,
      details: {
        amount: "$48,500.00",
        dueDate: "June 8, 2026"
      }
    },
    {
      id: "notif-5",
      type: "task",
      title: "New Survey Task Assigned",
      sender: { name: "Rudra Dash", role: "BIM Lead" },
      project: "Utkal Pleasant Square",
      description: "Samuel, please conduct a drone-based photographic survey of Site sector B to verify actual foundation excavation boundaries before steel casting.",
      time: "Yesterday",
      unread: false,
      archived: false,
      details: {
        dueDate: "June 2, 2026"
      }
    },
    {
      id: "notif-6",
      type: "system",
      title: "Workspace Export Ready",
      sender: { name: "Cloud Export Worker", role: "System Utility" },
      project: "Assotech Iconic Tower A",
      description: "The complete Common Data Environment (CDE) drawing sets export zip file (142MB) has been compiled and is ready for local backup download.",
      time: "Yesterday",
      unread: false,
      archived: true
    }
  ]);

  const [activeId, setActiveId] = useState<string>("notif-1");

  // Notifications Settings preferences state
  const [preferences, setPreferences] = useState({
    emailMentions: true,
    emailInvites: true,
    emailSystem: false,
    pushMentions: true,
    pushInvites: true,
    pushSystem: true,
    weeklyDigest: true,
    doNotDisturb: false,
    dndStart: "22:00",
    dndEnd: "08:00"
  });

  // Filter logic
  const filteredNotifications = notifications.filter(n => {
    // Tab Filter
    if (activeTab === "archived") {
      if (!n.archived) return false;
    } else {
      if (n.archived) return false;
      if (activeTab === "unread" && !n.unread) return false;
      if (activeTab === "mentions" && n.type !== "mention") return false;
      if (activeTab === "invites" && n.type !== "meeting") return false;
      if (activeTab === "system" && n.type !== "system" && n.type !== "clash") return false;
    }

    // Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.project?.toLowerCase().includes(q) ||
        n.sender.name.toLowerCase().includes(q)
      );
    }

    return true;
  });

  // Active notification details
  const activeNotif = notifications.find(n => n.id === activeId);

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.id));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleMarkAsReadBulk = () => {
    setNotifications(prev =>
      prev.map(n => selectedIds.includes(n.id) ? { ...n, unread: false } : n)
    );
    setSelectedIds([]);
    toast.success("Selected notifications marked as read");
  };

  const handleArchiveBulk = () => {
    setNotifications(prev =>
      prev.map(n => selectedIds.includes(n.id) ? { ...n, archived: true } : n)
    );
    setSelectedIds([]);
    toast.success("Selected notifications archived");
  };

  const handleDeleteBulk = () => {
    setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
    toast.success("Selected notifications deleted permanently");
  };

  // Single action helpers
  const handleMarkOneRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, unread: false } : n)
    );
    toast.success("Notification marked as read");
  };

  const handleArchiveOne = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, archived: true } : n)
    );
    toast.success("Notification archived");
  };

  const handleUnarchiveOne = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, archived: false } : n)
    );
    toast.success("Notification restored to inbox");
  };

  const getNotifIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "meeting":
        return <Video className="w-3.5 h-3.5 text-[#1a73e8]" />;
      case "mention":
        return <MessageSquare className="w-3.5 h-3.5 text-purple-650" />;
      case "clash":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />;
      case "invoice":
        return <FileText className="w-3.5 h-3.5 text-emerald-655" />;
      case "task":
        return <Calendar className="w-3.5 h-3.5 text-orange-600" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-white select-none">
      {/* LEFT NAVIGATION SUB-BAR */}
      <div className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between shrink-0 p-5 text-left">
        <div>
          <div className="flex items-center gap-2 pb-4 border-b border-slate-100 select-none">
            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 leading-none">Activity Feed</h2>
              <span className="text-[10px] text-slate-400 font-medium mt-1 block">BIMBOX Notifications</span>
            </div>
          </div>

          <div className="mt-5 space-y-1">
            {[
              { id: "inbox", label: "All Inbox", count: notifications.filter(n => !n.archived).length },
              { id: "unread", label: "Unread Only", count: notifications.filter(n => !n.archived && n.unread).length, highlight: true },
              { id: "mentions", label: "Mentions", count: notifications.filter(n => !n.archived && n.type === "mention").length },
              { id: "invites", label: "Meeting Invites", count: notifications.filter(n => !n.archived && n.type === "meeting").length },
              { id: "system", label: "System Alerts", count: notifications.filter(n => !n.archived && (n.type === "system" || n.type === "clash")).length },
              { id: "archived", label: "Archived Inbox", count: notifications.filter(n => n.archived).length }
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setSelectedIds([]);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
                    active
                      ? "bg-[#e8f0fe] text-[#1a73e8]"
                      : "text-slate-655 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                      active
                        ? "bg-[#1a73e8] text-white"
                        : tab.highlight
                          ? "bg-red-500 text-white"
                          : "bg-slate-100 text-slate-500"
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <button
            onClick={() => {
              setActiveTab("settings");
              setSelectedIds([]);
            }}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#1a73e8] text-white animate-none"
                : "bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] border-none"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Feed Preferences</span>
          </button>
          
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">SAMUEL RODRIGUEZ</span>
            <span className="text-[8px] bg-slate-105 text-slate-500 px-1.5 py-0.5 rounded font-semibold uppercase">PM</span>
          </div>
        </div>
      </div>

      {/* VIEWPORT CONTROLLER */}
      {activeTab === "settings" ? (
        /* TAB 2: PREFERENCES AND CONFIGURATION SCREEN */
        <div className="flex-1 bg-white p-8 overflow-y-auto text-left flex flex-col justify-start">
          <div className="max-w-3xl">
            <div className="pb-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-800">Notification Preferences</h2>
              <p className="text-xs text-slate-450 mt-1 font-normal">Configure how you receive clash updates, coordinator requests, and calendar invites across desktop and email channels.</p>
            </div>

            <div className="mt-6 space-y-6">
              {/* Category 1: Channel Preferences */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#1a73e8]" />
                  Routing Channels
                </h3>

                <div className="space-y-4">
                  {[
                    { key: "emailMentions", label: "Email Notifications for Chat Mentions", desc: "Get an email digest whenever a coordinator mentions @Samuel in design or coordination chat rooms." },
                    { key: "emailInvites", label: "Email Notifications for Meeting Invites", desc: "Receive immediate ICS calendar files for clash review invitations." },
                    { key: "pushMentions", label: "Desktop Push Notifications for Mentions", desc: "Show immediate real-time desktop banner alerts for active coordinate mentions." },
                    { key: "pushInvites", label: "Desktop Push Notifications for Meeting Starts", desc: "Play alert sound and display join prompt 5 minutes before scheduled meetings." },
                    { key: "pushSystem", label: "Desktop Push Alerts for Model Clash Completions", desc: "Notify when background automated clash scan updates are resolved." }
                  ].map((pref) => (
                    <div key={pref.key} className="flex items-start justify-between gap-4">
                      <div className="text-left">
                        <label className="text-xs font-semibold text-slate-800 block leading-tight">{pref.label}</label>
                        <span className="text-[10px] text-slate-400 font-normal block mt-0.5 leading-snug">{pref.desc}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer select-none shrink-0 mt-0.5">
                        <input
                          type="checkbox"
                          checked={(preferences as any)[pref.key]}
                          onChange={(e) => {
                            setPreferences(prev => ({ ...prev, [pref.key]: e.target.checked }));
                            toast.success("Preferences updated successfully");
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-205 peer-focus:outline-hidden peer-focus:ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1a73e8]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2: Do Not Disturb */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-[#1a73e8]" />
                    Do Not Disturb Mode (Quiet Hours)
                  </h3>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={preferences.doNotDisturb}
                      onChange={(e) => {
                        setPreferences(prev => ({ ...prev, doNotDisturb: e.target.checked }));
                        toast.info(e.target.checked ? "Quiet hours mode activated" : "Quiet hours mode deactivated");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-205 peer-focus:outline-hidden peer-focus:ring-0 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1a73e8]"></div>
                  </label>
                </div>

                <p className="text-[10px] text-slate-400 font-normal mb-4 leading-relaxed">
                  Suppress all audio pings and real-time screen banners during selected hours. Emergency critical clash reports will bypass this threshold.
                </p>

                <div className="flex items-center gap-3">
                  <div>
                    <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">Start quiet hours</label>
                    <input
                      type="time"
                      value={preferences.dndStart}
                      disabled={!preferences.doNotDisturb}
                      onChange={(e) => setPreferences(prev => ({ ...prev, dndStart: e.target.value }))}
                      className="mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider block">End quiet hours</label>
                    <input
                      type="time"
                      value={preferences.dndEnd}
                      disabled={!preferences.doNotDisturb}
                      onChange={(e) => setPreferences(prev => ({ ...prev, dndEnd: e.target.value }))}
                      className="mt-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              {/* Category 3: System integrations */}
              <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#1a73e8]" />
                  Security & Audit Forwarding
                </h3>
                <p className="text-[10px] text-slate-400 font-normal mb-4">Integrate notifications forwarding webhooks to external coordination platforms.</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => alert("Slack Integration Webhook wizard opened.")}
                    className="h-7 px-3 bg-white border border-slate-200 hover:bg-slate-55 text-slate-655 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    Configure Slack Webhook
                  </button>
                  <button
                    onClick={() => alert("Microsoft Teams Integration webhook wizard opened.")}
                    className="h-7.5 px-3 bg-white border border-slate-200 hover:bg-slate-55 text-slate-655 rounded-lg text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    Configure MS Teams Webhook
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* INBOX / SPLIT-VIEW MODULE LAYOUT */
        <div className="flex-1 flex overflow-hidden">
          {/* MIDDLE COLUMN: NOTIFICATIONS LIST AREA */}
          <div className="w-[360px] bg-white border-r border-slate-100 flex flex-col min-w-0 shrink-0">
            {/* Search and Action Toolbar */}
            <div className="p-4 border-b border-slate-100 shrink-0 space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.75 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium placeholder-slate-400 text-slate-800 focus:bg-white focus:outline-hidden focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8]"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-650 cursor-pointer text-left border-none bg-transparent"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Bulk Toolbar operations */}
              <div className="flex items-center justify-between text-[11px] select-none pt-1">
                <label className="flex items-center gap-1.5 font-semibold text-slate-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filteredNotifications.length > 0 && selectedIds.length === filteredNotifications.length}
                    onChange={handleSelectAll}
                    className="cursor-pointer"
                  />
                  <span>Select Page ({filteredNotifications.length})</span>
                </label>

                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2 animate-in fade-in duration-100">
                    <button
                      onClick={handleMarkAsReadBulk}
                      className="text-[#1a73e8] hover:underline font-semibold flex items-center gap-0.5 cursor-pointer border-none bg-transparent"
                      title="Mark Selected as Read"
                    >
                      <Check className="w-3 h-3" />
                      <span>Read</span>
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      onClick={handleArchiveBulk}
                      className="text-slate-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer border-none bg-transparent"
                      title="Archive Selected"
                    >
                      <Archive className="w-3 h-3" />
                      <span>Archive</span>
                    </button>
                    <span className="text-slate-200">|</span>
                    <button
                      onClick={handleDeleteBulk}
                      className="text-rose-600 hover:underline font-semibold flex items-center gap-0.5 cursor-pointer border-none bg-transparent"
                      title="Delete Selected"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* List Viewport */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredNotifications.map((notif) => {
                const isSelected = selectedIds.includes(notif.id);
                const isActiveItem = activeId === notif.id;

                let iconBg = "bg-slate-55 text-slate-500";
                if (notif.type === "meeting") iconBg = "bg-[#e8f0fe] text-[#1a73e8]";
                else if (notif.type === "mention") iconBg = "bg-purple-50 text-purple-650";
                else if (notif.type === "clash") iconBg = "bg-amber-50/70 text-amber-600";
                else if (notif.type === "invoice") iconBg = "bg-emerald-55 text-emerald-655";
                else if (notif.type === "task") iconBg = "bg-orange-50 text-orange-600";

                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      setActiveId(notif.id);
                      if (notif.unread) {
                        setNotifications(prev =>
                          prev.map(n => n.id === notif.id ? { ...n, unread: false } : n)
                        );
                      }
                    }}
                    className={`p-3.5 text-left flex items-start gap-2.5 cursor-pointer transition-all duration-150 relative ${
                      isActiveItem
                        ? "bg-[#e8f0fe]/30 border-l-2 border-[#1a73e8]"
                        : "hover:bg-slate-55/55 border-l-2 border-transparent"
                    }`}
                  >
                    <div 
                      className="mt-0.5 shrink-0" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectOne(notif.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}} 
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-6 h-6 rounded-md ${iconBg} flex items-center justify-center shrink-0`}>
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[9px] font-semibold text-slate-400 tracking-wider uppercase truncate">{notif.project || "BIMBOX"}</span>
                            <span className="text-[9px] text-slate-400 font-normal shrink-0">{notif.time}</span>
                          </div>
                          <h4 className={`text-xs truncate mt-0.5 ${notif.unread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                            {notif.title}
                          </h4>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal mt-1.5 line-clamp-2 leading-relaxed">
                        {notif.description}
                      </p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[9px] font-semibold text-slate-400">{notif.sender.name}</span>
                        {notif.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] shrink-0" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredNotifications.length === 0 && (
                <div className="py-20 text-center select-none animate-in fade-in duration-100">
                  <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-4 h-4" />
                  </div>
                  <h5 className="text-[11px] font-semibold text-slate-700">No Notifications</h5>
                  <p className="text-[9px] text-slate-400 font-normal mt-1 px-8">There are no notifications matching your active filters.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED PREVIEW & ACTION PANEL */}
          <div className="flex-1 bg-white p-6 overflow-y-auto text-left flex flex-col justify-between">
            {activeNotif ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Preview Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0 gap-3">
                    <div className="text-left">
                      <span className="text-[9px] font-semibold text-[#1a73e8] bg-[#e8f0fe] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {activeNotif.type} notification
                      </span>
                      <h2 className="text-lg font-semibold text-slate-900 mt-2">{activeNotif.title}</h2>
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="w-6 h-6 rounded-full bg-slate-105 text-slate-600 flex items-center justify-center text-[10px] font-semibold">
                          {activeNotif.sender.name[0]}
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{activeNotif.sender.name}</span>
                        <span className="text-xs text-slate-400 font-normal">({activeNotif.sender.role})</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[10px] text-slate-400 font-normal">{activeNotif.time}</span>
                      </div>
                    </div>

                    <div className="flex gap-1.5 shrink-0">
                      {activeNotif.archived ? (
                        <button
                          onClick={() => handleUnarchiveOne(activeNotif.id)}
                          className="h-7.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-none"
                          title="Restore to Inbox"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Unarchive</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchiveOne(activeNotif.id)}
                          className="h-7.5 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-655 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-none"
                          title="Archive Alert"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Archive</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setNotifications(prev => prev.filter(n => n.id !== activeNotif.id));
                          toast.success("Notification deleted permanently");
                        }}
                        className="h-7.5 w-7.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-lg flex items-center justify-center cursor-pointer transition-all shadow-none"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notification Context Drawers */}
                  <div className="mt-5 space-y-4">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Project Scope</span>
                      <span className="text-xs font-semibold text-slate-800 block mt-0.5">{activeNotif.project || "BIMBOX Workspace Engine"}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Description Details</span>
                      <p className="text-xs text-slate-600 font-normal mt-1 leading-relaxed bg-slate-50 border border-slate-100 p-4 rounded-xl">
                        {activeNotif.description}
                      </p>
                    </div>

                    {/* DYNAMIC CARD VIEWPORTS BASED ON NOTIFICATION TYPE */}
                    
                    {/* CASE 1: MEETING INVITATION DETAILS */}
                    {activeNotif.type === "meeting" && activeNotif.details && (
                      <div className="bg-[#e8f0fe]/30 border border-[#d2e3fc] rounded-xl p-4 space-y-3 animate-in fade-in duration-100">
                        <span className="text-[10px] font-semibold text-[#1a73e8] uppercase tracking-wider block">Review Sync Calendar Schedule</span>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#1a73e8] shrink-0" />
                          <span className="text-xs font-semibold text-slate-800">{activeNotif.details.meetingTime}</span>
                        </div>
                        <div className="flex gap-2.5 pt-1">
                          <button
                            onClick={() => {
                              alert("MEP Clash Review meeting accepted! Added to calendar.");
                              handleMarkOneRead(activeNotif.id);
                            }}
                            className="h-7.5 px-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-medium transition-all cursor-pointer"
                          >
                            Decline Invitation
                          </button>
                          <button
                            onClick={() => {
                              handleMarkOneRead(activeNotif.id);
                              navigate("/meet");
                            }}
                            className="h-7.5 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 border-none shadow-none"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Sync Room</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CASE 2: CLASH CHECKING METRICS */}
                    {activeNotif.type === "clash" && activeNotif.details && (
                      <div className="bg-amber-50/20 border border-amber-100 rounded-xl p-4 space-y-3 animate-in fade-in duration-100">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Automated Interference Check Metrics</span>
                          <span className="text-[9.5px] font-semibold text-amber-605 bg-amber-50 px-1.5 py-0.25 rounded">100% CHECKED</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3.5 text-left">
                          <div className="bg-white border border-slate-100 rounded-lg p-2.5">
                            <span className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider block">Structural Clashes</span>
                            <span className="text-base font-semibold text-slate-800 block mt-0.5">{activeNotif.details.clashesCount} Critical</span>
                          </div>
                          <div className="bg-white border border-slate-100 rounded-lg p-2.5">
                            <span className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider block">Scan Duration</span>
                            <span className="text-base font-semibold text-slate-805 block mt-0.5">38 Seconds</span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate("/pre-construction/workspace?tab=rfi-issues")}
                          className="w-full py-1.75 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 border-none shadow-none"
                        >
                          <span>Open CDE Clash Manager</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* CASE 3: INVOICE BILLING STATUS */}
                    {activeNotif.type === "invoice" && activeNotif.details && (
                      <div className="bg-emerald-50/20 border border-emerald-100 rounded-xl p-4 space-y-3 animate-in fade-in duration-100">
                        <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block">Vendor Invoice Financial Summary</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white border border-slate-100 rounded-lg p-2.5 text-left">
                            <span className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider block">Total Payable</span>
                            <span className="text-base font-semibold text-emerald-650 block mt-0.5">{activeNotif.details.amount}</span>
                          </div>
                          <div className="bg-white border border-slate-100 rounded-lg p-2.5 text-left">
                            <span className="text-[8.5px] font-semibold text-slate-400 uppercase tracking-wider block">Payment Due</span>
                            <span className="text-xs font-semibold text-slate-700 block mt-1">{activeNotif.details.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              alert("Invoice rejected and sent back to supplier Steelco Ltd.");
                              handleMarkOneRead(activeNotif.id);
                            }}
                            className="flex-1 py-1.75 border border-slate-200 bg-white hover:bg-slate-50 text-slate-655 rounded-lg text-xs font-medium transition-all cursor-pointer text-center"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              alert("Invoice #INV-2026-089 approved for scheduling.");
                              handleMarkOneRead(activeNotif.id);
                            }}
                            className="flex-1 py-1.75 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-all cursor-pointer text-center border-none shadow-none"
                          >
                            Approve Pay-schedule
                          </button>
                        </div>
                      </div>
                    )}

                    {/* CASE 4: CHAT MENTION / COMMENT */}
                    {activeNotif.type === "mention" && activeNotif.details && (
                      <div className="bg-purple-50/20 border border-purple-100 rounded-xl p-4 space-y-3 animate-in fade-in duration-100">
                        <span className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider block">Assigned Draw Verification Checklist</span>
                        <div className="space-y-1.5">
                          {activeNotif.details.assignedTasks?.map((task, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-2 text-xs font-medium text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={() => navigate("/chat")}
                          className="w-full py-1.75 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1 border-none shadow-none"
                        >
                          <span>Open Design Chat Thread</span>
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom mark as read helper */}
                {activeNotif.unread && (
                  <div className="pt-4 border-t border-slate-100 mt-6 flex justify-end shrink-0">
                    <button
                      onClick={() => handleMarkOneRead(activeNotif.id)}
                      className="h-7.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors border-none"
                    >
                      Mark as read
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center select-none">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-semibold text-slate-700">No Notification Selected</h5>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] font-normal">Select a notification item in the left column list to review detailed specifications and actions.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
