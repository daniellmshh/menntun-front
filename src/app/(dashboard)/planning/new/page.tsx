"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Compass,
  AlertCircle,
  Check,
  GraduationCap,
  Calendar,
  Layers,
  BookOpen,
} from "lucide-react";
import api from "@/lib/api/axios";
import { generatePlanning } from "@/modules/planning/services/planning.service";
import {
  PlanningModalidad,
  CampoFormativo,
  EjeArticulador,
  NivelEducativo,
} from "@/modules/planning/types";
import {
  PlanningModalidadLabels,
  PlanningModalidadIcons,
  CampoFormativoLabels,
  EjeArticuladorLabels,
} from "@/modules/planning/constants";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";

export default function NewPlanningPage() {
  const router = useRouter();
  const { language } = useLanguageStore();
  const t = translations[language];

  // Form states
  const [contextoInicial, setContextoInicial] = useState("");
  const [selectedModalidad, setSelectedModalidad] = useState<PlanningModalidad | null>(null);
  const [selectedCampoFormativo, setSelectedCampoFormativo] = useState<CampoFormativo | null>(null);
  const [selectedEjes, setSelectedEjes] = useState<EjeArticulador[]>([]);
  const [isStandalone, setIsStandalone] = useState(false);

  // Integrated mode states
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  // Standalone mode states
  const [standaloneLevel, setStandaloneLevel] = useState<NivelEducativo>(NivelEducativo.PREESCOLAR);
  const [standaloneGradeOrder, setStandaloneGradeOrder] = useState<number>(1);

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Fetch Academic data
  useEffect(() => {
    const fetchAcademicData = async () => {
      try {
        const [groupsRes, subjectsRes] = await Promise.all([
          api.get("/academic/groups"),
          api.get("/academic/subjects"),
        ]);
        const fetchedGroups = groupsRes.data?.data || [];
        const fetchedSubjects = subjectsRes.data?.data || [];
        setGroups(fetchedGroups);
        setSubjects(fetchedSubjects);

        // If no groups/subjects exist, default to standalone
        if (fetchedGroups.length === 0 || fetchedSubjects.length === 0) {
          setIsStandalone(true);
        } else {
          setSelectedGroupId(fetchedGroups[0].id);
          setSelectedSubjectId(fetchedSubjects[0].id);
        }
      } catch (err) {
        console.error("Error fetching academic data for planning:", err);
        setIsStandalone(true);
      }
    };
    fetchAcademicData();
  }, []);

  // Loading text rotation
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4);
    }, 7000);
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    "Analizando contexto y buscando contenidos en el programa de estudios SEP...",
    "Generando propuesta didáctica basada en la Nueva Escuela Mexicana...",
    "Estructurando fases del proyecto y recursos sugeridos...",
    "Casi listo! Finalizando la planeación didáctica con IA...",
  ];

  const handleToggleEje = (eje: EjeArticulador) => {
    if (selectedEjes.includes(eje)) {
      setSelectedEjes((prev) => prev.filter((item) => item !== eje));
    } else {
      setSelectedEjes((prev) => [...prev, eje]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (contextoInicial.trim().length < 20) {
      setError(language === "es" ? "El contexto inicial debe tener al menos 20 caracteres." : "The initial context must be at least 20 characters.");
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        contextoInicial,
      };

      if (selectedModalidad) payload.modalidad = selectedModalidad;
      if (selectedCampoFormativo) payload.campoFormativo = selectedCampoFormativo;
      if (selectedEjes.length > 0) payload.ejesArticuladores = selectedEjes;

      if (isStandalone) {
        payload.standaloneLevel = standaloneLevel;
        payload.standaloneGradeOrder = standaloneGradeOrder;
      } else {
        payload.groupId = selectedGroupId;
        payload.subjectId = selectedSubjectId;
      }

      const res = await generatePlanning(payload);

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.data?.planning?.id) {
        // Guardar sugerencia temporal en sessionStorage para mostrarla en la vista de detalle
        if (res.data.sugerenciaIA) {
          sessionStorage.setItem(`sugerencia_ia_${res.data.planning.id}`, JSON.stringify(res.data.sugerenciaIA));
        }
        router.push(`/planning/${res.data.planning.id}`);
      } else {
        setError(language === "es" ? "Ocurrió un error inesperado al generar la planeación." : "An unexpected error occurred while generating the plan.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error generating planning:", err);
      setError(err?.response?.data?.error || err.message || "Failed to generate plan");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-4">
        <Link
          href="/planning"
          className="p-2 rounded-lg border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.08] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="text-[var(--accent-primary)]" size={24} />
            <span>
              {language === "es" ? "Nueva Planeación con IA" : "New AI-Powered Lesson Plan"}
            </span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === "es"
              ? "Diseña un proyecto de clase adaptado a la Nueva Escuela Mexicana mediante inteligencia artificial y RAG"
              : "Design a classroom project aligned with the New Mexican School guidelines using AI & RAG"}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center space-y-6 animate-pulse border border-[var(--border-glass)] min-h-[400px]">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-[var(--border-glass)] border-t-[var(--accent-primary)] border-r-[var(--accent-secondary)] animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[var(--accent-secondary)]" size={20} />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="font-bold text-lg text-[var(--text-primary)]">
              {language === "es" ? "Generando Planeación..." : "Generating Plan..."}
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {loadingMessages[loadingStep]}
            </p>
            <p className="text-[10px] text-[var(--text-muted)] italic mt-4">
              {language === "es"
                ? "Este proceso puede demorar hasta 30 segundos mientras buscamos los mejores contenidos SEP."
                : "This process may take up to 30 seconds as we search for the best SEP curriculum contents."}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/35 text-[var(--accent-danger)] text-sm flex items-center gap-3">
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Contexto Inicial */}
          <div className="glass-panel p-6 border border-[var(--border-glass)] space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)]">
                  {language === "es" ? "1. Contexto Inicial de la Planeación" : "1. Initial Planning Context"}
                </label>
                <span className="text-xs text-[var(--text-secondary)]">
                  {language === "es"
                    ? "Describe de qué quieres tratar tu clase, intereses o problemáticas de tus estudiantes"
                    : "Describe what your class is about, students' interests, or classroom problems"}
                </span>
              </div>
              <span className={`text-xs font-mono font-bold ${contextoInicial.trim().length >= 20 ? "text-[var(--accent-success)]" : "text-[var(--text-muted)]"}`}>
                {contextoInicial.trim().length} / 20 min
              </span>
            </div>

            <textarea
              value={contextoInicial}
              onChange={(e) => setContextoInicial(e.target.value)}
              placeholder={
                language === "es"
                  ? "Ej: Quiero hacer un proyecto sobre el cuidado de los dientes porque mis alumnos comen muchos dulces y hemos notado caries..."
                  : "e.g., I want to do a project about dental hygiene because my students eat a lot of candy and we have noticed cavities..."
              }
              className="glass-input w-full min-h-[120px] font-sans text-sm focus:border-[var(--accent-primary)]"
              required
            />
          </div>

          {/* Selector de Modalidades */}
          <div className="glass-panel p-6 border border-[var(--border-glass)] space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)]">
                {language === "es" ? "2. Modalidad Pedagógica (NEM)" : "2. Pedagogical Modality (NEM)"}
              </label>
              <span className="text-xs text-[var(--text-secondary)]">
                {language === "es"
                  ? "Selecciona la modalidad para estructurar tu planeación (opcional, la IA sugerirá una si no la seleccionas)"
                  : "Select the modality to structure your plan (optional, AI will suggest one if left empty)"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(PlanningModalidadLabels).map((key) => {
                const enumKey = key as PlanningModalidad;
                const Icon = PlanningModalidadIcons[enumKey] || Compass;
                const isSelected = selectedModalidad === enumKey;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedModalidad(isSelected ? null : enumKey)}
                    className={`p-4 rounded-xl border text-left flex gap-4 transition-all duration-300 relative group overflow-hidden
                      ${
                        isSelected
                          ? "bg-[hsla(263,90%,60%,0.1)] border-[var(--accent-primary)] shadow-glow"
                          : "border-[var(--border-glass)] bg-white/[0.01] hover:bg-white/[0.04] hover:border-[var(--border-glass)]"
                      }
                    `}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110
                      ${isSelected ? "bg-[var(--accent-primary)] text-white" : "bg-white/[0.04] text-[var(--text-secondary)]"}`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                        <span>{PlanningModalidadLabels[key]}</span>
                        {isSelected && <Check size={14} className="text-[var(--accent-primary-light)]" />}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {enumKey === PlanningModalidad.PROYECTOS && (language === "es" ? "Proyectos comunitarios u orientados a resolver problemas." : "Community or problem-oriented projects.")}
                        {enumKey === PlanningModalidad.ABJ && (language === "es" ? "Aprendizaje basado en juegos didácticos interactivos." : "Learning based on interactive educational games.")}
                        {enumKey === PlanningModalidad.CENTROS_INTERES && (language === "es" ? "Basado en los intereses de los niños organizados en temas." : "Based on children's interests organized into topics.")}
                        {enumKey === PlanningModalidad.TALLERES_CRITICOS && (language === "es" ? "Investigación activa, talleres creativos y pensamiento analítico." : "Active research, creative workshops, and analytical thinking.")}
                        {enumKey === PlanningModalidad.RINCONES_APRENDIZAJE && (language === "es" ? "Espacios físicos delimitados dentro del aula con fines específicos." : "Physical delimited areas inside the classroom with specific goals.")}
                        {enumKey === PlanningModalidad.UNIDADES_DIDACTICAS && (language === "es" ? "Secuencias de aprendizaje estructuradas temáticamente." : "Thematically structured learning sequences.")}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Campos Formativos */}
          <div className="glass-panel p-6 border border-[var(--border-glass)] space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)]">
                {language === "es" ? "3. Campo Formativo (NEM)" : "3. Formative Field (NEM)"}
              </label>
              <span className="text-xs text-[var(--text-secondary)]">
                {language === "es"
                  ? "Selecciona el área del conocimiento a la cual pertenece este proyecto (opcional)"
                  : "Select the area of knowledge to which this project belongs (optional)"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(CampoFormativoLabels).map((key) => {
                const enumKey = key as CampoFormativo;
                const isSelected = selectedCampoFormativo === enumKey;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedCampoFormativo(isSelected ? null : enumKey)}
                    className={`p-4 rounded-xl border text-left flex gap-3 items-center transition-all duration-300 relative group
                      ${
                        isSelected
                          ? "bg-[hsla(190,95%,50%,0.05)] border-[var(--accent-secondary)]"
                          : "border-[var(--border-glass)] bg-white/[0.01] hover:bg-white/[0.04]"
                      }
                    `}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                      ${isSelected ? "bg-[var(--accent-secondary)] text-black" : "bg-white/[0.04] text-[var(--text-secondary)]"}`}
                    >
                      <BookOpen size={16} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-[var(--text-primary)] flex items-center justify-between">
                        <span>{CampoFormativoLabels[key]}</span>
                        {isSelected && <Check size={14} className="text-[var(--accent-secondary)]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector Múltiple de Ejes Articuladores */}
          <div className="glass-panel p-6 border border-[var(--border-glass)] space-y-4">
            <div>
              <label className="block text-sm font-bold text-[var(--text-primary)]">
                {language === "es" ? "4. Ejes Articuladores" : "4. Articulating Axes"}
              </label>
              <span className="text-xs text-[var(--text-secondary)]">
                {language === "es"
                  ? "Selecciona uno o más ejes de integración de saberes de la NEM (opcional)"
                  : "Select one or more axes of knowledge integration of the NEM (optional)"}
              </span>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {Object.keys(EjeArticuladorLabels).map((key) => {
                const enumKey = key as EjeArticulador;
                const isSelected = selectedEjes.includes(enumKey);

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleToggleEje(enumKey)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold select-none border transition-all duration-200 flex items-center gap-2
                      ${
                        isSelected
                          ? "bg-[var(--accent-primary)]/15 text-[var(--accent-primary-light)] border-[var(--accent-primary)]/50 shadow-glow"
                          : "bg-white/[0.02] text-[var(--text-secondary)] border-[var(--border-glass)] hover:bg-white/[0.06] hover:border-[var(--text-muted)]"
                      }
                    `}
                  >
                    <span>{EjeArticuladorLabels[key]}</span>
                    {isSelected && <Check size={12} className="text-[var(--accent-primary-light)]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Datos de Identificación (Integrated vs Standalone) */}
          <div className="glass-panel p-6 border border-[var(--border-glass)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-glass)] pb-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)]">
                  {language === "es" ? "5. Identificación del Grupo / Nivel" : "5. Group / Level Identification"}
                </label>
                <span className="text-xs text-[var(--text-secondary)]">
                  {language === "es"
                    ? "Elige si la planeación se asocia a la estructura escolar o de forma libre"
                    : "Choose whether the plan associates with the school structure or is standalone"}
                </span>
              </div>

              {/* Mode Toggle Switch */}
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold transition-colors ${!isStandalone ? "text-[var(--accent-primary-light)]" : "text-[var(--text-muted)]"}`}>
                  {language === "es" ? "Integrado a Estructura" : "Integrated to School"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsStandalone(!isStandalone)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none border border-white/10
                    ${isStandalone ? "bg-[var(--accent-primary)]" : "bg-white/[0.04]"}`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform shadow
                      ${isStandalone ? "right-1" : "left-1"}`}
                  />
                </button>
                <span className={`text-xs font-bold transition-colors ${isStandalone ? "text-[var(--accent-primary-light)]" : "text-[var(--text-muted)]"}`}>
                  {language === "es" ? "Modo Libre (Manual)" : "Standalone Mode"}
                </span>
              </div>
            </div>

            {isStandalone ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {/* Standalone Level */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {language === "es" ? "Nivel Educativo" : "Educational Stage"}
                  </label>
                  <select
                    value={standaloneLevel}
                    onChange={(e) => setStandaloneLevel(e.target.value as NivelEducativo)}
                    className="glass-input w-full bg-[var(--bg-surface)] text-sm h-[46px]"
                  >
                    <option value={NivelEducativo.PREESCOLAR}>
                      {language === "es" ? "Preescolar" : "Preschool"}
                    </option>
                    <option value={NivelEducativo.PRIMARIA}>
                      {language === "es" ? "Primaria" : "Primary"}
                    </option>
                    <option value={NivelEducativo.SECUNDARIA}>
                      {language === "es" ? "Secundaria" : "Secondary"}
                    </option>
                  </select>
                </div>

                {/* Standalone Order */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {language === "es" ? "Grado Escolar (Orden)" : "Grade Order"}
                  </label>
                  <select
                    value={standaloneGradeOrder}
                    onChange={(e) => setStandaloneGradeOrder(parseInt(e.target.value))}
                    className="glass-input w-full bg-[var(--bg-surface)] text-sm h-[46px]"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num}° {language === "es" ? "Grado" : "Grade"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {/* Integrated Group */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {language === "es" ? "Grupo Escolar" : "Class Group"}
                  </label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => setSelectedGroupId(e.target.value)}
                    className="glass-input w-full bg-[var(--bg-surface)] text-sm h-[46px]"
                    required
                  >
                    {groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.grade?.name || ""} - {group.name} {group.section ? `(${group.section})` : ""} - {group.schoolYear?.name || ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Integrated Subject */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {language === "es" ? "Materia" : "Subject"}
                  </label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="glass-input w-full bg-[var(--bg-surface)] text-sm h-[46px]"
                    required
                  >
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/planning"
              className="glass-button-secondary px-6 py-3 text-sm font-semibold rounded-xl"
            >
              {language === "es" ? "Cancelar" : "Cancel"}
            </Link>
            <button
              type="submit"
              disabled={contextoInicial.trim().length < 20}
              className="glass-button px-8 py-3 text-sm font-bold rounded-xl flex items-center gap-2 shadow-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={16} />
              <span>{language === "es" ? "Generar planeación con IA" : "Generate Lesson Plan with AI"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
