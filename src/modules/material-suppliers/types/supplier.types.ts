export type Role = 'admin' | 'manager' | 'vendor';

export type SupplierStatus = 'Draft' | 'Pending Approval' | 'Active' | 'On Hold' | 'Blacklisted';

export type ComplianceStatus = 'Complete' | 'Pending Documents' | 'Action Required' | 'None';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Pending';

export type PaymentStatus = 'Paid' | 'Unpaid' | 'Partially Paid';

export interface MaterialItem {
  id: string;
  category: string;
  subCategory?: string;
  name: string;
  brand: string;
  grade?: string;
  unit: string;
  moq: number;
  rate: number; // INR
  taxPercent: number;
  validTill: string;
  availability: 'In Stock' | 'Out of Stock' | 'Lead Time Required';
  remarks?: string;
}

export interface SupplierContact {
  name: string;
  designation?: string;
  phone: string;
  altPhone?: string;
  email: string;
  whatsapp?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  serviceAreas: string[];
}

export interface BankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId?: string;
  paymentTerms: string;
  creditLimit: number;
  advanceRequired: boolean;
  retentionApplicable: boolean;
}

export interface SupplierDocument {
  id: string;
  name: string;
  type: string;
  fileName: string;
  expiryDate?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  remarks?: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface Supplier {
  id: string; // V-001
  name: string;
  displayName?: string;
  businessType: string; // Proprietorship, Partnership, Private Limited, etc.
  status: SupplierStatus;
  gstNumber: string;
  panNumber: string;
  cinNumber?: string;
  msmeNumber?: string;
  tradeLicenseNumber?: string;
  establishmentYear?: number;
  website?: string;
  contact: SupplierContact;
  bank: BankDetails;
  documents: SupplierDocument[];
  materials: MaterialItem[];
  rating: number; // e.g. 4.5
  activeProjects: number;
  pendingRFQs: number;
  openPOs: number;
  outstandingAmount: number; // INR
  compliance: ComplianceStatus;
  risk: RiskLevel;
}

export interface RFQItem {
  category: string;
  name: string;
  specification?: string;
  brandPreference?: string;
  quantity: number;
  unit: string;
  expectedRate?: number;
  remarks?: string;
}

export interface RFQ {
  id: string; // RFQ-001
  project: string;
  siteLocation: string;
  requestedBy: string;
  requestedDate: string;
  deliveryDate: string;
  dueDate: string;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Quoted' | 'Partially Quoted' | 'Expired' | 'Cancelled' | 'Converted to PO';
  items: RFQItem[];
  termsAndConditions?: string;
  attachments: string[];
  internalNotes?: string;
  vendorResponsesCount: number;
}

export interface QuotationItem {
  materialName: string;
  requestedQty: number;
  unit: string;
  quotedRate: number;
  availableQty: number;
  deliveryDays: number;
  remarks?: string;
}

export interface Quotation {
  id: string; // QT-001
  rfqId: string;
  supplierId: string;
  supplierName: string;
  project: string;
  validTill: string;
  deliveryLeadTime: string; // e.g. "3 days"
  items: QuotationItem[];
  taxAmount: number;
  transportCharges: number;
  loadingCharges: number;
  discount: number;
  totalAmount: number;
  paymentTerms: string;
  termsAndConditions?: string;
  attachments: string[];
  remarks?: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Expired' | 'Converted to PO';
  submittedDate: string;
}

export interface POItem {
  category: string;
  name: string;
  specification?: string;
  brand?: string;
  quantity: number;
  unit: string;
  rate: number;
  taxPercent: number;
  discountPercent?: number;
  amount: number;
}

export interface PurchaseOrder {
  id: string; // PO-001
  rfqId?: string;
  quotationId?: string;
  supplierId: string;
  supplierName: string;
  project: string;
  siteLocation: string;
  deliveryAddress: string;
  expectedDeliveryDate: string;
  items: POItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  transportCharges: number;
  grandTotal: number;
  paymentTerms: string;
  billingAddress: string;
  shippingAddress: string;
  attachments: string[];
  internalNotes?: string;
  approvalStatus: 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Sent to Supplier' | 'Accepted by Supplier' | 'Rejected by Supplier' | 'Partially Delivered' | 'Delivered' | 'Closed' | 'Cancelled';
  deliveryStatus: 'Not Scheduled' | 'Scheduled' | 'Dispatched' | 'In Transit' | 'Partially Delivered' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  createdDate: string;
  approvedDate?: string;
  approvedBy?: string;
}

export interface DeliveryItem {
  materialName: string;
  orderedQty: number;
  dispatchQty: number;
  receivedQty?: number;
  acceptedQty?: number;
  rejectedQty?: number;
  unit: string;
  batchNumber?: string;
  remarks?: string;
}

export interface Delivery {
  id: string; // DEL-001
  poId: string;
  project: string;
  siteLocation: string;
  supplierId: string;
  supplierName: string;
  deliveryDate: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  challanNumber: string;
  items: DeliveryItem[];
  status: 'Scheduled' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Partially Delivered' | 'Rejected' | 'Cancelled';
  grnStatus: 'Pending' | 'Generated';
  grnId?: string;
  attachments: string[];
  remarks?: string;
}

export interface GRN {
  id: string; // GRN-001
  deliveryId: string;
  poId: string;
  supplierId: string;
  supplierName: string;
  project: string;
  siteLocation: string;
  receivedBy: string;
  receivedDate: string;
  items: {
    materialName: string;
    orderedQty: number;
    dispatchQty: number;
    receivedQty: number;
    acceptedQty: number;
    rejectedQty: number;
    unit: string;
    condition: 'Good' | 'Damaged' | 'Short Quantity' | 'Wrong Material' | 'Quality Issue';
    remarks?: string;
  }[];
  attachments: string[];
  remarks?: string;
}

export interface QualityCheck {
  id: string; // QC-001
  grnId: string;
  poId: string;
  materialName: string;
  supplierName: string;
  project: string;
  receivedQty: number;
  sampleQty: number;
  testType: string; // Visual, Lab, etc.
  assignedTo: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Passed' | 'Failed' | 'Partially Accepted' | 'Waived';
  testResult?: 'Passed' | 'Failed' | 'Partially Accepted';
  acceptedQty?: number;
  rejectedQty?: number;
  reportFile?: string;
  notes?: string;
}

export interface Invoice {
  id: string; // INV-001
  poId: string;
  grnId?: string;
  supplierId: string;
  supplierName: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceAmount: number;
  taxAmount: number;
  transportCharges: number;
  deductions: number;
  matchedAmount: number;
  paymentStatus: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Partially Paid' | 'Paid' | 'Rejected' | 'On Hold';
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  pdfFile?: string;
  remarks?: string;
}

export interface Payment {
  id: string; // PAY-001
  invoiceId: string;
  supplierId: string;
  payableAmount: number;
  paymentAmount: number;
  paymentDate: string;
  paymentMode: 'Bank Transfer' | 'UPI' | 'Cheque' | 'Cash' | 'NEFT' | 'RTGS' | 'IMPS';
  transactionId: string;
  bankAccount: string;
  remarks?: string;
}

export interface CommunicationLog {
  id: string;
  date: string;
  type: 'Call' | 'Email' | 'WhatsApp' | 'Meeting' | 'Complaint' | 'Negotiation' | 'Internal Note' | 'System Notification';
  subject: string;
  description: string;
  addedBy: string;
  visibility: 'Internal Only' | 'Visible to Vendor';
  attachments: string[];
  followUpRequired: boolean;
  followUpDate?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: Role;
  action: string;
  module: string;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
}

export interface ProjectAssociation {
  projectName: string;
  siteLocation: string;
  materialSupplied: string[];
  activePOsCount: number;
  totalOrderValue: number;
  pendingDeliveriesCount: number;
  outstandingPayment: number;
  status: 'Active' | 'Completed';
}
