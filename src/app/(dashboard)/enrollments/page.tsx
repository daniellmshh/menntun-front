"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Eye,
  User,
  X,
  Upload,
} from "lucide-react";
import Loader from "@/components/shared/Loader";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/store/auth.store";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";

export default function EnrollmentsPage() {
  const { user } = useAuthStore();
  const { language } = useLanguageStore();
  const t = translations[language as keyof typeof translations];

  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [schoolYears, setSchoolYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<any | null>(null);
  
  const [createForm, setCreateForm] = useState({
    schoolYearId: "",
    firstName: "",
    lastName: "",
    nivelEducativo: "",
    gradoPropuesto: "",
    parentFirstName: "",
    parentLastName: "",
    parentEmail: "",
    parentRelationship: "Padre",
  });
  
  const fetchSolicitudes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/enrollments");
      setSolicitudes(res.data.data || []);
      
      const resYears = await api.get("/academic/school-years");
      setSchoolYears(resYears.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/enrollments", {
        schoolYearId: createForm.schoolYearId || undefined,
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        nivelEducativo: createForm.nivelEducativo || undefined,
        gradoPropuesto: createForm.gradoPropuesto || undefined,
        padres: [
          {
            firstName: createForm.parentFirstName,
            lastName: createForm.parentLastName,
            email: createForm.parentEmail,
            relationship: createForm.parentRelationship,
            isPrimary: true,
          }
        ]
      });
      setIsCreateModalOpen(false);
      fetchSolicitudes();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error al crear");
    }
  };

  const handleApprove = async () => {
    try {
      await api.post(`/enrollments/${selectedSolicitud.id}/approve`, {
        cargos: [
          {
            concepto: "Inscripción Anual",
            monto: 5000,
            fechaVencimiento: new Date().toISOString(),
          }
        ]
      });
      setIsDetailModalOpen(false);
      fetchSolicitudes();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error al aprobar");
    }
  };

  const handleCancel = async () => {
    if (!confirm("¿Seguro que deseas cancelar esta inscripción? Esto revertirá la matrícula.")) return;
    try {
      await api.delete(`/enrollments/${selectedSolicitud.id}/cancel`, { data: { reason: "Cancelado por admin" }});
      setIsDetailModalOpen(false);
      fetchSolicitudes();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error al cancelar");
    }
  };

  const filteredData = solicitudes.filter((s) => {
    const full = `${s.firstName} ${s.lastName}`.toLowerCase();
    return full.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-[var(--bg-base)] relative">
      <div className="flex-1 p-8 pb-10 overflow-y-auto custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                {t.sidebar.enrollments}
              </h1>
              <p className="text-[var(--text-secondary)] mt-1">
                Gestión de solicitudes de inscripción y reinscripción.
              </p>
            </div>
            {user?.role === "SCHOOL_ADMIN" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-primary"
              >
                <Plus size={20} />
                Nueva Solicitud
              </button>
            )}
          </div>

          <div className="glass-panel rounded-2xl border border-[var(--border-glass)] shadow-main">
            <div className="p-5 border-b border-[var(--border-glass)] flex items-center justify-between">
              <div className="relative max-w-sm w-full">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                />
                <input
                  type="text"
                  placeholder="Buscar aspirante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-glass w-full pl-10"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-glass)] bg-white/[0.02]">
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Aspirante</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Ciclo</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">Estado</th>
                    <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-glass)]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="p-0 border-0">
                        <Loader minHeight="200px" />
                      </td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-[var(--text-muted)]">
                        No hay solicitudes registradas
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((s) => (
                      <tr key={s.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[hsla(263,90%,60%,0.15)] flex items-center justify-center text-[var(--accent-primary)] font-bold">
                              {s.firstName.charAt(0)}{s.lastName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-[var(--text-primary)]">
                                {s.firstName} {s.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-[var(--text-secondary)] text-sm">
                          {s.schoolYear?.name || "-"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              s.estado === "APROBADA" || s.estado === "MATRICULADO"
                                ? "bg-[hsla(142,72%,45%,0.15)] text-[hsl(142,72%,60%)]"
                                : s.estado === "RECHAZADA" || s.estado === "CANCELADA"
                                ? "bg-[hsla(354,85%,56%,0.15)] text-[hsl(354,85%,70%)]"
                                : "bg-[hsla(38,92%,52%,0.15)] text-[hsl(38,92%,60%)]"
                            }`}
                          >
                            {s.estado}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedSolicitud(s);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                          >
                            <Eye size={18} />
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

      {/* CREATE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-main animate-slide-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
              <h2 className="text-xl font-bold">Nueva Solicitud</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[var(--text-muted)] hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <form id="createForm" onSubmit={handleCreate} className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[var(--accent-primary)] mb-4">Datos del Alumno</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">Nombre(s)</label>
                      <input required className="input-glass w-full text-sm" value={createForm.firstName} onChange={e => setCreateForm({...createForm, firstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">Apellidos</label>
                      <input required className="input-glass w-full text-sm" value={createForm.lastName} onChange={e => setCreateForm({...createForm, lastName: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--accent-primary)] mb-4">Datos del Padre/Tutor Principal</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">Nombre</label>
                      <input required className="input-glass w-full text-sm" value={createForm.parentFirstName} onChange={e => setCreateForm({...createForm, parentFirstName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">Apellido</label>
                      <input required className="input-glass w-full text-sm" value={createForm.parentLastName} onChange={e => setCreateForm({...createForm, parentLastName: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-[var(--text-secondary)] mb-1">Email</label>
                      <input type="email" required className="input-glass w-full text-sm" value={createForm.parentEmail} onChange={e => setCreateForm({...createForm, parentEmail: e.target.value})} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-[var(--border-glass)] flex justify-end gap-3">
              <button onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Cancelar</button>
              <button form="createForm" type="submit" className="btn-primary">Generar Solicitud</button>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedSolicitud && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-3xl rounded-2xl shadow-main animate-slide-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
              <h2 className="text-xl font-bold">Detalle de Solicitud: {selectedSolicitud.firstName} {selectedSolicitud.lastName}</h2>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-[var(--text-muted)] hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[var(--text-secondary)]">Estado Actual:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/10 text-white">
                  {selectedSolicitud.estado}
                </span>
              </div>
              
              <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-white/5">
                <h3 className="text-sm font-bold text-[var(--accent-primary)] mb-4">Padres/Tutores</h3>
                {selectedSolicitud.padres?.map((p: any) => (
                  <div key={p.id} className="text-sm text-[var(--text-primary)]">
                    {p.firstName} {p.lastName} - <span className="text-[var(--text-secondary)]">{p.email}</span>
                  </div>
                ))}
              </div>

              {selectedSolicitud.estado === "APROBADA" && (
                <div className="p-4 rounded-xl border border-[hsla(354,85%,56%,0.3)] bg-[hsla(354,85%,56%,0.05)] space-y-2">
                  <h3 className="text-sm font-bold text-[hsl(354,85%,60%)]">Zona de Peligro</h3>
                  <p className="text-xs text-[var(--text-secondary)]">Si el alumno ya no cursará en la institución, puedes cancelar la inscripción.</p>
                  <button onClick={handleCancel} className="btn-danger w-full mt-2">Revertir y Cancelar Inscripción</button>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-[var(--border-glass)] flex justify-end gap-3">
              <button onClick={() => setIsDetailModalOpen(false)} className="btn-secondary">Cerrar</button>
              {selectedSolicitud.estado !== "APROBADA" && selectedSolicitud.estado !== "CANCELADA" && (
                <button onClick={handleApprove} className="btn-success text-white px-4 py-2 rounded-xl font-semibold shadow-glow">
                  Aprobar y Matricular
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
