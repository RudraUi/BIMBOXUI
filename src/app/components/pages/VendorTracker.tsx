import { useState } from "react";
import { 
  Plus, Search, Star, Truck, Users, Package, CheckCircle, ArrowLeft, 
  FileText, Activity, ShieldCheck, AlertTriangle, Clock, ChevronRight, 
  FileCheck, Calculator, Check, X, ShieldAlert, Award, Wrench, Mail, TrendingUp, BarChart3
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

type VendorType = "supplier" | "resource" | "equipment" | "special" | "performance";

type VendorStatus = "Draft" | "Under Review" | "Technical Evaluation" | "Financial Check" | "Pending Approval" | "Approved" | "Rejected";
type RiskLevel = "Low" | "Medium" | "High" | "Pending";
type VendorCategory = "Preferred" | "Approved" | "Trial" | "Blacklisted" | "Uncategorized";

interface VendorInventoryItem {
  id: string;
  materialName: string;
  price: number;
  unit: string;
  quantity: number;
  status: "Available" | "Low Stock" | "Out of Stock";
  expectedDelivery: string;
  image?: string;
  category?: string;
  experience?: string;
  brand?: string;
}

interface Vendor {
  vendorId: string;
  name: string;
  type: "supplier" | "resource" | "equipment" | "special";
  status: VendorStatus;
  score: number;
  riskLevel: RiskLevel;
  category: VendorCategory;
  image?: string;
  contact: {
    person: string;
    phone: string;
    email: string;
  };
  documents: { name: string; status: "Pending" | "Uploaded" | "Approved" | "Rejected" }[];
  compliance: {
    gstValidity: boolean;
    panVerification: boolean;
    bankVerification: boolean;
    blacklistCheck: boolean;
  };
  performance: {
    deliveryDelay: number;
    qualityScore: number;
    priceScore: number;
    responseScore: number;
    overallRating: number;
  };
  // Workflow scores
  technicalScore?: number;
  financialScore?: number;
  complianceScore?: number;
  
  orders: number;
  materials: string[];
  inventory?: VendorInventoryItem[];
  onboardDate: string;
}

const INITIAL_VENDORS: Vendor[] = [
  {
    vendorId: "V-001",
    name: "FastBuild Materials",
    type: "supplier",
    status: "Approved",
    score: 85,
    riskLevel: "Low",
    category: "Preferred",
    image: "/images/cement_supplier_1777878724250.png",
    contact: { person: "John Doe", phone: "+1 234 567 890", email: "john@fastbuild.com" },
    documents: [{ name: "Trade License", status: "Approved" }, { name: "Tax Certificate", status: "Approved" }, { name: "Bank Statement", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 5, qualityScore: 88, priceScore: 75, responseScore: 92, overallRating: 85 },
    technicalScore: 85, financialScore: 80, complianceScore: 90,
    orders: 34, materials: ["Cement", "Aggregate", "Sand"], 
    inventory: [
      { id: "INV-101", materialName: "Portland Cement (50kg)", price: 350, unit: "bag", quantity: 5000, status: "Available", expectedDelivery: "1-2 Days", image: "/images/cement_bag.png" },
      { id: "INV-102", materialName: "Crushed Stone Aggregate", price: 1200, unit: "ton", quantity: 800, status: "Available", expectedDelivery: "2-3 Days" },
      { id: "INV-103", materialName: "River Sand", price: 800, unit: "ton", quantity: 150, status: "Low Stock", expectedDelivery: "3-5 Days" }
    ],
    onboardDate: "2024-01-15"
  },
  {
    vendorId: "V-002",
    name: "Apex Steel Traders",
    type: "supplier",
    status: "Approved",
    score: 92,
    riskLevel: "Low",
    category: "Preferred",
    image: "/images/steel_rebar_supplier_1777878754675.png",
    contact: { person: "Marcus Cole", phone: "+1 234 567 891", email: "marcus@apexsteel.com" },
    documents: [{ name: "Trade License", status: "Approved" }, { name: "Tax Certificate", status: "Approved" }, { name: "ISO Certificate", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 2, qualityScore: 95, priceScore: 88, responseScore: 94, overallRating: 92 },
    technicalScore: 94, financialScore: 90, complianceScore: 95,
    orders: 120, materials: ["Steel Rebars", "Structural Steel", "Beams"],
    inventory: [
      { id: "INV-201", materialName: "TMT Rebar 12mm", price: 65, unit: "kg", quantity: 12000, status: "Available", expectedDelivery: "Next Day", image: "/images/steel_rebar.png" },
      { id: "INV-202", materialName: "TMT Rebar 16mm", price: 65, unit: "kg", quantity: 8500, status: "Available", expectedDelivery: "Next Day", image: "/images/steel_rebar.png" },
      { id: "INV-203", materialName: "I-Beam (200x100)", price: 85, unit: "kg", quantity: 0, status: "Out of Stock", expectedDelivery: "7-10 Days" }
    ],
    onboardDate: "2023-11-20"
  },
  {
    vendorId: "V-003",
    name: "Urban Workforce Co.",
    type: "resource",
    status: "Technical Evaluation",
    score: 0,
    riskLevel: "Pending",
    category: "Uncategorized",
    image: "/images/resource_vendor_1777878784000.png",
    contact: { person: "Jane Smith", phone: "+1 234 567 891", email: "jane@urban.com" },
    documents: [{ name: "Labour License", status: "Approved" }, { name: "Insurance Policy", status: "Approved" }],
    compliance: { gstValidity: false, panVerification: false, bankVerification: false, blacklistCheck: false },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    orders: 0, materials: ["Carpenters", "Masons", "Helpers"], 
    inventory: [
      { id: "RES-301", category: "Helpers", materialName: "General Helper", price: 100, unit: "hour", quantity: 45, status: "Available", expectedDelivery: "Immediate", experience: "2-3 Years" },
      { id: "RES-302", category: "Skilled Labor", materialName: "Skilled Carpenter", price: 1100, unit: "day", quantity: 15, status: "Available", expectedDelivery: "Next Day", experience: "5+ Years" },
      { id: "RES-303", category: "Skilled Labor", materialName: "Mason", price: 1000, unit: "day", quantity: 20, status: "Available", expectedDelivery: "Next Day", experience: "4+ Years" },
      { id: "RES-304", category: "Supervisors", materialName: "Civil Supervisor", price: 45000, unit: "month", quantity: 2, status: "Available", expectedDelivery: "1 Week", experience: "10+ Years" }
    ],
    onboardDate: "2024-03-22"
  },
  {
    vendorId: "V-004",
    name: "ProSkill Labour",
    type: "resource",
    status: "Approved",
    score: 78,
    riskLevel: "Medium",
    category: "Approved",
    image: "/images/resource_vendor_1777878784000.png",
    contact: { person: "Alan Wright", phone: "+1 234 567 899", email: "alan@proskill.com" },
    documents: [{ name: "Labour License", status: "Approved" }, { name: "Insurance Policy", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 10, qualityScore: 80, priceScore: 70, responseScore: 85, overallRating: 78 },
    technicalScore: 75, financialScore: 80, complianceScore: 80,
    orders: 45, materials: ["Electricians", "Plumbers", "HVAC Techs"], 
    inventory: [
      { id: "RES-401", category: "Skilled Labor", materialName: "Electrician", price: 1500, unit: "day", quantity: 12, status: "Available", expectedDelivery: "24 Hours", experience: "7+ Years" },
      { id: "RES-402", category: "Skilled Labor", materialName: "Welder", price: 1200, unit: "day", quantity: 8, status: "Low Stock", expectedDelivery: "48 Hours", experience: "5+ Years" },
      { id: "RES-403", category: "Operators", materialName: "Crane Operator", price: 2000, unit: "day", quantity: 5, status: "Available", expectedDelivery: "24 Hours", experience: "8+ Years" },
      { id: "RES-404", category: "Engineers", materialName: "Site Engineer", price: 55000, unit: "month", quantity: 3, status: "Available", expectedDelivery: "1 Week", experience: "6+ Years" }
    ],
    onboardDate: "2023-08-14"
  },
  {
    vendorId: "V-005",
    name: "HeavyLift Cranes",
    type: "equipment",
    status: "Under Review",
    score: 0,
    riskLevel: "Pending",
    category: "Uncategorized",
    image: "/images/equipment_vendor_1777878807199.png",
    contact: { person: "David Brown", phone: "+1 234 567 893", email: "david@heavylift.com" },
    documents: [{ name: "Equipment Reg", status: "Uploaded" }, { name: "Safety Cert", status: "Pending" }],
    compliance: { gstValidity: false, panVerification: false, bankVerification: false, blacklistCheck: false },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    orders: 0, materials: ["Tower Cranes", "Mobile Cranes"], 
    inventory: [
      { id: "EQP-501", category: "Mobile Cranes", materialName: "Liebherr LTM 11200", brand: "Liebherr", price: 15000, unit: "day", quantity: 2, status: "Available", expectedDelivery: "2 Days", image: "https://images.unsplash.com/photo-1541888086925-0c13bb10471b?w=200&q=80" },
      { id: "EQP-502", category: "Tower Cranes", materialName: "Potain MDT 389", brand: "Manitowoc", price: 25000, unit: "day", quantity: 1, status: "Low Stock", expectedDelivery: "1 Week", image: "https://images.unsplash.com/photo-1504307651254-35680f356f12?w=200&q=80" },
      { id: "EQP-503", category: "Crawler Cranes", materialName: "Terex Demag CC 2800", brand: "Terex", price: 30000, unit: "day", quantity: 1, status: "Available", expectedDelivery: "3 Days", image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=200&q=80" }
    ],
    onboardDate: "2024-04-10"
  },
  {
    vendorId: "V-006",
    name: "Titan Machinery",
    type: "equipment",
    status: "Approved",
    score: 88,
    riskLevel: "Low",
    category: "Preferred",
    image: "/images/equipment_vendor_1777878807199.png",
    contact: { person: "Sarah Jenkins", phone: "+1 234 567 894", email: "sarah@titan.com" },
    documents: [{ name: "Equipment Reg", status: "Approved" }, { name: "Safety Cert", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 2, qualityScore: 92, priceScore: 85, responseScore: 90, overallRating: 88 },
    technicalScore: 90, financialScore: 85, complianceScore: 90,
    orders: 28, materials: ["Excavators", "Bulldozers", "Loaders"], onboardDate: "2023-12-05"
  },
  {
    vendorId: "V-007",
    name: "Prime MEP Services",
    type: "resource",
    status: "Pending Approval",
    score: 72,
    riskLevel: "Medium",
    category: "Uncategorized",
    image: "/images/resource_vendor_1777878784000.png",
    contact: { person: "Mike Johnson", phone: "+1 234 567 892", email: "mike@prime.com" },
    documents: [{ name: "Trade License", status: "Approved" }, { name: "Tax Certificate", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    technicalScore: 70, financialScore: 65, complianceScore: 85,
    orders: 0, materials: ["Electricians", "Plumbers"], onboardDate: "2024-04-15"
  },
  {
    vendorId: "V-008",
    name: "Global Cement Corp",
    type: "supplier",
    status: "Technical Evaluation",
    score: 0,
    riskLevel: "Pending",
    category: "Uncategorized",
    contact: { person: "Robert Ford", phone: "+1 234 567 801", email: "robert@globalcement.com" },
    documents: [{ name: "Trade License", status: "Approved" }, { name: "Tax Certificate", status: "Uploaded" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: false, blacklistCheck: false },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    orders: 0, materials: ["Cement", "Ready Mix Concrete"], onboardDate: "2024-05-01"
  },
  {
    vendorId: "V-009",
    name: "Skyline Cranes & Hoists",
    type: "equipment",
    status: "Approved",
    score: 82,
    riskLevel: "Medium",
    category: "Approved",
    contact: { person: "Alice Wonderland", phone: "+1 234 567 802", email: "alice@skylinecranes.com" },
    documents: [{ name: "Equipment Reg", status: "Approved" }, { name: "Safety Cert", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 5, qualityScore: 85, priceScore: 80, responseScore: 88, overallRating: 82 },
    technicalScore: 85, financialScore: 80, complianceScore: 80,
    orders: 12, materials: ["Tower Cranes", "Passenger Hoists"], onboardDate: "2023-10-15"
  },
  {
    vendorId: "V-010",
    name: "Elite MEP Contractors",
    type: "resource",
    status: "Pending Approval",
    score: 65,
    riskLevel: "High",
    category: "Uncategorized",
    contact: { person: "Charlie Brown", phone: "+1 234 567 803", email: "charlie@elitemep.com" },
    documents: [{ name: "Trade License", status: "Approved" }, { name: "Tax Certificate", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    technicalScore: 60, financialScore: 65, complianceScore: 70,
    orders: 0, materials: ["HVAC Techs", "Plumbers", "Electricians"], onboardDate: "2024-04-20"
  },
  {
    vendorId: "V-011",
    name: "National Timber Yard",
    type: "supplier",
    status: "Approved",
    score: 95,
    riskLevel: "Low",
    category: "Preferred",
    contact: { person: "Eve Adams", phone: "+1 234 567 804", email: "eve@nationaltimber.com" },
    documents: [{ name: "Trade License", status: "Approved" }, { name: "Tax Certificate", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 1, qualityScore: 98, priceScore: 90, responseScore: 95, overallRating: 95 },
    technicalScore: 96, financialScore: 94, complianceScore: 95,
    orders: 84, materials: ["Plywood", "Scaffolding Timber", "Doors"], onboardDate: "2023-05-12"
  },
  {
    vendorId: "V-012",
    name: "Rapid Earthmovers",
    type: "equipment",
    status: "Under Review",
    score: 0,
    riskLevel: "Pending",
    category: "Uncategorized",
    contact: { person: "George Washington", phone: "+1 234 567 805", email: "george@rapidearth.com" },
    documents: [{ name: "Equipment Reg", status: "Uploaded" }, { name: "Safety Cert", status: "Uploaded" }],
    compliance: { gstValidity: false, panVerification: false, bankVerification: false, blacklistCheck: false },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    orders: 0, materials: ["Excavators", "Dump Trucks"], onboardDate: "2024-05-05"
  },
  {
    vendorId: "V-013",
    name: "Alpha Build Resources",
    type: "resource",
    status: "Approved",
    score: 88,
    riskLevel: "Low",
    category: "Preferred",
    contact: { person: "Tom Hanks", phone: "+1 234 567 806", email: "tom@alphabuild.com" },
    documents: [{ name: "Labour License", status: "Approved" }, { name: "Insurance Policy", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 2, qualityScore: 90, priceScore: 85, responseScore: 92, overallRating: 88 },
    technicalScore: 85, financialScore: 88, complianceScore: 92,
    orders: 34, materials: ["Welders", "Carpenters"], onboardDate: "2023-09-12"
  },
  {
    vendorId: "V-014",
    name: "Pioneer Safety Gears",
    type: "supplier",
    status: "Approved",
    score: 91,
    riskLevel: "Low",
    category: "Preferred",
    contact: { person: "Will Smith", phone: "+1 234 567 807", email: "will@pioneersafety.com" },
    documents: [{ name: "Trade License", status: "Approved" }, { name: "Tax Certificate", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 95, priceScore: 88, responseScore: 94, overallRating: 91 },
    technicalScore: 90, financialScore: 92, complianceScore: 91,
    orders: 65, materials: ["PPE Kits", "Safety Helmets", "Harnesses"], onboardDate: "2023-11-05"
  },
  {
    vendorId: "V-015",
    name: "Delta Electricals",
    type: "supplier",
    status: "Financial Check",
    score: 0,
    riskLevel: "Pending",
    category: "Uncategorized",
    contact: { person: "Emma Stone", phone: "+1 234 567 808", email: "emma@deltaelectricals.com" },
    documents: [{ name: "Trade License", status: "Approved" }, { name: "Tax Certificate", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    technicalScore: 80,
    orders: 0, materials: ["Cables", "Switchgears", "Lighting"], onboardDate: "2024-05-02"
  },
  {
    vendorId: "V-016",
    name: "Titanium Tools",
    type: "equipment",
    status: "Pending Approval",
    score: 74,
    riskLevel: "Medium",
    category: "Uncategorized",
    contact: { person: "Chris Evans", phone: "+1 234 567 809", email: "chris@titaniumtools.com" },
    documents: [{ name: "Equipment Reg", status: "Approved" }, { name: "Safety Cert", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    technicalScore: 75, financialScore: 70, complianceScore: 78,
    orders: 0, materials: ["Generators", "Compressors"], onboardDate: "2024-04-28"
  },
  {
    vendorId: "V-017",
    name: "Neo Tech Plumbing",
    type: "resource",
    status: "Under Review",
    score: 0,
    riskLevel: "Pending",
    category: "Uncategorized",
    contact: { person: "Natalie Portman", phone: "+1 234 567 810", email: "natalie@neotech.com" },
    documents: [{ name: "Labour License", status: "Uploaded" }, { name: "Insurance Policy", status: "Pending" }],
    compliance: { gstValidity: false, panVerification: false, bankVerification: false, blacklistCheck: false },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    orders: 0, materials: ["Plumbers", "Pipe Fitters"], onboardDate: "2024-05-04"
  },
  {
    vendorId: "V-018",
    name: "Geospatial Tech Solutions",
    type: "equipment",
    status: "Approved",
    score: 95,
    riskLevel: "Low",
    category: "Preferred",
    image: "/images/equipment_vendor_1777878807199.png",
    contact: { person: "Mike Johnson", phone: "+1 234 567 895", email: "mike@geospatial.com" },
    documents: [{ name: "Calibration Cert", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 98, priceScore: 90, responseScore: 95, overallRating: 95 },
    technicalScore: 98, financialScore: 90, complianceScore: 100,
    orders: 12, materials: ["Laser Scanners", "Drones", "360 Cameras"],
    inventory: [
      { id: "EQP-601", category: "Laser Scanner", materialName: "Focus Premium 350", brand: "FARO", price: 5000, unit: "day", quantity: 4, status: "Available", expectedDelivery: "Immediate", image: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=200&q=80" },
      { id: "EQP-602", category: "Laser Scanner", materialName: "RTC360 3D Laser Scanner", brand: "Leica", price: 6500, unit: "day", quantity: 2, status: "Low Stock", expectedDelivery: "2 Days", image: "https://images.unsplash.com/photo-1517420879524-86d64ac2f339?w=200&q=80" },
      { id: "EQP-603", category: "Drones", materialName: "Matrice 300 RTK", brand: "DJI", price: 3500, unit: "day", quantity: 5, status: "Available", expectedDelivery: "Immediate", image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=200&q=80" },
      { id: "EQP-604", category: "360 Camera", materialName: "Insta360 Pro 2", brand: "Insta360", price: 1500, unit: "day", quantity: 3, status: "Available", expectedDelivery: "Immediate", image: "https://images.unsplash.com/photo-1516961642265-531546e84af2?w=200&q=80" }
    ],
    onboardDate: "2023-11-20"
  },
  {
    vendorId: "V-019",
    name: "Green Thumb Landscaping",
    type: "special",
    status: "Approved",
    score: 88,
    riskLevel: "Low",
    category: "Preferred",
    contact: { person: "Alice Green", phone: "+1 234 567 811", email: "alice@greenthumb.com" },
    documents: [{ name: "Trade License", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 92, priceScore: 85, responseScore: 90, overallRating: 88 },
    technicalScore: 85, financialScore: 90, complianceScore: 95,
    orders: 14, materials: ["Landscaping", "Gardening"], 
    inventory: [
      { id: "SPC-019-1", category: "Plants", materialName: "Areca Palm (6ft)", price: 850, unit: "plant", quantity: 120, status: "Available", expectedDelivery: "2 Days" },
      { id: "SPC-019-2", category: "Lawn", materialName: "Bermuda Grass Roll", price: 45, unit: "sq.ft", quantity: 5000, status: "Available", expectedDelivery: "1 Day" },
      { id: "SPC-019-3", category: "Soil", materialName: "Organic Potting Mix", price: 150, unit: "bag", quantity: 80, status: "Low Stock", expectedDelivery: "Immediate" }
    ],
    onboardDate: "2023-04-12"
  },
  {
    vendorId: "V-020",
    name: "SecureTech Guards",
    type: "special",
    status: "Approved",
    score: 95,
    riskLevel: "Low",
    category: "Preferred",
    contact: { person: "Bob Shield", phone: "+1 234 567 812", email: "bob@securetech.com" },
    documents: [{ name: "Security License", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 98, priceScore: 90, responseScore: 95, overallRating: 95 },
    technicalScore: 95, financialScore: 90, complianceScore: 100,
    orders: 45, materials: ["Security", "CCTV Monitoring"], 
    inventory: [
      { id: "SPC-020-1", category: "Personnel", materialName: "Armed Security Guard", price: 1800, unit: "shift", quantity: 15, status: "Available", expectedDelivery: "Immediate", experience: "5+ Years" },
      { id: "SPC-020-2", category: "Personnel", materialName: "CCTV Operator", price: 1500, unit: "shift", quantity: 5, status: "Low Stock", expectedDelivery: "Immediate", experience: "3+ Years" },
      { id: "SPC-020-3", category: "Equipment", materialName: "Mobile Surveillance Unit", price: 5000, unit: "day", quantity: 2, status: "Available", expectedDelivery: "1 Day" }
    ],
    onboardDate: "2022-11-20"
  },
  {
    vendorId: "V-021",
    name: "Master Woodworks",
    type: "special",
    status: "Pending Approval",
    score: 75,
    riskLevel: "Medium",
    category: "Uncategorized",
    contact: { person: "Charlie Wood", phone: "+1 234 567 813", email: "charlie@masterwood.com" },
    documents: [{ name: "Trade License", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    technicalScore: 75, financialScore: 70, complianceScore: 80,
    orders: 0, materials: ["Carpentry", "Custom Furniture"], 
    inventory: [
      { id: "SPC-021-1", category: "Labor", materialName: "Master Carpenter", price: 1200, unit: "day", quantity: 8, status: "Available", expectedDelivery: "3 Days", experience: "10+ Years" },
      { id: "SPC-021-2", category: "Labor", materialName: "Assistant Carpenter", price: 800, unit: "day", quantity: 12, status: "Available", expectedDelivery: "1 Day", experience: "3+ Years" },
      { id: "SPC-021-3", category: "Materials", materialName: "Custom Teak Wood Panel", price: 3500, unit: "sq.ft", quantity: 0, status: "Out of Stock", expectedDelivery: "2 Weeks" }
    ],
    onboardDate: "2024-05-01"
  },
  {
    vendorId: "V-022",
    name: "Pest Terminator Inc.",
    type: "special",
    status: "Approved",
    score: 82,
    riskLevel: "Medium",
    category: "Approved",
    contact: { person: "Dave Bug", phone: "+1 234 567 814", email: "dave@pestterminator.com" },
    documents: [{ name: "Pest Control License", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 5, qualityScore: 85, priceScore: 80, responseScore: 88, overallRating: 82 },
    technicalScore: 80, financialScore: 85, complianceScore: 85,
    orders: 12, materials: ["Pest Control", "Fumigation"], 
    inventory: [
      { id: "SPC-022-1", category: "Service", materialName: "Termite Anti-Treatment", price: 25, unit: "sq.ft", quantity: 10000, status: "Available", expectedDelivery: "Next Day" },
      { id: "SPC-022-2", category: "Service", materialName: "General Disinfestation", price: 15, unit: "sq.ft", quantity: 50000, status: "Available", expectedDelivery: "Next Day" },
      { id: "SPC-022-3", category: "Equipment", materialName: "Industrial Fogging Machine", price: 3000, unit: "day", quantity: 3, status: "Available", expectedDelivery: "Immediate" }
    ],
    onboardDate: "2023-08-15"
  },
  {
    vendorId: "V-023",
    name: "Sparkle Cleaning Services",
    type: "special",
    status: "Approved",
    score: 90,
    riskLevel: "Low",
    category: "Preferred",
    contact: { person: "Eve Clean", phone: "+1 234 567 815", email: "eve@sparkleclean.com" },
    documents: [{ name: "Trade License", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 2, qualityScore: 92, priceScore: 88, responseScore: 95, overallRating: 90 },
    technicalScore: 90, financialScore: 88, complianceScore: 95,
    orders: 34, materials: ["Cleaning", "Daily Maintenance"], 
    inventory: [
      { id: "SPC-023-1", category: "Personnel", materialName: "Janitorial Staff", price: 800, unit: "shift", quantity: 40, status: "Available", expectedDelivery: "Immediate", experience: "2+ Years" },
      { id: "SPC-023-2", category: "Service", materialName: "Post-Construction Deep Clean", price: 12, unit: "sq.ft", quantity: 20000, status: "Available", expectedDelivery: "2 Days" },
      { id: "SPC-023-3", category: "Equipment", materialName: "Floor Scrubber Drier", price: 4500, unit: "day", quantity: 4, status: "Available", expectedDelivery: "Immediate" }
    ],
    onboardDate: "2023-01-10"
  },
  {
    vendorId: "V-024",
    name: "Elite Event Management",
    type: "special",
    status: "Under Review",
    score: 0,
    riskLevel: "Pending",
    category: "Uncategorized",
    contact: { person: "Fiona Party", phone: "+1 234 567 816", email: "fiona@eliteevents.com" },
    documents: [{ name: "Trade License", status: "Uploaded" }],
    compliance: { gstValidity: false, panVerification: false, bankVerification: false, blacklistCheck: false },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    orders: 0, materials: ["Event Setup", "Catering Coordination"], 
    inventory: [
      { id: "SPC-024-1", category: "Service", materialName: "Groundbreaking Ceremony Setup", price: 75000, unit: "event", quantity: 1, status: "Available", expectedDelivery: "1 Week" },
      { id: "SPC-024-2", category: "Service", materialName: "Site Inauguration Catering", price: 1500, unit: "plate", quantity: 500, status: "Available", expectedDelivery: "1 Week" },
      { id: "SPC-024-3", category: "Rental", materialName: "Premium AC Tent (100 pax)", price: 45000, unit: "day", quantity: 2, status: "Available", expectedDelivery: "3 Days" }
    ],
    onboardDate: "2024-05-06"
  },
  {
    vendorId: "V-025",
    name: "Rapid IT Support",
    type: "special",
    status: "Approved",
    score: 94,
    riskLevel: "Low",
    category: "Preferred",
    contact: { person: "George Tech", phone: "+1 234 567 817", email: "george@rapidit.com" },
    documents: [{ name: "Trade License", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 1, qualityScore: 96, priceScore: 90, responseScore: 98, overallRating: 94 },
    technicalScore: 95, financialScore: 92, complianceScore: 95,
    orders: 56, materials: ["IT Support", "Network Setup"], 
    inventory: [
      { id: "SPC-025-1", category: "Service", materialName: "Site Office Network Setup", price: 25000, unit: "lumpsum", quantity: 5, status: "Available", expectedDelivery: "3 Days" },
      { id: "SPC-025-2", category: "Personnel", materialName: "On-site IT Support Engineer", price: 2500, unit: "day", quantity: 3, status: "Available", expectedDelivery: "Next Day", experience: "4+ Years" },
      { id: "SPC-025-3", category: "Hardware", materialName: "Biometric Access Control System", price: 18000, unit: "unit", quantity: 10, status: "Available", expectedDelivery: "Immediate" }
    ],
    onboardDate: "2022-09-05"
  },
  {
    vendorId: "V-026",
    name: "A1 Scaffolding Specialists",
    type: "special",
    status: "Financial Check",
    score: 0,
    riskLevel: "Pending",
    category: "Uncategorized",
    contact: { person: "Harry Scaffold", phone: "+1 234 567 818", email: "harry@a1scaffold.com" },
    documents: [{ name: "Trade License", status: "Approved" }, { name: "Safety Cert", status: "Approved" }],
    compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true },
    performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
    technicalScore: 82,
    orders: 0, materials: ["Scaffolding", "Dismantling"], 
    inventory: [
      { id: "SPC-026-1", category: "Rental", materialName: "Cuplock Scaffolding System", price: 15, unit: "sq.m/day", quantity: 15000, status: "Available", expectedDelivery: "2 Days" },
      { id: "SPC-026-2", category: "Rental", materialName: "Mobile Access Tower (6m)", price: 1200, unit: "day", quantity: 8, status: "Available", expectedDelivery: "Immediate" },
      { id: "SPC-026-3", category: "Labor", materialName: "Certified Scaffolder", price: 1500, unit: "day", quantity: 25, status: "Available", expectedDelivery: "Next Day", experience: "5+ Years" }
    ],
    onboardDate: "2024-04-20"
  }
];

export function VendorTracker({ type }: { type: VendorType }) {
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isAddVendorOpen, setIsAddVendorOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "documents" | "billing">("overview");

  const [specialCategoryFilter, setSpecialCategoryFilter] = useState("All");
  const specialCategories = ["All", "Gardening", "Landscaping", "Security", "Carpentry", "Cleaning", "Pest Control", "Event Setup", "IT Support", "Scaffolding"];

  // New vendor form state
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorContact, setNewVendorContact] = useState("");
  const [newVendorEmail, setNewVendorEmail] = useState("");
  const [newVendorPhone, setNewVendorPhone] = useState("");

  // Workflow states
  const [techScoreInput, setTechScoreInput] = useState<number>(0);
  const [finScoreInput, setFinScoreInput] = useState<number>(0);
  const [compScoreInput, setCompScoreInput] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory>("Approved");
  const [selectedDocumentProject, setSelectedDocumentProject] = useState("All Projects");
  const [selectedInventoryCategory, setSelectedInventoryCategory] = useState("All Categories");

  const filteredVendors = vendors.filter((v) => {
    if (type !== "performance" && v.type !== type) return false;
    if (searchQuery && !v.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (type === "special" && specialCategoryFilter !== "All") {
      const match = v.materials.some(m => specialCategoryFilter.toLowerCase().includes(m.toLowerCase()) || m.toLowerCase().includes(specialCategoryFilter.toLowerCase()));
      if (!match) return false;
    }
    return true;
  });

  const getHeaderIcon = () => {
    switch (type) {
      case "supplier": return <Package className="h-5 w-5" />;
      case "resource": return <Users className="h-5 w-5" />;
      case "equipment": return <Truck className="h-5 w-5" />;
      case "special": return <Wrench className="h-5 w-5" />;
      case "performance": return <CheckCircle className="h-5 w-5" />;
    }
  };

  const getHeaderTitle = () => {
    switch (type) {
      case "supplier": return "Material Suppliers";
      case "resource": return "Resource Vendors";
      case "equipment": return "Equipment Vendors";
      case "special": return "Special Service Vendors";
      case "performance": return "Vendor Performance";
    }
  };

  const getHeaderSubtitle = () => {
    switch (type) {
      case "supplier": return "Material partners and supply network.";
      case "resource": return "Labour partners and manpower tracking.";
      case "equipment": return "Plant & machinery partners.";
      case "special": return "Gardening, landscaping, security & custom trades.";
      case "performance": return "Scorecards, ratings, and compliance checks.";
    }
  };

  const handleAddVendor = () => {
    if (!newVendorName) return;
    const newVendor: Vendor = {
      vendorId: `V-00${vendors.length + 1}`,
      name: newVendorName,
      type: type === "performance" ? "supplier" : type,
      status: "Under Review",
      score: 0,
      riskLevel: "Pending",
      category: "Uncategorized",
      contact: { person: newVendorContact, email: newVendorEmail, phone: newVendorPhone },
      documents: [
        { name: "Trade License", status: "Uploaded" },
        { name: "Tax Certificate", status: "Pending" }
      ],
      compliance: { gstValidity: false, panVerification: false, bankVerification: false, blacklistCheck: false },
      performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
      orders: 0, materials: [], onboardDate: new Date().toISOString().split("T")[0],
    };
    setVendors([newVendor, ...vendors]);
    setIsAddVendorOpen(false);
    setNewVendorName(""); setNewVendorContact(""); setNewVendorEmail(""); setNewVendorPhone("");
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors(vendors.map(v => v.vendorId === id ? { ...v, ...updates } : v));
    if (selectedVendor?.vendorId === id) {
      setSelectedVendor({ ...selectedVendor, ...updates });
    }
  };

  // Step 3 Action
  const handleAdminApproveDocs = () => {
    if (!selectedVendor) return;
    updateVendor(selectedVendor.vendorId, {
      documents: selectedVendor.documents.map(d => ({ ...d, status: "Approved" })),
      status: "Technical Evaluation"
    });
  };

  // Step 4 Action
  const handleTechSubmit = () => {
    if (!selectedVendor) return;
    updateVendor(selectedVendor.vendorId, {
      technicalScore: techScoreInput,
      status: "Financial Check"
    });
  };

  // Step 5 & 6 Action
  const handleFinAndCompSubmit = () => {
    if (!selectedVendor) return;
    const tech = selectedVendor.technicalScore || 0;
    const fin = finScoreInput;
    const comp = compScoreInput;
    const overallScore = Math.round((tech * 0.4) + (fin * 0.3) + (comp * 0.3));
    
    let risk: RiskLevel = "Low";
    if (overallScore < 60) risk = "High";
    else if (overallScore < 80) risk = "Medium";

    // Step 7 Logic: Auto approve if > 80
    const newStatus = overallScore > 80 ? "Approved" : (overallScore < 60 ? "Rejected" : "Pending Approval");
    const newCategory = overallScore > 80 ? "Preferred" : "Uncategorized";

    updateVendor(selectedVendor.vendorId, {
      financialScore: fin,
      complianceScore: comp,
      score: overallScore,
      riskLevel: risk,
      status: newStatus,
      category: newCategory,
      compliance: { gstValidity: true, panVerification: true, bankVerification: true, blacklistCheck: true }
    });
  };

  // Step 7 Manual Approval
  const handleManagerApprove = () => {
    if (!selectedVendor) return;
    updateVendor(selectedVendor.vendorId, {
      status: "Approved",
      category: selectedCategory
    });
  };

  const handleManagerReject = () => {
    if (!selectedVendor) return;
    updateVendor(selectedVendor.vendorId, {
      status: "Rejected",
      category: "Blacklisted"
    });
  };

  if (selectedVendor) {
    const isApproved = selectedVendor.status === "Approved";

    return (
      <div className="flex flex-col h-full bg-slate-50 overflow-auto">
        <div className="p-6">
          <button
            onClick={() => setSelectedVendor(null)}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to List
          </button>

          {/* Vendor Header Card */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row">
              {/* Image Section */}
              <div className="md:w-1/3 h-48 md:h-auto bg-slate-100 relative">
                {selectedVendor.image ? (
                  <img src={selectedVendor.image} alt={selectedVendor.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                    <Package className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                   <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white/20 text-white backdrop-blur-md uppercase tracking-wider shadow-sm">
                     {selectedVendor.type} Vendor
                   </span>
                </div>
              </div>
              
              {/* Info Section */}
              <div className="p-8 md:w-2/3 flex flex-col justify-between">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight">{selectedVendor.name}</h1>
                      <span className="text-sm font-mono font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200 shadow-sm">
                        {selectedVendor.vendorId}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mt-3">
                      <span className="flex items-center gap-2"><Users className="h-4 w-4"/> {selectedVendor.contact.person}</span>
                      <span>•</span>
                      <span>{selectedVendor.contact.email}</span>
                      <span>•</span>
                      <span>{selectedVendor.contact.phone}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-5 py-2 rounded-full text-sm font-bold border shadow-sm ${
                      selectedVendor.status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      selectedVendor.status === "Rejected" ? "bg-rose-50 text-rose-700 border-rose-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      Status: {selectedVendor.status}
                    </span>
                  </div>
                </div>

                {selectedVendor.score > 0 && (
                  <div className="flex items-center gap-8 mt-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xl shadow-sm">
                        {selectedVendor.score}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Overall Score</span>
                        <span className="text-sm font-bold text-slate-900">Out of 100</span>
                      </div>
                    </div>
                    <div className="h-10 w-px bg-slate-200"></div>
                    <div className="flex items-center gap-4">
                      <div className={`h-14 w-14 rounded-full flex items-center justify-center font-black text-xl border shadow-sm ${
                        selectedVendor.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        selectedVendor.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      }`}>
                        {selectedVendor.riskLevel.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Risk Level</span>
                        <span className={`text-sm font-bold ${
                          selectedVendor.riskLevel === 'Low' ? 'text-emerald-600' :
                          selectedVendor.riskLevel === 'Medium' ? 'text-amber-600' : 'text-rose-600'
                        }`}>{selectedVendor.riskLevel} Risk</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Workflow Stepper OR Dashboard */}
          {!isApproved && selectedVendor.status !== "Rejected" ? (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-900 p-5 flex items-center justify-between border-b border-slate-800">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-400" /> Vendor Onboarding Pipeline
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className={selectedVendor.status === "Under Review" ? "text-indigo-400 font-bold" : "text-emerald-400"}>Admin Verification</span> <ChevronRight className="h-4 w-4" />
                  <span className={selectedVendor.status === "Technical Evaluation" ? "text-indigo-400 font-bold" : (selectedVendor.technicalScore ? "text-emerald-400" : "")}>Technical</span> <ChevronRight className="h-4 w-4" />
                  <span className={selectedVendor.status === "Financial Check" ? "text-indigo-400 font-bold" : (selectedVendor.financialScore ? "text-emerald-400" : "")}>Fin & Comp</span> <ChevronRight className="h-4 w-4" />
                  <span className={selectedVendor.status === "Pending Approval" ? "text-indigo-400 font-bold" : ""}>Approval</span>
                </div>
              </div>

              <div className="p-8">
                {/* STEP 3: Admin Verification */}
                {selectedVendor.status === "Under Review" && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center mb-8">
                      <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileCheck className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Step 3: Admin Verification Dashboard</h3>
                      <p className="text-slate-500 mt-2">Verify all uploaded documents and basic compliance before proceeding.</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                      <h4 className="font-semibold mb-4 text-slate-900">Uploaded Documents</h4>
                      <div className="space-y-3">
                        {selectedVendor.documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <span className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-400" /> {doc.name}
                            </span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {doc.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center pt-4">
                      <button className="px-5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-700 hover:bg-slate-50">Ask Re-upload</button>
                      <button className="px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 font-medium text-rose-700 hover:bg-rose-100">Reject Vendor</button>
                      <button onClick={handleAdminApproveDocs} className="px-5 py-2.5 rounded-xl bg-indigo-600 font-medium text-white hover:bg-indigo-700 shadow-sm">Approve Documents</button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Technical Evaluation */}
                {selectedVendor.status === "Technical Evaluation" && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center mb-8">
                      <div className="h-16 w-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wrench className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Step 4: Technical Evaluation Form</h3>
                      <p className="text-slate-500 mt-2">Evaluate {selectedVendor.type} specific capabilities.</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
                      {selectedVendor.type === "supplier" && <p className="text-sm text-slate-600">Evaluate: Product quality, Brand reputation, Delivery capability, Stock availability, Past performance.</p>}
                      {selectedVendor.type === "resource" && <p className="text-sm text-slate-600">Evaluate: Manpower quality, Skill level, Past project execution, Safety compliance, Availability.</p>}
                      {selectedVendor.type === "equipment" && <p className="text-sm text-slate-600">Evaluate: Equipment condition, Availability, Operator skill, Maintenance quality, Breakdown history.</p>}
                      
                      <div className="pt-4">
                        <label className="block text-sm font-bold text-slate-900 mb-2">Overall Technical Score (0-100)</label>
                        <input 
                          type="number" min="0" max="100" 
                          value={techScoreInput} onChange={e => setTechScoreInput(Number(e.target.value))}
                          className="w-full text-xl p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center pt-4">
                      <button onClick={handleTechSubmit} disabled={!techScoreInput} className="px-8 py-3 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 shadow-md disabled:opacity-50">Submit Technical Score</button>
                    </div>
                  </div>
                )}

                {/* STEP 5 & 6: Financial & Compliance Check & Risk Scoring */}
                {selectedVendor.status === "Financial Check" && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="text-center mb-8">
                      <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calculator className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Step 5 & 6: Financial & Compliance Check</h3>
                      <p className="text-slate-500 mt-2">Input financial and compliance scores to generate overall Risk Level.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
                        <h4 className="font-bold flex items-center gap-2 text-slate-900"><Activity className="h-5 w-5 text-emerald-600"/> Financial Score (0-100)</h4>
                        <p className="text-xs text-slate-500">Based on Creditworthiness, Payment history, Bank verification.</p>
                        <input 
                          type="number" min="0" max="100" 
                          value={finScoreInput} onChange={e => setFinScoreInput(Number(e.target.value))}
                          className="w-full text-lg p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4">
                        <h4 className="font-bold flex items-center gap-2 text-slate-900"><ShieldCheck className="h-5 w-5 text-indigo-600"/> Compliance Score (0-100)</h4>
                        <p className="text-xs text-slate-500">Based on GST validity, PAN verification, Blacklist check.</p>
                        <input 
                          type="number" min="0" max="100" 
                          value={compScoreInput} onChange={e => setCompScoreInput(Number(e.target.value))}
                          className="w-full text-lg p-3 border border-slate-300 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                        />
                      </div>
                    </div>

                    <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-indigo-900">System Formula:</h4>
                        <p className="text-sm text-indigo-700">Overall Score = Technical (40%) + Financial (30%) + Compliance (30%)</p>
                      </div>
                      <button onClick={handleFinAndCompSubmit} disabled={!finScoreInput || !compScoreInput} className="px-6 py-2.5 rounded-xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 shadow-sm disabled:opacity-50">Generate Risk Score</button>
                    </div>
                  </div>
                )}

                {/* STEP 7: Approval Workflow */}
                {selectedVendor.status === "Pending Approval" && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div className="text-center mb-8">
                      <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldAlert className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900">Step 7: Vendor Approval Screen</h3>
                      <p className="text-slate-500 mt-2">Overall score is between 60-80. Manual Manager Approval Required.</p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">Categorize Vendor as:</span>
                        <select 
                          value={selectedCategory} 
                          onChange={e => setSelectedCategory(e.target.value as VendorCategory)}
                          className="border border-slate-300 rounded-lg p-2 outline-none"
                        >
                          <option value="Approved">Approved Vendor</option>
                          <option value="Trial">Trial Vendor</option>
                          <option value="Preferred">Preferred Vendor</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 justify-center pt-4">
                      <button onClick={handleManagerReject} className="px-8 py-3 rounded-xl border border-rose-200 bg-rose-50 font-bold text-rose-700 hover:bg-rose-100 flex items-center gap-2"><X className="h-5 w-5"/> Reject</button>
                      <button onClick={handleManagerApprove} className="px-8 py-3 rounded-xl bg-emerald-600 font-bold text-white hover:bg-emerald-700 shadow-md flex items-center gap-2"><Check className="h-5 w-5"/> Approve & Activate</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Dashboard / Vendor Detail Page for Approved Vendors */
            <div className="flex flex-col gap-6">
              {/* Tabs Container */}
              <div className="flex border-b border-slate-200 gap-8 px-2">
                <button 
                  onClick={() => setActiveTab("overview")}
                  className={`pb-4 font-bold text-sm transition-all relative ${activeTab === "overview" ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Overview Dashboard
                  {activeTab === "overview" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
                <button 
                  onClick={() => setActiveTab("inventory")}
                  className={`pb-4 font-bold text-sm transition-all relative ${activeTab === "inventory" ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {selectedVendor.type === 'resource' ? 'Resource Availability' : selectedVendor.type === 'equipment' ? 'Equipment Fleet' : 'Inventory Catalog'}
                  {activeTab === "inventory" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
                <button 
                  onClick={() => setActiveTab("documents")}
                  className={`pb-4 font-bold text-sm transition-all relative ${activeTab === "documents" ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Documents & Details
                  {activeTab === "documents" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
                <button 
                  onClick={() => setActiveTab("billing")}
                  className={`pb-4 font-bold text-sm transition-all relative ${activeTab === "billing" ? "text-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Billing & Payments
                  {activeTab === "billing" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full"></span>}
                </button>
              </div>

              {activeTab === "overview" && (
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    {/* Performance Dashboard */}
                    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-indigo-600" /> Vendor Performance Dashboard (Post-Onboarding)
                      </h3>
                      
                      <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">On-Time Delivery</p>
                          <p className="text-2xl font-black text-slate-900">{selectedVendor.performance.deliveryDelay > 0 ? 100 - selectedVendor.performance.deliveryDelay : '--'}%</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Quality Score</p>
                          <p className="text-2xl font-black text-slate-900">{selectedVendor.performance.qualityScore || '--'}/100</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Price Comp.</p>
                          <p className="text-2xl font-black text-slate-900">{selectedVendor.performance.priceScore || '--'}/100</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Response Time</p>
                          <p className="text-2xl font-black text-slate-900">{selectedVendor.performance.responseScore || '--'}/100</p>
                        </div>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Award className="h-8 w-8 text-indigo-600" />
                          <div>
                            <h4 className="font-bold text-indigo-900">Current AI Overall Rating: {selectedVendor.performance.overallRating || '--'} / 100</h4>
                            <p className="text-sm text-indigo-700">This feeds into the AI Vendor Recommendation engine for RFQs.</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Package className="h-5 w-5 text-slate-500" />
                        Supplied Materials / Services
                      </h3>
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                        {selectedVendor.materials.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {selectedVendor.materials.map((m) => (
                              <span key={m} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm">
                                {m}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No materials or services listed yet.</p>
                        )}
                      </div>
                    </section>
                  </div>

                  <div className="col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
                      <h3 className="text-lg font-bold text-slate-900">Vendor Master Details</h3>
                      
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category</h4>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-bold ${
                          selectedVendor.category === 'Preferred' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          selectedVendor.category === 'Trial' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>{selectedVendor.category} Vendor</span>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Compliance Status</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle className="h-4 w-4 text-emerald-500"/> GST Validity Verified</div>
                          <div className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle className="h-4 w-4 text-emerald-500"/> PAN Verified</div>
                          <div className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle className="h-4 w-4 text-emerald-500"/> Bank Verification Done</div>
                          <div className="flex items-center gap-2 text-sm text-slate-700"><CheckCircle className="h-4 w-4 text-emerald-500"/> Blacklist Checked</div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Evaluation Scores</h4>
                        <div className="space-y-1 mt-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Technical (40%)</span>
                            <span className="font-bold text-slate-900">{selectedVendor.technicalScore || '--'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Financial (30%)</span>
                            <span className="font-bold text-slate-900">{selectedVendor.financialScore || '--'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600">Compliance (30%)</span>
                            <span className="font-bold text-slate-900">{selectedVendor.complianceScore || '--'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Procurement Orders</h4>
                        <p className="text-3xl font-black text-slate-900">{selectedVendor.orders}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Onboarded On</h4>
                        <p className="text-sm font-medium text-slate-900">{selectedVendor.onboardDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "inventory" && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      {selectedVendor.type === 'resource' ? <Users className="h-5 w-5 text-indigo-600" /> : selectedVendor.type === 'equipment' ? <Truck className="h-5 w-5 text-indigo-600" /> : selectedVendor.type === 'special' ? <Wrench className="h-5 w-5 text-indigo-600" /> : <Package className="h-5 w-5 text-indigo-600" />}
                      {selectedVendor.type === 'resource' ? 'Resource Availability & Categories' : selectedVendor.type === 'equipment' ? 'Equipment Fleet Catalog' : selectedVendor.type === 'special' ? 'Service & Capability Catalog' : 'Inventory Catalog'}
                    </h3>
                    {(selectedVendor.type === 'resource' || selectedVendor.type === 'equipment' || selectedVendor.type === 'special') && selectedVendor.inventory && selectedVendor.inventory.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-500">Filter:</span>
                        <select
                          value={selectedInventoryCategory}
                          onChange={(e) => setSelectedInventoryCategory(e.target.value)}
                          className="text-sm border border-slate-200 bg-slate-50 text-slate-700 font-bold py-1.5 px-3 rounded-lg outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                        >
                          <option value="All Categories">All Categories</option>
                          {Array.from(new Set(selectedVendor.inventory.map(i => i.category).filter(Boolean))).map(cat => (
                            <option key={cat as string} value={cat as string}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  {selectedVendor.inventory && selectedVendor.inventory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4">{selectedVendor.type === 'resource' ? 'Resource Category / Role' : selectedVendor.type === 'equipment' ? 'Equipment Category / Model' : selectedVendor.type === 'special' ? 'Service / Sub-category' : 'Material Name'}</th>
                            {selectedVendor.type === 'resource' && <th className="p-4">Avg. Experience</th>}
                            {selectedVendor.type === 'equipment' && <th className="p-4">Brand</th>}
                            <th className="p-4">Rate / Unit</th>
                            <th className="p-4">{selectedVendor.type === 'resource' ? 'Available Headcount' : selectedVendor.type === 'equipment' ? 'Available Units' : selectedVendor.type === 'special' ? 'Capacity / Qty' : 'Quantity Available'}</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">{selectedVendor.type === 'resource' ? 'Deployment Lead Time' : selectedVendor.type === 'special' ? 'Mobilization Time' : 'Expected Delivery'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedVendor.inventory
                            .filter(item => (selectedVendor.type !== 'resource' && selectedVendor.type !== 'equipment' && selectedVendor.type !== 'special') || selectedInventoryCategory === 'All Categories' || item.category === selectedInventoryCategory)
                            .map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                    {item.image ? (
                                      <img src={item.image} alt={item.materialName} className="h-full w-full object-cover" />
                                    ) : (
                                      selectedVendor.type === 'resource' ? <Users className="h-5 w-5 text-slate-400" /> : selectedVendor.type === 'equipment' ? <Truck className="h-5 w-5 text-slate-400" /> : <Package className="h-5 w-5 text-slate-400" />
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-900">{item.materialName}</div>
                                    {item.category && selectedVendor.type !== 'equipment' && <div className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider rounded border border-indigo-100">{item.category}</div>}
                                    {item.category && selectedVendor.type === 'equipment' && <div className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-100">{item.category}</div>}
                                    <div className="text-xs text-slate-500 font-mono mt-1">{item.id}</div>
                                  </div>
                                </div>
                              </td>
                              {selectedVendor.type === 'resource' && (
                                <td className="p-4 text-sm font-medium text-slate-700">
                                  {item.experience || '--'}
                                </td>
                              )}
                              {selectedVendor.type === 'equipment' && (
                                <td className="p-4 text-sm font-medium text-slate-700">
                                  {item.brand || '--'}
                                </td>
                              )}
                              <td className="p-4 text-sm font-medium text-slate-700">
                                ₹{item.price.toLocaleString()} <span className="text-slate-400 font-normal">/ {item.unit}</span>
                              </td>
                              <td className="p-4 text-sm font-medium text-slate-700">
                                {item.quantity.toLocaleString()} {selectedVendor.type === 'resource' ? 'Pax' : selectedVendor.type === 'equipment' ? 'Units' : `${item.unit}s`}
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${
                                  item.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-rose-50 text-rose-700 border-rose-200'
                                }`}>
                                  {item.status}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-slate-600 font-medium">
                                <div className="flex items-center gap-1.5">
                                  <Truck className="h-4 w-4 text-slate-400" />
                                  {item.expectedDelivery}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center text-slate-500">
                      {selectedVendor.type === 'resource' ? <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" /> : selectedVendor.type === 'equipment' ? <Truck className="h-12 w-12 text-slate-300 mx-auto mb-3" /> : <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />}
                      <p className="font-medium">No {selectedVendor.type === 'resource' ? 'resource availability' : selectedVendor.type === 'equipment' ? 'equipment catalog' : 'inventory'} data available for this vendor.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "documents" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" /> Vendor Documents
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-500">Project Filter:</span>
                        <select 
                          value={selectedDocumentProject}
                          onChange={(e) => setSelectedDocumentProject(e.target.value)}
                          className="text-sm border border-slate-200 bg-slate-50 text-slate-700 font-bold py-1.5 px-3 rounded-lg outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                        >
                          <option value="All Projects">All Projects (Master)</option>
                          <option value="Project Alpha">Project Alpha</option>
                          <option value="Project Beta">Project Beta</option>
                          <option value="Skyline Tower">Skyline Tower</option>
                          <option value="Riverside Complex">Riverside Complex</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedVendor.documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 transition-colors hover:bg-slate-100/50">
                          <div className="flex items-center gap-3">
                            <FileText className="h-6 w-6 text-slate-400" />
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{doc.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-slate-500">Updated recently</span>
                                {selectedDocumentProject !== "All Projects" && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded">{selectedDocumentProject}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${doc.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {doc.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                     <h3 className="text-lg font-bold text-slate-900 mb-6">Contact & Business Details</h3>
                     <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <p className="text-sm font-bold text-slate-500">Contact Person</p>
                           <p className="text-base font-medium text-slate-900">{selectedVendor.contact.person}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-sm font-bold text-slate-500">Email Address</p>
                           <p className="text-base font-medium text-slate-900">{selectedVendor.contact.email}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-sm font-bold text-slate-500">Phone Number</p>
                           <p className="text-base font-medium text-slate-900">{selectedVendor.contact.phone}</p>
                        </div>
                        <div className="space-y-2">
                           <p className="text-sm font-bold text-slate-500">Onboarding Date</p>
                           <p className="text-base font-medium text-slate-900">{selectedVendor.onboardDate}</p>
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {activeTab === "billing" && (
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center justify-between">
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Billing Overview</h3>
                        <p className="text-sm text-slate-500">Recent transactions and outstanding balances</p>
                     </div>
                     <div className="flex gap-4">
                        <div className="text-right">
                           <p className="text-xs font-bold text-slate-500 uppercase">Outstanding Balance</p>
                           <p className="text-2xl font-black text-rose-600">₹0.00</p>
                        </div>
                        <div className="w-px bg-slate-200"></div>
                        <div className="text-right">
                           <p className="text-xs font-bold text-slate-500 uppercase">Total Paid (YTD)</p>
                           <p className="text-2xl font-black text-emerald-600">₹{((selectedVendor.orders * 15000) || 0).toLocaleString()}</p>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" /> Recent Invoices
                      </h3>
                    </div>
                    <div className="p-12 text-center text-slate-500 bg-slate-50/50">
                       <FileCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                       <p className="font-medium">No recent invoices found for this vendor.</p>
                       <button className="mt-4 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-bold text-indigo-600 hover:bg-slate-50">Upload Invoice</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-auto">
      <div className="p-6 w-full h-full flex flex-col">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100">
              {getHeaderIcon()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{getHeaderTitle()}</h1>
              <p className="text-slate-500 mt-1">{getHeaderSubtitle()}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsAddVendorOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow"
          >
            <Mail className="h-4 w-4" />
            Invite a vendor
          </button>
        </div>

        {/* Beautiful Stats Row */}
        {type !== "special" && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 shadow-lg shadow-indigo-500/30 text-white transform transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/40">
            <div className="absolute -right-4 -top-4 opacity-20">
              <Users className="h-32 w-32" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-indigo-50 uppercase tracking-widest">Total Vendors</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black">{filteredVendors.length}</p>
                <span className="text-sm font-medium text-indigo-100 bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> +12%
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 p-6 shadow-lg shadow-emerald-500/30 text-white transform transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/40">
            <div className="absolute -right-4 -top-4 opacity-20">
              <CheckCircle className="h-32 w-32" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-emerald-50 uppercase tracking-widest">Approved</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black">{filteredVendors.filter(v => v.status === "Approved").length}</p>
                <span className="text-sm font-medium text-emerald-100 bg-white/10 px-2 py-0.5 rounded-full">Active</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-6 shadow-lg shadow-amber-500/30 text-white transform transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/40">
            <div className="absolute -right-4 -top-4 opacity-20">
              <Clock className="h-32 w-32" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-amber-50 uppercase tracking-widest">In Pipeline</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black">{filteredVendors.filter(v => ["Under Review", "Technical Evaluation", "Financial Check", "Pending Approval"].includes(v.status)).length}</p>
                <span className="text-sm font-medium text-amber-100 bg-white/10 px-2 py-0.5 rounded-full">Evaluating</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-6 shadow-lg shadow-blue-500/30 text-white transform transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/40">
            <div className="absolute -right-4 -top-4 opacity-20">
              <Package className="h-32 w-32" />
            </div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm shadow-inner">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-sm font-bold text-blue-50 uppercase tracking-widest">Total Orders</h3>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-black">{filteredVendors.reduce((sum, v) => sum + v.orders, 0)}</p>
                <span className="text-sm font-medium text-blue-100 bg-white/10 px-2 py-0.5 rounded-full">Fulfilled</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Master List */}
        <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col ${type === "special" ? "flex-1" : ""}`}>
          <div className="flex items-center justify-between border-b border-slate-200 p-4 bg-slate-50/50">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor master list..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all bg-white"
              />
            </div>
            {type === "special" && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pl-4">
                {specialCategories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSpecialCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                      specialCategoryFilter === cat 
                        ? "bg-indigo-600 text-white shadow-sm" 
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-[2fr_1fr_1fr_100px_1fr] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            <span>Vendor Name</span>
            <span>Category</span>
            <span>Overall Score</span>
            <span>Risk</span>
            <span className="text-right">Workflow Status</span>
          </div>
          
          <div className={`divide-y divide-slate-100 ${type === "special" ? "flex-1 overflow-auto" : ""}`}>
            {filteredVendors.map((vendor) => (
              <div 
                key={vendor.vendorId} 
                className="grid grid-cols-[2fr_1fr_1fr_100px_1fr] gap-4 items-center px-6 py-4 hover:bg-slate-50 cursor-pointer transition-colors group"
                onClick={() => {
                  setSelectedVendor(vendor);
                  setSelectedInventoryCategory("All Categories");
                }}
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                    {vendor.name}
                    {vendor.status === "Approved" && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1 truncate">{vendor.vendorId} • {vendor.type} Vendor</p>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                    vendor.category === "Preferred" ? "bg-indigo-50 text-indigo-700" :
                    vendor.category === "Trial" ? "bg-amber-50 text-amber-700" :
                    "bg-slate-100 text-slate-600"
                  }`}>
                    {vendor.category}
                  </span>
                </div>
                <div className="flex flex-col">
                  {vendor.score > 0 ? (
                    <span className="text-base font-black text-slate-900">{vendor.score}<span className="text-xs text-slate-400">/100</span></span>
                  ) : <span className="text-slate-400 font-medium text-sm">Evaluating</span>}
                </div>
                <div>
                  <span className={`text-sm font-bold ${
                    vendor.riskLevel === 'Low' ? 'text-emerald-600' :
                    vendor.riskLevel === 'Medium' ? 'text-amber-600' :
                    vendor.riskLevel === 'High' ? 'text-rose-600' : 'text-slate-400'
                  }`}>
                    {vendor.riskLevel}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    vendor.status === "Approved" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : 
                    vendor.status === "Rejected" ? "bg-rose-50 text-rose-700 border border-rose-200" : 
                    "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {vendor.status}
                  </span>
                </div>
              </div>
            ))}
            {filteredVendors.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No vendors found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isAddVendorOpen} onOpenChange={setIsAddVendorOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invite Vendor
            </DialogTitle>
            <DialogDescription className="text-indigo-100 mt-1 font-medium">
              Send an invitation to join your network.
            </DialogDescription>
          </div>
          
          <div className="p-6 bg-white">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900">Email Address</label>
              <input
                type="email"
                value={newVendorEmail}
                onChange={(e) => setNewVendorEmail(e.target.value)}
                placeholder="vendor@example.com"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all bg-slate-50 focus:bg-white"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={() => setIsAddVendorOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const newVendor: Vendor = {
                  vendorId: `V-00${vendors.length + 1}`,
                  name: newVendorEmail.split('@')[0],
                  type: type === "performance" ? "supplier" : type,
                  status: "Under Review",
                  score: 0,
                  riskLevel: "Pending",
                  category: "Uncategorized",
                  contact: { person: "Pending", email: newVendorEmail, phone: "Pending" },
                  documents: [],
                  compliance: { gstValidity: false, panVerification: false, bankVerification: false, blacklistCheck: false },
                  performance: { deliveryDelay: 0, qualityScore: 0, priceScore: 0, responseScore: 0, overallRating: 0 },
                  orders: 0, materials: [], onboardDate: new Date().toISOString().split("T")[0],
                };
                setVendors([newVendor, ...vendors]);
                setIsAddVendorOpen(false);
                setNewVendorEmail("");
              }}
              disabled={!newVendorEmail}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Send Invite
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
