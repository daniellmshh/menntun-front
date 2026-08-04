"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FolderOpen, Plus, Search, Edit2, Trash2, X, Loader2 } from "lucide-react";
import DashboardPageShell from "@/components/shared/DashboardPageShell";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";

export default function CatalogoFinanzasPage() {
  const { language } = useLanguageStore();
  const t = translations[language as keyof typeof translations];

  const [catalogo, setCatalogo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "OTRO",
    monto: 0,
    activo: true,
  });

  const fetchCatalogo = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/finances/catalogo");
      setCatalogo(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalogo();
  }, [fetchCatalogo]);

  const handleOpenModal = (item?: any) => {
    setFormError(null);
    if (item) {
      setEditingItem(item);
      setFormData({
        nombre: item.nombre,
        tipo: item.tipo,
        monto: Number(item.monto),
        activo: item.activo,
      });
    } else {
      setEditingItem(null);
      setFormData({
        nombre: "",
        tipo: "OTRO",
        monto: 0,
        activo: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.patch(`/finances/catalogo/${editingItem.id}`, formData);
      } else {
        await api.post("/finances/catalogo", formData);
      }
      setIsModalOpen(false);
      fetchCatalogo();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg || "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas deshabilitar este concepto?")) return;
    try {
      await api.delete(`/finances/catalogo/${id}`);
      fetchCatalogo();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(", ") : msg || "Error al eliminar");
    }
  };

  const filteredData = catalogo.filter((c) =>
    c.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModuleGuard moduleKey="finances" requireSchoolContext={true}>
      <DashboardPageShell>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow shrink-0">
                  <FolderOpen size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
                    Catálogo de Conceptos
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                    Gestiona los conceptos de cobro recurrentes e inscripciones.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="glass-button"
              >
                <Plus size={20} />
                Nuevo Concepto
              </button>
            </div>

            <div className="glass-panel rounded-2xl border border-[var(--border-glass)] shadow-main">
              <div className="p-5 border-b border-[var(--border-glass)] flex items-center justify-between">
                <div className="relative max-w-sm w-full">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                  />
                  <input
                    type="text"
                    placeholder="Buscar concepto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full !pl-10 glass-input"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-glass)] bg-white/[0.02]">
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Concepto
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Tipo
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Monto Base
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Estado
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-glass)]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-0 border-0">
                          <Loader minHeight="200px" />
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-[var(--text-muted)]"
                        >
                          No hay conceptos en el catálogo.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/[0.01] transition-colors"
                        >
                          <td className="p-4 font-semibold text-[var(--text-primary)]">
                            {item.nombre}
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-white/10">
                              {item.tipo}
                            </span>
                          </td>
                          <td className="p-4 text-[var(--text-secondary)]">
                            ${Number(item.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                item.activo
                                  ? "bg-[hsla(142,72%,45%,0.15)] text-[hsl(142,72%,60%)]"
                                  : "bg-[hsla(354,85%,56%,0.15)] text-[hsl(354,85%,70%)]"
                              }`}
                            >
                              {item.activo ? "Activo" : "Inactivo"}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenModal(item)}
                                className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                              {item.activo && (
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--accent-danger)] transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
      </DashboardPageShell>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl shadow-main animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
              <h2 className="text-xl font-bold">
                {editingItem ? "Editar Concepto" : "Nuevo Concepto"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {formError}
                </div>
              )}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Nombre del Concepto
                </label>
                <input
                  required
                  className="glass-input w-full"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Tipo
                </label>
                <select
                  required
                  className="glass-input w-full"
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                >
                  <option value="INSCRIPCION_AUTOMATICO">Inscripción (Automático)</option>
                  <option value="REINSCRIPCION_AUTOMATICO">Reinscripción (Automático)</option>
                  <option value="COLEGIATURA_MENSUAL">Colegiatura Mensual</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Monto Base
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="glass-input w-full"
                  value={formData.monto}
                  onChange={(e) =>
                    setFormData({ ...formData, monto: e.target.value === "" ? 0 : parseFloat(e.target.value) })
                  }
                />
              </div>
              {editingItem && (
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) =>
                      setFormData({ ...formData, activo: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-[var(--border-glass)] bg-white/10 accent-[var(--accent-primary)]"
                  />
                  <label htmlFor="activo" className="text-sm text-[var(--text-secondary)]">
                    Concepto Activo
                  </label>
                </div>
              )}
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="glass-button-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={submitting} className="glass-button flex items-center gap-2">
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  <span>Guardar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModuleGuard>
  );
}
