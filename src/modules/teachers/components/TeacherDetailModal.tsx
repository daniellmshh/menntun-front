"use client";

import { createPortal } from "react-dom";
import { Calendar, CheckSquare, Loader2, Lock, Mail, Phone, ToggleLeft, ToggleRight, X } from "lucide-react";
import { translations } from "@/lib/translations";
import type { SchoolModule, Teacher, TeacherDetailTab } from "../types";

interface TeacherDetailModalProps {
  detailTeacher: Teacher;
  detailTab: TeacherDetailTab;
  isAdmin: boolean;
  language: "en" | "es";
  schoolModules: SchoolModule[];
  schoolModulesLoading: boolean;
  teacherPermissions: string[];
  permissionsSubmitting: boolean;
  t: typeof translations.es;
  onClose: () => void;
  onTabChange: (tab: TeacherDetailTab) => void;
  onTogglePermission: (moduleName: string, isAllowed: boolean) => void;
}

export default function TeacherDetailModal({
  detailTeacher,
  detailTab,
  isAdmin,
  language,
  schoolModules,
  schoolModulesLoading,
  teacherPermissions,
  permissionsSubmitting,
  t,
  onClose,
  onTabChange,
  onTogglePermission,
}: TeacherDetailModalProps) {
  return createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel max-w-3xl w-full p-6 border border-[var(--border-glass)] relative flex flex-col max-h-[85vh] overflow-hidden animate-scale-up">
            <button
              onClick={() => onClose()}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            {/* Modal Title Banner */}
            <div className="flex items-center gap-4 border-b border-[var(--border-glass)] pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-lg uppercase shrink-0">
                {detailTeacher.firstName[0] || ""}{detailTeacher.lastName[0] || ""}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {detailTeacher.firstName} {detailTeacher.lastName}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {t.teachers.details.role}: {t.schools.users.roles.TEACHER} | {t.teachers.details.schoolName}: {detailTeacher.school?.name || detailTeacher.schoolId}
                </p>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-[var(--border-glass)] gap-6 pb-1">
              <button
                onClick={() => onTabChange("general")}
                className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                  ${detailTab === "general" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                {t.teachers.details.generalInfo}
              </button>
              {isAdmin && (
                <button
                  onClick={() => onTabChange("permissions")}
                  className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                    ${detailTab === "permissions" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                  `}
                >
                  {t.teachers.details.permissions}
                </button>
              )}
              <button
                onClick={() => onTabChange("assignments")}
                className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                  ${detailTab === "assignments" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                {t.teachers.details.assignments}
              </button>
            </div>

            {/* Tab content area (scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-6 custom-scrollbar" style={{ minHeight: "300px" }}>
              {/* TAB 1: General Info */}
              {detailTab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {language === "es" ? "Información de Contacto" : "Contact Details"}
                    </h3>
                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.teachers.table.email}</span>
                          <span className="text-sm text-[var(--text-primary)] font-mono">{detailTeacher.email}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.teachers.table.phone}</span>
                          <span className="text-sm text-[var(--text-primary)]">{detailTeacher.phone || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {language === "es" ? "Detalles Profesionales" : "Professional Details"}
                    </h3>
                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.teachers.table.employeeNumber}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                          {detailTeacher.teacherProfile?.employeeNumber || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.teachers.table.specialty}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {detailTeacher.teacherProfile?.specialty || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.teachers.modal.hireDateLabel}</span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {detailTeacher.teacherProfile?.hireDate
                            ? new Date(detailTeacher.teacherProfile.hireDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.teachers.table.status}</span>
                        <span className={`text-xs font-bold ${detailTeacher.active ? "text-[var(--accent-success)]" : "text-[var(--accent-danger)]"}`}>
                          {detailTeacher.active ? t.schools.status.active : t.schools.status.inactive}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Permissions (Admin only) */}
              {detailTab === "permissions" && isAdmin && (
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold">{t.teachers.modal.allowedModulesLabel}</h3>
                    <p className="text-xs text-[var(--text-secondary)]">{t.teachers.modal.allowedModulesSubtitle}</p>
                  </div>

                  {schoolModulesLoading ? (
                    <div className="py-12 flex justify-center">
                      <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-primary)]" />
                    </div>
                  ) : (
                    <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                              {t.schools.modules.colName}
                            </th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[180px]">
                              {language === "es" ? "Contratado (Escuela)" : "School Contracted"}
                            </th>
                            <th className="p-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-[150px] text-right">
                              {language === "es" ? "Acceso Permitido" : "Access Allowed"}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {schoolModules
                            .filter((sm) => !sm.isCore) // Only show optional modules
                            .map((sm) => {
                              const moduleKey = sm.module.toLowerCase();
                              const isAllowedForTeacher = teacherPermissions
                                .map((p) => p.toLowerCase())
                                .includes(moduleKey);

                              return (
                                <tr key={sm.module} className="hover:bg-white/[0.01]">
                                  <td className="p-3">
                                    <span className="font-semibold text-sm capitalize">
                                      {t.sidebar[moduleKey as keyof typeof t.sidebar] || sm.module}
                                    </span>
                                  </td>
                                  <td className="p-3">
                                    {sm.active ? (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-cyan-500/10 border-cyan-500/20 text-cyan-400">
                                        {t.schools.status.active}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border bg-rose-500/10 border-rose-500/20 text-rose-400">
                                        {t.schools.status.inactive}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex justify-end items-center">
                                      {sm.active ? (
                                        <button
                                          onClick={() => onTogglePermission(sm.module, isAllowedForTeacher)}
                                          disabled={permissionsSubmitting}
                                          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                          {isAllowedForTeacher ? (
                                            <ToggleRight size={32} className="text-[var(--accent-success)]" />
                                          ) : (
                                            <ToggleLeft size={32} className="text-[var(--text-muted)]" />
                                          )}
                                        </button>
                                      ) : (
                                        <div className="flex items-center gap-1 text-[var(--text-muted)] text-xs italic">
                                          <Lock size={12} />
                                          <span>{language === "es" ? "Sin Contratar" : "Locked"}</span>
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Academic Assignments */}
              {detailTab === "assignments" && (
                <div className="space-y-6 py-2">
                  {/* Groups Assignments */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <Calendar size={18} className="text-[var(--accent-primary)]" />
                      <span>{language === "es" ? "Grupos Asignados (Titular)" : "Assigned Groups (Homeroom)"}</span>
                    </h3>
                    
                    {!detailTeacher.teacherProfile?.groupAssignments ||
                    detailTeacher.teacherProfile.groupAssignments.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] italic pl-1">
                        {language === "es" ? "No es profesor titular de ningún grupo." : "Not assigned as homeroom teacher to any groups."}
                      </p>
                    ) : (
                      <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.class}</th>
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.level}</th>
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.schoolYear}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {detailTeacher.teacherProfile.groupAssignments.map((ga) => (
                              <tr key={ga.id} className="hover:bg-white/[0.01]">
                                <td className="p-2.5 text-sm font-semibold text-[var(--text-primary)]">
                                  {ga.group.name} - {ga.group.section}
                                </td>
                                <td className="p-2.5 text-xs text-[var(--text-secondary)]">{ga.group.grade.name}</td>
                                <td className="p-2.5 text-xs text-[var(--text-muted)] font-mono">{ga.group.schoolYear.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Subjects / Subject-Group Assignments */}
                  <div className="space-y-3">
                    <h3 className="text-base font-bold flex items-center gap-2">
                      <CheckSquare size={18} className="text-[var(--accent-secondary)]" />
                      <span>{language === "es" ? "Materias e Impartición" : "Subject Assignments"}</span>
                    </h3>

                    {!detailTeacher.teacherProfile?.subjectAssignments ||
                    detailTeacher.teacherProfile.subjectAssignments.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)] italic pl-1">
                        {language === "es" ? "No imparte ninguna materia asignada." : "No subjects assigned to teach."}
                      </p>
                    ) : (
                      <div className="glass-panel overflow-hidden border border-[var(--border-glass)]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-glass)] bg-white/[0.01]">
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.subject}</th>
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.class}</th>
                              <th className="p-2.5 text-xs font-bold text-[var(--text-muted)] uppercase">{t.teachers.details.level}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {detailTeacher.teacherProfile.subjectAssignments.map((sa) => (
                              <tr key={sa.id} className="hover:bg-white/[0.01]">
                                <td className="p-2.5 text-sm font-semibold text-[var(--text-primary)]">{sa.subject.name}</td>
                                <td className="p-2.5 text-xs text-[var(--text-secondary)]">
                                  {sa.group.name} - {sa.group.section}
                                </td>
                                <td className="p-2.5 text-xs text-[var(--text-muted)]">{sa.group.grade.name}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    ,
    document.body
  );
}

