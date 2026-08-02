import type { ReactNode } from "react";
import { Loader2, ToggleLeft, ToggleRight } from "lucide-react";
import { translations } from "@/lib/translations";
import type { SchoolModule } from "../types";

interface SchoolModulesTabProps {
  modules: SchoolModule[];
  loading: boolean;
  error: string | null;
  canManage: boolean;
  t: typeof translations.es;
  onToggle: (moduleName: string, currentActive: boolean) => void;
}

export default function SchoolModulesTab({ modules, loading, error, canManage, t, onToggle }: SchoolModulesTabProps) {
  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1"><h3 className="text-lg font-bold">{t.schools.modules.title}</h3><p className="text-xs text-[var(--text-secondary)]">{t.schools.modules.subtitle}</p></div>
      {loading ? <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" /></div> : error ? <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{error}</div> : (
        <div className="glass-panel overflow-hidden border border-[var(--border-glass)]"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-[var(--border-glass)] bg-white/[0.01]"><Header>{t.schools.modules.colName}</Header><Header className="w-[120px]">{t.schools.modules.colType}</Header><Header className="w-[150px] text-right">{t.schools.modules.colStatus}</Header></tr></thead><tbody className="divide-y divide-white/5">{modules.map((module) => <ModuleRow key={module.module} module={module} canManage={canManage} t={t} onToggle={onToggle} />)}</tbody></table></div>
      )}
    </div>
  );
}

function Header({ children, className = "" }: { children: ReactNode; className?: string }) { return <th className={`p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider ${className}`}>{children}</th>; }
function ModuleRow({ module, canManage, t, onToggle }: { module: SchoolModule; canManage: boolean; t: typeof translations.es; onToggle: SchoolModulesTabProps["onToggle"] }) {
  const sidebarKey = (module.module === "schoolYears" ? "schoolYears" : module.module === "gradesCatalog" ? "gradesCatalog" : module.module.toLowerCase()) as keyof typeof t.sidebar;
  const toggle = module.active ? <ToggleRight size={32} className="text-[var(--accent-success)]" /> : <ToggleLeft size={32} className="text-[var(--text-muted)]" />;
  return <tr className="hover:bg-white/[0.01]"><td className="p-3"><span className="font-semibold text-sm capitalize">{t.sidebar[sidebarKey] || module.module}</span></td><td className="p-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${module.isCore ? "bg-purple-500/15 border-purple-500/30 text-purple-300" : "bg-cyan-500/15 border-cyan-500/30 text-cyan-300"}`}>{module.isCore ? t.schools.modules.core : t.schools.modules.optional}</span></td><td className="p-3"><div className="flex justify-end items-center">{module.isCore ? <span className="text-xs text-[var(--text-muted)] italic">{t.schools.modules.coreActive}</span> : canManage ? <button onClick={() => onToggle(module.module, module.active)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">{toggle}</button> : <div className="text-[var(--text-secondary)] opacity-50 cursor-not-allowed" title="Solo el Super Admin puede modificar módulos">{toggle}</div>}</div></td></tr>;
}
