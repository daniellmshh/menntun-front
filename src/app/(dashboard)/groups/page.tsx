"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  Building2,
  User,
  Users,
  Calendar,
  Sparkles,
  ChevronRight,
  Activity,
  Bookmark,
  ShieldCheck,
  UserMinus,
  UserPlus,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import { ApiResponse, UserRole } from "@/types";

// ─── TYPES ──────────────────────────────────────────────────────────

interface School {
  id: string;
  name: string;
  code: string;
}

interface Grade {
  id: string;
  schoolId: string;
  name: string;
  level: string | null;
}

interface SchoolYear {
  id: string;
  schoolId: string;
  name: string;
  active: boolean;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teacherProfile?: {
    id: string;
  };
}

interface GroupTeacher {
  teacherProfileId: string;
  isHomeroom: boolean;
  teacherProfile: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface Group {
  id: string;
  schoolId: string;
  gradeId: string;
  schoolYearId: string;
  name: string;
  maxStudents: number | null;
  grade?: { name: string; level: string | null };
  schoolYear?: { name: string; active: boolean };
  school?: { name: string; code: string };
  teachers?: GroupTeacher[];
  _count?: { enrollments: number; teachers?: number };
}

// ─── HELPERS ────────────────────────────────────────────────────────

function AlertBanner({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-main text-sm font-medium transition-all duration-300
      ${
        type === "success"
          ? "bg-[hsla(142,72%,45%,0.12)] border-[hsla(142,72%,45%,0.25)] text-[hsl(142,72%,60%)]"
          : "bg-[hsla(354,85%,56%,0.12)] border-[hsla(354,85%,56%,0.25)] text-[hsl(354,85%,70%)]"
      }`}
    >
      {type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── CREATE / EDIT MODAL ────────────────────────────────────────────

function GroupModal({
  group,
  schools,
  grades,
  schoolYears,
  isSuperAdmin,
  currentSchoolId,
  onClose,
  onSaved,
  t,
}: {
  group: Group | null;
  schools: School[];
  grades: Grade[];
  schoolYears: SchoolYear[];
  isSuperAdmin: boolean;
  currentSchoolId: string;
  onClose: () => void;
  onSaved: (g: Group) => void;
  t: any;
}) {
  const [form, setForm] = useState({
    name: group?.name || "",
    gradeId: group?.gradeId || "",
    schoolYearId: group?.schoolYearId || "",
    maxStudents: group?.maxStudents || "",
    schoolId: group?.schoolId || currentSchoolId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter grades and years based on selected school (Super Admin)
  const filteredGrades = grades.filter((g) => g.schoolId === form.schoolId);
  const filteredYears = schoolYears.filter((y) => y.schoolId === form.schoolId);

  const handleSave = async () => {
    if (!form.name || !form.gradeId || !form.schoolYearId) {
      setError("Completa todos los campos requeridos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let res: any;
      if (group) {
        res = await api.patch<ApiResponse<Group>>(`/academic/groups/${group.id}`, {
          name: form.name,
          gradeId: form.gradeId,
          maxStudents: form.maxStudents ? parseInt(form.maxStudents.toString()) : null,
        });
      } else {
        const payload: any = {
          name: form.name,
          gradeId: form.gradeId,
          schoolYearId: form.schoolYearId,
          maxStudents: form.maxStudents ? parseInt(form.maxStudents.toString()) : null,
        };
        if (isSuperAdmin && form.schoolId) {
          payload.schoolId = form.schoolId;
        }
        res = await api.post<ApiResponse<Group>>("/academic/groups", payload);
      }
      onSaved(res.data.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || t.alerts.errorCreate);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.5)" }}
    >
      <div className="w-full max-w-md glass-panel border border-[var(--border-glass)] rounded-2xl shadow-main flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-glass)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {group ? t.modal.editTitle : t.modal.createTitle}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[hsla(354,85%,56%,0.1)] border border-[hsla(354,85%,56%,0.2)] text-[hsl(354,85%,70%)] text-sm">
              <XCircle size={14} /> {error}
            </div>
          )}

          {isSuperAdmin && !group && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                {t.modal.schoolLabel}
              </label>
              <select
                value={form.schoolId}
                onChange={(e) =>
                  setForm({ ...form, schoolId: e.target.value, gradeId: "", schoolYearId: "" })
                }
                className="w-full input-glass text-sm"
              >
                <option value="">— Sin asignar (usar mi escuela) —</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              {t.modal.gradeLabel}
            </label>
            <select
              value={form.gradeId}
              onChange={(e) => setForm({ ...form, gradeId: e.target.value })}
              className="w-full input-glass text-sm"
              disabled={isSuperAdmin && !form.schoolId}
            >
              <option value="">Selecciona un grado</option>
              {filteredGrades.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.level ? `(${g.level})` : ""}
                </option>
              ))}
            </select>
            {isSuperAdmin && !form.schoolId && (
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                * Selecciona primero una escuela.
              </span>
            )}
          </div>

          {!group && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                {t.modal.schoolYearLabel}
              </label>
              <select
                value={form.schoolYearId}
                onChange={(e) => setForm({ ...form, schoolYearId: e.target.value })}
                className="w-full input-glass text-sm"
                disabled={isSuperAdmin && !form.schoolId}
              >
                <option value="">Selecciona un ciclo escolar</option>
                {filteredYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.active ? "(Activo)" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              {t.modal.nameLabel}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. A, B, 101"
              className="w-full input-glass"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              {t.modal.maxStudentsLabel}
            </label>
            <input
              type="number"
              min={1}
              value={form.maxStudents}
              onChange={(e) => setForm({ ...form, maxStudents: e.target.value })}
              placeholder="Sin límite"
              className="w-full input-glass"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-glass)]">
          <button onClick={onClose} className="btn-secondary">
            {t.modal.cancel}
          </button>
          <button onClick={handleSave} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? t.modal.loading : t.modal.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DETAILS DRAWER ──────────────────────────────────────────────────

function GroupDetailDrawer({
  group: initialGroup,
  onClose,
  t,
}: {
  group: Group;
  onClose: () => void;
  t: any;
}) {
  const [group, setGroup] = useState<Group>(initialGroup);
  const [activeTab, setActiveTab] = useState<"general" | "teachers" | "students">("general");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [assignForm, setAssignForm] = useState({ teacherProfileId: "", isHomeroom: false });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showAlert = (msg: string, type: "success" | "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const fetchDetail = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Group>>(`/academic/groups/${group.id}`);
      setGroup(res.data.data);
    } catch {}
  }, [group.id]);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await api.get<ApiResponse<Teacher[]>>(`/teachers?schoolId=${group.schoolId}`);
      setTeachers(res.data.data || []);
    } catch {}
  }, [group.schoolId]);

  useEffect(() => {
    fetchDetail();
    fetchTeachers();
  }, [fetchDetail, fetchTeachers]);

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

  // Filter teachers not already assigned to this group
  const assignedIds = new Set(group.teachers?.map((t) => t.teacherProfileId) || []);
  const assignableTeachers = teachers.filter((t) => !assignedIds.has(t.teacherProfile?.id || ""));

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-end"
      style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.5)" }}
    >
      <div className="w-full max-w-lg h-full glass-panel border-l border-[var(--border-glass)] flex flex-col shadow-main animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {t.detail.title}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">{group.school?.name || ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-4 border-b border-[var(--border-glass)] bg-white/5">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "general"
                ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.detail.generalTab}
          </button>
          <button
            onClick={() => setActiveTab("teachers")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "teachers"
                ? "border-[var(--accent-primary)] text-[var(--accent-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.detail.teachersTab}
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "students"
                ? "border(--accent-primary) text-[var(--accent-primary)]"
                : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {t.detail.studentsTab}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {alert && (
            <div
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${
                alert.type === "success"
                  ? "bg-[hsla(142,72%,45%,0.1)] border-[hsla(142,72%,45%,0.2)] text-[hsl(142,72%,60%)]"
                  : "bg-[hsla(354,85%,56%,0.1)] border-[hsla(354,85%,56%,0.2)] text-[hsl(354,85%,70%)]"
              }`}
            >
              {alert.type === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {alert.msg}
            </div>
          )}

          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="glass-panel p-4 rounded-xl border border-[var(--border-glass)] space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-[var(--border-glass)] pb-2.5">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Bookmark size={15} />
                    {t.detail.grade}
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {group.grade?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-[var(--border-glass)] pb-2.5">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Calendar size={15} />
                    {t.detail.schoolYear}
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {group.schoolYear?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Users size={15} />
                    {t.detail.capacity}
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {group._count?.enrollments ?? 0} / {group.maxStudents || "∞"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "teachers" && (
            <div className="space-y-6">
              {/* Assign Form */}
              <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-white/5 space-y-4">
                <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <UserPlus size={16} className="text-[var(--accent-primary)]" />
                  {t.detail.addTeacher}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={assignForm.teacherProfileId}
                    onChange={(e) =>
                      setAssignForm({ ...assignForm, teacherProfileId: e.target.value })
                    }
                    className="input-glass text-sm w-full"
                    disabled={loading}
                  >
                    <option value="">{t.detail.teacherSelectLabel}</option>
                    {assignableTeachers.map((t) => (
                      <option key={t.id} value={t.teacherProfile?.id || ""}>
                        {t.firstName} {t.lastName}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignForm.isHomeroom}
                      onChange={(e) =>
                        setAssignForm({ ...assignForm, isHomeroom: e.target.checked })
                      }
                      className="rounded border-[var(--border-glass)] bg-black/40 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                    />
                    {t.detail.isHomeroom}
                  </label>
                </div>
                <button
                  onClick={handleAssignTeacher}
                  disabled={loading || !assignForm.teacherProfileId}
                  className="btn-primary w-full text-xs py-2 disabled:opacity-50"
                >
                  {t.detail.assignBtn}
                </button>
              </div>

              {/* List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Profesores Vinculados
                </h4>
                {group.teachers?.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)] italic">{t.detail.noTeachers}</p>
                ) : (
                  <div className="space-y-2">
                    {group.teachers?.map((gt) => (
                      <div
                        key={gt.teacherProfileId}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-[var(--border-glass)] bg-[hsla(240,16%,8%,0.6)] group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[hsla(263,90%,60%,0.15)] flex items-center justify-center text-[var(--accent-primary)]">
                            <User size={15} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[var(--text-primary)]">
                              {gt.teacherProfile.user.firstName} {gt.teacherProfile.user.lastName}
                            </p>
                            {gt.isHomeroom && (
                              <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[hsla(142,72%,45%,0.15)] text-[hsl(142,72%,60%)] border border-[hsla(142,72%,45%,0.2)]">
                                <ShieldCheck size={10} />
                                {t.detail.isHomeroom}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveTeacher(gt.teacherProfileId)}
                          disabled={loading}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-all"
                          title="Eliminar vinculación"
                        >
                          <UserMinus size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "students" && (
            <div className="space-y-4">
              <div className="glass-panel p-6 rounded-xl border border-[var(--border-glass)] text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[hsla(263,90%,60%,0.1)] border border-[hsla(263,90%,60%,0.15)] flex items-center justify-center mx-auto text-[var(--accent-primary)]">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Alumnos de este grupo
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    Actualmente hay{" "}
                    <span className="font-bold text-[var(--text-primary)]">
                      {group._count?.enrollments ?? 0}
                    </span>{" "}
                    alumnos inscritos.
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-3">
                    * La asignación y administración de alumnos se realiza desde el módulo de
                    Inscripciones (Enrollments).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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

  const [groups, setGroups] = useState<Group[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schoolYears, setSchoolYears] = useState<SchoolYear[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSchoolId, setFilterSchoolId] = useState("");
  const [filterGradeId, setFilterGradeId] = useState("");
  const [filterYearId, setFilterYearId] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [detailGroup, setDetailGroup] = useState<Group | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showAlert = useCallback((msg: string, type: "success" | "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isSuperAdmin ? "/academic/groups/all" : "/academic/groups";
      const res = await api.get<ApiResponse<Group[]>>(endpoint);
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

  const handleDelete = async (group: Group) => {
    if (group._count && group._count.enrollments > 0) {
      showAlert("No se puede eliminar el grupo porque tiene alumnos inscritos.", "error");
      return;
    }
    if (!window.confirm("¿Estás seguro de que deseas eliminar este grupo escolar?")) return;
    try {
      await api.delete(`/academic/groups/${group.id}`);
      setGroups((prev) => prev.filter((g) => g.id !== group.id));
      showAlert(t.alerts.successDelete, "success");
    } catch (e: any) {
      showAlert(e?.response?.data?.error || t.alerts.errorDelete, "error");
    }
  };

  const handleSaved = (saved: Group) => {
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
    <div className="flex flex-col h-full space-y-6">
      {/* Alert Banner */}
      {alert && (
        <AlertBanner message={alert.msg} type={alert.type} onClose={() => setAlert(null)} />
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {t.title}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">{t.subtitle}</p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditGroup(null);
              setShowModal(true);
            }}
            className="btn-primary self-start md:self-auto flex items-center gap-2"
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
            className="w-full pl-10 input-glass text-sm"
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
            className="input-glass text-sm"
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
          className="input-glass text-sm"
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
          className="input-glass text-sm"
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
                          {canManage && (
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
                                onClick={() => handleDelete(g)}
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
          t={t}
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
  );
}
