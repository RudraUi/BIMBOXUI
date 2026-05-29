import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingCart,
  Landmark,
  Sparkles,
  Home,
  Construction as ConstructionIcon,
  Wrench,
  Box,
  MapPin,
  Brain,
  Database,
  Package,
  Users,
  FileText,
  Truck,
  ArrowLeft,
  DollarSign,
  UserCheck,
  Upload,
  Calendar,
  CheckCircle,
  Share2,
  AlertCircle,
  Edit,
  Activity,
  Plus,
  Monitor,
  Video,
  MessageSquare,
  Network,
  HardHat,
  Boxes,
  Settings,
  GitBranch,
  Bell,
  ChevronRight,
  LogOut,
  ShoppingBag,
  CreditCard,
  HelpCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSidebar } from "../context/SidebarContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { ProfileModal } from "./ProfileModal";
import { toast } from "sonner";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode } = useSidebar();
  const [modalType, setModalType] = useState<"video-call" | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState("profile");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "meeting",
      title: "MEP Clash Coordination",
      description: "Ashish Dalei invited you to join the room.",
      time: "Just now",
      unread: true,
      action: { label: "Join Room", path: "/meet" }
    },
    {
      id: 2,
      type: "chat",
      title: "Joy Henderson",
      description: "Mentioned you: 'Check the WBS timeline...'",
      time: "10m ago",
      unread: true,
      action: { label: "Open Chat", path: "/chat" }
    },
    {
      id: 3,
      type: "survey",
      title: "Drone Scan Upload",
      description: "Assotech Site 02 data processing completed.",
      time: "2h ago",
      unread: false,
      action: { label: "View Survey", path: "/site-survey" }
    }
  ]);

  useEffect(() => {
    const path = location.pathname;
    if (
      path.startsWith("/admin/material-suppliers") ||
      path.startsWith("/manager/material-receiving") ||
      path.startsWith("/vendor-portal/material-supplier")
    ) {
      setMode("hub-vendor");
    } else if (path.startsWith("/pre-construction/workspace")) {
      setMode("pre-construction");
    }
  }, [location.pathname, setMode]);


  const mainMenuItems = [
    { icon: Network, label: "Hub", shortLabel: "HUB", sublabel: "Workspace Modules", path: "/dashboard", sidebarMode: "main" },
    { icon: FolderKanban, label: "All Projects", shortLabel: "PROJECTS", sublabel: "Manage all workspaces", path: "/projects", sidebarMode: "main" },
    { icon: Box, label: "Pre-Construction", shortLabel: "PRE-CON", sublabel: "Fast BIM Automation", path: "/pre-construction/workspace?tab=home", sidebarMode: "pre-construction" },
    { icon: HardHat, label: "Construction", shortLabel: "CONST", sublabel: "Construction Management", path: "/construction", sidebarMode: "main" },
    { icon: Wrench, label: "Facility Management", shortLabel: "FACILITY", sublabel: "Project Management", path: "/facility-management", sidebarMode: "main" },
    { icon: MapPin, label: "Site Survey", shortLabel: "SURVEY", sublabel: "Site Analysis", path: "/site-survey", sidebarMode: "main" },
    { icon: Boxes, label: "Digital Twin", shortLabel: "TWIN", sublabel: "BIM Modeling", path: "/digital-twin", sidebarMode: "main" },
    { icon: Sparkles, label: "Viewer Main", shortLabel: "VIEWER", sublabel: "BIM Map & Drawing Viewer", path: "/viewer-main", sidebarMode: "main" },
  ];

  const moduleMenuItems: Record<string, Array<{ icon: any; label: string; sublabel: string; path?: string; module?: string; section?: string }>> = {
    "hub-data": [
      { icon: Database, label: "Data Home", sublabel: "Data launcher", module: "data", section: "home" },
      { icon: FolderKanban, label: "Drawings", sublabel: "Architecture & MEP", module: "data", section: "drawings" },
      { icon: Box, label: "Model Data", sublabel: "BIM & IFC", module: "data", section: "model-data" },
      { icon: MapPin, label: "Survey Data", sublabel: "Site capture", module: "data", section: "survey-data" },
      { icon: FileText, label: "Doc Control", sublabel: "BOQ, PO, invoice", module: "data", section: "document-control" },
      { icon: AlertCircle, label: "RFI Issue", sublabel: "Queries & response", module: "data", section: "rfi-issues" },
      { icon: Edit, label: "Change Order", sublabel: "Revisions & variations", module: "data", section: "change-orders" },
      { icon: Calendar, label: "Schedule", sublabel: "Plans & lookahead", module: "data", section: "schedules" },
      { icon: Activity, label: "Planning", sublabel: "WBS & Gantt", module: "data", section: "planning" },
      { icon: FolderKanban, label: "Project Docs", sublabel: "Linked project files", module: "data", section: "project-docs" },
      { icon: Share2, label: "Shared", sublabel: "Team access", module: "data", section: "shared" },
      { icon: Upload, label: "Uploads", sublabel: "Recent uploads", module: "data", section: "uploads" },
    ],
    "hub-catalog": [
      { icon: Database, label: "Catalog Home", sublabel: "Browse libraries", module: "catalog", section: "home" },
      { icon: Package, label: "Material Catalog", sublabel: "Approved materials", module: "catalog", section: "materials" },
      { icon: Truck, label: "Equipment Catalog", sublabel: "Plant & machinery", module: "catalog", section: "equipment" },
      { icon: Users, label: "Vendor Catalog", sublabel: "Mapped suppliers", module: "catalog", section: "vendors" },
      { icon: FileText, label: "Standards", sublabel: "Specs & references", module: "catalog", section: "standards" },
    ],
    "hub-procurement": [
      { icon: ShoppingCart, label: "Procurement Home", sublabel: "Stats & overview", module: "procurement", section: "home" },
      { icon: Package, label: "Material Procurement", sublabel: "PR to GRN", module: "procurement", section: "material" },
      { icon: Users, label: "Resource Procurement", sublabel: "Teams & manpower", module: "procurement", section: "resource" },
      { icon: Truck, label: "Equipment Procurement", sublabel: "Plant & machinery", module: "procurement", section: "equipment" },
    ],
    "hub-vendor": [
      { icon: Package, label: "Material Suppliers", sublabel: "Registry & RFQs", path: "/admin/material-suppliers", module: "vendor", section: "supplier" },
      { icon: Truck, label: "Site Receiving", sublabel: "Gate Entry & QC Checks", path: "/manager/material-receiving", module: "vendor", section: "receiving" },
      { icon: UserCheck, label: "Vendor Portal", sublabel: "Simulate Bid & Dispatch", path: "/vendor-portal/material-supplier", module: "vendor", section: "portal" },
    ],
    "hub-resources": [
      { icon: LayoutDashboard, label: "Organization", sublabel: "Hierarchy & reporting", module: "resources", section: "organization" },
      { icon: Users, label: "Workforce", sublabel: "People and skills", module: "resources", section: "workforce" },
      { icon: Box, label: "Teams", sublabel: "Crews and units", module: "resources", section: "teams" },
      { icon: Calendar, label: "Attendance", sublabel: "Check-in and shifts", module: "resources", section: "attendance" },
      { icon: UserCheck, label: "Access Control", sublabel: "Roles and approvals", module: "resources", section: "access-control" },
      { icon: Share2, label: "Allocation", sublabel: "Deployment planning", module: "resources", section: "allocation" },
      { icon: DollarSign, label: "Payroll", sublabel: "Wages and payouts", module: "resources", section: "payroll" },
      { icon: Activity, label: "Performance", sublabel: "Scorecards and delays", module: "resources", section: "performance" },
      { icon: FileText, label: "Compliance", sublabel: "Safety and documents", module: "resources", section: "compliance" },
    ],
    "hub-finance": [
      { icon: DollarSign, label: "Budgeting", sublabel: "Planned vs actual", module: "finance", section: "budgeting" },
      { icon: FileText, label: "Invoice", sublabel: "Bills & approvals", module: "finance", section: "invoice" },
      { icon: Landmark, label: "Payments", sublabel: "Released & pending", module: "finance", section: "payments" },
      { icon: Calendar, label: "Forecast", sublabel: "Cash flow", module: "finance", section: "forecast" },
    ],
    "pre-construction": [
      { icon: Home, label: "Home", sublabel: "Federated project viewer", path: "/pre-construction/workspace?tab=home", module: "pre-construction", section: "home" },
      { icon: FolderKanban, label: "CDE", sublabel: "Common data environment", path: "/pre-construction/workspace?tab=cde", module: "pre-construction", section: "cde" },
      { icon: GitBranch, label: "WBS", sublabel: "Work breakdown structure", path: "/pre-construction/workspace?tab=wbs", module: "pre-construction", section: "wbs" },
      { icon: CheckCircle, label: "Task", sublabel: "Task workspace", path: "/pre-construction/workspace?tab=tasks", module: "pre-construction", section: "tasks" },
      { icon: FileText, label: "Docs", sublabel: "Document workspace", path: "/pre-construction/workspace?tab=docs", module: "pre-construction", section: "docs" },
      { icon: AlertCircle, label: "RFI and Issue", sublabel: "Queries and issue tracking", path: "/pre-construction/workspace?tab=rfi-issues", module: "pre-construction", section: "rfi-issues" },
    ],
  };

  const isActive = (path: string) => {
    const pathOnly = path.split("?")[0];
    if (pathOnly === "/dashboard" && location.pathname === "/") {
      return true;
    }
    return location.pathname === pathOnly;
  };

  const handleMainMenuClick = (item: typeof mainMenuItems[0]) => {
    setMode(item.sidebarMode);
    navigate(item.path);
  };

  const handleModuleMenuClick = (module: string, section: string) => {
    navigate(`/dashboard?module=${module}&section=${section}`);
  };

  const handleBackToMain = () => {
    setMode("main");
    navigate("/dashboard");
  };

  const activeParams = new URLSearchParams(location.search);
  const moduleItems = mode === "main" ? [] : moduleMenuItems[mode] ?? [];
  const renderTooltip = (label: string, sublabel?: string) => (
    <TooltipContent
      side="right"
      sideOffset={14}
      className="z-[100] rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-white shadow-xl shadow-slate-950/20"
    >
      <div className="text-xs font-medium leading-none">{label}</div>
      {sublabel && <div className="mt-1 text-[10px] leading-none text-slate-300">{sublabel}</div>}
    </TooltipContent>
  );

  return (
    <div className="flex h-screen bg-white relative">
      {/* Sidebar */}
      {/* Sidebar */}
      <aside className="w-14 bg-[#eef2f6] border-r border-slate-200/50 flex flex-col items-center py-4 gap-3.5 relative overflow-y-auto select-none shrink-0">
        {/* Logo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/" onClick={() => setMode("main")} aria-label="BIMBOX" className="mb-1 shrink-0">
              <img src="/BIMBOXLOGO.png" alt="BIMBOX Logo" className="w-9 h-9 object-contain" />
            </Link>
          </TooltipTrigger>
          {renderTooltip("BIMBOX")}
        </Tooltip>

        <div className="flex min-h-0 w-full flex-1 flex-col gap-2.5 items-center">
          {/* Back Button (when in a Hub module) */}
          {mode !== "main" && (
            <div className="pb-1.5 w-full flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleBackToMain}
                    aria-label="Back to Hub"
                    className="w-9 h-9 rounded-xl bg-white/40 hover:bg-white hover:shadow-xs text-slate-500 flex items-center justify-center transition-all duration-200"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                {renderTooltip("Back to Hub")}
              </Tooltip>
            </div>
          )}

          {/* Dynamic Menu Items */}
          <div className="flex flex-col gap-2 w-full items-center">
            {mode === "main" ? (
              // Main Menu
              <>
                {/* Isolated Hub Icon */}
                {(() => {
                  const hubItem = mainMenuItems[0];
                  const Icon = hubItem.icon;
                  const active = isActive(hubItem.path);
                  return (
                    <div key={hubItem.path} className="flex flex-col items-center w-full relative">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleMainMenuClick(hubItem)}
                            aria-label={hubItem.label}
                            className={`w-9 h-9 flex items-center justify-center transition-all duration-200 ${
                              active
                                ? "bg-white shadow-xs rounded-xl text-blue-600 border border-white font-semibold"
                                : "bg-white/40 hover:bg-white/80 hover:shadow-xs rounded-xl text-slate-400 hover:text-slate-650"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        {renderTooltip(hubItem.label, hubItem.sublabel)}
                      </Tooltip>
                      {active && hubItem.shortLabel && (
                        <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1 text-center leading-none">
                          {hubItem.shortLabel}
                        </div>
                      )}
                      
                      {/* Premium Inset Divider Line */}
                      <div className="w-6 h-[1px] bg-slate-300/60 mt-3 mb-1" />
                    </div>
                  );
                })()}

                {/* Remaining menu items */}
                {mainMenuItems.slice(1).map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <div key={item.path} className="flex flex-col items-center w-full">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => handleMainMenuClick(item)}
                            aria-label={item.label}
                            className={`w-9 h-9 flex items-center justify-center transition-all duration-200 ${
                              active
                                ? "bg-white shadow-xs rounded-xl text-blue-600 border border-white"
                                : "bg-white/40 hover:bg-white/80 hover:shadow-xs rounded-xl text-slate-400 hover:text-slate-650"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        </TooltipTrigger>
                        {renderTooltip(item.label, item.sublabel)}
                      </Tooltip>
                      {active && item.shortLabel && (
                        <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider mt-1 text-center leading-none">
                          {item.shortLabel}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            ) : (
              // Hub Module Sub-Menu
              <>
                {moduleItems.map((item) => {
                  const Icon = item.icon;
                  const isActiveSection =
                    item.path
                      ? `${location.pathname}${location.search}` === item.path || location.pathname === item.path.split("?")[0] && activeParams.get("tab") === item.section
                      : (activeParams.get("module") === item.module &&
                         activeParams.get("section") === item.section);
                  return (
                    <Tooltip key={item.section}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (item.path) {
                              navigate(item.path);
                            } else if (item.module && item.section) {
                              handleModuleMenuClick(item.module, item.section);
                            }
                          }}
                          aria-label={item.label}
                          className={`w-9 h-9 flex items-center justify-center transition-all duration-200 ${
                            isActiveSection
                              ? "bg-white shadow-xs rounded-xl text-blue-600 border border-white"
                              : "bg-white/40 hover:bg-white/80 hover:shadow-xs rounded-xl text-slate-400 hover:text-slate-650"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      </TooltipTrigger>
                      {renderTooltip(item.label, item.sublabel)}
                    </Tooltip>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2 items-center w-full shrink-0">
          {/* Video Call */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  setMode("main");
                  navigate("/meet");
                }}
                aria-label="Video Call"
                className={`w-9 h-9 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  location.pathname === "/meet"
                    ? "bg-white shadow-xs rounded-xl text-blue-600 border border-white"
                    : "bg-white/40 hover:bg-white hover:shadow-xs rounded-xl text-slate-400 hover:text-slate-650"
                }`}
              >
                <Video className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            {renderTooltip("Video Call", "Start instant meeting")}
          </Tooltip>

          {/* Chat */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  setMode("main");
                  navigate("/chat");
                }}
                aria-label="Chat"
                className={`w-9 h-9 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  location.pathname === "/chat"
                    ? "bg-white shadow-xs rounded-xl text-blue-600 border border-white"
                    : "bg-white/40 hover:bg-white hover:shadow-xs rounded-xl text-slate-400 hover:text-slate-650"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            {renderTooltip("Chat", "Team conversations")}
          </Tooltip>

          {/* Notifications */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="Notifications"
                className={`w-9 h-9 flex items-center justify-center transition-all duration-200 cursor-pointer relative ${
                  notificationsOpen
                    ? "bg-white shadow-xs rounded-xl text-blue-600 border border-white"
                    : "bg-white/40 hover:bg-white hover:shadow-xs rounded-xl text-slate-400 hover:text-slate-650"
                }`}
              >
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-2 ring-slate-100" />
                )}
              </button>
            </TooltipTrigger>
            {renderTooltip("Notifications", `${notifications.filter(n => n.unread).length} unread alerts`)}
          </Tooltip>

          {/* User Profile Avatar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                aria-label="Samuel Rodriguez"
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-xs cursor-pointer flex items-center justify-center hover:scale-105 transition-transform duration-200 mt-0.5"
              >
                <img src="/avatar.jpg" alt="Samuel Rodriguez" className="w-full h-full object-cover" />
              </button>
            </TooltipTrigger>
            {renderTooltip("Samuel Rodriguez", "Project Manager")}
          </Tooltip>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 min-w-0 min-h-0 ${location.pathname === "/chat" ? "overflow-hidden" : "overflow-auto"}`}>
        <Outlet />
      </main>

      {/* Notifications Popover */}
      {notificationsOpen && (
        <>
          <div 
            className="fixed inset-0 z-[990]" 
            onClick={() => setNotificationsOpen(false)}
          />
          <div className="absolute left-[64px] bottom-14 z-[999] w-88 bg-white border border-slate-200/80 shadow-[0_20px_48px_-10px_rgba(15,23,42,0.18)] rounded-2xl p-4 animate-in slide-in-from-left-2 duration-200 flex flex-col max-h-[480px] text-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-800 leading-none">Notifications</h3>
                  {notifications.some(n => n.unread) && (
                    <p className="text-[9px] text-blue-650 font-semibold mt-1">
                      {notifications.filter(n => n.unread).length} unread alerts
                    </p>
                  )}
                </div>
              </div>
              {notifications.some(n => n.unread) && (
                <button 
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                  }}
                  className="text-[10px] text-blue-600 hover:text-blue-700 font-semibold cursor-pointer transition-colors px-2 py-1 hover:bg-blue-50/50 rounded-lg"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-0.5 scrollbar-thin">
              {notifications.map((notif) => {
                const isMeeting = notif.type === "meeting";
                const isChat = notif.type === "chat";
                const isSurvey = notif.type === "survey";

                let TypeIcon = AlertCircle;
                let bgIconClass = "bg-slate-50 text-slate-500";
                let accentBorder = "border-l-[3px] border-l-slate-400";
                let actionBtnClass = "bg-slate-100 hover:bg-slate-200 text-slate-700";

                if (isMeeting) {
                  TypeIcon = Video;
                  bgIconClass = "bg-blue-50 text-blue-600";
                  accentBorder = "border-l-[3px] border-l-blue-500";
                  actionBtnClass = "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/10";
                } else if (isChat) {
                  TypeIcon = MessageSquare;
                  bgIconClass = "bg-purple-50 text-purple-650";
                  accentBorder = "border-l-[3px] border-l-purple-500";
                  actionBtnClass = "bg-purple-650 hover:bg-purple-755 text-white shadow-sm shadow-purple-500/10";
                } else if (isSurvey) {
                  TypeIcon = HardHat;
                  bgIconClass = "bg-emerald-50 text-emerald-650";
                  accentBorder = "border-l-[3px] border-l-emerald-500";
                  actionBtnClass = "bg-emerald-650 hover:bg-emerald-755 text-white shadow-sm shadow-emerald-500/10";
                }

                return (
                  <div 
                    key={notif.id} 
                    className={`flex gap-3 p-3 rounded-xl border transition-all text-left relative ${accentBorder} ${
                      notif.unread 
                        ? "bg-slate-50/50 border-slate-200/80 hover:bg-slate-50" 
                        : "bg-white border-slate-100/90 hover:bg-slate-50/30"
                    } hover:shadow-xs group`}
                  >
                    {/* Left Icon Badge */}
                    <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center shrink-0 ${bgIconClass} transition-transform group-hover:scale-105`}>
                      <TypeIcon className="w-4 h-4" />
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline gap-1.5">
                        <span className="text-[11px] font-semibold text-slate-800 truncate">{notif.title}</span>
                        <span className="text-[9px] text-slate-400 font-medium shrink-0">{notif.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-normal">{notif.description}</p>
                      
                      {notif.action && (
                        <div className="mt-2.5 flex justify-between items-center">
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            {notif.type}
                          </span>
                          <button
                            onClick={() => {
                              setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                              setNotificationsOpen(false);
                              if (notif.action.path) {
                                navigate(notif.action.path);
                              }
                            }}
                            className={`px-3 py-1 text-[10px] font-semibold rounded-full cursor-pointer transition-all active:scale-[0.97] ${actionBtnClass}`}
                          >
                            {notif.action.label}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Unread dot overlay */}
                    {notif.unread && (
                      <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-blue-600" />
                    )}
                  </div>
                );
              })}
              {notifications.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-[10px] font-semibold">
                  No new notifications
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 shrink-0 mt-2.5 flex justify-center">
              <button
                onClick={() => {
                  setNotificationsOpen(false);
                  navigate("/notifications");
                }}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-800 border border-slate-200/60 rounded-xl text-[11px] font-semibold text-center cursor-pointer transition-all flex items-center justify-center gap-1 hover:shadow-2xs active:scale-[0.99]"
              >
                <span>View all notifications</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Dynamic Placeholder Modal for Video Call */}
      <Dialog open={modalType !== null} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Video Call Workspace
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-semibold mt-1">
              Connect instantly with onsite superintendents and BIM coordinators.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Video className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-650 font-bold">This feature is initializing in sandbox mode.</p>
            <p className="text-[11px] text-slate-450 mt-1">Direct integration with WebRTC is active in staging.</p>
          </div>
          <DialogFooter className="sm:justify-end gap-2 flex flex-row">
            <button
              onClick={() => setModalType(null)}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer flex-1"
            >
              Close
            </button>
            <button
              onClick={() => setModalType(null)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex-1"
            >
              Okay
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Popover Menu */}
      {profileOpen && (
        <>
          <div 
            className="fixed inset-0 z-[990]" 
            onClick={() => setProfileOpen(false)}
          />
          <div className="absolute left-[60px] bottom-4 z-[999] w-64 bg-white border border-slate-200/80 shadow-[0_15px_40px_rgba(15,23,42,0.12)] rounded-3xl overflow-hidden animate-in slide-in-from-left-2 duration-150 flex flex-col text-left">
            {/* Header */}
            <div 
              onClick={() => {
                setProfileOpen(false);
                setProfileModalTab("profile");
                setProfileModalOpen(true);
              }}
              className="p-4 bg-slate-50 border-b border-slate-105 flex items-center gap-3 cursor-pointer hover:bg-slate-100/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-md shadow-blue-500/10">
                RN
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-black text-slate-800 truncate">Rudra Narayan Dash</h4>
                <span className="text-[10px] text-slate-450 font-bold block truncate">rudra@bimbox.ai</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 space-y-0.5">
              {[
                { id: "notifications", label: "Notifications", icon: Bell, badge: 2 },
                { id: "orders", label: "My Orders", icon: ShoppingBag },
                { id: "payments", label: "Payment History", icon: CreditCard },
                { id: "preferences", label: "Settings", icon: Settings },
                { id: "help", label: "Help", icon: HelpCircle }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setProfileOpen(false);
                      setProfileModalTab(item.id);
                      setProfileModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.25 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-705 hover:text-slate-900 transition-colors cursor-pointer group border border-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-slate-655 transition-colors" />
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.badge && (
                        <span className="px-1.5 py-0.25 rounded-full bg-blue-600 text-white text-[9px] font-black leading-none">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-450 transition-colors" />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-slate-100" />

            {/* Logout */}
            <div className="p-2">
              <button
                onClick={() => {
                  setProfileOpen(false);
                  toast.success("Logged out successfully");
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.25 hover:bg-red-50 hover:text-red-650 rounded-xl text-xs font-bold text-slate-500 transition-colors cursor-pointer border border-transparent"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Settings & Details Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        initialTab={profileModalTab}
        onLogout={() => toast.success("Logged out successfully")}
      />
    </div>
  );
}
