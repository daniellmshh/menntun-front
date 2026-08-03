"use client";

import React, { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronRight,
  FileSpreadsheet,
  Layers,
  Search,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Upload,
  User,
  UserMinus,
  UserPlus,
  X,
  XCircle,
} from "lucide-react";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { ApiResponse, UserRole } from "@/types";
import type {
  AcademicGroup,
  GroupTranslations,
  Teacher,
} from "../types";
import GroupGeneralTab from "./GroupGeneralTab";

// ─── DETAILS DRAWER ──────────────────────────────────────────────────

interface SubjectRow {
  id: string;
  name: string;
  code: string | null;
  assigned: boolean;
  assignmentId: string | null;
  teacher: { id: string; user: { firstName: string; lastName: string } } | null;
}

interface StudentRow {
  studentProfileId: string;
  enrollmentNumber: string | null;
  firstName: string;
  lastName: string;
  email: string;
}

interface BulkImportResult {
  enrollmentNumber: string;
  status: "success" | "error";
  message: string;
}

interface BulkImportResponse {
  results: BulkImportResult[];
  summary: { total: number; successful: number; failed: number };
}

function getApiMessage(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("response" in error)) return undefined;
  const response = error.response;
  if (!response || typeof response !== "object" || !("data" in response)) return undefined;
  const data = response.data;
  if (!data || typeof data !== "object") return undefined;
  const { error: apiError, message } = data as { error?: unknown; message?: unknown };
  if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  if (typeof message === "string") return message;
  return typeof apiError === "string" ? apiError : undefined;
}

export default function GroupDetailDrawer({
  group: initialGroup,
  onClose,
  t,
}: {
  group: AcademicGroup;
  onClose: () => void;
  t: GroupTranslations;
}) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN;

  const [group, setGroup] = useState<AcademicGroup>(initialGroup);
  const [activeTab, setActiveTab] = useState<"general" | "teachers" | "subjects" | "students">("general");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignForm, setAssignForm] = useState({ teacherProfileId: "", isHomeroom: false });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Subjects tab state
  const [subjects, setSubjects] = useState<SubjectRow[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectTeacherMap, setSubjectTeacherMap] = useState<Record<string, string>>({});

  // Students tab state
  const [studentsData, setStudentsData] = useState<{ assigned: StudentRow[]; available: StudentRow[] } | null>(null);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [bulkImportText, setBulkImportText] = useState("");
  const [bulkImportResult, setBulkImportResult] = useState<BulkImportResult[] | null>(null);
  const [bulkImportSummary, setBulkImportSummary] = useState<{ total: number; successful: number; failed: number } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [showImportPanel, setShowImportPanel] = useState(false);

  const showAlert = (msg: string, type: "success" | "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchDetail = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<AcademicGroup>>(`/academic/groups/${group.id}`);
      setGroup(res.data.data);
    } catch {}
  }, [group.id]);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Teacher[]>>(`/teachers?schoolId=${group.schoolId}`);
      setTeachers(res.data.data || []);
    } catch {}
  }, [group.schoolId]);

  const fetchSubjects = useCallback(async () => {
    setSubjectsLoading(true);
    try {
      const res = await api.get<ApiResponse<SubjectRow[]>>(`/academic/groups/${group.id}/subjects`);
      setSubjects(res.data.data || []);
      // reset teacher overrides map
      const map: Record<string, string> = {};
      (res.data.data || []).forEach((s) => {
        if (s.teacher) map[s.id] = s.teacher.id;
      });
      setSubjectTeacherMap(map);
    } catch {}
    finally { setSubjectsLoading(false); }
  }, [group.id]);

  const fetchStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const res = await api.get<ApiResponse<{ assigned: StudentRow[]; available: StudentRow[] }>>(`/academic/groups/${group.id}/students`);
      setStudentsData(res.data.data);
    } catch {}
    finally { setStudentsLoading(false); }
  }, [group.id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchDetail();
      void fetchTeachers();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [fetchDetail, fetchTeachers]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeTab === "subjects") void fetchSubjects();
      if (activeTab === "students") void fetchStudents();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [activeTab, fetchSubjects, fetchStudents]);

  // ── Teacher tab ────────────────────────────────────────────────
  const handleAssignTeacher = async () => {
    if (!assignForm.teacherProfileId) return;
    setLoading(true);
    try {
      await api.post(`/academic/groups/${group.id}/teachers`, {
        teacherProfileId: assignForm.teacherProfileId,
        isHomeroom: assignForm.isHomeroom,
      });
      fetchDetail();
      setAssignForm({ teacherProfileId: "", isHomeroom: false });
      showAlert(t.alerts.successAssignTeacher, "success");
    } catch (error) {
      showAlert(getApiMessage(error) || t.alerts.errorAssignTeacher, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTeacher = async (teacherProfileId: string) => {
    if (!confirm(t.detail.removeConfirm)) return;
    setLoading(true);
    try {
      await api.delete(`/academic/groups/${group.id}/teachers/${teacherProfileId}`);
      fetchDetail();
      showAlert(t.alerts.successRemoveTeacher, "success");
    } catch {
      showAlert(t.alerts.errorRemoveTeacher, "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Subject tab ────────────────────────────────────────────────
  const handleToggleSubject = async (subj: SubjectRow) => {
    if (!isAdmin) return;
    if (subj.assigned) {
      try {
        await api.delete(`/academic/groups/${group.id}/subjects/${subj.id}`);
        showAlert(`Materia "${subj.name}" removida del grupo`, "success");
        fetchSubjects();
        fetchDetail();
      } catch (error) {
        showAlert(getApiMessage(error) || "Error al remover materia", "error");
      }
    } else {
      try {
        const payload: { subjectId: string; teacherProfileId?: string } = { subjectId: subj.id };
        if (subjectTeacherMap[subj.id]) payload.teacherProfileId = subjectTeacherMap[subj.id];
        await api.post(`/academic/groups/${group.id}/subjects`, payload);
        showAlert(`Materia "${subj.name}" asignada al grupo`, "success");
        fetchSubjects();
      } catch (error) {
        showAlert(getApiMessage(error) || "Error al asignar materia", "error");
      }
    }
  };

  // ── Student tab ────────────────────────────────────────────────
  const handleAssignStudent = async (studentProfileId: string) => {
    if (!isAdmin) return;
    setStudentsLoading(true);
    try {
      await api.post(`/academic/groups/${group.id}/students/bulk`, {
        students: [{ enrollmentNumber: studentsData?.available.find(s => s.studentProfileId === studentProfileId)?.enrollmentNumber }]
      });
      showAlert("Alumno asignado exitosamente", "success");
      fetchStudents();
      fetchDetail();
    } catch (error) {
      showAlert(getApiMessage(error) || "Error al asignar alumno", "error");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleRemoveStudent = async (studentProfileId: string) => {
    if (!isAdmin || !confirm("¿Quitar a este alumno del grupo?")) return;
    setStudentsLoading(true);
    try {
      await api.delete(`/academic/groups/${group.id}/students/${studentProfileId}`);
      showAlert("Alumno removido del grupo", "success");
      fetchStudents();
      fetchDetail();
    } catch (error) {
      showAlert(getApiMessage(error) || "Error al remover alumno", "error");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleBulkImportCSV = async () => {
    if (!isAdmin) return;
    let rows: { enrollmentNumber: string }[] = [];
    if (importFile) {
      const text = await importFile.text();
      rows = text.split("\n").slice(1).filter(Boolean).map(line => {
        const parts = line.split(",");
        return { enrollmentNumber: parts[0]?.trim() };
      }).filter(r => r.enrollmentNumber);
    } else if (bulkImportText.trim()) {
      rows = bulkImportText.split("\n").map(line => ({ enrollmentNumber: line.trim() })).filter(r => r.enrollmentNumber);
    }

    if (rows.length === 0) {
      showAlert("No hay números de matrícula para procesar", "error");
      return;
    }

    setImportLoading(true);
    setBulkImportResult(null);
    setBulkImportSummary(null);
    try {
      const res = await api.post<ApiResponse<BulkImportResponse>>(`/academic/groups/${group.id}/students/bulk`, { students: rows });
      const { results, summary } = res.data.data;
      setBulkImportResult(results);
      setBulkImportSummary(summary);
      fetchStudents();
      fetchDetail();
      showAlert(`${summary.successful} alumnos asignados. ${summary.failed} con error.`, summary.failed === 0 ? "success" : "error");
    } catch (error) {
      showAlert(getApiMessage(error) || "Error en importación masiva", "error");
    } finally {
      setImportLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "enrollment_number\n2026-001\n2026-002\n2026-003";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plantilla_asignacion_${group.name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const assignedIds = new Set(group.teachers?.map((t) => t.teacherProfileId) || []);
  const assignableTeachers = teachers.filter((t) => !assignedIds.has(t.teacherProfile?.id || ""));
  const homeroomTeacher = group.teachers?.find(t => t.isHomeroom);

  const filteredAvailable = studentsData?.available.filter(s =>
    `${s.firstName} ${s.lastName} ${s.enrollmentNumber} ${s.email}`.toLowerCase().includes(studentSearch.toLowerCase())
  ) ?? [];
  const filteredAssigned = studentsData?.assigned.filter(s =>
    `${s.firstName} ${s.lastName} ${s.enrollmentNumber} ${s.email}`.toLowerCase().includes(studentSearch.toLowerCase())
  ) ?? [];

  const TABS = [
    { key: "general", label: t.detail.generalTab },
    { key: "teachers", label: t.detail.teachersTab },
    { key: "subjects", label: "Materias" },
    { key: "students", label: t.detail.studentsTab },
  ] as const;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.5)" }}
    >
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-[var(--border-glass)] glass-panel shadow-main animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {group.name} — {group.grade?.name}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">{group.schoolYear?.name} · {group._count?.enrollments ?? 0} alumnos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-2 border-b border-[var(--border-glass)] bg-white/5 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-2 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                  : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          {alert && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
              alert.type === "success"
                ? "bg-[hsla(142,72%,45%,0.1)] border-[hsla(142,72%,45%,0.2)] text-[hsl(142,72%,60%)]"
                : "bg-[hsla(354,85%,56%,0.1)] border-[hsla(354,85%,56%,0.2)] text-[hsl(354,85%,70%)]"
            }`}>
              {alert.type === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {alert.msg}
            </div>
          )}

          {/* ── GENERAL TAB ── */}
          {activeTab === "general" && (
            <GroupGeneralTab
              group={group}
              homeroomTeacher={homeroomTeacher}
              t={t}
            />
          )}

          {/* ── TEACHERS TAB ── */}
          {activeTab === "teachers" && (
            <div className="space-y-5">
              {isAdmin && (
                <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-white/5 space-y-3">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                    <UserPlus size={16} className="text-[var(--accent-primary)]" />
                    {t.detail.addTeacher}
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    <select
                      value={assignForm.teacherProfileId}
                      onChange={(e) => setAssignForm({ ...assignForm, teacherProfileId: e.target.value })}
                      className="glass-input text-sm flex-1 min-w-[160px]"
                      disabled={loading}
                    >
                      <option value="">{t.detail.teacherSelectLabel}</option>
                      {assignableTeachers.map((t) => (
                        <option key={t.id} value={t.teacherProfile?.id || ""}>
                          {t.firstName} {t.lastName}
                        </option>
                      ))}
                    </select>
                    <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={assignForm.isHomeroom}
                        onChange={(e) => setAssignForm({ ...assignForm, isHomeroom: e.target.checked })}
                        className="rounded border-[var(--border-glass)] bg-black/40"
                      />
                      Titular
                    </label>
                  </div>
                  <button
                    onClick={handleAssignTeacher}
                    disabled={loading || !assignForm.teacherProfileId}
                    className="glass-button w-full text-xs py-2 disabled:opacity-50"
                  >
                    {t.detail.assignBtn}
                  </button>
                </div>
              )}
              <div className="space-y-2">
                {group.teachers?.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] italic text-center py-6">{t.detail.noTeachers}</p>
                ) : (
                  group.teachers?.map((gt) => (
                    <div key={gt.teacherProfileId} className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-panel)] group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[hsla(263,90%,60%,0.15)] flex items-center justify-center text-[var(--accent-primary)]">
                          <User size={15} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--text-primary)]">{gt.teacherProfile.user.firstName} {gt.teacherProfile.user.lastName}</p>
                          {gt.isHomeroom && (
                            <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[hsla(142,72%,45%,0.15)] text-[hsl(142,72%,60%)] border border-[hsla(142,72%,45%,0.2)]">
                              <ShieldCheck size={10} /> Titular
                            </span>
                          )}
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleRemoveTeacher(gt.teacherProfileId)}
                          disabled={loading}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-all"
                        >
                          <UserMinus size={15} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── SUBJECTS TAB ── */}
          {activeTab === "subjects" && (
            <div className="space-y-3">
              {!homeroomTeacher && isAdmin && (
                <div className="flex items-start gap-2 p-3 rounded-xl border border-[hsla(38,92%,52%,0.25)] bg-[hsla(38,92%,52%,0.08)] text-[hsl(38,92%,65%)] text-xs">
                  <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                  Para asignar materias sin maestro específico, primero asigna un maestro titular en la pestaña &quot;Maestros&quot;.
                </div>
              )}
              <p className="text-xs text-[var(--text-muted)]">Activa o desactiva las materias de este grupo. Si no especificas maestro, se usará el titular del grupo.</p>
              {subjectsLoading ? (
                <div className="flex justify-center py-10"><div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid hsl(263,90%,40%)", borderTopColor: "hsl(263,90%,70%)", animation: "spin 0.8s linear infinite" }} /></div>
              ) : subjects.length === 0 ? (
                <div className="text-center py-10">
                  <BookOpen size={36} className="mx-auto mb-3 text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">No hay materias registradas en el catálogo del plantel.</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Ve a Catálogos → Materias para crearlas primero.</p>
                </div>
              ) : (
                subjects.map((subj) => (
                  <div key={subj.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    subj.assigned
                      ? "border-[hsla(263,90%,60%,0.3)] bg-[hsla(263,90%,60%,0.06)]"
                      : "border-[var(--border-glass)] bg-[var(--bg-panel)]"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                        subj.assigned ? "bg-[hsla(263,90%,60%,0.2)] text-[hsl(263,90%,75%)]" : "bg-white/5 text-[var(--text-muted)]"
                      }`}>
                        {subj.code ? subj.code.slice(0, 3) : subj.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${subj.assigned ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>{subj.name}</p>
                        {subj.assigned && subj.teacher && (
                          <p className="text-[10px] text-[var(--text-muted)]">{subj.teacher.user.firstName} {subj.teacher.user.lastName}</p>
                        )}
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => handleToggleSubject(subj)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          subj.assigned
                            ? "bg-[hsla(354,85%,56%,0.1)] text-[hsl(354,85%,65%)] hover:bg-[hsla(354,85%,56%,0.2)] border border-[hsla(354,85%,56%,0.2)]"
                            : "bg-[hsla(263,90%,60%,0.12)] text-[hsl(263,90%,70%)] hover:bg-[hsla(263,90%,60%,0.22)] border border-[hsla(263,90%,60%,0.2)]"
                        }`}
                      >
                        {subj.assigned ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {subj.assigned ? "Quitar" : "Asignar"}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── STUDENTS TAB ── */}
          {activeTab === "students" && (
            <div className="space-y-4">
              {/* Búsqueda */}
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "hsl(240,6%,50%)" }} />
                <input
                  type="text"
                  placeholder="Buscar alumno..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full glass-input text-sm"
                  style={{ paddingLeft: "2rem" }}
                />
              </div>

              {/* Alumnos asignados */}
              <div>
                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  Asignados ({studentsData?.assigned.length ?? 0})
                </h4>
                {studentsLoading ? (
                  <div className="flex justify-center py-6"><div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid hsl(263,90%,40%)", borderTopColor: "hsl(263,90%,70%)", animation: "spin 0.8s linear infinite" }} /></div>
                ) : filteredAssigned.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] italic py-3 text-center">Sin alumnos en este grupo</p>
                ) : (
                  <div className="space-y-1.5">
                    {filteredAssigned.map((s) => (
                      <div key={s.studentProfileId} className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-panel)] group">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[hsla(142,72%,45%,0.12)] flex items-center justify-center text-[hsl(142,72%,55%)] text-[10px] font-bold">
                            {s.firstName[0]}{s.lastName[0]}
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{s.firstName} {s.lastName}</p>
                            {s.enrollmentNumber && <p className="text-[10px] text-[var(--text-muted)]">#{s.enrollmentNumber}</p>}
                          </div>
                        </div>
                        {isAdmin && (
                          <button
                            onClick={() => handleRemoveStudent(s.studentProfileId)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-all"
                            title="Quitar del grupo"
                          >
                            <UserMinus size={13} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Alumnos disponibles */}
              {isAdmin && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                    Disponibles ({studentsData?.available.length ?? 0})
                  </h4>
                  {filteredAvailable.length === 0 ? (
                    <p className="text-xs text-[var(--text-muted)] italic py-3 text-center">No hay alumnos disponibles sin grupo en este ciclo</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {filteredAvailable.map((s) => (
                        <div key={s.studentProfileId} className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-panel)] hover:border-[hsla(263,90%,60%,0.3)] transition-all group">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[var(--text-muted)] text-[10px] font-bold">
                              {s.firstName[0]}{s.lastName[0]}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{s.firstName} {s.lastName}</p>
                              {s.enrollmentNumber && <p className="text-[10px] text-[var(--text-muted)]">#{s.enrollmentNumber}</p>}
                            </div>
                          </div>
                          <button
                            onClick={() => handleAssignStudent(s.studentProfileId)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold bg-[hsla(263,90%,60%,0.15)] text-[hsl(263,90%,70%)] hover:bg-[hsla(263,90%,60%,0.25)] transition-all border border-[hsla(263,90%,60%,0.2)]"
                          >
                            <UserPlus size={11} /> Añadir
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Importación Masiva */}
              {isAdmin && (
                <div className="border border-[var(--border-glass)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setShowImportPanel(!showImportPanel)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Upload size={14} className="text-[var(--accent-secondary)]" />
                      Importación Masiva
                    </div>
                    <ChevronRight size={14} className={`transition-transform ${showImportPanel ? "rotate-90" : ""}`} />
                  </button>
                  {showImportPanel && (
                    <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-glass)] pt-4">
                      <button onClick={downloadTemplate} className="flex items-center gap-2 text-xs text-[var(--accent-secondary)] hover:underline">
                        <FileSpreadsheet size={12} /> Descargar plantilla CSV
                      </button>
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">Subir archivo CSV</label>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                          className="text-xs text-[var(--text-secondary)] w-full file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[hsla(263,90%,60%,0.15)] file:text-[hsl(263,90%,70%)] hover:file:bg-[hsla(263,90%,60%,0.25)] file:cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[var(--text-muted)] mb-1">O ingresa matrículas (una por línea)</label>
                        <textarea
                          value={bulkImportText}
                          onChange={(e) => setBulkImportText(e.target.value)}
                          placeholder="2026-001\n2026-002\n2026-003"
                          rows={4}
                          className="w-full glass-input text-xs font-mono resize-none"
                        />
                      </div>
                      <button
                        onClick={handleBulkImportCSV}
                        disabled={importLoading || (!importFile && !bulkImportText.trim())}
                        className="glass-button w-full text-xs py-2 disabled:opacity-50"
                      >
                        {importLoading ? "Procesando..." : "Importar alumnos"}
                      </button>

                      {/* Resultado */}
                      {bulkImportSummary && (
                        <div className="space-y-2">
                          <div className={`flex items-center gap-2 p-3 rounded-xl text-xs border ${
                            bulkImportSummary.failed === 0
                              ? "bg-[hsla(142,72%,45%,0.08)] border-[hsla(142,72%,45%,0.2)] text-[hsl(142,72%,65%)]"
                              : "bg-[hsla(38,92%,52%,0.08)] border-[hsla(38,92%,52%,0.2)] text-[hsl(38,92%,65%)]"
                          }`}>
                            ✓ {bulkImportSummary.successful} asignados · ✗ {bulkImportSummary.failed} errores · Total: {bulkImportSummary.total}
                          </div>
                          {bulkImportResult && bulkImportResult.filter(r => r.status === "error").map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-[10px] text-[hsl(354,85%,65%)]">
                              <AlertCircle size={10} className="flex-shrink-0 mt-0.5" />
                              <span>{r.enrollmentNumber}: {r.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
