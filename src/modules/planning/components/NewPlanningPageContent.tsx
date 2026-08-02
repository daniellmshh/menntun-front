"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import { getPlanningCatalogo } from "@/modules/planning/services/planning.service";
import {
  PlanningModalidad,
  NivelEducativo,
  CampoSeleccionado,
  PlanningCatalogo,
} from "@/modules/planning/types";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import PlanningGenerationOverlay from "./PlanningGenerationOverlay";
import PlanningWizardNavigation from "./PlanningWizardNavigation";
import PlanningWizardStepIndicator from "./PlanningWizardStepIndicator";
import PlanningWizardHeader from "./PlanningWizardHeader";
import PlanningIdentificationStep from "./PlanningIdentificationStep";
import PlanningCurricularStep from "./PlanningCurricularStep";
import PlanningOperationalCatalogsStep from "./PlanningOperationalCatalogsStep";
import PlanningReviewStep from "./PlanningReviewStep";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
        <PlanningCurricularStep
          catalogo={catalogo}
          groups={groups}
          isStandalone={isStandalone}
          standaloneGradeOrder={standaloneGradeOrder}
          selectedGroupId={selectedGroupId}
          camposSeleccionados={camposSeleccionados}
          ejesSeleccionados={ejesSeleccionados}
          addingCampoId={addingCampoId}
          addingContenidoId={addingContenidoId}
          addingPdaLiteral={addingPdaLiteral}
          onCampoChange={(value) => {
            setAddingCampoId(value);
            setAddingContenidoId("");
            setAddingPdaLiteral("");
          }}
          onContenidoChange={(value) => {
            setAddingContenidoId(value);
            setAddingPdaLiteral("");
          }}
          onPdaChange={setAddingPdaLiteral}
          onAddCampo={handleAddCampo}
          onRemoveCampo={handleRemoveCampo}
          onToggleEje={toggleEje}
        />
      )}

      {/* ──── STEP 2: Catálogos operativos Sara ──── */}
      {step === 2 && catalogo && (
        <PlanningOperationalCatalogsStep
          catalogo={catalogo}
          problematica={problematica}
          problematicaCustom={problematicaCustom}
          proposito={proposito}
          instrSeleccionados={instrSeleccionados}
          ajustesTexto={ajustesTexto}
          pmcTexto={pmcTexto}
          onProblematicaChange={(value) => {
            setProblematica(value);
            if (value !== "__custom__") setProblematicaCustom("");
          }}
          onProblematicaCustomChange={setProblematicaCustom}
          onPropositoChange={setProposito}
          onToggleInstrumento={(value) => toggleMulti(value, instrSeleccionados, setInstrSeleccionados)}
          onAjustesChange={setAjustesTexto}
          onPmcChange={setPmcTexto}
        />
      )}

      {/* ──── STEP 3: Revisar y Generar ──── */}
      {step === 3 && catalogo && (
        <PlanningReviewStep
          catalogo={catalogo}
          startDate={startDate}
          endDate={endDate}
          activitiesPerDay={activitiesPerDay}
          modalidad={modalidad}
          isStandalone={isStandalone}
          instrSeleccionados={instrSeleccionados}
          ajustesTexto={ajustesTexto}
          pmcTexto={pmcTexto}
          camposSeleccionados={camposSeleccionados}
          ejesSeleccionados={ejesSeleccionados}
          problematica={problematica}
          problematicaCustom={problematicaCustom}
          proposito={proposito}
        />
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
