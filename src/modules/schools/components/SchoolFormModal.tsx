"use client";

import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import { Loader2, X } from "lucide-react";
import ModalShell from "@/components/shared/ModalShell";
import { translations } from "@/lib/translations";

type SchoolModalMode = "create" | "edit";
type TextSetter = Dispatch<SetStateAction<string>>;

interface SchoolFormModalProps {
  mode: SchoolModalMode;
  t: typeof translations.es;
  error: string | null;
  submitting: boolean;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  logoUrl: string;
  isIndependentTeacher: boolean;
  onNameChange: TextSetter;
  onCodeChange: TextSetter;
  onAddressChange: TextSetter;
  onPhoneChange: TextSetter;
  onEmailChange: TextSetter;
  onLogoUrlChange: TextSetter;
  onIndependentTeacherChange: Dispatch<SetStateAction<boolean>>;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

export default function SchoolFormModal({
  mode,
  t,
  error,
  submitting,
  name,
  code,
  address,
  phone,
  email,
  logoUrl,
  isIndependentTeacher,
  onNameChange,
  onCodeChange,
  onAddressChange,
  onPhoneChange,
  onEmailChange,
  onLogoUrlChange,
  onIndependentTeacherChange,
  onClose,
  onSubmit,
}: SchoolFormModalProps) {
  const isCreating = mode === "create";

  return (
    <ModalShell className="items-center justify-center p-4 overflow-y-auto bg-black/70">
      <div className="glass-panel max-w-lg w-full p-6 space-y-6 border border-[var(--border-glass)] relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="space-y-1">
          <h2 className="text-xl font-bold gradient-text">
            {isCreating ? t.schools.modal.createTitle : t.schools.modal.editTitle}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                {t.schools.modal.nameLabel} *
              </label>
              <input
                type="text"
                required
                placeholder="Colegio ..."
                value={name}
                onChange={(event) => onNameChange(event.target.value)}
                className="glass-input"
                disabled={submitting}
              />
            </div>

            {isCreating && (
              <label className="flex items-center gap-2 cursor-pointer mt-2 bg-white/[0.02] p-3 rounded-lg border border-[var(--border-glass)] hover:bg-white/[0.05] transition-colors">
                <input
                  type="checkbox"
                  checked={isIndependentTeacher}
                  onChange={(event) => {
                    onIndependentTeacherChange(event.target.checked);
                    if (event.target.checked) onCodeChange("");
                  }}
                  disabled={submitting}
                  className="w-4 h-4 rounded text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] border-gray-600 bg-gray-700"
                />
                <span className="text-sm font-medium text-[var(--text-primary)]">
                  {t.schools.modal.isIndependent || "¿Es Maestro Independiente? (Workspace Personal)"}
                </span>
              </label>
            )}

            {!isIndependentTeacher && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                  {t.schools.modal.codeLabel} *
                </label>
                <input
                  type="text"
                  required={!isIndependentTeacher}
                  placeholder="COLEGIO-01"
                  value={code}
                  onChange={(event) => onCodeChange(event.target.value)}
                  className="glass-input font-mono uppercase"
                  disabled={submitting || !isCreating}
                />
              </div>
            )}

            <FormField label={t.schools.modal.emailLabel} type="email" placeholder="contact@school.com" value={email} onChange={onEmailChange} disabled={submitting} />
            <FormField label={t.schools.modal.phoneLabel} placeholder="+354 ..." value={phone} onChange={onPhoneChange} disabled={submitting} />
            <FormField label={t.schools.modal.addressLabel} placeholder="123 Education St." value={address} onChange={onAddressChange} disabled={submitting} />
            <FormField label="Logo Image URL" placeholder="https://..." value={logoUrl} onChange={onLogoUrlChange} disabled={submitting} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border-glass)]">
            <button type="button" onClick={onClose} disabled={submitting} className="glass-button-secondary py-2 px-5 text-sm cursor-pointer">
              {t.schools.modal.cancel}
            </button>
            <button type="submit" disabled={submitting} className="glass-button py-2 px-5 text-sm flex items-center gap-2 cursor-pointer">
              {submitting && <Loader2 size={16} className="animate-spin" />}
              <span>{submitting ? t.schools.modal.loading : t.schools.modal.save}</span>
            </button>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}

interface FormFieldProps {
  label: string;
  type?: "email" | "text";
  placeholder: string;
  value: string;
  onChange: TextSetter;
  disabled: boolean;
}

function FormField({ label, type = "text", placeholder, value, onChange, disabled }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="glass-input"
        disabled={disabled}
      />
    </div>
  );
}
