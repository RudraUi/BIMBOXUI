import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  Camera,
  Search,
  Compass,
  Layers,
  Plus,
  Navigation,
  Activity,
  FileDown,
  Globe,
  Upload,
  RotateCcw,
  CheckCircle2,
  Trash2,
  FileText,
  Home,
  Cpu,
  Maximize2,
  Settings,
  Eye,
  EyeOff,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  HelpCircle,
  FolderOpen,
  MousePointer,
  RotateCw,
  Scaling,
  Circle as CircleIcon,
  Trash,
  Undo2,
  Redo2,
  Check,
  GripVertical,
  UploadCloud,
  Edit2,
  X,
  List,
  LayoutGrid,
  Loader2,
  Ruler,
  AlertTriangle,
  Users,
  Mic,
  RefreshCw,
  SlidersHorizontal,
  Hand,
  Menu,
  Square,
  Minus,
  Sun,
  Columns,
  Box,
  Send,
  Cloud,
  ArrowUpRight,
  ArrowLeft,
  MessageSquare,
  History,
  Palette
} from "lucide-react";

// Custom irregular polygon icon showing vertices connected by lines
const PolygonIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 3l8 5-3 10H7L4 8z" />
    <circle cx="12" cy="3" r="1.5" fill="currentColor" />
    <circle cx="20" cy="8" r="1.5" fill="currentColor" />
    <circle cx="17" cy="18" r="1.5" fill="currentColor" />
    <circle cx="7" cy="18" r="1.5" fill="currentColor" />
    <circle cx="4" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

// Custom cube icon for 3D navigation / coordination
const CustomCube = ({ className = "w-4 h-4", ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const getCloudPath = (x: number, y: number, w: number, h: number) => {
  const stepsX = Math.max(3, Math.round(Math.abs(w) / 15));
  const stepsY = Math.max(3, Math.round(Math.abs(h) / 15));
  const stepW = w / stepsX;
  const stepH = h / stepsY;
  
  let path = `M ${x} ${y}`;
  
  // Top edge (left to right)
  for (let i = 0; i < stepsX; i++) {
    const cx = x + (i + 0.5) * stepW;
    const cy = y - 4;
    const ex = x + (i + 1) * stepW;
    path += ` Q ${cx} ${cy}, ${ex} ${y}`;
  }
  
  // Right edge (top to bottom)
  const rx = x + w;
  for (let i = 0; i < stepsY; i++) {
    const cx = rx + 4;
    const cy = y + (i + 0.5) * stepH;
    const ey = y + (i + 1) * stepH;
    path += ` Q ${cx} ${cy}, ${rx} ${ey}`;
  }
  
  // Bottom edge (right to left)
  const by = y + h;
  for (let i = stepsX; i > 0; i--) {
    const cx = x + (i - 0.5) * stepW;
    const cy = by + 4;
    const ex = x + (i - 1) * stepW;
    path += ` Q ${cx} ${cy}, ${ex} ${by}`;
  }
  
  // Left edge (bottom to top)
  for (let i = stepsY; i > 0; i--) {
    const cx = x - 4;
    const cy = y + (i - 0.5) * stepH;
    const ey = y + (i - 1) * stepH;
    path += ` Q ${cx} ${cy}, ${x} ${ey}`;
  }
  
  return path + " Z";
};

const getPolygonMarkupPoints = (x: number, y: number, w: number, h: number): Point[] => [
  { x: x + w * 0.5, y },
  { x: x + w, y: y + h * 0.34 },
  { x: x + w * 0.82, y: y + h },
  { x: x + w * 0.18, y: y + h },
  { x, y: y + h * 0.34 }
];

const ViewportModel = ({ angle = 'default' }: { angle?: 'default' | 'right' }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="relative w-full max-w-[800px] aspect-video flex items-center justify-center">
      {/* Soft Radial Glow */}
      <div className="absolute w-[600px] h-[600px] bg-white/40 blur-[100px] rounded-full mix-blend-overlay"></div>
      
      {/* Abstract BIM Model (SVG) */}
      <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-2xl opacity-90 z-10" style={{ transform: angle === 'right' ? 'scaleX(-1) rotate(5deg)' : 'rotate(-5deg)' }}>
        <g stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" fill="#cbd5e1">
          {/* Base Platform */}
          <path d="M 200 250 L 400 320 L 700 220 L 500 150 Z" fill="#e2e8f0" />
          <path d="M 200 250 L 200 270 L 400 340 L 400 320 Z" fill="#94a3b8" />
          <path d="M 400 340 L 700 240 L 700 220 L 400 320 Z" fill="#64748b" />
          {/* Grid lines on platform */}
          <path d="M 250 232 L 450 302 M 300 215 L 500 285 M 350 197 L 550 267" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
          <path d="M 300 285 L 600 185 M 350 302 L 650 202" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
          
          {/* Core Building */}
          <path d="M 450 220 L 550 255 L 650 220 L 550 185 Z" fill="#f1f5f9" />
          <path d="M 450 220 L 450 100 L 550 135 L 550 255 Z" fill="#cbd5e1" />
          <path d="M 550 135 L 650 100 L 650 220 L 550 255 Z" fill="#94a3b8" />
          
          {/* Building Windows / Details */}
          {Array.from({ length: 4 }).map((_, i) => (
            <g key={`w1-${i}`}>
              <line x1="450" y1={130 + i * 25} x2="550" y2={165 + i * 25} stroke="#64748b" strokeWidth="2" />
              <line x1="550" y1={165 + i * 25} x2="650" y2={130 + i * 25} stroke="#475569" strokeWidth="2" />
            </g>
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={`v1-${i}`}>
              <line x1={465 + i * 15} y1={105 + i * 5} x2={465 + i * 15} y2={225 + i * 5} stroke="#64748b" strokeWidth="1.5" opacity="0.7" />
              <line x1={565 + i * 15} y1={130 - i * 5} x2={565 + i * 15} y2={250 - i * 5} stroke="#475569" strokeWidth="1.5" opacity="0.7" />
            </g>
          ))}
          
          {/* Top Structural Beams */}
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={`t-${i}`} d={`M ${460 + i * 25} ${90 + (i < 4 ? i * 8 : (7 - i) * 8)} L ${460 + i * 25} ${110 + (i < 4 ? i * 8 : (7 - i) * 8)}`} stroke="#334155" strokeWidth="2" />
          ))}
        </g>
      </svg>
    </div>
  </div>
);

const BlueprintImage = ({
  src,
  alt,
  className = "",
  style
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  const isSvg = src.toLowerCase().includes(".svg");

  if (isSvg) {
    const fit = className.includes("object-cover") ? "cover" : "contain";
    const cleanedClassName = className.replace(/\bobject-(contain|cover|fill|none|scale-down)\b/g, "");

    return (
      <div
        role="img"
        aria-label={alt}
        className={cleanedClassName}
        style={{
          ...style,
          backgroundImage: `url("${src}")`,
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: fit
        }}
      />
    );
  }

  return <img src={src} alt={alt} className={className} style={style} draggable={false} />;
};


interface Point {
  x: number;
  y: number;
}

interface DrawingOverlay {
  url: string;
  scale: number;
  rotate: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
}

interface DrawingLayer {
  id: string;
  label: string;
  points: Point[];
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color: string;
  drawingOverlay?: DrawingOverlay | null;
  children: DrawingLayer[];
}

interface Markup {
  id: string;
  type: "pin" | "circle" | "area";
  points: Point[];
  color: string;
  label: string;
  drawingOverlay?: DrawingOverlay | null;
  childLayers?: DrawingLayer[];
  isPlacedOnMap?: boolean;
  createdFromDrawing?: boolean;
}

interface DrawingMarkup {
  id: string;
  type: "pin" | "circle";
  x: number;
  y: number;
  label: string;
}

type DrawingService = string;

interface UploadedDrawingFile {
  id: string;
  name: string;
  url: string;
  service: DrawingService;
}

interface FloorDrawingAssignment {
  id: string;
  name: string;
  assignments: Partial<Record<DrawingService, string>>;
}

interface ZoneDrawingConfig {
  floorsList: FloorDrawingAssignment[];
  customServices?: DrawingService[];
  removedServices?: DrawingService[];
}

const DRAWING_SERVICES: DrawingService[] = [
  "Architectural",
  "Structural",
  "Mechanical",
  "Electrical",
  "Plumbing",
  "Firefighting"
];

const isDefaultDrawingService = (service: DrawingService): boolean =>
  DRAWING_SERVICES.includes(service);

const getServiceShortLabel = (service: DrawingService): string => {
  const labels: Record<string, string> = {
    Architectural: "Arch",
    Structural: "Struct",
    Mechanical: "Mech",
    Electrical: "Elec",
    Plumbing: "Plumb",
    Firefighting: "Fire"
  };

  return labels[service] || service;
};

const DEMO_BLUEPRINT_POOL = [
  "/architectural_drawing.png",
  "/demo_plan_a.svg",
  "/demo_plan_b.svg",
  "/demo_plan_c.svg"
];

const HUB_BLUEPRINT_FILES: UploadedDrawingFile[] = [
  { id: "hub-a101", name: "A101 Ground Floor Plan", url: "/architectural_drawing.png", service: "Architectural" },
  { id: "hub-s101", name: "S101 Foundation Details", url: "/demo_plan_a.svg", service: "Structural" },
  { id: "hub-m101", name: "M101 HVAC Layout Plan", url: "/demo_plan_b.svg", service: "Mechanical" },
  { id: "hub-e101", name: "E101 Lighting Routing", url: "/demo_plan_c.svg", service: "Electrical" }
];

const HUB_3D_MODEL_FILES: UploadedDrawingFile[] = [
  { id: "hub-3d-arch", name: "L01 Architectural BIM Model.ifc", url: "/demo_plan_a.svg", service: "Architectural" },
  { id: "hub-3d-struct", name: "L01 Structural Frame Model.ifc", url: "/demo_plan_b.svg", service: "Structural" },
  { id: "hub-3d-mep", name: "L01 MEP Coordination Model.ifc", url: "/demo_plan_c.svg", service: "Mechanical" },
  { id: "hub-3d-elec", name: "L02 Electrical Routing Model.ifc", url: "/architectural_drawing.png", service: "Electrical" }
];

const PEN_CURSOR =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cfilter id='s' x='-30%25' y='-30%25' width='160%25' height='160%25'%3E%3CfeDropShadow dx='1' dy='2' stdDeviation='1.2' flood-color='%23000000' flood-opacity='.35'/%3E%3C/filter%3E%3Cg filter='url(%23s)'%3E%3Cpath d='M7 6.5c5.8.8 10.9 2.9 15.1 6.4 2.9 2.4 3.8 6.4 2 9.7-.5 1-1.7 1.2-2.5.4l-4-4-3.2 3.2c-.8.8-2.1.8-2.9 0l-4.8-4.8c-.8-.8-.8-2.1 0-2.9l3.2-3.2-4-4c-.8-.8-.4-2.5 1.1-2.3z' fill='%23ffffff' stroke='%23111111' stroke-width='2.2' stroke-linejoin='round'/%3E%3Ccircle cx='14.2' cy='15.2' r='3.3' fill='%23ffffff' stroke='%23111111' stroke-width='2'/%3E%3Cpath d='M5.8 5.8l8.4 9.4' stroke='%23111111' stroke-width='2.2' stroke-linecap='round'/%3E%3C/g%3E%3C/svg%3E\") 6 6, crosshair";

const makeDrawingOverlay = (url: string): DrawingOverlay => ({
  url,
  scale: 0.8,
  rotate: 0,
  opacity: 0.75,
  offsetX: 0,
  offsetY: 0
});

const updateLayerTree = (
  layers: DrawingLayer[],
  layerId: string,
  updater: (layer: DrawingLayer) => DrawingLayer
): DrawingLayer[] =>
  layers.map((layer) => {
    if (layer.id === layerId) return updater(layer);
    return {
      ...layer,
      children: updateLayerTree(layer.children, layerId, updater)
    };
  });

const removeLayerFromTree = (layers: DrawingLayer[], layerId: string): DrawingLayer[] =>
  layers
    .filter((layer) => layer.id !== layerId)
    .map((layer) => ({
      ...layer,
      children: removeLayerFromTree(layer.children, layerId)
    }));

const findLayerInTree = (layers: DrawingLayer[], layerId: string | null): DrawingLayer | null => {
  if (!layerId) return null;
  for (const layer of layers) {
    if (layer.id === layerId) return layer;
    const match = findLayerInTree(layer.children, layerId);
    if (match) return match;
  }
  return null;
};

const countLayerTree = (layers: DrawingLayer[]): number =>
  layers.reduce((total, layer) => total + 1 + countLayerTree(layer.children), 0);

type ViewerTab = "map" | "drawing" | "drone" | "3d" | "coordination" | "split" | "quickCompare";
type CoordinationLaunchItem = {
  type: "rfi" | "issue";
  id: string;
  title: string;
  service?: string;
  priority?: string;
  status?: string;
  assignee?: string;
  due?: string;
  isNewAction?: boolean;
};

type ViewerMainProps = {
  initialTab?: ViewerTab;
  initialCoordinationItem?: CoordinationLaunchItem | null;
  onBackToRfiList?: () => void;
};

const VIEWER_DEFAULT_TAB_KEY = "bimbox.preconstruction.defaultViewerTab";
const VIEWER_TABS: ViewerTab[] = ["map", "drawing", "drone", "3d", "coordination", "split", "quickCompare"];
const VIEWER_TAB_LABELS: Record<ViewerTab, string> = {
  map: "Map setup",
  drawing: "Drawing setup",
  drone: "Drone setup",
  "3d": "3D setup",
  coordination: "BIM Coordination",
  split: "Split Screen",
  quickCompare: "Quick Compare"
};

const DEFAULT_VIEW_OPTIONS: Array<{ id: ViewerTab; label: string; description: string; icon: React.ElementType }> = [
  { id: "map", label: "Map setup", description: "Open with site boundary and map tools", icon: Globe },
  { id: "drawing", label: "Drawing setup", description: "Open with drawings, zones and levels", icon: Layers },
  { id: "drone", label: "Drone setup", description: "Open with drone capture overlays", icon: Camera },
  { id: "3d", label: "3D setup", description: "Open with BIM model setup", icon: Cpu },
  { id: "coordination", label: "BIM Coordination", description: "Open with coordination workspace", icon: Sparkles },
  { id: "split", label: "Split Screen", description: "Open with comparison workspace", icon: Columns }
];

const getInitialViewerTab = (): ViewerTab => {
  if (typeof window === "undefined") return "map";
  const savedTab = window.localStorage.getItem(getViewerDefaultTabKey());
  return VIEWER_TABS.includes(savedTab as ViewerTab) ? (savedTab as ViewerTab) : "map";
};

const getViewerDefaultTabKey = () => {
  if (typeof window === "undefined") return VIEWER_DEFAULT_TAB_KEY;
  try {
    const activeProject = JSON.parse(window.localStorage.getItem("active_project") || "{}");
    return activeProject?.id ? `${VIEWER_DEFAULT_TAB_KEY}.${activeProject.id}` : VIEWER_DEFAULT_TAB_KEY;
  } catch {
    return VIEWER_DEFAULT_TAB_KEY;
  }
};

export default function ViewerMain({ initialTab, initialCoordinationItem, onBackToRfiList }: ViewerMainProps = {}) {
  // Tabs: 'map' | 'drawing' | 'drone' | 'coordination' | 'split' | 'quickCompare'
  const [activeTab, setActiveTab] = useState<ViewerTab>(() => initialTab || getInitialViewerTab());
  const [defaultViewerTab, setDefaultViewerTab] = useState<ViewerTab>(() => initialTab || getInitialViewerTab());

  // --- QUICK COMPARE A VS B STATE ---
  const [quickCompareLeftFile, setQuickCompareLeftFile] = useState<string | null>(null);
  const [quickCompareRightFile, setQuickCompareRightFile] = useState<string | null>(null);
  const [isQuickCompareActive, setIsQuickCompareActive] = useState<boolean>(false);
  const [quickCompareHistory, setQuickCompareHistory] = useState<Array<{ id: string; left: string; right: string; date: string }>>([
    { id: "hist-1", left: "HUB: A101_Ground_Floor_Plan.dwg", right: "HUB: S101_Foundation_Details.dwg", date: "2 hours ago" },
    { id: "hist-2", left: "HUB: M101_HVAC_Layout_Plan.dwg", right: "HUB: E101_Lighting_Routing.dwg", date: "Yesterday" }
  ]);

  useEffect(() => {
    if (quickCompareLeftFile && quickCompareRightFile) {
      const exists = quickCompareHistory.some(
        (h) => h.left === quickCompareLeftFile && h.right === quickCompareRightFile
      );
      if (!exists) {
        const newEntry = {
          id: `hist-${Date.now()}`,
          left: quickCompareLeftFile,
          right: quickCompareRightFile,
          date: "Just now"
        };
        setQuickCompareHistory((prev) => [newEntry, ...prev]);
        triggerToast("Comparison auto-saved to history");
      }
    }
  }, [quickCompareLeftFile, quickCompareRightFile]);

  // --- 3D VIEW & BIM COORDINATION STATE ---
  const [coordinationActiveSideTool, setCoordinationActiveSideTool] = useState("box");
  const [coordinationActiveBottomTool, setCoordinationActiveBottomTool] = useState(
    initialCoordinationItem?.isNewAction ? initialCoordinationItem.type : "pointer"
  );
  const [isCoordinationMaxView, setIsCoordinationMaxView] = useState(false);
  const [isCoordinationCompareView, setIsCoordinationCompareView] = useState(false);
  const [coordinationSplitPos, setCoordinationSplitPos] = useState(50);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [isSpotlightDropdownOpen, setIsSpotlightDropdownOpen] = useState(false);
  const [isSplitWorkspaceLoaded, setIsSplitWorkspaceLoaded] = useState(false);
  const [splitActivePane, setSplitActivePane] = useState<"left" | "right">("left");
  const [splitLeftView, setSplitLeftView] = useState<"drawing" | "bim">("drawing");
  const [splitRightView, setSplitRightView] = useState<"drawing" | "bim">("drawing");
  const [splitPaneTool, setSplitPaneTool] = useState<Record<"left" | "right", string>>({ left: "select", right: "select" });
  const [splitPaneBottomTool, setSplitPaneBottomTool] = useState<Record<"left" | "right", string>>({ left: "layers", right: "layers" });
  const [splitExpandedNodes, setSplitExpandedNodes] = useState<Record<string, boolean>>({});
  const [splitVisibleNodes, setSplitVisibleNodes] = useState<Record<string, boolean>>({});
  const [splitLayerPanelOpen, setSplitLayerPanelOpen] = useState<Record<"left" | "right", boolean>>({ left: true, right: true });
  const [splitLayerPanelWidth, setSplitLayerPanelWidth] = useState<Record<"left" | "right", number>>({ left: 260, right: 260 });
  const [resizingSplitPanel, setResizingSplitPanel] = useState<"left" | "right" | null>(null);
  const [splitPaneRatio, setSplitPaneRatio] = useState(50);
  const [isResizingSplitDivider, setIsResizingSplitDivider] = useState(false);
  const [isTopTabBarCollapsed, setIsTopTabBarCollapsed] = useState(false);
  
  // Levels inside Coordination
  const [selectedCoordinationLevel, setSelectedCoordinationLevel] = useState("All Levels");
  const [coordinationVisibleLevels, setCoordinationVisibleLevels] = useState<Record<string, boolean>>({
    "All Levels": true,
    "Ground": true,
    "Floor 1": true,
    "Floor 2": true,
    "Floor 3": true,
    "Floor 4": true,
    "Structure": false
  });
  const [expandedCoordinationLevels, setExpandedCoordinationLevels] = useState<Record<string, boolean>>({});

  // RFI & Issues side list state
  const [isRfiPanelOpen, setIsRfiPanelOpen] = useState(true);
  const [rfiPanelWidth, setRfiPanelWidth] = useState(288);
  const [isResizingRfiPanel, setIsResizingRfiPanel] = useState(false);
  const [activeRfiTab, setActiveRfiTab] = useState<"rfi" | "issue" | "clashes">(initialCoordinationItem?.type || "rfi");
  const [searchRfiQuery, setSearchRfiQuery] = useState("");
  const [selectedCoordinationItemId, setSelectedCoordinationItemId] = useState<string | null>(initialCoordinationItem?.id || "RFI-101");
  const [isServiceSettingsOpen, setIsServiceSettingsOpen] = useState(false);
  const [isToolInfoOpen, setIsToolInfoOpen] = useState(false);
  const [coordinationDetailModal, setCoordinationDetailModal] = useState<{ type: "rfi" | "issue" | "clash"; item: any } | null>(null);
  const [coordinationDetailTab, setCoordinationDetailTab] = useState<"overview" | "snap" | "assignment">("overview");
  const [isCoordinationSetupReferenceMode, setIsCoordinationSetupReferenceMode] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newServiceColor, setNewServiceColor] = useState("#3b82f6");
  
  // Custom user Service Color Codes
  const [serviceColors, setServiceColors] = useState<Record<string, string>>({
    "Architectural": "#3b82f6", // blue
    "Structural": "#ef4444",    // red
    "Mechanical": "#10b981",    // green
    "Electrical": "#eab308",    // yellow
    "Plumbing": "#f97316",      // orange
    "Firefighting": "#ec4899",  // pink
  });

  // Color picker state (for opening small popovers next to color dots)
  const [activeColorPickerService, setActiveColorPickerService] = useState<string | null>(null);

  // Active RFIs & Issues lists
  const [rfis, setRfis] = useState(() => {
    const baseRfis = [
    { id: "RFI-101", title: "HVAC Duct clash with structural steel beam at grid B-4", service: "Mechanical", priority: "High", status: "Open", assignee: "Snehasis Mohapatra", due: "2026-05-30" },
    { id: "RFI-102", title: "Clarification on wall thickness for server room partitions", service: "Architectural", priority: "Medium", status: "Resolved", assignee: "Alex Rivera", due: "2026-06-02" },
    { id: "RFI-103", title: "Concrete foundation anchor bolt specification modification", service: "Structural", priority: "Critical", status: "In Review", assignee: "Emma Watson", due: "2026-05-28" },
    { id: "RFI-104", title: "Main distribution board drainage clearance requirements", service: "Electrical", priority: "Medium", status: "Open", assignee: "Sam K.", due: "2026-06-08" },
    ];
    if (initialCoordinationItem?.type !== "rfi" || baseRfis.some((item) => item.id === initialCoordinationItem.id)) return baseRfis;
    return [{
      id: initialCoordinationItem.id,
      title: initialCoordinationItem.title,
      service: initialCoordinationItem.service || "Architectural",
      priority: initialCoordinationItem.priority || "Medium",
      status: initialCoordinationItem.status || "Open",
      assignee: initialCoordinationItem.assignee || "Unassigned",
      due: initialCoordinationItem.due || "-"
    }, ...baseRfis];
  });

  const [issues, setIssues] = useState(() => {
    const baseIssues = [
    { id: "ISS-301", title: "Cold water main pipe intersecting cable tray in corridor C", service: "Plumbing", priority: "High", status: "Open", assignee: "Snehasis Mohapatra", due: "2026-05-31" },
    { id: "ISS-302", title: "Sprinkler pipe crossing fire door structural frame", service: "Firefighting", priority: "High", status: "In Progress", assignee: "Lisa P.", due: "2026-06-05" },
    { id: "ISS-303", title: "Power conduit pathway blocked by architectural concrete column", service: "Electrical", priority: "Low", status: "Open", assignee: "Emma Watson", due: "2026-06-12" },
    { id: "ISS-304", title: "Staircase headroom clearance below required 2.2m threshold", service: "Architectural", priority: "Critical", status: "Open", assignee: "Alex Rivera", due: "2026-05-29" },
    ];
    if (initialCoordinationItem?.type !== "issue" || baseIssues.some((item) => item.id === initialCoordinationItem.id)) return baseIssues;
    return [{
      id: initialCoordinationItem.id,
      title: initialCoordinationItem.title,
      service: initialCoordinationItem.service || "Architectural",
      priority: initialCoordinationItem.priority || "Medium",
      status: initialCoordinationItem.status || "Open",
      assignee: initialCoordinationItem.assignee || "Unassigned",
      due: initialCoordinationItem.due || "-"
    }, ...baseIssues];
  });

  // BIM Coordination Panel (right side) state
  const [isBimCoordinationPanelOpen, setIsBimCoordinationPanelOpen] = useState(true);
  const [bimCoordinationPanelWidth, setBimCoordinationPanelWidth] = useState(288);
  const [isResizingBimPanel, setIsResizingBimPanel] = useState(false);
  const [expandedCoordinationLayerNodes, setExpandedCoordinationLayerNodes] = useState<Record<string, boolean>>({});
  const [coordinationActiveModels, setCoordinationActiveModels] = useState<Record<string, boolean>>({
    "Architectural": true,
    "Structural": true,
    "Mechanical": true,
    "Electrical": true,
    "Plumbing": true,
    "Firefighting": true,
  });
  const [coordinationVisibleSpatialNodes, setCoordinationVisibleSpatialNodes] = useState<Record<string, boolean>>({});
  
  // Clash detection simulation
  const [isClashRunning, setIsClashRunning] = useState(false);
  const [clashProgress, setClashProgress] = useState(0);
  const [isClashSetupModalOpen, setIsClashSetupModalOpen] = useState(false);
  const [clashSetup, setClashSetup] = useState({
    siteId: "site-a",
    zoneId: "zone-a1",
    levelName: "Ground Floor",
    comparisonType: "3d" as "2d" | "3d",
    serviceA: "Architectural",
    serviceB: "Electrical"
  });
  const [activeClashScope, setActiveClashScope] = useState<null | {
    siteId: string;
    zoneId: string;
    levelName: string;
    comparisonType: "2d" | "3d";
    serviceA: string;
    serviceB: string;
  }>(null);
  const [clashResults, setClashResults] = useState<Array<{ id: string; service1: string; service2: string; element1: string; element2: string; status: "New" | "Active" | "Resolved"; severity: "Major" | "Minor" | "Critical"; assignee: string }>>([
    { id: "CL-501", service1: "Mechanical", service2: "Structural", element1: "HVAC Duct (400x400)", element2: "Steel H-Beam (W12x26)", status: "Active", severity: "Major", assignee: "Emma Watson" },
    { id: "CL-502", service1: "Plumbing", service2: "Electrical", element1: "Domestic Water Supply Line", element2: "Main Cable Tray Section 3B", status: "Active", severity: "Critical", assignee: "Snehasis Mohapatra" },
    { id: "CL-503", service1: "Electrical", service2: "Architectural", element1: "High Voltage Conduit Run", element2: "Precast Concrete Column 12", status: "New", severity: "Minor", assignee: "Alex Rivera" },
  ]);

  // RFI/Issue creation states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemService, setNewItemService] = useState("Architectural");
  const [newItemPriority, setNewItemPriority] = useState("Medium");
  const [newItemAssignee, setNewItemAssignee] = useState("Snehasis Mohapatra");
  const [expandedAssignmentTeams, setExpandedAssignmentTeams] = useState<Record<string, boolean>>({});
  const [visibleAssignmentMembers, setVisibleAssignmentMembers] = useState<Record<string, string[]>>({});
  const [assignmentMemberPicker, setAssignmentMemberPicker] = useState<Record<string, string>>({});

  // --- BIM COORDINATION DRAWING MARKUP & DISCUSSIONS SYSTEM ---
  const [coordinationZoom, setCoordinationZoom] = useState(1.0);
  const [coordinationPan, setCoordinationPan] = useState({ x: 0, y: 0 });
  const [coordinationActiveMarkupTool, setCoordinationActiveMarkupTool] = useState<"cloud" | "polygon" | "line" | "circle" | "arrow" | "rect" | null>(
    initialCoordinationItem?.isNewAction ? "cloud" : null
  );
  const [coordinationSelectedMarkupId, setCoordinationSelectedMarkupId] = useState<string | null>(null);
  const [pendingMarkupItemId, setPendingMarkupItemId] = useState<string | null>(
    initialCoordinationItem?.isNewAction ? initialCoordinationItem.id : null
  );
  const [pendingNewMarkupComment, setPendingNewMarkupComment] = useState<any | null>(null);
  const [newMarkupItemType, setNewMarkupItemType] = useState<"rfi" | "issue">("issue");
  const [newMarkupCommentText, setNewMarkupCommentText] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [rightPanelCommentText, setRightPanelCommentText] = useState("");
  const [expandedCoordinationAssignee, setExpandedCoordinationAssignee] = useState(false);
  const [coordinationItemComments, setCoordinationItemComments] = useState<Record<string, any[]>>({});
  const [coordinationDrawingPoints, setCoordinationDrawingPoints] = useState<Array<{x: number; y: number}>>([]);
  const [isDrawingMarkup, setIsDrawingMarkup] = useState(false);
  const [drawingStartPoint, setDrawingStartPoint] = useState<{x: number; y: number} | null>(null);
  const [isCoordinationPanningDrawing, setIsCoordinationPanningDrawing] = useState(false);
  const [coordinationDrawingPanStart, setCoordinationDrawingPanStart] = useState({ x: 0, y: 0 });

  const [coordinationMarkups, setCoordinationMarkups] = useState<any[]>([
    {
      id: "markup-1",
      itemId: "RFI-101",
      type: "cloud",
      x: 480,
      y: 245,
      width: 140,
      height: 90,
      comments: [
        { id: "c1", author: "Snehasis Mohapatra", avatar: "SM", time: "2 hours ago", text: "HVAC Duct clash with structural steel beam at grid B-4." },
        { id: "c2", author: "Alex Rivera", avatar: "AR", time: "1 hour ago", text: "We need to rotate the VAV box 90 degrees to fit between the trusses." }
      ]
    },
    {
      id: "markup-2",
      itemId: "ISS-301",
      type: "rect",
      x: 520,
      y: 110,
      width: 70,
      height: 45,
      comments: [
        { id: "c3", author: "Emma Watson", avatar: "EW", time: "Yesterday", text: "Cold water main pipe intersecting cable tray here." },
        { id: "c4", author: "Snehasis Mohapatra", avatar: "SM", time: "5 hours ago", text: "Double check clearance from the main distribution board." }
      ]
    },
    {
      id: "markup-3",
      itemId: "RFI-103",
      type: "circle",
      x: 230,
      y: 180,
      radius: 35,
      width: 70,
      height: 70,
      comments: [
        { id: "c5", author: "Emma Watson", avatar: "EW", time: "3 days ago", text: "Clarification needed on concrete anchor bolt specifications." }
      ]
    },
    {
      id: "markup-cl-501",
      itemId: "CL-501",
      type: "cloud",
      x: 455,
      y: 255,
      width: 155,
      height: 85,
      comments: [
        { id: "c-cl-501", author: "Emma Watson", avatar: "EW", time: "Just now", text: "MEP duct intersects the structural beam. Assign the resolution owner before closing this clash." }
      ]
    },
    {
      id: "markup-cl-502",
      itemId: "CL-502",
      type: "rect",
      x: 175,
      y: 295,
      width: 125,
      height: 70,
      comments: [
        { id: "c-cl-502", author: "Snehasis Mohapatra", avatar: "SM", time: "Just now", text: "Plumbing line and cable tray overlap at the service corridor crossing." }
      ]
    },
    {
      id: "markup-cl-503",
      itemId: "CL-503",
      type: "circle",
      x: 335,
      y: 125,
      width: 84,
      height: 84,
      radius: 42,
      comments: [
        { id: "c-cl-503", author: "Alex Rivera", avatar: "AR", time: "Just now", text: "Electrical conduit route requires architectural clearance review." }
      ]
    }
  ]);

  const zoomToMarkup = (m: any) => {
    const targetZoom = 1.8;
    setCoordinationSelectedMarkupId(m.id);
    setCoordinationZoom(targetZoom);
    const cx = m.x + (m.width || 0) / 2;
    const cy = m.y + (m.height || 0) / 2;
    setCoordinationPan({
      x: -(cx - 400) * targetZoom,
      y: -(cy - 250) * targetZoom
    });
  };

  const handleItemClick = (itemId: string) => {
    setSelectedCoordinationItemId(itemId);
    setExpandedCoordinationAssignee(false);
    const linkedMarkup = coordinationMarkups.find(m => m.itemId === itemId);
    if (linkedMarkup) {
      zoomToMarkup(linkedMarkup);
      triggerToast(`Focused ${itemId} comment thread`, "success");
    } else {
      setPendingMarkupItemId(itemId);
      setCoordinationActiveMarkupTool("cloud");
      triggerToast(`No markup linked. Select a tool and drag on the drawing to link ${itemId}.`, "info");
    }
  };

  // Document references for measuring/bounding
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingLibraryInputRef = useRef<HTMLInputElement>(null);
  const uploadMoreInputRef = useRef<HTMLInputElement>(null);
  const drawingDropdownRef = useRef<HTMLDivElement>(null);
  const [isDrawingDropdownOpen, setIsDrawingDropdownOpen] = useState(false);
  const splitDropdownRef = useRef<HTMLDivElement>(null);
  const [isSplitDropdownOpen, setIsSplitDropdownOpen] = useState(false);
  const [isDefaultViewModalOpen, setIsDefaultViewModalOpen] = useState(false);
  const drawingCanvasContentRef = useRef<HTMLDivElement>(null);

  // --- MAP STATE ---
  const [searchQuery, setSearchQuery] = useState("668X, Patia, Bhubaneswar");
  const [activeQuery, setActiveQuery] = useState("668X, Patia, Bhubaneswar");
  const [mapPan, setMapPan] = useState({ x: -250, y: -250 });
  const [mapZoom, setMapZoom] = useState(1.1);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Map Tools: 'pan' | 'pin' | 'circle' | 'polygon' | 'nestedPolygon'
  const [activeTool, setActiveTool] = useState<"pan" | "pin" | "circle" | "polygon" | "nestedPolygon">("pan");
  
  // Custom Markups drawn on the map (Initially empty, user will draw from scratch)
  const [markups, setMarkups] = useState<Markup[]>([]);

  // Points currently being drawn (temp state)
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [redoPoints, setRedoPoints] = useState<Point[]>([]);
  const [nestedDrawingPoints, setNestedDrawingPoints] = useState<Point[]>([]);
  const [nestedRedoPoints, setNestedRedoPoints] = useState<Point[]>([]);
  const [nestedDrawingParentId, setNestedDrawingParentId] = useState<string | null>(null);
  const [selectedMarkupId, setSelectedMarkupId] = useState<string | null>(null);
  const [selectedNestedLayerId, setSelectedNestedLayerId] = useState<string | null>(null);
  const [returnToDrawingAfterZone, setReturnToDrawingAfterZone] = useState(false);
  const [calibratingMarkupId, setCalibratingMarkupId] = useState<string | null>(null);
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(true);
  const [isInspectorPanelOpen, setIsInspectorPanelOpen] = useState(true);
  const [focusPulse, setFocusPulse] = useState<{ markupId: string; layerId?: string | null } | null>(null);
  const [isMapFocusing, setIsMapFocusing] = useState(false);
  
  // Node dragging state
  const [draggedNode, setDraggedNode] = useState<{ markupId: string; pointIndex: number } | null>(null);

  // Force body overflow and margins reset to guarantee absolute full screen viewport
  useEffect(() => {
    const originalMargin = document.body.style.margin;
    const originalPadding = document.body.style.padding;
    const originalOverflow = document.body.style.overflow;
    
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.margin = originalMargin;
      document.body.style.padding = originalPadding;
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawingDropdownRef.current && !drawingDropdownRef.current.contains(event.target as Node)) {
        setIsDrawingDropdownOpen(false);
      }
      if (splitDropdownRef.current && !splitDropdownRef.current.contains(event.target as Node)) {
        setIsSplitDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  
  // --- DRAWING SETUP STATE ---
  const [uploadedDrawing, setUploadedDrawing] = useState<string | null>(null);
  const [drawingMarkups, setDrawingMarkups] = useState<DrawingMarkup[]>([]);
  const [drawingTool, setDrawingTool] = useState<"pin" | "circle">("pin");
  const [drawingMarkupTool, setDrawingMarkupTool] = useState<"pointer" | "cloud" | "polygon" | "line" | "rect" | "circle" | "arrow">("pointer");
  const [isDrawingMarkupToolbarVisible, setIsDrawingMarkupToolbarVisible] = useState(false);
  const [drawingAdjustments, setDrawingAdjustments] = useState({
    zoom: 1.0,
    rotate: 0,
    panX: 0,
    panY: 0
  });
  const [isDrawingPanning, setIsDrawingPanning] = useState(false);
  const [drawingPanStart, setDrawingPanStart] = useState({ x: 0, y: 0 });

  // --- FIGMA-STYLE RULER AND GUIDELINES STATE ---
  const [showRulers] = useState(false);
  const [guidelines, setGuidelines] = useState<Array<{ id: string; type: "h" | "v"; coord: number }>>([]);
  const [draggingGuide, setDraggingGuide] = useState<{ id: string; type: "h" | "v"; isNew: boolean } | null>(null);
  const [hoveredCanvasPos, setHoveredCanvasPos] = useState<{ x: number; y: number } | null>(null);
  const drawingViewportRef = useRef<HTMLDivElement>(null);
  const [viewportDimensions, setViewportDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!drawingViewportRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setViewportDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(drawingViewportRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const UNITS_PER_PIXEL = 2.5;
  const BASE_COORD = 25000;

  const getRulerSteps = (zoom: number) => {
    const rawCoordPerStep = 250 / zoom;
    const niceSteps = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
    let stepUnit = niceSteps[0];
    let minDiff = Math.abs(rawCoordPerStep - stepUnit);
    for (const s of niceSteps) {
      const diff = Math.abs(rawCoordPerStep - s);
      if (diff < minDiff) {
        minDiff = diff;
        stepUnit = s;
      }
    }
    return stepUnit;
  };

  // --- FIGMA-STYLE COORDINATION RULER AND GUIDELINES STATE ---
  const [showCoordinationRulers, setShowCoordinationRulers] = useState(true);
  const [coordinationGuidelines, setGuidelinesCoordination] = useState<Array<{ id: string; type: "h" | "v"; coord: number }>>([
    { id: "c-guide-1", type: "v", coord: 24800 },
    { id: "c-guide-2", type: "h", coord: 25100 }
  ]);
  const [draggingCoordinationGuide, setDraggingCoordinationGuide] = useState<{ id: string; type: "h" | "v"; isNew: boolean } | null>(null);
  const [hoveredCoordinationCanvasPos, setHoveredCoordinationCanvasPos] = useState<{ x: number; y: number } | null>(null);
  const coordinationViewportRef = useRef<HTMLDivElement>(null);
  const [coordinationViewportDimensions, setCoordinationViewportDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (!coordinationViewportRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setCoordinationViewportDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(coordinationViewportRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const [isDrawingSetupModalOpen, setIsDrawingSetupModalOpen] = useState(false);
  const [isBlueprintSourceModalOpen, setIsBlueprintSourceModalOpen] = useState(false);
  const [blueprintSourceMode, setBlueprintSourceMode] = useState<"source" | "hub">("source");
  const [blueprintHubSearch, setBlueprintHubSearch] = useState("");
  const [uploadedDrawingFiles, setUploadedDrawingFiles] = useState<UploadedDrawingFile[]>([]);
  const [uploaded3DFiles, setUploaded3DFiles] = useState<UploadedDrawingFile[]>([
    { id: "demo-3d-1", name: "L01 Architectural Model.ifc", url: "/demo_plan_a.svg", service: "Architectural" },
    { id: "demo-3d-2", name: "L01 Structural Skeleton.ifc", url: "/demo_plan_b.svg", service: "Structural" },
    { id: "demo-3d-3", name: "L01 Mechanical HVAC.ifc", url: "/demo_plan_c.svg", service: "Mechanical" },
    { id: "demo-3d-4", name: "L02 Floor Model Layout.ifc", url: "/architectural_drawing.png", service: "Electrical" }
  ]);
  const [draggedDrawingId, setDraggedDrawingId] = useState<string | null>(null);
  const [dragOverServiceSlot, setDragOverServiceSlot] = useState<{ floorId: string; service: string } | null>(null);
  const [showDragGuide, setShowDragGuide] = useState(true);
  const [zoneDrawingConfigs, setZoneDrawingConfigs] = useState<Record<string, ZoneDrawingConfig>>({});
  const [floorInputs, setFloorInputs] = useState<Record<string, number>>({});
  const [expandedFloors, setExpandedFloors] = useState<Record<string, boolean>>({});
  const [hasLoadedDrawings, setHasLoadedDrawings] = useState<boolean>(false);
  const [activeEyeDrawing, setActiveEyeDrawing] = useState<{ zoneId: string; floorId: string; service: string } | null>(null);

  // New Drawing Workspace states
  const [drawingSetupSubTab, setDrawingSetupSubTab] = useState<"library" | "configure">("library");
  const [editingDrawingId, setEditingDrawingId] = useState<string | null>(null);
  const [drawingLibrarySearchQuery, setDrawingLibrarySearchQuery] = useState<string>("");
  const [previewDrawingFile, setPreviewDrawingFile] = useState<UploadedDrawingFile | null>(null);
  const [drawingLibraryViewMode, setDrawingLibraryViewMode] = useState<"list" | "grid">("grid");
  const [isDrawingLeftSetupOpen, setIsDrawingLeftSetupOpen] = useState<boolean>(true);
  const [isDrawingRightLayersOpen, setIsDrawingRightLayersOpen] = useState<boolean>(true);
  const [isUploadMoreModalOpen, setIsUploadMoreModalOpen] = useState<boolean>(false);
  const [uploadMoreSourceMode, setUploadMoreSourceMode] = useState<"source" | "device" | "hub">("source");
  const [uploadHubSearch, setUploadHubSearch] = useState<string>("");
  const [stagedUploadFiles, setStagedUploadFiles] = useState<File[]>([]);
  const [isUploadMoreProcessing, setIsUploadMoreProcessing] = useState<boolean>(false);
  const [uploadMoreProgress, setUploadMoreProgress] = useState<number>(0);
  const [uploadMoreFinished, setUploadMoreFinished] = useState<boolean>(false);
  const [isDraggingOverUploadArea, setIsDraggingOverUploadArea] = useState<boolean>(false);
  const [pendingZoneDropAssignment, setPendingZoneDropAssignment] = useState<{ zoneId: string; drawingId: string } | null>(null);
  const [pendingZoneDropLevelId, setPendingZoneDropLevelId] = useState<string>("");
  const [pendingZoneDropService, setPendingZoneDropService] = useState<DrawingService>("Architectural");
  const [quickSetupZoneId, setQuickSetupZoneId] = useState<string | null>(null);
  const [quickSetupDrawingIds, setQuickSetupDrawingIds] = useState<string[]>([]);
  const [quickSetupFloorCount, setQuickSetupFloorCount] = useState<number>(2);
  const [quickSetupServices, setQuickSetupServices] = useState<DrawingService[]>(["Architectural", "Structural", "Mechanical"]);
  const [quickSetupAssignments, setQuickSetupAssignments] = useState<Record<string, Partial<Record<DrawingService, string>>>>({});
  const [quickSetupHighlightedZoneId, setQuickSetupHighlightedZoneId] = useState<string | null>(null);
  const [drawingAnnotations, setDrawingAnnotations] = useState<Record<string, DrawingMarkup[]>>({});
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(null);
  const [activeDrawingUrl, setActiveDrawingUrl] = useState<string | null>(null);
  const [activeDrawingLabel, setActiveDrawingLabel] = useState<string>("");
  const [selectedDrawingAreaId, setSelectedDrawingAreaId] = useState<string | null>(null);
  const [renamingLayer, setRenamingLayer] = useState<{ type: "area" | "zone" | "floor" | "drawing"; id: string; parentId?: string } | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [boundaryPlacementTarget, setBoundaryPlacementTarget] = useState<string | "fresh" | null>(null);
  const [sitePlanAssignmentBoundaryId, setSitePlanAssignmentBoundaryId] = useState<string | null>(null);
  const [sitePlanAssignmentSuggestedId, setSitePlanAssignmentSuggestedId] = useState<string | null>(null);
  const [active3DLink, setActive3DLink] = useState<{ zoneId: string; floorId: string; service: string } | null>(null);
  const [isDrawingStackedView, setIsDrawingStackedView] = useState<boolean>(false);
  const blueprintLocalInputRef = useRef<HTMLInputElement>(null);
  const quickSetupPromptedAreaIdRef = useRef<string | null>(null);

  const [uploadedDroneImages, setUploadedDroneImages] = useState<UploadedDrawingFile[]>([
    { id: "drone-1", name: "Drone_Capture_North_Zone_May20.jpg", url: "https://images.unsplash.com/photo-1579829363373-c9694d41a970?auto=format&fit=crop&w=800&q=80", service: "Drone" },
    { id: "drone-2", name: "Drone_Capture_South_East_Building_May21.jpg", url: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80", service: "Drone" },
    { id: "drone-3", name: "Drone_Capture_Core_Shaft_Weekly.jpg", url: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80", service: "Drone" },
  ]);
  const [zoneDroneAssignments, setZoneDroneAssignments] = useState<Record<string, string>>({});
  const [activeDroneEyes, setActiveDroneEyes] = useState<Record<string, boolean>>({});

	  const currentFilesList = activeTab === "3d" ? uploaded3DFiles : (activeTab === "drone" ? uploadedDroneImages : uploadedDrawingFiles);
	  const setCurrentFilesList = activeTab === "3d" ? setUploaded3DFiles : (activeTab === "drone" ? setUploadedDroneImages : setUploadedDrawingFiles);
	  const hasLoadedAny = activeTab === "3d" ? true : (activeTab === "drone" ? uploadedDroneImages.length > 0 : hasLoadedDrawings);
  const sitePlanDrawingUrls = useMemo(
    () => new Set(markups.map((markup) => markup.drawingOverlay?.url).filter(Boolean) as string[]),
    [markups]
  );
  const assignableDrawingFiles = useMemo(
    () => uploadedDrawingFiles.filter((file) => !sitePlanDrawingUrls.has(file.url)),
    [sitePlanDrawingUrls, uploadedDrawingFiles]
  );
  const filteredHubBlueprintFiles = HUB_BLUEPRINT_FILES.filter((file) =>
    file.name.toLowerCase().includes(blueprintHubSearch.toLowerCase()) ||
    file.service.toLowerCase().includes(blueprintHubSearch.toLowerCase())
  );
  const activeLibraryHubFiles = activeTab === "3d" ? HUB_3D_MODEL_FILES : HUB_BLUEPRINT_FILES;
  const filteredLibraryHubFiles = activeLibraryHubFiles.filter((file) =>
    file.name.toLowerCase().includes(uploadHubSearch.toLowerCase()) ||
    file.service.toLowerCase().includes(uploadHubSearch.toLowerCase())
  );

  const activeArea = useMemo(() => {
    const siteAreas = markups.filter((m) => m.type === "area");
    if (siteAreas.length === 0) return null;
    const found = siteAreas.find((area) => area.id === selectedDrawingAreaId);
    return found || siteAreas[0];
  }, [markups, selectedDrawingAreaId]);

  const getNextSiteBoundaryName = (items = markups) =>
    `Site Boundary ${items.filter((m) => m.type === "area").length + 1}`;

  const startRenameLayer = (target: { type: "area" | "zone" | "floor" | "drawing"; id: string; parentId?: string }, currentName: string) => {
    setRenamingLayer(target);
    setRenameDraft(currentName);
  };

  const cancelRenameLayer = () => {
    setRenamingLayer(null);
    setRenameDraft("");
  };

  const commitRenameLayer = () => {
    if (!renamingLayer) return;
    const nextName = renameDraft.trim();
    if (!nextName) {
      cancelRenameLayer();
      return;
    }

    if (renamingLayer.type === "area") {
      setMarkups((prev) =>
        prev.map((markup) => markup.id === renamingLayer.id ? { ...markup, label: nextName } : markup)
      );
    } else if (renamingLayer.type === "zone" && renamingLayer.parentId) {
      setMarkups((prev) =>
        prev.map((markup) =>
          markup.id === renamingLayer.parentId
            ? {
                ...markup,
                childLayers: updateLayerTree(markup.childLayers || [], renamingLayer.id, (layer) => ({
                  ...layer,
                  label: nextName
                }))
              }
            : markup
        )
      );
    } else if (renamingLayer.type === "floor" && renamingLayer.parentId) {
      updateZoneConfig(renamingLayer.parentId, (config) => ({
        ...config,
        floorsList: config.floorsList.map((floor) =>
          floor.id === renamingLayer.id ? { ...floor, name: nextName } : floor
        )
      }));
    } else if (renamingLayer.type === "drawing") {
      setUploadedDrawingFiles((prev) =>
        prev.map((file) => file.id === renamingLayer.id ? { ...file, name: nextName } : file)
      );
    }

    triggerToast(`Renamed to ${nextName}`);
    cancelRenameLayer();
  };

  const renderEditableLayerName = (
    target: { type: "area" | "zone" | "floor" | "drawing"; id: string; parentId?: string },
    name: string,
    className: string
  ) => {
    const isEditing =
      renamingLayer?.type === target.type &&
      renamingLayer.id === target.id &&
      renamingLayer.parentId === target.parentId;

    if (isEditing) {
      return (
        <input
          value={renameDraft}
          autoFocus
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onChange={(event) => setRenameDraft(event.target.value)}
          onBlur={commitRenameLayer}
          onKeyDown={(event) => {
            if (event.key === "Enter") commitRenameLayer();
            if (event.key === "Escape") cancelRenameLayer();
          }}
          className="min-w-0 flex-1 rounded-md border border-blue-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-800 outline-none focus:border-blue-500"
        />
      );
    }

    return (
      <span
        className={className}
        title="Double-click to rename"
        onDoubleClick={(event) => {
          event.stopPropagation();
          startRenameLayer(target, name);
        }}
      >
        {name}
      </span>
    );
  };

  const startPlaceBoundaryOnMap = (areaId: string) => {
    setActiveTab("map");
    setSelectedDrawingAreaId(areaId);
    setSelectedMarkupId(areaId);
    setSelectedNestedLayerId(null);
    setBoundaryPlacementTarget(areaId);
    setDrawingPoints([]);
    setRedoPoints([]);
    setActiveTool("polygon");
    triggerToast("Draw this pending site boundary on the map. It will stay linked to the base drawing.");
  };

  const createNewDrawingSitePlan = (file?: UploadedDrawingFile) => {
    const targetId = `drawing-workspace-${Date.now()}`;
    const overlay = file ? makeDrawingOverlay(file.url) : null;

    setMarkups((prev) => [
      ...prev,
      {
        id: targetId,
        type: "area",
        label: getNextSiteBoundaryName(prev),
        color: "#2563eb",
        points: [
          { x: 520, y: 260 },
          { x: 1220, y: 260 },
          { x: 1220, y: 900 },
          { x: 520, y: 900 }
        ],
        drawingOverlay: overlay,
        childLayers: [],
        createdFromDrawing: true,
        isPlacedOnMap: false
      }
    ]);

    setSelectedDrawingAreaId(targetId);
    setSelectedMarkupId(targetId);
    setSelectedNestedLayerId(null);
    setActiveEyeDrawing(null);
    setActiveDrawingId(null);
    setActiveDrawingUrl(null);
    setActiveDrawingLabel("");
    if (file) {
      setUploadedDrawing(file.url);
      setHasLoadedDrawings(true);
    }
    setDrawingSetupSubTab("configure");
    setIsDrawingLeftSetupOpen(true);
    setIsDrawingRightLayersOpen(true);
    triggerToast(file ? `Created new site plan from ${file.name}` : "Created new empty site plan. Add a base drawing before zoning.");
  };

  const createNewDrawingSitePlanFromNextAvailable = () => {
    const usedUrls = new Set(markups.map((markup) => markup.drawingOverlay?.url).filter(Boolean));
    const nextFile = uploadedDrawingFiles.find((file) => !usedUrls.has(file.url));
    createNewDrawingSitePlan(nextFile);
  };

  const ensureDrawingSetupAreaFromFile = (file: UploadedDrawingFile, replaceExistingOverlay = false) => {
    const existingArea =
      (selectedDrawingAreaId ? markups.find((m) => m.type === "area" && m.id === selectedDrawingAreaId) : null) ||
      markups.find((m) => m.type === "area") ||
      null;
    const targetId = existingArea?.id || `drawing-workspace-${Date.now()}`;
    const overlay = makeDrawingOverlay(file.url);

    setMarkups((prev) => {
      const selectedExisting =
        (selectedDrawingAreaId ? prev.find((m) => m.type === "area" && m.id === selectedDrawingAreaId) : null) ||
        prev.find((m) => m.type === "area") ||
        null;

      if (selectedExisting) {
        return prev.map((markup) =>
          markup.id === selectedExisting.id
            ? {
                ...markup,
                label: markup.label || "Drawing Workspace",
                drawingOverlay: replaceExistingOverlay || !markup.drawingOverlay ? overlay : markup.drawingOverlay,
                childLayers: markup.childLayers || [],
                createdFromDrawing: markup.createdFromDrawing ?? false,
                isPlacedOnMap: markup.isPlacedOnMap ?? true
              }
            : markup
        );
      }

      const drawingArea: Markup = {
        id: targetId,
        type: "area",
        label: getNextSiteBoundaryName(prev),
        color: "#2563eb",
        points: [
          { x: 520, y: 260 },
          { x: 1220, y: 260 },
          { x: 1220, y: 900 },
          { x: 520, y: 900 }
        ],
        drawingOverlay: overlay,
        childLayers: [],
        createdFromDrawing: true,
        isPlacedOnMap: false
      };

      return [...prev, drawingArea];
    });

    const selectedId = existingArea?.id || targetId;
    setSelectedDrawingAreaId(selectedId);
    setSelectedMarkupId(selectedId);
    setSelectedNestedLayerId(null);
    setActiveEyeDrawing(null);
    setActiveDrawingId(null);
    setActiveDrawingUrl(null);
    setActiveDrawingLabel("");
    setUploadedDrawing(file.url);
    setHasLoadedDrawings(true);
    setDrawingSetupSubTab("configure");
    setIsDrawingLeftSetupOpen(true);
    setIsDrawingRightLayersOpen(true);
  };

  const activeAreaZoneCount = activeArea?.childLayers?.length || 0;
  const shouldShowCreateZonesGuide = activeTab === "map" && activeTool === "pan" && activeArea?.isPlacedOnMap !== false && Boolean(activeArea?.drawingOverlay) && activeAreaZoneCount === 0;
  const shouldShowDrawingSetupGuide = activeTab === "map" && activeTool === "pan" && activeArea?.isPlacedOnMap !== false && Boolean(activeArea?.drawingOverlay) && activeAreaZoneCount > 0;
  const activeAreaLevelCount = (activeArea?.childLayers || []).reduce((count, zone) => {
    return count + (zoneDrawingConfigs[zone.id]?.floorsList.length || 0);
  }, 0);
  const activeAreaNeedsQuickSetup =
    activeTab === "drawing" &&
    activeAreaZoneCount > 0 &&
    activeAreaLevelCount === 0;
  const shouldShowLevelReadyGuide = (activeTab === "drawing" || activeTab === "3d") && drawingSetupSubTab === "configure" && activeAreaLevelCount > 0;

  const currentDrawingUrl = useMemo(() => {
    if (activeTab === "drawing" && activeEyeDrawing) {
      const config = zoneDrawingConfigs[activeEyeDrawing.zoneId];
      if (config) {
        const floor = config.floorsList.find((f) => f.id === activeEyeDrawing.floorId);
        if (floor) {
          const drawingId = floor.assignments[activeEyeDrawing.service];
          if (drawingId) {
            const file = uploadedDrawingFiles.find((d) => d.id === drawingId);
            if (file) return file.url;
          }
        }
      }
    }
    if (activeArea) return activeArea.drawingOverlay?.url || null;
    return uploadedDrawingFiles[0]?.url || null;
  }, [activeTab, activeEyeDrawing, zoneDrawingConfigs, uploadedDrawingFiles, activeArea]);

  const currentDrawingLabel = useMemo(() => {
    if (activeTab === "drawing" && activeEyeDrawing) {
      const config = zoneDrawingConfigs[activeEyeDrawing.zoneId];
      if (config) {
        const floor = config.floorsList.find((f) => f.id === activeEyeDrawing.floorId);
        if (floor) {
          const drawingId = floor.assignments[activeEyeDrawing.service];
          if (drawingId) {
            const file = uploadedDrawingFiles.find((d) => d.id === drawingId);
            if (file) return `${floor.name} - ${activeEyeDrawing.service} (${file.name})`;
          }
          return `${floor.name} - ${activeEyeDrawing.service}`;
        }
      }
    }
    if (activeArea) return activeArea.drawingOverlay ? `${activeArea.label} - Base Plan` : `${activeArea.label} - No base plan linked`;
    return uploadedDrawingFiles[0]?.name || "";
  }, [activeTab, activeEyeDrawing, zoneDrawingConfigs, uploadedDrawingFiles, activeArea]);

  useEffect(() => {
    const siteAreas = markups.filter((m) => m.type === "area");
    if (siteAreas.length > 0 && !selectedDrawingAreaId) {
      setSelectedDrawingAreaId(siteAreas[0].id);
    }
  }, [markups, selectedDrawingAreaId]);

  // Tooltips & Notifications
  const [toastMessage, setToastMessage] = useState<string | null>("Welcome! Upload a drawing or choose a setup view to start.");

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (!isResizingBimPanel && !isResizingRfiPanel && !resizingSplitPanel && !isResizingSplitDivider) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (isResizingBimPanel) {
        const nextWidth = Math.min(560, Math.max(280, window.innerWidth - event.clientX));
        setBimCoordinationPanelWidth(nextWidth);
      }
      if (isResizingRfiPanel) {
        const nextWidth = Math.min(560, Math.max(280, event.clientX));
        setRfiPanelWidth(nextWidth);
      }
      if (resizingSplitPanel === "left") {
        const nextWidth = Math.min(430, Math.max(210, event.clientX));
        setSplitLayerPanelWidth((prev) => ({ ...prev, left: nextWidth }));
      }
      if (resizingSplitPanel === "right") {
        const nextWidth = Math.min(430, Math.max(210, window.innerWidth - event.clientX));
        setSplitLayerPanelWidth((prev) => ({ ...prev, right: nextWidth }));
      }
      if (isResizingSplitDivider) {
        const nextRatio = Math.min(75, Math.max(25, (event.clientX / window.innerWidth) * 100));
        setSplitPaneRatio(nextRatio);
      }
    };

    const handleMouseUp = () => {
      setIsResizingBimPanel(false);
      setIsResizingRfiPanel(false);
      setResizingSplitPanel(null);
      setIsResizingSplitDivider(false);
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizingBimPanel, isResizingRfiPanel, resizingSplitPanel, isResizingSplitDivider]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!activeArea || !activeAreaNeedsQuickSetup) return;
    setDrawingSetupSubTab("library");
    setIsDrawingLeftSetupOpen(true);
    if (quickSetupPromptedAreaIdRef.current !== activeArea.id) {
      quickSetupPromptedAreaIdRef.current = activeArea.id;
      triggerToast("Zones are ready. Upload floor/service drawings, then drag them onto a zone for quick setup.");
    }
  }, [activeArea?.id, activeAreaNeedsQuickSetup]);

  const handleSetDefaultViewerTab = (tab: ViewerTab) => {
    setDefaultViewerTab(tab);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getViewerDefaultTabKey(), tab);
    }
    setIsDefaultViewModalOpen(false);
    triggerToast(`${VIEWER_TAB_LABELS[tab]} set as the default project view.`);
  };

  const exportViewToPdf = () => {
    triggerToast("Capturing current viewport configuration...");
    
    // Create a vector PDF with metadata and structural blueprint header
    const currentTabName = activeTab === "coordination" ? "BIM Coordination View" : activeTab === "split" ? "Split Screen View" : activeTab.toUpperCase();
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 450 >>
stream
BT
/F1 18 Tf
72 720 Td
(BIMBOX PORTABLE BLUEPRINT EXPORT) Tj
ET
BT
/F2 10 Tf
72 690 Td
(Exported Date: ${new Date().toLocaleString()}) Tj
ET
BT
/F2 10 Tf
72 675 Td
(Active View: ${currentTabName}) Tj
ET
BT
/F2 10 Tf
72 660 Td
(Central HUB Repository Path: /Users/snehasismohapatra/Downloads/HUB) Tj
ET
BT
/F1 12 Tf
72 620 Td
(VIEWPORT SPECIFICATION & METADATA) Tj
ET
BT
/F2 9 Tf
72 590 Td
(- Coordination Clashes Tracked: ${clashResults.length} items) Tj
ET
BT
/F2 9 Tf
72 575 Td
(- Coordination RFIs Tracked: ${rfis.length} items) Tj
ET
BT
/F2 9 Tf
72 560 Td
(- Coordination Quality Issues: ${issues.length} items) Tj
ET
BT
/F2 9 Tf
72 545 Td
(- Viewport Zoom Scale: ${coordinationZoom ? coordinationZoom.toFixed(2) : "1.00"}x) Tj
ET
BT
/F2 9 Tf
72 510 Td
(Generated via BIMBOX Viewer. All coordinates and linked drawing layers preserved.) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000056 00005 n 
0000000111 00000 n 
0000000295 00000 n 
trailer
<< /Size 5 /Root 1 0 R >>
startxref
790
%%EOF`;

    setTimeout(() => {
      triggerToast("Compiling layout data and metadata...");
      setTimeout(() => {
        const blob = new Blob([pdfContent], { type: "application/pdf" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `BIMBOX_Export_${activeTab.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        triggerToast("Viewport PDF exported and downloaded successfully!");
      }, 1000);
    }, 1000);
  };

  // --- SIMULATED SEARCH ACTION ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveQuery(searchQuery);
      // Center map pan to middle for visual effect
      setMapPan({ x: -200, y: -200 });
      setMapZoom(1.2);
      triggerToast(`Map centered to: ${searchQuery}`);
    }
  };

  // --- PANNING LOGIC ---
  const handleMapMouseDown = (e: React.MouseEvent) => {
    if (activeTool !== "pan") return; // Let drawing tools take precedence
    setIsPanning(true);
    setPanStart({ x: e.clientX - mapPan.x, y: e.clientY - mapPan.y });
  };

  const handleMapMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setMapPan({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y
    });
  };

  const handleMapMouseUpOrLeave = () => {
    setIsPanning(false);
  };

  const handleMapWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.08;
    const newZoom = e.deltaY < 0 ? mapZoom * zoomFactor : mapZoom / zoomFactor;
    setMapZoom(Math.min(Math.max(newZoom, 0.4), 4.0));
  };

  // --- DRAWING MARKUPS ON THE MAP ---
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === "pan") return;

    // Get click coords relative to the SVG map space (3000x3000 coordinate system)
    const svgElement = e.currentTarget;
    const rect = svgElement.getBoundingClientRect();
    
    // Scale according to active pan and zoom
    const clickX = (e.clientX - rect.left) * (3000 / rect.width);
    const clickY = (e.clientY - rect.top) * (3000 / rect.height);
    
    const newPoint = { x: Math.round(clickX), y: Math.round(clickY) };

    if (activeTool === "nestedPolygon") {
      const selectedMarkup = markups.find((m) => m.id === selectedMarkupId);
      if (!selectedMarkup) {
        triggerToast("Select a site boundary before drawing nested zones.");
        return;
      }

      const targetBox = getLayerAbsoluteBox(selectedMarkup, nestedDrawingParentId);
      if (!targetBox) {
        triggerToast("Could not find the selected parent drawing layer.");
        return;
      }

      const normalizedPoint = {
        x: Math.round(Math.max(0, Math.min(100, ((clickX - targetBox.left) / targetBox.width) * 100))),
        y: Math.round(Math.max(0, Math.min(100, ((clickY - targetBox.top) / targetBox.height) * 100)))
      };
      const updatedPoints = [...nestedDrawingPoints, normalizedPoint];

      let shouldClose = false;
      if (nestedDrawingPoints.length >= 2) {
        const firstPoint = nestedDrawingPoints[0];
        const firstAbsX = targetBox.left + (firstPoint.x / 100) * targetBox.width;
        const firstAbsY = targetBox.top + (firstPoint.y / 100) * targetBox.height;
        if (getDistance({ x: firstAbsX, y: firstAbsY }, newPoint) < 50) {
          shouldClose = true;
        }
      }

      if (shouldClose) {
        completeNestedLayerDrawing(nestedDrawingPoints);
        setNestedRedoPoints([]);
      } else {
        setNestedDrawingPoints(updatedPoints);
        setNestedRedoPoints([]);
      }

      return;
    }

    if (activeTool === "pin") {
      const id = `pin-${Date.now()}`;
      const newMarkup: Markup = {
        id,
        type: "pin",
        color: "#3b82f6", // Blue
        label: `Marker Pin ${markups.length + 1}`,
        points: [newPoint]
      };
      setMarkups([...markups, newMarkup]);
      setSelectedMarkupId(id);
      setSelectedNestedLayerId(null);
      setActiveTool("pan");
      triggerToast("Dropped marker pin on map");
    } 
    // Circle markup with center and radius edge
    else if (activeTool === "circle") {
      const id = `circle-${Date.now()}`;
      const newMarkup: Markup = {
        id,
        type: "circle",
        color: "#ef4444", // Red
        label: `Borehole Zone ${markups.length + 1}`,
        points: [newPoint, { x: newPoint.x + 120, y: newPoint.y }] // default radius 120 on 3000px grid
      };
      setMarkups([...markups, newMarkup]);
      setSelectedMarkupId(id);
      setSelectedNestedLayerId(null);
      setActiveTool("pan");
      triggerToast("Placed coordinate circle");
    } 
    else if (activeTool === "polygon") {
      const updatedPoints = [...drawingPoints, newPoint];
      // Check if we clicked close to the first point to close the area polygon
      if (updatedPoints.length > 2 && getDistance(updatedPoints[0], newPoint) < 50) {
        completeAreaDrawing(updatedPoints.slice(0, -1));
        setRedoPoints([]);
      } else {
        setDrawingPoints(updatedPoints);
        setRedoPoints([]); // Reset redo stack when a new point is drawn
      }
    }
  };

  // Node Dragging SVG handlers
  const handleSVGMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNode) return;
    const svgElement = e.currentTarget;
    const rect = svgElement.getBoundingClientRect();
    
    const clickX = (e.clientX - rect.left) * (3000 / rect.width);
    const clickY = (e.clientY - rect.top) * (3000 / rect.height);
    
    const newX = Math.max(0, Math.min(3000, Math.round(clickX)));
    const newY = Math.max(0, Math.min(3000, Math.round(clickY)));
 
    setMarkups((prev) =>
      prev.map((m) => {
        if (m.id === draggedNode.markupId) {
          const newPoints = [...m.points];
          newPoints[draggedNode.pointIndex] = { x: newX, y: newY };
          return { ...m, points: newPoints };
        }
        return m;
      })
    );
  };

  const handleSVGMouseUp = () => {
    if (draggedNode) {
      setDraggedNode(null);
      triggerToast("Adjusted node vertex position");
    }
  };

  const getDistance = (p1: Point, p2: Point) => {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
  };

  const getRelativePolygonPoints = (points: Point[], bounds: DrawingLayer["bounds"]) => {
    if (points.length === 0) {
      return [
        { x: 0, y: 0 },
        { x: 100, y: 0 },
        { x: 100, y: 100 },
        { x: 0, y: 100 }
      ];
    }

    return points.map((point) => ({
      x: bounds.width === 0 ? 0 : ((point.x - bounds.x) / bounds.width) * 100,
      y: bounds.height === 0 ? 0 : ((point.y - bounds.y) / bounds.height) * 100
    }));
  };

  const getBoundsFromPoints = (points: Point[]) => {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    return {
      x: Math.max(0, minX),
      y: Math.max(0, minY),
      width: Math.max(maxX - minX, 5),
      height: Math.max(maxY - minY, 5)
    };
  };

  const focusMapOnBox = (
    box: { left: number; top: number; width: number; height: number },
    target: { markupId: string; layerId?: string | null }
  ) => {
    const viewport = mapViewportRef.current;
    if (!viewport) return;

    const viewportWidth = viewport.clientWidth;
    const viewportHeight = viewport.clientHeight;
    const safeWidth = Math.max(box.width, 80);
    const safeHeight = Math.max(box.height, 80);
    const fitZoom = Math.min((viewportWidth * 0.5) / safeWidth, (viewportHeight * 0.5) / safeHeight);
    const nextZoom = Math.min(Math.max(mapZoom, fitZoom, 1.35), 3.2);
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;

    setIsMapFocusing(true);
    setMapZoom(nextZoom);
    setMapPan({
      x: (1500 - centerX) * nextZoom,
      y: (1500 - centerY) * nextZoom
    });
    setFocusPulse(target);

    window.setTimeout(() => setFocusPulse(null), 1700);
    window.setTimeout(() => setIsMapFocusing(false), 850);
  };

  const focusMapOnMarkup = (markup: Markup) => {
    const { x, y, width, height } = getMarkupCenter(markup);
    focusMapOnBox(
      {
        left: x - width / 2,
        top: y - height / 2,
        width,
        height
      },
      { markupId: markup.id }
    );
  };

  const completeAreaDrawing = (pointsToSubmit: Point[]) => {
    const id = `area-${Date.now()}`;
    const newMarkup: Markup = {
      id,
      type: "area",
      color: "#eab308", // Yellow
      label: getNextSiteBoundaryName(),
      points: pointsToSubmit,
      drawingOverlay: null,
      isPlacedOnMap: true,
      createdFromDrawing: false
    };
    setMarkups([...markups, newMarkup]);
    setSelectedMarkupId(id);
    setSelectedDrawingAreaId(id);
    setSelectedNestedLayerId(null);
    setDrawingPoints([]);
    setRedoPoints([]);
    setActiveTool("pan");
    focusMapOnMarkup(newMarkup);
    const suggestedPlanId = boundaryPlacementTarget && boundaryPlacementTarget !== "fresh" ? boundaryPlacementTarget : null;
    setSitePlanAssignmentBoundaryId(id);
    setSitePlanAssignmentSuggestedId(suggestedPlanId);
    setBoundaryPlacementTarget(null);
    triggerToast("Site boundary created. Choose which site plan should be assigned.");
  };

  const clearAreaDraft = () => {
    setDrawingPoints([]);
    setRedoPoints([]);
  };

  const clearNestedDraft = () => {
    setNestedDrawingPoints([]);
    setNestedRedoPoints([]);
    setNestedDrawingParentId(null);
  };

  const cancelAreaDrawing = () => {
    clearAreaDraft();
    clearNestedDraft();
    setActiveTool("pan");
  };

  const handleUndoPoint = () => {
    if (drawingPoints.length === 0) return;
    const lastPoint = drawingPoints[drawingPoints.length - 1];
    setDrawingPoints(drawingPoints.slice(0, -1));
    setRedoPoints((prev) => [...prev, lastPoint]);
    triggerToast("Undid last point");
  };

  const handleRedoPoint = () => {
    if (redoPoints.length === 0) return;
    const nextPoint = redoPoints[redoPoints.length - 1];
    setRedoPoints(redoPoints.slice(0, -1));
    setDrawingPoints((prev) => [...prev, nextPoint]);
    triggerToast("Redid last point");
  };

  const handleCompleteDrawing = () => {
    if (drawingPoints.length < 3) {
      triggerToast("You need at least 3 points to complete the shape!");
      return;
    }
    completeAreaDrawing(drawingPoints);
  };

  const pendingDrawingSitePlans = markups.filter((m) => m.type === "area" && m.isPlacedOnMap === false);

  const availableSitePlanSources = markups.filter((m) => m.type === "area" && Boolean(m.drawingOverlay));

  const assignSitePlanToBoundary = (boundaryId: string, sourcePlanId: string | null) => {
    const sourcePlan = sourcePlanId ? markups.find((markup) => markup.id === sourcePlanId) : null;

    setMarkups((prev) =>
      prev.map((markup) => {
        if (markup.id !== boundaryId) return markup;

        if (!sourcePlan) {
          return {
            ...markup,
            drawingOverlay: null,
            childLayers: []
          };
        }

        return {
          ...markup,
          drawingOverlay: sourcePlan.drawingOverlay ? { ...sourcePlan.drawingOverlay } : null,
          childLayers: sourcePlan.childLayers ? sourcePlan.childLayers.map((layer) => ({ ...layer })) : [],
          createdFromDrawing: markup.createdFromDrawing ?? false,
          isPlacedOnMap: true
        };
      })
    );

    setSelectedMarkupId(boundaryId);
    setSelectedDrawingAreaId(boundaryId);
    setSelectedNestedLayerId(null);
    setActiveEyeDrawing(null);
    setSitePlanAssignmentBoundaryId(null);
    setSitePlanAssignmentSuggestedId(null);
    triggerToast(sourcePlan ? `${sourcePlan.label} assigned to site boundary.` : "Site plan removed from boundary.");
  };

  // Delete selected markup
  const handleDeleteMarkup = (id: string) => {
    setMarkups(markups.filter((m) => m.id !== id));
    if (selectedMarkupId === id) {
      setSelectedMarkupId(null);
      setSelectedNestedLayerId(null);
    }
    triggerToast("Deleted map markup");
  };


  // --- DRAWING OVERLAY INJECTING & ADJUSTMENTS ---
  const getRandomBlueprintForMarkup = (currentMarkupId: string) => {
    const usedBlueprints = markups
      .filter((markup) => markup.id !== currentMarkupId)
      .map((markup) => markup.drawingOverlay?.url)
      .filter(Boolean) as string[];
    const availableBlueprints = DEMO_BLUEPRINT_POOL.filter((url) => !usedBlueprints.includes(url));
    const pool = availableBlueprints.length > 0 ? availableBlueprints : DEMO_BLUEPRINT_POOL;
    return pool[Math.floor(Math.random() * pool.length)];
  };

	  const handleAssignDrawing = (targetLayerId?: string | null) => {
	    if (!selectedMarkupId) return;
    
    // Custom uploads stay fixed; demo/project plans randomize per new site area.
    const drawingSrc = uploadedDrawing?.startsWith("data:")
      ? uploadedDrawing
      : getRandomBlueprintForMarkup(selectedMarkupId);
    const overlay = makeDrawingOverlay(drawingSrc);

    setMarkups(
      markups.map((m) => {
        if (m.id === selectedMarkupId) {
          if (targetLayerId) {
            return {
              ...m,
              childLayers: updateLayerTree(m.childLayers || [], targetLayerId, (layer) => ({
                ...layer,
                drawingOverlay: overlay
              }))
            };
          }

          return {
            ...m,
            drawingOverlay: overlay
          };
        }
        return m;
      })
    );
    if (!targetLayerId) {
      setSelectedDrawingAreaId(selectedMarkupId);
      setActiveEyeDrawing(null);
    }
	    triggerToast(targetLayerId ? "Linked drawing inside selected layer" : "Aligned floorplan drawing onto map area!");
	  };

	  const openBlueprintSourceModal = (targetMarkupId: string) => {
	    setSelectedMarkupId(targetMarkupId);
	    setSelectedNestedLayerId(null);
	    setBlueprintSourceMode("source");
	    setBlueprintHubSearch("");
	    setIsBlueprintSourceModalOpen(true);
	  };

	  const applyBlueprintOverlayToSelectedArea = (file: UploadedDrawingFile) => {
	    if (!selectedMarkupId) {
	      setUploadedDrawingFiles((prev) =>
	        prev.some((drawing) => drawing.id === file.id) ? prev : [...prev, { ...file, id: `hub-base-${Date.now()}` }]
	      );
	      ensureDrawingSetupAreaFromFile(file, true);
	      setIsBlueprintSourceModalOpen(false);
	      setBlueprintSourceMode("source");
	      triggerToast(`Floor plan "${file.name}" added. Create zones directly on the drawing.`, "success");
	      return;
	    }
	    const overlay = makeDrawingOverlay(file.url);

	    setMarkups((prev) =>
	      prev.map((markup) =>
        markup.id === selectedMarkupId
          ? { ...markup, drawingOverlay: overlay, isPlacedOnMap: markup.isPlacedOnMap ?? true }
          : markup
      )
    );
	    setUploadedDrawing(file.url);
	    setSelectedDrawingAreaId(selectedMarkupId);
	    setActiveEyeDrawing(null);
	    setIsBlueprintSourceModalOpen(false);
	    setBlueprintSourceMode("source");
	    triggerToast(`Floor plan "${file.name}" added. Next, create zones inside your area.`, "success");
	  };

	  const handleBlueprintLocalUpload = (files: FileList | null) => {
	    const file = files?.[0];
	    if (!file) return;
	    const drawingFile: UploadedDrawingFile = {
	      id: `zone-plan-${Date.now()}`,
	      name: file.name.replace(/\.[^/.]+$/, ""),
	      url: URL.createObjectURL(file),
	      service: inferDrawingService(file.name)
	    };
	    setUploadedDrawingFiles((prev) => [...prev, drawingFile]);
	    setHasLoadedDrawings(true);
	    applyBlueprintOverlayToSelectedArea(drawingFile);
	  };

  const updateOverlayProp = (key: keyof DrawingOverlay, value: number, targetId?: string) => {
    const idToUpdate = targetId || selectedNestedLayerId || selectedMarkupId;
    if (!idToUpdate) return;
    setMarkups(
      markups.map((m) => {
        if (m.id === idToUpdate && m.drawingOverlay) {
          return {
            ...m,
            drawingOverlay: {
              ...m.drawingOverlay,
              [key]: value
            }
          };
        }
        const hasLayer = findLayerInTree(m.childLayers || [], idToUpdate);
        if (hasLayer) {
          return {
            ...m,
            childLayers: updateLayerTree(m.childLayers || [], idToUpdate, (layer) => {
              if (!layer.drawingOverlay) return layer;
              return {
                ...layer,
                drawingOverlay: {
                  ...layer.drawingOverlay,
                  [key]: value
                }
              };
            })
          };
        }
        return m;
      })
    );
  };

  const removeDrawingOverlay = (targetLayerId?: string | null) => {
    if (!selectedMarkupId) return;
    setMarkups(
      markups.map((m) => {
        if (m.id === selectedMarkupId) {
          if (targetLayerId) {
            return {
              ...m,
              childLayers: updateLayerTree(m.childLayers || [], targetLayerId, (layer) => ({
                ...layer,
                drawingOverlay: null
              }))
            };
          }

          return { ...m, drawingOverlay: null };
        }
        return m;
      })
    );
    triggerToast("Removed blueprint overlay");
  };

  const startChildDrawingLayer = (targetMarkupId = selectedMarkupId) => {
    if (!targetMarkupId) return;

    const selectedMarkup = markups.find((m) => m.id === targetMarkupId);
    if (!selectedMarkup?.drawingOverlay) {
      triggerToast("Add a blueprint overlay before creating drawing layers.");
      return;
    }

    setSelectedMarkupId(targetMarkupId);
    setSelectedNestedLayerId(null);
    setNestedDrawingParentId(null);
    setNestedDrawingPoints([]);
    setNestedRedoPoints([]);
    setActiveTool("nestedPolygon");
    triggerToast("Polygon zone tool active. Click inside the drawing to place corners.");
  };

	  const handleCreateZoneFromDrawingSetup = () => {
    setIsDrawingMarkupToolbarVisible(true);
    if (!activeArea) {
      const baseDrawing = uploadedDrawingFiles[0];
      if (baseDrawing) {
        ensureDrawingSetupAreaFromFile(baseDrawing);
        window.setTimeout(() => {
          setActiveTool("nestedPolygon");
        }, 0);
        triggerToast("Zone tool active. Click on the drawing to place zone corners.", "success");
      } else {
        triggerToast("Upload or choose a base drawing before creating zones.", "warning");
      }
      return;
    }

    if (!activeArea.drawingOverlay) {
      const baseDrawing = uploadedDrawingFiles[0];
      if (baseDrawing) {
        ensureDrawingSetupAreaFromFile(baseDrawing, true);
        triggerToast("Base drawing linked. Click Create Zone again to start markup.", "success");
      } else {
        triggerToast("Upload or choose a base drawing before creating zones.", "warning");
      }
      return;
    }

    setSelectedDrawingAreaId(activeArea.id);
    setSelectedMarkupId(activeArea.id);
    setSelectedNestedLayerId(null);
    setActiveEyeDrawing(null);
    setReturnToDrawingAfterZone(false);
    setIsDrawingStackedView(false);
    setIsDrawingLeftSetupOpen(true);
    if (activeTab === "3d") {
      setActiveTab("drawing");
    }
    startChildDrawingLayer(activeArea.id);
	  };

	  const openDrawingSetupFromMapGuide = () => {
	    if (activeArea) {
	      setSelectedDrawingAreaId(activeArea.id);
	      setSelectedMarkupId(activeArea.id);
	      setSelectedNestedLayerId(null);
	    }
	    setDrawingSetupSubTab("configure");
	    setIsDrawingLeftSetupOpen(true);
	    setIsDrawingRightLayersOpen(true);
	    setActiveEyeDrawing(null);
	    setActiveTab("drawing");
	    triggerToast("Drawing Setup is ready. Assign drawings to levels and zones from the setup panel.", "success");
	  };

	  const completeNestedLayerDrawing = (pointsToSubmit: Point[]) => {
    if (!selectedMarkupId) return;
    if (pointsToSubmit.length < 3) {
      triggerToast("You need at least 3 points to complete the nested zone.");
      return;
    }

    const selectedMarkup = markups.find((m) => m.id === selectedMarkupId);
    const siblings = selectedMarkup?.childLayers || [];
    const newBounds = getBoundsFromPoints(pointsToSubmit);
    const newLayer: DrawingLayer = {
      id: `layer-${Date.now()}`,
      label: `Drawing Zone ${siblings.length + 1}`,
      points: pointsToSubmit,
      bounds: newBounds,
      color: "#3b82f6",
      drawingOverlay: null,
      children: []
    };

    setMarkups(
      markups.map((m) => {
        if (m.id !== selectedMarkupId) return m;
        return { ...m, childLayers: [...(m.childLayers || []), newLayer] };
      })
    );
    setSelectedNestedLayerId(newLayer.id);
    setNestedDrawingPoints([]);
    setNestedRedoPoints([]);
    setNestedDrawingParentId(null);
    setActiveTool("pan");
    if (returnToDrawingAfterZone) {
      setSelectedDrawingAreaId(selectedMarkupId);
      setDrawingSetupSubTab("configure");
      setIsDrawingLeftSetupOpen(true);
      setIsDrawingRightLayersOpen(true);
      setReturnToDrawingAfterZone(false);
      window.setTimeout(() => {
        setActiveTab("drawing");
      }, 250);
    }
    if (selectedMarkup) {
      const parentBox = getLayerAbsoluteBox(selectedMarkup, nestedDrawingParentId);
      if (parentBox) {
        focusMapOnBox(
          {
            left: parentBox.left + (newBounds.x / 100) * parentBox.width,
            top: parentBox.top + (newBounds.y / 100) * parentBox.height,
            width: (newBounds.width / 100) * parentBox.width,
            height: (newBounds.height / 100) * parentBox.height
          },
          { markupId: selectedMarkupId, layerId: newLayer.id }
        );
      }
    }
	    triggerToast("Zone created. Create levels in the setup panel, or add another zone on the drawing.", "success");
	  };

  const handleUndoNestedPoint = () => {
    if (nestedDrawingPoints.length === 0) return;
    const lastPoint = nestedDrawingPoints[nestedDrawingPoints.length - 1];
    setNestedDrawingPoints(nestedDrawingPoints.slice(0, -1));
    setNestedRedoPoints((prev) => [...prev, lastPoint]);
    triggerToast("Undid nested zone point");
  };

  const handleRedoNestedPoint = () => {
    if (nestedRedoPoints.length === 0) return;
    const nextPoint = nestedRedoPoints[nestedRedoPoints.length - 1];
    setNestedRedoPoints(nestedRedoPoints.slice(0, -1));
    setNestedDrawingPoints((prev) => [...prev, nextPoint]);
    triggerToast("Redid nested zone point");
  };

  const handleCompleteNestedDrawing = () => {
    completeNestedLayerDrawing(nestedDrawingPoints);
  };

  const cancelNestedDrawing = () => {
    clearNestedDraft();
    setActiveTool("pan");
    if (returnToDrawingAfterZone) {
      setReturnToDrawingAfterZone(false);
      setActiveTab("drawing");
    }
  };

  const deleteChildDrawingLayer = (layerId: string) => {
    if (!selectedMarkupId) return;
    setMarkups(
      markups.map((m) => {
        if (m.id !== selectedMarkupId) return m;
        return {
          ...m,
          childLayers: removeLayerFromTree(m.childLayers || [], layerId)
        };
      })
    );
    setSelectedNestedLayerId(null);
    triggerToast("Deleted drawing layer");
  };

  const updateChildLayerBounds = (
    layerId: string,
    key: keyof DrawingLayer["bounds"],
    value: number
  ) => {
    if (!selectedMarkupId) return;
    setMarkups(
      markups.map((m) => {
        if (m.id !== selectedMarkupId) return m;
        return {
          ...m,
          childLayers: updateLayerTree(m.childLayers || [], layerId, (layer) => {
            const nextBounds = {
              ...layer.bounds,
              [key]: value
            };
            const relativePoints = getRelativePolygonPoints(layer.points, layer.bounds);

            return {
              ...layer,
              bounds: nextBounds,
              points: relativePoints.map((point) => ({
                x: Math.round(nextBounds.x + (point.x / 100) * nextBounds.width),
                y: Math.round(nextBounds.y + (point.y / 100) * nextBounds.height)
              }))
            };
          })
        };
      })
    );
  };

  // Helper to compute bounding center and box of a polygon markup to place drawing
  const getMarkupCenter = (markup: Markup) => {
    if (markup.points.length === 0) return { x: 1500, y: 1500, width: 300, height: 300 };
    
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    markup.points.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });

    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
      width: Math.max(maxX - minX, 100),
      height: Math.max(maxY - minY, 100)
    };
  };

  const getLayerAbsoluteBox = (
    markup: Markup,
    targetLayerId: string | null
  ): { left: number; top: number; width: number; height: number } | null => {
    const root = getMarkupCenter(markup);
    const rootBox = {
      left: root.x - root.width / 2,
      top: root.y - root.height / 2,
      width: root.width,
      height: root.height
    };

    if (!targetLayerId) return rootBox;

    const walk = (
      layers: DrawingLayer[],
      parentBox: { left: number; top: number; width: number; height: number }
    ): { left: number; top: number; width: number; height: number } | null => {
      for (const layer of layers) {
        const layerBox = {
          left: parentBox.left + (layer.bounds.x / 100) * parentBox.width,
          top: parentBox.top + (layer.bounds.y / 100) * parentBox.height,
          width: (layer.bounds.width / 100) * parentBox.width,
          height: (layer.bounds.height / 100) * parentBox.height
        };

        if (layer.id === targetLayerId) return layerBox;

        const childMatch = walk(layer.children, layerBox);
        if (childMatch) return childMatch;
      }

      return null;
    };

    return walk(markup.childLayers || [], rootBox);
  };


  // --- DRAWING TAB LOCAL FILE UPLOAD ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedDrawing(event.target.result as string);
          triggerToast("Drawing uploaded successfully.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoadDemoProject = () => {
    setUploadedDrawing("/architectural_drawing.png");
    triggerToast("Loaded 'Innovation Center A-101' project blueprint!");
  };

  const handleLoadDemoDrawingsAndSetup = () => {
    // 1. Create drawing files
    const demoFiles: UploadedDrawingFile[] = [
      { id: "demo-dwg-1", name: "L01 Architectural Plan", url: "/demo_plan_a.svg", service: "Architectural" },
      { id: "demo-dwg-2", name: "L01 Structural Plan", url: "/demo_plan_b.svg", service: "Structural" },
      { id: "demo-dwg-3", name: "L01 MEP Plan", url: "/demo_plan_c.svg", service: "Mechanical" },
      { id: "demo-dwg-4", name: "L02 Floor Plan Layout", url: "/architectural_drawing.png", service: "Electrical" },
    ];
    setUploadedDrawingFiles(demoFiles);

    // 2. Create mock areas and zones if none exist
    let currentMarkups = [...markups];
    if (currentMarkups.filter((m) => m.type === "area").length === 0) {
      const mockArea: Markup = {
        id: "demo-area-1",
        type: "area",
        label: "Innovation Block A",
        points: [
          { x: 300, y: 150 },
          { x: 700, y: 150 },
          { x: 700, y: 450 },
          { x: 300, y: 450 },
        ],
        bounds: { x: 300, y: 150, width: 400, height: 300 },
        color: "#3B82F6",
        scale: 1,
        rotate: 0,
        opacity: 0.8,
        drawingOverlay: {
          url: "/demo_plan_a.svg",
          scale: 0.9,
          rotate: 0,
          opacity: 0.8,
          offsetX: 0,
          offsetY: 0
        },
        childLayers: [
          {
            id: "demo-zone-1",
            label: "Server Room Zone",
            color: "#10B981",
            points: [
              { x: 350, y: 200 },
              { x: 500, y: 200 },
              { x: 500, y: 350 },
              { x: 350, y: 350 },
            ],
            bounds: { x: 350, y: 200, width: 150, height: 150 },
            children: []
          },
          {
            id: "demo-zone-2",
            label: "Laboratory Zone",
            color: "#F59E0B",
            points: [
              { x: 520, y: 220 },
              { x: 680, y: 220 },
              { x: 680, y: 420 },
              { x: 520, y: 420 },
            ],
            bounds: { x: 520, y: 220, width: 160, height: 200 },
            children: []
          }
        ]
      };

      const mockArea2: Markup = {
        id: "demo-area-2",
        type: "area",
        label: "Warehouse Facility B",
        points: [
          { x: 100, y: 500 },
          { x: 500, y: 500 },
          { x: 500, y: 800 },
          { x: 100, y: 800 },
        ],
        bounds: { x: 100, y: 500, width: 400, height: 300 },
        color: "#6366F1",
        scale: 1,
        rotate: 0,
        opacity: 0.8,
        drawingOverlay: {
          url: "/demo_plan_b.svg",
          scale: 0.9,
          rotate: 0,
          opacity: 0.8,
          offsetX: 0,
          offsetY: 0
        },
        childLayers: [
          {
            id: "demo-zone-3",
            label: "Storage Bay 1",
            color: "#EF4444",
            points: [
              { x: 150, y: 550 },
              { x: 450, y: 550 },
              { x: 450, y: 750 },
              { x: 150, y: 750 },
            ],
            bounds: { x: 150, y: 550, width: 300, height: 200 },
            children: []
          }
        ]
      };

      currentMarkups = [mockArea, mockArea2];
      setMarkups(currentMarkups);
      setSelectedDrawingAreaId("demo-area-1");
    }

    // 3. Populate config floorsList
    const newConfigs: Record<string, ZoneDrawingConfig> = {};
    currentMarkups.forEach((m) => {
      if (m.type === "area" && m.childLayers) {
        m.childLayers.forEach((zone) => {
          if (zone.id === "demo-zone-1") {
            newConfigs[zone.id] = {
              floorsList: [
                {
                  id: "floor-1",
                  name: "L01 - Server Ground",
                  assignments: {
                    Architectural: "demo-dwg-1",
                    Structural: "demo-dwg-2",
                    Mechanical: "demo-dwg-3"
                  }
                },
                {
                  id: "floor-2",
                  name: "L02 - Server Level 2",
                  assignments: {
                    Electrical: "demo-dwg-4"
                  }
                }
              ]
            };
          } else if (zone.id === "demo-zone-2") {
            newConfigs[zone.id] = {
              floorsList: [
                {
                  id: "floor-1",
                  name: "L01 - Chemistry Lab",
                  assignments: {
                    Architectural: "demo-dwg-1",
                    Structural: "demo-dwg-2"
                  }
                }
              ]
            };
          } else {
            newConfigs[zone.id] = {
              floorsList: [
                {
                  id: "floor-1",
                  name: "L01 - Ground Floor",
                  assignments: {
                    Architectural: "demo-dwg-1"
                  }
                }
              ]
            };
          }
        });
      }
    });
    setZoneDrawingConfigs(newConfigs);
    setHasLoadedDrawings(true);
    setActiveEyeDrawing(null);

    // Link demo drone photos to demo zones
    setZoneDroneAssignments({
      "demo-zone-1": "drone-1",
      "demo-zone-2": "drone-2",
      "demo-zone-3": "drone-3"
    });
    setActiveDroneEyes({
      "demo-zone-1": true,
      "demo-zone-2": true,
      "demo-zone-3": true
    });

    triggerToast("Loaded demo blueprints and assigned them to Floor Levels!");
  };

  const handleCreateFloors = (zoneId: string, count: number) => {
    const newFloors: FloorDrawingAssignment[] = Array.from({ length: count }, (_, idx) => ({
      id: `floor-${Date.now()}-${idx + 1}`,
      name: `Floor ${idx + 1}`,
      assignments: {}
    }));
    setZoneDrawingConfigs((prev) => ({
      ...prev,
      [zoneId]: {
        ...(prev[zoneId] || {}),
        floorsList: newFloors
      }
    }));
    triggerToast(`Created ${count} floor levels for this zone!`);
  };

  const handleAddSingleFloor = (zoneId: string) => {
    setZoneDrawingConfigs((prev) => {
      const config = prev[zoneId] || { floorsList: [] };
      const nextNum = config.floorsList.length + 1;
      const newFloor: FloorDrawingAssignment = {
        id: `floor-${Date.now()}-${nextNum}`,
        name: `Floor ${nextNum}`,
        assignments: {}
      };
      return {
        ...prev,
        [zoneId]: {
          ...config,
          floorsList: [...config.floorsList, newFloor]
        }
      };
    });
    triggerToast(`Added a new floor level!`);
  };

  const handleDeleteFloor = (zoneId: string, floorId: string) => {
    setZoneDrawingConfigs((prev) => {
      const config = prev[zoneId];
      if (!config) return prev;
      return {
        ...prev,
        [zoneId]: {
          ...config,
          floorsList: config.floorsList.filter((f) => f.id !== floorId)
        }
      };
    });
    triggerToast(`Removed floor level`);
  };

  const handleRenameFloor = (zoneId: string, floorId: string, newName: string) => {
    setZoneDrawingConfigs((prev) => {
      const config = prev[zoneId];
      if (!config) return prev;
      return {
        ...prev,
        [zoneId]: {
          ...config,
          floorsList: config.floorsList.map((f) => (f.id === floorId ? { ...f, name: newName } : f))
        }
      };
    });
  };

  const handleAssignDrawingToFloor = (zoneId: string, floorId: string, service: DrawingService, drawingId: string) => {
    setZoneDrawingConfigs((prev) => {
      const config = prev[zoneId] || { floorsList: [] };
      return {
        ...prev,
        [zoneId]: {
          ...config,
          floorsList: config.floorsList.map((f) => {
            if (f.id === floorId) {
              return {
                ...f,
                assignments: {
                  ...f.assignments,
                  [service]: drawingId
                }
              };
            }
            return f;
          })
        }
      };
    });
  };

  const openZoneDropAssignment = (zoneId: string, drawingId: string) => {
    const config = zoneDrawingConfigs[zoneId];
    const firstLevel = config?.floorsList[0];
    if (!config || !firstLevel) {
      openQuickSetupForZone(zoneId, [drawingId]);
      triggerToast("No floors found. Quick setup opened for this zone.");
      return;
    }

    const drawing = currentFilesList.find((file) => file.id === drawingId);
    const services = getZoneServices(zoneId);
    const inferredService = drawing?.service && services.includes(drawing.service) ? drawing.service : services[0] || "Architectural";

    setPendingZoneDropAssignment({ zoneId, drawingId });
    setPendingZoneDropLevelId(firstLevel.id);
    setPendingZoneDropService(inferredService);
  };

  const closeZoneDropAssignment = () => {
    setPendingZoneDropAssignment(null);
    setPendingZoneDropLevelId("");
    setPendingZoneDropService("Architectural");
    setDraggedDrawingId(null);
    setDragOverServiceSlot(null);
  };

  const buildQuickSetupAssignmentDraft = (
    zoneId: string,
    drawingIds: string[],
    services: DrawingService[],
    floorCount: number
  ) => {
    const eligibleIds = new Set(assignableDrawingFiles.map((file) => file.id));
    const selectedFiles = drawingIds
      .filter((drawingId) => eligibleIds.has(drawingId))
      .map((drawingId) => assignableDrawingFiles.find((file) => file.id === drawingId))
      .filter(Boolean) as UploadedDrawingFile[];
    const candidateFiles = selectedFiles.length > 0 ? selectedFiles : assignableDrawingFiles;
    const selectedFileIds = new Set(candidateFiles.map((file) => file.id));
    const existingFloors = zoneDrawingConfigs[zoneId]?.floorsList || [];

    return Array.from({ length: floorCount }, (_, index) => {
      const floorDraft: Partial<Record<DrawingService, string>> = {};
      services.forEach((service) => {
        const existingAssignment = existingFloors[index]?.assignments?.[service];
        if (existingAssignment && selectedFileIds.has(existingAssignment)) {
          floorDraft[service] = existingAssignment;
          return;
        }

        const serviceMatch = candidateFiles.find((file) => file.service === service);
        const fallbackMatch = candidateFiles[index % candidateFiles.length];
        if (serviceMatch || fallbackMatch) {
          floorDraft[service] = (serviceMatch || fallbackMatch).id;
        }
      });

      return [String(index), floorDraft] as const;
    }).reduce<Record<string, Partial<Record<DrawingService, string>>>>((draft, [index, floorDraft]) => {
      draft[index] = floorDraft;
      return draft;
    }, {});
  };

  const openQuickSetupForZone = (zoneId: string, drawingIds: string[]) => {
    const eligibleIds = new Set(assignableDrawingFiles.map((file) => file.id));
    const uniqueDrawingIds = Array.from(new Set(drawingIds.filter((drawingId) => eligibleIds.has(drawingId))));
    const selectedFiles = uniqueDrawingIds
      .map((drawingId) => assignableDrawingFiles.find((file) => file.id === drawingId))
      .filter(Boolean) as UploadedDrawingFile[];
    const candidateFiles = selectedFiles.length > 0 ? selectedFiles : assignableDrawingFiles;
    const inferredServices = Array.from(new Set(candidateFiles.map((file) => file.service).filter(Boolean)));
    const floorCount = Math.max(1, floorInputs[zoneId] || zoneDrawingConfigs[zoneId]?.floorsList.length || 2);
    const services = inferredServices.length > 0 ? inferredServices : ["Architectural", "Structural", "Mechanical"];

    setQuickSetupZoneId(zoneId);
    setQuickSetupDrawingIds(uniqueDrawingIds);
    setQuickSetupFloorCount(floorCount);
    setQuickSetupServices(services);
    setQuickSetupAssignments(buildQuickSetupAssignmentDraft(zoneId, uniqueDrawingIds, services, floorCount));
    setQuickSetupHighlightedZoneId(null);
    setDrawingSetupSubTab("library");
    setIsDrawingLeftSetupOpen(true);
  };

  const closeQuickSetup = () => {
    setQuickSetupZoneId(null);
    setQuickSetupDrawingIds([]);
    setQuickSetupFloorCount(2);
    setQuickSetupServices(["Architectural", "Structural", "Mechanical"]);
    setQuickSetupAssignments({});
    setQuickSetupHighlightedZoneId(null);
    setDraggedDrawingId(null);
  };

  const confirmQuickSetup = () => {
    if (!quickSetupZoneId) return;
    const selectedFiles = assignableDrawingFiles;
    const safeFloorCount = Math.max(1, Math.min(30, quickSetupFloorCount || 1));
    const services = Array.from(new Set(quickSetupServices.filter(Boolean)));

    if (services.length === 0) {
      triggerToast("Select at least one service slot.");
      return;
    }

    setZoneDrawingConfigs((prev) => {
      const config = prev[quickSetupZoneId] || { floorsList: [] };
      const selectedFileIds = new Set(selectedFiles.map((file) => file.id));
      const customServices = Array.from(new Set([
        ...(config.customServices || []),
        ...services.filter((service) => !isDefaultDrawingService(service))
      ]));
      const removedServices = (config.removedServices || []).filter((service) => !services.includes(service));
      const existingFloors = config.floorsList.length > 0 ? config.floorsList : [];
      const floorsList: FloorDrawingAssignment[] = Array.from({ length: safeFloorCount }, (_, index) => {
        const existingFloor = existingFloors[index];
        const assignments = { ...(existingFloor?.assignments || {}) };

	        services.forEach((service) => {
          const draftFloor = quickSetupAssignments[String(index)] || {};
	          const draftAssignment = draftFloor[service];
          if (Object.prototype.hasOwnProperty.call(draftFloor, service)) {
            if (draftAssignment && selectedFileIds.has(draftAssignment)) {
	            assignments[service] = draftAssignment;
            } else {
              delete assignments[service];
            }
            return;
	          }
	          if (assignments[service]) return;
          const serviceMatch = selectedFiles.find((file) => file.service === service);
          const matchedFile = serviceMatch || selectedFiles[index % selectedFiles.length];
          if (matchedFile) {
            assignments[service] = matchedFile.id;
          }
        });

        return {
          id: existingFloor?.id || `floor-${Date.now()}-${index + 1}`,
          name: existingFloor?.name || `Floor ${index + 1}`,
          assignments
        };
      });

      return {
        ...prev,
        [quickSetupZoneId]: {
          ...config,
          customServices,
          removedServices,
          floorsList
        }
      };
    });

    const zone = activeArea?.childLayers?.find((layer) => layer.id === quickSetupZoneId);
    setDrawingSetupSubTab("configure");
    triggerToast(`${zone?.label || "Zone"} quick setup completed with ${safeFloorCount} floor level${safeFloorCount > 1 ? "s" : ""}.`);
    closeQuickSetup();
  };

  const confirmZoneDropAssignment = () => {
    if (!pendingZoneDropAssignment || !pendingZoneDropLevelId) return;

    const config = zoneDrawingConfigs[pendingZoneDropAssignment.zoneId];
    const floor = config?.floorsList.find((item) => item.id === pendingZoneDropLevelId);
    const file = currentFilesList.find((item) => item.id === pendingZoneDropAssignment.drawingId);

    handleAssignDrawingToFloor(
      pendingZoneDropAssignment.zoneId,
      pendingZoneDropLevelId,
      pendingZoneDropService,
      pendingZoneDropAssignment.drawingId
    );
    triggerToast(`${file?.name || "File"} assigned to ${floor?.name || "selected level"} - ${pendingZoneDropService}.`, "success");
    closeZoneDropAssignment();
  };

  const getZoneServices = (zoneId: string): DrawingService[] => {
    const config = zoneDrawingConfigs[zoneId];
    const customServices = config?.customServices || [];
    const removedServices = config?.removedServices || [];
    return Array.from(new Set([...DRAWING_SERVICES, ...customServices])).filter(
      (service) => !removedServices.includes(service)
    );
  };

  const getAssignedServicesForZone = (zoneId: string, floor: FloorDrawingAssignment): DrawingService[] => {
    const assignedServices = Object.keys(floor.assignments).filter((service) => floor.assignments[service]);
    return Array.from(new Set([...getZoneServices(zoneId), ...assignedServices])).filter((service) => floor.assignments[service]);
  };

  const handleAddCustomService = (zoneId: string) => {
    const rawName = window.prompt("Enter service name, e.g. Interior, Facade, Landscape");
    const serviceName = rawName?.trim().replace(/\s+/g, " ");

    if (!serviceName) return;

    const existingServices = getZoneServices(zoneId);
    const alreadyExists = existingServices.some((service) => service.toLowerCase() === serviceName.toLowerCase());
    if (alreadyExists) {
      triggerToast("Service already exists for this zone.", "info");
      return;
    }

    setZoneDrawingConfigs((prev) => {
      const config = prev[zoneId] || { floorsList: [], customServices: [] };

      return {
        ...prev,
        [zoneId]: {
          ...config,
          customServices: isDefaultDrawingService(serviceName)
            ? config.customServices || []
            : [...(config.customServices || []), serviceName],
          removedServices: (config.removedServices || []).filter((service) => service !== serviceName)
        }
      };
    });

    triggerToast(`Added ${serviceName} service slot.`);
  };

  const handleRemoveService = (zoneId: string, service: DrawingService) => {
    setZoneDrawingConfigs((prev) => {
      const config = prev[zoneId];
      if (!config) return prev;
      const removedServices = isDefaultDrawingService(service)
        ? Array.from(new Set([...(config.removedServices || []), service]))
        : config.removedServices || [];

      return {
        ...prev,
        [zoneId]: {
          ...config,
          customServices: (config.customServices || []).filter((item) => item !== service),
          removedServices,
          floorsList: config.floorsList.map((floor) => {
            const assignments = { ...floor.assignments };
            delete assignments[service];
            return {
              ...floor,
              assignments
            };
          })
        }
      };
    });

    triggerToast(`Removed ${service} service slot.`);
  };

  const matchFloorAndService = (drawing: UploadedDrawingFile, floorName: string): boolean => {
    const drawingNameLower = drawing.name.toLowerCase();
    const floorNameLower = floorName.toLowerCase();

    // 1. Check Service Category
    const service = drawing.service; // e.g., "Architectural"
    let serviceMatch = false;
    if (service === "Architectural" && (drawingNameLower.includes("architectural") || drawingNameLower.includes("arch") || drawingNameLower.includes("dwg-1") || drawingNameLower.includes("plan_a"))) {
      serviceMatch = true;
    } else if (service === "Structural" && (drawingNameLower.includes("structural") || drawingNameLower.includes("struct") || drawingNameLower.includes("dwg-2") || drawingNameLower.includes("plan_b"))) {
      serviceMatch = true;
    } else if (service === "Mechanical" && (drawingNameLower.includes("mechanical") || drawingNameLower.includes("mech") || drawingNameLower.includes("mep") || drawingNameLower.includes("hvac") || drawingNameLower.includes("dwg-3") || drawingNameLower.includes("plan_c"))) {
      serviceMatch = true;
    } else if (service === "Electrical" && (drawingNameLower.includes("electrical") || drawingNameLower.includes("elec") || drawingNameLower.includes("dwg-4"))) {
      serviceMatch = true;
    } else if (service === "Plumbing" && (drawingNameLower.includes("plumbing") || drawingNameLower.includes("plumb") || drawingNameLower.includes("dwg-5"))) {
      serviceMatch = true;
    } else if (service === "Firefighting" && (drawingNameLower.includes("firefighting") || drawingNameLower.includes("fire") || drawingNameLower.includes("dwg-6"))) {
      serviceMatch = true;
    } else if (!isDefaultDrawingService(service)) {
      const serviceTokens = service.toLowerCase().split(/\s+/).filter(Boolean);
      serviceMatch = serviceTokens.length > 0 && serviceTokens.every((token) => drawingNameLower.includes(token));
    }

    if (!serviceMatch) return false;

    // 2. Check Floor Number Match
    const floorNumMatch = floorNameLower.match(/\d+/);
    if (floorNumMatch) {
      const numStr = floorNumMatch[0];
      const numVal = parseInt(numStr, 10);
      
      const patterns = [
        `l0${numVal}`, `l${numVal}`,
        `f0${numVal}`, `f${numVal}`,
        `fl0${numVal}`, `fl${numVal}`,
        `floor ${numVal}`, `floor-${numVal}`,
        `level ${numVal}`, `level-${numVal}`,
        `0${numVal}_`, `${numVal}_`,
        `_0${numVal}`, `_${numVal}`,
        ` ${numVal} `, ` ${numVal}-`
      ];

      if (drawing.id === `demo-dwg-${numVal}`) {
        return true;
      }

      const hasPattern = patterns.some(pat => drawingNameLower.includes(pat));
      if (hasPattern) return true;
      
      const padZeroStr = numVal < 10 ? `0${numVal}` : `${numVal}`;
      if (drawingNameLower.startsWith(padZeroStr) || drawingNameLower.includes(`_${padZeroStr}_`) || drawingNameLower.includes(` ${padZeroStr} `)) {
        return true;
      }
    }

    return false;
  };

  const handleAutoMapDrawings = (zoneId: string) => {
    const config = zoneDrawingConfigs[zoneId];
    if (!config || config.floorsList.length === 0) {
      triggerToast("No levels created yet. Please create levels first!", "warning");
      return;
    }

    if (uploadedDrawingFiles.length === 0) {
      triggerToast("No drawings uploaded yet. Click 'Auto Setup Demo' or Upload files!", "warning");
      return;
    }

    let matchCount = 0;
    const updatedFloors = config.floorsList.map((floor) => {
      const newAssignments = { ...floor.assignments };
      
      getZoneServices(zoneId).forEach((service) => {
        // Find matching drawing
        const matchingDwg = uploadedDrawingFiles.find((drawing) => {
          if (drawing.service !== service) return false;
          return matchFloorAndService(drawing, floor.name);
        });

        if (matchingDwg) {
          newAssignments[service] = matchingDwg.id;
          matchCount++;
        }
      });

      return {
        ...floor,
        assignments: newAssignments
      };
    });

    setZoneDrawingConfigs((prev) => ({
      ...prev,
      [zoneId]: {
        ...prev[zoneId],
        floorsList: updatedFloors
      }
    }));

    if (matchCount > 0) {
      triggerToast(`Mapped ${matchCount} drawings automatically!`, "success");
    } else {
      triggerToast("No matching drawings found. Rename drawings to include floor numbers and service types.", "info");
    }
  };

  const handleReorderFloors = (zoneId: string, fromIndex: number, toIndex: number) => {
    setZoneDrawingConfigs((prev) => {
      const config = prev[zoneId];
      if (!config) return prev;
      const list = [...config.floorsList];
      const [removed] = list.splice(fromIndex, 1);
      list.splice(toIndex, 0, removed);
      return {
        ...prev,
        [zoneId]: {
          ...config,
          floorsList: list
        }
      };
    });
  };

  const switchDrawingArea = (areaId: string) => {
    // Save current annotations
    const currentKey = activeDrawingId || activeArea?.id || null;
    if (currentKey) {
      setDrawingAnnotations((prev) => ({
        ...prev,
        [currentKey]: drawingMarkups
      }));
    }

    // Switch area
    setSelectedDrawingAreaId(areaId);
    setActiveDrawingId(null);
    setActiveDrawingUrl(null);
    setActiveDrawingLabel("");

    // Load next markups for the new area's base plan
    setDrawingMarkups(drawingAnnotations[areaId] || []);
  };

  const selectDrawing = (drawingId: string, label: string, url: string) => {
    // Save current markups to drawingAnnotations under old ID
    const currentKey = activeDrawingId || activeArea?.id || null;
    if (currentKey) {
      setDrawingAnnotations((prev) => ({
        ...prev,
        [currentKey]: drawingMarkups
      }));
    }
    
    // Set next drawing
    setActiveDrawingId(drawingId);
    setActiveDrawingUrl(url);
    setActiveDrawingLabel(label);
    
    // Load next markups
    setDrawingMarkups(drawingAnnotations[drawingId] || []);
    triggerToast(`Selected: ${label}`);
  };

  const renderDrawingLayersTree = (): React.ReactNode => {
    const siteAreas = markups.filter((m) => m.type === "area");
    
    if (siteAreas.length === 0) {
      return (
        <div className="py-6 text-center text-slate-400 text-xs">
          <Layers className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p className="font-bold uppercase tracking-wider text-[10px]">No drawing zones yet</p>
          <p className="text-[9px] mt-1 leading-normal max-w-[200px] mx-auto">
            Upload a base drawing, then use Create Zone to define areas directly on the sheet.
          </p>
        </div>
      );
    }

    return siteAreas.map((area) => {
      const isAreaActive = activeArea?.id === area.id;
      
      return (
        <div key={area.id} className="space-y-1">
          {/* Big Area Node */}
          <div
            onClick={() => {
              setSelectedDrawingAreaId(area.id);
              setActiveEyeDrawing(null);
              triggerToast(`Switched to: ${area.label} Base layout`);
            }}
            className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all ${
              isAreaActive && !activeEyeDrawing
                ? "bg-blue-50 border border-blue-200 text-blue-700 "
                : "bg-slate-50 border border-slate-100/60 text-slate-800 hover:bg-slate-100"
            }`}
          >
            <PolygonIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            {renderEditableLayerName({ type: "area", id: area.id }, area.label, "text-[11px] font-bold text-slate-800 truncate flex-1")}
            {area.isPlacedOnMap === false ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  startPlaceBoundaryOnMap(area.id);
                }}
                className="shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[7px] font-extrabold uppercase text-amber-700 hover:bg-amber-100"
                title="Place this linked boundary on map"
              >
                Place on map
              </button>
            ) : (
              <span className="text-[7.5px] uppercase font-bold bg-blue-100 text-blue-750 px-1.5 py-0.5 rounded">Area</span>
            )}
          </div>

          {/* Nested Small Areas (Zones) under this Area */}
          {isAreaActive && area.childLayers && area.childLayers.length > 0 && (
            <div className="ml-3 pl-3 border-l border-slate-200 space-y-3 py-1">
              {/* Base Layout Overlay option */}
              {area.drawingOverlay && (
                (() => {
                  const baseFile = uploadedDrawingFiles.find((file) => file.url === area.drawingOverlay?.url);
                  return (
                    <button
                      onClick={() => {
                        setActiveEyeDrawing(null);
                      }}
                      className={`w-full flex items-center gap-2 rounded-lg px-2 py-1 text-left border text-[9px] font-semibold transition-all ${
                        !activeEyeDrawing
                          ? "bg-blue-50 border-blue-200 text-blue-750 font-bold"
                          : "bg-white border-slate-100 hover:bg-slate-50 text-slate-650"
                      }`}
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-blue-500" />
                      {baseFile
                        ? renderEditableLayerName(
                            { type: "drawing", id: baseFile.id },
                            baseFile.name,
                            "truncate flex-1"
                          )
                        : <span className="truncate flex-1">Base Layout Blueprint Overlay</span>}
                      <span className="text-[7px] uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">Base</span>
                    </button>
                  );
                })()
              )}

              {area.childLayers.map((zone) => {
                const zoneConfig = zoneDrawingConfigs[zone.id];
                const floorsList = zoneConfig?.floorsList || [];

                return (
                  <div key={zone.id} className="space-y-1">
                    {/* Zone Heading */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100/60 rounded-lg">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      {renderEditableLayerName(
                        { type: "zone", id: zone.id, parentId: area.id },
                        zone.label,
                        "text-[10px] font-extrabold text-slate-750 truncate flex-1"
                      )}
                      <span className="text-[7.5px] uppercase font-bold text-slate-400">Zone</span>
                    </div>

                    {/* Zone Floor Levels */}
                    {floorsList.length === 0 ? (
                      <p className="text-[8px] text-slate-400 italic pl-3.5">No floor levels configured.</p>
                    ) : (
                      <div className="ml-2 pl-2 border-l border-slate-150 space-y-1">
                        {floorsList.map((floor) => {
                          const assignedServices = getAssignedServicesForZone(zone.id, floor);

                          return (
                            <div key={floor.id} className="space-y-1">
                              <div className="flex items-center gap-1 text-[8.5px] font-bold text-slate-600">
                                <span className="px-1 py-0.2 bg-slate-100 rounded text-slate-500 font-mono">L</span>
                                {renderEditableLayerName(
                                  { type: "floor", id: floor.id, parentId: zone.id },
                                  floor.name,
                                  "truncate"
                                )}
                              </div>

                              {/* Drawings assigned */}
                              <div className="ml-2.5 space-y-1">
                                {assignedServices.length === 0 ? (
                                  <p className="text-[7.5px] text-slate-400 italic">No drawings linked</p>
                                ) : (
                                  assignedServices.map((service) => {
                                    const drawingId = floor.assignments[service]!;
                                    const file = uploadedDrawingFiles.find((d) => d.id === drawingId);
                                    if (!file) return null;

                                    const isEyeActive =
                                      activeEyeDrawing?.zoneId === zone.id &&
                                      activeEyeDrawing?.floorId === floor.id &&
                                      activeEyeDrawing?.service === service;

                                    return (
                                      <div
                                        key={service}
                                        className={`flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg border text-[8.5px] font-medium transition-all ${
                                          isEyeActive
                                            ? "bg-emerald-50/60 border-emerald-250 text-emerald-800 font-bold"
                                            : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 truncate flex-1">
                                          <FileText className={`w-3 h-3 ${isEyeActive ? "text-emerald-600 animate-pulse" : "text-slate-450"}`} />
                                          {renderEditableLayerName(
                                            { type: "drawing", id: file.id },
                                            file.name,
                                            "truncate"
                                          )}
                                          <span className="text-[7px] text-slate-400 font-semibold lowercase bg-slate-50 px-1 rounded shrink-0">
                                            {service}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0">
                                          <button
                                            onClick={() => {
                                              setActive3DLink({
                                                zoneId: zone.id,
                                                floorId: floor.id,
                                                service
                                              });
                                              setActiveTab("3d");
                                              triggerToast(`Navigating to 3D BIM Model for ${floor.name} (${service})`);
                                            }}
                                            className="p-1 rounded text-slate-400 hover:text-blue-650 hover:bg-slate-100 transition-all shrink-0 cursor-pointer flex items-center gap-0.5 border border-slate-100/60"
                                            title="View respective 3D Model"
                                          >
                                            <Cpu className="w-3 h-3 text-blue-600" />
                                            <span className="text-[7.5px] font-extrabold text-blue-600">3D Link</span>
                                          </button>

                                          <button
                                            onClick={() => {
                                            if (isEyeActive) {
                                              setActiveEyeDrawing(null);
                                              triggerToast("Turned off drawing view");
                                            } else {
                                              setActiveEyeDrawing({
                                                zoneId: zone.id,
                                                floorId: floor.id,
                                                service
                                              });
                                              triggerToast(`Viewing: ${floor.name} - ${service}`);
                                            }
                                          }}
                                          className={`p-1 rounded hover:bg-slate-150 transition-all duration-200 hover:scale-110 active:scale-95 shrink-0 ${
                                            isEyeActive ? "text-emerald-650 font-bold eye-pulse" : "text-slate-400 hover:text-slate-600"
                                          }`}
                                          title={isEyeActive ? "Hide Drawing" : "Show Drawing"}
                                        >
                                          {isEyeActive ? (
                                            <Eye className="w-3.5 h-3.5" />
                                          ) : (
                                            <EyeOff className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  const render3DModelLayersTree = (): React.ReactNode => {
    const siteAreas = markups.filter((m) => m.type === "area");
    
    if (siteAreas.length === 0) {
      return (
        <div className="py-6 text-center text-slate-400 text-xs">
          <Layers className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p className="font-bold uppercase tracking-wider text-[10px]">No zones defined</p>
          <p className="text-[9px] mt-1 leading-normal max-w-[200px] mx-auto">
            Create zones from Drawing Setup, then assign levels and models.
          </p>
        </div>
      );
    }

    return siteAreas.map((area) => {
      const isAreaActive = activeArea?.id === area.id;
      
      return (
        <div key={area.id} className="space-y-1">
          {/* Big Area Node */}
          <div
            onClick={() => {
              setSelectedDrawingAreaId(area.id);
              triggerToast(`Switched 3D context to: ${area.label}`);
            }}
            className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all ${
              isAreaActive
                ? "bg-blue-50 border border-blue-200 text-blue-700 "
                : "bg-slate-50 border border-slate-100/60 text-slate-800 hover:bg-slate-100"
            }`}
          >
            <PolygonIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-bold text-slate-800 truncate flex-1">{area.label}</span>
            <span className="text-[7.5px] uppercase font-bold bg-blue-100 text-blue-750 px-1.5 py-0.5 rounded">3D Area</span>
          </div>

          {/* Nested Small Areas (Zones) under this Area */}
          {isAreaActive && area.childLayers && area.childLayers.length > 0 && (
            <div className="ml-3 pl-3 border-l border-slate-200 space-y-3 py-1">
              {/* Base 3D Mesh Overlay option */}
              <button
                className="w-full flex items-center gap-2 rounded-lg px-2 py-1 text-left border text-[9px] font-semibold bg-blue-50/50 border-blue-100 text-blue-750 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="truncate flex-1">Terrain Mesh (3D_Model_Base)</span>
                <span className="text-[7px] uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">Terrain</span>
              </button>

              {area.childLayers.map((zone) => {
                const zoneConfig = zoneDrawingConfigs[zone.id];
                const floorsList = zoneConfig?.floorsList || [];

                return (
                  <div key={zone.id} className="space-y-1">
                    {/* Zone Heading */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100/60 rounded-lg">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      <span className="text-[10px] font-extrabold text-slate-750 truncate flex-1">{zone.label}</span>
                      <span className="text-[7.5px] uppercase font-bold text-slate-400">Zone</span>
                    </div>

                    {/* Zone Floor Levels */}
                    {floorsList.length === 0 ? (
                      <p className="text-[8px] text-slate-400 italic pl-3.5">No floor levels configured.</p>
                    ) : (
                      <div className="ml-2 pl-2 border-l border-slate-150 space-y-1">
                        {floorsList.map((floor) => {
                          const assignedServices = getAssignedServicesForZone(zone.id, floor);

                          return (
                            <div key={floor.id} className="space-y-1">
                              <div className="flex items-center gap-1 text-[8.5px] font-bold text-slate-600">
                                <span className="px-1 py-0.2 bg-slate-100 rounded text-slate-500 font-mono">L</span>
                                <span>{floor.name}</span>
                              </div>

                              {/* 3D Models assigned */}
                              <div className="ml-2.5 space-y-1">
                                {assignedServices.length === 0 ? (
                                  <p className="text-[7.5px] text-slate-400 italic">No 3D Models loaded</p>
                                ) : (
                                  assignedServices.map((service) => {
                                    // Generate a mock BIM file name for this floor and service
                                    const cleanFloorPart = floor.name.toUpperCase().replace(/\s+/g, "_");
                                    const cleanServicePart = service.toUpperCase().replace(/\s+/g, "_");
                                    const modelFileName = `${cleanFloorPart}_${cleanServicePart}_Structure_Model.ifc`;

                                    return (
                                      <div
                                        key={service}
                                        className={`flex items-center justify-between gap-1.5 px-1.5 py-1.5 rounded-lg border transition-all ${
                                          active3DLink?.zoneId === zone.id && active3DLink?.floorId === floor.id && active3DLink?.service === service
                                            ? "bg-blue-50 border-blue-200 text-blue-800 font-extrabold "
                                            : "border-slate-100 bg-white text-[8.5px] text-slate-600 hover:bg-slate-50"
                                        }`}
                                      >
                                        <div className="flex items-center gap-1.5 truncate flex-1">
                                          <Cpu className="w-3 h-3 text-blue-500" />
                                          <span className="truncate text-slate-700 font-bold" title={modelFileName}>
                                            {modelFileName}
                                          </span>
                                          <span className="text-[7px] text-emerald-600 font-semibold lowercase bg-emerald-50 px-1 rounded shrink-0">
                                            linked
                                          </span>
                                        </div>

                                        <button
                                          onClick={() => {
                                            const isSelected = active3DLink?.zoneId === zone.id &&
                                                               active3DLink?.floorId === floor.id &&
                                                               active3DLink?.service === service;
                                            if (isSelected) {
                                              setActive3DLink(null);
                                              triggerToast(`Cleared focus from 3D ${service}`);
                                            } else {
                                              setActive3DLink({
                                                zoneId: zone.id,
                                                floorId: floor.id,
                                                service
                                              });
                                              triggerToast(`Focused 3D element: ${modelFileName}`);
                                            }
                                          }}
                                          className={`p-1 rounded transition-all shrink-0 cursor-pointer ${
                                            active3DLink?.zoneId === zone.id && active3DLink?.floorId === floor.id && active3DLink?.service === service
                                              ? "text-blue-600 bg-blue-100/50"
                                              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                          }`}
                                          title="Focus 3D element"
                                        >
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  const renderDroneLayersTree = (): React.ReactNode => {
    const siteAreas = markups.filter((m) => m.type === "area");
    
    if (siteAreas.length === 0) {
      return (
        <div className="py-6 text-center text-slate-400 text-xs">
          <Layers className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p className="font-bold uppercase tracking-wider text-[10px]">No zones defined</p>
          <p className="text-[9px] mt-1 leading-normal max-w-[200px] mx-auto">
            Create zones from Drawing Setup, then link drone captures.
          </p>
        </div>
      );
    }

    return siteAreas.map((area) => {
      const isAreaActive = activeArea?.id === area.id;
      
      return (
        <div key={area.id} className="space-y-1">
          {/* Big Area Node */}
          <div
            onClick={() => {
              setSelectedDrawingAreaId(area.id);
              triggerToast(`Switched drone context to: ${area.label}`);
            }}
            className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all ${
              isAreaActive
                ? "bg-blue-50 border border-blue-200 text-blue-700 "
                : "bg-slate-50 border border-slate-100/60 text-slate-800 hover:bg-slate-100"
            }`}
          >
            <PolygonIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-bold text-slate-800 truncate flex-1">{area.label}</span>
            <span className="text-[7.5px] uppercase font-bold bg-blue-100 text-blue-750 px-1.5 py-0.5 rounded">Drone Area</span>
          </div>

          {/* Nested Zones under this Area */}
          {isAreaActive && area.childLayers && area.childLayers.length > 0 && (
            <div className="ml-3 pl-3 border-l border-slate-200 space-y-3 py-1">
              {area.childLayers.map((zone) => {
                const assignedFileId = zoneDroneAssignments[zone.id];
                const file = uploadedDroneImages.find((f) => f.id === assignedFileId);
                const isVisible = activeDroneEyes[zone.id] !== false;

                return (
                  <div key={zone.id} className="space-y-1">
                    {/* Zone Heading */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100/60 rounded-lg">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      <span className="text-[10px] font-extrabold text-slate-750 truncate flex-1">{zone.label}</span>
                      <span className="text-[7.5px] uppercase font-bold text-slate-400">Zone</span>
                    </div>

                    {/* Assigned drone capture file or empty state */}
                    <div className="ml-2 pl-2 border-l border-slate-150 space-y-1">
                      {file ? (
                        <div
                          className={`flex items-center justify-between gap-1.5 px-1.5 py-1.5 rounded-lg border transition-all ${
                            isVisible 
                              ? "bg-emerald-50/50 border-emerald-200 text-emerald-800 font-bold"
                              : "border-slate-100 bg-white text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate flex-1 font-bold">
                            <Camera className={`w-3 h-3 ${isVisible ? "text-emerald-600 animate-pulse" : "text-slate-400"}`} />
                            <span className="truncate text-slate-700" title={file.name}>
                              {file.name}
                            </span>
                            <span className={`text-[7px] font-semibold lowercase px-1 rounded shrink-0 ${
                              isVisible ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                            }`}>
                              {isVisible ? "active" : "hidden"}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setActiveDroneEyes((prev) => ({
                                ...prev,
                                [zone.id]: !isVisible
                              }));
                              triggerToast(`${isVisible ? "Hidden" : "Shown"} drone capture: ${file.name}`);
                            }}
                            className={`p-1 rounded transition-all shrink-0 cursor-pointer ${
                              isVisible ? "text-emerald-600 bg-emerald-100/50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                            }`}
                            title={isVisible ? "Hide Drone Capture" : "Show Drone Capture"}
                          >
                            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      ) : (
                        <div className="text-[8px] text-slate-400 italic pl-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <span>No drone photo linked</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  // --- BLUEPRINT DRAWING CANVAS MARKUPS ---
  const handleDrawingCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const id = `dwg-${Date.now()}`;
    const newDwgMarkup: DrawingMarkup = {
      id,
      type: drawingTool,
      x: Math.round(x),
      y: Math.round(y),
      label: `${drawingTool === "pin" ? "Equipment" : "Control"} Node #${drawingMarkups.length + 1}`
    };

    const updated = [...drawingMarkups, newDwgMarkup];
    setDrawingMarkups(updated);
    if (activeDrawingId) {
      setDrawingAnnotations((prev) => ({
        ...prev,
        [activeDrawingId]: updated
      }));
    }
    triggerToast(`Added ${drawingTool} annotation on floorplan`);
  };

  const handleCoordinationMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = coordinationViewportRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setHoveredCoordinationCanvasPos({ x: mouseX, y: mouseY });

      if (draggingCoordinationGuide) {
        const Cx = coordinationViewportDimensions.width / 2;
        const Cy = coordinationViewportDimensions.height / 2;
        if (draggingCoordinationGuide.type === "v") {
          const coord = BASE_COORD + ((mouseX - Cx - coordinationPan.x) / coordinationZoom) * UNITS_PER_PIXEL;
          setGuidelinesCoordination(prev => prev.map(g => g.id === draggingCoordinationGuide.id ? { ...g, coord } : g));
        } else {
          const coord = BASE_COORD + ((mouseY - Cy - coordinationPan.y) / coordinationZoom) * UNITS_PER_PIXEL;
          setGuidelinesCoordination(prev => prev.map(g => g.id === draggingCoordinationGuide.id ? { ...g, coord } : g));
        }
      }
    }
  };

  const handleCoordinationMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (draggingCoordinationGuide) {
      const rect = coordinationViewportRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const shouldDelete = (draggingCoordinationGuide.type === "v" && mouseX < 24) || 
                             (draggingCoordinationGuide.type === "h" && mouseY < 24);
        if (shouldDelete) {
          setGuidelinesCoordination(prev => prev.filter(g => g.id !== draggingCoordinationGuide.id));
          triggerToast("Coordination guideline removed");
        } else {
          if (draggingCoordinationGuide.isNew) {
            triggerToast("Coordination guideline added");
          }
        }
      }
      setDraggingCoordinationGuide(null);
    }
  };

  const handleDrawingViewerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setDrawingAdjustments((prev) => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom * zoomFactor, 0.6), 5)
    }));
  };

  const handleDrawingViewerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === "nestedPolygon") {
      e.preventDefault();
      return;
    }
    setIsDrawingPanning(true);
    setDrawingPanStart({
      x: e.clientX - drawingAdjustments.panX,
      y: e.clientY - drawingAdjustments.panY
    });
  };

  const handleDrawingViewerZoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== "nestedPolygon" || !activeArea || isDrawingStackedView) return;
    const canvasRect = drawingCanvasContentRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const normalizedPoint = {
      x: Math.round(Math.max(0, Math.min(100, ((e.clientX - canvasRect.left) / canvasRect.width) * 100))),
      y: Math.round(Math.max(0, Math.min(100, ((e.clientY - canvasRect.top) / canvasRect.height) * 100)))
    };

    const updatedPoints = [...nestedDrawingPoints, normalizedPoint];
    let shouldClose = false;
    if (nestedDrawingPoints.length >= 2) {
      const firstPoint = nestedDrawingPoints[0];
      const dx = firstPoint.x - normalizedPoint.x;
      const dy = firstPoint.y - normalizedPoint.y;
      shouldClose = Math.sqrt(dx * dx + dy * dy) < 3.5;
    }

    if (shouldClose) {
      completeNestedLayerDrawing(nestedDrawingPoints);
      setNestedRedoPoints([]);
    } else {
      setNestedDrawingPoints(updatedPoints);
      setNestedRedoPoints([]);
    }
  };

  const handleDrawingViewerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = drawingViewportRef.current?.getBoundingClientRect();
    if (rect) {
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      setHoveredCanvasPos({ x: mouseX, y: mouseY });

      if (draggingGuide) {
        const Cx = viewportDimensions.width / 2;
        const Cy = viewportDimensions.height / 2;
        if (draggingGuide.type === "v") {
          const coord = BASE_COORD + ((mouseX - Cx - drawingAdjustments.panX) / drawingAdjustments.zoom) * UNITS_PER_PIXEL;
          setGuidelines(prev => prev.map(g => g.id === draggingGuide.id ? { ...g, coord } : g));
        } else {
          const coord = BASE_COORD + ((mouseY - Cy - drawingAdjustments.panY) / drawingAdjustments.zoom) * UNITS_PER_PIXEL;
          setGuidelines(prev => prev.map(g => g.id === draggingGuide.id ? { ...g, coord } : g));
        }
        return;
      }
    }

    if (!isDrawingPanning) return;
    setDrawingAdjustments((prev) => ({
      ...prev,
      panX: e.clientX - drawingPanStart.x,
      panY: e.clientY - drawingPanStart.y
    }));
  };

  const stopDrawingViewerPan = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDrawingPanning(false);
    if (draggingGuide) {
      const rect = drawingViewportRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const shouldDelete = (draggingGuide.type === "v" && mouseX < 24) || 
                             (draggingGuide.type === "h" && mouseY < 24);
        if (shouldDelete) {
          setGuidelines(prev => prev.filter(g => g.id !== draggingGuide.id));
          triggerToast("Guideline removed");
        } else {
          if (draggingGuide.isNew) {
            triggerToast("Guideline added");
          }
        }
      }
      setDraggingGuide(null);
    }
  };

  const inferDrawingService = (name: string): DrawingService => {
    const normalized = name.toLowerCase();
    if (normalized.includes("arch") || normalized.includes("a-")) return "Architectural";
    if (normalized.includes("struct") || normalized.includes("str")) return "Structural";
    if (normalized.includes("mech") || normalized.includes("mep")) return "Mechanical";
    if (normalized.includes("elec")) return "Electrical";
    if (normalized.includes("plumb")) return "Plumbing";
    if (normalized.includes("fire")) return "Firefighting";
    return "Architectural";
  };

  const makeUploadedDrawingFiles = (files: File[], prefix = "upload"): UploadedDrawingFile[] =>
    files.map((file, index) => ({
      id: `${prefix}-${Date.now()}-${index}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      url: URL.createObjectURL(file),
      service: inferDrawingService(file.name)
    }));

  const handleDrawingLibraryUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    let nextFiles = makeUploadedDrawingFiles(Array.from(files));
    if (activeTab === "3d") {
      nextFiles = nextFiles.map(f => {
        if (!f.name.endsWith(".ifc") && !f.name.endsWith(".rvt")) {
          return { ...f, name: f.name.substring(0, f.name.lastIndexOf('.')) + ".ifc" };
        }
        return f;
      });
      setUploaded3DFiles((prev) => [...prev, ...nextFiles]);
      triggerToast(`Uploaded ${nextFiles.length} 3D Model${nextFiles.length > 1 ? "s" : ""}`);
    } else {
      setUploadedDrawingFiles((prev) => [...prev, ...nextFiles]);
      setHasLoadedDrawings(true);
      if (nextFiles[0]) {
        ensureDrawingSetupAreaFromFile(nextFiles[0]);
      }
      triggerToast(`Uploaded ${nextFiles.length} drawing${nextFiles.length > 1 ? "s" : ""}. Create zones directly on the drawing.`);
    }
  };

  const resetUploadMoreModal = () => {
    setIsUploadMoreModalOpen(false);
    setStagedUploadFiles([]);
    setIsUploadMoreProcessing(false);
    setUploadMoreProgress(0);
    setUploadMoreFinished(false);
    if (uploadMoreInputRef.current) {
      uploadMoreInputRef.current.value = "";
    }
  };

  const handleUploadMoreFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setStagedUploadFiles(Array.from(files));
    setUploadMoreProgress(0);
    setUploadMoreFinished(false);
  };

  const handleRemoveStagedFile = (indexToRemove: number) => {
    setStagedUploadFiles((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleConfirmUploadMore = () => {
    if (stagedUploadFiles.length === 0) {
      triggerToast(activeTab === "3d" ? "Select 3D model files first." : "Select drawing files first.", "warning");
      return;
    }

    setIsUploadMoreProcessing(true);
    setUploadMoreProgress(8);
    setUploadMoreFinished(false);

    const startedAt = Date.now();
    const duration = 1200;
    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setUploadMoreProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(interval);
        const nextFiles = makeUploadedDrawingFiles(stagedUploadFiles, "upload-more");
        if (activeTab === "3d") {
          const next3DFiles = nextFiles.map(f => {
            if (!f.name.endsWith(".ifc") && !f.name.endsWith(".rvt")) {
              return { ...f, name: f.name.substring(0, f.name.lastIndexOf('.')) + ".ifc" };
            }
            return f;
          });
          setUploaded3DFiles((prev) => [...prev, ...next3DFiles]);
          triggerToast(`Uploaded ${nextFiles.length} more 3D Model${nextFiles.length > 1 ? "s" : ""}`, "success");
        } else {
          setUploadedDrawingFiles((prev) => [...prev, ...nextFiles]);
          setHasLoadedDrawings(true);
          if (nextFiles[0] && !activeArea?.drawingOverlay) {
            ensureDrawingSetupAreaFromFile(nextFiles[0]);
          }
          triggerToast(`Uploaded ${nextFiles.length} more drawing${nextFiles.length > 1 ? "s" : ""}`, "success");
        }
        setDrawingSetupSubTab("library");
        setIsUploadMoreProcessing(false);
        setUploadMoreFinished(true);
        window.setTimeout(() => {
          resetUploadMoreModal();
        }, 650);
      }
    }, 80);
  };

  const addDemoDrawingFiles = () => {
    const demoFiles: UploadedDrawingFile[] = [
      { id: `demo-${Date.now()}-1`, name: "L01 Architectural Plan", url: "/demo_plan_a.svg", service: "Architectural" },
      { id: `demo-${Date.now()}-2`, name: "L01 Structural Plan", url: "/demo_plan_b.svg", service: "Structural" },
      { id: `demo-${Date.now()}-3`, name: "L01 MEP Plan Layout", url: "/demo_plan_c.svg", service: "Mechanical" },
      { id: `demo-${Date.now()}-4`, name: "L02 Electrical Plan Layout", url: "/architectural_drawing.png", service: "Electrical" }
    ];
    setUploadedDrawingFiles((prev) => [...prev, ...demoFiles]);
    setHasLoadedDrawings(true);
    if (demoFiles[0]) {
      ensureDrawingSetupAreaFromFile(demoFiles[0]);
    }
    triggerToast("Added demo drawing set");
  };

  const addHubDrawingFiles = () => {
    const stamp = Date.now();
    const hubFiles = HUB_BLUEPRINT_FILES.map((file, index) => ({
      ...file,
      id: `hub-import-${stamp}-${index}`
    }));

    setUploadedDrawingFiles((prev) => [...prev, ...hubFiles]);
    if (hubFiles[0]) {
      ensureDrawingSetupAreaFromFile(hubFiles[0]);
    }
    triggerToast("Loaded HUB drawings. Create zones directly on the base drawing.", "success");
  };

  const updateUploadedDrawingService = (drawingId: string, service: DrawingService) => {
    if (activeTab === "3d") {
      setUploaded3DFiles((prev) =>
        prev.map((drawing) => (drawing.id === drawingId ? { ...drawing, service } : drawing))
      );
    } else {
      setUploadedDrawingFiles((prev) =>
        prev.map((drawing) => (drawing.id === drawingId ? { ...drawing, service } : drawing))
      );
    }
  };

  const deleteUploadedDrawing = (drawingId: string) => {
    if (activeTab === "3d") {
      setUploaded3DFiles((prev) => prev.filter((drawing) => drawing.id !== drawingId));
    } else {
      setUploadedDrawingFiles((prev) => prev.filter((drawing) => drawing.id !== drawingId));
    }
    setZoneDrawingConfigs((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((zoneId) => {
        const config = next[zoneId];
        if (config && config.floorsList) {
          const updatedFloors = config.floorsList.map((floor) => {
            const updatedAssignments = { ...floor.assignments };
            Object.keys(updatedAssignments).forEach((service) => {
              if (updatedAssignments[service] === drawingId) {
                delete updatedAssignments[service];
              }
            });
            return {
              ...floor,
              assignments: updatedAssignments
            };
          });
          next[zoneId] = {
            ...config,
            floorsList: updatedFloors
          };
        }
      });
      return next;
    });
  };

  const handleDrawingDrop = (targetId: string) => {
    if (!draggedDrawingId || draggedDrawingId === targetId) return;
    setUploadedDrawingFiles((prev) => {
      const currentIndex = prev.findIndex((drawing) => drawing.id === draggedDrawingId);
      const targetIndex = prev.findIndex((drawing) => drawing.id === targetId);
      if (currentIndex < 0 || targetIndex < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDraggedDrawingId(null);
  };

  const activeMarkupOverlay = useMemo(() => {
    if (!selectedMarkupId) return null;
    const m = markups.find((item) => item.id === selectedMarkupId);
    return m?.drawingOverlay ? { markup: m, overlay: m.drawingOverlay } : null;
  }, [markups, selectedMarkupId]);

  const selectedMarkup = useMemo(
    () => markups.find((item) => item.id === selectedMarkupId) || null,
    [markups, selectedMarkupId]
  );

  const selectedNestedLayer = useMemo(
    () => findLayerInTree(selectedMarkup?.childLayers || [], selectedNestedLayerId),
    [selectedMarkup, selectedNestedLayerId]
  );

  const drawingSetupMarkup = useMemo(
    () =>
      (selectedMarkup?.type === "area" && selectedMarkup.drawingOverlay
        ? selectedMarkup
        : markups.find((item) => item.type === "area" && item.drawingOverlay)) || null,
    [markups, selectedMarkup]
  );

  const getOverlayName = (url?: string) => {
    if (!url) return "Project Blueprint A-101";
    return url.startsWith("data:") ? "Custom Uploaded Layout" : "Project Blueprint A-101";
  };

  interface CalibrationTarget {
    id: string;
    label: string;
    isLayer: boolean;
    parentMarkupId: string;
    overlay: DrawingOverlay;
    x: number;
    y: number;
    width: number;
    height: number;
    controlY: number;
  }

  const getCalibrationTargets = (markup: Markup): CalibrationTarget[] => {
    const targets: CalibrationTarget[] = [];
    if (markup.drawingOverlay) {
      const { x, y, width, height } = getMarkupCenter(markup);
      targets.push({
        id: markup.id,
        label: markup.label,
        isLayer: false,
        parentMarkupId: markup.id,
        overlay: markup.drawingOverlay,
        x,
        y,
        width,
        height,
        controlY: y - height / 2
      });
    }

    return targets;
  };

  const renderNestedDrawingLayers = (layers: DrawingLayer[], parentMarkupId: string): React.ReactNode =>
    layers.map((layer) => {
      const isSelected = selectedMarkupId === parentMarkupId && selectedNestedLayerId === layer.id;
      const isPulsing = focusPulse?.markupId === parentMarkupId && focusPulse.layerId === layer.id;
      const relativePoints = getRelativePolygonPoints(layer.points, layer.bounds);
      const polygonPoints = relativePoints.map((point) => `${point.x},${point.y}`).join(" ");
      const clipPath = `polygon(${relativePoints.map((point) => `${point.x}% ${point.y}%`).join(", ")})`;

      return (
        <div
          key={layer.id}
          className="absolute overflow-visible pointer-events-none"
          style={{
            left: `${layer.bounds.x}%`,
            top: `${layer.bounds.y}%`,
            width: `${layer.bounds.width}%`,
            height: `${layer.bounds.height}%`
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-md pointer-events-none"
            style={{ backgroundColor: `${layer.color}18`, clipPath }}
          />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            {isPulsing && (
              <polygon
                points={polygonPoints}
                fill="transparent"
                stroke="#ffffff"
                strokeWidth="8"
                opacity="0.9"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
                className="animate-pulse"
                style={{
                  filter: "drop-shadow(0 0 14px rgba(59,130,246,1)) drop-shadow(0 0 24px rgba(16,185,129,0.7))"
                }}
              />
            )}
            <polygon
              points={polygonPoints}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMarkupId(parentMarkupId);
                setSelectedNestedLayerId(layer.id);
                triggerToast(`Selected Zone: ${layer.label}`);
              }}
              fill={isSelected ? `${layer.color}25` : `${layer.color}05`}
              stroke={layer.color}
              strokeWidth={isSelected ? "3" : "2"}
              vectorEffect="non-scaling-stroke"
              strokeLinejoin="round"
              className={`cursor-pointer hover:fill-blue-500/10 transition-colors ${
                activeTool === "pan" ? "pointer-events-auto" : "pointer-events-none"
              }`}
            />
          </svg>
          <div
            className={`absolute left-1 top-1 rounded bg-white/90 border border-slate-100/80 px-1.5 py-0.5 text-[8px] font-bold text-slate-700  cursor-pointer hover:bg-white transition-all ${
              activeTool === "pan" ? "pointer-events-auto" : "pointer-events-none"
            }`}
            style={{ color: layer.color }}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMarkupId(parentMarkupId);
              setSelectedNestedLayerId(layer.id);
            }}
          >
            {layer.label}
          </div>
        </div>
      );
    });

  const renderGlobalLayersTree = (): React.ReactNode => {
    if (markups.length === 0) {
      return (
        <div className="py-6 text-center">
          <Layers className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">No layers yet</p>
          <p className="text-[9px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-normal">
            Draw a site boundary using the tools on the left to start.
          </p>
        </div>
      );
    }

    return markups.map((markup) => {
      const isMarkupSelected = selectedMarkupId === markup.id && !selectedNestedLayerId;
      
      if (markup.type === "pin") {
        return (
          <div key={markup.id}>
            <button
              onClick={() => {
                setSelectedMarkupId(markup.id);
                setSelectedNestedLayerId(null);
              }}
              className={`w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left border transition-all ${
                isMarkupSelected
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-bold "
                  : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" style={{ color: markup.color }} />
              {renderEditableLayerName({ type: "area", id: markup.id }, markup.label, "text-[11px] truncate flex-1 font-semibold")}
              <span className="text-[8px] uppercase tracking-wider text-slate-400 shrink-0 font-bold bg-slate-100 px-1 py-0.5 rounded">Pin</span>
            </button>
          </div>
        );
      }

      if (markup.type === "circle") {
        return (
          <div key={markup.id}>
            <button
              onClick={() => {
                setSelectedMarkupId(markup.id);
                setSelectedNestedLayerId(null);
              }}
              className={`w-full flex items-center gap-2 rounded-xl px-2.5 py-2 text-left border transition-all ${
                isMarkupSelected
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-bold "
                  : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <CircleIcon className="w-3.5 h-3.5" style={{ color: markup.color }} />
              {renderEditableLayerName({ type: "area", id: markup.id }, markup.label, "text-[11px] truncate flex-1 font-semibold")}
              <span className="text-[8px] uppercase tracking-wider text-slate-400 shrink-0 font-bold bg-slate-100 px-1 py-0.5 rounded">Circle</span>
            </button>
          </div>
        );
      }

      if (markup.type === "area") {
        const hasChildren = markup.drawingOverlay || (markup.childLayers && markup.childLayers.length > 0);
        
        return (
          <div key={markup.id} className="space-y-1">
            {/* Top-level Area Row */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSelectedMarkupId(markup.id);
                  setSelectedNestedLayerId(null);
                }}
                className={`flex-1 flex items-center gap-2 rounded-xl px-2.5 py-2 text-left border transition-all ${
                  isMarkupSelected
                    ? "bg-blue-50/80 border-blue-200 text-blue-700 font-bold "
                    : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <PolygonIcon className="w-3.5 h-3.5 shrink-0" style={{ color: markup.color }} />
                {renderEditableLayerName({ type: "area", id: markup.id }, markup.label, "text-[11px] truncate flex-1 font-semibold")}
                {markup.isPlacedOnMap === false ? (
                  <span className="text-[7px] uppercase tracking-wider text-amber-600 shrink-0 font-bold bg-amber-50 px-1 py-0.5 rounded">Not placed</span>
                ) : (
                  <span className="text-[8px] uppercase tracking-wider text-slate-400 shrink-0 font-bold bg-slate-100 px-1 py-0.5 rounded">Area</span>
                )}
              </button>
              
              {markup.isPlacedOnMap === false ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    startPlaceBoundaryOnMap(markup.id);
                  }}
                  className="px-2 py-1.5 rounded-lg border border-amber-100 bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all cursor-pointer text-[8px] font-extrabold uppercase"
                  title="Place this linked boundary on map"
                >
                  Place
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMarkupId(markup.id);
                    setSelectedNestedLayerId(null);
                    startChildDrawingLayer();
                  }}
                  className="p-1.5 rounded-lg border border-slate-100/80 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-400 hover:border-blue-200 transition-all cursor-pointer"
                  title="Add inner zone"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>

            {markup.isPlacedOnMap !== false && (
              <div className="ml-1 rounded-xl border border-slate-100 bg-slate-50/60 px-2 py-1.5">
                <div className="flex items-center gap-1.5">
                  <FolderOpen className="h-3 w-3 shrink-0 text-blue-500" />
                  <select
                    value={
                      availableSitePlanSources.find((plan) => plan.id !== markup.id && plan.drawingOverlay?.url === markup.drawingOverlay?.url)?.id ||
                      (markup.drawingOverlay ? markup.id : "")
                    }
                    onChange={(event) => assignSitePlanToBoundary(markup.id, event.target.value || null)}
                    className="min-w-0 flex-1 rounded-lg border border-slate-100 bg-white px-2 py-1 text-[9px] font-bold text-slate-700 outline-none focus:border-blue-300 cursor-pointer"
                    title="Change assigned site plan"
                  >
                    <option value="">No site plan assigned</option>
                    {availableSitePlanSources.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.label}{plan.drawingOverlay ? ` - ${getOverlayName(plan.drawingOverlay.url)}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Children container with vertical connection lines */}
            {hasChildren && (
              <div className="relative ml-2 pl-3 border-l border-slate-200 space-y-1 py-0.5">
                {/* Main Blueprint Overlay row */}
                {markup.drawingOverlay && (
                  <div className="relative flex items-center">
                    <div className="absolute -left-4 w-3.5 h-px bg-slate-200" />
                    <button
                      onClick={() => {
                        setSelectedMarkupId(markup.id);
                        setSelectedNestedLayerId(null);
                        setCalibratingMarkupId(markup.id);
                      }}
                      className="flex-1 flex items-center gap-2 rounded-xl border border-slate-100/60 bg-white hover:bg-slate-50 px-1.5 py-1.5 text-left transition-all text-slate-600"
                    >
                      <FolderOpen className="w-3 h-3 text-blue-500" />
                      <span className="text-[10px] truncate flex-1 font-medium text-slate-700">
                        {getOverlayName(markup.drawingOverlay.url)}
                      </span>
                      <span className="text-[7px] uppercase bg-blue-50 text-blue-600 px-1 py-0.5 rounded font-bold">
                        Blueprint
                      </span>
                    </button>
                  </div>
                )}

                {/* Child Zones (Small Areas) */}
                {markup.childLayers && markup.childLayers.map((layer) => {
                  const isLayerSelected = selectedMarkupId === markup.id && selectedNestedLayerId === layer.id;
                  return (
                    <div key={layer.id} className="space-y-1">
                      {/* Sub-zone Row */}
                      <div className="relative flex items-center">
                        <div className="absolute -left-4 w-3.5 h-px bg-slate-200" />
                        <button
                          onClick={() => {
                            setSelectedMarkupId(markup.id);
                            setSelectedNestedLayerId(layer.id);
                          }}
                          className={`flex-1 flex items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition-all ${
                            isLayerSelected
                              ? "bg-blue-50 border-blue-200 text-blue-700 font-bold "
                              : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                          {renderEditableLayerName(
                            { type: "zone", id: layer.id, parentId: markup.id },
                            layer.label,
                            "text-[10px] truncate flex-1 font-semibold"
                          )}
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 shrink-0 font-bold bg-slate-100 px-1 py-0.5 rounded">Zone</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      }

      return null;
    });
  };

  const coordinationServices = Array.from(
    new Set([
      ...Object.keys(coordinationActiveModels),
      ...Object.keys(serviceColors),
      ...Object.values(zoneDrawingConfigs).flatMap((config) =>
        config.floorsList.flatMap((floor) => Object.keys(floor.assignments))
      )
    ])
  );

  const isSpatialNodeVisible = (nodeId: string) => coordinationVisibleSpatialNodes[nodeId] !== false;

  const isCoordinationLayerExpanded = (nodeId: string) => expandedCoordinationLayerNodes[nodeId] !== false;

  const toggleCoordinationLayerExpanded = (nodeId: string) => {
    setExpandedCoordinationLayerNodes((prev) => ({ ...prev, [nodeId]: !isCoordinationLayerExpanded(nodeId) }));
  };

  const toggleSpatialNodeVisibility = (nodeId: string, label: string) => {
    const isVisible = isSpatialNodeVisible(nodeId);
    setCoordinationVisibleSpatialNodes((prev) => ({ ...prev, [nodeId]: !isVisible }));
    triggerToast(`${isVisible ? "Hidden" : "Shown"} ${label}`);
  };

  const renderLayerEyeButton = (isVisible: boolean, onClick: (event: React.MouseEvent<HTMLButtonElement>) => void, title: string) => (
    <button
      onClick={onClick}
      className={`p-0.5 rounded transition-all cursor-pointer ${
        isVisible ? "text-blue-600 hover:bg-blue-50" : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"
      }`}
      title={title}
    >
      {isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
    </button>
  );

  const renderCoordinationLayerPanel = (): React.ReactNode => {
    const fakeServices = [
      { name: "Architectural", short: "ARCH", color: serviceColors.Architectural || "#3b82f6" },
      { name: "Structural", short: "STR", color: serviceColors.Structural || "#ef4444" },
      { name: "Mechanical", short: "MECH", color: serviceColors.Mechanical || "#10b981" },
      { name: "HVAC", short: "HVAC", color: "#06b6d4" },
      { name: "Electrical", short: "ELEC", color: serviceColors.Electrical || "#eab308" },
      { name: "Plumbing", short: "PLUMB", color: serviceColors.Plumbing || "#f97316" },
      { name: "Firefighting", short: "FIRE", color: serviceColors.Firefighting || "#ec4899" }
    ];
    const fakeSites = [
      {
        id: "site-a",
        label: "Site Boundary A - Tower Podium",
        zones: [
          { id: "zone-a1", label: "Core Tower Zone", floors: ["Basement 01", "Ground Floor", "Level 01", "Level 02", "Level 03"] },
          { id: "zone-a2", label: "Podium Retail Zone", floors: ["Lower Ground", "Ground Floor", "Level 01"] }
        ]
      },
      {
        id: "site-b",
        label: "Site Boundary B - Services Block",
        zones: [
          { id: "zone-b1", label: "Utility Plant Zone", floors: ["Basement Plant", "Service Deck"] },
          { id: "zone-b2", label: "Parking Ramp Zone", floors: ["Ramp Level 01", "Ramp Level 02"] }
        ]
      }
    ];
    const scopedSites = activeClashScope
      ? fakeSites
          .filter((site) => site.id === activeClashScope.siteId)
          .map((site) => ({
            ...site,
            zones: site.zones
              .filter((zone) => zone.id === activeClashScope.zoneId)
              .map((zone) => ({ ...zone, floors: zone.floors.filter((floor) => floor === activeClashScope.levelName) }))
          }))
      : fakeSites;
    const scopedServices = activeClashScope
      ? fakeServices.filter((service) => [activeClashScope.serviceA, activeClashScope.serviceB].includes(service.name))
      : fakeServices;
    const activeComparisonLabel = activeClashScope
      ? `${activeClashScope.comparisonType === "2d" ? "2D Drawing" : "3D Model"}: ${activeClashScope.serviceA} vs ${activeClashScope.serviceB}`
      : null;

    return (
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-wider">Layers</h3>
            <button
              onClick={() => setIsServiceSettingsOpen(true)}
              className="h-5 px-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-1"
              title="Service Color Settings"
            >
              <Palette className="w-2.5 h-2.5" />
              <span className="text-[7px] font-extrabold uppercase tracking-wider">Color Codes</span>
            </button>
          </div>
          {activeClashScope && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/45 p-2.5 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[8px] font-extrabold uppercase tracking-wider text-blue-600">Active clash scope</p>
                  <p className="text-[10px] font-extrabold text-slate-700 truncate">{activeComparisonLabel}</p>
                  <p className="text-[8.5px] font-semibold text-slate-400 truncate">{activeClashScope.levelName}</p>
                </div>
                <button
                  onClick={() => {
                    setActiveClashScope(null);
                    triggerToast("Returned to full layer list");
                  }}
                  className="h-6 px-2 rounded-lg bg-white text-blue-600 border border-blue-100 text-[8.5px] font-extrabold hover:bg-blue-100 cursor-pointer"
                >
                  Full list
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
              {scopedSites.map((site) => {
                const areaVisible = isSpatialNodeVisible(site.id);
                const siteExpanded = isCoordinationLayerExpanded(site.id);
                return (
                  <div key={site.id} className="relative">
                    <div
                      onClick={() => {
                        toggleCoordinationLayerExpanded(site.id);
                      }}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl cursor-pointer transition-all bg-blue-50/35 text-slate-700 hover:bg-blue-50/60 ring-1 ring-blue-100/70"
                    >
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${siteExpanded ? "" : "-rotate-90"}`} />
                      <PolygonIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[15px] font-extrabold truncate">{site.label}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Site Boundary</p>
                      </div>
                      {renderLayerEyeButton(areaVisible, (event) => {
                        event.stopPropagation();
                        toggleSpatialNodeVisibility(site.id, site.label);
                      }, areaVisible ? "Hide site boundary" : "Show site boundary")}
                    </div>

                    {siteExpanded && (
                    <div className="relative ml-0.5 pl-1.5 pt-1.5 pr-1 space-y-0.5 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-blue-100/70">
                      {site.zones.map((zone) => {
                          const zoneVisible = isSpatialNodeVisible(zone.id);
                          const zoneExpanded = isCoordinationLayerExpanded(zone.id);
                          return (
                            <div key={zone.id} className="relative space-y-0.5 before:absolute before:-left-1.5 before:top-4 before:w-0.5 before:h-px before:bg-blue-100/70">
                              <div
                                onClick={() => toggleCoordinationLayerExpanded(zone.id)}
                                className="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 bg-slate-50/45 cursor-pointer hover:bg-blue-50/35"
                              >
                                <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${zoneExpanded ? "" : "-rotate-90"}`} />
                                <span className="w-2 h-2 rounded-full shrink-0 bg-blue-500" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[14px] font-extrabold text-slate-750 truncate">{zone.label}</p>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Zone</p>
                                </div>
                                {renderLayerEyeButton(zoneVisible, (event) => {
                                  event.stopPropagation();
                                  toggleSpatialNodeVisibility(zone.id, zone.label);
                                }, zoneVisible ? "Hide zone" : "Show zone")}
                              </div>

                              {zoneExpanded && (
                              <div className="relative ml-0.5 pl-1.5 space-y-0.5 before:absolute before:left-0 before:top-0 before:bottom-1 before:w-px before:bg-slate-100">
                                {zone.floors.map((floorName) => {
                                    const levelId = `${zone.id}-${floorName}`;
                                    const isSelected = selectedCoordinationLevel === floorName;
                                    const isVisible = coordinationVisibleLevels[levelId] !== false;
                                    const levelExpanded = isCoordinationLayerExpanded(levelId);
                                    return (
                                      <div key={levelId} className="relative before:absolute before:-left-1.5 before:top-4 before:w-0.5 before:h-px before:bg-slate-100">
                                        <div
                                          onClick={() => {
                                            setSelectedCoordinationLevel(floorName);
                                            toggleCoordinationLayerExpanded(levelId);
                                          }}
                                          className={`flex items-center gap-2 px-1.5 py-1.5 rounded-lg cursor-pointer transition-all ${
                                            isSelected ? "bg-blue-50/50" : "bg-slate-50/35 hover:bg-slate-50/70"
                                          }`}
                                        >
                                          <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${levelExpanded ? "" : "-rotate-90"}`} />
                                          <span className="px-1.5 py-0.5 rounded bg-white border border-slate-100/70 text-[10px] font-black text-slate-500">LVL</span>
                                          <span className="text-[13px] font-bold truncate flex-1">{floorName}</span>
                                          {renderLayerEyeButton(isVisible, (event) => {
                                            event.stopPropagation();
                                            setCoordinationVisibleLevels((prev) => ({ ...prev, [levelId]: !isVisible }));
                                            triggerToast(`${isVisible ? "Hidden" : "Shown"} ${floorName}`);
                                          }, isVisible ? "Hide level" : "Show level")}
                                        </div>

                                        {levelExpanded && (
                                        <div className="relative ml-0.5 pl-1.5 pt-1 pb-1 space-y-0.5 before:absolute before:left-0 before:top-0 before:bottom-1 before:w-px before:bg-slate-100">
                                          {scopedServices.map((service) => {
                                            const serviceNodeId = `${levelId}-${service.short}`;
                                            const drawingId = `${levelId}-${service.short}-dwg`;
                                            const modelId = `${levelId}-${service.short}-model`;
                                            const serviceExpanded = isCoordinationLayerExpanded(serviceNodeId);
                                            const drawingExpanded = isCoordinationLayerExpanded(drawingId);
                                            const modelExpanded = isCoordinationLayerExpanded(modelId);
                                            const drawingVisible = isSpatialNodeVisible(drawingId);
                                            const modelVisible = coordinationActiveModels[service.name] !== false;
                                            const drawingChildLayers = ["Plan Lines", "Annotations", "Hatch / Fill"];
                                            const modelChildLayers = ["Geometry", "Openings", "Equipment"];
                                            return (
                                              <div key={`${levelId}-${service.name}`} className="relative before:absolute before:-left-1.5 before:top-3.5 before:w-0.5 before:h-px before:bg-slate-100">
                                                <div
                                                  onClick={() => toggleCoordinationLayerExpanded(serviceNodeId)}
                                                  className="flex items-center gap-1.5 rounded-md bg-white/80 px-1.5 py-1 ring-1 ring-slate-100/60 cursor-pointer hover:bg-slate-50"
                                                >
                                                  <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${serviceExpanded ? "" : "-rotate-90"}`} />
                                                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                                                  <div className="min-w-0 flex-1">
                                                    <p className="text-[13px] font-extrabold text-slate-650 truncate">{service.name}</p>
                                                  </div>
                                                  {renderLayerEyeButton(drawingVisible && modelVisible, (event) => {
                                                    event.stopPropagation();
                                                    const nextVisible = !(drawingVisible && modelVisible);
                                                    setCoordinationVisibleSpatialNodes((prev) => ({ ...prev, [drawingId]: nextVisible }));
                                                    setCoordinationActiveModels((prev) => ({ ...prev, [service.name]: nextVisible }));
                                                    triggerToast(`${nextVisible ? "Shown" : "Hidden"} ${service.name} service`);
                                                  }, drawingVisible && modelVisible ? "Hide service" : "Show service")}
                                                </div>

                                                {serviceExpanded && (
                                                <div className="relative ml-0.5 pl-1.5 pt-1 space-y-0.5 before:absolute before:left-0 before:top-0 before:bottom-1 before:w-px before:bg-slate-100">
                                                  <div className="relative before:absolute before:-left-1.5 before:top-3.5 before:w-0.5 before:h-px before:bg-slate-100">
                                                    <div
                                                      onClick={() => toggleCoordinationLayerExpanded(drawingId)}
                                                      className="flex items-center gap-1.5 rounded-md bg-white/70 px-1.5 py-1 ring-1 ring-slate-100/50 cursor-pointer hover:bg-slate-50"
                                                    >
                                                      <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${drawingExpanded ? "" : "-rotate-90"}`} />
                                                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                                                      <div className="min-w-0 flex-1">
                                                        <p className="text-[12px] font-extrabold text-slate-650 truncate">{service.short} Drawing</p>
                                                        <p className="text-[10px] font-semibold text-slate-350 truncate">2D sheets and markups</p>
                                                      </div>
                                                      {renderLayerEyeButton(drawingVisible, (event) => {
                                                        event.stopPropagation();
                                                        toggleSpatialNodeVisibility(drawingId, `${floorName} ${service.name} drawing`);
                                                      }, drawingVisible ? "Hide drawing" : "Show drawing")}
                                                    </div>

                                                    {drawingExpanded && (
                                                    <div className="relative ml-0.5 pl-1.5 pt-1 space-y-0.5 before:absolute before:left-0 before:top-0 before:bottom-1 before:w-px before:bg-slate-100">
                                                      {drawingChildLayers.map((layer) => {
                                                        const childId = `${drawingId}-${layer}`;
                                                        const childVisible = isSpatialNodeVisible(childId);
                                                        return (
                                                          <div key={childId} className="relative flex items-center gap-1.5 rounded-md px-1.5 py-1 text-slate-500 hover:bg-slate-50 before:absolute before:-left-1.5 before:top-1/2 before:w-0.5 before:h-px before:bg-slate-100">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                                                            <span className="text-[12px] font-bold truncate flex-1">{layer}</span>
                                                            {renderLayerEyeButton(childVisible, (event) => {
                                                              event.stopPropagation();
                                                              toggleSpatialNodeVisibility(childId, `${service.name} ${layer}`);
                                                            }, childVisible ? "Hide layer" : "Show layer")}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                    )}
                                                  </div>

                                                  <div className="relative before:absolute before:-left-1.5 before:top-3.5 before:w-0.5 before:h-px before:bg-slate-100">
                                                    <div
                                                      onClick={() => toggleCoordinationLayerExpanded(modelId)}
                                                      className="flex items-center gap-1.5 rounded-md bg-white/70 px-1.5 py-1 ring-1 ring-slate-100/50 cursor-pointer hover:bg-slate-50"
                                                    >
                                                      <ChevronDown className={`w-3 h-3 text-slate-400 shrink-0 transition-transform ${modelExpanded ? "" : "-rotate-90"}`} />
                                                      <Box className="w-3 h-3 shrink-0" style={{ color: service.color }} />
                                                      <div className="min-w-0 flex-1">
                                                        <p className="text-[12px] font-extrabold text-slate-650 truncate">{service.short} Model</p>
                                                        <p className="text-[10px] font-semibold text-slate-350 truncate">3D model elements</p>
                                                      </div>
                                                      {renderLayerEyeButton(modelVisible, (event) => {
                                                        event.stopPropagation();
                                                        setCoordinationActiveModels((prev) => ({ ...prev, [service.name]: !modelVisible }));
                                                        triggerToast(`${modelVisible ? "Hidden" : "Shown"} ${service.name} model`);
                                                      }, modelVisible ? "Hide model" : "Show model")}
                                                    </div>

                                                    {modelExpanded && (
                                                    <div className="relative ml-0.5 pl-1.5 pt-1 space-y-0.5 before:absolute before:left-0 before:top-0 before:bottom-1 before:w-px before:bg-slate-100">
                                                      {modelChildLayers.map((layer) => {
                                                        const childId = `${modelId}-${layer}`;
                                                        const childVisible = isSpatialNodeVisible(childId);
                                                        return (
                                                          <div key={childId} className="relative flex items-center gap-1.5 rounded-md px-1.5 py-1 text-slate-500 hover:bg-slate-50 before:absolute before:-left-1.5 before:top-1/2 before:w-0.5 before:h-px before:bg-slate-100">
                                                            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                                                            <span className="text-[12px] font-bold truncate flex-1">{layer}</span>
                                                            {renderLayerEyeButton(childVisible, (event) => {
                                                              event.stopPropagation();
                                                              toggleSpatialNodeVisibility(childId, `${service.name} ${layer}`);
                                                            }, childVisible ? "Hide layer" : "Show layer")}
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                    )}
                                                  </div>
                                                </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    )}
                  </div>
                );
              })}
            </div>
        </div>

      </div>
    );
  };

  const renderCoordinationDiscussionPanel = (): React.ReactNode => {
    const activeItems = activeRfiTab === "rfi" ? rfis : issues;
    const activeItem = activeItems.find((item) => item.id === selectedCoordinationItemId) || activeItems[0];

    if (!activeItem) {
      return (
        <div className="h-full flex items-center justify-center px-5 text-center">
          <div className="space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-[11px] font-extrabold text-slate-500">Select an item</p>
            <p className="text-[9.5px] font-semibold text-slate-350 leading-relaxed">Choose an RFI or Issue from the left panel to view assignment and comments.</p>
          </div>
        </div>
      );
    }

    const selectedMarkup = coordinationMarkups.find((markup) => markup.itemId === activeItem.id);
    const comments = selectedMarkup?.comments || coordinationItemComments[activeItem.id] || [];
    const itemAccent = activeRfiTab === "rfi" ? "blue" : "rose";
    const extraAssignees: Record<string, string[]> = {
      "RFI-101": ["Alex Rivera", "Emma Watson"],
      "RFI-102": ["Lisa P."],
      "RFI-103": ["Snehasis Mohapatra", "Sam K."],
      "RFI-104": ["Emma Watson"],
      "ISS-301": ["Lisa P.", "Alex Rivera"],
      "ISS-302": ["Snehasis Mohapatra", "Emma Watson"],
      "ISS-303": ["Sam K."],
      "ISS-304": ["Lisa P.", "Emma Watson"]
    };
    const assignedPeople = Array.from(new Set([activeItem.assignee, ...(extraAssignees[activeItem.id] || [])]));
    const getInitials = (name: string) => name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const assignedDate = activeItem.id.endsWith("1") ? "May 28, 2026, 10:30 AM" : activeItem.id.endsWith("2") ? "May 29, 2026, 2:15 PM" : "May 30, 2026, 9:00 AM";
    const handleStatusUpdate = (nextStatus: string) => {
      if (activeRfiTab === "rfi") {
        setRfis((prev) => prev.map((item) => item.id === activeItem.id ? { ...item, status: nextStatus } : item));
      } else {
        setIssues((prev) => prev.map((item) => item.id === activeItem.id ? { ...item, status: nextStatus } : item));
      }
      triggerToast(`${activeItem.id} status updated to ${nextStatus}`, "success");
    };

    const submitComment = (event: React.FormEvent) => {
      event.preventDefault();
      if (!rightPanelCommentText.trim()) return;

      const newComm = {
        id: `right-panel-comment-${Date.now()}`,
        author: "Snehasis Mohapatra",
        avatar: "SM",
        time: "Just now",
        text: rightPanelCommentText.trim()
      };

      if (selectedMarkup) {
        setCoordinationMarkups((prev) => prev.map((markup) => (
          markup.id === selectedMarkup.id
            ? { ...markup, comments: [...(markup.comments || []), newComm] }
            : markup
        )));
      } else {
        setCoordinationItemComments((prev) => ({
          ...prev,
          [activeItem.id]: [...(prev[activeItem.id] || []), newComm]
        }));
      }

      setRightPanelCommentText("");
      triggerToast("Comment added", "success");
    };

    return (
      <div className="h-full flex flex-col text-left bg-white">
        <div className="px-3 py-2 border-b border-slate-100 bg-white space-y-2 shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`text-[7.5px] font-extrabold uppercase tracking-wider ${activeRfiTab === "rfi" ? "text-blue-600" : "text-rose-600"}`}>
                {activeRfiTab === "rfi" ? "RFI Thread" : "Issue Thread"}
              </p>
              <h3 className="mt-0.5 text-[10.5px] font-extrabold text-slate-850 leading-snug line-clamp-1">{activeItem.title}</h3>
            </div>
            <span className="shrink-0 rounded-md bg-slate-50 border border-slate-100 px-1.5 py-0.5 text-[7.5px] font-black text-slate-500 font-mono">{activeItem.id}</span>
          </div>

          <div
            className={`w-full rounded-2xl border p-2.5 text-left transition-all cursor-pointer ${
              itemAccent === "blue" ? "border-blue-100 bg-blue-50/35 hover:bg-blue-50/60" : "border-rose-100 bg-rose-50/30 hover:bg-rose-50/50"
            }`}
          >
            <div
              role="button"
              tabIndex={0}
              onClick={() => setExpandedCoordinationAssignee((prev) => !prev)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setExpandedCoordinationAssignee((prev) => !prev);
                }
              }}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex -space-x-2 shrink-0">
                  {assignedPeople.slice(0, 3).map((person, index) => (
                    <div
                      key={person}
                      className={`h-8 w-8 rounded-full ring-2 ring-white flex items-center justify-center text-[9px] font-black text-white ${itemAccent === "blue" ? "bg-blue-600" : "bg-rose-600"}`}
                      style={{ opacity: 1 - index * 0.08 }}
                    >
                      {getInitials(person)}
                    </div>
                  ))}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-extrabold text-slate-800 truncate">
                    {assignedPeople.length} assigned person{assignedPeople.length === 1 ? "" : "s"}
                  </p>
                  <p className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider truncate">
                    {assignedPeople.join(", ")}
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expandedCoordinationAssignee ? "" : "-rotate-90"}`} />
            </div>

            {expandedCoordinationAssignee && (
              <div className="mt-2 space-y-2 border-t border-white/80 pt-2">
                <div className="space-y-1">
                  {assignedPeople.map((person, index) => (
                    <div key={person} className="flex items-center justify-between rounded-xl bg-white/75 border border-white px-2 py-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className={`h-[22px] w-[22px] rounded-full flex items-center justify-center text-[7.5px] font-black text-white shrink-0 ${itemAccent === "blue" ? "bg-blue-600" : "bg-rose-600"}`}>
                          {getInitials(person)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[9.5px] font-extrabold text-slate-700 truncate">{person}</p>
                          <p className="text-[7.5px] font-bold uppercase tracking-wider text-slate-350">{index === 0 ? "Primary owner" : "Collaborator"}</p>
                        </div>
                      </div>
                      <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-350">Assigned</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <div className="rounded-xl bg-white/75 border border-white px-2 py-1.5">
                    <p className="text-[7.5px] font-black uppercase tracking-wider text-slate-350">Deadline</p>
                    <p className="mt-0.5 text-[9.5px] font-extrabold text-slate-700 truncate">{activeItem.due}</p>
                  </div>
                  <div className="rounded-xl bg-white/75 border border-white px-2 py-1.5">
                    <p className="text-[7.5px] font-black uppercase tracking-wider text-slate-350">Assigned</p>
                    <p className="mt-0.5 text-[9.5px] font-extrabold text-slate-700 truncate">{assignedDate}</p>
                  </div>
                  <div className="rounded-xl bg-white/75 border border-white px-2 py-1.5">
                    <p className="text-[7.5px] font-black uppercase tracking-wider text-slate-350">Priority</p>
                    <p className="mt-0.5 text-[9.5px] font-extrabold text-slate-700 truncate">{activeItem.priority}</p>
                  </div>
                  <div className="rounded-xl bg-white/75 border border-white px-2 py-1.5">
                    <p className="text-[7.5px] font-black uppercase tracking-wider text-slate-350">Status</p>
                    <select
                      value={activeItem.status}
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => handleStatusUpdate(event.target.value)}
                      className="mt-0.5 w-full bg-transparent text-[9.5px] font-extrabold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      {["Open", "In Progress", "In Review", "Resolved", "Closed"].map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3 bg-slate-50/35">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Comments</h4>
            </div>
            <span className="text-[8.5px] font-bold text-slate-350">{comments.length} message{comments.length === 1 ? "" : "s"}</span>
          </div>

          {comments.length === 0 ? (
            <div className="h-full min-h-[180px] flex items-center justify-center text-center">
              <div className="space-y-1.5">
                <MessageSquare className="w-7 h-7 text-slate-300 mx-auto" />
                <p className="text-[11px] font-extrabold text-slate-500">No comments yet</p>
                <p className="text-[9.5px] font-semibold text-slate-350">Start the discussion from the box below.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {comments.map((comment: any, index: number) => (
                <div key={comment.id || index} className="flex gap-2">
                  <div className="h-7 w-7 rounded-full bg-white border border-slate-100 text-slate-700 flex items-center justify-center text-[9px] font-black shrink-0">
                    {comment.avatar || comment.author?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 rounded-2xl bg-white border border-slate-100 px-2.5 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-slate-750 truncate">{comment.author}</span>
                      <span className="text-[8px] font-semibold text-slate-350 shrink-0">{comment.time}</span>
                    </div>
                    <p className="mt-1 text-[10px] font-semibold leading-relaxed text-slate-550 break-words">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={submitComment} className="shrink-0 border-t border-slate-100 bg-white p-2.5">
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-150 bg-slate-50 px-2 py-1.5 focus-within:bg-white focus-within:border-blue-300 transition-all">
            <input
              type="text"
              value={rightPanelCommentText}
              onChange={(event) => setRightPanelCommentText(event.target.value)}
              placeholder={`Comment on ${activeItem.id}...`}
              className="min-w-0 flex-1 bg-transparent text-[11px] font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button type="submit" className="h-7 w-7 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all cursor-pointer">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-white overflow-hidden text-slate-800 font-sans relative flex flex-col selection:bg-blue-100">
      <style dangerouslySetInnerHTML={{ __html: `
        /* Smooth bounce & fade animation for lists and items */
        .micro-fade-in {
          animation: microFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes microFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Hover lift micro-interaction */
        .hover-lift {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.3) !important;
        }
        .hover-lift:active {
          transform: translateY(0);
        }

        /* Smooth rotation transition for chevrons */
        .rotate-chevron {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Slide in animations for panels */
        .panel-slide-left {
          animation: slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .panel-slide-right {
          animation: slideRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideLeft {
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        /* Tab accent slide-in style */
        .tab-glow {
          position: relative;
        }
        .tab-glow::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 15%;
          right: 15%;
          height: 2px;
          background: #2563eb;
          border-radius: 9999px;
          transform: scaleX(0);
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tab-glow-active::after {
          transform: scaleX(1);
        }

        /* Eye toggle keyframes for dynamic feedback */
        @keyframes eyeTogglePulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.25); }
          100% { transform: scale(1); }
        }
        .eye-pulse {
          animation: eyeTogglePulse 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
      ` }} />
      
      {/* 1. Header Toolbar */}
      {activeTab === "map" && (
      <div className="absolute top-0 left-6 z-40 bg-white/90 backdrop-blur border-x border-b border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-2.5 py-1.5 rounded-b-2xl flex items-center gap-2 w-[280px]">
        <div className="w-7 h-7 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
          <Compass className="w-3.5 h-3.5 animate-spin-slow" />
        </div>
        <form onSubmit={handleSearch} className="flex-1 flex gap-1 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or coordinate..."
            className="w-full bg-slate-50 border border-slate-100/80 rounded-xl px-3 py-1.5 text-[11px] font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
          />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>
      )}

      {/* 2. Top Center Tab Selector */}
      {isTopTabBarCollapsed && (
        <button
          onClick={() => setIsTopTabBarCollapsed(false)}
          className="absolute top-0 left-1/2 -translate-x-1/2 z-50 h-7 px-3 rounded-b-xl bg-white/95 border-x border-b border-slate-100/80 shadow-[0_10px_28px_rgba(15,23,42,0.10)] text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 text-[10px] font-extrabold transition-all active:scale-95 cursor-pointer"
          title="Show tabs"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          Tabs
        </button>
      )}
      <div className={`absolute left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur border-x border-b border-slate-100/80 p-1 rounded-b-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center gap-0.5 transition-all duration-300 ease-out ${
        isTopTabBarCollapsed ? "top-0 -translate-y-[calc(100%+4px)] opacity-0 pointer-events-none" : "top-0"
      }`}>
        <button
          onClick={() => setIsTopTabBarCollapsed(true)}
          className="h-8 w-8 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          title="Hide tabs"
        >
          <ChevronDown className="w-3.5 h-3.5 rotate-180" />
        </button>
        <button
          onClick={() => {
            setActiveTab("map");
            setIsTopTabBarCollapsed(false);
          }}
          className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all hover:scale-105 active:scale-95 ${
            activeTab === "map"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Map setup
        </button>
        <div className="relative" ref={drawingDropdownRef}>
          <button
            onClick={() => setIsDrawingDropdownOpen(!isDrawingDropdownOpen)}
            className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "drawing" || activeTab === "3d"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>{activeTab === "3d" ? "3D setup" : "Drawing setup"}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>
          
          {isDrawingDropdownOpen && (
            <div className="absolute left-0 mt-2 w-40 rounded-xl bg-white border border-slate-100/60 shadow-2xl py-1 z-[110] animate-in fade-in slide-in-from-top-1 duration-150">
              <button
              onClick={() => {
                if (selectedMarkup?.type === "area" && selectedMarkup.drawingOverlay) {
                  setSelectedDrawingAreaId(selectedMarkup.id);
                  setActiveEyeDrawing(null);
                }
                setActiveTab("drawing");
                setIsTopTabBarCollapsed(false);
                setIsDrawingDropdownOpen(false);
              }}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 flex items-center gap-2 cursor-pointer ${
                  activeTab === "drawing" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                Drawing setup
              </button>
              <button
              onClick={() => {
                setActiveTab("3d");
                setIsTopTabBarCollapsed(false);
                setIsDrawingDropdownOpen(false);
              }}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-bold transition-colors hover:bg-slate-50 flex items-center gap-2 cursor-pointer ${
                  activeTab === "3d" ? "text-blue-600 bg-blue-50/50" : "text-slate-700"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                3D setup
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            setActiveTab("drone");
            setIsTopTabBarCollapsed(false);
          }}
          className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all hover:scale-105 active:scale-95 ${
            activeTab === "drone"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Drone setup
        </button>
        <button
          onClick={() => {
            setActiveTab("coordination");
            setIsTopTabBarCollapsed(false);
            triggerToast("Switched to BIM Coordination View");
          }}
          className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "coordination"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          BIM Coordination
        </button>
        <button
          onClick={() => {
            setActiveTab("split");
            setIsTopTabBarCollapsed(false);
            triggerToast(isSplitWorkspaceLoaded ? "Opened Split Screen Workspace" : "Load a drawing to start Split Screen");
          }}
          className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
            activeTab === "split"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split Screen</span>
        </button>
        <div className="ml-1 pl-1 border-l border-slate-100">
          <button
            onClick={() => setIsDefaultViewModalOpen(true)}
            className="h-8 w-8 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            title="Viewer settings"
            aria-label="Viewer settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isDefaultViewModalOpen && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm"
          onClick={() => setIsDefaultViewModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-white/80 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.22)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                    <Settings className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950">Default view</h3>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-400">Choose what opens first for this project.</p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDefaultViewModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-slate-50 hover:text-slate-700 cursor-pointer"
                aria-label="Close default view settings"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3">
              {DEFAULT_VIEW_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = defaultViewerTab === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSetDefaultViewerTab(option.id)}
                    className={`group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all cursor-pointer ${
                      isSelected ? "bg-blue-50/80" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white text-slate-500 ring-1 ring-slate-100 group-hover:text-blue-600"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-extrabold text-slate-900">{option.label}</div>
                      <div className="mt-0.5 truncate text-[10px] font-semibold text-slate-400">{option.description}</div>
                    </div>
                    <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      isSelected ? "bg-blue-600 text-white" : "bg-white ring-1 ring-slate-200"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. Floating Toast Banner */}
      {toastMessage && (
        <div
          className="absolute bottom-6 left-1/2 z-50 flex max-w-[min(520px,calc(100%-32px))] -translate-x-1/2 animate-in fade-in slide-in-from-bottom-2 items-center gap-2 rounded-xl border border-slate-100/80 bg-white/95 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-lg backdrop-blur"
        >
          <Sparkles className="w-3.5 h-3.5 shrink-0 text-yellow-400" />
          <span className="min-w-0 truncate">{toastMessage}</span>
        </div>
      )}

      {/* -------------------- TAB 1: MAP SETUP WORKSPACE -------------------- */}
      {activeTab === "map" && (
        <div className="w-full h-full relative flex">
          
          {/* Step-by-Step Child Guidance Banner */}
	          {(activeTool === "polygon" || activeTool === "nestedPolygon") && (
	            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-100/80 px-5 py-3.5 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.12)] flex items-center gap-3.5 max-w-sm text-left transition-all duration-300 animate-in fade-in slide-in-from-top-4">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-md shadow-blue-500/20">
                💡
              </div>
              <div className="min-w-0">
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                  Polygon Assistant
                </p>
                <p className="text-xs text-slate-700 font-bold mt-0.5 leading-tight">
                  {activeTool === "polygon" && drawingPoints.length === 0 && "Step 1: Click anywhere on the map grid to place your first corner point!"}
                  {activeTool === "polygon" && drawingPoints.length === 1 && "Step 2: Perfect! Now click a second location to draw a line connection!"}
                  {activeTool === "polygon" && drawingPoints.length === 2 && "Step 3: Great job! Click a third location to outline your area shape!"}
                  {activeTool === "polygon" && drawingPoints.length >= 3 && "Step 4: Almost done! Now click the pulsing green ring at your start point to finish your boundary!"}
                  {activeTool === "nestedPolygon" && nestedDrawingPoints.length === 0 && "Step 1: Click inside the blueprint to place the first corner of your smaller zone."}
                  {activeTool === "nestedPolygon" && nestedDrawingPoints.length === 1 && "Step 2: Click another point inside the drawing to create the next edge."}
                  {activeTool === "nestedPolygon" && nestedDrawingPoints.length === 2 && "Step 3: Add one more point to form a usable smaller area."}
                  {activeTool === "nestedPolygon" && nestedDrawingPoints.length >= 3 && "Step 4: Click the start point or press Done to create this nested polygon zone."}
                </p>
	              </div>
	            </div>
	          )}

          {pendingDrawingSitePlans.length > 0 && activeTool === "pan" && (
            <div className="absolute top-20 left-1/2 z-30 w-[min(420px,calc(100%-32px))] -translate-x-1/2 rounded-2xl border border-amber-100/80 bg-white/95 px-3 py-2.5 text-left shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700">
                    {pendingDrawingSitePlans.length} site plan ready
                  </p>
                  <h3 className="mt-0.5 text-xs font-extrabold text-slate-900">
                    Draw boundary, then assign plan.
                  </h3>
                  <p className="mt-0.5 text-[9px] font-semibold leading-3.5 text-slate-500">
                    Choose now as suggestion. Final assignment comes after boundary.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pendingDrawingSitePlans.map((plan) => {
                      const isSelected = boundaryPlacementTarget === plan.id || (!boundaryPlacementTarget && selectedDrawingAreaId === plan.id);
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => {
                            setBoundaryPlacementTarget(plan.id);
                            setSelectedDrawingAreaId(plan.id);
                            setSelectedMarkupId(plan.id);
                            setSelectedNestedLayerId(null);
                            setActiveTool("polygon");
                            triggerToast(`${plan.label} selected as suggestion. Draw the boundary, then confirm assignment.`);
                          }}
                          className={`rounded-lg border px-2.5 py-1 text-[9px] font-bold transition-all active:scale-95 cursor-pointer ${
                            isSelected
                              ? "border-blue-200 bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          }`}
                          title={plan.drawingOverlay ? "Linked base drawing ready" : "No base drawing linked yet"}
                        >
                          {plan.label}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setBoundaryPlacementTarget("fresh");
                        setSelectedDrawingAreaId(null);
                        setSelectedMarkupId(null);
                        setSelectedNestedLayerId(null);
                        setActiveTool("polygon");
                        triggerToast("Fresh boundary selected. Draw a map boundary without assigning a plan.");
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-[9px] font-bold transition-all active:scale-95 cursor-pointer ${
                        boundaryPlacementTarget === "fresh"
                          ? "border-slate-900 bg-slate-950 text-white"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Fresh boundary
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

		          {(shouldShowCreateZonesGuide || shouldShowDrawingSetupGuide) && activeArea && (
		            <div className={`absolute left-1/2 -translate-x-1/2 z-30 w-[min(430px,calc(100%-32px))] rounded-2xl border border-blue-100/80 bg-white/95 px-4 py-3 text-left shadow-[0_14px_36px_rgba(15,23,42,0.13)] backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-200 ${
                  isDrawingDropdownOpen ? "top-36" : "top-20"
                }`}>
	              <div className="flex items-start gap-2.5">
	                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
	                  {shouldShowCreateZonesGuide ? <Plus className="h-4.5 w-4.5" /> : <CheckCircle2 className="h-4.5 w-4.5" />}
	                </div>
	                <div className="min-w-0 flex-1">
	                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600">
	                    {shouldShowCreateZonesGuide ? "Floor plan added" : "Zone markup created"}
	                  </p>
	                  <h3 className="mt-0.5 text-[13px] font-extrabold text-slate-900">
	                    {shouldShowCreateZonesGuide
	                      ? "Next, create zones inside your area."
	                      : "If your zone markup is complete, continue to Drawing Setup."}
	                  </h3>
	                  <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">
	                    {shouldShowCreateZonesGuide
	                      ? "Use the zone tool to mark one or more internal areas on the floor plan before assigning drawings."
	                      : `${activeAreaZoneCount} zone${activeAreaZoneCount === 1 ? "" : "s"} created. You can add another zone, or proceed to configure levels and drawing assignments.`}
	                  </p>
	                  <div className="mt-2.5 flex flex-wrap gap-2">
	                    <button
	                      type="button"
	                      onClick={() => startChildDrawingLayer(activeArea.id)}
	                      className="rounded-xl bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95 cursor-pointer"
	                    >
	                      {shouldShowCreateZonesGuide ? "Create zone" : "Add another zone"}
	                    </button>
	                    {shouldShowDrawingSetupGuide && (
	                      <button
	                        type="button"
	                        onClick={openDrawingSetupFromMapGuide}
	                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
	                      >
	                        Open Drawing Setup
	                      </button>
	                    )}
	                  </div>
	                </div>
	              </div>
	            </div>
	          )}
	          
	          {/* Map Viewport Canvas */}
          <div
            ref={mapViewportRef}
            onMouseDown={handleMapMouseDown}
            onMouseMove={handleMapMouseMove}
            onMouseUp={handleMapMouseUpOrLeave}
            onMouseLeave={handleMapMouseUpOrLeave}
            onWheel={handleMapWheel}
            className={`w-full h-full overflow-hidden bg-slate-900 relative select-none ${
              activeTool === "pan" ? "cursor-grab active:cursor-grabbing" : ""
            }`}
            style={{
              cursor: activeTool === "polygon" || activeTool === "nestedPolygon" ? PEN_CURSOR : undefined
            }}
          >
            {/* Infinite Zoomable & Panable Map Layer */}
            <div
              ref={mapContentRef}
              className={`absolute origin-center transition-transform ${
                isMapFocusing ? "duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" : "duration-75 ease-out"
              }`}
              style={{
                width: "3000px",
                height: "3000px",
                transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${mapZoom})`,
                left: "calc(50% - 1500px)",
                top: "calc(50% - 1500px)"
              }}
            >
              {/* Satellite Base Image with infinite seamless repeat */}
              <div
                className="w-full h-full absolute inset-0 pointer-events-none select-none"
                style={{
                  backgroundImage: "url(/satellite_map_earth.png)",
                  backgroundRepeat: "repeat",
                  backgroundSize: "1500px 1500px"
                }}
              />

	              {/* RENDER DRAWING OVERLAYS ON THE MAP */}
	              {markups.map((markup) => {
	                if (markup.type === "area" && markup.isPlacedOnMap === false) return null;
	                if (!markup.drawingOverlay) return null;
                const { x, y, width, height } = getMarkupCenter(markup);
                const overlay = markup.drawingOverlay;

                return (
                  <div
                    key={`overlay-${markup.id}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${x - width / 2}px`,
                      top: `${y - height / 2}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      transform: `translate(${overlay.offsetX}px, ${overlay.offsetY}px) rotate(${overlay.rotate}deg) scale(${overlay.scale})`,
                      transformOrigin: "center center",
                      opacity: overlay.opacity,
                      transition: isPanning ? "none" : "transform 0.1s ease-out, opacity 0.1s ease-out"
                    }}
                  >
                    <BlueprintImage
                      src={overlay.url}
                      alt="Floorplan Blueprint Overlay"
                      className="w-full h-full object-contain border border-blue-500/30"
                    />
                    {renderNestedDrawingLayers(markup.childLayers || [], markup.id)}
	                  </div>
	                );
	              })}

	              {/* CENTER FLOOR PLAN UPLOAD ACTION FOR ZONES WITHOUT BLUEPRINTS */}
	              {markups
	                .filter((markup) => markup.type === "area" && markup.isPlacedOnMap !== false && !markup.drawingOverlay)
	                .map((markup) => {
	                  const { x, y } = getMarkupCenter(markup);
	                  const isSelected = selectedMarkupId === markup.id;
	                  return (
	                    <button
	                      key={`upload-floor-plan-${markup.id}`}
	                      type="button"
	                      onMouseDown={(e) => e.stopPropagation()}
	                      onClick={(e) => {
	                        e.stopPropagation();
	                        openBlueprintSourceModal(markup.id);
	                      }}
	                      className={`absolute z-30 pointer-events-auto -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 rounded-2xl px-3 py-2 text-center transition-all hover:scale-[1.03] active:scale-[0.98] cursor-pointer ${
	                        isSelected ? "ring-4 ring-blue-500/15" : ""
	                      }`}
	                      style={{ left: `${x}px`, top: `${y}px` }}
	                      title="Upload site plan"
	                    >
	                      <span className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-600/25">
	                        <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping" />
	                        <span className="absolute inset-[-7px] rounded-full border border-blue-300/60 animate-pulse" />
	                        <Plus className="relative h-6 w-6" />
	                      </span>
	                      <span className="rounded-xl border border-white/70 bg-white/95 px-3 py-1.5 shadow-[0_10px_28px_rgba(15,23,42,0.16)] backdrop-blur">
	                        <span className="block text-[11px] font-extrabold text-slate-900">Upload site plan</span>
	                        <span className="block text-[9px] font-semibold text-slate-400">HUB or device</span>
	                      </span>
	                    </button>
	                  );
	                })}
	
	              {/* RENDER DYNAMIC FLOATING SETTINGS CONTROLS ON THE MAP */}
              {activeTool === "pan" && markups.filter((markup) => markup.isPlacedOnMap !== false).flatMap((markup) => getCalibrationTargets(markup)).map((target) => {
                const isCalibrating = calibratingMarkupId === target.id;

                return (
                  <div
                    key={`controls-${target.id}`}
                    className="absolute z-20 origin-center flex gap-2 pointer-events-auto animate-in fade-in duration-200"
                    style={{
                      left: `${target.x}px`,
                      top: `${target.controlY}px`,
                      transform: "translate(-50%, -50%)"
                    }}
                  >
                    {/* Small Gear Button floating at top of drawing zone */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCalibratingMarkupId(isCalibrating ? null : target.id);
                        setSelectedMarkupId(target.parentMarkupId);
                        if (target.isLayer) {
                          setSelectedNestedLayerId(target.id);
                        } else {
                          setSelectedNestedLayerId(null);
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-slate-950 text-white shadow-lg border border-slate-700/80 flex items-center justify-center transition-all hover:scale-110 cursor-pointer group/gear relative"
                      title={`Calibration Settings for ${target.label}`}
                    >
                      <Settings className={`w-4 h-4 ${isCalibrating ? "animate-spin" : "group-hover/gear:rotate-45 transition-transform duration-300"}`} />
                      
                      {/* Tooltip guide */}
                      <span className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-slate-700 text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/gear:opacity-100 transition-opacity pointer-events-none border border-slate-100/80">
                        Calibrate Overlay
                      </span>
                    </button>

                    {/* Plus Button to Add Zone inside this blueprint overlay (only for top-level site boundary blueprint) */}
                    {!target.isLayer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMarkupId(target.parentMarkupId);
                          setSelectedNestedLayerId(null);
                          startChildDrawingLayer();
                        }}
                        className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all hover:scale-110 cursor-pointer group/addzone relative"
                        title="Draw New Zone"
                      >
                        <Plus className="w-4 h-4" />
                        {/* Tooltip guide */}
                        <span className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-slate-700 text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/addzone:opacity-100 transition-opacity pointer-events-none border border-slate-100/80">
                          Draw New Zone
                        </span>
                      </button>
                    )}

                    {/* Floating Calibration Alignment Card Popover */}
                    {isCalibrating && (
                      <div
                        onClick={(e) => e.stopPropagation()} // Prevent map pan click triggers
                        className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-100/80 p-4 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.16)] w-72 text-slate-800 pointer-events-auto z-50 flex flex-col gap-3"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1.5">
                            <Sliders className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                              Calibration: {target.label}
                            </span>
                          </div>
                          <button
                            onClick={() => setCalibratingMarkupId(null)}
                            className="text-slate-400 hover:text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Sliders matching the screenshot design */}
                        <div className="space-y-3">
                          {/* Scale */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <Scaling className="w-3 h-3 text-slate-400" /> Scale Size
                              </span>
                              <span className="text-slate-700 font-bold font-mono">
                                {Math.round(target.overlay.scale * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.2"
                              max="3.0"
                              step="0.05"
                              value={target.overlay.scale}
                              onChange={(e) => updateOverlayProp("scale", parseFloat(e.target.value), target.id)}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Rotation */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <RotateCw className="w-3 h-3 text-slate-400" /> Rotation Angle
                              </span>
                              <span className="text-slate-700 font-bold font-mono">
                                {target.overlay.rotate}°
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-180"
                              max="180"
                              step="2"
                              value={target.overlay.rotate}
                              onChange={(e) => updateOverlayProp("rotate", parseInt(e.target.value), target.id)}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Opacity */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-slate-500 font-medium flex items-center gap-1">
                                <Eye className="w-3 h-3 text-slate-400" /> Transparency (Opacity)
                              </span>
                              <span className="text-slate-700 font-bold font-mono">
                                {Math.round(target.overlay.opacity * 100)}%
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0.0"
                              max="1.0"
                              step="0.05"
                              value={target.overlay.opacity}
                              onChange={(e) => updateOverlayProp("opacity", parseFloat(e.target.value), target.id)}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Pan Offset X */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-slate-500 font-medium">Pan Offset X</span>
                              <span className="text-slate-700 font-bold font-mono">
                                {target.overlay.offsetX}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-300"
                              max="300"
                              step="2"
                              value={target.overlay.offsetX}
                              onChange={(e) => updateOverlayProp("offsetX", parseInt(e.target.value), target.id)}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Pan Offset Y */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-slate-500 font-medium">Pan Offset Y</span>
                              <span className="text-slate-700 font-bold font-mono">
                                {target.overlay.offsetY}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min="-300"
                              max="300"
                              step="2"
                              value={target.overlay.offsetY}
                              onChange={(e) => updateOverlayProp("offsetY", parseInt(e.target.value), target.id)}
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        </div>

                        {/* Reset Alignment Button */}
                        <button
                          onClick={() => {
                            updateOverlayProp("scale", 0.8, target.id);
                            updateOverlayProp("rotate", 0, target.id);
                            updateOverlayProp("opacity", 0.75, target.id);
                            updateOverlayProp("offsetX", 0, target.id);
                            updateOverlayProp("offsetY", 0, target.id);
                            triggerToast("Reset alignment parameters");
                          }}
                          className="w-full h-9 mt-1.5 rounded-xl border border-slate-100/80 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors cursor-pointer"
                        >
                          Reset Alignment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* SVG vector lines and elements overlay */}
              <svg
                onClick={handleMapClick}
                onMouseMove={handleSVGMouseMove}
                onMouseUp={handleSVGMouseUp}
                onMouseLeave={handleSVGMouseUp}
                className={`absolute inset-0 w-full h-full z-10 ${
                  (activeTool === "pan" && !draggedNode) ? "pointer-events-none" : "pointer-events-auto"
                }`}
                viewBox="0 0 3000 3000"
              >

                {/* Render Permanent Markups */}
                {markups.map((markup) => {
                  if (markup.type === "area" && markup.isPlacedOnMap === false) return null;
                  const isSelected = selectedMarkupId === markup.id;
                  const isPulsing = focusPulse?.markupId === markup.id && !focusPulse.layerId;

                  if (markup.type === "pin") {
                    const pt = markup.points[0];
                    return (
                      <g
                        key={markup.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMarkupId(markup.id);
                          setSelectedNestedLayerId(null);
                          triggerToast(`Selected Pin: ${markup.label}`);
                        }}
                        className={`cursor-pointer group ${
                          activeTool === "pan" ? "pointer-events-auto" : "pointer-events-none"
                        }`}
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isSelected ? "18" : "12"}
                          fill={`${markup.color}25`}
                          stroke={markup.color}
                          strokeWidth="2.5"
                          className="transition-all"
                        />
                        <circle cx={pt.x} cy={pt.y} r="4" fill={markup.color} />
                        {/* Text label popup on hover */}
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <rect
                            x={pt.x - 50}
                            y={pt.y - 32}
                            width="100"
                            height="20"
                            rx="5"
                            fill="#0f172a"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - 18}
                            fill="#ffffff"
                            fontSize="9"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {markup.label}
                          </text>
                        </g>
                      </g>
                    );
                  }

                  if (markup.type === "circle") {
                    const center = markup.points[0];
                    const edge = markup.points[1];
                    const r = getDistance(center, edge);
                    return (
                      <g
                        key={markup.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMarkupId(markup.id);
                          setSelectedNestedLayerId(null);
                          triggerToast(`Selected Circle: ${markup.label}`);
                        }}
                        className={`cursor-pointer ${
                          activeTool === "pan" ? "pointer-events-auto" : "pointer-events-none"
                        }`}
                      >
                        <circle
                          cx={center.x}
                          cy={center.y}
                          r={r}
                          fill="transparent"
                          stroke={markup.color}
                          strokeWidth={isSelected ? "4" : "2.5"}
                          strokeDasharray="6 4"
                        />
                        <circle cx={center.x} cy={center.y} r="5" fill={markup.color} />
                        {/* Interactive adjustment handles for circle center and edge */}
                        {isSelected && activeTool === "pan" && (
                          <>
                            <circle
                              cx={center.x}
                              cy={center.y}
                              r="8"
                              fill="#ffffff"
                              stroke={markup.color}
                              strokeWidth="2.5"
                              className="cursor-move hover:stroke-slate-900 transition-colors duration-150 pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggedNode({ markupId: markup.id, pointIndex: 0 });
                              }}
                            />
                            <circle
                              cx={edge.x}
                              cy={edge.y}
                              r="8"
                              fill="#ffffff"
                              stroke={markup.color}
                              strokeWidth="2.5"
                              className="cursor-ew-resize hover:stroke-slate-900 transition-colors duration-150 pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggedNode({ markupId: markup.id, pointIndex: 1 });
                              }}
                            />
                          </>
                        )}
                      </g>
                    );
                  }

                  if (markup.type === "area") {
                    // Polygon path string
                    const pathStr = markup.points.map((p) => `${p.x},${p.y}`).join(" ");
                    return (
                      <g key={markup.id} className="pointer-events-none">
                        {isPulsing && (
                          <polygon
                            points={pathStr}
                            fill="transparent"
                            stroke="#ffffff"
                            strokeWidth="14"
                            opacity="0.85"
                            className="pointer-events-none animate-pulse"
                            style={{
                              filter: "drop-shadow(0 0 18px rgba(59,130,246,0.95)) drop-shadow(0 0 32px rgba(234,179,8,0.75))"
                            }}
                          />
                        )}
                        <polygon
                          points={pathStr}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMarkupId(markup.id);
                            setSelectedNestedLayerId(null);
                            triggerToast(`Selected Area: ${markup.label}`);
                          }}
                          className={`cursor-pointer transition-colors ${
                            activeTool === "pan" ? "pointer-events-auto" : "pointer-events-none"
                          }`}
                          fill={isSelected ? `${markup.color}15` : "transparent"}
                          stroke={markup.color}
                          strokeWidth={isSelected ? "4.5" : "3.5"}
                        />
                        {/* Interactive draggable handles at every polygon vertex */}
                        {isSelected && activeTool === "pan" &&
                          markup.points.map((p, pIdx) => (
                            <circle
                              key={`pt-${pIdx}`}
                              cx={p.x}
                              cy={p.y}
                              r="8"
                              fill="#ffffff"
                              stroke={markup.color}
                              strokeWidth="2.5"
                              className="cursor-move hover:stroke-slate-900 transition-colors duration-150 pointer-events-auto"
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggedNode({ markupId: markup.id, pointIndex: pIdx });
                              }}
                            />
                          ))}
                      </g>
                    );
                  }

                  return null;
                })}

                {/* Render active drawing line segment helper */}
                {activeTool === "polygon" && drawingPoints.length > 0 && (
                  <g className="pointer-events-none">
                    {/* Draw existing closed lines */}
                    <polyline
                      points={drawingPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                      fill="transparent"
                      stroke="#eab308"
                      strokeWidth="3.5"
                    />
                    {/* Dots at corners */}
                    {drawingPoints.map((p, idx) => (
                      <circle
                        key={`draw-pt-${idx}`}
                        cx={p.x}
                        cy={p.y}
                        r="6"
                        fill="#eab308"
                      />
                    ))}
                    {/* Pulsing green ring around the first node */}
                    <circle
                      cx={drawingPoints[0].x}
                      cy={drawingPoints[0].y}
                      r="20"
                      fill="#10b98125"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeDasharray="4 2"
                      className="animate-pulse"
                    />
                    {/* Tooltip hint next to start point when polygon can be closed */}
                    {drawingPoints.length >= 3 && (
                      <g className="pointer-events-none">
                        <rect
                          x={drawingPoints[0].x + 25}
                          y={drawingPoints[0].y - 12}
                          width="95"
                          height="22"
                          rx="6"
                          fill="#0f172a"
                        />
                        <text
                          x={drawingPoints[0].x + 72}
                          y={drawingPoints[0].y + 2}
                          fill="#ffffff"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          👉 Click to Finish!
                        </text>
                      </g>
                    )}
                  </g>
                )}

                {/* Render active nested polygon drawing helper */}
                {activeTool === "nestedPolygon" &&
                  selectedMarkup &&
                  nestedDrawingPoints.length > 0 &&
                  (() => {
                    const targetBox = getLayerAbsoluteBox(selectedMarkup, nestedDrawingParentId);
                    if (!targetBox) return null;

                    const mapPoints = nestedDrawingPoints.map((point) => ({
                      x: targetBox.left + (point.x / 100) * targetBox.width,
                      y: targetBox.top + (point.y / 100) * targetBox.height
                    }));

                    return (
                      <g className="pointer-events-none">
                        <polyline
                          points={mapPoints.map((point) => `${point.x},${point.y}`).join(" ")}
                          fill="transparent"
                          stroke="#3b82f6"
                          strokeWidth="3.5"
                        />
                        {mapPoints.map((point, idx) => (
                          <circle
                            key={`nested-draw-pt-${idx}`}
                            cx={point.x}
                            cy={point.y}
                            r="6"
                            fill="#3b82f6"
                          />
                        ))}
                        <circle
                          cx={mapPoints[0].x}
                          cy={mapPoints[0].y}
                          r="20"
                          fill="#10b98125"
                          stroke="#10b981"
                          strokeWidth="2.5"
                          strokeDasharray="4 2"
                          className="animate-pulse"
                        />
                        {mapPoints.length >= 3 && (
                          <g className="pointer-events-none">
                            <rect
                              x={mapPoints[0].x + 25}
                              y={mapPoints[0].y - 12}
                              width="95"
                              height="22"
                              rx="6"
                              fill="#ffffff"
                              stroke="#cbd5e1"
                              strokeWidth="1"
                            />
                            <text
                              x={mapPoints[0].x + 72}
                              y={mapPoints[0].y + 2}
                              fill="#1e293b"
                              fontSize="10"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              Click to Finish
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })()}
              </svg>

            </div>
          </div>

          {/* Left Vertical Map Toolbar */}
          <div className="absolute top-1/2 -translate-y-1/2 left-6 z-40 bg-white border border-slate-100/80 p-1.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col gap-1.5 panel-slide-left">
            
            {/* Pan Tool */}
            <div className="relative group/tooltip">
              <button
                onClick={() => {
                  setActiveTool("pan");
                  clearAreaDraft();
                  clearNestedDraft();
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeTool === "pan"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <MousePointer className="w-4 h-4" />
              </button>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-100/80">
                <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <MousePointer className="w-3.5 h-3.5 text-blue-400" />
                  Pan & Select Tool
                </p>
                <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                  Drag the map canvas to navigate, use scroll wheel to zoom, or click existing shapes on the map to inspect.
                </p>
              </div>
            </div>

            {/* Landmark Pin */}
            <div className="relative group/tooltip">
              <button
                onClick={() => {
                  setActiveTool("pin");
                  clearAreaDraft();
                  clearNestedDraft();
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeTool === "pin"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <MapPin className="w-4 h-4" />
              </button>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-100/80">
                <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  Drop Landmark Pin
                </p>
                <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                  Click anywhere on the map grid to drop an anchor pin. Perfect for marking critical coordinates or entry points.
                </p>
              </div>
            </div>

            {/* Radius Circle */}
            <div className="relative group/tooltip">
              <button
                onClick={() => {
                  setActiveTool("circle");
                  clearAreaDraft();
                  clearNestedDraft();
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  activeTool === "circle"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <CircleIcon className="w-4 h-4" />
              </button>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-100/80">
                <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <CircleIcon className="w-3.5 h-3.5 text-blue-400" />
                  Borehole / Radius Scope
                </p>
                <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                  Place circular zone boundaries. Drag center to move, or hover and drag the edge handle to scale the radius.
                </p>
              </div>
            </div>

            {/* Polygon Tool */}
            <div className="relative group/tooltip">
              <button
                onClick={() => {
                  setActiveTool("polygon");
                  clearNestedDraft();
                }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative ${
                  activeTool === "polygon"
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <PolygonIcon className="w-4 h-4" />
                {activeTool === "polygon" && drawingPoints.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-bold px-1 rounded-full animate-bounce">
                    {drawingPoints.length}
                  </span>
                )}
              </button>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-100/80">
                <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <PolygonIcon className="w-3.5 h-3.5 text-blue-400" />
                  Draw Custom Polygon
                </p>
                <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                  Click on the map to define polygon vertices. Click the initial start node (pulsing green ring) to close the shape and unlock CAD blueprint overlay options.
                </p>
              </div>
            </div>
            
            <div className="h-px bg-slate-100 mx-1 my-0.5" />
            
            {/* Clear All Tool */}
            <div className="relative group/tooltip">
              <button
                onClick={() => {
                  setMarkups([]);
                  setSelectedMarkupId(null);
                  triggerToast("Cleared all map markups");
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-100/80">
                <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Clear Workspace
                </p>
                <p className="text-[9px] text-slate-500 mt-1 leading-normal">
                  Deletes all landmark pins, radius scopes, site boundary polygons, and linked CAD blueprint overlays from the canvas.
                </p>
              </div>
            </div>
          </div>

          {/* Right Overlay: Drawing Controller */}
          {((activeTool === "polygon" && drawingPoints.length > 0) ||
            activeTool === "nestedPolygon") && (
            <div className="absolute top-24 right-6 z-40 w-72 bg-white/95 backdrop-blur-md border border-slate-100/80 rounded-2xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-3 flex flex-col gap-2.5 max-h-[45vh] overflow-y-auto">
              
              {/* If currently drawing a polygon */}
              {activeTool === "polygon" && drawingPoints.length > 0 ? (
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Drawing Mode
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                        New Site Boundary
                      </h3>
                    </div>
                    <button
                      onClick={cancelAreaDrawing}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Cancel Drawing"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-px bg-slate-100" />

                  {/* Points Counter */}
                  <div className="bg-slate-50/30 border border-slate-100/60 rounded-xl p-2 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">Points</p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 text-xs font-mono font-bold px-2 py-0.5 rounded-lg border border-blue-100">
                      {drawingPoints.length}
                    </span>
                  </div>

                  {/* Actions Grid (Undo, Redo, Done) */}
                  <div className="grid grid-cols-3 gap-1.5 mt-0.5">
                    <button
                      onClick={handleUndoPoint}
                      disabled={drawingPoints.length === 0}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                      title="Undo last point"
                    >
                      <Undo2 className="w-3 h-3" />
                      Undo
                    </button>
                    <button
                      onClick={handleRedoPoint}
                      disabled={redoPoints.length === 0}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                      title="Redo last point"
                    >
                      <Redo2 className="w-3 h-3" />
                      Redo
                    </button>
                    <button
                      onClick={handleCompleteDrawing}
                      disabled={drawingPoints.length < 3}
                      className="py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 "
                      title="Complete shape"
                    >
                      <Check className="w-3 h-3" />
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                          Nested Polygon Mode
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                        New Drawing Zone
                      </h3>
                    </div>
                    <button
                      onClick={cancelNestedDrawing}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                      title="Cancel Nested Drawing"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="bg-slate-50/30 border border-slate-100/60 rounded-xl p-2 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-slate-700">Points</p>
                    </div>
                    <span className="bg-blue-50 text-blue-600 text-xs font-mono font-bold px-2 py-0.5 rounded-lg border border-blue-100">
                      {nestedDrawingPoints.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 mt-0.5">
                    <button
                      onClick={handleUndoNestedPoint}
                      disabled={nestedDrawingPoints.length === 0}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <Undo2 className="w-3 h-3" />
                      Undo
                    </button>
                    <button
                      onClick={handleRedoNestedPoint}
                      disabled={nestedRedoPoints.length === 0}
                      className="py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
                    >
                      <Redo2 className="w-3 h-3" />
                      Redo
                    </button>
                    <button
                      onClick={handleCompleteNestedDrawing}
                      disabled={nestedDrawingPoints.length < 3}
                      className="py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 "
                    >
                      <Check className="w-3 h-3" />
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Collapsible Layers Panel floating at bottom-right */}
          {((activeTool !== "polygon" || drawingPoints.length === 0) && activeTool !== "nestedPolygon" && isLayersPanelOpen && markups.length > 0) && (
            <div className="absolute bottom-6 right-6 z-40 w-80 h-[48vh] min-h-[300px] max-h-[430px] bg-white/95 backdrop-blur-md border border-slate-100/80 rounded-2xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-3 flex flex-col gap-2.5 overflow-hidden panel-slide-right">
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Layers & Hierarchy
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full uppercase">
                    {markups.length} zones
                  </span>
                  <button
                    onClick={() => setIsLayersPanelOpen(false)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                    title="Collapse Layers Panel"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <div className="h-px bg-slate-100 shrink-0" />

              <div className="min-h-0 flex-1 overflow-y-auto space-y-1 rounded-xl border border-slate-100/60 bg-slate-50/30 p-2 pr-1">
                {renderGlobalLayersTree()}
              </div>
            </div>
          )}

          {/* Collapsed Layers Panel Floating Toggle Button */}
          {!isLayersPanelOpen && (activeTool !== "polygon" || drawingPoints.length === 0) && activeTool !== "nestedPolygon" && markups.length > 0 && (
            <button
              onClick={() => setIsLayersPanelOpen(true)}
              className="absolute bottom-6 right-6 z-40 w-10 h-10 bg-white hover:bg-slate-50 text-blue-600 border border-slate-100/80 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group/layerbtn"
              title="Open Layers Panel"
            >
              <Layers className="w-4 h-4" />
              {markups.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {markups.length}
                </span>
              )}
            </button>
          )}

          {/* Separate properties Inspector Panel floating at top-right */}
          {selectedMarkupId && activeTool !== "polygon" && activeTool !== "nestedPolygon" && !isInspectorPanelOpen && (
            <button
              onClick={() => setIsInspectorPanelOpen(true)}
              className="absolute top-6 right-6 z-40 w-10 h-10 bg-white hover:bg-slate-50 text-blue-600 border border-slate-100/80 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Open Setup Panel"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {selectedMarkupId && activeTool !== "polygon" && activeTool !== "nestedPolygon" && isInspectorPanelOpen && (
            <div className="absolute top-6 right-6 z-40 w-80 h-[34vh] min-h-[220px] max-h-[285px] bg-white/95 backdrop-blur-md border border-slate-100/80 rounded-2xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-3 flex flex-col gap-2.5 overflow-hidden transition-all panel-slide-right">
              {(() => {
                const markup = markups.find((m) => m.id === selectedMarkupId);
                if (!markup) return null;

                return (
                  <div className="min-h-0 flex-1 overflow-y-auto pr-1 space-y-3">
                    {/* Header with Title and Close / Delete buttons */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: selectedNestedLayer?.color || markup.color }}
                          />
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                            {selectedNestedLayer ? "Sub-Zone" : `${markup.type} Boundary`}
                          </span>
                        </div>

                        <input
                          type="text"
                          value={selectedNestedLayer ? selectedNestedLayer.label : markup.label}
                          onChange={(e) => {
                            const nextLabel = e.target.value;
                            if (selectedNestedLayer) {
                              setMarkups(
                                markups.map((m) =>
                                  m.id === selectedMarkupId
                                    ? {
                                        ...m,
                                        childLayers: updateLayerTree(m.childLayers || [], selectedNestedLayer.id, (layer) => ({
                                          ...layer,
                                          label: nextLabel
                                        }))
                                      }
                                    : m
                                )
                              );
                            } else {
                              setMarkups(
                                markups.map((m) =>
                                  m.id === selectedMarkupId ? { ...m, label: nextLabel } : m
                                )
                              );
                            }
                          }}
                          className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none mt-0.5 py-0.5 w-44"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            if (selectedNestedLayer) {
                              deleteChildDrawingLayer(selectedNestedLayer.id);
                            } else {
                              handleDeleteMarkup(markup.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                          title="Delete Selected Item"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setIsInspectorPanelOpen(false)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer"
                          title="Collapse Setup Panel"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 my-0.5" />

                    {/* Color Customizer */}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        Customize Color
                      </p>
                      <div className="flex items-center gap-2">
                        {[
                          { name: "Yellow", hex: "#eab308" },
                          { name: "Blue", hex: "#3b82f6" },
                          { name: "Green", hex: "#10b981" },
                          { name: "Red", hex: "#ef4444" },
                          { name: "Purple", hex: "#8b5cf6" },
                          { name: "Teal", hex: "#14b8a6" }
                        ].map((c) => (
                          <button
                            key={c.hex}
                            onClick={() => {
                              if (selectedNestedLayer) {
                                setMarkups(
                                  markups.map((m) =>
                                    m.id === selectedMarkupId
                                      ? {
                                          ...m,
                                          childLayers: updateLayerTree(m.childLayers || [], selectedNestedLayer.id, (layer) => ({
                                            ...layer,
                                            color: c.hex
                                          }))
                                        }
                                      : m
                                  )
                                );
                              } else {
                                setMarkups(
                                  markups.map((m) =>
                                    m.id === selectedMarkupId ? { ...m, color: c.hex } : m
                                  )
                                );
                              }
                              triggerToast(`Changed color to ${c.name}`);
                            }}
                            className={`w-5 h-5 rounded-full border transition-all hover:scale-110 cursor-pointer ${
                              (selectedNestedLayer?.color || markup.color) === c.hex
                                ? "border-slate-800 ring-2 ring-slate-800/10 scale-105"
                                : "border-slate-200 hover:border-slate-400"
                            }`}
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}

                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-slate-100/80 hover:border-slate-400 cursor-pointer flex items-center justify-center bg-slate-50">
                          <input
                            type="color"
                            value={selectedNestedLayer?.color || markup.color}
                            onChange={(e) => {
                              const nextColor = e.target.value;
                              if (selectedNestedLayer) {
                                setMarkups(
                                  markups.map((m) =>
                                    m.id === selectedMarkupId
                                      ? {
                                          ...m,
                                          childLayers: updateLayerTree(m.childLayers || [], selectedNestedLayer.id, (layer) => ({
                                            ...layer,
                                            color: nextColor
                                          }))
                                        }
                                      : m
                                  )
                                );
                              } else {
                                setMarkups(
                                  markups.map((m) =>
                                    m.id === selectedMarkupId ? { ...m, color: nextColor } : m
                                  )
                                );
                              }
                            }}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          />
                          <span className="text-[10px] font-bold text-slate-500 pointer-events-none">+</span>
                        </div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100 my-0.5" />

                    {/* Sub-Zone Position bounds */}
                    {selectedNestedLayer && (
                      <div className="rounded-xl border border-slate-100/60 bg-slate-50/30 p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold text-slate-700">Sub-Zone Position</p>
                          <p className="text-[8px] font-semibold uppercase text-slate-400">% of parent Area</p>
                        </div>
                        {[
                          { key: "x" as const, label: "Left", min: 0, max: 90 },
                          { key: "y" as const, label: "Top", min: 0, max: 90 },
                          { key: "width" as const, label: "Width", min: 10, max: 90 },
                          { key: "height" as const, label: "Height", min: 10, max: 90 }
                        ].map((control) => (
                          <div key={control.key}>
                            <div className="flex justify-between text-[9px] font-semibold text-slate-500 mb-0.5">
                              <span>{control.label}</span>
                              <span>{selectedNestedLayer.bounds[control.key]}%</span>
                            </div>
                            <input
                              type="range"
                              min={control.min}
                              max={control.max}
                              step="1"
                              value={selectedNestedLayer.bounds[control.key]}
                              onChange={(e) =>
                                updateChildLayerBounds(
                                  selectedNestedLayer.id,
                                  control.key,
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Integration Setup for Main Drawing Overlay */}
                    {!selectedNestedLayer && markup.type === "area" && (
                      <div className="space-y-1.5">
                        <div>
                          <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                            <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                            Zone Blueprint Setup
                          </h3>
                          <p className="text-[9px] text-slate-400">
                            Link and align layout blueprints directly inside this boundary.
                          </p>
                        </div>

	                        {!markup.drawingOverlay ? (
	                          <div className="bg-slate-50/30 border border-slate-100/60 rounded-xl p-3 text-center">
	                            <FolderOpen className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
	                            <p className="text-[10px] text-slate-700 font-bold">No floor plan added</p>
	                            <p className="mt-1 text-[9px] text-slate-400 font-semibold leading-snug">
	                              Use the plus button in the zone center to upload a floor plan.
	                            </p>
	                          </div>
                        ) : (
                          (() => {
                            const overlay = markup.drawingOverlay!;
                            const overlayId = markup.id;

                            return (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100/60">
                                  <BlueprintImage
                                    src={overlay.url}
                                    alt="Blueprint Layout Thumbnail"
                                    className="w-10 h-10 rounded bg-white object-cover border"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold text-slate-700 truncate">
                                      {getOverlayName(overlay.url)}
                                    </p>
                                    <p className="text-[8px] text-slate-400 font-semibold uppercase">Linked blueprint</p>
                                  </div>
                                  <button
                                    onClick={() => removeDrawingOverlay(null)}
                                    className="text-[9px] text-rose-500 hover:underline font-bold"
                                  >
                                    Remove
                                  </button>
                                </div>

                                <div className="rounded-xl border border-slate-100/60 bg-white p-2.5 space-y-1.5">
                                  <div className="flex items-center gap-1">
                                    <Sliders className="w-3 h-3 text-blue-600" />
                                    <p className="text-[10px] font-bold text-slate-700">Align Blueprint Layout</p>
                                  </div>

                                  {[
                                    { key: "scale" as const, label: "Zoom Scale", min: 0.1, max: 2.0, step: 0.05 },
                                    { key: "rotate" as const, label: "Rotation (deg)", min: -180, max: 180, step: 1 },
                                    { key: "opacity" as const, label: "Transparency", min: 0.0, max: 1.0, step: 0.05 },
                                    { key: "offsetX" as const, label: "Offset X (px)", min: -300, max: 300, step: 2 },
                                    { key: "offsetY" as const, label: "Offset Y (px)", min: -300, max: 300, step: 2 }
                                  ].map((slider) => (
                                    <div key={slider.key}>
                                      <div className="flex justify-between text-[9px] font-semibold text-slate-500 mb-0.5">
                                        <span>{slider.label}</span>
                                        <span className="font-mono text-slate-700 font-bold">
                                          {slider.key === "scale" ? `${Math.round(overlay.scale * 100)}%` :
                                           slider.key === "opacity" ? `${Math.round(overlay.opacity * 100)}%` :
                                           slider.key === "rotate" ? `${overlay.rotate}°` :
                                           `${overlay[slider.key]}px`}
                                        </span>
                                      </div>
                                      <input
                                        type="range"
                                        min={slider.min}
                                        max={slider.max}
                                        step={slider.step}
                                        value={overlay[slider.key]}
                                        onChange={(e) => updateOverlayProp(slider.key, parseFloat(e.target.value), overlayId)}
                                        className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                      />
                                    </div>
                                  ))}

                                  <button
                                    onClick={() => {
                                      updateOverlayProp("scale", 0.8, overlayId);
                                      updateOverlayProp("rotate", 0, overlayId);
                                      updateOverlayProp("opacity", 0.75, overlayId);
                                      updateOverlayProp("offsetX", 0, overlayId);
                                      updateOverlayProp("offsetY", 0, overlayId);
                                      triggerToast("Reset alignment parameters");
                                    }}
                                    className="w-full h-7.5 rounded-lg border border-slate-100/80 text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors cursor-pointer"
                                  >
                                    Reset Alignment
                                  </button>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedDrawingAreaId(markup.id);
                                    setActiveEyeDrawing(null);
                                    setActiveTab("drawing");
                                  }}
                                  className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                                >
                                  Save & Open Drawing Setup
                                </button>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Help guide box removed per user request */}
        </div>
      )}

      {/* -------------------- TAB 2: DRAWING SETUP WORKSPACE -------------------- */}
      {(activeTab === "drawing" || activeTab === "3d" || activeTab === "drone") && (
        <div className="w-full h-full bg-slate-50 flex items-stretch relative overflow-hidden">
          {/* Floating Drag & Drop Popover Guide */}
          {isDrawingLeftSetupOpen && hasLoadedAny && showDragGuide && (
            <div 
              className="absolute left-[328px] top-4 z-[70] bg-blue-600 text-white border border-blue-500 rounded-xl p-3.5 shadow-2xl w-64 micro-fade-in flex gap-3 items-start select-none"
              style={{
                filter: "drop-shadow(0 20px 25px rgba(29, 78, 216, 0.2))"
              }}
            >
              {/* Pointing triangle */}
              <div className="absolute top-6 -left-1.5 w-3 h-3 bg-blue-600 border-l border-b border-blue-500 rotate-45" />

              <Sparkles className="w-4.5 h-4.5 text-sky-200 shrink-0 mt-0.5 animate-pulse" />
              
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-blue-100 uppercase tracking-wider">
                    Drag & Drop Guide
                  </span>
                  <button 
                    onClick={() => setShowDragGuide(false)}
                    className="text-blue-200 hover:text-white p-0.5 rounded hover:bg-blue-700/50 transition-colors cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-[9.5px] text-white leading-relaxed font-semibold">
                  To assign sheets to floor levels:
                  <br />
                  1. **Drag** a drawing card from the Library.
                  <br />
                  2. **Hover** over the <span className="font-bold text-sky-200">"Configure Zones"</span> tab to switch panels while dragging.
                  <br />
                  3. **Drop** onto any expanded floor service slot.
                </p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => setShowDragGuide(false)}
                    className="px-2 py-0.5 bg-white hover:bg-blue-50 text-blue-600 rounded text-[8.5px] font-extrabold transition-all  cursor-pointer"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          )}

          <input
            ref={drawingLibraryInputRef}
            type="file"
            accept={activeTab === "3d" ? ".ifc,.rvt,.fbx,.obj" : "image/*,.pdf"}
            multiple
            className="hidden"
            onChange={(e) => {
              handleDrawingLibraryUpload(e.target.files);
              e.currentTarget.value = "";
            }}
          />

          {/* A. Left Sidebar: Drawing Setup & Uploads */}
          {isDrawingLeftSetupOpen && (
            <div className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0 z-30 shadow-[4px_0_24px_rgba(15,23,42,0.02)] transition-all">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeTab === "3d" ? "3D Model Setup" : (activeTab === "drone" ? "Drone Setup" : "Drawing Setup")}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {activeTab === "3d" ? "Configure levels and align 3D BIM models." : (activeTab === "drone" ? "Upload drone captures and overlay them on zones." : "Configure zones, levels and layout blueprints.")}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawingLeftSetupOpen(false)}
                  className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-655 transition-colors"
                  title="Collapse Panel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {!hasLoadedAny ? (
                /* Simple Empty Initial State */
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white space-y-4">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600  animate-pulse">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {activeTab === "drone" ? "Setup Drone Photos" : (activeTab === "3d" ? "Setup 3D Models" : "Setup Project Drawings")}
                    </h4>
                    <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-1 leading-normal">
                      {activeTab === "drone" ? "Upload site drone photos to display on top of zone drawings." : (activeTab === "3d" ? "Upload and align 3D BIM models to project floor levels." : "Start with a base drawing, then create zones directly on the sheet.")}
                    </p>
                  </div>
                  <div className="w-full px-4">
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 text-left">
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        <span className="text-[10px] font-bold text-slate-700">Choose a source from the canvas card.</span>
                      </div>
                      <p className="mt-1 text-[9px] font-semibold leading-4 text-slate-400">
                        Upload and HUB actions are available in the main setup panel.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Main Configuration State */
                <>
                  {/* Sub Tabs Navigation */}
                  <div className="flex border-b border-slate-100 bg-slate-50/30 px-2 shrink-0">
                    <button
                      onClick={() => setDrawingSetupSubTab("library")}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (drawingSetupSubTab !== "library") {
                          setDrawingSetupSubTab("library");
                        }
                      }}
                      className={`flex-1 py-2.5 text-center text-xs font-bold transition-all tab-glow ${
                        drawingSetupSubTab === "library"
                          ? "text-blue-600 tab-glow-active"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {activeTab === "drone" ? "Drone Photos" : (activeTab === "3d" ? "3D Model Library" : "Drawing Library")}
                    </button>
                    <button
                      onClick={() => setDrawingSetupSubTab("configure")}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (drawingSetupSubTab !== "configure") {
                          setDrawingSetupSubTab("configure");
                        }
                      }}
                      className={`flex-1 py-2.5 text-center text-xs font-bold transition-all tab-glow ${
                        drawingSetupSubTab === "configure"
                          ? "text-blue-600 tab-glow-active"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {activeTab === "drone" ? "Link Photos" : (activeTab === "3d" ? "BIM Align" : "Configure Zones")}
                    </button>
                  </div>

                  {/* Scrollable Setup List */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {drawingSetupSubTab === "library" ? (
                      /* TAB 1: Drawing Library - Simple list, no dropdown, has rename inline/edit name & delete */
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="min-w-0 truncate text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                            {activeTab === "drone" ? "Uploaded Drone Photos" : (activeTab === "3d" ? "Uploaded 3D Models" : "Uploaded Drawings")} ({currentFilesList.length})
                          </h4>
                          <div className="flex shrink-0 items-center gap-1.5">
                            {activeTab === "drawing" && (
                              <button
                                onClick={() => setIsUploadMoreModalOpen(true)}
                                className="h-7 rounded-lg bg-blue-600 px-2.5 text-[9px] font-extrabold text-white hover:bg-blue-700 transition-all cursor-pointer flex items-center gap-1"
                                title="Upload more drawings"
                              >
                                <Upload className="w-3 h-3" />
                                Upload More
                              </button>
                            )}
                            {/* List / Grid View Toggles */}
                            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-100/80">
                              <button
                                onClick={() => setDrawingLibraryViewMode("list")}
                                className={`p-1 rounded-md transition-all cursor-pointer ${
                                  drawingLibraryViewMode === "list"
                                    ? "bg-white text-blue-600 "
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                                title="List View"
                              >
                                <List className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => setDrawingLibraryViewMode("grid")}
                                className={`p-1 rounded-md transition-all cursor-pointer ${
                                  drawingLibraryViewMode === "grid"
                                    ? "bg-white text-blue-600 "
                                    : "text-slate-400 hover:text-slate-600"
                                }`}
                                title="Grid View"
                              >
                                <LayoutGrid className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {activeAreaNeedsQuickSetup && (
                          <div className="rounded-2xl border border-blue-100 bg-blue-50/45 p-3 text-left shadow-sm">
                            <div className="flex items-start gap-2">
                              <div className="mt-0.5 h-7 w-7 shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                                <UploadCloud className="h-3.5 w-3.5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                                  Quick setup ready
                                </p>
                                <p className="mt-1 text-[9.5px] font-semibold leading-4 text-slate-600">
                                  Upload floor drawings, floor plans, or service-wise plans like Architecture, Structure, MEP, Electrical and Plumbing. Then drag a drawing onto any zone to create floors and assign services instantly.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Search Input Bar */}
                        <div className="relative">
                          <input
                            type="text"
                            value={drawingLibrarySearchQuery}
                            onChange={(e) => setDrawingLibrarySearchQuery(e.target.value)}
                            placeholder={activeTab === "drone" ? "Search drone photo name..." : (activeTab === "3d" ? "Search 3D model name..." : "Search drawing name...")}
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl pl-8 pr-7 py-1.5 text-[10px] font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                          />
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                          {drawingLibrarySearchQuery && (
                            <button
                              onClick={() => setDrawingLibrarySearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 cursor-pointer"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                        
                        {(() => {
                          const filtered = currentFilesList.filter((d) =>
                            d.name.toLowerCase().includes(drawingLibrarySearchQuery.toLowerCase())
                          );

                          if (filtered.length === 0) {
                            return (
                              <div className="p-6 border border-dashed border-slate-200 rounded-xl bg-white text-center text-slate-400 text-[10px]">
                                {drawingLibrarySearchQuery ? 
                                  (activeTab === "3d" ? "No matching 3D models found." : "No matching drawings found.") : 
                                  (activeTab === "3d" ? "No 3D models uploaded yet. Use the upload option to add one." : "No drawings uploaded yet. Use Upload in the library header.")
                                }
                              </div>
                            );
                          }

                          // GRID VIEW RENDER
                          if (drawingLibraryViewMode === "grid") {
                            return (
                              <div className="grid grid-cols-2 gap-3">
                                {filtered.map((drawing, index) => {
                                  const isEditing = editingDrawingId === drawing.id;
                                  const linkedBaseArea = activeTab === "drawing"
                                    ? markups.find((markup) => markup.type === "area" && markup.drawingOverlay?.url === drawing.url)
                                    : null;
                                  const isBasePlan = Boolean(linkedBaseArea);
                                  return (
                                    <div
                                      key={drawing.id}
                                      draggable={true}
                                      onDragStart={(e) => {
                                        setDraggedDrawingId(drawing.id);
                                        e.dataTransfer.setData("drawingId", drawing.id);
                                      }}
                                      onDragEnd={() => {
                                        setDraggedDrawingId(null);
                                      }}
                                      className={`border rounded-xl overflow-hidden flex flex-col transition-all hover-lift micro-fade-in aspect-square relative group cursor-grab active:cursor-grabbing ${
                                        isBasePlan
                                          ? "bg-blue-50/35 border-blue-200 shadow-[0_10px_28px_rgba(37,99,235,0.08)]"
                                          : "bg-white border-slate-100/70 hover:border-slate-350"
                                      }`}
                                    >
                                      {/* Visual Preview / Thumbnail Block */}
                                      <div className="w-full flex-1 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                                        {activeTab === "3d" ? (
                                           <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                                           </svg>
                                         ) : activeTab === "drone" ? (
                                           drawing.url ? (
                                             <img
                                               src={drawing.url}
                                               alt={drawing.name}
                                               className="w-full h-full object-cover"
                                               onError={(e) => {
                                                 e.currentTarget.src = "https://images.unsplash.com/photo-1579829363373-c9694d41a970?auto=format&fit=crop&w=120&q=80";
                                               }}
                                             />
                                           ) : (
                                             <Camera className="w-4 h-4 text-blue-500" />
                                           )
                                         ) : drawing.url ? (
                                           <img
                                             src={drawing.url}
                                             alt={drawing.name}
                                             className="w-full h-full object-cover"
                                             onError={(e) => {
                                               e.currentTarget.src = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=120&q=80";
                                             }}
                                           />
                                         ) : (
                                           <FileText className="w-4 h-4 text-blue-500" />
                                         )}
                                        
                                        {/* Corner Index Badge */}
                                        <div className="absolute top-2 left-2 bg-slate-900/60 backdrop-blur-sm text-white text-[7.5px] px-1.5 py-0.5 rounded font-bold">
                                          #{index + 1}
                                        </div>
                                        {isBasePlan && (
                                          <div className="absolute top-2 right-2 rounded-md bg-blue-600 px-1.5 py-0.5 text-[7px] font-extrabold uppercase tracking-wide text-white shadow-sm">
                                            Base
                                          </div>
                                        )}

                                        {/* Hover overlay actions */}
                                        <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-205 flex items-center justify-center gap-2">
                                          {isEditing ? (
                                            <button
                                              onClick={() => setEditingDrawingId(null)}
                                              className="w-7 h-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                                              title="Done"
                                            >
                                              <Check className="w-4 h-4" />
                                            </button>
                                          ) : (
                                            <>
                                              <button
                                                onClick={() => setPreviewDrawingFile(drawing)}
                                                className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow"
                                                title="Preview Sheet"
                                              >
                                                <Eye className="w-4 h-4" />
                                              </button>
                                              <button
                                                onClick={() => setEditingDrawingId(drawing.id)}
                                                className="w-7 h-7 bg-white hover:bg-slate-100 text-slate-700 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow"
                                                title="Rename"
                                              >
                                                <Edit2 className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                onClick={() => deleteUploadedDrawing(drawing.id)}
                                                className="w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer shadow"
                                                title="Delete"
                                              >
                                                <Trash className="w-3.5 h-3.5" />
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>

                                      {/* Lower metadata block */}
                                      <div className={`p-2 border-t shrink-0 ${isBasePlan ? "border-blue-100 bg-white/85" : "border-slate-100 bg-white"}`}>
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={drawing.name}
                                            onChange={(e) => {
                                              const newName = e.target.value;
                                              setCurrentFilesList(prev =>
                                                prev.map(d => d.id === drawing.id ? { ...d, name: newName } : d)
                                              );
                                            }}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") setEditingDrawingId(null);
                                            }}
                                            className="w-full h-6 px-1 border border-blue-500 rounded bg-white text-[9px] font-bold text-slate-805 focus:outline-none"
                                            autoFocus
                                          />
                                        ) : (
                                          <span className="text-[9.5px] font-bold text-slate-700 truncate block" title={drawing.name}>
                                            {drawing.name}
                                          </span>
                                        )}
                                        
                                        {/* Discipline Service Classification */}
                                        <div className="flex items-center justify-between mt-1">
                                          <span className={`text-[7.5px] font-extrabold px-1 py-0.5 rounded ${
                                            isBasePlan ? "bg-blue-600 text-white" : "text-blue-600 bg-blue-55"
                                          }`}>
                                            {isBasePlan ? "Base plan" : drawing.service}
                                          </span>
                                          {isBasePlan && linkedBaseArea && (
                                            <span className="min-w-0 truncate text-[7.5px] font-bold text-slate-500" title={linkedBaseArea.label}>
                                              {linkedBaseArea.label}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          }

                          // LIST VIEW RENDER
                          return (
                            <div className="space-y-1">
                              {filtered.map((drawing, index) => {
                                const isEditing = editingDrawingId === drawing.id;
                                const linkedBaseArea = activeTab === "drawing"
                                  ? markups.find((markup) => markup.type === "area" && markup.drawingOverlay?.url === drawing.url)
                                  : null;
                                const isBasePlan = Boolean(linkedBaseArea);
                                return (
                                  <div
                                    key={drawing.id}
                                    draggable={true}
                                    onDragStart={(e) => {
                                      setDraggedDrawingId(drawing.id);
                                      e.dataTransfer.setData("drawingId", drawing.id);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedDrawingId(null);
                                    }}
                                    className={`border rounded-xl p-2.5 flex items-center justify-between gap-1.5 transition-all hover-lift micro-fade-in cursor-grab active:cursor-grabbing ${
                                      isBasePlan
                                        ? "bg-blue-50/45 border-blue-200 shadow-[0_8px_22px_rgba(37,99,235,0.08)]"
                                        : "bg-white border-slate-100/70 hover:border-slate-350"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      {/* Small DP Preview Thumbnail */}
                                      <div className={`relative w-9 h-9 rounded-lg border overflow-hidden flex items-center justify-center shrink-0 ${
                                        isBasePlan ? "border-blue-200 bg-white ring-2 ring-blue-100/70" : "border-slate-100/80 bg-slate-50"
                                      }`}>
                                        {activeTab === "3d" ? (
                                          <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        ) : activeTab === "drone" ? (
                                          drawing.url ? (
                                            <img
                                              src={drawing.url}
                                              alt={drawing.name}
                                              className="w-full h-full object-cover"
                                              onError={(e) => {
                                                e.currentTarget.src = "https://images.unsplash.com/photo-1579829363373-c9694d41a970?auto=format&fit=crop&w=120&q=80";
                                              }}
                                            />
                                          ) : (
                                            <Camera className="w-4 h-4 text-blue-500" />
                                          )
                                        ) : drawing.url ? (
                                          <img
                                            src={drawing.url}
                                            alt={drawing.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                              e.currentTarget.src = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=120&q=80";
                                            }}
                                          />
                                        ) : (
                                          <FileText className="w-4 h-4 text-blue-500" />
                                        )}
                                        <div className={`absolute bottom-0 right-0 text-white text-[6.5px] px-0.5 rounded-tl font-bold ${
                                          isBasePlan ? "bg-blue-600" : "bg-slate-900/70"
                                        }`}>
                                          {isBasePlan ? "B" : index + 1}
                                        </div>
                                      </div>
                                      
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          value={drawing.name}
                                          onChange={(e) => {
                                            const newName = e.target.value;
                                            setCurrentFilesList(prev =>
                                              prev.map(d => d.id === drawing.id ? { ...d, name: newName } : d)
                                            );
                                          }}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter") setEditingDrawingId(null);
                                          }}
                                          className="flex-1 h-7 px-1.5 border border-blue-500 rounded bg-white text-[10px] font-bold text-slate-805 focus:outline-none"
                                          autoFocus
                                        />
                                      ) : (
                                        <div className="min-w-0 flex-1">
                                          <div className="flex min-w-0 items-center gap-1.5">
                                            <span className="min-w-0 truncate text-[10px] font-bold text-slate-750" title={drawing.name}>
                                              {drawing.name}
                                            </span>
                                            {isBasePlan && (
                                              <span className="shrink-0 rounded-md bg-blue-600 px-1.5 py-0.5 text-[7px] font-extrabold uppercase text-white">
                                                Base
                                              </span>
                                            )}
                                          </div>
                                          {isBasePlan && linkedBaseArea && (
                                            <p className="mt-0.5 truncate text-[8px] font-bold text-blue-600">
                                              Site plan for {linkedBaseArea.label}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5 shrink-0">
                                      {isEditing ? (
                                        <button
                                          onClick={() => setEditingDrawingId(null)}
                                          className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition-colors"
                                          title="Done"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => setPreviewDrawingFile(drawing)}
                                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-emerald-600 rounded transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                            title="Preview Sheet"
                                          >
                                            <Eye className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => setEditingDrawingId(drawing.id)}
                                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-blue-655 rounded transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                            title="Rename"
                                          >
                                            <Edit2 className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={() => deleteUploadedDrawing(drawing.id)}
                                            className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-655 rounded transition-all hover:scale-110 active:scale-95 cursor-pointer"
                                            title="Delete"
                                          >
                                            <Trash className="w-3 h-3" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      /* TAB 2: Configure Zones - The zone and floor level linker cards */
                      <div>
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <h4 className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                            Configure Zones
                          </h4>
                          <button
                            onClick={() => {
                              setIsDrawingMarkupToolbarVisible(true);
                              handleCreateZoneFromDrawingSetup();
                            }}
                            disabled={!currentDrawingUrl}
                            className="h-7 rounded-lg bg-blue-600 px-2.5 text-[9px] font-extrabold text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1"
                            title={currentDrawingUrl ? "Draw a new zone on this drawing" : "Upload or choose a base drawing before drawing zones"}
                          >
                            <PolygonIcon className="w-3 h-3" />
                            Draw Zone
                          </button>
                        </div>
                        {activeArea ? (
                          <div className="space-y-3">
                            <div className="bg-slate-50 border border-slate-100/70 rounded-xl p-2.5 space-y-1.5">
                              {/* Big Area Title */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 min-w-0">
                                  <PolygonIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                  <span className="text-[11px] font-extrabold text-slate-800 truncate">
                                    {activeArea.label}
                                  </span>
                                </div>
                                <span className="text-[7.5px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">
                                  Active Area
                                </span>
                              </div>

                              {/* Inner child zones (Chhota areas) */}
                              {(!activeArea.childLayers || activeArea.childLayers.length === 0) ? (
                                <div className="rounded-lg border border-dashed border-blue-100 bg-blue-50/30 p-2 text-[8.5px] font-semibold leading-4 text-blue-600">
                                  No zones yet. Use Create Zone above, then click on the drawing to mark your first area.
                                </div>
                              ) : (
                                activeArea.childLayers.map((zone) => {
                                  const zoneConfig = zoneDrawingConfigs[zone.id];
                                  const floorsList = zoneConfig?.floorsList || [];
                                  const servicesForZone = getZoneServices(zone.id);

                                  return (
                                    <div key={zone.id} className="bg-white border border-slate-155 rounded-lg p-2.5 space-y-1 ">
                                      {/* Zone Title */}
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                                        <span className="text-[10px] font-extrabold text-slate-700 truncate flex-1">
                                          {zone.label}
                                        </span>
                                      </div>

                                      {activeTab === "drone" ? (
                                        /* Drone photo assignment selector */
                                        <div className="space-y-1 pt-1">
                                          <label className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Assigned Drone Photo
                                          </label>
                                          <div className="flex items-center gap-1.5">
                                            <select
                                              value={zoneDroneAssignments[zone.id] || ""}
                                              onChange={(e) => {
                                                const fileId = e.target.value;
                                                setZoneDroneAssignments((prev) => ({
                                                  ...prev,
                                                  [zone.id]: fileId
                                                }));
                                                if (fileId) {
                                                  setActiveDroneEyes((prev) => ({
                                                    ...prev,
                                                    [zone.id]: true
                                                  }));
                                                  const file = uploadedDroneImages.find(f => f.id === fileId);
                                                  triggerToast(`Linked ${file?.name} to ${zone.label}`);
                                                } else {
                                                  triggerToast(`Removed link from ${zone.label}`);
                                                }
                                              }}
                                              className="flex-1 min-w-0 text-ellipsis h-7 bg-slate-50 border border-slate-100/80 rounded-lg text-[9.5px] font-semibold text-slate-755 px-2 focus:outline-none focus:border-blue-500 cursor-pointer"
                                            >
                                              <option value="">-- No Photo Linked --</option>
                                              {uploadedDroneImages.map((file) => (
                                                <option key={file.id} value={file.id}>
                                                  {file.name}
                                                </option>
                                              ))}
                                            </select>

                                            {zoneDroneAssignments[zone.id] && (
                                              <button
                                                onClick={() => {
                                                  const isVisible = activeDroneEyes[zone.id] !== false;
                                                  setActiveDroneEyes((prev) => ({
                                                    ...prev,
                                                    [zone.id]: !isVisible
                                                  }));
                                                  triggerToast(`${isVisible ? "Hidden" : "Shown"} drone layer for ${zone.label}`);
                                                }}
                                                className={`p-1.5 rounded-lg border transition-all cursor-pointer shrink-0 ${
                                                  activeDroneEyes[zone.id] !== false
                                                    ? "bg-emerald-50 border-emerald-250 text-emerald-600 animate-pulse"
                                                    : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600"
                                                }`}
                                                title="Toggle Visibility on Map"
                                              >
                                                {activeDroneEyes[zone.id] !== false ? (
                                                  <Eye className="w-3.5 h-3.5" />
                                                ) : (
                                                  <EyeOff className="w-3.5 h-3.5" />
                                                )}
                                              </button>
                                            )}
                                          </div>
                                        </div>
                                      ) : floorsList.length === 0 ? (
                                        /* Empty state: Create Floors Count Input */
                                        <div className="bg-slate-50/30 border border-slate-100/60 rounded-lg p-2 space-y-2">
                                          <div className="flex items-center justify-between gap-1.5">
                                            <div className="flex items-center gap-1">
                                              <span className="text-[8.5px] text-slate-500 font-semibold">Levels:</span>
                                              <input
                                                type="number"
                                                min="1"
                                                max="30"
                                                value={floorInputs[zone.id] || 2}
                                                onChange={(e) => {
                                                  const val = parseInt(e.target.value) || 1;
                                                  setFloorInputs((prev) => ({ ...prev, [zone.id]: val }));
                                                }}
                                                className="w-10 h-6 border border-slate-100/80 rounded text-center text-[9px] font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                              />
                                            </div>
                                            <button
                                              onClick={() => handleCreateFloors(zone.id, floorInputs[zone.id] || 2)}
                                              className="h-6 px-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold transition-all  cursor-pointer"
                                            >
                                              Create
                                            </button>
                                          </div>
                                          {assignableDrawingFiles.length > 0 && (
                                            <button
                                              onClick={() => openQuickSetupForZone(zone.id, assignableDrawingFiles.map((file) => file.id))}
                                              className="w-full h-7 rounded-lg border border-blue-100 bg-blue-50 text-blue-600 text-[9px] font-extrabold hover:bg-blue-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                                            >
                                              <Sparkles className="w-3 h-3" />
                                              Quick assign from library
                                            </button>
                                          )}
                                        </div>
                                      ) : (
                                        /* List of floor levels configured */
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold uppercase">
                                            <span>Levels list (drag to reorder)</span>
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => handleAddCustomService(zone.id)}
                                                className="text-[8px] text-blue-600 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                                                title="Add another drawing service slot"
                                              >
                                                <Plus className="w-2.5 h-2.5" />
                                                Service
                                              </button>
                                              <span className="text-slate-200">|</span>
                                              <button
                                                onClick={() => {
                                                  setZoneDrawingConfigs((prev) => {
                                                    const next = { ...prev };
                                                    delete next[zone.id];
                                                    return next;
                                                  });
                                                  triggerToast("Reset floors count");
                                                }}
                                                className="text-[8px] text-rose-500 font-bold hover:underline cursor-pointer"
                                              >
                                                Reset
                                              </button>
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-1">
                                            {floorsList.map((floor, floorIndex) => {
                                              const isExpanded = expandedFloors[`${zone.id}-${floor.id}`];

                                              return (
                                                <div
                                                  key={floor.id}
                                                  draggable
                                                  onDragStart={(e) => {
                                                    e.dataTransfer.setData("text/plain", JSON.stringify({ zoneId: zone.id, index: floorIndex }));
                                                  }}
                                                  onDragOver={(e) => e.preventDefault()}
                                                  onDrop={(e) => {
                                                    try {
                                                      const dataStr = e.dataTransfer.getData("text/plain");
                                                      if (!dataStr) return;
                                                      const data = JSON.parse(dataStr);
                                                      if (data.zoneId === zone.id && data.index !== floorIndex) {
                                                        handleReorderFloors(zone.id, data.index, floorIndex);
                                                      }
                                                    } catch (err) {
                                                      console.error(err);
                                                    }
                                                  }}
                                                  className="border border-slate-100/60 rounded-lg bg-slate-50/30 hover:bg-slate-55 transition-all hover-lift micro-fade-in p-2 cursor-grab active:cursor-grabbing"
                                                >
                                                  {/* Header Row */}
                                                  <div className="flex items-center justify-between gap-1.5">
                                                    <div className="flex items-center gap-1 min-w-0 flex-1">
                                                      <GripVertical className="w-3 h-3 text-slate-350 shrink-0 cursor-grab active:cursor-grabbing" />
                                                      <input
                                                        type="text"
                                                        value={floor.name}
                                                        onChange={(e) => handleRenameFloor(zone.id, floor.id, e.target.value)}
                                                        className="bg-transparent hover:bg-white border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-1 py-0.5 text-[9.5px] font-bold text-slate-750 focus:outline-none w-28 transition-all"
                                                        placeholder="Rename Floor"
                                                      />
                                                    </div>
                                                    <div className="flex items-center gap-0.5">
                                                      <button
                                                        onClick={() => handleDeleteFloor(zone.id, floor.id)}
                                                        className="p-1 hover:bg-rose-55 rounded text-slate-400 hover:text-rose-500 transition-colors"
                                                        title="Delete Level"
                                                      >
                                                        <Trash className="w-3 h-3" />
                                                      </button>
                                                      <button
                                                        onClick={() => {
                                                          setExpandedFloors((prev) => ({
                                                            ...prev,
                                                            [`${zone.id}-${floor.id}`]: !prev[`${zone.id}-${floor.id}`]
                                                          }));
                                                        }}
                                                        className="p-1 hover:bg-slate-150 rounded text-slate-400 hover:text-slate-655 transition-colors"
                                                      >
                                                        <ChevronRight className={`w-3.5 h-3.5 rotate-chevron ${isExpanded ? "rotate-90" : "rotate-0"}`} />
                                                      </button>
                                                    </div>
                                                  </div>

                                                  {/* Linking dropdown lists */}
                                                  {isExpanded && (
                                                    <div className="mt-2 pt-2 border-t border-slate-200/50 space-y-1 bg-white/70 p-2 rounded-md micro-fade-in">
                                                      {servicesForZone.map((service) => {
                                                        const isCustomService = !isDefaultDrawingService(service);
                                                        const isHoveredSlot = dragOverServiceSlot?.floorId === floor.id && dragOverServiceSlot?.service === service;
                                                        return (
                                                          <div
                                                            key={service}
                                                            onDragOver={(e) => {
                                                              e.preventDefault();
                                                            }}
                                                            onDragEnter={() => {
                                                              if (draggedDrawingId) {
                                                                setDragOverServiceSlot({ floorId: floor.id, service });
                                                              }
                                                            }}
                                                            onDragLeave={() => {
                                                              setDragOverServiceSlot(null);
                                                            }}
                                                            onDrop={(e) => {
                                                              e.preventDefault();
                                                              const drawingId = draggedDrawingId || e.dataTransfer.getData("drawingId");
                                                              if (drawingId) {
                                                                handleAssignDrawingToFloor(zone.id, floor.id, service, drawingId);
                                                                triggerToast(`Assigned drawing to ${floor.name} - ${service}!`, "success");
                                                              }
                                                              setDragOverServiceSlot(null);
                                                              setDraggedDrawingId(null);
                                                            }}
                                                            className={`flex items-center justify-between gap-2 p-1 rounded transition-all ${
                                                              isHoveredSlot
                                                                ? "bg-blue-50 border border-dashed border-blue-400 scale-[1.02]"
                                                                : "border border-transparent"
                                                            }`}
                                                          >
                                                            <div className="flex items-center gap-1.5 w-[82px] min-w-0 shrink-0">
                                                              <span
                                                                className={`text-[9.5px] font-bold leading-tight truncate ${
                                                                  isCustomService ? "text-emerald-650" : "text-slate-500"
                                                                }`}
                                                                title={service}
                                                              >
                                                                {getServiceShortLabel(service)}
                                                              </span>
                                                              <button
                                                                onClick={() => handleRemoveService(zone.id, service)}
                                                                className="text-slate-300 hover:text-rose-500 shrink-0 transition-colors cursor-pointer"
                                                                title={`Remove ${service}`}
                                                              >
                                                                <Trash className="w-2.5 h-2.5" />
                                                              </button>
                                                            </div>
                                                            <select
                                                              value={floor.assignments[service] || ""}
                                                              onChange={(e) => handleAssignDrawingToFloor(zone.id, floor.id, service, e.target.value)}
                                                              className="min-w-0 flex-1 h-7 border border-slate-100/80 rounded-md pl-2 pr-8 text-[9px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer truncate"
                                                            >
                                                              <option value="">None</option>
                                                              {currentFilesList.map((d) => (
                                                                <option key={d.id} value={d.id}>
                                                                  {d.name}
                                                                </option>
                                                              ))}
                                                            </select>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  )}
                                                </div>
                                              );
                                            })}

                                            <button
                                              onClick={() => handleAddSingleFloor(zone.id)}
                                              className="w-full py-1.5 border border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/20 hover:bg-blue-50 text-blue-600 rounded-lg text-[9px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer hover-lift"
                                            >
                                              <Plus className="w-3 h-3 animate-pulse" />
                                              Add Level
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-white text-center text-slate-405 text-[10px]">
                            Upload or choose a base drawing to begin configuring zones.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Save bar */}
                  <div className="p-3 border-t border-slate-100 shrink-0 bg-white grid grid-cols-[0.85fr_1.15fr] gap-2">
                    <button
                      onClick={() => {
                        setUploadedDrawingFiles([]);
                        setZoneDrawingConfigs({});
                        setHasLoadedDrawings(false);
                        setActiveEyeDrawing(null);
                        setIsDrawingMarkupToolbarVisible(false);
                        triggerToast("Discarded drawings and configurations.");
                      }}
                      className="h-9 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-bold cursor-pointer transition-colors"
                    >
                      Discard Setup
                    </button>
                    <button
                      onClick={() => {
                        setIsDrawingLeftSetupOpen(false);
                        setActiveEyeDrawing(null);
                        setIsDrawingMarkupToolbarVisible(false);
                        triggerToast("All drawing configurations applied! Hierarchy saved to Layers panel.");
                      }}
                      className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer  shadow-blue-500/10"
                    >
                      Save Drawings
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* B. Center Panel: Zoomable Viewport */}
          <div className="flex-1 min-w-0 bg-slate-100 flex flex-col relative">
            
            {/* Viewport Top Bar */}
            {activeTab !== "drawing" && (
            <div className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur px-4 flex items-center justify-between shrink-0 z-20">
              <div className="flex min-w-0 items-center gap-2 pr-3">
                {!isDrawingLeftSetupOpen && (
                  <button
                    onClick={() => setIsDrawingLeftSetupOpen(true)}
                    className="h-8.5 px-3 rounded-lg border border-slate-100/80 hover:bg-slate-50 text-slate-650 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {activeTab === "3d" ? "3D Setup" : (activeTab === "drone" ? "Drone Setup" : "Drawing Setup")}
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsDrawingMarkupToolbarVisible(true);
                    handleCreateZoneFromDrawingSetup();
                  }}
                  disabled={!currentDrawingUrl}
                  className="h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors  shadow-blue-500/10"
                  title={currentDrawingUrl ? (activeAreaZoneCount > 0 ? "Create another zone on this drawing" : "Create a new zone directly on this drawing") : "Upload or choose a base drawing before creating zones"}
                >
                  <PolygonIcon className="w-3.5 h-3.5" />
                  {activeAreaZoneCount > 0 ? "Create more zone" : "Create Zone"}
                </button>
                {currentDrawingUrl && (
                  <div
                    className="bg-slate-50 border border-slate-100/60 rounded-xl px-2.5 py-1 text-xs flex items-center gap-2"
                    title={currentDrawingLabel}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="font-bold text-slate-800">Base plan</span>
                  </div>
                )}
                {activeArea && (
                  <div
                    className={`hidden sm:flex items-center gap-1.5 rounded-xl border px-2.5 py-1 text-[10px] font-bold ${
                      activeArea.isPlacedOnMap === false
                        ? "border-amber-100 bg-amber-50 text-amber-700"
                        : "border-blue-100 bg-blue-50 text-blue-700"
                    }`}
                    title={activeArea.label}
                  >
                    <span className="truncate max-w-[110px]">{activeArea.label}</span>
                    <span className="text-[7px] uppercase opacity-70">
                      {activeArea.isPlacedOnMap === false ? "Not placed" : "Linked"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2">
                {activeTab === "drawing" && (
                  <button
                    onClick={() => {
                      setIsDrawingStackedView(!isDrawingStackedView);
                      if (!isDrawingStackedView) {
                        triggerToast("Switched to Exploded Drawing Stack (Isometric View)");
                      }
                    }}
                    className={`h-8.5 px-3 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all  ${
                      isDrawingStackedView
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/10 animate-pulse"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {isDrawingStackedView ? "Disable 3D Stack" : "Stacked 3D View"}
                  </button>
                )}
              </div>
            </div>
            )}

            {/* Viewport Canvas or Empty State */}
            <div className="flex-1 min-h-0 relative flex items-center justify-center p-1 overflow-hidden">
              {currentDrawingUrl ? (
                <div
                  ref={drawingViewportRef}
                  className={`w-full h-full relative overflow-hidden flex items-center justify-center rounded-2xl border border-slate-100/80 bg-white ${
                    activeTool === "nestedPolygon" ? "cursor-crosshair" : (isDrawingPanning ? "cursor-grabbing" : "cursor-grab")
                  }`}
                  onWheel={handleDrawingViewerWheel}
                  onMouseDown={handleDrawingViewerMouseDown}
                  onMouseMove={handleDrawingViewerMouseMove}
                  onMouseUp={stopDrawingViewerPan}
                  onMouseLeave={stopDrawingViewerPan}
                  onClick={handleDrawingViewerZoneClick}
                >
                  <div
                    ref={drawingCanvasContentRef}
                    className="relative w-[min(72vw,72vh)] h-[min(72vw,72vh)] shrink-0 transition-transform duration-75 ease-out select-none"
                    style={{
                      transform: `translate(${drawingAdjustments.panX}px, ${drawingAdjustments.panY}px) scale(${drawingAdjustments.zoom}) rotate(${drawingAdjustments.rotate}deg)`,
                      transformOrigin: "center center"
                    }}
                  >
                    {activeTab === "3d" || (activeTab === "drawing" && isDrawingStackedView) ? (
                      /* CSS 3D Perspective layout */
                      <div 
                        className="relative w-[min(72vw,72vh)] h-[min(72vw,72vh)] flex items-center justify-center pointer-events-none select-none"
                        style={{
                          transform: "rotateX(55deg) rotateZ(-45deg)",
                          transformStyle: "preserve-3d",
                        }}
                      >
                        {/* 3D Grid floor */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1.5px,transparent_1.5px),linear-gradient(to_bottom,#cbd5e1_1.5px,transparent_1.5px)] bg-[size:32px_32px] opacity-25 rounded-3xl" />
                        
                        {/* BASE SHEET - Underneath everything (Flat L00 base drawing blueprint) */}
                        <div className="absolute inset-8 bg-white/90 border-2 border-slate-350 rounded-xl shadow-lg flex items-center justify-center p-2.5"
                             style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}>
                          <img src={currentDrawingUrl || "/assets/demo-blueprint.jpg"} className="w-full h-full object-contain opacity-70 rounded-lg" alt="Base Sheet Blueprint" />
                          <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md text-white text-[7.5px] font-extrabold px-1.5 py-0.5 rounded shadow flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                            BASE DRAWING SHEET
                          </div>
                        </div>

                        {/* FLOATING 3D MODEL LAYERS (Looping zones -> floors -> services) */}
                        {(() => {
                          const layersToRender: any[] = [];
                          
                          markups.filter((m) => m.type === "area").forEach((area) => {
                            if (area.childLayers) {
                              area.childLayers.forEach((zone) => {
                                const zoneConfig = zoneDrawingConfigs[zone.id];
                                const floors = zoneConfig?.floorsList || [];
                                floors.forEach((floor, floorIdx) => {
                                  const assignedServices = getAssignedServicesForZone(zone.id, floor);
                                  assignedServices.forEach((service) => {
                                    const drawingId = floor.assignments[service]!;
                                    const file = uploadedDrawingFiles.find((d) => d.id === drawingId) || 
                                                 uploaded3DFiles.find((d) => d.id === drawingId);
                                    if (file) {
                                      layersToRender.push({
                                        zoneId: zone.id,
                                        zoneLabel: zone.label,
                                        zoneColor: zone.color,
                                        floorId: floor.id,
                                        floorName: floor.name,
                                        floorIdx,
                                        service,
                                        file,
                                      });
                                    }
                                  });
                                });
                              });
                            }
                          });

                          if (layersToRender.length === 0) {
                            return (
                              <div className="absolute inset-8 bg-blue-50/10 border border-dashed border-blue-400 rounded-xl flex flex-col items-center justify-center p-6"
                                   style={{ transform: "translateZ(80px)", transformStyle: "preserve-3d" }}>
                                <Cpu className="w-10 h-10 text-blue-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-blue-600 mt-2">NO 3D LAYERS ASSIGNED</span>
                                <span className="text-[8px] text-slate-400 text-center max-w-[180px] mt-1">Assign models or drawings to zones/levels to build the 3D stack.</span>
                              </div>
                            );
                          }

                          return layersToRender.map((layer) => {
                            const serviceOffsets: Record<string, number> = {
                              "Architectural": 0,
                              "Structural": 12,
                              "Mechanical": 24,
                              "Electrical": 36,
                              "Plumbing": 48
                            };
                            const baseHeight = (layer.floorIdx + 1) * 45;
                            const microOffset = serviceOffsets[layer.service] || 0;
                            const heightZ = baseHeight + microOffset;

                            const isHighlighted = activeTab === "drawing"
                              ? activeEyeDrawing?.zoneId === layer.zoneId &&
                                activeEyeDrawing?.floorId === layer.floorId &&
                                activeEyeDrawing?.service === layer.service
                              : active3DLink?.zoneId === layer.zoneId &&
                                active3DLink?.floorId === layer.floorId &&
                                active3DLink?.service === layer.service;

                            const serviceColors: Record<string, string> = {
                              "Architectural": "border-blue-400 bg-blue-50/20 text-blue-600",
                              "Structural": "border-emerald-400 bg-emerald-50/20 text-emerald-600",
                              "Mechanical": "border-orange-400 bg-orange-50/20 text-orange-600",
                              "Electrical": "border-amber-400 bg-amber-50/20 text-amber-600",
                              "Plumbing": "border-indigo-400 bg-indigo-50/20 text-indigo-600"
                            };

                            const highlightColors: Record<string, string> = {
                              "Architectural": "ring-4 ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] border-blue-600 scale-[1.03]",
                              "Structural": "ring-4 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.6)] border-emerald-600 scale-[1.03]",
                              "Mechanical": "ring-4 ring-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)] border-orange-600 scale-[1.03]",
                              "Electrical": "ring-4 ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)] border-amber-600 scale-[1.03]",
                              "Plumbing": "ring-4 ring-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] border-indigo-600 scale-[1.03]"
                            };

                            const styleClass = isHighlighted 
                              ? highlightColors[layer.service] || "ring-4 ring-blue-600 shadow-2xl border-blue-700 scale-[1.03]"
                              : serviceColors[layer.service] || "border-slate-300 bg-slate-50/10 text-slate-500";

                            return (
                              <div
                                key={`${layer.zoneId}-${layer.floorId}-${layer.service}`}
                                className={`absolute inset-12 border-2 rounded-xl transition-all duration-300 pointer-events-auto cursor-pointer flex flex-col justify-between p-3 select-none ${styleClass}`}
                                style={{ 
                                  transform: `translateZ(${heightZ}px)`, 
                                  transformStyle: "preserve-3d",
                                  opacity: (activeTab === "drawing" ? activeEyeDrawing : active3DLink) && !isHighlighted ? 0.45 : 0.95
                                }}
                                                                 onClick={(e) => {
                                   e.stopPropagation();
                                   if (activeTab === "drawing") {
                                     setActiveEyeDrawing({
                                       zoneId: layer.zoneId,
                                       floorId: layer.floorId,
                                       service: layer.service
                                     });
                                     triggerToast(`Selected Sheet: ${layer.floorName} - ${layer.service}`);
                                   } else {
                                     setActive3DLink({
                                       zoneId: layer.zoneId,
                                       floorId: layer.floorId,
                                       service: layer.service
                                     });
                                     triggerToast(`Selected 3D Layer: ${layer.zoneLabel} - ${layer.floorName} - ${layer.service}`);
                                   }
                                 }}
                              >
                                {/* Header */}
                                <div className="flex justify-between items-start" style={{ transform: "translateZ(10px)" }}>
                                  <div>
                                    <span className="text-[7.5px] font-extrabold uppercase tracking-wider bg-white/90 px-1 py-0.2 rounded  border border-slate-100/60">
                                      {layer.floorName}
                                    </span>
                                    <span className="ml-1 text-[7.5px] font-extrabold uppercase tracking-wider bg-white/90 px-1 py-0.2 rounded  border border-slate-100/60">
                                      {layer.service}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer.zoneColor }} />
                                    <span className="text-[7px] font-bold text-slate-800 bg-white/95 px-1 py-0.2 rounded ">
                                      {layer.zoneLabel}
                                    </span>
                                     {activeTab === "drawing" && (
                                       <button
                                         onClick={(e) => {
                                           e.stopPropagation();
                                           setIsDrawingStackedView(false);
                                           setActiveEyeDrawing({
                                             zoneId: layer.zoneId,
                                             floorId: layer.floorId,
                                             service: layer.service
                                           });
                                           triggerToast(`Focused on 2D Sheet: ${layer.floorName} - ${layer.service}`);
                                         }}
                                         className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[7px] font-extrabold  transition-all pointer-events-auto cursor-pointer whitespace-nowrap ml-1"
                                         title="Flatten to 2D sheet editor"
                                       >
                                         Focus 2D
                                       </button>
                                     )}
                                  </div>
                                </div>

                                {/* Drawing Image/Visual or Wireframe Mockup */}
                                 {activeTab === "drawing" ? (
                                   <div className="flex-1 min-h-0 relative overflow-hidden rounded bg-white flex items-center justify-center p-1 border border-slate-100/60 shadow-inner" style={{ transform: "translateZ(4px)" }}>
                                     {layer.file.url ? (
                                       <img
                                         src={layer.file.url}
                                         alt={layer.file.name}
                                         className="max-w-full max-h-full object-contain pointer-events-none"
                                         onError={(e) => {
                                           e.currentTarget.src = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80";
                                         }}
                                       />
                                     ) : (
                                       <div className="text-[8px] font-bold text-slate-400">Empty Sheet</div>
                                     )}
                                   </div>
                                 ) : (
                                   /* Wireframe Mockup */
                                   <div className="flex-1 flex items-center justify-center p-2 opacity-70" style={{ transform: "translateZ(5px)" }}>
                                  {layer.service === "Architectural" && (
                                    <div className="w-full h-full border border-dashed border-blue-500/30 rounded flex flex-wrap justify-between p-2">
                                      <div className="w-2 h-8 border-r border-blue-500/20" />
                                      <div className="w-2 h-8 border-l border-blue-500/20" />
                                      <div className="w-12 h-6 border border-blue-400/20 rounded-full flex items-center justify-center text-[6px]">Room</div>
                                    </div>
                                  )}
                                  {layer.service === "Structural" && (
                                    <div className="w-full h-full relative flex items-center justify-center">
                                      <div className="absolute inset-1 border border-emerald-500/30 rounded flex justify-between p-1">
                                        <div className="w-2 h-2 rounded bg-emerald-500" />
                                        <div className="w-2 h-2 rounded bg-emerald-500" />
                                        <div className="w-2 h-2 rounded bg-emerald-500" />
                                      </div>
                                      <div className="w-full h-[1.5px] bg-emerald-500/40" />
                                    </div>
                                  )}
                                  {layer.service === "Mechanical" && (
                                    <div className="w-full h-full relative">
                                      <div className="absolute top-1/2 left-2 right-2 h-1.5 bg-orange-500/45 rounded-full" />
                                      <div className="absolute left-1/3 top-1 bottom-1 w-1.5 bg-orange-500/45 rounded-full" />
                                    </div>
                                  )}
                                  {layer.service === "Electrical" && (
                                    <div className="w-full h-full relative flex items-center justify-center">
                                      <div className="w-8 h-8 rounded-full border border-dashed border-amber-500/50 flex items-center justify-center">
                                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                                      </div>
                                    </div>
                                  )}
                                  {!["Architectural", "Structural", "Mechanical", "Electrical"].includes(layer.service) && (
                                    <div className="w-full h-full flex items-center justify-center text-[7px] font-bold text-slate-400 italic">
                                      Generic 3D Model
                                    </div>
                                  )}
                                </div>
                                 )}

                                 {/* Footer Metadata */}
                                 <div className="flex justify-between items-center text-[7.5px]" style={{ transform: "translateZ(8px)" }}>
                                  <span className="font-mono text-slate-500 truncate max-w-[100px]" title={layer.file.name}>
                                    {layer.file.name}
                                  </span>
                                  {isHighlighted && (
                                    <span className="bg-blue-600 text-white font-extrabold px-1 rounded animate-pulse ">
                                      ACTIVE LINK
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    ) : (
                      <BlueprintImage
                        src={currentDrawingUrl}
                        alt="Active Blueprint"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
                      />
                    )}

                    {/* Render child zones (small zones) on top of the big area overlay when viewing the Base Layout Plan */}
                    {(activeTab === "drone" || !activeEyeDrawing) && !isDrawingStackedView && activeArea && (activeArea.childLayers || []).map((layer) => {
                      const relativePoints = getRelativePolygonPoints(layer.points, layer.bounds);
                      const polygonPoints = relativePoints.map((point) => `${point.x},${point.y}`).join(" ");
                      const clipPath = `polygon(${relativePoints.map((point) => `${point.x}% ${point.y}%`).join(", ")})`;

                      return (
                        <div
                          key={layer.id}
                          className={`absolute overflow-visible transition-all duration-200 ${
                            activeTab === "drawing" && draggedDrawingId
                              ? "pointer-events-auto cursor-copy"
                              : "pointer-events-none"
                          } ${
                            quickSetupHighlightedZoneId === layer.id
                              ? "z-30 scale-[1.04] drop-shadow-[0_0_18px_rgba(37,99,235,0.75)]"
                              : ""
                          }`}
                          onDragOver={(event) => {
                            if (activeTab !== "drawing" || !draggedDrawingId) return;
                            event.preventDefault();
                            setQuickSetupHighlightedZoneId(layer.id);
                          }}
                          onDragEnter={(event) => {
                            if (activeTab !== "drawing" || !draggedDrawingId) return;
                            event.preventDefault();
                            setQuickSetupHighlightedZoneId(layer.id);
                          }}
                          onDragLeave={() => {
                            if (quickSetupHighlightedZoneId === layer.id) {
                              setQuickSetupHighlightedZoneId(null);
                            }
                          }}
                          onDrop={(event) => {
                            if (activeTab !== "drawing") return;
                            event.preventDefault();
                            const drawingId = draggedDrawingId || event.dataTransfer.getData("drawingId");
                            if (drawingId) {
                              openQuickSetupForZone(layer.id, [drawingId]);
                              triggerToast(`${layer.label} selected. Complete quick setup to assign drawings.`);
                            }
                            setDraggedDrawingId(null);
                            setQuickSetupHighlightedZoneId(null);
                          }}
                          style={{
                            left: `${layer.bounds.x}%`,
                            top: `${layer.bounds.y}%`,
                            width: `${layer.bounds.width}%`,
                            height: `${layer.bounds.height}%`
                          }}
                        >
                          {(() => {
                            const assignedDroneFileId = zoneDroneAssignments[layer.id];
                            const droneFile = assignedDroneFileId ? uploadedDroneImages.find(f => f.id === assignedDroneFileId) : null;
                            const showDroneOverlay = activeTab === "drone" && droneFile && activeDroneEyes[layer.id] !== false;

                            if (showDroneOverlay && droneFile) {
                              return (
                                <img
                                  src={droneFile.url}
                                  alt={droneFile.name}
                                  className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none transition-all duration-300 shadow-inner"
                                  style={{ clipPath }}
                                  onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1579829363373-c9694d41a970?auto=format&fit=crop&w=600&q=80";
                                  }}
                                />
                              );
                            }
                            return (
                              <div
                                className="absolute inset-0 overflow-hidden rounded-md pointer-events-none transition-all duration-200"
                                style={{
                                  backgroundColor: quickSetupHighlightedZoneId === layer.id ? `${layer.color}32` : `${layer.color}18`,
                                  clipPath
                                }}
                              />
                            );
                          })()}
                          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <polygon
                              points={polygonPoints}
                              fill="transparent"
                              stroke={layer.color}
                              strokeWidth="1.5"
                              vectorEffect="non-scaling-stroke"
                              strokeLinejoin="round"
                              strokeDasharray="2,2"
                            />
                          </svg>
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded border border-slate-100/80  pointer-events-auto flex items-center gap-1">
                            {activeTab === "drone" && zoneDroneAssignments[layer.id] && (
                              <Camera className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                            )}
                            <span className="text-[7.5px] font-extrabold text-slate-800 whitespace-nowrap">{layer.label}</span>
                          </div>
                        </div>
                      );
                    })}

                    {activeTool === "nestedPolygon" && activeArea && !isDrawingStackedView && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                        {nestedDrawingPoints.length > 1 && (
                          <polyline
                            points={nestedDrawingPoints.map((point) => `${point.x},${point.y}`).join(" ")}
                            fill="rgba(37,99,235,0.08)"
                            stroke="#2563eb"
                            strokeWidth="1.2"
                            vectorEffect="non-scaling-stroke"
                            strokeLinejoin="round"
                            strokeDasharray="2,2"
                          />
                        )}
                        {nestedDrawingPoints.map((point, index) => (
                          <circle
                            key={`drawing-zone-point-${index}`}
                            cx={point.x}
                            cy={point.y}
                            r={index === 0 ? 1.25 : 1}
                            fill={index === 0 ? "#22c55e" : "#2563eb"}
                            stroke="#ffffff"
                            strokeWidth="0.45"
                            vectorEffect="non-scaling-stroke"
                          />
                        ))}
                      </svg>
                    )}
                  </div>

                  {!isDrawingStackedView && currentDrawingUrl && isDrawingMarkupToolbarVisible && (
                    <div
                      className="absolute left-4 top-1/2 z-45 flex -translate-y-1/2 flex-col gap-1.5 rounded-2xl border border-slate-100/80 bg-white/95 p-1.5 shadow-[0_12px_34px_rgba(15,23,42,0.12)] backdrop-blur-md"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawingMarkupToolbarVisible(false);
                          setDrawingMarkupTool("pointer");
                          setActiveTool("pan");
                          setNestedDrawingPoints([]);
                          setNestedRedoPoints([]);
                          triggerToast("Drawing toolbar hidden");
                        }}
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900 group/markup"
                        title="Hide toolbar"
                      >
                        <EyeOff className="h-4 w-4" />
                        <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[9px] font-bold text-white opacity-0 shadow-lg transition-all duration-150 group-hover/markup:translate-x-1 group-hover/markup:opacity-100">
                          Hide toolbar
                        </span>
                      </button>

                      <div className="mx-1 h-px bg-slate-100" />

                      {[
                        { id: "pointer", icon: MousePointer, tooltip: "Select / pan" },
                        { id: "cloud", icon: Cloud, tooltip: "Cloud markup" },
                        { id: "polygon", icon: PolygonIcon, tooltip: "Create zone polygon" },
                        { id: "line", icon: Minus, tooltip: "Line markup" },
                        { id: "rect", icon: Square, tooltip: "Rectangle markup" },
                        { id: "circle", icon: CircleIcon, tooltip: "Circle markup" },
                        { id: "arrow", icon: ArrowUpRight, tooltip: "Arrow pointer" },
                      ].map((tool) => {
                        const Icon = tool.icon;
                        const isActive =
                          (tool.id === "polygon" && activeTool === "nestedPolygon") ||
                          (tool.id !== "polygon" && drawingMarkupTool === tool.id && activeTool !== "nestedPolygon");

                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() => {
                              if (tool.id === "polygon") {
                                setDrawingMarkupTool("polygon");
                                handleCreateZoneFromDrawingSetup();
                                return;
                              }

                              setActiveTool("pan");
                              setNestedDrawingPoints([]);
                              setNestedRedoPoints([]);
                              setDrawingMarkupTool(tool.id as typeof drawingMarkupTool);
                              triggerToast(`Activated ${tool.tooltip}`);
                            }}
                            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all group/markup ${
                              isActive
                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                            }`}
                            title={tool.tooltip}
                          >
                            <Icon className="h-4 w-4" />
                            {tool.id === "polygon" && activeTool === "nestedPolygon" && (
                              <span className="absolute -right-1 -top-1 rounded-full bg-slate-950 px-1 text-[8px] font-extrabold text-white">
                                {nestedDrawingPoints.length}
                              </span>
                            )}
                            <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[9px] font-bold text-white opacity-0 shadow-lg transition-all duration-150 group-hover/markup:translate-x-1 group-hover/markup:opacity-100">
                              {tool.tooltip}
                            </span>
                          </button>
                        );
                      })}

                      <div className="mx-1 h-px bg-slate-100" />

                      <button
                        type="button"
                        onClick={() => {
                          setDrawingMarkupTool("pointer");
                          setActiveTool("pan");
                          setNestedDrawingPoints([]);
                          setNestedRedoPoints([]);
                          setDrawingMarkups([]);
                          triggerToast("Cleared drawing markups");
                        }}
                        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-rose-500 transition-all hover:bg-rose-50 group/markup"
                        title="Clear markups"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="pointer-events-none absolute left-12 z-50 whitespace-nowrap rounded-lg bg-slate-950 px-2 py-1 text-[9px] font-bold text-white opacity-0 shadow-lg transition-all duration-150 group-hover/markup:translate-x-1 group-hover/markup:opacity-100">
                          Clear markups
                        </span>
                      </button>
                    </div>
                  )}

                  {!isDrawingStackedView && currentDrawingUrl && !isDrawingMarkupToolbarVisible && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDrawingMarkupToolbarVisible(true);
                        triggerToast("Drawing toolbar shown");
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute left-4 top-1/2 z-45 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl border border-slate-100/80 bg-white/95 text-blue-600 shadow-[0_12px_34px_rgba(15,23,42,0.12)] backdrop-blur-md transition-all hover:bg-blue-50"
                      title="Show toolbar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}

                  {activeTool === "nestedPolygon" && activeArea && (
                    <div
                      className="absolute left-4 top-1/2 z-45 flex -translate-y-1/2 items-center gap-2"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="hidden flex-col gap-1.5 rounded-2xl border border-slate-100/80 bg-white/95 p-1.5 shadow-[0_12px_34px_rgba(15,23,42,0.12)] backdrop-blur-md">
                        <div className="relative group/tooltip">
                          <button
                            type="button"
                            onClick={() => {
                              setNestedDrawingPoints([]);
                              setNestedRedoPoints([]);
                              setActiveTool("pan");
                            }}
                            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900"
                          >
                            <MousePointer className="h-4 w-4" />
                          </button>
                          <div className="absolute left-14 top-1/2 z-50 w-40 -translate-y-1/2 scale-95 rounded-xl border border-slate-100/80 bg-white p-2 text-left opacity-0 shadow-xl transition-all duration-150 pointer-events-none group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100">
                            <p className="text-[10px] font-bold text-slate-800">Exit zone tool</p>
                            <p className="mt-0.5 text-[8.5px] font-semibold leading-normal text-slate-400">Return to pan and select mode.</p>
                          </div>
                        </div>

                        <div className="relative group/tooltip">
                          <button
                            type="button"
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20"
                          >
                            <PolygonIcon className="h-4 w-4" />
                            <span className="absolute -right-1 -top-1 rounded-full bg-slate-950 px-1 text-[8px] font-extrabold text-white">
                              {nestedDrawingPoints.length}
                            </span>
                          </button>
                          <div className="absolute left-14 top-1/2 z-50 w-44 -translate-y-1/2 scale-95 rounded-xl border border-slate-100/80 bg-white p-2 text-left opacity-0 shadow-xl transition-all duration-150 pointer-events-none group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100">
                            <p className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800">
                              <PolygonIcon className="h-3.5 w-3.5 text-blue-500" />
                              Zone polygon
                            </p>
                            <p className="mt-0.5 text-[8.5px] font-semibold leading-normal text-slate-400">Click the drawing to place corners.</p>
                          </div>
                        </div>

                        <div className="mx-1 h-px bg-slate-100" />

                        <button
                          type="button"
                          onClick={handleUndoNestedPoint}
                          disabled={nestedDrawingPoints.length === 0}
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"
                          title="Undo point"
                        >
                          <Undo2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRedoNestedPoint}
                          disabled={nestedRedoPoints.length === 0}
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-35"
                          title="Redo point"
                        >
                          <Redo2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => completeNestedLayerDrawing(nestedDrawingPoints)}
                          disabled={nestedDrawingPoints.length < 3}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                          title="Create zone"
                        >
                          <Check className="h-4 w-4 stroke-[3]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setNestedDrawingPoints([]);
                            setNestedRedoPoints([]);
                            setActiveTool("pan");
                          }}
                          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600"
                          title="Cancel zone"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="ml-14 w-52 rounded-2xl border border-blue-100/80 bg-white/95 p-3 text-left shadow-[0_12px_34px_rgba(15,23,42,0.12)] backdrop-blur-md">
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600">Create zone</p>
                        <p className="mt-1 text-[11px] font-bold leading-snug text-slate-800">
                          Mark corners on the drawing.
                        </p>
                        <p className="mt-1 text-[9px] font-semibold leading-4 text-slate-400">
                          Use Done after 3+ points, or click near the first point to close.
                        </p>
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-2.5 py-2">
                          <span className="text-[9px] font-bold text-slate-500">Points placed</span>
                          <span className="text-[10px] font-extrabold text-slate-900">{nestedDrawingPoints.length}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Figma Rulers & Guidelines */}
                  {showRulers && (
                    <>
                      {/* Top Ruler */}
                      <div
                        className="absolute top-0 left-0 right-0 h-6 bg-slate-55/90 backdrop-blur border-b border-slate-200 z-30 select-none overflow-hidden cursor-ns-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const rect = drawingViewportRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          const mouseY = e.clientY - rect.top;
                          const Cy = viewportDimensions.height / 2;
                          const coord = BASE_COORD + ((mouseY - Cy - drawingAdjustments.panY) / drawingAdjustments.zoom) * UNITS_PER_PIXEL;
                          const id = `guide-h-${Date.now()}`;
                          setGuidelines(prev => [...prev, { id, type: "h", coord }]);
                          setDraggingGuide({ id, type: "h", isNew: true });
                        }}
                      >
                        {(() => {
                          const ticks = [];
                          const W = viewportDimensions.width;
                          const Cx = W / 2;
                          const zoom = drawingAdjustments.zoom;
                          const panX = drawingAdjustments.panX;
                          const stepUnit = getRulerSteps(zoom);
                          const startCoord = BASE_COORD + ((0 - Cx - panX) / zoom) * UNITS_PER_PIXEL;
                          const endCoord = BASE_COORD + ((W - Cx - panX) / zoom) * UNITS_PER_PIXEL;
                          const subStep = stepUnit / 5;

                          for (let coord = Math.floor(startCoord / subStep) * subStep; coord <= endCoord; coord += subStep) {
                            const isMajor = Math.abs((coord / stepUnit) - Math.round(coord / stepUnit)) < 0.01;
                            const x = Cx + panX + ((coord - BASE_COORD) / UNITS_PER_PIXEL) * zoom;
                            if (x >= 24 && x <= W) {
                              ticks.push(
                                <div
                                  key={`h-tick-${coord}`}
                                  className="absolute bg-slate-350"
                                  style={{
                                    left: `${x}px`,
                                    bottom: "0px",
                                    width: "1px",
                                    height: isMajor ? "10px" : "4px"
                                  }}
                                />
                              );
                              if (isMajor) {
                                ticks.push(
                                  <div
                                    key={`h-lbl-${coord}`}
                                    className="absolute text-[8px] font-mono text-slate-500 font-bold leading-none"
                                    style={{
                                      left: `${x + 3}px`,
                                      top: "3px"
                                    }}
                                  >
                                    {Math.round(coord)}
                                  </div>
                                );
                              }
                            }
                          }
                          return ticks;
                        })()}
                        {hoveredCanvasPos && hoveredCanvasPos.x >= 24 && (
                          <div
                            className="absolute top-0 bottom-0 w-px bg-blue-500/50 pointer-events-none"
                            style={{ left: `${hoveredCanvasPos.x}px` }}
                          />
                        )}
                      </div>

                      {/* Left Ruler */}
                      <div
                        className="absolute top-0 left-0 bottom-0 w-6 bg-slate-55/90 backdrop-blur border-r border-slate-200 z-30 select-none overflow-hidden cursor-ew-resize"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          const rect = drawingViewportRef.current?.getBoundingClientRect();
                          if (!rect) return;
                          const mouseX = e.clientX - rect.left;
                          const Cx = viewportDimensions.width / 2;
                          const coord = BASE_COORD + ((mouseX - Cx - drawingAdjustments.panX) / drawingAdjustments.zoom) * UNITS_PER_PIXEL;
                          const id = `guide-v-${Date.now()}`;
                          setGuidelines(prev => [...prev, { id, type: "v", coord }]);
                          setDraggingGuide({ id, type: "v", isNew: true });
                        }}
                      >
                        {(() => {
                          const ticks = [];
                          const H = viewportDimensions.height;
                          const Cy = H / 2;
                          const zoom = drawingAdjustments.zoom;
                          const panY = drawingAdjustments.panY;
                          const stepUnit = getRulerSteps(zoom);
                          const startCoord = BASE_COORD + ((0 - Cy - panY) / zoom) * UNITS_PER_PIXEL;
                          const endCoord = BASE_COORD + ((H - Cy - panY) / zoom) * UNITS_PER_PIXEL;
                          const subStep = stepUnit / 5;

                          for (let coord = Math.floor(startCoord / subStep) * subStep; coord <= endCoord; coord += subStep) {
                            const isMajor = Math.abs((coord / stepUnit) - Math.round(coord / stepUnit)) < 0.01;
                            const y = Cy + panY + ((coord - BASE_COORD) / UNITS_PER_PIXEL) * zoom;
                            if (y >= 24 && y <= H) {
                              ticks.push(
                                <div
                                  key={`v-tick-${coord}`}
                                  className="absolute bg-slate-350"
                                  style={{
                                    top: `${y}px`,
                                    right: "0px",
                                    height: "1px",
                                    width: isMajor ? "10px" : "4px"
                                  }}
                                />
                              );
                              if (isMajor) {
                                ticks.push(
                                  <div
                                    key={`v-lbl-${coord}`}
                                    className="absolute text-[8px] font-mono text-slate-500 font-bold leading-none origin-top-left -rotate-90"
                                    style={{
                                      top: `${y + 3}px`,
                                      left: "3px"
                                    }}
                                  >
                                    {Math.round(coord)}
                                  </div>
                                );
                              }
                            }
                          }
                          return ticks;
                        })()}
                        {hoveredCanvasPos && hoveredCanvasPos.y >= 24 && (
                          <div
                            className="absolute left-0 right-0 h-px bg-blue-500/50 pointer-events-none"
                            style={{ top: `${hoveredCanvasPos.y}px` }}
                          />
                        )}
                      </div>

                      {/* Top-Left Corner Box */}
                      <div className="absolute top-0 left-0 w-6 h-6 bg-slate-100 border-r border-b border-slate-200 z-45 flex items-center justify-center text-[7px] text-slate-400 font-extrabold select-none">
                        R
                      </div>

                      {/* Guidelines render overlay */}
                      {guidelines.map((g) => {
                        if (g.type === "v") {
                          const Cx = viewportDimensions.width / 2;
                          const x = Cx + drawingAdjustments.panX + ((g.coord - BASE_COORD) / UNITS_PER_PIXEL) * drawingAdjustments.zoom;
                          if (x < 24 || x > viewportDimensions.width) return null;

                          const isDraggingThis = draggingGuide?.id === g.id;

                          return (
                            <div
                              key={g.id}
                              className={`absolute top-0 bottom-0 w-1.5 -translate-x-[2px] cursor-ew-resize z-20 group`}
                              style={{ left: `${x}px` }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggingGuide({ id: g.id, type: "v", isNew: false });
                              }}
                            >
                              <div className={`w-0.5 h-full mx-auto ${isDraggingThis ? "bg-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-rose-500 group-hover:bg-rose-600"}`} />
                              <div className="absolute top-8 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-rose-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 z-30 whitespace-nowrap pointer-events-auto">
                                <span>X: {Math.round(g.coord)}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setGuidelines(prev => prev.filter(item => item.id !== g.id));
                                    triggerToast("Guideline removed");
                                  }}
                                  className="hover:bg-white/20 rounded p-0.5"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          );
                        } else {
                          const Cy = viewportDimensions.height / 2;
                          const y = Cy + drawingAdjustments.panY + ((g.coord - BASE_COORD) / UNITS_PER_PIXEL) * drawingAdjustments.zoom;
                          if (y < 24 || y > viewportDimensions.height) return null;

                          const isDraggingThis = draggingGuide?.id === g.id;

                          return (
                            <div
                              key={g.id}
                              className={`absolute left-0 right-0 h-1.5 -translate-y-[2px] cursor-ns-resize z-20 group`}
                              style={{ top: `${y}px` }}
                              onMouseDown={(e) => {
                                e.stopPropagation();
                                setDraggingGuide({ id: g.id, type: "h", isNew: false });
                              }}
                            >
                              <div className={`h-0.5 w-full my-auto ${isDraggingThis ? "bg-rose-600 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-rose-500 group-hover:bg-rose-600"}`} />
                              <div className="absolute left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-rose-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 z-30 whitespace-nowrap pointer-events-auto">
                                <span>Y: {Math.round(g.coord)}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setGuidelines(prev => prev.filter(item => item.id !== g.id));
                                    triggerToast("Guideline removed");
                                  }}
                                  className="hover:bg-white/20 rounded p-0.5"
                                >
                                  <X className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            </div>
                          );
                        }
                      })}
                    </>
                  )}

                  {/* Canvas adjustments bar */}
                  <div className="absolute right-4 bottom-4 bg-white/90 backdrop-blur border border-slate-100/60 p-2.5 rounded-xl flex items-center gap-3.5 shadow-md z-40">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-500">Zoom:</span>
                      <input
                        type="range"
                        min="0.5"
                        max="3.0"
                        step="0.1"
                        value={drawingAdjustments.zoom}
                        onChange={(e) => setDrawingAdjustments({ ...drawingAdjustments, zoom: parseFloat(e.target.value) })}
                        className="w-20 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-650"
                      />
                      <span className="text-[9.5px] font-mono font-bold text-slate-700 w-8 text-right">
                        {Math.round(drawingAdjustments.zoom * 100)}%
                      </span>
                    </div>
                    <div className="h-4 w-px bg-slate-200" />
                    <button
                      onClick={() => setDrawingAdjustments({ zoom: 1.0, rotate: 0, panX: 0, panY: 0 })}
                      className="text-[9px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Reset View
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="max-w-md w-full text-center bg-white border border-slate-100/80 rounded-[32px] p-8 flex flex-col items-center gap-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-blue-500/5">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Base site drawing required</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-normal">
                      Upload the main site or floor plan first. It becomes the reference for zones, levels, and drawing assignments.
                    </p>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2">
                    <button
                      onClick={() => drawingLibraryInputRef.current?.click()}
                      className="h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                    <button
                      onClick={addHubDrawingFiles}
                      className="h-10 rounded-2xl border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <FolderOpen className="w-4 h-4" />
                      From HUB
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* C. Right Sidebar: Collapsible Layers Tree */}
          {isDrawingRightLayersOpen ? (
            <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 z-30 shadow-[-4px_0_24px_rgba(15,23,42,0.02)] transition-all">
              <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0 bg-white">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                  <h3 className="min-w-0 truncate whitespace-nowrap text-[10px] font-bold text-slate-800 uppercase tracking-wide">
                    {activeTab === "3d" ? "BIM Model Hierarchy" : (activeTab === "drone" ? "Drone Captures" : "Layer")}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {activeTab === "drawing" && (
                    <button
                      onClick={createNewDrawingSitePlanFromNextAvailable}
                      className="h-7 px-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[8px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Create a separate site plan setup"
                    >
                      <Plus className="w-3 h-3" />
                      <span className="hidden 2xl:inline">New Plan</span>
                    </button>
                  )}
                  {!isDrawingLeftSetupOpen && (
                    <button
                      onClick={() => setIsDrawingLeftSetupOpen(true)}
                      className="px-2 py-1 rounded bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 text-[8.5px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      title="Edit drawing assignments setup"
                    >
                      <Settings className="w-3 h-3" />
                      Edit Setup
                    </button>
                  )}
                  <button
                    onClick={() => setIsDrawingRightLayersOpen(false)}
                    className="p-1 hover:bg-slate-50 rounded text-slate-400 hover:text-slate-655 transition-colors"
                    title="Collapse Layers"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Tree View Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {activeTab === "drone" ? renderDroneLayersTree() : (activeTab === "3d" ? render3DModelLayersTree() : renderDrawingLayersTree())}
              </div>
            </div>
          ) : (
            /* Floating small layers toggle on the right side if collapsed */
            <button
              onClick={() => setIsDrawingRightLayersOpen(true)}
              className="absolute right-4 bottom-4 z-40 w-10 h-10 bg-white hover:bg-slate-50 text-blue-600 border border-slate-100/80 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Open Layers Tree"
            >
              <Layers className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* -------------------- TAB 3: BIM COORDINATION WORKSPACE -------------------- */}
      <div className={`w-full h-full bg-[#ecf1f5] overflow-hidden relative items-stretch select-none ${activeTab === "coordination" ? "flex" : "hidden"}`}>
          
          {/* F. LEFT SIDE SIDEBAR PANEL: RFIs & Issues with Custom Color Assignments */}
          {!isCoordinationMaxView && isRfiPanelOpen && (
            <div
              className="relative h-full bg-white border-r border-slate-100/60 flex flex-col shrink-0 z-30 select-none"
              style={{ width: `${rfiPanelWidth}px` }}
            >
              <div
                onMouseDown={(event) => {
                  event.preventDefault();
                  setIsResizingRfiPanel(true);
                }}
                className="absolute right-0 top-0 h-full w-2 translate-x-1/2 cursor-col-resize z-50 group/resize"
                title="Drag to resize left panel"
              >
                <div className="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover/resize:opacity-40" />
              </div>
              {isCoordinationSetupReferenceMode && (
                <div className="absolute inset-0 z-40 bg-white flex flex-col">
                  <div className="px-3 py-3 border-b border-slate-100/80 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                      <h2 className="text-[11.5px] font-extrabold text-slate-500 tracking-tight">
                        Empty Setup
                      </h2>
                    </div>
                    <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-350">
                      Developer reference state
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center p-5 text-center">
                    <div className="space-y-2">
                      <div className="mx-auto h-9 w-9 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                        <Layers className="w-4 h-4" />
                      </div>
                      <p className="text-[11px] font-extrabold text-slate-500">No layers configured</p>
                      <p className="text-[9.5px] font-semibold text-slate-350 leading-relaxed">
                        Layer tree, RFI list, issue list, and clash reports are intentionally blank here.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* Panel Header */}
              <div className="px-3 py-2.5 border-b border-slate-100/80 shrink-0 bg-white space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      <h2 className="text-[10.5px] font-extrabold text-slate-800 tracking-tight truncate whitespace-nowrap">
                        BIM Coordination
                      </h2>
                    </div>
                    <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {activeRfiTab === "rfi" ? `${rfis.length} RFIs` : activeRfiTab === "issue" ? `${issues.length} Issues` : `${clashResults.length} Clashes`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {onBackToRfiList && (
                      <button
                        type="button"
                        onClick={onBackToRfiList}
                        className="h-6.5 rounded-lg border border-blue-100 bg-blue-50 px-2 text-[8.5px] font-extrabold text-blue-700 hover:bg-blue-100 transition-all cursor-pointer inline-flex items-center gap-1 whitespace-nowrap shrink-0"
                      >
                        <ArrowLeft className="w-2.5 h-2.5" />
                        Back to list
                      </button>
                    )}
                    <button 
                      onClick={() => setIsRfiPanelOpen(false)}
                      className="h-6.5 w-6.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer flex items-center justify-center shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100/70 p-1">
                  {[
                    { id: "clashes", label: "Clash", count: clashResults.length },
                    { id: "issue", label: "Issues", count: issues.length },
                    { id: "rfi", label: "RFIs", count: rfis.length }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        const nextTab = tab.id as "rfi" | "issue" | "clashes";
                        setActiveRfiTab(nextTab);
                        if (nextTab === "rfi") setSelectedCoordinationItemId((current) => current?.startsWith("RFI-") ? current : rfis[0]?.id || null);
                        if (nextTab === "issue") setSelectedCoordinationItemId((current) => current?.startsWith("ISS-") ? current : issues[0]?.id || null);
                        if (nextTab === "clashes") setSelectedCoordinationItemId((current) => current?.startsWith("CL-") ? current : clashResults[0]?.id || null);
                      }}
                      className={`h-7 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                        activeRfiTab === tab.id
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.label} <span className="text-[8px] opacity-60">{tab.count}</span>
                    </button>
                  ))}
                </div>

                {activeRfiTab !== "clashes" && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input 
                      type="text"
                      placeholder={`Search ${activeRfiTab === "rfi" ? "RFIs" : "Issues"}...`}
                      value={searchRfiQuery}
                      onChange={(e) => setSearchRfiQuery(e.target.value)}
                      className="w-full h-8 bg-slate-50/80 hover:bg-slate-50 border border-slate-100/80 focus:border-blue-500/70 focus:bg-white rounded-xl pl-7.5 pr-2.5 text-[10.5px] font-semibold focus:outline-none transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>
                )}
              </div>
              {/* Scrollable list */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5 bg-slate-50/35 text-left">
                {activeRfiTab === "rfi" ? (
                  rfis.filter(r => r.title.toLowerCase().includes(searchRfiQuery.toLowerCase()) || r.id.toLowerCase().includes(searchRfiQuery.toLowerCase())).length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-[11px] font-semibold text-slate-400">No matching RFIs found</p>
                    </div>
                  ) : (
                    rfis.filter(r => r.title.toLowerCase().includes(searchRfiQuery.toLowerCase()) || r.id.toLowerCase().includes(searchRfiQuery.toLowerCase())).map(item => (
                      <div 
                        key={item.id} 
                        className={`relative p-3 bg-white border hover:shadow-[0_10px_26px_rgba(15,23,42,0.06)] rounded-2xl transition-all space-y-2 cursor-pointer overflow-hidden group/card ${
                          selectedCoordinationItemId === item.id ? "border-blue-300 ring-1 ring-blue-100 shadow-[0_10px_26px_rgba(37,99,235,0.08)]" : "border-slate-100/80 hover:border-blue-100"
                        }`}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-blue-500 opacity-80" />
                        <div className="flex justify-between items-start gap-2 pl-1">
                          <span className="text-[9.5px] font-extrabold text-blue-600 font-mono tracking-wide shrink-0">{item.id}</span>
                          <span 
                            className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border shrink-0"
                            style={{ 
                              backgroundColor: `${serviceColors[item.service] || '#64748b'}10`, 
                              color: serviceColors[item.service] || '#64748b', 
                              borderColor: `${serviceColors[item.service] || '#64748b'}20` 
                            }}
                          >
                            {item.service}
                          </span>
                        </div>
                        <p className="pl-1 text-[11.5px] font-semibold text-slate-800 leading-snug">{item.title}</p>
                        <div className="pl-1 flex items-center justify-between pt-1.5 text-[9px] text-slate-400 font-semibold border-t border-slate-100">
                          <span className="truncate pr-2">Assignee: <span className="font-bold text-slate-600">{item.assignee}</span></span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`px-1.5 py-0.5 rounded-md font-black text-[7.5px] uppercase tracking-wide ${
                              item.priority === 'Critical' ? 'bg-red-50 text-red-600' : (item.priority === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500')
                            }`}>
                              {item.priority}
                            </span>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setCoordinationDetailTab("overview");
                                setCoordinationDetailModal({ type: "rfi", item });
                              }}
                              className="px-1.5 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100/50 rounded text-[9px] font-bold transition-all cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : activeRfiTab === "issue" ? (
                  issues.filter(i => i.title.toLowerCase().includes(searchRfiQuery.toLowerCase()) || i.id.toLowerCase().includes(searchRfiQuery.toLowerCase())).length === 0 ? (
                    <div className="py-12 text-center">
                      <AlertTriangle className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                      <p className="text-[11px] font-semibold text-slate-400">No matching issues found</p>
                    </div>
                  ) : (
                    issues.filter(i => i.title.toLowerCase().includes(searchRfiQuery.toLowerCase()) || i.id.toLowerCase().includes(searchRfiQuery.toLowerCase())).map(item => (
                      <div 
                        key={item.id} 
                        className={`relative p-3 bg-white border hover:shadow-[0_10px_26px_rgba(15,23,42,0.06)] rounded-2xl transition-all space-y-2 cursor-pointer overflow-hidden group/card ${
                          selectedCoordinationItemId === item.id ? "border-rose-300 ring-1 ring-rose-100 shadow-[0_10px_26px_rgba(244,63,94,0.08)]" : "border-slate-100/80 hover:border-rose-100"
                        }`}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r-full bg-rose-500 opacity-80" />
                        <div className="flex justify-between items-start gap-2 pl-1">
                          <span className="text-[9.5px] font-extrabold text-rose-600 font-mono tracking-wide shrink-0">{item.id}</span>
                          <span 
                            className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full border shrink-0"
                            style={{ 
                              backgroundColor: `${serviceColors[item.service] || '#64748b'}10`, 
                              color: serviceColors[item.service] || '#64748b', 
                              borderColor: `${serviceColors[item.service] || '#64748b'}20` 
                            }}
                          >
                            {item.service}
                          </span>
                        </div>
                        <p className="pl-1 text-[11.5px] font-semibold text-slate-800 leading-snug">{item.title}</p>
                        <div className="pl-1 flex items-center justify-between pt-1.5 text-[9px] text-slate-400 font-semibold border-t border-slate-100">
                          <span className="truncate pr-2">Assignee: <span className="font-bold text-slate-600">{item.assignee}</span></span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`px-1.5 py-0.5 rounded-md font-black text-[7.5px] uppercase tracking-wide ${
                              item.priority === 'Critical' ? 'bg-red-50 text-red-650' : (item.priority === 'High' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500')
                            }`}>
                              {item.priority}
                            </span>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setCoordinationDetailTab("overview");
                                setCoordinationDetailModal({ type: "issue", item });
                              }}
                              className="px-1.5 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100/50 rounded text-[9px] font-bold transition-all cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  /* activeRfiTab === "clashes" content */
                  <div className="space-y-3">
                    {/* Clash Intervention Engine */}
                    <div className="bg-white border border-blue-100/80 rounded-xl p-2.5 space-y-1.5 shadow-[0_10px_26px_rgba(37,99,235,0.06)]">
                      <div className="flex items-center gap-1.5">
                        <span className="h-6 w-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                          <Activity className="w-3.5 h-3.5" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-[10.5px] font-extrabold text-slate-800 leading-tight">Clash Intervention Engine</h3>
                          <p className="text-[8.5px] text-slate-400 font-semibold leading-snug truncate">
                            Automated structure and MEP checks
                          </p>
                        </div>
                      </div>
                      
                      {isClashRunning ? (
                        <div className="space-y-1 pt-0.5">
                          <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                            <span className="flex items-center gap-1">
                              <Loader2 className="w-3 h-3 animate-spin text-blue-600" /> Scanning model geometry...
                            </span>
                            <span>{clashProgress}%</span>
                          </div>
                          <div className="w-full bg-blue-50 rounded-full h-1 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 h-1 rounded-full transition-all duration-150" style={{ width: `${clashProgress}%` }} />
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => {
                            setIsClashSetupModalOpen(true);
                          }}
                          className="w-full h-7 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-650 hover:to-blue-750 text-white rounded-lg text-[10px] font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/15 active:scale-[0.98]"
                        >
                          <RefreshCw className="w-3 h-3" /> Run Clash Detection
                        </button>
                      )}
                    </div>

                    {/* Clash Results list */}
                    <div className="space-y-1">
                      <h4 className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">
                        Conflict Clash Reports ({clashResults.length})
                      </h4>
                      {clashResults.map(clash => (
                        <div 
                          key={clash.id}
                          className={`p-2.5 bg-white border hover:border-slate-250 hover:bg-slate-50/20 rounded-xl space-y-1 transition-all cursor-pointer ${
                            selectedCoordinationItemId === clash.id ? "border-blue-300 ring-1 ring-blue-100 shadow-[0_10px_26px_rgba(37,99,235,0.08)]" : "border-slate-100/70"
                          }`}
                          onClick={() => {
                            handleItemClick(clash.id);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold text-slate-500 font-mono">{clash.id}</span>
                            <span className={`px-1 py-0.2 rounded font-bold text-[7.5px] uppercase tracking-wide ${
                              clash.severity === 'Critical' ? 'bg-red-50 text-red-655 border border-red-105/50' : 'bg-amber-50 text-amber-600 border border-amber-105/50'
                            }`}>
                              {clash.severity}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: serviceColors[clash.service1] }} />
                              <span className="truncate">{clash.element1}</span>
                            </div>
                            <div className="text-[8px] font-semibold text-slate-400 pl-3 uppercase">Conflicts with</div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-700 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: serviceColors[clash.service2] }} />
                              <span className="truncate">{clash.element2}</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 text-[9px] text-slate-400 font-medium">
                            <span>Status: <span className="text-amber-500 font-bold">{clash.status}</span></span>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setCoordinationDetailTab("overview");
                                setCoordinationDetailModal({ type: "clash", item: clash });
                              }}
                              className="px-1.5 py-0.5 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100/50 rounded text-[9px] font-bold transition-all cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isCoordinationMaxView && !isRfiPanelOpen && (
            <button
              onClick={() => setIsRfiPanelOpen(true)}
              className="absolute left-4 bottom-4 z-40 w-10 h-10 bg-white hover:bg-slate-50 text-blue-600 border border-slate-100/80 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Open RFI Tracker"
            >
              <List className="w-4 h-4" />
            </button>
          )}

          {/* Main 2D Drawing Workspace (Center) */}
          <div 
            ref={coordinationViewportRef}
            onMouseMove={handleCoordinationMouseMove}
            onMouseUp={handleCoordinationMouseUp}
            onMouseLeave={handleCoordinationMouseUp}
            className="flex-1 h-full relative overflow-hidden bg-[#ecf1f5] flex items-center justify-center"
          >
            <button
              onClick={() => {
                const nextMaxState = !isCoordinationMaxView;
                setIsCoordinationMaxView(nextMaxState);
                setIsSpotlightDropdownOpen(false);
                triggerToast(nextMaxState ? "Max view enabled" : "Max view closed");
              }}
              className={`absolute top-8 left-8 z-50 h-9 rounded-xl border backdrop-blur flex items-center gap-2 px-3 text-[11px] font-extrabold shadow-[0_12px_34px_rgba(15,23,42,0.10)] transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer ${
                isCoordinationMaxView
                  ? "bg-blue-600 border-blue-600 text-white shadow-blue-500/20"
                  : "bg-white/95 border-slate-100/90 text-slate-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
              title={isCoordinationMaxView ? "Exit max view" : "Maximize view"}
            >
              <Maximize2 className="w-4 h-4" />
              <span>{isCoordinationMaxView ? "Exit" : "Max View"}</span>
            </button>

            <button
              onClick={() => setIsToolInfoOpen(true)}
              className="absolute right-4 bottom-4 z-45 h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-[0_10px_24px_rgba(37,99,235,0.24)] flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
              title="Tool info and shortcuts"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setIsCoordinationSetupReferenceMode((prev) => {
                  const next = !prev;
                  if (next) {
                    setCoordinationSelectedMarkupId(null);
                    setPendingNewMarkupComment(null);
                    setCoordinationDetailModal(null);
                    setCoordinationActiveMarkupTool(null);
                    setIsSpotlightOpen(false);
                    setIsSpotlightDropdownOpen(false);
                    triggerToast("Developer empty setup reference enabled");
                  } else {
                    triggerToast("Returned to configured coordination view");
                  }
                  return next;
                });
              }}
              className={`absolute left-4 bottom-4 z-45 h-8 w-8 rounded-xl border shadow-[0_10px_24px_rgba(15,23,42,0.12)] flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer ${
                isCoordinationSetupReferenceMode
                  ? "bg-slate-900 border-slate-900 text-white"
                  : "bg-white hover:bg-slate-50 text-slate-600 border-slate-100/90"
              }`}
              title="Toggle empty setup reference"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>

            {isSpotlightOpen && (
              <>
                <div className="absolute inset-3 rounded-[18px] border-[3px] border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_0_34px_rgba(16,185,129,0.16)] pointer-events-none z-40" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-45 flex items-center gap-2 rounded-b-2xl bg-white/95 backdrop-blur px-3 py-2 shadow-[0_14px_36px_rgba(15,23,42,0.12)] border-x border-b border-slate-200">
                  <button className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer">
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-extrabold text-slate-400">0 Followers</span>
                  <button
                    onClick={() => {
                      setIsSpotlightOpen(false);
                      triggerToast("Stopped broadcasting Spotlight");
                    }}
                    className="h-6 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-extrabold cursor-pointer transition-colors"
                  >
                    Stop
                  </button>
                  <button className="h-7 w-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center cursor-pointer transition-colors">
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}

            {isCoordinationSetupReferenceMode && (
              <div className="absolute inset-0 z-40 bg-[#ecf1f5] flex items-center justify-center p-6">
                <div className="w-full max-w-lg rounded-3xl bg-white border border-slate-100/90 shadow-[0_22px_70px_rgba(15,23,42,0.10)] p-6 text-center">
                  <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-base font-extrabold text-slate-900">No coordination setup yet</h3>
                  <p className="mt-2 text-[12px] font-semibold text-slate-500 leading-relaxed">
                    This is the blank developer reference scenario. No 2D drawing, 3D model, layers, RFIs, issues, or clashes are configured yet.
                  </p>
                  <p className="mt-1 text-[11px] font-bold text-slate-400">
                    Choose what the user wants to set up first.
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {[
                      { label: "Map Setup", tab: "map" as const, icon: MapPin },
                      { label: "2D Setup", tab: "drawing" as const, icon: FileText },
                      { label: "3D Setup", tab: "3d" as const, icon: CustomCube }
                    ].map((option) => (
                      <button
                        key={option.label}
                        onClick={() => {
                          setIsCoordinationSetupReferenceMode(false);
                          setActiveTab(option.tab);
                          triggerToast(`Opened ${option.label}`);
                        }}
                        className="h-20 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50 hover:border-blue-100 text-slate-600 hover:text-blue-600 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
                      >
                        <option.icon className="w-4 h-4" />
                        <span className="text-[10px] font-extrabold">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Interactive Drawing Sheet Container */}
            <div 
              className="relative overflow-visible"
              style={{
                width: "800px",
                height: "500px",
                transform: `translate(${coordinationPan.x}px, ${coordinationPan.y}px) scale(${coordinationZoom})`,
                transformOrigin: "center center",
                cursor: coordinationActiveMarkupTool ? "crosshair" : (isCoordinationPanningDrawing ? "grabbing" : "grab"),
                transition: isDrawingMarkup || isCoordinationPanningDrawing ? "none" : "transform 0.15s ease-out",
              }}
              onWheel={(e) => {
                e.preventDefault();
                const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
                const nextZoom = Math.min(5, Math.max(0.5, coordinationZoom * zoomFactor));
                setCoordinationZoom(nextZoom);
              }}
            >
              <svg 
                viewBox="0 0 800 500" 
                className="w-full h-full bg-white border border-slate-100/80 shadow-md select-none rounded-sm"
                onMouseDown={(e) => {
                  const svg = e.currentTarget;
                  const rect = svg.getBoundingClientRect();
                  
                  // Helper function to get SVG coordinates
                  const getSvgCoords = (clientX: number, clientY: number) => {
                    const mouseX = ((clientX - rect.left) / rect.width) * 800;
                    const mouseY = ((clientY - rect.top) / rect.height) * 500;
                    const x = (mouseX - 400 - coordinationPan.x) / coordinationZoom + 400;
                    const y = (mouseY - 250 - coordinationPan.y) / coordinationZoom + 250;
                    return { x, y };
                  };

                  const coords = getSvgCoords(e.clientX, e.clientY);
                  
                  if (coordinationActiveMarkupTool) {
                    setIsDrawingMarkup(true);
                    setDrawingStartPoint(coords);
                    setCoordinationDrawingPoints([coords]);
                  } else {
                    setIsCoordinationPanningDrawing(true);
                    setCoordinationDrawingPanStart({ x: e.clientX - coordinationPan.x, y: e.clientY - coordinationPan.y });
                  }
                }}
                onMouseMove={(e) => {
                  const svg = e.currentTarget;
                  const rect = svg.getBoundingClientRect();
                  
                  const getSvgCoords = (clientX: number, clientY: number) => {
                    const mouseX = ((clientX - rect.left) / rect.width) * 800;
                    const mouseY = ((clientY - rect.top) / rect.height) * 500;
                    const x = (mouseX - 400 - coordinationPan.x) / coordinationZoom + 400;
                    const y = (mouseY - 250 - coordinationPan.y) / coordinationZoom + 250;
                    return { x, y };
                  };

                  if (isDrawingMarkup && drawingStartPoint) {
                    const coords = getSvgCoords(e.clientX, e.clientY);
                    setCoordinationDrawingPoints([drawingStartPoint, coords]);
                  } else if (isCoordinationPanningDrawing) {
                    setCoordinationPan({
                      x: e.clientX - coordinationDrawingPanStart.x,
                      y: e.clientY - coordinationDrawingPanStart.y
                    });
                  }
                }}
                onMouseUp={(e) => {
                  const svg = e.currentTarget;
                  const rect = svg.getBoundingClientRect();
                  
                  const getSvgCoords = (clientX: number, clientY: number) => {
                    const mouseX = ((clientX - rect.left) / rect.width) * 800;
                    const mouseY = ((clientY - rect.top) / rect.height) * 500;
                    const x = (mouseX - 400 - coordinationPan.x) / coordinationZoom + 400;
                    const y = (mouseY - 250 - coordinationPan.y) / coordinationZoom + 250;
                    return { x, y };
                  };

                  if (isDrawingMarkup && drawingStartPoint) {
                    const endPoint = getSvgCoords(e.clientX, e.clientY);
                    setIsDrawingMarkup(false);
                    
                    const x = Math.min(drawingStartPoint.x, endPoint.x);
                    const y = Math.min(drawingStartPoint.y, endPoint.y);
                    const w = Math.max(15, Math.abs(endPoint.x - drawingStartPoint.x));
                    const h = Math.max(15, Math.abs(endPoint.y - drawingStartPoint.y));
                    const polygonPoints = coordinationActiveMarkupTool === "polygon"
                      ? getPolygonMarkupPoints(x, y, w, h)
                      : undefined;
                    
                    if (pendingMarkupItemId) {
                      // Linking to an existing item directly
                      const newId = `markup-${Date.now()}`;
                      const newMarkup: any = {
                        id: newId,
                        itemId: pendingMarkupItemId,
                        type: coordinationActiveMarkupTool,
                        x: x,
                        y: y,
                        width: w,
                        height: h,
                        radius: Math.sqrt(w*w + h*h) / 2,
                        points: polygonPoints || [drawingStartPoint, endPoint],
                        comments: [
                          {
                            id: `c-${Date.now()}`,
                            author: "Snehasis Mohapatra",
                            avatar: "SM",
                            time: "Just now",
                            text: `Markup annotation linked to ${pendingMarkupItemId}`
                          }
                        ]
                      };
                      if (coordinationActiveMarkupTool === "arrow") {
                        newMarkup.arrow = { from: drawingStartPoint, to: endPoint };
                      }
                      setCoordinationMarkups(prev => [...prev, newMarkup]);
                      setCoordinationSelectedMarkupId(newId);
                      setPendingMarkupItemId(null);
                      setCoordinationActiveMarkupTool(null);
                      triggerToast(`Linked markup to ${pendingMarkupItemId}`, "success");
                    } else {
                      // Open Figma-style popover to create new item and add first comment
                      setPendingNewMarkupComment({
                        type: coordinationActiveMarkupTool,
                        x: x,
                        y: y,
                        width: w,
                        height: h,
                        radius: Math.sqrt(w*w + h*h) / 2,
                        points: polygonPoints || [drawingStartPoint, endPoint],
                        arrow: coordinationActiveMarkupTool === "arrow" ? { from: drawingStartPoint, to: endPoint } : undefined
                      });
                      setNewMarkupCommentText("");
                      setCoordinationActiveMarkupTool(null);
                    }
                  }
                  setIsCoordinationPanningDrawing(false);
                }}
              >
                {/* 1. GRID SYSTEM (Always visible as background) */}
                <g stroke="#cbd5e1" strokeWidth="0.5" strokeDasharray="3 3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <line key={`grid-v-${i}`} x1={50 + i * 85} y1={30} x2={50 + i * 85} y2={470} />
                  ))}
                  {Array.from({ length: 6 }).map((_, i) => (
                    <line key={`grid-h-${i}`} x1={30} y1={50 + i * 80} x2={770} y2={50 + i * 80} />
                  ))}
                </g>

                {/* Grid Labels */}
                <g fill="#94a3b8" fontSize="10" fontWeight="bold">
                  {["A", "B", "C", "D", "E", "F", "G", "H", "I"].map((label, i) => (
                    <text key={`label-v-${i}`} x={50 + i * 85} y={25} textAnchor="middle">{label}</text>
                  ))}
                  {["1", "2", "3", "4", "5", "6"].map((label, i) => (
                    <text key={`label-h-${i}`} x={20} y={54 + i * 80} textAnchor="middle">{label}</text>
                  ))}
                </g>

                {/* 2. ARCHITECTURAL LAYER */}
                {coordinationActiveModels["Architectural"] && (
                  <g>
                    {/* Room Partitions */}
                    <rect x="50" y="50" width="700" height="400" fill="none" stroke="#64748b" strokeWidth="3" />
                    <line x1="300" y1="50" x2="300" y2="450" stroke="#64748b" strokeWidth="2" />
                    <line x1="550" y1="50" x2="550" y2="450" stroke="#64748b" strokeWidth="2" />
                    <line x1="300" y1="200" x2="750" y2="200" stroke="#64748b" strokeWidth="2" />
                    
                    {/* Columns */}
                    <rect x="290" y="90" width="20" height="20" fill="#475569" stroke="#334155" />
                    <rect x="290" y="290" width="20" height="20" fill="#475569" stroke="#334155" />
                    <rect x="540" y="90" width="20" height="20" fill="#475569" stroke="#334155" />
                    <rect x="540" y="290" width="20" height="20" fill="#475569" stroke="#334155" />
                    
                    {/* Room Text Labels */}
                    <text x="175" y="100" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="extrabold" stroke="none">SERVER ROOM</text>
                    <text x="425" y="100" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="extrabold" stroke="none">CORRIDOR B</text>
                    <text x="650" y="100" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="extrabold" stroke="none">MECHANICAL ROOM</text>
                    <text x="425" y="300" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="extrabold" stroke="none">MAIN OFFICE AREA</text>
                  </g>
                )}

                {/* 3. ELECTRICAL LAYER */}
                {coordinationActiveModels["Electrical"] && (
                  <g stroke="#eab308" strokeWidth="2.5" fill="none">
                    <path d="M 60 60 L 290 60 L 290 190 M 540 60 L 740 60" strokeDasharray="5 3" />
                    <rect x="680" y="80" width="15" height="35" fill="rgba(234, 179, 8, 0.1)" strokeWidth="1.5" />
                    <text x="687" y="75" textAnchor="middle" fill="#eab308" fontSize="8" fontWeight="bold" stroke="none">DB-1</text>
                  </g>
                )}

                {/* 4. PLUMBING LAYER */}
                {coordinationActiveModels["Plumbing"] && (
                  <g stroke="#f97316" strokeWidth="2" fill="none">
                    <path d="M 80 430 L 720 430" />
                    <path d="M 320 200 L 320 430" />
                    <path d="M 120 410 L 720 410" stroke="#3b82f6" />
                  </g>
                )}

                {/* 5. FIREFIGHTING LAYER */}
                {coordinationActiveModels["Firefighting"] && (
                  <g stroke="#ec4899" strokeWidth="1.5" fill="none">
                    <path d="M 100 150 L 700 150" strokeDasharray="8 4" />
                    <path d="M 100 350 L 700 350" strokeDasharray="8 4" />
                    {[150, 300, 450, 600].map(cx => (
                      <g key={`spr-1-${cx}`} transform={`translate(${cx}, 150)`}>
                        <circle r="4" fill="#ec4899" />
                        <line x1="0" y1="-8" x2="0" y2="8" />
                        <line x1="-8" y1="0" x2="8" y2="0" />
                      </g>
                    ))}
                    {[150, 300, 450, 600].map(cx => (
                      <g key={`spr-2-${cx}`} transform={`translate(${cx}, 350)`}>
                        <circle r="4" fill="#ec4899" />
                        <line x1="0" y1="-8" x2="0" y2="8" />
                        <line x1="-8" y1="0" x2="8" y2="0" />
                      </g>
                    ))}
                  </g>
                )}

                {/* 6. MECHANICAL LAYER */}
                {coordinationActiveModels["Mechanical"] && (
                  <g stroke="#3b82f6" strokeWidth="2" fill="none">
                    <rect x="100" y="210" width="500" height="40" fill="rgba(59, 130, 246, 0.06)" />
                    <rect x="330" y="90" width="30" height="120" fill="rgba(59, 130, 246, 0.06)" />
                    <rect x="520" y="250" width="30" height="120" fill="rgba(59, 130, 246, 0.06)" />
                    
                    {[150, 250, 450].map(cx => (
                      <g key={`vent-h-${cx}`} transform={`translate(${cx}, 230)`} strokeWidth="1.5">
                        <circle r="10" fill="white" />
                        <line x1="-7" y1="-7" x2="7" y2="7" />
                        <line x1="-7" y1="7" x2="7" y2="-7" />
                      </g>
                    ))}
                    
                    {/* VAV 1 RA-1 */}
                    <g transform="translate(510, 320)">
                      <rect x="0" y="0" width="50" height="40" fill="white" stroke="#10b981" strokeWidth="2" />
                      <polygon points="0,40 50,40 50,0" fill="#10b981" />
                      <text x="25" y="-6" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="extrabold" stroke="none">RA-1 24"x24"</text>
                    </g>
                    
                    {/* VAV 2 RA-2 */}
                    <g transform="translate(100, 80)">
                      <rect x="0" y="0" width="50" height="40" fill="white" stroke="#10b981" strokeWidth="2" />
                      <polygon points="0,40 50,40 50,0" fill="#10b981" />
                      <text x="25" y="-6" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="extrabold" stroke="none">RA-2 24"x24"</text>
                    </g>
                    
                    <text x="150" y="234" fill="#3b82f6" fontSize="9" fontWeight="extrabold" stroke="none" textAnchor="middle">30"x12" DUCT</text>
                    <text x="345" y="150" fill="#3b82f6" fontSize="8" fontWeight="extrabold" stroke="none" textAnchor="middle" transform="rotate(-90 345 150)">SA-4 800 CFM</text>
                  </g>
                )}

                {/* 7. RENDER SAVED MARKUPS */}
                {coordinationMarkups.map((markup) => {
                  const item = rfis.find(r => r.id === markup.itemId) || issues.find(i => i.id === markup.itemId) || clashResults.find(c => c.id === markup.itemId);
                  const primaryService = item?.service || item?.service1 || "Architectural";
                  const color = serviceColors[primaryService] || "#ef4444";
                  const isSelected = markup.id === coordinationSelectedMarkupId;
                  const markupCategory = markup.itemId?.startsWith("RFI-") ? "rfi" : markup.itemId?.startsWith("ISS-") ? "issue" : markup.itemId?.startsWith("CL-") ? "clashes" : null;
                  const isActiveCategory = !markupCategory || activeRfiTab === markupCategory;
                  const markupOpacity = isActiveCategory || isSelected ? 1 : 0.18;
                  const inactiveStroke = isActiveCategory || isSelected ? color : "#94a3b8";
                  
                  return (
                    <g
                      key={markup.id}
                      opacity={markupOpacity}
                      style={{ transition: "opacity 0.18s ease, filter 0.18s ease" }}
                      filter={isActiveCategory || isSelected ? undefined : "grayscale(0.7)"}
                    >
                      {markup.type === "cloud" && (
                        <path 
                          d={getCloudPath(markup.x, markup.y, markup.width, markup.height)} 
                          fill="none" 
                          stroke={inactiveStroke} 
                          strokeWidth={isSelected || isActiveCategory ? "3" : "1.5"}
                        />
                      )}
                      
                      {markup.type === "rect" && (
                        <rect 
                          x={markup.x} 
                          y={markup.y} 
                          width={markup.width} 
                          height={markup.height} 
                          fill={isActiveCategory || isSelected ? "rgba(59, 130, 246, 0.03)" : "rgba(148, 163, 184, 0.03)"}
                          stroke={inactiveStroke} 
                          strokeWidth={isSelected || isActiveCategory ? "3" : "1.5"}
                          strokeDasharray="4 3"
                        />
                      )}
                      
                      {markup.type === "circle" && (
                        <circle 
                          cx={markup.x + (markup.width/2 || 0)} 
                          cy={markup.y + (markup.height/2 || 0)} 
                          r={markup.radius || 25} 
                          fill="none" 
                          stroke={inactiveStroke} 
                          strokeWidth={isSelected || isActiveCategory ? "3" : "1.5"}
                        />
                      )}

                      {markup.type === "polygon" && markup.points && markup.points.length >= 3 && (
                        <polygon
                          points={markup.points.map((point: Point) => `${point.x},${point.y}`).join(" ")}
                          fill={isActiveCategory || isSelected ? "rgba(59, 130, 246, 0.04)" : "rgba(148, 163, 184, 0.03)"}
                          stroke={inactiveStroke}
                          strokeWidth={isSelected || isActiveCategory ? "3" : "1.5"}
                          strokeLinejoin="round"
                        />
                      )}

                      {markup.type === "line" && markup.points && markup.points.length >= 2 && (
                        <line
                          x1={markup.points[0].x}
                          y1={markup.points[0].y}
                          x2={markup.points[1].x}
                          y2={markup.points[1].y}
                          stroke={inactiveStroke}
                          strokeWidth={isSelected || isActiveCategory ? "3.5" : "1.5"}
                          strokeLinecap="round"
                        />
                      )}
                      
                      {markup.type === "arrow" && (
                        <g>
                          <defs>
                            <marker 
                              id={`arrow-head-${markup.id}`} 
                              markerWidth="8" 
                              markerHeight="6" 
                              refX="6" 
                              refY="3" 
                              orient="auto"
                            >
                              <polygon points="0,0 8,3 0,6" fill={inactiveStroke} />
                            </marker>
                          </defs>
                          {markup.points && markup.points.length >= 2 && (
                            <line 
                              x1={markup.points[0].x} 
                              y1={markup.points[0].y} 
                              x2={markup.points[1].x} 
                              y2={markup.points[1].y} 
                              stroke={inactiveStroke} 
                              strokeWidth={isSelected || isActiveCategory ? "3.5" : "1.5"} 
                              markerEnd={`url(#arrow-head-${markup.id})`}
                            />
                          )}
                        </g>
                      )}

                      {/* Hardcoded Arrows / Extras for initial markups to match user sketches */}
                      {markup.id === "markup-1" && (
                        <g>
                          <defs>
                            <marker id="arrow-sub-1" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                              <polygon points="0,0 8,3 0,6" fill={inactiveStroke} />
                            </marker>
                          </defs>
                          <line x1="535" y1="320" x2="535" y2="150" stroke={inactiveStroke} strokeWidth={isActiveCategory || isSelected ? "2.5" : "1.5"} markerEnd="url(#arrow-sub-1)" />
                          
                          {/* Label overlay */}
                          <g transform="translate(535, 130)">
                            <rect x="-55" y="-10" width="110" height="18" rx="4" fill="white" stroke={isActiveCategory || isSelected ? "#cbd5e1" : "#e2e8f0"} strokeWidth="1" className="" />
                            <text textAnchor="middle" y="2" fill={isActiveCategory || isSelected ? "#334155" : "#94a3b8"} fontSize="8" fontWeight="bold" stroke="none">Move & rotate 90</text>
                          </g>
                        </g>
                      )}

                      {markup.id === "markup-2" && (
                        <g>
                          <defs>
                            <marker id="arrow-sub-2" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto">
                              <polygon points="0,0 8,3 0,6" fill={inactiveStroke} />
                            </marker>
                          </defs>
                          <line x1="555" y1="130" x2="675" y2="105" stroke={inactiveStroke} strokeWidth={isActiveCategory || isSelected ? "2.5" : "1.5"} markerEnd="url(#arrow-sub-2)" />
                          
                          {/* Label overlay */}
                          <g transform="translate(615, 85)">
                            <rect x="-45" y="-10" width="90" height="18" rx="4" fill="white" stroke={isActiveCategory || isSelected ? "#cbd5e1" : "#e2e8f0"} strokeWidth="1" className="" />
                            <text textAnchor="middle" y="2" fill={isActiveCategory || isSelected ? "#334155" : "#94a3b8"} fontSize="8" fontWeight="bold" stroke="none">add box to duct</text>
                          </g>
                        </g>
                      )}

                      {/* Figma Comment Pin */}
                      {(() => {
                        const cx = markup.x + (markup.width || 0) / 2;
                        const cy = markup.y + (markup.height || 0) / 2;
                        
                        return (
                          <g 
                            transform={`translate(${cx}, ${cy})`}
                            className="cursor-pointer group/bubble"
                            onClick={(e) => {
                              e.stopPropagation();
                              zoomToMarkup(markup);
                            }}
                          >
                            {isSelected && (
                              <circle r="20" fill="none" stroke={color} strokeWidth="1.5" className="animate-pulse" opacity="0.5" />
                            )}
                            <circle r="15" fill="rgba(255, 255, 255, 0.9)" className="opacity-0 group-hover/bubble:opacity-100 transition-opacity" />
                            <circle r="11" fill={isSelected ? "#7c3aed" : inactiveStroke} stroke="#ffffff" strokeWidth="2" className="shadow-md" />
                            <path d="M-4 9 L0 14 L4 9 Z" fill={isSelected ? "#7c3aed" : inactiveStroke} stroke="#ffffff" strokeWidth="1" />
                            <text y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="extrabold" stroke="none">
                              {item ? item.id.split('-')[1] : "💬"}
                            </text>
                          </g>
                        );
                      })()}
                    </g>
                  );
                })}

                {/* 8. RENDER DYNAMIC MARKUP PREVIEW WHILE DRAWING */}
                {isDrawingMarkup && coordinationDrawingPoints.length >= 2 && (
                  <g>
                    {coordinationActiveMarkupTool === "rect" && (
                      <rect 
                        x={Math.min(coordinationDrawingPoints[0].x, coordinationDrawingPoints[1].x)}
                        y={Math.min(coordinationDrawingPoints[0].y, coordinationDrawingPoints[1].y)}
                        width={Math.abs(coordinationDrawingPoints[1].x - coordinationDrawingPoints[0].x)}
                        height={Math.abs(coordinationDrawingPoints[1].y - coordinationDrawingPoints[0].y)}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}
                    
                    {coordinationActiveMarkupTool === "circle" && (
                      <circle 
                        cx={coordinationDrawingPoints[0].x}
                        cy={coordinationDrawingPoints[0].y}
                        r={Math.sqrt(
                          Math.pow(coordinationDrawingPoints[1].x - coordinationDrawingPoints[0].x, 2) + 
                          Math.pow(coordinationDrawingPoints[1].y - coordinationDrawingPoints[0].y, 2)
                        )}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                    )}
                    
                    {coordinationActiveMarkupTool === "cloud" && (
                      <path 
                        d={getCloudPath(
                          Math.min(coordinationDrawingPoints[0].x, coordinationDrawingPoints[1].x),
                          Math.min(coordinationDrawingPoints[0].y, coordinationDrawingPoints[1].y),
                          Math.max(15, Math.abs(coordinationDrawingPoints[1].x - coordinationDrawingPoints[0].x)),
                          Math.max(15, Math.abs(coordinationDrawingPoints[1].y - coordinationDrawingPoints[0].y))
                        )}
                        fill="rgba(59, 130, 246, 0.05)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                      />
                    )}

                    {coordinationActiveMarkupTool === "polygon" && (
                      <polygon
                        points={getPolygonMarkupPoints(
                          Math.min(coordinationDrawingPoints[0].x, coordinationDrawingPoints[1].x),
                          Math.min(coordinationDrawingPoints[0].y, coordinationDrawingPoints[1].y),
                          Math.max(15, Math.abs(coordinationDrawingPoints[1].x - coordinationDrawingPoints[0].x)),
                          Math.max(15, Math.abs(coordinationDrawingPoints[1].y - coordinationDrawingPoints[0].y))
                        ).map((point) => `${point.x},${point.y}`).join(" ")}
                        fill="rgba(59, 130, 246, 0.1)"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeDasharray="4 4"
                      />
                    )}

                    {coordinationActiveMarkupTool === "line" && (
                      <line
                        x1={coordinationDrawingPoints[0].x}
                        y1={coordinationDrawingPoints[0].y}
                        x2={coordinationDrawingPoints[1].x}
                        y2={coordinationDrawingPoints[1].y}
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    )}
                    
                    {coordinationActiveMarkupTool === "arrow" && (
                      <g>
                        <defs>
                          <marker id="preview-arrow-head" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                            <polygon points="0,0 6,2 0,4" fill="#3b82f6" />
                          </marker>
                        </defs>
                        <line 
                          x1={coordinationDrawingPoints[0].x}
                          y1={coordinationDrawingPoints[0].y}
                          x2={coordinationDrawingPoints[1].x}
                          y2={coordinationDrawingPoints[1].y}
                          stroke="#3b82f6"
                          strokeWidth="2"
                          markerEnd="url(#preview-arrow-head)"
                        />
                      </g>
                    )}
                  </g>
                )}
              </svg>
            </div>



            {/* B. Floating Instruction Banner (for Linking Mode) */}
            {pendingMarkupItemId && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-amber-500 text-white font-bold text-[11px] px-4 py-2 rounded-2xl shadow-lg z-25 flex items-center gap-2 animate-bounce">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>Linking Mode: Draw a markup on the drawing to link with {pendingMarkupItemId}</span>
                <button 
                  onClick={() => setPendingMarkupItemId(null)}
                  className="ml-2 hover:bg-amber-600 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* D. Figma Inline Comment Creation Popover */}
            {(() => {
              if (!pendingNewMarkupComment) return null;
              const cx = pendingNewMarkupComment.x + (pendingNewMarkupComment.width || 0) / 2;
              const cy = pendingNewMarkupComment.y + (pendingNewMarkupComment.height || 0) / 2;
              const leftPx = coordinationPan.x + (cx - 400) * coordinationZoom;
              const topPx = coordinationPan.y + (cy - 250) * coordinationZoom - 12;
              return (
                <div 
                  className="absolute z-50 w-80 bg-white border border-slate-100/80 rounded-2xl shadow-[0_18px_55px_rgba(15,23,42,0.16)] overflow-hidden text-left flex flex-col animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -100%) translate(${leftPx}px, ${topPx}px)`,
                  }}
                >
                  {/* Popover Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                        Create Markup Thread
                      </span>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                        Classify the markup before adding it.
                      </p>
                    </div>
                    <button 
                      onClick={() => setPendingNewMarkupComment(null)}
                      className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Popover Body */}
                  <div className="p-4 space-y-3.5">
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-1 border border-slate-100">
                      {[
                        { id: "rfi", label: "RFI" },
                        { id: "issue", label: "Issue" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setNewMarkupItemType(item.id as "rfi" | "issue")}
                          className={`h-8 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                            newMarkupItemType === item.id
                              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                              : "text-slate-500 hover:bg-white"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                        {newMarkupItemType === "rfi" ? "RFI Subject" : "Issue Subject"}
                      </label>
                      <textarea
                        value={newMarkupCommentText}
                        onChange={(e) => setNewMarkupCommentText(e.target.value)}
                        placeholder={newMarkupItemType === "rfi" ? "Describe the coordination question..." : "Describe the clash or defect..."}
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-[13px] font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-slate-800 resize-none placeholder:text-slate-400"
                        autoFocus
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Service</label>
                        <select
                          value={newItemService}
                          onChange={(e) => setNewItemService(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100/80 rounded-xl px-2.5 py-1.5 text-[11px] font-bold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 cursor-pointer"
                        >
                          {Object.keys(serviceColors).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-wider">Priority</label>
                        <select
                          value={newItemPriority}
                          onChange={(e) => setNewItemPriority(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100/80 rounded-xl px-2.5 py-1.5 text-[11px] font-bold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800 cursor-pointer"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Popover Footer */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                    <button 
                      onClick={() => setPendingNewMarkupComment(null)}
                      className="px-3 py-1.5 hover:bg-slate-150 rounded-xl text-slate-600 font-bold text-[11px] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        if (!newMarkupCommentText.trim()) {
                          triggerToast("Please enter a description first");
                          return;
                        }
                        
                        const newMarkupId = `markup-${Date.now()}`;
                        const nextId = newMarkupItemType === "rfi" ? `RFI-${100 + rfis.length + 1}` : `ISS-${300 + issues.length + 1}`;
                        
                        // 1. Create RFI/Issue entry
                        const newItem = { 
                          id: nextId, 
                          title: newMarkupCommentText, 
                          service: newItemService, 
                          priority: newItemPriority, 
                          status: "Open", 
                          assignee: "Snehasis Mohapatra", 
                          due: "2026-06-15" 
                        };

                        if (newMarkupItemType === "rfi") {
                          setRfis(prev => [newItem, ...prev]);
                        } else {
                          setIssues(prev => [newItem, ...prev]);
                        }

                        // 2. Create markup linked to this item
                        const newMarkup: any = {
                          id: newMarkupId,
                          itemId: nextId,
                          type: pendingNewMarkupComment.type,
                          x: pendingNewMarkupComment.x,
                          y: pendingNewMarkupComment.y,
                          width: pendingNewMarkupComment.width,
                          height: pendingNewMarkupComment.height,
                          radius: pendingNewMarkupComment.radius,
                          points: pendingNewMarkupComment.points,
                          arrow: pendingNewMarkupComment.arrow,
                          comments: [
                            {
                              id: `c-${Date.now()}`,
                              author: "Snehasis Mohapatra",
                              avatar: "SM",
                              time: "Just now",
                              text: newMarkupCommentText
                            }
                          ]
                        };

                        setCoordinationMarkups(prev => [...prev, newMarkup]);
                        setCoordinationSelectedMarkupId(newMarkupId);
                        setNewMarkupCommentText("");
                        setPendingNewMarkupComment(null);
                        setActiveRfiTab(newMarkupItemType);
                        setIsRfiPanelOpen(true);
                        triggerToast(`Created ${newMarkupItemType === "rfi" ? "RFI" : "Issue"} ${nextId}`, "success");
                      }}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] cursor-pointer shadow-sm shadow-blue-500/20"
                    >
                      Create {newMarkupItemType === "rfi" ? "RFI" : "Issue"}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* D. Figma Comments Popover */}
            {(() => {
              const selectedMarkup = coordinationMarkups.find(m => m.id === coordinationSelectedMarkupId);
              if (!selectedMarkup) return null;
              
              const item = rfis.find(r => r.id === selectedMarkup.itemId) || issues.find(i => i.id === selectedMarkup.itemId) || clashResults.find(c => c.id === selectedMarkup.itemId);
              const itemService = item?.service || item?.service1 || "Architectural";
              const itemTitle = item?.title || (item?.element1 && item?.element2 ? `${item.element1} vs ${item.element2}` : selectedMarkup.label);
              
              return (
                <div 
                  className="absolute z-50 w-80 max-w-[calc(100%-2rem)] bg-white border border-slate-100/80 rounded-2xl shadow-[0_18px_55px_rgba(15,23,42,0.16)] overflow-hidden text-left flex flex-col animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Popover Header */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span 
                        className="text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider font-mono shrink-0"
                        style={{ 
                          backgroundColor: `${serviceColors[itemService] || '#64748b'}20`, 
                          color: serviceColors[itemService] || '#64748b'
                        }}
                      >
                        {item?.id || "Markup"}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 truncate">
                        {itemService}
                      </span>
                    </div>
                    <button 
                      onClick={() => setCoordinationSelectedMarkupId(null)}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Popover Body / Comments list */}
                  <div className="p-3.5 max-h-48 overflow-y-auto space-y-3">
                    <h4 className="text-xs font-bold text-slate-800 leading-normal">{itemTitle}</h4>
                    
                    <div className="space-y-1.5 pt-1 border-t border-slate-50">
                      {(selectedMarkup.comments || []).map((comm: any, idx: number) => (
                        <div key={comm.id || idx} className="flex gap-2 text-left">
                          <div className="w-6 h-6 rounded-full bg-slate-150 text-slate-700 flex items-center justify-center text-[9px] font-bold shrink-0 border border-slate-100/80">
                            {comm.avatar || comm.author.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold text-slate-700">{comm.author}</span>
                              <span className="text-[8px] text-slate-400 font-semibold">{comm.time}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed break-words">{comm.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Popover Footer / Add Reply input */}
                  <div className="p-2.5 border-t border-slate-100 bg-white">
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newCommentText.trim()) return;
                        const newComm = {
                          id: `c-${Date.now()}`,
                          author: "Snehasis Mohapatra",
                          avatar: "SM",
                          time: "Just now",
                          text: newCommentText
                        };
                        setCoordinationMarkups(prev => prev.map(m => {
                          if (m.id === selectedMarkup.id) {
                            return {
                              ...m,
                              comments: [...(m.comments || []), newComm]
                            };
                          }
                          return m;
                        }));
                        setNewCommentText("");
                        triggerToast("Reply added to thread", "success");
                      }}
                      className="flex gap-1.5 items-center"
                    >
                      <input 
                        type="text"
                        placeholder="Add reply..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-100/80 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold focus:outline-none focus:border-blue-500 focus:bg-white text-slate-800"
                      />
                      <button 
                        type="submit"
                        className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })()}

            {/* A. Left Side Vertical Toolbar */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 bg-white/95 backdrop-blur border border-slate-100/80/50 p-1.5 rounded-[18px] shadow-[0_8px_30px_rgb(0,0,0,0.06)] z-25">
              {coordinationActiveBottomTool === "rfi" || coordinationActiveBottomTool === "issue" ? (
                (() => {
                  const markupTools = [
                    { id: 'pointer', icon: MousePointer, tooltip: "Select / View Comments" },
                    { id: 'cloud', icon: Cloud, tooltip: "Cloud Markup" },
                    { id: 'polygon', icon: PolygonIcon, tooltip: "Polygon Markup" },
                    { id: 'line', icon: Minus, tooltip: "Line Markup" },
                    { id: 'rect', icon: Square, tooltip: "Rectangle Markup" },
                    { id: 'circle', icon: CircleIcon, tooltip: "Circle Markup" },
                    { id: 'arrow', icon: ArrowUpRight, tooltip: "Arrow Pointer" },
                  ];
                  const activeMarkupIndex = Math.max(0, markupTools.findIndex((tool) => (
                    (tool.id === 'pointer' && coordinationActiveMarkupTool === null) || coordinationActiveMarkupTool === tool.id
                  )));

                  return (
                    <div className="relative flex flex-col gap-1.5">
                      <span
                        className="absolute left-0 top-0 z-0 h-9 w-9 rounded-xl bg-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-transform duration-300 ease-out"
                        style={{ transform: `translateY(${activeMarkupIndex * 42}px)` }}
                      />
                      {markupTools.map(tool => {
                        const isActiveTool = (tool.id === 'pointer' && coordinationActiveMarkupTool === null) || coordinationActiveMarkupTool === tool.id;
                        return (
                          <button 
                            key={tool.id}
                            onClick={() => {
                              if (tool.id === 'pointer') {
                                setCoordinationActiveMarkupTool(null);
                              } else {
                                setCoordinationActiveMarkupTool(tool.id as any);
                              }
                              triggerToast(`Activated ${tool.tooltip}`);
                            }}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 relative group/icon cursor-pointer z-10 ${
                              isActiveTool
                                ? 'text-white scale-[1.03]' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600 hover:scale-105 active:scale-95'
                            }`}
                          >
                            <tool.icon
                              className={`w-4 h-4 transition-transform duration-300 ${isActiveTool ? 'scale-110 rotate-[-6deg]' : 'group-hover/icon:scale-110'}`}
                              style={isActiveTool ? { color: "#ffffff", stroke: "#ffffff" } : undefined}
                            />
                            <span className="absolute left-12 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/icon:opacity-100 group-hover/icon:translate-x-1 transition-all duration-200 pointer-events-none z-[120]">
                              {tool.tooltip}
                            </span>
                          </button>
                        );
                      })}
                  
                      {/* Clear all markups button */}
                      <button
                        onClick={() => {
                          setCoordinationMarkups([]);
                          setCoordinationSelectedMarkupId(null);
                          setPendingNewMarkupComment(null);
                          triggerToast("Cleared all drawing markups");
                        }}
                        className="w-9 h-9 flex items-center justify-center rounded-xl text-red-500 hover:bg-red-50 hover:scale-105 active:scale-95 transition-all duration-200 relative group/icon cursor-pointer z-10"
                      >
                        <Trash2 className="w-4 h-4 transition-transform duration-200 group-hover/icon:scale-110" />
                        <span className="absolute left-12 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/icon:opacity-100 group-hover/icon:translate-x-1 transition-all duration-200 pointer-events-none z-[120]">
                          Clear Markups
                        </span>
                      </button>
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const viewTools = [
                    { id: '2d', icon: LayoutGrid, tooltip: "2D View" },
                    { id: 'bim', icon: CustomCube, tooltip: "BIM View" },
                    { id: 'walkthrough', icon: Navigation, tooltip: "Walkthrough" },
                  ];
                  const activeViewIndex = Math.max(0, viewTools.findIndex((tool) => coordinationActiveSideTool === tool.id));

                  return (
                    <div className="relative flex flex-col gap-1.5">
                      <span
                        className="absolute left-0 top-0 z-0 h-9 w-9 rounded-xl bg-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-transform duration-300 ease-out"
                        style={{ transform: `translateY(${activeViewIndex * 42}px)` }}
                      />
                      {viewTools.map(tool => {
                        const isActiveTool = coordinationActiveSideTool === tool.id;
                        return (
                          <button 
                            key={tool.id}
                            onClick={() => {
                              if (tool.id === '2d') {
                                setCoordinationActiveSideTool(tool.id);
                                setIsCoordinationCompareView(false);
                                triggerToast("Switched to 2D View");
                              } else if (tool.id === 'bim') {
                                setCoordinationActiveSideTool(tool.id);
                                setIsBimCoordinationPanelOpen(true);
                                triggerToast("Switched to BIM View");
                              } else {
                                setCoordinationActiveSideTool(tool.id);
                                triggerToast(`Activated ${tool.tooltip}`);
                              }
                            }}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 relative group/icon cursor-pointer z-10 ${
                              isActiveTool ? 'text-white scale-[1.03]' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600 hover:scale-105 active:scale-95'
                            }`}
                          >
                            <tool.icon
                              className={`w-4 h-4 transition-transform duration-300 ${isActiveTool ? 'scale-110 rotate-[-6deg]' : 'group-hover/icon:scale-110'}`}
                              stroke={isActiveTool ? "#ffffff" : "currentColor"}
                              color={isActiveTool ? "#ffffff" : "currentColor"}
                            />
                            <span className="absolute left-12 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/icon:opacity-100 group-hover/icon:translate-x-1 transition-all duration-200 pointer-events-none z-[120]">
                              {tool.tooltip}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            {/* C. Top Right 3D Orientation Cube */}
            <div className="absolute top-6 right-6 z-25 flex flex-col items-center gap-3">
              <div className="w-16 h-16 relative perspective-[1000px] flex items-center justify-center transform-gpu cursor-pointer" onClick={() => triggerToast("Reset cam view to standard Isometric front")}>
                <div className="w-12 h-12 bg-white border border-slate-100/80  flex items-center justify-center text-[10px] font-bold text-blue-605 transform-gpu rotate-x-[-15deg] rotate-y-[15deg] hover:bg-slate-50 transition-colors">
                  Front
                </div>
                <div className="absolute -bottom-4 w-12 h-4 bg-slate-900/10 rounded-[100%] blur-[2px]"></div>
                <div className="absolute -bottom-3 w-10 h-10 border-2 border-slate-300/40 rounded-full transform rotate-x-[75deg]"></div>
              </div>
            </div>

            {/* E. Bottom Center Toolbar */}
            {(() => {
              const subToolGroups: Record<string, Array<{ id: string; label: string; icon: any; action?: () => void }>> = {
                clipper: [
                  { id: "box", label: "Box", icon: Box },
                  { id: "section", label: "Section", icon: Square },
                  { id: "reset-clip", label: "Clear", icon: RotateCcw }
                ],
                environment: [
                  { id: "sunlight", label: "Sun", icon: Sun },
                  { id: "ambient", label: "Ambient", icon: Sparkles },
                  { id: "shadows", label: "Shadows", icon: CircleIcon }
                ],
                measure: [
                  { id: "length", label: "Length", icon: Ruler },
                  { id: "area", label: "Area", icon: Square }
                ],
                maplayers: [
                  { id: "road", label: "Road Map", icon: MapPin },
                  { id: "aerial", label: "Aerial", icon: Globe },
                  { id: "building", label: "Building", icon: Home },
                  { id: "drone-overlay", label: "Drone Overlay", icon: Camera },
                  { id: "drone-building", label: "Drone Building", icon: Box }
                ],
                views: [
                  { id: "top", label: "Top", icon: Compass },
                  { id: "front", label: "Front", icon: CustomCube },
                  { id: "fpp", label: "FPP", icon: Navigation },
                  { id: "tpp", label: "TPP", icon: Activity }
                ]
              };
              const activeSubTools = subToolGroups[coordinationActiveBottomTool] || [];

              return (
                <>
                  {coordinationActiveBottomTool === "zoom" && (
                    <div className="absolute bottom-[4.75rem] left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-slate-100/80 px-2.5 py-2 rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.10)] z-30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200">
                      <button
                        onClick={() => {
                          setCoordinationZoom((prev) => Math.max(0.5, +(prev - 0.1).toFixed(2)));
                          triggerToast("Zoomed out");
                        }}
                        className="h-8 w-8 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group/subtool"
                        title="Zoom out"
                      >
                        <Minus className="w-3.5 h-3.5 transition-transform duration-200 group-hover/subtool:scale-110" />
                      </button>
                      <div className="flex items-center gap-2 px-1">
                        <span className="w-10 text-right text-[10px] font-extrabold text-slate-500 tabular-nums">
                          {Math.round(coordinationZoom * 100)}%
                        </span>
                        <input
                          type="range"
                          min="50"
                          max="500"
                          step="5"
                          value={Math.round(coordinationZoom * 100)}
                          onChange={(event) => setCoordinationZoom(Number(event.target.value) / 100)}
                          className="w-36 accent-blue-600 cursor-pointer"
                          aria-label="Zoom level"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setCoordinationZoom((prev) => Math.min(5, +(prev + 0.1).toFixed(2)));
                          triggerToast("Zoomed in");
                        }}
                        className="h-8 w-8 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group/subtool"
                        title="Zoom in"
                      >
                        <Plus className="w-3.5 h-3.5 transition-transform duration-200 group-hover/subtool:scale-110" />
                      </button>
                      <div className="h-6 w-px bg-slate-200 mx-0.5" />
                      <button
                        onClick={() => {
                          setCoordinationZoom(1);
                          setCoordinationPan({ x: 0, y: 0 });
                          triggerToast("Reset zoom view");
                        }}
                        className="h-8 px-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 text-[10px] font-extrabold transition-all duration-200 cursor-pointer active:scale-95 group/subtool"
                      >
                        <RotateCcw className="w-3.5 h-3.5 transition-transform duration-200 group-hover/subtool:scale-110" />
                        <span>Reset</span>
                      </button>
                      <button
                        onClick={() => {
                          setCoordinationZoom(0.92);
                          setCoordinationPan({ x: 0, y: 0 });
                          triggerToast("Fit view to screen");
                        }}
                        className="h-8 px-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 text-[10px] font-extrabold transition-all duration-200 cursor-pointer active:scale-95 group/subtool"
                      >
                        <Maximize2 className="w-3.5 h-3.5 transition-transform duration-200 group-hover/subtool:scale-110" />
                        <span>Fit</span>
                      </button>
                      <div className="h-6 w-px bg-slate-200 mx-0.5" />
                      <button
                        onClick={() => {
                          setShowCoordinationRulers(!showCoordinationRulers);
                          triggerToast(showCoordinationRulers ? "Coordination rulers hidden" : "Coordination rulers shown");
                        }}
                        className={`h-8 px-2.5 rounded-xl flex items-center gap-1.5 text-[10px] font-extrabold transition-all duration-200 cursor-pointer active:scale-95 group/subtool ${
                          showCoordinationRulers
                            ? "bg-blue-50 text-blue-600 font-extrabold"
                            : "text-slate-600 hover:text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        <Ruler className="w-3.5 h-3.5 transition-transform duration-200 group-hover/subtool:scale-110" />
                        <span>Rulers</span>
                      </button>
                    </div>
                  )}
                  {activeSubTools.length > 0 && (
                    <div className="absolute bottom-[4.75rem] left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-slate-100/80 px-2 py-1.5 rounded-2xl shadow-[0_14px_40px_rgba(15,23,42,0.10)] z-30 flex items-center gap-1 animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200">
                      {activeSubTools.map((subTool) => (
                        <button
                          key={subTool.id}
                          onClick={() => {
                            subTool.action?.();
                            triggerToast(`Activated ${subTool.label}`);
                          }}
                          className="h-8 px-2.5 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 flex items-center gap-1.5 text-[10px] font-extrabold transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:shadow-sm active:scale-95 group/subtool"
                        >
                          <subTool.icon className="w-3.5 h-3.5 transition-transform duration-200 group-hover/subtool:scale-110 group-hover/subtool:-rotate-3" />
                          <span>{subTool.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur border border-slate-100/80 px-2 py-1.5 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.06)] z-25 flex items-center gap-1 transition-all duration-300 hover:shadow-[0_18px_55px_rgba(15,23,42,0.12)]">
              {[
                { id: 'home', icon: LayoutGrid, label: "", tooltip: "Home View" },
                { id: 'clipper', icon: Box, label: "", tooltip: "Clipper Box" },
                { id: 'environment', icon: Sun, label: "", tooltip: "Environmental Light Control" },
                { id: 'measure', icon: Ruler, label: "", tooltip: "Measurement Tools" },
                { id: 'maplayers', icon: Layers, label: "", tooltip: "Map Layers" },
                { id: 'split', icon: Columns, label: "", tooltip: "Split Screen" },
                { id: 'views', icon: Compass, label: "", tooltip: "Views Control" },
                { id: 'pointer', icon: MousePointer, label: "", tooltip: "Select Tool" },
                { id: 'hand', icon: Hand, label: "", tooltip: "Pan Model Tool" },
                { id: 'zoom', icon: Scaling, label: "", tooltip: "Zoom Controls" },
                { id: 'rfi', icon: null, label: 'RFI', tooltip: "Toggle RFI List Panel" },
                { id: 'issue', icon: null, label: 'Issue', tooltip: "Toggle Issues List Panel" },
                { id: 'pdf', icon: FileDown, label: "", tooltip: "Export View to PDF" },
              ].map(tool => {
                const isRfiOrIssue = tool.id === 'rfi' || tool.id === 'issue';
                const isActive = isRfiOrIssue 
                  ? coordinationActiveBottomTool === tool.id
                  : coordinationActiveBottomTool === tool.id;
                
                return (
                  <button 
                    key={tool.id}
                    onClick={() => {
                      if (isRfiOrIssue) {
                        if (coordinationActiveBottomTool === tool.id) {
                          setIsRfiPanelOpen(false);
                          setCoordinationActiveBottomTool("");
                          setCoordinationActiveMarkupTool(null);
                          triggerToast(`${tool.label} mode deactivated`);
                        } else {
                          setIsRfiPanelOpen(true);
                          setActiveRfiTab(tool.id as "rfi" | "issue");
                          setCoordinationActiveBottomTool(tool.id);
                          setCoordinationActiveMarkupTool(null);
                          triggerToast(`${tool.label} mode activated`);
                        }
                      } else {
                        if (tool.id === 'pdf') {
                          exportViewToPdf();
                        } else if (tool.id === 'split') {
                          setIsSplitWorkspaceLoaded(true);
                          setSplitLeftView("bim");
                          setSplitRightView("drawing");
                          setSplitActivePane("right");
                          setCoordinationActiveBottomTool("");
                          setIsRfiPanelOpen(false);
                          setActiveTab("split");
                          triggerToast("Split Screen: current BIM view loaded on A, choose B from the layer panel");
                        } else if (tool.id === 'pan' || tool.id === 'hand') {
                          const isAlreadyActive = coordinationActiveBottomTool === tool.id;
                          setCoordinationActiveBottomTool(isAlreadyActive ? "" : tool.id);
                          triggerToast(isAlreadyActive ? "Pan tool deactivated" : "Pan tool activated");
                        } else {
                          const isAlreadyActive = coordinationActiveBottomTool === tool.id;
                          setCoordinationActiveBottomTool(isAlreadyActive ? "" : tool.id);
                          triggerToast(isAlreadyActive ? `${tool.tooltip} deactivated` : `Activated ${tool.tooltip}`);
                        }
                      }
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 ease-out text-xs font-bold relative group/bottom cursor-pointer active:scale-90 hover:-translate-y-1 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] scale-105 ring-2 ring-blue-100' 
                        : 'text-slate-655 hover:bg-slate-50 hover:shadow-sm'
                    }`}
                  >
                    {tool.icon && (
                      <tool.icon
                        className="w-3.5 h-3.5 transition-transform duration-200 group-hover/bottom:scale-115 group-hover/bottom:-rotate-6 group-active/bottom:scale-95"
                        style={isActive ? { color: "#ffffff", stroke: "#ffffff" } : undefined}
                      />
                    )}
                    {tool.label && <span>{tool.label}</span>}
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current opacity-80" />
                    )}
                    
                    {/* Tooltip */}
                    <span className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/bottom:opacity-100 transition-opacity pointer-events-none z-[120]">
                      {tool.tooltip}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Figma Rulers & Guidelines for Coordination Workspace
                Temporarily disabled: hides the top/left ruler strips and red guide lines. */}
            {false && showCoordinationRulers && (
              <>
                {/* Top Ruler */}
                <div
                  className="absolute top-0 left-0 right-0 h-6 bg-slate-50/95 backdrop-blur border-b border-slate-200 z-30 select-none overflow-hidden cursor-ns-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const rect = coordinationViewportRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const mouseY = e.clientY - rect.top;
                    const Cy = coordinationViewportDimensions.height / 2;
                    const coord = BASE_COORD + ((mouseY - Cy - coordinationPan.y) / coordinationZoom) * UNITS_PER_PIXEL;
                    const id = `c-guide-h-${Date.now()}`;
                    setGuidelinesCoordination(prev => [...prev, { id, type: "h", coord }]);
                    setDraggingCoordinationGuide({ id, type: "h", isNew: true });
                  }}
                >
                  {(() => {
                    const ticks = [];
                    const W = coordinationViewportDimensions.width;
                    const Cx = W / 2;
                    const zoom = coordinationZoom;
                    const panX = coordinationPan.x;
                    const stepUnit = getRulerSteps(zoom);
                    const startCoord = BASE_COORD + ((0 - Cx - panX) / zoom) * UNITS_PER_PIXEL;
                    const endCoord = BASE_COORD + ((W - Cx - panX) / zoom) * UNITS_PER_PIXEL;
                    const subStep = stepUnit / 5;

                    for (let coord = Math.floor(startCoord / subStep) * subStep; coord <= endCoord; coord += subStep) {
                      const isMajor = Math.abs((coord / stepUnit) - Math.round(coord / stepUnit)) < 0.01;
                      const x = Cx + panX + ((coord - BASE_COORD) / UNITS_PER_PIXEL) * zoom;
                      if (x >= 24 && x <= W) {
                        ticks.push(
                          <div
                            key={`c-h-tick-${coord}`}
                            className="absolute bg-slate-350"
                            style={{
                              left: `${x}px`,
                              bottom: "0px",
                              width: "1px",
                              height: isMajor ? "10px" : "4px"
                            }}
                          />
                        );
                        if (isMajor) {
                          ticks.push(
                            <div
                              key={`c-h-lbl-${coord}`}
                              className="absolute text-[8px] font-mono text-slate-500 font-bold leading-none"
                              style={{
                                left: `${x + 3}px`,
                                top: "3px"
                              }}
                            >
                              {Math.round(coord)}
                            </div>
                          );
                        }
                      }
                    }
                    return ticks;
                  })()}
                  {hoveredCoordinationCanvasPos && hoveredCoordinationCanvasPos.x >= 24 && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-blue-500/50 pointer-events-none"
                      style={{ left: `${hoveredCoordinationCanvasPos.x}px` }}
                    />
                  )}
                </div>

                {/* Left Ruler */}
                <div
                  className="absolute top-0 left-0 bottom-0 w-6 bg-slate-55/90 backdrop-blur border-r border-slate-200 z-30 select-none overflow-hidden cursor-ew-resize"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const rect = coordinationViewportRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    const mouseX = e.clientX - rect.left;
                    const Cx = coordinationViewportDimensions.width / 2;
                    const coord = BASE_COORD + ((mouseX - Cx - coordinationPan.x) / coordinationZoom) * UNITS_PER_PIXEL;
                    const id = `c-guide-v-${Date.now()}`;
                    setGuidelinesCoordination(prev => [...prev, { id, type: "v", coord }]);
                    setDraggingCoordinationGuide({ id, type: "v", isNew: true });
                  }}
                >
                  {(() => {
                    const ticks = [];
                    const H = coordinationViewportDimensions.height;
                    const Cy = H / 2;
                    const zoom = coordinationZoom;
                    const panY = coordinationPan.y;
                    const stepUnit = getRulerSteps(zoom);
                    const startCoord = BASE_COORD + ((0 - Cy - panY) / zoom) * UNITS_PER_PIXEL;
                    const endCoord = BASE_COORD + ((H - Cy - panY) / zoom) * UNITS_PER_PIXEL;
                    const subStep = stepUnit / 5;

                    for (let coord = Math.floor(startCoord / subStep) * subStep; coord <= endCoord; coord += subStep) {
                      const isMajor = Math.abs((coord / stepUnit) - Math.round(coord / stepUnit)) < 0.01;
                      const y = Cy + panY + ((coord - BASE_COORD) / UNITS_PER_PIXEL) * zoom;
                      if (y >= 24 && y <= H) {
                        ticks.push(
                          <div
                            key={`c-v-tick-${coord}`}
                            className="absolute bg-slate-350"
                            style={{
                              top: `${y}px`,
                              right: "0px",
                              height: "1px",
                              width: isMajor ? "10px" : "4px"
                            }}
                          />
                        );
                        if (isMajor) {
                          ticks.push(
                            <div
                              key={`c-v-lbl-${coord}`}
                              className="absolute text-[8px] font-mono text-slate-500 font-bold leading-none origin-top-left -rotate-90"
                              style={{
                                top: `${y + 3}px`,
                                left: "3px"
                              }}
                            >
                              {Math.round(coord)}
                            </div>
                          );
                        }
                      }
                    }
                    return ticks;
                  })()}
                  {hoveredCoordinationCanvasPos && hoveredCoordinationCanvasPos.y >= 24 && (
                    <div
                      className="absolute left-0 right-0 h-px bg-blue-500/50 pointer-events-none"
                      style={{ top: `${hoveredCoordinationCanvasPos.y}px` }}
                    />
                  )}
                </div>

                {/* Top-Left Corner Box */}
                <div className="absolute top-0 left-0 w-6 h-6 bg-slate-100 border-r border-b border-slate-200 z-45 flex items-center justify-center text-[7px] text-slate-400 font-extrabold select-none">
                  R
                </div>

                {/* Guidelines render overlay */}
                {coordinationGuidelines.map((g) => {
                  if (g.type === "v") {
                    const Cx = coordinationViewportDimensions.width / 2;
                    const x = Cx + coordinationPan.x + ((g.coord - BASE_COORD) / UNITS_PER_PIXEL) * coordinationZoom;
                    if (x < 24 || x > coordinationViewportDimensions.width) return null;

                    const isDraggingThis = draggingCoordinationGuide?.id === g.id;

                    return (
                      <div
                        key={g.id}
                        className={`absolute top-0 bottom-0 w-1.5 -translate-x-[2px] cursor-ew-resize z-20 group`}
                        style={{ left: `${x}px` }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingCoordinationGuide({ id: g.id, type: "v", isNew: false });
                        }}
                      >
                        <div className={`w-0.5 h-full mx-auto ${isDraggingThis ? "bg-rose-650 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-rose-500 group-hover:bg-rose-600"}`} />
                        <div className="absolute top-8 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-rose-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 z-30 whitespace-nowrap pointer-events-auto">
                          <span>X: {Math.round(g.coord)}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGuidelinesCoordination(prev => prev.filter(item => item.id !== g.id));
                              triggerToast("Coordination guideline removed");
                            }}
                            className="hover:bg-white/20 rounded p-0.5 cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    const Cy = coordinationViewportDimensions.height / 2;
                    const y = Cy + coordinationPan.y + ((g.coord - BASE_COORD) / UNITS_PER_PIXEL) * coordinationZoom;
                    if (y < 24 || y > coordinationViewportDimensions.height) return null;

                    const isDraggingThis = draggingCoordinationGuide?.id === g.id;

                    return (
                      <div
                        key={g.id}
                        className={`absolute left-0 right-0 h-1.5 -translate-y-[2px] cursor-ns-resize z-20 group`}
                        style={{ top: `${y}px` }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setDraggingCoordinationGuide({ id: g.id, type: "h", isNew: false });
                        }}
                      >
                        <div className={`h-0.5 w-full my-auto ${isDraggingThis ? "bg-rose-650 shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-rose-500 group-hover:bg-rose-600"}`} />
                        <div className="absolute left-8 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-rose-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-1 z-30 whitespace-nowrap pointer-events-auto">
                          <span>Y: {Math.round(g.coord)}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGuidelinesCoordination(prev => prev.filter(item => item.id !== g.id));
                              triggerToast("Coordination guideline removed");
                            }}
                            className="hover:bg-white/20 rounded p-0.5 cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    );
                  }
                })}
              </>
            )}
          </div>

          {isSpotlightDropdownOpen && (activeTab === "split" || (isBimCoordinationPanelOpen && !isCoordinationMaxView && !isCoordinationSetupReferenceMode)) && (
            <div
              className="absolute top-20 w-72 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.08),0_0_0_1px_rgba(0,0,0,0.02)] overflow-hidden z-[70] animate-in fade-in slide-in-from-right-2 text-left"
              style={{
                right: activeTab === "split" ? "16px" : `${bimCoordinationPanelWidth + 8}px`
              }}
            >
              {/* Header: User Profile / Host State */}
              <div className="p-3.5 border-b border-slate-100/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-650 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                      RC
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-slate-800 leading-tight truncate">Rudra Codekart (you)</p>
                    <p className="text-[8px] font-bold text-indigo-600 uppercase tracking-widest mt-0.5">Host Viewport</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSpotlightDropdownOpen(false)}
                  className="p-1.5 rounded-full flex items-center justify-center hover:bg-slate-100/60 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Action Area: Broadcast View / Spotlight Me */}
              <div className="p-3 border-b border-slate-100/80 bg-slate-50/40">
                <button
                  onClick={() => {
                    setIsSpotlightOpen(true);
                    setIsSpotlightDropdownOpen(false);
                    triggerToast("Spotlight active: followers now track your viewport");
                  }}
                  className="w-full h-8.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.2)] flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-98"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping shrink-0" />
                  Spotlight Me
                </button>
              </div>

              {/* Search & Filter Viewers */}
              <div className="p-3 border-b border-slate-100/80">
                <div className="flex items-center gap-2 h-8 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 transition-all focus-within:border-indigo-400 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.08)]">
                  <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search active viewers..."
                    className="w-full bg-transparent text-[10px] font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Scrollable Viewers List */}
              <div className="max-h-64 overflow-y-auto p-2 space-y-3">
                <div className="space-y-1">
                  <p className="px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Currently Viewing</p>
                  <button
                    onClick={() => {
                      triggerToast("Now following Debashish Jena's viewport");
                      setIsSpotlightDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between gap-2 rounded-xl px-2 py-2 hover:bg-slate-50 transition-all cursor-pointer text-left border border-transparent hover:border-slate-100 group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <div className="h-7 w-7 rounded-full bg-[#facc15] text-slate-900 flex items-center justify-center text-[10px] font-black">D</div>
                        <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-extrabold text-slate-800 truncate group-hover:text-indigo-650 transition-colors">Debashish Jena</p>
                        <p className="text-[8.5px] font-medium text-slate-400">Viewing your viewport</p>
                      </div>
                    </div>
                    <span className="shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[7.5px] px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider animate-pulse">
                      Live
                    </span>
                  </button>
                </div>

                <div className="space-y-1">
                  <p className="px-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">Previously Active</p>
                  {[
                    { initials: "I", name: "intelbim.bibhu", time: "1 hour ago", color: "#15803d" },
                    { initials: "G", name: "Guru Narayan Dash", time: "3 hours ago", color: "#be185d" },
                    { initials: "A", name: "Anil Patra", time: "4 hours ago", color: "#475569" },
                    { initials: "A", name: "Adil Rashid", time: "4 hours ago", color: "#a21caf" }
                  ].map((member) => (
                    <button
                      key={member.name}
                      onClick={() => {
                        triggerToast(`Opened ${member.name}'s last viewed model state`);
                        setIsSpotlightDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-slate-50 transition-colors cursor-pointer text-left border border-transparent hover:border-slate-100 group"
                    >
                      <div
                        className="h-7 w-7 rounded-full text-white flex items-center justify-center text-[10px] font-black shrink-0"
                        style={{ backgroundColor: member.color }}
                      >
                        {member.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-extrabold text-slate-700 truncate group-hover:text-slate-900 transition-colors">{member.name}</p>
                        <p className="text-[8px] font-semibold text-slate-400">{member.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!isCoordinationMaxView && isBimCoordinationPanelOpen && (
            <div
              className="relative h-full bg-white flex flex-col shrink-0 z-35 select-none"
              style={{ width: `${bimCoordinationPanelWidth}px` }}
            >
              <div
                onMouseDown={(event) => {
                  event.preventDefault();
                  setIsResizingBimPanel(true);
                }}
                className="absolute left-0 top-0 h-full w-2 -translate-x-1/2 cursor-col-resize z-50 group/resize"
                title="Drag to resize layer panel"
              >
                <div className="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover/resize:opacity-40" />
              </div>
              
              {/* Top Spotlight Header Row */}
              <div className="px-3 py-2.5 bg-white border-b border-slate-100 flex flex-col shrink-0 text-left">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => {
                      if (isCoordinationSetupReferenceMode) {
                        triggerToast("No live viewport available before setup");
                        return;
                      }
                      setIsSpotlightDropdownOpen(!isSpotlightDropdownOpen);
                    }}
                    className={`flex items-center gap-2 min-w-0 text-left ${isCoordinationSetupReferenceMode ? "cursor-default" : "cursor-pointer"}`}
                  >
                    <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                      {isCoordinationSetupReferenceMode ? (
                        <div className="h-5 w-5 rounded-full ring-2 ring-white bg-slate-200 text-slate-400 flex items-center justify-center text-[8px] font-black">0</div>
                      ) : (
                        <>
                          <div className="h-5 w-5 rounded-full ring-2 ring-white bg-[#eab308] text-white flex items-center justify-center text-[8px] font-black">D</div>
                          <div className="h-5 w-5 rounded-full ring-2 ring-white bg-[#f97316] text-white flex items-center justify-center text-[8px] font-black">S</div>
                          <div className="h-5 w-5 rounded-full ring-2 ring-white bg-[#8b5cf6] text-white flex items-center justify-center text-[8px] font-black">R</div>
                        </>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-extrabold text-slate-650 leading-none truncate">{isCoordinationSetupReferenceMode ? "0 live" : "3 live"}</p>
                      <p className="text-[7px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                        {isCoordinationSetupReferenceMode ? "No viewport yet" : "Following viewport"}
                      </p>
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button 
                      onClick={() => {
                        if (isCoordinationSetupReferenceMode) {
                          triggerToast("Setup a 2D or 3D view before using Spotlight");
                          return;
                        }
                        setIsSpotlightOpen(!isSpotlightOpen);
                        triggerToast(isSpotlightOpen ? "Stopped broadcasting Spotlight" : "Spotlight active: followers now track your viewport");
                      }}
                      className={`h-7 px-3 rounded-lg border font-extrabold text-[9.5px] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer  ${
                        isCoordinationSetupReferenceMode
                          ? "bg-slate-50 border-slate-100 text-slate-350 cursor-not-allowed"
                          : isSpotlightOpen 
                          ? "bg-red-50 border-red-200 text-red-650 shadow-red-100/60" 
                          : "bg-blue-600 border-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      <span>{isSpotlightOpen ? "Stop" : "Spotlight"}</span>
                    </button>
                    <button
                      onClick={() => setIsBimCoordinationPanelOpen(false)}
                      className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                      title="Close layer panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {activeRfiTab !== "clashes" && !isCoordinationSetupReferenceMode ? (
                <div className="flex-1 min-h-0 bg-white">
                  {renderCoordinationDiscussionPanel()}
                </div>
              ) : (
              /* Scrollable Tree and Visibility Manager */
              <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3 text-left bg-white">
                {isCoordinationSetupReferenceMode ? (
                  <div className="h-full min-h-[360px] flex flex-col">
                    <div className="flex items-center justify-between px-1 pb-3">
                      <h3 className="text-[18px] font-light text-slate-500 uppercase tracking-wide">Layers</h3>
                      <span className="text-[7px] font-extrabold uppercase tracking-wider text-slate-300">Empty</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-5 text-center">
                      <div className="space-y-2.5">
                        <div className="mx-auto h-10 w-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                          <Layers className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-extrabold text-slate-500">No spatial layers yet</p>
                        <p className="text-[9.5px] font-semibold text-slate-350 leading-relaxed max-w-[190px]">
                          Site boundaries, zones, levels, 2D drawings, and 3D model layers will appear after setup.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : renderCoordinationLayerPanel()}
              </div>
              )}
              
            </div>
          )}

          {!isCoordinationMaxView && !isBimCoordinationPanelOpen && (
            <button
              onClick={() => setIsBimCoordinationPanelOpen(true)}
              className="absolute right-4 bottom-4 z-40 w-10 h-10 bg-white hover:bg-slate-50 text-blue-600 border border-slate-100/80 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Open Spatial Layer Manager"
            >
              <Layers className="w-4 h-4" />
            </button>
          )}
      </div>

      {/* -------------------- TAB 4: SPLIT SCREEN WORKSPACE -------------------- */}
      {activeTab === "split" && (
        <div className="w-full h-full bg-[#eaf0f5] overflow-hidden relative select-none">
          {!isSplitWorkspaceLoaded ? (
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="w-full max-w-lg rounded-[24px] bg-white/95 backdrop-blur border border-slate-100/80 shadow-[0_24px_80px_rgba(15,23,42,0.10)] p-7 text-center micro-fade-in">
                <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Columns className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">Load your drawing</h2>
                <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                  Start Split Screen with Drawing vs Drawing. After loading, each side gets its own layer panel, side tools, and bottom toolbar.
                </p>
                <button
                  onClick={() => {
                    setIsSplitWorkspaceLoaded(true);
                    setSplitLeftView("drawing");
                    setSplitRightView("drawing");
                    setSplitActivePane("left");
                    triggerToast("Drawing vs Drawing split loaded");
                  }}
                  className="mt-5 h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  Load Drawing
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-stretch gap-0 relative">
              <div
                onMouseDown={(event) => {
                  event.preventDefault();
                  setIsResizingSplitDivider(true);
                }}
                onDoubleClick={() => setSplitPaneRatio(50)}
                className="absolute top-0 bottom-0 z-50 w-4 -translate-x-1/2 cursor-col-resize group/split"
                style={{ left: `${splitPaneRatio}%` }}
                title="Drag to resize split view. Double click to reset."
              >
                <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-blue-400/70" />
                <div className="absolute left-1/2 top-1/2 h-14 w-6 -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white/95 border border-blue-100 shadow-[0_10px_30px_rgba(37,99,235,0.20)] flex items-center justify-center opacity-90 group-hover/split:opacity-100 group-hover/split:scale-105 transition-all">
                  <GripVertical className="w-3.5 h-3.5 text-blue-600" />
                </div>
              </div>
              {(["left", "right"] as const).map((pane) => {
                const paneLabel = pane === "left" ? "A" : "B";
                const viewType = pane === "left" ? splitLeftView : splitRightView;
                const setViewType = pane === "left" ? setSplitLeftView : setSplitRightView;
                const activePaneTool = splitPaneTool[pane] || "select";
                const activeBottomTool = splitPaneBottomTool[pane] || "layers";
                const isLayerPanelOpen = splitLayerPanelOpen[pane] !== false;
                const bottomTools = [
                  { id: 'home', icon: LayoutGrid, label: "", tooltip: "Home View" },
                  { id: 'clipper', icon: Box, label: "", tooltip: "Clipper Box" },
                  { id: 'environment', icon: Sun, label: "", tooltip: "Environmental Light Control" },
                  { id: 'measure', icon: Ruler, label: "", tooltip: "Measurement Tools" },
                  { id: 'maplayers', icon: Layers, label: "", tooltip: "Map Layers" },
                  { id: 'split', icon: Columns, label: "", tooltip: "Split Screen" },
                  { id: 'views', icon: Compass, label: "", tooltip: "Views Control" },
                  { id: 'pointer', icon: MousePointer, label: "", tooltip: "Select Tool" },
                  { id: 'hand', icon: Hand, label: "", tooltip: "Pan Model Tool" },
                  { id: 'zoom', icon: Scaling, label: "", tooltip: "Zoom Controls" },
                  { id: 'pdf', icon: FileDown, label: "", tooltip: "Export View to PDF" },
                ];
                const expanded = (nodeId: string) => splitExpandedNodes[`${pane}-${nodeId}`] !== false;
                const toggleExpanded = (nodeId: string) => {
                  setSplitExpandedNodes((prev) => ({ ...prev, [`${pane}-${nodeId}`]: !expanded(nodeId) }));
                };
                const visible = (nodeId: string) => splitVisibleNodes[`${pane}-${nodeId}`] !== false;
                const toggleVisible = (nodeId: string, label: string) => {
                  const nextVisible = !visible(nodeId);
                  setSplitVisibleNodes((prev) => ({ ...prev, [`${pane}-${nodeId}`]: nextVisible }));
                  triggerToast(`${paneLabel}: ${nextVisible ? "Shown" : "Hidden"} ${label}`);
                };
                const serviceRows = [
                  { id: "arch", label: "Architectural", color: "#3b82f6" },
                  { id: "str", label: "Structural", color: "#ef4444" },
                  { id: "mech", label: "Mechanical", color: "#10b981" },
                  { id: "elec", label: "Electrical", color: "#eab308" },
                ];
                const layerPanel = (
                  <div
                    className="relative h-full bg-white/96 border-x border-slate-100/70 flex flex-col shrink-0 text-left"
                    style={{ width: `${splitLayerPanelWidth[pane]}px` }}
                  >
                    <div
                      onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        setResizingSplitPanel(pane);
                      }}
                      className={`absolute top-0 h-full w-2 cursor-col-resize z-50 group/resize ${pane === "left" ? "right-0 translate-x-1/2" : "left-0 -translate-x-1/2"}`}
                      title="Drag to resize layer panel"
                    >
                      <div className="absolute left-1/2 top-1/2 h-10 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 opacity-0 transition-opacity group-hover/resize:opacity-40" />
                    </div>
                    <div className="p-3 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Pane {paneLabel}</p>
                          <h3 className="text-sm font-extrabold text-slate-800">Layers</h3>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex rounded-xl bg-slate-100 p-0.5">
                            {(["drawing", "bim"] as const).map((type) => (
                              <button
                                key={type}
                                onClick={() => {
                                  setViewType(type);
                                  setSplitActivePane(pane);
                                  triggerToast(`Pane ${paneLabel}: ${type === "drawing" ? "Drawing" : "BIM"} selected`);
                                }}
                                className={`h-7 px-2.5 rounded-lg text-[9px] font-extrabold transition-all cursor-pointer ${
                                  viewType === type ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
                                }`}
                              >
                                {type === "drawing" ? "2D" : "BIM"}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              setSplitLayerPanelOpen((prev) => ({ ...prev, [pane]: false }));
                            }}
                            className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                            title={`Close pane ${paneLabel} layers`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1.5">
                      <div className="rounded-xl bg-blue-50/45 ring-1 ring-blue-100/70">
                        <button
                          onClick={() => toggleExpanded("site")}
                          className="w-full flex items-center gap-1.5 px-2 py-2 text-left cursor-pointer"
                        >
                          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${expanded("site") ? "" : "-rotate-90"}`} />
                          <PolygonIcon className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-[12px] font-extrabold text-slate-750 flex-1 truncate">Site Boundary A</span>
                          <button
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleVisible("site", "Site Boundary A");
                            }}
                            className="p-1 text-blue-600 hover:bg-white rounded-lg cursor-pointer"
                          >
                            {visible("site") ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          </button>
                        </button>
                      </div>
                      {expanded("site") && (
                        <div className="relative ml-2 pl-2 space-y-1 before:absolute before:left-0 before:top-0 before:bottom-1 before:w-px before:bg-slate-100">
                          <div className="rounded-lg bg-slate-50/60 px-2 py-1.5">
                            <button onClick={() => toggleExpanded("zone")} className="w-full flex items-center gap-1.5 text-left cursor-pointer">
                              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${expanded("zone") ? "" : "-rotate-90"}`} />
                              <span className="w-2 h-2 rounded-full bg-blue-500" />
                              <span className="text-[12px] font-extrabold text-slate-700 flex-1 truncate">Core Tower Zone</span>
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleVisible("zone", "Core Tower Zone");
                                }}
                                className="p-1 text-blue-600 hover:bg-white rounded-lg cursor-pointer"
                              >
                                {visible("zone") ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                              </button>
                            </button>
                          </div>
                          {expanded("zone") && (
                            <div className="relative ml-2 pl-2 space-y-1 before:absolute before:left-0 before:top-0 before:bottom-1 before:w-px before:bg-slate-100">
                              <div className="rounded-lg bg-white ring-1 ring-slate-100 px-2 py-1.5">
                                <button onClick={() => toggleExpanded("level")} className="w-full flex items-center gap-1.5 text-left cursor-pointer">
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${expanded("level") ? "" : "-rotate-90"}`} />
                                  <span className="px-1.5 py-0.5 rounded border border-slate-100 text-[8px] font-black text-slate-500">LVL</span>
                                  <span className="text-[12px] font-bold text-slate-700 flex-1 truncate">Ground Floor</span>
                                  <button
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      toggleVisible("level", "Ground Floor");
                                    }}
                                    className="p-1 text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                                  >
                                    {visible("level") ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                  </button>
                                </button>
                              </div>
                              {expanded("level") && serviceRows.map((service) => (
                                <div key={service.id} className="rounded-lg bg-white/80 ring-1 ring-slate-100 px-2 py-1.5">
                                  <button onClick={() => toggleExpanded(service.id)} className="w-full flex items-center gap-1.5 text-left cursor-pointer">
                                    <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${expanded(service.id) ? "" : "-rotate-90"}`} />
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: service.color }} />
                                    <span className="text-[12px] font-extrabold text-slate-700 flex-1 truncate">{service.label}</span>
                                    <button
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        toggleVisible(service.id, service.label);
                                      }}
                                      className="p-1 text-blue-600 hover:bg-slate-50 rounded-lg cursor-pointer"
                                    >
                                      {visible(service.id) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                    </button>
                                  </button>
                                  {expanded(service.id) && (
                                    <div className="mt-1 ml-4 space-y-1">
                                      {(viewType === "drawing" ? ["Plan Lines", "Annotations", "Hatch Fill"] : ["Geometry", "Openings", "Equipment"]).map((layer) => (
                                        <div key={layer} className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-slate-500 hover:bg-slate-50">
                                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: service.color }} />
                                          <span className="text-[11px] font-bold flex-1 truncate">{layer}</span>
                                          <button
                                            onClick={() => toggleVisible(`${service.id}-${layer}`, layer)}
                                            className="p-0.5 text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                                          >
                                            {visible(`${service.id}-${layer}`) ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom Tools Footer */}
                    <div className="p-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-around gap-1 shrink-0">
                      {[
                        { id: "select", icon: MousePointer, label: "Select" },
                        { id: "pan", icon: Hand, label: "Pan" },
                        { id: "measure", icon: Ruler, label: "Measure" },
                        { id: "views", icon: Compass, label: "Views" },
                      ].map((tool) => {
                        const isActive = (splitPaneTool[pane] || "select") === tool.id;
                        return (
                          <button
                            key={tool.id}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSplitPaneTool((prev) => ({ ...prev, [pane]: tool.id }));
                              setSplitActivePane(pane);
                              triggerToast(`Pane ${paneLabel}: ${tool.label} activated`);
                            }}
                            className={`flex flex-col items-center justify-center flex-1 py-1 rounded-lg border transition-all duration-200 cursor-pointer active:scale-95 ${
                              isActive
                                ? "bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/10"
                                : "bg-white border-slate-200/80 text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                            }`}
                            title={tool.label}
                          >
                            <tool.icon className="w-3.5 h-3.5" stroke={isActive ? "#ffffff" : "currentColor"} />
                            <span className="text-[8px] font-bold mt-0.5 opacity-90">{tool.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );

                return (
                  <div
                    key={pane}
                    className={`h-full flex min-w-0 border-slate-200/70 ${pane === "left" ? "border-r" : ""}`}
                    style={{ width: pane === "left" ? `${splitPaneRatio}%` : `${100 - splitPaneRatio}%` }}
                    onClick={() => setSplitActivePane(pane)}
                  >
                    {pane === "left" && isLayerPanelOpen && layerPanel}
                    <div className={`relative flex-1 min-w-0 overflow-hidden bg-[#edf3f7] ${splitActivePane === pane ? "ring-2 ring-inset ring-blue-400/60" : ""}`}>
                      <div className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-2xl bg-white/95 border border-slate-100/80 px-3 py-2 shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
                        <span className="h-6 w-6 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">{paneLabel}</span>
                        <span className="text-[11px] font-extrabold text-slate-700">{viewType === "drawing" ? "Drawing View" : "BIM View"}</span>
                      </div>

                      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5">
                        {/* Avatars pile toggles dropdown */}
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setSplitActivePane(pane);
                            setIsSpotlightDropdownOpen(!isSpotlightDropdownOpen);
                          }}
                          className="h-8 px-2.5 rounded-xl border bg-white/95 hover:bg-slate-50 text-slate-700 border-slate-200/80 flex items-center gap-2 transition-all active:scale-95 cursor-pointer text-[10px] font-bold shadow-[0_4px_12px_rgba(15,23,42,0.05)] text-left"
                          title="Viewers List"
                        >
                          <div className="flex -space-x-1.5 overflow-hidden shrink-0">
                            <div className="h-4 w-4 rounded-full ring-2 ring-white bg-[#eab308] text-white flex items-center justify-center text-[7px] font-black">D</div>
                            <div className="h-4 w-4 rounded-full ring-2 ring-white bg-[#f97316] text-white flex items-center justify-center text-[7px] font-black">S</div>
                            <div className="h-4 w-4 rounded-full ring-2 ring-white bg-[#8b5cf6] text-white flex items-center justify-center text-[7px] font-black">R</div>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] font-black text-slate-650 leading-none">3 live</p>
                            <p className="text-[6.5px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5">Following</p>
                          </div>
                        </button>

                        {/* Spotlight/Stop toggle button */}
                        <button 
                          onClick={(event) => {
                            event.stopPropagation();
                            const isCurrentlyBroadcastingFromThisPane = isSpotlightOpen && splitActivePane === pane;
                            const nextState = !isCurrentlyBroadcastingFromThisPane;
                            setIsSpotlightOpen(nextState);
                            setSplitActivePane(pane);
                            triggerToast(nextState ? "Spotlight active: followers now track your viewport" : "Stopped broadcasting Spotlight");
                          }}
                          className={`h-8 px-3 rounded-xl border font-extrabold text-[10px] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(15,23,42,0.05)] ${
                            isSpotlightOpen && splitActivePane === pane
                              ? "bg-red-50 border-red-200 text-red-650 shadow-red-100/60" 
                              : "bg-blue-600 border-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                          }`}
                        >
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                            {isSpotlightOpen && splitActivePane === pane ? (
                              <rect x="6" y="6" width="12" height="12" />
                            ) : (
                              <polygon points="5 3 19 12 5 21 5 3" />
                            )}
                          </svg>
                          <span>{isSpotlightOpen && splitActivePane === pane ? "Stop" : "Spotlight"}</span>
                        </button>
                      </div>

                      {isSpotlightOpen && splitActivePane === pane && (
                        <>
                          <div className="absolute inset-3 rounded-[18px] border-[3px] border-emerald-400 shadow-[0_0_0_1px_rgba(16,185,129,0.18),0_0_34px_rgba(16,185,129,0.16)] pointer-events-none z-40" />
                          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-45 flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur px-3 py-2 shadow-[0_14px_36px_rgba(15,23,42,0.12)] border border-slate-200">
                            <button className="p-1 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] font-extrabold text-slate-400">0 Followers</span>
                            <button
                              onClick={(event) => {
                                event.stopPropagation();
                                setIsSpotlightOpen(false);
                                triggerToast("Stopped broadcasting Spotlight");
                              }}
                              className="h-6 px-3 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] font-extrabold cursor-pointer transition-colors"
                            >
                              Stop
                            </button>
                            <button className="h-7 w-7 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center cursor-pointer transition-colors">
                              <Mic className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}

                      {pane === "right" && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setIsToolInfoOpen(true);
                          }}
                          className="absolute right-4 bottom-4 z-45 h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-[0_10px_24px_rgba(37,99,235,0.24)] flex items-center justify-center transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                          title="Tool info and shortcuts"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* View Tools Sidebar (2D, BIM, Walkthrough) */}
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-1.5 bg-white/95 backdrop-blur border border-slate-100/80 p-1.5 rounded-[18px] shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                        {(() => {
                          const paneViewTools = [
                            { id: 'drawing', icon: LayoutGrid, tooltip: "2D View" },
                            { id: 'bim', icon: CustomCube, tooltip: "BIM View" },
                            { id: 'walkthrough', icon: Navigation, tooltip: "Walkthrough" },
                          ];
                          const activeViewIndex = Math.max(0, paneViewTools.findIndex((tool) => viewType === tool.id));

                          return (
                            <div className="relative flex flex-col gap-1.5">
                              <span
                                className="absolute left-0 top-0 z-0 h-9 w-9 rounded-xl bg-blue-600 shadow-[0_10px_24px_rgba(37,99,235,0.28)] transition-transform duration-300 ease-out"
                                style={{ transform: `translateY(${activeViewIndex * 42}px)` }}
                              />
                              {paneViewTools.map(tool => {
                                const isActiveTool = viewType === tool.id;
                                return (
                                  <button 
                                    key={tool.id}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      if (tool.id === 'drawing' || tool.id === 'bim') {
                                        setViewType(tool.id);
                                        setSplitActivePane(pane);
                                        triggerToast(`Pane ${paneLabel}: Switched to ${tool.tooltip}`);
                                      } else if (tool.id === 'walkthrough') {
                                        triggerToast(`Pane ${paneLabel}: Walkthrough Mode activated`);
                                      }
                                    }}
                                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300 relative group/icon cursor-pointer z-10 ${
                                      isActiveTool ? 'text-white scale-[1.03]' : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600 hover:scale-105 active:scale-95'
                                    }`}
                                  >
                                    <tool.icon
                                      className={`w-4 h-4 transition-transform duration-300 ${isActiveTool ? 'scale-110 rotate-[-6deg]' : 'group-hover/icon:scale-110'}`}
                                      stroke={isActiveTool ? "#ffffff" : "currentColor"}
                                      color={isActiveTool ? "#ffffff" : "currentColor"}
                                    />
                                    <span className="absolute left-12 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/icon:opacity-100 group-hover/icon:translate-x-1 transition-all duration-200 pointer-events-none z-[120]">
                                      {tool.tooltip}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center p-10">
                        {viewType === "drawing" ? (
                          <svg viewBox="0 0 620 390" className="w-[78%] max-w-[680px] min-w-[430px] bg-white rounded-sm border border-slate-200 shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
                            <defs>
                              <pattern id={`split-grid-${pane}`} width="44" height="44" patternUnits="userSpaceOnUse">
                                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#dbe5ef" strokeWidth="1" strokeDasharray="4 5" />
                              </pattern>
                            </defs>
                            <rect width="620" height="390" fill={`url(#split-grid-${pane})`} />
                            <rect x="82" y="62" width="420" height="238" fill="none" stroke="#64748b" strokeWidth="3" />
                            <rect x="115" y="94" width="124" height="78" fill="none" stroke="#22c55e" strokeWidth="2" />
                            <rect x="265" y="94" width="178" height="78" fill="none" stroke="#3b82f6" strokeWidth="2" />
                            <rect x="115" y="196" width="328" height="70" fill="none" stroke="#f97316" strokeWidth="2" />
                            <path d="M82 62h420" stroke="#eab308" strokeWidth="3" strokeDasharray="7 7" />
                            <text x="102" y="48" fill="#64748b" fontSize="14" fontWeight="700">Drawing Sheet {paneLabel}</text>
                          </svg>
                        ) : (
                          <div className="relative h-[360px] w-[520px] max-w-[78%]">
                            <div className="absolute left-[22%] bottom-14 h-56 w-24 bg-slate-600 border border-slate-700 shadow-xl">
                              {Array.from({ length: 9 }).map((_, index) => (
                                <div key={index} className="h-5 border-b border-slate-500/80 grid grid-cols-3 gap-1 p-1">
                                  <span className="bg-sky-100/70" /><span className="bg-sky-100/70" /><span className="bg-sky-100/70" />
                                </div>
                              ))}
                            </div>
                            <div className="absolute left-[40%] bottom-14 h-72 w-32 bg-slate-700 border border-slate-800 shadow-2xl">
                              {Array.from({ length: 12 }).map((_, index) => (
                                <div key={index} className="h-5 border-b border-slate-500/80 grid grid-cols-4 gap-1 p-1">
                                  <span className="bg-sky-100/70" /><span className="bg-sky-100/70" /><span className="bg-sky-100/70" /><span className="bg-sky-100/70" />
                                </div>
                              ))}
                            </div>
                            <div className="absolute left-[15%] right-[12%] bottom-4 h-12 bg-slate-500 border border-slate-700 shadow-xl grid grid-cols-10 gap-1 p-1">
                              {Array.from({ length: 20 }).map((_, index) => <span key={index} className="bg-sky-100/70" />)}
                            </div>
                          </div>
                        )}
                      </div>

                      {!isLayerPanelOpen && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            setSplitLayerPanelOpen((prev) => ({ ...prev, [pane]: true }));
                            setSplitActivePane(pane);
                          }}
                          className={`absolute ${pane === "left" ? "left-4" : "right-4"} bottom-20 z-40 w-10 h-10 bg-white hover:bg-slate-50 text-blue-600 border border-slate-100/80 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95`}
                          title={`Open pane ${paneLabel} layers`}
                        >
                          <Layers className="w-4 h-4" />
                        </button>
                      )}

                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-2xl bg-white/95 border border-slate-100/80 px-2 py-1.5 shadow-[0_12px_40px_rgba(15,23,42,0.10)] transition-all duration-300 hover:shadow-[0_18px_55px_rgba(15,23,42,0.12)]">
                        {bottomTools.map((tool) => {
                          const isActive = activeBottomTool === tool.id;
                          return (
                            <button
                              key={tool.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                if (tool.id === "pdf") {
                                  exportViewToPdf();
                                  return;
                                }
                                setSplitPaneBottomTool((prev) => ({ ...prev, [pane]: isActive ? "" : tool.id }));
                                setSplitActivePane(pane);
                                if (tool.id === "maplayers") {
                                  setSplitLayerPanelOpen((prev) => ({ ...prev, [pane]: true }));
                                }
                                triggerToast(`Pane ${paneLabel}: ${isActive ? "Closed" : "Activated"} ${tool.tooltip}`);
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 ease-out text-xs font-bold relative group/bottom cursor-pointer active:scale-90 hover:-translate-y-1 ${
                                isActive 
                                  ? 'bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] scale-105 ring-2 ring-blue-100' 
                                  : 'text-slate-655 hover:bg-slate-50 hover:shadow-sm'
                              }`}
                            >
                              <tool.icon
                                className="w-3.5 h-3.5 transition-transform duration-200 group-hover/bottom:scale-115 group-hover/bottom:-rotate-6 group-active/bottom:scale-95"
                                style={isActive ? { color: "#ffffff", stroke: "#ffffff" } : undefined}
                              />
                              {isActive && (
                                <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current opacity-80" />
                              )}
                              <span className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/bottom:opacity-100 transition-opacity pointer-events-none z-[120]">
                                {tool.tooltip}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {pane === "right" && isLayerPanelOpen && layerPanel}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {/* -------------------- TAB 5: QUICK COMPARE A VS B -------------------- */}
      {activeTab === "quickCompare" && (
        <div className="w-full h-full bg-[#eaf0f5] overflow-hidden relative select-none flex flex-col">
          {!isQuickCompareActive ? (
            /* WELCOME / PRE-SCREEN WITH HISTORY */
            <div className="flex-1 overflow-y-auto flex items-center justify-center p-8 bg-[#eef4f8]">
              <div className="w-full max-w-2xl rounded-2xl bg-white border border-slate-100/90 shadow-[0_18px_50px_rgba(15,23,42,0.07)] p-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Header Section */}
                <div className="flex items-start justify-between gap-5">
                  <div className="flex items-start gap-3 text-left">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                      <Columns className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900 tracking-tight">Quick A vs B Compare</h2>
                      <p className="mt-1 text-[11px] font-semibold text-slate-500 max-w-md leading-relaxed">
                        Compare two CAD drawings side-by-side from local files or the project HUB.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setQuickCompareLeftFile(null);
                      setQuickCompareRightFile(null);
                      setIsQuickCompareActive(true);
                    }}
                    className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold shadow-sm shadow-blue-500/15 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Compare
                  </button>
                </div>

                {/* History Section */}
                <div className="w-full mt-5 border-t border-slate-100 pt-4 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Recent comparisons</h3>
                    </div>
                    <span className="text-[9px] font-bold text-slate-350">{quickCompareHistory.length} saved</span>
                  </div>

                  {quickCompareHistory.length === 0 ? (
                    <div className="text-center py-7 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 w-full">
                      <p className="text-[11px] text-slate-400 font-semibold">No recent comparisons saved yet.</p>
                      <p className="text-[9px] text-slate-350 font-semibold mt-1">Comparisons will auto-save here once both panes are loaded.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 w-full">
                      {quickCompareHistory.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setQuickCompareLeftFile(item.left);
                            setQuickCompareRightFile(item.right);
                            setIsQuickCompareActive(true);
                            triggerToast("Loaded saved comparison session");
                          }}
                          className="group relative border border-slate-100 hover:border-blue-200 bg-white hover:bg-blue-50/20 rounded-xl px-3 py-2.5 transition-all cursor-pointer flex items-center gap-3"
                        >
                          <div className="min-w-0 flex-1 space-y-1.5 pr-6">
                            {/* Left File */}
                            <div className="flex items-start gap-1.5 min-w-0">
                              <span className="h-4 w-4 shrink-0 rounded-md bg-emerald-50 text-emerald-700 text-[8px] font-extrabold flex items-center justify-center border border-emerald-100">A</span>
                              <p className="text-[10px] font-bold text-slate-700 truncate leading-4">{item.left.replace("HUB: ", "").replace("Local: ", "")}</p>
                            </div>
                            {/* Right File */}
                            <div className="flex items-start gap-1.5 min-w-0">
                              <span className="h-4 w-4 shrink-0 rounded-md bg-blue-50 text-blue-700 text-[8px] font-extrabold flex items-center justify-center border border-blue-100">B</span>
                              <p className="text-[10px] font-bold text-slate-700 truncate leading-4">{item.right.replace("HUB: ", "").replace("Local: ", "")}</p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className="text-[8.5px] text-slate-400 font-semibold">{item.date}</span>
                            <span className="text-[8.5px] font-extrabold text-blue-600">Load</span>
                          </div>

                          {/* Delete Action */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuickCompareHistory((prev) => prev.filter((h) => h.id !== item.id));
                              triggerToast("Deleted session from history");
                            }}
                            className="absolute top-3 right-3 p-1.5 text-slate-350 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                            title="Delete Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE COMPARE WORKSPACE SCREEN */
            <div className="flex-1 w-full flex flex-col min-h-0 relative">
              {/* Back to history option */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1.5 rounded-2xl bg-slate-900/90 backdrop-blur text-white px-3.5 py-2 shadow-2xl border border-slate-800 transition-all hover:scale-105 active:scale-95">
                <button
                  onClick={() => setIsQuickCompareActive(false)}
                  className="flex items-center gap-1.5 text-[10px] font-extrabold cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  View Comparison History
                </button>
              </div>

              <div className="flex-1 w-full flex items-stretch min-h-0">
                {([ "left", "right" ] as const).map((pane) => {
                  const paneLabel = pane === "left" ? "A" : "B";
                  const file = pane === "left" ? quickCompareLeftFile : quickCompareRightFile;
                  const setFile = pane === "left" ? setQuickCompareLeftFile : setQuickCompareRightFile;
                  
                  const hubFiles = [
                    { name: "A101_Ground_Floor_Plan.dwg", size: "12.4 MB", date: "May 25, 2026", type: "Architectural" },
                    { name: "S101_Foundation_Details.dwg", size: "8.2 MB", date: "May 24, 2026", type: "Structural" },
                    { name: "M101_HVAC_Layout_Plan.dwg", size: "15.1 MB", date: "May 24, 2026", type: "Mechanical" },
                    { name: "E101_Lighting_Routing.dwg", size: "9.6 MB", date: "May 23, 2026", type: "Electrical" }
                  ];

                  return (
                    <div 
                      key={pane} 
                      className={`h-full flex-1 min-w-0 relative flex flex-col bg-[#f0f4f8] ${pane === "left" ? "border-r border-slate-200/70" : ""}`}
                    >
                      {!file ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-slate-50/50">
                          <div className="w-full max-w-sm rounded-[24px] bg-white border border-slate-100/85 shadow-[0_16px_50px_rgba(15,23,42,0.06)] p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                            <div className="mx-auto mb-3.5 h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <h3 className="text-[13px] font-extrabold text-slate-800">Select File for Pane {paneLabel}</h3>
                            <p className="mt-1.5 text-[9.5px] text-slate-400 font-semibold leading-relaxed">
                              Upload a local CAD drawing or select an existing sheet from the central project HUB file manager.
                            </p>

                            <div className="mt-5 space-y-3.5 text-left">
                              {/* Local Upload */}
                              <div>
                                <label className="block text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Local File Upload</label>
                                <label className="flex items-center justify-between border border-dashed border-slate-205 hover:border-blue-400 rounded-xl px-3 py-2 bg-slate-50/40 hover:bg-slate-50 cursor-pointer transition-all">
                                  <div className="flex items-center gap-2">
                                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500">Choose DWG, DXF, or PDF...</span>
                                  </div>
                                  <input 
                                    type="file" 
                                    accept=".dwg,.dxf,.pdf,.ifc,.rvt"
                                    className="hidden" 
                                    onChange={(e) => {
                                      const selected = e.target.files?.[0];
                                      if (selected) {
                                        setFile(`Local: ${selected.name}`);
                                        triggerToast(`Loaded ${selected.name} locally into Pane ${paneLabel}`);
                                      }
                                    }}
                                  />
                                </label>
                              </div>

                              {/* Fetch from central HUB */}
                              <div className="space-y-1.5">
                                <label className="block text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wider">Select from Project HUB</label>
                                <div className="border border-slate-100 rounded-xl overflow-hidden bg-white max-h-[140px] overflow-y-auto divide-y divide-slate-50 shadow-inner">
                                  {hubFiles.map((hf) => (
                                    <button
                                      key={hf.name}
                                      onClick={() => {
                                        setFile(`HUB: ${hf.name}`);
                                        triggerToast(`Loaded ${hf.name} from HUB into Pane ${paneLabel}`);
                                      }}
                                      className="w-full flex items-center justify-between p-2 hover:bg-blue-50/30 text-left transition-all cursor-pointer group"
                                    >
                                      <div className="min-w-0 pr-2">
                                        <p className="text-[10px] font-bold text-slate-700 truncate group-hover:text-blue-600">{hf.name}</p>
                                        <p className="text-[8px] text-slate-400 font-semibold">{hf.type} • {hf.date}</p>
                                      </div>
                                      <span className="text-[8px] font-bold text-slate-500 bg-slate-50 px-1.5 py-0.2 rounded border border-slate-100 shrink-0">{hf.size}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full relative">
                          {/* Header bar */}
                          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between rounded-2xl bg-white/95 border border-slate-100/80 px-3.5 py-2.5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="h-6 w-6 rounded-xl bg-blue-600 text-white flex items-center justify-center text-[10px] font-black">{paneLabel}</span>
                              <div className="min-w-0">
                                <p className="text-[11px] font-bold text-slate-800 truncate leading-none">{file}</p>
                                <p className="text-[8.5px] text-slate-400 font-semibold mt-1">Source: {file?.startsWith("Local:") ? "Local File Upload" : "Central Project HUB"}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                setFile(null);
                                triggerToast(`Cleared file from Pane ${paneLabel}`);
                              }} 
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Viewport content */}
                          <div className="absolute inset-0 flex items-center justify-center p-10 bg-slate-100/50">
                            <svg viewBox="0 0 620 390" className="w-[78%] max-w-[680px] min-w-[430px] bg-white rounded-sm border border-slate-200 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                              <defs>
                                <pattern id={`quick-grid-${pane}`} width="44" height="44" patternUnits="userSpaceOnUse">
                                  <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#e6eef5" strokeWidth="1" strokeDasharray="3 4" />
                                </pattern>
                              </defs>
                              <rect width="620" height="390" fill={`url(#quick-grid-${pane})`} />
                              <rect x="80" y="60" width="440" height="240" fill="none" stroke="#475569" strokeWidth="2.5" />
                              
                              {file?.includes("Ground_Floor") && (
                                <>
                                  <line x1="80" y1="180" x2="520" y2="180" stroke="#475569" strokeWidth="1.5" strokeDasharray="5 5" />
                                  <line x1="260" y1="60" x2="260" y2="300" stroke="#475569" strokeWidth="1.5" strokeDasharray="5 5" />
                                  <circle cx="180" cy="120" r="22" fill="none" stroke="#22c55e" strokeWidth="2" />
                                  <rect x="320" y="100" width="120" height="60" fill="none" stroke="#3b82f6" strokeWidth="2" />
                                  <text x="330" y="125" fill="#3b82f6" fontSize="10" fontWeight="bold">Office Area</text>
                                  <text x="145" y="125" fill="#22c55e" fontSize="10" fontWeight="bold">Main Core</text>
                                </>
                              )}
                              {file?.includes("Foundation") && (
                                <>
                                  <rect x="120" y="100" width="80" height="80" fill="none" stroke="#ef4444" strokeWidth="2" />
                                  <rect x="240" y="100" width="80" height="80" fill="none" stroke="#ef4444" strokeWidth="2" />
                                  <rect x="360" y="100" width="80" height="80" fill="none" stroke="#ef4444" strokeWidth="2" />
                                  <text x="130" y="145" fill="#ef4444" fontSize="9" fontWeight="bold">Footing F1</text>
                                  <text x="250" y="145" fill="#ef4444" fontSize="9" fontWeight="bold">Footing F2</text>
                                  <text x="370" y="145" fill="#ef4444" fontSize="9" fontWeight="bold">Footing F3</text>
                                </>
                              )}
                              {file?.includes("HVAC") && (
                                <>
                                  <path d="M 120 120 L 400 120 L 400 240 L 480 240" fill="none" stroke="#10b981" strokeWidth="3" />
                                  <rect x="120" y="100" width="40" height="40" fill="none" stroke="#3b82f6" strokeWidth="2" />
                                  <text x="180" y="115" fill="#10b981" fontSize="10" fontWeight="bold">Supply Duct 300x300</text>
                                </>
                              )}
                              {file?.includes("Lighting") && (
                                <>
                                  <circle cx="150" cy="120" r="4" fill="#eab308" />
                                  <circle cx="250" cy="120" r="4" fill="#eab308" />
                                  <circle cx="350" cy="120" r="4" fill="#eab308" />
                                  <path d="M 150 120 L 350 120" fill="none" stroke="#eab308" strokeWidth="1.5" strokeDasharray="3 3" />
                                  <text x="150" y="140" fill="#eab308" fontSize="9" fontWeight="bold">Line A Lights</text>
                                </>
                              )}
                              {file?.startsWith("Local:") && (
                                <>
                                  <path d="M 160 120 Q 260 200, 360 120 T 480 220" fill="none" stroke="#2563eb" strokeWidth="2" />
                                  <rect x="120" y="150" width="140" height="80" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
                                  <text x="130" y="180" fill="#94a3b8" fontSize="10" fontWeight="bold">Uploaded CAD Sheet</text>
                                </>
                              )}
                              <text x="100" y="45" fill="#64748b" fontSize="13" fontWeight="bold">CAD Comparison Workspace</text>
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      

      {/* Clash Setup Modal */}
      {isClashSetupModalOpen && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm">
          {(() => {
            const clashSites = [
              { id: "site-a", label: "Site Boundary A - Tower Podium", zones: [
                { id: "zone-a1", label: "Core Tower Zone", floors: ["Basement 01", "Ground Floor", "Level 01", "Level 02", "Level 03"] },
                { id: "zone-a2", label: "Podium Retail Zone", floors: ["Lower Ground", "Ground Floor", "Level 01"] }
              ] },
              { id: "site-b", label: "Site Boundary B - Services Block", zones: [
                { id: "zone-b1", label: "Utility Plant Zone", floors: ["Basement Plant", "Service Deck"] },
                { id: "zone-b2", label: "Parking Ramp Zone", floors: ["Ramp Level 01", "Ramp Level 02"] }
              ] }
            ];
            const clashServices = ["Architectural", "Structural", "Mechanical", "Electrical", "Plumbing", "Firefighting"];
            const selectedSite = clashSites.find((site) => site.id === clashSetup.siteId) || clashSites[0];
            const selectedZone = selectedSite.zones.find((zone) => zone.id === clashSetup.zoneId) || selectedSite.zones[0];
            const comparisonLabel = clashSetup.comparisonType === "2d" ? "2D Drawing vs 2D Drawing" : "3D Model vs 3D Model";
            const applyScope = () => {
              const serviceB = clashSetup.serviceA === clashSetup.serviceB ? (clashServices.find((service) => service !== clashSetup.serviceA) || "Electrical") : clashSetup.serviceB;
              const nextScope = { ...clashSetup, serviceB };
              setClashSetup(nextScope);
              setActiveClashScope(nextScope);
              setIsBimCoordinationPanelOpen(true);
              setExpandedCoordinationLayerNodes((prev) => ({
                ...prev,
                [nextScope.siteId]: true,
                [nextScope.zoneId]: true,
                [`${nextScope.zoneId}-${nextScope.levelName}`]: true
              }));
              return nextScope;
            };
            const runDetection = () => {
              const scope = applyScope();
              setIsClashSetupModalOpen(false);
              setIsClashRunning(true);
              setClashProgress(0);
              setActiveRfiTab("clashes");
              setIsRfiPanelOpen(true);
              setClashResults([]);
              const token = Math.floor(Date.now() / 1000).toString().slice(-3);
              const stagedResults = [
                {
                  id: `CL-${token}`,
                  service1: scope.serviceA,
                  service2: scope.serviceB,
                  element1: `${scope.serviceA} ${scope.comparisonType === "2d" ? "drawing element" : "model element"}`,
                  element2: `${scope.serviceB} ${scope.comparisonType === "2d" ? "drawing element" : "model element"}`,
                  status: "New" as const,
                  severity: "Major" as const,
                  assignee: "Snehasis Mohapatra"
                },
                {
                  id: `CL-${token}A`,
                  service1: scope.serviceA,
                  service2: scope.serviceB,
                  element1: `${scope.serviceA} clearance zone`,
                  element2: `${scope.serviceB} route overlap`,
                  status: "Active" as const,
                  severity: "Minor" as const,
                  assignee: "Alex Rivera"
                },
                {
                  id: `CL-${token}B`,
                  service1: scope.serviceA,
                  service2: scope.serviceB,
                  element1: `${scope.serviceA} routing envelope`,
                  element2: `${scope.serviceB} reserved service space`,
                  status: "New" as const,
                  severity: "Critical" as const,
                  assignee: "Emma Watson"
                }
              ];
              const interval = setInterval(() => {
                setClashProgress((prev) => {
                  if (prev === 10) setClashResults([stagedResults[0]]);
                  if (prev === 40) setClashResults([stagedResults[0], stagedResults[1]]);
                  if (prev === 70) setClashResults(stagedResults);
                  if (prev >= 100) {
                    clearInterval(interval);
                    setIsClashRunning(false);
                    setClashResults(stagedResults);
                    triggerToast(`${scope.serviceA} vs ${scope.serviceB} clash detection complete`, "success");
                    return 100;
                  }
                  return prev + 10;
                });
              }, 150);
            };

            return (
              <div className="w-full max-w-2xl rounded-3xl bg-white border border-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.22)] overflow-hidden text-left">
                <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600">Clash setup</p>
                    <h3 className="mt-1 text-sm font-extrabold text-slate-900">Choose comparison context</h3>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">BIM coordination supports only 3D vs 3D or 2D vs 2D comparisons.</p>
                  </div>
                  <button onClick={() => setIsClashSetupModalOpen(false)} className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-1 border border-slate-100">
                    {[
                      { id: "3d", label: "3D Model vs 3D Model", icon: CustomCube },
                      { id: "2d", label: "2D Drawing vs 2D Drawing", icon: FileText }
                    ].map((option) => (
                      <button key={option.id} onClick={() => setClashSetup((prev) => ({ ...prev, comparisonType: option.id as "2d" | "3d" }))} className={`h-10 rounded-xl text-[11px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${clashSetup.comparisonType === option.id ? "bg-white text-blue-600 shadow-sm border border-blue-100" : "text-slate-500 hover:bg-white/70"}`}>
                        <option.icon className="w-3.5 h-3.5" />
                        {option.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <label className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Site boundary</span>
                      <select value={clashSetup.siteId} onChange={(event) => {
                        const site = clashSites.find((item) => item.id === event.target.value) || clashSites[0];
                        setClashSetup((prev) => ({ ...prev, siteId: site.id, zoneId: site.zones[0].id, levelName: site.zones[0].floors[0] }));
                      }} className="w-full h-9 rounded-xl border border-slate-100 bg-slate-50 px-3 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-blue-400">
                        {clashSites.map((site) => <option key={site.id} value={site.id}>{site.label}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Zone</span>
                      <select value={clashSetup.zoneId} onChange={(event) => {
                        const zone = selectedSite.zones.find((item) => item.id === event.target.value) || selectedSite.zones[0];
                        setClashSetup((prev) => ({ ...prev, zoneId: zone.id, levelName: zone.floors[0] }));
                      }} className="w-full h-9 rounded-xl border border-slate-100 bg-slate-50 px-3 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-blue-400">
                        {selectedSite.zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.label}</option>)}
                      </select>
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Level</span>
                      <select value={clashSetup.levelName} onChange={(event) => setClashSetup((prev) => ({ ...prev, levelName: event.target.value }))} className="w-full h-9 rounded-xl border border-slate-100 bg-slate-50 px-3 text-[11px] font-bold text-slate-700 focus:outline-none focus:border-blue-400">
                        {selectedZone.floors.map((floor) => <option key={floor} value={floor}>{floor}</option>)}
                      </select>
                    </label>
                  </div>

                  <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                    <label className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{clashSetup.comparisonType === "2d" ? "Drawing A service" : "Model A service"}</span>
                      <select value={clashSetup.serviceA} onChange={(event) => setClashSetup((prev) => ({ ...prev, serviceA: event.target.value }))} className="w-full h-10 rounded-xl border border-slate-100 bg-white px-3 text-[12px] font-extrabold text-slate-800 focus:outline-none focus:border-blue-400">
                        {clashServices.map((service) => <option key={service} value={service}>{service}</option>)}
                      </select>
                    </label>
                    <div className="h-10 px-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-black">VS</div>
                    <label className="space-y-1.5">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{clashSetup.comparisonType === "2d" ? "Drawing B service" : "Model B service"}</span>
                      <select value={clashSetup.serviceB} onChange={(event) => setClashSetup((prev) => ({ ...prev, serviceB: event.target.value }))} className="w-full h-10 rounded-xl border border-slate-100 bg-white px-3 text-[12px] font-extrabold text-slate-800 focus:outline-none focus:border-blue-400">
                        {clashServices.map((service) => <option key={service} value={service}>{service}</option>)}
                      </select>
                    </label>
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] font-extrabold text-blue-700">{comparisonLabel}</p>
                      <p className="text-[10px] font-semibold text-slate-500 truncate">{selectedSite.label} / {selectedZone.label} / {clashSetup.levelName} / {clashSetup.serviceA} vs {clashSetup.serviceB}</p>
                    </div>
                    {activeClashScope && <button onClick={() => { setActiveClashScope(null); triggerToast("Cleared clash layer scope"); }} className="h-8 px-3 rounded-xl bg-white border border-blue-100 text-blue-600 text-[10px] font-extrabold cursor-pointer hover:bg-blue-100">Clear scope</button>}
                  </div>
                </div>

                <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-2">
                  <button onClick={() => setIsClashSetupModalOpen(false)} className="h-9 px-4 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-white text-[11px] font-extrabold cursor-pointer">Cancel</button>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { applyScope(); setIsClashSetupModalOpen(false); triggerToast("Layer panel scoped to selected coordination context"); }} className="h-9 px-4 rounded-xl bg-white border border-blue-100 text-blue-600 hover:bg-blue-50 text-[11px] font-extrabold cursor-pointer">Apply to Layers</button>
                    <button onClick={runDetection} className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-extrabold cursor-pointer shadow-sm shadow-blue-500/20 flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Run Auto Detection
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Coordination Service Settings Modal */}
      {isServiceSettingsOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.18)] overflow-hidden text-left micro-fade-in">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Service Settings</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Assign color codes for BIM coordination services.</p>
              </div>
              <button
                onClick={() => setIsServiceSettingsOpen(false)}
                className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/35 p-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-blue-600" />
                  <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider">Add service</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={newServiceName}
                    onChange={(event) => setNewServiceName(event.target.value)}
                    placeholder="Service name"
                    className="h-9 flex-1 min-w-0 rounded-xl bg-white border border-blue-100 px-3 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <span className="h-9 w-9 rounded-xl border border-blue-100 bg-white flex items-center justify-center shrink-0">
                    <span className="h-4 w-4 rounded-full border border-slate-900/10" style={{ backgroundColor: newServiceColor }} />
                  </span>
                  <button
                    onClick={() => {
                      const serviceName = newServiceName.trim();
                      if (!serviceName) {
                        triggerToast("Enter a service name first");
                        return;
                      }
                      if (serviceColors[serviceName]) {
                        triggerToast(`${serviceName} already exists`);
                        return;
                      }
                      setServiceColors((prev) => ({ ...prev, [serviceName]: newServiceColor }));
                      setNewServiceName("");
                      triggerToast(`Added ${serviceName} service`);
                    }}
                    className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-extrabold transition-all cursor-pointer active:scale-95"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {["#3b82f6", "#ef4444", "#10b981", "#eab308", "#f97316", "#ec4899", "#8b5cf6", "#14b8a6"].map((swatch) => (
                    <button
                      key={swatch}
                      onClick={() => setNewServiceColor(swatch)}
                      className={`h-5 w-5 rounded-full border cursor-pointer transition-all hover:scale-110 ${
                        newServiceColor === swatch ? "ring-2 ring-blue-200 border-white" : "border-slate-900/10"
                      }`}
                      style={{ backgroundColor: swatch }}
                      title={`New service color ${swatch}`}
                    />
                  ))}
                </div>
              </div>

              {Object.entries(serviceColors).map(([service, color]) => (
                <div key={service} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/40 px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="h-3 w-3 rounded-full border border-slate-900/10 shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-xs font-extrabold text-slate-700 truncate">{service}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {["#3b82f6", "#ef4444", "#10b981", "#eab308", "#f97316", "#ec4899", "#8b5cf6", "#14b8a6"].map((swatch) => (
                      <button
                        key={swatch}
                        onClick={() => {
                          setServiceColors((prev) => ({ ...prev, [service]: swatch }));
                          triggerToast(`Updated ${service} color`);
                        }}
                        className={`h-5 w-5 rounded-full border cursor-pointer transition-all hover:scale-110 ${
                          color === swatch ? "ring-2 ring-blue-200 border-white" : "border-slate-900/10"
                        }`}
                        style={{ backgroundColor: swatch }}
                        title={`${service} ${swatch}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coordination Detail / Assignment Modal */}
      {coordinationDetailModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          {(() => {
            const teamGroups = [
              { name: "MEP", defaultMembers: ["Snehasis Mohapatra", "Sam K."], allMembers: ["Snehasis Mohapatra", "Sam K.", "Rahul Nair", "Priya Menon", "Omar Sheikh"] },
              { name: "Structure", defaultMembers: ["Emma Watson", "Debashish Jena"], allMembers: ["Emma Watson", "Debashish Jena", "Vikram Rao", "Nisha Patel", "Aarav Singh"] },
              { name: "Architecture", defaultMembers: ["Alex Rivera"], allMembers: ["Alex Rivera", "Maya Chen", "Rohan Das", "Isha Kapoor"] },
              { name: "QC", defaultMembers: ["Lisa P."], allMembers: ["Lisa P.", "Karan Mehta", "Fatima Ali", "Neha Sharma"] }
            ];
            const memberInitials: Record<string, { initials: string; bg: string; text: string }> = {
              "Snehasis Mohapatra": { initials: "SM", bg: "bg-indigo-50 border-indigo-100", text: "text-indigo-600" },
              "Emma Watson": { initials: "EW", bg: "bg-rose-50 border-rose-100", text: "text-rose-600" },
              "Alex Rivera": { initials: "AR", bg: "bg-blue-50 border-blue-100", text: "text-blue-600" },
              "Lisa P.": { initials: "LP", bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-600" },
              "Sam K.": { initials: "SK", bg: "bg-amber-50 border-amber-100", text: "text-amber-600" },
              "Debashish Jena": { initials: "DJ", bg: "bg-violet-50 border-violet-100", text: "text-violet-600" },
              "Rahul Nair": { initials: "RN", bg: "bg-cyan-50 border-cyan-100", text: "text-cyan-600" },
              "Priya Menon": { initials: "PM", bg: "bg-fuchsia-50 border-fuchsia-100", text: "text-fuchsia-600" },
              "Omar Sheikh": { initials: "OS", bg: "bg-teal-50 border-teal-100", text: "text-teal-600" },
              "Vikram Rao": { initials: "VR", bg: "bg-orange-50 border-orange-100", text: "text-orange-600" },
              "Nisha Patel": { initials: "NP", bg: "bg-lime-50 border-lime-100", text: "text-lime-700" },
              "Aarav Singh": { initials: "AS", bg: "bg-sky-50 border-sky-100", text: "text-sky-600" },
              "Maya Chen": { initials: "MC", bg: "bg-pink-50 border-pink-100", text: "text-pink-600" },
              "Rohan Das": { initials: "RD", bg: "bg-blue-50 border-blue-100", text: "text-blue-700" },
              "Isha Kapoor": { initials: "IK", bg: "bg-purple-50 border-purple-100", text: "text-purple-600" },
              "Karan Mehta": { initials: "KM", bg: "bg-yellow-50 border-yellow-100", text: "text-yellow-700" },
              "Fatima Ali": { initials: "FA", bg: "bg-rose-50 border-rose-100", text: "text-rose-700" },
              "Neha Sharma": { initials: "NS", bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700" }
            };
            const { type, item } = coordinationDetailModal;
            const isClash = type === "clash";
            const title = isClash ? `${item.element1} vs ${item.element2}` : item.title;
            const serviceLabel = isClash ? `${item.service1} / ${item.service2}` : item.service;
            const priorityLabel = isClash ? item.severity : item.priority;
            const assignItem = (assignee: string) => {
              if (type === "rfi") {
                setRfis((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, assignee } : entry));
              } else if (type === "issue") {
                setIssues((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, assignee } : entry));
              } else {
                setClashResults((prev) => prev.map((entry) => entry.id === item.id ? { ...entry, assignee, status: entry.status === "New" ? "Active" : entry.status } : entry));
              }
              setCoordinationDetailModal({ type, item: { ...item, assignee, status: isClash && item.status === "New" ? "Active" : item.status } });
              triggerToast(`${item.id} assigned to ${assignee}`);
            };
            return (
              <div className="w-full max-w-md max-h-[82vh] rounded-3xl bg-white border border-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.20)] overflow-hidden text-left micro-fade-in flex flex-col">
                <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-md ${
                        type === "rfi" ? "bg-blue-50 text-blue-600" : type === "issue" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {item.id}
                      </span>
                      <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">{type === "clash" ? "Clash Detail" : type.toUpperCase()}</span>
                    </div>
                    <h3 className="mt-2 text-[13px] font-bold text-slate-900 leading-snug">{title}</h3>
                  </div>
                  <button
                    onClick={() => setCoordinationDetailModal(null)}
                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/35 shrink-0">
                  <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100/80 p-1">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "snap", label: "Snap" },
                      { id: "assignment", label: "Assignment" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setCoordinationDetailTab(tab.id as "overview" | "snap" | "assignment")}
                        className={`h-8 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer ${
                          coordinationDetailTab === tab.id
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
                  {coordinationDetailTab === "overview" && (
                    <>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-slate-50/40 border border-slate-100 p-2.5">
                      <div className="flex items-center gap-1 text-[8.5px] font-extrabold text-slate-400 uppercase">
                        <Layers className="w-3 h-3 text-blue-500" />
                        Service
                      </div>
                      <p className="mt-1.5 text-[11px] font-extrabold text-slate-700 truncate">{serviceLabel}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50/40 border border-slate-100 p-2.5">
                      <div className="flex items-center gap-1 text-[8.5px] font-extrabold text-slate-400 uppercase">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        {isClash ? "Severity" : "Priority"}
                      </div>
                      <p className={`mt-1.5 text-[11px] font-extrabold ${
                        priorityLabel?.toLowerCase().includes("high") || priorityLabel?.toLowerCase().includes("critical")
                          ? "text-rose-600" 
                          : priorityLabel?.toLowerCase().includes("medium")
                            ? "text-amber-600"
                            : "text-blue-600"
                      }`}>{priorityLabel}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50/40 border border-slate-100 p-2.5">
                      <div className="flex items-center gap-1 text-[8.5px] font-extrabold text-slate-400 uppercase">
                        <Activity className="w-3 h-3 text-emerald-500" />
                        Status
                      </div>
                      <div className="mt-1.5 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.status === "Open" || item.status === "New" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                        }`} />
                        <span className="text-[11px] font-extrabold text-slate-700">{item.status}</span>
                      </div>
                    </div>
                  </div>

                  {isClash && (
                    <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-2.5 space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                        <span className="h-2 w-2 rounded-full border border-slate-900/10" style={{ backgroundColor: serviceColors[item.service1] }} />
                        {item.element1}
                      </div>
                      <div className="text-[8px] font-extrabold uppercase tracking-wider text-amber-600 pl-4">conflicts with</div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                        <span className="h-2 w-2 rounded-full border border-slate-900/10" style={{ backgroundColor: serviceColors[item.service2] }} />
                        {item.element2}
                      </div>
                    </div>
                  )}

                    </>
                  )}

                  {coordinationDetailTab === "snap" && (
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Snap</span>
                        <span className="text-[8.5px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg">
                          Clash image
                        </span>
                      </div>
                      {item.id === "CL-501" && (
                        <svg viewBox="0 0 400 170" className="w-full h-[140px] bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden shadow-inner select-none">
                          <defs>
                            <pattern id="clash-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#273549" strokeWidth="0.5" />
                            </pattern>
                            <linearGradient id="duct-grad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#34d399" />
                              <stop offset="50%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#047857" />
                            </linearGradient>
                            <linearGradient id="beam-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ef4444" />
                              <stop offset="100%" stopColor="#b91c1c" />
                            </linearGradient>
                            <radialGradient id="clash-glow-501" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                          <rect width="400" height="170" fill="url(#clash-grid)" />
                          <text x="12" y="18" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="0.5">3D CLASH VIEWPORT</text>
                          
                          {/* Beam (Structural - Red) */}
                          <path d="M 170 20 L 210 20 L 210 150 L 170 150 Z" fill="url(#beam-grad)" opacity="0.85" />
                          <path d="M 140 20 L 240 20 L 240 30 L 140 30 Z" fill="url(#beam-grad)" opacity="0.9" />
                          <path d="M 140 140 L 240 140 L 240 150 L 140 150 Z" fill="url(#beam-grad)" opacity="0.9" />
                          
                          {/* Duct (Mechanical - Green) */}
                          <path d="M 40 70 L 360 70 L 360 110 L 40 110 Z" fill="url(#duct-grad)" opacity="0.8" />
                          <line x1="40" y1="90" x2="360" y2="90" stroke="#065f46" strokeWidth="1" strokeDasharray="5 3" />
                          
                          {/* Clash glow and marker */}
                          <circle cx="190" cy="90" r="30" fill="url(#clash-glow-501)" className="animate-pulse" />
                          <circle cx="190" cy="90" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx="190" cy="90" r="12" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" className="animate-spin-slow" />
                          
                          {/* Callout */}
                          <g transform="translate(210, 40)">
                            <path d="M -15 45 L 5 15 L 25 15" fill="none" stroke="#ef4444" strokeWidth="1" />
                            <rect x="25" y="2" width="115" height="26" rx="5" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
                            <text x="31" y="12" fill="#ef4444" fontSize="8" fontWeight="bold">STRUCTURAL CLASH</text>
                            <text x="31" y="21" fill="#94a3b8" fontSize="7" fontWeight="bold">85mm Duct Penetration</text>
                          </g>
                        </svg>
                      )}
                      {item.id === "CL-502" && (
                        <svg viewBox="0 0 400 170" className="w-full h-[140px] bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden shadow-inner select-none">
                          <defs>
                            <pattern id="clash-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#273549" strokeWidth="0.5" />
                            </pattern>
                            <linearGradient id="pipe-grad-502" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#60a5fa" />
                              <stop offset="50%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                            <linearGradient id="tray-grad-502" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#fbbf24" />
                              <stop offset="50%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#d97706" />
                            </linearGradient>
                            <radialGradient id="clash-glow-502" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                          <rect width="400" height="170" fill="url(#clash-grid)" />
                          <text x="12" y="18" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="0.5">3D CLASH VIEWPORT</text>
                          
                          {/* Pipe (Plumbing - Blue) */}
                          <path d="M 125 15 L 265 145 L 295 145 L 155 15 Z" fill="url(#pipe-grad-502)" opacity="0.85" />
                          <ellipse cx="140" cy="15" rx="15" ry="6" fill="#93c5fd" transform="rotate(-15, 140, 15)" />
                          
                          {/* Cable Tray (Electrical - Yellow) */}
                          <path d="M 50 90 L 350 90 L 350 110 L 50 110 Z" fill="url(#tray-grad-502)" opacity="0.8" />
                          <line x1="90" y1="90" x2="90" y2="110" stroke="#78350f" strokeWidth="1" />
                          <line x1="150" y1="90" x2="150" y2="110" stroke="#78350f" strokeWidth="1" />
                          <line x1="210" y1="90" x2="210" y2="110" stroke="#78350f" strokeWidth="1" />
                          <line x1="270" y1="90" x2="270" y2="110" stroke="#78350f" strokeWidth="1" />
                          <line x1="330" y1="90" x2="330" y2="110" stroke="#78350f" strokeWidth="1" />
                          
                          {/* Clash glow and marker */}
                          <circle cx="210" cy="98" r="30" fill="url(#clash-glow-502)" className="animate-pulse" />
                          <circle cx="210" cy="98" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx="210" cy="98" r="12" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" className="animate-spin-slow" />
                          
                          {/* Callout */}
                          <g transform="translate(230, 35)">
                            <path d="M -15 58 L 5 20 L 25 20" fill="none" stroke="#ef4444" strokeWidth="1" />
                            <rect x="25" y="7" width="115" height="26" rx="5" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
                            <text x="31" y="17" fill="#ef4444" fontSize="8" fontWeight="bold">ELECTRICAL CLASH</text>
                            <text x="31" y="26" fill="#94a3b8" fontSize="7" fontWeight="bold">120mm Overlap Section</text>
                          </g>
                        </svg>
                      )}
                      {item.id === "CL-503" && (
                        <svg viewBox="0 0 400 170" className="w-full h-[140px] bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden shadow-inner select-none">
                          <defs>
                            <pattern id="clash-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#273549" strokeWidth="0.5" />
                            </pattern>
                            <linearGradient id="column-grad" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#94a3b8" />
                              <stop offset="50%" stopColor="#64748b" />
                              <stop offset="100%" stopColor="#475569" />
                            </linearGradient>
                            <linearGradient id="conduit-grad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#a78bfa" />
                              <stop offset="50%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#5b21b6" />
                            </linearGradient>
                            <radialGradient id="clash-glow-503" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.2" />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                          <rect width="400" height="170" fill="url(#clash-grid)" />
                          <text x="12" y="18" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="0.5">3D CLASH VIEWPORT</text>
                          
                          {/* Concrete Column (Architectural - Grey) */}
                          <rect x="170" y="20" width="60" height="130" fill="url(#column-grad)" opacity="0.85" rx="2" />
                          <line x1="200" y1="20" x2="200" y2="150" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                          
                          {/* Conduit Run (Electrical - Purple) */}
                          <path d="M 40 85 L 360 85 L 360 95 L 40 95 Z" fill="url(#conduit-grad)" opacity="0.9" />
                          
                          {/* Clash glow and marker */}
                          <circle cx="200" cy="90" r="30" fill="url(#clash-glow-503)" className="animate-pulse" />
                          <circle cx="200" cy="90" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx="200" cy="90" r="12" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" className="animate-spin-slow" />
                          
                          {/* Callout */}
                          <g transform="translate(225, 35)">
                            <path d="M -20 55 L 5 20 L 25 20" fill="none" stroke="#ef4444" strokeWidth="1" />
                            <rect x="25" y="7" width="115" height="26" rx="5" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
                            <text x="31" y="17" fill="#ef4444" fontSize="8" fontWeight="bold">CONDUIT CLASH</text>
                            <text x="31" y="26" fill="#94a3b8" fontSize="7" fontWeight="bold">Column Core Penetration</text>
                          </g>
                        </svg>
                      )}
                      {!isClash && (
                        <svg viewBox="0 0 400 170" className="w-full h-[140px] bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden shadow-inner select-none">
                          <defs>
                            <pattern id={`detail-snap-grid-${item.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#273549" strokeWidth="0.5" />
                            </pattern>
                            <radialGradient id={`detail-snap-glow-${item.id}`} cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
                              <stop offset="50%" stopColor="#ef4444" stopOpacity="0.22" />
                              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </radialGradient>
                          </defs>
                          <rect width="400" height="170" fill={`url(#detail-snap-grid-${item.id})`} />
                          <text x="12" y="18" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="0.5">CLASH SNAPSHOT</text>
                          <path d="M 55 85 L 345 85 L 345 112 L 55 112 Z" fill="#10b981" opacity="0.78" />
                          <path d="M 190 25 L 222 25 L 222 145 L 190 145 Z" fill="#ef4444" opacity="0.78" />
                          <circle cx="206" cy="98" r="32" fill={`url(#detail-snap-glow-${item.id})`} className="animate-pulse" />
                          <circle cx="206" cy="98" r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx="206" cy="98" r="13" fill="none" stroke="#ef4444" strokeWidth="1" strokeDasharray="3 3" />
                          <g transform="translate(226, 45)">
                            <path d="M -15 50 L 5 18 L 24 18" fill="none" stroke="#ef4444" strokeWidth="1" />
                            <rect x="24" y="4" width="118" height="28" rx="6" fill="#0f172a" stroke="#ef4444" strokeWidth="1" />
                            <text x="32" y="15" fill="#ef4444" fontSize="8" fontWeight="bold">REFERENCE SNAP</text>
                            <text x="32" y="24" fill="#94a3b8" fontSize="7" fontWeight="bold">{item.id} linked clash area</text>
                          </g>
                        </svg>
                      )}
                    </div>
                  )}

                  {coordinationDetailTab === "assignment" && (
                  <div className="rounded-xl border border-slate-100 bg-white p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-wider">Team assignment</label>
                      <span className="text-[9.5px] font-bold text-blue-650 bg-blue-50/50 px-2 py-0.5 rounded border border-blue-100">
                        {item.assignee || "Unassigned"}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {teamGroups.map((team) => (
                        <div key={team.name} className="grid grid-cols-[76px_1fr] items-start gap-2">
                          <div className="pt-2">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">{team.name}</span>
                          </div>
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap gap-1.5">
                            {(visibleAssignmentMembers[team.name] || team.defaultMembers).map((member) => {
                              const isAssigned = item.assignee === member;
                              const data = memberInitials[member] || { initials: "??", bg: "bg-slate-50 border-slate-100", text: "text-slate-500" };
                              return (
                                <button
                                  key={member}
                                  onClick={() => assignItem(member)}
                                  className={`group relative min-w-0 h-8 rounded-xl border px-2 flex items-center gap-1.5 font-extrabold text-[10px] ${data.bg} ${data.text} transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                                    isAssigned
                                      ? 'ring-2 ring-blue-500 ring-offset-1 shadow-md shadow-blue-500/10'
                                      : 'opacity-75 hover:opacity-100 hover:-translate-y-0.5'
                                  }`}
                                  title={`Assign to ${member}`}
                                >
                                  <span className="h-5 w-5 rounded-full bg-white/70 border border-current/10 flex items-center justify-center text-[8.5px] shrink-0">
                                    {data.initials}
                                  </span>
                                  <span className="max-w-[94px] truncate">{member}</span>
                                  {isAssigned && (
                                    <span className="h-3.5 w-3.5 bg-blue-600 text-white rounded-full flex items-center justify-center ring-1 ring-white shadow-sm shrink-0">
                                      <Check className="w-2 h-2 stroke-[4]" />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => setExpandedAssignmentTeams((prev) => ({ ...prev, [team.name]: !prev[team.name] }))}
                                className="h-6 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 border border-slate-100 text-[8.5px] font-extrabold transition-all cursor-pointer"
                              >
                                {expandedAssignmentTeams[team.name] ? "Hide" : "Show more"}
                              </button>
                              <select
                                value={assignmentMemberPicker[team.name] || ""}
                                onChange={(event) => setAssignmentMemberPicker((prev) => ({ ...prev, [team.name]: event.target.value }))}
                                className="h-6 min-w-[118px] rounded-lg bg-white border border-slate-100 px-2 text-[8.5px] font-bold text-slate-600 focus:outline-none focus:border-blue-400 cursor-pointer"
                              >
                                <option value="">Select member</option>
                                {team.allMembers
                                  .filter((member) => !(visibleAssignmentMembers[team.name] || team.defaultMembers).includes(member))
                                  .map((member) => (
                                    <option key={member} value={member}>{member}</option>
                                  ))}
                              </select>
                              <button
                                onClick={() => {
                                  const selectedMember = assignmentMemberPicker[team.name];
                                  if (!selectedMember) {
                                    triggerToast(`Select a ${team.name} member first`);
                                    return;
                                  }
                                  setVisibleAssignmentMembers((prev) => ({
                                    ...prev,
                                    [team.name]: [...(prev[team.name] || team.defaultMembers), selectedMember]
                                  }));
                                  setAssignmentMemberPicker((prev) => ({ ...prev, [team.name]: "" }));
                                  triggerToast(`Added ${selectedMember} to ${team.name}`);
                                }}
                                className="h-6 px-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 text-[8.5px] font-extrabold transition-all cursor-pointer"
                              >
                                Add more
                              </button>
                            </div>

                            {expandedAssignmentTeams[team.name] && (
                              <div className="rounded-xl bg-slate-50/70 border border-slate-100 p-2 flex flex-wrap gap-1.5">
                                {team.allMembers.map((member) => {
                                  const isVisible = (visibleAssignmentMembers[team.name] || team.defaultMembers).includes(member);
                                  const data = memberInitials[member] || { initials: "??", bg: "bg-slate-50 border-slate-100", text: "text-slate-500" };
                                  return (
                                    <button
                                      key={member}
                                      onClick={() => {
                                        if (!isVisible) {
                                          setVisibleAssignmentMembers((prev) => ({
                                            ...prev,
                                            [team.name]: [...(prev[team.name] || team.defaultMembers), member]
                                          }));
                                        }
                                        assignItem(member);
                                      }}
                                      className={`h-7 px-2 rounded-lg border flex items-center gap-1 text-[8.5px] font-extrabold transition-all cursor-pointer ${
                                        item.assignee === member
                                          ? "bg-blue-600 border-blue-600 text-white"
                                          : isVisible
                                            ? "bg-white border-slate-200 text-slate-700"
                                            : `${data.bg} ${data.text} opacity-80 hover:opacity-100`
                                      }`}
                                    >
                                      <span>{data.initials}</span>
                                      <span>{member}</span>
                                      {isVisible && <Check className="w-2.5 h-2.5" />}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  )}
                </div>

                  <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-slate-100 bg-white shrink-0">
                    <button
                      onClick={() => {
                        const linkedMarkup = coordinationMarkups.find((markup) => markup.itemId === item.id);
                        if (linkedMarkup) zoomToMarkup(linkedMarkup);
                        triggerToast(linkedMarkup ? `Focused ${item.id} markup` : `${item.id} has no linked markup yet`);
                      }}
                      className="h-8.5 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5 text-slate-500" />
                      Focus View
                    </button>
                    <button
                      onClick={() => setCoordinationDetailModal(null)}
                      className="h-8.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                      Done
                    </button>
                  </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Toolbar Info Modal */}
      {isToolInfoOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/35 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.15)] overflow-hidden text-left micro-fade-in">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-800">Toolbar Info</h3>
                  <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">Control layout guides and keyboard shortcuts</p>
                </div>
              </div>
              <button
                onClick={() => setIsToolInfoOpen(false)}
                className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-2">
              {[
                ["Home View", "Reset view framing", "H", Home],
                ["Clipper Box", "Create section or box clipping", "C", Sliders],
                ["Environment", "Sun, ambient, and shadow controls", "L", Sparkles],
                ["Measurement", "Length and area measurement", "M", Ruler],
                ["Map Layers", "Road, aerial, building, and drone overlays", "G", Layers],
                ["Split Screen", "Compare Drawing vs BIM or A vs B", "S", LayoutGrid],
                ["Views Control", "Top, front, FPP, and TPP views", "V", Navigation],
                ["Select", "Select objects and annotations", "Esc", MousePointer],
                ["Pan", "Move the viewport", "Space", Globe],
                ["Zoom", "Zoom in, out, and reset", "+ / -", Maximize2],
                ["RFI", "Create and inspect RFI markups", "R", FileText],
                ["Issue", "Create and inspect issue markups", "I", AlertTriangle],
              ].map(([name, description, shortcut, IconComponent]) => (
                <div 
                  key={name as string} 
                  className="rounded-xl border border-slate-100 bg-slate-50/30 p-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 hover:border-slate-200/80 transition-all duration-200 group/item cursor-default"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-50/60 text-blue-600 flex items-center justify-center shrink-0 group-hover/item:bg-blue-600 group-hover/item:text-white transition-all duration-200">
                      {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-800 leading-none">{name as string}</p>
                      <p className="mt-1.5 text-[9.5px] font-medium text-slate-400 truncate leading-none">{description as string}</p>
                    </div>
                  </div>
                  <kbd className="px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center rounded bg-white border border-slate-205 border-b-[2px] border-b-slate-300 text-[9.5px] font-bold text-slate-700 font-mono shadow-sm shrink-0">
                    {shortcut as string}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create RFI / Issue Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm micro-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100/60 shadow-[0_24px_70px_rgba(15,23,42,0.18)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Create BIM {activeRfiTab === "rfi" ? "Request for Information (RFI)" : "Quality Issue"}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  Pin a spatial conflict card to the active 3D model viewport coordinates.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-left">
              {/* Title field */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider">Subject Description</label>
                <input 
                  type="text"
                  placeholder="Describe the clash or structural conflict..."
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
                />
              </div>

              {/* Grid split: Service & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Associated Service</label>
                  <select 
                    value={newItemService}
                    onChange={(e) => setNewItemService(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                  >
                    {Object.keys(serviceColors).map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Priority Level</label>
                  <select 
                    value={newItemPriority}
                    onChange={(e) => setNewItemPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Assignee field */}
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Responsible Engineer</label>
                <select 
                  value={newItemAssignee}
                  onChange={(e) => setNewItemAssignee(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100/80 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 cursor-pointer"
                >
                  <option value="Snehasis Mohapatra">Snehasis Mohapatra (Lead)</option>
                  <option value="Alex Rivera">Alex Rivera (Architect)</option>
                  <option value="Emma Watson">Emma Watson (Structural)</option>
                  <option value="Sam K.">Sam K. (Mechanical)</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="h-9 px-4 bg-slate-200 hover:bg-slate-355 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!newItemTitle.trim()) {
                    triggerToast("Please enter a subject description", "warning");
                    return;
                  }
                  let nextId = "";
                  if (activeRfiTab === "rfi") {
                    nextId = `RFI-${100 + rfis.length + 1}`;
                    setRfis(prev => [
                      { id: nextId, title: newItemTitle, service: newItemService, priority: newItemPriority, status: "Open", assignee: newItemAssignee, due: "2026-06-15" },
                      ...prev
                    ]);
                  } else {
                    nextId = `ISS-${300 + issues.length + 1}`;
                    setIssues(prev => [
                      { id: nextId, title: newItemTitle, service: newItemService, priority: newItemPriority, status: "Open", assignee: newItemAssignee, due: "2026-06-15" },
                      ...prev
                    ]);
                  }
                  setPendingMarkupItemId(nextId);
                  setCoordinationActiveMarkupTool("cloud");
                  setIsCreateModalOpen(false);
                  setNewItemTitle("");
                  triggerToast(`Created ${nextId}. Click & drag on the drawing to place a markup linking it.`, "info");
                }}
                className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all  shadow-blue-500/10 cursor-pointer"
              >
                Submit Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Site Boundary Plan Assignment Modal */}
      {sitePlanAssignmentBoundaryId && (
        <div className="fixed inset-0 z-[126] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm micro-fade-in">
          {(() => {
            const boundary = markups.find((markup) => markup.id === sitePlanAssignmentBoundaryId);
            const suggestedPlan = sitePlanAssignmentSuggestedId
              ? availableSitePlanSources.find((plan) => plan.id === sitePlanAssignmentSuggestedId)
              : null;
            const orderedPlans = [
              ...(suggestedPlan ? [suggestedPlan] : []),
              ...availableSitePlanSources.filter((plan) => plan.id !== suggestedPlan?.id)
            ];
            const hasPlans = orderedPlans.length > 0;

            return (
              <div className="w-full max-w-md rounded-3xl bg-white border border-white/70 shadow-[0_28px_90px_rgba(15,23,42,0.22)] overflow-hidden text-left animate-in fade-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-white via-blue-50/25 to-slate-50 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/10">
                      <FolderOpen className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600">Map Overlay</div>
                      <h3 className="mt-0.5 text-sm font-extrabold text-slate-800">
                        {hasPlans ? "Select a Drawing to Display" : "No Drawings Uploaded Yet"}
                      </h3>
                      <p className="mt-0.5 text-[10px] font-semibold leading-relaxed text-slate-500">
                        {hasPlans 
                          ? `Assign a drawing to overlay on the map inside ${boundary?.label || "this boundary"}.` 
                          : `Add blueprints or site plans to view them inside ${boundary?.label || "this boundary"}.`
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSitePlanAssignmentBoundaryId(null);
                      setSitePlanAssignmentSuggestedId(null);
                    }}
                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-all"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Content body */}
                <div className="p-5">
                  {!hasPlans ? (
                    <div className="flex flex-col items-center text-center py-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <UploadCloud className="h-6 w-6 text-blue-500 animate-pulse" />
                      </div>
                      <p className="text-xs font-bold text-slate-800">Assign a map blueprint</p>
                      <p className="mt-1 max-w-[280px] text-[10.5px] font-semibold leading-relaxed text-slate-500">
                        Blueprints let you compare your architectural drafts directly on the map. Let's upload one to get started.
                      </p>
                      
                      <button
                        onClick={() => {
                          setActiveTab("drawing");
                          setSitePlanAssignmentBoundaryId(null);
                          setSitePlanAssignmentSuggestedId(null);
                        }}
                        className="mt-5 w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] cursor-pointer"
                      >
                        Upload a Drawing
                      </button>
                      <button
                        onClick={() => {
                          setSitePlanAssignmentBoundaryId(null);
                          setSitePlanAssignmentSuggestedId(null);
                        }}
                        className="mt-2.5 text-[10px] font-bold text-slate-450 hover:text-slate-650 transition-colors"
                      >
                        Skip for now
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                      {orderedPlans.map((plan) => {
                        const isSuggested = plan.id === sitePlanAssignmentSuggestedId;
                        return (
                          <button
                            key={plan.id}
                            onClick={() => assignSitePlanToBoundary(sitePlanAssignmentBoundaryId, plan.id)}
                            className={`w-full rounded-2xl border p-3 text-left transition-all cursor-pointer flex items-center gap-3 hover:-translate-y-0.5 ${
                              isSuggested
                                ? "border-blue-200 bg-blue-50/70 shadow-sm shadow-blue-600/10"
                                : "border-slate-100 bg-white hover:bg-slate-50"
                            }`}
                          >
                            <div className="h-12 w-16 rounded-xl border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
                              {plan.drawingOverlay?.url ? (
                                <BlueprintImage src={plan.drawingOverlay.url} alt={plan.label} className="h-full w-full object-cover" />
                              ) : (
                                <FileText className="m-4 h-4 w-4 text-blue-500" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="truncate text-xs font-extrabold text-slate-900">{plan.label}</p>
                                {isSuggested && (
                                  <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[7px] font-extrabold uppercase text-white">
                                    Suggested
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 truncate text-[9.5px] font-semibold text-slate-500">
                                {plan.drawingOverlay ? getOverlayName(plan.drawingOverlay.url) : "No base drawing"}
                              </p>
                              <p className="mt-0.5 text-[9px] font-bold text-blue-600">
                                {(plan.childLayers || []).length} zone{(plan.childLayers || []).length === 1 ? "" : "s"} inside
                              </p>
                            </div>
                            <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer only if plans exist */}
                {hasPlans && (
                  <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
                    <button
                      onClick={() => assignSitePlanToBoundary(sitePlanAssignmentBoundaryId, null)}
                      className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-655 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Clear overlay / Keep empty
                    </button>
                    <button
                      onClick={() => {
                        setSitePlanAssignmentBoundaryId(null);
                        setSitePlanAssignmentSuggestedId(null);
                      }}
                      className="h-9 rounded-xl bg-slate-900 px-4 text-xs font-extrabold text-white hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Drawing Zone Quick Setup Modal */}
      {quickSetupZoneId && (
        <div className="fixed inset-0 z-[125] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm micro-fade-in">
	          {(() => {
	            const quickSetupZone = activeArea?.childLayers?.find((zone) => zone.id === quickSetupZoneId);
	            const selectedFiles = assignableDrawingFiles;
	            const selectedFileIds = new Set(selectedFiles.map((file) => file.id));
	            const quickSetupConfig = quickSetupZoneId ? zoneDrawingConfigs[quickSetupZoneId] : undefined;
            const existingQuickSetupFloors = quickSetupConfig?.floorsList || [];
            const hasExistingQuickSetupFloors = existingQuickSetupFloors.length > 0;
            const safeQuickSetupFloorCount = Math.max(1, Math.min(30, quickSetupFloorCount || 1));
	            const serviceChoices = Array.from(new Set([
	              ...DRAWING_SERVICES,
	              ...assignableDrawingFiles.map((file) => file.service),
	              ...quickSetupServices
	            ]));
            const visibleQuickSetupServices = quickSetupServices.filter(Boolean);
            const levelDrafts = Array.from({ length: safeQuickSetupFloorCount }, (_, index) => ({
              index,
              id: existingQuickSetupFloors[index]?.id || `draft-floor-${index + 1}`,
              name: existingQuickSetupFloors[index]?.name || `Floor ${index + 1}`
            }));
	            const getQuickSetupAssignmentValue = (floorIndex: number, service: DrawingService) => {
              const draftFloor = quickSetupAssignments[String(floorIndex)] || {};
	              const draftAssignment = draftFloor[service];
              if (Object.prototype.hasOwnProperty.call(draftFloor, service)) {
                return draftAssignment || "";
              }

	              const existingAssignment = existingQuickSetupFloors[floorIndex]?.assignments?.[service];
	              if (existingAssignment && selectedFileIds.has(existingAssignment)) return existingAssignment;

	              const serviceMatch = selectedFiles.find((file) => file.service === service);
	              return serviceMatch?.id || selectedFiles[floorIndex % selectedFiles.length]?.id || "";
	            };
            const assignQuickSetupDrawingToSlot = (floorIndex: number, service: DrawingService, drawingId: string) => {
              const file = assignableDrawingFiles.find((item) => item.id === drawingId);
              if (!file && drawingId) return;
              setQuickSetupAssignments((prev) => ({
                ...prev,
                [String(floorIndex)]: {
                  ...(prev[String(floorIndex)] || {}),
                  [service]: drawingId
                }
              }));
              triggerToast(
                file
                  ? `${file.name} assigned to Floor ${floorIndex + 1} - ${getServiceShortLabel(service)}.`
                  : `Cleared Floor ${floorIndex + 1} - ${getServiceShortLabel(service)}.`
              );
            };

	            return (
	              <div className="w-full max-w-2xl max-h-[86vh] rounded-3xl bg-white border border-white/70 shadow-[0_28px_90px_rgba(15,23,42,0.24)] overflow-hidden flex flex-col text-left">
	                <div className="px-5 py-4 border-b border-slate-100 bg-white flex items-start justify-between gap-4">
	                  <div className="flex items-start gap-3 min-w-0">
	                    <div className="h-11 w-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20">
	                      <Sparkles className="h-5 w-5" />
	                    </div>
	                    <div className="min-w-0">
	                      <div className="text-[9px] font-extrabold uppercase tracking-wider text-blue-600">Zone setup</div>
	                      <h3 className="mt-1 text-base font-extrabold text-slate-900 truncate">
	                        Set up {quickSetupZone?.label || "this zone"}
	                      </h3>
	                      <p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">
	                        Pick how many levels you need, then match drawings to each level.
	                      </p>
	                    </div>
	                  </div>
                  <button
                    onClick={closeQuickSetup}
                    className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 flex items-center justify-center cursor-pointer transition-all"
                    title="Close"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

	                <div className="flex-1 overflow-y-auto p-5 grid gap-4 md:grid-cols-[0.88fr_1.12fr]">
	                  <div className="space-y-4">
	                    <div className="rounded-2xl border border-slate-100 bg-white p-3">
	                      <div className="flex items-center gap-2">
	                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">1</span>
	                        <label className="text-[10px] font-extrabold text-slate-800">How many levels?</label>
	                      </div>
	                      <div className="mt-3 flex items-center gap-2">
	                        <button
	                          type="button"
	                          onClick={() => setQuickSetupFloorCount((count) => Math.max(1, count - 1))}
	                          className="h-8 w-8 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
	                          title="Remove one level"
	                        >
	                          <Minus className="mx-auto h-3.5 w-3.5" />
	                        </button>
	                        <input
	                          type="number"
	                          min="1"
	                          max="30"
	                          value={quickSetupFloorCount}
	                          onChange={(event) => setQuickSetupFloorCount(Math.max(1, Math.min(30, parseInt(event.target.value) || 1)))}
	                          className="h-8 w-14 rounded-xl border border-blue-200 bg-blue-50 px-2 text-center text-sm font-extrabold text-blue-700 outline-none focus:border-blue-500"
	                        />
	                        <button
	                          type="button"
	                          onClick={() => setQuickSetupFloorCount((count) => Math.min(30, count + 1))}
	                          className="h-8 w-8 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100"
	                          title="Add one level"
	                        >
	                          <Plus className="mx-auto h-3.5 w-3.5" />
	                        </button>
	                      </div>
	                      <p className="mt-2 text-[9.5px] font-semibold leading-4 text-slate-500">
	                        We will create these levels if they do not exist.
	                      </p>
	                    </div>

	                    <div className="rounded-2xl border border-slate-100 bg-white p-3">
	                      <div className="flex items-center justify-between gap-2">
	                        <div className="flex items-center gap-2">
	                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">2</span>
	                          <label className="text-[10px] font-extrabold text-slate-800">Drawing types</label>
	                        </div>
	                        <button
	                          onClick={() => setQuickSetupServices(DRAWING_SERVICES)}
	                          className="text-[8.5px] font-extrabold text-blue-600 hover:underline cursor-pointer"
	                        >
	                          Use all
	                        </button>
	                      </div>
	                      <p className="mt-2 text-[9.5px] font-semibold leading-4 text-slate-500">Choose only the drawing types you want to assign.</p>
	                      <div className="mt-2 flex flex-wrap gap-1.5">
	                        {serviceChoices.map((service) => {
	                          const checked = quickSetupServices.includes(service);
                          return (
                            <button
                              key={service}
                              onClick={() => {
                                setQuickSetupServices((prev) =>
                                  prev.includes(service)
                                    ? prev.filter((item) => item !== service)
                                    : [...prev, service]
                                );
                              }}
                              className={`h-7 rounded-lg border px-2 text-[9px] font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                                checked
                                  ? "border-blue-200 bg-blue-50 text-blue-700"
                                  : "border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100"
	                              }`}
	                            >
	                              {checked && <Check className="h-2.5 w-2.5" />}
	                              {service}
	                            </button>
	                          );
	                        })}
                      </div>
                    </div>
                  </div>

		                  <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
		                    <div className="px-3 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
		                      <div>
		                        <div className="flex items-center gap-2">
		                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">3</span>
		                          <p className="text-[10px] font-extrabold text-slate-800">Available drawings</p>
		                        </div>
		                        <p className="text-[9px] font-semibold text-slate-500 mt-0.5">
		                          Drag one to a level, or use the menu below.
		                        </p>
		                      </div>
	                      <button
                        onClick={() => {
                          drawingLibraryInputRef.current?.click();
                          triggerToast("Choose floor or service drawings to add to the library.");
                        }}
                        className="h-7 rounded-lg bg-blue-600 px-2.5 text-[9px] font-extrabold text-white hover:bg-blue-700 transition-all cursor-pointer"
	                      >
	                        Upload
	                      </button>
	                    </div>
                    <div className="max-h-72 overflow-y-auto p-2 space-y-1.5">
                      {assignableDrawingFiles.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-5 text-center">
	                          <UploadCloud className="mx-auto h-6 w-6 text-blue-500" />
	                          <p className="mt-2 text-[10px] font-bold text-slate-600">Upload service drawings first</p>
	                          <p className="mt-1 text-[9px] font-semibold text-slate-400">
	                            Site plans are kept out of this assignment list.
	                          </p>
	                        </div>
	                      ) : (
	                        assignableDrawingFiles.map((file) => {
	                          return (
	                            <div
	                              key={file.id}
                              draggable
                              onDragStart={(event) => {
                                event.dataTransfer.setData("drawingId", file.id);
                                setDraggedDrawingId(file.id);
                              }}
                              onDragEnd={() => {
                                setDraggedDrawingId(null);
	                              }}
	                              className="w-full rounded-xl border border-slate-100 bg-white p-2 text-left transition-all cursor-grab active:cursor-grabbing flex items-center gap-2 hover:border-blue-200 hover:bg-blue-50/40"
	                            >
	                              <div className="h-9 w-10 rounded-lg border border-slate-100 bg-slate-50 overflow-hidden shrink-0">
	                                {file.url ? (
	                                  <BlueprintImage src={file.url} alt={file.name} className="h-full w-full object-cover" />
                                ) : (
                                  <FileText className="m-2.5 h-4 w-4 text-blue-500" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
	                                <p className="truncate text-[10px] font-extrabold text-slate-800">{file.name}</p>
	                                <p className="mt-0.5 text-[8.5px] font-bold text-blue-600">{file.service}</p>
	                              </div>
                              <span className="shrink-0 rounded-md bg-slate-50 px-1.5 py-0.5 text-[7px] font-extrabold uppercase text-slate-500">
                                Drag
                              </span>
	                            </div>
	                          );
	                        })
                      )}
                    </div>
                  </div>

	                  <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-white p-3">
	                    <div className="flex items-start justify-between gap-3">
	                      <div>
	                        <div className="flex items-center gap-2">
	                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">4</span>
	                          <p className="text-[10px] font-extrabold text-slate-800">Match drawings to levels</p>
	                        </div>
	                        <p className="mt-1 text-[9.5px] font-semibold leading-4 text-slate-500">
	                          {hasExistingQuickSetupFloors
	                            ? "Change any level drawing here, then save."
		                            : `This will create ${safeQuickSetupFloorCount} level${safeQuickSetupFloorCount === 1 ? "" : "s"}. Drawings can be assigned now or later.`}
	                        </p>
	                      </div>
	                    </div>

                    <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
                      {levelDrafts.map((floor) => (
	                        <div key={floor.id} className="rounded-xl border border-slate-100 bg-slate-50/40 p-2">
	                          <div className="flex items-center justify-between gap-2">
	                            <p className="text-[10px] font-extrabold text-slate-800">{floor.name}</p>
	                            {!existingQuickSetupFloors[floor.index] && (
	                              <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[7px] font-extrabold uppercase text-blue-600">
	                                Will create
	                              </span>
	                            )}
	                          </div>
	                          <div className="mt-2 grid gap-2 md:grid-cols-2">
	                            {visibleQuickSetupServices.map((service) => (
	                              <label
                                  key={`${floor.id}-${service}`}
                                  className="min-w-0 rounded-xl border border-transparent p-1 transition-colors hover:border-blue-100 hover:bg-blue-50/30"
                                  onDragOver={(event) => {
                                    event.preventDefault();
                                  }}
                                  onDrop={(event) => {
                                    event.preventDefault();
                                    const drawingId = event.dataTransfer.getData("drawingId") || draggedDrawingId || "";
                                    assignQuickSetupDrawingToSlot(floor.index, service, drawingId);
                                    setDraggedDrawingId(null);
                                  }}
                                >
	                                <span className="mb-1 block text-[8px] font-extrabold uppercase tracking-wider text-slate-400">
		                                  {service} drawing
		                                </span>
		                                <select
	                                  value={getQuickSetupAssignmentValue(floor.index, service)}
	                                  onChange={(event) => {
	                                    assignQuickSetupDrawingToSlot(floor.index, service, event.target.value);
	                                  }}
	                                  disabled={selectedFiles.length === 0}
	                                  className="h-8 w-full rounded-lg border border-slate-100 bg-white px-2 text-[9px] font-semibold text-slate-700 outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
	                                >
		                                  <option value="">Choose drawing</option>
	                                  {selectedFiles.map((file) => (
	                                    <option key={file.id} value={file.id}>
	                                      {file.name} - {file.service}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
	                </div>

	                <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3">
		                  <div className="text-[9.5px] font-semibold text-slate-500">
			                    {safeQuickSetupFloorCount} level{safeQuickSetupFloorCount === 1 ? "" : "s"} • {selectedFiles.length} drawing{selectedFiles.length === 1 ? "" : "s"} available
	                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={closeQuickSetup}
                      className="h-9 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmQuickSetup}
                      className="h-9 rounded-xl bg-blue-600 px-4 text-xs font-extrabold text-white hover:bg-blue-700 shadow-md shadow-blue-600/10 transition-all cursor-pointer flex items-center gap-1.5"
	                    >
	                      <CheckCircle2 className="h-3.5 w-3.5" />
		                      Save zone setup
	                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Zone Floor Plan Source Modal */}
      {isBlueprintSourceModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm micro-fade-in">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-white/70 shadow-[0_28px_80px_rgba(15,23,42,0.24)] overflow-hidden">
            <div className="relative px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-white via-blue-50/35 to-slate-50">
              <div className="absolute right-12 top-0 h-20 w-20 rounded-full bg-blue-200/20 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Upload site plan</h3>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-4 max-w-sm">
                      Select a site plan from Project HUB or upload a local drawing. Alignment remains available in the setup panel.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsBlueprintSourceModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-all cursor-pointer"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {blueprintSourceMode === "source" && (
              <div className="px-5 pt-4">
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                  Choose source
                </p>
              </div>
            )}

            <input
              ref={blueprintLocalInputRef}
              type="file"
              accept="image/*,.svg"
              className="hidden"
              onChange={(e) => {
                handleBlueprintLocalUpload(e.target.files);
                e.currentTarget.value = "";
              }}
            />

            {blueprintSourceMode === "source" ? (
              <div className="grid gap-3 p-5 pt-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setBlueprintSourceMode("hub")}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm hover:border-blue-200 hover:shadow-[0_16px_36px_rgba(37,99,235,0.10)] transition-all cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
                    <FolderOpen className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">Choose from HUB</div>
                  <div className="mt-1.5 text-[10px] font-semibold leading-4 text-slate-500">
                    Browse project drawings in view-only mode and attach one to this area.
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[8.5px] font-extrabold uppercase tracking-wide text-blue-600">
                    Project files
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => blueprintLocalInputRef.current?.click()}
                  className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm hover:border-blue-200 hover:shadow-[0_16px_36px_rgba(37,99,235,0.10)] transition-all cursor-pointer"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-105 transition-transform">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="text-sm font-extrabold text-slate-900">Choose from device</div>
                  <div className="mt-1.5 text-[10px] font-semibold leading-4 text-slate-500">
                    Upload a floor plan image or SVG from your computer.
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[8.5px] font-extrabold uppercase tracking-wide text-slate-500">
                    Local upload
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-4">
                <div className="mb-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBlueprintSourceMode("source")}
                    className="h-8 rounded-lg border border-slate-100 bg-white px-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Back
                  </button>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={blueprintHubSearch}
                      onChange={(e) => setBlueprintHubSearch(e.target.value)}
                      placeholder="Search HUB drawings"
                      className="h-9 w-full rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-3 text-xs font-semibold text-slate-700 outline-hidden focus:border-blue-200 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50/50 overflow-hidden">
                  <div className="grid grid-cols-[1fr_110px_90px] gap-3 border-b border-slate-100 bg-white px-4 py-2 text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span>HUB file</span>
                    <span>Discipline</span>
                    <span className="text-right">Action</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {filteredHubBlueprintFiles.map((file) => (
                      <div key={file.id} className="grid grid-cols-[1fr_110px_90px] items-center gap-3 px-4 py-2.5 border-b border-slate-100 last:border-b-0 hover:bg-white transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-9 w-11 rounded-lg border border-slate-100 bg-white overflow-hidden shrink-0">
                            <BlueprintImage src={file.url} alt={file.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-xs font-extrabold text-slate-800">{file.name}</div>
                            <div className="text-[9px] font-semibold text-slate-400">Project HUB · View only</div>
                          </div>
                        </div>
                        <span className="rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-700 w-fit">
                          {file.service}
                        </span>
                        <button
                          type="button"
                          onClick={() => applyBlueprintOverlayToSelectedArea(file)}
                          className="justify-self-end rounded-xl bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700 transition-all cursor-pointer"
                        >
                          Choose
                        </button>
                      </div>
                    ))}
                    {filteredHubBlueprintFiles.length === 0 && (
                      <div className="py-10 text-center text-xs font-semibold text-slate-400">
                        No HUB drawings found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upload More Drawings Modal */}
      {isUploadMoreModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm micro-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100/60 shadow-[0_24px_70px_rgba(15,23,42,0.18)] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  {activeTab === "3d" ? "Upload 3D Models" : "Upload More Drawings"}
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {activeTab === "3d" ? "Add more IFC or Revit models to the spatial library." : "Add more sheets to the drawing library."}
                </p>
              </div>
              <button
                onClick={resetUploadMoreModal}
                disabled={isUploadMoreProcessing}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <input
                ref={uploadMoreInputRef}
                type="file"
                accept={activeTab === "3d" ? ".ifc,.rvt,.fbx,.obj" : "image/*,.pdf"}
                multiple
                className="hidden"
                onChange={(e) => {
                  handleUploadMoreFilesSelected(e.target.files);
                  e.currentTarget.value = "";
                }}
              />

              {/* Drag and Drop Zone Container */}
              <div
                onClick={() => {
                  if (!isUploadMoreProcessing) uploadMoreInputRef.current?.click();
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isUploadMoreProcessing) setIsDraggingOverUploadArea(true);
                }}
                onDragLeave={() => setIsDraggingOverUploadArea(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOverUploadArea(false);
                  if (!isUploadMoreProcessing) {
                    handleUploadMoreFilesSelected(e.dataTransfer.files);
                  }
                }}
                className={`w-full min-h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all duration-200 cursor-pointer select-none p-4 text-center ${
                  isDraggingOverUploadArea
                    ? "border-blue-500 bg-blue-50/70 scale-[1.02] "
                    : "border-slate-200 bg-slate-50/40 hover:bg-blue-50/20 hover:border-blue-300"
                } ${isUploadMoreProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div className={`p-2.5 rounded-xl bg-blue-50 text-blue-600 transition-transform ${isDraggingOverUploadArea ? "scale-110" : ""}`}>
                  <UploadCloud className="w-6 h-6" />
                </div>
                <span className="text-xs font-extrabold text-slate-800">
                  {stagedUploadFiles.length > 0 
                    ? `${stagedUploadFiles.length} file${stagedUploadFiles.length > 1 ? "s" : ""} selected` 
                    : (activeTab === "3d" ? "Drag & drop 3D model files here, or browse" : "Drag & drop drawings here, or browse")}
                </span>
                <span className="text-[9.5px] font-semibold text-slate-400">
                  {activeTab === "3d" ? "Supports IFC, Revit (RVT), FBX, and OBJ formats" : "Supports High-Resolution Blueprint Images and PDF sheets"}
                </span>
              </div>

              {/* Staged files with remove action */}
              {stagedUploadFiles.length > 0 && (
                <div className="max-h-28 overflow-y-auto rounded-2xl border border-slate-100/60 bg-slate-50/30 p-2 space-y-1">
                  {stagedUploadFiles.map((file, idx) => (
                    <div 
                      key={`${file.name}-${file.size}-${idx}`} 
                      className="flex items-center gap-2 rounded-xl bg-white border border-slate-100/60 px-2.5 py-1.5 hover:border-slate-350 transition-all hover:translate-x-0.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-[10px] font-bold text-slate-700">{file.name}</span>
                      <span className="text-[8px] font-semibold text-slate-400 shrink-0">{Math.max(1, Math.round(file.size / 1024))} KB</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveStagedFile(idx);
                        }}
                        disabled={isUploadMoreProcessing}
                        className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                        title="Remove File"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Modern Linear Progress Indicator */}
              {(isUploadMoreProcessing || uploadMoreFinished) && (
                <div className="rounded-2xl border border-blue-50 bg-gradient-to-r from-blue-50/10 to-indigo-50/10 p-4 space-y-1.5 ">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        {uploadMoreFinished ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            Upload finished
                          </>
                        ) : (
                          <>
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                            Uploading drawings...
                          </>
                        )}
                      </p>
                      <p className="text-[9.5px] text-slate-400 font-semibold mt-0.5">
                        {uploadMoreFinished ? "Files are now in the drawing library." : "Preparing sheets for assignment."}
                      </p>
                    </div>
                    <span className="text-xs font-extrabold text-blue-600">{uploadMoreProgress}%</span>
                  </div>
                  
                  {/* Linear Progress Bar container */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-150 relative shadow-[0_0_8px_rgba(37,99,235,0.3)]"
                      style={{ width: `${uploadMoreProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60 grid grid-cols-2 gap-2">
              <button
                onClick={resetUploadMoreModal}
                disabled={isUploadMoreProcessing}
                className="h-10 rounded-2xl border border-slate-100/80 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmUploadMore}
                disabled={stagedUploadFiles.length === 0 || isUploadMoreProcessing || uploadMoreFinished}
                className="h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-205 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold transition-all cursor-pointer"
              >
                Upload Files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Drawing Preview Modal popup */}
      {previewDrawingFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm micro-fade-in">
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100/60 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-150 flex items-center justify-between shrink-0 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-800 truncate">{previewDrawingFile.name}</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    Discipline Service: <span className="text-blue-600 font-bold">{previewDrawingFile.service}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDrawingFile(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Close Preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Large Drawing preview */}
            <div className="flex-1 bg-slate-950 flex items-center justify-center overflow-auto p-6 relative">
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
              <img
                src={previewDrawingFile.url}
                alt={previewDrawingFile.name}
                className="max-w-full max-h-full object-contain rounded shadow-2xl border border-white/5"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=90";
                }}
              />
            </div>
            
            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between shrink-0 bg-slate-50 text-[10px] text-slate-400 font-semibold">
              <span>Blueprint Resolution: High Scale Vector</span>
              <button
                onClick={() => setPreviewDrawingFile(null)}
                className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all  shadow-blue-500/10 cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
