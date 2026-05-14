import { Plus, Search, MoreVertical, Calendar, Users, DollarSign } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useSidebar } from "../../context/SidebarContext";

type Project = {
  id: number;
  name: string;
  phase: string;
  location: string;
  progress: number;
  budget: string;
  team: number;
  startDate: string;
  endDate: string;
  status: "On Track" | "Delayed" | "Completed";
};

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Downtown Tower Complex",
    phase: "Construction",
    location: "Downtown District",
    progress: 75,
    budget: "$5.2M",
    team: 45,
    startDate: "2025-10-15",
    endDate: "2026-08-15",
    status: "On Track",
  },
  {
    id: 2,
    name: "Riverside Residential",
    phase: "Pre-Construction",
    location: "Riverside Area",
    progress: 45,
    budget: "$3.8M",
    team: 28,
    startDate: "2026-01-20",
    endDate: "2026-06-30",
    status: "On Track",
  },
  {
    id: 3,
    name: "Tech Park Phase 2",
    phase: "Construction",
    location: "Tech District",
    progress: 30,
    budget: "$8.5M",
    team: 62,
    startDate: "2025-12-01",
    endDate: "2026-09-20",
    status: "Delayed",
  },
  {
    id: 4,
    name: "Green Valley Homes",
    phase: "Facility Management",
    location: "Green Valley",
    progress: 100,
    budget: "$2.1M",
    team: 12,
    startDate: "2025-06-10",
    endDate: "2026-04-10",
    status: "Completed",
  },
  {
    id: 5,
    name: "Metro Mall Expansion",
    phase: "Pre-Construction",
    location: "City Center",
    progress: 20,
    budget: "$12.3M",
    team: 35,
    startDate: "2026-03-01",
    endDate: "2027-02-28",
    status: "On Track",
  },
];

const phases = ["All", "Pre-Construction", "Construction", "Facility Management", "Digital Twin", "Site Survey"];

function getProjectPath(phase: string) {
  return `/${phase.toLowerCase().replace(/\s+/g, "-")}`;
}

export function AllProjects() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [draftProject, setDraftProject] = useState({
    name: "",
    location: "",
    phase: "Construction",
    budget: "",
    team: "12",
    startDate: "2026-05-01",
    endDate: "2026-12-31",
  });
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesPhase = filterPhase === "All" || project.phase === filterPhase;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        project.name.toLowerCase().includes(query) ||
        project.location.toLowerCase().includes(query) ||
        project.status.toLowerCase().includes(query);
      return matchesPhase && matchesSearch;
    });
  }, [filterPhase, projects, searchQuery]);

  const handleCreateProject = () => {
    if (!draftProject.name.trim() || !draftProject.location.trim()) {
      return;
    }

    const teamSize = Number.parseInt(draftProject.team, 10);
    const newProject: Project = {
      id: Date.now(),
      name: draftProject.name.trim(),
      phase: draftProject.phase,
      location: draftProject.location.trim(),
      progress: 0,
      budget: draftProject.budget.trim() || "$0.0M",
      team: Number.isNaN(teamSize) ? 0 : teamSize,
      startDate: draftProject.startDate,
      endDate: draftProject.endDate,
      status: "On Track",
    };

    setProjects((current) => [newProject, ...current]);
    setSearchQuery("");
    setFilterPhase("All");
    setIsCreateOpen(false);
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
    <>
      <div className="h-screen overflow-auto p-6 bg-white">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2">All Projects</h1>
            <p className="text-gray-600">Manage and monitor all construction projects</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects, status, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-gray-900"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {phases.map((phase) => (
                <button
                  key={phase}
                  onClick={() => setFilterPhase(phase)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all whitespace-nowrap ${
                    filterPhase === phase
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.location}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                      {project.phase}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      project.status === "On Track" ? "bg-green-50 text-green-600" :
                      project.status === "Delayed" ? "bg-orange-50 text-orange-600" :
                      "bg-gray-50 text-gray-600"
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-all"
                  aria-label={`Open details for ${project.name}`}
                >
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      project.progress === 100 ? "bg-green-600" :
                      project.progress >= 50 ? "bg-blue-600" :
                      "bg-orange-600"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Budget</p>
                    <p className="text-sm">{project.budget}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Team</p>
                    <p className="text-sm">{project.team}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-600">Due</p>
                    <p className="text-sm">{project.endDate}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to={getProjectPath(project.phase)}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-center text-sm"
                >
                  View Project
                </Link>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all text-sm"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 mt-6">
            No projects match the current search or phase filter.
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>Add a frontend-only project card to the dashboard preview.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Project name"
              value={draftProject.name}
              onChange={(e) => setDraftProject((current) => ({ ...current, name: e.target.value }))}
            />
            <Input
              placeholder="Location"
              value={draftProject.location}
              onChange={(e) => setDraftProject((current) => ({ ...current, location: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                value={draftProject.phase}
                onChange={(e) => setDraftProject((current) => ({ ...current, phase: e.target.value }))}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              >
                {phases.filter((phase) => phase !== "All").map((phase) => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Budget"
                value={draftProject.budget}
                onChange={(e) => setDraftProject((current) => ({ ...current, budget: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                placeholder="Team"
                value={draftProject.team}
                onChange={(e) => setDraftProject((current) => ({ ...current, team: e.target.value }))}
              />
              <Input
                type="date"
                value={draftProject.startDate}
                onChange={(e) => setDraftProject((current) => ({ ...current, startDate: e.target.value }))}
              />
              <Input
                type="date"
                value={draftProject.endDate}
                onChange={(e) => setDraftProject((current) => ({ ...current, endDate: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCreateOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm"
              >
                Create Project
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedProject !== null} onOpenChange={(open) => !open && setSelectedProject(null)}>
        <DialogContent>
          {selectedProject && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedProject.name}</DialogTitle>
                <DialogDescription>{selectedProject.phase} in {selectedProject.location}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 text-sm text-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Budget</p>
                    <p>{selectedProject.budget}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Team Size</p>
                    <p>{selectedProject.team} members</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500 mb-1">Start Date</p>
                    <p>{selectedProject.startDate}</p>
                  </div>
                  <div className="rounded-lg border border-gray-200 p-3">
                    <p className="text-xs text-gray-500 mb-1">End Date</p>
                    <p>{selectedProject.endDate}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>Progress</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        selectedProject.progress === 100 ? "bg-green-600" :
                        selectedProject.progress >= 50 ? "bg-blue-600" :
                        "bg-orange-600"
                      }`}
                      style={{ width: `${selectedProject.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
