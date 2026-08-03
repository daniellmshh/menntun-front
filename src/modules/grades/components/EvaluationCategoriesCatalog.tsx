"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Edit2, Plus, Tags, X } from "lucide-react";
import Loader from "@/components/shared/Loader";
import api from "@/lib/api/axios";

type EvaluationCategory = {
  id: string;
  name: string;
  description: string | null;
  defaultWeight: number | null;
  order: number;
  active: boolean;
};

type CategoryForm = {
  name: string;
  description: string;
  defaultWeight: string;
  order: string;
  active: boolean;
};

const emptyForm: CategoryForm = {
  name: "",
  description: "",
  defaultWeight: "",
  order: "0",
  active: true,
};

function getErrorMessage(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) return "No fue posible guardar la categoría.";
  const response = error.response;
  if (!response || typeof response !== "object" || !("data" in response)) return "No fue posible guardar la categoría.";
  const data = response.data;
  if (!data || typeof data !== "object" || !("message" in data)) return "No fue posible guardar la categoría.";
  const message = data.message;
  return Array.isArray(message) ? message.join(", ") : typeof message === "string" ? message : "No fue posible guardar la categoría.";
}

export default function EvaluationCategoriesCatalog() {
  const [categories, setCategories] = useState<EvaluationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EvaluationCategory | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/grades/categories");
      setCategories(response.data?.data ?? []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCategories();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCategories]);

  const openCreate = () => {
    setEditingCategory(null);
    setForm(emptyForm);
    setError(null);
    setIsModalOpen(true);
  };

  const openEdit = (category: EvaluationCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description ?? "",
      defaultWeight: category.defaultWeight === null ? "" : String(category.defaultWeight),
      order: String(category.order),
      active: category.active,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setEditingCategory(null);
    setForm(emptyForm);
  };

  async function saveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      defaultWeight: form.defaultWeight === "" ? undefined : Number(form.defaultWeight),
      order: Number(form.order || 0),
      ...(editingCategory ? { active: form.active } : {}),
    };

    try {
      if (editingCategory) {
        await api.patch(`/grades/categories/${editingCategory.id}`, payload);
      } else {
        await api.post("/grades/categories", payload);
      }
      setIsModalOpen(false);
      setEditingCategory(null);
      setForm(emptyForm);
      await loadCategories();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-glow">
            <Tags className="text-white" />
          </div>
          <div>
            <h1 className="gradient-text text-3xl font-extrabold">Categorías de evaluación</h1>
            <p className="text-sm text-[var(--text-secondary)]">Define los tipos de evidencia que utilizarán las evaluaciones del colegio.</p>
          </div>
        </div>
        <button type="button" onClick={openCreate} className="glass-button">
          <Plus size={18} /> Nueva categoría
        </button>
      </header>

      {error && !isModalOpen && <div className="rounded-xl border border-[var(--accent-danger)]/40 bg-[var(--accent-danger)]/10 p-3 text-sm text-[var(--text-primary)]">{error}</div>}

      {loading ? <Loader minHeight="300px" text="Cargando categorías..." /> : (
        <section className="glass-panel overflow-hidden rounded-2xl">
          <div className="border-b border-[var(--border-glass)] p-5">
            <h2 className="font-bold">Catálogo activo e histórico</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Las categorías inactivas se conservan para proteger evaluaciones ya registradas, pero no se podrán elegir en nuevas evidencias.</p>
          </div>
          <div className="divide-y divide-[var(--border-glass)]">
            {categories.length ? categories.map((category) => (
              <article key={category.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-[var(--text-primary)]">{category.name}</h3>
                    <span className={category.active ? "rounded-full bg-[var(--accent-success)]/15 px-2.5 py-1 text-xs font-semibold text-[var(--accent-success)]" : "rounded-full bg-[var(--bg-surface)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]"}>
                      {category.active ? "Activa" : "Inactiva"}
                    </span>
                  </div>
                  {category.description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{category.description}</p>}
                  <p className="mt-2 text-xs text-[var(--text-muted)]">Orden {category.order} · Peso sugerido: {category.defaultWeight ?? 0}%</p>
                </div>
                <button type="button" onClick={() => openEdit(category)} className="glass-button-secondary self-start md:self-auto">
                  <Edit2 size={16} /> Editar
                </button>
              </article>
            )) : <p className="p-10 text-center text-[var(--text-muted)]">Aún no hay categorías configuradas.</p>}
          </div>
        </section>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-panel relative w-full max-w-lg rounded-2xl p-6 shadow-main" aria-busy={submitting}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">{editingCategory ? "Editar categoría" : "Nueva categoría"}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Esta configuración estará disponible para los grupos de tu escuela.</p>
              </div>
              <button type="button" disabled={submitting} onClick={closeModal} className="rounded-lg p-2 text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]">
                <X size={18} />
              </button>
            </div>
            {error && <div className="mb-4 rounded-xl border border-[var(--accent-danger)]/40 bg-[var(--accent-danger)]/10 p-3 text-sm text-[var(--text-primary)]">{error}</div>}
            <form onSubmit={saveCategory} className="space-y-4">
              <label className="block space-y-1 text-sm"><span>Nombre</span><input required maxLength={100} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="glass-input w-full" placeholder="Ej. Proyecto" /></label>
              <label className="block space-y-1 text-sm"><span>Descripción <span className="text-[var(--text-muted)]">(opcional)</span></span><textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="glass-input min-h-24 w-full" placeholder="Qué tipo de evidencia se registrará" /></label>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-1 text-sm"><span>Peso sugerido (%)</span><input type="number" min="0" max="100" step="0.01" value={form.defaultWeight} onChange={(event) => setForm((current) => ({ ...current, defaultWeight: event.target.value }))} className="glass-input w-full" /></label><label className="block space-y-1 text-sm"><span>Orden</span><input type="number" min="0" step="1" value={form.order} onChange={(event) => setForm((current) => ({ ...current, order: event.target.value }))} className="glass-input w-full" /></label></div>
              {editingCategory && <label className="flex items-center gap-3 rounded-xl border border-[var(--border-glass)] p-3 text-sm"><input checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} type="checkbox" /> Disponible para nuevas evaluaciones</label>}
              <div className="flex justify-end gap-3 pt-2"><button type="button" disabled={submitting} onClick={closeModal} className="glass-button-secondary">Cancelar</button><button disabled={submitting} className="glass-button min-w-40 justify-center">{submitting ? "Guardando categoría..." : "Guardar categoría"}</button></div>
            </form>
            {submitting && <div className="absolute inset-0 grid place-items-center rounded-2xl bg-[var(--bg-base)]/75 backdrop-blur-sm"><p className="rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-semibold">Guardando cambios...</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
