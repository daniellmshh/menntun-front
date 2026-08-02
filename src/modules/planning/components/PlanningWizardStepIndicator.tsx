import { Check } from "lucide-react";

const stepLabels = ["Identificación", "Curricular", "Catálogos", "Revisar"];

export default function PlanningWizardStepIndicator({ step }: { step: number }) {
  return <div className="mb-8"><div className="flex items-center gap-2">{stepLabels.map((label, index) => <div key={label} className="contents"><div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${index === step ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40" : index < step ? "bg-[var(--accent-success)]/20 text-[var(--accent-success)] border border-[var(--accent-success)]/30" : "text-[var(--text-muted)] border border-[var(--border-glass)]"}`}>{index < step ? <Check size={14} /> : <span className="w-4 text-center">{index + 1}</span>}<span className="hidden sm:inline">{label}</span></div>{index < stepLabels.length - 1 && <div className={`flex-1 h-px ${index < step ? "bg-[var(--accent-success)]/30" : "bg-[var(--border-glass)]"}`} />}</div>)}</div></div>;
}
