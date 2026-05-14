import { Link } from "react-router";
import { Sparkles, Construction, Wrench, Box, MapPin } from "lucide-react";
import { useEffect } from "react";
import { useSidebar } from "../../context/SidebarContext";

export function Welcome() {
  const { setMode } = useSidebar();

  useEffect(() => {
    setMode("main");
  }, [setMode]);
  const stages = [
    {
      title: "Pre Construction",
      subtitle: "Fast BIM Automation",
      icon: Sparkles,
      path: "/pre-construction",
    },
    {
      title: "Construction",
      subtitle: "Construction Management",
      icon: Construction,
      path: "/construction",
    },
    {
      title: "Facility Management",
      subtitle: "Project Management",
      icon: Wrench,
      path: "/facility-management",
    },
    {
      title: "Site Survey",
      subtitle: "Project Management",
      icon: MapPin,
      path: "/site-survey",
    },
    {
      title: "Digital twin",
      subtitle: "Project Management",
      icon: Box,
      path: "/digital-twin",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="max-w-4xl w-full text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-gray-900 rounded-2xl flex items-center justify-center">
            <Box className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Greeting */}
        <h1 className="text-5xl mb-3">
          Hello, <span className="text-gray-900">Samuel</span>
        </h1>

        <p className="text-gray-500 text-base mb-12">Choose Your Project Stage</p>

        {/* Stage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <Link
                key={stage.path}
                to={stage.path}
                className="border-2 border-gray-200 rounded-xl p-6 hover:border-gray-900 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-gray-900 group-hover:underline">
                      {stage.title}
                    </h3>
                    <p className="text-gray-500 text-sm">{stage.subtitle}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
