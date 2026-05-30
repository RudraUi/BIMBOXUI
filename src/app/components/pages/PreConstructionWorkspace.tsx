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
import { RFITracker, type RFITrackerOpenItem } from "./RFITracker";

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

const normalizeRfiTrackerId = (item: RFITrackerOpenItem) => {
  const rawId = item.id.replace(/^#/, "");
  if (item.type === "Issues") {
    return rawId.replace(/^ISSUE-/, "ISS-");
  }
  return rawId;
};

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
    <div className="absolute inset-0 z-[90] flex items-center justify-center overflow-hidden bg-slate-950/25 px-6 py-8 backdrop-blur-[3px]">
      <style>{`
        @keyframes preconOrbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div className="relative w-full max-w-[460px] rounded-[26px] border border-white/75 bg-white/72 px-5 py-5 text-center shadow-[0_28px_80px_rgba(15,23,42,0.24),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-br from-white/75 via-white/35 to-blue-50/20" />
        <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-white/90" />
        <div className="relative mx-auto mb-2.5 h-14 w-14">
          <div className="absolute inset-0 rounded-full border border-blue-100/70 bg-white/35" />
          <div className="absolute inset-2 rounded-full border border-dashed border-blue-200/70" style={{ animation: "preconOrbit 18s linear infinite" }}>
            <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blue-600" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-[14px] bg-blue-600 text-white shadow-[0_14px_34px_rgba(37,99,235,0.24)] ring-5 ring-white/45">
              <Building2 className="h-4.5 w-4.5 stroke-[2.2]" />
            </div>
          </div>
        </div>

        <div className="relative mx-auto flex w-fit items-center gap-2 rounded-full border border-blue-100/70 bg-white/45 px-2.5 py-1 text-[8.5px] font-extrabold uppercase tracking-[0.14em] text-blue-600 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          Project viewer
        </div>
        <h1 className="relative mt-2.5 text-[22px] font-semibold text-slate-950">
          {projectName}
        </h1>
        <p className="relative mx-auto mt-1 max-w-sm text-[11.5px] font-medium leading-5 text-slate-500">
          Start with the setup path that matches your first source.
        </p>

        <div className="relative mx-auto mt-3 flex max-w-full w-fit items-center gap-2 rounded-full border border-white/70 bg-white/45 px-3 py-1.5 text-[9.5px] font-semibold text-slate-500 shadow-sm backdrop-blur">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-50/80 text-blue-600">
            <Compass className="h-2.5 w-2.5" />
          </span>
          <span className="truncate">{projectLocation}</span>
        </div>

        <div className="relative mt-4 rounded-[22px] border border-white/75 bg-white/58 p-1.5 text-left shadow-[0_16px_50px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.65)] backdrop-blur-xl">
          <div className="px-3 py-1.5">
            <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-400">Start setup</p>
          </div>
          {setupChoices.map((choice) => {
            const Icon = choice.icon;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => onStart(choice.id)}
                className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 transition-all hover:bg-white/70"
              >
                <div className={`flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl ${choice.accent} text-white shadow-sm`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-950">{choice.title}</div>
                  <div className="mt-0.5 text-[10px] font-medium text-slate-500">{choice.description}</div>
                </div>
                <div className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full bg-white/55 text-slate-300 ring-1 ring-white/80 transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:ring-blue-600">
                  <ArrowRight className="h-3 w-3" />
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
  const [coordinationLaunchItem, setCoordinationLaunchItem] = useState<{
    type: "rfi" | "issue";
    id: string;
    title: string;
    service?: string;
    priority?: string;
    status?: string;
    assignee?: string;
    due?: string;
    isNewAction?: boolean;
  } | null>(null);
  const [rfiListReturnTab, setRfiListReturnTab] = useState<"Issues" | "RFI">("Issues");

  const handleStartViewer = (tab: "map" | "drawing") => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(viewerStartedKey, "true");
      window.localStorage.setItem(getProjectScopedKey(VIEWER_DEFAULT_TAB_KEY, activeProject?.id), tab);
    }
    setHasStartedViewer(true);
    setViewerInstanceKey((current) => current + 1);
  };

  const handleOpenRfiIssueInCoordination = (item: RFITrackerOpenItem) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(viewerStartedKey, "true");
      window.localStorage.setItem(getProjectScopedKey(VIEWER_DEFAULT_TAB_KEY, activeProject?.id), "coordination");
    }
    setHasStartedViewer(true);
    setRfiListReturnTab(item.type === "RFI" ? "RFI" : "Issues");
    setCoordinationLaunchItem({
      type: item.type === "RFI" ? "rfi" : "issue",
      id: normalizeRfiTrackerId(item),
      title: item.title,
      service: item.type === "RFI" ? "Architectural" : "Structural",
      priority: item.importance,
      status: item.status === "OPEN" ? "Open" : item.status === "IN PROGRESS" ? "In Progress" : "Resolved",
      assignee: item.assignee,
      due: item.endDate !== "No Date Selected" ? item.endDate : "-",
      isNewAction: item.isNewAction
    });
    setViewerInstanceKey((current) => current + 1);
  };

  return (
    <div className="relative h-full min-h-screen overflow-hidden bg-white">
      {safeActiveTab === "home" && (
        <>
          <ViewerMain key={viewerInstanceKey} />
          {!hasStartedViewer && <ProjectViewerWelcome onStart={handleStartViewer} />}
        </>
      )}
      {safeActiveTab === "rfi-issues" && (
        coordinationLaunchItem ? (
          <ViewerMain
            key={`coordination-${viewerInstanceKey}`}
            initialTab="coordination"
            initialCoordinationItem={coordinationLaunchItem}
            onBackToRfiList={() => setCoordinationLaunchItem(null)}
          />
        ) : (
          <div className="h-full min-h-screen bg-white p-4">
            <RFITracker initialTab={rfiListReturnTab} onOpenInCoordination={handleOpenRfiIssueInCoordination} />
          </div>
        )
      )}
      {safeActiveTab !== "home" && safeActiveTab !== "rfi-issues" && (
        <EmptyWorkspacePanel tab={activeTabMeta} />
      )}
    </div>
  );
}
