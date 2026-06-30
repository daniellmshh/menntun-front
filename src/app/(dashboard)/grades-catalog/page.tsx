"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  BookMarked,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  Building2,
  Hash,
  Activity,
} from "lucide-react";
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
  order: number;
  level: string | null;
  school?: { name: string; code: string };
  _count?: { groups: number };
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

// ─── MODAL ──────────────────────────────────────────────────────────

function GradeModal({
  grade,
  schools,
  isSuperAdmin,
  onClose,
  onSaved,
  t,
}: {
  grade: Grade | null;
  schools: School[];
  isSuperAdmin: boolean;
  onClose: () => void;
  onSaved: (g: Grade) => void;
  t: any;
}) {
  const predefinedLevels = ["Preescolar", "Primaria", "Secundaria", "Preparatoria"];
  
  const initialSelectValue = !grade?.level 
    ? "" 
    : predefinedLevels.includes(grade.level) 
    ? grade.level 
    : "custom";

  const [form, setForm] = useState({
    name: grade?.name || "",
    order: grade?.order || 1,
    schoolId: grade?.schoolId || "",
  });
  const [selectedLevelType, setSelectedLevelType] = useState(initialSelectValue);
  const [customLevel, setCustomLevel] = useState(initialSelectValue === "custom" ? grade?.level || "" : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.name || form.order <= 0) {
      setError(t.alerts.errorCreate);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const levelToSave = selectedLevelType === "custom" ? customLevel : selectedLevelType;
      let res: any;
      if (grade) {
        res = await api.patch<ApiResponse<Grade>>(`/academic/grades/${grade.id}`, {
          name: form.name,
          order: form.order,
          level: levelToSave || null,
        });
      } else {
        const payload: any = {
          name: form.name,
          order: form.order,
          level: levelToSave || null,
        };
        if (isSuperAdmin && form.schoolId) {
          payload.schoolId = form.schoolId;
        }
        res = await api.post<ApiResponse<Grade>>("/academic/grades", payload);
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
            {grade ? t.modal.editTitle : t.modal.createTitle}
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

          {isSuperAdmin && !grade && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
                {t.modal.schoolLabel}
              </label>
              <select
                value={form.schoolId}
                onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
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
              {t.modal.nameLabel}
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. 1° Primaria, 3° Secundaria"
              className="w-full input-glass"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              {t.modal.levelLabel}
            </label>
            <select
              value={selectedLevelType}
              onChange={(e) => {
                setSelectedLevelType(e.target.value);
                if (e.target.value !== "custom") {
                  setCustomLevel("");
                }
              }}
              className="w-full input-glass text-sm text-[var(--text-primary)] bg-black/60"
            >
              <option value="">{t.modal.levelPlaceholder}</option>
              <option value="Preescolar">{t.modal.levelSelectOptions.preschool}</option>
              <option value="Primaria">{t.modal.levelSelectOptions.primary}</option>
              <option value="Secundaria">{t.modal.levelSelectOptions.secondary}</option>
              <option value="Preparatoria">{t.modal.levelSelectOptions.highschool}</option>
              <option value="custom">{t.modal.levelSelectOptions.custom}</option>
            </select>
          </div>

          {selectedLevelType === "custom" && (
            <div>
              <input
                type="text"
                value={customLevel}
                onChange={(e) => setCustomLevel(e.target.value)}
                placeholder={t.modal.customLevelPlaceholder}
                className="w-full input-glass text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              {t.modal.orderLabel}
            </label>
            <input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
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

// ─── MAIN PAGE ──────────────────────────────────────────────────────

export default function GradesCatalogPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language].grades;

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const canManage =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN;

  const [grades, setGrades] = useState<Grade[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSchoolId, setFilterSchoolId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editGrade, setEditGrade] = useState<Grade | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showAlert = useCallback((msg: string, type: "success" | "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isSuperAdmin ? "/academic/grades/all" : "/academic/grades";
      const res = await api.get<ApiResponse<Grade[]>>(endpoint);
      setGrades(res.data.data || []);
    } catch {
      showAlert(t.alerts.errorFetch, "error");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, t.alerts.errorFetch, showAlert]);

  const fetchSchools = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await api.get<ApiResponse<School[]>>("/schools");
      setSchools(res.data.data || []);
    } catch {}
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchGrades();
    fetchSchools();
  }, [fetchGrades, fetchSchools]);

  const handleDelete = async (grade: Grade) => {
    if (grade._count && grade._count.groups > 0) {
      showAlert(t.alerts.errorDelete, "error");
      return;
    }
    if (!confirm("¿Estás seguro de que deseas eliminar este grado?")) return;
    try {
      await api.delete(`/academic/grades/${grade.id}`);
      setGrades((prev) => prev.filter((g) => g.id !== grade.id));
      showAlert(t.alerts.successDelete, "success");
    } catch (e: any) {
      showAlert(e?.response?.data?.error || t.alerts.errorDelete, "error");
    }
  };

  const handleSaved = (saved: Grade) => {
    setGrades((prev) => {
      const idx = prev.findIndex((g) => g.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setShowModal(false);
    setEditGrade(null);
    showAlert(editGrade ? t.alerts.successUpdate : t.alerts.successCreate, "success");
  };

  // Filter
  const filtered = grades.filter((g) => {
    const matchSearch =
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      (g.level || "").toLowerCase().includes(search.toLowerCase()) ||
      (g.school?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchSchool = filterSchoolId ? g.schoolId === filterSchoolId : true;
    return matchSearch && matchSchool;
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
              setEditGrade(null);
              setShowModal(true);
            }}
            className="btn-primary self-start md:self-auto flex items-center gap-2"
          >
            <Plus size={16} />
            {t.createBtn}
          </button>
        )}
      </div>

      {/* Filter and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-[var(--border-glass)]">
        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            placeholder="Buscar por nombre, nivel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 input-glass"
          />
        </div>

        {/* School Filter (Super Admin only) */}
        {isSuperAdmin && (
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-[var(--text-muted)]" />
            <select
              value={filterSchoolId}
              onChange={(e) => setFilterSchoolId(e.target.value)}
              className="input-glass text-sm max-w-xs"
            >
              <option value="">Todos los colegios</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
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
                  {t.table.level}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t.table.order}
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  {t.table.groups}
                </th>
                {canManage && (
                  <th className="px-6 py-4 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider text-right">
                    {t.table.actions}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-glass)]">
              {loading ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center justify-center gap-2">
                      <Activity size={16} className="animate-spin text-[var(--accent-primary)]" />
                      <span>Cargando grados...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
                    {t.noData}
                  </td>
                </tr>
              ) : (
                filtered.map((g) => (
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
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[hsla(263,90%,60%,0.1)] border border-[hsla(263,90%,60%,0.15)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-sm">
                          {g.name[0]}
                        </div>
                        <span className="text-sm font-bold text-[var(--text-primary)]">
                          {g.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 border border-[var(--border-glass)] text-[var(--text-secondary)]">
                        {g.level || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap text-sm text-[var(--text-secondary)]">
                      <div className="flex items-center gap-1">
                        <Hash size={14} className="text-[var(--text-muted)]" />
                        <span className="font-semibold">{g.order}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4.5 whitespace-nowrap">
                      <span className="text-sm font-semibold text-[var(--text-secondary)]">
                        {g._count?.groups ?? 0}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4.5 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditGrade(g);
                              setShowModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            title="Editar Grado"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(g)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-[var(--accent-danger)] transition-colors"
                            title="Eliminar Grado"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <GradeModal
          grade={editGrade}
          schools={schools}
          isSuperAdmin={isSuperAdmin}
          onClose={() => {
            setShowModal(false);
            setEditGrade(null);
          }}
          onSaved={handleSaved}
          t={t}
        />
      )}
    </div>
  );
}
