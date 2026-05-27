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
  Loader2
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

export default function ViewerSetup() {
  // Tabs: 'map' | 'drawing' | 'drone'
  const [activeTab, setActiveTab] = useState<"map" | "drawing" | "drone" | "3d">("map");

  // Document references for measuring/bounding
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const mapContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const drawingLibraryInputRef = useRef<HTMLInputElement>(null);
  const uploadMoreInputRef = useRef<HTMLInputElement>(null);
  const drawingDropdownRef = useRef<HTMLDivElement>(null);
  const [isDrawingDropdownOpen, setIsDrawingDropdownOpen] = useState(false);

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
  const [drawingAdjustments, setDrawingAdjustments] = useState({
    zoom: 1.0,
    rotate: 0,
    panX: 0,
    panY: 0
  });
  const [isDrawingPanning, setIsDrawingPanning] = useState(false);
  const [drawingPanStart, setDrawingPanStart] = useState({ x: 0, y: 0 });
  const [isDrawingSetupModalOpen, setIsDrawingSetupModalOpen] = useState(false);
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
  const [drawingLibraryViewMode, setDrawingLibraryViewMode] = useState<"list" | "grid">("list");
  const [isDrawingLeftSetupOpen, setIsDrawingLeftSetupOpen] = useState<boolean>(true);
  const [isDrawingRightLayersOpen, setIsDrawingRightLayersOpen] = useState<boolean>(true);
  const [isUploadMoreModalOpen, setIsUploadMoreModalOpen] = useState<boolean>(false);
  const [stagedUploadFiles, setStagedUploadFiles] = useState<File[]>([]);
  const [isUploadMoreProcessing, setIsUploadMoreProcessing] = useState<boolean>(false);
  const [uploadMoreProgress, setUploadMoreProgress] = useState<number>(0);
  const [uploadMoreFinished, setUploadMoreFinished] = useState<boolean>(false);
  const [isDraggingOverUploadArea, setIsDraggingOverUploadArea] = useState<boolean>(false);
  const [drawingAnnotations, setDrawingAnnotations] = useState<Record<string, DrawingMarkup[]>>({});
  const [activeDrawingId, setActiveDrawingId] = useState<string | null>(null);
  const [activeDrawingUrl, setActiveDrawingUrl] = useState<string | null>(null);
  const [activeDrawingLabel, setActiveDrawingLabel] = useState<string>("");
  const [selectedDrawingAreaId, setSelectedDrawingAreaId] = useState<string | null>(null);
  const [active3DLink, setActive3DLink] = useState<{ zoneId: string; floorId: string; service: string } | null>(null);
  const [isDrawingStackedView, setIsDrawingStackedView] = useState<boolean>(false);

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

  const activeArea = useMemo(() => {
    const siteAreas = markups.filter((m) => m.type === "area");
    if (siteAreas.length === 0) return null;
    const found = siteAreas.find((area) => area.id === selectedDrawingAreaId);
    return found || siteAreas[0];
  }, [markups, selectedDrawingAreaId]);

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
    return activeArea?.drawingOverlay?.url || null;
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
    return activeArea ? `${activeArea.label} - Base Plan` : "";
  }, [activeTab, activeEyeDrawing, zoneDrawingConfigs, uploadedDrawingFiles, activeArea]);

  useEffect(() => {
    const siteAreas = markups.filter((m) => m.type === "area");
    if (siteAreas.length > 0 && !selectedDrawingAreaId) {
      setSelectedDrawingAreaId(siteAreas[0].id);
    }
  }, [markups, selectedDrawingAreaId]);

  // Tooltips & Notifications
  const [toastMessage, setToastMessage] = useState<string | null>("Welcome! Load drawing or click Map Setup tools to start.");

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
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
      label: `Site Boundary ${markups.length + 1}`,
      points: pointsToSubmit,
      drawingOverlay: null
    };
    setMarkups([...markups, newMarkup]);
    setSelectedMarkupId(id);
    setSelectedNestedLayerId(null);
    setDrawingPoints([]);
    setRedoPoints([]);
    setActiveTool("pan");
    focusMapOnMarkup(newMarkup);
    triggerToast("Completed site boundary polygon!");
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
    if (!activeArea) {
      triggerToast("Select a site boundary before creating a zone.", "warning");
      return;
    }

    if (!activeArea.drawingOverlay) {
      triggerToast("This site boundary needs a blueprint overlay before creating zones.", "warning");
      return;
    }

    setSelectedDrawingAreaId(activeArea.id);
    setSelectedMarkupId(activeArea.id);
    setSelectedNestedLayerId(null);
    setActiveEyeDrawing(null);
    setReturnToDrawingAfterZone(true);
    setActiveTab("map");
    startChildDrawingLayer(activeArea.id);
    window.setTimeout(() => {
      focusMapOnMarkup(activeArea);
    }, 80);
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
    triggerToast("Added polygon drawing zone");
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
          triggerToast("Drawing uploaded successfully! Switch to Map Setup to place it.");
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
          <p className="font-bold uppercase tracking-wider text-[10px]">No areas defined</p>
          <p className="text-[9px] mt-1 leading-normal max-w-[200px] mx-auto">
            Draw site boundaries on the map to define setup areas.
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
                ? "bg-blue-50 border border-blue-200 text-blue-700 shadow-sm"
                : "bg-slate-50 border border-slate-100 text-slate-800 hover:bg-slate-100"
            }`}
          >
            <PolygonIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="text-[11px] font-bold text-slate-800 truncate flex-1">{area.label}</span>
            <span className="text-[7.5px] uppercase font-bold bg-blue-100 text-blue-750 px-1.5 py-0.5 rounded">Area</span>
          </div>

          {/* Nested Small Areas (Zones) under this Area */}
          {isAreaActive && area.childLayers && area.childLayers.length > 0 && (
            <div className="ml-3 pl-3 border-l border-slate-200 space-y-3 py-1">
              {/* Base Layout Overlay option */}
              {area.drawingOverlay && (
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
                  <span className="truncate flex-1">Base Layout Blueprint Overlay</span>
                  <span className="text-[7px] uppercase bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-bold">Base</span>
                </button>
              )}

              {area.childLayers.map((zone) => {
                const zoneConfig = zoneDrawingConfigs[zone.id];
                const floorsList = zoneConfig?.floorsList || [];

                return (
                  <div key={zone.id} className="space-y-1.5">
                    {/* Zone Heading */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      <span className="text-[10px] font-extrabold text-slate-750 truncate flex-1">{zone.label}</span>
                      <span className="text-[7.5px] uppercase font-bold text-slate-400">Zone</span>
                    </div>

                    {/* Zone Floor Levels */}
                    {floorsList.length === 0 ? (
                      <p className="text-[8px] text-slate-400 italic pl-3.5">No floor levels configured.</p>
                    ) : (
                      <div className="ml-2 pl-2 border-l border-slate-150 space-y-2">
                        {floorsList.map((floor) => {
                          const assignedServices = getAssignedServicesForZone(zone.id, floor);

                          return (
                            <div key={floor.id} className="space-y-1">
                              <div className="flex items-center gap-1 text-[8.5px] font-bold text-slate-600">
                                <span className="px-1 py-0.2 bg-slate-100 rounded text-slate-500 font-mono">L</span>
                                <span>{floor.name}</span>
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
                                          <span className="truncate" title={file.name}>{file.name}</span>
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
                                            className="p-1 rounded text-slate-400 hover:text-blue-650 hover:bg-slate-100 transition-all shrink-0 cursor-pointer flex items-center gap-0.5 border border-slate-100"
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
          <p className="font-bold uppercase tracking-wider text-[10px]">No areas defined</p>
          <p className="text-[9px] mt-1 leading-normal max-w-[200px] mx-auto">
            Draw site boundaries on the map to define setup areas.
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
                ? "bg-blue-50 border border-blue-200 text-blue-700 shadow-sm"
                : "bg-slate-50 border border-slate-100 text-slate-800 hover:bg-slate-100"
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
                  <div key={zone.id} className="space-y-1.5">
                    {/* Zone Heading */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      <span className="text-[10px] font-extrabold text-slate-750 truncate flex-1">{zone.label}</span>
                      <span className="text-[7.5px] uppercase font-bold text-slate-400">Zone</span>
                    </div>

                    {/* Zone Floor Levels */}
                    {floorsList.length === 0 ? (
                      <p className="text-[8px] text-slate-400 italic pl-3.5">No floor levels configured.</p>
                    ) : (
                      <div className="ml-2 pl-2 border-l border-slate-150 space-y-2">
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
                                        className={`flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg border transition-all ${
                                          active3DLink?.zoneId === zone.id && active3DLink?.floorId === floor.id && active3DLink?.service === service
                                            ? "bg-blue-50 border-blue-200 text-blue-800 font-extrabold shadow-sm"
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
          <p className="font-bold uppercase tracking-wider text-[10px]">No areas defined</p>
          <p className="text-[9px] mt-1 leading-normal max-w-[200px] mx-auto">
            Draw site boundaries on the map to define setup areas.
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
                ? "bg-blue-50 border border-blue-200 text-blue-700 shadow-sm"
                : "bg-slate-50 border border-slate-100 text-slate-800 hover:bg-slate-100"
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
                  <div key={zone.id} className="space-y-1.5">
                    {/* Zone Heading */}
                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                      <span className="text-[10px] font-extrabold text-slate-750 truncate flex-1">{zone.label}</span>
                      <span className="text-[7.5px] uppercase font-bold text-slate-400">Zone</span>
                    </div>

                    {/* Assigned drone capture file or empty state */}
                    <div className="ml-2 pl-2 border-l border-slate-150 space-y-2">
                      {file ? (
                        <div
                          className={`flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-lg border transition-all ${
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

  const handleDrawingViewerWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    setDrawingAdjustments((prev) => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom * zoomFactor, 0.6), 5)
    }));
  };

  const handleDrawingViewerMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDrawingPanning(true);
    setDrawingPanStart({
      x: e.clientX - drawingAdjustments.panX,
      y: e.clientY - drawingAdjustments.panY
    });
  };

  const handleDrawingViewerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingPanning) return;
    setDrawingAdjustments((prev) => ({
      ...prev,
      panX: e.clientX - drawingPanStart.x,
      panY: e.clientY - drawingPanStart.y
    }));
  };

  const stopDrawingViewerPan = () => {
    setIsDrawingPanning(false);
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
      triggerToast(`Uploaded ${nextFiles.length} drawing${nextFiles.length > 1 ? "s" : ""}`);
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
    triggerToast("Added demo drawing set");
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
            className={`absolute left-1 top-1 rounded bg-white/90 border border-slate-200 px-1.5 py-0.5 text-[8px] font-bold text-slate-700 shadow-sm cursor-pointer hover:bg-white transition-all ${
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
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm"
                  : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" style={{ color: markup.color }} />
              <span className="text-[11px] truncate flex-1 font-semibold">{markup.label}</span>
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
                  ? "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm"
                  : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
              }`}
            >
              <CircleIcon className="w-3.5 h-3.5" style={{ color: markup.color }} />
              <span className="text-[11px] truncate flex-1 font-semibold">{markup.label}</span>
              <span className="text-[8px] uppercase tracking-wider text-slate-400 shrink-0 font-bold bg-slate-100 px-1 py-0.5 rounded">Circle</span>
            </button>
          </div>
        );
      }

      if (markup.type === "area") {
        const hasChildren = markup.drawingOverlay || (markup.childLayers && markup.childLayers.length > 0);
        
        return (
          <div key={markup.id} className="space-y-1.5">
            {/* Top-level Area Row */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setSelectedMarkupId(markup.id);
                  setSelectedNestedLayerId(null);
                }}
                className={`flex-1 flex items-center gap-2 rounded-xl px-2.5 py-2 text-left border transition-all ${
                  isMarkupSelected
                    ? "bg-blue-50/80 border-blue-200 text-blue-700 font-bold shadow-sm"
                    : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <PolygonIcon className="w-3.5 h-3.5 shrink-0" style={{ color: markup.color }} />
                <span className="text-[11px] truncate flex-1 font-semibold">{markup.label}</span>
                <span className="text-[8px] uppercase tracking-wider text-slate-400 shrink-0 font-bold bg-slate-100 px-1 py-0.5 rounded">Area</span>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMarkupId(markup.id);
                  setSelectedNestedLayerId(null);
                  startChildDrawingLayer();
                }}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:text-blue-600 text-slate-400 hover:border-blue-200 transition-all cursor-pointer"
                title="Add inner zone"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {/* Children container with vertical connection lines */}
            {hasChildren && (
              <div className="relative ml-4 pl-4 border-l border-slate-200 space-y-1.5 py-0.5">
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
                      className="flex-1 flex items-center gap-2 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 px-2 py-1.5 text-left transition-all text-slate-600"
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
                    <div key={layer.id} className="space-y-1.5">
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
                              ? "bg-blue-50 border-blue-200 text-blue-700 font-bold shadow-sm"
                              : "bg-white border-slate-100 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: layer.color }} />
                          <span className="text-[10px] truncate flex-1 font-semibold">{layer.label}</span>
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
      <div className="absolute top-6 left-6 z-40 bg-white/95 backdrop-blur border border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] px-4 py-2.5 rounded-2xl flex items-center gap-3 w-80">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Compass className="w-4 h-4 animate-spin-slow" />
        </div>
        <form onSubmit={handleSearch} className="flex-1 flex gap-1 items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or coordinate..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
          />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>
      )}

      {/* 2. Top Center Tab Selector */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-white/90 backdrop-blur border border-slate-200 p-1.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center gap-1">
        <button
          onClick={() => setActiveTab("map")}
          className={`px-5 py-2 text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 ${
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
            className={`px-5 py-2 text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              activeTab === "drawing" || activeTab === "3d"
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>{activeTab === "3d" ? "3D setup" : "Drawing setup"}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>
          
          {isDrawingDropdownOpen && (
            <div className="absolute left-0 mt-2 w-40 rounded-xl bg-white border border-slate-100 shadow-2xl py-1 z-[110] animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => {
                  if (selectedMarkup?.type === "area" && selectedMarkup.drawingOverlay) {
                    setSelectedDrawingAreaId(selectedMarkup.id);
                    setActiveEyeDrawing(null);
                  }
                  setActiveTab("drawing");
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
          onClick={() => setActiveTab("drone")}
          className={`px-5 py-2 text-xs font-bold rounded-xl transition-all hover:scale-105 active:scale-95 ${
            activeTab === "drone"
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "text-slate-600 hover:bg-slate-50"
          }`}
        >
          Drone setup
        </button>
      </div>

      {/* 3. Floating Toast Banner */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white/95 backdrop-blur border border-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* -------------------- TAB 1: MAP SETUP WORKSPACE -------------------- */}
      {activeTab === "map" && (
        <div className="w-full h-full relative flex">
          
          {/* Step-by-Step Child Guidance Banner */}
          {(activeTool === "polygon" || activeTool === "nestedPolygon") && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-200 px-5 py-3.5 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,0.12)] flex items-center gap-3.5 max-w-sm text-left transition-all duration-300 animate-in fade-in slide-in-from-top-4">
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

              {/* RENDER DYNAMIC FLOATING SETTINGS CONTROLS ON THE MAP */}
              {activeTool === "pan" && markups.flatMap((markup) => getCalibrationTargets(markup)).map((target) => {
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
                      <span className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-slate-700 text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/gear:opacity-100 transition-opacity pointer-events-none border border-slate-200">
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
                        <span className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white text-slate-700 text-[9px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/addzone:opacity-100 transition-opacity pointer-events-none border border-slate-200">
                          Draw New Zone
                        </span>
                      </button>
                    )}

                    {/* Floating Calibration Alignment Card Popover */}
                    {isCalibrating && (
                      <div
                        onClick={(e) => e.stopPropagation()} // Prevent map pan click triggers
                        className="absolute top-10 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.16)] w-72 text-slate-800 pointer-events-auto z-50 flex flex-col gap-3"
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
                          className="w-full h-9 mt-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors cursor-pointer"
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
          <div className="absolute top-1/2 -translate-y-1/2 left-6 z-40 bg-white border border-slate-200 p-1.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col gap-1.5 panel-slide-left">
            
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
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-200">
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
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-200">
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
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-200">
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
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-200">
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
              <div className="absolute left-14 top-1/2 -translate-y-1/2 w-48 bg-white text-slate-700 p-2.5 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-150 z-50 text-left border border-slate-200">
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
            <div className="absolute top-24 right-6 z-40 w-72 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-3 flex flex-col gap-2.5 max-h-[45vh] overflow-y-auto">
              
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
                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 flex justify-between items-center">
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
                      className="py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
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

                  <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 flex justify-between items-center">
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
                      className="py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1 shadow-sm"
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
            <div className="absolute bottom-6 right-6 z-40 w-80 h-[48vh] min-h-[300px] max-h-[430px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-3 flex flex-col gap-2.5 overflow-hidden panel-slide-right">
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

              <div className="min-h-0 flex-1 overflow-y-auto space-y-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2 pr-1">
                {renderGlobalLayersTree()}
              </div>
            </div>
          )}

          {/* Collapsed Layers Panel Floating Toggle Button */}
          {!isLayersPanelOpen && (activeTool !== "polygon" || drawingPoints.length === 0) && activeTool !== "nestedPolygon" && markups.length > 0 && (
            <button
              onClick={() => setIsLayersPanelOpen(true)}
              className="absolute bottom-6 right-6 z-40 w-10 h-10 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 group/layerbtn"
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
              className="absolute top-6 right-6 z-40 w-10 h-10 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Open Setup Panel"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}

          {selectedMarkupId && activeTool !== "polygon" && activeTool !== "nestedPolygon" && isInspectorPanelOpen && (
            <div className="absolute top-6 right-6 z-40 w-80 h-[34vh] min-h-[220px] max-h-[285px] bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-[0_10px_35px_rgba(15,23,42,0.08)] p-3 flex flex-col gap-2.5 overflow-hidden transition-all panel-slide-right">
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
                    <div className="space-y-1.5">
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

                        <div className="relative w-5 h-5 rounded-full overflow-hidden border border-slate-200 hover:border-slate-400 cursor-pointer flex items-center justify-center bg-slate-50">
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
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 space-y-2.5">
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
                      <div className="space-y-2.5">
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
                          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-center">
                            <FolderOpen className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                            <p className="text-[10px] text-slate-700 font-bold mb-2">No drawing linked</p>
                            <button
                              onClick={() => handleAssignDrawing(null)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold shadow-sm shadow-blue-500/10 transition-all cursor-pointer inline-flex items-center gap-1 animate-pulse"
                            >
                              <Plus className="w-3 h-3" />
                              Link Blueprint Layout
                            </button>
                          </div>
                        ) : (
                          (() => {
                            const overlay = markup.drawingOverlay!;
                            const overlayId = markup.id;

                            return (
                              <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100">
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

                                <div className="rounded-xl border border-slate-100 bg-white p-2.5 space-y-2.5">
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
                                    className="w-full h-7.5 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors cursor-pointer"
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
              className="absolute left-[328px] top-28 z-40 bg-blue-600 text-white border border-blue-500 rounded-xl p-3.5 shadow-2xl w-64 micro-fade-in flex gap-3 items-start select-none"
              style={{
                filter: "drop-shadow(0 20px 25px rgba(29, 78, 216, 0.2))"
              }}
            >
              {/* Pointing triangle */}
              <div className="absolute top-6 -left-1.5 w-3 h-3 bg-blue-600 border-l border-b border-blue-500 rotate-45" />

              <Sparkles className="w-4.5 h-4.5 text-sky-200 shrink-0 mt-0.5 animate-pulse" />
              
              <div className="space-y-2 flex-1">
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
                    className="px-2 py-0.5 bg-white hover:bg-blue-50 text-blue-600 rounded text-[8.5px] font-extrabold transition-all shadow-sm cursor-pointer"
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
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm animate-pulse">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      {activeTab === "drone" ? "Setup Drone Photos" : (activeTab === "3d" ? "Setup 3D Models" : "Setup Project Drawings")}
                    </h4>
                    <p className="text-[10px] text-slate-400 max-w-[200px] mx-auto mt-1 leading-normal">
                      {activeTab === "drone" ? "Upload site drone photos to display on top of zone drawings." : (activeTab === "3d" ? "Upload and align 3D BIM models to project floor levels." : "Assign layout sheets to floor levels and small site zones.")}
                    </p>
                  </div>
                  <div className="w-full space-y-2 px-4">
                    <button
                      onClick={() => drawingLibraryInputRef.current?.click()}
                      className="w-full h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {activeTab === "drone" ? "Upload Drone Photos" : (activeTab === "3d" ? "Upload 3D Models" : "Upload Drawings")}
                    </button>
                  </div>
                </div>
              ) : (
                /* Main Configuration State */
                <>
                  {/* Sub Tabs Navigation */}
                  <div className="flex border-b border-slate-100 bg-slate-50/50 px-2 shrink-0">
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
                        <div className="flex items-center justify-between">
                          <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider">
                            {activeTab === "drone" ? "Uploaded Drone Photos" : (activeTab === "3d" ? "Uploaded 3D Models" : "Uploaded Drawings")} ({currentFilesList.length})
                          </h4>
                          {/* List / Grid View Toggles */}
                          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                            <button
                              onClick={() => setDrawingLibraryViewMode("list")}
                              className={`p-1 rounded-md transition-all cursor-pointer ${
                                drawingLibraryViewMode === "list"
                                  ? "bg-white text-blue-600 shadow-sm"
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
                                  ? "bg-white text-blue-600 shadow-sm"
                                  : "text-slate-400 hover:text-slate-600"
                              }`}
                              title="Grid View"
                            >
                              <LayoutGrid className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

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
                                  (activeTab === "3d" ? "No 3D models uploaded yet. Use the upload option to add one." : "No drawings uploaded yet. Click Upload Drawings in the top bar.")
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
                                      className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-slate-350 transition-all hover-lift micro-fade-in aspect-square relative group cursor-grab active:cursor-grabbing"
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
                                      <div className="p-2 border-t border-slate-100 bg-white shrink-0">
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
                                          <span className="text-[7.5px] font-extrabold text-blue-600 bg-blue-55 px-1 py-0.5 rounded">
                                            {drawing.service}
                                          </span>
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
                            <div className="space-y-2">
                              {filtered.map((drawing, index) => {
                                const isEditing = editingDrawingId === drawing.id;
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
                                    className="bg-white border border-slate-150 rounded-lg p-2.5 shadow-sm flex items-center justify-between gap-1.5 hover:border-slate-350 transition-all hover-lift micro-fade-in cursor-grab active:cursor-grabbing"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                      {/* Small DP Preview Thumbnail */}
                                      <div className="relative w-8 h-8 rounded border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
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
                                        <div className="absolute bottom-0 right-0 bg-blue-600 text-white text-[6.5px] px-0.5 rounded-tl font-bold">
                                          {index + 1}
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
                                        <span className="text-[10px] font-bold text-slate-750 truncate" title={drawing.name}>
                                          {drawing.name}
                                        </span>
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
                        <h4 className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          Configure Zones
                        </h4>
                        {activeArea ? (
                          <div className="space-y-3">
                            <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 space-y-2.5">
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
                                <p className="text-[8.5px] text-slate-400 italic">No inner zones defined on the map setup.</p>
                              ) : (
                                activeArea.childLayers.map((zone) => {
                                  const zoneConfig = zoneDrawingConfigs[zone.id];
                                  const floorsList = zoneConfig?.floorsList || [];
                                  const servicesForZone = getZoneServices(zone.id);

                                  return (
                                    <div key={zone.id} className="bg-white border border-slate-155 rounded-lg p-2.5 space-y-2 shadow-sm">
                                      {/* Zone Title */}
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
                                        <span className="text-[10px] font-extrabold text-slate-700 truncate flex-1">
                                          {zone.label}
                                        </span>
                                      </div>

                                      {activeTab === "drone" ? (
                                        /* Drone photo assignment selector */
                                        <div className="space-y-1.5 pt-1">
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
                                              className="flex-1 min-w-0 text-ellipsis h-7 bg-slate-50 border border-slate-200 rounded-lg text-[9.5px] font-semibold text-slate-755 px-2 focus:outline-none focus:border-blue-500 cursor-pointer"
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
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-2 flex items-center justify-between gap-1.5">
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
                                              className="w-10 h-6 border border-slate-200 rounded text-center text-[9px] font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                                            />
                                          </div>
                                          <button
                                            onClick={() => handleCreateFloors(zone.id, floorInputs[zone.id] || 2)}
                                            className="h-6 px-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[9px] font-bold transition-all shadow-sm cursor-pointer"
                                          >
                                            Create
                                          </button>
                                        </div>
                                      ) : (
                                        /* List of floor levels configured */
                                        <div className="space-y-2">
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
                                          
                                          <div className="space-y-1.5">
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
                                                  className="border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-55 transition-all hover-lift micro-fade-in p-2 cursor-grab active:cursor-grabbing"
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
                                                    <div className="mt-2 pt-2 border-t border-slate-200/50 space-y-2 bg-white/70 p-2 rounded-md micro-fade-in">
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
                                                              className="min-w-0 flex-1 h-7 border border-slate-200 rounded-md pl-2 pr-8 text-[9px] font-semibold text-slate-700 bg-white focus:outline-none focus:border-blue-500 cursor-pointer truncate"
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
                            Create site area boundaries on the Map Setup tab first.
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
                        triggerToast("All drawing configurations applied! Hierarchy saved to Layers panel.");
                      }}
                      className="h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-500/10"
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
            <div className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur px-4 flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-2">
                {!isDrawingLeftSetupOpen && (
                  <button
                    onClick={() => setIsDrawingLeftSetupOpen(true)}
                    className="h-8.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    {activeTab === "3d" ? "3D Setup" : (activeTab === "drone" ? "Drone Setup" : "Drawing Setup")}
                  </button>
                )}
                <button
                  onClick={handleCreateZoneFromDrawingSetup}
                  disabled={!activeArea?.drawingOverlay}
                  className="h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-blue-500/10"
                  title={activeArea?.drawingOverlay ? "Create a new zone inside this site boundary" : "Link a blueprint overlay before creating zones"}
                >
                  <PolygonIcon className="w-3.5 h-3.5" />
                  Create Zone
                </button>
                {currentDrawingUrl && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl px-2.5 py-1 text-xs flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-800">{currentDrawingLabel}</span>
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
                    className={`h-8.5 px-3 rounded-lg border text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-sm ${
                      isDrawingStackedView
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-emerald-500/10 animate-pulse"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    {isDrawingStackedView ? "Disable 3D Stack" : "Stacked 3D View"}
                  </button>
                )}
                {hasLoadedDrawings && (
                  <button
                    onClick={() => setIsUploadMoreModalOpen(true)}
                    className="h-8.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm shadow-blue-500/10"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload More
                  </button>
                )}
              </div>
            </div>

            {/* Viewport Canvas or Empty State */}
            <div className="flex-1 min-h-0 relative flex items-center justify-center p-6 overflow-hidden">
              {currentDrawingUrl ? (
                <div
                  className={`w-full h-full relative overflow-hidden flex items-center justify-center rounded-2xl border border-slate-200 bg-white ${
                    isDrawingPanning ? "cursor-grabbing" : "cursor-grab"
                  }`}
                  onWheel={handleDrawingViewerWheel}
                  onMouseDown={handleDrawingViewerMouseDown}
                  onMouseMove={handleDrawingViewerMouseMove}
                  onMouseUp={stopDrawingViewerPan}
                  onMouseLeave={stopDrawingViewerPan}
                >
                  <div
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
                                    <span className="text-[7.5px] font-extrabold uppercase tracking-wider bg-white/90 px-1 py-0.2 rounded shadow-sm border border-slate-100">
                                      {layer.floorName}
                                    </span>
                                    <span className="ml-1 text-[7.5px] font-extrabold uppercase tracking-wider bg-white/90 px-1 py-0.2 rounded shadow-sm border border-slate-100">
                                      {layer.service}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer.zoneColor }} />
                                    <span className="text-[7px] font-bold text-slate-800 bg-white/95 px-1 py-0.2 rounded shadow-sm">
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
                                         className="px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[7px] font-extrabold shadow-sm transition-all pointer-events-auto cursor-pointer whitespace-nowrap ml-1"
                                         title="Flatten to 2D sheet editor"
                                       >
                                         Focus 2D
                                       </button>
                                     )}
                                  </div>
                                </div>

                                {/* Drawing Image/Visual or Wireframe Mockup */}
                                 {activeTab === "drawing" ? (
                                   <div className="flex-1 min-h-0 relative overflow-hidden rounded bg-white flex items-center justify-center p-1 border border-slate-100 shadow-inner" style={{ transform: "translateZ(4px)" }}>
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
                                    <span className="bg-blue-600 text-white font-extrabold px-1 rounded animate-pulse shadow-sm">
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
                          className="absolute overflow-visible pointer-events-none"
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
                                className="absolute inset-0 overflow-hidden rounded-md pointer-events-none"
                                style={{ backgroundColor: `${layer.color}18`, clipPath }}
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
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded border border-slate-200 shadow-sm pointer-events-auto flex items-center gap-1">
                            {activeTab === "drone" && zoneDroneAssignments[layer.id] && (
                              <Camera className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                            )}
                            <span className="text-[7.5px] font-extrabold text-slate-800 whitespace-nowrap">{layer.label}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Canvas adjustments bar */}
                  <div className="absolute right-4 bottom-4 bg-white/90 backdrop-blur border border-slate-200/80 p-2.5 rounded-xl flex items-center gap-3.5 shadow-md">
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
                <div className="max-w-md w-full text-center bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm flex flex-col items-center gap-5">
                  <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100 shadow-sm shadow-amber-500/5">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Map setup is not complete</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-normal">
                      First draw a site boundary in Map Setup and link a blueprint. Your drawing and zones will appear here automatically after setup.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab("map");
                      setActiveTool("polygon");
                      setDrawingPoints([]);
                      setRedoPoints([]);
                      triggerToast("Draw a site boundary in Map Setup, then link a blueprint.");
                    }}
                    className="w-full h-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <PolygonIcon className="w-4 h-4" />
                    Go to Map Setup
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* C. Right Sidebar: Collapsible Layers Tree */}
          {isDrawingRightLayersOpen ? (
            <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0 z-30 shadow-[-4px_0_24px_rgba(15,23,42,0.02)] transition-all">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    {activeTab === "3d" ? "BIM Model Hierarchy" : (activeTab === "drone" ? "Drone Captures" : "Blueprint Hierarchy")}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
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
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {activeTab === "drone" ? renderDroneLayersTree() : (activeTab === "3d" ? render3DModelLayersTree() : renderDrawingLayersTree())}
              </div>
            </div>
          ) : (
            /* Floating small layers toggle on the right side if collapsed */
            <button
              onClick={() => setIsDrawingRightLayersOpen(true)}
              className="absolute right-4 bottom-4 z-40 w-10 h-10 bg-white hover:bg-slate-50 text-blue-600 border border-slate-200 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95"
              title="Open Layers Tree"
            >
              <Layers className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Redundant 3D Setup Workspace removed in favor of unified 2D/3D layout */}

      {/* Upload More Drawings Modal */}
      {isUploadMoreModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-sm micro-fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-[0_24px_70px_rgba(15,23,42,0.18)] overflow-hidden">
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
                    ? "border-blue-500 bg-blue-50/70 scale-[1.02] shadow-sm"
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
                <div className="max-h-28 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/50 p-2 space-y-1.5">
                  {stagedUploadFiles.map((file, idx) => (
                    <div 
                      key={`${file.name}-${file.size}-${idx}`} 
                      className="flex items-center gap-2 rounded-xl bg-white border border-slate-100 px-2.5 py-1.5 hover:border-slate-350 transition-all hover:translate-x-0.5"
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
                <div className="rounded-2xl border border-blue-50 bg-gradient-to-r from-blue-50/10 to-indigo-50/10 p-4 space-y-2.5 shadow-sm">
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
                className="h-10 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
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
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
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
                className="h-8 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
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
