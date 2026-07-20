"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Database,
  Sun,
  Moon,
  Globe,
  CheckCircle2,
  Smartphone,
  Users,
  MessageCircle,
  Sparkles,
  Send
} from "lucide-react";
import { useLanguageStore } from "@/store/language.store";
import { useThemeStore } from "@/store/theme.store";
import { translations } from "@/lib/translations";

export default function LandingPage() {
  const { language, setLanguage } = useLanguageStore();
  const { theme, toggleTheme } = useThemeStore();
  const t = translations[language];

  // Avoid hydration mismatch for theme icons
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const WHATSAPP_NUMBER = "521234567890"; // Reemplazar con el número real
  const WHATSAPP_MESSAGE = encodeURIComponent("¡Hola! Me interesa conocer más sobre Menntun y sus paquetes.");
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans overflow-x-hidden">
      {/* Decorative ambient glows */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

      {/* 1. NAVBAR */}
      <header className="fixed top-0 left-0 right-0 h-[var(--header-height)] z-50 bg-[var(--bg-panel)]/40 backdrop-blur-md border-b border-[var(--border-glass)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center shadow-glow">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight gradient-accent-text">
              Menntun
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">Características</a>
            <a href="#roadmap" className="hover:text-[var(--text-primary)] transition-colors">Futuro</a>
            <a href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">Planes</a>
            <a href="#contact" className="hover:text-[var(--text-primary)] transition-colors">Contacto</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border-glass)] bg-white/[0.03] text-[var(--text-primary)] transition-all duration-200 hover:bg-white/[0.08]"
              aria-label="Toggle Theme"
            >
              {!mounted ? null : theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setLanguage(language === "en" ? "es" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 h-9 rounded-xl border border-[var(--border-glass)] bg-white/[0.03] text-xs font-bold uppercase transition-all duration-200 hover:bg-white/[0.08]"
            >
              <Globe size={14} />
              {language}
            </button>
            <Link href="/login" className="glass-button h-9 px-5 text-sm">
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-[var(--header-height)] relative z-10">
        
        {/* 2. HERO SECTION */}
        <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-32 flex flex-col items-center text-center gap-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--accent-primary-light)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary-light)] text-sm font-semibold mb-4">
            <Sparkles size={16} />
            El futuro de la gestión escolar
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
            Gestión Inteligente para Colegios y <br className="hidden md:block" />
            <span className="gradient-accent-text">Maestros Independientes</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Menntun es un sistema modular, seguro y veloz que centraliza toda la administración educativa. 
            Desde planeaciones impulsadas por Inteligencia Artificial (NEM) hasta control total multi-plantel.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
            <Link href="/login" className="glass-button h-14 px-8 text-lg w-full sm:w-auto shadow-glow">
              Comenzar Ahora <ArrowRight size={20} className="ml-2" />
            </Link>
            <a href="#features" className="glass-button-secondary h-14 px-8 text-lg w-full sm:w-auto flex items-center justify-center">
              Descubrir más
            </a>
          </div>

          {/* Hero Image / App Mockup */}
          <div className="mt-16 w-full max-w-5xl rounded-[var(--radius-xl)] p-2 bg-gradient-to-br from-[var(--border-glass)] to-[var(--bg-base)] shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-transparent to-transparent z-10 bottom-0 h-1/3" />
            <div className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-glass)] glass-panel aspect-[16/9] w-full">
               <Image 
                  src="/images/hero-dashboard.jpg" 
                  alt="Menntun Dashboard" 
                  fill
                  className="object-cover object-top"
                  priority
                  unoptimized
               />
            </div>
          </div>
        </section>

        {/* 3. FEATURES SECTION (What it does) */}
        <section id="features" className="py-24 bg-[var(--bg-surface)]/50 border-y border-[var(--border-glass)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Lo que Menntun hace por ti</h2>
              <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                Diseñado para reducir la carga administrativa y potenciar el aprendizaje con tecnología de punta.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/15 flex items-center justify-center text-[var(--accent-primary)]">
                  <Cpu size={28} />
                </div>
                <h3 className="text-2xl font-bold">Motor RAG con IA para Planeaciones (NEM)</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Genera planeaciones didácticas fundamentadas estrictamente en los documentos oficiales de la Nueva Escuela Mexicana. 
                  Selecciona la modalidad, el campo formativo, y deja que nuestro motor genere fases detalladas para preescolar, primaria o secundaria.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="text-[var(--accent-success)]" size={18} /> Cero alucinaciones, contexto estricto de la SEP.</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="text-[var(--accent-success)]" size={18} /> Respeto total a la autonomía del maestro.</li>
                </ul>
              </div>
              <div className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-glass)] shadow-glass h-[400px]">
                 <Image src="/images/ai-planning.jpg" alt="Planeaciones IA" fill className="object-cover object-left-top" unoptimized />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-glass)] shadow-glass h-[400px]">
                <Image src="/images/modular-architecture.jpg" alt="Arquitectura Modular" fill className="object-cover object-left-top" unoptimized />
              </div>
              <div className="space-y-6 order-1 md:order-2">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-secondary)]/15 flex items-center justify-center text-[var(--accent-secondary)]">
                  <Database size={28} />
                </div>
                <h3 className="text-2xl font-bold">Arquitectura Modular y Arma tu Propio Paquete</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  Paga y activa solo los módulos que tú o tu escuela necesitan. Ya seas un maestro independiente o un colegio completo.
                  Elige desde planeación individual hasta control financiero multi-plantel. Cada entorno cuenta con aislamiento de datos (Row-Level Security).
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="text-[var(--accent-success)]" size={18} /> Activación dinámica de módulos.</li>
                  <li className="flex items-center gap-3 text-sm font-medium"><CheckCircle2 className="text-[var(--accent-success)]" size={18} /> Gestión multi-escuela para administradores.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. ROADMAP (What it will do) */}
        <section id="roadmap" className="py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">El Futuro de Menntun</h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto mb-16">
              El desarrollo nunca se detiene. Esto es lo que llegará muy pronto a nuestro ecosistema.
            </p>

            <div className="grid sm:grid-cols-3 gap-8">
              <div className="glass-panel p-8 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                <Smartphone size={48} className="text-[var(--accent-primary-light)]" />
                <h3 className="text-xl font-bold">Apps Móviles Nativas</h3>
                <p className="text-sm text-[var(--text-muted)]">Aplicaciones para iOS (SwiftUI) y Android (Kotlin) conectadas a la misma API para acceso desde cualquier lugar.</p>
              </div>
              <div className="glass-panel p-8 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                <Users size={48} className="text-[var(--accent-secondary)]" />
                <h3 className="text-xl font-bold">Portal de Padres y Alumnos</h3>
                <p className="text-sm text-[var(--text-muted)]">Cuentas de solo lectura para que las familias den seguimiento a calificaciones, asistencias y reportes disciplinarios.</p>
              </div>
              <div className="glass-panel p-8 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                <ShieldCheck size={48} className="text-[var(--accent-cyan)]" />
                <h3 className="text-xl font-bold">Pagos y Facturación</h3>
                <p className="text-sm text-[var(--text-muted)]">Módulo financiero integral para gestionar colegiaturas, becas, cobros automatizados y facturación local.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. PRICING SECTION */}
        <section id="pricing" className="py-24 bg-[var(--bg-surface)]/50 border-y border-[var(--border-glass)]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Paquetes Modulares</h2>
              <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                Elige el plan que mejor se adapte al tamaño de tu institución.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Basic */}
              <div className="glass-panel p-8 flex flex-col gap-6">
                <div>
                  <h3 className="text-2xl font-bold">Básico</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Para escuelas pequeñas</p>
                </div>
                <div className="text-4xl font-extrabold">$Próximamente</div>
                <ul className="space-y-4 flex-1">
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-primary)]" /> Módulo Académico</li>
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-primary)]" /> Módulo de Maestros</li>
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-primary)]" /> Control de Estudiantes</li>
                  <li className="flex items-center gap-3 text-sm text-[var(--text-muted)] opacity-50"><CheckCircle2 size={16} /> IA Generativa</li>
                </ul>
                <button className="glass-button-secondary w-full">Me interesa</button>
              </div>

              {/* Pro (Highlighted) */}
              <div className="glass-panel-interactive p-8 flex flex-col gap-6 border-[var(--accent-primary)]/50 relative transform md:-translate-y-4 shadow-glow">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] px-4 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                  Recomendado
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Profesional</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Gestión completa e Inteligencia Artificial</p>
                </div>
                <div className="text-4xl font-extrabold gradient-accent-text">$Próximamente</div>
                <ul className="space-y-4 flex-1">
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-secondary)]" /> Todo lo del plan Básico</li>
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-secondary)]" /> Planeaciones con IA RAG</li>
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-secondary)]" /> Calificaciones y Asistencia</li>
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-secondary)]" /> Soporte Prioritario</li>
                </ul>
                <button className="glass-button w-full">Contactar Ventas</button>
              </div>

              {/* Enterprise */}
              <div className="glass-panel p-8 flex flex-col gap-6">
                <div>
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Para grupos de colegios</p>
                </div>
                <div className="text-4xl font-extrabold">$Próximamente</div>
                <ul className="space-y-4 flex-1">
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-primary)]" /> Todos los Módulos</li>
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-primary)]" /> Multi-Tenancy Global</li>
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-primary)]" /> Integraciones API (ERP)</li>
                  <li className="flex items-center gap-3 text-sm"><CheckCircle2 size={16} className="text-[var(--accent-primary)]" /> Desarrollo a la medida</li>
                </ul>
                <button className="glass-button-secondary w-full">Cotizar a medida</button>
              </div>
            </div>
          </div>
        </section>

        {/* 6. CONTACT SECTION */}
        <section id="contact" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            
            {/* Form */}
            <div className="glass-panel p-8 md:p-12 space-y-6 z-10">
              <h2 className="text-3xl font-bold">¿Tienes dudas? Escríbenos</h2>
              <p className="text-[var(--text-secondary)] text-sm">Déjanos tus datos y un asesor se pondrá en contacto contigo lo antes posible para una demostración.</p>
              
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2 block">Nombre Completo</label>
                  <input type="text" className="glass-input" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2 block">Email</label>
                  <input type="email" className="glass-input" placeholder="director@escuela.edu" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-secondary)] uppercase mb-2 block">Mensaje</label>
                  <textarea className="glass-input min-h-[120px] resize-none" placeholder="¿Cómo podemos ayudarte?" />
                </div>
                <button type="submit" className="glass-button w-full mt-2">
                  <Send size={18} /> Enviar Mensaje
                </button>
              </form>
            </div>

            {/* Direct Contact (WhatsApp) */}
            <div className="flex flex-col justify-center space-y-8 z-10">
              <div>
                <h2 className="text-4xl font-extrabold mb-4">Habla directamente con nosotros</h2>
                <p className="text-[var(--text-secondary)] text-lg">
                  Si prefieres una atención inmediata o tienes preguntas técnicas, estamos disponibles en WhatsApp en este momento.
                </p>
              </div>
              
              <a 
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-[#25D366] hover:bg-[#1DA851] text-white px-8 py-4 rounded-2xl shadow-[0_0_30px_rgba(37,211,102,0.3)] transition-all transform hover:-translate-y-1 w-max font-bold text-lg"
              >
                <MessageCircle size={28} />
                Chatear por WhatsApp
              </a>

              {/* Decorative Image */}
              <div className="relative w-full h-[250px] rounded-2xl overflow-hidden mt-8 opacity-80 border border-[var(--border-glass)]">
                <Image src="/images/contact-support.jpg" alt="Soporte Menntun" fill className="object-cover" unoptimized />
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 7. FOOTER */}
      <footer className="border-t border-[var(--border-glass)] bg-[var(--bg-surface)] py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-[var(--text-secondary)]" size={24} />
            <span className="text-xl font-bold text-[var(--text-secondary)]">Menntun</span>
          </div>
          <p className="text-[var(--text-muted)] text-sm">
            © {new Date().getFullYear()} Menntun School Management. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-[var(--text-secondary)]">
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacidad</a>
            <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
