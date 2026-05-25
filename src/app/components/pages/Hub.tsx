import { Brain, Send, Package, Users, FileText, Upload, Truck, CheckCircle, Clock, AlertCircle, Plus, Search, Download, Edit, Trash2, Eye, FolderPlus, Folder, TrendingUp, UserCheck, Activity, LayoutDashboard, Database, ShoppingCart, ArrowRight, ArrowLeft, Grid3x3, List, Filter, MoreVertical, Calendar, DollarSign, FolderKanban, Star, Share2, Link2, Copy, Check, Loader2, X, ChevronRight, ChevronDown, Box, MapPin, Figma } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { generateFromElement, inlineComputedStyles } from "@magicpatterns/html-to-figma";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { useSidebar } from "../../context/SidebarContext";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { RFITracker } from "./RFITracker";
import { SchedulingTracker } from "./SchedulingTracker";
import { ChangeOrderTracker } from "./ChangeOrderTracker";
import { MaterialProcurementTracker } from "./MaterialProcurementTracker";
import { ResourceProcurementTracker } from "./ResourceProcurementTracker";
import { VendorTracker } from "./VendorTracker";
import { PlanningTracker, type PlanningTemplateKey } from "./PlanningTracker";
import { ResourcesWorkspace, type ResourceSection } from "./ResourcesWorkspace";
import MaterialCatalog from "./MaterialCatalog";
import EquipmentCatalog from "./EquipmentCatalog";
import VendorCatalog from "./VendorCatalog";
import StandardsCatalog from "./StandardsCatalog";
import CustomCatalog from "./CustomCatalog";

import { MaterialSupplierListPage } from "../../../modules/material-suppliers/pages/MaterialSupplierListPage";
import { MaterialReceivingPage } from "../../../modules/material-suppliers/pages/MaterialReceivingPage";
import { VendorPortalPage } from "../../../modules/material-suppliers/pages/VendorPortalPage";
import { VendorWorkspace } from "../../../modules/material-suppliers/pages/VendorWorkspace";

const insightsPieData = [
  { name: "Active", value: 42, color: "#3b82f6" },
  { name: "Delayed", value: 12, color: "#ef4444" },
  { name: "Completed", value: 28, color: "#10b981" }
];

const insightsBarData = [
  { name: "Jan", budget: 4000, spend: 2400 },
  { name: "Feb", budget: 3000, spend: 1398 },
  { name: "Mar", budget: 2000, spend: 1800 },
  { name: "Apr", budget: 2780, spend: 3908 },
  { name: "May", budget: 1890, spend: 4800 },
  { name: "Jun", budget: 2390, spend: 3800 },
];

type HubDataItem = {
  id: number;
  name: string;
  size: string;
  date: string;
  type: "folder" | "file";
  items?: number;
  project: string;
  owner: string;
  sharedWith: string[];
  parentId: number | null;
};

type HubProject = {
  id: number;
  name: string;
  phase: "Pre-Construction" | "Construction" | "Site Survey" | "Digital Twin" | "Facility Management";
  progress: number;
  status: "On Track" | "Delayed" | "Completed";
  budget: string;
  team: number;
  location: string;
  manager: string;
  startDate: string;
  endDate: string;
  summary: string;
};

type DataAiMessage = {
  id: number;
  role: "user" | "ai";
  message: string;
};

type DataFilters = {
  project: string;
  itemType: "all" | "file" | "folder";
  dateRange: "all" | "today" | "7days" | "30days";
  sizeRange: "all" | "small" | "medium" | "large";
  owner: string;
};

type HubSection = "home" | "data" | "catalog" | "projects" | "procurement" | "management" | "vendor" | "resources" | "finance";
type HubModule = Exclude<HubSection, "home" | "projects" | "management">;
type ProcurementFlow = "material" | "resource" | "equipment";
type VendorFlow = string;
type DataSubsection =
  | "home"
  | "drawings"
  | "model-data"
  | "survey-data"
  | "document-control"
  | "rfi-issues"
  | "change-orders"
  | "schedules"
  | "planning"
  | "project-docs"
  | "shared"
  | "uploads";
type DataWorkspaceSection = Exclude<DataSubsection, "home" | "planning" | "project-docs" | "shared" | "uploads">;
type ProjectDocChip = "All" | "PO" | "BOQ" | "BOM" | "Quotation" | "Invoices" | "Drawings" | "Contracts" | "Reports";

const initialHubFiles: HubDataItem[] = [
  { id: 1, name: "Architectural Plans", size: "245.5 MB", date: "2026-04-22", type: "folder", items: 3, project: "Downtown Tower Complex", owner: "You", sharedWith: ["Sarah M", "John D"], parentId: null },
  { id: 2, name: "Floor Plans - Rev 4.2.pdf", size: "24.5 MB", date: "2026-04-22", type: "file", project: "Downtown Tower Complex", owner: "You", sharedWith: ["Sarah M"], parentId: null },
  { id: 3, name: "Structural Drawings", size: "189.3 MB", date: "2026-04-21", type: "folder", items: 2, project: "Downtown Tower Complex", owner: "You", sharedWith: ["Project Team"], parentId: null },
  { id: 4, name: "Material Specifications.docx", size: "2.8 MB", date: "2026-04-21", type: "file", project: "Riverside Residential", owner: "Mike R", sharedWith: ["You"], parentId: null },
  { id: 5, name: "Site Photos", size: "145.2 MB", date: "2026-04-20", type: "folder", items: 3, project: "Tech Park Phase 2", owner: "Sarah M", sharedWith: ["Anna K", "Tom B"], parentId: null },
  { id: 6, name: "BIM Models", size: "892.1 MB", date: "2026-04-19", type: "folder", items: 2, project: "Downtown Tower Complex", owner: "You", sharedWith: ["BIM Team"], parentId: null },
  { id: 7, name: "MEP Drawings", size: "156.7 MB", date: "2026-04-19", type: "folder", items: 2, project: "Tech Park Phase 2", owner: "You", sharedWith: [], parentId: null },
  { id: 8, name: "Safety Report - Week 16.pdf", size: "3.2 MB", date: "2026-04-18", type: "file", project: "Tech Park Phase 2", owner: "Safety Team", sharedWith: ["You", "Samuel"], parentId: null },
  { id: 9, name: "Budget Analysis Q1.xlsx", size: "1.5 MB", date: "2026-04-17", type: "file", project: "Metro Mall Expansion", owner: "Finance", sharedWith: ["Leadership"], parentId: null },
  { id: 10, name: "Contract Documents", size: "45.8 MB", date: "2026-04-16", type: "folder", items: 2, project: "Riverside Residential", owner: "Legal", sharedWith: ["You"], parentId: null },
  { id: 11, name: "As-Built Drawings", size: "234.6 MB", date: "2026-04-15", type: "folder", items: 2, project: "Green Valley Homes", owner: "You", sharedWith: ["Facility Team"], parentId: null },
  { id: 12, name: "Vendor Proposals", size: "67.4 MB", date: "2026-04-14", type: "folder", items: 2, project: "Metro Mall Expansion", owner: "Procurement", sharedWith: ["You", "Vendor Team"], parentId: null },
  { id: 101, name: "Ground Floor Plan.dwg", size: "38.2 MB", date: "2026-04-23", type: "file", project: "Downtown Tower Complex", owner: "You", sharedWith: ["Sarah M"], parentId: 1 },
  { id: 102, name: "Core Layout IFC.ifc", size: "126.0 MB", date: "2026-04-22", type: "file", project: "Downtown Tower Complex", owner: "BIM Team", sharedWith: ["You"], parentId: 1 },
  { id: 103, name: "Revision Notes.txt", size: "220 KB", date: "2026-04-21", type: "file", project: "Downtown Tower Complex", owner: "Samuel", sharedWith: [], parentId: 1 },
  { id: 104, name: "Column Schedule.pdf", size: "12.4 MB", date: "2026-04-21", type: "file", project: "Downtown Tower Complex", owner: "Structures", sharedWith: [], parentId: 3 },
  { id: 105, name: "Shear Wall Details.dwg", size: "67.1 MB", date: "2026-04-20", type: "file", project: "Downtown Tower Complex", owner: "Structures", sharedWith: ["You"], parentId: 3 },
  { id: 106, name: "Drone Capture Set A", size: "82.5 MB", date: "2026-04-20", type: "file", project: "Tech Park Phase 2", owner: "Survey Team", sharedWith: [], parentId: 5 },
  { id: 107, name: "Drone Capture Set B", size: "41.9 MB", date: "2026-04-19", type: "file", project: "Tech Park Phase 2", owner: "Survey Team", sharedWith: [], parentId: 5 },
  { id: 108, name: "Annotated Photos.pdf", size: "20.8 MB", date: "2026-04-18", type: "file", project: "Tech Park Phase 2", owner: "Sarah M", sharedWith: ["You"], parentId: 5 },
  { id: 109, name: "LOD300 Model.rvt", size: "412.7 MB", date: "2026-04-19", type: "file", project: "Downtown Tower Complex", owner: "BIM Team", sharedWith: ["You"], parentId: 6 },
  { id: 110, name: "Clash Report.xlsx", size: "3.7 MB", date: "2026-04-18", type: "file", project: "Downtown Tower Complex", owner: "BIM Team", sharedWith: [], parentId: 6 },
  { id: 111, name: "HVAC Coordination.pdf", size: "18.3 MB", date: "2026-04-18", type: "file", project: "Tech Park Phase 2", owner: "MEP Team", sharedWith: [], parentId: 7 },
  { id: 112, name: "Plumbing Routing.dwg", size: "44.6 MB", date: "2026-04-17", type: "file", project: "Tech Park Phase 2", owner: "MEP Team", sharedWith: [], parentId: 7 },
  { id: 113, name: "Signed Agreement.pdf", size: "9.8 MB", date: "2026-04-16", type: "file", project: "Riverside Residential", owner: "Legal", sharedWith: ["You"], parentId: 10 },
  { id: 114, name: "Insurance Annexure.pdf", size: "5.4 MB", date: "2026-04-15", type: "file", project: "Riverside Residential", owner: "Legal", sharedWith: [], parentId: 10 },
  { id: 115, name: "Tower A Record Set.pdf", size: "120.0 MB", date: "2026-04-15", type: "file", project: "Green Valley Homes", owner: "Facilities", sharedWith: ["Facility Team"], parentId: 11 },
  { id: 116, name: "MEP Handover Notes.docx", size: "2.2 MB", date: "2026-04-14", type: "file", project: "Green Valley Homes", owner: "Facilities", sharedWith: [], parentId: 11 },
  { id: 117, name: "Vendor Submission 01.pdf", size: "30.7 MB", date: "2026-04-14", type: "file", project: "Metro Mall Expansion", owner: "Procurement", sharedWith: [], parentId: 12 },
  { id: 118, name: "Vendor Submission 02.pdf", size: "36.7 MB", date: "2026-04-13", type: "file", project: "Metro Mall Expansion", owner: "Procurement", sharedWith: ["You"], parentId: 12 },
];

const projectPhases = ["All", "Pre-Construction", "Construction", "Site Survey", "Digital Twin", "Facility Management"] as const;
const planningTemplateOptions: Array<{ value: PlanningTemplateKey; label: string; description: string }> = [
  { value: "new", label: "New blank template", description: "Start clean, rename, and save your own planning setup" },
  { value: "construction", label: "Construction template", description: "Full WBS with site, structure, and MEP phases" },
  { value: "preconstruction", label: "Pre-construction template", description: "Design, approvals, and procurement planning" },
  { value: "bep", label: "BEP template", description: "BIM execution plan with standards, modeling, coordination, and handover" },
  { value: "site-survey", label: "Site survey template", description: "Survey planning, capture, and deliverables" },
  { value: "facility-management", label: "Facility management template", description: "Handover, maintenance, and operations" },
];

const planningTemplateVisuals: Record<PlanningTemplateKey, { icon: typeof Activity; tone: string }> = {
  new: { icon: Plus, tone: "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-600/10" },
  construction: { icon: Package, tone: "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-600/10" },
  preconstruction: { icon: Clock, tone: "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-600/10" },
  bep: { icon: Box, tone: "bg-slate-900 text-white shadow-md shadow-slate-900/25 ring-1 ring-slate-900/10" },
  "site-survey": { icon: MapPin, tone: "bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-1 ring-teal-600/10" },
  "facility-management": { icon: Folder, tone: "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-600/10" },
};

const planningTemplateExploreChips = ["All", "BIM", "Construction", "Pre-construction", "Survey", "MEP", "Handover", "Infrastructure"] as const;
type PlanningTemplateExploreChip = typeof planningTemplateExploreChips[number];
type PlanningTemplateGalleryItem = {
  id: string;
  value: PlanningTemplateKey;
  label: string;
  description: string;
  category: Exclude<PlanningTemplateExploreChip, "All">;
  duration: string;
  scope: string;
  tags: string[];
};

const planningTemplateGalleryItems: PlanningTemplateGalleryItem[] = [
  { id: "tpl-bep-core", value: "bep", label: "BIM Execution Planning template", description: "BEP setup with BIM roles, CDE workflow, LOD matrix, model standards, coordination cycles, and handover deliverables.", category: "BIM", duration: "15 weeks", scope: "BIM execution", tags: ["BEP", "LOD", "Clash"] },
  { id: "tpl-construction-core", value: "construction", label: "Construction template", description: "Full WBS with site setup, substructure, superstructure, facade, MEP, finishing, and handover phases.", category: "Construction", duration: "14 months", scope: "High-rise building", tags: ["WBS", "Civil", "MEP"] },
  { id: "tpl-preconstruction-approval", value: "preconstruction", label: "Pre-construction template", description: "Design coordination, authority approvals, tendering, procurement planning, and baseline preparation.", category: "Pre-construction", duration: "16 weeks", scope: "Design to tender", tags: ["Approvals", "Tender", "Baseline"] },
  { id: "tpl-site-survey", value: "site-survey", label: "Site survey template", description: "Control points, drone capture, topographic survey, utility mapping, deliverables, and review milestones.", category: "Survey", duration: "6 weeks", scope: "Survey package", tags: ["Drone", "Topo", "GIS"] },
  { id: "tpl-mep-coordination", value: "construction", label: "MEP coordination template", description: "Shop drawings, sleeves, first fix, second fix, testing, commissioning, and consultant inspection flow.", category: "MEP", duration: "24 weeks", scope: "MEP works", tags: ["HVAC", "Electrical", "Testing"] },
  { id: "tpl-infra-road", value: "construction", label: "Road infrastructure template", description: "Survey, earthwork, subgrade, utilities, drainage, asphalt, signage, and traffic handover milestones.", category: "Infrastructure", duration: "10 months", scope: "Roadworks", tags: ["Earthwork", "Drainage", "Asphalt"] },
  { id: "tpl-fitout", value: "construction", label: "Interior fitout template", description: "Partition, MEP rough-in, ceiling, flooring, joinery, painting, snags, and client handover sequencing.", category: "Construction", duration: "18 weeks", scope: "Fitout", tags: ["Finishes", "Snagging", "Client handover"] },
  { id: "tpl-facility-handover", value: "facility-management", label: "Facility handover template", description: "Asset register, O&M manuals, warranties, training, defect liability, and planned maintenance setup.", category: "Handover", duration: "12 weeks", scope: "Closeout", tags: ["O&M", "Assets", "DLP"] },
  { id: "tpl-basement", value: "construction", label: "Basement construction template", description: "Excavation, shoring, dewatering, raft, retaining wall, waterproofing, and podium transfer milestones.", category: "Construction", duration: "20 weeks", scope: "Substructure", tags: ["Dewatering", "Raft", "Waterproofing"] },
  { id: "tpl-approval-fasttrack", value: "preconstruction", label: "Fast-track approvals template", description: "Parallel approval matrix for design submissions, statutory documents, consultant comments, and revisions.", category: "Pre-construction", duration: "8 weeks", scope: "Authority approvals", tags: ["Matrix", "Submittals", "Revisions"] },
];

type PlanningPermission = "edit" | "view";
type PlanningAssignTab = "members" | "partners" | "consultants";
type PlanningAssigneeGroup = "Internal team" | "Partners" | "Consultants" | "Invited";
type SavedPlanningTemplate = {
  id: string;
  label: string;
  description: string;
};
type PlanningAssigneeOption = {
  id: string;
  name: string;
  role: string;
  group: PlanningAssigneeGroup;
  accent: string;
};

const planningAssigneeOptions: PlanningAssigneeOption[] = [
  { id: "planning-lead", name: "Planning Lead", role: "Schedule owner", group: "Internal team", accent: "bg-blue-600" },
  { id: "civil-team", name: "Civil Team", role: "Site execution", group: "Internal team", accent: "bg-cyan-600" },
  { id: "mep-team", name: "MEP Team", role: "MEP coordination", group: "Internal team", accent: "bg-violet-600" },
  { id: "qa-team", name: "QA/QC Team", role: "Inspection and quality", group: "Internal team", accent: "bg-slate-600" },
  { id: "acme-surveys", name: "Acme Surveys Pvt Ltd", role: "Survey partner", group: "Partners", accent: "bg-indigo-600" },
  { id: "geomatic-solutions", name: "Geomatic Solutions", role: "GIS partner", group: "Partners", accent: "bg-teal-600" },
  { id: "terrascan", name: "TerraScan Co.", role: "Scan partner", group: "Partners", accent: "bg-lime-600" },
  { id: "blueprint-consultants", name: "BluePrint Consultants", role: "Design partner", group: "Consultants", accent: "bg-fuchsia-600" },
  { id: "approval-consultant", name: "Approval Consultant", role: "Authority approvals", group: "Consultants", accent: "bg-amber-600" },
];

const planningPermissionLabels: Record<PlanningPermission, string> = {
  edit: "Edit",
  view: "View only",
};

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function parseSizeToMb(size: string) {
  const value = Number.parseFloat(size);
  if (Number.isNaN(value)) {
    return 0;
  }
  if (size.toLowerCase().includes("kb")) {
    return value / 1024;
  }
  return value;
}

function isWithinRange(date: string, range: "all" | "today" | "7days" | "30days") {
  if (range === "all") {
    return true;
  }

  const baseDate = new Date("2026-04-28");
  const current = new Date(date);
  const diffInDays = Math.floor((baseDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

  if (range === "today") {
    return diffInDays === 0;
  }

  if (range === "7days") {
    return diffInDays <= 7;
  }

  return diffInDays <= 30;
}

function recomputeFolderCounts(items: HubDataItem[]) {
  return items.map((item) => {
    if (item.type !== "folder") {
      return item;
    }

    const directChildren = items.filter((entry) => entry.parentId === item.id).length;
    return {
      ...item,
      items: directChildren,
    };
  });
}

const SCROLLABLE_OVERFLOW_VALUES = new Set(["auto", "scroll", "overlay"]);

function getInlineStyleValue(element: Element, property: string) {
  return (element as HTMLElement | SVGElement).style.getPropertyValue(property).trim();
}

function forceHiddenOverflowForFigma(element: Element) {
  const overflow = getInlineStyleValue(element, "overflow");
  const overflowX = getInlineStyleValue(element, "overflow-x");
  const overflowY = getInlineStyleValue(element, "overflow-y");

  if (
    SCROLLABLE_OVERFLOW_VALUES.has(overflow) ||
    SCROLLABLE_OVERFLOW_VALUES.has(overflowX) ||
    SCROLLABLE_OVERFLOW_VALUES.has(overflowY)
  ) {
    (element as HTMLElement | SVGElement).style.setProperty("overflow", "hidden");
  }
}

function getVisibleControlText(liveControl: Element | undefined, clonedControl: Element) {
  if (liveControl instanceof HTMLSelectElement) {
    return liveControl.selectedOptions[0]?.textContent ?? liveControl.value;
  }

  if (liveControl instanceof HTMLTextAreaElement || liveControl instanceof HTMLInputElement) {
    return liveControl.value || liveControl.placeholder || "";
  }

  if (clonedControl instanceof HTMLSelectElement) {
    return clonedControl.selectedOptions[0]?.textContent ?? clonedControl.value;
  }

  if (clonedControl instanceof HTMLTextAreaElement || clonedControl instanceof HTMLInputElement) {
    return clonedControl.value || clonedControl.getAttribute("value") || clonedControl.getAttribute("placeholder") || "";
  }

  return "";
}

function replaceFormControlsWithFigmaFrames(cloneRoot: Element, liveRoot: Element) {
  const liveControls = Array.from(liveRoot.querySelectorAll("input, textarea, select"));
  const cloneControls = Array.from(cloneRoot.querySelectorAll("input, textarea, select"));

  cloneControls.forEach((control, index) => {
    const liveControl = liveControls[index];
    const inputType =
      liveControl instanceof HTMLInputElement
        ? liveControl.type
        : control instanceof HTMLInputElement
          ? control.type
          : "";

    if (["checkbox", "radio", "file", "hidden"].includes(inputType)) {
      return;
    }

    const frame = control.ownerDocument.createElement("div");
    Array.from(control.attributes).forEach((attr) => {
      if (!["type", "value", "placeholder", "checked", "selected"].includes(attr.name)) {
        frame.setAttribute(attr.name, attr.value);
      }
    });

    frame.style.display = "flex";
    frame.style.alignItems = control.tagName === "TEXTAREA" ? "flex-start" : "center";
    frame.style.whiteSpace = control.tagName === "TEXTAREA" ? "pre-wrap" : "nowrap";
    frame.style.overflow = "hidden";
    frame.textContent = getVisibleControlText(liveControl, control);
    control.parentNode?.replaceChild(frame, control);
  });
}

function hardenSvgPaintsForFigma(cloneRoot: Element) {
  cloneRoot.querySelectorAll("svg").forEach((svg) => {
    const rect = svg.getAttribute("data-rect")?.split(",").map((value) => Number.parseFloat(value));
    if (rect && rect.length === 4) {
      svg.setAttribute("width", `${Math.max(1, rect[2])}`);
      svg.setAttribute("height", `${Math.max(1, rect[3])}`);
    }
  });

  cloneRoot.querySelectorAll("path, circle, rect, line, polyline, polygon").forEach((shape) => {
    const color = getInlineStyleValue(shape, "color");
    const fill = getInlineStyleValue(shape, "fill");
    const stroke = getInlineStyleValue(shape, "stroke");

    if (fill && fill !== "none") {
      shape.setAttribute("fill", fill === "currentcolor" ? color : fill);
    }

    if (stroke && stroke !== "none") {
      shape.setAttribute("stroke", stroke === "currentcolor" ? color : stroke);
    }
  });
}

function prepareNativeFigmaClone(cloneRoot: Element, liveRoot: Element, width: number, height: number) {
  cloneRoot.querySelectorAll("#figma-fab, [data-figma-skip='true']").forEach((node) => node.remove());

  cloneRoot.setAttribute("data-rect", `0,0,${width},${height}`);
  if (cloneRoot instanceof HTMLElement || cloneRoot instanceof SVGElement) {
    cloneRoot.style.setProperty("width", `${width}px`);
    cloneRoot.style.setProperty("height", `${height}px`);
    cloneRoot.style.setProperty("overflow", "hidden");
    cloneRoot.style.setProperty("background-color", "#ffffff");
  }

  [cloneRoot, ...Array.from(cloneRoot.querySelectorAll("*"))].forEach(forceHiddenOverflowForFigma);
  replaceFormControlsWithFigmaFrames(cloneRoot, liveRoot);
  hardenSvgPaintsForFigma(cloneRoot);
}

export function Hub() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setMode } = useSidebar();
  const [activeSection, setActiveSection] = useState<HubSection>("home");
  const [activeHomeTab, setActiveHomeTab] = useState<"modules" | "insights">("modules");
  const [activeProcurementFlow, setActiveProcurementFlow] = useState<ProcurementFlow>("material");
  const [activeVendorFlow, setActiveVendorFlow] = useState<VendorFlow>("home");
  const [dataViewMode, setDataViewMode] = useState<"grid" | "list">("list");
  const [dataSearchQuery, setDataSearchQuery] = useState("");
  const [dataSearchOpen, setDataSearchOpen] = useState(false);
  const [dataWorkspaceChip, setDataWorkspaceChip] = useState("All");
  const [projectDocChip, setProjectDocChip] = useState<ProjectDocChip>("All");
  const [projectDocsViewMode, setProjectDocsViewMode] = useState<"grid" | "list">("list");
  const [dataWorkspaceProject, setDataWorkspaceProject] = useState("Downtown Tower Complex");
  const [currentDataFolderId, setCurrentDataFolderId] = useState<number | null>(null);
  const [dataBackHistory, setDataBackHistory] = useState<Array<number | null>>([]);
  const [dataForwardHistory, setDataForwardHistory] = useState<Array<number | null>>([]);
  const [showDataFloatingActions, setShowDataFloatingActions] = useState(false);
  const [dataFiltersOpen, setDataFiltersOpen] = useState(false);
  const [appliedDataFilters, setAppliedDataFilters] = useState<DataFilters>({
    project: "All Projects",
    itemType: "all",
    dateRange: "all",
    sizeRange: "all",
    owner: "all",
  });
  const [draftDataFilters, setDraftDataFilters] = useState<DataFilters>({
    project: "All Projects",
    itemType: "all",
    dateRange: "all",
    sizeRange: "all",
    owner: "all",
  });
  const [dataAiOpen, setDataAiOpen] = useState(false);
  const [dataAiQuery, setDataAiQuery] = useState("");
  const [dataAiMessages, setDataAiMessages] = useState<DataAiMessage[]>([
    {
      id: 1,
      role: "ai",
      message: "Ask about visible files, current folder contents, project-specific documents, owners, or quick summaries.",
    },
  ]);
  const [projectsViewMode, setProjectsViewMode] = useState<"grid" | "list">("grid");
  const [projectSearchQuery, setProjectSearchQuery] = useState("");
  const [projectPhaseFilter, setProjectPhaseFilter] = useState<(typeof projectPhases)[number]>("All");
  const [projectAiQuery, setProjectAiQuery] = useState("");
  const [projectAiResponse, setProjectAiResponse] = useState("");
  const [selectedHubProject, setSelectedHubProject] = useState<HubProject | null>(null);
  const [projectDetailsOpen, setProjectDetailsOpen] = useState(false);
  const [dataItems, setDataItems] = useState<HubDataItem[]>(initialHubFiles);
  const [selectedDataItem, setSelectedDataItem] = useState<HubDataItem | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [folderName, setFolderName] = useState("");
  const [folderProject, setFolderProject] = useState("Downtown Tower Complex");
  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("Can view");
  const [linkCopied, setLinkCopied] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadType, setUploadType] = useState<"file" | "folder">("file");
  const [uploadIntent, setUploadIntent] = useState<"file" | "folder">("file");
  const [uploadedItemName, setUploadedItemName] = useState("");
  const [uploadProject, setUploadProject] = useState("Downtown Tower Complex");

  const [catalogViewMode, setCatalogViewMode] = useState<"grid" | "list">("list");
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [isCatalogAddModalOpen, setCatalogAddModalOpen] = useState(false);
  const [selectedCatalogItem, setSelectedCatalogItem] = useState<any>(null);
  const [isCreateCatalogModalOpen, setCreateCatalogModalOpen] = useState(false);
  const [catalogDetailsTab, setCatalogDetailsTab] = useState("Overview");
  const [isCatalogFilterModalOpen, setCatalogFilterModalOpen] = useState(false);
  const [catalogFilters, setCatalogFilters] = useState<{category?: string, brand?: string, grade?: string}>({});
  const [customCatalogs, setCustomCatalogs] = useState<Array<{ id: string; title: string; subtitle: string; template: string; createdAt: string }>>([]);
  const [createCatalogDraft, setCreateCatalogDraft] = useState({ name: "", description: "", template: "Material Tracking" });
  const [projectDropdownTab, setProjectDropdownTab] = useState<"my" | "shared">("my");
  const [globalSelectedProject, setGlobalSelectedProject] = useState("Downtown Tower Complex");
  const [planningTemplate, setPlanningTemplate] = useState<PlanningTemplateKey>("construction");
  const [planningTemplateOpen, setPlanningTemplateOpen] = useState(false);
  const [planningTemplateExploreOpen, setPlanningTemplateExploreOpen] = useState(false);
  const [planningTemplateExploreSearch, setPlanningTemplateExploreSearch] = useState("");
  const [planningTemplateExploreChip, setPlanningTemplateExploreChip] = useState<PlanningTemplateExploreChip>("All");
  const [customPlanningTemplateName, setCustomPlanningTemplateName] = useState("New blank template");
  const [customPlanningTemplateDraft, setCustomPlanningTemplateDraft] = useState("My planning template");
  const [savedPlanningTemplates, setSavedPlanningTemplates] = useState<SavedPlanningTemplate[]>([]);
  const [selectedSavedPlanningTemplateId, setSelectedSavedPlanningTemplateId] = useState<string | null>(null);
  const [planningAssignOpen, setPlanningAssignOpen] = useState(false);
  const [planningAssignTab, setPlanningAssignTab] = useState<PlanningAssignTab>("members");
  const [planningInviteEmail, setPlanningInviteEmail] = useState("");
  const [planningInvitePermission, setPlanningInvitePermission] = useState<PlanningPermission>("view");
  const [planningInvitedAssignees, setPlanningInvitedAssignees] = useState<PlanningAssigneeOption[]>([]);
  const [planningSelectedAssignees, setPlanningSelectedAssignees] = useState<string[]>(["planning-lead", "civil-team", "mep-team"]);
  const [activeResourceSection, setActiveResourceSection] = useState<ResourceSection>("organization");
  const [planningAssigneePermissions, setPlanningAssigneePermissions] = useState<Record<string, PlanningPermission>>({
    "planning-lead": "edit",
    "civil-team": "edit",
    "mep-team": "view",
  });

  const myDummyProjects = ["Downtown Tower Complex", "Riverside Residential", "Tech Park Phase 2", "Green Valley Homes"];
  const sharedDummyProjects = ["Metro Mall Expansion", "Northern Highway Corridor", "Smart Campus Replica", "Airport Apron Upgrade"];
  const resourceSections: ResourceSection[] = [
    "organization",
    "workforce",
    "teams",
    "attendance",
    "access-control",
    "allocation",
    "payroll",
    "performance",
    "compliance",
  ];
  
  useEffect(() => {
    const moduleParam = searchParams.get("module") as HubModule | null;
    const sectionParam = searchParams.get("section");

    if (moduleParam && ["data", "catalog", "procurement", "vendor", "resources", "finance"].includes(moduleParam)) {
      setActiveSection(moduleParam);
      setMode(`hub-${moduleParam}` as Parameters<typeof setMode>[0]);

      if (moduleParam === "procurement" && sectionParam) {
        const nextFlow = sectionParam as ProcurementFlow;
        if (["material", "resource", "equipment"].includes(nextFlow)) {
          setActiveProcurementFlow(nextFlow);
        }
      }
      if (moduleParam === "vendor" && sectionParam) {
        setActiveVendorFlow(sectionParam);
      }
      if (moduleParam === "catalog" && sectionParam) {
        setCatalogFilters({});
      }
      if (moduleParam === "resources" && sectionParam && resourceSections.includes(sectionParam as ResourceSection)) {
        setActiveResourceSection(sectionParam as ResourceSection);
      }
      return;
    }

    const legacySection = searchParams.get("section") as HubSection | null;
    if (legacySection && ["data", "projects", "procurement", "management"].includes(legacySection)) {
      setActiveSection(legacySection);
      return;
    }

    setActiveSection("home");
    setMode("main");
  }, [searchParams, setMode]);

  useEffect(() => {
    const scrollContainer = document.querySelector("main");
    const handleScroll = () => {
      const scrollTop = scrollContainer instanceof HTMLElement ? scrollContainer.scrollTop : window.scrollY;
      setShowDataFloatingActions(activeSection === "data" && scrollTop > 220);
    };

    handleScroll();
    if (scrollContainer instanceof HTMLElement) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeSection]);

  const stats = [
    { label: "Active Projects", value: "42", icon: LayoutDashboard },
    { label: "Team Members", value: "156", icon: Users },
    { label: "Pending Tasks", value: "23", icon: CheckCircle },
    { label: "This Month", value: "$2.4M", icon: TrendingUp },
  ];

  const projects: HubProject[] = [
    {
      id: 1,
      name: "Downtown Tower Complex",
      phase: "Construction",
      progress: 75,
      status: "On Track",
      budget: "$5.2M",
      team: 45,
      location: "Downtown District",
      manager: "Samuel Rodriguez",
      startDate: "2025-10-15",
      endDate: "2026-08-15",
      summary: "High-rise commercial build with structural package in progress and MEP coordination active.",
    },
    {
      id: 2,
      name: "Riverside Residential",
      phase: "Pre-Construction",
      progress: 45,
      status: "On Track",
      budget: "$3.8M",
      team: 28,
      location: "Riverside Area",
      manager: "Priya Menon",
      startDate: "2026-01-20",
      endDate: "2026-06-30",
      summary: "Tender planning, design coordination, and permit sequencing for a mid-rise residential cluster.",
    },
    {
      id: 3,
      name: "Tech Park Phase 2",
      phase: "Construction",
      progress: 30,
      status: "Delayed",
      budget: "$8.5M",
      team: 62,
      location: "Tech District",
      manager: "Arjun Mehta",
      startDate: "2025-12-01",
      endDate: "2026-09-20",
      summary: "Core and shell package facing material lag with active mitigation planning on steel and facade delivery.",
    },
    {
      id: 4,
      name: "Green Valley Homes",
      phase: "Facility Management",
      progress: 100,
      status: "Completed",
      budget: "$2.1M",
      team: 12,
      location: "Green Valley",
      manager: "Maya Kapoor",
      startDate: "2025-06-10",
      endDate: "2026-04-10",
      summary: "Live operations handover completed with maintenance schedules, asset logs, and occupancy support active.",
    },
    {
      id: 5,
      name: "Metro Mall Expansion",
      phase: "Pre-Construction",
      progress: 20,
      status: "On Track",
      budget: "$12.3M",
      team: 35,
      location: "City Center",
      manager: "Nikhil Shah",
      startDate: "2026-03-01",
      endDate: "2027-02-28",
      summary: "Feasibility, package definition, and coordination review for staged commercial expansion works.",
    },
    {
      id: 6,
      name: "Northern Highway Corridor",
      phase: "Site Survey",
      progress: 62,
      status: "On Track",
      budget: "$1.9M",
      team: 18,
      location: "Northern Belt",
      manager: "Rohit Sinha",
      startDate: "2026-02-12",
      endDate: "2026-05-25",
      summary: "Topographic and utilities mapping package with drone capture, control points, and terrain validation.",
    },
    {
      id: 7,
      name: "Smart Campus Replica",
      phase: "Digital Twin",
      progress: 54,
      status: "On Track",
      budget: "$4.6M",
      team: 22,
      location: "Innovation Park",
      manager: "Aisha Khan",
      startDate: "2026-01-08",
      endDate: "2026-10-14",
      summary: "Federated BIM and live asset mapping for operations, monitoring, and simulation workflows.",
    },
    {
      id: 8,
      name: "Airport Apron Upgrade",
      phase: "Site Survey",
      progress: 83,
      status: "On Track",
      budget: "$2.7M",
      team: 14,
      location: "Airport Zone",
      manager: "Ishaan Verma",
      startDate: "2026-01-02",
      endDate: "2026-04-30",
      summary: "Laser scanning and survey control package nearing closeout ahead of pavement rehabilitation.",
    },
    {
      id: 9,
      name: "Harbor Utility Twin",
      phase: "Digital Twin",
      progress: 28,
      status: "Delayed",
      budget: "$3.2M",
      team: 16,
      location: "Port District",
      manager: "Neha Batra",
      startDate: "2026-02-20",
      endDate: "2026-11-12",
      summary: "Underground utility model integration slowed by incomplete as-built reconciliation from legacy systems.",
    },
    {
      id: 10,
      name: "Civic Center Operations",
      phase: "Facility Management",
      progress: 68,
      status: "On Track",
      budget: "$1.4M",
      team: 20,
      location: "Central Plaza",
      manager: "Kabir Rao",
      startDate: "2025-11-04",
      endDate: "2026-12-18",
      summary: "Active maintenance and service management program with energy optimization and ticket response tracking.",
    },
  ];
  const showFeedback = (message: string) => {
    setFeedbackMessage(message);
    window.setTimeout(() => {
      setFeedbackMessage("");
    }, 2200);
  };

  const updateDataItem = (id: number, updates: Partial<HubDataItem>) => {
    setDataItems((current) => recomputeFolderCounts(current.map((item) => item.id === id ? { ...item, ...updates } : item)));
    setSelectedDataItem((current) => current && current.id === id ? { ...current, ...updates } : current);
  };

  const currentDataFolder = currentDataFolderId !== null
    ? dataItems.find((item) => item.id === currentDataFolderId) ?? null
    : null;

  const availableDataOwners = useMemo(
    () => Array.from(new Set(dataItems.map((item) => item.owner))).sort(),
    [dataItems],
  );

  const dataFolderBreadcrumbs = useMemo(() => {
    const crumbs: HubDataItem[] = [];
    let cursor = currentDataFolder;

    while (cursor) {
      crumbs.unshift(cursor);
      cursor = cursor.parentId !== null
        ? dataItems.find((item) => item.id === cursor.parentId) ?? null
        : null;
    }

    return crumbs;
  }, [currentDataFolder, dataItems]);

  const dataSubsectionParam = searchParams.get("module") === "data"
    ? searchParams.get("section")
    : "home";
  const activeDataSubsection: DataSubsection = [
    "home",
    "drawings",
    "model-data",
    "survey-data",
    "document-control",
    "rfi-issues",
    "change-orders",
    "schedules",
    "planning",
    "project-docs",
    "shared",
    "uploads",
  ].includes(dataSubsectionParam ?? "")
    ? dataSubsectionParam as DataSubsection
    : "home";
  const dataWorkspaceSections: DataWorkspaceSection[] = [
    "drawings",
    "model-data",
    "survey-data",
    "document-control",
    "rfi-issues",
    "change-orders",
    "schedules",
  ];
  const isDataWorkspaceSection = dataWorkspaceSections.includes(activeDataSubsection as DataWorkspaceSection);
  const isPlanningSection = activeDataSubsection === "planning";
  const activeDataWorkspaceSection = isDataWorkspaceSection ? activeDataSubsection as DataWorkspaceSection : null;
  const dataHeaderMeta = {
    home: { title: "Data", icon: Database },
    drawings: { title: "Drawings", icon: FolderKanban },
    "model-data": { title: "Model Data", icon: Box },
    "survey-data": { title: "Survey Data", icon: MapPin },
    "document-control": { title: "Document Control", icon: FileText },
    "rfi-issues": { title: "RFI Issue", icon: AlertCircle },
    "change-orders": { title: "Change Order", icon: Edit },
    schedules: { title: "Schedule", icon: Calendar },
    planning: { title: "Planning", icon: Activity },
    "project-docs": { title: "Project Docs", icon: FolderKanban },
    shared: { title: "Shared", icon: Share2 },
    uploads: { title: "Uploads", icon: Upload },
  }[activeDataSubsection];
  const DataHeaderIcon = dataHeaderMeta.icon;
  const activePlanningTemplate = planningTemplateOptions.find((template) => template.value === planningTemplate) ?? planningTemplateOptions[0];
  const blankPlanningTemplate = planningTemplateOptions.find((template) => template.value === "new") ?? planningTemplateOptions[0];
  const presetPlanningTemplates = planningTemplateOptions.filter((template) => template.value !== "new");
  const compactPresetPlanningTemplates = presetPlanningTemplates.slice(0, 3);
  const selectedSavedPlanningTemplate = savedPlanningTemplates.find((template) => template.id === selectedSavedPlanningTemplateId) ?? null;
  const activePlanningTemplateLabel = planningTemplate === "new" ? (selectedSavedPlanningTemplate?.label ?? customPlanningTemplateName) : activePlanningTemplate.label;
  const filteredPlanningTemplateGallery = useMemo(() => {
    const query = planningTemplateExploreSearch.trim().toLowerCase();
    return planningTemplateGalleryItems.filter((template) => {
      const matchesChip = planningTemplateExploreChip === "All" || template.category === planningTemplateExploreChip || template.tags.includes(planningTemplateExploreChip);
      const searchable = [template.label, template.description, template.category, template.scope, ...template.tags].join(" ").toLowerCase();
      return matchesChip && (!query || searchable.includes(query));
    });
  }, [planningTemplateExploreChip, planningTemplateExploreSearch]);
  const createNewPlanningTemplate = () => {
    setPlanningTemplate("new");
    setSelectedSavedPlanningTemplateId(null);
    setCustomPlanningTemplateName("New blank template");
    setCustomPlanningTemplateDraft("Untitled planning template");
    setPlanningTemplateOpen(true);
  };
  const choosePlanningTemplate = (template: PlanningTemplateKey) => {
    setPlanningTemplate(template);
    if (template === "new") {
      setSelectedSavedPlanningTemplateId(null);
      setCustomPlanningTemplateDraft(customPlanningTemplateName === "New blank template" ? "My planning template" : customPlanningTemplateName);
      setPlanningTemplateOpen(true);
      return;
    }
    setSelectedSavedPlanningTemplateId(null);
    setPlanningTemplateOpen(false);
  };
  const openPlanningTemplateExplorer = () => {
    setPlanningTemplateOpen(false);
    setPlanningTemplateExploreOpen(true);
  };
  const choosePlanningGalleryTemplate = (template: PlanningTemplateGalleryItem) => {
    setPlanningTemplate(template.value);
    setSelectedSavedPlanningTemplateId(null);
    setPlanningTemplateExploreOpen(false);
    setPlanningTemplateOpen(false);
    toast.success(`${template.label} loaded.`);
  };
  const chooseSavedPlanningTemplate = (template: SavedPlanningTemplate) => {
    setPlanningTemplate("new");
    setSelectedSavedPlanningTemplateId(template.id);
    setCustomPlanningTemplateName(template.label);
    setCustomPlanningTemplateDraft(template.label);
    setPlanningTemplateOpen(false);
  };
  const saveCustomPlanningTemplate = () => {
    const nextName = customPlanningTemplateDraft.trim() || "My planning template";
    const templateId = selectedSavedPlanningTemplateId ?? `custom-${Date.now()}`;
    const nextTemplate: SavedPlanningTemplate = {
      id: templateId,
      label: nextName,
      description: "Custom planning template",
    };
    setSavedPlanningTemplates((current) => {
      const exists = current.some((template) => template.id === templateId);
      return exists
        ? current.map((template) => template.id === templateId ? nextTemplate : template)
        : [nextTemplate, ...current];
    });
    setSelectedSavedPlanningTemplateId(templateId);
    setCustomPlanningTemplateName(nextName);
    setPlanningTemplate("new");
    setPlanningTemplateOpen(false);
  };
  const planningAssignees = [...planningAssigneeOptions, ...planningInvitedAssignees];
  const planningMemberAssignees = planningAssignees.filter((assignee) => assignee.group === "Internal team");
  const planningPartnerAssignees = planningAssignees.filter((assignee) => assignee.group === "Partners");
  const planningConsultantAssignees = planningAssignees.filter((assignee) => assignee.group === "Consultants");
  const planningActiveAssignees = planningAssignees.filter((assignee) => planningSelectedAssignees.includes(assignee.id));
  const selectedPlanningAssigneeCount = planningSelectedAssignees.length;
  const selectedPlanningEditCount = planningSelectedAssignees.filter((id) => planningAssigneePermissions[id] === "edit").length;
  const planningAssignTabs: Array<{ id: PlanningAssignTab; label: string; count: number }> = [
    { id: "members", label: "Members", count: planningMemberAssignees.length },
    { id: "partners", label: "Partners", count: planningPartnerAssignees.length },
    { id: "consultants", label: "Consultants", count: planningConsultantAssignees.length },
  ];
  const currentPlanningAssignRows = planningAssignTab === "partners"
    ? planningPartnerAssignees
    : planningAssignTab === "consultants"
      ? planningConsultantAssignees
      : planningMemberAssignees;
  const togglePlanningAssignee = (assigneeId: string) => {
    const alreadySelected = planningSelectedAssignees.includes(assigneeId);
    setPlanningSelectedAssignees((current) =>
      alreadySelected ? current.filter((id) => id !== assigneeId) : [...current, assigneeId],
    );
    if (!alreadySelected) {
      setPlanningAssigneePermissions((current) => ({ ...current, [assigneeId]: current[assigneeId] ?? "view" }));
    }
  };
  const updatePlanningAssigneePermission = (assigneeId: string, permission: PlanningPermission) => {
    setPlanningAssigneePermissions((current) => ({ ...current, [assigneeId]: permission }));
    setPlanningSelectedAssignees((current) => current.includes(assigneeId) ? current : [...current, assigneeId]);
  };
  const invitePlanningAssignee = () => {
    const email = planningInviteEmail.trim();
    if (!email) {
      return;
    }

    const inviteId = `invite-${email.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    if (!planningAssignees.some((assignee) => assignee.id === inviteId)) {
      setPlanningInvitedAssignees((current) => [
        ...current,
        {
          id: inviteId,
          name: email,
          role: "Invited collaborator",
          group: "Invited",
          accent: "bg-blue-500",
        },
      ]);
    }
    setPlanningSelectedAssignees((current) => current.includes(inviteId) ? current : [...current, inviteId]);
    setPlanningAssigneePermissions((current) => ({ ...current, [inviteId]: planningInvitePermission }));
    setPlanningInviteEmail("");
  };
  const renderPlanningAssigneeRow = (assignee: PlanningAssigneeOption) => {
    const selected = planningSelectedAssignees.includes(assignee.id);
    const permission = planningAssigneePermissions[assignee.id] ?? "view";

    return (
      <div
        key={assignee.id}
        className={`grid grid-cols-[1fr_auto_auto] items-center gap-2 rounded-xl border px-2.5 py-2 transition-all ${
          selected
            ? "border-blue-100 bg-blue-50/50 shadow-sm"
            : "border-slate-200 bg-white hover:border-blue-100 hover:bg-blue-50/30"
        }`}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white ${assignee.accent}`}>
            {assignee.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-medium text-slate-900">{assignee.name}</span>
            <span className="block truncate text-[11px] text-slate-500">{assignee.role}</span>
          </span>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-0.5">
          {(["edit", "view"] as PlanningPermission[]).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updatePlanningAssigneePermission(assignee.id, option)}
              className={`rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
                permission === option && selected
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {planningPermissionLabels[option]}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => togglePlanningAssignee(assignee.id)}
          className={`grid h-6 w-6 place-items-center rounded-lg border transition-colors ${
            selected
              ? "border-blue-200 bg-blue-600 text-white"
              : "border-slate-200 bg-white text-transparent hover:border-blue-200 hover:text-blue-300"
          }`}
          title={selected ? "Remove assignment" : "Add assignment"}
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };
  const activeCatalogSection = searchParams.get("module") === "catalog"
    ? (searchParams.get("section") ?? "home")
    : "home";
  const dataWorkspaceConfigs: Record<DataWorkspaceSection, { title: string; subtitle: string; count: string; chips: string[]; accent: string; icon: typeof Database; }> = {
    drawings: {
      title: "Drawings",
      subtitle: "Files, folders, drawing sets",
      count: "13 items",
      chips: ["All", "Architecture Data", "Structural Data", "Mechanical", "HVAC", "Electrical", "Plumbing", "Fire Protection"],
      accent: "bg-blue-50 text-blue-600 border-blue-100",
      icon: FolderKanban,
    },
    "model-data": {
      title: "Model Data",
      subtitle: "BIM, coordination, IFC",
      count: "6 active",
      chips: ["All", "Architectural Model", "Structural Model", "MEP Model", "Coordination", "Clash", "IFC"],
      accent: "bg-emerald-50 text-emerald-600 border-emerald-100",
      icon: Box,
    },
    "survey-data": {
      title: "Survey Data",
      subtitle: "Pattern, drone, site capture",
      count: "5 sets",
      chips: ["All", "Topography", "Drone", "GIS", "As Built", "Control Points"],
      accent: "bg-orange-50 text-orange-600 border-orange-100",
      icon: MapPin,
    },
    "document-control": {
      title: "Document Control",
      subtitle: "PO, BOQ, BOM, invoice, contract",
      count: "9 docs",
      chips: ["All", "BOQ", "BOM", "PO", "Quotation", "Invoices", "Contracts"],
      accent: "bg-cyan-50 text-cyan-600 border-cyan-100",
      icon: FileText,
    },
    "rfi-issues": {
      title: "RFI Issue",
      subtitle: "Technical queries and responses",
      count: "4 open",
      chips: ["All", "Open", "Pending Reply", "Closed", "Site", "Design"],
      accent: "bg-violet-50 text-violet-600 border-violet-100",
      icon: AlertCircle,
    },
    "change-orders": {
      title: "Change Order",
      subtitle: "Variation and revision records",
      count: "5 cases",
      chips: ["All", "Client Change", "Design Revision", "Cost Impact", "Approved", "Pending"],
      accent: "bg-rose-50 text-rose-600 border-rose-100",
      icon: Edit,
    },
    schedules: {
      title: "Schedule",
      subtitle: "Baseline, lookahead, recovery",
      count: "4 plans",
      chips: ["All", "Baseline", "Lookahead", "Procurement", "Recovery", "Delay"],
      accent: "bg-amber-50 text-amber-600 border-amber-100",
      icon: Calendar,
    },
  };
  const activeDataWorkspaceConfig = activeDataWorkspaceSection ? dataWorkspaceConfigs[activeDataWorkspaceSection] : null;
  const belongsToWorkspaceSection = (item: HubDataItem, section: DataWorkspaceSection): boolean => {
    const sectionIds: Record<DataWorkspaceSection, number[]> = {
      drawings: [1, 2, 3, 7, 11, 101, 104, 105, 111, 112, 115],
      "model-data": [6, 102, 109, 110],
      "survey-data": [5, 106, 107, 108],
      "document-control": [4, 9, 10, 12, 113, 114, 117, 118],
      "rfi-issues": [8, 103, 110],
      "change-orders": [4, 9, 113, 117],
      schedules: [2, 8, 9, 103],
    };

    let cursor: HubDataItem | undefined = item;
    while (cursor) {
      if (sectionIds[section].includes(cursor.id)) {
        return true;
      }
      cursor = cursor.parentId !== null ? dataItems.find((entry) => entry.id === cursor.parentId) : undefined;
    }
    return false;
  };
  const inferWorkspaceTags = (item: HubDataItem, section: DataWorkspaceSection) => {
    const text = `${item.name} ${item.project} ${item.owner}`.toLowerCase();

    if (section === "drawings") {
      const tags: string[] = [];
      if (text.includes("architect") || text.includes("plan")) tags.push("Architecture Data");
      if (text.includes("struct") || text.includes("column") || text.includes("shear")) tags.push("Structural Data");
      if (text.includes("mechanical") || text.includes("mep")) tags.push("Mechanical");
      if (text.includes("hvac")) tags.push("HVAC");
      if (text.includes("electrical") || text.includes("power")) tags.push("Electrical");
      if (text.includes("plumbing")) tags.push("Plumbing");
      if (text.includes("fire")) tags.push("Fire Protection");
      return tags.length > 0 ? tags : ["Architecture Data"];
    }
    if (section === "model-data") {
      const tags: string[] = [];
      if (text.includes("rvt") || text.includes("bim")) tags.push("Architectural Model");
      if (text.includes("struct")) tags.push("Structural Model");
      if (text.includes("mep")) tags.push("MEP Model");
      if (text.includes("coordination")) tags.push("Coordination");
      if (text.includes("clash")) tags.push("Clash");
      if (text.includes("ifc")) tags.push("IFC");
      return tags.length > 0 ? tags : ["Coordination"];
    }
    if (section === "survey-data") {
      if (text.includes("drone")) return ["Drone"];
      if (text.includes("site") || text.includes("photo")) return ["Topography"];
      return ["As Built"];
    }
    if (section === "document-control") {
      if (text.includes("budget") || text.includes("invoice")) return ["Invoices"];
      if (text.includes("contract") || text.includes("agreement")) return ["Contracts"];
      if (text.includes("vendor") || text.includes("proposal") || text.includes("submission")) return ["Quotation"];
      if (text.includes("material")) return ["BOM"];
      return ["BOQ"];
    }
    if (section === "rfi-issues") {
      if (text.includes("revision") || text.includes("clash")) return ["Design"];
      if (text.includes("safety") || text.includes("site")) return ["Site"];
      return ["Open"];
    }
    if (section === "change-orders") {
      if (text.includes("budget")) return ["Cost Impact"];
      if (text.includes("revision")) return ["Design Revision"];
      return ["Pending"];
    }
    if (text.includes("budget")) return ["Baseline"];
    if (text.includes("report")) return ["Lookahead"];
    return ["Recovery"];
  };
  const dataLandingCards = [
    ...Object.entries(dataWorkspaceConfigs).map(([key, value]) => ({
      id: key as DataWorkspaceSection,
      ...value,
    })),
    {
      id: "planning",
      title: "Planning",
      subtitle: "WBS, task timeline, Gantt",
      count: "15 tasks",
      chips: [],
      accent: "bg-teal-50 text-teal-700 border-teal-100",
      icon: Activity,
    },
  ];
  const catalogCards = [
    { id: "materials", title: "Material Catalog", subtitle: "Approved materials and specs", count: "184 items", icon: Package, accent: "bg-amber-50 text-amber-600 border-amber-100" },
    { id: "equipment", title: "Equipment Catalog", subtitle: "Plant, tools, machinery", count: "52 assets", icon: Truck, accent: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { id: "vendors", title: "Vendor Catalog", subtitle: "Mapped suppliers and trades", count: "48 vendors", icon: Users, accent: "bg-blue-50 text-blue-600 border-blue-100" },
    { id: "standards", title: "Standards", subtitle: "Templates, codes, references", count: "26 docs", icon: FileText, accent: "bg-violet-50 text-violet-600 border-violet-100" },
    ...customCatalogs.map((catalog) => ({
      id: catalog.id,
      title: catalog.title,
      subtitle: catalog.subtitle,
      count: "0 items",
      icon: FolderKanban,
      accent: "bg-blue-50 text-blue-600 border-blue-100",
    })),
  ];

  useEffect(() => {
    if (isDataWorkspaceSection) {
      setCurrentDataFolderId(null);
      setDataBackHistory([]);
      setDataForwardHistory([]);
      setDataWorkspaceChip("All");
    }
  }, [isDataWorkspaceSection, activeDataSubsection]);

  const filteredFiles = dataItems.filter((file) => {
    if (file.parentId !== currentDataFolderId) {
      return false;
    }
    const query = dataSearchQuery.toLowerCase();
    const matchesSearch =
      file.name.toLowerCase().includes(query) ||
      file.project.toLowerCase().includes(query) ||
      file.owner.toLowerCase().includes(query);
    const matchesProject = appliedDataFilters.project === "All Projects" || file.project === appliedDataFilters.project;
    const matchesType = appliedDataFilters.itemType === "all" || file.type === appliedDataFilters.itemType;
    const matchesDate = isWithinRange(file.date, appliedDataFilters.dateRange);
    const sizeInMb = parseSizeToMb(file.size);
    const matchesSize =
      appliedDataFilters.sizeRange === "all" ||
      (appliedDataFilters.sizeRange === "small" && sizeInMb < 10) ||
      (appliedDataFilters.sizeRange === "medium" && sizeInMb >= 10 && sizeInMb < 100) ||
      (appliedDataFilters.sizeRange === "large" && sizeInMb >= 100);
    const matchesOwner = appliedDataFilters.owner === "all" || file.owner === appliedDataFilters.owner;
    const matchesWorkspaceSection = !activeDataWorkspaceSection || belongsToWorkspaceSection(file, activeDataWorkspaceSection);
    const matchesWorkspaceChip = !activeDataWorkspaceSection || dataWorkspaceChip === "All" || inferWorkspaceTags(file, activeDataWorkspaceSection).includes(dataWorkspaceChip);
    const matchesWorkspaceProject = !activeDataWorkspaceSection || dataWorkspaceProject === "All Projects" || file.project === dataWorkspaceProject;
    return matchesSearch && matchesProject && matchesType && matchesDate && matchesSize && matchesOwner && matchesWorkspaceSection && matchesWorkspaceChip && matchesWorkspaceProject;
  });

  const askDataAi = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const lower = trimmed.toLowerCase();
    const folders = filteredFiles.filter((item) => item.type === "folder");
    const files = filteredFiles.filter((item) => item.type === "file");
    const owners = Array.from(new Set(filteredFiles.map((item) => item.owner)));
    const projectsVisible = Array.from(new Set(filteredFiles.map((item) => item.project)));

    let response = "";

    if (lower.includes("summary") || lower.includes("overview")) {
      response = `You are viewing ${filteredFiles.length} item(s): ${files.length} file(s) and ${folders.length} folder(s). ${currentDataFolder ? `Current folder is ${currentDataFolder.name}.` : "You are at the top level."}`;
    } else if (lower.includes("owner") || lower.includes("who")) {
      response = owners.length > 0
        ? `Visible owners in this view: ${owners.join(", ")}.`
        : "No ownership metadata is visible in the current view.";
    } else if (lower.includes("project")) {
      response = projectsVisible.length > 0
        ? `Current results belong to: ${projectsVisible.join(", ")}.`
        : "No project metadata matches the current filters.";
    } else if (lower.includes("folder")) {
      response = folders.length > 0
        ? `Folders in this view: ${folders.map((item) => `${item.name} (${item.items ?? 0} items)`).join(", ")}.`
        : "There are no folders in the current view.";
    } else if (lower.includes("file")) {
      response = files.length > 0
        ? `Files in this view include ${files.slice(0, 5).map((item) => item.name).join(", ")}${files.length > 5 ? ", and more." : "."}`
        : "There are no files in the current view.";
    } else if (lower.includes("share")) {
      response = "Use the three-dot menu or open an item to share it. The share flow supports link copy and collaborator add in this frontend preview.";
    } else {
      response = filteredFiles.length > 0
        ? `Quick answer: this view contains ${filteredFiles.length} result(s) across ${projectsVisible.length} project scope(s). Ask about folders, owners, files, or a summary for more specific detail.`
        : "There are no visible results right now. Try changing the search, folder, or project filter.";
    }

    setDataAiMessages((current) => [
      ...current,
      { id: Date.now(), role: "user", message: trimmed },
      { id: Date.now() + 1, role: "ai", message: response },
    ]);
    setDataAiQuery("");
  };

  const activeDataFilterCount = [
    appliedDataFilters.project !== "All Projects",
    appliedDataFilters.itemType !== "all",
    appliedDataFilters.dateRange !== "all",
    appliedDataFilters.sizeRange !== "all",
    appliedDataFilters.owner !== "all",
  ].filter(Boolean).length;

  const openDataFilters = () => {
    setDraftDataFilters(appliedDataFilters);
    setDataFiltersOpen(true);
  };

  const clearDataFilters = () => {
    setDraftDataFilters({
      project: "All Projects",
      itemType: "all",
      dateRange: "all",
      sizeRange: "all",
      owner: "all",
    });
  };

  const applyDataFilters = () => {
    setAppliedDataFilters(draftDataFilters);
    setDataFiltersOpen(false);
  };

  const navigateDataFolder = (folderId: number | null) => {
    if (folderId === currentDataFolderId) {
      return;
    }
    setDataBackHistory((current) => [...current, currentDataFolderId]);
    setDataForwardHistory([]);
    setCurrentDataFolderId(folderId);
    setDataSearchQuery("");
  };

  const goBackDataFolder = () => {
    if (dataBackHistory.length === 0) {
      return;
    }
    const previous = dataBackHistory[dataBackHistory.length - 1];
    setDataBackHistory((current) => current.slice(0, -1));
    setDataForwardHistory((current) => [currentDataFolderId, ...current]);
    setCurrentDataFolderId(previous);
    setDataSearchQuery("");
  };

  const goForwardDataFolder = () => {
    if (dataForwardHistory.length === 0) {
      return;
    }
    const [next, ...rest] = dataForwardHistory;
    setDataForwardHistory(rest);
    setDataBackHistory((current) => [...current, currentDataFolderId]);
    setCurrentDataFolderId(next);
    setDataSearchQuery("");
  };

  const openDataItem = (item: HubDataItem) => {
    setSelectedDataItem(item);
    setDetailsModalOpen(true);
  };

  const openDataFolder = (item: HubDataItem) => {
    if (item.type === "folder") {
      navigateDataFolder(item.id);
    } else {
      openDataItem(item);
    }
  };

  const handleShare = (item: HubDataItem) => {
    setSelectedDataItem(item);
    setShareEmail("");
    setSharePermission("Can view");
    setLinkCopied(false);
    setShareModalOpen(true);
  };

  const copyShareLink = () => {
    if (!selectedDataItem) {
      return;
    }
    navigator.clipboard.writeText(`https://hub.example.com/share/${selectedDataItem.id}`).catch(() => {});
    setLinkCopied(true);
    window.setTimeout(() => setLinkCopied(false), 1500);
  };

  const addShareRecipient = () => {
    if (!selectedDataItem || !shareEmail.trim()) {
      return;
    }
    const recipient = shareEmail.trim();
    const nextSharedWith = selectedDataItem.sharedWith.includes(recipient)
      ? selectedDataItem.sharedWith
      : [...selectedDataItem.sharedWith, recipient];
    updateDataItem(selectedDataItem.id, { sharedWith: nextSharedWith });
    setShareEmail("");
    showFeedback(`${selectedDataItem.name} shared with ${recipient}`);
  };

  const removeShareRecipient = (recipient: string) => {
    if (!selectedDataItem) {
      return;
    }

    const nextSharedWith = selectedDataItem.sharedWith.filter((person) => person !== recipient);
    updateDataItem(selectedDataItem.id, { sharedWith: nextSharedWith });
    showFeedback(`${recipient} removed from ${selectedDataItem.name}`);
  };

  const handleRenameOpen = (item: HubDataItem) => {
    setSelectedDataItem(item);
    setRenameValue(item.name);
    setRenameModalOpen(true);
  };

  const handleRenameSave = () => {
    if (!selectedDataItem || !renameValue.trim()) {
      return;
    }
    updateDataItem(selectedDataItem.id, { name: renameValue.trim() });
    setRenameModalOpen(false);
    showFeedback("Name updated");
  };

  const handleDelete = (item: HubDataItem) => {
    const idsToDelete = new Set<number>();
    const collectDescendants = (parentId: number) => {
      idsToDelete.add(parentId);
      dataItems
        .filter((entry) => entry.parentId === parentId)
        .forEach((child) => collectDescendants(child.id));
    };
    collectDescendants(item.id);

    setDataItems((current) => recomputeFolderCounts(current.filter((entry) => !idsToDelete.has(entry.id))));
    if (selectedDataItem?.id === item.id) {
      setSelectedDataItem(null);
      setDetailsModalOpen(false);
      setShareModalOpen(false);
      setRenameModalOpen(false);
    }
    if (currentDataFolderId !== null && idsToDelete.has(currentDataFolderId)) {
      setCurrentDataFolderId(item.parentId);
    }
    showFeedback(`${item.name} removed`);
  };

  const handleDuplicate = (item: HubDataItem) => {
    const duplicate: HubDataItem = {
      ...item,
      id: Date.now(),
      name: `${item.name} Copy`,
      date: "2026-04-28",
    };
    setDataItems((current) => recomputeFolderCounts([duplicate, ...current]));
    showFeedback(`${item.name} duplicated`);
  };

  const handleDownload = (item: HubDataItem) => {
    showFeedback(`${item.type === "folder" ? "Folder" : "File"} ready: ${item.name}`);
  };

  const [isCopyingFigma, setIsCopyingFigma] = useState(false);
  const isCopyingFigmaRef = useRef(false);

  const handleCopyToFigma = async () => {
    if (isCopyingFigmaRef.current) {
      return;
    }

    isCopyingFigmaRef.current = true;

    try {
      setIsCopyingFigma(true);

      await document.fonts?.ready.catch(() => undefined);

      const root = document.getElementById("root") ?? document.body;
      const width = Math.ceil(window.innerWidth);
      const height = Math.ceil(window.innerHeight);

      const inlined = inlineComputedStyles(root);
      const cloneDoc = new DOMParser().parseFromString(inlined, "text/html");
      const clone = cloneDoc.body.firstElementChild;

      if (!clone) {
        throw new Error("Could not create native Figma clone.");
      }

      prepareNativeFigmaClone(clone, root, width, height);
      const payload = await generateFromElement(clone, {
        topLayerName: `Hub Native Figma Screen ${width}x${height}`,
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([payload], { type: "text/html" }),
        }),
      ]);

      toast.success("Figma layers copied. Paste into Figma (Cmd+V / Ctrl+V).");
    } catch (err) {
      console.error('Failed to copy to figma', err);
      toast.error("Failed to copy native Figma layers.");
    } finally {
      isCopyingFigmaRef.current = false;
      setIsCopyingFigma(false);
    }
  };

  const createFolder = () => {
    if (!folderName.trim()) {
      return;
    }
    const newFolder: HubDataItem = {
      id: Date.now(),
      name: folderName.trim(),
      size: "0 MB",
      date: "2026-04-28",
      type: "folder",
      items: 0,
      project: folderProject,
      owner: "You",
      sharedWith: [],
      parentId: currentDataFolderId,
    };
    setDataItems((current) => recomputeFolderCounts([newFolder, ...current]));
    setCreateFolderModalOpen(false);
    setFolderName("");
    setFolderProject("Downtown Tower Complex");
    showFeedback(`Folder created: ${newFolder.name}`);
  };

  const simulateUpload = (itemsToAdd: HubDataItem[], label: string, type: "file" | "folder") => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadType(type);
    setUploadedItemName(label);
    const interval = window.setInterval(() => {
      setUploadProgress((current) => {
        if (current >= 100) {
          window.clearInterval(interval);
          window.setTimeout(() => {
            setIsUploading(false);
            setUploadModalOpen(false);
            setSuccessModalOpen(true);
            setDataItems((existing) => recomputeFolderCounts([...itemsToAdd, ...existing]));
          }, 250);
          return 100;
        }
        return current + 10;
      });
    }, 140);
  };

  const handleSelectedUpload = (fileList: FileList | null, type: "file" | "folder") => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    if (type === "folder") {
      const files = Array.from(fileList);
      const folderLabel = files[0].webkitRelativePath ? files[0].webkitRelativePath.split("/")[0] : "Uploaded Folder";
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
      simulateUpload([
        {
          id: Date.now(),
          name: folderLabel,
          size: formatFileSize(totalBytes),
          date: "2026-04-28",
          type: "folder",
          items: files.length,
          project: uploadProject,
          owner: "You",
          sharedWith: [],
          parentId: currentDataFolderId,
        },
      ], folderLabel, "folder");
      return;
    }

    const itemsToAdd = Array.from(fileList).map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: formatFileSize(file.size),
      date: "2026-04-28",
      type: "file" as const,
      project: uploadProject,
      owner: "You",
      sharedWith: [],
      parentId: currentDataFolderId,
    }));
    const uploadLabel = itemsToAdd.length === 1 ? itemsToAdd[0].name : `${itemsToAdd.length} files`;
    simulateUpload(itemsToAdd, uploadLabel, "file");
  };

  const filteredHubProjects = useMemo(() => {
    const query = projectSearchQuery.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesPhase = projectPhaseFilter === "All" || project.phase === projectPhaseFilter;
      const matchesQuery =
        query === "" ||
        project.name.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.manager.toLowerCase().includes(query) ||
        project.phase.toLowerCase().includes(query);
      return matchesPhase && matchesQuery;
    });
  }, [projectPhaseFilter, projectSearchQuery, projects]);

  const openProjectDetails = (project: HubProject) => {
    setSelectedHubProject(project);
    setProjectDetailsOpen(true);
  };

  const askProjectAi = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const lower = trimmed.toLowerCase();
    const delayedProjects = filteredHubProjects.filter((project) => project.status === "Delayed");
    const completedProjects = filteredHubProjects.filter((project) => project.status === "Completed");
    const preconstructionProjects = filteredHubProjects.filter((project) => project.phase === "Pre-Construction");

    if (lower.includes("delay") || lower.includes("risk")) {
      setProjectAiResponse(
        delayedProjects.length > 0
          ? `Risk summary: ${delayedProjects.map((project) => `${project.name} (${project.phase})`).join(", ")} need attention. The main pattern is schedule slippage around coordination and supply dependencies.`
          : "Current filtered portfolio does not show delayed projects. The active risk profile is low in this view."
      );
      return;
    }

    if (lower.includes("phase") || lower.includes("preconstruction")) {
      setProjectAiResponse(
        `Phase summary: ${preconstructionProjects.length} pre-construction project(s), ${filteredHubProjects.filter((project) => project.phase === "Construction").length} construction project(s), ${filteredHubProjects.filter((project) => project.phase === "Site Survey").length} site survey project(s), ${filteredHubProjects.filter((project) => project.phase === "Digital Twin").length} digital twin project(s), and ${filteredHubProjects.filter((project) => project.phase === "Facility Management").length} facility management project(s) match the current filters.`
      );
      return;
    }

    if (lower.includes("complete") || lower.includes("completed")) {
      setProjectAiResponse(
        completedProjects.length > 0
          ? `Completed focus: ${completedProjects.map((project) => project.name).join(", ")} are in closeout or live operations mode. You can use this view to benchmark handover quality and maintenance planning.`
          : "There are no completed projects in the current filtered set."
      );
      return;
    }

    const topProject = filteredHubProjects[0];
    setProjectAiResponse(
      topProject
        ? `Quick project insight: ${topProject.name} is the top visible match. It is in ${topProject.phase}, sits at ${topProject.progress}% progress, and is managed by ${topProject.manager}.`
        : "No projects match the current filters, so there is nothing to analyze right now."
    );
  };

  const materialProcurementStages = [
    { id: 1, name: "Requirement Planning", status: "active", count: 8 },
    { id: 2, name: "Purchase Requisition", status: "pending", count: 12 },
    { id: 3, name: "Approval Workflow", status: "pending", count: 7 },
    { id: 4, name: "Vendor Management", status: "pending", count: 24 },
    { id: 5, name: "RFQ / Tendering", status: "pending", count: 5 },
    { id: 6, name: "Bid Evaluation", status: "pending", count: 3 },
    { id: 7, name: "Purchase Order", status: "pending", count: 45 },
    { id: 8, name: "Delivery Tracking", status: "pending", count: 23 },
    { id: 9, name: "Goods Receipt", status: "pending", count: 18 },
    { id: 10, name: "Invoice & Payment", status: "pending", count: 15 },
  ];

  const resourceProcurementStages = [
    { id: 1, name: "Resource Planning", status: "active", count: 5 },
    { id: 2, name: "Requirement Analysis", status: "pending", count: 8 },
    { id: 3, name: "Resource Sourcing", status: "pending", count: 12 },
    { id: 4, name: "Vendor Selection", status: "pending", count: 6 },
    { id: 5, name: "Contract Negotiation", status: "pending", count: 4 },
    { id: 6, name: "Onboarding", status: "pending", count: 10 },
    { id: 7, name: "Allocation", status: "pending", count: 15 },
    { id: 8, name: "Performance Review", status: "pending", count: 20 },
  ];

  const attendanceData = [
    { date: "2026-04-28", present: 142, absent: 14, leave: 8, total: 164 },
    { date: "2026-04-27", present: 138, absent: 16, leave: 10, total: 164 },
    { date: "2026-04-26", present: 145, absent: 12, leave: 7, total: 164 },
  ];

  const resourceUtilization = [
    { resource: "Site Workers", allocated: 142, available: 164, utilization: 87 },
    { resource: "Engineers", allocated: 22, available: 28, utilization: 79 },
    { resource: "Equipment", allocated: 16, available: 20, utilization: 80 },
    { resource: "Vehicles", allocated: 12, available: 15, utilization: 80 },
  ];

  const projectDocChips: ProjectDocChip[] = ["All", "PO", "BOQ", "BOM", "Quotation", "Invoices", "Drawings", "Contracts", "Reports"];

  const inferProjectDocTypes = (project: HubProject, docs: HubDataItem[]): ProjectDocChip[] => {
    const types = new Set<ProjectDocChip>();
    const text = `${project.name} ${project.phase} ${docs.map((doc) => doc.name).join(" ")}`.toLowerCase();

    if (text.includes("vendor") || text.includes("proposal") || text.includes("submission")) types.add("Quotation");
    if (text.includes("budget") || text.includes("payment") || text.includes("invoice")) types.add("Invoices");
    if (text.includes("contract") || text.includes("agreement") || text.includes("insurance")) types.add("Contracts");
    if (text.includes("drawing") || text.includes("plan") || text.includes("model") || text.includes("bim") || text.includes("dwg")) types.add("Drawings");
    if (text.includes("report") || text.includes("safety") || text.includes("clash")) types.add("Reports");
    if (project.phase === "Pre-Construction" || text.includes("specification")) types.add("BOQ");
    if (text.includes("material") || text.includes("specification")) types.add("BOM");
    if (text.includes("procurement") || text.includes("vendor") || project.phase === "Construction") types.add("PO");

    if (types.size === 0) {
      types.add("Drawings");
    }

    return Array.from(types);
  };

  const projectDocumentRows = projects
    .map((project) => {
      const docs = dataItems.filter((item) => item.project === project.name);
      const sharedDocs = docs.filter((item) => item.sharedWith.length > 0).length;
      const latestDoc = docs.sort((a, b) => b.date.localeCompare(a.date))[0];
      return {
        project,
        total: docs.length,
        files: docs.filter((item) => item.type === "file").length,
        folders: docs.filter((item) => item.type === "folder").length,
        shared: sharedDocs,
        latest: latestDoc?.date ?? "-",
        docTypes: inferProjectDocTypes(project, docs),
      };
    })
    .filter((row) => {
      const query = dataSearchQuery.trim().toLowerCase();
      const matchesQuery = !query || row.project.name.toLowerCase().includes(query) || row.project.phase.toLowerCase().includes(query);
      const matchesChip = projectDocChip === "All" || row.docTypes.includes(projectDocChip);
      return matchesQuery && matchesChip;
    });

  const sharedDataItems = dataItems
    .filter((item) => item.sharedWith.length > 0)
    .filter((item) => {
      const query = dataSearchQuery.trim().toLowerCase();
      return !query || item.name.toLowerCase().includes(query) || item.project.toLowerCase().includes(query) || item.sharedWith.join(" ").toLowerCase().includes(query);
    });

  const uploadRows = [...dataItems]
    .filter((item) => item.owner === "You" || item.owner === "Procurement" || item.owner === "BIM Team")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 8)
    .filter((item) => {
      const query = dataSearchQuery.trim().toLowerCase();
      return !query || item.name.toLowerCase().includes(query) || item.project.toLowerCase().includes(query);
    });

  const collaboratorTones = [
    "bg-blue-50 text-blue-700 ring-blue-100",
    "bg-emerald-50 text-emerald-700 ring-emerald-100",
    "bg-orange-50 text-orange-700 ring-orange-100",
    "bg-cyan-50 text-cyan-700 ring-cyan-100",
    "bg-violet-50 text-violet-700 ring-violet-100",
  ];

  const getCollaboratorInitials = (person: string) => {
    const parts = person.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return "?";
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const getCollaboratorTone = (person: string) => {
    const index = person.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % collaboratorTones.length;
    return collaboratorTones[index];
  };

  const catalogItemsData = [
    { id: 1, type: "materials", name: "Structural Concrete Mix C30", spec: "Grade C30/37, 28-day strength", supplier: "Cemex", status: "Approved", updated: "2026-04-25", owner: "Structures", leadTime: "1-2 days", category: "Concrete", image: "https://images.unsplash.com/photo-1590486803833-1c5dc8ddd4c8?w=500&q=80" },
    { id: 2, type: "materials", name: "Rebar Grade 60 (500MPa)", spec: "Epoxy coated, 12mm-32mm sizes", supplier: "Nucor", status: "Approved", updated: "2026-04-24", owner: "Structures", leadTime: "3-4 days", category: "Steel", image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=500&q=80" },
    { id: 3, type: "materials", name: "Acoustic Ceiling Tiles 2x2", spec: "NRC 0.75, White finish", supplier: "Armstrong", status: "Under Review", updated: "2026-04-20", owner: "Architecture", leadTime: "2 weeks", category: "Finishes", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&q=80" },
    { id: 4, type: "materials", name: "Porcelain Floor Tile 600x600", spec: "Matte finish, R10 slip rating", supplier: "RAK Ceramics", status: "Approved", updated: "2026-04-18", owner: "Architecture", leadTime: "4 weeks", category: "Finishes", image: "https://images.unsplash.com/photo-1588631317075-8bd0db721869?w=500&q=80" },
    { id: 5, type: "materials", name: "Copper Piping Type L", spec: "Hard drawn, 1/2\" to 2\"", supplier: "Mueller", status: "Approved", updated: "2026-04-15", owner: "MEP", leadTime: "1 week", category: "Plumbing", image: "https://images.unsplash.com/photo-1621252179027-94459d278660?w=500&q=80" },
    { id: 11, type: "equipment", name: "Tower Crane 12-Ton", spec: "Max jib 60m, Hook height 50m", supplier: "Liebherr", status: "Approved", updated: "2026-04-22", owner: "Plant", rate: "$1500/day", category: "Lifting", image: "https://images.unsplash.com/photo-1541888086925-0c13d4cc4322?w=500&q=80" },
    { id: 12, type: "equipment", name: "Excavator 20-Ton", spec: "Crawler type, 1.2m3 bucket", supplier: "Caterpillar", status: "Approved", updated: "2026-04-21", owner: "Plant", rate: "$800/day", category: "Earthmoving", image: "https://images.unsplash.com/photo-1572093551061-00624bb8840b?w=500&q=80" },
    { id: 13, type: "equipment", name: "Scissor Lift 19ft", spec: "Electric, Indoor use", supplier: "JLG", status: "Approved", updated: "2026-04-19", owner: "Plant", rate: "$120/day", category: "Access", image: "https://images.unsplash.com/photo-1580982544259-7a5446f2b46d?w=500&q=80" },
    { id: 14, type: "equipment", name: "Concrete Pump Truck", spec: "32m boom, 100m3/hr", supplier: "Putzmeister", status: "Under Review", updated: "2026-04-15", owner: "Plant", rate: "$1200/day", category: "Concrete", image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=500&q=80" },
    { id: 15, type: "equipment", name: "Diesel Generator 500kVA", spec: "Silent type, Prime power", supplier: "Cummins", status: "Approved", updated: "2026-04-10", owner: "Plant", rate: "$300/day", category: "Power", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&q=80" },
    { id: 21, type: "vendors", name: "Apex Structural Steel", spec: "Steel fabrication and erection", supplier: "N/A", status: "Approved", updated: "2026-04-26", owner: "Procurement", rating: "4.8/5", category: "Subcontractor", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&q=80" },
    { id: 22, type: "vendors", name: "Global MEP Solutions", spec: "Turnkey mechanical & electrical", supplier: "N/A", status: "Approved", updated: "2026-04-24", owner: "Procurement", rating: "4.5/5", category: "Subcontractor", image: "https://images.unsplash.com/photo-1542621323-23e2fb3eb7db?w=500&q=80" },
    { id: 23, type: "vendors", name: "Prime Facade Systems", spec: "Unitized curtain wall, Glazing", supplier: "N/A", status: "Under Review", updated: "2026-04-20", owner: "Procurement", rating: "Pending", category: "Subcontractor", image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&q=80" },
    { id: 24, type: "vendors", name: "Elite Interiors Ltd", spec: "Drywall, ceilings, flooring", supplier: "N/A", status: "Approved", updated: "2026-04-18", owner: "Procurement", rating: "4.2/5", category: "Subcontractor", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=500&q=80" },
    { id: 25, type: "vendors", name: "Rapid Earthworks", spec: "Excavation, grading, trenching", supplier: "N/A", status: "Approved", updated: "2026-04-12", owner: "Procurement", rating: "4.6/5", category: "Subcontractor", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&q=80" },
    { id: 31, type: "standards", name: "Quality Assurance Checklist", spec: "Standard template for QA/QC", supplier: "N/A", status: "Approved", updated: "2026-04-27", owner: "Quality", typeDoc: "Template", category: "QA/QC", image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&q=80" },
    { id: 32, type: "standards", name: "Site Safety Protocol v2", spec: "Mandatory safety procedures", supplier: "N/A", status: "Approved", updated: "2026-04-25", owner: "HSE", typeDoc: "Manual", category: "Safety", image: "https://images.unsplash.com/photo-1584432743501-7d5c28bbba3e?w=500&q=80" },
    { id: 33, type: "standards", name: "Daily Progress Report", spec: "Standard DPR template", supplier: "N/A", status: "Approved", updated: "2026-04-22", owner: "PMO", typeDoc: "Template", category: "Reporting", image: "https://images.unsplash.com/photo-1554774853-719586f82d77?w=500&q=80" },
    { id: 34, type: "standards", name: "BIM Execution Plan", spec: "BEP baseline template", supplier: "N/A", status: "Approved", updated: "2026-04-15", owner: "BIM Team", typeDoc: "Template", category: "BIM", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80" },
    { id: 35, type: "standards", name: "Concrete Pour Card", spec: "Pre-pour inspection checklist", supplier: "N/A", status: "Under Review", updated: "2026-04-10", owner: "Quality", typeDoc: "Checklist", category: "QA/QC", image: "https://images.unsplash.com/photo-1586282391129-76a6df230234?w=500&q=80" },
  ];
  const customCatalogItemsData: typeof catalogItemsData = [];
  const catalogLibraryItems = [...catalogItemsData, ...customCatalogItemsData];

  const handleCreateCustomCatalog = () => {
    const name = createCatalogDraft.name.trim();
    const description = createCatalogDraft.description.trim();
    if (!name) {
      showFeedback("Catalog name is required");
      return;
    }
    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "custom-catalog";
    const id = `custom-${baseSlug}-${Date.now().toString(36)}`;
    const createdAt = new Date().toISOString().slice(0, 10);
    const nextCatalog = {
      id,
      title: name,
      subtitle: description || `${createCatalogDraft.template} tracking library`,
      template: createCatalogDraft.template,
      createdAt,
    };
    setCustomCatalogs((current) => [nextCatalog, ...current]);
    setCreateCatalogDraft({ name: "", description: "", template: "Material Tracking" });
    setCatalogDetailsTab("Overview");
    setCatalogFilters({});
    setCatalogSearchQuery("");
    setCreateCatalogModalOpen(false);
    selectHubModule("catalog", id);
    showFeedback("Custom catalog created successfully");
  };

  const hubModules: Array<{
    id: HubModule;
    label: string;
    subhead: string;
    icon: typeof Database;
    defaultSection: string;
    accent: string;
    count: string;
  }> = [
    {
      id: "data",
      label: "Data",
      subhead: "Files, folders, drawings",
      icon: Database,
      defaultSection: "home",
      accent: "bg-blue-50 text-blue-600 border-blue-100",
      count: `${dataItems.filter((item) => item.parentId === null).length} items`,
    },
    {
      id: "catalog",
      label: "Catalog",
      subhead: "Libraries, references, standards",
      icon: Package,
      defaultSection: "home",
      accent: "bg-amber-50 text-amber-600 border-amber-100",
      count: "4 libraries",
    },
    {
      id: "procurement",
      label: "Procurement",
      subhead: "Materials, resources, equipment",
      icon: ShoppingCart,
      defaultSection: "home",
      accent: "bg-emerald-50 text-emerald-600 border-emerald-100",
      count: "26 active",
    },
    {
      id: "vendor",
      label: "Vendor",
      subhead: "Partners, suppliers, scorecards",
      icon: Truck,
      defaultSection: "material-vendor",
      accent: "bg-orange-50 text-orange-600 border-orange-100",
      count: "48 vendors",
    },
    {
      id: "resources",
      label: "Resources",
      subhead: "Teams, access, payroll",
      icon: Users,
      defaultSection: "organization",
      accent: "bg-cyan-50 text-cyan-600 border-cyan-100",
      count: "164 people",
    },
    {
      id: "finance",
      label: "Finance",
      subhead: "Budget, invoices, cash flow",
      icon: DollarSign,
      defaultSection: "budgeting",
      accent: "bg-violet-50 text-violet-600 border-violet-100",
      count: "$2.4M",
    },
  ];

  const selectHubModule = (module: HubModule, section: string) => {
    setMode(`hub-${module}` as Parameters<typeof setMode>[0]);
    navigate(`/dashboard?module=${module}&section=${section}`);
  };

  const equipmentProcurementStages = [
    { id: 1, name: "Need Assessment", status: "active", count: 4 },
    { id: 2, name: "Rental vs Purchase", status: "pending", count: 3 },
    { id: 3, name: "Vendor Quote", status: "pending", count: 9 },
    { id: 4, name: "Technical Review", status: "pending", count: 5 },
    { id: 5, name: "Mobilization", status: "pending", count: 6 },
    { id: 6, name: "Site Handover", status: "pending", count: 2 },
  ];

  const procurementFlowMeta = {
    material: {
      title: "Material Procurement",
      subtitle: "Plan, approve, source, receive, and close material orders.",
      stats: ["8 requirements", "12 PRs", "5 RFQs", "18 GRNs"],
      stages: materialProcurementStages,
    },
    resource: {
      title: "Resource Procurement",
      subtitle: "Source manpower and service teams from request to performance review.",
      stats: ["5 plans", "12 sourcing", "10 onboarding", "20 reviews"],
      stages: resourceProcurementStages,
    },
    equipment: {
      title: "Equipment Procurement",
      subtitle: "Manage equipment demand, vendor quotes, mobilization, and site handover.",
      stats: ["4 needs", "9 quotes", "6 mobilizing", "2 handovers"],
      stages: equipmentProcurementStages,
    },
  };

  const activeProcurementMeta = procurementFlowMeta[activeProcurementFlow];
  const activeProcurementSection = searchParams.get("module") === "procurement"
    ? searchParams.get("section") ?? "home"
    : "home";
  const isProcurementHome = activeProcurementSection === "home" || !["material", "resource", "equipment"].includes(activeProcurementSection);
  const procurementLandingStats = [
    {
      label: "Active Pipeline",
      value: String([...materialProcurementStages, ...resourceProcurementStages, ...equipmentProcurementStages].reduce((sum, stage) => sum + stage.count, 0)),
      sublabel: "open procurement records",
      icon: Activity,
      tone: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      label: "Approval Queue",
      value: "18",
      sublabel: "waiting for action",
      icon: Clock,
      tone: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "RFQ / Quotes",
      value: "17",
      sublabel: "under commercial review",
      icon: FileText,
      tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
    },
    {
      label: "Committed Value",
      value: "$4.8M",
      sublabel: "PO and hire value",
      icon: DollarSign,
      tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
  ];
  const procurementLandingFlows = [
    {
      id: "material" as ProcurementFlow,
      title: procurementFlowMeta.material.title,
      subtitle: procurementFlowMeta.material.subtitle,
      icon: Package,
      accent: "bg-emerald-50 text-emerald-700 border-emerald-100",
      value: "$3.1M",
      health: 76,
      total: materialProcurementStages.reduce((sum, stage) => sum + stage.count, 0),
      stats: procurementFlowMeta.material.stats,
    },
    {
      id: "resource" as ProcurementFlow,
      title: procurementFlowMeta.resource.title,
      subtitle: procurementFlowMeta.resource.subtitle,
      icon: Users,
      accent: "bg-blue-50 text-blue-700 border-blue-100",
      value: "$980K",
      health: 68,
      total: resourceProcurementStages.reduce((sum, stage) => sum + stage.count, 0),
      stats: procurementFlowMeta.resource.stats,
    },
    {
      id: "equipment" as ProcurementFlow,
      title: procurementFlowMeta.equipment.title,
      subtitle: procurementFlowMeta.equipment.subtitle,
      icon: Truck,
      accent: "bg-orange-50 text-orange-700 border-orange-100",
      value: "$720K",
      health: 61,
      total: equipmentProcurementStages.reduce((sum, stage) => sum + stage.count, 0),
      stats: procurementFlowMeta.equipment.stats,
    },
  ];
  const procurementQueueItems = [
    { label: "Tower A rebar package", meta: "Bid evaluation", owner: "Commercial", status: "Due today", tone: "bg-rose-50 text-rose-700" },
    { label: "MEP manpower ramp-up", meta: "Vendor selection", owner: "HR Ops", status: "2 days", tone: "bg-amber-50 text-amber-700" },
    { label: "Concrete pump mobilization", meta: "Technical review", owner: "Plant team", status: "3 days", tone: "bg-blue-50 text-blue-700" },
  ];

  const vendorRows = [
    { name: "Apex Cement Supply", type: "Material Vendor", rating: "4.8", orders: 34, status: "Approved" },
    { name: "Urban Workforce Co.", type: "Resource Vendor", rating: "4.6", orders: 19, status: "Review" },
    { name: "Metro Steel Traders", type: "Supplier", rating: "4.7", orders: 27, status: "Approved" },
    { name: "Prime MEP Services", type: "Resource Vendor", rating: "4.5", orders: 12, status: "Approved" },
  ];

  const resourceRows = [
    { team: "Structure Team", lead: "Ravi Kumar", members: 42, access: "Active", payroll: "Ready" },
    { team: "MEP Team", lead: "Anika Shah", members: 28, access: "Active", payroll: "Pending" },
    { team: "Survey Team", lead: "Farhan Ali", members: 16, access: "Limited", payroll: "Ready" },
    { team: "Safety Team", lead: "Meera Joshi", members: 12, access: "Active", payroll: "Ready" },
  ];

  const financeRows = [
    { item: "Downtown Tower Complex", budget: "$5.2M", actual: "$3.9M", invoice: "$420K", status: "On Track" },
    { item: "Riverside Residential", budget: "$3.8M", actual: "$1.1M", invoice: "$160K", status: "Review" },
    { item: "Tech Park Phase 2", budget: "$8.5M", actual: "$5.6M", invoice: "$710K", status: "On Track" },
    { item: "Metro Mall Expansion", budget: "$4.2M", actual: "$3.7M", invoice: "$285K", status: "Hold" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className={`w-full ${activeSection === "resources" ? "px-5 pb-6 pt-2" : "px-8 py-10"}`}>
        {/* Hub Launcher */}
        {activeSection === "home" && (
          <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col justify-center">
            <div className="mb-10 text-center">
              <h1 className="text-5xl font-medium tracking-normal text-gray-950">Hub</h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-500">
                One place to open your project operations, documents, vendors, people, and finance modules.
              </p>
            </div>

            <div className="mb-8 flex justify-center">
              <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setActiveHomeTab("modules")}
                  className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                    activeHomeTab === "modules"
                      ? "bg-gray-100 text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Modules
                </button>
                <button
                  onClick={() => setActiveHomeTab("insights")}
                  className={`rounded-md px-6 py-2 text-sm font-medium transition-all ${
                    activeHomeTab === "insights"
                      ? "bg-gray-100 text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Insights
                </button>
              </div>
            </div>

            {activeHomeTab === "modules" ? (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
                  {hubModules.map((module) => {
                    const Icon = module.icon;
                    return (
                      <button
                        key={module.id}
                        onClick={() => selectHubModule(module.id, module.defaultSection)}
                        className="group rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
                      >
                        <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border ${module.accent}`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <h2 className="text-lg text-gray-950">{module.label}</h2>
                        <p className="mt-1 min-h-10 text-sm text-gray-500">{module.subhead}</p>
                        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                          <span className="text-xs text-gray-400">{module.count}</span>
                          <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mx-auto mt-10 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
                  {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
                        <div className="mb-3 flex items-center gap-2 text-gray-500">
                          <Icon className="h-4 w-4" />
                          <span className="text-xs">{stat.label}</span>
                        </div>
                        <p className="text-xl text-gray-950">{stat.value}</p>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 mx-auto w-full max-w-4xl duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 text-lg font-medium text-gray-900">Project Status</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={insightsPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {insightsPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-6 text-lg font-medium text-gray-900">Budget vs Spend ($K)</h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={insightsBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                          <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: '20px' }} />
                          <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                          <Bar dataKey="spend" name="Spend" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Data Section - Enhanced Files & Folders */}
        {activeSection === "data" && (
          <div>
            {activeDataSubsection === "home" && (
              <div className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-b from-white via-white to-sky-50/70 px-8 py-14">
                <div className="pointer-events-none absolute inset-x-12 bottom-0 h-48 rounded-full bg-[radial-gradient(circle_at_left,rgba(236,72,153,0.18),transparent_35%),radial-gradient(circle_at_right,rgba(14,165,233,0.18),transparent_35%)]" />
                <div className="relative">
                  <div className="mx-auto mb-10 max-w-2xl text-center">
                    <h2 className="text-4xl text-blue-700">Datas</h2>
                    <p className="mt-3 text-sm text-gray-500">
                      One place to manage your project operations, drawings, models, site capture, issues, and schedules.
                    </p>
                  </div>

                  <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5">
                    {dataLandingCards.map((card) => {
                      const CardIcon = card.icon;
                      return (
                        <button
                          key={card.id}
                          onClick={() => selectHubModule("data", card.id)}
                          className="group rounded-2xl border border-blue-100 bg-white/90 p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                        >
                          <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${card.accent}`}>
                            <CardIcon className="h-5 w-5" />
                          </div>
                          <h3 className="text-lg text-gray-950">{card.title}</h3>
                          <p className="mt-1 min-h-10 text-xs text-gray-500">{card.subtitle}</p>
                          <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400">
                            <span>{card.count}</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeDataSubsection !== "home" && (
            <div className="mb-5 border-b border-gray-100 pb-4">
              <div className="flex items-center justify-between gap-4 overflow-x-auto">
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`w-10 h-10 ${isPlanningSection ? 'bg-blue-600' : 'bg-gray-900'} rounded-xl flex items-center justify-center shrink-0`}>
                    <DataHeaderIcon className="w-5 h-5 text-white" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 -ml-2 rounded-lg transition-colors outline-none">
                        <h3 className="text-2xl whitespace-nowrap">{globalSelectedProject}</h3>
                        <ChevronDown className="w-5 h-5 text-gray-400 mt-1" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[320px] p-2">
                      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg mb-2">
                        <button
                          onClick={(e) => { e.preventDefault(); setProjectDropdownTab("my"); }}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${projectDropdownTab === "my" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          My Projects
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); setProjectDropdownTab("shared"); }}
                          className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${projectDropdownTab === "shared" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                          Shared
                        </button>
                      </div>
                      <div className="max-h-[280px] overflow-y-auto">
                        {(projectDropdownTab === "my" ? myDummyProjects : sharedDummyProjects).map((proj) => (
                          <DropdownMenuItem
                            key={proj}
                            onClick={() => setGlobalSelectedProject(proj)}
                            className="flex items-center justify-between py-2.5 px-3 cursor-pointer rounded-lg hover:bg-gray-50 data-[highlighted]:bg-gray-50"
                          >
                            <span className="text-sm font-medium text-gray-700">{proj}</span>
                            {globalSelectedProject === proj && <Check className="w-4 h-4 text-blue-600" />}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {isPlanningSection && (
                <div className="flex items-center gap-2 shrink-0">
                  <DropdownMenu open={planningAssignOpen} onOpenChange={setPlanningAssignOpen}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="group inline-flex h-11 min-w-[214px] items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-[0_18px_42px_rgba(109,40,217,0.12)] focus:outline-none focus:ring-2 focus:ring-violet-100"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet-600 text-white shadow-sm">
                            <Users className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 text-left">
                            <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-violet-500">
                              Assign
                            </span>
                            <span className="block truncate text-sm font-medium text-slate-950">
                              {selectedPlanningAssigneeCount} selected
                            </span>
                          </span>
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">
                            {selectedPlanningEditCount} edit
                          </span>
                          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="flex max-h-[min(480px,calc(100vh-120px))] w-[372px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_28px_80px_rgba(15,23,42,0.20)]"
                    >
                      <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-violet-600 text-white">
                                <Users className="h-3.5 w-3.5" />
                              </span>
                              <p className="truncate text-sm font-medium text-slate-950">Assign planning access</p>
                            </div>
                            <p className="mt-0.5 truncate text-[11px] text-slate-500">
                              Teams, partners, invites, and permissions.
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full bg-white px-2 text-[10px] font-medium text-violet-700 shadow-sm ring-1 ring-violet-100">
                              {selectedPlanningAssigneeCount} active
                            </span>
                            <span className="inline-flex h-6 items-center whitespace-nowrap rounded-full bg-white px-2 text-[10px] font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
                              {selectedPlanningEditCount} edit
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="min-h-0 flex-1 overflow-y-auto p-2">
                        <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                          {planningAssignTabs.map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              onClick={() => setPlanningAssignTab(tab.id)}
                              className={`flex h-8 items-center justify-center gap-1 rounded-lg text-[11px] font-medium transition-all ${
                                planningAssignTab === tab.id
                                  ? "bg-white text-blue-700 shadow-sm ring-1 ring-blue-100"
                                  : "text-slate-500 hover:text-slate-900"
                              }`}
                            >
                              <span>{tab.label}</span>
                              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                planningAssignTab === tab.id ? "bg-blue-50 text-blue-700" : "bg-white text-slate-400"
                              }`}>
                                {tab.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        {planningAssignTab === "members" && (
                          <div className="mt-2 space-y-2">
                            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-2">
                              <div className="mb-1.5 flex items-center justify-between gap-3">
                                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-blue-600">Invite by email</span>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-blue-700 ring-1 ring-blue-100">Planning</span>
                              </div>
                              <div className="grid grid-cols-[1fr_auto] gap-2">
                                <input
                                  value={planningInviteEmail}
                                  onChange={(event) => setPlanningInviteEmail(event.target.value)}
                                  onKeyDown={(event) => {
                                    event.stopPropagation();
                                    if (event.key === "Enter") {
                                      event.preventDefault();
                                      invitePlanningAssignee();
                                    }
                                  }}
                                  placeholder="name@email.com"
                                  className="h-8 min-w-0 rounded-lg border border-blue-100 bg-white px-3 text-xs text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                />
                                <button
                                  type="button"
                                  onClick={invitePlanningAssignee}
                                  disabled={!planningInviteEmail.trim()}
                                  className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  Invite
                                </button>
                              </div>
                              <div className="mt-1.5 inline-flex rounded-lg bg-white p-0.5 shadow-inner shadow-blue-100/60">
                                {(["edit", "view"] as PlanningPermission[]).map((permission) => (
                                  <button
                                    key={permission}
                                    type="button"
                                    onClick={() => setPlanningInvitePermission(permission)}
                                    className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                                      planningInvitePermission === permission
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-900"
                                    }`}
                                  >
                                    {planningPermissionLabels[permission]}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
                              <div className="mb-1.5 flex items-center justify-between">
                                <p className="text-xs font-medium text-slate-900">Already added</p>
                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">{planningActiveAssignees.length} people</span>
                              </div>
                              {planningActiveAssignees.length > 0 ? (
                                <div className="flex max-h-16 flex-wrap gap-1.5 overflow-y-auto pr-1">
                                  {planningActiveAssignees.map((assignee) => (
                                    <span key={`active-${assignee.id}`} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700">
                                      <span className={`h-2 w-2 rounded-full ${assignee.accent}`} />
                                      <span className="max-w-[140px] truncate">{assignee.name}</span>
                                      <span className="text-slate-400">{planningPermissionLabels[planningAssigneePermissions[assignee.id] ?? "view"]}</span>
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">No one has planning access yet.</p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-2 space-y-1.5">
                          <div className="flex items-center justify-between px-1">
                            <p className="text-xs font-medium text-slate-900">
                              {planningAssignTab === "members" ? "Member teams" : planningAssignTab === "partners" ? "Partner companies" : "Consultants"}
                            </p>
                            <span className="text-[11px] text-slate-400">{currentPlanningAssignRows.length} available</span>
                          </div>
                          {currentPlanningAssignRows.length > 0 ? (
                            currentPlanningAssignRows.map(renderPlanningAssigneeRow)
                          ) : (
                            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">No records in this view.</p>
                          )}
                        </div>
                      </div>

                      <div className="sticky bottom-0 z-10 flex shrink-0 items-center justify-between gap-2 border-t border-slate-100 bg-white px-3 py-2 shadow-[0_-10px_24px_rgba(15,23,42,0.06)]">
                        <button
                          type="button"
                          onClick={() => setPlanningAssignOpen(false)}
                          className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => setPlanningAssignOpen(false)}
                          className="inline-flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Confirm access
                        </button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu open={planningTemplateOpen} onOpenChange={setPlanningTemplateOpen}>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="group inline-flex h-11 min-w-[286px] items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white px-3 shadow-[0_12px_32px_rgba(37,99,235,0.10)] transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-[0_18px_42px_rgba(37,99,235,0.14)] focus:outline-none focus:ring-2 focus:ring-blue-100"
                      >
                        <span className="flex min-w-0 items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
                            <Activity className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 text-left">
                            <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-blue-500">
                              Planning template
                            </span>
                            <span className="block truncate text-sm font-medium text-slate-950">
                              {activePlanningTemplateLabel}
                            </span>
                          </span>
                        </span>
                        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-data-[state=open]:rotate-180" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="flex max-h-[min(480px,calc(100vh-120px))] w-[372px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
                    >
                      <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 px-3 py-2.5">
                        <div className="flex items-start gap-2.5">
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-sm">
                          <Activity className="h-4 w-4 text-white" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-slate-950">Choose template</p>
                          <p className="mt-0.5 truncate text-[11px] font-normal text-slate-500">
                            Start blank or load a ready planning structure.
                          </p>
                        </div>
                      </div>
                      </div>

                      <div className="min-h-0 flex-1 overflow-y-auto p-3">
                        <button
                          type="button"
                          onClick={createNewPlanningTemplate}
                          className="mb-3 flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-medium text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md"
                        >
                          <Plus className="h-4 w-4 text-white" />
                          Create new template
                        </button>
                      <div className="space-y-2">
                        {savedPlanningTemplates.length > 0 && (
                          <>
                            <div className="px-1 pt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                              My templates
                            </div>
                            {savedPlanningTemplates.map((template) => {
                              const selected = planningTemplate === "new" && selectedSavedPlanningTemplateId === template.id;
                              return (
                                <DropdownMenuItem
                                  key={template.id}
                                  onSelect={() => chooseSavedPlanningTemplate(template)}
                                  className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition-all focus:bg-blue-50 ${
                                    selected ? "border-blue-200 bg-blue-50/70 shadow-sm" : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                                  }`}
                                >
                                  <span className="flex min-w-0 items-center gap-3">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                                      <FolderPlus className="h-4 w-4 text-white" strokeWidth={2.4} />
                                    </span>
                                    <span className="min-w-0 text-left">
                                      <span className={`block truncate text-sm font-medium leading-5 ${selected ? "text-blue-700" : "text-slate-800"}`}>
                                        {template.label}
                                      </span>
                                      <span className="mt-0.5 block truncate text-xs font-normal leading-4 text-slate-500">
                                        {template.description}
                                      </span>
                                    </span>
                                  </span>
                                  {selected && (
                                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
                                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                    </span>
                                  )}
                                </DropdownMenuItem>
                              );
                            })}
                          </>
                        )}

                        {(() => {
                          const selected = planningTemplate === "new" && !selectedSavedPlanningTemplateId;
                          const templateVisual = planningTemplateVisuals.new;
                          const TemplateIcon = templateVisual.icon;
                          return (
                            <DropdownMenuItem
                              key={blankPlanningTemplate.value}
                              onSelect={(event) => {
                                event.preventDefault();
                                choosePlanningTemplate("new");
                              }}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition-all focus:bg-blue-50 ${
                                selected ? "border-blue-200 bg-blue-50/70 shadow-sm" : "border-blue-100 bg-blue-50/45 hover:bg-blue-50"
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${templateVisual.tone}`}>
                                  <TemplateIcon className="h-4 w-4 text-white" strokeWidth={2.5} />
                                </span>
                                <span className="min-w-0 text-left">
                                  <span className="block truncate text-sm font-medium leading-5 text-slate-950">
                                    {customPlanningTemplateName !== "New blank template" ? customPlanningTemplateName : blankPlanningTemplate.label}
                                  </span>
                                  <span className="mt-0.5 block text-xs font-normal leading-4 text-slate-500">
                                    {blankPlanningTemplate.description}
                                  </span>
                                </span>
                              </span>
                              {selected && (
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
                                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                </span>
                              )}
                            </DropdownMenuItem>
                          );
                        })()}

                        <div className="px-1 pt-2 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                          Ready templates
                        </div>
                        {compactPresetPlanningTemplates.map((template) => {
                          const selected = planningTemplate === template.value;
                          const templateVisual = planningTemplateVisuals[template.value];
                          const TemplateIcon = templateVisual.icon;
                          return (
                            <DropdownMenuItem
                              key={template.value}
                              onSelect={() => choosePlanningTemplate(template.value)}
                              className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3 py-2.5 transition-all focus:bg-blue-50 ${
                                selected ? "border-blue-200 bg-blue-50/70 shadow-sm ring-1 ring-blue-100" : "border-transparent bg-white hover:border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <span className="flex min-w-0 items-center gap-3">
                                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-2xl ${templateVisual.tone}`}>
                                  <TemplateIcon className="h-4 w-4 text-white" strokeWidth={2.4} />
                                </span>
                                <span className="min-w-0 text-left">
                                  <span className={`block truncate text-sm font-medium leading-5 ${selected ? "text-blue-700" : "text-slate-800"}`}>
                                    {template.label}
                                  </span>
                                  <span className={`mt-0.5 block truncate text-xs font-normal leading-4 ${selected ? "text-blue-500" : "text-slate-500"}`}>
                                    {template.description}
                                  </span>
                                </span>
                              </span>
                              {selected && (
                                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
                                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                </span>
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                        <DropdownMenuItem
                          onSelect={(event) => {
                            event.preventDefault();
                            openPlanningTemplateExplorer();
                          }}
                          className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2.5 transition-all focus:bg-blue-50 hover:border-blue-200 hover:bg-blue-50/60"
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
                              <Grid3x3 className="h-4 w-4" strokeWidth={2.2} />
                            </span>
                            <span className="min-w-0 text-left">
                              <span className="block truncate text-sm font-medium leading-5 text-blue-700">Explore more templates</span>
                              <span className="mt-0.5 block truncate text-xs font-normal leading-4 text-slate-500">Browse construction, MEP, survey, and handover templates</span>
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4 shrink-0 text-blue-500" />
                        </DropdownMenuItem>
                      </div>
                      </div>
                      {planningTemplate === "new" && (
                        <div
                          className="shrink-0 border-t border-blue-100 bg-blue-50/60 p-2.5"
                          onKeyDown={(event) => event.stopPropagation()}
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-medium text-slate-950">Save blank template</p>
                              <p className="mt-0.5 text-[11px] text-slate-500">Rename and save it to My templates.</p>
                            </div>
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-blue-600 text-white">
                              <Plus className="h-3.5 w-3.5" />
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              value={customPlanningTemplateDraft}
                              onChange={(event) => setCustomPlanningTemplateDraft(event.target.value)}
                              onClick={(event) => event.stopPropagation()}
                              placeholder="Template name"
                              className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                            />
                            <button
                              type="button"
                              onClick={saveCustomPlanningTemplate}
                              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Save
                            </button>
                          </div>
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Dialog open={planningTemplateExploreOpen} onOpenChange={setPlanningTemplateExploreOpen}>
                    <DialogContent className="flex max-h-[86vh] flex-col gap-0 overflow-hidden border-0 bg-white p-0 shadow-[0_28px_80px_rgba(15,23,42,0.22)] sm:max-w-5xl [&>button:last-child]:hidden">
                      <div className="border-b border-slate-100 bg-white px-5 py-4">
                        <DialogHeader className="gap-0">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <DialogTitle className="text-xl font-semibold tracking-tight text-slate-950">Planning templates</DialogTitle>
                              <DialogDescription className="mt-1 text-sm text-slate-500">
                                Ready structures for project planning.
                              </DialogDescription>
                            </div>
                            <div className="flex w-full items-center gap-2 lg:w-auto">
                              <div className="relative min-w-0 flex-1 lg:w-[360px]">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                  value={planningTemplateExploreSearch}
                                  onChange={(event) => setPlanningTemplateExploreSearch(event.target.value)}
                                  placeholder="Search templates..."
                                  className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setPlanningTemplateExploreOpen(false)}
                                className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                                aria-label="Close template library"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </DialogHeader>

                        <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1">
                          {planningTemplateExploreChips.map((chip) => (
                            <button
                              key={chip}
                              type="button"
                              onClick={() => setPlanningTemplateExploreChip(chip)}
                              className={`h-8 shrink-0 rounded-full border px-3 text-xs font-medium transition-all ${
                                planningTemplateExploreChip === chip
                                  ? "border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-600/20"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
                              }`}
                            >
                              {chip}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/60 p-4">
                        {filteredPlanningTemplateGallery.length === 0 ? (
                          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white text-center">
                            <Search className="mb-3 h-8 w-8 text-slate-300" />
                            <p className="text-sm font-semibold text-slate-900">No templates found</p>
                            <p className="mt-1 text-xs text-slate-500">Try another keyword or category chip.</p>
                          </div>
                        ) : (
                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {filteredPlanningTemplateGallery.map((template) => {
                              const templateVisual = planningTemplateVisuals[template.value];
                              const TemplateIcon = templateVisual.icon;
                              const selected = template.value === planningTemplate && template.label === activePlanningTemplate.label;
                              return (
                                <button
                                  key={template.id}
                                  type="button"
                                  onClick={() => choosePlanningGalleryTemplate(template)}
                                  className={`group flex min-h-[168px] flex-col rounded-2xl border bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-950/5 ${
                                    selected ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200"
                                  }`}
                                >
                                  <div className="mb-3 flex items-start justify-between gap-3">
                                    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${templateVisual.tone}`}>
                                      <TemplateIcon className="h-4 w-4 text-white" strokeWidth={2.4} />
                                    </span>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                                      {template.category}
                                    </span>
                                  </div>
                                  <h3 className="text-sm font-semibold leading-tight text-slate-950 group-hover:text-blue-700">{template.label}</h3>
                                  <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-slate-500">{template.description}</p>
                                  <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                                    <span className="font-semibold text-slate-800">{template.duration}</span>
                                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                                    <span className="truncate">{template.scope}</span>
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {template.tags.slice(0, 2).map((tag) => (
                                      <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{tag}</span>
                                    ))}
                                  </div>
                                  <span className="mt-auto flex items-center justify-between pt-3 text-xs font-semibold text-blue-600">
                                    Use
                                    {selected ? <CheckCircle className="h-4 w-4 text-blue-600" /> : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-white px-5 py-3">
                        <p className="text-xs text-slate-500">
                          {filteredPlanningTemplateGallery.length} templates
                        </p>
                        <button
                          type="button"
                          onClick={() => setPlanningTemplateExploreOpen(false)}
                          className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                          Close
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                )}

                {!isPlanningSection && (
                <div className="flex items-center gap-2 shrink-0">
                  {dataSearchOpen ? (
                    <div className="relative w-[220px] md:w-[250px] shrink-0">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search files and folders..."
                        value={dataSearchQuery}
                        onChange={(e) => setDataSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-gray-900"
                        onBlur={() => {
                          if (!dataSearchQuery.trim()) {
                            setDataSearchOpen(false);
                          }
                        }}
                      />
                      <button
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                          setDataSearchQuery("");
                          setDataSearchOpen(false);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        title="Close search"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDataSearchOpen(true)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-gray-900"
                      title="Search"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={openDataFilters}
                    className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 transition-colors hover:border-gray-900"
                    title="Open filters"
                  >
                    <Filter className="w-4 h-4" />
                    {activeDataFilterCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] text-white">
                        {activeDataFilterCount}
                      </span>
                    )}
                  </button>
                  {isDataWorkspaceSection && (
                    <div className="flex border border-gray-200 bg-white rounded-lg overflow-hidden">
                      <button
                        onClick={() => setDataViewMode("list")}
                        className={`px-3 py-2 transition-colors ${
                          dataViewMode === "list" ? "bg-gray-900 text-white" : "hover:bg-gray-50"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDataViewMode("grid")}
                        className={`px-3 py-2 transition-colors ${
                          dataViewMode === "grid" ? "bg-gray-900 text-white" : "hover:bg-gray-50"
                        }`}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setDataAiOpen((current) => !current)}
                    className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                      dataAiOpen
                        ? "bg-gray-100 text-gray-900 border border-gray-200"
                        : "border border-gray-200 bg-white hover:border-gray-900 text-gray-900"
                    }`}
                  >
                    <Brain className="w-4 h-4" />
                    Ask AI
                  </button>
                  {isDataWorkspaceSection && (
                    <button
                      onClick={() => setCreateFolderModalOpen(true)}
                      className="px-3.5 py-2 border border-gray-200 bg-white rounded-lg hover:border-gray-900 transition-colors flex items-center gap-2 text-sm"
                    >
                      <FolderPlus className="w-4 h-4" />
                      New Folder
                    </button>
                  )}
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="px-3.5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Upload File
                  </button>
                </div>
                )}
              </div>
            </div>
            )}

            {isDataWorkspaceSection && activeDataWorkspaceSection === "rfi-issues" && (
              <RFITracker />
            )}

            {isDataWorkspaceSection && activeDataWorkspaceSection === "change-orders" && (
              <ChangeOrderTracker />
            )}

            {isDataWorkspaceSection && activeDataWorkspaceSection === "schedules" && (
              <SchedulingTracker />
            )}

            {activeDataSubsection === "planning" && (
              <PlanningTracker templateKey={planningTemplate} onTemplateChange={setPlanningTemplate} />
            )}

            {isDataWorkspaceSection && activeDataWorkspaceSection !== "rfi-issues" && activeDataWorkspaceSection !== "schedules" && activeDataWorkspaceSection !== "change-orders" && (
            <div className="flex items-start gap-5">
              <div className="min-w-0 flex-1 transition-all duration-300">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <select
                      value={dataWorkspaceProject}
                      onChange={(event) => setDataWorkspaceProject(event.target.value)}
                      className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
                    >
                      <option value="All Projects">All Projects</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.name}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-sm text-gray-500">{activeDataWorkspaceConfig?.subtitle}</p>
                  </div>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                  {activeDataWorkspaceConfig?.chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setDataWorkspaceChip(chip)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        dataWorkspaceChip === chip
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-950"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                <div className="mb-3 flex min-h-9 items-center gap-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={goBackDataFolder}
                      disabled={dataBackHistory.length === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-35"
                      title="Go back"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={goForwardDataFolder}
                      disabled={dataForwardHistory.length === 0}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-35"
                      title="Go forward"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden text-sm">
                    <button
                      onClick={() => navigateDataFolder(null)}
                      className={`truncate rounded px-1.5 py-1 transition-colors ${
                        currentDataFolderId === null
                          ? "font-medium text-gray-950"
                          : "text-gray-500 hover:text-gray-950"
                      }`}
                    >
                      {activeDataWorkspaceConfig?.title ?? "All Files"}
                    </button>
                    {dataFolderBreadcrumbs.map((folder) => (
                      <div key={folder.id} className="flex min-w-0 items-center gap-1.5">
                        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-300" />
                        <button
                          onClick={() => navigateDataFolder(folder.id)}
                          className={`max-w-[180px] truncate rounded px-1.5 py-1 transition-colors ${
                            currentDataFolderId === folder.id
                              ? "font-medium text-gray-950"
                              : "text-gray-500 hover:text-gray-950"
                          }`}
                        >
                          {folder.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    {filteredFiles.length} {filteredFiles.length === 1 ? "item" : "items"} found
                    {dataWorkspaceProject !== "All Projects" && ` in ${dataWorkspaceProject}`}
                    {currentDataFolder && ` inside ${currentDataFolder.name}`}
                  </p>
                  {feedbackMessage && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                      {feedbackMessage}
                    </div>
                  )}
                </div>

                {dataViewMode === "list" && (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                <div className="grid grid-cols-[minmax(0,1.8fr)_150px_120px_130px_112px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-[11px] uppercase tracking-wide text-gray-500">
                  <div>Name</div>
                  <div>Project</div>
                  <div>Updated</div>
                  <div>Owner</div>
                  <div className="text-right">Actions</div>
                </div>
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="grid grid-cols-[minmax(0,1.8fr)_150px_120px_130px_112px] gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0 items-center"
                    onClick={() => openDataFolder(file)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                        {file.type === "folder" ? (
                          <Folder className="w-4.5 h-4.5 text-gray-900" />
                        ) : (
                          <FileText className="w-4.5 h-4.5 text-gray-900" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 min-w-0">
                          <h4 className="text-sm text-gray-900 truncate">{file.name}</h4>
                          {file.type === "folder" ? (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600 shrink-0">
                              {file.items} items
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 truncate">{file.project}</div>
                    <div className="text-sm text-gray-500">{file.date}</div>
                    <div className="text-sm text-gray-600 truncate">{file.owner}</div>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          openDataFolder(file);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDownload(file);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(event) => event.stopPropagation()}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                            title="More"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {file.type === "folder" ? (
                            <DropdownMenuItem onClick={() => openDataFolder(file)}>
                              <Folder className="w-4 h-4" />
                              Open Folder
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openDataItem(file)}>
                              <Eye className="w-4 h-4" />
                              View Details
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleShare(file)}>
                            <Share2 className="w-4 h-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(file)}>
                            <Download className="w-4 h-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRenameOpen(file)}>
                            <Edit className="w-4 h-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(file)}>
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(file)} variant="destructive">
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
                )}

                {dataViewMode === "grid" && (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`group cursor-pointer rounded-xl border bg-white p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] ${
                      file.type === "folder" ? "border-blue-100 hover:border-blue-200" : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => openDataFolder(file)}
                  >
                    <div className="flex flex-col">
                      <div className={`mb-3 rounded-xl p-3 ${
                        file.type === "folder" ? "bg-blue-50/80" : "bg-gray-50"
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                            file.type === "folder" ? "bg-white text-blue-600 shadow-sm" : "bg-white text-gray-700 shadow-sm"
                          }`}>
                            {file.type === "folder" ? (
                              <Folder className="w-5 h-5" />
                            ) : (
                              <FileText className="w-5 h-5" />
                            )}
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                onClick={(event) => event.stopPropagation()}
                                className="rounded-lg p-1 text-gray-400 opacity-0 transition-all hover:bg-white hover:text-gray-700 group-hover:opacity-100"
                              >
                                <MoreVertical className="w-3.5 h-3.5 text-gray-600" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {file.type === "folder" ? (
                                <DropdownMenuItem onClick={() => openDataFolder(file)}>
                                  <Folder className="w-4 h-4" />
                                  Open Folder
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => openDataItem(file)}>
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleShare(file)}>
                                <Share2 className="w-4 h-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDownload(file)}>
                                <Download className="w-4 h-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleRenameOpen(file)}>
                                <Edit className="w-4 h-4" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicate(file)}>
                                <Copy className="w-4 h-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDelete(file)} variant="destructive">
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <p className={`mt-4 text-[10px] uppercase tracking-wide ${
                          file.type === "folder" ? "text-blue-600" : "text-gray-500"
                        }`}>
                          {file.type === "folder" ? "Folder" : "File"}
                        </p>
                      </div>
                      <div className="mb-2 min-h-[2.6rem]">
                        <h4 className="line-clamp-2 text-sm text-gray-900">{file.name}</h4>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-2.5 text-[10px] text-gray-500">
                        <span>{file.type === "folder" ? `${file.items} items` : file.size}</span>
                        <span>{file.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
                )}

                {filteredFiles.length === 0 && (
                  <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                    No files or folders match the current search.
                  </div>
                )}
              </div>

              {dataAiOpen && (
                <aside className="w-[360px] shrink-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-all duration-300">
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-900">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Data AI</p>
                        <p className="text-xs text-gray-500">Ask about this file view</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDataAiOpen(false)}
                      className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                      title="Close AI panel"
                    >
                      <X className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <div className="border-b border-gray-100 px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => askDataAi("Give me a summary of this view")}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:border-gray-900"
                      >
                        Summary
                      </button>
                      <button
                        onClick={() => askDataAi("Which folders are visible?")}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:border-gray-900"
                      >
                        Folders
                      </button>
                      <button
                        onClick={() => askDataAi("Which owners are visible here?")}
                        className="rounded-full border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:border-gray-900"
                      >
                        Owners
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[520px] overflow-auto px-4 py-4 space-y-3">
                    {dataAiMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                            message.role === "user"
                              ? "bg-gray-900 text-white"
                              : "border border-gray-200 bg-gray-50 text-gray-800"
                          }`}
                        >
                          {message.message}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={dataAiQuery}
                        onChange={(e) => setDataAiQuery(e.target.value)}
                        placeholder="Ask about this data..."
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            askDataAi(dataAiQuery);
                          }
                        }}
                      />
                      <button
                        onClick={() => askDataAi(dataAiQuery)}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-white hover:bg-gray-800 transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </aside>
              )}
            </div>
            )}

            {activeDataSubsection === "project-docs" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base text-gray-950">Document Spaces</h4>
                    <p className="text-sm text-gray-500">{projectDocumentRows.length} spaces found</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <button
                        onClick={() => setProjectDocsViewMode("list")}
                        className={`px-3 py-2 transition-colors ${
                          projectDocsViewMode === "list" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                        }`}
                        title="List view"
                      >
                        <List className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setProjectDocsViewMode("grid")}
                        className={`px-3 py-2 transition-colors ${
                          projectDocsViewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                        }`}
                        title="Grid view"
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => setUploadModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-gray-900"
                    >
                      <Upload className="h-4 w-4" />
                      Add Docs
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {projectDocChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setProjectDocChip(chip)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                        projectDocChip === chip
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-950"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {projectDocsViewMode === "list" && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  {projectDocumentRows.map((row) => (
                    <button
                      key={row.project.id}
                      className="group grid w-full grid-cols-[minmax(0,1fr)_140px_110px_110px_32px] items-center gap-4 border-b border-gray-100 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-gray-50"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Folder className="h-5 w-5" />
                          <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm ring-1 ring-gray-200">
                            <FileText className="h-3 w-3" />
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm text-gray-950">{row.project.name}</p>
                          <p className="mt-0.5 truncate text-xs text-gray-500">{row.project.manager}</p>
                        </div>
                      </div>
                      <div>
                        <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-600">
                          {row.project.phase}
                        </span>
                      </div>
                      <div className="flex min-w-0 gap-1.5 overflow-hidden">
                        {row.docTypes.slice(0, 2).map((type) => (
                          <span key={type} className="rounded-full bg-gray-50 px-2 py-1 text-[11px] text-gray-600">
                            {type}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">{row.latest}</div>
                      <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-700" />
                    </button>
                  ))}
                  {projectDocumentRows.length === 0 && (
                    <div className="px-4 py-10 text-center text-sm text-gray-500">
                      No document spaces match this filter.
                    </div>
                  )}
                </div>
                )}

                {projectDocsViewMode === "grid" && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {projectDocumentRows.map((row) => (
                      <button
                        key={row.project.id}
                        className="group rounded-xl border border-gray-200 bg-white p-3 text-left transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_10px_28px_rgba(15,23,42,0.07)]"
                      >
                        <div className="mb-3 flex items-start justify-between">
                          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Folder className="h-5 w-5" />
                            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-md bg-white text-gray-500 shadow-sm ring-1 ring-gray-200">
                              <FileText className="h-3 w-3" />
                            </span>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-700" />
                        </div>
                        <h5 className="truncate text-sm text-gray-950">{row.project.name}</h5>
                        <p className="mt-1 truncate text-xs text-gray-500">{row.project.phase}</p>
                        <div className="mt-3 flex gap-1.5 overflow-hidden">
                          {row.docTypes.slice(0, 2).map((type) => (
                            <span key={type} className="rounded-full bg-gray-50 px-2 py-1 text-[11px] text-gray-600">
                              {type}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-[11px] text-gray-500">
                          <span>{row.total} docs</span>
                          <span>{row.latest}</span>
                        </div>
                      </button>
                    ))}
                    {projectDocumentRows.length === 0 && (
                      <div className="rounded-xl border border-dashed border-gray-200 px-4 py-10 text-center text-sm text-gray-500 md:col-span-2 xl:col-span-4">
                        No document spaces match this filter.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeDataSubsection === "shared" && (
              <div>
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm text-gray-500">{sharedDataItems.length} shared items visible</p>
                  {feedbackMessage && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                      {feedbackMessage}
                    </div>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="grid grid-cols-[minmax(0,1.5fr)_1fr_1fr_130px_110px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-[11px] uppercase tracking-wide text-gray-500">
                    <div>Name</div>
                    <div>Project</div>
                    <div>Shared With</div>
                    <div>Updated</div>
                    <div className="text-right">Actions</div>
                  </div>
                  {sharedDataItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-[minmax(0,1.5fr)_1fr_1fr_130px_110px] gap-4 border-b border-gray-100 px-4 py-3.5 text-sm last:border-b-0 hover:bg-gray-50">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-700">
                          {item.type === "folder" ? <Folder className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-gray-950">{item.name}</p>
                          <p className="mt-1 text-xs text-gray-500">{item.type === "folder" ? `${item.items ?? 0} items` : item.size}</p>
                        </div>
                      </div>
                      <div className="truncate text-gray-600">{item.project}</div>
                      <div className="flex min-w-0 items-center">
                        <div className="flex -space-x-2">
                          {item.sharedWith.slice(0, 4).map((person) => (
                            <div
                              key={person}
                              title={person}
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-medium ring-2 ring-white ${getCollaboratorTone(person)}`}
                            >
                              {getCollaboratorInitials(person)}
                            </div>
                          ))}
                        </div>
                        {item.sharedWith.length > 4 && (
                          <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                            +{item.sharedWith.length - 4}
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500">{item.date}</div>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleShare(item)} className="rounded-lg p-1.5 hover:bg-gray-100" title="Manage share">
                          <Share2 className="h-4 w-4 text-gray-600" />
                        </button>
                        <button onClick={() => openDataItem(item)} className="rounded-lg p-1.5 hover:bg-gray-100" title="View details">
                          <Eye className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeDataSubsection === "uploads" && (
              <div>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="group mb-8 w-full rounded-2xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-white p-8 text-left transition-all hover:border-blue-300 hover:shadow-[0_18px_45px_rgba(37,99,235,0.10)]"
                >
                  <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm ring-1 ring-blue-100 transition-transform group-hover:-translate-y-0.5">
                      <Upload className="h-7 w-7" />
                    </div>
                    <h4 className="text-xl text-gray-950">Drop files or folders here</h4>
                    <p className="mt-2 max-w-md text-sm text-gray-500">
                      Upload drawings, reports, folders, and project packages into the selected workspace.
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white group-hover:bg-gray-800">
                      Choose upload
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </button>

                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-lg text-gray-950">Recent Uploads</h4>
                    <p className="text-sm text-gray-500">{uploadRows.length} completed uploads</p>
                  </div>
                  <button
                    onClick={() => setUploadModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:border-gray-900"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {uploadRows.map((item) => (
                    <div
                      key={item.id}
                      className="group rounded-xl border border-gray-200 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_10px_26px_rgba(15,23,42,0.07)]"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                          item.type === "folder" ? "bg-blue-50 text-blue-600" : "bg-gray-50 text-gray-700"
                        }`}>
                          {item.type === "folder" ? <Folder className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" title="Complete" />
                      </div>
                      <h5 className="truncate text-sm text-gray-950">{item.name}</h5>
                      <p className="mt-1 truncate text-xs text-gray-500">{item.project}</p>
                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-[11px] text-gray-500">
                        <span>{item.size}</span>
                        <span>{item.date}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-[11px] text-green-700">Complete</span>
                        <button
                          onClick={() => openDataItem(item)}
                          className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                          title="View upload"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isDataWorkspaceSection && showDataFloatingActions && (
              <div className={`fixed bottom-8 z-40 flex flex-col gap-2 transition-all duration-300 ${dataAiOpen ? "right-[24rem]" : "right-8"}`}>
                <button
                  onClick={() => setUploadModalOpen(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white shadow-lg hover:bg-gray-800 transition-colors"
                  title="Upload File"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCreateFolderModalOpen(true)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-lg hover:border-gray-900 transition-colors"
                  title="Create Folder"
                >
                  <FolderPlus className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeSection === "catalog" && (
          <div>
            {activeCatalogSection === "home" ? (
              <div className="rounded-[2rem] border border-amber-100 bg-gradient-to-b from-white via-white to-amber-50/60 px-8 py-14">
                <div className="mx-auto mb-10 max-w-2xl text-center">
                  <h2 className="text-4xl text-gray-950">Catalog</h2>
                  <p className="mt-3 text-sm text-gray-500">
                    Standardized libraries for materials, equipment, vendors, and reference documents.
                  </p>
                </div>
                <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {catalogCards.map((card) => {
                    const CardIcon = card.icon;
                    return (
                      <button
                        key={card.id}
                        onClick={() => selectHubModule("catalog", card.id)}
                        className="group rounded-2xl border border-amber-100 bg-white p-4 text-left shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_18px_45px_rgba(15,23,42,0.08)]"
                      >
                        <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl border ${card.accent}`}>
                          <CardIcon className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg text-gray-950">{card.title}</h3>
                        <p className="mt-1 min-h-10 text-xs text-gray-500">{card.subtitle}</p>
                        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-400">
                          <span>{card.count}</span>
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:text-amber-600" />
                        </div>
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCreateCatalogModalOpen(true)}
                    className="group rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-4 text-left transition-all hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-50 flex flex-col justify-center items-center min-h-[200px]"
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 group-hover:text-gray-900 group-hover:border-gray-400 transition-colors shadow-sm">
                      <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-medium text-gray-700 group-hover:text-gray-900 transition-colors">Create New Catalog</h3>
                    <p className="mt-1 text-xs text-gray-500 text-center max-w-[160px]">Define a custom tracking library for your workspace.</p>
                  </button>
                </div>
              </div>
            ) : activeCatalogSection === "materials" ? (
              <MaterialCatalog onBack={() => selectHubModule("catalog", "home")} />
            ) : activeCatalogSection === "equipment" ? (
              <EquipmentCatalog onBack={() => selectHubModule("catalog", "home")} />
            ) : activeCatalogSection === "vendors" ? (
              <VendorCatalog onBack={() => selectHubModule("catalog", "home")} />
            ) : activeCatalogSection === "standards" ? (
              <StandardsCatalog onBack={() => selectHubModule("catalog", "home")} />
            ) : customCatalogs.some((catalog) => catalog.id === activeCatalogSection) ? (
              (() => {
                const customCatalog = customCatalogs.find((catalog) => catalog.id === activeCatalogSection);
                return customCatalog ? (
                  <CustomCatalog
                    title={customCatalog.title}
                    subtitle={customCatalog.subtitle}
                    template={customCatalog.template}
                    onBack={() => selectHubModule("catalog", "home")}
                  />
                ) : null;
              })()
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => selectHubModule("catalog", "home")}
                        className="text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        Catalog
                      </button>
                      <span className="text-gray-300">/</span>
                      <h3 className="text-2xl text-gray-950">{catalogCards.find((card) => card.id === activeCatalogSection)?.title ?? "Catalog"}</h3>
                    </div>
                    <p className="text-sm text-gray-500">{catalogCards.find((card) => card.id === activeCatalogSection)?.subtitle ?? "Library view"}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={catalogSearchQuery}
                        onChange={(e) => setCatalogSearchQuery(e.target.value)}
                        placeholder="Search items..."
                        className="w-64 rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-sm outline-none transition-colors focus:border-gray-900"
                      />
                    </div>
                    <div className="flex border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() => setCatalogViewMode("grid")}
                        className={`px-3 py-2 transition-colors ${catalogViewMode === "grid" ? "bg-amber-50 text-amber-600" : "hover:bg-gray-50 text-gray-600"}`}
                      >
                        <Grid3x3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCatalogViewMode("list")}
                        className={`px-3 py-2 transition-colors ${catalogViewMode === "list" ? "bg-amber-50 text-amber-600" : "hover:bg-gray-50 text-gray-600"}`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setCatalogFilterModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 bg-white transition-colors"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </button>
                    <button 
                      onClick={() => setCatalogAddModalOpen(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 transition-colors shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add Item
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Primary Category Chips */}
                    {["All", ...Array.from(new Set(catalogLibraryItems.filter(i => i.type === activeCatalogSection).map(i => i.category)))].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCatalogFilters(cat === "All" ? {} : { category: cat })}
                        className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
                          (!catalogFilters.category && cat === "All") || catalogFilters.category === cat 
                            ? "bg-gray-900 text-white shadow-sm" 
                            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  
                  {/* Secondary Brand/Sub-category Chips */}
                  {catalogFilters.category && (
                    <div className="flex flex-wrap items-center gap-2 pl-2 border-l-2 border-gray-200">
                      <span className="text-xs text-gray-400 mr-1">Brands:</span>
                      {["All Brands", ...Array.from(new Set(catalogLibraryItems.filter(i => i.type === activeCatalogSection && i.category === catalogFilters.category).map(i => i.supplier).filter(s => s && s !== "N/A")))].map(brand => (
                        <button
                          key={brand}
                          onClick={() => setCatalogFilters(prev => ({ ...prev, brand: brand === "All Brands" ? undefined : brand, grade: undefined }))}
                          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                            (!catalogFilters.brand && brand === "All Brands") || catalogFilters.brand === brand 
                              ? "bg-amber-100 text-amber-800 border border-amber-200" 
                              : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Tertiary Grade Chips */}
                  {catalogFilters.brand && catalogFilters.category && ['Concrete', 'Steel', 'Cement', 'Finishes'].includes(catalogFilters.category) && (
                    <div className="flex flex-wrap items-center gap-2 pl-4 border-l-2 border-amber-200 mt-1">
                      <span className="text-xs text-gray-400 mr-1">Grade / Spec:</span>
                      {["All Grades", "C30", "Grade 60", "NRC 0.75", "R10 Slip Rating"].map(grade => (
                        <button
                          key={grade}
                          onClick={() => setCatalogFilters(prev => ({ ...prev, grade: grade === "All Grades" ? undefined : grade }))}
                          className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                            (!catalogFilters.grade && grade === "All Grades") || catalogFilters.grade === grade 
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200" 
                              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {catalogViewMode === "list" ? (
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <div className="grid grid-cols-[minmax(0,1.4fr)_140px_140px_140px_100px_32px] items-center gap-4 border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                      <div>Name & Details</div>
                      <div>Category</div>
                      <div>Status</div>
                      <div>Updated</div>
                      <div>Owner</div>
                      <div></div>
                    </div>
                    {catalogLibraryItems
                      .filter(item => item.type === activeCatalogSection)
                      .filter(item => !catalogFilters.category || item.category === catalogFilters.category)
                      .filter(item => !catalogFilters.brand || item.supplier === catalogFilters.brand)
                      .filter(item => !catalogFilters.grade || item.spec.includes(catalogFilters.grade))
                      .filter(item => !catalogSearchQuery || item.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) || item.spec.toLowerCase().includes(catalogSearchQuery.toLowerCase()))
                      .map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => setSelectedCatalogItem(item)}
                        className="grid grid-cols-[minmax(0,1.4fr)_140px_140px_140px_100px_32px] items-center gap-4 border-b border-gray-100 px-4 py-3.5 text-sm last:border-b-0 hover:bg-amber-50/30 cursor-pointer transition-colors"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100 relative shadow-sm border border-gray-200/50">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className={`flex h-full w-full items-center justify-center ${catalogCards.find(c => c.id === activeCatalogSection)?.accent || 'bg-gray-50 text-gray-500'}`}>
                                {activeCatalogSection === 'materials' && <Package className="h-5 w-5" />}
                                {activeCatalogSection === 'equipment' && <Truck className="h-5 w-5" />}
                                {activeCatalogSection === 'vendors' && <Users className="h-5 w-5" />}
                                {activeCatalogSection === 'standards' && <FileText className="h-5 w-5" />}
                                {!['materials', 'equipment', 'vendors', 'standards'].includes(activeCatalogSection) && <FolderKanban className="h-5 w-5" />}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="truncate font-medium text-gray-950">{item.name}</p>
                            <p className="mt-0.5 truncate text-xs text-gray-500">{item.spec}</p>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">{item.category}</div>
                        <div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {item.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">{item.updated}</div>
                        <div className="text-sm text-gray-600">{item.owner}</div>
                        <ArrowRight className="h-4 w-4 text-gray-300" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {catalogLibraryItems
                      .filter(item => item.type === activeCatalogSection)
                      .filter(item => !catalogFilters.category || item.category === catalogFilters.category)
                      .filter(item => !catalogFilters.brand || item.supplier === catalogFilters.brand)
                      .filter(item => !catalogFilters.grade || item.spec.includes(catalogFilters.grade))
                      .filter(item => !catalogSearchQuery || item.name.toLowerCase().includes(catalogSearchQuery.toLowerCase()) || item.spec.toLowerCase().includes(catalogSearchQuery.toLowerCase()))
                      .map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedCatalogItem(item)}
                          className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-amber-200 hover:shadow-lg hover:shadow-amber-900/5 cursor-pointer transition-all flex flex-col"
                        >
                          <div className="h-40 w-full bg-gray-50 relative border-b border-gray-100">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                              <div className={`w-full h-full flex items-center justify-center ${catalogCards.find(c => c.id === activeCatalogSection)?.accent || 'bg-gray-50 text-gray-500'}`}>
                                {activeCatalogSection === 'materials' && <Package className="h-10 w-10 opacity-50" />}
                                {activeCatalogSection === 'equipment' && <Truck className="h-10 w-10 opacity-50" />}
                                {activeCatalogSection === 'vendors' && <Users className="h-10 w-10 opacity-50" />}
                                {activeCatalogSection === 'standards' && <FileText className="h-10 w-10 opacity-50" />}
                                {!['materials', 'equipment', 'vendors', 'standards'].includes(activeCatalogSection) && <FolderKanban className="h-10 w-10 opacity-50" />}
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm ${item.status === 'Approved' ? 'bg-green-100/90 text-green-800 border border-green-200/50' : 'bg-yellow-100/90 text-yellow-800 border border-yellow-200/50'}`}>
                                {item.status}
                              </span>
                            </div>
                            {/* Type Icon overlay */}
                            <div className={`absolute -bottom-4 left-4 h-10 w-10 rounded-lg shadow-sm border border-white flex items-center justify-center bg-white text-gray-700`}>
                              {activeCatalogSection === 'materials' && <Package className="h-5 w-5" />}
                              {activeCatalogSection === 'equipment' && <Truck className="h-5 w-5" />}
                              {activeCatalogSection === 'vendors' && <Users className="h-5 w-5" />}
                              {activeCatalogSection === 'standards' && <FileText className="h-5 w-5" />}
                              {!['materials', 'equipment', 'vendors', 'standards'].includes(activeCatalogSection) && <FolderKanban className="h-5 w-5" />}
                            </div>
                          </div>
                          
                          <div className="p-5 pt-7 flex-1 flex flex-col">
                            <h4 className="text-base font-semibold text-gray-900 mb-1 line-clamp-1">{item.name}</h4>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{item.spec}</p>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-100 pt-3 mt-auto">
                            <div>
                              <p className="text-gray-400">Category</p>
                              <p className="font-medium text-gray-700">{item.category}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Owner</p>
                              <p className="font-medium text-gray-700">{item.owner}</p>
                            </div>
                            <div>
                              <p className="text-gray-400">Updated</p>
                              <p className="font-medium text-gray-700">{item.updated}</p>
                            </div>
                            <div>
                              {item.type === 'materials' && <><p className="text-gray-400">Supplier</p><p className="font-medium text-gray-700">{item.supplier}</p></>}
                              {item.type === 'equipment' && <><p className="text-gray-400">Rate</p><p className="font-medium text-gray-700">{item.rate}</p></>}
                              {item.type === 'vendors' && <><p className="text-gray-400">Rating</p><p className="font-medium text-gray-700">{item.rating}</p></>}
                              {item.type === 'standards' && <><p className="text-gray-400">Type</p><p className="font-medium text-gray-700">{item.typeDoc}</p></>}
                            </div>
                          </div>
                        </div>
                      </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Projects Section */}
        {activeSection === "projects" && (
          <div>
            <div className="mb-8 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6">
              <div className="mb-5 flex items-start justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900">
                      <FolderKanban className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl">All Projects</h3>
                      <p className="text-sm text-gray-500">Cross-phase explorer for Pre-Construction, Construction, Site Survey, Digital Twin, and Facility Management.</p>
                    </div>
                  </div>
                  <div className="relative max-w-2xl">
                    <input
                      type="text"
                      value={projectAiQuery}
                      onChange={(e) => setProjectAiQuery(e.target.value)}
                      placeholder="Ask AI about delays, phase mix, managers, or project risk..."
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-28 text-sm outline-none transition-colors focus:border-gray-900"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          askProjectAi(projectAiQuery);
                        }
                      }}
                    />
                    <button
                      onClick={() => askProjectAi(projectAiQuery)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                    >
                      Ask AI
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setProjectAiQuery("Show delayed projects");
                        askProjectAi("Show delayed projects");
                      }}
                      className="rounded-lg bg-white px-3 py-2 text-xs text-gray-700 border border-gray-200 hover:border-gray-900"
                    >
                      Show delayed projects
                    </button>
                    <button
                      onClick={() => {
                        setProjectAiQuery("Summarize projects by phase");
                        askProjectAi("Summarize projects by phase");
                      }}
                      className="rounded-lg bg-white px-3 py-2 text-xs text-gray-700 border border-gray-200 hover:border-gray-900"
                    >
                      Summarize by phase
                    </button>
                    <button
                      onClick={() => {
                        setProjectAiQuery("Which completed projects can be benchmarked?");
                        askProjectAi("Which completed projects can be benchmarked?");
                      }}
                      className="rounded-lg bg-white px-3 py-2 text-xs text-gray-700 border border-gray-200 hover:border-gray-900"
                    >
                      Benchmark completed projects
                    </button>
                  </div>
                </div>
                <div className="min-w-[260px] rounded-xl border border-gray-200 bg-white p-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">AI Insight</p>
                  <p className="text-sm text-gray-700">
                    {projectAiResponse || "Ask about phase mix, delays, completed projects, or manager ownership to get a quick portfolio summary."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500 mb-1">Visible Projects</p>
                  <p className="text-2xl">{filteredHubProjects.length}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500 mb-1">Delayed</p>
                  <p className="text-2xl">{filteredHubProjects.filter((project) => project.status === "Delayed").length}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="text-2xl">{filteredHubProjects.filter((project) => project.status === "Completed").length}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500 mb-1">Avg Progress</p>
                  <p className="text-2xl">
                    {filteredHubProjects.length > 0
                      ? `${Math.round(filteredHubProjects.reduce((sum, project) => sum + project.progress, 0) / filteredHubProjects.length)}%`
                      : "0%"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="relative min-w-[280px] flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={projectSearchQuery}
                    onChange={(e) => setProjectSearchQuery(e.target.value)}
                    placeholder="Search by project, phase, manager, or location..."
                    className="w-full rounded-lg border border-gray-200 px-10 py-2.5 text-sm outline-none transition-colors focus:border-gray-900"
                  />
                </div>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setProjectsViewMode("grid")}
                    className={`px-3 py-2 transition-colors ${projectsViewMode === "grid" ? "bg-gray-900 text-white" : "hover:bg-gray-50"}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setProjectsViewMode("list")}
                    className={`px-3 py-2 transition-colors ${projectsViewMode === "list" ? "bg-gray-900 text-white" : "hover:bg-gray-50"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {projectPhases.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => setProjectPhaseFilter(phase)}
                    className={`rounded-full px-3 py-2 text-xs transition-colors ${
                      projectPhaseFilter === phase
                        ? "bg-gray-900 text-white"
                        : "border border-gray-200 text-gray-700 hover:border-gray-900"
                    }`}
                  >
                    {phase}
                  </button>
                ))}
              </div>

              <p className="text-sm text-gray-500">
                {filteredHubProjects.length} {filteredHubProjects.length === 1 ? "project" : "projects"} visible
                {projectPhaseFilter !== "All" ? ` in ${projectPhaseFilter}` : ""}
              </p>
            </div>

            {projectsViewMode === "grid" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredHubProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-xl p-5 hover:border-gray-900 transition-colors bg-white">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2 flex-wrap">
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs text-blue-900">{project.phase}</span>
                          <span className={`rounded-full px-2.5 py-1 text-xs ${
                            project.status === "On Track" ? "bg-green-100 text-green-900" :
                            project.status === "Delayed" ? "bg-orange-100 text-orange-900" :
                            "bg-gray-100 text-gray-900"
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <h4 className="text-lg mb-1">{project.name}</h4>
                        <p className="text-sm text-gray-500">{project.location} • {project.manager}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 px-3 py-2 text-right">
                        <p className="text-xs text-gray-500">Progress</p>
                        <p className="text-lg">{project.progress}%</p>
                      </div>
                    </div>

                    <p className="mb-4 text-sm text-gray-600">{project.summary}</p>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            project.progress === 100 ? "bg-green-600" :
                            project.progress >= 50 ? "bg-blue-600" :
                            "bg-orange-600"
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-500 mb-1">Budget</p>
                        <p>{project.budget}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Team Size</p>
                        <p>{project.team} members</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Start</p>
                        <p>{project.startDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">End</p>
                        <p>{project.endDate}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openProjectDetails(project)}
                        className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm hover:border-gray-900 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          const query = `Give me a quick insight on ${project.name}`;
                          setProjectAiQuery(query);
                          askProjectAi(query);
                        }}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 transition-colors"
                      >
                        Ask AI
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {projectsViewMode === "list" && (
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Project</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Phase</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Manager</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Location</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Progress</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Status</th>
                      <th className="px-4 py-3 text-left text-xs text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHubProjects.map((project) => (
                      <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <p className="text-sm">{project.name}</p>
                            <p className="text-xs text-gray-500">{project.budget} • {project.team} members</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700">{project.phase}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{project.manager}</td>
                        <td className="px-4 py-4 text-sm text-gray-700">{project.location}</td>
                        <td className="px-4 py-4">
                          <div className="min-w-[130px]">
                            <div className="mb-1 flex justify-between text-xs text-gray-500">
                              <span>Progress</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  project.progress === 100 ? "bg-green-600" :
                                  project.progress >= 50 ? "bg-blue-600" :
                                  "bg-orange-600"
                                }`}
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs ${
                            project.status === "On Track" ? "bg-green-100 text-green-900" :
                            project.status === "Delayed" ? "bg-orange-100 text-orange-900" :
                            "bg-gray-100 text-gray-900"
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openProjectDetails(project)}
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs hover:border-gray-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => {
                                const query = `Summarize ${project.name}`;
                                setProjectAiQuery(query);
                                askProjectAi(query);
                              }}
                              className="rounded-lg bg-gray-900 px-3 py-2 text-xs text-white hover:bg-gray-800"
                            >
                              Ask AI
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredHubProjects.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                No projects match the current phase filter or search query.
              </div>
            )}
          </div>
        )}

        {/* Procurement Section */}
        {activeSection === "procurement" && (
          <div className="flex h-full flex-1 flex-col overflow-hidden">
            {isProcurementHome ? (
              <div className="min-h-[calc(100vh-5rem)] bg-white">
                <div className="mb-8 flex items-start justify-between gap-6">
                  <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Procurement control center
                    </div>
                    <h2 className="text-4xl text-gray-950">Procurement</h2>
                    <p className="mt-2 max-w-2xl text-sm text-gray-500">
                      Track material, resource, and equipment procurement from requirement to payment.
                    </p>
                  </div>
                  <button
                    onClick={() => selectHubModule("procurement", "material")}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white shadow-sm transition-all hover:bg-blue-700"
                  >
                    Open Material Flow
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {procurementLandingStats.map((stat) => {
                    const StatIcon = stat.icon;
                    return (
                      <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)]">
                        <div className="mb-5 flex items-center justify-between">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${stat.tone}`}>
                            <StatIcon className="h-5 w-5" />
                          </div>
                          <span className="rounded-full bg-gray-50 px-2.5 py-1 text-xs text-gray-500">Live</span>
                        </div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <div className="mt-1 flex items-end gap-2">
                          <p className="text-3xl text-gray-950">{stat.value}</p>
                          <span className="pb-1 text-xs text-gray-400">{stat.sublabel}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                  {procurementLandingFlows.map((flow) => {
                    const FlowIcon = flow.icon;
                    return (
                      <button
                        key={flow.id}
                        onClick={() => selectHubModule("procurement", flow.id)}
                        className="group rounded-3xl border border-gray-200 bg-white p-5 text-left shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_22px_55px_rgba(15,23,42,0.08)]"
                      >
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${flow.accent}`}>
                            <FlowIcon className="h-6 w-6" />
                          </div>
                          <ArrowRight className="mt-3 h-4 w-4 text-gray-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-600" />
                        </div>
                        <h3 className="text-xl text-gray-950">{flow.title}</h3>
                        <p className="mt-2 min-h-10 text-sm text-gray-500">{flow.subtitle}</p>
                        <div className="mt-5 grid grid-cols-3 gap-2">
                          {flow.stats.slice(0, 3).map((item) => (
                            <div key={item} className="rounded-xl bg-gray-50 px-3 py-2">
                              <p className="text-sm text-gray-950">{item.split(" ")[0]}</p>
                              <p className="mt-0.5 truncate text-[11px] text-gray-500">{item.split(" ").slice(1).join(" ")}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-5 border-t border-gray-100 pt-4">
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-gray-500">{flow.total} records</span>
                            <span className="text-gray-950">{flow.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-gray-100">
                            <div className="h-full rounded-full bg-blue-600" style={{ width: `${flow.health}%` }} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                  <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.04)]">
                    <div className="mb-5 flex items-center justify-between">
                      <div>
                        <h3 className="text-xl text-gray-950">Critical Queue</h3>
                        <p className="mt-1 text-sm text-gray-500">Items that need quick action across procurement flows.</p>
                      </div>
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-700">3 attention</span>
                    </div>
                    <div className="space-y-3">
                      {procurementQueueItems.map((item) => (
                        <div key={item.label} className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 px-4 py-3">
                          <div>
                            <p className="text-sm text-gray-950">{item.label}</p>
                            <p className="mt-1 text-xs text-gray-500">{item.meta} • {item.owner}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs ${item.tone}`}>{item.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-gray-200 bg-gradient-to-b from-gray-950 to-slate-900 p-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                    <div className="mb-5 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg">Flow Health</h3>
                        <p className="text-xs text-white/55">Weekly procurement signal</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: "Cycle time", value: "11.4 days", progress: 72 },
                        { label: "On-time delivery", value: "86%", progress: 86 },
                        { label: "Vendor response", value: "74%", progress: 74 },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between text-xs">
                            <span className="text-white/65">{item.label}</span>
                            <span>{item.value}</span>
                          </div>
                          <div className="h-2 rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-blue-400" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => selectHubModule("procurement", "resource")}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm text-gray-950 transition-all hover:bg-blue-50"
                    >
                      Review Resource Flow
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {activeProcurementFlow === "material" && <MaterialProcurementTracker />}
                {activeProcurementFlow === "resource" && <ResourceProcurementTracker />}
                {activeProcurementFlow === "equipment" && (
                  <div className="flex flex-1 flex-col items-center justify-center">
                    <Truck className="w-16 h-16 text-gray-200 mb-4" />
                    <h3 className="text-xl font-bold text-gray-500">Equipment Procurement</h3>
                    <p className="text-sm text-gray-400 mt-2">Coming soon in next release.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Vendor Section */}
        {activeSection === "vendor" && (
          <VendorWorkspace
            activeVendorFlow={activeVendorFlow}
            onFlowChange={(flow) => {
              setActiveVendorFlow(flow);
              navigate(`/dashboard?module=vendor&section=${flow}`);
            }}
            selectedProject={globalSelectedProject}
            onProjectChange={setGlobalSelectedProject}
            myProjects={myDummyProjects}
            sharedProjects={sharedDummyProjects}
          />
        )}

        {/* Resources Section */}
        {activeSection === "resources" && (
          <ResourcesWorkspace
            activeSection={activeResourceSection}
            selectedProject={globalSelectedProject}
            onProjectChange={setGlobalSelectedProject}
            myProjects={myDummyProjects}
            sharedProjects={sharedDummyProjects}
            onSectionChange={(section) => {
              setActiveResourceSection(section);
              navigate(`/dashboard?module=resources&section=${section}`);
            }}
          />
        )}

        {/* Finance Section */}
        {activeSection === "finance" && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-2xl">Finance</h3>
                  <p className="text-sm text-gray-500">Budgeting, invoices, payments, and cash-flow forecast.</p>
                </div>
              </div>
              <button className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800">
                <FileText className="h-4 w-4" />
                Add Invoice
              </button>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {["$21.7M budget", "$14.3M actual", "$1.5M invoices", "$820K pending"].map((stat) => (
                <div key={stat} className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xl text-gray-950">{stat.split(" ")[0]}</p>
                  <p className="mt-1 text-xs text-gray-500">{stat.split(" ").slice(1).join(" ")}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white">
              <div className="grid grid-cols-[1.4fr_120px_120px_120px_110px] gap-4 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500">
                <span>Project</span>
                <span>Budget</span>
                <span>Actual</span>
                <span>Invoice</span>
                <span>Status</span>
              </div>
              {financeRows.map((row) => (
                <div key={row.item} className="grid grid-cols-[1.4fr_120px_120px_120px_110px] gap-4 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0 hover:bg-gray-50">
                  <span className="text-gray-950">{row.item}</span>
                  <span className="text-gray-600">{row.budget}</span>
                  <span className="text-gray-600">{row.actual}</span>
                  <span className="text-gray-600">{row.invoice}</span>
                  <span>
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      row.status === "On Track" ? "bg-green-50 text-green-700" :
                      row.status === "Review" ? "bg-orange-50 text-orange-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      {row.status}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Management Section */}
        {activeSection === "management" && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-900" />
              </div>
              <h3 className="text-2xl">Management</h3>
            </div>

            {/* Attendance Section */}
            <div className="mb-8">
              <h4 className="text-xl mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5" />
                Attendance Tracking
              </h4>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm text-gray-900">Date</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-900">Present</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-900">Absent</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-900">On Leave</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-900">Total</th>
                      <th className="px-6 py-4 text-left text-sm text-gray-900">Attendance %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceData.map((day) => {
                      const percentage = ((day.present / day.total) * 100).toFixed(0);
                      return (
                        <tr key={day.date} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm">{day.date}</td>
                          <td className="px-6 py-4 text-sm text-green-600">{day.present}</td>
                          <td className="px-6 py-4 text-sm text-red-600">{day.absent}</td>
                          <td className="px-6 py-4 text-sm text-orange-600">{day.leave}</td>
                          <td className="px-6 py-4 text-sm">{day.total}</td>
                          <td className="px-6 py-4 text-sm">
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-900 text-xs">
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Resource Utilization */}
            <div>
              <h4 className="text-xl mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Resource Utilization
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resourceUtilization.map((resource) => (
                  <div key={resource.resource} className="border border-gray-200 rounded-lg p-6">
                    <h5 className="text-base mb-4">{resource.resource}</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Allocated</span>
                        <span>{resource.allocated}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Available</span>
                        <span>{resource.available}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Utilization</span>
                          <span className="text-gray-900">{resource.utilization}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              resource.utilization >= 90 ? "bg-red-600" :
                              resource.utilization >= 75 ? "bg-orange-600" :
                              "bg-green-600"
                            }`}
                            style={{ width: `${resource.utilization}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
          <DialogContent>
            {selectedDataItem && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedDataItem.name}</DialogTitle>
                  <DialogDescription>{selectedDataItem.project} • {selectedDataItem.type === "folder" ? "Folder" : "File"}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-3 text-sm text-gray-700">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500 mb-1">Size</p>
                      <p>{selectedDataItem.size}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500 mb-1">Updated</p>
                      <p>{selectedDataItem.date}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 mb-1">Owner</p>
                      <p>{selectedDataItem.owner}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 mb-1">Contained Items</p>
                      <p>{selectedDataItem.type === "folder" ? `${selectedDataItem.items ?? 0} items` : "Single file"}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500 mb-2">Shared With</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedDataItem.sharedWith.length > 0 ? selectedDataItem.sharedWith.map((person) => (
                        <span key={person} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">
                          {person}
                        </span>
                      )) : (
                        <span className="text-xs text-gray-500">Only visible to you right now.</span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleShare(selectedDataItem)}
                      className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Share
                    </button>
                    <button
                      onClick={() => handleDownload(selectedDataItem)}
                      className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
                    >
                      Download
                    </button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={dataFiltersOpen} onOpenChange={setDataFiltersOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
              <DialogDescription>Refine the visible files and folders in the current Data view.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Project</p>
                  <select
                    value={draftDataFilters.project}
                    onChange={(e) => setDraftDataFilters((current) => ({ ...current, project: e.target.value }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  >
                    <option>All Projects</option>
                    {projects.map((project) => (
                      <option key={project.id}>{project.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Type</p>
                  <select
                    value={draftDataFilters.itemType}
                    onChange={(e) => setDraftDataFilters((current) => ({ ...current, itemType: e.target.value as DataFilters["itemType"] }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  >
                    <option value="all">All</option>
                    <option value="file">Files</option>
                    <option value="folder">Folders</option>
                  </select>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Date</p>
                  <select
                    value={draftDataFilters.dateRange}
                    onChange={(e) => setDraftDataFilters((current) => ({ ...current, dateRange: e.target.value as DataFilters["dateRange"] }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  >
                    <option value="all">Any Time</option>
                    <option value="today">Today</option>
                    <option value="7days">Last 7 Days</option>
                    <option value="30days">Last 30 Days</option>
                  </select>
                </div>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Size</p>
                  <select
                    value={draftDataFilters.sizeRange}
                    onChange={(e) => setDraftDataFilters((current) => ({ ...current, sizeRange: e.target.value as DataFilters["sizeRange"] }))}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  >
                    <option value="all">Any Size</option>
                    <option value="small">Small (&lt;10 MB)</option>
                    <option value="medium">Medium (10-100 MB)</option>
                    <option value="large">Large (100+ MB)</option>
                  </select>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">Owner</p>
                <select
                  value={draftDataFilters.owner}
                  onChange={(e) => setDraftDataFilters((current) => ({ ...current, owner: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                >
                  <option value="all">All Owners</option>
                  {availableDataOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between gap-2">
                <button
                  onClick={clearDataFilters}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Clear
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDataFiltersOpen(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyDataFilters}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={projectDetailsOpen} onOpenChange={setProjectDetailsOpen}>
          <DialogContent>
            {selectedHubProject && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedHubProject.name}</DialogTitle>
                  <DialogDescription>{selectedHubProject.phase} • {selectedHubProject.location}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 text-sm text-gray-700">
                  <p>{selectedHubProject.summary}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500 mb-1">Project Manager</p>
                      <p>{selectedHubProject.manager}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p>{selectedHubProject.status}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 mb-1">Budget</p>
                      <p>{selectedHubProject.budget}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 mb-1">Team Size</p>
                      <p>{selectedHubProject.team} members</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 mb-1">Start Date</p>
                      <p>{selectedHubProject.startDate}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 mb-1">Target End</p>
                      <p>{selectedHubProject.endDate}</p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <div className="mb-2 flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{selectedHubProject.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          selectedHubProject.progress === 100 ? "bg-green-600" :
                          selectedHubProject.progress >= 50 ? "bg-blue-600" :
                          "bg-orange-600"
                        }`}
                        style={{ width: `${selectedHubProject.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Share {selectedDataItem?.name}</DialogTitle>
              <DialogDescription>Manage collaborator access and copy a direct link.</DialogDescription>
            </DialogHeader>
            {selectedDataItem && (
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-200 bg-white p-3">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-950">Share link</p>
                      <p className="truncate text-xs text-gray-500">hub.example.com/share/{selectedDataItem.id}</p>
                    </div>
                    <button
                      onClick={copyShareLink}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white hover:bg-gray-800"
                    >
                      {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {linkCopied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_116px_auto] gap-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Add person or team"
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  />
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value)}
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                  >
                    <option>Can view</option>
                    <option>Can edit</option>
                  </select>
                  <button
                    onClick={addShareRecipient}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    Add
                  </button>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white">
                  <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2.5">
                    <p className="text-sm text-gray-950">People with access</p>
                    <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-600">
                      {selectedDataItem.sharedWith.length}
                    </span>
                  </div>
                  <div className="max-h-64 overflow-auto p-2">
                    {selectedDataItem.sharedWith.length > 0 ? selectedDataItem.sharedWith.map((person) => (
                      <div key={person} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium ring-1 ${getCollaboratorTone(person)}`}>
                          {getCollaboratorInitials(person)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-gray-950">{person}</p>
                          <p className="text-xs text-gray-500">{person.includes("@") ? "External collaborator" : "Workspace collaborator"}</p>
                        </div>
                        <select
                          value={sharePermission}
                          onChange={(event) => setSharePermission(event.target.value)}
                          className="rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-gray-900"
                        >
                          <option>Can view</option>
                          <option>Can edit</option>
                        </select>
                        <button
                          onClick={() => removeShareRecipient(person)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title={`Remove ${person}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )) : (
                      <div className="px-3 py-8 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                          <Share2 className="h-4 w-4" />
                        </div>
                        <p className="text-sm text-gray-500">No collaborators added yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Upload to Data Hub</DialogTitle>
              <DialogDescription>Send files or folders to your workspace.</DialogDescription>
            </DialogHeader>
            {isUploading ? (
              <div className="py-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-6">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{uploadType === "folder" ? "Uploading folder" : "Uploading files"}</p>
                      <h4 className="text-base text-gray-900">{uploadedItemName}</h4>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center justify-between text-sm">
                    <span className="text-gray-600">{uploadProject}</span>
                    <span className="text-gray-900">{uploadProgress}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full bg-gray-900 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <p className="mt-3 text-xs text-gray-500">{currentDataFolder ? `Saving inside ${currentDataFolder.name}` : "Saving in All Files"}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="mb-2 text-[11px] uppercase tracking-wide text-gray-500">Destination</p>
                      <select
                        value={uploadProject}
                        onChange={(e) => setUploadProject(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
                      >
                        {projects.map((project) => (
                          <option key={project.id}>{project.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="rounded-xl bg-gray-50 px-3 py-2 text-right">
                      <p className="text-[11px] uppercase tracking-wide text-gray-500">Path</p>
                      <p className="text-sm text-gray-900">{currentDataFolder ? currentDataFolder.name : "All Files"}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label
                    className={`group flex cursor-pointer flex-col rounded-2xl border p-5 transition-all ${
                      uploadIntent === "file"
                        ? "border-blue-200 bg-blue-50/60"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        uploadIntent === "file" ? "bg-white text-blue-600" : "bg-gray-50 text-gray-600"
                      }`}>
                        <Upload className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="mb-1 text-base text-gray-900">Files</h4>
                    <p className="mb-6 text-sm text-gray-500">PDFs, drawings, sheets, reports.</p>
                    <div className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white group-hover:bg-gray-800">
                      Choose files
                    </div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        setUploadIntent("file");
                        handleSelectedUpload(e.target.files, "file");
                      }}
                    />
                  </label>

                  <label
                    className={`group flex cursor-pointer flex-col rounded-2xl border p-5 transition-all ${
                      uploadIntent === "folder"
                        ? "border-blue-200 bg-blue-50/60"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        uploadIntent === "folder" ? "bg-white text-blue-600" : "bg-gray-50 text-gray-600"
                      }`}>
                        <FolderPlus className="w-5 h-5" />
                      </div>
                    </div>
                    <h4 className="mb-1 text-base text-gray-900">Folder</h4>
                    <p className="mb-6 text-sm text-gray-500">Keep package structure intact.</p>
                    <div className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm text-white group-hover:bg-gray-800">
                      Choose folder
                    </div>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        setUploadIntent("folder");
                        handleSelectedUpload(e.target.files, "folder");
                      }}
                      // @ts-expect-error webkitdirectory is required for browser folder selection
                      webkitdirectory=""
                    />
                  </label>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center justify-center py-6">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-900">
                <Check className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg mb-2">Upload successful</h3>
              <p className="mb-6 text-center text-sm text-gray-500">
                {uploadType === "folder" ? "Folder" : "File upload"} for "{uploadedItemName}" is now available in the Data section.
              </p>
              <div className="mb-6 grid w-full grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-left">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">Project</p>
                  <p className="text-sm text-gray-900">{uploadProject}</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-left">
                  <p className="mb-1 text-[11px] uppercase tracking-wide text-gray-500">Path</p>
                  <p className="text-sm text-gray-900">{currentDataFolder ? currentDataFolder.name : "All Files"}</p>
                </div>
              </div>
              <button
                onClick={() => setSuccessModalOpen(false)}
                className="rounded-lg bg-gray-900 px-5 py-2 text-sm text-white hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rename Item</DialogTitle>
              <DialogDescription>Update the display name in the Data hub preview.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setRenameModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameSave}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                >
                  Save
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={createFolderModalOpen} onOpenChange={setCreateFolderModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Folder</DialogTitle>
              <DialogDescription>Add a new folder to the selected project in the Data hub.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              />
              <select
                value={folderProject}
                onChange={(e) => setFolderProject(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-900"
              >
                {projects.map((project) => (
                  <option key={project.id}>{project.name}</option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCreateFolderModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={createFolder}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                >
                  Create
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Catalog Add Item Modal */}
        <Dialog open={isCatalogAddModalOpen} onOpenChange={setCatalogAddModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add to Catalog</DialogTitle>
              <DialogDescription>Add a new item to the standardized library.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Name</label>
                <input
                  type="text"
                  placeholder="Item name"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Specification / Details</label>
                <input
                  type="text"
                  placeholder="Technical specs or description"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                    <option>Concrete</option>
                    <option>Steel</option>
                    <option>Finishes</option>
                    <option>Plumbing</option>
                    <option>Lifting</option>
                    <option>Earthmoving</option>
                    <option>Access</option>
                    <option>Power</option>
                    <option>Subcontractor</option>
                    <option>QA/QC</option>
                    <option>Safety</option>
                    <option>Reporting</option>
                    <option>BIM</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block">Owner</label>
                  <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                    <option>Structures</option>
                    <option>Architecture</option>
                    <option>MEP</option>
                    <option>Plant</option>
                    <option>Procurement</option>
                    <option>Quality</option>
                    <option>HSE</option>
                    <option>PMO</option>
                    <option>BIM Team</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCatalogAddModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setCatalogAddModalOpen(false);
                    showFeedback("Item added to catalog");
                  }}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 transition-colors"
                >
                  Add Item
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Catalog Item Details Modal */}
        <Dialog open={!!selectedCatalogItem} onOpenChange={(open) => !open && setSelectedCatalogItem(null)}>
          <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col p-0 overflow-hidden">
            {selectedCatalogItem && (() => {
              const getTabs = (type: string) => {
                if (type === 'materials') return ["Overview", "Specifications", "Vendor Mapping", "Rate History", "Purchase History", "Documents", "Site Usage"];
                if (type === 'equipment') return ["Overview", "Utilization", "Maintenance", "Operators", "Documents", "Rental History", "Live Tracking"];
                if (type === 'vendors') return ["Overview", "Materials/Services", "Purchase Orders", "Quotations", "Invoices", "Performance", "Compliance Documents"];
                if (type === 'standards') return ["Overview", "Specifications", "Linked Materials", "Linked Activities"];
                return ["Overview"];
              };
              const tabs = getTabs(selectedCatalogItem.type);

              return (
                <>
                  <div className="flex-none p-6 pb-0 border-b border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${catalogCards.find(c => c.id === selectedCatalogItem.type)?.accent || 'bg-gray-50 text-gray-500'}`}>
                          {selectedCatalogItem.type === 'materials' && <Package className="h-7 w-7" />}
                          {selectedCatalogItem.type === 'equipment' && <Truck className="h-7 w-7" />}
                          {selectedCatalogItem.type === 'vendors' && <Users className="h-7 w-7" />}
                          {selectedCatalogItem.type === 'standards' && <FileText className="h-7 w-7" />}
                          {!['materials', 'equipment', 'vendors', 'standards'].includes(selectedCatalogItem.type) && <FolderKanban className="h-7 w-7" />}
                        </div>
                        <div>
                          <DialogTitle className="text-2xl">{selectedCatalogItem.name}</DialogTitle>
                          <DialogDescription className="mt-1 text-base">{selectedCatalogItem.spec}</DialogDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${selectedCatalogItem.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {selectedCatalogItem.status}
                        </span>
                        <button className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex overflow-x-auto gap-6 hide-scrollbar">
                      {tabs.map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setCatalogDetailsTab(tab)}
                          className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors relative ${catalogDetailsTab === tab ? 'text-amber-600' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                          {tab}
                          {catalogDetailsTab === tab && (
                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 rounded-t-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {catalogDetailsTab === "Overview" ? (
                      <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                          <h4 className="text-sm font-semibold text-gray-900 mb-4">Core Attributes</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</p>
                              <p className="text-sm font-medium text-gray-900">{selectedCatalogItem.category}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Owner</p>
                              <p className="text-sm font-medium text-gray-900">{selectedCatalogItem.owner}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last Updated</p>
                              <p className="text-sm font-medium text-gray-900">{selectedCatalogItem.updated}</p>
                            </div>
                            
                            {selectedCatalogItem.type === 'materials' && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Approved Supplier</p>
                                  <p className="text-sm font-medium text-gray-900">{selectedCatalogItem.supplier}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Avg Lead Time</p>
                                  <p className="text-sm font-medium text-gray-900">{selectedCatalogItem.leadTime}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Unit</p>
                                  <p className="text-sm font-medium text-gray-900">kg / nos / sq ft</p>
                                </div>
                              </>
                            )}
                            
                            {selectedCatalogItem.type === 'equipment' && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Supplier / OEM</p>
                                  <p className="text-sm font-medium text-gray-900">{selectedCatalogItem.supplier}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Standard Rate</p>
                                  <p className="text-sm font-medium text-gray-900">{selectedCatalogItem.rate}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Fuel Type</p>
                                  <p className="text-sm font-medium text-gray-900">Diesel / Electric</p>
                                </div>
                              </>
                            )}

                            {selectedCatalogItem.type === 'vendors' && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Performance Rating</p>
                                  <p className="text-sm font-medium text-gray-900">{selectedCatalogItem.rating}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Service Area</p>
                                  <p className="text-sm font-medium text-gray-900">National</p>
                                </div>
                              </>
                            )}

                            {selectedCatalogItem.type === 'standards' && (
                              <>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Document Type</p>
                                  <p className="text-sm font-medium text-gray-900">{selectedCatalogItem.typeDoc}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Version</p>
                                  <p className="text-sm font-medium text-gray-900">v1.2.0</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {selectedCatalogItem.type === 'materials' && (
                          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-xl border border-indigo-100 p-5 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                              <Activity className="h-5 w-5 text-indigo-600" />
                              <h4 className="text-sm font-semibold text-gray-900">Smart Insights & AI Capabilities</h4>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                                <span className="block text-indigo-600 font-medium mb-1">Brand Comparison</span>
                                <span className="text-gray-500 text-xs">AI compares 3 approved brands on cost/lead time.</span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                                <span className="block text-indigo-600 font-medium mb-1">Auto-Suggest Vendors</span>
                                <span className="text-gray-500 text-xs">Matches local vendors based on active projects.</span>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-sm text-sm">
                                <span className="block text-indigo-600 font-medium mb-1">Duplicate Detection</span>
                                <span className="text-gray-500 text-xs">Identifies overlap in item codes & descriptions.</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-center text-gray-500">
                        <Box className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="font-medium text-gray-900">{catalogDetailsTab} Tab Content</p>
                        <p className="text-sm mt-1">This section is being built to support granular enterprise data points.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-none p-4 border-t border-gray-200 bg-white flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedCatalogItem(null)}
                      className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCatalogItem(null);
                        setCatalogSearchQuery(`Show AI insights for ${selectedCatalogItem.name}`);
                      }}
                      className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      AI Analysis
                    </button>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Catalog Filter Modal */}
        <Dialog open={isCatalogFilterModalOpen} onOpenChange={setCatalogFilterModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filter Catalog</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
                <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none">
                  <option>All Categories</option>
                  <option>Concrete</option>
                  <option>Steel</option>
                  <option>Equipment</option>
                  <option>Tools</option>
                  <option>Subcontractor</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none">
                  <option>All Statuses</option>
                  <option>Approved</option>
                  <option>Under Review</option>
                  <option>Rejected</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Owner</label>
                <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none">
                  <option>All Owners</option>
                  <option>Structures</option>
                  <option>MEP</option>
                  <option>Architecture</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCatalogFilterModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  onClick={() => setCatalogFilterModalOpen(false)}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Catalog Modal */}
        <Dialog open={isCreateCatalogModalOpen} onOpenChange={setCreateCatalogModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Custom Catalog</DialogTitle>
              <DialogDescription>Set up a new standardized tracking library for your workspace.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Catalog Name</label>
                <input
                  type="text"
                  value={createCatalogDraft.name}
                  onChange={(e) => setCreateCatalogDraft((draft) => ({ ...draft, name: e.target.value }))}
                  placeholder="e.g. Specialized Tools"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Description</label>
                <textarea
                  value={createCatalogDraft.description}
                  onChange={(e) => setCreateCatalogDraft((draft) => ({ ...draft, description: e.target.value }))}
                  placeholder="What will this catalog track?"
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Tracking Template</label>
                <select
                  value={createCatalogDraft.template}
                  onChange={(e) => setCreateCatalogDraft((draft) => ({ ...draft, template: e.target.value }))}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option>Material Tracking</option>
                  <option>Equipment/Asset Log</option>
                  <option>Vendor/Partner List</option>
                  <option>Standard Operating Procedure</option>
                  <option>Custom Fields</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setCreateCatalogModalOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomCatalog}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 transition-colors"
                >
                  Create Catalog
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Copy to Figma FAB */}
        <button
          id="figma-fab"
          onClick={handleCopyToFigma}
          disabled={isCopyingFigma}
          title="Copy as Figma layers"
          className="fixed bottom-6 right-6 z-[9999] flex items-center justify-center rounded-full bg-white/40 backdrop-blur-md p-2.5 text-slate-500 shadow-sm border border-slate-200/50 transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-white/80 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCopyingFigma ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Figma className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
