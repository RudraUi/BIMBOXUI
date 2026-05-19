import { Outlet, Link, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  FolderKanban,
  ShoppingCart,
  Landmark,
  Sparkles,
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
  Monitor
} from "lucide-react";
import { useState } from "react";
import { useSidebar } from "../context/SidebarContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, setMode } = useSidebar();

  const [customVendorSections, setCustomVendorSections] = useState<{label: string, section: string}[]>([]);
  const [isAddVendorSectionOpen, setIsAddVendorSectionOpen] = useState(false);
  const [newVendorSectionName, setNewVendorSectionName] = useState("");

  const handleAddVendorSection = () => {
    if (newVendorSectionName.trim()) {
      const sectionId = newVendorSectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      setCustomVendorSections([...customVendorSections, { label: newVendorSectionName, section: sectionId }]);
      setIsAddVendorSectionOpen(false);
      setNewVendorSectionName("");
      handleModuleMenuClick("vendor", sectionId);
    }
  };

  const mainMenuItems = [
    { icon: LayoutDashboard, label: "Hub", sublabel: "Workspace Modules", path: "/dashboard", sidebarMode: "main" },
    { icon: FolderKanban, label: "All Projects", sublabel: "Project Overview", path: "/projects", sidebarMode: "main" },
    { icon: ShoppingCart, label: "Procurement", sublabel: "Material & Vendor Management", path: "/procurement", sidebarMode: "main" },
    { icon: Landmark, label: "Banking", sublabel: "Financial Management", path: "/banking", sidebarMode: "main" },
    { icon: Brain, label: "AI Assistant", sublabel: "AI-Powered Insights", path: "/ai-hub", sidebarMode: "main" },
    { icon: Database, label: "Data Explorer", sublabel: "Document & Data Hub", path: "/data-explorer", sidebarMode: "main" },
  ];

  const moduleMenuItems = {
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
      { icon: LayoutDashboard, label: "Vendor Home", sublabel: "Overview dashboard", module: "vendor", section: "home" },
      { icon: Package, label: "Supplier", sublabel: "Material partners", module: "vendor", section: "supplier" },
      { icon: Users, label: "Resource Vendor", sublabel: "Labour partners", module: "vendor", section: "resource" },
      { icon: Truck, label: "Equipment Vendor", sublabel: "Plant & machinery", module: "vendor", section: "equipment" },
      { icon: Wrench, label: "Special Service", sublabel: "Gardening, Security", module: "vendor", section: "special" },
      { icon: CheckCircle, label: "Performance", sublabel: "Scorecards", module: "vendor", section: "performance" },
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
  } as const;

  const phaseItems = [
    { icon: Sparkles, label: "Pre-Construction", sublabel: "Fast BIM Automation", path: "/pre-construction" },
    { icon: ConstructionIcon, label: "Construction", sublabel: "Construction Management", path: "/construction" },
    { icon: Wrench, label: "Facility Management", sublabel: "Project Management", path: "/facility-management" },
    { icon: MapPin, label: "Site Survey", sublabel: "Site Analysis", path: "/site-survey" },
    { icon: Box, label: "Digital Twin", sublabel: "BIM Modeling", path: "/digital-twin" },
    { icon: Monitor, label: "3D Viewer", sublabel: "Premium BIM Viewer", path: "/viewer" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleMainMenuClick = (item: typeof mainMenuItems[0]) => {
    setMode("main");
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
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-4 relative overflow-y-auto">
        {/* Logo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/" onClick={() => setMode("main")} aria-label="BIMBOX" className="mb-4">
              <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                <Box className="w-6 h-6 text-white" />
              </div>
            </Link>
          </TooltipTrigger>
          {renderTooltip("BIMBOX")}
        </Tooltip>

        <div className="flex min-h-0 w-full flex-1 flex-col gap-4">
          {/* Back Button (when in a Hub module) */}
          {mode !== "main" && (
            <div className="pb-4 border-b border-gray-200 w-full px-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleBackToMain}
                    aria-label="Back to Hub"
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100 text-gray-600"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </TooltipTrigger>
                {renderTooltip("Back to Hub")}
              </Tooltip>
            </div>
          )}

          {/* Dynamic Menu Items */}
          <div className="flex flex-col gap-2 pb-4 border-b border-gray-200 w-full px-3">
            {mode === "main" ? (
              // Main Menu
              <>
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Tooltip key={item.path}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleMainMenuClick(item)}
                          aria-label={item.label}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            isActive(item.path)
                              ? "bg-gray-900 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      {renderTooltip(item.label, item.sublabel)}
                    </Tooltip>
                  );
                })}
              </>
            ) : (
              // Hub Module Sub-Menu
              <>
                {moduleItems.map((item) => {
                  const Icon = item.icon;
                  const isActiveSection =
                    activeParams.get("module") === item.module &&
                    activeParams.get("section") === item.section;
                  return (
                    <Tooltip key={item.section}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleModuleMenuClick(item.module, item.section)}
                          aria-label={item.label}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            isActiveSection
                              ? "bg-gray-900 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      {renderTooltip(item.label, item.sublabel)}
                    </Tooltip>
                  );
                })}

                {mode === "hub-vendor" && customVendorSections.map((item) => {
                  const isActiveSection =
                    activeParams.get("module") === "vendor" &&
                    activeParams.get("section") === item.section;
                  return (
                    <Tooltip key={item.section}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => handleModuleMenuClick("vendor", item.section)}
                          aria-label={item.label}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                            isActiveSection
                              ? "bg-gray-900 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <Users className="w-5 h-5" />
                        </button>
                      </TooltipTrigger>
                      {renderTooltip(item.label, "Custom Vendor Category")}
                    </Tooltip>
                  );
                })}

                {mode === "hub-vendor" && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setIsAddVendorSectionOpen(true)}
                        aria-label="Add Vendor Category"
                        className="w-10 h-10 mt-1 rounded-lg border border-dashed border-gray-300 flex items-center justify-center transition-all text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 bg-white"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    {renderTooltip("Add Vendor Category", "Create uncategorized section")}
                  </Tooltip>
                )}
              </>
            )}
          </div>

          {/* Phase Section (Only in Main Menu) */}
          {mode === "main" && (
            <div className="flex flex-col gap-2 w-full px-3">
              {phaseItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link
                        to={item.path}
                        onClick={() => setMode("main")}
                        aria-label={item.label}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          isActive(item.path)
                            ? "bg-gray-900 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </Link>
                    </TooltipTrigger>
                    {renderTooltip(item.label, item.sublabel)}
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>

        {/* User Avatar at Bottom */}
        <div className="mt-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Samuel Rodriguez"
                className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white text-sm cursor-pointer"
              >
                S
              </button>
            </TooltipTrigger>
            {renderTooltip("Samuel Rodriguez", "Project Manager")}
          </Tooltip>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      <Dialog open={isAddVendorSectionOpen} onOpenChange={setIsAddVendorSectionOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Custom Vendor Category</DialogTitle>
            <DialogDescription>
              Create a new uncategorized vendor section to manage specific vendor types.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">Category Name</label>
            <input 
              type="text" 
              placeholder="e.g., Software Vendors, Consultants" 
              value={newVendorSectionName}
              onChange={(e) => setNewVendorSectionName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 font-medium" 
            />
          </div>
          <DialogFooter>
            <button onClick={() => setIsAddVendorSectionOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider transition-colors">Cancel</button>
            <button onClick={handleAddVendorSection} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm uppercase tracking-wider transition-colors">
              Create Category
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
