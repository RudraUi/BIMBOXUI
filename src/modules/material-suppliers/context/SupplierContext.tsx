import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Supplier, RFQ, Quotation, PurchaseOrder, Delivery, GRN, QualityCheck,
  Invoice, CommunicationLog, AuditLog, Role
} from '../types/supplier.types';
import {
  initialSuppliers, initialRFQs, initialQuotations, initialPurchaseOrders,
  initialDeliveries, initialGRNs, initialQualityChecks, initialInvoices,
  initialCommunicationLogs, initialAuditLogs
} from '../data/mockData';

interface SupplierContextType {
  suppliers: Supplier[];
  rfqs: RFQ[];
  quotations: Quotation[];
  purchaseOrders: PurchaseOrder[];
  deliveries: Delivery[];
  grns: GRN[];
  qualityChecks: QualityCheck[];
  invoices: Invoice[];
  communicationLogs: Record<string, CommunicationLog[]>; // supplierId -> logs
  auditLogs: AuditLog[];
  role: Role;
  activeVendorId: string;
  
  // State setters & actions
  setRole: (role: Role) => void;
  setActiveVendorId: (id: string) => void;
  
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (supplierId: string) => boolean;
  
  createRFQ: (rfq: RFQ) => void;
  updateRFQStatus: (rfqId: string, status: RFQ['status']) => void;
  
  submitQuotation: (quotation: Quotation) => void;
  updateQuotationStatus: (quotationId: string, status: Quotation['status']) => void;
  
  convertRFQToPO: (rfqId: string, quotationId: string, customTerms?: string) => PurchaseOrder;
  approvePO: (poId: string, approvedBy: string) => void;
  updatePOStatus: (poId: string, status: PurchaseOrder['approvalStatus']) => void;
  updatePODeliveryStatus: (poId: string, status: PurchaseOrder['deliveryStatus']) => void;
  updatePOPaymentStatus: (poId: string, status: PurchaseOrder['paymentStatus']) => void;
  
  createDelivery: (delivery: Delivery) => void;
  updateDeliveryStatus: (deliveryId: string, status: Delivery['status']) => void;
  
  createGRN: (grn: GRN) => void;
  
  createQualityCheck: (qc: QualityCheck) => void;
  performQualityCheck: (qcId: string, result: 'Passed' | 'Failed', acceptedQty: number, rejectedQty: number, notes: string) => void;
  
  submitInvoice: (invoice: Invoice) => void;
  approveInvoice: (invoiceId: string) => void;
  rejectInvoice: (invoiceId: string, remarks: string) => void;
  recordPayment: (invoiceId: string, amount: number, mode: string, transactionId: string) => void;
  
  addCommunicationLog: (supplierId: string, log: Omit<CommunicationLog, 'id'>) => void;
  addAuditLog: (action: string, module: string, oldValue?: string, newValue?: string) => void;
  
  resetData: () => void;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

const dateOnlyAgo = (num: number) => {
  const d = new Date();
  d.setDate(d.getDate() - num);
  return d.toISOString().split('T')[0];
};

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state helper
  const getStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStored('ms_suppliers', initialSuppliers));
  const [rfqs, setRfqs] = useState<RFQ[]>(() => getStored('ms_rfqs', initialRFQs));
  const [quotations, setQuotations] = useState<Quotation[]>(() => getStored('ms_quotations', initialQuotations));
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(() => getStored('ms_purchaseOrders', initialPurchaseOrders));
  const [deliveries, setDeliveries] = useState<Delivery[]>(() => getStored('ms_deliveries', initialDeliveries));
  const [grns, setGrns] = useState<GRN[]>(() => getStored('ms_grns', initialGRNs));
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>(() => getStored('ms_qualityChecks', initialQualityChecks));
  const [invoices, setInvoices] = useState<Invoice[]>(() => getStored('ms_invoices', initialInvoices));
  
  const [communicationLogs, setCommunicationLogs] = useState<Record<string, CommunicationLog[]>>(() => {
    try {
      const stored = localStorage.getItem('ms_communicationLogs');
      if (stored) return JSON.parse(stored);
      
      // Seed initial communication logs to V-001, V-002, etc.
      const initialMap: Record<string, CommunicationLog[]> = {};
      initialCommunicationLogs.forEach(log => {
        // Just round-robin or filter by description details if applicable
        // To make it simple, let's distribute them based on content or to V-001
        let suppId = 'V-001';
        if (log.subject.toLowerCase().includes('shree') || log.subject.toLowerCase().includes('steel')) suppId = 'V-002';
        else if (log.subject.toLowerCase().includes('sand') || log.subject.toLowerCase().includes('jena')) suppId = 'V-003';
        else if (log.subject.toLowerCase().includes('brick') || log.subject.toLowerCase().includes('mohanty')) suppId = 'V-004';
        else if (log.subject.toLowerCase().includes('plumb') || log.subject.toLowerCase().includes('pipe') || log.subject.toLowerCase().includes('astral')) suppId = 'V-005';
        else if (log.subject.toLowerCase().includes('paint')) suppId = 'V-006';
        else if (log.subject.toLowerCase().includes('electr') || log.subject.toLowerCase().includes('grid') || log.subject.toLowerCase().includes('wire')) suppId = 'V-007';
        else if (log.subject.toLowerCase().includes('hardware')) suppId = 'V-008';
        else if (log.subject.toLowerCase().includes('waterproof') || log.subject.toLowerCase().includes('fixit')) suppId = 'V-009';
        
        if (!initialMap[suppId]) initialMap[suppId] = [];
        initialMap[suppId].push(log);
      });
      return initialMap;
    } catch {
      return {};
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getStored('ms_auditLogs', initialAuditLogs));
  const [role, setRoleState] = useState<Role>(() => getStored('ms_role', 'admin'));
  const [activeVendorId, setActiveVendorIdState] = useState<string>(() => getStored('ms_activeVendorId', 'V-001'));

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ms_suppliers', JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem('ms_rfqs', JSON.stringify(rfqs));
  }, [rfqs]);
  useEffect(() => {
    localStorage.setItem('ms_quotations', JSON.stringify(quotations));
  }, [quotations]);
  useEffect(() => {
    localStorage.setItem('ms_purchaseOrders', JSON.stringify(purchaseOrders));
  }, [purchaseOrders]);
  useEffect(() => {
    localStorage.setItem('ms_deliveries', JSON.stringify(deliveries));
  }, [deliveries]);
  useEffect(() => {
    localStorage.setItem('ms_grns', JSON.stringify(grns));
  }, [grns]);
  useEffect(() => {
    localStorage.setItem('ms_qualityChecks', JSON.stringify(qualityChecks));
  }, [qualityChecks]);
  useEffect(() => {
    localStorage.setItem('ms_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('ms_communicationLogs', JSON.stringify(communicationLogs));
  }, [communicationLogs]);
  useEffect(() => {
    localStorage.setItem('ms_auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);
  useEffect(() => {
    localStorage.setItem('ms_role', JSON.stringify(role));
  }, [role]);
  useEffect(() => {
    localStorage.setItem('ms_activeVendorId', JSON.stringify(activeVendorId));
  }, [activeVendorId]);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    addAuditLog(`Switched User Role`, `System`, ``, `Role: ${newRole}`);
  };

  const setActiveVendorId = (id: string) => {
    setActiveVendorIdState(id);
    addAuditLog(`Switched Active Vendor`, `System`, ``, `Vendor ID: ${id}`);
  };

  // Audit Logger Helper
  const addAuditLog = (action: string, module: string, oldValue?: string, newValue?: string) => {
    const newLog: AuditLog = {
      id: `A-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: role === 'vendor' ? `${suppliers.find(s => s.id === activeVendorId)?.name || 'Vendor'} (Portal)` : 'Samuel Rodriguez',
      role: role,
      action,
      module,
      oldValue,
      newValue,
      ipAddress: '192.168.1.12'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // SUPPLIER ACTIONS
  const addSupplier = (supplier: Supplier) => {
    setSuppliers(prev => [...prev, supplier]);
    addAuditLog('Onboarded New Supplier', 'Supplier List', '', `${supplier.id} (${supplier.name})`);
  };

  const updateSupplier = (updated: Supplier) => {
    setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));
    addAuditLog('Updated Supplier Profile', 'Supplier Profile', '', `${updated.id} (${updated.name})`);
  };

  const deleteSupplier = (id: string): boolean => {
    if (role !== 'admin') return false;
    const target = suppliers.find(s => s.id === id);
    if (!target) return false;
    setSuppliers(prev => prev.filter(s => s.id !== id));
    addAuditLog('Deleted Supplier', 'Supplier List', `${target.name}`, '');
    return true;
  };

  // RFQ ACTIONS
  const createRFQ = (rfq: RFQ) => {
    setRfqs(prev => [rfq, ...prev]);
    addAuditLog('Created RFQ', 'RFQ module', '', `${rfq.id} for ${rfq.project}`);
  };

  const updateRFQStatus = (rfqId: string, status: RFQ['status']) => {
    setRfqs(prev => prev.map(r => r.id === rfqId ? { ...r, status } : r));
    addAuditLog('Updated RFQ Status', 'RFQ module', '', `${rfqId} status to ${status}`);
  };

  // QUOTATION ACTIONS
  const submitQuotation = (quotation: Quotation) => {
    setQuotations(prev => [quotation, ...prev]);
    
    // Increment RFQ response count
    setRfqs(prev => prev.map(r => {
      if (r.id === quotation.rfqId) {
        return {
          ...r,
          status: 'Quoted' as const,
          vendorResponsesCount: r.vendorResponsesCount + 1
        };
      }
      return r;
    }));

    // Update supplier count
    setSuppliers(prev => prev.map(s => {
      if (s.id === quotation.supplierId) {
        return { ...s, pendingRFQs: Math.max(0, s.pendingRFQs - 1) };
      }
      return s;
    }));

    addAuditLog('Submitted Quotation', 'Vendor RFQ Responses', '', `${quotation.id} from ${quotation.supplierName}`);
  };

  const updateQuotationStatus = (quotationId: string, status: Quotation['status']) => {
    setQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status } : q));
    addAuditLog('Quotation Status Change', 'Quotation module', '', `${quotationId} to ${status}`);
  };

  // PURCHASE ORDER ACTIONS
  const convertRFQToPO = (rfqId: string, quotationId: string, customTerms?: string): PurchaseOrder => {
    const q = quotations.find(qt => qt.id === quotationId);
    const r = rfqs.find(rf => rf.id === rfqId);
    const s = suppliers.find(su => su.id === q?.supplierId);
    
    if (!q || !s) {
      throw new Error("Quotation or Supplier details not found");
    }

    // Convert Quotation items to PO items
    const poItems = q.items.map(item => {
      // Find matching RFQ item for category
      const rfqItem = r?.items.find(ri => ri.name === item.materialName);
      return {
        category: rfqItem?.category || 'General Materials',
        name: item.materialName,
        specification: rfqItem?.specification || '',
        brand: rfqItem?.brandPreference || '',
        quantity: item.requestedQty,
        unit: item.unit,
        rate: item.quotedRate,
        taxPercent: 18, // Assume standard 18% if not matching cement
        amount: item.requestedQty * item.quotedRate
      };
    });

    const subtotal = poItems.reduce((acc, item) => acc + item.amount, 0);
    const taxAmount = poItems.reduce((acc, item) => acc + (item.amount * (item.taxPercent / 100)), 0);
    const transportCharges = q.transportCharges;
    const discountAmount = q.discount;
    const grandTotal = subtotal + taxAmount + transportCharges - discountAmount;

    const newPO: PurchaseOrder = {
      id: `PO-${Date.now().toString().substring(7)}`,
      rfqId,
      quotationId,
      supplierId: s.id,
      supplierName: s.name,
      project: q.project,
      siteLocation: r?.siteLocation || 'Project Site',
      deliveryAddress: r?.siteLocation || 'Project Site Address',
      expectedDeliveryDate: dateOnlyAgo(-5), // Default 5 days in future
      items: poItems,
      subtotal,
      taxAmount,
      discountAmount,
      transportCharges,
      grandTotal,
      paymentTerms: customTerms || q.paymentTerms,
      billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
      shippingAddress: r?.siteLocation || 'Project Site Address',
      attachments: [],
      approvalStatus: 'Draft',
      deliveryStatus: 'Not Scheduled',
      paymentStatus: 'Unpaid',
      createdDate: new Date().toISOString().split('T')[0]
    };

    setPurchaseOrders(prev => [newPO, ...prev]);

    // Update RFQ status
    setRfqs(prev => prev.map(rf => rf.id === rfqId ? { ...rf, status: 'Converted to PO' as const } : rf));
    // Update Quotation status
    setQuotations(prev => prev.map(qt => qt.id === quotationId ? { ...qt, status: 'Converted to PO' as const } : qt));
    // Update Supplier open PO count
    setSuppliers(prev => prev.map(su => su.id === s.id ? { ...su, openPOs: su.openPOs + 1 } : su));

    addAuditLog('Created PO from Quotation', 'Purchase Order Conversion', '', `${newPO.id} generated for ${s.name}`);
    return newPO;
  };

  const approvePO = (poId: string, approvedBy: string) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === poId) {
        return {
          ...po,
          approvalStatus: 'Approved' as const,
          approvedDate: new Date().toISOString().split('T')[0],
          approvedBy
        };
      }
      return po;
    }));
    addAuditLog('Approved Purchase Order', 'PO Flow', '', `${poId} approved by ${approvedBy}`);
  };

  const updatePOStatus = (poId: string, status: PurchaseOrder['approvalStatus']) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, approvalStatus: status } : po));
    addAuditLog('Updated PO Approval Status', 'PO Flow', '', `${poId} updated to ${status}`);
  };

  const updatePODeliveryStatus = (poId: string, status: PurchaseOrder['deliveryStatus']) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, deliveryStatus: status } : po));
    addAuditLog('Updated PO Delivery Status', 'PO Flow', '', `${poId} delivery set to ${status}`);
  };

  const updatePOPaymentStatus = (poId: string, status: PurchaseOrder['paymentStatus']) => {
    setPurchaseOrders(prev => prev.map(po => po.id === poId ? { ...po, paymentStatus: status } : po));
    addAuditLog('Updated PO Payment Status', 'PO Flow', '', `${poId} payment status set to ${status}`);
  };

  // DELIVERY ACTIONS
  const createDelivery = (delivery: Delivery) => {
    setDeliveries(prev => [delivery, ...prev]);

    // Update PO delivery status to Scheduled or Dispatched
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === delivery.poId) {
        return {
          ...po,
          deliveryStatus: delivery.status === 'Dispatched' ? 'Dispatched' as const : 'Scheduled' as const
        };
      }
      return po;
    }));

    addAuditLog('Dispatched Delivery Challan', 'Vendor Deliveries', '', `${delivery.id} for PO ${delivery.poId}`);
  };

  const updateDeliveryStatus = (deliveryId: string, status: Delivery['status']) => {
    setDeliveries(prev => prev.map(d => d.id === deliveryId ? { ...d, status } : d));
    
    // Propagate to PO if delivered
    if (status === 'Delivered') {
      const del = deliveries.find(d => d.id === deliveryId);
      if (del) {
        setPurchaseOrders(prev => prev.map(po => po.id === del.poId ? { ...po, deliveryStatus: 'Delivered' as const } : po));
      }
    }

    addAuditLog('Delivery Status Changed', 'Delivery tracking', '', `${deliveryId} changed to ${status}`);
  };

  // GOODS RECEIPT ACTIONS
  const createGRN = (grn: GRN) => {
    setGrns(prev => [grn, ...prev]);

    // Update delivery status
    setDeliveries(prev => prev.map(d => {
      if (d.id === grn.deliveryId) {
        return { ...d, status: 'Delivered' as const, grnStatus: 'Generated' as const, grnId: grn.id };
      }
      return d;
    }));

    // Update PO Delivery Status
    const totalRejected = grn.items.reduce((sum, item) => sum + item.rejectedQty, 0);
    const totalReceived = grn.items.reduce((sum, item) => sum + item.receivedQty, 0);
    const totalOrdered = grn.items.reduce((sum, item) => sum + item.orderedQty, 0);

    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === grn.poId) {
        let deliveryStatus: PurchaseOrder['deliveryStatus'] = 'Delivered';
        if (totalReceived < totalOrdered) {
          deliveryStatus = 'Partially Delivered';
        }
        return { ...po, deliveryStatus };
      }
      return po;
    }));

    // Automatically trigger a pending Quality Check for each received item
    grn.items.forEach((item, index) => {
      const newQC: QualityCheck = {
        id: `QC-${Date.now().toString().substring(7)}-${index}`,
        grnId: grn.id,
        poId: grn.poId,
        materialName: item.materialName,
        supplierName: grn.supplierName,
        project: grn.project,
        receivedQty: item.receivedQty,
        sampleQty: Math.max(1, Math.floor(item.receivedQty * 0.01)), // 1% sample size
        testType: 'Visual & Dimension Check',
        assignedTo: 'Animesh Das (QA Engineer)',
        dueDate: dateOnlyAgo(-2), // 2 days in future
        status: 'Pending'
      };
      setQualityChecks(prev => [newQC, ...prev]);
    });

    addAuditLog('Goods Receipt Note Generated', 'Site Material Receiving', '', `${grn.id} issued for delivery ${grn.deliveryId}`);
  };

  // QUALITY CONTROL ACTIONS
  const createQualityCheck = (qc: QualityCheck) => {
    setQualityChecks(prev => [qc, ...prev]);
  };

  const performQualityCheck = (qcId: string, result: 'Passed' | 'Failed', acceptedQty: number, rejectedQty: number, notes: string) => {
    setQualityChecks(prev => prev.map(q => {
      if (q.id === qcId) {
        return {
          ...q,
          status: result === 'Passed' ? 'Passed' as const : 'Failed' as const,
          testResult: result,
          acceptedQty,
          rejectedQty,
          notes,
          reportFile: 'quality_test_report_gen.pdf'
        };
      }
      return q;
    }));

    // Generate Invoice auto-draft if QC passes or partial accepted
    const qcItem = qualityChecks.find(q => q.id === qcId);
    if (qcItem) {
      addAuditLog('Completed Material Quality Inspection', 'QC module', '', `QC ${qcId} set to ${result}`);
      
      // Update supplier rating slightly based on QC success
      setSuppliers(prev => prev.map(s => {
        if (s.name === qcItem.supplierName) {
          const newRating = result === 'Passed' 
            ? Math.min(5, Number((s.rating + 0.05).toFixed(2)))
            : Math.max(1, Number((s.rating - 0.1).toFixed(2)));
          return { ...s, rating: newRating };
        }
        return s;
      }));
    }
  };

  // INVOICE & PAYMENT ACTIONS
  const submitInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    addAuditLog('Uploaded Invoice', 'Supplier Invoice Portal', '', `${invoice.id} (Ref: ${invoice.invoiceNumber})`);
  };

  const approveInvoice = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, paymentStatus: 'Approved' as const, approvalStatus: 'Approved' as const };
      }
      return inv;
    }));

    // Update PO payment status
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) {
      setPurchaseOrders(prev => prev.map(po => {
        if (po.id === inv.poId) {
          return { ...po, paymentStatus: 'Unpaid' as const }; // Pending disbursement
        }
        return po;
      }));
      
      // Update outstanding amount on supplier
      setSuppliers(prev => prev.map(s => {
        if (s.id === inv.supplierId) {
          return { ...s, outstandingAmount: s.outstandingAmount + inv.matchedAmount };
        }
        return s;
      }));
    }

    addAuditLog('Approved Invoice for Payment', 'Finance module', '', `${invoiceId} approved`);
  };

  const rejectInvoice = (invoiceId: string, remarks: string) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, paymentStatus: 'Rejected' as const, approvalStatus: 'Rejected' as const, remarks };
      }
      return inv;
    }));
    addAuditLog('Rejected Invoice', 'Finance module', '', `${invoiceId} rejected: ${remarks}`);
  };

  const recordPayment = (invoiceId: string, amount: number, mode: string, transactionId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    setInvoices(prev => prev.map(i => {
      if (i.id === invoiceId) {
        const remaining = i.matchedAmount - amount;
        return {
          ...i,
          paymentStatus: remaining <= 0 ? 'Paid' as const : 'Partially Paid' as const
        };
      }
      return i;
    }));

    // Reduce supplier outstanding and PO payments
    setSuppliers(prev => prev.map(s => {
      if (s.id === inv.supplierId) {
        return {
          ...s,
          outstandingAmount: Math.max(0, s.outstandingAmount - amount)
        };
      }
      return s;
    }));

    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === inv.poId) {
        return {
          ...po,
          paymentStatus: 'Paid' as const // Simplified
        };
      }
      return po;
    }));

    addAuditLog('Recorded Payment Release', 'Finance payouts', '', `Paid INR ${amount.toLocaleString('en-IN')} for invoice ${invoiceId}`);
  };

  // COMMUNICATION LOG ACTIONS
  const addCommunicationLog = (supplierId: string, log: Omit<CommunicationLog, 'id'>) => {
    const newLog: CommunicationLog = {
      ...log,
      id: `C-${Date.now()}`
    };

    setCommunicationLogs(prev => {
      const list = prev[supplierId] || [];
      return {
        ...prev,
        [supplierId]: [newLog, ...list]
      };
    });

    addAuditLog('Logged Communication Event', 'Supplier logs', '', `Type: ${log.type} - Subject: ${log.subject}`);
  };

  // RESET
  const resetData = () => {
    localStorage.removeItem('ms_suppliers');
    localStorage.removeItem('ms_rfqs');
    localStorage.removeItem('ms_quotations');
    localStorage.removeItem('ms_purchaseOrders');
    localStorage.removeItem('ms_deliveries');
    localStorage.removeItem('ms_grns');
    localStorage.removeItem('ms_qualityChecks');
    localStorage.removeItem('ms_invoices');
    localStorage.removeItem('ms_communicationLogs');
    localStorage.removeItem('ms_auditLogs');
    localStorage.removeItem('ms_role');
    localStorage.removeItem('ms_activeVendorId');

    setSuppliers(initialSuppliers);
    setRfqs(initialRFQs);
    setQuotations(initialQuotations);
    setPurchaseOrders(initialPurchaseOrders);
    setDeliveries(initialDeliveries);
    setGrns(initialGRNs);
    setQualityChecks(initialQualityChecks);
    setInvoices(initialInvoices);
    setCommunicationLogs({});
    setAuditLogs(initialAuditLogs);
    setRoleState('admin');
    setActiveVendorIdState('V-001');

    window.location.reload();
  };

  return (
    <SupplierContext.Provider value={{
      suppliers, rfqs, quotations, purchaseOrders, deliveries, grns, qualityChecks, invoices, communicationLogs, auditLogs, role, activeVendorId,
      setRole, setActiveVendorId,
      addSupplier, updateSupplier, deleteSupplier,
      createRFQ, updateRFQStatus,
      submitQuotation, updateQuotationStatus,
      convertRFQToPO, approvePO, updatePOStatus, updatePODeliveryStatus, updatePOPaymentStatus,
      createDelivery, updateDeliveryStatus,
      createGRN,
      createQualityCheck, performQualityCheck,
      submitInvoice, approveInvoice, rejectInvoice, recordPayment,
      addCommunicationLog, addAuditLog,
      resetData
    }}>
      {children}
    </SupplierContext.Provider>
  );
};

export const useSuppliers = () => {
  const context = useContext(SupplierContext);
  if (!context) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};
