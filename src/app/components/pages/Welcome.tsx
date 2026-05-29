import { useState, useEffect, useRef } from "react";
import { useSidebar } from "../../context/SidebarContext";
import {
  Sparkles,
  Check,
  HardHat,
  Wrench,
  Box,
  Settings,
  MapPin,
  Send,
  Building,
  Loader2,
  FolderOpen,
  Sliders,
  Plus,
  Navigation,
  LayoutGrid,
  Eye,
  Zap,
  Users,
  Paintbrush,
  Layers,
  Cpu,
  Wind,
  Droplet,
  Percent,
  Handshake,
  Workflow,
  Compass,
  DollarSign,
  Briefcase,
  MessageSquare
} from "lucide-react";
import confetti from "canvas-confetti";

interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  targetDate: string;
  status: "planning" | "active" | "completed";
  activePhases: string[];
  progress: number;
  teamStructure?: string[];
}

type MapPinSelection = {
  label: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
};

const PHASE_OPTIONS = [
  { id: "pre-con", label: "Pre-Construction", desc: "Schedules & BIM specs", icon: Sparkles, route: "/pre-construction/workspace?tab=home" },
  { id: "construction", label: "Construction", desc: "Onsite logging & safety", icon: HardHat, route: "/construction" },
  { id: "site-survey", label: "Site Survey", desc: "Drone topography scans", icon: MapPin, route: "/site-survey" },
  { id: "bim-migration", label: "BIM Migration", desc: "CAD conversion & clashes", icon: Settings, route: "/dashboard" },
  { id: "interior", label: "Interior Design", desc: "Spatial material specifications", icon: Box, route: "/dashboard" },
  { id: "fac-mgmt", label: "Facility Management", desc: "Operations & maintenance", icon: Wrench, route: "/facility-management" },
];

const TEAM_TEMPLATE = [
  "Design team",
  "Structure",
  "Architecture",
  "Mechanical",
  "HVAC",
  "Plumbing",
  "Sales",
  "Partner",
  "BIM",
  "Contractor",
  "Survey team",
  "Finance"
];

const TEAM_TEMPLATE_DESCRIPTIONS: Record<string, string> = {
  "Design team": "UI/UX, visual design, and experience development.",
  Structure: "Grids, beams, slab inputs, and reinforcement reviews.",
  Architecture: "Spatial layout, consultant sync, and drawing sets.",
  Mechanical: "Mechanical system routing and machinery layout.",
  HVAC: "Heating, ventilation, air conditioning coordination.",
  Plumbing: "Water supply, drainage, and utility layout reviews.",
  Sales: "Client onboarding, pitch decks, and revenue streams.",
  Partner: "External relations, sub-contractors, and stakeholder sync.",
  BIM: "3D model migration, model auditing, and clash checks.",
  Contractor: "Site fabrication updates and material supply sync.",
  "Survey team": "Drone photography, site boundaries, and elevation scans.",
  Finance: "Invoice approvals, resource allocation, and payouts."
};

const TEAM_TEMPLATE_ICONS: Record<string, any> = {
  "Design team": Paintbrush,
  Structure: Layers,
  Architecture: Building,
  Mechanical: Cpu,
  HVAC: Wind,
  Plumbing: Droplet,
  Sales: Percent,
  Partner: Handshake,
  BIM: Workflow,
  Contractor: HardHat,
  "Survey team": Compass,
  Finance: DollarSign
};

const TEAM_THEMES: Record<string, {
  activeBg: string;
  activeBorder: string;
  activeText: string;
  inactiveBg: string;
  inactiveBorder: string;
  inactiveText: string;
  iconActiveBg: string;
  iconInactiveBg: string;
}> = {
  "Design team": {
    activeBg: "bg-rose-50/70", activeBorder: "border-rose-250", activeText: "text-rose-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-rose-600 text-white", iconInactiveBg: "bg-rose-50 text-rose-500 group-hover:bg-rose-100"
  },
  Structure: {
    activeBg: "bg-amber-50/70", activeBorder: "border-amber-250", activeText: "text-amber-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-amber-600 text-white", iconInactiveBg: "bg-amber-50 text-amber-500 group-hover:bg-amber-100"
  },
  Architecture: {
    activeBg: "bg-indigo-50/70", activeBorder: "border-indigo-250", activeText: "text-indigo-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-indigo-600 text-white", iconInactiveBg: "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100"
  },
  Mechanical: {
    activeBg: "bg-teal-50/70", activeBorder: "border-teal-250", activeText: "text-teal-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-teal-600 text-white", iconInactiveBg: "bg-teal-50 text-teal-500 group-hover:bg-teal-100"
  },
  HVAC: {
    activeBg: "bg-sky-50/70", activeBorder: "border-sky-250", activeText: "text-sky-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-sky-600 text-white", iconInactiveBg: "bg-sky-50 text-sky-500 group-hover:bg-sky-100"
  },
  Plumbing: {
    activeBg: "bg-blue-50/70", activeBorder: "border-blue-250", activeText: "text-blue-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-blue-600 text-white", iconInactiveBg: "bg-blue-50 text-blue-500 group-hover:bg-blue-100"
  },
  Sales: {
    activeBg: "bg-emerald-50/70", activeBorder: "border-emerald-250", activeText: "text-emerald-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-emerald-600 text-white", iconInactiveBg: "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100"
  },
  Partner: {
    activeBg: "bg-violet-50/70", activeBorder: "border-violet-250", activeText: "text-violet-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-violet-600 text-white", iconInactiveBg: "bg-violet-50 text-violet-500 group-hover:bg-violet-100"
  },
  BIM: {
    activeBg: "bg-purple-50/70", activeBorder: "border-purple-250", activeText: "text-purple-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-purple-600 text-white", iconInactiveBg: "bg-purple-50 text-purple-500 group-hover:bg-purple-100"
  },
  Contractor: {
    activeBg: "bg-stone-50/80", activeBorder: "border-stone-250", activeText: "text-stone-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-stone-600 text-white", iconInactiveBg: "bg-stone-50 text-stone-500 group-hover:bg-stone-100"
  },
  "Survey team": {
    activeBg: "bg-lime-50/70", activeBorder: "border-lime-250", activeText: "text-lime-700 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-lime-650 text-white", iconInactiveBg: "bg-lime-50 text-lime-600 group-hover:bg-lime-100"
  },
  Finance: {
    activeBg: "bg-amber-50/50", activeBorder: "border-yellow-250", activeText: "text-amber-800 font-extrabold",
    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
    iconActiveBg: "bg-yellow-600 text-white", iconInactiveBg: "bg-yellow-50 text-yellow-600 group-hover:bg-yellow-100"
  }
};

// Custom Neural Nodes SVG Component
function NeuralNodeCircle() {
  return (
    <svg className="w-28 h-28 text-blue-600/90 animate-spin-slow filter drop-shadow-xs" viewBox="0 0 100 100" fill="currentColor">
      <circle cx="50" cy="18" r="3.5" />
      <circle cx="68" cy="22" r="2.5" />
      <circle cx="82" cy="36" r="3" />
      <circle cx="86" cy="54" r="2.5" />
      <circle cx="78" cy="72" r="3.5" />
      <circle cx="62" cy="84" r="2" />
      <circle cx="44" cy="84" r="3" />
      <circle cx="26" cy="76" r="2.5" />
      <circle cx="16" cy="60" r="3.5" />
      <circle cx="16" cy="40" r="2" />
      <circle cx="26" cy="24" r="3" />
      
      <circle cx="50" cy="30" r="2.5" />
      <circle cx="64" cy="36" r="2" />
      <circle cx="70" cy="50" r="3" />
      <circle cx="64" cy="64" r="2.5" />
      <circle cx="50" cy="70" r="2" />
      <circle cx="36" cy="64" r="3" />
      <circle cx="30" cy="50" r="2" />
      <circle cx="36" cy="36" r="2.5" />
      
      {/* fine connector lines */}
      <line x1="50" y1="18" x2="68" y2="22" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="68" y1="22" x2="64" y2="36" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="68" y1="22" x2="82" y2="36" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="82" y1="36" x2="70" y2="50" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="82" y1="36" x2="86" y2="54" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="86" y1="54" x2="78" y2="72" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="78" y1="72" x2="64" y2="64" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="78" y1="72" x2="62" y2="84" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="62" y1="84" x2="50" y2="70" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="62" y1="84" x2="44" y2="84" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="44" y1="84" x2="26" y2="76" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="26" y1="76" x2="36" y2="64" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="26" y1="76" x2="16" y2="60" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="16" y1="60" x2="30" y2="50" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="16" y1="60" x2="16" y2="40" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="16" y1="40" x2="26" y2="24" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="26" y1="24" x2="36" y2="36" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="26" y1="24" x2="50" y2="18" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="50" y1="18" x2="50" y2="30" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      
      <line x1="50" y1="30" x2="64" y2="36" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="64" y1="36" x2="70" y2="50" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="70" y1="50" x2="64" y2="64" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="64" y1="64" x2="50" y2="70" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="50" y1="70" x2="36" y2="64" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="36" y1="64" x2="30" y2="50" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="30" y1="50" x2="36" y2="36" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
      <line x1="36" y1="36" x2="50" y2="30" stroke="currentColor" strokeWidth="0.6" opacity="0.3" />
    </svg>
  );
}

export function Welcome() {
  const { setMode } = useSidebar();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [showRecent, setShowRecent] = useState(false);
  
  // Dynamic names/roles cycle
  const ROLES = ["Deep", "Project Admin", "BIM Coordinator", "Lead VDC Engineer", "Workspace Owner"];
  const [roleIndex, setRoleIndex] = useState(0);
  const [fadeRole, setFadeRole] = useState(true);

  // Conversational steps state
  const [step, setStep] = useState(1); // 1: Name, 2: Location, 3: Team template, 4: Loading Setup
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectTeamStructure, setProjectTeamStructure] = useState<string[]>([]);
  const [mapPickerOpen, setMapPickerOpen] = useState(false);
  const [mapPickerQuery, setMapPickerQuery] = useState("");
  const [mapPinSelection, setMapPinSelection] = useState<MapPinSelection>({
    label: "Austin, TX - Downtown Development Zone",
    lat: 30.2672,
    lng: -97.7431,
    x: 50,
    y: 50
  });
  const [selectedPhases, setSelectedPhases] = useState<string[]>(["Pre-Construction"]);
  const [loadingSteps, setLoadingSteps] = useState<any[]>([
    { id: 1, label: "Setting up your HUB", sub: "Initializing workspace configuration...", icon: LayoutGrid, done: false, active: true },
    { id: 2, label: "Building 3D environment", sub: "Mapping coordinate spaces and meshes...", icon: Box, done: false, active: false },
    { id: 3, label: "Doing viewer setup", sub: "Attaching default catalogs and WebGL viewports...", icon: Eye, done: false, active: false },
    { id: 4, label: "Finalizing workspace", sub: "Deploying secure runtime container...", icon: Zap, done: false, active: false },
    { id: 5, label: "We are creating Channels", sub: "Deploying custom preset channel containers...", icon: MessageSquare, done: false, active: false },
  ]);
  const [newProjectDetails, setNewProjectDetails] = useState<{ name: string; location: string; teams?: string[] } | null>(null);
  const [countdown, setCountdown] = useState(4);
  const getPostSetupRoute = (phases = selectedPhases) =>
    phases.includes("Pre-Construction") ? "/pre-construction/workspace?tab=home" : "/projects";

  // Cycle greeting name/roles
  useEffect(() => {
    const roleInterval = setInterval(() => {
      setFadeRole(false);
      setTimeout(() => {
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
        setFadeRole(true);
      }, 250);
    }, 2800);

    return () => clearInterval(roleInterval);
  }, []);

  // Countdown timer for step 5 Success redirect
  useEffect(() => {
    if (step === 5) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = getPostSetupRoute();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const MOCK_SUGGESTIONS = [
    "Austin, TX - Downtown Development Zone",
    "Miami, FL - Coastal Wharf District",
    "San Francisco, CA - Silicon Valley Hub",
    "New York, NY - Manhattan Plaza",
    "Chicago, IL - Loop Financial Complex",
    "Seattle, WA - Puget Sound Marina",
    "Los Angeles, CA - Century City Office",
    "Boston, MA - Seaport Innovation Hub"
  ];

  const getLocationCoordinates = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes("miami")) return { lat: 25.7617, lng: -80.1918 };
    if (normalized.includes("san francisco")) return { lat: 37.7749, lng: -122.4194 };
    if (normalized.includes("new york")) return { lat: 40.7128, lng: -74.006 };
    if (normalized.includes("chicago")) return { lat: 41.8781, lng: -87.6298 };
    if (normalized.includes("seattle")) return { lat: 47.6062, lng: -122.3321 };
    if (normalized.includes("los angeles")) return { lat: 34.0522, lng: -118.2437 };
    if (normalized.includes("boston")) return { lat: 42.3601, lng: -71.0589 };
    return { lat: 30.2672, lng: -97.7431 };
  };

  const openMapPicker = (label: string, coords?: { lat: number; lng: number }) => {
    const nextCoords = coords || getLocationCoordinates(label);
    setMapPickerQuery(label);
    setMapPinSelection({
      label,
      lat: nextCoords.lat,
      lng: nextCoords.lng,
      x: 50,
      y: 50
    });
    setMapPickerOpen(true);
  };

  const beginTeamTemplateStep = () => {
    const shuffled = [...TEAM_TEMPLATE].sort(() => 0.5 - Math.random());
    const randomCount = Math.floor(Math.random() * 2) + 3; // Picks 3 or 4
    const selected = shuffled.slice(0, randomCount);
    const orderedSelected = TEAM_TEMPLATE.filter(team => selected.includes(team));
    setProjectTeamStructure(orderedSelected);
    setStep(3);
  };

  const confirmMapLocation = () => {
    const locationLabel = `${mapPinSelection.label} (${mapPinSelection.lat.toFixed(5)}, ${mapPinSelection.lng.toFixed(5)})`;
    setInputValue(locationLabel);
    setProjectLocation(locationLabel);
    setMapPickerOpen(false);
    beginTeamTemplateStep();
  };

  const handleUseCurrentLocation = () => {
    setInputValue("Detecting location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            openMapPicker("Current location", {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          }, 800);
        },
        (error) => {
          setTimeout(() => {
            openMapPicker("Austin, TX (Default Location)", { lat: 30.2672, lng: -97.7431 });
          }, 800);
        },
        { timeout: 5000 }
      );
    } else {
      setInputValue("Austin, TX (Default Location)");
    }
  };

  // Load projects from localStorage
  useEffect(() => {
    setMode("main");
    const stored = localStorage.getItem("bimbox_projects");
    if (stored) {
      try {
        setProjects(JSON.parse(stored));
      } catch (e) {
        setProjects([]);
      }
    }
  }, [setMode]);

  const handleSendPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = inputValue.trim();
    if (step === 1 && !val) return;

    setInputValue("");
    
    if (step === 1) {
      setProjectName(val);
      setStep(2);
    } else if (step === 2) {
      const nextLocation = val || "Location not specified";
      if (val) {
        openMapPicker(nextLocation);
      } else {
        setProjectLocation(nextLocation);
        beginTeamTemplateStep();
      }
    }
  };

  const handleTeamTemplateChoice = (useTemplate: boolean) => {
    const teams = useTemplate ? projectTeamStructure : [];
    setProjectTeamStructure(teams);
    triggerLoadingSequence(projectName, projectLocation || "Location not specified", teams);
  };

  const handleToggleTeamTemplate = (team: string) => {
    setProjectTeamStructure(prev =>
      prev.includes(team)
        ? prev.filter(item => item !== team)
        : TEAM_TEMPLATE.filter(item => item === team || prev.includes(item))
    );
  };

  const handleTogglePhase = (phaseLabel: string) => {
    setSelectedPhases([phaseLabel]);
  };

  const handleConfirmPhases = () => {
    // Left for backward compatibility / step 3 fallback
    setStep(4);
    let currentIdx = 0;
    const interval = setInterval(() => {
      setLoadingSteps(prev => {
        const next = [...prev];
        if (currentIdx < next.length) {
          next[currentIdx] = { ...next[currentIdx], done: true };
          currentIdx++;
          return next;
        } else {
          clearInterval(interval);
          finishProjectSetup(projectName, projectLocation);
          return prev;
        }
      });
    }, 900);
  };

  const finishProjectSetup = (pName: string, pLoc: string, teams = projectTeamStructure) => {
    const projectToAdd: Project = {
      id: "p_" + Date.now(),
      name: pName,
      location: pLoc,
      type: "Commercial",
      targetDate: "TBD",
      status: "active",
      activePhases: selectedPhases.length > 0 ? selectedPhases : ["Pre-Construction"],
      progress: 0,
      teamStructure: teams,
    };

    const updated = [projectToAdd, ...(projects || [])];
    setProjects(updated);
    localStorage.setItem("bimbox_projects", JSON.stringify(updated));
    localStorage.setItem("active_project", JSON.stringify(projectToAdd));

    setTimeout(() => {
      window.location.href = getPostSetupRoute(projectToAdd.activePhases);
    }, 500);
  };

  const triggerLoadingSequence = (pName: string, pLoc: string, teams = projectTeamStructure) => {
    setStep(4);
    
    // Reset steps state on start
    setLoadingSteps([
      { id: 1, label: "Setting up your HUB", sub: "Initializing workspace configuration...", icon: LayoutGrid, done: false, active: true },
      { id: 2, label: "Building 3D environment", sub: "Mapping coordinate spaces and meshes...", icon: Box, done: false, active: false },
      { id: 3, label: "Doing viewer setup", sub: "Attaching default catalogs and WebGL viewports...", icon: Eye, done: false, active: false },
      { id: 4, label: "Finalizing workspace", sub: "Deploying secure runtime container...", icon: Zap, done: false, active: false },
      { id: 5, label: "We are creating Channels", sub: "Deploying custom preset channel containers...", icon: MessageSquare, done: false, active: false },
    ]);

    let currentIdx = 0;
    const interval = setInterval(() => {
      setLoadingSteps(prev => {
        const next = prev.map((s, idx) => {
          if (idx === currentIdx) {
            return { ...s, done: true, active: false };
          }
          if (idx === currentIdx + 1) {
            return { ...s, active: true };
          }
          return s;
        });

        currentIdx++;
        if (currentIdx >= prev.length) {
          clearInterval(interval);
          
          setTimeout(() => {
            setStep(5);
            setCountdown(4);
            confetti({
              particleCount: 120,
              spread: 80,
              origin: { y: 0.6 }
            });
            
            setNewProjectDetails({ name: pName, location: pLoc, teams });
            
            const projectToAdd: Project = {
              id: "p_" + Date.now(),
              name: pName,
              location: pLoc,
              type: "Commercial",
              targetDate: "TBD",
              status: "active",
              activePhases: selectedPhases.length > 0 ? selectedPhases : ["Pre-Construction"],
              progress: 0,
              teamStructure: teams,
            };

            const updated = [projectToAdd, ...projects];
            setProjects(updated);
            localStorage.setItem("bimbox_projects", JSON.stringify(updated));
            localStorage.setItem("active_project", JSON.stringify(projectToAdd));
            window.setTimeout(() => {
              window.location.href = getPostSetupRoute(projectToAdd.activePhases);
            }, 650);
          }, 800);
        }
        return next;
      });
    }, 1200);
  };

  const handleSelectRecent = (project: Project) => {
    localStorage.setItem("active_project", JSON.stringify(project));
    window.location.href = `/dashboard?project=${project.id}`;
  };

  const activeStep = loadingSteps.find(s => s.active && !s.done) || loadingSteps[loadingSteps.length - 1];

  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-6 relative overflow-hidden select-none">
      
      {/* Liquid fluid morphing keyframes and slow spins */}
      <style>{`
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spinSlow 40s linear infinite;
        }
        @keyframes liquidFlow1 {
          0% {
            transform: translate(0px, 0px) scale(1) rotate(0deg);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          33% {
            transform: translate(60px, -30px) scale(1.18) rotate(120deg);
            border-radius: 40% 60% 50% 50% / 50% 40% 60% 50%;
          }
          66% {
            transform: translate(-50px, 50px) scale(0.85) rotate(240deg);
            border-radius: 50% 40% 60% 55% / 40% 60% 40% 60%;
          }
          100% {
            transform: translate(0px, 0px) scale(1) rotate(360deg);
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
        }
        @keyframes liquidFlow2 {
          0% {
            transform: translate(0px, 0px) scale(1.1) rotate(180deg);
            border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%;
          }
          50% {
            transform: translate(-60px, 40px) scale(0.9) rotate(300deg);
            border-radius: 70% 40% 60% 30% / 40% 50% 60% 50%;
          }
          100% {
            transform: translate(0px, 0px) scale(1.1) rotate(540deg);
            border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%;
          }
        }
        .animate-liquid1 {
          animation: liquidFlow1 26s ease-in-out infinite alternate;
        }
        .animate-liquid2 {
          animation: liquidFlow2 32s ease-in-out infinite alternate;
        }
        @keyframes borderBeamRotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        .animate-border-beam {
          animation: borderBeamRotate 4s linear infinite;
        }
      `}</style>

      {/* Deepened Bottom Mesh Gradient Container with Top Fade-Mask */}
      <div className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none z-0 overflow-hidden bg-transparent">
        {/* Soft, rich color liquid blurs confined to the bottom region */}
        <div className="absolute bottom-[-80px] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-300/50 blur-[130px] animate-liquid1" />
        <div className="absolute bottom-[-100px] right-[10%] w-[550px] h-[550px] rounded-full bg-sky-300/60 blur-[140px] animate-liquid2" />
        <div className="absolute bottom-[-60px] left-[40%] w-[450px] h-[450px] rounded-full bg-pink-200/55 blur-[125px] animate-liquid1" style={{ animationDelay: "-8s" }} />
        
        {/* Transparency Fade Mask: Smoothly transitions the solid white top into the bottom mesh */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white via-white/80 to-transparent z-10" />
      </div>

      {!showChat ? (
        // 1. Greeting Screen (shifted up, reduced margins)
        <div className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center animate-in fade-in duration-350 transform -translate-y-8">
          
          {/* Node Circle Logo */}
          <div className="mb-4 flex justify-center hover:scale-105 transition-transform duration-300">
            <NeuralNodeCircle />
          </div>

          {/* Hello Greeting Header */}
          <h1 className="text-5xl font-bold tracking-tight mb-2 select-none">
            <span className="text-slate-400/90 font-light">Hello, </span>
            <span className={`text-blue-600 font-extrabold inline-block transition-all duration-300 ${
              fadeRole ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
            }`}>
              {ROLES[roleIndex]}
            </span>
          </h1>

          {/* Proper Phrasing Message */}
          <p className="text-slate-500 text-xs font-semibold max-w-lg mx-auto leading-relaxed mb-6">
            Initialize high-performance 3D BIM coordination, field scheduling trackers, and asset lifecycle containers.
          </p>

          {/* Phase Module Selector */}
          <div className="w-full max-w-xl bg-white/80 rounded-2xl p-4 mb-6 text-left shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 px-1">
              Select one module
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PHASE_OPTIONS.map((opt) => {
                const isChecked = selectedPhases.includes(opt.label);
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleTogglePhase(opt.label)}
                    className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all items-center select-none ${
                      isChecked 
                        ? "bg-blue-50 text-slate-900 ring-1 ring-blue-500/70" 
                        : "bg-slate-50/70 hover:bg-slate-100/70 text-slate-700"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      isChecked ? "bg-white text-blue-600" : "bg-white/80 text-slate-500"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 leading-snug">{opt.label}</div>
                      <div className="text-[10px] text-slate-450 font-semibold mt-0.5 truncate">{opt.desc}</div>
                    </div>
                    <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ml-auto transition-all ${
                      isChecked ? "bg-blue-600 text-white" : "bg-white ring-1 ring-slate-200"
                    }`}>
                      {isChecked && <Check className="w-2.5 h-2.5 stroke-[3.5] text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simple blue color and rounded AI button */}
          <button
            onClick={() => {
              setStep(1);
              setInputValue("");
              setProjectName("");
              setProjectLocation("");
              setProjectTeamStructure([]);
              setShowChat(true);
            }}
            className="inline-flex items-center gap-2 px-10 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold tracking-wide transition-all duration-250 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Project</span>
          </button>

          {/* Open Recent Workspaces (Ultra-Minimal Link) */}
          {projects.length > 0 && (
            <div className="mt-10 relative">
              <button
                type="button"
                onClick={() => setShowRecent(!showRecent)}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 font-bold transition-colors cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Open Recent Workspaces</span>
              </button>

              {showRecent && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 bg-white border border-slate-200/80 rounded-xl p-1.5 shadow-xl flex flex-col gap-0.5 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                  {projects.slice(0, 3).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectRecent(p)}
                      className="w-full text-left px-2.5 py-1.5 hover:bg-slate-50 text-slate-650 hover:text-slate-900 rounded-lg text-[10px] font-bold transition-all truncate flex items-center gap-2 cursor-pointer"
                    >
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        // 2. Chat Conversational Prompt Bar Layout
        <div className="max-w-xl w-full text-center relative z-10 flex flex-col items-center p-4 animate-in fade-in zoom-in-95 duration-250 transform -translate-y-24">
          
          {/* Question Text Prompt Header */}
          <h2 className="text-xl font-bold text-blue-650 mb-6 tracking-wide select-none animate-in fade-in duration-200">
            {step === 1 && "Configure new project container"}
            {step === 2 && `Got it! Where is "${projectName}" located?`}
            {step === 3 && "Create a team structure template?"}
            {step === 4 && "Initializing project workspace container..."}
          </h2>

          {/* The Prompt Bar Container with Border Beam Glow */}
          {step <= 2 && (
            <div className="w-full relative z-20 animate-in fade-in duration-200">
              
              {/* Outer Beam Wrapper */}
              <div className="w-full relative p-[1.5px] rounded-2xl transition-all duration-300 group shadow-[0_12px_36px_-8px_rgba(59,130,246,0.14)] focus-within:shadow-[0_20px_48px_-10px_rgba(59,130,246,0.22)] bg-slate-200/60 overflow-hidden relative z-20 hover:bg-slate-300/50">
                {/* Animated border beam background - active on focus */}
                <div className="absolute top-1/2 left-1/2 w-[200%] aspect-square opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none z-0 animate-border-beam bg-[conic-gradient(from_0deg,transparent_45%,#3b82f6_70%,#82b4ff_92%,transparent_100%)]" />
                
                <form
                  onSubmit={handleSendPrompt}
                  className="w-full bg-white rounded-[15px] p-3 flex flex-col gap-3 relative z-10"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="shrink-0 pl-1 animate-spin-slow">
                      <div className="w-5 h-5 text-blue-605">
                        <svg viewBox="0 0 100 100" fill="currentColor">
                          <circle cx="50" cy="18" r="4" />
                          <circle cx="82" cy="36" r="3.5" />
                          <circle cx="78" cy="72" r="4" />
                          <circle cx="44" cy="84" r="3.5" />
                          <circle cx="16" cy="60" r="4" />
                          <circle cx="26" cy="24" r="3.5" />
                          <circle cx="50" cy="40" r="3" />
                          <circle cx="64" cy="54" r="3" />
                          <circle cx="36" cy="64" r="3" />
                          <line x1="50" y1="18" x2="82" y2="36" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                          <line x1="82" y1="36" x2="78" y2="72" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                          <line x1="78" y1="72" x2="44" y2="84" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                          <line x1="44" y1="84" x2="16" y2="60" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                          <line x1="16" y1="60" x2="26" y2="24" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                          <line x1="26" y1="24" x2="50" y2="18" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
                        </svg>
                      </div>
                    </div>
                    
                    <input
                      type="text"
                      autoFocus
                      placeholder={step === 1 ? "Enter name" : "Enter location (optional)"}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-hidden border-none p-0"
                    />
                    
                    <button
                      type="submit"
                      disabled={step === 1 && !inputValue.trim()}
                      className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 shadow-md shadow-blue-500/10 hover:shadow-lg active:scale-[0.9] disabled:pointer-events-none"
                      title={step === 2 && !inputValue.trim() ? "Skip location" : "Continue"}
                    >
                      <span className="text-base font-extrabold">↑</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 border-t border-slate-100 pt-2 shrink-0 select-none">
                    {step === 1 ? (
                      <>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/50 text-blue-600 rounded-lg text-[10px] font-bold border border-blue-100">
                          <Sparkles className="w-3 h-3 text-blue-500" />
                          <span>AI Setup Assistant</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold italic ml-auto">
                          Enter project container name to start
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 text-slate-650 rounded-lg text-[10px] font-bold border border-slate-200 truncate max-w-[240px]">
                          <Building className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">Name: {projectName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setStep(1);
                            setInputValue(projectName);
                          }}
                          className="text-[10px] text-slate-450 hover:text-blue-600 font-bold ml-auto transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>← Edit Name</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const skippedLocation = "Location not specified";
                            setInputValue("");
                            setProjectLocation(skippedLocation);
                            beginTeamTemplateStep();
                          }}
                          className="text-[10px] text-slate-450 hover:text-blue-600 font-bold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Skip Location</span>
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>

              {/* Suggestions Panel - Google Maps style */}
              {step === 2 && (
                <div className="absolute top-[105%] inset-x-0 bg-white border border-blue-100/70 rounded-2xl p-2.5 shadow-[0_15px_40px_-10px_rgba(59,130,246,0.18)] flex flex-col gap-1 z-30 text-left animate-in fade-in slide-in-from-top-2 duration-200">
                  
                  {/* Current Location button */}
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50/50 rounded-xl text-xs font-bold text-blue-600 transition-all cursor-pointer border border-dashed border-blue-200/80"
                  >
                    <Navigation className="w-3.5 h-3.5 animate-pulse text-blue-500" />
                    <span>Use my current location</span>
                  </button>

                  {/* Suggestion header */}
                  <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider px-3 pt-2 pb-1.5 border-t border-slate-50 mt-1">
                    Google Maps Suggestions
                  </div>

                  {/* Suggestions list */}
                  {MOCK_SUGGESTIONS.filter(item => 
                    inputValue.trim() === "Detecting location..." ||
                    inputValue.trim() === "" || 
                    item.toLowerCase().includes(inputValue.toLowerCase())
                  ).slice(0, 4).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => {
                        setInputValue(loc);
                        setProjectLocation(loc);
                        openMapPicker(loc);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-650 hover:text-slate-900 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{loc}</span>
                    </button>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* Team Structure Template */}
          {step === 3 && (
            <div className="w-full max-w-xl bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 shadow-xs">
              <div className="flex items-start gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-800">Create a team structure template?</div>
                  <p className="text-[11px] text-slate-450 font-semibold leading-5 mt-1">
                    Select the channel presets you want to automatically spin up for this project workspace.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                {TEAM_TEMPLATE.map((team, idx) => {
                  const isSelected = projectTeamStructure.includes(team);
                  const IconComp = TEAM_TEMPLATE_ICONS[team] || Users;
                  const theme = TEAM_THEMES[team] || {
                    activeBg: "bg-blue-50/70", activeBorder: "border-blue-250", activeText: "text-blue-700 font-extrabold",
                    inactiveBg: "bg-white", inactiveBorder: "border-slate-150", inactiveText: "text-slate-700",
                    iconActiveBg: "bg-blue-600 text-white", iconInactiveBg: "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
                  };

                  return (
                    <button
                      key={team}
                      type="button"
                      role="checkbox"
                      aria-checked={isSelected}
                      onClick={() => handleToggleTeamTemplate(team)}
                      style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
                      className={`group relative rounded-xl border p-2.5 text-left transition-all cursor-pointer flex flex-col gap-2.5 items-start animate-in fade-in slide-in-from-top-2 duration-300 ${
                        isSelected
                          ? `${theme.activeBg} ${theme.activeBorder} shadow-xs`
                          : `${theme.inactiveBg} ${theme.inactiveBorder} hover:bg-slate-50/80 hover:${theme.activeBorder}`
                      }`}
                    >
                      <div className="flex w-full items-center justify-between pointer-events-none">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? theme.iconActiveBg : theme.iconInactiveBg
                        }`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? `${theme.iconActiveBg.split(" ")[0]} border-transparent text-white`
                            : "border-slate-300 bg-white text-transparent group-hover:border-slate-400"
                        }`}>
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                        </div>
                      </div>
                      
                      <div className="min-w-0 w-full mt-0.5 pointer-events-none">
                        <span className={`block text-[11px] font-bold truncate ${
                          isSelected ? theme.activeText : theme.inactiveText
                        }`}>
                          {team}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-end mt-1 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-1.5 border border-slate-200 rounded-full text-xs font-bold text-slate-650 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => handleTeamTemplateChoice(false)}
                  className="px-5 py-1.5 border border-slate-200 rounded-full text-xs font-bold text-slate-650 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={() => handleTeamTemplateChoice(true)}
                  className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full text-xs transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/10 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  {projectTeamStructure.length > 0 ? "Create Teams" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {/* Setup Loading Logs Checklist */}
          {step === 4 && (
            <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-[32px] p-6 flex flex-col animate-in fade-in zoom-in-95 duration-250 shadow-[0_20px_50px_rgba(59,130,246,0.12)]">
              
              {/* Central Pulsing Ring Loader */}
              <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/10 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-blue-500/20 animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shadow-xs">
                  {activeStep && activeStep.icon && (
                    <activeStep.icon className="w-8 h-8 text-blue-600 animate-pulse" />
                  )}
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">
                  Setting up your Workspace
                </h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mt-1">
                  Initializing secure runtime container...
                </p>
              </div>

              {/* The Checklist */}
              <div className="w-full px-5 py-2 flex flex-col gap-3">
                {loadingSteps.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex items-center gap-3.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                        s.done 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600 animate-scale-in" 
                          : s.active 
                            ? "bg-blue-50 border-blue-100 text-blue-600 animate-pulse" 
                            : "bg-white border-slate-200 text-slate-400"
                      }`}>
                        {s.done ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <Icon className="w-4.5 h-4.5" />
                        )}
                      </div>
                      
                      <div className="min-w-0 text-left flex-1">
                        <div className={`text-xs font-bold transition-colors ${
                          s.done 
                            ? "text-slate-600" 
                            : s.active 
                              ? "text-blue-605" 
                              : "text-slate-400"
                        }`}>
                          {s.label}
                        </div>
                        <div className={`text-[10px] font-semibold mt-0.5 truncate transition-colors ${
                          s.active ? "text-slate-500" : "text-slate-400/80"
                        }`}>
                          {s.sub}
                        </div>
                      </div>

                      {s.active && !s.done && (
                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                      )}
                      {s.done && (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 shrink-0">
                          Done
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 5: Success Feedback Screen */}
          {step === 5 && (
            <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-[32px] p-8 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-350 shadow-[0_20px_50px_rgba(59,130,246,0.12)]">
              
              {/* Confetti / Success Ring */}
              <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-50 border border-emerald-100 animate-pulse" />
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-scale-in">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                Project Hub Initialized!
              </h2>
              
              <p className="text-slate-500 text-xs font-semibold max-w-sm mb-6 leading-relaxed">
                Your high-performance 3D workspace has been successfully constructed and is ready for collaboration.
              </p>

              {/* Project Card summary */}
              <div className="w-full bg-slate-50/60 border border-slate-200/50 rounded-2xl p-4.5 text-left mb-6 flex flex-col gap-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <span className="text-slate-400">Project Name</span>
                  <span>{newProjectDetails?.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 border-t border-slate-100 pt-2.5">
                  <span className="text-slate-400">Location</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {newProjectDetails?.location}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Modules</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {selectedPhases.map((phase) => (
                      <span key={phase} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[9px] font-bold">
                        {phase}
                      </span>
                    ))}
                  </div>
                </div>
                {newProjectDetails?.teams && newProjectDetails.teams.length > 0 && (
                  <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-2.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Team Template</span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {newProjectDetails.teams.map((team) => (
                        <span key={team} className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-[9px] font-bold">
                          {team}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Enter Workspace Button */}
              <button
                onClick={() => {
                  window.location.href = `/projects`;
                }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-blue-500/10 hover:shadow-lg active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enter Workspace</span>
                <span className="text-[10px] bg-blue-500/50 px-2 py-0.5 rounded-full font-medium">
                  {countdown}s
                </span>
              </button>
            </div>
          )}

          {/* Cancel Setup link */}
          {step < 4 && (
            <button
              onClick={() => {
                setShowChat(false);
                setStep(1);
                setProjectName("");
                setProjectLocation("");
                setProjectTeamStructure([]);
                setSelectedPhases(["Pre-Construction"]);
              }}
              className="mt-6 text-xs text-slate-400 hover:text-blue-600 font-bold tracking-wide transition-colors cursor-pointer"
            >
              Cancel Setup
            </button>
          )}
        </div>
      )}

      {mapPickerOpen && (
        <div className="fixed inset-0 z-[200] bg-white animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-100">
            <iframe
              title="Project location map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapPinSelection.lng - 0.035}%2C${mapPinSelection.lat - 0.025}%2C${mapPinSelection.lng + 0.035}%2C${mapPinSelection.lat + 0.025}&layer=mapnik&marker=${mapPinSelection.lat}%2C${mapPinSelection.lng}`}
              className="h-full w-full border-0"
            />
            <button
              type="button"
              aria-label="Set pin location"
              onClick={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                const x = ((event.clientX - rect.left) / rect.width) * 100;
                const y = ((event.clientY - rect.top) / rect.height) * 100;
                const lngOffset = (x - 50) * 0.0007;
                const latOffset = (50 - y) * 0.0005;
                setMapPinSelection((prev) => ({
                  ...prev,
                  x,
                  y,
                  lat: prev.lat + latOffset,
                  lng: prev.lng + lngOffset
                }));
              }}
              className="absolute inset-0 cursor-crosshair bg-transparent"
            />
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full"
              style={{ left: `${mapPinSelection.x}%`, top: `${mapPinSelection.y}%` }}
            >
              <div className="relative flex flex-col items-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] ring-4 ring-white">
                  <MapPin className="h-5 w-5 fill-current" />
                </div>
                <span className="mt-1 h-3 w-3 rounded-full bg-blue-600/25 blur-[2px]" />
              </div>
            </div>
          </div>

          <div className="absolute left-1/2 top-5 w-[min(760px,calc(100%-32px))] -translate-x-1/2 rounded-3xl border border-white/80 bg-white/95 p-3 shadow-[0_20px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <span className="absolute inset-0 rounded-2xl bg-blue-500/35 animate-ping" />
                <span className="absolute -inset-1 rounded-[20px] border border-blue-300/60 animate-pulse" />
                <MapPin className="relative h-5 w-5 fill-current" />
              </div>
              <div className="relative min-w-0 flex-1">
                <input
                  value={mapPickerQuery}
                  onChange={(event) => {
                    const value = event.target.value;
                    const coords = getLocationCoordinates(value);
                    setMapPickerQuery(value);
                    setMapPinSelection((prev) => ({
                      ...prev,
                      label: value,
                      lat: coords.lat,
                      lng: coords.lng,
                      x: 50,
                      y: 50
                    }));
                  }}
                  placeholder="Search or enter exact project location"
                  className="h-10 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-hidden focus:border-blue-300 focus:bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => setMapPickerOpen(false)}
                className="h-10 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={confirmMapLocation}
                className="h-10 rounded-2xl bg-blue-600 px-5 text-xs font-bold text-white shadow-md shadow-blue-600/20 hover:bg-blue-700"
              >
                Done
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-1 text-[10px] font-semibold text-slate-500">
              <span className="truncate">Click anywhere on the map to drop the exact project pin.</span>
              <span className="shrink-0 font-mono text-slate-400">
                {mapPinSelection.lat.toFixed(5)}, {mapPinSelection.lng.toFixed(5)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
