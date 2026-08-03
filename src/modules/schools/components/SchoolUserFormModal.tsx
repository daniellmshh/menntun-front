"use client";

import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Loader2, ToggleLeft, ToggleRight, X } from "lucide-react";
import ModalShell from "@/components/shared/ModalShell";
import { translations } from "@/lib/translations";

type UserModalMode = "create" | "edit";
export type SchoolUserPosition = "admin" | "director" | "treasurer" | "teacher" | "attendance_operator";
type TextSetter = Dispatch<SetStateAction<string>>;

interface SchoolUserFormModalProps {
  mode: UserModalMode;
  t: typeof translations.es;
  error: string | null;
  submitting: boolean;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  position: SchoolUserPosition;
  active: boolean;
  onFirstNameChange: TextSetter;
  onLastNameChange: TextSetter;
  onEmailChange: TextSetter;
  onPasswordChange: TextSetter;
  onPhoneChange: TextSetter;
  onPositionChange: Dispatch<SetStateAction<SchoolUserPosition>>;
  onActiveChange: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function SchoolUserFormModal({
  mode,
  t,
  error,
  submitting,
  firstName,
  lastName,
  email,
  password,
  phone,
  position,
  active,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPasswordChange,
  onPhoneChange,
  onPositionChange,
  onActiveChange,
  onClose,
  onSubmit,
}: SchoolUserFormModalProps) {
  const isCreating = mode === "create";

  return (
    <ModalShell className="items-center justify-center p-4 overflow-y-auto bg-black/70">
      <div className="glass-panel max-w-md w-full p-6 space-y-6 border border-[var(--border-glass)] relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
          <X size={20} />
        </button>

        <div className="space-y-1">
          <h2 className="text-xl font-bold gradient-text">
            {isCreating ? t.schools.users.modal.createTitle : t.schools.users.modal.editTitle}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">{error}</div>}

          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-3">
              <TextField label={`${t.schools.users.modal.firstName} *`} placeholder="Jane" value={firstName} onChange={onFirstNameChange} disabled={submitting} required />
              <TextField label={`${t.schools.users.modal.lastName} *`} placeholder="Doe" value={lastName} onChange={onLastNameChange} disabled={submitting} required />
            </div>

            <TextField label={`${t.schools.users.modal.email} *`} type="email" placeholder="name@school.com" value={email} onChange={onEmailChange} disabled={submitting || !isCreating} required />

            {isCreating && <TextField label={`${t.schools.users.modal.password} *`} type="password" placeholder="••••••••" value={password} onChange={onPasswordChange} disabled={submitting} required />}

            <TextField label={t.schools.users.modal.phone} placeholder="+354 ..." value={phone} onChange={onPhoneChange} disabled={submitting} />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                {t.schools.users.modal.role} *
              </label>
              <select
                value={position}
                onChange={(event) => onPositionChange(event.target.value as SchoolUserPosition)}
                className="glass-input bg-[var(--bg-surface)]"
                disabled={submitting}
              >
                <option value="admin">{t.schools.users.modal.positionOptions.admin}</option>
                <option value="director">{t.schools.users.modal.positionOptions.director}</option>
                <option value="treasurer">{t.schools.users.modal.positionOptions.treasurer}</option>
                <option value="teacher">{t.schools.users.modal.positionOptions.teacher}</option>
                <option value="attendance_operator">Operador de asistencias</option>
              </select>
            </div>

            {!isCreating && (
              <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-glass)] bg-black/10">
                <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase">{t.schools.users.modal.status}</span>
                <button type="button" onClick={() => onActiveChange(!active)} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                  {active ? <ToggleRight size={32} className="text-[var(--accent-success)]" /> : <ToggleLeft size={32} className="text-[var(--text-muted)]" />}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
            <button type="button" onClick={onClose} disabled={submitting} className="glass-button-secondary py-2 px-5 text-sm cursor-pointer">
              {t.schools.users.modal.cancel}
            </button>
            <button type="submit" disabled={submitting} className="glass-button py-2 px-5 text-sm flex items-center gap-2 cursor-pointer">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              <span>{submitting ? t.schools.users.modal.loading : isCreating ? t.schools.users.modal.save : t.schools.users.modal.update}</span>
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}

interface TextFieldProps {
  label: string;
  type?: "email" | "password" | "text";
  placeholder: string;
  value: string;
  onChange: TextSetter;
  disabled: boolean;
  required?: boolean;
}

function TextField({ label, type = "text", placeholder, value, onChange, disabled, required = false }: TextFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{label}</label>
      <input type={type} required={required} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} className="glass-input" disabled={disabled} />
    </div>
  );
}
