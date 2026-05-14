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

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Welcome },
      { path: "dashboard", Component: Hub },
      { path: "projects", Component: AllProjects },
      { path: "procurement", Component: Procurement },
      { path: "banking", Component: Banking },
      { path: "ai-hub", Component: AIHub },
      { path: "data-explorer", Component: DataExplorer },
      { path: "pre-construction", Component: PreConstruction },
      { path: "construction", Component: Construction },
      { path: "facility-management", Component: FacilityManagement },
      { path: "digital-twin", Component: DigitalTwin },
      { path: "site-survey", Component: SiteSurvey },
    ],
  },
]);
