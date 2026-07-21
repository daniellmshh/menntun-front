"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Plus, Layers, ArrowRight, Sparkles, Clock, TrendingUp } from "lucide-react";
import api from "@/lib/api/axios";

interface Group {
  id: string;
  name: string;
  section?: string;
  grade?: { name: string; level: string };
}

interface Planning {
  id: string;
  title: string;
  status: string;
  modalidad: string;
  createdAt: string;
}

export default function TeacherDashboard({ userName }: { userName: string }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/academic/groups").catch(() => ({ data: { data: [] } })),
      api.get("/planning").catch(() => ({ data: { data: [] } })),
    ]).then(([groupsRes, planningsRes]) => {
      setGroups(groupsRes.data?.data || []);
      setPlannings(planningsRes.data?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const statusColor: Record<string, string> = {
    DRAFT: "text-[var(--accent-warning)] bg-[var(--accent-warning)]/10",
    SUBMITTED: "text-[var(--accent-secondary)] bg-[var(--accent-secondary)]/10",
    APPROVED: "text-[var(--accent-success)] bg-[var(--accent-success)]/10",
    REJECTED: "text-[var(--accent-danger)] bg-[var(--accent-danger)]/10",
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
            Hola, {userName} 👋
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Aquí está el resumen de tu actividad docente
          </p>
        </div>
        <Link href="/planning/new" className="glass-button flex items-center gap-2 text-sm shrink-0">
          <Plus size={16} />
          Nueva Planeación
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Mis Grupos</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)]">
              <Layers size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold">{loading ? "—" : groups.length}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Grupos asignados</p>
          </div>
        </div>

        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Planeaciones</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 flex items-center justify-center text-[var(--accent-secondary)]">
              <Compass size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold">{loading ? "—" : plannings.length}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
              <TrendingUp size={13} />
              Generadas este ciclo
            </p>
          </div>
        </div>

        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Última actividad</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-warning)]/10 border border-[var(--accent-warning)]/20 flex items-center justify-center text-[var(--accent-warning)]">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold">
              {loading || plannings.length === 0
                ? "—"
                : new Date(plannings[0].createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short" })}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Última planeación</p>
          </div>
        </div>
      </div>

      {/* Mis grupos + Planeaciones recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grupos */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base flex items-center gap-2">
              <Layers size={16} className="text-[var(--accent-primary)]" />
              Mis grupos
            </h4>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}
            </div>
          ) : groups.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">Sin grupos asignados</p>
          ) : (
            <div className="space-y-2">
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-[var(--border-glass)]">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                    <Layers size={15} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{g.grade?.name} — {g.name} {g.section || ""}</p>
                    <p className="text-xs text-[var(--text-muted)]">{g.grade?.level}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Planeaciones recientes */}
        <div className="glass-panel p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--accent-primary)]" />
              Planeaciones recientes
            </h4>
            <Link href="/planning" className="text-xs text-[var(--accent-secondary)] flex items-center gap-1 hover:underline">
              Ver todas <ArrowRight size={12} />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}
            </div>
          ) : plannings.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-[var(--text-muted)]">Sin planeaciones aún</p>
              <Link href="/planning/new" className="text-[var(--accent-primary)] text-sm underline mt-1 block">Crear primera</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {plannings.slice(0, 4).map((p) => (
                <Link key={p.id} href={`/planning/${p.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-[var(--border-glass)] group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0">
                      <Compass size={13} />
                    </div>
                    <p className="text-xs font-medium truncate">{p.title}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2 ${statusColor[p.status] || "bg-white/10"}`}>
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
