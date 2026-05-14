import { Documents } from "../common/Documents";
import { Tasks } from "../common/Tasks";
import { Team } from "../common/Team";
import { Wrench, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";

export function FacilityManagement() {
  const [activeTab, setActiveTab] = useState<"Maintenance" | "Tasks" | "Documents" | "Team">("Maintenance");
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);

  const tabs = [
    { id: "Maintenance", label: "Maintenance", icon: Wrench },
    { id: "Tasks", label: "Tasks", icon: CheckCircle },
    { id: "Documents", label: "Documents", icon: AlertCircle },
    { id: "Team", label: "Team", icon: Calendar },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Facility Management</h1>
            <p className="text-sm text-gray-600">Maintenance & Project Management</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        {activeTab === "Maintenance" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Maintenance Schedule</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Scheduled</p>
                <p className="text-2xl text-blue-600">12</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl text-orange-600">5</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl text-green-600">34</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1">HVAC System Inspection</h3>
                    <p className="text-sm text-gray-600">Floor 3 - Building A</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">Scheduled</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Due: 2026-04-25</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1">Fire Safety Equipment Check</h3>
                    <p className="text-sm text-gray-600">All Floors</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs">In Progress</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Due: 2026-04-23</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1">Elevator Maintenance</h3>
                    <p className="text-sm text-gray-600">Elevator 1 & 2</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs">Completed</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">Completed: 2026-04-20</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Tasks" && (
          <div className="h-full">
            <Tasks />
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="h-full">
            <Documents />
          </div>
        )}

        {activeTab === "Team" && (
          <div className="h-full">
            <Team />
          </div>
        )}
      </div>
    </div>
  );
}
