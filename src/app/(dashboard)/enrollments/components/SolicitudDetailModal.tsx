import React, { useState } from "react";
import { X, User, FileText, DollarSign, Users } from "lucide-react";
import api from "@/lib/api/axios";

interface DetailModalProps {
  solicitud: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SolicitudDetailModal({
  solicitud,
  onClose,
  onSuccess,
}: DetailModalProps) {
  const [activeTab, setActiveTab] = useState("ALUMNO");
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await api.post(`/enrollments/${solicitud.id}/approve`, {
        cargos: [
          {
            concepto: "Inscripción Anual",
            monto: 5000,
            fechaVencimiento: new Date().toISOString(),
          },
        ],
      });
      onSuccess();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error al aprobar");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm("¿Seguro que deseas rechazar esta solicitud?")) return;
    try {
      setLoading(true);
      await api.post(`/enrollments/${solicitud.id}/reject`, {
        reason: "Rechazado por admin",
      });
      onSuccess();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error al rechazar");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "¿Seguro que deseas cancelar esta inscripción? Esto revertirá la matrícula.",
      )
    )
      return;
    try {
      setLoading(true);
      await api.delete(`/enrollments/${solicitud.id}/cancel`, {
        data: { reason: "Cancelado por admin" },
      });
      onSuccess();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error al cancelar");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "ALUMNO", label: "Alumno", icon: <User size={16} /> },
    { id: "TUTORES", label: "Tutores", icon: <Users size={16} /> },
    { id: "DOCUMENTOS", label: "Documentos", icon: <FileText size={16} /> },
    { id: "CARGOS", label: "Cargos", icon: <DollarSign size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="glass-panel w-full max-w-4xl rounded-2xl shadow-main animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold gradient-text">
              Detalle de Solicitud
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                solicitud.estado === "APROBADA" ||
                solicitud.estado === "MATRICULADO"
                  ? "bg-[hsla(142,72%,45%,0.15)] text-[hsl(142,72%,60%)]"
                  : solicitud.estado === "RECHAZADA" ||
                      solicitud.estado === "CANCELADA"
                    ? "bg-[hsla(354,85%,56%,0.15)] text-[hsl(354,85%,70%)]"
                    : "bg-[hsla(38,92%,52%,0.15)] text-[hsl(38,92%,60%)]"
              }`}
            >
              {solicitud.estado}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-2 bg-[var(--bg-surface)]/30 border-b border-[var(--border-glass)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-[var(--accent-primary)] text-white shadow-glow"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === "ALUMNO" && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Nombre Completo
                  </p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    {solicitud.primerNombre} {solicitud.primerApellido}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Tipo de Solicitud
                  </p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    {solicitud.tipoSolicitud || "N/A"}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    Grado / Grupo ID
                  </p>
                  <p className="text-lg font-semibold text-[var(--text-primary)]">
                    {solicitud.gradeId || "-"} / {solicitud.groupId || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "TUTORES" && (
            <div className="space-y-4 animate-fade-in">
              {solicitud.padres && solicitud.padres.length > 0 ? (
                solicitud.padres.map((p: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50"
                  >
                    <p className="text-lg font-semibold text-[var(--text-primary)]">
                      {p.primerNombre} {p.primerApellido}{" "}
                      <span className="text-xs text-[var(--text-muted)] bg-[var(--bg-surface)] border border-[var(--border-glass)] px-2 py-0.5 rounded-full ml-2">
                        {p.relationship}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {p.email}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[var(--text-muted)] italic">
                  No hay tutores registrados.
                </p>
              )}
            </div>
          )}

          {activeTab === "DOCUMENTOS" && (
            <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)] animate-fade-in">
              <FileText size={48} className="mb-4 opacity-50" />
              <p>No hay documentos cargados en esta solicitud.</p>
            </div>
          )}

          {activeTab === "CARGOS" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl border border-[var(--border-glass)] bg-[var(--bg-surface)]/50 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg text-[var(--text-primary)]">
                    Inscripción Anual
                  </p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Cargo sugerido al aprobar
                  </p>
                </div>
                <p className="text-xl font-bold text-[hsl(142,72%,60%)]">
                  $5,000.00 MXN
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[var(--border-glass)] flex justify-between items-center bg-[var(--bg-surface)]/30 rounded-b-2xl">
          <div>
            {solicitud.estado === "APROBADA" && (
              <button
                onClick={handleCancel}
                disabled={loading}
                className="btn-danger"
              >
                Cancelar Inscripción
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="glass-button-secondary"
            >
              Cerrar
            </button>
            {solicitud.estado !== "APROBADA" &&
              solicitud.estado !== "CANCELADA" &&
              solicitud.estado !== "RECHAZADA" && (
                <>
                  <button
                    onClick={handleReject}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl font-semibold border border-[hsla(354,85%,56%,0.5)] text-[hsl(354,85%,70%)] hover:bg-[hsla(354,85%,56%,0.1)] transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={loading}
                    className="glass-button px-6 py-2 rounded-xl font-semibold shadow-glow"
                  >
                    {loading ? "Procesando..." : "Aprobar y Matricular"}
                  </button>
                </>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
