import { useState } from "react";
import { 
  Calendar, Clock, AlertTriangle, CheckCircle2, 
  BarChart2, Filter, Download, Plus, Search, 
  MoreVertical, Layers, Activity, FileText, Edit2, Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

type TaskStatus = "On Track" | "Delayed" | "Critical" | "Completed";

type ScheduleTask = {
  id: string;
  name: string;
  phase: string;
  contractor: string;
  startDate: string;
  endDate: string;
  duration: number; // in days
  progress: number;
  status: TaskStatus;
  dependencies: string[];
};

const DUMMY_TASKS: ScheduleTask[] = [
  {
    id: "TSK-001",
    name: "Site Clearing and Leveling",
    phase: "Phase 1: Foundation",
    contractor: "Earthworks Co.",
    startDate: "2026-01-10",
    endDate: "2026-01-25",
    duration: 15,
    progress: 100,
    status: "Completed",
    dependencies: [],
  },
  {
    id: "TSK-002",
    name: "Excavation and Shoring",
    phase: "Phase 1: Foundation",
    contractor: "DeepDig Excavations",
    startDate: "2026-01-26",
    endDate: "2026-02-15",
    duration: 20,
    progress: 100,
    status: "Completed",
    dependencies: ["TSK-001"],
  },
  {
    id: "TSK-003",
    name: "Concrete Pouring - Main Raft",
    phase: "Phase 1: Foundation",
    contractor: "SolidCast Concrete",
    startDate: "2026-02-16",
    endDate: "2026-03-05",
    duration: 18,
    progress: 80,
    status: "On Track",
    dependencies: ["TSK-002"],
  },
  {
    id: "TSK-004",
    name: "Basement Waterproofing",
    phase: "Phase 1: Foundation",
    contractor: "AquaSeal Solutions",
    startDate: "2026-02-28",
    endDate: "2026-03-10",
    duration: 11,
    progress: 45,
    status: "Delayed",
    dependencies: ["TSK-003"],
  },
  {
    id: "TSK-005",
    name: "Structural Columns - Lower Levels",
    phase: "Phase 2: Superstructure",
    contractor: "Skyline Erectors",
    startDate: "2026-03-15",
    endDate: "2026-04-15",
    duration: 30,
    progress: 10,
    status: "Critical",
    dependencies: ["TSK-003"],
  },
  {
    id: "TSK-006",
    name: "Slab Framework and Reinforcement",
    phase: "Phase 2: Superstructure",
    contractor: "Skyline Erectors",
    startDate: "2026-04-05",
    endDate: "2026-05-10",
    duration: 35,
    progress: 0,
    status: "On Track",
    dependencies: ["TSK-005"],
  },
  {
    id: "TSK-007",
    name: "Main Exterior Facade Panel Sync",
    phase: "Phase 2: Superstructure",
    contractor: "GlassClad Systems",
    startDate: "2026-05-15",
    endDate: "2026-07-20",
    duration: 65,
    progress: 0,
    status: "On Track",
    dependencies: ["TSK-006"],
  },
  {
    id: "TSK-008",
    name: "Primary HVAC Ducting - Risers",
    phase: "Phase 3: MEP",
    contractor: "AeroDuct Services",
    startDate: "2026-04-20",
    endDate: "2026-06-15",
    duration: 55,
    progress: 0,
    status: "Critical",
    dependencies: ["TSK-005"],
  }
];

export function SchedulingTracker() {
  const [tasks, setTasks] = useState<ScheduleTask[]>(DUMMY_TASKS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("All Phases");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  
  const actualPhases = Array.from(new Set(tasks.map(t => t.phase)));
  const phases = ["All Phases", ...actualPhases];
  
  const filteredTasks = tasks.filter(t => 
    (selectedPhase === "All Phases" || t.phase === selectedPhase) &&
    (t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.contractor.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "On Track": return "text-emerald-600 bg-emerald-50 border-emerald-200";
      case "Delayed": return "text-amber-600 bg-amber-50 border-amber-200";
      case "Critical": return "text-red-600 bg-red-50 border-red-200";
      case "Completed": return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case "On Track": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "Delayed": return <Clock className="w-4 h-4 text-amber-500" />;
      case "Critical": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "Completed": return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full overflow-hidden animate-in fade-in duration-300">
      
      {/* Phase Milestones Stepper */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm mb-4 shrink-0 px-5 mt-2 flex items-center justify-between">
        <div className="flex-1 flex items-center overflow-x-auto no-scrollbar pr-4">
           {actualPhases.map((phase, idx) => {
              const phaseTasks = tasks.filter(t => t.phase === phase);
              const totalProgress = phaseTasks.length ? Math.round(phaseTasks.reduce((acc, t) => acc + t.progress, 0) / phaseTasks.length) : 0;
              const isCompleted = totalProgress === 100;
              const isFirst = idx === 0;

              return (
                <div key={phase} className="flex items-center min-w-max">
                  {!isFirst && (
                    <div className="w-12 md:w-20 h-0.5 bg-gray-100 mx-2 relative rounded-full overflow-hidden">
                       <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all" style={{ width: `${totalProgress}%` }}></div>
                    </div>
                  )}
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-colors cursor-default ${isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : totalProgress > 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200 text-gray-500'}`}>
                    {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className={`w-2 h-2 rounded-full ${totalProgress > 0 ? 'bg-blue-600' : 'bg-gray-300'}`}></div>}
                    <span className="text-[10px] font-bold tracking-wider uppercase">{phase.split(':')[0]}</span>
                    {totalProgress > 0 && <span className="text-[9px] font-black opacity-70 ml-1">{totalProgress}%</span>}
                  </div>
                </div>
              );
           })}
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] uppercase tracking-wider font-bold hover:bg-gray-800 transition-colors shadow-sm shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Phase
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
                  placeholder="Search tasks, contractors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors bg-white shadow-sm"
                />
              </div>
              <div className="relative">
                <select 
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-xs font-semibold focus:outline-none focus:border-gray-300 shadow-sm transition-colors cursor-pointer"
                >
                  {phases.map(phase => (
                    <option key={phase} value={phase}>{phase}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm">
                <Download className="w-4 h-4" /> Export
              </button>
              <button 
                onClick={() => setIsNewTaskModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Master Task
              </button>
            </div>
          </div>

          {/* Master Table */}
          <div className="flex-1 overflow-auto bg-gray-50/20">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white border-b border-gray-200 text-[10px] uppercase tracking-wider text-gray-400 z-10 shadow-sm shadow-gray-100/50">
                <tr>
                  <th className="px-5 py-3 font-bold">WBS / ID</th>
                  <th className="px-5 py-3 font-bold">Task Details</th>
                  <th className="px-5 py-3 font-bold">Timeline (Gantt Mini)</th>
                  <th className="px-5 py-3 font-bold">Status</th>
                  <th className="px-5 py-3 font-bold w-12 text-center">More</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {filteredTasks.map(task => (
                  <tr 
                    key={task.id} 
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`cursor-pointer transition-colors ${selectedTaskId === task.id ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-bold text-gray-900 tracking-tight">{task.id}</span>
                      <p className="text-[9px] text-blue-600 font-semibold uppercase tracking-wider mt-1 border border-blue-100 bg-blue-50 px-1.5 py-0.5 rounded inline-block">
                        {task.phase.split(':')[0]}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-gray-900">{task.name}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                         <Layers className="w-3 h-3 text-gray-400" />
                         <span className="text-[10px] font-semibold text-gray-600">{task.contractor}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 w-1/3">
                      <div className="flex justify-between items-center text-[10px] text-gray-500 font-semibold mb-1.5">
                        <span>{task.startDate}</span>
                        <span className="text-gray-400">|</span>
                        <span>{task.endDate}</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex border border-gray-200/50">
                        <div 
                          className={`h-full ${task.progress === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                          style={{ width: `${task.progress}%` }}
                        ></div>
                      </div>
                      <div className="mt-1 text-right text-[9px] font-bold text-gray-400">
                         {task.progress}% Complete
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-md border ${getStatusColor(task.status)}`}>
                        {getStatusIcon(task.status)}
                        {task.status}
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
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Edit2 className="w-3.5 h-3.5 mr-2 text-gray-500" /> Edit Schedule
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                            <Layers className="w-3.5 h-3.5 mr-2 text-gray-500" /> Linked Items
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Strike Task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center p-20 text-center">
                <Calendar className="w-12 h-12 text-gray-200 mb-4" />
                <h4 className="text-sm font-bold text-gray-400">No schedule tasks found.</h4>
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Pane */}
        {selectedTask && (
          <div className="w-[500px] shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/30">
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex items-center gap-1.5 text-[8px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${getStatusColor(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>
                <button onClick={() => setSelectedTaskId(null)} className="text-gray-400 hover:text-gray-900 transition-colors text-[10px] font-semibold">
                  Close
                </button>
              </div>
              <h2 className="text-base font-bold text-gray-900 leading-tight tracking-tight mb-2">
                {selectedTask.name}
              </h2>
              <p className="text-[10px] text-blue-600 font-bold mb-4 bg-blue-50 border border-blue-100 inline-block px-1.5 py-0.5 rounded-md">
                {selectedTask.id} • {selectedTask.phase}
              </p>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                 <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Durations</span>
                    </div>
                    <span className="text-[11px] font-black text-gray-900">{selectedTask.duration} Days</span>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">Start Date</span>
                     <span className="text-[11px] font-bold text-gray-900">{selectedTask.startDate}</span>
                   </div>
                   <div>
                     <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-widest mb-1">End Date</span>
                     <span className="text-[11px] font-bold text-gray-900">{selectedTask.endDate}</span>
                   </div>
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-[#fafafa]/50">
              
              <div className="mb-6">
                <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Assigned Contractor</h3>
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {selectedTask.contractor.charAt(0)}
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-gray-900">{selectedTask.contractor}</p>
                    <p className="text-[9px] font-medium text-gray-500">Sub-Contractor Tier 1</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Progress</h3>
                   <span className="text-[9px] font-black text-gray-900">{selectedTask.progress}%</span>
                 </div>
                 <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${selectedTask.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                      style={{ width: `${selectedTask.progress}%` }}
                    ></div>
                 </div>
              </div>

              <div className="mb-6">
                 <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Dependencies</h3>
                 {selectedTask.dependencies.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {selectedTask.dependencies.map(dep => {
                         const depTask = tasks.find(t => t.id === dep);
                         return (
                           <div key={dep} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-gray-200 shadow-sm">
                             <div className="w-1 h-full min-h-[20px] bg-amber-400 rounded-full shrink-0"></div>
                             <div className="flex-1 min-w-0">
                               <p className="text-[10px] font-bold text-gray-900 truncate">{depTask?.name || dep}</p>
                               <p className="text-[8px] text-gray-500 truncate">Wait until finished</p>
                             </div>
                           </div>
                         );
                      })}
                    </div>
                 ) : (
                   <p className="text-[10px] text-gray-400 font-medium italic">No predecessor dependencies.</p>
                 )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Reference Docs</h3>
                  <button className="text-[9px] font-bold text-blue-600 border border-blue-200 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors">Add</button>
                </div>
                <div className="border border-gray-200 bg-white rounded-lg p-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
                   <div className="p-1.5 bg-gray-100 rounded-md shrink-0">
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold text-gray-900 truncate">{selectedTask.id}_Baseline_Spec.pdf</p>
                      <p className="text-[8px] text-gray-400 mt-0.5">1.4 MB • Uploaded 2 mins ago</p>
                   </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
      {/* New Task Modal */}
      <Dialog open={isNewTaskModalOpen} onOpenChange={setIsNewTaskModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Master Task</DialogTitle>
            <DialogDescription>
              Deploy a new master-level schedule item into the active construction phase.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Task Name</label>
              <input type="text" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Structural Framing" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Contractor</label>
              <input type="text" className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="Assign contractor..." />
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setIsNewTaskModalOpen(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={() => setIsNewTaskModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">Create Task</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
