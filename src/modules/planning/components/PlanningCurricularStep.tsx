"use client";

import { BookOpen, Check, Layers, Plus, X } from "lucide-react";
import { CampoSeleccionado, PlanningCatalogo } from "@/modules/planning/types";

const campoColors: Record<string, string> = {
  LENGUAJES: "from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-300",
  SABERES_PENSAMIENTO_CIENTIFICO: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-300",
  ETICA_NATURALEZA_SOCIEDADES: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-300",
  HUMANO_COMUNITARIO: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300",
};

interface GroupOption { id: string; grade?: { order?: number } | null; }
interface PlanningCurricularStepProps {
  catalogo: PlanningCatalogo;
  groups: GroupOption[];
  isStandalone: boolean;
  standaloneGradeOrder: number;
  selectedGroupId: string;
  camposSeleccionados: CampoSeleccionado[];
  ejesSeleccionados: string[];
  addingCampoId: string;
  addingContenidoId: string;
  addingPdaLiteral: string;
  onCampoChange: (value: string) => void;
  onContenidoChange: (value: string) => void;
  onPdaChange: (value: string) => void;
  onAddCampo: () => void;
  onRemoveCampo: (index: number) => void;
  onToggleEje: (eje: string) => void;
}

export default function PlanningCurricularStep(props: PlanningCurricularStepProps) {
  const { catalogo, groups, isStandalone, standaloneGradeOrder, selectedGroupId, camposSeleccionados, ejesSeleccionados, addingCampoId, addingContenidoId, addingPdaLiteral, onCampoChange, onContenidoChange, onPdaChange, onAddCampo, onRemoveCampo, onToggleEje } = props;
  const getCampoInfo = (campoId: string) => catalogo.camposFormativos.find((campo) => campo.id === campoId);
  return (
        <div className="space-y-6">
          {/* Agregar campo + contenido */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <BookOpen size={20} className="text-[var(--accent-primary)]" />
              Campos Formativos y Contenidos
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              Selecciona uno o más campos formativos con sus contenidos (plan globalizador e integrador).
            </p>

            {/* Add row */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={addingCampoId}
                  onChange={(e) => { onCampoChange(e.target.value); }}
                  className="glass-input flex-1"
                >
                  <option value="">— Seleccionar Campo Formativo —</option>
                  {catalogo.camposFormativos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                <select
                  value={addingContenidoId}
                  onChange={(e) => { onContenidoChange(e.target.value); }}
                  className="glass-input flex-1"
                  disabled={!addingCampoId}
                >
                  <option value="">— Seleccionar Contenido —</option>
                  {catalogo.camposFormativos
                    .find((c) => c.id === addingCampoId)
                    ?.contenidos.map((ct) => (
                      <option key={ct.id} value={ct.id}>{ct.nombre}</option>
                    ))}
                </select>
              </div>

              {addingContenidoId && (
                <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]">
                  <p className="text-sm font-semibold mb-3 text-[var(--text-primary)]">Selecciona el PDA que deseas trabajar:</p>
                  <div className="space-y-2">
                    {(() => {
                      const currentGradeOrder = isStandalone
                        ? standaloneGradeOrder
                        : groups.find((g) => g.id === selectedGroupId)?.grade?.order || 1;
                      const pdaKey = `grado_${currentGradeOrder}`;
                      const pdaObj = catalogo.camposFormativos
                        .find((c) => c.id === addingCampoId)
                        ?.contenidos.find((ct) => ct.id === addingContenidoId)?.pda;
                      
                      const pdaVal = pdaObj?.[pdaKey] || pdaObj?.["grado_1"] || "";
                      const pdaList = Array.isArray(pdaVal) ? pdaVal : (pdaVal ? [pdaVal] : []);

                      if (pdaList.length === 0) return <p className="text-sm text-[var(--text-muted)]">No hay PDA disponible para este grado.</p>;

                      return pdaList.map((pdaText, idx) => (
                        <label key={idx} className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-panel)] transition-colors mb-2">
                          <input 
                            type="radio" 
                            name="pda_selection"
                            className="mt-1 flex-shrink-0"
                            checked={addingPdaLiteral === pdaText}
                            onChange={() => onPdaChange(pdaText)}
                          />
                          <span className="text-sm text-[var(--text-secondary)] italic leading-relaxed">{pdaText}</span>
                        </label>
                      ));
                    })()}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={onAddCampo}
                  disabled={!addingCampoId || !addingContenidoId || !addingPdaLiteral}
                  className="glass-button px-4 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus size={16} />
                  Agregar
                </button>
              </div>
            </div>

            {/* Selected campos */}
            {camposSeleccionados.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-muted)] text-sm border border-dashed border-[var(--border-glass)] rounded-xl">
                Agrega al menos un Campo Formativo + Contenido + PDA
              </div>
            ) : (
              <div className="space-y-3">
                {camposSeleccionados.map((sel, idx) => {
                  const campo = getCampoInfo(sel.campoFormativoId);
                  const contenido = campo?.contenidos.find((c) => c.id === sel.contenidoId);
                  const colorClass = campoColors[sel.campoFormativoId] || "";
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-4 rounded-xl border bg-gradient-to-r ${colorClass}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">
                          {campo?.nombre}
                        </p>
                        <p className="text-sm font-semibold text-[var(--text-primary)] leading-relaxed mb-1">
                          {contenido?.nombre}
                        </p>
                        <p className="text-xs italic text-[var(--text-primary)] opacity-90 leading-relaxed">
                          PDA: {sel.pdaLiteral}
                        </p>
                      </div>
                      <button
                        onClick={() => onRemoveCampo(idx)}
                        className="shrink-0 p-1.5 rounded-lg hover:bg-[var(--accent-danger)]/20 text-[var(--text-secondary)] hover:text-[var(--accent-danger)] transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ejes articuladores */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <Layers size={20} className="text-[var(--accent-secondary)]" />
              Ejes Articuladores <span className="text-[var(--accent-danger)]">*</span>
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Selecciona los ejes que transversalizan esta planeación.
            </p>
            <div className="flex flex-wrap gap-2">
              {catalogo.ejesArticuladores.map((eje) => {
                const isSelected = ejesSeleccionados.includes(eje);
                return (
                  <button
                    key={eje}
                    onClick={() => onToggleEje(eje)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      isSelected
                        ? "bg-[var(--accent-secondary)]/20 border-[var(--accent-secondary)]/50 text-[var(--accent-secondary)]"
                        : "border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-secondary)]/30"
                    }`}
                  >
                    {isSelected && <Check size={12} className="inline mr-1.5" />}
                    {eje}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
  );
}

