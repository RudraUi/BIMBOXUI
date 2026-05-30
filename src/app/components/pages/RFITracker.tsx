import { useState, useRef, useEffect } from "react";
import { Search, Plus, MoreVertical, Send, Maximize2, Paperclip, MessageSquare, FileText, ArrowLeft, Filter, ChevronLeft, ChevronRight } from "lucide-react";

type RFIStatus = "OPEN" | "IN PROGRESS" | "CLOSED";
type Importance = "High" | "Medium" | "Low";
type RFITrackerTab = "Issues" | "RFI";

type RFIComment = {
  id: number;
  author: string;
  text: string;
  timestamp: string;
};

type Attachment = {
  id: number;
  name: string;
  size: string;
};

type RFI = {
  id: string;
  type: "RFI" | "Issues";
  title: string;
  status: RFIStatus;
  importance: Importance;
  author: string;
  assignee: string;
  startDate: string;
  endDate: string;
  description: string;
  timeAgo: string;
  comments: RFIComment[];
  attachments: Attachment[];
  snapImage?: string;
};

export type RFITrackerOpenItem = RFI & { isNewAction?: boolean; };

const DUMMY_DATA: RFI[] = [
  {
    id: "#ISSUE-004",
    type: "Issues",
    title: "Misaligned HVAC Ducting on Floor 3",
    status: "OPEN",
    importance: "High",
    author: "Deependra Samal",
    assignee: "No Member assigned",
    startDate: "28 Apr 2026",
    endDate: "30 Apr 2026",
    description: "Please verify the escalation point near the structural column on grid B4. The alignment seems slightly off by 400mm which could clash with the primary HVAC run scheduled for next week installation. If we can reroute through corridor 2, we might avoid breaking the bulkhead.",
    timeAgo: "2 days ago",
    comments: [],
    attachments: [
       { id: 101, name: "HVAC_Grid_B4.pdf", size: "2.4 MB" },
       { id: 102, name: "Clash_Report_v2.xlsx", size: "128 KB" }
    ],
    snapImage: "/images/bim_clash_viewport.png"
  },
  {
    id: "#ISSUE-003",
    type: "Issues",
    title: "Alternative material for facade cladding",
    status: "IN PROGRESS",
    importance: "Medium",
    author: "Deependra Samal",
    assignee: "John Architect",
    startDate: "01 May 2026",
    endDate: "12 May 2026",
    description: "The currently specified aluminum composite panel is experiencing global supply chain delays. Vendor is proposing an alternate metallic finish panel. Need architectural review ASAP.",
    timeAgo: "5 days ago",
    comments: [
      { id: 1, author: "Deependra Samal", text: "I have uploaded the specs for the alternative panel.", timestamp: "Yesterday" },
      { id: 2, author: "John Architect", text: "Looking into the fire-rating of the new generic panel.", timestamp: "Just now" }
    ],
    attachments: [
      { id: 103, name: "Vendor_Specs.pdf", size: "5.1 MB" }
    ],
    snapImage: "/images/architectural_markup_plan.png"
  },
  {
    id: "#ISSUE-002",
    type: "Issues",
    title: "Confirm concrete pour schedule",
    status: "OPEN",
    importance: "High",
    author: "Snehasis M",
    assignee: "Site Manager",
    startDate: "No Date Selected",
    endDate: "No Date Selected",
    description: "We skipped the pour on sector 4 yesterday due to heavy rain. We need to reschedule the concrete trucks immediately to ensure the curing time doesn't impact Friday's framing schedule.",
    timeAgo: "6 days ago",
    comments: [],
    attachments: [],
    snapImage: "/images/steel_structure_site.png"
  },
  {
    id: "#ISSUE-001",
    type: "Issues",
    title: "Verify waterproofing membranes",
    status: "CLOSED",
    importance: "Low",
    author: "Deependra Samal",
    assignee: "No Member assigned",
    startDate: "15 Apr 2026",
    endDate: "20 Apr 2026",
    description: "The basement waterproofing membrane installation is complete. QC needs to sign off before backfilling.",
    timeAgo: "7 days ago",
    comments: [],
    attachments: [
      { id: 104, name: "QC_Signoff_Signed.pdf", size: "850 KB" }
    ],
    snapImage: "/images/bim_clash_viewport.png"
  },
  {
    id: "#RFI-004",
    type: "RFI",
    title: "Clarify fire-rated shaft wall assembly",
    status: "OPEN",
    importance: "High",
    author: "BIM Coordinator",
    assignee: "John Architect",
    startDate: "03 May 2026",
    endDate: "06 May 2026",
    description: "Need confirmation on fire rating, board layers, and shaft wall detail before services are released for coordination.",
    timeAgo: "1 day ago",
    comments: [],
    attachments: [],
    snapImage: "/images/architectural_markup_plan.png"
  },
  {
    id: "#RFI-003",
    type: "RFI",
    title: "Confirm slab opening size for riser",
    status: "IN PROGRESS",
    importance: "Medium",
    author: "Site Manager",
    assignee: "Structural Lead",
    startDate: "01 May 2026",
    endDate: "08 May 2026",
    description: "MEP team needs final opening dimensions for the vertical riser before issuing coordinated sleeve drawings.",
    timeAgo: "3 days ago",
    comments: [],
    attachments: [],
    snapImage: "/images/steel_structure_site.png"
  },
  {
    id: "#RFI-002",
    type: "RFI",
    title: "Request approval for alternate cable tray route",
    status: "OPEN",
    importance: "Medium",
    author: "Electrical Engineer",
    assignee: "MEP Manager",
    startDate: "No Date Selected",
    endDate: "No Date Selected",
    description: "Proposed tray route avoids the congested corridor and reduces clash risk with HVAC ductwork.",
    timeAgo: "5 days ago",
    comments: [],
    attachments: [],
    snapImage: "/images/bim_clash_viewport.png"
  },
  {
    id: "#RFI-001",
    type: "RFI",
    title: "Confirm reflected ceiling height in lobby",
    status: "CLOSED",
    importance: "Low",
    author: "Interior Designer",
    assignee: "Architectural Lead",
    startDate: "18 Apr 2026",
    endDate: "21 Apr 2026",
    description: "Final ceiling height confirmed after coordination with HVAC diffuser locations and lighting layout.",
    timeAgo: "2 weeks ago",
    comments: [],
    attachments: [],
    snapImage: "/images/architectural_markup_plan.png"
  }
];

export function RFITracker({
  onOpenInCoordination,
  initialTab = "Issues"
}: {
  onOpenInCoordination?: (item: RFITrackerOpenItem) => void;
  initialTab?: RFITrackerTab;
}) {
  const [items, setItems] = useState<RFI[]>(DUMMY_DATA);
  const [activeTab, setActiveTab] = useState<RFITrackerTab>(initialTab);
  const [viewMode, setViewMode] = useState<"table" | "workspace">("table");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<"Overview" | "Comments">("Overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | RFIStatus>("All");
  const [importanceFilter, setImportanceFilter] = useState<"All" | Importance>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [activeRowMenuId, setActiveRowMenuId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [modalItem, setModalItem] = useState<RFI | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const filteredItems = items.filter(r => 
    r.type === activeTab &&
    (statusFilter === "All" || r.status === statusFilter) &&
    (importanceFilter === "All" || r.importance === importanceFilter) &&
    (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
     r.assignee.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const tabItems = items.filter((item) => item.type === activeTab);
  const issueCount = items.filter((item) => item.type === "Issues").length;
  const rfiCount = items.filter((item) => item.type === "RFI").length;
  const openCount = tabItems.filter((item) => item.status === "OPEN").length;
  const inProgressCount = tabItems.filter((item) => item.status === "IN PROGRESS").length;
  const highPriorityCount = tabItems.filter((item) => item.importance === "High").length;
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));
  const pageStartIndex = (currentPage - 1) * rowsPerPage;
  const paginatedItems = filteredItems.slice(pageStartIndex, pageStartIndex + rowsPerPage);
  const visibleStart = filteredItems.length === 0 ? 0 : pageStartIndex + 1;
  const visibleEnd = Math.min(pageStartIndex + rowsPerPage, filteredItems.length);

  const selectedItem = items.find(r => r.id === selectedItemId) || filteredItems[0];

  useEffect(() => {
    if (activeDetailTab === "Comments" && viewMode === "workspace") {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedItem?.comments, activeDetailTab, viewMode]);

  useEffect(() => {
    setCurrentPage(1);
    setActiveRowMenuId(null);
  }, [activeTab, searchQuery, statusFilter, importanceFilter, rowsPerPage]);

  const handleStatusChange = (id: string, newStatus: RFIStatus) => {
    setItems(current => current.map(item => item.id === id ? { ...item, status: newStatus } : item));
  };

  const handleImportanceChange = (id: string, newImportance: Importance) => {
    setItems(current => current.map(item => item.id === id ? { ...item, importance: newImportance } : item));
  };

  const handleOpenItem = (item: RFI) => {
    if (onOpenInCoordination) {
      onOpenInCoordination(item);
      return;
    }
    setSelectedItemId(item.id);
    setViewMode("workspace");
  };

  const handleAddNewItem = () => {
    const newId = `#${activeTab.toUpperCase().slice(0, 3)}-00${items.length + 1}`;
    const newItem: RFI = {
      id: newId,
      type: activeTab,
      title: "New " + activeTab,
      status: "OPEN",
      importance: "Medium",
      author: "Current User",
      assignee: "Unassigned",
      startDate: "No Date Selected",
      endDate: "No Date Selected",
      description: "Click to edit description...",
      timeAgo: "Just now",
      comments: [],
      attachments: [],
      snapImage: "/images/bim_clash_viewport.png"
    };
    setItems([newItem, ...items]);
    
    if (onOpenInCoordination) {
      onOpenInCoordination({
        ...newItem,
        isNewAction: true
      });
      return;
    }

    setSelectedItemId(newId);
    setViewMode("workspace");
  };

  const handleAddAttachment = () => {
    if (!selectedItem) return;
    setItems(current => current.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          attachments: [
            ...item.attachments,
            { id: Date.now(), name: `Screenshot_${Math.floor(Math.random() * 1000)}.png`, size: "1.2 MB" }
          ]
        };
      }
      return item;
    }));
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedItem) return;

    const updatedItems = items.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          comments: [
            ...item.comments,
            {
              id: Date.now(),
              author: "Current User",
              text: newComment,
              timestamp: "Just now"
            }
          ]
        };
      }
      return item;
    });

    setItems(updatedItems);
    setNewComment("");
  };

  const getInitials = (name: string) => {
    return name.substring(0, 1).toUpperCase();
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] w-full bg-white overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 px-2 pt-2 shrink-0 relative">
        <button 
          onClick={() => { setActiveTab("Issues"); setSelectedItemId(null); setViewMode("table"); }}
          className={`pb-2 text-xs font-semibold tracking-wide transition-colors border-b-2 px-2 inline-flex items-center gap-1.5 ${activeTab === "Issues" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
        >
          ISSUES <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${activeTab === "Issues" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{issueCount}</span>
        </button>
        <button 
          onClick={() => { setActiveTab("RFI"); setSelectedItemId(null); setViewMode("table"); }}
          className={`pb-2 text-xs font-semibold tracking-wide transition-colors border-b-2 px-2 inline-flex items-center gap-1.5 ${activeTab === "RFI" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
        >
          RFI <span className={`rounded-full px-1.5 py-0.5 text-[9px] ${activeTab === "RFI" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>{rfiCount}</span>
        </button>

        {viewMode === "workspace" && (
          <button 
            onClick={() => { setViewMode("table"); setSelectedItemId(null); }}
            className="absolute right-4 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1 rounded-md"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Table
          </button>
        )}
      </div>

      {viewMode === "table" ? (
        <div className="flex-1 min-h-0 overflow-hidden bg-white rounded-2xl border border-gray-100 mt-4 shadow-[0_14px_42px_rgba(15,23,42,0.05)] mx-1 mb-2 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-white shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-gray-950">{activeTab} Register</h2>
                <p className="mt-0.5 text-[11px] font-medium text-gray-500">
                  {tabItems.length} total, {openCount} open, {inProgressCount} in progress, {highPriorityCount} high priority
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeTab}, assignee or ID...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3 text-xs font-medium text-gray-800 shadow-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-50"
                  />
                </div>

                <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50/80 px-2 py-1">
                  <Filter className="h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as "All" | RFIStatus)}
                    className="h-7 bg-transparent text-[11px] font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="All">All status</option>
                    <option value="OPEN">Open</option>
                    <option value="IN PROGRESS">In progress</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <span className="h-4 w-px bg-gray-200" />
                  <select
                    value={importanceFilter}
                    onChange={(event) => setImportanceFilter(event.target.value as "All" | Importance)}
                    className="h-7 bg-transparent text-[11px] font-bold text-gray-700 outline-none cursor-pointer"
                  >
                    <option value="All">All severity</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <button 
                  onClick={handleAddNewItem}
                  className="h-9 rounded-xl bg-blue-600 px-4 text-xs font-extrabold text-white shadow-sm shadow-blue-500/20 transition-colors hover:bg-blue-700 inline-flex items-center gap-2"
                >
                  <Plus className="w-3.5 h-3.5" /> New {activeTab === "Issues" ? "Issue" : "RFI"}
                </button>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[980px] text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur border-b border-gray-200 text-[10px] uppercase tracking-[0.16em] text-gray-500">
                <tr>
                  <th className="w-[120px] px-6 py-3 font-black">ID</th>
                  <th className="w-[90px] px-6 py-3 font-black">Snap</th>
                  <th className="px-6 py-3 font-black">Title</th>
                  <th className="w-[220px] px-6 py-3 font-black">Assignee</th>
                  <th className="w-[150px] px-6 py-3 font-black">Status</th>
                  <th className="w-[140px] px-6 py-3 font-black">Severity</th>
                  <th className="w-[150px] px-6 py-3 font-black">Date</th>
                  <th className="w-[70px] px-6 py-3 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {paginatedItems.map(item => {
                  const isHighPriority = item.importance === "High";

                  return (
                  <tr 
                    key={item.id} 
                    onClick={() => handleOpenItem(item)}
                    className={`group cursor-pointer transition-colors ${
                      isHighPriority
                        ? "bg-rose-50/45 hover:bg-rose-50/80"
                        : "hover:bg-blue-50/40"
                    }`}
                  >
                    <td className={`px-6 py-4 text-[11px] font-black tracking-tight ${
                      isHighPriority ? "border-l-4 border-rose-500 text-rose-600" : "border-l-4 border-transparent text-blue-600"
                    }`}>
                      <div className="flex items-center gap-2">
                        <span>{item.id}</span>
                        {isHighPriority && (
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,0.12)]" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      {item.snapImage ? (
                        <div 
                          onClick={() => setModalItem(item)}
                          className="w-12 h-8 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-blue-500 hover:scale-105 transition-all duration-200 shadow-sm relative group/snap"
                        >
                          <img 
                            src={item.snapImage} 
                            alt="Snap" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/snap:opacity-100 transition-opacity flex items-center justify-center">
                            <Maximize2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-8 rounded-lg bg-gray-50 border border-gray-150 flex items-center justify-center text-[10px] text-gray-400 font-semibold">
                          N/A
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex max-w-xl items-center gap-2">
                        <p className="min-w-0 truncate text-xs font-bold text-gray-950">{item.title}</p>
                        {isHighPriority && (
                          <span className="shrink-0 rounded-full border border-rose-200 bg-white px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.14em] text-rose-600">
                            Attention
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 max-w-xl truncate text-[10.5px] font-medium text-gray-500">{item.description}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-black">
                          {getInitials(item.assignee === "No Member assigned" ? "-" : item.assignee)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-800">{item.assignee}</p>
                          <p className="text-[9px] font-medium text-gray-400">{item.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-black px-2 py-1 rounded-md border ${
                        item.status === 'OPEN' ? 'border-amber-200 bg-amber-50 text-amber-600' : 
                        item.status === 'IN PROGRESS' ? 'border-blue-200 bg-blue-50 text-blue-600' : 
                        'border-emerald-200 bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] uppercase tracking-wider font-black px-2 py-1 rounded-md border ${
                        item.importance === 'High' ? 'border-red-200 bg-red-50 text-red-600' :
                        item.importance === 'Medium' ? 'border-gray-200 bg-gray-50 text-gray-600' :
                        'border-emerald-200 bg-emerald-50 text-emerald-600'
                      }`}>
                        {item.importance}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-gray-600 font-semibold whitespace-nowrap">
                      {item.startDate !== "No Date Selected" ? item.startDate : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-flex">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setActiveRowMenuId((current) => current === item.id ? null : item.id);
                          }}
                          className="h-8 w-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 inline-flex items-center justify-center transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {activeRowMenuId === item.id && (
                          <div className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-gray-200 bg-white p-1.5 text-left shadow-xl shadow-gray-950/10">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setActiveRowMenuId(null);
                                handleOpenItem(item);
                              }}
                              className="w-full rounded-lg px-2.5 py-2 text-[11px] font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                            >
                              Open in coordination
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleStatusChange(item.id, "IN PROGRESS");
                                setActiveRowMenuId(null);
                              }}
                              className="w-full rounded-lg px-2.5 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                            >
                              Mark in progress
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleStatusChange(item.id, "CLOSED");
                                setActiveRowMenuId(null);
                              }}
                              className="w-full rounded-lg px-2.5 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                            >
                              Close item
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredItems.length === 0 && (
              <div className="p-16 text-center">
                <FileText className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                <p className="text-xs font-bold text-gray-500">No matching items found</p>
                <p className="mt-1 text-[11px] font-medium text-gray-400">Try clearing filters or changing the search term.</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 bg-white px-5 py-3 shrink-0">
            <p className="text-[11px] font-semibold text-gray-500">
              Showing <span className="font-black text-gray-800">{visibleStart}</span>-<span className="font-black text-gray-800">{visibleEnd}</span> of <span className="font-black text-gray-800">{filteredItems.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <select
                value={rowsPerPage}
                onChange={(event) => setRowsPerPage(Number(event.target.value))}
                className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-[11px] font-bold text-gray-700 outline-none"
              >
                {[5, 8, 10, 20].map((count) => (
                  <option key={count} value={count}>{count} / page</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 inline-flex items-center justify-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-16 text-center text-[11px] font-black text-gray-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 hover:bg-gray-50 inline-flex items-center justify-center"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden mt-3 gap-3">
          
          {/* Left Sidebar - List */}
          <div className="w-[300px] flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-3 shrink-0 px-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-100 transition-colors"
                />
              </div>
              <button 
                onClick={handleAddNewItem}
                className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 pb-4">
              {filteredItems.map(item => (
                <div 
                  key={item.id}
                  onClick={() => setSelectedItemId(item.id)}
                  className={`px-3 py-3 rounded-[12px] cursor-pointer transition-all border ${
                    selectedItemId === item.id 
                    ? "bg-blue-50/50 border-blue-100 shadow-sm" 
                    : "bg-white border-gray-100 hover:bg-slate-50 hover:border-gray-200"
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex gap-2.5 w-full">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {getInitials(item.author)}
                      </div>
                      <div className="flex-1 min-w-0 pr-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-xs text-gray-900 truncate">{item.author}</h4>
                          <span className="text-[9px] text-gray-400 whitespace-nowrap ml-1.5">{item.timeAgo}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-0.5">
                          <span className="font-medium text-blue-600 tracking-tight">{item.id}</span>
                        </div>
                        
                        <p className="mt-1 text-[11px] text-gray-700 line-clamp-1 pr-1 leading-snug">
                          {item.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-1 mt-2">
                          <span className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${
                            item.status === 'OPEN' ? 'border-amber-200 bg-amber-50 text-amber-600' : 
                            item.status === 'IN PROGRESS' ? 'border-blue-200 bg-blue-50 text-blue-600' : 
                            'border-emerald-200 bg-emerald-50 text-emerald-600'
                          }`}>
                            {item.status}
                          </span>
                          
                          {item.importance && (
                            <span className={`text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${
                              item.importance === 'High' ? 'border-red-200 bg-red-50 text-red-600' : 'border-gray-200 bg-gray-50 text-gray-600'
                            }`}>
                              {item.importance}
                            </span>
                          )}
                        </div>
                        
                        {(item.startDate !== "No Date Selected" || item.endDate !== "No Date Selected") && (
                          <div className="mt-1.5 text-[9px] text-gray-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                            {item.startDate !== "No Date Selected" ? item.startDate : "-"} 
                            {' to '} 
                            {item.endDate !== "No Date Selected" ? item.endDate : "-"}
                          </div>
                        )}
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 shrink-0">
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredItems.length === 0 && (
                <div className="text-center text-xs text-gray-500 mt-10">
                  No items found.
                </div>
              )}
            </div>
          </div>

          {/* Right Detail Pane */}
          {selectedItem && (
            <div className="flex-1 flex flex-col border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm mr-2 mb-2">
              
              {/* Top Fixed Header */}
              <div className="p-5 border-b border-gray-100 shrink-0">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-base font-bold text-gray-900 tracking-tight">{selectedItem.id} , {selectedItem.title}</h2>
                      <select 
                        value={selectedItem.importance}
                        onChange={(e) => handleImportanceChange(selectedItem.id, e.target.value as Importance)}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border outline-none cursor-pointer hover:opacity-80 transition-opacity ${
                          selectedItem.importance === 'High' ? 'bg-red-50 text-red-600 border-red-100' :
                          selectedItem.importance === 'Low' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                          'bg-blue-50 text-blue-600 border-blue-100'
                        }`}
                      >
                        <option value="High">HIGH</option>
                        <option value="Medium">MEDIUM</option>
                        <option value="Low">LOW</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2.5 gap-x-8 text-xs max-w-lg">
                      <div className="flex items-center">
                        <span className="text-gray-500 w-24 shrink-0">Raised by</span>
                        <span className="text-blue-600 font-medium truncate">{selectedItem.author}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-24 shrink-0">Assigned to</span>
                        <span className="text-blue-600 font-medium truncate">{selectedItem.assignee}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-24 shrink-0">Date</span>
                        <span className="text-gray-700 truncate">{selectedItem.startDate === "No Date Selected" ? "-" : selectedItem.startDate} &nbsp; - &nbsp; {selectedItem.endDate === "No Date Selected" ? "-" : selectedItem.endDate}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 w-24 shrink-0">Status</span>
                        <select 
                          value={selectedItem.status}
                          onChange={(e) => handleStatusChange(selectedItem.id, e.target.value as RFIStatus)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider outline-none cursor-pointer border hover:opacity-80 transition-opacity ${
                            selectedItem.status === 'OPEN' ? 'border-amber-200 bg-amber-50 text-amber-600' :
                            selectedItem.status === 'IN PROGRESS' ? 'border-blue-200 bg-blue-50 text-blue-600' :
                            'border-emerald-200 bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN PROGRESS">IN PROGRESS</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Top Right Image Preview */}
                  <div 
                    onClick={() => { if (selectedItem.snapImage) setModalItem(selectedItem); }}
                    className={`w-[180px] h-[120px] shrink-0 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm overflow-hidden relative group/preview ${selectedItem.snapImage ? 'cursor-pointer hover:border-blue-500 hover:shadow-md' : ''} transition-all duration-200`}
                  >
                    {selectedItem.snapImage ? (
                      <>
                        <img 
                          src={selectedItem.snapImage} 
                          alt={selectedItem.title} 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="w-5 h-5 text-white" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                        <span className="text-gray-400 font-medium text-[10px]">Preview Unavailable</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Tabs */}
              <div className="flex items-center gap-6 border-b border-gray-100 px-6 shrink-0 bg-gray-50/50">
                <button 
                  onClick={() => setActiveDetailTab("Overview")}
                  className={`py-3 text-xs font-semibold tracking-wide transition-colors border-b-2 px-1 ${activeDetailTab === "Overview" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
                >
                  OVERVIEW
                </button>
                <button 
                  onClick={() => setActiveDetailTab("Comments")}
                  className={`py-3 text-xs font-semibold tracking-wide transition-colors border-b-2 px-1 flex items-center gap-1.5 ${activeDetailTab === "Comments" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-900"}`}
                >
                  COMMENTS
                  <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                    {selectedItem.comments.length}
                  </span>
                </button>
              </div>

              {/* Tab Content Wrappers */}
              <div className="flex-1 overflow-hidden flex flex-col relative bg-[#fafafa]/50">
                
                {/* OVERVIEW TAB */}
                {activeDetailTab === "Overview" && (
                  <div className="flex-1 overflow-y-auto p-6">
                    <div className="bg-white border text-gray-800 border-gray-100 rounded-xl p-5 shadow-sm mb-6">
                      <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wide">Issue Details</h3>
                      <div className="grid grid-cols-2 gap-y-5 gap-x-8 mb-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100/50">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-gray-500 font-semibold uppercase">Environment</span>
                          <span className="text-xs font-medium text-gray-900">Production / On-site</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-gray-500 font-semibold uppercase">Component</span>
                          <span className="text-xs font-medium text-gray-900">Structural / HVAC</span>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-gray-500 font-semibold uppercase">Labels</span>
                          <div className="flex gap-1.5 mt-0.5">
                            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded text-[9px] font-bold">Priority-1</span>
                            <span className="bg-gray-100 text-gray-700 border border-gray-200 px-1.5 py-0.5 rounded text-[9px] font-bold">Review</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] text-gray-500 font-semibold uppercase">Reporter</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[8px]">{getInitials(selectedItem.author)}</div>
                            <span className="text-xs font-medium text-gray-900">{selectedItem.author}</span>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide">Description</h3>
                      <p className="text-xs leading-relaxed">
                        {selectedItem.description || "No description provided."}
                      </p>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide">Attachments</h3>
                        <button 
                          onClick={handleAddAttachment}
                          className="w-6 h-6 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {selectedItem.attachments && selectedItem.attachments.length > 0 ? (
                         <div className="grid grid-cols-2 gap-3">
                           {selectedItem.attachments.map(att => (
                              <div key={att.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <div className="w-10 h-10 bg-red-50 text-red-500 rounded flex items-center justify-center shrink-0">
                                  <FileText className="w-5 h-5" />
                                </div>
                                <div className="truncate min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 truncate">{att.name}</p>
                                  <p className="text-[10px] text-gray-500">{att.size}</p>
                                </div>
                              </div>
                           ))}
                         </div>
                      ) : (
                        <p className="text-xs text-gray-400">No attachments yet. Click the + button to add one.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* COMMENTS TAB */}
                {activeDetailTab === "Comments" && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6">
                      {selectedItem.comments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-xs text-gray-400 font-medium">
                          <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                          No Comments yet.
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {selectedItem.comments.map(comment => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {getInitials(comment.author)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="font-semibold text-xs text-gray-900">{comment.author}</span>
                                  <span className="text-[10px] text-gray-400">{comment.timestamp}</span>
                                </div>
                                <p className="text-xs text-gray-700 bg-white border border-gray-100 shadow-sm p-3 rounded-tr-xl rounded-b-xl leading-relaxed max-w-2xl inline-block w-full">
                                  {comment.text}
                                </p>
                              </div>
                            </div>
                          ))}
                          <div ref={commentsEndRef} className="h-1" />
                        </div>
                      )}
                    </div>

                    {/* Sticky Comment Input */}
                    <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                      <div className="relative flex items-center">
                        <button className="absolute left-3 w-6 h-6 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors">
                          <Paperclip className="w-4 h-4" />
                        </button>
                        <input 
                          type="text" 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment();
                          }}
                          placeholder="Write a comment..." 
                          className="w-full pl-10 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-xs focus:outline-none focus:border-blue-400 focus:bg-white transition-all"
                        />
                        <button 
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                          className="absolute right-1.5 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          <Send className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}
        </div>
      )}
      {modalItem && modalItem.snapImage && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setModalItem(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-white rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.15)] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Title */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                  modalItem.importance === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                  modalItem.importance === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {modalItem.id}
                </span>
                <h3 className="text-xs font-bold text-slate-900">{modalItem.title}</h3>
              </div>
              <button 
                onClick={() => setModalItem(null)}
                className="w-7 h-7 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            
            {/* Image viewport */}
            <div className="p-3 bg-slate-100/50 flex items-center justify-center min-h-[300px] max-h-[70vh] border-b border-slate-100">
              <img 
                src={modalItem.snapImage} 
                alt={modalItem.title} 
                className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-sm border border-slate-200/60 bg-white"
              />
            </div>

            {/* Description footer */}
            <div className="px-5 py-4 bg-white text-slate-600 text-xs">
              <p className="font-semibold text-slate-800 mb-1">Description:</p>
              <p className="leading-relaxed text-slate-600 font-medium">{modalItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
