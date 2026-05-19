import React, { useState } from 'react';
import {
  Maximize,
  Minimize,
  Columns,
  LayoutPanelLeft,
  ChevronDown,
  Map,
  Sun,
  MousePointer2,
  Hand,
  Star,
  Ruler,
  SquareDashed,
  ZoomIn,
  Crop,
  BookOpen,
  Menu,
  Square,
  Box,
  Camera,
  Eye,
  EyeOff,
  Minus,
  ChevronUp,
  GripVertical,
  Layers as LayersIcon,
} from 'lucide-react';

const TOOL_ICON_SIZE = 18;

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

const CustomCube = ({ size = TOOL_ICON_SIZE, strokeWidth = 2, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ViewportModel = ({ angle = 'default' }: { angle?: 'default' | 'right' }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="relative w-full max-w-[860px] aspect-video flex items-center justify-center">
      <div className="absolute w-[620px] h-[620px] bg-white/45 blur-[100px] rounded-full mix-blend-overlay" />
      <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-2xl opacity-90 z-10" style={{ transform: angle === 'right' ? 'scaleX(-1) rotate(4deg)' : 'rotate(-4deg)' }}>
        <g stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" fill="#cbd5e1">
          <path d="M 200 250 L 400 320 L 700 220 L 500 150 Z" fill="#e2e8f0" />
          <path d="M 200 250 L 200 270 L 400 340 L 400 320 Z" fill="#94a3b8" />
          <path d="M 400 340 L 700 240 L 700 220 L 400 320 Z" fill="#64748b" />
          <path d="M 250 232 L 450 302 M 300 215 L 500 285 M 350 197 L 550 267" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
          <path d="M 300 285 L 600 185 M 350 302 L 650 202" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
          <path d="M 450 220 L 550 255 L 650 220 L 550 185 Z" fill="#f1f5f9" />
          <path d="M 450 220 L 450 100 L 550 135 L 550 255 Z" fill="#cbd5e1" />
          <path d="M 550 135 L 650 100 L 650 220 L 550 255 Z" fill="#94a3b8" />
          {Array.from({ length: 4 }).map((_, i) => (
            <g key={`w1-${i}`}>
              <line x1="450" y1={130 + i * 25} x2="550" y2={165 + i * 25} stroke="#64748b" strokeWidth="2" />
              <line x1="550" y1={165 + i * 25} x2="650" y2={130 + i * 25} stroke="#475569" strokeWidth="2" />
            </g>
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={`v1-${i}`}>
              <line x1={465 + i * 15} y1={105 + i * 5} x2={465 + i * 15} y2={225 + i * 5} stroke="#64748b" strokeWidth="1.5" opacity="0.7" />
              <line x1={565 + i * 15} y1={130 - i * 5} x2={565 + i * 15} y2={250 - i * 5} stroke="#475569" strokeWidth="1.5" opacity="0.7" />
            </g>
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={`t-${i}`} d={`M ${460 + i * 25} ${90 + (i < 4 ? i * 8 : (7 - i) * 8)} L ${460 + i * 25} ${110 + (i < 4 ? i * 8 : (7 - i) * 8)}`} stroke="#334155" strokeWidth="2" />
          ))}
        </g>
      </svg>
    </div>
  </div>
);

const layerRows = [
  { id: 'all', label: 'All Levels', visible: true, active: true },
  { id: 'ground', label: 'Ground', visible: true },
  { id: 'floor-1', label: 'Floor 1', visible: true },
  { id: 'structure', label: 'Structure', visible: false },
];

const LayerPopover = ({ side, onClose }: { side: 'left' | 'right'; onClose: () => void }) => (
  <div className={`absolute top-20 ${side === 'left' ? 'left-[86px]' : 'right-[86px]'} w-48 bg-white/90 backdrop-blur-md border border-slate-200/70 rounded-xl shadow-[0_16px_40px_rgb(15,23,42,0.10)] overflow-hidden z-40`}>
    <div className="h-8 px-2.5 flex items-center justify-between border-b border-slate-100 bg-white/60">
      <span className="text-[11px] font-bold text-slate-800">{side === 'left' ? 'Left' : 'Right'} Layers</span>
      <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label={`Close ${side} layers`}>
        <Minus size={12} />
      </button>
    </div>
    <div className="p-1">
      {layerRows.map((row) => (
        <button
          key={row.id}
          className={`w-full h-7 px-2 flex items-center justify-between rounded-md text-[11px] font-semibold transition-colors ${row.active ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          <span>{row.label}</span>
          {row.visible ? <Eye size={12} className={row.active ? 'text-white/80' : 'text-slate-400'} /> : <EyeOff size={12} className="text-slate-300" />}
        </button>
      ))}
    </div>
  </div>
);

const RailButton = ({
  active,
  icon: Icon,
  onClick,
}: {
  active?: boolean;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-500 hover:bg-white hover:text-slate-900'}`}
  >
    <Icon size={TOOL_ICON_SIZE} strokeWidth={active ? 2.5 : 2} />
  </button>
);

const BottomButton = ({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon?: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  label?: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className={`h-9 min-w-9 px-2.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-all ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
  >
    {Icon && <Icon size={16} strokeWidth={active ? 2.5 : 2} />}
    {label && (
      <span>
        {label}
        <ChevronDown size={12} className="inline ml-0.5 opacity-50" />
      </span>
    )}
  </button>
);

export default function BIMBOXVIWERExperiment() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompareView, setIsCompareView] = useState(false);
  const [activeSideTool, setActiveSideTool] = useState('box');
  const [activeBottomTool, setActiveBottomTool] = useState('pointer');
  const [activeRightBottomTool, setActiveRightBottomTool] = useState('pointer');
  const [activeLayerSide, setActiveLayerSide] = useState<'left' | 'right' | null>(null);
  const [compareSplitPos, setCompareSplitPos] = useState(50);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const newPos = (e.clientX / window.innerWidth) * 100;
    if (newPos > 24 && newPos < 76) setCompareSplitPos(newPos);
  };

  const handleToolClick = (toolId: string, side: 'left' | 'right') => {
    if (toolId === 'layers') {
      setActiveLayerSide((current) => (current === side ? null : side));
    }

    if (side === 'left') {
      setActiveBottomTool(toolId);
    } else {
      setActiveRightBottomTool(toolId);
    }
  };

  const sideTools = [
    { id: 'menu', icon: Menu },
    { id: 'square', icon: Square },
    { id: 'box', icon: CustomCube },
    { id: 'camera', icon: Camera },
    { id: 'map', icon: Map },
    { id: 'sun', icon: Sun },
  ];

  const bottomTools = [
    { id: 'home', icon: LayoutPanelLeft },
    { id: 'cube', icon: Box },
    { id: 'layers', icon: LayersIcon },
    { id: 'pointer', icon: MousePointer2 },
    { id: 'hand', icon: Hand },
    { id: 'star', icon: Star },
    { id: 'ruler', icon: Ruler },
    { id: 'section', icon: SquareDashed },
    { id: 'zoom', icon: ZoomIn },
    { id: 'crop', icon: Crop },
    { id: 'book', icon: BookOpen },
    { id: 'rfi', label: 'RFI' },
    { id: 'issue', label: 'Issue' },
  ];

  return (
    <div className="w-full h-screen bg-[#edf2f7] overflow-hidden text-slate-800 font-sans relative selection:bg-blue-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(255,255,255,0.95),rgba(226,232,240,0.72)_42%,rgba(203,213,225,0.48)_100%)]" />

      <div className="absolute top-0 left-0 bottom-0 overflow-hidden" style={{ width: isCompareView ? `${compareSplitPos}%` : '100%' }}>
        <ViewportModel angle="default" />
      </div>

      {isCompareView && (
        <div className="absolute top-0 right-0 bottom-0 overflow-hidden bg-[#e8edf2] border-l border-slate-300/80 shadow-[-10px_0_30px_rgba(15,23,42,0.06)]" style={{ width: `${100 - compareSplitPos}%` }}>
          <ViewportModel angle="right" />
        </div>
      )}

      {isCompareView && (
        <div className="absolute top-0 bottom-0 w-4 -ml-2 cursor-col-resize z-50 flex items-center justify-center group" style={{ left: `${compareSplitPos}%` }} onMouseMove={(e) => e.buttons === 1 && handleDrag(e)}>
          <div className="h-full w-px bg-slate-300 group-hover:bg-blue-400 transition-colors" />
          <div className="absolute w-8 h-10 bg-white border border-slate-200 rounded-xl shadow-md flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors">
            <GripVertical size={16} />
          </div>
        </div>
      )}

      <div className="absolute left-5 top-5 bottom-5 z-40 flex flex-col justify-between">
        <div className="flex flex-col gap-2 bg-white/78 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          <RailButton icon={isFullscreen ? Minimize : Maximize} active={isFullscreen} onClick={toggleFullscreen} />
          <div className="h-px bg-slate-200/70 mx-1" />
          <RailButton icon={Columns} active={isCompareView} onClick={() => setIsCompareView((open) => !open)} />
        </div>

        <div className="flex flex-col gap-1.5 bg-white/78 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          {sideTools.map((tool) => (
            <RailButton key={tool.id} icon={tool.icon} active={activeSideTool === tool.id} onClick={() => setActiveSideTool(tool.id)} />
          ))}
        </div>
      </div>

      {isCompareView && (
        <div className="absolute right-5 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-1.5 bg-white/78 backdrop-blur-md border border-white/60 p-1.5 rounded-2xl shadow-[0_14px_36px_rgba(15,23,42,0.08)]">
          {sideTools.map((tool) => (
            <RailButton key={tool.id} icon={tool.icon} active={tool.id === 'box'} />
          ))}
        </div>
      )}

      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40">
        <div className="relative flex flex-col items-center">
          <div className="bg-white/85 backdrop-blur-md border-x border-b border-white/60 px-1.5 pb-1.5 pt-0 rounded-t-none rounded-b-[16px] shadow-[0_8px_24px_rgb(0,0,0,0.06)] flex items-center">
            <button className="h-9 bg-blue-600 text-white px-4 rounded-t-none rounded-b-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
              Spotlight me
            </button>
            <button onClick={() => setIsSpotlightOpen((open) => !open)} className="h-9 w-9 ml-1.5 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-t-none rounded-b-xl transition-colors border border-t-0 border-slate-200">
              {isSpotlightOpen ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} />}
            </button>
          </div>

          {isSpotlightOpen && (
            <div className="mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl w-72 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-3 px-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">S</div>
                  <div className="flex items-center gap-1 overflow-hidden">
                    <span className="text-sm font-bold text-slate-800 truncate">Snehasis Mohapatra</span>
                    <span className="text-xs text-slate-400 shrink-0">(Y...</span>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>
                </div>
              </div>
              <div className="h-px bg-slate-100 mx-4" />
              <div className="p-4 px-4">
                <p className="text-sm text-slate-400 font-medium">No users found.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="absolute top-5 right-5 z-40">
        <div className="w-16 h-16 relative perspective-[1000px] flex items-center justify-center transform-gpu">
          <div className="w-12 h-12 bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-blue-600 transform-gpu rotate-x-[-15deg] rotate-y-[15deg]">Front</div>
          <div className="absolute -bottom-4 w-12 h-4 bg-slate-900/10 rounded-[100%] blur-[2px]" />
          <div className="absolute -bottom-3 w-10 h-10 border-2 border-slate-300/40 rounded-full transform rotate-x-[75deg]" />
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-5 z-40 max-w-[calc(100vw-160px)]">
        <div className="bg-white/90 backdrop-blur-md border border-white/70 px-2 py-1.5 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.10)] flex items-center gap-1 overflow-x-auto">
          {bottomTools.map((tool) => (
            <BottomButton
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              active={tool.id === 'layers' ? activeLayerSide === 'left' : activeBottomTool === tool.id}
              onClick={() => handleToolClick(tool.id, 'left')}
            />
          ))}
        </div>
      </div>

      {isCompareView && (
        <div className="absolute right-5 bottom-5 z-40 bg-white/90 backdrop-blur-md border border-white/70 px-1.5 py-1.5 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.10)] flex items-center gap-1">
          {bottomTools.slice(0, 6).map((tool) => (
            <BottomButton
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              active={tool.id === 'layers' ? activeLayerSide === 'right' : activeRightBottomTool === tool.id}
              onClick={() => handleToolClick(tool.id, 'right')}
            />
          ))}
        </div>
      )}

      {activeLayerSide && <LayerPopover side={activeLayerSide} onClose={() => setActiveLayerSide(null)} />}
    </div>
  );
}
