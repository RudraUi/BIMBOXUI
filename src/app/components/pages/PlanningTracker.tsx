import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Calendar, Download, Eye, EyeOff, Plus, Search, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ChevronDown, Maximize2, Minimize2, Pencil, Info, RotateCcw, Check, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

type PlanningStatus = "Completed" | "On Track" | "For Review" | "At Risk" | "Pending" | "Blocked" | "Planned" | "Delayed";
type PlanningView = "wbs" | "milestones" | "timeline" | "gantt" | "scheduled-actual" | "baseline" | "lookahead";
type PlanningMode = "edit" | "create-phase" | "create-task" | "create-subtask";
type DependencyType = "FS" | "SS" | "FF" | "SF";
type BufferReason = "Weather Risk" | "Approval Risk" | "Procurement Risk" | "Labor Risk" | "Inspection Buffer" | "Safety Margin" | "Custom";
type BufferType = "Project Buffer" | "Feeding Buffer" | "Task Buffer";
type DelayStatus = "On Track" | "Minor Delay" | "Critical Delay" | "Recovered";
type DelayReason = "Material Delay" | "Labor Shortage" | "Weather" | "Approval Pending" | "Equipment Failure" | "Rework" | "Client Change" | "Site Access Issue" | "Other";
type DelayImpact = "No Impact" | "Impacts Successor" | "Impacts Milestone" | "Impacts Critical Path";
type ScheduledActualStatus =
  | "Not Started"
  | "Should Start Today"
  | "In Progress"
  | "On Track"
  | "Behind Schedule"
  | "Delayed"
  | "Completed"
  | "Completed Late"
  | "Completed Early";
type ActualDateRange = "All Dates" | "Today" | "This Week" | "Next 7 Days" | "Overdue";
type LookaheadWindow = "1 Week" | "2 Weeks" | "3 Weeks" | "6 Weeks";
type BaselineDisplay = "table" | "overlay";
type BaselinePanel = "insights" | "changes";
type TableColumnScope = "wbs" | "baseline" | "lookahead" | "scheduledActual";
type ExportFormat = "CSV" | "PDF" | "Word";
export type PlanningTemplateKey = "new" | "preconstruction" | "construction" | "bep" | "site-survey" | "facility-management";

type TableColumnDefinition = {
  key: string;
  label: string;
};

const wbsTableColumns: TableColumnDefinition[] = [
  { key: "activityId", label: "Activity ID" },
  { key: "task", label: "Task" },
  { key: "start", label: "Start" },
  { key: "finish", label: "Finish" },
  { key: "actual", label: "Actual" },
  { key: "float", label: "Float" },
  { key: "constraint", label: "Constraint" },
  { key: "dependency", label: "Dependency" },
  { key: "responsible", label: "Responsible" },
  { key: "timeline", label: "Task Timeline" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions" },
];

const baselineTableColumns: TableColumnDefinition[] = [
  { key: "activityId", label: "Activity ID" },
  { key: "task", label: "Task" },
  { key: "phase", label: "Phase" },
  { key: "baselineStart", label: "Baseline Start" },
  { key: "baselineFinish", label: "Baseline Finish" },
  { key: "currentStart", label: "Current Start" },
  { key: "currentFinish", label: "Current Finish" },
  { key: "variance", label: "Variance" },
  { key: "reason", label: "Reason" },
  { key: "responsible", label: "Responsible" },
];

const lookaheadTableColumns: TableColumnDefinition[] = [
  { key: "activityId", label: "Activity ID" },
  { key: "workItem", label: "Work Item" },
  { key: "phase", label: "Phase" },
  { key: "plannedDates", label: "Planned Dates" },
  { key: "responsible", label: "Responsible" },
  { key: "readiness", label: "Readiness" },
  { key: "constraint", label: "Constraint" },
  { key: "status", label: "Status" },
  { key: "action", label: "Action" },
];

const scheduledActualTableColumns: TableColumnDefinition[] = [
  { key: "activityId", label: "Activity ID" },
  { key: "activityName", label: "Activity Name" },
  { key: "phase", label: "WBS / Phase" },
  { key: "plannedStart", label: "Planned Start" },
  { key: "plannedFinish", label: "Planned Finish" },
  { key: "actualStart", label: "Actual Start" },
  { key: "actualFinish", label: "Actual Finish" },
  { key: "plannedProgress", label: "Planned Progress %" },
  { key: "actualProgress", label: "Actual Progress %" },
  { key: "variance", label: "Variance" },
  { key: "delayDays", label: "Delay Days" },
  { key: "status", label: "Status" },
  { key: "responsible", label: "Responsible" },
  { key: "remarks", label: "Remarks" },
];

const tableColumnsByScope: Record<TableColumnScope, TableColumnDefinition[]> = {
  wbs: wbsTableColumns,
  baseline: baselineTableColumns,
  lookahead: lookaheadTableColumns,
  scheduledActual: scheduledActualTableColumns,
};

type ScheduleDependency = {
  id: string;
  predecessorId: string;
  type: DependencyType;
  lag: string;
};

type PlanningSubtask = {
  id: string;
  code: string;
  activityId?: string;
  name: string;
  owner: string;
  responsible?: string;
  status: PlanningStatus;
  progress: number;
  actual?: number;
  float?: number;
  constraint?: string;
  dependencies?: ScheduleDependency[];
  bufferDays?: number;
  bufferReason?: BufferReason;
  bufferType?: BufferType;
  bufferVisible?: boolean;
  delayStatus?: DelayStatus;
  delayReason?: DelayReason;
  delayImpact?: DelayImpact;
  recoveryPlan?: string;
  remarks?: string;
  latestSiteUpdate?: string;
  linkedDpr?: string;
  sitePhotos?: string[];
  color?: string;
  bepSection?: string;
  output?: string;
  dependencyText?: string;
  displayTaskCount?: number;
  displaySubtaskCount?: number;
  start: string;
  end: string;
  actualStart?: string;
  actualEnd?: string;
};

type PlanningTask = PlanningSubtask & {
  subtasks: PlanningSubtask[];
};

type PlanningPackage = Omit<PlanningTask, "subtasks"> & {
  tasks: PlanningTask[];
};

type TimelineItem = (PlanningPackage | PlanningTask | PlanningSubtask) & {
  itemType: "package" | "task" | "subtask";
  packageId: string;
  taskId?: string;
};

type ActualTrackingRow = TimelineItem & {
  phaseName: string;
  phaseCode: string;
  plannedProgress: number;
  actualProgress: number;
  variance: number;
  delayDays: number;
  trackingStatus: ScheduledActualStatus;
  responsibleTeam: string;
  isActualInProgress: boolean;
  isCritical: boolean;
  rowTone: "green" | "amber" | "red" | "blue" | "grey";
};

type MilestoneRow = PlanningTask & {
  itemType: "task";
  packageId: string;
  phaseName: string;
  phaseCode: string;
};

type EditState = {
  mode: PlanningMode;
  packageId?: string;
  taskId?: string;
  subtaskId?: string;
};

type PlanningForm = {
  name: string;
  activityId: string;
  start: string;
  end: string;
  actualStart: string;
  actualEnd: string;
  actual: number;
  float: number;
  constraint: string;
  dependencies: ScheduleDependency[];
  bufferDays: number;
  bufferReason: BufferReason;
  bufferType: BufferType;
  bufferVisible: boolean;
  delayStatus: DelayStatus;
  delayReason: DelayReason;
  recoveryPlan: string;
  status: PlanningStatus;
  progress: number;
  responsible: string;
  color: string;
  parentTaskId: string;
  scheduleEffect: string;
};

type BaselineTaskSnapshot = {
  key: string;
  id: string;
  packageId: string;
  activityId: string;
  name: string;
  phaseName: string;
  start: string;
  end: string;
  responsibleTeam: string;
};

type BaselineSnapshot = {
  revision: number;
  approvedAt: string;
  tasks: BaselineTaskSnapshot[];
};

type LookaheadCheckLabel = "Drawings" | "Materials" | "Labor" | "Equipment" | "Access";

type LookaheadOverride = {
  checks?: Partial<Record<LookaheadCheckLabel, boolean>>;
  constraint?: LookaheadCheckLabel | "None";
};

const initialPlanningPackages: PlanningPackage[] = [
  {
    id: "preconstruction",
    code: "1",
    name: "Pre-Construction",
    owner: "Planning",
    status: "On Track",
    progress: 76,
    start: "2026-05-13",
    end: "2026-05-31",
    tasks: [
      {
        id: "design-freeze",
        code: "1.1",
        name: "Design Freeze & Consultant Sign-off",
        owner: "Planning",
        status: "Completed",
        progress: 100,
        start: "2026-05-13",
        end: "2026-05-17",
        subtasks: [
          { id: "arch-freeze", code: "1.1.1", name: "Architectural package freeze", owner: "Planning", status: "Completed", progress: 100, start: "2026-05-13", end: "2026-05-14" },
          { id: "structure-review", code: "1.1.2", name: "Structural design review", owner: "Civil", status: "Completed", progress: 100, start: "2026-05-15", end: "2026-05-17" },
        ],
      },
      {
        id: "permits",
        code: "1.2",
        name: "Permit Submission & Authority Replies",
        owner: "Planning",
        status: "On Track",
        progress: 68,
        start: "2026-05-16",
        end: "2026-05-27",
        bufferDays: 2,
        bufferReason: "Approval Risk",
        bufferType: "Task Buffer",
        bufferVisible: true,
        subtasks: [
          { id: "permit-upload", code: "1.2.1", name: "Upload statutory drawings", owner: "Planning", status: "Completed", progress: 100, start: "2026-05-16", end: "2026-05-18" },
          { id: "authority-comments", code: "1.2.2", name: "Respond to authority comments", owner: "Planning", status: "On Track", progress: 42, start: "2026-05-19", end: "2026-05-27" },
        ],
      },
      {
        id: "procurement-plan",
        code: "1.3",
        name: "Procurement Strategy & Long-lead Register",
        owner: "Procurement",
        status: "At Risk",
        progress: 54,
        start: "2026-05-20",
        end: "2026-05-31",
        actualStart: "2026-05-13",
        latestSiteUpdate: "Long-lead register review started early with procurement team.",
        remarks: "Early start to reduce long-lead risk.",
        bufferDays: 3,
        bufferReason: "Procurement Risk",
        bufferType: "Feeding Buffer",
        bufferVisible: true,
        subtasks: [
          { id: "vendor-shortlist", code: "1.3.1", name: "Vendor shortlist", owner: "Procurement", status: "On Track", progress: 80, start: "2026-05-20", end: "2026-05-24" },
          { id: "long-lead-quote", code: "1.3.2", name: "Long-lead quotations", owner: "Procurement", status: "At Risk", progress: 35, start: "2026-05-25", end: "2026-05-31" },
        ],
      },
    ],
  },
  {
    id: "mobilization",
    code: "2",
    name: "Site Mobilization",
    owner: "Civil",
    status: "On Track",
    progress: 61,
    start: "2026-05-24",
    end: "2026-06-13",
    tasks: [
      {
        id: "site-handover",
        code: "2.1",
        name: "Site Handover & Boundary Survey",
        owner: "Civil",
        status: "Completed",
        progress: 100,
        start: "2026-05-24",
        end: "2026-05-27",
        subtasks: [
          { id: "control-points", code: "2.1.1", name: "Control point validation", owner: "Civil", status: "Completed", progress: 100, start: "2026-05-24", end: "2026-05-25" },
          { id: "survey-report", code: "2.1.2", name: "Survey report issue", owner: "QA/QC", status: "Completed", progress: 100, start: "2026-05-26", end: "2026-05-27" },
        ],
      },
      {
        id: "temporary-works",
        code: "2.2",
        name: "Temporary Works & Site Facilities",
        owner: "Civil",
        status: "On Track",
        progress: 58,
        start: "2026-05-28",
        end: "2026-06-08",
        subtasks: [
          { id: "hoarding", code: "2.2.1", name: "Hoarding and access gates", owner: "Civil", status: "On Track", progress: 72, start: "2026-05-28", end: "2026-06-03" },
          { id: "site-office", code: "2.2.2", name: "Site office setup", owner: "Civil", status: "Planned", progress: 20, start: "2026-06-04", end: "2026-06-08" },
        ],
      },
      {
        id: "temporary-utilities",
        code: "2.3",
        name: "Temporary Power, Water & Safety Setup",
        owner: "MEP",
        status: "Delayed",
        progress: 25,
        start: "2026-06-03",
        end: "2026-06-13",
        actualStart: "2026-06-03",
        actualEnd: "2026-06-16",
        bufferDays: 2,
        bufferReason: "Procurement Risk",
        bufferType: "Feeding Buffer",
        bufferVisible: true,
        delayReason: "Equipment Failure",
        subtasks: [
          { id: "temp-power", code: "2.3.1", name: "Temporary power connection", owner: "MEP", status: "Delayed", progress: 10, start: "2026-06-03", end: "2026-06-10" },
          { id: "safety-stations", code: "2.3.2", name: "Safety stations and lighting", owner: "MEP", status: "Planned", progress: 0, start: "2026-06-09", end: "2026-06-13" },
        ],
      },
    ],
  },
  {
    id: "substructure",
    code: "3",
    name: "Substructure",
    owner: "Civil",
    status: "On Track",
    progress: 44,
    start: "2026-06-10",
    end: "2026-07-15",
    tasks: [
      {
        id: "excavation",
        code: "3.1",
        name: "Bulk Excavation & Dewatering",
        owner: "Civil",
        status: "On Track",
        progress: 62,
        start: "2026-06-10",
        end: "2026-06-23",
        subtasks: [
          { id: "dewatering", code: "3.1.1", name: "Dewatering installation", owner: "Civil", status: "On Track", progress: 75, start: "2026-06-10", end: "2026-06-15" },
          { id: "bulk-cut", code: "3.1.2", name: "Bulk excavation", owner: "Civil", status: "On Track", progress: 55, start: "2026-06-14", end: "2026-06-23" },
        ],
      },
      {
        id: "piling",
        code: "3.2",
        name: "Pile Caps & Tie Beams",
        owner: "Civil",
        status: "At Risk",
        progress: 38,
        start: "2026-06-21",
        end: "2026-07-06",
        subtasks: [
          { id: "pilecap-rebar", code: "3.2.1", name: "Pile cap reinforcement", owner: "Civil", status: "At Risk", progress: 35, start: "2026-06-21", end: "2026-06-29" },
          { id: "tie-beam-formwork", code: "3.2.2", name: "Tie beam formwork", owner: "Civil", status: "Planned", progress: 15, start: "2026-06-30", end: "2026-07-06" },
        ],
      },
      {
        id: "raft-pour",
        code: "3.3",
        name: "Raft Concrete Pour & Curing",
        owner: "QA/QC",
        status: "Planned",
        progress: 10,
        start: "2026-07-05",
        end: "2026-07-15",
        subtasks: [
          { id: "concrete-booking", code: "3.3.1", name: "Concrete booking and pour plan", owner: "QA/QC", status: "On Track", progress: 35, start: "2026-07-05", end: "2026-07-08" },
          { id: "curing", code: "3.3.2", name: "Curing and cube tests", owner: "QA/QC", status: "Planned", progress: 0, start: "2026-07-09", end: "2026-07-15" },
        ],
      },
    ],
  },
  {
    id: "superstructure",
    code: "4",
    name: "Superstructure",
    owner: "Civil",
    status: "Delayed",
    progress: 24,
    start: "2026-07-08",
    end: "2026-08-18",
    tasks: [
      {
        id: "gf-columns",
        code: "4.1",
        name: "Ground Floor Columns",
        owner: "Civil",
        status: "Delayed",
        progress: 28,
        start: "2026-07-08",
        end: "2026-07-22",
        subtasks: [
          { id: "column-rebar", code: "4.1.1", name: "Column rebar fixing", owner: "Civil", status: "Delayed", progress: 25, start: "2026-07-08", end: "2026-07-15" },
          { id: "column-pour", code: "4.1.2", name: "Column shuttering and pour", owner: "Civil", status: "Planned", progress: 0, start: "2026-07-16", end: "2026-07-22" },
        ],
      },
      {
        id: "first-slab",
        code: "4.2",
        name: "First Slab Cycle",
        owner: "Civil",
        status: "At Risk",
        progress: 12,
        start: "2026-07-20",
        end: "2026-08-05",
        bufferDays: 2,
        bufferReason: "Inspection Buffer",
        bufferType: "Task Buffer",
        bufferVisible: true,
        subtasks: [
          { id: "slab-formwork", code: "4.2.1", name: "Deck formwork and props", owner: "Civil", status: "At Risk", progress: 8, start: "2026-07-20", end: "2026-07-28" },
          { id: "slab-mep-sleeves", code: "4.2.2", name: "MEP sleeves before pour", owner: "MEP", status: "Planned", progress: 0, start: "2026-07-29", end: "2026-08-02" },
          { id: "slab-pour", code: "4.2.3", name: "Slab concrete pour", owner: "QA/QC", status: "Planned", progress: 0, start: "2026-08-03", end: "2026-08-05" },
        ],
      },
      {
        id: "blockwork",
        code: "4.3",
        name: "Masonry Blockwork Start",
        owner: "Civil",
        status: "Planned",
        progress: 0,
        start: "2026-08-06",
        end: "2026-08-18",
        subtasks: [
          { id: "material-stack", code: "4.3.1", name: "Block material stacking", owner: "Procurement", status: "Planned", progress: 0, start: "2026-08-06", end: "2026-08-10" },
          { id: "masonry-zone-a", code: "4.3.2", name: "Zone A blockwork", owner: "Civil", status: "Planned", progress: 0, start: "2026-08-11", end: "2026-08-18" },
        ],
      },
    ],
  },
  {
    id: "mep-roughin",
    code: "5",
    name: "MEP Rough-in",
    owner: "MEP",
    status: "Planned",
    progress: 14,
    start: "2026-07-29",
    end: "2026-08-30",
    tasks: [
      {
        id: "sleeves-openings",
        code: "5.1",
        name: "Sleeves, Openings & Builder Work",
        owner: "MEP",
        status: "On Track",
        progress: 35,
        start: "2026-07-29",
        end: "2026-08-08",
        subtasks: [
          { id: "opening-markup", code: "5.1.1", name: "Opening markup on deck", owner: "MEP", status: "On Track", progress: 45, start: "2026-07-29", end: "2026-08-02" },
          { id: "sleeve-placement", code: "5.1.2", name: "Sleeve placement inspection", owner: "QA/QC", status: "Planned", progress: 10, start: "2026-08-03", end: "2026-08-08" },
        ],
      },
      {
        id: "electrical-conduits",
        code: "5.2",
        name: "Electrical Conduits & Pull Boxes",
        owner: "MEP",
        status: "Planned",
        progress: 5,
        start: "2026-08-06",
        end: "2026-08-20",
        subtasks: [
          { id: "conduit-layout", code: "5.2.1", name: "Conduit layout", owner: "MEP", status: "Planned", progress: 0, start: "2026-08-06", end: "2026-08-13" },
          { id: "pull-boxes", code: "5.2.2", name: "Pull box installation", owner: "MEP", status: "Planned", progress: 0, start: "2026-08-14", end: "2026-08-20" },
        ],
      },
      {
        id: "riser-works",
        code: "5.3",
        name: "Plumbing and Fire Risers",
        owner: "MEP",
        status: "Planned",
        progress: 0,
        start: "2026-08-18",
        end: "2026-08-30",
        subtasks: [
          { id: "riser-supports", code: "5.3.1", name: "Riser supports and sleeves", owner: "MEP", status: "Planned", progress: 0, start: "2026-08-18", end: "2026-08-23" },
          { id: "riser-install", code: "5.3.2", name: "Riser installation", owner: "MEP", status: "Planned", progress: 0, start: "2026-08-24", end: "2026-08-30" },
        ],
      },
    ],
  },
];

const siteSurveyTemplatePackages: PlanningPackage[] = [
  {
    id: "survey-planning",
    code: "1",
    name: "Survey Planning & Control",
    owner: "Survey",
    status: "On Track",
    progress: 42,
    start: "2026-05-14",
    end: "2026-05-28",
    tasks: [
      {
        id: "survey-scope",
        code: "1.1",
        name: "Survey scope and method statement",
        owner: "Survey",
        status: "Completed",
        progress: 100,
        start: "2026-05-14",
        end: "2026-05-16",
        subtasks: [
          { id: "survey-boundary-review", code: "1.1.1", name: "Boundary and deliverable review", owner: "Survey", status: "Completed", progress: 100, start: "2026-05-14", end: "2026-05-15" },
          { id: "survey-access-plan", code: "1.1.2", name: "Site access and safety plan", owner: "QA/QC", status: "Completed", progress: 100, start: "2026-05-15", end: "2026-05-16" },
        ],
      },
      {
        id: "control-network",
        code: "1.2",
        name: "Control point network setup",
        owner: "Survey",
        status: "On Track",
        progress: 55,
        start: "2026-05-17",
        end: "2026-05-22",
        subtasks: [
          { id: "benchmark-check", code: "1.2.1", name: "Benchmark verification", owner: "Survey", status: "On Track", progress: 70, start: "2026-05-17", end: "2026-05-19" },
          { id: "control-point-install", code: "1.2.2", name: "Control point installation", owner: "Survey", status: "On Track", progress: 40, start: "2026-05-20", end: "2026-05-22" },
        ],
      },
      {
        id: "survey-permits",
        code: "1.3",
        name: "Drone and access approvals",
        owner: "Planning",
        status: "At Risk",
        progress: 20,
        start: "2026-05-23",
        end: "2026-05-28",
        bufferDays: 2,
        bufferReason: "Approval Risk",
        bufferType: "Task Buffer",
        bufferVisible: true,
        subtasks: [
          { id: "drone-permit", code: "1.3.1", name: "Drone permission closure", owner: "Planning", status: "At Risk", progress: 15, start: "2026-05-23", end: "2026-05-26" },
          { id: "neighbor-access", code: "1.3.2", name: "Adjacent plot access confirmation", owner: "Survey", status: "Planned", progress: 0, start: "2026-05-27", end: "2026-05-28" },
        ],
      },
    ],
  },
  {
    id: "field-capture",
    code: "2",
    name: "Field Capture",
    owner: "Survey",
    status: "Planned",
    progress: 12,
    start: "2026-05-29",
    end: "2026-06-13",
    tasks: [
      {
        id: "drone-capture",
        code: "2.1",
        name: "Drone photogrammetry capture",
        owner: "Survey",
        status: "Planned",
        progress: 10,
        start: "2026-05-29",
        end: "2026-06-02",
        subtasks: [
          { id: "flight-grid", code: "2.1.1", name: "Flight grid setup", owner: "Survey", status: "Planned", progress: 0, start: "2026-05-29", end: "2026-05-30" },
          { id: "aerial-capture", code: "2.1.2", name: "Aerial image capture", owner: "Survey", status: "Planned", progress: 0, start: "2026-05-31", end: "2026-06-02" },
        ],
      },
      {
        id: "total-station",
        code: "2.2",
        name: "Total station and level survey",
        owner: "Survey",
        status: "Planned",
        progress: 15,
        start: "2026-06-03",
        end: "2026-06-08",
        subtasks: [
          { id: "spot-levels", code: "2.2.1", name: "Spot levels and grid points", owner: "Survey", status: "Planned", progress: 10, start: "2026-06-03", end: "2026-06-05" },
          { id: "feature-pickup", code: "2.2.2", name: "Existing feature pickup", owner: "Survey", status: "Planned", progress: 0, start: "2026-06-06", end: "2026-06-08" },
        ],
      },
      {
        id: "utility-scan",
        code: "2.3",
        name: "Utility scan and mark-up",
        owner: "MEP",
        status: "Planned",
        progress: 0,
        start: "2026-06-09",
        end: "2026-06-13",
        subtasks: [
          { id: "gpr-scan", code: "2.3.1", name: "GPR utility scan", owner: "MEP", status: "Planned", progress: 0, start: "2026-06-09", end: "2026-06-11" },
          { id: "utility-markup", code: "2.3.2", name: "Utility mark-up drawings", owner: "MEP", status: "Planned", progress: 0, start: "2026-06-12", end: "2026-06-13" },
        ],
      },
    ],
  },
  {
    id: "survey-deliverables",
    code: "3",
    name: "Survey Deliverables",
    owner: "Survey",
    status: "Planned",
    progress: 0,
    start: "2026-06-14",
    end: "2026-06-28",
    tasks: [
      {
        id: "point-cloud",
        code: "3.1",
        name: "Point cloud processing",
        owner: "Survey",
        status: "Planned",
        progress: 0,
        start: "2026-06-14",
        end: "2026-06-18",
        subtasks: [
          { id: "photo-alignment", code: "3.1.1", name: "Photo alignment and dense cloud", owner: "Survey", status: "Planned", progress: 0, start: "2026-06-14", end: "2026-06-16" },
          { id: "cloud-cleanup", code: "3.1.2", name: "Point cloud cleanup", owner: "Survey", status: "Planned", progress: 0, start: "2026-06-17", end: "2026-06-18" },
        ],
      },
      {
        id: "topographic-plan",
        code: "3.2",
        name: "Topographic plan issue",
        owner: "Survey",
        status: "Planned",
        progress: 0,
        start: "2026-06-19",
        end: "2026-06-24",
        subtasks: [
          { id: "contour-drawing", code: "3.2.1", name: "Contour and feature drawing", owner: "Survey", status: "Planned", progress: 0, start: "2026-06-19", end: "2026-06-22" },
          { id: "survey-qa", code: "3.2.2", name: "Survey QA review", owner: "QA/QC", status: "Planned", progress: 0, start: "2026-06-23", end: "2026-06-24" },
        ],
      },
      {
        id: "survey-report",
        code: "3.3",
        name: "Final survey report and handover",
        owner: "Survey",
        status: "Planned",
        progress: 0,
        start: "2026-06-25",
        end: "2026-06-28",
        subtasks: [
          { id: "report-draft", code: "3.3.1", name: "Draft survey report", owner: "Survey", status: "Planned", progress: 0, start: "2026-06-25", end: "2026-06-26" },
          { id: "report-issue", code: "3.3.2", name: "Client issue package", owner: "Planning", status: "Planned", progress: 0, start: "2026-06-27", end: "2026-06-28" },
        ],
      },
    ],
  },
];

const facilityManagementTemplatePackages: PlanningPackage[] = [
  {
    id: "handover-setup",
    code: "1",
    name: "Handover Setup",
    owner: "Facilities",
    status: "On Track",
    progress: 48,
    start: "2026-05-14",
    end: "2026-05-31",
    tasks: [
      {
        id: "asset-register",
        code: "1.1",
        name: "Asset register creation",
        owner: "Facilities",
        status: "On Track",
        progress: 60,
        start: "2026-05-14",
        end: "2026-05-20",
        subtasks: [
          { id: "asset-tagging", code: "1.1.1", name: "Asset tagging format", owner: "Facilities", status: "Completed", progress: 100, start: "2026-05-14", end: "2026-05-15" },
          { id: "equipment-capture", code: "1.1.2", name: "Equipment data capture", owner: "MEP", status: "On Track", progress: 45, start: "2026-05-16", end: "2026-05-20" },
        ],
      },
      {
        id: "om-docs",
        code: "1.2",
        name: "O&M documentation collection",
        owner: "Facilities",
        status: "At Risk",
        progress: 35,
        start: "2026-05-21",
        end: "2026-05-27",
        bufferDays: 2,
        bufferReason: "Approval Risk",
        bufferType: "Feeding Buffer",
        bufferVisible: true,
        subtasks: [
          { id: "manual-collection", code: "1.2.1", name: "Manual and warranty collection", owner: "Facilities", status: "At Risk", progress: 30, start: "2026-05-21", end: "2026-05-24" },
          { id: "doc-indexing", code: "1.2.2", name: "Document indexing", owner: "Planning", status: "Planned", progress: 0, start: "2026-05-25", end: "2026-05-27" },
        ],
      },
      {
        id: "warranty-log",
        code: "1.3",
        name: "Warranty and AMC log setup",
        owner: "Facilities",
        status: "Planned",
        progress: 10,
        start: "2026-05-28",
        end: "2026-05-31",
        subtasks: [
          { id: "vendor-warranty", code: "1.3.1", name: "Vendor warranty mapping", owner: "Procurement", status: "Planned", progress: 10, start: "2026-05-28", end: "2026-05-29" },
          { id: "amc-calendar", code: "1.3.2", name: "AMC calendar setup", owner: "Facilities", status: "Planned", progress: 0, start: "2026-05-30", end: "2026-05-31" },
        ],
      },
    ],
  },
  {
    id: "preventive-maintenance",
    code: "2",
    name: "Preventive Maintenance",
    owner: "Facilities",
    status: "Planned",
    progress: 18,
    start: "2026-06-01",
    end: "2026-06-24",
    tasks: [
      {
        id: "mep-inspection",
        code: "2.1",
        name: "MEP inspection cycle",
        owner: "MEP",
        status: "On Track",
        progress: 35,
        start: "2026-06-01",
        end: "2026-06-08",
        subtasks: [
          { id: "hvac-check", code: "2.1.1", name: "HVAC system inspection", owner: "MEP", status: "On Track", progress: 45, start: "2026-06-01", end: "2026-06-04" },
          { id: "electrical-check", code: "2.1.2", name: "Electrical panel inspection", owner: "MEP", status: "Planned", progress: 0, start: "2026-06-05", end: "2026-06-08" },
        ],
      },
      {
        id: "safety-system",
        code: "2.2",
        name: "Safety system testing",
        owner: "QA/QC",
        status: "Planned",
        progress: 15,
        start: "2026-06-09",
        end: "2026-06-16",
        subtasks: [
          { id: "fire-alarm", code: "2.2.1", name: "Fire alarm test", owner: "QA/QC", status: "Planned", progress: 10, start: "2026-06-09", end: "2026-06-11" },
          { id: "emergency-lighting", code: "2.2.2", name: "Emergency lighting test", owner: "QA/QC", status: "Planned", progress: 0, start: "2026-06-12", end: "2026-06-16" },
        ],
      },
      {
        id: "cleaning-schedule",
        code: "2.3",
        name: "Cleaning and soft service schedule",
        owner: "Facilities",
        status: "Planned",
        progress: 0,
        start: "2026-06-17",
        end: "2026-06-24",
        subtasks: [
          { id: "zone-cleaning", code: "2.3.1", name: "Zone-wise cleaning plan", owner: "Facilities", status: "Planned", progress: 0, start: "2026-06-17", end: "2026-06-20" },
          { id: "vendor-roster", code: "2.3.2", name: "Soft service vendor roster", owner: "Procurement", status: "Planned", progress: 0, start: "2026-06-21", end: "2026-06-24" },
        ],
      },
    ],
  },
  {
    id: "operations-compliance",
    code: "3",
    name: "Operations & Compliance",
    owner: "Facilities",
    status: "Planned",
    progress: 5,
    start: "2026-06-25",
    end: "2026-07-14",
    tasks: [
      {
        id: "tenant-helpdesk",
        code: "3.1",
        name: "Tenant helpdesk workflow",
        owner: "Facilities",
        status: "Planned",
        progress: 10,
        start: "2026-06-25",
        end: "2026-06-30",
        subtasks: [
          { id: "ticket-category", code: "3.1.1", name: "Ticket category setup", owner: "Facilities", status: "Planned", progress: 10, start: "2026-06-25", end: "2026-06-27" },
          { id: "sla-matrix", code: "3.1.2", name: "SLA matrix approval", owner: "Planning", status: "Planned", progress: 0, start: "2026-06-28", end: "2026-06-30" },
        ],
      },
      {
        id: "compliance-audit",
        code: "3.2",
        name: "Compliance audit calendar",
        owner: "QA/QC",
        status: "Planned",
        progress: 0,
        start: "2026-07-01",
        end: "2026-07-07",
        subtasks: [
          { id: "statutory-list", code: "3.2.1", name: "Statutory compliance list", owner: "QA/QC", status: "Planned", progress: 0, start: "2026-07-01", end: "2026-07-03" },
          { id: "audit-calendar", code: "3.2.2", name: "Audit calendar issue", owner: "QA/QC", status: "Planned", progress: 0, start: "2026-07-04", end: "2026-07-07" },
        ],
      },
      {
        id: "energy-monitoring",
        code: "3.3",
        name: "Energy monitoring setup",
        owner: "MEP",
        status: "Planned",
        progress: 0,
        start: "2026-07-08",
        end: "2026-07-14",
        subtasks: [
          { id: "meter-mapping", code: "3.3.1", name: "Meter mapping", owner: "MEP", status: "Planned", progress: 0, start: "2026-07-08", end: "2026-07-10" },
          { id: "dashboard-setup", code: "3.3.2", name: "Energy dashboard setup", owner: "MEP", status: "Planned", progress: 0, start: "2026-07-11", end: "2026-07-14" },
        ],
      },
    ],
  },
];

const bimExecutionPlanningTemplatePackages: PlanningPackage[] = [
  {
    id: "bep-initiation",
    code: "1",
    name: "BEP Initiation & Requirements",
    owner: "BIM",
    status: "On Track",
    progress: 64,
    start: "2026-05-14",
    end: "2026-05-27",
    tasks: [
      {
        id: "eir-review",
        code: "1.1",
        name: "EIR and client requirement review",
        owner: "BIM",
        status: "Completed",
        progress: 100,
        start: "2026-05-14",
        end: "2026-05-16",
        subtasks: [
          { id: "eir-register", code: "1.1.1", name: "Extract BIM requirements register", owner: "BIM", status: "Completed", progress: 100, start: "2026-05-14", end: "2026-05-15" },
          { id: "deliverable-map", code: "1.1.2", name: "Map model and data deliverables", owner: "BIM", status: "Completed", progress: 100, start: "2026-05-15", end: "2026-05-16" },
        ],
      },
      {
        id: "bep-kickoff",
        code: "1.2",
        name: "BEP kickoff and responsibility matrix",
        owner: "BIM",
        status: "On Track",
        progress: 70,
        start: "2026-05-17",
        end: "2026-05-22",
        subtasks: [
          { id: "bim-roles", code: "1.2.1", name: "Define BIM roles and RACI", owner: "BIM", status: "On Track", progress: 80, start: "2026-05-17", end: "2026-05-19" },
          { id: "coordination-calendar", code: "1.2.2", name: "Set coordination calendar", owner: "Planning", status: "On Track", progress: 60, start: "2026-05-20", end: "2026-05-22" },
        ],
      },
      {
        id: "cde-setup",
        code: "1.3",
        name: "CDE workflow and access setup",
        owner: "Document Control",
        status: "At Risk",
        progress: 35,
        start: "2026-05-23",
        end: "2026-05-27",
        bufferDays: 2,
        bufferReason: "Approval Risk",
        bufferType: "Task Buffer",
        bufferVisible: true,
        subtasks: [
          { id: "folder-permissions", code: "1.3.1", name: "CDE folder permissions", owner: "Document Control", status: "On Track", progress: 55, start: "2026-05-23", end: "2026-05-25" },
          { id: "approval-states", code: "1.3.2", name: "Model approval states", owner: "BIM", status: "At Risk", progress: 20, start: "2026-05-26", end: "2026-05-27" },
        ],
      },
    ],
  },
  {
    id: "bim-standards-setup",
    code: "2",
    name: "BIM Standards & Model Setup",
    owner: "BIM",
    status: "On Track",
    progress: 46,
    start: "2026-05-28",
    end: "2026-06-14",
    tasks: [
      {
        id: "lod-matrix",
        code: "2.1",
        name: "LOD matrix and information requirements",
        owner: "BIM",
        status: "On Track",
        progress: 58,
        start: "2026-05-28",
        end: "2026-06-02",
        subtasks: [
          { id: "stage-lod", code: "2.1.1", name: "Stage-wise LOD definition", owner: "BIM", status: "On Track", progress: 70, start: "2026-05-28", end: "2026-05-30" },
          { id: "asset-parameters", code: "2.1.2", name: "Asset parameter schedule", owner: "BIM", status: "On Track", progress: 45, start: "2026-05-31", end: "2026-06-02" },
        ],
      },
      {
        id: "model-templates",
        code: "2.2",
        name: "Model templates, coordinates, and grids",
        owner: "BIM",
        status: "On Track",
        progress: 44,
        start: "2026-06-03",
        end: "2026-06-09",
        subtasks: [
          { id: "shared-coordinates", code: "2.2.1", name: "Shared coordinates and levels", owner: "BIM", status: "On Track", progress: 55, start: "2026-06-03", end: "2026-06-05" },
          { id: "template-publish", code: "2.2.2", name: "Discipline template publish", owner: "BIM", status: "Planned", progress: 25, start: "2026-06-06", end: "2026-06-09" },
        ],
      },
      {
        id: "naming-standards",
        code: "2.3",
        name: "Naming, coding, and revision rules",
        owner: "Document Control",
        status: "Planned",
        progress: 20,
        start: "2026-06-10",
        end: "2026-06-14",
        subtasks: [
          { id: "model-naming", code: "2.3.1", name: "Model naming convention", owner: "Document Control", status: "Planned", progress: 15, start: "2026-06-10", end: "2026-06-12" },
          { id: "revision-workflow", code: "2.3.2", name: "Revision and status workflow", owner: "Document Control", status: "Planned", progress: 0, start: "2026-06-13", end: "2026-06-14" },
        ],
      },
    ],
  },
  {
    id: "discipline-model-development",
    code: "3",
    name: "Discipline Model Development",
    owner: "BIM",
    status: "Planned",
    progress: 18,
    start: "2026-06-15",
    end: "2026-07-12",
    tasks: [
      {
        id: "architecture-model",
        code: "3.1",
        name: "Architecture baseline model",
        owner: "BIM",
        status: "Planned",
        progress: 25,
        start: "2026-06-15",
        end: "2026-06-24",
        subtasks: [
          { id: "arch-shell", code: "3.1.1", name: "Core, shell, and levels model", owner: "BIM", status: "Planned", progress: 25, start: "2026-06-15", end: "2026-06-20" },
          { id: "arch-rooms", code: "3.1.2", name: "Room and finish data", owner: "BIM", status: "Planned", progress: 10, start: "2026-06-21", end: "2026-06-24" },
        ],
      },
      {
        id: "structure-model",
        code: "3.2",
        name: "Structural model federation-ready issue",
        owner: "BIM",
        status: "Planned",
        progress: 15,
        start: "2026-06-25",
        end: "2026-07-03",
        subtasks: [
          { id: "structure-frame", code: "3.2.1", name: "Frame and slab model", owner: "BIM", status: "Planned", progress: 15, start: "2026-06-25", end: "2026-06-30" },
          { id: "opening-coordination", code: "3.2.2", name: "Opening and embed coordination", owner: "BIM", status: "Planned", progress: 0, start: "2026-07-01", end: "2026-07-03" },
        ],
      },
      {
        id: "mep-model",
        code: "3.3",
        name: "MEP model baseline issue",
        owner: "MEP",
        status: "Planned",
        progress: 8,
        start: "2026-07-04",
        end: "2026-07-12",
        subtasks: [
          { id: "mep-routes", code: "3.3.1", name: "Main services routing", owner: "MEP", status: "Planned", progress: 5, start: "2026-07-04", end: "2026-07-08" },
          { id: "mep-clearances", code: "3.3.2", name: "Clearance zones and access space", owner: "MEP", status: "Planned", progress: 0, start: "2026-07-09", end: "2026-07-12" },
        ],
      },
    ],
  },
  {
    id: "coordination-clash-management",
    code: "4",
    name: "Coordination & Clash Management",
    owner: "BIM",
    status: "Planned",
    progress: 8,
    start: "2026-07-13",
    end: "2026-08-07",
    tasks: [
      {
        id: "federated-model",
        code: "4.1",
        name: "Federated model setup",
        owner: "BIM",
        status: "Planned",
        progress: 10,
        start: "2026-07-13",
        end: "2026-07-17",
        subtasks: [
          { id: "model-federation", code: "4.1.1", name: "Federate discipline models", owner: "BIM", status: "Planned", progress: 10, start: "2026-07-13", end: "2026-07-15" },
          { id: "model-health", code: "4.1.2", name: "Model health and audit report", owner: "BIM", status: "Planned", progress: 0, start: "2026-07-16", end: "2026-07-17" },
        ],
      },
      {
        id: "clash-rules",
        code: "4.2",
        name: "Clash matrix and tolerance rules",
        owner: "BIM",
        status: "Planned",
        progress: 5,
        start: "2026-07-18",
        end: "2026-07-23",
        subtasks: [
          { id: "hard-soft-clash", code: "4.2.1", name: "Hard and soft clash rules", owner: "BIM", status: "Planned", progress: 0, start: "2026-07-18", end: "2026-07-20" },
          { id: "priority-matrix", code: "4.2.2", name: "Priority and ownership matrix", owner: "BIM", status: "Planned", progress: 0, start: "2026-07-21", end: "2026-07-23" },
        ],
      },
      {
        id: "coordination-cycles",
        code: "4.3",
        name: "Coordination cycles and issue closure",
        owner: "BIM",
        status: "Planned",
        progress: 0,
        start: "2026-07-24",
        end: "2026-08-07",
        bufferDays: 3,
        bufferReason: "Approval Risk",
        bufferType: "Feeding Buffer",
        bufferVisible: true,
        subtasks: [
          { id: "cycle-one", code: "4.3.1", name: "Coordination cycle 01", owner: "BIM", status: "Planned", progress: 0, start: "2026-07-24", end: "2026-07-30" },
          { id: "cycle-two", code: "4.3.2", name: "Coordination cycle 02 and closure", owner: "BIM", status: "Planned", progress: 0, start: "2026-07-31", end: "2026-08-07" },
        ],
      },
    ],
  },
  {
    id: "bim-deliverables-handover",
    code: "5",
    name: "BIM Deliverables & Handover",
    owner: "BIM",
    status: "Planned",
    progress: 0,
    start: "2026-08-08",
    end: "2026-08-24",
    tasks: [
      {
        id: "drawing-extracts",
        code: "5.1",
        name: "Drawing extracts and model QA",
        owner: "BIM",
        status: "Planned",
        progress: 0,
        start: "2026-08-08",
        end: "2026-08-13",
        subtasks: [
          { id: "sheet-extracts", code: "5.1.1", name: "Sheet extract validation", owner: "BIM", status: "Planned", progress: 0, start: "2026-08-08", end: "2026-08-10" },
          { id: "qa-checklist", code: "5.1.2", name: "Model QA checklist closure", owner: "QA/QC", status: "Planned", progress: 0, start: "2026-08-11", end: "2026-08-13" },
        ],
      },
      {
        id: "asset-data",
        code: "5.2",
        name: "Asset data and COBie-style schedule",
        owner: "BIM",
        status: "Planned",
        progress: 0,
        start: "2026-08-14",
        end: "2026-08-19",
        subtasks: [
          { id: "asset-attributes", code: "5.2.1", name: "Asset attribute population", owner: "BIM", status: "Planned", progress: 0, start: "2026-08-14", end: "2026-08-16" },
          { id: "data-validation", code: "5.2.2", name: "Asset data validation", owner: "Facilities", status: "Planned", progress: 0, start: "2026-08-17", end: "2026-08-19" },
        ],
      },
      {
        id: "handover-package",
        code: "5.3",
        name: "BIM handover package",
        owner: "BIM",
        status: "Planned",
        progress: 0,
        start: "2026-08-20",
        end: "2026-08-24",
        subtasks: [
          { id: "native-ifc-export", code: "5.3.1", name: "Native and IFC export", owner: "BIM", status: "Planned", progress: 0, start: "2026-08-20", end: "2026-08-22" },
          { id: "handover-index", code: "5.3.2", name: "Handover index and transmittal", owner: "Document Control", status: "Planned", progress: 0, start: "2026-08-23", end: "2026-08-24" },
        ],
      },
    ],
  },
];

type BepSubtaskSeed = {
  name: string;
  responsible?: string;
  status?: PlanningStatus;
  output?: string;
};

type BepTaskSeed = {
  id: string;
  code: string;
  name: string;
  start: string;
  end: string;
  actual?: number;
  float?: number;
  constraint: string;
  dependencyText: string;
  responsible: string;
  status: PlanningStatus;
  progress: number;
  bepSection: string;
  output: string;
  subtasks: BepSubtaskSeed[];
};

function makeBepTask(seed: BepTaskSeed): PlanningTask {
  const taskDays = planDaysBetween(seed.start, seed.end);
  return {
    id: seed.id,
    code: seed.code,
    name: seed.name,
    owner: seed.responsible,
    responsible: seed.responsible,
    status: seed.status,
    progress: seed.progress,
    actual: seed.actual ?? 0,
    float: seed.float ?? 0,
    constraint: seed.constraint,
    dependencyText: seed.dependencyText,
    bepSection: seed.bepSection,
    output: seed.output,
    start: seed.start,
    end: seed.end,
    subtasks: seed.subtasks.map((subtask, index) => {
      const offset = Math.min(index, Math.max(0, taskDays - 1));
      const subtaskStart = addPlanDays(seed.start, offset);
      const subtaskEnd = addPlanDays(subtaskStart, Math.min(1, Math.max(0, taskDays - offset - 1)));
      return {
        id: `${seed.id}-${index + 1}`,
        code: `${seed.code}.${index + 1}`,
        name: subtask.name,
        owner: subtask.responsible ?? seed.responsible,
        responsible: subtask.responsible ?? seed.responsible,
        status: subtask.status ?? seed.status,
        progress: subtask.status === "Completed" ? 100 : seed.progress,
        start: subtaskStart,
        end: subtaskEnd,
        actual: 0,
        float: seed.float ?? 0,
        constraint: seed.constraint,
        dependencyText: seed.dependencyText,
        bepSection: seed.bepSection,
        output: subtask.output ?? seed.output,
      };
    }),
  };
}

function makeBepPackage(input: {
  id: string;
  code: string;
  name: string;
  progress: number;
  start: string;
  end: string;
  displayTaskCount: number;
  displaySubtaskCount: number;
  tasks: BepTaskSeed[];
}): PlanningPackage {
  return {
    id: input.id,
    code: input.code,
    name: input.name,
    owner: "BIM Manager",
    responsible: "BIM Manager",
    status: input.progress === 0 ? "Pending" : input.progress < 20 ? "At Risk" : "On Track",
    progress: input.progress,
    start: input.start,
    end: input.end,
    displayTaskCount: input.displayTaskCount,
    displaySubtaskCount: input.displaySubtaskCount,
    tasks: input.tasks.map(makeBepTask),
  };
}

const completeBepTemplatePackages: PlanningPackage[] = [
  makeBepPackage({
    id: "phase-1",
    code: "1",
    name: "BEP Document Initiation",
    progress: 0,
    start: "2026-05-14",
    end: "2026-05-17",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-1-1",
        code: "1.1",
        name: "Create BEP cover and document identity",
        start: "2026-05-14",
        end: "2026-05-17",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add project name" },
          { name: "Add contractor name" },
          { name: "Add BIM consultant name" },
          { name: "Add date, revision number, and document status" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-2",
    code: "2",
    name: "Revision History and Sign-off",
    progress: 0,
    start: "2026-05-18",
    end: "2026-05-21",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-2-1",
        code: "2.1",
        name: "Prepare revision history",
        start: "2026-05-18",
        end: "2026-05-21",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add revision number" },
          { name: "Add revision date" },
          { name: "Add revision author" },
          { name: "Add revision description" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-3",
    code: "3",
    name: "Glossary and Abbreviation Setup",
    progress: 0,
    start: "2026-05-22",
    end: "2026-05-26",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-3-1",
        code: "3.1",
        name: "Add BIM terminology",
        start: "2026-05-22",
        end: "2026-05-26",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add BEP definition" },
          { name: "Add BIM definition" },
          { name: "Add CDE definition" },
          { name: "Add LOD definition" },
          { name: "Add LOG definition" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-4",
    code: "4",
    name: "BEP Introduction and Objective",
    progress: 0,
    start: "2026-05-27",
    end: "2026-05-30",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-4-1",
        code: "4.1",
        name: "Define BEP objective",
        start: "2026-05-27",
        end: "2026-05-30",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Define BIM implementation purpose" },
          { name: "Define VDC execution process" },
          { name: "Define BIM lifecycle usage" },
          { name: "Define team understanding goals" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-5",
    code: "5",
    name: "BEP Scope and Project Phase Coverage",
    progress: 0,
    start: "2026-05-31",
    end: "2026-06-03",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-5-1",
        code: "5.1",
        name: "Define BEP scope",
        start: "2026-05-31",
        end: "2026-06-03",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Identify included project phases" },
          { name: "Identify excluded phases" },
          { name: "Confirm baseline model availability" },
          { name: "Confirm use of preceding phase models" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-6",
    code: "6",
    name: "Reference Standards Setup",
    progress: 0,
    start: "2026-06-04",
    end: "2026-06-07",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-6-1",
        code: "6.1",
        name: "Register BIM standards",
        start: "2026-06-04",
        end: "2026-06-07",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add Singapore BIM Guide" },
          { name: "Add BCA CORENET X requirements" },
          { name: "Add SS ISO 19650 series" },
          { name: "Add ISO 16739 IFC standard" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-7",
    code: "7",
    name: "Project Information Setup",
    progress: 0,
    start: "2026-06-08",
    end: "2026-06-11",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-7-1",
        code: "7.1",
        name: "Add project details",
        start: "2026-06-08",
        end: "2026-06-11",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add project name" },
          { name: "Add project address" },
          { name: "Add project description" },
          { name: "Add owner or employer name" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-8",
    code: "8",
    name: "Key Project Contacts",
    progress: 0,
    start: "2026-06-12",
    end: "2026-06-15",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-8-1",
        code: "8.1",
        name: "Add BIM team contacts",
        start: "2026-06-12",
        end: "2026-06-15",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add BIM Manager contact" },
          { name: "Add Model Responsible contact" },
          { name: "Add BIM Lead Coordinator contact" },
          { name: "Add discipline BIM coordinator contacts" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-9",
    code: "9",
    name: "Software and Technology Setup",
    progress: 0,
    start: "2026-06-16",
    end: "2026-06-19",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-9-1",
        code: "9.1",
        name: "Define primary BIM software",
        start: "2026-06-16",
        end: "2026-06-19",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Set Autodesk Revit as primary authoring software" },
          { name: "Define closed BIM ecosystem" },
          { name: "Define IFC usage for exchange" },
          { name: "Define IFC+SG usage for CORENET X" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-10",
    code: "10",
    name: "Platform Strategy",
    progress: 0,
    start: "2026-06-20",
    end: "2026-06-23",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-10-1",
        code: "10.1",
        name: "Define ACC usage",
        start: "2026-06-20",
        end: "2026-06-23",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Use ACC as Common Data Environment" },
          { name: "Use ACC for document management" },
          { name: "Use ACC for model hosting" },
          { name: "Use ACC for transmittals" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-11",
    code: "11",
    name: "VDC and BIM Goals",
    progress: 0,
    start: "2026-06-24",
    end: "2026-06-27",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-11-1",
        code: "11.1",
        name: "Define strategic BIM goals",
        start: "2026-06-24",
        end: "2026-06-27",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Improve project documentation" },
          { name: "Improve estimation workflow" },
          { name: "Improve design coordination" },
          { name: "Improve building lifecycle analysis" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-12",
    code: "12",
    name: "BIM Use Case Mapping",
    progress: 0,
    start: "2026-06-28",
    end: "2026-07-01",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-12-1",
        code: "12.1",
        name: "Map construction documentation use cases",
        start: "2026-06-28",
        end: "2026-07-01",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add 3D coordination use case" },
          { name: "Add 2D drawing generation use case" },
          { name: "Add quantity take-off use case" },
          { name: "Add model-based BOQ use case" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-13",
    code: "13",
    name: "Sub-contractor BIM Integration",
    progress: 0,
    start: "2026-07-02",
    end: "2026-07-09",
    displayTaskCount: 2,
    displaySubtaskCount: 8,
    tasks: [
      {
        id: "task-13-1",
        code: "13.1",
        name: "Define subcontractor submission requirements",
        start: "2026-07-02",
        end: "2026-07-05",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Collect IFC submissions" },
          { name: "Collect DWG submissions" },
          { name: "Collect shop drawings" },
          { name: "Collect product data sheets" },
        ],
      },
      {
        id: "task-13-2",
        code: "13.2",
        name: "Define subcontractor coordination process",
        start: "2026-07-06",
        end: "2026-07-09",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Include subcontractors in BIM coordination meetings" },
          { name: "Track subcontractor BIM inputs" },
          { name: "Verify subcontractor data against federated model" },
          { name: "Assign issues to subcontractors when required" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-14",
    code: "14",
    name: "LOD Progression",
    progress: 0,
    start: "2026-07-10",
    end: "2026-07-12",
    displayTaskCount: 1,
    displaySubtaskCount: 3,
    tasks: [
      {
        id: "task-14-1",
        code: "14.1",
        name: "Define phase-wise LOD targets",
        start: "2026-07-10",
        end: "2026-07-12",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Define Construction Documentation as LOD 300" },
          { name: "Define Construction as LOD 350" },
          { name: "Define As-Built and Handover as LOD 400" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-15",
    code: "15",
    name: "LOD Responsibility Setup",
    progress: 0,
    start: "2026-07-13",
    end: "2026-07-18",
    displayTaskCount: 2,
    displaySubtaskCount: 6,
    tasks: [
      {
        id: "task-15-1",
        code: "15.1",
        name: "Define design-phase LOD ownership",
        start: "2026-07-13",
        end: "2026-07-15",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Assign LOD 300 model owner" },
          { name: "Assign discipline model authors" },
          { name: "Confirm design-phase model review process" },
        ],
      },
      {
        id: "task-15-2",
        code: "15.2",
        name: "Define construction-phase LOD ownership",
        start: "2026-07-16",
        end: "2026-07-18",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Assign LOD 350 model owner" },
          { name: "Assign subcontractor input coordination responsibility" },
          { name: "Confirm shop drawing model integration" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-16",
    code: "16",
    name: "BIM Deliverables Planning",
    progress: 0,
    start: "2026-07-19",
    end: "2026-07-23",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-16-1",
        code: "16.1",
        name: "Define model deliverables",
        start: "2026-07-19",
        end: "2026-07-23",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Define construction documentation model" },
          { name: "Define construction progress model" },
          { name: "Define federated coordination model" },
          { name: "Define IFC+SG submission model" },
          { name: "Define as-built model" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-17",
    code: "17",
    name: "MIDP Setup",
    progress: 0,
    start: "2026-07-24",
    end: "2026-07-28",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-17-1",
        code: "17.1",
        name: "Create Master Information Delivery Plan",
        start: "2026-07-24",
        end: "2026-07-28",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add discipline field" },
          { name: "Add deliverable field" },
          { name: "Add responsible party field" },
          { name: "Add planned date field" },
          { name: "Add status field" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-18",
    code: "18",
    name: "As-Built and FM Deliverables",
    progress: 0,
    start: "2026-07-29",
    end: "2026-08-01",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-18-1",
        code: "18.1",
        name: "Prepare as-built model requirements",
        start: "2026-07-29",
        end: "2026-08-01",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Revise released models based on updated documentation" },
          { name: "Develop models to LOD 400" },
          { name: "Verify model accuracy against site conditions" },
          { name: "Conduct model verification walkthrough" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-19",
    code: "19",
    name: "Deliverable QA",
    progress: 0,
    start: "2026-08-02",
    end: "2026-08-06",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-19-1",
        code: "19.1",
        name: "Define deliverable quality checks",
        start: "2026-08-02",
        end: "2026-08-06",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Run model audit before each milestone" },
          { name: "Validate model properties" },
          { name: "Check IFC property mapping" },
          { name: "Check classification codes" },
          { name: "Check data completeness" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-20",
    code: "20",
    name: "Ownership and Rights",
    progress: 0,
    start: "2026-08-07",
    end: "2026-08-09",
    displayTaskCount: 1,
    displaySubtaskCount: 3,
    tasks: [
      {
        id: "task-20-1",
        code: "20.1",
        name: "Define deliverable ownership",
        start: "2026-08-07",
        end: "2026-08-09",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Assign ownership of BIM deliverables to Employer" },
          { name: "Define employer usage rights" },
          { name: "Define rights for appointed agents" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-21",
    code: "21",
    name: "Data Exchange Protocol",
    progress: 0,
    start: "2026-08-10",
    end: "2026-08-14",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-21-1",
        code: "21.1",
        name: "Define exchange formats",
        start: "2026-08-10",
        end: "2026-08-14",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Define RVT purpose and recipients" },
          { name: "Define IFC+SG purpose and recipients" },
          { name: "Define NWD purpose and recipients" },
          { name: "Define PDF purpose and recipients" },
          { name: "Define DWG purpose and recipients" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-22",
    code: "22",
    name: "CDE Setup",
    progress: 0,
    start: "2026-08-15",
    end: "2026-08-19",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-22-1",
        code: "22.1",
        name: "Configure ACC CDE",
        start: "2026-08-15",
        end: "2026-08-19",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Create dedicated project hub" },
          { name: "Configure discipline-based folders" },
          { name: "Configure role-based permissions" },
          { name: "Configure automated notifications" },
          { name: "Configure issue type taxonomy" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-23",
    code: "23",
    name: "BIM Roles and Responsibility Setup",
    progress: 0,
    start: "2026-08-20",
    end: "2026-08-23",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-23-1",
        code: "23.1",
        name: "Assign BIM management roles",
        start: "2026-08-20",
        end: "2026-08-23",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Assign BIM Manager" },
          { name: "Assign Model Responsible" },
          { name: "Assign BIM Lead Coordinator" },
          { name: "Assign Contractor BIM Representative" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-24",
    code: "24",
    name: "Responsibility Matrix",
    progress: 0,
    start: "2026-08-24",
    end: "2026-08-31",
    displayTaskCount: 2,
    displaySubtaskCount: 8,
    tasks: [
      {
        id: "task-24-1",
        code: "24.1",
        name: "Map construction documentation responsibilities",
        start: "2026-08-24",
        end: "2026-08-27",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Map coordinated model author" },
          { name: "Map model users" },
          { name: "Map 2D drawing author" },
          { name: "Map clash report author" },
        ],
      },
      {
        id: "task-24-2",
        code: "24.2",
        name: "Map construction responsibilities",
        start: "2026-08-28",
        end: "2026-08-31",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Map construction progress model author" },
          { name: "Map quantity report author" },
          { name: "Map material schedule author" },
          { name: "Map site logistics model author" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-25",
    code: "25",
    name: "Model Ownership Matrix",
    progress: 0,
    start: "2026-09-01",
    end: "2026-09-09",
    displayTaskCount: 2,
    displaySubtaskCount: 9,
    tasks: [
      {
        id: "task-25-1",
        code: "25.1",
        name: "Define model ownership by discipline",
        start: "2026-09-01",
        end: "2026-09-05",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Define architectural model owner" },
          { name: "Define structural model owner" },
          { name: "Define HVAC model owner" },
          { name: "Define electrical model owner" },
          { name: "Define plumbing model owner" },
        ],
      },
      {
        id: "task-25-2",
        code: "25.2",
        name: "Define model ownership by phase",
        start: "2026-09-06",
        end: "2026-09-09",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Define construction documentation owner" },
          { name: "Define construction phase owner" },
          { name: "Define handover owner" },
          { name: "Define federated model owner" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-26",
    code: "26",
    name: "BIM Coordination Workflow",
    progress: 0,
    start: "2026-09-10",
    end: "2026-09-13",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-26-1",
        code: "26.1",
        name: "Configure 3-stage coordination approach",
        start: "2026-09-10",
        end: "2026-09-13",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Stage 1 Architecture and Structure coordination" },
          { name: "Stage 2 MEP coordination" },
          { name: "Stage 3 Shop Drawing production" },
          { name: "Add coordination approval gate" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-27",
    code: "27",
    name: "Clash Detection Workflow",
    progress: 0,
    start: "2026-09-14",
    end: "2026-09-23",
    displayTaskCount: 2,
    displaySubtaskCount: 10,
    tasks: [
      {
        id: "task-27-1",
        code: "27.1",
        name: "Prepare clash detection process",
        start: "2026-09-14",
        end: "2026-09-17",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Export discipline models to ACC" },
          { name: "Prepare Navisworks federated file" },
          { name: "Run internal model quality checks" },
          { name: "Verify shared coordinates" },
        ],
      },
      {
        id: "task-27-2",
        code: "27.2",
        name: "Run clash detection",
        start: "2026-09-18",
        end: "2026-09-23",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Run clash tests weekly" },
          { name: "Categorise Critical clashes" },
          { name: "Categorise Major clashes" },
          { name: "Categorise Minor clashes" },
          { name: "Mark duplicate issues" },
          { name: "Mark non-issues as approved" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-28",
    code: "28",
    name: "Model Federation Strategy",
    progress: 0,
    start: "2026-09-24",
    end: "2026-09-27",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-28-1",
        code: "28.1",
        name: "Configure federated model process",
        start: "2026-09-24",
        end: "2026-09-27",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Export NWC from each central model" },
          { name: "Link NWC files into federated model" },
          { name: "Maintain master NWF file" },
          { name: "Publish NWD for review" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-29",
    code: "29",
    name: "Clash Test Matrix",
    progress: 0,
    start: "2026-09-28",
    end: "2026-10-03",
    displayTaskCount: 1,
    displaySubtaskCount: 6,
    tasks: [
      {
        id: "task-29-1",
        code: "29.1",
        name: "Add hard clash tests",
        start: "2026-09-28",
        end: "2026-10-03",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add Arch vs Structure test" },
          { name: "Add HVAC vs Structure test" },
          { name: "Add Electrical vs Structure test" },
          { name: "Add HVAC vs Electrical test" },
          { name: "Add Fire Protection vs All test" },
          { name: "Add Specialist Systems vs Architectural and Structural Elements test" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-30",
    code: "30",
    name: "Communication and RACI",
    progress: 0,
    start: "2026-10-04",
    end: "2026-10-08",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-30-1",
        code: "30.1",
        name: "Define communication protocol",
        start: "2026-10-04",
        end: "2026-10-08",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Use ACC for formal BIM communication" },
          { name: "Log coordination issues in ACC Issues" },
          { name: "Reference model location in BIM RFIs" },
          { name: "Respond to BIM RFIs within 5 working days" },
          { name: "Upload meeting minutes within 2 working days" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-31",
    code: "31",
    name: "CORENET X Submission Workflow",
    progress: 0,
    start: "2026-10-09",
    end: "2026-10-17",
    displayTaskCount: 2,
    displaySubtaskCount: 9,
    tasks: [
      {
        id: "task-31-1",
        code: "31.1",
        name: "Prepare CORENET X submission",
        start: "2026-10-09",
        end: "2026-10-12",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Prepare discipline models for IFC export" },
          { name: "Populate required property sets" },
          { name: "Verify classification codes" },
          { name: "Verify spatial structure" },
        ],
      },
      {
        id: "task-31-2",
        code: "31.2",
        name: "Export and validate IFC+SG",
        start: "2026-10-13",
        end: "2026-10-17",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Export IFC+SG from Revit" },
          { name: "Apply standard IFC export configuration" },
          { name: "Validate using Bimeco Validator" },
          { name: "Resolve validation failures" },
          { name: "Re-export and re-validate until clean" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-32",
    code: "32",
    name: "General Modelling Guidelines",
    progress: 0,
    start: "2026-10-18",
    end: "2026-10-21",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-32-1",
        code: "32.1",
        name: "Define modelling principles",
        start: "2026-10-18",
        end: "2026-10-21",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Model all elements at 1:1 scale" },
          { name: "Use standard naming conventions" },
          { name: "Use millimetres as model unit" },
          { name: "Follow Singapore BIM Guide requirements" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-33",
    code: "33",
    name: "Model Performance Targets",
    progress: 0,
    start: "2026-10-22",
    end: "2026-10-26",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-33-1",
        code: "33.1",
        name: "Configure model performance limits",
        start: "2026-10-22",
        end: "2026-10-26",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Set maximum discipline model file size to 300MB" },
          { name: "Set warning count target below 500" },
          { name: "Set ideal warning count below 200" },
          { name: "Set daily central file sync requirement" },
          { name: "Set weekly federated model update cycle" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-34",
    code: "34",
    name: "Model Structure and Naming",
    progress: 0,
    start: "2026-10-27",
    end: "2026-11-02",
    displayTaskCount: 1,
    displaySubtaskCount: 7,
    tasks: [
      {
        id: "task-34-1",
        code: "34.1",
        name: "Define sub-model organisation",
        start: "2026-10-27",
        end: "2026-11-02",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add ARCH discipline code" },
          { name: "Add STRU discipline code" },
          { name: "Add ACMV discipline code" },
          { name: "Add ELEC discipline code" },
          { name: "Add CCSM discipline code" },
          { name: "Add SITE discipline code" },
          { name: "Add optional PLMB, FIRE, LNSP, and INTD codes" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-35",
    code: "35",
    name: "Workset Strategy",
    progress: 0,
    start: "2026-11-03",
    end: "2026-11-07",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-35-1",
        code: "35.1",
        name: "Define workset naming",
        start: "2026-11-03",
        end: "2026-11-07",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Use Discipline-System format" },
          { name: "Add ARCH-Walls workset" },
          { name: "Add ACMV-Ductwork workset" },
          { name: "Add ELEC-Lighting workset" },
          { name: "Add system-specific MEP worksets" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-36",
    code: "36",
    name: "Coordinate System and Levels",
    progress: 0,
    start: "2026-11-08",
    end: "2026-11-13",
    displayTaskCount: 1,
    displaySubtaskCount: 6,
    tasks: [
      {
        id: "task-36-1",
        code: "36.1",
        name: "Configure coordinate system",
        start: "2026-11-08",
        end: "2026-11-13",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Adopt SVY21 coordinate system" },
          { name: "Set EPSG:3414 reference" },
          { name: "Define Project Base Point" },
          { name: "Set Survey Point to 0,0,0" },
          { name: "Verify cadastral survey data" },
          { name: "Use Auto - By Shared Coordinates for model linking" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-37",
    code: "37",
    name: "Model Audit and Review Schedule",
    progress: 0,
    start: "2026-11-14",
    end: "2026-11-18",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-37-1",
        code: "37.1",
        name: "Configure audit schedule",
        start: "2026-11-14",
        end: "2026-11-18",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Schedule weekly internal model check" },
          { name: "Schedule Bimeco Validator check before model release" },
          { name: "Schedule fortnightly BIM Manager audit" },
          { name: "Schedule pre-deliverable QA at each milestone" },
          { name: "Schedule CORENET X check before BCA submission" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-38",
    code: "38",
    name: "BIM KPI Tracking",
    progress: 0,
    start: "2026-11-19",
    end: "2026-11-23",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-38-1",
        code: "38.1",
        name: "Configure BIM KPIs",
        start: "2026-11-19",
        end: "2026-11-23",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Track clash resolution rate" },
          { name: "Track model compliance score" },
          { name: "Track deliverable on-time rate" },
          { name: "Track BIM-related RFI reduction" },
          { name: "Track model file size compliance" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-39",
    code: "39",
    name: "Information Security and Data Management",
    progress: 0,
    start: "2026-11-24",
    end: "2026-11-28",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-39-1",
        code: "39.1",
        name: "Configure access control",
        start: "2026-11-24",
        end: "2026-11-28",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Apply role-based access rights" },
          { name: "Follow least privilege principle" },
          { name: "Assign unique login to every participant" },
          { name: "Revoke access within 2 working days after departure" },
          { name: "Maintain access grant and revocation log" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-40",
    code: "40",
    name: "Training and Competency",
    progress: 0,
    start: "2026-11-29",
    end: "2026-12-03",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-40-1",
        code: "40.1",
        name: "Define competency requirements",
        start: "2026-11-29",
        end: "2026-12-03",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Define BIM Manager competency" },
          { name: "Define Model Responsible competency" },
          { name: "Define Discipline BIM Coordinator competency" },
          { name: "Define Contractor BIM Representative competency" },
          { name: "Define subcontractor representative competency" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-41",
    code: "41",
    name: "BEP Change Management",
    progress: 0,
    start: "2026-12-04",
    end: "2026-12-08",
    displayTaskCount: 1,
    displaySubtaskCount: 5,
    tasks: [
      {
        id: "task-41-1",
        code: "41.1",
        name: "Configure change request process",
        start: "2026-12-04",
        end: "2026-12-08",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Allow participants to submit written change requests" },
          { name: "Record change rationale" },
          { name: "BIM Manager reviews request" },
          { name: "Assess impact on workflows" },
          { name: "Consult affected parties for material changes" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-42",
    code: "42",
    name: "Model Archival and Closeout",
    progress: 0,
    start: "2026-12-09",
    end: "2026-12-12",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-42-1",
        code: "42.1",
        name: "Prepare final model package",
        start: "2026-12-09",
        end: "2026-12-12",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Include As-Built RVT files" },
          { name: "Include IFC exports" },
          { name: "Include federated NWD" },
          { name: "Include 2D PDF documentation" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-43",
    code: "43",
    name: "CDE Closeout and Decommissioning",
    progress: 0,
    start: "2026-12-13",
    end: "2026-12-16",
    displayTaskCount: 1,
    displaySubtaskCount: 4,
    tasks: [
      {
        id: "task-43-1",
        code: "43.1",
        name: "Close CDE project environment",
        start: "2026-12-13",
        end: "2026-12-16",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Set CDE to read-only after closeout" },
          { name: "Export final CDE folder content" },
          { name: "Verify archive completeness" },
          { name: "Remove inactive users" },
        ],
      },
    ],
  }),
  makeBepPackage({
    id: "phase-44",
    code: "44",
    name: "BIM Risk Register",
    progress: 0,
    start: "2026-12-17",
    end: "2026-12-27",
    displayTaskCount: 2,
    displaySubtaskCount: 11,
    tasks: [
      {
        id: "task-44-1",
        code: "44.1",
        name: "Create BIM risk register",
        start: "2026-12-17",
        end: "2026-12-22",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Add model corruption risk" },
          { name: "Add software version conflict risk" },
          { name: "Add subcontractor non-compliance risk" },
          { name: "Add coordinate misalignment risk" },
          { name: "Add IFC export error risk" },
          { name: "Add scope change impact risk" },
        ],
      },
      {
        id: "task-44-2",
        code: "44.2",
        name: "Track and mitigate risks",
        start: "2026-12-23",
        end: "2026-12-27",
        actual: 0,
        float: 0,
        constraint: "Flexible",
        dependencyText: "None",
        responsible: "BIM Manager",
        status: "Pending",
        progress: 0,
        bepSection: "",
        output: "",
        subtasks: [
          { name: "Assign risk owner" },
          { name: "Add mitigation action" },
          { name: "Add review date" },
          { name: "Add risk status" },
          { name: "Review risk register in BIM coordination meetings" },
        ],
      },
    ],
  }),
];

const planningTemplatePackages: Record<Exclude<PlanningTemplateKey, "new">, PlanningPackage[]> = {
  preconstruction: [initialPlanningPackages[0]],
  construction: initialPlanningPackages,
  bep: completeBepTemplatePackages,
  "site-survey": siteSurveyTemplatePackages,
  "facility-management": facilityManagementTemplatePackages,
};

const statusTheme: Record<PlanningStatus, { pill: string; color: string }> = {
  Completed: { pill: "border-emerald-100 bg-emerald-50 text-emerald-700", color: "#16845d" },
  "On Track": { pill: "border-teal-100 bg-teal-50 text-teal-700", color: "#0f766e" },
  "For Review": { pill: "border-blue-100 bg-blue-50 text-blue-700", color: "#2563eb" },
  "At Risk": { pill: "border-amber-100 bg-amber-50 text-amber-700", color: "#d97706" },
  Pending: { pill: "border-slate-200 bg-slate-50 text-slate-600", color: "#64748b" },
  Blocked: { pill: "border-red-100 bg-red-50 text-red-700", color: "#dc2626" },
  Delayed: { pill: "border-indigo-100 bg-indigo-50 text-indigo-700", color: "#5b6ee1" },
  Planned: { pill: "border-blue-100 bg-blue-50 text-blue-600", color: "#8ea3b7" },
};

const responsibleOptions = ["Planning", "BIM Manager", "Model Responsible", "Document Controller", "Contractor Project Manager", "Contractor BIM Representative", "CORENET X Submission Lead", "BIM", "Document Control", "Civil", "MEP", "QA/QC", "Procurement", "Survey", "Facilities"];
const statusOptions: PlanningStatus[] = ["Completed", "On Track", "For Review", "At Risk", "Pending", "Blocked"];
const constraintOptions = ["Flexible", "Fixed Start", "Fixed Finish", "Start After", "Finish Before"];
const dependencyTypes: DependencyType[] = ["FS", "SS", "FF", "SF"];
const bufferReasons: BufferReason[] = ["Weather Risk", "Approval Risk", "Procurement Risk", "Labor Risk", "Inspection Buffer", "Safety Margin", "Custom"];
const bufferTypes: BufferType[] = ["Project Buffer", "Feeding Buffer", "Task Buffer"];
const delayStatuses: DelayStatus[] = ["On Track", "Minor Delay", "Critical Delay", "Recovered"];
const delayReasons: DelayReason[] = ["Material Delay", "Labor Shortage", "Weather", "Approval Pending", "Equipment Failure", "Rework", "Client Change", "Site Access Issue", "Other"];
const scheduledActualStatuses: ScheduledActualStatus[] = ["Not Started", "Should Start Today", "In Progress", "On Track", "Behind Schedule", "Delayed", "Completed", "Completed Late", "Completed Early"];
const actualDateRanges: ActualDateRange[] = ["All Dates", "Today", "This Week", "Next 7 Days", "Overdue"];
const SCHEDULE_TODAY = toIsoDate(new Date());
const lookaheadCheckLabels: LookaheadCheckLabel[] = ["Drawings", "Materials", "Labor", "Equipment", "Access"];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function parsePlanDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addPlanDays(value: string, days: number) {
  const date = parsePlanDate(value);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function planDaysBetween(start: string, end: string) {
  return Math.max(1, Math.round((parsePlanDate(end).getTime() - parsePlanDate(start).getTime()) / 86400000) + 1);
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatPlanDate(value: string, compact = false) {
  return parsePlanDate(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: compact ? undefined : "numeric",
  });
}

function dateDiffDays(start: string, end: string) {
  return Math.round((parsePlanDate(end).getTime() - parsePlanDate(start).getTime()) / 86400000);
}

function planningActual(item: PlanningPackage | PlanningTask | PlanningSubtask) {
  if (item.actualStart && item.actualEnd) {
    return planDaysBetween(item.actualStart, item.actualEnd);
  }
  return Number(item.actual ?? 0);
}

function planningFloat(item: PlanningPackage | PlanningTask | PlanningSubtask) {
  if (item.float !== undefined && item.float !== null) {
    return Number(item.float);
  }
  if (item.status === "Completed") return 0;
  if (item.status === "Delayed") return -2;
  if (item.status === "At Risk") return 1;
  if (item.status === "Blocked") return 0;
  if (item.status === "For Review") return 2;
  if (item.status === "Pending") return 4;
  if (item.status === "Planned") return 5;
  return 3;
}

function planningConstraint(item: PlanningPackage | PlanningTask | PlanningSubtask) {
  if (item.constraint) return item.constraint;
  if (item.status === "Completed") return "Fixed Finish";
  if (item.status === "Delayed") return "Finish Before";
  if (item.status === "Blocked") return "Finish Before";
  if (item.status === "At Risk") return "Start After";
  return "Flexible";
}

function normalizeDependencies(dependencies?: Array<ScheduleDependency | string>) {
  return (dependencies ?? []).map((dependency, index) => {
    if (typeof dependency === "string") {
      return {
        id: `dep-${dependency}-${index}`,
        predecessorId: dependency,
        type: "FS" as DependencyType,
        lag: "",
      };
    }
    return {
      id: dependency.id || `dep-${dependency.predecessorId}-${index}`,
      predecessorId: dependency.predecessorId,
      type: dependency.type || "FS",
      lag: dependency.lag || "",
    };
  }).filter((dependency) => dependency.predecessorId);
}

function planningDependency(item: PlanningPackage | PlanningTask | PlanningSubtask, fallback = "None") {
  if (item.dependencyText) return item.dependencyText;
  const dependencies = normalizeDependencies(item.dependencies);
  return dependencies.length > 0
    ? dependencies.map((dependency) => `${dependency.type}${dependency.lag ? ` ${dependency.lag}` : ""} ${dependency.predecessorId}`).join(", ")
    : fallback;
}

function planningResponsible(item: PlanningPackage | PlanningTask | PlanningSubtask, planningPackage?: PlanningPackage) {
  return item.responsible || item.owner || planningPackage?.owner || "Planning";
}

function activityId(item: PlanningPackage | PlanningTask | PlanningSubtask) {
  return item.activityId || item.code || item.id;
}

function timelineColor(item: PlanningPackage | PlanningTask | PlanningSubtask) {
  return /^#[0-9a-f]{6}$/i.test(item.color || "") ? item.color! : statusTheme[item.status].color;
}

function parseLagDays(value: string) {
  const match = String(value || "").trim().match(/^([+-]?\d+)\s*d?$/i);
  return match ? Number(match[1]) : 0;
}

function bufferDays(item: Pick<PlanningSubtask, "bufferDays">) {
  return Math.max(0, Number(item.bufferDays || 0));
}

function bufferEndDate(item: PlanningPackage | PlanningTask | PlanningSubtask) {
  return bufferDays(item) > 0 ? addPlanDays(item.end, bufferDays(item)) : item.end;
}

function forecastEndDate(item: PlanningPackage | PlanningTask | PlanningSubtask) {
  const dates = [item.end];
  if (item.bufferVisible !== false && bufferDays(item) > 0) {
    dates.push(bufferEndDate(item));
  }
  if (item.actualEnd) {
    dates.push(item.actualEnd);
  }
  return dates.reduce((latest, current) => parsePlanDate(current) > parsePlanDate(latest) ? current : latest, item.end);
}

function calculateDelaySnapshot(
  source: Pick<PlanningForm, "end" | "actualStart" | "actualEnd" | "actual" | "bufferDays" | "bufferType">,
  successorCount = 0,
  floatDays = 0,
) {
  const actualDays = source.actualStart && source.actualEnd ? planDaysBetween(source.actualStart, source.actualEnd) : Number(source.actual || 0);
  const delayDays = source.actualEnd ? Math.max(0, dateDiffDays(source.end, source.actualEnd)) : 0;
  const plannedBuffer = Math.max(0, Number(source.bufferDays || 0));
  const consumedBuffer = Math.min(plannedBuffer, delayDays);
  const remainingBuffer = Math.max(0, plannedBuffer - delayDays);
  const netDelay = Math.max(0, delayDays - plannedBuffer);
  const delayStatus: DelayStatus =
    delayDays === 0 ? "On Track" :
    netDelay === 0 ? "On Track" :
    netDelay > 3 || floatDays <= 0 ? "Critical Delay" :
    "Minor Delay";
  const delayImpact: DelayImpact =
    netDelay === 0 ? "No Impact" :
    netDelay > 3 || floatDays <= 0 ? "Impacts Critical Path" :
    source.bufferType === "Project Buffer" ? "Impacts Milestone" :
    successorCount > 0 ? "Impacts Successor" :
    "No Impact";

  return { actualDays, delayDays, consumedBuffer, remainingBuffer, netDelay, delayStatus, delayImpact };
}

function derivedActualStart(item: PlanningPackage | PlanningTask | PlanningSubtask) {
  if (item.actualStart) return item.actualStart;
  if (item.status === "Completed" || item.actualEnd) return item.start;
  return "";
}

function derivedActualEnd(item: PlanningPackage | PlanningTask | PlanningSubtask) {
  if (item.actualEnd) return item.actualEnd;
  if (item.status === "Completed") return item.end;
  return "";
}

function plannedProgressFor(item: PlanningPackage | PlanningTask | PlanningSubtask, today = SCHEDULE_TODAY) {
  if (parsePlanDate(today) < parsePlanDate(item.start)) return 0;
  if (parsePlanDate(today) >= parsePlanDate(item.end)) return 100;
  return clampPercent((planDaysBetween(item.start, today) / planDaysBetween(item.start, item.end)) * 100);
}

function delayDaysFor(item: PlanningPackage | PlanningTask | PlanningSubtask, today = SCHEDULE_TODAY) {
  const actualEnd = derivedActualEnd(item);
  if (actualEnd) {
    return Math.max(0, dateDiffDays(item.end, actualEnd));
  }
  if (parsePlanDate(today) > parsePlanDate(item.end)) {
    return Math.max(0, dateDiffDays(item.end, today));
  }
  return 0;
}

function activityTouchesDate(item: PlanningPackage | PlanningTask | PlanningSubtask, date = SCHEDULE_TODAY) {
  return parsePlanDate(item.start) <= parsePlanDate(date) && parsePlanDate(item.end) >= parsePlanDate(date);
}

function activityStartsWithin(item: PlanningPackage | PlanningTask | PlanningSubtask, start: string, end: string) {
  return parsePlanDate(item.start) >= parsePlanDate(start) && parsePlanDate(item.start) <= parsePlanDate(end);
}

function getScheduledActualStatus(item: PlanningPackage | PlanningTask | PlanningSubtask, plannedProgress: number, actualProgress: number, today = SCHEDULE_TODAY): ScheduledActualStatus {
  const actualStart = derivedActualStart(item);
  const actualEnd = derivedActualEnd(item);
  if (actualEnd) {
    if (parsePlanDate(actualEnd) > parsePlanDate(item.end)) return "Completed Late";
    if (parsePlanDate(actualEnd) < parsePlanDate(item.end)) return "Completed Early";
    return "Completed";
  }
  if (!actualStart) {
    if (parsePlanDate(today) < parsePlanDate(item.start)) return "Not Started";
    if (today === item.start) return "Should Start Today";
    if (parsePlanDate(today) > parsePlanDate(item.end)) return "Delayed";
    return "Should Start Today";
  }
  if (actualProgress === 0 && plannedProgress === 0) return "In Progress";
  if (actualProgress >= plannedProgress) return "On Track";
  return "Behind Schedule";
}

function rowToneFor(status: ScheduledActualStatus, isActualInProgress: boolean): ActualTrackingRow["rowTone"] {
  if (status === "Delayed" || status === "Completed Late") return "red";
  if (status === "Behind Schedule") return "amber";
  if (isActualInProgress || status === "In Progress") return "blue";
  if (status === "On Track" || status === "Completed" || status === "Completed Early") return "green";
  return "grey";
}

function collectPlanningItems(packages: PlanningPackage[]) {
  const items: TimelineItem[] = [];
  packages.forEach((planningPackage) => {
    items.push({ ...planningPackage, itemType: "package", packageId: planningPackage.id });
    planningPackage.tasks.forEach((task) => {
      items.push({ ...task, itemType: "task", packageId: planningPackage.id });
      task.subtasks.forEach((subtask) => {
        items.push({ ...subtask, itemType: "subtask", packageId: planningPackage.id, taskId: task.id });
      });
    });
  });
  return items;
}

function planningBounds(packages: PlanningPackage[]) {
  const items = collectPlanningItems(packages);
  if (items.length === 0) {
    return { start: SCHEDULE_TODAY, end: addPlanDays(SCHEDULE_TODAY, 30) };
  }
  const starts = items.map((item) => parsePlanDate(item.start).getTime());
  const ends = items.map((item) => parsePlanDate(forecastEndDate(item)).getTime());
  const min = new Date(Math.min(...starts));
  const max = new Date(Math.max(...ends));
  if (min.getTime() === max.getTime()) {
    max.setDate(max.getDate() + 7);
  }
  return { start: toIsoDate(min), end: toIsoDate(max) };
}

function timelinePosition(start: string, end: string, bounds: { start: string; end: string }) {
  const range = Math.max(1, parsePlanDate(bounds.end).getTime() - parsePlanDate(bounds.start).getTime());
  const left = Math.max(0, ((parsePlanDate(start).getTime() - parsePlanDate(bounds.start).getTime()) / range) * 100);
  const width = Math.max(1.8, (((parsePlanDate(end).getTime() - parsePlanDate(start).getTime()) + 86400000) / range) * 100);
  return { left: `${Math.min(98, left).toFixed(2)}%`, width: `${Math.min(100 - left, width).toFixed(2)}%` };
}

function rangesOverlap(start: string, end: string, bounds: { start: string; end: string }) {
  return parsePlanDate(end) >= parsePlanDate(bounds.start) && parsePlanDate(start) <= parsePlanDate(bounds.end);
}

function clippedTimelinePosition(start: string, end: string, bounds: { start: string; end: string }) {
  const clippedStart = parsePlanDate(start) < parsePlanDate(bounds.start) ? bounds.start : start;
  const clippedEnd = parsePlanDate(end) > parsePlanDate(bounds.end) ? bounds.end : end;
  return timelinePosition(clippedStart, clippedEnd, bounds);
}

function axisTicks(bounds: { start: string; end: string }, timelineWidth = 1080) {
  const totalDays = planDaysBetween(bounds.start, bounds.end);
  const numTicks = Math.max(6, Math.floor(timelineWidth / 150));
  return Array.from({ length: numTicks }, (_, index) => {
    const offset = Math.round(((totalDays - 1) * index) / (numTicks - 1));
    const date = addPlanDays(bounds.start, offset);
    return { date, left: `${(index / (numTicks - 1)) * 100}%` };
  });
}

function syncTask(task: PlanningTask): PlanningTask {
  if (task.subtasks.length === 0) return task;
  const starts = task.subtasks.map((s) => parsePlanDate(s.start).getTime());
  const ends = task.subtasks.map((s) => parsePlanDate(s.end).getTime());
  const progress = Math.round(task.subtasks.reduce((sum, s) => sum + (s.progress || 0), 0) / task.subtasks.length);
  const statuses = task.subtasks.map((s) => s.status);
  const status: PlanningStatus =
    statuses.includes("Blocked") ? "Blocked" :
    statuses.includes("Delayed") ? "Delayed" :
    statuses.includes("At Risk") ? "At Risk" :
    statuses.includes("For Review") ? "For Review" :
    statuses.every((v) => v === "Completed") ? "Completed" :
    statuses.includes("On Track") ? "On Track" :
    statuses.includes("Pending") ? "Pending" :
    "Planned";

  return {
    ...task,
    start: toIsoDate(new Date(Math.min(...starts))),
    end: toIsoDate(new Date(Math.max(...ends))),
    progress,
    status,
  };
}

function syncPackage(planningPackage: PlanningPackage): PlanningPackage {
  const syncedTasks = planningPackage.tasks.map(syncTask);
  if (syncedTasks.length === 0) return { ...planningPackage, tasks: syncedTasks };

  const starts = syncedTasks.map((task) => parsePlanDate(task.start).getTime());
  const ends = syncedTasks.map((task) => parsePlanDate(task.end).getTime());
  const progress = Math.round(syncedTasks.reduce((sum, task) => sum + (task.progress || 0), 0) / syncedTasks.length);
  const statuses = syncedTasks.map((task) => task.status);
  const status: PlanningStatus =
    statuses.includes("Blocked") ? "Blocked" :
    statuses.includes("Delayed") ? "Delayed" :
    statuses.includes("At Risk") ? "At Risk" :
    statuses.includes("For Review") ? "For Review" :
    statuses.every((value) => value === "Completed") ? "Completed" :
    statuses.includes("On Track") ? "On Track" :
    statuses.includes("Pending") ? "Pending" :
    "Planned";

  return {
    ...planningPackage,
    tasks: syncedTasks,
    start: toIsoDate(new Date(Math.min(...starts))),
    end: toIsoDate(new Date(Math.max(...ends))),
    progress,
    status,
  };
}

function renumberPackage(planningPackage: PlanningPackage): PlanningPackage {
  return {
    ...planningPackage,
    tasks: planningPackage.tasks.map((task, taskIndex) => {
      const code = `${planningPackage.code}.${taskIndex + 1}`;
      return {
        ...task,
        code,
        activityId: task.activityId || code,
        subtasks: task.subtasks.map((subtask, subtaskIndex) => {
          const subtaskCode = `${code}.${subtaskIndex + 1}`;
          return { ...subtask, code: subtaskCode, activityId: subtask.activityId || subtaskCode };
        }),
      };
    }),
  };
}

function cascadeSchedule(packages: PlanningPackage[]): PlanningPackage[] {
  let changed = true;
  let iters = 0;
  const cloned = JSON.parse(JSON.stringify(packages)) as PlanningPackage[];

  const getItem = (id: string): PlanningPackage | PlanningTask | PlanningSubtask | undefined => {
    for (const p of cloned) {
      if (p.id === id) return p;
      for (const t of p.tasks) {
        if (t.id === id) return t;
        for (const s of t.subtasks) {
          if (s.id === id) return s;
        }
      }
    }
    return undefined;
  };

  while (changed && iters < 10) {
    changed = false;
    iters++;
    for (const p of cloned) {
      for (const t of p.tasks) {
        normalizeDependencies(t.dependencies).forEach((dependency) => {
          const predecessor = getItem(dependency.predecessorId);
          if (!predecessor) return;
          const lag = parseLagDays(dependency.lag);
          const durationOffset = Math.max(0, planDaysBetween(t.start, t.end) - 1);
          const requiredStart =
            dependency.type === "FS" ? addPlanDays(predecessor.end, lag) :
            dependency.type === "SS" ? addPlanDays(predecessor.start, lag) :
            "";
          const requiredFinish =
            dependency.type === "FF" ? addPlanDays(predecessor.end, lag) :
            dependency.type === "SF" ? addPlanDays(predecessor.start, lag) :
            "";

          if (requiredStart && parsePlanDate(t.start) < parsePlanDate(requiredStart)) {
            t.start = requiredStart;
            t.end = addPlanDays(t.start, durationOffset);
            changed = true;
          }
          if (requiredFinish && parsePlanDate(t.end) < parsePlanDate(requiredFinish)) {
            const shift = dateDiffDays(t.end, requiredFinish);
            t.start = addPlanDays(t.start, shift);
            t.end = requiredFinish;
            changed = true;
          }
        });
        for (const s of t.subtasks) {
          normalizeDependencies(s.dependencies).forEach((dependency) => {
            const predecessor = getItem(dependency.predecessorId);
            if (!predecessor) return;
            const lag = parseLagDays(dependency.lag);
            const durationOffset = Math.max(0, planDaysBetween(s.start, s.end) - 1);
            const requiredStart =
              dependency.type === "FS" ? addPlanDays(predecessor.end, lag) :
              dependency.type === "SS" ? addPlanDays(predecessor.start, lag) :
              "";
            const requiredFinish =
              dependency.type === "FF" ? addPlanDays(predecessor.end, lag) :
              dependency.type === "SF" ? addPlanDays(predecessor.start, lag) :
              "";

            if (requiredStart && parsePlanDate(s.start) < parsePlanDate(requiredStart)) {
              s.start = requiredStart;
              s.end = addPlanDays(s.start, durationOffset);
              changed = true;
            }
            if (requiredFinish && parsePlanDate(s.end) < parsePlanDate(requiredFinish)) {
              const shift = dateDiffDays(s.end, requiredFinish);
              s.start = addPlanDays(s.start, shift);
              s.end = requiredFinish;
              changed = true;
            }
          });
        }
      }
    }
  }
  return cloned.map(syncPackage);
}

function defaultFloat(status: PlanningStatus) {
  return planningFloat({ id: "", code: "", name: "", owner: "", status, progress: 0, start: SCHEDULE_TODAY, end: SCHEDULE_TODAY });
}

function emptyForm(): PlanningForm {
  return {
    name: "",
    activityId: "",
    start: SCHEDULE_TODAY,
    end: addPlanDays(SCHEDULE_TODAY, 5),
    actualStart: "",
    actualEnd: "",
    actual: 0,
    float: 5,
    constraint: "Flexible",
    dependencies: [],
    bufferDays: 0,
    bufferReason: "Weather Risk",
    bufferType: "Task Buffer",
    bufferVisible: true,
    delayStatus: "On Track",
    delayReason: "Other",
    recoveryPlan: "",
    status: "Planned",
    progress: 0,
    responsible: "Planning",
    color: "#0f766e",
    parentTaskId: "",
    scheduleEffect: "Update live forecast",
  };
}

function preparePlanningPackages(source: PlanningPackage[] = initialPlanningPackages) {
  return source.map((item) => syncPackage(renumberPackage(item)));
}

function packagesForTemplate(templateKey: PlanningTemplateKey) {
  if (templateKey === "new") {
    return [];
  }
  if (templateKey === "bep") {
    return planningTemplatePackages.bep.map((item) => renumberPackage(item));
  }
  return preparePlanningPackages(planningTemplatePackages[templateKey]);
}

function createBaselineSnapshot(packages: PlanningPackage[], revision: number): BaselineSnapshot {
  return {
    revision,
    approvedAt: SCHEDULE_TODAY,
    tasks: packages.flatMap((planningPackage) => planningPackage.tasks.map((task) => ({
      key: `${planningPackage.id}:${task.id}`,
      id: task.id,
      packageId: planningPackage.id,
      activityId: activityId(task),
      name: task.name,
      phaseName: planningPackage.name,
      start: task.start,
      end: task.end,
      responsibleTeam: planningResponsible(task, planningPackage),
    }))),
  };
}

function revisionLabel(revision: number) {
  if (revision > 0 && revision <= 26) {
    return `Rev ${String.fromCharCode(64 + revision)}`;
  }
  return `Rev ${revision}`;
}

type PlanningTrackerProps = {
  templateKey?: PlanningTemplateKey;
  onTemplateChange?: (templateKey: PlanningTemplateKey) => void;
};

export function PlanningTracker({ templateKey = "construction", onTemplateChange }: PlanningTrackerProps = {}) {
  const [packages, setPackages] = useState<PlanningPackage[]>(() => packagesForTemplate(templateKey));
  const [selectedPackageId, setSelectedPackageId] = useState(() => packagesForTemplate(templateKey)[0]?.id ?? "");
  const [baselineRevision, setBaselineRevision] = useState(1);
  const [baselineSnapshot, setBaselineSnapshot] = useState<BaselineSnapshot | null>(() => {
    const initialPackages = packagesForTemplate(templateKey);
    return initialPackages.length ? createBaselineSnapshot(initialPackages, 1) : null;
  });
  const [baselineDisplay, setBaselineDisplay] = useState<BaselineDisplay>("table");
  const [baselinePanel, setBaselinePanel] = useState<BaselinePanel>("insights");
  const [tableColumnVisibility, setTableColumnVisibility] = useState<Record<TableColumnScope, Record<string, boolean>>>({
    wbs: {},
    baseline: {},
    lookahead: {},
    scheduledActual: {},
  });
  const [columnMenuOpen, setColumnMenuOpen] = useState<TableColumnScope | null>(null);
  const [view, setView] = useState<PlanningView>("wbs");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("CSV");
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PlanningStatus | "All Status">("All Status");
  const [responsibleFilter, setResponsibleFilter] = useState("Any Department");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({ "design-freeze": true });
  const [editState, setEditState] = useState<EditState | null>(null);
  const [form, setForm] = useState<PlanningForm>(emptyForm());
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [hovered, setHovered] = useState<{ item: TimelineItem; x: number; y: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [timelineDateRangeOpen, setTimelineDateRangeOpen] = useState(false);
  const [timelineRangeStart, setTimelineRangeStart] = useState("");
  const [timelineRangeEnd, setTimelineRangeEnd] = useState("");
  const [actualPhaseFilter, setActualPhaseFilter] = useState("All Phases");
  const [actualResponsibleFilter, setActualResponsibleFilter] = useState("Any Team");
  const [actualStatusFilter, setActualStatusFilter] = useState<ScheduledActualStatus | "All Status">("All Status");
  const [actualDateRange, setActualDateRange] = useState<ActualDateRange>("All Dates");
  const [delayedOnly, setDelayedOnly] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [todaysWorkOnly, setTodaysWorkOnly] = useState(false);
  const [thisWeekOnly, setThisWeekOnly] = useState(false);
  const [lookaheadWindow, setLookaheadWindow] = useState<LookaheadWindow>("3 Weeks");
  const [lookaheadPhaseFilter, setLookaheadPhaseFilter] = useState("All Phases");
  const [lookaheadTeamFilter, setLookaheadTeamFilter] = useState("All Teams");
  const [lookaheadOverrides, setLookaheadOverrides] = useState<Record<string, LookaheadOverride>>({});
  const [selectedActualRef, setSelectedActualRef] = useState<{ id: string; packageId: string; taskId?: string; itemType: TimelineItem["itemType"] } | null>(null);
  const [selectedMilestoneRef, setSelectedMilestoneRef] = useState<{ packageId: string; taskId: string } | null>(null);
  const [hoveredMilestone, setHoveredMilestone] = useState<{ item: MilestoneRow; x: number; y: number } | null>(null);
  const [milestoneDepartmentFilter, setMilestoneDepartmentFilter] = useState("All Departments");
  const [milestoneAssigneeFilter, setMilestoneAssigneeFilter] = useState("All Assignees");
  const [milestoneOwnerFilter, setMilestoneOwnerFilter] = useState("All Milestones");
  const [milestoneCreatedByFilter, setMilestoneCreatedByFilter] = useState("All Creators");
  const [milestoneCreatedForFilter, setMilestoneCreatedForFilter] = useState("All Recipients");
  const horizontalScrollDrag = useRef({ active: false, moved: false, startX: 0, scrollLeft: 0 });
  const suppressHorizontalClick = useRef(false);
  const [horizontalScrollDragging, setHorizontalScrollDragging] = useState(false);
  const appliedTemplateRef = useRef(templateKey);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const startHorizontalScrollDrag = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("[data-no-drag='true'], input, select, textarea")) return;
    horizontalScrollDrag.current = {
      active: true,
      moved: false,
      startX: event.pageX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
    setHorizontalScrollDragging(true);
  };

  const moveHorizontalScrollDrag = (event: MouseEvent<HTMLDivElement>) => {
    if (!horizontalScrollDrag.current.active) return;
    const walk = event.pageX - horizontalScrollDrag.current.startX;
    if (Math.abs(walk) > 4) {
      horizontalScrollDrag.current.moved = true;
      suppressHorizontalClick.current = true;
      setHoveredMilestone(null);
    }
    event.preventDefault();
    event.currentTarget.scrollLeft = horizontalScrollDrag.current.scrollLeft - walk;
  };

  const stopHorizontalScrollDrag = () => {
    horizontalScrollDrag.current.active = false;
    setHorizontalScrollDragging(false);
    window.setTimeout(() => {
      horizontalScrollDrag.current.moved = false;
      suppressHorizontalClick.current = false;
    }, 0);
  };

  const hasPlanningData = packages.length > 0;
  const blankPackage = useMemo<PlanningPackage>(() => ({
    id: "",
    code: "",
    name: "No phase selected",
    owner: "Planning",
    status: "Planned",
    progress: 0,
    start: SCHEDULE_TODAY,
    end: addPlanDays(SCHEDULE_TODAY, 30),
    tasks: [],
  }), []);
  const selectedPackage = packages.find((item) => item.id === selectedPackageId) ?? packages[0] ?? blankPackage;
  const modalPackage = editState ? packages.find((item) => item.id === editState.packageId) ?? selectedPackage : selectedPackage;
  const allTasks = useMemo(() => packages.flatMap((item) => item.tasks), [packages]);
  const allSubtasks = useMemo(() => packages.flatMap((item) => item.tasks.flatMap((task) => task.subtasks)), [packages]);
  const allBounds = useMemo(() => planningBounds(packages), [packages]);
  const selectedBounds = useMemo(() => planningBounds(selectedPackage.id ? [selectedPackage] : []), [selectedPackage]);
  const overallProgress = packages.length ? Math.round(packages.reduce((sum, item) => sum + item.progress, 0) / packages.length) : 0;
  const allSelectableTasks = useMemo(() => packages.flatMap(p => [
    ...p.tasks.map(t => ({ id: t.id, name: t.name, code: t.code, type: "task" })),
    ...p.tasks.flatMap(t => t.subtasks.map(s => ({ id: s.id, name: s.name, code: s.code, type: "subtask" })))
  ]), [packages]);
  const currentEditItemId = editState?.subtaskId || editState?.taskId || editState?.packageId || "";
  const availablePredecessors = allSelectableTasks.filter((item) => item.id !== currentEditItemId);
  const successorItems = useMemo(
    () => currentEditItemId
      ? collectPlanningItems(packages).filter((item) => normalizeDependencies(item.dependencies).some((dependency) => dependency.predecessorId === currentEditItemId))
      : [],
    [packages, currentEditItemId],
  );
  const computedFloat = useMemo(() => {
    if (!currentEditItemId || successorItems.length === 0) {
      return Math.max(0, Number(form.float || 0));
    }
    return Math.min(...successorItems.map((item) => Math.max(0, dateDiffDays(form.end, item.start))));
  }, [currentEditItemId, form.end, form.float, successorItems]);
  const delaySnapshot = calculateDelaySnapshot(form, successorItems.length, computedFloat);
  const milestoneRows = useMemo<MilestoneRow[]>(() => packages.flatMap((planningPackage) => (
    planningPackage.tasks.map((task) => ({
      ...task,
      itemType: "task" as const,
      packageId: planningPackage.id,
      phaseName: planningPackage.name,
      phaseCode: planningPackage.code,
    }))
  )), [packages]);
  const selectedMilestone = selectedMilestoneRef
    ? milestoneRows.find((row) => row.packageId === selectedMilestoneRef.packageId && row.id === selectedMilestoneRef.taskId) ?? milestoneRows[0] ?? null
    : milestoneRows[0] ?? null;

  const predecessorLabel = (id: string) => {
    const match = allSelectableTasks.find((item) => item.id === id);
    return match ? `${match.code} ${match.name}` : id;
  };

  const updateDependency = (dependencyId: string, updates: Partial<ScheduleDependency>) => {
    updateForm("dependencies", form.dependencies.map((dependency) => dependency.id === dependencyId ? { ...dependency, ...updates } : dependency));
  };

  const addDependency = () => {
    const firstPredecessor = availablePredecessors[0];
    updateForm("dependencies", [
      ...form.dependencies,
      {
        id: `dep-${Date.now()}`,
        predecessorId: firstPredecessor?.id || "",
        type: "FS",
        lag: "",
      },
    ]);
  };

  const actualTrackingRows = useMemo<ActualTrackingRow[]>(() => {
    return packages.flatMap((planningPackage) => {
      const rows: ActualTrackingRow[] = [];
      planningPackage.tasks.forEach((task) => {
        const buildRow = (item: PlanningTask | PlanningSubtask, itemType: "task" | "subtask", taskId?: string): ActualTrackingRow => {
          const plannedProgress = plannedProgressFor(item);
          const actualProgress = clampPercent(item.progress || 0);
          const variance = actualProgress - plannedProgress;
          const delayDays = delayDaysFor(item);
          const isActualInProgress = Boolean(derivedActualStart(item) && !derivedActualEnd(item));
          const trackingStatus = getScheduledActualStatus(item, plannedProgress, actualProgress);
          const isCritical = planningFloat(item) <= 0 || item.delayImpact === "Impacts Critical Path" || delayDays > bufferDays(item) + 3;

          return {
            ...item,
            itemType,
            packageId: planningPackage.id,
            taskId,
            phaseName: planningPackage.name,
            phaseCode: planningPackage.code,
            plannedProgress,
            actualProgress,
            variance,
            delayDays,
            trackingStatus,
            responsibleTeam: planningResponsible(item, planningPackage),
            isActualInProgress,
            isCritical,
            rowTone: rowToneFor(trackingStatus, isActualInProgress),
          };
        };

        rows.push(buildRow(task, "task"));
        task.subtasks.forEach((subtask) => rows.push(buildRow(subtask, "subtask", task.id)));
      });
      return rows;
    });
  }, [packages]);

  const selectedActualRow = selectedActualRef
    ? actualTrackingRows.find((row) => row.id === selectedActualRef.id && row.packageId === selectedActualRef.packageId && row.itemType === selectedActualRef.itemType) ?? null
    : null;

  const filteredActualRows = actualTrackingRows.filter((row) => {
    const query = searchQuery.trim().toLowerCase();
    const thisWeekEnd = addPlanDays(SCHEDULE_TODAY, 6);
    const nextWeekEnd = addPlanDays(SCHEDULE_TODAY, 7);
    const matchesSearch = !query || [activityId(row), row.name, row.phaseName, row.responsibleTeam, row.trackingStatus, row.remarks || ""].join(" ").toLowerCase().includes(query);
    const matchesPhase = actualPhaseFilter === "All Phases" || row.phaseName === actualPhaseFilter;
    const matchesResponsible = actualResponsibleFilter === "Any Team" || row.responsibleTeam === actualResponsibleFilter;
    const matchesStatus = actualStatusFilter === "All Status" || row.trackingStatus === actualStatusFilter;
    const matchesDate =
      actualDateRange === "All Dates" ||
      (actualDateRange === "Today" && activityTouchesDate(row)) ||
      (actualDateRange === "This Week" && (activityTouchesDate(row) || activityStartsWithin(row, SCHEDULE_TODAY, thisWeekEnd))) ||
      (actualDateRange === "Next 7 Days" && activityStartsWithin(row, SCHEDULE_TODAY, nextWeekEnd)) ||
      (actualDateRange === "Overdue" && row.delayDays > 0 && !derivedActualEnd(row));
    const matchesDelayed = !delayedOnly || row.delayDays > 0 || row.trackingStatus === "Delayed" || row.trackingStatus === "Behind Schedule" || row.trackingStatus === "Completed Late";
    const matchesCritical = !criticalOnly || row.isCritical;
    const matchesToday = !todaysWorkOnly || activityTouchesDate(row) || row.isActualInProgress || row.trackingStatus === "Should Start Today";
    const matchesWeek = !thisWeekOnly || activityTouchesDate(row) || activityStartsWithin(row, SCHEDULE_TODAY, thisWeekEnd);
    return matchesSearch && matchesPhase && matchesResponsible && matchesStatus && matchesDate && matchesDelayed && matchesCritical && matchesToday && matchesWeek;
  });

  const actualSummary = {
    scheduledToday: actualTrackingRows.filter((row) => activityTouchesDate(row)).length,
    actuallyInProgress: actualTrackingRows.filter((row) => row.isActualInProgress).length,
    behindSchedule: actualTrackingRows.filter((row) => row.trackingStatus === "Behind Schedule" || row.trackingStatus === "Delayed" || row.trackingStatus === "Completed Late").length,
    completedToday: actualTrackingRows.filter((row) => derivedActualEnd(row) === SCHEDULE_TODAY).length,
    upcomingThisWeek: actualTrackingRows.filter((row) => activityStartsWithin(row, SCHEDULE_TODAY, addPlanDays(SCHEDULE_TODAY, 7))).length,
  };

  const executionInsights = useMemo(() => {
    const shouldHaveStarted = actualTrackingRows.filter((row) => parsePlanDate(row.start) <= parsePlanDate(SCHEDULE_TODAY) && !derivedActualStart(row)).length;
    const behindProgress = actualTrackingRows.filter((row) => row.actualProgress < row.plannedProgress && !derivedActualEnd(row)).length;
    const substructureRows = actualTrackingRows.filter((row) => row.phaseName === "Substructure");
    const substructureBehind = substructureRows.length
      ? Math.max(0, Math.round(substructureRows.reduce((sum, row) => sum + row.plannedProgress - row.actualProgress, 0) / substructureRows.length))
      : 0;
    const criticalDelayed = actualTrackingRows.filter((row) => row.delayDays > 0 && row.isCritical).length;
    return { shouldHaveStarted, behindProgress, substructureBehind, criticalDelayed };
  }, [actualTrackingRows]);

  const updateActivityItem = (row: ActualTrackingRow, updates: Partial<PlanningTask | PlanningSubtask>) => {
    setPackages((current) => current.map((planningPackage) => {
      if (planningPackage.id !== row.packageId) return planningPackage;
      const nextTasks = planningPackage.tasks.map((task) => {
        if (row.itemType === "task" && task.id === row.id) {
          return { ...task, ...updates };
        }
        if (row.itemType === "subtask" && task.id === row.taskId) {
          return {
            ...task,
            subtasks: task.subtasks.map((subtask) => subtask.id === row.id ? { ...subtask, ...updates } : subtask),
          };
        }
        return task;
      });
      return syncPackage({ ...planningPackage, tasks: nextTasks });
    }));
  };

  const filteredTasks = selectedPackage.tasks.filter((task) => {
    const matchesStatus = statusFilter === "All Status" || task.status === statusFilter;
    const matchesResponsible = responsibleFilter === "Any Department" || planningResponsible(task, selectedPackage) === responsibleFilter;
    const query = searchQuery.trim().toLowerCase();
    const haystack = [
      activityId(task),
      task.name,
      task.status,
      planningResponsible(task, selectedPackage),
      planningConstraint(task),
      planningDependency(task),
      ...task.subtasks.flatMap((subtask) => [activityId(subtask), subtask.name, planningResponsible(subtask, selectedPackage), planningConstraint(subtask)]),
    ].join(" ").toLowerCase();
    return matchesStatus && matchesResponsible && (!query || haystack.includes(query));
  });

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const isTableColumnVisible = (scope: TableColumnScope, key: string) => tableColumnVisibility[scope]?.[key] !== false;

  const visibleColumnCount = (scope: TableColumnScope, columns = tableColumnsByScope[scope]) =>
    columns.filter((column) => isTableColumnVisible(scope, column.key)).length;

  const toggleTableColumn = (scope: TableColumnScope, key: string) => {
    setTableColumnVisibility((current) => {
      const scopeVisibility = current[scope] ?? {};
      const currentlyVisible = scopeVisibility[key] !== false;
      const visibleCount = tableColumnsByScope[scope].filter((column) => scopeVisibility[column.key] !== false).length;

      if (currentlyVisible && visibleCount <= 1) {
        return current;
      }

      return {
        ...current,
        [scope]: {
          ...scopeVisibility,
          [key]: !currentlyVisible,
        },
      };
    });
  };

  const showAllTableColumns = (scope: TableColumnScope) => {
    setTableColumnVisibility((current) => ({ ...current, [scope]: {} }));
  };

  const renderColumnVisibilityControl = (scope: TableColumnScope, columns = tableColumnsByScope[scope]) => {
    const visibleCount = visibleColumnCount(scope, columns);
    const allVisible = visibleCount === columns.length;

    return (
      <div className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1 shadow-sm">
        <button
          type="button"
          onClick={() => setColumnMenuOpen((current) => current === scope ? null : scope)}
          className="inline-flex h-8 items-center gap-2 rounded-md px-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
          title="Choose visible table columns"
        >
          <Eye className="h-3.5 w-3.5 text-slate-500" />
          <span>Columns</span>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-slate-800">{visibleCount}/{columns.length}</span>
          <ChevronDown className={cx("h-3.5 w-3.5 text-slate-400 transition-transform", columnMenuOpen === scope && "rotate-180")} />
        </button>
        {columnMenuOpen === scope && (
          <div className="absolute right-0 top-11 z-[90] w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-[0_18px_50px_rgba(15,23,42,0.16)]">
            <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
              <p className="text-[10px] font-medium uppercase text-slate-400">Visible headers</p>
              <button
                type="button"
                onClick={() => showAllTableColumns(scope)}
                className="rounded-md px-2 py-1 text-[10px] font-medium text-blue-700 hover:bg-blue-50 disabled:text-slate-300"
                disabled={allVisible}
              >
                Show all
              </button>
            </div>
            <div className="max-h-72 space-y-1 overflow-y-auto pr-0.5">
              {columns.map((column) => {
                const active = isTableColumnVisible(scope, column.key);
                const lastVisible = active && visibleCount <= 1;
              return (
                <button
                  key={column.key}
                  type="button"
                  onClick={() => toggleTableColumn(scope, column.key)}
                  disabled={lastVisible}
                  className={cx(
                    "flex h-8 w-full items-center justify-between rounded-lg px-2 text-left text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                    active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <span>{column.label}</span>
                  {active && <Check className="h-3.5 w-3.5" />}
                </button>
              );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const visibleFilteredTasks = filteredTasks;

  useEffect(() => {
    if (appliedTemplateRef.current === templateKey) return;
    appliedTemplateRef.current = templateKey;

    const nextPackages = packagesForTemplate(templateKey);
    const firstTaskId = nextPackages[0]?.tasks[0]?.id;
    setPackages(nextPackages);
    setSelectedPackageId(nextPackages[0]?.id || "");
    setBaselineRevision(nextPackages.length ? 1 : 0);
    setBaselineSnapshot(nextPackages.length ? createBaselineSnapshot(nextPackages, 1) : null);
    setLookaheadOverrides({});
    setSelectedActualRef(null);
    setSelectedMilestoneRef(null);
    setHovered(null);
    setHoveredMilestone(null);
    setExpandedRows(firstTaskId ? { [firstTaskId]: true } : {});
    setSearchQuery("");
    setTimelineRangeStart("");
    setTimelineRangeEnd("");
    setLookaheadPhaseFilter("All Phases");
    setLookaheadTeamFilter("All Teams");
    setView("wbs");
    showToast(templateKey === "new" ? "Blank planning template loaded." : "Planning template loaded.");
  }, [templateKey]);

  const startFreshPlanning = () => {
    appliedTemplateRef.current = "new";
    setPackages([]);
    setSelectedPackageId("");
    setBaselineRevision(0);
    setBaselineSnapshot(null);
    setLookaheadOverrides({});
    setSelectedActualRef(null);
    setSelectedMilestoneRef(null);
    setHovered(null);
    setHoveredMilestone(null);
    setExpandedRows({});
    setSearchQuery("");
    setTimelineRangeStart("");
    setTimelineRangeEnd("");
    setView("wbs");
    onTemplateChange?.("new");
    showToast("Planning cleared. Create a phase to start fresh.");
  };

  const loadDemoPlanning = () => {
    const demoPackages = packagesForTemplate("construction");
    appliedTemplateRef.current = "construction";
    setPackages(demoPackages);
    setSelectedPackageId(demoPackages[0]?.id || "");
    setBaselineRevision(1);
    setBaselineSnapshot(createBaselineSnapshot(demoPackages, 1));
    setLookaheadOverrides({});
    setSelectedActualRef(null);
    setSelectedMilestoneRef(null);
    setExpandedRows({ "design-freeze": true });
    setSearchQuery("");
    setView("wbs");
    onTemplateChange?.("construction");
    showToast("Demo planning data restored.");
  };

  const saveBaselineSnapshot = () => {
    if (allTasks.length === 0) {
      showToast("Add tasks before saving a baseline.");
      return;
    }
    const nextRevision = baselineRevision + 1 || 1;
    setBaselineRevision(nextRevision);
    setBaselineSnapshot(createBaselineSnapshot(packages, nextRevision));
    showToast(`${revisionLabel(nextRevision)} saved from current schedule.`);
  };

  const updateForm = <Key extends keyof PlanningForm>(key: Key, value: PlanningForm[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openEditModal = (packageId: string, taskId: string, subtaskId?: string) => {
    const planningPackage = packages.find((item) => item.id === packageId) ?? packages[0];
    if (!planningPackage) {
      showToast("Create a phase first.");
      return;
    }
    const task = planningPackage.tasks.find((item) => item.id === taskId) ?? planningPackage.tasks[0];
    if (!task) {
      showToast("Create a task first.");
      return;
    }
    const item = subtaskId ? task.subtasks.find((subtask) => subtask.id === subtaskId) ?? task.subtasks[0] : task;
    if (!item) {
      showToast("Create a subtask first.");
      return;
    }

    setEditState({ mode: "edit", packageId, taskId, subtaskId });
    setForm({
      name: item.name,
      activityId: activityId(item),
      start: item.start,
      end: item.end,
      actualStart: item.actualStart || "",
      actualEnd: item.actualEnd || "",
      actual: planningActual(item),
      float: planningFloat(item),
      constraint: planningConstraint(item),
      dependencies: normalizeDependencies(item.dependencies),
      bufferDays: bufferDays(item),
      bufferReason: item.bufferReason || "Weather Risk",
      bufferType: item.bufferType || "Task Buffer",
      bufferVisible: item.bufferVisible !== false,
      delayStatus: item.delayStatus || "On Track",
      delayReason: item.delayReason || "Other",
      recoveryPlan: item.recoveryPlan || "",
      status: item.status,
      progress: clampPercent(item.progress || 0),
      responsible: planningResponsible(item, planningPackage),
      color: timelineColor(item),
      parentTaskId: task.id,
      scheduleEffect: "Update live forecast",
    });
    setModalOpen(true);
  };

  const openCreateTask = () => {
    if (!selectedPackage.id) {
      openCreatePhase();
      showToast("Start by creating the first phase.");
      return;
    }
    const lastTask = selectedPackage.tasks[selectedPackage.tasks.length - 1];
    const start = lastTask ? addPlanDays(lastTask.end, 1) : selectedPackage.start;
    const end = addPlanDays(start, 5);
    setEditState({ mode: "create-task", packageId: selectedPackage.id });
    setForm({
      ...emptyForm(),
      name: "New planning task",
      activityId: `${selectedPackage.code}.${selectedPackage.tasks.length + 1}`,
      start,
      end,
      responsible: selectedPackage.owner,
      color: statusTheme.Planned.color,
    });
    setModalOpen(true);
  };

  const openCreateSubtask = (taskId = selectedPackage.tasks[0]?.id ?? "", packageId = selectedPackage.id) => {
    const planningPackage = packages.find((item) => item.id === packageId) ?? selectedPackage;
    const parentTask = planningPackage.tasks.find((task) => task.id === taskId) ?? planningPackage.tasks[0];
    if (!planningPackage.id) {
      openCreatePhase();
      showToast("Create a phase first.");
      return;
    }
    if (!parentTask) {
      openCreateTask();
      showToast("Create a task before adding subtasks.");
      return;
    }
    const start = parentTask.subtasks.length > 0 ? addPlanDays(parentTask.subtasks[parentTask.subtasks.length - 1].end, 1) : parentTask.start;
    const end = parsePlanDate(start) > parsePlanDate(parentTask.end) ? addPlanDays(start, 3) : parentTask.end;
    setEditState({ mode: "create-subtask", packageId: planningPackage.id, taskId: parentTask.id });
    setForm({
      ...emptyForm(),
      name: "New subtask",
      activityId: `${parentTask.code}.${parentTask.subtasks.length + 1}`,
      start,
      end,
      dependencies: [{
        id: `dep-${Date.now()}`,
        predecessorId: parentTask.id,
        type: "FS",
        lag: "",
      }],
      responsible: planningResponsible(parentTask, planningPackage),
      parentTaskId: parentTask.id,
      color: "#8ea3b7",
    });
    setModalOpen(true);
  };

  const openCreatePhase = () => {
    setEditState({ mode: "create-phase" });
    const start = SCHEDULE_TODAY;
    const end = addPlanDays(SCHEDULE_TODAY, 10);
    setForm({
      ...emptyForm(),
      name: "New Phase",
      activityId: String(packages.length + 1),
      start,
      end,
      dependencies: [],
      bufferDays: 0,
      bufferReason: "Weather Risk",
      bufferType: "Task Buffer",
      bufferVisible: true,
      delayStatus: "On Track",
      delayReason: "Other",
      recoveryPlan: "",
      progress: 0,
      responsible: "Planning",
      parentTaskId: "",
      color: "#0f172a",
    });
    setModalOpen(true);
  };

  const saveSchedule = () => {
    if (!editState || !form.name.trim() || !form.start || !form.end) {
      return;
    }

    const normalizedStatus = form.status;
    const normalizedEnd = parsePlanDate(form.end) < parsePlanDate(form.start) ? form.start : form.end;
    const normalizedProgress = normalizedStatus === "Completed"
      ? 100
      : form.actualStart && form.actualEnd
        ? clampPercent((delaySnapshot.actualDays / planDaysBetween(form.start, normalizedEnd)) * 100)
        : clampPercent(form.progress);

    const normalizedItem = {
      name: form.name.trim(),
      activityId: form.activityId.trim() || undefined,
      start: form.start,
      end: normalizedEnd,
      actualStart: form.actualStart || undefined,
      actualEnd: form.actualEnd || undefined,
      actual: delaySnapshot.actualDays,
      progress: normalizedProgress,
      float: computedFloat,
      constraint: form.constraint,
      dependencies: normalizeDependencies(form.dependencies),
      bufferDays: Math.max(0, Number(form.bufferDays || 0)),
      bufferReason: form.bufferReason,
      bufferType: form.bufferType,
      bufferVisible: form.bufferVisible,
      delayStatus: delaySnapshot.delayStatus,
      delayReason: form.delayReason,
      delayImpact: delaySnapshot.delayImpact,
      recoveryPlan: form.recoveryPlan.trim() || undefined,
      status: normalizedStatus,
      responsible: form.responsible,
      owner: form.responsible,
      color: form.color,
    };

    let nextPackages = [...packages];

    if (editState.mode === "create-phase") {
      const nextPackage: PlanningPackage = {
        id: `package-${Date.now()}`,
        code: form.activityId || `${packages.length + 1}`,
        ...normalizedItem,
        tasks: [],
      };
      nextPackages = [...nextPackages, nextPackage];
      setSelectedPackageId(nextPackage.id);
    } else {
      nextPackages = nextPackages.map((planningPackage) => {
        if (planningPackage.id !== editState.packageId) return planningPackage;

        if (editState.mode === "create-task") {
          const nextTask: PlanningTask = {
            id: `task-${Date.now()}`,
            code: form.activityId || `${planningPackage.code}.${planningPackage.tasks.length + 1}`,
            ...normalizedItem,
            subtasks: [],
          };
          return syncPackage(renumberPackage({ ...planningPackage, tasks: [...planningPackage.tasks, nextTask] }));
        }

        if (editState.mode === "create-subtask") {
          const parentTaskId = form.parentTaskId || editState.taskId;
          const nextTasks = planningPackage.tasks.map((task) => {
            if (task.id !== parentTaskId) return task;
            const nextSubtask: PlanningSubtask = {
              id: `subtask-${Date.now()}`,
              code: form.activityId || `${task.code}.${task.subtasks.length + 1}`,
              ...normalizedItem,
            };
            return { ...task, subtasks: [...task.subtasks, nextSubtask] };
          });
          return syncPackage(renumberPackage({ ...planningPackage, tasks: nextTasks }));
        }

        // Edit mode
        const nextTasks = planningPackage.tasks.map((task) => {
          if (editState.subtaskId && task.id === editState.taskId) {
            return {
              ...task,
              subtasks: task.subtasks.map((subtask) => (
                subtask.id === editState.subtaskId ? { ...subtask, ...normalizedItem } : subtask
              )),
            };
          }
          if (task.id === editState.taskId) {
            return { ...task, ...normalizedItem };
          }
          return task;
        });

        // If editing the package itself
        const updatedPackage = (editState.taskId || editState.subtaskId)
          ? { ...planningPackage, tasks: nextTasks }
          : { ...planningPackage, ...normalizedItem };

        return syncPackage(renumberPackage(updatedPackage));
      });
    }

    const cascadedPackages = cascadeSchedule(nextPackages);
    setPackages(cascadedPackages);
    setModalOpen(false);
    setEditState(null);
    setHovered(null);
    showToast(editState.mode === "edit" ? "Schedule updated." : "Item created successfully.");
  };

  const runDummy = () => {
    const phaseId = `dummy-phase-${Date.now()}`;
    const taskId = `dummy-task-${Date.now()}`;
    const subtaskId = `dummy-subtask-${Date.now()}`;
    
    const dummyPhase: PlanningPackage = {
      id: phaseId,
      code: String(packages.length + 1),
      name: "Dummy Test Phase",
      start: SCHEDULE_TODAY,
      end: addPlanDays(SCHEDULE_TODAY, 15),
      progress: 0,
      status: "Planned",
      responsible: "Antigravity",
      owner: "Antigravity",
      color: "#0f172a",
      dependencies: [],
      tasks: [
        {
          id: taskId,
          code: `${packages.length + 1}.1`,
          name: "Dummy Task A",
          start: SCHEDULE_TODAY,
          end: addPlanDays(SCHEDULE_TODAY, 5),
          progress: 0,
          status: "Planned",
          responsible: "Antigravity",
          color: "#2563eb",
          dependencies: [],
          subtasks: [
            {
              id: subtaskId,
              code: `${packages.length + 1}.1.1`,
              name: "Dummy Subtask A.1 (Dependent)",
              start: addPlanDays(SCHEDULE_TODAY, 7),
              end: addPlanDays(SCHEDULE_TODAY, 12),
              progress: 0,
              status: "Planned",
              responsible: "Antigravity",
              color: "#8ea3b7",
              dependencies: [{ id: `dep-${Date.now()}`, predecessorId: taskId, type: "FS", lag: "+2d" }],
            }
          ]
        }
      ]
    };
    
    const nextPackages = cascadeSchedule([...packages, dummyPhase]);
    setPackages(nextPackages);
    setSelectedPackageId(phaseId);
    showToast("Dummy Phase, Task, and Dependent Subtask created!");
  };

  const exportRows = () => {
    const rows = [["Phase", "Type", "Activity ID", "Task", "Parent Task", "Start", "Finish", "Actual Days", "Float", "Constraint", "Dependency", "Responsible", "BEP Section", "Deliverable", "Status"]];
    packages.forEach((planningPackage) => {
      rows.push([planningPackage.name, "Phase", activityId(planningPackage), planningPackage.name, "", planningPackage.start, planningPackage.end, `${planningActual(planningPackage)}d`, `${planningFloat(planningPackage)}d`, planningConstraint(planningPackage), planningDependency(planningPackage), planningResponsible(planningPackage), planningPackage.bepSection || "", planningPackage.output || "", planningPackage.status]);
      planningPackage.tasks.forEach((task) => {
        rows.push([planningPackage.name, "Task", activityId(task), task.name, "", task.start, task.end, `${planningActual(task)}d`, `${planningFloat(task)}d`, planningConstraint(task), planningDependency(task), planningResponsible(task, planningPackage), task.bepSection || "", task.output || "", task.status]);
        task.subtasks.forEach((subtask) => {
          rows.push([planningPackage.name, "Subtask", activityId(subtask), subtask.name, task.name, subtask.start, subtask.end, `${planningActual(subtask)}d`, `${planningFloat(subtask)}d`, planningConstraint(subtask), planningDependency(subtask, task.code), planningResponsible(subtask, planningPackage), subtask.bepSection || task.bepSection || "", subtask.output || task.output || "", subtask.status]);
        });
      });
    });
    return rows;
  };

  const downloadBlob = (content: BlobPart, type: string, filename: string) => {
    const url = URL.createObjectURL(new Blob([content], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = exportRows();
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    downloadBlob(csv, "text/csv;charset=utf-8", "planning-wbs-data.csv");
    showToast("CSV exported.");
  };

  const escapeHtml = (value: string) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const exportWord = () => {
    const rows = exportRows();
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#111827}h1{font-size:20px}table{border-collapse:collapse;width:100%;font-size:10px}th,td{border:1px solid #d7dee8;padding:6px;vertical-align:top}th{background:#f3f6fa;text-align:left}</style></head><body><h1>Planning WBS Export</h1><table><thead><tr>${rows[0].map((cell) => `<th>${escapeHtml(String(cell))}</th>`).join("")}</tr></thead><tbody>${rows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(String(cell))}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
    downloadBlob(html, "application/msword;charset=utf-8", "planning-wbs-data.doc");
    showToast("Word document exported.");
  };

  const escapePdfText = (value: string) => String(value).replace(/[^\x20-\x7E]/g, " ").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const buildSimplePdf = (title: string, lines: string[]) => {
    const pageLines = 42;
    const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / pageLines)) }, (_, index) => lines.slice(index * pageLines, (index + 1) * pageLines));
    const objects: string[] = [];
    const pageObjectIds: number[] = [];
    const contentObjectIds: number[] = [];
    objects.push("<< /Type /Catalog /Pages 2 0 R >>");
    objects.push("");
    pages.forEach((page, index) => {
      const content = [
        "BT",
        "/F1 14 Tf",
        "36 806 Td",
        `(${escapePdfText(index === 0 ? title : `${title} continued`)}) Tj`,
        "/F1 8 Tf",
        "0 -20 Td",
        ...page.flatMap((line) => [`(${escapePdfText(line).slice(0, 142)}) Tj`, "0 -14 Td"]),
        "ET",
      ].join("\n");
      const pageId = 3 + index * 2;
      const contentId = pageId + 1;
      pageObjectIds.push(pageId);
      contentObjectIds.push(contentId);
      objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${3 + pages.length * 2} 0 R >> >> /Contents ${contentId} 0 R >>`);
      objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    });
    objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;
    objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((object, index) => {
      offsets.push(pdf.length);
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return pdf;
  };

  const exportPdf = () => {
    const rows = exportRows();
    const lines = rows.slice(1).map((row) => `${row[2]} | ${row[1]} | ${row[3]} | ${row[10]} | ${row[11]} | ${row[13]} | ${row[14]}`);
    downloadBlob(buildSimplePdf("Planning WBS Export", lines), "application/pdf", "planning-wbs-data.pdf");
    showToast("PDF exported.");
  };

  const downloadExport = () => {
    if (exportFormat === "PDF") {
      exportPdf();
      return;
    }
    if (exportFormat === "Word") {
      exportWord();
      return;
    }
    exportCsv();
  };

  const renderExportControls = () => (
    <div className="inline-flex items-center gap-1.5">
      <label className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-600">
        <span className="whitespace-nowrap">Export as:</span>
        <select value={exportFormat} onChange={(event) => setExportFormat(event.target.value as ExportFormat)} className="h-7 rounded-md border-0 bg-transparent pr-1 text-xs font-medium text-gray-800 outline-none">
          <option>CSV</option>
          <option>PDF</option>
          <option>Word</option>
        </select>
      </label>
      <button type="button" onClick={downloadExport} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:border-gray-300">
        <Download className="h-3.5 w-3.5" />
        Download
      </button>
    </div>
  );

  const handleBarHover = (event: MouseEvent<HTMLButtonElement>, item: TimelineItem) => {
    setHovered({ item, x: event.clientX, y: event.clientY });
  };

  const renderTimelineBar = (item: TimelineItem, bounds: { start: string; end: string }, compact = false) => {
    const hasVisibleBuffer = item.bufferVisible !== false && bufferDays(item) > 0;
    const bufferStart = addPlanDays(item.end, 1);
    const bufferEnd = bufferEndDate(item);
    const mainVisible = rangesOverlap(item.start, item.end, bounds);
    const bufferVisibleInRange = hasVisibleBuffer && rangesOverlap(bufferStart, bufferEnd, bounds);

    if (!mainVisible && !bufferVisibleInRange) {
      return null;
    }

    return (
      <>
        {bufferVisibleInRange && (
          <span
            className={cx(
              "absolute top-1/2 -translate-y-1/2 rounded-full border border-dashed border-slate-300 bg-slate-200/45",
              compact ? "h-3" : "h-5",
            )}
            style={clippedTimelinePosition(bufferStart, bufferEnd, bounds)}
            title={`Planned buffer: ${bufferDays(item)} days (${item.bufferReason || "Schedule buffer"})`}
          />
        )}
        {mainVisible && <button
          key={`${item.itemType}-${item.id}`}
          type="button"
          onClick={() => item.itemType !== "package" && openEditModal(item.packageId, item.taskId ?? item.id, item.itemType === "subtask" ? item.id : undefined)}
          onMouseEnter={(event) => handleBarHover(event, item)}
          onMouseMove={(event) => handleBarHover(event, item)}
          onMouseLeave={() => setHovered(null)}
          className={cx(
            "absolute top-1/2 flex -translate-y-1/2 items-center overflow-hidden rounded-full text-left text-white shadow-sm outline-none transition-all hover:brightness-95 focus:ring-2 focus:ring-slate-300",
            compact ? "h-3" : "h-5",
            item.itemType === "subtask" && "opacity-80 shadow-none",
          )}
          style={{ ...clippedTimelinePosition(item.start, item.end, bounds), background: timelineColor(item) }}
          title={`${item.name}: ${formatPlanDate(item.start)} - ${formatPlanDate(item.end)}`}
        >
          {!compact && <span className="truncate px-2 text-[10px] font-medium">{item.name}</span>}
        </button>}
      </>
    );
  };

  const renderTimeline = () => {
    const defaultBounds = view === "timeline" ? selectedBounds : allBounds;
    const hasCustomBounds = Boolean(
      timelineRangeStart &&
      timelineRangeEnd &&
      parsePlanDate(timelineRangeStart) <= parsePlanDate(timelineRangeEnd),
    );
    const bounds = hasCustomBounds ? { start: timelineRangeStart, end: timelineRangeEnd } : defaultBounds;
    const packagesToRender = view === "timeline" ? (selectedPackage.id ? [selectedPackage] : []) : packages;
    const totalDays = planDaysBetween(bounds.start, bounds.end);
    const baseTimelineWidth = Math.max(1080, totalDays * 20);
    const timelineWidth = Math.max(1080, Math.round(baseTimelineWidth * zoomLevel));

    const drawArrows = () => {
      let currentY = 40; // header height
      const coords: Record<string, { startX: number; endX: number; y: number; dependencies: ScheduleDependency[] }> = {};
      const tDays = Math.max(1, planDaysBetween(bounds.start, bounds.end));

      const getX = (date: string, isEnd: boolean) => {
        const offset = planDaysBetween(bounds.start, date);
        return Math.max(0, Math.min(timelineWidth, ((offset + (isEnd ? 1 : 0)) / tDays) * timelineWidth));
      };

      packagesToRender.forEach(p => {
        if (view !== "wbs") {
          coords[p.id] = { startX: getX(p.start, false), endX: getX(p.end, true), y: currentY + 20, dependencies: [] };
          currentY += 40;
        }
        p.tasks.forEach(t => {
          coords[t.id] = { startX: getX(t.start, false), endX: getX(t.end, true), y: currentY + 22, dependencies: normalizeDependencies(t.dependencies) };
          currentY += 44;
          t.subtasks.forEach(s => {
            coords[s.id] = { startX: getX(s.start, false), endX: getX(s.end, true), y: currentY + 18, dependencies: normalizeDependencies(s.dependencies) };
            currentY += 36;
          });
        });
      });

      const paths: React.ReactNode[] = [];
      Object.entries(coords).forEach(([id, curr]) => {
        curr.dependencies.forEach(dependency => {
          const pred = coords[dependency.predecessorId];
          if (pred) {
            const startX = pred.endX;
            const startY = pred.y;
            const endX = curr.startX;
            const endY = curr.y;

            let d = "";
            if (endX > startX + 20) {
              const midX = startX + 10;
              d = `M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX - 2} ${endY}`;
            } else {
              const midY = startY + (endY - startY) / 2;
              d = `M ${startX} ${startY} L ${startX + 10} ${startY} L ${startX + 10} ${midY} L ${endX - 10} ${midY} L ${endX - 10} ${endY} L ${endX - 2} ${endY}`;
            }

            paths.push(
              <path 
                key={`${dependency.id}-${id}`} 
                d={d} 
                fill="none" 
                stroke="#64748b" 
                strokeWidth="1.5" 
                markerEnd="url(#arrowhead)" 
              />
            );
          }
        });
      });

      return (
        <svg className="absolute top-0 left-[240px] pointer-events-none" style={{ width: timelineWidth, height: currentY, zIndex: 15 }}>
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#64748b" />
            </marker>
          </defs>
          {paths}
        </svg>
      );
    };

    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-950">{view === "gantt" ? "Gantt Chart" : "Task Timeline"}</p>
            <p className="mt-1 text-xs font-normal text-gray-500">
              {formatPlanDate(bounds.start)} - {formatPlanDate(bounds.end)} across {packagesToRender.length} work packages
              {hasCustomBounds ? " · filtered range" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!timelineRangeStart) setTimelineRangeStart(defaultBounds.start);
                  if (!timelineRangeEnd) setTimelineRangeEnd(defaultBounds.end);
                  setTimelineDateRangeOpen((current) => !current);
                }}
                className={cx(
                  "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors",
                  hasCustomBounds ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
                )}
                title="Calendar date range filter"
              >
                <Calendar className="h-3.5 w-3.5" />
                Date Range
              </button>
              {timelineDateRangeOpen && (
                <div className="absolute right-0 top-11 z-40 w-[300px] rounded-xl border border-slate-200 bg-white p-3 shadow-[0_16px_46px_rgba(15,23,42,0.16)]">
                  <div className="mb-3">
                    <p className="text-xs font-medium text-slate-950">Calendar filter</p>
                    <p className="mt-1 text-[11px] font-normal text-slate-500">Choose the date range you want to inspect on the timeline.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <label>
                      <span className="mb-1 block text-[10px] font-medium uppercase text-slate-500">From</span>
                      <input
                        type="date"
                        value={timelineRangeStart || defaultBounds.start}
                        onChange={(event) => setTimelineRangeStart(event.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs outline-none focus:border-blue-300 focus:bg-white"
                      />
                    </label>
                    <label>
                      <span className="mb-1 block text-[10px] font-medium uppercase text-slate-500">To</span>
                      <input
                        type="date"
                        value={timelineRangeEnd || defaultBounds.end}
                        onChange={(event) => setTimelineRangeEnd(event.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs outline-none focus:border-blue-300 focus:bg-white"
                      />
                    </label>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setTimelineRangeStart("");
                        setTimelineRangeEnd("");
                        setTimelineDateRangeOpen(false);
                      }}
                      className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!timelineRangeStart) setTimelineRangeStart(defaultBounds.start);
                        if (!timelineRangeEnd) setTimelineRangeEnd(defaultBounds.end);
                        setTimelineDateRangeOpen(false);
                      }}
                      className="h-8 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 p-1 mr-2 bg-gray-50/50">
              <button type="button" onClick={() => setZoomLevel((z) => Math.max(0.2, z - 0.2))} className="flex h-7 w-7 items-center justify-center rounded bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200" title="Zoom Out">
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => setZoomLevel((z) => Math.min(3, z + 0.2))} className="flex h-7 w-7 items-center justify-center rounded bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200" title="Zoom In">
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-0.5"></div>
              <button type="button" onClick={() => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })} className="flex h-7 w-7 items-center justify-center rounded bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200" title="Scroll left">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <button type="button" onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })} className="flex h-7 w-7 items-center justify-center rounded bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200" title="Scroll right">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <button
              type="button"
              onClick={() => setAnalyticsOpen((current) => !current)}
              className={cx(
                "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-colors",
                analyticsOpen ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300",
              )}
            >
              {analyticsOpen ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {analyticsOpen ? "Hide visualization" : "Show visualization"}
            </button>
            <button type="button" onClick={openCreateTask} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:border-gray-300">
              <Plus className="h-3.5 w-3.5" />
              Create task
            </button>
            <button type="button" onClick={() => openCreateSubtask()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:border-gray-300">
              <Plus className="h-3.5 w-3.5" />
              Create subtask
            </button>
            {renderExportControls()}
          </div>
        </div>

        <div className={cx("grid gap-4", analyticsOpen && "lg:grid-cols-[minmax(0,1fr)_300px]")}>
          <div className="min-w-0">
            <div ref={scrollRef} className="max-h-[66vh] overflow-auto border-t border-gray-100 bg-white relative">
              <div className="min-w-full w-max bg-white relative" style={{ "--timeline-width": `${timelineWidth}px` } as React.CSSProperties}>
                {drawArrows()}
                <div className="sticky top-0 z-20 grid border-b border-gray-200 bg-gray-50 cursor-grab active:cursor-grabbing" style={{ gridTemplateColumns: "240px minmax(var(--timeline-width), 1fr)" }} onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUpOrLeave} onMouseLeave={handleMouseUpOrLeave}>
                  <div className="sticky left-0 z-30 border-r border-gray-200 bg-gray-50 px-4 py-3 text-[11px] font-medium uppercase tracking-normal text-gray-500 pointer-events-none">Task</div>
                  <div className="relative min-h-10 pointer-events-none">
                    {axisTicks(bounds, timelineWidth).map((tick) => (
                      <span key={tick.date} className="absolute top-3 -translate-x-1/2 text-[11px] font-medium text-gray-500" style={{ left: tick.left }}>
                        {formatPlanDate(tick.date, true)}
                      </span>
                    ))}
                  </div>
                </div>

                {packagesToRender.map((planningPackage) => (
                  <div key={planningPackage.id}>
                    {view !== "wbs" && (
                      <div className="grid min-h-10 border-b border-gray-100 bg-slate-50/70" style={{ gridTemplateColumns: "240px minmax(var(--timeline-width), 1fr)" }}>
                        <div className="sticky left-0 z-10 border-r border-gray-200 bg-slate-50/90 px-4 py-2.5 backdrop-blur-sm">
                          <p className="truncate text-xs font-medium text-slate-800">{activityId(planningPackage)}. {planningPackage.name}</p>
                          <p className="mt-0.5 text-[10px] font-normal text-slate-500">{planningPackage.tasks.length} tasks / {planningPackage.tasks.reduce((sum, task) => sum + task.subtasks.length, 0)} subtasks</p>
                        </div>
                        <div className="relative min-h-10 bg-[linear-gradient(90deg,#eef2f7_1px,transparent_1px)] bg-[length:80px_100%]">
                          {renderTimelineBar({ ...planningPackage, itemType: "package", packageId: planningPackage.id }, bounds, true)}
                        </div>
                      </div>
                    )}

                    {planningPackage.tasks.map((task) => (
                      <div key={task.id}>
                        <div className="grid min-h-11 border-b border-gray-100" style={{ gridTemplateColumns: "240px minmax(var(--timeline-width), 1fr)" }}>
                          <div className="sticky left-0 z-10 flex min-w-0 items-center justify-between gap-3 border-r border-gray-200 bg-white/95 px-4 py-2 backdrop-blur-sm">
                            <div className="min-w-0">
                              <p className="truncate text-xs font-medium text-slate-950">{activityId(task)} {task.name}</p>
                              <p className="mt-0.5 truncate text-[10px] font-normal text-slate-500">{planningResponsible(task, planningPackage)} - Float {planningFloat(task)}d - {task.subtasks.length} subtasks</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => openCreateSubtask(task.id, planningPackage.id)}
                              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-500 hover:bg-gray-50"
                              title="Create subtask"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="relative min-h-11 bg-[linear-gradient(90deg,#eef2f7_1px,transparent_1px)] bg-[length:80px_100%]">
                            {renderTimelineBar({ ...task, itemType: "task", packageId: planningPackage.id }, bounds)}
                          </div>
                        </div>

                        {task.subtasks.map((subtask) => (
                          <div key={subtask.id} className="grid min-h-9 border-b border-gray-100" style={{ gridTemplateColumns: "240px minmax(var(--timeline-width), 1fr)" }}>
                            <div className="sticky left-0 z-10 relative border-r border-gray-200 bg-white/95 py-2 pl-8 pr-4 backdrop-blur-sm">
                              <span className="absolute left-5 top-4 h-px w-2 bg-slate-300" />
                              <p className="truncate text-[11px] font-normal text-slate-600">{activityId(subtask)} {subtask.name}</p>
                              <p className="mt-0.5 truncate text-[9px] font-normal text-slate-400">{planningResponsible(subtask, planningPackage)} - {planningActual(subtask)} days actual</p>
                            </div>
                            <div className="relative min-h-9 bg-[linear-gradient(90deg,#eef2f7_1px,transparent_1px)] bg-[length:80px_100%]">
                              {renderTimelineBar({ ...subtask, itemType: "subtask", packageId: planningPackage.id, taskId: task.id }, bounds, true)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
                {packagesToRender.length === 0 && (
                  <div className="min-w-[760px] p-10 text-center">
                    <p className="text-sm font-medium text-slate-700">No timeline data yet</p>
                    <p className="mt-1 text-xs font-normal text-slate-500">Create a phase and task to build the schedule timeline.</p>
                    <button type="button" onClick={openCreatePhase} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
                      <Plus className="h-3.5 w-3.5" />
                      Create phase
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-100 bg-gray-50 px-4 py-2 text-[11px] font-normal text-gray-500">
              Scroll horizontally to inspect a particular date range. Hover any bar for full details, click task/subtask bars to modify the schedule.
            </div>
          </div>

          {analyticsOpen && (
            <aside className="border-t border-gray-100 bg-white p-4 lg:border-l lg:border-t-0">
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-950">Schedule Visualization</p>
                <p className="mt-1 text-xs font-normal text-gray-500">Live rollup from work packages, tasks, and subtasks.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xl font-medium text-slate-950">{overallProgress}%</p>
                  <p className="mt-1 text-[10px] font-medium uppercase text-slate-500">Avg progress</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xl font-medium text-slate-950">{allTasks.length}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase text-slate-500">Tasks</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xl font-medium text-slate-950">{allSubtasks.length}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase text-slate-500">Subtasks</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
                  <p className="text-xl font-medium text-slate-950">{planDaysBetween(allBounds.start, allBounds.end)}</p>
                  <p className="mt-1 text-[10px] font-medium uppercase text-slate-500">Days range</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {statusOptions.map((status) => {
                  const count = [...allTasks, ...allSubtasks].filter((item) => item.status === status).length;
                  const total = allTasks.length + allSubtasks.length;
                  const width = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={status} className="grid grid-cols-[82px_1fr_28px] items-center gap-2 text-[11px] font-medium text-slate-600">
                      <span>{status}</span>
                      <span className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <span className="block h-full rounded-full" style={{ width: `${width}%`, background: statusTheme[status].color }} />
                      </span>
                      <span className="text-right">{count}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 space-y-2">
                {packages.map((planningPackage) => (
                  <div key={planningPackage.id}>
                    <div className="mb-1 flex justify-between gap-3 text-[11px] font-medium text-slate-600">
                      <span className="truncate">{planningPackage.name}</span>
                      <span>{planningPackage.progress}%</span>
                    </div>
	                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
	                      <div className="h-full rounded-full" style={{ width: `${planningPackage.progress}%`, background: timelineColor(planningPackage) }} />
	                    </div>
	                  </div>
	                ))}
              </div>
            </aside>
          )}
        </div>
      </div>
    );
  };

  const renderMilestones = () => {
    const milestonePersonByDepartment: Record<string, string> = {
      Planning: "Riya Sharma",
      Civil: "Amit Patel",
      MEP: "Farhan Khan",
      "QA/QC": "Neha Das",
      Procurement: "Karan Mehta",
    };
    const milestoneMeta = (row: MilestoneRow) => {
      const department = row.owner || planningResponsible(row);
      return {
        department,
        assignee: milestonePersonByDepartment[department] || `${department} Lead`,
        owner: row.phaseName,
        createdBy: department === "Planning" ? "Planning Office" : `${department} Coordinator`,
        createdFor: row.phaseName,
      };
    };
    const allSortedMilestones = [...milestoneRows].sort((a, b) => parsePlanDate(a.end).getTime() - parsePlanDate(b.end).getTime());
    const sortedMilestones = allSortedMilestones.filter((row) => {
      const meta = milestoneMeta(row);
      return (
        (milestoneDepartmentFilter === "All Departments" || meta.department === milestoneDepartmentFilter) &&
        (milestoneAssigneeFilter === "All Assignees" || meta.assignee === milestoneAssigneeFilter) &&
        (milestoneOwnerFilter === "All Milestones" || meta.owner === milestoneOwnerFilter) &&
        (milestoneCreatedByFilter === "All Creators" || meta.createdBy === milestoneCreatedByFilter) &&
        (milestoneCreatedForFilter === "All Recipients" || meta.createdFor === milestoneCreatedForFilter)
      );
    });
    const nextMilestone = sortedMilestones.find((row) => parsePlanDate(row.end) >= parsePlanDate(SCHEDULE_TODAY));
    const selectedVisibleMilestone = selectedMilestone && sortedMilestones.some((row) => row.packageId === selectedMilestone.packageId && row.id === selectedMilestone.id)
      ? selectedMilestone
      : null;
    const activeMilestone = selectedVisibleMilestone ?? nextMilestone ?? sortedMilestones[0] ?? null;
    const focusedMilestone = activeMilestone;
    const focusedMilestoneIndex = focusedMilestone
      ? sortedMilestones.findIndex((row) => row.packageId === focusedMilestone.packageId && row.id === focusedMilestone.id)
      : -1;
    const subtaskRowOffset = Math.max(0, focusedMilestoneIndex) * 258;
    const milestoneOptionValues = (key: keyof ReturnType<typeof milestoneMeta>) => Array.from(new Set(allSortedMilestones.map((row) => milestoneMeta(row)[key]))).sort();

    const selectMilestone = (row: MilestoneRow) => {
      setSelectedMilestoneRef({ packageId: row.packageId, taskId: row.id });
      setSelectedPackageId(row.packageId);
    };

    const milestoneTone = (row: PlanningTask | PlanningSubtask) => {
      const completed = row.status === "Completed" || row.progress >= 100;
      const current = !completed && (
        (row.progress > 0 && row.progress < 100) ||
        (parsePlanDate(row.start) <= parsePlanDate(SCHEDULE_TODAY) && parsePlanDate(row.end) >= parsePlanDate(SCHEDULE_TODAY))
      );
      const overdue = !completed && parsePlanDate(row.end) < parsePlanDate(SCHEDULE_TODAY);

      if (completed) {
        return {
          label: "Completed",
          color: "#94a3b8",
          badgeClass: "border-slate-200 bg-slate-100 text-slate-500",
          dateClass: "border-slate-200 bg-slate-50 text-slate-500 opacity-70",
          nodeClass: "ring-4 ring-slate-100 opacity-70",
          cardClass: "border-slate-200 bg-slate-50/80 text-slate-500 opacity-75 grayscale-[0.1]",
        };
      }
      if (current) {
        return {
          label: "In progress",
          color: "#2563eb",
          badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
          dateClass: "border-blue-200 bg-blue-50/70 text-blue-800 ring-2 ring-blue-100",
          nodeClass: "ring-4 ring-blue-100",
          cardClass: "border-blue-300 bg-white shadow-[0_0_0_1px_rgba(37,99,235,0.16),0_16px_38px_rgba(37,99,235,0.16)]",
        };
      }
      if (overdue) {
        return {
          label: `${Math.max(1, Math.abs(dateDiffDays(SCHEDULE_TODAY, row.end)))}d late`,
          color: "#e11d48",
          badgeClass: "border-rose-100 bg-rose-50 text-rose-700",
          dateClass: "border-rose-100 bg-rose-50 text-rose-700",
          nodeClass: "ring-4 ring-rose-100",
          cardClass: "border-rose-100 bg-white",
        };
      }
      return {
        label: `${Math.max(1, dateDiffDays(SCHEDULE_TODAY, row.end))}d away`,
        color: "#7c3aed",
        badgeClass: "border-violet-100 bg-violet-50 text-violet-700",
        dateClass: "border-violet-100 bg-violet-50/70 text-violet-800",
        nodeClass: "ring-4 ring-violet-100",
        cardClass: "border-violet-100 bg-white",
      };
    };

    const milestoneBadge = (row: MilestoneRow) => {
      const tone = milestoneTone(row);
      return { label: tone.label, className: tone.badgeClass };
    };

    const subtaskMilestoneBadge = (row: PlanningSubtask) => {
      const tone = milestoneTone(row);
      return { label: tone.label === "Completed" ? "Done" : tone.label, className: tone.badgeClass };
    };

    const showMilestoneInfo = (event: MouseEvent<HTMLElement>, row: MilestoneRow) => {
      event.stopPropagation();
      if (suppressHorizontalClick.current) return;
      setHoveredMilestone({ item: row, x: event.clientX, y: event.clientY });
    };

    const renderMilestoneHoverCard = () => {
      if (!hoveredMilestone) return null;
      const row = hoveredMilestone.item;
      const badge = milestoneBadge(row);
      const tone = milestoneTone(row);
      const meta = milestoneMeta(row);
      const left = Math.min(hoveredMilestone.x + 16, window.innerWidth - 420);
      const top = Math.min(hoveredMilestone.y + 16, window.innerHeight - 560);

      return (
        <div
          className="fixed z-[75] w-[398px] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[0_24px_70px_rgba(15,23,42,0.18)]"
          style={{ left: Math.max(12, left), top: Math.max(12, top) }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-950">{activityId(row)} {row.name}</p>
              <p className="mt-1 text-[11px] font-normal text-slate-500">{row.phaseName} - {planningResponsible(row)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className={cx("rounded-full border px-2 py-1 text-[10px] font-medium", badge.className)}>{badge.label}</span>
              <button
                type="button"
                onClick={() => setHoveredMilestone(null)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                title="Close details"
              >
                ×
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
              <p className="text-[9px] font-medium uppercase text-slate-400">Start</p>
              <p className="mt-1 text-xs font-medium text-slate-700">{formatPlanDate(row.start)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
              <p className="text-[9px] font-medium uppercase text-slate-400">Finish</p>
              <p className="mt-1 text-xs font-medium text-slate-700">{formatPlanDate(row.end)}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
              <p className="text-[9px] font-medium uppercase text-slate-400">Status</p>
              <p className="mt-1 text-xs font-medium text-slate-700">{row.status}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
              <p className="text-[9px] font-medium uppercase text-slate-400">Progress</p>
              <p className="mt-1 text-xs font-medium text-slate-700">{row.progress}% complete</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
              <p className="text-[9px] font-medium uppercase text-slate-400">Created by</p>
              <p className="mt-1 text-xs font-medium text-slate-700">{meta.createdBy}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2">
              <p className="text-[9px] font-medium uppercase text-slate-400">Created for</p>
              <p className="mt-1 text-xs font-medium text-slate-700">{meta.createdFor}</p>
            </div>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full" style={{ width: `${row.progress}%`, background: tone.color }} />
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-xs font-medium text-slate-950">Nested subtasks</p>
            <button
              type="button"
              onClick={() => {
                setHoveredMilestone(null);
                openCreateSubtask(row.id, row.packageId);
              }}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Plus className="h-3 w-3" />
              Add subtask
            </button>
          </div>

          <div className="mt-2 max-h-44 space-y-2 overflow-y-auto pr-1">
            {row.subtasks.length > 0 ? row.subtasks.map((subtask) => (
              <div key={subtask.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-normal text-slate-700">{activityId(subtask)} {subtask.name}</p>
                    <p className="mt-0.5 text-[10px] font-normal text-slate-400">{formatPlanDate(subtask.start, true)} - {formatPlanDate(subtask.end, true)} - {planningResponsible(subtask, row)}</p>
                  </div>
                  <span className={cx("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium", subtaskMilestoneBadge(subtask).className)}>{subtaskMilestoneBadge(subtask).label}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full" style={{ width: `${subtask.progress}%`, background: milestoneTone(subtask).color }} />
                </div>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-3 text-xs font-normal text-slate-500">
                No subtasks are added to this milestone yet.
              </div>
            )}
          </div>
        </div>
      );
    };

    const milestoneFilters = [
      {
        label: "Department",
        value: milestoneDepartmentFilter,
        setValue: setMilestoneDepartmentFilter,
        all: "All Departments",
        options: milestoneOptionValues("department"),
      },
      {
        label: "Assigned person",
        value: milestoneAssigneeFilter,
        setValue: setMilestoneAssigneeFilter,
        all: "All Assignees",
        options: milestoneOptionValues("assignee"),
      },
      {
        label: "Milestone of",
        value: milestoneOwnerFilter,
        setValue: setMilestoneOwnerFilter,
        all: "All Milestones",
        options: milestoneOptionValues("owner"),
      },
      {
        label: "Created by",
        value: milestoneCreatedByFilter,
        setValue: setMilestoneCreatedByFilter,
        all: "All Creators",
        options: milestoneOptionValues("createdBy"),
      },
      {
        label: "Created for",
        value: milestoneCreatedForFilter,
        setValue: setMilestoneCreatedForFilter,
        all: "All Recipients",
        options: milestoneOptionValues("createdFor"),
      },
    ];

    return (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap border-b border-slate-100 px-3 py-2">
            <div className="flex shrink-0 items-center gap-2">
              <p className="text-sm font-medium text-slate-950">Key Milestone Timeline</p>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                {formatPlanDate(allBounds.start, true)} - {formatPlanDate(allBounds.end, true)}
              </span>
            </div>
            <div className="flex min-w-max flex-1 items-center gap-2">
              {milestoneFilters.map((filter) => (
                <label key={filter.label} className="relative">
                  <span className="sr-only">{filter.label}</span>
                  <select
                    value={filter.value}
                    onChange={(event) => filter.setValue(event.target.value)}
                    className="h-8 w-[132px] rounded-lg border border-slate-200 bg-slate-50/70 px-2.5 text-[11px] font-normal text-slate-700 outline-none transition-colors hover:bg-white focus:border-slate-900"
                    title={filter.label}
                  >
                    <option>{filter.all}</option>
                    {filter.options.map((option) => <option key={option}>{option}</option>)}
                  </select>
                </label>
              ))}
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <span className="text-[11px] font-normal text-slate-500">{sortedMilestones.length} / {allSortedMilestones.length} milestones</span>
              <button type="button" onClick={openCreateTask} className="inline-flex h-8 items-center gap-2 rounded-lg bg-indigo-600 px-3 text-[11px] font-medium text-white hover:bg-indigo-700">
                <Plus className="h-3.5 w-3.5" />
                Add Milestone
              </button>
            </div>
          </div>
          <div
            className={cx("overflow-x-auto cursor-grab select-none active:cursor-grabbing", horizontalScrollDragging && "cursor-grabbing")}
            onMouseDown={startHorizontalScrollDrag}
            onMouseMove={moveHorizontalScrollDrag}
            onMouseUp={stopHorizontalScrollDrag}
            onMouseLeave={stopHorizontalScrollDrag}
          >
            <div className="relative min-w-max px-6 py-5">
              <div className="absolute left-10 right-10 top-[94px] h-px bg-slate-200" />
              <div className="flex items-start gap-5">
                {sortedMilestones.length > 0 ? sortedMilestones.map((row) => {
                  const badge = milestoneBadge(row);
                  const tone = milestoneTone(row);
                  const selected = activeMilestone?.id === row.id && activeMilestone.packageId === row.packageId;
                  const isActive = selected;
                  const finishDate = parsePlanDate(row.end);
                  return (
                    <div
                      key={`${row.packageId}-${row.id}`}
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        if (suppressHorizontalClick.current) {
                          event.preventDefault();
                          return;
                        }
                        selectMilestone(row);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectMilestone(row);
                        }
                      }}
                      className="group/milestone relative w-[238px] shrink-0 cursor-grab text-left outline-none active:cursor-grabbing"
                    >
                      <div className={cx("mx-auto h-[64px] w-[64px] overflow-hidden rounded-lg border text-center shadow-sm transition-all duration-200 ease-out group-hover/milestone:-translate-y-0.5 group-hover/milestone:shadow-md motion-reduce:transition-none", tone.dateClass)}>
                        <div className="h-3" style={{ background: tone.color }} />
                        <p className="mt-2 text-xl font-medium text-current">{String(finishDate.getDate()).padStart(2, "0")}</p>
                        <p className="text-[10px] font-medium uppercase text-current/60">{finishDate.toLocaleDateString("en-GB", { month: "short" })}</p>
                      </div>
                      <span
                        className={cx(
                          "absolute left-1/2 top-[82px] h-5 w-5 -translate-x-1/2 rounded-full border-[5px] border-white shadow-sm transition-all duration-200 ease-out group-hover/milestone:scale-110 motion-reduce:transition-none",
                          tone.nodeClass,
                          isActive && "shadow-md",
                        )}
                        style={{ background: tone.color }}
                      />
                      <div className={cx(
                        "relative mt-10 rounded-xl border bg-white p-3 transition-all duration-200 ease-out hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)] group-hover/milestone:-translate-y-0.5 motion-reduce:transition-none",
                        tone.cardClass,
                        isActive && "shadow-[0_18px_45px_rgba(15,23,42,0.16),0_2px_10px_rgba(15,23,42,0.08)] -translate-y-1",
                      )}>
                        <button
                          type="button"
                          data-no-drag="true"
                          onClick={(event) => showMilestoneInfo(event, row)}
                          className={cx(
                            "absolute top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 motion-reduce:transition-none",
                            isActive ? "right-10" : "right-2",
                          )}
                          title="Milestone details"
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                        {isActive && (
                          <button
                            type="button"
                            data-no-drag="true"
                            onClick={(event) => {
                              event.stopPropagation();
                              setHoveredMilestone(null);
                              openEditModal(row.packageId, row.id);
                            }}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 motion-reduce:transition-none"
                            title="Edit milestone"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <div className={cx("mb-2 flex items-start justify-between gap-2", isActive ? "pr-16" : "pr-8")}>
                          <span className={cx("rounded-full border px-2 py-1 text-[10px] font-medium", badge.className)}>{badge.label}</span>
                          <span className="text-[10px] font-medium text-slate-400">{activityId(row)}</span>
                        </div>
                        <p className="line-clamp-2 min-h-[36px] text-sm font-medium leading-5 text-slate-950">{row.name}</p>
                        <p className="mt-1 truncate text-[11px] font-normal text-slate-500">{row.phaseName} - {planningResponsible(row)}</p>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <span className="block h-full rounded-full transition-all duration-500 ease-out group-hover/milestone:brightness-110 motion-reduce:transition-none" style={{ width: `${row.progress}%`, background: tone.color }} />
                        </div>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-500">
                          <span>{row.progress}% complete</span>
                          <span>{row.subtasks.length} subtasks</span>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="relative z-10 min-w-[720px] rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm font-normal text-slate-500">
                    No milestones match the selected filters.
                  </div>
                )}
              </div>

              {focusedMilestone && (
                <div className="relative mt-8 w-max min-w-[460px]" style={{ marginLeft: `${subtaskRowOffset}px` }}>
                  <div className="absolute left-0 right-0 top-[76px] h-px bg-slate-200" />
                  <div className="flex items-start gap-5">
                    {focusedMilestone.subtasks.map((subtask) => {
                      const badge = subtaskMilestoneBadge(subtask);
                      const tone = milestoneTone(subtask);
                      const finishDate = parsePlanDate(subtask.end);
                      const subtaskTimelineItem: TimelineItem = {
                        ...subtask,
                        itemType: "subtask",
                        packageId: focusedMilestone.packageId,
                        taskId: focusedMilestone.id,
                      };
                      return (
                        <button
                          key={`${focusedMilestone.packageId}-${focusedMilestone.id}-${subtask.id}`}
                          type="button"
                          onClick={(event) => {
                            if (suppressHorizontalClick.current) {
                              event.preventDefault();
                              return;
                            }
                            openEditModal(focusedMilestone.packageId, focusedMilestone.id, subtask.id);
                          }}
                          onMouseEnter={(event) => handleBarHover(event, subtaskTimelineItem)}
                          onMouseMove={(event) => handleBarHover(event, subtaskTimelineItem)}
                          onMouseLeave={() => setHovered(null)}
                          className="group/subtask relative w-[220px] shrink-0 cursor-grab text-left active:cursor-grabbing"
                        >
                          <div className={cx("mx-auto h-[58px] w-[58px] overflow-hidden rounded-lg border text-center shadow-sm transition-all duration-200 ease-out group-hover/subtask:-translate-y-0.5 group-hover/subtask:shadow-md motion-reduce:transition-none", tone.dateClass)}>
                            <div className="h-2.5" style={{ background: tone.color }} />
                            <p className="mt-2 text-lg font-medium text-current">{String(finishDate.getDate()).padStart(2, "0")}</p>
                            <p className="text-[9px] font-medium uppercase text-current/60">{finishDate.toLocaleDateString("en-GB", { month: "short" })}</p>
                          </div>
                          <span
                            className={cx("absolute left-1/2 top-[69px] h-4 w-4 -translate-x-1/2 rounded-full border-[4px] border-white shadow-sm transition-all duration-200 ease-out group-hover/subtask:scale-110 motion-reduce:transition-none", tone.nodeClass)}
                            style={{ background: tone.color }}
                          />
                          <div className={cx("mt-10 rounded-xl border bg-white p-3 shadow-sm transition-all duration-200 ease-out hover:border-slate-300 hover:shadow-[0_12px_30px_rgba(15,23,42,0.10)] group-hover/subtask:-translate-y-0.5 motion-reduce:transition-none", tone.cardClass)}>
                            <div className="mb-2 flex items-start justify-between gap-2">
                              <span className={cx("rounded-full border px-2 py-1 text-[10px] font-medium", badge.className)}>{badge.label}</span>
                              <span className="text-[10px] font-medium text-slate-400">{activityId(subtask)}</span>
                            </div>
                            <p className="line-clamp-2 min-h-[36px] text-xs font-medium leading-5 text-slate-800">{subtask.name}</p>
                            <p className="mt-1 truncate text-[10px] font-normal text-slate-500">{formatPlanDate(subtask.start, true)} - {formatPlanDate(subtask.end, true)} - {planningResponsible(subtask, focusedMilestone)}</p>
                            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <span className="block h-full rounded-full transition-all duration-500 ease-out group-hover/subtask:brightness-110 motion-reduce:transition-none" style={{ width: `${subtask.progress}%`, background: tone.color }} />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-slate-500">
                              <span>{subtask.progress}% complete</span>
                              <span>{planDaysBetween(subtask.start, subtask.end)} days</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={(event) => {
                        if (suppressHorizontalClick.current) {
                          event.preventDefault();
                          return;
                        }
                        openCreateSubtask(focusedMilestone.id, focusedMilestone.packageId);
                      }}
                      className="group/add relative mt-[98px] flex h-[150px] w-[220px] shrink-0 cursor-grab items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-slate-500 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] active:cursor-grabbing motion-reduce:transition-none"
                      title="Add subtask milestone"
                    >
                      <Plus className="h-6 w-6 transition-transform duration-200 ease-out group-hover/add:scale-110 motion-reduce:transition-none" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {renderMilestoneHoverCard()}
      </div>
    );
  };

  const renderBaseline = () => {
    const baselinePackages = selectedPackage.id
      ? packages.filter((planningPackage) => planningPackage.id === selectedPackage.id)
      : packages;
    const currentTaskRows = baselinePackages.flatMap((planningPackage) => planningPackage.tasks.map((task) => ({
      ...task,
      key: `${planningPackage.id}:${task.id}`,
      packageId: planningPackage.id,
      phaseName: planningPackage.name,
      currentStart: task.start,
      currentFinish: forecastEndDate(task),
      responsibleTeam: planningResponsible(task, planningPackage),
    })));
    const baselineMap = new Map((baselineSnapshot?.tasks ?? []).map((task) => [task.key, task]));
    const baselineRows = currentTaskRows.map((task) => {
      const approved = baselineMap.get(task.key);
      const baselineStart = approved?.start ?? task.start;
      const baselineFinish = approved?.end ?? task.end;
      const finishVariance = dateDiffDays(baselineFinish, task.currentFinish);
      const reason =
        !baselineSnapshot ? "No approved baseline saved" :
        !approved ? "New task after baseline" :
        finishVariance <= 0 ? "Within approved baseline" :
        task.delayReason && task.delayReason !== "Other" ? task.delayReason :
        task.status === "At Risk" ? "Open constraint risk" :
        task.status === "Delayed" ? "Execution delay" :
        "Forecast adjustment";

      return {
        ...task,
        baselineStart,
        baselineFinish,
        finishVariance,
        reason,
      };
    });
    const baselineSource = (baselineSnapshot?.tasks ?? []).filter((task) => (
      selectedPackage.id ? task.packageId === selectedPackage.id : true
    ));
    const hasSavedBaseline = Boolean(baselineSnapshot && baselineSnapshot.tasks.length > 0);
    const baselineStart = baselineSource.length
      ? toIsoDate(new Date(Math.min(...baselineSource.map((row) => parsePlanDate(row.start).getTime()))))
      : baselineRows.length
        ? toIsoDate(new Date(Math.min(...baselineRows.map((row) => parsePlanDate(row.baselineStart).getTime()))))
        : SCHEDULE_TODAY;
    const baselineFinish = baselineSource.length
      ? toIsoDate(new Date(Math.max(...baselineSource.map((row) => parsePlanDate(row.end).getTime()))))
      : baselineRows.length
        ? toIsoDate(new Date(Math.max(...baselineRows.map((row) => parsePlanDate(row.baselineFinish).getTime()))))
        : addPlanDays(SCHEDULE_TODAY, 30);
    const currentForecast = baselineRows.length
      ? toIsoDate(new Date(Math.max(...baselineRows.map((row) => parsePlanDate(row.currentFinish).getTime()))))
      : baselineFinish;
    const baselineBounds = baselineRows.length ? {
      start: toIsoDate(new Date(Math.min(...baselineRows.flatMap((row) => [parsePlanDate(row.baselineStart).getTime(), parsePlanDate(row.currentStart).getTime()])))),
      end: toIsoDate(new Date(Math.max(...baselineRows.flatMap((row) => [parsePlanDate(row.baselineFinish).getTime(), parsePlanDate(row.currentFinish).getTime()])))),
    } : { start: baselineStart, end: baselineFinish };
    const lateRows = baselineRows.filter((row) => row.finishVariance > 0);
    const maxVariance = Math.max(0, ...baselineRows.map((row) => row.finishVariance));
    const visibleBaselineRows = baselineRows;
    const varianceTone = (variance: number) => variance <= 0
      ? "border-blue-100 bg-blue-50 text-blue-700"
      : variance <= 3
        ? "border-indigo-100 bg-indigo-50 text-indigo-700"
        : "border-rose-100 bg-rose-50 text-rose-700";

    if (baselineRows.length === 0) {
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-slate-950">No baseline data yet</p>
          <p className="mx-auto mt-2 max-w-md text-xs font-normal leading-5 text-slate-500">
            Start with a blank planning workspace, create phases and tasks, then save the first approved baseline snapshot.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={openCreatePhase} className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              Create phase
            </button>
            {!hasPlanningData && (
              <button type="button" onClick={loadDemoPlanning} className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-medium text-blue-700 hover:border-blue-200">
                <RotateCcw className="h-3.5 w-3.5" />
                Load demo data
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-950">Baseline Control</p>
              <p className="mt-1 text-xs font-normal text-slate-500">Approved plan compared against the current live forecast for the selected phase.</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedPackage.id && (
                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">
                  {activityId(selectedPackage)}. {selectedPackage.name}
                </span>
              )}
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600">
                {hasSavedBaseline ? `${revisionLabel(baselineSnapshot!.revision)} · Approved ${formatPlanDate(baselineSnapshot!.approvedAt, true)}` : "No baseline saved"}
              </span>
              <button type="button" onClick={saveBaselineSnapshot} className="h-8 rounded-lg bg-blue-600 px-3 text-[11px] font-medium text-white hover:bg-blue-700">Save Baseline</button>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {[
              ["Baseline Start", formatPlanDate(baselineStart, true), "Approved start"],
              ["Baseline Finish", formatPlanDate(baselineFinish, true), "Approved finish"],
              ["Approved Duration", `${planDaysBetween(baselineStart, baselineFinish)}d`, "Original duration"],
              ["Forecast Finish", formatPlanDate(currentForecast, true), "Live current finish"],
              ["Variance", `${Math.max(0, dateDiffDays(baselineFinish, currentForecast))}d`, `${lateRows.length} activities slipped`],
            ].map(([label, value, caption]) => (
              <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <p className="text-[10px] font-medium uppercase text-slate-500">{label}</p>
                <p className="mt-2 text-xl font-medium text-slate-950">{value}</p>
                <p className="mt-1 text-[11px] font-normal text-slate-500">{caption}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-950">{baselineDisplay === "table" ? "Baseline Table" : "Baseline Overlay"}</p>
              <p className="mt-1 text-xs font-normal text-slate-500">
                {baselineDisplay === "table" ? "Detailed approved vs current forecast comparison." : "Gray bar is approved baseline. Blue or rose bar is current forecast."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {baselineDisplay === "overlay" && (
                <div className="hidden items-center gap-3 text-[11px] text-slate-500 sm:flex">
                  <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-5 rounded-full bg-slate-300" /> Baseline</span>
                  <span className="inline-flex items-center gap-1.5"><i className="h-1.5 w-5 rounded-full bg-blue-500" /> Current</span>
                </div>
              )}
              {baselineDisplay === "table" && renderColumnVisibilityControl("baseline", baselineTableColumns)}
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                {(["table", "overlay"] as BaselineDisplay[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setBaselineDisplay(mode)}
                    className={cx(
                      "h-7 rounded-md px-3 text-[11px] font-medium capitalize transition-colors",
                      baselineDisplay === mode ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
                    )}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {baselineDisplay === "table" ? (
            <table className="min-w-[1180px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-medium uppercase text-slate-500">
                  {isTableColumnVisible("baseline", "activityId") && <th className="px-3 py-3">Activity ID</th>}
                  {isTableColumnVisible("baseline", "task") && <th className="px-3 py-3">Task</th>}
                  {isTableColumnVisible("baseline", "phase") && <th className="px-3 py-3">Phase</th>}
                  {isTableColumnVisible("baseline", "baselineStart") && <th className="px-3 py-3">Baseline Start</th>}
                  {isTableColumnVisible("baseline", "baselineFinish") && <th className="px-3 py-3">Baseline Finish</th>}
                  {isTableColumnVisible("baseline", "currentStart") && <th className="px-3 py-3">Current Start</th>}
                  {isTableColumnVisible("baseline", "currentFinish") && <th className="px-3 py-3">Current Finish</th>}
                  {isTableColumnVisible("baseline", "variance") && <th className="px-3 py-3">Variance</th>}
                  {isTableColumnVisible("baseline", "reason") && <th className="px-3 py-3">Reason</th>}
                  {isTableColumnVisible("baseline", "responsible") && <th className="px-3 py-3">Responsible</th>}
                </tr>
              </thead>
              <tbody>
                {visibleBaselineRows.map((row) => (
                  <tr key={`baseline-${row.id}`} className="border-b border-slate-100 text-xs text-slate-700 hover:bg-slate-50">
                    {isTableColumnVisible("baseline", "activityId") && <td className="px-3 py-3 text-slate-500">{activityId(row)}</td>}
                    {isTableColumnVisible("baseline", "task") && <td className="px-3 py-3"><p className="max-w-[260px] truncate font-medium text-slate-950">{row.name}</p></td>}
                    {isTableColumnVisible("baseline", "phase") && <td className="px-3 py-3">{row.phaseName}</td>}
                    {isTableColumnVisible("baseline", "baselineStart") && <td className="px-3 py-3">{formatPlanDate(row.baselineStart, true)}</td>}
                    {isTableColumnVisible("baseline", "baselineFinish") && <td className="px-3 py-3">{formatPlanDate(row.baselineFinish, true)}</td>}
                    {isTableColumnVisible("baseline", "currentStart") && <td className="px-3 py-3">{formatPlanDate(row.currentStart, true)}</td>}
                    {isTableColumnVisible("baseline", "currentFinish") && <td className="px-3 py-3">{formatPlanDate(row.currentFinish, true)}</td>}
                    {isTableColumnVisible("baseline", "variance") && <td className="px-3 py-3"><span className={cx("rounded-full border px-2 py-1 text-[10px] font-medium", varianceTone(row.finishVariance))}>{row.finishVariance > 0 ? `+${row.finishVariance}d` : "0d"}</span></td>}
                    {isTableColumnVisible("baseline", "reason") && <td className="px-3 py-3">{row.reason}</td>}
                    {isTableColumnVisible("baseline", "responsible") && <td className="px-3 py-3">{row.responsibleTeam}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="min-w-[860px] space-y-3 p-4">
              {visibleBaselineRows.map((row) => (
                <div key={row.id} className="grid gap-3 md:grid-cols-[260px_minmax(0,1fr)_72px] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-950">{activityId(row)} {row.name}</p>
                    <p className="mt-0.5 truncate text-[10px] text-slate-500">{row.phaseName} · {row.responsibleTeam}</p>
                  </div>
                  <div className="relative h-11 rounded-lg bg-slate-50">
                    <span className="absolute top-3.5 h-1.5 rounded-full bg-slate-300" style={timelinePosition(row.baselineStart, row.baselineFinish, baselineBounds)} />
                    <span
                      className={cx("absolute bottom-3.5 h-2 rounded-full", row.finishVariance > 3 ? "bg-rose-500" : row.finishVariance > 0 ? "bg-indigo-500" : "bg-blue-500")}
                      style={timelinePosition(row.currentStart, row.currentFinish, baselineBounds)}
                    />
                  </div>
                  <span className={cx("w-max rounded-full border px-2 py-1 text-[10px] font-medium", varianceTone(row.finishVariance))}>
                    {row.finishVariance > 0 ? `+${row.finishVariance}d` : "0d"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-950">{baselinePanel === "insights" ? "Baseline Insights" : "Change Log"}</p>
              <p className="mt-1 text-xs font-normal text-slate-500">
                {baselinePanel === "insights" ? "Quick health summary for the selected phase baseline." : "Activities with the largest movement from the approved baseline."}
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              {(["insights", "changes"] as BaselinePanel[]).map((panel) => (
                <button
                  key={panel}
                  type="button"
                  onClick={() => setBaselinePanel(panel)}
                  className={cx(
                    "h-7 rounded-md px-3 text-[11px] font-medium capitalize transition-colors",
                    baselinePanel === panel ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-800",
                  )}
                >
                  {panel === "insights" ? "Insights" : "Change Log"}
                </button>
              ))}
            </div>
          </div>
          {baselinePanel === "insights" ? (
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600"><b className="font-medium text-slate-950">{lateRows.length}</b> activities have moved beyond approved baseline.</div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600"><b className="font-medium text-slate-950">{maxVariance}d</b> is the largest finish variance.</div>
              <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600"><b className="font-medium text-slate-950">{baselineRows.filter((row) => row.finishVariance <= 0).length}</b> activities remain within baseline.</div>
            </div>
          ) : (
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {lateRows.slice().sort((a, b) => b.finishVariance - a.finishVariance).slice(0, 6).map((row) => (
                <div key={`change-${row.id}`} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-slate-800">{activityId(row)} {row.name}</p>
                      <p className="mt-1 text-[10px] text-slate-500">{formatPlanDate(row.baselineFinish, true)} baseline · {formatPlanDate(row.currentFinish, true)} current</p>
                    </div>
                    <span className={cx("shrink-0 rounded-full border px-2 py-1 text-[10px] font-medium", varianceTone(row.finishVariance))}>+{row.finishVariance}d</span>
                  </div>
                  <p className="mt-2 text-[11px] font-normal text-slate-500">{row.reason}</p>
                </div>
              ))}
              {lateRows.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 p-5 text-center text-xs font-normal text-slate-500 md:col-span-2">
                  No baseline movement is recorded for this selected phase.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLookahead = () => {
    const windowDays: Record<LookaheadWindow, number> = { "1 Week": 7, "2 Weeks": 14, "3 Weeks": 21, "6 Weeks": 42 };
    const lookaheadEnd = addPlanDays(SCHEDULE_TODAY, windowDays[lookaheadWindow] - 1);
    const teams = Array.from(new Set(actualTrackingRows.map((row) => row.responsibleTeam))).sort();
    const lookaheadKey = (row: ActualTrackingRow) => `${row.packageId}:${row.itemType}:${row.id}`;
    const readinessFor = (row: ActualTrackingRow) => {
      const override = lookaheadOverrides[lookaheadKey(row)];
      const baseChecks: Array<{ label: LookaheadCheckLabel; ready: boolean }> = [
        { label: "Drawings", ready: row.phaseName === "Pre-Construction" || row.progress > 10 || row.status !== "Planned" },
        { label: "Materials", ready: row.responsibleTeam !== "Procurement" ? row.delayReason !== "Material Delay" : row.progress >= 35 },
        { label: "Labor", ready: row.delayReason !== "Labor Shortage" && row.responsibleTeam !== "" },
        { label: "Equipment", ready: row.delayReason !== "Equipment Failure" },
        { label: "Access", ready: row.delayReason !== "Site Access Issue" },
      ];
      let checks = baseChecks.map((check) => ({
        ...check,
        ready: override?.checks?.[check.label] ?? check.ready,
      }));
      if (override?.constraint === "None") {
        checks = checks.map((check) => ({ ...check, ready: true }));
      } else if (override?.constraint) {
        checks = checks.map((check) => check.label === override.constraint ? { ...check, ready: false } : check);
      }
      const readyCount = checks.filter((check) => check.ready).length;
      const readiness = Math.round((readyCount / checks.length) * 100);
      const blocker = override?.constraint && override.constraint !== "None" ? override.constraint : checks.find((check) => !check.ready)?.label || "None";
      const status = readiness < 60 ? "Blocked" : row.delayDays > 0 || readiness < 85 ? "At Risk" : "Ready";
      return { checks, readiness, blocker, status };
    };
    const setLookaheadConstraint = (row: ActualTrackingRow, constraint: LookaheadCheckLabel | "None") => {
      const nextChecks = Object.fromEntries(lookaheadCheckLabels.map((label) => [label, constraint === "None" ? true : label !== constraint])) as Record<LookaheadCheckLabel, boolean>;
      setLookaheadOverrides((current) => ({
        ...current,
        [lookaheadKey(row)]: {
          ...current[lookaheadKey(row)],
          constraint,
          checks: nextChecks,
        },
      }));
    };
    const markLookaheadReady = (row: ActualTrackingRow) => {
      const nextChecks = Object.fromEntries(lookaheadCheckLabels.map((label) => [label, true])) as Record<LookaheadCheckLabel, boolean>;
      setLookaheadOverrides((current) => ({
        ...current,
        [lookaheadKey(row)]: {
          ...current[lookaheadKey(row)],
          constraint: "None",
          checks: nextChecks,
        },
      }));
      updateActivityItem(row, {
        delayReason: "Other",
        remarks: "Lookahead readiness marked ready.",
        latestSiteUpdate: "Lookahead readiness marked ready.",
      });
      showToast("Lookahead readiness updated.");
    };
    const baseLookaheadRows = actualTrackingRows
      .filter((row) => row.trackingStatus !== "Completed" && row.trackingStatus !== "Completed Early" && row.trackingStatus !== "Completed Late")
      .filter((row) => rangesOverlap(row.start, row.end, { start: SCHEDULE_TODAY, end: lookaheadEnd }) || activityStartsWithin(row, SCHEDULE_TODAY, lookaheadEnd));
    const phaseOptions = packages.map((planningPackage) => planningPackage.name);
    const phaseCount = (phaseName: string) => baseLookaheadRows.filter((row) => row.phaseName === phaseName).length;
    const lookaheadRows = baseLookaheadRows
      .filter((row) => lookaheadPhaseFilter === "All Phases" || row.phaseName === lookaheadPhaseFilter)
      .filter((row) => lookaheadTeamFilter === "All Teams" || row.responsibleTeam === lookaheadTeamFilter)
      .map((row) => ({ ...row, readinessInfo: readinessFor(row) }))
      .sort((a, b) => parsePlanDate(a.start).getTime() - parsePlanDate(b.start).getTime());
    const visibleLookaheadRows = lookaheadRows;
    const weekCount = Math.ceil(windowDays[lookaheadWindow] / 7);
    const weekBuckets = Array.from({ length: weekCount }, (_, index) => {
      const start = addPlanDays(SCHEDULE_TODAY, index * 7);
      const end = addPlanDays(start, 6);
      const rows = lookaheadRows.filter((row) => rangesOverlap(row.start, row.end, { start, end }));
      return { index, start, end, rows };
    });
    const readyCount = lookaheadRows.filter((row) => row.readinessInfo.status === "Ready").length;
    const blockedCount = lookaheadRows.filter((row) => row.readinessInfo.status === "Blocked").length;
    const atRiskCount = lookaheadRows.filter((row) => row.readinessInfo.status === "At Risk").length;
    const criticalCount = lookaheadRows.filter((row) => row.isCritical).length;
    const readinessAverage = lookaheadRows.length
      ? Math.round(lookaheadRows.reduce((sum, row) => sum + row.readinessInfo.readiness, 0) / lookaheadRows.length)
      : 0;
    const constraintCounts = lookaheadCheckLabels.map((label) => ({
      label,
      count: lookaheadRows.filter((row) => row.readinessInfo.checks.some((check) => check.label === label && !check.ready)).length,
    })).filter((item) => item.count > 0);
    const priorityRows = lookaheadRows
      .filter((row) => row.readinessInfo.status !== "Ready" || row.isCritical)
      .slice(0, 5);
    const statusClass = (status: string) => status === "Ready"
      ? "border-blue-100 bg-blue-50 text-blue-700"
      : status === "At Risk"
        ? "border-indigo-100 bg-indigo-50 text-indigo-700"
        : "border-rose-100 bg-rose-50 text-rose-700";
    const statusRail = (status: string) => status === "Ready"
      ? "bg-blue-500"
      : status === "At Risk"
        ? "bg-indigo-500"
        : "bg-rose-500";

    return (
      <div className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-base font-medium text-slate-950">Lookahead</p>
              <p className="mt-1 text-xs font-normal text-slate-500">
                Work planned from {formatPlanDate(SCHEDULE_TODAY, true)} to {formatPlanDate(lookaheadEnd, true)}, linked by phase and responsible team.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={lookaheadWindow}
                onChange={(event) => setLookaheadWindow(event.target.value as LookaheadWindow)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-700 outline-none focus:border-blue-300"
              >
                {(["1 Week", "2 Weeks", "3 Weeks", "6 Weeks"] as LookaheadWindow[]).map((window) => <option key={window}>{window}</option>)}
              </select>
              <select
                value={lookaheadTeamFilter}
                onChange={(event) => setLookaheadTeamFilter(event.target.value)}
                className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-700 outline-none focus:border-blue-300"
              >
                <option>All Teams</option>
                {teams.map((team) => <option key={team}>{team}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setLookaheadPhaseFilter("All Phases")}
              className={cx(
                "shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                lookaheadPhaseFilter === "All Phases" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
              )}
            >
              All Phases <span className="ml-1 text-[10px] text-current/60">{baseLookaheadRows.length}</span>
            </button>
            {phaseOptions.map((phaseName) => (
              <button
                key={phaseName}
                type="button"
                onClick={() => setLookaheadPhaseFilter(phaseName)}
                className={cx(
                  "shrink-0 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  lookaheadPhaseFilter === phaseName ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {phaseName} <span className="ml-1 text-[10px] text-current/60">{phaseCount(phaseName)}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-4">
          {[
            ["Total Work", lookaheadRows.length, "In selected window", "border-slate-200 bg-white text-slate-950"],
            ["Ready", readyCount, "Can start", "border-blue-100 bg-blue-50 text-blue-700"],
            ["At Risk", atRiskCount, "Needs follow-up", "border-indigo-100 bg-indigo-50 text-indigo-700"],
            ["Blocked", blockedCount, "Constraint open", "border-rose-100 bg-rose-50 text-rose-700"],
          ].map(([label, value, caption, tone]) => (
            <div key={label} className={cx("rounded-xl border p-3", tone as string)}>
              <p className="text-[10px] font-medium uppercase tracking-wide opacity-70">{label}</p>
              <p className="mt-2 text-2xl font-medium">{value}</p>
              <p className="mt-1 text-[11px] font-normal opacity-70">{caption}</p>
            </div>
          ))}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-950">Upcoming Work</p>
              <p className="mt-1 text-xs font-normal text-slate-500">Update blockers, mark items ready, or open site details.</p>
            </div>
            {renderColumnVisibilityControl("lookahead", lookaheadTableColumns)}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[1120px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-medium uppercase text-slate-500">
                  {isTableColumnVisible("lookahead", "activityId") && <th className="px-3 py-3">Activity ID</th>}
                  {isTableColumnVisible("lookahead", "workItem") && <th className="px-3 py-3">Work Item</th>}
                  {isTableColumnVisible("lookahead", "phase") && <th className="px-3 py-3">Phase</th>}
                  {isTableColumnVisible("lookahead", "plannedDates") && <th className="px-3 py-3">Planned Dates</th>}
                  {isTableColumnVisible("lookahead", "responsible") && <th className="px-3 py-3">Responsible</th>}
                  {isTableColumnVisible("lookahead", "readiness") && <th className="px-3 py-3">Readiness</th>}
                  {isTableColumnVisible("lookahead", "constraint") && <th className="px-3 py-3">Blocker</th>}
                  {isTableColumnVisible("lookahead", "status") && <th className="px-3 py-3">Status</th>}
                  {isTableColumnVisible("lookahead", "action") && <th className="px-3 py-3">Action</th>}
                </tr>
              </thead>
              <tbody>
                {visibleLookaheadRows.map((row) => (
                  <tr key={`lookahead-simple-${row.itemType}-${row.id}`} className="border-b border-slate-100 text-xs text-slate-700 hover:bg-slate-50">
                    {isTableColumnVisible("lookahead", "activityId") && <td className="px-3 py-3 text-slate-500">{activityId(row)}</td>}
                    {isTableColumnVisible("lookahead", "workItem") && (
                      <td className="px-3 py-3">
                        <p className="max-w-[300px] truncate font-medium text-slate-950">{row.name}</p>
                        <p className="mt-0.5 text-[10px] capitalize text-slate-400">{row.itemType}</p>
                      </td>
                    )}
                    {isTableColumnVisible("lookahead", "phase") && <td className="px-3 py-3">{row.phaseName}</td>}
                    {isTableColumnVisible("lookahead", "plannedDates") && <td className="whitespace-nowrap px-3 py-3">{formatPlanDate(row.start, true)} - {formatPlanDate(row.end, true)}</td>}
                    {isTableColumnVisible("lookahead", "responsible") && <td className="px-3 py-3">{row.responsibleTeam}</td>}
                    {isTableColumnVisible("lookahead", "readiness") && (
                      <td className="px-3 py-3">
                        <div className="flex min-w-[120px] items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <span className="block h-full rounded-full bg-blue-500" style={{ width: `${row.readinessInfo.readiness}%` }} />
                          </div>
                          <span className="w-9 text-right text-[11px] font-medium text-slate-600">{row.readinessInfo.readiness}%</span>
                        </div>
                      </td>
                    )}
                    {isTableColumnVisible("lookahead", "constraint") && (
                      <td className="px-3 py-3">
                        <select
                          value={row.readinessInfo.blocker as LookaheadCheckLabel | "None"}
                          onChange={(event) => setLookaheadConstraint(row, event.target.value as LookaheadCheckLabel | "None")}
                          className="h-8 w-[132px] rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-normal text-slate-700 outline-none focus:border-blue-300"
                        >
                          <option>None</option>
                          {lookaheadCheckLabels.map((label) => <option key={label}>{label}</option>)}
                        </select>
                      </td>
                    )}
                    {isTableColumnVisible("lookahead", "status") && <td className="px-3 py-3"><span className={cx("inline-flex rounded-full border px-2 py-1 text-[11px] font-medium", statusClass(row.readinessInfo.status))}>{row.readinessInfo.status}</span></td>}
                    {isTableColumnVisible("lookahead", "action") && (
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => markLookaheadReady(row)} className="h-8 rounded-lg border border-blue-100 bg-blue-50 px-2.5 text-[11px] font-medium text-blue-700 hover:border-blue-200">Ready</button>
                          <button type="button" onClick={() => setSelectedActualRef({ id: row.id, packageId: row.packageId, taskId: row.taskId, itemType: row.itemType })} className="h-8 rounded-lg border border-slate-200 px-2.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50">Update</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lookaheadRows.length === 0 && (
            <div className="p-10 text-center text-sm font-normal text-slate-500">
              <p className="font-medium text-slate-700">{hasPlanningData ? "No lookahead work matches the selected filters." : "No lookahead data yet."}</p>
              <p className="mt-1 text-xs text-slate-500">{hasPlanningData ? "Change phase, team, or window filters." : "Load demo data or create phases and tasks first."}</p>
              {!hasPlanningData && (
                <button type="button" onClick={loadDemoPlanning} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-medium text-blue-700 hover:border-blue-200">
                  <RotateCcw className="h-3.5 w-3.5" />
                  Load demo data
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    );

    return (
      <div className="space-y-6">
        {/* Lookahead Controls & Smart Tabs */}
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">Lookahead Window</p>
              <p className="text-[11px] text-slate-500">Select planning horizon</p>
            </div>
            <div className="flex h-10 items-center gap-1 rounded-xl bg-slate-100 p-1">
              {(["1 Week", "2 Weeks", "3 Weeks", "6 Weeks"] as LookaheadWindow[]).map((w) => (
                <button
                  key={w}
                  onClick={() => setLookaheadWindow(w)}
                  className={cx(
                    "h-full rounded-lg px-4 text-xs font-medium transition-all",
                    lookaheadWindow === w
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Average Readiness</p>
              <p className="text-lg font-bold text-blue-600">{readinessAverage}%</p>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden md:block" />
            <select
              value={lookaheadTeamFilter}
              onChange={(event) => setLookaheadTeamFilter(event.target.value)}
              className="h-10 min-w-[140px] rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 outline-none focus:border-blue-500 focus:bg-white"
            >
              <option>All Teams</option>
              {teams.map((team) => <option key={team}>{team}</option>)}
            </select>
          </div>
        </section>

        {/* Work Readiness Board - Table at the top */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Work Readiness Board</h3>
              <p className="mt-1 text-xs text-slate-500">
                {formatPlanDate(SCHEDULE_TODAY, true)} - {formatPlanDate(lookaheadEnd, true)} · {lookaheadRows.length} items
              </p>
            </div>
            <div className="flex items-center gap-2">
              {renderColumnVisibilityControl("lookahead", lookaheadTableColumns)}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {isTableColumnVisible("lookahead", "activityId") && <th className="px-5 py-3.5">ID</th>}
                  {isTableColumnVisible("lookahead", "workItem") && <th className="px-5 py-3.5">Work Item</th>}
                  {isTableColumnVisible("lookahead", "phase") && <th className="px-5 py-3.5">Phase</th>}
                  {isTableColumnVisible("lookahead", "plannedDates") && <th className="px-5 py-3.5">Schedule</th>}
                  {isTableColumnVisible("lookahead", "responsible") && <th className="px-5 py-3.5">Team</th>}
                  {isTableColumnVisible("lookahead", "readiness") && <th className="px-5 py-3.5">Readiness Check</th>}
                  {isTableColumnVisible("lookahead", "constraint") && <th className="px-5 py-3.5">Primary Blocker</th>}
                  {isTableColumnVisible("lookahead", "status") && <th className="px-5 py-3.5 text-center">Status</th>}
                  {isTableColumnVisible("lookahead", "action") && <th className="px-5 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {visibleLookaheadRows.map((row) => (
                  <tr key={`lookahead-${row.itemType}-${row.id}`} className="group text-xs text-slate-700 transition-colors hover:bg-blue-50/30">
                    {isTableColumnVisible("lookahead", "activityId") && <td className="px-5 py-4 font-mono text-slate-400">{activityId(row)}</td>}
                    {isTableColumnVisible("lookahead", "workItem") && (
                      <td className="px-5 py-4">
                        <p className="max-w-[280px] truncate font-semibold text-slate-900">{row.name}</p>
                        <p className="mt-0.5 text-[10px] font-medium uppercase text-slate-400">{row.itemType}</p>
                      </td>
                    )}
                    {isTableColumnVisible("lookahead", "phase") && <td className="px-5 py-4 text-slate-500">{row.phaseName}</td>}
                    {isTableColumnVisible("lookahead", "plannedDates") && <td className="px-5 py-4 font-medium text-slate-600 whitespace-nowrap">{formatPlanDate(row.start, true)} - {formatPlanDate(row.end, true)}</td>}
                    {isTableColumnVisible("lookahead", "responsible") && <td className="px-5 py-4 text-slate-500">{row.responsibleTeam}</td>}
                    {isTableColumnVisible("lookahead", "readiness") && (
                      <td className="px-5 py-4">
                        <div className="flex w-32 items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <span className="block h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${row.readinessInfo.readiness}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600">{row.readinessInfo.readiness}%</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {row.readinessInfo.checks.map((check) => (
                            <span
                              key={check.label}
                              className={cx(
                                "rounded-md border px-1.5 py-0.5 text-[9px] font-semibold",
                                check.ready ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-rose-100 bg-rose-50 text-rose-700"
                              )}
                            >
                              {check.label}
                            </span>
                          ))}
                        </div>
                      </td>
                    )}
                    {isTableColumnVisible("lookahead", "constraint") && (
                      <td className="px-5 py-4">
                        <select
                          value={row.readinessInfo.blocker as LookaheadCheckLabel | "None"}
                          onChange={(event) => setLookaheadConstraint(row, event.target.value as LookaheadCheckLabel | "None")}
                          className="h-8 w-full min-w-[120px] rounded-lg border border-slate-200 bg-white px-2 text-[11px] font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-blue-400"
                        >
                          <option>None</option>
                          {lookaheadCheckLabels.map((label) => <option key={label}>{label}</option>)}
                        </select>
                      </td>
                    )}
                    {isTableColumnVisible("lookahead", "status") && (
                      <td className="px-5 py-4 text-center">
                        <span className={cx("inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-tight", statusClass(row.readinessInfo.status))}>
                          {row.readinessInfo.status}
                        </span>
                      </td>
                    )}
                    {isTableColumnVisible("lookahead", "action") && (
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => markLookaheadReady(row)} className="h-8 rounded-lg border border-blue-200 bg-blue-50 px-3 text-[11px] font-bold text-blue-700 hover:bg-blue-100">
                            Clear
                          </button>
                          <button onClick={() => setSelectedActualRef({ id: row.id, packageId: row.packageId, taskId: row.taskId, itemType: row.itemType })} className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 hover:bg-slate-50">
                            Update
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {lookaheadRows.length === 0 && <div className="p-12 text-center text-sm font-medium text-slate-400 bg-slate-50/50">No activities match the current window.</div>}
        </section>

        {/* Stats & Priority Lane */}
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {/* Minimal Stats Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Ready", value: readyCount, tone: "emerald", caption: "Safe to start" },
                { label: "At Risk", value: atRiskCount, tone: "indigo", caption: "Needs follow-up" },
                { label: "Blocked", value: blockedCount, tone: "rose", caption: "Critical constraint" },
                { label: "Critical", value: criticalCount, tone: "slate", caption: "On critical path" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                    <span className="text-[10px] font-medium text-slate-500">{stat.caption}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Week Flow Lane - Simplified */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-900">Week-by-Week Forecast</h3>
                <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600">{weekBuckets.length} Weeks</span>
              </div>
              <div className="flex overflow-x-auto divide-x divide-slate-100">
                {weekBuckets.map((bucket) => (
                  <div key={bucket.index} className="min-w-[280px] flex-1 p-4">
                    <div className="mb-4">
                      <p className="text-xs font-bold text-slate-900">Week {bucket.index + 1}</p>
                      <p className="text-[10px] font-medium text-slate-400">{formatPlanDate(bucket.start, true)} - {formatPlanDate(bucket.end, true)}</p>
                    </div>
                    <div className="space-y-2.5">
                      {bucket.rows.slice(0, 5).map((row) => (
                        <div key={`${bucket.index}-${row.id}`} className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 hover:bg-white hover:shadow-sm transition-all border-l-4" style={{ borderLeftColor: statusRail(row.readinessInfo.status).replace('bg-', '') }}>
                          <p className="line-clamp-2 text-[11px] font-semibold text-slate-800">{row.name}</p>
                          <div className="mt-2 flex items-center justify-between text-[9px] font-bold">
                            <span className="text-slate-400 uppercase">{activityId(row)}</span>
                            <span className={cx("px-1.5 py-0.5 rounded-md", statusClass(row.readinessInfo.status))}>{row.readinessInfo.status}</span>
                          </div>
                        </div>
                      ))}
                      {bucket.rows.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center text-[10px] font-medium text-slate-400 uppercase tracking-widest">No Work</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Constraint Radar</h3>
              <p className="mt-1 text-[11px] text-slate-500">Resource and logistical blockers.</p>
              <div className="mt-4 space-y-2">
                {constraintCounts.length > 0 ? constraintCounts.map((c) => (
                  <div key={c.label} className="flex items-center justify-between gap-3 rounded-xl bg-rose-50 px-3 py-2.5">
                    <span className="text-[11px] font-bold text-rose-900">{c.label}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-rose-600">{c.count} items</span>
                  </div>
                )) : (
                  <div className="rounded-xl bg-emerald-50 p-4 text-center">
                    <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">Clear Window</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900">Immediate Actions</h3>
              <div className="mt-4 space-y-3">
                {priorityRows.length > 0 ? priorityRows.map((row) => (
                  <button
                    key={`priority-${row.id}`}
                    onClick={() => setSelectedActualRef({ id: row.id, packageId: row.packageId, taskId: row.taskId, itemType: row.itemType })}
                    className="w-full text-left group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-2 text-[11px] font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{row.name}</p>
                      <span className={cx("shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold", statusClass(row.readinessInfo.status))}>
                        {row.readinessInfo.status === "Ready" ? "Check" : "Act"}
                      </span>
                    </div>
                    <p className="mt-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.readinessInfo.blocker !== "None" ? `${row.readinessInfo.blocker} BLOCKED` : row.phaseName}</p>
                  </button>
                )) : (
                  <p className="text-center py-6 text-[10px] font-medium text-slate-400 uppercase tracking-widest">Nothing Urgent</p>
                )}
              </div>
            </div>
          </aside>
        </section>
      </div>
    );
  };

  const renderActualDetailDrawer = () => {
    if (!selectedActualRow) return null;

    return (
      <div className="fixed inset-y-0 right-0 z-[80] w-full max-w-[420px] border-l border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <p className="text-[11px] font-medium uppercase text-slate-500">{activityId(selectedActualRow)} · {selectedActualRow.phaseName}</p>
            <h4 className="mt-1 truncate text-base font-medium text-slate-950">{selectedActualRow.name}</h4>
          </div>
          <button type="button" onClick={() => setSelectedActualRef(null)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">×</button>
        </div>
        <div className="max-h-[calc(100vh-73px)] overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><p className="text-[10px] font-medium uppercase text-slate-500">Planned</p><p className="mt-1 text-xs text-slate-800">{formatPlanDate(selectedActualRow.start)} - {formatPlanDate(selectedActualRow.end)}</p></div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><p className="text-[10px] font-medium uppercase text-slate-500">Actual</p><p className="mt-1 text-xs text-slate-800">{derivedActualStart(selectedActualRow) ? formatPlanDate(derivedActualStart(selectedActualRow), true) : "-"} - {derivedActualEnd(selectedActualRow) ? formatPlanDate(derivedActualEnd(selectedActualRow), true) : "Running"}</p></div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><p className="text-[10px] font-medium uppercase text-slate-500">Progress</p><p className="mt-1 text-xs text-slate-800">Planned {selectedActualRow.plannedProgress}% · Actual {selectedActualRow.actualProgress}%</p></div>
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><p className="text-[10px] font-medium uppercase text-slate-500">Variance</p><p className={cx("mt-1 text-xs font-medium", selectedActualRow.variance < 0 ? "text-amber-700" : selectedActualRow.variance > 0 ? "text-emerald-700" : "text-slate-700")}>{selectedActualRow.variance > 0 ? "+" : ""}{selectedActualRow.variance}% · {selectedActualRow.delayDays > 0 ? `${selectedActualRow.delayDays}d delay` : "No delay"}</p></div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-3">
            <p className="text-xs font-medium text-slate-950">Daily Site Update</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => updateActivityItem(selectedActualRow, { actualStart: SCHEDULE_TODAY, progress: Math.max(selectedActualRow.actualProgress, 5), latestSiteUpdate: "Marked started from planning drawer." })} className="h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Mark Started</button>
              <button type="button" onClick={() => updateActivityItem(selectedActualRow, { actualEnd: SCHEDULE_TODAY, progress: 100, status: "Completed", latestSiteUpdate: "Marked completed from planning drawer." })} className="h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Mark Completed</button>
            </div>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Update Progress %</span>
              <input type="number" min={0} max={100} value={selectedActualRow.actualProgress} onChange={(event) => updateActivityItem(selectedActualRow, { progress: clampPercent(Number(event.target.value)) })} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none focus:border-blue-300" />
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Delay Reason</span>
              <select value={selectedActualRow.delayReason || "Other"} onChange={(event) => updateActivityItem(selectedActualRow, { delayReason: event.target.value as DelayReason })} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none focus:border-blue-300">
                {delayReasons.map((reason) => <option key={reason}>{reason}</option>)}
              </select>
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Remark</span>
              <textarea value={selectedActualRow.remarks || ""} onChange={(event) => updateActivityItem(selectedActualRow, { remarks: event.target.value, latestSiteUpdate: event.target.value })} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm outline-none focus:border-blue-300" placeholder="Add latest site remark" />
            </label>
            <label className="mt-3 block">
              <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Recovery Plan</span>
              <textarea value={selectedActualRow.recoveryPlan || ""} onChange={(event) => updateActivityItem(selectedActualRow, { recoveryPlan: event.target.value })} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm outline-none focus:border-blue-300" placeholder="Add recovery action" />
            </label>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
            <p><b className="font-medium text-slate-950">Responsible:</b> {selectedActualRow.responsibleTeam}</p>
            <p className="mt-2"><b className="font-medium text-slate-950">Latest site update:</b> {selectedActualRow.latestSiteUpdate || selectedActualRow.remarks || "No update recorded"}</p>
            <p className="mt-2"><b className="font-medium text-slate-950">Linked DPR:</b> {selectedActualRow.linkedDpr || `DPR-${SCHEDULE_TODAY.replaceAll("-", "")}`}</p>
            <p className="mt-2"><b className="font-medium text-slate-950">Photos/documents:</b> {selectedActualRow.sitePhotos?.length ? selectedActualRow.sitePhotos.join(", ") : "No site photo uploaded"}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderScheduledActual = () => {
    const statusPill = (status: ScheduledActualStatus) => {
      if (status === "Delayed" || status === "Completed Late") return "border-rose-100 bg-rose-50 text-rose-700";
      if (status === "Behind Schedule") return "border-amber-100 bg-amber-50 text-amber-700";
      if (status === "In Progress") return "border-blue-100 bg-blue-50 text-blue-700";
      if (status === "On Track" || status === "Completed" || status === "Completed Early") return "border-emerald-100 bg-emerald-50 text-emerald-700";
      if (status === "Should Start Today") return "border-cyan-100 bg-cyan-50 text-cyan-700";
      return "border-slate-200 bg-slate-50 text-slate-600";
    };

    const rowToneClass: Record<ActualTrackingRow["rowTone"], string> = {
      green: "border-l-emerald-300",
      amber: "border-l-amber-300",
      red: "border-l-rose-300",
      blue: "border-l-blue-300 bg-blue-50/25",
      grey: "border-l-slate-200",
    };
    const teams = Array.from(new Set(actualTrackingRows.map((row) => row.responsibleTeam))).sort();
    const visibleActualRows = filteredActualRows;

    return (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          {[
            ["Scheduled Today", actualSummary.scheduledToday, "Activities planned for today"],
            ["Actually In Progress", actualSummary.actuallyInProgress, "Running now on site"],
            ["Behind Schedule", actualSummary.behindSchedule, "Behind, late, or delayed"],
            ["Completed Today", actualSummary.completedToday, "Actual finish today"],
            ["Upcoming This Week", actualSummary.upcomingThisWeek, "Starting next 7 days"],
          ].map(([label, value, caption]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-medium uppercase text-slate-500">{label}</p>
              <p className="mt-2 text-2xl font-medium text-slate-950">{value}</p>
              <p className="mt-1 text-[11px] font-normal text-slate-500">{caption}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <select value={actualPhaseFilter} onChange={(event) => setActualPhaseFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-700 outline-none focus:border-slate-900">
              <option>All Phases</option>
              {packages.map((planningPackage) => <option key={planningPackage.id}>{planningPackage.name}</option>)}
            </select>
            <select value={actualResponsibleFilter} onChange={(event) => setActualResponsibleFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-700 outline-none focus:border-slate-900">
              <option>Any Team</option>
              {teams.map((team) => <option key={team}>{team}</option>)}
            </select>
            <select value={actualStatusFilter} onChange={(event) => setActualStatusFilter(event.target.value as ScheduledActualStatus | "All Status")} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-700 outline-none focus:border-slate-900">
              <option>All Status</option>
              {scheduledActualStatuses.map((status) => <option key={status}>{status}</option>)}
            </select>
            <select value={actualDateRange} onChange={(event) => setActualDateRange(event.target.value as ActualDateRange)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-700 outline-none focus:border-slate-900">
              {actualDateRanges.map((range) => <option key={range}>{range}</option>)}
            </select>
            {[
              ["Delayed Only", delayedOnly, setDelayedOnly],
              ["Critical Path Only", criticalOnly, setCriticalOnly],
              ["Today's Work", todaysWorkOnly, setTodaysWorkOnly],
              ["This Week", thisWeekOnly, setThisWeekOnly],
            ].map(([label, active, setter]) => (
              <button
                key={label as string}
                type="button"
                onClick={() => (setter as (value: boolean) => void)(!(active as boolean))}
                className={cx(
                  "h-9 rounded-lg border px-3 text-xs font-medium transition-colors",
                  active ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                )}
              >
                {label as string}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-950">Execution Insights</p>
              <p className="mt-1 text-xs font-normal text-slate-500">Smart callouts from planned dates, actual site progress, and critical path flags.</p>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-700">{formatPlanDate(SCHEDULE_TODAY)}</span>
          </div>
          <div className="grid gap-2 md:grid-cols-4">
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600"><b className="font-medium text-slate-950">{executionInsights.shouldHaveStarted}</b> activities should have started but have not started</div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600"><b className="font-medium text-slate-950">{executionInsights.behindProgress}</b> activities are running behind planned progress</div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600">Substructure work is <b className="font-medium text-slate-950">{executionInsights.substructureBehind}%</b> behind schedule</div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3 text-xs text-slate-600"><b className="font-medium text-slate-950">{executionInsights.criticalDelayed}</b> delayed activities are on the critical path</div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-950">Scheduled vs Actual Table</p>
              <p className="mt-1 text-xs font-normal text-slate-500">Choose which schedule tracking headers should be visible.</p>
            </div>
            {renderColumnVisibilityControl("scheduledActual", scheduledActualTableColumns)}
          </div>
          <table className="min-w-[1680px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-medium uppercase tracking-normal text-slate-500">
                {isTableColumnVisible("scheduledActual", "activityId") && <th className="px-3 py-3">Activity ID</th>}
                {isTableColumnVisible("scheduledActual", "activityName") && <th className="px-3 py-3">Activity Name</th>}
                {isTableColumnVisible("scheduledActual", "phase") && <th className="px-3 py-3">WBS / Phase</th>}
                {isTableColumnVisible("scheduledActual", "plannedStart") && <th className="px-3 py-3">Planned Start</th>}
                {isTableColumnVisible("scheduledActual", "plannedFinish") && <th className="px-3 py-3">Planned Finish</th>}
                {isTableColumnVisible("scheduledActual", "actualStart") && <th className="px-3 py-3">Actual Start</th>}
                {isTableColumnVisible("scheduledActual", "actualFinish") && <th className="px-3 py-3">Actual Finish</th>}
                {isTableColumnVisible("scheduledActual", "plannedProgress") && <th className="px-3 py-3">Planned Progress %</th>}
                {isTableColumnVisible("scheduledActual", "actualProgress") && <th className="px-3 py-3">Actual Progress %</th>}
                {isTableColumnVisible("scheduledActual", "variance") && <th className="px-3 py-3">Variance</th>}
                {isTableColumnVisible("scheduledActual", "delayDays") && <th className="px-3 py-3">Delay Days</th>}
                {isTableColumnVisible("scheduledActual", "status") && <th className="px-3 py-3">Status</th>}
                {isTableColumnVisible("scheduledActual", "responsible") && <th className="px-3 py-3">Responsible</th>}
                {isTableColumnVisible("scheduledActual", "remarks") && <th className="px-3 py-3">Remarks</th>}
              </tr>
            </thead>
            <tbody>
              {visibleActualRows.map((row) => (
                <tr
                  key={`${row.itemType}-${row.id}`}
                  onClick={() => setSelectedActualRef({ id: row.id, packageId: row.packageId, taskId: row.taskId, itemType: row.itemType })}
                  className={cx("cursor-pointer border-b border-slate-100 border-l-4 text-xs font-normal text-slate-700 transition-colors hover:bg-slate-50", rowToneClass[row.rowTone])}
                >
                  {isTableColumnVisible("scheduledActual", "activityId") && <td className="whitespace-nowrap px-3 py-3 text-slate-500">{activityId(row)}</td>}
                  {isTableColumnVisible("scheduledActual", "activityName") && (
                  <td className="px-3 py-3">
                    <div className="flex min-w-0 items-center gap-2">
                      {row.isActualInProgress && <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_0_3px_rgba(59,130,246,0.14)]" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-950">{row.name}</p>
                        <p className="mt-0.5 text-[10px] font-normal capitalize text-slate-400">{row.itemType}</p>
                      </div>
                    </div>
                  </td>
                  )}
                  {isTableColumnVisible("scheduledActual", "phase") && <td className="px-3 py-3">{row.phaseCode}. {row.phaseName}</td>}
                  {isTableColumnVisible("scheduledActual", "plannedStart") && <td className="whitespace-nowrap px-3 py-3">{formatPlanDate(row.start, true)}</td>}
                  {isTableColumnVisible("scheduledActual", "plannedFinish") && <td className="whitespace-nowrap px-3 py-3">{formatPlanDate(row.end, true)}</td>}
                  {isTableColumnVisible("scheduledActual", "actualStart") && <td className="whitespace-nowrap px-3 py-3">{derivedActualStart(row) ? formatPlanDate(derivedActualStart(row), true) : "-"}</td>}
                  {isTableColumnVisible("scheduledActual", "actualFinish") && <td className="whitespace-nowrap px-3 py-3">{derivedActualEnd(row) ? formatPlanDate(derivedActualEnd(row), true) : "-"}</td>}
                  {isTableColumnVisible("scheduledActual", "plannedProgress") && <td className="px-3 py-3">{row.plannedProgress}%</td>}
                  {isTableColumnVisible("scheduledActual", "actualProgress") && (
                  <td className="px-3 py-3">
                    <div className={cx("inline-flex min-w-[86px] items-center gap-2 rounded-full border px-2 py-1", row.isActualInProgress ? "border-blue-100 bg-blue-50 text-blue-700" : "border-slate-100 bg-slate-50 text-slate-600")}>
                      {row.isActualInProgress && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                      <span className="font-medium">{row.actualProgress}%</span>
                    </div>
                  </td>
                  )}
                  {isTableColumnVisible("scheduledActual", "variance") && (
                  <td className="px-3 py-3">
                    <span className={cx("rounded-full px-2 py-1 text-[11px] font-medium", row.variance < 0 ? "bg-amber-50 text-amber-700" : row.variance > 0 ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-500")}>
                      {row.variance > 0 ? "+" : ""}{row.variance}%
                    </span>
                  </td>
                  )}
                  {isTableColumnVisible("scheduledActual", "delayDays") && <td className="px-3 py-3">{row.delayDays > 0 ? `${row.delayDays}d` : "-"}</td>}
                  {isTableColumnVisible("scheduledActual", "status") && <td className="px-3 py-3"><span className={cx("inline-flex rounded-full border px-2 py-1 text-[11px] font-medium", statusPill(row.trackingStatus))}>{row.trackingStatus}</span></td>}
                  {isTableColumnVisible("scheduledActual", "responsible") && <td className="px-3 py-3">{row.responsibleTeam}</td>}
                  {isTableColumnVisible("scheduledActual", "remarks") && <td className="max-w-[220px] truncate px-3 py-3 text-slate-500">{row.remarks || row.latestSiteUpdate || "No site remark"}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredActualRows.length === 0 && (
            <div className="p-10 text-center text-sm font-normal text-slate-500">No activities match the current schedule-vs-actual filters.</div>
          )}
        </div>

        {selectedActualRow && (
          <div className="fixed inset-y-0 right-0 z-[80] w-full max-w-[420px] border-l border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase text-slate-500">{activityId(selectedActualRow)} · {selectedActualRow.phaseName}</p>
                <h4 className="mt-1 truncate text-base font-medium text-slate-950">{selectedActualRow.name}</h4>
              </div>
              <button type="button" onClick={() => setSelectedActualRef(null)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">×</button>
            </div>
            <div className="max-h-[calc(100vh-73px)] overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><p className="text-[10px] font-medium uppercase text-slate-500">Planned</p><p className="mt-1 text-xs text-slate-800">{formatPlanDate(selectedActualRow.start)} - {formatPlanDate(selectedActualRow.end)}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><p className="text-[10px] font-medium uppercase text-slate-500">Actual</p><p className="mt-1 text-xs text-slate-800">{derivedActualStart(selectedActualRow) ? formatPlanDate(derivedActualStart(selectedActualRow), true) : "-"} - {derivedActualEnd(selectedActualRow) ? formatPlanDate(derivedActualEnd(selectedActualRow), true) : "Running"}</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><p className="text-[10px] font-medium uppercase text-slate-500">Progress</p><p className="mt-1 text-xs text-slate-800">Planned {selectedActualRow.plannedProgress}% · Actual {selectedActualRow.actualProgress}%</p></div>
                <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"><p className="text-[10px] font-medium uppercase text-slate-500">Variance</p><p className={cx("mt-1 text-xs font-medium", selectedActualRow.variance < 0 ? "text-amber-700" : selectedActualRow.variance > 0 ? "text-emerald-700" : "text-slate-700")}>{selectedActualRow.variance > 0 ? "+" : ""}{selectedActualRow.variance}% · {selectedActualRow.delayDays > 0 ? `${selectedActualRow.delayDays}d delay` : "No delay"}</p></div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-3">
                <p className="text-xs font-medium text-slate-950">Daily Site Update</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => updateActivityItem(selectedActualRow, { actualStart: SCHEDULE_TODAY, progress: Math.max(selectedActualRow.actualProgress, 5), latestSiteUpdate: "Marked started from Scheduled vs Actual view." })} className="h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Mark Started</button>
                  <button type="button" onClick={() => updateActivityItem(selectedActualRow, { actualEnd: SCHEDULE_TODAY, progress: 100, status: "Completed", latestSiteUpdate: "Marked completed from Scheduled vs Actual view." })} className="h-9 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50">Mark Completed</button>
                </div>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Update Progress %</span>
                  <input type="number" min={0} max={100} value={selectedActualRow.actualProgress} onChange={(event) => updateActivityItem(selectedActualRow, { progress: clampPercent(Number(event.target.value)) })} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none focus:border-blue-300" />
                </label>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Delay Reason</span>
                  <select value={selectedActualRow.delayReason || "Other"} onChange={(event) => updateActivityItem(selectedActualRow, { delayReason: event.target.value as DelayReason })} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none focus:border-blue-300">
                    {delayReasons.map((reason) => <option key={reason}>{reason}</option>)}
                  </select>
                </label>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Remark</span>
                  <textarea value={selectedActualRow.remarks || ""} onChange={(event) => updateActivityItem(selectedActualRow, { remarks: event.target.value, latestSiteUpdate: event.target.value })} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm outline-none focus:border-blue-300" placeholder="Add latest site remark" />
                </label>
                <label className="mt-3 block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Recovery Plan</span>
                  <textarea value={selectedActualRow.recoveryPlan || ""} onChange={(event) => updateActivityItem(selectedActualRow, { recoveryPlan: event.target.value })} rows={3} className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm outline-none focus:border-blue-300" placeholder="Add recovery action" />
                </label>
                <label className="mt-3 inline-flex h-9 cursor-pointer items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">
                  Upload Site Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      const fileName = event.target.files?.[0]?.name;
                      if (fileName) {
                        updateActivityItem(selectedActualRow, { sitePhotos: [...(selectedActualRow.sitePhotos || []), fileName] });
                      }
                    }}
                  />
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
                <p><b className="font-medium text-slate-950">Responsible:</b> {selectedActualRow.responsibleTeam}</p>
                <p className="mt-2"><b className="font-medium text-slate-950">Latest site update:</b> {selectedActualRow.latestSiteUpdate || selectedActualRow.remarks || "No update recorded"}</p>
                <p className="mt-2"><b className="font-medium text-slate-950">Linked DPR:</b> {selectedActualRow.linkedDpr || `DPR-${SCHEDULE_TODAY.replaceAll("-", "")}`}</p>
                <p className="mt-2"><b className="font-medium text-slate-950">Photos/documents:</b> {selectedActualRow.sitePhotos?.length ? selectedActualRow.sitePhotos.join(", ") : "No site photo uploaded"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cx("space-y-4 font-normal text-slate-800 antialiased", isFullScreen ? "fixed inset-0 z-50 bg-slate-50 p-6 overflow-auto" : "")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="flex items-center justify-center h-8 w-8 rounded-lg border border-blue-200 text-blue-600 bg-white hover:bg-blue-50 transition-colors shadow-sm shrink-0"
            title={isSidebarOpen ? "Hide Phases" : "Show Phases"}
          >
            {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50/50 pl-1.5 pr-4 py-1 text-xs text-emerald-800 shadow-sm">
            <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-100/50 mr-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="font-bold uppercase tracking-wider text-[10.5px] text-emerald-800">CURRENTLY SHOWING</span>
            <span className="font-bold text-emerald-900 ml-2">{hasPlanningData ? `${activityId(selectedPackage)}. ${selectedPackage.name}` : "Blank planning workspace"}</span>
            <span className="h-3.5 w-px bg-emerald-200 mx-3" />
            <span className="font-medium text-emerald-700">{hasPlanningData ? `${selectedPackage.displayTaskCount ?? selectedPackage.tasks.length} tasks / ${selectedPackage.displaySubtaskCount ?? selectedPackage.tasks.reduce((sum, task) => sum + task.subtasks.length, 0)} subtasks` : "No demo data loaded"}</span>
          </div>
          {toast && <span className="rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-xs font-normal text-emerald-700 shadow-sm">{toast}</span>}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative inline-flex">
            <span className="sr-only">Planning view</span>
            <select
              value={view}
              onChange={(event) => setView(event.target.value as PlanningView)}
              className="h-9 min-w-[190px] appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-3.5 pr-9 text-xs font-medium text-slate-700 shadow-sm shadow-slate-950/[0.03] outline-none transition-colors hover:border-slate-300 hover:bg-slate-50 focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="wbs">WBS</option>
              <option value="milestones">Milestones</option>
              <option value="timeline">Timeline</option>
              <option value="gantt">Gantt</option>
              <option value="scheduled-actual">Scheduled vs Actual</option>
              <option value="baseline">Baseline</option>
              <option value="lookahead">Lookahead</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded-md text-slate-500">
              <ChevronDown className="h-3.5 w-3.5" />
            </span>
          </label>
          <button type="button" onClick={hasPlanningData ? openCreateTask : openCreatePhase} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:border-gray-300">
            <Plus className="h-3.5 w-3.5" />
            {hasPlanningData ? "Create task" : "Create phase"}
          </button>
          <button type="button" onClick={() => openCreateSubtask()} disabled={allTasks.length === 0} className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-45">
            <Plus className="h-3.5 w-3.5" />
            Create subtask
          </button>
          <button type="button" onClick={runDummy} className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-medium text-blue-700 hover:border-blue-300">
            <Play className="h-3.5 w-3.5" />
            Run Dummy
          </button>
          {renderExportControls()}
          <button type="button" onClick={() => setIsFullScreen(!isFullScreen)} className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-2.5 text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm" title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}>
            {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          {hasPlanningData ? (
            <button type="button" onClick={startFreshPlanning} className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-100 bg-white px-3 text-xs font-medium text-rose-600 hover:border-rose-200 hover:bg-rose-50">
              <RotateCcw className="h-3.5 w-3.5" />
              Start fresh
            </button>
          ) : (
            <button type="button" onClick={loadDemoPlanning} className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-medium text-blue-700 hover:border-blue-200">
              <RotateCcw className="h-3.5 w-3.5" />
              Load demo data
            </button>
          )}
        </div>
      </div>

      <div className={cx(
        "grid gap-4",
        isSidebarOpen ? "xl:grid-cols-[280px_minmax(0,1fr)]" : "grid-cols-1",
        "xl:h-[calc(100vh-190px)] xl:min-h-[560px] xl:overflow-hidden",
      )}>
        {isSidebarOpen && (
          <aside className="flex min-h-0 flex-col self-start overflow-hidden rounded-xl border border-gray-200 bg-white xl:h-full">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-950">Phases</p>
              <p className="mt-1 text-xs font-normal text-slate-500">{packages.length} phases with different task content</p>
            </div>
            <button
              type="button"
              onClick={openCreatePhase}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 pr-2">
            {packages.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center">
                <p className="text-xs font-medium text-slate-700">No phases yet</p>
                <p className="mt-1 text-[11px] font-normal text-slate-500">Create the first phase to start planning from scratch.</p>
                <button type="button" onClick={openCreatePhase} className="mt-3 inline-flex h-8 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
                  <Plus className="h-3.5 w-3.5" />
                  Add phase
                </button>
              </div>
            )}
            {packages.map((planningPackage) => (
              <button
                key={planningPackage.id}
                type="button"
                onClick={() => setSelectedPackageId(planningPackage.id)}
                className={cx(
                  "w-full rounded-xl border p-3 text-left transition-colors",
                  planningPackage.id === selectedPackageId ? "border-emerald-200 bg-emerald-50/70" : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-xs font-medium text-slate-950">{activityId(planningPackage)}. {planningPackage.name}</p>
                  <span className="text-[11px] font-normal text-slate-500">{planningPackage.progress}%</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] font-normal text-slate-500">
                  <span>{planningPackage.displayTaskCount ?? planningPackage.tasks.length} tasks / {planningPackage.displaySubtaskCount ?? planningPackage.tasks.reduce((sum, task) => sum + task.subtasks.length, 0)} subtasks</span>
                  <span>{formatPlanDate(planningPackage.start, true)} - {formatPlanDate(planningPackage.end, true)}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full" style={{ width: `${planningPackage.progress}%`, background: timelineColor(planningPackage) }} />
                </div>
              </button>
            ))}
          </div>
        </aside>
        )}

        <section className="min-w-0 space-y-4 xl:h-full xl:overflow-y-auto xl:pr-1">
          {view !== "scheduled-actual" && view !== "milestones" && view !== "baseline" && view !== "lookahead" && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full min-w-[220px] sm:w-[280px]">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search activity, task, responsible..."
                  className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-xs font-normal outline-none transition-colors focus:border-slate-900"
                />
              </div>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PlanningStatus | "All Status")} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-normal text-slate-700 outline-none focus:border-slate-900">
                <option>All Status</option>
                {statusOptions.map((status) => <option key={status}>{status}</option>)}
              </select>
              <select value={responsibleFilter} onChange={(event) => setResponsibleFilter(event.target.value)} className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-xs font-normal text-slate-700 outline-none focus:border-slate-900">
                <option>Any Department</option>
                {responsibleOptions.map((owner) => <option key={owner}>{owner}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 text-xs font-normal text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              {formatPlanDate(selectedPackage.start)} - {formatPlanDate(selectedPackage.end)}
            </div>
          </div>
          )}

          {view === "wbs" && (
            <>
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-950">WBS Task Table</p>
                    <p className="mt-1 text-xs font-normal text-slate-500">Choose which table headers should be visible.</p>
                  </div>
                  {renderColumnVisibilityControl("wbs", wbsTableColumns)}
                </div>
                <table className="min-w-[1320px] w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-[11px] font-medium uppercase tracking-normal text-slate-500">
                      {isTableColumnVisible("wbs", "activityId") && <th className="px-4 py-3">Activity ID</th>}
                      {isTableColumnVisible("wbs", "task") && <th className="px-4 py-3">Task</th>}
                      {isTableColumnVisible("wbs", "start") && <th className="px-4 py-3">Start</th>}
                      {isTableColumnVisible("wbs", "finish") && <th className="px-4 py-3">Finish</th>}
                      {isTableColumnVisible("wbs", "actual") && <th className="px-4 py-3">Actual</th>}
                      {isTableColumnVisible("wbs", "float") && <th className="px-4 py-3">Float</th>}
                      {isTableColumnVisible("wbs", "constraint") && <th className="px-4 py-3">Constraint</th>}
                      {isTableColumnVisible("wbs", "dependency") && <th className="px-4 py-3">Dependency</th>}
                      {isTableColumnVisible("wbs", "responsible") && <th className="px-4 py-3">Responsible</th>}
                      {isTableColumnVisible("wbs", "timeline") && <th className="px-4 py-3">Task Timeline</th>}
                      {isTableColumnVisible("wbs", "status") && <th className="px-4 py-3">Status</th>}
                      {isTableColumnVisible("wbs", "actions") && <th className="px-4 py-3">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleFilteredTasks.map((task) => {
                      const isExpanded = expandedRows[task.id];
                      return (
                        <Fragment key={task.id}>
                          <tr className="border-b border-gray-100 text-xs font-normal text-slate-700 hover:bg-gray-50/70">
                            {isTableColumnVisible("wbs", "activityId") && <td className="px-4 py-3 text-slate-500">{activityId(task)}</td>}
                            {isTableColumnVisible("wbs", "task") && (
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => setExpandedRows((current) => ({ ...current, [task.id]: !current[task.id] }))}
                                className="text-left"
                              >
                                <span className="block max-w-[320px] truncate text-sm font-medium text-slate-950">{task.name}</span>
                                <span className="mt-0.5 block text-[11px] font-normal text-slate-500">{task.subtasks.length} subtasks · {planDaysBetween(task.start, task.end)} days</span>
                                {task.bepSection && <span className="mt-0.5 block max-w-[320px] truncate text-[10px] font-normal text-slate-400">BEP Section: {task.bepSection}</span>}
                                {task.output && <span className="mt-0.5 block max-w-[320px] truncate text-[10px] font-normal text-blue-600">Output: {task.output}</span>}
                              </button>
                            </td>
                            )}
                            {isTableColumnVisible("wbs", "start") && <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatPlanDate(task.start)}</td>}
                            {isTableColumnVisible("wbs", "finish") && <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatPlanDate(task.end)}</td>}
                            {isTableColumnVisible("wbs", "actual") && <td className="px-4 py-3">{planningActual(task)}d</td>}
                            {isTableColumnVisible("wbs", "float") && <td className="px-4 py-3">{planningFloat(task)}d</td>}
                            {isTableColumnVisible("wbs", "constraint") && <td className="px-4 py-3">{planningConstraint(task)}</td>}
                            {isTableColumnVisible("wbs", "dependency") && <td className="px-4 py-3">{planningDependency(task)}</td>}
                            {isTableColumnVisible("wbs", "responsible") && <td className="px-4 py-3">{planningResponsible(task, selectedPackage)}</td>}
                            {isTableColumnVisible("wbs", "timeline") && (
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => openEditModal(selectedPackage.id, task.id)}
                                onMouseEnter={(event) => handleBarHover(event, { ...task, itemType: "task", packageId: selectedPackage.id })}
                                onMouseMove={(event) => handleBarHover(event, { ...task, itemType: "task", packageId: selectedPackage.id })}
                                onMouseLeave={() => setHovered(null)}
                                className="relative block h-2.5 w-36 overflow-hidden rounded-full bg-slate-100"
                              >
                                <span className="absolute top-0 h-full rounded-full" style={{ ...timelinePosition(task.start, task.end, selectedBounds), background: timelineColor(task) }} />
                              </button>
                            </td>
                            )}
                            {isTableColumnVisible("wbs", "status") && (
                            <td className="px-4 py-3">
                              <span className={cx("inline-flex rounded-full border px-2 py-1 text-[11px] font-medium", statusTheme[task.status].pill)}>{task.status}</span>
                            </td>
                            )}
                            {isTableColumnVisible("wbs", "actions") && (
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => openEditModal(selectedPackage.id, task.id)} className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-gray-50">Edit</button>
                                <button type="button" onClick={() => openCreateSubtask(task.id)} className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-slate-500 hover:bg-gray-50" title="Create subtask">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                            )}
                          </tr>
                          {isExpanded && (
                            <tr key={`${task.id}-subtasks`} className="border-b border-gray-100 bg-slate-50/40">
                              <td colSpan={visibleColumnCount("wbs", wbsTableColumns)} className="px-4 py-3">
                                <div className="space-y-2">
                                  {task.subtasks.map((subtask) => (
                                    <div key={subtask.id} className="grid grid-cols-[minmax(260px,1fr)_160px_120px_120px_auto] items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 text-xs">
                                      <div className="min-w-0 pl-4">
                                        <p className="truncate text-[12px] font-normal text-slate-700">{activityId(subtask)} {subtask.name}</p>
                                        <p className="mt-0.5 text-[10px] font-normal text-slate-400">{planningResponsible(subtask, selectedPackage)} - Float {planningFloat(subtask)}d - {formatPlanDate(subtask.start, true)} to {formatPlanDate(subtask.end, true)}</p>
                                        {(subtask.output || task.output) && <p className="mt-0.5 truncate text-[10px] font-normal text-blue-600">Output: {subtask.output || task.output}</p>}
                                      </div>
                                      <div className="relative h-2 rounded-full bg-slate-100">
                                        <span className="absolute top-0 h-full rounded-full" style={{ ...timelinePosition(subtask.start, subtask.end, selectedBounds), background: timelineColor(subtask) }} />
                                      </div>
                                      <span className={cx("w-max rounded-full border px-2 py-1 text-[10px] font-medium", statusTheme[subtask.status].pill)}>{subtask.status}</span>
                                      <span className="text-[11px] font-normal text-slate-500">{planningActual(subtask)} days actual</span>
                                      <button type="button" onClick={() => openEditModal(selectedPackage.id, task.id, subtask.id)} className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-gray-50">Edit schedule</button>
                                    </div>
                                  ))}
                                  <button type="button" onClick={() => openCreateSubtask(task.id)} className="inline-flex h-8 items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-white px-3 text-xs font-medium text-slate-600 hover:border-gray-400">
                                    <Plus className="h-3.5 w-3.5" />
                                    Create subtask
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredTasks.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-sm font-normal text-gray-500">
                  <p className="font-medium text-slate-700">{hasPlanningData ? "No planning tasks match the current filters." : "No planning data yet."}</p>
                  <p className="mt-1 text-xs text-slate-500">{hasPlanningData ? "Adjust filters or create another task." : "Create the first phase to start a fresh schedule."}</p>
                  <button type="button" onClick={hasPlanningData ? openCreateTask : openCreatePhase} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-medium text-white hover:bg-blue-700">
                    <Plus className="h-3.5 w-3.5" />
                    {hasPlanningData ? "Create task" : "Create phase"}
                  </button>
                </div>
              )}
            </>
          )}

          {(view === "timeline" || view === "gantt") && renderTimeline()}
          {view === "milestones" && renderMilestones()}
          {view === "baseline" && renderBaseline()}
          {view === "lookahead" && renderLookahead()}
          {view === "scheduled-actual" && renderScheduledActual()}
        </section>
      </div>

      {view !== "scheduled-actual" && renderActualDetailDrawer()}

      {hovered && (
        <div
          className="fixed z-[70] max-h-[calc(100vh-24px)] w-[300px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 text-xs shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
          style={{
            left: Math.max(12, Math.min(hovered.x + 14, window.innerWidth - 320)),
            top: Math.max(12, Math.min(hovered.y + 14, window.innerHeight - 420)),
          }}
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-950">{activityId(hovered.item)} {hovered.item.name}</p>
              <p className="mt-1 text-[11px] font-normal capitalize text-slate-500">{hovered.item.itemType}</p>
            </div>
            <span className={cx("rounded-full border px-2 py-1 text-[10px] font-medium", statusTheme[hovered.item.status].pill)}>{hovered.item.status}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <label className="block text-[9px] font-medium uppercase text-slate-400">Start</label>
              <b className="mt-1 block font-medium text-slate-800">{formatPlanDate(hovered.item.start)}</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <label className="block text-[9px] font-medium uppercase text-slate-400">Finish</label>
              <b className="mt-1 block font-medium text-slate-800">{formatPlanDate(hovered.item.end)}</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <label className="block text-[9px] font-medium uppercase text-slate-400">Actual</label>
              <b className="mt-1 block font-medium text-slate-800">{planningActual(hovered.item)} days</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <label className="block text-[9px] font-medium uppercase text-slate-400">Float</label>
              <b className="mt-1 block font-medium text-slate-800">{planningFloat(hovered.item)} days</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <label className="block text-[9px] font-medium uppercase text-slate-400">Responsible</label>
              <b className="mt-1 block font-medium text-slate-800">{planningResponsible(hovered.item)}</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <label className="block text-[9px] font-medium uppercase text-slate-400">Dependency</label>
              <b className="mt-1 block font-medium text-slate-800">{planningDependency(hovered.item)}</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <label className="block text-[9px] font-medium uppercase text-slate-400">Buffer</label>
              <b className="mt-1 block font-medium text-slate-800">{bufferDays(hovered.item)} days</b>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
              <label className="block text-[9px] font-medium uppercase text-slate-400">Delay</label>
              <b className="mt-1 block font-medium text-slate-800">{hovered.item.actualEnd ? Math.max(0, dateDiffDays(hovered.item.end, hovered.item.actualEnd)) : 0} days</b>
            </div>
          </div>
          <div className="mt-2 rounded-lg border border-blue-100 bg-blue-50/60 p-2 text-[11px] font-normal leading-5 text-blue-900">
            Date range: {formatPlanDate(hovered.item.start)} - {formatPlanDate(hovered.item.end)}
            <br />
            Duration: {planDaysBetween(hovered.item.start, hovered.item.end)} days. Buffer is planned safe time; delay is unplanned actual slippage.
          </div>
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_22px_70px_rgba(15,23,42,0.16)] [&>button.absolute]:hidden">
          <DialogHeader className="shrink-0 border-b border-slate-100 bg-white px-5 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="mb-2 inline-flex w-max rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-medium uppercase text-blue-700">
                  {editState?.mode === "edit" ? "Schedule" : editState?.mode === "create-subtask" ? "Subtask" : "Task"}
                </div>
                <DialogTitle className="text-base font-medium text-slate-950">
                  {editState?.mode === "create-phase" ? "Create new phase"
                    : editState?.mode === "create-task" ? "Create new task"
                      : editState?.mode === "create-subtask" ? "Create new subtask"
                        : "Edit schedule item"}
                </DialogTitle>
                <DialogDescription className="mt-1 max-w-2xl text-xs font-normal leading-5 text-slate-500">
                  Update planned dates, dependency logic, planned buffer, actual delay, recovery plan, and Gantt styling.
                </DialogDescription>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-600 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="button" onClick={saveSchedule} className="h-9 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white hover:bg-blue-700">
                  Save schedule
                </button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto bg-slate-50/40 px-5 py-4">
            <div className="space-y-4">
              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-950">Activity Details</p>
                  <p className="mt-1 text-[11px] font-normal text-slate-500">Name, ownership, status, and display settings.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <label className="md:col-span-2 lg:col-span-3">
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Task name</span>
                    <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white" />
                  </label>

                  {editState?.mode === "create-subtask" && (
                    <label className="md:col-span-2 lg:col-span-3">
                      <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Parent task</span>
                      <select value={form.parentTaskId} onChange={(event) => updateForm("parentTaskId", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white">
                        {modalPackage.tasks.map((task) => <option key={task.id} value={task.id}>{activityId(task)} {task.name}</option>)}
                      </select>
                    </label>
                  )}

                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Activity ID</span>
                    <input value={form.activityId} onChange={(event) => updateForm("activityId", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white" />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Responsible</span>
                    <select value={form.responsible} onChange={(event) => updateForm("responsible", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white">
                      {responsibleOptions.map((owner) => <option key={owner}>{owner}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Status</span>
                    <select value={form.status} onChange={(event) => updateForm("status", event.target.value as PlanningStatus)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white">
                      {statusOptions.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Progress %</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.status === "Completed" ? 100 : form.progress}
                      onChange={(event) => updateForm("progress", clampPercent(Number(event.target.value)))}
                      disabled={form.status === "Completed"}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </label>
                  <label className="md:col-span-2">
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Schedule effect</span>
                    <select value={form.scheduleEffect} onChange={(event) => updateForm("scheduleEffect", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white">
                      <option>Update live forecast</option>
                      <option>Save as recovery scenario</option>
                      <option>Flag for approval</option>
                    </select>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Timeline color</span>
                    <div className="grid grid-cols-[44px_1fr] items-center gap-3">
                      <input type="color" value={form.color} onChange={(event) => updateForm("color", event.target.value)} className="h-10 w-11 rounded-lg border border-slate-200 bg-white p-1" />
                      <span className="text-xs font-normal leading-5 text-slate-500">Bar color.</span>
                    </div>
                  </label>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-950">Dependency Management</p>
                  <p className="mt-1 text-[11px] font-normal text-slate-500">Set predecessor activities with relation type and lag. Dependency logic refreshes the live forecast on save.</p>
                </div>
                <div className="space-y-2">
                  {form.dependencies.length > 0 ? form.dependencies.map((dependency) => (
                    <div key={dependency.id} className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50/60 p-2 md:grid-cols-[minmax(0,1fr)_76px_88px_32px]">
                      <div className="min-w-0">
                        <input
                          list={`predecessor-options-${dependency.id}`}
                          value={predecessorLabel(dependency.predecessorId)}
                          onChange={(event) => {
                            const value = event.target.value;
                            const match = availablePredecessors.find((item) => `${item.code} ${item.name}` === value || item.id === value || item.code === value);
                            updateDependency(dependency.id, { predecessorId: match?.id || value });
                          }}
                          placeholder="Search predecessor activity"
                          className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs font-normal text-slate-700 outline-none focus:border-blue-300"
                        />
                        <datalist id={`predecessor-options-${dependency.id}`}>
                          {availablePredecessors.map((item) => (
                            <option key={item.id} value={`${item.code} ${item.name}`}>{item.type}</option>
                          ))}
                        </datalist>
                      </div>
                      <select
                        value={dependency.type}
                        onChange={(event) => updateDependency(dependency.id, { type: event.target.value as DependencyType })}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-300"
                      >
                        {dependencyTypes.map((type) => <option key={type}>{type}</option>)}
                      </select>
                      <input
                        value={dependency.lag}
                        onChange={(event) => updateDependency(dependency.id, { lag: event.target.value })}
                        placeholder="+2d"
                        className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-normal text-slate-700 outline-none focus:border-blue-300"
                      />
                      <button
                        type="button"
                        onClick={() => updateForm("dependencies", form.dependencies.filter((item) => item.id !== dependency.id))}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100"
                        title="Remove dependency"
                      >
                        ×
                      </button>
                    </div>
                  )) : (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-3 py-3 text-xs font-normal text-slate-500">
                      No predecessor dependency set.
                    </div>
                  )}
                  <button type="button" onClick={addDependency} className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50">
                    <Plus className="h-3.5 w-3.5" />
                    Add Dependency
                  </button>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-950">Schedule Dates & Logic</p>
                  <p className="mt-1 text-[11px] font-normal text-slate-500">Planned dates, actual dates, read-only actual days, float, and constraint.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Planned Start</span>
                    <input type="date" value={form.start} onChange={(event) => updateForm("start", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white" />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Planned Finish</span>
                    <input type="date" value={form.end} onChange={(event) => updateForm("end", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white" />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Constraint</span>
                    <select value={form.constraint} onChange={(event) => updateForm("constraint", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white">
                      {constraintOptions.map((constraint) => <option key={constraint}>{constraint}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Actual Start</span>
                    <input type="date" value={form.actualStart} onChange={(event) => updateForm("actualStart", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white" />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Actual Finish</span>
                    <input type="date" value={form.actualEnd} onChange={(event) => updateForm("actualEnd", event.target.value)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white" />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Actual (Days)</span>
                    <input
                      type="number"
                      min={0}
                      value={form.actualStart && form.actualEnd ? delaySnapshot.actualDays : form.actual}
                      readOnly={Boolean(form.actualStart && form.actualEnd)}
                      onChange={(event) => updateForm("actual", Number(event.target.value))}
                      className={cx(
                        "h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white",
                        form.actualStart && form.actualEnd ? "bg-slate-100 text-slate-500" : "bg-slate-50/70",
                      )}
                      title={form.actualStart && form.actualEnd ? "Calculated from Actual Finish - Actual Start." : "Editable until actual dates are complete."}
                    />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Float (days)</span>
                    <input
                      type="number"
                      value={computedFloat}
                      readOnly
                      className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-normal text-slate-500 outline-none"
                      title="Calculated automatically from dependency network and schedule logic."
                    />
                  </label>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-950">Schedule Buffer</p>
                  <p className="mt-1 text-[11px] font-normal text-slate-500">Planned safe time intentionally added to absorb risk. This is separate from execution delay.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Buffer Days</span>
                    <input type="number" min={0} value={form.bufferDays} onChange={(event) => updateForm("bufferDays", Number(event.target.value))} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white" />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Buffer Reason</span>
                    <select value={form.bufferReason} onChange={(event) => updateForm("bufferReason", event.target.value as BufferReason)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white">
                      {bufferReasons.map((reason) => <option key={reason}>{reason}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Buffer Type</span>
                    <select value={form.bufferType} onChange={(event) => updateForm("bufferType", event.target.value as BufferType)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white">
                      {bufferTypes.map((type) => <option key={type}>{type}</option>)}
                    </select>
                  </label>
                  <div>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Buffer Visibility</span>
                    <button
                      type="button"
                      onClick={() => updateForm("bufferVisible", !form.bufferVisible)}
                      className={cx(
                        "flex h-10 w-full items-center justify-between rounded-lg border px-3 text-xs font-medium transition-colors",
                        form.bufferVisible ? "border-teal-200 bg-teal-50 text-teal-700" : "border-slate-200 bg-slate-50 text-slate-500",
                      )}
                      role="switch"
                      aria-checked={form.bufferVisible}
                    >
                      <span>{form.bufferVisible ? "Show in Gantt" : "Hide from reports"}</span>
                      <span className={cx("h-4 w-7 rounded-full p-0.5 transition-colors", form.bufferVisible ? "bg-teal-500" : "bg-slate-300")}>
                        <span className={cx("block h-3 w-3 rounded-full bg-white transition-transform", form.bufferVisible && "translate-x-3")} />
                      </span>
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 text-[11px] font-normal text-slate-500 md:grid-cols-3">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">Planned buffer: <b className="font-medium text-slate-800">{form.bufferDays || 0}d</b></div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">Consumed by delay: <b className="font-medium text-slate-800">{delaySnapshot.consumedBuffer}d</b></div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">Remaining usable buffer: <b className="font-medium text-slate-800">{delaySnapshot.remainingBuffer}d</b></div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <p className="text-xs font-medium text-slate-950">Delay Tracking</p>
                  <p className="mt-1 text-[11px] font-normal text-slate-500">Unplanned execution slippage is tracked separately. Planned buffer is consumed first before critical delay is marked.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Delay Days</span>
                    <input value={delaySnapshot.delayDays} readOnly className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-normal text-slate-500 outline-none" title="Actual Finish - Planned Finish" />
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Delay Status</span>
                    <select value={delaySnapshot.delayStatus} disabled className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-normal text-slate-500 outline-none">
                      {delayStatuses.map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Delay Reason</span>
                    <select value={form.delayReason} onChange={(event) => updateForm("delayReason", event.target.value as DelayReason)} className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white">
                      {delayReasons.map((reason) => <option key={reason}>{reason}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Delay Impact</span>
                    <input value={delaySnapshot.delayImpact} readOnly className="h-10 w-full rounded-lg border border-slate-200 bg-slate-100 px-3 text-sm font-normal text-slate-500 outline-none" />
                  </label>
                  <label className="md:col-span-2 lg:col-span-4">
                    <span className="mb-1.5 block text-[10px] font-medium uppercase text-slate-500">Recovery Plan</span>
                    <textarea value={form.recoveryPlan} onChange={(event) => updateForm("recoveryPlan", event.target.value)} rows={3} placeholder="Optional recovery action, resequencing note, or acceleration plan" className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-normal outline-none focus:border-blue-300 focus:bg-white" />
                  </label>
                </div>
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 p-2 text-[11px] font-normal leading-5 text-blue-900">
                  Schedule variance: {delaySnapshot.delayDays}d late, {delaySnapshot.consumedBuffer}d absorbed by planned buffer, {delaySnapshot.netDelay}d net delay to live forecast.
                </div>
              </section>

              <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-normal leading-5 text-slate-500">
                Saving updates the live planning data and redraws the WBS table, timeline, Gantt chart, and visualization panel.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
