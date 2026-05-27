import ViewerMain from "../pages/viewer-main/ViewerMain";

interface ViewerProps {
  mode?: "2D" | "3D" | "BIM";
}

export function Viewer({ mode = "3D" }: ViewerProps) {
  return (
    <div className="w-full h-full min-h-[600px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm">
      <ViewerMain />
    </div>
  );
}
