"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Award, BookOpenCheck, Plus, RefreshCw, Settings2, Tags } from "lucide-react";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";

type Category = { id: string; name: string; defaultWeight?: number | null; active: boolean };
type Group = { id: string; name: string; grade?: { name: string }; schoolYear?: { name: string; periods?: Period[] } };
type Period = { id: string; name: string };
type Subject = { id: string; name: string; assigned?: boolean; teacher?: unknown };
type Evaluation = { id: string; title: string; evaluationDate: string; maxScore: number; status: string; category: Category; subject: Subject; _count: { scores: number } };
type Policy = { calculationMode: "WEIGHTED_CATEGORIES" | "AVERAGE"; scaleMax: number; passingScore: number; weights: { categoryId: string; weight: number }[] };

export default function GradesPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "SCHOOL_ADMIN" || user?.role === "SUPER_ADMIN";
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [showCategory, setShowCategory] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [policy, setPolicy] = useState<Policy>({ calculationMode: "WEIGHTED_CATEGORIES", scaleMax: 10, passingScore: 6, weights: [] });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeGroup = useMemo(() => groups.find((item) => item.id === groupId), [groups, groupId]);
  const periods = activeGroup?.schoolYear?.periods ?? [];

  const loadInitial = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [groupsResponse, categoriesResponse] = await Promise.all([api.get("/academic/groups"), api.get("/grades/categories")]);
      const nextGroups = groupsResponse.data.data ?? [];
      setGroups(nextGroups); setCategories(categoriesResponse.data.data ?? []);
      if (nextGroups[0]) setGroupId(nextGroups[0].id);
    } catch (requestError: any) { setError(requestError?.response?.data?.message ?? "No fue posible cargar evaluaciones."); }
    finally { setLoading(false); }
  }, []);

  const loadGroup = useCallback(async () => {
    if (!groupId) return;
    try {
      const response = await api.get(`/academic/groups/${groupId}/subjects`);
      const nextSubjects = (response.data.data ?? []).filter((item: Subject) => item.assigned || isAdmin);
      setSubjects(nextSubjects);
      setSubjectId(nextSubjects[0]?.id ?? "");
      const group = groups.find((item) => item.id === groupId);
      setPeriodId(group?.schoolYear?.periods?.[0]?.id ?? "");
    } catch { setSubjects([]); setSubjectId(""); }
  }, [groupId, groups, isAdmin]);

  const loadEvaluations = useCallback(async () => {
    if (!groupId) return;
    try {
      const response = await api.get("/grades/evaluations", { params: { groupId, subjectId: subjectId || undefined, periodId: periodId || undefined } });
      setEvaluations(response.data.data ?? []);
    } catch (requestError: any) { setError(requestError?.response?.data?.message ?? "No fue posible cargar las evaluaciones."); }
  }, [groupId, subjectId, periodId]);

  useEffect(() => { loadInitial(); }, [loadInitial]);
  useEffect(() => { loadGroup(); }, [loadGroup]);
  useEffect(() => { loadEvaluations(); }, [loadEvaluations]);
  useEffect(() => {
    if (!groupId || !subjectId || !periodId || !isAdmin) return;
    api.get("/grades/policies", { params: { groupId, subjectId, periodId } }).then((response) => {
      const current = response.data.data;
      setPolicy(current ? { calculationMode: current.calculationMode, scaleMax: Number(current.scaleMax), passingScore: Number(current.passingScore), weights: current.weights.map((item: { categoryId: string; weight: number }) => ({ categoryId: item.categoryId, weight: Number(item.weight) })) } : { calculationMode: "WEIGHTED_CATEGORIES", scaleMax: 10, passingScore: 6, weights: categories.filter((item) => item.active).map((item) => ({ categoryId: item.id, weight: Number(item.defaultWeight ?? 0) })) });
    }).catch(() => undefined);
  }, [categories, groupId, isAdmin, periodId, subjectId]);

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setSubmitting(true); setError(null);
    try { await api.post("/grades/categories", { name: form.get("name"), defaultWeight: Number(form.get("weight") || 0) || undefined }); setShowCategory(false); await loadInitial(); }
    catch (requestError: any) { setError(requestError?.response?.data?.message ?? "No fue posible guardar la categoría."); }
    finally { setSubmitting(false); }
  }

  async function createEvaluation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setSubmitting(true); setError(null);
    try {
      await api.post("/grades/evaluations", { groupId, subjectId, periodId, categoryId: form.get("categoryId"), title: form.get("title"), description: form.get("description") || undefined, evaluationDate: form.get("evaluationDate"), maxScore: Number(form.get("maxScore")), status: form.get("status") });
      setShowEvaluation(false); await loadEvaluations();
    } catch (requestError: any) { setError(requestError?.response?.data?.message ?? "No fue posible crear la evaluación."); }
    finally { setSubmitting(false); }
  }

  const setWeight = (categoryId: string, weight: number) => setPolicy((current) => ({ ...current, weights: current.weights.some((item) => item.categoryId === categoryId) ? current.weights.map((item) => item.categoryId === categoryId ? { ...item, weight } : item) : [...current.weights, { categoryId, weight }] }));
  async function savePolicy(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSubmitting(true); setError(null);
    try { await api.post("/grades/policies", { groupId, subjectId, periodId, ...policy, weights: policy.calculationMode === "AVERAGE" ? [] : policy.weights.filter((item) => item.weight > 0) }); setShowPolicy(false); }
    catch (requestError: any) { setError(requestError?.response?.data?.message ?? "No fue posible guardar la fórmula."); }
    finally { setSubmitting(false); }
  }

  return <ModuleGuard moduleKey="grades" requireSchoolContext={true}>
    <div className="p-6 lg:p-8 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow"><Award className="text-white" /></div><div><h1 className="gradient-text text-3xl font-extrabold">Evaluaciones</h1><p className="text-sm text-[var(--text-secondary)]">Captura evidencias y consulta el avance por período.</p></div></div>
        <div className="flex flex-wrap gap-2"><button onClick={() => loadEvaluations()} className="glass-button"><RefreshCw size={18} />Actualizar</button>{isAdmin && <><button onClick={() => setShowCategory(true)} className="glass-button"><Tags size={18} />Categorías</button><button disabled={!groupId || !subjectId || !periodId} onClick={() => setShowPolicy(true)} className="glass-button"><Settings2 size={18} />Fórmula</button></>}<button disabled={!groupId || !subjectId || !periodId || !categories.some((item) => item.active)} onClick={() => setShowEvaluation(true)} className="glass-button"><Plus size={18} />Nueva evaluación</button></div>
      </header>
      {error && <div className="rounded-xl border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-3 text-sm text-[var(--text-primary)]">{error}</div>}
      {loading ? <Loader minHeight="300px" /> : <>
        <section className="glass-panel rounded-2xl p-4 grid gap-3 md:grid-cols-3">
          <select className="glass-input" value={groupId} onChange={(event) => setGroupId(event.target.value)}>{groups.map((group) => <option key={group.id} value={group.id}>{group.grade?.name ? `${group.grade.name} · ` : ""}{group.name}</option>)}</select>
          <select className="glass-input" value={subjectId} onChange={(event) => setSubjectId(event.target.value)}><option value="">Todas las materias</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
          <select className="glass-input" value={periodId} onChange={(event) => setPeriodId(event.target.value)}><option value="">Todos los períodos</option>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}</select>
        </section>
        <section className="glass-panel rounded-2xl overflow-hidden"><div className="p-5 border-b border-[var(--border-glass)] flex items-center gap-2"><BookOpenCheck size={19} className="text-[var(--accent-secondary)]" /><h2 className="font-bold">Evidencias registradas</h2></div><div className="divide-y divide-[var(--border-glass)]">{evaluations.length ? evaluations.map((item) => <div key={item.id} className="p-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{item.title}</p><p className="text-sm text-[var(--text-secondary)]">{item.subject.name} · {item.category.name} · {new Date(item.evaluationDate).toLocaleDateString("es-MX")}</p></div><div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]"><span>Máximo {Number(item.maxScore)} · {item._count.scores} alumnos · <span className="text-[var(--accent-secondary)]">{item.status}</span></span><Link className="glass-button !px-3 !py-2" href={`/grades/${item.id}`}>Calificar</Link></div></div>) : <p className="p-10 text-center text-[var(--text-muted)]">Aún no hay evaluaciones con estos filtros.</p>}</div></section>
      </>}
      {showCategory && <Modal title="Nueva categoría" onClose={() => setShowCategory(false)}><form onSubmit={createCategory} className="space-y-4"><input required name="name" className="glass-input w-full" placeholder="Ej. Proyecto" /><input name="weight" type="number" min="0" max="100" step="0.01" className="glass-input w-full" placeholder="Peso sugerido (%)" /><button disabled={submitting} className="glass-button w-full justify-center">Guardar categoría</button></form></Modal>}
      {showPolicy && <Modal title="Fórmula del período" onClose={() => setShowPolicy(false)}><form onSubmit={savePolicy} className="space-y-4"><p className="text-sm text-[var(--text-secondary)]">Se aplica sólo a {activeGroup?.name}, la materia y el período seleccionados.</p><select value={policy.calculationMode} onChange={(event) => setPolicy((current) => ({ ...current, calculationMode: event.target.value as Policy["calculationMode"] }))} className="glass-input w-full"><option value="WEIGHTED_CATEGORIES">Ponderada por categorías</option><option value="AVERAGE">Promedio simple</option></select><div className="grid grid-cols-2 gap-3"><input required value={policy.scaleMax} onChange={(event) => setPolicy((current) => ({ ...current, scaleMax: Number(event.target.value) }))} type="number" min="1" step="0.01" className="glass-input w-full" placeholder="Escala máxima" /><input required value={policy.passingScore} onChange={(event) => setPolicy((current) => ({ ...current, passingScore: Number(event.target.value) }))} type="number" min="0" step="0.01" className="glass-input w-full" placeholder="Aprobatoria" /></div>{policy.calculationMode === "WEIGHTED_CATEGORIES" && <div className="space-y-2">{categories.filter((item) => item.active).map((category) => <label key={category.id} className="flex items-center justify-between gap-3 text-sm"><span>{category.name}</span><input value={policy.weights.find((item) => item.categoryId === category.id)?.weight ?? 0} onChange={(event) => setWeight(category.id, Number(event.target.value))} type="number" min="0" max="100" step="0.01" className="glass-input w-24" /></label>)}<p className="text-xs text-[var(--text-muted)]">Total: {policy.weights.reduce((total, item) => total + item.weight, 0)}%. Debe sumar 100%.</p></div>}<button disabled={submitting} className="glass-button w-full justify-center">Guardar fórmula</button></form></Modal>}
      {showEvaluation && <Modal title="Nueva evaluación" onClose={() => setShowEvaluation(false)}><form onSubmit={createEvaluation} className="space-y-4"><input required name="title" className="glass-input w-full" placeholder="Título" /><textarea name="description" className="glass-input w-full min-h-24" placeholder="Descripción (opcional)" /><select required name="categoryId" className="glass-input w-full">{categories.filter((item) => item.active).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input required name="evaluationDate" type="date" className="glass-input w-full" /><input required name="maxScore" type="number" min="0.01" step="0.01" defaultValue="10" className="glass-input w-full" /><select name="status" className="glass-input w-full"><option value="DRAFT">Borrador</option><option value="PUBLISHED">Publicada</option></select><button disabled={submitting} className="glass-button w-full justify-center">Crear evaluación</button></form></Modal>}
    </div>
  </ModuleGuard>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"><div className="glass-panel w-full max-w-md rounded-2xl p-6"><div className="flex justify-between gap-4 mb-5"><h2 className="font-bold text-xl">{title}</h2><button onClick={onClose} className="text-[var(--text-secondary)]">Cerrar</button></div>{children}</div></div>;
}
