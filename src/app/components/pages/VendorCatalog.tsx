import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, Check, CheckCircle2, CheckSquare, ChevronDown, ChevronRight,
  Download, Eye, Filter, Grid3x3, Library, List as ListIcon, MessageSquare,
  Package, Search, Send, Star, Store, X
} from 'lucide-react';
import { toast } from 'sonner';

type VendorStatus = 'Approved' | 'Under Review' | 'Pending' | 'Blocked';
type RequestStatus = 'Not Requested' | 'Requested' | 'Shared' | 'Revision Needed';
type VendorCategory = 'Supplier' | 'Subcontractor' | 'Equipment Rental' | 'Service Partner';

type VendorCatalogItem = {
  id: string;
  name: string;
  type: 'Material' | 'Equipment' | 'Service';
  category: string;
  unit: string;
  rate: number;
  availability: string;
  leadTime: string;
  specs: Record<string, string>;
  tags: string[];
};

type VendorCatalogRequest = {
  id: string;
  scope: string;
  requestedBy: string;
  requestedOn: string;
  dueDate: string;
  status: RequestStatus;
  priority: 'Normal' | 'High' | 'Urgent';
  note: string;
};

type Vendor = {
  id: string;
  name: string;
  category: VendorCategory;
  subcategory: string;
  rating: number;
  status: VendorStatus;
  activeProjects: number;
  lastOrder: string;
  contact: string;
  phone: string;
  email: string;
  location: string;
  description: string;
  compliance: string;
  catalogStatus: RequestStatus;
  catalogItems: VendorCatalogItem[];
  requests: VendorCatalogRequest[];
};

type CatalogTabItem<T extends string> = { key: T; label: string; count?: number | string };

function CatalogSelect({
  children,
  className = '',
  containerClassName = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { containerClassName?: string }) {
  return (
    <span className={`group relative inline-flex ${containerClassName}`}>
      <select
        {...props}
        className={`h-9 w-full min-w-[132px] appearance-none rounded-xl border border-slate-200 bg-white/95 py-2 pl-3.5 pr-10 text-xs font-medium text-slate-700 shadow-sm shadow-slate-950/[0.03] outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 ${className}`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition group-hover:bg-white group-hover:text-slate-600 group-focus-within:bg-blue-50 group-focus-within:text-blue-600">
        <ChevronDown className="h-3.5 w-3.5" />
      </span>
    </span>
  );
}

function CatalogTabStrip<T extends string>({
  tabs,
  activeKey,
  onChange,
  className = '',
}: {
  tabs: CatalogTabItem<T>[];
  activeKey: T;
  onChange: (key: T) => void;
  className?: string;
}) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <div className="inline-flex min-w-max gap-5 border-b border-slate-200 px-2">
        {tabs.map((tab) => {
          const active = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`relative inline-flex h-11 shrink-0 items-center gap-1.5 px-1 text-sm font-medium transition-colors duration-200 ease-out ${
                active ? 'text-slate-950' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && <span className={`text-[10px] ${active ? 'text-slate-500' : 'text-slate-300'}`}>{tab.count}</span>}
              {active && <span className="absolute inset-x-0 -bottom-px h-[2px] animate-in fade-in zoom-in-75 bg-blue-600 duration-200" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CatalogProjectPicker({
  selectedProject,
  onProjectChange,
}: {
  selectedProject: string;
  onProjectChange: (project: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'my' | 'shared'>('my');
  const myProjects = ['Downtown Tower Complex', 'Metro Station Package 4', 'Riverfront Infra Works', 'Airport Terminal Expansion'];
  const sharedProjects = ['Industrial Warehouse Phase 2', 'Smart City Utilities', 'Harbor Link Bridge'];
  const visibleProjects = tab === 'my' ? myProjects : sharedProjects;

  return (
    <div className="relative inline-flex">
      <button type="button" onClick={() => setOpen(current => !current)} className="group inline-flex h-8 items-center gap-2 rounded-xl px-1 transition hover:bg-slate-50">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/15">
          <Activity className="h-3.5 w-3.5" />
        </span>
        <span className="max-w-[240px] truncate text-sm font-medium text-slate-950">{selectedProject}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-8 top-9 z-50 w-[318px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15">
          <CatalogTabStrip className="mb-2" tabs={[{ key: 'my', label: 'My Projects' }, { key: 'shared', label: 'Shared' }]} activeKey={tab} onChange={setTab} />
          <div className="max-h-[280px] overflow-y-auto py-1">
            {visibleProjects.map(project => (
              <button
                key={project}
                type="button"
                onClick={() => {
                  onProjectChange(project);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <span>{project}</span>
                {selectedProject === project && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SignalCell({ value }: { value: number }) {
  const tone = value >= 80
    ? 'bg-red-50 text-red-700 border-red-100'
    : value >= 65
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-emerald-50 text-emerald-700 border-emerald-100';
  return <span className={`inline-flex min-w-[48px] justify-center rounded-md border px-2 py-1 text-xs font-black ${tone}`}>{value}%</span>;
}

const VENDOR_STATUSES: VendorStatus[] = ['Approved', 'Under Review', 'Pending', 'Blocked'];
const CATALOG_STATUSES: RequestStatus[] = ['Not Requested', 'Requested', 'Shared', 'Revision Needed'];
const VENDOR_CATEGORIES: VendorCategory[] = ['Supplier', 'Subcontractor', 'Equipment Rental', 'Service Partner'];
const CATALOG_SCOPES = [
  'Full material catalog',
  'Equipment fleet catalog',
  'MEP service catalog',
  'Civil package catalog',
  'Rate card + lead times',
  'Compliance-backed catalog',
];

const categoryTone: Record<VendorCategory, string> = {
  Supplier: 'border-blue-200 bg-blue-50 text-blue-700',
  Subcontractor: 'border-violet-200 bg-violet-50 text-violet-700',
  'Equipment Rental': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Service Partner': 'border-amber-200 bg-amber-50 text-amber-700',
};

const statusTone: Record<VendorStatus, string> = {
  Approved: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  'Under Review': 'border-purple-100 bg-purple-50 text-purple-700',
  Pending: 'border-amber-100 bg-amber-50 text-amber-700',
  Blocked: 'border-red-100 bg-red-50 text-red-700',
};

const requestTone: Record<RequestStatus, string> = {
  'Not Requested': 'border-slate-100 bg-slate-50 text-slate-500',
  Requested: 'border-amber-100 bg-amber-50 text-amber-700',
  Shared: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  'Revision Needed': 'border-red-100 bg-red-50 text-red-700',
};

const baseVendorCatalogItems: Record<VendorCategory, VendorCatalogItem[]> = {
  Supplier: [
    { id: 'VCAT-MAT-001', name: 'Portland Cement Type I/II', type: 'Material', category: 'Civil Materials', unit: 'Bag (50kg)', rate: 8.5, availability: 'In Stock', leadTime: '2 days', specs: { Standard: 'ASTM C150', Strength: '42.5 MPa', Packaging: '50 kg bag' }, tags: ['High demand', 'BOQ mapped', 'Bulk supply'] },
    { id: 'VCAT-MAT-002', name: 'TMT Rebar Fe500', type: 'Material', category: 'Structural Steel', unit: 'Ton', rate: 690, availability: 'In Stock', leadTime: '4 days', specs: { Grade: 'Fe500', Diameter: '8-32 mm', Mill: 'Certified' }, tags: ['Mill cert', 'Heat number', 'Cut bend ready'] },
    { id: 'VCAT-MAT-003', name: 'Ready Mix Concrete M30', type: 'Material', category: 'Concrete', unit: 'm3', rate: 92, availability: 'Plant Slot', leadTime: '24 hrs', specs: { Grade: 'M30', Slump: '120 mm', Admixture: 'PCE' }, tags: ['Pumpable', 'Batch ticket', 'QC report'] },
  ],
  Subcontractor: [
    { id: 'VCAT-SVC-001', name: 'MEP Rough-In Package', type: 'Service', category: 'MEP', unit: 'Floor', rate: 12500, availability: 'Crew Available', leadTime: '7 days', specs: { Crew: '18 technicians', Scope: 'Electrical + Plumbing', QA: 'ITP included' }, tags: ['Crew based', 'QA checklist', 'Shop drawing aligned'] },
    { id: 'VCAT-SVC-002', name: 'Gypsum Partition Install', type: 'Service', category: 'Finishes', unit: 'sqm', rate: 14, availability: 'Available', leadTime: '5 days', specs: { System: 'Gypboard', Frame: 'GI studs', Output: '180 sqm/day' }, tags: ['Finishing', 'Labour supply', 'Mockup ready'] },
    { id: 'VCAT-SVC-003', name: 'Facade Glazing Crew', type: 'Service', category: 'Facade', unit: 'sqm', rate: 48, availability: 'Reserved', leadTime: '14 days', specs: { Crew: '12 installers', Access: 'BMU/scaffold', QA: 'Water test' }, tags: ['Facade', 'Specialist', 'Permit required'] },
  ],
  'Equipment Rental': [
    { id: 'VCAT-EQ-001', name: 'Tower Crane 12 Ton', type: 'Equipment', category: 'Lifting', unit: 'Day', rate: 1500, availability: 'Available', leadTime: '10 days', specs: { Capacity: '12 ton', Jib: '60 m', Operator: 'Included' }, tags: ['Operator included', 'Lift plan', 'Anti-collision'] },
    { id: 'VCAT-EQ-002', name: 'Crawler Excavator 20 Ton', type: 'Equipment', category: 'Earthmoving', unit: 'Day', rate: 800, availability: 'Available', leadTime: '3 days', specs: { Bucket: '1.2 m3', Attachment: 'Breaker option', Fuel: 'Client' }, tags: ['Earthwork', 'GPS ready', 'Breaker compatible'] },
    { id: 'VCAT-EQ-003', name: 'Concrete Pump 36m', type: 'Equipment', category: 'Concreting', unit: 'Day', rate: 1200, availability: 'Service Due', leadTime: '5 days', specs: { Boom: '36 m', Output: '140 m3/hr', Crew: '2 pax' }, tags: ['Pour support', 'Boom inspection', 'Washout kit'] },
  ],
  'Service Partner': [
    { id: 'VCAT-SP-001', name: 'Laser Scan Progress Capture', type: 'Service', category: 'Digital Twin', unit: 'Visit', rate: 950, availability: 'Available', leadTime: '3 days', specs: { Output: 'Point cloud', Accuracy: '+/- 3 mm', Delivery: '48 hrs' }, tags: ['Reality capture', 'BIM compare', 'Progress proof'] },
    { id: 'VCAT-SP-002', name: 'Safety Audit Package', type: 'Service', category: 'HSE', unit: 'Audit', rate: 600, availability: 'Available', leadTime: '2 days', specs: { Checklist: 'OSHA aligned', Report: 'PDF + actions', Duration: '1 day' }, tags: ['HSE', 'Audit trail', 'Action register'] },
    { id: 'VCAT-SP-003', name: 'Commissioning Support', type: 'Service', category: 'MEP Testing', unit: 'System', rate: 1800, availability: 'Reserved', leadTime: '12 days', specs: { Scope: 'Testing + balancing', Report: 'Commissioning dossier', Crew: 'Specialist team' }, tags: ['Commissioning', 'Closeout', 'Dossier'] },
  ],
};

const vendorSeeds: Vendor[] = [
  { id: 'VND-001', name: 'Acme Construction Supplies', category: 'Supplier', subcategory: 'Civil Materials', rating: 4.8, status: 'Approved', activeProjects: 12, lastOrder: '2026-05-12', contact: 'John Doe', phone: '+1 (555) 123-4567', email: 'catalog@acme-supply.com', location: 'Portland, OR', description: 'Primary supplier for civil and structural materials including cement, steel, aggregates, and concrete admixtures.', compliance: 'Fully Compliant', catalogStatus: 'Shared', catalogItems: baseVendorCatalogItems.Supplier, requests: [{ id: 'REQ-CAT-001', scope: 'Full material catalog', requestedBy: 'Admin', requestedOn: '2026-05-12', dueDate: '2026-05-18', status: 'Shared', priority: 'High', note: 'Share rate card, lead times, compliance files, and BOQ-ready material mapping.' }] },
  { id: 'VND-002', name: 'BuildTech MEP Solutions', category: 'Subcontractor', subcategory: 'MEP Works', rating: 4.5, status: 'Approved', activeProjects: 4, lastOrder: '2026-05-09', contact: 'Jane Smith', phone: '+1 (555) 987-6543', email: 'tenders@buildtech-mep.com', location: 'Seattle, WA', description: 'Specialized MEP subcontractor for high-rise commercial buildings and fitout packages.', compliance: 'Fully Compliant', catalogStatus: 'Requested', catalogItems: [], requests: [{ id: 'REQ-CAT-002', scope: 'MEP service catalog', requestedBy: 'Admin', requestedOn: '2026-05-17', dueDate: '2026-05-23', status: 'Requested', priority: 'Normal', note: 'Need service packages, crew productivity, unit rates, QA coverage, and mobilization lead time.' }] },
  { id: 'VND-003', name: 'Rapid Heavy Machinery', category: 'Equipment Rental', subcategory: 'Heavy Equipment', rating: 4.2, status: 'Under Review', activeProjects: 1, lastOrder: '2026-05-01', contact: 'Mike Johnson', phone: '+1 (555) 555-0123', email: 'fleet@rapidheavy.com', location: 'Tacoma, WA', description: 'Provides tower cranes, excavators, concrete pumps, telehandlers, and operators.', compliance: 'Pending Documents', catalogStatus: 'Revision Needed', catalogItems: baseVendorCatalogItems['Equipment Rental'].slice(0, 2), requests: [{ id: 'REQ-CAT-003', scope: 'Equipment fleet catalog', requestedBy: 'Admin', requestedOn: '2026-05-10', dueDate: '2026-05-16', status: 'Revision Needed', priority: 'Urgent', note: 'Update certificates, operator availability, machine inspection dates, and rental terms.' }] },
  { id: 'VND-004', name: 'Vertex Digital Site Services', category: 'Service Partner', subcategory: 'Digital Twin', rating: 4.7, status: 'Approved', activeProjects: 6, lastOrder: '2026-05-15', contact: 'Amit Rao', phone: '+1 (555) 431-9087', email: 'delivery@vertexsite.com', location: 'San Jose, CA', description: 'Reality capture, digital twin, progress analytics, safety audits, and commissioning support.', compliance: 'Fully Compliant', catalogStatus: 'Not Requested', catalogItems: [], requests: [] },
];

const expansionSuffixes = ['North Region', 'Urban Works', 'Infrastructure', 'High-Rise', 'Fitout', 'Industrial', 'Fast Track', 'Preferred'];

function buildVendorDirectory(seeds: Vendor[], target = 220) {
  const vendors: Vendor[] = [];
  for (let index = 0; index < target; index += 1) {
    const seed = seeds[index % seeds.length];
    const variant = Math.floor(index / seeds.length);
    const suffix = expansionSuffixes[variant % expansionSuffixes.length];
    const status = VENDOR_STATUSES[(index + seed.id.length) % VENDOR_STATUSES.length];
    const catalogStatus = CATALOG_STATUSES[(index + seed.name.length) % CATALOG_STATUSES.length];
    const id = `VND-${String(index + 1).padStart(4, '0')}`;
    const hasSharedCatalog = index < seeds.length ? seed.catalogStatus === 'Shared' || seed.catalogStatus === 'Revision Needed' : catalogStatus === 'Shared' || catalogStatus === 'Revision Needed';
    const requestStatus = index < seeds.length ? seed.catalogStatus : catalogStatus;
    const requests = requestStatus === 'Not Requested' ? [] : [{
      id: `REQ-CAT-${String(index + 1).padStart(4, '0')}`,
      scope: CATALOG_SCOPES[index % CATALOG_SCOPES.length],
      requestedBy: 'Admin',
      requestedOn: `2026-05-${String(1 + (index % 17)).padStart(2, '0')}`,
      dueDate: `2026-05-${String(8 + (index % 18)).padStart(2, '0')}`,
      status: requestStatus,
      priority: index % 7 === 0 ? 'Urgent' : index % 3 === 0 ? 'High' : 'Normal',
      note: 'Share catalog scope with rates, availability, lead times, specifications, and compliance-backed attachments.',
    } as VendorCatalogRequest];
    vendors.push({
      ...seed,
      id,
      name: variant === 0 ? seed.name : `${seed.name} ${suffix}`,
      status: index < seeds.length ? seed.status : status,
      catalogStatus: index < seeds.length ? seed.catalogStatus : catalogStatus,
      rating: Number(Math.min(4.9, Math.max(3.6, seed.rating + ((variant % 7) - 3) * 0.08)).toFixed(1)),
      activeProjects: Math.max(0, seed.activeProjects + (variant % 5) - 2),
      lastOrder: `2026-05-${String(1 + (index % 18)).padStart(2, '0')}`,
      contact: variant === 0 ? seed.contact : `${seed.contact.split(' ')[0]} ${suffix.split(' ')[0]}`,
      email: variant === 0 ? seed.email : `catalog.${id.toLowerCase()}@vendor-network.com`,
      catalogItems: hasSharedCatalog ? baseVendorCatalogItems[seed.category].map((item, itemIndex) => ({
        ...item,
        id: `${id}-CAT-${itemIndex + 1}`,
        rate: Math.round(item.rate * (1 + ((variant % 6) - 2) * 0.04)),
      })) : [],
      requests,
    });
  }
  return vendors;
}

function formatRate(rate: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: rate < 100 ? 2 : 0 }).format(rate);
}

function CategoryBadge({ category }: { category: VendorCategory }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${categoryTone[category]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {category}
    </span>
  );
}

export default function VendorCatalog({ onBack: _onBack }: { onBack: () => void }) {
  const [activeView, setActiveView] = useState<'library' | 'vendor-portal' | 'approval'>('library');
  const [selectedProject, setSelectedProject] = useState('Downtown Tower Complex');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCatalogStatus, setFilterCatalogStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendorOverrides, setVendorOverrides] = useState<Record<string, Vendor>>({});
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isRequestModalOpen, setRequestModalOpen] = useState(false);
  const [requestVendor, setRequestVendor] = useState<Vendor | null>(null);
  const [requestDraft, setRequestDraft] = useState({ scope: 'Full material catalog', dueDate: '', priority: 'Normal' as VendorCatalogRequest['priority'], note: '' });
  const [detailTab, setDetailTab] = useState<'overview' | 'catalog' | 'requests' | 'compliance'>('overview');

  const vendorDirectory = useMemo(() => (
    buildVendorDirectory(vendorSeeds, 220).map(vendor => vendorOverrides[vendor.id] ?? vendor)
  ), [vendorOverrides]);

  const filteredVendors = useMemo(() => {
    const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return vendorDirectory.filter(vendor => {
      const searchable = [
        vendor.id,
        vendor.name,
        vendor.category,
        vendor.subcategory,
        vendor.contact,
        vendor.email,
        vendor.location,
        vendor.status,
        vendor.catalogStatus,
        vendor.compliance,
        ...vendor.catalogItems.map(item => `${item.name} ${item.category} ${item.type}`),
      ].join(' ').toLowerCase();
      return (tokens.length === 0 || tokens.every(token => searchable.includes(token)))
        && (filterCategory === 'All' || vendor.category === filterCategory)
        && (filterStatus === 'All' || vendor.status === filterStatus)
        && (filterCatalogStatus === 'All' || vendor.catalogStatus === filterCatalogStatus);
    });
  }, [filterCatalogStatus, filterCategory, filterStatus, searchQuery, vendorDirectory]);

  const requestedVendors = vendorDirectory.filter(vendor => vendor.requests.some(request => request.status === 'Requested' || request.status === 'Revision Needed'));
  const sharedCatalogCount = vendorDirectory.filter(vendor => vendor.catalogStatus === 'Shared').length;
  const pendingApprovalCount = vendorDirectory.filter(vendor => vendor.status !== 'Approved').length;
  const totalPages = Math.max(1, Math.ceil(filteredVendors.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * pageSize;
  const pageEndIndex = Math.min(pageStartIndex + pageSize, filteredVendors.length);
  const paginatedVendors = filteredVendors.slice(pageStartIndex, pageEndIndex);
  const activeFilterCount = [filterCategory, filterStatus, filterCatalogStatus].filter(value => value !== 'All').length;

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCategory, filterStatus, filterCatalogStatus, searchQuery, pageSize]);

  const getVendorSignals = (vendor: Vendor) => {
    const seed = Array.from(vendor.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const trendScore = Math.min(96, Math.round(vendor.rating * 18) + (seed % 10));
    const demandScore = 52 + ((seed * 7) % 43);
    const catalogReadiness = vendor.catalogStatus === 'Shared' ? 92 : vendor.catalogStatus === 'Revision Needed' ? 62 : vendor.catalogStatus === 'Requested' ? 45 : 20;
    const fulfillmentScore = vendor.status === 'Approved' && vendor.compliance === 'Fully Compliant' ? 91 : vendor.status === 'Blocked' ? 32 : 64;
    const responseHours = vendor.catalogStatus === 'Shared' ? 12 + (seed % 20) : 48 + (seed % 72);
    const activeItems = vendor.catalogItems.length;
    const complianceScore = vendor.compliance === 'Fully Compliant' ? 94 : vendor.compliance === 'Pending Documents' ? 58 : 72;
    return { trendScore, demandScore, catalogReadiness, fulfillmentScore, responseHours, activeItems, complianceScore };
  };

  const openVendorDetail = (vendor: Vendor, tab: typeof detailTab = 'overview') => {
    setSelectedVendor(vendor);
    setDetailTab(tab);
    setDetailModalOpen(true);
  };

  const openCatalogRequest = (vendor: Vendor) => {
    setRequestVendor(vendor);
    setRequestDraft({
      scope: CATALOG_SCOPES[0],
      dueDate: '',
      priority: 'Normal',
      note: `Please share ${vendor.subcategory} catalog with item rates, lead times, availability, specs, and compliance references.`,
    });
    setRequestModalOpen(true);
  };

  const submitCatalogRequest = () => {
    if (!requestVendor) return;
    if (!requestDraft.dueDate) {
      toast.error('Select catalog due date.');
      return;
    }
    const request: VendorCatalogRequest = {
      id: `REQ-CAT-${Date.now()}`,
      scope: requestDraft.scope,
      requestedBy: 'Admin',
      requestedOn: '2026-05-19',
      dueDate: requestDraft.dueDate,
      status: 'Requested',
      priority: requestDraft.priority,
      note: requestDraft.note,
    };
    const updatedVendor: Vendor = {
      ...requestVendor,
      catalogStatus: 'Requested',
      requests: [request, ...requestVendor.requests],
    };
    setVendorOverrides(prev => ({ ...prev, [updatedVendor.id]: updatedVendor }));
    setSelectedVendor(current => current?.id === updatedVendor.id ? updatedVendor : current);
    setRequestModalOpen(false);
    toast.success(`Catalog request sent to ${updatedVendor.name}.`);
  };

  const shareCatalogFromVendor = (vendor: Vendor) => {
    const request = vendor.requests.find(item => item.status === 'Requested' || item.status === 'Revision Needed');
    const updatedRequests = vendor.requests.map(item => (
      item.id === request?.id ? { ...item, status: 'Shared' as RequestStatus } : item
    ));
    const updatedVendor: Vendor = {
      ...vendor,
      catalogStatus: 'Shared',
      catalogItems: baseVendorCatalogItems[vendor.category].map((item, index) => ({
        ...item,
        id: `${vendor.id}-CAT-${index + 1}`,
      })),
      requests: updatedRequests.length ? updatedRequests : [{
        id: `REQ-CAT-${Date.now()}`,
        scope: 'Vendor shared catalog',
        requestedBy: 'Vendor',
        requestedOn: '2026-05-19',
        dueDate: '2026-05-19',
        status: 'Shared',
        priority: 'Normal',
        note: 'Vendor proactively shared catalog for admin review.',
      }],
    };
    setVendorOverrides(prev => ({ ...prev, [updatedVendor.id]: updatedVendor }));
    setSelectedVendor(current => current?.id === updatedVendor.id ? updatedVendor : current);
    toast.success(`${vendor.name} shared catalog with admin.`);
  };

  const markRevisionNeeded = (vendor: Vendor) => {
    const updatedVendor: Vendor = {
      ...vendor,
      catalogStatus: 'Revision Needed',
      requests: vendor.requests.length
        ? vendor.requests.map((request, index) => index === 0 ? { ...request, status: 'Revision Needed' } : request)
        : [{
          id: `REQ-CAT-${Date.now()}`,
          scope: 'Catalog revision',
          requestedBy: 'Admin',
          requestedOn: '2026-05-19',
          dueDate: '2026-05-24',
          status: 'Revision Needed',
          priority: 'High',
          note: 'Admin requested corrections to catalog rate, availability, or compliance mapping.',
        }],
    };
    setVendorOverrides(prev => ({ ...prev, [updatedVendor.id]: updatedVendor }));
    setSelectedVendor(current => current?.id === updatedVendor.id ? updatedVendor : current);
    toast.info('Revision request sent to vendor.');
  };

  const approveVendorCatalog = (vendor: Vendor) => {
    const updatedVendor = { ...vendor, catalogStatus: 'Shared' as RequestStatus, status: 'Approved' as VendorStatus };
    setVendorOverrides(prev => ({ ...prev, [updatedVendor.id]: updatedVendor }));
    setSelectedVendor(current => current?.id === updatedVendor.id ? updatedVendor : current);
    toast.success('Vendor catalog approved for admin use.');
  };

  const clearFilters = () => {
    setFilterCategory('All');
    setFilterStatus('All');
    setFilterCatalogStatus('All');
    setSearchQuery('');
  };

  const sidebarMenu = [
    { id: 'library' as const, label: 'Vendor Directory', icon: Library, count: vendorDirectory.length },
    { id: 'vendor-portal' as const, label: 'Vendor View', icon: Store, count: requestedVendors.length },
    { id: 'approval' as const, label: 'Approval Queue', icon: CheckSquare, count: pendingApprovalCount },
  ];

  return (
    <div className="space-y-3 font-sans pb-10 relative">
      {isRequestModalOpen && requestVendor && (
        <div className="fixed inset-0 z-[220] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Request Vendor Catalog</h3>
                <p className="mt-0.5 text-xs text-slate-500">{requestVendor.name} will see this in Vendor View.</p>
              </div>
              <button onClick={() => setRequestModalOpen(false)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Catalog scope</label>
                <CatalogSelect value={requestDraft.scope} onChange={event => setRequestDraft(draft => ({ ...draft, scope: event.target.value }))} containerClassName="w-full">
                  {CATALOG_SCOPES.map(scope => <option key={scope}>{scope}</option>)}
                </CatalogSelect>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Due date</label>
                  <input type="date" value={requestDraft.dueDate} onChange={event => setRequestDraft(draft => ({ ...draft, dueDate: event.target.value }))} className="h-9 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Priority</label>
                  <CatalogSelect value={requestDraft.priority} onChange={event => setRequestDraft(draft => ({ ...draft, priority: event.target.value as VendorCatalogRequest['priority'] }))} containerClassName="w-full">
                    <option>Normal</option><option>High</option><option>Urgent</option>
                  </CatalogSelect>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Admin note</label>
                <textarea rows={4} value={requestDraft.note} onChange={event => setRequestDraft(draft => ({ ...draft, note: event.target.value }))} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400" />
              </div>
              <button onClick={submitCatalogRequest} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700">
                <Send className="h-4 w-4" /> Send Request to Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedVendor && (() => {
        const signals = getVendorSignals(selectedVendor);
        return (
          <div className="fixed inset-0 z-[200] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-inner">
                    <Store className="h-5 w-5 text-slate-500" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-slate-900">{selectedVendor.name}</h2>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-500">{selectedVendor.id}</span>
                      <CategoryBadge category={selectedVendor.category} />
                      <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${requestTone[selectedVendor.catalogStatus]}`}>{selectedVendor.catalogStatus}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button onClick={() => openCatalogRequest(selectedVendor)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"><Send className="h-3.5 w-3.5" /> Request Catalog</button>
                  <button onClick={() => setDetailModalOpen(false)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-600"><X className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/40 p-4">
                <div className="mb-4 grid gap-2 md:grid-cols-4">
                  <section className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                    <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-800">Vendor Trend</span><span className="text-lg font-black text-slate-950">{signals.trendScore}%</span></div>
                    <p className="mt-1.5 text-[11px] font-medium text-blue-700">{selectedVendor.rating} rating score</p>
                  </section>
                  <section className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                    <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">Demand</span><span className="text-lg font-black text-slate-950">{signals.demandScore}%</span></div>
                    <p className="mt-1.5 text-[11px] font-medium text-amber-700">{selectedVendor.activeProjects} active projects</p>
                  </section>
                  <section className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                    <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">Catalog</span><span className="text-lg font-black text-slate-950">{signals.catalogReadiness}%</span></div>
                    <p className="mt-1.5 text-[11px] font-medium text-emerald-700">{signals.activeItems} shared items</p>
                  </section>
                  <section className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Compliance</span><span className="text-lg font-black text-slate-950">{signals.complianceScore}%</span></div>
                    <p className="mt-1.5 text-[11px] font-medium text-slate-500">{selectedVendor.compliance}</p>
                  </section>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <CatalogTabStrip
                    tabs={[
                      { key: 'overview', label: 'Overview' },
                      { key: 'catalog', label: 'Vendor Catalog', count: selectedVendor.catalogItems.length },
                      { key: 'requests', label: 'Catalog Requests', count: selectedVendor.requests.length },
                      { key: 'compliance', label: 'Compliance' },
                    ]}
                    activeKey={detailTab}
                    onChange={setDetailTab}
                    className="bg-white"
                  />

                  {detailTab === 'overview' && (
                    <div className="grid gap-4 p-4 xl:grid-cols-[1fr_320px]">
                      <section className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Vendor Profile</h3>
                        <p className="text-sm leading-relaxed text-slate-600">{selectedVendor.description}</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedVendor.contact}</p></div>
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedVendor.location}</p></div>
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedVendor.phone}</p></div>
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</p><p className="mt-1 text-sm font-semibold text-slate-800">{selectedVendor.email}</p></div>
                        </div>
                      </section>
                      <section className="rounded-xl border border-slate-100 bg-white p-4">
                        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">Admin Actions</h3>
                        <div className="space-y-2">
                          <button onClick={() => openCatalogRequest(selectedVendor)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"><Send className="h-3.5 w-3.5" /> Request Catalog</button>
                          <button onClick={() => approveVendorCatalog(selectedVendor)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"><Check className="h-3.5 w-3.5" /> Approve Catalog</button>
                          <button onClick={() => markRevisionNeeded(selectedVendor)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"><MessageSquare className="h-3.5 w-3.5" /> Ask Revision</button>
                          <button onClick={() => toast.success(`Vendor catalog exported for ${selectedVendor.name}.`)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><Download className="h-3.5 w-3.5" /> Export Catalog</button>
                        </div>
                      </section>
                    </div>
                  )}

                  {detailTab === 'catalog' && (
                    <div className="p-4">
                      {selectedVendor.catalogItems.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                          <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                          <p className="font-bold text-slate-900">No shared vendor catalog yet</p>
                          <p className="mt-1 text-sm text-slate-500">Request catalog from admin side. Vendor will see the request and share catalog back.</p>
                          <button onClick={() => openCatalogRequest(selectedVendor)} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700">Request Catalog</button>
                        </div>
                      ) : (
                        <div className="overflow-auto rounded-xl border border-slate-200">
                          <table className="w-full min-w-[820px] border-collapse text-left text-sm">
                            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                              <tr><th className="p-3">Catalog Item</th><th className="p-3">Type</th><th className="p-3">Category</th><th className="p-3">Rate</th><th className="p-3">Availability</th><th className="p-3">Lead Time</th><th className="p-3">Tags</th></tr>
                            </thead>
                            <tbody>
                              {selectedVendor.catalogItems.map(item => (
                                <tr key={item.id} className="border-t border-slate-100">
                                  <td className="p-3"><p className="font-bold text-slate-900">{item.name}</p><p className="font-mono text-[10px] text-slate-400">{item.id}</p></td>
                                  <td className="p-3 text-slate-600">{item.type}</td>
                                  <td className="p-3 text-slate-600">{item.category}</td>
                                  <td className="p-3 font-bold text-slate-900">{formatRate(item.rate)} <span className="text-[10px] font-semibold text-slate-400">/{item.unit}</span></td>
                                  <td className="p-3 text-slate-600">{item.availability}</td>
                                  <td className="p-3 text-slate-600">{item.leadTime}</td>
                                  <td className="p-3"><div className="flex flex-wrap gap-1">{item.tags.slice(0, 2).map(tag => <span key={tag} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{tag}</span>)}</div></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {detailTab === 'requests' && (
                    <div className="space-y-3 p-4">
                      {selectedVendor.requests.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No catalog requests have been sent to this vendor.</div>
                      ) : selectedVendor.requests.map(request => (
                        <div key={request.id} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div><p className="font-bold text-slate-900">{request.scope}</p><p className="mt-1 text-xs text-slate-500">{request.note}</p></div>
                            <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${requestTone[request.status]}`}>{request.status}</span>
                          </div>
                          <div className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-4">
                            <span>Requested: {request.requestedOn}</span><span>Due: {request.dueDate}</span><span>Priority: {request.priority}</span><span>ID: {request.id}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {detailTab === 'compliance' && (
                    <div className="grid gap-4 p-4 md:grid-cols-3">
                      {[
                        ['Compliance status', selectedVendor.compliance],
                        ['Response time', `${signals.responseHours} hrs`],
                        ['Fulfillment score', `${signals.fulfillmentScore}%`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                          <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="relative z-20 bg-white px-1 py-1">
        <div className="flex min-h-10 flex-wrap items-center gap-2">
          <CatalogProjectPicker selectedProject={selectedProject} onProjectChange={setSelectedProject} />
          <span className="hidden h-5 w-px bg-slate-200 lg:block" />
          <span className="mr-1 text-sm font-semibold text-slate-950">Vendors</span>

          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
            {sidebarMenu.map((tab) => {
              const active = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveView(tab.id)}
                  className={`relative flex h-8 shrink-0 items-center gap-1 px-1 text-xs font-semibold transition ${
                    active ? 'text-blue-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && <span className="text-[9px] text-slate-400">{tab.count}</span>}
                  {active && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-blue-600" />}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="h-8 w-48 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs outline-none transition focus:border-blue-400 focus:bg-white xl:w-60"
                value={searchQuery}
                onChange={event => setSearchQuery(event.target.value)}
              />
            </div>
            {activeView === 'library' && (
              <>
                <button
                  className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                    activeFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-label="Filters active"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {activeFilterCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">{activeFilterCount}</span>}
                </button>
                <CatalogSelect value={filterCategory} onChange={event => setFilterCategory(event.target.value)} containerClassName="hidden w-36 xl:inline-flex" className="!h-8 !min-w-0 !py-1">
                  <option>All</option>{VENDOR_CATEGORIES.map(category => <option key={category}>{category}</option>)}
                </CatalogSelect>
                <CatalogSelect value={pageSize} onChange={event => setPageSize(Number(event.target.value))} containerClassName="hidden w-24 xl:inline-flex" className="!h-8 !min-w-0 !py-1">
                  <option value={10}>10/page</option>
                  <option value={25}>25/page</option>
                  <option value={50}>50/page</option>
                  <option value={100}>100/page</option>
                </CatalogSelect>
                <button onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={safeCurrentPage === 1} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40" aria-label="Previous page">
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                <span className="rounded-xl bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-600">{safeCurrentPage}/{totalPages}</span>
                <button onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={safeCurrentPage === totalPages} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40" aria-label="Next page">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="flex h-8 items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                  <button onClick={() => setViewMode('list')} className={`rounded-lg p-1.5 transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <ListIcon className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setViewMode('grid')} className={`rounded-lg p-1.5 transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Grid3x3 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
            <button onClick={() => { const vendor = paginatedVendors[0] ?? vendorDirectory[0]; if (vendor) openCatalogRequest(vendor); }} className="flex h-8 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white shadow-sm shadow-blue-600/15 transition hover:bg-blue-700">
              <Send className="h-3.5 w-3.5" />
              Request Catalog
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {activeView === 'library' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <CatalogSelect value={filterCategory} onChange={event => setFilterCategory(event.target.value)}><option>All</option>{VENDOR_CATEGORIES.map(category => <option key={category}>{category}</option>)}</CatalogSelect>
              <CatalogSelect value={filterStatus} onChange={event => setFilterStatus(event.target.value)}><option>All</option>{VENDOR_STATUSES.map(status => <option key={status}>{status}</option>)}</CatalogSelect>
              <CatalogSelect value={filterCatalogStatus} onChange={event => setFilterCatalogStatus(event.target.value)}><option>All</option>{CATALOG_STATUSES.map(status => <option key={status}>{status}</option>)}</CatalogSelect>
              <button onClick={clearFilters} className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"><Filter className="h-3.5 w-3.5" /> Clear</button>
              <button onClick={() => { const vendor = paginatedVendors[0] ?? vendorDirectory[0]; if (vendor) openCatalogRequest(vendor); }} className="ml-auto flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"><Send className="h-3.5 w-3.5" /> Request Selected Vendor</button>
            </div>

            {filteredVendors.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                  <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-slate-900">No vendors found</h3>
                <p className="text-sm text-slate-500">Try adjusting vendor filters or search query.</p>
                <button onClick={clearFilters} className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100">Clear all filters</button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03]">
                <div className="flex-1 overflow-auto">
                  <table className="w-full min-w-[1120px] border-collapse text-left whitespace-nowrap">
                    <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/80">
                      <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        <th className="px-4 py-3">Vendor Details</th>
                        <th className="px-4 py-3">Category / Trade</th>
                        <th className="px-4 py-3 text-center">Rating</th>
                        <th className="px-4 py-3 text-right">Demand %</th>
                        <th className="px-4 py-3 text-right">Catalog %</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {paginatedVendors.map(vendor => {
                        const signals = getVendorSignals(vendor);
                        return (
                          <tr key={vendor.id} className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/30">
                            <td className="cursor-pointer px-4 py-3" onClick={() => openVendorDetail(vendor)}>
                              <p className="font-bold text-slate-900 transition-colors group-hover:text-blue-700">{vendor.name}</p>
                              <p className="mt-0.5 font-mono text-[11px] text-slate-400">{vendor.id} • {vendor.contact}</p>
                            </td>
                            <td className="px-4 py-3"><CategoryBadge category={vendor.category} /><p className="mt-1 text-[11px] text-slate-500">{vendor.subcategory}</p></td>
                            <td className="px-4 py-3 text-center"><span className="inline-flex items-center gap-1 font-bold text-slate-700"><Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {vendor.rating}</span></td>
                            <td className="px-4 py-3 text-right"><SignalCell value={signals.demandScore} /></td>
                            <td className="px-4 py-3 text-right"><SignalCell value={signals.catalogReadiness} /><p className="mt-1 text-[10px] text-slate-400">{vendor.catalogItems.length} items</p></td>
                            <td className="px-4 py-3"><span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusTone[vendor.status]}`}>{vendor.status}</span><p className={`mt-1 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${requestTone[vendor.catalogStatus]}`}>{vendor.catalogStatus}</p></td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button onClick={() => openVendorDetail(vendor)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                                <button onClick={() => openCatalogRequest(vendor)} className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700">Request</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
                {paginatedVendors.map(vendor => {
                  const signals = getVendorSignals(vendor);
                  return (
                    <div key={vendor.id} className="group rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                      <button onClick={() => openVendorDetail(vendor)} className="w-full text-left">
                        <div className="mb-3 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-mono text-[9px] text-slate-400">{vendor.id}</p>
                            <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-tight text-slate-900 transition-colors group-hover:text-blue-700">{vendor.name}</h3>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-1 text-[10px] font-bold text-amber-700"><Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {vendor.rating}</span>
                        </div>
                        <div className="flex max-h-7 flex-wrap gap-1 overflow-hidden">
                          <CategoryBadge category={vendor.category} />
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${requestTone[vendor.catalogStatus]}`}>{vendor.catalogStatus}</span>
                        </div>
                        <p className="mt-2 truncate text-[11px] font-semibold text-slate-500">{vendor.subcategory} • {vendor.location}</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                          <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Demand</p><SignalCell value={signals.demandScore} /></div>
                          <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Catalog</p><SignalCell value={signals.catalogReadiness} /></div>
                        </div>
                      </button>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => openVendorDetail(vendor)} className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700">View</button>
                        <button onClick={() => openCatalogRequest(vendor)} className="flex-1 rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-bold text-white hover:bg-blue-700">Request</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
              <span>Showing {filteredVendors.length === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex} of {filteredVendors.length.toLocaleString()} vendors</span>
              <span>{sharedCatalogCount} shared catalogs</span>
            </div>
          </div>
        )}

        {activeView === 'vendor-portal' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-lg font-bold text-slate-900">Vendor View: Catalog Requests</h2><p className="text-sm text-slate-500">This simulates what vendors see after admin sends catalog requests.</p></div>
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{requestedVendors.length} active requests</span>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {requestedVendors.slice(0, 24).map(vendor => (
                <section key={vendor.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div><p className="font-bold text-slate-900">{vendor.name}</p><p className="mt-1 text-xs text-slate-500">{vendor.email}</p></div>
                    <span className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${requestTone[vendor.catalogStatus]}`}>{vendor.catalogStatus}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    {vendor.requests.slice(0, 2).map(request => (
                      <div key={request.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-sm font-bold text-slate-900">{request.scope}</p>
                        <p className="mt-1 text-xs text-slate-500">{request.note}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold text-slate-500"><span>Due {request.dueDate}</span><span>{request.priority}</span><span>{request.id}</span></div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button onClick={() => shareCatalogFromVendor(vendor)} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">Share Catalog</button>
                    <button onClick={() => openVendorDetail(vendor, 'requests')} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Open Detail</button>
                  </div>
                </section>
              ))}
            </div>
          </div>
        )}

        {activeView === 'approval' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Approval Queue</h2>
                  <p className="text-sm text-slate-500">Vendor catalogs awaiting admin review, compliance clearance, or revision action.</p>
                </div>
                <button onClick={() => toast.info('Vendor approval queue refreshed.')} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"><CheckSquare className="h-4 w-4" /> Refresh Queue</button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[980px] border-collapse text-left">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr><th className="px-4 py-3">Vendor</th><th className="px-4 py-3">Trade</th><th className="px-4 py-3">Catalog</th><th className="px-4 py-3">Compliance</th><th className="px-4 py-3">Last Request</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="text-sm">
                  {vendorDirectory.filter(vendor => vendor.status !== 'Approved' || vendor.catalogStatus !== 'Shared').slice(0, 18).map(vendor => (
                    <tr key={`approval-${vendor.id}`} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3"><button onClick={() => openVendorDetail(vendor)} className="text-left"><p className="font-bold text-slate-900">{vendor.name}</p><p className="font-mono text-[11px] text-slate-400">{vendor.id}</p></button></td>
                      <td className="px-4 py-3"><CategoryBadge category={vendor.category} /><p className="mt-1 text-[11px] text-slate-500">{vendor.subcategory}</p></td>
                      <td className="px-4 py-3"><span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${requestTone[vendor.catalogStatus]}`}>{vendor.catalogStatus}</span></td>
                      <td className="px-4 py-3 text-slate-600">{vendor.compliance}</td>
                      <td className="px-4 py-3 text-slate-500">{vendor.requests[0]?.dueDate ?? 'Not requested'}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openVendorDetail(vendor)} className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Review</button>
                          <button onClick={() => approveVendorCatalog(vendor)} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">Approve</button>
                          <button onClick={() => markRevisionNeeded(vendor)} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100">Revise</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
