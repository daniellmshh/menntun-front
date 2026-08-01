"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FileText, Plus, Search, Edit2, Trash2, X, Loader2 } from "lucide-react";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";

export default function DocumentsCatalogPage() {
  const { language } = useLanguageStore();
  const t = translations[language as keyof typeof translations];

  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "",
    slug: "",
    descripcion: "",
    obligatorio: false,
    orden: 0,
  });

  const fetchDocumentos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/enrollments/tipos-documento");
      setDocumentos(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocumentos();
  }, [fetchDocumentos]);

  const handleOpenModal = (item?: any) => {
    setFormError(null);
    if (item) {
      setEditingItem(item);
      setFormData({
        nombre: item.nombre,
        slug: item.slug,
        descripcion: item.descripcion || "",
        obligatorio: item.obligatorio ?? false,
        orden: Number(item.orden || 0),
      });
    } else {
      setEditingItem(null);
      setFormData({
        nombre: "",
        slug: "",
        descripcion: "",
        obligatorio: false,
        orden: 0,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        orden: Number(formData.orden)
      };

      if (editingItem) {
        await api.patch(`/enrollments/tipos-documento/${editingItem.id}`, payload);
      } else {
        await api.post("/enrollments/tipos-documento", payload);
      }
      setIsModalOpen(false);
      fetchDocumentos();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      setFormError(Array.isArray(msg) ? msg.join(", ") : msg || "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este tipo de documento?")) return;
    try {
      await api.delete(`/enrollments/tipos-documento/${id}`);
      fetchDocumentos();
    } catch (e: any) {
      const msg = e?.response?.data?.message;
      alert(Array.isArray(msg) ? msg.join(", ") : msg || "Error al eliminar");
    }
  };

  const filteredData = documentos.filter((d) =>
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.slug.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => (a.orden || 0) - (b.orden || 0));

  if (loading) return <Loader />;

  return (
    <ModuleGuard moduleKey="documents">
      <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow shrink-0">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
                Catálogo de Documentos
              </h1>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Configura los tipos de documentos requeridos durante las inscripciones.
              </p>
            </div>
          </div>
          <button onClick={() => handleOpenModal()} className="glass-button flex items-center gap-2">
            <Plus size={20} /> Nuevo Documento
          </button>
        </header>

        <div className="glass-panel p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
              <input
                type="text"
                placeholder="Buscar documentos..."
                className="w-full !pl-10 glass-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-glass)] text-[var(--text-secondary)] text-sm">
                  <th className="p-4 font-medium">Orden</th>
                  <th className="p-4 font-medium">Nombre</th>
                  <th className="p-4 font-medium">Identificador (Slug)</th>
                  <th className="p-4 font-medium">Obligatorio</th>
                  <th className="p-4 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-[var(--text-secondary)]">
                      No se encontraron tipos de documentos.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((doc) => (
                    <tr key={doc.id} className="border-b border-[var(--border-glass)] hover:bg-white/5 transition-colors">
                      <td className="p-4">{doc.orden}</td>
                      <td className="p-4 font-medium text-white">{doc.nombre}</td>
                      <td className="p-4 text-[var(--text-secondary)]"><span className="px-2 py-1 bg-black/40 rounded-md text-xs font-mono">{doc.slug}</span></td>
                      <td className="p-4">
                        {doc.obligatorio ? (
                          <span className="px-3 py-1 rounded-full bg-[var(--status-success)]/20 text-[var(--status-success)] text-xs font-medium border border-[var(--status-success)]/30">
                            Sí
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-white/10 text-[var(--text-secondary)] text-xs font-medium">
                            No
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(doc)}
                            className="p-2 rounded-lg hover:bg-white/10 text-[var(--text-secondary)] hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 rounded-lg hover:bg-[var(--status-danger)]/20 text-[var(--text-secondary)] hover:text-[var(--status-danger)] transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 relative border border-[var(--border-glass)] shadow-2xl">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
              <FileText className="text-[var(--accent-primary)]" size={24} />
              {editingItem ? "Editar Documento" : "Nuevo Documento"}
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-[var(--status-danger)]/20 border border-[var(--status-danger)]/50 text-[var(--status-danger)] text-sm">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Nombre *</label>
                <input
                  required
                  className="glass-input w-full"
                  placeholder="Ej. Acta de Nacimiento"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Identificador (Slug) *</label>
                <input
                  required
                  className="glass-input w-full"
                  placeholder="Ej. acta-nacimiento"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">Usado internamente, sin espacios ni caracteres especiales.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Descripción</label>
                <input
                  className="glass-input w-full"
                  placeholder="Instrucciones breves..."
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Orden de visualización</label>
                  <input
                    type="number"
                    min="0"
                    className="glass-input w-full"
                    value={formData.orden}
                    onChange={(e) => setFormData({ ...formData, orden: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center mt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-secondary)]">
                    <input
                      type="checkbox"
                      checked={formData.obligatorio}
                      onChange={(e) => setFormData({ ...formData, obligatorio: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--border-glass)] bg-black/40 text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] focus:ring-offset-0"
                    />
                    Es obligatorio
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[var(--border-glass)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="glass-button-secondary flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="glass-button flex-1 flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModuleGuard>
  );
}
