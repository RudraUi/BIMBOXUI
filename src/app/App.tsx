import { RouterProvider } from "react-router";
import { SidebarProvider } from "./context/SidebarContext";
import { router } from "./routes";

export default function App() {
  return (
    <SidebarProvider>
      <RouterProvider router={router} />
    </SidebarProvider>
  );
}
