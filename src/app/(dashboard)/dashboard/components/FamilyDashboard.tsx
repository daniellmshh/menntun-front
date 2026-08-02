"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, GraduationCap } from "lucide-react";
import Loader from "@/components/shared/Loader";
import api from "@/lib/api/axios";

type Period = { id: string; name: string };
type Student = { id: string; user: { firstName: string; lastName: string }; enrollments: { group: { schoolYear: { id: string; name: string; periods: Period[] } } }[] };
type Summary = { subjects: { subjectId: string; subject: string; average: number; scaleMax: number; passingScore: number; evaluationsGraded: number }[]; overallAverage: number | null };

export default function FamilyDashboard({ userName }: { userName: string }) {
  const [students, setStudents] = useState<Student[]>([]); const [studentId, setStudentId] = useState(""); const [periodId, setPeriodId] = useState(""); const [summary, setSummary] = useState<Summary | null>(null); const [loading, setLoading] = useState(true);
  const selected = useMemo(() => students.find((item) => item.id === studentId), [studentId, students]);
  const periods = selected?.enrollments[0]?.group.schoolYear.periods ?? [];
  useEffect(() => { api.get("/grades/me/students").then((response) => { const data = response.data.data ?? []; setStudents(data); setStudentId(data[0]?.id ?? ""); setPeriodId(data[0]?.enrollments[0]?.group.schoolYear.periods[0]?.id ?? ""); }).finally(() => setLoading(false)); }, []);
  useEffect(() => { if (!studentId || !periodId) return; setLoading(true); api.get(`/grades/students/${studentId}/summary`, { params: { periodId } }).then((response) => setSummary(response.data.data)).finally(() => setLoading(false)); }, [studentId, periodId]);
  if (loading && !students.length) return <Loader minHeight="300px" />;
  return <div className="animate-fade-in space-y-6">
    <div><h1 className="gradient-text text-3xl font-extrabold tracking-tight">Hola, {userName} 👋</h1><p className="text-[var(--text-secondary)] text-sm mt-1">Consulta el avance académico actualizado de tu familia.</p></div>
    {students.length === 0 ? <div className="glass-panel p-10 text-center text-[var(--text-muted)]">No hay alumnos vinculados a tu cuenta.</div> : <>
      <section className="glass-panel rounded-2xl p-4 grid gap-3 md:grid-cols-2"><select className="glass-input" value={studentId} onChange={(event) => { const next = students.find((item) => item.id === event.target.value); setStudentId(event.target.value); setPeriodId(next?.enrollments[0]?.group.schoolYear.periods[0]?.id ?? ""); }}>{students.map((student) => <option key={student.id} value={student.id}>{student.user.firstName} {student.user.lastName}</option>)}</select><select className="glass-input" value={periodId} onChange={(event) => setPeriodId(event.target.value)}>{periods.map((period) => <option key={period.id} value={period.id}>{period.name}</option>)}</select></section>
      <section className="grid gap-4 md:grid-cols-3"><div className="glass-panel rounded-2xl p-5 flex gap-4 items-center"><div className="p-3 rounded-xl bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]"><BarChart3 /></div><div><p className="text-sm text-[var(--text-secondary)]">Promedio general</p><p className="text-3xl font-bold">{summary?.overallAverage ?? "—"}</p></div></div><div className="glass-panel rounded-2xl p-5 flex gap-4 items-center md:col-span-2"><div className="p-3 rounded-xl bg-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]"><GraduationCap /></div><p className="text-sm text-[var(--text-secondary)]">Los promedios se actualizan al publicarse las evaluaciones calificadas del período.</p></div></section>
      <section className="glass-panel rounded-2xl overflow-hidden"><div className="p-5 border-b border-[var(--border-glass)]"><h2 className="font-bold">Desempeño por materia</h2></div>{loading ? <Loader minHeight="180px" /> : <div className="divide-y divide-[var(--border-glass)]">{summary?.subjects.length ? summary.subjects.map((subject) => <div key={subject.subjectId} className="p-5 flex items-center justify-between"><div><p className="font-semibold">{subject.subject}</p><p className="text-sm text-[var(--text-secondary)]">{subject.evaluationsGraded} evaluaciones calificadas · Aprobatoria {subject.passingScore}</p></div><p className="text-2xl font-bold text-[var(--accent-secondary)]">{subject.average}<span className="text-sm text-[var(--text-secondary)]">/{subject.scaleMax}</span></p></div>) : <p className="p-10 text-center text-[var(--text-muted)]">Aún no hay evaluaciones publicadas para este período.</p>}</div>}</section>
    </>}
  </div>;
}
