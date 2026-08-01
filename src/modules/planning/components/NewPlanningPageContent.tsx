"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  X,
  BookOpen,
  Layers,
  Check,
  Info,
} from "lucide-react";
import api from "@/lib/api/axios";
import { getPlanningCatalogo } from "@/modules/planning/services/planning.service";
import {
  PlanningModalidad,
  NivelEducativo,
  CampoSeleccionado,
  PlanningCatalogo,
  CatalogoCampoFormativo,
} from "@/modules/planning/types";
import { PlanningModalidadLabels } from "@/modules/planning/constants";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import { sanitizeInput } from "@/lib/utils";
import PlanningGenerationOverlay from "./PlanningGenerationOverlay";
import PlanningWizardNavigation from "./PlanningWizardNavigation";
import PlanningWizardStepIndicator from "./PlanningWizardStepIndicator";
import PlanningWizardHeader from "./PlanningWizardHeader";
import PlanningIdentificationStep from "./PlanningIdentificationStep";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CAMPO_COLORS: Record<string, string> = {
  LENGUAJES: "from-violet-500/20 to-violet-500/5 border-violet-500/30 text-violet-300",
  SABERES_PENSAMIENTO_CIENTIFICO: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30 text-cyan-300",
  ETICA_NATURALEZA_SOCIEDADES: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-300",
  HUMANO_COMUNITARIO: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-300",
};

const CAMPO_BADGE: Record<string, string> = {
  LENGUAJES: "bg-violet-500/20 text-violet-300 border-violet-500/40",
  SABERES_PENSAMIENTO_CIENTIFICO: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  ETICA_NATURALEZA_SOCIEDADES: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  HUMANO_COMUNITARIO: "bg-amber-500/20 text-amber-300 border-amber-500/40",
};

interface AcademicGroupOption {
  id: string;
  name: string;
  section?: string | null;
  grade?: {
    name?: string;
    order?: number;
  } | null;
}

interface AcademicSubjectOption {
  id: string;
  name: string;
}

type PlanningStreamEvent =
  | { type: "token"; content: string }
  | { type: "status"; message: string }
  | { type: "done"; planningId: string }
  | { type: "error"; message: string };

function parsePlanningStreamEvent(raw: string): PlanningStreamEvent | null {
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== "object" || !("type" in value)) return null;

  const event = value as Record<string, unknown>;
  if (event.type === "token" && typeof event.content === "string") {
    return { type: "token", content: event.content };
  }
  if (event.type === "status" && typeof event.message === "string") {
    return { type: "status", message: event.message };
  }
  if (event.type === "done" && typeof event.planningId === "string") {
    return { type: "done", planningId: event.planningId };
  }
  if (event.type === "error" && typeof event.message === "string") {
    return { type: "error", message: event.message };
  }

  return null;
}

// ─── Componente principal ─────────────────────────────────────────────────────

function NewPlanningContent() {
  const router = useRouter();

  // UI state
  const [step, setStep] = useState(0); // 0-3
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Streaming state
  const [streamContent, setStreamContent] = useState("");
  const [streamStatus, setStreamStatus] = useState("");
  const [streamProgress, setStreamProgress] = useState(0);

  // Catalog data from server
  const [catalogo, setCatalogo] = useState<PlanningCatalogo | null>(null);

  // Academic groups/subjects for integrated mode
  const [groups, setGroups] = useState<AcademicGroupOption[]>([]);
  const [subjects, setSubjects] = useState<AcademicSubjectOption[]>([]);

  // ─── STEP 0: Identificación ────────────────────────────────────────────────
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [isStandalone, setIsStandalone] = useState(false);
  const [standaloneLevel, setStandaloneLevel] = useState<NivelEducativo>(NivelEducativo.PREESCOLAR);
  const [standaloneGradeOrder, setStandaloneGradeOrder] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activitiesPerDay, setActivitiesPerDay] = useState<number>(1);
  const [modalidad, setModalidad] = useState<PlanningModalidad>(PlanningModalidad.PROYECTOS);

  // ─── STEP 1: Curricular ────────────────────────────────────────────────────
  const [camposSeleccionados, setCamposSeleccionados] = useState<CampoSeleccionado[]>([]);
  const [ejesSeleccionados, setEjesSeleccionados] = useState<string[]>([]);
  // Temp UI state for adding a campo+contenido
  const [addingCampoId, setAddingCampoId] = useState<string>("");
  const [addingContenidoId, setAddingContenidoId] = useState<string>("");
  const [addingPdaLiteral, setAddingPdaLiteral] = useState<string>("");

  // ─── STEP 2: Catálogos Sara ────────────────────────────────────────────────
  const [problematica, setProblematica] = useState("");
  const [problematicaCustom, setProblematicaCustom] = useState("");
  const [proposito, setProposito] = useState("");
  const [instrSeleccionados, setInstrSeleccionados] = useState<string[]>([]);
  const [ajustesTexto, setAjustesTexto] = useState("");
  const [pmcTexto, setPmcTexto] = useState("");

  const resetCurricularSelection = () => {
    setCamposSeleccionados([]);
    setAddingCampoId("");
    setAddingContenidoId("");
    setAddingPdaLiteral("");
  };

  // Load catalog + academic data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, groupsRes, subjectsRes] = await Promise.allSettled([
          getPlanningCatalogo(),
          api.get("/academic/groups"),
          api.get("/academic/subjects"),
        ]);

        if (catRes.status === "fulfilled" && catRes.value.data) {
          setCatalogo(catRes.value.data);
        } else {
          setError("No se pudo cargar el catálogo curricular.");
        }

        const fetchedGroups = groupsRes.status === "fulfilled" ? groupsRes.value.data?.data || [] : [];
        const fetchedSubjects = subjectsRes.status === "fulfilled" ? subjectsRes.value.data?.data || [] : [];

        setGroups(fetchedGroups);
        setSubjects(fetchedSubjects);
        if (fetchedGroups.length === 0 || fetchedSubjects.length === 0) {
          setIsStandalone(true);
        } else {
          setIsStandalone(false);
          setSelectedGroupId(fetchedGroups[0].id);
          setSelectedSubjectId(fetchedSubjects[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Error al inicializar la planeación.");
      } finally {
        setLoadingCatalog(false);
      }
    };
    loadData();
  }, []);

  // ─── Campo+contenido helpers ───────────────────────────────────────────────

  const handleAddCampo = () => {
    if (!addingCampoId || !addingContenidoId || !addingPdaLiteral) return;
    const exists = camposSeleccionados.some(
      (c) => c.campoFormativoId === addingCampoId && c.contenidoId === addingContenidoId && c.pdaLiteral === addingPdaLiteral
    );
    if (!exists) {
      setCamposSeleccionados((prev) => [
        ...prev,
        { campoFormativoId: addingCampoId, contenidoId: addingContenidoId, pdaLiteral: addingPdaLiteral },
      ]);
    }
    setAddingCampoId("");
    setAddingContenidoId("");
    setAddingPdaLiteral("");
  };

  const handleRemoveCampo = (idx: number) => {
    setCamposSeleccionados((prev) => prev.filter((_, i) => i !== idx));
  };

  const toggleEje = (eje: string) => {
    setEjesSeleccionados((prev) =>
      prev.includes(eje) ? prev.filter((e) => e !== eje) : [...prev, eje]
    );
  };

  const toggleMulti = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const getCampoInfo = (campoId: string): CatalogoCampoFormativo | undefined =>
    catalogo?.camposFormativos.find((c) => c.id === campoId);

  const getContenidoName = (campoId: string, contenidoId: string): string => {
    const campo = getCampoInfo(campoId);
    return campo?.contenidos.find((c) => c.id === contenidoId)?.nombre || contenidoId;
  };

  // ─── Validation ───────────────────────────────────────────────────────────

  const canProceed = (): boolean => {
    if (step === 0) {
      if (!modalidad || !startDate || !endDate) return false;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      if (diffDays < 0 || diffDays > 15) return false;
      return true;
    }
    if (step === 1) return camposSeleccionados.length > 0 && ejesSeleccionados.length > 0;
    if (step === 2) {
      const prob = problematica === "__custom__" ? problematicaCustom : problematica;
      return !!prob.trim() && !!proposito.trim();
    }
    return true;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    setStreamContent("");
    setStreamStatus("Preparando tu planeación...");
    setStreamProgress(5);

    try {
      const prob = problematica === "__custom__" ? problematicaCustom : problematica;
      const dto = {
        camposSeleccionados,
        modalidad,
        ejesArticuladores: ejesSeleccionados,
        groupId: !isStandalone ? selectedGroupId || undefined : undefined,
        subjectId: !isStandalone ? selectedSubjectId || undefined : undefined,
        standaloneLevel: isStandalone ? standaloneLevel : undefined,
        standaloneGradeOrder: isStandalone ? standaloneGradeOrder : undefined,
        startDate,
        endDate,
        activitiesPerDay,
        problematica: prob,
        proposito,
        instrumentoEvaluacion: instrSeleccionados,
        ajustesRazonables: ajustesTexto.trim() ? [ajustesTexto.trim()] : [],
        actividadesPmc: pmcTexto.trim() ? [pmcTexto.trim()] : [],
      };

      // Obtener el token JWT de Supabase
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Sesión expirada. Por favor recarga.");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";
      const response = await fetch(`${apiUrl}/planning/generate/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(dto),
      });

      if (!response.ok || !response.body) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message || "Error al conectar con el servidor.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let tokenCount = 0;

      const STATUS_MESSAGES = [
        "Analizando fundamentación curricular SEP...",
        "Diseñando la matriz didáctica...",
        "Integrando campos formativos y PDAs...",
        "Construyendo actividades por momento...",
        "Incorporando ajustes y evaluación formativa...",
        "Revisando coherencia pedagógica NEM...",
      ];
      let statusIdx = 0;
      const statusInterval = setInterval(() => {
        statusIdx = (statusIdx + 1) % STATUS_MESSAGES.length;
        setStreamStatus(STATUS_MESSAGES[statusIdx]);
      }, 4000);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = parsePlanningStreamEvent(line.slice(6));
            if (!event) continue;

            if (event.type === "token") {
              tokenCount++;
              setStreamContent((prev) => prev + event.content);
              // Progreso simulado: primeros tokens avanzan rápido, luego desacelera
              setStreamProgress((p) =>
                p < 85 ? Math.min(85, p + (tokenCount < 100 ? 0.8 : 0.15)) : p
              );
            } else if (event.type === "status") {
              setStreamStatus(event.message);
            } else if (event.type === "done") {
              clearInterval(statusInterval);
              setStreamProgress(100);
              setStreamStatus("¡Planeación generada exitosamente!");
              setTimeout(() => router.push(`/planning/${event.planningId}`), 800);
            } else if (event.type === "error") {
              clearInterval(statusInterval);
              throw new Error(event.message);
            }
          } catch (parseErr: unknown) {
            // Ignorar líneas que no sean JSON válido (solo lanzar si es evento de error)
            if (
              parseErr instanceof Error &&
              !parseErr.message.includes("JSON")
            ) {
              throw parseErr;
            }
          }
        }
      }
      clearInterval(statusInterval);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Error al generar la planeación.",
      );
      setGenerating(false);
      setStreamContent("");
      setStreamProgress(0);
    }
  };

  // ─── Rendering ────────────────────────────────────────────────────────────

  if (loadingCatalog) return <Loader />;

  // ─── Overlay de generación (SSE streaming) ─────────────────────────────────
  if (generating) {
    return (
      <PlanningGenerationOverlay
        content={streamContent}
        status={streamStatus}
        progress={streamProgress}
      />
    );
  }

  return (
    <div className="animate-fade-in">
      <PlanningWizardHeader error={error} />
      <PlanningWizardStepIndicator step={step} />

      {/* ──── STEP 0: Identificación ──── */}
      {step === 0 && (
        <PlanningIdentificationStep
          catalogo={catalogo}
          groups={groups}
          subjects={subjects}
          isStandalone={isStandalone}
          selectedGroupId={selectedGroupId}
          selectedSubjectId={selectedSubjectId}
          standaloneLevel={standaloneLevel}
          standaloneGradeOrder={standaloneGradeOrder}
          startDate={startDate}
          endDate={endDate}
          activitiesPerDay={activitiesPerDay}
          modalidad={modalidad}
          onGroupChange={(value) => {
            resetCurricularSelection();
            setSelectedGroupId(value);
          }}
          onSubjectChange={setSelectedSubjectId}
          onStandaloneLevelChange={setStandaloneLevel}
          onStandaloneGradeOrderChange={(value) => {
            resetCurricularSelection();
            setStandaloneGradeOrder(value);
          }}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onActivitiesPerDayChange={setActivitiesPerDay}
          onModalidadChange={setModalidad}
        />
      )}

      {/* ──── STEP 1: Fundamentación Curricular ──── */}
      {step === 1 && catalogo && (
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
                  onChange={(e) => { setAddingCampoId(e.target.value); setAddingContenidoId(""); setAddingPdaLiteral(""); }}
                  className="glass-input flex-1"
                >
                  <option value="">— Seleccionar Campo Formativo —</option>
                  {catalogo.camposFormativos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
                <select
                  value={addingContenidoId}
                  onChange={(e) => { setAddingContenidoId(e.target.value); setAddingPdaLiteral(""); }}
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
                            onChange={() => setAddingPdaLiteral(pdaText)}
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
                  onClick={handleAddCampo}
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
                  const colorClass = CAMPO_COLORS[sel.campoFormativoId] || "";
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
                        onClick={() => handleRemoveCampo(idx)}
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
                    onClick={() => toggleEje(eje)}
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
      )}

      {/* ──── STEP 2: Catálogos operativos Sara ──── */}
      {step === 2 && catalogo && (
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
                  onClick={() => { setProblematica(prob); setProblematicaCustom(""); }}
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
                onClick={() => setProblematica("__custom__")}
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
                onChange={(e) => setProblematicaCustom(sanitizeInput(e.target.value, true))}
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
              onChange={(e) => setProposito(sanitizeInput(e.target.value, true))}
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
                    onClick={() => toggleMulti(instr, instrSeleccionados, setInstrSeleccionados)}
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
              onChange={(e) => setAjustesTexto(sanitizeInput(e.target.value, false))}
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
              onChange={(e) => setPmcTexto(sanitizeInput(e.target.value, false))}
            />
          </div>
        </div>
      )}

      {/* ──── STEP 3: Revisar y Generar ──── */}
      {step === 3 && catalogo && (
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
                  const badge = CAMPO_BADGE[sel.campoFormativoId] || "";
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
      )}

      <PlanningWizardNavigation
        step={step}
        canProceed={canProceed()}
        generating={generating}
        onPrevious={() => setStep((currentStep) => currentStep - 1)}
        onNext={() => setStep((currentStep) => currentStep + 1)}
        onGenerate={handleGenerate}
      />
    </div>
  );
}

export default function NewPlanningPage() {
  return (
    <ModuleGuard moduleKey="planning">
      <NewPlanningContent />
    </ModuleGuard>
  );
}
