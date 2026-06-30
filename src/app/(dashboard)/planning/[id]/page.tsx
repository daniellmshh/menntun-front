"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Layers,
  BookOpen,
  Compass,
  AlertTriangle,
  Check,
  Edit2,
  Save,
  CheckCircle,
  X,
  MapPin,
  Clock,
  Wrench,
  Trash2,
  ChevronDown,
  ChevronUp,
  Printer,
} from "lucide-react";
import {
  getPlanningById,
  updatePlanning,
  deletePlanning,
} from "@/modules/planning/services/planning.service";
import { Planning, PlanningStatus, SugerenciaIA } from "@/modules/planning/types";
import {
  PlanningModalidadLabels,
  CampoFormativoLabels,
  EjeArticuladorLabels,
} from "@/modules/planning/constants";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";

export default function PlanningDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language];

  // Data states
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [editedPlanning, setEditedPlanning] = useState<Planning | null>(null);
  const [sugerenciaIA, setSugerenciaIA] = useState<SugerenciaIA | null>(null);

  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "warning" | "info" } | null>(null);

  // Edit Section Toggles
  const [editMode, setEditMode] = useState<Record<string, boolean>>({});
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  // Fetch planning details on mount
  const fetchPlanning = async () => {
    try {
      setLoading(true);
      const res = await getPlanningById(id);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setPlanning(res.data);
        setEditedPlanning(JSON.parse(JSON.stringify(res.data))); // Deep clone
      }
    } catch (err: any) {
      console.error("Error fetching planning details:", err);
      setError(err?.response?.data?.error || err.message || "Failed to load planning");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPlanning();

      // Retrieve AI suggestion from sessionStorage if present
      const savedSugerencia = sessionStorage.getItem(`sugerencia_ia_${id}`);
      if (savedSugerencia) {
        try {
          setSugerenciaIA(JSON.parse(savedSugerencia));
        } catch (e) {
          console.error("Failed to parse AI suggestion", e);
        }
      }
    }
  }, [id]);

  // Handle section edit toggle
  const toggleEditSection = (section: string) => {
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle collapsible section toggle
  const toggleCollapseSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Handle simple field update
  const handleFieldChange = (field: keyof Planning, value: any) => {
    if (!editedPlanning) return;
    setEditedPlanning((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle phase activities update
  const handlePhaseActivitiesChange = (index: number, value: string) => {
    if (!editedPlanning) return;
    const updatedFases = [...editedPlanning.fases];
    updatedFases[index] = {
      ...updatedFases[index],
      actividades: value,
    };
    setEditedPlanning((prev: any) => ({
      ...prev,
      fases: updatedFases,
    }));
  };

  // Handle recursos update
  const handleRecursosChange = (field: "espacios" | "tiempos" | "materiales", value: string) => {
    if (!editedPlanning) return;
    const updatedRecursos = {
      ...(editedPlanning.recursos || { espacios: "", tiempos: "", materiales: "" }),
      [field]: value,
    };
    setEditedPlanning((prev: any) => ({
      ...prev,
      recursos: updatedRecursos,
    }));
  };

  // Save changes
  const handleSaveChanges = async () => {
    if (!editedPlanning) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        title: editedPlanning.title,
        contenidos: editedPlanning.contenidos || "",
        pda: editedPlanning.pda || "",
        relevanciaSocial: editedPlanning.relevanciaSocial || "",
        produccionSugerida: editedPlanning.produccionSugerida || "",
        fases: editedPlanning.fases,
        recursos: editedPlanning.recursos || {},
        campoFormativo: editedPlanning.campoFormativo,
        ejesArticuladores: editedPlanning.ejesArticuladores,
      };

      const res = await updatePlanning(id, payload);
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setPlanning(res.data);
        setEditedPlanning(JSON.parse(JSON.stringify(res.data)));
        setEditMode({});
        setMessage({
          text: language === "es" ? "Cambios guardados correctamente." : "Changes saved successfully.",
          type: "success",
        });
      }
    } catch (err: any) {
      console.error("Error saving planning changes:", err);
      setError(err?.response?.data?.error || err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Submit Planning (Mark as Reviewed / SUBMITTED)
  const handleSubmitPlanning = async () => {
    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await updatePlanning(id, { status: PlanningStatus.SUBMITTED });
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setPlanning(res.data);
        setEditedPlanning(JSON.parse(JSON.stringify(res.data)));
        setMessage({
          text: language === "es" ? "Planeación enviada y marcada como revisada." : "Planning submitted and marked as reviewed.",
          type: "success",
        });
      }
    } catch (err: any) {
      console.error("Error submitting planning:", err);
      setError(err?.response?.data?.error || err.message || "Failed to submit planning");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Planning
  const handleDeletePlanning = async () => {
    const confirmDelete = window.confirm(
      language === "es"
        ? "¿Estás seguro de que deseas eliminar permanentemente esta planeación?"
        : "Are you sure you want to permanently delete this lesson plan?"
    );
    if (!confirmDelete) return;

    try {
      const res = await deletePlanning(id);
      if (res.error) {
        setError(res.error);
      } else {
        router.push("/planning");
      }
    } catch (err: any) {
      console.error("Error deleting planning:", err);
      setError(err?.response?.data?.error || err.message || "Failed to delete planning");
    }
  };

  // Discrepancy banner controls
  const handleDismissSuggestion = () => {
    setSugerenciaIA(null);
    sessionStorage.removeItem(`sugerencia_ia_${id}`);
  };

  const handleApplySuggestion = () => {
    setMessage({
      text: language === "es" ? "Función de aplicar sugerencia próximamente" : "Apply suggestion feature coming soon",
      type: "info",
    });
    handleDismissSuggestion();
  };

  // Check if data is modified
  const isDirty = JSON.stringify(planning) !== JSON.stringify(editedPlanning);

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center flex flex-col items-center justify-center space-y-4 border border-[var(--border-glass)] min-h-[300px]">
        <div className="w-10 h-10 rounded-full border-4 border-[var(--border-glass)] border-t-[var(--accent-primary)] animate-spin" />
        <p className="text-sm text-[var(--text-secondary)]">
          {language === "es" ? "Cargando planeación didáctica..." : "Loading lesson plan..."}
        </p>
      </div>
    );
  }

  if (error && !planning) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/planning" className="p-2 rounded-lg border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] text-[var(--text-secondary)]">
            <ArrowLeft size={16} />
          </Link>
          <h1 className="text-xl font-bold">{language === "es" ? "Error al cargar" : "Failed to Load"}</h1>
        </div>
        <div className="p-4 rounded-xl bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/35 text-[var(--accent-danger)] text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!planning || !editedPlanning) return null;

  return (
    <div className="space-y-6 pb-24 print:pb-0 print:space-y-6 print:text-black">
      {/* Top Nav actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:flex-row print:items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/planning"
            className="p-2 rounded-lg border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all print:hidden"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold select-none border uppercase tracking-wider
                  ${
                    planning.status === PlanningStatus.APPROVED
                      ? "bg-emerald-500/10 text-[var(--accent-success)] border-emerald-500/20 print:bg-emerald-50 print:text-emerald-750 print:border-emerald-200"
                      : planning.status === PlanningStatus.SUBMITTED
                      ? "bg-amber-500/10 text-[var(--accent-warning)] border-amber-500/20 print:bg-amber-50 print:text-amber-750 print:border-amber-200"
                      : planning.status === PlanningStatus.REJECTED
                      ? "bg-rose-500/10 text-[var(--accent-danger)] border-rose-500/20 print:bg-rose-50 print:text-rose-750 print:border-rose-200"
                      : "bg-blue-500/10 text-blue-400 border-blue-500/20 print:bg-blue-50 print:text-blue-750 print:border-blue-200"
                  }
                `}
              >
                {planning.status}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] print:text-slate-500 font-mono">
                {new Date(planning.createdAt).toLocaleDateString(language === "es" ? "es-MX" : "en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {editMode["title"] ? (
              <input
                type="text"
                value={editedPlanning.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                className="glass-input mt-1 text-xl font-extrabold py-1 px-2 h-auto max-w-lg focus:border-[var(--accent-primary)]"
                autoFocus
                onBlur={() => toggleEditSection("title")}
              />
            ) : (
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2 group mt-1 print:text-black print:text-2xl">
                <span>{planning.title}</span>
                {planning.status === PlanningStatus.DRAFT && (
                  <button
                    onClick={() => toggleEditSection("title")}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all print:hidden"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </h1>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 print:hidden">
          {planning.status === PlanningStatus.DRAFT && (
            <button
              onClick={handleSubmitPlanning}
              disabled={submitting || isDirty}
              className="glass-button px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
              title={isDirty ? (language === "es" ? "Guarda los cambios primero" : "Save changes first") : ""}
            >
              <CheckCircle size={14} />
              <span>
                {submitting
                  ? (language === "es" ? "Enviando..." : "Submitting...")
                  : (language === "es" ? "Marcar como revisado" : "Mark as reviewed")}
              </span>
            </button>
          )}

          {/* Export PDF Button */}
          <button
            onClick={() => window.print()}
            className="glass-button px-5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 border border-white/10 hover:border-[var(--accent-secondary)] bg-white/[0.02] hover:bg-white/[0.06] transition-all cursor-pointer shadow-glow"
            title={language === "es" ? "Exportar planeación a PDF / Imprimir" : "Export lesson plan to PDF / Print"}
          >
            <Printer size={14} className="text-[var(--accent-secondary)]" />
            <span>{language === "es" ? "Exportar PDF" : "Export PDF"}</span>
          </button>

          <button
            onClick={handleDeletePlanning}
            className="p-2.5 rounded-xl border border-[var(--accent-danger)]/20 bg-red-500/5 hover:bg-red-500/15 hover:border-[var(--accent-danger)]/50 text-[var(--accent-danger)] transition-all cursor-pointer"
            title={language === "es" ? "Eliminar planeación" : "Delete lesson plan"}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Ephemeral feedback notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border animate-fade-in print:hidden
            ${
              message.type === "success"
                ? "bg-[var(--accent-success)]/10 border-[var(--accent-success)]/30 text-[var(--accent-success)]"
                : message.type === "warning"
                ? "bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30 text-[var(--accent-warning)]"
                : "bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]/30 text-[var(--accent-secondary)]"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <CheckCircle size={18} />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="hover:opacity-75">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/35 text-[var(--accent-danger)] text-sm flex items-center gap-3 print:hidden">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Suggestion Banner */}
      {sugerenciaIA && sugerenciaIA.hayDiscrepancia && (
        <div className="glass-panel p-5 border-l-4 border-l-[var(--accent-warning)] border-[var(--border-glass)] bg-[hsla(38,92%,52%,0.03)] space-y-3.5 relative overflow-hidden animate-fade-in print:hidden">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-[var(--accent-warning)] shrink-0 mt-0.5" size={20} />
            <div className="space-y-1.5 flex-1 pr-6">
              <h4 className="text-sm font-bold text-[var(--accent-warning)]">
                {language === "es" ? "Recomendación de Coherencia IA" : "AI Coherence Recommendation"}
              </h4>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                {sugerenciaIA.justificacion}
              </p>

              <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-white/5">
                {sugerenciaIA.modalidadSugerida && (
                  <div className="text-[11px]">
                    <span className="text-[var(--text-muted)]">{language === "es" ? "Modalidad sugerida: " : "Suggested Modality: "}</span>
                    <span className="font-bold text-[var(--accent-secondary)]">{PlanningModalidadLabels[sugerenciaIA.modalidadSugerida] || sugerenciaIA.modalidadSugerida}</span>
                  </div>
                )}
                {sugerenciaIA.campoFormativoSugerido && (
                  <div className="text-[11px]">
                    <span className="text-[var(--text-muted)]">{language === "es" ? "Campo sugerido: " : "Suggested Field: "}</span>
                    <span className="font-bold text-[var(--accent-secondary)]">{CampoFormativoLabels[sugerenciaIA.campoFormativoSugerido] || sugerenciaIA.campoFormativoSugerido}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={handleDismissSuggestion}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleDismissSuggestion}
              className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-white/5 border border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
            >
              {language === "es" ? "Mantener mi selección" : "Keep my selection"}
            </button>
            <button
              onClick={handleApplySuggestion}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--accent-warning)] hover:bg-[var(--accent-warning)]/90 text-black shadow-glow transition-all"
            >
              {language === "es" ? "Aplicar sugerencia" : "Apply suggestion"}
            </button>
          </div>
        </div>
      )}

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:flex print:flex-col print:gap-5">
        {/* Left Column: Metadata Details */}
        <div className="space-y-6 print:space-y-5">
          <div className="glass-panel p-6 border border-[var(--border-glass)] space-y-6 print:bg-slate-50 print:border-slate-200 print:text-black print:p-5 print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-glass)] pb-2 flex items-center gap-2 print:text-black print:border-slate-200">
              <Compass size={16} className="text-[var(--accent-primary-light)] print:text-slate-700" />
              <span>{language === "es" ? "Información Curricular" : "Curricular Information"}</span>
            </h3>

            {/* Modalidad */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] print:text-slate-500 uppercase tracking-wider">{language === "es" ? "Modalidad Pedagógica" : "Modality"}</span>
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 print:bg-white print:border-slate-200 print:text-black">
                <Calendar size={15} className="text-[var(--accent-primary)] print:text-slate-600" />
                <span>{PlanningModalidadLabels[planning.modalidad] || planning.modalidad}</span>
              </div>
            </div>

            {/* Campo Formativo */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-[var(--text-muted)] print:text-slate-500 uppercase tracking-wider">{language === "es" ? "Campo Formativo" : "Formative Field"}</span>
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 print:bg-white print:border-slate-200 print:text-black">
                <BookOpen size={15} className="text-[var(--accent-secondary)] print:text-slate-600" />
                <span>{CampoFormativoLabels[planning.campoFormativo] || planning.campoFormativo}</span>
              </div>
            </div>

            {/* Ejes Articuladores */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[var(--text-muted)] print:text-slate-500 uppercase tracking-wider block">{language === "es" ? "Ejes Articuladores" : "Articulating Axes"}</span>
              <div className="flex flex-wrap gap-1.5">
                {planning.ejesArticuladores.map((eje) => (
                  <span
                    key={eje}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/[0.03] text-[var(--text-secondary)] border border-[var(--border-glass)] print:bg-white print:border-slate-200 print:text-slate-700"
                  >
                    {EjeArticuladorLabels[eje] || eje}
                  </span>
                ))}
              </div>
            </div>

            {/* Identificación (School Structure or Standalone) */}
            <div className="space-y-3 pt-3 border-t border-[var(--border-glass)] print:border-slate-200">
              <span className="text-[11px] font-bold text-[var(--text-muted)] print:text-slate-500 uppercase tracking-wider block">
                {language === "es" ? "Contexto del Alumno / Grado" : "Student Context"}
              </span>

              {planning.groupId ? (
                <div className="space-y-2 text-xs print:text-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] print:text-slate-500">{language === "es" ? "Grupo:" : "Group:"}</span>
                    <span className="font-semibold">{planning.group?.grade?.name} - {planning.group?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] print:text-slate-500">{language === "es" ? "Materia:" : "Subject:"}</span>
                    <span className="font-semibold text-[var(--accent-primary-light)] print:text-slate-700">{planning.subject?.name}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-xs print:text-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] print:text-slate-500">{language === "es" ? "Nivel Escolar:" : "School Level:"}</span>
                    <span className="font-semibold uppercase">{planning.standaloneLevel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] print:text-slate-500">{language === "es" ? "Grado (Orden):" : "Grade (Order):"}</span>
                    <span className="font-semibold">{planning.standaloneGradeOrder}° grado</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contexto Inicial */}
          <div className="glass-panel p-6 border border-[var(--border-glass)] space-y-3 print:bg-slate-50 print:border-slate-200 print:text-black print:p-5 print:shadow-none">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-secondary)] border-b border-[var(--border-glass)] pb-2 print:text-black print:border-slate-200">
              {language === "es" ? "Contexto Inicial Guardado" : "Initial Context Saved"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] print:text-slate-700 leading-relaxed italic whitespace-pre-wrap">
              "{planning.contextoInicial}"
            </p>
          </div>
        </div>

        {/* Right Columns: Planning Contents, Phases, Resources */}
        <div className="lg:col-span-2 space-y-6 print:space-y-5">
          {/* Curricular Targets Cards */}
          {[
            { id: "contenidos", title: language === "es" ? "Contenidos SEP" : "SEP Contents", content: editedPlanning.contenidos, color: "var(--accent-primary)", printColor: "border-purple-200" },
            { id: "pda", title: language === "es" ? "Procesos de Desarrollo de Aprendizaje (PDA)" : "Learning Development Processes (PDA)", content: editedPlanning.pda, color: "var(--accent-secondary)", printColor: "border-cyan-200" },
            { id: "relevanciaSocial", title: language === "es" ? "Relevancia Social" : "Social Relevance", content: editedPlanning.relevanciaSocial, color: "var(--accent-warning)", printColor: "border-amber-200" },
            { id: "produccionSugerida", title: language === "es" ? "Producción Sugerida" : "Suggested Final Output", content: editedPlanning.produccionSugerida, color: "var(--accent-success)", printColor: "border-emerald-200" },
          ].map((sec) => {
            const isEditing = editMode[sec.id] === true;
            const isCollapsed = collapsedSections[sec.id] === true;

            return (
              <div key={sec.id} className="glass-panel border border-[var(--border-glass)] overflow-hidden print:bg-white print:border-slate-200 print:shadow-none">
                <div
                  className="p-4 bg-white/[0.01] border-b border-[var(--border-glass)] flex justify-between items-center cursor-pointer select-none print:bg-slate-50 print:border-slate-200"
                  onClick={() => toggleCollapseSection(sec.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 rounded-full print:w-2" style={{ backgroundColor: sec.color }} />
                    <h3 className="text-sm font-bold text-[var(--text-primary)] print:text-black">{sec.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 print:hidden" onClick={(e) => e.stopPropagation()}>
                    {planning.status === PlanningStatus.DRAFT && (
                      <button
                        onClick={() => toggleEditSection(sec.id)}
                        className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all
                          ${
                            isEditing
                              ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary-light)] border-[var(--accent-primary)]/40"
                              : "bg-white/[0.02] border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-white"
                          }
                        `}
                      >
                        {isEditing ? <Check size={12} /> : <Edit2 size={12} />}
                        <span>{isEditing ? (language === "es" ? "Terminar" : "Done") : (language === "es" ? "Editar" : "Edit")}</span>
                      </button>
                    )}
                    <button
                      onClick={() => toggleCollapseSection(sec.id)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-white"
                    >
                      {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                  </div>
                </div>

                {/* If collapsed in normal screen, we hide it, but ALWAYS show it on print */}
                <div className={`p-5 print:p-4 print:block ${isCollapsed && !isEditing ? "hidden" : "block"}`}>
                  {isEditing ? (
                    <textarea
                      value={sec.content || ""}
                      onChange={(e) => handleFieldChange(sec.id as any, e.target.value)}
                      className="glass-input w-full min-h-[100px] text-xs leading-relaxed font-sans"
                    />
                  ) : (
                    <p className="text-xs text-[var(--text-secondary)] print:text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {sec.content || (language === "es" ? "Sin definir." : "Not defined.")}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {/* Fases / Secuencia Didáctica */}
          <div className="space-y-4 print:space-y-3">
            <h3 className="text-base font-bold flex items-center gap-2 border-b border-[var(--border-glass)] pb-2 text-[var(--text-primary)] print:text-black print:border-slate-200">
              <Calendar size={18} className="text-[var(--accent-primary)] print:text-slate-700" />
              <span>{language === "es" ? "Secuencia de Actividades por Fases" : "Activity Sequence by Phases"}</span>
            </h3>

            {editedPlanning.fases?.map((fase, idx) => {
              const secId = `fase_${idx}`;
              const isEditing = editMode[secId] === true;

              return (
                <div key={idx} className="glass-panel border border-[var(--border-glass)] p-5 space-y-4 print:bg-white print:border-slate-200 print:p-4 print:shadow-none print:space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-[var(--accent-primary)]/10 text-[var(--accent-primary-light)] font-mono text-xs font-bold flex items-center justify-center border border-[var(--accent-primary)]/20 print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                        {fase.orden}
                      </span>
                      <h4 className="text-sm font-bold text-[var(--text-primary)] print:text-black">
                        {fase.nombre}
                      </h4>
                    </div>

                    {planning.status === PlanningStatus.DRAFT && (
                      <button
                        onClick={() => toggleEditSection(secId)}
                        className={`p-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all flex items-center gap-1.5 print:hidden
                          ${
                            isEditing
                              ? "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/40"
                              : "bg-white/[0.02] border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-white"
                          }
                        `}
                      >
                        {isEditing ? <Check size={10} /> : <Edit2 size={10} />}
                        <span>{isEditing ? (language === "es" ? "Listo" : "Done") : (language === "es" ? "Editar" : "Edit")}</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      value={fase.actividades}
                      onChange={(e) => handlePhaseActivitiesChange(idx, e.target.value)}
                      className="glass-input w-full min-h-[140px] text-xs leading-relaxed font-sans"
                    />
                  ) : (
                    <div className="text-xs text-[var(--text-secondary)] print:text-slate-800 leading-relaxed whitespace-pre-wrap bg-white/[0.01] p-3 rounded-lg border border-white/5 print:bg-slate-50 print:border-slate-100">
                      {fase.actividades}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recursos sugeridos */}
          <div className="glass-panel border border-[var(--border-glass)] overflow-hidden print:bg-white print:border-slate-200 print:shadow-none">
            <div className="p-4 bg-white/[0.01] border-b border-[var(--border-glass)] flex justify-between items-center print:bg-slate-50 print:border-slate-200">
              <h3 className="text-sm font-bold flex items-center gap-2 print:text-black">
                <Layers size={16} className="text-[var(--accent-secondary)] print:text-slate-700" />
                <span>{language === "es" ? "Recursos y Logística" : "Resources & Logistics"}</span>
              </h3>

              {planning.status === PlanningStatus.DRAFT && (
                <button
                  onClick={() => toggleEditSection("recursos")}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1.5 transition-all print:hidden
                    ${
                      editMode["recursos"]
                        ? "bg-[var(--accent-secondary)]/15 text-[var(--accent-secondary)] border-[var(--accent-secondary)]/40"
                        : "bg-white/[0.02] border-[var(--border-glass)] text-[var(--text-secondary)] hover:text-white"
                    }
                  `}
                >
                  {editMode["recursos"] ? <Check size={12} /> : <Edit2 size={12} />}
                  <span>{editMode["recursos"] ? (language === "es" ? "Terminar" : "Done") : (language === "es" ? "Editar" : "Edit")}</span>
                </button>
              )}
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4 print:p-4">
              {/* Espacios */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider print:text-slate-500">
                  <MapPin size={14} className="text-[var(--accent-primary)] print:text-slate-600" />
                  <span>{language === "es" ? "Espacios" : "Spaces"}</span>
                </div>
                {editMode["recursos"] ? (
                  <input
                    type="text"
                    value={editedPlanning.recursos?.espacios || ""}
                    onChange={(e) => handleRecursosChange("espacios", e.target.value)}
                    className="glass-input w-full text-xs"
                  />
                ) : (
                  <p className="text-xs text-[var(--text-primary)] print:text-black font-semibold">
                    {planning.recursos?.espacios || "—"}
                  </p>
                )}
              </div>

              {/* Tiempos */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider print:text-slate-500">
                  <Clock size={14} className="text-[var(--accent-secondary)] print:text-slate-600" />
                  <span>{language === "es" ? "Tiempos" : "Tiempos"}</span>
                </div>
                {editMode["recursos"] ? (
                  <input
                    type="text"
                    value={editedPlanning.recursos?.tiempos || ""}
                    onChange={(e) => handleRecursosChange("tiempos", e.target.value)}
                    className="glass-input w-full text-xs"
                  />
                ) : (
                  <p className="text-xs text-[var(--text-primary)] print:text-black font-semibold">
                    {planning.recursos?.tiempos || "—"}
                  </p>
                )}
              </div>

              {/* Materiales */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider print:text-slate-500">
                  <Wrench size={14} className="text-[var(--accent-warning)] print:text-slate-600" />
                  <span>{language === "es" ? "Materiales" : "Materials"}</span>
                </div>
                {editMode["recursos"] ? (
                  <textarea
                    value={editedPlanning.recursos?.materiales || ""}
                    onChange={(e) => handleRecursosChange("materiales", e.target.value)}
                    className="glass-input w-full min-h-[60px] text-xs font-sans"
                  />
                ) : (
                  <p className="text-xs text-[var(--text-primary)] print:text-black whitespace-pre-wrap">
                    {planning.recursos?.materiales || "—"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save changes bar (Modern Glow styling) */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-scale-up print:hidden">
          <div className="glass-panel p-4 border border-[var(--accent-primary)]/30 bg-[hsla(263,90%,60%,0.05)] shadow-glow flex items-center justify-between gap-4 rounded-2xl">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-[var(--accent-primary-light)] shrink-0 animate-pulse" size={16} />
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {language === "es" ? "Tienes cambios sin guardar" : "You have unsaved changes"}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setEditedPlanning(JSON.parse(JSON.stringify(planning)))}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-white/5 border border-transparent text-[var(--text-secondary)] hover:text-white"
              >
                {language === "es" ? "Descartar" : "Discard"}
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/95 text-white shadow-glow flex items-center gap-1.5"
              >
                <Save size={12} />
                <span>{saving ? (language === "es" ? "Guardando..." : "Saving...") : (language === "es" ? "Guardar" : "Save")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
