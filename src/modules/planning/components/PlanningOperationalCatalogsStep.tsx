"use client";

import { Check } from "lucide-react";
import { sanitizeInput } from "@/lib/utils";
import { PlanningCatalogo } from "@/modules/planning/types";

interface PlanningOperationalCatalogsStepProps {
  catalogo: PlanningCatalogo;
  problematica: string;
  problematicaCustom: string;
  proposito: string;
  instrSeleccionados: string[];
  ajustesTexto: string;
  pmcTexto: string;
  onProblematicaChange: (value: string) => void;
  onProblematicaCustomChange: (value: string) => void;
  onPropositoChange: (value: string) => void;
  onToggleInstrumento: (value: string) => void;
  onAjustesChange: (value: string) => void;
  onPmcChange: (value: string) => void;
}

export default function PlanningOperationalCatalogsStep(props: PlanningOperationalCatalogsStepProps) {
  const { catalogo, problematica, problematicaCustom, proposito, instrSeleccionados, ajustesTexto, pmcTexto, onProblematicaChange, onProblematicaCustomChange, onPropositoChange, onToggleInstrumento, onAjustesChange, onPmcChange } = props;
  return (
        <div className="space-y-6">
          {/* Problemática */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Problemática del Diagnóstico <span className="text-[var(--accent-danger)]">*</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              La situación del contexto comunitario o escolar que motiva el proyecto.
            </p>
            <div className="space-y-2 mb-3">
              {catalogo.catalogosOperativos.problematicas.map((prob) => (
                <button
                  key={prob}
                  onClick={() => { onProblematicaChange(prob); }}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                    problematica === prob
                      ? "bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40 text-[var(--text-primary)]"
                      : "border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/30"
                  }`}
                >
                  {problematica === prob && <Check size={14} className="inline mr-2 text-[var(--accent-primary)]" />}
                  {prob}
                </button>
              ))}
              <button
                onClick={() => onProblematicaChange("__custom__")}
                className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                  problematica === "__custom__"
                    ? "bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40 text-[var(--text-primary)]"
                    : "border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/30"
                }`}
              >
                ✏️ Escribir una problemática personalizada...
              </button>
            </div>
            {problematica === "__custom__" && (
              <textarea
                value={problematicaCustom}
                onChange={(e) => onProblematicaCustomChange(sanitizeInput(e.target.value, true))}
                placeholder="Describe la problemática de tu diagnóstico..."
                rows={3}
                className="glass-input w-full"
              />
            )}
          </div>

          {/* Propósito */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              Propósito / Justificación <span className="text-[var(--accent-danger)]">*</span>
            </h2>
            <textarea
              value={proposito}
              onChange={(e) => onPropositoChange(sanitizeInput(e.target.value, true))}
              placeholder="Describe el propósito formativo del proyecto, centrado en los aprendizajes de los alumnos..."
              rows={4}
              className="glass-input w-full"
            />
          </div>

          {/* Instrumento evaluación */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              Instrumento de Evaluación
            </h2>
            <div className="flex flex-wrap gap-2">
              {catalogo.catalogosOperativos.instrumentosEvaluacion.map((instr) => {
                const sel = instrSeleccionados.includes(instr);
                return (
                  <button
                    key={instr}
                    onClick={() => onToggleInstrumento(instr)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      sel
                        ? "bg-[var(--accent-success)]/20 border-[var(--accent-success)]/40 text-[var(--accent-success)]"
                        : "border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-success)]/30"
                    }`}
                  >
                    {sel && <Check size={12} className="inline mr-1.5" />}
                    {instr}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ajustes razonables */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              Ajustes Razonables
            </h2>
            <textarea
              className="glass-input w-full h-24 resize-none"
              placeholder="Ej. Reducir el nivel de ruido, ubicar a estudiantes cerca del docente..."
              value={ajustesTexto}
              onChange={(e) => onAjustesChange(sanitizeInput(e.target.value, false))}
            />
          </div>

          {/* Actividades PMC */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              Actividades PMC (Opcional)
            </h2>
            <textarea
              className="glass-input w-full h-24 resize-none"
              placeholder="Ej. Convivencia escolar, visita a la biblioteca..."
              value={pmcTexto}
              onChange={(e) => onPmcChange(sanitizeInput(e.target.value, false))}
            />
          </div>
        </div>
  );
}

