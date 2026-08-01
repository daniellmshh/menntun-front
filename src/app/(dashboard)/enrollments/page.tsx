"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Search, UserPlus, Filter, ShieldCheck, Users } from "lucide-react";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";
import CreateSolicitudWizard from "./components/CreateSolicitudWizard";
import SolicitudDetailModal from "./components/SolicitudDetailModal";

export default function EnrollmentsPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language as keyof typeof translations];

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("TODOS");
  const [filterTipo, setFilterTipo] = useState("TODOS");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any | null>(null);

  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/enrollments");
      setSolicitudes(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const filteredData = solicitudes.filter((s) => {
    const full = `${s.primerNombre} ${s.primerApellido}`.toLowerCase();
    const matchesSearch = full.includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === "TODOS" || s.estado === filterEstado;
    const matchesTipo = filterTipo === "TODOS" || s.tipoSolicitud === filterTipo;
    return matchesSearch && matchesEstado && matchesTipo;
  });

  return (
    <ModuleGuard moduleKey="enrollments" requireSchoolContext={true}>
      <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-[var(--bg-base)] relative">
        <div className="flex-1 p-8 pb-10 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow shrink-0">
                  <UserPlus size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
                    {t.sidebar.enrollments}
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                    Gestión de solicitudes de inscripción y reinscripción.
                  </p>
                </div>
              </div>
              {user?.role === "SCHOOL_ADMIN" && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="glass-button shadow-glow"
                >
                  <Plus size={20} />
                  Nueva Solicitud
                </button>
              )}
            </div>

            {/* Dashboard Panels */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel p-6 rounded-2xl border border-[var(--border-glass)] flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[hsla(263,90%,60%,0.15)] rounded-lg text-[var(--accent-primary)]">
                    <ShieldCheck size={20} />
                  </div>
                  <h3 className="font-semibold text-lg text-[var(--text-secondary)]">Total Solicitudes</h3>
                </div>
                <p className="text-3xl font-extrabold">{solicitudes.length}</p>
              </div>
              
              <div className="glass-panel p-6 rounded-2xl border border-[var(--border-glass)] flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[hsla(142,72%,45%,0.15)] rounded-lg text-[hsl(142,72%,60%)]">
                    <Users size={20} />
                  </div>
                  <h3 className="font-semibold text-lg text-[var(--text-secondary)]">Aprobadas</h3>
                </div>
                <p className="text-3xl font-extrabold">{solicitudes.filter(s => s.estado === 'APROBADA' || s.estado === 'MATRICULADO').length}</p>
              </div>

              <div className="glass-panel p-6 rounded-2xl border border-[var(--accent-primary)] border-opacity-30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)] to-transparent opacity-5 group-hover:opacity-10 transition-opacity"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div>
                    <h3 className="font-semibold text-lg text-[var(--text-secondary)] mb-1">Cupo Disponible</h3>
                    <p className="text-3xl font-extrabold gradient-text">45 / 150</p>
                    <p className="text-xs text-[var(--text-muted)] mt-2">Nuevos ingresos proyectados</p>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-[var(--accent-primary)] border-opacity-20 flex items-center justify-center">
                    <span className="font-bold text-[var(--accent-primary)]">30%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className="glass-panel rounded-2xl border border-[var(--border-glass)] shadow-main">
              <div className="p-5 border-b border-[var(--border-glass)] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5">
                <div className="relative max-w-sm w-full">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder="Buscar aspirante..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full !pl-10 glass-input"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <Filter size={16} />
                    <span>Filtros:</span>
                  </div>
                  <select
                    className="glass-input text-sm py-1.5"
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                  >
                    <option value="TODOS" className="bg-[var(--bg-base)]">Estado: Todos</option>
                    <option value="PENDIENTE" className="bg-[var(--bg-base)]">Pendientes</option>
                    <option value="APROBADA" className="bg-[var(--bg-base)]">Aprobadas</option>
                    <option value="RECHAZADA" className="bg-[var(--bg-base)]">Rechazadas</option>
                  </select>
                  <select
                    className="glass-input text-sm py-1.5"
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                  >
                    <option value="TODOS" className="bg-[var(--bg-base)]">Tipo: Todos</option>
                    <option value="NUEVO_INGRESO" className="bg-[var(--bg-base)]">Nuevo Ingreso</option>
                    <option value="REINSCRIPCION" className="bg-[var(--bg-base)]">Reinscripción</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-glass)] bg-white/[0.02]">
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Aspirante</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Tipo</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Estado</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Grado / Grupo</th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-glass)]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-0 border-0">
                          <Loader minHeight="200px" />
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-[var(--text-muted)] flex flex-col items-center">
                          <Search size={32} className="opacity-20 mb-3" />
                          <p>No hay solicitudes que coincidan con los criterios.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((s) => (
                        <tr key={s.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer group" onClick={() => {
                          setSelectedSolicitud(s);
                          setIsDetailModalOpen(true);
                        }}>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[hsla(263,90%,60%,0.15)] flex items-center justify-center text-[var(--accent-primary)] font-bold shadow-sm">
                                {s.primerNombre?.charAt(0) || ""}{s.primerApellido?.charAt(0) || ""}
                              </div>
                              <div>
                                <p className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                                  {s.primerNombre} {s.primerApellido}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-medium text-[var(--text-secondary)]">
                              {s.tipoSolicitud === "NUEVO_INGRESO" ? "Nuevo Ingreso" : s.tipoSolicitud === "REINSCRIPCION" ? "Reinscripción" : s.tipoSolicitud || "-"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              s.estado === "APROBADA" || s.estado === "MATRICULADO"
                                ? "bg-[hsla(142,72%,45%,0.15)] text-[hsl(142,72%,60%)]"
                                : s.estado === "RECHAZADA" || s.estado === "CANCELADA"
                                ? "bg-[hsla(354,85%,56%,0.15)] text-[hsl(354,85%,70%)]"
                                : "bg-[hsla(38,92%,52%,0.15)] text-[hsl(38,92%,60%)]"
                            }`}>
                              {s.estado || "PENDIENTE"}
                            </span>
                          </td>
                          <td className="p-4 text-sm text-[var(--text-secondary)]">
                            {s.gradeId || "-"} <span className="opacity-50 mx-1">/</span> {s.groupId || "-"}
                          </td>
                          <td className="p-4 text-center">
                            <button className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors p-2 bg-white/5 hover:bg-white/10 rounded-lg">
                              Ver Detalle
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {isCreateModalOpen && (
          <CreateSolicitudWizard
            onClose={() => setIsCreateModalOpen(false)}
            onSuccess={() => {
              setIsCreateModalOpen(false);
              fetchSolicitudes();
            }}
          />
        )}

        {isDetailModalOpen && selectedSolicitud && (
          <SolicitudDetailModal
            solicitud={selectedSolicitud}
            onClose={() => setIsDetailModalOpen(false)}
            onSuccess={() => {
              setIsDetailModalOpen(false);
              fetchSolicitudes();
            }}
          />
        )}
      </div>
    </ModuleGuard>
  );
}
