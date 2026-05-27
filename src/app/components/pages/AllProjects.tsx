import { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  Users,
  DollarSign,
  LayoutGrid,
  List,
  Trash2,
  SlidersHorizontal,
  MapPin,
  CheckCircle,
  ExternalLink,
  HardHat,
  Sparkles,
  Box,
  Wrench,
  Activity,
  Layers,
  ChevronDown,
  Settings,
  UserPlus
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useSidebar } from "../../context/SidebarContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";

interface Project {
  id: string;
  name: string;
  phase: string;
  activePhases?: string[];
  location: string;
  progress: number;
  budget: string;
  team: number;
  startDate: string;
  endDate: string;
  status: "On Track" | "Delayed" | "Completed" | "active" | string;
  creator?: string;
  code?: string;
  role?: string;
  type?: string;
  createdOn?: string;
}

const initialProjects: Project[] = [
  {
    id: "p_1",
    name: "IITH",
    phase: "Construction",
    activePhases: ["Construction"],
    location: "Hyderabad, India",
    progress: 75,
    budget: "$5.2M",
    team: 1,
    startDate: "2025-10-15",
    endDate: "2026-08-15",
    status: "active",
    creator: "John Doe",
    code: "BIMBOXF05DE2",
    role: "member",
    type: "Demo",
    createdOn: "19 Feb 2026, 9:28 AM"
  },
  {
    id: "p_2",
    name: "STALWART SKY CITY",
    phase: "Pre-Construction",
    activePhases: ["Pre-Construction"],
    location: "Austin, TX",
    progress: 45,
    budget: "$3.8M",
    team: 1,
    startDate: "2026-01-20",
    endDate: "2026-06-30",
    status: "active",
    creator: "John Doe",
    code: "BIMBOX3F6315",
    role: "member",
    type: "Demo",
    createdOn: "17 Feb 2026, 5:35 PM"
  },
  {
    id: "p_3",
    name: "DTG",
    phase: "Construction",
    activePhases: ["Construction"],
    location: "Miami, FL",
    progress: 30,
    budget: "$8.5M",
    team: 1,
    startDate: "2025-12-01",
    endDate: "2026-09-20",
    status: "active",
    creator: "Snehasis Mohapatra",
    code: "BIMBOX7491D0",
    role: "Admin",
    type: "Project Management",
    createdOn: "21 May 2026, 10:48 AM"
  },
  {
    id: "p_4",
    name: "DFDF",
    phase: "Facility Management",
    activePhases: ["Facility Management"],
    location: "New York, NY",
    progress: 100,
    budget: "$2.1M",
    team: 1,
    startDate: "2025-06-10",
    endDate: "2026-04-10",
    status: "active",
    creator: "Snehasis Mohapatra",
    code: "BIMBOX74DB48",
    role: "Admin",
    type: "Project Management",
    createdOn: "20 May 2026, 10:57 AM"
  },
  {
    id: "p_5",
    name: "3RWE",
    phase: "Pre-Construction",
    activePhases: ["Pre-Construction"],
    location: "City Center",
    progress: 20,
    budget: "$12.3M",
    team: 1,
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    status: "active",
    creator: "Snehasis Mohapatra",
    code: "BIMBOXD4E161",
    role: "Admin",
    type: "Project Management",
    createdOn: "19 May 2026, 5:45 PM"
  },
  {
    id: "p_6",
    name: "ERTHJ",
    phase: "Facility Management",
    activePhases: ["Facility Management"],
    location: "Green Valley",
    progress: 90,
    budget: "$4.5M",
    team: 1,
    startDate: "2025-06-10",
    endDate: "2026-04-10",
    status: "active",
    creator: "Snehasis Mohapatra",
    code: "BIMBOX72B287",
    role: "Admin",
    type: "Project Management",
    createdOn: "11 May 2026, 12:44 PM"
  },
  {
    id: "p_7",
    name: "FGVSD",
    phase: "Construction",
    activePhases: ["Construction"],
    location: "Los Angeles, CA",
    progress: 50,
    budget: "$6.0M",
    team: 1,
    startDate: "2025-06-10",
    endDate: "2026-04-10",
    status: "active",
    creator: "Snehasis Mohapatra",
    code: "BIMBOXF6C351",
    role: "Admin",
    type: "Project Management",
    createdOn: "20 Apr 2026, 12:53 PM"
  },
  {
    id: "p_8",
    name: "ASDASDF",
    phase: "Pre-Construction",
    activePhases: ["Pre-Construction"],
    location: "Dallas, TX",
    progress: 10,
    budget: "$1.8M",
    team: 1,
    startDate: "2025-06-10",
    endDate: "2026-04-10",
    status: "active",
    creator: "Snehasis Mohapatra",
    code: "BIMBOXA4A89C",
    role: "Admin",
    type: "Project Management",
    createdOn: "07 Apr 2026, 5:08 PM"
  }
];

const PHASE_OPTIONS = [
  { label: "Pre-Construction", route: "/pre-construction" },
  { label: "Construction", route: "/construction" },
  { label: "Site Survey", route: "/site-survey" },
  { label: "BIM Migration", route: "/dashboard" },
  { label: "Interior Design", route: "/dashboard" },
  { label: "Facility Management", route: "/facility-management" },
];

function getProjectPath(phaseName: string) {
  const normalized = phaseName.trim().toLowerCase();
  if (normalized.includes("pre-construction") || normalized.includes("pre-con")) {
    return "/pre-construction";
  }
  if (normalized.includes("construction")) {
    return "/construction";
  }
  if (normalized.includes("survey") || normalized.includes("site-survey")) {
    return "/site-survey";
  }
  if (normalized.includes("facility") || normalized.includes("fac-mgmt")) {
    return "/facility-management";
  }
  if (normalized.includes("twin") || normalized.includes("digital-twin")) {
    return "/digital-twin";
  }
  return "/dashboard";
}

function ActionMenu({ onDelete, onLaunch }: { onDelete: (e: React.MouseEvent) => void; onLaunch: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-750 flex items-center justify-center"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 z-50 font-sans">
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onLaunch();
          }}
          className="font-bold text-blue-600 focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Launch Hub</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            alert("Project Settings opened");
          }}
          className="font-semibold text-slate-700 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-slate-450" />
          <span>Project Settings</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            alert("Invite members flow triggered");
          }}
          className="font-semibold text-slate-700 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5 text-slate-450" />
          <span>Invite Members</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={(e: any) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="font-bold text-red-650 focus:bg-red-50 focus:text-red-700 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
          <span>Delete Container</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const getInitials = (name: string) => {
  const clean = name.trim();
  if (!clean) return "BB";
  const parts = clean.split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return clean.slice(0, 2).toUpperCase();
};

export function AllProjects() {
  const navigate = useNavigate();
  const { setMode } = useSidebar();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [draftProject, setDraftProject] = useState({
    name: "",
    location: "",
    phase: "Construction",
    budget: "",
    team: "12",
    startDate: "2026-05-01",
    endDate: "2026-12-31",
  });

  // Sync projects with localStorage
  useEffect(() => {
    setMode("main");
    const stored = localStorage.getItem("bimbox_projects");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const normalized = parsed.map((p: any) => ({
            ...p,
            id: p.id ? String(p.id) : "p_" + Math.random(),
            phase: p.phase || (p.activePhases && p.activePhases[0]) || "Construction",
            budget: p.budget || "$2.5M",
            team: p.team || 1,
            startDate: p.startDate || new Date().toISOString().split("T")[0],
            endDate: p.endDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: p.status || "active",
            creator: p.creator || "Snehasis Mohapatra",
            code: p.code || "BIMBOX" + Math.random().toString(36).substr(2, 6).toUpperCase(),
            role: p.role || "Admin",
            type: p.type || "Project Management",
            createdOn: p.createdOn || "26 May 2026, 06:36 PM"
          }));
          setProjects(normalized);
        } else {
          setProjects(initialProjects);
          localStorage.setItem("bimbox_projects", JSON.stringify(initialProjects));
        }
      } catch (e) {
        setProjects(initialProjects);
      }
    } else {
      setProjects(initialProjects);
      localStorage.setItem("bimbox_projects", JSON.stringify(initialProjects));
    }
  }, [setMode]);

  // Filter projects logic
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchedPhase = filterPhase === "All" || 
        p.phase.toLowerCase().includes(filterPhase.toLowerCase()) || 
        (p.activePhases && p.activePhases.some(ap => ap.toLowerCase().includes(filterPhase.toLowerCase())));

      const matchedStatus = filterStatus === "All" || 
        p.status.toLowerCase() === filterStatus.toLowerCase() ||
        (filterStatus === "On Track" && p.status.toLowerCase() === "active");

      const query = searchQuery.trim().toLowerCase();
      const matchedSearch = query === "" ||
        p.name.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query)) ||
        (p.type && p.type.toLowerCase().includes(query)) ||
        (p.phase && p.phase.toLowerCase().includes(query));

      return matchedPhase && matchedStatus && matchedSearch;
    });
  }, [projects, filterPhase, filterStatus, searchQuery]);

  const handleLaunchProject = (project: Project) => {
    localStorage.setItem("active_project", JSON.stringify(project));
    const targetRoute = getProjectPath(project.phase);
    navigate(`${targetRoute}?project=${project.id}`);
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      const updated = projects.filter(p => p.id !== projectId);
      setProjects(updated);
      localStorage.setItem("bimbox_projects", JSON.stringify(updated));

      // Remove from active_project if deleted
      const activeStored = localStorage.getItem("active_project");
      if (activeStored) {
        try {
          const active = JSON.parse(activeStored);
          if (active.id === projectId) {
            localStorage.removeItem("active_project");
          }
        } catch (err) {}
      }
    }
  };

  const getStatusStyle = (status: string, progress: number) => {
    const isCompleted = status === "Completed" || progress === 100;
    const isDelayed = status === "Delayed";
    if (isCompleted) {
      return "border-emerald-100 bg-emerald-50 text-emerald-700";
    }
    if (isDelayed) {
      return "border-indigo-100 bg-indigo-50 text-indigo-700";
    }
    return "border-teal-100 bg-teal-50 text-teal-700";
  };

  const getStatusLabel = (status: string, progress: number) => {
    if (status === "Completed" || progress === 100) return "Completed";
    if (status === "Delayed") return "Delayed";
    if (status === "active" || status === "On Track") return "On Track";
    return status;
  };

  const handleCreateProject = () => {
    if (!draftProject.name.trim() || !draftProject.location.trim()) return;

    const teamSize = parseInt(draftProject.team, 10);
    const newProj: Project = {
      id: "p_" + Date.now(),
      name: draftProject.name.trim(),
      phase: draftProject.phase,
      activePhases: [draftProject.phase],
      location: draftProject.location.trim(),
      progress: 0,
      budget: draftProject.budget.trim() || "$1.5M",
      team: isNaN(teamSize) ? 8 : teamSize,
      startDate: draftProject.startDate,
      endDate: draftProject.endDate,
      status: "On Track",
    };

    const updated = [newProj, ...projects];
    setProjects(updated);
    localStorage.setItem("bimbox_projects", JSON.stringify(updated));
    setIsCreateOpen(false);
    
    // Clear draft
    setDraftProject({
      name: "",
      location: "",
      phase: "Construction",
      budget: "",
      team: "12",
      startDate: "2026-05-01",
      endDate: "2026-12-31",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 lg:p-5 select-none">
      
      {/* Space-efficient Compact Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-2">
          <h1 className="text-base font-extrabold text-slate-900 tracking-tight">All Projects</h1>
          <span className="text-[10px] font-bold text-slate-400">({projects.length} projects)</span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Create a new project</span>
        </button>
      </div>

      {/* Minimal Inline Controls Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 border border-slate-200 hover:border-slate-350 rounded-lg text-xs font-semibold text-slate-800 outline-hidden focus:border-blue-500 transition-all bg-white"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          
          {/* Custom Dropdown for Phase */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-200 rounded-lg text-[10px] font-extrabold text-slate-650 bg-white hover:border-slate-300 transition-colors cursor-pointer select-none">
                <span>{filterPhase === "All" ? "All Phases" : filterPhase}</span>
                <ChevronDown className="w-3 h-3 text-slate-450" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 z-50 font-sans">
              {[
                { value: "All", label: "All Phases" },
                { value: "Pre-Construction", label: "Pre-Construction" },
                { value: "Construction", label: "Construction" },
                { value: "Site Survey", label: "Site Survey" },
                { value: "Facility Management", label: "Facility Management" },
                { value: "Digital Twin", label: "Digital Twin" }
              ].map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setFilterPhase(opt.value)}
                  className={`cursor-pointer ${filterPhase === opt.value ? "bg-slate-50 font-extrabold text-blue-600" : "font-semibold text-slate-700"}`}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Custom Dropdown for Status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-200 rounded-lg text-[10px] font-extrabold text-slate-650 bg-white hover:border-slate-300 transition-colors cursor-pointer select-none">
                <span>{filterStatus === "All" ? "All Statuses" : filterStatus}</span>
                <ChevronDown className="w-3 h-3 text-slate-450" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 z-50 font-sans">
              {[
                { value: "All", label: "All Statuses" },
                { value: "On Track", label: "On Track" },
                { value: "Delayed", label: "Delayed" },
                { value: "Completed", label: "Completed" }
              ].map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => setFilterStatus(opt.value)}
                  className={`cursor-pointer ${filterStatus === opt.value ? "bg-slate-50 font-extrabold text-blue-600" : "font-semibold text-slate-700"}`}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* List View Mode (Professional Data Table) */}
      <div className="overflow-hidden bg-white border border-slate-100 rounded-2xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-slate-650">
            <thead>
              <tr className="border-b border-slate-100 bg-white text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">
                  <div className="flex items-center gap-1 cursor-pointer select-none hover:text-slate-600">
                    <span>Project Type</span>
                    <span className="text-[9px]">⇅</span>
                  </div>
                </th>
                <th className="px-6 py-4">Project Code</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Total Members</th>
                <th className="px-6 py-4">Created on</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredProjects.map((p) => {
                const initials = getInitials(p.name);
                const isDemo = p.type === "Demo";
                return (
                  <tr
                    key={p.id}
                    onClick={() => handleLaunchProject(p)}
                    className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  >
                    {/* Name Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-[12px] text-slate-800 tracking-tight leading-snug uppercase">
                            {p.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                            Created by {p.creator || "Snehasis Mohapatra"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Project Type */}
                    <td className="px-6 py-4">
                      {isDemo ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-bold">
                          Demo
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[9px] font-bold">
                          Project Management
                        </span>
                      )}
                    </td>

                    {/* Project Code */}
                    <td className="px-6 py-4 font-mono text-[10px] text-slate-500 font-bold">
                      {p.code || "BIMBOX" + p.id.toUpperCase().replace("P_", "")}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className="text-emerald-500 font-bold">
                        {p.status || "active"}
                      </span>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 font-semibold text-slate-650">
                      {p.role || "Admin"}
                    </td>

                    {/* Total Members */}
                    <td className="px-6 py-4 font-semibold text-slate-650">
                      {p.team || 1}
                    </td>

                    {/* Created On */}
                    <td className="px-6 py-4 font-semibold text-slate-500">
                      {p.createdOn || "19 Feb 2026, 9:28 AM"}
                    </td>

                    {/* Action menu */}
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end">
                        <ActionMenu 
                          onDelete={(e) => handleDeleteProject(p.id, e)}
                          onLaunch={() => handleLaunchProject(p)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300/80 p-12 text-center text-slate-400 font-bold text-xs mt-6">
          No workspace containers match the selected filters or search queries.
        </div>
      )}

      {/* Create Project Modal Container */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-6 select-none">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Create New Project</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-semibold mt-1">
              Initialize a new project workspace environment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 mt-3">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Project Name</label>
              <Input
                placeholder="e.g. Skyline Heights Complex"
                value={draftProject.name}
                onChange={(e) => setDraftProject((current) => ({ ...current, name: e.target.value }))}
                className="mt-1 text-xs font-semibold"
              />
            </div>
            
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location</label>
              <Input
                placeholder="e.g. Austin, TX"
                value={draftProject.location}
                onChange={(e) => setDraftProject((current) => ({ ...current, location: e.target.value }))}
                className="mt-1 text-xs font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-semibold">Primary Stage</label>
                <select
                  value={draftProject.phase}
                  onChange={(e) => setDraftProject((current) => ({ ...current, phase: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/10 mt-1 cursor-pointer bg-white"
                >
                  <option value="Pre-Construction">Pre-Construction</option>
                  <option value="Construction">Construction</option>
                  <option value="Site Survey">Site Survey</option>
                  <option value="BIM Migration">BIM Migration</option>
                  <option value="Facility Management">Facility Management</option>
                  <option value="Digital Twin">Digital Twin</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Budget Allocated</label>
                <Input
                  placeholder="e.g. $4.5M"
                  value={draftProject.budget}
                  onChange={(e) => setDraftProject((current) => ({ ...current, budget: e.target.value }))}
                  className="mt-1 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Team Size</label>
                <Input
                  placeholder="e.g. 15"
                  value={draftProject.team}
                  onChange={(e) => setDraftProject((current) => ({ ...current, team: e.target.value }))}
                  className="mt-1 text-xs font-semibold"
                />
              </div>
              
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Start Date</label>
                <Input
                  type="date"
                  value={draftProject.startDate}
                  onChange={(e) => setDraftProject((current) => ({ ...current, startDate: e.target.value }))}
                  className="mt-1 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Target Date</label>
                <Input
                  type="date"
                  value={draftProject.endDate}
                  onChange={(e) => setDraftProject((current) => ({ ...current, endDate: e.target.value }))}
                  className="mt-1 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-full text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/10"
              >
                Deploy
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
