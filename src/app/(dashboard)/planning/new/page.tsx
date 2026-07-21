"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Plus,
  X,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Layers,
  Settings2,
  Users,
  Check,
  AlertCircle,
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
import { PlanningModalidadLabels, PlanningModalidadIcons } from "@/modules/planning/constants";
import { useLanguageStore } from "@/store/language.store";
import { useAuthStore } from "@/store/auth.store";
import { translations } from "@/lib/translations";
import Loader from "@/components/shared/Loader";

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

const STEP_LABELS = [
  "Identificación",
  "Curricular",
  "Catálogos",
  "Revisar",
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function NewPlanningPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const { user } = useAuthStore();
  const t = translations[language];

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
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  // ─── STEP 0: Identificación ────────────────────────────────────────────────
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [isStandalone, setIsStandalone] = useState(false);
  const [standaloneLevel, setStandaloneLevel] = useState<NivelEducativo>(NivelEducativo.PREESCOLAR);
  const [standaloneGradeOrder, setStandaloneGradeOrder] = useState(1);
  const [periodoProyecto, setPeriodoProyecto] = useState("");
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
  const [ajustesSeleccionados, setAjustesSeleccionados] = useState<string[]>([]);
  const [pmcSeleccionados, setPmcSeleccionados] = useState<string[]>([]);

  // Load catalog + academic data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [catRes, groupsRes, subjectsRes] = await Promise.all([
          getPlanningCatalogo(),
          api.get("/academic/groups"),
          api.get("/academic/subjects"),
        ]);
        if (catRes.data) setCatalogo(catRes.data);
        const fetchedGroups = groupsRes.data?.data || [];
        const fetchedSubjects = subjectsRes.data?.data || [];
        setGroups(fetchedGroups);
        setSubjects(fetchedSubjects);
        if (fetchedGroups.length === 0 || fetchedSubjects.length === 0) {
          setIsStandalone(true);
        } else {
          setSelectedGroupId(fetchedGroups[0].id);
          setSelectedSubjectId(fetchedSubjects[0].id);
        }
      } catch {
        setError("No se pudo cargar el catálogo curricular.");
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
    if (step === 0) return !!modalidad && !!periodoProyecto;
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
        periodoProyecto,
        problematica: prob,
        proposito,
        instrumentoEvaluacion: instrSeleccionados,
        ajustesRazonables: ajustesSeleccionados,
        actividadesPmc: pmcSeleccionados,
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
            const event = JSON.parse(line.slice(6));

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
          } catch (parseErr: any) {
            // Ignorar líneas que no sean JSON válido (solo lanzar si es evento de error)
            if (parseErr?.message && !parseErr.message.includes("JSON")) {
              throw parseErr;
            }
          }
        }
      }
      clearInterval(statusInterval);
    } catch (err: any) {
      setError(err?.message || "Error al generar la planeación.");
      setGenerating(false);
      setStreamContent("");
      setStreamProgress(0);
    }
  };

  // ─── Rendering ────────────────────────────────────────────────────────────

  if (loadingCatalog) return <Loader />;

  // ─── Overlay de generación (SSE streaming) ─────────────────────────────────
  if (generating) {
    // Extrae fragmentos legibles del JSON parcial acumulado
    const extractPreview = (raw: string) => {
      const items: { tipo: "titulo" | "momento" | "actividad"; texto: string }[] = [];

      // Título
      const titleMatch = raw.match(/"title"\s*:\s*"([^"]{3,})"/);
      if (titleMatch) items.push({ tipo: "titulo", texto: titleMatch[1] });

      // Momentos
      const momentoMatches = [...raw.matchAll(/"momento"\s*:\s*"([^"]{3,})"/g)];
      momentoMatches.forEach((m) => items.push({ tipo: "momento", texto: m[1] }));

      // Actividades (primera línea de cada actividad)
      const actMatches = [...raw.matchAll(/"actividades"\s*:\s*"((?:[^"\\]|\\.)*)"/g)];
      actMatches.forEach((m) => {
        const firstLine = m[1]
          .replace(/\\n/g, "\n")
          .split("\n")
          .find((l) => l.trim().length > 10);
        if (firstLine) items.push({ tipo: "actividad", texto: firstLine.replace(/^-\s*/, "").trim() });
      });

      return items;
    };

    const previewItems = extractPreview(streamContent);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        {/* Blobs de fondo — siempre sutiles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.07] animate-pulse"
            style={{ background: "var(--accent-primary)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-[0.07] animate-pulse"
            style={{ background: "var(--accent-secondary)", animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse"
              style={{
                background: "color-mix(in srgb, var(--accent-primary) 15%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent-primary) 35%, transparent)",
              }}
            >
              <Sparkles size={28} style={{ color: "var(--accent-primary)" }} />
            </div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Generando tu planeación</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              La IA está construyendo la Matriz Didáctica completa…
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {streamStatus}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--accent-primary-light)" }}>
                {Math.round(streamProgress)}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full"
              style={{ background: "var(--border-glass)" }}
            >
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${streamProgress}%`,
                  background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                  boxShadow: streamProgress > 10 ? "var(--shadow-glow)" : "none",
                }}
              />
            </div>
          </div>

          {/* Preview humanizada */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-glass)",
              minHeight: "220px",
              maxHeight: "260px",
              overflowY: "auto",
            }}
          >
            {previewItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
                />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Esperando respuesta de la IA…
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {previewItems.map((item, i) => {
                  if (item.tipo === "titulo") {
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-lg leading-none mt-0.5">📋</span>
                        <div>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Título del proyecto
                          </p>
                          <p
                            className="text-sm font-semibold leading-snug"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.texto}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  if (item.tipo === "momento") {
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{
                          background: "color-mix(in srgb, var(--accent-primary) 10%, transparent)",
                          border: "1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)",
                        }}
                      >
                        <span className="text-sm">🔷</span>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "var(--accent-primary-light)" }}
                        >
                          {item.texto}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="flex items-start gap-2 pl-2">
                      <span
                        className="text-xs mt-1 shrink-0"
                        style={{ color: "var(--accent-success)" }}
                      >
                        ✓
                      </span>
                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.texto}
                      </p>
                    </div>
                  );
                })}
                {/* Cursor parpadeante al final */}
                <span
                  className="inline-block w-2 h-3.5 align-middle animate-pulse rounded-sm"
                  style={{ background: "var(--accent-primary)" }}
                />
              </div>
            )}
          </div>

          {/* Nota inferior */}
          <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
            Esto puede tomar entre 20 y 40 segundos &mdash; no cierres esta ventana
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="animate-fade-in">
      {/* Back */}
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/planning"
          className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Regresar a Planeaciones
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Nueva Planeación</h1>
        <p className="text-[var(--text-secondary)]">
          Formato NEM — Matriz Multidimensional e Integradora
        </p>
      </div>

      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-2">
          {STEP_LABELS.map((label, idx) => (
            <React.Fragment key={idx}>
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  idx === step
                    ? "bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border border-[var(--accent-primary)]/40"
                    : idx < step
                    ? "bg-[var(--accent-success)]/20 text-[var(--accent-success)] border border-[var(--accent-success)]/30"
                    : "text-[var(--text-muted)] border border-[var(--border-glass)]"
                }`}
              >
                {idx < step ? <Check size={14} /> : <span className="w-4 text-center">{idx + 1}</span>}
                <span className="hidden sm:inline">{label}</span>
              </div>
              {idx < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-px ${idx < step ? "bg-[var(--accent-success)]/30" : "bg-[var(--border-glass)]"}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/30 text-[var(--accent-danger)]">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* ──── STEP 0: Identificación ──── */}
      {step === 0 && (
        <div className="space-y-6">
          {/* Mode toggle */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Users size={20} className="text-[var(--accent-primary)]" />
              Asignación del Grupo
            </h2>
            <div className="flex gap-3 mb-5">
              <button
                onClick={() => setIsStandalone(false)}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  !isStandalone
                    ? "bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40 text-[var(--accent-primary)]"
                    : "border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/30"
                }`}
              >
                Grupo existente
              </button>
              <button
                onClick={() => setIsStandalone(true)}
                className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                  isStandalone
                    ? "bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40 text-[var(--accent-primary)]"
                    : "border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/30"
                }`}
              >
                Modo independiente
              </button>
            </div>

            {!isStandalone ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Grupo</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="glass-input w-full"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.grade?.name} — {g.name} {g.section}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Materia</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="glass-input w-full"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Nivel educativo</label>
                  <select
                    value={standaloneLevel}
                    onChange={(e) => setStandaloneLevel(e.target.value as NivelEducativo)}
                    className="glass-input w-full"
                  >
                    <option value="PREESCOLAR">Preescolar</option>
                    <option value="PRIMARIA">Primaria</option>
                    <option value="SECUNDARIA">Secundaria</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Grado</label>
                  <select
                    value={standaloneGradeOrder}
                    onChange={(e) => setStandaloneGradeOrder(Number(e.target.value))}
                    className="glass-input w-full"
                  >
                    {[1, 2, 3, 4, 5, 6].map((g) => (
                      <option key={g} value={g}>{g}°</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Periodo */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Settings2 size={20} className="text-[var(--accent-primary)]" />
              Datos del Proyecto
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Periodo del Proyecto <span className="text-[var(--accent-danger)]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej. 8 AL 19 DE JUNIO DE 2026"
                  value={periodoProyecto}
                  onChange={(e) => setPeriodoProyecto(e.target.value)}
                  className="glass-input w-full"
                />
              </div>
            </div>
          </div>

          {/* Modalidad */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Layers size={20} className="text-[var(--accent-primary)]" />
              Metodología de Trabajo <span className="text-[var(--accent-danger)]">*</span>
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {catalogo?.metodologias.map((met) => {
                const Icon = PlanningModalidadIcons[met.id] || BookOpen;
                const isSelected = modalidad === met.id;
                return (
                  <button
                    key={met.id}
                    onClick={() => setModalidad(met.id as PlanningModalidad)}
                    className={`p-4 rounded-xl border text-left transition-all group ${
                      isSelected
                        ? "bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/50 shadow-glow"
                        : "border-[var(--border-glass)] hover:border-[var(--accent-primary)]/30"
                    }`}
                  >
                    <Icon
                      size={22}
                      className={`mb-2 ${isSelected ? "text-[var(--accent-primary)]" : "text-[var(--text-secondary)]"}`}
                    />
                    <p className={`text-sm font-semibold ${isSelected ? "text-[var(--accent-primary)]" : "text-[var(--text-primary)]"}`}>
                      {met.siglas}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mt-1">{met.nombre}</p>
                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-[var(--accent-primary)]/20">
                        <p className="text-xs text-[var(--text-secondary)] line-clamp-3">{met.definicion}</p>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
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
                      
                      const pdaText = pdaObj?.[pdaKey] || pdaObj?.["grado_1"] || "";

                      if (!pdaText) return <p className="text-sm text-[var(--text-muted)]">No hay PDA disponible para este grado.</p>;

                      return (
                        <label className="flex items-start gap-3 cursor-pointer p-2 rounded hover:bg-[var(--bg-panel)] transition-colors">
                          <input 
                            type="radio" 
                            name="pda_selection"
                            className="mt-1"
                            checked={addingPdaLiteral === pdaText}
                            onChange={() => setAddingPdaLiteral(pdaText)}
                          />
                          <span className="text-sm text-[var(--text-secondary)] italic leading-relaxed">{pdaText}</span>
                        </label>
                      );
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
                onChange={(e) => setProblematicaCustom(e.target.value)}
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
              onChange={(e) => setProposito(e.target.value)}
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
            <div className="space-y-2">
              {catalogo.catalogosOperativos.ajustesRazonables.map((aj) => {
                const sel = ajustesSeleccionados.includes(aj);
                return (
                  <button
                    key={aj}
                    onClick={() => toggleMulti(aj, ajustesSeleccionados, setAjustesSeleccionados)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                      sel
                        ? "bg-[var(--accent-warning)]/15 border-[var(--accent-warning)]/40 text-[var(--text-primary)]"
                        : "border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-warning)]/30"
                    }`}
                  >
                    {sel && <Check size={14} className="inline mr-2 text-[var(--accent-warning)]" />}
                    {aj}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actividades PMC */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
              Actividades PMC
            </h2>
            <div className="space-y-2">
              {catalogo.catalogosOperativos.actividadesPmc.map((pmc) => {
                const sel = pmcSeleccionados.includes(pmc);
                return (
                  <button
                    key={pmc}
                    onClick={() => toggleMulti(pmc, pmcSeleccionados, setPmcSeleccionados)}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                      sel
                        ? "bg-[var(--accent-primary)]/15 border-[var(--accent-primary)]/40 text-[var(--text-primary)]"
                        : "border-[var(--border-glass)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)]/30"
                    }`}
                  >
                    {sel && <Check size={14} className="inline mr-2 text-[var(--accent-primary)]" />}
                    {pmc}
                  </button>
                );
              })}
            </div>
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
                    <span className="text-[var(--text-primary)]">{periodoProyecto || "—"}</span>
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
                    <span className="text-[var(--text-primary)]">{ajustesSeleccionados.length > 0 ? `${ajustesSeleccionados.length} seleccionado(s)` : "—"}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-[var(--text-secondary)] w-28 shrink-0">PMC:</span>
                    <span className="text-[var(--text-primary)]">{pmcSeleccionados.length > 0 ? `${pmcSeleccionados.length} seleccionado(s)` : "—"}</span>
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

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <button
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="glass-button-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        {step < 3 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            disabled={!canProceed()}
            className="glass-button flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="glass-button flex items-center gap-2 disabled:opacity-60"
          >
            <Sparkles size={16} />
            Generar Planeación
          </button>
        )}
      </div>
    </div>
  );
}
