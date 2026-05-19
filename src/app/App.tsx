import { RouterProvider } from "react-router";
import { SidebarProvider } from "./context/SidebarContext";
import { router } from "./routes";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <SidebarProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-center"
        offset={48}
        visibleToasts={3}
        toastOptions={{
          duration: 2600,
          classNames: {
            toast: "!w-fit !min-w-[260px] !max-w-[420px] !rounded-full !border-0 !bg-[#0f1b33] !px-4 !py-3 !text-white !shadow-[0_18px_45px_rgba(15,23,42,0.28)]",
            title: "!text-sm !font-medium !text-white",
            description: "!text-xs !text-slate-300",
            icon: "!text-cyan-400",
            success: "!bg-[#0f1b33] !text-white",
            info: "!bg-[#0f1b33] !text-white",
            warning: "!bg-[#0f1b33] !text-white",
            error: "!bg-[#0f1b33] !text-white",
          },
        }}
      />
    </SidebarProvider>
  );
}
