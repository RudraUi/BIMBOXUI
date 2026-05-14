import { Plus, Search, Filter, Package, TrendingUp, Clock, CheckCircle, ArrowRight, Users, FileText, DollarSign, Truck, ClipboardCheck, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { useSidebar } from "../../context/SidebarContext";
import { MaterialProcurementTracker } from "./MaterialProcurementTracker";

type WorkflowStage = {
  id: string;
  name: string;
  icon: typeof FileText;
  color: "blue" | "purple" | "green" | "orange";
  substages: string[];
  count: number;
};

type Order = {
  id: number;
  item: string;
  quantity: string;
  project: string;
  stage: "Delivered" | "In Transit" | "Bid Evaluation" | "Pending Approval";
  vendor: string;
  amount: string;
  date: string;
};

type Vendor = {
  name: string;
  rating: number;
  orders: number;
  performance: number;
  email: string;
};

const workflowStages: WorkflowStage[] = [
  {
    id: "planning",
    name: "Requirement Planning",
    icon: FileText,
    color: "blue",
    substages: ["BOQ", "Material Planning", "Budget Allocation"],
    count: 8,
  },
  {
    id: "pr",
    name: "Purchase Requisition",
    icon: FileText,
    color: "purple",
    substages: ["Internal Requests"],
    count: 12,
  },
  {
    id: "approval",
    name: "Approval Workflow",
    icon: CheckCircle,
    color: "orange",
    substages: ["Site Engineer", "Project Manager", "Finance Approval"],
    count: 7,
  },
  {
    id: "vendor",
    name: "Vendor Management",
    icon: Users,
    color: "green",
    substages: ["Vendor Database", "Prequalification", "Performance History"],
    count: 24,
  },
  {
    id: "rfq",
    name: "RFQ / Tendering",
    icon: FileText,
    color: "blue",
    substages: ["Send RFQ", "Receive Quotations"],
    count: 5,
  },
  {
    id: "bid",
    name: "Bid Evaluation",
    icon: TrendingUp,
    color: "purple",
    substages: ["Technical Evaluation", "Commercial Comparison", "AI Insights"],
    count: 3,
  },
  {
    id: "po",
    name: "Purchase Order",
    icon: Package,
    color: "green",
    substages: ["Order Issuance"],
    count: 45,
  },
  {
    id: "delivery",
    name: "Delivery Tracking",
    icon: Truck,
    color: "orange",
    substages: ["Shipment Tracking", "Site Delivery Status"],
    count: 23,
  },
  {
    id: "grn",
    name: "Goods Receipt",
    icon: ClipboardCheck,
    color: "blue",
    substages: ["Quantity Check", "Quality Check"],
    count: 18,
  },
  {
    id: "invoice",
    name: "Invoice & Payment",
    icon: DollarSign,
    color: "purple",
    substages: ["Invoice Submission", "3-Way Matching"],
    count: 15,
  },
  {
    id: "performance",
    name: "Vendor Performance",
    icon: Star,
    color: "green",
    substages: ["Delivery Rating", "Quality Score", "Cost Efficiency"],
    count: 24,
  },
];

const initialOrders: Order[] = [
  {
    id: 1,
    item: "Cement Portland Type-I",
    quantity: "500 Bags",
    project: "Downtown Tower Complex",
    stage: "Delivered",
    vendor: "BuildMart Supplies",
    amount: "$12,500",
    date: "2026-04-22",
  },
  {
    id: 2,
    item: "Steel Reinforcement Bars",
    quantity: "5000 kg",
    project: "Riverside Residential",
    stage: "In Transit",
    vendor: "MetalCorp Industries",
    amount: "$18,750",
    date: "2026-04-21",
  },
  {
    id: 3,
    item: "Concrete Mixer Machine",
    quantity: "2 Units",
    project: "Tech Park Phase 2",
    stage: "Bid Evaluation",
    vendor: "Construction Equipment Co",
    amount: "$45,000",
    date: "2026-04-20",
  },
];

const initialVendors: Vendor[] = [
  { name: "BuildMart Supplies", rating: 4.8, orders: 45, performance: 95, email: "ops@buildmart.example" },
  { name: "MetalCorp Industries", rating: 4.6, orders: 38, performance: 88, email: "sales@metalcorp.example" },
  { name: "Construction Equipment Co", rating: 4.9, orders: 24, performance: 97, email: "support@ceco.example" },
  { name: "SafeWork Solutions", rating: 4.7, orders: 32, performance: 92, email: "hello@safework.example" },
];

export function Procurement() {
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"Home" | "Overview" | "Workflow" | "Orders" | "Vendors">("Home");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStageFilter, setOrderStageFilter] = useState<"All" | Order["stage"]>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isRequisitionOpen, setIsRequisitionOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const [requisitionDraft, setRequisitionDraft] = useState({
    item: "",
    quantity: "",
    project: "Downtown Tower Complex",
    vendor: "BuildMart Supplies",
    amount: "",
    stage: "Pending Approval" as Order["stage"],
  });
  const [vendorDraft, setVendorDraft] = useState({
    name: "",
    email: "",
    rating: "4.5",
    performance: "90",
  });
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);

  const stats = useMemo(() => ([
    { label: "Total Orders", value: String(orders.length + 153), icon: Package, color: "from-blue-500 to-blue-600" },
    { label: "Pending Approval", value: String(orders.filter((order) => order.stage === "Pending Approval").length), icon: Clock, color: "from-orange-500 to-orange-600" },
    { label: "In Transit", value: String(orders.filter((order) => order.stage === "In Transit").length + 42), icon: TrendingUp, color: "from-purple-500 to-purple-600" },
    { label: "Delivered", value: String(orders.filter((order) => order.stage === "Delivered").length + 87), icon: CheckCircle, color: "from-green-500 to-green-600" },
  ]), [orders]);

  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        query === "" ||
        order.item.toLowerCase().includes(query) ||
        order.project.toLowerCase().includes(query) ||
        order.vendor.toLowerCase().includes(query);
      const matchesStage = orderStageFilter === "All" || order.stage === orderStageFilter;
      return matchesSearch && matchesStage;
    });
  }, [orders, orderSearch, orderStageFilter]);

  const createRequisition = () => {
    if (!requisitionDraft.item.trim() || !requisitionDraft.quantity.trim()) {
      return;
    }

    const newOrder: Order = {
      id: Date.now(),
      item: requisitionDraft.item.trim(),
      quantity: requisitionDraft.quantity.trim(),
      project: requisitionDraft.project,
      stage: requisitionDraft.stage,
      vendor: requisitionDraft.vendor,
      amount: requisitionDraft.amount.trim() || "$0",
      date: "2026-04-28",
    };

    setOrders((current) => [newOrder, ...current]);
    setActiveTab("Orders");
    setIsRequisitionOpen(false);
    setRequisitionDraft({
      item: "",
      quantity: "",
      project: "Downtown Tower Complex",
      vendor: "BuildMart Supplies",
      amount: "",
      stage: "Pending Approval",
    });
  };

  const createVendor = () => {
    if (!vendorDraft.name.trim() || !vendorDraft.email.trim()) {
      return;
    }

    setVendors((current) => [
      {
        name: vendorDraft.name.trim(),
        email: vendorDraft.email.trim(),
        rating: Number.parseFloat(vendorDraft.rating) || 4.5,
        orders: 0,
        performance: Number.parseInt(vendorDraft.performance, 10) || 90,
      },
      ...current,
    ]);
    setIsVendorOpen(false);
    setVendorDraft({
      name: "",
      email: "",
      rating: "4.5",
      performance: "90",
    });
  };

  const orderProgress = (stage: Order["stage"]) => {
    switch (stage) {
      case "Pending Approval": return 25;
      case "Bid Evaluation": return 45;
      case "In Transit": return 75;
      case "Delivered": return 100;
    }
  };

  return (
    <>
      <div className="h-screen overflow-auto bg-white">
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl mb-1">Procurement</h1>
              <p className="text-sm text-gray-600">Requests, approvals, vendors, POs, delivery, and invoices</p>
            </div>
            <button
              onClick={() => setIsRequisitionOpen(true)}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Requisition
            </button>
          </div>

          <div className="flex gap-2">
            {(["Home", "Overview", "Workflow", "Orders", "Vendors"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  activeTab === tab
                    ? "bg-gray-900 text-white"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "Home" && (
            <div className="h-[calc(100vh-190px)] min-h-[720px]">
              <MaterialProcurementTracker />
            </div>
          )}

          {activeTab === "Overview" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
                      <p className="text-3xl">{stat.value}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <h2 className="text-xl mb-4">Recent Orders</h2>
                <div className="space-y-3">
                  {orders.slice(0, 4).map((order) => (
                    <div key={order.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="mb-1">{order.item}</h3>
                          <p className="text-sm text-gray-600 mb-2">{order.project} • {order.vendor}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                              {order.quantity}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              order.stage === "Delivered" ? "bg-green-50 text-green-600" :
                              order.stage === "In Transit" ? "bg-purple-50 text-purple-600" :
                              order.stage === "Pending Approval" ? "bg-amber-50 text-amber-600" :
                              "bg-orange-50 text-orange-600"
                            }`}>
                              {order.stage}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg mb-1">{order.amount}</p>
                          <p className="text-xs text-gray-500">{order.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl mb-4">Top Performing Vendors</h2>
                <div className="space-y-3">
                  {vendors.slice(0, 4).map((vendor) => (
                    <div key={vendor.name} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="mb-1">{vendor.name}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {vendor.rating.toFixed(1)}
                            </span>
                            <span>•</span>
                            <span>{vendor.orders} orders</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Performance</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-green-600 rounded-full"
                                style={{ width: `${vendor.performance}%` }}
                              />
                            </div>
                            <span className="text-sm text-green-600">{vendor.performance}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "Workflow" && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl mb-2">Procurement Workflow Stages</h2>
                <p className="text-sm text-gray-600">Complete end-to-end procurement process management</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workflowStages.map((stage, index) => {
                    const Icon = stage.icon;
                    const colorClasses = {
                      blue: "from-blue-500 to-blue-600",
                      purple: "from-purple-500 to-purple-600",
                      green: "from-green-500 to-green-600",
                      orange: "from-orange-500 to-orange-600",
                    }[stage.color];

                    return (
                      <div key={stage.id}>
                        <div
                          onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
                          className="p-4 border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all cursor-pointer group relative"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses} rounded-lg flex items-center justify-center shadow-lg flex-shrink-0`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="text-sm group-hover:text-blue-600 transition-colors">{stage.name}</h3>
                                <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
                                  {stage.count}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">Stage {index + 1} of {workflowStages.length}</p>
                            </div>
                          </div>

                          {activeStage === stage.id && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2">Sub-stages:</p>
                              <div className="space-y-1">
                                {stage.substages.map((substage) => (
                                  <div key={substage} className="flex items-center gap-2 text-xs text-gray-700">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                    {substage}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        {index < workflowStages.length - 1 && (
                          <div className="hidden lg:flex items-center justify-center py-2">
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
                <h3 className="text-lg mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Supplier Side (External Flow)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Receive RFQ", "Submit Quotation", "Negotiation", "Receive PO", "Fulfill Order", "Deliver Goods/Services", "Submit Invoice", "Receive Payment"].map((step) => (
                    <div key={step} className="p-3 bg-white rounded-lg border border-green-200">
                      <p className="text-xs text-gray-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Orders" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <h2 className="text-xl">All Orders</h2>
                <div className="flex gap-2 flex-wrap">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Search orders..."
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                    <Filter className="w-4 h-4" />
                    <select
                      value={orderStageFilter}
                      onChange={(e) => setOrderStageFilter(e.target.value as "All" | Order["stage"])}
                      className="bg-transparent outline-none"
                    >
                      <option value="All">All stages</option>
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Bid Evaluation">Bid Evaluation</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              </div>

              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Item</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Project</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Vendor</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Quantity</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Stage</th>
                    <th className="px-4 py-3 text-left text-xs text-gray-600">Date</th>
                    <th className="px-4 py-3 text-right text-xs text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                      <td className="px-4 py-4 text-sm">{order.item}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{order.project}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{order.vendor}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{order.quantity}</td>
                      <td className="px-4 py-4 text-sm">{order.amount}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${
                          order.stage === "Delivered" ? "bg-green-50 text-green-600" :
                          order.stage === "In Transit" ? "bg-purple-50 text-purple-600" :
                          order.stage === "Pending Approval" ? "bg-amber-50 text-amber-600" :
                          "bg-orange-50 text-orange-600"
                        }`}>
                          {order.stage}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{order.date}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                        >
                          Track Order
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500 mt-6">
                  No orders match the current search or stage filter.
                </div>
              )}
            </div>
          )}

          {activeTab === "Vendors" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl">Vendor Database</h2>
                <button
                  onClick={() => setIsVendorOpen(true)}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Vendor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vendors.map((vendor) => (
                  <div key={vendor.name} className="p-6 border border-gray-200 rounded-xl hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="mb-2">{vendor.name}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {vendor.rating.toFixed(1)}
                          </span>
                          <span>•</span>
                          <span>{vendor.orders} orders</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Performance Score</span>
                        <span className="text-green-600">{vendor.performance}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-600 rounded-full"
                          style={{ width: `${vendor.performance}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm"
                      >
                        Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isRequisitionOpen} onOpenChange={setIsRequisitionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Requisition</DialogTitle>
            <DialogDescription>Add a new procurement request to the frontend preview.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Item name"
              value={requisitionDraft.item}
              onChange={(e) => setRequisitionDraft((current) => ({ ...current, item: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Quantity"
                value={requisitionDraft.quantity}
                onChange={(e) => setRequisitionDraft((current) => ({ ...current, quantity: e.target.value }))}
              />
              <Input
                placeholder="Amount"
                value={requisitionDraft.amount}
                onChange={(e) => setRequisitionDraft((current) => ({ ...current, amount: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <select
                value={requisitionDraft.project}
                onChange={(e) => setRequisitionDraft((current) => ({ ...current, project: e.target.value }))}
                className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option>Downtown Tower Complex</option>
                <option>Riverside Residential</option>
                <option>Tech Park Phase 2</option>
              </select>
              <select
                value={requisitionDraft.vendor}
                onChange={(e) => setRequisitionDraft((current) => ({ ...current, vendor: e.target.value }))}
                className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              >
                {vendors.map((vendor) => (
                  <option key={vendor.name}>{vendor.name}</option>
                ))}
              </select>
              <select
                value={requisitionDraft.stage}
                onChange={(e) => setRequisitionDraft((current) => ({ ...current, stage: e.target.value as Order["stage"] }))}
                className="rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              >
                <option>Pending Approval</option>
                <option>Bid Evaluation</option>
                <option>In Transit</option>
                <option>Delivered</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsRequisitionOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createRequisition}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm"
              >
                Add Requisition
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isVendorOpen} onOpenChange={setIsVendorOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vendor</DialogTitle>
            <DialogDescription>Create a vendor entry for the preview database.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Input
              placeholder="Vendor name"
              value={vendorDraft.name}
              onChange={(e) => setVendorDraft((current) => ({ ...current, name: e.target.value }))}
            />
            <Input
              placeholder="Vendor email"
              value={vendorDraft.email}
              onChange={(e) => setVendorDraft((current) => ({ ...current, email: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Rating"
                value={vendorDraft.rating}
                onChange={(e) => setVendorDraft((current) => ({ ...current, rating: e.target.value }))}
              />
              <Input
                placeholder="Performance"
                value={vendorDraft.performance}
                onChange={(e) => setVendorDraft((current) => ({ ...current, performance: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsVendorOpen(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={createVendor}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all text-sm"
              >
                Add Vendor
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={selectedVendor !== null} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent>
          {selectedVendor && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedVendor.name}</DialogTitle>
                <DialogDescription>{selectedVendor.email}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 text-sm text-gray-700">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Rating</p>
                    <p>{selectedVendor.rating.toFixed(1)}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Orders</p>
                    <p>{selectedVendor.orders}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500 mb-1">Performance</p>
                    <p>{selectedVendor.performance}%</p>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-gray-500 mb-2">Vendor Health</p>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 rounded-full"
                      style={{ width: `${selectedVendor.performance}%` }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent>
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle>Track Order #{selectedOrder.id}</DialogTitle>
                <DialogDescription>{selectedOrder.item} / {selectedOrder.project}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 text-sm text-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="mb-1 text-xs text-gray-500">Vendor</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.vendor}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="mb-1 text-xs text-gray-500">Quantity</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.quantity}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="mb-1 text-xs text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.amount}</p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="mb-1 text-xs text-gray-500">Date</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.date}</p>
                  </div>
                </div>
                <div className="rounded-lg border border-gray-200 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Current Stage</p>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{selectedOrder.stage}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full rounded-full bg-emerald-600" style={{ width: `${orderProgress(selectedOrder.stage)}%` }} />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <span>Approval</span>
                    <span>Evaluation</span>
                    <span>Transit</span>
                    <span>Delivered</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
