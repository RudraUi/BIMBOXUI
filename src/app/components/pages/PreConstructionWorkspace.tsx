import { useLocation } from "react-router";
import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  FileText,
  FolderKanban,
  GitBranch,
  AlertCircle,
  LayoutDashboard,
  Map,
  Layers,
  ArrowRight,
  Building2,
  Compass,
} from "lucide-react";
import ViewerMain from "./viewer-main/ViewerMain";

type WorkspaceTab = "home" | "setup" | "viewer" | "tasks" | "wbs" | "rfi-issues" | "docs" | "cde";

const workspaceTabs: Array<{
  id: WorkspaceTab;
  label: string;
  icon: any;
  description: string;
}> = [
  { id: "home", label: "Home", icon: LayoutDashboard, description: "Federated project viewer" },
  { id: "cde", label: "CDE", icon: FolderKanban, description: "Common data environment" },
  { id: "wbs", label: "WBS", icon: GitBranch, description: "Work breakdown structure" },
  { id: "tasks", label: "Task", icon: ClipboardCheck, description: "Task workspace" },
  { id: "docs", label: "Docs", icon: FileText, description: "Document workspace" },
  { id: "rfi-issues", label: "RFI and Issue", icon: AlertCircle, description: "Queries and issue tracking" }
];

const VIEWER_STARTED_KEY = "bimbox.preconstruction.viewerStarted";
const VIEWER_DEFAULT_TAB_KEY = "bimbox.preconstruction.defaultViewerTab";

const getActiveProject = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.localStorage.getItem("active_project") || "null");
  } catch {
    return null;
  }
};

const getProjectScopedKey = (baseKey: string, projectId?: string) =>
  projectId ? `${baseKey}.${projectId}` : baseKey;

function EmptyWorkspacePanel({ tab }: { tab: (typeof workspaceTabs)[number] }) {
  const Icon = tab.icon;

  return (
    <div className="flex h-full min-h-0 items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-base font-bold text-slate-900">{tab.label}</h2>
        <p className="mt-2 text-xs font-medium leading-5 text-slate-500">
          This section is reserved for the next workflow.
        </p>
      </div>
    </div>
  );
}

function ProjectViewerWelcome({ onStart }: { onStart: (tab: "map" | "drawing") => void }) {
  const activeProject = useMemo(() => getActiveProject(), []);
  const projectName = activeProject?.name || "your project";
  const projectLocation = activeProject?.location || "Location not set";

  const setupChoices = [
    {
      id: "map" as const,
      title: "Map setup",
      description: "Boundary, floor plan and zones",
      icon: Map,
      accent: "bg-blue-600"
    },
    {
      id: "drawing" as const,
      title: "Drawing setup",
      description: "Drawings, levels and assignments",
      icon: Layers,
      accent: "bg-slate-950"
    }
  ];

  return (
    <div className="relative flex h-full min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-8">
      <style>{`
        @keyframes preconLiquidOne {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(28px, -18px, 0) scale(1.08); }
          100% { transform: translate3d(-18px, 12px, 0) scale(0.98); }
        }
        @keyframes preconLiquidTwo {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-30px, -20px, 0) scale(1.06); }
          100% { transform: translate3d(20px, 12px, 0) scale(1); }
        }
        @keyframes preconOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[45%] overflow-hidden bg-transparent">
        <div className="absolute bottom-[-80px] left-[10%] h-[500px] w-[500px] rounded-full bg-violet-300/50 blur-[130px]" style={{ animation: "preconLiquidOne 26s ease-in-out infinite alternate" }} />
        <div className="absolute bottom-[-100px] right-[10%] h-[550px] w-[550px] rounded-full bg-sky-300/60 blur-[140px]" style={{ animation: "preconLiquidTwo 32s ease-in-out infinite alternate" }} />
        <div className="absolute bottom-[-60px] left-[40%] h-[450px] w-[450px] rounded-full bg-pink-200/55 blur-[125px]" style={{ animation: "preconLiquidOne 26s ease-in-out infinite alternate", animationDelay: "-8s" }} />
        <div className="absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-white via-white/80 to-transparent" />
      </div>
      <div className="relative w-full max-w-xl text-center">
        <div className="relative mx-auto mb-5 h-20 w-20">
          <div className="absolute inset-0 rounded-full border border-blue-100/80" />
          <div className="absolute inset-2 rounded-full border border-dashed border-blue-200/80" style={{ animation: "preconOrbit 18s linear infinite" }}>
            <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-600 shadow-[0_0_0_5px_rgba(37,99,235,0.08)]" />
            <span className="absolute bottom-2 right-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
            <span className="absolute bottom-4 left-0 h-1.5 w-1.5 rounded-full bg-violet-400" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-[20px] bg-blue-600 text-white shadow-[0_18px_46px_rgba(37,99,235,0.25)] ring-8 ring-blue-50/80">
              <Building2 className="h-[22px] w-[22px] stroke-[2.2]" />
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-blue-100/70 bg-blue-50/60 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-blue-600">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          Project viewer
        </div>
        <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.025em] text-slate-950">
          {projectName}
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-6 text-slate-500">
          Start with the setup path that matches your first source.
        </p>

        <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-slate-100 bg-white/90 px-3.5 py-1.5 text-[10px] font-semibold text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Compass className="h-3 w-3" />
          </span>
          <span>{projectLocation}</span>
        </div>

        <div className="mt-8 rounded-[28px] border border-slate-100 bg-white/90 p-3 text-left shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="px-3 pb-2 pt-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Start setup</p>
          </div>
          {setupChoices.map((choice) => {
            const Icon = choice.icon;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => onStart(choice.id)}
                className="group flex w-full items-center gap-4 rounded-2xl px-3 py-3.5 transition-all hover:bg-slate-50"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${choice.accent} text-white shadow-sm`}>
                  <Icon className="h-[18px] w-[18px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-950">{choice.title}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-slate-500">{choice.description}</div>
                </div>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm ring-1 ring-slate-100 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                  <ArrowRight className="h-3.5 w-3.5" />
                  </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PreConstructionWorkspace() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const rawTab = (params.get("tab") || "home") as WorkspaceTab;
  const activeTab = rawTab === "setup" || rawTab === "viewer" ? "home" : rawTab;
  const safeActiveTab = workspaceTabs.some((tab) => tab.id === activeTab) ? activeTab : "home";

  const activeTabMeta = workspaceTabs.find((tab) => tab.id === safeActiveTab) || workspaceTabs[0];
  const activeProject = useMemo(() => getActiveProject(), []);
  const viewerStartedKey = getProjectScopedKey(VIEWER_STARTED_KEY, activeProject?.id);
  const [hasStartedViewer, setHasStartedViewer] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(viewerStartedKey) === "true";
  });
  const [viewerInstanceKey, setViewerInstanceKey] = useState(0);

  const handleStartViewer = (tab: "map" | "drawing") => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(viewerStartedKey, "true");
      window.localStorage.setItem(getProjectScopedKey(VIEWER_DEFAULT_TAB_KEY, activeProject?.id), tab);
    }
    setHasStartedViewer(true);
    setViewerInstanceKey((current) => current + 1);
  };

  return (
    <div className="h-full min-h-screen overflow-hidden bg-white">
      {safeActiveTab === "home" && (
        hasStartedViewer ? <ViewerMain key={viewerInstanceKey} /> : <ProjectViewerWelcome onStart={handleStartViewer} />
      )}
      {safeActiveTab !== "home" && (
        <EmptyWorkspacePanel tab={activeTabMeta} />
      )}
    </div>
  );
}
