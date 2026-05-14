import { Documents } from "../common/Documents";
import { Tasks } from "../common/Tasks";
import { Team } from "../common/Team";
import { MapPin, Upload, Database, Map } from "lucide-react";
import { useState, useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";

export function SiteSurvey() {
  const [activeTab, setActiveTab] = useState<"Survey" | "Data" | "Tasks" | "Documents" | "Team">("Survey");
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);

  const tabs = [
    { id: "Survey", label: "Survey Data", icon: MapPin },
    { id: "Data", label: "Migrate Data", icon: Database },
    { id: "Tasks", label: "Tasks", icon: Map },
    { id: "Documents", label: "Documents", icon: Upload },
    { id: "Team", label: "Team", icon: MapPin },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Site Survey</h1>
            <p className="text-sm text-gray-600">Project Management & Site Analysis</p>
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
        {activeTab === "Survey" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">Site Survey Data</h2>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Survey
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Surveys</p>
                <p className="text-2xl text-purple-600">24</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl text-orange-600">6</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl text-green-600">18</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="mb-1">Topographic Survey - Site A</h3>
                    <p className="text-sm text-gray-600">Location: Downtown District</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-xs">Completed</span>
                </div>
                <p className="text-sm text-gray-500">Survey Date: 2026-04-18</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="mb-1">Boundary Survey - Plot B12</h3>
                    <p className="text-sm text-gray-600">Location: Industrial Zone</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs">In Progress</span>
                </div>
                <p className="text-sm text-gray-500">Survey Date: 2026-04-20</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Data" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl mb-6">Migrate Data from Other Phases</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-all cursor-pointer">
                <div className="text-center">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="mb-2">From Pre-Construction</h3>
                  <p className="text-sm text-gray-600 mb-4">Import planning and design data</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                    Import Data
                  </button>
                </div>
              </div>

              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 transition-all cursor-pointer">
                <div className="text-center">
                  <Database className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="mb-2">From Construction</h3>
                  <p className="text-sm text-gray-600 mb-4">Import construction records</p>
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all">
                    Import Data
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 Migrating data allows you to reuse existing project information and maintain continuity across phases.
              </p>
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
