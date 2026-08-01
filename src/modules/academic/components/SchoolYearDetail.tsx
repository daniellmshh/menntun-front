"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CalendarDays, CheckCircle, Loader2, Plus, Trash2, X, XCircle } from "lucide-react";
import api from "@/lib/api/axios";
import { ApiResponse } from "@/types";

interface Period { id: string; schoolYearId: string; name: string; startDate: string; endDate: string; order: number; }
interface SchoolYearTranslations {
  modal: Record<string, string>;
  alerts: Record<string, string>;
  detail: Record<string, string>;
  status: Record<string, string>;
}
interface SchoolYear { id: string; schoolId: string; name: string; startDate: string; endDate: string; active: boolean; createdAt: string; periods: Period[]; school?: { name: string; code: string }; _count?: { groups: number }; }

const formatDate = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" }) : "—";

// ─── PERIOD ROW ─────────────────────────────────────────────────────

function PeriodRow({
  period,
  canManage,
  isDeleting,
  onDelete,
  t,
}: {
  period: Period;
  canManage: boolean;
  isDeleting?: boolean;
  onDelete: (id: string) => void;
  t: SchoolYearTranslations;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-glass)] group">
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
          disabled={isDeleting}
          className={`p-1 rounded transition-all ${
            isDeleting 
              ? "opacity-100 text-[var(--text-secondary)]" 
              : "opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-[var(--accent-danger)]"
          }`}
          title={t.modal.removePeriod}
        >
          {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      )}
    </div>
  );
}

// ─── SCHOOL YEAR DETAIL DRAWER ──────────────────────────────────────

export default function SchoolYearDetail({
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
  t: SchoolYearTranslations;
}) {
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [periodForm, setPeriodForm] = useState({ name: "", startDate: "", endDate: "", order: 1 });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ msg: string; type: "error" | "success" } | null>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const [deletingPeriodId, setDeletingPeriodId] = useState<string | null>(null);

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
    setDeletingPeriodId(periodId);
    try {
      await api.delete(`/academic/school-years/${year.id}/periods/${periodId}`);
      const res = await api.get<ApiResponse<SchoolYear>>(`/academic/school-years/${year.id}`);
      onUpdated(res.data.data);
      showAlert(t.alerts.successDeletePeriod, "success");
    } catch {
      showAlert(t.alerts.errorDeletePeriod, "error");
    } finally {
      setDeletingPeriodId(null);
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

  return createPortal(
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
                      className="w-full glass-input text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">{t.modal.periodStart}</label>
                    <input type="date" value={periodForm.startDate} onChange={(e) => setPeriodForm({ ...periodForm, startDate: e.target.value })} className="w-full glass-input text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">{t.modal.periodEnd}</label>
                    <input type="date" value={periodForm.endDate} onChange={(e) => setPeriodForm({ ...periodForm, endDate: e.target.value })} className="w-full glass-input text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-secondary)] mb-1">{t.modal.periodOrder}</label>
                    <input
                      type="number"
                      min={1}
                      value={periodForm.order}
                      onChange={(e) => setPeriodForm({ ...periodForm, order: parseInt(e.target.value) || 1 })}
                      className="w-full glass-input text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setShowAddPeriod(false)} className="glass-button-secondary">{t.modal.cancel}</button>
                  <button onClick={handleAddPeriod} disabled={loading} className="glass-button text-xs px-3 py-2 disabled:opacity-50">
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
                  <PeriodRow 
                    key={p.id} 
                    period={p} 
                    canManage={canManage && year.active} 
                    isDeleting={deletingPeriodId === p.id}
                    onDelete={handleDeletePeriod} 
                    t={t} 
                  />
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
                        <button onClick={() => setConfirmClose(false)} className="glass-button-secondary">{t.modal.cancel}</button>
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
    </div>,
    document.body
  );
}

// ─── CREATE / EDIT MODAL ────────────────────────────────────────────
