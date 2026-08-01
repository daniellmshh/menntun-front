"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  User,
  Users,
  Calendar,
  ChevronRight,
  Bookmark,
  ShieldCheck,
  UserMinus,
  UserPlus,
  BookOpen,
  Upload,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";
import { translations } from "@/lib/translations";
import { ApiResponse, UserRole } from "@/types";
import GroupAlertBanner from "@/modules/academic/components/GroupAlertBanner";
import GroupModal from "@/modules/academic/components/GroupModal";
import type {
  AcademicGroup,
  Grade,
  School,
  SchoolYear,
  Teacher,
} from "@/modules/academic/types";

type Group = AcademicGroup;

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

function GroupDetailDrawer({
  group: initialGroup,
  onClose,
  t,
}: {
  group: AcademicGroup;
  onClose: () => void;
  t: any;
}) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [group, setGroup] = useState<Group>(initialGroup);
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
  const [bulkImportResult, setBulkImportResult] = useState<any[] | null>(null);
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
    fetchDetail();
    fetchTeachers();
  }, [fetchDetail, fetchTeachers]);

  useEffect(() => {
    if (activeTab === "subjects") fetchSubjects();
    if (activeTab === "students") fetchStudents();
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
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
      showAlert(msg || data?.error || t.alerts.errorAssignTeacher, "error");
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
      } catch (e: any) {
        showAlert(e?.response?.data?.message || "Error al remover materia", "error");
      }
    } else {
      try {
        const payload: any = { subjectId: subj.id };
        if (subjectTeacherMap[subj.id]) payload.teacherProfileId = subjectTeacherMap[subj.id];
        await api.post(`/academic/groups/${group.id}/subjects`, payload);
        showAlert(`Materia "${subj.name}" asignada al grupo`, "success");
        fetchSubjects();
      } catch (e: any) {
        showAlert(e?.response?.data?.message || "Error al asignar materia", "error");
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
    } catch (e: any) {
      showAlert(e?.response?.data?.message || "Error al asignar alumno", "error");
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
    } catch (e: any) {
      showAlert(e?.response?.data?.message || "Error al remover alumno", "error");
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
      const res = await api.post(`/academic/groups/${group.id}/students/bulk`, { students: rows });
      const { results, summary } = res.data.data;
      setBulkImportResult(results);
      setBulkImportSummary(summary);
      fetchStudents();
      fetchDetail();
      showAlert(`${summary.successful} alumnos asignados. ${summary.failed} con error.`, summary.failed === 0 ? "success" : "error");
    } catch (e: any) {
      showAlert(e?.response?.data?.message || "Error en importación masiva", "error");
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

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-end"
      style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.5)" }}
    >
      <div className="w-full max-w-lg h-full glass-panel border-l border-[var(--border-glass)] flex flex-col shadow-main animate-slide-in" style={{ maxWidth: 560 }}>
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
              onClick={() => setActiveTab(tab.key as any)}
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
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
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
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-xl border border-[var(--border-glass)] space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-[var(--border-glass)] pb-2.5">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5"><Bookmark size={15} />{t.detail.grade}</span>
                  <span className="font-bold text-[var(--text-primary)]">{group.grade?.name || "—"}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-[var(--border-glass)] pb-2.5">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5"><Calendar size={15} />{t.detail.schoolYear}</span>
                  <span className="font-bold text-[var(--text-primary)]">{group.schoolYear?.name || "—"}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5"><Users size={15} />{t.detail.capacity}</span>
                  <span className="font-bold text-[var(--text-primary)]">{group._count?.enrollments ?? 0} / {group.maxStudents || "∞"}</span>
                </div>
              </div>
              {homeroomTeacher && (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-[hsla(142,72%,45%,0.2)] bg-[hsla(142,72%,45%,0.06)]">
                  <ShieldCheck size={18} className="text-[hsl(142,72%,55%)] flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[hsl(142,72%,55%)] font-semibold">Maestro Titular</p>
                    <p className="text-sm font-bold text-[var(--text-primary)]">
                      {homeroomTeacher.teacherProfile.user.firstName} {homeroomTeacher.teacherProfile.user.lastName}
                    </p>
                  </div>
                </div>
              )}
            </div>
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
                  Para asignar materias sin maestro específico, primero asigna un maestro titular en la pestaña "Maestros".
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

// ─── MAIN PAGE ──────────────────────────────────────────────────────

export default function GroupsPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language].groups;

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const canManage =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN;

  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSchoolId, setFilterSchoolId] = useState("");
  const [filterGradeId, setFilterGradeId] = useState("");
  const [filterYearId, setFilterYearId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editGroup, setEditGroup] = useState<AcademicGroup | null>(null);
  const [detailGroup, setDetailGroup] = useState<AcademicGroup | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Group | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAlert = useCallback((msg: string, type: "success" | "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isSuperAdmin ? "/academic/groups/all" : "/academic/groups";
      const res = await api.get<ApiResponse<AcademicGroup[]>>(endpoint);
      setGroups(res.data.data || []);
    } catch {
      showAlert(t.alerts.errorFetch, "error");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, t.alerts.errorFetch, showAlert]);

  const fetchCatalogs = useCallback(async () => {
    try {
      if (isSuperAdmin) {
        const schoolsRes = await api.get<ApiResponse<School[]>>("/schools");
        setSchools(schoolsRes.data.data || []);

        const yearsRes = await api.get<ApiResponse<SchoolYear[]>>("/academic/school-years/all");
        setSchoolYears(yearsRes.data.data || []);

        const gradesRes = await api.get<ApiResponse<Grade[]>>("/academic/grades/all");
        setGrades(gradesRes.data.data || []);
      } else {
        const yearsRes = await api.get<ApiResponse<SchoolYear[]>>("/academic/school-years");
        setSchoolYears(yearsRes.data.data || []);

        const gradesRes = await api.get<ApiResponse<Grade[]>>("/academic/grades");
        setGrades(gradesRes.data.data || []);
      }
    } catch {}
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchGroups();
    fetchCatalogs();
  }, [fetchGroups, fetchCatalogs]);

  const handleDeleteClick = (group: AcademicGroup) => {
    if (group._count && group._count.enrollments > 0) {
      showAlert("No se puede eliminar el grupo porque tiene alumnos inscritos.", "error");
      return;
    }
    setDeleteTarget(group);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/academic/groups/${deleteTarget.id}`);
      setGroups((prev) => prev.filter((g) => g.id !== deleteTarget.id));
      showAlert(t.alerts.successDelete, "success");
      setDeleteTarget(null);
    } catch (e: any) {
      showAlert(e?.response?.data?.error || t.alerts.errorDelete, "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleSaved = (saved: AcademicGroup) => {
    setGroups((prev) => {
      const idx = prev.findIndex((g) => g.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setShowModal(false);
    setEditGroup(null);
    showAlert(editGroup ? t.alerts.successUpdate : t.alerts.successCreate, "success");
  };

  // Filter Catalog lists based on current school filters
  const currentFilterSchool = isSuperAdmin ? filterSchoolId : user?.schoolId || "";
  const displayGrades = currentFilterSchool
    ? grades.filter((g) => g.schoolId === currentFilterSchool)
    : grades;
  const displayYears = currentFilterSchool
    ? schoolYears.filter((y) => y.schoolId === currentFilterSchool)
    : schoolYears;

  // Filter groups listing
  const filtered = groups.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.grade?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.school?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchSchool = filterSchoolId ? g.schoolId === filterSchoolId : true;
    const matchGrade = filterGradeId ? g.gradeId === filterGradeId : true;
    const matchYear = filterYearId ? g.schoolYearId === filterYearId : true;
    return matchSearch && matchSchool && matchGrade && matchYear;
  });

  return (
    <ModuleGuard moduleKey="academic" requireSchoolContext={true}>
      <div className="flex flex-col h-full space-y-6">
        {/* Alert Banner */}
        {alert && (
          <GroupAlertBanner message={alert.msg} type={alert.type} onClose={() => setAlert(null)} />
        )}

        {/* Header section */}
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
            onClick={() => {
              setEditGroup(null);
              setShowModal(true);
            }}
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
            onChange={(e) => setSearch(e.target.value)}
            className="w-full !pl-10 glass-input text-sm"
          />
        </div>

        {/* School selector (Super Admin) */}
        {isSuperAdmin && (
          <select
            value={filterSchoolId}
            onChange={(e) => {
              setFilterSchoolId(e.target.value);
              setFilterGradeId("");
              setFilterYearId("");
            }}
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
          onChange={(e) => setFilterGradeId(e.target.value)}
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
          onChange={(e) => setFilterYearId(e.target.value)}
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
                            onClick={() => setDetailGroup(g)}
                            className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors flex items-center gap-1 text-xs font-semibold"
                          >
                            <span>Detalle</span>
                            <ChevronRight size={14} />
                          </button>
                          {canManage && g.schoolYear?.active !== false && (
                            <>
                              <button
                                onClick={() => {
                                  setEditGroup(g);
                                  setShowModal(true);
                                }}
                                className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                                title="Editar Grupo"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(g)}
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

      {/* Create / Edit Modal */}
      {/* Delete Confirmation Modal */}
      {mounted && deleteTarget && createPortal(
        <ConfirmDeleteModal
          title="Eliminar Grupo"
          description={
            <>
              ¿Estás seguro de que deseas eliminar el grupo <strong className="text-[var(--text-primary)]">"{deleteTarget.name}"</strong>?
            </>
          }
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
          isLoading={deleteLoading}
        />
      , document.body)}

      {showModal && (
        <GroupModal
          group={editGroup}
          schools={schools}
          grades={grades}
          schoolYears={schoolYears}
          isSuperAdmin={isSuperAdmin}
          currentSchoolId={user?.schoolId || ""}
          onClose={() => {
            setShowModal(false);
            setEditGroup(null);
          }}
          onSaved={handleSaved}
          translations={t}
        />
      )}

      {/* Detail Drawer */}
      {detailGroup && (
        <GroupDetailDrawer
          group={detailGroup}
          onClose={() => {
            setDetailGroup(null);
            fetchGroups(); // refresh groups to sync count updates
          }}
          t={t}
        />
      )}
      </div>
    </ModuleGuard>
  );
}
