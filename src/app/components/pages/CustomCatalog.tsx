import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  Filter,
  Grid3x3,
  Library,
  List as ListIcon,
  Plus,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { toast } from "sonner";

type CustomCatalogItem = {
  id: string;
  name: string;
  category: string;
  owner: string;
  status: "Approved" | "Under Review" | "Draft";
  updated: string;
  description: string;
  reference: string;
};

type CustomCatalogProps = {
  title: string;
  subtitle: string;
  template: string;
  onBack: () => void;
};

function CatalogSelect({
  children,
  className = "",
  containerClassName = "",
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { containerClassName?: string }) {
  return (
    <span className={`group relative inline-flex ${containerClassName}`}>
      <select
        {...props}
        className={`h-9 w-full min-w-[132px] appearance-none rounded-xl border border-slate-200 bg-white/95 py-2 pl-3.5 pr-10 text-xs font-medium text-slate-700 shadow-sm shadow-slate-950/[0.03] outline-none transition hover:border-slate-300 hover:bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 ${className}`}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-2.5 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md bg-slate-50 text-slate-400 transition group-hover:bg-white group-hover:text-slate-600 group-focus-within:bg-blue-50 group-focus-within:text-blue-600">
        <ChevronDown className="h-3.5 w-3.5" />
      </span>
    </span>
  );
}

function CatalogProjectPicker({
  selectedProject,
  onProjectChange,
}: {
  selectedProject: string;
  onProjectChange: (project: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"my" | "shared">("my");
  const myProjects = ["Downtown Tower Complex", "Metro Station Package 4", "Riverfront Infra Works", "Airport Terminal Expansion"];
  const sharedProjects = ["Industrial Warehouse Phase 2", "Smart City Utilities", "Harbor Link Bridge"];
  const visibleProjects = tab === "my" ? myProjects : sharedProjects;

  return (
    <div className="relative inline-flex">
      <button type="button" onClick={() => setOpen((current) => !current)} className="group inline-flex h-8 items-center gap-2 rounded-xl px-1 transition hover:bg-slate-50">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-600/15">
          <Activity className="h-3.5 w-3.5" />
        </span>
        <span className="max-w-[240px] truncate text-sm font-medium text-slate-950">{selectedProject}</span>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-8 top-9 z-50 w-[318px] rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-950/15">
          <div className="mb-2 inline-flex w-full rounded-xl bg-slate-50 p-1">
            {(["my", "shared"] as const).map((key) => (
              <button key={key} type="button" onClick={() => setTab(key)} className={`h-8 flex-1 rounded-lg text-xs font-bold ${tab === key ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>
                {key === "my" ? "My Projects" : "Shared"}
              </button>
            ))}
          </div>
          <div className="max-h-[280px] overflow-y-auto py-1">
            {visibleProjects.map((project) => (
              <button
                key={project}
                type="button"
                onClick={() => {
                  onProjectChange(project);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                <span>{project}</span>
                {selectedProject === project && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function statusClass(status: CustomCatalogItem["status"]) {
  if (status === "Approved") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "Under Review") return "border-amber-100 bg-amber-50 text-amber-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

export default function CustomCatalog({ title, subtitle, template }: CustomCatalogProps) {
  const [activeTab, setActiveTab] = useState<"library" | "collection" | "approval">("library");
  const [selectedProject, setSelectedProject] = useState("Downtown Tower Complex");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [items, setItems] = useState<CustomCatalogItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<CustomCatalogItem | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    category: template,
    owner: "Admin",
    status: "Draft" as CustomCatalogItem["status"],
    description: "",
    reference: "",
  });

  const categories = ["All", ...Array.from(new Set(items.map((item) => item.category)))];
  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      const searchable = [item.name, item.category, item.owner, item.status, item.description, item.reference].join(" ").toLowerCase();
      return (filterCategory === "All" || item.category === filterCategory) && (!query || searchable.includes(query));
    });
  }, [filterCategory, items, searchQuery]);
  const approvalItems = items.filter((item) => item.status !== "Approved");

  const createItem = () => {
    const name = draft.name.trim();
    if (!name) {
      toast.error("Add item name first.");
      return;
    }
    const nextItem: CustomCatalogItem = {
      id: `CUS-${String(items.length + 1).padStart(4, "0")}`,
      name,
      category: draft.category.trim() || template,
      owner: draft.owner.trim() || "Admin",
      status: draft.status,
      description: draft.description.trim() || "Catalog item created for workspace tracking.",
      reference: draft.reference.trim() || "Manual entry",
      updated: new Date().toISOString().slice(0, 10),
    };
    setItems((current) => [nextItem, ...current]);
    setDraft({ name: "", category: template, owner: "Admin", status: "Draft", description: "", reference: "" });
    setAddOpen(false);
    toast.success("Catalog item added.");
  };

  return (
    <div className="space-y-3 font-sans pb-10">
      {addOpen && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add Catalog Item</h3>
                <p className="mt-0.5 text-xs text-slate-500">Add one item at a time to build this catalog.</p>
              </div>
              <button onClick={() => setAddOpen(false)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="space-y-4 p-5">
              <input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Item name" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} placeholder="Category" className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
                <input value={draft.owner} onChange={(event) => setDraft((current) => ({ ...current, owner: event.target.value }))} placeholder="Owner" className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
              </div>
              <select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as CustomCatalogItem["status"] }))} className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100">
                <option>Draft</option>
                <option>Under Review</option>
                <option>Approved</option>
              </select>
              <textarea value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Description / specification" rows={3} className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
              <input value={draft.reference} onChange={(event) => setDraft((current) => ({ ...current, reference: event.target.value }))} placeholder="Reference, code, document, or source" className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100" />
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setAddOpen(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={createItem} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700">Add Item</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{selectedItem.name}</h3>
                <p className="mt-0.5 text-xs text-slate-500">{selectedItem.id} · {selectedItem.category}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 hover:text-slate-600"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-4 bg-slate-50/50 p-5 md:grid-cols-[1fr_260px]">
              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</h4>
                <p className="mt-3 text-sm leading-6 text-slate-700">{selectedItem.description}</p>
              </section>
              <section className="rounded-2xl border border-slate-200 bg-white p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Details</h4>
                <div className="mt-3 space-y-3 text-sm">
                  <p><span className="text-slate-400">Owner</span><br /><b className="font-semibold text-slate-900">{selectedItem.owner}</b></p>
                  <p><span className="text-slate-400">Reference</span><br /><b className="font-semibold text-slate-900">{selectedItem.reference}</b></p>
                  <p><span className="text-slate-400">Updated</span><br /><b className="font-semibold text-slate-900">{selectedItem.updated}</b></p>
                  <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass(selectedItem.status)}`}>{selectedItem.status}</span>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-20 bg-white px-1 py-1">
        <div className="flex min-h-10 flex-wrap items-center gap-2">
          <CatalogProjectPicker selectedProject={selectedProject} onProjectChange={setSelectedProject} />
          <span className="hidden h-5 w-px bg-slate-200 lg:block" />
          <span className="mr-1 text-sm font-semibold text-slate-950">{title}</span>
          <div className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto">
            {[
              { id: "library", label: "Library", count: items.length },
              { id: "collection", label: "My Collection", count: 0 },
              { id: "approval", label: "Approval Queue", count: approvalItems.length },
            ].map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`relative flex h-8 shrink-0 items-center gap-1 px-1 text-xs font-semibold transition ${active ? "text-blue-700" : "text-slate-400 hover:text-slate-700"}`}>
                  {tab.label}
                  <span className="text-[9px] text-slate-400">{tab.count}</span>
                  {active && <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-blue-600" />}
                </button>
              );
            })}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search..." className="h-8 w-48 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-2 text-xs outline-none transition focus:border-blue-400 focus:bg-white xl:w-60" />
            </div>
            <button className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50" aria-label="Filters">
              <Filter className="h-3.5 w-3.5" />
            </button>
            <div className="flex h-8 items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button onClick={() => setViewMode("list")} className={`rounded-lg p-1.5 transition ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><ListIcon className="h-3.5 w-3.5" /></button>
              <button onClick={() => setViewMode("grid")} className={`rounded-lg p-1.5 transition ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}><Grid3x3 className="h-3.5 w-3.5" /></button>
            </div>
            <button onClick={() => setAddOpen(true)} className="flex h-8 items-center gap-1.5 rounded-xl bg-blue-600 px-3 text-xs font-bold text-white shadow-sm shadow-blue-600/15 transition hover:bg-blue-700">
              <Plus className="h-3.5 w-3.5" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {activeTab === "library" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <CatalogSelect value={filterCategory} onChange={(event) => setFilterCategory(event.target.value)}>
              {categories.map((category) => <option key={category}>{category}</option>)}
            </CatalogSelect>
            <span className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">{template}</span>
            <span className="ml-auto text-xs text-slate-500">{subtitle}</span>
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-blue-100 bg-blue-50">
                <Library className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="mb-1 text-lg font-bold text-slate-900">Start this catalog from scratch</h3>
              <p className="mx-auto max-w-md text-sm text-slate-500">Add catalog entries one by one. Each item will appear in this library with details, owner, status, and reference metadata.</p>
              <button onClick={() => setAddOpen(true)} className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-blue-600/15 hover:bg-blue-700">Add first item</button>
            </div>
          ) : viewMode === "list" ? (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full min-w-[920px] border-collapse text-left whitespace-nowrap">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <tr><th className="px-4 py-3">Item Details</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Owner</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
                </thead>
                <tbody className="text-sm">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="group border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/30">
                      <td className="cursor-pointer px-4 py-3" onClick={() => setSelectedItem(item)}><p className="font-bold text-slate-900 group-hover:text-blue-700">{item.name}</p><p className="mt-0.5 font-mono text-[11px] text-slate-400">{item.id} · {item.reference}</p></td>
                      <td className="px-4 py-3 text-slate-600">{item.category}</td>
                      <td className="px-4 py-3 text-slate-600">{item.owner}</td>
                      <td className="px-4 py-3 text-slate-500">{item.updated}</td>
                      <td className="px-4 py-3"><span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClass(item.status)}`}>{item.status}</span></td>
                      <td className="px-4 py-3 text-right"><button onClick={() => setSelectedItem(item)} className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"><Eye className="h-4 w-4" /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
              {filteredItems.map((item) => (
                <button key={item.id} onClick={() => setSelectedItem(item)} className="group rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md">
                  <p className="truncate font-mono text-[9px] text-slate-400">{item.id}</p>
                  <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-tight text-slate-900 group-hover:text-blue-700">{item.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs font-semibold text-slate-600">{item.category}</span><span className={`rounded-md border px-2 py-1 text-[10px] font-bold ${statusClass(item.status)}`}>{item.status}</span></div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "collection" && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm">
          <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-900">No saved collection yet</h3>
          <p className="mt-1 text-sm text-slate-500">Add items first, then save selected entries into a collection.</p>
        </div>
      )}

      {activeTab === "approval" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Approval Queue</h3>
          <p className="mt-1 text-sm text-slate-500">{approvalItems.length} items need review or approval.</p>
        </div>
      )}
    </div>
  );
}
