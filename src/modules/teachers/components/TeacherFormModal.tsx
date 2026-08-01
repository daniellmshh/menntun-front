"use client";

import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Loader2, X } from "lucide-react";
import ModalShell from "@/components/shared/ModalShell";
import { translations } from "@/lib/translations";
import type { SchoolOption } from "../types";

type TextSetter = Dispatch<SetStateAction<string>>;
type FormMode = "create" | "edit";

interface TeacherFormModalProps {
  mode: FormMode;
  t: typeof translations.es;
  error: string | null;
  submitting: boolean;
  canSelectSchool: boolean;
  schools: SchoolOption[];
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  schoolId: string;
  employeeNumber: string;
  specialty: string;
  hireDate: string;
  onEmailChange: TextSetter;
  onPasswordChange: TextSetter;
  onFirstNameChange: TextSetter;
  onLastNameChange: TextSetter;
  onPhoneChange: TextSetter;
  onSchoolIdChange: TextSetter;
  onEmployeeNumberChange: TextSetter;
  onSpecialtyChange: TextSetter;
  onHireDateChange: TextSetter;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function TeacherFormModal({ mode, t, error, submitting, canSelectSchool, schools, email, password, firstName, lastName, phone, schoolId, employeeNumber, specialty, hireDate, onEmailChange, onPasswordChange, onFirstNameChange, onLastNameChange, onPhoneChange, onSchoolIdChange, onEmployeeNumberChange, onSpecialtyChange, onHireDateChange, onClose, onSubmit }: TeacherFormModalProps) {
  const isCreating = mode === "create";
  return (
    <ModalShell className="items-center justify-center p-4 overflow-y-auto bg-black/70">
      <div className="glass-panel max-w-lg w-full p-6 space-y-6 border border-[var(--border-glass)] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"><X size={20} /></button>
        <h2 className="text-xl font-bold gradient-text">{isCreating ? t.teachers.modal.createTitle : t.teachers.modal.editTitle}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{error}</div>}
          <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 gap-3"><TextField label={`${t.schools.users.modal.firstName} *`} value={firstName} onChange={onFirstNameChange} disabled={submitting} required /><TextField label={`${t.schools.users.modal.lastName} *`} value={lastName} onChange={onLastNameChange} disabled={submitting} required /></div>
            <TextField label={`${t.schools.users.modal.email} *`} type="email" value={email} onChange={onEmailChange} disabled={submitting || !isCreating} required />
            {isCreating && <TextField label={`${t.teachers.modal.passwordLabel} *`} type="password" value={password} onChange={onPasswordChange} disabled={submitting} required />}
            <TextField label={t.teachers.table.phone} value={phone} onChange={onPhoneChange} disabled={submitting} />
            {canSelectSchool && isCreating && <div className="space-y-1.5"><label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{t.teachers.details.schoolName || "School"} *</label><select value={schoolId} onChange={(event) => onSchoolIdChange(event.target.value)} className="glass-input bg-[var(--bg-surface)]" disabled={submitting}><option value="">Selecciona escuela / Select school</option>{schools.map((school) => <option key={school.id} value={school.id}>{school.name} ({school.code})</option>)}</select></div>}
            <TextField label={t.teachers.modal.employeeNumberLabel} placeholder="EMP-001" value={employeeNumber} onChange={onEmployeeNumberChange} disabled={submitting} className="font-mono" />
            <TextField label={t.teachers.modal.specialtyLabel} placeholder="Mathematics, Physics ..." value={specialty} onChange={onSpecialtyChange} disabled={submitting} />
            <TextField label={t.teachers.modal.hireDateLabel} type="date" value={hireDate} onChange={onHireDateChange} disabled={submitting} />
          </div>
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-glass)]"><button type="button" onClick={onClose} disabled={submitting} className="glass-button-secondary py-2 px-5 text-sm cursor-pointer">{t.teachers.modal.cancel}</button><button type="submit" disabled={submitting} className="glass-button py-2 px-5 text-sm flex items-center gap-2 cursor-pointer">{submitting && <Loader2 size={16} className="animate-spin" />}<span>{submitting ? t.teachers.modal.loading : t.teachers.modal.save}</span></button></div>
        </form>
      </div>
    </ModalShell>
  );
}

interface TextFieldProps { label: string; type?: "date" | "email" | "password" | "text"; placeholder?: string; value: string; onChange: TextSetter; disabled: boolean; required?: boolean; className?: string; }
function TextField({ label, type = "text", placeholder, value, onChange, disabled, required = false, className = "" }: TextFieldProps) { return <div className="space-y-1.5"><label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{label}</label><input type={type} required={required} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className={`glass-input ${className}`} disabled={disabled} /></div>; }
