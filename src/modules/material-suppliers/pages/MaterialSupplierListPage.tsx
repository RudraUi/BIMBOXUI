import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useSuppliers } from '../context/SupplierContext';
import { RoleSwitcher } from '../components/RoleSwitcher';
import { Supplier, SupplierStatus, ComplianceStatus, RiskLevel, MaterialItem } from '../types/supplier.types';
import { 
  Search, Filter, Plus, FileSpreadsheet, ArrowUpDown, MoreVertical, 
  Trash2, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Info,
  ChevronRight, Star, ExternalLink, ShieldCheck
} from 'lucide-react';

export const MaterialSupplierListPage: React.FC = () => {
  const { suppliers, addSupplier, deleteSupplier, role, addAuditLog } = useSuppliers();
  const navigate = useNavigate();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [businessType, setBusinessType] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [complianceFilter, setComplianceFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Sorting state
  const [sortBy, setSortBy] = useState<keyof Supplier>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Add Supplier Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    businessType: 'Proprietorship',
    gstNumber: '',
    panNumber: '',
    cinNumber: '',
    msmeNumber: '',
    tradeLicenseNumber: '',
    establishmentYear: new Date().getFullYear(),
    website: '',
    
    // Contact
    contactName: '',
    contactDesignation: '',
    contactPhone: '',
    contactAltPhone: '',
    contactEmail: '',
    contactAddress: '',
    contactCity: '',
    contactState: '',
    contactPincode: '',
    serviceAreas: '',

    // Bank
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    paymentTerms: '30 Days',
    creditLimit: '1000000',
    advanceRequired: false,
    retentionApplicable: true
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete safeguard state
  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // Toast state
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter logic
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.contact.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesBusiness = businessType === 'All' || s.businessType === businessType;
      const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
      const matchesCompliance = complianceFilter === 'All' || s.compliance === complianceFilter;
      const matchesRisk = riskFilter === 'All' || s.risk === riskFilter;
      
      const matchesCategory = categoryFilter === 'All' || s.materials.some(m => m.category === categoryFilter);

      return matchesSearch && matchesBusiness && matchesStatus && matchesCompliance && matchesRisk && matchesCategory;
    });
  }, [suppliers, searchTerm, businessType, statusFilter, complianceFilter, riskFilter, categoryFilter]);

  // Sort logic
  const sortedSuppliers = useMemo(() => {
    return [...filteredSuppliers].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      // Handle nested structures or numbers
      if (sortBy === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      if (valA === undefined) return 1;
      if (valB === undefined) return -1;

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSuppliers, sortBy, sortOrder]);

  const handleSort = (field: keyof Supplier) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Unique categories for filtering
  const categories = useMemo(() => {
    const cats = new Set<string>();
    suppliers.forEach(s => s.materials.forEach(m => cats.add(m.category)));
    return Array.from(cats);
  }, [suppliers]);

  // Unique business types
  const businessTypes = ['Proprietorship', 'Partnership', 'Private Limited', 'LLP', 'Individual'];

  // Form validation per step
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name.trim()) errors.name = 'Supplier Name is required';
      if (!formData.businessType) errors.businessType = 'Business Type is required';
    }

    if (step === 2) {
      // GST pattern: e.g. 21AAAAA1111A1Z1 (Indian GST format)
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
      if (formData.gstNumber && !gstRegex.test(formData.gstNumber)) {
        errors.gstNumber = 'Invalid GST format (Example: 21AAAAA1111A1Z1)';
      }
      
      // PAN pattern: 5 letters, 4 digits, 1 letter
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (formData.panNumber && !panRegex.test(formData.panNumber.toUpperCase())) {
        errors.panNumber = 'Invalid PAN format (Example: ABCDE1234F)';
      }

      // Website URL check
      const urlRegex = /^https?:\/\/.*/;
      if (formData.website && !urlRegex.test(formData.website)) {
        errors.website = 'Invalid URL format (Must start with http:// or https://)';
      }
    }

    if (step === 4) {
      // Primary phone validation: Indian 10 digits
      const phoneRegex = /^[6-9][0-9]{9}$/;
      if (!formData.contactPhone) {
        errors.contactPhone = 'Phone number is required';
      } else if (!phoneRegex.test(formData.contactPhone)) {
        errors.contactPhone = 'Must be a valid 10-digit Indian phone number';
      }

      // Email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.contactEmail) {
        errors.contactEmail = 'Email is required';
      } else if (!emailRegex.test(formData.contactEmail)) {
        errors.contactEmail = 'Invalid email address format';
      }

      // Pincode validation: 6 digits
      const pinRegex = /^[0-9]{6}$/;
      if (!formData.contactPincode) {
        errors.contactPincode = 'Pincode is required';
      } else if (!pinRegex.test(formData.contactPincode)) {
        errors.contactPincode = 'Must be a valid 6-digit postal code';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  // Submit new supplier
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    // Build supplier model
    const newId = `V-0${suppliers.length + 1}`;
    
    // Add default material items based on selection (or just seed empty for vendor catalog upload later)
    const initialMaterials: MaterialItem[] = [];

    const newSupplier: Supplier = {
      id: newId,
      name: formData.name,
      displayName: formData.displayName || formData.name,
      businessType: formData.businessType,
      status: role === 'admin' ? 'Active' : 'Pending Approval', // Manager submits as Pending Approval
      gstNumber: formData.gstNumber.toUpperCase(),
      panNumber: formData.panNumber.toUpperCase(),
      cinNumber: formData.cinNumber.toUpperCase(),
      msmeNumber: formData.msmeNumber,
      tradeLicenseNumber: formData.tradeLicenseNumber,
      establishmentYear: Number(formData.establishmentYear),
      website: formData.website,
      contact: {
        name: formData.contactName,
        designation: formData.contactDesignation,
        phone: formData.contactPhone,
        altPhone: formData.contactAltPhone,
        email: formData.contactEmail,
        address: formData.contactAddress,
        city: formData.contactCity,
        state: formData.contactState,
        pincode: formData.contactPincode,
        serviceAreas: formData.serviceAreas ? formData.serviceAreas.split(',').map(s => s.trim()) : []
      },
      bank: {
        accountHolderName: formData.accountHolderName || formData.name,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode.toUpperCase(),
        upiId: formData.upiId,
        paymentTerms: formData.paymentTerms,
        creditLimit: Number(formData.creditLimit) || 1000000,
        advanceRequired: formData.advanceRequired,
        retentionApplicable: formData.retentionApplicable
      },
      documents: [],
      materials: initialMaterials,
      rating: 0.0,
      activeProjects: 0,
      pendingRFQs: 0,
      openPOs: 0,
      outstandingAmount: 0,
      compliance: 'None',
      risk: role === 'admin' ? 'Low' : 'Pending'
    };

    addSupplier(newSupplier);
    showToast(`Supplier ${newSupplier.name} registered successfully! Status: ${newSupplier.status}`, 'success');
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      displayName: '',
      businessType: 'Proprietorship',
      gstNumber: '',
      panNumber: '',
      cinNumber: '',
      msmeNumber: '',
      tradeLicenseNumber: '',
      establishmentYear: new Date().getFullYear(),
      website: '',
      contactName: '',
      contactDesignation: '',
      contactPhone: '',
      contactAltPhone: '',
      contactEmail: '',
      contactAddress: '',
      contactCity: '',
      contactState: '',
      contactPincode: '',
      serviceAreas: '',
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      upiId: '',
      paymentTerms: '30 Days',
      creditLimit: '1000000',
      advanceRequired: false,
      retentionApplicable: true
    });
    setFormErrors({});
  };

  // Delete Action
  const handleDeleteConfirm = () => {
    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('You must type DELETE to confirm.');
      return;
    }
    
    if (deleteTarget) {
      const success = deleteSupplier(deleteTarget.id);
      if (success) {
        showToast(`Supplier ${deleteTarget.name} has been deleted.`, 'success');
      } else {
        showToast(`Failed to delete. Admin permissions required.`, 'error');
      }
      setDeleteTarget(null);
      setDeleteConfirmText('');
      setDeleteError('');
    }
  };

  // CSV Export
  const handleExportCSV = () => {
    try {
      const headers = [
        'Supplier ID', 'Supplier Name', 'Business Type', 'Status', 
        'GST Number', 'PAN Number', 'Primary Contact', 'Phone', 'Email', 
        'City', 'State', 'Rating', 'Active Projects', 'Outstanding Amount (INR)', 'Compliance', 'Risk'
      ];
      
      const csvRows = [headers.join(',')];
      
      sortedSuppliers.forEach(s => {
        const row = [
          `"${s.id}"`,
          `"${s.name.replace(/"/g, '""')}"`,
          `"${s.businessType}"`,
          `"${s.status}"`,
          `"${s.gstNumber}"`,
          `"${s.panNumber}"`,
          `"${(s.contact.name || '').replace(/"/g, '""')}"`,
          `"${s.contact.phone}"`,
          `"${s.contact.email}"`,
          `"${s.contact.city}"`,
          `"${s.contact.state}"`,
          s.rating.toFixed(2),
          s.activeProjects,
          s.outstandingAmount,
          `"${s.compliance}"`,
          `"${s.risk}"`
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `material_suppliers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addAuditLog('Exported Supplier Registry CSV', 'Supplier List');
      showToast('CSV export complete.', 'success');
    } catch (err) {
      showToast('CSV export failed.', 'error');
    }
  };

  // Styling helper for badges
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

  const getComplianceBadge = (comp: ComplianceStatus) => {
    const styles: Record<ComplianceStatus, string> = {
      'Complete': 'bg-blue-50 text-blue-700 border-blue-200',
      'Pending Documents': 'bg-amber-50 text-amber-700 border-amber-200',
      'Action Required': 'bg-rose-50 text-rose-700 border-rose-200 border-dashed animate-pulse',
      'None': 'bg-slate-100 text-slate-500 border-slate-200'
    };
    return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[comp]}`;
  };

  const getRiskBadge = (risk: RiskLevel) => {
    const styles: Record<RiskLevel, string> = {
      'Low': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Medium': 'bg-amber-50 text-amber-700 border-amber-200',
      'High': 'bg-rose-50 text-rose-700 border-rose-200',
      'Pending': 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[risk]}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <RoleSwitcher />

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-xl border shadow-xl transition-all duration-300 animate-slide-up ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-900 border-emerald-200' :
          toast.type === 'error' ? 'bg-rose-50 text-rose-900 border-rose-200' :
          'bg-slate-900 text-white border-slate-800'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-600" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-slate-400" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* TOP HEADER SUMMARY BAR */}
      <div className="bg-white border-b border-slate-200 px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4 max-w-7xl mx-auto w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-indigo-600" />
              Material Supplier Registry
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Workflow-based directory of onboarded suppliers, active compliance auditing, and pipeline coordination.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 border border-slate-200 hover:bg-slate-50 bg-white text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Export Directory
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-sm shadow-indigo-100"
            >
              <Plus className="w-4 h-4" />
              Onboard Supplier
            </button>
          </div>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6">
        
        {/* DENSE FILTER PANEL */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <Filter className="w-4 h-4 text-slate-400" />
              Pipeline Filtering
            </div>
            {(searchTerm || businessType !== 'All' || statusFilter !== 'All' || complianceFilter !== 'All' || riskFilter !== 'All' || categoryFilter !== 'All') && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setBusinessType('All');
                  setStatusFilter('All');
                  setComplianceFilter('All');
                  setRiskFilter('All');
                  setCategoryFilter('All');
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Clear all filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="relative col-span-1 sm:col-span-2 md:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, ID, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-slate-50/50"
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white"
              >
                <option value="All">All Types</option>
                {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Onboarding Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Draft">Draft</option>
                <option value="On Hold">On Hold</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>

            {/* Compliance */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Compliance</label>
              <select
                value={complianceFilter}
                onChange={(e) => setComplianceFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white"
              >
                <option value="All">All Audit Status</option>
                <option value="Complete">Complete</option>
                <option value="Pending Documents">Pending Documents</option>
                <option value="Action Required">Action Required</option>
                <option value="None">None</option>
              </select>
            </div>

            {/* Risk */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Risk Assessment</label>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white"
              >
                <option value="All">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Material Category */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Supplied Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all bg-white"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* WORKFLOW TABLE CONTAINER */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200">
                  <th 
                    onClick={() => handleSort('id')}
                    className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 select-none transition-all"
                  >
                    <div className="flex items-center gap-1">
                      ID
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 select-none transition-all"
                  >
                    <div className="flex items-center gap-1">
                      Supplier / Business
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Scope of Supplies
                  </th>
                  <th 
                    onClick={() => handleSort('rating')}
                    className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 select-none transition-all"
                  >
                    <div className="flex items-center gap-1">
                      Rating
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Compliance Audit
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Risk Assessment
                  </th>
                  <th 
                    onClick={() => handleSort('openPOs')}
                    className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 select-none transition-all"
                  >
                    <div className="flex items-center gap-1">
                      Open POs
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('outstandingAmount')}
                    className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 select-none transition-all"
                  >
                    <div className="flex items-center justify-end gap-1">
                      Outstanding (INR)
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {sortedSuppliers.length > 0 ? (
                  sortedSuppliers.map((supplier) => (
                    <tr 
                      key={supplier.id}
                      className="hover:bg-slate-50/50 transition-all group border-b border-slate-100"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">
                        {supplier.id}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                            {supplier.name}
                            <span className={getStatusBadge(supplier.status)}>
                              {supplier.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {supplier.businessType} • {supplier.contact.city}, {supplier.contact.state}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {supplier.materials.length > 0 ? (
                            Array.from(new Set(supplier.materials.map(m => m.category))).map(cat => (
                              <span key={cat} className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                                {cat}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400 italic">No materials cataloged</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-bold text-slate-800">
                            {supplier.rating > 0 ? supplier.rating.toFixed(1) : 'New'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getComplianceBadge(supplier.compliance)}>
                          {supplier.compliance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getRiskBadge(supplier.risk)}>
                          {supplier.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700 text-center">
                        {supplier.openPOs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-slate-800 text-right">
                        ₹{supplier.outstandingAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/material-suppliers/${supplier.id}`)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                          >
                            Details
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {role === 'admin' ? (
                            <button
                              onClick={() => setDeleteTarget(supplier)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Supplier"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              disabled
                              title="Admin permission required to delete"
                              className="text-slate-200 cursor-not-allowed p-1.5"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <ShieldAlert className="w-8 h-8 text-slate-300" />
                        <span className="text-sm font-semibold">No suppliers found matching the filters.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DELETE SAFEGUARD MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <div className="flex items-start gap-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Confirm Deletion</h3>
                <p className="text-sm text-slate-500 mt-1">
                  You are about to delete <span className="font-semibold text-slate-800">{deleteTarget.name}</span>. This will purge all associated files, invoices, and catalog details from the prototype state.
                </p>
              </div>
            </div>

            <div className="my-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Type "DELETE" below to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  setDeleteError('');
                }}
                placeholder="DELETE"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 bg-white font-mono uppercase tracking-wider"
              />
              {deleteError && (
                <p className="text-xs text-rose-600 font-semibold mt-1">{deleteError}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteConfirmText('');
                  setDeleteError('');
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4-STEP ONBOARDING WIZARD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Supplier Onboarding Wizard</h3>
                <p className="text-xs text-slate-400 mt-1">Register a new construction material partner</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-lg"
              >
                &times;
              </button>
            </div>

            {/* Stepper indicators */}
            <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex items-center justify-between">
              {[
                { step: 1, label: 'Company Info' },
                { step: 2, label: 'Tax & Compliance' },
                { step: 3, label: 'Finance & Bank' },
                { step: 4, label: 'Contacts' }
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    currentStep === s.step ? 'bg-indigo-600 text-white shadow-sm' :
                    currentStep > s.step ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {s.step}
                  </div>
                  <span className={`text-xs font-semibold ${
                    currentStep === s.step ? 'text-indigo-600' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                  {s.step < 4 && <div className="w-6 h-px bg-slate-300 hidden md:block"></div>}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              {/* STEP 1: BASIC DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 border-b pb-1">General Business Details</h4>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Legal Entity / Supplier Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. Shree Cement Suppliers Ltd"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                    />
                    {formErrors.name && <p className="text-xs text-rose-600 font-semibold mt-1">{formErrors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Display Name</label>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                        placeholder="e.g. Shree Cement"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Business Registration Type <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      >
                        {businessTypes.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Establishment Year</label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.establishmentYear}
                        onChange={(e) => setFormData(prev => ({ ...prev, establishmentYear: Number(e.target.value) }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Website URL</label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="e.g. https://www.supplier.com"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: TAX / LEGAL */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 border-b pb-1">Tax & Legal Identifications</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">GSTIN (15 Digits)</label>
                      <input
                        type="text"
                        value={formData.gstNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, gstNumber: e.target.value }))}
                        placeholder="e.g. 21AAAAA1111A1Z1"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white uppercase"
                      />
                      {formErrors.gstNumber && <p className="text-xs text-rose-600 font-semibold mt-1">{formErrors.gstNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">PAN Card Number (10 Digits)</label>
                      <input
                        type="text"
                        value={formData.panNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, panNumber: e.target.value }))}
                        placeholder="e.g. AAAAA1111A"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white uppercase"
                      />
                      {formErrors.panNumber && <p className="text-xs text-rose-600 font-semibold mt-1">{formErrors.panNumber}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">CIN (Corporate Identification Number - If Pvt Ltd)</label>
                    <input
                      type="text"
                      value={formData.cinNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, cinNumber: e.target.value }))}
                      placeholder="e.g. U27109WB2015PTC201234"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">MSME Registration Number</label>
                      <input
                        type="text"
                        value={formData.msmeNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, msmeNumber: e.target.value }))}
                        placeholder="e.g. UDYAM-OD-19-XXXXXXX"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Trade License Reference</label>
                      <input
                        type="text"
                        value={formData.tradeLicenseNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, tradeLicenseNumber: e.target.value }))}
                        placeholder="e.g. TL-BBSR-2026-XXXX"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: FINANCIAL DETAILS */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 border-b pb-1">Bank Account & Commercial Terms</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                        placeholder="State Bank of India, HDFC, etc."
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Account Holder Name</label>
                      <input
                        type="text"
                        value={formData.accountHolderName}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountHolderName: e.target.value }))}
                        placeholder="Must match bank records"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Account Number</label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">IFSC Code</label>
                      <input
                        type="text"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value }))}
                        placeholder="SBIN0006408"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white uppercase"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">UPI ID (Optional)</label>
                      <input
                        type="text"
                        value={formData.upiId}
                        onChange={(e) => setFormData(prev => ({ ...prev, upiId: e.target.value }))}
                        placeholder="e.g. name@upi"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Standard Payment Terms</label>
                      <select
                        value={formData.paymentTerms}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      >
                        <option>Immediate</option>
                        <option>15 Days</option>
                        <option>30 Days</option>
                        <option>45 Days</option>
                        <option>60 Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Initial Credit Limit (INR)</label>
                      <input
                        type="number"
                        value={formData.creditLimit}
                        onChange={(e) => setFormData(prev => ({ ...prev, creditLimit: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div className="flex flex-col gap-2 mt-5">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.advanceRequired}
                          onChange={(e) => setFormData(prev => ({ ...prev, advanceRequired: e.target.checked }))}
                          className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
                        />
                        Advance Payment Required
                      </label>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.retentionApplicable}
                          onChange={(e) => setFormData(prev => ({ ...prev, retentionApplicable: e.target.checked }))}
                          className="rounded border-slate-350 text-indigo-600 focus:ring-indigo-500"
                        />
                        Quality Retention Applicable
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CONTACT & GEOGRAPHY */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-800 border-b pb-1">Primary Contacts & Service Boundaries</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Contact Person Name</label>
                      <input
                        type="text"
                        value={formData.contactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Designation</label>
                      <input
                        type="text"
                        value={formData.contactDesignation}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactDesignation: e.target.value }))}
                        placeholder="e.g. Sales Head"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Mobile Phone (10-Digit) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="e.g. 9876543210"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                      {formErrors.contactPhone && <p className="text-xs text-rose-600 font-semibold mt-1">{formErrors.contactPhone}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        placeholder="e.g. ramesh@supplier.com"
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                      {formErrors.contactEmail && <p className="text-xs text-rose-600 font-semibold mt-1">{formErrors.contactEmail}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Street Address</label>
                    <textarea
                      rows={2}
                      value={formData.contactAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactAddress: e.target.value }))}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                      <input
                        type="text"
                        value={formData.contactCity}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactCity: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                      <input
                        type="text"
                        value={formData.contactState}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactState: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Pincode <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.contactPincode}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPincode: e.target.value }))}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                      />
                      {formErrors.contactPincode && <p className="text-xs text-rose-600 font-semibold mt-1">{formErrors.contactPincode}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Service Area Cities (Comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.serviceAreas}
                      onChange={(e) => setFormData(prev => ({ ...prev, serviceAreas: e.target.value }))}
                      placeholder="e.g. Bhubaneswar, Cuttack, Puri"
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 bg-white"
                    />
                  </div>
                </div>
              )}

            </form>

            {/* Modal Footer Controls */}
            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
                  >
                    Back
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
                  >
                    Submit Onboarding
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
