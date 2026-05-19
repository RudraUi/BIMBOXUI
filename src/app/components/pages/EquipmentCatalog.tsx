import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, Check, CheckCircle2, CheckSquare, ChevronDown, ChevronRight, Clock,
  Copy, Edit2, Eye, Filter, Grid3x3, Library, List as ListIcon, MoreVertical,
  Plus, Scale, Search, Share2, ShieldCheck, ShoppingCart, Trash2, Truck, X
} from 'lucide-react';
import { toast } from 'sonner';

type CatalogTabItem<T extends string> = { key: T; label: string; count?: number | string };

type EquipmentStatus = 'Approved' | 'Draft' | 'Under Review' | 'Maintenance Hold';
type EquipmentAvailability = 'Available' | 'Reserved' | 'Service Due' | 'Unavailable';

type EquipmentItem = {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  powerType: string;
  capacity: string;
  manufacturer: string;
  model: string;
  status: EquipmentStatus;
  approval: string;
  availability: EquipmentAvailability;
  fleetSize: number;
  activeProjects: number;
  lastUpdated: string;
  dailyRate: number;
  image: string;
  description: string;
  specs: Record<string, string>;
  features: string[];
};

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

const EQUIPMENT_STATUS: EquipmentStatus[] = ['Approved', 'Draft', 'Under Review', 'Maintenance Hold'];
const EQUIPMENT_AVAILABILITY: EquipmentAvailability[] = ['Available', 'Reserved', 'Service Due', 'Unavailable'];
const POWER_TYPES = ['Diesel', 'Electric', 'Hybrid', 'Battery', 'Pneumatic', 'Hydraulic', 'Manual'];
const DEPLOYMENT_PACKAGES = ['Earthworks', 'Structure core', 'Facade access', 'MEP rough-in', 'Finishing', 'Roadworks', 'Site logistics'];

const CATEGORY_TONES: Record<string, string> = {
  Earthmoving: 'border-amber-200 bg-amber-50 text-amber-700',
  Lifting: 'border-blue-200 bg-blue-50 text-blue-700',
  Access: 'border-sky-200 bg-sky-50 text-sky-700',
  Concreting: 'border-stone-200 bg-stone-50 text-stone-700',
  Compaction: 'border-orange-200 bg-orange-50 text-orange-700',
  Roadworks: 'border-zinc-200 bg-zinc-50 text-zinc-700',
  Power: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  Dewatering: 'border-cyan-200 bg-cyan-50 text-cyan-700',
  Survey: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  Demolition: 'border-red-200 bg-red-50 text-red-700',
  'Material Handling': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Small Tools': 'border-violet-200 bg-violet-50 text-violet-700',
};

const CATEGORY_IMAGES: Record<string, string> = {
  Earthmoving: 'https://images.unsplash.com/photo-1572093551061-00624bb8840b?auto=format&fit=crop&q=80&w=240',
  Lifting: 'https://images.unsplash.com/photo-1541888086925-0c13d4cc4322?auto=format&fit=crop&q=80&w=240',
  Access: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=240',
  Concreting: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=240',
  Compaction: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=240',
  Roadworks: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=240',
  Power: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=240',
  Dewatering: 'https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&q=80&w=240',
  Survey: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=240',
  Demolition: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=240',
  'Material Handling': 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&q=80&w=240',
  'Small Tools': 'https://images.unsplash.com/photo-1581147036324-c1c89c2c8b5c?auto=format&fit=crop&q=80&w=240',
};

const equipmentSeeds: EquipmentItem[] = [
  { id: 'EQ-LIFT-0001', name: 'Tower Crane 12 Ton', category: 'Lifting', subcategory: 'Tower Crane', powerType: 'Electric', capacity: '12 ton / 60m jib', manufacturer: 'Liebherr', model: 'EC-B 240', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 4, activeProjects: 3, lastUpdated: '2026-05-10', dailyRate: 1500, image: CATEGORY_IMAGES.Lifting, description: 'Flat-top tower crane for high-rise concrete and steel erection work.', specs: { 'Max Load': '12 ton', 'Jib Length': '60 m', 'Hook Height': '50 m', 'Operator': 'Certified crane operator' }, features: ['Anti-collision', 'Load moment limiter', 'Remote monitoring'] },
  { id: 'EQ-LIFT-0002', name: 'Mobile Crane 80 Ton', category: 'Lifting', subcategory: 'Mobile Crane', powerType: 'Diesel', capacity: '80 ton', manufacturer: 'Tadano', model: 'GR-800EX', status: 'Approved', approval: 'Approved', availability: 'Reserved', fleetSize: 3, activeProjects: 2, lastUpdated: '2026-05-08', dailyRate: 2100, image: CATEGORY_IMAGES.Lifting, description: 'Rough-terrain crane for precast lifting, plant installation, and shutdown works.', specs: { 'Rated Capacity': '80 ton', 'Boom': '47 m', 'Drive': '4x4', 'Counterweight': 'Integrated' }, features: ['Rough terrain', 'Lift planning ready', 'Telematics'] },
  { id: 'EQ-EARTH-0001', name: 'Crawler Excavator 20 Ton', category: 'Earthmoving', subcategory: 'Excavator', powerType: 'Diesel', capacity: '1.2 m3 bucket', manufacturer: 'Caterpillar', model: '320 GC', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 12, activeProjects: 8, lastUpdated: '2026-05-14', dailyRate: 800, image: CATEGORY_IMAGES.Earthmoving, description: 'Standard tail-swing excavator for excavation, trenching, and loading.', specs: { 'Operating Weight': '20 ton', 'Bucket': '1.2 m3', 'Dig Depth': '6.7 m', 'Attachment': 'Breaker compatible' }, features: ['GPS grade control', 'Quick coupler', 'Fuel efficient'] },
  { id: 'EQ-EARTH-0002', name: 'Backhoe Loader', category: 'Earthmoving', subcategory: 'Backhoe', powerType: 'Diesel', capacity: '1.0 m3 loader', manufacturer: 'JCB', model: '3DX', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 18, activeProjects: 12, lastUpdated: '2026-05-11', dailyRate: 360, image: CATEGORY_IMAGES.Earthmoving, description: 'Multipurpose backhoe loader for trenching, loading, and utility support.', specs: { 'Loader Bucket': '1.0 m3', 'Backhoe Bucket': '0.26 m3', 'Dig Depth': '4.7 m', 'Drive': '4WD' }, features: ['Multi-purpose', 'Urban site ready', 'Low mobilization cost'] },
  { id: 'EQ-EARTH-0003', name: 'Wheel Loader 3 m3', category: 'Earthmoving', subcategory: 'Loader', powerType: 'Diesel', capacity: '3.0 m3 bucket', manufacturer: 'Volvo CE', model: 'L90H', status: 'Under Review', approval: 'In Review', availability: 'Service Due', fleetSize: 5, activeProjects: 2, lastUpdated: '2026-05-06', dailyRate: 780, image: CATEGORY_IMAGES.Earthmoving, description: 'Front-end loader for aggregate yards, batching plant feeding, and muck handling.', specs: { 'Bucket': '3.0 m3', 'Payload': '5.5 ton', 'Tipping Load': '9.1 ton', 'Cab': 'ROPS/FOPS' }, features: ['High breakout force', 'Yard operations', 'Scale ready'] },
  { id: 'EQ-EARTH-0004', name: 'Bulldozer D6 Class', category: 'Earthmoving', subcategory: 'Dozer', powerType: 'Diesel', capacity: 'Semi-U blade', manufacturer: 'Caterpillar', model: 'D6', status: 'Approved', approval: 'Approved', availability: 'Reserved', fleetSize: 3, activeProjects: 2, lastUpdated: '2026-05-03', dailyRate: 1100, image: CATEGORY_IMAGES.Earthmoving, description: 'Crawler dozer for bulk earthworks, grading, and haul road formation.', specs: { 'Blade': 'Semi-U', 'Operating Weight': '22 ton', 'Grade Control': '3D capable', 'Track': 'LGP option' }, features: ['Bulk push', '3D grade ready', 'Low ground pressure'] },
  { id: 'EQ-CONC-0001', name: 'Concrete Pump Truck 36m', category: 'Concreting', subcategory: 'Boom Pump', powerType: 'Diesel', capacity: '36 m boom', manufacturer: 'Putzmeister', model: 'BSF 36-4', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 2, activeProjects: 1, lastUpdated: '2026-05-15', dailyRate: 1200, image: CATEGORY_IMAGES.Concreting, description: 'Truck-mounted concrete pump for podium slabs, cores, and bridge decks.', specs: { 'Boom Reach': '36 m', 'Output': '140 m3/hr', 'Pipeline': '125 mm', 'Crew': 'Pump operator + helper' }, features: ['High output', 'Boom inspection logged', 'Washout kit'] },
  { id: 'EQ-CONC-0002', name: 'Transit Mixer 6 m3', category: 'Concreting', subcategory: 'Mixer Truck', powerType: 'Diesel', capacity: '6 m3 drum', manufacturer: 'Schwing Stetter', model: 'AM 6 C2', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 14, activeProjects: 9, lastUpdated: '2026-05-12', dailyRate: 420, image: CATEGORY_IMAGES.Concreting, description: 'Ready-mix concrete transit mixer for batching plant to pour location logistics.', specs: { 'Drum': '6 m3', 'Chassis': '6x4', 'Slump Control': 'Manual', 'Wash System': 'Onboard' }, features: ['RMC logistics', 'GPS tracking', 'Batch ticket ready'] },
  { id: 'EQ-CONC-0003', name: 'Concrete Vibrator Set', category: 'Concreting', subcategory: 'Vibration', powerType: 'Electric', capacity: '40 mm needle', manufacturer: 'Wacker Neuson', model: 'IRFU 45', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 28, activeProjects: 15, lastUpdated: '2026-05-13', dailyRate: 35, image: CATEGORY_IMAGES.Concreting, description: 'Needle vibrator kit for beams, columns, walls, slabs, and footings.', specs: { 'Needle': '40 mm', 'Voltage': '230 V', 'Cable': '15 m', 'Duty': 'Continuous' }, features: ['Low weight', 'Site portable', 'Spare needle kit'] },
  { id: 'EQ-ACC-0001', name: 'Scissor Lift 32 ft', category: 'Access', subcategory: 'Scissor Lift', powerType: 'Battery', capacity: '32 ft platform', manufacturer: 'Genie', model: 'GS-3246', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 10, activeProjects: 6, lastUpdated: '2026-05-07', dailyRate: 160, image: CATEGORY_IMAGES.Access, description: 'Electric slab scissor lift for indoor MEP, ceiling, and finishing works.', specs: { 'Platform Height': '32 ft', 'Capacity': '318 kg', 'Drive': 'Battery electric', 'Use': 'Indoor slab' }, features: ['Non-marking tires', 'Indoor access', 'Low noise'] },
  { id: 'EQ-ACC-0002', name: 'Articulating Boom Lift 60 ft', category: 'Access', subcategory: 'Boom Lift', powerType: 'Hybrid', capacity: '60 ft reach', manufacturer: 'JLG', model: 'E600AJ', status: 'Under Review', approval: 'In Review', availability: 'Reserved', fleetSize: 4, activeProjects: 3, lastUpdated: '2026-05-02', dailyRate: 390, image: CATEGORY_IMAGES.Access, description: 'Articulated boom lift for facade, services, and overhead installation access.', specs: { 'Platform Height': '60 ft', 'Horizontal Reach': '39 ft', 'Capacity': '230 kg', 'Rotation': '360 deg' }, features: ['Overreach access', 'Hybrid drive', 'Fall arrest points'] },
  { id: 'EQ-COMP-0001', name: 'Soil Compactor 10 Ton', category: 'Compaction', subcategory: 'Single Drum Roller', powerType: 'Diesel', capacity: '10 ton', manufacturer: 'Hamm', model: '3410', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 7, activeProjects: 4, lastUpdated: '2026-05-09', dailyRate: 520, image: CATEGORY_IMAGES.Compaction, description: 'Vibratory roller for embankment, subgrade, and backfill compaction.', specs: { 'Operating Weight': '10 ton', 'Drum': 'Smooth', 'Vibration': 'Dual amplitude', 'Compaction Meter': 'Available' }, features: ['Subgrade ready', 'Compaction reporting', 'Slope capable'] },
  { id: 'EQ-COMP-0002', name: 'Plate Compactor', category: 'Compaction', subcategory: 'Light Compaction', powerType: 'Petrol', capacity: '90 kg plate', manufacturer: 'Mikasa', model: 'MVC-90', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 24, activeProjects: 11, lastUpdated: '2026-05-04', dailyRate: 42, image: CATEGORY_IMAGES.Compaction, description: 'Walk-behind plate compactor for trenches, pavers, and confined backfill.', specs: { 'Plate': '590 x 500 mm', 'Weight': '90 kg', 'Force': '15 kN', 'Travel': 'Forward' }, features: ['Trench backfill', 'Paver works', 'Easy transport'] },
  { id: 'EQ-ROAD-0001', name: 'Asphalt Paver 5.5m', category: 'Roadworks', subcategory: 'Paver', powerType: 'Diesel', capacity: '5.5 m paving width', manufacturer: 'Vogele', model: 'Super 1800-3', status: 'Approved', approval: 'Approved', availability: 'Service Due', fleetSize: 2, activeProjects: 1, lastUpdated: '2026-05-01', dailyRate: 1350, image: CATEGORY_IMAGES.Roadworks, description: 'Tracked asphalt paver for roads, podium drives, and industrial pavements.', specs: { 'Paving Width': '2.5-5.5 m', 'Hopper': '13 ton', 'Screed': 'Vibratory', 'Grade': 'Sensor capable' }, features: ['Road package', 'Sensor grade', 'High mat quality'] },
  { id: 'EQ-ROAD-0002', name: 'Motor Grader 14 ft', category: 'Roadworks', subcategory: 'Grader', powerType: 'Diesel', capacity: '14 ft moldboard', manufacturer: 'Caterpillar', model: '140K', status: 'Approved', approval: 'Approved', availability: 'Reserved', fleetSize: 3, activeProjects: 2, lastUpdated: '2026-05-05', dailyRate: 980, image: CATEGORY_IMAGES.Roadworks, description: 'Motor grader for road formation, subgrade trimming, and site haul roads.', specs: { 'Moldboard': '14 ft', 'Ripper': 'Rear', 'Grade Control': '2D/3D option', 'Cab': 'ROPS' }, features: ['Fine grading', 'Haul road support', 'Laser ready'] },
  { id: 'EQ-POWER-0001', name: 'Diesel Generator 500 kVA', category: 'Power', subcategory: 'Generator', powerType: 'Diesel', capacity: '500 kVA', manufacturer: 'Cummins', model: 'C500D5', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 8, activeProjects: 5, lastUpdated: '2026-05-16', dailyRate: 330, image: CATEGORY_IMAGES.Power, description: 'Silent diesel generator for tower cranes, site offices, and backup power.', specs: { 'Prime Power': '500 kVA', 'Voltage': '415 V', 'Tank': '8 hr base tank', 'Noise': 'Acoustic enclosure' }, features: ['Silent canopy', 'AMF ready', 'Fuel telemetry'] },
  { id: 'EQ-POWER-0002', name: 'Light Tower LED', category: 'Power', subcategory: 'Lighting', powerType: 'Hybrid', capacity: '4 x LED mast', manufacturer: 'Atlas Copco', model: 'HiLight H5+', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 16, activeProjects: 7, lastUpdated: '2026-05-12', dailyRate: 85, image: CATEGORY_IMAGES.Power, description: 'Mobile light tower for night pours, logistics yards, and security lighting.', specs: { 'Mast': '8 m', 'Lamps': '4 LED', 'Runtime': '70 hr', 'Tow': 'Trailer mounted' }, features: ['Night works', 'Low fuel burn', 'Towable'] },
  { id: 'EQ-DEW-0001', name: 'Submersible Dewatering Pump', category: 'Dewatering', subcategory: 'Pump', powerType: 'Electric', capacity: '4 inch discharge', manufacturer: 'Tsurumi', model: 'KRS2-80', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 20, activeProjects: 9, lastUpdated: '2026-05-13', dailyRate: 60, image: CATEGORY_IMAGES.Dewatering, description: 'Heavy-duty dewatering pump for basements, shafts, trenches, and stormwater.', specs: { 'Discharge': '4 inch', 'Flow': '1200 lpm', 'Head': '20 m', 'Solids': '10 mm' }, features: ['Basement works', 'Silt tolerant', 'Float switch'] },
  { id: 'EQ-SURV-0001', name: 'Robotic Total Station', category: 'Survey', subcategory: 'Survey Instrument', powerType: 'Battery', capacity: '1 second accuracy', manufacturer: 'Leica', model: 'TS16', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 5, activeProjects: 4, lastUpdated: '2026-05-14', dailyRate: 190, image: CATEGORY_IMAGES.Survey, description: 'Robotic total station for layout, as-built capture, and control surveys.', specs: { 'Accuracy': '1 sec', 'Range': '3500 m prism', 'Control': 'Robotic', 'Data': 'BIM export' }, features: ['BIM layout', 'One-person survey', 'Cloud sync'] },
  { id: 'EQ-SURV-0002', name: 'Laser Scanner', category: 'Survey', subcategory: 'Reality Capture', powerType: 'Battery', capacity: '2M pts/sec', manufacturer: 'FARO', model: 'Focus Premium', status: 'Approved', approval: 'Approved', availability: 'Reserved', fleetSize: 2, activeProjects: 2, lastUpdated: '2026-05-06', dailyRate: 260, image: CATEGORY_IMAGES.Survey, description: '3D laser scanner for progress capture, QA checks, and digital twin updates.', specs: { 'Scan Rate': '2M pts/sec', 'Range': '350 m', 'Accuracy': '+/-1 mm', 'Output': 'Point cloud' }, features: ['Digital twin', 'QA overlay', 'Fast capture'] },
  { id: 'EQ-DEMO-0001', name: 'Hydraulic Breaker', category: 'Demolition', subcategory: 'Attachment', powerType: 'Hydraulic', capacity: '2.5 ton class', manufacturer: 'Epiroc', model: 'HB 2500', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 6, activeProjects: 3, lastUpdated: '2026-05-03', dailyRate: 310, image: CATEGORY_IMAGES.Demolition, description: 'Excavator-mounted breaker for demolition, rock breaking, and pile trimming.', specs: { 'Carrier': '22-32 ton', 'Tool Diameter': '155 mm', 'Oil Flow': '170 lpm', 'Noise Kit': 'Silenced' }, features: ['Rock breaking', 'Pile trimming', 'Quick coupler'] },
  { id: 'EQ-MH-0001', name: 'Telehandler 4 Ton', category: 'Material Handling', subcategory: 'Telehandler', powerType: 'Diesel', capacity: '4 ton / 17 m', manufacturer: 'Manitou', model: 'MT 1840', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 5, activeProjects: 4, lastUpdated: '2026-05-09', dailyRate: 520, image: CATEGORY_IMAGES['Material Handling'], description: 'Telehandler for pallets, formwork, facade materials, and site logistics.', specs: { 'Capacity': '4 ton', 'Lift Height': '17.5 m', 'Reach': '13 m', 'Attachment': 'Forks/bucket' }, features: ['Site logistics', 'High reach', 'Fork attachment'] },
  { id: 'EQ-MH-0002', name: 'Forklift 3 Ton', category: 'Material Handling', subcategory: 'Forklift', powerType: 'Electric', capacity: '3 ton', manufacturer: 'Toyota', model: '8FBE30', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 11, activeProjects: 6, lastUpdated: '2026-05-11', dailyRate: 180, image: CATEGORY_IMAGES['Material Handling'], description: 'Electric forklift for warehouse, stores, MEP pallet movement, and logistics.', specs: { 'Capacity': '3 ton', 'Mast': '4.5 m', 'Drive': 'Electric', 'Tires': 'Cushion' }, features: ['Indoor logistics', 'Low noise', 'Pallet movement'] },
  { id: 'EQ-TOOL-0001', name: 'Welding Machine 400A', category: 'Small Tools', subcategory: 'Welding', powerType: 'Electric', capacity: '400 A output', manufacturer: 'Lincoln Electric', model: 'Flextec 450', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 30, activeProjects: 14, lastUpdated: '2026-05-16', dailyRate: 45, image: CATEGORY_IMAGES['Small Tools'], description: 'Heavy-duty welding set for structural steel, embeds, and site fabrication.', specs: { 'Output': '400 A', 'Input': '415 V', 'Process': 'SMAW/MIG', 'Leads': '20 m' }, features: ['Site fabrication', 'Multi-process', 'Earth clamp kit'] },
  { id: 'EQ-TOOL-0002', name: 'Rebar Cutting Machine', category: 'Small Tools', subcategory: 'Rebar Processing', powerType: 'Electric', capacity: '32 mm bar', manufacturer: 'Hitachi', model: 'VB32Y', status: 'Approved', approval: 'Approved', availability: 'Available', fleetSize: 9, activeProjects: 5, lastUpdated: '2026-05-04', dailyRate: 55, image: CATEGORY_IMAGES['Small Tools'], description: 'Electric rebar cutting station for reinforcement yard and slab works.', specs: { 'Bar Capacity': '32 mm', 'Motor': '3 kW', 'Cycle': '3 sec', 'Bench': 'Included' }, features: ['Rebar yard', 'Fast cycle', 'Guarded blade'] },
  { id: 'EQ-TOOL-0003', name: 'Core Drilling Rig', category: 'Small Tools', subcategory: 'Drilling', powerType: 'Electric', capacity: '250 mm core', manufacturer: 'Hilti', model: 'DD 250', status: 'Under Review', approval: 'In Review', availability: 'Reserved', fleetSize: 7, activeProjects: 4, lastUpdated: '2026-05-02', dailyRate: 75, image: CATEGORY_IMAGES['Small Tools'], description: 'Diamond core drilling rig for sleeves, anchors, penetrations, and QA samples.', specs: { 'Core Diameter': '250 mm', 'Stand': 'Vacuum/base', 'Water Feed': 'Integrated', 'Use': 'Wet drilling' }, features: ['MEP openings', 'Anchor holes', 'Dust controlled'] },
];

const expansionSuffixes = ['Standard', 'Heavy Duty', 'Low Emission', 'Urban Compact', 'Rental Ready', 'High Reach', 'BIM Tracked', 'Night Shift'];

function buildExpandedEquipmentCatalog(seeds: EquipmentItem[], target = 900) {
  const list: EquipmentItem[] = [];
  for (let index = 0; index < target; index += 1) {
    const seed = seeds[index % seeds.length];
    const variant = Math.floor(index / seeds.length);
    const suffix = expansionSuffixes[variant % expansionSuffixes.length];
    const idPrefix = seed.category.replace(/[^A-Z]/gi, '').slice(0, 4).toUpperCase();
    const multiplier = 1 + ((variant % 9) - 3) * 0.035;
    const status = EQUIPMENT_STATUS[(index + seed.id.length) % EQUIPMENT_STATUS.length];
    const availability = EQUIPMENT_AVAILABILITY[(index + seed.name.length) % EQUIPMENT_AVAILABILITY.length];
    list.push({
      ...seed,
      id: `EQ-${idPrefix}-${String(index + 1).padStart(4, '0')}`,
      name: variant === 0 ? seed.name : `${seed.name} ${suffix}`,
      status: index < seeds.length ? seed.status : status,
      approval: status === 'Approved' ? 'Approved' : status === 'Draft' ? 'Pending' : status === 'Maintenance Hold' ? 'Blocked' : 'In Review',
      availability: index < seeds.length ? seed.availability : availability,
      fleetSize: Math.max(1, seed.fleetSize + (variant % 6) - 2),
      activeProjects: Math.max(0, Math.min(seed.fleetSize + 3, seed.activeProjects + (variant % 5) - 2)),
      dailyRate: Math.round(seed.dailyRate * multiplier),
      lastUpdated: `2026-05-${String(1 + (index % 18)).padStart(2, '0')}`,
      model: variant === 0 ? seed.model : `${seed.model}-${variant + 1}`,
      specs: {
        ...seed.specs,
        'Catalog Variant': suffix,
        'Inspection Cycle': availability === 'Service Due' ? 'Due this week' : '30 days',
      },
      features: Array.from(new Set([...seed.features, suffix])),
    });
  }
  return list;
}

function EquipmentImageFallback({ category, name, className = '' }: { category: string; name: string; className?: string }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase();
  return (
    <div className={`flex h-full w-full select-none flex-col items-center justify-center gap-0.5 bg-slate-100 text-slate-400 ${className}`}>
      <Truck className="h-5 w-5 opacity-60" />
      <span className="text-[10px] font-black tracking-tight">{initials}</span>
      <span className="text-[8px] font-semibold uppercase tracking-[0.18em] opacity-60">{category}</span>
    </div>
  );
}

function EquipmentThumbnail({ src, category, name, className = '' }: { src?: string; category: string; name: string; className?: string }) {
  const [errored, setErrored] = useState(false);
  useEffect(() => setErrored(false), [src]);
  if (!src || errored) return <EquipmentImageFallback category={category} name={name} className={className} />;
  return <img src={src} alt={name} className={`h-full w-full object-cover ${className}`} onError={() => setErrored(true)} />;
}

function CategoryBadge({ category }: { category: string }) {
  const tone = CATEGORY_TONES[category] ?? 'border-slate-200 bg-slate-50 text-slate-700';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {category}
    </span>
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

function formatRate(rate: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(rate);
}

export default function EquipmentCatalog({ onBack: _onBack }: { onBack: () => void }) {
  const [activeView, setActiveView] = useState<'library' | 'collection' | 'approval'>('library');
  const [selectedProject, setSelectedProject] = useState('Downtown Tower Complex');
  const [userRole, setUserRole] = useState('Super Admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterAvailability, setFilterAvailability] = useState('All');
  const [filterPower, setFilterPower] = useState('All');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeEquipment, setActiveEquipment] = useState<EquipmentItem | null>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDetailEditMode, setDetailEditMode] = useState(false);
  const [isCompareModalOpen, setCompareModalOpen] = useState(false);
  const [isApproveModalOpen, setApproveModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isAddEquipmentOpen, setAddEquipmentOpen] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [selectedEquipmentIds, setSelectedEquipmentIds] = useState<Set<string>>(new Set());
  const [collection, setCollection] = useState<EquipmentItem[]>([]);
  const [equipmentOverrides, setEquipmentOverrides] = useState<Record<string, EquipmentItem>>({});
  const [deletedEquipmentIds, setDeletedEquipmentIds] = useState<Set<string>>(new Set());
  const [deploymentQty, setDeploymentQty] = useState(1);
  const [deploymentPackage, setDeploymentPackage] = useState('Earthworks');
  const [deploymentDate, setDeploymentDate] = useState('');
  const [newFeatureDraft, setNewFeatureDraft] = useState('');
  const [detailSpecRows, setDetailSpecRows] = useState<Array<{ key: string; value: string }>>([]);
  const [detailFeatureRows, setDetailFeatureRows] = useState<string[]>([]);
  const [detailDraft, setDetailDraft] = useState({
    name: '',
    category: '',
    subcategory: '',
    powerType: '',
    capacity: '',
    manufacturer: '',
    model: '',
    status: 'Approved' as EquipmentStatus,
    approval: '',
    availability: 'Available' as EquipmentAvailability,
    fleetSize: '',
    activeProjects: '',
    dailyRate: '',
    image: '',
    description: '',
  });

  const equipmentCatalog = useMemo(() => (
    buildExpandedEquipmentCatalog(equipmentSeeds, 900)
      .filter(equipment => !deletedEquipmentIds.has(equipment.id))
      .map(equipment => equipmentOverrides[equipment.id] ?? equipment)
  ), [deletedEquipmentIds, equipmentOverrides]);

  const categoryList = ['All', ...Array.from(new Set(equipmentCatalog.map(equipment => equipment.category)))];
  const manufacturerList = Array.from(new Set(equipmentCatalog.map(equipment => equipment.manufacturer)));

  const filteredEquipment = useMemo(() => {
    const tokens = searchQuery.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return equipmentCatalog.filter(equipment => {
      const searchable = [
        equipment.id,
        equipment.name,
        equipment.category,
        equipment.subcategory,
        equipment.powerType,
        equipment.capacity,
        equipment.manufacturer,
        equipment.model,
        equipment.status,
        equipment.availability,
        ...equipment.features,
        ...Object.values(equipment.specs),
      ].join(' ').toLowerCase();
      const matchesSearch = tokens.length === 0 || tokens.every(token => searchable.includes(token));
      return matchesSearch
        && (filterCategory === 'All' || equipment.category === filterCategory)
        && (filterStatus === 'All' || equipment.status === filterStatus)
        && (filterAvailability === 'All' || equipment.availability === filterAvailability)
        && (filterPower === 'All' || equipment.powerType === filterPower);
    });
  }, [equipmentCatalog, filterAvailability, filterCategory, filterPower, filterStatus, searchQuery]);

  const selectedEquipment = equipmentCatalog.filter(equipment => selectedEquipmentIds.has(equipment.id));
  const pendingCount = equipmentCatalog.filter(equipment => equipment.status !== 'Approved').length;
  const totalPages = Math.max(1, Math.ceil(filteredEquipment.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * pageSize;
  const pageEndIndex = Math.min(pageStartIndex + pageSize, filteredEquipment.length);
  const paginatedEquipment = filteredEquipment.slice(pageStartIndex, pageEndIndex);
  const currentPageFullySelected = paginatedEquipment.length > 0 && paginatedEquipment.every(equipment => selectedEquipmentIds.has(equipment.id));
  const activeFilterCount = [filterCategory, filterStatus, filterAvailability, filterPower].filter(value => value !== 'All').length;

  const sidebarMenu = [
    { id: 'library' as const, label: 'Equipment Library', icon: Library, count: equipmentCatalog.length },
    { id: 'collection' as const, label: 'My Collections', icon: ShoppingCart, count: collection.length },
    { id: 'approval' as const, label: 'Approval Queue', icon: CheckSquare, count: pendingCount },
  ];

  const getEquipmentSignals = (equipment: EquipmentItem) => {
    const seed = Array.from(equipment.id).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const utilizationScore = Math.min(96, Math.round((equipment.activeProjects / Math.max(1, equipment.fleetSize)) * 100) + (seed % 12));
    const demandScore = 48 + ((seed * 7) % 45);
    const readinessScore = equipment.availability === 'Available' ? 92 : equipment.availability === 'Reserved' ? 76 : equipment.availability === 'Service Due' ? 58 : 34;
    const weeklyDemand = 3 + (seed % 18);
    const dispatchRefs = 2 + (seed % 24);
    const maintenanceRisk = equipment.availability === 'Unavailable' || equipment.status === 'Maintenance Hold' ? 'High' : equipment.availability === 'Service Due' ? 'Medium' : 'Low';
    const inspectionScore = 70 + ((seed * 5) % 26);
    const idleHours = Math.max(0, 18 - equipment.activeProjects * 2 + (seed % 6));
    const certDays = 7 + (seed % 60);
    const fuelVariance = ((seed % 15) - 7) / 10;
    return { utilizationScore, demandScore, readinessScore, weeklyDemand, dispatchRefs, maintenanceRisk, inspectionScore, idleHours, certDays, fuelVariance };
  };

  const resetDetailDraft = (equipment: EquipmentItem) => {
    setDetailDraft({
      name: equipment.name,
      category: equipment.category,
      subcategory: equipment.subcategory,
      powerType: equipment.powerType,
      capacity: equipment.capacity,
      manufacturer: equipment.manufacturer,
      model: equipment.model,
      status: equipment.status,
      approval: equipment.approval,
      availability: equipment.availability,
      fleetSize: String(equipment.fleetSize),
      activeProjects: String(equipment.activeProjects),
      dailyRate: String(equipment.dailyRate),
      image: equipment.image,
      description: equipment.description,
    });
    setDetailSpecRows(Object.entries(equipment.specs).map(([key, value]) => ({ key, value })));
    setDetailFeatureRows(equipment.features);
    setNewFeatureDraft('');
  };

  const openEquipmentDetail = (equipment: EquipmentItem, edit = false) => {
    setOpenActionMenu(null);
    setActiveEquipment(equipment);
    resetDetailDraft(equipment);
    setDeploymentQty(1);
    setDeploymentPackage('Earthworks');
    setDeploymentDate('');
    setDetailEditMode(edit);
    setDetailModalOpen(true);
    if (edit) toast.info('Equipment edit panel opened.');
  };

  const updateSpecRow = (index: number, field: 'key' | 'value', value: string) => {
    setDetailSpecRows(rows => rows.map((row, rowIndex) => rowIndex === index ? { ...row, [field]: value } : row));
  };

  const addSpecRow = () => setDetailSpecRows(rows => [...rows, { key: '', value: '' }]);
  const removeSpecRow = (index: number) => setDetailSpecRows(rows => rows.filter((_, rowIndex) => rowIndex !== index));

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

  const removeFeatureRow = (index: number) => setDetailFeatureRows(rows => rows.filter((_, rowIndex) => rowIndex !== index));

  const saveEquipmentDraft = () => {
    if (!activeEquipment) return;
    const dailyRate = Number(detailDraft.dailyRate);
    const fleetSize = Number(detailDraft.fleetSize);
    const activeProjects = Number(detailDraft.activeProjects);
    if (!detailDraft.name.trim()) {
      toast.error('Equipment name is required.');
      return;
    }
    if (Number.isNaN(dailyRate) || dailyRate < 0 || Number.isNaN(fleetSize) || fleetSize < 0 || Number.isNaN(activeProjects) || activeProjects < 0) {
      toast.error('Enter valid rate, fleet size, and active project numbers.');
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
    const updatedEquipment: EquipmentItem = {
      ...activeEquipment,
      name: detailDraft.name.trim(),
      category: detailDraft.category.trim() || activeEquipment.category,
      subcategory: detailDraft.subcategory.trim() || activeEquipment.subcategory,
      powerType: detailDraft.powerType.trim() || activeEquipment.powerType,
      capacity: detailDraft.capacity.trim() || activeEquipment.capacity,
      manufacturer: detailDraft.manufacturer.trim() || activeEquipment.manufacturer,
      model: detailDraft.model.trim() || activeEquipment.model,
      status: detailDraft.status,
      approval: detailDraft.approval.trim() || activeEquipment.approval,
      availability: detailDraft.availability,
      fleetSize,
      activeProjects,
      dailyRate,
      image: detailDraft.image.trim(),
      description: detailDraft.description.trim() || activeEquipment.description,
      specs: nextSpecs,
      features: nextFeatures,
      lastUpdated: '2026-05-19',
    };
    setActiveEquipment(updatedEquipment);
    setEquipmentOverrides(prev => ({ ...prev, [updatedEquipment.id]: updatedEquipment }));
    setCollection(prev => prev.map(item => item.id === updatedEquipment.id ? updatedEquipment : item));
    setDetailEditMode(false);
    toast.success('Equipment details updated.');
  };

  const toggleSelection = (id: string) => {
    setSelectedEquipmentIds(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedEquipmentIds(current => {
      const next = new Set(current);
      if (currentPageFullySelected) {
        paginatedEquipment.forEach(equipment => next.delete(equipment.id));
      } else {
        paginatedEquipment.forEach(equipment => next.add(equipment.id));
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilterCategory('All');
    setFilterStatus('All');
    setFilterAvailability('All');
    setFilterPower('All');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const addToCollection = () => {
    const newItems = selectedEquipment.filter(equipment => !collection.some(item => item.id === equipment.id));
    setCollection(prev => [...prev, ...newItems]);
    setSelectedEquipmentIds(new Set());
    toast.success(`Added ${newItems.length} equipment item${newItems.length === 1 ? '' : 's'} to your collection.`);
  };

  const addSingleToCollection = (equipment: EquipmentItem) => {
    setOpenActionMenu(null);
    if (collection.some(item => item.id === equipment.id)) {
      toast.info('This equipment is already in your collection.');
      return;
    }
    setCollection(prev => [...prev, equipment]);
    toast.success('Added to collection.');
  };

  const shareCollection = () => {
    if (collection.length === 0) return;
    toast.success(`Equipment collection shared with ${collection.length} item${collection.length === 1 ? '' : 's'}.`);
  };

  const toggleDetailCollection = (equipment: EquipmentItem) => {
    if (collection.some(item => item.id === equipment.id)) {
      setCollection(prev => prev.filter(item => item.id !== equipment.id));
      toast.info('Removed from equipment collection.');
    } else {
      setCollection(prev => [...prev, equipment]);
      toast.success('Added to equipment collection.');
    }
  };

  const addDetailEquipmentToCompare = (equipment: EquipmentItem) => {
    setSelectedEquipmentIds(current => {
      const next = new Set(current);
      if (next.has(equipment.id)) next.delete(equipment.id);
      else next.add(equipment.id);
      return next;
    });
    toast.success(selectedEquipmentIds.has(equipment.id) ? 'Removed from compare.' : 'Added to compare.');
  };

  const copyEquipmentCode = (id: string) => {
    void navigator.clipboard?.writeText(id);
    setOpenActionMenu(null);
    toast.success(`Copied equipment code: ${id}`);
  };

  const shareEquipmentDetail = (equipment: EquipmentItem) => {
    toast.success(`Shared ${equipment.name} details.`);
  };

  const downloadEquipmentSpec = (equipment: EquipmentItem) => {
    toast.success(`Spec sheet prepared for ${equipment.id}.`);
  };

  const createDeploymentRequest = (equipment: EquipmentItem) => {
    if (!deploymentDate) {
      toast.error('Select a needed-by date.');
      return;
    }
    toast.success(`${deploymentQty} unit${deploymentQty === 1 ? '' : 's'} requested for ${deploymentPackage}.`);
    setCollection(prev => prev.some(item => item.id === equipment.id) ? prev : [...prev, equipment]);
  };

  const approveEquipment = (equipment: EquipmentItem) => {
    const approvedEquipment = { ...equipment, status: 'Approved' as EquipmentStatus, approval: 'Approved', availability: equipment.availability === 'Unavailable' ? 'Available' as EquipmentAvailability : equipment.availability };
    setEquipmentOverrides(prev => ({ ...prev, [approvedEquipment.id]: approvedEquipment }));
    setActiveEquipment(approvedEquipment);
    setApproveModalOpen(false);
    toast.success('Equipment successfully approved.');
  };

  const deleteEquipment = (equipment: EquipmentItem) => {
    setDeletedEquipmentIds(current => new Set(current).add(equipment.id));
    setEquipmentOverrides(prev => {
      const next = { ...prev };
      delete next[equipment.id];
      return next;
    });
    setCollection(prev => prev.filter(item => item.id !== equipment.id));
    setSelectedEquipmentIds(current => {
      const next = new Set(current);
      next.delete(equipment.id);
      return next;
    });
    setDeleteModalOpen(false);
    setDetailModalOpen(false);
    setActiveEquipment(null);
    toast.success('Equipment deleted.');
  };

  const statusBadgeClass = (status: EquipmentStatus) => (
    status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : status === 'Under Review' ? 'bg-purple-50 text-purple-700 border-purple-100'
        : status === 'Maintenance Hold' ? 'bg-red-50 text-red-700 border-red-100'
          : 'bg-amber-50 text-amber-700 border-amber-100'
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterAvailability, filterCategory, filterPower, filterStatus, searchQuery]);

  return (
    <div className="space-y-3 font-sans pb-10 relative">
      {isApproveModalOpen && activeEquipment && (
        <div className="fixed inset-0 z-[220] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">Approve Equipment</h3>
              <p className="mb-6 text-sm text-slate-500">Approve <span className="font-bold text-slate-700">{activeEquipment.name}</span> for deployment, procurement, and allocation workflows.</p>
              <textarea rows={3} placeholder="Approval comments" className="mb-6 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-400 focus:bg-white" />
              <div className="flex justify-end gap-3">
                <button onClick={() => setApproveModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={() => approveEquipment(activeEquipment)} className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700">Confirm Approval</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && activeEquipment && (
        <div className="fixed inset-0 z-[220] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">Delete Equipment</h3>
              <p className="mb-6 text-sm text-slate-500">This removes <span className="font-bold text-slate-700">{activeEquipment.name}</span> from the catalog in this session.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={() => deleteEquipment(activeEquipment)} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700">Delete Equipment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && activeEquipment && (() => {
        const signals = getEquipmentSignals(activeEquipment);
        const isInCollection = collection.some(item => item.id === activeEquipment.id);
        const isInCompare = selectedEquipmentIds.has(activeEquipment.id);
        return (
          <div className="fixed inset-0 z-[200] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <div className="bg-white rounded-[24px] border border-white/70 shadow-[0_28px_80px_rgba(15,23,42,0.28)] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center gap-4 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner">
                    <EquipmentThumbnail
                      src={isDetailEditMode ? detailDraft.image : activeEquipment.image}
                      category={isDetailEditMode ? detailDraft.category : activeEquipment.category}
                      name={isDetailEditMode ? detailDraft.name : activeEquipment.name}
                    />
                  </div>
                  <div className="min-w-0">
                    {isDetailEditMode ? (
                      <input value={detailDraft.name} onChange={event => setDetailDraft(draft => ({ ...draft, name: event.target.value }))} className="h-8 w-full min-w-[320px] rounded-xl border border-blue-200 bg-white px-3 text-base font-bold text-slate-900 outline-none focus:border-blue-400" />
                    ) : (
                      <h2 className="truncate text-lg font-bold text-slate-900">{activeEquipment.name}</h2>
                    )}
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-[11px] text-slate-500">{activeEquipment.id}</span>
                      <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600">{isDetailEditMode ? detailDraft.category : activeEquipment.category}</span>
                      <span className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{isDetailEditMode ? detailDraft.availability : activeEquipment.availability}</span>
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isDetailEditMode ? (
                    <>
                      <button onClick={() => { setDetailEditMode(false); resetDetailDraft(activeEquipment); }} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50">Cancel</button>
                      <button onClick={saveEquipmentDraft} className="flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700"><Check className="h-3.5 w-3.5" /> Save</button>
                    </>
                  ) : (
                    <button onClick={() => openEquipmentDetail(activeEquipment, true)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50"><Edit2 className="h-3.5 w-3.5" /> Edit</button>
                  )}
                  <button onClick={() => { setDetailModalOpen(false); setDetailEditMode(false); }} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-600"><X className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-50/40 p-4">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="space-y-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      <section className="rounded-xl border border-blue-100 bg-blue-50/70 p-3">
                        <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-800">Utilization</span><span className="text-lg font-black text-slate-950">{signals.utilizationScore}%</span></div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-blue-600" style={{ width: `${signals.utilizationScore}%` }} /></div>
                        <p className="mt-1.5 text-[11px] font-medium text-blue-700">{signals.idleHours} idle hrs/week</p>
                      </section>
                      <section className="rounded-xl border border-amber-100 bg-amber-50/70 p-3">
                        <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800">Demand</span><span className="text-lg font-black text-slate-950">{signals.demandScore}%</span></div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-amber-500" style={{ width: `${signals.demandScore}%` }} /></div>
                        <p className="mt-1.5 text-[11px] font-medium text-amber-700">{signals.dispatchRefs} dispatch refs</p>
                      </section>
                      <section className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                        <div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-800">Fulfillment</span><span className="text-lg font-black text-slate-950">{signals.readinessScore}%</span></div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-emerald-600" style={{ width: `${signals.readinessScore}%` }} /></div>
                        <p className="mt-1.5 text-[11px] font-medium text-emerald-700">Risk: {signals.maintenanceRisk}</p>
                      </section>
                    </div>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Description</h3>
                      {isDetailEditMode ? (
                        <textarea value={detailDraft.description} onChange={event => setDetailDraft(draft => ({ ...draft, description: event.target.value }))} rows={3} className="w-full resize-none rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-400" />
                      ) : (
                        <p className="text-sm leading-relaxed text-slate-600">{activeEquipment.description}</p>
                      )}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Specifications & Properties</h3>
                        {isDetailEditMode && <button onClick={addSpecRow} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100"><Plus className="h-3.5 w-3.5" /> Add property</button>}
                      </div>
                      {isDetailEditMode ? (
                        <div className="space-y-2">
                          {detailSpecRows.map((row, index) => (
                            <div key={index} className="grid gap-2 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)_32px]">
                              <input value={row.key} onChange={event => updateSpecRow(index, 'key', event.target.value)} placeholder="Property name" className="h-9 rounded-xl border border-blue-100 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400" />
                              <input value={row.value} onChange={event => updateSpecRow(index, 'value', event.target.value)} placeholder="Value" className="h-9 rounded-xl border border-blue-100 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400" />
                              <button onClick={() => removeSpecRow(index)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 hover:border-red-100 hover:bg-red-50 hover:text-red-600" title="Remove property"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                          ))}
                          {detailSpecRows.length === 0 && <button onClick={addSpecRow} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-blue-200 bg-blue-50/40 text-xs font-bold text-blue-700"><Plus className="h-4 w-4" /> Add first property</button>}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-x-5 gap-y-3">
                          {Object.entries(activeEquipment.specs).map(([key, value], index) => (
                            <div key={index} className="border-b border-slate-100 pb-1.5">
                              <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">{key}</p>
                              <p className="text-xs font-semibold text-slate-800">{value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">Professional Details</h3>
                      <div className="grid gap-3 md:grid-cols-4">
                        <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Inspection score</p><p className="mt-0.5 text-xs font-bold text-slate-800">{signals.inspectionScore}% compliant</p></div>
                        <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Certification</p><p className="mt-0.5 text-xs font-bold text-slate-800">{signals.certDays} days left</p></div>
                        <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Fleet demand</p><p className="mt-0.5 text-xs font-bold text-slate-800">+{signals.weeklyDemand}% weekly</p></div>
                        <div><p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Fuel variance</p><p className={`mt-0.5 text-xs font-bold ${signals.fuelVariance <= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>{signals.fuelVariance > 0 ? '+' : ''}{signals.fuelVariance.toFixed(1)}%</p></div>
                      </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-900">Features & Tags</h3>
                      {isDetailEditMode ? (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {detailFeatureRows.map((feature, index) => (
                              <span key={`${feature}-${index}`} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                                {feature}
                                <button onClick={() => removeFeatureRow(index)} className="rounded-full text-emerald-500 hover:text-red-600" title="Remove tag"><X className="h-3 w-3" /></button>
                              </span>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <input value={newFeatureDraft} onChange={event => setNewFeatureDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addFeatureRow(); } }} placeholder="Add feature or tag" className="h-9 min-w-0 flex-1 rounded-xl border border-blue-100 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400" />
                            <button onClick={addFeatureRow} className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"><Plus className="h-3.5 w-3.5" /> Add</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {activeEquipment.features.map((feature, index) => <span key={index} className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{feature}</span>)}
                        </div>
                      )}
                    </section>
                  </div>

                  <div className="space-y-3">
                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">Equipment Data</h3>
                      <div className="space-y-3">
                        {[
                          ['Category', 'category'],
                          ['Subcategory', 'subcategory'],
                          ['Capacity', 'capacity'],
                          ['Manufacturer', 'manufacturer'],
                          ['Model', 'model'],
                        ].map(([label, field]) => (
                          <div key={field} className="flex items-center justify-between gap-3">
                            <span className="text-xs font-medium text-slate-500">{label}</span>
                            {isDetailEditMode ? (
                              <input
                                list={field === 'category' ? 'equipment-category-options' : field === 'manufacturer' ? 'equipment-manufacturer-options' : undefined}
                                value={detailDraft[field as keyof typeof detailDraft] as string}
                                onChange={event => setDetailDraft(draft => ({ ...draft, [field]: event.target.value }))}
                                className="h-8 w-36 rounded-lg border border-blue-200 px-2 text-right text-sm font-semibold outline-none focus:border-blue-400"
                              />
                            ) : (
                              <span className="text-right text-sm font-semibold text-slate-700">{activeEquipment[field as keyof EquipmentItem] as string}</span>
                            )}
                          </div>
                        ))}
                        <datalist id="equipment-category-options">{categoryList.filter(category => category !== 'All').map(category => <option key={category} value={category} />)}</datalist>
                        <datalist id="equipment-manufacturer-options">{manufacturerList.map(manufacturer => <option key={manufacturer} value={manufacturer} />)}</datalist>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-slate-500">Power Type</span>
                          {isDetailEditMode ? (
                            <CatalogSelect value={detailDraft.powerType} onChange={event => setDetailDraft(draft => ({ ...draft, powerType: event.target.value }))} containerClassName="w-36">{POWER_TYPES.map(type => <option key={type}>{type}</option>)}</CatalogSelect>
                          ) : (
                            <span className="text-sm font-semibold text-slate-700">{activeEquipment.powerType}</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-medium text-slate-500">Daily Rate</span>
                          {isDetailEditMode ? <input value={detailDraft.dailyRate} onChange={event => setDetailDraft(draft => ({ ...draft, dailyRate: event.target.value }))} className="h-8 w-28 rounded-lg border border-blue-200 px-2 text-right text-sm font-bold outline-none focus:border-blue-400" /> : <span className="text-base font-bold text-slate-900">{formatRate(activeEquipment.dailyRate)}</span>}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="mb-1 block text-xs font-medium text-slate-500">Fleet</span>
                            {isDetailEditMode ? <input value={detailDraft.fleetSize} onChange={event => setDetailDraft(draft => ({ ...draft, fleetSize: event.target.value }))} className="h-8 w-full rounded-lg border border-blue-200 px-2 text-sm font-semibold outline-none focus:border-blue-400" /> : <p className="text-sm font-bold text-slate-800">{activeEquipment.fleetSize} units</p>}
                          </div>
                          <div>
                            <span className="mb-1 block text-xs font-medium text-slate-500">Active</span>
                            {isDetailEditMode ? <input value={detailDraft.activeProjects} onChange={event => setDetailDraft(draft => ({ ...draft, activeProjects: event.target.value }))} className="h-8 w-full rounded-lg border border-blue-200 px-2 text-sm font-semibold outline-none focus:border-blue-400" /> : <p className="text-sm font-bold text-slate-800">{activeEquipment.activeProjects} projects</p>}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
                          <div>
                            <span className="mb-1 block text-xs font-medium text-slate-500">Status</span>
                            {isDetailEditMode ? <CatalogSelect value={detailDraft.status} onChange={event => setDetailDraft(draft => ({ ...draft, status: event.target.value as EquipmentStatus }))} containerClassName="w-full">{EQUIPMENT_STATUS.map(status => <option key={status}>{status}</option>)}</CatalogSelect> : <span className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${statusBadgeClass(activeEquipment.status)}`}>{activeEquipment.status}</span>}
                          </div>
                          <div>
                            <span className="mb-1 block text-xs font-medium text-slate-500">Availability</span>
                            {isDetailEditMode ? <CatalogSelect value={detailDraft.availability} onChange={event => setDetailDraft(draft => ({ ...draft, availability: event.target.value as EquipmentAvailability }))} containerClassName="w-full">{EQUIPMENT_AVAILABILITY.map(status => <option key={status}>{status}</option>)}</CatalogSelect> : <p className="text-sm font-bold text-slate-800">{activeEquipment.availability}</p>}
                          </div>
                        </div>
                        {isDetailEditMode && (
                          <div>
                            <span className="mb-2 block text-xs font-medium text-slate-500">Image URL</span>
                            <input value={detailDraft.image} onChange={event => setDetailDraft(draft => ({ ...draft, image: event.target.value }))} placeholder="https://..." className="h-8 w-full rounded-lg border border-blue-200 px-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-400" />
                          </div>
                        )}
                      </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Fulfillment Request</h3>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${signals.maintenanceRisk === 'Low' ? 'bg-emerald-50 text-emerald-700' : signals.maintenanceRisk === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{signals.maintenanceRisk} risk</span>
                      </div>
                      <div className="space-y-2.5">
                        <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Quantity</label><input type="number" min={1} value={deploymentQty} onChange={event => setDeploymentQty(Math.max(1, Number(event.target.value)))} className="h-8 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-blue-400" /></div>
                        <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Deployment package</label><CatalogSelect value={deploymentPackage} onChange={event => setDeploymentPackage(event.target.value)} containerClassName="w-full">{DEPLOYMENT_PACKAGES.map(pkg => <option key={pkg}>{pkg}</option>)}</CatalogSelect></div>
                        <div><label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Needed by</label><input type="date" value={deploymentDate} onChange={event => setDeploymentDate(event.target.value)} className="h-8 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none focus:border-blue-400" /></div>
                        <button onClick={() => createDeploymentRequest(activeEquipment)} className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700">Create Request</button>
                      </div>
                    </section>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-900">Detail Actions</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => toggleDetailCollection(activeEquipment)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${isInCollection ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{isInCollection ? 'Remove Collection' : 'Add Collection'}</button>
                        <button onClick={() => addDetailEquipmentToCompare(activeEquipment)} className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${isInCompare ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{isInCompare ? 'In Compare' : 'Compare'}</button>
                        <button onClick={() => copyEquipmentCode(activeEquipment.id)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Copy Code</button>
                        <button onClick={() => shareEquipmentDetail(activeEquipment)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Share</button>
                        <button onClick={() => { setApproveModalOpen(true); }} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100">Approve</button>
                        <button onClick={() => { setDeleteModalOpen(true); }} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100">Delete</button>
                        <button onClick={() => downloadEquipmentSpec(activeEquipment)} className="col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Download Spec Sheet</button>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {isCompareModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)] animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5">
              <div><h2 className="flex items-center gap-2 text-xl font-bold text-slate-900"><Scale className="h-5 w-5 text-blue-600" /> Equipment Comparison</h2><p className="mt-1 text-xs text-slate-500">Comparing {selectedEquipment.length} selected assets</p></div>
              <button onClick={() => setCompareModalOpen(false)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <table className="w-full min-w-[800px] border-collapse text-left">
                <thead><tr><th className="w-48 border-b border-r border-slate-200 bg-slate-50 p-4 font-bold text-slate-700">Property</th>{selectedEquipment.map(equipment => <th key={equipment.id} className="min-w-[240px] border-b border-slate-200 bg-white p-4 align-top"><div className="mb-3 h-20 w-full overflow-hidden rounded-lg bg-slate-100"><EquipmentThumbnail src={equipment.image} category={equipment.category} name={equipment.name} /></div><p className="font-bold text-slate-900">{equipment.name}</p><p className="text-xs text-slate-500">{equipment.id}</p></th>)}</tr></thead>
                <tbody className="text-sm">
                  {['category', 'capacity', 'manufacturer', 'model', 'dailyRate', 'availability', 'fleetSize'].map(property => (
                    <tr key={property} className="border-b border-slate-100">
                      <td className="border-r border-slate-200 bg-slate-50 p-4 font-semibold capitalize text-slate-600">{property.replace(/([A-Z])/g, ' $1')}</td>
                      {selectedEquipment.map(equipment => <td key={equipment.id} className="p-4 text-slate-700">{property === 'dailyRate' ? formatRate(equipment.dailyRate) : String(equipment[property as keyof EquipmentItem])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {isAddEquipmentOpen && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h3 className="text-base font-bold text-slate-950">Add equipment</h3>
                <p className="mt-0.5 text-xs text-slate-500">Create a new plant, machinery, or tool catalog entry.</p>
              </div>
              <button onClick={() => setAddEquipmentOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Equipment name</label>
                <input className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-blue-400" placeholder="e.g. Tower Crane 12 Ton" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Category</label>
                <CatalogSelect containerClassName="w-full">{categoryList.filter(category => category !== 'All').map(category => <option key={category}>{category}</option>)}</CatalogSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Power type</label>
                <CatalogSelect containerClassName="w-full">{POWER_TYPES.map(type => <option key={type}>{type}</option>)}</CatalogSelect>
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Manufacturer</label>
                <input className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-blue-400" placeholder="OEM or vendor" />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Daily rate</label>
                <input className="h-9 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium outline-none focus:border-blue-400" placeholder="$0/day" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Description</label>
                <textarea rows={3} className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium outline-none focus:border-blue-400" placeholder="Equipment capacity, application, deployment notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button onClick={() => setAddEquipmentOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { toast.success('Equipment draft added to catalog.'); setAddEquipmentOpen(false); }} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/15 hover:bg-blue-700">Save equipment</button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-20 bg-white px-1 py-1">
        <div className="flex min-h-10 flex-wrap items-center gap-2">
          <CatalogProjectPicker selectedProject={selectedProject} onProjectChange={setSelectedProject} />
          <span className="hidden h-5 w-px bg-slate-200 lg:block" />
          <span className="mr-1 text-sm font-semibold text-slate-950">Equipment</span>

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
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            {activeView === 'library' && (
              <>
                <div className="relative">
                  <button
                    className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                      activeFilterCount > 0 ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                    aria-label="Filters active"
                  >
                    <Filter className="h-3.5 w-3.5" />
                    {activeFilterCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">{activeFilterCount}</span>}
                  </button>
                </div>
                <CatalogSelect value={filterCategory} onChange={event => setFilterCategory(event.target.value)} containerClassName="hidden w-32 xl:inline-flex" className="!h-8 !min-w-0 !py-1">
                  {categoryList.map(category => <option key={category}>{category}</option>)}
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
            <button onClick={() => setAddEquipmentOpen(true)} className="flex h-8 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white shadow-sm shadow-blue-600/15 transition hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              Add Equipment
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10">
        {activeView === 'library' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <CatalogSelect value={filterCategory} onChange={event => setFilterCategory(event.target.value)}>{categoryList.map(category => <option key={category}>{category}</option>)}</CatalogSelect>
              <CatalogSelect value={filterStatus} onChange={event => setFilterStatus(event.target.value)}><option>All</option>{EQUIPMENT_STATUS.map(status => <option key={status}>{status}</option>)}</CatalogSelect>
              <CatalogSelect value={filterAvailability} onChange={event => setFilterAvailability(event.target.value)}><option>All</option>{EQUIPMENT_AVAILABILITY.map(status => <option key={status}>{status}</option>)}</CatalogSelect>
              <CatalogSelect value={filterPower} onChange={event => setFilterPower(event.target.value)}><option>All</option>{POWER_TYPES.map(type => <option key={type}>{type}</option>)}</CatalogSelect>
              <button onClick={clearFilters} className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"><Filter className="h-3.5 w-3.5" /> Clear</button>
              <button onClick={() => selectedEquipmentIds.size ? setCompareModalOpen(true) : toast.info('Select equipment to compare.')} className="ml-auto flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition hover:bg-slate-50"><Scale className="h-3.5 w-3.5" /> Compare ({selectedEquipmentIds.size})</button>
            </div>

            {selectedEquipment.length > 0 && (
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3 shadow-sm">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">{selectedEquipment.length}</span>
                      <h3 className="text-sm font-bold text-slate-950">Selected equipment</h3>
                    </div>
                    <div className="mt-2 flex max-w-full flex-wrap gap-2">
                      {selectedEquipment.slice(0, 6).map((equipment) => (
                        <button key={`selected-${equipment.id}`} onClick={() => openEquipmentDetail(equipment)} className="inline-flex max-w-[240px] items-center gap-2 rounded-xl border border-blue-100 bg-white px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700">
                          <span className="truncate">{equipment.name}</span>
                          <X className="h-3.5 w-3.5 shrink-0 text-slate-400 hover:text-red-600" onClick={(event) => { event.stopPropagation(); toggleSelection(equipment.id); }} />
                        </button>
                      ))}
                      {selectedEquipment.length > 6 && <span className="rounded-xl bg-white px-2.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm">+{selectedEquipment.length - 6} more</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button onClick={() => setCompareModalOpen(true)} className="h-8 rounded-xl border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 hover:bg-blue-50">Compare</button>
                    <button onClick={addToCollection} className="h-8 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700">Save to Collection</button>
                    <button onClick={() => setSelectedEquipmentIds(new Set())} className="h-8 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">Clear</button>
                  </div>
                </div>
              </div>
            )}

            {filteredEquipment.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-slate-100 bg-slate-50">
                  <Search className="h-8 w-8 text-slate-300" />
                </div>
                <h3 className="mb-1 text-lg font-bold text-slate-900">No equipment found</h3>
                <p className="text-sm text-slate-500">Try adjusting your filters or search query.</p>
                <button onClick={clearFilters} className="mt-4 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100">Clear all filters</button>
              </div>
            ) : viewMode === 'list' ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-950/[0.03]">
                <div className="flex-1 overflow-auto">
                  <table className="w-full border-collapse text-left whitespace-nowrap">
                    <thead className="sticky top-0 z-10 border-b border-slate-100 bg-slate-50/80">
                      <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        <th className="w-12 px-4 py-3 text-center"><input type="checkbox" checked={currentPageFullySelected} onChange={toggleAll} className="h-4 w-4 cursor-pointer rounded accent-blue-600" /></th>
                        <th className="w-20 px-4 py-3">Image</th>
                        <th className="px-4 py-3">Equipment Details</th>
                        <th className="px-4 py-3">Category / Capacity</th>
                        <th className="px-4 py-3">Mfr & Model</th>
                        <th className="px-4 py-3 text-right">Daily Rate</th>
                        <th className="px-4 py-3 text-right">Utilization %</th>
                        <th className="px-4 py-3 text-right">Demand %</th>
                        <th className="px-4 py-3 text-center">Availability</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {paginatedEquipment.map((equipment) => {
                        const isSelected = selectedEquipmentIds.has(equipment.id);
                        const signals = getEquipmentSignals(equipment);
                        return (
                          <tr key={equipment.id} className={`group border-b border-slate-100 transition-colors last:border-0 ${isSelected ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'}`}>
                            <td className="px-4 py-3 text-center"><input type="checkbox" checked={isSelected} onChange={() => toggleSelection(equipment.id)} className="h-4 w-4 cursor-pointer rounded accent-blue-600" /></td>
                            <td className="px-4 py-3">
                              <div className="h-12 w-12 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-sm" onClick={() => openEquipmentDetail(equipment)}>
                                <EquipmentThumbnail src={equipment.image} category={equipment.category} name={equipment.name} className="transition-transform duration-300 group-hover:scale-110" />
                              </div>
                            </td>
                            <td className="cursor-pointer px-4 py-3" onClick={() => openEquipmentDetail(equipment)}>
                              <p className="font-bold text-slate-900 transition-colors group-hover:text-blue-700">{equipment.name}</p>
                              <p className="mt-0.5 font-mono text-[11px] text-slate-400">{equipment.id}</p>
                            </td>
                            <td className="px-4 py-3"><CategoryBadge category={equipment.category} /><p className="mt-1 text-[11px] text-slate-500">{equipment.capacity}</p></td>
                            <td className="px-4 py-3"><p className="text-xs font-bold text-slate-700">{equipment.manufacturer}</p><p className="mt-0.5 text-[11px] text-slate-500">{equipment.model}</p></td>
                            <td className="px-4 py-3 text-right"><p className="font-bold text-slate-900">{formatRate(equipment.dailyRate)}</p><p className="mt-0.5 text-[10px] uppercase text-slate-400">per day</p></td>
                            <td className="px-4 py-3 text-right"><SignalCell value={signals.utilizationScore} /></td>
                            <td className="px-4 py-3 text-right"><SignalCell value={signals.demandScore} /></td>
                            <td className="px-4 py-3 text-center"><span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${equipment.availability === 'Available' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : equipment.availability === 'Service Due' ? 'border-amber-100 bg-amber-50 text-amber-700' : 'border-purple-100 bg-purple-50 text-purple-700'}`}>{equipment.availability}</span></td>
                            <td className="px-4 py-3 text-right">
                              <div className="relative flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <button onClick={() => openEquipmentDetail(equipment)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><Eye className="h-4 w-4" /></button>
                                <button onClick={() => openEquipmentDetail(equipment, true)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><Edit2 className="h-4 w-4" /></button>
                                <button onClick={() => setOpenActionMenu(openActionMenu === equipment.id ? null : equipment.id)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><MoreVertical className="h-4 w-4" /></button>
                                {openActionMenu === equipment.id && (
                                  <div className="absolute right-0 top-8 z-30 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl shadow-slate-950/10">
                                    <button onClick={() => openEquipmentDetail(equipment)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Eye className="h-3.5 w-3.5" /> View details</button>
                                    <button onClick={() => addSingleToCollection(equipment)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><ShoppingCart className="h-3.5 w-3.5" /> Save collection</button>
                                    <button onClick={() => addDetailEquipmentToCompare(equipment)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Scale className="h-3.5 w-3.5" /> Toggle compare</button>
                                    <button onClick={() => copyEquipmentCode(equipment.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Copy className="h-3.5 w-3.5" /> Copy code</button>
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
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))' }}>
                {paginatedEquipment.map((equipment) => {
                  const isSelected = selectedEquipmentIds.has(equipment.id);
                  return (
                    <div key={equipment.id} className={`group relative rounded-xl border bg-white shadow-sm transition-all hover:shadow-md ${isSelected ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'}`}>
                      <div className="relative h-20 overflow-hidden rounded-t-xl bg-slate-100">
                        <EquipmentThumbnail src={equipment.image} category={equipment.category} name={equipment.name} className="transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute left-2 top-2"><input type="checkbox" checked={isSelected} onChange={() => toggleSelection(equipment.id)} className="h-4 w-4 cursor-pointer rounded border-white accent-blue-600 shadow-sm" /></div>
                        <div className="absolute right-2 top-2"><span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm backdrop-blur-md ${equipment.availability === 'Available' ? 'border-emerald-200 bg-emerald-50/90 text-emerald-700' : 'border-amber-200 bg-amber-50/90 text-amber-700'}`}>{equipment.availability === 'Available' ? 'Available' : equipment.availability}</span></div>
                      </div>
                      <div className="p-2.5">
                        <div className="mb-2 cursor-pointer" onClick={() => openEquipmentDetail(equipment)}>
                          <p className="mb-0.5 truncate font-mono text-[9px] text-slate-400">{equipment.id}</p>
                          <h3 className="truncate text-xs font-bold leading-tight text-slate-900 transition-colors group-hover:text-blue-600">{equipment.name}</h3>
                        </div>
                        <div className="flex max-h-6 flex-wrap gap-1 overflow-hidden">
                          <CategoryBadge category={equipment.category} />
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-blue-700">{equipment.powerType}</span>
                        </div>
                        <div className="mt-1.5 flex items-end justify-between border-t border-slate-100 pt-1.5">
                          <div><p className="text-sm font-black text-slate-900">{formatRate(equipment.dailyRate)}</p><p className="truncate text-[9px] uppercase text-slate-400">/{equipment.capacity}</p></div>
                          <div className="relative flex items-center gap-1">
                            <button onClick={(event) => { event.stopPropagation(); openEquipmentDetail(equipment); }} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"><Eye className="h-3.5 w-3.5" /></button>
                            <button onClick={(event) => { event.stopPropagation(); setOpenActionMenu(openActionMenu === equipment.id ? null : equipment.id); }} className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"><MoreVertical className="h-3.5 w-3.5" /></button>
                            {openActionMenu === equipment.id && (
                              <div onClick={(event) => event.stopPropagation()} className="absolute right-0 top-8 z-50 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-left shadow-xl shadow-slate-950/15">
                                <button onClick={() => openEquipmentDetail(equipment)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Eye className="h-3.5 w-3.5" /> View details</button>
                                <button onClick={() => addSingleToCollection(equipment)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><ShoppingCart className="h-3.5 w-3.5" /> Save collection</button>
                                <button onClick={() => addDetailEquipmentToCompare(equipment)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Scale className="h-3.5 w-3.5" /> Toggle compare</button>
                                <button onClick={() => copyEquipmentCode(equipment.id)} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-700"><Copy className="h-3.5 w-3.5" /> Copy code</button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">
              <span>Showing {filteredEquipment.length === 0 ? 0 : pageStartIndex + 1}-{pageEndIndex} of {filteredEquipment.length.toLocaleString()} equipment assets</span>
              <span>{collection.length} in collection</span>
            </div>
          </div>
        )}

        {activeView === 'collection' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-4 flex items-center justify-between">
              <div><h2 className="text-xl font-bold text-slate-900">My Saved Collections</h2><p className="text-sm text-slate-500">Equipment saved for allocation, rental planning, or vendor sharing.</p></div>
              <button onClick={shareCollection} disabled={collection.length === 0} className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50"><Share2 className="h-4 w-4" /> Share Collection</button>
            </div>
            {collection.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-blue-100 bg-blue-50"><ShoppingCart className="h-8 w-8 text-blue-300" /></div>
                <h3 className="mb-1 text-lg font-bold text-slate-900">Your collection is empty</h3>
                <p className="mb-6 text-sm text-slate-500">Go to the Equipment Library and select items to build a collection.</p>
                <button onClick={() => setActiveView('library')} className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">Browse Library</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {collection.map((equipment) => (
                  <div key={equipment.id} className="group relative flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100"><EquipmentThumbnail src={equipment.image} category={equipment.category} name={equipment.name} /></div>
                    <div><h4 className="mb-1 line-clamp-2 text-sm font-bold leading-tight text-slate-900">{equipment.name}</h4><p className="text-xs font-semibold text-slate-500">{equipment.manufacturer}</p><p className="mt-1 text-xs font-bold text-blue-600">{formatRate(equipment.dailyRate)}</p></div>
                    <button onClick={() => setCollection(prev => prev.filter(item => item.id !== equipment.id))} className="absolute right-2 top-2 rounded-md border border-slate-200 bg-white p-1.5 text-red-500 opacity-0 shadow-sm transition-opacity hover:bg-red-50 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeView === 'approval' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="text-xl font-bold text-slate-900">Approval Queue</h2><p className="text-sm text-slate-500">Equipment awaiting fleet approval, maintenance clearance, or catalog verification.</p></div>
                <button onClick={() => toast.info('Approval queue refreshed.')} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-100"><CheckSquare className="h-4 w-4" /> Refresh Queue</button>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full border-collapse text-left">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr><th className="px-4 py-3">Equipment</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Availability</th><th className="px-4 py-3">Submitted By</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="text-sm">
                  {equipmentCatalog.filter(equipment => equipment.status !== 'Approved').slice(0, 12).map((equipment, index) => (
                    <tr key={`approval-${equipment.id}`} className="border-t border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3"><button onClick={() => openEquipmentDetail(equipment)} className="text-left"><p className="font-bold text-slate-900">{equipment.name}</p><p className="font-mono text-[11px] text-slate-400">{equipment.id}</p></button></td>
                      <td className="px-4 py-3"><CategoryBadge category={equipment.category} /></td>
                      <td className="px-4 py-3 text-slate-600">{equipment.availability}</td>
                      <td className="px-4 py-3 text-slate-600">{index % 2 === 0 ? 'Fleet Manager' : 'Procurement Team'}</td>
                      <td className="px-4 py-3"><span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusBadgeClass(equipment.status)}`}>{equipment.status}</span></td>
                      <td className="px-4 py-3 text-right"><button onClick={() => { setActiveEquipment(equipment); setApproveModalOpen(true); }} className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700">Approve</button></td>
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
