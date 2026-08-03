import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { legalProfile, legalProfileIsComplete } from "@/lib/legal";

type LegalPageLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function LegalPageLayout({ title, description, children }: LegalPageLayoutProps) {
  return <main className="min-h-screen bg-[var(--bg-base)] py-24 font-sans text-[var(--text-primary)]">
    <div className="mx-auto max-w-4xl px-6">
      <Link href="/" className="mb-8 inline-flex items-center gap-2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"><ArrowLeft size={16} />Volver al inicio</Link>
      <article className="glass-panel p-8 md:p-12">
        <header className="mb-10 border-b border-[var(--border-glass)] pb-6"><h1 className="mb-3 text-3xl font-extrabold md:text-4xl">{title}</h1><p className="text-[var(--text-secondary)]">{description}</p><p className="mt-3 text-sm text-[var(--text-secondary)]">Vigencia: {legalProfile.effectiveDate}</p></header>
        {!legalProfileIsComplete && <aside className="mb-8 flex gap-3 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-4 text-sm text-[var(--text-primary)]"><AlertTriangle className="mt-0.5 shrink-0 text-[var(--warning)]" size={18} /><p><strong>Configuración legal pendiente.</strong> Esta versión contiene campos identificados entre corchetes que deben completarse con la información real del responsable antes de su publicación.</p></aside>}
        <div className="space-y-8 leading-relaxed text-[var(--text-secondary)]">{children}</div>
      </article>
    </div>
  </main>;
}
