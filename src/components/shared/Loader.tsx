import React from "react";
import { useLanguageStore } from "@/store/language.store";

interface LoaderProps {
  text?: string;
  minHeight?: string;
}

export default function Loader({ text, minHeight = "300px" }: LoaderProps) {
  const { language } = useLanguageStore();

  const defaultText =
    language === "es" ? "Cargando..." : "Loading...";

  return (
    <div
      className="glass-panel p-12 text-center flex flex-col items-center justify-center space-y-4 border border-[var(--border-glass)] w-full"
      style={{ minHeight }}
    >
      <div className="w-10 h-10 rounded-full border-4 border-[var(--border-glass)] border-t-[var(--accent-primary)] animate-spin" />
      <p className="text-sm text-[var(--text-secondary)]">
        {text || defaultText}
      </p>
    </div>
  );
}
