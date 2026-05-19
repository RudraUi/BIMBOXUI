import { Search, Filter, FileText, Image, File, FileSpreadsheet, Download, Share2, Tag, Database } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { useSidebar } from "../../context/SidebarContext";
import { GraphySetupCard } from "../graphy/GraphySetupCard";

type FileTypeFilter = "All" | "Drawings" | "Documents" | "Images" | "Reports" | "BIM Models";
type ProjectFilter = "All Projects" | "Downtown Tower Complex" | "Riverside Residential" | "Tech Park Phase 2";
type DateFilter = "Any Time" | "Today" | "This Week" | "This Month";

type ExplorerFile = {
  id: number;
  name: string;
  type: "Drawing" | "Document" | "Image" | "Report" | "BIM Model";
  size: string;
  project: ProjectFilter;
  date: string;
  tags: string[];
  icon: typeof FileText;
  color: "blue" | "purple" | "green" | "orange" | "pink";
  linkedTo: string[];
};

const filters: FileTypeFilter[] = ["All", "Drawings", "Documents", "Images", "Reports", "BIM Models"];
const projects: ProjectFilter[] = ["All Projects", "Downtown Tower Complex", "Riverside Residential", "Tech Park Phase 2"];
const dateRanges: DateFilter[] = ["Any Time", "Today", "This Week", "This Month"];

const files: ExplorerFile[] = [
  {
    id: 1,
    name: "Downtown Tower - Floor Plans Rev 4.2",
    type: "Drawing",
    size: "24.5 MB",
    project: "Downtown Tower Complex",
    date: "2026-04-28",
    tags: ["Architecture", "Floor Plans"],
    icon: FileText,
    color: "blue",
    linkedTo: ["Construction", "Pre-Construction"],
  },
  {
    id: 2,
    name: "Material Specifications - Steel",
    type: "Document",
    size: "2.8 MB",
    project: "Riverside Residential",
    date: "2026-04-24",
    tags: ["Specifications", "Materials"],
    icon: File,
    color: "purple",
    linkedTo: ["Procurement"],
  },
  {
    id: 3,
    name: "Site Progress Photos - Week 16",
    type: "Image",
    size: "45.2 MB",
    project: "Tech Park Phase 2",
    date: "2026-04-22",
    tags: ["Progress", "Photos"],
    icon: Image,
    color: "green",
    linkedTo: ["Construction", "Resources"],
  },
  {
    id: 4,
    name: "Monthly Budget Report - April 2026",
    type: "Report",
    size: "1.2 MB",
    project: "All Projects",
    date: "2026-04-19",
    tags: ["Finance", "Budget"],
    icon: FileSpreadsheet,
    color: "orange",
    linkedTo: ["Banking", "Procurement"],
  },
  {
    id: 5,
    name: "BIM Model - Structural Frame",
    type: "BIM Model",
    size: "128.6 MB",
    project: "Downtown Tower Complex",
    date: "2026-04-18",
    tags: ["BIM", "Structural"],
    icon: Database,
    color: "pink",
    linkedTo: ["Pre-Construction", "Digital Twin"],
  },
];

const recentSearches = [
  "Floor plans",
  "Material specifications",
  "Site photos",
  "Budget reports",
];

const filterTypeMap: Record<FileTypeFilter, ExplorerFile["type"] | "All"> = {
  All: "All",
  Drawings: "Drawing",
  Documents: "Document",
  Images: "Image",
  Reports: "Report",
  "BIM Models": "BIM Model",
};

function isWithinDateRange(fileDate: string, selectedRange: DateFilter) {
  if (selectedRange === "Any Time") {
    return true;
  }

  const baseDate = new Date("2026-04-28");
  const current = new Date(fileDate);
  const diffInDays = Math.floor((baseDate.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));

  if (selectedRange === "Today") {
    return diffInDays === 0;
  }

  if (selectedRange === "This Week") {
    return diffInDays <= 7;
  }

  return diffInDays <= 30;
}

export function DataExplorer() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<FileTypeFilter>("All");
  const [selectedProject, setSelectedProject] = useState<ProjectFilter>("All Projects");
  const [selectedDateRange, setSelectedDateRange] = useState<DateFilter>("Any Time");
  const [selectedFile, setSelectedFile] = useState<ExplorerFile | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);

  const filteredFiles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return files.filter((file) => {
      const matchesSearch =
        query === "" ||
        file.name.toLowerCase().includes(query) ||
        file.project.toLowerCase().includes(query) ||
        file.tags.some((tag) => tag.toLowerCase().includes(query));
      const matchesType = selectedFilter === "All" || file.type === filterTypeMap[selectedFilter];
      const matchesProject = selectedProject === "All Projects" || file.project === selectedProject;
      const matchesDate = isWithinDateRange(file.date, selectedDateRange);
      return matchesSearch && matchesType && matchesProject && matchesDate;
    });
  }, [searchQuery, selectedFilter, selectedProject, selectedDateRange]);

  const handleAction = (label: string, file: ExplorerFile) => {
    setFeedbackMessage(`${label} ready for ${file.name}`);
    window.setTimeout(() => {
      setFeedbackMessage("");
    }, 2000);
  };

  return (
    <>
      <div className="h-screen flex flex-col bg-white">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl">Data Explorer</h1>
              <p className="text-sm text-gray-600">Document & Data Hub</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all projects, files, and data..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 text-sm"
              />
            </div>
            <button className="px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Active Filters
            </button>
          </div>

          {searchQuery === "" && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Recent searches:</p>
              <div className="flex gap-2 flex-wrap">
                {recentSearches.map((search) => (
                  <button
                    key={search}
                    onClick={() => setSearchQuery(search)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-all"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-72 bg-white border-r border-gray-200 p-6 overflow-auto">
            <h3 className="text-sm mb-3">File Type</h3>
            <div className="space-y-2 mb-6">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${
                    selectedFilter === filter
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <h3 className="text-sm mb-3">Project</h3>
            <div className="space-y-2 mb-6">
              {projects.map((project) => (
                <button
                  key={project}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${
                    selectedProject === project
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {project}
                </button>
              ))}
            </div>

            <h3 className="text-sm mb-3">Date Range</h3>
            <div className="space-y-2">
              {dateRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedDateRange(range)}
                  className={`w-full px-3 py-2 rounded-lg text-sm text-left transition-all ${
                    selectedDateRange === range
                      ? "bg-gray-900 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <GraphySetupCard />

            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl mb-2">All Files</h2>
                <p className="text-sm text-gray-600">{filteredFiles.length} files found</p>
              </div>
              {feedbackMessage && (
                <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm text-green-700">
                  {feedbackMessage}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFiles.map((file) => {
                const Icon = file.icon;
                const colorClasses = {
                  blue: "from-blue-500 to-blue-600",
                  purple: "from-purple-500 to-purple-600",
                  green: "from-green-500 to-green-600",
                  orange: "from-orange-500 to-orange-600",
                  pink: "from-pink-500 to-pink-600",
                }[file.color];

                return (
                  <div
                    key={file.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer group"
                    onClick={() => setSelectedFile(file)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction("Download", file);
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                        >
                          <Download className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAction("Share", file);
                          }}
                          className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                        >
                          <Share2 className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mb-2 line-clamp-2">{file.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{file.project}</p>

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                      <span>{file.size}</span>
                      <span>•</span>
                      <span>{file.date}</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {file.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Linked to:</p>
                      <div className="flex flex-wrap gap-1">
                        {file.linkedTo.map((link) => (
                          <span key={link} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs">
                            {link}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredFiles.length === 0 && (
              <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
                No files match the current filters.
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={selectedFile !== null} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent>
          {selectedFile && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedFile.name}</DialogTitle>
                <DialogDescription>{selectedFile.project} • {selectedFile.type}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 text-sm text-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">File Size</p>
                    <p>{selectedFile.size}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                    <p>{selectedFile.date}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFile.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-2">Linked Modules</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFile.linkedTo.map((link) => (
                      <span key={link} className="px-2 py-1 bg-blue-50 rounded-md text-xs text-blue-700">
                        {link}
                      </span>
                    ))}
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
