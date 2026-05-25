import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useSuppliers } from '../context/SupplierContext';
import { 
  Supplier, SupplierStatus, ComplianceStatus, RiskLevel, 
  MaterialItem, RFQ, Quotation, PurchaseOrder, Delivery, GRN, 
  QualityCheck, Invoice, CommunicationLog, ProjectAssociation
} from '../types/supplier.types';
import { 
  ArrowLeft, Star, AlertTriangle, ShieldCheck, Mail, Phone, MapPin, 
  Calendar, Globe, Shield, RefreshCw, FileText, CheckCircle2, XCircle, 
  Plus, Edit, Eye, MessageSquare, Download, Upload, AlertCircle, TrendingUp,
  FileCheck, ShieldAlert, Award, FileSpreadsheet, Send, DollarSign, Clock, Truck
} from 'lucide-react';

export const MaterialSupplierDetailPage: React.FC = () => {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  
  const { 
    suppliers, rfqs, quotations, purchaseOrders, deliveries, grns, qualityChecks, invoices, 
    communicationLogs, auditLogs, role,
    updateSupplier, addCommunicationLog, createRFQ, submitQuotation, approvePO, updatePOStatus,
    convertRFQToPO, performQualityCheck, approveInvoice, rejectInvoice, recordPayment, addAuditLog
  } = useSuppliers();

  const supplier = useMemo(() => suppliers.find(s => s.id === supplierId), [suppliers, supplierId]);

  // Tab State - Support 13 Tabs
  type TabName = 'Overview' | 'Catalog' | 'RFQs' | 'Quotations' | 'POs' | 'Deliveries' | 'QC' | 'Invoices' | 'Documents' | 'Projects' | 'CommLog' | 'Performance' | 'Audit';
  const [activeTab, setActiveTab] = useState<TabName>('Overview');

  // Interactive Form/Modal States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMaterialModal, setShowAddMaterialModal] = useState(false);
  const [showCreateRFQModal, setShowCreateRFQModal] = useState(false);
  const [showLogCommModal, setShowLogCommModal] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);
  const [showQCRecordModal, setShowQCRecordModal] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedQCForAction, setSelectedQCForAction] = useState<QualityCheck | null>(null);

  // Draft States
  const [editForm, setEditForm] = useState<Partial<Supplier>>({});
  const [materialDraft, setMaterialDraft] = useState<Partial<MaterialItem>>({
    category: 'Cement',
    name: '',
    brand: '',
    unit: 'Bag',
    moq: 100,
    rate: 0,
    taxPercent: 18,
    availability: 'In Stock'
  });
  const [rfqDraft, setRfqDraft] = useState({
    project: 'Skyline Residency',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    deliveryDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    materialName: '',
    quantity: 100,
    unit: 'Bag',
    expectedRate: 0,
    remarks: ''
  });
  const [commDraft, setCommDraft] = useState({
    type: 'Call' as CommunicationLog['type'],
    subject: '',
    description: '',
    visibility: 'Internal Only' as const,
    followUpRequired: false,
    followUpDate: ''
  });
  const [paymentDraft, setPaymentDraft] = useState({
    amount: '',
    mode: 'Bank Transfer',
    transactionId: '',
    remarks: ''
  });
  const [qcDraft, setQcDraft] = useState({
    result: 'Passed' as 'Passed' | 'Failed',
    acceptedQty: 0,
    rejectedQty: 0,
    notes: ''
  });

  // Simulated file uploads
  const [uploadProgress, setUploadProgress] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (!supplier) {
    return (
      <div className="flex flex-1 flex-col p-6 items-center justify-center">
        <div className="bg-white border p-6 rounded-2xl shadow-sm text-center max-w-md">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">Supplier Not Found</h3>
          <p className="text-xs text-slate-500 mt-2">The selected supplier ID does not exist in prototype database.</p>
          <button onClick={() => navigate('/admin/material-suppliers')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer">
            Go Back to List
          </button>
        </div>
      </div>
    );
  }

  // Filter supplier-specific collections
  const supplierRFQs = rfqs.filter(r => r.items.some(item => supplier.materials.some(m => m.name === item.name || m.category === item.category)));
  const supplierQuotations = quotations.filter(q => q.supplierId === supplier.id);
  const supplierPOs = purchaseOrders.filter(po => po.supplierId === supplier.id);
  const supplierDeliveries = deliveries.filter(d => d.supplierId === supplier.id);
  const supplierGRNs = grns.filter(g => g.supplierId === supplier.id);
  const supplierQCs = qualityChecks.filter(q => q.supplierName === supplier.name);
  const supplierInvoices = invoices.filter(inv => inv.supplierId === supplier.id);
  const supplierCommLogs = communicationLogs[supplier.id] || [];
  const supplierAuditLogs = auditLogs.filter(log => log.newValue?.includes(supplier.id) || log.oldValue?.includes(supplier.name) || log.newValue?.includes(supplier.name));

  // Projects list
  const associatedProjects: ProjectAssociation[] = [
    { projectName: 'Skyline Residency', siteLocation: 'Patia, Bhubaneswar', materialSupplied: ['Cement', 'Plumbing'], activePOsCount: 2, totalOrderValue: 574600, pendingDeliveriesCount: 1, outstandingPayment: 211920, status: 'Active' },
    { projectName: 'Metro Mall Extension', siteLocation: 'Salt Lake, Kolkata', materialSupplied: ['Steel'], activePOsCount: 1, totalOrderValue: 1895100, pendingDeliveriesCount: 1, outstandingPayment: 1132950, status: 'Active' },
    { projectName: 'Kalinga Tech Park', siteLocation: 'Infocity, Bhubaneswar', materialSupplied: ['Sand', 'Aggregate'], activePOsCount: 1, totalOrderValue: 212450, pendingDeliveriesCount: 0, outstandingPayment: 212450, status: 'Active' }
  ];

  // Actions handlers
  const handleToggleStatus = () => {
    if (role !== 'admin') {
      showToast('Admin permission required to blacklist/whitelist suppliers.', 'error');
      return;
    }
    const newStatus: SupplierStatus = supplier.status === 'Blacklisted' ? 'Active' : 'Blacklisted';
    const updated: Supplier = { ...supplier, status: newStatus };
    updateSupplier(updated);
    addAuditLog(`Changed Supplier Status`, `Supplier details`, supplier.status, newStatus);
    showToast(`Supplier status updated to ${newStatus}`, 'success');
  };

  const handleEditProfile = () => {
    setEditForm({ ...supplier });
    setShowEditModal(true);
  };

  const saveProfileEdit = () => {
    updateSupplier(editForm as Supplier);
    setShowEditModal(false);
    showToast('Supplier profile updated successfully!', 'success');
  };

  // Add material to catalog
  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialDraft.name?.trim()) return;

    const newItem: MaterialItem = {
      id: `M-${Date.now().toString().substring(7)}`,
      category: materialDraft.category || 'General',
      name: materialDraft.name,
      brand: materialDraft.brand || 'Generic',
      unit: materialDraft.unit || 'Bag',
      moq: Number(materialDraft.moq) || 1,
      rate: Number(materialDraft.rate) || 0,
      taxPercent: Number(materialDraft.taxPercent) || 18,
      validTill: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      availability: 'In Stock'
    };

    const updated: Supplier = {
      ...supplier,
      materials: [...supplier.materials, newItem]
    };
    updateSupplier(updated);
    addAuditLog('Added Item to Material Catalog', 'Supplier Details', '', `${newItem.name} (Rate: ₹${newItem.rate})`);
    setShowAddMaterialModal(false);
    showToast(`Added ${newItem.name} to catalog`, 'success');
  };

  // Create RFQ Form Submit
  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqDraft.materialName) return;

    const newRFQ: RFQ = {
      id: `RFQ-${Date.now().toString().substring(8)}`,
      project: rfqDraft.project,
      siteLocation: rfqDraft.project === 'Skyline Residency' ? 'Patia, Bhubaneswar' : 'Infocity, Bhubaneswar',
      requestedBy: 'Samuel Rodriguez',
      requestedDate: new Date().toISOString().split('T')[0],
      deliveryDate: rfqDraft.deliveryDate,
      dueDate: rfqDraft.dueDate,
      status: 'Sent',
      items: [
        {
          category: rfqDraft.unit === 'Bag' ? 'Cement' : 'General',
          name: rfqDraft.materialName,
          quantity: Number(rfqDraft.quantity),
          unit: rfqDraft.unit,
          expectedRate: Number(rfqDraft.expectedRate) || undefined
        }
      ],
      attachments: [],
      vendorResponsesCount: 0
    };

    createRFQ(newRFQ);
    setShowCreateRFQModal(false);
    showToast(`RFQ ${newRFQ.id} issued successfully`, 'success');
  };

  // Submit Comm Log
  const handleLogComm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commDraft.subject.trim()) return;

    addCommunicationLog(supplier.id, {
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: commDraft.type,
      subject: commDraft.subject,
      description: commDraft.description,
      addedBy: 'Samuel Rodriguez',
      visibility: commDraft.visibility,
      attachments: [],
      followUpRequired: commDraft.followUpRequired,
      followUpDate: commDraft.followUpDate || undefined
    });

    setShowLogCommModal(false);
    setCommDraft({
      type: 'Call',
      subject: '',
      description: '',
      visibility: 'Internal Only',
      followUpRequired: false,
      followUpDate: ''
    });
    showToast('Communication logged successfully!', 'success');
  };

  // Verify Document status
  const handleVerifyDocument = (docId: string, verified: boolean) => {
    const updatedDocs = supplier.documents.map(doc => {
      if (doc.id === docId) {
        return { ...doc, status: verified ? 'Verified' as const : 'Rejected' as const };
      }
      return doc;
    });
    const updated: Supplier = { ...supplier, documents: updatedDocs };
    updateSupplier(updated);
    addAuditLog('Reviewed Legal Document', 'Supplier Compliance', docId, verified ? 'Verified' : 'Rejected');
    showToast(`Document marked ${verified ? 'Verified' : 'Rejected'}.`, 'success');
  };

  // Record payment payouts
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForPayment || !paymentDraft.amount) return;

    recordPayment(
      selectedInvoiceForPayment.id,
      Number(paymentDraft.amount),
      paymentDraft.mode,
      paymentDraft.transactionId || `TXN${Date.now()}`
    );

    setShowRecordPaymentModal(false);
    setSelectedInvoiceForPayment(null);
    setPaymentDraft({ amount: '', mode: 'Bank Transfer', transactionId: '', remarks: '' });
    showToast('Payment transaction successfully settled.', 'success');
  };

  // Perform QC test
  const handleQCRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQCForAction) return;

    performQualityCheck(
      selectedQCForAction.id,
      qcDraft.result,
      Number(qcDraft.acceptedQty),
      Number(qcDraft.rejectedQty),
      qcDraft.notes
    );

    setShowQCRecordModal(false);
    setSelectedQCForAction(null);
    setQcDraft({ result: 'Passed', acceptedQty: 0, rejectedQty: 0, notes: '' });
    showToast('Quality Inspection recorded.', 'success');
  };

  // Bulk catalog upload simulation
  const triggerBulkUpload = () => {
    setUploadProgress(true);
    setTimeout(() => {
      // Add simulated items
      const bulkItems: MaterialItem[] = [
        { id: `M-B1`, category: 'Steel', name: 'TMT Rebar 8mm', brand: 'Tata Tiscon', unit: 'Ton', moq: 5, rate: 65000, taxPercent: 18, validTill: '2026-08-31', availability: 'In Stock' },
        { id: `M-B2`, category: 'Steel', name: 'TMT Rebar 10mm', brand: 'Tata Tiscon', unit: 'Ton', moq: 5, rate: 64500, taxPercent: 18, validTill: '2026-08-31', availability: 'In Stock' }
      ];
      
      const updated: Supplier = {
        ...supplier,
        materials: [...supplier.materials, ...bulkItems]
      };
      updateSupplier(updated);
      setUploadProgress(false);
      showToast('Bulk catalog parsed and imported (2 items added)', 'success');
    }, 1500);
  };

  // Styling helper status badge
  const getStatusBadge = (status: SupplierStatus) => {
    const styles: Record<SupplierStatus, string> = {
      'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-200',
      'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
      'On Hold': 'bg-orange-50 text-orange-700 border-orange-200',
      'Blacklisted': 'bg-rose-50 text-rose-700 border-rose-200'
    };
    return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`;
  };

  return (
    <div className="flex flex-1 flex-col font-sans">

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-xl border shadow-xl transition-all duration-300 animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <XCircle className="w-5 h-5 text-rose-600" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* TOP HEADER PROFILE BLOCK */}
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/material-suppliers')}
              className="text-slate-400 hover:text-slate-900 transition-all flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              Supplier Registry
            </button>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center text-2xl font-black text-indigo-700 shadow-sm flex-shrink-0">
                {supplier.name.substring(0, 2).toUpperCase()}
              </div>

              <div>
                <div className="flex items-center flex-wrap gap-2.5">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{supplier.name}</h1>
                  <span className={getStatusBadge(supplier.status)}>
                    {supplier.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-slate-800">{supplier.rating.toFixed(2)} Rating</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-slate-500 font-semibold">{supplier.businessType}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-sm text-slate-500 font-semibold">PAN: {supplier.panNumber}</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Profile
              </button>

              <button
                onClick={handleToggleStatus}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  supplier.status === 'Blacklisted'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                {supplier.status === 'Blacklisted' ? 'Revoke Blacklist' : 'Blacklist Supplier'}
              </button>
            </div>
          </div>

          {/* Business contact row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-slate-100 pt-4 mt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{supplier.contact.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">+91 {supplier.contact.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{supplier.contact.city}, {supplier.contact.state}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-700">{supplier.website || 'No website registered'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* HORIZONTAL TAB MENU BAR (13 Interactive Tabs!) */}
      <div className="bg-white border-b border-slate-200 px-6 sticky top-12 z-20 shadow-xs">
        <div className="w-full overflow-x-auto flex items-center gap-1.5 scrollbar-none py-1">
          {[
            { id: 'Overview', label: 'Overview' },
            { id: 'Catalog', label: 'Material Catalog' },
            { id: 'RFQs', label: 'RFQs' },
            { id: 'Quotations', label: 'Quotations' },
            { id: 'POs', label: 'Purchase Orders' },
            { id: 'Deliveries', label: 'Deliveries' },
            { id: 'QC', label: 'Quality Checks' },
            { id: 'Invoices', label: 'Invoices & Payments' },
            { id: 'Documents', label: 'Documents' },
            { id: 'Projects', label: 'Projects' },
            { id: 'CommLog', label: 'Communication Log' },
            { id: 'Performance', label: 'Performance' },
            { id: 'Audit', label: 'Audit Log' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabName)}
              className={`px-4 py-3 text-xs font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABS CONTAINER */}
      <div className="p-6 w-full flex-1 flex flex-col gap-6">

        {/* 1. OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KPI Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Financial Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Amount</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block">₹{supplier.outstandingAmount.toLocaleString('en-IN')}</span>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-3">
                    <div className="bg-rose-500 h-full" style={{ width: `${(supplier.outstandingAmount / supplier.bank.creditLimit) * 100}%` }}></div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Credit limit</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block">₹{supplier.bank.creditLimit.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-3">Terms: {supplier.bank.paymentTerms}</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Contracts</span>
                  <span className="text-xl font-extrabold text-slate-800 mt-1 block">{associatedProjects.length} Projects</span>
                  <span className="text-[10px] text-emerald-600 font-bold block mt-3">All Active</span>
                </div>
              </div>

              {/* Legal Profile */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Taxation & Compliance Summary
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">GSTIN</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{supplier.gstNumber || 'Not Registered'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">PAN Card</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{supplier.panNumber || 'Not Uploaded'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">MSME Certificate</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{supplier.msmeNumber || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">Trade License</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{supplier.tradeLicenseNumber || 'None'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">CIN (Corporate ID)</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{supplier.cinNumber || 'Partnership/Proprietorship'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold">Establishment Year</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{supplier.establishmentYear || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Card Column */}
            <div className="space-y-6">
              
              {/* Compliance Rating Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    Security & Health Check
                  </span>
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Compliance Audit</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold border ${
                      supplier.compliance === 'Complete' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {supplier.compliance}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Risk Index</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold border ${
                      supplier.risk === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}>
                      {supplier.risk} Risk
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Overall Scorecard</span>
                    <span className="font-extrabold text-slate-800">
                      {supplier.rating > 0 ? `${(supplier.rating * 20).toFixed(0)}% Quality` : 'Not Scored'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Areas */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-800 border-b pb-2">Geography Coverage</h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {supplier.contact.serviceAreas.map(area => (
                    <span key={area} className="px-2 py-1 bg-slate-100 rounded-lg border text-xs font-semibold text-slate-600">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. CATALOG TAB */}
        {activeTab === 'Catalog' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col gap-4 p-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Active Material Rates & Stock</h3>
                <p className="text-xs text-slate-500 mt-1">Rates cataloged for automated matching with site requisitions.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={triggerBulkUpload}
                  disabled={uploadProgress}
                  className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  {uploadProgress ? 'Uploading...' : 'Upload CSV Catalog'}
                </button>

                <button
                  onClick={() => setShowAddMaterialModal(true)}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Material
                </button>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Item Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Brand</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Unit</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">MOQ</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Standard Rate (INR)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">GST Rate</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplier.materials.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">{item.name}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">{item.category}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-500">{item.brand}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.unit}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-700">{item.moq}</td>
                    <td className="px-4 py-3 text-sm font-extrabold text-slate-850 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{item.taxPercent}%</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                        {item.availability}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. RFQS TAB */}
        {activeTab === 'RFQs' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Requests for Quotation (RFQs)</h3>
                <p className="text-xs text-slate-500 mt-1">Sourcing solicitations linked to this supplier scope.</p>
              </div>

              <button
                onClick={() => {
                  setRfqDraft(prev => ({ ...prev, materialName: supplier.materials[0]?.name || '' }));
                  setShowCreateRFQModal(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Issue RFQ
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">RFQ ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Project</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Issued Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Sourced Material</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Bids Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierRFQs.map(rfq => (
                  <tr key={rfq.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-bold text-indigo-600">{rfq.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{rfq.project}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{rfq.requestedDate}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{rfq.dueDate}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-650">
                      {rfq.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
                        {rfq.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-700 text-center">{rfq.vendorResponsesCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. QUOTATIONS TAB */}
        {activeTab === 'Quotations' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Quotations & Pricing Submissions</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Quote ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Linked RFQ</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Project</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Valid Till</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Lead Time</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Quote Value (INR)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierQuotations.length > 0 ? (
                  supplierQuotations.map(q => (
                    <tr key={q.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-bold text-indigo-600">{q.id}</td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">{q.rfqId}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{q.project}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{q.validTill}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{q.deliveryLeadTime}</td>
                      <td className="px-4 py-3 text-sm font-black text-slate-800 text-right">₹{q.totalAmount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          q.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          q.status === 'Under Review' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          q.status === 'Converted to PO' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {q.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {q.status === 'Submitted' && (
                          <button
                            onClick={() => {
                              try {
                                convertRFQToPO(q.rfqId, q.id);
                                showToast(`Converted ${q.id} to Purchase Order`, 'success');
                              } catch (e) {
                                showToast('Error converting to PO', 'error');
                              }
                            }}
                            className="bg-indigo-650 hover:bg-indigo-755 text-white px-2 py-1 rounded-md text-[10px] font-bold cursor-pointer transition-all"
                          >
                            Convert to PO
                          </button>
                        )}
                        {q.status === 'Converted to PO' && (
                          <span className="text-[10px] text-emerald-600 font-bold">PO Generated</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400 text-xs italic">
                      No quotations submitted by this vendor yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. PURCHASE ORDERS TAB */}
        {activeTab === 'POs' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Issued Purchase Orders</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">PO Number</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Project</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Expected Delivery</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">PO Total Value (INR)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Approval</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Delivery</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center">Interactive Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierPOs.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-bold text-indigo-600">{po.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{po.project}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{po.expectedDeliveryDate}</td>
                    <td className="px-4 py-3 text-sm font-black text-slate-800 text-right">₹{po.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        po.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        po.approvalStatus === 'Pending Approval' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {po.approvalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold border">
                        {po.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {po.approvalStatus === 'Pending Approval' && (
                          <button
                            onClick={() => {
                              approvePO(po.id, 'Samuel Rodriguez');
                              showToast(`Approved ${po.id}`, 'success');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            Approve PO
                          </button>
                        )}
                        {po.approvalStatus === 'Draft' && (
                          <button
                            onClick={() => {
                              updatePOStatus(po.id, 'Pending Approval');
                              showToast(`Sent ${po.id} for approval`, 'success');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            Submit Draft
                          </button>
                        )}
                        {po.approvalStatus === 'Approved' && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Approved
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. DELIVERIES TAB */}
        {activeTab === 'Deliveries' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Dispatch & Transit Logs</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Challan Number</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">PO Ref</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Project</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Logistics details</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Delivery Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Goods Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierDeliveries.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">{d.challanNumber}</td>
                    <td className="px-4 py-3 text-xs text-indigo-600 font-bold">{d.poId}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{d.project}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      <div>Vehicle: {d.vehicleNumber}</div>
                      <div>Driver: {d.driverName} ({d.driverPhone})</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{d.deliveryDate}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        d.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {d.grnStatus === 'Generated' ? (
                        <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                          GRN: {d.grnId}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            // Navigate to Manager Material Receiving flow or simulate direct click
                            navigate('/manager/material-receiving');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer"
                        >
                          Generate GRN
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. QUALITY CHECKS (QC) TAB */}
        {activeTab === 'QC' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">QA/QC Laboratory Inspection Log</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">QC Number</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">GRN Link</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Material Inspected</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Sample Size</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">QA Engineer</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Test Result</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center">Interactive Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierQCs.length > 0 ? (
                  supplierQCs.map(qc => (
                    <tr key={qc.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-bold text-slate-800">{qc.id}</td>
                      <td className="px-4 py-3 text-xs text-indigo-600 font-bold">{qc.grnId}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">{qc.materialName}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{qc.sampleQty} pcs (of {qc.receivedQty})</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{qc.assignedTo}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          qc.status === 'Passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          qc.status === 'Failed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {qc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {qc.status === 'Pending' ? (
                          <button
                            onClick={() => {
                              setSelectedQCForAction(qc);
                              setQcDraft({
                                result: 'Passed',
                                acceptedQty: qc.receivedQty,
                                rejectedQty: 0,
                                notes: 'Visual dimensional values conform to standard specification.'
                              });
                              setShowQCRecordModal(true);
                            }}
                            className="bg-indigo-650 hover:bg-indigo-755 text-white px-2.5 py-1 rounded-md text-[10px] font-bold cursor-pointer"
                          >
                            Record Result
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold">Report Verified</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs italic">
                      No quality checks queued for this supplier's goods.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 8. INVOICES & PAYMENTS TAB */}
        {activeTab === 'Invoices' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Invoices, 3-Way Match & Payments</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Invoice Number</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">PO Reference</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Invoice Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Invoice Amount (INR)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Deductions</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Net Payable</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Verification Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center font-bold">Interactive Payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-xs text-indigo-655 font-bold">{inv.poId}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{inv.invoiceDate}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">₹{inv.invoiceAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs text-rose-600 text-right">₹{inv.deductions.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm font-extrabold text-slate-900 text-right">₹{inv.matchedAmount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        inv.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        inv.paymentStatus === 'Approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        inv.paymentStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {inv.paymentStatus === 'Submitted' && (
                          <>
                            <button
                              onClick={() => {
                                approveInvoice(inv.id);
                                showToast(`Invoice ${inv.invoiceNumber} approved`, 'success');
                              }}
                              className="bg-emerald-650 hover:bg-emerald-755 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                rejectInvoice(inv.id, 'Quality deduction conflict.');
                                showToast(`Invoice ${inv.invoiceNumber} rejected`, 'error');
                              }}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-750 border border-rose-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {inv.paymentStatus === 'Approved' && (
                          <button
                            onClick={() => {
                              setSelectedInvoiceForPayment(inv);
                              setPaymentDraft(prev => ({ ...prev, amount: inv.matchedAmount.toString() }));
                              setShowRecordPaymentModal(true);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                          >
                            Release Payout
                          </button>
                        )}
                        {inv.paymentStatus === 'Paid' && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Settled
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 9. DOCUMENTS TAB */}
        {activeTab === 'Documents' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Compliance Document Folder</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Document Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Uploaded Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Expiry Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplier.documents.length > 0 ? (
                  supplier.documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-semibold text-slate-850 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        {doc.name}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{doc.type}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{doc.uploadedDate}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{doc.expiryDate || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          doc.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          doc.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {doc.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleVerifyDocument(doc.id, true)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleVerifyDocument(doc.id, false)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-750 border border-rose-200 px-2 py-1 rounded text-[10px] font-bold cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            Audited
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 text-xs italic">
                      No compliance documents uploaded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 10. PROJECTS TAB */}
        {activeTab === 'Projects' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Active Construction Projects</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Project Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Site Location</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Supplied Materials Scope</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center">Active POs</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Contract Value</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Project Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {associatedProjects.map(proj => (
                  <tr key={proj.projectName} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-bold text-slate-850">{proj.projectName}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{proj.siteLocation}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {proj.materialSupplied.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-700 text-center">{proj.activePOsCount}</td>
                    <td className="px-4 py-3 text-sm font-extrabold text-slate-800 text-right">₹{proj.totalOrderValue.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {proj.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 11. COMMUNICATION LOG TAB */}
        {activeTab === 'CommLog' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Interactive Sourcing Communication Trail</h3>
                <p className="text-xs text-slate-500 mt-1">Logs of phone calls, email exchanges, meetings, and complaints.</p>
              </div>

              <button
                onClick={() => setShowLogCommModal(true)}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Log Interaction
              </button>
            </div>

            <div className="flow-root">
              <ul className="-mb-8">
                {supplierCommLogs.length > 0 ? (
                  supplierCommLogs.map((log, index) => (
                    <li key={log.id}>
                      <div className="relative pb-8">
                        {index < supplierCommLogs.length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-xs">
                              {log.type === 'Call' && <Phone className="w-4 h-4 text-indigo-500" />}
                              {log.type === 'Email' && <Mail className="w-4 h-4 text-emerald-500" />}
                              {log.type === 'Meeting' && <Award className="w-4 h-4 text-amber-500" />}
                              {log.type === 'Internal Note' && <FileText className="w-4 h-4 text-slate-500" />}
                              {log.type === 'Complaint' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                              {(!['Call', 'Email', 'Meeting', 'Internal Note', 'Complaint'].includes(log.type)) && (
                                <MessageSquare className="w-4 h-4 text-slate-500" />
                              )}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-slate-500 flex items-center justify-between">
                              <span className="font-bold text-slate-800">{log.subject}</span>
                              <span>{log.date}</span>
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Logged by <span className="font-semibold text-slate-700">{log.addedBy}</span>
                              <span className="mx-1.5">•</span>
                              <span className="font-medium bg-slate-100 border px-1.5 py-0.5 rounded text-[10px]">
                                {log.visibility}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-150">
                              {log.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs italic">
                    No communication history logged.
                  </div>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* 12. PERFORMANCE TAB */}
        {activeTab === 'Performance' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Vendor Sourcing Scorecard</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Score card 1 */}
              <div className="bg-slate-50 border rounded-2xl p-5 text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On-Time Delivery</span>
                <span className="text-3xl font-extrabold text-slate-800 block">94.8%</span>
                <p className="text-[10px] text-slate-500 font-semibold">Goal: &gt; 95% punctuality index</p>
              </div>

              {/* Score card 2 */}
              <div className="bg-slate-50 border rounded-2xl p-5 text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Quality compliance</span>
                <span className="text-3xl font-extrabold text-slate-800 block">99.1%</span>
                <p className="text-[10px] text-slate-500 font-semibold">Percentage of materials passing QA test</p>
              </div>

              {/* Score card 3 */}
              <div className="bg-slate-50 border rounded-2xl p-5 text-center space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pricing Stability</span>
                <span className="text-3xl font-extrabold text-slate-800 block">90.2%</span>
                <p className="text-[10px] text-slate-500 font-semibold">Average quote variation against BOQ</p>
              </div>

            </div>
          </div>
        )}

        {/* 13. AUDIT LOG TAB */}
        {activeTab === 'Audit' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col gap-4 p-6">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Security Audit Trail</h3>
              <p className="text-xs text-slate-500 mt-1">Automatic records of registry updates, onboarding logs, status changes, and invoices.</p>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/75 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Timestamp</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Audited User</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Action Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Module</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Changes Made</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {supplierAuditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{log.timestamp}</td>
                    <td className="px-4 py-3 text-xs">
                      <span className="font-bold text-slate-800">{log.user}</span>
                      <span className="text-slate-400 font-medium ml-1">({log.role})</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-indigo-700">{log.action}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">{log.module}</td>
                    <td className="px-4 py-3 text-xs max-w-[200px]">
                      {log.oldValue && <div className="text-rose-600 line-through">Old: {log.oldValue}</div>}
                      {log.newValue && <div className="text-emerald-650 font-semibold">New: {log.newValue}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Edit Supplier Profile</h3>
            
            <div className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Company Website</label>
                <input
                  type="text"
                  value={editForm.website || ''}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Payment terms</label>
                <select
                  value={editForm.bank?.paymentTerms || '30 Days'}
                  onChange={(e) => setEditForm(prev => ({
                    ...prev,
                    bank: prev.bank ? { ...prev.bank, paymentTerms: e.target.value } : undefined
                  }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option>Immediate</option>
                  <option>15 Days</option>
                  <option>30 Days</option>
                  <option>45 Days</option>
                  <option>60 Days</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                Cancel
              </button>
              <button onClick={saveProfileEdit} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD QC RESULT MODAL */}
      {showQCRecordModal && selectedQCForAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Record Quality Test Result</h3>
            
            <form onSubmit={handleQCRecordSubmit} className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inspection Status</label>
                <select
                  value={qcDraft.result}
                  onChange={(e) => setQcDraft(prev => ({ ...prev, result: e.target.value as 'Passed' | 'Failed' }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="Passed">Passed (Accept All)</option>
                  <option value="Failed">Failed (Reject Entire Batch)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Accepted Qty</label>
                  <input
                    type="number"
                    value={qcDraft.acceptedQty}
                    onChange={(e) => setQcDraft(prev => ({ ...prev, acceptedQty: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Rejected Qty</label>
                  <input
                    type="number"
                    value={qcDraft.rejectedQty}
                    onChange={(e) => setQcDraft(prev => ({ ...prev, rejectedQty: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inspection Notes</label>
                <textarea
                  rows={3}
                  value={qcDraft.notes}
                  onChange={(e) => setQcDraft(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setShowQCRecordModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Submit QC Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {showRecordPaymentModal && selectedInvoiceForPayment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Record Cash Disbursal Payment</h3>
            
            <form onSubmit={handleRecordPaymentSubmit} className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Invoice Value Reference</label>
                <p className="text-sm font-extrabold text-slate-800">
                  {selectedInvoiceForPayment.invoiceNumber} - Net Payable: ₹{selectedInvoiceForPayment.matchedAmount.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Amount Released (INR)</label>
                <input
                  type="number"
                  required
                  value={paymentDraft.amount}
                  onChange={(e) => setPaymentDraft(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction mode</label>
                  <select
                    value={paymentDraft.mode}
                    onChange={(e) => setPaymentDraft(prev => ({ ...prev, mode: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option>Bank Transfer</option>
                    <option>UPI</option>
                    <option>NEFT</option>
                    <option>RTGS</option>
                    <option>IMPS</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction ID / UTR</label>
                  <input
                    type="text"
                    required
                    value={paymentDraft.transactionId}
                    onChange={(e) => setPaymentDraft(prev => ({ ...prev, transactionId: e.target.value }))}
                    placeholder="e.g. UTR-98214502"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setShowRecordPaymentModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Disburse Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MATERIAL CATALOG MODAL */}
      {showAddMaterialModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Add Material Item</h3>
            
            <form onSubmit={handleAddMaterial} className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Material Category</label>
                <select
                  value={materialDraft.category}
                  onChange={(e) => setMaterialDraft(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option>Cement</option>
                  <option>Steel</option>
                  <option>Sand</option>
                  <option>Aggregate</option>
                  <option>Plumbing</option>
                  <option>Electrical</option>
                  <option>Waterproofing</option>
                  <option>Hardware</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Material Name</label>
                <input
                  type="text"
                  required
                  value={materialDraft.name}
                  onChange={(e) => setMaterialDraft(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. OPC 53 Grade Cement"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Brand Preference</label>
                  <input
                    type="text"
                    value={materialDraft.brand}
                    onChange={(e) => setMaterialDraft(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="UltraTech, Tata, etc."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit of Measure</label>
                  <select
                    value={materialDraft.unit}
                    onChange={(e) => setMaterialDraft(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option>Bag</option>
                    <option>Ton</option>
                    <option>CFT</option>
                    <option>Piece</option>
                    <option>Bundle</option>
                    <option>Litre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">MOQ</label>
                  <input
                    type="number"
                    value={materialDraft.moq}
                    onChange={(e) => setMaterialDraft(prev => ({ ...prev, moq: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Standard Rate (INR)</label>
                  <input
                    type="number"
                    required
                    value={materialDraft.rate || ''}
                    onChange={(e) => setMaterialDraft(prev => ({ ...prev, rate: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setShowAddMaterialModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RFQ MODAL */}
      {showCreateRFQModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Issue RFQ to Supplier</h3>
            
            <form onSubmit={handleCreateRFQ} className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Project Site Location</label>
                <select
                  value={rfqDraft.project}
                  onChange={(e) => setRfqDraft(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option>Skyline Residency</option>
                  <option>Metro Mall Extension</option>
                  <option>Kalinga Tech Park</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Scope Material Category</label>
                <select
                  value={rfqDraft.materialName}
                  onChange={(e) => setRfqDraft(prev => ({ ...prev, materialName: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  {supplier.materials.map(m => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    value={rfqDraft.quantity}
                    onChange={(e) => setRfqDraft(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Unit</label>
                  <input
                    type="text"
                    disabled
                    value={supplier.materials.find(m => m.name === rfqDraft.materialName)?.unit || 'Bag'}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-slate-50 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Response Due Date</label>
                  <input
                    type="date"
                    required
                    value={rfqDraft.dueDate}
                    onChange={(e) => setRfqDraft(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Expected Delivery Date</label>
                  <input
                    type="date"
                    required
                    value={rfqDraft.deliveryDate}
                    onChange={(e) => setRfqDraft(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setShowCreateRFQModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Issue RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG COMMUNICATION MODAL */}
      {showLogCommModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Log Interaction</h3>
            
            <form onSubmit={handleLogComm} className="my-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Interaction Type</label>
                  <select
                    value={commDraft.type}
                    onChange={(e) => setCommDraft(prev => ({ ...prev, type: e.target.value as CommunicationLog['type'] }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option>Call</option>
                    <option>Email</option>
                    <option>WhatsApp</option>
                    <option>Meeting</option>
                    <option>Complaint</option>
                    <option>Internal Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Portal Visibility</label>
                  <select
                    value={commDraft.visibility}
                    onChange={(e) => setCommDraft(prev => ({ ...prev, visibility: e.target.value as 'Internal Only' | 'Visible to Vendor' }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="Internal Only">Internal Only</option>
                    <option value="Visible to Vendor">Visible to Vendor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject / Header</label>
                <input
                  type="text"
                  required
                  value={commDraft.subject}
                  onChange={(e) => setCommDraft(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="e.g. Discussion regarding delivery delays"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Detailed Log Summary</label>
                <textarea
                  rows={4}
                  required
                  value={commDraft.description}
                  onChange={(e) => setCommDraft(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setShowLogCommModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Save Interaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
