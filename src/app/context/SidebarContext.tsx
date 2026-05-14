import { createContext, useContext, useState, ReactNode } from "react";

type SidebarMode =
  | "main"
  | "hub-data"
  | "hub-catalog"
  | "hub-procurement"
  | "hub-vendor"
  | "hub-resources"
  | "hub-finance";

interface SidebarContextType {
  mode: SidebarMode;
  setMode: (mode: SidebarMode) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SidebarMode>("main");

  return (
    <SidebarContext.Provider value={{ mode, setMode }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return context;
}
