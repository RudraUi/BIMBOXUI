import { Plus, Search, Filter, CheckCircle2, Circle, AlertCircle, MessageSquare } from "lucide-react";
import { useState } from "react";

interface Task {
  id: number;
  title: string;
  type: "Issue" | "RFI" | "Task";
  status: "Open" | "In Progress" | "Resolved";
  priority: "High" | "Medium" | "Low";
  assignee: string;
  date: string;
}

export function Tasks() {
  const [activeTab, setActiveTab] = useState<"All" | "Issues" | "RFI">("All");

  const tasks: Task[] = [
    { id: 1, title: "Structural beam alignment issue on Floor 3", type: "Issue", status: "Open", priority: "High", assignee: "John Doe", date: "2026-04-22" },
    { id: 2, title: "RFI: Material specification for exterior walls", type: "RFI", status: "In Progress", priority: "Medium", assignee: "Jane Smith", date: "2026-04-21" },
    { id: 3, title: "Complete HVAC ductwork installation", type: "Task", status: "In Progress", priority: "Medium", assignee: "Mike Johnson", date: "2026-04-20" },
    { id: 4, title: "Foundation waterproofing concern", type: "Issue", status: "Resolved", priority: "High", assignee: "Sarah Lee", date: "2026-04-19" },
    { id: 5, title: "RFI: Window glazing type approval", type: "RFI", status: "Open", priority: "Low", assignee: "Tom Brown", date: "2026-04-18" },
  ];

  const filteredTasks = activeTab === "All"
    ? tasks
    : tasks.filter(task => task.type === activeTab.replace("RFI", "RFI"));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "text-orange-600 bg-orange-50";
      case "In Progress": return "text-blue-600 bg-blue-50";
      case "Resolved": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-600";
      case "Medium": return "text-orange-600";
      case "Low": return "text-gray-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Tasks & Issues</h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-4">
          {["All", "Issues", "RFI"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-auto">
        <div className="divide-y divide-gray-100">
          {filteredTasks.map((task) => (
            <div key={task.id} className="p-4 hover:bg-gray-50 transition-all cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  {task.status === "Resolved" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm text-gray-900 mb-1">{task.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600">
                        {task.type}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                        • {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
                <MessageSquare className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex items-center gap-4 ml-8 text-xs text-gray-500">
                <span>Assigned to {task.assignee}</span>
                <span>•</span>
                <span>{task.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
