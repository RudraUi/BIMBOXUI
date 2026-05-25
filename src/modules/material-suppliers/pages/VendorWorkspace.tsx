import React, { useState, useTransition, ReactNode } from 'react';
import { useSuppliers } from '../context/SupplierContext';
import { 
  Shield, Briefcase, User, RefreshCw, Activity, ChevronDown, CheckCircle2,
  AlertCircle, ShieldAlert, Award, FileText, CheckCircle, Info, HelpCircle
} from 'lucide-react';
import { Role } from '../types/supplier.types';
import { MaterialSupplierListPage } from './MaterialSupplierListPage';
import { MaterialReceivingPage } from './MaterialReceivingPage';
import { VendorPortalPage } from './VendorPortalPage';

// Meta data for the Vendor workflow steps
interface VendorFlowMeta {
  label: string;
  sublabel: string;
  status: string;
  owner: string;
  detail: string;
  inputFrom: string;
  outputTo: string;
}

const vendorFlowMeta: Record<string, VendorFlowMeta> = {
  "material-vendor": {
    label: "Supplier Registry",
    sublabel: "Directory & RFQs",
    status: "Active Directory",
    owner: "Samuel Rodriguez (Procurement Head)",
    detail: "Manage onboarded construction suppliers, categories, trade licenses, compliance status, and active item catalogs.",
    inputFrom: "Onboarding Request",
    outputTo: "RFQ Opportunity"
  },
  "receiving": {
    label: "Site Receiving",
    sublabel: "GRN & QA/QC",
    status: "Active Gate Entry",
    owner: "Aarav Sharma (Site Engineer)",
    detail: "Verify arriving transport trucks against pending PO line items, issue digitised Goods Receipt Notes (GRN), and log laboratory tests.",
    inputFrom: "Logistics Dispatch",
    outputTo: "Lab Compliance Inspection"
  },
  "portal": {
    label: "Vendor Portal",
    sublabel: "Bid & Dispatch (Sim)",
    status: "Collaboration Active",
    owner: "External Vendor Agent",
    detail: "Simulate external vendor actions: view pricing bids, review received POs, dispatch challans, and upload tax invoices.",
    inputFrom: "Sourcing Requisition",
    outputTo: "Ledger Matching / Settlement"
  }
};

interface VendorWorkspaceProps {
  activeVendorFlow: string;
  onFlowChange: (flow: string) => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  myProjects: string[];
  sharedProjects: string[];
}

export const VendorWorkspace: React.FC<VendorWorkspaceProps> = ({
  activeVendorFlow,
  onFlowChange,
  selectedProject,
  onProjectChange,
  myProjects,
  sharedProjects,
}) => {
  const { role, setRole, activeVendorId, setActiveVendorId, suppliers, resetData } = useSuppliers();
  const [, startTransition] = useTransition();

  // Test Flow State
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestingOpen, setTestingOpen] = useState(false);

  const activeVendor = suppliers.find(s => s.id === activeVendorId) || suppliers[0];

  const handleTestFlow = () => {
    setTestingOpen(true);
    setTestResult("Analyzing...");
    setTimeout(() => {
      if (!activeVendor) {
        setTestResult("Failed: No active vendor selected for simulation.");
        return;
      }
      const kyc = activeVendor.compliance === 'Complete' ? 'Passed' : 'Pending KYC';
      const risk = activeVendor.risk === 'Low' ? 'Safe' : 'Medium/High Risk';
      const gst = activeVendor.gstNumber ? 'GST Checked' : 'No GST Registration';
      setTestResult(`Health Check: ${kyc} · ${risk} · ${gst}`);
    }, 800);
  };

  return (
    <div className="flex h-full flex-col font-sans text-slate-800 antialiased bg-slate-50">
      
      {/* 1. PROJECT HEADER */}
      <VendorProjectHeader
        selectedProject={selectedProject}
        onProjectChange={onProjectChange}
        myProjects={myProjects}
        sharedProjects={sharedProjects}
      />

      {/* 2. MAIN LAYOUT AND WORKSPACE BARS */}
      <div className="p-6 w-full flex-1 flex flex-col gap-6">
        
        {/* VENDOR LINKED CONTEXT BAR */}
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm shadow-slate-950/5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between border-b border-slate-100 pb-4 mb-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-blue-700">
                  Procurement Chain Status
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {activeVendor ? `${activeVendor.name} · ${activeVendor.id}` : 'No Vendor Selected'}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500">
                  PAN: {activeVendor?.panNumber || 'N/A'} · GST: {activeVendor?.gstNumber || 'N/A'}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Mode: <span className="font-semibold text-slate-600 capitalize">{role === 'vendor' ? 'External Vendor Simulator' : `${role} Access`}</span>
              </p>
            </div>

            {/* CONTROL PANEL */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Reset Demo Button */}
              <button
                onClick={resetData}
                title="Reset Prototype mock database"
                className="flex items-center justify-center gap-1.5 h-8 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 px-3 rounded-lg text-xs font-bold text-slate-600 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Mock
              </button>

              <div className="h-6 w-px bg-slate-200 mx-1"></div>

              {/* Test Flow Button */}
              <button
                type="button"
                onClick={handleTestFlow}
                className="h-8 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-150 px-3 text-xs font-bold text-blue-700 transition cursor-pointer"
              >
                Test flow
              </button>

              {/* Role Selection Tabs */}
              {(['admin', 'manager', 'vendor'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`h-8 rounded-lg px-3 text-xs font-bold transition cursor-pointer ${
                    role === r 
                      ? "bg-blue-600 text-white shadow-sm shadow-blue-600/20" 
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
                  }`}
                >
                  {r === 'admin' ? 'Admin' : r === 'manager' ? 'Manager' : 'Vendor Portal'}
                </button>
              ))}
            </div>
          </div>

          {/* SIMULATOR SWITCHER BANNER WHEN ROLE IS VENDOR */}
          {role === 'vendor' && (
            <div className="flex items-center gap-2.5 bg-blue-50/50 border border-blue-100 rounded-xl p-3 mb-4 animate-fade-in">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs text-blue-800 font-semibold">Vendor Portal Simulation:</span>
              <select
                value={activeVendorId}
                onChange={(e) => setActiveVendorId(e.target.value)}
                className="bg-white border border-blue-200 text-slate-800 rounded-lg px-2.5 py-1 text-xs outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer font-bold"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-blue-500 font-bold ml-auto uppercase tracking-wide">
                Changes simulate {activeVendor?.name} action
              </span>
            </div>
          )}

          {/* STEP TABS STRIP */}
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {Object.keys(vendorFlowMeta).map((flow, index) => {
                const meta = vendorFlowMeta[flow];
                const isActive = activeVendorFlow === flow || (activeVendorFlow === 'material-vendor' && flow === 'material-vendor') || (activeVendorFlow !== 'receiving' && activeVendorFlow !== 'portal' && flow === 'material-vendor');
                return (
                  <button
                    key={flow}
                    type="button"
                    onClick={() => startTransition(() => onFlowChange(flow))}
                    className={`min-w-[190px] rounded-xl border p-3 text-left transition cursor-pointer ${
                      isActive
                        ? "border-blue-200 bg-blue-50/70 text-blue-800"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold">
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${isActive ? "bg-blue-600 text-white" : "bg-white text-slate-500 border border-slate-200"}`}>
                        {index + 1}
                      </span>
                      {meta.label}
                    </span>
                    <span className="mt-1 block text-[10px] opacity-75 font-semibold">
                      {meta.sublabel} · {meta.status}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* FLOW META DESCRIPTIVE CARD */}
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Current Flow Stage</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border">
                  {vendorFlowMeta[activeVendorFlow === 'receiving' ? 'receiving' : activeVendorFlow === 'portal' ? 'portal' : 'material-vendor']?.status}
                </span>
              </div>
              <p className="mt-1 text-xs font-bold text-slate-900">
                {vendorFlowMeta[activeVendorFlow === 'receiving' ? 'receiving' : activeVendorFlow === 'portal' ? 'portal' : 'material-vendor']?.label} · Owner: {vendorFlowMeta[activeVendorFlow === 'receiving' ? 'receiving' : activeVendorFlow === 'portal' ? 'portal' : 'material-vendor']?.owner}
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 font-medium">
                {vendorFlowMeta[activeVendorFlow === 'receiving' ? 'receiving' : activeVendorFlow === 'portal' ? 'portal' : 'material-vendor']?.detail}
              </p>
            </div>
          </div>

          {/* DEPENDENCY METRICS ROW */}
          <div className="mt-4 grid gap-4 md:grid-cols-3 border-t border-slate-100 pt-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Input Source</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-150 mt-1.5">
                {vendorFlowMeta[activeVendorFlow === 'receiving' ? 'receiving' : activeVendorFlow === 'portal' ? 'portal' : 'material-vendor']?.inputFrom}
              </span>
            </div>
            
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Output Target</p>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-white text-slate-600 border border-slate-150 mt-1.5">
                {vendorFlowMeta[activeVendorFlow === 'receiving' ? 'receiving' : activeVendorFlow === 'portal' ? 'portal' : 'material-vendor']?.outputTo}
              </span>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Compliance Audit Trail</p>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mt-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Verified & Secure
              </span>
            </div>
          </div>
        </div>

        {/* 3. CHILD PAGE CONTENT */}
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {activeVendorFlow === "receiving" ? (
            <MaterialReceivingPage />
          ) : activeVendorFlow === "portal" ? (
            <VendorPortalPage />
          ) : (
            <MaterialSupplierListPage />
          )}
        </div>
      </div>

      {/* 4. MOCK TEST FLOW RESULTS MODAL */}
      {isTestingOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-base text-slate-900 border-b pb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600 animate-bounce" />
              Sourcing Pipeline Audit
            </h3>
            
            <div className="my-4 space-y-3">
              <div className="bg-slate-50 rounded-xl p-3 border text-xs leading-relaxed space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Active Project:</span>
                  <span className="text-slate-800 font-bold">{selectedProject}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Supplier simulated:</span>
                  <span className="text-slate-800 font-bold">{activeVendor?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-semibold">Audit Check:</span>
                  <span className="text-blue-700 font-bold">{testResult}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Procurement Readiness Checklists</span>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Vendor KYC documents verified & signed
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Commercial catalog prices matched
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Automated RFQ pipeline listening
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button 
                type="button" 
                onClick={() => setTestingOpen(false)} 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-sm shadow-blue-600/10"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Internal Project Header component modeled on ResourceProjectHeader
function VendorProjectHeader({
  selectedProject,
  onProjectChange,
  myProjects,
  sharedProjects,
}: {
  selectedProject: string;
  onProjectChange: (project: string) => void;
  myProjects: string[];
  sharedProjects: string[];
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"my" | "shared">("my");
  const visibleProjects = tab === "my" ? myProjects : sharedProjects;

  return (
    <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-8 py-3.5 backdrop-blur-xl shadow-xs">
      <div className="flex min-h-9 flex-wrap items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3">
          <div className="relative inline-flex">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="group inline-flex items-center gap-2.5 rounded-xl px-1.5 py-1 transition hover:bg-slate-50 cursor-pointer"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/15">
                <Activity className="h-4 w-4 animate-pulse" />
              </span>
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-0.5">Active Project</span>
                <span className="max-w-[320px] truncate text-sm font-bold text-slate-900 leading-none">{selectedProject}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
              <div className="absolute left-9 top-12 z-50 w-[318px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15 animate-zoom-in">
                {/* Custom Tab Switcher */}
                <div className="flex border-b border-slate-100 mb-2">
                  <button
                    onClick={() => setTab("my")}
                    className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition ${tab === "my" ? "border-blue-600 text-slate-950" : "border-transparent text-slate-400 hover:text-slate-700"}`}
                  >
                    My Projects
                  </button>
                  <button
                    onClick={() => setTab("shared")}
                    className={`flex-1 py-1.5 text-xs font-bold border-b-2 transition ${tab === "shared" ? "border-blue-600 text-slate-950" : "border-transparent text-slate-400 hover:text-slate-700"}`}
                  >
                    Shared
                  </button>
                </div>
                
                <div className="max-h-[280px] overflow-y-auto py-1">
                  {visibleProjects.map((project) => (
                    <button
                      key={project}
                      type="button"
                      onClick={() => {
                        onProjectChange(project);
                        setOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 cursor-pointer"
                    >
                      <span>{project}</span>
                      {selectedProject === project && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Standardised Portal UI
          </span>
        </div>
      </div>
    </div>
  );
}
