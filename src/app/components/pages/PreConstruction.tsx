import { Viewer } from "../common/Viewer";
import { Documents } from "../common/Documents";
import { Tasks } from "../common/Tasks";
import { Team } from "../common/Team";
import { FileSpreadsheet, Calendar, Users, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";

export function PreConstruction() {
  const [activeTab, setActiveTab] = useState<"Planning" | "Design" | "BOQ" | "Tasks" | "Team" | "Documents">("Design");
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);

  const tabs = [
    { id: "Planning", label: "Planning", icon: Calendar },
    { id: "Design", label: "Design & Viewer", icon: Sparkles },
    { id: "BOQ", label: "BOQ", icon: FileSpreadsheet },
    { id: "Tasks", label: "Tasks", icon: Calendar },
    { id: "Team", label: "Team", icon: Users },
    { id: "Documents", label: "Documents", icon: FileSpreadsheet },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Pre-Construction</h1>
            <p className="text-sm text-gray-600">Fast BIM Automation & Planning</p>
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
        {activeTab === "Planning" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Project Planning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="mb-2">Project Timeline</h3>
                <p className="text-sm text-gray-600">Create and manage project milestones</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="mb-2">Resource Allocation</h3>
                <p className="text-sm text-gray-600">Assign resources and budget</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="mb-2">Risk Assessment</h3>
                <p className="text-sm text-gray-600">Identify and mitigate project risks</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="mb-2">Stakeholder Management</h3>
                <p className="text-sm text-gray-600">Manage project stakeholders</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Design" && (
          <div className="h-full">
            <Viewer />
          </div>
        )}

        {activeTab === "BOQ" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Bill of Quantities</h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Item</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Description</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Unit</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Rate</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm">001</td>
                  <td className="px-4 py-3 text-sm">Concrete M25</td>
                  <td className="px-4 py-3 text-sm">500</td>
                  <td className="px-4 py-3 text-sm">m³</td>
                  <td className="px-4 py-3 text-sm">$120</td>
                  <td className="px-4 py-3 text-sm">$60,000</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm">002</td>
                  <td className="px-4 py-3 text-sm">Steel Reinforcement</td>
                  <td className="px-4 py-3 text-sm">25,000</td>
                  <td className="px-4 py-3 text-sm">kg</td>
                  <td className="px-4 py-3 text-sm">$2.50</td>
                  <td className="px-4 py-3 text-sm">$62,500</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Tasks" && (
          <div className="h-full">
            <Tasks />
          </div>
        )}

        {activeTab === "Team" && (
          <div className="h-full">
            <Team />
          </div>
        )}

        {activeTab === "Documents" && (
          <div className="h-full">
            <Documents />
          </div>
        )}
      </div>
    </div>
  );
}
