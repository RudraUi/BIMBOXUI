import React, { useState, useMemo } from 'react';
import { useSuppliers } from '../context/SupplierContext';
import { RFQ, Quotation, PurchaseOrder, Delivery, Invoice } from '../types/supplier.types';
import { 
  FileText, Send, CheckCircle2, ShoppingBag, Truck, FileCheck, 
  Plus, Upload, ShieldAlert, Award, ArrowUpRight, DollarSign, Calendar
} from 'lucide-react';

export const VendorPortalPage: React.FC = () => {
  const { 
    rfqs, quotations, purchaseOrders, deliveries, invoices, activeVendorId, suppliers,
    submitQuotation, updatePOStatus, createDelivery, submitInvoice, addAuditLog 
  } = useSuppliers();

  // Find simulated supplier
  const currentVendor = useMemo(() => suppliers.find(s => s.id === activeVendorId), [suppliers, activeVendorId]);

  // Tab State
  const [activeTab, setActiveTab] = useState<'rfqs' | 'pos' | 'deliveries' | 'invoices' | 'compliance'>('rfqs');

  // Form Modals
  const [selectedRFQForQuote, setSelectedRFQForQuote] = useState<RFQ | null>(null);
  const [selectedPOForDispatch, setSelectedPOForDispatch] = useState<PurchaseOrder | null>(null);
  const [showUploadInvoiceModal, setShowUploadInvoiceModal] = useState(false);

  // Quote Form State
  const [quoteDraft, setQuoteDraft] = useState({
    rates: {} as Record<string, number>, // materialName -> rate
    transport: 2000,
    loading: 500,
    discount: 0,
    leadTime: '2 Days',
    paymentTerms: '30 Days',
    remarks: ''
  });

  // Dispatch Form State
  const [dispatchDraft, setDispatchDraft] = useState({
    challanNumber: '',
    vehicleNumber: '',
    driverName: '',
    driverPhone: '',
    quantities: {} as Record<string, number> // materialName -> qty
  });

  // Invoice Form State
  const [invoiceDraft, setInvoiceDraft] = useState({
    invoiceNumber: '',
    poId: '',
    invoiceAmount: '',
    taxAmount: '',
    deductions: '0',
    remarks: ''
  });

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Scoped lists
  const vendorRFQs = useMemo(() => {
    // Show RFQs where materials category match vendor category or explicitly sent
    return rfqs.filter(r => r.status === 'Sent' || r.status === 'Quoted');
  }, [rfqs]);

  const vendorQuotes = useMemo(() => quotations.filter(q => q.supplierId === activeVendorId), [quotations, activeVendorId]);
  const vendorPOs = useMemo(() => purchaseOrders.filter(po => po.supplierId === activeVendorId), [purchaseOrders, activeVendorId]);
  const vendorDeliveries = useMemo(() => deliveries.filter(d => d.supplierId === activeVendorId), [deliveries, activeVendorId]);
  const vendorInvoices = useMemo(() => invoices.filter(inv => inv.supplierId === activeVendorId), [invoices, activeVendorId]);

  if (!currentVendor) {
    return (
      <div className="flex flex-1 flex-col p-6 items-center justify-center">
        <div className="bg-white border p-6 rounded-2xl shadow-sm text-center max-w-sm">
          <ShieldAlert className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Active Vendor Not Configured</h3>
          <p className="text-xs text-slate-500 mt-1">Please select a valid vendor inside simulation control panel above.</p>
        </div>
      </div>
    );
  }

  // Quote Submission Handler
  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQForQuote) return;

    const quoteItems = selectedRFQForQuote.items.map(item => {
      const rate = quoteDraft.rates[item.name] || item.expectedRate || 400;
      return {
        materialName: item.name,
        requestedQty: item.quantity,
        quotedRate: rate,
        unit: item.unit,
        availableQty: item.quantity * 2, // simulated availability
        deliveryDays: 2
      };
    });

    const subtotal = quoteItems.reduce((acc, item) => acc + (item.requestedQty * item.quotedRate), 0);
    const tax = subtotal * 0.18; // standard 18% tax
    const total = subtotal + tax + Number(quoteDraft.transport) + Number(quoteDraft.loading) - Number(quoteDraft.discount);

    const newQuotation: Quotation = {
      id: `QT-${Date.now().toString().substring(7)}`,
      rfqId: selectedRFQForQuote.id,
      supplierId: currentVendor.id,
      supplierName: currentVendor.name,
      project: selectedRFQForQuote.project,
      validTill: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      deliveryLeadTime: quoteDraft.leadTime,
      items: quoteItems,
      taxAmount: tax,
      transportCharges: Number(quoteDraft.transport),
      loadingCharges: Number(quoteDraft.loading),
      discount: Number(quoteDraft.discount),
      totalAmount: total,
      paymentTerms: quoteDraft.paymentTerms,
      remarks: quoteDraft.remarks,
      status: 'Submitted',
      submittedDate: new Date().toISOString().split('T')[0]
    };

    submitQuotation(newQuotation);
    setSelectedRFQForQuote(null);
    showToast(`Quotation ${newQuotation.id} submitted successfully!`, 'success');
  };

  // Dispatch Delivery Handler
  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPOForDispatch) return;

    const deliveryItems = selectedPOForDispatch.items.map(item => {
      const dispatchQty = dispatchDraft.quantities[item.name] || item.quantity;
      return {
        materialName: item.name,
        shippedQty: dispatchQty,
        unit: item.unit
      };
    });

    const newDelivery: Delivery = {
      id: `DEL-${Date.now().toString().substring(7)}`,
      poId: selectedPOForDispatch.id,
      supplierId: currentVendor.id,
      supplierName: currentVendor.name,
      project: selectedPOForDispatch.project,
      challanNumber: dispatchDraft.challanNumber || `CH-${Date.now().toString().substring(8)}`,
      vehicleNumber: dispatchDraft.vehicleNumber,
      driverName: dispatchDraft.driverName,
      driverPhone: dispatchDraft.driverPhone,
      deliveryDate: new Date().toISOString().split('T')[0],
      status: 'Dispatched',
      items: deliveryItems,
      grnStatus: 'Not Generated'
    };

    createDelivery(newDelivery);
    setSelectedPOForDispatch(null);
    showToast(`Delivery challan ${newDelivery.challanNumber} dispatched!`, 'success');
  };

  // Invoice Upload Submission
  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceDraft.poId || !invoiceDraft.invoiceAmount) return;

    const matchingPO = vendorPOs.find(p => p.id === invoiceDraft.poId);
    if (!matchingPO) return;

    const newInvoice: Invoice = {
      id: `INV-${Date.now().toString().substring(7)}`,
      poId: invoiceDraft.poId,
      supplierId: currentVendor.id,
      supplierName: currentVendor.name,
      invoiceNumber: invoiceDraft.invoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      invoiceAmount: Number(invoiceDraft.invoiceAmount),
      taxAmount: Number(invoiceDraft.taxAmount) || 0,
      deductions: Number(invoiceDraft.deductions) || 0,
      matchedAmount: Number(invoiceDraft.invoiceAmount) - (Number(invoiceDraft.deductions) || 0),
      paymentStatus: 'Submitted',
      approvalStatus: 'Submitted',
      remarks: invoiceDraft.remarks,
      attachment: 'uploaded_invoice_file.pdf'
    };

    submitInvoice(newInvoice);
    setShowUploadInvoiceModal(false);
    setInvoiceDraft({ invoiceNumber: '', poId: '', invoiceAmount: '', taxAmount: '', deductions: '0', remarks: '' });
    showToast(`Invoice ${newInvoice.invoiceNumber} uploaded for audit.`, 'success');
  };

  return (
    <div className="flex flex-1 flex-col font-sans">

      {/* TOAST PANEL */}
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
              <Award className="w-5 h-5 text-blue-600" />
              {currentVendor.name}
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 px-2 py-0.5 rounded-md">
                Vendor Code: {currentVendor.id}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Active projects, automated bidding pipelines, PO fulfillment, and digital invoicing matching.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-semibold">Outstanding</span>
              <span className="text-sm font-black text-slate-800 block">₹{currentVendor.outstandingAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider font-semibold">Avail. Credit</span>
              <span className="text-xs font-bold text-slate-600 block mt-0.5">₹{(currentVendor.bank.creditLimit - currentVendor.outstandingAmount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS SELECT */}
      <div className="bg-white border-b px-6 shadow-xs">
        <div className="flex items-center gap-2">
          {[
            { id: 'rfqs', label: 'RFQ Opportunities' },
            { id: 'pos', label: 'Purchase Orders' },
            { id: 'deliveries', label: 'Logistics & Shipments' },
            { id: 'invoices', label: 'Invoices & Payouts' },
            { id: 'compliance', label: 'Documents & Compliance' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* CONTENT REGION */}
      <div className="p-6 flex-1 flex flex-col gap-6">

        {/* TAB 1: RFQ OPPORTUNITIES */}
        {activeTab === 'rfqs' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Active Sourcing Requisitions</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">RFQ ID</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Project Site</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Response Due Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Materials Requested</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-center">Bidding Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorRFQs.map(rfq => {
                  const alreadyQuoted = vendorQuotes.some(q => q.rfqId === rfq.id);
                  return (
                    <tr key={rfq.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 text-sm font-bold text-blue-600">{rfq.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-800">{rfq.project}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{rfq.dueDate}</td>
                      <td className="px-4 py-3 text-xs text-slate-650 font-semibold">
                        {rfq.items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {alreadyQuoted ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-650 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            Quote Submitted
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              const defaultRates: Record<string, number> = {};
                              rfq.items.forEach(i => {
                                defaultRates[i.name] = i.expectedRate || 400;
                              });
                              setQuoteDraft({
                                rates: defaultRates,
                                transport: 2000,
                                loading: 500,
                                discount: 0,
                                leadTime: '2 Days',
                                paymentTerms: '30 Days',
                                remarks: 'Standard commercial rates offered.'
                              });
                              setSelectedRFQForQuote(rfq);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-600/10"
                          >
                            Submit Quotation
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: PURCHASE ORDERS */}
        {activeTab === 'pos' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Received Construction Purchase Orders</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">PO Ref</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Project</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Created Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">PO Total Value (INR)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Delivery Stage</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Approval</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorPOs.map(po => (
                  <tr key={po.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-bold text-blue-600">{po.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{po.project}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{po.createdDate}</td>
                    <td className="px-4 py-3 text-sm font-black text-slate-800 text-right">₹{po.grandTotal.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-105 text-slate-700 text-[10px] font-bold border">
                        {po.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {po.approvalStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {po.approvalStatus === 'Approved' && po.deliveryStatus === 'Not Scheduled' && (
                        <button
                          onClick={() => {
                            const qtys: Record<string, number> = {};
                            po.items.forEach(i => {
                              qtys[i.name] = i.quantity;
                            });
                            setDispatchDraft({
                              challanNumber: `CH-FL-${Date.now().toString().substring(8)}`,
                              vehicleNumber: 'OD-02-X-9821',
                              driverName: 'Ramu Sahu',
                              driverPhone: '9438099882',
                              quantities: qtys
                            });
                            setSelectedPOForDispatch(po);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-600/10"
                        >
                          Dispatch Delivery
                        </button>
                      )}
                      {po.deliveryStatus === 'Dispatched' && (
                        <span className="text-[10px] text-slate-500 font-bold">Transit Active</span>
                      )}
                      {po.deliveryStatus === 'Delivered' && (
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          Receipt Confirmed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: LOGISTICS & SHIPMENTS */}
        {activeTab === 'deliveries' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Dispatched challans & Gate Status</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Challan / vehicle</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">PO Reference</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Project Site</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Dispatch Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Items</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorDeliveries.map(d => (
                  <tr key={d.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="text-sm font-bold text-slate-850">{d.challanNumber}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Vehicle: {d.vehicleNumber}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-indigo-650 font-bold">{d.poId}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{d.project}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{d.deliveryDate}</td>
                    <td className="px-4 py-3 text-xs text-slate-650">
                      {d.items.map(i => `${i.shippedQty} ${i.unit} ${i.materialName}`).join(', ')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        d.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200 border-dashed animate-pulse'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: INVOICES & PAYOUTS */}
        {activeTab === 'invoices' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Tax Invoices & Payout Logs</h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold">Upload commercial invoices matching verified GRNs.</p>
              </div>

              <button
                onClick={() => setShowUploadInvoiceModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-600/10"
              >
                <Plus className="w-3.5 h-3.5" />
                Upload Invoice
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Invoice Number</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">PO Reference</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Invoice Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Invoice Amount (INR)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Deductions</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase text-right">Net Payable</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-bold text-slate-800">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3 text-xs text-blue-600 font-bold">{inv.poId}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: COMPLIANCE DOCUMENTS */}
        {activeTab === 'compliance' && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b pb-4">Onboarding Compliance Folder</h3>

            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b text-left">
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Document Name</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Upload Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Expiry</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase">Auditing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentVendor.documents.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-800 flex items-center gap-2">
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* SUBMIT BID OPPORTUNITY MODAL */}
      {selectedRFQForQuote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Submit Pricing Bid</h3>

            <form onSubmit={handleQuoteSubmit} className="my-4 space-y-4">
              {selectedRFQForQuote.items.map(item => (
                <div key={item.name}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Rate for {item.name} (Per {item.unit}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={quoteDraft.rates[item.name] ?? item.expectedRate ?? 400}
                    onChange={(e) => {
                      const rateVal = Number(e.target.value);
                      setQuoteDraft(prev => ({
                        ...prev,
                        rates: { ...prev.rates, [item.name]: rateVal }
                      }));
                    }}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Transit Charges (INR)</label>
                  <input
                    type="number"
                    value={quoteDraft.transport}
                    onChange={(e) => setQuoteDraft(prev => ({ ...prev, transport: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Loading Charges (INR)</label>
                  <input
                    type="number"
                    value={quoteDraft.loading}
                    onChange={(e) => setQuoteDraft(prev => ({ ...prev, loading: Number(e.target.value) }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Time</label>
                  <input
                    type="text"
                    required
                    value={quoteDraft.leadTime}
                    onChange={(e) => setQuoteDraft(prev => ({ ...prev, leadTime: e.target.value }))}
                    placeholder="e.g. 2 Days"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Payment terms</label>
                  <select
                    value={quoteDraft.paymentTerms}
                    onChange={(e) => setQuoteDraft(prev => ({ ...prev, paymentTerms: e.target.value }))}
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

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Remarks / Note</label>
                <textarea
                  rows={2}
                  value={quoteDraft.remarks}
                  onChange={(e) => setQuoteDraft(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setSelectedRFQForQuote(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH DELIVERY CHALLAN MODAL */}
      {selectedPOForDispatch && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Dispatch Transit Delivery</h3>

            <form onSubmit={handleDispatchSubmit} className="my-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Challan Reference Number</label>
                <input
                  type="text"
                  required
                  value={dispatchDraft.challanNumber}
                  onChange={(e) => setDispatchDraft(prev => ({ ...prev, challanNumber: e.target.value }))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Truck Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={dispatchDraft.vehicleNumber}
                    onChange={(e) => setDispatchDraft(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    placeholder="e.g. OD-02-X-9821"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Driver Full Name</label>
                  <input
                    type="text"
                    required
                    value={dispatchDraft.driverName}
                    onChange={(e) => setDispatchDraft(prev => ({ ...prev, driverName: e.target.value }))}
                    placeholder="e.g. Ramu Sahu"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Driver Contact Mobile</label>
                <input
                  type="tel"
                  required
                  value={dispatchDraft.driverPhone}
                  onChange={(e) => setDispatchDraft(prev => ({ ...prev, driverPhone: e.target.value }))}
                  placeholder="e.g. 9876543210"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setSelectedPOForDispatch(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD TAX INVOICE MODAL */}
      {showUploadInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl p-6 overflow-hidden animate-zoom-in">
            <h3 className="font-bold text-lg text-slate-900 border-b pb-2">Upload Tax Invoice</h3>

            <form onSubmit={handleInvoiceSubmit} className="my-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Invoice Reference Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceDraft.invoiceNumber}
                    onChange={(e) => setInvoiceDraft(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    placeholder="e.g. INV/2026/892"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Linked PO Reference</label>
                  <select
                    value={invoiceDraft.poId}
                    onChange={(e) => {
                      const poId = e.target.value;
                      const selectedPO = vendorPOs.find(p => p.id === poId);
                      setInvoiceDraft(prev => ({
                        ...prev,
                        poId,
                        invoiceAmount: selectedPO ? selectedPO.grandTotal.toString() : '',
                        taxAmount: selectedPO ? selectedPO.taxAmount.toString() : ''
                      }));
                    }}
                    required
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  >
                    <option value="">Select PO...</option>
                    {vendorPOs.map(po => (
                      <option key={po.id} value={po.id}>{po.id} ({po.project})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Gross Invoice Value (INR)</label>
                  <input
                    type="number"
                    required
                    value={invoiceDraft.invoiceAmount}
                    onChange={(e) => setInvoiceDraft(prev => ({ ...prev, invoiceAmount: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tax Amount (INR)</label>
                  <input
                    type="number"
                    value={invoiceDraft.taxAmount}
                    onChange={(e) => setInvoiceDraft(prev => ({ ...prev, taxAmount: e.target.value }))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Supporting PDF Copy</label>
                <div className="border border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center">
                  <Upload className="w-5 h-5 text-slate-400 mb-2" />
                  <span className="text-xs text-slate-500 font-semibold">Simulated tax_invoice.pdf</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button type="button" onClick={() => setShowUploadInvoiceModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all cursor-pointer">
                  Submit Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
