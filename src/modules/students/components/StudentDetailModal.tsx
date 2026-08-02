"use client";

import { createPortal } from "react-dom";
import { Layers, Mail, MapPin, Phone, X } from "lucide-react";
import { translations } from "@/lib/translations";
import type { Student, StudentDetailTab } from "../types";

interface StudentDetailModalProps {
  detailStudent: Student;
  detailTab: StudentDetailTab;
  language: "en" | "es";
  t: typeof translations.es;
  onClose: () => void;
  onTabChange: (tab: StudentDetailTab) => void;
}

export default function StudentDetailModal({ detailStudent, detailTab, language, t, onClose, onTabChange }: StudentDetailModalProps) {
  return createPortal(
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-3xl w-full p-6 border border-[var(--border-glass)] relative flex flex-col max-h-[85vh] overflow-hidden animate-scale-up">
            <button
              onClick={() => onClose()}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer z-10"
            >
              <X size={20} />
            </button>

            {/* Modal Title Banner */}
            <div className="flex items-center gap-4 border-b border-[var(--border-glass)] pb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 border border-[var(--border-glass)] flex items-center justify-center text-[var(--accent-primary)] font-bold text-lg uppercase shrink-0">
                {detailStudent.firstName[0] || ""}{detailStudent.lastName[0] || ""}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                  {detailStudent.firstName} {detailStudent.lastName}
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  {t.students?.details?.role || "Role"}: {t.schools?.users?.roles?.STUDENT || "STUDENT"} | {t.students?.details?.schoolName || "Institution"}: {detailStudent.school?.name || detailStudent.schoolId}
                </p>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-[var(--border-glass)] gap-6 pb-1">
              <button
                onClick={() => onTabChange("general")}
                className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                  ${detailTab === "general" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                {t.students?.details?.generalInfo || "General Profile"}
              </button>
              <button
                onClick={() => onTabChange("enrollments")}
                className={`pb-3 text-sm font-semibold tracking-wide border-b-2 transition-all cursor-pointer
                  ${detailTab === "enrollments" ? "border-[var(--accent-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}
                `}
              >
                {t.students?.details?.enrollments || "Enrollments"}
              </button>
            </div>

            {/* Tab content area (scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 mt-4 space-y-6 custom-scrollbar" style={{ minHeight: "300px" }}>
              {/* TAB 1: General Info */}
              {detailTab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {language === "es" ? "Información de Contacto" : "Contact Details"}
                    </h3>
                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.students?.table?.email || "Email Address"}</span>
                          <span className="text-sm text-[var(--text-primary)] font-mono">{detailStudent.email}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Phone size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.students?.table?.phone || "Phone"}</span>
                          <span className="text-sm text-[var(--text-primary)]">{detailStudent.phone || "—"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-[var(--text-muted)] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs text-[var(--text-muted)] block">{t.students?.modal?.addressLabel || "Address"}</span>
                          <span className="text-sm text-[var(--text-primary)]">{detailStudent.studentProfile?.address || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                      {language === "es" ? "Detalles del Estudiante" : "Student Details"}
                    </h3>
                    <div className="space-y-3 bg-black/10 p-4 rounded-xl border border-[var(--border-glass)]">
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.enrollmentNumberLabel || "Matrícula"}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                          {detailStudent.studentProfile?.enrollmentNumber || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.birthDateLabel || "Birth Date"}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                          {detailStudent.studentProfile?.birthDate
                            ? new Date(detailStudent.studentProfile.birthDate).toLocaleDateString()
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.genderLabel || "Gender"}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)]">
                          {detailStudent.studentProfile?.gender || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.bloodTypeLabel || "Blood Type"}</span>
                        <span className="text-xs font-bold text-[var(--text-primary)] font-mono">
                          {detailStudent.studentProfile?.bloodType || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-xs text-[var(--text-secondary)]">{t.students?.modal?.statusLabel || "Status"}</span>
                        <span className={`text-xs font-bold ${detailStudent.active ? "text-[var(--accent-success)]" : "text-[var(--accent-danger)]"}`}>
                          {detailStudent.active ? (t.schools?.status?.active || "Active") : (t.schools?.status?.inactive || "Inactive")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Enrollments */}
              {detailTab === "enrollments" && (
                <div className="space-y-4 py-2">
                  <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    {t.students?.details?.enrollments || "Enrollments History"}
                  </h3>
                  
                  {!detailStudent.studentProfile?.enrollments || detailStudent.studentProfile.enrollments.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[var(--text-muted)] italic bg-black/10 rounded-xl border border-[var(--border-glass)]">
                      {t.students?.details?.noEnrollments || "No active group enrollments."}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detailStudent.studentProfile.enrollments.map((enr) => (
                        <div
                          key={enr.id}
                          className="flex items-center justify-between p-4 bg-black/15 border border-[var(--border-glass)] rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[var(--accent-primary)]/10 border border-[hsla(263,90%,65%,0.15)] flex items-center justify-center text-[var(--accent-primary)]">
                              <Layers size={18} />
                            </div>
                            <div>
                              <span className="font-semibold text-sm text-[var(--text-primary)] block">
                                {enr.group?.grade?.name} {enr.group?.name}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)]">
                                {language === "es" ? "Ciclo: " : "Cycle: "} {enr.group?.schoolYear?.name}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider mb-1
                                ${
                                  enr.status === "ACTIVE"
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-[var(--accent-success)]"
                                    : "bg-white/5 border-white/10 text-[var(--text-secondary)]"
                                }
                              `}
                            >
                              {enr.status}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] block">
                              {t.students?.details?.enrolledAt || "Enrolled"}: {new Date(enr.enrolledAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
    ,
    document.body
  );
}

