import { useEffect, useMemo, useState } from "react";
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
  Layers
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useSidebar } from "../../context/SidebarContext";

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
}

const initialProjects: Project[] = [
  {
    id: "p_1",
    name: "Downtown Tower Complex",
    phase: "Construction",
    activePhases: ["Construction"],
    location: "Downtown District",
    progress: 75,
    budget: "$5.2M",
    team: 45,
    startDate: "2025-10-15",
    endDate: "2026-08-15",
    status: "On Track",
  },
  {
    id: "p_2",
    name: "Riverside Residential",
    phase: "Pre-Construction",
    activePhases: ["Pre-Construction"],
    location: "Riverside Area",
    progress: 45,
    budget: "$3.8M",
    team: 28,
    startDate: "2026-01-20",
    endDate: "2026-06-30",
    status: "On Track",
  },
  {
    id: "p_3",
    name: "Tech Park Phase 2",
    phase: "Construction",
    activePhases: ["Construction"],
    location: "Tech District",
    progress: 30,
    budget: "$8.5M",
    team: 62,
    startDate: "2025-12-01",
    endDate: "2026-09-20",
    status: "Delayed",
  },
  {
    id: "p_4",
    name: "Green Valley Homes",
    phase: "Facility Management",
    activePhases: ["Facility Management"],
    location: "Green Valley",
    progress: 100,
    budget: "$2.1M",
    team: 12,
    startDate: "2025-06-10",
    endDate: "2026-04-10",
    status: "Completed",
  },
  {
    id: "p_5",
    name: "Metro Mall Expansion",
    phase: "Pre-Construction",
    activePhases: ["Pre-Construction"],
    location: "City Center",
    progress: 20,
    budget: "$12.3M",
    team: 35,
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    status: "On Track",
  },
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
            team: p.team || 12,
            startDate: p.startDate || new Date().toISOString().split("T")[0],
            endDate: p.endDate || new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: p.status === "active" ? "On Track" : (p.status || "On Track")
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
        p.status.toLowerCase() === filterStatus.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchedSearch = query === "" ||
        p.name.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.phase.toLowerCase().includes(query);

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
    <div className="min-h-screen bg-slate-50/50 p-6 lg:p-8 select-none">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Containers</h1>
          <p className="text-sm text-slate-500 font-semibold mt-1">
            Monitor, deploy, and configure active building workspaces
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-5 py-2.5 bg-gradient-to-b from-[#1c64f7] to-[#135AF4] border-t border-[#6099ff]/30 hover:from-[#2872ff] hover:to-[#1c64f7] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(19,90,244,0.2)] hover:shadow-[0_6px_16px_rgba(19,90,244,0.3)] active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create Project
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects by name, location or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 hover:border-slate-350 rounded-xl text-xs font-semibold text-slate-800 outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-slate-50/30"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Phase Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filterPhase}
              onChange={(e) => setFilterPhase(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 bg-white cursor-pointer outline-hidden hover:border-slate-300"
            >
              <option value="All">All Phases</option>
              <option value="Pre-Construction">Pre-Construction</option>
              <option value="Construction">Construction</option>
              <option value="Site Survey">Site Survey</option>
              <option value="Facility Management">Facility Management</option>
              <option value="Digital Twin">Digital Twin</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 bg-white cursor-pointer outline-hidden hover:border-slate-300"
          >
            <option value="All">All Statuses</option>
            <option value="On Track">On Track</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
          </select>

        </div>
      </div>

      {/* List View Mode (Professional Data Table) */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-medium uppercase text-slate-500">
                <th className="px-3 py-3">Workspace Container</th>
                <th className="px-3 py-3">Primary Stage</th>
                <th className="px-3 py-3">Progress</th>
                <th className="px-3 py-3">Budget</th>
                <th className="px-3 py-3">Manpower</th>
                <th className="px-3 py-3">Timeline</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => handleLaunchProject(p)}
                  className="border-b border-slate-100 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="px-3 py-3">
                    <div>
                      <div className="font-medium text-slate-950 group-hover:text-blue-600 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-350" />
                        {p.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/50">
                      {p.phase}
                    </span>
                  </td>
                  <td className="px-3 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium text-slate-600">{p.progress}%</span>
                      <div className="w-20 bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            p.progress === 100 ? "bg-emerald-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${p.progress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-slate-950 font-medium">{p.budget}</td>
                  <td className="px-3 py-3 text-slate-500">{p.team} members</td>
                  <td className="px-3 py-3 text-[10px] text-slate-500">
                    {p.startDate} to {p.endDate}
                  </td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${getStatusStyle(p.status, p.progress)}`}>
                      {getStatusLabel(p.status, p.progress)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={(e) => handleDeleteProject(p.id, e)}
                        className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                        title="Delete container"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleLaunchProject(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                        title="Open workspace"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-600/10"
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
