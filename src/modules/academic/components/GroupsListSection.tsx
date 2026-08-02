"use client";

import { ChevronRight, Edit2, Layers, Plus, Search, Trash2 } from "lucide-react";
import Loader from "@/components/shared/Loader";
import type {
  AcademicGroup,
  Grade,
  GroupTranslations,
  School,
  SchoolYear,
} from "../types";

interface GroupsListSectionProps {
  groups: AcademicGroup[];
  schools: School[];
  grades: Grade[];
  schoolYears: SchoolYear[];
  loading: boolean;
  search: string;
  filterSchoolId: string;
  filterGradeId: string;
  filterYearId: string;
  isSuperAdmin: boolean;
  canManage: boolean;
  translations: GroupTranslations;
  onSearchChange: (value: string) => void;
  onSchoolFilterChange: (value: string) => void;
  onGradeFilterChange: (value: string) => void;
  onYearFilterChange: (value: string) => void;
  onCreate: () => void;
  onEdit: (group: AcademicGroup) => void;
  onDetail: (group: AcademicGroup) => void;
  onDelete: (group: AcademicGroup) => void;
}

export default function GroupsListSection({
  groups,
  schools,
  grades,
  schoolYears,
  loading,
  search,
  filterSchoolId,
  filterGradeId,
  filterYearId,
  isSuperAdmin,
  canManage,
  translations: t,
  onSearchChange,
  onSchoolFilterChange,
  onGradeFilterChange,
  onYearFilterChange,
  onCreate,
  onEdit,
  onDetail,
  onDelete,
}: GroupsListSectionProps) {
  const currentFilterSchool = isSuperAdmin ? filterSchoolId : "";
  const displayGrades = currentFilterSchool
    ? grades.filter((grade) => grade.schoolId === currentFilterSchool)
    : grades;
  const displayYears = currentFilterSchool
    ? schoolYears.filter((year) => year.schoolId === currentFilterSchool)
    : schoolYears;
  const filtered = groups.filter((group) => {
    const searchValue = search.toLowerCase();
    return (
      (group.name.toLowerCase().includes(searchValue) ||
        (group.grade?.name || "").toLowerCase().includes(searchValue) ||
        (group.school?.name || "").toLowerCase().includes(searchValue)) &&
      (!filterSchoolId || group.schoolId === filterSchoolId) &&
      (!filterGradeId || group.gradeId === filterGradeId) &&
      (!filterYearId || group.schoolYearId === filterYearId)
    );
  });

  return (
    <>
+        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow shrink-0">
              <Layers size={24} className="text-white" />
            </div>
            <div>
              <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
                {t.title}
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t.subtitle}</p>
            </div>
          </div>

        {canManage && (
          <button
            onClick={onCreate}
            className="glass-button self-start md:self-auto flex items-center gap-2"
          >
            <Plus size={16} />
            {t.createBtn}
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl glass-panel border border-[var(--border-glass)]">
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Buscar grupo, grado..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full !pl-10 glass-input text-sm"
          />
        </div>

        {/* School selector (Super Admin) */}
        {isSuperAdmin && (
          <select
            value={filterSchoolId}
            onChange={(e) => onSchoolFilterChange(e.target.value)}
            className="glass-input text-sm"
          >
            <option value="">Colegios (Todos)</option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        )}

        {/* Grade catalog selector */}
        <select
          value={filterGradeId}
          onChange={(e) => onGradeFilterChange(e.target.value)}
          className="glass-input text-sm"
        >
          <option value="">Grados (Todos)</option>
          {displayGrades.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        {/* School Year selector */}
        <select
          value={filterYearId}
          onChange={(e) => onYearFilterChange(e.target.value)}
          className="glass-input text-sm"
        >
          <option value="">Ciclos Escolares (Todos)</option>
          {displayYears.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name} {y.active ? "(Activo)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Table grid */}
      <div className="flex-1 glass-panel border border-[var(--border-glass)] rounded-2xl overflow-hidden shadow-main flex flex-col">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-glass)] bg-white/5">
                {isSuperAdmin && (
                  <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                    {t.table.school}
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t.table.name}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t.table.grade}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t.table.schoolYear}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t.table.teachers}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t.table.capacity}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">
                  {t.table.actions}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-glass)]">
              {loading ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 7 : 6}
                    className="p-0 border-0"
                  >
                    <Loader minHeight="200px" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 7 : 6}
                    className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]"
                  >
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filtered.map((g) => {
                  const enrollCount = g._count?.enrollments ?? 0;
                  const maxCap = g.maxStudents || 0;
                  const hasCap = maxCap > 0;
                  const isFull = hasCap && enrollCount >= maxCap;

                  return (
                    <tr key={g.id} className="hover:bg-white/5 transition-colors group">
                      {isSuperAdmin && (
                        <td className="px-6 py-4.5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            {g.school?.name || "Desconocido"}
                          </div>
                          <div className="text-xs text-[var(--text-muted)] mt-0.5">
                            {g.school?.code || ""}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {g.name}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-[var(--border-glass)] text-[var(--text-secondary)]">
                          {g.grade?.name || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        <span className="font-semibold">{g.schoolYear?.name || "—"}</span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                        <span className="font-semibold">{g._count?.teachers ?? 0}</span>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1 w-24">
                          <span className="text-xs font-semibold text-[var(--text-secondary)]">
                            {enrollCount} / {maxCap || "∞"}
                          </span>
                          {hasCap && (
                            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden border border-[var(--border-glass)]">
                              <div
                                className={`h-full rounded-full ${
                                  isFull ? "bg-[var(--accent-danger)]" : "bg-[var(--accent-primary)]"
                                }`}
                                style={{ width: `${Math.min(100, (enrollCount / maxCap) * 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onDetail(g)}
                            className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 text-xs font-semibold"
                          >
                            <span>Detalle</span>
                            <ChevronRight size={14} />
                          </button>
                          {canManage && g.schoolYear?.active !== false && (
                            <>
                              <button
                                onClick={() => onEdit(g)}
                                className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                title="Editar Grupo"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => onDelete(g)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-colors"
                                title="Eliminar Grupo"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
