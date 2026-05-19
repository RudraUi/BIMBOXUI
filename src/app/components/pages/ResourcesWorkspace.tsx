import { startTransition, useEffect, useRef, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import {
  Activity,
  ArrowUpDown,
  ArrowUpRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Coins,
  Maximize2,
  Minimize2,
  Grip,
  FileBadge2,
  Fingerprint,
  FolderKanban,
  HardHat,
  Eye,
  Layers3,
  LayoutTemplate,
  Mail,
  MapPin,
  MoreVertical,
  Network,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  ZoomIn,
  ZoomOut,
  FileText,
  CheckSquare,
  Video,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

export type ResourceSection =
  | "organization"
  | "workforce"
  | "teams"
  | "attendance"
  | "access-control"
  | "allocation"
  | "payroll"
  | "performance"
  | "compliance";

type ResourcesWorkspaceProps = {
  activeSection: ResourceSection;
  onSectionChange: (section: ResourceSection) => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  myProjects: string[];
  sharedProjects: string[];
};

type OrgPerson = {
  id: string;
  name: string;
  title: string;
  department: string;
  site: string;
  email: string;
  phone: string;
  reports: number;
  badge: string;
  tone: string;
  managerId?: string;
  employment?: string;
};

type OrgViewRole = "Owner" | "Admin" | "Manager" | "Employee";
type ResourceViewMode = "admin" | "manager" | "hr" | "member";

type NewOrgEmployeeForm = {
  name: string;
  title: string;
  department: string;
  site: string;
  email: string;
  phone: string;
  employment: string;
  managerId: string;
};

type OrgCardLevel = "owner" | "manager" | "lead" | "employee";

type OrgStakeholder = {
  id: string;
  name: string;
  category: string;
  organization: string;
  role: string;
  project: string;
  contact: string;
  email: string;
  influence: string;
  status: string;
  lastTouch: string;
};

type StakeholderLinkedTask = {
  id: string;
  stakeholderId: string;
  title: string;
  source: string;
  status: string;
  priority: string;
  owner: string;
  due: string;
  agendaHint: string;
};

type StakeholderAgenda = {
  stakeholderId: string;
  title: string;
  generatedAt: string;
  attendees: string[];
  items: string[];
  decisions: string[];
  risks: string[];
};

const resourceSectionMeta: Record<
  ResourceSection,
  {
    label: string;
    subtitle: string;
    count: string;
    icon: typeof Users;
    accent: string;
    tint: string;
  }
> = {
  organization: {
    label: "Organization Structure",
    subtitle: "Hierarchy, departments, reporting and ownership",
    count: "18 reporting nodes",
    icon: Network,
    accent: "text-sky-700",
    tint: "bg-sky-50 border-sky-100",
  },
  workforce: {
    label: "Workforce",
    subtitle: "People records, trades, status and contacts",
    count: "164 active workers",
    icon: Users,
    accent: "text-cyan-700",
    tint: "bg-cyan-50 border-cyan-100",
  },
  teams: {
    label: "Teams",
    subtitle: "Crews, site units and contractor groups",
    count: "12 active teams",
    icon: Building2,
    accent: "text-indigo-700",
    tint: "bg-indigo-50 border-indigo-100",
  },
  attendance: {
    label: "Attendance",
    subtitle: "Daily check-in, shifts, overtime and leave",
    count: "96% check-in closure",
    icon: Calendar,
    accent: "text-emerald-700",
    tint: "bg-emerald-50 border-emerald-100",
  },
  "access-control": {
    label: "Access Control",
    subtitle: "Roles, permissions, approvals and site access",
    count: "148 access passes",
    icon: Fingerprint,
    accent: "text-amber-700",
    tint: "bg-amber-50 border-amber-100",
  },
  allocation: {
    label: "Allocation",
    subtitle: "Deployment, scheduling, workload and utilization",
    count: "87% resource utilization",
    icon: FolderKanban,
    accent: "text-violet-700",
    tint: "bg-violet-50 border-violet-100",
  },
  payroll: {
    label: "Payroll",
    subtitle: "Attendance-linked salary calculation and release prep",
    count: "₹52.4L net payable",
    icon: Wallet,
    accent: "text-rose-700",
    tint: "bg-rose-50 border-rose-100",
  },
  performance: {
    label: "Performance",
    subtitle: "Scorecards, KPIs, delays, productivity and trends",
    count: "82 / 100 project score",
    icon: TrendingUp,
    accent: "text-orange-700",
    tint: "bg-orange-50 border-orange-100",
  },
  compliance: {
    label: "Compliance",
    subtitle: "Documents, permits, audits, inspections and risk",
    count: "92% compliance score",
    icon: ShieldCheck,
    accent: "text-teal-700",
    tint: "bg-teal-50 border-teal-100",
  },
};

const resourceViewProfiles: Record<ResourceViewMode, { label: string; role: string; scope: string; allowed: ResourceSection[]; actions: string[] }> = {
  admin: {
    label: "Admin view",
    role: "Resource Admin",
    scope: "Full resource control across organization, people, teams, attendance, access, allocation, payroll, performance and compliance.",
    allowed: ["organization", "workforce", "teams", "attendance", "access-control", "allocation", "payroll", "performance", "compliance"],
    actions: ["Create/update records", "Approve access", "Resolve blockers", "View every linked handoff"],
  },
  manager: {
    label: "Manager / TL view",
    role: "Project Manager / Team Lead",
    scope: "Can manage assigned team, attendance review, allocation, performance, compliance visibility and task-linked actions.",
    allowed: ["organization", "workforce", "teams", "attendance", "allocation", "performance", "compliance"],
    actions: ["Review team", "Approve attendance exceptions", "Request allocation changes", "Review performance risks"],
  },
  hr: {
    label: "HR view",
    role: "HR / Payroll Owner",
    scope: "Can manage people records, team membership, attendance exceptions, payroll setup, access status and employee compliance.",
    allowed: ["organization", "workforce", "teams", "attendance", "access-control", "payroll", "compliance"],
    actions: ["Update employee setup", "Validate attendance lock", "Prepare payroll", "Track labour compliance"],
  },
  member: {
    label: "Member view",
    role: "Resource / Employee",
    scope: "Can view own profile, team, attendance, allocation, payslip readiness, performance and compliance status.",
    allowed: ["workforce", "teams", "attendance", "allocation", "payroll", "performance", "compliance"],
    actions: ["View own linked records", "Check attendance", "View assignment", "Track payslip and compliance"],
  },
};

const linkedResourceRecord = {
  employee: "Aarav Sharma",
  employeeId: "EMP-1041",
  role: "Site Engineer",
  site: "Downtown Tower - Tower A",
  team: "Civil Core Team",
  manager: "Ravi Kumar",
  payrollMonth: "May 2026",
  flow: {
    organization: { owner: "Ravi Kumar", status: "Mapped", detail: "Reports to Civil Execution Lead" },
    workforce: { owner: "HR", status: "Active", detail: "Profile, skill, bank and document records synced" },
    teams: { owner: "Team Lead", status: "Assigned", detail: "Civil Core Team, day shift, Tower A" },
    attendance: { owner: "Site Engineer", status: "Locked", detail: "24 present, 1 half-day, 6 OT hours" },
    "access-control": { owner: "Admin", status: "Granted", detail: "Member access with site engineer permissions" },
    allocation: { owner: "Planning", status: "Allocated", detail: "Podium slab pour and inspection coordination" },
    payroll: { owner: "HR", status: "Draft linked", detail: "Attendance, OT, advance and PF pulled into draft payroll" },
    performance: { owner: "PM", status: "82/100", detail: "Task efficiency and site reporting included in scorecard" },
    compliance: { owner: "Safety", status: "Valid", detail: "Induction, PPE and ID verification valid" },
  } satisfies Record<ResourceSection, { owner: string; status: string; detail: string }>,
};

const resourceModuleFlowLinks: Record<
  ResourceSection,
  {
    recordId: string;
    inputFrom: ResourceSection[];
    outputTo: ResourceSection[];
    dataObjects: string[];
    checks: string[];
    blockers: string[];
    nextAction: string;
  }
> = {
  organization: {
    recordId: "ORG-MAP-1041",
    inputFrom: [],
    outputTo: ["workforce", "teams", "access-control"],
    dataObjects: ["Reporting manager", "Department", "Role hierarchy", "Stakeholder map"],
    checks: ["Employee must have one manager", "Role must exist in hierarchy", "Stakeholders mapped before agenda generation"],
    blockers: [],
    nextAction: "Keep reporting owner synced before team or access changes.",
  },
  workforce: {
    recordId: "EMP-1041",
    inputFrom: ["organization"],
    outputTo: ["teams", "attendance", "payroll", "compliance"],
    dataObjects: ["Employee profile", "Skill tags", "Employment type", "Bank/UPI preference", "Document status"],
    checks: ["Active employee status", "Employment type selected", "Skill tag available for allocation", "Payroll identifiers complete"],
    blockers: [],
    nextAction: "Update skill or employment data before allocation and payroll runs.",
  },
  teams: {
    recordId: "TEAM-CIV-CORE",
    inputFrom: ["organization", "workforce"],
    outputTo: ["attendance", "allocation", "performance"],
    dataObjects: ["Team membership", "Team lead", "Shift", "Site assignment", "Task ownership"],
    checks: ["Team lead assigned", "Member belongs to active workforce", "Shift rule configured"],
    blockers: [],
    nextAction: "Validate current team strength before next allocation cycle.",
  },
  attendance: {
    recordId: "ATT-MAY-1041",
    inputFrom: ["workforce", "teams", "allocation"],
    outputTo: ["payroll", "performance"],
    dataObjects: ["Present days", "Half-day", "OT hours", "Late marks", "Attendance lock"],
    checks: ["Attendance must be locked for payroll", "OT must map to allocation/task", "Corrections require manager remarks"],
    blockers: [],
    nextAction: "Push locked attendance snapshot to payroll draft and performance score.",
  },
  "access-control": {
    recordId: "ACCESS-SITE-1041",
    inputFrom: ["organization", "workforce", "compliance"],
    outputTo: ["attendance", "allocation", "compliance"],
    dataObjects: ["Role permissions", "Site pass", "Module permissions", "Access expiry"],
    checks: ["Site pass valid", "Compliance not expired", "Role permission matches view"],
    blockers: [],
    nextAction: "Review access if compliance or role changes.",
  },
  allocation: {
    recordId: "ALLOC-PODIUM-1041",
    inputFrom: ["workforce", "teams", "attendance", "compliance"],
    outputTo: ["attendance", "performance"],
    dataObjects: ["Work package", "Site deployment", "Shift schedule", "Task load", "Skill match"],
    checks: ["No double allocation", "Certification valid", "Shift does not overlap", "Skill matches task"],
    blockers: [],
    nextAction: "Confirm next-week workload and push assigned tasks to performance.",
  },
  payroll: {
    recordId: "PAY-MAY-1041",
    inputFrom: ["workforce", "attendance"],
    outputTo: [],
    dataObjects: ["Salary setup", "Payable days", "OT earning", "PF", "Advance adjustment", "Net payable"],
    checks: ["Attendance locked", "Salary structure active", "Advance/loan adjustment reviewed", "Finance posting excluded"],
    blockers: [],
    nextAction: "Review draft payroll and mark ready for salary release calculation.",
  },
  performance: {
    recordId: "PERF-MAY-1041",
    inputFrom: ["teams", "attendance", "allocation"],
    outputTo: ["organization", "teams"],
    dataObjects: ["Task completion", "Attendance efficiency", "Productivity score", "Delay contribution", "Quality/safety signals"],
    checks: ["Task data linked", "Attendance efficiency calculated", "Delay reason captured"],
    blockers: [],
    nextAction: "Review low-score drivers and convert them into manager actions.",
  },
  compliance: {
    recordId: "COMP-1041",
    inputFrom: ["workforce", "access-control"],
    outputTo: ["access-control", "allocation", "attendance"],
    dataObjects: ["ID verification", "Safety induction", "PPE issue", "Certification expiry", "Site eligibility"],
    checks: ["Induction valid", "PPE issued", "ID verified", "Expired certificates block allocation/access"],
    blockers: [],
    nextAction: "Renew expiring safety training before access or allocation is blocked.",
  },
};

const resourceFlowAuditTrail = [
  { section: "workforce" as ResourceSection, event: "Employee profile updated", actor: "HR", result: "Bank, skill and employment records synced to payroll and allocation" },
  { section: "teams" as ResourceSection, event: "Team assignment confirmed", actor: "Team Lead", result: "Civil Core Team linked to attendance roster and performance scorecard" },
  { section: "attendance" as ResourceSection, event: "Attendance locked", actor: "Manager", result: "Payroll draft and performance attendance efficiency recalculated" },
  { section: "allocation" as ResourceSection, event: "Work package allocated", actor: "Planning", result: "Task load pushed to attendance shift plan and performance productivity" },
  { section: "compliance" as ResourceSection, event: "Safety induction verified", actor: "Safety Officer", result: "Access and allocation eligibility remains valid" },
];

const topKpis = [
  { label: "Live Headcount", value: "164", note: "126 direct, 38 contractor", icon: Users },
  { label: "Open Sites", value: "7", note: "Across 4 project clusters", icon: Building2 },
  { label: "Shift Coverage", value: "93%", note: "Day and night roster filled", icon: Clock3 },
  { label: "Compliance Health", value: "88%", note: "Certifications and IDs valid", icon: BadgeCheck },
];

const orgPeople: Record<string, OrgPerson> = {
  samuel: {
    id: "samuel",
    name: "Samuel Rodriguez",
    title: "Owner",
    department: "Executive Office",
    site: "HQ + Multi-site",
    email: "samuel@hubbuild.com",
    phone: "+91 98765 00210",
    reports: 4,
    badge: "Main Owner",
    tone: "bg-blue-50 text-blue-700 border-blue-100",
  },
  priya: {
    id: "priya",
    name: "Priya Menon",
    title: "Program Manager",
    department: "PMO",
    site: "Central Controls",
    email: "priya@hubbuild.com",
    phone: "+91 98765 00221",
    reports: 3,
    badge: "PMO",
    tone: "bg-violet-50 text-violet-700 border-violet-100",
  },
  arjun: {
    id: "arjun",
    name: "Arjun Mehta",
    title: "Construction Manager",
    department: "Construction",
    site: "Downtown Tower",
    email: "arjun@hubbuild.com",
    phone: "+91 98765 00232",
    reports: 4,
    badge: "Site",
    tone: "bg-amber-50 text-amber-700 border-amber-100",
  },
  meera: {
    id: "meera",
    name: "Meera Joshi",
    title: "Commercial Head",
    department: "Commercial Controls",
    site: "HQ + Shared Services",
    email: "meera@hubbuild.com",
    phone: "+91 98765 00244",
    reports: 2,
    badge: "Finance",
    tone: "bg-rose-50 text-rose-700 border-rose-100",
  },
  farhan: {
    id: "farhan",
    name: "Farhan Ali",
    title: "MEP Lead",
    department: "MEP Coordination",
    site: "Service Spine",
    email: "farhan@hubbuild.com",
    phone: "+91 98765 00256",
    reports: 3,
    badge: "MEP",
    tone: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  ravi: {
    id: "ravi",
    name: "Ravi Kumar",
    title: "Civil Execution Lead",
    department: "Civil Execution",
    site: "Tower A + Podium",
    email: "ravi@hubbuild.com",
    phone: "+91 98765 00267",
    reports: 5,
    badge: "Civil",
    tone: "bg-orange-50 text-orange-700 border-orange-100",
  },
  anika: {
    id: "anika",
    name: "Anika Shah",
    title: "Electrical Systems Lead",
    department: "Electrical Systems",
    site: "Utilities Block",
    email: "anika@hubbuild.com",
    phone: "+91 98765 00278",
    reports: 3,
    badge: "Electrical",
    tone: "bg-indigo-50 text-indigo-700 border-indigo-100",
  },
  esther: {
    id: "esther",
    name: "Esther Howard",
    title: "Design Coordination Lead",
    department: "Design",
    site: "HQ Design Cell",
    email: "esther@hubbuild.com",
    phone: "+91 98765 00284",
    reports: 2,
    badge: "Design",
    tone: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
  },
  neil: {
    id: "neil",
    name: "Neil Dsouza",
    title: "Preconstruction Lead",
    department: "Planning",
    site: "Tender Cell",
    email: "neil@hubbuild.com",
    phone: "+91 98765 00295",
    reports: 2,
    badge: "Planning",
    tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  christie: {
    id: "christie",
    name: "Christie Das",
    title: "QA/QC Manager",
    department: "Quality",
    site: "Tower A",
    email: "christie@hubbuild.com",
    phone: "+91 98765 00307",
    reports: 2,
    badge: "QA/QC",
    tone: "bg-slate-100 text-slate-700 border-slate-200",
  },
  hannah: {
    id: "hannah",
    name: "Hannah Harris",
    title: "HR and Labor Control",
    department: "People Ops",
    site: "Shared Services",
    email: "hannah@hubbuild.com",
    phone: "+91 98765 00318",
    reports: 2,
    badge: "HR",
    tone: "bg-pink-50 text-pink-700 border-pink-100",
  },
  kabir: {
    id: "kabir",
    name: "Kabir Soni",
    title: "Survey Lead",
    department: "Survey",
    site: "Airport Apron Upgrade",
    email: "kabir@hubbuild.com",
    phone: "+91 98765 00329",
    reports: 2,
    badge: "Survey",
    tone: "bg-lime-50 text-lime-700 border-lime-100",
  },
  devika: {
    id: "devika",
    name: "Devika Rao",
    title: "Safety Manager",
    department: "EHS",
    site: "Downtown Tower",
    email: "devika@hubbuild.com",
    phone: "+91 98765 00341",
    reports: 3,
    badge: "Safety",
    tone: "bg-red-50 text-red-700 border-red-100",
  },
  omar: {
    id: "omar",
    name: "Omar Sheikh",
    title: "Procurement Lead",
    department: "Procurement",
    site: "Shared Services",
    email: "omar@hubbuild.com",
    phone: "+91 98765 00355",
    reports: 2,
    badge: "Procurement",
    tone: "bg-yellow-50 text-yellow-700 border-yellow-100",
  },
  tanvi: {
    id: "tanvi",
    name: "Tanvi Bhat",
    title: "Planning Engineer",
    department: "Planning",
    site: "PMO",
    email: "tanvi@hubbuild.com",
    phone: "+91 98765 00366",
    reports: 1,
    badge: "Planning",
    tone: "bg-blue-50 text-blue-700 border-blue-100",
  },
};

const orgRows = {
  top: ["samuel"],
  middle: ["priya", "arjun", "meera", "farhan", "omar"],
  lower: ["ravi", "anika", "esther", "neil", "christie", "hannah", "kabir", "devika", "tanvi"],
};

const orgChildrenByManager: Record<string, string[]> = {
  samuel: ["priya", "arjun", "meera", "farhan", "omar"],
  priya: ["esther", "neil", "tanvi"],
  arjun: ["ravi", "anika", "devika"],
  meera: ["hannah"],
  farhan: ["christie"],
  omar: ["kabir"],
};

const defaultEmployeeForm: NewOrgEmployeeForm = {
  name: "Aarav Sharma",
  title: "Site Engineer",
  department: "Civil Execution",
  site: "Downtown Tower",
  email: "aarav.sharma@hubbuild.com",
  phone: "+91 98765 00421",
  employment: "Full-time",
  managerId: "arjun",
};

const orgRoleOptions = [
  // Executive and Leadership
  "Owner",
  "Managing Director",
  "Chief Operating Officer",
  "Chief Technical Officer",
  "VP of Construction",
  "VP of Design",

  // Project Management
  "Project Director",
  "Project Manager",
  "Deputy Project Manager",
  "Assistant Project Manager",
  "Project Coordinator",
  "Project Controls Manager",
  "PMO Lead",

  // Construction Management
  "Construction Manager",
  "Deputy Construction Manager",
  "General Superintendent",
  "Area Superintendent",
  "Site Manager",
  "Section Engineer",
  "Site Engineer",
  "Junior Site Engineer",
  "Field Engineer",
  "Construction Coordinator",

  // BIM and Digital Delivery
  "BIM Director",
  "BIM Manager",
  "BIM Coordinator",
  "BIM Modeler",
  "BIM Technician",
  "Revit Modeler",
  "Navisworks Coordinator",
  "Clash Detection Specialist",
  "Digital Delivery Manager",
  "Digital Twin Engineer",
  "Scan-to-BIM Specialist",
  "Point Cloud Technician",
  "VDC Manager",
  "VDC Engineer",
  "BIM Standards Lead",
  "LOD Specialist",
  "4D Planner",
  "5D BIM Estimator",
  "GIS Specialist",
  "CAD Drafter",
  "CAD Technician",
  "CDE Administrator",

  // Structural and Civil
  "Structural Engineer",
  "Civil Engineer",
  "Civil Execution Lead",
  "Geotechnical Engineer",
  "Foundation Engineer",
  "Reinforcement Detailer",
  "Concrete Technologist",
  "Formwork Engineer",
  "Temporary Works Engineer",
  "Demolition Specialist",
  "Piling Supervisor",
  "Earthworks Supervisor",

  // MEP Engineering
  "MEP Director",
  "MEP Lead",
  "MEP Coordinator",
  "Mechanical Engineer",
  "HVAC Engineer",
  "HVAC Technician",
  "Plumbing Engineer",
  "Plumbing Supervisor",
  "Fire Protection Engineer",
  "Fire Alarm Technician",
  "Sprinkler Fitter",
  "Electrical Engineer",
  "Electrical Supervisor",
  "Instrumentation Engineer",
  "Controls Engineer",
  "ELV Engineer",
  "ELV Technician",
  "Building Automation Engineer",
  "BMS Specialist",
  "Lift and Elevator Engineer",
  "Commissioning Engineer",
  "Commissioning Manager",
  "TAB Technician",

  // Architecture and Design
  "Design Manager",
  "Design Coordinator",
  "Architect",
  "Senior Architect",
  "Interior Designer",
  "Landscape Architect",
  "Facade Engineer",
  "Facade Consultant",
  "Lighting Designer",
  "Acoustic Consultant",

  // Planning and Scheduling
  "Planning Director",
  "Planning Manager",
  "Planning Engineer",
  "Senior Planner",
  "Scheduler",
  "Look-ahead Planner",
  "Delay Analyst",
  "Forensic Planner",
  "Preconstruction Lead",
  "Preconstruction Manager",

  // Cost and Commercial
  "Commercial Director",
  "Commercial Manager",
  "Quantity Surveyor",
  "Senior Quantity Surveyor",
  "Cost Engineer",
  "Cost Estimator",
  "Estimating Manager",
  "Contract Administrator",
  "Contracts Manager",
  "Claims Specialist",
  "Billing Engineer",
  "Procurement Manager",
  "Procurement Lead",
  "Procurement Officer",
  "Buyer",
  "Subcontract Manager",

  // Quality and Compliance
  "QA/QC Director",
  "QA/QC Manager",
  "QA/QC Engineer",
  "QA/QC Inspector",
  "Quality Auditor",
  "Welding Inspector",
  "NDT Technician",
  "Materials Testing Engineer",
  "Compliance Officer",
  "Document Controller",
  "Senior Document Controller",

  // Safety and Environment
  "HSE Director",
  "HSE Manager",
  "Safety Manager",
  "Safety Officer",
  "Safety Supervisor",
  "Safety Inspector",
  "Environmental Engineer",
  "Environmental Officer",
  "Fire Safety Officer",
  "Occupational Health Specialist",
  "Permit Coordinator",
  "Risk Manager",

  // Survey and Geomatics
  "Survey Manager",
  "Survey Lead",
  "Land Surveyor",
  "Setting-out Engineer",
  "Topographic Surveyor",
  "Drone / UAV Operator",
  "Hydrographic Surveyor",
  "Monitoring Surveyor",

  // Logistics and Site Operations
  "Logistics Manager",
  "Logistics Coordinator",
  "Material Controller",
  "Warehouse Manager",
  "Store Keeper",
  "Equipment Manager",
  "Plant Manager",
  "Crane Operator",
  "Heavy Equipment Operator",
  "Transport Coordinator",
  "Traffic Management Officer",
  "Site Administrator",
  "Camp Boss",

  // HR and People Operations
  "HR Manager",
  "HR Officer",
  "Recruitment Specialist",
  "Training Coordinator",
  "Payroll Officer",
  "Labor Relations Officer",
  "Timekeeper",
  "Industrial Relations Manager",

  // IT and Systems
  "IT Manager",
  "Systems Administrator",
  "Network Engineer",
  "Software Developer",
  "Data Analyst",
  "Cybersecurity Specialist",

  // Supervision and Trades
  "General Foreman",
  "Foreman",
  "Trade Foreman",
  "Charge Hand",
  "Steel Fixer Foreman",
  "Shuttering Foreman",
  "Finishing Foreman",

  // Skilled Trades and Labor
  "Carpenter",
  "Steel Fixer",
  "Mason",
  "Bricklayer",
  "Plasterer",
  "Tiler",
  "Painter",
  "Waterproofer",
  "Roofer",
  "Glazier",
  "Welder",
  "Pipe Fitter",
  "Duct Installer",
  "Cable Jointer",
  "Electrician",
  "Plumber",
  "Scaffolder",
  "Rigger",
  "Signalman",
  "Concrete Pump Operator",
  "Batching Plant Operator",
  "Crusher Operator",
  "Skilled Worker",
  "Semi-skilled Worker",
  "General Worker",
  "Helper",
  "Laborer",
];

const defaultRoleHierarchy = [
  // Executive
  { role: "Owner", parent: "Top level", level: "Owner", order: 1 },
  { role: "Managing Director", parent: "Owner", level: "Executive", order: 1 },
  { role: "Chief Operating Officer", parent: "Owner", level: "Executive", order: 1 },
  { role: "Chief Technical Officer", parent: "Owner", level: "Executive", order: 1 },
  { role: "Admin", parent: "Owner", level: "Administration", order: 2 },

  // Leadership
  { role: "VP of Construction", parent: "Managing Director", level: "Director", order: 2 },
  { role: "VP of Design", parent: "Managing Director", level: "Director", order: 2 },
  { role: "Project Director", parent: "VP of Construction", level: "Director", order: 2 },

  // Project Management
  { role: "Project Manager", parent: "Project Director", level: "Manager", order: 3 },
  { role: "Deputy Project Manager", parent: "Project Manager", level: "Manager", order: 3 },
  { role: "PMO Lead", parent: "Project Director", level: "Manager", order: 3 },
  { role: "Project Controls Manager", parent: "Project Director", level: "Manager", order: 3 },
  { role: "Project Coordinator", parent: "Project Manager", level: "Coordinator", order: 4 },

  // Construction
  { role: "Construction Manager", parent: "Project Manager", level: "Manager", order: 3 },
  { role: "Deputy Construction Manager", parent: "Construction Manager", level: "Manager", order: 4 },
  { role: "General Superintendent", parent: "Construction Manager", level: "Superintendent", order: 4 },
  { role: "Area Superintendent", parent: "General Superintendent", level: "Superintendent", order: 5 },
  { role: "Site Manager", parent: "Construction Manager", level: "Manager", order: 4 },

  // Civil and Structural
  { role: "Civil Execution Lead", parent: "Construction Manager", level: "Team Lead", order: 4 },
  { role: "Structural Engineer", parent: "Civil Execution Lead", level: "Engineer", order: 5 },
  { role: "Site Engineer", parent: "Civil Execution Lead", level: "Engineer", order: 5 },
  { role: "Field Engineer", parent: "Site Engineer", level: "Engineer", order: 6 },
  { role: "Formwork Engineer", parent: "Civil Execution Lead", level: "Engineer", order: 5 },
  { role: "Temporary Works Engineer", parent: "Civil Execution Lead", level: "Engineer", order: 5 },

  // MEP
  { role: "MEP Director", parent: "Construction Manager", level: "Director", order: 3 },
  { role: "MEP Lead", parent: "MEP Director", level: "Team Lead", order: 4 },
  { role: "MEP Coordinator", parent: "MEP Lead", level: "Coordinator", order: 5 },
  { role: "Mechanical Engineer", parent: "MEP Lead", level: "Engineer", order: 5 },
  { role: "Electrical Engineer", parent: "MEP Lead", level: "Engineer", order: 5 },
  { role: "HVAC Engineer", parent: "Mechanical Engineer", level: "Engineer", order: 6 },
  { role: "Plumbing Engineer", parent: "Mechanical Engineer", level: "Engineer", order: 6 },
  { role: "Fire Protection Engineer", parent: "MEP Lead", level: "Engineer", order: 5 },
  { role: "ELV Engineer", parent: "Electrical Engineer", level: "Engineer", order: 6 },
  { role: "Commissioning Manager", parent: "MEP Director", level: "Manager", order: 4 },
  { role: "Commissioning Engineer", parent: "Commissioning Manager", level: "Engineer", order: 5 },

  // BIM and Digital Delivery
  { role: "BIM Director", parent: "VP of Design", level: "Director", order: 2 },
  { role: "BIM Manager", parent: "BIM Director", level: "Manager", order: 3 },
  { role: "BIM Coordinator", parent: "BIM Manager", level: "Coordinator", order: 4 },
  { role: "BIM Modeler", parent: "BIM Coordinator", level: "Technician", order: 5 },
  { role: "BIM Technician", parent: "BIM Coordinator", level: "Technician", order: 5 },
  { role: "Revit Modeler", parent: "BIM Coordinator", level: "Technician", order: 5 },
  { role: "Navisworks Coordinator", parent: "BIM Manager", level: "Coordinator", order: 4 },
  { role: "Clash Detection Specialist", parent: "BIM Manager", level: "Specialist", order: 4 },
  { role: "VDC Manager", parent: "BIM Director", level: "Manager", order: 3 },
  { role: "VDC Engineer", parent: "VDC Manager", level: "Engineer", order: 4 },
  { role: "Digital Delivery Manager", parent: "BIM Director", level: "Manager", order: 3 },
  { role: "Digital Twin Engineer", parent: "Digital Delivery Manager", level: "Engineer", order: 4 },
  { role: "Scan-to-BIM Specialist", parent: "BIM Manager", level: "Specialist", order: 4 },
  { role: "4D Planner", parent: "BIM Manager", level: "Specialist", order: 4 },
  { role: "5D BIM Estimator", parent: "BIM Manager", level: "Specialist", order: 4 },
  { role: "BIM Standards Lead", parent: "BIM Director", level: "Lead", order: 3 },
  { role: "LOD Specialist", parent: "BIM Standards Lead", level: "Specialist", order: 4 },
  { role: "CDE Administrator", parent: "BIM Manager", level: "Administrator", order: 4 },
  { role: "CAD Drafter", parent: "BIM Coordinator", level: "Technician", order: 5 },
  { role: "GIS Specialist", parent: "Digital Delivery Manager", level: "Specialist", order: 4 },

  // Design
  { role: "Design Manager", parent: "VP of Design", level: "Manager", order: 3 },
  { role: "Design Coordinator", parent: "Design Manager", level: "Coordinator", order: 4 },
  { role: "Architect", parent: "Design Manager", level: "Professional", order: 4 },
  { role: "Facade Engineer", parent: "Design Manager", level: "Engineer", order: 4 },

  // Planning
  { role: "Planning Director", parent: "Project Director", level: "Director", order: 2 },
  { role: "Planning Manager", parent: "Planning Director", level: "Manager", order: 3 },
  { role: "Planning Engineer", parent: "Planning Manager", level: "Engineer", order: 4 },
  { role: "Scheduler", parent: "Planning Manager", level: "Specialist", order: 4 },
  { role: "Preconstruction Lead", parent: "Planning Director", level: "Lead", order: 3 },

  // Commercial
  { role: "Commercial Director", parent: "Project Director", level: "Director", order: 2 },
  { role: "Commercial Manager", parent: "Commercial Director", level: "Manager", order: 3 },
  { role: "Quantity Surveyor", parent: "Commercial Manager", level: "Professional", order: 4 },
  { role: "Cost Engineer", parent: "Commercial Manager", level: "Engineer", order: 4 },
  { role: "Contracts Manager", parent: "Commercial Director", level: "Manager", order: 3 },
  { role: "Procurement Manager", parent: "Commercial Director", level: "Manager", order: 3 },
  { role: "Procurement Lead", parent: "Procurement Manager", level: "Lead", order: 4 },

  // QA/QC
  { role: "QA/QC Director", parent: "Project Director", level: "Director", order: 2 },
  { role: "QA/QC Manager", parent: "QA/QC Director", level: "Manager", order: 3 },
  { role: "QA/QC Engineer", parent: "QA/QC Manager", level: "Engineer", order: 4 },
  { role: "QA/QC Inspector", parent: "QA/QC Engineer", level: "Inspector", order: 5 },

  // Safety
  { role: "HSE Director", parent: "Project Director", level: "Director", order: 2 },
  { role: "HSE Manager", parent: "HSE Director", level: "Manager", order: 3 },
  { role: "Safety Manager", parent: "HSE Manager", level: "Manager", order: 4 },
  { role: "Safety Officer", parent: "Safety Manager", level: "Officer", order: 5 },
  { role: "Environmental Engineer", parent: "HSE Manager", level: "Engineer", order: 4 },

  // Survey
  { role: "Survey Manager", parent: "Construction Manager", level: "Manager", order: 4 },
  { role: "Survey Lead", parent: "Survey Manager", level: "Lead", order: 5 },
  { role: "Land Surveyor", parent: "Survey Lead", level: "Technician", order: 6 },
  { role: "Setting-out Engineer", parent: "Survey Lead", level: "Engineer", order: 6 },
  { role: "Drone / UAV Operator", parent: "Survey Manager", level: "Technician", order: 5 },

  // Supervision
  { role: "General Foreman", parent: "Area Superintendent", level: "Supervisor", order: 5 },
  { role: "Foreman", parent: "General Foreman", level: "Supervisor", order: 6 },
  { role: "Trade Foreman", parent: "General Foreman", level: "Supervisor", order: 6 },
  { role: "Charge Hand", parent: "Foreman", level: "Supervisor", order: 7 },

  // Labor
  { role: "Skilled Worker", parent: "Foreman", level: "Worker", order: 7 },
  { role: "Semi-skilled Worker", parent: "Foreman", level: "Worker", order: 7 },
  { role: "General Worker", parent: "Foreman", level: "Worker", order: 8 },
  { role: "Helper", parent: "Charge Hand", level: "Worker", order: 8 },
  { role: "Laborer", parent: "Charge Hand", level: "Worker", order: 8 },
];

const roleDesignationOptions = [
  "Executive",
  "Director",
  "Manager",
  "Team Lead",
  "Supervisor",
  "Engineer",
  "Coordinator",
  "Inspector",
  "Technician",
  "Worker",
  "Administration",
];

const getDefaultRoleDesignation = (level: string) => {
  if (level.includes("Owner") || level.includes("Executive")) return "Executive";
  if (level.includes("Director")) return "Director";
  if (level.includes("Manager")) return "Manager";
  if (level.includes("Lead")) return "Team Lead";
  if (level.includes("Supervisor") || level.includes("Superintendent")) return "Supervisor";
  if (level.includes("Engineer")) return "Engineer";
  if (level.includes("Coordinator")) return "Coordinator";
  if (level.includes("Inspector")) return "Inspector";
  if (level.includes("Technician")) return "Technician";
  if (level.includes("Worker")) return "Worker";
  return "Administration";
};

const defaultRoleDesignations = Object.fromEntries(defaultRoleHierarchy.map((item) => [item.role, getDefaultRoleDesignation(item.level)]));

const orgRoleAccessRows = [
  { role: "Owner", scope: "Full organization", actions: ["Create structure", "Approve payroll", "Manage roles", "Delete records"] },
  { role: "Admin", scope: "All projects", actions: ["Create structure", "Manage roles", "Invite people", "Export reports"] },
  { role: "Manager", scope: "Assigned project", actions: ["Add people", "Assign teams", "Approve attendance", "View payroll"] },
  { role: "Employee", scope: "Own profile", actions: ["View profile", "Submit leave", "Upload documents", "View tasks"] },
];

const defaultStakeholders: OrgStakeholder[] = [
  {
    id: "stakeholder-1",
    name: "Amitabh Rao",
    category: "Client",
    organization: "Downtown Developments",
    role: "Client Sponsor",
    project: "Downtown Tower Complex",
    contact: "+91 98765 30201",
    email: "amitabh.rao@downtowndev.in",
    influence: "High",
    status: "Active",
    lastTouch: "Weekly progress review",
  },
  {
    id: "stakeholder-2",
    name: "Neha Kapoor",
    category: "Consultant",
    organization: "Axis Design Studio",
    role: "Lead Architect",
    project: "Downtown Tower Complex",
    contact: "+91 98765 30222",
    email: "neha.kapoor@axisdesign.in",
    influence: "High",
    status: "Active",
    lastTouch: "Drawing approval pending",
  },
  {
    id: "stakeholder-3",
    name: "Rohit Malhotra",
    category: "Contractor",
    organization: "Urban Workforce Co.",
    role: "Resource Partner",
    project: "Podium Package",
    contact: "+91 99000 44110",
    email: "rohit@urbanworkforce.co",
    influence: "Medium",
    status: "Watchlist",
    lastTouch: "Labour ramp-up discussion",
  },
  {
    id: "stakeholder-4",
    name: "Meera Sanyal",
    category: "Authority",
    organization: "Municipal Safety Office",
    role: "Permit Reviewer",
    project: "Downtown Tower Complex",
    contact: "+91 98765 30244",
    email: "meera.sanyal@gov.example",
    influence: "Critical",
    status: "Follow-up",
    lastTouch: "Fire NOC clarification",
  },
];

const defaultStakeholderTasks: StakeholderLinkedTask[] = [
  {
    id: "task-stk-1",
    stakeholderId: "stakeholder-1",
    title: "Approve podium revised pour sequence",
    source: "Planning module",
    status: "Pending decision",
    priority: "Critical",
    owner: "Ravi Kumar",
    due: "Today",
    agendaHint: "Confirm client acceptance for night pour and revised access window.",
  },
  {
    id: "task-stk-2",
    stakeholderId: "stakeholder-1",
    title: "Resolve milestone recovery baseline",
    source: "Task module",
    status: "Blocked",
    priority: "High",
    owner: "Priya Menon",
    due: "Tomorrow",
    agendaHint: "Agree recovery target, owner, and approval cutoff.",
  },
  {
    id: "task-stk-3",
    stakeholderId: "stakeholder-2",
    title: "Release facade shop drawing comments",
    source: "Planning module",
    status: "Overdue",
    priority: "High",
    owner: "Kritika Nair",
    due: "Overdue 2d",
    agendaHint: "Close open design comments delaying facade procurement.",
  },
  {
    id: "task-stk-4",
    stakeholderId: "stakeholder-2",
    title: "Confirm lobby ceiling coordination markup",
    source: "Task module",
    status: "In review",
    priority: "Medium",
    owner: "Farhan Ali",
    due: "May 18",
    agendaHint: "Validate final drawing ownership before site release.",
  },
  {
    id: "task-stk-5",
    stakeholderId: "stakeholder-3",
    title: "Mobilize 18 additional shuttering carpenters",
    source: "Allocation module",
    status: "At risk",
    priority: "High",
    owner: "Harish Patel",
    due: "This week",
    agendaHint: "Confirm ramp-up date, attendance lock, and backup crew.",
  },
  {
    id: "task-stk-6",
    stakeholderId: "stakeholder-4",
    title: "Submit fire NOC clarification pack",
    source: "Compliance module",
    status: "Pending submission",
    priority: "Critical",
    owner: "Meera Joshi",
    due: "Today",
    agendaHint: "Review missing compliance evidence and submission sequence.",
  },
];

const departmentRows = [
  { department: "Civil Execution", head: "Ravi Kumar", managers: 4, sites: "Tower A, Podium, Parking", ownership: "Structure and concrete scope" },
  { department: "Electrical Systems", head: "Anika Shah", managers: 3, sites: "Tower A, Utilities Block", ownership: "Power, lighting, LV packages" },
  { department: "MEP Coordination", head: "Farhan Ali", managers: 2, sites: "Tower A, Service Spine", ownership: "HVAC, plumbing and clash closure" },
  { department: "Commercial Controls", head: "Meera Joshi", managers: 2, sites: "HQ + shared services", ownership: "Billing, cost and contractor administration" },
];

const workforceRoster = [
  { name: "Rahul Verma", role: "Senior Site Engineer", trade: "Civil", phone: "+91 98765 10021", status: "Active", employment: "Full-time", project: "Downtown Tower" },
  { name: "Nisha Iyer", role: "Quantity Surveyor", trade: "Commercial", phone: "+91 98765 10044", status: "On Leave", employment: "Full-time", project: "HQ Controls" },
  { name: "Harish Patel", role: "Foreman", trade: "Shuttering", phone: "+91 98765 10058", status: "Active", employment: "Contract", project: "Podium Package" },
  { name: "Zubair Khan", role: "Electrical Supervisor", trade: "Electrical", phone: "+91 98765 10077", status: "Mobilizing", employment: "Contract", project: "Tech Park Phase 2" },
  { name: "Kritika Nair", role: "BIM Coordinator", trade: "Digital Delivery", phone: "+91 98765 10088", status: "Active", employment: "Full-time", project: "Smart Campus Replica" },
];

const workforceMix = [
  { label: "Civil and concrete", count: 62, share: 38 },
  { label: "Electrical and ELV", count: 24, share: 15 },
  { label: "MEP and services", count: 31, share: 19 },
  { label: "Survey and QA/QC", count: 19, share: 12 },
  { label: "Support and admin", count: 28, share: 16 },
];

const teamRows = [
  { team: "Civil Core Team", site: "Downtown Tower", lead: "Ravi Kumar", strength: 42, status: "Full crew", contractor: "Urban Workforce Co.", shift: "Day + extended", productivity: "84" },
  { team: "Electrical Fitout Unit", site: "Tech Park Phase 2", lead: "Anika Shah", strength: 21, status: "Backfill needed", contractor: "VoltEdge Services", shift: "General", productivity: "76" },
  { team: "MEP Night Crew", site: "Downtown Tower", lead: "Farhan Ali", strength: 18, status: "Night shift active", contractor: "Prime MEP Services", shift: "Night", productivity: "88" },
  { team: "Survey and Layout Cell", site: "Airport Apron Upgrade", lead: "Kabir Soni", strength: 11, status: "Deployed", contractor: "Acme Surveys", shift: "Day", productivity: "72" },
];

const attendanceSummary = [
  { label: "Present today", value: "142", tone: "bg-emerald-50 text-emerald-700" },
  { label: "Absent", value: "14", tone: "bg-rose-50 text-rose-700" },
  { label: "On leave", value: "8", tone: "bg-amber-50 text-amber-700" },
  { label: "Overtime logged", value: "36h", tone: "bg-sky-50 text-sky-700" },
];

const shiftRows = [
  { shift: "Day Shift", site: "Downtown Tower", checkIn: "06:45", checkOut: "18:15", coverage: "94%", supervisor: "Ravi Kumar", late: 5 },
  { shift: "Night Shift", site: "Downtown Tower", checkIn: "19:10", checkOut: "05:40", coverage: "88%", supervisor: "Farhan Ali", late: 2 },
  { shift: "General Shift", site: "Tech Park Phase 2", checkIn: "08:00", checkOut: "17:30", coverage: "97%", supervisor: "Anika Shah", late: 1 },
];

const accessRows = [
  { role: "Project Director", module: "All modules", approval: "Final approver", sites: "All sites", status: "Granted" },
  { role: "Site Engineer", module: "Resources, Data, Procurement", approval: "Section approvals", sites: "Assigned sites", status: "Granted" },
  { role: "Contractor Admin", module: "Attendance, Workforce", approval: "No financial approvals", sites: "Contract sites", status: "Restricted" },
  { role: "Visitor / Auditor", module: "Read-only dashboards", approval: "No approvals", sites: "Scheduled only", status: "Time-bound" },
];

const allocationRows = [
  { resource: "Civil manpower", assigned: "54 / 62", utilization: 87, site: "Downtown Tower", note: "Podium and core wall pour" },
  { resource: "Electrical crew", assigned: "19 / 24", utilization: 79, site: "Tech Park Phase 2", note: "Cable tray and first-fix" },
  { resource: "MEP specialists", assigned: "27 / 31", utilization: 87, site: "Smart Campus Replica", note: "Plantroom coordination" },
  { resource: "Survey team", assigned: "15 / 19", utilization: 79, site: "Airport Apron Upgrade", note: "Control and as-built checks" },
];

type AllocationTab =
  | "overview"
  | "manpower"
  | "equipment"
  | "tasks-site"
  | "shifts-availability"
  | "utilization-conflicts"
  | "requests-pool"
  | "reports-admin";

const allocationTabs: { key: AllocationTab; label: string; caption: string }[] = [
  { key: "overview", label: "Overview", caption: "Allocation dashboard, deployment heatmap and workflow" },
  { key: "manpower", label: "Manpower", caption: "Engineers, supervisors, labour, operators and contractor deployment" },
  { key: "equipment", label: "Equipment", caption: "Machinery allocation, certification blocks and idle tracking" },
  { key: "tasks-site", label: "Tasks & Site", caption: "Work package allocation, site deployment and transfers" },
  { key: "shifts-availability", label: "Shifts & Availability", caption: "Shift scheduling, real-time availability and smart matching" },
  { key: "utilization-conflicts", label: "Utilization & Conflicts", caption: "Workload balancing, conflict detection and optimization" },
  { key: "requests-pool", label: "Requests & Pool", caption: "Deployment requests and centralized resource pool planning" },
  { key: "reports-admin", label: "Reports & Admin", caption: "Reports, permissions, APIs, validations, integrations and audit logs" },
];

const allocationDashboardMetrics = [
  { label: "Allocated manpower", value: "148", note: "Across 7 active sites and 3 shifts", icon: Users, tone: "bg-violet-600 text-white" },
  { label: "Unallocated manpower", value: "16", note: "9 standby, 7 skill-mismatch pending", icon: UserCheck, tone: "bg-slate-950 text-white" },
  { label: "Equipment allocated", value: "42 / 57", note: "6 reserved, 4 under maintenance", icon: HardHat, tone: "bg-sky-600 text-white" },
  { label: "Resource utilization", value: "87%", note: "Target range 80-90%", icon: TrendingUp, tone: "bg-emerald-600 text-white" },
  { label: "Resource conflicts", value: "11", note: "Double allocation, shift overlap and expired certificate", icon: SlidersHorizontal, tone: "bg-rose-600 text-white" },
  { label: "Upcoming deployments", value: "23", note: "Next 14 days", icon: Calendar, tone: "bg-amber-500 text-white" },
];

const allocationKpiCards = [
  { label: "Overallocated resources", value: "8", status: "Critical", tone: "bg-rose-50 text-rose-700", width: 72 },
  { label: "Underutilized resources", value: "19", status: "Optimize", tone: "bg-amber-50 text-amber-700", width: 64 },
  { label: "Shift allocations", value: "93%", status: "Covered", tone: "bg-emerald-50 text-emerald-700", width: 93 },
  { label: "Task assignment progress", value: "81%", status: "On track", tone: "bg-sky-50 text-sky-700", width: 81 },
  { label: "Idle resources", value: "14", status: "Review", tone: "bg-amber-50 text-amber-700", width: 58 },
  { label: "Deployment delays", value: "6", status: "Watch", tone: "bg-rose-50 text-rose-700", width: 52 },
  { label: "Site manpower readiness", value: "89%", status: "Ready", tone: "bg-emerald-50 text-emerald-700", width: 89 },
  { label: "Workload balance", value: "76", status: "Uneven", tone: "bg-amber-50 text-amber-700", width: 76 },
];

const allocationWorkflowSteps = [
  "Receive demand from WBS, task plan, site request or deployment planner",
  "Check availability, attendance, leave, shift, skill, certification and site eligibility",
  "Run conflict detection for double booking, overload, equipment status and transfer timing",
  "Allocate manpower, equipment, teams or contractors to project/site/task/shift",
  "Route deployment, transfer, overtime or emergency allocation for approval",
  "Publish schedule, notify assignees and track utilization, idle time and reassignment history",
];

const manpowerAllocationRows = [
  { name: "Rahul Verma", skill: "Site Engineer", availability: "Available", project: "Downtown Tower", site: "Tower A", tasks: "Core wall pour", shift: "Day", workload: "82%", status: "Allocated" },
  { name: "Harish Patel", skill: "Foreman", availability: "On Shift", project: "Downtown Tower", site: "Podium", tasks: "Slab formwork", shift: "Day + OT", workload: "96%", status: "Overtime" },
  { name: "Suresh Yadav", skill: "Steel Fixer", availability: "Standby", project: "Unassigned", site: "Resource pool", tasks: "Backup", shift: "Day", workload: "18%", status: "Standby" },
  { name: "Deepa Krishnan", skill: "Safety Officer", availability: "Allocated", project: "Tech Park Phase 2", site: "Block B", tasks: "Height work permit", shift: "Night", workload: "74%", status: "Allocated" },
];

const equipmentAllocationRows = [
  { equipment: "Tower Crane TC-02", type: "Crane", availability: "Allocated", site: "Downtown Tower", operator: "R. Pillai", hours: "7.8h/day", idle: "1.2h", maintenance: "Clear", certification: "Valid 7d", status: "In Use" },
  { equipment: "Excavator EX-11", type: "Excavator", availability: "Reserved", site: "Airport Apron", operator: "K. Pawar", hours: "0h", idle: "Reserved", maintenance: "Clear", certification: "Valid", status: "Reserved" },
  { equipment: "Generator GN-07", type: "Generator", availability: "Blocked", site: "Tech Park", operator: "N/A", hours: "0h", idle: "18h", maintenance: "Under maintenance", certification: "Valid", status: "Under Maintenance" },
  { equipment: "Welding machine WM-18", type: "Welding", availability: "Available", site: "Resource pool", operator: "Unassigned", hours: "1.5h/day", idle: "6.5h", maintenance: "Clear", certification: "Expired", status: "Idle" },
];

const taskAllocationRows = [
  { task: "Cable tray first-fix", wbs: "MEP-EL-04", team: "Electrical Fitout", resource: "8 electricians + 1 supervisor", duration: "8 days", priority: "High", dependency: "Drawing approval", completion: "62%", risk: "Delay risk" },
  { task: "Podium slab pour", wbs: "CIV-ST-11", team: "Civil Core", resource: "22 labour + pump", duration: "3 days", priority: "Critical", dependency: "Rebar inspection", completion: "91%", risk: "On track" },
  { task: "AHU installation", wbs: "MEP-HVAC-07", team: "MEP Night Crew", resource: "Crane + 6 riggers", duration: "5 days", priority: "High", dependency: "Crane lifting permit", completion: "48%", risk: "Conflict" },
];

const siteDeploymentRows = [
  { deployment: "Civil labour transfer", from: "Podium", to: "Tower A", date: "18 May 2026", duration: "12 days", type: "Site transfer", readiness: "Ready", delay: "None" },
  { deployment: "Emergency electrician deployment", from: "Resource pool", to: "Tech Park", date: "17 May 2026", duration: "4 days", type: "Emergency", readiness: "Approval pending", delay: "1 day" },
  { deployment: "Survey team mobilization", from: "HQ", to: "Airport Apron", date: "20 May 2026", duration: "10 days", type: "Temporary", readiness: "Travel planned", delay: "None" },
];

const shiftScheduleRows = [
  { shift: "Day shift", timing: "06:30-18:30", manpower: "96", attendance: "94%", utilization: "88%", productivity: "High", conflict: "2 overlaps" },
  { shift: "Night shift", timing: "19:00-05:30", manpower: "38", attendance: "89%", utilization: "82%", productivity: "Medium", conflict: "1 shortage" },
  { shift: "Emergency shift", timing: "On call", manpower: "14", attendance: "N/A", utilization: "41%", productivity: "Standby", conflict: "None" },
];

const availabilityRows = [
  { pool: "Certified electricians", available: "7", match: "92%", blocker: "2 on leave", suggestion: "Use VoltEdge backup crew" },
  { pool: "Crane operators", available: "2", match: "78%", blocker: "1 license expiring", suggestion: "Assign certified operator R. Pillai" },
  { pool: "Safety officers", available: "3", match: "88%", blocker: "Night shift coverage", suggestion: "Move Deepa to night permit window" },
  { pool: "Surveyors", available: "4", match: "95%", blocker: "Travel time", suggestion: "Mobilize one day early" },
];

const utilizationRows = [
  { resource: "Harish Patel", type: "Foreman", utilization: "96%", overtime: "14h", idle: "0h", signal: "Overloaded", recommendation: "Split slab crew supervision" },
  { resource: "Welding machine WM-18", type: "Equipment", utilization: "18%", overtime: "0h", idle: "6.5h/day", signal: "Underutilized", recommendation: "Move to Tech Park after certification renewal" },
  { resource: "Electrical Fitout Unit", type: "Team", utilization: "91%", overtime: "22h", idle: "0h", signal: "High", recommendation: "Add 4 electricians for 5 days" },
  { resource: "Survey team", type: "Team", utilization: "67%", overtime: "0h", idle: "9h/week", signal: "Balanced", recommendation: "No action" },
];

const conflictRows = [
  { conflict: "Double allocation", resource: "Tower Crane TC-02", severity: "High", detail: "AHU lift overlaps with rebar cage lift", resolution: "Move AHU lift to night shift" },
  { conflict: "Expired certification", resource: "Welding machine WM-18", severity: "Critical", detail: "Certificate expired, allocation blocked", resolution: "Renew certificate before assignment" },
  { conflict: "Skill mismatch", resource: "Standby labour pool", severity: "Medium", detail: "Requested electricians, available workers are civil labour", resolution: "Suggest contractor backup" },
  { conflict: "Shift overlap", resource: "Harish Patel", severity: "High", detail: "Day shift + emergency shift exceeds workload cap", resolution: "Assign alternate foreman" },
];

const deploymentRequestRows = [
  { request: "REQ-DEP-1042", type: "Electricians", qty: "8", skill: "Cable tray + DB install", required: "17 May", duration: "6 days", priority: "Urgent", site: "Tech Park", status: "Under Review" },
  { request: "REQ-EQ-0881", type: "Excavator", qty: "1", skill: "Trench excavation", required: "20 May", duration: "10 days", priority: "High", site: "Airport Apron", status: "Approved" },
  { request: "REQ-SAFE-0318", type: "Safety officer", qty: "1", skill: "Night permit coverage", required: "16 May", duration: "3 nights", priority: "Urgent", site: "Downtown Tower", status: "Requested" },
];

const resourcePoolRows = [
  { pool: "Internal manpower", capacity: "126", allocated: "112", standby: "9", utilization: "89%", forecast: "Shortage in electrical next week" },
  { pool: "Contractor labour", capacity: "214", allocated: "181", standby: "21", utilization: "85%", forecast: "Civil crew surplus after 24 May" },
  { pool: "Equipment inventory", capacity: "57", allocated: "42", standby: "6", utilization: "74%", forecast: "Crane demand exceeds capacity by 2 days" },
  { pool: "Temporary labour", capacity: "48", allocated: "31", standby: "17", utilization: "65%", forecast: "Can cover emergency backfill" },
];

const allocationApprovalSteps = [
  { step: "Draft", owner: "Planner/Site Engineer", note: "Request or allocation draft created" },
  { step: "Requested", owner: "Site team", note: "Resource need submitted with skill, quantity and duration" },
  { step: "Under Review", owner: "Planning/HR/Equipment", note: "Availability, conflicts and eligibility checked" },
  { step: "Approved", owner: "Project Manager", note: "Deployment, transfer, overtime or equipment allocation approved" },
  { step: "Deployed", owner: "Site manager", note: "Resource moved to site and schedule published" },
  { step: "Completed", owner: "Planner", note: "Resource released and history retained" },
];

const allocationReports = [
  "Manpower allocation report",
  "Equipment allocation report",
  "Site deployment report",
  "Resource utilization report",
  "Shift report",
  "Workload analysis",
  "Idle resource report",
  "Overtime report",
  "Conflict report",
  "Allocation history",
  "Deployment timeline report",
];

const allocationPermissions = [
  { role: "Project Manager", access: "Allocate resources and approve deployments" },
  { role: "HR/Admin", access: "Manage manpower pool, availability and transfers" },
  { role: "Equipment Manager", access: "Allocate machinery and block unsafe equipment" },
  { role: "Site Engineer", access: "Request resources and view assigned deployment" },
  { role: "Planning Team", access: "Manage schedules, workload and deployment planning" },
  { role: "Management", access: "View utilization analytics and reports" },
  { role: "Contractor", access: "View assigned deployment only" },
];

const allocationTables = [
  { table: "resource_pools", columns: "resource_type, entity_id, skill, availability, utilization_history, current_allocation" },
  { table: "allocation_assignments", columns: "resource_id, project_id, site_id, task_id, shift_id, start_date, end_date, status" },
  { table: "deployment_requests", columns: "request_type, quantity, skill_requirement, required_date, duration, priority, site_id, status" },
  { table: "equipment_allocations", columns: "equipment_id, operator_id, site_id, usage_hours, idle_time, maintenance_status, certification_status" },
  { table: "allocation_conflicts", columns: "conflict_type, resource_id, severity, suggested_resolution, status, resolved_by" },
  { table: "allocation_audit_logs", columns: "actor, action, old_value, new_value, reason, timestamp, approval_status" },
];

const allocationValidations = [
  "Do not allocate resources already booked during the requested date/shift window.",
  "Block equipment allocation if certification is expired or maintenance status is blocking.",
  "Block manpower allocation when site eligibility, safety training or attendance status is invalid.",
  "Overtime allocation requires approval and workload cap validation.",
  "Emergency deployment must record reason, priority and approver.",
  "Released resources must update availability and allocation history.",
];

const allocationIntegrations = [
  "Attendance module",
  "Payroll module",
  "Task management module",
  "Timeline/Gantt module",
  "WBS module",
  "Equipment module",
  "Safety module",
  "HR module",
  "Contractor module",
  "Performance module",
];

const allocationApiSuggestions = [
  "GET /allocation/dashboard?projectId&siteId&dateRange",
  "POST /allocation/assignments",
  "POST /allocation/requests",
  "POST /allocation/conflicts/check",
  "GET /allocation/availability?skill&date&shift",
  "POST /allocation/optimize",
  "PATCH /allocation/assignments/:id/release",
];

const allocationAuditRows = [
  { action: "Resource allocated", actor: "Planning Team", detail: "8 electricians assigned to Tech Park Phase 2 for cable tray first-fix", time: "16 May 2026, 09:35" },
  { action: "Conflict resolved", actor: "Project Manager", detail: "Tower Crane TC-02 AHU lift moved to night shift", time: "16 May 2026, 11:10" },
  { action: "Equipment blocked", actor: "Equipment Manager", detail: "Welding machine WM-18 blocked due to expired certification", time: "16 May 2026, 12:20" },
];

const payrollRows = [
  {
    employee: "Rahul Verma",
    id: "EMP-1042",
    type: "Monthly",
    site: "Downtown Tower",
    attendance: "25.5 / 26 days",
    gross: "₹86,800",
    earnings: "₹11,600",
    deductions: "₹8,450",
    net: "₹89,950",
    status: "Pending Admin Approval",
    mode: "Bank",
    warning: "Attendance changed after draft. Recalculate required.",
    breakdown: [
      "Basic ₹62,000 + HRA ₹18,600 + TADA ₹4,200 + OT ₹3,400 + reimbursement ₹4,000",
      "PF ₹3,720 + advance ₹2,500 + loan EMI ₹1,800 + other deduction ₹430",
    ],
  },
  {
    employee: "Harish Patel",
    id: "LAB-2318",
    type: "Daily wage",
    site: "Podium Package",
    attendance: "23 / 26 days",
    gross: "₹31,050",
    earnings: "₹5,750",
    deductions: "₹4,200",
    net: "₹32,600",
    status: "HR Review",
    mode: "UPI",
    warning: "3 absent days auto-deducted from attendance lock.",
    breakdown: [
      "Daily wage ₹1,100 x 23 days + OT ₹2,950 + site allowance ₹2,800",
      "Absent deduction ₹3,300 + advance adjustment ₹900",
    ],
  },
  {
    employee: "Zubair Khan",
    id: "CON-0874",
    type: "Hourly",
    site: "Tech Park Phase 2",
    attendance: "184h + 14h OT",
    gross: "₹45,440",
    earnings: "₹8,940",
    deductions: "₹3,600",
    net: "₹50,780",
    status: "Ready for Salary Release",
    mode: "Cash",
    warning: "Night shift allowance included.",
    breakdown: [
      "Hourly ₹220 x 184h + OT ₹330 x 14h + night shift ₹4,320",
      "Loan EMI ₹2,500 + other deduction ₹1,100",
    ],
  },
];

const payrollDashboardMetrics = [
  { label: "Employees included", value: "164", note: "126 staff, 38 labour/contract", icon: Users, tone: "bg-slate-950 text-white" },
  { label: "Attendance locked", value: "151", note: "13 pending lock across 2 sites", icon: Fingerprint, tone: "bg-emerald-600 text-white" },
  { label: "Payroll drafts", value: "9", note: "3 need recalculation", icon: FileBadge2, tone: "bg-amber-500 text-white" },
  { label: "Pending approvals", value: "18", note: "PM: 11, Admin: 7", icon: ShieldCheck, tone: "bg-sky-600 text-white" },
  { label: "Revised payrolls", value: "4", note: "Old vs revised audit retained", icon: RotateCcw, tone: "bg-rose-600 text-white" },
  { label: "Net payable", value: "₹52.4L", note: "Ready calculation only, not paid", icon: Wallet, tone: "bg-cyan-700 text-white" },
];

const payrollMoneySummary = [
  { label: "Advance adjusted", value: "₹2.8L", caption: "Full + installment deductions" },
  { label: "Loans adjusted", value: "₹1.9L", caption: "Active EMI mapped to payroll" },
  { label: "Reimbursements", value: "₹74K", caption: "Approved claims included" },
  { label: "One-time payments", value: "₹1.2L", caption: "Bonus, incentives and rewards" },
  { label: "PF deductions", value: "₹3.6L", caption: "Payroll-only statutory deduction" },
  { label: "HRA + TADA", value: "₹9.4L", caption: "Allowance components" },
];

const payrollGenerationSteps = [
  "Select month and site/project",
  "Pull locked attendance",
  "Pull salary structure and active components",
  "Pull approved advances, reimbursements, loans and one-time payments",
  "Generate payroll draft",
  "Review employee-wise calculation and edit with remarks",
  "Submit for HR, project manager and admin approval",
  "Create salary release calculation for Finance view",
];

const payrollApprovalSteps = [
  { step: "Attendance Lock", owner: "Site timekeeper", status: "Complete", note: "Daily, biometric, manual and shift attendance frozen" },
  { step: "Payroll Draft", owner: "HR/Admin", status: "Complete", note: "Draft generated from locked attendance and salary setup" },
  { step: "HR Review", owner: "Payroll officer", status: "In review", note: "Edits require remarks and audit entries" },
  { step: "Project Approval", owner: "Project Manager", status: "Pending", note: "Site payroll validation before management approval" },
  { step: "Admin Approval", owner: "Management", status: "Pending", note: "Final approval creates release-ready calculation" },
  { step: "Salary Release Ready", owner: "Finance viewer", status: "Blocked", note: "No ledger, voucher or payment posting in payroll" },
];

const payrollSalarySetupRows = [
  { name: "Rahul Verma", type: "Monthly", basic: "₹62,000", hra: "30%", tada: "₹4,200", pf: "12%", overtime: "₹260/h", site: "Downtown Tower", payout: "Bank", status: "Active" },
  { name: "Harish Patel", type: "Daily wage", basic: "₹1,100/day", hra: "N/A", tada: "₹120/day", pf: "Not eligible", overtime: "₹180/h", site: "Podium Package", payout: "UPI", status: "Active" },
  { name: "Zubair Khan", type: "Hourly", basic: "₹220/h", hra: "N/A", tada: "₹140/day", pf: "Fixed ₹1,800", overtime: "1.5x", site: "Tech Park Phase 2", payout: "Cash", status: "Active" },
  { name: "Nisha Iyer", type: "Monthly", basic: "₹74,000", hra: "35%", tada: "₹5,000", pf: "12%", overtime: "N/A", site: "HQ Controls", payout: "Bank", status: "Inactive this cycle" },
];

const payrollAttendanceLinks = [
  { source: "Daily attendance", effect: "Present, absent, half-day, weekly off and holiday drive payable days." },
  { source: "Biometric/manual attendance", effect: "Manual corrections require lock owner and reason before draft generation." },
  { source: "Site and shift attendance", effect: "Maps labour cost to project/site and applies shift/night allowances." },
  { source: "Overtime and late marks", effect: "Adds OT earning or deduction rules based on salary structure." },
  { source: "Leave and unpaid leave", effect: "Paid leave keeps payable day; unpaid leave creates deduction." },
];

const payrollComponentRows = [
  { component: "Basic", type: "Earning", basis: "Monthly, daily or hourly", included: "Gross + net" },
  { component: "HRA", type: "Earning", basis: "Fixed or percentage", included: "Gross + net" },
  { component: "TADA / travel / food / site", type: "Earning", basis: "Fixed, per day or percentage", included: "Gross + net" },
  { component: "PF", type: "Deduction", basis: "Percentage or fixed", included: "Net deduction only" },
  { component: "Advance / loan EMI", type: "Deduction", basis: "Approved recovery schedule", included: "Auto-adjusted in payroll" },
  { component: "Other deduction", type: "Deduction", basis: "Manual with remarks", included: "Audit required" },
];

const payrollAuxiliaryFlows = [
  {
    title: "Advance Pay",
    icon: Wallet,
    status: "Auto-deduct",
    fields: ["Amount, date and reason", "Approved by and approval status", "Adjustment month", "Full or installment mode", "Remaining balance and history"],
  },
  {
    title: "Reimbursement",
    icon: FileBadge2,
    status: "Claim to payroll",
    fields: ["Travel, food, fuel, mobile, accommodation, site purchase", "Bill attachment", "Site/project mapping", "Approved amount", "Include in payroll toggle"],
  },
  {
    title: "One-Time Payment",
    icon: Coins,
    status: "Manual earning",
    fields: ["Bonus, incentive, festival or joining bonus", "Site allowance and special reward", "Payroll month", "Approval required", "Remarks"],
  },
  {
    title: "Employee Loan",
    icon: Briefcase,
    status: "EMI deduction",
    fields: ["Loan amount and reason", "EMI amount", "Start month and frequency", "Remaining balance", "Close loan and deduction history"],
  },
];

const payrollReleaseRows = [
  { output: "Employee-wise net payable", detail: "Final net salary after earnings, deductions, advances, loans and PF" },
  { output: "Site-wise payable summary", detail: "Labour cost summary by project/site for Finance review" },
  { output: "Bank payout sheet", detail: "Employee bank details and approved net payable" },
  { output: "UPI payout sheet", detail: "UPI IDs and approved net payable" },
  { output: "Cash payout sheet", detail: "Cash-mode employees only with acknowledgement status" },
  { output: "Finance handoff", detail: "Marked ready to send to Finance; no payment transaction posted here" },
];

const payrollReports = [
  "Monthly payroll report",
  "Employee payslip",
  "Site-wise labour cost",
  "Attendance vs payroll",
  "Advance balance",
  "Loan balance",
  "Reimbursement report",
  "One-time payment report",
  "PF deduction report",
  "Revised payroll history",
  "Salary release summary",
];

const payrollScreenList = [
  "Payroll dashboard",
  "Employee salary setup",
  "Attendance lock and payroll linking",
  "Payroll generation wizard",
  "Draft payroll review table",
  "Calculation breakdown drawer",
  "Advance, reimbursement, one-time payment and loan ledgers",
  "Approval timeline",
  "Revision comparison",
  "Salary release calculation",
  "Payslip preview",
  "Reports center",
  "Audit log",
];

const payrollTables = [
  { table: "salary_structures", columns: "employee_id, type, basic, wage_rate, HRA, TADA, PF, allowances, payout_mode, active" },
  { table: "payroll_runs", columns: "month, site_id, status, version, generated_by, approved_by, release_ready_at" },
  { table: "payroll_lines", columns: "employee_id, attendance_snapshot, earnings, deductions, gross_pay, net_payable, remarks" },
  { table: "advances", columns: "employee_id, amount, reason, approved_by, adjustment_month, balance, deduction_mode" },
  { table: "reimbursements", columns: "claim_type, bill_attachment, site_id, approved_amount, include_in_payroll, payroll_month" },
  { table: "employee_loans", columns: "loan_amount, EMI, start_month, remaining_amount, frequency, close_status" },
  { table: "payroll_audit_logs", columns: "actor, action, old_value, new_value, reason, timestamp, payroll_version" },
];

const payrollValidations = [
  "Attendance must be locked before draft generation.",
  "Draft warns and requires recalculation if attendance changes after generation.",
  "Every edit before approval requires remarks and audit log.",
  "Approved payroll revisions create a new version and never overwrite old payroll.",
  "Finance role can only view approved salary release calculation.",
  "Inactive employees are excluded unless manually included with approval.",
  "Net payable cannot go negative without explicit recovery carry-forward handling.",
];

const payrollPermissions = [
  { role: "HR/Admin", access: "Create, calculate, edit drafts, submit approval and revise payroll" },
  { role: "Project Manager", access: "Approve or reject assigned site payroll" },
  { role: "Management", access: "Final approval and revision approval" },
  { role: "Finance", access: "View release-ready payout sheets only" },
  { role: "Employee", access: "View payslip, advance, loan and reimbursement status" },
];

const payrollAuditRows = [
  { action: "Payroll generated", actor: "Kavitha Menon", change: "May 2026 draft created from locked attendance", time: "16 May 2026, 10:20" },
  { action: "Allowance edited", actor: "HR Admin", change: "Rahul Verma TADA ₹3,800 → ₹4,200; reason: site travel correction", time: "16 May 2026, 11:05" },
  { action: "Revision requested", actor: "Project Manager", change: "Harish Patel absent correction; old net ₹31,500 vs revised ₹32,600", time: "16 May 2026, 12:40" },
];

type PayrollTab =
  | "overview"
  | "draft"
  | "salary-attendance"
  | "adjustments"
  | "approval"
  | "release-payslip"
  | "reports-admin";

const payrollTabs: { key: PayrollTab; label: string; caption: string }[] = [
  { key: "overview", label: "Overview", caption: "Dashboard, payroll generation flow and calculation engine" },
  { key: "draft", label: "Draft Payroll", caption: "Employee-wise payroll review and calculation breakdown" },
  { key: "salary-attendance", label: "Salary & Attendance", caption: "Salary structures and locked attendance linkage" },
  { key: "adjustments", label: "Adjustments", caption: "Advance, reimbursement, one-time payment and loan flows" },
  { key: "approval", label: "Approval & Components", caption: "Approval lifecycle, revision flow, salary components and tables" },
  { key: "release-payslip", label: "Release & Payslip", caption: "Salary release calculation and employee payslip preview" },
  { key: "reports-admin", label: "Reports & Admin", caption: "Reports, screens, permissions, validations and audit trail" },
];

const performanceRows = [
  { name: "Downtown Tower", type: "Project", owner: "Arjun Mehta", progress: "78% / 74%", schedule: "SPI 0.94", quality: "88", safety: "91", productivity: "84", delay: "Medium", score: "82", grade: "B+", trend: "+3.4%" },
  { name: "Civil Core Team", type: "Site team", owner: "Ravi Kumar", progress: "91% / 86%", schedule: "SPI 1.02", quality: "90", safety: "94", productivity: "87", delay: "Low", score: "89", grade: "A", trend: "+6.1%" },
  { name: "VoltEdge Services", type: "Contractor", owner: "Anika Shah", progress: "64% / 72%", schedule: "SPI 0.82", quality: "76", safety: "81", productivity: "69", delay: "High", score: "68", grade: "C", trend: "-8.2%" },
  { name: "Survey and Layout Cell", type: "Site team", owner: "Kabir Soni", progress: "79% / 78%", schedule: "SPI 0.98", quality: "86", safety: "89", productivity: "74", delay: "Medium", score: "78", grade: "B", trend: "+1.8%" },
];

const performanceDashboardMetrics = [
  { label: "Overall project score", value: "82", suffix: "/100", note: "Weighted score across schedule, quality, safety, productivity and documentation", icon: TrendingUp, tone: "bg-orange-600 text-white" },
  { label: "Site score", value: "86", suffix: "/100", note: "Downtown Tower leads, Tech Park needs recovery", icon: Building2, tone: "bg-sky-600 text-white" },
  { label: "Contractor score", value: "74", suffix: "/100", note: "2 contractors on watchlist", icon: HardHat, tone: "bg-amber-500 text-white" },
  { label: "Employee productivity", value: "79", suffix: "/100", note: "Task efficiency and reporting consistency", icon: UserCheck, tone: "bg-emerald-600 text-white" },
  { label: "Delay count", value: "18", suffix: "", note: "6 critical path, 7 material, 5 approval related", icon: Clock3, tone: "bg-rose-600 text-white" },
  { label: "Planned vs actual", value: "74", suffix: "% actual", note: "Planned progress is 78%", icon: Activity, tone: "bg-slate-950 text-white" },
];

const performanceKpiCards = [
  { label: "Schedule performance", value: "0.94 SPI", status: "Watch", tone: "bg-amber-50 text-amber-700", width: 72 },
  { label: "Overdue tasks", value: "42", status: "High", tone: "bg-rose-50 text-rose-700", width: 84 },
  { label: "Milestone completion", value: "68%", status: "Behind", tone: "bg-amber-50 text-amber-700", width: 68 },
  { label: "Quality score", value: "88", status: "Stable", tone: "bg-emerald-50 text-emerald-700", width: 88 },
  { label: "Safety score", value: "91", status: "Good", tone: "bg-emerald-50 text-emerald-700", width: 91 },
  { label: "Attendance efficiency", value: "93%", status: "Good", tone: "bg-emerald-50 text-emerald-700", width: 93 },
  { label: "Labour productivity", value: "84", status: "Improving", tone: "bg-sky-50 text-sky-700", width: 84 },
  { label: "Equipment utilization", value: "76%", status: "Idle risk", tone: "bg-amber-50 text-amber-700", width: 76 },
  { label: "Material wastage", value: "3.8%", status: "Control", tone: "bg-sky-50 text-sky-700", width: 38 },
  { label: "Rework count", value: "14", status: "Rising", tone: "bg-rose-50 text-rose-700", width: 62 },
  { label: "Daily progress", value: "2.4%", status: "Target 2.7%", tone: "bg-amber-50 text-amber-700", width: 79 },
  { label: "Bottlenecks", value: "7", status: "Needs action", tone: "bg-rose-50 text-rose-700", width: 70 },
];

const performanceWorkflowSteps = [
  "Pull planned scope, WBS, milestones and task baselines",
  "Collect daily progress, attendance, equipment, quality and safety inputs",
  "Normalize KPIs by project, site, contractor, team and employee",
  "Calculate weighted scorecards and delay severity",
  "Review exceptions, overrides and bottlenecks with remarks",
  "Publish weekly or monthly performance scorecard",
  "Send alerts, reports and smart recommendations to role owners",
];

const projectPerformanceRows = [
  { metric: "Planned vs actual progress", value: "78% planned / 74% actual", signal: "Behind", note: "4% variance, recovery required this week" },
  { metric: "Milestone tracking", value: "17 of 25 complete", signal: "Watch", note: "3 delayed milestones, 2 on critical path" },
  { metric: "Schedule variance", value: "-9 days", signal: "High", note: "Buffer consumption at 62%" },
  { metric: "Pending approvals", value: "11", signal: "Medium", note: "Drawings and inspections blocking MEP first fix" },
  { metric: "Completion forecast", value: "21 Jun 2026", signal: "Watch", note: "Forecast slips 8 days unless recovery plan is approved" },
];

const sitePerformanceRows = [
  { site: "Downtown Tower", productivity: "87", attendance: "95%", safety: "94", issues: "8", idle: "6 workers", ranking: "#1" },
  { site: "Tech Park Phase 2", productivity: "69", attendance: "88%", safety: "81", issues: "19", idle: "2 machines", ranking: "#4" },
  { site: "Airport Apron Upgrade", productivity: "74", attendance: "91%", safety: "89", issues: "11", idle: "4 workers", ranking: "#3" },
  { site: "Smart Campus Replica", productivity: "82", attendance: "93%", safety: "90", issues: "7", idle: "1 crane", ranking: "#2" },
];

const employeePerformanceRows = [
  { name: "Rahul Verma", role: "Senior Site Engineer", attendance: "96%", tasks: "42 / 47", delayed: "3", quality: "91", productivity: "88", grade: "A", trend: "+5%" },
  { name: "Harish Patel", role: "General Foreman", attendance: "92%", tasks: "31 / 39", delayed: "6", quality: "82", productivity: "79", grade: "B", trend: "-2%" },
  { name: "Anika Shah", role: "Electrical Lead", attendance: "94%", tasks: "27 / 35", delayed: "8", quality: "76", productivity: "72", grade: "C+", trend: "-7%" },
  { name: "Deepa Krishnan", role: "Safety Officer", attendance: "98%", tasks: "38 / 40", delayed: "1", quality: "94", productivity: "91", grade: "A", trend: "+4%" },
];

const contractorPerformanceRows = [
  { contractor: "Urban Workforce Co.", progress: "84%", delay: "4", rework: "3", labour: "96%", quality: "89", safety: "92", reliability: "88", flag: "Preferred" },
  { contractor: "VoltEdge Services", progress: "64%", delay: "9", rework: "6", labour: "82%", quality: "76", safety: "81", reliability: "68", flag: "Watchlist" },
  { contractor: "Prime MEP Services", progress: "79%", delay: "3", rework: "2", labour: "91%", quality: "86", safety: "90", reliability: "84", flag: "Stable" },
  { contractor: "Elite Finishers Co.", progress: "58%", delay: "7", rework: "5", labour: "78%", quality: "73", safety: "80", reliability: "66", flag: "Blacklist risk" },
];

const taskPerformanceRows = [
  { task: "Tower A cable tray first-fix", planned: "08 May", actual: "13 May", completion: "62%", delay: "5d", dependency: "Drawing approval", impact: "Critical", forecast: "22 May" },
  { task: "Podium slab pour P3", planned: "12 May", actual: "12 May", completion: "94%", delay: "0d", dependency: "None", impact: "Low", forecast: "17 May" },
  { task: "AHU installation", planned: "04 May", actual: "09 May", completion: "48%", delay: "5d", dependency: "Equipment readiness", impact: "High", forecast: "27 May" },
  { task: "Airport apron survey grid", planned: "10 May", actual: "11 May", completion: "81%", delay: "1d", dependency: "Weather", impact: "Medium", forecast: "19 May" },
];

const qualitySafetyRows = [
  { area: "Quality", metric: "Inspection pass rate", value: "88%", risk: "Stable", note: "14 NCRs, 31 snags, 9 repeated defects" },
  { area: "Quality", metric: "Rework severity", value: "Medium", risk: "Watch", note: "MEP rework increased after failed ceiling inspection" },
  { area: "Safety", metric: "PPE compliance", value: "94%", risk: "Good", note: "6 unsafe observations closed, 2 pending" },
  { area: "Safety", metric: "Incident risk", value: "Low", risk: "Stable", note: "1 near miss, 0 lost time incidents this month" },
];

const resourcePerformanceRows = [
  { resource: "Civil labour", productivity: "2.8 m3/person-day", utilization: "87%", idle: "6 workers", output: "Ahead by 5%" },
  { resource: "Electrical labour", productivity: "41 m cable/person-day", utilization: "69%", idle: "9 workers", output: "Behind by 12%" },
  { resource: "Tower crane", productivity: "42 lifts/day", utilization: "76%", idle: "3.2h/day", output: "Below target" },
  { resource: "Concrete pumps", productivity: "118 m3/day", utilization: "82%", idle: "1.4h/day", output: "On target" },
];

const scorecardWeights = [
  { label: "Schedule", weight: 30, score: 78 },
  { label: "Quality", weight: 20, score: 88 },
  { label: "Safety", weight: 20, score: 91 },
  { label: "Productivity", weight: 20, score: 84 },
  { label: "Documentation", weight: 10, score: 76 },
];

const delayReasonRows = [
  { reason: "Material delay", count: 7, duration: "21 days", owner: "Procurement + vendor", criticality: "High", recovery: "Partial" },
  { reason: "Drawing approval delay", count: 5, duration: "16 days", owner: "Design + client", criticality: "High", recovery: "Needs escalation" },
  { reason: "Labour shortage", count: 4, duration: "9 days", owner: "Contractor", criticality: "Medium", recovery: "Possible" },
  { reason: "Equipment breakdown", count: 2, duration: "5 days", owner: "Plant team", criticality: "Medium", recovery: "Recovered" },
  { reason: "Weather delay", count: 3, duration: "4 days", owner: "External", criticality: "Low", recovery: "Recovered" },
];

const performanceAlerts = [
  { title: "Contractor delay risk is high", detail: "VoltEdge Services has 9 delays and SPI 0.82.", severity: "Critical" },
  { title: "Site productivity dropped by 18% this week", detail: "Tech Park Phase 2 labour output fell after material shortage.", severity: "Warning" },
  { title: "Rework increased due to inspection failures", detail: "Ceiling MEP defects repeated across 3 floors.", severity: "Warning" },
  { title: "Equipment idle above threshold", detail: "Tower crane idle time reached 3.2h/day.", severity: "Watch" },
];

const performanceReports = [
  "Project performance report",
  "Site performance report",
  "Contractor report",
  "Employee productivity report",
  "Delay report",
  "Quality report",
  "Safety report",
  "Rework report",
  "Resource utilization report",
  "Weekly summary",
  "Monthly scorecard",
  "Trend analysis report",
];

const performancePermissions = [
  { role: "Management", access: "View all analytics, compare sites/projects and access scorecards" },
  { role: "Project Manager", access: "View project/site performance, review delays and contractor scorecards" },
  { role: "Site Engineer", access: "Update progress, submit reports and view assigned metrics" },
  { role: "HR", access: "View employee productivity and attendance-linked trends" },
  { role: "Safety Officer", access: "Manage safety KPIs, alerts and observations" },
  { role: "Quality Team", access: "Manage quality KPIs, NCRs, snags and rework metrics" },
  { role: "Contractor", access: "View own scorecard only" },
];

const performanceTables = [
  { table: "performance_scorecards", columns: "entity_type, entity_id, period, final_score, grade, risk_status, rank, calculated_at" },
  { table: "performance_kpis", columns: "scorecard_id, kpi_code, planned_value, actual_value, weight, score, trend, source_module" },
  { table: "delay_events", columns: "reason, duration, responsible_party, impacted_tasks, criticality, recovery_status, root_cause" },
  { table: "productivity_logs", columns: "site_id, team_id, output_qty, manpower_hours, equipment_hours, shift, productivity_score" },
  { table: "quality_performance", columns: "inspection_id, pass_fail, NCR_count, snag_count, defect_count, rework_count, severity" },
  { table: "safety_performance", columns: "site_id, violations, near_misses, incidents, PPE_rate, audit_score, risk_score" },
  { table: "performance_audit_logs", columns: "actor, action, old_value, new_value, reason, timestamp, approval_status" },
];

const performanceLifecycle = [
  "Draft metrics",
  "Data validation",
  "Exception review",
  "Manager review",
  "Published scorecard",
  "Action plan assigned",
  "Closed after improvement verification",
];

const performanceValidations = [
  "Planned baseline must exist before schedule score calculation.",
  "Manual KPI overrides require reason, approver and audit trail.",
  "Delay events must identify responsible party, impacted task and criticality.",
  "Quality and safety scores must come from approved inspections or authorized overrides.",
  "Contractors can only view their own scorecard and cannot edit project KPIs.",
  "Published scorecards are versioned and cannot be overwritten.",
];

const performanceIntegrations = [
  "Attendance module",
  "Task module",
  "Timeline/Gantt module",
  "WBS module",
  "Daily Progress Report module",
  "Quality module",
  "Safety module",
  "Equipment module",
  "Material module",
  "Payroll module",
];

const performanceApiSuggestions = [
  "GET /performance/dashboard?projectId&period&siteId",
  "POST /performance/scorecards/recalculate",
  "GET /performance/entities/:type/:id/scorecard",
  "POST /performance/delays",
  "PATCH /performance/kpis/:id/override",
  "GET /performance/reports/monthly-scorecard",
  "POST /performance/alerts/rules",
];

const performanceAuditRows = [
  { action: "Score recalculated", actor: "System", detail: "Downtown Tower score changed 79 → 82 after DPR sync", time: "16 May 2026, 09:30" },
  { action: "Delay updated", actor: "Arjun Mehta", detail: "Drawing approval delay marked critical for cable tray first-fix", time: "16 May 2026, 10:15" },
  { action: "Manual override", actor: "Quality Lead", detail: "Inspection efficiency score adjusted with NCR closure proof", time: "16 May 2026, 11:40" },
];

type PerformanceTab =
  | "overview"
  | "scorecards"
  | "project-site"
  | "people-contractors"
  | "tasks-delays"
  | "quality-resources"
  | "engine-alerts"
  | "reports-admin"
  | "audit";

const performanceTabs: { key: PerformanceTab; label: string; caption: string }[] = [
  { key: "overview", label: "Overview", caption: "Dashboard, KPIs, trends and workflow" },
  { key: "scorecards", label: "Scorecards", caption: "Ranking and entity performance" },
  { key: "project-site", label: "Project & Site", caption: "Execution, site ranking and forecast" },
  { key: "people-contractors", label: "People & Contractors", caption: "Employee and contractor scorecards" },
  { key: "tasks-delays", label: "Tasks & Delays", caption: "Timeline, blockers and root causes" },
  { key: "quality-resources", label: "Quality, Safety & Resources", caption: "Quality, safety and productivity metrics" },
  { key: "engine-alerts", label: "Engine & Alerts", caption: "Formula, weights and notification logic" },
  { key: "reports-admin", label: "Reports & Admin", caption: "Exports, permissions, APIs and integrations" },
  { key: "audit", label: "Audit & AI", caption: "History, forecasts and smart insights" },
];

const complianceRows = [
  { item: "Worker IDs", valid: "152 / 164", risk: "12 pending renewal", owner: "HR desk", status: "Expiring Soon" },
  { item: "Trade certifications", valid: "89 / 97", risk: "8 expiring this month", owner: "Training cell", status: "Pending Renewal" },
  { item: "Insurance records", valid: "31 / 34", risk: "3 endorsements pending", owner: "Commercial team", status: "Under Review" },
  { item: "Safety inductions", valid: "160 / 164", risk: "4 new joiners pending", owner: "EHS", status: "Active" },
];

type ComplianceTab =
  | "overview"
  | "documents-expiry"
  | "contractor-labour"
  | "safety-equipment"
  | "permits-inspections"
  | "audits-violations"
  | "scorecards"
  | "reports-admin";

const complianceTabs: { key: ComplianceTab; label: string; caption: string }[] = [
  { key: "overview", label: "Overview", caption: "Compliance dashboard, workflow, risk heatmap and trend view" },
  { key: "documents-expiry", label: "Documents & Expiry", caption: "Statutory documents, certificates, permits and renewal tracking" },
  { key: "contractor-labour", label: "Contractor & Labour", caption: "Contractor, vendor, employee and labour compliance" },
  { key: "safety-equipment", label: "Safety & Equipment", caption: "Safety compliance, equipment certificates and material approvals" },
  { key: "permits-inspections", label: "Permits & Inspections", caption: "Permit lifecycle, inspection checklists and closure tracking" },
  { key: "audits-violations", label: "Audits & NCR", caption: "Audit workflows, findings, NCRs and violation management" },
  { key: "scorecards", label: "Scorecards", caption: "Weighted compliance scoring, rankings and risk grading" },
  { key: "reports-admin", label: "Reports & Admin", caption: "Reports, permissions, APIs, integrations, validations and audit trail" },
];

const complianceDashboardMetrics = [
  { label: "Total compliance items", value: "842", note: "Documents, permits, audits and inspections", icon: FileBadge2, tone: "bg-slate-950 text-white" },
  { label: "Active compliance", value: "776", note: "92% operational compliance score", icon: ShieldCheck, tone: "bg-emerald-600 text-white" },
  { label: "Expired documents", value: "18", note: "6 block site access today", icon: Clock3, tone: "bg-rose-600 text-white" },
  { label: "Upcoming expiries", value: "47", note: "90/30/7 day reminder windows", icon: Calendar, tone: "bg-amber-500 text-white" },
  { label: "Pending approvals", value: "29", note: "Documents, permits and audit closure", icon: UserCheck, tone: "bg-sky-600 text-white" },
  { label: "Open audit findings", value: "14", note: "5 high-risk CAPA actions overdue", icon: Eye, tone: "bg-teal-700 text-white" },
];

const complianceKpiCards = [
  { label: "Safety compliance", value: "94%", status: "Green", tone: "bg-emerald-50 text-emerald-700", width: 94 },
  { label: "Contractor compliance", value: "86%", status: "Amber", tone: "bg-amber-50 text-amber-700", width: 86 },
  { label: "Labour compliance", value: "91%", status: "Green", tone: "bg-emerald-50 text-emerald-700", width: 91 },
  { label: "Site compliance score", value: "88", status: "Watch", tone: "bg-amber-50 text-amber-700", width: 88 },
  { label: "Equipment certified", value: "79%", status: "Amber", tone: "bg-amber-50 text-amber-700", width: 79 },
  { label: "Permit active", value: "63", status: "Live", tone: "bg-sky-50 text-sky-700", width: 72 },
  { label: "High-risk violations", value: "7", status: "Critical", tone: "bg-rose-50 text-rose-700", width: 65 },
  { label: "NCR count", value: "21", status: "Open", tone: "bg-rose-50 text-rose-700", width: 58 },
];

const complianceWorkflowSteps = [
  "Create compliance checklist by project, site, contractor, employee, equipment and material",
  "Upload or capture document, permit, inspection, audit and certificate evidence",
  "Validate mandatory fields, expiry date, issuing authority and linked entity",
  "Route document, permit, inspection or audit closure for approval",
  "Track expiry windows, renewal history, risk level and blocked access rules",
  "Generate scorecards, alerts, reports and management compliance dashboards",
];

const complianceDocumentRows = [
  { document: "Labour license", number: "LL-DT-2026-018", entity: "Urban Workforce Co.", issue: "01 Jan 2026", expiry: "30 Jun 2026", authority: "Labour Dept.", status: "Active", risk: "Low" },
  { document: "Equipment fitness certificate", number: "EQ-FIT-CR-044", entity: "Tower Crane TC-02", issue: "05 Nov 2025", expiry: "23 May 2026", authority: "Plant Inspector", status: "Expiring Soon", risk: "High" },
  { document: "Fire safety certificate", number: "FSC-DT-091", entity: "Downtown Tower", issue: "15 Apr 2025", expiry: "14 Apr 2026", authority: "Fire Dept.", status: "Expired", risk: "Critical" },
  { document: "Material test certificate", number: "MTC-C40-2241", entity: "Concrete Batch C40", issue: "11 May 2026", expiry: "11 Aug 2026", authority: "Lab QA", status: "Under Review", risk: "Medium" },
];

const complianceExpiryRows = [
  { item: "Fire safety certificate", entity: "Downtown Tower", days: "Expired 32d", level: "Critical", action: "Block high-risk work until renewal approved" },
  { item: "Crane operator license", entity: "Operator R. Pillai", days: "6 days", level: "High", action: "Escalate to equipment manager" },
  { item: "Contractor insurance", entity: "VoltEdge Services", days: "24 days", level: "Medium", action: "30-day renewal reminder sent" },
  { item: "Environmental clearance", entity: "Airport Apron Upgrade", days: "86 days", level: "Low", action: "90-day reminder scheduled" },
];

const contractorComplianceRows = [
  { contractor: "Urban Workforce Co.", docs: "31 / 34", score: "91", risk: "Low", violations: "2", eligibility: "Allowed" },
  { contractor: "VoltEdge Services", docs: "22 / 31", score: "72", risk: "High", violations: "8", eligibility: "Restricted" },
  { contractor: "Prime MEP Services", docs: "28 / 32", score: "86", risk: "Medium", violations: "3", eligibility: "Allowed" },
  { contractor: "Elite Finishers Co.", docs: "19 / 29", score: "68", risk: "High", violations: "6", eligibility: "Watchlist" },
];

const labourComplianceRows = [
  { employee: "Rahul Verma", type: "Engineer", id: "Verified", training: "100%", medical: "Valid", pfEsi: "Registered", induction: "Complete", eligibility: "Eligible" },
  { employee: "Harish Patel", type: "Foreman", id: "Verified", training: "83%", medical: "Expiring", pfEsi: "Registered", induction: "Complete", eligibility: "Eligible" },
  { employee: "Suresh Yadav", type: "Labour", id: "Pending", training: "62%", medical: "Valid", pfEsi: "Pending", induction: "Pending", eligibility: "Blocked" },
  { employee: "Deepa Krishnan", type: "Safety", id: "Verified", training: "100%", medical: "Valid", pfEsi: "Registered", induction: "Complete", eligibility: "Eligible" },
];

const safetyComplianceRows = [
  { metric: "PPE compliance", value: "94%", risk: "Green", note: "12 missing PPE observations closed this week" },
  { metric: "Toolbox talks", value: "27 / 30", risk: "Amber", note: "Night shift missed 3 talks" },
  { metric: "Unsafe observations", value: "18 open", risk: "Amber", note: "5 high severity observations pending" },
  { metric: "Fire safety checks", value: "86%", risk: "Amber", note: "Downtown Tower certificate renewal pending" },
];

const equipmentMaterialComplianceRows = [
  { item: "Tower Crane TC-02", type: "Equipment", certificate: "Fitness certificate", status: "Expiring Soon", action: "Block assignment after 23 May" },
  { item: "Concrete Batch C40", type: "Material", certificate: "MTC + lab report", status: "Under Review", action: "QC approval required before pour" },
  { item: "Survey total station", type: "Equipment", certificate: "Calibration certificate", status: "Active", action: "Next calibration in 72 days" },
  { item: "Fire doors vendor", type: "Material/Vendor", certificate: "Vendor registration", status: "Pending Renewal", action: "Vendor upload requested" },
];

const permitRows = [
  { permit: "Hot work permit", site: "Downtown Tower", linked: "Welding at Level 12", validity: "16 May 2026", approvedBy: "Safety Officer", status: "Active" },
  { permit: "Height work permit", site: "Tech Park Phase 2", linked: "Facade bracket install", validity: "17 May 2026", approvedBy: "PM + Safety", status: "Pending Approval" },
  { permit: "Excavation permit", site: "Airport Apron Upgrade", linked: "Drain trench", validity: "Expired", approvedBy: "Site Manager", status: "Expired" },
  { permit: "Crane lifting permit", site: "Downtown Tower", linked: "AHU lift", validity: "18 May 2026", approvedBy: "Lifting supervisor", status: "Approved" },
];

const inspectionRows = [
  { inspection: "Safety inspection", inspector: "Deepa Krishnan", date: "16 May 2026", findings: "5", severity: "High", action: "Barricade correction", owner: "Ravi Kumar", closure: "18 May" },
  { inspection: "Equipment inspection", inspector: "Plant Team", date: "15 May 2026", findings: "2", severity: "Medium", action: "Crane limit switch check", owner: "Plant Manager", closure: "17 May" },
  { inspection: "Material inspection", inspector: "QA Lab", date: "14 May 2026", findings: "1", severity: "Low", action: "Batch report upload", owner: "QC Engineer", closure: "Closed" },
];

const auditRows = [
  { audit: "Internal compliance audit", schedule: "20 May 2026", findings: "8", ncr: "3", capa: "5 open", owner: "Compliance Officer", rating: "B+" },
  { audit: "Safety audit", schedule: "24 May 2026", findings: "11", ncr: "5", capa: "7 open", owner: "Safety Officer", rating: "B" },
  { audit: "Labour audit", schedule: "28 May 2026", findings: "6", ncr: "2", capa: "4 open", owner: "HR/Admin", rating: "A-" },
];

const violationRows = [
  { type: "Safety violation", severity: "High", party: "VoltEdge Services", action: "PPE retraining + access warning", due: "18 May", status: "Open" },
  { type: "Document non-compliance", severity: "Critical", party: "Fire certificate owner", action: "Renew certificate", due: "Immediate", status: "Escalated" },
  { type: "Quality NCR", severity: "Medium", party: "Prime MEP Services", action: "CAPA evidence upload", due: "21 May", status: "Under Review" },
];

const complianceScoreWeights = [
  { label: "Safety", weight: 22, score: 94 },
  { label: "Documentation", weight: 20, score: 88 },
  { label: "Labour", weight: 16, score: 91 },
  { label: "Equipment", weight: 14, score: 79 },
  { label: "Quality", weight: 14, score: 86 },
  { label: "Environmental", weight: 8, score: 83 },
  { label: "Legal", weight: 6, score: 90 },
];

const complianceAlerts = [
  { title: "5 critical permits expire this week", detail: "Height work, excavation and crane lifting permits require renewal.", severity: "Critical" },
  { title: "Contractor compliance risk is high", detail: "VoltEdge Services has missing insurance and 8 violations.", severity: "Critical" },
  { title: "Site safety compliance dropped by 12%", detail: "Night shift toolbox talks and PPE closure are below target.", severity: "Warning" },
  { title: "Unsafe equipment alert", detail: "Tower Crane TC-02 certificate expires in 7 days.", severity: "Warning" },
];

const complianceReports = [
  "Compliance summary report",
  "Expiry report",
  "Site compliance report",
  "Contractor compliance report",
  "Safety compliance report",
  "Audit report",
  "Inspection report",
  "NCR report",
  "Violation report",
  "Permit report",
  "Equipment certification report",
  "Employee certification report",
];

const compliancePermissions = [
  { role: "Compliance Officer", access: "Full compliance access, approvals, waivers, reports and scorecards" },
  { role: "Safety Officer", access: "Safety compliance, permits, safety inspections and observations" },
  { role: "HR/Admin", access: "Employee, labour, ID, training, medical and PF/ESI compliance" },
  { role: "Project Manager", access: "Site compliance visibility, escalations and closure review" },
  { role: "Quality Team", access: "Quality compliance, MTC, lab reports, NCRs and inspection closures" },
  { role: "Contractor", access: "Upload and view own documents only" },
  { role: "Management", access: "Global analytics, risk dashboard and reports" },
];

const complianceTables = [
  { table: "compliance_items", columns: "entity_type, entity_id, compliance_type, status, risk_level, owner, score" },
  { table: "compliance_documents", columns: "doc_type, doc_number, issue_date, expiry_date, authority, file_url, approval_status, verification_status" },
  { table: "permit_requests", columns: "permit_type, site_id, linked_task_id, validity, checklist, approved_by, closure_status" },
  { table: "inspection_records", columns: "type, checklist, inspector, date, findings, severity, corrective_action, closure_date" },
  { table: "audit_records", columns: "audit_type, schedule, checklist, findings, NCRs, CAPA, responsible_person, rating" },
  { table: "compliance_violations", columns: "violation_type, severity, responsible_party, corrective_action, due_date, evidence, status" },
  { table: "compliance_audit_logs", columns: "actor, action, old_value, new_value, reason, timestamp, risk_override" },
];

const complianceValidations = [
  "Mandatory documents must exist before contractor/site access is enabled.",
  "Expired permits block linked high-risk tasks until renewal is approved.",
  "Equipment assignment is blocked if certificate, insurance or operator license is expired.",
  "Document approval requires document number, issue date, expiry date, authority and linked entity.",
  "Compliance waivers require approver, reason, validity window and audit history.",
  "Published compliance scores are versioned and cannot be overwritten.",
];

const complianceIntegrations = [
  "HR module",
  "Payroll module",
  "Attendance module",
  "Equipment module",
  "Material module",
  "Task module",
  "Timeline/Gantt module",
  "Safety module",
  "Quality module",
  "Vendor module",
  "Contractor module",
  "Document management system",
];

const complianceApiSuggestions = [
  "GET /compliance/dashboard?projectId&siteId&status",
  "POST /compliance/documents",
  "POST /compliance/documents/:id/submit-renewal",
  "POST /compliance/permits",
  "PATCH /compliance/inspections/:id/close",
  "POST /compliance/scorecards/recalculate",
  "GET /compliance/reports/expiry",
];

const complianceAuditRows = [
  { action: "Document uploaded", actor: "Contractor Admin", detail: "VoltEdge insurance renewal uploaded for review", time: "16 May 2026, 09:10" },
  { action: "Permit escalated", actor: "Safety Officer", detail: "Excavation permit expired and linked task blocked", time: "16 May 2026, 10:45" },
  { action: "Risk override", actor: "Compliance Officer", detail: "Fire certificate risk changed High -> Critical with access restriction", time: "16 May 2026, 12:05" },
];

const newOrgChecklist = [
  "Define company and site hierarchy",
  "Create departments and reporting managers",
  "Add employees, worker categories and contact data",
  "Map teams, access roles and approval owners",
];

type OrgDepartment = {
  id: string;
  name: string;
  head: string;
  headTitle: string;
  site: string;
  members: number;
  scope: string;
  status: "Active" | "Setup" | "On hold";
  budget: string;
};

type OrgSiteTeam = {
  id: string;
  name: string;
  site: string;
  lead: string;
  strength: number;
  shift: string;
  contractor: string;
  status: string;
  scope: string;
  productivity: number;
};

type OrgEmployee = {
  id: string;
  name: string;
  role: string;
  department: string;
  site: string;
  email: string;
  phone: string;
  employment: string;
  status: "Active" | "On Leave" | "Mobilizing" | "Offboarded";
  joinDate: string;
  manager: string;
  vendor?: string;
  resourceCategory?: string;
  contractRef?: string;
  vendorContact?: string;
};

type EmployeeColumnKey = "name" | "role" | "department" | "site" | "email" | "phone" | "employment" | "joinDate" | "status";
type EmployeeDetailTab = "personal" | "employee" | "payroll" | "documents" | "payroll-history" | "medical" | "leave" | "attendance";

const employeeColumnOptions: { key: EmployeeColumnKey; label: string; width: string }[] = [
  { key: "name", label: "Name", width: "minmax(240px,1.25fr)" },
  { key: "role", label: "Role", width: "minmax(160px,1fr)" },
  { key: "department", label: "Department", width: "minmax(170px,1fr)" },
  { key: "site", label: "Site", width: "minmax(150px,0.9fr)" },
  { key: "email", label: "Email", width: "minmax(210px,1.25fr)" },
  { key: "phone", label: "Phone", width: "minmax(150px,0.9fr)" },
  { key: "employment", label: "Type", width: "minmax(110px,0.65fr)" },
  { key: "joinDate", label: "Joined", width: "minmax(110px,0.65fr)" },
  { key: "status", label: "Status", width: "minmax(110px,0.65fr)" },
];

const employeeDetailTabs: { key: EmployeeDetailTab; label: string }[] = [
  { key: "personal", label: "Personal info" },
  { key: "employee", label: "Employee details" },
  { key: "payroll", label: "Payroll details" },
  { key: "documents", label: "Documents" },
  { key: "payroll-history", label: "Payroll history" },
  { key: "medical", label: "Medical History" },
  { key: "leave", label: "Leave history" },
  { key: "attendance", label: "Attendance" },
];

const getEmployeeDraftFromRecord = (employee: OrgEmployee): Omit<OrgEmployee, "id"> => ({
  name: employee.name,
  role: employee.role,
  department: employee.department,
  site: employee.site,
  email: employee.email,
  phone: employee.phone,
  employment: employee.employment,
  status: employee.status,
  joinDate: employee.joinDate,
  manager: employee.manager,
  vendor: employee.vendor,
  resourceCategory: employee.resourceCategory,
  contractRef: employee.contractRef,
  vendorContact: employee.vendorContact,
});

const defaultDepartments: OrgDepartment[] = [
  { id: "dept-1", name: "Civil Execution", head: "Ravi Kumar", headTitle: "Civil Execution Lead", site: "Tower A, Podium, Parking", members: 62, scope: "Structure, concrete, earthworks and foundations", status: "Active", budget: "₹4.2 Cr" },
  { id: "dept-2", name: "Electrical Systems", head: "Anika Shah", headTitle: "Electrical Systems Lead", site: "Tower A, Utilities Block", members: 24, scope: "Power distribution, lighting, LV cabling and panels", status: "Active", budget: "₹1.8 Cr" },
  { id: "dept-3", name: "MEP Coordination", head: "Farhan Ali", headTitle: "MEP Lead", site: "Tower A, Service Spine", members: 31, scope: "HVAC, plumbing, fire protection and clash resolution", status: "Active", budget: "₹3.1 Cr" },
  { id: "dept-4", name: "Commercial Controls", head: "Meera Joshi", headTitle: "Commercial Head", site: "HQ + Shared Services", members: 18, scope: "Billing, cost control, contracts and procurement admin", status: "Active", budget: "₹0.9 Cr" },
  { id: "dept-5", name: "BIM and Digital Delivery", head: "Kritika Nair", headTitle: "BIM Manager", site: "HQ Design Cell", members: 14, scope: "BIM coordination, clash detection, digital twin and CDE", status: "Active", budget: "₹1.2 Cr" },
  { id: "dept-6", name: "Planning and Scheduling", head: "Tanvi Bhat", headTitle: "Planning Engineer", site: "PMO", members: 8, scope: "Master schedule, look-ahead, delay analysis and reporting", status: "Active", budget: "₹0.6 Cr" },
  { id: "dept-7", name: "Quality Assurance", head: "Christie Das", headTitle: "QA/QC Manager", site: "Tower A", members: 12, scope: "Inspection, material testing, NCR and audit management", status: "Active", budget: "₹0.7 Cr" },
  { id: "dept-8", name: "EHS and Safety", head: "Devika Rao", headTitle: "Safety Manager", site: "All Sites", members: 16, scope: "Safety inductions, PPE compliance, permits and incident tracking", status: "Active", budget: "₹0.8 Cr" },
  { id: "dept-9", name: "Survey and Geomatics", head: "Kabir Soni", headTitle: "Survey Lead", site: "Airport Apron Upgrade", members: 11, scope: "Control survey, setting-out, as-built and drone mapping", status: "Active", budget: "₹0.5 Cr" },
  { id: "dept-10", name: "People Operations", head: "Hannah Harris", headTitle: "HR and Labor Control", site: "Shared Services", members: 9, scope: "Recruitment, payroll, attendance, compliance and training", status: "Active", budget: "₹0.4 Cr" },
];

const defaultSiteTeams: OrgSiteTeam[] = [
  { id: "team-1", name: "Core Wall Crew", site: "Downtown Tower - Tower A", lead: "Ravi Kumar", strength: 42, shift: "Day + Extended", contractor: "Urban Workforce Co.", status: "Full crew", scope: "Core wall forming, rebar and concrete pour", productivity: 84 },
  { id: "team-2", name: "Slab and Formwork Unit", site: "Downtown Tower - Podium", lead: "Harish Patel", strength: 28, shift: "Day", contractor: "Urban Workforce Co.", status: "Full crew", scope: "Flat slab formwork, post-tension and deck pour", productivity: 81 },
  { id: "team-3", name: "Electrical First-Fix Team", site: "Tech Park Phase 2", lead: "Anika Shah", strength: 21, shift: "General", contractor: "VoltEdge Services", status: "Backfill needed", scope: "Cable tray, conduit, DB and panel installation", productivity: 76 },
  { id: "team-4", name: "MEP Night Crew", site: "Downtown Tower - Tower A", lead: "Farhan Ali", strength: 18, shift: "Night", contractor: "Prime MEP Services", status: "Night shift active", scope: "Duct installation, pipe run and plantroom fit-out", productivity: 88 },
  { id: "team-5", name: "HVAC Installation Squad", site: "Smart Campus Replica", lead: "Zubair Khan", strength: 15, shift: "General", contractor: "Prime MEP Services", status: "Mobilizing", scope: "AHU installation, chilled water piping and insulation", productivity: 72 },
  { id: "team-6", name: "Fire Protection Team", site: "Downtown Tower - Tower A", lead: "Farhan Ali", strength: 12, shift: "Day", contractor: "FireShield Solutions", status: "Deployed", scope: "Sprinkler, fire alarm, riser and hydrant systems", productivity: 79 },
  { id: "team-7", name: "Survey and Layout Cell", site: "Airport Apron Upgrade", lead: "Kabir Soni", strength: 11, shift: "Day", contractor: "Acme Surveys", status: "Deployed", scope: "Control survey, setting-out and as-built verification", productivity: 72 },
  { id: "team-8", name: "BIM Coordination Unit", site: "HQ Design Cell", lead: "Kritika Nair", strength: 8, shift: "General", contractor: "In-house", status: "Active", scope: "Model coordination, clash detection and RFI resolution", productivity: 91 },
  { id: "team-9", name: "Finishing and Facade Crew", site: "Downtown Tower - Tower A", lead: "Ravi Kumar", strength: 22, shift: "Day", contractor: "Elite Finishers Co.", status: "Scaling up", scope: "Plastering, tiling, painting, waterproofing and facade", productivity: 68 },
  { id: "team-10", name: "Safety Patrol Unit", site: "All Sites", lead: "Devika Rao", strength: 10, shift: "Rotating", contractor: "In-house", status: "Active", scope: "Daily safety walks, permit checks, incident response", productivity: 95 },
];

const defaultEmployeeRoster: OrgEmployee[] = [
  { id: "emp-1", name: "Rahul Verma", role: "Senior Site Engineer", department: "Civil Execution", site: "Downtown Tower", email: "rahul.verma@hubbuild.com", phone: "+91 98765 10021", employment: "Full-time", status: "Active", joinDate: "2024-03-15", manager: "Ravi Kumar" },
  { id: "emp-2", name: "Nisha Iyer", role: "Quantity Surveyor", department: "Commercial Controls", site: "HQ Controls", email: "nisha.iyer@hubbuild.com", phone: "+91 98765 10044", employment: "Full-time", status: "On Leave", joinDate: "2024-01-08", manager: "Meera Joshi" },
  { id: "emp-3", name: "Harish Patel", role: "General Foreman", department: "Civil Execution", site: "Podium Package", email: "harish.patel@hubbuild.com", phone: "+91 98765 10058", employment: "Contract", status: "Active", joinDate: "2024-06-01", manager: "Ravi Kumar" },
  { id: "emp-4", name: "Zubair Khan", role: "HVAC Engineer", department: "MEP Coordination", site: "Tech Park Phase 2", email: "zubair.khan@hubbuild.com", phone: "+91 98765 10077", employment: "Contract", status: "Mobilizing", joinDate: "2025-04-10", manager: "Farhan Ali" },
  { id: "emp-5", name: "Kritika Nair", role: "BIM Coordinator", department: "BIM and Digital Delivery", site: "HQ Design Cell", email: "kritika.nair@hubbuild.com", phone: "+91 98765 10088", employment: "Full-time", status: "Active", joinDate: "2023-11-20", manager: "Esther Howard" },
  { id: "emp-6", name: "Aarav Sharma", role: "Site Engineer", department: "Civil Execution", site: "Downtown Tower", email: "aarav.sharma@hubbuild.com", phone: "+91 98765 10099", employment: "Full-time", status: "Active", joinDate: "2025-01-06", manager: "Ravi Kumar" },
  { id: "emp-7", name: "Deepa Krishnan", role: "Safety Officer", department: "EHS and Safety", site: "Downtown Tower", email: "deepa.k@hubbuild.com", phone: "+91 98765 10110", employment: "Full-time", status: "Active", joinDate: "2024-07-15", manager: "Devika Rao" },
  { id: "emp-8", name: "Mohammed Rizwan", role: "Electrical Supervisor", department: "Electrical Systems", site: "Utilities Block", email: "rizwan.m@hubbuild.com", phone: "+91 98765 10121", employment: "Contract", status: "Active", joinDate: "2024-09-01", manager: "Anika Shah" },
  { id: "emp-9", name: "Sneha Kapoor", role: "Planning Engineer", department: "Planning and Scheduling", site: "PMO", email: "sneha.kapoor@hubbuild.com", phone: "+91 98765 10132", employment: "Full-time", status: "Active", joinDate: "2024-04-22", manager: "Tanvi Bhat" },
  { id: "emp-10", name: "Vikram Singh", role: "Foreman", department: "Civil Execution", site: "Tower A", email: "vikram.singh@hubbuild.com", phone: "+91 98765 10143", employment: "Contract", status: "Active", joinDate: "2024-08-18", manager: "Harish Patel" },
  { id: "emp-11", name: "Pooja Reddy", role: "QA/QC Inspector", department: "Quality Assurance", site: "Tower A", email: "pooja.reddy@hubbuild.com", phone: "+91 98765 10154", employment: "Full-time", status: "Active", joinDate: "2024-05-10", manager: "Christie Das" },
  { id: "emp-12", name: "Arjun Nambiar", role: "BIM Modeler", department: "BIM and Digital Delivery", site: "HQ Design Cell", email: "arjun.n@hubbuild.com", phone: "+91 98765 10165", employment: "Full-time", status: "Active", joinDate: "2024-10-01", manager: "Kritika Nair" },
  { id: "emp-13", name: "Fatima Sheikh", role: "Procurement Officer", department: "Commercial Controls", site: "Shared Services", email: "fatima.s@hubbuild.com", phone: "+91 98765 10176", employment: "Full-time", status: "Active", joinDate: "2024-02-14", manager: "Omar Sheikh" },
  { id: "emp-14", name: "Suresh Yadav", role: "Steel Fixer Foreman", department: "Civil Execution", site: "Tower A", email: "suresh.y@hubbuild.com", phone: "+91 98765 10187", employment: "Contract", status: "Active", joinDate: "2024-06-20", manager: "Vikram Singh" },
  { id: "emp-15", name: "Anita Desai", role: "Document Controller", department: "Quality Assurance", site: "HQ", email: "anita.desai@hubbuild.com", phone: "+91 98765 10198", employment: "Full-time", status: "Active", joinDate: "2023-12-05", manager: "Christie Das" },
  { id: "emp-16", name: "Rajesh Pillai", role: "Land Surveyor", department: "Survey and Geomatics", site: "Airport Apron Upgrade", email: "rajesh.p@hubbuild.com", phone: "+91 98765 10209", employment: "Full-time", status: "Active", joinDate: "2024-03-28", manager: "Kabir Soni" },
  { id: "emp-17", name: "Kavitha Menon", role: "HR Officer", department: "People Operations", site: "Shared Services", email: "kavitha.m@hubbuild.com", phone: "+91 98765 10220", employment: "Full-time", status: "Active", joinDate: "2024-01-15", manager: "Hannah Harris" },
  { id: "emp-18", name: "Imran Qureshi", role: "Plumbing Supervisor", department: "MEP Coordination", site: "Downtown Tower", email: "imran.q@hubbuild.com", phone: "+91 98765 10231", employment: "Contract", status: "Active", joinDate: "2024-11-02", manager: "Farhan Ali" },
  { id: "emp-19", name: "Divya Saxena", role: "Cost Engineer", department: "Commercial Controls", site: "HQ Controls", email: "divya.s@hubbuild.com", phone: "+91 98765 10242", employment: "Full-time", status: "Active", joinDate: "2025-02-17", manager: "Meera Joshi" },
  { id: "emp-20", name: "Prakash Jha", role: "Commissioning Engineer", department: "MEP Coordination", site: "Tech Park Phase 2", email: "prakash.j@hubbuild.com", phone: "+91 98765 10253", employment: "Full-time", status: "Mobilizing", joinDate: "2025-05-01", manager: "Farhan Ali" },
];

const defaultOutsourcedRoster: OrgEmployee[] = [
  { id: "osr-1", name: "Ramesh Chauhan", role: "Shuttering Carpenter", department: "Civil labor", site: "Downtown Tower - Podium", email: "ramesh.c@urbanworkforce.co", phone: "+91 99876 44011", employment: "Outsourced", status: "Active", joinDate: "2025-01-12", manager: "Harish Patel", vendor: "Urban Workforce Co.", resourceCategory: "Formwork crew", contractRef: "UWC-DT-2026-014", vendorContact: "Rohit Malhotra · +91 99000 44110" },
  { id: "osr-2", name: "Mahesh Bairwa", role: "Steel Fixer", department: "Civil labor", site: "Downtown Tower - Tower A", email: "mahesh.b@urbanworkforce.co", phone: "+91 99876 44012", employment: "Outsourced", status: "Active", joinDate: "2025-02-03", manager: "Vikram Singh", vendor: "Urban Workforce Co.", resourceCategory: "Rebar crew", contractRef: "UWC-DT-2026-014", vendorContact: "Rohit Malhotra · +91 99000 44110" },
  { id: "osr-3", name: "Nitin Saxena", role: "Electrical Technician", department: "Electrical resources", site: "Tech Park Phase 2", email: "nitin.s@voltedge.in", phone: "+91 99876 44013", employment: "Outsourced", status: "Active", joinDate: "2024-11-18", manager: "Anika Shah", vendor: "VoltEdge Services", resourceCategory: "Electrical first-fix", contractRef: "VES-TP2-2026-006", vendorContact: "Manav Bedi · +91 99000 55221" },
  { id: "osr-4", name: "Sajid Khan", role: "Cable Tray Installer", department: "Electrical resources", site: "Tech Park Phase 2", email: "sajid.k@voltedge.in", phone: "+91 99876 44014", employment: "Outsourced", status: "Mobilizing", joinDate: "2025-05-06", manager: "Anika Shah", vendor: "VoltEdge Services", resourceCategory: "Cable tray crew", contractRef: "VES-TP2-2026-006", vendorContact: "Manav Bedi · +91 99000 55221" },
  { id: "osr-5", name: "Moin Shaikh", role: "Ducting Technician", department: "MEP resources", site: "Downtown Tower - Tower A", email: "moin.s@primemep.in", phone: "+91 99876 44015", employment: "Outsourced", status: "Active", joinDate: "2024-12-09", manager: "Farhan Ali", vendor: "Prime MEP Services", resourceCategory: "HVAC installation", contractRef: "PMEP-DT-2026-019", vendorContact: "Zara Fernandes · +91 99000 66332" },
  { id: "osr-6", name: "Arif Ansari", role: "Pipe Fitter", department: "MEP resources", site: "Smart Campus Replica", email: "arif.a@primemep.in", phone: "+91 99876 44016", employment: "Outsourced", status: "Active", joinDate: "2025-03-21", manager: "Zubair Khan", vendor: "Prime MEP Services", resourceCategory: "Plumbing crew", contractRef: "PMEP-SCR-2026-011", vendorContact: "Zara Fernandes · +91 99000 66332" },
  { id: "osr-7", name: "Kunal Pawar", role: "Fire Alarm Technician", department: "Fire protection", site: "Downtown Tower - Tower A", email: "kunal.p@fireshield.in", phone: "+91 99876 44017", employment: "Outsourced", status: "Active", joinDate: "2025-01-28", manager: "Farhan Ali", vendor: "FireShield Solutions", resourceCategory: "Fire alarm team", contractRef: "FSS-DT-2026-004", vendorContact: "Tanya D'Souza · +91 99000 77443" },
  { id: "osr-8", name: "Pratap Soni", role: "Sprinkler Fitter", department: "Fire protection", site: "Downtown Tower - Tower A", email: "pratap.s@fireshield.in", phone: "+91 99876 44018", employment: "Outsourced", status: "On Leave", joinDate: "2024-10-15", manager: "Farhan Ali", vendor: "FireShield Solutions", resourceCategory: "Sprinkler crew", contractRef: "FSS-DT-2026-004", vendorContact: "Tanya D'Souza · +91 99000 77443" },
  { id: "osr-9", name: "Dinesh Rathod", role: "Facade Installer", department: "Finishing resources", site: "Downtown Tower - Tower A", email: "dinesh.r@elitefinishers.co", phone: "+91 99876 44019", employment: "Outsourced", status: "Active", joinDate: "2025-04-01", manager: "Ravi Kumar", vendor: "Elite Finishers Co.", resourceCategory: "Facade crew", contractRef: "EFC-DT-2026-021", vendorContact: "Pallavi Menon · +91 99000 88554" },
  { id: "osr-10", name: "Manoj Patil", role: "Tile Mason", department: "Finishing resources", site: "Downtown Tower - Podium", email: "manoj.p@elitefinishers.co", phone: "+91 99876 44020", employment: "Outsourced", status: "Active", joinDate: "2025-02-24", manager: "Ravi Kumar", vendor: "Elite Finishers Co.", resourceCategory: "Finishing crew", contractRef: "EFC-DT-2026-021", vendorContact: "Pallavi Menon · +91 99000 88554" },
  { id: "osr-11", name: "Ajay Rawat", role: "Land Surveyor", department: "Survey resources", site: "Airport Apron Upgrade", email: "ajay.r@acmesurveys.in", phone: "+91 99876 44021", employment: "Outsourced", status: "Active", joinDate: "2024-09-05", manager: "Kabir Soni", vendor: "Acme Surveys", resourceCategory: "Survey crew", contractRef: "ACS-APR-2026-003", vendorContact: "Neeraj Rao · +91 99000 99665" },
  { id: "osr-12", name: "Tashi Norbu", role: "Drone Operator", department: "Survey resources", site: "Airport Apron Upgrade", email: "tashi.n@acmesurveys.in", phone: "+91 99876 44022", employment: "Outsourced", status: "Active", joinDate: "2025-03-03", manager: "Kabir Soni", vendor: "Acme Surveys", resourceCategory: "Drone mapping", contractRef: "ACS-APR-2026-003", vendorContact: "Neeraj Rao · +91 99000 99665" },
];

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{label}</span>;
}

function ResourceSelect({
  children,
  className = "",
  containerClassName = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { containerClassName?: string }) {
  return (
    <span className={`group relative inline-flex ${containerClassName}`}>
      <select
        {...props}
        className={`h-9 w-full min-w-[132px] appearance-none rounded-xl border border-slate-200 bg-white/95 py-2 pl-3.5 pr-10 text-xs font-medium text-slate-700 shadow-sm shadow-slate-950/[0.03] outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-sky-400 focus:bg-white focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition group-hover:bg-white group-hover:text-slate-600 group-focus-within:bg-sky-50 group-focus-within:text-sky-600">
        <ChevronDown className="h-3.5 w-3.5" />
      </span>
    </span>
  );
}

type ResourceTabItem<T extends string> = {
  key: T;
  label: string;
  count?: number | string;
};

function ResourceTabStrip<T extends string>({
  tabs,
  activeKey,
  onChange,
  className = "",
}: {
  tabs: ResourceTabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-flex min-w-max gap-5 border-b border-slate-200">
        {tabs.map((tab) => {
          const active = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => startTransition(() => onChange(tab.key))}
              className={`relative inline-flex h-9 shrink-0 items-center gap-1.5 px-0.5 text-xs font-medium transition-colors duration-200 ease-out ${active
                ? "text-slate-950"
                : "text-slate-400 hover:text-slate-700"
                }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className={`text-[10px] ${active ? "text-slate-500" : "text-slate-300"}`}>
                  {tab.count}
                </span>
              )}
              {active && <span className="absolute inset-x-0 -bottom-px h-px animate-in fade-in zoom-in-75 bg-blue-600 duration-200" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function resourceTabPanelClass(active: boolean, className = "") {
  return `${className} ${active ? "animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out" : "hidden"}`;
}

function SectionCard({
  title,
  caption,
  children,
  action,
  className = "",
}: {
  title: string;
  caption?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm shadow-slate-950/5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h4 className="text-lg text-slate-950">{title}</h4>
          {caption ? <p className="mt-1 text-sm text-slate-500">{caption}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function AvatarToken({ name, tone }: { name: string; tone: string }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border text-xs font-semibold ${tone}`}>
      {initials}
    </div>
  );
}

function OrgNode({
  person,
  selected,
  level,
  onSelect,
  onAdd,
}: {
  person: OrgPerson;
  selected: boolean;
  level: OrgCardLevel;
  onSelect: () => void;
  onAdd: () => void;
}) {
  const widthByLevel: Record<OrgCardLevel, string> = {
    owner: "w-[248px]",
    manager: "w-[184px]",
    lead: "w-[152px]",
    employee: "w-[144px]",
  };

  const initials = person.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isCompact = level === "lead" || level === "employee";
  const isOwner = level === "owner";

  return (
    <div
      onClick={onSelect}
      className={`flex flex-col overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${widthByLevel[level]} ${isOwner
        ? "rounded-2xl border-2 border-blue-500 bg-gradient-to-br from-blue-50 via-white to-sky-50 shadow-lg shadow-blue-600/15 ring-4 ring-blue-50"
        : `rounded-xl border bg-white ${selected ? "border-sky-400 ring-2 ring-sky-50" : "border-gray-200 shadow-sm shadow-gray-950/5"}`
        }`}
    >
      <div className={isOwner ? "p-4" : isCompact ? "p-2.5" : "p-3"}>
        <div className="flex items-center gap-2">
          <div
            className={`flex shrink-0 items-center justify-center rounded-lg border font-semibold ${isOwner ? "h-11 w-11 text-xs shadow-sm shadow-blue-600/10" : isCompact ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-[11px]"
              } ${person.tone}`}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className={`truncate font-medium leading-tight text-gray-950 ${isCompact ? "text-[11px]" : "text-[13px]"}`}>
              {person.name}
            </p>
            <p className={`mt-0.5 truncate leading-tight text-gray-500 ${isCompact ? "text-[10px]" : "text-[11px]"}`}>
              {person.title}
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="mt-3 rounded-xl border border-blue-100 bg-white/75 px-3 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-blue-700">
            Main organization owner
          </div>
        )}
        <div className="mt-2">
          <span className={`inline-block max-w-full truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium ${person.tone}`}>
            {person.department}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAdd();
        }}
        className={`flex w-full items-center justify-center gap-1 border-t border-dashed border-gray-200 text-[10px] text-gray-400 transition-colors hover:bg-sky-50 hover:text-sky-600 ${isCompact ? "h-6" : "h-7"
          }`}
      >
        <Plus className="h-2.5 w-2.5" />
        Add team member
      </button>
    </div>
  );
}

function OrganizationSection() {
  const [orgMode, setOrgMode] = useState<"sample" | "setup">("sample");
  const [focusedPersonId, setFocusedPersonId] = useState<string>("samuel");
  const [viewRole, setViewRole] = useState<OrgViewRole>("Owner");
  const [customPeople, setCustomPeople] = useState<OrgPerson[]>([]);
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<NewOrgEmployeeForm>(defaultEmployeeForm);
  const [isDraggingCanvas, setDraggingCanvas] = useState(false);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showFreshHint, setShowFreshHint] = useState(false);
  const [orgWorkspaceTab, setOrgWorkspaceTab] = useState<"chart" | "roles">("chart");
  const [roleSectionView, setRoleSectionView] = useState<"hierarchy" | "access">("hierarchy");
  const [selectedRole, setSelectedRole] = useState("Manager");
  const [isCreateRoleOpen, setCreateRoleOpen] = useState(false);
  const [roleOptions, setRoleOptions] = useState(orgRoleOptions);
  const [roleHierarchy, setRoleHierarchy] = useState(defaultRoleHierarchy);
  const [roleDesignationDrafts, setRoleDesignationDrafts] = useState<Record<string, string>>(defaultRoleDesignations);
  const [savedRoleDesignations, setSavedRoleDesignations] = useState<Record<string, string>>(defaultRoleDesignations);
  const [lastDesignationSavedAt, setLastDesignationSavedAt] = useState("Not saved");
  const [openRoleMenu, setOpenRoleMenu] = useState<string | null>(null);
  const [newRoleDraft, setNewRoleDraft] = useState({
    role: "Package Manager",
    parent: "Project Manager",
    level: "Manager",
  });
  const chartViewportRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const people = { ...orgPeople, ...Object.fromEntries(customPeople.map((person) => [person.id, person])) };
  const focusedPerson = people[focusedPersonId] ?? people.samuel;
  const baseLowerIds = orgRows.lower;
  const customDirectReports = customPeople.filter((person) => person.managerId === "samuel").map((person) => person.id);
  const customLowerReports = customPeople
    .filter((person) => person.managerId && orgRows.middle.includes(person.managerId))
    .map((person) => person.id);
  const customBranchReports = customPeople
    .filter((person) => person.managerId && baseLowerIds.includes(person.managerId))
    .map((person) => person.id);
  const orgManagerOptions = Object.values(people);

  const openOnboarding = (managerId = focusedPerson.id) => {
    const manager = people[managerId] ?? people.samuel;
    setEmployeeForm((current) => ({
      ...current,
      managerId: manager.id,
      department: manager.department,
      site: manager.site,
    }));
    setOnboardingOpen(true);
  };

  const createEmployee = () => {
    const name = employeeForm.name.trim() || "New Employee";
    const id = `employee-${Date.now()}`;
    const nextPerson: OrgPerson = {
      id,
      name,
      title: employeeForm.title.trim() || "Team Member",
      department: employeeForm.department.trim() || "Operations",
      site: employeeForm.site.trim() || "Unassigned Site",
      email: employeeForm.email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@hubbuild.com`,
      phone: employeeForm.phone.trim() || "+91 98765 00000",
      reports: 0,
      badge: "New",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
      managerId: employeeForm.managerId,
      employment: employeeForm.employment,
    };
    setCustomPeople((current) => [...current, nextPerson]);
    setFocusedPersonId(id);
    setOnboardingOpen(false);
  };

  const startCanvasDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement) || event.target.closest("button, input, select")) {
      return;
    }

    const viewport = chartViewportRef.current;
    if (!viewport) return;

    setDraggingCanvas(true);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
  };

  const moveCanvas = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCanvas || !chartViewportRef.current) return;
    const drag = dragStartRef.current;
    chartViewportRef.current.scrollLeft = drag.scrollLeft - (event.clientX - drag.x);
    chartViewportRef.current.scrollTop = drag.scrollTop - (event.clientY - drag.y);
  };

  const stopCanvasDrag = () => setDraggingCanvas(false);
  const renderNodeButton = (personId: string) => {
    const person = people[personId];
    if (!person) return null;

    return (
      <div className="relative z-0 transition-transform hover:z-[80] hover:-translate-y-0.5">
        <OrgNode
          person={person}
          selected={focusedPersonId === person.id}
          level={"employee"}
          onSelect={() => setFocusedPersonId(person.id)}
          onAdd={() => openOnboarding(person.id)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <SectionCard
        title="Organization structure"
        caption="Choose an existing organization or create a fresh setup, then manage reporting branches."
        action={
          <div className="flex items-center gap-2">
            <ResourceSelect
              value={viewRole}
              onChange={(event) => setViewRole(event.target.value as OrgViewRole)}
            >
              <option>Owner</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Employee</option>
            </ResourceSelect>
            <button
              type="button"
              onClick={() => openOnboarding()}
              className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-3 text-sm text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2">
          <button
            type="button"
            onClick={() => setOrgMode("sample")}
            className={`rounded-lg border p-4 text-left transition-all ${orgMode === "sample" ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge label="Already setup" tone="bg-sky-100 text-sky-700" />
              <span className="text-xs text-slate-500">{Object.keys(orgPeople).length + customPeople.length} people</span>
            </div>
            <h5 className="text-base text-slate-950">Use full demo organization</h5>
            <p className="mt-1 text-sm text-slate-500">Open a populated owner, PMO, site, commercial and execution hierarchy.</p>
          </button>
          <button
            type="button"
            onClick={() => setOrgMode("setup")}
            className={`rounded-lg border p-4 text-left transition-all ${orgMode === "setup" ? "border-slate-900 bg-slate-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <StatusBadge label="Start fresh" tone="bg-slate-100 text-slate-700" />
              <LayoutTemplate className="h-4 w-4 text-slate-400" />
            </div>
            <h5 className="text-base text-slate-950">Create from scratch</h5>
            <p className="mt-1 text-sm text-slate-500">Set company, departments, reporting managers and employee records step by step.</p>
          </button>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-[#f6f7fb]">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setOrgMode("sample")} className="rounded-md bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">Organization chart</button>
              <button type="button" onClick={() => setFocusedPersonId("samuel")} className="rounded-md px-3 py-2 text-xs text-slate-400 hover:bg-white hover:text-slate-700">C-level</button>
              <button type="button" onClick={() => setFocusedPersonId(orgRows.middle[0])} className="rounded-md px-3 py-2 text-xs text-slate-400 hover:bg-white hover:text-slate-700">Departments</button>
              <button type="button" onClick={() => openOnboarding(focusedPerson.id)} className="rounded-md px-3 py-2 text-xs text-slate-400 hover:bg-white hover:text-slate-700">Employees</button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative min-w-[240px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={focusedPerson.name}
                  readOnly
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-600 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => openOnboarding()}
                className="rounded-md bg-[#2f6df6] px-4 py-2 text-sm text-white shadow-sm hover:bg-[#255bd2]"
              >
                Add Employee
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {orgMode === "setup" ? (
                <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">From Scratch Setup</p>
                    <h5 className="mt-2 text-xl text-slate-950">Start your organization structure</h5>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Define the company name, top owner, departments and primary site hierarchy before adding teams and workers.
                    </p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Organization Name</label>
                        <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" value="HUB Build Operations" readOnly />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Primary Owner</label>
                        <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" value="Samuel Rodriguez" readOnly />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Main Site</label>
                        <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" value="Downtown Tower Complex" readOnly />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Core Departments</label>
                        <input className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none" value="Civil, MEP, Commercial, HR" readOnly />
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button type="button" onClick={() => setOrgMode("sample")} className="rounded-md bg-[#2f6df6] px-4 py-2 text-sm text-white">Create Base Structure</button>
                      <button type="button" onClick={() => openOnboarding("samuel")} className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600">Import Employees</button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 bg-white p-5">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Setup Flow</p>
                    <div className="mt-4 space-y-3">
                      {newOrgChecklist.map((step, index) => (
                        <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs text-white">{index + 1}</div>
                          <p className="text-sm text-slate-600">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  ref={chartViewportRef}
                  onMouseDown={startCanvasDrag}
                  onMouseMove={moveCanvas}
                  onMouseUp={stopCanvasDrag}
                  onMouseLeave={stopCanvasDrag}
                  className={`h-[620px] overflow-auto p-5 ${isDraggingCanvas ? "cursor-grabbing select-none" : "cursor-grab"}`}
                >
                  <div className="min-w-[1350px] pb-10">
                    <div className="mb-4 flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <Grip className="h-3.5 w-3.5" />
                        Drag canvas to move left, right, up and down
                      </span>
                      <span>Viewing as {viewRole}</span>
                    </div>
                    <div className="flex justify-center">
                      {renderNodeButton("samuel")}
                    </div>

                    <div className="mx-auto h-8 w-px bg-sky-300" />
                    <div className="mx-auto h-px w-[880px] bg-sky-300" />

                    <div className="grid grid-cols-4 gap-8 px-12">
                      {[...orgRows.middle, ...customDirectReports].map((id) => (
                        <div key={id} className="flex flex-col items-center">
                          <div className="h-8 w-px bg-sky-300" />
                          {renderNodeButton(id)}
                        </div>
                      ))}
                    </div>

                    <div className="mx-auto mt-2 h-8 w-px bg-[#f3a86c]" />
                    <div className="mx-auto h-px w-[1080px] bg-[#f3a86c]" />

                    <div className="grid grid-cols-6 gap-6 px-4">
                      {[...baseLowerIds, ...customLowerReports].map((id) => (
                        <div key={id} className="flex flex-col items-center">
                          <div className="h-8 w-px bg-[#f3a86c]" />
                          {renderNodeButton(id)}
                        </div>
                      ))}
                    </div>

                    {customBranchReports.length > 0 && (
                      <>
                        <div className="mx-auto mt-2 h-8 w-px bg-emerald-300" />
                        <div className="mx-auto h-px w-[640px] bg-emerald-300" />
                        <div className="grid grid-cols-4 gap-6 px-48">
                          {customBranchReports.map((id) => (
                            <div key={id} className="flex flex-col items-center">
                              <div className="h-8 w-px bg-emerald-300" />
                              {renderNodeButton(id)}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        <SectionCard title="Departments and reporting managers" caption="Ownership of workstreams and site clusters">
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.1fr_1fr_80px_1.2fr_1.2fr] gap-4 bg-slate-50 px-4 py-3 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              <span>Department</span>
              <span>Head</span>
              <span>Mgrs</span>
              <span>Sites</span>
              <span>Ownership</span>
            </div>
            {departmentRows.map((row) => (
              <div key={row.department} className="grid grid-cols-[1.1fr_1fr_80px_1.2fr_1.2fr] gap-4 border-t border-slate-100 px-4 py-4 text-sm">
                <span className="text-slate-950">{row.department}</span>
                <span className="text-slate-600">{row.head}</span>
                <span className="text-slate-600">{row.managers}</span>
                <span className="text-slate-600">{row.sites}</span>
                <span className="text-slate-600">{row.ownership}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="People setup" caption="Add employees and map them into the structure">
          <div className="space-y-3">
            {workforceRoster.slice(0, 4).map((person) => (
              <div key={person.name} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-3">
                  <AvatarToken name={person.name} tone="bg-slate-100 text-slate-700 border-slate-200" />
                  <div>
                    <p className="text-sm text-slate-950">{person.name}</p>
                    <p className="text-xs text-slate-500">{person.role} • {person.project}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            ))}
          </div>
          <button type="button" onClick={() => openOnboarding(focusedPerson.id)} className="mt-4 w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 hover:border-slate-400">
            + Add more people to org structure
          </button>
        </SectionCard>
      </div>

      <Dialog open={isOnboardingOpen} onOpenChange={setOnboardingOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Onboard employee</DialogTitle>
            <DialogDescription>Add a person into the selected reporting branch.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Employee name</label>
              <input
                value={employeeForm.name}
                onChange={(event) => setEmployeeForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Role / Title</label>
              <input
                value={employeeForm.title}
                onChange={(event) => setEmployeeForm((current) => ({ ...current, title: event.target.value }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Department</label>
              <input
                value={employeeForm.department}
                onChange={(event) => setEmployeeForm((current) => ({ ...current, department: event.target.value }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Site / Location</label>
              <input
                value={employeeForm.site}
                onChange={(event) => setEmployeeForm((current) => ({ ...current, site: event.target.value }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Email</label>
              <input
                value={employeeForm.email}
                onChange={(event) => setEmployeeForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Phone</label>
              <input
                value={employeeForm.phone}
                onChange={(event) => setEmployeeForm((current) => ({ ...current, phone: event.target.value }))}
                className="w-full rounded-md border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-900"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Employment status</label>
              <ResourceSelect
                value={employeeForm.employment}
                onChange={(event) => setEmployeeForm((current) => ({ ...current, employment: event.target.value }))}
                containerClassName="w-full"
                className="text-sm"
              >
                <option>Full-time</option>
                <option>Contract</option>
                <option>Consultant</option>
                <option>Worker</option>
              </ResourceSelect>
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-slate-400">Reporting manager</label>
              <ResourceSelect
                value={employeeForm.managerId}
                onChange={(event) => setEmployeeForm((current) => ({ ...current, managerId: event.target.value }))}
                containerClassName="w-full"
                className="text-sm"
              >
                {orgManagerOptions.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} - {person.title}
                  </option>
                ))}
              </ResourceSelect>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => setOnboardingOpen(false)}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-300"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={createEmployee}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
            >
              Add to org
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type AgendaHierarchyNode = {
  id: string;
  title: string;
  type: "phase" | "task" | "subtask";
  owner?: string;
  due?: string;
  date?: string;
  children?: AgendaHierarchyNode[];
};

const completedHierarchy: AgendaHierarchyNode[] = [
  {
    id: "c-p1", title: "Mobilization Phase", type: "phase", children: [
      {
        id: "c-t1", title: "Site setup", type: "task", children: [
          { id: "c-s1", title: "Site mobilization sign-off", type: "subtask", date: "Oct 12" },
          { id: "c-s2", title: "Initial safety compliance check", type: "subtask", date: "Oct 15" },
        ]
      },
    ]
  },
];

const ongoingHierarchy: AgendaHierarchyNode[] = [
  {
    id: "o-p1", title: "Structural Works", type: "phase", children: [
      {
        id: "o-t1", title: "Podium Construction", type: "task", children: [
          { id: "o-s1", title: "Approve podium revised pour sequence", type: "subtask", owner: "Ravi Kumar", due: "Today" },
        ]
      },
      {
        id: "o-t2", title: "Milestone Tracking", type: "task", children: [
          { id: "o-s2", title: "Resolve milestone recovery baseline", type: "subtask", owner: "Priya Menon", due: "Tomorrow" },
        ]
      }
    ]
  }
];

const upcomingHierarchy: AgendaHierarchyNode[] = [
  {
    id: "u-p1", title: "MEP & Facade", type: "phase", children: [
      {
        id: "u-t1", title: "MEP First Fix", type: "task", children: [
          { id: "u-s1", title: "MEP first-fix clearance", type: "subtask", due: "Nov 05" },
        ]
      },
      {
        id: "u-t2", title: "Exterior Finishes", type: "task", children: [
          { id: "u-s2", title: "Facade installation kickoff", type: "subtask", due: "Nov 12" },
          { id: "u-s3", title: "Phase 2 budget approval", type: "subtask", due: "Nov 20" },
        ]
      }
    ]
  }
];


function OrganizationStructureMain() {
  const [freshMode, setFreshMode] = useState(false);
  const [viewRole, setViewRole] = useState<OrgViewRole>("Owner");
  const [focusedPersonId, setFocusedPersonId] = useState("samuel");
  const [customPeople, setCustomPeople] = useState<OrgPerson[]>([]);
  const [isOnboardingOpen, setOnboardingOpen] = useState(false);
  const [employeeForm, setEmployeeForm] = useState<NewOrgEmployeeForm>(defaultEmployeeForm);
  const [isDraggingCanvas, setDraggingCanvas] = useState(false);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showFreshHint, setShowFreshHint] = useState(false);
  const [orgWorkspaceTab, setOrgWorkspaceTab] = useState<"chart" | "roles" | "stakeholders">("chart");
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.1, 1.5));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.1, 0.4));
  const zoomReset = () => setZoomLevel(1);
  const [selectedRole, setSelectedRole] = useState("Manager");
  const [isCreateRoleOpen, setCreateRoleOpen] = useState(false);
  const [roleOptions, setRoleOptions] = useState(orgRoleOptions);
  const [roleHierarchy, setRoleHierarchy] = useState(defaultRoleHierarchy);
  const [roleDesignationDrafts, setRoleDesignationDrafts] = useState<Record<string, string>>(defaultRoleDesignations);
  const [savedRoleDesignations, setSavedRoleDesignations] = useState<Record<string, string>>(defaultRoleDesignations);
  const [lastDesignationSavedAt, setLastDesignationSavedAt] = useState("Not saved");
  const [openRoleMenu, setOpenRoleMenu] = useState<string | null>(null);
  const [newRoleDraft, setNewRoleDraft] = useState({
    role: "Package Manager",
    parent: "Project Manager",
    level: "Manager",
  });
  const [stakeholders, setStakeholders] = useState(defaultStakeholders);
  const [stakeholderTasks] = useState(defaultStakeholderTasks);
  const [agendaByStakeholder, setAgendaByStakeholder] = useState<Record<string, StakeholderAgenda>>({});
  const [meetingReadyStakeholderId, setMeetingReadyStakeholderId] = useState<string | null>(null);
  const [selectedStakeholderId, setSelectedStakeholderId] = useState(defaultStakeholders[0]?.id ?? "");
  const [isCreateStakeholderOpen, setCreateStakeholderOpen] = useState(false);
  const [openStakeholderMenuId, setOpenStakeholderMenuId] = useState<string | null>(null);
  const [selectedAgendaTasks, setSelectedAgendaTasks] = useState<Set<string>>(new Set());
  const [isScheduleMeetingOpen, setScheduleMeetingOpen] = useState(false);

  const handleToggleHierarchy = (node: AgendaHierarchyNode, isChecked: boolean) => {
    const titlesToToggle: string[] = [];
    const gatherTitles = (n: AgendaHierarchyNode) => {
      titlesToToggle.push(n.title);
      if (n.children) n.children.forEach(gatherTitles);
    };
    gatherTitles(node);

    const newSet = new Set(selectedAgendaTasks);
    titlesToToggle.forEach(t => {
      if (isChecked) newSet.add(t);
      else newSet.delete(t);
    });
    setSelectedAgendaTasks(newSet);
  };

  const renderHierarchy = (nodes: AgendaHierarchyNode[], isCompleted = false) => {
    return (
      <div className="flex flex-col gap-2">
        {nodes.map(phase => {
          const isPhaseChecked = selectedAgendaTasks.has(phase.title);
          return (
            <div key={phase.id} className="flex flex-col gap-1.5">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-100/50 p-2 shadow-sm transition hover:bg-slate-100">
                <input type="checkbox" className="peer sr-only" checked={isPhaseChecked} onChange={(e) => handleToggleHierarchy(phase, e.target.checked)} />
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white peer-checked:border-blue-500 peer-checked:bg-blue-50">
                  <CheckSquare className="h-3 w-3 text-blue-600 opacity-0 peer-checked:opacity-100" />
                </div>
                <span className={`text-[11px] font-bold uppercase tracking-wide ${isCompleted ? "text-slate-500 line-through" : "text-slate-700"}`}>{phase.title}</span>
              </label>
              {phase.children?.map(task => {
                const isTaskChecked = selectedAgendaTasks.has(task.title);
                return (
                  <div key={task.id} className="ml-4 flex flex-col gap-1.5 border-l border-slate-200 pl-3">
                    <label className="flex cursor-pointer items-center gap-2 rounded border border-slate-100 bg-slate-50 p-1.5 transition hover:bg-slate-100/70">
                      <input type="checkbox" className="peer sr-only" checked={isTaskChecked} onChange={(e) => handleToggleHierarchy(task, e.target.checked)} />
                      <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border border-slate-300 bg-white peer-checked:border-blue-500 peer-checked:bg-blue-50">
                        <CheckSquare className="h-2.5 w-2.5 text-blue-600 opacity-0 peer-checked:opacity-100" />
                      </div>
                      <span className={`text-xs font-semibold ${isCompleted ? "text-slate-500 line-through" : "text-slate-800"}`}>{task.title}</span>
                    </label>
                    {task.children?.map(subtask => {
                      const isSubtaskChecked = selectedAgendaTasks.has(subtask.title);
                      return (
                        <label key={subtask.id} className={`group ml-4 flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition hover:shadow-md ${isCompleted ? "border-slate-200 bg-slate-50/50" : "border-slate-200 bg-white hover:border-blue-200"}`}>
                          <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-slate-300 bg-white peer-checked:border-blue-500 peer-checked:bg-blue-50">
                            <input type="checkbox" className="peer sr-only" checked={isSubtaskChecked} onChange={(e) => handleToggleHierarchy(subtask, e.target.checked)} />
                            <CheckSquare className="h-3 w-3 text-blue-600 opacity-0 peer-checked:opacity-100" />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-medium transition-colors ${isCompleted ? "text-slate-500 line-through opacity-70" : (isSubtaskChecked ? "text-blue-700" : "text-slate-900")}`}>{subtask.title}</p>
                            {(subtask.owner || subtask.due || subtask.date) && (
                              <p className="mt-0.5 text-[10px] text-slate-500">
                                {subtask.owner && `Owner: ${subtask.owner} `}
                                {subtask.owner && (subtask.due || subtask.date) && "· "}
                                {subtask.due && `Due: ${subtask.due}`}
                                {subtask.date && (isCompleted ? `Completed on ${subtask.date}` : `Date: ${subtask.date}`)}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const [scheduledMeetingReady, setScheduledMeetingReady] = useState(false);
  const [stakeholderInnerTab, setStakeholderInnerTab] = useState<"tasks" | "profile">("profile");

  const [pendingInvites, setPendingInvites] = useState([
    { email: "david.chen@vertex-eng.com", time: "Sent 2 days ago" },
    { email: "sarah.jenkins@cityplanning.gov", time: "Sent 5 days ago" },
  ]);
  const [inviteEmailDraft, setInviteEmailDraft] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => setGlobalToast(null), 3500);
  };

  const handleSendInvite = () => {
    if (!inviteEmailDraft || !inviteEmailDraft.includes("@")) return;
    setIsInviting(true);
    setTimeout(() => {
      setPendingInvites(prev => [{ email: inviteEmailDraft, time: "Sent just now" }, ...prev]);
      showToast(`Invitation sent to ${inviteEmailDraft}`);
      setInviteEmailDraft("");
      setIsInviting(false);
    }, 600);
  };

  const handleCancelInvite = (email: string) => {
    setPendingInvites(prev => prev.filter(inv => inv.email !== email));
    showToast(`Invitation to ${email} cancelled`);
  };

  const [stakeholderDraft, setStakeholderDraft] = useState<Omit<OrgStakeholder, "id">>({
    name: "Karan Desai",
    category: "Client",
    organization: "Metro Infrastructure Board",
    role: "Project Stakeholder",
    project: "Downtown Tower Complex",
    contact: "+91 98765 30300",
    email: "karan.desai@example.com",
    influence: "Medium",
    status: "Active",
    lastTouch: "Initial coordination meeting",
  });
  const chartViewportRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const people = { ...orgPeople, ...Object.fromEntries(customPeople.map((person) => [person.id, person])) };
  const focusedPerson = people[focusedPersonId] ?? people.samuel;
  const selectedStakeholder = stakeholders.find((stakeholder) => stakeholder.id === selectedStakeholderId) ?? stakeholders[0];
  const selectedStakeholderTasks = selectedStakeholder ? stakeholderTasks.filter((task) => task.stakeholderId === selectedStakeholder.id) : [];
  const selectedAgenda = selectedStakeholder ? agendaByStakeholder[selectedStakeholder.id] : undefined;
  const orgChildMap = customPeople.reduce<Record<string, string[]>>(
    (map, person) => {
      if (!person.managerId) return map;
      return {
        ...map,
        [person.managerId]: [...(map[person.managerId] ?? []), person.id],
      };
    },
    freshMode ? {} : Object.fromEntries(Object.entries(orgChildrenByManager).map(([managerId, childIds]) => [managerId, [...childIds]])),
  );
  const getOrgChildren = (personId: string) => orgChildMap[personId] ?? [];
  const managerIds = getOrgChildren("samuel");
  const lowerIds = managerIds.flatMap((managerId) => getOrgChildren(managerId));
  const hasManager = managerIds.length > 0;
  const hasLead = lowerIds.length > 0;
  const currentStep = !hasManager ? 1 : !hasLead ? 2 : 3;
  const setupSteps = [
    { step: 1, title: "Owner", detail: "Owner is ready" },
    { step: 2, title: "Manager", detail: "Add project manager" },
    { step: 3, title: "Site leads", detail: "Create execution leads" },
    { step: 4, title: "Employees", detail: "Add engineers and workers" },
  ];
  const guide = !hasManager
    ? {
      label: "Owner added",
      message: "Next add a Project Manager below Samuel Rodriguez.",
      action: "Add manager",
      managerId: "samuel",
      form: { name: "Priya Menon", title: "Project Manager", department: "Project Management", site: "Downtown Tower Complex" },
    }
    : !hasLead
      ? {
        label: "Manager added",
        message: "Next create site leads for civil, MEP, safety, planning or procurement.",
        action: "Add site lead",
        managerId: managerIds[0],
        form: { name: "Ravi Kumar", title: "Civil Execution Lead", department: "Civil Execution", site: "Downtown Tower Complex" },
      }
      : {
        label: "Structure ready",
        message: "Add engineers, supervisors and workers under any reporting branch.",
        action: "Add employee",
        managerId: focusedPerson.id,
        form: { name: "Aarav Sharma", title: "Site Engineer", department: focusedPerson.department, site: focusedPerson.site },
      };

  const openOnboarding = (managerId = focusedPerson.id, formOverride?: Partial<NewOrgEmployeeForm>) => {
    const manager = people[managerId] ?? people.samuel;
    setEmployeeForm((current) => ({
      ...current,
      managerId: manager.id,
      department: manager.department,
      site: manager.site,
      ...formOverride,
    }));
    setOnboardingOpen(true);
  };

  const startFresh = () => {
    setFreshMode(true);
    setCustomPeople([]);
    setFocusedPersonId("samuel");
    setGuideOpen(false);
    setShowFreshHint(false);
    setEmployeeForm((current) => ({
      ...current,
      name: "Priya Menon",
      title: "Project Manager",
      department: "Project Management",
      site: "Downtown Tower Complex",
      email: "priya.menon@hubbuild.com",
      managerId: "samuel",
    }));
  };

  useEffect(() => {
    if (!freshMode || hasManager || chartExpanded) {
      setShowFreshHint(false);
      return;
    }

    const hintTimer = window.setTimeout(() => setShowFreshHint(true), 1200);
    return () => window.clearTimeout(hintTimer);
  }, [freshMode, hasManager, chartExpanded]);

  const createEmployee = () => {
    const name = employeeForm.name.trim() || "New Employee";
    const nextPerson: OrgPerson = {
      id: `employee-${Date.now()}`,
      name,
      title: employeeForm.title.trim() || "Team Member",
      department: employeeForm.department.trim() || "Operations",
      site: employeeForm.site.trim() || "Unassigned Site",
      email: employeeForm.email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@hubbuild.com`,
      phone: employeeForm.phone.trim() || "+91 98765 00000",
      reports: 0,
      badge: employeeForm.employment === "Worker" ? "Worker" : "New",
      tone: "bg-emerald-50 text-emerald-700 border-emerald-100",
      managerId: employeeForm.managerId,
      employment: employeeForm.employment,
    };
    setCustomPeople((current) => [...current, nextPerson]);
    setFocusedPersonId(nextPerson.id);
    setOnboardingOpen(false);
  };

  const startCanvasDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement) || event.target.closest("button, input, select")) return;
    const viewport = chartViewportRef.current;
    if (!viewport) return;
    setDraggingCanvas(true);
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
  };

  const moveCanvas = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCanvas || !chartViewportRef.current) return;
    const drag = dragStartRef.current;
    chartViewportRef.current.scrollLeft = drag.scrollLeft - (event.clientX - drag.x);
    chartViewportRef.current.scrollTop = drag.scrollTop - (event.clientY - drag.y);
  };

  const renderNode = (personId: string, level: OrgCardLevel) => {
    const person = people[personId];
    if (!person) return null;
    return (
      <OrgNode
        person={person}
        selected={focusedPersonId === person.id}
        level={level}
        onSelect={() => setFocusedPersonId(person.id)}
        onAdd={() => openOnboarding(person.id)}
      />
    );
  };
  const renderOrgLevel = (ids: string[], lineColor: string, level: OrgCardLevel) => {
    const widths: Record<OrgCardLevel, number> = { owner: 216, manager: 184, lead: 152, employee: 144 };
    const gaps: Record<OrgCardLevel, number> = { owner: 24, manager: 20, lead: 12, employee: 12 };
    const cardWidth = widths[level];
    const gapSize = gaps[level];
    const edgeOffset = cardWidth / 2;
    return (
      <div className="relative mx-auto w-max px-4 pt-8">
        <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2" style={{ backgroundColor: lineColor }} />
        {ids.length > 1 && (
          <div
            className="absolute top-8 h-px"
            style={{
              backgroundColor: lineColor,
              left: edgeOffset + 16,
              right: edgeOffset + 16,
            }}
          />
        )}
        <div className="grid" style={{ gridTemplateColumns: `repeat(${ids.length}, ${cardWidth}px)`, gap: `${gapSize}px` }}>
          {ids.map((id) => (
            <div key={id} className="relative flex justify-center pt-8">
              <div className="absolute left-1/2 top-0 h-8 w-px -translate-x-1/2" style={{ backgroundColor: lineColor }} />
              {renderNode(id, level)}
            </div>
          ))}
        </div>
      </div>
    );
  };
  const getTreeCardLevel = (depth: number): OrgCardLevel => (depth === 0 ? "owner" : depth === 1 ? "manager" : depth === 2 ? "lead" : "employee");
  const getTreeGroupTone = (depth: number) =>
    [
      "border-sky-100 bg-sky-50/50 text-sky-700",
      "border-orange-100 bg-orange-50/50 text-orange-700",
      "border-emerald-100 bg-emerald-50/50 text-emerald-700",
      "border-violet-100 bg-violet-50/50 text-violet-700",
    ][Math.min(depth, 3)];
  const renderOrgTree = (personId: string, depth = 0): ReactNode => {
    const person = people[personId];
    const children = getOrgChildren(personId).filter((childId) => people[childId]);
    if (!person) return null;
    const groupTone = getTreeGroupTone(depth);

    return (
      <div className="flex w-max flex-col items-center">
        {renderNode(personId, getTreeCardLevel(depth))}
        {children.length > 0 && (
          <div className={`mt-5 w-max rounded-3xl border p-3 shadow-sm shadow-slate-950/[0.03] ${groupTone}`}>
            <div className="mb-3 flex items-center justify-between gap-4 px-1">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                Reports under {person.name}
              </span>
              <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                {children.length} {children.length === 1 ? "member" : "members"}
              </span>
            </div>
            <div
              className="grid items-start justify-center gap-4"
              style={{ gridTemplateColumns: `repeat(${children.length}, max-content)` }}
            >
              {children.map((childId) => (
                <div key={childId} className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm shadow-slate-950/[0.03]">
                  {renderOrgTree(childId, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  const createRole = () => {
    const roleName = newRoleDraft.role.trim();
    if (!roleName) return;
    setRoleOptions((current) => current.includes(roleName) ? current : [...current, roleName]);
    setRoleHierarchy((current) => [
      ...current,
      {
        role: roleName,
        parent: newRoleDraft.parent,
        level: newRoleDraft.level,
        order: current.length + 1,
      },
    ]);
    setRoleDesignationDrafts((current) => ({ ...current, [roleName]: getDefaultRoleDesignation(newRoleDraft.level) }));
    setSavedRoleDesignations((current) => ({ ...current, [roleName]: getDefaultRoleDesignation(newRoleDraft.level) }));
    setSelectedRole(roleName);
    setCreateRoleOpen(false);
  };
  const saveRoleDesignations = () => {
    setSavedRoleDesignations(roleDesignationDrafts);
    setLastDesignationSavedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
  };
  const createStakeholder = () => {
    const name = stakeholderDraft.name.trim();
    if (!name) return;
    const nextStakeholder: OrgStakeholder = {
      ...stakeholderDraft,
      id: `stakeholder-${Date.now()}`,
      name,
      organization: stakeholderDraft.organization.trim() || "Unassigned organization",
      role: stakeholderDraft.role.trim() || "Stakeholder",
      project: stakeholderDraft.project.trim() || "General",
      contact: stakeholderDraft.contact.trim() || "+91 98765 00000",
      email: stakeholderDraft.email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@example.com`,
      lastTouch: stakeholderDraft.lastTouch.trim() || "Added to stakeholder register",
    };
    setStakeholders((current) => [...current, nextStakeholder]);
    setSelectedStakeholderId(nextStakeholder.id);
    setCreateStakeholderOpen(false);
  };
  const generateStakeholderAgenda = () => {
    if (!selectedStakeholder) return;
    const linkedTasks = selectedStakeholderTasks;
    const agenda: StakeholderAgenda = {
      stakeholderId: selectedStakeholder.id,
      title: `${selectedStakeholder.name} meeting agenda`,
      generatedAt: new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      attendees: [selectedStakeholder.name, selectedStakeholder.role, "Project Manager", "Task owners"],
      items: linkedTasks.length
        ? linkedTasks.map((task) => `${task.title}: ${task.agendaHint}`)
        : [`Review current action items and confirm next steps with ${selectedStakeholder.name}.`],
      decisions: linkedTasks
        .filter((task) => ["Critical", "High"].includes(task.priority))
        .map((task) => `Decision required for ${task.title} by ${task.due}.`),
      risks: linkedTasks
        .filter((task) => ["Blocked", "Overdue", "At risk", "Pending submission"].includes(task.status))
        .map((task) => `${task.status}: ${task.title} owned by ${task.owner}.`),
    };
    setAgendaByStakeholder((current) => ({ ...current, [selectedStakeholder.id]: agenda }));
    setMeetingReadyStakeholderId(null);
  };

  return (
    <div className={`overflow-hidden bg-white ${chartExpanded ? "fixed inset-0 z-50 rounded-none border-0" : "rounded-lg border border-gray-200"}`}>
      {!chartExpanded && orgWorkspaceTab === "chart" && (
        <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-950">Organization structure</h3>
            <p className="mt-1 text-xs font-normal text-gray-500">
              {freshMode ? "Owner is added. Build the construction project structure step by step." : "Construction project team hierarchy."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ResourceSelect
              value={viewRole}
              onChange={(event) => setViewRole(event.target.value as OrgViewRole)}
            >
              <option>Owner</option>
              <option>Admin</option>
              <option>Manager</option>
              <option>Employee</option>
            </ResourceSelect>
            <button type="button" onClick={() => setFreshMode(false)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:border-gray-300">
              <Network className="h-3.5 w-3.5" />
              Demo org
            </button>
            <button type="button" onClick={startFresh} className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-600 hover:bg-rose-50">
              <ArrowUpRight className="h-3.5 w-3.5 rotate-180" />
              Start fresh
            </button>
            {freshMode && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setGuideOpen((current) => !current);
                    setShowFreshHint(false);
                  }}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 text-xs font-medium text-blue-700 hover:bg-blue-50"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-40" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                  </span>
                  Guide
                </button>
                {showFreshHint && !guideOpen && (
                  <div className="absolute right-0 top-11 z-30 w-[260px] animate-in fade-in slide-in-from-top-1 rounded-lg border border-blue-100 bg-white p-3 shadow-xl shadow-slate-950/10">
                    <div className="absolute -top-1.5 right-8 h-3 w-3 rotate-45 border-l border-t border-blue-100 bg-white" />
                    <div className="flex gap-3">
                      <span className="relative mt-1 flex h-4 w-4 shrink-0">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-35" />
                        <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-600" />
                      </span>
                      <div>
                        <p className="text-xs font-medium text-gray-950">Create your structure</p>
                        <p className="mt-1 text-xs leading-5 text-gray-500">Click Guide to add a manager, then add site leads and employees.</p>
                      </div>
                    </div>
                  </div>
                )}
                {guideOpen && (
                  <div className="absolute right-0 top-11 z-30 w-[320px] rounded-lg border border-gray-200 bg-white p-3 shadow-xl shadow-slate-950/10">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-gray-950">{guide.label}</p>
                        <p className="mt-1 text-xs font-normal leading-5 text-gray-500">{guide.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => openOnboarding(guide.managerId, { ...guide.form, email: `${guide.form.name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@hubbuild.com` })}
                        className="relative inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-blue-600 px-2.5 text-xs font-medium text-white hover:bg-blue-700"
                      >
                        <span className="absolute -left-1.5 -top-1.5 flex h-4 w-4">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-35" />
                          <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-blue-600" />
                        </span>
                        <Plus className="h-3.5 w-3.5" />
                        {guide.action}
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {setupSteps.map((item) => {
                        const done = item.step < currentStep;
                        const active = item.step === currentStep;
                        return (
                          <div
                            key={item.step}
                            className={`flex items-center gap-2 rounded-md px-2 py-2 ${active ? "bg-blue-50 text-blue-800" : done ? "bg-emerald-50 text-emerald-700" : "bg-gray-50 text-gray-500"
                              }`}
                          >
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium ${done ? "bg-emerald-600 text-white" : active ? "bg-blue-600 text-white" : "bg-white text-gray-500"}`}>
                              {item.step}
                            </span>
                            <span>
                              <span className="block text-xs font-medium leading-none">{item.title}</span>
                              <span className="mt-1 block text-[10px] font-normal leading-none opacity-70">{item.detail}</span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button type="button" onClick={() => openOnboarding()} className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              Add Employee
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <ResourceTabStrip
          tabs={[
            { key: "chart", label: "Org chart" },
            { key: "roles", label: "Roles" },
            { key: "stakeholders", label: "Stakeholders" },
          ]}
          activeKey={orgWorkspaceTab}
          onChange={setOrgWorkspaceTab}
        />
        <div className="flex items-center gap-2">
          {!chartExpanded && (
            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={orgWorkspaceTab === "roles" ? selectedRole : orgWorkspaceTab === "stakeholders" ? selectedStakeholder?.name ?? "" : focusedPerson.name}
                readOnly
                className="h-9 w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs text-gray-600 outline-none"
              />
            </div>
          )}
          <button
            type="button"
            onClick={() => setChartExpanded((current) => !current)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:border-gray-300"
          >
            {chartExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            {chartExpanded ? "Minimize" : "Maximize"}
          </button>
        </div>
      </div>

      {freshMode && !hasManager && !chartExpanded && orgWorkspaceTab === "chart" && (
        <div className="border-b border-gray-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <AvatarToken name={people.samuel.name} tone={people.samuel.tone} />
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-950">Owner added automatically</p>
              <p className="mt-0.5 text-xs font-normal text-gray-500">Samuel Rodriguez - Owner - HQ + Multi-site</p>
            </div>
          </div>
        </div>
      )}

      {orgWorkspaceTab === "chart" && (
        <div
          ref={chartViewportRef}
          onMouseDown={startCanvasDrag}
          onMouseMove={moveCanvas}
          onMouseUp={() => setDraggingCanvas(false)}
          onMouseLeave={() => setDraggingCanvas(false)}
          className={`${chartExpanded ? "h-[calc(100vh-57px)]" : "h-[620px]"} overflow-auto ${isDraggingCanvas ? "cursor-grabbing select-none" : "cursor-grab"}`}
        >
          <div className="w-max min-w-full bg-white pb-10">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 text-[11px] font-normal text-gray-500">
              <span className="inline-flex items-center gap-2">
                <Grip className="h-3.5 w-3.5" />
                Drag to pan canvas
              </span>
              <div className="flex items-center gap-3">
                <span>{freshMode ? `${customPeople.length + 1} people` : `${Object.keys(orgPeople).length + customPeople.length} people`} · Viewing as {viewRole}</span>
                <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-0.5">
                  <button type="button" onClick={zoomOut} className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" title="Zoom out">
                    <ZoomOut className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={zoomReset} className="flex h-6 min-w-[40px] items-center justify-center rounded-md text-[10px] font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800" title="Reset zoom">
                    {Math.round(zoomLevel * 100)}%
                  </button>
                  <button type="button" onClick={zoomIn} className="flex h-6 w-6 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800" title="Zoom in">
                    <ZoomIn className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="inline-block w-max min-w-full px-[360px] py-8 transition-transform duration-150 ease-out" style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}>
              <div className="flex w-max min-w-full justify-center">
                {renderOrgTree("samuel")}
              </div>

              {managerIds.length === 0 && (
                <div className="relative mx-auto mt-8 w-[240px] rounded-lg border border-dashed border-blue-300 bg-blue-50 p-4 text-center">
                  <span className="absolute -right-2 -top-2 flex h-6 w-6">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-35" />
                    <span className="relative inline-flex h-6 w-6 rounded-full border-2 border-white bg-blue-600" />
                  </span>
                  <p className="text-xs font-medium text-blue-800">Add your first manager</p>
                  <button type="button" onClick={() => openOnboarding("samuel", { name: "Priya Menon", title: "Project Manager", department: "Project Management", email: "priya.menon@hubbuild.com" })} className="mt-3 inline-flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
                    <Plus className="h-3.5 w-3.5" />
                    Add manager
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {orgWorkspaceTab === "roles" && (
        <div className="grid min-h-[620px] gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
          <div className="border-b border-gray-100 bg-gray-50 p-4 lg:border-b-0 lg:border-r">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase text-gray-400">Org roles</p>
              <button
                type="button"
                onClick={() => setCreateRoleOpen(true)}
                className="inline-flex h-7 items-center gap-1 rounded-md border border-gray-200 bg-white px-2 text-[11px] font-medium text-gray-600 hover:border-gray-300"
              >
                <Plus className="h-3 w-3" />
                Role
              </button>
            </div>
            <div className="space-y-1.5">
              {roleOptions.slice(0, 8).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setSelectedRole(role)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-medium ${selectedRole === role ? "bg-white text-gray-950 shadow-sm ring-1 ring-gray-200" : "text-gray-600 hover:bg-white"
                    }`}
                >
                  <span>{role}</span>
                  <span className="text-[10px] font-normal text-gray-400">{role === "Owner" ? "Full" : role === "Employee" ? "Limited" : "Custom"}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="p-5">
            <div className="mb-5 flex flex-col gap-3 border-b border-gray-100 pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-950">Role hierarchy</h4>
                <p className="mt-1 text-xs text-gray-500">Create organization roles, assign designation and define where each role sits in the reporting structure. Saved: {lastDesignationSavedAt}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ResourceSelect value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>
                  {roleOptions.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </ResourceSelect>
                <button type="button" onClick={saveRoleDesignations} className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
                  Save designations
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-medium uppercase text-gray-400">Role hierarchy</p>
              </div>
              <div className="grid grid-cols-[76px_minmax(180px,1fr)_minmax(170px,0.85fr)_190px_minmax(140px,0.7fr)_64px] items-center gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                <span>Level</span>
                <span>Role</span>
                <span>Reports under</span>
                <span>Designation</span>
                <span>Hierarchy type</span>
                <span className="text-right">Actions</span>
              </div>
              <div className="grid gap-0 bg-white">
                {roleHierarchy.map((item, index) => (
                  <div key={`${item.role}-${index}`} className="grid grid-cols-[76px_minmax(180px,1fr)_minmax(170px,0.85fr)_190px_minmax(140px,0.7fr)_64px] items-center gap-3 border-b border-gray-100 px-4 py-3 text-xs last:border-b-0 hover:bg-gray-50/70">
                    <span className="font-medium text-gray-400">L{item.order}</span>
                    <span className="font-medium text-gray-950">{item.role}</span>
                    <span className="text-gray-500">Under: {item.parent}</span>
                    <ResourceSelect
                      value={roleDesignationDrafts[item.role] ?? getDefaultRoleDesignation(item.level)}
                      onChange={(event) => setRoleDesignationDrafts((current) => ({ ...current, [item.role]: event.target.value }))}
                      containerClassName="w-full"
                      className="h-8 text-xs"
                    >
                      {roleDesignationOptions.map((designation) => (
                        <option key={designation}>{designation}</option>
                      ))}
                    </ResourceSelect>
                    <span className="text-gray-500">{item.level}</span>
                    <div className="relative flex justify-end">
                      <button
                        type="button"
                        onClick={() => setOpenRoleMenu((current) => (current === item.role ? null : item.role))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openRoleMenu === item.role && (
                        <div className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl shadow-slate-950/10">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRole(item.role);
                              setOpenRoleMenu(null);
                            }}
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            View role
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRoleDesignationDrafts((current) => ({ ...current, [item.role]: getDefaultRoleDesignation(item.level) }));
                              setOpenRoleMenu(null);
                            }}
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            Reset designation
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              saveRoleDesignations();
                              setOpenRoleMenu(null);
                            }}
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-xs font-medium text-blue-700 hover:bg-blue-50"
                          >
                            Save all changes
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {orgWorkspaceTab === "stakeholders" && selectedStakeholder && (
        <div className="flex h-[calc(100vh-140px)] min-h-[620px] overflow-hidden bg-[#fbfbfb]">
          {/* Left Sidebar */}
          <div className="w-[300px] shrink-0 flex flex-col border-r border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Stakeholders</p>
              <button
                type="button"
                onClick={() => setCreateStakeholderOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {stakeholders.map((stakeholder) => (
                <div
                  key={stakeholder.id}
                  className={`group relative flex cursor-pointer items-center justify-between rounded-xl p-3 transition-colors ${selectedStakeholder.id === stakeholder.id ? "bg-blue-50/50 ring-1 ring-blue-100" : "hover:bg-slate-50"
                    }`}
                  onClick={() => setSelectedStakeholderId(stakeholder.id)}
                >
                  <div className="min-w-0 pr-8">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-slate-900">{stakeholder.name}</span>
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-widest ${stakeholder.status === "Active" ? "bg-emerald-100/50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                        {stakeholder.status === "Active" ? "Onboarded" : "Invited"}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-500">{stakeholder.role} · {stakeholder.organization}</p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenStakeholderMenuId(openStakeholderMenuId === stakeholder.id ? null : stakeholder.id);
                    }}
                    className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-md transition-colors ${openStakeholderMenuId === stakeholder.id ? "bg-slate-200 text-slate-900" : "text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-100 hover:text-slate-700"
                      }`}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </button>

                  {openStakeholderMenuId === stakeholder.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenStakeholderMenuId(null); }} />
                      <div className="absolute right-0 top-10 z-50 w-48 animate-in fade-in zoom-in-95 rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-900/10">
                        <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={() => { setOpenStakeholderMenuId(null); setScheduleMeetingOpen(true); }}>
                          <Calendar className="h-3.5 w-3.5" /> Schedule meeting
                        </button>
                        <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={() => setOpenStakeholderMenuId(null)}>
                          <FileText className="h-3.5 w-3.5" /> Check agenda
                        </button>
                        <button type="button" className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50" onClick={() => setOpenStakeholderMenuId(null)}>
                          <CheckSquare className="h-3.5 w-3.5" /> Check tasks
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-1 flex-col lg:flex-row min-w-0">
            {/* Task View */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-8 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">{selectedStakeholder.name}</h2>
                  <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><Building2 className="h-4 w-4" /> {selectedStakeholder.organization}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{selectedStakeholder.role}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {selectedStakeholder.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-1">
                    <button type="button" onClick={() => setStakeholderInnerTab("tasks")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${stakeholderInnerTab === "tasks" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>Task Matrix</button>
                    <button type="button" onClick={() => setStakeholderInnerTab("profile")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${stakeholderInnerTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}>Profile & Details</button>
                  </div>
                </div>
              </div>

              {stakeholderInnerTab === "profile" ? (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Personal Details</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between"><span className="text-xs text-slate-500">Contact</span><span className="text-xs font-medium text-slate-900">{selectedStakeholder.contact}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500">Category</span><span className="text-xs font-medium text-slate-900">{selectedStakeholder.category}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500">Influence</span><span className="text-xs font-medium text-slate-900">{selectedStakeholder.influence}</span></div>
                        <div className="flex justify-between"><span className="text-xs text-slate-500">Project</span><span className="text-xs font-medium text-slate-900">{selectedStakeholder.project}</span></div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-900/5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Recent Activity & Meetings</h3>
                      <div className="space-y-4">
                        <div className="relative pl-4 border-l border-slate-200">
                          <div className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-white" />
                          <p className="text-xs font-medium text-slate-900">Coordination Meeting</p>
                          <p className="mt-1 text-[10px] text-slate-500">2 days ago · Reviewed initial design phase.</p>
                        </div>
                        <div className="relative pl-4 border-l border-slate-200">
                          <div className="absolute -left-1 top-1 h-2 w-2 rounded-full bg-slate-300 ring-4 ring-white" />
                          <p className="text-xs font-medium text-slate-900">Added to Stakeholder Register</p>
                          <p className="mt-1 text-[10px] text-slate-500">5 days ago by Admin</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 xl:grid-cols-3">
                  {/* Completed Tasks */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-3 w-3" /></div>
                      <h3 className="text-sm font-semibold text-slate-900">Completed</h3>
                    </div>
                    {renderHierarchy(completedHierarchy, true)}
                  </div>

                  {/* Ongoing Scope */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-100 text-blue-600"><Activity className="h-3 w-3" /></div>
                      <h3 className="text-sm font-semibold text-slate-900">Ongoing Scope</h3>
                    </div>
                    {renderHierarchy(ongoingHierarchy)}
                  </div>

                  {/* Upcoming Things */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-amber-100 text-amber-600"><Calendar className="h-3 w-3" /></div>
                      <h3 className="text-sm font-semibold text-slate-900">Upcoming Things</h3>
                    </div>
                    {renderHierarchy(upcomingHierarchy)}
                  </div>
                </div>
              )}
            </div>

            {/* Agenda Builder & Scheduling Panel */}
            <div className="w-[340px] shrink-0 border-l border-slate-200 bg-white p-5 overflow-y-auto">
              <h3 className="text-sm font-semibold text-slate-900">Today's Agenda Builder</h3>
              <p className="mt-1 text-xs text-slate-500">Select tasks from the scope to add them to your meeting agenda.</p>

              <div className="mt-4 min-h-[160px] rounded-xl border border-slate-200 bg-slate-50 p-3">
                {selectedAgendaTasks.size > 0 ? (
                  <ul className="space-y-2">
                    {Array.from(selectedAgendaTasks).map((task, idx) => (
                      <li key={idx} className="flex gap-2 text-xs font-medium text-slate-700">
                        <span className="text-blue-600">•</span> {task}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center py-8 px-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100/50 mb-3 shadow-sm transition hover:scale-105 duration-300">
                      <CheckSquare className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800 tracking-wide">Your Agenda is Blank</p>
                    <p className="mt-1.5 max-w-[200px] text-[10px] leading-relaxed text-slate-400">
                      Select phases, tasks, or subtasks from the matrix on the left to dynamically compile agenda topics.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                  onClick={() => setScheduleMeetingOpen(true)}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  Schedule
                </button>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-[11px] font-medium text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700"
                >
                  <Video className="h-3.5 w-3.5" />
                  Instant Meet
                </button>
              </div>

              {scheduledMeetingReady && (
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-slate-900">Upcoming Meetings</h3>
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-blue-900">Coordination Sync</p>
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">In 30m</span>
                    </div>
                    <p className="mt-1 text-[11px] text-blue-700">With {selectedStakeholder.name}</p>
                    <button
                      type="button"
                      onClick={() => setMeetingReadyStakeholderId(selectedStakeholder.id)}
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-medium text-blue-700 shadow-sm hover:bg-blue-50"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      Move to Meeting UI
                    </button>
                  </div>
                  {meetingReadyStakeholderId === selectedStakeholder.id && (
                    <p className="mt-3 text-center text-[10px] text-slate-500">Transitioning to Meeting UI...</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={isOnboardingOpen} onOpenChange={setOnboardingOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-gray-100 px-5 py-4">
            <DialogTitle className="text-base font-medium">Onboard employee</DialogTitle>
            <DialogDescription className="text-xs">Add the person to the selected reporting branch.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto p-5">
            <div className="grid gap-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Employee name</label>
                <input value={employeeForm.name} onChange={(event) => setEmployeeForm((current) => ({ ...current, name: event.target.value }))} className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Role / Title</label>
                <ResourceSelect value={employeeForm.title} onChange={(event) => setEmployeeForm((current) => ({ ...current, title: event.target.value }))} containerClassName="w-full" className="text-sm">
                  {roleOptions.map((role) => (
                    <option key={role}>{role}</option>
                  ))}
                </ResourceSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Department</label>
                <input value={employeeForm.department} onChange={(event) => setEmployeeForm((current) => ({ ...current, department: event.target.value }))} className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Site / Location</label>
                <input value={employeeForm.site} onChange={(event) => setEmployeeForm((current) => ({ ...current, site: event.target.value }))} className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Email</label>
                <input value={employeeForm.email} onChange={(event) => setEmployeeForm((current) => ({ ...current, email: event.target.value }))} className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Phone</label>
                <input value={employeeForm.phone} onChange={(event) => setEmployeeForm((current) => ({ ...current, phone: event.target.value }))} className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-gray-900" />
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Employment status</label>
                <ResourceSelect value={employeeForm.employment} onChange={(event) => setEmployeeForm((current) => ({ ...current, employment: event.target.value }))} containerClassName="w-full" className="text-sm">
                  <option>Full-time</option>
                  <option>Contract</option>
                  <option>Consultant</option>
                  <option>Worker</option>
                </ResourceSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Reporting manager</label>
                <ResourceSelect value={employeeForm.managerId} onChange={(event) => setEmployeeForm((current) => ({ ...current, managerId: event.target.value }))} containerClassName="w-full" className="text-sm">
                  {Object.values(people).map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name} - {person.title}
                    </option>
                  ))}
                </ResourceSelect>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3">
            <button type="button" onClick={() => setOnboardingOpen(false)} className="h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-medium text-gray-600 hover:border-gray-300">
              Cancel
            </button>
            <button type="button" onClick={createEmployee} className="h-9 rounded-md bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700">
              Add to org
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateRoleOpen} onOpenChange={setCreateRoleOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-md">
          <DialogHeader className="border-b border-gray-100 px-5 py-4">
            <DialogTitle className="text-base font-medium">Create role</DialogTitle>
            <DialogDescription className="text-xs">Define where this role sits in the organization hierarchy.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 p-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Role name</label>
              <input
                value={newRoleDraft.role}
                onChange={(event) => setNewRoleDraft((current) => ({ ...current, role: event.target.value }))}
                className="h-9 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-gray-900"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Reports under</label>
              <ResourceSelect
                value={newRoleDraft.parent}
                onChange={(event) => setNewRoleDraft((current) => ({ ...current, parent: event.target.value }))}
                containerClassName="w-full"
                className="text-sm"
              >
                {roleOptions.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </ResourceSelect>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase text-gray-400">Hierarchy level</label>
              <ResourceSelect
                value={newRoleDraft.level}
                onChange={(event) => setNewRoleDraft((current) => ({ ...current, level: event.target.value }))}
                containerClassName="w-full"
                className="text-sm"
              >
                <option>Owner</option>
                <option>Administration</option>
                <option>Manager</option>
                <option>Team Lead</option>
                <option>Supervisor</option>
                <option>Employee</option>
                <option>Worker</option>
              </ResourceSelect>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 px-5 py-3">
            <button type="button" onClick={() => setCreateRoleOpen(false)} className="h-9 rounded-md border border-gray-200 bg-white px-4 text-xs font-medium text-gray-600 hover:border-gray-300">
              Cancel
            </button>
            <button type="button" onClick={createRole} className="h-9 rounded-md bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700">
              Create role
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateStakeholderOpen} onOpenChange={setCreateStakeholderOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-sm rounded-3xl border border-slate-100 bg-white shadow-2xl">
          <div className="p-6">
            <DialogTitle className="text-lg font-semibold text-slate-900">Invite Stakeholder</DialogTitle>
            <DialogDescription className="mt-1 text-xs text-slate-500">
              Enter an email to send an invite.
            </DialogDescription>

            <div className="mt-6">
              <div className="relative flex items-center group">
                <div className="absolute left-3 text-slate-400 transition-colors group-focus-within:text-blue-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="colleague@domain.com"
                  value={inviteEmailDraft}
                  onChange={(e) => setInviteEmailDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                  className="h-10 w-full rounded-full border border-slate-200 bg-slate-50/50 pl-9 pr-24 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                <button
                  type="button"
                  onClick={handleSendInvite}
                  disabled={isInviting || !inviteEmailDraft}
                  className="absolute right-1 h-8 rounded-full bg-blue-600 px-4 text-[11px] font-medium text-white transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-600/20 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isInviting ? "Inviting..." : "Invite"}
                </button>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending ({pendingInvites.length})</h4>
              {pendingInvites.length > 0 ? (
                <div className="space-y-1">
                  {pendingInvites.map((invite, idx) => (
                    <div key={`${invite.email}-${idx}`} className="group flex cursor-pointer items-center justify-between rounded-xl p-2 transition-colors hover:bg-slate-50">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-orange-500 transition-transform group-hover:scale-110">
                          <Clock3 className="h-3 w-3" />
                        </div>
                        <div>
                          <p className="text-xs font-medium text-slate-700 transition-colors group-hover:text-slate-900">{invite.email}</p>
                          <p className="text-[10px] text-slate-400">{invite.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                        <button type="button" onClick={() => showToast(`Invite resent to ${invite.email}`)} className="p-1.5 transition-all hover:scale-110">
                          <RotateCcw className="h-3.5 w-3.5 text-slate-400 hover:text-blue-600" />
                        </button>
                        <button type="button" onClick={() => handleCancelInvite(invite.email)} className="p-1.5 transition-all hover:scale-110">
                          <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-rose-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">No pending invitations.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleMeetingOpen} onOpenChange={setScheduleMeetingOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-[700px] rounded-3xl border border-slate-100 bg-white shadow-2xl">
          <div className="flex h-[450px]">
            {/* Left side: Calendar / Date picker mock */}
            <div className="w-1/2 bg-slate-50 border-r border-slate-100 p-6 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Select Date & Time</h3>
              <div className="rounded-2xl bg-white p-4 shadow-sm border border-slate-100 flex-1">
                <div className="flex items-center justify-between mb-5">
                  <button className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">&lt;</button>
                  <span className="text-xs font-semibold text-slate-700">October 2026</span>
                  <button className="h-6 w-6 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 mb-3">
                  <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: 31 }).map((_, i) => (
                    <button key={i} className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-colors ${i === 14 ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20' : 'text-slate-700 font-medium hover:bg-slate-100'}`}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 shrink-0">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Time Window</label>
                <div className="flex gap-2">
                  <input type="time" defaultValue="10:00" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <input type="time" defaultValue="11:00" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
              </div>
            </div>

            {/* Right side: Meeting Details */}
            <div className="w-1/2 p-6 flex flex-col bg-white">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Meeting Details</h3>
              <div className="flex-1 space-y-5 overflow-y-auto pr-1">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Meeting Title</label>
                  <input type="text" placeholder="Project Sync..." defaultValue={`${selectedStakeholder.name} Coordination Sync`} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-medium outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Add Participants</label>
                  <div className="relative">
                    <input type="text" placeholder="Search team members by name or email..." className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2.5 text-xs font-medium outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 pl-2.5 pr-1.5 py-1 text-[10px] font-semibold text-blue-700">
                      {selectedStakeholder.name}
                      <button className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-100 hover:text-blue-900 transition-colors">×</button>
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 pl-2.5 pr-1.5 py-1 text-[10px] font-semibold text-slate-600">
                      Samuel Rodriguez (You)
                      <button className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-slate-200 hover:text-slate-900 transition-colors">×</button>
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">Agenda Context</label>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-[11px] font-medium text-slate-600">{selectedAgendaTasks.size} tasks selected for discussion.</p>
                    {selectedAgendaTasks.size > 0 && (
                      <p className="mt-1 text-[10px] text-slate-400 truncate">Including: {Array.from(selectedAgendaTasks)[0]}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-auto flex gap-3 pt-4">
                <button type="button" onClick={() => setScheduleMeetingOpen(false)} className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-200">Cancel</button>
                <button type="button" onClick={() => { setScheduleMeetingOpen(false); setScheduledMeetingReady(true); showToast("Meeting scheduled successfully"); }} className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-95">Schedule Meeting</button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {globalToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-3 rounded-full bg-slate-900/95 px-4 py-2.5 text-xs font-medium text-white shadow-xl shadow-slate-900/20 backdrop-blur">
            <BadgeCheck className="h-4 w-4 text-emerald-400" />
            {globalToast}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkforceSection({ addEmployeeSignal = 0 }: { addEmployeeSignal?: number }) {
  const [employees, setEmployees] = useState<OrgEmployee[]>(defaultEmployeeRoster);
  const [outsourcedEmployees, setOutsourcedEmployees] = useState<OrgEmployee[]>(defaultOutsourcedRoster);
  const [workforceSource, setWorkforceSource] = useState<"in-house" | "outsourced">("in-house");
  const [empSearch, setEmpSearch] = useState("");
  const [empDeptFilter, setEmpDeptFilter] = useState("All");
  const [empRoleFilter, setEmpRoleFilter] = useState("All");
  const [empSiteFilter, setEmpSiteFilter] = useState("All");
  const [empStatusFilter, setEmpStatusFilter] = useState("All");
  const [empTypeFilter, setEmpTypeFilter] = useState("All");
  const [empYearFilter, setEmpYearFilter] = useState("All");
  const [empMonthFilter, setEmpMonthFilter] = useState("All");
  const [empVendorFilter, setEmpVendorFilter] = useState("All");
  const [empResourceFilter, setEmpResourceFilter] = useState("All");
  const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
  const [isColumnPanelOpen, setColumnPanelOpen] = useState(false);
  const [openEmployeeMenuId, setOpenEmployeeMenuId] = useState<string | null>(null);
  const [visibleEmployeeColumns, setVisibleEmployeeColumns] = useState<EmployeeColumnKey[]>(employeeColumnOptions.map((column) => column.key));
  const [employeeSort, setEmployeeSort] = useState<{ column: EmployeeColumnKey; direction: "asc" | "desc" }>({ column: "name", direction: "asc" });
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set([defaultEmployeeRoster[0].id]));
  const activeEmployees = workforceSource === "in-house" ? employees : outsourcedEmployees;
  const selectedEmployee = activeEmployees.find((e) => selectedEmployees.has(e.id)) ?? null;
  const [workforceView, setWorkforceView] = useState<"list" | "detail">("list");
  const [employeeDetailTab, setEmployeeDetailTab] = useState<EmployeeDetailTab>("personal");
  const [isEmployeeDetailEditing, setEmployeeDetailEditing] = useState(false);
  const [employeeDetailDraft, setEmployeeDetailDraft] = useState<Omit<OrgEmployee, "id">>(getEmployeeDraftFromRecord(defaultEmployeeRoster[0]));
  const [isAddEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [employeeDraft, setEmployeeDraft] = useState<Omit<OrgEmployee, "id">>({
    name: "",
    role: "Site Engineer",
    department: "Civil Execution",
    site: "Downtown Tower",
    email: "",
    phone: "+91 ",
    employment: "Full-time",
    status: "Active",
    joinDate: "2026-05-16",
    manager: "Ravi Kumar",
  });
  const filteredEmployees = activeEmployees.filter(
    (employee) =>
      (empDeptFilter === "All" || employee.department === empDeptFilter) &&
      (empRoleFilter === "All" || employee.role === empRoleFilter) &&
      (empSiteFilter === "All" || employee.site === empSiteFilter) &&
      (empStatusFilter === "All" || employee.status === empStatusFilter) &&
      (empTypeFilter === "All" || employee.employment === empTypeFilter) &&
      (empYearFilter === "All" || employee.joinDate.slice(0, 4) === empYearFilter) &&
      (empMonthFilter === "All" || employee.joinDate.slice(5, 7) === empMonthFilter) &&
      (workforceSource === "in-house" || empVendorFilter === "All" || employee.vendor === empVendorFilter) &&
      (workforceSource === "in-house" || empResourceFilter === "All" || employee.resourceCategory === empResourceFilter) &&
      (empSearch === "" ||
        employee.name.toLowerCase().includes(empSearch.toLowerCase()) ||
        employee.role.toLowerCase().includes(empSearch.toLowerCase()) ||
        employee.department.toLowerCase().includes(empSearch.toLowerCase()) ||
        employee.site.toLowerCase().includes(empSearch.toLowerCase()) ||
        (employee.vendor ?? "").toLowerCase().includes(empSearch.toLowerCase()) ||
        (employee.resourceCategory ?? "").toLowerCase().includes(empSearch.toLowerCase())),
  );
  const employeeDepartments = [...new Set(activeEmployees.map((employee) => employee.department))];
  const employeeRoles = [...new Set(activeEmployees.map((employee) => employee.role))];
  const employeeSites = [...new Set(activeEmployees.map((employee) => employee.site))];
  const employeeTypes = [...new Set(activeEmployees.map((employee) => employee.employment))];
  const outsourcedVendors = [...new Set(outsourcedEmployees.map((employee) => employee.vendor).filter(Boolean) as string[])];
  const outsourcedResourceCategories = [...new Set(outsourcedEmployees.map((employee) => employee.resourceCategory).filter(Boolean) as string[])];
  const onboardingYears = [...new Set(activeEmployees.map((employee) => employee.joinDate.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  const onboardingMonths = [...new Set(activeEmployees.map((employee) => employee.joinDate.slice(5, 7)))].sort();
  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const activeFilterCount = [
    empDeptFilter,
    empRoleFilter,
    empSiteFilter,
    empStatusFilter,
    empTypeFilter,
    empYearFilter,
    empMonthFilter,
    ...(workforceSource === "outsourced" ? [empVendorFilter, empResourceFilter] : []),
  ].filter((filter) => filter !== "All").length;
  const hasFilters = empSearch !== "" || activeFilterCount > 0;
  const activeWorkforceLabel = workforceSource === "in-house" ? "employees" : "resources";
  const visibleColumns = employeeColumnOptions.filter((column) => visibleEmployeeColumns.includes(column.key));
  const employeeGridTemplate = `36px ${visibleColumns.map((column) => column.width).join(" ")} 72px`;
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const left = String(a[employeeSort.column] ?? "");
    const right = String(b[employeeSort.column] ?? "");
    const result = left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
    return employeeSort.direction === "asc" ? result : -result;
  });
  const getEmployeeStatusTone = (status: OrgEmployee["status"]) =>
    status === "Active"
      ? "bg-emerald-50 text-emerald-700"
      : status === "On Leave"
        ? "bg-amber-50 text-amber-700"
        : status === "Mobilizing"
          ? "bg-sky-50 text-sky-700"
          : "bg-slate-100 text-slate-500";
  const updateActiveEmployees = (updater: (current: OrgEmployee[]) => OrgEmployee[]) => {
    if (workforceSource === "in-house") {
      setEmployees(updater);
      return;
    }
    setOutsourcedEmployees(updater);
  };
  const updateEmployeeStatus = (id: string, status: OrgEmployee["status"]) => {
    updateActiveEmployees((current) => current.map((employee) => (employee.id === id ? { ...employee, status } : employee)));
    setOpenEmployeeMenuId(null);
  };
  const toggleSelection = (id: string) => {
    setSelectedEmployees((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const clearSelection = () => setSelectedEmployees(new Set());
  const isAllSelected = sortedEmployees.length > 0 && sortedEmployees.every((e) => selectedEmployees.has(e.id));
  const isIndeterminate = !isAllSelected && sortedEmployees.some((e) => selectedEmployees.has(e.id));
  const openAddEmployee = () => {
    setEditingEmployeeId(null);
    setEmployeeDraft({
      name: "",
      role: workforceSource === "outsourced" ? "Vendor Resource" : "Site Engineer",
      department: workforceSource === "outsourced" ? "Civil labor" : "Civil Execution",
      site: workforceSource === "outsourced" ? "Downtown Tower - Tower A" : "Downtown Tower",
      email: "",
      phone: "+91 ",
      employment: workforceSource === "outsourced" ? "Outsourced" : "Full-time",
      status: "Active",
      joinDate: "2026-05-16",
      manager: workforceSource === "outsourced" ? "Harish Patel" : "Ravi Kumar",
      vendor: workforceSource === "outsourced" ? (empVendorFilter === "All" ? "Urban Workforce Co." : empVendorFilter) : undefined,
      resourceCategory: workforceSource === "outsourced" ? (empResourceFilter === "All" ? "Formwork crew" : empResourceFilter) : undefined,
      contractRef: workforceSource === "outsourced" ? "VND-DT-2026-NEW" : undefined,
      vendorContact: workforceSource === "outsourced" ? "Vendor coordinator · +91 99000 00000" : undefined,
    });
    setAddEmployeeOpen(true);
  };
  const openEditEmployee = (employee: OrgEmployee) => {
    setEditingEmployeeId(employee.id);
    setEmployeeDraft({
      name: employee.name,
      role: employee.role,
      department: employee.department,
      site: employee.site,
      email: employee.email,
      phone: employee.phone,
      employment: employee.employment,
      status: employee.status,
      joinDate: employee.joinDate,
      manager: employee.manager,
      vendor: employee.vendor,
      resourceCategory: employee.resourceCategory,
      contractRef: employee.contractRef,
      vendorContact: employee.vendorContact,
    });
    setSelectedEmployees(new Set([employee.id]));
    setOpenEmployeeMenuId(null);
    setAddEmployeeOpen(true);
  };
  const saveWorkforceEmployee = () => {
    const name = employeeDraft.name.trim() || "New Employee";
    if (editingEmployeeId) {
      const updatedEmployee: OrgEmployee = {
        ...employeeDraft,
        id: editingEmployeeId,
        name,
        email: employeeDraft.email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@hubbuild.com`,
        phone: employeeDraft.phone.trim() || "+91 98765 00000",
      };
      updateActiveEmployees((current) => current.map((employee) => (employee.id === editingEmployeeId ? updatedEmployee : employee)));
      setSelectedEmployees(new Set([updatedEmployee.id]));
      setAddEmployeeOpen(false);
      setEditingEmployeeId(null);
      return;
    }

    const nextEmployee: OrgEmployee = {
      ...employeeDraft,
      id: `${workforceSource === "outsourced" ? "osr" : "emp"}-${Date.now()}`,
      name,
      email: employeeDraft.email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@hubbuild.com`,
      phone: employeeDraft.phone.trim() || "+91 98765 00000",
    };
    updateActiveEmployees((current) => [nextEmployee, ...current]);
    setSelectedEmployees(new Set([nextEmployee.id]));
    setAddEmployeeOpen(false);
    setWorkforceView("detail");
  };
  const removeEmployee = (employeeId: string) => {
    updateActiveEmployees((current) => current.filter((employee) => employee.id !== employeeId));
    setSelectedEmployees((prev) => { const next = new Set(prev); next.delete(employeeId); return next; });
    setOpenEmployeeMenuId(null);
  };
  const viewEmployeeDetails = (employee: OrgEmployee) => {
    setSelectedEmployees(new Set([employee.id]));
    setOpenEmployeeMenuId(null);
    setEmployeeDetailTab("personal");
    setEmployeeDetailEditing(false);
    setWorkforceView("detail");
  };
  const setEmployeeDetailField = <K extends keyof Omit<OrgEmployee, "id">>(field: K, value: Omit<OrgEmployee, "id">[K]) => {
    setEmployeeDetailDraft((current) => ({ ...current, [field]: value }));
  };
  const cancelEmployeeDetailEdit = () => {
    if (selectedEmployee) {
      setEmployeeDetailDraft(getEmployeeDraftFromRecord(selectedEmployee));
    }
    setEmployeeDetailEditing(false);
  };
  const saveEmployeeDetailChanges = () => {
    if (!selectedEmployee) return;
    const name = employeeDetailDraft.name.trim() || selectedEmployee.name;
    const updatedEmployee: OrgEmployee = {
      ...employeeDetailDraft,
      id: selectedEmployee.id,
      name,
      email: employeeDetailDraft.email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@hubbuild.com`,
      phone: employeeDetailDraft.phone.trim() || "+91 98765 00000",
    };

    updateActiveEmployees((current) => current.map((employee) => (employee.id === selectedEmployee.id ? updatedEmployee : employee)));
    setSelectedEmployees(new Set([updatedEmployee.id]));
    setEmployeeDetailEditing(false);
  };
  useEffect(() => {
    if (!selectedEmployee || isEmployeeDetailEditing) return;
    setEmployeeDetailDraft(getEmployeeDraftFromRecord(selectedEmployee));
  }, [selectedEmployee, isEmployeeDetailEditing]);
  useEffect(() => {
    if (addEmployeeSignal > 0) {
      openAddEmployee();
    }
  }, [addEmployeeSignal]);
  const resetFilters = () => {
    setEmpSearch("");
    setEmpDeptFilter("All");
    setEmpRoleFilter("All");
    setEmpSiteFilter("All");
    setEmpStatusFilter("All");
    setEmpTypeFilter("All");
    setEmpYearFilter("All");
    setEmpMonthFilter("All");
    setEmpVendorFilter("All");
    setEmpResourceFilter("All");
  };
  const switchWorkforceSource = (source: "in-house" | "outsourced") => {
    if (source === workforceSource) return;
    const nextRoster = source === "in-house" ? employees : outsourcedEmployees;
    setWorkforceSource(source);
    setSelectedEmployees(new Set(nextRoster[0] ? [nextRoster[0].id] : []));
    setOpenEmployeeMenuId(null);
    setWorkforceView("list");
    setEmployeeDetailEditing(false);
    setEmpSearch("");
    setEmpDeptFilter("All");
    setEmpRoleFilter("All");
    setEmpSiteFilter("All");
    setEmpStatusFilter("All");
    setEmpTypeFilter("All");
    setEmpYearFilter("All");
    setEmpMonthFilter("All");
    setEmpVendorFilter("All");
    setEmpResourceFilter("All");
  };
  const toggleEmployeeColumn = (columnKey: EmployeeColumnKey) => {
    setVisibleEmployeeColumns((current) => {
      if (current.includes(columnKey)) {
        return current.length === 1 ? current : current.filter((key) => key !== columnKey);
      }

      return employeeColumnOptions
        .filter((column) => current.includes(column.key) || column.key === columnKey)
        .map((column) => column.key);
    });
  };
  const toggleEmployeeSort = (columnKey: EmployeeColumnKey) => {
    setEmployeeSort((current) => ({
      column: columnKey,
      direction: current.column === columnKey && current.direction === "asc" ? "desc" : "asc",
    }));
  };
  const renderEmployeeCell = (employee: OrgEmployee, columnKey: EmployeeColumnKey) => {
    if (columnKey === "name") {
      return (
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white bg-gradient-to-br from-sky-100 via-emerald-50 to-amber-100 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
            {employee.name.split(" ").map((part) => part[0]).join("").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-950">{employee.name}</p>
            <p className="truncate text-[11px] text-slate-500">
              {workforceSource === "outsourced" ? `${employee.vendor ?? "Vendor"} · ${employee.resourceCategory ?? "Resource"}` : employee.email}
            </p>
          </div>
        </div>
      );
    }

    if (columnKey === "email") {
      return <span className="flex min-w-0 items-center gap-1 self-center text-slate-500"><Mail className="h-3 w-3 shrink-0" /><span className="truncate">{employee.email}</span></span>;
    }

    if (columnKey === "phone") {
      return <span className="flex items-center gap-1 self-center text-slate-500"><Phone className="h-3 w-3 shrink-0" />{employee.phone}</span>;
    }

    if (columnKey === "employment") {
      return <span className="self-center"><StatusBadge label={employee.employment} tone={employee.employment === "Full-time" ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"} /></span>;
    }

    if (columnKey === "joinDate") {
      return <span className="self-center text-slate-500">{employee.joinDate.slice(0, 7)}</span>;
    }

    if (columnKey === "status") {
      return <span className="self-center"><StatusBadge label={employee.status} tone={getEmployeeStatusTone(employee.status)} /></span>;
    }

    return <span className="truncate self-center text-slate-600">{employee[columnKey]}</span>;
  };

  if (workforceView === "detail" && selectedEmployee) {
    const detailEmployee: OrgEmployee = isEmployeeDetailEditing ? { ...selectedEmployee, ...employeeDetailDraft } : selectedEmployee;
    const detailInitials = detailEmployee.name.split(" ").map((part) => part[0]).join("").toUpperCase();
    const isOutsourcedDetail = workforceSource === "outsourced";
    const employeeCode = selectedEmployee.id.replace("emp-", "EMP-").replace("osr-", "OSR-").toUpperCase();
    const roleOptionsForDetail = [...new Set(["Portfolio Director", "Project Manager", "Construction Manager", "Site Engineer", "Foreman", ...employeeRoles])];
    const departmentOptionsForDetail = [...new Set([...defaultDepartments.map((department) => department.name), ...employeeDepartments])];
    const siteOptionsForDetail = [...new Set([detailEmployee.site, ...employeeSites, "HQ + Shared Services", "Downtown Tower - Tower A"])];
    const managerOptionsForDetail = [...new Set([detailEmployee.manager, ...activeEmployees.filter((employee) => employee.id !== selectedEmployee.id).map((employee) => employee.name)])];
    const profileFacts = {
      placeOfBirth: detailEmployee.site.includes("HQ") ? "Bengaluru" : detailEmployee.site.includes("Tech") ? "Pune" : "Mumbai",
      birthdate: "30 Oct 1994",
      bloodType: detailEmployee.department.includes("Safety") ? "B+" : "O+",
      maritalStatus: "Married",
      religion: "Not specified",
      citizenAddress: `${detailEmployee.site}, Sector 18, Mumbai, Maharashtra 400076`,
      residentialAddress: `${detailEmployee.site}, Site Residential Block, Maharashtra 400076`,
      emergencyName: "Olivia Bennett",
      relationship: "Spouse",
      emergencyPhone: "+91 99887 45120",
    };
    const editableTextClass = "h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-950/5";
    const readOnlyTextClass = "min-h-9 rounded-lg border border-transparent px-0 py-2 text-sm font-medium text-slate-950";
    const renderTextField = (label: string, field: keyof Omit<OrgEmployee, "id">, type: "text" | "email" | "tel" | "date" = "text") => (
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</label>
        {isEmployeeDetailEditing ? (
          <input
            type={type}
            value={String(employeeDetailDraft[field])}
            onChange={(event) => setEmployeeDetailDraft((current) => ({ ...current, [field]: event.target.value } as Omit<OrgEmployee, "id">))}
            className={editableTextClass}
          />
        ) : (
          <p className={readOnlyTextClass}>{String(detailEmployee[field])}</p>
        )}
      </div>
    );
    const renderSelectField = (label: string, field: keyof Omit<OrgEmployee, "id">, options: string[]) => (
      <div>
        <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</label>
        {isEmployeeDetailEditing ? (
          <ResourceSelect
            value={String(employeeDetailDraft[field])}
            onChange={(event) => setEmployeeDetailDraft((current) => ({ ...current, [field]: event.target.value } as Omit<OrgEmployee, "id">))}
            containerClassName="w-full"
            className="h-9 text-sm"
          >
            {options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </ResourceSelect>
        ) : (
          <p className={readOnlyTextClass}>{String(detailEmployee[field])}</p>
        )}
      </div>
    );
    const detailPanelClass = "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-950/[0.03]";

    return (
      <div className="rounded-[30px] border border-slate-200 bg-white shadow-xl shadow-slate-950/8">
        <div className="overflow-hidden rounded-[30px]">
          <main className="min-w-0 bg-slate-50">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setWorkforceView("list")} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-950">
                    <ArrowUpRight className="h-3.5 w-3.5 rotate-180" />
                  </button>
                  <div>
                    <h3 className="text-base font-semibold text-slate-950">{isOutsourcedDetail ? "Outsourced resource" : "Employee"}</h3>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Workforce / {isOutsourcedDetail ? "Outsourced Resource Detail" : "Employee Detail"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {isEmployeeDetailEditing ? (
                  <>
                    <button type="button" onClick={cancelEmployeeDetailEdit} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:border-slate-300">
                      Cancel
                    </button>
                    <button type="button" onClick={saveEmployeeDetailChanges} className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700">
                      Save changes
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setEmployeeDetailEditing(true)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:border-slate-300 hover:text-slate-950">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit mode
                  </button>
                )}
                <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 text-[11px] font-semibold text-slate-700">
                    {detailInitials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-950">{detailEmployee.name}</p>
                    <p className="text-[10px] text-slate-500">{detailEmployee.role}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </header>

            <div className="border-b border-slate-100 bg-white px-5 py-3">
              <ResourceTabStrip tabs={employeeDetailTabs} activeKey={employeeDetailTab} onChange={setEmployeeDetailTab} />
            </div>

            <div className="max-h-[calc(100vh-225px)] overflow-y-auto p-5">
              {employeeDetailTab === "personal" && (
                <div className="space-y-4">
                  <div className={detailPanelClass}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-base font-semibold text-slate-950">Basic information</h4>
                        <p className="mt-1 text-xs text-slate-500">Identity, contact and personal profile</p>
                      </div>
                      <button type="button" onClick={() => setEmployeeDetailEditing(true)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-950">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                      <div className="flex gap-5">
                        <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 via-sky-100 to-emerald-100 text-2xl font-semibold text-slate-700 ring-8 ring-slate-50">
                          {detailInitials}
                        </div>
                        <div className="grid flex-1 gap-3 sm:grid-cols-2">
                          {renderTextField("Full name", "name")}
                          <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Employee ID</label>
                            <p className={readOnlyTextClass}>{employeeCode}</p>
                          </div>
                          {renderTextField("Email", "email", "email")}
                          {renderTextField("Phone", "phone", "tel")}
                          <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Gender</label>
                            <p className={readOnlyTextClass}>Male</p>
                          </div>
                          {renderTextField("Role", "role")}
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          ["Place of birth", profileFacts.placeOfBirth],
                          ["Birthdate", profileFacts.birthdate],
                          ["Blood type", profileFacts.bloodType],
                          ["Marital Status", profileFacts.maritalStatus],
                          ["Religion", profileFacts.religion],
                          ["Employment", detailEmployee.employment],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
                            <p className="mt-2 text-sm font-medium text-slate-950">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className={detailPanelClass}>
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-base font-semibold text-slate-950">Address</h4>
                        <Pencil className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="space-y-4 text-sm">
                        <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                          <span className="font-semibold text-slate-950">Citizen ID address</span>
                          <span className="leading-5 text-slate-600">{profileFacts.citizenAddress}</span>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
                          <span className="font-semibold text-slate-950">Residential address</span>
                          <span className="leading-5 text-slate-600">{profileFacts.residentialAddress}</span>
                        </div>
                      </div>
                    </div>
                    <div className={detailPanelClass}>
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-base font-semibold text-slate-950">Emergency contact</h4>
                        <Pencil className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="grid gap-3 text-sm sm:grid-cols-[140px_1fr]">
                        <span className="font-semibold text-slate-950">Name</span><span className="text-slate-600">{profileFacts.emergencyName}</span>
                        <span className="font-semibold text-slate-950">Relationship</span><span className="text-slate-600">{profileFacts.relationship}</span>
                        <span className="font-semibold text-slate-950">Phone number</span><span className="text-slate-600">{profileFacts.emergencyPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-2">
                    <div className={detailPanelClass}>
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-base font-semibold text-slate-950">Education</h4>
                        <Pencil className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="space-y-4 border-l border-slate-200 pl-4">
                        {[
                          ["Master Degree - Construction Management", "NICMAR University", "GPA (3.8)", "2016 - 2018"],
                          ["Bachelor Degree - Civil Engineering", "Bina Nusantara", "GPA (3.7)", "2012 - 2016"],
                        ].map(([title, institute, score, year]) => (
                          <div key={title} className="relative">
                            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                            <p className="text-sm font-semibold text-slate-950">{title}</p>
                            <p className="mt-1 text-xs text-slate-600">{institute}</p>
                            <p className="mt-1 text-xs text-slate-500">{score}</p>
                            <p className="mt-1 text-xs text-slate-400">{year}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={detailPanelClass}>
                      <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-base font-semibold text-slate-950">Family</h4>
                        <Pencil className="h-4 w-4 text-slate-400" />
                      </div>
                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        <div className="grid grid-cols-2 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-500">
                          <span>Family type</span>
                          <span>Person name</span>
                        </div>
                        {[
                          ["Father", "Benjamin Williams"],
                          ["Mother", "Evelyn Potts"],
                          ["Siblings", "James Williams, Emily Williams"],
                          ["Spouse", profileFacts.emergencyName],
                        ].map(([type, name]) => (
                          <div key={type} className="grid grid-cols-2 border-t border-slate-100 px-3 py-3 text-xs">
                            <span className="text-slate-600">{type}</span>
                            <span className="font-medium text-slate-950">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {employeeDetailTab === "employee" && (
                <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className={detailPanelClass}>
                    <h4 className="text-base font-semibold text-slate-950">Work assignment</h4>
                    <p className="mt-1 text-xs text-slate-500">Role, reporting and deployment details</p>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      {renderSelectField("Role / Title", "role", roleOptionsForDetail)}
                      {renderSelectField("Department", "department", departmentOptionsForDetail)}
                      {renderSelectField("Site / Location", "site", siteOptionsForDetail)}
                      {renderSelectField("Reporting manager", "manager", managerOptionsForDetail)}
                      {renderSelectField("Employment status", "employment", ["Full-time", "Contract", "Consultant", "Worker"])}
                      {renderSelectField("Workforce status", "status", ["Active", "On Leave", "Mobilizing", "Offboarded"])}
                      {renderTextField("Join date", "joinDate", "date")}
                      {renderTextField("Work email", "email", "email")}
                      {isOutsourcedDetail && (
                        <>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Vendor</label>
                            {isEmployeeDetailEditing ? (
                              <ResourceSelect value={employeeDetailDraft.vendor ?? ""} onChange={(event) => setEmployeeDetailDraft((current) => ({ ...current, vendor: event.target.value }))} containerClassName="w-full" className="h-9 text-sm">
                                {outsourcedVendors.map((vendor) => <option key={vendor}>{vendor}</option>)}
                              </ResourceSelect>
                            ) : (
                              <p className={readOnlyTextClass}>{detailEmployee.vendor ?? "Not linked"}</p>
                            )}
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Resource category</label>
                            {isEmployeeDetailEditing ? (
                              <ResourceSelect value={employeeDetailDraft.resourceCategory ?? ""} onChange={(event) => setEmployeeDetailDraft((current) => ({ ...current, resourceCategory: event.target.value }))} containerClassName="w-full" className="h-9 text-sm">
                                {outsourcedResourceCategories.map((category) => <option key={category}>{category}</option>)}
                              </ResourceSelect>
                            ) : (
                              <p className={readOnlyTextClass}>{detailEmployee.resourceCategory ?? "General resource"}</p>
                            )}
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Contract ref</label>
                            {isEmployeeDetailEditing ? (
                              <input value={employeeDetailDraft.contractRef ?? ""} onChange={(event) => setEmployeeDetailDraft((current) => ({ ...current, contractRef: event.target.value }))} className={editableTextClass} />
                            ) : (
                              <p className={readOnlyTextClass}>{detailEmployee.contractRef ?? "Pending"}</p>
                            )}
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Vendor contact</label>
                            {isEmployeeDetailEditing ? (
                              <input value={employeeDetailDraft.vendorContact ?? ""} onChange={(event) => setEmployeeDetailDraft((current) => ({ ...current, vendorContact: event.target.value }))} className={editableTextClass} />
                            ) : (
                              <p className={readOnlyTextClass}>{detailEmployee.vendorContact ?? "Not assigned"}</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className={detailPanelClass}>
                      <h4 className="text-base font-semibold text-slate-950">Reporting chain</h4>
                      <div className="mt-4 space-y-3">
                        {["Portfolio Director", detailEmployee.manager, detailEmployee.name].map((name, index) => (
                          <div key={`${name}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-slate-700 shadow-sm">
                              {name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-950">{name}</p>
                              <p className="text-[10px] text-slate-500">{index === 0 ? "Owner layer" : index === 1 ? "Manager layer" : "Employee layer"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={detailPanelClass}>
                      <h4 className="text-base font-semibold text-slate-950">Access summary</h4>
                      <div className="mt-4 grid gap-2">
                        {["Workforce view", "Attendance check-in", "Document upload", "Site access card"].map((item) => (
                          <div key={item} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs">
                            <span className="text-slate-600">{item}</span>
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {employeeDetailTab === "payroll" && (
                <div className="grid gap-4 xl:grid-cols-3">
                  {[
                    ["Monthly CTC", "₹1.42L", "Current fixed payout"],
                    ["Payroll cycle", "25th - 30th", "Monthly processing window"],
                    ["Bank status", "Verified", "Salary account active"],
                  ].map(([label, value, caption]) => (
                    <div key={label} className={detailPanelClass}>
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
                      <p className="mt-1 text-xs text-slate-500">{caption}</p>
                    </div>
                  ))}
                  <div className={`${detailPanelClass} xl:col-span-3`}>
                    <h4 className="text-base font-semibold text-slate-950">Payroll details</h4>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        ["Payment mode", "Bank transfer"],
                        ["PF/UAN", "100284749322"],
                        ["ESIC", "Eligible"],
                        ["Tax regime", "New regime"],
                        ["Basic wage", "₹72,000"],
                        ["Allowances", "₹38,500"],
                        ["Retention", "0%"],
                        ["Last payout", "30 Apr 2026"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
                          <p className="mt-2 text-sm font-medium text-slate-950">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {employeeDetailTab === "documents" && (
                <div className={detailPanelClass}>
                  <h4 className="text-base font-semibold text-slate-950">Documents</h4>
                  <p className="mt-1 text-xs text-slate-500">Worker IDs, certificates, insurance and contracts</p>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {[
                      ["Worker ID", "Verified", "Valid until 31 Mar 2027"],
                      ["Safety induction", "Complete", "Renewal due in 42 days"],
                      ["Insurance record", "Active", "Policy uploaded"],
                      ["Contract document", "Signed", "Digital copy available"],
                      ["Trade certificate", "Verified", `${detailEmployee.department} qualification`],
                      ["Medical fitness", "Active", "Annual check complete"],
                    ].map(([title, status, note]) => (
                      <div key={title} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                            <FileBadge2 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{title}</p>
                            <p className="mt-1 text-xs text-slate-500">{note}</p>
                          </div>
                        </div>
                        <StatusBadge label={status} tone={status === "Complete" || status === "Verified" || status === "Active" || status === "Signed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {employeeDetailTab === "payroll-history" && (
                <div className={detailPanelClass}>
                  <h4 className="text-base font-semibold text-slate-950">Payroll history</h4>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                    <div className="grid grid-cols-5 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                      <span>Cycle</span><span>Gross</span><span>Deductions</span><span>Net payout</span><span>Status</span>
                    </div>
                    {[
                      ["Apr 2026", "₹1,42,000", "₹12,400", "₹1,29,600", "Paid"],
                      ["Mar 2026", "₹1,42,000", "₹11,980", "₹1,30,020", "Paid"],
                      ["Feb 2026", "₹1,38,500", "₹10,800", "₹1,27,700", "Paid"],
                      ["Jan 2026", "₹1,38,500", "₹10,800", "₹1,27,700", "Paid"],
                    ].map((row) => (
                      <div key={row[0]} className="grid grid-cols-5 border-t border-slate-100 px-4 py-3 text-sm">
                        {row.slice(0, 4).map((cell) => <span key={cell} className="text-slate-700">{cell}</span>)}
                        <StatusBadge label={row[4]} tone="bg-emerald-50 text-emerald-700" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {employeeDetailTab === "medical" && (
                <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                  <div className={detailPanelClass}>
                    <h4 className="text-base font-semibold text-slate-950">Medical profile</h4>
                    <div className="mt-4 space-y-3">
                      {[
                        ["Blood group", profileFacts.bloodType],
                        ["Last health check", "18 Apr 2026"],
                        ["Fitness status", "Fit for site duty"],
                        ["Medical notes", "No restrictions recorded"],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                          <span className="text-slate-500">{label}</span>
                          <span className="font-medium text-slate-950">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={detailPanelClass}>
                    <h4 className="text-base font-semibold text-slate-950">Medical history</h4>
                    <div className="mt-4 space-y-3">
                      {["Annual fitness certificate uploaded", "Site safety medical clearance", "First-aid training attended"].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 text-sm text-slate-700">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {employeeDetailTab === "leave" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {[
                      ["Annual leave", "14", "days available"],
                      ["Sick leave", "6", "days available"],
                      ["Leave used", "4", "days this year"],
                    ].map(([label, value, caption]) => (
                      <div key={label} className={detailPanelClass}>
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
                        <p className="mt-1 text-xs text-slate-500">{caption}</p>
                      </div>
                    ))}
                  </div>
                  <div className={detailPanelClass}>
                    <h4 className="text-base font-semibold text-slate-950">Leave history</h4>
                    <div className="mt-4 space-y-2">
                      {[
                        ["04 May 2026", "Casual leave", "Approved"],
                        ["16 Apr 2026", "Half day", "Approved"],
                        ["07 Feb 2026", "Sick leave", "Approved"],
                      ].map(([date, type, status]) => (
                        <div key={date} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                          <div>
                            <p className="font-medium text-slate-950">{type}</p>
                            <p className="text-xs text-slate-500">{date}</p>
                          </div>
                          <StatusBadge label={status} tone="bg-emerald-50 text-emerald-700" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {employeeDetailTab === "attendance" && (
                <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
                  <div className={detailPanelClass}>
                    <h4 className="text-base font-semibold text-slate-950">Attendance summary</h4>
                    <div className="mt-4 grid gap-3">
                      {[
                        ["Present this month", "22 days"],
                        ["Late check-ins", "2"],
                        ["Overtime logged", "18.5 hrs"],
                        ["Shift", "Day + Extended"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
                          <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className={detailPanelClass}>
                    <h4 className="text-base font-semibold text-slate-950">Recent attendance</h4>
                    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-4 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                        <span>Date</span><span>Check-in</span><span>Check-out</span><span>Status</span>
                      </div>
                      {[
                        ["16 May 2026", "08:55", "18:40", "Present"],
                        ["15 May 2026", "09:08", "19:15", "Late"],
                        ["14 May 2026", "08:49", "18:25", "Present"],
                        ["13 May 2026", "08:57", "18:10", "Present"],
                      ].map((row) => (
                        <div key={row[0]} className="grid grid-cols-4 border-t border-slate-100 px-4 py-3 text-sm">
                          {row.slice(0, 3).map((cell) => <span key={cell} className="text-slate-700">{cell}</span>)}
                          <StatusBadge label={row[3]} tone={row[3] === "Late" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-5 ${isMaximized ? "fixed inset-0 z-[60] bg-slate-50 p-6 overflow-auto" : ""}`}>
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-950/5">
        <div className="relative rounded-[28px]">
          {/* Single unified header row */}
          <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 bg-white px-5 py-3 rounded-t-[28px]">
            {/* Left: Title + Caption */}
            <div className="min-w-0 shrink-0">
              <h4 className="text-sm font-semibold text-slate-950 leading-none">Workforce database</h4>
              <p className="mt-0.5 text-[11px] text-slate-400 leading-none whitespace-nowrap">Search, filter, select and manage {activeWorkforceLabel}</p>
            </div>

            <div className="h-5 w-px bg-slate-200 shrink-0" />

            <ResourceTabStrip
              className="shrink-0"
              tabs={[
                { key: "in-house", label: "In-house", count: employees.length },
                { key: "outsourced", label: "Outsourced", count: outsourcedEmployees.length },
              ]}
              activeKey={workforceSource}
              onChange={switchWorkforceSource}
            />

            {/* Right: All controls — spacer pushes everything to the right */}
            <div className="flex min-w-[680px] flex-1 items-center gap-2">

              {/* Spacer pushes all controls to the right */}
              <div className="flex-1" />

              {workforceSource === "outsourced" && (
                <>
                  <ResourceSelect value={empVendorFilter} onChange={(event) => setEmpVendorFilter(event.target.value)} containerClassName="w-[190px] shrink-0" className="h-8">
                    <option value="All">All vendors</option>
                    {outsourcedVendors.map((vendor) => (<option key={vendor}>{vendor}</option>))}
                  </ResourceSelect>
                  <ResourceSelect value={empResourceFilter} onChange={(event) => setEmpResourceFilter(event.target.value)} containerClassName="w-[170px] shrink-0" className="h-8">
                    <option value="All">All resources</option>
                    {outsourcedResourceCategories.map((category) => (<option key={category}>{category}</option>))}
                  </ResourceSelect>
                </>
              )}

              {/* Search */}
              <div className="relative shrink-0">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  value={empSearch}
                  onChange={(event) => setEmpSearch(event.target.value)}
                  placeholder={`Search ${activeWorkforceLabel}...`}
                  className="h-8 w-[200px] rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs outline-none focus:border-slate-400 focus:bg-white"
                />
              </div>

              {/* Filters */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setFilterPanelOpen((current) => !current)}
                  className={`inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition ${activeFilterCount > 0
                    ? "border-sky-200 bg-sky-50 text-sky-700 shadow-sm shadow-sky-950/5"
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950"
                    }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-600 px-1.5 text-[10px] text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                {isFilterPanelOpen && (
                  <div className="absolute right-0 top-full z-30 mt-1 w-[360px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/12">
                    <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <p className="text-sm font-medium text-slate-950">Workforce filters</p>
                        <p className="mt-0.5 text-xs text-slate-500">Filter by role, department, onboarding date and status.</p>
                      </div>
                      {activeFilterCount > 0 && (
                        <button type="button" onClick={resetFilters} className="text-xs font-medium text-sky-700 hover:text-sky-900">
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {workforceSource === "outsourced" && (
                        <>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Vendor</label>
                            <ResourceSelect value={empVendorFilter} onChange={(event) => setEmpVendorFilter(event.target.value)} containerClassName="w-full">
                              <option value="All">All vendors</option>
                              {outsourcedVendors.map((vendor) => (<option key={vendor}>{vendor}</option>))}
                            </ResourceSelect>
                          </div>
                          <div>
                            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Resource</label>
                            <ResourceSelect value={empResourceFilter} onChange={(event) => setEmpResourceFilter(event.target.value)} containerClassName="w-full">
                              <option value="All">All resources</option>
                              {outsourcedResourceCategories.map((category) => (<option key={category}>{category}</option>))}
                            </ResourceSelect>
                          </div>
                        </>
                      )}
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Role</label>
                        <ResourceSelect value={empRoleFilter} onChange={(event) => setEmpRoleFilter(event.target.value)} containerClassName="w-full">
                          <option>All</option>
                          {employeeRoles.map((role) => (<option key={role}>{role}</option>))}
                        </ResourceSelect>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Department</label>
                        <ResourceSelect value={empDeptFilter} onChange={(event) => setEmpDeptFilter(event.target.value)} containerClassName="w-full">
                          <option>All</option>
                          {employeeDepartments.map((department) => (<option key={department}>{department}</option>))}
                        </ResourceSelect>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Site</label>
                        <ResourceSelect value={empSiteFilter} onChange={(event) => setEmpSiteFilter(event.target.value)} containerClassName="w-full">
                          <option>All</option>
                          {employeeSites.map((site) => (<option key={site}>{site}</option>))}
                        </ResourceSelect>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Status</label>
                        <ResourceSelect value={empStatusFilter} onChange={(event) => setEmpStatusFilter(event.target.value)} containerClassName="w-full">
                          <option>All</option>
                          <option>Active</option>
                          <option>On Leave</option>
                          <option>Mobilizing</option>
                          <option>Offboarded</option>
                        </ResourceSelect>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Employment</label>
                        <ResourceSelect value={empTypeFilter} onChange={(event) => setEmpTypeFilter(event.target.value)} containerClassName="w-full">
                          <option>All</option>
                          {employeeTypes.map((type) => (<option key={type}>{type}</option>))}
                        </ResourceSelect>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Onboarding year</label>
                        <ResourceSelect value={empYearFilter} onChange={(event) => setEmpYearFilter(event.target.value)} containerClassName="w-full">
                          <option>All</option>
                          {onboardingYears.map((year) => (<option key={year}>{year}</option>))}
                        </ResourceSelect>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Onboarding month</label>
                        <ResourceSelect value={empMonthFilter} onChange={(event) => setEmpMonthFilter(event.target.value)} containerClassName="w-full">
                          <option value="All">All</option>
                          {onboardingMonths.map((month) => (<option key={month} value={month}>{monthLabels[Number(month) - 1]}</option>))}
                        </ResourceSelect>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <p className="text-xs text-slate-500">{filteredEmployees.length} matching {activeWorkforceLabel}</p>
                      <button type="button" onClick={() => setFilterPanelOpen(false)} className="h-7 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">Apply</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Reset */}
              {hasFilters && (
                <button type="button" onClick={resetFilters} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-white">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              )}

              {/* Columns */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setColumnPanelOpen((current) => !current)}
                  className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-white hover:text-slate-950"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Columns
                  <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-200">{visibleEmployeeColumns.length}/{employeeColumnOptions.length}</span>
                  <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${isColumnPanelOpen ? "rotate-180" : ""}`} />
                </button>
                {isColumnPanelOpen && (
                  <div className="absolute right-0 top-full z-30 mt-1 w-[240px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/12">
                    <div className="flex items-center justify-between px-2 py-2">
                      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Visible headers</span>
                      <button type="button" onClick={() => setVisibleEmployeeColumns(employeeColumnOptions.map((column) => column.key))} className="text-[11px] font-medium text-sky-600 hover:text-sky-800">Show all</button>
                    </div>
                    <div className="max-h-[300px] space-y-1 overflow-y-auto">
                      {employeeColumnOptions.map((column) => {
                        const visible = visibleEmployeeColumns.includes(column.key);
                        return (
                          <button key={column.key} type="button" onClick={() => toggleEmployeeColumn(column.key)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition ${visible ? "bg-sky-50 text-sky-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
                          >
                            <span>{column.label}</span>
                            {visible && <CheckCircle2 className="h-3.5 w-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {selectedEmployee && (
                <>
                  <div className="h-4 w-px bg-slate-200 shrink-0" />
                  <button type="button" onClick={() => updateEmployeeStatus(selectedEmployee.id, selectedEmployee.status === "Active" ? "On Leave" : "Active")}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-white">
                    {selectedEmployee.status === "Active" ? "Mark leave" : "Mark active"}
                  </button>
                  {selectedEmployees.size > 1 && (
                    <span className="inline-flex h-8 shrink-0 items-center rounded-lg bg-sky-50 px-2 text-xs font-medium text-sky-700">{selectedEmployees.size} selected</span>
                  )}
                  <button type="button" onClick={clearSelection}
                    className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-500 hover:border-slate-300 hover:bg-white">
                    Clear
                  </button>
                </>
              )}

              <div className="h-4 w-px bg-slate-200 shrink-0" />

              {/* Count */}
              <p className="shrink-0 text-xs text-slate-400 whitespace-nowrap">{filteredEmployees.length} {activeWorkforceLabel}</p>

              {/* Maximize */}
              <button type="button" onClick={() => setIsMaximized((prev) => !prev)}
                className="inline-flex h-8 shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950">
                {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                {isMaximized ? "Minimize" : "Maximize"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div style={{ minWidth: `${Math.max(900, visibleColumns.length * 145 + 108)}px` }}>
              <div
                className="grid gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-[9px] uppercase tracking-[0.12em] text-slate-400"
                style={{ gridTemplateColumns: employeeGridTemplate }}
              >
                <span className="flex items-center">
                  <input
                    type="checkbox"
                    ref={(el) => { if (el) el.indeterminate = isIndeterminate; }}
                    checked={isAllSelected}
                    onChange={(event) =>
                      setSelectedEmployees(event.target.checked ? new Set(sortedEmployees.map((e) => e.id)) : new Set())
                    }
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    aria-label="Select all employees"
                  />
                </span>
                {visibleColumns.map((column) => (
                  <button
                    key={column.key}
                    type="button"
                    onClick={() => toggleEmployeeSort(column.key)}
                    className={`flex items-center justify-between gap-2 text-left transition hover:text-slate-700 ${employeeSort.column === column.key ? "text-slate-700" : "text-slate-400"
                      }`}
                  >
                    <span>{column.label}</span>
                    <ArrowUpDown className={`h-3 w-3 ${employeeSort.column === column.key ? "text-sky-600" : "text-slate-400"}`} />
                  </button>
                ))}
                <span className="text-right">Actions</span>
              </div>
              {sortedEmployees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => toggleSelection(employee.id)}
                  className={`grid w-full cursor-pointer gap-3 border-b border-slate-100 px-4 py-3 text-left text-xs transition last:border-b-0 ${selectedEmployees.has(employee.id) ? "bg-sky-50" : "bg-white hover:bg-slate-50"
                    }`}
                  style={{ gridTemplateColumns: employeeGridTemplate }}
                >
                  <div className="flex items-center self-center">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.has(employee.id)}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => toggleSelection(employee.id)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                      aria-label={`Select ${employee.name}`}
                    />
                  </div>
                  {visibleColumns.map((column) => (
                    <div key={column.key} className="min-w-0 self-center">
                      {renderEmployeeCell(employee, column.key)}
                    </div>
                  ))}
                  <div className="relative flex justify-end self-center">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedEmployees(new Set([employee.id]));
                        setOpenEmployeeMenuId((current) => current === employee.id ? null : employee.id);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 shadow-sm shadow-slate-950/[0.03] transition hover:border-slate-300 hover:text-slate-700"
                      title="Employee actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openEmployeeMenuId === employee.id && (
                      <div
                        onClick={(event) => event.stopPropagation()}
                        className="absolute right-0 top-9 z-30 w-[190px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-950/12"
                      >
                        <button type="button" onClick={() => viewEmployeeDetails(employee)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50">
                          <Eye className="h-3.5 w-3.5 text-slate-400" />
                          View details
                        </button>
                        <button type="button" onClick={() => openEditEmployee(employee)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50">
                          <Pencil className="h-3.5 w-3.5 text-slate-400" />
                          Edit details
                        </button>
                        <button type="button" onClick={() => updateEmployeeStatus(employee.id, employee.status === "Active" ? "On Leave" : "Active")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50">
                          <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                          {employee.status === "Active" ? "Mark on leave" : "Mark active"}
                        </button>
                        <button type="button" onClick={() => updateEmployeeStatus(employee.id, "Mobilizing")} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50">
                          <Activity className="h-3.5 w-3.5 text-slate-400" />
                          Mobilize
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            void navigator.clipboard?.writeText(employee.email);
                            setOpenEmployeeMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          Copy email
                        </button>
                        <div className="my-1 h-px bg-slate-100" />
                        <button type="button" onClick={() => removeEmployee(employee.id)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50">
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove employee
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog
        open={isAddEmployeeOpen}
        onOpenChange={(open) => {
          setAddEmployeeOpen(open);
          if (!open) setEditingEmployeeId(null);
        }}
      >
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-slate-100 px-5 py-4">
            <DialogTitle className="text-base font-medium">
              {editingEmployeeId ? `Edit ${workforceSource === "outsourced" ? "resource" : "employee"}` : `Add ${workforceSource === "outsourced" ? "outsourced resource" : "employee"}`}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingEmployeeId ? "Update details and workforce status." : `Create a ${workforceSource === "outsourced" ? "vendor resource" : "workforce"} record and open its detail page.`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[70vh] gap-3 overflow-auto p-5">
            {[
              ["Employee name", "name"],
              ["Role / Title", "role"],
              ["Department", "department"],
              ["Site", "site"],
              ["Email", "email"],
              ["Phone", "phone"],
              ["Reporting manager", "manager"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">{label}</label>
                <input
                  value={employeeDraft[key as keyof Omit<OrgEmployee, "id">] as string}
                  onChange={(event) => setEmployeeDraft((current) => ({ ...current, [key]: event.target.value }))}
                  className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-900"
                />
              </div>
            ))}
            {workforceSource === "outsourced" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">Vendor</label>
                  <ResourceSelect value={employeeDraft.vendor ?? "Urban Workforce Co."} onChange={(event) => setEmployeeDraft((current) => ({ ...current, vendor: event.target.value }))} containerClassName="w-full" className="text-sm">
                    {outsourcedVendors.map((vendor) => <option key={vendor}>{vendor}</option>)}
                  </ResourceSelect>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">Resource category</label>
                  <ResourceSelect value={employeeDraft.resourceCategory ?? "Formwork crew"} onChange={(event) => setEmployeeDraft((current) => ({ ...current, resourceCategory: event.target.value }))} containerClassName="w-full" className="text-sm">
                    {outsourcedResourceCategories.map((category) => <option key={category}>{category}</option>)}
                  </ResourceSelect>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">Contract ref</label>
                  <input value={employeeDraft.contractRef ?? ""} onChange={(event) => setEmployeeDraft((current) => ({ ...current, contractRef: event.target.value }))} className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-900" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">Vendor contact</label>
                  <input value={employeeDraft.vendorContact ?? ""} onChange={(event) => setEmployeeDraft((current) => ({ ...current, vendorContact: event.target.value }))} className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-900" />
                </div>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">Employment</label>
                <ResourceSelect value={employeeDraft.employment} onChange={(event) => setEmployeeDraft((current) => ({ ...current, employment: event.target.value }))} containerClassName="w-full" className="text-sm">
                  <option>Full-time</option>
                  <option>Contract</option>
                  <option>Consultant</option>
                  <option>Worker</option>
                  <option>Outsourced</option>
                </ResourceSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">Status</label>
                <ResourceSelect value={employeeDraft.status} onChange={(event) => setEmployeeDraft((current) => ({ ...current, status: event.target.value as OrgEmployee["status"] }))} containerClassName="w-full" className="text-sm">
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Mobilizing</option>
                  <option>Offboarded</option>
                </ResourceSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">Join date</label>
                <input type="date" value={employeeDraft.joinDate} onChange={(event) => setEmployeeDraft((current) => ({ ...current, joinDate: event.target.value }))} className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-900" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
            <button type="button" onClick={() => setAddEmployeeOpen(false)} className="h-9 rounded-md border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:border-slate-300">Cancel</button>
            <button type="button" onClick={saveWorkforceEmployee} className="h-9 rounded-md bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700">
              {editingEmployeeId ? "Save changes" : `Add ${workforceSource === "outsourced" ? "resource" : "employee"}`}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamsSection() {
  type TeamMember = {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    dateAdded: string;
    location: string;
    status: string;
  };

  const buildInitialTeamMembers = () => {
    const roster = [...defaultEmployeeRoster, ...defaultOutsourcedRoster];
    return Object.fromEntries(
      defaultSiteTeams.map((team, teamIndex) => {
        const matching = roster.filter((employee) =>
          employee.site.includes(team.site.split(" - ")[0]) ||
          employee.manager === team.lead ||
          employee.vendor === team.contractor ||
          employee.department.toLowerCase().includes(team.name.split(" ")[0].toLowerCase()),
        );
        const fallback = roster.slice(teamIndex, teamIndex + 5);
        const members = (matching.length >= 3 ? matching : [...matching, ...fallback])
          .slice(0, 6)
          .map((employee, memberIndex) => ({
            id: `${team.id}-${employee.id}-${memberIndex}`,
            name: employee.name,
            email: employee.email,
            role: employee.role,
            department: employee.department,
            dateAdded: `${employee.joinDate} - ${memberIndex % 2 === 0 ? "09:32 AM" : "02:47 PM"}`,
            location: employee.site,
            status: employee.status,
          }));
        return [team.id, members];
      }),
    ) as Record<string, TeamMember[]>;
  };

  const [teams, setTeams] = useState<OrgSiteTeam[]>(defaultSiteTeams);
  const [selectedTeamId, setSelectedTeamId] = useState(defaultSiteTeams[0].id);
  const [teamWorkspaceTab, setTeamWorkspaceTab] = useState<"details" | "members" | "tasks" | "strength" | "settings">("members");
  const [teamSearch, setTeamSearch] = useState("");
  const [teamRoleFilter, setTeamRoleFilter] = useState("All");
  const [teamStatusFilter, setTeamStatusFilter] = useState("All");
  const [isTeamFilterOpen, setTeamFilterOpen] = useState(false);
  const [isTeamMaximized, setTeamMaximized] = useState(false);
  const [teamMembers, setTeamMembers] = useState<Record<string, TeamMember[]>>(buildInitialTeamMembers);
  const [isCreateTeamOpen, setCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setAddMemberOpen] = useState(false);
  const [editingTeamMemberId, setEditingTeamMemberId] = useState<string | null>(null);
  const [teamSortKey, setTeamSortKey] = useState<"name" | "department" | "dateAdded">("name");
  const [teamDraft, setTeamDraft] = useState({ name: "", site: "Downtown Tower - Tower A", lead: "Ravi Kumar", contractor: "In-house", shift: "Day", scope: "" });
  const [memberDraft, setMemberDraft] = useState({ name: "", email: "", role: "Site Engineer", department: "Civil Execution", location: "Downtown Tower", status: "Active" });
  const [teamSettings, setTeamSettings] = useState<Record<string, Record<string, boolean>>>(() =>
    Object.fromEntries(defaultSiteTeams.map((team) => [team.id, { attendanceLock: true, taskApproval: true, vendorSync: team.contractor !== "In-house", dailyDigest: false }])),
  );

  const selectedTeam = teams.find((team) => team.id === selectedTeamId) ?? teams[0];
  const currentMembers = teamMembers[selectedTeam.id] ?? [];
  const teamRoles = [...new Set(currentMembers.map((member) => member.role))];
  const teamStatuses = [...new Set(currentMembers.map((member) => member.status))];
  const activeTeamFilterCount = [teamRoleFilter, teamStatusFilter].filter((filter) => filter !== "All").length;
  const searchedTeamMembers = currentMembers.filter(
    (member) =>
      (teamRoleFilter === "All" || member.role === teamRoleFilter) &&
      (teamStatusFilter === "All" || member.status === teamStatusFilter) &&
      (teamSearch === "" ||
        member.name.toLowerCase().includes(teamSearch.toLowerCase()) ||
        member.role.toLowerCase().includes(teamSearch.toLowerCase()) ||
        member.email.toLowerCase().includes(teamSearch.toLowerCase()) ||
        member.location.toLowerCase().includes(teamSearch.toLowerCase())),
  );
  const filteredMembers = [...searchedTeamMembers].sort((a, b) => a[teamSortKey].localeCompare(b[teamSortKey]));
  const teamTasks = [
    { task: `${selectedTeam.name} daily plan closure`, owner: selectedTeam.lead, due: "Today", status: "In progress", progress: Math.min(96, selectedTeam.productivity + 8) },
    { task: "Material readiness and access fronts", owner: currentMembers[0]?.name ?? selectedTeam.lead, due: "Tomorrow", status: "Open", progress: 46 },
    { task: "Safety permit and toolbox talk", owner: currentMembers[1]?.name ?? "Safety Desk", due: "Daily", status: "Ready", progress: 92 },
    { task: "Weekly productivity report", owner: selectedTeam.lead, due: "Fri", status: "Review", progress: selectedTeam.productivity },
  ];
  const tradeMix = [
    { label: "Core crew", value: Math.min(100, Math.round((currentMembers.length / Math.max(selectedTeam.strength, 1)) * 100)) },
    { label: "Skilled trade", value: Math.min(96, selectedTeam.productivity) },
    { label: "Supervision", value: Math.max(18, Math.round(selectedTeam.strength / 3)) },
    { label: "Backfill cover", value: selectedTeam.status === "Backfill needed" || selectedTeam.status === "Scaling up" ? 42 : 82 },
  ];
  const clearTeamFilters = () => {
    setTeamSearch("");
    setTeamRoleFilter("All");
    setTeamStatusFilter("All");
  };
  const createTeam = () => {
    const name = teamDraft.name.trim() || "New Site Team";
    const nextTeam: OrgSiteTeam = {
      id: `team-${Date.now()}`,
      name,
      site: teamDraft.site,
      lead: teamDraft.lead,
      strength: 0,
      shift: teamDraft.shift,
      contractor: teamDraft.contractor,
      status: "Setup",
      scope: teamDraft.scope.trim() || "Define scope, crew strength, task package and reporting rhythm",
      productivity: 0,
    };
    setTeams((current) => [nextTeam, ...current]);
    setTeamMembers((current) => ({ ...current, [nextTeam.id]: [] }));
    setTeamSettings((current) => ({ ...current, [nextTeam.id]: { attendanceLock: true, taskApproval: true, vendorSync: nextTeam.contractor !== "In-house", dailyDigest: false } }));
    setSelectedTeamId(nextTeam.id);
    setTeamWorkspaceTab("details");
    setCreateTeamOpen(false);
    setTeamDraft({ name: "", site: "Downtown Tower - Tower A", lead: "Ravi Kumar", contractor: "In-house", shift: "Day", scope: "" });
  };
  const saveTeamMember = () => {
    const name = memberDraft.name.trim() || "New Team Member";
    if (editingTeamMemberId) {
      setTeamMembers((current) => ({
        ...current,
        [selectedTeam.id]: (current[selectedTeam.id] ?? []).map((member) =>
          member.id === editingTeamMemberId
            ? {
              ...member,
              name,
              email: memberDraft.email.trim() || member.email,
              role: memberDraft.role,
              department: memberDraft.department,
              location: memberDraft.location,
              status: memberDraft.status,
            }
            : member,
        ),
      }));
      setEditingTeamMemberId(null);
      setAddMemberOpen(false);
      return;
    }
    const nextMember: TeamMember = {
      id: `member-${Date.now()}`,
      name,
      email: memberDraft.email.trim() || `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@hubbuild.com`,
      role: memberDraft.role,
      department: memberDraft.department,
      dateAdded: "2026-05-16 - 09:32 AM",
      location: memberDraft.location,
      status: memberDraft.status,
    };
    setTeamMembers((current) => ({ ...current, [selectedTeam.id]: [nextMember, ...(current[selectedTeam.id] ?? [])] }));
    setTeams((current) => current.map((team) => (team.id === selectedTeam.id ? { ...team, strength: team.strength + 1 } : team)));
    setAddMemberOpen(false);
    setMemberDraft({ name: "", email: "", role: "Site Engineer", department: "Civil Execution", location: selectedTeam.site, status: "Active" });
  };
  const editTeamMember = (member: TeamMember) => {
    setEditingTeamMemberId(member.id);
    setMemberDraft({ name: member.name, email: member.email, role: member.role, department: member.department, location: member.location, status: member.status });
    setAddMemberOpen(true);
  };
  const removeTeamMember = (memberId: string) => {
    setTeamMembers((current) => ({
      ...current,
      [selectedTeam.id]: (current[selectedTeam.id] ?? []).filter((member) => member.id !== memberId),
    }));
    setTeams((current) => current.map((team) => (team.id === selectedTeam.id ? { ...team, strength: Math.max(0, team.strength - 1) } : team)));
  };
  const updateTeamSetting = (key: string) => {
    setTeamSettings((current) => ({
      ...current,
      [selectedTeam.id]: {
        ...current[selectedTeam.id],
        [key]: !current[selectedTeam.id]?.[key],
      },
    }));
  };
  const getTeamStatusTone = (status: string) =>
    status === "Backfill needed" || status === "Scaling up"
      ? "bg-amber-50 text-amber-700"
      : status === "Mobilizing" || status === "Setup"
        ? "bg-blue-50 text-blue-700"
        : "bg-emerald-50 text-emerald-700";
  const TeamSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button type="button" role="switch" aria-checked={enabled} onClick={onToggle} className={`relative inline-flex h-6 w-11 items-center rounded-full p-0.5 transition ${enabled ? "bg-blue-600" : "bg-slate-200"}`}>
      <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${enabled ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
  const teamWorkspaceHeightClass = isTeamMaximized ? "h-[calc(100vh-64px)]" : "h-[calc(100vh-140px)] min-h-[620px]";

  return (
    <div className={isTeamMaximized ? "fixed inset-0 z-[70] overflow-auto bg-slate-50 p-6" : ""}>
      <div className={`grid min-h-0 gap-4 xl:grid-cols-[380px_minmax(0,1fr)] ${teamWorkspaceHeightClass}`}>
        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <h4 className="text-sm font-semibold text-slate-950">Teams</h4>
              <p className="mt-1 text-xs text-slate-500">{teams.length} site teams</p>
            </div>
            <button type="button" onClick={() => setCreateTeamOpen(true)} className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
              Create
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {teams.map((team) => (
              <button
                key={team.id}
                type="button"
                onClick={() => setSelectedTeamId(team.id)}
                className={`group flex w-full items-center justify-between gap-3 rounded-2xl border bg-white p-3 text-left transition ${selectedTeam.id === team.id ? "border-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]" : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                  }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${selectedTeam.id === team.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
                    <Users className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-950">{team.name}</p>
                    <p className="truncate text-xs text-slate-500">{team.contractor} · {team.site}</p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-[11px]">
                  <span className="text-slate-500 group-hover:text-slate-900">Edit</span>
                  <span className="text-rose-500">Leave</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="shrink-0 border-b border-slate-100 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-slate-950">{selectedTeam.name}</h4>
                <p className="mt-1 text-xs text-slate-500">{selectedTeam.site} · {selectedTeam.contractor}</p>
              </div>
              <div className="flex min-w-max shrink-0 items-center gap-2 whitespace-nowrap">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={teamSearch}
                    onChange={(event) => setTeamSearch(event.target.value)}
                    placeholder="Search by name or role"
                    className="h-8 w-[220px] rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-slate-400 focus:bg-white"
                  />
                </div>
                <div className="relative">
                  <button type="button" onClick={() => setTeamFilterOpen((current) => !current)} className={`inline-flex h-8 items-center gap-2 rounded-xl border px-3 text-xs font-medium ${activeTeamFilterCount ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"}`}>
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {activeTeamFilterCount > 0 && <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">{activeTeamFilterCount}</span>}
                  </button>
                  {isTeamFilterOpen && (
                    <div className="absolute right-0 top-full z-30 mt-2 w-[290px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/12">
                      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <p className="text-sm font-medium text-slate-950">Team filters</p>
                          <p className="text-xs text-slate-500">Filter current team members.</p>
                        </div>
                        {activeTeamFilterCount > 0 && <button type="button" onClick={clearTeamFilters} className="text-xs font-medium text-blue-700">Clear</button>}
                      </div>
                      <div className="grid gap-3">
                        <div>
                          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Role</label>
                          <ResourceSelect value={teamRoleFilter} onChange={(event) => setTeamRoleFilter(event.target.value)} containerClassName="w-full">
                            <option>All</option>
                            {teamRoles.map((role) => <option key={role}>{role}</option>)}
                          </ResourceSelect>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Status</label>
                          <ResourceSelect value={teamStatusFilter} onChange={(event) => setTeamStatusFilter(event.target.value)} containerClassName="w-full">
                            <option>All</option>
                            {teamStatuses.map((status) => <option key={status}>{status}</option>)}
                          </ResourceSelect>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {(teamSearch || activeTeamFilterCount > 0) && (
                  <button type="button" onClick={clearTeamFilters} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 hover:bg-white">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                )}
                <button type="button" onClick={() => setTeamMaximized((current) => !current)} className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-950">
                  {isTeamMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                  {isTeamMaximized ? "Minimize" : "Max"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTeamMemberId(null);
                    setMemberDraft({ name: "", email: "", role: "Site Engineer", department: "Civil Execution", location: selectedTeam.site, status: "Active" });
                    setAddMemberOpen(true);
                  }}
                  className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                >
                  Add member
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <ResourceTabStrip
                tabs={[
                  { key: "members", label: "Team members" },
                  { key: "details", label: "Team details" },
                  { key: "tasks", label: "Team tasks" },
                  { key: "strength", label: "Team strength" },
                  { key: "settings", label: "Team settings" },
                ]}
                activeKey={teamWorkspaceTab}
                onChange={setTeamWorkspaceTab}
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {teamWorkspaceTab === "members" && (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="grid grid-cols-[36px_1.2fr_1fr_1fr_1fr_90px] gap-4 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  <span><input type="checkbox" className="h-4 w-4 rounded border-slate-300" /></span>
                  <button type="button" onClick={() => setTeamSortKey("name")} className="flex items-center justify-between text-left">Name <ArrowUpDown className="h-3 w-3" /></button>
                  <button type="button" onClick={() => setTeamSortKey("department")} className="flex items-center justify-between text-left">Department <ArrowUpDown className="h-3 w-3" /></button>
                  <button type="button" onClick={() => setTeamSortKey("dateAdded")} className="flex items-center justify-between text-left">Date Added <ArrowUpDown className="h-3 w-3" /></button>
                  <span>Location</span>
                  <span className="text-right">Actions</span>
                </div>
                {filteredMembers.map((member) => (
                  <div key={member.id} className="grid grid-cols-[36px_1.2fr_1fr_1fr_1fr_90px] gap-4 border-b border-slate-100 px-4 py-3 text-xs last:border-b-0 hover:bg-slate-50">
                    <span className="self-center"><input type="checkbox" className="h-4 w-4 rounded border-slate-300" /></span>
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 via-emerald-50 to-amber-100 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                        {member.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-950">{member.name}</p>
                        <p className="truncate text-[11px] text-slate-500">{member.email}</p>
                      </div>
                    </div>
                    <span className="self-center"><StatusBadge label={member.department} tone="bg-slate-100 text-slate-600" /></span>
                    <span className="self-center text-slate-600">{member.dateAdded}</span>
                    <span className="self-center truncate text-slate-600">{member.location}</span>
                    <div className="flex justify-end gap-2 self-center">
                      <button type="button" onClick={() => editTeamMember(member)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"><Pencil className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => removeTeamMember(member.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {teamWorkspaceTab === "details" && (
              <div className="grid gap-4 lg:grid-cols-2">
                {[
                  ["Team lead", selectedTeam.lead],
                  ["Site location", selectedTeam.site],
                  ["Contractor", selectedTeam.contractor],
                  ["Shift", selectedTeam.shift],
                  ["Scope", selectedTeam.scope],
                  ["Status", selectedTeam.status],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">{label}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
            )}

            {teamWorkspaceTab === "tasks" && (
              <div className="grid gap-3">
                {teamTasks.map((task) => (
                  <div key={task.task} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-950">{task.task}</h4>
                        <p className="mt-1 text-xs text-slate-500">Owner: {task.owner} · Due: {task.due}</p>
                      </div>
                      <StatusBadge label={task.status} tone={task.status === "Open" ? "bg-amber-50 text-amber-700" : task.status === "Review" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"} />
                    </div>
                    <div className="mt-4 h-2 rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${task.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {teamWorkspaceTab === "strength" && (
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-4">
                  {[
                    ["Planned strength", selectedTeam.strength],
                    ["Active members", currentMembers.length],
                    ["Productivity", `${selectedTeam.productivity}%`],
                    ["Shift", selectedTeam.shift],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h4 className="text-sm font-semibold text-slate-950">Strength mix</h4>
                  <div className="mt-4 space-y-3">
                    {tradeMix.map((item) => (
                      <div key={item.label}>
                        <div className="mb-1 flex justify-between text-xs">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-medium text-slate-950">{item.value}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-600" style={{ width: `${item.value}%` }} /></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {teamWorkspaceTab === "settings" && (
              <div className="grid gap-3">
                {[
                  ["attendanceLock", "Attendance lock", "Freeze manual edits after daily site closure."],
                  ["taskApproval", "Task approval required", "Lead must approve completed tasks before reporting."],
                  ["vendorSync", "Vendor workforce sync", "Prepare this team for future vendor linking."],
                  ["dailyDigest", "Daily digest", "Send shift summary to lead and project manager."],
                ].map(([key, title, caption]) => (
                  <div key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{title}</p>
                      <p className="mt-1 text-xs text-slate-500">{caption}</p>
                    </div>
                    <TeamSwitch enabled={teamSettings[selectedTeam.id]?.[key] ?? false} onToggle={() => updateTeamSetting(key)} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <Dialog open={isCreateTeamOpen} onOpenChange={setCreateTeamOpen}>
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-slate-100 px-5 py-4">
            <DialogTitle className="text-base font-medium">Create new team</DialogTitle>
            <DialogDescription className="text-xs">Define the team shell, lead, shift and work package.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 p-5">
            {[
              ["Team name", "name"],
              ["Site / location", "site"],
              ["Team lead", "lead"],
              ["Contractor", "contractor"],
              ["Shift", "shift"],
              ["Scope", "scope"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">{label}</label>
                <input value={teamDraft[key as keyof typeof teamDraft]} onChange={(event) => setTeamDraft((current) => ({ ...current, [key]: event.target.value }))} className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-900" />
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
            <button type="button" onClick={() => setCreateTeamOpen(false)} className="h-9 rounded-md border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:border-slate-300">Cancel</button>
            <button type="button" onClick={createTeam} className="h-9 rounded-md bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700">Create team</button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAddMemberOpen}
        onOpenChange={(open) => {
          setAddMemberOpen(open);
          if (!open) setEditingTeamMemberId(null);
        }}
      >
        <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
          <DialogHeader className="border-b border-slate-100 px-5 py-4">
            <DialogTitle className="text-base font-medium">{editingTeamMemberId ? "Edit team member" : "Add team member"}</DialogTitle>
            <DialogDescription className="text-xs">{editingTeamMemberId ? `Update member details in ${selectedTeam.name}.` : `Add a member directly to ${selectedTeam.name}.`}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 p-5">
            {[
              ["Full name", "name"],
              ["Email address", "email"],
              ["Job position", "role"],
              ["Department", "department"],
              ["Location", "location"],
            ].map(([label, key]) => (
              <div key={key}>
                <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">{label}</label>
                <input value={memberDraft[key as keyof typeof memberDraft]} onChange={(event) => setMemberDraft((current) => ({ ...current, [key]: event.target.value }))} className="h-9 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-900" />
              </div>
            ))}
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase text-slate-400">Status</label>
              <ResourceSelect value={memberDraft.status} onChange={(event) => setMemberDraft((current) => ({ ...current, status: event.target.value }))} containerClassName="w-full" className="text-sm">
                <option>Active</option>
                <option>Mobilizing</option>
                <option>On Leave</option>
              </ResourceSelect>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3">
            <button type="button" onClick={() => { setAddMemberOpen(false); setEditingTeamMemberId(null); }} className="h-9 rounded-md border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:border-slate-300">Cancel</button>
            <button type="button" onClick={saveTeamMember} className="h-9 rounded-md bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700">{editingTeamMemberId ? "Save member" : "Add member"}</button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AttendanceSection() {
  type AttendanceStatus = "Present" | "Absent" | "Late" | "Leave";
  type AttendanceRecord = {
    id: string;
    workerId: string;
    name: string;
    role: string;
    team: string;
    site: string;
    shift: string;
    checkIn: string;
    checkOut: string;
    totalHours: string;
    overtime: string;
    status: AttendanceStatus;
    employment: string;
    leaveType?: string;
    note?: string;
  };

  const [attendanceRows, setAttendanceRows] = useState<AttendanceRecord[]>([
    { id: "att-1", workerId: "HB-10021", name: "Rahul Verma", role: "Senior Site Engineer", team: "Core Wall Crew", site: "Downtown Tower", shift: "Day Shift", checkIn: "06:48", checkOut: "18:10", totalHours: "11h 22m", overtime: "1h 22m", status: "Present", employment: "Full-time", note: "Core wall pour supervision" },
    { id: "att-2", workerId: "HB-10058", name: "Harish Patel", role: "General Foreman", team: "Slab and Formwork Unit", site: "Podium Package", shift: "Day Shift", checkIn: "06:42", checkOut: "18:35", totalHours: "11h 53m", overtime: "1h 53m", status: "Present", employment: "Contract", note: "Extended deck work" },
    { id: "att-3", workerId: "HB-10077", name: "Zubair Khan", role: "HVAC Engineer", team: "HVAC Installation Squad", site: "Tech Park Phase 2", shift: "General Shift", checkIn: "08:22", checkOut: "17:45", totalHours: "9h 23m", overtime: "0h", status: "Late", employment: "Contract", note: "Late due to material gate pass" },
    { id: "att-4", workerId: "HB-10088", name: "Kritika Nair", role: "BIM Coordinator", team: "BIM Coordination Unit", site: "HQ Design Cell", shift: "General Shift", checkIn: "09:00", checkOut: "18:00", totalHours: "9h", overtime: "0h", status: "Present", employment: "Full-time" },
    { id: "att-5", workerId: "HB-10110", name: "Deepa Krishnan", role: "Safety Officer", team: "Safety Patrol Unit", site: "Downtown Tower", shift: "Day Shift", checkIn: "07:05", checkOut: "18:20", totalHours: "11h 15m", overtime: "1h 15m", status: "Present", employment: "Full-time" },
    { id: "att-6", workerId: "HB-10121", name: "Mohammed Rizwan", role: "Electrical Supervisor", team: "Electrical First-Fix Team", site: "Utilities Block", shift: "General Shift", checkIn: "", checkOut: "", totalHours: "0h", overtime: "0h", status: "Absent", employment: "Contract", note: "Supervisor follow-up pending" },
    { id: "att-7", workerId: "HB-10132", name: "Sneha Kapoor", role: "Planning Engineer", team: "Planning Desk", site: "PMO", shift: "General Shift", checkIn: "", checkOut: "", totalHours: "0h", overtime: "0h", status: "Leave", employment: "Full-time", leaveType: "Casual leave", note: "Approved leave" },
    { id: "att-8", workerId: "OSR-44015", name: "Moin Shaikh", role: "Ducting Technician", team: "MEP Night Crew", site: "Downtown Tower", shift: "Night Shift", checkIn: "19:08", checkOut: "05:42", totalHours: "10h 34m", overtime: "0h 34m", status: "Present", employment: "Outsourced" },
    { id: "att-9", workerId: "OSR-44019", name: "Dinesh Rathod", role: "Facade Installer", team: "Finishing and Facade Crew", site: "Downtown Tower", shift: "Day Shift", checkIn: "07:16", checkOut: "", totalHours: "In shift", overtime: "0h", status: "Present", employment: "Outsourced", note: "Checkout pending" },
    { id: "att-10", workerId: "OSR-44021", name: "Ajay Rawat", role: "Land Surveyor", team: "Survey and Layout Cell", site: "Airport Apron Upgrade", shift: "Day Shift", checkIn: "06:55", checkOut: "17:50", totalHours: "10h 55m", overtime: "0h 55m", status: "Present", employment: "Outsourced" },
  ]);
  const [selectedDate, setSelectedDate] = useState("2026-05-16");
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [attendanceSiteFilter, setAttendanceSiteFilter] = useState("All");
  const [attendanceShiftFilter, setAttendanceShiftFilter] = useState("All");
  const [attendanceTeamFilter, setAttendanceTeamFilter] = useState("All");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState("All");
  const [selectedAttendanceId, setSelectedAttendanceId] = useState("att-1");
  const [attendanceDetailTab, setAttendanceDetailTab] = useState<"attendance" | "leaves">("attendance");
  const [isAttendanceMaximized, setAttendanceMaximized] = useState(false);
  const [isAttendanceFilterOpen, setAttendanceFilterOpen] = useState(false);
  const [isAttendanceDetailOpen, setAttendanceDetailOpen] = useState(true);
  const [lastAttendanceSavedAt, setLastAttendanceSavedAt] = useState("Not saved");

  const attendanceSites = [...new Set(attendanceRows.map((row) => row.site))];
  const attendanceShifts = [...new Set(attendanceRows.map((row) => row.shift))];
  const attendanceTeams = [...new Set(attendanceRows.map((row) => row.team))];
  const filteredAttendance = attendanceRows.filter(
    (row) =>
      (attendanceSiteFilter === "All" || row.site === attendanceSiteFilter) &&
      (attendanceShiftFilter === "All" || row.shift === attendanceShiftFilter) &&
      (attendanceTeamFilter === "All" || row.team === attendanceTeamFilter) &&
      (attendanceStatusFilter === "All" || row.status === attendanceStatusFilter) &&
      (attendanceSearch === "" ||
        row.name.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        row.workerId.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        row.role.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
        row.team.toLowerCase().includes(attendanceSearch.toLowerCase())),
  );
  const selectedAttendance = attendanceRows.find((row) => row.id === selectedAttendanceId) ?? attendanceRows[0];
  const activeAttendanceFilterCount = [attendanceSiteFilter, attendanceShiftFilter, attendanceTeamFilter, attendanceStatusFilter].filter((filter) => filter !== "All").length;
  const summary = [
    { label: "Present", value: attendanceRows.filter((row) => row.status === "Present").length, tone: "bg-emerald-50 text-emerald-700" },
    { label: "Absent", value: attendanceRows.filter((row) => row.status === "Absent").length, tone: "bg-rose-50 text-rose-700" },
    { label: "Late", value: attendanceRows.filter((row) => row.status === "Late").length, tone: "bg-amber-50 text-amber-700" },
    { label: "On leave", value: attendanceRows.filter((row) => row.status === "Leave").length, tone: "bg-blue-50 text-blue-700" },
  ];
  const getAttendanceTone = (status: AttendanceStatus) =>
    status === "Present"
      ? "bg-emerald-50 text-emerald-700"
      : status === "Absent"
        ? "bg-rose-50 text-rose-700"
        : status === "Late"
          ? "bg-amber-50 text-amber-700"
          : "bg-blue-50 text-blue-700";
  const updateAttendanceRow = (id: string, patch: Partial<AttendanceRecord>) => {
    setAttendanceRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };
  const markAttendanceStatus = (id: string, status: AttendanceStatus) => {
    updateAttendanceRow(id, {
      status,
      checkIn: status === "Present" || status === "Late" ? "07:00" : "",
      checkOut: status === "Present" || status === "Late" ? "18:00" : "",
      totalHours: status === "Present" || status === "Late" ? "11h" : "0h",
      overtime: status === "Present" || status === "Late" ? "1h" : "0h",
      leaveType: status === "Leave" ? "Casual leave" : undefined,
    });
  };
  const markCheckIn = (id: string) => updateAttendanceRow(id, { status: "Present", checkIn: "09:00", totalHours: "In shift", note: "Manual check-in" });
  const markCheckOut = (id: string) => updateAttendanceRow(id, { checkOut: "18:00", totalHours: "9h", overtime: "0h", note: "Manual check-out" });
  const saveAttendance = () => setLastAttendanceSavedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
  const bulkMarkPresent = () => {
    setAttendanceRows((current) =>
      current.map((row) =>
        row.status === "Absent"
          ? { ...row, status: "Present", checkIn: "09:00", checkOut: "18:00", totalHours: "9h", overtime: "0h", note: "Bulk marked present" }
          : row,
      ),
    );
  };
  const clearAttendanceFilters = () => {
    setAttendanceSearch("");
    setAttendanceSiteFilter("All");
    setAttendanceShiftFilter("All");
    setAttendanceTeamFilter("All");
    setAttendanceStatusFilter("All");
  };
  const calendarDays = Array.from({ length: 31 }, (_, index) => index + 1);
  const selectedDay = Number(selectedDate.slice(-2));
  const leaveHistory = [
    { type: "Casual leave", date: "04 May 2026", status: "Approved", balance: "13 days left" },
    { type: "Sick leave", date: "16 Apr 2026", status: "Approved", balance: "6 days left" },
    { type: "Comp off", date: "02 Mar 2026", status: "Used", balance: "1 day left" },
  ];

  return (
    <div className={`space-y-5 ${isAttendanceMaximized ? "fixed inset-0 z-[70] overflow-auto bg-slate-50 p-6" : ""}`}>
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-950/5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-xl font-semibold text-slate-950">Attendance</h3>
            <p className="mt-1 text-sm text-slate-500">Check-in, check-out, leave status and daily shift closure.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={attendanceSearch}
                onChange={(event) => setAttendanceSearch(event.target.value)}
                placeholder="Search worker, team or ID"
                className="h-9 w-[260px] rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>
            <div className="relative">
              <button type="button" onClick={() => setAttendanceFilterOpen((current) => !current)} className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium ${activeAttendanceFilterCount ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"}`}>
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filters
                {activeAttendanceFilterCount > 0 && <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] text-white">{activeAttendanceFilterCount}</span>}
              </button>
              {isAttendanceFilterOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-[340px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/12">
                  <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">Attendance filters</p>
                      <p className="text-xs text-slate-500">Filter by site, shift, team and status.</p>
                    </div>
                    {activeAttendanceFilterCount > 0 && <button type="button" onClick={clearAttendanceFilters} className="text-xs font-medium text-blue-700">Clear</button>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Site</label>
                      <ResourceSelect value={attendanceSiteFilter} onChange={(event) => setAttendanceSiteFilter(event.target.value)} containerClassName="w-full">
                        <option>All</option>
                        {attendanceSites.map((site) => <option key={site}>{site}</option>)}
                      </ResourceSelect>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Shift</label>
                      <ResourceSelect value={attendanceShiftFilter} onChange={(event) => setAttendanceShiftFilter(event.target.value)} containerClassName="w-full">
                        <option>All</option>
                        {attendanceShifts.map((shift) => <option key={shift}>{shift}</option>)}
                      </ResourceSelect>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Team</label>
                      <ResourceSelect value={attendanceTeamFilter} onChange={(event) => setAttendanceTeamFilter(event.target.value)} containerClassName="w-full">
                        <option>All</option>
                        {attendanceTeams.map((team) => <option key={team}>{team}</option>)}
                      </ResourceSelect>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Status</label>
                      <ResourceSelect value={attendanceStatusFilter} onChange={(event) => setAttendanceStatusFilter(event.target.value)} containerClassName="w-full">
                        <option>All</option>
                        <option>Present</option>
                        <option>Absent</option>
                        <option>Late</option>
                        <option>Leave</option>
                      </ResourceSelect>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(attendanceSearch || activeAttendanceFilterCount > 0) && (
              <button type="button" onClick={clearAttendanceFilters} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 hover:bg-white">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
            <button type="button" onClick={() => setAttendanceMaximized((current) => !current)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:border-slate-300 hover:text-slate-950">
              {isAttendanceMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {isAttendanceMaximized ? "Minimize" : "Max view"}
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-5 xl:grid-cols-[280px_1fr_340px]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between">
                <button type="button" onClick={() => setSelectedDate("2026-05-15")} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700">‹</button>
                <p className="text-sm font-semibold text-slate-950">May 2026</p>
                <button type="button" onClick={() => setSelectedDate("2026-05-17")} className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-700">›</button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-slate-400">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day}>{day}</span>)}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const active = day === selectedDay;
                  const hasSignal = [3, 6, 9, 12, 16, 21, 24, 29].includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDate(`2026-05-${String(day).padStart(2, "0")}`)}
                      className={`relative flex h-8 items-center justify-center rounded-xl text-xs font-medium transition ${active ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                      {day}
                      {hasSignal && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${active ? "bg-white" : "bg-emerald-500"}`} />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3">
              {summary.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <StatusBadge label={item.label} tone={item.tone} />
                  <p className="mt-3 text-3xl font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </aside>

          <main className="min-w-0 rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-950">Mark Attendance</h4>
                <p className="mt-1 text-xs text-slate-500">Selected date: {selectedDate} · {filteredAttendance.length} records · Saved: {lastAttendanceSavedAt}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={bulkMarkPresent} className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 hover:bg-white">Bulk mark present</button>
                <button type="button" onClick={saveAttendance} className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">Save Attendance</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-[110px_1.1fr_270px_92px_92px_90px_90px_90px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  <span>Worker ID</span>
                  <span>Worker</span>
                  <span>Status</span>
                  <span>Check in</span>
                  <span>Check out</span>
                  <span>Hours</span>
                  <span>Shift</span>
                  <span className="text-right">Action</span>
                </div>
                {filteredAttendance.map((row) => (
                  <div
                    key={row.id}
                    onClick={() => {
                      setSelectedAttendanceId(row.id);
                      setAttendanceDetailOpen(true);
                    }}
                    className={`grid cursor-pointer grid-cols-[110px_1.1fr_270px_92px_92px_90px_90px_90px] gap-3 border-b border-slate-100 px-4 py-3 text-xs last:border-b-0 hover:bg-slate-50 ${selectedAttendance.id === row.id ? "bg-blue-50/50" : ""}`}
                  >
                    <span className="self-center font-medium text-slate-600">{row.workerId}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{row.name}</p>
                      <p className="truncate text-[11px] text-slate-500">{row.role} · {row.team}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 self-center">
                      {(["Present", "Absent", "Late", "Leave"] as AttendanceStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            markAttendanceStatus(row.id, status);
                          }}
                          className={`h-7 rounded-lg px-2 text-[11px] font-medium transition ${row.status === status ? getAttendanceTone(status) : "bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-700"}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                    <span className="self-center text-slate-600">{row.checkIn || "--"}</span>
                    <span className="self-center text-slate-600">{row.checkOut || "--"}</span>
                    <span className="self-center text-slate-600">{row.totalHours}</span>
                    <span className="self-center"><StatusBadge label={row.status} tone={getAttendanceTone(row.status)} /></span>
                    <div className="flex justify-end gap-1 self-center">
                      {!row.checkIn && row.status !== "Leave" && (
                        <button type="button" onClick={(event) => { event.stopPropagation(); markCheckIn(row.id); }} className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700">In</button>
                      )}
                      {row.checkIn && !row.checkOut && (
                        <button type="button" onClick={(event) => { event.stopPropagation(); markCheckOut(row.id); }} className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-600 hover:border-blue-200 hover:text-blue-700">Out</button>
                      )}
                      <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedAttendanceId(row.id); setAttendanceDetailOpen(true); }} className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {isAttendanceDetailOpen ? (
            <aside className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-4 py-4">
                <div>
                  <p className="text-xs text-slate-500">Worker details</p>
                  <h4 className="mt-1 text-base font-semibold text-slate-950">{selectedAttendance.name}</h4>
                  <p className="mt-1 text-xs text-slate-500">{selectedAttendance.workerId} · {selectedAttendance.role}</p>
                </div>
                <button type="button" onClick={() => setAttendanceDetailOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700">×</button>
              </div>
              <div className="border-b border-slate-100 px-4 py-3">
                <ResourceTabStrip
                  tabs={[
                    { key: "attendance", label: "Attendance" },
                    { key: "leaves", label: "Leaves" },
                  ]}
                  activeKey={attendanceDetailTab}
                  onChange={setAttendanceDetailTab}
                />
              </div>
              <div className="p-4">
                {attendanceDetailTab === "attendance" ? (
                  <div className="space-y-3">
                    {[
                      ["Status", selectedAttendance.status],
                      ["Site", selectedAttendance.site],
                      ["Team", selectedAttendance.team],
                      ["Shift", selectedAttendance.shift],
                      ["Check-in", selectedAttendance.checkIn || "Not marked"],
                      ["Check-out", selectedAttendance.checkOut || "Not marked"],
                      ["Total hours", selectedAttendance.totalHours],
                      ["Overtime", selectedAttendance.overtime],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-right font-medium text-slate-950">{value}</span>
                      </div>
                    ))}
                    <div className="rounded-xl border border-slate-100 p-3">
                      <p className="text-xs font-medium text-slate-950">Supervisor note</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{selectedAttendance.note ?? "No exceptions recorded for this attendance entry."}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        ["Annual", "14"],
                        ["Sick", "6"],
                        ["Comp off", "1"],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                          <p className="text-lg font-semibold text-slate-950">{value}</p>
                          <p className="text-[10px] text-slate-500">{label}</p>
                        </div>
                      ))}
                    </div>
                    {leaveHistory.map((leave) => (
                      <div key={leave.date + leave.type} className="rounded-xl border border-slate-100 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-950">{leave.type}</p>
                          <StatusBadge label={leave.status} tone={leave.status === "Approved" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"} />
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{leave.date} · {leave.balance}</p>
                      </div>
                    ))}
                    <button type="button" onClick={() => markAttendanceStatus(selectedAttendance.id, "Leave")} className="h-9 w-full rounded-xl bg-blue-600 text-xs font-medium text-white hover:bg-blue-700">Mark selected day as leave</button>
                  </div>
                )}
              </div>
            </aside>
          ) : (
            <aside className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center">
              <div>
                <Eye className="mx-auto h-6 w-6 text-slate-300" />
                <p className="mt-2 text-sm font-medium text-slate-700">Worker detail hidden</p>
                <button type="button" onClick={() => setAttendanceDetailOpen(true)} className="mt-3 h-8 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">Show detail</button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

function AccessSection() {
  const accessActions = ["View", "Create", "Approve", "Edit", "Export"];
  const teamAccessActions = ["Roster", "Attendance", "Documents", "Approvals"];
  const accessSettingRows = [
    { id: "mfa", title: "Mandatory MFA", caption: "Require second-factor verification for admins and managers.", scope: "Security", enabled: true },
    { id: "site-lock", title: "Site scoped permissions", caption: "Restrict users to their assigned project and site packages.", scope: "Site Access", enabled: true },
    { id: "payroll-lock", title: "Payroll approval lock", caption: "Only owners and finance admins can approve payout cycles.", scope: "Payroll", enabled: true },
    { id: "guest-expiry", title: "Visitor auto expiry", caption: "Expire auditor and visitor access after the planned visit window.", scope: "Guest Access", enabled: true },
    { id: "export-audit", title: "Export audit trail", caption: "Record every CSV, PDF and payroll export with user and timestamp.", scope: "Audit", enabled: false },
  ];
  const [accessTab, setAccessTab] = useState<"team" | "role" | "settings">("role");
  const [accessSearch, setAccessSearch] = useState("");
  const [accessScopeFilter, setAccessScopeFilter] = useState("All");
  const [accessStateFilter, setAccessStateFilter] = useState("All");
  const [isAccessFilterOpen, setAccessFilterOpen] = useState(false);
  const [isAccessMaximized, setAccessMaximized] = useState(false);
  const [rolePermissions, setRolePermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    const permissions: Record<string, Record<string, boolean>> = {};
    orgRoleAccessRows.forEach((row) => {
      permissions[row.role] = {
        View: true,
        Create: row.role === "Owner" || row.role === "Admin" || row.role === "Manager",
        Approve: row.role === "Owner" || row.role === "Admin" || row.role === "Manager",
        Edit: row.role === "Owner" || row.role === "Admin" || row.role === "Manager",
        Export: row.role === "Owner" || row.role === "Admin",
      };
    });
    return permissions;
  });
  const [teamPermissions, setTeamPermissions] = useState<Record<string, Record<string, boolean>>>(() => {
    const permissions: Record<string, Record<string, boolean>> = {};
    defaultSiteTeams.forEach((team) => {
      permissions[team.id] = {
        Roster: true,
        Attendance: true,
        Documents: team.status !== "Mobilizing",
        Approvals: team.status === "Full crew" || team.status === "Night shift active",
      };
    });
    return permissions;
  });
  const [accessSettings, setAccessSettings] = useState<Record<string, boolean>>(
    () => Object.fromEntries(accessSettingRows.map((setting) => [setting.id, setting.enabled])),
  );

  const toggleAccess = (role: string, action: string) => {
    setRolePermissions((current) => ({
      ...current,
      [role]: {
        ...current[role],
        [action]: !current[role]?.[action],
      },
    }));
  };
  const toggleTeamAccess = (teamId: string, action: string) => {
    setTeamPermissions((current) => ({
      ...current,
      [teamId]: {
        ...current[teamId],
        [action]: !current[teamId]?.[action],
      },
    }));
  };
  const toggleAccessSetting = (settingId: string) => {
    setAccessSettings((current) => ({ ...current, [settingId]: !current[settingId] }));
  };
  const getPermissionState = (permissions: Record<string, boolean>, actions: string[]) => {
    const activeCount = actions.filter((action) => permissions[action]).length;
    if (activeCount === actions.length) return "Full access";
    if (activeCount === 0) return "Off";
    return "Custom";
  };
  const getStateTone = (state: string) =>
    state === "Full access"
      ? "bg-blue-50 text-blue-700"
      : state === "Custom"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-500";
  const roleRows = orgRoleAccessRows.map((row) => ({
    ...row,
    state: getPermissionState(rolePermissions[row.role] ?? {}, accessActions),
  }));
  const teamRowsWithAccess = defaultSiteTeams.map((team) => ({
    ...team,
    state: getPermissionState(teamPermissions[team.id] ?? {}, teamAccessActions),
  }));
  const settingsRowsWithAccess = accessSettingRows.map((setting) => ({
    ...setting,
    state: accessSettings[setting.id] ? "Full access" : "Off",
  }));
  const accessScopes = [
    ...new Set([
      ...roleRows.map((row) => row.scope),
      ...teamRowsWithAccess.map((team) => team.site),
      ...settingsRowsWithAccess.map((setting) => setting.scope),
    ]),
  ];
  const activeAccessFilterCount = [accessScopeFilter, accessStateFilter].filter((filter) => filter !== "All").length;
  const matchesAccessFilters = (text: string, scope: string, state: string) =>
    (accessSearch === "" || text.toLowerCase().includes(accessSearch.toLowerCase())) &&
    (accessScopeFilter === "All" || scope === accessScopeFilter) &&
    (accessStateFilter === "All" || state === accessStateFilter);
  const filteredRoleRows = roleRows.filter((row) =>
    matchesAccessFilters(`${row.role} ${row.scope} ${row.actions.join(" ")}`, row.scope, row.state),
  );
  const filteredTeamRows = teamRowsWithAccess.filter((team) =>
    matchesAccessFilters(`${team.name} ${team.lead} ${team.site} ${team.contractor} ${team.scope}`, team.site, team.state),
  );
  const filteredSettingRows = settingsRowsWithAccess.filter((setting) =>
    matchesAccessFilters(`${setting.title} ${setting.caption} ${setting.scope}`, setting.scope, setting.state),
  );
  const visibleAccessCount =
    accessTab === "role" ? filteredRoleRows.length : accessTab === "team" ? filteredTeamRows.length : filteredSettingRows.length;
  const clearAccessFilters = () => {
    setAccessSearch("");
    setAccessScopeFilter("All");
    setAccessStateFilter("All");
  };
  const AccessSwitch = ({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) => (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition duration-200 ${enabled ? "bg-blue-600 shadow-sm shadow-blue-600/25" : "bg-slate-200 hover:bg-slate-300"
        }`}
    >
      <span className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );

  return (
    <div className={`space-y-5 ${isAccessMaximized ? "fixed inset-0 z-[70] overflow-auto bg-slate-50 p-6" : ""}`}>
      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm shadow-slate-950/5">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-950">Access control</h4>
            <p className="mt-1 text-xs text-slate-500">Manage team access, role permissions and security settings.</p>
          </div>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={accessSearch}
                onChange={(event) => setAccessSearch(event.target.value)}
                placeholder="Search access..."
                className="h-9 w-[220px] rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-600/10"
              />
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setAccessFilterOpen((current) => !current)}
                className={`inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-medium transition ${activeAccessFilterCount > 0
                  ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm shadow-blue-950/5"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950"
                  }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
                {activeAccessFilterCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] text-white">
                    {activeAccessFilterCount}
                  </span>
                )}
              </button>
              {isAccessFilterOpen && (
                <div className="absolute right-0 top-full z-30 mt-2 w-[310px] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/12">
                  <div className="mb-3 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <p className="text-sm font-medium text-slate-950">Access filters</p>
                      <p className="mt-0.5 text-xs text-slate-500">Filter by scope and switch state.</p>
                    </div>
                    {activeAccessFilterCount > 0 && (
                      <button type="button" onClick={clearAccessFilters} className="text-xs font-medium text-blue-700 hover:text-blue-900">
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3">
                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">Scope</label>
                      <ResourceSelect value={accessScopeFilter} onChange={(event) => setAccessScopeFilter(event.target.value)} containerClassName="w-full">
                        <option>All</option>
                        {accessScopes.map((scope) => (
                          <option key={scope}>{scope}</option>
                        ))}
                      </ResourceSelect>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">State</label>
                      <ResourceSelect value={accessStateFilter} onChange={(event) => setAccessStateFilter(event.target.value)} containerClassName="w-full">
                        <option>All</option>
                        <option>Full access</option>
                        <option>Custom</option>
                        <option>Off</option>
                      </ResourceSelect>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs text-slate-500">{visibleAccessCount} matching rows</p>
                    <button type="button" onClick={() => setAccessFilterOpen(false)} className="h-7 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">Apply</button>
                  </div>
                </div>
              )}
            </div>
            {(accessSearch || activeAccessFilterCount > 0) && (
              <button type="button" onClick={clearAccessFilters} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-white">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
            <button
              type="button"
              onClick={() => setAccessMaximized((current) => !current)}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-white hover:text-slate-950"
            >
              {isAccessMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              {isAccessMaximized ? "Minimize" : "Max view"}
            </button>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-white px-5 py-3">
          <ResourceTabStrip
            tabs={[
              { key: "role", label: "Role-wise control", count: filteredRoleRows.length },
              { key: "team", label: "Team-wise access", count: filteredTeamRows.length },
              { key: "settings", label: "Access settings", count: filteredSettingRows.length },
            ]}
            activeKey={accessTab}
            onChange={setAccessTab}
          />
        </div>

        <div className="p-5">
          {accessTab === "role" && (
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <div className="overflow-x-auto">
                <div className="grid min-w-[920px] grid-cols-[1.2fr_1.05fr_110px_repeat(5,92px)] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  <span>Role</span>
                  <span>Scope</span>
                  <span>Status</span>
                  {accessActions.map((action) => <span key={action}>{action}</span>)}
                </div>
                {filteredRoleRows.map((row) => (
                  <div key={row.role} className="grid min-w-[920px] grid-cols-[1.2fr_1.05fr_110px_repeat(5,92px)] gap-3 border-b border-slate-100 bg-white px-4 py-4 text-sm transition last:border-b-0 hover:bg-slate-50">
                    <div>
                      <p className="font-medium text-slate-950">{row.role}</p>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">{row.actions.join(", ")}</p>
                    </div>
                    <span className="self-center text-xs text-slate-600">{row.scope}</span>
                    <span className="self-center">
                      <StatusBadge label={row.state} tone={getStateTone(row.state)} />
                    </span>
                    {accessActions.map((action) => {
                      const isEnabled = rolePermissions[row.role]?.[action] ?? false;
                      return (
                        <span key={action} className="self-center">
                          <AccessSwitch enabled={isEnabled} onToggle={() => toggleAccess(row.role, action)} label={`${row.role} ${action}`} />
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {accessTab === "team" && (
            <div className="grid gap-3">
              {filteredTeamRows.map((team) => (
                <div key={team.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-950/[0.03] transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-950">{team.name}</h4>
                        <StatusBadge label={team.state} tone={getStateTone(team.state)} />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{team.site} · Lead: {team.lead} · Contractor: {team.contractor}</p>
                      <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">{team.scope}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {teamAccessActions.map((action) => {
                        const isEnabled = teamPermissions[team.id]?.[action] ?? false;
                        return (
                          <div key={action} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                            <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">{action}</p>
                            <AccessSwitch enabled={isEnabled} onToggle={() => toggleTeamAccess(team.id, action)} label={`${team.name} ${action}`} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {accessTab === "settings" && (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredSettingRows.map((setting) => (
                <div key={setting.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-950/[0.03] transition hover:border-blue-100 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-slate-950">{setting.title}</h4>
                        <StatusBadge label={setting.scope} tone="bg-slate-100 text-slate-600" />
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-500">{setting.caption}</p>
                    </div>
                    <AccessSwitch enabled={accessSettings[setting.id]} onToggle={() => toggleAccessSetting(setting.id)} label={setting.title} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AllocationSection() {
  const [allocationTab, setAllocationTab] = useState<AllocationTab>("overview");
  const activeAllocationTab = allocationTabs.find((tab) => tab.key === allocationTab) ?? allocationTabs[0];

  return (
    <div className="space-y-5">
      <SectionCard
        title="Allocation module"
        caption={activeAllocationTab.caption}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {["All projects", "All sites", "All teams", "All shifts", "All resources"].map((filter) => (
              <ResourceSelect key={filter} defaultValue={filter}>
                <option>{filter}</option>
                <option>Downtown Tower</option>
                <option>Tech Park Phase 2</option>
                <option>Day shift</option>
                <option>Equipment</option>
              </ResourceSelect>
            ))}
          </div>
        }
      >
        <ResourceTabStrip tabs={allocationTabs} activeKey={allocationTab} onChange={setAllocationTab} />
      </SectionCard>

      <SectionCard
        title="Allocation dashboard"
        caption="Operational deployment planning, assignment management, scheduling and utilization tracking. Finance, payroll calculation, billing and payments are excluded."
        className={resourceTabPanelClass(allocationTab === "overview")}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {allocationDashboardMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{metric.note}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {allocationKpiCards.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-950/[0.03]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{kpi.label}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{kpi.value}</p>
                </div>
                <StatusBadge label={kpi.status} tone={kpi.tone} />
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-violet-500" style={{ width: `${kpi.width}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className={resourceTabPanelClass(allocationTab === "overview", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Complete workflow" caption="From demand signal to approved deployment and release">
          <div className="space-y-3">
            {allocationWorkflowSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-semibold text-violet-700">{index + 1}</span>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Utilization graph and deployment heatmap" caption="Planner-focused calendar, timeline and workload indicators">
          <div className="flex h-44 items-end gap-2 rounded-2xl bg-slate-50 p-4">
            {[72, 81, 88, 87, 91, 76, 84].map((value, index) => (
              <div key={`${value}-${index}`} className="flex-1 rounded-t-full bg-violet-500" style={{ height: `${value}%` }} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => {
              const conflict = [4, 11, 12, 19, 24, 31].includes(index);
              const busy = [2, 3, 8, 9, 16, 17, 23, 29].includes(index);
              return <div key={index} className={`aspect-square rounded-lg ${conflict ? "bg-rose-500" : busy ? "bg-amber-400" : "bg-emerald-100"}`} />;
            })}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Manpower allocation"
        caption="Engineers, supervisors, labour, operators, contractors, safety officers and quality inspectors"
        className={resourceTabPanelClass(allocationTab === "manpower")}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1040px] overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1fr_120px_110px_150px_130px_150px_100px_90px_100px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <span>Name</span><span>Skill</span><span>Available</span><span>Project</span><span>Site</span><span>Tasks</span><span>Shift</span><span>Load</span><span>Status</span>
            </div>
            {manpowerAllocationRows.map((row) => (
              <div key={row.name} className="grid grid-cols-[1fr_120px_110px_150px_130px_150px_100px_90px_100px] items-center gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                <span className="font-medium text-slate-950">{row.name}</span><span>{row.skill}</span><span>{row.availability}</span><span>{row.project}</span><span>{row.site}</span><span>{row.tasks}</span><span>{row.shift}</span><span>{row.workload}</span>
                <StatusBadge label={row.status} tone={row.status === "Overtime" ? "bg-amber-50 text-amber-700" : row.status === "Standby" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"} />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Equipment allocation"
        caption="Machinery availability, operator assignment, usage, idle time, maintenance and certification blocks"
        className={resourceTabPanelClass(allocationTab === "equipment")}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1060px] overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.1fr_100px_100px_130px_100px_90px_110px_110px_130px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <span>Equipment</span><span>Type</span><span>Available</span><span>Site</span><span>Operator</span><span>Usage</span><span>Idle</span><span>Maintenance</span><span>Status</span>
            </div>
            {equipmentAllocationRows.map((row) => (
              <div key={row.equipment} className="grid grid-cols-[1.1fr_100px_100px_130px_100px_90px_110px_110px_130px] items-center gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                <span className="font-medium text-slate-950">{row.equipment}</span><span>{row.type}</span><span>{row.availability}</span><span>{row.site}</span><span>{row.operator}</span><span>{row.hours}</span><span>{row.idle}</span><span>{row.maintenance}</span>
                <StatusBadge label={row.status} tone={row.status === "Under Maintenance" ? "bg-rose-50 text-rose-700" : row.status === "Idle" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} />
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className={resourceTabPanelClass(allocationTab === "tasks-site", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Task and work package allocation" caption="Tasks, WBS items, milestones, dependencies and workload score">
          <div className="space-y-3">
            {taskAllocationRows.map((row) => (
              <div key={row.task} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.task}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.wbs} · {row.team} · {row.resource}</p>
                  </div>
                  <StatusBadge label={row.risk} tone={row.risk === "Conflict" || row.risk === "Delay risk" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">Duration {row.duration} · Priority {row.priority} · Dependency {row.dependency} · Completion {row.completion}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Site deployment planning" caption="Mobilization, transfers, emergency deployment and resource movement timeline">
          <div className="space-y-3">
            {siteDeploymentRows.map((row) => (
              <div key={row.deployment} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{row.deployment}</p>
                <p className="mt-1 text-xs text-slate-500">{row.from} {"->"} {row.to} · {row.date} · {row.duration}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <StatusBadge label={row.type} tone="bg-white text-slate-600" />
                  <StatusBadge label={row.readiness} tone={row.readiness.includes("pending") ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} />
                  <StatusBadge label={`Delay: ${row.delay}`} tone={row.delay === "None" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(allocationTab === "shifts-availability", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Shift and scheduling management" caption="Day, night, rotational, overtime and emergency shifts">
          <div className="space-y-3">
            {shiftScheduleRows.map((row) => (
              <div key={row.shift} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.shift}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.timing} · Manpower {row.manpower} · Attendance {row.attendance}</p>
                  </div>
                  <StatusBadge label={row.conflict} tone={row.conflict === "None" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"} />
                </div>
                <p className="mt-2 text-xs text-slate-600">Utilization {row.utilization} · Productivity {row.productivity}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Resource availability engine" caption="Attendance, leave, shift, skill, certification and site eligibility checks">
          <div className="space-y-3">
            {availabilityRows.map((row) => (
              <div key={row.pool} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.pool}</p>
                    <p className="mt-1 text-xs text-slate-500">Available {row.available} · Skill match {row.match} · Blocker {row.blocker}</p>
                  </div>
                  <Sparkles className="h-4 w-4 text-violet-600" />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">Suggestion: {row.suggestion}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(allocationTab === "utilization-conflicts", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Resource utilization and workload" caption="Utilization, task load, idle hours, overtime and balancing recommendations">
          <div className="space-y-3">
            {utilizationRows.map((row) => (
              <div key={row.resource} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.resource}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.type} · Utilization {row.utilization} · Overtime {row.overtime} · Idle {row.idle}</p>
                  </div>
                  <StatusBadge label={row.signal} tone={row.signal === "Overloaded" ? "bg-rose-50 text-rose-700" : row.signal === "Underutilized" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.recommendation}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Conflict detection engine" caption="Double allocation, shift overlap, equipment overlap, skill mismatch and expired certification">
          <div className="space-y-3">
            {conflictRows.map((row) => (
              <div key={`${row.conflict}-${row.resource}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.conflict}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.resource} · {row.detail}</p>
                  </div>
                  <StatusBadge label={row.severity} tone={row.severity === "Critical" || row.severity === "High" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">Suggested resolution: {row.resolution}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(allocationTab === "requests-pool", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Deployment request system" caption="Sites request resource type, quantity, skill, date, duration and priority">
          <div className="space-y-3">
            {deploymentRequestRows.map((row) => (
              <div key={row.request} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.request} · {row.type}</p>
                    <p className="mt-1 text-xs text-slate-500">Qty {row.qty} · {row.skill} · {row.site} · {row.required} · {row.duration}</p>
                  </div>
                  <StatusBadge label={row.priority} tone={row.priority === "Urgent" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"} />
                </div>
                <p className="mt-2 text-xs text-slate-600">Status: {row.status}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Resource pool management" caption="Internal manpower, contractors, temporary labour, equipment inventory and standby resources">
          <div className="space-y-3">
            {resourcePoolRows.map((row) => (
              <div key={row.pool} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{row.pool}</p>
                <p className="mt-1 text-xs text-slate-500">Capacity {row.capacity} · Allocated {row.allocated} · Standby {row.standby} · Utilization {row.utilization}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.forecast}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(allocationTab === "reports-admin", "grid gap-5 xl:grid-cols-[1fr_1fr_1fr]")}>
        <SectionCard title="Approval lifecycle and reports" caption="Deployment, transfer, equipment, overtime, emergency and contractor approvals">
          <div className="space-y-3">
            {allocationApprovalSteps.map((row, index) => (
              <div key={row.step} className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 text-xs font-semibold text-violet-700">{index + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-950">{row.step}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{row.owner} · {row.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {allocationReports.map((report) => <StatusBadge key={report} label={report} tone="bg-slate-50 text-slate-700" />)}
          </div>
        </SectionCard>
        <SectionCard title="Permissions and validations" caption="Role matrix, edge cases and blocking rules">
          <div className="space-y-3">
            {allocationPermissions.map((row) => (
              <div key={row.role} className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-sm font-semibold text-slate-950">{row.role}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{row.access}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {allocationValidations.map((validation) => (
              <div key={validation} className="flex gap-2 text-xs leading-5 text-slate-600">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-600" />
                <span>{validation}</span>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Tables, APIs, integrations and audit" caption="Implementation structure and full allocation history">
          <div className="space-y-3">
            {allocationTables.map((row) => (
              <div key={row.table} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-950">{row.table}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{row.columns}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {allocationApiSuggestions.map((api) => <code key={api} className="block rounded-xl bg-slate-950 px-3 py-2 text-[11px] text-white">{api}</code>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {allocationIntegrations.map((integration) => <StatusBadge key={integration} label={integration} tone="bg-white text-slate-600" />)}
          </div>
          <div className="mt-4 space-y-3">
            {allocationAuditRows.map((row) => (
              <div key={`${row.action}-${row.time}`} className="rounded-2xl border border-slate-100 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{row.action}</p>
                  <p className="text-[10px] text-slate-400">{row.time}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{row.actor}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function PayrollSection() {
  const [payrollTab, setPayrollTab] = useState<PayrollTab>("overview");
  const [lastPayrollDraftAt, setLastPayrollDraftAt] = useState("Not generated");
  const activePayrollTab = payrollTabs.find((tab) => tab.key === payrollTab) ?? payrollTabs[0];
  const generatePayrollDraft = () => {
    setPayrollTab("draft");
    setLastPayrollDraftAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
  };

  return (
    <div className="space-y-5">
      <SectionCard
        title="Payroll module"
        caption={activePayrollTab.caption}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ResourceSelect defaultValue="May 2026">
              <option>May 2026</option>
              <option>April 2026</option>
              <option>March 2026</option>
            </ResourceSelect>
            <ResourceSelect defaultValue="All sites">
              <option>All sites</option>
              <option>Downtown Tower</option>
              <option>Tech Park Phase 2</option>
              <option>Airport Apron Upgrade</option>
            </ResourceSelect>
            <button type="button" onClick={generatePayrollDraft} className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-medium text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              Generate draft
            </button>
          </div>
        }
      >
        <ResourceTabStrip tabs={payrollTabs} activeKey={payrollTab} onChange={setPayrollTab} />
      </SectionCard>

      <SectionCard
        title="Payroll dashboard"
        caption="Attendance-linked salary calculation, approval, revision and release-ready payout preparation. Finance posting stays outside payroll."
        className={resourceTabPanelClass(payrollTab === "overview")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <ResourceSelect defaultValue="May 2026">
              <option>May 2026</option>
              <option>April 2026</option>
              <option>March 2026</option>
            </ResourceSelect>
            <ResourceSelect defaultValue="All sites">
              <option>All sites</option>
              <option>Downtown Tower</option>
              <option>Tech Park Phase 2</option>
              <option>Airport Apron Upgrade</option>
            </ResourceSelect>
            <button type="button" onClick={generatePayrollDraft} className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-medium text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              Generate draft
            </button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-500">Draft generation</p>
            <p className="mt-2 text-2xl font-semibold text-blue-950">{lastPayrollDraftAt}</p>
            <p className="mt-1 text-xs leading-5 text-blue-700">Click Generate draft to open payroll draft with linked attendance snapshot.</p>
          </div>
          {payrollDashboardMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
                <p className="mt-1 text-xs text-slate-500">{metric.note}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {payrollMoneySummary.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm shadow-slate-950/[0.03]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{item.label}</p>
              <div className="mt-2 flex items-end justify-between gap-3">
                <p className="text-xl font-semibold text-slate-950">{item.value}</p>
                <p className="text-right text-xs text-slate-500">{item.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className={resourceTabPanelClass(payrollTab === "overview", "grid gap-5 xl:grid-cols-[1.15fr_0.85fr]")}>
        <SectionCard title="Payroll generation flow" caption="Draft starts only after attendance lock and uses approved payroll inputs">
          <div className="space-y-3">
            {payrollGenerationSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-sm font-semibold text-rose-700">{index + 1}</span>
                <div>
                  <p className="text-sm font-medium text-slate-950">{step}</p>
                  {index === 7 ? <p className="mt-1 text-xs text-slate-500">Creates salary release data only. No ledger, voucher, reconciliation or payment transaction is posted.</p> : null}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Calculation engine" caption="Rules for monthly, daily wage and hourly payroll">
          <div className="rounded-3xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-rose-500">Formula</p>
            <p className="mt-2 text-sm leading-6 text-rose-950">
              Gross Pay = Basic Pay + HRA + TADA + Allowances + Overtime + One-time Payments + Reimbursements
            </p>
            <p className="mt-3 text-sm leading-6 text-rose-950">
              Deductions = Absent Deduction + Unpaid Leave Deduction + PF + Advance Deduction + Loan EMI + Other Deductions
            </p>
            <p className="mt-3 rounded-2xl bg-white px-3 py-3 text-sm font-semibold text-slate-950">Net Payable = Gross Pay - Deductions</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {["Monthly salary uses payable days and unpaid leave deduction.", "Daily wage uses locked present days, half-days and weekly off policy.", "Hourly workers use approved hours, OT rate and shift allowance rules."].map((rule) => (
              <div key={rule} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs leading-5 text-slate-600">{rule}</div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Draft payroll review"
        caption="Employee-wise rows with expandable calculation details, warnings, payment mode and approval status"
        className={resourceTabPanelClass(payrollTab === "draft")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {["Employee type", "Status", "Payment mode"].map((filter) => (
              <ResourceSelect key={filter} defaultValue={filter}>
                <option>{filter}</option>
                <option>Monthly</option>
                <option>Daily wage</option>
                <option>Hourly</option>
              </ResourceSelect>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1180px] overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.25fr_110px_150px_130px_115px_115px_115px_150px_90px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <span>Employee</span>
              <span>Type</span>
              <span>Attendance</span>
              <span>Gross</span>
              <span>Earnings</span>
              <span>Deductions</span>
              <span>Net payable</span>
              <span>Status</span>
              <span>Mode</span>
            </div>
            {payrollRows.map((row) => (
              <div key={row.id} className="border-t border-slate-100 bg-white">
                <div className="grid grid-cols-[1.25fr_110px_150px_130px_115px_115px_115px_150px_90px] items-center gap-3 px-4 py-4 text-sm">
                  <div>
                    <p className="font-medium text-slate-950">{row.employee}</p>
                    <p className="mt-1 text-xs text-slate-400">{row.id} · {row.site}</p>
                  </div>
                  <span className="text-slate-600">{row.type}</span>
                  <span className="text-slate-600">{row.attendance}</span>
                  <span className="font-medium text-slate-800">{row.gross}</span>
                  <span className="text-emerald-700">{row.earnings}</span>
                  <span className="text-rose-700">{row.deductions}</span>
                  <span className="font-semibold text-slate-950">{row.net}</span>
                  <span>
                    <StatusBadge
                      label={row.status}
                      tone={
                        row.status === "Ready for Salary Release"
                          ? "bg-emerald-50 text-emerald-700"
                          : row.status === "Pending Admin Approval"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-amber-50 text-amber-700"
                      }
                    />
                  </span>
                  <span className="text-slate-600">{row.mode}</span>
                </div>
                <div className="grid gap-3 bg-slate-50 px-4 pb-4 md:grid-cols-[1fr_0.9fr]">
                  <div className="rounded-2xl border border-slate-100 bg-white p-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Calculation breakdown drawer</p>
                    {row.breakdown.map((line) => (
                      <p key={line} className="text-xs leading-5 text-slate-600">{line}</p>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-amber-100 bg-amber-50 p-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-600">Payroll edit validation</p>
                    <p className="text-xs leading-5 text-amber-800">{row.warning}</p>
                    <p className="mt-2 text-xs text-amber-700">Editable before final approval: payable days, OT, allowances, reimbursements, one-time payments, deductions, PF, advance and loan deduction. Remarks required.</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className={resourceTabPanelClass(payrollTab === "salary-attendance", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Employee salary setup" caption="Salary structures for staff, labour, hourly and contract workers">
          <div className="overflow-x-auto">
            <div className="min-w-[860px] overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-[1.15fr_100px_120px_90px_90px_95px_90px_130px_90px_120px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <span>Name</span>
                <span>Type</span>
                <span>Basic/rate</span>
                <span>HRA</span>
                <span>TADA</span>
                <span>PF</span>
                <span>OT</span>
                <span>Site</span>
                <span>Payout</span>
                <span>Status</span>
              </div>
              {payrollSalarySetupRows.map((row) => (
                <div key={row.name} className="grid grid-cols-[1.15fr_100px_120px_90px_90px_95px_90px_130px_90px_120px] gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-950">{row.name}</span>
                  <span>{row.type}</span>
                  <span>{row.basic}</span>
                  <span>{row.hra}</span>
                  <span>{row.tada}</span>
                  <span>{row.pf}</span>
                  <span>{row.overtime}</span>
                  <span>{row.site}</span>
                  <span>{row.payout}</span>
                  <span>{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Attendance linking" caption="Locked attendance directly affects salary calculation">
          <div className="space-y-3">
            {payrollAttendanceLinks.map((link) => (
              <div key={link.source} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{link.source}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">{link.effect}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Advance, reimbursement, one-time payment and loan flows"
        caption="Approved payroll inputs are pulled into the draft automatically"
        className={resourceTabPanelClass(payrollTab === "adjustments")}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {payrollAuxiliaryFlows.map((flow) => {
            const Icon = flow.icon;
            return (
              <div key={flow.title} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-rose-700 shadow-sm shadow-slate-950/[0.04]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <StatusBadge label={flow.status} tone="bg-white text-slate-600" />
                </div>
                <h4 className="text-base font-semibold text-slate-950">{flow.title}</h4>
                <div className="mt-3 space-y-2">
                  {flow.fields.map((field) => (
                    <div key={field} className="flex gap-2 text-xs leading-5 text-slate-600">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{field}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <div className={resourceTabPanelClass(payrollTab === "approval", "grid gap-5 xl:grid-cols-[0.95fr_1.05fr]")}>
        <SectionCard title="Approval, status lifecycle and revision" caption="Approved payroll corrections create a new version and need approval again">
          <div className="space-y-3">
            {payrollApprovalSteps.map((step, index) => (
              <div key={step.step} className="relative flex gap-3 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-col items-center">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${index < 2 ? "bg-emerald-600 text-white" : index === 2 ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500"}`}>{index + 1}</span>
                  {index !== payrollApprovalSteps.length - 1 ? <span className="mt-2 h-full min-h-8 w-px bg-slate-200" /> : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-950">{step.step}</p>
                    <StatusBadge label={step.status} tone={step.status === "Complete" ? "bg-emerald-50 text-emerald-700" : step.status === "In review" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{step.owner}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{step.note}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4">
            <p className="text-sm font-semibold text-rose-950">Status lifecycle</p>
            <p className="mt-2 text-xs leading-5 text-rose-800">Draft → Under Review → Pending Project Approval → Pending Admin Approval → Approved → Ready for Salary Release. Rejected returns to Draft. Revised creates a new version with old amount, revised amount, difference and reason.</p>
          </div>
        </SectionCard>

        <SectionCard title="Salary components and table structure" caption="Configurable earnings, deductions and core data model">
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1fr_110px_1.1fr_1fr] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <span>Component</span>
              <span>Type</span>
              <span>Basis</span>
              <span>Included</span>
            </div>
            {payrollComponentRows.map((row) => (
              <div key={row.component} className="grid grid-cols-[1fr_110px_1.1fr_1fr] gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                <span className="font-medium text-slate-950">{row.component}</span>
                <span>{row.type}</span>
                <span>{row.basis}</span>
                <span>{row.included}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {payrollTables.map((row) => (
              <div key={row.table} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-950">{row.table}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{row.columns}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(payrollTab === "release-payslip", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Salary release calculation" caption="Final approved output prepared for Finance, without actual payment entry">
          <div className="space-y-3">
            {payrollReleaseRows.map((row) => (
              <div key={row.output} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">{row.output}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{row.detail}</p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300" />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Payslip preview" caption="Employee-visible salary statement after approval">
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">May 2026 Payslip</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-950">Rahul Verma</h4>
                <p className="mt-1 text-sm text-slate-500">EMP-1042 · Senior Site Engineer · Downtown Tower</p>
              </div>
              <StatusBadge label="Approved" tone="bg-emerald-50 text-emerald-700" />
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Attendance", "25.5 payable days"],
                ["Gross salary", "₹98,400"],
                ["Advance deducted", "₹2,500"],
                ["Loan deducted", "₹1,800"],
                ["PF deducted", "₹3,720"],
                ["Reimbursement", "₹4,000"],
                ["Net payable", "₹89,950"],
                ["Remarks", "TADA corrected after HR review"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-medium text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(payrollTab === "reports-admin", "grid gap-5 xl:grid-cols-[1fr_1fr_1fr]")}>
        <SectionCard title="Screens and reports" caption="Complete product surface for the payroll module">
          <div className="grid gap-2">
            {payrollScreenList.map((screen) => (
              <div key={screen} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">{screen}</div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {payrollReports.map((report) => (
              <StatusBadge key={report} label={report} tone="bg-white text-slate-600" />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Permissions and validations" caption="Role access and required safeguards">
          <div className="space-y-3">
            {payrollPermissions.map((permission) => (
              <div key={permission.role} className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-sm font-semibold text-slate-950">{permission.role}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{permission.access}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {payrollValidations.map((validation) => (
              <div key={validation} className="flex gap-2 text-xs leading-5 text-slate-600">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-600" />
                <span>{validation}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Audit trail" caption="Every edit, approval, rejection and revision is timestamped">
          <div className="space-y-3">
            {payrollAuditRows.map((row) => (
              <div key={`${row.action}-${row.time}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{row.action}</p>
                  <p className="text-[10px] text-slate-400">{row.time}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{row.actor}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.change}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-3 text-xs leading-5 text-slate-600">
            Track actor, action, old value, new value, approval action, rejection reason, revision reason, timestamp and payroll version.
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function PerformanceSection() {
  const [performanceTab, setPerformanceTab] = useState<PerformanceTab>("overview");
  const activePerformanceTab = performanceTabs.find((tab) => tab.key === performanceTab) ?? performanceTabs[0];

  return (
    <div className="space-y-5">
      <SectionCard
        title="Performance module"
        caption={activePerformanceTab.caption}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {["May 2026", "Week 20", "All sites", "All contractors", "All teams"].map((filter) => (
              <ResourceSelect key={filter} defaultValue={filter}>
                <option>{filter}</option>
                <option>Downtown Tower</option>
                <option>Tech Park Phase 2</option>
                <option>Urban Workforce Co.</option>
              </ResourceSelect>
            ))}
          </div>
        }
      >
        <ResourceTabStrip tabs={performanceTabs} activeKey={performanceTab} onChange={setPerformanceTab} />
      </SectionCard>

      <SectionCard
        title="Performance dashboard"
        caption="Operational performance scorecards for projects, sites, contractors, employees, tasks, quality, safety and resources. Finance accounting, billing and payments are excluded."
        className={resourceTabPanelClass(performanceTab === "overview")}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {["May 2026", "Week 20", "All sites", "All contractors", "All teams"].map((filter) => (
              <ResourceSelect key={filter} defaultValue={filter}>
                <option>{filter}</option>
                <option>Downtown Tower</option>
                <option>Tech Park Phase 2</option>
                <option>Urban Workforce Co.</option>
              </ResourceSelect>
            ))}
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {performanceDashboardMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <StatusBadge label={metric.suffix || "Live"} tone="bg-white text-slate-600" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">
                  {metric.value}
                  <span className="ml-1 text-sm font-medium text-slate-400">{metric.suffix}</span>
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{metric.note}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {performanceKpiCards.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-950/[0.03]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{kpi.label}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{kpi.value}</p>
                </div>
                <StatusBadge label={kpi.status} tone={kpi.tone} />
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-orange-500" style={{ width: `${kpi.width}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className={resourceTabPanelClass(performanceTab === "overview", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Trend analytics and heatmaps" caption="Trend graphs, delay warnings, bottlenecks and performance ranking">
          <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-950">Planned vs actual progress trend</p>
                <StatusBadge label="Last 8 weeks" tone="bg-white text-slate-600" />
              </div>
              <div className="flex h-48 items-end gap-2 rounded-2xl bg-white p-4">
                {[54, 58, 63, 67, 70, 72, 74, 78].map((planned, index) => {
                  const actual = [52, 55, 60, 62, 65, 69, 71, 74][index];
                  return (
                    <div key={`${planned}-${index}`} className="flex flex-1 items-end justify-center gap-1">
                      <div className="w-2 rounded-t-full bg-slate-200" style={{ height: `${planned}%` }} />
                      <div className="w-2 rounded-t-full bg-orange-500" style={{ height: `${actual}%` }} />
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300" /> Planned</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> Actual</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-950">Delay heatmap</p>
                <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, index) => {
                  const hot = [3, 4, 10, 11, 12, 18, 19, 25, 26, 32].includes(index);
                  const warm = [6, 13, 17, 20, 24, 29, 30].includes(index);
                  return (
                    <div
                      key={index}
                      className={`aspect-square rounded-lg ${hot ? "bg-rose-500" : warm ? "bg-amber-400" : "bg-emerald-100"}`}
                      title={`Day ${index + 1}`}
                    />
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-3">
                <p className="text-xs font-semibold text-rose-950">Bottleneck indicator</p>
                <p className="mt-1 text-xs leading-5 text-rose-800">MEP drawing approval and material availability are driving critical path delay.</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Complete workflow" caption="From source data to published scorecards and action plans">
          <div className="space-y-3">
            {performanceWorkflowSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-sm font-semibold text-orange-700">{index + 1}</span>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Performance ranking scorecards"
        caption="Expandable entity table for project, site, contractor, vendor, manpower and employee scorecards"
        className={resourceTabPanelClass(performanceTab === "scorecards")}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[1160px] overflow-hidden rounded-2xl border border-slate-100">
            <div className="grid grid-cols-[1.25fr_120px_150px_130px_110px_90px_90px_110px_90px_80px_90px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
              <span>Name</span>
              <span>Type</span>
              <span>Owner</span>
              <span>Progress</span>
              <span>Schedule</span>
              <span>Quality</span>
              <span>Safety</span>
              <span>Productivity</span>
              <span>Delay</span>
              <span>Score</span>
              <span>Trend</span>
            </div>
            {performanceRows.map((row) => (
              <div key={row.name} className="grid grid-cols-[1.25fr_120px_150px_130px_110px_90px_90px_110px_90px_80px_90px] items-center gap-3 border-t border-slate-100 px-4 py-4 text-sm">
                <div>
                  <p className="font-medium text-slate-950">{row.name}</p>
                  <p className="mt-1 text-xs text-slate-400">Grade {row.grade}</p>
                </div>
                <span className="text-slate-600">{row.type}</span>
                <span className="text-slate-600">{row.owner}</span>
                <span className="text-slate-600">{row.progress}</span>
                <span className="text-slate-600">{row.schedule}</span>
                <span className="text-slate-600">{row.quality}</span>
                <span className="text-slate-600">{row.safety}</span>
                <span className="text-slate-600">{row.productivity}</span>
                <span>
                  <StatusBadge label={row.delay} tone={row.delay === "Low" ? "bg-emerald-50 text-emerald-700" : row.delay === "Medium" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"} />
                </span>
                <span className="font-semibold text-slate-950">{row.score}</span>
                <span className={row.trend.startsWith("-") ? "text-rose-600" : "text-emerald-600"}>{row.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className={resourceTabPanelClass(performanceTab === "project-site", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Project performance" caption="Execution tracking, schedule variance, delay risk and completion forecast">
          <div className="space-y-3">
            {projectPerformanceRows.map((row) => (
              <div key={row.metric} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.metric}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-800">{row.value}</p>
                  </div>
                  <StatusBadge label={row.signal} tone={row.signal === "High" ? "bg-rose-50 text-rose-700" : row.signal === "Watch" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{row.note}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Execution efficiency", "81"],
              ["Delay risk score", "High"],
              ["Schedule performance index", "0.94"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-orange-100 bg-orange-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-500">{label}</p>
                <p className="mt-2 text-lg font-semibold text-orange-950">{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Site performance" caption="Site productivity, discipline, delay score and efficiency ranking">
          <div className="overflow-x-auto">
            <div className="min-w-[720px] overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-[1.2fr_100px_100px_90px_90px_120px_80px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <span>Site</span>
                <span>Productivity</span>
                <span>Attendance</span>
                <span>Safety</span>
                <span>Issues</span>
                <span>Idle</span>
                <span>Rank</span>
              </div>
              {sitePerformanceRows.map((row) => (
                <div key={row.site} className="grid grid-cols-[1.2fr_100px_100px_90px_90px_120px_80px] gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-950">{row.site}</span>
                  <span>{row.productivity}</span>
                  <span>{row.attendance}</span>
                  <span>{row.safety}</span>
                  <span>{row.issues}</span>
                  <span>{row.idle}</span>
                  <span className="font-semibold text-slate-950">{row.ranking}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(performanceTab === "people-contractors", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Employee performance" caption="Attendance, task efficiency, productivity trend, goal achievement and monthly grade">
          <div className="space-y-3">
            {employeePerformanceRows.map((row) => (
              <div key={row.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.role}</p>
                  </div>
                  <StatusBadge label={`Grade ${row.grade}`} tone={row.grade.startsWith("A") ? "bg-emerald-50 text-emerald-700" : row.grade.startsWith("B") ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"} />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs md:grid-cols-6">
                  {[
                    ["Attendance", row.attendance],
                    ["Tasks", row.tasks],
                    ["Delayed", row.delayed],
                    ["Quality", row.quality],
                    ["Productivity", row.productivity],
                    ["Trend", row.trend],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-white p-2">
                      <p className="text-[10px] uppercase text-slate-400">{label}</p>
                      <p className="mt-1 font-semibold text-slate-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Contractor performance" caption="Progress, delays, rework, quality, safety, reliability and watchlist flags">
          <div className="overflow-x-auto">
            <div className="min-w-[820px] overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-[1.2fr_80px_70px_80px_90px_80px_80px_90px_110px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <span>Contractor</span>
                <span>Progress</span>
                <span>Delay</span>
                <span>Rework</span>
                <span>Labour</span>
                <span>Quality</span>
                <span>Safety</span>
                <span>Reliability</span>
                <span>Flag</span>
              </div>
              {contractorPerformanceRows.map((row) => (
                <div key={row.contractor} className="grid grid-cols-[1.2fr_80px_70px_80px_90px_80px_80px_90px_110px] items-center gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-950">{row.contractor}</span>
                  <span>{row.progress}</span>
                  <span>{row.delay}</span>
                  <span>{row.rework}</span>
                  <span>{row.labour}</span>
                  <span>{row.quality}</span>
                  <span>{row.safety}</span>
                  <span>{row.reliability}</span>
                  <StatusBadge label={row.flag} tone={row.flag === "Preferred" ? "bg-emerald-50 text-emerald-700" : row.flag === "Stable" ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700"} />
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Task performance and delay analysis"
        caption="Timeline visualization, critical task highlights, delay reasons and root cause analytics"
        className={resourceTabPanelClass(performanceTab === "tasks-delays")}
      >
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="overflow-x-auto">
            <div className="min-w-[920px] overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-[1.3fr_90px_90px_100px_80px_140px_90px_90px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <span>Task</span>
                <span>Planned</span>
                <span>Actual</span>
                <span>Complete</span>
                <span>Delay</span>
                <span>Dependency</span>
                <span>Impact</span>
                <span>Forecast</span>
              </div>
              {taskPerformanceRows.map((row) => (
                <div key={row.task} className="grid grid-cols-[1.3fr_90px_90px_100px_80px_140px_90px_90px] items-center gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-950">{row.task}</span>
                  <span>{row.planned}</span>
                  <span>{row.actual}</span>
                  <span>{row.completion}</span>
                  <span>{row.delay}</span>
                  <span>{row.dependency}</span>
                  <StatusBadge label={row.impact} tone={row.impact === "Critical" ? "bg-rose-50 text-rose-700" : row.impact === "High" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"} />
                  <span>{row.forecast}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {delayReasonRows.map((row) => (
              <div key={row.reason} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.reason}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.count} events · {row.duration} · {row.owner}</p>
                  </div>
                  <StatusBadge label={row.criticality} tone={row.criticality === "High" ? "bg-rose-50 text-rose-700" : row.criticality === "Medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} />
                </div>
                <p className="mt-2 text-xs text-slate-600">Recovery: {row.recovery}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <div className={resourceTabPanelClass(performanceTab === "quality-resources", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Quality and safety performance" caption="Inspection, NCR, rework, PPE, violations, near misses and audit scores">
          <div className="grid gap-3 md:grid-cols-2">
            {qualitySafetyRows.map((row) => (
              <div key={`${row.area}-${row.metric}`} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <StatusBadge label={row.area} tone={row.area === "Quality" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"} />
                  <StatusBadge label={row.risk} tone={row.risk === "Watch" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"} />
                </div>
                <p className="text-sm font-semibold text-slate-950">{row.metric}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{row.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{row.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Productivity and resource performance" caption="Labour productivity, equipment utilization, idle time, material wastage and output vs manpower">
          <div className="space-y-3">
            {resourcePerformanceRows.map((row) => (
              <div key={row.resource} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.resource}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.productivity}</p>
                  </div>
                  <StatusBadge label={row.output} tone={row.output.includes("Behind") || row.output.includes("Below") ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-slate-50 p-2">
                    <p className="text-slate-400">Utilization</p>
                    <p className="font-semibold text-slate-950">{row.utilization}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-2">
                    <p className="text-slate-400">Idle</p>
                    <p className="font-semibold text-slate-950">{row.idle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(performanceTab === "engine-alerts", "grid gap-5 xl:grid-cols-[0.9fr_1.1fr]")}>
        <SectionCard title="Scorecard engine" caption="Configurable weighted score formula, grade, risk status and ranking">
          <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-500">Formula</p>
            <p className="mt-2 text-sm leading-6 text-orange-950">Final Performance Score = Sum(KPI score x configured weight)</p>
            <p className="mt-3 rounded-2xl bg-white px-3 py-3 text-sm font-semibold text-slate-950">Current score: 82 / 100 · Grade B+ · Risk Watch</p>
          </div>
          <div className="mt-4 space-y-3">
            {scorecardWeights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-3">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-950">{item.label}</span>
                  <span className="text-slate-500">{item.weight}% weight · score {item.score}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-orange-500" style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Alerts and smart recommendations" caption="Dashboard warnings, email alerts and in-app notifications">
          <div className="grid gap-3 md:grid-cols-2">
            {performanceAlerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  <StatusBadge label={alert.severity} tone={alert.severity === "Critical" ? "bg-rose-50 text-rose-700" : alert.severity === "Warning" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"} />
                </div>
                <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{alert.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4 text-xs leading-5 text-slate-600">
            Notification logic: trigger alerts when score drops below threshold, critical milestone slips, safety violation is logged, rework spikes, attendance drops, equipment idle exceeds target or contractor reliability falls into watchlist.
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(performanceTab === "reports-admin", "grid gap-5 xl:grid-cols-[1fr_1fr_1fr]")}>
        <SectionCard title="Reports and exports" caption="PDF, Excel and printable performance dashboards">
          <div className="flex flex-wrap gap-2">
            {performanceReports.map((report) => (
              <StatusBadge key={report} label={report} tone="bg-slate-50 text-slate-700" />
            ))}
          </div>
          <div className="mt-4 grid gap-3">
            {["PDF export", "Excel export", "Printable dashboard", "Weekly summary mailer", "Monthly management pack"].map((exportType) => (
              <div key={exportType} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-600">{exportType}</div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Permissions, lifecycle and validations" caption="Approval flows when KPI overrides or published scorecards change">
          <div className="space-y-3">
            {performancePermissions.map((permission) => (
              <div key={permission.role} className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-sm font-semibold text-slate-950">{permission.role}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{permission.access}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {performanceLifecycle.map((status) => (
              <StatusBadge key={status} label={status} tone="bg-orange-50 text-orange-700" />
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {performanceValidations.map((validation) => (
              <div key={validation} className="flex gap-2 text-xs leading-5 text-slate-600">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-600" />
                <span>{validation}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tables, APIs and integrations" caption="Suggested implementation structure for the performance calculation engine">
          <div className="space-y-3">
            {performanceTables.map((row) => (
              <div key={row.table} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-950">{row.table}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{row.columns}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {performanceApiSuggestions.map((api) => (
              <code key={api} className="block rounded-xl bg-slate-950 px-3 py-2 text-[11px] text-white">{api}</code>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {performanceIntegrations.map((integration) => (
              <StatusBadge key={integration} label={integration} tone="bg-white text-slate-600" />
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        title="Audit trail and advanced analytics"
        caption="KPI changes, recalculation history, overrides, forecasting and AI-generated insights"
        className={resourceTabPanelClass(performanceTab === "audit")}
      >
        <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            {performanceAuditRows.map((row) => (
              <div key={`${row.action}-${row.time}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">{row.action}</p>
                  <p className="text-[10px] text-slate-400">{row.time}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">{row.actor}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.detail}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {[
              "Trend forecasting predicts 8-day schedule slip without recovery.",
              "Delay prediction flags MEP first-fix as high risk.",
              "Productivity forecasting expects labour output recovery if material availability improves.",
              "Benchmarking shows Civil Core Team is 11% above site average.",
              "AI insight: Contractor delay risk is high due to approval and manpower variance.",
              "Smart recommendation: add night shift for cable tray scope for 5 days.",
            ].map((insight) => (
              <div key={insight} className="rounded-2xl border border-orange-100 bg-orange-50 p-4 text-xs leading-5 text-orange-900">
                {insight}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function ComplianceSection() {
  const [complianceTab, setComplianceTab] = useState<ComplianceTab>("overview");
  const activeComplianceTab = complianceTabs.find((tab) => tab.key === complianceTab) ?? complianceTabs[0];

  return (
    <div className="space-y-5">
      <SectionCard
        title="Compliance module"
        caption={activeComplianceTab.caption}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {["All projects", "All sites", "All contractors", "All document types", "All risk levels"].map((filter) => (
              <ResourceSelect key={filter} defaultValue={filter}>
                <option>{filter}</option>
                <option>Downtown Tower</option>
                <option>Tech Park Phase 2</option>
                <option>Expired</option>
                <option>High risk</option>
              </ResourceSelect>
            ))}
          </div>
        }
      >
        <ResourceTabStrip tabs={complianceTabs} activeKey={complianceTab} onChange={setComplianceTab} />
      </SectionCard>

      <SectionCard
        title="Compliance dashboard"
        caption="Operational compliance, documentation, approvals, audits, safety and regulatory tracking. Finance accounting, billing, taxation and payments are excluded."
        className={resourceTabPanelClass(complianceTab === "overview")}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {complianceDashboardMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${metric.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-300" />
                </div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{metric.value}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{metric.note}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {complianceKpiCards.map((kpi) => (
            <div key={kpi.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-950/[0.03]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{kpi.label}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">{kpi.value}</p>
                </div>
                <StatusBadge label={kpi.status} tone={kpi.tone} />
              </div>
              <div className="mt-4 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-teal-500" style={{ width: `${kpi.width}%` }} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className={resourceTabPanelClass(complianceTab === "overview", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Workflow and risk heatmap" caption="Compliance lifecycle from checklist to renewal, escalation and scorecard">
          <div className="space-y-3">
            {complianceWorkflowSteps.map((step, index) => (
              <div key={step} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-semibold text-teal-700">{index + 1}</span>
                <p className="text-sm leading-6 text-slate-700">{step}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Expiry calendar and trend" caption="Expiry countdowns, auto-reminders and site-wise risk concentration">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => {
              const critical = [2, 5, 12, 19, 26].includes(index);
              const warning = [7, 8, 15, 21, 28, 31].includes(index);
              return <div key={index} className={`aspect-square rounded-lg ${critical ? "bg-rose-500" : warning ? "bg-amber-400" : "bg-emerald-100"}`} />;
            })}
          </div>
          <div className="mt-4 flex h-40 items-end gap-2 rounded-2xl bg-slate-50 p-4">
            {[82, 84, 86, 83, 89, 91, 92].map((value, index) => (
              <div key={`${value}-${index}`} className="flex-1 rounded-t-full bg-teal-500" style={{ height: `${value}%` }} />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(complianceTab === "documents-expiry", "grid gap-5 xl:grid-cols-[1.2fr_0.8fr]")}>
        <SectionCard title="Document compliance" caption="Licenses, certificates, registrations, approvals and verification status">
          <div className="overflow-x-auto">
            <div className="min-w-[980px] overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-[1.1fr_130px_1fr_100px_100px_130px_120px_80px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <span>Document</span><span>No.</span><span>Linked entity</span><span>Issue</span><span>Expiry</span><span>Authority</span><span>Status</span><span>Risk</span>
              </div>
              {complianceDocumentRows.map((row) => (
                <div key={row.number} className="grid grid-cols-[1.1fr_130px_1fr_100px_100px_130px_120px_80px] items-center gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-950">{row.document}</span><span>{row.number}</span><span>{row.entity}</span><span>{row.issue}</span><span>{row.expiry}</span><span>{row.authority}</span>
                  <StatusBadge label={row.status} tone={row.status === "Expired" ? "bg-rose-50 text-rose-700" : row.status === "Expiring Soon" ? "bg-amber-50 text-amber-700" : row.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-sky-50 text-sky-700"} />
                  <span>{row.risk}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Expiry management" caption="90, 30, 7 day reminders, renewal approval and access blocking">
          <div className="space-y-3">
            {complianceExpiryRows.map((row) => (
              <div key={row.item} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.item}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.entity} · {row.days}</p>
                  </div>
                  <StatusBadge label={row.level} tone={row.level === "Critical" ? "bg-rose-50 text-rose-700" : row.level === "High" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.action}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(complianceTab === "contractor-labour", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Contractor compliance" caption="Licenses, insurance, labour registration, safety records and site eligibility">
          <div className="space-y-3">
            {contractorComplianceRows.map((row) => (
              <div key={row.contractor} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.contractor}</p>
                    <p className="mt-1 text-xs text-slate-500">Docs {row.docs} · Violations {row.violations}</p>
                  </div>
                  <StatusBadge label={row.eligibility} tone={row.eligibility === "Allowed" ? "bg-emerald-50 text-emerald-700" : row.eligibility === "Restricted" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"} />
                </div>
                <div className="mt-3 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-teal-500" style={{ width: `${row.score}%` }} /></div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Labour and employee compliance" caption="ID, skill certificates, training, medical, PF/ESI, induction and PPE">
          <div className="overflow-x-auto">
            <div className="min-w-[760px] overflow-hidden rounded-2xl border border-slate-100">
              <div className="grid grid-cols-[1fr_90px_90px_90px_90px_100px_100px_90px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <span>Person</span><span>Type</span><span>ID</span><span>Training</span><span>Medical</span><span>PF/ESI</span><span>Induction</span><span>Eligibility</span>
              </div>
              {labourComplianceRows.map((row) => (
                <div key={row.employee} className="grid grid-cols-[1fr_90px_90px_90px_90px_100px_100px_90px] gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-950">{row.employee}</span><span>{row.type}</span><span>{row.id}</span><span>{row.training}</span><span>{row.medical}</span><span>{row.pfEsi}</span><span>{row.induction}</span><span>{row.eligibility}</span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(complianceTab === "safety-equipment", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Safety compliance" caption="PPE, toolbox talks, training, incidents, observations and fire checks">
          <div className="grid gap-3 md:grid-cols-2">
            {safetyComplianceRows.map((row) => (
              <div key={row.metric} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                <StatusBadge label={row.risk} tone={row.risk === "Green" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"} />
                <p className="mt-4 text-sm font-semibold text-slate-950">{row.metric}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{row.value}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{row.note}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Equipment and material compliance" caption="Fitness, calibration, operator licenses, MTCs, batch approvals and QC reports">
          <div className="space-y-3">
            {equipmentMaterialComplianceRows.map((row) => (
              <div key={row.item} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.item}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.type} · {row.certificate}</p>
                  </div>
                  <StatusBadge label={row.status} tone={row.status === "Active" ? "bg-emerald-50 text-emerald-700" : row.status === "Expiring Soon" ? "bg-amber-50 text-amber-700" : "bg-sky-50 text-sky-700"} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.action}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(complianceTab === "permits-inspections", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Permit management" caption="Hot work, height work, excavation, electrical, confined space, lifting and environmental permits">
          <div className="space-y-3">
            {permitRows.map((row) => (
              <div key={`${row.permit}-${row.linked}`} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.permit}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.site} · {row.linked} · Validity {row.validity}</p>
                  </div>
                  <StatusBadge label={row.status} tone={row.status === "Active" || row.status === "Approved" ? "bg-emerald-50 text-emerald-700" : row.status === "Expired" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"} />
                </div>
                <p className="mt-2 text-xs text-slate-600">Approved by: {row.approvedBy}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Inspection management" caption="Checklists, findings, severity, images, CAPA owner and closure dates">
          <div className="space-y-3">
            {inspectionRows.map((row) => (
              <div key={`${row.inspection}-${row.date}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.inspection}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.inspector} · {row.date} · Findings {row.findings}</p>
                  </div>
                  <StatusBadge label={row.severity} tone={row.severity === "High" ? "bg-rose-50 text-rose-700" : row.severity === "Medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.action} · Owner {row.owner} · Closure {row.closure}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(complianceTab === "audits-violations", "grid gap-5 xl:grid-cols-[1fr_1fr]")}>
        <SectionCard title="Audit management" caption="Internal, safety, quality, labour, compliance and external audit workflows">
          <div className="space-y-3">
            {auditRows.map((row) => (
              <div key={row.audit} className="rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.audit}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.schedule} · Findings {row.findings} · NCR {row.ncr} · {row.capa}</p>
                  </div>
                  <StatusBadge label={row.rating} tone="bg-teal-50 text-teal-700" />
                </div>
                <p className="mt-2 text-xs text-slate-600">Owner: {row.owner}</p>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="NCR and violation management" caption="Violation type, severity, corrective action, due date, closure and evidence">
          <div className="space-y-3">
            {violationRows.map((row) => (
              <div key={`${row.type}-${row.party}`} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{row.type}</p>
                    <p className="mt-1 text-xs text-slate-500">{row.party} · Due {row.due}</p>
                  </div>
                  <StatusBadge label={row.severity} tone={row.severity === "Critical" || row.severity === "High" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"} />
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.action} · Status {row.status}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(complianceTab === "scorecards", "grid gap-5 xl:grid-cols-[0.9fr_1.1fr]")}>
        <SectionCard title="Compliance scorecard engine" caption="Configurable weights, score out of 100, ranking and red/amber/green status">
          <div className="rounded-3xl border border-teal-100 bg-teal-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-600">Formula</p>
            <p className="mt-2 text-sm leading-6 text-teal-950">Compliance Score = Sum(category score x configured weight)</p>
            <p className="mt-3 rounded-2xl bg-white px-3 py-3 text-sm font-semibold text-slate-950">Current score: 92 / 100 · Green · Site rank #2</p>
          </div>
          <div className="mt-4 space-y-3">
            {complianceScoreWeights.map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-100 bg-white p-3">
                <div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium text-slate-950">{item.label}</span><span className="text-slate-500">{item.weight}% · score {item.score}</span></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-teal-500" style={{ width: `${item.score}%` }} /></div>
              </div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Alerts and smart predictions" caption="Expiry, missing document, repeat violation and risk prediction">
          <div className="grid gap-3 md:grid-cols-2">
            {complianceAlerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <Sparkles className="h-4 w-4 text-teal-600" />
                  <StatusBadge label={alert.severity} tone={alert.severity === "Critical" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"} />
                </div>
                <p className="text-sm font-semibold text-slate-950">{alert.title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{alert.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className={resourceTabPanelClass(complianceTab === "reports-admin", "grid gap-5 xl:grid-cols-[1fr_1fr_1fr]")}>
        <SectionCard title="Reports and exports" caption="PDF, Excel and printable compliance reports">
          <div className="flex flex-wrap gap-2">
            {complianceReports.map((report) => <StatusBadge key={report} label={report} tone="bg-slate-50 text-slate-700" />)}
          </div>
        </SectionCard>
        <SectionCard title="Permissions and validations" caption="Role access, waiver rules and blocking validations">
          <div className="space-y-3">
            {compliancePermissions.map((row) => (
              <div key={row.role} className="rounded-2xl border border-slate-100 bg-white p-3">
                <p className="text-sm font-semibold text-slate-950">{row.role}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{row.access}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {complianceValidations.map((validation) => (
              <div key={validation} className="flex gap-2 text-xs leading-5 text-slate-600"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600" /><span>{validation}</span></div>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Tables, APIs, integrations and audit" caption="Implementation structure and complete history logs">
          <div className="space-y-3">
            {complianceTables.map((row) => (
              <div key={row.table} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-950">{row.table}</p>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{row.columns}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {complianceApiSuggestions.map((api) => <code key={api} className="block rounded-xl bg-slate-950 px-3 py-2 text-[11px] text-white">{api}</code>)}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {complianceIntegrations.map((integration) => <StatusBadge key={integration} label={integration} tone="bg-white text-slate-600" />)}
          </div>
          <div className="mt-4 space-y-3">
            {complianceAuditRows.map((row) => (
              <div key={`${row.action}-${row.time}`} className="rounded-2xl border border-slate-100 bg-white p-3">
                <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-950">{row.action}</p><p className="text-[10px] text-slate-400">{row.time}</p></div>
                <p className="mt-1 text-xs text-slate-500">{row.actor}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{row.detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function ResourceNavigation({
  activeSection,
  onSectionChange,
}: {
  activeSection: ResourceSection;
  onSectionChange: (section: ResourceSection) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {(Object.keys(resourceSectionMeta) as ResourceSection[]).map((section) => {
        const meta = resourceSectionMeta[section];
        const Icon = meta.icon;
        const active = activeSection === section;

        return (
          <button
            key={section}
            type="button"
            onClick={() => onSectionChange(section)}
            className={`group rounded-[24px] border p-4 text-left transition-all ${active
              ? `${meta.tint} shadow-md shadow-slate-950/5`
              : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md hover:shadow-slate-950/5"
              }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${meta.tint}`}>
                <Icon className={`h-5 w-5 ${meta.accent}`} />
              </div>
              <span className="text-xs text-slate-400">{meta.count}</span>
            </div>
            <h3 className="text-base text-slate-950">{meta.label}</h3>
            <p className="mt-1 text-sm text-slate-500">{meta.subtitle}</p>
          </button>
        );
      })}
    </div>
  );
}

function ResourceProjectHeader({
  selectedProject,
  onProjectChange,
  myProjects,
  sharedProjects,
  action,
}: {
  selectedProject: string;
  onProjectChange: (project: string) => void;
  myProjects: string[];
  sharedProjects: string[];
  action?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"my" | "shared">("my");
  const visibleProjects = tab === "my" ? myProjects : sharedProjects;

  return (
    <div className="sticky top-0 z-40 -mx-1 border-b border-slate-100 bg-white/90 px-1 py-1.5 backdrop-blur-xl">
      <div className="flex min-h-9 flex-wrap items-center gap-2">
        <div className="relative inline-flex">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="group inline-flex items-center gap-2 rounded-xl px-1 py-0.5 transition hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/15">
              <Activity className="h-4 w-4" />
            </span>
            <span className="max-w-[320px] truncate text-sm font-medium text-slate-950">{selectedProject}</span>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute left-9 top-10 z-50 w-[318px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15">
              <ResourceTabStrip
                className="mb-2"
                tabs={[
                  { key: "my", label: "My Projects" },
                  { key: "shared", label: "Shared" },
                ]}
                activeKey={tab}
                onChange={setTab}
              />
              <div className="max-h-[280px] overflow-y-auto py-1">
                {visibleProjects.map((project) => (
                  <button
                    key={project}
                    type="button"
                    onClick={() => {
                      onProjectChange(project);
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                  >
                    <span>{project}</span>
                    {selectedProject === project && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        {action ? <div className="ml-auto shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

function ResourceLinkedContextBar({
  activeSection,
  selectedView,
  onViewChange,
  onSectionChange,
}: {
  activeSection: ResourceSection;
  selectedView: ResourceViewMode;
  onViewChange: (view: ResourceViewMode) => void;
  onSectionChange: (section: ResourceSection) => void;
}) {
  const [lastFlowCheck, setLastFlowCheck] = useState("Not run");
  const [isTestingOpen, setTestingOpen] = useState(false);
  const profile = resourceViewProfiles[selectedView];
  const activeFlow = linkedResourceRecord.flow[activeSection];
  const activeLink = resourceModuleFlowLinks[activeSection];
  const moduleOrder: ResourceSection[] = ["organization", "workforce", "teams", "attendance", "access-control", "allocation", "payroll", "performance", "compliance"];
  const activeIndex = moduleOrder.indexOf(activeSection);
  const permittedCount = moduleOrder.filter((section) => profile.allowed.includes(section)).length;
  const activeAudit = resourceFlowAuditTrail.filter((item) => item.section === activeSection);
  const sourceSection = [...activeLink.inputFrom].reverse().find((section) => profile.allowed.includes(section));
  const nextSection = activeLink.outputTo.find((section) => profile.allowed.includes(section)) ?? moduleOrder.slice(activeIndex + 1).find((section) => profile.allowed.includes(section));
  const runFlowCheck = () => {
    const hasIdentity = linkedResourceRecord.employeeId.length > 0;
    const hasRecord = activeLink.recordId.length > 0;
    const hasChecks = activeLink.checks.length > 0;
    const hasPermission = profile.allowed.includes(activeSection);
    const status = hasIdentity && hasRecord && hasChecks && hasPermission ? "Passed" : "Needs review";
    setLastFlowCheck(`${status} · ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 shadow-sm shadow-slate-950/5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">Temporary linked flow</span>
            <span className="text-xs font-medium text-slate-950">{linkedResourceRecord.employee} · {linkedResourceRecord.employeeId}</span>
            <span className="text-xs text-slate-500">{linkedResourceRecord.team} · {linkedResourceRecord.site}</span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {profile.role}: {profile.scope}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTestingOpen(true)}
            className="h-8 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
          >
            Test flow
          </button>
          {(Object.keys(resourceViewProfiles) as ResourceViewMode[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => onViewChange(view)}
              className={`h-8 rounded-lg px-3 text-xs font-medium transition ${selectedView === view ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                }`}
            >
              {resourceViewProfiles[view].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {moduleOrder.map((section, index) => {
            const meta = resourceSectionMeta[section];
            const isAllowed = profile.allowed.includes(section);
            const isActive = activeSection === section;
            const link = resourceModuleFlowLinks[section];
            return (
              <button
                key={section}
                type="button"
                onClick={() => isAllowed && onSectionChange(section)}
                disabled={!isAllowed}
                className={`min-w-max rounded-xl border px-3 py-2 text-left transition ${isActive
                  ? "border-blue-200 bg-blue-50 text-blue-800"
                  : isAllowed
                    ? "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                    : "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
                  }`}
              >
                <span className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${isActive ? "bg-blue-600 text-white" : "bg-white text-slate-500"}`}>{index + 1}</span>
                  {meta.label}
                </span>
                <span className="mt-0.5 block text-[10px] opacity-70">{linkedResourceRecord.flow[section].status} · {link.recordId}</span>
              </button>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Current module link</span>
            <StatusBadge label={activeFlow.status} tone="bg-white text-slate-700" />
          </div>
          <p className="mt-1 text-xs font-medium text-slate-950">{resourceSectionMeta[activeSection].label} · Owner: {activeFlow.owner}</p>
          <p className="mt-1 text-xs text-slate-500">{activeFlow.detail}</p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-[1fr_1fr_1fr]">
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Dependency handoff</p>
            <span className="text-[10px] text-slate-500">Step {activeIndex + 1} / {moduleOrder.length}</span>
          </div>
          <div className="mt-2 grid gap-2">
            <div>
              <p className="text-[10px] font-medium text-slate-400">Input from</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(activeLink.inputFrom.length ? activeLink.inputFrom : ["organization" as ResourceSection]).map((section) => (
                  <StatusBadge key={`input-${section}`} label={activeLink.inputFrom.length ? resourceSectionMeta[section].label : "Start point"} tone="bg-white text-slate-600" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-medium text-slate-400">Output to</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(activeLink.outputTo.length ? activeLink.outputTo : ["payroll" as ResourceSection]).map((section) => (
                  <StatusBadge key={`output-${section}`} label={activeLink.outputTo.length ? resourceSectionMeta[section].label : "Final handoff"} tone="bg-white text-slate-600" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Data objects and checks</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {activeLink.dataObjects.slice(0, 4).map((item) => (
              <StatusBadge key={item} label={item} tone="bg-white text-slate-600" />
            ))}
          </div>
          <div className="mt-2 space-y-1">
            {activeLink.checks.slice(0, 2).map((check) => (
              <div key={check} className="flex gap-1.5 text-[11px] leading-4 text-slate-600">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-600" />
                <span>{check}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Role + next action</p>
            <span className="text-[10px] text-slate-500">{permittedCount}/{moduleOrder.length} modules</span>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-950">{activeLink.nextAction}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {profile.actions.slice(0, 3).map((action) => (
              <StatusBadge key={action} label={action} tone="bg-white text-slate-600" />
            ))}
          </div>
        </div>
      </div>

      {isTestingOpen && (
        <div className="fixed inset-0 z-[90] bg-slate-950/20 backdrop-blur-[2px]" onClick={() => setTestingOpen(false)}>
          <div
            className="mx-auto mt-0 w-full max-w-6xl animate-in slide-in-from-top-6 fade-in duration-200 rounded-b-3xl border border-t-0 border-blue-100 bg-white p-4 shadow-2xl shadow-slate-950/20"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-blue-600">Resource flow testing</p>
                <h3 className="mt-1 text-base font-semibold text-slate-950">{resourceSectionMeta[activeSection].label} interlink check</h3>
                <p className="mt-1 text-xs text-slate-500">Testing panel is separated from the main resource flow and opens from the top.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={runFlowCheck}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Run check
                </button>
                <button
                  type="button"
                  onClick={() => setTestingOpen(false)}
                  className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:border-slate-300"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Hardcore flow check</p>
                    <p className="mt-1 text-[10px] text-slate-500">Last check: {lastFlowCheck}</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {[
                    ["Identity", `${linkedResourceRecord.employeeId} is active in workforce and org hierarchy`],
                    ["Eligibility", "Compliance and access are valid before allocation"],
                    ["Payroll gate", "Payroll waits for locked attendance and active salary setup"],
                  ].map(([label, detail]) => (
                    <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[10px] font-medium text-slate-500">{label}</p>
                      <p className="mt-1 text-[11px] leading-4 text-slate-700">{detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Latest linked events</p>
                  <div className="flex flex-wrap gap-1.5">
                    {sourceSection && (
                      <button type="button" onClick={() => { onSectionChange(sourceSection); setTestingOpen(false); }} className="h-7 rounded-lg border border-blue-100 bg-blue-50 px-2 text-[10px] font-medium text-blue-700 hover:bg-blue-100">
                        Open source
                      </button>
                    )}
                    {nextSection && (
                      <button type="button" onClick={() => { onSectionChange(nextSection); setTestingOpen(false); }} className="h-7 rounded-lg bg-blue-600 px-2 text-[10px] font-medium text-white hover:bg-blue-700">
                        Continue flow
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2 space-y-1.5">
                  {(activeAudit.length ? activeAudit : resourceFlowAuditTrail.slice(-2)).map((item) => (
                    <div key={`${item.section}-${item.event}`} className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-[11px] font-medium text-slate-950">{item.event} · {item.actor}</p>
                      <p className="mt-0.5 text-[10px] leading-4 text-slate-500">{item.result}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderMainSection(activeSection: ResourceSection, workforceAddSignal: number) {
  if (activeSection === "organization") return <OrganizationStructureMain />;
  if (activeSection === "workforce") return <WorkforceSection addEmployeeSignal={workforceAddSignal} />;
  if (activeSection === "teams") return <TeamsSection />;
  if (activeSection === "attendance") return <AttendanceSection />;
  if (activeSection === "access-control") return <AccessSection />;
  if (activeSection === "allocation") return <AllocationSection />;
  if (activeSection === "payroll") return <PayrollSection />;
  if (activeSection === "performance") return <PerformanceSection />;
  return <ComplianceSection />;
}

export function ResourcesWorkspace({
  activeSection,
  onSectionChange,
  selectedProject,
  onProjectChange,
  myProjects,
  sharedProjects,
}: ResourcesWorkspaceProps) {
  const [workforceAddSignal, setWorkforceAddSignal] = useState(0);
  const [resourceViewMode, setResourceViewMode] = useState<ResourceViewMode>("admin");
  const selectedProfile = resourceViewProfiles[resourceViewMode];

  useEffect(() => {
    if (!selectedProfile.allowed.includes(activeSection)) {
      onSectionChange(selectedProfile.allowed[0] ?? "workforce");
    }
  }, [activeSection, onSectionChange, selectedProfile.allowed]);

  return (
    <div className="space-y-3">
      <ResourceProjectHeader
        selectedProject={selectedProject}
        onProjectChange={onProjectChange}
        myProjects={myProjects}
        sharedProjects={sharedProjects}
        action={
          activeSection === "workforce" ? (
            <button
              type="button"
              onClick={() => setWorkforceAddSignal((current) => current + 1)}
              className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-medium text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Add employee
            </button>
          ) : null
        }

      />
      <ResourceLinkedContextBar
        activeSection={activeSection}
        selectedView={resourceViewMode}
        onViewChange={setResourceViewMode}
        onSectionChange={onSectionChange}
      />
      {renderMainSection(activeSection, workforceAddSignal)}
    </div>
  );
}
