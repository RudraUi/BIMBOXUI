import { useState } from "react";
import { 
  Users, Search, Plus, UserPlus, FileText, 
  CheckCircle2, Clock, DollarSign, ArrowRight,
  MoreVertical, Download, Edit2, ShieldAlert,
  ChevronRight, Building, Hammer, ArrowLeft
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

type ResourceStatus = "Draft Request" | "Sourcing Quotes" | "WO Issued" | "Crew Mobilized" | "Timesheets Submitted";

type ResourceProcurement = {
  id: string;
  title: string;
  project: string;
  trade: string;
  headcount: number;
  duration: string;
  startDate: string;
  requestor: string;
  dateRequested: string;
  status: ResourceStatus;
  supplier: string | null;
  woNumber: string | null;
  mobilizationDate: string | null;
  estCost: number;
  documents: { name: string; size: string }[];
};

const DUMMY_RESOURCE_RECORDS: ResourceProcurement[] = [
  {
    id: "RR-2026-041",
    title: "Structural Steel Fixers Team",
    project: "Downtown Tower Complex",
    trade: "Steel Fixing",
    headcount: 15,
    duration: "3 Months",
    startDate: "2026-05-15",
    requestor: "Alex Morgan (Site Eng)",
    dateRequested: "2026-04-10",
    status: "Crew Mobilized",
    supplier: "PrimeBuilders Manpower",
    woNumber: "WO-PB-0992",
    mobilizationDate: "2026-05-14",
    estCost: 75000,
    documents: [{ name: "Trade_Licenses.pdf", size: "3.2 MB" }, { name: "WO_Signed.pdf", size: "1.1 MB" }]
  },
  {
    id: "RR-2026-045",
    title: "MEP Rough-in Crew",
    project: "Riverside Residential",
    trade: "Electrical",
    headcount: 8,
    duration: "6 Weeks",
    startDate: "2026-06-01",
    requestor: "Sarah Lin (MEP Lead)",
    dateRequested: "2026-04-22",
    status: "Sourcing Quotes",
    supplier: null,
    woNumber: null,
    mobilizationDate: null,
    estCost: 32000,
    documents: [{ name: "Scope_of_Work.pdf", size: "850 KB" }]
  },
  {
    id: "RR-2026-048",
    title: "Carpentry Finishers",
    project: "Tech Park Phase 2",
    trade: "Interiors / Carpentry",
    headcount: 5,
    duration: "2 Months",
    startDate: "2026-05-10",
    requestor: "Emma Richards (Interior)",
    dateRequested: "2026-04-20",
    status: "WO Issued",
    supplier: "WoodCraft Solutions",
    woNumber: "WO-WC-0034",
    mobilizationDate: "2026-05-09",
    estCost: 28000,
    documents: [{ name: "WO-WC-0034.pdf", size: "1.4 MB" }]
  }
];

export function ResourceProcurementTracker() {
  const [records, setRecords] = useState<ResourceProcurement[]>(DUMMY_RESOURCE_RECORDS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isMobilizeModalOpen, setIsMobilizeModalOpen] = useState(false);

  const filterChips = ["All", "Draft Request", "Sourcing Quotes", "WO Issued", "Crew Mobilized", "Timesheets Submitted"];

  const filteredRecords = records.filter(r => {
    const matchesStatus = selectedStatus === "All Status" || selectedStatus === "All" || r.status === selectedStatus;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.trade.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (r.supplier && r.supplier.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const selectedRecord = (selectedRecordId ? records.find(r => r.id === selectedRecordId) : null) as ResourceProcurement | null;

  const formatCurrency = (amount: number) => `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const getStatusColor = (status: ResourceStatus) => {
    switch (status) {
      case "Draft Request": return "text-gray-600 bg-gray-50 border-gray-200";
      case "Sourcing Quotes": return "text-blue-600 bg-blue-50 border-blue-200";
      case "WO Issued": return "text-purple-600 bg-purple-50 border-purple-200";
      case "Crew Mobilized": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Timesheets Submitted": return "text-indigo-600 bg-indigo-50 border-indigo-200";
    }
  };

  const getPercentageComplete = (status: ResourceStatus) => {
    switch (status) {
      case "Draft Request": return 20;
      case "Sourcing Quotes": return 40;
      case "WO Issued": return 60;
      case "Crew Mobilized": return 80;
      case "Timesheets Submitted": return 100;
    }
  };

  const updateRecordStatus = (id: string, newStatus: ResourceStatus, updates?: Partial<ResourceProcurement>) => {
    setRecords(records.map(r => r.id === id ? { ...r, status: newStatus, ...updates } : r));
  };

  const handleActionClick = (e: React.MouseEvent, id: string, action: string) => {
    e.stopPropagation();
    setSelectedRecordId(id);
    if (action === "mobilize") setIsMobilizeModalOpen(true);
    else if (action === "publish") updateRecordStatus(id, "Sourcing Quotes");
    else if (action === "issue_wo") updateRecordStatus(id, "WO Issued", { supplier: "Assigned Vendor Ltd.", woNumber: "WO-NEW-1024" });
    else if (action === "submit_timesheet") updateRecordStatus(id, "Timesheets Submitted");
  };

  return (
    <>
      {selectedRecord ? (
        /* DETAILS VIEW */
        <div className="flex flex-col h-full w-full overflow-hidden animate-in slide-in-from-right-4 duration-300 bg-white">
          <div className="flex items-center justify-between mt-2 mb-8 px-2 border-b border-gray-100 pb-6 shrink-0">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setSelectedRecordId(null)} 
                 className="p-2 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all text-gray-500 shadow-sm"
               >
                 <ArrowLeft className="w-5 h-5" />
               </button>
               <div>
                 <div className="flex items-center gap-3 relative">
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">{selectedRecord.title}</h2>
                   <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-full border ${getStatusColor(selectedRecord.status)}`}>
                     {selectedRecord.status}
                   </span>
                 </div>
                 <p className="text-sm font-medium text-gray-500 mt-1 flex items-center gap-2">
                   <span className="font-bold text-indigo-600 tracking-tight">{selectedRecord.id}</span>
                   <span>•</span>
                   <Hammer className="w-3.5 h-3.5" /> {selectedRecord.trade}
                 </p>
               </div>
            </div>
            
            <div className="flex items-center gap-3">
               <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
                 <Download className="w-4 h-4" /> Export Team Folio
               </button>
               {selectedRecord.status === "Draft Request" && (
                 <button onClick={() => updateRecordStatus(selectedRecord.id, "Sourcing Quotes")} className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2">
                   <FileText className="w-4 h-4" /> Publish to Vendors
                 </button>
               )}
               {selectedRecord.status === "Sourcing Quotes" && (
                 <button onClick={() => updateRecordStatus(selectedRecord.id, "WO Issued", { supplier: "Assigned Vendor Ltd.", woNumber: "WO-NEW-1024" })} className="px-5 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
                   <DollarSign className="w-4 h-4" /> Issue Work Order
                 </button>
               )}
               {selectedRecord.status === "WO Issued" && (
                 <button onClick={() => setIsMobilizeModalOpen(true)} className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2">
                   <UserPlus className="w-4 h-4" /> Log Mobilization
                 </button>
               )}
               {selectedRecord.status === "Crew Mobilized" && (
                 <button onClick={() => updateRecordStatus(selectedRecord.id, "Timesheets Submitted")} className="px-5 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-purple-700 transition-colors flex items-center gap-2">
                   <Clock className="w-4 h-4" /> Submit Timesheets
                 </button>
               )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 pb-10 flex gap-8">
            <div className="flex-1 max-w-4xl space-y-8">

              <div className="grid grid-cols-4 gap-4">
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Project</span>
                    <span className="text-sm font-bold text-gray-900 mt-1 block flex items-start gap-2"><Building className="w-4 h-4 text-gray-400 shrink-0"/> {selectedRecord.project}</span>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Est. Budget</span>
                    <span className="text-xl font-black text-emerald-600 mt-1 block">{formatCurrency(selectedRecord.estCost)}</span>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Headcount</span>
                    <span className="text-xl font-black text-blue-600 mt-1 block">{selectedRecord.headcount} Pax</span>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">Duration</span>
                    <span className="text-sm font-black text-gray-900 mt-1 block mt-2">{selectedRecord.duration}</span>
                 </div>
              </div>

               <div>
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" /> Procurement Documents
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRecord.documents.map((doc, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition-shadow bg-white group cursor-pointer">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-lg">
                             <FileText className="w-5 h-5" />
                           </div>
                           <div>
                             <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{doc.name}</p>
                             <p className="text-xs text-gray-500 mt-0.5">{doc.size}</p>
                           </div>
                        </div>
                        <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-100 rounded-lg">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {selectedRecord.documents.length === 0 && (
                      <div className="col-span-2 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-sm font-medium text-gray-500">
                         No documents attached to this record.
                      </div>
                    )}
                  </div>
               </div>

            </div>

            <div className="w-[320px] shrink-0 space-y-6">
                 
               <div className="border border-gray-200 rounded-2xl p-5 bg-[#fafafa]">
                   <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Lifecycle Progress</h3>
                   <div className="space-y-4 relative">
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gray-200 z-0"></div>
                      
                      {["Draft Request", "Sourcing Quotes", "WO Issued", "Crew Mobilized", "Timesheets Submitted"].map((step, idx) => {
                         const progress = getPercentageComplete(selectedRecord.status);
                         const stepVals = [20, 40, 60, 80, 100];
                         const isPast = progress >= stepVals[idx];
                         const isCurrent = progress === stepVals[idx];

                         return (
                           <div key={step} className="flex gap-4 relative z-10">
                             <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors duration-500 ${isPast ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 text-transparent'}`}>
                               {isPast && <CheckCircle2 className="w-3 h-3" />}
                             </div>
                             <div className={isCurrent ? 'opacity-100' : isPast ? 'opacity-70' : 'opacity-40'}>
                               <p className={`text-sm font-bold ${isPast ? 'text-gray-900' : 'text-gray-500'}`}>{step}</p>
                               {isCurrent && <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase tracking-widest">Current Stage</p>}
                             </div>
                           </div>
                         )
                      })}
                   </div>
               </div>

               <div className="border border-blue-100 rounded-2xl p-5 bg-blue-50/30">
                   <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Supplier Information</h3>
                   {selectedRecord.supplier ? (
                     <>
                       <p className="text-base font-black text-gray-900 mb-1">{selectedRecord.supplier}</p>
                       <p className="text-xs font-bold text-indigo-600 mb-4">{selectedRecord.woNumber || "Awaiting WO"}</p>
                       <div className="flex flex-col gap-3 pt-4 border-t border-blue-100/50">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Start Date</span>
                            <span className="text-xs font-black text-gray-900">{selectedRecord.startDate}</span>
                          </div>
                          {selectedRecord.mobilizationDate && (
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Mobilized</span>
                              <span className="text-xs font-black text-emerald-600">{selectedRecord.mobilizationDate}</span>
                            </div>
                          )}
                       </div>
                     </>
                   ) : (
                     <p className="text-sm font-medium text-gray-500 italic">No supplier assigned yet. Open for bids.</p>
                   )}
               </div>

            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-300">
          
          <div className="flex items-center justify-between mt-1 mb-4 px-1 shrink-0">
            <div>
               <div className="flex items-center gap-2">
                 <h2 className="text-xl font-bold text-gray-900 tracking-tight">Resource Procurement</h2>
                 <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Teams & Manpower Flow</span>
               </div>
               <p className="text-xs text-gray-500 mt-1 font-medium">Source labor crews, subcontractors, and manage work orders & mobilization.</p>
            </div>
            <button 
              onClick={() => setIsNewRequestModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm">
              <Plus className="w-3.5 h-3.5" /> Request Manpower
            </button>
          </div>

          <div className="mb-3 flex flex-wrap gap-2 px-1 shrink-0">
            {filterChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedStatus(chip)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors font-semibold ${
                  selectedStatus === chip || (selectedStatus === "All Status" && chip === "All")
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-950 hover:bg-gray-50"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="flex flex-1 overflow-hidden gap-4 pb-2">
            <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
                 <div className="relative w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search labor trades, requests, or suppliers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors bg-white shadow-sm"
                    />
                  </div>
              </div>
              
              <div className="flex-1 overflow-auto bg-gray-50/20">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-500 z-10 shadow-sm shadow-gray-100/50 font-bold whitespace-nowrap">
                    <tr>
                      <th className="px-4 py-3">Req. No</th>
                      <th className="px-4 py-3">Crew Scope</th>
                      <th className="px-4 py-3">Supplier / WO</th>
                      <th className="px-4 py-3">Deployment</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {filteredRecords.map(r => (
                      <tr 
                        key={r.id} 
                        onClick={() => setSelectedRecordId(r.id)}
                        className={`cursor-pointer transition-colors ${selectedRecordId === r.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                      >
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-bold text-indigo-700 tracking-tight block">{r.id}</span>
                          <p className="text-[10px] text-gray-500 font-semibold mt-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" /> Req: {r.dateRequested}
                          </p>
                        </td>
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <p className="text-xs font-bold text-gray-900 truncate">{r.title}</p>
                          <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-gray-500 truncate">
                             <Hammer className="w-3 h-3 text-gray-400 shrink-0" />
                             <span className="truncate">{r.trade}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 max-w-[150px]">
                          {r.supplier ? (
                            <>
                              <p className="text-xs font-bold text-gray-900 truncate">{r.supplier}</p>
                              <p className="text-[10px] text-gray-500 font-bold tracking-tight mt-1">{r.woNumber}</p>
                            </>
                          ) : (
                            <span className="text-[10px] text-gray-400 font-bold italic bg-gray-50 px-2 py-0.5 rounded border border-gray-100">Pending Bids...</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-black text-gray-900 whitespace-nowrap">
                            {r.headcount} Pax
                          </span>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1 whitespace-nowrap">{r.duration} @ {r.startDate}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded border ${getStatusColor(r.status)}`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button onClick={(e) => e.stopPropagation()} className="p-1 rounded hover:bg-gray-200 text-gray-500 transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 z-50">
                              {r.status === "Draft Request" && (
                                 <DropdownMenuItem onClick={(e) => handleActionClick(e, r.id, "publish")} className="font-bold text-indigo-700 focus:bg-indigo-50 cursor-pointer">
                                   <FileText className="w-3.5 h-3.5 mr-2" /> Publish to Vendors
                                 </DropdownMenuItem>
                              )}
                              {r.status === "Sourcing Quotes" && (
                                 <DropdownMenuItem onClick={(e) => handleActionClick(e, r.id, "issue_wo")} className="font-bold text-blue-700 focus:bg-blue-50 cursor-pointer">
                                   <DollarSign className="w-3.5 h-3.5 mr-2" /> Issue Work Order
                                 </DropdownMenuItem>
                              )}
                              {r.status === "WO Issued" && (
                                 <DropdownMenuItem onClick={(e) => handleActionClick(e, r.id, "mobilize")} className="font-bold text-emerald-700 focus:bg-emerald-50 cursor-pointer">
                                   <UserPlus className="w-3.5 h-3.5 mr-2" /> Log Mobilization
                                 </DropdownMenuItem>
                              )}
                              {r.status === "Crew Mobilized" && (
                                 <DropdownMenuItem onClick={(e) => handleActionClick(e, r.id, "submit_timesheet")} className="font-bold text-purple-700 focus:bg-purple-50 cursor-pointer">
                                   <Clock className="w-3.5 h-3.5 mr-2" /> Submit Timesheets
                                 </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={(e) => handleActionClick(e, r.id, "edit")}>
                                <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GLOBAL MODALS */}
      <Dialog open={isMobilizeModalOpen} onOpenChange={setIsMobilizeModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800"><UserPlus className="w-5 h-5 text-emerald-600" /> Fleet/Crew Arrival & Mobilization</DialogTitle>
            <DialogDescription>
              Confirm the physical arrival and inductions for the selected team scope.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-4 flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Work Order</p>
                   <p className="text-sm font-black text-emerald-900">{selectedRecord?.woNumber}</p>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Expected Headcount</p>
                   <p className="text-sm font-black text-emerald-900">{selectedRecord?.headcount} Pax</p>
                </div>
             </div>
             <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Actual Arrival Date</label>
                  <input type="date" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-medium" />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Safety Inductions Cleared</label>
                  <div className="flex items-center gap-2">
                     <input type="number" defaultValue={selectedRecord?.headcount} className="w-24 border border-emerald-200 bg-emerald-50/50 rounded-md px-3 py-2 text-sm font-bold text-emerald-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-center" />
                     <span className="text-xs text-gray-500 font-medium tracking-tight">workers successfully inducted onto the site.</span>
                  </div>
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">Gate Passes / Visas Upload</label>
                  <div className="border border-dashed border-gray-300 rounded-lg p-3 flex items-center gap-3 bg-gray-50 cursor-pointer">
                     <FileText className="w-5 h-5 text-gray-400 shrink-0" />
                     <div>
                       <p className="text-xs font-bold text-gray-600">Upload bulk worker documentation</p>
                       <p className="text-[10px] text-gray-400">Excel or PDF ZIP allowed</p>
                     </div>
                  </div>
               </div>
             </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsMobilizeModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider">Cancel</button>
            <button onClick={() => {
              if (selectedRecordId) {
                updateRecordStatus(selectedRecordId, "Crew Mobilized", { mobilizationDate: new Date().toISOString().split("T")[0] });
              }
              setIsMobilizeModalOpen(false);
            }} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm uppercase tracking-wider flex items-center gap-1.5">
              Confirm Mobilization <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Request Modal */}
      <Dialog open={isNewRequestModalOpen} onOpenChange={setIsNewRequestModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request New Manpower/Resources</DialogTitle>
            <DialogDescription>
              Submit a request for subcontractor or labor provisioning.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 grid gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Request Title / Team Role</label>
              <input type="text" placeholder="E.g., Painters, Scaffolding Crew..." className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Project</label>
                <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium bg-white">
                  <option>Downtown Tower Complex</option>
                  <option>Riverside Residential</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Trade</label>
                <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium bg-white">
                  <option>Carpentry</option>
                  <option>Electrical</option>
                  <option>Steel Fixing</option>
                  <option>Masonry</option>
                  <option>General Labor</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 relative">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Required Headcount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">Pax</span>
                  <input type="number" className="w-full border border-gray-200 rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" placeholder="10" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Expected Start Date</label>
                <input type="date" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium bg-white" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Estimated Duration</label>
              <input type="text" placeholder="E.g., 2 Months, 6 Weeks" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsNewRequestModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider">Discard</button>
            <button onClick={() => {
              const newReq: ResourceProcurement = {
                id: `RR-2026-0${records.length + 50}`,
                title: "New Resource Request",
                project: "Downtown Tower Complex",
                trade: "General Labor",
                headcount: 10,
                duration: "1 Month",
                startDate: new Date().toISOString().split("T")[0],
                requestor: "Current User",
                dateRequested: new Date().toISOString().split("T")[0],
                status: "Draft Request",
                supplier: null,
                woNumber: null,
                mobilizationDate: null,
                estCost: 15000,
                documents: []
              };
              setRecords([newReq, ...records]);
              setIsNewRequestModalOpen(false);
            }} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 shadow-sm uppercase tracking-wider flex items-center gap-1.5">
              Publish Source Request <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
