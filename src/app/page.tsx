import Link from "next/link";
import { GraduationCap, ArrowRight, ShieldCheck, Cpu, Database } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Background decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--accent-secondary)]/10 rounded-full blur-[100px] pointer-events-none" />

      <main className="w-full max-w-4xl z-10 space-y-12 text-center">
        {/* Logo and title */}
        <div className="space-y-4">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-glow">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight md:text-6xl bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
            Menntun
          </h1>
          <p className="max-w-xl mx-auto text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
            A state-of-the-art modular school management system. High-performance, secure, and beautiful by design.
          </p>
        </div>

        {/* CTA section */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login" className="glass-button flex items-center gap-2 group text-sm font-semibold tracking-wide">
            Enter Dashboard
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            className="glass-button-secondary text-sm font-semibold tracking-wide"
          >
            Documentation
          </a>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="glass-panel-interactive p-6 text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/15 flex items-center justify-center text-[var(--accent-primary)] border border-[var(--accent-primary)]/20">
              <Cpu size={20} />
            </div>
            <h3 className="font-bold text-lg">Modular Design</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Dynamic module activation per school. Toggle student, grading, attendance, and fee features easily.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-secondary)]/15 flex items-center justify-center text-[var(--accent-secondary)] border border-[var(--accent-secondary)]/20">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-lg">Multi-Tenancy</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Row-Level Security (RLS) and school-specific database isolation ensure complete data privacy.
            </p>
          </div>

          <div className="glass-panel-interactive p-6 text-left space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-cyan)]/15 flex items-center justify-center text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20">
              <Database size={20} />
            </div>
            <h3 className="font-bold text-lg">Unified Engine</h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Built on Next.js 15, NestJS, and Prisma ORM with Supabase PostgreSQL to deliver lightning-fast updates.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
