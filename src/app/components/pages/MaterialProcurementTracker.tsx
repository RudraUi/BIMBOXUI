import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  UserCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";

type Role = "Project Manager" | "Admin" | "Procurement Manager" | "Vendor";
type Priority = "Low" | "Medium" | "High" | "Urgent";

type MaterialRequestStatus =
  | "Draft"
  | "Auto Suggested"
  | "Submitted by Project Manager"
  | "Under Admin Review"
  | "Clarification Required"
  | "Stock Available"
  | "Sent to Procurement"
  | "RFQ Created"
  | "RFQ Sent"
  | "Quotation Received"
  | "Vendor Selected"
  | "PO Draft"
  | "PO Issued"
  | "Partially Delivered"
  | "Delivered"
  | "Site Verified"
  | "Invoice On Hold"
  | "Invoice Matched"
  | "Closed"
  | "Rejected";

type TimelineEntry = {
  label: string;
  by: string;
  date: string;
  note?: string;
};

type ApprovalHistory = {
  role: Role | "System";
  name: string;
  action: string;
  date: string;
  notes?: string;
};

type Attachment = {
  name: string;
  size: string;
  type: string;
};

type MaterialLineItem = {
  itemId: string;
  materialName: string;
  category: string;
  specification: string;
  requiredQuantity: number;
  unit: string;
  availableStock: number;
  shortageQuantity: number;
  requiredDate: string;
  priority: Priority;
  boqReference: string;
  drawingReference: string;
  activityReference: string;
};

type RFQ = {
  rfqId: string;
  requestId: string;
  project: string;
  material: string;
  quantity: number;
  unit: string;
  lineItems?: MaterialLineItem[];
  vendorsInvited: string[];
  rfqDate: string;
  submissionDeadline: string;
  status: "Draft" | "Created" | "Sent" | "Closed";
};

type Quotation = {
  quotationId: string;
  rfqId: string;
  vendorName: string;
  quantity: number;
  unitRate: number;
  tax: number;
  freight: number;
  discount: number;
  totalAmount: number;
  deliveryDays: number;
  paymentTerms: string;
  rating: number;
  validity: string;
  remarks: string;
  score: number;
  submittedBy?: Role;
  submittedAt?: string;
};

type PurchaseOrder = {
  poId: string;
  vendor: string;
  project: string;
  material: string;
  quantity: number;
  rate: number;
  tax: number;
  totalAmount: number;
  lineItems?: MaterialLineItem[];
  deliveryLocation: string;
  deliveryDate: string;
  paymentTerms: string;
  termsAndConditions: string;
  createdBy: string;
  approvedBy: string;
  status: "Draft" | "Issued" | "Delivered" | "Closed";
};

type GRN = {
  grnId: string;
  poId: string;
  vendor: string;
  material: string;
  orderedQuantity: number;
  receivedQuantity: number;
  damagedQuantity: number;
  acceptedQuantity: number;
  lineItems?: MaterialLineItem[];
  receivedDate: string;
  receivedBy: string;
  siteVerificationStatus: "Pending" | "Verified" | "Shortage/Damage Reported";
  projectManagerRemarks: string;
};

type InvoiceMatch = {
  invoiceId: string;
  poId: string;
  vendor: string;
  invoiceQuantity: number;
  invoiceAmount: number;
  acceptedQuantity: number;
  status: "Pending" | "Invoice On Hold" | "Invoice Matched";
  creditNoteRequested: boolean;
  resolutionNotes?: string;
};

type MaterialRequest = {
  requestId: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  requestedBy: string;
  requestedByRole: Role;
  departmentSite: string;
  site: string;
  materialName: string;
  category: string;
  specification: string;
  requiredQuantity: number;
  unit: string;
  availableStock: number;
  shortageQuantity: number;
  lineItems: MaterialLineItem[];
  requiredDate: string;
  priority: Priority;
  boqReference: string;
  drawingReference: string;
  activityReference: string;
  reason: string;
  generatedFrom: string;
  attachments: Attachment[];
  remarks: string;
  adminNotes: string;
  procurementNotes: string;
  assignedTo: string;
  status: MaterialRequestStatus;
  timeline: TimelineEntry[];
  approvalHistory: ApprovalHistory[];
  rfq?: RFQ;
  quotations: Quotation[];
  selectedVendor?: string;
  po?: PurchaseOrder;
  grn?: GRN;
  invoice?: InvoiceMatch;
};

type UpcomingMaterial = {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  specification: string;
  boqReference: string;
  drawingReference: string;
  priority: Priority;
};

type UpcomingActivity = {
  name: string;
  date: string;
  materials: UpcomingMaterial[];
};

type ActiveView = "Dashboard" | "Auto Suggestions" | "Requests" | "Admin Review" | "Workbench" | "Vendor Portal";
type RequestModalMode = "create" | "edit";
type WorkflowAction =
  | "submit"
  | "delete"
  | "admin-review"
  | "admin-approve"
  | "admin-reject"
  | "admin-clarify"
  | "admin-stock"
  | "admin-forward"
  | "create-rfq"
  | "send-rfq"
  | "receive-quotations"
  | "vendor-submit-quotation"
  | "select-vendor"
  | "create-po"
  | "issue-po"
  | "update-delivery"
  | "verify-delivery"
  | "match-invoice"
  | "request-credit-note"
  | "resolve-invoice"
  | "close";

type RequestLineDraft = {
  itemId: string;
  materialName: string;
  category: string;
  specification: string;
  requiredQuantity: string;
  unit: string;
  availableStock: string;
  requiredDate: string;
  priority: Priority;
  boqReference: string;
  drawingReference: string;
  activityReference: string;
};

type RequestDraft = {
  items: RequestLineDraft[];
  reason: string;
  remarks: string;
  departmentSite: string;
  attachmentName: string;
};

type DeliveryDraft = {
  receivedQuantity: string;
  damagedQuantity: string;
  receivedBy: string;
  receivedDate: string;
  remarks: string;
};

type InvoiceDraft = {
  invoiceQuantity: string;
  invoiceAmount: string;
  notes: string;
};

type VendorQuotationDraft = {
  vendorName: string;
  unitRate: string;
  taxPercent: string;
  freight: string;
  discount: string;
  deliveryDays: string;
  paymentTerms: string;
  rating: string;
  validity: string;
  remarks: string;
};

const TODAY = "2026-05-02";
const STORAGE_KEY = "hub.materialProcurement.requests.v3";

const PROJECT = {
  id: "GVRT-001",
  name: "Green Valley Residential Tower",
  code: "GVRT-001",
  projectManager: "Raj Mehta",
  admin: "Priya Shah",
  procurementManager: "Amit Patel",
  siteLocation: "Ahmedabad",
  phase: "Structure Work",
};

const UPCOMING_ACTIVITIES: UpcomingActivity[] = [
  {
    name: "Slab Casting - Level 5",
    date: "2026-05-10",
    materials: [
      {
        name: "Cement",
        quantity: 500,
        unit: "bags",
        category: "Binding Material",
        specification: "OPC 53 grade, 50 kg bag",
        boqReference: "BOQ-STR-L5-001",
        drawingReference: "STR-SLAB-L5-A102",
        priority: "High",
      },
      {
        name: "TMT Steel",
        quantity: 12,
        unit: "tons",
        category: "Reinforcement",
        specification: "Fe 500D TMT bars, mixed dia",
        boqReference: "BOQ-STR-L5-002",
        drawingReference: "STR-REBAR-L5-R210",
        priority: "Urgent",
      },
      {
        name: "Sand",
        quantity: 40,
        unit: "brass",
        category: "Aggregate",
        specification: "River sand, Zone II",
        boqReference: "BOQ-STR-L5-003",
        drawingReference: "STR-SLAB-L5-A102",
        priority: "High",
      },
      {
        name: "Aggregate",
        quantity: 60,
        unit: "brass",
        category: "Aggregate",
        specification: "20 mm crushed aggregate",
        boqReference: "BOQ-STR-L5-004",
        drawingReference: "STR-SLAB-L5-A102",
        priority: "High",
      },
    ],
  },
  {
    name: "Brickwork - Level 3",
    date: "2026-05-14",
    materials: [
      {
        name: "Bricks",
        quantity: 25000,
        unit: "pcs",
        category: "Masonry",
        specification: "Class A red clay bricks",
        boqReference: "BOQ-MAS-L3-001",
        drawingReference: "ARC-WALL-L3-A301",
        priority: "Medium",
      },
      {
        name: "Cement",
        quantity: 200,
        unit: "bags",
        category: "Binding Material",
        specification: "OPC 53 grade, 50 kg bag",
        boqReference: "BOQ-MAS-L3-002",
        drawingReference: "ARC-WALL-L3-A301",
        priority: "Medium",
      },
      {
        name: "Sand",
        quantity: 25,
        unit: "brass",
        category: "Aggregate",
        specification: "River sand, plaster/masonry mix",
        boqReference: "BOQ-MAS-L3-003",
        drawingReference: "ARC-WALL-L3-A301",
        priority: "Medium",
      },
    ],
  },
];

const CURRENT_STOCK: Record<string, number> = {
  Cement: 120,
  "TMT Steel": 4,
  Sand: 10,
  Aggregate: 25,
  Bricks: 8000,
};

const VENDOR_QUOTES = [
  {
    name: "Shree Cement Traders",
    rate: 330,
    deliveryDays: 2,
    paymentTerms: "30 days",
    rating: 4.5,
  },
  {
    name: "BuildMart Suppliers",
    rate: 325,
    deliveryDays: 5,
    paymentTerms: "15 days",
    rating: 4.2,
  },
  {
    name: "FastBuild Materials",
    rate: 340,
    deliveryDays: 1,
    paymentTerms: "45 days",
    rating: 4.7,
  },
  {
    name: "MetroBuild Prospective Vendor",
    rate: 335,
    deliveryDays: 3,
    paymentTerms: "30 days",
    rating: 4.0,
  },
];

const ALL_STATUSES: MaterialRequestStatus[] = [
  "Draft",
  "Auto Suggested",
  "Submitted by Project Manager",
  "Under Admin Review",
  "Clarification Required",
  "Stock Available",
  "Sent to Procurement",
  "RFQ Created",
  "RFQ Sent",
  "Quotation Received",
  "Vendor Selected",
  "PO Draft",
  "PO Issued",
  "Partially Delivered",
  "Delivered",
  "Site Verified",
  "Invoice On Hold",
  "Invoice Matched",
  "Closed",
  "Rejected",
];

const ROLE_NAMES: Record<Role, string> = {
  "Project Manager": PROJECT.projectManager,
  Admin: PROJECT.admin,
  "Procurement Manager": PROJECT.procurementManager,
  Vendor: "Vendor User",
};

const currency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const quantityLabel = (quantity: number, unit: string) =>
  `${quantity.toLocaleString("en-IN")} ${unit}`;

const PRIORITY_ORDER: Record<Priority, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Urgent: 4,
};

const parseQuantity = (value: string | number) => {
  const parsed = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getRequestItems = (request: MaterialRequest): MaterialLineItem[] =>
  request.lineItems?.length
    ? request.lineItems
    : [
        {
          itemId: `${request.requestId}-1`,
          materialName: request.materialName,
          category: request.category,
          specification: request.specification,
          requiredQuantity: request.requiredQuantity,
          unit: request.unit,
          availableStock: request.availableStock,
          shortageQuantity: request.shortageQuantity,
          requiredDate: request.requiredDate,
          priority: request.priority,
          boqReference: request.boqReference,
          drawingReference: request.drawingReference,
          activityReference: request.activityReference,
        },
      ];

const summarizeMaterialItems = (items: MaterialLineItem[]) => {
  if (!items.length) return "Material";
  if (items.length === 1) return items[0].materialName;
  return `${items[0].materialName} + ${items.length - 1} more`;
};

const summarizeCategoryItems = (items: MaterialLineItem[]) => {
  const categories = Array.from(new Set(items.map((item) => item.category).filter(Boolean)));
  if (categories.length <= 1) return categories[0] || "General Material";
  return "Multiple Categories";
};

const primaryItem = (items: MaterialLineItem[]) => items[0];

const highestPriority = (items: MaterialLineItem[]): Priority =>
  items.reduce<Priority>((current, item) => (PRIORITY_ORDER[item.priority] > PRIORITY_ORDER[current] ? item.priority : current), "Low");

const summarizeRequestQuantity = (request: MaterialRequest, field: "requiredQuantity" | "availableStock" | "shortageQuantity") => {
  const items = getRequestItems(request);
  const units = new Set(items.map((item) => item.unit));
  if (items.length === 1) return quantityLabel(items[0][field], items[0].unit);
  if (units.size === 1) return quantityLabel(items.reduce((sum, item) => sum + item[field], 0), items[0].unit);
  return `${items.length} items`;
};

const rfqQuantityForRequest = (request: MaterialRequest) => {
  const items = getRequestItems(request);
  return items.reduce((sum, item) => sum + item.shortageQuantity, 0) || request.shortageQuantity;
};

const rfqUnitForRequest = (request: MaterialRequest) => {
  const items = getRequestItems(request);
  return new Set(items.map((item) => item.unit)).size === 1 ? items[0]?.unit ?? request.unit : "mixed items";
};

const normalizeRequest = (request: MaterialRequest): MaterialRequest => {
  const items = getRequestItems(request);
  const first = primaryItem(items);
  return {
    ...request,
    materialName: summarizeMaterialItems(items),
    category: summarizeCategoryItems(items),
    specification: first?.specification ?? request.specification,
    requiredQuantity: first?.requiredQuantity ?? request.requiredQuantity,
    unit: first?.unit ?? request.unit,
    availableStock: first?.availableStock ?? request.availableStock,
    shortageQuantity: first?.shortageQuantity ?? request.shortageQuantity,
    requiredDate: first?.requiredDate ?? request.requiredDate,
    priority: highestPriority(items),
    boqReference: first?.boqReference ?? request.boqReference,
    drawingReference: first?.drawingReference ?? request.drawingReference,
    activityReference: first?.activityReference ?? request.activityReference,
    lineItems: items,
  };
};

const daysBefore = (date: string, days: number) => {
  const target = new Date(`${date}T00:00:00`);
  target.setDate(target.getDate() - days);
  return target.toISOString().slice(0, 10);
};

const makeTimeline = (label: string, by = "System", note?: string): TimelineEntry[] => [
  { label, by, date: TODAY, note },
];

const appendTimeline = (
  request: MaterialRequest,
  label: string,
  by: string,
  note?: string,
): MaterialRequest => ({
  ...request,
  timeline: [...request.timeline, { label, by, date: TODAY, note }],
});

const scoreQuotations = (quotations: Quotation[]): Quotation[] => {
  if (!quotations.length) return [];

  const minRate = Math.min(...quotations.map((quote) => quote.unitRate));
  const minDelivery = Math.min(...quotations.map((quote) => quote.deliveryDays));
  const maxRating = Math.max(...quotations.map((quote) => quote.rating));

  return quotations
    .map((quote) => {
      const priceScore = minRate / quote.unitRate;
      const deliveryScore = minDelivery / quote.deliveryDays;
      const ratingScore = quote.rating / maxRating;
      const score = (priceScore * 0.4 + deliveryScore * 0.4 + ratingScore * 0.2) * 100;
      return { ...quote, score: Number(score.toFixed(1)) };
    })
    .sort((a, b) => b.score - a.score);
};

const calculateQuotations = (rfqId: string, quantity: number, unit: string): Quotation[] => {
  const quotations = VENDOR_QUOTES.map((vendor, index) => {
    const base = quantity * vendor.rate;
    const tax = base * 0.18;
    const freight = vendor.deliveryDays === 1 ? 2200 : vendor.deliveryDays === 2 ? 1500 : 900;
    const discount = vendor.name === "BuildMart Suppliers" ? base * 0.01 : 0;

    return {
      quotationId: `QT-${rfqId.split("-").pop()}-${index + 1}`,
      rfqId,
      vendorName: vendor.name,
      quantity,
      unitRate: vendor.rate,
      tax,
      freight,
      discount,
      totalAmount: base + tax + freight - discount,
      deliveryDays: vendor.deliveryDays,
      paymentTerms: vendor.paymentTerms,
      rating: vendor.rating,
      validity: "2026-05-20",
      remarks:
        vendor.deliveryDays === 1
          ? "Dedicated vehicle available for urgent dispatch."
          : "Standard delivery slot subject to material lifting schedule.",
      score: 0,
      submittedBy: "Vendor" as Role,
      submittedAt: TODAY,
    };
  });

  return scoreQuotations(quotations);
};

const defaultVendorQuotationDraft = (vendorName = "FastBuild Materials"): VendorQuotationDraft => {
  const vendor = VENDOR_QUOTES.find((item) => item.name === vendorName) ?? VENDOR_QUOTES[0];
  return {
    vendorName: vendor.name,
    unitRate: String(vendor.rate),
    taxPercent: "18",
    freight: vendor.deliveryDays === 1 ? "2200" : vendor.deliveryDays === 2 ? "1500" : "900",
    discount: vendor.name === "BuildMart Suppliers" ? "1" : "0",
    deliveryDays: String(vendor.deliveryDays),
    paymentTerms: vendor.paymentTerms,
    rating: String(vendor.rating),
    validity: "2026-05-20",
    remarks:
      vendor.deliveryDays === 1
        ? "Dedicated vehicle available for urgent dispatch."
        : "Quotation submitted from vendor portal.",
  };
};

const quotationFromVendorDraft = (
  request: MaterialRequest,
  draft: VendorQuotationDraft,
  existingCount: number,
): Quotation => {
  const rfq = request.rfq ?? createRFQForRequest(request);
  const quantity = rfq.quantity || rfqQuantityForRequest(request);
  const unitRate = parseQuantity(draft.unitRate);
  const base = quantity * unitRate;
  const tax = base * (parseQuantity(draft.taxPercent) / 100);
  const freight = parseQuantity(draft.freight);
  const discount = draft.discount.includes("%") ? base * (parseQuantity(draft.discount) / 100) : parseQuantity(draft.discount);

  return {
    quotationId: `QT-${rfq.rfqId.split("-").pop()}-${existingCount + 1}`,
    rfqId: rfq.rfqId,
    vendorName: draft.vendorName,
    quantity,
    unitRate,
    tax,
    freight,
    discount,
    totalAmount: base + tax + freight - discount,
    deliveryDays: Math.max(1, Math.round(parseQuantity(draft.deliveryDays) || 1)),
    paymentTerms: draft.paymentTerms.trim() || "30 days",
    rating: Math.min(5, Math.max(1, parseQuantity(draft.rating) || 4)),
    validity: draft.validity || "2026-05-20",
    remarks: draft.remarks.trim() || "Quotation submitted by vendor.",
    score: 0,
    submittedBy: "Vendor",
    submittedAt: TODAY,
  };
};

const createRFQForRequest = (request: MaterialRequest): RFQ => ({
  rfqId: `RFQ-${request.requestId.replace("MR-", "")}`,
  requestId: request.requestId,
  project: request.projectName,
  material: request.materialName,
  quantity: rfqQuantityForRequest(request),
  unit: rfqUnitForRequest(request),
  lineItems: getRequestItems(request),
  vendorsInvited: VENDOR_QUOTES.map((vendor) => vendor.name),
  rfqDate: TODAY,
  submissionDeadline: "2026-05-04",
  status: "Created",
});

const createPOForRequest = (request: MaterialRequest, quotation: Quotation): PurchaseOrder => ({
  poId: `PO-${request.requestId.replace("MR-", "")}`,
  vendor: quotation.vendorName,
  project: request.projectName,
  material: request.materialName,
  quantity: quotation.quantity,
  rate: quotation.unitRate,
  tax: quotation.tax,
  totalAmount: quotation.totalAmount,
  lineItems: getRequestItems(request),
  deliveryLocation: `${PROJECT.siteLocation} site store`,
  deliveryDate: "2026-05-05",
  paymentTerms: quotation.paymentTerms,
  termsAndConditions: "Material must match approved BOQ specification. Damaged quantity requires credit note before payment.",
  createdBy: PROJECT.procurementManager,
  approvedBy: PROJECT.admin,
  status: "Draft",
});

const createDeliveryForRequest = (request: MaterialRequest): GRN => {
  const orderedQuantity = request.po?.quantity ?? rfqQuantityForRequest(request);
  const damagedQuantity = getRequestItems(request).some((item) => item.materialName === "Cement") ? 5 : 0;
  const acceptedQuantity = Math.max(0, orderedQuantity - damagedQuantity);

  return {
    grnId: `GRN-${request.requestId.replace("MR-", "")}`,
    poId: request.po?.poId ?? `PO-${request.requestId.replace("MR-", "")}`,
    vendor: request.po?.vendor ?? request.selectedVendor ?? "FastBuild Materials",
    material: request.materialName,
    orderedQuantity,
    receivedQuantity: orderedQuantity,
    damagedQuantity,
    acceptedQuantity,
    lineItems: getRequestItems(request),
    receivedDate: "2026-05-05",
    receivedBy: "Mahesh Yadav",
    siteVerificationStatus: "Pending",
    projectManagerRemarks: damagedQuantity > 0 ? "5 bags damaged, accepted only 375 bags." : "",
  };
};

const createInvoiceForRequest = (request: MaterialRequest): InvoiceMatch => {
  const orderedQuantity = request.grn?.orderedQuantity ?? request.shortageQuantity;
  const acceptedQuantity = request.grn?.acceptedQuantity ?? orderedQuantity;
  const rate = request.po?.rate ?? 340;
  const invoiceAmount = orderedQuantity * rate * 1.18;
  const onHold = orderedQuantity !== acceptedQuantity;

  return {
    invoiceId: `INV-${request.requestId.replace("MR-", "")}`,
    poId: request.po?.poId ?? `PO-${request.requestId.replace("MR-", "")}`,
    vendor: request.po?.vendor ?? request.selectedVendor ?? "FastBuild Materials",
    invoiceQuantity: orderedQuantity,
    invoiceAmount,
    acceptedQuantity,
    status: onHold ? "Invoice On Hold" : "Invoice Matched",
    creditNoteRequested: false,
    resolutionNotes: onHold
      ? `Invoice is for ${orderedQuantity} ${rfqUnitForRequest(request)}, but accepted quantity is ${acceptedQuantity} ${rfqUnitForRequest(request)}.`
      : "PO, GRN, and invoice quantities match.",
  };
};

const generateAutoSuggestedRequests = (): MaterialRequest[] => {
  let counter = 1;

  return UPCOMING_ACTIVITIES.flatMap((activity) =>
    activity.materials
      .map((material) => {
        const availableStock = CURRENT_STOCK[material.name] ?? 0;
        const shortageQuantity = material.quantity - availableStock;

        if (shortageQuantity <= 0) {
          return null;
        }

        const requestId = `MR-${String(counter).padStart(4, "0")}`;
        counter += 1;
        const lineItem: MaterialLineItem = {
          itemId: `${requestId}-1`,
          materialName: material.name,
          category: material.category,
          specification: material.specification,
          requiredQuantity: material.quantity,
          unit: material.unit,
          availableStock,
          shortageQuantity,
          requiredDate: daysBefore(activity.date, 2),
          priority: material.priority,
          boqReference: material.boqReference,
          drawingReference: material.drawingReference,
          activityReference: activity.name,
        };

        return {
          requestId,
          projectId: PROJECT.id,
          projectName: PROJECT.name,
          projectCode: PROJECT.code,
          requestedBy: PROJECT.projectManager,
          requestedByRole: "Project Manager" as Role,
          departmentSite: "Structure Work / Ahmedabad Site",
          site: PROJECT.siteLocation,
          materialName: material.name,
          category: material.category,
          specification: material.specification,
          requiredQuantity: material.quantity,
          unit: material.unit,
          availableStock,
          shortageQuantity,
          lineItems: [lineItem],
          requiredDate: daysBefore(activity.date, 2),
          priority: material.priority,
          boqReference: material.boqReference,
          drawingReference: material.drawingReference,
          activityReference: activity.name,
          reason: `Shortage for ${activity.name} scheduled on ${activity.date}.`,
          generatedFrom: activity.name,
          attachments: [
            { name: `${material.boqReference}.pdf`, size: "1.2 MB", type: "BOQ" },
            { name: `${material.drawingReference}.pdf`, size: "2.4 MB", type: "Drawing" },
          ],
          remarks:
            requestId === "MR-0001"
              ? "Auto-generated for Level 5 slab casting. Please keep delivery before site batching starts."
              : "",
          adminNotes: "",
          procurementNotes: "",
          assignedTo: PROJECT.admin,
          status: "Auto Suggested" as MaterialRequestStatus,
          timeline: makeTimeline(
            "Auto Suggested by System",
            "System",
            `Required ${quantityLabel(material.quantity, material.unit)} minus stock ${quantityLabel(availableStock, material.unit)} = shortage ${quantityLabel(shortageQuantity, material.unit)}.`,
          ),
          approvalHistory: [
            {
              role: "System",
              name: "Auto Suggestion Engine",
              action: "Generated from schedule, BOQ, and site stock",
              date: TODAY,
              notes: `Upcoming activity: ${activity.name}`,
            },
          ],
          quotations: [],
        } satisfies MaterialRequest;
      })
      .filter(Boolean) as MaterialRequest[],
  );
};

const createSeedRequest = (
  base: MaterialRequest,
  status: MaterialRequestStatus,
  requestId: string,
): MaterialRequest => {
  let request: MaterialRequest = {
    ...base,
    requestId,
    remarks: "Seeded demo record for downstream procurement flow testing.",
    procurementNotes: "Procurement team monitoring expedited delivery.",
    timeline: [
      ...base.timeline,
      { label: "Reviewed by Project Manager", by: PROJECT.projectManager, date: "2026-05-02" },
      { label: "Submitted by Project Manager", by: PROJECT.projectManager, date: "2026-05-02" },
      { label: "Under Admin Review", by: PROJECT.admin, date: "2026-05-02" },
      { label: "Approved by Admin", by: PROJECT.admin, date: "2026-05-02" },
      { label: "Sent to Procurement", by: PROJECT.admin, date: "2026-05-02" },
    ],
    approvalHistory: [
      ...base.approvalHistory,
      {
        role: "Project Manager",
        name: PROJECT.projectManager,
        action: "Submitted request",
        date: "2026-05-02",
      },
      {
        role: "Admin",
        name: PROJECT.admin,
        action: "Approved and forwarded",
        date: "2026-05-02",
        notes: "BOQ and stock references verified.",
      },
    ],
    assignedTo: PROJECT.procurementManager,
    status,
  };

  if (
    [
      "RFQ Created",
      "RFQ Sent",
      "Quotation Received",
      "Vendor Selected",
      "PO Draft",
      "PO Issued",
      "Delivered",
      "Site Verified",
      "Invoice On Hold",
      "Invoice Matched",
      "Closed",
    ].includes(status)
  ) {
    request = {
      ...request,
      rfq: createRFQForRequest(request),
      timeline: [...request.timeline, { label: "RFQ Created", by: PROJECT.procurementManager, date: "2026-05-02" }],
    };
  }

  if (
    [
      "RFQ Sent",
      "Quotation Received",
      "Vendor Selected",
      "PO Draft",
      "PO Issued",
      "Delivered",
      "Site Verified",
      "Invoice On Hold",
      "Invoice Matched",
      "Closed",
    ].includes(status)
  ) {
    request = {
      ...request,
      rfq: request.rfq ? { ...request.rfq, status: "Sent" } : undefined,
      timeline: [...request.timeline, { label: "RFQ Sent", by: PROJECT.procurementManager, date: "2026-05-02" }],
    };
  }

  if (
    [
      "Quotation Received",
      "Vendor Selected",
      "PO Draft",
      "PO Issued",
      "Delivered",
      "Site Verified",
      "Invoice On Hold",
      "Invoice Matched",
      "Closed",
    ].includes(status)
  ) {
    const rfqId = request.rfq?.rfqId ?? `RFQ-${request.requestId.replace("MR-", "")}`;
    const rfqQuantity = request.rfq?.quantity ?? rfqQuantityForRequest(request);
    const rfqUnit = request.rfq?.unit ?? rfqUnitForRequest(request);
    request = {
      ...request,
      quotations: calculateQuotations(rfqId, rfqQuantity, rfqUnit),
      timeline: [...request.timeline, { label: "Quotations Received", by: PROJECT.procurementManager, date: "2026-05-03" }],
    };
  }

  if (["Vendor Selected", "PO Draft", "PO Issued", "Delivered", "Site Verified", "Invoice On Hold", "Invoice Matched", "Closed"].includes(status)) {
    request = {
      ...request,
      selectedVendor: "FastBuild Materials",
      timeline: [...request.timeline, { label: "Vendor Selected", by: PROJECT.procurementManager, date: "2026-05-03", note: "Highest score due to fastest delivery and best rating." }],
    };
  }

  if (["PO Draft", "PO Issued", "Delivered", "Site Verified", "Invoice On Hold", "Invoice Matched", "Closed"].includes(status)) {
    const selectedQuotation = request.quotations.find((quote) => quote.vendorName === "FastBuild Materials") ?? request.quotations[0];
    request = {
      ...request,
      po: selectedQuotation ? createPOForRequest(request, selectedQuotation) : undefined,
      timeline: [...request.timeline, { label: "PO Draft", by: PROJECT.procurementManager, date: "2026-05-03" }],
    };
  }

  if (["PO Issued", "Delivered", "Site Verified", "Invoice On Hold", "Invoice Matched", "Closed"].includes(status)) {
    request = {
      ...request,
      po: request.po ? { ...request.po, status: "Issued" } : request.po,
      timeline: [...request.timeline, { label: "PO Issued", by: PROJECT.admin, date: "2026-05-03" }],
    };
  }

  if (["Delivered", "Site Verified", "Invoice On Hold", "Invoice Matched", "Closed"].includes(status)) {
    request = {
      ...request,
      grn: createDeliveryForRequest(request),
      timeline: [...request.timeline, { label: "Material Delivered", by: "Mahesh Yadav", date: "2026-05-05" }],
    };
  }

  if (["Site Verified", "Invoice On Hold", "Invoice Matched", "Closed"].includes(status)) {
    request = {
      ...request,
      grn: request.grn ? { ...request.grn, siteVerificationStatus: "Shortage/Damage Reported" } : request.grn,
      timeline: [...request.timeline, { label: "Site Verified", by: PROJECT.projectManager, date: "2026-05-05", note: "5 bags damaged, accepted only 375 bags." }],
    };
  }

  if (["Invoice On Hold", "Invoice Matched", "Closed"].includes(status)) {
    request = {
      ...request,
      invoice: createInvoiceForRequest(request),
      timeline: [...request.timeline, { label: "Invoice On Hold", by: PROJECT.procurementManager, date: "2026-05-06", note: "Invoice quantity exceeds accepted GRN quantity." }],
    };
  }

  if (["Invoice Matched", "Closed"].includes(status)) {
    request = {
      ...request,
      invoice: request.invoice
        ? {
            ...request.invoice,
            status: "Invoice Matched",
            creditNoteRequested: true,
            resolutionNotes: "Credit note for 5 damaged bags received and invoice adjusted.",
          }
        : request.invoice,
      timeline: [
        ...request.timeline,
        { label: "Credit Note Requested", by: PROJECT.procurementManager, date: "2026-05-06" },
        { label: "Invoice Matched", by: PROJECT.procurementManager, date: "2026-05-07" },
      ],
    };
  }

  if (status === "Closed") {
    request = {
      ...request,
      po: request.po ? { ...request.po, status: "Closed" } : request.po,
      timeline: [...request.timeline, { label: "Closed", by: PROJECT.procurementManager, date: "2026-05-07" }],
    };
  }

  return { ...request, status };
};

const buildInitialRequests = () => {
  const autoSuggestions = generateAutoSuggestedRequests();
  const cement = autoSuggestions[0];
  const steel = autoSuggestions[1];
  const sand = autoSuggestions[2];

  return [
    ...autoSuggestions,
    createSeedRequest({ ...cement, priority: "Urgent" }, "Under Admin Review", "MR-0008"),
    createSeedRequest({ ...steel, materialName: "TMT Steel", unit: "tons", shortageQuantity: 8, requiredQuantity: 12, availableStock: 4 }, "Sent to Procurement", "MR-0009"),
    createSeedRequest({ ...sand, materialName: "Sand", unit: "brass", shortageQuantity: 30, requiredQuantity: 40, availableStock: 10 }, "Quotation Received", "MR-0010"),
    createSeedRequest({ ...cement, priority: "Urgent" }, "Invoice On Hold", "MR-0011"),
    createSeedRequest({ ...cement, priority: "High" }, "Closed", "MR-0012"),
  ].map(normalizeRequest);
};

const loadStoredRequests = () => {
  if (typeof window === "undefined") return buildInitialRequests();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialRequests();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return buildInitialRequests();
    return (parsed as MaterialRequest[]).map(normalizeRequest);
  } catch {
    return buildInitialRequests();
  }
};

const saveStoredRequests = (requests: MaterialRequest[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

const clearStoredRequests = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
};

const nextRequestId = (requests: MaterialRequest[]) => {
  const next =
    Math.max(
      0,
      ...requests.map((request) => Number.parseInt(request.requestId.replace(/\D/g, ""), 10)).filter(Number.isFinite),
    ) + 1;
  return `MR-${String(next).padStart(4, "0")}`;
};

const defaultRequestLineDrafts = (): RequestLineDraft[] => [
  {
    itemId: "draft-1",
    materialName: "Cement",
    category: "Binding Material",
    specification: "OPC 53 grade, 50 kg bag",
    requiredQuantity: "500",
    unit: "bags",
    availableStock: "120",
    requiredDate: "2026-05-08",
    priority: "High",
    boqReference: "BOQ-STR-L5-001",
    drawingReference: "STR-SLAB-L5-A102",
    activityReference: "Slab Casting - Level 5",
  },
  {
    itemId: "draft-2",
    materialName: "TMT Steel",
    category: "Reinforcement",
    specification: "Fe 500D TMT bars, mixed dia",
    requiredQuantity: "12",
    unit: "tons",
    availableStock: "4",
    requiredDate: "2026-05-08",
    priority: "Urgent",
    boqReference: "BOQ-STR-L5-002",
    drawingReference: "STR-REBAR-L5-R210",
    activityReference: "Slab Casting - Level 5",
  },
];

const emptyLineDraft = (index: number): RequestLineDraft => ({
  itemId: `draft-${Date.now()}-${index}`,
  materialName: "",
  category: "",
  specification: "",
  requiredQuantity: "",
  unit: "",
  availableStock: "0",
  requiredDate: "2026-05-08",
  priority: "Medium",
  boqReference: "",
  drawingReference: "",
  activityReference: "",
});

const emptyRequestDraft = (): RequestDraft => ({
  items: defaultRequestLineDrafts(),
  reason: "Material required for upcoming site activity.",
  remarks: "",
  departmentSite: "Structure Work / Ahmedabad Site",
  attachmentName: "BOQ-STR-L5-001.pdf",
});

const lineDraftFromItem = (item: MaterialLineItem): RequestLineDraft => ({
  itemId: item.itemId,
  materialName: item.materialName,
  category: item.category,
  specification: item.specification,
  requiredQuantity: String(item.requiredQuantity),
  unit: item.unit,
  availableStock: String(item.availableStock),
  requiredDate: item.requiredDate,
  priority: item.priority,
  boqReference: item.boqReference,
  drawingReference: item.drawingReference,
  activityReference: item.activityReference,
});

const lineItemFromDraft = (line: RequestLineDraft, requestId: string, index: number): MaterialLineItem => {
  const requiredQuantity = parseQuantity(line.requiredQuantity);
  const availableStock = parseQuantity(line.availableStock);

  return {
    itemId: `${requestId}-${index + 1}`,
    materialName: line.materialName.trim() || `Material ${index + 1}`,
    category: line.category.trim() || "General Material",
    specification: line.specification.trim() || "As per BOQ",
    requiredQuantity,
    unit: line.unit.trim() || "unit",
    availableStock,
    shortageQuantity: Math.max(0, requiredQuantity - availableStock),
    requiredDate: line.requiredDate || TODAY,
    priority: line.priority,
    boqReference: line.boqReference.trim() || "Manual BOQ Reference",
    drawingReference: line.drawingReference.trim() || "Manual Drawing Reference",
    activityReference: line.activityReference.trim() || "Manual Request",
  };
};

const lineItemsFromDraft = (draft: RequestDraft, requestId: string): MaterialLineItem[] => {
  const draftItems = draft.items.length ? draft.items : defaultRequestLineDrafts();
  return draftItems
    .filter((line) => line.materialName.trim() || line.requiredQuantity.trim())
    .map((line, index) => lineItemFromDraft(line, requestId, index));
};

const draftFromRequest = (request: MaterialRequest): RequestDraft => ({
  items: getRequestItems(request).map(lineDraftFromItem),
  reason: request.reason,
  remarks: request.remarks,
  departmentSite: request.departmentSite,
  attachmentName: request.attachments[0]?.name ?? "",
});

const requestFromDraft = (draft: RequestDraft, requestId: string): MaterialRequest => {
  const lineItems = lineItemsFromDraft(draft, requestId);
  const first = lineItems[0] ?? lineItemFromDraft(defaultRequestLineDrafts()[0], requestId, 0);
  const shortageQuantity = rfqQuantityForRequest({
    requestId,
    projectId: PROJECT.id,
    projectName: PROJECT.name,
    projectCode: PROJECT.code,
    requestedBy: PROJECT.projectManager,
    requestedByRole: "Project Manager",
    departmentSite: draft.departmentSite,
    site: PROJECT.siteLocation,
    materialName: summarizeMaterialItems(lineItems),
    category: summarizeCategoryItems(lineItems),
    specification: first.specification,
    requiredQuantity: first.requiredQuantity,
    unit: first.unit,
    availableStock: first.availableStock,
    shortageQuantity: first.shortageQuantity,
    lineItems,
    requiredDate: first.requiredDate,
    priority: highestPriority(lineItems),
    boqReference: first.boqReference,
    drawingReference: first.drawingReference,
    activityReference: first.activityReference,
    reason: draft.reason,
    generatedFrom: "Manual Request",
    attachments: [],
    remarks: draft.remarks,
    adminNotes: "",
    procurementNotes: "",
    assignedTo: PROJECT.projectManager,
    status: "Draft",
    timeline: [],
    approvalHistory: [],
    quotations: [],
  });

  return {
    requestId,
    projectId: PROJECT.id,
    projectName: PROJECT.name,
    projectCode: PROJECT.code,
    requestedBy: PROJECT.projectManager,
    requestedByRole: "Project Manager",
    departmentSite: draft.departmentSite,
    site: PROJECT.siteLocation,
    materialName: summarizeMaterialItems(lineItems),
    category: summarizeCategoryItems(lineItems),
    specification: first.specification,
    requiredQuantity: first.requiredQuantity,
    unit: first.unit,
    availableStock: first.availableStock,
    shortageQuantity: first.shortageQuantity,
    lineItems,
    requiredDate: first.requiredDate,
    priority: highestPriority(lineItems),
    boqReference: first.boqReference,
    drawingReference: first.drawingReference,
    activityReference: first.activityReference,
    reason: draft.reason.trim() || "Manual material request raised by Project Manager.",
    generatedFrom: "Manual Request",
    attachments: draft.attachmentName.trim()
      ? [{ name: draft.attachmentName.trim(), size: "Manual upload", type: "Document" }]
      : [],
    remarks: draft.remarks,
    adminNotes: "",
    procurementNotes: "",
    assignedTo: PROJECT.projectManager,
    status: "Draft",
    timeline: makeTimeline("Draft Created by Project Manager", PROJECT.projectManager, "Manual material request created."),
    approvalHistory: [
      {
        role: "Project Manager",
        name: PROJECT.projectManager,
        action: "Created draft request",
        date: TODAY,
        notes: shortageQuantity > 0 ? `Shortage calculated for ${lineItems.length} line item(s).` : "No shortage calculated.",
      },
    ],
    quotations: [],
  };
};

const statusClass = (status: MaterialRequestStatus) => {
  if (status === "Closed" || status === "Invoice Matched" || status === "Site Verified" || status === "Delivered") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "Rejected" || status === "Invoice On Hold" || status === "Clarification Required") {
    return "border-red-200 bg-red-50 text-red-700";
  }
  if (status === "Auto Suggested" || status === "Draft" || status === "Under Admin Review" || status === "Submitted by Project Manager") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (status === "PO Draft" || status === "PO Issued" || status === "Vendor Selected") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }
  return "border-blue-200 bg-blue-50 text-blue-700";
};

const priorityClass = (priority: Priority) => {
  if (priority === "Urgent") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "High") return "border-orange-200 bg-orange-50 text-orange-700";
  if (priority === "Medium") return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-gray-200 bg-gray-50 text-gray-700";
};

const Section = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof FileText;
  children: React.ReactNode;
}) => (
  <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
    <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-700">
      <Icon className="h-4 w-4 text-gray-400" />
      {title}
    </h3>
    {children}
  </section>
);

const Field = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
    <div className="mt-1 text-sm font-semibold text-gray-900">{value}</div>
  </div>
);

export function MaterialProcurementTracker() {
  const [requests, setRequests] = useState<MaterialRequest[]>(loadStoredRequests);
  const [activeRole, setActiveRole] = useState<Role>("Project Manager");
  const [activeView, setActiveView] = useState<ActiveView>("Dashboard");
  const [selectedRequestId, setSelectedRequestId] = useState("MR-0001");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | MaterialRequestStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | Priority>("All");
  const [projectFilter, setProjectFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState<"All" | Role>("All");
  const [adminCanCreateRFQ, setAdminCanCreateRFQ] = useState(true);
  const [adminCanCreatePO, setAdminCanCreatePO] = useState(true);
  const [requestModalMode, setRequestModalMode] = useState<RequestModalMode>("create");
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestModalSubmitOnSave, setRequestModalSubmitOnSave] = useState(false);
  const [requestDraft, setRequestDraft] = useState<RequestDraft>(emptyRequestDraft);
  const [workflowAction, setWorkflowAction] = useState<{ type: WorkflowAction; requestId: string } | null>(null);
  const [trackRequestId, setTrackRequestId] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState("");
  const [selectedVendorDraft, setSelectedVendorDraft] = useState("FastBuild Materials");
  const [deliveryDraft, setDeliveryDraft] = useState<DeliveryDraft>({
    receivedQuantity: "380",
    damagedQuantity: "5",
    receivedBy: "Mahesh Yadav",
    receivedDate: "2026-05-05",
    remarks: "5 bags damaged, accepted only 375 bags.",
  });
  const [invoiceDraft, setInvoiceDraft] = useState<InvoiceDraft>({
    invoiceQuantity: "380",
    invoiceAmount: "",
    notes: "Invoice quantity is higher than accepted GRN quantity.",
  });
  const [vendorQuotationDraft, setVendorQuotationDraft] = useState<VendorQuotationDraft>(defaultVendorQuotationDraft());

  const selectedRequest = requests.find((request) => request.requestId === selectedRequestId) ?? requests[0];
  const trackedRequest = trackRequestId ? requests.find((request) => request.requestId === trackRequestId) : null;
  const projects = Array.from(new Set(requests.map((request) => request.projectName)));

  useEffect(() => {
    saveStoredRequests(requests);
  }, [requests]);

  useEffect(() => {
    if (requests.length && !requests.some((request) => request.requestId === selectedRequestId)) {
      setSelectedRequestId(requests[0].requestId);
    }
  }, [requests, selectedRequestId]);

  const updateRequest = (requestId: string, updater: (request: MaterialRequest) => MaterialRequest) => {
    setRequests((current) => current.map((request) => (request.requestId === requestId ? updater(request) : request)));
  };

  const appendActionNote = (requestId: string, by: string, note: string) => {
    if (!note.trim()) return;
    updateRequest(requestId, (request) => appendTimeline(request, "Note Updated", by, note.trim()));
  };

  const setRequestStatus = (request: MaterialRequest, status: MaterialRequestStatus, label: string, by: string, note?: string) => ({
    ...appendTimeline(request, label, by, note),
    status,
  });

  const openCreateRequestModal = () => {
    setRequestModalMode("create");
    setRequestModalSubmitOnSave(false);
    setRequestDraft(emptyRequestDraft());
    setIsRequestModalOpen(true);
  };

  const openEditRequestModal = (request: MaterialRequest) => {
    setRequestModalMode("edit");
    setRequestModalSubmitOnSave(false);
    setSelectedRequestId(request.requestId);
    setRequestDraft(draftFromRequest(request));
    setIsRequestModalOpen(true);
  };

  const openReviewSubmitModal = (request: MaterialRequest) => {
    setRequestModalMode("edit");
    setRequestModalSubmitOnSave(true);
    setSelectedRequestId(request.requestId);
    setRequestDraft(draftFromRequest(request));
    setIsRequestModalOpen(true);
  };

  const updateDraftLine = (itemId: string, field: keyof RequestLineDraft, value: string) => {
    setRequestDraft((draft) => ({
      ...draft,
      items: draft.items.map((item) => (item.itemId === itemId ? ({ ...item, [field]: value } as RequestLineDraft) : item)),
    }));
  };

  const addDraftLine = () => {
    setRequestDraft((draft) => ({
      ...draft,
      items: [...draft.items, emptyLineDraft(draft.items.length + 1)],
    }));
  };

  const removeDraftLine = (itemId: string) => {
    setRequestDraft((draft) => ({
      ...draft,
      items: draft.items.length <= 1 ? draft.items : draft.items.filter((item) => item.itemId !== itemId),
    }));
  };

  const saveRequestDraft = (submitAfterSave = false) => {
    const hasMaterial = requestDraft.items.some((item) => item.materialName.trim());
    if (!hasMaterial) return;

    if (requestModalMode === "create") {
      const requestId = nextRequestId(requests);
      let newRequest = requestFromDraft(requestDraft, requestId);
      if (submitAfterSave) {
        newRequest = {
          ...setRequestStatus(newRequest, "Submitted by Project Manager", "Submitted by Project Manager", PROJECT.projectManager, requestDraft.remarks || "Created and submitted by Project Manager."),
          assignedTo: PROJECT.admin,
          approvalHistory: [
            ...newRequest.approvalHistory,
            {
              role: "Project Manager",
              name: PROJECT.projectManager,
              action: "Submitted material request",
              date: TODAY,
              notes: requestDraft.remarks || "Created and submitted from request modal.",
            },
          ],
        };
      }
      setRequests((current) => [newRequest, ...current]);
      setSelectedRequestId(requestId);
      setActiveView("Requests");
    } else {
      updateRequest(selectedRequest.requestId, (request) => {
        const lineItems = lineItemsFromDraft(requestDraft, request.requestId);
        const first = lineItems[0] ?? getRequestItems(request)[0];
        const totalShortage = rfqQuantityForRequest({ ...request, lineItems });
        const editedRequest = appendTimeline(
          {
            ...request,
            materialName: summarizeMaterialItems(lineItems),
            category: summarizeCategoryItems(lineItems),
            specification: first?.specification ?? request.specification,
            requiredQuantity: first?.requiredQuantity ?? request.requiredQuantity,
            unit: first?.unit ?? request.unit,
            availableStock: first?.availableStock ?? request.availableStock,
            shortageQuantity: first?.shortageQuantity ?? request.shortageQuantity,
            lineItems,
            requiredDate: first?.requiredDate ?? request.requiredDate,
            priority: highestPriority(lineItems),
            boqReference: first?.boqReference ?? request.boqReference,
            drawingReference: first?.drawingReference ?? request.drawingReference,
            activityReference: first?.activityReference ?? request.activityReference,
            reason: requestDraft.reason.trim() || request.reason,
            remarks: requestDraft.remarks,
            departmentSite: requestDraft.departmentSite,
            attachments: requestDraft.attachmentName.trim()
              ? [{ name: requestDraft.attachmentName.trim(), size: "Manual upload", type: "Document" }]
              : request.attachments,
          },
          "Request Edited",
          ROLE_NAMES[activeRole],
          `${lineItems.length} material line item(s) updated. Total shortage: ${totalShortage}.`,
        );

        if (!submitAfterSave) return editedRequest;

        return {
          ...setRequestStatus(editedRequest, "Submitted by Project Manager", "Submitted by Project Manager", PROJECT.projectManager, requestDraft.remarks || "Reviewed and submitted by Project Manager."),
          assignedTo: PROJECT.admin,
          approvalHistory: [
            ...editedRequest.approvalHistory,
            {
              role: "Project Manager",
              name: PROJECT.projectManager,
              action: "Submitted material request",
              date: TODAY,
              notes: requestDraft.remarks || "Reviewed and submitted from request modal.",
            },
          ],
        };
      });
      setActiveView("Requests");
    }

    setRequestModalSubmitOnSave(false);
    setIsRequestModalOpen(false);
  };

  const deleteRequest = (requestId: string) => {
    if (requests.length <= 1) return;
    setRequests((current) => current.filter((request) => request.requestId !== requestId));
    setActiveView("Requests");
    setWorkflowAction(null);
  };

  const updateQuantity = (requestId: string, quantity: number) => {
    updateRequest(requestId, (request) => {
      const lineItems = getRequestItems(request).map((item, index) =>
        index === 0
          ? { ...item, requiredQuantity: quantity, shortageQuantity: Math.max(0, quantity - item.availableStock) }
          : item,
      );
      const first = lineItems[0];
      return {
        ...appendTimeline(request, "Reviewed by Project Manager", ROLE_NAMES[activeRole], "First line quantity adjusted before submission."),
        lineItems,
        requiredQuantity: first.requiredQuantity,
        availableStock: first.availableStock,
        shortageQuantity: first.shortageQuantity,
        priority: highestPriority(lineItems),
      };
    });
  };

  const updatePriority = (requestId: string, priority: Priority) => {
    updateRequest(requestId, (request) => {
      const lineItems = getRequestItems(request).map((item, index) => (index === 0 ? { ...item, priority } : item));
      return {
        ...appendTimeline(request, "Reviewed by Project Manager", ROLE_NAMES[activeRole], `First line priority set to ${priority}.`),
        lineItems,
        priority: highestPriority(lineItems),
      };
    });
  };

  const updateRemarks = (requestId: string, remarks: string) => {
    updateRequest(requestId, (request) => ({ ...request, remarks }));
  };

  const updateAdminNotes = (requestId: string, adminNotes: string) => {
    updateRequest(requestId, (request) => ({ ...request, adminNotes }));
  };

  const updateProcurementNotes = (requestId: string, procurementNotes: string) => {
    updateRequest(requestId, (request) => ({ ...request, procurementNotes }));
  };

  const submitRequest = (requestId: string) => {
    updateRequest(requestId, (request) => ({
      ...setRequestStatus(request, "Submitted by Project Manager", "Submitted by Project Manager", PROJECT.projectManager),
      assignedTo: PROJECT.admin,
      approvalHistory: [
        ...request.approvalHistory,
        {
          role: "Project Manager",
          name: PROJECT.projectManager,
          action: "Submitted material request",
          date: TODAY,
          notes: request.remarks || "Submitted from auto suggestion.",
        },
      ],
    }));
    setActiveView("Requests");
  };

  const adminAction = (requestId: string, action: "review" | "approve" | "reject" | "clarify" | "stock" | "forward") => {
    const statusByAction: Record<typeof action, MaterialRequestStatus> = {
      review: "Under Admin Review",
      approve: "Under Admin Review",
      reject: "Rejected",
      clarify: "Clarification Required",
      stock: "Stock Available",
      forward: "Sent to Procurement",
    };
    const labelByAction: Record<typeof action, string> = {
      review: "Under Admin Review",
      approve: "Approved by Admin",
      reject: "Rejected",
      clarify: "Clarification Required",
      stock: "Stock Available",
      forward: "Sent to Procurement",
    };
    const noteByAction: Record<typeof action, string> = {
      review: "Admin started BOQ and stock verification.",
      approve: "BOQ reference and shortage quantity approved.",
      reject: "Request rejected by admin.",
      clarify: "Admin asked the Project Manager for clarification.",
      stock: "Available stock can be issued from site store.",
      forward: "Assigned to Procurement Manager Amit Patel.",
    };

    updateRequest(requestId, (request) => ({
      ...setRequestStatus(request, statusByAction[action], labelByAction[action], PROJECT.admin, noteByAction[action]),
      assignedTo: action === "forward" ? PROJECT.procurementManager : request.assignedTo,
      approvalHistory: [
        ...request.approvalHistory,
        {
          role: "Admin",
          name: PROJECT.admin,
          action: labelByAction[action],
          date: TODAY,
          notes: noteByAction[action],
        },
      ],
    }));
  };

  const createRFQ = (requestId: string, by: Role = "Procurement Manager") => {
    updateRequest(requestId, (request) => {
      const rfq = createRFQForRequest(request);
      return {
        ...setRequestStatus(request, "RFQ Created", "RFQ Created", ROLE_NAMES[by]),
        rfq,
        assignedTo: PROJECT.procurementManager,
      };
    });
  };

  const sendRFQ = (requestId: string) => {
    updateRequest(requestId, (request) => {
      const rfq = request.rfq ?? createRFQForRequest(request);
      return {
        ...setRequestStatus(request, "RFQ Sent", "RFQ Sent", ROLE_NAMES[activeRole], `Sent to ${VENDOR_QUOTES.length} vendors.`),
        rfq: { ...rfq, status: "Sent" },
      };
    });
  };

  const receiveQuotations = (requestId: string) => {
    updateRequest(requestId, (request) => {
      const rfq = request.rfq ?? createRFQForRequest(request);
      const quotations = calculateQuotations(rfq.rfqId, rfq.quantity, rfq.unit);
      return {
        ...setRequestStatus(request, "Quotation Received", "Quotations Received", ROLE_NAMES[activeRole], "System compared price, delivery speed, and rating."),
        rfq: { ...rfq, status: "Sent" },
        quotations,
      };
    });
  };

  const submitVendorQuotation = (requestId: string) => {
    updateRequest(requestId, (request) => {
      const rfq = request.rfq ?? createRFQForRequest(request);
      const newQuotation = quotationFromVendorDraft({ ...request, rfq }, vendorQuotationDraft, request.quotations.length);
      const withoutSameVendor = request.quotations.filter((quote) => quote.vendorName !== newQuotation.vendorName);
      const quotations = scoreQuotations([...withoutSameVendor, newQuotation]);

      const updatedRequest = setRequestStatus(
          request,
          "Quotation Received",
          "Quotation Submitted by Vendor",
          vendorQuotationDraft.vendorName,
          `${vendorQuotationDraft.vendorName} quoted ${currency(newQuotation.unitRate)} with ${newQuotation.deliveryDays} day delivery.`,
        );

      return {
        ...appendTimeline(updatedRequest, "Quotations Received", "System", "Vendor quotation is now available for procurement comparison."),
        rfq: { ...rfq, status: "Sent" },
        quotations,
      };
    });
  };

  const selectVendor = (requestId: string, vendorName?: string) => {
    updateRequest(requestId, (request) => {
      const quotations = request.quotations.length
        ? request.quotations
        : calculateQuotations(request.rfq?.rfqId ?? `RFQ-${request.requestId.replace("MR-", "")}`, rfqQuantityForRequest(request), rfqUnitForRequest(request));
      const recommended = quotations.find((quote) => quote.vendorName === vendorName) ?? quotations[0];
      return {
        ...setRequestStatus(
          request,
          "Vendor Selected",
          "Vendor Selected",
          ROLE_NAMES[activeRole],
          `${recommended.vendorName} selected with score ${recommended.score}.`,
        ),
        quotations,
        selectedVendor: recommended.vendorName,
      };
    });
  };

  const createPO = (requestId: string) => {
    updateRequest(requestId, (request) => {
      const quotation =
        request.quotations.find((quote) => quote.vendorName === request.selectedVendor) ?? request.quotations[0];
      if (!quotation) return request;

      return {
        ...setRequestStatus(request, "PO Draft", "PO Draft", ROLE_NAMES[activeRole]),
        po: createPOForRequest(request, quotation),
      };
    });
  };

  const issuePO = (requestId: string) => {
    updateRequest(requestId, (request) => ({
      ...setRequestStatus(request, "PO Issued", "PO Issued", ROLE_NAMES[activeRole]),
      po: request.po ? { ...request.po, status: "Issued" } : request.po,
    }));
  };

  const updateDelivery = (requestId: string, override?: DeliveryDraft) => {
    updateRequest(requestId, (request) => {
      const baseGrn = createDeliveryForRequest(request);
      const receivedQuantity = override ? Number.parseFloat(override.receivedQuantity) || baseGrn.receivedQuantity : baseGrn.receivedQuantity;
      const damagedQuantity = override ? Number.parseFloat(override.damagedQuantity) || 0 : baseGrn.damagedQuantity;
      const grn = {
        ...baseGrn,
        receivedQuantity,
        damagedQuantity,
        acceptedQuantity: Math.max(0, receivedQuantity - damagedQuantity),
        receivedBy: override?.receivedBy.trim() || baseGrn.receivedBy,
        receivedDate: override?.receivedDate || baseGrn.receivedDate,
        projectManagerRemarks: override?.remarks.trim() || baseGrn.projectManagerRemarks,
      };
      return {
        ...setRequestStatus(
          request,
          grn.acceptedQuantity < grn.orderedQuantity ? "Partially Delivered" : "Delivered",
          "Material Delivered",
          "Mahesh Yadav",
          `${quantityLabel(grn.receivedQuantity, rfqUnitForRequest(request))} received, ${quantityLabel(grn.damagedQuantity, rfqUnitForRequest(request))} damaged.`,
        ),
        grn,
        po: request.po ? { ...request.po, status: "Delivered" } : request.po,
      };
    });
  };

  const verifyDelivery = (requestId: string, remarks?: string) => {
    updateRequest(requestId, (request) => ({
      ...setRequestStatus(
        request,
        "Site Verified",
        "Site Verified",
        PROJECT.projectManager,
        remarks?.trim() || request.grn?.projectManagerRemarks || "Delivery verified at site.",
      ),
      grn: request.grn
        ? {
            ...request.grn,
            siteVerificationStatus: request.grn.damagedQuantity > 0 ? "Shortage/Damage Reported" : "Verified",
            projectManagerRemarks:
              remarks?.trim() ||
              request.grn.projectManagerRemarks ||
              `${quantityLabel(request.grn.acceptedQuantity, rfqUnitForRequest(request))} accepted at site.`,
          }
        : request.grn,
    }));
  };

  const matchInvoice = (requestId: string, override?: InvoiceDraft) => {
    updateRequest(requestId, (request) => {
      const baseInvoice = createInvoiceForRequest(request);
      const invoiceQuantity = override ? Number.parseFloat(override.invoiceQuantity) || baseInvoice.invoiceQuantity : baseInvoice.invoiceQuantity;
      const invoiceAmount = override ? Number.parseFloat(override.invoiceAmount) || baseInvoice.invoiceAmount : baseInvoice.invoiceAmount;
      const onHold = invoiceQuantity !== baseInvoice.acceptedQuantity;
      const invoice: InvoiceMatch = {
        ...baseInvoice,
        invoiceQuantity,
        invoiceAmount,
        status: onHold ? "Invoice On Hold" : "Invoice Matched",
        resolutionNotes:
          override?.notes.trim() ||
          (onHold
            ? `Invoice is for ${quantityLabel(invoiceQuantity, rfqUnitForRequest(request))}, but accepted quantity is ${quantityLabel(baseInvoice.acceptedQuantity, rfqUnitForRequest(request))}.`
            : "PO, GRN, and invoice quantities match."),
      };
      return {
        ...setRequestStatus(request, invoice.status, invoice.status, PROJECT.procurementManager, invoice.resolutionNotes),
        invoice,
      };
    });
  };

  const requestCreditNote = (requestId: string) => {
    updateRequest(requestId, (request) => ({
      ...appendTimeline(request, "Credit Note Requested", PROJECT.procurementManager, "Credit note requested for damaged quantity."),
      invoice: request.invoice
        ? {
            ...request.invoice,
            creditNoteRequested: true,
            resolutionNotes: "Credit note requested for damaged quantity. Invoice remains on hold until adjustment.",
          }
        : request.invoice,
    }));
  };

  const resolveInvoice = (requestId: string) => {
    updateRequest(requestId, (request) => ({
      ...setRequestStatus(request, "Invoice Matched", "Invoice Matched", PROJECT.procurementManager, "Credit note adjusted. Invoice now matches accepted GRN quantity."),
      invoice: request.invoice
        ? {
            ...request.invoice,
            status: "Invoice Matched",
            creditNoteRequested: true,
            resolutionNotes: "Credit note for 5 damaged bags received and invoice adjusted.",
          }
        : request.invoice,
    }));
  };

  const closeRequest = (requestId: string) => {
    updateRequest(requestId, (request) => ({
      ...setRequestStatus(request, "Closed", "Closed", PROJECT.procurementManager),
      po: request.po ? { ...request.po, status: "Closed" } : request.po,
    }));
  };

  const resetDemo = () => {
    const demoRequests = buildInitialRequests();
    clearStoredRequests();
    setRequests(demoRequests);
    setSelectedRequestId("MR-0001");
    setActiveRole("Project Manager");
    setActiveView("Dashboard");
    setWorkflowAction(null);
    setIsRequestModalOpen(false);
    setRequestModalSubmitOnSave(false);
    setVendorQuotationDraft(defaultVendorQuotationDraft());
    setTrackRequestId(null);
  };

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !query ||
        request.requestId.toLowerCase().includes(query) ||
        request.materialName.toLowerCase().includes(query) ||
        getRequestItems(request).some((item) => item.materialName.toLowerCase().includes(query)) ||
        request.projectName.toLowerCase().includes(query) ||
        request.selectedVendor?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || request.status === statusFilter;
      const matchesPriority = priorityFilter === "All" || request.priority === priorityFilter;
      const matchesProject = projectFilter === "All" || request.projectName === projectFilter;
      const matchesRole =
        roleFilter === "All" ||
        request.requestedByRole === roleFilter ||
        (roleFilter === "Admin" && request.assignedTo === PROJECT.admin) ||
        (roleFilter === "Procurement Manager" && request.assignedTo === PROJECT.procurementManager) ||
        (roleFilter === "Vendor" && request.rfq?.status === "Sent");

      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesRole;
    });
  }, [priorityFilter, projectFilter, requests, roleFilter, searchQuery, statusFilter]);

  const suggestions = requests.filter((request) => request.generatedFrom && request.requestId <= "MR-0007");
  const adminQueue = requests.filter((request) =>
    ["Submitted by Project Manager", "Under Admin Review", "Clarification Required"].includes(request.status),
  );
  const procurementQueue = requests.filter((request) =>
    [
      "Sent to Procurement",
      "RFQ Created",
      "RFQ Sent",
      "Quotation Received",
      "Vendor Selected",
      "PO Draft",
      "PO Issued",
      "Partially Delivered",
      "Delivered",
      "Site Verified",
      "Invoice On Hold",
      "Invoice Matched",
    ].includes(request.status),
  );
  const vendorQueue = requests.filter((request) =>
    request.rfq?.status === "Sent" && ["RFQ Sent", "Quotation Received"].includes(request.status),
  );

  const canActAsProcurement = activeRole === "Procurement Manager" || (activeRole === "Admin" && (adminCanCreateRFQ || adminCanCreatePO));
  const recommendedQuote = selectedRequest.quotations[0];
  const roleActionRequests = (
    activeRole === "Project Manager"
      ? requests.filter((request) => ["Auto Suggested", "Draft", "Clarification Required", "Delivered", "Partially Delivered"].includes(request.status))
      : activeRole === "Admin"
        ? adminQueue
        : activeRole === "Vendor"
          ? vendorQueue
          : procurementQueue.filter((request) => request.status !== "Closed")
  ).slice(0, 4);
  const homeMetrics = [
    {
      label: "Need site review",
      value: requests.filter((request) => request.status === "Auto Suggested").length,
      note: "Shortages found from upcoming work",
      icon: Package,
      tone: "border-amber-200 bg-amber-50 text-amber-800",
    },
    {
      label: "Waiting for admin",
      value: requests.filter((request) => ["Submitted by Project Manager", "Under Admin Review", "Clarification Required"].includes(request.status)).length,
      note: "BOQ and stock checks pending",
      icon: ShieldCheck,
      tone: "border-blue-200 bg-blue-50 text-blue-800",
    },
    {
      label: "Being purchased",
      value: procurementQueue.filter((request) => !["Invoice Matched", "Closed"].includes(request.status)).length,
      note: "RFQ, quotation, PO or delivery stage",
      icon: ShoppingCart,
      tone: "border-violet-200 bg-violet-50 text-violet-800",
    },
    {
      label: "Need invoice fix",
      value: requests.filter((request) => request.status === "Invoice On Hold").length,
      note: "Invoice and accepted quantity differ",
      icon: AlertTriangle,
      tone: "border-red-200 bg-red-50 text-red-800",
    },
  ];
  const roleGuides: {
    role: Role;
    title: string;
    description: string;
    action: string;
    view: ActiveView;
    icon: typeof Package;
  }[] = [
    {
      role: "Project Manager",
      title: "Site team checks material need",
      description: "Review the suggested shortage, adjust quantity or priority, then submit.",
      action: "Open Suggestions",
      view: "Auto Suggestions",
      icon: Package,
    },
    {
      role: "Admin",
      title: "Admin approves the request",
      description: "Check BOQ, check stock, ask questions, or send it to procurement.",
      action: "Open Admin Review",
      view: "Admin Review",
      icon: ShieldCheck,
    },
    {
      role: "Procurement Manager",
      title: "Procurement buys and closes",
      description: "Create RFQ, compare vendors, issue PO, track delivery, and match invoice.",
      action: "Open Workbench",
      view: "Workbench",
      icon: ShoppingCart,
    },
    {
      role: "Vendor",
      title: "Vendor submits quotation",
      description: "Open sent RFQs and enter rate, freight, delivery days, terms, and remarks.",
      action: "Open Vendor Portal",
      view: "Vendor Portal",
      icon: UserCheck,
    },
  ];
  const simpleFlow = [
    { label: "1. Site needs material", icon: Package },
    { label: "2. Admin approves", icon: ShieldCheck },
    { label: "3. Vendor quotes", icon: FileText },
    { label: "4. Site receives", icon: Truck },
    { label: "5. Invoice closes", icon: CheckCircle2 },
  ];

  const openRequest = (requestId: string, view: ActiveView = "Requests") => {
    setSelectedRequestId(requestId);
    setActiveView(view);
  };

  const openRequestInCurrentContext = (requestId: string) => {
    setSelectedRequestId(requestId);
    if (activeView === "Workbench" || activeView === "Admin Review" || activeView === "Requests" || activeView === "Vendor Portal") {
      setActiveView(activeView);
    } else {
      setActiveView("Requests");
    }
  };

  const openTrackRequestModal = (request: MaterialRequest) => {
    setSelectedRequestId(request.requestId);
    setTrackRequestId(request.requestId);
  };

  const runPrimaryAction = (request: MaterialRequest) => {
    if (activeRole === "Project Manager") {
      if (["Auto Suggested", "Draft", "Clarification Required"].includes(request.status)) openReviewSubmitModal(request);
      else if (["Delivered", "Partially Delivered"].includes(request.status)) openWorkflowAction("verify-delivery", request);
      else openTrackRequestModal(request);
      return;
    }

    if (activeRole === "Vendor") {
      if (request.rfq?.status === "Sent" && ["RFQ Sent", "Quotation Received"].includes(request.status)) openWorkflowAction("vendor-submit-quotation", request);
      else openTrackRequestModal(request);
      return;
    }

    if (activeRole === "Admin") {
      if (request.status === "Submitted by Project Manager") openWorkflowAction("admin-review", request);
      else if (request.status === "Under Admin Review" || request.status === "Clarification Required") openWorkflowAction("admin-forward", request);
      else if (adminCanCreateRFQ && request.status === "Sent to Procurement") openWorkflowAction("create-rfq", request);
      else if (adminCanCreatePO && request.status === "Vendor Selected") openWorkflowAction("create-po", request);
      else openTrackRequestModal(request);
      return;
    }

    if (request.status === "Sent to Procurement") openWorkflowAction("create-rfq", request);
    else if (request.status === "RFQ Created") openWorkflowAction("send-rfq", request);
    else if (request.status === "RFQ Sent") openTrackRequestModal(request);
    else if (request.status === "Quotation Received") openWorkflowAction("select-vendor", request);
    else if (request.status === "Vendor Selected") openWorkflowAction("create-po", request);
    else if (request.status === "PO Draft") openWorkflowAction("issue-po", request);
    else if (request.status === "PO Issued") openWorkflowAction("update-delivery", request);
    else if (request.status === "Delivered" || request.status === "Partially Delivered") openTrackRequestModal(request);
    else if (request.status === "Site Verified") openWorkflowAction("match-invoice", request);
    else if (request.status === "Invoice On Hold" && !request.invoice?.creditNoteRequested) openWorkflowAction("request-credit-note", request);
    else if (request.status === "Invoice On Hold") openWorkflowAction("resolve-invoice", request);
    else if (request.status === "Invoice Matched") openWorkflowAction("close", request);
    else openTrackRequestModal(request);
  };

  const primaryActionLabel = (request: MaterialRequest) => {
    if (activeRole === "Project Manager") {
      if (["Auto Suggested", "Draft", "Clarification Required"].includes(request.status)) return "Review & Submit";
      if (["Delivered", "Partially Delivered"].includes(request.status)) return "Verify Delivery";
      return "Track Request";
    }
    if (activeRole === "Admin") {
      if (request.status === "Submitted by Project Manager") return "Start Review";
      if (request.status === "Under Admin Review" || request.status === "Clarification Required") return "Send to Procurement";
      if (adminCanCreateRFQ && request.status === "Sent to Procurement") return "Create RFQ";
      if (adminCanCreatePO && request.status === "Vendor Selected") return "Create PO";
      return "Review";
    }
    if (activeRole === "Vendor") {
      if (request.rfq?.status === "Sent" && ["RFQ Sent", "Quotation Received"].includes(request.status)) return "Submit Quote";
      return "Open";
    }
    if (request.status === "Sent to Procurement") return "Create RFQ";
    if (request.status === "RFQ Created") return "Send RFQ";
    if (request.status === "RFQ Sent") return "Await Vendor Quotes";
    if (request.status === "Quotation Received") return "Select Vendor";
    if (request.status === "Vendor Selected") return "Create PO";
    if (request.status === "PO Draft") return "Issue PO";
    if (request.status === "PO Issued") return "Update Delivery";
    if (["Delivered", "Partially Delivered"].includes(request.status)) return "Await Site Verify";
    if (request.status === "Site Verified") return "Match Invoice";
    if (request.status === "Invoice On Hold" && !request.invoice?.creditNoteRequested) return "Request Credit Note";
    if (request.status === "Invoice On Hold") return "Mark Matched";
    if (request.status === "Invoice Matched") return "Close";
    return "Open";
  };

  const workflowTitle = (action: WorkflowAction) => {
    const titles: Record<WorkflowAction, string> = {
      submit: "Submit Material Request",
      delete: "Delete Material Request",
      "admin-review": "Start Admin Review",
      "admin-approve": "Approve Request",
      "admin-reject": "Reject Request",
      "admin-clarify": "Ask Clarification",
      "admin-stock": "Issue From Stock",
      "admin-forward": "Send to Procurement",
      "create-rfq": "Create RFQ",
      "send-rfq": "Send RFQ to Vendors",
      "receive-quotations": "Add Vendor Quotations",
      "vendor-submit-quotation": "Submit Vendor Quotation",
      "select-vendor": "Select Vendor",
      "create-po": "Create Purchase Order",
      "issue-po": "Issue Purchase Order",
      "update-delivery": "Update Delivery / GRN",
      "verify-delivery": "Verify Site Delivery",
      "match-invoice": "Match Invoice",
      "request-credit-note": "Request Credit Note",
      "resolve-invoice": "Mark Invoice Matched",
      close: "Close Request",
    };
    return titles[action];
  };

  const openWorkflowAction = (type: WorkflowAction, request: MaterialRequest) => {
    setSelectedRequestId(request.requestId);
    setActionNote("");
    setSelectedVendorDraft(request.selectedVendor ?? request.quotations[0]?.vendorName ?? "FastBuild Materials");
    if (type === "vendor-submit-quotation") {
      setVendorQuotationDraft(defaultVendorQuotationDraft(request.quotations[0]?.vendorName ?? "FastBuild Materials"));
    }
    const baseGrn = request.grn ?? createDeliveryForRequest(request);
    setDeliveryDraft({
      receivedQuantity: String(baseGrn.receivedQuantity),
      damagedQuantity: String(baseGrn.damagedQuantity),
      receivedBy: baseGrn.receivedBy,
      receivedDate: baseGrn.receivedDate,
      remarks: baseGrn.projectManagerRemarks || "Delivery checked at site.",
    });
    const baseInvoice = request.invoice ?? createInvoiceForRequest({ ...request, grn: request.grn ?? baseGrn });
    setInvoiceDraft({
      invoiceQuantity: String(baseInvoice.invoiceQuantity),
      invoiceAmount: String(Math.round(baseInvoice.invoiceAmount)),
      notes: baseInvoice.resolutionNotes ?? "Invoice checked against PO and GRN.",
    });
    setWorkflowAction({ type, requestId: request.requestId });
  };

  const confirmWorkflowAction = () => {
    if (!workflowAction) return;
    const request = requests.find((item) => item.requestId === workflowAction.requestId);
    if (!request) return;
    const noteBy = ROLE_NAMES[activeRole] ?? PROJECT.procurementManager;

    switch (workflowAction.type) {
      case "submit":
        submitRequest(request.requestId);
        break;
      case "delete":
        deleteRequest(request.requestId);
        return;
      case "admin-review":
        adminAction(request.requestId, "review");
        break;
      case "admin-approve":
        adminAction(request.requestId, "approve");
        break;
      case "admin-reject":
        adminAction(request.requestId, "reject");
        break;
      case "admin-clarify":
        adminAction(request.requestId, "clarify");
        break;
      case "admin-stock":
        adminAction(request.requestId, "stock");
        break;
      case "admin-forward":
        adminAction(request.requestId, "forward");
        break;
      case "create-rfq":
        createRFQ(request.requestId, activeRole);
        break;
      case "send-rfq":
        sendRFQ(request.requestId);
        break;
      case "receive-quotations":
        receiveQuotations(request.requestId);
        break;
      case "vendor-submit-quotation":
        submitVendorQuotation(request.requestId);
        break;
      case "select-vendor":
        selectVendor(request.requestId, selectedVendorDraft);
        break;
      case "create-po":
        createPO(request.requestId);
        break;
      case "issue-po":
        issuePO(request.requestId);
        break;
      case "update-delivery":
        updateDelivery(request.requestId, deliveryDraft);
        break;
      case "verify-delivery":
        verifyDelivery(request.requestId, deliveryDraft.remarks);
        break;
      case "match-invoice":
        matchInvoice(request.requestId, invoiceDraft);
        break;
      case "request-credit-note":
        requestCreditNote(request.requestId);
        break;
      case "resolve-invoice":
        resolveInvoice(request.requestId);
        break;
      case "close":
        closeRequest(request.requestId);
        break;
    }

    appendActionNote(request.requestId, noteBy, actionNote);
    setWorkflowAction(null);
  };

  const renderActionPanel = (request: MaterialRequest) => (
    <div className="flex flex-wrap gap-2">
      {activeRole === "Project Manager" && ["Draft", "Auto Suggested", "Clarification Required"].includes(request.status) && (
        <button onClick={() => openEditRequestModal(request)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">
          Edit Request
        </button>
      )}
      {activeRole === "Project Manager" && ["Auto Suggested", "Draft", "Clarification Required"].includes(request.status) && (
        <button onClick={() => openWorkflowAction("submit", request)} className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800">
          Submit Request
        </button>
      )}
      {activeRole === "Project Manager" && ["Delivered", "Partially Delivered"].includes(request.status) && (
        <button onClick={() => openWorkflowAction("verify-delivery", request)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
          Verify Delivery
        </button>
      )}
      {activeRole === "Project Manager" && request.status === "Draft" && (
        <button onClick={() => openWorkflowAction("delete", request)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">
          Delete Draft
        </button>
      )}
      {activeRole === "Project Manager" && request.status === "Site Verified" && request.grn && (
        <span className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
          Shortage/Damage Reported
        </span>
      )}
      {activeRole === "Admin" && ["Submitted by Project Manager", "Under Admin Review", "Clarification Required"].includes(request.status) && (
        <>
          {request.status === "Submitted by Project Manager" && (
            <button onClick={() => openWorkflowAction("admin-review", request)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100">
              Review
            </button>
          )}
          <button onClick={() => openWorkflowAction("admin-approve", request)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
            Approve
          </button>
          <button onClick={() => openWorkflowAction("admin-clarify", request)} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100">
            Ask Clarification
          </button>
          <button onClick={() => openWorkflowAction("admin-stock", request)} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100">
            Issue From Stock
          </button>
          <button onClick={() => openWorkflowAction("admin-forward", request)} className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800">
            Send to Procurement
          </button>
          <button onClick={() => openWorkflowAction("admin-reject", request)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-100">
            Reject
          </button>
        </>
      )}
      {activeRole === "Vendor" && request.rfq?.status === "Sent" && ["RFQ Sent", "Quotation Received"].includes(request.status) && (
        <button onClick={() => openWorkflowAction("vendor-submit-quotation", request)} className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800">
          Submit Quotation
        </button>
      )}
      {canActAsProcurement && (
        <>
          {request.status === "Sent to Procurement" && adminCanCreateRFQ && (
            <button onClick={() => openWorkflowAction("create-rfq", request)} className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800">
              Create RFQ
            </button>
          )}
          {request.status === "RFQ Created" && (
            <button onClick={() => openWorkflowAction("send-rfq", request)} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700">
              Send RFQ
            </button>
          )}
          {request.status === "RFQ Sent" && (
            <button onClick={() => openWorkflowAction("receive-quotations", request)} className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100">
              Load Demo Quotes
            </button>
          )}
          {request.status === "Quotation Received" && (
            <button onClick={() => openWorkflowAction("select-vendor", request)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
              Select Recommended Vendor
            </button>
          )}
          {request.status === "Vendor Selected" && (activeRole === "Procurement Manager" || adminCanCreatePO) && (
            <button onClick={() => openWorkflowAction("create-po", request)} className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800">
              Create PO
            </button>
          )}
          {request.status === "PO Draft" && (
            <button onClick={() => openWorkflowAction("issue-po", request)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-700">
              Issue PO
            </button>
          )}
          {request.status === "PO Issued" && (
            <button onClick={() => openWorkflowAction("update-delivery", request)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
              Update Delivery / GRN
            </button>
          )}
          {request.status === "Site Verified" && (
            <button onClick={() => openWorkflowAction("match-invoice", request)} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700">
              Match Invoice
            </button>
          )}
          {request.status === "Invoice On Hold" && !request.invoice?.creditNoteRequested && (
            <button onClick={() => openWorkflowAction("request-credit-note", request)} className="rounded-lg bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700">
              Request Credit Note
            </button>
          )}
          {request.status === "Invoice On Hold" && request.invoice?.creditNoteRequested && (
            <button onClick={() => openWorkflowAction("resolve-invoice", request)} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
              Mark Invoice Matched
            </button>
          )}
          {request.status === "Invoice Matched" && (
            <button onClick={() => openWorkflowAction("close", request)} className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800">
              Close Request
            </button>
          )}
        </>
      )}
      <button onClick={() => openTrackRequestModal(request)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">
        Track Request
      </button>
    </div>
  );

  const renderRequestTable = (items: MaterialRequest[]) => (
    <div className="overflow-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full min-w-[980px] text-left">
        <thead className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-4 py-3">Request</th>
            <th className="px-4 py-3">Project / Activity</th>
            <th className="px-4 py-3 text-right">Required</th>
            <th className="px-4 py-3 text-right">Stock</th>
            <th className="px-4 py-3 text-right">Shortage</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Quick Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((request) => (
            <tr
              key={request.requestId}
              onClick={() => openRequestInCurrentContext(request.requestId)}
              className={`${selectedRequestId === request.requestId ? "bg-blue-50/50" : "bg-white hover:bg-gray-50"} cursor-pointer`}
            >
              <td className="px-4 py-3">
                <p className="text-xs font-black text-indigo-700">{request.requestId}</p>
                <p className="mt-1 text-sm font-bold text-gray-900">{request.materialName}</p>
                <p className="mt-1 text-[10px] font-semibold text-gray-500">
                  {getRequestItems(request).length} item{getRequestItems(request).length === 1 ? "" : "s"} / {request.category}
                </p>
              </td>
              <td className="px-4 py-3">
                <p className="text-xs font-bold text-gray-900">{request.projectName}</p>
                <p className="mt-1 text-[11px] font-medium text-gray-500">{request.activityReference}</p>
                <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-gray-500">
                  <CalendarDays className="h-3 w-3" />
                  Required by {request.requiredDate}
                </p>
              </td>
              <td className="px-4 py-3 text-right text-xs font-bold text-gray-700">{summarizeRequestQuantity(request, "requiredQuantity")}</td>
              <td className="px-4 py-3 text-right text-xs font-bold text-gray-700">{summarizeRequestQuantity(request, "availableStock")}</td>
              <td className="px-4 py-3 text-right text-xs font-black text-red-700">{summarizeRequestQuantity(request, "shortageQuantity")}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityClass(request.priority)}`}>
                  {request.priority}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(request.status)}`}>
                  {request.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    runPrimaryAction(request);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-bold text-gray-800 shadow-sm hover:bg-gray-50"
                >
                  {primaryActionLabel(request)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {items.length === 0 && (
        <div className="p-8 text-center text-sm font-medium text-gray-500">No material requests match the current filters.</div>
      )}
    </div>
  );

  const renderDetail = () => (
    <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-gray-950">{selectedRequest.materialName}</h2>
              <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(selectedRequest.status)}`}>
                {selectedRequest.status}
              </span>
              <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityClass(selectedRequest.priority)}`}>
                {selectedRequest.priority}
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-gray-500">
              {selectedRequest.requestId} / {selectedRequest.projectCode} / {selectedRequest.generatedFrom}
            </p>
          </div>
          {renderActionPanel(selectedRequest)}
        </div>

        <Section title="Request Details" icon={Package}>
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="Request ID" value={selectedRequest.requestId} />
            <Field label="Project" value={selectedRequest.projectName} />
            <Field label="Requested By" value={`${selectedRequest.requestedBy} (${selectedRequest.requestedByRole})`} />
            <Field label="Department / Site" value={selectedRequest.departmentSite} />
            <Field label="Material" value={selectedRequest.materialName} />
            <Field label="Category" value={selectedRequest.category} />
            <Field label="Specification" value={selectedRequest.specification} />
            <Field label="Required Date" value={selectedRequest.requiredDate} />
            <Field label="Generated From" value={selectedRequest.generatedFrom} />
            <Field label="Assigned To" value={selectedRequest.assignedTo || "Unassigned"} />
            <Field label="Reason" value={selectedRequest.reason} />
            <Field label="Site" value={selectedRequest.site} />
          </div>

          {activeRole === "Project Manager" && ["Auto Suggested", "Draft", "Clarification Required"].includes(selectedRequest.status) && (
            <div className="mt-5 grid gap-3 border-t border-gray-100 pt-4 md:grid-cols-[180px_180px_1fr]">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Required Quantity
                <input
                  type="number"
                  value={selectedRequest.requiredQuantity}
                  onChange={(event) => updateQuantity(selectedRequest.requestId, Number(event.target.value))}
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                />
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Priority
                <select
                  value={selectedRequest.priority}
                  onChange={(event) => updatePriority(selectedRequest.requestId, event.target.value as Priority)}
                  className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                >
                  {(["Low", "Medium", "High", "Urgent"] as Priority[]).map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Remarks
                <textarea
                  value={selectedRequest.remarks}
                  onChange={(event) => updateRemarks(selectedRequest.requestId, event.target.value)}
                  className="mt-1 min-h-[38px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500"
                />
              </label>
            </div>
          )}
        </Section>

        <Section title="Material Line Items" icon={ClipboardCheck}>
          <div className="overflow-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-3 py-2">Material</th>
                  <th className="px-3 py-2">Specification</th>
                  <th className="px-3 py-2 text-right">Required</th>
                  <th className="px-3 py-2 text-right">Stock</th>
                  <th className="px-3 py-2 text-right">Shortage</th>
                  <th className="px-3 py-2">Required By</th>
                  <th className="px-3 py-2">BOQ / Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {getRequestItems(selectedRequest).map((item) => (
                  <tr key={item.itemId}>
                    <td className="px-3 py-3">
                      <p className="text-xs font-black text-gray-900">{item.materialName}</p>
                      <p className="mt-1 text-[10px] font-semibold text-gray-500">{item.category} / {item.priority}</p>
                    </td>
                    <td className="px-3 py-3 text-xs font-semibold text-gray-600">{item.specification}</td>
                    <td className="px-3 py-3 text-right text-xs font-bold">{quantityLabel(item.requiredQuantity, item.unit)}</td>
                    <td className="px-3 py-3 text-right text-xs font-bold">{quantityLabel(item.availableStock, item.unit)}</td>
                    <td className="px-3 py-3 text-right text-xs font-black text-red-700">{quantityLabel(item.shortageQuantity, item.unit)}</td>
                    <td className="px-3 py-3 text-xs font-bold">{item.requiredDate}</td>
                    <td className="px-3 py-3">
                      <p className="text-xs font-bold text-gray-900">{item.boqReference}</p>
                      <p className="mt-1 text-[10px] font-semibold text-gray-500">{item.activityReference}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="BOQ / Stock Comparison" icon={ClipboardCheck}>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Required Quantity</p>
              <p className="mt-1 text-2xl font-black text-blue-950">{summarizeRequestQuantity(selectedRequest, "requiredQuantity")}</p>
            </div>
            <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Available Stock</p>
              <p className="mt-1 text-2xl font-black text-emerald-950">{summarizeRequestQuantity(selectedRequest, "availableStock")}</p>
            </div>
            <div className="rounded-lg border border-red-100 bg-red-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Shortage Quantity</p>
              <p className="mt-1 text-2xl font-black text-red-950">{summarizeRequestQuantity(selectedRequest, "shortageQuantity")}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Formula</p>
              <p className="mt-2 text-sm font-bold text-gray-800">Required - Available = Shortage</p>
              <p className="mt-1 text-xs font-medium text-gray-500">
                Calculated separately for each request line item.
              </p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <Field label="BOQ Reference" value={selectedRequest.boqReference} />
            <Field label="Drawing Reference" value={selectedRequest.drawingReference} />
            <Field label="Activity Reference" value={selectedRequest.activityReference} />
          </div>
        </Section>

        <Section title="Approval Section" icon={ShieldCheck}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Admin Notes
              <textarea
                disabled={activeRole !== "Admin"}
                value={selectedRequest.adminNotes}
                onChange={(event) => updateAdminNotes(selectedRequest.requestId, event.target.value)}
                placeholder="BOQ/stock review notes"
                className="mt-1 min-h-[82px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none disabled:bg-gray-50"
              />
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Procurement Notes
              <textarea
                disabled={activeRole === "Project Manager"}
                value={selectedRequest.procurementNotes}
                onChange={(event) => updateProcurementNotes(selectedRequest.requestId, event.target.value)}
                placeholder="Vendor, delivery, or invoice notes"
                className="mt-1 min-h-[82px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none disabled:bg-gray-50"
              />
            </label>
          </div>
          <div className="mt-4 grid gap-2">
            {selectedRequest.approvalHistory.map((item, index) => (
              <div key={`${item.action}-${index}`} className="flex items-start justify-between gap-4 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">{item.action}</p>
                  {item.notes && <p className="mt-1 text-xs font-medium text-gray-500">{item.notes}</p>}
                </div>
                <p className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {item.name} / {item.date}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="RFQ Section" icon={FileText}>
          {selectedRequest.rfq ? (
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="RFQ ID" value={selectedRequest.rfq.rfqId} />
              <Field label="Request ID" value={selectedRequest.rfq.requestId} />
              <Field label="Project" value={selectedRequest.rfq.project} />
              <Field label="Material" value={selectedRequest.rfq.material} />
              <Field label="Quantity" value={quantityLabel(selectedRequest.rfq.quantity, selectedRequest.rfq.unit)} />
              <Field label="RFQ Date" value={selectedRequest.rfq.rfqDate} />
              <Field label="Submission Deadline" value={selectedRequest.rfq.submissionDeadline} />
              <Field label="Status" value={selectedRequest.rfq.status} />
              <div className="md:col-span-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Vendors Invited</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedRequest.rfq.vendorsInvited.map((vendor) => (
                    <span key={vendor} className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-bold text-gray-700">{vendor}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-500">RFQ not created yet.</p>
          )}
        </Section>

        <Section title="Quotation Comparison" icon={ShoppingCart}>
          {selectedRequest.quotations.length ? (
            <div className="overflow-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="py-2 pr-3">Vendor</th>
                    <th className="py-2 pr-3 text-right">Rate</th>
                    <th className="py-2 pr-3 text-right">Tax</th>
                    <th className="py-2 pr-3 text-right">Freight</th>
                    <th className="py-2 pr-3 text-right">Total</th>
                    <th className="py-2 pr-3 text-right">Delivery</th>
                    <th className="py-2 pr-3 text-right">Rating</th>
                    <th className="py-2 pr-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedRequest.quotations.map((quote, index) => (
                    <tr key={quote.quotationId} className={index === 0 ? "bg-emerald-50/70" : ""}>
                      <td className="py-3 pr-3">
                        <p className="text-xs font-black text-gray-900">{quote.vendorName}</p>
                        <p className="mt-1 text-[10px] font-medium text-gray-500">{quote.paymentTerms} / valid until {quote.validity}</p>
                        {index === 0 && (
                          <p className="mt-1 inline-flex rounded-md border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            Recommended
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-3 text-right text-xs font-bold">{currency(quote.unitRate)}</td>
                      <td className="py-3 pr-3 text-right text-xs font-bold">{currency(quote.tax)}</td>
                      <td className="py-3 pr-3 text-right text-xs font-bold">{currency(quote.freight)}</td>
                      <td className="py-3 pr-3 text-right text-xs font-black">{currency(quote.totalAmount)}</td>
                      <td className="py-3 pr-3 text-right text-xs font-bold">{quote.deliveryDays} days</td>
                      <td className="py-3 pr-3 text-right text-xs font-bold">{quote.rating.toFixed(1)}</td>
                      <td className="py-3 pr-3 text-right text-xs font-black text-emerald-700">{quote.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs font-semibold text-gray-500">
                Score uses price 40%, delivery time 40%, and rating 20%. For urgent requirements, FastBuild Materials wins because one-day delivery and the highest rating offset its higher unit rate.
              </p>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-500">No quotations received yet.</p>
          )}
        </Section>

        <Section title="PO Section" icon={DollarSign}>
          {selectedRequest.po ? (
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="PO ID" value={selectedRequest.po.poId} />
              <Field label="Vendor" value={selectedRequest.po.vendor} />
              <Field label="Project" value={selectedRequest.po.project} />
              <Field label="Material" value={selectedRequest.po.material} />
              <Field label="Quantity" value={quantityLabel(selectedRequest.po.quantity, rfqUnitForRequest(selectedRequest))} />
              <Field label="Rate" value={currency(selectedRequest.po.rate)} />
              <Field label="Tax" value={currency(selectedRequest.po.tax)} />
              <Field label="Total Amount" value={currency(selectedRequest.po.totalAmount)} />
              <Field label="Delivery Location" value={selectedRequest.po.deliveryLocation} />
              <Field label="Delivery Date" value={selectedRequest.po.deliveryDate} />
              <Field label="Payment Terms" value={selectedRequest.po.paymentTerms} />
              <Field label="Status" value={selectedRequest.po.status} />
              <div className="md:col-span-4">
                <Field label="Terms and Conditions" value={selectedRequest.po.termsAndConditions} />
              </div>
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-500">PO not created yet.</p>
          )}
        </Section>

        <Section title="Delivery / GRN Section" icon={Truck}>
          {selectedRequest.grn ? (
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="GRN ID" value={selectedRequest.grn.grnId} />
              <Field label="PO ID" value={selectedRequest.grn.poId} />
              <Field label="Vendor" value={selectedRequest.grn.vendor} />
              <Field label="Material" value={selectedRequest.grn.material} />
              <Field label="Ordered" value={quantityLabel(selectedRequest.grn.orderedQuantity, rfqUnitForRequest(selectedRequest))} />
              <Field label="Received" value={quantityLabel(selectedRequest.grn.receivedQuantity, rfqUnitForRequest(selectedRequest))} />
              <Field label="Damaged" value={quantityLabel(selectedRequest.grn.damagedQuantity, rfqUnitForRequest(selectedRequest))} />
              <Field label="Accepted" value={quantityLabel(selectedRequest.grn.acceptedQuantity, rfqUnitForRequest(selectedRequest))} />
              <Field label="Received Date" value={selectedRequest.grn.receivedDate} />
              <Field label="Received By" value={selectedRequest.grn.receivedBy} />
              <Field label="Site Verification" value={selectedRequest.grn.siteVerificationStatus} />
              <Field label="PM Remarks" value={selectedRequest.grn.projectManagerRemarks || "Awaiting site verification"} />
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-500">Delivery and GRN are pending.</p>
          )}
        </Section>

        <Section title="Invoice Matching Section" icon={DollarSign}>
          {selectedRequest.invoice ? (
            <div className="grid gap-4 md:grid-cols-4">
              <Field label="Invoice ID" value={selectedRequest.invoice.invoiceId} />
              <Field label="Vendor" value={selectedRequest.invoice.vendor} />
              <Field label="Invoice Qty" value={quantityLabel(selectedRequest.invoice.invoiceQuantity, rfqUnitForRequest(selectedRequest))} />
              <Field label="Accepted Qty" value={quantityLabel(selectedRequest.invoice.acceptedQuantity, rfqUnitForRequest(selectedRequest))} />
              <Field label="Invoice Amount" value={currency(selectedRequest.invoice.invoiceAmount)} />
              <Field label="Credit Note" value={selectedRequest.invoice.creditNoteRequested ? "Requested / adjusted" : "Not requested"} />
              <Field label="Status" value={selectedRequest.invoice.status} />
              <Field label="Resolution" value={selectedRequest.invoice.resolutionNotes || "Pending"} />
            </div>
          ) : (
            <p className="text-sm font-medium text-gray-500">Invoice matching is pending until site verification is complete.</p>
          )}
        </Section>
      </div>

      <aside className="space-y-4">
        <Section title="Timeline / Activity Log" icon={Clock}>
          <div className="relative space-y-4">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-200" />
            {selectedRequest.timeline.map((entry, index) => (
              <div key={`${entry.label}-${index}`} className="relative flex gap-3">
                <div className={`mt-1 h-3.5 w-3.5 rounded-full border-2 ${index === selectedRequest.timeline.length - 1 ? "border-blue-600 bg-blue-600" : "border-emerald-500 bg-white"}`} />
                <div>
                  <p className="text-xs font-black text-gray-900">{entry.label}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{entry.by} / {entry.date}</p>
                  {entry.note && <p className="mt-1 text-xs font-medium text-gray-500">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Documents" icon={FileText}>
          <div className="space-y-2">
            {selectedRequest.attachments.map((doc) => (
              <div key={doc.name} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
                <div>
                  <p className="text-xs font-bold text-gray-900">{doc.name}</p>
                  <p className="mt-0.5 text-[10px] font-semibold text-gray-500">{doc.type} / {doc.size}</p>
                </div>
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Role Permissions" icon={UserCheck}>
          <div className="space-y-2 text-xs font-semibold text-gray-600">
            <p>Project Manager: suggestions, submit, track, verify delivery.</p>
            <p>Admin: review, approve/reject, stock check, forward, notes/status.</p>
            <p>Procurement Manager: RFQ, quotations, PO, GRN, invoice match, close.</p>
            <p>Vendor: view sent RFQs and submit quotation inputs.</p>
          </div>
        </Section>
      </aside>
    </div>
  );

  const workflowRequest = workflowAction ? requests.find((request) => request.requestId === workflowAction.requestId) : null;
  const workflowNeedsVendor = workflowAction?.type === "select-vendor";
  const workflowNeedsVendorQuotation = workflowAction?.type === "vendor-submit-quotation";
  const workflowNeedsDelivery = workflowAction?.type === "update-delivery" || workflowAction?.type === "verify-delivery";
  const workflowNeedsInvoice = workflowAction?.type === "match-invoice";
  const trackingSteps = [
    "Auto Suggested by System",
    "Submitted by Project Manager",
    "Under Admin Review",
    "Sent to Procurement",
    "RFQ Created",
    "RFQ Sent",
    "Quotation Submitted by Vendor",
    "Quotations Received",
    "Vendor Selected",
    "PO Issued",
    "Material Delivered",
    "Site Verified",
    "Invoice Matched",
    "Closed",
  ];

  return (
    <>
    <div className="flex h-full min-h-[720px] flex-col overflow-hidden bg-white">
      <div className="shrink-0 border-b border-gray-200 bg-white px-1 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black tracking-tight text-gray-950">Material Procurement</h2>
              <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-600">Site need to payment</span>
            </div>
            <p className="mt-1 text-xs font-medium text-gray-500">
              {PROJECT.name} / {PROJECT.phase} / {PROJECT.siteLocation}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeRole === "Project Manager" && (
              <button onClick={openCreateRequestModal} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">
                Raise Material Request
              </button>
            )}
            {(["Project Manager", "Admin", "Procurement Manager", "Vendor"] as Role[]).map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                  activeRole === role
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {role}
              </button>
            ))}
            <button onClick={resetDemo} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50">
              Reset Demo
            </button>
          </div>
        </div>

        {activeRole === "Admin" && (
          <div className="mt-3 flex flex-wrap gap-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2">
            <label className="flex items-center gap-2 text-xs font-bold text-blue-800">
              <input type="checkbox" checked={adminCanCreateRFQ} onChange={(event) => setAdminCanCreateRFQ(event.target.checked)} />
              RFQ permission enabled
            </label>
            <label className="flex items-center gap-2 text-xs font-bold text-blue-800">
              <input type="checkbox" checked={adminCanCreatePO} onChange={(event) => setAdminCanCreatePO(event.target.checked)} />
              PO permission enabled
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {(["Dashboard", "Auto Suggestions", "Requests", "Admin Review", "Workbench", "Vendor Portal"] as ActiveView[]).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
                activeView === view ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {view === "Dashboard" ? "Home" : view}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-gray-50/40 p-4">
        {activeView === "Dashboard" && (
          <div className="space-y-5">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
              <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Procurement Home</p>
                  <h3 className="mt-2 text-2xl font-black tracking-tight text-gray-950">
                    Know what needs to be bought, who must act, and what is stuck.
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-gray-600">
                    The system checks the project schedule, BOQ quantity, and site stock. If stock is short, it creates a material request for review.
                  </p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    {simpleFlow.map((step) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.label} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                          <Icon className="h-4 w-4 text-gray-500" />
                          <span className="text-xs font-bold text-gray-700">{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Example from current project</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-md bg-white p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Required</p>
                      <p className="mt-1 text-lg font-black text-gray-950">500</p>
                      <p className="text-[10px] font-bold text-gray-500">bags</p>
                    </div>
                    <div className="rounded-md bg-white p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Stock</p>
                      <p className="mt-1 text-lg font-black text-gray-950">120</p>
                      <p className="text-[10px] font-bold text-gray-500">bags</p>
                    </div>
                    <div className="rounded-md bg-white p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Short</p>
                      <p className="mt-1 text-lg font-black text-red-700">380</p>
                      <p className="text-[10px] font-bold text-gray-500">bags</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs font-semibold text-emerald-800">
                    Cement for Slab Casting - Level 5 is suggested automatically because 500 - 120 = 380 bags shortage.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {homeMetrics.map((metric) => {
                const Icon = metric.icon;
                return (
                  <button
                    key={metric.label}
                    onClick={() => setActiveView(metric.label === "Need site review" ? "Auto Suggestions" : metric.label === "Waiting for admin" ? "Admin Review" : metric.label === "Being purchased" ? "Workbench" : "Requests")}
                    className={`rounded-lg border p-4 text-left shadow-sm transition-colors hover:bg-white ${metric.tone}`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5" />
                      <span className="text-3xl font-black">{metric.value}</span>
                    </div>
                    <p className="mt-3 text-sm font-black text-gray-950">{metric.label}</p>
                    <p className="mt-1 text-xs font-semibold opacity-80">{metric.note}</p>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_420px]">
              <Section title={`Next Actions for ${activeRole}`} icon={Clock}>
                <div className="space-y-3">
                  {(roleActionRequests.length ? roleActionRequests : requests.slice(0, 4)).map((request) => (
                    <div key={request.requestId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-3 py-3">
                      <div>
                        <p className="text-sm font-black text-gray-950">{request.materialName} / {request.requestId}</p>
                        <p className="mt-1 text-xs font-semibold text-gray-500">
                          {request.status === "Auto Suggested"
                            ? `System found ${summarizeRequestQuantity(request, "shortageQuantity")} shortage.`
                            : request.status === "Invoice On Hold"
                              ? "Invoice is held because accepted quantity is lower than invoice quantity."
                              : `${request.status} for ${request.activityReference}.`}
                        </p>
                      </div>
                      <button
                        onClick={() => runPrimaryAction(request)}
                        className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800"
                      >
                        {primaryActionLabel(request)}
                      </button>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Who Does What" icon={UserCheck}>
                <div className="space-y-3">
                  {roleGuides.map((guide) => {
                    const Icon = guide.icon;
                    return (
                      <button
                        key={guide.role}
                        onClick={() => {
                          setActiveRole(guide.role);
                          setActiveView(guide.view);
                        }}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          activeRole === guide.role
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                          <div>
                            <p className="text-sm font-black">{guide.role}</p>
                            <p className="mt-1 text-xs font-bold">{guide.title}</p>
                            <p className={`mt-1 text-xs font-medium ${activeRole === guide.role ? "text-white/70" : "text-gray-500"}`}>
                              {guide.description}
                            </p>
                            <p className={`mt-2 text-[10px] font-black uppercase tracking-wider ${activeRole === guide.role ? "text-white" : "text-gray-900"}`}>
                              {guide.action}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Section>
            </div>

            <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
              <Section title="Live Material Requests" icon={Package}>
                {renderRequestTable(requests.slice(0, 5))}
              </Section>
              <Section title="Vendor Recommendation" icon={Star}>
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-900">For urgent work, fastest delivery matters as much as price.</p>
                  <p className="text-xs font-medium text-gray-500">
                    FastBuild Materials is suggested because it can deliver in 1 day and has the highest rating.
                  </p>
                  <div className="space-y-2">
                    {calculateQuotations("RFQ-DEMO", 380, "bags").map((quote, index) => (
                      <div key={quote.vendorName} className={`flex items-center justify-between rounded-lg border px-3 py-2 ${index === 0 ? "border-emerald-200 bg-emerald-50" : "border-gray-100 bg-gray-50"}`}>
                        <div>
                          <p className="text-xs font-black text-gray-900">{quote.vendorName}</p>
                          <p className="text-[10px] font-semibold text-gray-500">{currency(quote.unitRate)} / {quote.deliveryDays} days / rating {quote.rating}</p>
                        </div>
                        <p className={`text-sm font-black ${index === 0 ? "text-emerald-700" : "text-gray-700"}`}>{quote.score}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            </div>
          </div>
        )}

        {activeView === "Auto Suggestions" && (
          <div className="space-y-4">
            <Section title="Project Schedule Driven Suggestions" icon={CalendarDays}>
              <div className="mb-4 grid gap-3 md:grid-cols-5">
                <Field label="Project" value={PROJECT.name} />
                <Field label="Code" value={PROJECT.code} />
                <Field label="Project Manager" value={PROJECT.projectManager} />
                <Field label="Admin" value={PROJECT.admin} />
                <Field label="Procurement Manager" value={PROJECT.procurementManager} />
              </div>
              <div className="overflow-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[960px] text-left">
                  <thead className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-4 py-3">Upcoming Activity</th>
                      <th className="px-4 py-3">Material</th>
                      <th className="px-4 py-3 text-right">Required</th>
                      <th className="px-4 py-3 text-right">Current Stock</th>
                      <th className="px-4 py-3 text-right">Shortage</th>
                      <th className="px-4 py-3">Required By</th>
                      <th className="px-4 py-3">Request</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {suggestions.map((request) => (
                      <tr key={request.requestId}>
                        <td className="px-4 py-3">
                          <p className="text-xs font-black text-gray-900">{request.activityReference}</p>
                          <p className="mt-1 text-[10px] font-semibold text-gray-500">Phase: {PROJECT.phase}</p>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold text-gray-900">{request.materialName}</td>
                        <td className="px-4 py-3 text-right text-xs font-bold">{quantityLabel(request.requiredQuantity, request.unit)}</td>
                        <td className="px-4 py-3 text-right text-xs font-bold">{quantityLabel(request.availableStock, request.unit)}</td>
                        <td className="px-4 py-3 text-right text-xs font-black text-red-700">{quantityLabel(request.shortageQuantity, request.unit)}</td>
                        <td className="px-4 py-3 text-xs font-bold">{request.requiredDate}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(request.status)}`}>{request.requestId} / {request.status}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => {
                              if (activeRole === "Project Manager" && ["Auto Suggested", "Draft", "Clarification Required"].includes(request.status)) {
                                openReviewSubmitModal(request);
                                return;
                              }
                              openRequest(request.requestId, "Requests");
                            }}
                            className="rounded-lg bg-gray-900 px-3 py-2 text-[11px] font-bold text-white hover:bg-gray-800"
                          >
                            {activeRole === "Project Manager" && request.status === "Auto Suggested" ? "Review & Submit Request" : "Open Request"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}

        {activeView === "Requests" && (
          <div className="space-y-4">
            <Section title="Material Request List" icon={Search}>
              <div className="mb-4 flex flex-wrap gap-2">
                <div className="relative min-w-[260px] flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search request, material, project, or vendor"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm font-medium outline-none focus:border-blue-500"
                  />
                </div>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | MaterialRequestStatus)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold outline-none">
                  <option value="All">All statuses</option>
                  {ALL_STATUSES.map((status) => <option key={status}>{status}</option>)}
                </select>
                <select value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold outline-none">
                  <option>All</option>
                  {projects.map((project) => <option key={project}>{project}</option>)}
                </select>
                <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as "All" | Priority)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold outline-none">
                  <option>All</option>
                  {(["Low", "Medium", "High", "Urgent"] as Priority[]).map((priority) => <option key={priority}>{priority}</option>)}
                </select>
                <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as "All" | Role)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold outline-none">
                  <option>All</option>
                  {(["Project Manager", "Admin", "Procurement Manager", "Vendor"] as Role[]).map((role) => <option key={role}>{role}</option>)}
                </select>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-500">
                  <Filter className="h-4 w-4" />
                  {filteredRequests.length} shown
                </div>
                {activeRole === "Project Manager" && (
                  <button onClick={openCreateRequestModal} className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800">
                    Raise Request
                  </button>
                )}
              </div>
              {renderRequestTable(filteredRequests)}
            </Section>
            {renderDetail()}
          </div>
        )}

        {activeView === "Admin Review" && (
          <div className="space-y-4">
            <Section title="Admin Review Page" icon={ShieldCheck}>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700">Reviewer: {PROJECT.admin}</span>
                <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700">BOQ and stock check enabled</span>
                <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-bold text-gray-700">Assign Procurement Manager: {PROJECT.procurementManager}</span>
              </div>
              {renderRequestTable(adminQueue.length ? adminQueue : requests.filter((request) => ["Auto Suggested", "Submitted by Project Manager", "Under Admin Review"].includes(request.status)).slice(0, 6))}
            </Section>
            {renderDetail()}
          </div>
        )}

        {activeView === "Workbench" && (
          <div className="space-y-4">
            <Section title="Procurement Manager Workbench" icon={ShoppingCart}>
              <div className="mb-4 grid gap-3 md:grid-cols-4">
                <Field label="Procurement Manager" value={PROJECT.procurementManager} />
                <Field label="Open Procurement Queue" value={procurementQueue.length} />
                <Field label="Recommended Vendor" value={recommendedQuote?.vendorName ?? "Awaiting quotations"} />
                <Field label="Current Request" value={`${selectedRequest.requestId} / ${selectedRequest.status}`} />
              </div>
              {renderRequestTable(procurementQueue.length ? procurementQueue : requests.slice(0, 6))}
            </Section>
            {renderDetail()}
          </div>
        )}

        {activeView === "Vendor Portal" && (
          <div className="space-y-4">
            <Section title="Vendor Quotation Portal" icon={UserCheck}>
              <div className="mb-4 grid gap-3 md:grid-cols-4">
                <Field label="Vendor User" value={ROLE_NAMES.Vendor} />
                <Field label="Open RFQs" value={vendorQueue.length} />
                <Field label="Input Needed" value="Rate, tax, freight, delivery, terms" />
                <Field label="Current RFQ" value={selectedRequest.rfq?.rfqId ?? "Select a sent RFQ"} />
              </div>
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
                Vendors enter quotation details here. Procurement Manager can compare and select a vendor after at least one quote is submitted.
              </div>
              {renderRequestTable(vendorQueue)}
            </Section>
            {renderDetail()}
          </div>
        )}
      </div>
    </div>
    <Dialog open={isRequestModalOpen} onOpenChange={(open) => {
      setIsRequestModalOpen(open);
      if (!open) setRequestModalSubmitOnSave(false);
    }}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{requestModalMode === "create" ? "Raise Material Request" : requestModalSubmitOnSave ? "Review & Submit Material Request" : "Edit Material Request"}</DialogTitle>
          <DialogDescription>
            {requestModalSubmitOnSave
              ? "Review the shortage, quantity, priority, and remarks. Click Submit Request to send it to Admin."
              : "Project Manager can create or edit draft/auto-suggested requests before submitting to Admin."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="rounded-lg border border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-gray-700">Material Items</p>
                <p className="text-[11px] font-semibold text-gray-500">Each line calculates shortage as required quantity minus available stock.</p>
              </div>
              <button type="button" onClick={addDraftLine} className="rounded-lg bg-gray-900 px-3 py-2 text-xs font-bold text-white hover:bg-gray-800">
                Add Item
              </button>
            </div>

            <div className="space-y-3 p-3">
              {requestDraft.items.map((item, index) => (
                <div key={item.itemId} className="rounded-lg border border-gray-100 bg-white p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs font-black text-gray-900">Item {index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeDraftLine(item.itemId)}
                      disabled={requestDraft.items.length <= 1}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Material
                      <input value={item.materialName} onChange={(event) => updateDraftLine(item.itemId, "materialName", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Category
                      <input value={item.category} onChange={(event) => updateDraftLine(item.itemId, "category", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Unit
                      <input value={item.unit} onChange={(event) => updateDraftLine(item.itemId, "unit", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                    </label>
                  </div>

                  <label className="mt-3 block text-xs font-bold uppercase tracking-wider text-gray-600">
                    Specification
                    <input value={item.specification} onChange={(event) => updateDraftLine(item.itemId, "specification", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                  </label>

                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Required Qty
                      <input type="number" value={item.requiredQuantity} onChange={(event) => updateDraftLine(item.itemId, "requiredQuantity", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Available Stock
                      <input type="number" value={item.availableStock} onChange={(event) => updateDraftLine(item.itemId, "availableStock", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Shortage
                      <input disabled value={Math.max(0, parseQuantity(item.requiredQuantity) - parseQuantity(item.availableStock))} className="mt-1 w-full rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-black text-red-700" />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Required Date
                      <input type="date" value={item.requiredDate} onChange={(event) => updateDraftLine(item.itemId, "requiredDate", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                    </label>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Priority
                      <select value={item.priority} onChange={(event) => updateDraftLine(item.itemId, "priority", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500">
                        {(["Low", "Medium", "High", "Urgent"] as Priority[]).map((priority) => <option key={priority}>{priority}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      BOQ Reference
                      <input value={item.boqReference} onChange={(event) => updateDraftLine(item.itemId, "boqReference", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Drawing Reference
                      <input value={item.drawingReference} onChange={(event) => updateDraftLine(item.itemId, "drawingReference", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                    </label>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                      Activity Reference
                      <input value={item.activityReference} onChange={(event) => updateDraftLine(item.itemId, "activityReference", event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Department / Site
              <input value={requestDraft.departmentSite} onChange={(event) => setRequestDraft((draft) => ({ ...draft, departmentSite: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
            </label>
          </div>

          <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Reason
            <textarea value={requestDraft.reason} onChange={(event) => setRequestDraft((draft) => ({ ...draft, reason: event.target.value }))} className="mt-1 min-h-[72px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500" />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Remarks
            <textarea value={requestDraft.remarks} onChange={(event) => setRequestDraft((draft) => ({ ...draft, remarks: event.target.value }))} className="mt-1 min-h-[64px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500" />
          </label>
          <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
            Attachment Name
            <input value={requestDraft.attachmentName} onChange={(event) => setRequestDraft((draft) => ({ ...draft, attachmentName: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
          </label>
        </div>

        <DialogFooter>
          <button onClick={() => {
            setIsRequestModalOpen(false);
            setRequestModalSubmitOnSave(false);
          }} className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          {requestModalMode === "edit" && requestModalSubmitOnSave && (
            <button onClick={() => saveRequestDraft(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">
              Save Only
            </button>
          )}
          {requestModalMode === "create" && (
            <button onClick={() => saveRequestDraft(true)} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
              Create & Submit
            </button>
          )}
          <button onClick={() => saveRequestDraft(requestModalMode === "edit" && requestModalSubmitOnSave)} className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800">
            {requestModalMode === "create" ? "Create Draft" : requestModalSubmitOnSave ? "Submit Request" : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={workflowAction !== null} onOpenChange={(open) => !open && setWorkflowAction(null)}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{workflowAction ? workflowTitle(workflowAction.type) : "Workflow Action"}</DialogTitle>
          <DialogDescription>
            {workflowRequest ? `${workflowRequest.requestId} / ${workflowRequest.materialName} / Current status: ${workflowRequest.status}` : "Confirm this workflow action."}
          </DialogDescription>
        </DialogHeader>

        {workflowRequest && (
          <div className="grid gap-4 py-2">
            <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-3">
              <Field label="Required" value={summarizeRequestQuantity(workflowRequest, "requiredQuantity")} />
              <Field label="Stock" value={summarizeRequestQuantity(workflowRequest, "availableStock")} />
              <Field label="Shortage" value={summarizeRequestQuantity(workflowRequest, "shortageQuantity")} />
            </div>

            {workflowAction?.type === "send-rfq" && workflowRequest.rfq && (
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Vendors Invited</p>
                <p className="mt-2 text-sm font-semibold text-blue-950">{workflowRequest.rfq.vendorsInvited.join(", ")}</p>
              </div>
            )}

            {workflowAction?.type === "receive-quotations" && (
              <div className="rounded-lg border border-violet-100 bg-violet-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Demo quotations will be loaded</p>
                <p className="mt-2 text-sm font-semibold text-violet-950">Use Vendor Portal for the real demo flow. This button only imports sample quotations for quick testing.</p>
              </div>
            )}

            {workflowNeedsVendorQuotation && (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 md:col-span-2">
                  Vendor Name
                  <select
                    value={vendorQuotationDraft.vendorName}
                    onChange={(event) => setVendorQuotationDraft(defaultVendorQuotationDraft(event.target.value))}
                    className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500"
                  >
                    {VENDOR_QUOTES.map((vendor) => (
                      <option key={vendor.name} value={vendor.name}>{vendor.name}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Unit / Package Rate
                  <input type="number" value={vendorQuotationDraft.unitRate} onChange={(event) => setVendorQuotationDraft((draft) => ({ ...draft, unitRate: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Delivery Days
                  <input type="number" value={vendorQuotationDraft.deliveryDays} onChange={(event) => setVendorQuotationDraft((draft) => ({ ...draft, deliveryDays: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Tax %
                  <input type="number" value={vendorQuotationDraft.taxPercent} onChange={(event) => setVendorQuotationDraft((draft) => ({ ...draft, taxPercent: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Freight
                  <input type="number" value={vendorQuotationDraft.freight} onChange={(event) => setVendorQuotationDraft((draft) => ({ ...draft, freight: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Discount or Discount %
                  <input value={vendorQuotationDraft.discount} onChange={(event) => setVendorQuotationDraft((draft) => ({ ...draft, discount: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Rating
                  <input type="number" step="0.1" value={vendorQuotationDraft.rating} onChange={(event) => setVendorQuotationDraft((draft) => ({ ...draft, rating: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Payment Terms
                  <input value={vendorQuotationDraft.paymentTerms} onChange={(event) => setVendorQuotationDraft((draft) => ({ ...draft, paymentTerms: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Validity
                  <input type="date" value={vendorQuotationDraft.validity} onChange={(event) => setVendorQuotationDraft((draft) => ({ ...draft, validity: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 md:col-span-2">
                  Remarks
                  <textarea value={vendorQuotationDraft.remarks} onChange={(event) => setVendorQuotationDraft((draft) => ({ ...draft, remarks: event.target.value }))} className="mt-1 min-h-[72px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500" />
                </label>
              </div>
            )}

            {workflowNeedsVendor && (
              <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                Vendor
                <select value={selectedVendorDraft} onChange={(event) => setSelectedVendorDraft(event.target.value)} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500">
                  {(workflowRequest.quotations.length ? workflowRequest.quotations : calculateQuotations(workflowRequest.rfq?.rfqId ?? "RFQ-MANUAL", rfqQuantityForRequest(workflowRequest), rfqUnitForRequest(workflowRequest))).map((quote) => (
                    <option key={quote.vendorName} value={quote.vendorName}>
                      {quote.vendorName} / score {quote.score} / {quote.deliveryDays} day(s)
                    </option>
                  ))}
                </select>
              </label>
            )}

            {workflowNeedsDelivery && (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Received Quantity
                  <input type="number" value={deliveryDraft.receivedQuantity} onChange={(event) => setDeliveryDraft((draft) => ({ ...draft, receivedQuantity: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Damaged Quantity
                  <input type="number" value={deliveryDraft.damagedQuantity} onChange={(event) => setDeliveryDraft((draft) => ({ ...draft, damagedQuantity: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Received By
                  <input value={deliveryDraft.receivedBy} onChange={(event) => setDeliveryDraft((draft) => ({ ...draft, receivedBy: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Received Date
                  <input type="date" value={deliveryDraft.receivedDate} onChange={(event) => setDeliveryDraft((draft) => ({ ...draft, receivedDate: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 md:col-span-2">
                  Site Remark
                  <textarea value={deliveryDraft.remarks} onChange={(event) => setDeliveryDraft((draft) => ({ ...draft, remarks: event.target.value }))} className="mt-1 min-h-[72px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500" />
                </label>
              </div>
            )}

            {workflowNeedsInvoice && (
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Invoice Quantity
                  <input type="number" value={invoiceDraft.invoiceQuantity} onChange={(event) => setInvoiceDraft((draft) => ({ ...draft, invoiceQuantity: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
                  Invoice Amount
                  <input type="number" value={invoiceDraft.invoiceAmount} onChange={(event) => setInvoiceDraft((draft) => ({ ...draft, invoiceAmount: event.target.value }))} className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-semibold outline-none focus:border-blue-500" />
                </label>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-600 md:col-span-2">
                  Matching Notes
                  <textarea value={invoiceDraft.notes} onChange={(event) => setInvoiceDraft((draft) => ({ ...draft, notes: event.target.value }))} className="mt-1 min-h-[72px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500" />
                </label>
              </div>
            )}

            {workflowAction?.type === "delete" && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">
                This removes the draft from the local demo data. Reset Demo will bring back seeded data.
              </div>
            )}

            <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Note
              <textarea value={actionNote} onChange={(event) => setActionNote(event.target.value)} placeholder="Optional note for timeline" className="mt-1 min-h-[72px] w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium outline-none focus:border-blue-500" />
            </label>
          </div>
        )}

        <DialogFooter>
          <button onClick={() => setWorkflowAction(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={confirmWorkflowAction} className={`rounded-lg px-4 py-2 text-xs font-bold text-white ${workflowAction?.type === "delete" || workflowAction?.type === "admin-reject" ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"}`}>
            {workflowAction?.type === "vendor-submit-quotation" ? "Submit Quotation" : workflowAction?.type === "delete" ? "Delete" : "Confirm"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={trackedRequest !== null} onOpenChange={(open) => !open && setTrackRequestId(null)}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl">
        {trackedRequest && (
          <>
            <DialogHeader>
              <DialogTitle>Track Request - {trackedRequest.requestId}</DialogTitle>
              <DialogDescription>
                {trackedRequest.materialName} for {trackedRequest.projectName}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 md:grid-cols-4">
                <Field label="Status" value={<span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${statusClass(trackedRequest.status)}`}>{trackedRequest.status}</span>} />
                <Field label="Priority" value={<span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityClass(trackedRequest.priority)}`}>{trackedRequest.priority}</span>} />
                <Field label="Shortage" value={summarizeRequestQuantity(trackedRequest, "shortageQuantity")} />
                <Field label="Assigned To" value={trackedRequest.assignedTo || "Unassigned"} />
              </div>

              <div className="grid gap-2 md:grid-cols-6">
                {trackingSteps.map((step, index) => {
                  const completed = trackedRequest.timeline.some((entry) => entry.label === step || entry.label.includes(step.replace(" by System", "")));
                  return (
                    <div key={step} className={`rounded-lg border px-3 py-2 ${completed ? "border-emerald-200 bg-emerald-50" : "border-gray-200 bg-white"}`}>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${completed ? "text-emerald-700" : "text-gray-400"}`}>Step {index + 1}</p>
                      <p className="mt-1 text-xs font-bold text-gray-800">{step.replace(" by System", "")}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-3">
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Latest Activity</p>
                <div className="space-y-2">
                  {trackedRequest.timeline.slice(-6).reverse().map((entry, index) => (
                    <div key={`${entry.label}-${index}`} className="rounded-md bg-gray-50 px-3 py-2">
                      <p className="text-xs font-black text-gray-900">{entry.label}</p>
                      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{entry.by} / {entry.date}</p>
                      {entry.note && <p className="mt-1 text-xs font-medium text-gray-500">{entry.note}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {trackedRequest.po && (
                <div className="grid gap-3 rounded-lg border border-violet-100 bg-violet-50 p-3 md:grid-cols-4">
                  <Field label="PO" value={trackedRequest.po.poId} />
                  <Field label="Vendor" value={trackedRequest.po.vendor} />
                  <Field label="Delivery Date" value={trackedRequest.po.deliveryDate} />
                  <Field label="PO Status" value={trackedRequest.po.status} />
                </div>
              )}

              {trackedRequest.grn && (
                <div className="grid gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 md:grid-cols-4">
                  <Field label="Received" value={quantityLabel(trackedRequest.grn.receivedQuantity, rfqUnitForRequest(trackedRequest))} />
                  <Field label="Damaged" value={quantityLabel(trackedRequest.grn.damagedQuantity, rfqUnitForRequest(trackedRequest))} />
                  <Field label="Accepted" value={quantityLabel(trackedRequest.grn.acceptedQuantity, rfqUnitForRequest(trackedRequest))} />
                  <Field label="Site Verification" value={trackedRequest.grn.siteVerificationStatus} />
                </div>
              )}
            </div>

            <DialogFooter>
              <button onClick={() => setTrackRequestId(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">
                Close
              </button>
              <button
                onClick={() => {
                  openRequestInCurrentContext(trackedRequest.requestId);
                  setTrackRequestId(null);
                }}
                className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-gray-800"
              >
                Open Full Detail
              </button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
    </>
  );
}
