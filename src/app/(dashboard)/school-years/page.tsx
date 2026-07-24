"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Calendar,
  BookOpen,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ChevronRight,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import { ApiResponse, UserRole } from "@/types";

// ─── TYPES ──────────────────────────────────────────────────────────

interface Period {
  id: string;
  schoolYearId: string;
  name: string;
  startDate: string;
  endDate: string;
  order: number;
}

interface School {
  name: string;
  code: string;
}

interface SchoolYear {
  id: string;
  schoolId: string;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  periods: Period[];
  school?: School;
  _count?: { groups: number };
}

interface PeriodFormEntry {
  name: string;
  startDate: string;
  endDate: string;
  order: number;
}

// ─── HELPERS ────────────────────────────────────────────────────────

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// ─── COMPONENTS ─────────────────────────────────────────────────────

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
      {type === "success" ? (
        <CheckCircle size={16} />
      ) : (
        <XCircle size={16} />
      )}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}

// ─── PERIOD ROW ─────────────────────────────────────────────────────

function PeriodRow({
  period,
  canManage,
  onDelete,
  t,
}: {
  period: Period;
  canManage: boolean;
  onDelete: (id: string) => void;
  t: any;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[hsla(240,16%,8%,0.6)] border border-[var(--border-glass)] group">
      <div className="w-6 h-6 rounded-md bg-[hsla(263,90%,60%,0.15)] border border-[hsla(263,90%,60%,0.2)] flex items-center justify-center">
        <span className="text-[10px] font-bold text-[var(--accent-primary)]">{period.order}</span>
      </div>
      <span className="flex-1 text-sm font-medium text-[var(--text-primary)]">{period.name}</span>
      <span className="text-xs text-[var(--text-secondary)]">{formatDate(period.startDate)}</span>
      <span className="text-xs text-[var(--text-muted)]">→</span>
      <span className="text-xs text-[var(--text-secondary)]">{formatDate(period.endDate)}</span>
      {canManage && (
        <button
          onClick={() => onDelete(period.id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-[var(--accent-danger)] transition-all"
          title={t.modal.removePeriod}
        >
          <Trash2 size={13} />
        </button>
      )}
    </div>
  );
}

// ─── SCHOOL YEAR DETAIL DRAWER ──────────────────────────────────────

function SchoolYearDetail({
  year,
  canManage,
  onClose,
  onUpdated,
  t,
}: {
  year: SchoolYear;
  canManage: boolean;
  onClose: () => void;
  onUpdated: (updated: SchoolYear) => void;
  t: any;
}) {
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [periodForm, setPeriodForm] = useState({ name: "", startDate: "", endDate: "", order: 1 });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const showAlert = (msg: string, type: "success" | "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleAddPeriod = async () => {
    if (!periodForm.name || !periodForm.startDate || !periodForm.endDate) return;
    setLoading(true);
    try {
      await api.post(`/academic/school-years/${year.id}/periods`, periodForm);
      // Re-fetch year detail
      const res = await api.get<ApiResponse<SchoolYear>>(`/academic/school-years/${year.id}`);
      onUpdated(res.data.data);
      setShowAddPeriod(false);
      setPeriodForm({ name: "", startDate: "", endDate: "", order: 1 });
      showAlert(t.alerts.successAddPeriod, "success");
    } catch {
      showAlert(t.alerts.errorAddPeriod, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePeriod = async (periodId: string) => {
    setLoading(true);
    try {
      await api.delete(`/academic/school-years/${year.id}/periods/${periodId}`);
      const res = await api.get<ApiResponse<SchoolYear>>(`/academic/school-years/${year.id}`);
      onUpdated(res.data.data);
      showAlert(t.alerts.successDeletePeriod, "success");
    } catch {
      showAlert(t.alerts.errorDeletePeriod, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<SchoolYear>>(`/academic/school-years/${year.id}/close`);
      onUpdated(res.data.data);
      setConfirmClose(false);
      showAlert(t.alerts.successClose, "success");
    } catch {
      showAlert(t.alerts.errorClose, "error");
    } finally {
      setLoading(false);
    }
  };

  const sortedPeriods = [...(year.periods || [])].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.5)" }}>
      <div
        className="w-full max-w-2xl glass-panel border border-[var(--border-glass)] rounded-2xl shadow-main flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow">
              <CalendarDays size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{year.name}</h2>
              <p className="text-xs text-[var(--text-secondary)]">{year.school?.name || ""}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-5 space-y-6">
          {alert && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm border ${alert.type === "success" ? "bg-[hsla(142,72%,45%,0.1)] border-[hsla(142,72%,45%,0.2)] text-[hsl(142,72%,60%)]" : "bg-[hsla(354,85%,56%,0.1)] border-[hsla(354,85%,56%,0.2)] text-[hsl(354,85%,70%)]"}`}>
              {alert.type === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {alert.msg}
            </div>
          )}

          {/* General Info */}
          <section>
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">{t.detail.generalInfo}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel rounded-xl p-4 border border-[var(--border-glass)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">{t.detail.startDate}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{formatDate(year.startDate)}</p>
              </div>
              <div className="glass-panel rounded-xl p-4 border border-[var(--border-glass)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">{t.detail.endDate}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{formatDate(year.endDate)}</p>
              </div>
              <div className="glass-panel rounded-xl p-4 border border-[var(--border-glass)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">{t.detail.status}</p>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${year.active ? "bg-[hsla(142,72%,45%,0.15)] text-[hsl(142,72%,60%)]" : "bg-[hsla(354,85%,56%,0.15)] text-[hsl(354,85%,70%)]"}`}>
                  {year.active ? <CheckCircle size={11} /> : <XCircle size={11} />}
                  {year.active ? t.status.active : t.status.closed}
                </span>
              </div>
              <div className="glass-panel rounded-xl p-4 border border-[var(--border-glass)]">
                <p className="text-xs text-[var(--text-muted)] mb-1">{t.detail.groups}</p>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{year._count?.groups ?? 0}</p>
              </div>
            </div>
          </section>

          {/* Periods */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">{t.detail.periodsTitle}</h3>
              {canManage && year.active && (
                <button
                  onClick={() => setShowAddPeriod(!showAddPeriod)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:opacity-80 transition-opacity"
                >
                  <Plus size={13} />
                  {t.detail.addPeriod}
                </button>
              )}
            </div>

            {showAddPeriod && (
              <div className="mb-4 p-4 rounded-xl border border-[hsla(263,90%,60%,0.2)] bg-[hsla(263,90%,60%,0.05)] space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">{t.modal.periodName}</label>
                    <input
                      type="text"
                      value={periodForm.name}
                      onChange={(e) => setPeriodForm({ ...periodForm, name: e.target.value })}
                      placeholder="Ej. Trimestre 1"
                      className="w-full input-glass text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">{t.modal.periodStart}</label>
                    <input type="date" value={periodForm.startDate} onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })} className="w-full input-glass text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">{t.modal.periodEnd}</label>
                    <input type="date" value={periodForm.endDate} onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })} className="w-full input-glass text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">{t.modal.periodOrder}</label>
                    <input
                      type="number"
                      min={1}
                      value={periodForm.order}
                      onChange={(e) => setPeriodForm({ ...periodForm, order: parseInt(e.target.value) || 1 })}
                      className="w-full input-glass text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddPeriod(false)} className="btn-secondary text-xs px-3 py-2">{t.modal.cancel}</button>
                  <button onClick={handleAddPeriod} disabled={loading} className="btn-primary text-xs px-3 py-2 disabled:opacity-50">
                    {loading ? t.modal.loading : t.modal.addPeriod}
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {sortedPeriods.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)] italic">{t.detail.noPeriods}</p>
              ) : (
                sortedPeriods.map((p) => (
                  <PeriodRow key={p.id} period={p} canManage={canManage && year.active} onDelete={handleDeletePeriod} t={t} />
                ))
              )}
            </div>
          </section>

          {/* Danger Zone */}
          {canManage && (
            <section>
              <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">Zona de riesgo</h3>
              <div className="space-y-3">
                {year.active && (
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[hsla(38,92%,52%,0.2)] bg-[hsla(38,92%,52%,0.05)]">
                    <div>
                      <p className="text-sm font-semibold text-[hsl(38,92%,60%)]">{t.detail.closeYear}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{t.detail.closeYearConfirm}</p>
                    </div>
                    {confirmClose ? (
                      <div className="flex gap-2">
                        <button onClick={() => setConfirmClose(false)} className="btn-secondary text-xs px-3 py-1.5">{t.modal.cancel}</button>
                        <button onClick={handleClose} disabled={loading} className="text-xs px-3 py-1.5 rounded-lg bg-[hsla(38,92%,52%,0.2)] border border-[hsla(38,92%,52%,0.3)] text-[hsl(38,92%,60%)] font-semibold disabled:opacity-50">
                          {loading ? "..." : t.detail.closeYear}
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmClose(true)} className="text-xs px-3 py-1.5 rounded-lg bg-[hsla(38,92%,52%,0.15)] text-[hsl(38,92%,60%)] font-semibold hover:bg-[hsla(38,92%,52%,0.25)] transition-colors">
                        <AlertTriangle size={13} className="inline mr-1" />
                        {t.detail.closeYear}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CREATE / EDIT MODAL ────────────────────────────────────────────

function SchoolYearModal({
  year,
  schools,
  isSuperAdmin,
  onClose,
  onSaved,
  t,
}: {
  year: SchoolYear | null;
  schools: School[];
  isSuperAdmin: boolean;
  onClose: () => void;
  onSaved: (y: SchoolYear) => void;
  t: any;
}) {
  const [form, setForm] = useState({
    name: year?.name || "",
    startDate: year ? year.startDate.split("T")[0] : "",
    endDate: year ? year.endDate.split("T")[0] : "",
    schoolId: year?.schoolId || "",
  });
  const [periods, setPeriods] = useState<PeriodFormEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addPeriod = () => {
    setPeriods([...periods, { name: "", startDate: "", endDate: "", order: periods.length + 1 }]);
  };

  const removePeriod = (idx: number) => {
    setPeriods(periods.filter((_, i) => i !== idx));
  };

  const updatePeriod = (idx: number, field: keyof PeriodFormEntry, value: string | number) => {
    setPeriods(periods.map((p, i) => (i === idx ? { ...p, [field]: value } : p)));
  };

  const handleSave = async () => {
    if (!form.name || !form.startDate || !form.endDate) {
      setError("Completa todos los campos requeridos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      let res: any;
      if (year) {
        res = await api.patch<ApiResponse<SchoolYear>>(`/academic/school-years/${year.id}`, {
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate,
        });
      } else {
        if (periods.length > 0) {
          for (let i = 0; i < periods.length; i++) {
            const p = periods[i];
            if (!p.name || !p.startDate || !p.endDate) {
              setError(`Completa todos los campos del periodo ${i + 1}.`);
              setLoading(false);
              return;
            }
          }
        }
        
        const payload: any = {
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate,
        };
        if (isSuperAdmin && form.schoolId) payload.schoolId = form.schoolId;
        if (periods.length > 0) payload.periods = periods;
        res = await api.post<ApiResponse<SchoolYear>>("/academic/school-years", payload);
      }
      onSaved(res.data.data);
    } catch (e: any) {
      const data = e?.response?.data;
      const msg = Array.isArray(data?.message) ? data.message[0] : data?.message;
      setError(msg || data?.error || t.alerts.errorCreate);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.5)" }}>
      <div className="w-full max-w-xl glass-panel border border-[var(--border-glass)] rounded-2xl shadow-main flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-glass)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {year ? t.modal.editTitle : t.modal.createTitle}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto custom-scrollbar flex-1 px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[hsla(354,85%,56%,0.1)] border border-[hsla(354,85%,56%,0.2)] text-[hsl(354,85%,70%)] text-sm">
              <XCircle size={14} /> {error}
            </div>
          )}

          {isSuperAdmin && !year && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t.modal.schoolLabel}</label>
              <select
                value={form.schoolId}
                onChange={(e) => setForm({ ...form, schoolId: e.target.value })}
                className="w-full input-glass text-sm"
              >
                <option value="">— Sin asignar (usar mi escuela) —</option>
                {schools.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t.modal.nameLabel}</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ej. Ciclo 2024-2025"
              className="w-full input-glass"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t.modal.startDateLabel}</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full input-glass" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{t.modal.endDateLabel}</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full input-glass" />
            </div>
          </div>

          {/* Periods section (only on create) */}
          {!year && (
            <div className="pt-2 border-t border-[var(--border-glass)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[var(--text-secondary)]">{t.modal.periodsSection}</h3>
                <button onClick={addPeriod} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--accent-primary)] hover:opacity-80">
                  <Plus size={13} /> {t.modal.addPeriod}
                </button>
              </div>
              <div className="space-y-3">
                {periods.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-[var(--border-glass)] bg-[hsla(240,16%,8%,0.5)] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[var(--accent-primary)]">Periodo {idx + 1}</span>
                      <button onClick={() => removePeriod(idx)} className="text-xs text-[var(--accent-danger)] hover:opacity-80">{t.modal.removePeriod}</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2">
                        <input type="text" value={p.name} onChange={(e) => updatePeriod(idx, "name", e.target.value)} placeholder={t.modal.periodName} className="w-full input-glass text-xs" />
                      </div>
                      <input type="date" value={p.startDate} onChange={(e) => updatePeriod(idx, "startDate", e.target.value)} className="input-glass text-xs" />
                      <input type="date" value={p.endDate} onChange={(e) => updatePeriod(idx, "endDate", e.target.value)} className="input-glass text-xs" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-glass)]">
          <button onClick={onClose} className="btn-secondary">{t.modal.cancel}</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary disabled:opacity-50">
            {loading ? t.modal.loading : t.modal.save}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────

export default function SchoolYearsPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language].schoolYears;

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const canManage =
    user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.SCHOOL_ADMIN;

  const [years, setYears] = useState<SchoolYear[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSchoolId, setFilterSchoolId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editYear, setEditYear] = useState<SchoolYear | null>(null);
  const [detailYear, setDetailYear] = useState<SchoolYear | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showAlert = useCallback((msg: string, type: "success" | "error") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 4000);
  }, []);

  const fetchYears = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isSuperAdmin ? "/academic/school-years/all" : "/academic/school-years";
      const res = await api.get<ApiResponse<SchoolYear[]>>(endpoint);
      setYears(res.data.data || []);
    } catch {
      showAlert(t.alerts.errorFetch, "error");
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, t.alerts.errorFetch, showAlert]);

  const fetchSchools = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await api.get<ApiResponse<any[]>>("/schools");
      setSchools(res.data.data || []);
    } catch {}
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchYears();
    fetchSchools();
  }, [fetchYears, fetchSchools]);

  const handleDelete = async (year: SchoolYear) => {
    if (!confirm(t.detail.deleteYearConfirm)) return;
    try {
      await api.delete(`/academic/school-years/${year.id}`);
      setYears((prev) => prev.filter((y) => y.id !== year.id));
      showAlert(t.alerts.successDelete, "success");
    } catch (e: any) {
      showAlert(e?.response?.data?.error || t.alerts.errorDelete, "error");
    }
  };

  const handleSaved = (saved: SchoolYear) => {
    setYears((prev) => {
      const idx = prev.findIndex((y) => y.id === saved.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
    setShowModal(false);
    setEditYear(null);
    showAlert(editYear ? t.alerts.successUpdate : t.alerts.successCreate, "success");
  };

  const handleDetailUpdated = (updated: SchoolYear) => {
    setYears((prev) => prev.map((y) => (y.id === updated.id ? updated : y)));
    setDetailYear(updated);
  };

  // Filter
  const filtered = years.filter((y) => {
    const matchSearch =
      y.name.toLowerCase().includes(search.toLowerCase()) ||
      (y.school?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchSchool = filterSchoolId ? y.schoolId === filterSchoolId : true;
    return matchSearch && matchSchool;
  });

  return (
    <ModuleGuard moduleKey="academic" requireSchoolContext={true}>
      <div className="flex flex-col h-full">
        {/* Alert */}
        {alert && (
          <AlertBanner message={alert.msg} type={alert.type} onClose={() => setAlert(null)} />
        )}

      {/* Modals */}
      {(showModal || editYear) && (
        <SchoolYearModal
          year={editYear}
          schools={schools}
          isSuperAdmin={isSuperAdmin}
          onClose={() => { setShowModal(false); setEditYear(null); }}
          onSaved={handleSaved}
          t={t}
        />
      )}
      {detailYear && (
        <SchoolYearDetail
          year={detailYear}
          canManage={canManage}
          onClose={() => setDetailYear(null)}
          onUpdated={handleDetailUpdated}
          t={t}
        />
      )}

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow">
            <CalendarDays size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">{t.title}</h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`${t.title}...`}
            className="w-full input-glass pl-9 text-sm"
          />
        </div>

        {/* School filter (super admin) */}
        {isSuperAdmin && schools.length > 0 && (
          <select
            value={filterSchoolId}
            onChange={(e) => setFilterSchoolId(e.target.value)}
            className="input-glass text-sm min-w-[180px]"
          >
            <option value="">{t.allSchools}</option>
            {schools.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        )}

        {/* Create button */}
        {canManage && (
          <button
            id="create-school-year-btn"
            onClick={() => { setEditYear(null); setShowModal(true); }}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={16} />
            {t.createBtn}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-[var(--border-glass)] overflow-hidden flex-1">
        {loading ? (
          <Loader />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-[var(--text-muted)]">
            <CalendarDays size={40} className="opacity-30" />
            <p className="text-sm">{t.noData}</p>
            {canManage && (
              <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 text-sm mt-2">
                <Plus size={15} /> {t.createBtn}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-glass)]">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.table.name}</th>
                  {isSuperAdmin && <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.table.school}</th>}
                  <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.table.startDate}</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.table.endDate}</th>
                  <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.table.periods}</th>
                  <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.table.groups}</th>
                  <th className="text-center px-5 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.table.status}</th>
                  <th className="text-right px-5 py-4 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((year) => {
                  const isExpanded = expandedId === year.id;
                  const sortedPeriods = [...(year.periods || [])].sort((a, b) => a.order - b.order);

                  return (
                    <React.Fragment key={year.id}>
                      <tr
                        className="border-b border-[var(--border-glass)] hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setDetailYear(year)}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${year.active ? "bg-[hsl(142,72%,45%)] shadow-[0_0_6px_hsl(142,72%,45%)]" : "bg-[var(--text-muted)]"}`} />
                            <span className="font-semibold text-[var(--text-primary)]">{year.name}</span>
                          </div>
                        </td>
                        {isSuperAdmin && (
                          <td className="px-5 py-4">
                            <span className="text-[var(--text-secondary)]">{year.school?.name || "—"}</span>
                            {year.school?.code && (
                              <span className="ml-2 text-xs text-[var(--text-muted)] font-mono">{year.school.code}</span>
                            )}
                          </td>
                        )}
                        <td className="px-5 py-4 text-[var(--text-secondary)]">{formatDate(year.startDate)}</td>
                        <td className="px-5 py-4 text-[var(--text-secondary)]">{formatDate(year.endDate)}</td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Layers size={14} className="text-[var(--accent-primary)]" />
                            <span className="font-semibold text-[var(--text-primary)]">{year.periods?.length ?? 0}</span>
                            {year.periods && year.periods.length > 0 && (
                              <button
                                onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : year.id); }}
                                className="ml-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                              >
                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="font-semibold text-[var(--text-primary)]">{year._count?.groups ?? 0}</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${year.active ? "bg-[hsla(142,72%,45%,0.12)] text-[hsl(142,72%,60%)]" : "bg-[hsla(354,85%,56%,0.12)] text-[hsl(354,85%,70%)]"}`}>
                            {year.active ? <CheckCircle size={11} /> : <XCircle size={11} />}
                            {year.active ? t.status.active : t.status.closed}
                          </span>
                        </td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {canManage && (
                              <>
                                <button
                                  id={`edit-year-${year.id}`}
                                  onClick={() => setEditYear(year)}
                                  title="Editar"
                                  className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:bg-[hsla(263,90%,60%,0.1)] transition-all"
                                >
                                  <Edit2 size={15} />
                                </button>
                                {!year.active && (year._count?.groups ?? 0) === 0 && (
                                  <button
                                    id={`delete-year-${year.id}`}
                                    onClick={() => handleDelete(year)}
                                    title="Eliminar"
                                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-danger)] hover:bg-[hsla(354,85%,56%,0.1)] transition-all"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Expanded periods row */}
                      {isExpanded && sortedPeriods.length > 0 && (
                        <tr>
                          <td colSpan={isSuperAdmin ? 8 : 7} className="px-8 py-3 bg-[hsla(240,16%,6%,0.5)] border-b border-[var(--border-glass)]">
                            <div className="flex flex-wrap gap-2">
                              {sortedPeriods.map((p) => (
                                <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[hsla(263,90%,60%,0.08)] border border-[hsla(263,90%,60%,0.15)]">
                                  <span className="text-xs font-bold text-[var(--accent-primary)]">{p.order}.</span>
                                  <span className="text-xs font-medium text-[var(--text-primary)]">{p.name}</span>
                                  <span className="text-xs text-[var(--text-muted)]">{formatDate(p.startDate)} — {formatDate(p.endDate)}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </ModuleGuard>
  );
}
