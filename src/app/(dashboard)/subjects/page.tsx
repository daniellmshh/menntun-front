"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  Building2,
  Hash,
  FileSpreadsheet,
  Tag,
  AlignLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import * as XLSX from "xlsx";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import ConfirmDeleteModal from "@/components/shared/ConfirmDeleteModal";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { ApiResponse, UserRole } from "@/types";

// ─── TYPES ──────────────────────────────────────────────────────────

interface School {
  id: string;
  name: string;
  code: string;
}

interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string | null;
  description: string | null;
  createdAt: string;
  school?: { name: string; code: string };
  _count?: { teachers: number };
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
      className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-medium shadow-xl animate-fade-in ${
        type === "success"
          ? "bg-[hsla(142,72%,45%,0.1)] border border-[hsla(142,72%,45%,0.2)] text-[hsl(142,72%,45%)]"
          : "bg-[hsla(354,85%,56%,0.1)] border border-[hsla(354,85%,56%,0.2)] text-[hsl(354,85%,56%)]"
      }`}
    >
      {type === "success" ? (
        <CheckCircle size={18} />
      ) : (
        <XCircle size={18} />
      )}
      <span className="text-[var(--text-primary)]">{message}</span>
      <button
        onClick={onClose}
        className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────

export default function SubjectsPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isAdmin = isSuperAdmin || user?.role === UserRole.SCHOOL_ADMIN;
  const isTeacher = user?.role === UserRole.TEACHER;

  // ── State ──────────────────────────────────────────────────────
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>("all");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Data fetch ─────────────────────────────────────────────────
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<Subject[]>>("/academic/subjects");
      setSubjects(res.data.data ?? []);
    } catch {
      setAlert({ message: "Error al cargar las materias", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSchools = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await api.get<ApiResponse<School[]>>("/schools");
      setSchools(res.data.data ?? []);
    } catch {}
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchSubjects();
    fetchSchools();
  }, [fetchSubjects, fetchSchools]);

  // ── Filtered list ──────────────────────────────────────────────
  const filteredSubjects = subjects.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.name.toLowerCase().includes(q) ||
      (s.code ?? "").toLowerCase().includes(q) ||
      (s.description ?? "").toLowerCase().includes(q);
    const matchesSchool =
      selectedSchoolId === "all" || s.schoolId === selectedSchoolId;
    return matchesSearch && matchesSchool;
  });

  // ── Drawer handlers ────────────────────────────────────────────
  function openCreate() {
    setEditingSubject(null);
    setFormData({ name: "", code: "", description: "" });
    setFormError("");
    setDrawerOpen(true);
  }

  function openEdit(s: Subject) {
    setEditingSubject(s);
    setFormData({ name: s.name, code: s.code ?? "", description: s.description ?? "" });
    setFormError("");
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingSubject(null);
    setFormError("");
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      setFormError("El nombre de la materia es obligatorio");
      return;
    }
    setFormLoading(true);
    setFormError("");
    try {
      if (editingSubject) {
        await api.patch(`/academic/subjects/${editingSubject.id}`, formData);
        setAlert({ message: `Materia "${formData.name}" actualizada`, type: "success" });
      } else {
        await api.post("/academic/subjects", formData);
        setAlert({ message: `Materia "${formData.name}" creada exitosamente`, type: "success" });
      }
      closeDrawer();
      await fetchSubjects();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Error al guardar la materia";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  }

  // ── Delete handlers ────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/academic/subjects/${deleteTarget.id}`);
      setAlert({ message: `Materia "${deleteTarget.name}" eliminada`, type: "success" });
      setDeleteTarget(null);
      await fetchSubjects();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Error al eliminar la materia";
      setAlert({ message: msg, type: "error" });
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Excel export ───────────────────────────────────────────────
  function exportToExcel() {
    const rows = filteredSubjects.map((s) => ({
      Nombre: s.name,
      Código: s.code ?? "",
      Descripción: s.description ?? "",
      "Asignaciones de Maestros": s._count?.teachers ?? 0,
      Plantel: s.school?.name ?? "",
      "Fecha de Creación": new Date(s.createdAt).toLocaleDateString("es-MX"),
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Materias");
    XLSX.writeFile(wb, `materias_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  // ── Helpers ────────────────────────────────────────────────────
  function getInitials(name: string) {
    return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  }

  function levelColor(idx: number) {
    const colors = [
      { bg: "hsl(263,90%,20%)", text: "hsl(263,90%,80%)", border: "hsl(263,90%,40%)" },
      { bg: "hsl(190,95%,15%)", text: "hsl(190,95%,70%)", border: "hsl(190,95%,40%)" },
      { bg: "hsl(142,72%,15%)", text: "hsl(142,72%,60%)", border: "hsl(142,72%,35%)" },
      { bg: "hsl(38,92%,15%)", text: "hsl(38,92%,65%)", border: "hsl(38,92%,40%)" },
      { bg: "hsl(354,85%,15%)", text: "hsl(354,85%,70%)", border: "hsl(354,85%,40%)" },
    ];
    return colors[idx % colors.length];
  }

  if (loading) return <Loader />;

  return (
    <ModuleGuard moduleKey="academic">
      {/* Alert */}
      {alert && (
        <AlertBanner
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="p-8 font-sans min-h-screen">

        {/* ─── HEADER ───────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow">
              <BookOpen size={26} className="text-white" />
            </div>
            <div>
              <h1 className="m-0 text-3xl font-extrabold leading-tight bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] bg-clip-text text-transparent inline-block">
                Catálogo de Materias
              </h1>
              <p className="mt-1 text-[var(--text-secondary)] text-sm">
                {filteredSubjects.length} materia{filteredSubjects.length !== 1 ? "s" : ""} en el plantel
              </p>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={exportToExcel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-glass)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all text-sm font-medium"
              >
                <FileSpreadsheet size={16} />
                Exportar Excel
              </button>
              <button
                onClick={openCreate}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.6rem 1.2rem", borderRadius: 10,
                  background: "linear-gradient(135deg, hsl(263,90%,50%), hsl(263,90%,60%))",
                  border: "none", color: "white", cursor: "pointer",
                  fontSize: "0.875rem", fontWeight: 600, fontFamily: "Outfit, sans-serif",
                  boxShadow: "0 4px 14px hsla(263,90%,60%,0.4)", transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px hsla(263,90%,60%,0.55)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 14px hsla(263,90%,60%,0.4)"; }}
              >
                <Plus size={16} />
                Nueva Materia
              </button>
            </div>
          )}
        </div>

        {/* ─── TOOLBAR ──────────────────────────────────────────────── */}
        <div className="glass-panel border border-[var(--border-glass)] rounded-2xl p-4 mb-6 flex gap-4 flex-wrap items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full !pl-10"
            />
          </div>

          {isSuperAdmin && schools.length > 0 && (
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="glass-input pl-8 appearance-none cursor-pointer"
              >
                <option value="all">Todos los planteles</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ─── SUBJECTS GRID ────────────────────────────────────────── */}
        {filteredSubjects.length === 0 ? (
          <div className="glass-panel text-center py-20 px-8 rounded-3xl border border-dashed border-[var(--border-glass)]">
            <BookOpen size={52} className="mx-auto text-[var(--text-muted)] mb-4" />
            <h3 className="text-[var(--text-primary)] font-bold text-lg mb-2">
              {searchQuery ? "Sin resultados" : "Sin materias registradas"}
            </h3>
            <p className="text-[var(--text-secondary)] text-sm">
              {searchQuery
                ? "Intenta con otro término de búsqueda"
                : isAdmin
                ? "Crea tu primera materia con el botón \"Nueva Materia\""
                : "No hay materias registradas en este plantel aún."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredSubjects.map((s, idx) => {
              const color = levelColor(idx);
              return (
                <div
                  key={s.id}
                  className="glass-panel rounded-2xl p-5 border border-[var(--border-glass)] relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent-primary)] hover:shadow-glow group cursor-default"
                >
                  {/* Decorative corner */}
                  <div
                    className="absolute top-0 right-0 w-20 h-20 opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-40"
                    style={{ background: `radial-gradient(circle at top right, ${color.bg}, transparent 70%)` }}
                  />

                  {/* Header row */}
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{ background: color.bg, color: color.text, borderColor: color.border }}
                    >
                      <span className="text-[0.8rem] font-bold tracking-wide">{getInitials(s.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="m-0 text-base font-bold text-[var(--text-primary)] truncate">
                        {s.name}
                      </h3>
                      {(s.code || s.school) && (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {s.code && (
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-black/20 text-[var(--text-secondary)] border border-[var(--border-glass)]">
                              {s.code}
                            </span>
                          )}
                          {isSuperAdmin && s.school && (
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-[hsla(190,95%,50%,0.1)] text-[hsl(190,95%,50%)] border border-[hsla(190,95%,50%,0.2)]">
                              {s.school.code}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {s.description && (
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed h-8 mb-4">
                      {s.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-glass)]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <Activity size={14} className="text-[var(--text-muted)]" />
                        <span className="text-xs font-semibold">
                          {s._count?.teachers ?? 0} asignacion{(s._count?.teachers ?? 0) !== 1 ? "es" : ""}
                        </span>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openEdit(s)}
                          title="Editar materia"
                          className="w-8 h-8 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-glass)] text-[var(--text-secondary)] flex items-center justify-center hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          title="Eliminar materia"
                          disabled={(s._count?.teachers ?? 0) > 0}
                          className="w-8 h-8 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-glass)] text-[var(--text-secondary)] flex items-center justify-center hover:bg-red-500/10 hover:text-[hsl(354,85%,60%)] hover:border-[hsl(354,85%,30%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── DRAWER — CREAR / EDITAR ──────────────────────────────── */}
      {mounted && drawerOpen && createPortal(
        <div className="fixed inset-0 z-[1050] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) closeDrawer(); }}>
          <div className="w-full max-w-md max-h-[90vh] glass-panel border border-[var(--border-glass)] rounded-2xl flex flex-col animate-scale-in shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            
            <div className="flex items-center gap-4 px-7 py-6 border-b border-[var(--border-glass)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_top_right,var(--accent-primary),transparent_70%)] opacity-10 pointer-events-none" />
              
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow">
                {editingSubject ? <Edit2 size={20} className="text-white" /> : <Plus size={20} className="text-white" />}
              </div>
              <div>
                <h2 className="m-0 text-xl font-bold text-[var(--text-primary)]">
                  {editingSubject ? "Editar Materia" : "Nueva Materia"}
                </h2>
                <p className="m-0 text-sm text-[var(--text-secondary)]">
                  {editingSubject ? `Editando: ${editingSubject.name}` : "Registra una nueva materia"}
                </p>
              </div>
              <button onClick={closeDrawer} className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-2 rounded-lg hover:bg-white/5">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-7 custom-scrollbar">
              {formError && (
                <div className="mb-5 p-3.5 rounded-xl text-sm font-medium border border-[hsla(354,85%,56%,0.2)] bg-[hsla(354,85%,56%,0.1)] text-[hsl(354,85%,65%)] flex items-start gap-2.5">
                  <XCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="mb-5">
                <label className="block mb-2 text-sm font-semibold text-[var(--text-secondary)]">
                  Nombre de la Materia *
                </label>
                <div className="relative">
                  <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-primary)]" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    placeholder="ej. Matemáticas, Español..."
                    className="glass-input w-full !pl-10"
                  />
                </div>
              </div>

              <div className="mb-5">
                <label className="block mb-2 text-sm font-semibold text-[var(--text-secondary)]">
                  Código (opcional)
                </label>
                <div className="relative">
                  <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--accent-secondary)]" />
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="ej. MAT, ESP, CIEN"
                    maxLength={10}
                    className="glass-input w-full !pl-10 font-mono tracking-wide"
                  />
                </div>
                <p style={{ margin: "0.35rem 0 0", fontSize: "0.78rem", color: "hsl(240,6%,50%)" }}>
                  Abreviatura corta para reportes y listas
                </p>
              </div>

              {/* Descripción */}
              <div className="mb-6">
                <label className="block mb-2 text-sm font-semibold text-[var(--text-secondary)]">
                  Descripción (opcional)
                </label>
                <div className="relative">
                  <AlignLeft size={15} className="absolute left-3 top-3.5 text-[var(--text-muted)]" />
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Descripción o notas sobre la materia..."
                    rows={3}
                    className="glass-input w-full !pl-10 py-2.5 resize-y min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-7 py-5 border-t border-[var(--border-glass)] flex gap-3">
              <button
                onClick={closeDrawer}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--bg-panel)] hover:bg-[var(--bg-panel-hover)] border border-[var(--border-glass)] text-[var(--text-secondary)] transition-all text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={formLoading}
                className="flex-[2] glass-button bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white py-2.5 text-sm border-none shadow-glow flex items-center justify-center gap-2"
              >
                {formLoading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <ChevronRight size={16} />
                    {editingSubject ? "Actualizar Materia" : "Crear Materia"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ─── MODAL ELIMINAR ───────────────────────────────────────── */}
      {mounted && deleteTarget && createPortal(
        <ConfirmDeleteModal
          title="Eliminar Materia"
          description={
            <>
              ¿Estás seguro de eliminar la materia <strong className="text-[var(--text-primary)]">"{deleteTarget.name}"</strong>?
            </>
          }
          onCancel={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          isLoading={deleteLoading}
        />
      , document.body)}

    </ModuleGuard>
  );
}
