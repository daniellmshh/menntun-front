import React from "react";
import { Trash2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  title: string;
  subtitle?: string;
  description: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function ConfirmDeleteModal({
  title,
  subtitle = "Esta acción no se puede deshacer",
  description,
  onCancel,
  onConfirm,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div className="bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-[24px] p-8 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-scale-in">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
            <Trash2 size={22} className="text-red-500" />
          </div>
          <div>
            <h3 className="m-0 text-[var(--text-primary)] text-xl font-bold">{title}</h3>
            {subtitle && (
              <p className="m-0 text-[var(--text-secondary)] text-sm mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="text-[var(--text-secondary)] text-sm leading-relaxed mb-8">
          {description}
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-base)] border border-[var(--border-glass)] text-[var(--text-primary)] font-medium text-sm transition-all hover:bg-[var(--bg-panel-hover)] disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white border-none text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-glow disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {isLoading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
