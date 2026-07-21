"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Plus,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import api from "@/lib/api/axios";

interface PlanningItem {
  id: string;
  title: string;
  status: string;
  modalidad: string;
  createdAt: string;
  standaloneLevel?: string;
  standaloneGradeOrder?: number;
}

export default function IndependentDashboard({ userName }: { userName: string }) {
  const [plannings, setPlannings] = useState<PlanningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/planning").then((res) => {
      setPlannings(res.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const total = plannings.length;
  const lastDate = plannings[0]?.createdAt
    ? new Date(plannings[0].createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const recent = plannings.slice(0, 5);

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
            Bienvenido, {userName} 👋
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Espacio de trabajo independiente · Módulo de Planeaciones NEM
          </p>
        </div>
        <Link
          href="/planning/new"
          className="glass-button flex items-center gap-2 text-sm shrink-0"
        >
          <Plus size={16} />
          Nueva Planeación
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Planeaciones totales</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)]">
              <Compass size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold">{loading ? "—" : total}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
              <TrendingUp size={13} />
              Generadas con IA NEM
            </p>
          </div>
        </div>

        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Última generada</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 flex items-center justify-center text-[var(--accent-secondary)]">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold leading-tight">{loading ? "—" : lastDate}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Fecha de creación</p>
          </div>
        </div>

        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Nivel actual</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-warning)]/10 border border-[var(--accent-warning)]/20 flex items-center justify-center text-[var(--accent-warning)]">
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold">Preescolar</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">1°, 2° y 3° Grado</p>
          </div>
        </div>
      </div>

      {/* Recent plannings */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-[var(--accent-primary)]" />
            Planeaciones recientes
          </h4>
          <Link href="/planning" className="text-xs text-[var(--accent-secondary)] flex items-center gap-1 hover:underline">
            Ver todas <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="text-center py-10 text-[var(--text-secondary)]">
            <Compass size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aún no tienes planeaciones.</p>
            <Link href="/planning/new" className="text-[var(--accent-primary)] text-sm underline mt-1 block">
              Crear la primera
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((p) => (
              <Link
                key={p.id}
                href={`/planning/${p.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] transition-colors group border border-transparent hover:border-[var(--border-glass)]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0">
                    <Compass size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{p.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{p.modalidad} · {p.standaloneLevel} {p.standaloneGradeOrder}°</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[p.status] || "bg-white/10 text-[var(--text-muted)]"}`}>
                    {p.status}
                  </span>
                  <ArrowRight size={14} className="text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
