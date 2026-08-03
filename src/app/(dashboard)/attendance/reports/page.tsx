"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types";

type Row = {
  studentProfileId: string;
  student: { firstName: string; lastName: string };
  group: { name: string; grade?: { name: string } };
  status: string;
  arrivedAt?: string | null;
  departedAt?: string | null;
  hasGateEvidence: boolean;
  hasClassEvidence: boolean;
};

export default function AttendanceReportsPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = [UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SCHOOL_ADMIN].includes(user?.role ?? UserRole.STUDENT);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(() => {
    setLoading(true); setError(null);
    api.get("/attendance/reports/daily", { params: { date } })
      .then((response) => setRows(response.data.data?.rows ?? []))
      .catch(() => setError("No fue posible cargar el reporte."))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  async function reopen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!reason.trim()) return;
    await api.post(`/attendance/daily/${date}/reopen`, { reason });
    setReason(""); await load();
  }

  function exportReport() {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(rows.map((row) => ({
      Alumno: `${row.student.firstName} ${row.student.lastName}`,
      Grupo: `${row.group.grade?.name ? `${row.group.grade.name} · ` : ""}${row.group.name}`,
      Estado: row.status,
      Evidencia: [row.hasGateEvidence && "Portería", row.hasClassEvidence && "Clase"].filter(Boolean).join(" + ") || "Sin evidencia",
      Entrada: row.arrivedAt ? new Date(row.arrivedAt).toLocaleString("es-MX") : "",
      Salida: row.departedAt ? new Date(row.departedAt).toLocaleString("es-MX") : "",
    })));
    XLSX.utils.book_append_sheet(workbook, sheet, "Asistencia");
    XLSX.writeFile(workbook, `asistencias-${date}.xlsx`);
  }

  return <ModuleGuard moduleKey="attendance"><div className="p-6 lg:p-8 space-y-6">
    {!isAdmin ? <p className="glass-panel p-6">Sólo administración puede consultar reportes.</p> : <>
      <header><h1 className="gradient-text text-3xl font-extrabold">Reporte diario de asistencias</h1><p className="text-sm text-[var(--text-secondary)]">Evidencia de portería, clase y estado actual por alumno.</p></header>
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap gap-3"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="glass-input" /><button onClick={load} className="glass-button">Actualizar</button><button onClick={exportReport} disabled={!rows.length} className="glass-button-secondary">Exportar XLSX</button><form onSubmit={reopen} className="flex flex-1 gap-2"><input value={reason} onChange={(event) => setReason(event.target.value)} required className="glass-input flex-1" placeholder="Motivo para reabrir el día" /><button className="glass-button-secondary">Reabrir día</button></form></div>
      {loading ? <Loader minHeight="260px" /> : error ? <p className="rounded-xl border border-[var(--danger)]/40 p-4">{error}</p> : <div className="glass-panel rounded-2xl overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left border-b border-[var(--border-glass)]"><th className="p-3">Alumno</th><th className="p-3">Grupo</th><th className="p-3">Estado</th><th className="p-3">Evidencia</th><th className="p-3">Entrada / salida</th></tr></thead><tbody>{rows.map((row) => <tr key={row.studentProfileId} className="border-b border-[var(--border-glass)]"><td className="p-3">{row.student.firstName} {row.student.lastName}</td><td className="p-3">{row.group.grade?.name} {row.group.name}</td><td className="p-3">{row.status}</td><td className="p-3">{row.hasGateEvidence ? "Portería" : ""}{row.hasGateEvidence && row.hasClassEvidence ? " + " : ""}{row.hasClassEvidence ? "Clase" : "Sin evidencia"}</td><td className="p-3">{row.arrivedAt ? new Date(row.arrivedAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "—"} / {row.departedAt ? new Date(row.departedAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) : "—"}</td></tr>)}</tbody></table></div>}
    </>}
  </div></ModuleGuard>;
}
