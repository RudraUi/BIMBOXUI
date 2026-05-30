import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Grid,
  PhoneOff,
  Pin,
  Coffee,
  Sun,
  Plus,
  Search,
  Users,
  MessageSquare,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  UserPlus,
  Calendar,
  Smile,
  Pencil,
  ArrowLeft,
  ListTodo,
  LogIn,
  Mail,
  Link
} from "lucide-react";

export function MeetPage() {
  const navigate = useNavigate();

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning";
    if (hrs < 17) return "Good afternoon";
    return "Good evening";
  };

  // States from ChatPage
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");
  const [meetingRightPanel, setMeetingRightPanel] = useState<"list" | "schedule" | "join" | "instant" | "settings">("list");
  const [meetingDashboardTab, setMeetingDashboardTab] = useState<"scheduled" | "ongoing" | "project" | "invites">("scheduled");
  const [meetingJoinCode, setMeetingJoinCode] = useState("");
  const [instantMeetingLink, setInstantMeetingLink] = useState("");
  const [copiedMeetId, setCopiedMeetId] = useState<string | null>(null);

  // Active video meet flow state
  const [activeMeetOpen, setActiveMeetOpen] = useState(false);
  const [activeMeetTitle, setActiveMeetTitle] = useState("Weekly Design Review");
  const [meetVideoEnabled, setMeetVideoEnabled] = useState(true);
  const [meetMicEnabled, setMeetMicEnabled] = useState(true);
  const [meetScreenSharing, setMeetScreenSharing] = useState(false);
  const [meetHandRaised, setMeetHandRaised] = useState(false);
  const [meetSidebarOpen, setMeetSidebarOpen] = useState<"none" | "participants" | "chat" | "agenda">("none");
  const [meetLayout, setMeetLayout] = useState<"active-speaker-self" | "active-speaker-video" | "grid-6" | "grid-20" | "active-speaker-sidebar">("active-speaker-video");
  const [meetSearchQuery, setMeetSearchQuery] = useState("");
  const [approvedWaitingList, setApprovedWaitingList] = useState<string[]>([]);
  const [declinedWaitingList, setDeclinedWaitingList] = useState<string[]>([]);
  
  const [meetChatMessages, setMeetChatMessages] = useState<Array<{ sender: string, time: string, text: string }>>([
    { sender: "Ashish Dalei", time: "10:02 AM", text: "Hey team, did we resolve the structural clashes on Utkal Iconic?" },
    { sender: "Snehasish Mohapatra", time: "10:03 AM", text: "Yes, I updated the split view comparison in the 3D viewer." }
  ]);
  const [meetChatInput, setMeetChatInput] = useState("");
  
  // Call widgets overlay states
  const [incomingCallOpen, setIncomingCallOpen] = useState(false);
  const [outgoingCallOpen, setOutgoingCallOpen] = useState(false);
  const [meetBannerOpen, setMeetBannerOpen] = useState(false);
  const [meetBannerTimeLeft, setMeetBannerTimeLeft] = useState(12);

  // Selected project members for group call triggers
  const [selectedProjectMembers, setSelectedProjectMembers] = useState<string[]>([]);

  // 3-Step Scheduler wizard states
  const [scheduleStep, setScheduleStep] = useState(1);
  const [meetingRepeat, setMeetingRepeat] = useState<"Once" | "Daily" | "Weekly">("Once");
  const [meetingDuration, setMeetingDuration] = useState("1 Hour");
  const [meetingAgenda, setMeetingAgenda] = useState("");
  const [meetingInvitedEmails, setMeetingInvitedEmails] = useState<string[]>(["rd43057@gmail.com"]);
  const [emailInput, setEmailInput] = useState("");
  const [browseTeamExpanded, setBrowseTeamExpanded] = useState(true);
  const [selectedMeetingDate, setSelectedMeetingDate] = useState("2026-03-25");
  const [step3Tab, setStep3Tab] = useState<"email" | "team">("email");

  // Helper to format date string to readable format
  const formatDateString = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const monthsFull = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
      const dayName = days[date.getDay()];
      const dayNum = date.getDate();
      const monthName = monthsFull[date.getMonth()];
      
      const today = new Date();
      const isToday = date.getDate() === today.getDate() && 
                      date.getMonth() === today.getMonth() && 
                      date.getFullYear() === today.getFullYear();
      
      const prefix = isToday ? "TODAY - " : "";
      return `${prefix}${dayName}, ${dayNum} ${monthName}`;
    } catch {
      return dateStr;
    }
  };

  // Call duration counter
  const [activeCallDuration, setActiveCallDuration] = useState(159); // 2 mins 39s default
  // Mock mic input level bars heights
  const [micLevelBars, setMicLevelBars] = useState([4, 8, 12, 16, 20, 16, 12, 8, 4]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeMeetOpen) {
      interval = setInterval(() => {
        setActiveCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMeetOpen]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (outgoingCallOpen) {
      timeout = setTimeout(() => {
        setOutgoingCallOpen(false);
        setActiveMeetOpen(true);
      }, 3500);
    }
    return () => clearTimeout(timeout);
  }, [outgoingCallOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (meetBannerOpen && meetBannerTimeLeft > 0) {
      interval = setInterval(() => {
        setMeetBannerTimeLeft(prev => {
          if (prev <= 1) {
            setMeetBannerOpen(false);
            return 12;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [meetBannerOpen, meetBannerTimeLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Mock mic audio level bouncing
      setMicLevelBars(Array.from({ length: 12 }, () => Math.floor(Math.random() * 20) + 4));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return;
      }
      if (e.key === "i" || e.key === "I") {
        setIncomingCallOpen(prev => !prev);
      }
      if (e.key === "b" || e.key === "B") {
        setMeetBannerOpen(prev => !prev);
        setMeetBannerTimeLeft(12);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("startCall") === "true") {
      setActiveMeetOpen(true);
      const title = params.get("title");
      if (title) {
        setActiveMeetTitle(decodeURIComponent(title));
      }
      if (params.get("agendaTab") === "true") {
        setMeetSidebarOpen("agenda");
      }
      // Clean query params so reload doesn't trigger startCall again
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMeetId(id);
    setTimeout(() => setCopiedMeetId(null), 2000);
  };

  // Dynamic meetings list matching the user's design requirements
  const [meetings, setMeetings] = useState([
    {
      id: "meet-1",
      project: "BIMBOX SUBLIME",
      title: "Design Sprint",
      date: "TODAY - MON, 10 MAR",
      time: "2.00 - 3.00 PM",
      peopleCount: 8,
      service: "UI/UX",
      link: "https://meet.bimbox.com/sublime-design-sprint",
      avatars: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]
    },
    {
      id: "meet-2",
      project: "BIMBOX SUBLIME",
      title: "Design Sprint",
      date: "TODAY - MON, 10 MAR",
      time: "2.00 - 3.00 PM",
      peopleCount: 8,
      service: "UI/UX",
      link: "https://meet.bimbox.com/sublime-design-sprint",
      avatars: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]
    },
    {
      id: "meet-3",
      project: "BIMBOX SUBLIME",
      title: "Design Sprint",
      date: "MON, 16 MAR",
      time: "2.00 - 3.00 PM",
      peopleCount: 8,
      service: "UI/UX",
      link: "https://meet.bimbox.com/sublime-design-sprint",
      avatars: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]
    },
    {
      id: "meet-4",
      project: "BIMBOX SUBLIME",
      title: "Design Sprint",
      date: "MON, 16 MAR",
      time: "2.00 - 3.00 PM",
      peopleCount: 8,
      service: "UI/UX",
      link: "https://meet.bimbox.com/sublime-design-sprint",
      avatars: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]
    }
  ]);

  // Roster members for selection
  const rosterMembers = [
    { name: "Ashish Dalei", role: "Organizer", isSelf: false },
    { name: "Rakesh Mallik", role: "BIM Specialist", isSelf: false },
    { name: "Snehasish Mohapatra", role: "Lead Dev", isSelf: false },
    { name: "Deependra Samal", role: "UX Designer", isSelf: false },
    { name: "Salman Kumar", role: "You", isSelf: true }
  ];

  return (
    <div className="flex h-screen w-screen bg-gradient-to-tr from-[#d7e6fc] via-[#f2f6ff] to-[#fbfcfe] select-none text-slate-800 items-center justify-center p-8 overflow-hidden font-sans relative">
      {/* Floating Back to Dashboard Button */}
      <button
        onClick={() => navigate("/dashboard")}
        className="absolute top-6 left-6 px-4 py-2 bg-white/70 hover:bg-white backdrop-blur border border-slate-100 rounded-full text-[10px] font-extrabold text-slate-500 hover:text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all active:scale-95"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Dashboard</span>
      </button>

      {/* Main Content Layout Container */}
      <div className="max-w-5xl w-full flex flex-col md:flex-row items-center justify-center gap-16 md:gap-24">
        
        {/* Left Side: 2x2 Grid of Actions */}
        <div className="grid grid-cols-2 gap-6 shrink-0">
          {[
            { id: "instant", icon: Video, label: "Instant" },
            { id: "join", icon: LogIn, label: "Join Meet" },
            { id: "schedule", icon: Calendar, label: "Schedule" },
            { id: "settings", icon: Settings, label: "Settings" }
          ].map((tile) => {
            const Icon = tile.icon;
            const isActive = meetingRightPanel === tile.id;
            return (
              <div key={tile.id} className="flex flex-col items-center select-none">
                <button
                  type="button"
                  onClick={() => {
                    if (tile.id === "instant") {
                      setMeetingRightPanel("instant");
                      setInstantMeetingLink(`https://meet.bimbox.com/sublime-instant-${Math.floor(1000 + Math.random() * 9000)}`);
                    } else if (tile.id === "schedule") {
                      setMeetingRightPanel("schedule");
                      setScheduleStep(1);
                    } else {
                      setMeetingRightPanel(tile.id as any);
                    }
                  }}
                  className={`w-20 h-20 bg-white rounded-[26px] flex items-center justify-center border border-[#eff3fa] transition-all duration-200 cursor-pointer shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_36px_rgba(37,99,235,0.08)] hover:-translate-y-0.5 hover:scale-103 active:scale-95 ${
                    isActive ? "ring-2 ring-blue-600/30 border-blue-500/20 shadow-[0_16px_36px_rgba(37,99,235,0.08)]" : ""
                  }`}
                >
                  <Icon className="w-6 h-6 text-blue-600 stroke-[1.8]" />
                </button>
                <span className="text-[11px] font-bold text-slate-400 mt-2.5 tracking-tight">{tile.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right Side: Dynamic Card Panel */}
        <div className="w-full max-w-[460px] bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-[#eff3fa] p-5 flex flex-col h-[560px] text-left select-none relative animate-in fade-in zoom-in-98 duration-300">
          
          {/* VIEW 1: MEETINGS LIST DASHBOARD */}
          {meetingRightPanel === "list" && (
            <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
              {/* Tabs header matching screenshot */}
              <div className="flex items-center justify-between bg-slate-50/60 p-1 rounded-2xl border border-slate-100/50 mb-3 shrink-0">
                {[
                  { id: "scheduled", label: "Scheduled", count: 0 },
                  { id: "ongoing", label: "Ongoing", count: 0, dot: true },
                  { id: "project", label: "Project wise", count: 0 },
                  { id: "invites", label: "Invites", count: 3, badge: true }
                ].map((tab) => {
                  const active = meetingDashboardTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setMeetingDashboardTab(tab.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold tracking-tight transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                        active
                          ? "bg-blue-600 text-white shadow-sm shadow-blue-500/10"
                          : "text-slate-450 hover:text-slate-700"
                      }`}
                    >
                      {tab.dot && (
                        <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-white" : "bg-red-500"} animate-pulse`} />
                      )}
                      <span>{tab.label}</span>
                      {tab.badge && (
                        <span className={`px-1.5 py-0.25 rounded-full text-[8px] font-black ${
                          active ? "bg-white text-blue-600" : "bg-red-500 text-white"
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab views content area */}
              <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 pb-2 scrollbar-none">
                {meetingDashboardTab === "scheduled" && (
                  <div className="space-y-4">
                    {/* First group (Today) */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block my-2">TODAY - MON, 10 MAR</span>
                      </div>
                      
                      {meetings
                        .filter(m => m.date.includes("TODAY"))
                        .map((meet, idx) => (
                          <div key={meet.id} className="bg-slate-50/25 border border-slate-100 rounded-[22px] p-4 hover:border-blue-100 hover:bg-slate-50/50 transition-all duration-200 shadow-2xs">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">{meet.project}</span>
                                  <span className="text-[8px] font-extrabold text-slate-400 flex items-center gap-0.5">
                                    <Users className="w-2.5 h-2.5 text-slate-350" />
                                    {meet.peopleCount} People
                                  </span>
                                </div>
                                <h4 className="text-[13px] font-black text-slate-800 mt-1 truncate">{meet.title}</h4>
                              </div>
                              <span className="text-[8.5px] font-extrabold text-blue-600 bg-blue-50/60 border border-blue-100/50 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                                {meet.service}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/50">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-350" />
                                  {meet.time}
                                </span>
                                <div className="flex -space-x-1.5 mt-2">
                                  {meet.avatars.map((color, aIdx) => (
                                    <div
                                      key={aIdx}
                                      className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[7.5px] text-white font-extrabold shadow-sm"
                                      style={{ backgroundColor: color }}
                                    >
                                      {String.fromCharCode(65 + aIdx + idx)}
                                    </div>
                                  ))}
                                  <div className="w-5 h-5 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[7.5px] text-slate-555 font-extrabold shadow-sm">
                                    +{meet.peopleCount - meet.avatars.length}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 self-end">
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(meet.link, meet.id)}
                                  className="h-7 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full text-[9px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <Link className="w-2.5 h-2.5 text-slate-450" />
                                  <span>{copiedMeetId === meet.id ? "Copied" : "Copy link"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMeetTitle(meet.title);
                                    setActiveMeetOpen(true);
                                  }}
                                  className="h-7 px-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[9px] font-extrabold flex items-center gap-1 cursor-pointer shadow-sm shadow-blue-500/10 transition-all active:scale-95"
                                >
                                  <Video className="w-3 h-3 text-white/95" />
                                  <span>Join</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* Second group (Upcoming) */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block my-2">MON, 16 MAR</span>
                      </div>
                      
                      {meetings
                        .filter(m => !m.date.includes("TODAY"))
                        .map((meet, idx) => (
                          <div key={meet.id} className="bg-slate-50/25 border border-slate-100 rounded-[22px] p-4 hover:border-blue-100 hover:bg-slate-50/50 transition-all duration-200 shadow-2xs">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-[9px] font-black text-slate-400 tracking-wider uppercase">{meet.project}</span>
                                  <span className="text-[8px] font-extrabold text-slate-400 flex items-center gap-0.5">
                                    <Users className="w-2.5 h-2.5 text-slate-350" />
                                    {meet.peopleCount} People
                                  </span>
                                </div>
                                <h4 className="text-[13px] font-black text-slate-805 mt-1 truncate">{meet.title}</h4>
                              </div>
                              <span className="text-[8.5px] font-extrabold text-blue-600 bg-blue-50/60 border border-blue-100/50 px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0">
                                {meet.service}
                              </span>
                            </div>

                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100/50">
                              <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-slate-350" />
                                  {meet.time}
                                </span>
                                <div className="flex -space-x-1.5 mt-2">
                                  {meet.avatars.map((color, aIdx) => (
                                    <div
                                      key={aIdx}
                                      className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[7.5px] text-white font-extrabold shadow-sm"
                                      style={{ backgroundColor: color }}
                                    >
                                      {String.fromCharCode(65 + aIdx + idx)}
                                    </div>
                                  ))}
                                  <div className="w-5 h-5 rounded-full border border-white bg-slate-100 flex items-center justify-center text-[7.5px] text-slate-555 font-extrabold shadow-sm">
                                    +{meet.peopleCount - meet.avatars.length}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 self-end">
                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(meet.link, meet.id)}
                                  className="h-7 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full text-[9px] font-extrabold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                                >
                                  <Link className="w-2.5 h-2.5 text-slate-450" />
                                  <span>{copiedMeetId === meet.id ? "Copied" : "Copy link"}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMeetTitle(meet.title);
                                    setActiveMeetOpen(true);
                                  }}
                                  className="h-7 px-4.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-[9px] font-extrabold flex items-center gap-1 cursor-pointer shadow-sm shadow-blue-500/10 transition-all active:scale-95"
                                >
                                  <Video className="w-3 h-3 text-white/95" />
                                  <span>Join</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {meetingDashboardTab === "ongoing" && (
                  <div className="flex flex-col items-center justify-center py-16 text-center select-none animate-in fade-in duration-150">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-650 flex items-center justify-center mb-3.5 animate-pulse border border-red-100">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    </div>
                    <h5 className="text-xs font-black text-slate-800">No active calls detected</h5>
                    <p className="text-[10px] text-slate-450 font-bold mt-1">There are no live meetings currently active on your team calendar.</p>
                  </div>
                )}

                {meetingDashboardTab === "project" && (
                  <div className="space-y-4 text-left">
                    <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block my-2">Select project to view sync rooms</span>
                    <div className="grid grid-cols-1 gap-3.5">
                      {[
                        { title: "Assotech Iconic Room", desc: "4 members active · Daily standups", active: true },
                        { title: "Utkal Pleasant Sync", desc: "Weekly review · 12 members", active: false }
                      ].map((p, i) => (
                        <div key={i} className="bg-slate-50/20 border border-slate-100 rounded-2xl p-4 transition-all shadow-2xs relative flex flex-col justify-between h-28 hover:border-blue-100">
                          <div>
                            <h4 className="text-xs font-black text-slate-805">{p.title}</h4>
                            <p className="text-[9.5px] text-slate-400 font-semibold mt-1">{p.desc}</p>
                          </div>
                          <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-slate-100/50">
                            <span className="text-[8px] font-black text-slate-400">BIM COLLABORATION</span>
                            <button
                              onClick={() => {
                                setActiveMeetTitle(p.title);
                                setActiveMeetOpen(true);
                              }}
                              className="h-6.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold cursor-pointer transition-colors"
                            >
                              Enter Room
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {meetingDashboardTab === "invites" && (
                  <div className="space-y-3 text-left">
                    <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block my-2">Pending invitations (3)</span>
                    
                    {[
                      { title: "Weekly MEP Clash Coordination", details: "Tomorrow, 11 Mar · 10.30 - 11.30 AM", host: "Ashish Dalei" },
                      { title: "Facade Review", details: "13 Mar · 4.00 - 5.00 PM", host: "Rakesh Mallik" },
                      { title: "Interior Alignment Sync", details: "15 Mar · 2.00 - 2.30 PM", host: "Deependra Samal" }
                    ].map((invite, index) => (
                      <div key={index} className="bg-slate-50/20 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 shadow-2xs animate-in fade-in duration-200">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md uppercase tracking-wider">Weekly Coordination</span>
                            <span className="text-[8px] font-black text-slate-400">Host: {invite.host}</span>
                          </div>
                          <h4 className="text-xs font-black text-slate-800 mt-1.5">{invite.title}</h4>
                          <p className="text-[9px] text-slate-455 font-bold mt-0.5">{invite.details}</p>
                        </div>
                        <div className="flex items-center gap-1.5 justify-end pt-2 border-t border-slate-100/50">
                          <button className="h-7 px-3 border border-slate-200 hover:bg-slate-50 rounded-lg text-[9px] font-bold text-slate-655 cursor-pointer">Decline</button>
                          <button 
                            onClick={() => {
                              alert("Invitation accepted! Added to your schedule.");
                              setMeetingDashboardTab("scheduled");
                            }}
                            className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold cursor-pointer"
                          >
                            Accept
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: START INSTANT MEETING */}
          {meetingRightPanel === "instant" && (
            <div className="flex flex-col h-full justify-between text-left select-none animate-in fade-in duration-200">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 shrink-0">
                  <button 
                    onClick={() => setMeetingRightPanel("list")}
                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Instant Meeting</h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.25">Start a video conference immediately</p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Meeting URL</span>
                    <span className="text-xs font-bold text-slate-700 truncate block mt-1">{instantMeetingLink}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(instantMeetingLink, "instant-copy")}
                    className="h-8 px-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
                  >
                    <Copy className="w-3 h-3 text-slate-450" />
                    <span>{copiedMeetId === "instant-copy" ? "Copied" : "Copy"}</span>
                  </button>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase">Quick Preferences</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700">Microphone ON</span>
                      <input type="checkbox" defaultChecked className="cursor-pointer" />
                    </div>
                    <div className="bg-white border border-slate-200 p-3 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-700">Camera ON</span>
                      <input type="checkbox" defaultChecked className="cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setMeetingRightPanel("list")}
                  className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMeetTitle("Instant Meeting");
                    setActiveMeetOpen(true);
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10 text-center"
                >
                  Start Meeting
                </button>
              </div>
            </div>
          )}

          {/* VIEW 3: JOIN MEET BY CODE */}
          {meetingRightPanel === "join" && (
            <div className="flex flex-col h-full justify-between text-left select-none animate-in fade-in duration-200">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 shrink-0">
                  <button 
                    onClick={() => setMeetingRightPanel("list")}
                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Join Meeting</h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.25">Enter code or calendar link to join</p>
                  </div>
                </div>

                <div className="text-left">
                  <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Meeting code or link</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      placeholder="e.g. ysk-21h3-y673"
                      value={meetingJoinCode}
                      onChange={(e) => setMeetingJoinCode(e.target.value)}
                      className="w-full pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 text-slate-800 focus:border-blue-500 focus:outline-hidden"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <span className="text-[8px] text-slate-400 font-semibold mt-1.5 block">Format: abc-defg-hij or the complete URL link.</span>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setMeetingRightPanel("list")}
                  className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!meetingJoinCode.trim()}
                  onClick={() => {
                    setActiveMeetTitle("Joined Room");
                    setActiveMeetOpen(true);
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10 text-center"
                >
                  Join Meeting
                </button>
              </div>
            </div>
          )}

          {/* VIEW 4: SCHEDULE MEETING (3-STEP SCHEDULER WIZARD) */}
          {meetingRightPanel === "schedule" && (
            <div className="flex flex-col h-full justify-between text-left select-none animate-in fade-in duration-200">
              <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 scrollbar-none">
                
                {/* Steps tracker progress indicator */}
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 shrink-0">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setMeetingRightPanel("list")}
                      className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Schedule Meeting</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.25">Configure team sync calendar invite</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3].map((stepNum) => (
                      <div
                        key={stepNum}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black transition-all ${
                          scheduleStep >= stepNum
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {stepNum}
                      </div>
                    ))}
                  </div>
                </div>

                {/* STEP 1: CONFIGURE BASIC DETAILS */}
                {scheduleStep === 1 && (
                  <div className="space-y-3.5 py-1">
                    <div className="text-left">
                      <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Meeting Agenda Title</label>
                      <div className="relative mt-1">
                        <input
                          type="text"
                          placeholder="e.g. Design review, Structural sync room.."
                          value={meetingTitle}
                          onChange={(e) => setMeetingTitle(e.target.value)}
                          className="w-full pl-8.5 pr-3 py-1.75 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 text-slate-800 focus:outline-hidden"
                        />
                        <Pencil className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Meeting Date</label>
                        <input
                          type="date"
                          value={selectedMeetingDate}
                          onChange={(e) => setSelectedMeetingDate(e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Start Time</label>
                        <select className="w-full mt-1 px-3 py-1.75 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                          <option>02:00 PM</option>
                          <option>03:00 PM</option>
                          <option>10:00 AM</option>
                          <option>11:30 AM</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Duration</label>
                        <select
                          value={meetingDuration}
                          onChange={(e) => setMeetingDuration(e.target.value)}
                          className="w-full mt-1 px-3 py-1.75 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                        >
                          <option>30 Minutes</option>
                          <option>1 Hour</option>
                          <option>2 Hours</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[8px] font-black text-slate-455 uppercase tracking-wider block">Repeat Cycle</label>
                        <select
                          value={meetingRepeat}
                          onChange={(e) => setMeetingRepeat(e.target.value as any)}
                          className="w-full mt-1 px-3 py-1.75 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                        >
                          <option>Once</option>
                          <option>Daily</option>
                          <option>Weekly</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: ADD TEAM MEMBERS */}
                {scheduleStep === 2 && (
                  <div className="space-y-3.5 py-1">
                    {/* Selected chips list */}
                    <div>
                      <span className="text-[8px] font-black text-slate-450 tracking-wider uppercase block">Invited Participants ({meetingInvitedEmails.length})</span>
                      <div className="flex flex-wrap gap-1 mt-1.5 max-h-[80px] overflow-y-auto">
                        {meetingInvitedEmails.map((email, idx) => (
                          <div key={idx} className="flex items-center gap-1 px-2.5 py-0.75 bg-blue-50/70 text-blue-600 rounded-full border border-blue-100 text-[9px] font-bold animate-in zoom-in-95 duration-100">
                            <span>{email}</span>
                            <button
                              type="button"
                              onClick={() => setMeetingInvitedEmails(prev => prev.filter(e => e !== email))}
                              className="w-3.5 h-3.5 rounded-full hover:bg-blue-100 flex items-center justify-center text-[9px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        {meetingInvitedEmails.length === 0 && (
                          <span className="text-[9px] text-slate-400 font-bold italic py-1">No participants added yet. Invite someone below.</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-slate-450 uppercase tracking-wider block">Add Member Invite</label>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (emailInput.trim() && !meetingInvitedEmails.includes(emailInput.trim())) {
                            setMeetingInvitedEmails(prev => [...prev, emailInput.trim()]);
                            setEmailInput("");
                          }
                        }}
                        className="flex gap-2"
                      >
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder="Add email address or select team member below.."
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="w-full pl-8.5 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold placeholder-slate-400 text-slate-805 focus:outline-hidden"
                          />
                          <UserPlus className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                        </div>
                        <button
                          type="submit"
                          className="h-8.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold cursor-pointer"
                        >
                          Add
                        </button>
                      </form>
                    </div>

                    {/* Roster selection */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3">
                      <button
                        type="button"
                        onClick={() => setBrowseTeamExpanded(!browseTeamExpanded)}
                        className="w-full flex items-center justify-between text-[8px] font-black text-slate-450 uppercase tracking-wider select-none cursor-pointer"
                      >
                        <span>Select from Assotech Iconic roster</span>
                        <span>{browseTeamExpanded ? "Collapse" : "Expand"}</span>
                      </button>

                      {browseTeamExpanded && (
                        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-150/50 max-h-[110px] overflow-y-auto pr-0.5">
                          {rosterMembers.map((member, mIdx) => {
                            const isAdded = meetingInvitedEmails.includes(member.name);
                            return (
                              <div
                                key={mIdx}
                                onClick={() => {
                                  if (isAdded) {
                                    setMeetingInvitedEmails(prev => prev.filter(e => e !== member.name));
                                  } else {
                                    setMeetingInvitedEmails(prev => [...prev, member.name]);
                                  }
                                }}
                                className={`flex items-center gap-2 p-1.5 px-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                                  isAdded
                                    ? "bg-blue-50/50 border-blue-200 text-blue-600"
                                    : "bg-white border-slate-150 hover:bg-slate-50 text-slate-700"
                                }`}
                              >
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black ${isAdded ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[9px] font-black truncate">{member.name}</div>
                                  <div className="text-[7px] text-slate-400 font-bold leading-none truncate">{member.role}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3: SUCCESS & COPY CALENDAR LINK */}
                {scheduleStep === 3 && (
                  <div className="space-y-4 py-1 text-center flex flex-col items-center justify-center animate-in zoom-in-98 duration-100">
                    <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mb-1">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-800">Meeting Scheduled Successfully!</h4>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Invitation link created and sent to team participants.</p>
                    </div>

                    <div className="w-full bg-slate-50 border border-slate-150 rounded-2xl p-3 text-left">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Agenda</span>
                      <span className="text-xs font-bold text-slate-700 block mt-0.5">{meetingTitle || "Design Sprint Meeting"}</span>
                      <div className="flex gap-4 mt-2.5 pt-2 border-t border-slate-150/40">
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Date</span>
                          <span className="text-[10px] font-bold text-slate-600 mt-0.5 block">{formatDateString(selectedMeetingDate)}</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider block">Duration</span>
                          <span className="text-[10px] font-bold text-slate-600 mt-0.5 block">{meetingDuration} ({meetingRepeat})</span>
                        </div>
                      </div>
                    </div>

                    {/* Tabs for sharing styles */}
                    <div className="w-full">
                      <div className="flex border-b border-slate-150">
                        <button
                          type="button"
                          onClick={() => setStep3Tab("email")}
                          className={`flex-1 pb-1.5 text-[9px] font-extrabold border-b-2 cursor-pointer ${
                            step3Tab === "email" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
                          }`}
                        >
                          Copy Calendar Invite
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep3Tab("team")}
                          className={`flex-1 pb-1.5 text-[9px] font-extrabold border-b-2 cursor-pointer ${
                            step3Tab === "team" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
                          }`}
                        >
                          Copy URL Only
                        </button>
                      </div>

                      <div className="mt-3 text-left">
                        {step3Tab === "email" && (
                          <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 flex items-center justify-between gap-3 animate-in fade-in duration-100">
                            <span className="text-[9px] font-bold text-slate-600 truncate">meet.bimbox.ai/ysk-21h3-y673</span>
                            <button
                              type="button"
                              onClick={() => handleCopyLink("meet.bimbox.ai/ysk-21h3-y673", "step3-email")}
                              className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Copy className="w-2.5 h-2.5 text-white/90" />
                              <span>{copiedMeetId === "step3-email" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        )}
                        {step3Tab === "team" && (
                          <div className="bg-slate-50 border border-slate-150 rounded-xl p-2.5 flex items-center justify-between gap-3 animate-in fade-in duration-100">
                            <span className="text-[9px] font-bold text-slate-600 truncate">https://meet.bimbox.com/sublime-instant-room</span>
                            <button
                              type="button"
                              onClick={() => handleCopyLink("https://meet.bimbox.com/sublime-instant-room", "step3-team")}
                              className="h-7 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[9px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                            >
                              <Copy className="w-2.5 h-2.5 text-white/90" />
                              <span>{copiedMeetId === "step3-team" ? "Copied" : "Copy"}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="flex gap-3 pt-3 border-t border-slate-100 mt-6 shrink-0">
                {scheduleStep === 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setMeetingRightPanel("list")}
                      className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={!meetingTitle.trim()}
                      onClick={() => setScheduleStep(2)}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10 text-center"
                    >
                      Continue
                    </button>
                  </>
                )}
                {scheduleStep === 2 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setScheduleStep(1)}
                      className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const mockId = `meet-${Date.now()}`;
                        const formattedDateStr = formatDateString(selectedMeetingDate);
                        setMeetings(prev => [
                          {
                            id: mockId,
                            project: "BIMBOX SUBLIME",
                            title: meetingTitle,
                            date: formattedDateStr,
                            time: "2.00 - 3.00 PM",
                            peopleCount: meetingInvitedEmails.length + 1,
                            service: "STANDUP",
                            link: `https://meet.bimbox.com/sublime-meeting-${Math.floor(1000 + Math.random() * 9000)}`,
                            avatars: ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"]
                          },
                          ...prev
                        ]);
                        setScheduleStep(3);
                      }}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10 text-center"
                    >
                      Schedule Meeting
                    </button>
                  </>
                )}
                {scheduleStep === 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      setMeetingRightPanel("list");
                      setMeetingTitle("");
                      setMeetingInvitedEmails(["rd43057@gmail.com"]);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10 text-center"
                  >
                    Done & Return
                  </button>
                )}
              </div>
            </div>
          )}

          {/* VIEW 5: SETTINGS */}
          {meetingRightPanel === "settings" && (
            <div className="flex flex-col h-full overflow-hidden text-left relative select-none animate-in fade-in duration-200">
              <div className="flex-1 overflow-y-auto space-y-4 pr-0.5 pb-2 scrollbar-none">
                <div className="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 shrink-0">
                  <button 
                    onClick={() => setMeetingRightPanel("list")}
                    className="h-7 w-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Settings</h4>
                    <p className="text-[9px] text-slate-400 font-bold mt-0.25">Audio · Video · Device Preferences</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* VIDEO PREVIEW & CAMERA */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1 mb-1.5">
                        <Video className="w-3.5 h-3.5 text-slate-350" />
                        VIDEO CAMERA
                      </span>
                      <label className="text-[8px] font-black text-[#64748b] block mb-1">Camera Device</label>
                      <select className="w-full px-3 py-1.75 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                        <option>FaceTime HD Camera (Built-in)</option>
                        <option>External USB Web Camera</option>
                      </select>
                    </div>

                    <div className="bg-blue-700 rounded-2xl p-5 text-center text-white shrink-0 relative flex flex-col items-center justify-center mb-1">
                      <div className="w-14 h-14 rounded-full bg-white/10 text-white font-extrabold text-base flex items-center justify-center border border-white/20 mb-1.5">
                        SK
                      </div>
                      <div className="text-[9px] font-black text-white/80">Camera Feed Preview Active</div>
                    </div>
                  </div>

                  {/* AUDIO & MICROPHONE */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1 mb-1.5">
                        <Mic className="w-3.5 h-3.5 text-slate-350" />
                        AUDIO DEVICES
                      </span>
                      <label className="text-[8px] font-black text-[#64748b] block mb-1">Microphone Input</label>
                      <select className="w-full px-3 py-1.75 bg-slate-55 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                        <option>Built-in MacBook Microphone</option>
                        <option>External USB Studio Microphone</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[8px] font-black text-[#64748b] block mb-1">Live Input Meter</label>
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-2 flex items-center justify-between h-9 px-3">
                        <span className="text-[9px] font-bold text-slate-400">Input Level</span>
                        <div className="flex items-end gap-0.5 h-full py-1">
                          {micLevelBars.slice(0, 8).map((height, i) => (
                            <div
                              key={i}
                              className="w-1 bg-blue-600 rounded-full transition-all duration-150"
                              style={{ height: `${height * 4}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[8px] font-black text-[#64748b] block mb-1">Speaker Output</label>
                      <select className="w-full px-3 py-1.75 bg-slate-55 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800">
                        <option>MacBook Speakers (Built-in)</option>
                        <option>External Headset Speakers</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* GENERAL PREFERENCES */}
                <div className="space-y-3 pt-2">
                  <span className="text-[8px] font-black text-slate-400 tracking-wider uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-355" />
                    GENERAL PREFERENCES
                  </span>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[8px] font-black text-[#64748b] block mb-1">Meeting Display Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          defaultValue="Salman Kumar"
                          className="w-full pl-8 pr-3 py-1.75 bg-slate-55 border border-slate-200 rounded-xl text-xs font-semibold text-slate-805 focus:outline-hidden"
                        />
                        <Users className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {[
                        { key: "noise", label: "Noise cancellation (AI filters)", defaultChecked: true, icon: Coffee },
                        { key: "mirror", label: "Mirror my video preview", defaultChecked: true, icon: Monitor },
                        { key: "hd", label: "HD video feed quality", defaultChecked: false, icon: Sun }
                      ].map((t) => {
                        const IconComponent = t.icon;
                        return (
                          <div key={t.key} className="flex items-center justify-between py-1 bg-slate-50/20 px-2 rounded-lg border border-slate-50">
                            <div className="flex items-center gap-2">
                              <IconComponent className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[10px] font-bold text-slate-700">{t.label}</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer select-none">
                              <input type="checkbox" defaultChecked={t.defaultChecked} className="sr-only peer" />
                              <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-blue-600 animate-all"></div>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100 mt-6 shrink-0">
                <button
                  type="button"
                  onClick={() => setMeetingRightPanel("list")}
                  className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMeetingRightPanel("list");
                    alert("Preferences saved!");
                  }}
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-blue-500/10 text-center"
                >
                  Apply Changes
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* OVERLAY MODULES (MODALS & CALL FEEDS) */}

      {/* 1. Active Video Call Canvas Overlay */}
      {activeMeetOpen && (
        <div className="fixed inset-0 z-[1002] bg-slate-955 flex flex-col md:flex-row select-none animate-in fade-in duration-200">
          <div className="flex-1 flex flex-col relative h-full bg-radial from-slate-900 via-slate-950 to-slate-950">
            {/* Header info */}
            <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
              <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-white text-xs font-bold truncate max-w-[150px]">{activeMeetTitle}</span>
                <span className="text-slate-400 text-[10px] border-l border-slate-800 pl-2">
                  {Math.floor(activeCallDuration / 60)}:{(activeCallDuration % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <div className="flex items-center gap-1.5 pointer-events-auto">
                {meetScreenSharing && (
                  <span className="bg-blue-600/90 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-white" />
                    Screen Sharing
                  </span>
                )}
                {meetHandRaised && (
                  <span className="bg-amber-500/90 text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    ✋ Hand Raised
                  </span>
                )}
              </div>
            </div>

            {/* Layout content display */}
            <div className="flex-1 flex items-center justify-center p-6 h-full relative">
              {!meetVideoEnabled && meetLayout === "active-speaker-self" && (
                <div className="flex flex-col items-center justify-center animate-in fade-in">
                  <div className="relative flex items-center justify-center w-28 h-28">
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-[ping_3s_infinite]" />
                    <div className="absolute inset-2 rounded-full bg-blue-500/20 animate-[ping_2.5s_infinite]" />
                    <div className="absolute inset-4 rounded-full bg-blue-500/30 animate-[ping_2s_infinite]" />
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl flex items-center justify-center shadow-2xl relative z-10">
                      SK
                    </div>
                  </div>
                  <span className="text-white text-xs font-bold mt-4 tracking-wide">Salman Kumar (You)</span>
                  <span className="text-slate-400 text-[10px] mt-1">Camera disabled</span>
                </div>
              )}

              {(meetVideoEnabled || meetLayout !== "active-speaker-self") && meetLayout === "active-speaker-video" && (
                <div className="w-full h-full max-w-4xl rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900 shadow-2xl relative flex items-center justify-center">
                  {meetVideoEnabled ? (
                    <div className="absolute inset-0 bg-slate-850 flex items-center justify-center text-white">
                      <div className="w-full h-full bg-gradient-to-b from-indigo-900/20 via-slate-900/60 to-slate-950 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg border border-blue-400/20 animate-pulse">
                          SK
                        </div>
                        <span className="text-slate-200 text-xs font-bold mt-3">Salman Kumar · Live</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center mb-3">
                        SK
                      </div>
                      <span className="text-slate-400 text-xs">Salman Kumar is speaking</span>
                    </div>
                  )}
                </div>
              )}

              {meetLayout === "grid-6" && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full h-full max-h-[80vh]">
                  {[
                    { initials: "SK", name: "Salman Kumar (You)", active: true, video: meetVideoEnabled, color: "bg-blue-600" },
                    { initials: "JS", name: "Jessica Smith", active: false, video: true, color: "bg-amber-500" },
                    { initials: "AB", name: "Alex Brown", active: false, video: false, color: "bg-pink-500" },
                    { initials: "ML", name: "Michael Lee", active: true, video: true, color: "bg-indigo-600" },
                    { initials: "RT", name: "Rachel Thornton", active: false, video: false, color: "bg-emerald-600" },
                    { initials: "AD", name: "Ashish Dalei", active: false, video: true, color: "bg-teal-650" }
                  ].map((p, i) => (
                    <div key={i} className={`rounded-2xl border overflow-hidden relative flex flex-col items-center justify-center transition-all ${
                      p.active ? "border-blue-500 bg-slate-900" : "border-slate-800/85 bg-slate-900/60"
                    }`}>
                      <div className={`w-10 h-10 rounded-full ${p.color} text-white font-bold text-xs flex items-center justify-center`}>
                        {p.initials}
                      </div>
                      <span className="text-[10px] text-slate-350 font-bold mt-2">{p.name}</span>
                      {p.active && (
                        <div className="absolute top-2.5 right-2.5 bg-blue-650 text-white rounded-full p-0.5">
                          <Mic className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {meetLayout === "grid-20" && (
                <div className="grid grid-cols-4 md:grid-cols-5 gap-2.5 w-full h-full max-h-[80vh]">
                  {Array.from({ length: 20 }, (_, idx) => (
                    <div key={idx} className="rounded-xl border border-slate-900 bg-slate-900/80 flex flex-col items-center justify-center p-2 relative">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 font-bold text-[9px] flex items-center justify-center">
                        {idx === 0 ? "SK" : `P${idx}`}
                      </div>
                      <span className="text-[8px] text-slate-450 mt-1 truncate max-w-[50px]">{idx === 0 ? "You" : `User ${idx}`}</span>
                    </div>
                  ))}
                </div>
              )}

              {meetLayout === "active-speaker-sidebar" && (
                <div className="grid grid-cols-4 gap-4 w-full h-full max-h-[80vh]">
                  <div className="col-span-3 rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 flex flex-col items-center justify-center relative">
                    <div className="w-16 h-16 rounded-full bg-slate-700 text-white text-lg flex items-center justify-center mb-3">JS</div>
                    <span className="text-white text-xs font-bold">Jessica Smith (Speaking)</span>
                  </div>
                  <div className="col-span-1 flex flex-col gap-2 overflow-y-auto pr-1">
                    {["SK (You)", "Alex B", "Michael L", "David M"].map((name, i) => (
                      <div key={i} className="rounded-xl border border-slate-900 bg-slate-900/60 p-2 text-center flex flex-col items-center justify-center shrink-0">
                        <div className="w-6 h-6 rounded-full bg-slate-850 text-[8px] font-bold text-slate-350 flex items-center justify-center">{name[0]}</div>
                        <span className="text-[8px] text-slate-450 mt-1 truncate w-full">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Controls panel */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
              <div className="bg-slate-900/95 border border-slate-850 shadow-2xl px-5 py-2.5 rounded-full flex items-center gap-3 backdrop-blur-md">
                <button
                  onClick={() => setMeetMicEnabled(!meetMicEnabled)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    meetMicEnabled ? "bg-slate-800 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {meetMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setMeetVideoEnabled(!meetVideoEnabled)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    meetVideoEnabled ? "bg-slate-800 text-white" : "bg-red-500 text-white"
                  }`}
                >
                  {meetVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setMeetScreenSharing(!meetScreenSharing)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    meetScreenSharing ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setMeetHandRaised(!meetHandRaised)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    meetHandRaised ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  ✋
                </button>

                <div className="w-px h-5 bg-slate-800" />

                <button
                  onClick={() => setMeetSidebarOpen(meetSidebarOpen === "participants" ? "none" : "participants")}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    meetSidebarOpen === "participants" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-350"
                  }`}
                >
                  <Users className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setMeetSidebarOpen(meetSidebarOpen === "chat" ? "none" : "chat")}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    meetSidebarOpen === "chat" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-350"
                  }`}
                  title="In-call chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setMeetSidebarOpen(meetSidebarOpen === "agenda" ? "none" : "agenda")}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    meetSidebarOpen === "agenda" ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-350"
                  }`}
                  title="Meeting agenda"
                >
                  <ListTodo className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    const layouts: typeof meetLayout[] = ["active-speaker-self", "active-speaker-video", "grid-6", "grid-20", "active-speaker-sidebar"];
                    const currentIdx = layouts.indexOf(meetLayout);
                    setMeetLayout(layouts[(currentIdx + 1) % layouts.length]);
                  }}
                  className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-350 flex items-center justify-center cursor-pointer"
                >
                  <Grid className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActiveMeetOpen(false)}
                  className="w-10 h-10 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center text-white transition-all shadow-md cursor-pointer"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          {meetSidebarOpen !== "none" && (
            <div className="w-full md:w-[320px] bg-slate-50 border-l border-slate-200/80 flex flex-col h-full shrink-0 text-left animate-in slide-in-from-right duration-200 z-40">
              <div className="p-4 border-b border-slate-155 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  {meetSidebarOpen === "participants" 
                    ? "Participants" 
                    : meetSidebarOpen === "chat" 
                      ? "In-Call Chat" 
                      : "Meeting Agenda"}
                </span>
                <button onClick={() => setMeetSidebarOpen("none")} className="p-1 text-slate-450 hover:text-slate-800 hover:bg-slate-100 rounded-md">✕</button>
              </div>

              {meetSidebarOpen === "participants" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="relative shrink-0">
                    <input
                      type="text"
                      placeholder="Search participant..."
                      value={meetSearchQuery}
                      onChange={(e) => setMeetSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>

                  {/* WAITING ROOM */}
                  {!declinedWaitingList.includes("Rudra narayan Dash") && !approvedWaitingList.includes("Rudra narayan Dash") && (
                    <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold text-blue-700 uppercase">Waiting to join (1)</span>
                      </div>
                      <div className="flex items-center justify-between bg-white border border-blue-105 rounded-xl p-2">
                        <div>
                          <div className="text-[10px] font-bold text-slate-805">Rudra narayan Dash</div>
                          <div className="text-[8px] text-slate-400">BIM Structural Lead</div>
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <button onClick={() => setDeclinedWaitingList(prev => [...prev, "Rudra narayan Dash"])} className="w-5.5 h-5.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer">✕</button>
                          <button onClick={() => setApprovedWaitingList(prev => [...prev, "Rudra narayan Dash"])} className="w-5.5 h-5.5 rounded-full bg-blue-650 text-white flex items-center justify-center cursor-pointer">✓</button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">In Call</span>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between py-1 bg-white p-2 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-[10px] flex items-center justify-center">AD</div>
                          <div className="text-[10px] font-bold text-slate-850">Ashish Dalei</div>
                        </div>
                        <Mic className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      {approvedWaitingList.includes("Rudra narayan Dash") && (
                        <div className="flex items-center justify-between py-1 bg-white p-2 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center">RD</div>
                            <div className="text-[10px] font-bold text-slate-850">Rudra narayan Dash</div>
                          </div>
                          <Mic className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {meetSidebarOpen === "chat" && (
                <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {meetChatMessages.map((msg, idx) => (
                      <div key={idx} className="text-left bg-white p-2.5 rounded-2xl border border-slate-100 max-w-[90%]">
                        <span className="text-[9px] font-extrabold text-slate-700 block">{msg.sender}</span>
                        <p className="text-[10px] text-slate-655 mt-0.5 leading-relaxed font-semibold">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (meetChatInput.trim()) {
                        setMeetChatMessages(prev => [...prev, {
                          sender: "Salman Kumar (You)",
                          time: "now",
                          text: meetChatInput.trim()
                        }]);
                        setMeetChatInput("");
                      }
                    }}
                    className="p-3 bg-white border-t border-slate-150 flex gap-2"
                  >
                    <input
                      type="text"
                      placeholder="Type message here..."
                      value={meetChatInput}
                      onChange={(e) => setMeetChatInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-55 border border-slate-200 rounded-xl text-xs focus:outline-hidden"
                    />
                    <button type="submit" className="h-8 px-3 bg-blue-600 text-white rounded-xl text-[10px] font-bold cursor-pointer">Send</button>
                  </form>
                </div>
              )}

              {meetSidebarOpen === "agenda" && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left">
                  <div className="bg-[#e8f0fe] p-3 rounded-2xl border border-blue-100 mb-2">
                    <span className="text-[9px] font-black text-blue-700 uppercase tracking-wider block">Connected WBS Scope</span>
                    <span className="text-xs font-bold text-slate-800 block mt-1">Assotech Iconic Tower A - MEP Coordination</span>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">Agenda Checklist</span>
                      <div className="space-y-2.5">
                        {/* Phase 1 */}
                        <div className="bg-white border border-slate-150 rounded-xl p-3">
                          <span className="text-[9px] font-extrabold text-[#1a73e8] uppercase block tracking-wider">Phase 1: Model Pre-check</span>
                          <div className="mt-2 space-y-2">
                            <label className="flex items-start gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                              <input type="checkbox" defaultChecked className="mt-0.5" />
                              <span>Verify structural column alignments (Sheet S-02)</span>
                            </label>
                            <label className="flex items-start gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                              <input type="checkbox" defaultChecked className="mt-0.5" />
                              <span>Check mechanical duct elevation clearances</span>
                            </label>
                          </div>
                        </div>

                        {/* Phase 2 */}
                        <div className="bg-white border border-slate-150 rounded-xl p-3">
                          <span className="text-[9px] font-extrabold text-purple-650 uppercase block tracking-wider">Phase 2: Clash Resolution</span>
                          <div className="mt-2 space-y-2">
                            <label className="flex items-start gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                              <input type="checkbox" className="mt-0.5" />
                              <span>Resolve 24 critical HVAC/structural column clashes</span>
                            </label>
                            <label className="flex items-start gap-2 text-[11px] font-semibold text-slate-700 cursor-pointer">
                              <input type="checkbox" className="mt-0.5" />
                              <span>Confirm fire protection layout tolerances</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 2. Outgoing calling ring overlay widget */}
      {outgoingCallOpen && (
        <div className="fixed inset-0 z-[1002] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 shadow-[0_24px_70px_rgba(2,6,23,0.18)] border border-slate-100 w-full max-w-sm text-center flex flex-col items-center">
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
              <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping" />
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center">AR</div>
            </div>
            <h3 className="text-sm font-extrabold text-slate-800">{activeMeetTitle}</h3>
            <span className="text-[9px] text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full font-bold mt-2 animate-pulse">Calling...</span>
            <button onClick={() => setOutgoingCallOpen(false)} className="mt-6 w-full py-2 bg-red-650 hover:bg-red-750 text-white rounded-xl text-xs font-bold cursor-pointer">Cancel Call</button>
          </div>
        </div>
      )}

      {/* 3. Incoming Call Request Modal */}
      {incomingCallOpen && (
        <div className="fixed inset-0 z-[1002] bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 select-none">
          <div className="bg-white rounded-3xl p-6 shadow-[0_24px_70px_rgba(2,6,23,0.18)] border border-slate-100 w-full max-w-sm text-center flex flex-col items-center">
            <div className="relative flex items-center justify-center w-24 h-24 mb-4">
              <div className="absolute inset-0 rounded-full border-2 border-emerald-500/30 animate-pulse" />
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white font-extrabold text-lg flex items-center justify-center">AR</div>
            </div>
            <h3 className="text-sm font-extrabold text-slate-805">Adil Rashid</h3>
            <span className="text-[9px] text-emerald-650 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold mt-2">Incoming Video Call...</span>
            <div className="mt-6 grid grid-cols-2 gap-3.5 w-full">
              <button onClick={() => setIncomingCallOpen(false)} className="py-2.5 bg-slate-100 text-slate-650 rounded-xl text-xs font-bold cursor-pointer">Reject</button>
              <button
                onClick={() => {
                  setIncomingCallOpen(false);
                  setActiveMeetTitle("Adil Rashid's Call");
                  setActiveMeetOpen(true);
                }}
                className="py-2.5 bg-emerald-650 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Call Toast Notification Banner */}
      {meetBannerOpen && (
        <div className="fixed top-5 right-5 z-[1001] w-full max-w-sm select-none animate-in slide-in-from-top-4 duration-200">
          <div className="bg-white rounded-2xl border border-slate-150 overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-blue-600 text-white p-3 flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Meeting in progress</span>
            </div>
            <div className="p-3 text-left">
              <h4 className="text-xs font-extrabold text-slate-800">Weekly Design Review</h4>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Host: Ashish Dalei · 4 active</p>
              <div className="mt-2.5 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${(meetBannerTimeLeft / 12) * 100}%` }} />
              </div>
              <div className="mt-3 flex justify-end gap-1.5">
                <button onClick={() => setMeetBannerOpen(false)} className="h-7 px-3 bg-slate-100 text-slate-650 text-[9px] font-bold rounded-lg cursor-pointer">Ignore</button>
                <button
                  onClick={() => {
                    setMeetBannerOpen(false);
                    setActiveMeetTitle("Weekly Design Review");
                    setActiveMeetOpen(true);
                  }}
                  className="h-7 px-3 bg-blue-600 text-white text-[9px] font-bold rounded-lg cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
