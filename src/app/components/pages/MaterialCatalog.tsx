import React, { useEffect, useMemo, useState } from 'react';
import { 
  Activity, Search, Filter, Plus, FileText, ChevronRight, LayoutDashboard, 
  Library, ListTree, UploadCloud, CheckSquare, Users, Tags, FileCheck2, 
  Files, HardHat, FileQuestion, Copy, History, ScrollText, Settings, 
  Package, AlertTriangle, CheckCircle2, XCircle, Clock, 
  MoreVertical, Eye, Edit2, Trash2, ShieldCheck, Download, Calendar, ArrowUpRight, Check, X,
  MapPin, Link2, ChevronDown, Grid3x3, List as ListIcon, Maximize2, ShoppingCart, Share2, Scale
} from 'lucide-react';
import { toast } from 'sonner';

// Service → subtle hue for the monogram fallback
const SERVICE_HUE: Record<string, string> = {
  HVAC:         'from-sky-50 to-sky-100 text-sky-400',
  Electrical:   'from-amber-50 to-amber-100 text-amber-400',
  Plumbing:     'from-blue-50 to-blue-100 text-blue-400',
  Civil:        'from-stone-50 to-stone-100 text-stone-400',
  Duct:         'from-slate-50 to-slate-100 text-slate-400',
  Painting:     'from-rose-50 to-rose-100 text-rose-400',
  Mechanical:   'from-violet-50 to-violet-100 text-violet-400',
  Architectural:'from-emerald-50 to-emerald-100 text-emerald-400',
  Structural:   'from-orange-50 to-orange-100 text-orange-400',
  Sitework:      'from-lime-50 to-lime-100 text-lime-500',
  'Site Survey': 'from-cyan-50 to-cyan-100 text-cyan-500',
  'Facility Management': 'from-indigo-50 to-indigo-100 text-indigo-500',
  'Digital Twin': 'from-fuchsia-50 to-fuchsia-100 text-fuchsia-500',
};

const SERVICE_BADGE_TONE: Record<string, string> = {
  HVAC: 'border-sky-200 bg-sky-50 text-sky-700',
  Electrical: 'border-amber-200 bg-amber-50 text-amber-700',
  Plumbing: 'border-blue-200 bg-blue-50 text-blue-700',
  Civil: 'border-stone-200 bg-stone-50 text-stone-700',
  Duct: 'border-slate-200 bg-slate-50 text-slate-700',
  Painting: 'border-rose-200 bg-rose-50 text-rose-700',
  Mechanical: 'border-violet-200 bg-violet-50 text-violet-700',
  Architectural: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  Structural: 'border-orange-200 bg-orange-50 text-orange-700',
  Sitework: 'border-lime-200 bg-lime-50 text-lime-700',
  'Site Survey': 'border-cyan-200 bg-cyan-50 text-cyan-700',
  'Facility Management': 'border-indigo-200 bg-indigo-50 text-indigo-700',
  'Digital Twin': 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  Concrete: 'border-zinc-200 bg-zinc-50 text-zinc-700',
  Masonry: 'border-red-200 bg-red-50 text-red-700',
  Waterproofing: 'border-teal-200 bg-teal-50 text-teal-700',
  Finishes: 'border-pink-200 bg-pink-50 text-pink-700',
};

function ServiceBadge({ service }: { service: string }) {
  const tone = SERVICE_BADGE_TONE[service] ?? 'border-slate-200 bg-slate-50 text-slate-700';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {service}
    </span>
  );
}

function MaterialImageFallback({ service, name, className = '' }: { service: string; name: string; className?: string }) {
  const hue = SERVICE_HUE[service] ?? 'from-slate-50 to-slate-100 text-slate-400';
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return (
    <div className={`w-full h-full bg-gradient-to-br ${hue} flex flex-col items-center justify-center gap-0.5 select-none ${className}`}>
      <span className="text-xl font-black tracking-tight opacity-60">{initials}</span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-40">{service}</span>
    </div>
  );
}

function MaterialThumbnail({ src, service, name, className = '' }: { src?: string; service: string; name: string; className?: string }) {
  const [errored, setErrored] = React.useState(false);
  React.useEffect(() => setErrored(false), [src]);
  if (!src || errored) return <MaterialImageFallback service={service} name={name} className={className} />;
  return <img src={src} alt={name} className={`w-full h-full object-cover ${className}`} onError={() => setErrored(true)} />;
}

function SignalCell({ value }: { value: number }) {
  const tone = value >= 80
    ? 'bg-red-50 text-red-700 border-red-100'
    : value >= 65
      ? 'bg-amber-50 text-amber-700 border-amber-100'
      : 'bg-emerald-50 text-emerald-700 border-emerald-100';

  return (
    <span className={`inline-flex min-w-[48px] justify-center rounded-md border px-2 py-1 text-xs font-black ${tone}`}>
      {value}%
    </span>
  );
}

// Custom Dropdown matching Resource Flow
function CatalogSelect({
  children,
  className = "",
  containerClassName = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { containerClassName?: string }) {
  return (
    <span className={`group relative inline-flex ${containerClassName}`}>
      <select
        {...props}
        className={`h-9 w-full min-w-[132px] appearance-none rounded-xl border border-slate-200 bg-white/95 py-2 pl-3.5 pr-10 text-xs font-medium text-slate-700 shadow-sm shadow-slate-950/[0.03] outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 ${className}`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition group-hover:bg-white group-hover:text-slate-600 group-focus-within:bg-blue-50 group-focus-within:text-blue-600">
        <ChevronDown className="h-3.5 w-3.5" />
      </span>
    </span>
  );
}

// Custom Tab Strip matching Resource Flow
type CatalogTabItem<T extends string> = { key: T; label: string; count?: number | string; };
function CatalogTabStrip<T extends string>({ tabs, activeKey, onChange, className = "" }: { tabs: CatalogTabItem<T>[]; activeKey: T; onChange: (key: T) => void; className?: string; }) {
  return (
    <div className={`overflow-x-auto scrollbar-hide ${className}`}>
      <div className="inline-flex min-w-max gap-5 border-b border-slate-200 px-2">
        {tabs.map((tab) => {
          const active = activeKey === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onChange(tab.key)}
              className={`relative inline-flex h-11 shrink-0 items-center gap-1.5 px-1 text-sm font-medium transition-colors duration-200 ease-out ${
                active ? "text-slate-950" : "text-slate-400 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && <span className={`text-[10px] ${active ? "text-slate-500" : "text-slate-300"}`}>{tab.count}</span>}
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
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="group inline-flex h-8 items-center gap-2 rounded-xl px-1 transition hover:bg-slate-50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/15">
          <Activity className="h-3.5 w-3.5" />
        </span>
        <span className="max-w-[240px] truncate text-sm font-medium text-slate-950">{selectedProject}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-8 top-9 z-50 w-[318px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15">
          <CatalogTabStrip
            className="mb-2"
            tabs={[
              { key: 'my', label: 'My Projects' },
              { key: 'shared', label: 'Shared' },
            ]}
            activeKey={tab}
            onChange={setTab}
          />
          <div className="max-h-[280px] overflow-y-auto py-1">
            {visibleProjects.map((project) => (
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

type CatalogMaterial = {
  id: string;
  name: string;
  service: string;
  category: string;
  brand: string;
  price: number;
  unit: string;
  availability: string;
  phase?: string;
  features: string[];
  image: string;
  description: string;
  specs: Record<string, string>;
};

type MaterialSeed = {
  service: string;
  category: string;
  name: string;
  unit: string;
  price: number;
  spec: string;
  phase?: string;
  features: string[];
};

const MATERIAL_SERVICE_IMAGES: Record<string, string> = {
  Civil: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200',
  Concrete: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200',
  Structural: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=200',
  Masonry: 'https://images.unsplash.com/photo-1597645587822-e99fa5d45d25?auto=format&fit=crop&q=80&w=200',
  Architectural: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=200',
  Finishes: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200',
  Electrical: 'https://images.unsplash.com/photo-1558434440-422ce0bc27a1?auto=format&fit=crop&q=80&w=200',
  Plumbing: 'https://images.unsplash.com/photo-1585074245698-eaac8b560644?auto=format&fit=crop&q=80&w=200',
  HVAC: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200',
  Mechanical: 'https://images.unsplash.com/photo-1621616710411-cf0d5b40cb7f?auto=format&fit=crop&q=80&w=200',
  Waterproofing: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200',
  Sitework: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200',
  'Site Survey': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=200',
  'Facility Management': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=200',
  'Digital Twin': 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&q=80&w=200',
};

const MATERIAL_BRANDS: Record<string, string[]> = {
  Civil: ['Cemex', 'UltraTech', 'LafargeHolcim', 'ACC', 'Ambuja', 'Sika'],
  Concrete: ['BASF Master Builders', 'Sika', 'Fosroc', 'Euclid Chemical', 'Mapei', 'Cemex'],
  Structural: ['Nucor', 'Tata Steel', 'JSW Steel', 'ArcelorMittal', 'SAIL', 'Steel Dynamics'],
  Masonry: ['Boral', 'Oldcastle', 'Acme Brick', 'Siporex', 'Xella', 'County Materials'],
  Architectural: ['Armstrong', 'USG', 'Saint-Gobain', 'Knauf', 'Tremco', 'Hunter Douglas'],
  Finishes: ['Sherwin-Williams', 'Asian Paints', 'Berger', 'Jotun', 'Dulux', 'Nippon Paint'],
  Electrical: ['Southwire', 'Schneider Electric', 'Siemens', 'Legrand', 'ABB', 'Havells'],
  Plumbing: ['Charlotte Pipe', 'Astral Pipes', 'Uponor', 'Geberit', 'Kohler', 'Jaquar'],
  HVAC: ['Trane', 'Carrier', 'Daikin', 'Johnson Controls', 'Blue Star', 'Mitsubishi Electric'],
  Mechanical: ['Grundfos', 'Wilo', 'Zoeller', 'Xylem', 'Kirloskar', 'KSB'],
  Waterproofing: ['Sika', 'Fosroc', 'Tremco', 'GCP Applied Technologies', 'Mapei', 'Pidilite'],
  Sitework: ['Caterpillar', 'Tata Hitachi', 'Wirtgen', 'Hilti', 'Bosch', 'Stanley'],
  'Site Survey': ['Trimble', 'Leica Geosystems', 'Topcon', 'DJI Enterprise', 'Bosch', 'Hilti'],
  'Facility Management': ['Johnson Controls', 'Honeywell', 'Schneider Electric', 'Siemens', '3M', 'Brady'],
  'Digital Twin': ['Autodesk', 'Bentley Systems', 'Matterport', 'Disruptive Technologies', 'Siemens', 'Bosch'],
};

const MATERIAL_PHASES = ['Site Survey', 'Pre-Construction', 'Construction', 'Facility Management Coordination', 'Digital Twin'];

const MATERIAL_SEEDS: MaterialSeed[] = [
  { service: 'Civil', category: 'Binders', name: 'Portland Cement', unit: 'Bag (50kg)', price: 8.5, spec: 'ASTM C150', features: ['High Strength', 'General Purpose', 'Factory Tested'] },
  { service: 'Civil', category: 'Binders', name: 'Blended Cement PPC', unit: 'Bag (50kg)', price: 7.8, spec: 'IS 1489', features: ['Low Heat', 'Durable', 'Fly Ash Blend'] },
  { service: 'Civil', category: 'Aggregates', name: 'Crushed Stone Aggregate', unit: 'Ton', price: 38, spec: 'ASTM C33', features: ['Washed', 'Graded', 'Concrete Ready'] },
  { service: 'Civil', category: 'Aggregates', name: 'River Sand', unit: 'Cubic Meter', price: 32, spec: 'Zone II', features: ['Washed', 'Fine Aggregate', 'Low Silt'] },
  { service: 'Civil', category: 'Aggregates', name: 'Manufactured Sand', unit: 'Ton', price: 29, spec: 'IS 383', features: ['Cubical Shape', 'Controlled Gradation', 'Low Silt'] },
  { service: 'Civil', category: 'Admixtures', name: 'Superplasticizer Admixture', unit: 'Liter', price: 2.6, spec: 'ASTM C494 Type F', features: ['Water Reducing', 'High Workability', 'Chloride Free'] },
  { service: 'Civil', category: 'Admixtures', name: 'Concrete Curing Compound', unit: 'Drum', price: 145, spec: 'ASTM C309', features: ['Membrane Forming', 'Moisture Retention', 'Spray Applied'] },
  { service: 'Concrete', category: 'Ready Mix', name: 'Ready Mix Concrete', unit: 'Cubic Meter', price: 92, spec: 'M25', features: ['Batch Plant Mixed', 'Pumpable', 'Slump Controlled'] },
  { service: 'Concrete', category: 'Ready Mix', name: 'Self Compacting Concrete', unit: 'Cubic Meter', price: 128, spec: 'SCC M40', features: ['High Flow', 'No Vibration', 'Dense Finish'] },
  { service: 'Concrete', category: 'Repair Mortars', name: 'Polymer Modified Repair Mortar', unit: 'Bag (25kg)', price: 24, spec: 'EN 1504', features: ['Shrinkage Compensated', 'High Bond', 'Fiber Reinforced'] },
  { service: 'Concrete', category: 'Grouts', name: 'Non Shrink Cementitious Grout', unit: 'Bag (25kg)', price: 18, spec: 'ASTM C1107', features: ['Non Shrink', 'Flowable', 'High Early Strength'] },
  { service: 'Structural', category: 'Reinforcement', name: 'TMT Rebar', unit: 'Ton', price: 720, spec: 'Fe 500D', features: ['Ductile', 'Earthquake Resistant', 'Ribbed'] },
  { service: 'Structural', category: 'Reinforcement', name: 'Epoxy Coated Rebar', unit: 'Ton', price: 980, spec: 'ASTM A775', features: ['Corrosion Resistant', 'Fusion Bonded', 'Bridge Grade'] },
  { service: 'Structural', category: 'Structural Steel', name: 'Wide Flange Beam', unit: 'Ton', price: 1200, spec: 'ASTM A992', features: ['High Yield', 'Mill Certified', 'Structural Grade'] },
  { service: 'Structural', category: 'Structural Steel', name: 'Steel Channel Section', unit: 'Ton', price: 1100, spec: 'ISMC', features: ['Hot Rolled', 'Straight Length', 'Prime Steel'] },
  { service: 'Structural', category: 'Metal Decking', name: 'Galvanized Metal Deck Sheet', unit: 'Sq. Meter', price: 18, spec: 'G90', features: ['Composite Deck', 'Ribbed Profile', 'Galvanized'] },
  { service: 'Structural', category: 'Fasteners', name: 'High Strength Bolt Assembly', unit: 'Box', price: 64, spec: 'ASTM A325', features: ['Nut Washer Set', 'Structural Joint', 'Zinc Plated'] },
  { service: 'Masonry', category: 'Blocks', name: 'Concrete Masonry Unit', unit: 'Piece', price: 1.8, spec: 'ASTM C90', features: ['Load Bearing', 'Hollow Core', 'Uniform Size'] },
  { service: 'Masonry', category: 'Blocks', name: 'AAC Block', unit: 'Cubic Meter', price: 56, spec: 'IS 2185', features: ['Lightweight', 'Thermal Insulation', 'Easy Cutting'] },
  { service: 'Masonry', category: 'Bricks', name: 'Clay Burnt Brick', unit: 'Thousand', price: 180, spec: 'Class A', features: ['Compressive Strength', 'Low Absorption', 'Kiln Fired'] },
  { service: 'Masonry', category: 'Mortars', name: 'Block Jointing Mortar', unit: 'Bag (40kg)', price: 7.4, spec: 'Thin Bed', features: ['Premixed', 'High Bond', 'Water Retentive'] },
  { service: 'Waterproofing', category: 'Membranes', name: 'APP Modified Bitumen Membrane', unit: 'Roll', price: 68, spec: '4mm', features: ['Torch Applied', 'Polyester Reinforced', 'UV Stable'] },
  { service: 'Waterproofing', category: 'Coatings', name: 'Liquid Applied Waterproof Coating', unit: 'Bucket', price: 82, spec: 'Elastomeric', features: ['Seamless', 'Flexible', 'Crack Bridging'] },
  { service: 'Waterproofing', category: 'Sealants', name: 'Polyurethane Joint Sealant', unit: 'Cartridge', price: 6.5, spec: 'ASTM C920', features: ['Elastic', 'Weather Resistant', 'Paintable'] },
  { service: 'Waterproofing', category: 'Insulation', name: 'Extruded Polystyrene Board', unit: 'Sq. Meter', price: 9.5, spec: 'XPS 50mm', features: ['Closed Cell', 'Thermal Insulation', 'Moisture Resistant'] },
  { service: 'Architectural', category: 'Gypsum', name: 'Fire Rated Gypsum Board', unit: 'Sheet', price: 14.2, spec: 'ASTM C1396 Type X', features: ['Fire Rated', 'Tapered Edge', 'Interior Use'] },
  { service: 'Architectural', category: 'Ceilings', name: 'Acoustic Ceiling Tile', unit: 'Carton', price: 65, spec: 'NRC 0.70', features: ['Sound Absorbing', 'Lay In Grid', 'Mold Resistant'] },
  { service: 'Architectural', category: 'Doors', name: 'Flush Door Shutter', unit: 'Piece', price: 135, spec: 'Solid Core', features: ['Factory Pressed', 'Laminate Ready', 'Moisture Resistant'] },
  { service: 'Architectural', category: 'Glazing', name: 'Toughened Glass Panel', unit: 'Sq. Meter', price: 42, spec: '10mm', features: ['Tempered', 'Polished Edge', 'Safety Glass'] },
  { service: 'Architectural', category: 'Hardware', name: 'Door Closer', unit: 'Piece', price: 38, spec: 'EN 1154', features: ['Adjustable Speed', 'Rack Pinion', 'Fire Door Rated'] },
  { service: 'Finishes', category: 'Paints', name: 'Interior Acrylic Emulsion Paint', unit: 'Bucket', price: 185, spec: 'Low VOC', features: ['Washable', 'Fast Drying', 'Smooth Finish'] },
  { service: 'Finishes', category: 'Paints', name: 'Epoxy Floor Coating', unit: 'Kit', price: 260, spec: '2K Epoxy', features: ['Abrasion Resistant', 'Chemical Resistant', 'Gloss Finish'] },
  { service: 'Finishes', category: 'Tiles', name: 'Vitrified Floor Tile', unit: 'Sq. Meter', price: 14, spec: '600x600mm', features: ['Low Water Absorption', 'Polished', 'Rectified Edge'] },
  { service: 'Finishes', category: 'Stone', name: 'Granite Slab', unit: 'Sq. Meter', price: 62, spec: '20mm', features: ['Natural Stone', 'Polished', 'High Durability'] },
  { service: 'Finishes', category: 'Flooring', name: 'Luxury Vinyl Tile', unit: 'Sq. Meter', price: 24, spec: '5mm Wear Layer', features: ['Waterproof', 'Click Lock', 'Commercial Grade'] },
  { service: 'Electrical', category: 'Wiring', name: 'THHN Copper Wire', unit: 'Roll (500ft)', price: 85, spec: 'UL 83', features: ['Copper Conductor', 'Nylon Jacketed', '600V Rated'] },
  { service: 'Electrical', category: 'Cables', name: 'XLPE Armoured Power Cable', unit: 'Meter', price: 18, spec: 'IEC 60502', features: ['Armoured', 'XLPE Insulated', 'UV Resistant'] },
  { service: 'Electrical', category: 'Conduits', name: 'Rigid PVC Electrical Conduit', unit: 'Length (10ft)', price: 6, spec: 'Schedule 40', features: ['Flame Retardant', 'Impact Resistant', 'Solvent Welded'] },
  { service: 'Electrical', category: 'Switchgear', name: 'MCCB Breaker', unit: 'Piece', price: 210, spec: '100A 4P', features: ['Thermal Magnetic', 'Adjustable Trip', 'Panel Mount'] },
  { service: 'Electrical', category: 'Lighting', name: 'LED Panel Light', unit: 'Piece', price: 32, spec: '36W 600x600', features: ['High Lumen', 'Low Glare', 'Driver Included'] },
  { service: 'Electrical', category: 'Containment', name: 'Cable Tray Ladder Type', unit: 'Meter', price: 22, spec: 'GI 300mm', features: ['Hot Dip Galvanized', 'Heavy Duty', 'Coupler Included'] },
  { service: 'Plumbing', category: 'Piping', name: 'PVC Pipe Schedule 40', unit: 'Length (10ft)', price: 45, spec: 'ASTM D1785', features: ['Corrosion Resistant', 'Lightweight', 'Solvent Weld'] },
  { service: 'Plumbing', category: 'Piping', name: 'CPVC Hot Water Pipe', unit: 'Length (3m)', price: 12, spec: 'SDR 11', features: ['Hot Water Rated', 'Chlorine Resistant', 'Low Thermal Conductivity'] },
  { service: 'Plumbing', category: 'Piping', name: 'HDPE Pipe', unit: 'Meter', price: 8.5, spec: 'PE100 PN10', features: ['Flexible', 'Fusion Welded', 'High Impact'] },
  { service: 'Plumbing', category: 'Valves', name: 'Butterfly Valve', unit: 'Piece', price: 95, spec: 'PN16', features: ['Wafer Type', 'EPDM Seat', 'Ductile Iron Body'] },
  { service: 'Plumbing', category: 'Fixtures', name: 'Wall Hung WC', unit: 'Piece', price: 185, spec: 'Ceramic', features: ['Concealed Cistern', 'Dual Flush', 'Glazed Surface'] },
  { service: 'Plumbing', category: 'Fittings', name: 'Brass Ball Valve', unit: 'Piece', price: 14, spec: 'Full Bore', features: ['Brass Body', 'Threaded Ends', 'Quarter Turn'] },
  { service: 'HVAC', category: 'Equipment', name: 'Air Handling Unit', unit: 'Unit', price: 12500, spec: '5000 CFM', features: ['Variable Speed', 'MERV 13', 'Energy Recovery'] },
  { service: 'HVAC', category: 'Ducting', name: 'Galvanized Rectangular Duct', unit: 'Linear Ft', price: 24, spec: 'SMACNA', features: ['G90 Galvanized', 'TDC Flanges', 'Custom Fabricated'] },
  { service: 'HVAC', category: 'Diffusers', name: 'Aluminum Ceiling Diffuser', unit: 'Piece', price: 28, spec: '4 Way', features: ['Powder Coated', 'Opposed Blade Damper', 'Lay In Type'] },
  { service: 'HVAC', category: 'Insulation', name: 'Nitrile Rubber Insulation', unit: 'Meter', price: 4.8, spec: 'Class O', features: ['Closed Cell', 'Condensation Control', 'Flexible'] },
  { service: 'HVAC', category: 'Piping', name: 'Copper Refrigerant Tube', unit: 'Coil', price: 145, spec: 'ASTM B280', features: ['Dehydrated', 'Soft Drawn', 'ACR Grade'] },
  { service: 'Mechanical', category: 'Pumps', name: 'Submersible Sump Pump', unit: 'Unit', price: 320, spec: '1HP', features: ['Cast Iron', 'Automatic Float', 'Thermal Overload'] },
  { service: 'Mechanical', category: 'Pumps', name: 'End Suction Centrifugal Pump', unit: 'Unit', price: 1850, spec: '25HP', features: ['Back Pull Out', 'TEFC Motor', 'Balanced Impeller'] },
  { service: 'Mechanical', category: 'Fire Fighting', name: 'Fire Sprinkler Head', unit: 'Piece', price: 9.5, spec: 'K5.6', features: ['UL Listed', 'Quick Response', 'Chrome Finish'] },
  { service: 'Mechanical', category: 'Tanks', name: 'GRP Sectional Water Tank', unit: 'Cubic Meter', price: 210, spec: 'WRAS Approved', features: ['Panel Type', 'Food Grade', 'Bolted Assembly'] },
  { service: 'Sitework', category: 'Roadworks', name: 'Bituminous Asphalt Mix', unit: 'Ton', price: 76, spec: 'Dense Graded', features: ['Hot Mix', 'Road Grade', 'Plant Mixed'] },
  { service: 'Sitework', category: 'Geosynthetics', name: 'Non Woven Geotextile', unit: 'Sq. Meter', price: 1.2, spec: '200 GSM', features: ['Separation Layer', 'Drainage', 'UV Stabilized'] },
  { service: 'Sitework', category: 'Drainage', name: 'Precast RCC Drain Cover', unit: 'Piece', price: 18, spec: 'M30', features: ['Heavy Duty', 'Reinforced', 'Factory Cast'] },
  { service: 'Sitework', category: 'Safety', name: 'Temporary Safety Barricade', unit: 'Piece', price: 42, spec: 'Reflective', features: ['Portable', 'High Visibility', 'Interlocking'] },
  { service: 'Site Survey', category: 'Survey Instruments', name: 'Total Station Survey Kit', unit: 'Set', price: 4200, spec: '2 Second Accuracy', phase: 'Site Survey', features: ['Angle Measurement', 'Prism Mode', 'Data Collector'] },
  { service: 'Site Survey', category: 'Survey Instruments', name: 'GNSS Rover Receiver', unit: 'Set', price: 5800, spec: 'RTK Enabled', phase: 'Site Survey', features: ['Centimeter Accuracy', 'Base Rover', 'Cloud Sync'] },
  { service: 'Site Survey', category: 'Drone Capture', name: 'Mapping Drone Battery Kit', unit: 'Kit', price: 720, spec: 'Enterprise Grade', phase: 'Site Survey', features: ['High Endurance', 'Survey Ready', 'Hot Swap'] },
  { service: 'Site Survey', category: 'Soil Testing', name: 'Standard Penetration Test Sampler', unit: 'Set', price: 380, spec: 'ASTM D1586', phase: 'Site Survey', features: ['Split Spoon', 'Field Tested', 'Borehole Use'] },
  { service: 'Facility Management', category: 'Asset Tags', name: 'QR Asset Tag Plate', unit: 'Pack', price: 48, spec: 'Anodized Aluminum', phase: 'Facility Management Coordination', features: ['Laser Marked', 'Weatherproof', 'Asset Linked'] },
  { service: 'Facility Management', category: 'O&M Labels', name: 'Equipment Identification Label', unit: 'Roll', price: 32, spec: 'Industrial Vinyl', phase: 'Facility Management Coordination', features: ['UV Stable', 'Peel Resistant', 'Readable'] },
  { service: 'Facility Management', category: 'Maintenance Spares', name: 'HVAC Filter Replacement Set', unit: 'Set', price: 95, spec: 'MERV 13', phase: 'Facility Management Coordination', features: ['O&M Ready', 'Scheduled Replacement', 'Tagged'] },
  { service: 'Facility Management', category: 'Handover Kits', name: 'Commissioning Handover Binder', unit: 'Set', price: 28, spec: 'A3/A4 Mixed', phase: 'Facility Management Coordination', features: ['Document Indexed', 'Asset Register', 'Handover Ready'] },
  { service: 'Digital Twin', category: 'IoT Sensors', name: 'Wireless Temperature Sensor', unit: 'Piece', price: 84, spec: 'BLE 5.0', phase: 'Digital Twin', features: ['Cloud Linked', 'Battery Powered', 'Asset Mapping'] },
  { service: 'Digital Twin', category: 'IoT Sensors', name: 'Vibration Monitoring Sensor', unit: 'Piece', price: 165, spec: 'Tri-Axis', phase: 'Digital Twin', features: ['Predictive Maintenance', 'Gateway Ready', 'Realtime Data'] },
  { service: 'Digital Twin', category: 'Reality Capture', name: '360 Site Scan Marker', unit: 'Pack', price: 38, spec: 'Visual Anchor', phase: 'Digital Twin', features: ['Reality Capture', 'BIM Linked', 'Indoor Outdoor'] },
  { service: 'Digital Twin', category: 'BIM Assets', name: 'RFID Equipment Tag', unit: 'Pack', price: 62, spec: 'UHF Passive', phase: 'Digital Twin', features: ['Asset Traceable', 'BIM Parameter', 'Facility Ready'] },
];

const MATERIAL_VARIANTS = [
  'Standard',
  'Heavy Duty',
  'Premium',
  'Commercial Grade',
  'Industrial Grade',
  'Low VOC',
  'High Strength',
  'Rapid Setting',
  'Fire Rated',
  'Corrosion Resistant',
  'Weather Resistant',
  'Energy Efficient',
  'Acoustic',
  'Moisture Resistant',
  'Factory Tested',
  'Project Approved',
  'Long Lead',
  'Fast Track',
  'Imported',
  'Local Make',
];

const MATERIAL_SIZES = ['25mm', '40mm', '50mm', '75mm', '100mm', '150mm', '200mm', '300mm', '600x600mm', '1200x600mm', 'M20', 'M25', 'M30', 'M40', 'Grade A', 'Grade B'];
const MATERIAL_AVAILABILITY = ['In Stock', 'In Stock', 'In Stock', 'Low Stock', 'Lead Time (1 Week)', 'Lead Time (2 Weeks)', 'Lead Time (4 Weeks)'];

function getMaterialPhase(material: Pick<CatalogMaterial, 'phase' | 'service' | 'category'>) {
  if (material.phase) return material.phase;
  if (material.service === 'Site Survey') return 'Site Survey';
  if (material.service === 'Digital Twin') return 'Digital Twin';
  if (material.service === 'Facility Management') return 'Facility Management Coordination';
  if (['Survey Instruments', 'Soil Testing', 'Drone Capture'].includes(material.category)) return 'Site Survey';
  if (['Asset Tags', 'O&M Labels', 'Maintenance Spares', 'Handover Kits'].includes(material.category)) return 'Facility Management Coordination';
  if (['IoT Sensors', 'Reality Capture', 'BIM Assets'].includes(material.category)) return 'Digital Twin';
  if (['Binders', 'Aggregates', 'Admixtures', 'Survey', 'Design Inputs'].includes(material.category)) return 'Pre-Construction';
  return 'Construction';
}

function buildExpandedMaterialCatalog(baseMaterials: CatalogMaterial[], targetCount = 1200): CatalogMaterial[] {
  const generated: CatalogMaterial[] = baseMaterials.map((material) => ({
    ...material,
    phase: getMaterialPhase(material),
    specs: {
      ...material.specs,
      Phase: getMaterialPhase(material),
    },
  }));

  for (let index = 0; generated.length < targetCount; index += 1) {
    const seed = MATERIAL_SEEDS[index % MATERIAL_SEEDS.length];
    const variant = MATERIAL_VARIANTS[Math.floor(index / MATERIAL_SEEDS.length) % MATERIAL_VARIANTS.length];
    const size = MATERIAL_SIZES[index % MATERIAL_SIZES.length];
    const brands = MATERIAL_BRANDS[seed.service] || ['Approved Vendor', 'Prime Build', 'Site Standard'];
    const brand = brands[index % brands.length];
    const serviceCode = seed.service.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, '').padEnd(4, 'X');
    const priceFactor = 0.82 + ((index % 17) * 0.035);
    const roundedPrice = Number((seed.price * priceFactor).toFixed(seed.price < 20 ? 2 : 0));

    generated.push({
      id: `MAT-${serviceCode}-${String(index + 10).padStart(4, '0')}`,
      name: `${variant} ${seed.name} ${size}`,
      service: seed.service,
      category: seed.category,
      brand,
      price: roundedPrice,
      unit: seed.unit,
      availability: MATERIAL_AVAILABILITY[index % MATERIAL_AVAILABILITY.length],
      phase: seed.phase || getMaterialPhase(seed),
      features: [...seed.features, variant].slice(0, 4),
      image: MATERIAL_SERVICE_IMAGES[seed.service] || MATERIAL_SERVICE_IMAGES.Civil,
      description: `${variant} ${seed.name.toLowerCase()} for construction project use under ${seed.category.toLowerCase()} scope. Suitable for project catalog, BOQ reference, approval review and site material planning.`,
      specs: {
        Standard: seed.spec,
        Size: size,
        Grade: variant,
        Category: seed.category,
        Phase: seed.phase || getMaterialPhase(seed),
      },
    });
  }

  return generated;
}

export default function MaterialCatalog({ onBack: _onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState('library');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedProject, setSelectedProject] = useState('Downtown Tower Complex');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // Selection & Collections
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<Set<string>>(new Set());
  const [collection, setCollection] = useState<any[]>([]);

  // Filtering States
  const [filterService, setFilterService] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [filterAvailability, setFilterAvailability] = useState('All');
  const [filterPhase, setFilterPhase] = useState('All');
  const [draftFilterService, setDraftFilterService] = useState('All');
  const [draftFilterBrand, setDraftFilterBrand] = useState('All');
  const [draftFilterAvailability, setDraftFilterAvailability] = useState('All');
  const [draftFilterPhase, setDraftFilterPhase] = useState('All');

  // Modals
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isCompareModalOpen, setCompareModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isTableMaxViewOpen, setTableMaxViewOpen] = useState(false);
  const [isAddMaterialOpen, setAddMaterialOpen] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState<any>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [isDetailEditMode, setDetailEditMode] = useState(false);
  const [detailDraft, setDetailDraft] = useState({
    name: '',
    service: '',
    category: '',
    brand: '',
    price: '',
    unit: '',
    availability: '',
    phase: '',
    image: '',
    description: '',
  });
  const [detailSpecRows, setDetailSpecRows] = useState<Array<{ key: string; value: string }>>([]);
  const [detailFeatureRows, setDetailFeatureRows] = useState<string[]>([]);
  const [newFeatureDraft, setNewFeatureDraft] = useState('');
  const [fulfillmentQty, setFulfillmentQty] = useState(1);
  const [fulfillmentZone, setFulfillmentZone] = useState('Core package');
  const [fulfillmentDate, setFulfillmentDate] = useState('');
  const [materialOverrides, setMaterialOverrides] = useState<Record<string, CatalogMaterial>>({});

  // Extensive Mock Data across construction fields
  const mockMaterialSeeds: CatalogMaterial[] = [
    {
      id: 'MAT-HVAC-001',
      name: 'Air Handling Unit (AHU) 5000 CFM',
      service: 'HVAC',
      category: 'Equipment',
      brand: 'Trane',
      price: 12500,
      unit: 'Unit',
      availability: 'In Stock',
      features: ['Variable Speed', 'Energy Recovery', 'MERV 13'],
      image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200',
      description: 'High-efficiency indoor air handling unit suitable for commercial spaces.',
      specs: { 'Airflow': '5000 CFM', 'Power': '480V 3-Phase', 'Cooling Capacity': '15 Tons' }
    },
    {
      id: 'MAT-ELEC-045',
      name: 'THHN Copper Wire 12 AWG',
      service: 'Electrical',
      category: 'Wiring',
      brand: 'Southwire',
      price: 85,
      unit: 'Roll (500ft)',
      availability: 'In Stock',
      features: ['Nylon Jacketed', 'Flame Retardant', 'UL Listed'],
      image: 'https://images.unsplash.com/photo-1558434440-422ce0bc27a1?auto=format&fit=crop&q=80&w=200',
      description: 'General purpose building wire for services, feeders, and branch circuits.',
      specs: { 'Gauge': '12 AWG', 'Conductor': 'Copper', 'Rating': '600V' }
    },
    {
      id: 'MAT-PLUM-012',
      name: 'PVC Pipe Schedule 40 - 4"',
      service: 'Plumbing',
      category: 'Piping',
      brand: 'Charlotte Pipe',
      price: 45,
      unit: 'Length (10ft)',
      availability: 'Low Stock',
      features: ['Corrosion Resistant', 'Lightweight', 'NSF Certified'],
      image: 'https://images.unsplash.com/photo-1585074245698-eaac8b560644?auto=format&fit=crop&q=80&w=200',
      description: 'Solid wall PVC pipe for drainage, waste, and vent applications.',
      specs: { 'Diameter': '4 inch', 'Wall': 'Schedule 40', 'Material': 'PVC' }
    },
    {
      id: 'MAT-CIVL-008',
      name: 'Portland Cement Type I/II',
      service: 'Civil',
      category: 'Binders',
      brand: 'Cemex',
      price: 8.50,
      unit: 'Bag (50kg)',
      availability: 'In Stock',
      features: ['High Strength', 'Sulfate Resistant'],
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=200',
      description: 'General purpose portland cement suitable for all uses.',
      specs: { 'Standard': 'ASTM C150', 'Weight': '50 kg', 'Type': 'I/II' }
    },
    {
      id: 'MAT-DUCT-099',
      name: 'Galvanized Rectangular Duct',
      service: 'Duct',
      category: 'Sheet Metal',
      brand: 'Local Fab',
      price: 24,
      unit: 'Linear Ft',
      availability: 'Lead Time (2 Weeks)',
      features: ['Custom Fabricated', 'G90 Galvanized', 'TDC Flanges'],
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=200',
      description: 'Standard gauge rectangular ductwork for HVAC air distribution.',
      specs: { 'Gauge': '22', 'Material': 'Galvanized Steel', 'Standard': 'SMACNA' }
    },
    {
      id: 'MAT-PNT-022',
      name: 'Premium Interior Acrylic Paint',
      service: 'Painting',
      category: 'Finishes',
      brand: 'Sherwin-Williams',
      price: 185,
      unit: 'Bucket (5 Gal)',
      availability: 'In Stock',
      features: ['Zero VOC', 'Washable', 'Fast Drying'],
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200',
      description: 'High-quality professional grade interior flat paint.',
      specs: { 'Finish': 'Matte', 'Base': 'Water', 'Coverage': '2000 sqft' }
    },
    {
      id: 'MAT-MECH-015',
      name: 'Submersible Sump Pump 1HP',
      service: 'Mechanical',
      category: 'Pumps',
      brand: 'Zoeller',
      price: 320,
      unit: 'Unit',
      availability: 'Low Stock',
      features: ['Cast Iron', 'Thermal Overload', 'Automatic'],
      image: 'https://images.unsplash.com/photo-1621616710411-cf0d5b40cb7f?auto=format&fit=crop&q=80&w=200',
      description: 'Heavy duty submersible pump for groundwater removal.',
      specs: { 'Horsepower': '1 HP', 'Flow Rate': '60 GPM', 'Voltage': '115V' }
    },
    {
      id: 'MAT-ARCH-103',
      name: 'Acoustic Ceiling Tiles 2x2',
      service: 'Architectural',
      category: 'Ceilings',
      brand: 'Armstrong',
      price: 65,
      unit: 'Carton (16 pcs)',
      availability: 'In Stock',
      features: ['High NRC', 'Fire Resistive', 'Mold Inhibiting'],
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=200',
      description: 'Fine fissured mineral fiber acoustic ceiling panels.',
      specs: { 'Dimensions': '24x24 in', 'Thickness': '5/8 in', 'NRC': '0.70' }
    },
    {
      id: 'MAT-STRU-055',
      name: 'Wide Flange Beam W12x50',
      service: 'Structural',
      category: 'Steel',
      brand: 'Nucor',
      price: 1200,
      unit: 'Ton',
      availability: 'Lead Time (4 Weeks)',
      features: ['High Yield', 'Recycled Steel'],
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=200',
      description: 'Standard structural steel wide flange beam.',
      specs: { 'Grade': 'A992', 'Depth': '12 in', 'Weight': '50 lb/ft' }
    },
  ];

  const mockMaterials = useMemo(() => {
    return buildExpandedMaterialCatalog(mockMaterialSeeds, 1200).map(material => materialOverrides[material.id] ?? material);
  }, [materialOverrides]);

  // Derived Filtering
  const servicesList = ['All', ...Array.from(new Set(mockMaterials.map(m => m.service)))];
  const brandsList = ['All', ...Array.from(new Set(mockMaterials.map(m => m.brand)))];
  const availabilityList = ['All', 'In Stock', 'Low Stock', 'Lead Time'];
  const phaseList = ['All', ...MATERIAL_PHASES];
  const activeFilterCount = [filterService, filterPhase, filterBrand, filterAvailability].filter(value => value !== 'All').length;

  const filteredMaterials = useMemo(() => {
    const queryTokens = searchQuery
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return mockMaterials.filter(mat => {
      const searchable = [
        mat.id,
        mat.name,
        mat.service,
        mat.category,
        mat.brand,
        mat.unit,
        mat.availability,
        getMaterialPhase(mat),
        ...mat.features,
        ...Object.values(mat.specs),
      ].join(' ').toLowerCase();
      const matchSearch = queryTokens.length === 0 || queryTokens.every(token => searchable.includes(token));
      const matchService = filterService === 'All' || mat.service === filterService;
      const matchBrand = filterBrand === 'All' || mat.brand === filterBrand;
      const matchAvail = filterAvailability === 'All' || mat.availability.includes(filterAvailability);
      const matchPhase = filterPhase === 'All' || getMaterialPhase(mat) === filterPhase;
      return matchSearch && matchService && matchBrand && matchAvail && matchPhase;
    });
  }, [searchQuery, filterService, filterBrand, filterAvailability, filterPhase, mockMaterials]);

  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * pageSize;
  const pageEndIndex = Math.min(pageStartIndex + pageSize, filteredMaterials.length);
  const paginatedMaterials = filteredMaterials.slice(pageStartIndex, pageEndIndex);
  const currentPageFullySelected = paginatedMaterials.length > 0 && paginatedMaterials.every(mat => selectedMaterialIds.has(mat.id));
  const selectedMaterials = mockMaterials.filter(material => selectedMaterialIds.has(material.id));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterService, filterBrand, filterAvailability, filterPhase, pageSize, viewMode]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedMaterialIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedMaterialIds(newSet);
  };

  const toggleAll = () => {
    const nextSet = new Set(selectedMaterialIds);
    if (currentPageFullySelected) {
      paginatedMaterials.forEach(mat => nextSet.delete(mat.id));
    } else {
      paginatedMaterials.forEach(mat => nextSet.add(mat.id));
    }
    setSelectedMaterialIds(nextSet);
  };

  const addToCollection = () => {
    const selectedMats = mockMaterials.filter(m => selectedMaterialIds.has(m.id));
    const newItems = selectedMats.filter(m => !collection.some(c => c.id === m.id));
    setCollection([...collection, ...newItems]);
    setSelectedMaterialIds(new Set());
    toast.success(`Added ${newItems.length} items to your collection.`);
  };

  const addSingleToCollection = (mat: CatalogMaterial) => {
    setOpenActionMenu(null);
    if (collection.some(c => c.id === mat.id)) {
      toast.info('This material is already in your collection.');
      return;
    }
    setCollection([...collection, mat]);
    toast.success('Added to collection.');
  };

  const toggleCompareSelection = (id: string) => {
    toggleSelection(id);
    setOpenActionMenu(null);
  };

  const copyMaterialCode = (id: string) => {
    void navigator.clipboard?.writeText(id);
    setOpenActionMenu(null);
    toast.success(`Copied material code: ${id}`);
  };

  const openEditMaterial = (mat: CatalogMaterial) => {
    setOpenActionMenu(null);
    setActiveMaterial(mat);
    setDetailDraft({
      name: mat.name,
      service: mat.service,
      category: mat.category,
      brand: mat.brand,
      price: String(mat.price),
      unit: mat.unit,
      availability: mat.availability,
      phase: getMaterialPhase(mat),
      image: mat.image,
      description: mat.description,
    });
    setDetailSpecRows(Object.entries(mat.specs).map(([key, value]) => ({ key, value })));
    setDetailFeatureRows(mat.features);
    setNewFeatureDraft('');
    setDetailEditMode(true);
    setDetailModalOpen(true);
    toast.info('Detail/edit panel opened for this material.');
  };

  const shareCollection = () => {
    if (collection.length === 0) return;
    toast.success(`Collection shared with ${collection.length} material${collection.length === 1 ? '' : 's'}.`);
  };

  const openFilterModal = () => {
    setDraftFilterService(filterService);
    setDraftFilterPhase(filterPhase);
    setDraftFilterBrand(filterBrand);
    setDraftFilterAvailability(filterAvailability);
    setFilterModalOpen(true);
  };

  const applyFilters = () => {
    setFilterService(draftFilterService);
    setFilterPhase(draftFilterPhase);
    setFilterBrand(draftFilterBrand);
    setFilterAvailability(draftFilterAvailability);
    setCurrentPage(1);
    setFilterModalOpen(false);
  };

  const clearFilters = () => {
    setDraftFilterService('All');
    setDraftFilterPhase('All');
    setDraftFilterBrand('All');
    setDraftFilterAvailability('All');
    setFilterService('All');
    setFilterPhase('All');
    setFilterBrand('All');
    setFilterAvailability('All');
    setCurrentPage(1);
  };

  const openMaterialDetail = (mat: any) => {
    setOpenActionMenu(null);
    setActiveMaterial(mat);
    setDetailDraft({
      name: mat.name,
      service: mat.service,
      category: mat.category,
      brand: mat.brand,
      price: String(mat.price),
      unit: mat.unit,
      availability: mat.availability,
      phase: getMaterialPhase(mat),
      image: mat.image,
      description: mat.description,
    });
    setDetailSpecRows(Object.entries(mat.specs).map(([key, value]) => ({ key, value })));
    setDetailFeatureRows(mat.features);
    setNewFeatureDraft('');
    setDetailEditMode(false);
    setFulfillmentQty(1);
    setFulfillmentZone('Core package');
    setFulfillmentDate('');
    setDetailModalOpen(true);
  };

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const getMaterialSignals = (mat: CatalogMaterial) => {
    const seed = Array.from(mat.id).reduce((total, char) => total + char.charCodeAt(0), 0);
    const trendScore = 55 + (seed % 39);
    const demandScore = 48 + ((seed * 7) % 45);
    const fulfillmentScore = mat.availability.includes('In Stock') ? 92 : mat.availability.includes('Low Stock') ? 64 : 38;
    const inDemandCount = 8 + (seed % 28);
    const weeklyTrend = 4 + (seed % 18);
    const leadRisk = mat.availability.includes('Lead Time') ? 'High' : mat.availability.includes('Low Stock') ? 'Medium' : 'Low';
    const vendorScore = 70 + ((seed * 5) % 25);
    const packageCount = 2 + (seed % 7);
    const costVariance = ((seed % 13) - 6) / 10;
    const leadDays = mat.availability.includes('Lead Time') ? 14 + (seed % 21) : mat.availability.includes('Low Stock') ? 7 + (seed % 8) : 2 + (seed % 4);
    const lastUpdatedDays = 1 + (seed % 18);
    return { trendScore, demandScore, fulfillmentScore, inDemandCount, weeklyTrend, leadRisk, vendorScore, packageCount, costVariance, leadDays, lastUpdatedDays };
  };

  const saveMaterialDraft = () => {
    const parsedPrice = Number(detailDraft.price);
    if (!detailDraft.name.trim()) {
      toast.error('Material name is required.');
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error('Enter a valid unit price.');
      return;
    }
    const nextSpecs = detailSpecRows.reduce<Record<string, string>>((acc, row) => {
      const key = row.key.trim();
      const value = row.value.trim();
      if (key && value) acc[key] = value;
      return acc;
    }, {});
    const nextFeatures = Array.from(new Set(detailFeatureRows.map(feature => feature.trim()).filter(Boolean)));
    if (Object.keys(nextSpecs).length === 0) {
      toast.error('Add at least one specification/property.');
      return;
    }
    if (nextFeatures.length === 0) {
      toast.error('Add at least one feature/tag.');
      return;
    }
    const updatedMaterial = {
      ...activeMaterial,
      name: detailDraft.name.trim(),
      service: detailDraft.service.trim() || activeMaterial.service,
      category: detailDraft.category.trim() || activeMaterial.category,
      brand: detailDraft.brand.trim() || activeMaterial.brand,
      price: parsedPrice,
      unit: detailDraft.unit.trim() || activeMaterial.unit,
      availability: detailDraft.availability.trim() || activeMaterial.availability,
      phase: detailDraft.phase.trim() || getMaterialPhase(activeMaterial),
      image: detailDraft.image.trim(),
      description: detailDraft.description.trim() || activeMaterial.description,
      specs: {
        ...nextSpecs,
        Phase: detailDraft.phase.trim() || getMaterialPhase(activeMaterial),
      },
      features: nextFeatures,
    };
    setActiveMaterial(updatedMaterial);
    setMaterialOverrides(prev => ({ ...prev, [updatedMaterial.id]: updatedMaterial }));
    setCollection(prev => prev.map(item => item.id === updatedMaterial.id ? updatedMaterial : item));
    setDetailEditMode(false);
    toast.success('Material details updated.');
  };

  const resetDetailDraft = (mat: CatalogMaterial) => {
    setDetailDraft({
      name: mat.name,
      service: mat.service,
      category: mat.category,
      brand: mat.brand,
      price: String(mat.price),
      unit: mat.unit,
      availability: mat.availability,
      phase: getMaterialPhase(mat),
      image: mat.image,
      description: mat.description,
    });
    setDetailSpecRows(Object.entries(mat.specs).map(([key, value]) => ({ key, value })));
    setDetailFeatureRows(mat.features);
    setNewFeatureDraft('');
  };

  const addSpecRow = () => {
    setDetailSpecRows(rows => [...rows, { key: '', value: '' }]);
  };

  const updateSpecRow = (index: number, field: 'key' | 'value', value: string) => {
    setDetailSpecRows(rows => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  };

  const removeSpecRow = (index: number) => {
    setDetailSpecRows(rows => rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const addFeatureRow = () => {
    const nextFeature = newFeatureDraft.trim();
    if (!nextFeature) return;
    if (detailFeatureRows.some(feature => feature.toLowerCase() === nextFeature.toLowerCase())) {
      toast.info('Feature already exists.');
      return;
    }
    setDetailFeatureRows(rows => [...rows, nextFeature]);
    setNewFeatureDraft('');
  };

  const removeFeatureRow = (index: number) => {
    setDetailFeatureRows(rows => rows.filter((_, rowIndex) => rowIndex !== index));
  };

  const addDetailMaterialToCompare = (mat: CatalogMaterial) => {
    if (selectedMaterialIds.has(mat.id)) {
      setSelectedMaterialIds((current) => {
        const next = new Set(current);
        next.delete(mat.id);
        return next;
      });
      toast.info('Material removed from compare.');
      return;
    }
    setSelectedMaterialIds((current) => {
      const next = new Set(current);
      next.add(mat.id);
      return next;
    });
    toast.success('Material added to compare.');
  };

  const toggleDetailCollection = (mat: CatalogMaterial) => {
    if (collection.some(item => item.id === mat.id)) {
      setCollection(prev => prev.filter(item => item.id !== mat.id));
      toast.info('Removed from collection.');
      return;
    }
    setCollection(prev => [...prev, mat]);
    toast.success('Added to collection.');
  };

  const shareMaterialDetail = (mat: CatalogMaterial) => {
    void navigator.clipboard?.writeText(`${mat.name} (${mat.id}) - ${formatPrice(mat.price)} per ${mat.unit}`);
    toast.success('Material detail link copied.');
  };

  const downloadMaterialSpec = (mat: CatalogMaterial) => {
    const content = [
      `Material: ${mat.name}`,
      `Code: ${mat.id}`,
      `Service: ${mat.service}`,
      `Category: ${mat.category}`,
      `Brand: ${mat.brand}`,
      `Price: ${formatPrice(mat.price)} / ${mat.unit}`,
      `Availability: ${mat.availability}`,
      `Phase: ${getMaterialPhase(mat)}`,
      '',
      'Description:',
      mat.description,
      '',
      'Specifications:',
      ...Object.entries(mat.specs).map(([key, value]) => `${key}: ${value}`),
      '',
      `Features: ${mat.features.join(', ')}`,
    ].join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mat.id}-spec.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Specification sheet downloaded.');
  };

  const createFulfillmentRequest = (mat: CatalogMaterial) => {
    if (fulfillmentQty < 1) {
      toast.error('Quantity must be at least 1.');
      return;
    }
    toast.success(`${fulfillmentQty} ${mat.unit} requested for ${fulfillmentZone}${fulfillmentDate ? ` by ${fulfillmentDate}` : ''}.`);
  };

  const activeTabItems: CatalogTabItem<string>[] = [
    { key: 'library', label: 'Material Library', count: mockMaterials.length },
    { key: 'collection', label: 'My Collections', count: collection.length },
    { key: 'approval', label: 'Approval Queue', count: 0 },
  ];

  return (
    <div className="space-y-3 font-sans pb-10 relative">
      
      {/* ----------------- MODALS ----------------- */}
      
      {/* Detail & Edit Modal */}
      {isDetailModalOpen && activeMaterial && (() => {
        const signals = getMaterialSignals(activeMaterial);
        const isInCollection = collection.some(item => item.id === activeMaterial.id);
        const isInCompare = selectedMaterialIds.has(activeMaterial.id);
        return (
          <div className="fixed inset-0 z-[200] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-[24px] border border-white/70 shadow-[0_28px_80px_rgba(15,23,42,0.28)] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center gap-4 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="w-10 h-10 shrink-0 rounded-xl bg-slate-100 overflow-hidden shadow-inner border border-slate-200">
                    <MaterialThumbnail
                      src={isDetailEditMode ? detailDraft.image : activeMaterial.image}
                      service={isDetailEditMode ? detailDraft.service : activeMaterial.service}
                      name={isDetailEditMode ? detailDraft.name : activeMaterial.name}
                    />
                  </div>
                  <div className="min-w-0">
                    {isDetailEditMode ? (
                      <input
                        value={detailDraft.name}
                        onChange={event => setDetailDraft(draft => ({ ...draft, name: event.target.value }))}
                        className="h-8 w-full min-w-[320px] rounded-xl border border-blue-200 bg-white px-3 text-base font-bold text-slate-900 outline-none focus:border-blue-400"
                      />
                    ) : (
                      <h2 className="truncate text-lg font-bold text-slate-900">{activeMaterial.name}</h2>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className="text-[11px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">{activeMaterial.id}</span>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">{isDetailEditMode ? detailDraft.service : activeMaterial.service}</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">{isDetailEditMode ? detailDraft.phase : getMaterialPhase(activeMaterial)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isDetailEditMode ? (
                    <>
                      <button onClick={() => { setDetailEditMode(false); resetDetailDraft(activeMaterial); }} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold shadow-sm">
                        Cancel
                      </button>
                      <button onClick={saveMaterialDraft} className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-bold flex items-center gap-2 shadow-sm">
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                    </>
                  ) : (
                    <button onClick={() => openEditMaterial(activeMaterial)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 shadow-sm">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  )}
                  <button onClick={() => { setDetailModalOpen(false); setDetailEditMode(false); }} className="p-1.5 bg-white border border-slate-200 text-slate-400 rounded-lg hover:bg-slate-50 hover:text-slate-600 shadow-sm transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/40 p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      <section className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-800">Trend</span>
                          <span className="text-lg font-black text-slate-950">{signals.trendScore}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${signals.trendScore}%` }} />
                        </div>
                        <p className="mt-1.5 text-[11px] font-medium text-blue-700">+{signals.weeklyTrend}% weekly</p>
                      </section>
                      <section className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">Demand</span>
                          <span className="text-lg font-black text-slate-950">{signals.demandScore}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-amber-500" style={{ width: `${signals.demandScore}%` }} />
                        </div>
                        <p className="mt-1.5 text-[11px] font-medium text-amber-700">{signals.inDemandCount} BOQ refs</p>
                      </section>
                      <section className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">Fulfillment</span>
                          <span className="text-lg font-black text-slate-950">{signals.fulfillmentScore}%</span>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
                          <div className="h-full rounded-full bg-emerald-600" style={{ width: `${signals.fulfillmentScore}%` }} />
                        </div>
                        <p className="mt-1.5 text-[11px] font-medium text-emerald-700">Risk: {signals.leadRisk}</p>
                      </section>
                    </div>

                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Description</h3>
                      {isDetailEditMode ? (
                        <textarea
                          value={detailDraft.description}
                          onChange={event => setDetailDraft(draft => ({ ...draft, description: event.target.value }))}
                          rows={3}
                          className="w-full resize-none rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400"
                        />
                      ) : (
                        <p className="text-sm text-slate-600 leading-relaxed">{activeMaterial.description}</p>
                      )}
                    </section>

                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Specifications & Properties</h3>
                        {isDetailEditMode && (
                          <button onClick={addSpecRow} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100">
                            <Plus className="h-3.5 w-3.5" /> Add property
                          </button>
                        )}
                      </div>
                      {isDetailEditMode ? (
                        <div className="space-y-2">
                          {detailSpecRows.map((row, index) => (
                            <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_32px]">
                              <input
                                value={row.key}
                                onChange={event => updateSpecRow(index, 'key', event.target.value)}
                                placeholder="Property name"
                                className="h-9 rounded-xl border border-blue-100 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400"
                              />
                              <input
                                value={row.value}
                                onChange={event => updateSpecRow(index, 'value', event.target.value)}
                                placeholder="Value"
                                className="h-9 rounded-xl border border-blue-100 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400"
                              />
                              <button
                                onClick={() => removeSpecRow(index)}
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-red-100 hover:bg-red-50 hover:text-red-600"
                                title="Remove property"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                          {detailSpecRows.length === 0 && (
                            <button onClick={addSpecRow} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/40 text-xs font-bold text-blue-700">
                              <Plus className="h-4 w-4" /> Add first property
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-y-3 gap-x-5">
                          {Object.entries(activeMaterial.specs).map(([k, v], i) => (
                            <div key={i} className="border-b border-slate-100 pb-1.5">
                              <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mb-0.5">{k}</p>
                              <p className="text-xs font-semibold text-slate-800">{v as string}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Professional Details</h3>
                      <div className="grid gap-3 md:grid-cols-4">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Vendor score</p>
                          <p className="mt-0.5 text-xs font-bold text-slate-800">{signals.vendorScore}% approved</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Lead time</p>
                          <p className="mt-0.5 text-xs font-bold text-slate-800">{signals.leadDays} days</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Package refs</p>
                          <p className="mt-0.5 text-xs font-bold text-slate-800">{signals.packageCount} packages</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Cost variance</p>
                          <p className={`mt-0.5 text-xs font-bold ${signals.costVariance <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{signals.costVariance > 0 ? '+' : ''}{signals.costVariance.toFixed(1)}%</p>
                        </div>
                      </div>
                    </section>

                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Features & Tags</h3>
                      {isDetailEditMode ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {detailFeatureRows.map((feature, index) => (
                              <span key={`${feature}-${index}`} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                {feature}
                                <button onClick={() => removeFeatureRow(index)} className="rounded-full text-emerald-500 hover:text-red-600" title="Remove tag">
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input
                              value={newFeatureDraft}
                              onChange={event => setNewFeatureDraft(event.target.value)}
                              onKeyDown={event => {
                                if (event.key === 'Enter') {
                                  event.preventDefault();
                                  addFeatureRow();
                                }
                              }}
                              placeholder="Add feature or tag"
                              className="h-9 min-w-0 flex-1 rounded-xl border border-blue-100 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400"
                            />
                            <button onClick={addFeatureRow} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700">
                              <Plus className="h-3.5 w-3.5" /> Add
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {activeMaterial.features.map((f: string, i: number) => (
                            <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-bold rounded-full">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </section>
                  </div>

                  <div className="space-y-3">
                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Procurement Data</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium">Service</span>
                          {isDetailEditMode ? (
                            <>
                              <input
                                list="material-service-options"
                                value={detailDraft.service}
                                onChange={event => setDetailDraft(draft => ({ ...draft, service: event.target.value }))}
                                className="h-8 w-36 rounded-lg border border-blue-200 px-2 text-right text-sm font-semibold outline-none focus:border-blue-400"
                              />
                              <datalist id="material-service-options">
                                {servicesList.filter(s => s !== 'All').map(service => <option key={service} value={service} />)}
                              </datalist>
                            </>
                          ) : (
                            <span className="text-sm font-semibold text-slate-700">{activeMaterial.service}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium">Category</span>
                          {isDetailEditMode ? (
                            <input value={detailDraft.category} onChange={event => setDetailDraft(draft => ({ ...draft, category: event.target.value }))} className="h-8 w-36 rounded-lg border border-blue-200 px-2 text-right text-sm font-semibold outline-none focus:border-blue-400" />
                          ) : (
                            <span className="text-sm font-semibold text-slate-700">{activeMaterial.category}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium">Unit Price</span>
                          {isDetailEditMode ? (
                            <input value={detailDraft.price} onChange={event => setDetailDraft(draft => ({ ...draft, price: event.target.value }))} className="h-8 w-28 rounded-lg border border-blue-200 px-2 text-right text-sm font-bold outline-none focus:border-blue-400" />
                          ) : (
                            <span className="text-base font-bold text-slate-900">{formatPrice(activeMaterial.price)}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium">UOM</span>
                          {isDetailEditMode ? (
                            <input value={detailDraft.unit} onChange={event => setDetailDraft(draft => ({ ...draft, unit: event.target.value }))} className="h-8 w-36 rounded-lg border border-blue-200 px-2 text-right text-sm font-semibold outline-none focus:border-blue-400" />
                          ) : (
                            <span className="text-sm font-semibold text-slate-700">{activeMaterial.unit}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium">Brand</span>
                          {isDetailEditMode ? (
                            <input value={detailDraft.brand} onChange={event => setDetailDraft(draft => ({ ...draft, brand: event.target.value }))} className="h-8 w-36 rounded-lg border border-blue-200 px-2 text-right text-sm font-semibold outline-none focus:border-blue-400" />
                          ) : (
                            <span className="text-sm font-semibold text-slate-700">{activeMaterial.brand}</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-3">
                          <span className="text-xs text-slate-500 font-medium">Phase</span>
                          {isDetailEditMode ? (
                            <CatalogSelect value={detailDraft.phase} onChange={event => setDetailDraft(draft => ({ ...draft, phase: event.target.value }))} containerClassName="w-36">
                              {phaseList.filter(phase => phase !== 'All').map(phase => <option key={phase} value={phase}>{phase}</option>)}
                            </CatalogSelect>
                          ) : (
                            <span className="text-right text-sm font-semibold text-slate-700">{getMaterialPhase(activeMaterial)}</span>
                          )}
                        </div>
                        <div className="pt-3 border-t border-slate-100">
                          <span className="text-xs text-slate-500 font-medium block mb-2">Availability Status</span>
                          {isDetailEditMode ? (
                            <CatalogSelect value={detailDraft.availability} onChange={event => setDetailDraft(draft => ({ ...draft, availability: event.target.value }))} containerClassName="w-full">
                              {MATERIAL_AVAILABILITY.map(status => <option key={status} value={status}>{status}</option>)}
                            </CatalogSelect>
                          ) : (
                            <span className={`inline-flex px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                              activeMaterial.availability.includes('In Stock') ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              activeMaterial.availability.includes('Low Stock') ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-purple-50 text-purple-700 border-purple-200'
                            }`}>
                              {activeMaterial.availability}
                            </span>
                          )}
                        </div>
                        {isDetailEditMode && (
                          <div>
                            <span className="text-xs text-slate-500 font-medium block mb-2">Image URL</span>
                            <input
                              value={detailDraft.image}
                              onChange={event => setDetailDraft(draft => ({ ...draft, image: event.target.value }))}
                              placeholder="https://..."
                              className="h-8 w-full rounded-lg border border-blue-200 px-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400"
                            />
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fulfillment Request</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${signals.leadRisk === 'Low' ? 'bg-emerald-50 text-emerald-700' : signals.leadRisk === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{signals.leadRisk} risk</span>
                      </div>
                      <div className="space-y-2.5">
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Quantity</label>
                          <input type="number" min={1} value={fulfillmentQty} onChange={event => setFulfillmentQty(Math.max(1, Number(event.target.value)))} className="h-8 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-blue-400" />
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Fulfillment package</label>
                          <CatalogSelect value={fulfillmentZone} onChange={event => setFulfillmentZone(event.target.value)} containerClassName="w-full">
                            <option>Core package</option>
                            <option>Facade package</option>
                            <option>MEP rough-in</option>
                            <option>Finishing floor</option>
                            <option>Site logistics</option>
                          </CatalogSelect>
                        </div>
                        <div>
                          <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Needed by</label>
                          <input type="date" value={fulfillmentDate} onChange={event => setFulfillmentDate(event.target.value)} className="h-8 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-blue-400" />
                        </div>
                        <button onClick={() => createFulfillmentRequest(activeMaterial)} className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700">
                          Create Request
                        </button>
                      </div>
                    </section>

                    <section className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Detail Actions</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => toggleDetailCollection(activeMaterial)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${isInCollection ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                          {isInCollection ? 'Remove Collection' : 'Add Collection'}
                        </button>
                        <button onClick={() => addDetailMaterialToCompare(activeMaterial)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${isInCompare ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>
                          {isInCompare ? 'In Compare' : 'Compare'}
                        </button>
                        <button onClick={() => copyMaterialCode(activeMaterial.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                          Copy Code
                        </button>
                        <button onClick={() => shareMaterialDetail(activeMaterial)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                          Share
                        </button>
                        <button onClick={() => downloadMaterialSpec(activeMaterial)} className="col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                          Download Spec Sheet
                        </button>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Compare Modal */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white rounded-[24px] border border-white/70 shadow-[0_28px_80px_rgba(15,23,42,0.28)] w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Scale className="w-5 h-5 text-blue-600" /> Material Comparison</h2>
                <p className="text-xs text-slate-500 mt-1">Comparing {selectedMaterialIds.size} selected items</p>
              </div>
              <button onClick={() => setCompareModalOpen(false)} className="p-2 bg-white border border-slate-200 text-slate-500 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr>
                    <th className="p-4 border-b border-r border-slate-200 bg-slate-50 w-48 font-bold text-slate-700">Property</th>
                    {Array.from(selectedMaterialIds).map(id => {
                      const mat = mockMaterials.find(m => m.id === id);
                      return (
                        <th key={id} className="p-4 border-b border-slate-200 bg-white min-w-[250px] align-top">
                          <div className="h-24 w-full bg-slate-100 rounded-lg mb-3 overflow-hidden">
                            <img src={mat?.image} className="w-full h-full object-cover" />
                          </div>
                          <p className="font-bold text-slate-900">{mat?.name}</p>
                          <p className="text-xs text-slate-400 font-mono mt-1">{mat?.id}</p>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { label: 'Service Trade', key: 'service' },
                    { label: 'Brand', key: 'brand' },
                    { label: 'Phase', key: 'phase' },
                    { label: 'Unit Price', key: 'price', format: formatPrice },
                    { label: 'Trend %', key: 'trendScore' },
                    { label: 'Demand %', key: 'demandScore' },
                    { label: 'UOM', key: 'unit' },
                    { label: 'Availability', key: 'availability' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      <td className="p-4 border-r border-slate-200 bg-slate-50/50 font-semibold text-slate-700">{row.label}</td>
                      {Array.from(selectedMaterialIds).map(id => {
                        const mat = mockMaterials.find(m => m.id === id) as any;
                        const signals = getMaterialSignals(mat);
                        const val = row.key === 'trendScore' || row.key === 'demandScore' ? signals[row.key] : mat[row.key];
                        return <td key={id} className="p-4 font-medium text-slate-800">{row.format ? row.format(val) : val}</td>;
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-4 border-r border-slate-200 bg-slate-50/50 font-semibold text-slate-700">Features</td>
                    {Array.from(selectedMaterialIds).map(id => {
                      const mat = mockMaterials.find(m => m.id === id);
                      return (
                        <td key={id} className="p-4">
                          <ul className="list-disc pl-4 space-y-1 text-slate-600 text-xs">
                            {mat?.features.map((f, i) => <li key={i}>{f}</li>)}
                          </ul>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Filter materials</h3>
                <p className="mt-0.5 text-xs text-slate-500">Apply multiple filters together.</p>
              </div>
              <button onClick={() => setFilterModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Service / Trade</label>
                <CatalogSelect value={draftFilterService} onChange={e => setDraftFilterService(e.target.value)} containerClassName="w-full">
                  <option value="All">All Services</option>
                  {servicesList.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                </CatalogSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Project Phase</label>
                <CatalogSelect value={draftFilterPhase} onChange={e => setDraftFilterPhase(e.target.value)} containerClassName="w-full">
                  <option value="All">All Phases</option>
                  {phaseList.filter(phase => phase !== 'All').map(phase => <option key={phase} value={phase}>{phase}</option>)}
                </CatalogSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Brand</label>
                <CatalogSelect value={draftFilterBrand} onChange={e => setDraftFilterBrand(e.target.value)} containerClassName="w-full">
                  <option value="All">All Brands</option>
                  {brandsList.filter(b => b !== 'All').map(b => <option key={b} value={b}>{b}</option>)}
                </CatalogSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Availability</label>
                <CatalogSelect value={draftFilterAvailability} onChange={e => setDraftFilterAvailability(e.target.value)} containerClassName="w-full">
                  {availabilityList.map(a => <option key={a} value={a}>{a}</option>)}
                </CatalogSelect>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <button onClick={clearFilters} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                Clear filters
              </button>
              <div className="flex items-center gap-2">
                <button onClick={() => setFilterModalOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button onClick={applyFilters} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/15 hover:bg-blue-700">
                  Apply filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddMaterialOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Add material</h3>
                <p className="mt-0.5 text-xs text-slate-500">Create a new catalog entry for the selected project.</p>
              </div>
              <button onClick={() => setAddMaterialOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Material name</label>
                <input className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-blue-400" placeholder="e.g. M40 Ready Mix Concrete" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Service / Trade</label>
                <CatalogSelect containerClassName="w-full">
                  {servicesList.filter(s => s !== 'All').map(s => <option key={s}>{s}</option>)}
                </CatalogSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Phase</label>
                <CatalogSelect containerClassName="w-full">
                  {phaseList.filter(phase => phase !== 'All').map(phase => <option key={phase}>{phase}</option>)}
                </CatalogSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Brand</label>
                <input className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-blue-400" placeholder="Approved brand/vendor" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Unit price</label>
                <input className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-blue-400" placeholder="$0.00" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Description</label>
                <textarea rows={3} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-400" placeholder="Material description, specification, approval notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button onClick={() => setAddMaterialOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { toast.success('Material draft added to catalog.'); setAddMaterialOpen(false); }} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/15 hover:bg-blue-700">Save material</button>
            </div>
          </div>
        </div>
      )}

      {isTableMaxViewOpen && (
        <div className="fixed inset-0 z-[220] flex flex-col bg-white">
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 px-4">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                <Maximize2 className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-950">Material table max view</h3>
                <p className="text-[11px] font-medium text-slate-500">
                  {filteredMaterials.length === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex} of {filteredMaterials.length} materials
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(page => Math.max(1, page - 1))} disabled={safeCurrentPage === 1} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40">
                <ChevronRight className="h-4 w-4 rotate-180" />
              </button>
              <span className="rounded-xl bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-600">{safeCurrentPage}/{totalPages}</span>
              <button onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))} disabled={safeCurrentPage === totalPages} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 disabled:opacity-40">
                <ChevronRight className="h-4 w-4" />
              </button>
              <button onClick={() => setTableMaxViewOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50">
                <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-4 py-3 w-12 text-center">
                    <input type="checkbox" checked={currentPageFullySelected} onChange={toggleAll} className="h-4 w-4 rounded accent-blue-600" />
                  </th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Phase</th>
	                  <th className="px-4 py-3">Brand</th>
	                  <th className="px-4 py-3 text-right">Unit Price</th>
	                  <th className="px-4 py-3 text-right">Trend %</th>
	                  <th className="px-4 py-3 text-right">Demand %</th>
	                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3 text-center">Availability</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
	                {paginatedMaterials.map((mat) => {
	                  const isSelected = selectedMaterialIds.has(mat.id);
	                  const signals = getMaterialSignals(mat);
	                  return (
                    <tr key={`max-${mat.id}`} className={`border-b border-slate-100 text-xs hover:bg-blue-50/30 ${isSelected ? 'bg-blue-50/60' : 'bg-white'}`}>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(mat.id)} className="h-4 w-4 rounded accent-blue-600" />
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">{mat.name}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{mat.id}</td>
                      <td className="px-4 py-3"><ServiceBadge service={mat.service} /></td>
                      <td className="px-4 py-3 text-slate-600">{mat.category}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">{getMaterialPhase(mat)}</span>
                      </td>
	                      <td className="px-4 py-3 font-semibold text-slate-700">{mat.brand}</td>
	                      <td className="px-4 py-3 text-right font-bold text-slate-900">{formatPrice(mat.price)}</td>
	                      <td className="px-4 py-3 text-right"><SignalCell value={signals.trendScore} /></td>
	                      <td className="px-4 py-3 text-right"><SignalCell value={signals.demandScore} /></td>
	                      <td className="px-4 py-3 text-slate-500">{mat.unit}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${
                          mat.availability.includes('In Stock') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          mat.availability.includes('Low') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-purple-50 text-purple-700 border-purple-100'
                        }`}>
                          {mat.availability}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => openMaterialDetail(mat)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                          <button onClick={() => addSingleToCollection(mat)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><ShoppingCart className="h-4 w-4" /></button>
                          <button onClick={() => toggleCompareSelection(mat.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600"><Scale className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- TOP CONTEXT BAR ----------------- */}
      <div className="relative z-20 bg-white px-1 py-1">
        <div className="flex min-h-10 flex-wrap items-center gap-2">
          <CatalogProjectPicker selectedProject={selectedProject} onProjectChange={setSelectedProject} />
          <span className="hidden h-5 w-px bg-slate-200 lg:block" />
          <span className="mr-1 text-sm font-semibold text-slate-950">Materials</span>

          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
            {activeTabItems.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
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
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === 'library' && (
              <>
                <button
                  onClick={openFilterModal}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                    activeFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                  aria-label="Open filters"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">{activeFilterCount}</span>
                  )}
                </button>
                <CatalogSelect value={pageSize} onChange={e => setPageSize(Number(e.target.value))} containerClassName="hidden w-24 xl:inline-flex" className="!h-8 !min-w-0 !py-1">
                  <option value={10}>10/page</option>
                  <option value={25}>25/page</option>
                  <option value={50}>50/page</option>
                  <option value={100}>100/page</option>
                </CatalogSelect>
                <button
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={safeCurrentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </button>
                <span className="rounded-xl bg-slate-50 px-2 py-1.5 text-[10px] font-bold text-slate-600">{safeCurrentPage}/{totalPages}</span>
                <button
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="flex h-8 items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                  <button onClick={() => setViewMode('list')} className={`rounded-lg p-1.5 transition ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <ListIcon className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setViewMode('grid')} className={`rounded-lg p-1.5 transition ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Grid3x3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={() => setTableMaxViewOpen(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-blue-600"
                  aria-label="Open max table view"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
            <button onClick={() => setAddMaterialOpen(true)} className="flex h-8 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white shadow-sm shadow-blue-600/15 transition hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              Add Material
            </button>
          </div>
        </div>
      </div>

      {/* ----------------- MAIN VIEW ----------------- */}
      <div className="relative z-10">
        
        {/* VIEW: LIBRARY */}
        {activeTab === 'library' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {selectedMaterials.length > 0 && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">{selectedMaterials.length}</span>
                      <h3 className="text-sm font-bold text-slate-950">Selected materials</h3>
                    </div>
                    <div className="mt-2 flex max-w-full flex-wrap gap-2">
                      {selectedMaterials.slice(0, 6).map((material) => (
                        <button
                          key={`selected-${material.id}`}
                          onClick={() => openMaterialDetail(material)}
                          className="inline-flex max-w-[240px] items-center gap-2 rounded-xl border border-blue-100 bg-white px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700"
                        >
                          <span className="truncate">{material.name}</span>
                          <X
                            className="h-3.5 w-3.5 shrink-0 text-slate-400 hover:text-red-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleSelection(material.id);
                            }}
                          />
                        </button>
                      ))}
                      {selectedMaterials.length > 6 && (
                        <span className="rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm">+{selectedMaterials.length - 6} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button onClick={() => setCompareModalOpen(true)} className="h-8 rounded-xl border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 hover:bg-blue-50">Compare</button>
                    <button onClick={addToCollection} className="h-8 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700">Save to Collection</button>
                    <button onClick={() => setSelectedMaterialIds(new Set())} className="h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">Clear</button>
                  </div>
                </div>
              </div>
            )}

            {/* Content Area */}
            {filteredMaterials.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">No materials found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters or search query.</p>
                <button onClick={() => { setFilterService('All'); setFilterPhase('All'); setFilterBrand('All'); setFilterAvailability('All'); setSearchQuery(''); }} className="mt-4 px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  Clear all filters
                </button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03]">
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/80">
                      <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        <th className="py-3 px-4 w-12 text-center">
                          <input type="checkbox" checked={currentPageFullySelected} onChange={toggleAll} className="rounded text-blue-600 w-4 h-4 accent-blue-600 cursor-pointer" />
                        </th>
                        <th className="py-3 px-4 w-20">Image</th>
                        <th className="py-3 px-4">Material Details</th>
                        <th className="py-3 px-4">Service / Category</th>
                        <th className="py-3 px-4">Phase</th>
	                        <th className="py-3 px-4">Brand</th>
	                        <th className="py-3 px-4 text-right">Unit Price</th>
	                        <th className="py-3 px-4 text-right">Trend %</th>
	                        <th className="py-3 px-4 text-right">Demand %</th>
	                        <th className="py-3 px-4 text-center">Availability</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
	                      {paginatedMaterials.map((mat) => {
	                        const isSelected = selectedMaterialIds.has(mat.id);
	                        const signals = getMaterialSignals(mat);
	                        return (
                          <tr key={mat.id} className={`border-b border-slate-100 transition-colors group last:border-0 ${isSelected ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'}`}>
                            <td className="py-3 px-4 text-center">
                              <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(mat.id)} className="rounded text-blue-600 w-4 h-4 accent-blue-600 cursor-pointer" />
                            </td>
                            <td className="py-3 px-4">
                              <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shadow-sm cursor-pointer shrink-0" onClick={() => openMaterialDetail(mat)}>
                                <MaterialThumbnail src={mat.image} service={mat.service} name={mat.name} className="group-hover:scale-110 transition-transform duration-300" />
                              </div>
                            </td>
                            <td className="py-3 px-4 cursor-pointer" onClick={() => openMaterialDetail(mat)}>
                              <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{mat.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{mat.id}</p>
                            </td>
                            <td className="py-3 px-4">
                              <ServiceBadge service={mat.service} />
                              <p className="text-[11px] text-slate-500 mt-1">{mat.category}</p>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex max-w-[190px] items-center rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                {getMaterialPhase(mat)}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-slate-700 font-bold text-xs">{mat.brand}</p>
                            </td>
	                            <td className="py-3 px-4 text-right">
	                              <p className="text-slate-900 font-bold">{formatPrice(mat.price)}</p>
	                              <p className="text-[10px] text-slate-400 mt-0.5 uppercase">per {mat.unit}</p>
	                            </td>
	                            <td className="py-3 px-4 text-right"><SignalCell value={signals.trendScore} /></td>
	                            <td className="py-3 px-4 text-right"><SignalCell value={signals.demandScore} /></td>
	                            <td className="py-3 px-4 text-center">
                              <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
                                mat.availability.includes('In Stock') ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                mat.availability.includes('Low') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-purple-50 text-purple-700 border-purple-100'
                              }`}>
                                {mat.availability}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="relative flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openMaterialDetail(mat)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => openEditMaterial(mat)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => setOpenActionMenu(openActionMenu === mat.id ? null : mat.id)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><MoreVertical className="w-4 h-4" /></button>
                                {openActionMenu === mat.id && (
                                  <div className="absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl shadow-slate-950/10">
                                    <button onClick={() => openMaterialDetail(mat)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Eye className="h-3.5 w-3.5" /> View details</button>
                                    <button onClick={() => addSingleToCollection(mat)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><ShoppingCart className="h-3.5 w-3.5" /> Save collection</button>
                                    <button onClick={() => toggleCompareSelection(mat.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Scale className="h-3.5 w-3.5" /> Toggle compare</button>
                                    <button onClick={() => copyMaterialCode(mat.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Copy className="h-3.5 w-3.5" /> Copy code</button>
                                  </div>
                                )}
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
              /* GRID VIEW */
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
                {paginatedMaterials.map((mat) => {
                  const isSelected = selectedMaterialIds.has(mat.id);
                  return (
                    <div key={mat.id} className={`relative bg-white border rounded-xl shadow-sm hover:shadow-md transition-all group ${isSelected ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'}`}>
                      <div className="relative h-20 overflow-hidden rounded-t-xl bg-slate-100">
                        <div className="w-full h-full group-hover:scale-105 transition-transform duration-500">
                          <MaterialThumbnail src={mat.image} service={mat.service} name={mat.name} className="group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="absolute top-2 left-2">
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelection(mat.id)} className="rounded text-blue-600 w-4 h-4 accent-blue-600 cursor-pointer shadow-sm border-white" />
                        </div>
                        <div className="absolute top-2 right-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide shadow-sm border backdrop-blur-md ${
                            mat.availability.includes('In Stock') ? 'bg-emerald-50/90 text-emerald-700 border-emerald-200' : 
                            'bg-amber-50/90 text-amber-700 border-amber-200'
                          }`}>
                            {mat.availability.includes('In Stock') ? '✓ Stock' : mat.availability.includes('Low') ? 'Low' : 'Lead'}
                          </span>
                        </div>
                      </div>
                      <div className="p-2.5">
                        <div className="cursor-pointer mb-2" onClick={() => openMaterialDetail(mat)}>
                          <p className="text-[9px] font-mono text-slate-400 mb-0.5 truncate">{mat.id}</p>
                          <h3 className="font-bold text-slate-900 text-xs leading-tight group-hover:text-blue-600 transition-colors truncate">{mat.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-6 overflow-hidden">
                          <ServiceBadge service={mat.service} />
                          <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded uppercase">{getMaterialPhase(mat)}</span>
                        </div>
                        <div className="flex justify-between items-end border-t border-slate-100 pt-1.5 mt-1.5">
                          <div>
                            <p className="text-sm font-black text-slate-900">{formatPrice(mat.price)}</p>
                            <p className="text-[9px] text-slate-400 uppercase truncate">/{mat.unit}</p>
                          </div>
                          <div className="relative flex items-center gap-1">
                            <button onClick={(event) => { event.stopPropagation(); openMaterialDetail(mat); }} className="p-1.5 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 hover:border-blue-200">
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={(event) => { event.stopPropagation(); setOpenActionMenu(openActionMenu === mat.id ? null : mat.id); }} className="p-1.5 bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 hover:border-blue-200">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>
                            {openActionMenu === mat.id && (
                              <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-8 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl shadow-slate-950/15">
                                <button onClick={() => openMaterialDetail(mat)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Eye className="h-3.5 w-3.5" /> View details</button>
                                <button onClick={() => addSingleToCollection(mat)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><ShoppingCart className="h-3.5 w-3.5" /> Save collection</button>
                                <button onClick={() => toggleCompareSelection(mat.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Scale className="h-3.5 w-3.5" /> Toggle compare</button>
                                <button onClick={() => copyMaterialCode(mat.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Copy className="h-3.5 w-3.5" /> Copy code</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW: COLLECTIONS */}
        {activeTab === 'collection' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">My Saved Collections</h2>
                <p className="text-sm text-slate-500">Materials saved for project allocation or vendor sharing.</p>
              </div>
              <button onClick={shareCollection} disabled={collection.length === 0} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center gap-2 transition-all hover:bg-blue-700">
                <Share2 className="w-4 h-4" /> Share Collection
              </button>
            </div>

            {collection.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm border-dashed">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <ShoppingCart className="w-8 h-8 text-blue-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Your collection is empty</h3>
                <p className="text-sm text-slate-500 mb-6">Go to the Material Library and select items to build a collection.</p>
                <button onClick={() => setActiveTab('library')} className="px-6 py-2.5 bg-white border border-slate-200 text-sm font-bold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
                  Browse Library
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {collection.map((mat, i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-4 relative group">
                    <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <MaterialThumbnail src={mat.image} service={mat.service} name={mat.name} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight mb-1">{mat.name}</h4>
                      <p className="text-xs font-semibold text-slate-500">{mat.brand}</p>
                      <p className="text-xs font-bold text-blue-600 mt-1">{formatPrice(mat.price)}</p>
                    </div>
                    <button onClick={() => setCollection(collection.filter(c => c.id !== mat.id))} className="absolute top-2 right-2 p-1.5 bg-white shadow-sm border border-slate-200 rounded-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: APPROVAL QUEUE */}
        {activeTab === 'approval' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Approval Queue</h2>
                  <p className="text-sm text-slate-500">Sample materials pending catalog verification and phase tagging.</p>
                </div>
                <button onClick={() => toast.info('Approval queue refreshed.')} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100">
                  <CheckSquare className="h-4 w-4" /> Refresh Queue
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Material</th>
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Phase</th>
                    <th className="px-4 py-3">Submitted By</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {mockMaterials.slice(0, 12).map((mat, index) => (
                    <tr key={`approval-${mat.id}`} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <button onClick={() => openMaterialDetail(mat)} className="text-left">
                          <p className="font-bold text-slate-900">{mat.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">{mat.id}</p>
                        </button>
                      </td>
                      <td className="px-4 py-3"><ServiceBadge service={mat.service} /></td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">{getMaterialPhase(mat)}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{index % 2 === 0 ? 'Catalog Manager' : 'QS Team'}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">Pending</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openMaterialDetail(mat)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Review</button>
                          <button onClick={() => toast.success(`${mat.name} approved for ${getMaterialPhase(mat)} phase.`)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700">Approve</button>
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
