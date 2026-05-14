import { Documents } from "../common/Documents";
import { Tasks } from "../common/Tasks";
import { Team } from "../common/Team";
import { Box, ShoppingBag, Users as UsersIcon, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";

export function DigitalTwin() {
  const [activeTab, setActiveTab] = useState<"Orders" | "Vendors" | "Tasks" | "Documents" | "Team">("Orders");
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);

  const tabs = [
    { id: "Orders", label: "BIM Orders", icon: ShoppingBag },
    { id: "Vendors", label: "Vendors", icon: UsersIcon },
    { id: "Tasks", label: "Tasks", icon: Package },
    { id: "Documents", label: "Documents", icon: Package },
    { id: "Team", label: "Team", icon: UsersIcon },
  ];

  const vendors = [
    { id: 1, name: "BIMBOX Team", rating: 5.0, projects: 150, type: "Internal", status: "Available" },
    { id: 2, name: "TechBIM Solutions", rating: 4.8, projects: 89, type: "Partner", status: "Available" },
    { id: 3, name: "Digital Construct Pro", rating: 4.9, projects: 124, type: "Partner", status: "Busy" },
    { id: 4, name: "3D Model Masters", rating: 4.7, projects: 67, type: "Partner", status: "Available" },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Box className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl text-gray-900">Digital Twin</h1>
            <p className="text-sm text-gray-600">BIM Modeling Services</p>
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
        {activeTab === "Orders" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl">BIM Modeling Orders</h2>
              <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all">
                New Order
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Active Orders</p>
                <p className="text-2xl text-blue-600">8</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">In Progress</p>
                <p className="text-2xl text-orange-600">5</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-2xl text-green-600">23</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="mb-1">Residential Complex - Tower A</h3>
                    <p className="text-sm text-gray-600">BIMBOX Team</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs">In Progress</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Order Date: 2026-04-15</span>
                  <span>•</span>
                  <span>Delivery: 2026-04-30</span>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="mb-1">Commercial Plaza - MEP Model</h3>
                    <p className="text-sm text-gray-600">TechBIM Solutions</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs">Pending</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Order Date: 2026-04-20</span>
                  <span>•</span>
                  <span>Delivery: 2026-05-05</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Vendors" && (
          <div className="h-full bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl mb-6">Available Vendors</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendors.map((vendor) => (
                <div key={vendor.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="mb-1">{vendor.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-600 text-xs">
                          {vendor.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          vendor.status === "Available"
                            ? "bg-green-50 text-green-600"
                            : "bg-orange-50 text-orange-600"
                        }`}>
                          {vendor.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span>⭐ {vendor.rating}</span>
                    <span>•</span>
                    <span>{vendor.projects} Projects</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-all text-sm">
                    Select Vendor
                  </button>
                </div>
              ))}
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
