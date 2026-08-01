import { Info } from "lucide-react";
import { CampoSeleccionado, PlanningCatalogo, PlanningModalidad } from "@/modules/planning/types";
import { PlanningModalidadLabels } from "@/modules/planning/constants";

const campoBadge: Record<string, string> = {
  LENGUAJES: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  SABERES_PENSAMIENTO_CIENTIFICO: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  ETICA_NATURALEZA_SOCIEDADES: "bg-emerald-500/20 border-emerald-500/40 text-emerald-300",
  HUMANO_COMUNITARIO: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

interface PlanningReviewStepProps {
  catalogo: PlanningCatalogo;
  startDate: string;
  endDate: string;
  activitiesPerDay: number;
  modalidad: PlanningModalidad;
  isStandalone: boolean;
  instrSeleccionados: string[];
  ajustesTexto: string;
  pmcTexto: string;
  camposSeleccionados: CampoSeleccionado[];
  ejesSeleccionados: string[];
  problematica: string;
  problematicaCustom: string;
  proposito: string;
}

export default function PlanningReviewStep(props: PlanningReviewStepProps) {
  const { catalogo, startDate, endDate, activitiesPerDay, modalidad, isStandalone, instrSeleccionados, ajustesTexto, pmcTexto, camposSeleccionados, ejesSeleccionados, problematica, problematicaCustom, proposito } = props;
  const getCampoInfo = (campoId: string) => catalogo.camposFormativos.find((campo) => campo.id === campoId);
  const getContenidoName = (campoId: string, contenidoId: string) => getCampoInfo(campoId)?.contenidos.find((contenido) => contenido.id === contenidoId)?.nombre || contenidoId;
  return (
        <div className="space-y-6">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold gradient-text mb-6">Resumen de la Planeación</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identificación */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Identificación</p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-[var(--text-secondary)] w-24 shrink-0">Periodo:</span>
                    <span className="text-[var(--text-primary)]">Del {startDate || "—"} al {endDate || "—"} ({activitiesPerDay} acts/día)</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[var(--text-secondary)] w-24 shrink-0">Metodología:</span>
                    <span className="text-[var(--text-primary)]">{PlanningModalidadLabels[modalidad]}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[var(--text-secondary)] w-24 shrink-0">Modo:</span>
                    <span className="text-[var(--text-primary)]">{isStandalone ? "Independiente" : "Integrado con grupo"}</span>
                  </div>
                </div>
              </div>

              {/* Catálogos */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">Catálogos</p>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-[var(--text-secondary)] w-28 shrink-0">Instrumento:</span>
                    <span className="text-[var(--text-primary)]">{instrSeleccionados.length > 0 ? instrSeleccionados.join(", ") : "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[var(--text-secondary)] w-28 shrink-0">Ajustes:</span>
                    <span className="text-[var(--text-primary)]">{ajustesTexto.trim() ? "Agregados" : "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[var(--text-secondary)] w-28 shrink-0">PMC:</span>
                    <span className="text-[var(--text-primary)]">{pmcTexto.trim() ? "Agregadas" : "—"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fundamentación */}
            <div className="mt-6">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Fundamentación Curricular ({camposSeleccionados.length} campo{camposSeleccionados.length !== 1 ? "s" : ""})
              </p>
              <div className="space-y-2">
                {camposSeleccionados.map((sel, idx) => {
                  const badge = campoBadge[sel.campoFormativoId] || "";
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border-glass)]">
                      <span className={`px-2 py-0.5 rounded-full text-xs border shrink-0 ${badge}`}>
                        {getCampoInfo(sel.campoFormativoId)?.nombre}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)] line-clamp-2">
                        {getContenidoName(sel.campoFormativoId, sel.contenidoId)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ejes */}
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Ejes Articuladores</p>
              <div className="flex flex-wrap gap-2">
                {ejesSeleccionados.map((eje) => (
                  <span key={eje} className="px-3 py-1 rounded-full text-xs border border-[var(--accent-secondary)]/30 text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10">
                    {eje}
                  </span>
                ))}
              </div>
            </div>

            {/* Problemática y Propósito */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Problemática</p>
                <p className="text-sm text-[var(--text-secondary)]">
                  {problematica === "__custom__" ? problematicaCustom : problematica}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Propósito</p>
                <p className="text-sm text-[var(--text-secondary)]">{proposito}</p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
            <Info size={18} className="text-[var(--accent-primary)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--text-secondary)]">
              La IA generará la <strong className="text-[var(--text-primary)]">Matriz Didáctica completa</strong> con las actividades, campo y PDA, organización, recursos y evaluación formativa para cada momento de la metodología <strong className="text-[var(--text-primary)]">{PlanningModalidadLabels[modalidad]}</strong>.
              Los PDAs serán copiados exactamente del catálogo oficial de la SEP.
            </p>
          </div>
        </div>
  );
}

