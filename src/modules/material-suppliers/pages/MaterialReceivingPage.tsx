import React, { useState, useMemo } from 'react';
import { useSuppliers } from '../context/SupplierContext';
import { Delivery, PurchaseOrder, GRN, QualityCheck } from '../types/supplier.types';
import { 
  ClipboardCheck, Truck, FileText, ChevronRight, CheckCircle2, 
  AlertTriangle, Eye, ShieldAlert, Plus, Upload, Camera, Search, Filter 
} from 'lucide-react';

export const MaterialReceivingPage: React.FC = () => {
  const { 
    deliveries, purchaseOrders, grns, qualityChecks, createGRN, performQualityCheck, role, addAuditLog 
  } = useSuppliers();

  // Active Receiving Tab
  const [activeTab, setActiveTab] = useState<'pending' | 'grns' | 'quality'>('pending');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');

  // Interactive Modal State
  const [selectedDeliveryForGRN, setSelectedDeliveryForGRN] = useState<Delivery | null>(null);
  const [selectedQCForRecord, setSelectedQCForRecord] = useState<QualityCheck | null>(null);
  
  // GRN Form State
  const [grnDraft, setGrnDraft] = useState({
    receivedQtys: {} as Record<string, number>, // materialName -> receivedQty
    rejectedQtys: {} as Record<string, number>, // materialName -> rejectedQty
    remarks: {} as Record<string, string>, // materialName -> remarks
    gateEntryNumber: '',
    vehicleWeightment: '',
    challanFile: null as File | null,
    photoFile: null as File | null
  });

  // QC Form State
  const [qcDraft, setQcDraft] = useState({
    result: 'Passed' as 'Passed' | 'Failed',
    acceptedQty: 0,
    rejectedQty: 0,
    notes: ''
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filter deliveries
  const pendingDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const matchSearch = d.poId.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          d.supplierName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch && d.status !== 'Delivered';
    });
  }, [deliveries, searchTerm]);

  const completedGRNs = useMemo(() => {
    return grns.filter(g => 
      g.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      g.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [grns, searchTerm]);

  const activeQCs = useMemo(() => {
    return qualityChecks.filter(q => 
      q.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      q.poId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [qualityChecks, searchTerm]);

  // Open GRN Modal handler
  const handleOpenGRN = (delivery: Delivery) => {
    const defaultReceived: Record<string, number> = {};
    const defaultRejected: Record<string, number> = {};
    const defaultRemarks: Record<string, string> = {};

    delivery.items.forEach(item => {
      defaultReceived[item.materialName] = item.shippedQty;
      defaultRejected[item.materialName] = 0;
      defaultRemarks[item.materialName] = 'Received in good condition.';
    });

    setGrnDraft({
      receivedQtys: defaultReceived,
      rejectedQtys: defaultRejected,
      remarks: defaultRemarks,
      gateEntryNumber: `GE-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      vehicleWeightment: '12.45 Tons',
      challanFile: null,
      photoFile: null
    });
    setSelectedDeliveryForGRN(delivery);
  };

  // Submit GRN
  const handleGRNSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeliveryForGRN) return;

    // Check permissions
    if (role === 'vendor') {
      showToast('Vendor role cannot generate Goods Receipt Notes.', 'error');
      return;
    }

    const grnItems = selectedDeliveryForGRN.items.map(item => {
      const rec = grnDraft.receivedQtys[item.materialName] || 0;
      const rej = grnDraft.rejectedQtys[item.materialName] || 0;
      return {
        materialName: item.materialName,
        orderedQty: item.shippedQty, // simplified
        receivedQty: rec,
        acceptedQty: rec - rej,
        rejectedQty: rej,
        remarks: grnDraft.remarks[item.materialName] || ''
      };
    });

    const newGRN: GRN = {
      id: `GRN-${Date.now().toString().substring(7)}`,
      deliveryId: selectedDeliveryForGRN.id,
      poId: selectedDeliveryForGRN.poId,
      supplierId: selectedDeliveryForGRN.supplierId,
      supplierName: selectedDeliveryForGRN.supplierName,
      project: selectedDeliveryForGRN.project,
      receivedDate: new Date().toISOString().split('T')[0],
      receivedBy: 'Samuel Rodriguez',
      items: grnItems,
      gateEntryNumber: grnDraft.gateEntryNumber,
      challanAttachment: 'scanned_challan_uploaded.pdf',
      weightmentSlip: grnDraft.vehicleWeightment
    };

    createGRN(newGRN);
    setSelectedDeliveryForGRN(null);
    showToast(`GRN ${newGRN.id} generated. Quality Checks queued.`, 'success');
  };

  // Record QC Test
  const handleQCRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQCForRecord) return;

    performQualityCheck(
      selectedQCForRecord.id,
      qcDraft.result,
      qcDraft.acceptedQty,
      qcDraft.rejectedQty,
      qcDraft.notes
    );

    setSelectedQCForRecord(null);
    showToast(`Inspection report logged for QC ${selectedQCForRecord.id}.`, 'success');
  };

  return (
    <div className="flex flex-1 flex-col font-sans">

      {/* TOAST SYSTEM */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3.5 rounded-xl border shadow-xl transition-all duration-300 animate-slide-up bg-slate-900 text-white border-slate-800`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* HEADER Summary */}
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 w-full">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              Site Receiving & Quality (QA/QC)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify incoming shipments, generate digitised Goods Receipt Notes (GRN), and log quality test results.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Role Access:</span>
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${
              role === 'admin' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              role === 'manager' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-rose-50 text-rose-700 border-rose-200 cursor-not-allowed'
            }`}>
              {role === 'admin' ? 'Admin Access' : role === 'manager' ? 'Manager Access' : 'Vendor Portal (Read Only)'}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="p-6 flex-1 flex flex-col gap-6">

        {/* TAB CONTROLS */}
        <div className="flex border-b border-slate-200 bg-white p-1 rounded-xl shadow-xs border">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4" />
              Incoming Gate Shipments ({pendingDeliveries.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('grns')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'grns'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Issued Goods Receipts (GRN) ({completedGRNs.length})
            </div>
          </button>

          <button
            onClick={() => setActiveTab('quality')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'quality'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ClipboardCheck className="w-4 h-4" />
              QA/QC Lab Queue ({activeQCs.filter(q => q.status === 'Pending').length} Pending)
            </div>
          </button>
        </div>

        {/* SEARCH FILTER */}
        <div className="relative bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-7 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Challan, GRN, PO Number or Supplier Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50/50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>

        {/* TAB WORKFLOW PANELS */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
          
          {/* TAB 1: PENDING SHIPMENTS */}
          {activeTab === 'pending' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b text-left">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Challan / Vehicle</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">PO Ref</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Supplier</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Project / Site</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Expected Materials</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Dispatch Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Receiving Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDeliveries.length > 0 ? (
                    pendingDeliveries.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50/20">
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">{d.challanNumber}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Vehicle: {d.vehicleNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-600 font-bold">
                          {d.poId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-800">{d.supplierName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-800">{d.project}</div>
                          <div className="text-xs text-slate-500">{d.deliveryDate}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-650">
                          {d.items.map(i => `${i.shippedQty} ${i.unit} of ${i.materialName}`).join(', ')}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {role !== 'vendor' ? (
                            <button
                              onClick={() => handleOpenGRN(d)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-100"
                            >
                              Generate GRN
                            </button>
                          ) : (
                            <button
                              disabled
                              title="Vendor portal lacks permission"
                              className="bg-slate-100 text-slate-400 px-3 py-2 rounded-xl text-xs font-bold cursor-not-allowed border"
                            >
                              Read Only
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-450 italic text-sm">
                        No pending gate shipments found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: COMPLETED GRNS */}
          {activeTab === 'grns' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b text-left">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">GRN ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">PO Reference</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Gate Entry / Weighment</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Supplier</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Received Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Quantities matching</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Attachment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {completedGRNs.length > 0 ? (
                    completedGRNs.map(g => (
                      <tr key={g.id} className="hover:bg-slate-50/20">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                          {g.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500 font-bold">
                          {g.poId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-800">{g.gateEntryNumber}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Weighment: {g.weightmentSlip}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-800">{g.supplierName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {g.receivedDate}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          {g.items.map(i => (
                            <div key={i.materialName}>
                              {i.materialName}: <span className="font-bold text-emerald-650">{i.receivedQty} Rec.</span>
                              {i.rejectedQty > 0 && <span className="text-rose-600 ml-1">({i.rejectedQty} Rej.)</span>}
                            </div>
                          ))}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline cursor-pointer font-bold">
                            <FileText className="w-3.5 h-3.5" />
                            challan.pdf
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-450 italic text-sm">
                        No issued Goods Receipt Notes found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: QUALITY CONTROL Lab */}
          {activeTab === 'quality' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b text-left">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Test Number</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">GRN Link</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Material Item</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Supplier</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Sample Inspected</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Test Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-slate-400 uppercase">Laboratory Entry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeQCs.length > 0 ? (
                    activeQCs.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50/20">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-800">
                          {q.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-indigo-650 font-bold">
                          {q.grnId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-850">{q.materialName}</div>
                          <div className="text-xs text-slate-500 mt-0.5">Project: {q.project}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-slate-800">{q.supplierName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                          {q.sampleQty} Sample (Received: {q.receivedQty})
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            q.status === 'Passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            q.status === 'Failed' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {q.status === 'Pending' ? (
                            role !== 'vendor' ? (
                              <button
                                onClick={() => {
                                  setQcDraft({
                                    result: 'Passed',
                                    acceptedQty: q.receivedQty,
                                    rejectedQty: 0,
                                    notes: 'Lab test results comply with BIS requirements.'
                                  });
                                  setSelectedQCForRecord(q);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                Record Report
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Inspection Pending</span>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              Tested
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-450 italic text-sm">
                        No Quality Inspection check items queued.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

      {/* GENERATE GRN DIALOG MODAL */}
      {selectedDeliveryForGRN && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Generate Goods Receipt Note (GRN)</h3>
                <p className="text-xs text-slate-400 mt-1">Verify vehicle gate delivery matching PO items</p>
              </div>
              <button 
                onClick={() => setSelectedDeliveryForGRN(null)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleGRNSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div className="grid grid-cols-2 gap-4 bg-slate-50 border p-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PO Link</span>
                  <span className="text-sm font-bold text-slate-800">{selectedDeliveryForGRN.poId}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplier Name</span>
                  <span className="text-sm font-bold text-slate-800">{selectedDeliveryForGRN.supplierName}</span>
                </div>
              </div>

              {/* Items receiving quantities */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1">Items in Challan</h4>
                
                {selectedDeliveryForGRN.items.map((item) => (
                  <div key={item.materialName} className="border border-slate-150 p-4 rounded-xl space-y-3 bg-white shadow-xs">
                    <div className="text-sm font-bold text-slate-800">
                      {item.materialName} (Challan Qty: {item.shippedQty} {item.unit})
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Received Qty</label>
                        <input
                          type="number"
                          value={grnDraft.receivedQtys[item.materialName] ?? item.shippedQty}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setGrnDraft(prev => ({
                              ...prev,
                              receivedQtys: { ...prev.receivedQtys, [item.materialName]: val }
                            }));
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rejected Qty</label>
                        <input
                          type="number"
                          value={grnDraft.rejectedQtys[item.materialName] ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setGrnDraft(prev => ({
                              ...prev,
                              rejectedQtys: { ...prev.rejectedQtys, [item.materialName]: val }
                            }));
                          }}
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Damage / Remarks</label>
                        <input
                          type="text"
                          value={grnDraft.remarks[item.materialName] ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGrnDraft(prev => ({
                              ...prev,
                              remarks: { ...prev.remarks, [item.materialName]: val }
                            }));
                          }}
                          placeholder="e.g. Good condition"
                          className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gate Entry details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gate Entry Reference</label>
                  <input
                    type="text"
                    required
                    value={grnDraft.gateEntryNumber}
                    onChange={(e) => setGrnDraft(prev => ({ ...prev, gateEntryNumber: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Weighment Slip value</label>
                  <input
                    type="text"
                    value={grnDraft.vehicleWeightment}
                    onChange={(e) => setGrnDraft(prev => ({ ...prev, vehicleWeightment: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              {/* File Attachment simulated */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 font-semibold">Challan PDF Copy</span>
                  <span className="text-[10px] text-slate-400 mt-1">Uploaded scanned_challan.pdf</span>
                </div>
                <div className="border border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <Camera className="w-5 h-5 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 font-semibold">Delivery Site Photo</span>
                  <span className="text-[10px] text-slate-400 mt-1">Image preview simulated</span>
                </div>
              </div>

            </form>

            <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedDeliveryForGRN(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGRNSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer"
              >
                Generate GRN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECORD REPORT FOR QUALITY CHECK MODAL */}
      {selectedQCForRecord && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Record Lab Inspection Results</h3>

            <form onSubmit={handleQCRecordSubmit} className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inspection Status</label>
                <select
                  value={qcDraft.result}
                  onChange={(e) => setQcDraft(prev => ({ ...prev, result: e.target.value as 'Passed' | 'Failed' }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="Passed">Passed (Accept Batch)</option>
                  <option value="Failed">Failed (Reject Batch)</option>
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Inspections Laboratory Notes</label>
                <textarea
                  rows={3}
                  value={qcDraft.notes}
                  onChange={(e) => setQcDraft(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white resize-none animate-pulse-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setSelectedQCForRecord(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Submit QC Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
