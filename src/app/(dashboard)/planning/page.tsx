"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Compass,
  Calendar,
  Sparkles,
  Clock,
  ArrowRight,
  Trash2,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import { getMyPlannings, deletePlanning } from "@/modules/planning/services/planning.service";
import { Planning, PlanningStatus } from "@/modules/planning/types";
import { PlanningModalidadLabels } from "@/modules/planning/constants";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";

export default function PlanningListPage() {
  const { language } = useLanguageStore();
  const t = translations[language];

  // Data states
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlannings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getMyPlannings();
      if (res.error) {
        setError(res.error);
      } else {
        setPlannings(res.data || []);
      }
    } catch (err: any) {
      console.error("Error loading plannings:", err);
      setError(err?.response?.data?.error || err.message || "Failed to load plannings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannings();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Stop click from bubbling to Link wrapper
    e.stopPropagation();

    const confirmDelete = window.confirm(
      language === "es"
        ? "¿Estás seguro de que deseas eliminar esta planeación?"
        : "Are you sure you want to delete this lesson plan?"
    );
    if (!confirmDelete) return;

    try {
      const res = await deletePlanning(id);
      if (res.error) {
        alert(res.error);
      } else {
        setPlannings((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err: any) {
      console.error("Error deleting planning:", err);
      alert(err.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <Compass className="text-[var(--accent-primary)]" size={24} />
            <span>
              {language === "es" ? "Planeaciones Didácticas" : "Lesson Planning"}
            </span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            {language === "es"
              ? "Crea y administra tus planeaciones didácticas semanales integradas con inteligencia artificial y RAG"
              : "Create and manage your weekly lesson plans powered by AI & RAG"}
          </p>
        </div>

        <Link
          href="/planning/new"
          className="glass-button px-5 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-glow self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>{language === "es" ? "Nueva planeación" : "New Lesson Plan"}</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/35 text-[var(--accent-danger)] text-sm flex items-center gap-3">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center space-y-4 border border-[var(--border-glass)] min-h-[300px]">
          <div className="w-10 h-10 rounded-full border-4 border-[var(--border-glass)] border-t-[var(--accent-primary)] animate-spin" />
          <p className="text-sm text-[var(--text-secondary)]">
            {language === "es" ? "Cargando tus planeaciones..." : "Loading lesson plans..."}
          </p>
        </div>
      ) : plannings.length === 0 ? (
        <div className="glass-panel p-12 text-center flex flex-col items-center justify-center space-y-5 border border-dashed border-[var(--border-glass)] min-h-[350px]">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-muted)]">
            <Sparkles size={32} />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="font-bold text-base text-[var(--text-primary)]">
              {language === "es" ? "Sin planeaciones generadas" : "No lesson plans generated"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {language === "es"
                ? "Aún no has creado ninguna planeación didáctica con IA. Haz clic abajo para comenzar."
                : "You haven't created any AI lesson plans yet. Click below to get started."}
            </p>
          </div>
          <Link
            href="/planning/new"
            className="glass-button px-6 py-2.5 text-xs font-semibold rounded-xl inline-flex items-center gap-2"
          >
            <Sparkles size={14} />
            <span>{language === "es" ? "Diseñar primer plan" : "Design First Plan"}</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plannings.map((planning) => {
            const dateStr = new Date(planning.createdAt).toLocaleDateString(
              language === "es" ? "es-MX" : "en-US",
              { year: "numeric", month: "short", day: "numeric" }
            );

            return (
              <Link
                key={planning.id}
                href={`/planning/${planning.id}`}
                className="glass-panel glass-panel-interactive p-5 flex flex-col justify-between border border-[var(--border-glass)] relative group min-h-[220px]"
              >
                <div className="space-y-4">
                  {/* Status & Date */}
                  <div className="flex justify-between items-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold select-none border uppercase tracking-wide
                        ${
                          planning.status === PlanningStatus.APPROVED
                            ? "bg-emerald-500/10 text-[var(--accent-success)] border-emerald-500/20"
                            : planning.status === PlanningStatus.SUBMITTED
                            ? "bg-amber-500/10 text-[var(--accent-warning)] border-amber-500/20"
                            : planning.status === PlanningStatus.REJECTED
                            ? "bg-rose-500/10 text-[var(--accent-danger)] border-rose-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }
                      `}
                    >
                      {planning.status}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)]">
                      <Clock size={12} />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:text-[var(--accent-primary-light)] transition-colors">
                      {planning.title}
                    </h3>
                    {planning.groupId ? (
                      <p className="text-[11px] text-[var(--accent-secondary)] font-medium">
                        {planning.group?.grade?.name} - {planning.group?.name} | {planning.subject?.name}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[var(--text-muted)] font-medium uppercase">
                        {planning.standaloneLevel} | {planning.standaloneGradeOrder}° Grado
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Badges & Actions */}
                <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-4">
                  <span className="px-2 py-1 bg-white/[0.03] text-[var(--text-secondary)] border border-[var(--border-glass)] rounded-lg text-[10px] font-semibold">
                    {PlanningModalidadLabels[planning.modalidad] || planning.modalidad}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(e, planning.id)}
                      className="p-1.5 rounded-lg border border-transparent hover:border-[var(--accent-danger)]/20 text-[var(--text-muted)] hover:text-[var(--accent-danger)] hover:bg-red-500/5 transition-all"
                      title={language === "es" ? "Eliminar" : "Delete"}
                    >
                      <Trash2 size={13} />
                    </button>

                    <div className="w-7 h-7 rounded-lg bg-white/[0.02] border border-[var(--border-glass)] flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--accent-primary-light)] group-hover:border-[var(--accent-primary)]/40 transition-all">
                      <ArrowRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
