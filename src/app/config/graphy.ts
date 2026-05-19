const graphyEnv = import.meta.env as Record<string, string | undefined>;

export const graphyConfig = {
  docsUrl: "https://docs.graphy.dev/",
  packageName: "@graphysdk/core",
  enabled: graphyEnv.VITE_GRAPHY_ENABLED === "true",
  workspaceId: graphyEnv.VITE_GRAPHY_WORKSPACE_ID?.trim() ?? "",
  defaultGraphType: graphyEnv.VITE_GRAPHY_DEFAULT_GRAPH_TYPE?.trim() ?? "column",
};

export const isGraphyConfigured = graphyConfig.enabled && graphyConfig.workspaceId !== "";
