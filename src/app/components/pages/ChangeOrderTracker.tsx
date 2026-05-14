import { useState } from "react";
import { 
  FileEdit, AlertTriangle, CheckCircle2, 
  Search, Filter, Download, Plus, MoreVertical,
  Layers, FileText, Edit2, Trash2, DollarSign,
  Clock, XCircle, FilePlus
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

type ChangeOrderStatus = "Approved" | "Pending" | "Under Review" | "Rejected";
type ChangeOrderType = "Client Change" | "Design Revision" | "Unforeseen Condition" | "Scope Change";

type ChangeOrder = {
  id: string;
  title: string;
  contractor: string;
  type: ChangeOrderType;
  project: string;
  dateRaised: string;
  costImpact: number;
  scheduleImpact: number; // in days
  status: ChangeOrderStatus;
  description: string;
  documents: { name: string; size: string }[];
};

const DUMMY_CHANGE_ORDERS: ChangeOrder[] = [
  {
    id: "CO-001",
    title: "Additional Foundation Reinforcement",
    contractor: "Earthworks Co.",
    type: "Unforeseen Condition",
    project: "Downtown Tower Complex",
    dateRaised: "2026-02-10",
    costImpact: 25000,
    scheduleImpact: 4,
    status: "Approved",
    description: "Poor soil bearing capacity discovered during excavation required deeper piles and extra rebar.",
    documents: [{ name: "Soil_Report_v2.pdf", size: "2.4 MB" }, { name: "Revised_Drawings.pdf", size: "8.1 MB" }]
  },
  {
    id: "CO-002",
    title: "Premium Facade Material Upgrade",
    contractor: "GlassClad Systems",
    type: "Client Change",
    project: "Riverside Residential",
    dateRaised: "2026-03-05",
    costImpact: 145000,
    scheduleImpact: 12,
    status: "Pending",
    description: "Client requested upgrade from standard aluminum composite panels to custom insulated glass units.",
    documents: [{ name: "Client_Email.eml", size: "120 KB" }, { name: "Supplier_Quote.pdf", size: "1.1 MB" }]
  },
  {
    id: "CO-003",
    title: "HVAC Duct Rerouting - Level 4",
    contractor: "AeroDuct Services",
    type: "Design Revision",
    project: "Downtown Tower Complex",
    dateRaised: "2026-04-12",
    costImpact: 8500,
    scheduleImpact: 2,
    status: "Under Review",
    description: "Clash detection in BIM model showed conflict between primary HVAC duct and sprinkler main line.",
    documents: [{ name: "Clash_Report_L4.pdf", size: "4.5 MB" }]
  },
  {
    id: "CO-004",
    title: "Lobby Lighting Fixture Change",
    contractor: "BrightElectric",
    type: "Client Change",
    project: "Tech Park Phase 2",
    dateRaised: "2026-04-20",
    costImpact: -4000,
    scheduleImpact: 0,
    status: "Approved",
    description: "Change in lobby lighting specification to locally sourced LED pendants to save cost.",
    documents: [{ name: "Lighting_Spec_Rev1.pdf", size: "3.2 MB" }]
  },
  {
    id: "CO-005",
    title: "Basement Waterproofing Extent",
    contractor: "AquaSeal Solutions",
    type: "Scope Change",
    project: "Riverside Residential",
    dateRaised: "2026-05-01",
    costImpact: 12000,
    scheduleImpact: 3,
    status: "Rejected",
    description: "Contractor proposed extended waterproofing to column pit bases, deemed unnecessary by consultant.",
    documents: [{ name: "Consultant_Memo.pdf", size: "800 KB" }]
  }
];

export function ChangeOrderTracker() {
  const [orders, setOrders] = useState<ChangeOrder[]>(DUMMY_CHANGE_ORDERS);
  const [dataWorkspaceProject, setDataWorkspaceProject] = useState("All Projects");
  const [dataWorkspaceChip, setDataWorkspaceChip] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isEditOrderModalOpen, setIsEditOrderModalOpen] = useState(false);
  const [isViewDocsModalOpen, setIsViewDocsModalOpen] = useState(false);
  
  const allStatuses = ["All Status", "Approved", "Pending", "Under Review", "Rejected"];
  const chips = ["All", "Client Change", "Design Revision", "Cost impact", "Approved", "Pending"];
  
  const filteredOrders = orders.filter(co => {
    const matchesStatus = selectedStatus === "All Status" || co.status === selectedStatus;
    const matchesSearch = co.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          co.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          co.contractor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = dataWorkspaceProject === "All Projects" || co.project === dataWorkspaceProject;
    
    let matchesChip = true;
    if (dataWorkspaceChip === "Client Change") matchesChip = co.type === "Client Change";
    if (dataWorkspaceChip === "Design Revision") matchesChip = co.type === "Design Revision";
    if (dataWorkspaceChip === "Cost impact") matchesChip = co.costImpact !== 0;
    if (dataWorkspaceChip === "Approved") matchesChip = co.status === "Approved";
    if (dataWorkspaceChip === "Pending") matchesChip = co.status === "Pending";

    return matchesStatus && matchesSearch && matchesProject && matchesChip;
  });

  const selectedOrder = selectedOrderId ? orders.find(co => co.id === selectedOrderId) : null;

  const getStatusColor = (status: ChangeOrderStatus) => {
    switch (status) {
      case "Approved": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Pending": return "text-amber-600 bg-amber-50 border-amber-200";
      case "Under Review": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Rejected": return "text-red-600 bg-red-50 border-red-200";
    }
  };

  const getStatusIcon = (status: ChangeOrderStatus) => {
    switch (status) {
      case "Approved": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "Pending": return <Clock className="w-4 h-4 text-amber-500" />;
      case "Under Review": return <Search className="w-4 h-4 text-blue-500" />;
      case "Rejected": return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    const sign = amount < 0 ? "-" : "+";
    return `${sign}$${Math.abs(amount).toLocaleString()}`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full overflow-hidden animate-in fade-in duration-300">
      
      {/* Dynamic Header */}
      <div className="flex items-start gap-5 pt-1">
        <div className="min-w-0 flex-1 transition-all duration-300">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-3">
              <select
                value={dataWorkspaceProject}
                onChange={(event) => setDataWorkspaceProject(event.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-gray-900"
              >
                <option value="All Projects">All Projects</option>
                <option value="Downtown Tower Complex">Downtown Tower Complex</option>
                <option value="Riverside Residential">Riverside Residential</option>
                <option value="Tech Park Phase 2">Tech Park Phase 2</option>
              </select>
              <p className="text-sm text-gray-500">Variation and revision records</p>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2 px-1">
            {chips.map((chip) => (
              <button
                key={chip}
                onClick={() => setDataWorkspaceChip(chip)}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                  dataWorkspaceChip === chip
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-950"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Stats Bar */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4 shrink-0 px-5 flex justify-between items-center">
        <div className="flex gap-8">
           <div className="flex flex-col">
             <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Total COs</span>
             <span className="text-lg font-black text-gray-900">{orders.length}</span>
           </div>
           <div className="w-px h-10 bg-gray-100"></div>
           <div className="flex flex-col">
             <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Pending Value</span>
             <span className="text-lg font-black text-amber-600">
                ${orders.filter(o => o.status === "Pending" || o.status === "Under Review").reduce((sum, o) => sum + o.costImpact, 0).toLocaleString()}
             </span>
           </div>
           <div className="w-px h-10 bg-gray-100"></div>
           <div className="flex flex-col">
             <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">Approved Value</span>
             <span className="text-lg font-black text-emerald-600">
                ${orders.filter(o => o.status === "Approved").reduce((sum, o) => sum + o.costImpact, 0).toLocaleString()}
             </span>
           </div>
        </div>
        <button 
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] uppercase tracking-wider font-bold hover:bg-gray-800 transition-colors shadow-sm shrink-0">
          <Plus className="w-3.5 h-3.5" /> Start Change Order
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden gap-4 px-1 pb-2">
        {/* Main Master Table Area */}
        <div className="flex-1 flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Table Header Controls */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search change orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors bg-white shadow-sm"
                />
              </div>
              <div className="relative">
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-xs font-semibold focus:outline-none focus:border-gray-300 shadow-sm transition-colors cursor-pointer"
                >
                  {allStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Export Log
              </button>
            </div>
          </div>

          {/* Master Table */}
          <div className="flex-1 overflow-auto bg-gray-50/20">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-400 z-10 shadow-sm shadow-gray-100/50">
                <tr>
                  <th className="px-5 py-3 font-bold">CO No. / Type</th>
                  <th className="px-5 py-3 font-bold">Details</th>
                  <th className="px-5 py-3 font-bold">Impact (Cost & Schedule)</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredOrders.map(co => (
                  <tr 
                    key={co.id} 
                    onClick={() => setSelectedOrderId(co.id)}
                    className={`cursor-pointer transition-colors ${selectedOrderId === co.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-bold text-gray-900 tracking-tight block">{co.id}</span>
                      <p className="text-[9px] text-indigo-600 font-semibold uppercase tracking-wider mt-1 border border-indigo-100 bg-indigo-50 px-1.5 py-0.5 rounded inline-block truncate max-w-[120px]">
                        {co.type}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-gray-900">{co.title}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                         <Layers className="w-3 h-3 text-gray-400" />
                         <span className="text-[10px] font-semibold text-gray-600">{co.contractor}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1.5">
                         <div className="flex items-center gap-1.5 text-[11px] font-bold">
                           <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                           <span className={co.costImpact > 0 ? "text-amber-600" : co.costImpact < 0 ? "text-emerald-600" : "text-gray-500"}>
                             {formatCurrency(co.costImpact)}
                           </span>
                         </div>
                         <div className="flex items-center gap-1.5 text-[11px] font-bold">
                           <Clock className="w-3.5 h-3.5 text-gray-400" />
                           <span className={co.scheduleImpact > 0 ? "text-amber-600" : "text-gray-500"}>
                             {co.scheduleImpact > 0 ? `+${co.scheduleImpact} Days` : "No Delay"}
                           </span>
                         </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${getStatusColor(co.status)}`}>
                        {getStatusIcon(co.status)}
                        {co.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button onClick={(e) => e.stopPropagation()} className="text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-md hover:bg-gray-100 outline-none">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedOrderId(co.id); setIsEditOrderModalOpen(true); }}>
                            <Edit2 className="w-3.5 h-3.5 mr-2 text-gray-500" /> Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedOrderId(co.id); setIsViewDocsModalOpen(true); }}>
                            <FileText className="w-3.5 h-3.5 mr-2 text-gray-500" /> View Documents
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete CO
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredOrders.length === 0 && (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <FileEdit className="w-12 h-12 text-gray-200 mb-4" />
                <h4 className="text-sm font-bold text-gray-400">No change orders found.</h4>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        {selectedOrder && (
          <div className="w-[500px] shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/30">
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center gap-1.5 text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
                <button onClick={() => setSelectedOrderId(null)} className="text-gray-400 hover:text-gray-900 transition-colors text-[10px] font-semibold">
                  Close
                </button>
              </div>
              <h2 className="text-base font-bold text-gray-900 leading-tight tracking-tight mb-2">
                {selectedOrder.title}
              </h2>
              <p className="text-[10px] text-blue-600 font-bold mb-4 bg-blue-50 border border-blue-100 inline-block px-1.5 py-0.5 rounded-md">
                {selectedOrder.id} • {selectedOrder.type}
              </p>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Cost Impact</span>
                     <span className={`text-[12px] font-black ${selectedOrder.costImpact > 0 ? "text-amber-600" : selectedOrder.costImpact < 0 ? "text-emerald-600" : "text-gray-900"}`}>
                        {formatCurrency(selectedOrder.costImpact)}
                     </span>
                   </div>
                   <div>
                     <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Schedule Delay</span>
                     <span className={`text-[12px] font-black ${selectedOrder.scheduleImpact > 0 ? "text-amber-600" : "text-gray-900"}`}>
                        {selectedOrder.scheduleImpact > 0 ? `+${selectedOrder.scheduleImpact} Days` : "None"}
                     </span>
                   </div>
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-[#fafafa]/50">
              
              <div className="mb-6">
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Originator</h3>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {selectedOrder.contractor.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-900">{selectedOrder.contractor}</p>
                      <p className="text-[9px] font-medium text-gray-500">Sub-Contractor Tier 1</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Date Raised</span>
                    <span className="text-[10px] font-bold text-gray-900">{selectedOrder.dateRaised}</span>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                 <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Description of Change</h3>
                 <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-sm">
                   <p className="text-[11px] text-gray-700 leading-relaxed font-medium">
                     {selectedOrder.description}
                   </p>
                 </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Supporting Documents</h3>
                  <button className="text-[9px] font-bold text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors flex items-center gap-1">
                    <FilePlus className="w-3 h-3" /> Add
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  {selectedOrder.documents.map((doc, idx) => (
                    <div key={idx} className="border border-gray-200 bg-white rounded-lg p-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                       <div className="p-1.5 bg-gray-100 rounded-md shrink-0">
                          <FileText className="w-3.5 h-3.5 text-gray-500" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold text-gray-900 truncate">{doc.name}</p>
                          <p className="text-[8px] text-gray-400 mt-0.5">{doc.size}</p>
                       </div>
                       <Download className="w-3.5 h-3.5 text-gray-400 hover:text-gray-900 transition-colors" />
                    </div>
                  ))}
                  {selectedOrder.documents.length === 0 && (
                    <p className="text-[10px] text-gray-400 font-medium italic text-center py-4 bg-white border border-dashed border-gray-200 rounded-lg">No documents attached.</p>
                  )}
                </div>
              </div>

            </div>
            
            {/* Action Footer for Right Pane */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0">
               {selectedOrder.status === "Pending" || selectedOrder.status === "Under Review" ? (
                 <div className="flex gap-3">
                    <button className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm hover:bg-emerald-700 transition-colors border border-transparent">
                      Approve Order
                    </button>
                    <button className="flex-1 py-2 bg-white text-red-600 border border-red-200 font-bold text-xs rounded-lg shadow-sm hover:bg-red-50 transition-colors">
                      Reject Order
                    </button>
                 </div>
               ) : (
                 <button className="w-full py-2 bg-white border border-gray-200 text-gray-700 font-bold text-xs rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                   View Internal Approval Trail
                 </button>
               )}
            </div>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Raise Change Order</DialogTitle>
            <DialogDescription>
              Submit a formal request for variance in scope, cost, or time.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">CO Title</label>
              <input type="text" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" placeholder="Brief description of change..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Related Contractor</label>
                 <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium text-gray-600">
                    <option>Earthworks Co.</option>
                    <option>GlassClad Systems</option>
                    <option>AeroDuct Services</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Type</label>
                 <select className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium text-gray-600">
                    <option>Client Change</option>
                    <option>Design Revision</option>
                    <option>Unforeseen Condition</option>
                    <option>Scope Change</option>
                 </select>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2 relative">
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cost Impact</label>
                 <div className="relative">
                   <DollarSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                   <input type="number" className="w-full border border-gray-200 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" placeholder="0.00" />
                 </div>
               </div>
               <div className="space-y-2 relative">
                 <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Schedule Impact</label>
                 <div className="relative flex items-center">
                   <input type="number" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" placeholder="0" />
                   <span className="absolute right-3 text-xs text-gray-400 font-bold">Days</span>
                 </div>
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Detailed Description</label>
              <textarea className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium resize-none h-20" placeholder="Provide justification and context..."></textarea>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsNewOrderModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider">Cancel</button>
            <button onClick={() => setIsNewOrderModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm uppercase tracking-wider flex items-center gap-1.5">
              Submit CO Flow <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Order Modal */}
      {selectedOrder && (
        <Dialog open={isEditOrderModalOpen} onOpenChange={setIsEditOrderModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Change Order {selectedOrder.id}</DialogTitle>
              <DialogDescription>
                Modify the details, scope, or cost impact.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">CO Title</label>
                <input type="text" defaultValue={selectedOrder.title} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Related Contractor</label>
                  <select defaultValue={selectedOrder.contractor} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium text-gray-600">
                      <option>Earthworks Co.</option>
                      <option>GlassClad Systems</option>
                      <option>AeroDuct Services</option>
                      <option>BrightElectric</option>
                      <option>AquaSeal Solutions</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Type</label>
                  <select defaultValue={selectedOrder.type} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium text-gray-600">
                      <option>Client Change</option>
                      <option>Design Revision</option>
                      <option>Unforeseen Condition</option>
                      <option>Scope Change</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Cost Impact</label>
                  <div className="relative">
                    <DollarSign className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="number" defaultValue={selectedOrder.costImpact} className="w-full border border-gray-200 rounded-md pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" />
                  </div>
                </div>
                <div className="space-y-2 relative">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Schedule Impact</label>
                  <div className="relative flex items-center">
                    <input type="number" defaultValue={selectedOrder.scheduleImpact} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium" />
                    <span className="absolute right-3 text-xs text-gray-400 font-bold">Days</span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Detailed Description</label>
                <textarea defaultValue={selectedOrder.description} className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-medium resize-none h-20"></textarea>
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setIsEditOrderModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 uppercase tracking-wider">Cancel</button>
              <button onClick={() => setIsEditOrderModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm uppercase tracking-wider flex items-center gap-1.5">
                Save Changes <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Documents Modal */}
      {selectedOrder && (
        <Dialog open={isViewDocsModalOpen} onOpenChange={setIsViewDocsModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Documents for {selectedOrder.id}</DialogTitle>
              <DialogDescription>
                View all supporting files and references for this change order.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                {selectedOrder.documents.map((doc, idx) => (
                  <div key={idx} className="border border-gray-200 bg-white rounded-lg p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors shadow-sm">
                      <div className="p-2 bg-gray-100 rounded-md shrink-0">
                        <FileText className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{doc.name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{doc.size}</p>
                      </div>
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                  </div>
                ))}
                {selectedOrder.documents.length === 0 && (
                  <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-500">No documents attached.</p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <button onClick={() => setIsViewDocsModalOpen(false)} className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 shadow-sm tracking-wider">
                Close
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
}
