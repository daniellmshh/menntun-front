"use client";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface PlanningWizardNavigationProps { step: number; canProceed: boolean; generating: boolean; onPrevious: () => void; onNext: () => void; onGenerate: () => void; }

export default function PlanningWizardNavigation({ step, canProceed, generating, onPrevious, onNext, onGenerate }: PlanningWizardNavigationProps) {
  return <div className="flex items-center justify-between mt-8"><button onClick={onPrevious} disabled={step === 0} className="glass-button-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"><ChevronLeft size={16} />Anterior</button>{step < 3 ? <button onClick={onNext} disabled={!canProceed} className="glass-button flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">Siguiente<ChevronRight size={16} /></button> : <button onClick={onGenerate} disabled={generating} className="glass-button flex items-center gap-2 disabled:opacity-60"><Sparkles size={16} />Generar Planeación</button>}</div>;
}
