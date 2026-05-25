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
  Navigation
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  location: string;
  type: string;
  targetDate: string;
  status: "planning" | "active" | "completed";
  activePhases: string[];
  progress: number;
}

const PHASE_OPTIONS = [
  { id: "pre-con", label: "Pre-Construction", desc: "Schedules & BIM specs", icon: Sparkles, route: "/pre-construction" },
  { id: "construction", label: "Construction", desc: "Onsite logging & safety", icon: HardHat, route: "/construction" },
  { id: "site-survey", label: "Site Survey", desc: "Drone topography scans", icon: MapPin, route: "/site-survey" },
  { id: "bim-migration", label: "BIM Migration", desc: "CAD conversion & clashes", icon: Settings, route: "/dashboard" },
  { id: "interior", label: "Interior Design", desc: "Spatial material specifications", icon: Box, route: "/dashboard" },
  { id: "fac-mgmt", label: "Facility Management", desc: "Operations & maintenance", icon: Wrench, route: "/facility-management" },
];

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
  const [step, setStep] = useState(1); // 1: Name, 2: Location, 3: Phases, 4: Loading Setup
  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  const [loadingSteps, setLoadingSteps] = useState<{ label: string; done: boolean }[]>([
    { label: "Creating project container...", done: false },
    { label: "Setting up active phase modules...", done: false },
    { label: "Attaching default catalogs and schemas...", done: false },
    { label: "Finalizing workspace environment...", done: false },
  ]);

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

  const handleUseCurrentLocation = () => {
    setInputValue("Detecting location...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setTimeout(() => {
            setInputValue("Miami, FL (Current Location)");
          }, 800);
        },
        (error) => {
          setTimeout(() => {
            setInputValue("Austin, TX (Default Location)");
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
    if (!val) return;

    setInputValue("");
    
    if (step === 1) {
      setProjectName(val);
      setStep(2);
    } else if (step === 2) {
      setProjectLocation(val);
      setStep(3);
    }
  };

  const handleTogglePhase = (phaseLabel: string) => {
    setSelectedPhases(prev => 
      prev.includes(phaseLabel) 
        ? prev.filter(p => p !== phaseLabel) 
        : [...prev, phaseLabel]
    );
  };

  const handleConfirmPhases = () => {
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
          finishProjectSetup();
          return prev;
        }
      });
    }, 900);
  };

  const finishProjectSetup = () => {
    const projectToAdd: Project = {
      id: "p_" + Date.now(),
      name: projectName,
      location: projectLocation,
      type: "Commercial",
      targetDate: "TBD",
      status: "active",
      activePhases: selectedPhases.length > 0 ? selectedPhases : ["Pre-Construction"],
      progress: 0,
    };

    const updated = [projectToAdd, ...(projects || [])];
    setProjects(updated);
    localStorage.setItem("bimbox_projects", JSON.stringify(updated));
    localStorage.setItem("active_project", JSON.stringify(projectToAdd));

    setTimeout(() => {
      window.location.href = `/projects?project=${projectToAdd.id}`;
    }, 500);
  };

  const handleSelectRecent = (project: Project) => {
    localStorage.setItem("active_project", JSON.stringify(project));
    window.location.href = `/dashboard?project=${project.id}`;
  };

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
        <div className="max-w-2xl w-full text-center relative z-10 flex flex-col items-center animate-in fade-in duration-350 transform -translate-y-24">
          
          {/* Node Circle Logo */}
          <div className="mb-5 flex justify-center hover:scale-105 transition-transform duration-300">
            <NeuralNodeCircle />
          </div>

          {/* Hello Greeting Header */}
          <h1 className="text-6xl font-bold tracking-tight mb-2.5 select-none">
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

          {/* Rounded Elevated AI button */}
          <button
            onClick={() => setShowChat(true)}
            className="inline-flex items-center gap-2 px-10 py-3.5 bg-gradient-to-b from-[#4BA1FF] to-[#1B6CFB] border-t border-[#82C0FF]/50 text-white rounded-full text-sm font-semibold tracking-wide transition-all duration-250 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/35 hover:from-[#61AEFF] hover:to-[#2B77FF] hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
            {step === 3 && "Choose operational phase modules to initialize"}
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
                      placeholder={step === 1 ? "Enter name" : "Enter location (e.g. Austin, TX)"}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 outline-hidden border-none p-0"
                    />
                    
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="w-8 h-8 rounded-full bg-gradient-to-b from-[#4BA1FF] to-[#1B6CFB] border-t border-[#82C0FF]/40 disabled:opacity-40 text-white flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/30 hover:from-[#61AEFF] hover:to-[#2B77FF] active:scale-[0.9] disabled:pointer-events-none"
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
                        setStep(3);
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

          {/* Phase Configuration List */}
          {step === 3 && (
            <div className="w-full max-w-lg bg-white border border-blue-200/60 rounded-2xl p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200 shadow-[0_15px_45px_-12px_rgba(59,130,246,0.16)]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {PHASE_OPTIONS.map((opt) => {
                  const isChecked = selectedPhases.includes(opt.label);
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleTogglePhase(opt.label)}
                      className={`flex gap-3 p-3 border rounded-xl cursor-pointer transition-all items-start select-none ${
                        isChecked 
                          ? "border-blue-500 bg-blue-50/20 text-blue-900" 
                          : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isChecked ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-550"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-bold text-slate-800">{opt.label}</div>
                        <div className="text-[10px] text-slate-400 font-semibold mt-0.5 truncate">{opt.desc}</div>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ml-auto ${
                        isChecked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-350"
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-end mt-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-650 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirmPhases}
                  className="px-5 py-2 bg-gradient-to-b from-[#4BA1FF] to-[#1B6CFB] border-t border-[#82C0FF]/50 text-white font-semibold rounded-xl text-xs transition-all duration-200 cursor-pointer shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/35 hover:from-[#61AEFF] hover:to-[#2B77FF] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Launch Container
                </button>
              </div>
            </div>
          )}

          {/* Setup Loading Logs Checklist */}
          {step === 4 && (
            <div className="w-full max-w-sm bg-white border border-blue-200/60 rounded-2xl p-5 flex flex-col gap-3 text-left animate-in fade-in zoom-in-95 duration-200 shadow-[0_15px_45px_-12px_rgba(59,130,246,0.16)] animate-pulse">
              {loadingSteps.map((s, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {s.done ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 animate-scale-in">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
                  )}
                  <span className={`text-xs font-semibold ${s.done ? "text-slate-800" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                </div>
              ))}
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
                setSelectedPhases([]);
              }}
              className="mt-6 text-xs text-slate-400 hover:text-slate-650 font-bold tracking-wide transition-colors cursor-pointer"
            >
              Cancel Setup
            </button>
          )}
        </div>
      )}
    </div>
  );
}
