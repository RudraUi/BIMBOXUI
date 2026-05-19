import React, { useState } from 'react';
import { 
  Maximize, Minimize, Columns, LayoutPanelLeft, 
  ChevronDown, Search, Map, Sun, Navigation, 
  MousePointer2, Hand, Star, Ruler, SquareDashed, 
  ZoomIn, Crop, BookOpen, MessageSquare, AlertCircle, 
  Menu, Square, Box, Camera, Eye, EyeOff, Minus,
  ChevronUp, GripVertical, Layers as LayersIcon
} from 'lucide-react';

// -----------------------------------------------------------------------------
// SVG Icons specifically for the Viewport
// -----------------------------------------------------------------------------
const SIDE_TOOL_ICON_SIZE = 18;

type IconProps = React.SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

const CustomCube = ({ size = SIDE_TOOL_ICON_SIZE, strokeWidth = 2, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const ViewportModel = ({ angle = 'default' }: { angle?: 'default' | 'right' }) => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <div className="relative w-full max-w-[800px] aspect-video flex items-center justify-center">
      {/* Soft Radial Glow */}
      <div className="absolute w-[600px] h-[600px] bg-white/40 blur-[100px] rounded-full mix-blend-overlay"></div>
      
      {/* Abstract BIM Model (SVG) */}
      <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-2xl opacity-90 z-10" style={{ transform: angle === 'right' ? 'scaleX(-1) rotate(5deg)' : 'rotate(-5deg)' }}>
        <g stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" fill="#cbd5e1">
          {/* Base Platform */}
          <path d="M 200 250 L 400 320 L 700 220 L 500 150 Z" fill="#e2e8f0" />
          <path d="M 200 250 L 200 270 L 400 340 L 400 320 Z" fill="#94a3b8" />
          <path d="M 400 340 L 700 240 L 700 220 L 400 320 Z" fill="#64748b" />
          {/* Grid lines on platform */}
          <path d="M 250 232 L 450 302 M 300 215 L 500 285 M 350 197 L 550 267" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
          <path d="M 300 285 L 600 185 M 350 302 L 650 202" stroke="#94a3b8" strokeWidth="1" opacity="0.5" />
          
          {/* Core Building */}
          <path d="M 450 220 L 550 255 L 650 220 L 550 185 Z" fill="#f1f5f9" />
          <path d="M 450 220 L 450 100 L 550 135 L 550 255 Z" fill="#cbd5e1" />
          <path d="M 550 135 L 650 100 L 650 220 L 550 255 Z" fill="#94a3b8" />
          
          {/* Building Windows / Details */}
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
          
          {/* Top Structural Beams */}
          {Array.from({ length: 8 }).map((_, i) => (
            <path key={`t-${i}`} d={`M ${460 + i * 25} ${90 + (i < 4 ? i * 8 : (7 - i) * 8)} L ${460 + i * 25} ${110 + (i < 4 ? i * 8 : (7 - i) * 8)}`} stroke="#334155" strokeWidth="2" />
          ))}
        </g>
      </svg>
    </div>
  </div>
);

const LayerPanel = ({ side, onClose }: { side: 'left' | 'right'; onClose: () => void }) => (
  <div className={`absolute bottom-20 ${side === 'left' ? 'left-20' : 'right-20'} w-44 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-[0_10px_28px_rgb(0,0,0,0.06)] overflow-hidden z-30 flex flex-col`}>
    <div className="px-2.5 py-1.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
      <h3 className="font-bold text-[11px] text-slate-800">Layers</h3>
      <button
        onClick={onClose}
        aria-label={`Close ${side} layers`}
        className="text-slate-400 hover:text-slate-700 transition-colors"
      >
        <Minus size={12} />
      </button>
    </div>

    <div className="p-1 space-y-0.5">
      <div className="flex items-center justify-between px-2 py-1 bg-blue-600 text-white rounded-md cursor-pointer shadow-sm shadow-blue-500/20">
        <span className="text-[11px] font-semibold">All Levels</span>
        <Eye size={12} className="text-white/80" />
      </div>
      <div className="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer hover:bg-slate-50 text-slate-700 transition-colors">
        <div className="flex items-center gap-1.5">
          <Eye size={12} className="text-slate-400" />
          <span className="text-[11px] font-semibold">Ground</span>
        </div>
        <ChevronDown size={11} className="text-slate-300" />
      </div>
      <div className="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer hover:bg-slate-50 text-slate-700 transition-colors">
        <div className="flex items-center gap-1.5">
          <Eye size={12} className="text-slate-400" />
          <span className="text-[11px] font-semibold">Floor 1</span>
        </div>
        <ChevronDown size={11} className="text-slate-300" />
      </div>
      <div className="flex items-center justify-between px-2 py-1 rounded-md cursor-pointer hover:bg-slate-50 text-slate-700 transition-colors">
        <div className="flex items-center gap-1.5">
          <EyeOff size={12} className="text-slate-300" />
          <span className="text-[11px] font-semibold text-slate-400">Structure</span>
        </div>
        <ChevronDown size={11} className="text-slate-300" />
      </div>
    </div>
  </div>
);

export default function BIMBOXVIWER() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompareView, setIsCompareView] = useState(false);
  const [activeSideTool, setActiveSideTool] = useState('box');
  const [activeBottomTool, setActiveBottomTool] = useState('pointer');
  const [activeRightBottomTool, setActiveRightBottomTool] = useState('pointer');
  const [isLeftLayerOpen, setIsLeftLayerOpen] = useState(false);
  const [isRightLayerOpen, setIsRightLayerOpen] = useState(false);
  const [compareSplitPos, setCompareSplitPos] = useState(50); // percentage
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

  // Safe area handling for split dragging
  const handleDrag = (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const newPos = (e.clientX / window.innerWidth) * 100;
    if (newPos > 20 && newPos < 80) setCompareSplitPos(newPos);
  };

  const handleBottomToolClick = (toolId: string, side: 'left' | 'right') => {
    if (toolId === 'layers') {
      if (side === 'left') {
        setIsLeftLayerOpen((isOpen) => !isOpen);
      } else {
        setIsRightLayerOpen((isOpen) => !isOpen);
      }
    }

    if (side === 'left') {
      setActiveBottomTool(toolId);
    } else {
      setActiveRightBottomTool(toolId);
    }
  };

  return (
    <div className="w-full h-screen bg-[#ecf1f5] overflow-hidden text-slate-800 font-sans relative selection:bg-blue-200">
      
      {/* ------------------------------------------------------------------- */}
      {/* SINGLE / LEFT VIEWPORT */}
      {/* ------------------------------------------------------------------- */}
      <div 
        className="absolute top-0 left-0 bottom-0 overflow-hidden"
        style={{ width: isCompareView ? `${compareSplitPos}%` : '100%' }}
      >
        <ViewportModel angle="default" />
        
        {/* Left Side Toolbar */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 bg-white/80 backdrop-blur-md border border-white/40 p-1.5 rounded-[14px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-20">
          {[
            { id: 'menu', icon: Menu },
            { id: 'square', icon: Square },
            { id: 'box', icon: CustomCube },
            { id: 'camera', icon: Camera },
            { id: 'map', icon: Map },
            { id: 'sun', icon: Sun },
            { id: 'compare', icon: Columns },
          ].map(tool => (
            <button 
              key={tool.id}
              onClick={() => {
                if (tool.id === 'compare') {
                  setIsCompareView((isOpen) => !isOpen);
                } else {
                  setActiveSideTool(tool.id);
                }
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${tool.id === 'compare' ? (isCompareView ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-800') : (activeSideTool === tool.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-800')}`}
            >
              <tool.icon size={SIDE_TOOL_ICON_SIZE} strokeWidth={tool.id === 'compare' ? (isCompareView ? 2.5 : 2) : (activeSideTool === tool.id ? 2.5 : 2)} />
            </button>
          ))}
        </div>

        {/* Bottom Toolbar (Centered in its viewport) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-white/50 px-2 py-1.5 rounded-[16px] shadow-[0_12px_40px_rgb(0,0,0,0.06)] z-20 flex items-center gap-1">
          {[
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
          ].map(tool => (
            <button 
              key={tool.id}
              onClick={() => handleBottomToolClick(tool.id, 'left')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold
                ${tool.id === 'layers' ? (isLeftLayerOpen ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900') : (activeBottomTool === tool.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900')}
              `}
            >
              {tool.icon && <tool.icon size={16} strokeWidth={tool.id === 'layers' ? (isLeftLayerOpen ? 2.5 : 2) : (activeBottomTool === tool.id ? 2.5 : 2)} />}
              {tool.label && <span>{tool.label} <ChevronDown size={12} className="inline opacity-50 ml-0.5" /></span>}
            </button>
          ))}
        </div>

        {isLeftLayerOpen && (
          <LayerPanel
            side="left"
            onClose={() => setIsLeftLayerOpen(false)}
          />
        )}
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* RIGHT VIEWPORT (Only visible in Compare Mode) */}
      {/* ------------------------------------------------------------------- */}
      {isCompareView && (
        <div 
          className="absolute top-0 right-0 bottom-0 overflow-hidden bg-[#e8edf2] border-l border-slate-300 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]"
          style={{ width: `${100 - compareSplitPos}%` }}
        >
          <ViewportModel angle="right" />
          
          {/* Right Viewport Bottom Toolbar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md border border-white/50 px-2 py-1.5 rounded-[16px] shadow-[0_12px_40px_rgb(0,0,0,0.06)] z-20 flex items-center gap-1">
            {[
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
            ].map(tool => (
              <button 
                key={tool.id}
                onClick={() => handleBottomToolClick(tool.id, 'right')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all duration-200 text-xs font-semibold ${tool.id === 'layers' ? (isRightLayerOpen ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900') : (activeRightBottomTool === tool.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900')}`}
              >
                {tool.icon && <tool.icon size={16} strokeWidth={tool.id === 'layers' ? (isRightLayerOpen ? 2.5 : 2) : (activeRightBottomTool === tool.id ? 2.5 : 2)} />}
                {tool.label && <span>{tool.label} <ChevronDown size={12} className="inline opacity-50 ml-0.5" /></span>}
              </button>
            ))}
          </div>

          {/* Right Side Toolbar (Optional duplicate for right pane) */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 bg-white/80 backdrop-blur-md border border-white/40 p-1.5 rounded-[14px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-20">
            {[
              { id: 'menu', icon: Menu },
              { id: 'square', icon: Square },
              { id: 'box', icon: CustomCube },
              { id: 'camera', icon: Camera },
              { id: 'map', icon: Map },
              { id: 'sun', icon: Sun },
            ].map(tool => (
              <button 
                key={tool.id}
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 ${tool.id === 'box' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
              >
                <tool.icon size={SIDE_TOOL_ICON_SIZE} strokeWidth={tool.id === 'box' ? 2.5 : 2} />
              </button>
            ))}
          </div>

          {isRightLayerOpen && (
            <LayerPanel
              side="right"
              onClose={() => setIsRightLayerOpen(false)}
            />
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* COMPARE SLIDER */}
      {/* ------------------------------------------------------------------- */}
      {isCompareView && (
        <div 
          className="absolute top-0 bottom-0 w-4 -ml-2 cursor-col-resize z-50 flex items-center justify-center group"
          style={{ left: `${compareSplitPos}%` }}
          onMouseMove={e => e.buttons === 1 && handleDrag(e)}
        >
          <div className="h-full w-[1px] bg-slate-300 group-hover:bg-blue-400 transition-colors"></div>
          <div className="absolute w-8 h-10 bg-white border border-slate-200 rounded-xl shadow-md flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-300 transition-colors">
            <GripVertical size={16} />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* TOP CONTROLS */}
      {/* ------------------------------------------------------------------- */}
      <div className="absolute top-6 left-6 z-40">
        <button 
          onClick={toggleFullscreen}
          className="p-3 bg-white/80 backdrop-blur-md border border-white/50 rounded-2xl text-slate-600 shadow-[0_4px_20px_rgb(0,0,0,0.05)] hover:bg-white hover:text-slate-900 transition-all hover:scale-105 active:scale-95"
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        
        {/* Spotlight Container */}
        <div className="relative flex flex-col items-center pointer-events-auto">
          <div className="bg-white/85 backdrop-blur-md border-x border-b border-white/60 px-1.5 pb-1.5 pt-0 rounded-t-none rounded-b-[16px] shadow-[0_8px_24px_rgb(0,0,0,0.06)] flex items-center z-20">
            <button className="h-9 flex items-center gap-2 bg-blue-600 text-white px-4 rounded-t-none rounded-b-xl text-sm font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors">
              Spotlight me
            </button>
            <button 
              onClick={() => setIsSpotlightOpen(!isSpotlightOpen)}
              className="h-9 w-9 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-t-none rounded-b-xl transition-colors ml-1.5 border border-t-0 border-slate-200"
            >
              {isSpotlightOpen ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Spotlight Dropdown */}
          {isSpotlightOpen && (
            <>
              {/* Vertical connecting line */}
              <div className="absolute top-9 w-[1px] h-3 bg-slate-300 -z-10 left-1/2 -translate-x-1/2"></div>
              
              <div className="mt-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-xl w-72 flex flex-col overflow-hidden z-20">
                <div className="flex items-center justify-between p-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      S
                    </div>
                    <div className="flex items-center gap-1 overflow-hidden">
                      <span className="text-sm font-bold text-slate-800 truncate">Snehasis Mohapatra</span>
                      <span className="text-xs text-slate-400 shrink-0">(Y...</span>
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                      <line x1="12" x2="12" y1="19" y2="22"/>
                    </svg>
                  </div>
                </div>
                <div className="h-px bg-slate-100 mx-4"></div>
                <div className="p-4 px-4">
                  <p className="text-sm text-slate-400 font-medium">No users found.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="absolute top-6 right-6 z-40 flex flex-col items-center gap-3">
        {/* 3D Orientation Cube */}
        <div className="w-16 h-16 relative perspective-[1000px] flex items-center justify-center transform-gpu">
          <div className="w-12 h-12 bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[10px] font-bold text-blue-600 transform-gpu rotate-x-[-15deg] rotate-y-[15deg]">
            Front
          </div>
          <div className="absolute -bottom-4 w-12 h-4 bg-slate-900/10 rounded-[100%] blur-[2px]"></div>
          <div className="absolute -bottom-3 w-10 h-10 border-2 border-slate-300/40 rounded-full transform rotate-x-[75deg]"></div>
        </div>
      </div>

    </div>
  );
}

// Internal SVG Component for the specific 'Layers' icon used in their bottom toolbar
