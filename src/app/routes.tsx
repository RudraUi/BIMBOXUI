import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Welcome } from "./components/pages/Welcome";
import { Hub } from "./components/pages/Hub";
import { AllProjects } from "./components/pages/AllProjects";
import { Procurement } from "./components/pages/Procurement";
import { Banking } from "./components/pages/Banking";
import { AIHub } from "./components/pages/AIHub";
import { DataExplorer } from "./components/pages/DataExplorer";
import { PreConstruction } from "./components/pages/PreConstruction";
import { Construction } from "./components/pages/Construction";
import { FacilityManagement } from "./components/pages/FacilityManagement";
import { DigitalTwin } from "./components/pages/DigitalTwin";
import { SiteSurvey } from "./components/pages/SiteSurvey";
import BIMBOXVIWER from "./components/pages/BIMBOXVIWER";
import BIMBOXVIWERExperiment from "./components/pages/BIMBOXVIWERExperiment";
import TemporaryFlow from "./components/pages/TemporaryFlow";
import ViewerSetup from "./components/pages/viewer-setup/ViewerSetup";
import ViewerMain from "./components/pages/viewer-main/ViewerMain";
import AuthFlow from "./components/pages/AuthFlow";
import { ChatPage } from "./components/pages/ChatPage";

// Material Supplier Workspace imports
import { MaterialSupplierListPage } from "../modules/material-suppliers/pages/MaterialSupplierListPage";
import { MaterialSupplierDetailPage } from "../modules/material-suppliers/pages/MaterialSupplierDetailPage";
import { MaterialReceivingPage } from "../modules/material-suppliers/pages/MaterialReceivingPage";
import { VendorPortalPage } from "../modules/material-suppliers/pages/VendorPortalPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Welcome },
      { path: "dashboard", Component: Hub },
      { path: "projects", Component: AllProjects },
      { path: "chat", Component: ChatPage },
      { path: "procurement", Component: Procurement },
      { path: "banking", Component: Banking },
      { path: "ai-hub", Component: AIHub },
      { path: "data-explorer", Component: DataExplorer },
      { path: "pre-construction", Component: PreConstruction },
      { path: "construction", Component: Construction },
      { path: "facility-management", Component: FacilityManagement },
      { path: "digital-twin", Component: DigitalTwin },
      { path: "site-survey", Component: SiteSurvey },
      
      // Material Supplier Module Routes
      { path: "admin/material-suppliers", Component: MaterialSupplierListPage },
      { path: "admin/material-suppliers/:supplierId", Component: MaterialSupplierDetailPage },
      { path: "manager/material-receiving", Component: MaterialReceivingPage },
      { path: "vendor-portal/material-supplier", Component: VendorPortalPage },
    ],
  },
  {
    path: "/viewer-setup",
    Component: ViewerSetup
  },
  {
    path: "/viewer-main",
    Component: ViewerMain
  },
  {
    path: "/old-viewer",
    Component: BIMBOXVIWER
  },
  {
    path: "/viewer-experiment",
    Component: BIMBOXVIWERExperiment
  },
  {
    path: "/temp-flow",
    Component: AuthFlow
  },
  {
    path: "/tempflow",
    Component: AuthFlow
  },
  {
    path: "/auth",
    Component: AuthFlow
  }
]);
