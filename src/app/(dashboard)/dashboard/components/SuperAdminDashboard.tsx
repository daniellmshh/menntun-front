"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Users, TrendingUp, ArrowRight, Plus } from "lucide-react";
import api from "@/lib/api/axios";

interface SchoolSummary {
  id: string;
  name: string;
  type: string;
  active: boolean;
  _count?: { users?: number };
}

export default function SuperAdminDashboard({ userName }: { userName: string }) {
  const [schools, setSchools] = useState<SchoolSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/schools").then((res) => {
      setSchools(res.data?.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const activeSchools = schools.filter((s) => s.active).length;
  const independentSchools = schools.filter((s) => s.type === "INDEPENDENT").length;
  const schoolWorkspaces = schools.filter((s) => s.type === "SCHOOL").length;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
            Panel Super Admin 🚀
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">
            Vista global de la plataforma Menntun
          </p>
        </div>
        <Link href="/schools" className="glass-button flex items-center gap-2 text-sm shrink-0">
          <Plus size={16} />
          Nueva Escuela
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Escuelas activas</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 flex items-center justify-center text-[var(--accent-primary)]">
              <Building2 size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold">{loading ? "—" : activeSchools}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
              <TrendingUp size={13} />
              Workspaces en producción
            </p>
          </div>
        </div>

        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Escuelas</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/10 border border-[var(--accent-secondary)]/20 flex items-center justify-center text-[var(--accent-secondary)]">
              <Building2 size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold">{loading ? "—" : schoolWorkspaces}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Workspaces tipo SCHOOL</p>
          </div>
        </div>

        <div className="glass-panel glass-panel-interactive p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Independientes</span>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-warning)]/10 border border-[var(--accent-warning)]/20 flex items-center justify-center text-[var(--accent-warning)]">
              <Users size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold">{loading ? "—" : independentSchools}</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">Maestros independientes</p>
          </div>
        </div>
      </div>

      {/* Schools list */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-base flex items-center gap-2">
            <Building2 size={16} className="text-[var(--accent-primary)]" />
            Todos los workspaces
          </h4>
          <Link href="/schools" className="text-xs text-[var(--accent-secondary)] flex items-center gap-1 hover:underline">
            Gestionar <ArrowRight size={12} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {schools.map((school) => (
              <div key={school.id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-glass)] bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                    <Building2 size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{school.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{school.type}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${school.active ? "bg-[var(--accent-success)]/10 text-[var(--accent-success)]" : "bg-[var(--accent-danger)]/10 text-[var(--accent-danger)]"}`}>
                  {school.active ? "ACTIVO" : "INACTIVO"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
