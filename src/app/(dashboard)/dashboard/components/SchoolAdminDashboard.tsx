"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  Layers,
  BookOpen,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/api/axios";

interface Stats {
  students: number;
  teachers: number;
  groups: number;
  pendingEnrollments: number;
}

interface RecentActivity {
  id: string;
  type: "student" | "enrollment" | "group";
  title: string;
  desc: string;
  time: string;
}

export default function SchoolAdminDashboard({ userName }: { userName: string }) {
  const [stats, setStats] = useState<Stats>({ students: 0, teachers: 0, groups: 0, pendingEnrollments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/students").catch(() => ({ data: { meta: { total: 0 } } })),
      api.get("/teachers").catch(() => ({ data: { meta: { total: 0 } } })),
      api.get("/academic/groups").catch(() => ({ data: { data: [] } })),
      api.get("/enrollments?status=SUBMITTED").catch(() => ({ data: { data: [] } })),
    ]).then(([studentsRes, teachersRes, groupsRes, enrollRes]) => {
      setStats({
        students: studentsRes.data?.meta?.total ?? studentsRes.data?.data?.length ?? 0,
        teachers: teachersRes.data?.meta?.total ?? teachersRes.data?.data?.length ?? 0,
        groups: groupsRes.data?.data?.length ?? 0,
        pendingEnrollments: enrollRes.data?.data?.length ?? 0,
      });
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Total Alumnos",
      value: stats.students,
      icon: GraduationCap,
      color: "primary",
      detail: "Alumnos activos en la escuela",
      href: "/students",
    },
    {
      label: "Maestros",
      value: stats.teachers,
      icon: Users,
      color: "secondary",
      detail: "Docentes registrados",
      href: "/teachers",
    },
    {
      label: "Grupos",
      value: stats.groups,
      icon: Layers,
      color: "cyan",
      detail: "Grupos activos del ciclo",
      href: "/groups",
    },
    {
      label: "Inscripciones pendientes",
      value: stats.pendingEnrollments,
      icon: BookOpen,
      color: "warning",
      detail: "Solicitudes por revisar",
      href: "/enrollments",
    },
  ];

  const colorMap: Record<string, string> = {
    primary: "bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20 text-[var(--accent-primary)]",
    secondary: "bg-[var(--accent-secondary)]/10 border-[var(--accent-secondary)]/20 text-[var(--accent-secondary)]",
    cyan: "bg-[var(--accent-cyan)]/10 border-[var(--accent-cyan)]/20 text-[var(--accent-cyan)]",
    warning: "bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/20 text-[var(--accent-warning)]",
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
            Panel de administración escolar
          </p>
        </div>
        <Link href="/students" className="glass-button flex items-center gap-2 text-sm shrink-0">
          <Plus size={16} />
          Nuevo Alumno
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} href={card.href} className="glass-panel glass-panel-interactive p-6 space-y-4 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">{card.label}</span>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${colorMap[card.color]}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold">{loading ? "—" : card.value}</h3>
                <p className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1">
                  <TrendingUp size={13} />
                  {card.detail}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acceso rápido */}
        <div className="glass-panel p-6 space-y-4">
          <h4 className="font-bold text-base">Acceso rápido</h4>
          <div className="space-y-2">
            {[
              { href: "/students", label: "Gestionar alumnos", icon: GraduationCap },
              { href: "/teachers", label: "Gestionar maestros", icon: Users },
              { href: "/groups", label: "Ver grupos", icon: Layers },
              { href: "/enrollments", label: "Revisar inscripciones", icon: BookOpen },
              { href: "/planning", label: "Planeaciones", icon: ArrowRight },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-[var(--border-glass)] transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)]">
                    <Icon size={15} />
                  </div>
                  <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">{item.label}</span>
                  <ArrowUpRight size={13} className="ml-auto text-[var(--text-muted)]" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Módulos activos */}
        <div className="glass-panel p-6 space-y-4 lg:col-span-2">
          <h4 className="font-bold text-base flex items-center gap-2">
            <Clock size={16} className="text-[var(--accent-primary)]" />
            Resumen del ciclo
          </h4>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/10 text-center">
                <p className="text-2xl font-bold text-[var(--accent-primary)]">{stats.students}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Alumnos inscritos</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--accent-secondary)]/5 border border-[var(--accent-secondary)]/10 text-center">
                <p className="text-2xl font-bold text-[var(--accent-secondary)]">{stats.teachers}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Maestros activos</p>
              </div>
              <div className="p-4 rounded-xl bg-[var(--accent-cyan)]/5 border border-[var(--accent-cyan)]/10 text-center">
                <p className="text-2xl font-bold text-[var(--accent-cyan)]">{stats.groups}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Grupos del ciclo</p>
              </div>
              <div className={`p-4 rounded-xl border text-center ${stats.pendingEnrollments > 0 ? "bg-[var(--accent-warning)]/10 border-[var(--accent-warning)]/30" : "bg-white/[0.02] border-[var(--border-glass)]"}`}>
                <p className={`text-2xl font-bold ${stats.pendingEnrollments > 0 ? "text-[var(--accent-warning)]" : "text-[var(--text-primary)]"}`}>{stats.pendingEnrollments}</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Inscripciones pendientes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
