"use client";

import { BookOpen, Layers, Settings2, Users } from "lucide-react";
import { PlanningModalidad, NivelEducativo, PlanningCatalogo } from "@/modules/planning/types";
import { PlanningModalidadIcons } from "@/modules/planning/constants";

interface AcademicGroupOption { id: string; name: string; section?: string | null; grade?: { name?: string; order?: number } | null; }
interface AcademicSubjectOption { id: string; name: string; }

interface PlanningIdentificationStepProps {
  catalogo: PlanningCatalogo | null;
  groups: AcademicGroupOption[];
  subjects: AcademicSubjectOption[];
  isStandalone: boolean;
  selectedGroupId: string;
  selectedSubjectId: string;
  standaloneLevel: NivelEducativo;
  standaloneGradeOrder: number;
  startDate: string;
  endDate: string;
  activitiesPerDay: number;
  modalidad: PlanningModalidad;
  onGroupChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onStandaloneLevelChange: (value: NivelEducativo) => void;
  onStandaloneGradeOrderChange: (value: number) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onActivitiesPerDayChange: (value: number) => void;
  onModalidadChange: (value: PlanningModalidad) => void;
}

export default function PlanningIdentificationStep(props: PlanningIdentificationStepProps) {
  const { catalogo, groups, subjects, isStandalone, selectedGroupId, selectedSubjectId, standaloneLevel, standaloneGradeOrder, startDate, endDate, activitiesPerDay, modalidad, onGroupChange, onSubjectChange, onStandaloneLevelChange, onStandaloneGradeOrderChange, onStartDateChange, onEndDateChange, onActivitiesPerDayChange, onModalidadChange } = props;
  return (
        <div className="space-y-6">
          {/* Mode toggle */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Users size={20} className="text-[var(--accent-primary)]" />
              Asignación del Grupo
            </h2>


            {!isStandalone ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Grupo</label>
                  <select
                    value={selectedGroupId}
                    onChange={(e) => {
                      onGroupChange(e.target.value);
                    }}
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
                    onChange={(e) => onSubjectChange(e.target.value)}
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
                    onChange={(e) => onStandaloneLevelChange(e.target.value as NivelEducativo)}
                    className="glass-input w-full"
                  >
                    <option value="PREESCOLAR">Preescolar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">Grado</label>
                  <select
                    value={standaloneGradeOrder}
                    onChange={(e) => {
                      onStandaloneGradeOrderChange(Number(e.target.value));
                    }}
                    className="glass-input w-full"
                  >
                    {[1, 2, 3].map((g) => (
                      <option key={g} value={g}>{g}°</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Fechas y Actividades */}
          <div className="glass-panel p-6">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Settings2 size={20} className="text-[var(--accent-primary)]" />
              Datos del Proyecto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Fecha Inicio <span className="text-[var(--accent-danger)]">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  onClick={(e) => {
                    try {
                      if ('showPicker' in HTMLInputElement.prototype) {
                        (e.target as HTMLInputElement).showPicker();
                      }
                    } catch {}
                  }}
                  className="glass-input w-full [color-scheme:dark] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Fecha Fin <span className="text-[var(--accent-danger)]">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  onClick={(e) => {
                    try {
                      if ('showPicker' in HTMLInputElement.prototype) {
                        (e.target as HTMLInputElement).showPicker();
                      }
                    } catch {}
                  }}
                  className="glass-input w-full [color-scheme:dark] cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  Actividades / día <span className="text-[var(--accent-danger)]">*</span>
                </label>
                <select
                  value={activitiesPerDay}
                  onChange={(e) => onActivitiesPerDayChange(Number(e.target.value))}
                  className="glass-input w-full cursor-pointer"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'actividad' : 'actividades'}</option>
                  ))}
                </select>
              </div>
            </div>
            {startDate && endDate && (() => {
              const start = new Date(startDate);
              const end = new Date(endDate);
              const diffTime = end.getTime() - start.getTime();
              const diffDays = diffTime / (1000 * 3600 * 24);
              if (diffDays < 0) {
                return <p className="text-sm text-[var(--accent-danger)] mt-3">La fecha fin no puede ser anterior a la fecha inicio.</p>;
              }
              if (diffDays > 15) {
                return <p className="text-sm text-[var(--accent-danger)] mt-3">El proyecto no puede durar más de 15 días.</p>;
              }
              return null;
            })()}
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
                    onClick={() => onModalidadChange(met.id as PlanningModalidad)}
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
  );
}

