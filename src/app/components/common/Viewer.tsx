import { Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCw, Layers, Ruler, Eye } from "lucide-react";
import { useState } from "react";

interface ViewerProps {
  mode?: "2D" | "3D" | "BIM";
}

export function Viewer({ mode = "3D" }: ViewerProps) {
  const [viewMode, setViewMode] = useState<"2D" | "3D" | "Walkthrough">("3D");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tools = [
    { icon: ZoomIn, label: "Zoom In" },
    { icon: ZoomOut, label: "Zoom Out" },
    { icon: RotateCw, label: "Rotate" },
    { icon: Layers, label: "Layers" },
    { icon: Ruler, label: "Measure" },
    { icon: Eye, label: "View Settings" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("2D")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              viewMode === "2D" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            2D
          </button>
          <button
            onClick={() => setViewMode("3D")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              viewMode === "3D" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            3D
          </button>
          <button
            onClick={() => setViewMode("Walkthrough")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              viewMode === "Walkthrough" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
            }`}
          >
            Walkthrough
          </button>
        </div>

        <div className="flex items-center gap-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.label}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Viewer Area */}
      <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center mb-4 mx-auto">
              <Layers className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-gray-700 mb-2">{viewMode} Viewer</h3>
            <p className="text-gray-500 text-sm">Load a model to view in {viewMode} mode</p>
          </div>
        </div>

        {/* Grid overlay for 3D effect */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
        <span>Mode: {viewMode}</span>
        <span>Scale: 1:100</span>
      </div>
    </div>
  );
}
