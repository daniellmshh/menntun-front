"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Layers,
  BookOpen,
  Check,
  Edit2,
  Save,
  X,
  Trash2,
  Printer,
  Plus,
  RefreshCw,
  GraduationCap,
  Target,
  Users,
  Wrench,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Badge,
} from "lucide-react";
import {
  getPlanningById,
  updatePlanning,
  deletePlanning,
  exportPlanningHtml,
} from "@/modules/planning/services/planning.service";
import {
  Planning,
  PlanningStatus,
  FundamentacionItem,
  MatrizMomento,
  MatrizFila,
} from "@/modules/planning/types";
import { PlanningModalidadLabels } from "@/modules/planning/constants";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import { sanitizeInput } from "@/lib/utils";

// ─── Colors ───────────────────────────────────────────────────────────────────

const CAMPO_BADGE: Record<string, string> = {
  LENGUAJES: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  SABERES_PENSAMIENTO_CIENTIFICO: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  ETICA_NATURALEZA_SOCIEDADES: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  HUMANO_COMUNITARIO: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

const MOMENTO_COLORS = [
  "border-l-violet-500",
  "border-l-cyan-500",
  "border-l-emerald-500",
  "border-l-amber-500",
  "border-l-rose-500",
  "border-l-sky-500",
];

const EJES_LABELS: Record<string, string> = {
  INCLUSION: "Inclusión",
  PENSAMIENTO_CRITICO: "Pensamiento Crítico",
  INTERCULTURALIDAD_CRITICA: "Interculturalidad Crítica",
  IGUALDAD_GENERO: "Igualdad de Género",
  VIDA_SALUDABLE: "Vida Saludable",
  APROPIACION_TECNOLOGIA: "Apropiación de las culturas a través de la lectura y la escritura",
  ARTE_CULTURA: "Artes y experiencias estéticas",
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: PlanningStatus }) => {
  const map: Record<PlanningStatus, { label: string; class: string }> = {
    DRAFT: { label: "Borrador", class: "bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-glass)]" },
    SUBMITTED: { label: "Enviada", class: "bg-[var(--accent-warning)]/20 text-[var(--accent-warning)] border-[var(--accent-warning)]/30" },
    APPROVED: { label: "Aprobada", class: "bg-[var(--accent-success)]/20 text-[var(--accent-success)] border-[var(--accent-success)]/30" },
    REJECTED: { label: "Rechazada", class: "bg-[var(--accent-danger)]/20 text-[var(--accent-danger)] border-[var(--accent-danger)]/30" },
  };
  const s = map[status] || map.DRAFT;
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${s.class}`}>
      {s.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

function PlanningDetailContent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language];

  const [planning, setPlanning] = useState<Planning | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [collapsedMomentos, setCollapsedMomentos] = useState<Record<number, boolean>>({});

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPeriodo, setEditPeriodo] = useState("");
  const [editProblematica, setEditProblematica] = useState("");
  const [editProposito, setEditProposito] = useState("");
  const [editInstrumentos, setEditInstrumentos] = useState(""); 
  const [editPmc, setEditPmc] = useState(""); 
  const [editAjustes, setEditAjustes] = useState("");
  const [editMatriz, setEditMatriz] = useState<MatrizMomento[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPlanningById(id);
        if (res.data) setPlanning(res.data);
        else setError("No se encontró la planeación.");
      } catch {
        setError("Error al cargar la planeación.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleEdit = () => {
    if (!planning) return;
    setEditTitle(planning.title || "");
    setEditPeriodo(planning.periodoProyecto || "");
    setEditProblematica(planning.problematica || "");
    setEditProposito(planning.proposito || "");
    setEditInstrumentos((planning.instrumentoEvaluacion || []).join(", "));
    setEditPmc((planning.actividadesPmc || []).join("\n"));
    setEditAjustes((planning.ajustesRazonables || []).join("\n"));
    setEditMatriz(planning.matrizDidactica ? JSON.parse(JSON.stringify(planning.matrizDidactica)) : []);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!planning) return;
    setSaving(true);
    try {
      const dto = {
        title: editTitle,
        periodoProyecto: editPeriodo,
        problematica: editProblematica,
        proposito: editProposito,
        instrumentoEvaluacion: editInstrumentos.split(",").map(s => s.trim()).filter(s => s),
        actividadesPmc: editPmc.split("\n").map(s => s.trim()).filter(s => s),
        ajustesRazonables: editAjustes.split("\n").map(s => s.trim()).filter(s => s),
        matrizDidactica: editMatriz,
      };
      const res = await updatePlanning(id, dto);
      if (res.data) {
        setPlanning(res.data);
        setMessage("Planeación actualizada correctamente.");
        setIsEditing(false);
      }
    } catch {
      setError("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  const handleMatrizChange = (mIdx: number, fIdx: number, field: string, value: string) => {
    const sanitizedValue = sanitizeInput(value, false);
    setEditMatriz(prev => {
      const nw = [...prev];
      nw[mIdx].filas[fIdx] = { ...nw[mIdx].filas[fIdx], [field]: sanitizedValue };
      return nw;
    });
  };

  const handleAddFila = (mIdx: number) => {
    setEditMatriz(prev => {
      const nw = [...prev];
      nw[mIdx].filas.push({ actividades: "", campo_pda: "", organizacion: "", recursos: "", evaluacion: "" });
      return nw;
    });
  };

  const handleRemoveFila = (mIdx: number, fIdx: number) => {
    setEditMatriz(prev => {
      const nw = [...prev];
      nw[mIdx].filas.splice(fIdx, 1);
      return nw;
    });
  };

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await deletePlanning(id);
      router.push("/planning");
    } catch {
      setError("No se pudo eliminar la planeación.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await updatePlanning(id, { status: PlanningStatus.SUBMITTED });
      if (res.data) { setPlanning(res.data); setMessage("Planeación enviada para revisión."); }
    } catch {
      setError("Error al enviar la planeación.");
      setSaving(false);
    }
  };

  const [exporting, setExporting] = useState(false);
  const handleExportHtml = async () => {
    setExporting(true);
    try {
      const htmlStr = await exportPlanningHtml(id);
      
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlStr);
        doc.close();
      }

      // Cleanup iframe after a while
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 60000);
    } catch {
      setError("Error al exportar la planeación.");
    } finally {
      setExporting(false);
    }
  };

  const toggleMomento = (idx: number) =>
    setCollapsedMomentos((prev) => ({ ...prev, [idx]: !prev[idx] }));

  if (loading) return <Loader />;
  if (error && !planning) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <AlertCircle size={48} className="text-[var(--accent-danger)]" />
      <p className="text-[var(--text-secondary)]">{error}</p>
      <Link href="/planning" className="glass-button">Regresar</Link>
    </div>
  );
  if (!planning) return null;

  const matrizDidactica: MatrizMomento[] = planning.matrizDidactica as MatrizMomento[] || [];
  const fundamentacion: FundamentacionItem[] = planning.fundamentacion as FundamentacionItem[] || [];
  const hasNewFormat = matrizDidactica.length > 0;

  const teacherName = planning.teacherProfile
    ? `${planning.teacherProfile.user.firstName} ${planning.teacherProfile.user.lastName}`
    : "—";

  const groupLabel = planning.group
    ? `${planning.group.grade?.name} — ${planning.group.name} ${planning.group.section || ""}`
    : planning.standaloneLevel
    ? `${planning.standaloneLevel} ${planning.standaloneGradeOrder}°`
    : "—";

  // Helpers for text rendering
  const renderActividades = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return (
      <div className="space-y-1.5">
        {lines.map((line, i) => {
          if (line.startsWith('-')) {
            return (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[var(--text-muted)] print:text-gray-500 mt-0.5">•</span>
                <span dangerouslySetInnerHTML={{ __html: line.replace(/^- /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
              </div>
            );
          }
          return <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />;
        })}
      </div>
    );
  };

  const renderCampoPda = (text: string) => {
    if (!text) return null;
    // Highlight "CAMPO: X"
    const blocks = text.split('\n\n').filter(b => b.trim());
    return (
      <div className="space-y-4">
        {blocks.map((block, i) => {
          const lines = block.split('\n').filter(l => l.trim());
          return (
            <div key={i} className="space-y-1.5">
              {lines.map((line, j) => {
                if (line.startsWith('CAMPO:')) {
                  const campoName = line.replace('CAMPO:', '').trim();
                  // Try to map to our known fields for colors, or just a default pinkish highlight
                  let bgClass = "bg-pink-100 text-pink-800 border-pink-200 print:bg-pink-100 print:text-pink-800";
                  if (campoName.toLowerCase().includes("científico")) {
                    bgClass = "bg-green-100 text-green-800 border-green-200 print:bg-green-100 print:text-green-800";
                  } else if (campoName.toLowerCase().includes("ética") || campoName.toLowerCase().includes("naturaleza")) {
                    bgClass = "bg-yellow-100 text-yellow-800 border-yellow-200 print:bg-yellow-100 print:text-yellow-800";
                  } else if (campoName.toLowerCase().includes("lenguaje")) {
                    bgClass = "bg-blue-100 text-blue-800 border-blue-200 print:bg-blue-100 print:text-blue-800";
                  }
                  return (
                    <div key={j} className="mb-2">
                      <span className={`px-2 py-0.5 text-[11px] font-bold rounded border ${bgClass}`}>
                        CAMPO: {campoName}
                      </span>
                    </div>
                  );
                } else if (line.startsWith('PDA:')) {
                  return <p key={j} className="italic text-[11px] text-[var(--accent-primary)] print:text-gray-600">{line}</p>;
                } else if (line.startsWith('CONTENIDO:')) {
                  return <p key={j} className="font-medium text-[11px] text-[var(--text-primary)] print:text-gray-800">{line}</p>;
                }
                return <p key={j} className="text-[11px]">{line}</p>;
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/planning"
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Planeaciones
          </Link>
        </div>
        <div className="flex items-center gap-3 print:hidden">
          {isEditing ? (
            <>
              <button onClick={handleCancelEdit} disabled={saving} className="glass-button-secondary flex items-center gap-2 text-sm">
                <X size={16} /> Cancelar
              </button>
              <button onClick={handleSaveEdit} disabled={saving} className="glass-button flex items-center gap-2 text-sm bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)]">
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />} 
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </>
          ) : (
            <>
              <StatusBadge status={planning.status} />
              <button
                onClick={handleEdit}
                className="glass-button-secondary flex items-center gap-2 text-sm"
              >
                <Edit2 size={16} /> Editar
              </button>
          <button
            onClick={handleExportHtml}
            disabled={exporting}
            className="glass-button-secondary flex items-center gap-2 text-sm"
          >
            <Printer size={16} />
            {exporting ? "Generando..." : "Exportar / Imprimir"}
          </button>
          {planning.status === PlanningStatus.DRAFT && (
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="glass-button flex items-center gap-2 text-sm"
            >
              <Check size={16} />
              {saving ? "Enviando..." : "Enviar para revisión"}
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-all ${
              confirmDelete
                ? "bg-[var(--accent-danger)]/20 border-[var(--accent-danger)]/40 text-[var(--accent-danger)]"
                : "border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-[var(--accent-danger)] hover:border-[var(--accent-danger)]/30"
            }`}
          >
            <Trash2 size={16} />
            {confirmDelete ? "¿Confirmar?" : "Eliminar"}
          </button>
            </>
          )}
        </div>
      </div>

      {/* Error/Message banners */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/30 text-[var(--accent-danger)] text-sm flex gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}
      {message && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--accent-success)]/10 border border-[var(--accent-success)]/30 text-[var(--accent-success)] text-sm">
          {message}
        </div>
      )}

      {/* ─── BLOQUE A: Ficha de Identificación ─── */}
      <div className="glass-panel p-6 mb-6 print:border print:border-gray-300 print:shadow-none print:bg-white print:rounded-none">
        <div className="flex items-center gap-2 mb-4 print:mb-3">
          <div className="w-1 h-6 bg-[var(--accent-primary)] rounded-full print:hidden" />
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--text-primary)]">PLANEACIÓN DIDÁCTICA — </span>
              <input 
                type="text" 
                value={editTitle}
                onChange={(e) => setEditTitle(sanitizeInput(e.target.value, true))}
                className="glass-input flex-1 font-bold text-lg"
              />
            </div>
          ) : (
            <h2 className="text-lg font-bold text-[var(--text-primary)] print:text-black print:text-base">
              PLANEACIÓN DIDÁCTICA — {planning.title?.toUpperCase()}
            </h2>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:gap-2">
          {[
            { label: "MAESTRA", value: teacherName },
            { label: "GRADO / GRUPO", value: groupLabel },
            { label: "PERIODO", value: planning.startDate && planning.endDate ? `Del ${new Date(planning.startDate).toISOString().split('T')[0]} al ${new Date(planning.endDate).toISOString().split('T')[0]}` : planning.periodoProyecto || "—", isEditPeriodo: true },
            { label: "MODALIDAD", value: PlanningModalidadLabels[planning.modalidad] || planning.modalidad },
            {
              label: "PROBLEMÁTICA",
              value: planning.problematica || "—",
              span: true,
              isEditProblematica: true,
            },
          ].map(({ label, value, span, isEditPeriodo, isEditProblematica }) => (
            <div
              key={label}
              className={`p-3 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-glass)] print:border-gray-200 print:bg-gray-50 print:rounded ${span ? "col-span-2 md:col-span-3" : ""}`}
            >
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 print:text-gray-500">{label}</p>
              {isEditing && isEditPeriodo ? (
                <input type="text" value={editPeriodo} onChange={e => setEditPeriodo(sanitizeInput(e.target.value, true))} className="glass-input w-full text-sm" />
              ) : isEditing && isEditProblematica ? (
                <textarea value={editProblematica} onChange={e => setEditProblematica(sanitizeInput(e.target.value, true))} className="glass-input w-full text-sm min-h-[60px]" />
              ) : (
                <p className="text-sm text-[var(--text-primary)] print:text-gray-800">{value}</p>
              )}
            </div>
          ))}
        </div>

        {/* Propósito */}
        {(planning.proposito || isEditing) && (
          <div className="mt-3 p-3 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 print:border-gray-300 print:bg-blue-50 print:rounded">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 print:text-gray-500">PROPÓSITO / JUSTIFICACIÓN</p>
            {isEditing ? (
              <textarea value={editProposito} onChange={e => setEditProposito(sanitizeInput(e.target.value, true))} className="glass-input w-full text-sm min-h-[80px]" />
            ) : (
              <p className="text-sm text-[var(--text-primary)] print:text-gray-800">{planning.proposito}</p>
            )}
          </div>
        )}

        {/* Instrumento de evaluación */}
        {((planning.instrumentoEvaluacion && planning.instrumentoEvaluacion.length > 0) || isEditing) && (
          <div className="mt-3 p-3 rounded-xl bg-[var(--bg-surface)]/50 border border-[var(--border-glass)] print:border-gray-200">
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 print:text-gray-500">INSTRUMENTO DE EVALUACIÓN</p>
            {isEditing ? (
              <input type="text" value={editInstrumentos} onChange={e => setEditInstrumentos(sanitizeInput(e.target.value, true))} className="glass-input w-full text-sm" placeholder="Ej. Rúbrica, Lista de cotejo" />
            ) : (
              <p className="text-sm text-[var(--text-primary)] print:text-gray-800">{planning.instrumentoEvaluacion?.join(", ")}</p>
            )}
          </div>
        )}
      </div>

      {/* ─── BLOQUE B: Fundamentación Curricular ─── */}
      {fundamentacion.length > 0 && (
        <div className="glass-panel p-6 mb-6 print:border print:border-gray-300 print:shadow-none print:bg-white print:rounded-none">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={18} className="text-[var(--accent-primary)] print:hidden" />
            <h2 className="text-base font-bold text-[var(--text-primary)] print:text-black">
              FUNDAMENTACIÓN CURRICULAR — Campos Formativos, Contenidos y PDAs
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse print:text-xs">
              <thead>
                <tr className="border-b border-[var(--border-glass)] print:border-gray-400">
                  <th className="text-left py-2 px-3 text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider print:text-gray-600 w-1/4">Campo Formativo</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider print:text-gray-600 w-2/5">Contenido</th>
                  <th className="text-left py-2 px-3 text-[var(--text-muted)] font-semibold uppercase text-xs tracking-wider print:text-gray-600">PDA del Grado</th>
                </tr>
              </thead>
              <tbody>
                {fundamentacion.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-[var(--border-glass)]/50 hover:bg-[var(--bg-panel)] transition-colors print:border-gray-200"
                  >
                    <td className="py-3 px-3 align-top">
                      <span className={`px-2 py-0.5 rounded-full text-xs border print:border-gray-400 print:bg-gray-100 print:text-gray-800 ${CAMPO_BADGE[item.campoFormativo] || ""}`}>
                        {item.nombreCampo}
                      </span>
                    </td>
                    <td className="py-3 px-3 align-top text-[var(--text-secondary)] print:text-gray-700 leading-relaxed">
                      {item.contenido}
                    </td>
                    <td className="py-3 px-3 align-top text-[var(--text-primary)] print:text-gray-900 leading-relaxed italic text-xs">
                      {item.pda}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Ejes articuladores */}
          {planning.ejesArticuladores && planning.ejesArticuladores.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[var(--border-glass)] print:border-gray-300">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 print:text-gray-500">EJES ARTICULADORES</p>
              <div className="flex flex-wrap gap-2">
                {planning.ejesArticuladores.map((eje) => (
                  <span
                    key={eje}
                    className="px-3 py-1 rounded-full text-xs border border-[var(--accent-secondary)]/30 text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10 print:border-gray-400 print:bg-gray-100 print:text-gray-800 print:rounded"
                  >
                    {EJES_LABELS[eje] || eje}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PMC y Ajustes */}
          {(planning.actividadesPmc?.length || planning.ajustesRazonables?.length || isEditing) ? (
            <div className="mt-4 pt-4 border-t border-[var(--border-glass)] print:border-gray-300 grid grid-cols-1 md:grid-cols-2 gap-4">
              {((planning.actividadesPmc && planning.actividadesPmc.length > 0) || isEditing) ? (
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 print:text-gray-500">ACTIVIDADES PMC</p>
                  {isEditing ? (
                    <textarea value={editPmc} onChange={e => setEditPmc(sanitizeInput(e.target.value, false))} className="glass-input w-full text-sm min-h-[100px]" placeholder="Escribe cada actividad en una nueva línea" />
                  ) : (
                    <ul className="space-y-1">
                      {planning.actividadesPmc?.map((pmc, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] print:text-gray-700 flex items-start gap-2">
                          <span className="text-[var(--accent-primary)] mt-0.5 print:text-gray-600">•</span>
                          {pmc}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
              {((planning.ajustesRazonables && planning.ajustesRazonables.length > 0) || isEditing) ? (
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 print:text-gray-500">AJUSTES RAZONABLES</p>
                  {isEditing ? (
                    <textarea value={editAjustes} onChange={e => setEditAjustes(sanitizeInput(e.target.value, false))} className="glass-input w-full text-sm min-h-[100px]" placeholder="Escribe cada ajuste en una nueva línea" />
                  ) : (
                    <ul className="space-y-1">
                      {planning.ajustesRazonables?.map((aj, i) => (
                        <li key={i} className="text-xs text-[var(--text-secondary)] print:text-gray-700 flex items-start gap-2">
                          <span className="text-[var(--accent-warning)] mt-0.5 print:text-gray-600">•</span>
                          {aj}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}

      {/* ─── BLOQUE C: Matriz Didáctica ─── */}
      {hasNewFormat && (
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <ClipboardCheck size={20} className="text-[var(--accent-primary)] print:hidden" />
            <h2 className="text-base font-bold text-[var(--text-primary)] print:text-black uppercase tracking-wide">
              Matriz Didáctica por Momentos
            </h2>
          </div>

          {matrizDidactica.map((momento, mIdx) => (
            <div
              key={mIdx}
              className={`glass-panel overflow-hidden border-l-4 ${MOMENTO_COLORS[mIdx % MOMENTO_COLORS.length]} print:border print:border-gray-300 print:shadow-none print:bg-white print:rounded-none print:border-l-4`}
            >
              {/* Momento header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--bg-panel-hover)] transition-colors print:cursor-default print:bg-gray-50"
                onClick={() => toggleMomento(mIdx)}
              >
                <h3 className="font-bold text-[var(--text-primary)] print:text-black text-sm uppercase tracking-wide">
                  {momento.momento}
                </h3>
                <div className="print:hidden">
                  {collapsedMomentos[mIdx] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </div>
              </div>

              {/* Table — always visible in print */}
              <div className={`${collapsedMomentos[mIdx] ? "hidden print:block" : ""}`}>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-xs table-fixed">
                    <thead>
                      <tr className="bg-[var(--bg-surface)]/80 print:bg-gray-100">
                        {[
                          { label: "ACTIVIDADES SUGERIDAS (Inicio, Desarrollo y Cierre)", width: "w-[35%]" },
                          { label: "CAMPO Y PDA QUE SE ABORDA", width: "w-[20%]" },
                          { label: "ORGANIZACIÓN", width: "w-[12%]" },
                          { label: "RECURSOS Y MATERIALES", width: "w-[15%]" },
                          { label: "EVALUACIÓN FORMATIVA (Indicadores)", width: "w-[18%]" },
                        ].map((col) => (
                          <th
                            key={col.label}
                            className={`${col.width} text-left py-2 px-3 text-[var(--text-muted)] font-bold uppercase tracking-wider border-b border-[var(--border-glass)] print:text-gray-600 print:border-gray-300 align-top`}
                          >
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(isEditing ? editMatriz[mIdx].filas : momento.filas).map((fila, fIdx) => (
                        <tr
                          key={fIdx}
                          className="border-b border-[var(--border-glass)]/40 hover:bg-[var(--bg-panel)] transition-colors align-top print:border-gray-200 group"
                        >
                          <td className="py-3 px-3 text-[var(--text-secondary)] print:text-gray-800 leading-relaxed text-[11px] relative">
                            {isEditing && (
                              <button onClick={() => handleRemoveFila(mIdx, fIdx)} className="absolute -left-1 top-3 p-1 rounded-md text-[var(--accent-danger)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--accent-danger)]/10" title="Eliminar fila">
                                <Trash2 size={14} />
                              </button>
                            )}
                            {isEditing ? (
                              <textarea value={fila.actividades} onChange={e => handleMatrizChange(mIdx, fIdx, "actividades", e.target.value)} className="glass-input w-full text-[11px] min-h-[120px]" />
                            ) : renderActividades(fila.actividades)}
                          </td>
                          <td className="py-3 px-3 text-[var(--text-secondary)] print:text-gray-800 leading-relaxed">
                            {isEditing ? (
                              <textarea value={fila.campo_pda} onChange={e => handleMatrizChange(mIdx, fIdx, "campo_pda", e.target.value)} className="glass-input w-full text-[11px] min-h-[120px]" />
                            ) : renderCampoPda(fila.campo_pda)}
                          </td>
                          <td className="py-3 px-3 text-center align-top">
                            {isEditing ? (
                              <input type="text" value={fila.organizacion} onChange={e => handleMatrizChange(mIdx, fIdx, "organizacion", e.target.value)} className="glass-input w-full text-center text-[10px]" />
                            ) : (
                              <span className="px-2 py-1 rounded-full text-[10px] bg-[var(--bg-surface)] border border-[var(--border-glass)] text-[var(--text-primary)] print:border-gray-300 print:text-gray-700">
                                {fila.organizacion}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[var(--text-secondary)] print:text-gray-800 leading-relaxed text-[11px]">
                            {isEditing ? (
                              <textarea value={fila.recursos} onChange={e => handleMatrizChange(mIdx, fIdx, "recursos", e.target.value)} className="glass-input w-full text-[11px] min-h-[80px]" />
                            ) : (
                              <div className="whitespace-pre-wrap">{fila.recursos}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[var(--text-secondary)] print:text-gray-800 leading-relaxed text-[11px]">
                            {isEditing ? (
                              <textarea value={fila.evaluacion} onChange={e => handleMatrizChange(mIdx, fIdx, "evaluacion", e.target.value)} className="glass-input w-full text-[11px] min-h-[80px]" />
                            ) : fila.evaluacion}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {isEditing && (
                      <tfoot>
                        <tr>
                          <td colSpan={5} className="pt-2">
                            <button onClick={() => handleAddFila(mIdx)} className="glass-button-secondary w-full flex items-center justify-center gap-2 py-2 text-xs border-dashed border-[var(--border-glass)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--accent-primary)]/50">
                              <Plus size={14} /> Agregar Actividad / Fila
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Fallback: legacy format ─── */}
      {!hasNewFormat && planning.fases && Array.isArray(planning.fases) && planning.fases.length > 0 && (
        <div className="glass-panel p-6 mb-6">
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-4 uppercase tracking-wide">
            Fases del Proyecto
          </h2>
          <div className="space-y-4">
            {planning.fases.map((fase, idx) => {
              const phase = fase && typeof fase === "object"
                ? fase as Record<string, unknown>
                : {};
              const name = typeof phase.nombre === "string" ? phase.nombre : "Fase";
              const activities =
                typeof phase.actividades === "string" ? phase.actividades : "";

              return (
                <div key={idx} className={`border-l-4 pl-4 ${MOMENTO_COLORS[idx % MOMENTO_COLORS.length]}`}>
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">{name}</h3>
                  <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{activities}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .ambient-glow, .sidebar, header { display: none !important; }
          main { margin-left: 0 !important; padding: 1rem !important; }
          .print\\:hidden { display: none !important; }
          .glass-panel { background: white !important; border: 1px solid #ddd !important; border-radius: 4px !important; box-shadow: none !important; }
          table { page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}

export default function PlanningDetailPage() {
  return (
    <ModuleGuard moduleKey="planning">
      <PlanningDetailContent />
    </ModuleGuard>
  );
}
