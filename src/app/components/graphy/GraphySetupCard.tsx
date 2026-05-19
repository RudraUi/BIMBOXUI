import { BarChart3, CheckCircle2, ExternalLink, KeyRound, Package, Sparkles } from "lucide-react";
import { graphyConfig, isGraphyConfigured } from "../../config/graphy";

const setupSteps = [
  "Create a local .npmrc from .npmrc.example and provide a valid Graphy NPM token.",
  "Install the private SDK package with npm install @graphysdk/core.",
  "Enable Graphy in .env by setting VITE_GRAPHY_ENABLED=true.",
  "Set VITE_GRAPHY_WORKSPACE_ID to the workspace or tenant value provided by Graphy.",
] as const;

export function GraphySetupCard() {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white shadow-xl shadow-slate-950/10">
      <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Graphy</p>
              <h2 className="text-2xl">Charting SDK integration</h2>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-slate-200">
            HUB is now wired for Graphy configuration inside the Data Explorer. The remaining dependency step is
            credentialed package access because the official SDK is private.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
              {isGraphyConfigured ? <CheckCircle2 className="h-3.5 w-3.5" /> : <KeyRound className="h-3.5 w-3.5" />}
              {isGraphyConfigured ? "Env configured" : "Token and package install pending"}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              <Package className="h-3.5 w-3.5" />
              {graphyConfig.packageName}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              <Sparkles className="h-3.5 w-3.5" />
              Default graph: {graphyConfig.defaultGraphType}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-sm text-slate-100">Setup checklist</h3>
            <a
              href={graphyConfig.docsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-300 transition-colors hover:text-white"
            >
              Official docs
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="space-y-3">
            {setupSteps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-xl border border-white/8 bg-slate-950/30 px-3 py-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs text-slate-200">
                  {index + 1}
                </div>
                <p className="text-sm leading-5 text-slate-200">{step}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-3 text-xs leading-5 text-amber-100">
            Unauthenticated install currently returns a registry 404 for <code>@graphysdk/core</code>, which matches
            Graphy&apos;s private package distribution model.
          </div>
        </div>
      </div>
    </section>
  );
}
