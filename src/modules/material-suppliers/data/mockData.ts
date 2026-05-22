import {
  Supplier, RFQ, Quotation, PurchaseOrder, Delivery, GRN, QualityCheck,
  Invoice, CommunicationLog, AuditLog, ProjectAssociation
} from '../types/supplier.types';

// Helper to get past dates
const daysAgo = (num: number) => {
  const d = new Date();
  d.setDate(d.getDate() - num);
  return d.toISOString().split('T')[0] + ' ' + d.toTimeString().split(' ')[0].substring(0, 5);
};

const dateOnlyAgo = (num: number) => {
  const d = new Date();
  d.setDate(d.getDate() - num);
  return d.toISOString().split('T')[0];
};

export const initialSuppliers: Supplier[] = [
  {
    id: 'V-001',
    name: 'ABC Cement Traders',
    displayName: 'ABC Cement',
    businessType: 'Partnership',
    status: 'Active',
    gstNumber: '21AAAAA1111A1Z1',
    panNumber: 'AAAAA1111A',
    cinNumber: '',
    msmeNumber: 'UDYAM-OD-19-0012345',
    tradeLicenseNumber: 'TL-BBSR-2026-9872',
    establishmentYear: 2012,
    website: 'www.abccement.co.in',
    contact: {
      name: 'Rajesh Kumar',
      designation: 'Managing Partner',
      phone: '9437012345',
      altPhone: '0674-2541234',
      email: 'sales@abccement.co.in',
      whatsapp: '9437012345',
      address: 'Plot No. 120, Mancheswar Industrial Estate',
      city: 'Bhubaneswar',
      state: 'Odisha',
      pincode: '751010',
      serviceAreas: ['Bhubaneswar', 'Cuttack', 'Puri', 'Khordha']
    },
    bank: {
      accountHolderName: 'ABC Cement Traders',
      bankName: 'State Bank of India',
      accountNumber: '31204958671',
      ifscCode: 'SBIN0006408',
      upiId: 'abccement@sbi',
      paymentTerms: '30 Days',
      creditLimit: 1500000,
      advanceRequired: false,
      retentionApplicable: true
    },
    documents: [
      { id: 'D-001', name: 'GST Registration Certificate', type: 'GST Certificate', fileName: 'gst_certificate.pdf', status: 'Verified', uploadedBy: 'Samuel Rodriguez', uploadedDate: dateOnlyAgo(45), expiryDate: '2030-12-31' },
      { id: 'D-002', name: 'PAN Card Copy', type: 'PAN Card', fileName: 'pan_card.pdf', status: 'Verified', uploadedBy: 'Samuel Rodriguez', uploadedDate: dateOnlyAgo(45) },
      { id: 'D-003', name: 'Trade License 2026', type: 'Trade License', fileName: 'trade_license.pdf', status: 'Verified', uploadedBy: 'Samuel Rodriguez', uploadedDate: dateOnlyAgo(10), expiryDate: '2027-03-31' }
    ],
    materials: [
      { id: 'M-001', category: 'Cement', name: 'OPC 53 Grade Cement', brand: 'UltraTech', grade: '53 Grade', unit: 'Bag', moq: 100, rate: 410, taxPercent: 28, validTill: '2026-06-30', availability: 'In Stock' },
      { id: 'M-002', category: 'Cement', name: 'PPC Cement', brand: 'Lafarge Concreto', grade: 'PPC', unit: 'Bag', moq: 150, rate: 380, taxPercent: 28, validTill: '2026-06-30', availability: 'In Stock' },
      { id: 'M-003', category: 'Cement', name: 'Wall Putty', brand: 'Birla White', grade: 'Premium', unit: 'Bag', moq: 50, rate: 750, taxPercent: 18, validTill: '2026-07-15', availability: 'In Stock' }
    ],
    rating: 4.5,
    activeProjects: 3,
    pendingRFQs: 2,
    openPOs: 4,
    outstandingAmount: 245000,
    compliance: 'Complete',
    risk: 'Low'
  },
  {
    id: 'V-002',
    name: 'Shree Steel Suppliers',
    displayName: 'Shree Steel',
    businessType: 'Private Limited',
    status: 'Active',
    gstNumber: '19BBBBB2222B1Z2',
    panNumber: 'BBBBB2222B',
    cinNumber: 'U27109WB2015PTC201234',
    msmeNumber: 'UDYAM-WB-10-0023456',
    tradeLicenseNumber: 'TL-KOL-2026-1045',
    establishmentYear: 2015,
    website: 'www.shreesteels.com',
    contact: {
      name: 'Anirudh Das',
      designation: 'Sales Director',
      phone: '9830054321',
      email: 'contracts@shreesteels.com',
      whatsapp: '9830054321',
      address: '45, Netaji Subhas Road, Clive Row',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700001',
      serviceAreas: ['Kolkata', 'Bhubaneswar', 'Cuttack', 'Raipur', 'Ranchi']
    },
    bank: {
      accountHolderName: 'Shree Steel Suppliers Pvt Ltd',
      bankName: 'HDFC Bank',
      accountNumber: '50200041234567',
      ifscCode: 'HDFC0000014',
      upiId: 'shreesteel@hdfc',
      paymentTerms: '45 Days',
      creditLimit: 5000000,
      advanceRequired: true,
      retentionApplicable: false
    },
    documents: [
      { id: 'D-004', name: 'GST Certificate', type: 'GST Certificate', fileName: 'gst_shree.pdf', status: 'Verified', uploadedBy: 'Samuel Rodriguez', uploadedDate: dateOnlyAgo(60) },
      { id: 'D-005', name: 'MTC - Fe500D Grade', type: 'Material Test Certificate', fileName: 'mtc_fe500d.pdf', status: 'Verified', uploadedBy: 'Samuel Rodriguez', uploadedDate: dateOnlyAgo(5) }
    ],
    materials: [
      { id: 'M-004', category: 'Steel', name: 'TMT Rebar Fe 500D 12mm', brand: 'Tata Tiscon', grade: 'Fe 500D', unit: 'Ton', moq: 5, rate: 64000, taxPercent: 18, validTill: '2026-06-15', availability: 'In Stock' },
      { id: 'M-005', category: 'Steel', name: 'TMT Rebar Fe 500D 16mm', brand: 'Jindal Panther', grade: 'Fe 500D', unit: 'Ton', moq: 5, rate: 63500, taxPercent: 18, validTill: '2026-06-15', availability: 'In Stock' },
      { id: 'M-006', category: 'Steel', name: 'Binding Wire 18 Gauge', brand: 'Local Certified', grade: 'GI 18g', unit: 'Bundle', moq: 10, rate: 1250, taxPercent: 18, validTill: '2026-08-01', availability: 'In Stock' }
    ],
    rating: 4.8,
    activeProjects: 4,
    pendingRFQs: 1,
    openPOs: 3,
    outstandingAmount: 1280000,
    compliance: 'Complete',
    risk: 'Low'
  },
  {
    id: 'V-003',
    name: 'Odisha Sand & Aggregates',
    displayName: 'Odisha Sand & Agg',
    businessType: 'Proprietorship',
    status: 'Active',
    gstNumber: '21CCCCC3333C1Z3',
    panNumber: 'CCCCC3333C',
    tradeLicenseNumber: 'TL-CTC-2026-3021',
    establishmentYear: 2018,
    contact: {
      name: 'Pradeep Jena',
      designation: 'Owner',
      phone: '8249098765',
      email: 'jena.sand@gmail.com',
      address: 'Mahanadi Vihar, Near Barrage',
      city: 'Cuttack',
      state: 'Odisha',
      pincode: '753004',
      serviceAreas: ['Cuttack', 'Bhubaneswar', 'Puri']
    },
    bank: {
      accountHolderName: 'Pradeep Jena',
      bankName: 'ICICI Bank',
      accountNumber: '002301548762',
      ifscCode: 'ICIC0000023',
      paymentTerms: 'Immediate',
      creditLimit: 300000,
      advanceRequired: true,
      retentionApplicable: false
    },
    documents: [
      { id: 'D-006', name: 'GST Certificate', type: 'GST Certificate', fileName: 'gst_jena.pdf', status: 'Verified', uploadedBy: 'Samuel Rodriguez', uploadedDate: dateOnlyAgo(30) }
    ],
    materials: [
      { id: 'M-007', category: 'Sand', name: 'River Sand (Coarse)', brand: 'Mahanadi River', grade: 'Zone II', unit: 'CFT', moq: 500, rate: 35, taxPercent: 5, validTill: '2026-06-30', availability: 'In Stock' },
      { id: 'M-008', category: 'Aggregate', name: 'Crushed Granite Aggregate 20mm', brand: 'Khurda Quarry', grade: '20mm graded', unit: 'CFT', moq: 400, rate: 42, taxPercent: 5, validTill: '2026-06-30', availability: 'In Stock' },
      { id: 'M-009', category: 'Aggregate', name: 'Crushed Granite Aggregate 10mm', brand: 'Khurda Quarry', grade: '10mm graded', unit: 'CFT', moq: 400, rate: 45, taxPercent: 5, validTill: '2026-06-30', availability: 'In Stock' }
    ],
    rating: 4.2,
    activeProjects: 2,
    pendingRFQs: 3,
    openPOs: 2,
    outstandingAmount: 85000,
    compliance: 'Complete',
    risk: 'Medium'
  },
  {
    id: 'V-004',
    name: 'Kalinga Brick Works',
    displayName: 'Kalinga Bricks',
    businessType: 'Partnership',
    status: 'Active',
    gstNumber: '21DDDDD4444D1Z4',
    panNumber: 'DDDDD4444D',
    tradeLicenseNumber: 'TL-PURI-2026-4402',
    establishmentYear: 2010,
    contact: {
      name: 'Sanjay Mohanty',
      designation: 'Partner',
      phone: '9438011223',
      email: 'kalingabricks@hotmail.com',
      address: 'NH-316, near Pipili Flyover',
      city: 'Puri',
      state: 'Odisha',
      pincode: '752104',
      serviceAreas: ['Puri', 'Bhubaneswar', 'Khordha']
    },
    bank: {
      accountHolderName: 'Kalinga Brick Works',
      bankName: 'Axis Bank',
      accountNumber: '915020045612345',
      ifscCode: 'UTIB0000085',
      paymentTerms: '15 Days',
      creditLimit: 500000,
      advanceRequired: false,
      retentionApplicable: false
    },
    documents: [],
    materials: [
      { id: 'M-010', category: 'Bricks', name: 'Fly Ash Bricks (Class A)', brand: 'Kalinga Flyash', grade: 'Class A', unit: 'Piece', moq: 5000, rate: 6.5, taxPercent: 12, validTill: '2026-08-31', availability: 'In Stock' },
      { id: 'M-011', category: 'Bricks', name: 'Red Clay Bricks (Flyash Mix)', brand: 'Kalinga Clay', grade: 'First Class', unit: 'Piece', moq: 5000, rate: 8.0, taxPercent: 12, validTill: '2026-08-31', availability: 'In Stock' }
    ],
    rating: 3.9,
    activeProjects: 1,
    pendingRFQs: 0,
    openPOs: 1,
    outstandingAmount: 48000,
    compliance: 'Pending Documents',
    risk: 'Medium'
  },
  {
    id: 'V-005',
    name: 'Metro Plumbing Supply',
    displayName: 'Metro Plumbing',
    businessType: 'Private Limited',
    status: 'Active',
    gstNumber: '36EEEEE5555E1Z5',
    panNumber: 'EEEEE5555E',
    cinNumber: 'U45309TG2017PTC112345',
    contact: {
      name: 'Ramesh Naidu',
      designation: 'General Manager',
      phone: '9848012345',
      email: 'naidu.metro@metroplumbing.com',
      address: 'Balaji Nagar, Kukatpally',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500072',
      serviceAreas: ['Hyderabad', 'Bangalore', 'Chennai']
    },
    bank: {
      accountHolderName: 'Metro Plumbing Supply Pvt Ltd',
      bankName: 'Kotak Mahindra Bank',
      accountNumber: '8912445892',
      ifscCode: 'KKBK0007452',
      paymentTerms: '30 Days',
      creditLimit: 2000000,
      advanceRequired: false,
      retentionApplicable: true
    },
    documents: [
      { id: 'D-007', name: 'GST Registration Document', type: 'GST Certificate', fileName: 'metro_gst.pdf', status: 'Verified', uploadedBy: 'Samuel Rodriguez', uploadedDate: dateOnlyAgo(28) }
    ],
    materials: [
      { id: 'M-012', category: 'Plumbing', name: 'UPVC Pipe 4 inch 6Kg/cm2', brand: 'Supreme', grade: 'Class III', unit: 'Piece', moq: 20, rate: 950, taxPercent: 18, validTill: '2026-09-30', availability: 'In Stock' },
      { id: 'M-013', category: 'Plumbing', name: 'CPVC Pipe 1 inch SDR 11', brand: 'Astral', grade: 'SDR 11', unit: 'Piece', moq: 50, rate: 420, taxPercent: 18, validTill: '2026-09-30', availability: 'In Stock' }
    ],
    rating: 4.6,
    activeProjects: 3,
    pendingRFQs: 1,
    openPOs: 2,
    outstandingAmount: 180000,
    compliance: 'Complete',
    risk: 'Low'
  },
  {
    id: 'V-006',
    name: 'Eastern Paint Distributors',
    displayName: 'Eastern Paints',
    businessType: 'Partnership',
    status: 'Pending Approval',
    gstNumber: '19FFFFF6666F1Z6',
    panNumber: 'FFFFF6666F',
    contact: {
      name: 'Subrata Mukherjee',
      designation: 'Partner',
      phone: '9007014782',
      email: 'orders@easternpaints.in',
      address: '77, VIP Road, Ultadanga',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700054',
      serviceAreas: ['Kolkata', 'Bhubaneswar', 'Ranchi', 'Guwahati']
    },
    bank: {
      accountHolderName: 'Eastern Paint Distributors',
      bankName: 'IndusInd Bank',
      accountNumber: '201004561234',
      ifscCode: 'INDB0000012',
      paymentTerms: '30 Days',
      creditLimit: 1200000,
      advanceRequired: false,
      retentionApplicable: false
    },
    documents: [
      { id: 'D-008', name: 'PAN Copy', type: 'PAN Card', fileName: 'pan_eastern.pdf', status: 'Pending', uploadedBy: 'Samuel Rodriguez', uploadedDate: dateOnlyAgo(1) }
    ],
    materials: [
      { id: 'M-014', category: 'Paint', name: 'Apex Ultima Exterior Emulsion White', brand: 'Asian Paints', grade: 'Premium Exterior', unit: 'Litre', moq: 100, rate: 290, taxPercent: 18, validTill: '2026-07-31', availability: 'Lead Time Required' },
      { id: 'M-015', category: 'Paint', name: 'Wall Primer Water-based', brand: 'Berger', grade: 'Exterior Primer', unit: 'Litre', moq: 100, rate: 120, taxPercent: 18, validTill: '2026-07-31', availability: 'In Stock' }
    ],
    rating: 0.0,
    activeProjects: 0,
    pendingRFQs: 1,
    openPOs: 0,
    outstandingAmount: 0,
    compliance: 'Action Required',
    risk: 'Pending'
  },
  {
    id: 'V-007',
    name: 'PowerGrid Electricals',
    displayName: 'PowerGrid Elec',
    businessType: 'Private Limited',
    status: 'Active',
    gstNumber: '29GGGGG7777G1Z7',
    panNumber: 'GGGGG7777G',
    cinNumber: 'U31900KA2020PTC120456',
    establishmentYear: 2020,
    website: 'www.powergridelec.com',
    contact: {
      name: 'Karthik Raja',
      designation: 'Commercial Manager',
      phone: '8045127891',
      email: 'b2b@powergridelec.com',
      address: 'Phase 3, Peenya Industrial Area',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560058',
      serviceAreas: ['Bangalore', 'Hyderabad', 'Bhubaneswar']
    },
    bank: {
      accountHolderName: 'PowerGrid Electricals Pvt Ltd',
      bankName: 'Federal Bank',
      accountNumber: '12040200054321',
      ifscCode: 'FDRL0001204',
      paymentTerms: '30 Days',
      creditLimit: 1500000,
      advanceRequired: true,
      retentionApplicable: false
    },
    documents: [],
    materials: [
      { id: 'M-016', category: 'Electrical', name: 'FRLS Copper Wire 2.5 Sqmm', brand: 'Finolex', grade: 'FRLS', unit: 'Bundle', moq: 20, rate: 2150, taxPercent: 18, validTill: '2026-06-30', availability: 'In Stock' },
      { id: 'M-017', category: 'Electrical', name: 'PVC Conduit Pipe 25mm Heavy', brand: 'Anchor', grade: 'Heavy Duty', unit: 'Piece', moq: 100, rate: 85, taxPercent: 18, validTill: '2026-06-30', availability: 'In Stock' }
    ],
    rating: 4.4,
    activeProjects: 2,
    pendingRFQs: 0,
    openPOs: 1,
    outstandingAmount: 155000,
    compliance: 'Pending Documents',
    risk: 'Low'
  },
  {
    id: 'V-008',
    name: 'BuildMart Hardware',
    displayName: 'BuildMart Hard',
    businessType: 'Proprietorship',
    status: 'On Hold',
    gstNumber: '22HHHHH8888H1Z8',
    panNumber: 'HHHHH8888H',
    contact: {
      name: 'Vikas Agarwal',
      designation: 'Owner',
      phone: '7714023456',
      email: 'vikas.buildmart@gmail.com',
      address: 'Loha Bazar, Tatibandh',
      city: 'Raipur',
      state: 'Chhattisgarh',
      pincode: '492001',
      serviceAreas: ['Raipur', 'Bhilai', 'Bilaspur']
    },
    bank: {
      accountHolderName: 'BuildMart Hardware',
      bankName: 'IDBI Bank',
      accountNumber: '04510400012345',
      ifscCode: 'IBKL0000045',
      paymentTerms: '15 Days',
      creditLimit: 600000,
      advanceRequired: false,
      retentionApplicable: false
    },
    documents: [],
    materials: [
      { id: 'M-018', category: 'Hardware', name: 'Stainless Steel Butt Hinges 4 inch', brand: 'Godrej', grade: 'Grade 304', unit: 'Pair', moq: 50, rate: 180, taxPercent: 18, validTill: '2026-08-31', availability: 'In Stock' },
      { id: 'M-019', category: 'Hardware', name: 'Mortise Door Lock Brass', brand: 'Link', grade: 'Heavy Double Action', unit: 'Set', moq: 10, rate: 1250, taxPercent: 18, validTill: '2026-08-31', availability: 'In Stock' }
    ],
    rating: 4.0,
    activeProjects: 1,
    pendingRFQs: 0,
    openPOs: 0,
    outstandingAmount: 90000,
    compliance: 'Pending Documents',
    risk: 'High'
  },
  {
    id: 'V-009',
    name: 'UltraBuild Waterproofing',
    displayName: 'UltraBuild',
    businessType: 'LLP',
    status: 'Active',
    gstNumber: '20JJJJJ9999J1Z9',
    panNumber: 'JJJJJ9999J',
    contact: {
      name: 'Amitabh Sen',
      designation: 'Managing Partner',
      phone: '6512547890',
      email: 'projects@ultrabuild.in',
      address: 'Main Road, Lalpur',
      city: 'Ranchi',
      state: 'Jharkhand',
      pincode: '834001',
      serviceAreas: ['Ranchi', 'Jamshedpur', 'Kolkata', 'Bhubaneswar']
    },
    bank: {
      accountHolderName: 'UltraBuild Waterproofing LLP',
      bankName: 'Yes Bank',
      accountNumber: '002590100054321',
      ifscCode: 'YESB0000025',
      paymentTerms: '30 Days',
      creditLimit: 1000000,
      advanceRequired: false,
      retentionApplicable: true
    },
    documents: [
      { id: 'D-009', name: 'LLP Registration Deed', type: 'Supplier Agreement', fileName: 'llp_deed.pdf', status: 'Verified', uploadedBy: 'Samuel Rodriguez', uploadedDate: dateOnlyAgo(15) }
    ],
    materials: [
      { id: 'M-020', category: 'Waterproofing', name: 'Dr. Fixit Pidiproof LW+', brand: 'Pidilite', grade: 'LW+ liquid', unit: 'Litre', moq: 50, rate: 165, taxPercent: 18, validTill: '2026-06-30', availability: 'In Stock' },
      { id: 'M-021', category: 'Waterproofing', name: 'SmartCare Damp Proof 20L', brand: 'Asian Paints', grade: 'Damp Proof', unit: 'Bucket', moq: 10, rate: 6800, taxPercent: 18, validTill: '2026-06-30', availability: 'In Stock' }
    ],
    rating: 4.3,
    activeProjects: 2,
    pendingRFQs: 1,
    openPOs: 1,
    outstandingAmount: 220000,
    compliance: 'Complete',
    risk: 'Low'
  },
  {
    id: 'V-010',
    name: 'City Construction Consumables',
    displayName: 'City Consumables',
    businessType: 'Individual',
    status: 'Blacklisted',
    gstNumber: '21KKKKK1010K1ZA',
    panNumber: 'KKKKK1010K',
    contact: {
      name: 'Manoj Sahoo',
      designation: 'Proprietor',
      phone: '9937088990',
      email: 'manoj.sahoo@yahoo.com',
      address: 'Rasulgarh Square',
      city: 'Bhubaneswar',
      state: 'Odisha',
      pincode: '751007',
      serviceAreas: ['Bhubaneswar', 'Khordha']
    },
    bank: {
      accountHolderName: 'Manoj Sahoo',
      bankName: 'Canara Bank',
      accountNumber: '034010104523',
      ifscCode: 'CNRB0000340',
      paymentTerms: 'Immediate',
      creditLimit: 100000,
      advanceRequired: true,
      retentionApplicable: false
    },
    documents: [],
    materials: [
      { id: 'M-022', category: 'Consumables', name: 'Nails 3 inch wire', brand: 'Local', grade: 'Standard', unit: 'Kg', moq: 50, rate: 85, taxPercent: 18, validTill: '2026-05-15', availability: 'Out of Stock' },
      { id: 'M-023', category: 'Consumables', name: 'Safety Helmet Yellow', brand: 'Karam', grade: 'IS Certified', unit: 'Piece', moq: 20, rate: 140, taxPercent: 18, validTill: '2026-05-15', availability: 'Out of Stock' }
    ],
    rating: 2.1,
    activeProjects: 0,
    pendingRFQs: 0,
    openPOs: 0,
    outstandingAmount: 0,
    compliance: 'None',
    risk: 'High'
  }
];

export const initialRFQs: RFQ[] = [
  {
    id: 'RFQ-001',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(10),
    deliveryDate: dateOnlyAgo(-5),
    dueDate: dateOnlyAgo(2),
    status: 'Sent',
    items: [
      { category: 'Cement', name: 'OPC 53 Grade Cement', quantity: 500, unit: 'Bag', expectedRate: 400 },
      { category: 'Cement', name: 'PPC Cement', quantity: 200, unit: 'Bag', expectedRate: 370 }
    ],
    termsAndConditions: 'F.O.R Site delivery required. Material test certificates needed.',
    attachments: ['boq_excerpt_cement.pdf'],
    vendorResponsesCount: 1
  },
  {
    id: 'RFQ-002',
    project: 'Metro Mall Extension',
    siteLocation: 'Salt Lake, Kolkata',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(8),
    deliveryDate: dateOnlyAgo(-10),
    dueDate: dateOnlyAgo(1),
    status: 'Quoted',
    items: [
      { category: 'Steel', name: 'TMT Rebar Fe 500D 12mm', quantity: 15, unit: 'Ton', expectedRate: 63000 },
      { category: 'Steel', name: 'TMT Rebar Fe 500D 16mm', quantity: 10, unit: 'Ton', expectedRate: 63000 }
    ],
    termsAndConditions: 'Price validity min 30 days. Payment terms: 45 days after delivery.',
    attachments: ['structural_drawing_rebars.pdf'],
    vendorResponsesCount: 2
  },
  {
    id: 'RFQ-003',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(6),
    deliveryDate: dateOnlyAgo(-20),
    dueDate: dateOnlyAgo(-1),
    status: 'Quoted',
    items: [
      { category: 'Aggregate', name: 'Crushed Granite Aggregate 20mm', quantity: 2000, unit: 'CFT', expectedRate: 40 },
      { category: 'Sand', name: 'River Sand (Coarse)', quantity: 3000, unit: 'CFT', expectedRate: 32 }
    ],
    attachments: [],
    vendorResponsesCount: 1
  },
  {
    id: 'RFQ-004',
    project: 'Riverfront Villas',
    siteLocation: 'Trishulia, Cuttack',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(4),
    deliveryDate: dateOnlyAgo(-8),
    dueDate: dateOnlyAgo(4),
    status: 'Sent',
    items: [
      { category: 'Bricks', name: 'Fly Ash Bricks (Class A)', quantity: 15000, unit: 'Piece', expectedRate: 6 }
    ],
    attachments: [],
    vendorResponsesCount: 0
  },
  {
    id: 'RFQ-005',
    project: 'Greenfield Hospital',
    siteLocation: 'Chhend, Rourkela',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(12),
    deliveryDate: dateOnlyAgo(-2),
    dueDate: dateOnlyAgo(-3),
    status: 'Expired',
    items: [
      { category: 'Waterproofing', name: 'Dr. Fixit Pidiproof LW+', quantity: 200, unit: 'Litre', expectedRate: 160 }
    ],
    attachments: [],
    vendorResponsesCount: 1
  },
  {
    id: 'RFQ-006',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(2),
    deliveryDate: dateOnlyAgo(-15),
    dueDate: dateOnlyAgo(5),
    status: 'Draft',
    items: [
      { category: 'Plumbing', name: 'UPVC Pipe 4 inch 6Kg/cm2', quantity: 150, unit: 'Piece', expectedRate: 900 }
    ],
    attachments: [],
    vendorResponsesCount: 0
  },
  {
    id: 'RFQ-007',
    project: 'Metro Mall Extension',
    siteLocation: 'Salt Lake, Kolkata',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(15),
    deliveryDate: dateOnlyAgo(2),
    dueDate: dateOnlyAgo(-5),
    status: 'Converted to PO',
    items: [
      { category: 'Paint', name: 'Apex Ultima Exterior Emulsion White', quantity: 500, unit: 'Litre', expectedRate: 280 }
    ],
    attachments: [],
    vendorResponsesCount: 1
  },
  {
    id: 'RFQ-008',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(9),
    deliveryDate: dateOnlyAgo(-4),
    dueDate: dateOnlyAgo(1),
    status: 'Viewed',
    items: [
      { category: 'Electrical', name: 'FRLS Copper Wire 2.5 Sqmm', quantity: 50, unit: 'Bundle', expectedRate: 2100 }
    ],
    attachments: [],
    vendorResponsesCount: 0
  },
  {
    id: 'RFQ-009',
    project: 'Greenfield Hospital',
    siteLocation: 'Chhend, Rourkela',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(7),
    deliveryDate: dateOnlyAgo(-12),
    dueDate: dateOnlyAgo(3),
    status: 'Sent',
    items: [
      { category: 'Hardware', name: 'Stainless Steel Butt Hinges 4 inch', quantity: 200, unit: 'Pair', expectedRate: 170 }
    ],
    attachments: [],
    vendorResponsesCount: 0
  },
  {
    id: 'RFQ-010',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    requestedBy: 'Samuel Rodriguez',
    requestedDate: dateOnlyAgo(1),
    deliveryDate: dateOnlyAgo(-25),
    dueDate: dateOnlyAgo(7),
    status: 'Sent',
    items: [
      { category: 'Cement', name: 'OPC 53 Grade Cement', quantity: 1000, unit: 'Bag', expectedRate: 405 }
    ],
    attachments: [],
    vendorResponsesCount: 0
  }
];

export const initialQuotations: Quotation[] = [
  {
    id: 'QT-001',
    rfqId: 'RFQ-001',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Skyline Residency',
    validTill: dateOnlyAgo(-10),
    deliveryLeadTime: '2 days',
    items: [
      { materialName: 'OPC 53 Grade Cement', requestedQty: 500, unit: 'Bag', quotedRate: 410, availableQty: 1000, deliveryDays: 2 },
      { materialName: 'PPC Cement', requestedQty: 200, unit: 'Bag', quotedRate: 380, availableQty: 1500, deliveryDays: 2 }
    ],
    taxAmount: 78680, // 28% tax on cement
    transportCharges: 5000,
    loadingCharges: 1500,
    discount: 2000,
    totalAmount: 364180, // (500*410 + 200*380) = 281000. 28% tax on 281k = 78680. Total = 364180 with charges
    paymentTerms: '30 Days',
    remarks: 'Ready stock available. Standard manufacturer warranties apply.',
    attachments: ['quotation_abc_001.pdf'],
    status: 'Submitted',
    submittedDate: dateOnlyAgo(8)
  },
  {
    id: 'QT-002',
    rfqId: 'RFQ-002',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    project: 'Metro Mall Extension',
    validTill: dateOnlyAgo(-15),
    deliveryLeadTime: '4 days',
    items: [
      { materialName: 'TMT Rebar Fe 500D 12mm', requestedQty: 15, unit: 'Ton', quotedRate: 64000, availableQty: 50, deliveryDays: 4 },
      { materialName: 'TMT Rebar Fe 500D 16mm', requestedQty: 10, unit: 'Ton', quotedRate: 63500, availableQty: 40, deliveryDays: 4 }
    ],
    taxAmount: 287100, // 18%
    transportCharges: 18000,
    loadingCharges: 4000,
    discount: 5000,
    totalAmount: 1899100,
    paymentTerms: '45 Days',
    status: 'Approved',
    submittedDate: dateOnlyAgo(6)
  },
  {
    id: 'QT-003',
    rfqId: 'RFQ-003',
    supplierId: 'V-003',
    supplierName: 'Odisha Sand & Aggregates',
    project: 'Kalinga Tech Park',
    validTill: dateOnlyAgo(-5),
    deliveryLeadTime: '1 day',
    items: [
      { materialName: 'River Sand (Coarse)', requestedQty: 3000, unit: 'CFT', quotedRate: 35, availableQty: 10000, deliveryDays: 1 },
      { materialName: 'Crushed Granite Aggregate 20mm', requestedQty: 2000, unit: 'CFT', quotedRate: 42, availableQty: 5000, deliveryDays: 1 }
    ],
    taxAmount: 9450, // 5%
    transportCharges: 15000,
    loadingCharges: 3000,
    discount: 1000,
    totalAmount: 215450,
    paymentTerms: 'Immediate',
    status: 'Under Review',
    submittedDate: dateOnlyAgo(5)
  },
  {
    id: 'QT-004',
    rfqId: 'RFQ-005',
    supplierId: 'V-009',
    supplierName: 'UltraBuild Waterproofing',
    project: 'Greenfield Hospital',
    validTill: dateOnlyAgo(-1),
    deliveryLeadTime: '3 days',
    items: [
      { materialName: 'Dr. Fixit Pidiproof LW+', requestedQty: 200, unit: 'Litre', quotedRate: 165, availableQty: 500, deliveryDays: 3 }
    ],
    taxAmount: 5940, // 18%
    transportCharges: 1500,
    loadingCharges: 200,
    discount: 500,
    totalAmount: 40140,
    paymentTerms: '30 Days',
    status: 'Expired',
    submittedDate: dateOnlyAgo(10)
  },
  {
    id: 'QT-005',
    rfqId: 'RFQ-007',
    supplierId: 'V-006',
    supplierName: 'Eastern Paint Distributors',
    project: 'Metro Mall Extension',
    validTill: dateOnlyAgo(10),
    deliveryLeadTime: '5 days',
    items: [
      { materialName: 'Apex Ultima Exterior Emulsion White', requestedQty: 500, unit: 'Litre', quotedRate: 290, availableQty: 500, deliveryDays: 5 }
    ],
    taxAmount: 26100, // 18%
    transportCharges: 3000,
    loadingCharges: 500,
    discount: 1000,
    totalAmount: 173600,
    paymentTerms: '30 Days',
    status: 'Converted to PO',
    submittedDate: dateOnlyAgo(12)
  },
  {
    id: 'QT-006',
    rfqId: 'RFQ-002',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Metro Mall Extension',
    validTill: dateOnlyAgo(-12),
    deliveryLeadTime: '3 days',
    items: [
      { materialName: 'Wall Putty', requestedQty: 100, unit: 'Bag', quotedRate: 740, availableQty: 300, deliveryDays: 3 }
    ],
    taxAmount: 13320,
    transportCharges: 2000,
    loadingCharges: 500,
    discount: 500,
    totalAmount: 89320,
    paymentTerms: '30 Days',
    status: 'Rejected',
    submittedDate: dateOnlyAgo(7)
  },
  {
    id: 'QT-007',
    rfqId: 'RFQ-001',
    supplierId: 'V-003',
    supplierName: 'Odisha Sand & Aggregates',
    project: 'Skyline Residency',
    validTill: dateOnlyAgo(2),
    deliveryLeadTime: '2 days',
    items: [
      { materialName: 'River Sand (Coarse)', requestedQty: 100, unit: 'CFT', quotedRate: 38, availableQty: 5000, deliveryDays: 1 }
    ],
    taxAmount: 190,
    transportCharges: 1000,
    loadingCharges: 200,
    discount: 0,
    totalAmount: 5190,
    paymentTerms: 'Immediate',
    status: 'Under Review',
    submittedDate: dateOnlyAgo(2)
  },
  {
    id: 'QT-008',
    rfqId: 'RFQ-008',
    supplierId: 'V-007',
    supplierName: 'PowerGrid Electricals',
    project: 'Kalinga Tech Park',
    validTill: dateOnlyAgo(8),
    deliveryLeadTime: '3 days',
    items: [
      { materialName: 'FRLS Copper Wire 2.5 Sqmm', requestedQty: 50, unit: 'Bundle', quotedRate: 2150, availableQty: 200, deliveryDays: 3 }
    ],
    taxAmount: 19350,
    transportCharges: 2500,
    loadingCharges: 200,
    discount: 1000,
    totalAmount: 128550,
    paymentTerms: '30 Days',
    status: 'Submitted',
    submittedDate: dateOnlyAgo(1)
  },
  {
    id: 'QT-009',
    rfqId: 'RFQ-009',
    supplierId: 'V-008',
    supplierName: 'BuildMart Hardware',
    project: 'Greenfield Hospital',
    validTill: dateOnlyAgo(5),
    deliveryLeadTime: '4 days',
    items: [
      { materialName: 'Stainless Steel Butt Hinges 4 inch', requestedQty: 200, unit: 'Pair', quotedRate: 180, availableQty: 250, deliveryDays: 4 }
    ],
    taxAmount: 6480,
    transportCharges: 1500,
    loadingCharges: 200,
    discount: 500,
    totalAmount: 43680,
    paymentTerms: '15 Days',
    status: 'Draft',
    submittedDate: dateOnlyAgo(1)
  },
  {
    id: 'QT-010',
    rfqId: 'RFQ-010',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Skyline Residency',
    validTill: dateOnlyAgo(6),
    deliveryLeadTime: '2 days',
    items: [
      { materialName: 'OPC 53 Grade Cement', requestedQty: 1000, unit: 'Bag', quotedRate: 405, availableQty: 2000, deliveryDays: 2 }
    ],
    taxAmount: 113400,
    transportCharges: 8000,
    loadingCharges: 3000,
    discount: 5000,
    totalAmount: 524400,
    paymentTerms: '30 Days',
    status: 'Submitted',
    submittedDate: dateOnlyAgo(1)
  }
];

export const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'PO-001',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    deliveryAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    expectedDeliveryDate: dateOnlyAgo(-5),
    items: [
      { category: 'Cement', name: 'OPC 53 Grade Cement', quantity: 500, unit: 'Bag', rate: 410, taxPercent: 28, amount: 205000 },
      { category: 'Cement', name: 'PPC Cement', quantity: 200, unit: 'Bag', rate: 380, taxPercent: 28, amount: 76000 }
    ],
    subtotal: 281000,
    taxAmount: 78680,
    discountAmount: 2000,
    transportCharges: 5000,
    grandTotal: 362680,
    paymentTerms: '30 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    attachments: ['po_approved_signed.pdf'],
    approvalStatus: 'Approved',
    deliveryStatus: 'Delivered',
    paymentStatus: 'Paid',
    createdDate: dateOnlyAgo(15),
    approvedDate: dateOnlyAgo(14),
    approvedBy: 'Samuel Rodriguez'
  },
  {
    id: 'PO-002',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    project: 'Metro Mall Extension',
    siteLocation: 'Salt Lake, Kolkata',
    deliveryAddress: 'Block GP, Sector V, Salt Lake City',
    expectedDeliveryDate: dateOnlyAgo(-2),
    items: [
      { category: 'Steel', name: 'TMT Rebar Fe 500D 12mm', quantity: 15, unit: 'Ton', rate: 64000, taxPercent: 18, amount: 960000 },
      { category: 'Steel', name: 'TMT Rebar Fe 500D 16mm', quantity: 10, unit: 'Ton', rate: 63500, taxPercent: 18, amount: 635000 }
    ],
    subtotal: 1595000,
    taxAmount: 287100,
    discountAmount: 5000,
    transportCharges: 18000,
    grandTotal: 1895100,
    paymentTerms: '45 Days',
    billingAddress: 'BIMBOX Hub West Bengal Office, Park Street, Kolkata',
    shippingAddress: 'Block GP, Sector V, Salt Lake City',
    attachments: [],
    approvalStatus: 'Sent to Supplier',
    deliveryStatus: 'In Transit',
    paymentStatus: 'Unpaid',
    createdDate: dateOnlyAgo(10)
  },
  {
    id: 'PO-003',
    supplierId: 'V-003',
    supplierName: 'Odisha Sand & Aggregates',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    deliveryAddress: 'Tech Tower C Site, Infocity Phase II',
    expectedDeliveryDate: dateOnlyAgo(-1),
    items: [
      { category: 'Sand', name: 'River Sand (Coarse)', quantity: 3000, unit: 'CFT', rate: 35, taxPercent: 5, amount: 105000 },
      { category: 'Aggregate', name: 'Crushed Granite Aggregate 20mm', quantity: 2000, unit: 'CFT', rate: 42, taxPercent: 5, amount: 84000 }
    ],
    subtotal: 189000,
    taxAmount: 9450,
    discountAmount: 1000,
    transportCharges: 15000,
    grandTotal: 212450,
    paymentTerms: 'Immediate',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Tech Tower C Site, Infocity Phase II',
    attachments: [],
    approvalStatus: 'Accepted by Supplier',
    deliveryStatus: 'Scheduled',
    paymentStatus: 'Partially Paid',
    createdDate: dateOnlyAgo(5)
  },
  {
    id: 'PO-004',
    supplierId: 'V-004',
    supplierName: 'Kalinga Brick Works',
    project: 'Riverfront Villas',
    siteLocation: 'Trishulia, Cuttack',
    deliveryAddress: 'Mahanadi Riverfront Road, Trishulia',
    expectedDeliveryDate: dateOnlyAgo(-4),
    items: [
      { category: 'Bricks', name: 'Fly Ash Bricks (Class A)', quantity: 15000, unit: 'Piece', rate: 6.5, taxPercent: 12, amount: 97500 }
    ],
    subtotal: 97500,
    taxAmount: 11700,
    discountAmount: 0,
    transportCharges: 8000,
    grandTotal: 117200,
    paymentTerms: '15 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Mahanadi Riverfront Road, Trishulia',
    attachments: [],
    approvalStatus: 'Approved',
    deliveryStatus: 'Delivered',
    paymentStatus: 'Paid',
    createdDate: dateOnlyAgo(12)
  },
  {
    id: 'PO-005',
    supplierId: 'V-005',
    supplierName: 'Metro Plumbing Supply',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    deliveryAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    expectedDeliveryDate: dateOnlyAgo(3),
    items: [
      { category: 'Plumbing', name: 'UPVC Pipe 4 inch 6Kg/cm2', quantity: 100, unit: 'Piece', rate: 950, taxPercent: 18, amount: 95000 },
      { category: 'Plumbing', name: 'CPVC Pipe 1 inch SDR 11', quantity: 150, unit: 'Piece', rate: 420, taxPercent: 18, amount: 63000 }
    ],
    subtotal: 158000,
    taxAmount: 28440,
    discountAmount: 2000,
    transportCharges: 3000,
    grandTotal: 187440,
    paymentTerms: '30 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    attachments: [],
    approvalStatus: 'Draft',
    deliveryStatus: 'Not Scheduled',
    paymentStatus: 'Unpaid',
    createdDate: dateOnlyAgo(1)
  },
  {
    id: 'PO-006',
    supplierId: 'V-009',
    supplierName: 'UltraBuild Waterproofing',
    project: 'Greenfield Hospital',
    siteLocation: 'Chhend, Rourkela',
    deliveryAddress: 'Hospital Site, Sector 5, Rourkela',
    expectedDeliveryDate: dateOnlyAgo(5),
    items: [
      { category: 'Waterproofing', name: 'Dr. Fixit Pidiproof LW+', quantity: 150, unit: 'Litre', rate: 165, taxPercent: 18, amount: 24750 }
    ],
    subtotal: 24750,
    taxAmount: 4455,
    discountAmount: 500,
    transportCharges: 1000,
    grandTotal: 29705,
    paymentTerms: '30 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Hospital Site, Sector 5, Rourkela',
    attachments: [],
    approvalStatus: 'Pending Approval',
    deliveryStatus: 'Not Scheduled',
    paymentStatus: 'Unpaid',
    createdDate: dateOnlyAgo(2)
  },
  {
    id: 'PO-007',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Riverfront Villas',
    siteLocation: 'Trishulia, Cuttack',
    deliveryAddress: 'Mahanadi Riverfront Road, Trishulia',
    expectedDeliveryDate: dateOnlyAgo(-10),
    items: [
      { category: 'Cement', name: 'OPC 53 Grade Cement', quantity: 300, unit: 'Bag', rate: 410, taxPercent: 28, amount: 123000 }
    ],
    subtotal: 123000,
    taxAmount: 34440,
    discountAmount: 1000,
    transportCharges: 4000,
    grandTotal: 160440,
    paymentTerms: '30 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Mahanadi Riverfront Road, Trishulia',
    attachments: [],
    approvalStatus: 'Approved',
    deliveryStatus: 'Delivered',
    paymentStatus: 'Paid',
    createdDate: dateOnlyAgo(20),
    approvedDate: dateOnlyAgo(19),
    approvedBy: 'Samuel Rodriguez'
  },
  {
    id: 'PO-008',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    deliveryAddress: 'Tech Tower C Site, Infocity Phase II',
    expectedDeliveryDate: dateOnlyAgo(-12),
    items: [
      { category: 'Cement', name: 'OPC 53 Grade Cement', quantity: 800, unit: 'Bag', rate: 410, taxPercent: 28, amount: 328000 }
    ],
    subtotal: 328000,
    taxAmount: 91840,
    discountAmount: 3000,
    transportCharges: 8000,
    grandTotal: 424840,
    paymentTerms: '30 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Tech Tower C Site, Infocity Phase II',
    attachments: [],
    approvalStatus: 'Approved',
    deliveryStatus: 'Delivered',
    paymentStatus: 'Unpaid',
    createdDate: dateOnlyAgo(22),
    approvedDate: dateOnlyAgo(21),
    approvedBy: 'Samuel Rodriguez'
  },
  {
    id: 'PO-009',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    deliveryAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    expectedDeliveryDate: dateOnlyAgo(-15),
    items: [
      { category: 'Steel', name: 'TMT Rebar Fe 500D 12mm', quantity: 20, unit: 'Ton', rate: 64000, taxPercent: 18, amount: 1280000 }
    ],
    subtotal: 1280000,
    taxAmount: 230400,
    discountAmount: 4000,
    transportCharges: 15000,
    grandTotal: 1521400,
    paymentTerms: '45 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    attachments: [],
    approvalStatus: 'Approved',
    deliveryStatus: 'Delivered',
    paymentStatus: 'Paid',
    createdDate: dateOnlyAgo(30),
    approvedDate: dateOnlyAgo(29),
    approvedBy: 'Samuel Rodriguez'
  },
  {
    id: 'PO-010',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    deliveryAddress: 'Tech Tower C Site, Infocity Phase II',
    expectedDeliveryDate: dateOnlyAgo(-18),
    items: [
      { category: 'Steel', name: 'TMT Rebar Fe 500D 16mm', quantity: 15, unit: 'Ton', rate: 63500, taxPercent: 18, amount: 952500 }
    ],
    subtotal: 952500,
    taxAmount: 171450,
    discountAmount: 3000,
    transportCharges: 12000,
    grandTotal: 1132950,
    paymentTerms: '45 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Tech Tower C Site, Infocity Phase II',
    attachments: [],
    approvalStatus: 'Approved',
    deliveryStatus: 'Delivered',
    paymentStatus: 'Partially Paid',
    createdDate: dateOnlyAgo(35),
    approvedDate: dateOnlyAgo(34),
    approvedBy: 'Samuel Rodriguez'
  },
  {
    id: 'PO-011',
    supplierId: 'V-003',
    supplierName: 'Odisha Sand & Aggregates',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    deliveryAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    expectedDeliveryDate: dateOnlyAgo(-22),
    items: [
      { category: 'Sand', name: 'River Sand (Coarse)', quantity: 2000, unit: 'CFT', rate: 35, taxPercent: 5, amount: 70000 }
    ],
    subtotal: 70000,
    taxAmount: 3500,
    discountAmount: 500,
    transportCharges: 8000,
    grandTotal: 81000,
    paymentTerms: 'Immediate',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    attachments: [],
    approvalStatus: 'Approved',
    deliveryStatus: 'Delivered',
    paymentStatus: 'Paid',
    createdDate: dateOnlyAgo(25)
  },
  {
    id: 'PO-012',
    supplierId: 'V-005',
    supplierName: 'Metro Plumbing Supply',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    deliveryAddress: 'Tech Tower C Site, Infocity Phase II',
    expectedDeliveryDate: dateOnlyAgo(-25),
    items: [
      { category: 'Plumbing', name: 'UPVC Pipe 4 inch 6Kg/cm2', quantity: 200, unit: 'Piece', rate: 950, taxPercent: 18, amount: 190000 }
    ],
    subtotal: 190000,
    taxAmount: 34200,
    discountAmount: 2000,
    transportCharges: 4000,
    grandTotal: 226200,
    paymentTerms: '30 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Tech Tower C Site, Infocity Phase II',
    attachments: [],
    approvalStatus: 'Approved',
    deliveryStatus: 'Delivered',
    paymentStatus: 'Paid',
    createdDate: dateOnlyAgo(40)
  },
  {
    id: 'PO-013',
    supplierId: 'V-007',
    supplierName: 'PowerGrid Electricals',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    deliveryAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    expectedDeliveryDate: dateOnlyAgo(-28),
    items: [
      { category: 'Electrical', name: 'FRLS Copper Wire 2.5 Sqmm', quantity: 80, unit: 'Bundle', rate: 2150, taxPercent: 18, amount: 172000 }
    ],
    subtotal: 172000,
    taxAmount: 30960,
    discountAmount: 1500,
    transportCharges: 3000,
    grandTotal: 204460,
    paymentTerms: '30 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    attachments: [],
    approvalStatus: 'Approved',
    deliveryStatus: 'Delivered',
    paymentStatus: 'Paid',
    createdDate: dateOnlyAgo(42)
  },
  {
    id: 'PO-014',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    deliveryAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    expectedDeliveryDate: dateOnlyAgo(1),
    items: [
      { category: 'Cement', name: 'OPC 53 Grade Cement', quantity: 400, unit: 'Bag', rate: 410, taxPercent: 28, amount: 164000 }
    ],
    subtotal: 164000,
    taxAmount: 45920,
    discountAmount: 1000,
    transportCharges: 3000,
    grandTotal: 211920,
    paymentTerms: '30 Days',
    billingAddress: 'BIMBOX Hub Construction Office, Janpath, BBSR',
    shippingAddress: 'Plot A-23, Patia Main Road, near Infocity Gate',
    attachments: [],
    approvalStatus: 'Approved',
    deliveryStatus: 'Scheduled',
    paymentStatus: 'Unpaid',
    createdDate: dateOnlyAgo(3)
  },
  {
    id: 'PO-015',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    project: 'Metro Mall Extension',
    siteLocation: 'Salt Lake, Kolkata',
    deliveryAddress: 'Block GP, Sector V, Salt Lake City',
    expectedDeliveryDate: dateOnlyAgo(10),
    items: [
      { category: 'Steel', name: 'TMT Rebar Fe 500D 12mm', quantity: 8, unit: 'Ton', rate: 64000, taxPercent: 18, amount: 512000 }
    ],
    subtotal: 512000,
    taxAmount: 92160,
    discountAmount: 2000,
    transportCharges: 6000,
    grandTotal: 608160,
    paymentTerms: '45 Days',
    billingAddress: 'BIMBOX Hub West Bengal Office, Park Street, Kolkata',
    shippingAddress: 'Block GP, Sector V, Salt Lake City',
    attachments: [],
    approvalStatus: 'Pending Approval',
    deliveryStatus: 'Not Scheduled',
    paymentStatus: 'Unpaid',
    createdDate: dateOnlyAgo(1)
  }
];

export const initialDeliveries: Delivery[] = [
  {
    id: 'DEL-001',
    poId: 'PO-001',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    deliveryDate: dateOnlyAgo(6),
    vehicleNumber: 'OD-33-F-4567',
    driverName: 'Sarat Maharana',
    driverPhone: '9861098765',
    challanNumber: 'CH-ABC-4591',
    items: [
      { materialName: 'OPC 53 Grade Cement', orderedQty: 500, dispatchQty: 500, receivedQty: 500, acceptedQty: 498, rejectedQty: 2, unit: 'Bag', batchNumber: 'B-OCT26-04', remarks: '2 bags damaged due to moisture.' },
      { materialName: 'PPC Cement', orderedQty: 200, dispatchQty: 200, receivedQty: 200, acceptedQty: 200, rejectedQty: 0, unit: 'Bag', batchNumber: 'B-PPC26-11' }
    ],
    status: 'Delivered',
    grnStatus: 'Generated',
    grnId: 'GRN-001',
    attachments: ['delivery_challan_scan.pdf'],
    remarks: 'Received in good condition overall.'
  },
  {
    id: 'DEL-002',
    poId: 'PO-002',
    project: 'Metro Mall Extension',
    siteLocation: 'Salt Lake, Kolkata',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    deliveryDate: dateOnlyAgo(1),
    vehicleNumber: 'WB-23-E-8877',
    driverName: 'Harpreet Singh',
    driverPhone: '9831123456',
    challanNumber: 'SH-ST-2026-102',
    items: [
      { materialName: 'TMT Rebar Fe 500D 12mm', orderedQty: 15, dispatchQty: 15, unit: 'Ton', batchNumber: 'HT-4591-B' },
      { materialName: 'TMT Rebar Fe 500D 16mm', orderedQty: 10, dispatchQty: 10, unit: 'Ton', batchNumber: 'HT-4592-A' }
    ],
    status: 'In Transit',
    grnStatus: 'Pending',
    attachments: [],
    remarks: 'Dispatched from Durgapur plant. Expected at site tomorrow morning.'
  },
  {
    id: 'DEL-003',
    poId: 'PO-004',
    project: 'Riverfront Villas',
    siteLocation: 'Trishulia, Cuttack',
    supplierId: 'V-004',
    supplierName: 'Kalinga Brick Works',
    deliveryDate: dateOnlyAgo(5),
    vehicleNumber: 'OD-05-AB-7890',
    driverName: 'Kartik Rout',
    driverPhone: '8917024567',
    challanNumber: 'KB-CH-12495',
    items: [
      { materialName: 'Fly Ash Bricks (Class A)', orderedQty: 15000, dispatchQty: 15000, receivedQty: 15000, acceptedQty: 14850, rejectedQty: 150, unit: 'Piece', remarks: '150 bricks broken during transit.' }
    ],
    status: 'Delivered',
    grnStatus: 'Generated',
    grnId: 'GRN-002',
    attachments: [],
    remarks: 'Delivered at Riverfront Site B.'
  },
  {
    id: 'DEL-004',
    poId: 'PO-007',
    project: 'Riverfront Villas',
    siteLocation: 'Trishulia, Cuttack',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    deliveryDate: dateOnlyAgo(9),
    vehicleNumber: 'OD-33-F-1289',
    driverName: 'Babul Naik',
    driverPhone: '9439056231',
    challanNumber: 'CH-ABC-4482',
    items: [
      { materialName: 'OPC 53 Grade Cement', orderedQty: 300, dispatchQty: 300, receivedQty: 300, acceptedQty: 300, rejectedQty: 0, unit: 'Bag', batchNumber: 'B-OCT26-02' }
    ],
    status: 'Delivered',
    grnStatus: 'Generated',
    grnId: 'GRN-003',
    attachments: [],
    remarks: 'Delivered successfully.'
  },
  {
    id: 'DEL-005',
    poId: 'PO-008',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    deliveryDate: dateOnlyAgo(11),
    vehicleNumber: 'OD-33-G-9081',
    driverName: 'Sukumar Jena',
    driverPhone: '7894012345',
    challanNumber: 'CH-ABC-4401',
    items: [
      { materialName: 'OPC 53 Grade Cement', orderedQty: 800, dispatchQty: 800, receivedQty: 800, acceptedQty: 800, rejectedQty: 0, unit: 'Bag', batchNumber: 'B-OCT26-01' }
    ],
    status: 'Delivered',
    grnStatus: 'Generated',
    grnId: 'GRN-004',
    attachments: [],
    remarks: 'Delivered in multiple trucks.'
  },
  {
    id: 'DEL-006',
    poId: 'PO-009',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    deliveryDate: dateOnlyAgo(14),
    vehicleNumber: 'OD-33-D-0923',
    driverName: 'Ravinder Singh',
    driverPhone: '9938012345',
    challanNumber: 'SH-ST-2026-085',
    items: [
      { materialName: 'TMT Rebar Fe 500D 12mm', orderedQty: 20, dispatchQty: 20, receivedQty: 20, acceptedQty: 20, rejectedQty: 0, unit: 'Ton', batchNumber: 'HT-4482-C' }
    ],
    status: 'Delivered',
    grnStatus: 'Generated',
    grnId: 'GRN-005',
    attachments: [],
    remarks: 'Passed weighbridge verification.'
  },
  {
    id: 'DEL-007',
    poId: 'PO-010',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    deliveryDate: dateOnlyAgo(17),
    vehicleNumber: 'OD-33-E-8899',
    driverName: 'Manpreet Singh',
    driverPhone: '9845012345',
    challanNumber: 'SH-ST-2026-077',
    items: [
      { materialName: 'TMT Rebar Fe 500D 16mm', orderedQty: 15, dispatchQty: 15, receivedQty: 15, acceptedQty: 15, rejectedQty: 0, unit: 'Ton', batchNumber: 'HT-4480-A' }
    ],
    status: 'Delivered',
    grnStatus: 'Generated',
    grnId: 'GRN-006',
    attachments: [],
    remarks: 'Passed weighbridge.'
  },
  {
    id: 'DEL-008',
    poId: 'PO-011',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    supplierId: 'V-003',
    supplierName: 'Odisha Sand & Aggregates',
    deliveryDate: dateOnlyAgo(21),
    vehicleNumber: 'OD-33-F-1100',
    driverName: 'Muna Pradhan',
    driverPhone: '9438014562',
    challanNumber: 'OSA-2026-552',
    items: [
      { materialName: 'River Sand (Coarse)', orderedQty: 2000, dispatchQty: 2000, receivedQty: 2000, acceptedQty: 2000, rejectedQty: 0, unit: 'CFT' }
    ],
    status: 'Delivered',
    grnStatus: 'Generated',
    grnId: 'GRN-007',
    attachments: [],
    remarks: 'Unloaded at storage yard 1.'
  },
  {
    id: 'DEL-009',
    poId: 'PO-012',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    supplierId: 'V-005',
    supplierName: 'Metro Plumbing Supply',
    deliveryDate: dateOnlyAgo(24),
    vehicleNumber: 'OD-33-C-4589',
    driverName: 'Subhasish Panda',
    driverPhone: '9861054321',
    challanNumber: 'MPS-CTC-9821',
    items: [
      { materialName: 'UPVC Pipe 4 inch 6Kg/cm2', orderedQty: 200, dispatchQty: 200, receivedQty: 200, acceptedQty: 200, rejectedQty: 0, unit: 'Piece' }
    ],
    status: 'Delivered',
    grnStatus: 'Generated',
    grnId: 'GRN-008',
    attachments: [],
    remarks: 'Materials checked and stacked.'
  },
  {
    id: 'DEL-010',
    poId: 'PO-013',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    supplierId: 'V-007',
    supplierName: 'PowerGrid Electricals',
    deliveryDate: dateOnlyAgo(27),
    vehicleNumber: 'KA-03-HA-4591',
    driverName: 'Shankar Gowda',
    driverPhone: '9900012345',
    challanNumber: 'PGE-BLR-4982',
    items: [
      { materialName: 'FRLS Copper Wire 2.5 Sqmm', orderedQty: 80, dispatchQty: 80, receivedQty: 80, acceptedQty: 80, rejectedQty: 0, unit: 'Bundle' }
    ],
    status: 'Delivered',
    grnStatus: 'Generated',
    grnId: 'GRN-009',
    attachments: [],
    remarks: 'Delivered to electrical stores room.'
  },
  // Remaining 10 scheduled/in-transit/completed deliveries for visual depth
  { id: 'DEL-011', poId: 'PO-003', project: 'Kalinga Tech Park', siteLocation: 'Infocity, Bhubaneswar', supplierId: 'V-003', supplierName: 'Odisha Sand & Aggregates', deliveryDate: dateOnlyAgo(2), vehicleNumber: 'OD-33-F-1102', driverName: 'Lulu Jena', driverPhone: '9438014522', challanNumber: 'OSA-2026-601', items: [{ materialName: 'River Sand (Coarse)', orderedQty: 3000, dispatchQty: 2000, unit: 'CFT' }], status: 'Scheduled', grnStatus: 'Pending', attachments: [] },
  { id: 'DEL-012', poId: 'PO-003', project: 'Kalinga Tech Park', siteLocation: 'Infocity, Bhubaneswar', supplierId: 'V-003', supplierName: 'Odisha Sand & Aggregates', deliveryDate: dateOnlyAgo(2), vehicleNumber: 'OD-33-F-1103', driverName: 'Muna Jena', driverPhone: '9438014523', challanNumber: 'OSA-2026-602', items: [{ materialName: 'Crushed Granite Aggregate 20mm', orderedQty: 2000, dispatchQty: 2000, unit: 'CFT' }], status: 'Scheduled', grnStatus: 'Pending', attachments: [] },
  { id: 'DEL-013', poId: 'PO-014', project: 'Skyline Residency', siteLocation: 'Patia, Bhubaneswar', supplierId: 'V-001', supplierName: 'ABC Cement Traders', deliveryDate: dateOnlyAgo(1), vehicleNumber: 'OD-33-F-4567', driverName: 'Sarat Maharana', driverPhone: '9861098765', challanNumber: 'CH-ABC-4695', items: [{ materialName: 'OPC 53 Grade Cement', orderedQty: 400, dispatchQty: 400, unit: 'Bag', batchNumber: 'B-OCT26-09' }], status: 'Scheduled', grnStatus: 'Pending', attachments: [] },
  { id: 'DEL-014', poId: 'PO-001', project: 'Skyline Residency', siteLocation: 'Patia, Bhubaneswar', supplierId: 'V-001', supplierName: 'ABC Cement Traders', deliveryDate: dateOnlyAgo(12), vehicleNumber: 'OD-33-F-2231', driverName: 'Ramu Sahoo', driverPhone: '9438090123', challanNumber: 'CH-ABC-4309', items: [{ materialName: 'OPC 53 Grade Cement', orderedQty: 200, dispatchQty: 200, receivedQty: 200, acceptedQty: 200, rejectedQty: 0, unit: 'Bag' }], status: 'Delivered', grnStatus: 'Generated', grnId: 'GRN-010', attachments: [] },
  { id: 'DEL-015', poId: 'PO-002', project: 'Metro Mall Extension', siteLocation: 'Salt Lake, Kolkata', supplierId: 'V-002', supplierName: 'Shree Steel Suppliers', deliveryDate: dateOnlyAgo(2), vehicleNumber: 'WB-23-E-8878', driverName: 'Preet Singh', driverPhone: '9831123459', challanNumber: 'SH-ST-2026-105', items: [{ materialName: 'TMT Rebar Fe 500D 12mm', orderedQty: 10, dispatchQty: 10, unit: 'Ton' }], status: 'Scheduled', grnStatus: 'Pending', attachments: [] },
  { id: 'DEL-016', poId: 'PO-009', project: 'Skyline Residency', siteLocation: 'Patia, Bhubaneswar', supplierId: 'V-002', supplierName: 'Shree Steel Suppliers', deliveryDate: dateOnlyAgo(20), vehicleNumber: 'OD-33-D-0925', driverName: 'Mohan Singh', driverPhone: '9938012349', challanNumber: 'SH-ST-2026-054', items: [{ materialName: 'TMT Rebar Fe 500D 12mm', orderedQty: 10, dispatchQty: 10, receivedQty: 10, acceptedQty: 10, rejectedQty: 0, unit: 'Ton' }], status: 'Delivered', grnStatus: 'Generated', grnId: 'GRN-005', attachments: [] },
  { id: 'DEL-017', poId: 'PO-010', project: 'Kalinga Tech Park', siteLocation: 'Infocity, Bhubaneswar', supplierId: 'V-002', supplierName: 'Shree Steel Suppliers', deliveryDate: dateOnlyAgo(25), vehicleNumber: 'OD-33-E-8890', driverName: 'Amrik Singh', driverPhone: '9845012349', challanNumber: 'SH-ST-2026-042', items: [{ materialName: 'TMT Rebar Fe 500D 16mm', orderedQty: 5, dispatchQty: 5, receivedQty: 5, acceptedQty: 5, rejectedQty: 0, unit: 'Ton' }], status: 'Delivered', grnStatus: 'Generated', grnId: 'GRN-006', attachments: [] },
  { id: 'DEL-018', poId: 'PO-007', project: 'Riverfront Villas', siteLocation: 'Trishulia, Cuttack', supplierId: 'V-001', supplierName: 'ABC Cement Traders', deliveryDate: dateOnlyAgo(15), vehicleNumber: 'OD-33-F-1280', driverName: 'Jadu Naik', driverPhone: '9439056239', challanNumber: 'CH-ABC-4389', items: [{ materialName: 'OPC 53 Grade Cement', orderedQty: 100, dispatchQty: 100, receivedQty: 100, acceptedQty: 100, rejectedQty: 0, unit: 'Bag' }], status: 'Delivered', grnStatus: 'Generated', grnId: 'GRN-003', attachments: [] },
  { id: 'DEL-019', poId: 'PO-008', project: 'Kalinga Tech Park', siteLocation: 'Infocity, Bhubaneswar', supplierId: 'V-001', supplierName: 'ABC Cement Traders', deliveryDate: dateOnlyAgo(18), vehicleNumber: 'OD-33-G-9080', driverName: 'Prafulla Jena', driverPhone: '7894012349', challanNumber: 'CH-ABC-4290', items: [{ materialName: 'OPC 53 Grade Cement', orderedQty: 200, dispatchQty: 200, receivedQty: 200, acceptedQty: 200, rejectedQty: 0, unit: 'Bag' }], status: 'Delivered', grnStatus: 'Generated', grnId: 'GRN-004', attachments: [] },
  { id: 'DEL-020', poId: 'PO-012', project: 'Kalinga Tech Park', siteLocation: 'Infocity, Bhubaneswar', supplierId: 'V-005', supplierName: 'Metro Plumbing Supply', deliveryDate: dateOnlyAgo(30), vehicleNumber: 'OD-33-C-4580', driverName: 'Prashant Panda', driverPhone: '9861054329', challanNumber: 'MPS-CTC-9750', items: [{ materialName: 'UPVC Pipe 4 inch 6Kg/cm2', orderedQty: 50, dispatchQty: 50, receivedQty: 50, acceptedQty: 50, rejectedQty: 0, unit: 'Piece' }], status: 'Delivered', grnStatus: 'Generated', grnId: 'GRN-008', attachments: [] }
];

export const initialGRNs: GRN[] = [
  {
    id: 'GRN-001',
    deliveryId: 'DEL-001',
    poId: 'PO-001',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(6),
    items: [
      { materialName: 'OPC 53 Grade Cement', orderedQty: 500, dispatchQty: 500, receivedQty: 500, acceptedQty: 498, rejectedQty: 2, unit: 'Bag', condition: 'Damaged', remarks: 'Moisture ingress on 2 bags' },
      { materialName: 'PPC Cement', orderedQty: 200, dispatchQty: 200, receivedQty: 200, acceptedQty: 200, rejectedQty: 0, unit: 'Bag', condition: 'Good' }
    ],
    attachments: ['grn_signed_001.pdf'],
    remarks: 'Recommended for invoice matching. 2 bags deducted.'
  },
  {
    id: 'GRN-002',
    deliveryId: 'DEL-003',
    poId: 'PO-004',
    supplierId: 'V-004',
    supplierName: 'Kalinga Brick Works',
    project: 'Riverfront Villas',
    siteLocation: 'Trishulia, Cuttack',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(5),
    items: [
      { materialName: 'Fly Ash Bricks (Class A)', orderedQty: 15000, dispatchQty: 15000, receivedQty: 15000, acceptedQty: 14850, rejectedQty: 150, unit: 'Piece', condition: 'Damaged', remarks: 'Transit breakage' }
    ],
    attachments: [],
    remarks: '150 bricks broke. Only 14850 accepted.'
  },
  {
    id: 'GRN-003',
    deliveryId: 'DEL-004',
    poId: 'PO-007',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Riverfront Villas',
    siteLocation: 'Trishulia, Cuttack',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(9),
    items: [
      { materialName: 'OPC 53 Grade Cement', orderedQty: 300, dispatchQty: 300, receivedQty: 300, acceptedQty: 300, rejectedQty: 0, unit: 'Bag', condition: 'Good' }
    ],
    attachments: [],
    remarks: 'Delivered in full.'
  },
  {
    id: 'GRN-004',
    deliveryId: 'DEL-005',
    poId: 'PO-008',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(11),
    items: [
      { materialName: 'OPC 53 Grade Cement', orderedQty: 800, dispatchQty: 800, receivedQty: 800, acceptedQty: 800, rejectedQty: 0, unit: 'Bag', condition: 'Good' }
    ],
    attachments: [],
    remarks: 'Full quantity received.'
  },
  {
    id: 'GRN-005',
    deliveryId: 'DEL-006',
    poId: 'PO-009',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(14),
    items: [
      { materialName: 'TMT Rebar Fe 500D 12mm', orderedQty: 20, dispatchQty: 20, receivedQty: 20, acceptedQty: 20, rejectedQty: 0, unit: 'Ton', condition: 'Good' }
    ],
    attachments: [],
    remarks: 'Weighbridge slip attached.'
  },
  {
    id: 'GRN-006',
    deliveryId: 'DEL-007',
    poId: 'PO-010',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(17),
    items: [
      { materialName: 'TMT Rebar Fe 500D 16mm', orderedQty: 15, dispatchQty: 15, receivedQty: 15, acceptedQty: 15, rejectedQty: 0, unit: 'Ton', condition: 'Good' }
    ],
    attachments: [],
    remarks: 'Weighbridge slip matches.'
  },
  {
    id: 'GRN-007',
    deliveryId: 'DEL-008',
    poId: 'PO-011',
    supplierId: 'V-003',
    supplierName: 'Odisha Sand & Aggregates',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(21),
    items: [
      { materialName: 'River Sand (Coarse)', orderedQty: 2000, dispatchQty: 2000, receivedQty: 2000, acceptedQty: 2000, rejectedQty: 0, unit: 'CFT', condition: 'Good' }
    ],
    attachments: [],
    remarks: 'Volume checked by truck dimension.'
  },
  {
    id: 'GRN-008',
    deliveryId: 'DEL-009',
    poId: 'PO-012',
    supplierId: 'V-005',
    supplierName: 'Metro Plumbing Supply',
    project: 'Kalinga Tech Park',
    siteLocation: 'Infocity, Bhubaneswar',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(24),
    items: [
      { materialName: 'UPVC Pipe 4 inch 6Kg/cm2', orderedQty: 200, dispatchQty: 200, receivedQty: 200, acceptedQty: 200, rejectedQty: 0, unit: 'Piece', condition: 'Good' }
    ],
    attachments: [],
    remarks: 'Standard check complete.'
  },
  {
    id: 'GRN-009',
    deliveryId: 'DEL-010',
    poId: 'PO-013',
    supplierId: 'V-007',
    supplierName: 'PowerGrid Electricals',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(27),
    items: [
      { materialName: 'FRLS Copper Wire 2.5 Sqmm', orderedQty: 80, dispatchQty: 80, receivedQty: 80, acceptedQty: 80, rejectedQty: 0, unit: 'Bundle', condition: 'Good' }
    ],
    attachments: [],
    remarks: 'Bundles count verified.'
  },
  {
    id: 'GRN-010',
    deliveryId: 'DEL-014',
    poId: 'PO-001',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    project: 'Skyline Residency',
    siteLocation: 'Patia, Bhubaneswar',
    receivedBy: 'Samuel Rodriguez',
    receivedDate: dateOnlyAgo(12),
    items: [
      { materialName: 'OPC 53 Grade Cement', orderedQty: 200, dispatchQty: 200, receivedQty: 200, acceptedQty: 200, rejectedQty: 0, unit: 'Bag', condition: 'Good' }
    ],
    attachments: [],
    remarks: 'Batch verified.'
  }
];

export const initialQualityChecks: QualityCheck[] = [
  {
    id: 'QC-001',
    grnId: 'GRN-001',
    poId: 'PO-001',
    materialName: 'OPC 53 Grade Cement',
    supplierName: 'ABC Cement Traders',
    project: 'Skyline Residency',
    receivedQty: 500,
    sampleQty: 5,
    testType: 'Strength Test',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(3),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 498,
    rejectedQty: 2,
    notes: '7-day compression strength test results match requirements (43 MPa). 2 damaged bags not tested.',
    reportFile: 'ultratech_strength_report.pdf'
  },
  {
    id: 'QC-002',
    grnId: 'GRN-002',
    poId: 'PO-004',
    materialName: 'Fly Ash Bricks (Class A)',
    supplierName: 'Kalinga Brick Works',
    project: 'Riverfront Villas',
    receivedQty: 15000,
    sampleQty: 10,
    testType: 'Visual Inspection',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(2),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 14850,
    rejectedQty: 150,
    notes: 'Dimensions are within tolerance limits (+/- 3mm). 150 damaged pieces excluded.'
  },
  {
    id: 'QC-003',
    grnId: 'GRN-005',
    poId: 'PO-009',
    materialName: 'TMT Rebar Fe 500D 12mm',
    supplierName: 'Shree Steel Suppliers',
    project: 'Skyline Residency',
    receivedQty: 20,
    sampleQty: 3,
    testType: 'Dimension & Lab Test',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(10),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 20,
    rejectedQty: 0,
    notes: 'Yield strength is 525 N/sqmm. Elongation is 16%. Passed successfully.',
    reportFile: 'tata_tiscon_mtc_verify.pdf'
  },
  {
    id: 'QC-004',
    grnId: 'GRN-006',
    poId: 'PO-010',
    materialName: 'TMT Rebar Fe 500D 16mm',
    supplierName: 'Shree Steel Suppliers',
    project: 'Kalinga Tech Park',
    receivedQty: 15,
    sampleQty: 3,
    testType: 'Visual Inspection',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(13),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 15,
    rejectedQty: 0,
    notes: 'No rust scale. Sectional weight conforms to IS 1786.'
  },
  {
    id: 'QC-005',
    grnId: 'GRN-007',
    poId: 'PO-011',
    materialName: 'River Sand (Coarse)',
    supplierName: 'Odisha Sand & Aggregates',
    project: 'Skyline Residency',
    receivedQty: 2000,
    sampleQty: 1,
    testType: 'Moisture Test',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(18),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 2000,
    rejectedQty: 0,
    notes: 'Silt content measured at 4.2% (below maximum limit of 8%). Moisture is normal.'
  },
  {
    id: 'QC-006',
    grnId: 'GRN-008',
    poId: 'PO-012',
    materialName: 'UPVC Pipe 4 inch 6Kg/cm2',
    supplierName: 'Metro Plumbing Supply',
    project: 'Kalinga Tech Park',
    receivedQty: 200,
    sampleQty: 5,
    testType: 'Dimension Check',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(20),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 200,
    rejectedQty: 0,
    notes: 'Outer diameter and wall thickness conform to standards.'
  },
  {
    id: 'QC-007',
    grnId: 'GRN-009',
    poId: 'PO-013',
    materialName: 'FRLS Copper Wire 2.5 Sqmm',
    supplierName: 'PowerGrid Electricals',
    project: 'Skyline Residency',
    receivedQty: 80,
    sampleQty: 2,
    testType: 'Brand Verification',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(24),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 80,
    rejectedQty: 0,
    notes: 'Verified hologram and batch numbers on packaging box.'
  },
  {
    id: 'QC-008',
    grnId: 'GRN-003',
    poId: 'PO-007',
    materialName: 'OPC 53 Grade Cement',
    supplierName: 'ABC Cement Traders',
    project: 'Riverfront Villas',
    receivedQty: 300,
    sampleQty: 3,
    testType: 'Visual Inspection',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(5),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 300,
    rejectedQty: 0,
    notes: 'Lump-free cement. Manufactured date is within 30 days.'
  },
  {
    id: 'QC-009',
    grnId: 'GRN-004',
    poId: 'PO-008',
    materialName: 'OPC 53 Grade Cement',
    supplierName: 'ABC Cement Traders',
    project: 'Kalinga Tech Park',
    receivedQty: 800,
    sampleQty: 5,
    testType: 'Strength Test',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(7),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 800,
    rejectedQty: 0,
    notes: 'Passed 3-day and 7-day cube testing requirements.'
  },
  {
    id: 'QC-010',
    grnId: 'GRN-010',
    poId: 'PO-001',
    materialName: 'OPC 53 Grade Cement',
    supplierName: 'ABC Cement Traders',
    project: 'Skyline Residency',
    receivedQty: 200,
    sampleQty: 2,
    testType: 'Visual Inspection',
    assignedTo: 'Animesh Das (QA Engineer)',
    dueDate: dateOnlyAgo(10),
    status: 'Passed',
    testResult: 'Passed',
    acceptedQty: 200,
    rejectedQty: 0,
    notes: 'Good dry powder. No lumping observed.'
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: 'INV-001',
    poId: 'PO-001',
    grnId: 'GRN-001',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    invoiceNumber: 'TAX/2026/0892',
    invoiceDate: dateOnlyAgo(5),
    invoiceAmount: 362680,
    taxAmount: 78680,
    transportCharges: 5000,
    deductions: 820, // 2 damaged bags cement cost deduction
    matchedAmount: 361860,
    paymentStatus: 'Approved',
    approvalStatus: 'Approved',
    pdfFile: 'abc_inv_362680.pdf',
    remarks: 'Matched successfully with deduction of 2 damaged bags.'
  },
  {
    id: 'INV-002',
    poId: 'PO-004',
    grnId: 'GRN-002',
    supplierId: 'V-004',
    supplierName: 'Kalinga Brick Works',
    invoiceNumber: 'KBW-CTC-4412',
    invoiceDate: dateOnlyAgo(3),
    invoiceAmount: 117200,
    taxAmount: 11700,
    transportCharges: 8000,
    deductions: 975, // 150 bricks broken cost deduction
    matchedAmount: 116225,
    paymentStatus: 'Approved',
    approvalStatus: 'Approved',
    pdfFile: 'kalinga_inv_117200.pdf',
    remarks: 'Approved after brick shortage adjustment.'
  },
  {
    id: 'INV-003',
    poId: 'PO-007',
    grnId: 'GRN-003',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    invoiceNumber: 'TAX/2026/0904',
    invoiceDate: dateOnlyAgo(7),
    invoiceAmount: 160440,
    taxAmount: 34440,
    transportCharges: 4000,
    deductions: 0,
    matchedAmount: 160440,
    paymentStatus: 'Paid',
    approvalStatus: 'Approved',
    pdfFile: 'abc_inv_160440.pdf',
    remarks: 'Payment cleared.'
  },
  {
    id: 'INV-004',
    poId: 'PO-008',
    grnId: 'GRN-004',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    invoiceNumber: 'TAX/2026/0920',
    invoiceDate: dateOnlyAgo(8),
    invoiceAmount: 424840,
    taxAmount: 91840,
    transportCharges: 8000,
    deductions: 0,
    matchedAmount: 424840,
    paymentStatus: 'Under Review',
    approvalStatus: 'Pending',
    pdfFile: 'abc_inv_424840.pdf'
  },
  {
    id: 'INV-005',
    poId: 'PO-009',
    grnId: 'GRN-005',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    invoiceNumber: 'SSS-TAX-10294',
    invoiceDate: dateOnlyAgo(12),
    invoiceAmount: 1521400,
    taxAmount: 230400,
    transportCharges: 15000,
    deductions: 0,
    matchedAmount: 1521400,
    paymentStatus: 'Paid',
    approvalStatus: 'Approved',
    pdfFile: 'shree_inv_1521400.pdf'
  },
  {
    id: 'INV-006',
    poId: 'PO-010',
    grnId: 'GRN-006',
    supplierId: 'V-002',
    supplierName: 'Shree Steel Suppliers',
    invoiceNumber: 'SSS-TAX-10312',
    invoiceDate: dateOnlyAgo(15),
    invoiceAmount: 1132950,
    taxAmount: 171450,
    transportCharges: 12000,
    deductions: 0,
    matchedAmount: 1132950,
    paymentStatus: 'Partially Paid',
    approvalStatus: 'Approved',
    pdfFile: 'shree_inv_1132950.pdf'
  },
  {
    id: 'INV-007',
    poId: 'PO-011',
    grnId: 'GRN-007',
    supplierId: 'V-003',
    supplierName: 'Odisha Sand & Aggregates',
    invoiceNumber: 'OSA/CTC/4591',
    invoiceDate: dateOnlyAgo(19),
    invoiceAmount: 81000,
    taxAmount: 3500,
    transportCharges: 8000,
    deductions: 0,
    matchedAmount: 81000,
    paymentStatus: 'Paid',
    approvalStatus: 'Approved',
    pdfFile: 'osa_inv_81000.pdf'
  },
  {
    id: 'INV-008',
    poId: 'PO-012',
    grnId: 'GRN-008',
    supplierId: 'V-005',
    supplierName: 'Metro Plumbing Supply',
    invoiceNumber: 'MPS-INV-11029',
    invoiceDate: dateOnlyAgo(22),
    invoiceAmount: 226200,
    taxAmount: 34200,
    transportCharges: 4000,
    deductions: 0,
    matchedAmount: 226200,
    paymentStatus: 'Paid',
    approvalStatus: 'Approved',
    pdfFile: 'metro_inv_226200.pdf'
  },
  {
    id: 'INV-009',
    poId: 'PO-013',
    grnId: 'GRN-009',
    supplierId: 'V-007',
    supplierName: 'PowerGrid Electricals',
    invoiceNumber: 'PGE-INV-00124',
    invoiceDate: dateOnlyAgo(25),
    invoiceAmount: 204460,
    taxAmount: 30960,
    transportCharges: 3000,
    deductions: 0,
    matchedAmount: 204460,
    paymentStatus: 'Paid',
    approvalStatus: 'Approved',
    pdfFile: 'powergrid_inv_204460.pdf'
  },
  {
    id: 'INV-010',
    poId: 'PO-001',
    grnId: 'GRN-010',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    invoiceNumber: 'TAX/2026/0854',
    invoiceDate: dateOnlyAgo(14),
    invoiceAmount: 110000,
    taxAmount: 20000,
    transportCharges: 2000,
    deductions: 0,
    matchedAmount: 110000,
    paymentStatus: 'Paid',
    approvalStatus: 'Approved'
  },
  {
    id: 'INV-011',
    poId: 'PO-003',
    supplierId: 'V-003',
    supplierName: 'Odisha Sand & Aggregates',
    invoiceNumber: 'OSA/CTC/4602',
    invoiceDate: dateOnlyAgo(1),
    invoiceAmount: 212450,
    taxAmount: 9450,
    transportCharges: 15000,
    deductions: 0,
    matchedAmount: 212450,
    paymentStatus: 'Submitted',
    approvalStatus: 'Pending',
    pdfFile: 'osa_inv_212450.pdf'
  },
  {
    id: 'INV-012',
    poId: 'PO-014',
    supplierId: 'V-001',
    supplierName: 'ABC Cement Traders',
    invoiceNumber: 'TAX/2026/0942',
    invoiceDate: dateOnlyAgo(1),
    invoiceAmount: 211920,
    taxAmount: 45920,
    transportCharges: 3000,
    deductions: 0,
    matchedAmount: 211920,
    paymentStatus: 'Draft',
    approvalStatus: 'Pending'
  }
];

export const initialCommunicationLogs: CommunicationLog[] = [
  { id: 'C-01', date: daysAgo(5), type: 'Call', subject: 'Cement rate validity discussion', description: 'Called Rajesh Kumar regarding validity extension of OPC cement price. He agreed to extend the rate validity till June 30.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: [], followUpRequired: false },
  { id: 'C-02', date: daysAgo(4), type: 'Email', subject: 'RFQ-002 Rebar price submission', description: 'Emailed Anirudh Das requesting submission of quotations for the structural steel package on priority.', addedBy: 'Samuel Rodriguez', visibility: 'Visible to Vendor', attachments: [], followUpRequired: false },
  { id: 'C-03', date: daysAgo(3), type: 'WhatsApp', subject: 'Mahanadi sand delivery update', description: 'Pradeep Jena sent truck departure update via WhatsApp. OD-33-F-1100 containing 2000 CFT coarse sand has departed.', addedBy: 'Samuel Rodriguez', visibility: 'Visible to Vendor', attachments: [], followUpRequired: false },
  { id: 'C-04', date: daysAgo(12), type: 'Meeting', subject: 'Quarterly compliance check', description: 'Met with Sanjay Mohanty of Kalinga Brick Works regarding missing MSME and trade license documents. He promised to upload by next week.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: [], followUpRequired: true, followUpDate: dateOnlyAgo(-5) },
  { id: 'C-05', date: daysAgo(15), type: 'Complaint', subject: 'Astral pipe thickness variation', description: 'Raised complaint to Metro Plumbing regarding minor thickness difference in CPVC pipes. They dispatched a quality technician for inspection.', addedBy: 'Samuel Rodriguez', visibility: 'Visible to Vendor', attachments: ['complaint_photo.jpg'], followUpRequired: false },
  { id: 'C-06', date: daysAgo(1), type: 'Negotiation', subject: 'Fe 500D bulk discount discussion', description: 'Discussed rate discount with Shree Steel for a new block order. Offered 1.5% discount if paid within 15 days.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: [], followUpRequired: false },
  { id: 'C-07', date: daysAgo(2), type: 'Internal Note', subject: 'Legal draft agreement upload', description: 'Uploaded the drafted master supply agreement for ABC Cement Traders. Pending legal review.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: ['draft_agreement.pdf'], followUpRequired: false },
  { id: 'C-08', date: daysAgo(7), type: 'System Notification', subject: 'GST verification success', description: 'GSTIN 21AAAAA1111A1Z1 verified successfully with government portal database API.', addedBy: 'System', visibility: 'Visible to Vendor', attachments: [], followUpRequired: false },
  { id: 'C-09', date: daysAgo(14), type: 'Call', subject: 'Electrical conductor availability check', description: 'Spoke with Karthik Raja of PowerGrid. Confirmed availability of Finolex copper conductors.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: [], followUpRequired: false },
  { id: 'C-10', date: daysAgo(20), type: 'Meeting', subject: 'Waterproofing mock testing setup', description: 'Site engineer held a meeting with UltraBuild technical team to execute waterproofing test demo.', addedBy: 'Samuel Rodriguez', visibility: 'Visible to Vendor', attachments: [], followUpRequired: false },
  // 10 more logs for total count of 20
  { id: 'C-11', date: daysAgo(8), type: 'Call', subject: 'Unloading charges clarification', description: 'Called Kalinga Bricks regarding unloading labor terms. Confirmed charges are on their account.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: [], followUpRequired: false },
  { id: 'C-12', date: daysAgo(10), type: 'Email', subject: 'Pending documents reminder', description: 'Automated email sent to BuildMart Hardware for updating trade license copy.', addedBy: 'System', visibility: 'Visible to Vendor', attachments: [], followUpRequired: false },
  { id: 'C-13', date: daysAgo(11), type: 'WhatsApp', subject: 'Weighbridge slip request', description: 'Requested Shree Steel to send scan of the weighbridge ticket for PO-010.', addedBy: 'Samuel Rodriguez', visibility: 'Visible to Vendor', attachments: [], followUpRequired: false },
  { id: 'C-14', date: daysAgo(18), type: 'Meeting', subject: 'Annual rate contract review', description: 'Annual review meeting with ABC Cement team regarding volume commitments.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: [], followUpRequired: false },
  { id: 'C-15', date: daysAgo(22), type: 'Call', subject: 'Sand dispatch delay query', description: 'Called Odisha Sand. Delay of 4 hours reported due to Mahanadi water levels.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: [], followUpRequired: false },
  { id: 'C-16', date: daysAgo(25), type: 'Email', subject: 'Payment confirmation slip', description: 'Emailed payment voucher to PowerGrid for clearing invoice INV-009.', addedBy: 'Samuel Rodriguez', visibility: 'Visible to Vendor', attachments: [], followUpRequired: false },
  { id: 'C-17', date: daysAgo(28), type: 'Call', subject: 'Credit limit review request', description: 'Requested Yes Bank credit score update from UltraBuild to revise limits.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: [], followUpRequired: false },
  { id: 'C-18', date: daysAgo(30), type: 'Complaint', subject: 'Wrong diameter packing box', description: 'Notified Metro Plumbing of 5 wrong sizes of couplers delivered. Replaced next day.', addedBy: 'Samuel Rodriguez', visibility: 'Visible to Vendor', attachments: [], followUpRequired: false },
  { id: 'C-19', date: daysAgo(32), type: 'Call', subject: 'Agreement sign status query', description: 'Enquired Shree Steel regarding agreement signature. Expected tomorrow.', addedBy: 'Samuel Rodriguez', visibility: 'Internal Only', attachments: [], followUpRequired: false },
  { id: 'C-20', date: daysAgo(35), type: 'WhatsApp', subject: 'Emergency delivery of 50 bags', description: 'Requested ABC Cement for urgent 50 PPC bags. Delivered in 4 hours.', addedBy: 'Samuel Rodriguez', visibility: 'Visible to Vendor', attachments: [], followUpRequired: false }
];

export const initialAuditLogs: AuditLog[] = [
  { id: 'A-01', timestamp: daysAgo(0.1), user: 'Samuel Rodriguez', role: 'admin', action: 'Supplier Created', module: 'Material Supplier List', newValue: 'V-001 (ABC Cement Traders)', ipAddress: '192.168.1.12' },
  { id: 'A-02', timestamp: daysAgo(0.5), user: 'Samuel Rodriguez', role: 'admin', action: 'GST Number Updated', module: 'Supplier details', oldValue: 'None', newValue: '21AAAAA1111A1Z1', ipAddress: '192.168.1.12' },
  { id: 'A-03', timestamp: daysAgo(1), user: 'Samuel Rodriguez', role: 'admin', action: 'RFQ Sent', module: 'RFQ Flow', newValue: 'RFQ-001 sent to ABC Cement Traders', ipAddress: '192.168.1.12' },
  { id: 'A-04', timestamp: daysAgo(2), user: 'Rajesh Kumar (Vendor)', role: 'vendor', action: 'Quotation Submitted', module: 'RFQ Response Flow', newValue: 'Quotation QT-001 submitted for RFQ-001', ipAddress: '112.79.44.102' },
  { id: 'A-05', timestamp: daysAgo(3), user: 'Samuel Rodriguez', role: 'admin', action: 'Quotation Approved', module: 'RFQ Comparison', oldValue: 'QT-001 (Under Review)', newValue: 'QT-001 (Approved)', ipAddress: '192.168.1.12' },
  { id: 'A-06', timestamp: daysAgo(4), user: 'Samuel Rodriguez', role: 'admin', action: 'PO Created', module: 'Purchase Orders', newValue: 'PO-001 draft generated', ipAddress: '192.168.1.12' },
  { id: 'A-07', timestamp: daysAgo(5), user: 'Samuel Rodriguez', role: 'admin', action: 'PO Approved', module: 'PO Flow', oldValue: 'Draft', newValue: 'Approved', ipAddress: '192.168.1.12' },
  { id: 'A-08', timestamp: daysAgo(6), user: 'Samuel Rodriguez', role: 'admin', action: 'PO Sent to Supplier', module: 'PO Flow', newValue: 'PO-001 transmitted to ABC Cement', ipAddress: '192.168.1.12' },
  { id: 'A-09', timestamp: daysAgo(7), user: 'Rajesh Kumar (Vendor)', role: 'vendor', action: 'PO Accepted by Supplier', module: 'Vendor PO Portal', oldValue: 'Sent', newValue: 'Accepted', ipAddress: '112.79.44.102' },
  { id: 'A-10', timestamp: daysAgo(8), user: 'Rajesh Kumar (Vendor)', role: 'vendor', action: 'Delivery Dispatched', module: 'Dispatch update', newValue: 'DEL-001 marked dispatched. Vehicle OD-33-F-4567', ipAddress: '112.79.44.102' },
  { id: 'A-11', timestamp: daysAgo(9), user: 'Amit K (PM)', role: 'manager', action: 'Material Received', module: 'Site Receiving', newValue: 'Received 500 bags OPC, 200 PPC at site', ipAddress: '192.168.1.45' },
  { id: 'A-12', timestamp: daysAgo(9.5), user: 'Amit K (PM)', role: 'manager', action: 'GRN Generated', module: 'Goods Receipt Note', newValue: 'GRN-001 issued for DEL-001', ipAddress: '192.168.1.45' },
  { id: 'A-13', timestamp: daysAgo(10), user: 'Animesh Das (QA)', role: 'manager', action: 'Quality Check Passed', module: 'QA Control', newValue: 'QC-001 passed for Ultratech Cement', ipAddress: '192.168.1.48' },
  { id: 'A-14', timestamp: daysAgo(11), user: 'Rajesh Kumar (Vendor)', role: 'vendor', action: 'Invoice Submitted', module: 'Invoice Portal', newValue: 'TAX/2026/0892 uploaded (INR 3,62,680)', ipAddress: '112.79.44.102' },
  { id: 'A-15', timestamp: daysAgo(12), user: 'Samuel Rodriguez', role: 'admin', action: 'Payment Recorded', module: 'Financial module', newValue: 'Cheque payment of INR 3,61,860 for INV-001', ipAddress: '192.168.1.12' },
  { id: 'A-16', timestamp: daysAgo(13), user: 'Samuel Rodriguez', role: 'admin', action: 'Supplier Blacklisted', module: 'Admin controls', oldValue: 'Active', newValue: 'Blacklisted (Manoj Sahoo)', ipAddress: '192.168.1.12' },
  { id: 'A-17', timestamp: daysAgo(14), user: 'Samuel Rodriguez', role: 'admin', action: 'Document Verified', module: 'Compliance Check', newValue: 'GST registration certificate verified for V-002', ipAddress: '192.168.1.12' },
  { id: 'A-18', timestamp: daysAgo(15), user: 'Samuel Rodriguez', role: 'admin', action: 'Supplier Status Changed', module: 'Supplier details', oldValue: 'Draft', newValue: 'Active (Shree Steel)', ipAddress: '192.168.1.12' },
  { id: 'A-19', timestamp: daysAgo(16), user: 'Samuel Rodriguez', role: 'admin', action: 'Supplier Updated', module: 'Supplier details', newValue: 'Payment terms updated for V-005 to 30 Days', ipAddress: '192.168.1.12' },
  { id: 'A-20', timestamp: daysAgo(17), user: 'Samuel Rodriguez', role: 'admin', action: 'Performance Recalculated', module: 'Performance evaluation', newValue: 'Score updated to 94% for ABC Cement', ipAddress: '192.168.1.12' },
  // Remaining 10 audit logs to total 30
  { id: 'A-21', timestamp: daysAgo(18), user: 'Amit K (PM)', role: 'manager', action: 'PO Created', module: 'Purchase Orders', newValue: 'PO-015 draft generated', ipAddress: '192.168.1.45' },
  { id: 'A-22', timestamp: daysAgo(19), user: 'Animesh Das (QA)', role: 'manager', action: 'Quality Check Failed', module: 'QA Control', newValue: 'QC-002 visual defects reported for bricks', ipAddress: '192.168.1.48' },
  { id: 'A-23', timestamp: daysAgo(20), user: 'Samuel Rodriguez', role: 'admin', action: 'Document Verified', module: 'Compliance Check', newValue: 'PAN card verified for Shree Steel', ipAddress: '192.168.1.12' },
  { id: 'A-24', timestamp: daysAgo(21), user: 'Samuel Rodriguez', role: 'admin', action: 'RFQ Sent', module: 'RFQ Flow', newValue: 'RFQ-002 sent to Shree Steel Suppliers', ipAddress: '192.168.1.12' },
  { id: 'A-25', timestamp: daysAgo(22), user: 'Samuel Rodriguez', role: 'admin', action: 'Quotation Approved', module: 'RFQ Comparison', newValue: 'QT-002 (Approved)', ipAddress: '192.168.1.12' },
  { id: 'A-26', timestamp: daysAgo(23), user: 'Samuel Rodriguez', role: 'admin', action: 'PO Approved', module: 'PO Flow', newValue: 'PO-002 (Approved)', ipAddress: '192.168.1.12' },
  { id: 'A-27', timestamp: daysAgo(24), user: 'Samuel Rodriguez', role: 'admin', action: 'PO Sent to Supplier', module: 'PO Flow', newValue: 'PO-002 transmitted to Shree Steel', ipAddress: '192.168.1.12' },
  { id: 'A-28', timestamp: daysAgo(25), user: 'Anirudh Das (Vendor)', role: 'vendor', action: 'PO Accepted by Supplier', module: 'Vendor PO Portal', newValue: 'PO-002 accepted', ipAddress: '112.79.55.23' },
  { id: 'A-29', timestamp: daysAgo(26), user: 'Anirudh Das (Vendor)', role: 'vendor', action: 'Delivery Dispatched', module: 'Dispatch update', newValue: 'DEL-002 marked dispatched', ipAddress: '112.79.55.23' },
  { id: 'A-30', timestamp: daysAgo(27), user: 'Samuel Rodriguez', role: 'admin', action: 'Supplier Status Changed', module: 'Supplier details', oldValue: 'Active', newValue: 'On Hold (V-008)', ipAddress: '192.168.1.12' }
];

export const initialProjects: ProjectAssociation[] = [
  { projectName: 'Skyline Residency', siteLocation: 'Patia, Bhubaneswar', materialSupplied: ['Cement', 'Plumbing', 'Waterproofing'], activePOsCount: 2, totalOrderValue: 574600, pendingDeliveriesCount: 1, outstandingPayment: 211920, status: 'Active' },
  { projectName: 'Metro Mall Extension', siteLocation: 'Salt Lake, Kolkata', materialSupplied: ['Steel', 'Paint'], activePOsCount: 2, totalOrderValue: 2503260, pendingDeliveriesCount: 2, outstandingPayment: 1743110, status: 'Active' },
  { projectName: 'Kalinga Tech Park', siteLocation: 'Infocity, Bhubaneswar', materialSupplied: ['Sand', 'Aggregate', 'Cement', 'Steel'], activePOsCount: 3, totalOrderValue: 1770240, pendingDeliveriesCount: 1, outstandingPayment: 1345400, status: 'Active' },
  { projectName: 'Riverfront Villas', siteLocation: 'Trishulia, Cuttack', materialSupplied: ['Bricks', 'Cement'], activePOsCount: 2, totalOrderValue: 277640, pendingDeliveriesCount: 0, outstandingPayment: 0, status: 'Completed' },
  { projectName: 'Greenfield Hospital', siteLocation: 'Chhend, Rourkela', materialSupplied: ['Waterproofing'], activePOsCount: 1, totalOrderValue: 29705, pendingDeliveriesCount: 0, outstandingPayment: 29705, status: 'Active' }
];
