import React, { useMemo, useState } from 'react';
import {
  Archive, ArrowLeft, Check, CheckCircle2, ChevronDown, Clock, Copy, Download,
  Edit2, Eye, FileCheck2, FileText, Filter, Grid3x3, History, Layers, Link2, List,
  MoreVertical, Plus, Search, ShieldCheck, UploadCloud, UserCheck, Workflow, X
} from 'lucide-react';
import { toast } from 'sonner';

type StandardStatus = 'Active' | 'Draft' | 'Pending Review' | 'Approved' | 'Archived' | 'Superseded' | 'Needs Update';
type StandardCategory =
  | 'BIM Standards'
  | 'Drawing Standards'
  | 'Templates'
  | 'QA/QC'
  | 'Safety'
  | 'Codes'
  | 'Vendor Compliance'
  | 'Material Specs'
  | 'Approval Workflows';

type StandardItem = {
  id: string;
  title: string;
  category: StandardCategory;
  type: string;
  discipline: string;
  owner: string;
  version: string;
  status: StandardStatus;
  usedIn: number;
  updated: string;
  fileType: string;
  description: string;
  approvalRequired: boolean;
  projectStages: string[];
  usageNotes: string[];
  requirements: string[];
  linkedProjects: string[];
  linkedFiles: string[];
  exampleFormat?: string;
  example?: string;
  archivedNote?: string;
};

const categoryDescriptions: Record<StandardCategory, string> = {
  'BIM Standards': 'Rules and requirements for BIM model creation, coordination, naming, LOD, clash detection, and model handover.',
  'Drawing Standards': 'Approved rules for drawing sheets, title blocks, numbering, revisions, issue status, and drawing submissions.',
  Templates: 'Reusable templates for project communication, site reporting, inspections, approvals, and documentation workflows.',
  'QA/QC': 'Inspection checklists and quality control procedures for site execution activities.',
  Safety: 'Standard safety documents, permits, risk assessments, and HSE compliance templates.',
  Codes: 'Linked construction codes, authority norms, and reference documents used for compliance.',
  'Vendor Compliance': 'Mandatory document requirements and compliance rules for vendors, suppliers, contractors, and service providers.',
  'Material Specs': 'Approved format and reference specification for construction materials.',
  'Approval Workflows': 'Standard approval stages, responsible roles, and status rules for documents, drawings, models, materials, and vendors.',
};

const filterPills = [
  'All',
  'BIM Standards',
  'Drawing Standards',
  'Templates',
  'QA/QC',
  'Safety',
  'Codes',
  'Vendor Compliance',
  'Material Specs',
  'Approval Workflows',
  'Archived',
] as const;

const createCategoryOptions = [
  'BIM Standard',
  'Drawing Standard',
  'Document Template',
  'QA/QC Checklist',
  'Safety Standard',
  'Code Reference',
  'Vendor Compliance',
  'Material Specification',
  'Approval Workflow',
];

const disciplineOptions = [
  'Architecture',
  'Structure',
  'Civil',
  'MEP',
  'Electrical',
  'Plumbing',
  'Firefighting',
  'HVAC',
  'Procurement',
  'QA/QC',
  'HSE',
  'Documentation',
  'Multi-discipline',
];

const projectStageOptions = [
  'Concept',
  'Design',
  'Pre-construction',
  'Construction',
  'Testing & Commissioning',
  'Handover',
  'As-built',
];

const categoryAliases: Record<string, StandardCategory> = {
  'BIM Standard': 'BIM Standards',
  'Drawing Standard': 'Drawing Standards',
  'Document Template': 'Templates',
  'QA/QC Checklist': 'QA/QC',
  'Safety Standard': 'Safety',
  'Code Reference': 'Codes',
  'Vendor Compliance': 'Vendor Compliance',
  'Material Specification': 'Material Specs',
  'Approval Workflow': 'Approval Workflows',
};

const statusTone: Record<StandardStatus, string> = {
  Active: 'border-emerald-100 bg-emerald-50 text-emerald-700',
  Draft: 'border-slate-200 bg-slate-50 text-slate-600',
  'Pending Review': 'border-amber-100 bg-amber-50 text-amber-700',
  Approved: 'border-blue-100 bg-blue-50 text-blue-700',
  Archived: 'border-zinc-200 bg-zinc-50 text-zinc-500',
  Superseded: 'border-purple-100 bg-purple-50 text-purple-700',
  'Needs Update': 'border-red-100 bg-red-50 text-red-700',
};

const categoryTone: Record<StandardCategory, string> = {
  'BIM Standards': 'border-indigo-100 bg-indigo-50 text-indigo-700',
  'Drawing Standards': 'border-blue-100 bg-blue-50 text-blue-700',
  Templates: 'border-sky-100 bg-sky-50 text-sky-700',
  'QA/QC': 'border-emerald-100 bg-emerald-50 text-emerald-700',
  Safety: 'border-orange-100 bg-orange-50 text-orange-700',
  Codes: 'border-violet-100 bg-violet-50 text-violet-700',
  'Vendor Compliance': 'border-amber-100 bg-amber-50 text-amber-700',
  'Material Specs': 'border-stone-100 bg-stone-50 text-stone-700',
  'Approval Workflows': 'border-cyan-100 bg-cyan-50 text-cyan-700',
};

const standardsSeed: StandardItem[] = [
  {
    id: 'STD-BIM-001',
    title: 'BIM Execution Plan Template',
    category: 'BIM Standards',
    type: 'BIM Standard',
    discipline: 'Multi-discipline',
    owner: 'BIM Manager',
    version: 'v2.1',
    status: 'Active',
    usedIn: 18,
    updated: '12 May 2026',
    fileType: 'DOCX',
    description: 'Standard BEP template covering model responsibilities, coordination frequency, naming rules, LOD requirements, and handover expectations.',
    approvalRequired: true,
    projectStages: ['Design', 'Pre-construction', 'Construction', 'Handover'],
    usageNotes: ['Default standard for new projects', 'Required before coordination kickoff', 'Linked with model handover flow'],
    requirements: ['Define project BIM roles', 'Set LOD requirements', 'Define model sharing frequency', 'Define clash resolution process', 'Define model naming rules', 'Define handover deliverables'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower', 'Skyline Residency', 'Hospital Block B'],
    linkedFiles: ['LOD Matrix v1.6', 'Model Naming Convention v1.8', 'Clash Detection Rules v1.3'],
  },
  {
    id: 'STD-BIM-002',
    title: 'LOD Matrix',
    category: 'BIM Standards',
    type: 'BIM Standard',
    discipline: 'Architecture, Structure, MEP',
    owner: 'BIM Lead',
    version: 'v1.6',
    status: 'Active',
    usedIn: 14,
    updated: '09 May 2026',
    fileType: 'XLSX',
    description: 'Defines required Level of Development for each project stage and discipline.',
    approvalRequired: true,
    projectStages: ['Design', 'Construction', 'As-built'],
    usageNotes: ['Used before model package issue', 'Applies to all active work packages'],
    requirements: ['Define LOD per stage', 'Assign discipline responsibility', 'Map model element granularity', 'Control handover deliverables'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower', 'Airport Terminal'],
    linkedFiles: ['BIM Execution Plan Template', 'Model Element Matrix'],
  },
  {
    id: 'STD-BIM-003',
    title: 'Clash Detection Rules',
    category: 'BIM Standards',
    type: 'BIM Coordination',
    discipline: 'MEP / Structure',
    owner: 'Coordination Lead',
    version: 'v1.3',
    status: 'Active',
    usedIn: 11,
    updated: '05 May 2026',
    fileType: 'PDF',
    description: 'Standard clash grouping, tolerance settings, priority levels, and resolution workflow.',
    approvalRequired: true,
    projectStages: ['Design', 'Pre-construction', 'Construction'],
    usageNotes: ['Required before weekly coordination', 'Linked with BIM model approval flow'],
    requirements: ['Set hard and soft clash tolerances', 'Group clashes by zone and system', 'Assign priority levels', 'Track closure evidence'],
    linkedProjects: ['Hospital Block B', 'Metro Commercial Tower', 'Skyline Residency'],
    linkedFiles: ['BIM Model Approval Workflow', 'Coordination Issue Log'],
  },
  {
    id: 'STD-BIM-004',
    title: 'Model Naming Convention',
    category: 'BIM Standards',
    type: 'Naming Rule',
    discipline: 'All',
    owner: 'BIM Manager',
    version: 'v1.8',
    status: 'Active',
    usedIn: 22,
    updated: '18 May 2026',
    fileType: 'PDF',
    description: 'Defines model naming format, discipline codes, zone codes, level codes, and revision tagging.',
    approvalRequired: true,
    projectStages: ['Design', 'Pre-construction', 'Construction', 'As-built'],
    usageNotes: ['Required before model upload', 'Default standard for federated model issue'],
    requirements: ['Use project code', 'Use zone code', 'Use discipline code', 'Use level code', 'Include model type and revision'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower', 'Skyline Residency', 'Hospital Block B'],
    linkedFiles: ['BIM Execution Plan Template', 'Document Numbering Register'],
    exampleFormat: 'PROJECT-ZONE-DISCIPLINE-LEVEL-MODELTYPE-REVISION',
    example: 'ECPL-TWR-A-STR-L05-MDL-R02',
  },
  {
    id: 'STD-DRW-001',
    title: 'Drawing Title Block Standard',
    category: 'Drawing Standards',
    type: 'Drawing Standard',
    discipline: 'All',
    owner: 'Document Controller',
    version: 'v3.0',
    status: 'Active',
    usedIn: 24,
    updated: '14 May 2026',
    fileType: 'DWG / PDF',
    description: 'Approved title block format for project drawings, including project name, drawing number, revision, issue status, scale, and approval signature area.',
    approvalRequired: true,
    projectStages: ['Design', 'Construction', 'As-built'],
    usageNotes: ['Required before drawing submission', 'Applies to consultant and contractor drawings'],
    requirements: ['Project name', 'Drawing number', 'Revision', 'Issue status', 'Scale', 'Approval signature area'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower', 'Hospital Block B'],
    linkedFiles: ['Drawing Numbering Rule', 'Revision Control Standard'],
  },
  {
    id: 'STD-DRW-002',
    title: 'Drawing Numbering Rule',
    category: 'Drawing Standards',
    type: 'Naming Standard',
    discipline: 'All',
    owner: 'Document Controller',
    version: 'v2.4',
    status: 'Active',
    usedIn: 21,
    updated: '10 May 2026',
    fileType: 'PDF',
    description: 'Defines drawing code structure for discipline, building, level, drawing type, and revision.',
    approvalRequired: true,
    projectStages: ['Design', 'Construction', 'As-built'],
    usageNotes: ['Required before drawing upload', 'Controls current and superseded drawings'],
    requirements: ['Project code', 'Building code', 'Level code', 'Discipline code', 'Drawing type', 'Sequence', 'Revision'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower', 'Skyline Residency'],
    linkedFiles: ['Drawing Title Block Standard', 'Revision Control Standard'],
    exampleFormat: 'PROJECT-BUILDING-LEVEL-DISCIPLINE-DRAWINGTYPE-SEQUENCE-REVISION',
    example: 'ECPL-B01-L05-ARC-FP-001-R03',
  },
  {
    id: 'STD-DRW-003',
    title: 'Revision Control Standard',
    category: 'Drawing Standards',
    type: 'Revision Rule',
    discipline: 'All',
    owner: 'Project Controls',
    version: 'v2.2',
    status: 'Active',
    usedIn: 19,
    updated: '08 May 2026',
    fileType: 'PDF',
    description: 'Defines rules for current drawings, superseded drawings, revision history, issue logs, and approval records.',
    approvalRequired: true,
    projectStages: ['Design', 'Construction', 'Handover'],
    usageNotes: ['Used by document control', 'Superseded drawings cannot be issued to site'],
    requirements: ['Maintain revision history', 'Lock superseded drawings', 'Record issue status', 'Track approval records'],
    linkedProjects: ['Emerald Heights', 'Skyline Residency', 'Industrial Warehouse'],
    linkedFiles: ['Drawing Numbering Rule', 'Drawing Approval Workflow'],
  },
  {
    id: 'STD-DRW-004',
    title: 'Drawing Submission Checklist',
    category: 'Drawing Standards',
    type: 'Checklist',
    discipline: 'All',
    owner: 'Document Controller',
    version: 'v1.5',
    status: 'Approved',
    usedIn: 13,
    updated: '04 May 2026',
    fileType: 'XLSX',
    description: 'Checklist to verify required metadata before submitting drawings for approval.',
    approvalRequired: true,
    projectStages: ['Design', 'Construction'],
    usageNotes: ['Required before drawing submission', 'Approved but not set as default'],
    requirements: ['Verify title block', 'Check drawing number', 'Validate revision', 'Confirm approver list'],
    linkedProjects: ['Metro Commercial Tower', 'Hospital Block B'],
    linkedFiles: ['Drawing Approval Workflow', 'Revision Control Standard'],
  },
  {
    id: 'STD-TPL-001',
    title: 'RFI Template',
    category: 'Templates',
    type: 'Template',
    discipline: 'All',
    owner: 'Project Manager',
    version: 'v1.7',
    status: 'Active',
    usedIn: 16,
    updated: '16 May 2026',
    fileType: 'DOCX',
    description: 'Standard Request for Information format with query, reference drawing, impact, priority, response owner, and closure status.',
    approvalRequired: false,
    projectStages: ['Design', 'Construction'],
    usageNotes: ['Default standard for new RFI logs', 'Linked with consultant response flow'],
    requirements: ['Query statement', 'Reference drawing', 'Impact field', 'Priority', 'Response owner', 'Closure status'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower', 'Hospital Block B'],
    linkedFiles: ['RFI Register Template', 'Drawing Numbering Rule'],
  },
  {
    id: 'STD-TPL-002',
    title: 'MOM Template',
    category: 'Templates',
    type: 'Template',
    discipline: 'All',
    owner: 'Project Coordinator',
    version: 'v1.4',
    status: 'Active',
    usedIn: 20,
    updated: '06 May 2026',
    fileType: 'DOCX',
    description: 'Meeting minutes template with attendees, agenda, decisions, action items, responsible person, and due dates.',
    approvalRequired: false,
    projectStages: ['Design', 'Pre-construction', 'Construction'],
    usageNotes: ['Used for weekly coordination meetings', 'Action items sync with planning tracker'],
    requirements: ['Attendees', 'Agenda', 'Decisions', 'Action owner', 'Due date', 'Closure status'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower'],
    linkedFiles: ['Action Item Register', 'Coordination Meeting Template'],
  },
  {
    id: 'STD-TPL-003',
    title: 'DPR Template',
    category: 'Templates',
    type: 'Site Report',
    discipline: 'Site Execution',
    owner: 'Planning Engineer',
    version: 'v2.0',
    status: 'Active',
    usedIn: 17,
    updated: '11 May 2026',
    fileType: 'XLSX',
    description: 'Daily Progress Report format including manpower, machinery, work completed, issues, delays, photos, and next-day plan.',
    approvalRequired: false,
    projectStages: ['Construction'],
    usageNotes: ['Daily site reporting format', 'Linked with productivity and delay logs'],
    requirements: ['Manpower', 'Machinery', 'Work completed', 'Issues', 'Delays', 'Photos', 'Next-day plan'],
    linkedProjects: ['Emerald Heights', 'Industrial Warehouse', 'Hospital Block B'],
    linkedFiles: ['Site Photo Log', 'Productivity Tracker'],
  },
  {
    id: 'STD-TPL-004',
    title: 'NCR Template',
    category: 'Templates',
    type: 'Quality Template',
    discipline: 'QA/QC',
    owner: 'QA Head',
    version: 'v1.9',
    status: 'Active',
    usedIn: 10,
    updated: '03 May 2026',
    fileType: 'DOCX',
    description: 'Non-Conformance Report template with issue description, location, responsible party, corrective action, and closure evidence.',
    approvalRequired: true,
    projectStages: ['Construction', 'Handover'],
    usageNotes: ['Used for QA non-conformance closure', 'Linked with corrective action workflow'],
    requirements: ['Issue description', 'Location', 'Responsible party', 'Corrective action', 'Closure evidence'],
    linkedProjects: ['Hospital Block B', 'Metro Commercial Tower'],
    linkedFiles: ['QA Corrective Action Log'],
  },
  {
    id: 'STD-TPL-005',
    title: 'Transmittal Template',
    category: 'Templates',
    type: 'Document Template',
    discipline: 'Documentation',
    owner: 'Document Controller',
    version: 'v1.6',
    status: 'Active',
    usedIn: 15,
    updated: '13 May 2026',
    fileType: 'DOCX',
    description: 'Standard transmittal sheet for drawing, document, and model submissions.',
    approvalRequired: false,
    projectStages: ['Design', 'Construction', 'Handover'],
    usageNotes: ['Used for formal document submission', 'Required for external issue packages'],
    requirements: ['Document list', 'Revision', 'Issue purpose', 'Recipient', 'Submission date'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower'],
    linkedFiles: ['Document Control Register'],
  },
  {
    id: 'STD-QA-001',
    title: 'Concrete Pour Checklist',
    category: 'QA/QC',
    type: 'QA Checklist',
    discipline: 'Civil',
    owner: 'QA/QC Head',
    version: 'v2.3',
    status: 'Active',
    usedIn: 19,
    updated: '15 May 2026',
    fileType: 'XLSX',
    description: 'Checklist for pre-pour, during-pour, and post-pour quality verification.',
    approvalRequired: true,
    projectStages: ['Construction'],
    usageNotes: ['Required before concrete pour', 'Linked with material approval flow'],
    requirements: ['Formwork checked', 'Reinforcement approved', 'MEP sleeves verified', 'Concrete grade confirmed', 'Slump test completed', 'Cube sample recorded', 'Pour card approved', 'Site photos attached'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower', 'Hospital Block B'],
    linkedFiles: ['Concrete Specification Format', 'Pour Card Register'],
  },
  {
    id: 'STD-QA-002',
    title: 'Blockwork Inspection Checklist',
    category: 'QA/QC',
    type: 'QA Checklist',
    discipline: 'Civil / Finishing',
    owner: 'QA Engineer',
    version: 'v1.5',
    status: 'Active',
    usedIn: 12,
    updated: '07 May 2026',
    fileType: 'XLSX',
    description: 'Checklist for block alignment, plumb, level, curing, opening size, and embedded services.',
    approvalRequired: true,
    projectStages: ['Construction'],
    usageNotes: ['Required before plaster release', 'Applies to masonry work packages'],
    requirements: ['Alignment', 'Plumb', 'Level', 'Curing', 'Opening size', 'Embedded services'],
    linkedProjects: ['Skyline Residency', 'Hospital Block B'],
    linkedFiles: ['Masonry Method Statement'],
  },
  {
    id: 'STD-QA-003',
    title: 'Waterproofing Checklist',
    category: 'QA/QC',
    type: 'QA Checklist',
    discipline: 'Civil / Finishing',
    owner: 'QA Engineer',
    version: 'v1.8',
    status: 'Active',
    usedIn: 9,
    updated: '01 May 2026',
    fileType: 'PDF',
    description: 'Standard inspection checklist for surface preparation, primer, membrane, ponding test, and final approval.',
    approvalRequired: true,
    projectStages: ['Construction'],
    usageNotes: ['Required before tile or screed release', 'Warranty document must be linked'],
    requirements: ['Surface preparation', 'Primer check', 'Membrane check', 'Ponding test', 'Final approval'],
    linkedProjects: ['Emerald Heights', 'Skyline Residency'],
    linkedFiles: ['Waterproofing Material Spec'],
  },
  {
    id: 'STD-QA-004',
    title: 'MEP Installation Checklist',
    category: 'QA/QC',
    type: 'QA Checklist',
    discipline: 'MEP',
    owner: 'MEP QA Lead',
    version: 'v1.6',
    status: 'Pending Review',
    usedIn: 8,
    updated: '17 May 2026',
    fileType: 'XLSX',
    description: 'Checklist for conduit, piping, ducting, supports, clearance, labeling, and testing requirements.',
    approvalRequired: true,
    projectStages: ['Construction', 'Testing & Commissioning'],
    usageNotes: ['Pending BIM Manager review', 'Needs revision before next issue'],
    requirements: ['Conduit check', 'Piping check', 'Duct support', 'Clearance', 'Labeling', 'Testing records'],
    linkedProjects: ['Metro Commercial Tower', 'Hospital Block B'],
    linkedFiles: ['MEP Testing Register'],
  },
  {
    id: 'STD-HSE-001',
    title: 'Work Permit Template',
    category: 'Safety',
    type: 'Safety Template',
    discipline: 'HSE',
    owner: 'Safety Manager',
    version: 'v2.2',
    status: 'Active',
    usedIn: 18,
    updated: '09 May 2026',
    fileType: 'DOCX',
    description: 'Standard work permit template for high-risk site activities.',
    approvalRequired: true,
    projectStages: ['Construction'],
    usageNotes: ['Required before high-risk activity', 'Applies to all active work packages'],
    requirements: ['Hot Work Permit', 'Height Work Permit', 'Excavation Permit', 'Confined Space Permit', 'Electrical Work Permit', 'Lifting Permit'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower', 'Industrial Warehouse'],
    linkedFiles: ['JSA Template', 'Toolbox Talk Format'],
  },
  {
    id: 'STD-HSE-002',
    title: 'JSA Template',
    category: 'Safety',
    type: 'Safety Template',
    discipline: 'HSE',
    owner: 'Safety Manager',
    version: 'v1.9',
    status: 'Active',
    usedIn: 15,
    updated: '06 May 2026',
    fileType: 'XLSX',
    description: 'Job Safety Analysis template with activity steps, hazards, risks, control measures, and responsible person.',
    approvalRequired: true,
    projectStages: ['Construction'],
    usageNotes: ['Required for method statement approval', 'Linked with permit workflow'],
    requirements: ['Activity steps', 'Hazards', 'Risk rating', 'Control measures', 'Responsible person'],
    linkedProjects: ['Hospital Block B', 'Industrial Warehouse'],
    linkedFiles: ['Work Permit Template'],
  },
  {
    id: 'STD-HSE-003',
    title: 'PPE Checklist',
    category: 'Safety',
    type: 'Safety Checklist',
    discipline: 'HSE',
    owner: 'Safety Officer',
    version: 'v1.3',
    status: 'Active',
    usedIn: 14,
    updated: '02 May 2026',
    fileType: 'PDF',
    description: 'Standard PPE compliance checklist for site entry and daily work zones.',
    approvalRequired: false,
    projectStages: ['Construction'],
    usageNotes: ['Daily site entry control', 'Linked with HSE inspection reports'],
    requirements: ['Helmet', 'Safety shoes', 'Vest', 'Gloves', 'Eye protection', 'Harness when required'],
    linkedProjects: ['Emerald Heights', 'Industrial Warehouse'],
    linkedFiles: ['Site Safety Inspection Template'],
  },
  {
    id: 'STD-HSE-004',
    title: 'Toolbox Talk Format',
    category: 'Safety',
    type: 'Safety Template',
    discipline: 'HSE',
    owner: 'Safety Officer',
    version: 'v1.5',
    status: 'Active',
    usedIn: 16,
    updated: '08 May 2026',
    fileType: 'DOCX',
    description: 'Daily toolbox talk template with topic, attendees, safety points, site risks, and signatures.',
    approvalRequired: false,
    projectStages: ['Construction'],
    usageNotes: ['Daily site safety briefing', 'Required for high-risk shifts'],
    requirements: ['Topic', 'Attendees', 'Safety points', 'Site risks', 'Signatures'],
    linkedProjects: ['Metro Commercial Tower', 'Hospital Block B'],
    linkedFiles: ['JSA Template', 'Work Permit Template'],
  },
  {
    id: 'STD-CODE-001',
    title: 'IS 456 Concrete Code Reference',
    category: 'Codes',
    type: 'Code Reference',
    discipline: 'Structure',
    owner: 'Structural Lead',
    version: '2000',
    status: 'Active',
    usedIn: 22,
    updated: '20 Apr 2026',
    fileType: 'Reference Link',
    description: 'Reference entry for plain and reinforced concrete design compliance.',
    approvalRequired: false,
    projectStages: ['Design', 'Construction'],
    usageNotes: ['Linked with concrete specification', 'Used for design and QA reference'],
    requirements: ['Design compliance', 'Concrete grade reference', 'Reinforcement detailing', 'Acceptance criteria'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower', 'Hospital Block B'],
    linkedFiles: ['Concrete Specification Format'],
  },
  {
    id: 'STD-CODE-002',
    title: 'IS 800 Steel Design Reference',
    category: 'Codes',
    type: 'Code Reference',
    discipline: 'Structure',
    owner: 'Structural Lead',
    version: '2007',
    status: 'Active',
    usedIn: 12,
    updated: '19 Apr 2026',
    fileType: 'Reference Link',
    description: 'Reference entry for general steel construction design requirements.',
    approvalRequired: false,
    projectStages: ['Design', 'Construction'],
    usageNotes: ['Used for structural steel packages', 'Linked with vendor fabrication review'],
    requirements: ['Steel design compliance', 'Fabrication reference', 'Connection design', 'Inspection notes'],
    linkedProjects: ['Industrial Warehouse', 'Metro Commercial Tower'],
    linkedFiles: ['TMT Steel Specification'],
  },
  {
    id: 'STD-CODE-003',
    title: 'NBC Reference',
    category: 'Codes',
    type: 'Code Reference',
    discipline: 'Multi-discipline',
    owner: 'Compliance Manager',
    version: '2016',
    status: 'Active',
    usedIn: 18,
    updated: '22 Apr 2026',
    fileType: 'Reference Link',
    description: 'National Building Code reference for building planning, fire safety, accessibility, and services.',
    approvalRequired: false,
    projectStages: ['Concept', 'Design', 'Construction'],
    usageNotes: ['Used for authority compliance', 'Linked with design review checklist'],
    requirements: ['Building planning', 'Fire safety', 'Accessibility', 'Building services'],
    linkedProjects: ['Emerald Heights', 'Hospital Block B'],
    linkedFiles: ['Fire Safety Norms'],
  },
  {
    id: 'STD-CODE-004',
    title: 'Fire Safety Norms',
    category: 'Codes',
    type: 'Code Reference',
    discipline: 'Firefighting / Safety',
    owner: 'Fire Consultant',
    version: 'Latest',
    status: 'Needs Update',
    usedIn: 9,
    updated: '25 Apr 2026',
    fileType: 'PDF / Link',
    description: 'Project-level fire compliance norms and local authority reference documents.',
    approvalRequired: true,
    projectStages: ['Design', 'Testing & Commissioning', 'Handover'],
    usageNotes: ['Needs revision before next issue', 'Local authority addendum pending'],
    requirements: ['Fire access', 'Hydrant coverage', 'Staircase rules', 'Smoke control', 'Authority reference'],
    linkedProjects: ['Hospital Block B', 'Metro Commercial Tower'],
    linkedFiles: ['NBC Reference'],
  },
  {
    id: 'STD-VND-001',
    title: 'Vendor Onboarding Document List',
    category: 'Vendor Compliance',
    type: 'Vendor Compliance',
    discipline: 'Procurement',
    owner: 'Procurement Head',
    version: 'v2.0',
    status: 'Active',
    usedIn: 13,
    updated: '13 May 2026',
    fileType: 'PDF',
    description: 'Required documents for vendor registration and approval.',
    approvalRequired: true,
    projectStages: ['Pre-construction', 'Construction'],
    usageNotes: ['Required before vendor activation', 'Linked with vendor approval flow'],
    requirements: ['Company profile', 'GST certificate', 'PAN card', 'Bank details', 'MSME certificate if applicable', 'Past work experience', 'Client references', 'Product catalogue', 'Test certificates', 'Warranty documents', 'Safety compliance documents'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower'],
    linkedFiles: ['Material Supplier Compliance Checklist'],
  },
  {
    id: 'STD-VND-002',
    title: 'Material Supplier Compliance Checklist',
    category: 'Vendor Compliance',
    type: 'Vendor Checklist',
    discipline: 'Procurement / QA',
    owner: 'Vendor Manager',
    version: 'v1.6',
    status: 'Active',
    usedIn: 11,
    updated: '05 May 2026',
    fileType: 'XLSX',
    description: 'Checklist to verify supplier quality, certifications, delivery capacity, and document submissions.',
    approvalRequired: true,
    projectStages: ['Pre-construction', 'Construction'],
    usageNotes: ['Required for material supplier approval', 'Linked with material approval flow'],
    requirements: ['Quality system', 'Certificates', 'Delivery capacity', 'Document submissions', 'Past performance'],
    linkedProjects: ['Hospital Block B', 'Industrial Warehouse'],
    linkedFiles: ['Vendor Onboarding Document List'],
  },
  {
    id: 'STD-VND-003',
    title: 'Contractor Prequalification Template',
    category: 'Vendor Compliance',
    type: 'Vendor Template',
    discipline: 'Contracts',
    owner: 'Contracts Manager',
    version: 'v1.8',
    status: 'Pending Review',
    usedIn: 7,
    updated: '18 May 2026',
    fileType: 'DOCX',
    description: 'Template to evaluate contractors based on manpower, equipment, experience, safety record, and financial capacity.',
    approvalRequired: true,
    projectStages: ['Pre-construction'],
    usageNotes: ['Pending contracts manager review', 'Required before package award'],
    requirements: ['Manpower', 'Equipment', 'Experience', 'Safety record', 'Financial capacity'],
    linkedProjects: ['Metro Commercial Tower', 'Industrial Warehouse'],
    linkedFiles: ['Vendor Onboarding Document List'],
  },
  {
    id: 'STD-MAT-001',
    title: 'Concrete Specification Format',
    category: 'Material Specs',
    type: 'Material Spec',
    discipline: 'Civil',
    owner: 'Materials Engineer',
    version: 'v2.1',
    status: 'Active',
    usedIn: 15,
    updated: '12 May 2026',
    fileType: 'DOCX',
    description: 'Standard format for concrete grade, mix design, test frequency, acceptance criteria, and supporting documents.',
    approvalRequired: true,
    projectStages: ['Pre-construction', 'Construction'],
    usageNotes: ['Linked with concrete pour checklist', 'Required before material approval'],
    requirements: ['Concrete grade', 'Mix design', 'Test frequency', 'Acceptance criteria', 'Supporting documents'],
    linkedProjects: ['Emerald Heights', 'Hospital Block B'],
    linkedFiles: ['Concrete Pour Checklist', 'IS 456 Concrete Code Reference'],
  },
  {
    id: 'STD-MAT-002',
    title: 'TMT Steel Specification',
    category: 'Material Specs',
    type: 'Material Spec',
    discipline: 'Structure',
    owner: 'Structural Lead',
    version: 'v1.7',
    status: 'Active',
    usedIn: 13,
    updated: '10 May 2026',
    fileType: 'PDF',
    description: 'Standard specification for reinforcement steel grade, certification, testing, storage, and approval process.',
    approvalRequired: true,
    projectStages: ['Pre-construction', 'Construction'],
    usageNotes: ['Required before reinforcement procurement', 'Linked with supplier compliance'],
    requirements: ['Steel grade', 'Certification', 'Testing', 'Storage', 'Approval process'],
    linkedProjects: ['Emerald Heights', 'Industrial Warehouse'],
    linkedFiles: ['IS 800 Steel Design Reference'],
  },
  {
    id: 'STD-MAT-003',
    title: 'Waterproofing Material Spec',
    category: 'Material Specs',
    type: 'Material Spec',
    discipline: 'Civil / Finishing',
    owner: 'QA Head',
    version: 'v1.5',
    status: 'Archived',
    usedIn: 8,
    updated: '03 May 2026',
    fileType: 'PDF',
    description: 'Specification format for waterproofing material approval, method statement, warranty, and testing requirements.',
    approvalRequired: true,
    projectStages: ['Pre-construction', 'Construction'],
    usageNotes: ['Archived standard; duplicate before reuse', 'This standard is no longer active and should not be used in new submissions.'],
    requirements: ['Material approval', 'Method statement', 'Warranty', 'Testing requirements', 'Ponding test'],
    linkedProjects: ['Skyline Residency'],
    linkedFiles: ['Waterproofing Checklist'],
    archivedNote: 'This standard is no longer active and should not be used in new submissions.',
  },
  {
    id: 'STD-WF-001',
    title: 'Drawing Approval Workflow',
    category: 'Approval Workflows',
    type: 'Approval Workflow',
    discipline: 'Documentation',
    owner: 'Document Controller',
    version: 'v2.2',
    status: 'Active',
    usedIn: 19,
    updated: '14 May 2026',
    fileType: 'Workflow',
    description: 'Standard drawing approval path from upload to final approval.',
    approvalRequired: true,
    projectStages: ['Design', 'Construction'],
    usageNotes: ['Default workflow for drawing submissions', 'Required before drawing submission'],
    requirements: ['Draft', 'Submitted', 'Under Review', 'Comments Issued', 'Resubmitted', 'Approved', 'Current'],
    linkedProjects: ['Emerald Heights', 'Metro Commercial Tower'],
    linkedFiles: ['Drawing Submission Checklist', 'Revision Control Standard'],
  },
  {
    id: 'STD-WF-002',
    title: 'Material Approval Workflow',
    category: 'Approval Workflows',
    type: 'Approval Workflow',
    discipline: 'Procurement / QA',
    owner: 'Material Manager',
    version: 'v1.9',
    status: 'Active',
    usedIn: 15,
    updated: '11 May 2026',
    fileType: 'Workflow',
    description: 'Standard material approval process from vendor submission to final site approval.',
    approvalRequired: true,
    projectStages: ['Pre-construction', 'Construction'],
    usageNotes: ['Linked with material catalog', 'Controls approved for use status'],
    requirements: ['Vendor Submitted', 'Technical Review', 'QA Review', 'Consultant Approval', 'Approved for Use'],
    linkedProjects: ['Hospital Block B', 'Industrial Warehouse'],
    linkedFiles: ['Vendor Onboarding Document List', 'Concrete Specification Format'],
  },
  {
    id: 'STD-WF-003',
    title: 'BIM Model Approval Workflow',
    category: 'Approval Workflows',
    type: 'Approval Workflow',
    discipline: 'BIM',
    owner: 'BIM Manager',
    version: 'v1.6',
    status: 'Superseded',
    usedIn: 10,
    updated: '04 May 2026',
    fileType: 'Workflow',
    description: 'Model review process for coordination, clash closure, approval, and handover.',
    approvalRequired: true,
    projectStages: ['Design', 'Construction', 'As-built'],
    usageNotes: ['Superseded by v2.1', 'Use only for legacy project closeout'],
    requirements: ['Model Uploaded', 'BIM Review', 'Clash Review', 'Discipline Approval', 'Federated Model Approved'],
    linkedProjects: ['Metro Commercial Tower', 'Skyline Residency'],
    linkedFiles: ['Clash Detection Rules', 'BIM Execution Plan Template'],
  },
];

const recommendedOrder = [
  'BIM Execution Plan Template',
  'LOD Matrix',
  'Clash Detection Rules',
  'Model Naming Convention',
  'Drawing Title Block Standard',
  'Drawing Numbering Rule',
  'Revision Control Standard',
  'RFI Template',
  'Concrete Pour Checklist',
  'Work Permit Template',
  'Vendor Onboarding Document List',
  'Drawing Approval Workflow',
];

function StandardSelect({
  children,
  className = '',
  containerClassName = '',
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { containerClassName?: string }) {
  return (
    <span className={`group relative inline-flex ${containerClassName}`}>
      <select
        {...props}
        className={`h-9 w-full min-w-[142px] appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </span>
  );
}

function sortStandards(items: StandardItem[], sortBy: string) {
  const recommendedRank = (item: StandardItem) => {
    const index = recommendedOrder.indexOf(item.title);
    return index === -1 ? 99 : index;
  };
  return [...items].sort((a, b) => {
    if (sortBy === 'Name A-Z') return a.title.localeCompare(b.title);
    if (sortBy === 'Category') return a.category.localeCompare(b.category);
    if (sortBy === 'Status') return a.status.localeCompare(b.status);
    if (sortBy === 'Owner') return a.owner.localeCompare(b.owner);
    if (sortBy === 'Most Used') return b.usedIn - a.usedIn;
    return recommendedRank(a) - recommendedRank(b) || b.usedIn - a.usedIn;
  });
}

function buildCreatedStandard(draft: CreateStandardDraft): StandardItem {
  const category = categoryAliases[draft.category] ?? 'Templates';
  return {
    id: `STD-NEW-${Date.now()}`,
    title: draft.name || 'Untitled Standard',
    category,
    type: draft.type || draft.category,
    discipline: draft.discipline,
    owner: draft.owner || 'Unassigned',
    version: draft.version || 'v0.1',
    status: draft.status as StandardStatus,
    usedIn: 0,
    updated: '19 May 2026',
    fileType: draft.fileType || 'Upload Pending',
    description: draft.description || 'New company standard pending detailed description.',
    approvalRequired: draft.approvalRequired,
    projectStages: [draft.stage],
    usageNotes: [draft.notes || 'Draft standard created for workspace review.'],
    requirements: ['Complete standard content', 'Attach source file', 'Assign approver', 'Submit for approval'],
    linkedProjects: [],
    linkedFiles: [],
  };
}

type CreateStandardDraft = {
  name: string;
  category: string;
  discipline: string;
  type: string;
  owner: string;
  version: string;
  status: StandardStatus;
  stage: string;
  workPackage: string;
  description: string;
  fileType: string;
  approvalRequired: boolean;
  approver: string;
  tags: string;
  notes: string;
};

export default function StandardsCatalog({ onBack }: { onBack: () => void }) {
  const [standards, setStandards] = useState<StandardItem[]>(standardsSeed);
  const [activeFilter, setActiveFilter] = useState<(typeof filterPills)[number]>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Recently Updated');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStandard, setSelectedStandard] = useState<StandardItem | null>(null);
  const [detailTab, setDetailTab] = useState<'Overview' | 'Requirements' | 'Version History' | 'Approval Log' | 'Linked Projects'>('Overview');
  const [createOpen, setCreateOpen] = useState(false);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CreateStandardDraft>({
    name: '',
    category: 'BIM Standard',
    discipline: 'Multi-discipline',
    type: 'BIM Standard',
    owner: '',
    version: 'v0.1',
    status: 'Draft',
    stage: 'Pre-construction',
    workPackage: '',
    description: '',
    fileType: '',
    approvalRequired: true,
    approver: 'BIM Manager',
    tags: '',
    notes: '',
  });

  const filteredStandards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = standards.filter((standard) => {
      const matchesFilter = activeFilter === 'All'
        || (activeFilter === 'Archived' ? standard.status === 'Archived' : standard.category === activeFilter);
      const searchable = [
        standard.title,
        standard.category,
        standard.type,
        standard.discipline,
        standard.owner,
        standard.status,
        standard.fileType,
        standard.description,
        ...standard.requirements,
      ].join(' ').toLowerCase();
      return matchesFilter && (!query || searchable.includes(query));
    });
    return sortStandards(filtered, sortBy);
  }, [activeFilter, searchQuery, sortBy, standards]);

  const updateStandardStatus = (standard: StandardItem, status: StandardStatus) => {
    const updated = { ...standard, status };
    setStandards((items) => items.map((item) => item.id === standard.id ? updated : item));
    setSelectedStandard((current) => current?.id === standard.id ? updated : current);
    toast.success(`${standard.title} marked as ${status}.`);
  };

  const createStandard = (status: StandardStatus) => {
    if (!draft.name.trim()) {
      toast.error('Standard name is required.');
      return;
    }
    const created = buildCreatedStandard({ ...draft, status });
    setStandards((items) => [created, ...items]);
    setCreateOpen(false);
    setSelectedStandard(created);
    setDetailTab('Overview');
    toast.success(status === 'Pending Review' ? 'Standard submitted for approval.' : status === 'Draft' ? 'Standard saved as draft.' : 'Standard created.');
  };

  const standardAction = (label: string, standard?: StandardItem) => {
    const target = standard ?? selectedStandard;
    if (!target) return;
    setActionMenuId(null);
    toast.success(`${label}: ${target.title}`);
  };

  const statusCount = (status: StandardStatus) => standards.filter((standard) => standard.status === status).length;

  return (
    <div className="space-y-4 font-sans pb-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <button onClick={onBack} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-violet-700">Controlled Library</span>
              <span className="text-xs font-semibold text-slate-400">Specs & references</span>
            </div>
            <h1 className="text-2xl font-black text-slate-950">Standards</h1>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              Centralized library for BIM rules, drawing standards, templates, QA checklists, safety documents, and code references.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Use approved standards to maintain consistency across projects, teams, vendors, and site execution.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setCreateOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Create Standard
            </button>
            <button onClick={() => toast.success('Template import started.')} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
              <UploadCloud className="h-4 w-4" /> Import Template
            </button>
            <button onClick={() => toast.info('Category manager opened.')} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">Manage Categories</button>
            <button onClick={() => toast.info('Approval matrix opened.')} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">Approval Matrix</button>
            <button onClick={() => setActiveFilter('Archived')} className="h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-slate-50">Archived Standards</button>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { title: 'Active Standards', value: '26', label: 'Approved and currently in use', icon: ShieldCheck, tone: 'border-emerald-100 bg-emerald-50 text-emerald-700' },
          { title: 'Pending Review', value: '07', label: 'Awaiting approval or revision', icon: Clock, tone: 'border-amber-100 bg-amber-50 text-amber-700' },
          { title: 'Templates', value: '14', label: 'Reusable document formats', icon: FileText, tone: 'border-blue-100 bg-blue-50 text-blue-700' },
          { title: 'Code References', value: '09', label: 'Linked construction codes and norms', icon: FileCheck2, tone: 'border-violet-100 bg-violet-50 text-violet-700' },
        ].map((card) => (
          <section key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl border ${card.tone}`}>
              <card.icon className="h-4 w-4" />
            </div>
            <p className="text-xs font-semibold text-slate-500">{card.title}</p>
            <div className="mt-1 flex items-end gap-2">
              <span className="text-2xl font-black text-slate-950">{card.value}</span>
              <span className="pb-1 text-xs text-slate-400">{card.label}</span>
            </div>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 xl:w-[420px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search standards, templates, codes, checklists..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StandardSelect value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
              <option>Recently Updated</option>
              <option>Name A-Z</option>
              <option>Category</option>
              <option>Status</option>
              <option>Owner</option>
              <option>Most Used</option>
            </StandardSelect>
            <div className="flex overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button onClick={() => setViewMode('grid')} className={`inline-flex h-9 items-center gap-2 px-3 text-xs font-bold ${viewMode === 'grid' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                <Grid3x3 className="h-4 w-4" /> Grid View
              </button>
              <button onClick={() => setViewMode('list')} className={`inline-flex h-9 items-center gap-2 px-3 text-xs font-bold ${viewMode === 'list' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                <List className="h-4 w-4" /> List View
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {filterPills.map((pill) => (
            <button
              key={pill}
              onClick={() => setActiveFilter(pill)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                activeFilter === pill ? 'bg-slate-950 text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              {pill}
            </button>
          ))}
        </div>
      </div>

      {activeFilter !== 'All' && activeFilter !== 'Archived' && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${categoryTone[activeFilter as StandardCategory]}`}>
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-950">{activeFilter}</h2>
              <p className="mt-1 text-sm text-slate-600">{categoryDescriptions[activeFilter as StandardCategory]}</p>
            </div>
          </div>
        </section>
      )}

      {filteredStandards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-900">No standards found</h3>
          <p className="mt-1 text-sm text-slate-500">Try changing filters or create a new standard for your workspace.</p>
          <button onClick={() => setCreateOpen(true)} className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Create Standard</button>
        </div>
      ) : viewMode === 'list' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid min-w-[1080px] grid-cols-[minmax(0,1.5fr)_150px_130px_140px_120px_120px_90px] gap-3 border-b border-slate-100 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <div>Standard</div><div>Category</div><div>Status</div><div>Owner</div><div>Updated</div><div>Usage</div><div>Action</div>
          </div>
          <div className="overflow-x-auto">
            {filteredStandards.map((standard) => (
              <button
                key={standard.id}
                onClick={() => { setSelectedStandard(standard); setDetailTab('Overview'); }}
                className="grid min-w-[1080px] w-full grid-cols-[minmax(0,1.5fr)_150px_130px_140px_120px_120px_90px] gap-3 border-b border-slate-100 px-4 py-3.5 text-left text-sm transition hover:bg-blue-50/40"
              >
                <div className="min-w-0">
                  <p className="truncate font-bold text-slate-900">{standard.title}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">{standard.description}</p>
                </div>
                <div><span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${categoryTone[standard.category]}`}>{standard.category}</span></div>
                <div><span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusTone[standard.status]}`}>{standard.status}</span></div>
                <div className="text-xs font-semibold text-slate-600">{standard.owner}</div>
                <div className="text-xs text-slate-500">{standard.updated}</div>
                <div className="text-xs font-semibold text-slate-600">Used across {standard.usedIn} projects</div>
                <div className="text-xs font-bold text-blue-600">View</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredStandards.map((standard) => (
            <section key={standard.id} className="group relative flex min-h-[280px] flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-lg hover:shadow-slate-950/5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${categoryTone[standard.category]}`}>{standard.category}</span>
                <div className="relative">
                  <button onClick={() => setActionMenuId(actionMenuId === standard.id ? null : standard.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-50 hover:text-slate-700">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {actionMenuId === standard.id && (
                    <div className="absolute right-0 top-8 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                      {standard.status === 'Archived' ? (
                        <>
                          <button onClick={() => updateStandardStatus(standard, 'Active')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><CheckCircle2 className="h-3.5 w-3.5" /> Restore</button>
                          <button onClick={() => standardAction('Duplicate archived standard', standard)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Copy className="h-3.5 w-3.5" /> Duplicate</button>
                          <button onClick={() => standardAction('Permanently archived', standard)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><Archive className="h-3.5 w-3.5" /> Permanently Archive</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setSelectedStandard(standard); setDetailTab('Overview'); setActionMenuId(null); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Eye className="h-3.5 w-3.5" /> View</button>
                          <button onClick={() => standardAction('Copy link', standard)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Link2 className="h-3.5 w-3.5" /> Copy Link</button>
                          <button onClick={() => updateStandardStatus(standard, 'Needs Update')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"><Clock className="h-3.5 w-3.5" /> Mark Needs Update</button>
                          <button onClick={() => updateStandardStatus(standard, 'Archived')} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"><Archive className="h-3.5 w-3.5" /> Archive</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-base font-black text-slate-950">{standard.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{standard.description}</p>
              {standard.status === 'Archived' && (
                <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Archived</p>
                  <p className="mt-1 text-xs text-zinc-500">This standard is no longer active and should not be used in new submissions.</p>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                <div><p className="text-slate-400">Version</p><p className="font-bold text-slate-700">{standard.version}</p></div>
                <div><p className="text-slate-400">Status</p><span className={`mt-0.5 inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold ${statusTone[standard.status]}`}>{standard.status}</span></div>
                <div><p className="text-slate-400">Owner</p><p className="font-bold text-slate-700">{standard.owner}</p></div>
                <div><p className="text-slate-400">Updated</p><p className="font-bold text-slate-700">{standard.updated}</p></div>
                <div><p className="text-slate-400">Used In</p><p className="font-bold text-slate-700">{standard.usedIn} projects</p></div>
                <div><p className="text-slate-400">File</p><p className="font-bold text-slate-700">{standard.fileType}</p></div>
              </div>
              <button onClick={() => { setSelectedStandard(standard); setDetailTab('Overview'); }} className="mt-4 h-9 rounded-xl bg-slate-950 text-xs font-bold text-white transition hover:bg-slate-800">
                View Standard
              </button>
            </section>
          ))}
        </div>
      )}

      <footer className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <span>Showing 26 standards across BIM, drawings, QA, safety, templates, codes, and compliance.</span>
        <button onClick={() => { setActiveFilter('All'); setSearchQuery(''); }} className="font-bold text-blue-600 hover:text-blue-700">View all standards</button>
      </footer>

      {selectedStandard && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
              <div className="flex min-w-0 gap-3">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${categoryTone[selectedStandard.category]}`}>
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black text-slate-950">{selectedStandard.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${categoryTone[selectedStandard.category]}`}>Category: {selectedStandard.category}</span>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600">Version: {selectedStandard.version}</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${statusTone[selectedStandard.status]}`}>Status: {selectedStandard.status}</span>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600">Owner: {selectedStandard.owner}</span>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600">Updated: {selectedStandard.updated}</span>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600">Used In: {selectedStandard.usedIn} projects</span>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600">File: {selectedStandard.fileType}</span>
                    <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-bold text-slate-600">Approval Required: {selectedStandard.approvalRequired ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStandard(null)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex gap-5 overflow-x-auto border-b border-slate-100 px-5">
              {(['Overview', 'Requirements', 'Version History', 'Approval Log', 'Linked Projects'] as const).map((tab) => (
                <button key={tab} onClick={() => setDetailTab(tab)} className={`relative h-11 whitespace-nowrap text-sm font-bold ${detailTab === tab ? 'text-blue-700' : 'text-slate-400 hover:text-slate-700'}`}>
                  {tab}
                  {detailTab === tab && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-full bg-blue-600" />}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-5">
              {detailTab === 'Overview' && (
                <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-2 text-sm font-black text-slate-950">Description</h3>
                    <p className="text-sm leading-relaxed text-slate-600">{selectedStandard.description}</p>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Applicable Disciplines</p>
                        <p className="text-sm font-semibold text-slate-800">{selectedStandard.discipline}</p>
                      </div>
                      <div>
                        <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Applicable Project Stages</p>
                        <div className="flex flex-wrap gap-1.5">{selectedStandard.projectStages.map(stage => <span key={stage} className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">{stage}</span>)}</div>
                      </div>
                    </div>
                    {selectedStandard.exampleFormat && (
                      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Example Format</p>
                        <p className="mt-2 font-mono text-sm font-bold text-slate-800">{selectedStandard.exampleFormat}</p>
                        <p className="mt-1 font-mono text-xs text-slate-500">{selectedStandard.example}</p>
                      </div>
                    )}
                    <div className="mt-5">
                      <p className="mb-2 text-[10px] font-black uppercase tracking-wider text-slate-400">Usage Notes</p>
                      <div className="grid gap-2 md:grid-cols-2">
                        {selectedStandard.usageNotes.map(note => (
                          <div key={note} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-slate-600">{note}</div>
                        ))}
                      </div>
                    </div>
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-black text-slate-950">Actions</h3>
                    <div className="grid gap-2">
                      {[
                        ['Download', Download],
                        ['Edit Standard', Edit2],
                        ['Update Version', History],
                        ['Assign Owner', UserCheck],
                        ['Set as Default', Check],
                        ['Request Approval', ShieldCheck],
                        ['Duplicate as Template', Copy],
                        ['Archive', Archive],
                      ].map(([label, Icon]) => (
                        <button key={label as string} onClick={() => label === 'Archive' ? updateStandardStatus(selectedStandard, 'Archived') : standardAction(label as string)} className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                          <Icon className="h-3.5 w-3.5" /> {label as string}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {['Copy Link', 'View Usage', 'Replace File', 'Add Comment', 'Mark as Needs Update'].map((label) => (
                        <button key={label} onClick={() => label === 'Mark as Needs Update' ? updateStandardStatus(selectedStandard, 'Needs Update') : standardAction(label)} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-[11px] font-bold text-slate-600 hover:bg-white">
                          {label}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {detailTab === 'Requirements' && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-sm font-black text-slate-950">Standard Requirements</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    {selectedStandard.requirements.map((requirement, index) => (
                      <div key={requirement} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">{index + 1}</span>
                        <span className="text-sm font-semibold text-slate-700">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {detailTab === 'Version History' && (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid grid-cols-[100px_140px_180px_minmax(0,1fr)_120px] bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <div>Version</div><div>Date</div><div>Updated By</div><div>Notes</div><div>Status</div>
                  </div>
                  {[
                    [selectedStandard.version, selectedStandard.updated, selectedStandard.owner, 'Updated LOD matrix reference', selectedStandard.status],
                    ['v2.0', '18 Apr 2026', selectedStandard.owner.includes('BIM') ? 'BIM Lead' : selectedStandard.owner, 'Added coordination rules', 'Superseded'],
                    ['v1.8', '02 Mar 2026', selectedStandard.owner, 'Initial company-wide rollout', 'Archived'],
                  ].map(([version, date, by, notes, status]) => (
                    <div key={`${version}-${date}`} className="grid grid-cols-[100px_140px_180px_minmax(0,1fr)_120px] border-t border-slate-100 px-4 py-3 text-sm">
                      <div className="font-bold text-slate-900">{version}</div><div className="text-slate-600">{date}</div><div className="text-slate-600">{by}</div><div className="text-slate-600">{notes}</div><div><span className={`rounded-md border px-2 py-1 text-[10px] font-bold ${statusTone[status as StandardStatus]}`}>{status}</span></div>
                    </div>
                  ))}
                </section>
              )}

              {detailTab === 'Approval Log' && (
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid grid-cols-[180px_200px_160px_140px] bg-slate-50 px-4 py-3 text-[11px] font-black uppercase tracking-wider text-slate-500">
                    <div>Step</div><div>Approver</div><div>Status</div><div>Date</div>
                  </div>
                  {[
                    ['Created', selectedStandard.owner.includes('BIM') ? 'BIM Lead' : selectedStandard.owner, 'Completed', '10 May 2026'],
                    ['Reviewed', 'Project Controls', 'Completed', '11 May 2026'],
                    ['Approved', selectedStandard.owner, 'Approved', selectedStandard.updated],
                  ].map(([step, approver, status, date]) => (
                    <div key={step} className="grid grid-cols-[180px_200px_160px_140px] border-t border-slate-100 px-4 py-3 text-sm">
                      <div className="font-bold text-slate-900">{step}</div><div className="text-slate-600">{approver}</div><div className="text-emerald-700 font-bold">{status}</div><div className="text-slate-600">{date}</div>
                    </div>
                  ))}
                </section>
              )}

              {detailTab === 'Linked Projects' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-black text-slate-950">Linked Projects</h3>
                    <div className="space-y-2">
                      {selectedStandard.linkedProjects.map(project => <div key={project} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{project}</div>)}
                    </div>
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-black text-slate-950">Linked Files</h3>
                    <div className="space-y-2">
                      {selectedStandard.linkedFiles.map(file => <div key={file} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">{file}</div>)}
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {createOpen && (
        <div className="fixed inset-0 z-[230] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
              <div>
                <h2 className="text-xl font-black text-slate-950">Create Standard</h2>
                <p className="mt-1 text-xs text-slate-500">Create a controlled standard for projects, teams, vendors, and site execution.</p>
              </div>
              <button onClick={() => setCreateOpen(false)} className="rounded-lg border border-slate-200 bg-white p-2 text-slate-400 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Standard Name</span><input value={draft.name} onChange={event => setDraft(current => ({ ...current, name: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Category</span><StandardSelect value={draft.category} onChange={event => setDraft(current => ({ ...current, category: event.target.value }))} containerClassName="w-full">{createCategoryOptions.map(option => <option key={option}>{option}</option>)}</StandardSelect></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Discipline</span><StandardSelect value={draft.discipline} onChange={event => setDraft(current => ({ ...current, discipline: event.target.value }))} containerClassName="w-full">{disciplineOptions.map(option => <option key={option}>{option}</option>)}</StandardSelect></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Standard Type</span><input value={draft.type} onChange={event => setDraft(current => ({ ...current, type: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Owner</span><input value={draft.owner} onChange={event => setDraft(current => ({ ...current, owner: event.target.value }))} placeholder="BIM Manager" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Version</span><input value={draft.version} onChange={event => setDraft(current => ({ ...current, version: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Status</span><StandardSelect value={draft.status} onChange={event => setDraft(current => ({ ...current, status: event.target.value as StandardStatus }))} containerClassName="w-full">{(['Draft', 'Pending Review', 'Approved', 'Active'] as StandardStatus[]).map(option => <option key={option}>{option}</option>)}</StandardSelect></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Applicable Project Stage</span><StandardSelect value={draft.stage} onChange={event => setDraft(current => ({ ...current, stage: event.target.value }))} containerClassName="w-full">{projectStageOptions.map(option => <option key={option}>{option}</option>)}</StandardSelect></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Applicable Work Package</span><input value={draft.workPackage} onChange={event => setDraft(current => ({ ...current, workPackage: event.target.value }))} placeholder="Core, facade, MEP rough-in" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Upload File</span><input value={draft.fileType} onChange={event => setDraft(current => ({ ...current, fileType: event.target.value }))} placeholder="DOCX, XLSX, PDF, Workflow" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Approver</span><input value={draft.approver} onChange={event => setDraft(current => ({ ...current, approver: event.target.value }))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></label>
                <label className="space-y-1.5"><span className="text-xs font-bold text-slate-600">Tags</span><input value={draft.tags} onChange={event => setDraft(current => ({ ...current, tags: event.target.value }))} placeholder="BIM, LOD, QA, safety" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" /></label>
                <label className="md:col-span-2 space-y-1.5"><span className="text-xs font-bold text-slate-600">Description</span><textarea rows={3} value={draft.description} onChange={event => setDraft(current => ({ ...current, description: event.target.value }))} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" /></label>
                <label className="md:col-span-2 space-y-1.5"><span className="text-xs font-bold text-slate-600">Notes</span><textarea rows={3} value={draft.notes} onChange={event => setDraft(current => ({ ...current, notes: event.target.value }))} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" /></label>
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700">
                  <input type="checkbox" checked={draft.approvalRequired} onChange={event => setDraft(current => ({ ...current, approvalRequired: event.target.checked }))} />
                  Approval Required
                </label>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
              <button onClick={() => setCreateOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={() => createStandard('Draft')} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Save as Draft</button>
              <button onClick={() => createStandard('Pending Review')} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 hover:bg-amber-100">Submit for Approval</button>
              <button onClick={() => createStandard('Active')} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">Create Standard</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
