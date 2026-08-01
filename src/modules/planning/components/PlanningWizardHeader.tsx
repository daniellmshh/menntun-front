import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function PlanningWizardHeader({ error }: { error: string | null }) {
  return <><div className="mb-6 flex items-center gap-3"><Link href="/planning" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"><ArrowLeft size={16} />Regresar a Planeaciones</Link></div><div className="mb-8"><h1 className="text-3xl font-bold gradient-text mb-2">Nueva Planeación</h1><p className="text-[var(--text-secondary)]">Formato NEM — Matriz Multidimensional e Integradora</p></div>{error && <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/30 text-[var(--accent-danger)]"><AlertCircle size={18} className="shrink-0 mt-0.5" /><p className="text-sm">{error}</p></div>}</>;
}
