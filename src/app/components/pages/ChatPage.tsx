import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Video,
  UserPlus,
  MoreVertical,
  Smile,
  Image as ImageIcon,
  ImagePlus,
  Paperclip,
  Send,
  Plus,
  Clock,
  FileText,
  Check,
  X,
  MessageSquare,
  MessageSquarePlus,
  MessageCircle,
  Users,
  Calendar,
  AlertCircle,
  FolderPlus,
  Info,
  Reply,
  Trash2,
  ThumbsUp,
  Heart,
  SmilePlus,
  Camera,
  Film,
  Music,
  User,
  Play,
  Pause,
  Download,
  Maximize2,
  Sparkles,
  Star,
  ChevronLeft,
  ChevronRight,
  Forward,
  Settings,
  Link,
  Mail,
  Copy,
  ExternalLink,
  LogIn,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Grid,
  PhoneOff,
  Pin,
  Coffee,
  Sun,
  Pencil
} from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";

// Define TypeScript interfaces
type MessageAttachment = {
  type: "image" | "file" | "meeting" | "audio" | "video" | "contact";
  url?: string;
  fileName?: string;
  fileSize?: string;
  meetingTitle?: string;
  meetingDate?: string;
  meetingTime?: string;
  contactName?: string;
  contactRole?: string;
  contactAvatar?: string;
  duration?: string;
};

interface Message {
  id: string;
  sender: string;
  avatar?: string;
  text: string;
  time: string;
  isSelf: boolean;
  status?: "sent" | "read";
  starred?: boolean;
  forwardedFrom?: {
    sender: string;
    channelName: string;
  };
  replyTo?: {
    sender: string;
    text: string;
  };
  reactions?: {
    emoji: string;
    count: number;
    userReacted: boolean;
  }[];
  attachment?: MessageAttachment;
  attachments?: MessageAttachment[];
  deleted?: boolean;
  deletedLabel?: string;
  edited?: boolean;
}

interface Channel {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  metric: string;
  unreadCount?: number;
  avatarColor: string;
  avatarUrl?: string;
  members: string[];
}

interface Workspace {
  id: string;
  name: string;
  membersCount: number;
  teamsCount: number;
  badgeCount: number;
  avatarInitials: string;
  avatarBg: string;
}

type ConversationFilter = "all" | "unread" | "groups" | "direct" | "media" | "starred";
type ChatFeedbackToast = {
  id: number;
  title: string;
  description?: string;
  tone?: "info" | "success";
};

export function ChatPage() {
  const { setMode } = useSidebar();

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning";
    if (hrs < 17) return "Good afternoon";
    return "Good evening";
  };
  
  // Set sidebar mode to main
  useEffect(() => {
    setMode("main");
  }, [setMode]);

  useEffect(() => {
    const scrollContainer = document.querySelector("main");
    scrollContainer?.scrollTo({ top: 0, left: 0 });
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  // Workspace state
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    const hardcoded = [
      { id: "ws1", name: "Assotech Iconic", membersCount: 24, teamsCount: 3, badgeCount: 7, avatarInitials: "AI", avatarBg: "bg-indigo-600" },
      { id: "ws2", name: "Utkal Pleasant", membersCount: 24, teamsCount: 3, badgeCount: 3, avatarInitials: "UP", avatarBg: "bg-slate-700" },
      { id: "ws3", name: "Mani Tribhuban", membersCount: 24, teamsCount: 3, badgeCount: 22, avatarInitials: "MT", avatarBg: "bg-slate-600" },
      { id: "ws4", name: "DION Riverfront", membersCount: 24, teamsCount: 3, badgeCount: 9, avatarInitials: "DR", avatarBg: "bg-stone-700" },
      { id: "ws5", name: "Assotech Hatch", membersCount: 24, teamsCount: 3, badgeCount: 4, avatarInitials: "AH", avatarBg: "bg-blue-600" },
    ];
    try {
      const stored = localStorage.getItem("bimbox_projects");
      if (stored) {
        const parsed = JSON.parse(stored);
        const mapped = parsed.map((p: any) => ({
          id: p.id,
          name: p.name,
          membersCount: 24,
          teamsCount: p.teamStructure?.length || 3,
          badgeCount: 0,
          avatarInitials: p.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
          avatarBg: "bg-indigo-600",
          isCustom: true,
          teamStructure: p.teamStructure
        }));
        return [...mapped, ...hardcoded];
      }
    } catch (e) {
      console.error(e);
    }
    return hardcoded;
  });

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace>(workspaces[0]);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [workspaceSearch, setWorkspaceSearch] = useState("");

  const defaultChannels: Channel[] = [
    {
      id: "ch_structural",
      name: "Structural team",
      lastMessage: "Okay",
      time: "9:38 AM",
      metric: "4.50",
      avatarColor: "bg-slate-500",
      avatarUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
      members: ["Liam", "Marvin", "Olivia", "Mukesh", "Deep", "Jayden", "Joy", "Rudra"]
    },
    {
      id: "ch_arch",
      name: "Architectural team",
      lastMessage: "Sharing the layout",
      time: "3:15 PM",
      metric: "3:15",
      avatarColor: "bg-zinc-500",
      avatarUrl: "https://images.unsplash.com/photo-1503387762-592ded58c45a?w=100&auto=format&fit=crop&q=60",
      members: ["Liam", "Sophia", "Alex", "Rudra"]
    },
    {
      id: "dm_liam_henderson",
      name: "Liam Henderson",
      lastMessage: "Can you review the RFI note?",
      time: "3:05 PM",
      metric: "3:05",
      avatarColor: "bg-blue-600",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      members: ["Liam Henderson", "Rudra"]
    },
    {
      id: "dm_olivia_smith",
      name: "Olivia Smith",
      lastMessage: "The site team is aligned.",
      time: "2:45 PM",
      metric: "2:45",
      avatarColor: "bg-rose-600",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      members: ["Olivia Smith", "Rudra"]
    },
    {
      id: "ch_design",
      name: "Design consultants",
      lastMessage: "Reviewing blueprints",
      time: "2:05 PM",
      metric: "2.85",
      unreadCount: 7,
      avatarColor: "bg-stone-500",
      avatarUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=60",
      members: ["Marvin", "Daniel", "Emma", "Rudra"]
    },
    {
      id: "ch_pm",
      name: "Project managers",
      lastMessage: "Coordinating tasks",
      time: "4:20 PM",
      metric: "4.20",
      unreadCount: 12,
      avatarColor: "bg-slate-600",
      members: ["Olivia", "David", "James", "Rudra"]
    },
    {
      id: "ch_client_1",
      name: "Client representatives",
      lastMessage: "Providing feedback",
      time: "3:50 PM",
      metric: "3.90",
      unreadCount: 10,
      avatarColor: "bg-zinc-600",
      members: ["Mr. Kapoor", "Sarah", "Rudra"]
    },
    {
      id: "ch_client_2",
      name: "Client representatives (V2)",
      lastMessage: "Providing feedback on structural updates",
      time: "3:50 PM",
      metric: "3.90",
      avatarColor: "bg-stone-600",
      members: ["Mr. Kapoor", "Rudra"]
    },
    {
      id: "ch_pm_alt",
      name: "Project managers (Alternative)",
      lastMessage: "Coordinating tasks",
      time: "4:25 PM",
      metric: "4.25",
      avatarColor: "bg-slate-500",
      members: ["Olivia", "Rudra"]
    },
    {
      id: "ch_devs",
      name: "Developers",
      lastMessage: "Implementing features",
      time: "4:15 PM",
      metric: "4.75",
      avatarColor: "bg-zinc-700",
      members: ["Liam", "Rudra", "Arjun", "Neha"]
    }
  ];

  const [channels, setChannels] = useState<Channel[]>(defaultChannels);
  const [activeChannelId, setActiveChannelId] = useState<string | null>("ch_structural");

  // Dynamically load channels when workspace is switched
  useEffect(() => {
    const ws = activeWorkspace as any;
    if (ws && ws.isCustom && ws.teamStructure) {
      if (ws.teamStructure.length === 0) {
        // If they skipped creating teams, show a default general team and developers/direct messages
        const defaultSkipped: Channel[] = [
          {
            id: "ch_custom_general",
            name: "General team",
            lastMessage: "Welcome to the workspace general channel!",
            time: "10:00 AM",
            metric: "10:00",
            avatarColor: "bg-blue-600",
            members: ["Liam", "Sophia", "Alex", "Rudra", "Salman"]
          },
          {
            id: "dm_salman",
            name: "Salman Kumar (You)",
            lastMessage: "Workspace initialized.",
            time: "10:00 AM",
            metric: "10:00",
            avatarColor: "bg-slate-500",
            members: ["Salman Kumar", "Rudra"]
          }
        ];
        setChannels(defaultSkipped);
        setActiveChannelId("ch_custom_general");
      } else {
        const customChannels: Channel[] = ws.teamStructure.map((t: string, idx: number) => ({
          id: `ch_custom_${t.toLowerCase().replace(/\s+/g, "_")}`,
          name: `${t} channel`,
          lastMessage: `Welcome to the ${t} channel!`,
          time: "10:00 AM",
          metric: "10:00",
          avatarColor: idx % 3 === 0 ? "bg-blue-600" : idx % 3 === 1 ? "bg-emerald-600" : "bg-purple-600",
          members: ["Liam", "Sophia", "Alex", "Rudra", "Salman"]
        }));
        
        customChannels.push({
          id: "dm_salman",
          name: "Salman Kumar (You)",
          lastMessage: "Workspace initialized.",
          time: "10:00 AM",
          metric: "10:00",
          avatarColor: "bg-slate-500",
          members: ["Salman Kumar", "Rudra"]
        });
        
        setChannels(customChannels);
        setActiveChannelId(customChannels[0].id);
      }
    } else {
      setChannels(defaultChannels);
      setActiveChannelId("ch_structural");
    }
  }, [activeWorkspace]);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<ConversationFilter>("all");
  const [channelFilterOpen, setChannelFilterOpen] = useState(false);
  const [directComposeOpen, setDirectComposeOpen] = useState(false);
  const [directComposeSearch, setDirectComposeSearch] = useState("");

  // Messages dictionary
  const [conversations, setConversations] = useState<Record<string, Message[]>>({
    ch_structural: [
      { id: "m1", sender: "Liam", text: "Hi Jay, Any update today", time: "9:30 AM", isSelf: false },
      { id: "m2", sender: "Marvin", text: "Are you available at 3PM Tomorrow", time: "9:31 AM", isSelf: false },
      { id: "m3", sender: "Olivia", text: "I'd like to discuss about the report tomorrow so that we can move forward the project", time: "9:32 AM", isSelf: false },
      { id: "m4", sender: "Joy", text: "Yeah Jayden Good morning", time: "9:36 AM", isSelf: true, status: "sent" },
      {
        id: "m5",
        sender: "Joy",
        text: "Yeah , Definitely i am available tomorrow, i am busy today , i can't meet at 3PM tomorrow so we will meet at 4.00PM tomorrow",
        time: "9:36 AM",
        isSelf: true,
        status: "read"
      },
      {
        id: "m6",
        sender: "Joy",
        text: "See this, how it is",
        time: "9:36 AM",
        isSelf: true,
        status: "read",
        attachment: {
          type: "image",
          url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80"
        }
      },
      { id: "m7", sender: "Mukesh", text: "Okay", time: "9:38 AM", isSelf: false }
    ],
    ch_arch: [
      { id: "arch_1", sender: "Sophia", text: "Hi team, we uploaded the latest CAD drawing for the ground floor plan.", time: "3:10 PM", isSelf: false },
      { id: "arch_2", sender: "Liam", text: "Sharing the layout", time: "3:15 PM", isSelf: false }
    ],
    dm_liam_henderson: [
      { id: "dm_liam_1", sender: "Liam Henderson", text: "Can you review the RFI note?", time: "3:05 PM", isSelf: false }
    ],
    dm_olivia_smith: [
      { id: "dm_olivia_1", sender: "Olivia Smith", text: "The site team is aligned.", time: "2:45 PM", isSelf: false }
    ],
    ch_design: [
      { id: "des_1", sender: "Daniel", text: "Are the mechanical shaft coordinates verified?", time: "1:55 PM", isSelf: false },
      { id: "des_2", sender: "Marvin", text: "Reviewing blueprints", time: "2:05 PM", isSelf: false }
    ],
    ch_pm: [
      { id: "pm_1", sender: "Olivia", text: "Coordinating tasks for the upcoming site inspection.", time: "4:20 PM", isSelf: false }
    ],
    ch_client_1: [
      { id: "cl1_1", sender: "Mr. Kapoor", text: "Providing feedback on the glass facade mockup.", time: "3:50 PM", isSelf: false }
    ]
  });

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPopoverRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [newTeamModalOpen, setNewTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);



  const [shareFilesModalOpen, setShareFilesModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [selectedFileSize, setSelectedFileSize] = useState("");

  // Attachment option menus & modal triggers
  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [linkMenuOpen, setLinkMenuOpen] = useState(false);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [contactCardModalOpen, setContactCardModalOpen] = useState(false);
  const [activePlayingAudio, setActivePlayingAudio] = useState<string | null>(null);

  // Custom premium additions
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dmsExpanded, setDmsExpanded] = useState(true);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [membersModalOpen, setMembersModalOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [sharedMediaModalOpen, setSharedMediaModalOpen] = useState(false);
  const [sharedMediaTab, setSharedMediaTab] = useState<"members" | "media" | "files" | "starred" | "meetings">("members");
  const [chatOptionsOpen, setChatOptionsOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showUpcomingMeetTooltip, setShowUpcomingMeetTooltip] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [forwardModalOpen, setForwardModalOpen] = useState(false);
  const [selectedForwardChannelIds, setSelectedForwardChannelIds] = useState<string[]>([]);
  const [activeMessageMenuId, setActiveMessageMenuId] = useState<string | null>(null);
  const [activeMemberMenuName, setActiveMemberMenuName] = useState<string | null>(null);
  const [attachmentPreviewMessage, setAttachmentPreviewMessage] = useState<Message | null>(null);
  const [attachmentPreviewIndex, setAttachmentPreviewIndex] = useState(0);
  const [readReceiptMessage, setReadReceiptMessage] = useState<Message | null>(null);
  const [chatFeedbackToast, setChatFeedbackToast] = useState<ChatFeedbackToast | null>(null);
  const [deleteConfirmAction, setDeleteConfirmAction] = useState<{
    title: string;
    description: string;
    confirmLabel: string;
    run: () => void;
  } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Multi-recipient state (landing screen photo/file/meeting send to up to 5 channels)
  const [landingActionType, setLandingActionType] = useState<"photo" | "file" | "meeting" | null>(null);
  const [selectedChannelsForMultiSend, setSelectedChannelsForMultiSend] = useState<string[]>([]);
  const [multiSelectModalOpen, setMultiSelectModalOpen] = useState(false);

  // Self typing delay simulation
  const [selfIsTyping, setSelfIsTyping] = useState(false);

  const showChatFeedback = (title: string, description?: string, tone: "info" | "success" = "info") => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    setChatFeedbackToast({ id: Date.now(), title, description, tone });
    toastTimerRef.current = window.setTimeout(() => {
      setChatFeedbackToast(null);
      toastTimerRef.current = null;
    }, 2400);
  };

  // Subtle Mesh Gradient styling
  const meshGradientStyle: React.CSSProperties = {
    backgroundImage: `
      radial-gradient(at 0% 0%, hsla(217, 100%, 97%, 1) 0px, transparent 50%),
      radial-gradient(at 50% 0%, hsla(219, 85%, 94%, 1) 0px, transparent 50%),
      radial-gradient(at 100% 0%, hsla(220, 100%, 96%, 1) 0px, transparent 50%),
      radial-gradient(at 50% 100%, hsla(219, 90%, 95%, 1) 0px, transparent 50%)
    `,
    backgroundColor: "#f1f5f9"
  };

  // High-quality Web Audio API UI sound synthesizers
  const playChatSound = (type: "send" | "receive") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      if (type === "send") {
        // Soft bubble frequency-sweep sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      } else {
        // Smooth double-chime/bell sound
        const playBellNode = (freq: number, startDelay: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + startDelay);
          
          gain.gain.setValueAtTime(0, ctx.currentTime + startDelay);
          gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + startDelay + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startDelay + duration);
          
          osc.start(ctx.currentTime + startDelay);
          osc.stop(ctx.currentTime + startDelay + duration);
        };
        
        playBellNode(587.33, 0, 0.2); // D5
        playBellNode(880.00, 0.07, 0.25); // A5
      }
    } catch (err) {
      console.warn("Could not play sound effect:", err);
    }
  };

  // Get active channel details
  const activeChannel = channels.find(c => c.id === activeChannelId);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeChannelId, isTyping]);

  useEffect(() => {
    if (!composerRef.current || inputText) return;
    composerRef.current.style.height = "40px";
  }, [inputText]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const elementTarget = event.target as HTMLElement;
      if (workspaceDropdownOpen && workspaceMenuRef.current && !workspaceMenuRef.current.contains(target)) {
        setWorkspaceDropdownOpen(false);
      }
      if (
        emojiPickerOpen &&
        emojiPopoverRef.current &&
        !emojiPopoverRef.current.contains(target) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(target)
      ) {
        setEmojiPickerOpen(false);
      }
      if (!elementTarget.closest(".chat-menu-surface") && !elementTarget.closest("[data-chat-popover-trigger='true']")) {
        setImageMenuOpen(false);
        setLinkMenuOpen(false);
        setChannelFilterOpen(false);
        setDirectComposeOpen(false);
        setChatOptionsOpen(false);
        setActiveMessageMenuId(null);
        setActiveMemberMenuName(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [workspaceDropdownOpen, emojiPickerOpen]);

  // Handle Channel Selection
  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setSelectionMode(false);
    setSelectedMessageIds([]);
    setForwardModalOpen(false);
    setSelectedForwardChannelIds([]);
    setChatOptionsOpen(false);
    setDirectComposeOpen(false);
    setActiveMessageMenuId(null);
    setActiveMemberMenuName(null);
    
    // Clear unread count
    setChannels(prev => 
      prev.map(c => c.id === channelId ? { ...c, unreadCount: undefined } : c)
    );
  };

  // Format current time helper
  const getFormattedTime = () => {
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  const getMessagePreview = (msg?: Message) => {
    if (!msg) return "No messages yet";
    if (msg.deleted) return msg.deletedLabel || "Message deleted";
    if (msg.attachments?.length) {
      const mediaCount = msg.attachments.filter(item => ["image", "video"].includes(item.type)).length;
      const fileCount = msg.attachments.length - mediaCount;
      if (mediaCount && fileCount) return `${msg.attachments.length} attachments`;
      if (mediaCount) return `${mediaCount} media file${mediaCount === 1 ? "" : "s"}`;
      return `${fileCount} file${fileCount === 1 ? "" : "s"}`;
    }
    if (msg.attachment) {
      if (msg.attachment.type === "file") return `File: ${msg.attachment.fileName || "Document"}`;
      if (msg.attachment.type === "image") return "Photo";
      if (msg.attachment.type === "video") return "Video";
      if (msg.attachment.type === "audio") return "Audio";
      if (msg.attachment.type === "meeting") return `Meeting: ${msg.attachment.meetingTitle || "Invite"}`;
      if (msg.attachment.type === "contact") return `Contact: ${msg.attachment.contactName || "Contact"}`;
    }
    return msg.text || "Message";
  };

  const getAttachmentTitle = (msg?: Message | null) => {
    const attachment = msg?.attachments?.[attachmentPreviewIndex] || msg?.attachment;
    if (!attachment) return "Attachment";
    if (attachment.fileName) return attachment.fileName;
    if (attachment.type === "image") return msg?.text || "Photo";
    if (attachment.type === "video") return msg?.text || "Video";
    if (attachment.type === "audio") return msg?.text || "Audio";
    if (attachment.type === "file") return "Document";
    return getMessagePreview(msg);
  };

  const getFileSizeLabel = (file: File) => (
    file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`
  );

  const senderThemes = [
    { color: "#2563eb", tint: "rgba(37,99,235,0.055)", border: "rgba(37,99,235,0.14)" },
    { color: "#0f9f6e", tint: "rgba(15,159,110,0.06)", border: "rgba(15,159,110,0.15)" },
    { color: "#9333ea", tint: "rgba(147,51,234,0.055)", border: "rgba(147,51,234,0.14)" },
    { color: "#db2777", tint: "rgba(219,39,119,0.052)", border: "rgba(219,39,119,0.14)" },
    { color: "#ea580c", tint: "rgba(234,88,12,0.055)", border: "rgba(234,88,12,0.14)" },
    { color: "#0891b2", tint: "rgba(8,145,178,0.055)", border: "rgba(8,145,178,0.14)" }
  ];

  const getSenderTheme = (sender: string) => {
    const hash = Array.from(sender).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return senderThemes[hash % senderThemes.length];
  };

  const getSenderBubbleStyle = (sender: string): React.CSSProperties => {
    const theme = getSenderTheme(sender);
    return {
      background: `linear-gradient(135deg, rgba(255,255,255,0.84), ${theme.tint})`,
      borderColor: theme.border,
      boxShadow: `0 8px 24px rgba(15,23,42,0.055), inset 3px 0 0 ${theme.border}, inset 0 1px 0 rgba(255,255,255,0.9)`
    };
  };

  // Handle System Photo Selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const attachments: MessageAttachment[] = files.map(file => ({
      type: "image",
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: getFileSizeLabel(file)
    }));
    handleSendMessage(files.length === 1 ? files[0].name : `${files.length} photos`, files.length === 1 ? attachments[0] : attachments);
    setImageMenuOpen(false);
  };

  // Handle System Document Selection
  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const attachments: MessageAttachment[] = files.map(file => ({
      type: "file",
      fileName: file.name,
      fileSize: getFileSizeLabel(file),
      url: URL.createObjectURL(file)
    }));
    handleSendMessage(files.length === 1 ? "" : `${files.length} documents`, files.length === 1 ? attachments[0] : attachments);
    setLinkMenuOpen(false);
  };

  // Handle System Video Selection
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const attachments: MessageAttachment[] = files.map(file => ({
      type: "video",
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: getFileSizeLabel(file)
    }));
    handleSendMessage(files.length === 1 ? files[0].name : `${files.length} videos`, files.length === 1 ? attachments[0] : attachments);
    setLinkMenuOpen(false);
  };

  // Handle System Audio Selection
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    const attachments: MessageAttachment[] = files.map(file => ({
      type: "audio",
      url: URL.createObjectURL(file),
      fileName: file.name,
      fileSize: getFileSizeLabel(file),
      duration: "2:34"
    }));
    handleSendMessage(files.length === 1 ? "" : `${files.length} audio files`, files.length === 1 ? attachments[0] : attachments);
    setLinkMenuOpen(false);
  };

  // Handle mixed multi-file selection
  const handleAnyFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;

    const attachments: MessageAttachment[] = files.map(file => {
      const mimeType = file.type || "";
      const lowerName = file.name.toLowerCase();
      const baseAttachment = {
        url: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: getFileSizeLabel(file)
      };

      if (mimeType.startsWith("image/")) {
        return { ...baseAttachment, type: "image" };
      }
      if (mimeType.startsWith("video/")) {
        return { ...baseAttachment, type: "video" };
      }
      if (mimeType.startsWith("audio/")) {
        return { ...baseAttachment, type: "audio", duration: "2:34" };
      }
      if (lowerName.match(/\.(jpg|jpeg|png|gif|webp|avif)$/)) {
        return { ...baseAttachment, type: "image" };
      }
      if (lowerName.match(/\.(mp4|mov|webm|m4v)$/)) {
        return { ...baseAttachment, type: "video" };
      }
      if (lowerName.match(/\.(mp3|wav|m4a|aac|ogg)$/)) {
        return { ...baseAttachment, type: "audio", duration: "2:34" };
      }
      return { ...baseAttachment, type: "file" };
    });

    handleSendMessage(
      files.length === 1 ? files[0].name : `${files.length} attachments`,
      files.length === 1 ? attachments[0] : attachments
    );
    setImageMenuOpen(false);
    setLinkMenuOpen(false);
  };

  // Send Contact Card
  const handleSendContact = (name: string, role: string, avatar: string) => {
    handleSendMessage("", {
      type: "contact",
      contactName: name,
      contactRole: role,
      contactAvatar: avatar
    });
    setContactCardModalOpen(false);
    setLinkMenuOpen(false);
  };

  // Send Gif/Sticker
  const handleSendGif = (gifUrl: string) => {
    handleSendMessage("", {
      type: "image",
      url: gifUrl,
      fileName: "Sticker"
    });
    setGifPickerOpen(false);
    setImageMenuOpen(false);
  };

  const handleLandingPhotoSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setPhotoPreview(loadEvent.target?.result as string);
      setLandingActionType("photo");
      setSelectedChannelsForMultiSend([]);
      setMultiSelectModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleGroupDpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !activeChannelId) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const nextAvatarUrl = loadEvent.target?.result as string;
      setChannels(prev => prev.map(channel => (
        channel.id === activeChannelId ? { ...channel, avatarUrl: nextAvatarUrl } : channel
      )));
    };
    reader.readAsDataURL(file);
  };

  // Send message handler
  const handleSendMessage = (textToSend = inputText.trim(), customAttachment?: MessageAttachment | MessageAttachment[]) => {
    if (!textToSend && !customAttachment) return;
    if (!activeChannelId) return;

    if (!customAttachment) {
      setInputText("");
    }
    if (replyingToMessage) {
      setReplyingToMessage(null);
    }

    // Set self typing status to true
    setSelfIsTyping(true);

    setTimeout(() => {
      setSelfIsTyping(false);
      
      const newMsg: Message = {
        id: `msg_${Date.now()}`,
        sender: "Rudra",
        text: textToSend,
        time: getFormattedTime(),
        isSelf: true,
        status: "sent",
        attachment: Array.isArray(customAttachment) ? undefined : customAttachment,
        attachments: Array.isArray(customAttachment) ? customAttachment : undefined,
        replyTo: replyingToMessage ? { sender: replyingToMessage.sender, text: replyingToMessage.text } : undefined
      };

      // Play send sound effect
      playChatSound("send");

      // Update conversation
      setConversations(prev => ({
        ...prev,
        [activeChannelId]: [...(prev[activeChannelId] || []), newMsg]
      }));

      // Update last message in channels list
      setChannels(prev => 
        prev.map(c => c.id === activeChannelId 
          ? { ...c, lastMessage: getMessagePreview(newMsg), time: getFormattedTime() }
          : c
        )
      );

      // Set status to read after a tiny delay
      setTimeout(() => {
        setConversations(prev => {
          const msgs = prev[activeChannelId] || [];
          return {
            ...prev,
            [activeChannelId]: msgs.map(m => m.id === newMsg.id ? { ...m, status: "read" } : m)
          };
        });
      }, 1000);

      // Simulate Reply
      simulateReply(textToSend);
    }, 450);
  };

  // Toggle emoji reaction on message
  const handleToggleReaction = (msgId: string, emoji: string) => {
    if (!activeChannelId) return;
    setConversations(prev => {
      const msgs = prev[activeChannelId] || [];
      return {
        ...prev,
        [activeChannelId]: msgs.map(m => {
          if (m.id !== msgId) return m;
          const reactions = m.reactions ? [...m.reactions] : [];
          const existing = reactions.find(r => r.emoji === emoji);
          if (existing) {
            if (existing.userReacted) {
              existing.count -= 1;
              existing.userReacted = false;
            } else {
              existing.count += 1;
              existing.userReacted = true;
            }
          } else {
            reactions.push({ emoji, count: 1, userReacted: true });
          }
          return { ...m, reactions: reactions.filter(r => r.count > 0) };
        })
      };
    });
  };

  const handleToggleStar = (msgId: string) => {
    if (!activeChannelId) return;
    setConversations(prev => {
      const msgs = prev[activeChannelId] || [];
      return {
        ...prev,
        [activeChannelId]: msgs.map(m => m.id === msgId ? { ...m, starred: !m.starred } : m)
      };
    });
  };

  const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setEmojiPickerOpen(false);
      setImageMenuOpen(false);
      setLinkMenuOpen(false);
      setReplyingToMessage(null);
      setActiveMessageMenuId(null);
      setAttachmentPreviewMessage(null);
      return;
    }

    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    handleSendMessage();
  };

  const handleComposerCopy = () => {
    showChatFeedback("Copied", "Selected text copied from message box.", "success");
  };

  const handleComposerPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text");
    showChatFeedback(
      "Pasted",
      pastedText ? `${Math.min(pastedText.length, 120)} characters added.` : "Content pasted into message box.",
      "success"
    );
  };

  const handleToggleMessageSelection = (msgId: string) => {
    setSelectionMode(true);
    setSelectedMessageIds(prev => (
      prev.includes(msgId)
        ? prev.filter(id => id !== msgId)
        : [...prev, msgId]
    ));
  };

  const handleStartSelection = (msgId: string) => {
    setSelectionMode(true);
    setSelectedMessageIds(prev => prev.includes(msgId) ? prev : [...prev, msgId]);
    setActiveMessageMenuId(null);
  };

  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedMessageIds([]);
    setForwardModalOpen(false);
    setSelectedForwardChannelIds([]);
    setChatOptionsOpen(false);
    setActiveMessageMenuId(null);
  };

  const handleSelectAllMessages = () => {
    if (!activeChannelId) return;
    const ids = (conversations[activeChannelId] || [])
      .filter(m => m.sender !== "System" && !m.deleted)
      .map(m => m.id);
    setSelectionMode(true);
    setSelectedMessageIds(ids);
  };

  const handleBulkDelete = () => {
    if (!activeChannelId || selectedMessageIds.length === 0) return;
    setDeleteConfirmAction({
      title: "Delete selected messages?",
      description: `${selectedMessageIds.length} selected message${selectedMessageIds.length === 1 ? "" : "s"} will be removed from this chat view.`,
      confirmLabel: "Delete",
      run: () => {
        if (!activeChannelId) return;
        const selectedSet = new Set(selectedMessageIds);
        setConversations(prev => {
          const filtered = (prev[activeChannelId] || []).filter(m => !selectedSet.has(m.id));
          setTimeout(() => {
            const lastMsg = filtered[filtered.length - 1];
            setChannels(prevChannels => prevChannels.map(c => c.id === activeChannelId
              ? { ...c, lastMessage: getMessagePreview(lastMsg), time: lastMsg?.time || getFormattedTime() }
              : c
            ));
          }, 50);
          return { ...prev, [activeChannelId]: filtered };
        });
        handleCancelSelection();
      }
    });
  };

  const handleForwardSelectedMessages = () => {
    if (!activeChannelId || !activeChannel || selectedMessageIds.length === 0 || selectedForwardChannelIds.length === 0) return;
    const selectedSet = new Set(selectedMessageIds);
    const messagesToForward = (conversations[activeChannelId] || []).filter(m => selectedSet.has(m.id));
    const now = getFormattedTime();

    setConversations(prev => {
      const next = { ...prev };
      selectedForwardChannelIds.forEach(channelId => {
        const forwardedMessages = messagesToForward.map((msg, index): Message => ({
          id: `fwd_${Date.now()}_${channelId}_${msg.id}_${index}`,
          sender: "Rudra",
          text: msg.text,
          time: now,
          isSelf: true,
          status: "read",
          attachment: msg.attachment ? { ...msg.attachment } : undefined,
          attachments: msg.attachments ? msg.attachments.map(item => ({ ...item })) : undefined,
          forwardedFrom: { sender: msg.sender, channelName: activeChannel.name }
        }));
        next[channelId] = [...(next[channelId] || []), ...forwardedMessages];
      });
      return next;
    });

    setChannels(prev => prev.map(c => {
      if (!selectedForwardChannelIds.includes(c.id)) return c;
      return {
        ...c,
        lastMessage: selectedMessageIds.length === 1 ? `Forwarded: ${getMessagePreview(messagesToForward[0])}` : `Forwarded ${selectedMessageIds.length} messages`,
        time: now
      };
    }));

    handleCancelSelection();
  };

  const handleSaveEdit = (msgId: string) => {
    if (!activeChannelId || !editingText.trim()) return;
    setConversations((prev) => {
      const msgs = prev[activeChannelId] || [];
      const updated = msgs.map((m) => {
        if (m.id === msgId) {
          return { ...m, text: editingText, edited: true };
        }
        return m;
      });
      return { ...prev, [activeChannelId]: updated };
    });

    // Update last message of the active channel
    setChannels((prev) =>
      prev.map((c) => {
        if (c.id === activeChannelId) {
          return { ...c, lastMessage: editingText };
        }
        return c;
      })
    );

    setEditingMessageId(null);
    setEditingText("");
  };

  // Delete message locally for current user
  const handleDeleteForMe = (msgId: string) => {
    if (!activeChannelId) return;
    setDeleteConfirmAction({
      title: "Delete this message?",
      description: "This removes the message only from your current chat view.",
      confirmLabel: "Delete for me",
      run: () => {
        if (!activeChannelId) return;
        setActiveMessageMenuId(null);
        setSelectedMessageIds(prev => prev.filter(id => id !== msgId));
        setConversations(prev => {
          const msgs = prev[activeChannelId] || [];
          return {
            ...prev,
            [activeChannelId]: msgs.filter(m => m.id !== msgId)
          };
        });
      }
    });
  };

  // Unsend message completely
  const handleUnsend = (msgId: string) => {
    if (!activeChannelId) return;
    setDeleteConfirmAction({
      title: "Unsend this message?",
      description: "The original content will be replaced with a deleted-message stamp.",
      confirmLabel: "Unsend",
      run: () => {
        if (!activeChannelId) return;
        setActiveMessageMenuId(null);
        setSelectedMessageIds(prev => prev.filter(id => id !== msgId));
        setConversations(prev => {
          const msgs = prev[activeChannelId] || [];
          const updated = msgs.map(m => m.id === msgId ? {
            ...m,
            text: "",
            attachment: undefined,
            attachments: undefined,
            reactions: undefined,
            replyTo: undefined,
            deleted: true,
            deletedLabel: "You unsent this message"
          } : m);
          
          setTimeout(() => {
            const lastMsg = updated[updated.length - 1];
            setChannels(prevChannels => prevChannels.map(c => c.id === activeChannelId
              ? { ...c, lastMessage: getMessagePreview(lastMsg), time: lastMsg?.time || getFormattedTime() }
              : c
            ));
          }, 50);

          return {
            ...prev,
            [activeChannelId]: updated
          };
        });
      }
    });
  };

  // Multi-recipient action sending (from landing page quick cards)
  const handleMultiSend = () => {
    if (selectedChannelsForMultiSend.length === 0) {
      alert("Please select at least one person or group.");
      return;
    }
    if (selectedChannelsForMultiSend.length > 5) {
      alert("You can select up to 5 recipients max.");
      return;
    }

    const targets = selectedChannelsForMultiSend.map(recipientId => {
      if (!recipientId.startsWith("member:")) return { channelId: recipientId, memberName: "" };
      const memberName = recipientId.replace("member:", "");
      return { channelId: getDirectChannelId(memberName), memberName };
    });

    const directTargets = targets.filter(target => target.memberName);
    if (directTargets.length > 0) {
      setChannels(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        const directChannels = directTargets
          .filter(target => !existingIds.has(target.channelId))
          .map(target => ({
            id: target.channelId,
            name: target.memberName,
            lastMessage: "No messages yet",
            time: getFormattedTime(),
            metric: getFormattedTime(),
            avatarColor: "bg-slate-600",
            members: [target.memberName, "Rudra"]
          }));
        return directChannels.length ? [...directChannels, ...prev] : prev;
      });
    }

    targets.forEach(({ channelId: chanId }) => {
      let textContent = "";
      let attachmentPayload: any = undefined;

      if (landingActionType === "photo") {
        textContent = "Sent a photo attachment";
        attachmentPayload = { type: "image", url: photoPreview || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80" };
      } else if (landingActionType === "file") {
        textContent = `Shared file: ${selectedFileName}`;
        attachmentPayload = { type: "file", fileName: selectedFileName, fileSize: selectedFileSize || "2.4 MB" };
      }

      const newMsg: Message = {
        id: `msg_multi_${Date.now()}_${chanId}`,
        sender: "Rudra",
        text: textContent,
        time: getFormattedTime(),
        isSelf: true,
        status: "read",
        attachment: attachmentPayload
      };

      // Add to conversation state
      setConversations(prev => ({
        ...prev,
        [chanId]: [...(prev[chanId] || []), newMsg]
      }));

      // Update channel info
      setChannels(prev => 
        prev.map(c => c.id === chanId 
          ? { 
              ...c, 
              lastMessage: attachmentPayload ? `Attachment: ${attachmentPayload.type}` : textContent, 
              time: getFormattedTime() 
            }
          : c
        )
      );
    });

    // Select the first channel as active chat and clear state
    setActiveChannelId(targets[0].channelId);
    setPhotoPreview(null);
    setSelectedFileName("");
    setSelectedFileSize("");
    setLandingActionType(null);
    setSelectedChannelsForMultiSend([]);
    setMultiSelectModalOpen(false);
    setShareFilesModalOpen(false);
  };

  // Simulate Team Member Reply
  const simulateReply = (userText: string) => {
    if (!activeChannel) return;
    
    const members = activeChannel.members.filter(m => m !== "Rudra" && m !== "Joy");
    if (members.length === 0) return;
    
    const randomResponder = members[Math.floor(Math.random() * members.length)];

    // Trigger typing indicator after 1 second
    setTimeout(() => {
      setTypingUser(randomResponder);
      setIsTyping(true);

      // Post reply after typing for 2 seconds
      setTimeout(() => {
        setIsTyping(false);
        
        let responseText = "Got it, thanks for the update. Let's sync up on this soon.";
        const textLower = userText.toLowerCase();
        
        if (textLower.includes("hello") || textLower.includes("hi")) {
          responseText = `Hey Rudra! Hope you are having a productive day. Let me know if you need anything from the ${activeChannel.name}.`;
        } else if (textLower.includes("blueprint") || textLower.includes("drawing") || textLower.includes("cad")) {
          responseText = "I've reviewed the design specs and the grids match the Revit structural model. Let's make sure the MEP team checks the clearance.";
        } else if (textLower.includes("meeting") || textLower.includes("available")) {
          responseText = "Calendar invite accepted. I will be joining from the onsite office.";
        } else if (textLower.includes("photo") || textLower.includes("see this") || textLower.includes("image")) {
          responseText = "This photo clarifies the site clearance issue perfectly. I will coordinate with the foreman immediately.";
        }

        const replyMsg: Message = {
          id: `msg_${Date.now()}_reply`,
          sender: randomResponder,
          text: responseText,
          time: getFormattedTime(),
          isSelf: false
        };

        // Play receive chime sound
        playChatSound("receive");

        setConversations(prev => ({
          ...prev,
          [activeChannelId || ""]: [...(prev[activeChannelId || ""] || []), replyMsg]
        }));

        setChannels(prev => 
          prev.map(c => c.id === activeChannelId 
            ? { ...c, lastMessage: responseText, time: getFormattedTime() }
            : c
          )
        );

        showChatFeedback("New message", `${randomResponder}: ${responseText}`, "info");
      }, 2000);
    }, 1200);
  };

  const channelHasMedia = (channelId: string) => (conversations[channelId] || []).some(m => ["image", "video", "audio", "file"].includes(m.attachment?.type || ""));
  const channelHasStarred = (channelId: string) => (conversations[channelId] || []).some(m => m.starred);
  const matchesConversationFilter = (channel: Channel) => {
    if (channelFilter === "unread") return Boolean(channel.unreadCount && channel.unreadCount > 0);
    if (channelFilter === "groups") return channel.members.length > 2;
    if (channelFilter === "direct") return channel.members.length <= 2 || channel.id.startsWith("dm_");
    if (channelFilter === "media") return channelHasMedia(channel.id);
    if (channelFilter === "starred") return channelHasStarred(channel.id);
    return true;
  };

  const filterOptions: { id: ConversationFilter; label: string; count: number }[] = [
    { id: "all", label: "All", count: channels.length },
    { id: "unread", label: "Unread", count: channels.filter(c => c.unreadCount && c.unreadCount > 0).length },
    { id: "groups", label: "Groups", count: channels.filter(c => c.members.length > 2).length },
    { id: "direct", label: "Direct", count: channels.filter(c => c.members.length <= 2 || c.id.startsWith("dm_")).length },
    { id: "media", label: "Media", count: channels.filter(c => channelHasMedia(c.id)).length },
    { id: "starred", label: "Starred", count: channels.filter(c => channelHasStarred(c.id)).length }
  ];
  const activeFilterLabel = filterOptions.find(option => option.id === channelFilter)?.label || "All";

  // Search filtering
  const filteredChannels = channels.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && matchesConversationFilter(c);
  });

  const filteredWorkspaces = workspaces.filter(w =>
    w.name.toLowerCase().includes(workspaceSearch.toLowerCase())
  );

  const getDirectChannelId = (memberName: string) => `dm_${memberName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
  const workspacePeople = Array.from(new Set(channels.flatMap(c => c.members)))
    .filter(member => member !== "Rudra" && member !== "Joy")
    .map(member => {
      const existingDirect = channels.find(c => c.id === getDirectChannelId(member) || (c.members.length <= 2 && c.members.includes(member)));
      const sourceChannel = existingDirect || channels.find(c => c.members.includes(member));
      return {
        id: `member:${member}`,
        name: member,
        subtitle: existingDirect ? "Direct chat" : `${activeWorkspace.name} workspace`,
        type: "person" as const,
        avatarUrl: sourceChannel?.avatarUrl
      };
    });
  const filteredWorkspacePeople = workspacePeople.filter(person =>
    person.name.toLowerCase().includes(directComposeSearch.toLowerCase())
  );
  const directRecipients = workspacePeople
    .slice(0, 10)
  const landingRecipientOptions = [
    ...channels.map(chan => ({
      id: chan.id,
      name: chan.name,
      subtitle: `${chan.members.length} members`,
      type: "group" as const,
      avatarUrl: chan.avatarUrl,
      avatarColor: chan.avatarColor
    })),
    ...directRecipients
  ];
  const openDirectChat = (memberName?: string, avatarUrl?: string) => {
    const cleanName = memberName?.trim();
    if (!cleanName) return;
    const directChannelId = getDirectChannelId(cleanName);
    setChannels(prev => {
      if (prev.some(c => c.id === directChannelId)) return prev;
      return [
        {
          id: directChannelId,
          name: cleanName,
          lastMessage: "No messages yet",
          time: getFormattedTime(),
          metric: getFormattedTime(),
          avatarColor: "bg-slate-600",
          avatarUrl,
          members: [cleanName, "Rudra"]
        },
        ...prev
      ];
    });
    setConversations(prev => ({
      ...prev,
      [directChannelId]: prev[directChannelId] || []
    }));
    handleSelectChannel(directChannelId);
  };
  const removeMemberFromActiveTeam = (memberName: string) => {
    if (!activeChannelId) return;
    setChannels(prev => prev.map(c => {
      if (c.id !== activeChannelId) return c;
      return { ...c, members: c.members.filter(m => m !== memberName) };
    }));
    setActiveMemberMenuName(null);
  };
  const handleExitActiveTeam = () => {
    if (!activeChannelId) return;
    setChannels(prev => prev.map(c => {
      if (c.id !== activeChannelId) return c;
      return { ...c, members: c.members.filter(m => m !== "Rudra" && m !== "Joy") };
    }));
    setSharedMediaModalOpen(false);
    setActiveChannelId(null);
  };
  const handleCollapseActiveTeam = () => {
    setSharedMediaModalOpen(false);
    setChatOptionsOpen(false);
    setActiveMessageMenuId(null);
  };
  const activeMessages = activeChannel ? (conversations[activeChannel.id] || []) : [];
  const selectedMessages = activeMessages.filter(m => selectedMessageIds.includes(m.id));
  const sharedMediaMessages = activeMessages.filter(m => ["image", "video", "audio"].includes(m.attachment?.type || "") || m.attachments?.some(item => ["image", "video", "audio"].includes(item.type)));
  const sharedFileMessages = activeMessages.filter(m => m.attachment?.type === "file" || m.attachments?.some(item => item.type === "file"));
  const starredMessages = activeMessages.filter(m => m.starred);
  const sharedMeetingMessages = activeMessages.filter(m => m.attachment?.type === "meeting");
  const profileMediaItems = [
    ...sharedMediaMessages.map(msg => ({
      id: msg.id,
      type: msg.attachment?.type || msg.attachments?.find(item => ["image", "video", "audio"].includes(item.type))?.type || "image",
      title: msg.attachment?.fileName || msg.attachments?.find(item => ["image", "video", "audio"].includes(item.type))?.fileName || (msg.attachments?.length ? `${msg.attachments.length} shared attachments` : "Shared media"),
      sender: msg.sender,
      time: msg.time,
      url: msg.attachment?.url || msg.attachments?.find(item => ["image", "video", "audio"].includes(item.type))?.url
    })),
    { id: "demo_media_1", type: "image", title: "Site facade reference", sender: "Olivia", time: "Yesterday", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80" },
    { id: "demo_media_2", type: "image", title: "Rebar inspection photo", sender: "Liam", time: "Mon", url: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80" },
    { id: "demo_media_3", type: "video", title: "Slab pour walkthrough.mp4", sender: "Marvin", time: "12 May", url: "" },
    { id: "demo_media_4", type: "image", title: "Gridline markup", sender: "Sophia", time: "08 May", url: "https://images.unsplash.com/photo-1503387762-592ded58c45a?w=600&auto=format&fit=crop&q=80" },
    { id: "demo_media_5", type: "audio", title: "Foreman voice note", sender: "Mukesh", time: "07 May", url: "" }
  ];
  const profileFileItems = [
    ...sharedFileMessages.map(msg => ({
      id: msg.id,
      title: msg.attachment?.fileName || msg.attachments?.find(item => item.type === "file")?.fileName || "Shared document",
      size: msg.attachment?.fileSize || msg.attachments?.find(item => item.type === "file")?.fileSize || "2.4 MB",
      sender: msg.sender,
      time: msg.time,
      tone: "blue"
    })),
    { id: "demo_file_1", title: "Structural_GA_Level_05.pdf", size: "8.6 MB", sender: "Liam", time: "Yesterday", tone: "blue" },
    { id: "demo_file_2", title: "RCC pour checklist.xlsx", size: "642 KB", sender: "Olivia", time: "Mon", tone: "emerald" },
    { id: "demo_file_3", title: "Column alignment report.docx", size: "1.8 MB", sender: "Marvin", time: "10 May", tone: "violet" },
    { id: "demo_file_4", title: "Site photos archive.zip", size: "124 MB", sender: "Mukesh", time: "07 May", tone: "amber" }
  ];
  const profileStarredItems = [
    ...starredMessages.map(msg => ({
      id: msg.id,
      title: msg.text || getMessagePreview(msg),
      sender: msg.sender,
      time: msg.time,
      live: true
    })),
    { id: "demo_star_1", title: "Confirm revised beam depth before shuttering starts.", sender: "Olivia", time: "Yesterday", live: false },
    { id: "demo_star_2", title: "MEP sleeve clearance needs sign-off from design consultant.", sender: "Liam", time: "Mon", live: false },
    { id: "demo_star_3", title: "Client wants facade mockup update in Friday review.", sender: "Mr. Kapoor", time: "08 May", live: false }
  ];
  const profileMeetingItems = [
    ...sharedMeetingMessages.map(msg => ({
      id: msg.id,
      title: msg.attachment?.meetingTitle || "Project meeting",
      date: msg.attachment?.meetingDate || "Today",
      time: msg.attachment?.meetingTime || msg.time,
      owner: msg.sender
    })),
    { id: "demo_meet_1", title: "Structural coordination review", date: "28 May 2026", time: "10:30 AM", owner: "Olivia" },
    { id: "demo_meet_2", title: "Site QA inspection sync", date: "30 May 2026", time: "04:00 PM", owner: "Liam" },
    { id: "demo_meet_3", title: "Client facade mockup review", date: "02 Jun 2026", time: "12:00 PM", owner: "Mr. Kapoor" }
  ];
  const quickReactionEmojis = ["👍", "❤️", "😂", "🔥"];
  const emojiSections = [
    { label: "Recent", emojis: ["👍", "❤️", "😂", "🔥", "👏", "🙏", "✅", "👀"] },
    { label: "Smileys", emojis: ["😀", "😄", "🥹", "😊", "😍", "🤩", "😎", "🤔", "😮", "😢", "😤", "🫡"] },
    { label: "Work", emojis: ["🏗️", "📐", "📋", "💻", "🧱", "🚧", "🦺", "📍", "🛠️", "📊", "📎", "⏱️"] },
    { label: "Symbols", emojis: ["✨", "🚀", "💯", "🎯", "⚡", "🔔", "📌", "⭐", "❗", "❌", "🟢", "🔴"] }
  ];

  const renderMessageOperationsMenu = (msg: Message, align: "left" | "right") => (
    <div className="relative">
      <button
        type="button"
        data-chat-popover-trigger="true"
        onClick={() => setActiveMessageMenuId(activeMessageMenuId === msg.id ? null : msg.id)}
        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-[#1a73e8] transition-colors cursor-pointer"
        title="Message options"
      >
        <MoreVertical className="w-3 h-3" />
      </button>
      {activeMessageMenuId === msg.id && (
        <div className={`chat-menu-surface absolute top-7 ${align === "right" ? "right-0" : "left-0"} z-[999] w-40 p-1 rounded-xl text-left`}>
          <button
            type="button"
            onClick={() => {
              setReplyingToMessage(msg);
              setActiveMessageMenuId(null);
            }}
            className="chat-menu-item w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleToggleStar(msg.id);
              setActiveMessageMenuId(null);
            }}
            className="chat-menu-item w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
          >
            <Star className={`w-3.5 h-3.5 ${msg.starred ? "fill-amber-400 text-amber-400" : ""}`} />
            <span>{msg.starred ? "Unstar" : "Star"}</span>
          </button>
          <button
            type="button"
            onClick={() => handleStartSelection(msg.id)}
            className="chat-menu-item w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>
          {(msg.attachments?.length || (msg.attachment && ["image", "video", "file", "audio"].includes(msg.attachment.type))) && (
            <button
              type="button"
              onClick={() => {
                setAttachmentPreviewIndex(0);
                setAttachmentPreviewMessage(msg);
                setActiveMessageMenuId(null);
              }}
              className="chat-menu-item w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Open</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleDeleteForMe(msg.id)}
            className="chat-menu-item w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-rose-600 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete for me</span>
          </button>
          {msg.isSelf && !msg.deleted && (
            <button
              type="button"
              onClick={() => {
                setEditingMessageId(msg.id);
                setEditingText(msg.text || "");
                setActiveMessageMenuId(null);
              }}
              className="chat-menu-item w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-slate-700 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>
          )}
          {msg.isSelf && (
            <button
              type="button"
              onClick={() => handleUnsend(msg.id)}
              className="chat-menu-item w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[11px] font-semibold text-rose-600 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Unsend</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  const getReadReceiptMembers = (msg: Message) => {
    if (!activeChannel || msg.status !== "read") return [];
    return activeChannel.members.filter((member) => member !== "Rudra" && member !== "Joy" && member !== msg.sender);
  };

  const renderReadInfoButton = (msg: Message) => (
    <button
      type="button"
      onClick={() => setReadReceiptMessage(msg)}
      className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 hover:bg-[#e8f0fe] hover:text-[#1a73e8] transition-colors cursor-pointer border-none bg-transparent"
      title="Message info"
    >
      <Info className="h-3 w-3" />
    </button>
  );

  const renderAttachmentGrid = (msg: Message, isSelf: boolean) => {
    const attachments = msg.attachments || [];
    const visibleAttachments = attachments.slice(0, 4);
    const hiddenCount = Math.max(0, attachments.length - visibleAttachments.length);
    const gridClass = attachments.length === 1
      ? "grid-cols-1"
      : attachments.length === 2
        ? "grid-cols-2"
        : "grid-cols-2";

    const openAttachment = (attachment: MessageAttachment, index: number) => {
      setAttachmentPreviewIndex(index);
      setAttachmentPreviewMessage({
        ...msg,
        text: attachment.fileName || msg.text,
        attachment,
        attachments
      });
    };

    return (
      <div
        className="chat-glass-bubble rounded-2xl p-2 w-full max-w-[340px] text-left flex flex-col"
        style={!isSelf ? getSenderBubbleStyle(msg.sender) : undefined}
      >
        {msg.replyTo && (
          <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
            <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
            <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
          </div>
        )}

        <div className={`grid ${gridClass} gap-1.5 overflow-hidden rounded-xl`}>
          {visibleAttachments.map((attachment, index) => {
            const isLastWithMore = index === visibleAttachments.length - 1 && hiddenCount > 0;
            const isWideFirst = attachments.length === 3 && index === 0;
            return (
              <button
                key={`${attachment.fileName || attachment.type}-${index}`}
                type="button"
                onClick={() => openAttachment(attachment, index)}
                className={`group/media relative overflow-hidden bg-slate-100 border border-white/70 rounded-xl cursor-pointer text-left min-h-[96px] ${
                  isWideFirst ? "col-span-2 h-36" : attachments.length === 1 ? "h-48" : "h-28"
                }`}
                title={attachment.fileName || attachment.type}
              >
                {attachment.type === "image" && (
                  <img
                    src={attachment.url?.startsWith("blob:") || attachment.url?.startsWith("http") ? attachment.url : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80"}
                    alt={attachment.fileName || "Shared media"}
                    className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-300"
                  />
                )}
                {attachment.type === "video" && (
                  <div className="relative w-full h-full bg-slate-950">
                    {attachment.url ? (
                      <video src={attachment.url} muted className="w-full h-full object-cover opacity-85" />
                    ) : (
                      <div className="absolute inset-0 bg-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-black/18 flex items-center justify-center">
                      <span className="w-9 h-9 rounded-full bg-white/85 text-slate-900 flex items-center justify-center shadow-sm">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </span>
                    </div>
                  </div>
                )}
                {attachment.type === "file" && (
                  <div className="h-full p-3 bg-white flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-slate-800 truncate">{attachment.fileName || "Document"}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{attachment.fileSize || "File"}</div>
                    </div>
                  </div>
                )}
                {attachment.type === "audio" && (
                  <div className="h-full p-3 bg-white flex flex-col justify-between">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center">
                      <Music className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-slate-800 truncate">{attachment.fileName || "Audio"}</div>
                      <div className="mt-2 h-1 rounded-full bg-slate-100 overflow-hidden">
                        <div className="w-1/2 h-full bg-indigo-400" />
                      </div>
                    </div>
                  </div>
                )}
                {isLastWithMore && (
                  <div className="absolute inset-0 bg-slate-950/62 text-white flex items-center justify-center text-xl font-bold backdrop-blur-[1px]">
                    +{hiddenCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-2.5 px-1 pb-0.5">
          <span className="text-xs text-[#0f2942] font-semibold truncate max-w-[220px]">
            {msg.text || `${attachments.length} attachments`}
          </span>
          <span className="text-[10px] text-[#64748b] font-normal shrink-0 ml-3">{msg.time}</span>
        </div>
        {isSelf && msg.status && (
          <div className="flex justify-end items-center gap-1 px-1 text-[9px] font-bold tracking-tight text-[#1a73e8]">
            <span className={msg.status === "read" ? "text-[#1a73e8]" : "text-slate-350"}>● ●</span>
            {renderReadInfoButton(msg)}
          </div>
        )}
      </div>
    );
  };

  // Trigger New Team Creation
  const handleCreateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;

    const newChanId = `ch_${Date.now()}`;
    const newChan: Channel = {
      id: newChanId,
      name: newTeamName,
      lastMessage: "No messages yet",
      time: getFormattedTime(),
      metric: "4.00",
      avatarColor: "bg-zinc-600",
      members: ["Liam", "Olivia", "Rudra"]
    };

    setChannels(prev => [newChan, ...prev]);
    setConversations(prev => ({
      ...prev,
      [newChanId]: [
        { id: `sys_${Date.now()}`, sender: "System", text: `Channel "${newTeamName}" created by Rudra.`, time: getFormattedTime(), isSelf: false }
      ]
    }));

    setActiveChannelId(newChanId);
    setNewTeamName("");
    setNewTeamDescription("");
    setNewTeamModalOpen(false);
  };


  // Trigger File Sharing
  const handleShareFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFileName.trim()) return;
    if (!activeChannelId) {
      setMultiSelectModalOpen(true);
      return;
    }

    handleSendMessage(`Shared file: ${selectedFileName}`, {
      type: "file",
      fileName: selectedFileName,
      fileSize: selectedFileSize || "2.4 MB"
    });

    setSelectedFileName("");
    setSelectedFileSize("");
    setShareFilesModalOpen(false);
  };

  const previewAttachments = attachmentPreviewMessage
    ? (attachmentPreviewMessage.attachments?.length
      ? attachmentPreviewMessage.attachments
      : attachmentPreviewMessage.attachment
        ? [attachmentPreviewMessage.attachment]
        : [])
    : [];
  const activePreviewIndex = Math.min(attachmentPreviewIndex, Math.max(0, previewAttachments.length - 1));
  const activePreviewAttachment = previewAttachments[activePreviewIndex];

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 bg-zinc-50 overflow-hidden font-sans text-slate-800 select-none">
      <style>{`
        @keyframes chatLiquidFlow1 {
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
        @keyframes chatLiquidFlow2 {
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
        .animate-chat-liquid1 {
          animation: chatLiquidFlow1 26s ease-in-out infinite alternate;
        }
        .animate-chat-liquid2 {
          animation: chatLiquidFlow2 32s ease-in-out infinite alternate;
        }
        .chat-glass-bubble {
          background: linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.58));
          border: 1px solid rgba(255,255,255,0.74);
          box-shadow: 0 8px 24px rgba(15,23,42,0.055), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(18px) saturate(150%);
          -webkit-backdrop-filter: blur(18px) saturate(150%);
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease;
        }
        .chat-glass-bubble:hover {
          box-shadow: 0 10px 28px rgba(15,23,42,0.075), inset 0 1px 0 rgba(255,255,255,0.9);
          transform: translateY(-1px);
        }
        .chat-glass-action {
          background: rgba(255,255,255,0.64);
          border: 1px solid rgba(255,255,255,0.76);
          box-shadow: 0 6px 18px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.86);
          backdrop-filter: blur(16px) saturate(150%);
          -webkit-backdrop-filter: blur(16px) saturate(150%);
        }
        .chat-icon-button {
          transition: transform 160ms ease, box-shadow 160ms ease, background-color 160ms ease, color 160ms ease;
        }
        .chat-icon-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(15,23,42,0.06);
        }
        .chat-icon-button:active {
          transform: scale(0.95);
        }
        .chat-list-row {
          transition: transform 170ms ease, background-color 170ms ease, box-shadow 170ms ease, border-color 170ms ease;
        }
        .chat-list-row:hover {
          transform: translateX(2px);
          box-shadow: 0 8px 20px rgba(15,23,42,0.045);
        }
        .chat-menu-surface {
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(226,232,240,0.82);
          box-shadow: 0 18px 48px rgba(15,23,42,0.14);
          backdrop-filter: blur(18px) saturate(150%);
          -webkit-backdrop-filter: blur(18px) saturate(150%);
        }
        .chat-menu-item {
          transition: transform 150ms ease, background-color 150ms ease, color 150ms ease;
        }
        .chat-menu-item:hover {
          transform: translateX(2px);
        }
        .chat-action-card {
          transition: transform 190ms ease, box-shadow 190ms ease, border-color 190ms ease, background-color 190ms ease;
        }
        .chat-action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 32px rgba(15,23,42,0.08);
        }
        .chat-action-card:active {
          transform: scale(0.98);
        }
      `}</style>
      <input
        id="landing-photo-picker"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleLandingPhotoSelection}
      />
      <input
        id="group-dp-picker"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleGroupDpUpload}
      />

      {chatFeedbackToast && (
        <div className="fixed top-5 right-5 z-[1200] w-72 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
          <div className="chat-glass-action rounded-2xl px-4 py-3 text-left shadow-lg border border-white/70">
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${chatFeedbackToast.tone === "success" ? "bg-emerald-500" : "bg-[#1a73e8]"}`} />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{chatFeedbackToast.title}</div>
                {chatFeedbackToast.description && (
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5 line-clamp-2">{chatFeedbackToast.description}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 1. LEFT PANEL: CHANNELS & WORKSPACES */}
      <div className="w-[320px] bg-white border-r border-zinc-200/80 flex flex-col h-full shrink-0 relative z-20">
        
        {/* Workspace Dropdown Header */}
        <div ref={workspaceMenuRef} className="p-4 border-b border-zinc-100 flex flex-col relative">
          <div 
            onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-zinc-50 cursor-pointer transition-all duration-150 select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg ${activeWorkspace.avatarBg} text-white font-semibold flex items-center justify-center text-xs`}>
                {activeWorkspace.avatarInitials}
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-slate-800 leading-tight">{activeWorkspace.name}</div>
                <div className="text-[10px] text-zinc-400 font-normal">{activeWorkspace.membersCount} Members • {activeWorkspace.teamsCount} Teams</div>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              {activeWorkspace.badgeCount > 0 && (
                <span className="bg-[#1a73e8] text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0">
                  {activeWorkspace.badgeCount}
                </span>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </div>
          </div>

          {/* Workspace Expanded Overlay List */}
          {workspaceDropdownOpen && (
            <div className="absolute top-[90%] left-4 right-4 bg-white border border-zinc-200/80 rounded-xl shadow-lg p-2.5 z-50 mt-1 max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-1.5 duration-100">
              <div className="relative mb-2">
                <Search className="w-3 h-3 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Filter workspaces..."
                  value={workspaceSearch}
                  onChange={(e) => setWorkspaceSearch(e.target.value)}
                  className="w-full pl-7 pr-2.5 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-xs font-medium text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:border-zinc-300 transition-all"
                />
              </div>

              <div className="flex flex-col gap-0.5">
                {filteredWorkspaces.map(ws => (
                  <div
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setWorkspaceDropdownOpen(false);
                    }}
                    className={`chat-list-row flex items-center justify-between p-2 rounded-lg cursor-pointer ${activeWorkspace.id === ws.id ? "bg-zinc-50" : "hover:bg-zinc-50/55"}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-md ${ws.avatarBg} text-white font-medium flex items-center justify-center text-[10px]`}>
                        {ws.avatarInitials}
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-semibold text-zinc-800">{ws.name}</div>
                        <div className="text-[9px] text-zinc-400 font-normal">{ws.membersCount} Members • {ws.teamsCount} Teams</div>
                      </div>
                    </div>
                    {ws.badgeCount > 0 && (
                      <span className="bg-[#e8f0fe] text-[#1a73e8] text-[9px] font-medium w-4.5 h-4.5 flex items-center justify-center rounded-full">
                        {ws.badgeCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search bar inside Channels list */}
        <div className="p-3 border-b border-zinc-100 flex gap-2">
	          <div className="relative flex-1">
	            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
	            <input 
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
	              className="w-full pl-8 pr-2.5 py-1.5 bg-zinc-50 border border-zinc-100 rounded-lg text-xs text-zinc-800 placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:border-zinc-300 transition-all font-normal"
	            />
	          </div>
	          <div className="relative">
	            <button
	              type="button"
	              data-chat-popover-trigger="true"
	              onClick={() => {
	                setDirectComposeOpen(prev => !prev);
	                setChannelFilterOpen(false);
	              }}
	              className={`chat-icon-button p-1.5 border rounded-lg cursor-pointer relative ${
	                directComposeOpen
	                  ? "border-[#1a73e8]/30 bg-[#e8f0fe] text-[#1a73e8]"
	                  : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:bg-white hover:text-[#1a73e8]"
	              }`}
	              title="Start one-to-one chat"
	            >
	              <MessageSquarePlus className="w-3.5 h-3.5" />
	            </button>
	            {directComposeOpen && (
	              <div className="chat-menu-surface absolute right-0 top-9 z-50 w-64 rounded-2xl p-2 animate-in fade-in slide-in-from-top-1 duration-150">
	                <div className="px-1.5 pb-2">
	                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start personal chat</div>
	                  <div className="relative mt-2">
	                    <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
	                    <input
	                      type="text"
	                      value={directComposeSearch}
	                      onChange={(e) => setDirectComposeSearch(e.target.value)}
	                      placeholder="Search people"
	                      className="w-full rounded-xl border border-slate-100 bg-slate-50 py-1.5 pl-7 pr-2 text-xs font-medium text-slate-700 outline-hidden focus:border-[#1a73e8]/30 focus:bg-white"
	                    />
	                  </div>
	                </div>
	                <div className="max-h-64 overflow-y-auto space-y-1">
	                  {filteredWorkspacePeople.length > 0 ? (
	                    filteredWorkspacePeople.map((person) => (
	                      <button
	                        key={person.id}
	                        type="button"
	                        onClick={() => {
	                          openDirectChat(person.name, person.avatarUrl);
	                          setDirectComposeOpen(false);
	                          setDirectComposeSearch("");
	                        }}
	                        className="chat-menu-item flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left hover:bg-slate-50 cursor-pointer border-none bg-transparent"
	                      >
	                        {person.avatarUrl ? (
	                          <img src={person.avatarUrl} alt={person.name} className="h-8 w-8 rounded-full object-cover" />
	                        ) : (
	                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
	                            {person.name.charAt(0)}
	                          </span>
	                        )}
	                        <span className="min-w-0 flex-1">
	                          <span className="block truncate text-xs font-semibold text-slate-800">{person.name}</span>
	                          <span className="block truncate text-[9px] font-medium text-slate-400">{person.subtitle}</span>
	                        </span>
	                      </button>
	                    ))
	                  ) : (
	                    <div className="px-3 py-5 text-center text-[11px] font-semibold text-slate-400">
	                      No people found
	                    </div>
	                  )}
	                </div>
	              </div>
	            )}
	          </div>
	          <div className="relative">
	            <button
              type="button"
              data-chat-popover-trigger="true"
              onClick={() => setChannelFilterOpen(prev => !prev)}
              className={`chat-icon-button p-1.5 border rounded-lg cursor-pointer relative ${
                channelFilter !== "all"
                  ? "border-[#1a73e8]/30 bg-[#e8f0fe] text-[#1a73e8]"
                  : "border-zinc-100 bg-zinc-50 text-zinc-400 hover:bg-white hover:text-zinc-650"
              }`}
              title={`Filter: ${activeFilterLabel}`}
            >
              <Filter className="w-3.5 h-3.5" />
              {channelFilter !== "all" && (
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#1a73e8]" />
              )}
            </button>
            {channelFilterOpen && (
              <div className="chat-menu-surface absolute right-0 top-9 z-50 w-44 rounded-2xl p-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
                {filterOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setChannelFilter(option.id);
                      setChannelFilterOpen(false);
                    }}
                    className={`chat-menu-item flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs cursor-pointer border-none ${
                      channelFilter === option.id
                        ? "bg-[#e8f0fe] text-[#1a73e8]"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span className="font-semibold">{option.label}</span>
                    <span className={`text-[10px] font-bold ${channelFilter === option.id ? "text-[#1a73e8]" : "text-slate-400"}`}>{option.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {channelFilter !== "all" && (
          <div className="px-3 pb-2 border-b border-zinc-100">
            <div className="flex items-center justify-between rounded-lg bg-[#e8f0fe]/70 px-2.5 py-1.5">
              <span className="text-[10px] font-semibold text-[#1a73e8]">Showing {activeFilterLabel}</span>
              <button
                type="button"
                onClick={() => setChannelFilter("all")}
                className="text-[10px] font-semibold text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Channels/Teams list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5 select-none">
          {(() => {
            const channelsOnly = filteredChannels.filter(c => c.id.startsWith("ch_"));
            const dmsOnly = filteredChannels.filter(c => !c.id.startsWith("ch_"));

            if (filteredChannels.length === 0) {
              return (
                <div className="text-center py-8 text-xs text-zinc-400 font-normal">
                  No matches found
                </div>
              );
            }

            const showChannelsGroup = channelsOnly.length > 0 || !searchQuery;
            const showDMsGroup = dmsOnly.length > 0 || !searchQuery;

            return (
              <div className="space-y-4 text-left">
                {/* 1. CHANNELS GROUP */}
                {showChannelsGroup && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => setChannelsExpanded(prev => !prev)}
                      className="flex items-center gap-1.5 px-2 py-1.5 w-full text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold tracking-wider uppercase text-left border-none bg-transparent cursor-pointer select-none"
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 shrink-0 ${channelsExpanded ? "" : "-rotate-90"}`} />
                      <span>Channels ({channelsOnly.length})</span>
                    </button>

                    {channelsExpanded && (
                      <div className="space-y-0.5 pl-0.5">
                        {channelsOnly.length > 0 ? (
                          channelsOnly.map(chan => {
                            const active = activeChannelId === chan.id;
                            return (
                              <div
                                key={chan.id}
                                onClick={() => handleSelectChannel(chan.id)}
                                className={`chat-list-row group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                                  active 
                                    ? "bg-[linear-gradient(135deg,rgba(232,240,254,0.95),rgba(255,255,255,0.94))] border-[#1a73e8]/25 text-slate-800 shadow-[0_4px_12px_rgba(26,115,232,0.05)]" 
                                    : "hover:bg-zinc-50/70 border-transparent text-zinc-600 hover:text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-all border ${
                                    active 
                                      ? "bg-blue-100/80 text-blue-600 font-black border-blue-200/50" 
                                      : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 border-slate-100/50"
                                  }`}>
                                    <span className="text-sm font-extrabold font-mono">#</span>
                                  </div>
                                  <div className="text-left min-w-0">
                                    <div className={`text-xs ${active ? "font-semibold text-slate-800" : "font-normal text-zinc-800"} truncate`}>
                                      {chan.name}
                                    </div>
                                    <div className={`text-[10px] font-normal truncate mt-0.5 max-w-[150px] ${active ? "text-slate-500" : "text-zinc-400"}`}>
                                      {chan.lastMessage}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 pl-1">
                                  <span className={`text-[9px] font-normal ${active ? "text-[#1a73e8]" : "text-zinc-400"}`}>
                                    {chan.metric}
                                  </span>
                                  {chan.unreadCount && chan.unreadCount > 0 ? (
                                    <span className="bg-[#1a73e8] text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                                      {chan.unreadCount}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="pl-3 py-1.5 text-[10px] text-zinc-400 font-normal italic text-left">
                            No channels available
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. DIRECT MESSAGES GROUP */}
                {showDMsGroup && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => setDmsExpanded(prev => !prev)}
                      className="flex items-center gap-1.5 px-2 py-1.5 w-full text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold tracking-wider uppercase text-left border-none bg-transparent cursor-pointer select-none"
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 shrink-0 ${dmsExpanded ? "" : "-rotate-90"}`} />
                      <span>Direct Messages ({dmsOnly.length})</span>
                    </button>

                    {dmsExpanded && (
                      <div className="space-y-0.5 pl-0.5">
                        {dmsOnly.length > 0 ? (
                          dmsOnly.map(chan => {
                            const active = activeChannelId === chan.id;
                            return (
                              <div
                                key={chan.id}
                                onClick={() => handleSelectChannel(chan.id)}
                                className={`chat-list-row group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer border transition-all ${
                                  active 
                                    ? "bg-[linear-gradient(135deg,rgba(232,240,254,0.95),rgba(255,255,255,0.94))] border-[#1a73e8]/25 text-slate-800 shadow-[0_4px_12px_rgba(26,115,232,0.05)]" 
                                    : "hover:bg-zinc-50/70 border-transparent text-zinc-600 hover:text-slate-800"
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {chan.avatarUrl ? (
                                    <img 
                                      src={chan.avatarUrl} 
                                      alt={chan.name} 
                                      className="w-7 h-7 rounded-full object-cover shrink-0 filter grayscale-[10%]" 
                                    />
                                  ) : (
                                    <div className={`w-7 h-7 rounded-full ${chan.avatarColor} text-white flex items-center justify-center font-semibold text-xs shrink-0 uppercase`}>
                                      {chan.name.charAt(0)}
                                    </div>
                                  )}
                                  <div className="text-left min-w-0">
                                    <div className={`text-xs ${active ? "font-semibold text-slate-800" : "font-normal text-zinc-800"} truncate`}>
                                      {chan.name}
                                    </div>
                                    <div className={`text-[10px] font-normal truncate mt-0.5 max-w-[150px] ${active ? "text-slate-500" : "text-zinc-400"}`}>
                                      {chan.lastMessage}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1 shrink-0 pl-1">
                                  <span className={`text-[9px] font-normal ${active ? "text-[#1a73e8]" : "text-zinc-400"}`}>
                                    {chan.metric}
                                  </span>
                                  {chan.unreadCount && chan.unreadCount > 0 ? (
                                    <span className="bg-[#1a73e8] text-white text-[9px] font-medium px-1.5 py-0.5 rounded-full">
                                      {chan.unreadCount}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="pl-3 py-1.5 text-[10px] text-zinc-400 font-normal italic text-left">
                            No direct messages
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

      </div>

      {/* 2. MAIN WORKSPACE AREA */}
      <div className="min-w-0 flex-1 flex flex-col h-full relative z-10" style={activeChannelId ? meshGradientStyle : { backgroundColor: "#ffffff" }}>
        
        {activeChannelId && activeChannel ? (
          <>
            {/* Top Chat Header */}
            <div className="h-14 border-b border-slate-100 bg-white px-6 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSharedMediaTab("members");
                    setSharedMediaModalOpen(true);
                  }}
                  className="relative shrink-0 select-none cursor-pointer bg-transparent border-none p-0"
                  title="Open profile"
                >
                  {activeChannel.id.startsWith("ch_") ? (
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-500 flex items-center justify-center font-extrabold text-lg shadow-sm">
                      <span className="font-mono">#</span>
                    </div>
                  ) : (
                    <img 
                      src={activeChannel.avatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60"} 
                      alt={activeChannel.name} 
                      className="w-10 h-10 rounded-full object-cover filter grayscale-[10%]" 
                    />
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#34a853] rounded-full border-2 border-white" />
                </button>
                
                <div 
                  onClick={() => {
                    setSharedMediaTab("members");
                    setSharedMediaModalOpen(true);
                  }}
                  className="text-left cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="text-sm font-semibold text-slate-800 leading-tight">{activeChannel.name}</div>
                  <div className="text-[10px] text-slate-400 font-normal truncate max-w-[280px] sm:max-w-md mt-0.5">
                    {(activeChannel.members.length <= 2 || activeChannel.id.startsWith("dm_")) ? "Direct chat" : `${activeChannel.members.length} member team chat`} · {activeChannel.members.join(", ")}
                  </div>
                </div>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-2 text-slate-400 select-none">
                {/* Upcoming Meeting Capsule Chip */}
                <div className="relative">
                  <button
                    onClick={() => setShowUpcomingMeetTooltip(prev => !prev)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold cursor-pointer transition-all shadow-xs shrink-0"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span>Meet: Today 3:30 PM</span>
                  </button>
                  
                  {showUpcomingMeetTooltip && (
                    <div className="absolute right-0 top-10 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-55 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Upcoming Meeting
                        </span>
                        <button 
                          onClick={() => setShowUpcomingMeetTooltip(false)}
                          className="text-slate-400 hover:text-slate-655 text-xs cursor-pointer border-none bg-transparent"
                        >
                          ✕
                        </button>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-tight">
                        MEP Clash Coordination Meeting
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        Time: Today, 3:30 PM - 4:30 PM
                      </p>

                      <div className="mt-3">
                        <div className="border-t border-slate-100 pt-2.5">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                            Meeting Agenda (WBS Scope)
                          </span>
                          
                          <div className="space-y-2">
                            {/* Phase 1 */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-left">
                              <span className="text-[8.5px] font-bold text-[#1a73e8] uppercase block tracking-wide">
                                Phase 1: Model Pre-check
                              </span>
                              <div className="mt-1.5 space-y-1 pl-1 text-[10px] font-medium text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-[#1a73e8]" />
                                  <span>Verify structural column alignments (Sheet S-02)</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-[#1a73e8]" />
                                  <span>Check mechanical duct elevation clearances</span>
                                </div>
                              </div>
                            </div>

                            {/* Phase 2 */}
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 text-left">
                              <span className="text-[8.5px] font-bold text-purple-650 uppercase block tracking-wide">
                                Phase 2: Clash Resolution
                              </span>
                              <div className="mt-1.5 space-y-1 pl-1 text-[10px] font-medium text-slate-600">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-purple-500" />
                                  <span>Resolve 24 critical HVAC/structural column clashes</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-1 h-1 rounded-full bg-purple-500" />
                                  <span>Confirm fire protection layout tolerances</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => {
                            setShowUpcomingMeetTooltip(false);
                            navigate("/meet?startCall=true&title=MEP%20Clash%20Coordination%20Meeting&agendaTab=true");
                          }}
                          className="w-full py-1.75 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-semibold text-center cursor-pointer flex items-center justify-center gap-1 border-none"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Start Meeting Now</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => {
                    navigate("/meet");
                  }}
                  className="chat-icon-button w-9 h-9 rounded-full bg-[#e8f0fe] hover:bg-[#d2e3fc] flex items-center justify-center text-[#1a73e8] cursor-pointer" 
                  title="Start video call"
                >
                  <Video className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setMembersModalOpen(true)}
                  className="chat-icon-button w-9 h-9 rounded-full bg-[#e8f0fe] hover:bg-[#d2e3fc] flex items-center justify-center text-[#1a73e8] cursor-pointer" 
                  title="Add members"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
                <div className="relative">
                  <button 
                    data-chat-popover-trigger="true"
                    onClick={() => setChatOptionsOpen(prev => !prev)}
                    className={`chat-icon-button w-9 h-9 flex items-center justify-center cursor-pointer rounded-full ${chatOptionsOpen ? "bg-slate-100 text-slate-800" : "text-[#64748b] hover:text-[#475569] hover:bg-slate-50"}`}
                    title="Chat options"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {chatOptionsOpen && (
                    <div className="chat-menu-surface absolute right-0 top-11 w-48 rounded-2xl p-1.5 flex flex-col gap-0.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                      <button
                        type="button"
                        onClick={() => {
                          setSharedMediaTab("media");
                          setSharedMediaModalOpen(true);
                          setChatOptionsOpen(false);
                        }}
                        className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                      >
                        <ImageIcon className="w-4 h-4 text-[#1a73e8]" />
                        <span className="font-semibold">Media & profile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMembersModalOpen(true);
                          setChatOptionsOpen(false);
                        }}
                        className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                      >
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold">Members</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectionMode(true);
                          setSelectedMessageIds([]);
                          setChatOptionsOpen(false);
                        }}
                        className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                      >
                        <Check className="w-4 h-4 text-violet-500" />
                        <span className="font-semibold">Select messages</span>
                      </button>
                      {selectionMode && (
                        <button
                          type="button"
                          onClick={handleCancelSelection}
                          className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                        >
                          <X className="w-4 h-4" />
                          <span className="font-semibold">Cancel selection</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectionMode && (
              <div className="h-12 border-b border-slate-100 bg-white/95 px-6 flex items-center justify-between z-10 shrink-0 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancelSelection}
                    className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer bg-transparent border-none"
                    title="Cancel selection"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800">{selectedMessageIds.length} selected</div>
                    <div className="text-[9px] text-slate-400 font-normal">Choose messages to forward or delete</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllMessages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-600 transition-colors cursor-pointer"
                  >
                    Select all
                  </button>
                  <button
                    type="button"
                    onClick={() => setForwardModalOpen(true)}
                    disabled={selectedMessageIds.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-[#e8f0fe] hover:bg-[#d2e3fc] disabled:opacity-40 disabled:pointer-events-none text-[10px] font-semibold text-[#1a73e8] transition-colors cursor-pointer border-none flex items-center gap-1.5"
                  >
                    <Forward className="w-3.5 h-3.5" />
                    <span>Forward</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={selectedMessageIds.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 disabled:opacity-40 disabled:pointer-events-none text-[10px] font-semibold text-rose-600 transition-colors cursor-pointer border-none flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent">
              
              {conversations[activeChannelId]?.map((msg) => {
                // If it is a system message
                if (msg.sender === "System") {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <div className="bg-white border border-slate-100 text-slate-455 text-[10px] font-normal px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <Info className="w-3 h-3 text-slate-350" />
                        <span>{msg.text}</span>
                      </div>
                    </div>
                  );
                }

                if (msg.deleted) {
                  return (
                    <div key={msg.id} className={`flex ${msg.isSelf ? "justify-end" : "justify-start"} my-2`}>
                      <div className="max-w-[70%] rounded-2xl border border-dashed border-slate-200 bg-white/62 px-3.5 py-2 text-left text-[11px] italic text-slate-500 shadow-xs">
                        <span>{msg.deletedLabel || "This message was deleted"}</span>
                        <span className="ml-2 text-[9px] not-italic text-slate-400">{msg.time}</span>
                      </div>
                    </div>
                  );
                }

                const isMessageSelected = selectedMessageIds.includes(msg.id);
                const senderTheme = getSenderTheme(msg.sender);
                const senderBubbleStyle = getSenderBubbleStyle(msg.sender);

                if (!msg.isSelf) {
                  return (
                    <div key={msg.id} className={`group relative flex flex-col items-start mr-auto max-w-[70%] text-left pb-1 animate-in fade-in slide-in-from-bottom-2 duration-200 ${activeMessageMenuId === msg.id ? "z-[80]" : "z-0"}`}>
                      <span className="text-[9px] font-bold mb-0.5 ml-1" style={{ color: senderTheme.color }}>{msg.sender}</span>
                      {msg.forwardedFrom && (
                        <span className="text-[9.5px] text-slate-450 font-semibold mb-1 ml-1 flex items-center gap-1 select-none italic">
                          <Forward className="w-2.5 h-2.5 text-slate-400" />
                          Forwarded
                        </span>
                      )}
                      <div className="flex items-center gap-2">
                        {selectionMode && (
                          <button
                            type="button"
                            onClick={() => handleToggleMessageSelection(msg.id)}
                            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                              isMessageSelected
                                ? "bg-[#1a73e8] border-[#1a73e8] text-white"
                                : "bg-white border-slate-300 text-transparent hover:border-[#1a73e8]"
                            }`}
                            title={isMessageSelected ? "Unselect message" : "Select message"}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </button>
                        )}
                        {msg.attachments?.length ? (
                          renderAttachmentGrid(msg, false)
                        ) : msg.attachment?.type === "image" ? (
                          <div className="chat-glass-bubble rounded-2xl p-2 w-full max-w-[280px] text-left flex flex-col" style={senderBubbleStyle}>
                            {msg.replyTo && (
                              <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                                <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                                <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                              </div>
                            )}
                            <img 
                              src={msg.attachment.url?.startsWith("blob:") || msg.attachment.url?.startsWith("http") ? msg.attachment.url : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80"} 
                              alt="Attachment" 
                              onClick={() => setAttachmentPreviewMessage(msg)}
                              className="w-full h-40 object-cover rounded-xl cursor-zoom-in hover:brightness-95 transition-all" 
                            />
                            <div className="flex items-center justify-between mt-2.5 px-1 pb-0.5">
                              <span className="text-xs text-[#0f2942] font-normal">{msg.text || "See this, how it is"}</span>
                              <span className="text-[10px] text-[#64748b] font-normal shrink-0 ml-3">{msg.time}</span>
                            </div>
                          </div>
                        ) : msg.attachment?.type === "file" ? (
                          <div
                            onClick={() => setAttachmentPreviewMessage(msg)}
                            className="chat-glass-bubble rounded-2xl p-3 w-full max-w-[280px] text-left flex flex-col gap-1.5 cursor-pointer hover:-translate-y-0.5 transition-all"
                            style={senderBubbleStyle}
                          >
                            {msg.replyTo && (
                              <div className="mb-1 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                                <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                                <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                                <FileText className="w-4.5 h-4.5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-[#0f2942] truncate leading-tight">{msg.attachment.fileName}</div>
                                <div className="text-[9px] text-[#64748b] mt-0.5 font-normal">{msg.attachment.fileSize}</div>
                              </div>
                            </div>
                          </div>
                        ) : msg.attachment?.type === "meeting" ? (
                          <div className="chat-glass-bubble rounded-2xl p-3 w-full max-w-[280px] text-left" style={senderBubbleStyle}>
                            {msg.replyTo && (
                              <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                                <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                                <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-[#1a73e8] font-semibold text-[9px] uppercase tracking-wide">
                              <Calendar className="w-3 h-3" />
                              <span>Meeting Schedule</span>
                            </div>
                            <div className="text-xs font-semibold text-[#0f2942] mt-1 leading-tight">{msg.attachment.meetingTitle}</div>
                            
                            <div className="mt-2.5 flex flex-col gap-0.5 border-t border-slate-100 pt-2 text-[9px] font-normal text-[#64748b]">
                              <div className="flex justify-between">
                                <span>Date:</span>
                                <span className="font-semibold text-[#334155]">{msg.attachment.meetingDate}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Time:</span>
                                <span className="font-semibold text-[#334155]">{msg.attachment.meetingTime}</span>
                              </div>
                            </div>
                            
                            <button 
                              onClick={() => {
                                setActiveMeetTitle(msg.attachment?.meetingTitle || "Weekly Design Review");
                                setActiveMeetOpen(true);
                              }}
                              className="mt-2.5 w-full py-1 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-lg text-[9px] font-semibold transition-all cursor-pointer text-center"
                            >
                              Join Call
                            </button>
                          </div>
                        ) : msg.attachment?.type === "audio" ? (
                          <div className="chat-glass-bubble rounded-2xl p-3 w-full max-w-[280px] text-left flex flex-col gap-2" style={senderBubbleStyle}>
                            {msg.replyTo && (
                              <div className="mb-1 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                                <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                                <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2.5">
                              <button 
                                onClick={() => setActivePlayingAudio(activePlayingAudio === msg.id ? null : msg.id)}
                                className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 hover:bg-[#d2e3fc] transition-colors cursor-pointer"
                              >
                                {activePlayingAudio === msg.id ? (
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                ) : (
                                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                                )}
                              </button>
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold text-[#0f2942] truncate leading-tight">{msg.attachment.fileName || "audio_recording.mp3"}</div>
                                <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                                  <div className={`bg-[#1a73e8] h-full transition-all duration-300 ${activePlayingAudio === msg.id ? "w-[60%] animate-pulse" : "w-[0%]"}`} />
                                </div>
                                <div className="flex justify-between text-[8px] text-[#64748b] mt-1">
                                  <span>{activePlayingAudio === msg.id ? "0:43" : "0:00"}</span>
                                  <span>{msg.attachment.duration || "2:34"}</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setAttachmentPreviewMessage(msg)}
                                className="w-7 h-7 rounded-full bg-slate-50 text-slate-500 hover:bg-[#e8f0fe] hover:text-[#1a73e8] flex items-center justify-center transition-colors cursor-pointer"
                                title="Open audio player"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {msg.attachment.url && msg.attachment.url !== "#" && (
                              <audio src={msg.attachment.url} controls className="w-full h-8" />
                            )}
                          </div>
                        ) : msg.attachment?.type === "video" ? (
                          <div className="chat-glass-bubble rounded-2xl p-2 w-full max-w-[280px] text-left flex flex-col" style={senderBubbleStyle}>
                            {msg.replyTo && (
                              <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                                <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                                <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                              </div>
                            )}
                            <div className="relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
                              {msg.attachment.url ? (
                                <video 
                                  src={msg.attachment.url} 
                                  className="w-full h-full object-cover" 
                                  controls
                                />
                              ) : (
                                <>
                                  <div className="absolute inset-0 bg-[#0f2942]/90 flex flex-col items-center justify-center text-slate-200">
                                    <Film className="w-10 h-10 mb-2 opacity-60" />
                                    <span className="text-[10px] font-semibold">Video Attachment</span>
                                  </div>
                                  <button className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white hover:scale-110 transition-all cursor-pointer z-10">
                                    <Play className="w-5 h-5 fill-current ml-0.5" />
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => setAttachmentPreviewMessage(msg)}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-sm hover:bg-white hover:scale-105 transition-all cursor-pointer"
                                title="Expand video"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex items-center justify-between mt-2.5 px-1 pb-0.5">
                              <span className="text-xs text-[#0f2942] font-semibold truncate max-w-[170px]">{msg.attachment.fileName || "site_footage.mp4"}</span>
                              <span className="text-[10px] text-[#64748b] font-normal shrink-0 ml-3">{msg.time}</span>
                            </div>
                          </div>
                        ) : msg.attachment?.type === "contact" ? (
                          <div className="chat-glass-bubble rounded-2xl p-3.5 w-full max-w-[280px] text-left flex flex-col gap-3" style={senderBubbleStyle}>
                            {msg.replyTo && (
                              <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                                <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                                <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <img 
                                src={msg.attachment.contactAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60"} 
                                alt={msg.attachment.contactName} 
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-bold text-[#0f2942] truncate leading-tight">{msg.attachment.contactName || "Contact"}</div>
                                <div className="text-[10px] text-[#64748b] mt-0.5 truncate">{msg.attachment.contactRole || "Project Member"}</div>
                              </div>
                            </div>
                            <button 
                              onClick={() => openDirectChat(msg.attachment.contactName, msg.attachment.contactAvatar)}
                              className="w-full py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                            >
                              Message Contact
                            </button>
                          </div>
                        ) : (
                          <div className="chat-glass-bubble text-[#0f2942] text-xs px-4 py-2.5 rounded-2xl rounded-tl-[4px] leading-relaxed whitespace-pre-wrap relative" style={senderBubbleStyle}>
                            {msg.replyTo && (
                              <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                                <span className="font-semibold text-slate-700 block">{msg.replyTo.sender}</span>
                                <span className="truncate block font-normal">{msg.replyTo.text}</span>
                              </div>
                            )}
                            {msg.text}
                          </div>
                        )}
                        
                        {/* Hover Action Menu */}
                        {!selectionMode && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center chat-glass-action rounded-full p-1 gap-1 transition-opacity duration-150 shrink-0">
                          {quickReactionEmojis.map(emoji => (
                            <button 
                              key={emoji}
                              onClick={() => handleToggleReaction(msg.id, emoji)}
                              className="text-xs hover:scale-125 transition-transform p-0.5 cursor-pointer bg-transparent border-none"
                            >
                              {emoji}
                            </button>
                          ))}
                          {renderMessageOperationsMenu(msg, "left")}
                        </div>
                        )}
                      </div>

                      {/* Reactions display */}
                      {msg.reactions && msg.reactions.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap pl-1">
                          {msg.reactions.map((reaction, i) => (
                            <button
                              key={i}
                              onClick={() => handleToggleReaction(msg.id, reaction.emoji)}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors cursor-pointer ${
                                reaction.userReacted
                                  ? "bg-[#e8f0fe] border-[#1a73e8]/30 text-[#1a73e8]"
                                  : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                              }`}
                            >
                              <span>{reaction.emoji}</span>
                              <span className="font-semibold">{reaction.count}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      {msg.starred && (
                        <div className="mt-1 pl-1 flex items-center gap-1 text-[9px] font-semibold text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span>Starred</span>
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`group relative flex flex-col items-end ml-auto max-w-[70%] text-right pb-1 animate-in fade-in slide-in-from-bottom-2 duration-200 ${activeMessageMenuId === msg.id ? "z-[80]" : "z-0"}`}>
                    {msg.forwardedFrom && (
                      <span className="text-[9.5px] text-slate-450 font-semibold mb-1 mr-1 flex items-center gap-1 select-none italic">
                        Forwarded
                        <Forward className="w-2.5 h-2.5 text-slate-400" />
                      </span>
                    )}
                    <div className="flex items-center gap-2">
                      {/* Hover Action Menu */}
                      {selectionMode && (
                        <button
                          type="button"
                          onClick={() => handleToggleMessageSelection(msg.id)}
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                            isMessageSelected
                              ? "bg-[#1a73e8] border-[#1a73e8] text-white"
                              : "bg-white border-slate-300 text-transparent hover:border-[#1a73e8]"
                          }`}
                          title={isMessageSelected ? "Unselect message" : "Select message"}
                        >
                          <Check className="w-3 h-3 stroke-[3]" />
                        </button>
                      )}
                      {!selectionMode && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center chat-glass-action rounded-full p-1 gap-1 transition-opacity duration-150 shrink-0">
                        {quickReactionEmojis.map(emoji => (
                          <button 
                            key={emoji}
                            onClick={() => handleToggleReaction(msg.id, emoji)}
                            className="text-xs hover:scale-125 transition-transform p-0.5 cursor-pointer bg-transparent border-none"
                          >
                            {emoji}
                          </button>
                        ))}
                        {renderMessageOperationsMenu(msg, "right")}
                      </div>
                      )}

                      {msg.attachments?.length ? (
                        renderAttachmentGrid(msg, true)
                      ) : msg.attachment?.type === "image" ? (
                        <div className="chat-glass-bubble rounded-2xl p-2 w-full max-w-[280px] text-left flex flex-col">
                          {msg.replyTo && (
                            <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                              <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                              <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                            </div>
                          )}
                          <img 
                            src={msg.attachment.url === "/avatar.jpg" ? "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80" : msg.attachment.url} 
                            alt="Attachment" 
                            onClick={() => setAttachmentPreviewMessage(msg)}
                            className="w-full h-40 object-cover rounded-xl cursor-zoom-in hover:brightness-95 transition-all" 
                          />
                          <div className="flex items-center justify-between mt-2.5 px-1 pb-0.5">
                            <span className="text-xs text-[#0f2942] font-normal">{msg.text || "See this, how it is"}</span>
                            <span className="flex items-center gap-1 text-[10px] text-[#64748b] font-normal shrink-0 ml-3">
                              {msg.time}
                              {msg.status && (
                                <>
                                  <span className={msg.status === "read" ? "text-[#1a73e8] text-[9px] font-bold tracking-tight" : "text-slate-350 text-[9px] font-bold tracking-tight"}>● ●</span>
                                  {renderReadInfoButton(msg)}
                                </>
                              )}
                            </span>
                          </div>
                        </div>
                      ) : msg.attachment?.type === "file" ? (
                        <div
                          onClick={() => setAttachmentPreviewMessage(msg)}
                          className="chat-glass-bubble rounded-2xl p-3 w-full max-w-[280px] text-left flex flex-col gap-1.5 cursor-pointer hover:-translate-y-0.5 transition-all"
                        >
                          {msg.replyTo && (
                            <div className="mb-1 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                              <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                              <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0">
                              <FileText className="w-4.5 h-4.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-[#0f2942] truncate leading-tight">{msg.attachment.fileName}</div>
                              <div className="text-[9px] text-[#64748b] mt-0.5 font-normal">{msg.attachment.fileSize}</div>
                            </div>
                          </div>
                        </div>
                      ) : msg.attachment?.type === "meeting" ? (
                        <div className="chat-glass-bubble rounded-2xl p-3 w-full max-w-[280px] text-left">
                          {msg.replyTo && (
                            <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                              <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                              <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[#1a73e8] font-semibold text-[9px] uppercase tracking-wide">
                            <Calendar className="w-3 h-3" />
                            <span>Meeting Schedule</span>
                          </div>
                          <div className="text-xs font-semibold text-[#0f2942] mt-1 leading-tight">{msg.attachment.meetingTitle}</div>
                          
                          <div className="mt-2.5 flex flex-col gap-0.5 border-t border-slate-100 pt-2 text-[9px] font-normal text-[#64748b]">
                            <div className="flex justify-between">
                              <span>Date:</span>
                              <span className="font-semibold text-[#334155]">{msg.attachment.meetingDate}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Time:</span>
                              <span className="font-semibold text-[#334155]">{msg.attachment.meetingTime}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => {
                              setActiveMeetTitle(msg.attachment?.meetingTitle || "Weekly Design Review");
                              setActiveMeetOpen(true);
                            }}
                            className="mt-2.5 w-full py-1 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-lg text-[9px] font-semibold transition-all cursor-pointer text-center"
                          >
                            Join Call
                          </button>
                        </div>
                      ) : msg.attachment?.type === "audio" ? (
                        <div className="chat-glass-bubble rounded-2xl p-3 w-full max-w-[280px] text-left flex flex-col gap-2">
                          {msg.replyTo && (
                            <div className="mb-1 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                              <span className="font-semibold text-slate-750 block text-[9px]">{msg.replyTo.sender}</span>
                              <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2.5">
                            <button 
                              onClick={() => setActivePlayingAudio(activePlayingAudio === msg.id ? null : msg.id)}
                              className="w-8 h-8 rounded-full bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center shrink-0 hover:bg-[#d2e3fc] transition-colors cursor-pointer"
                            >
                              {activePlayingAudio === msg.id ? (
                                <Pause className="w-3.5 h-3.5 fill-current" />
                              ) : (
                                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                              )}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-semibold text-[#0f2942] truncate leading-tight">{msg.attachment.fileName || "audio_recording.mp3"}</div>
                              <div className="w-full bg-slate-100 h-1 rounded-full mt-1.5 overflow-hidden">
                                <div className={`bg-[#1a73e8] h-full transition-all duration-300 ${activePlayingAudio === msg.id ? "w-[60%] animate-pulse" : "w-[0%]"}`} />
                              </div>
                              <div className="flex justify-between text-[8px] text-[#64748b] mt-1">
                                <span>{activePlayingAudio === msg.id ? "0:43" : "0:00"}</span>
                                <span>{msg.attachment.duration || "2:34"}</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setAttachmentPreviewMessage(msg)}
                              className="w-7 h-7 rounded-full bg-slate-50 text-slate-500 hover:bg-[#e8f0fe] hover:text-[#1a73e8] flex items-center justify-center transition-colors cursor-pointer"
                              title="Open audio player"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {msg.attachment.url && msg.attachment.url !== "#" && (
                            <audio src={msg.attachment.url} controls className="w-full h-8" />
                          )}
                        </div>
                      ) : msg.attachment?.type === "video" ? (
                        <div className="chat-glass-bubble rounded-2xl p-2 w-full max-w-[280px] text-left flex flex-col">
                          {msg.replyTo && (
                            <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                              <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                              <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                            </div>
                          )}
                          <div className="relative w-full h-40 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center">
                            {msg.attachment.url ? (
                              <video 
                                src={msg.attachment.url} 
                                className="w-full h-full object-cover" 
                                controls
                              />
                            ) : (
                              <>
                                <div className="absolute inset-0 bg-[#0f2942]/90 flex flex-col items-center justify-center text-slate-200">
                                  <Film className="w-10 h-10 mb-2 opacity-60" />
                                  <span className="text-[10px] font-semibold">Video Attachment</span>
                                </div>
                                <button className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white hover:scale-110 transition-all cursor-pointer z-10">
                                  <Play className="w-5 h-5 fill-current ml-0.5" />
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => setAttachmentPreviewMessage(msg)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-sm hover:bg-white hover:scale-105 transition-all cursor-pointer"
                              title="Expand video"
                            >
                              <Maximize2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2.5 px-1 pb-0.5">
                            <span className="text-xs text-[#0f2942] font-semibold truncate max-w-[170px]">{msg.attachment.fileName || "site_footage.mp4"}</span>
                            <span className="text-[10px] text-[#64748b] font-normal shrink-0 ml-3">{msg.time}</span>
                          </div>
                        </div>
                      ) : msg.attachment?.type === "contact" ? (
                        <div className="chat-glass-bubble rounded-2xl p-3.5 w-full max-w-[280px] text-left flex flex-col gap-3">
                          {msg.replyTo && (
                            <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                              <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                              <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <img 
                              src={msg.attachment.contactAvatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=60"} 
                              alt={msg.attachment.contactName} 
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-[#0f2942] truncate leading-tight">{msg.attachment.contactName || "Contact"}</div>
                              <div className="text-[10px] text-[#64748b] mt-0.5 truncate">{msg.attachment.contactRole || "Project Member"}</div>
                            </div>
                          </div>
                          <button 
                            onClick={() => openDirectChat(msg.attachment.contactName, msg.attachment.contactAvatar)}
                            className="w-full py-1.5 bg-[#e8f0fe] hover:bg-[#d2e3fc] text-[#1a73e8] rounded-xl text-[10px] font-bold transition-all cursor-pointer text-center"
                          >
                            Message Contact
                          </button>
                        </div>
                      ) : (
                        <div className="chat-glass-bubble text-[#0f2942] text-xs px-4 py-2.5 rounded-2xl rounded-tr-[4px] text-left leading-relaxed whitespace-pre-wrap relative">
                          {msg.replyTo && (
                            <div className="mb-1.5 pl-2 border-l-2 border-[#1a73e8] text-slate-500 text-[10px] bg-slate-50/70 py-0.5 pr-2 rounded-r-md">
                              <span className="font-semibold text-slate-705 block text-[9px]">{msg.replyTo.sender}</span>
                              <span className="truncate block font-normal text-[9px]">{msg.replyTo.text}</span>
                            </div>
                          )}
                          {editingMessageId === msg.id ? (
                            <div className="flex flex-col gap-2 min-w-[220px] py-1">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSaveEdit(msg.id);
                                  }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none font-medium"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingMessageId(null)}
                                  className="h-7 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition-colors cursor-pointer border-none"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(msg.id)}
                                  className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-[10px] font-bold text-white transition-colors cursor-pointer border-none"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {msg.text}
                              {msg.edited && (
                                <span className="text-[8.5px] text-slate-400 font-bold select-none ml-1.5 italic">
                                  (edited)
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reactions display */}
                    {msg.reactions && msg.reactions.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap pr-1">
                        {msg.reactions.map((reaction, i) => (
                          <button
                            key={i}
                            onClick={() => handleToggleReaction(msg.id, reaction.emoji)}
                            className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors cursor-pointer ${
                              reaction.userReacted
                                ? "bg-[#e8f0fe] border-[#1a73e8]/30 text-[#1a73e8]"
                                : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            <span>{reaction.emoji}</span>
                            <span className="font-semibold">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.starred && (
                      <div className="mt-1 pr-1 flex items-center gap-1 text-[9px] font-semibold text-amber-500">
                        <span>Starred</span>
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    )}

                    {msg.attachment?.type !== "image" && (
                      <div className="flex items-center justify-end gap-1.5 mt-1 px-1">
                        <span className="text-[10px] text-[#64748b] font-normal">{msg.time}</span>
                        {msg.status === "read" ? (
                          <span className="text-[#1a73e8] text-[9px] font-bold tracking-tight">● ●</span>
                        ) : (
                          <span className="text-slate-350 text-[9px] font-bold tracking-tight">● ●</span>
                        )}
                        {renderReadInfoButton(msg)}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex flex-col items-start mr-auto max-w-[70%] text-left animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-4 py-2.5 chat-glass-bubble rounded-2xl rounded-tl-[4px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Self Typing Indicator */}
              {selfIsTyping && (
                <div className="flex flex-col items-end ml-auto max-w-[70%] text-right animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="px-4 py-2.5 chat-glass-bubble rounded-2xl rounded-tr-[4px] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1a73e8] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar at the Bottom */}
            <div className="px-6 pb-6 pt-2 bg-transparent relative z-10 shrink-0">
              
              {/* Replying Preview Bar */}
              {replyingToMessage && (
                <div className="mb-2.5 px-4 py-2 bg-white border border-slate-100 rounded-2xl flex items-center justify-between text-left shadow-xs">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold text-[#1a73e8] uppercase tracking-wide">Replying to {replyingToMessage.sender}</div>
                    <div className="text-xs text-slate-600 truncate">{replyingToMessage.text || (replyingToMessage.attachment ? `Attachment: ${replyingToMessage.attachment.type}` : "")}</div>
                  </div>
                  <button 
                    onClick={() => setReplyingToMessage(null)}
                    className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Emoji Selector Popover */}
              {emojiPickerOpen && (
                <div ref={emojiPopoverRef} className="absolute bottom-[76px] left-6 bg-white border border-slate-150 rounded-2xl shadow-lg p-3 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 w-80 max-h-[360px] overflow-y-auto text-left select-none">
                  <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-100 sticky top-0 bg-white z-10">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Emoji</span>
                    <button onClick={() => setEmojiPickerOpen(false)} className="p-0.5 hover:bg-slate-50 rounded-full text-slate-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {emojiSections.map(section => (
                      <div key={section.label}>
                        <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">{section.label}</div>
                        <div className="grid grid-cols-8 gap-1.5">
                          {section.emojis.map((emoji) => (
                            <button
                              key={`${section.label}-${emoji}`}
                              onClick={() => {
                                setInputText(prev => prev + emoji);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-slate-100 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center bg-white/92 rounded-[26px] px-3.5 py-2 select-none border border-white/80 shadow-[0_8px_24px_rgba(15,23,42,0.055),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md transition-all hover:border-slate-200/80 hover:shadow-[0_10px_28px_rgba(15,23,42,0.075),inset_0_1px_0_rgba(255,255,255,0.95)] focus-within:border-[#1a73e8]/25 focus-within:ring-4 focus-within:ring-[#1a73e8]/5">
                <button 
                  ref={emojiButtonRef}
                  data-chat-popover-trigger="true"
                  onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 active:scale-95 ${
                    emojiPickerOpen
                      ? "bg-slate-100 text-[#1a73e8]"
                      : "text-[#64748b] hover:text-[#1a73e8] hover:bg-slate-50"
                  }`}
                  title="Emoji"
                >
                  <Smile className="w-5 h-5 stroke-[1.9]" />
                </button>
                
                <textarea
                  ref={composerRef}
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    e.currentTarget.style.height = "40px";
                    e.currentTarget.style.height = `${Math.min(e.currentTarget.scrollHeight, 112)}px`;
                  }}
                  onKeyDown={handleMessageKeyDown}
                  onCopy={handleComposerCopy}
                  onPaste={handleComposerPaste}
                  placeholder={replyingToMessage ? `Reply to ${replyingToMessage.sender}...` : "Type a message..."}
                  rows={1}
                  className="flex-1 max-h-28 min-h-10 resize-none bg-transparent border-none outline-hidden px-3 py-2.5 text-xs text-[#334155] placeholder-[#94a3b8] focus:ring-0 focus:outline-hidden leading-5 whitespace-pre-wrap select-text"
                />
                
                <div className="flex items-center gap-1.5 text-slate-400 shrink-0 relative">
                  
                  {/* Hidden Native File Inputs for System Picker */}
                  <input 
                    type="file" 
                    id="system-photo-picker" 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    onChange={handleImageUpload} 
                  />
                  <input 
                    type="file" 
                    id="system-doc-picker" 
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.txt" 
                    multiple
                    className="hidden" 
                    onChange={handleDocumentUpload} 
                  />
                  <input 
                    type="file" 
                    id="system-video-picker" 
                    accept="video/*" 
                    multiple
                    className="hidden" 
                    onChange={handleVideoUpload} 
                  />
                  <input 
                    type="file" 
                    id="system-audio-picker" 
                    accept="audio/*" 
                    multiple
                    className="hidden" 
                    onChange={handleAudioUpload} 
                  />
                  <input
                    type="file"
                    id="system-any-picker"
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
                    multiple
                    className="hidden"
                    onChange={handleAnyFileUpload}
                  />

                  {/* 1. IMAGE MENU & TOOLTIP POPOVER */}
                  <div className="relative">
                    <button 
                      data-chat-popover-trigger="true"
                      onClick={() => {
                        setImageMenuOpen(!imageMenuOpen);
                        setLinkMenuOpen(false);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                        imageMenuOpen
                          ? "bg-sky-100 text-sky-600 shadow-sm"
                          : "text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                      }`}
                      title="Images, Camera, GIFs"
                    >
                      <ImagePlus className="w-4.5 h-4.5 stroke-[2.05]" />
                    </button>
                    
                    {imageMenuOpen && (
                      <div className="chat-menu-surface absolute bottom-11 right-[-40px] sm:right-0 w-44 rounded-2xl p-1.5 flex flex-col gap-0.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <button 
                          onClick={() => {
                            document.getElementById("system-photo-picker")?.click();
                            setImageMenuOpen(false);
                          }}
                          className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                        >
                          <ImageIcon className="w-4 h-4 text-emerald-500" />
                          <div className="flex flex-col">
                            <span className="font-semibold">Photos</span>
                            <span className="text-[9px] text-slate-400 font-normal">Choose from system</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => {
                            setCameraModalOpen(true);
                            setImageMenuOpen(false);
                          }}
                          className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                        >
                          <Camera className="w-4 h-4 text-sky-500" />
                          <div className="flex flex-col">
                            <span className="font-semibold">Camera</span>
                            <span className="text-[9px] text-slate-400 font-normal">Capture photo</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => {
                            setGifPickerOpen(true);
                            setImageMenuOpen(false);
                          }}
                          className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                        >
                          <Sparkles className="w-4 h-4 text-purple-500" />
                          <div className="flex flex-col">
                            <span className="font-semibold">GIFs & Stickers</span>
                            <span className="text-[9px] text-slate-400 font-normal">Send fun reactions</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 2. LINK MENU & TOOLTIP POPOVER */}
                  <div className="relative">
                    <button 
                      data-chat-popover-trigger="true"
                      onClick={() => {
                        setLinkMenuOpen(!linkMenuOpen);
                        setImageMenuOpen(false);
                      }}
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 ${
                        linkMenuOpen
                          ? "bg-violet-100 text-violet-600 shadow-sm"
                          : "text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                      }`}
                      title="Attach documents, media, contacts"
                    >
                      <Paperclip className="w-4.5 h-4.5 stroke-[2.05]" />
                    </button>
                    
                    {linkMenuOpen && (
                      <div className="chat-menu-surface absolute bottom-11 right-[-20px] sm:right-0 w-44 rounded-2xl p-1.5 flex flex-col gap-0.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <button 
                          onClick={() => {
                            document.getElementById("system-doc-picker")?.click();
                            setLinkMenuOpen(false);
                          }}
                          className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                        >
                          <FileText className="w-4 h-4 text-blue-500" />
                          <div className="flex flex-col">
                            <span className="font-semibold">Documents</span>
                            <span className="text-[9px] text-slate-400 font-normal">PDF, DOC, ZIP, XLS</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => {
                            document.getElementById("system-video-picker")?.click();
                            setLinkMenuOpen(false);
                          }}
                          className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                        >
                          <Film className="w-4 h-4 text-rose-500" />
                          <div className="flex flex-col">
                            <span className="font-semibold">Video</span>
                            <span className="text-[9px] text-slate-400 font-normal">Attach MP4 footage</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => {
                            document.getElementById("system-audio-picker")?.click();
                            setLinkMenuOpen(false);
                          }}
                          className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                        >
                          <Music className="w-4 h-4 text-indigo-500" />
                          <div className="flex flex-col">
                            <span className="font-semibold">Audio</span>
                            <span className="text-[9px] text-slate-400 font-normal">Voice clip, MP3</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => {
                            setContactCardModalOpen(true);
                            setLinkMenuOpen(false);
                          }}
                          className="chat-menu-item flex items-center gap-2.5 px-3 py-2 text-xs text-[#0f2942] hover:bg-slate-50 rounded-xl cursor-pointer text-left w-full border-none bg-transparent"
                        >
                          <User className="w-4 h-4 text-orange-500" />
                          <div className="flex flex-col">
                            <span className="font-semibold">Contact Card</span>
                            <span className="text-[9px] text-slate-400 font-normal">Share team member</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleSendMessage()}
                    type="button"
                    disabled={!inputText.trim()}
                    className="w-9.5 h-9.5 bg-[radial-gradient(circle_at_35%_20%,#4f8dff_0%,#2563eb_48%,#1d4ed8_100%)] hover:bg-[radial-gradient(circle_at_35%_20%,#6aa1ff_0%,#2563eb_44%,#1e40af_100%)] disabled:opacity-40 disabled:pointer-events-none text-white rounded-full flex items-center justify-center transition-all cursor-pointer shadow-[0_8px_18px_rgba(37,99,235,0.24),inset_0_1px_0_rgba(255,255,255,0.28)] hover:shadow-[0_10px_22px_rgba(37,99,235,0.32),inset_0_1px_0_rgba(255,255,255,0.36)] hover:-translate-y-0.5 active:scale-95 active:translate-y-0 ml-1"
                    title="Send"
                  >
                    <Send className="w-4 h-4 fill-current text-white" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* CHAT NO CHANNEL WELCOME VIEW */
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white select-none animate-in fade-in duration-200 relative overflow-hidden">
            <div className="absolute inset-x-0 bottom-0 h-[48%] pointer-events-none z-0 overflow-hidden bg-transparent">
              <div className="absolute bottom-[-80px] left-[10%] w-[500px] h-[500px] rounded-full bg-violet-300/50 blur-[130px] animate-chat-liquid1" />
              <div className="absolute bottom-[-100px] right-[10%] w-[550px] h-[550px] rounded-full bg-sky-300/60 blur-[140px] animate-chat-liquid2" />
              <div className="absolute bottom-[-60px] left-[40%] w-[450px] h-[450px] rounded-full bg-pink-200/55 blur-[125px] animate-chat-liquid1" style={{ animationDelay: "-8s" }} />
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white via-white/80 to-transparent z-10" />
            </div>
            <div className="max-w-md text-center flex flex-col items-center relative z-10">
              
              {/* Circular chat badge with drop shadow and notification dot */}
              <div className="relative w-18 h-18 rounded-full bg-gradient-to-tr from-[#1a73e8] to-[#2b84fc] flex items-center justify-center shadow-[0_8px_30px_rgba(26,115,232,0.22)] mb-5">
                <MessageCircle className="w-8 h-8 text-white stroke-[2.2] fill-transparent" />
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-[#ff4a7d] rounded-full border-2 border-white" />
              </div>

              {/* Greeting & Subtitle */}
              <h2 className="text-sm font-bold text-[#0f2942] tracking-tight">
                {getGreeting()}, Rudra
              </h2>
              <p className="text-[#64748b] text-[11px] font-normal mt-0.5 mb-6">
                Select a chat or start something new
              </p>

              {/* Action grid (2x2 Card boxes exactly like reference design) */}
              <div className="grid grid-cols-2 gap-3.5 w-full max-w-[340px]">
                
                {/* 1. New Team Card */}
                <div 
                  onClick={() => setNewTeamModalOpen(true)}
                  className="chat-action-card bg-[#eef2ff] border border-[#c7d2fe]/60 hover:border-[#818cf8] hover:bg-[#e0e7ff]/70 rounded-2xl p-4 flex flex-col justify-between items-start h-[76px] cursor-pointer group"
                >
                  <MessageSquarePlus className="w-5 h-5 text-[#4f46e5] stroke-[1.8] group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-semibold text-[#4f46e5]">New Team</span>
                </div>

                {/* 2. Send Photos Card */}
                <div 
                  onClick={() => {
                    setLandingActionType("photo");
                    setPhotoPreview(null);
                    setSelectedChannelsForMultiSend([]);
                    document.getElementById("landing-photo-picker")?.click();
                  }}
                  className="chat-action-card bg-[#faf5ff] border border-[#ebd5ff]/60 hover:border-[#c084fc] hover:bg-[#f3e8ff]/70 rounded-2xl p-4 flex flex-col justify-between items-start h-[76px] cursor-pointer group"
                >
                  <ImageIcon className="w-5 h-5 text-[#9333ea] stroke-[1.8] group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-semibold text-[#9333ea]">Send Photos</span>
                </div>

                {/* 3. Schedule Meeting Card */}
                <div 
                  onClick={() => {
                    navigate("/meet");
                  }}
                  className="chat-action-card bg-[#f0f9ff] border border-[#bae6fd]/60 hover:border-[#38bdf8] hover:bg-[#e0f2fe]/70 rounded-2xl p-4 flex flex-col justify-between items-start h-[76px] cursor-pointer group"
                >
                  <Clock className="w-5 h-5 text-[#0284c7] stroke-[1.8] group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-semibold text-[#0284c7]">Schedule meeting</span>
                </div>

                {/* 4. Share Files Card */}
                <div 
                  onClick={() => {
                    setLandingActionType("file");
                    setShareFilesModalOpen(true);
                  }}
                  className="chat-action-card bg-[#f0fdf4] border border-[#bbf7d0]/60 hover:border-[#4ade80] hover:bg-[#dcfce7]/70 rounded-2xl p-4 flex flex-col justify-between items-start h-[76px] cursor-pointer group"
                >
                  <FileText className="w-5 h-5 text-[#16a34a] stroke-[1.8] group-hover:scale-105 transition-transform" />
                  <span className="text-[11px] font-semibold text-[#16a34a]">Share Files</span>
                </div>

              </div>

            </div>
          </div>
        )}
      </div>

      {/* ACTION DIALOG MODALS */}

      {/* 1. Modal: New Team */}
      {newTeamModalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[999] p-4 select-none animate-in fade-in duration-100" onClick={() => setNewTeamModalOpen(false)}>
          <div className="bg-white border border-zinc-200 rounded-xl shadow-lg w-full max-w-sm p-5 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Create new team</h3>
              <button 
                onClick={() => setNewTeamModalOpen(false)}
                className="p-1 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-600 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTeam} className="space-y-3">
              <div className="text-left">
                <label className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Team Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Structural Engineering" 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full mt-1 px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-normal placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:border-zinc-450 transition-all text-zinc-800"
                />
              </div>

              <div className="text-left">
                <label className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Description (Optional)</label>
                <textarea 
                  placeholder="Short description of team tasks..." 
                  value={newTeamDescription}
                  onChange={(e) => setNewTeamDescription(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-2.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-normal placeholder-zinc-400 focus:outline-hidden focus:bg-white focus:border-zinc-450 transition-all text-zinc-800"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setNewTeamModalOpen(false)}
                  className="flex-1 py-1.75 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.75 bg-zinc-900 hover:bg-zinc-805 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Create Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Share Files */}
      {shareFilesModalOpen && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-[999] p-4 select-none animate-in fade-in duration-100" onClick={() => setShareFilesModalOpen(false)}>
          <div className="bg-white border border-zinc-200 rounded-xl shadow-lg w-full max-w-sm p-5 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Share Project File</h3>
              <button 
                onClick={() => {
                  setSelectedFileName("");
                  setSelectedFileSize("");
                  setShareFilesModalOpen(false);
                }}
                className="p-1 hover:bg-zinc-50 text-zinc-400 hover:text-zinc-600 rounded-md transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <form onSubmit={handleShareFile} className="space-y-3">
              <div className="text-left">
                {!selectedFileName ? (
                  <div className="w-full border-2 border-dashed border-zinc-200 hover:border-zinc-450 hover:bg-zinc-50/40 rounded-xl p-6 flex flex-col items-center justify-center transition-all cursor-pointer group relative">
                    <input 
                      type="file" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFileName(file.name);
                          const sizeBytes = file.size;
                          if (sizeBytes < 1024 * 1024) {
                            setSelectedFileSize(`${(sizeBytes / 1024).toFixed(1)} KB`);
                          } else {
                            setSelectedFileSize(`${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`);
                          }
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <FolderPlus className="w-6 h-6 text-zinc-400 group-hover:text-zinc-650 mb-1.5 transition-colors" />
                    <span className="text-xs font-semibold text-zinc-800">Select Document (CAD, PDF, IFC)</span>
                    <span className="text-[9px] text-zinc-400 mt-0.5 font-normal">Max File Size: 100MB</span>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-zinc-150 text-zinc-650 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-semibold text-zinc-850 truncate max-w-[180px]">{selectedFileName}</div>
                        <div className="text-[9px] text-zinc-400 mt-0.5 font-normal">{selectedFileSize}</div>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedFileName("");
                        setSelectedFileSize("");
                      }}
                      className="p-1 bg-zinc-200 hover:bg-zinc-250 text-zinc-500 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {!activeChannelId ? (
                <div className="p-2.5 bg-blue-50 border border-blue-200/50 rounded-lg text-left flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-[9px] font-semibold text-blue-700">Post this document from workspace landing. Click Next to choose up to 5 team channels.</span>
                </div>
              ) : null}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFileName("");
                    setSelectedFileSize("");
                    setShareFilesModalOpen(false);
                  }}
                  className="flex-1 py-1.75 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedFileName}
                  className="flex-1 py-1.75 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  {!activeChannelId ? "Next: Choose Channels" : "Share File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal: Channel Members */}
      {membersModalOpen && activeChannel && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[1px] flex items-center justify-center z-[999] p-4 select-none animate-in fade-in duration-100" onClick={() => setMembersModalOpen(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-sm p-5 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-slate-800">{activeChannel.name} Members</h3>
                <span className="text-[10px] text-slate-400 font-normal">{activeChannel.members.length} participants</span>
              </div>
              <button 
                onClick={() => setMembersModalOpen(false)}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer bg-transparent border-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Member Search */}
            <div className="relative mb-3.5">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search members..."
                value={memberSearchQuery}
                onChange={(e) => setMemberSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 border border-slate-150 rounded-lg text-xs text-slate-850 placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-slate-300 transition-all"
              />
            </div>

            {/* Members List */}
            <div className="max-h-48 overflow-y-auto space-y-2 mb-4 pr-1 text-left">
              {activeChannel.members
                .filter(m => m.toLowerCase().includes(memberSearchQuery.toLowerCase()))
                .map((member, i) => {
                  const isSelf = member === "Rudra" || member === "Joy";
                  return (
                    <div key={i} className="flex items-center justify-between p-1.5 hover:bg-slate-50/50 rounded-lg">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-semibold flex items-center justify-center text-xs border border-slate-200">
                            {member.charAt(0)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">
                            {member} {isSelf && <span className="text-[10px] text-[#1a73e8] font-normal">(You)</span>}
                          </div>
                          <div className="text-[9px] text-slate-400 font-normal">
                            {member === "Rudra" ? "Project Admin" : "Collaborator"}
                          </div>
                        </div>
                      </div>
                      {!isSelf && (
                        <button 
                          type="button"
                          onClick={() => {
                            setChannels(prev => prev.map(c => {
                              if (c.id !== activeChannel.id) return c;
                              return { ...c, members: c.members.filter(m => m !== member) };
                            }));
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-medium px-2 py-1 hover:bg-rose-50 rounded-md cursor-pointer transition-colors bg-transparent border-none"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Add Member inline form */}
            <div className="border-t border-slate-100 pt-3">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block text-left mb-1.5">Add Member</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Enter name..."
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-hidden focus:bg-white focus:border-slate-300 transition-all text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newMemberName.trim()) return;
                    setChannels(prev => prev.map(c => {
                      if (c.id !== activeChannel.id) return c;
                      if (c.members.includes(newMemberName.trim())) return c;
                      return { ...c, members: [...c.members, newMemberName.trim()] };
                    }));
                    setNewMemberName("");
                  }}
                  className="px-3 bg-[#1a73e8] hover:bg-[#1557b0] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border-none"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal: Channel Profile, Shared Media and Starred Messages */}
      {sharedMediaModalOpen && activeChannel && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[1px] flex items-center justify-center z-[999] p-4 select-none animate-in fade-in duration-100" onClick={() => setSharedMediaModalOpen(false)}>
          <div className="bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.16)] w-full max-w-lg p-4 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="relative mb-3 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50 via-white to-blue-50/70 p-3.5">
              <div className="absolute -right-16 -top-20 h-36 w-36 rounded-full bg-sky-200/50 blur-3xl" />
              <div className="absolute -bottom-20 left-10 h-32 w-32 rounded-full bg-violet-200/40 blur-3xl" />
              <div className="relative flex justify-between items-start gap-4">
                <div className="flex items-center gap-3 text-left min-w-0">
                  <button
                    type="button"
                    onClick={() => document.getElementById("group-dp-picker")?.click()}
                    className="group/avatar relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white/80 bg-slate-100 p-0 shadow-sm cursor-pointer"
                    title="Change group DP"
                  >
                    <img
                      src={activeChannel.avatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60"}
                      alt={activeChannel.name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover/avatar:scale-105"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-white opacity-0 transition-all duration-200 group-hover/avatar:bg-slate-950/38 group-hover/avatar:opacity-100">
                      <Camera className="h-5 w-5" />
                    </span>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#1a73e8] text-white shadow-sm">
                      <Camera className="h-2.5 w-2.5" />
                    </span>
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{activeChannel.name}</h3>
                    <span className="text-[10px] text-slate-500 font-medium">{activeChannel.members.length} members • project coordination room</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-full bg-white/75 border border-white px-2 py-0.5 text-[8.5px] font-bold text-blue-600">{profileMediaItems.length} media</span>
                      <span className="rounded-full bg-white/75 border border-white px-2 py-0.5 text-[8.5px] font-bold text-emerald-600">{profileFileItems.length} files</span>
                      <span className="rounded-full bg-white/75 border border-white px-2 py-0.5 text-[8.5px] font-bold text-amber-600">{profileStarredItems.length} starred</span>
                    </div>
	                    <button
	                      type="button"
	                      onClick={() => document.getElementById("group-dp-picker")?.click()}
	                      className="mt-1.5 text-[9.5px] font-bold text-[#1a73e8] hover:text-[#1557b0] transition-colors bg-transparent border-none p-0 cursor-pointer"
	                    >
	                      Change team DP
	                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => setSharedMediaModalOpen(false)}
                  className="p-1.5 hover:bg-white/70 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer bg-transparent border-none"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

	            {/* Tab Selector */}
	            <div className="flex rounded-xl bg-slate-100/70 p-1 mb-3">
              {[
                { id: "members", label: "Members", count: activeChannel.members.length },
                { id: "media", label: "Media", count: profileMediaItems.length },
                { id: "files", label: "Files", count: profileFileItems.length },
                { id: "starred", label: "Starred", count: profileStarredItems.length },
                { id: "meetings", label: "Meetings", count: profileMeetingItems.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSharedMediaTab(tab.id as any)}
                  className={`flex-1 rounded-lg py-2 text-[11px] font-semibold transition-all text-center cursor-pointer border-none ${
                    sharedMediaTab === tab.id
                      ? "bg-white text-[#1a73e8] shadow-sm"
                      : "bg-transparent text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab.label} <span className="text-[9px] opacity-70">{tab.count}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 text-left">
              {sharedMediaTab === "members" && (
                <div className="rounded-2xl border border-slate-100 bg-white/80 p-3">
                  <div className="mb-2.5 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Members</div>
                      <div className="text-[9px] font-medium text-slate-400">{activeChannel.members.length} people in this team</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMembersModalOpen(true)}
                      className="rounded-lg bg-[#e8f0fe] px-2.5 py-1.5 text-[10px] font-bold text-[#1a73e8] hover:bg-[#d2e3fc] transition-colors cursor-pointer border-none"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {activeChannel.members.map((member) => {
                      const isSelf = member === "Rudra" || member === "Joy";
                      const memberAvatar = channels.find(c => c.members.includes(member) && c.avatarUrl)?.avatarUrl;
                      return (
                        <div key={member} className="flex items-center gap-2 rounded-xl bg-slate-50/80 px-2.5 py-2">
                          {memberAvatar ? (
                            <img src={memberAvatar} alt={member} className="h-8 w-8 rounded-full object-cover" />
                          ) : (
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                              {member.charAt(0)}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-semibold text-slate-800">
                              {member} {isSelf && <span className="font-medium text-[#1a73e8]">(You)</span>}
                            </div>
                            <div className="text-[9px] font-medium text-slate-400">{member === "Rudra" ? "Project Admin" : "Team member"}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            {!isSelf && (
                              <button
                                type="button"
                                onClick={() => {
                                  openDirectChat(member, memberAvatar);
                                  setSharedMediaModalOpen(false);
                                }}
                                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 hover:bg-[#e8f0fe] hover:text-[#1a73e8] transition-colors cursor-pointer border-none"
                                title={`Chat with ${member}`}
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => showChatFeedback("Video call", `Starting video call with ${member}.`, "info")}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer border-none"
                              title={`Video call ${member}`}
                            >
                              <Video className="h-3.5 w-3.5" />
                            </button>
                            {!isSelf && (
                              <div className="relative">
                                <button
                                  type="button"
                                  data-chat-popover-trigger="true"
                                  onClick={() => setActiveMemberMenuName(activeMemberMenuName === member ? null : member)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer border-none"
                                  title="Member options"
                                >
                                  <MoreVertical className="h-3.5 w-3.5" />
                                </button>
                                {activeMemberMenuName === member && (
                                  <div className="chat-menu-surface absolute right-0 top-8 z-[1001] w-36 rounded-xl p-1">
                                    <button
                                      type="button"
                                      onClick={() => removeMemberFromActiveTeam(member)}
                                      className="chat-menu-item flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[11px] font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer border-none bg-transparent"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                      <span>Remove member</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {sharedMediaTab === "media" && (
                <div className="grid grid-cols-3 gap-2.5">
                  {profileMediaItems.map((item, i) => (
                    <a 
                      key={item.id || i} 
                      href={item.url || "#"} 
                      target="_blank" 
                      rel="noreferrer" 
                      className={`${i === 0 ? "col-span-2 row-span-2" : ""} group relative aspect-square rounded-xl overflow-hidden border border-white bg-slate-100 shadow-sm hover:shadow-md transition-all`}
                    >
                      {item.type === "image" && item.url ? (
                        <img 
                          src={item.url} 
                          alt={item.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500">
                          {item.type === "video" ? <Film className="w-7 h-7 text-rose-500" /> : <Music className="w-7 h-7 text-indigo-500" />}
                          <span className="text-[9px] font-semibold truncate max-w-[80%]">{item.title}</span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-2">
                        <div className="truncate text-[10px] font-bold text-white">{item.title}</div>
                        <div className="text-[8px] font-semibold text-white/75">{item.sender} • {item.time}</div>
                      </div>
                    </a>
                  ))}
                  {profileMediaItems.length === 0 && (
                    <div className="col-span-3 text-center py-8 text-xs text-slate-400 font-normal">No media shared yet</div>
                  )}
                </div>
              )}

              {sharedMediaTab === "files" && (
                <div className="space-y-2">
                  {profileFileItems.map((item, i) => (
                      <div key={item.id || i} className="flex items-center gap-3 p-3 bg-slate-50/80 border border-slate-100 rounded-xl hover:bg-white hover:shadow-sm transition-all">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          item.tone === "emerald" ? "bg-emerald-50 text-emerald-600" :
                          item.tone === "violet" ? "bg-violet-50 text-violet-600" :
                          item.tone === "amber" ? "bg-amber-50 text-amber-600" :
                          "bg-[#e8f0fe] text-[#1a73e8]"
                        }`}>
                          <FileText className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 truncate leading-tight">{item.title}</div>
                          <div className="text-[9px] text-slate-400 mt-0.5 font-normal">{item.size} • {item.sender} • {item.time}</div>
                        </div>
                        <Download className="w-4 h-4 text-slate-300" />
                      </div>
                    ))}
                  {profileFileItems.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 font-normal">No documents shared yet</div>
                  )}
                </div>
              )}

              {sharedMediaTab === "starred" && (
                <div className="space-y-2">
                  {profileStarredItems.map((item, i) => (
                    <div key={item.id || i} className="p-3 bg-amber-50/55 border border-amber-100 rounded-xl text-left hover:bg-amber-50 transition-colors">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-amber-600">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{item.sender}</span>
                        </div>
                        {item.live && (
                          <button
                            type="button"
                            onClick={() => handleToggleStar(item.id)}
                            className="text-[10px] font-semibold text-slate-400 hover:text-amber-600 bg-transparent border-none cursor-pointer"
                          >
                            Unstar
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-slate-800 leading-relaxed line-clamp-2">
                        {item.title}
                      </div>
                      <div className="text-[9px] text-slate-400 mt-1">{item.time}</div>
                    </div>
                  ))}
                  {profileStarredItems.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 font-normal">No starred messages yet</div>
                  )}
                </div>
              )}

              {sharedMediaTab === "meetings" && (
                <div className="space-y-2">
                  {profileMeetingItems.map((item, i) => (
                      <div key={item.id || i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-left flex items-center gap-3 hover:bg-white hover:shadow-sm transition-all">
                        <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                          <Calendar className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2 font-normal">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span>{item.time}</span>
                          <span>•</span>
                          <span>{item.owner}</span>
	                        </div>
	                      </div>
                      </div>
                    ))}
                  {profileMeetingItems.length === 0 && (
                    <div className="text-center py-8 text-xs text-slate-400 font-normal">No scheduled meetings yet</div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={handleCollapseActiveTeam}
                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Collapse team
              </button>
              <button
                type="button"
                onClick={handleExitActiveTeam}
                className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer border-none"
              >
                Exit team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Modal: Message Read Info */}
      {readReceiptMessage && activeChannel && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[1px] flex items-center justify-center z-[1000] p-4 select-none animate-in fade-in duration-100" onClick={() => setReadReceiptMessage(null)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.16)] w-full max-w-sm p-4 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Message info</h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Sent {readReceiptMessage.time}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReadReceiptMessage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer border-none bg-transparent"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2.5 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Message</div>
              <div className="text-xs text-slate-700 line-clamp-2">
                {readReceiptMessage.text || readReceiptMessage.attachment?.fileName || readReceiptMessage.attachments?.[0]?.fileName || "Attachment"}
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seen by</span>
                <span className="text-[10px] font-semibold text-[#1a73e8]">
                  {getReadReceiptMembers(readReceiptMessage).length}
                </span>
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {getReadReceiptMembers(readReceiptMessage).length > 0 ? (
                  getReadReceiptMembers(readReceiptMessage).map((member) => {
                    const memberAvatar = channels.find(c => c.members.includes(member) && c.avatarUrl)?.avatarUrl;
                    return (
                      <div key={member} className="flex items-center gap-2 rounded-xl bg-white border border-slate-100 px-2.5 py-2">
                        {memberAvatar ? (
                          <img src={memberAvatar} alt={member} className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-xs font-bold text-slate-600 ring-1 ring-slate-100">
                            {member.charAt(0)}
                          </span>
                        )}
                        <div className="min-w-0 flex-1 text-left">
                          <div className="truncate text-xs font-semibold text-slate-800">{member}</div>
                          <div className="text-[9px] font-medium text-slate-400">Seen today</div>
                        </div>
                        <Check className="h-3.5 w-3.5 text-[#1a73e8]" />
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 py-5 text-center text-xs font-medium text-slate-400">
                    Not seen by anyone yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Forward Selected Messages */}
      {forwardModalOpen && activeChannel && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[1px] flex items-center justify-center z-[999] p-4 select-none animate-in fade-in duration-100" onClick={() => setForwardModalOpen(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-5 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-slate-800">Forward messages</h3>
                <span className="text-[10px] text-slate-400 font-normal">{selectedMessages.length} selected from {activeChannel.name}</span>
              </div>
              <button 
                onClick={() => {
                  setForwardModalOpen(false);
                  setSelectedForwardChannelIds([]);
                }}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer bg-transparent border-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mb-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Preview</div>
              <div className="space-y-1">
                {selectedMessages.slice(0, 3).map(msg => (
                  <div key={msg.id} className="text-[10px] text-slate-600 truncate">
                    <span className="font-semibold text-slate-800">{msg.sender}:</span> {getMessagePreview(msg)}
                  </div>
                ))}
                {selectedMessages.length > 3 && (
                  <div className="text-[10px] font-semibold text-slate-400">+{selectedMessages.length - 3} more messages</div>
                )}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 mb-4 pr-1 text-left">
              {channels.map((chan) => {
                const isChecked = selectedForwardChannelIds.includes(chan.id);
                return (
                  <label 
                    key={chan.id} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked 
                        ? "bg-[#e8f0fe]/40 border-[#1a73e8]/30" 
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {chan.id.startsWith("ch_") ? (
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                          isChecked 
                            ? "bg-blue-100 text-blue-600 font-black border-blue-200/50" 
                            : "bg-slate-100 text-slate-500 font-extrabold border-slate-200/20"
                        }`}>
                          <span className="text-xs font-mono">#</span>
                        </div>
                      ) : (
                        <img 
                          src={chan.avatarUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60"} 
                          alt={chan.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{chan.name}</div>
                        <div className="text-[9px] text-slate-400 font-normal">{chan.id === activeChannel.id ? "Current chat" : `${chan.members.length} members`}</div>
                      </div>
                    </div>
                    
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedForwardChannelIds(prev => (
                          isChecked ? prev.filter(id => id !== chan.id) : [...prev, chan.id]
                        ));
                      }}
                      className="w-4 h-4 text-[#1a73e8] border-slate-200 rounded-sm focus:ring-[#1a73e8]"
                    />
                  </label>
                );
              })}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setForwardModalOpen(false);
                  setSelectedForwardChannelIds([]);
                }}
                className="flex-1 py-1.75 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleForwardSelectedMessages}
                disabled={selectedForwardChannelIds.length === 0 || selectedMessages.length === 0}
                className="flex-1 py-1.75 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg text-xs font-semibold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
              >
                <Forward className="w-3.5 h-3.5" />
                <span>Forward to {selectedForwardChannelIds.length}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Modal: Multi-Select Channels (Landing Screen checklist) */}
      {multiSelectModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[1px] flex items-center justify-center z-[999] p-4 select-none animate-in fade-in duration-100" onClick={() => setMultiSelectModalOpen(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-sm p-5 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-slate-800">Select Recipients</h3>
                <span className="text-[10px] text-slate-400 font-normal">Send to up to 5 people or groups</span>
              </div>
              <button 
                onClick={() => setMultiSelectModalOpen(false)}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer bg-transparent border-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {landingActionType === "photo" && photoPreview && (
              <div className="mb-3 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                <img src={photoPreview} alt="Selected preview" className="h-32 w-full object-cover" />
              </div>
            )}

            {/* Checklist of recipients */}
            <div className="max-h-56 overflow-y-auto space-y-2 mb-4 pr-1 text-left">
              {landingRecipientOptions.map((recipient) => {
                const isChecked = selectedChannelsForMultiSend.includes(recipient.id);
                return (
                  <label 
                    key={recipient.id} 
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isChecked 
                        ? "bg-[#e8f0fe]/40 border-[#1a73e8]/30" 
                        : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {recipient.type === "group" ? (
                        recipient.avatarUrl ? (
                          <img 
                            src={recipient.avatarUrl} 
                            alt={recipient.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className={`w-7 h-7 rounded-full ${recipient.avatarColor} text-white flex items-center justify-center font-semibold text-xs shrink-0 uppercase`}>
                            {recipient.name.charAt(0)}
                          </div>
                        )
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-semibold text-xs shrink-0 uppercase">
                          {recipient.name.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800 truncate">{recipient.name}</div>
                        <div className="text-[9px] text-slate-400 font-normal">{recipient.subtitle}</div>
                      </div>
                    </div>
                    
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {
                        setSelectedChannelsForMultiSend(prev => {
                          if (isChecked) {
                            return prev.filter(id => id !== recipient.id);
                          } else {
                            if (prev.length >= 5) {
                              alert("Maximum 5 recipients selected.");
                              return prev;
                            }
                            return [...prev, recipient.id];
                          }
                        });
                      }}
                      className="w-4 h-4 text-[#1a73e8] border-slate-200 rounded-sm focus:ring-[#1a73e8]"
                    />
                  </label>
                );
              })}
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setMultiSelectModalOpen(false)}
                className="flex-1 py-1.75 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleMultiSend}
                disabled={selectedChannelsForMultiSend.length === 0}
                className="flex-1 py-1.75 bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-30 disabled:pointer-events-none text-white rounded-lg text-xs font-semibold transition-all cursor-pointer border-none"
              >
                Send to {selectedChannelsForMultiSend.length} Recipient{selectedChannelsForMultiSend.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 9. Modal: GIFs & Stickers Picker */}
      {gifPickerOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[1px] flex items-center justify-center z-[999] p-4 select-none animate-in fade-in duration-100" onClick={() => setGifPickerOpen(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-sm p-5 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-slate-800">GIFs & Stickers</h3>
                <span className="text-[10px] text-slate-400 font-normal">Express with cool visual reactions</span>
              </div>
              <button 
                onClick={() => setGifPickerOpen(false)}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer bg-transparent border-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1 text-left">
              {[
                { name: "Thumbs Up", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=200&auto=format&fit=crop&q=60" },
                { name: "Success Star", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=60" },
                { name: "Party Popper", url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=60" },
                { name: "Coffee Break", url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&auto=format&fit=crop&q=60" }
              ].map((gif, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendGif(gif.url)}
                  className="group relative rounded-xl overflow-hidden border border-slate-100 hover:border-[#1a73e8] transition-all aspect-video p-0 bg-slate-50 cursor-pointer"
                >
                  <img src={gif.url} alt={gif.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-250" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/40 py-1 text-center text-[9px] text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {gif.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 10. Modal: Live Camera Simulation */}
      {cameraModalOpen && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[1px] flex items-center justify-center z-[999] p-4 select-none animate-in fade-in duration-100" onClick={() => setCameraModalOpen(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-md p-5 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-slate-800 text-left">Live Site Camera</h3>
                <span className="text-[10px] text-slate-400 font-normal">Simulate webcam viewport capture</span>
              </div>
              <button 
                onClick={() => setCameraModalOpen(false)}
                className="p-1 hover:bg-slate-55 text-slate-400 hover:text-slate-655 rounded-md transition-colors cursor-pointer bg-transparent border-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden mb-4 border border-slate-950 flex flex-col items-center justify-center">
              <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(26,115,232,0.1)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-605/80 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                <span>Live Feed</span>
              </div>
              
              <img 
                src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=500&auto=format&fit=crop&q=80" 
                alt="Camera simulation"
                className="w-full h-full object-cover opacity-90"
              />
              
              <div className="absolute w-6 h-6 border-t-2 border-l-2 border-white/50 top-6 left-6" />
              <div className="absolute w-6 h-6 border-t-2 border-r-2 border-white/50 top-6 right-6" />
              <div className="absolute w-6 h-6 border-b-2 border-l-2 border-white/50 bottom-6 left-6" />
              <div className="absolute w-6 h-6 border-b-2 border-r-2 border-white/50 bottom-6 right-6" />
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCameraModalOpen(false)}
                className="flex-1 py-1.75 border border-zinc-205 bg-white hover:bg-zinc-50 text-zinc-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSendMessage("Captured photo from Site Camera", {
                    type: "image",
                    url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&auto=format&fit=crop&q=80",
                    fileName: "camera_capture.jpg"
                  });
                  setCameraModalOpen(false);
                }}
                className="flex-1 py-1.75 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 border-none"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Capture & Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 11. Modal: Share Contact Card */}
      {contactCardModalOpen && activeChannel && (
        <div className="fixed inset-0 bg-[#0f172a]/20 backdrop-blur-[1px] flex items-center justify-center z-[999] p-4 select-none animate-in fade-in duration-100" onClick={() => setContactCardModalOpen(false)}>
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-sm p-5 animate-in zoom-in-98 duration-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <div className="text-left">
                <h3 className="text-sm font-semibold text-slate-800">Share Contact Card</h3>
                <span className="text-[10px] text-slate-400 font-normal">Select a member to share in chat</span>
              </div>
              <button 
                onClick={() => setContactCardModalOpen(false)}
                className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-655 rounded-md transition-colors cursor-pointer bg-transparent border-none"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="max-h-56 overflow-y-auto space-y-2 mb-4 pr-1 text-left">
              {[
                { name: "Liam Henderson", role: "Lead Structural Engineer", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" },
                { name: "Olivia Smith", role: "BIM Project Manager", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" },
                { name: "Sophia Patel", role: "Senior BIM Coordinator", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" },
                { name: "Daniel Chen", role: "MEP Engineer Specialist", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80" }
              ].map((member, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendContact(member.name, member.role, member.avatar)}
                  className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-100 hover:border-[#1a73e8] bg-white transition-all cursor-pointer text-left font-sans"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">{member.name}</div>
                      <div className="text-[9px] text-slate-400 truncate">{member.role}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#1a73e8] hover:underline shrink-0 pr-1">Share</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 12. Modal: Delete Confirmation */}
      {deleteConfirmAction && (
        <div
          className="fixed inset-0 bg-[#0f172a]/24 backdrop-blur-[1px] flex items-center justify-center z-[1000] p-4 select-none animate-in fade-in duration-100"
          onClick={() => setDeleteConfirmAction(null)}
        >
          <div
            className="bg-white border border-slate-100 rounded-2xl shadow-xl w-full max-w-sm p-5 animate-in zoom-in-98 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 text-left">
              <div className="w-9 h-9 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900">{deleteConfirmAction.title}</h3>
                <p className="mt-1 text-[11px] leading-5 text-slate-500">{deleteConfirmAction.description}</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmAction(null)}
                className="flex-1 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = deleteConfirmAction;
                  setDeleteConfirmAction(null);
                  action.run();
                }}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer border-none"
              >
                {deleteConfirmAction.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. Modal: Rich Attachment Preview */}
      {attachmentPreviewMessage && activePreviewAttachment && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-[1000] p-2.5 select-none animate-in fade-in duration-150 ${
            activePreviewAttachment.type === "video"
              ? "bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.52)_0%,rgba(15,23,42,0.74)_58%,rgba(2,6,23,0.92)_100%)] backdrop-blur-[2px]"
              : "bg-slate-950/45 backdrop-blur-sm"
          }`}
          onClick={() => setAttachmentPreviewMessage(null)}
        >
          <div
            className="bg-white/96 border border-white/70 rounded-[18px] shadow-[0_22px_70px_rgba(2,6,23,0.28)] w-full max-w-5xl max-h-[92vh] overflow-hidden animate-in zoom-in-98 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3.5 py-2.5 border-b border-slate-100/80 flex items-center justify-between gap-3">
              <div className="min-w-0 text-left">
                <div className="text-xs font-semibold text-slate-900 truncate">{getAttachmentTitle(attachmentPreviewMessage)}</div>
                <div className="text-[9px] text-slate-400 font-normal">
                  {attachmentPreviewMessage.sender} · {attachmentPreviewMessage.time}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {previewAttachments.length > 1 && (
                  <span className="px-2 py-1 rounded-full bg-slate-100 text-[10px] font-semibold text-slate-500">
                    {activePreviewIndex + 1} / {previewAttachments.length}
                  </span>
                )}
                {activePreviewAttachment.url && activePreviewAttachment.url !== "#" && (
                  <a
                    href={activePreviewAttachment.url}
                    download={activePreviewAttachment.fileName || getAttachmentTitle(attachmentPreviewMessage)}
                    className="w-7.5 h-7.5 rounded-full border border-slate-100 bg-white text-slate-500 hover:text-[#1a73e8] hover:border-[#1a73e8]/30 flex items-center justify-center transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setAttachmentPreviewMessage(null)}
                  className="w-7.5 h-7.5 rounded-full border border-slate-100 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className={`${activePreviewAttachment.type === "video" ? "p-2.5 bg-slate-950" : "p-3 bg-slate-50/70"} max-h-[calc(92vh-50px)] overflow-auto relative`}>
              {previewAttachments.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setAttachmentPreviewIndex(prev => (prev - 1 + previewAttachments.length) % previewAttachments.length)}
                    className="absolute left-5 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-white/92 text-slate-700 shadow-lg hover:bg-white flex items-center justify-center transition-all cursor-pointer"
                    title="Previous"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAttachmentPreviewIndex(prev => (prev + 1) % previewAttachments.length)}
                    className="absolute right-5 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-white/92 text-slate-700 shadow-lg hover:bg-white flex items-center justify-center transition-all cursor-pointer"
                    title="Next"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              {activePreviewAttachment.type === "image" && (
                <div className="flex items-center justify-center min-h-[360px]">
                  <img
                    src={activePreviewAttachment.url?.startsWith("blob:") || activePreviewAttachment.url?.startsWith("http") ? activePreviewAttachment.url : "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&auto=format&fit=crop&q=90"}
                    alt={getAttachmentTitle(attachmentPreviewMessage)}
                    className="max-w-full max-h-[74vh] rounded-xl object-contain shadow-lg bg-white"
                  />
                </div>
              )}

              {activePreviewAttachment.type === "video" && (
                <div className="relative bg-slate-950 rounded-xl overflow-hidden shadow-[0_16px_42px_rgba(0,0,0,0.38)]">
                  <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_52%,rgba(0,0,0,0.34)_100%)]" />
                  {activePreviewAttachment.url ? (
                    <video
                      src={activePreviewAttachment.url}
                      controls
                      autoPlay
                      className="relative z-0 w-full max-h-[78vh] bg-slate-950"
                    />
                  ) : (
                    <div className="h-[420px] flex flex-col items-center justify-center text-slate-300">
                      <Film className="w-12 h-12 mb-3 opacity-70" />
                      <span className="text-sm font-semibold">Video preview unavailable</span>
                    </div>
                  )}
                </div>
              )}

              {activePreviewAttachment.type === "audio" && (
                <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 truncate">{getAttachmentTitle(attachmentPreviewMessage)}</div>
                      <div className="text-[10px] text-slate-400">{activePreviewAttachment.duration || "Audio file"}</div>
                    </div>
                  </div>
                  {activePreviewAttachment.url && activePreviewAttachment.url !== "#" ? (
                    <audio src={activePreviewAttachment.url} controls autoPlay className="w-full" />
                  ) : (
                    <div className="rounded-xl bg-slate-50 border border-dashed border-slate-200 p-5 text-center text-xs text-slate-500">
                      Audio player preview unavailable for this sample.
                    </div>
                  )}
                </div>
              )}

              {activePreviewAttachment.type === "file" && (
                <div className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  {activePreviewAttachment.url && activePreviewAttachment.url !== "#" && activePreviewAttachment.fileName?.toLowerCase().endsWith(".pdf") ? (
                    <iframe
                      src={activePreviewAttachment.url}
                      title={getAttachmentTitle(attachmentPreviewMessage)}
                      className="w-full h-[72vh] bg-white"
                    />
                  ) : (
                    <div className="p-6 text-left">
                      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <div className="w-11 h-11 rounded-xl bg-[#e8f0fe] text-[#1a73e8] flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-slate-900 truncate">{getAttachmentTitle(attachmentPreviewMessage)}</div>
                          <div className="text-[10px] text-slate-400">{activePreviewAttachment.fileSize || "Document preview"}</div>
                        </div>
                      </div>
                      <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-5 min-h-[360px]">
                        <div className="w-full h-3 bg-slate-200 rounded-full mb-5" />
                        <div className="space-y-3">
                          <div className="h-2.5 bg-slate-200 rounded-full w-[92%]" />
                          <div className="h-2.5 bg-slate-200 rounded-full w-[76%]" />
                          <div className="h-2.5 bg-slate-200 rounded-full w-[84%]" />
                          <div className="grid grid-cols-3 gap-3 py-4">
                            <div className="h-24 bg-white border border-slate-100 rounded-lg" />
                            <div className="h-24 bg-white border border-slate-100 rounded-lg" />
                            <div className="h-24 bg-white border border-slate-100 rounded-lg" />
                          </div>
                          <div className="h-2.5 bg-slate-200 rounded-full w-[68%]" />
                          <div className="h-2.5 bg-slate-200 rounded-full w-[88%]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
