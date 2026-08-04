"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ClipboardList, Plus, Search, Eye, X, CreditCard, User } from "lucide-react";
import DashboardPageShell from "@/components/shared/DashboardPageShell";
import Loader from "@/components/shared/Loader";
import ModuleGuard from "@/components/shared/ModuleGuard";
import api from "@/lib/api/axios";
import { useLanguageStore } from "@/store/language.store";
import { translations } from "@/lib/translations";

export default function CargosFinanzasPage() {
  const { language } = useLanguageStore();
  const t = translations[language as keyof typeof translations];

  const [cargos, setCargos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPagoModalOpen, setIsPagoModalOpen] = useState(false);
  const [selectedCargo, setSelectedCargo] = useState<any | null>(null);

  const [pagoForm, setPagoForm] = useState({
    monto: 0,
    metodoPago: "EFECTIVO",
    referencia: "",
  });

  const fetchCargos = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/finances/cargos");
      setCargos(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCargos();
  }, [fetchCargos]);

  const handleOpenDetail = (item: any) => {
    setSelectedCargo(item);
    setIsDetailModalOpen(true);
  };

  const handleOpenPagoModal = () => {
    setPagoForm({
      monto: selectedCargo?.saldo || 0,
      metodoPago: "EFECTIVO",
      referencia: "",
    });
    setIsPagoModalOpen(true);
  };

  const handleSavePago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCargo) return;

    if (pagoForm.monto > selectedCargo.saldo) {
      alert("El monto del pago no puede ser mayor al saldo pendiente.");
      return;
    }

    try {
      await api.post(`/finances/cargos/${selectedCargo.id}/pagos`, pagoForm);
      setIsPagoModalOpen(false);
      setIsDetailModalOpen(false);
      fetchCargos();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Error al registrar el pago");
    }
  };

  const filteredData = cargos.filter((c) => {
    const studentName = `${c.studentProfile?.user?.firstName || ""} ${c.studentProfile?.user?.lastName || ""}`.toLowerCase();
    const concepto = (c.concepto || "").toLowerCase();
    return studentName.includes(searchTerm.toLowerCase()) || concepto.includes(searchTerm.toLowerCase());
  });

  return (
    <ModuleGuard moduleKey="finances" requireSchoolContext={true}>
      <DashboardPageShell>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow shrink-0">
                  <ClipboardList size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
                    Cuentas por Cobrar
                  </h1>
                  <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                    Gestiona los cargos de los estudiantes y registra sus pagos.
                  </p>
                </div>
              </div>
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
                    placeholder="Buscar por estudiante o concepto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full !pl-10 glass-input"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--border-glass)] bg-white/[0.02]">
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Estudiante
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Concepto
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Vencimiento
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Saldo
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase">
                        Estado
                      </th>
                      <th className="p-4 text-xs font-bold text-[var(--text-secondary)] uppercase text-right">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-glass)]">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-0 border-0">
                          <Loader minHeight="200px" />
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-[var(--text-muted)]"
                        >
                          No hay cargos registrados.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-white/[0.01] transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[hsla(263,90%,60%,0.15)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-xs shrink-0">
                                {item.studentProfile?.user?.firstName?.charAt(0) || <User size={14} />}
                              </div>
                              <span className="font-semibold text-[var(--text-primary)] text-sm line-clamp-1">
                                {item.studentProfile?.user?.firstName} {item.studentProfile?.user?.lastName}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-[var(--text-secondary)] text-sm">
                            {item.concepto}
                          </td>
                          <td className="p-4 text-[var(--text-secondary)] text-sm">
                            {item.fechaVencimiento ? new Date(item.fechaVencimiento).toLocaleDateString("es-MX") : "-"}
                          </td>
                          <td className="p-4 font-bold text-[var(--text-primary)]">
                            ${item.saldo?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                item.estado === "PAGADO"
                                  ? "bg-[hsla(142,72%,45%,0.15)] text-[hsl(142,72%,60%)]"
                                  : item.estado === "PENDIENTE"
                                    ? "bg-[hsla(38,92%,52%,0.15)] text-[hsl(38,92%,60%)]"
                                    : item.estado === "ATRASADO"
                                      ? "bg-[hsla(354,85%,56%,0.15)] text-[hsl(354,85%,70%)]"
                                      : "bg-white/10 text-[var(--text-secondary)]"
                              }`}
                            >
                              {item.estado}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleOpenDetail(item)}
                              className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)] hover:text-white transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
      </DashboardPageShell>

      {/* DETAIL MODAL */}
      {isDetailModalOpen && selectedCargo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-main animate-slide-up flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
              <div>
                <h2 className="text-xl font-bold">Detalle del Cargo</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {selectedCargo.studentProfile?.user?.firstName} {selectedCargo.studentProfile?.user?.lastName}
                </p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-[var(--border-glass)]">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Concepto</div>
                  <div className="font-semibold">{selectedCargo.concepto}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-[var(--border-glass)]">
                  <div className="text-xs text-[var(--text-secondary)] mb-1">Vencimiento</div>
                  <div className="font-semibold">
                    {selectedCargo.fechaVencimiento ? new Date(selectedCargo.fechaVencimiento).toLocaleDateString("es-MX") : "-"}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[hsla(263,90%,60%,0.1)] border border-[hsla(263,90%,60%,0.2)]">
                  <div className="text-xs text-[var(--accent-primary)] mb-1">Monto Total</div>
                  <div className="text-xl font-bold text-white">
                    ${selectedCargo.monto?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[hsla(38,92%,52%,0.1)] border border-[hsla(38,92%,52%,0.2)]">
                  <div className="text-xs text-[hsl(38,92%,60%)] mb-1">Saldo Pendiente</div>
                  <div className="text-xl font-bold text-white">
                    ${selectedCargo.saldo?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-[var(--accent-primary)]">Historial de Pagos</h3>
                  {(selectedCargo.estado === "PENDIENTE" || selectedCargo.estado === "ATRASADO" || selectedCargo.estado === "PARCIAL") && (
                    <button
                      onClick={handleOpenPagoModal}
                      className="glass-button text-xs py-1.5 px-3"
                    >
                      <Plus size={14} /> Registrar Pago
                    </button>
                  )}
                </div>

                {selectedCargo.pagos && selectedCargo.pagos.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCargo.pagos.map((pago: any) => (
                      <div key={pago.id} className="flex items-center justify-between p-3 rounded-lg border border-[var(--border-glass)] bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[hsla(142,72%,45%,0.15)] flex items-center justify-center text-[hsl(142,72%,60%)]">
                            <CreditCard size={14} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold">{pago.metodoPago}</div>
                            <div className="text-xs text-[var(--text-secondary)]">
                              {new Date(pago.fechaPago).toLocaleDateString("es-MX")} - {pago.referencia || "Sin referencia"}
                            </div>
                          </div>
                        </div>
                        <div className="font-bold text-[hsl(142,72%,60%)]">
                          +${pago.monto?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border border-dashed border-[var(--border-glass)] rounded-xl text-[var(--text-muted)] text-sm">
                    No hay pagos registrados para este cargo.
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-[var(--border-glass)] flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="glass-button-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRAR PAGO MODAL */}
      {isPagoModalOpen && selectedCargo && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-2xl shadow-main animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-glass)]">
              <h2 className="text-xl font-bold">Registrar Pago</h2>
              <button
                onClick={() => setIsPagoModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSavePago} className="p-6 space-y-4">
              <div className="p-3 bg-[hsla(38,92%,52%,0.1)] rounded-lg text-center mb-2 border border-[hsla(38,92%,52%,0.2)]">
                <div className="text-xs text-[hsl(38,92%,60%)] mb-1">Saldo a cubrir</div>
                <div className="font-bold text-lg">${selectedCargo.saldo?.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</div>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Monto del Pago
                </label>
                <input
                  type="number"
                  required
                  min="0.01"
                  max={selectedCargo.saldo}
                  step="0.01"
                  className="glass-input w-full"
                  value={pagoForm.monto}
                  onChange={(e) =>
                    setPagoForm({ ...pagoForm, monto: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Método de Pago
                </label>
                <select
                  required
                  className="glass-input w-full"
                  value={pagoForm.metodoPago}
                  onChange={(e) =>
                    setPagoForm({ ...pagoForm, metodoPago: e.target.value })
                  }
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia / SPEI</option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-1">
                  Referencia / Folio (Opcional)
                </label>
                <input
                  type="text"
                  className="glass-input w-full"
                  placeholder="Ej. SPEI 123456"
                  value={pagoForm.referencia}
                  onChange={(e) =>
                    setPagoForm({ ...pagoForm, referencia: e.target.value })
                  }
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPagoModalOpen(false)}
                  className="glass-button-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="glass-button">
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ModuleGuard>
  );
}
