"use client";

import { useState } from "react";
import { Loader2, X, XCircle } from "lucide-react";
import api from "@/lib/api/axios";
import ModalShell from "@/components/shared/ModalShell";
import type { ApiResponse } from "@/types";
import type {
  AcademicGroup,
  Grade,
  GroupTranslations,
  School,
  SchoolYear,
} from "../types";

interface GroupModalProps {
  group: AcademicGroup | null;
  schools: School[];
  grades: Grade[];
  schoolYears: SchoolYear[];
  isSuperAdmin: boolean;
  currentSchoolId: string;
  onClose: () => void;
  onSaved: (group: AcademicGroup) => void;
  translations: GroupTranslations;
}

interface GroupForm {
  name: string;
  gradeId: string;
  schoolYearId: string;
  maxStudents: number | string;
  schoolId: string;
}

function getApiError(error: unknown): string | undefined {
  if (!error || typeof error !== "object" || !("response" in error)) return undefined;
  const response = error.response;
  if (!response || typeof response !== "object" || !("data" in response)) return undefined;
  const data = response.data;
  if (!data || typeof data !== "object") return undefined;
  const { error: apiError, message } = data as { error?: unknown; message?: unknown };
  if (Array.isArray(message) && typeof message[0] === "string") return message[0];
  if (typeof message === "string") return message;
  return typeof apiError === "string" ? apiError : undefined;
}

export default function GroupModal({
  group,
  schools,
  grades,
  schoolYears,
  isSuperAdmin,
  currentSchoolId,
  onClose,
  onSaved,
  translations,
}: GroupModalProps) {
  const [form, setForm] = useState<GroupForm>({
    name: group?.name || "",
    gradeId: group?.gradeId || "",
    schoolYearId: group?.schoolYearId || "",
    maxStudents: group?.maxStudents || "",
    schoolId: group?.schoolId || currentSchoolId || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredGrades = grades.filter((grade) => grade.schoolId === form.schoolId);
  const filteredYears = schoolYears.filter(
    (year) => year.schoolId === form.schoolId && (!group || year.active),
  );

  const handleSave = async () => {
    if (!form.name || !form.gradeId || !form.schoolYearId) {
      setError("Completa todos los campos requeridos.");
      return;
    }

    setLoading(true);
    setError("");
    const maxStudents = form.maxStudents ? Number(form.maxStudents) : null;

    try {
      if (group) {
        const response = await api.patch<ApiResponse<AcademicGroup>>(
          `/academic/groups/${group.id}`,
          { name: form.name, gradeId: form.gradeId, maxStudents },
        );
        onSaved(response.data.data);
        return;
      }

      const payload: {
        name: string;
        gradeId: string;
        schoolYearId: string;
        maxStudents: number | null;
        schoolId?: string;
      } = {
        name: form.name,
        gradeId: form.gradeId,
        schoolYearId: form.schoolYearId,
        maxStudents,
      };
      if (isSuperAdmin && form.schoolId) payload.schoolId = form.schoolId;

      const response = await api.post<ApiResponse<AcademicGroup>>(
        "/academic/groups",
        payload,
      );
      onSaved(response.data.data);
    } catch (requestError) {
      setError(
        getApiError(requestError) ||
          translations.alerts.errorCreate ||
          "Ocurrió un error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell>
      <div className="w-full max-w-md glass-panel border border-[var(--border-glass)] rounded-2xl shadow-main flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border-glass)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            {group ? translations.modal.editTitle : translations.modal.createTitle}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-[var(--text-secondary)]">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[hsla(354,85%,56%,0.1)] border border-[hsla(354,85%,56%,0.2)] text-[hsl(354,85%,70%)] text-sm">
              <XCircle size={14} /> {error}
            </div>
          )}
          {isSuperAdmin && !group && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{translations.modal.schoolLabel}</label>
              <select value={form.schoolId} onChange={(event) => setForm({ ...form, schoolId: event.target.value, gradeId: "", schoolYearId: "" })} className="w-full glass-input text-sm">
                <option value="">— Sin asignar (usar mi escuela) —</option>
                {schools.map((school) => <option key={school.id} value={school.id}>{school.name} ({school.code})</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{translations.modal.gradeLabel}</label>
            <select value={form.gradeId} onChange={(event) => setForm({ ...form, gradeId: event.target.value })} className="w-full glass-input text-sm" disabled={isSuperAdmin && !form.schoolId}>
              <option value="">Selecciona un grado</option>
              {filteredGrades.map((grade) => <option key={grade.id} value={grade.id}>{grade.name} {grade.level ? `(${grade.level})` : ""}</option>)}
            </select>
          </div>
          {!group && (
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{translations.modal.schoolYearLabel}</label>
              <select value={form.schoolYearId} onChange={(event) => setForm({ ...form, schoolYearId: event.target.value })} className="w-full glass-input text-sm" disabled={isSuperAdmin && !form.schoolId}>
                <option value="">Selecciona un ciclo escolar</option>
                {filteredYears.map((year) => <option key={year.id} value={year.id}>{year.name} {year.active ? "(Activo)" : ""}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{translations.modal.nameLabel}</label>
            <input type="text" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ej. A, B, 101" className="w-full glass-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{translations.modal.maxStudentsLabel}</label>
            <input type="number" min={1} value={form.maxStudents} onChange={(event) => setForm({ ...form, maxStudents: event.target.value })} placeholder="Sin límite" className="w-full glass-input" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-glass)]">
          <button onClick={onClose} className="glass-button-secondary">{translations.modal.cancel}</button>
          <button onClick={handleSave} disabled={loading} className="glass-button disabled:opacity-50 flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? (translations.modal.loading || "Guardando...") : (translations.modal.save || "Guardar")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
