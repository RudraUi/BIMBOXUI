import { Viewer } from "../common/Viewer";
import { Documents } from "../common/Documents";
import { Tasks } from "../common/Tasks";
import { Team } from "../common/Team";
import { Construction as ConstructionIcon, Package, Users as UsersIcon, TrendingUp, ClipboardCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";

export function Construction() {
  const [activeTab, setActiveTab] = useState<"Viewer" | "Tasks" | "Resources" | "Attendance" | "Materials" | "Progress" | "Documents" | "Team">("Viewer");
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);

  const tabs = [
    { id: "Viewer", label: "2D/3D Viewer", icon: ConstructionIcon },
    { id: "Tasks", label: "Tasks & RFI", icon: ClipboardCheck },
    { id: "Resources", label: "Resources", icon: UsersIcon },
    { id: "Attendance", label: "Site Attendance", icon: ClipboardCheck },
    { id: "Materials", label: "Procured Materials", icon: Package },
    { id: "Progress", label: "Work Progress", icon: TrendingUp },
    { id: "Documents", label: "Documents", icon: Package },
    { id: "Team", label: "Team", icon: UsersIcon },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <ConstructionIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Construction</h1>
            <p className="text-sm text-gray-600">Construction Management & Execution</p>
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
        {activeTab === "Viewer" && (
          <div className="h-full">
            <Viewer mode="BIM" />
          </div>
        )}

        {activeTab === "Tasks" && (
          <div className="h-full">
            <Tasks />
          </div>
        )}

        {activeTab === "Resources" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Resource Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Workers</p>
                <p className="text-2xl">156</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Equipment</p>
                <p className="text-2xl">24</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Tasks</p>
                <p className="text-2xl">32</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Attendance" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Site Attendance - Today</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Present</p>
                <p className="text-2xl text-green-600">142</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Absent</p>
                <p className="text-2xl text-red-600">14</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">On Leave</p>
                <p className="text-2xl text-orange-600">8</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Attendance %</p>
                <p className="text-2xl text-blue-600">91%</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Materials" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Procured Materials</h2>
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Material</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Quantity</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Unit</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-600">Delivery Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm">Cement Portland</td>
                  <td className="px-4 py-3 text-sm">500</td>
                  <td className="px-4 py-3 text-sm">Bags</td>
                  <td className="px-4 py-3 text-sm"><span className="px-2 py-1 rounded-full bg-green-50 text-green-600 text-xs">Delivered</span></td>
                  <td className="px-4 py-3 text-sm">2026-04-20</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 text-sm">Steel Bars 12mm</td>
                  <td className="px-4 py-3 text-sm">2000</td>
                  <td className="px-4 py-3 text-sm">kg</td>
                  <td className="px-4 py-3 text-sm"><span className="px-2 py-1 rounded-full bg-orange-50 text-orange-600 text-xs">In Transit</span></td>
                  <td className="px-4 py-3 text-sm">2026-04-25</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "Progress" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl mb-4">Work Progress</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Foundation Work</span>
                  <span className="text-sm">100%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Structural Framework</span>
                  <span className="text-sm">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">MEP Installation</span>
                  <span className="text-sm">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
            </div>
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
