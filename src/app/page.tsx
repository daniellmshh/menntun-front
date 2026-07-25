import type { Metadata } from 'next';
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  GraduationCap, 
  ArrowRight, 
  ShieldCheck, 
  Cpu, 
  Database,
  CheckCircle2,
  Smartphone,
  Users,
  Sparkles,
  Send
} from "lucide-react";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/ui/SocialIcons";
import LandingNavbar from "@/components/ui/LandingNavbar";
import { FadeUp, FadeLeft, FadeRight, StaggerContainer } from "@/components/ui/MotionWrappers";

export const metadata: Metadata = {
  title: "Menntun | El futuro de la gestión escolar",
  description: "Menntun es un sistema modular, seguro y veloz que centraliza toda la administración educativa. Desde planeaciones impulsadas por Inteligencia Artificial (NEM) hasta control total multi-plantel.",
  openGraph: {
    title: "Menntun | El futuro de la gestión escolar",
    description: "Gestión inteligente para colegios y maestros independientes. Planeaciones con IA, control de pagos, y arquitectura modular.",
    url: "https://menntun.com.mx",
    siteName: "Menntun",
    images: [
      {
        url: "https://menntun.com.mx/images/hero-dashboard.jpg",
        width: 1200,
        height: 630,
        alt: "Menntun Dashboard",
      }
    ],
    type: "website",
  }
};

export default function LandingPage() {
  const WHATSAPP_NUMBER = "528126087821"; 
  const WHATSAPP_MESSAGE = encodeURIComponent("¡Hola! Me interesa conocer más sobre Menntun y agendar una demo gratuita.");
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans overflow-x-hidden">
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Menntun",
            "applicationCategory": "EducationalApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "MXN"
            },
            "description": "Menntun es un sistema modular de gestión escolar con planeaciones impulsadas por IA."
          })
        }}
      />

      {/* Decorative ambient glows */}
      <div className="ambient-glow ambient-glow-1" />
      <div className="ambient-glow ambient-glow-2" />

      {/* 1. NAVBAR (Client Component) */}
      <LandingNavbar />

      <main className="pt-[var(--header-height)] relative z-10">
        
        {/* 2. HERO SECTION */}
        <StaggerContainer as="section" className="max-w-7xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-24 flex flex-col items-center text-center gap-8">
          <FadeUp className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--accent-primary-light)]/30 bg-[var(--accent-primary)]/10 text-[var(--accent-primary-light)] text-sm font-semibold mb-4">
            <Sparkles size={16} />
            El futuro de la gestión escolar
          </FadeUp>
          <FadeUp as="h1" className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight">
            Gestión Inteligente para Colegios y <br className="hidden md:block" />
            <span className="gradient-accent-text">Maestros Independientes</span>
          </FadeUp>
          <FadeUp as="p" className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            Menntun es un sistema modular, seguro y veloz que centraliza toda la administración educativa. 
            Desde planeaciones impulsadas por Inteligencia Artificial (NEM) hasta control total multi-plantel.
          </FadeUp>
          
          <FadeUp className="flex flex-col sm:flex-row items-center gap-4 mt-6 w-full sm:w-auto">
            <Link href="/login" className="glass-button h-14 px-8 text-lg w-full sm:w-auto shadow-glow flex items-center justify-center">
              Ingresar al Sistema <ArrowRight size={20} className="ml-2" />
            </Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="glass-button-secondary h-14 px-8 text-lg w-full sm:w-auto flex items-center justify-center">
              Agendar demo gratuita
            </a>
          </FadeUp>

          {/* Hero Image / App Mockup */}
          <FadeUp className="mt-16 w-full max-w-5xl rounded-[var(--radius-xl)] p-2 bg-gradient-to-br from-[var(--border-glass)] to-[var(--bg-base)] shadow-2xl relative">
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[var(--bg-base)] to-transparent z-10 rounded-b-[var(--radius-lg)]" />
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
          </FadeUp>
        </StaggerContainer>

        {/* SOCIAL PROOF SECTION */}
        <StaggerContainer as="section" className="max-w-7xl mx-auto px-6 py-12 border-y border-[var(--border-glass)] bg-white/[0.01]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <FadeUp>
              <div className="text-3xl md:text-4xl font-extrabold gradient-accent-text mb-2">500+</div>
              <div className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Planeaciones IA</div>
            </FadeUp>
            <FadeUp>
              <div className="text-3xl md:text-4xl font-extrabold gradient-accent-text mb-2">12</div>
              <div className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Escuelas Activas</div>
            </FadeUp>
            <FadeUp>
              <div className="text-3xl md:text-4xl font-extrabold gradient-accent-text mb-2">99.9%</div>
              <div className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Uptime</div>
            </FadeUp>
            <FadeUp>
              <div className="text-3xl md:text-4xl font-extrabold gradient-accent-text mb-2">24/7</div>
              <div className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Soporte Dedicado</div>
            </FadeUp>
          </div>
        </StaggerContainer>

        {/* 3. FEATURES SECTION */}
        <section id="features" className="py-24 bg-[var(--bg-surface)]/50 border-y border-[var(--border-glass)] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Lo que Menntun hace por ti</h2>
              <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                Diseñado para reducir la carga administrativa y potenciar el aprendizaje con tecnología de punta.
              </p>
            </FadeUp>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-24 overflow-hidden">
              <FadeLeft className="space-y-6">
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
              </FadeLeft>
              <FadeRight className="relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-glass)] shadow-glass h-[400px]">
                 <Image src="/images/ai-planning.jpg" alt="Planeaciones IA" fill className="object-cover object-left-top" unoptimized />
              </FadeRight>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center overflow-hidden">
              <FadeLeft className="order-2 md:order-1 relative rounded-[var(--radius-lg)] overflow-hidden border border-[var(--border-glass)] shadow-glass h-[400px]">
                <Image src="/images/modular-architecture.jpg" alt="Arquitectura Modular" fill className="object-cover object-left-top" unoptimized />
              </FadeLeft>
              <FadeRight className="space-y-6 order-1 md:order-2">
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
              </FadeRight>
            </div>
          </div>
        </section>

        {/* 4. ROADMAP */}
        <StaggerContainer as="section" id="roadmap" className="py-24">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <FadeUp as="h2" className="text-3xl md:text-5xl font-bold mb-4">El Futuro de Menntun</FadeUp>
            <FadeUp as="p" className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto mb-16">
              El desarrollo nunca se detiene. Esto es lo que llegará muy pronto a nuestro ecosistema.
            </FadeUp>

            <div className="grid sm:grid-cols-3 gap-8">
              <FadeUp className="glass-panel p-8 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                <Smartphone size={48} className="text-[var(--accent-primary-light)]" />
                <h3 className="text-xl font-bold">Apps Móviles Nativas</h3>
                <p className="text-sm text-[var(--text-muted)]">Aplicaciones para iOS (SwiftUI) y Android (Kotlin) conectadas a la misma API para acceso desde cualquier lugar.</p>
              </FadeUp>
              <FadeUp className="glass-panel p-8 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                <Users size={48} className="text-[var(--accent-secondary)]" />
                <h3 className="text-xl font-bold">Portal de Padres y Alumnos</h3>
                <p className="text-sm text-[var(--text-muted)]">Cuentas de solo lectura para que las familias den seguimiento a calificaciones, asistencias y reportes disciplinarios.</p>
              </FadeUp>
              <FadeUp className="glass-panel p-8 text-center flex flex-col items-center gap-4 hover:-translate-y-2 transition-transform duration-300">
                <ShieldCheck size={48} className="text-[var(--accent-cyan)]" />
                <h3 className="text-xl font-bold">Pagos y Facturación</h3>
                <p className="text-sm text-[var(--text-muted)]">Módulo financiero integral para gestionar colegiaturas, becas, cobros automatizados y facturación local.</p>
              </FadeUp>
            </div>
          </div>
        </StaggerContainer>

        {/* 5. PRICING SECTION */}
        <StaggerContainer as="section" id="pricing" className="py-24 bg-[var(--bg-surface)]/50 border-y border-[var(--border-glass)]">
          <div className="max-w-7xl mx-auto px-6">
            <FadeUp className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">Paquetes Modulares</h2>
              <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
                Elige el plan que mejor se adapte al tamaño de tu institución.
              </p>
            </FadeUp>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <FadeUp className="glass-panel p-8 flex flex-col gap-6">
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
                <a href={WHATSAPP_LINK} className="glass-button-secondary w-full text-center flex items-center justify-center">Me interesa</a>
              </FadeUp>

              <FadeUp className="glass-panel-interactive p-8 flex flex-col gap-6 border-[var(--accent-primary)]/50 relative transform md:-translate-y-4 shadow-glow z-10 hover:scale-[1.02] transition-transform duration-300">
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
                <a href={WHATSAPP_LINK} className="glass-button w-full text-center flex items-center justify-center">Contactar Ventas</a>
              </FadeUp>

              <FadeUp className="glass-panel p-8 flex flex-col gap-6">
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
                <a href={WHATSAPP_LINK} className="glass-button-secondary w-full text-center flex items-center justify-center">Cotizar a medida</a>
              </FadeUp>
            </div>
          </div>
        </StaggerContainer>

        {/* 6. CONTACT SECTION */}
        <StaggerContainer as="section" id="contact" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
            
            {/* Form */}
            <FadeLeft className="glass-panel p-8 md:p-12 space-y-6 z-10">
              <h2 className="text-3xl font-bold">¿Tienes dudas? Escríbenos</h2>
              <p className="text-[var(--text-secondary)] text-sm">Déjanos tus datos y un asesor se pondrá en contacto contigo lo antes posible para una demostración.</p>
              
              <form className="space-y-4" action="#">
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
                <button type="submit" className="glass-button w-full mt-2 flex items-center justify-center gap-2">
                  <Send size={18} /> Enviar Mensaje
                </button>
              </form>
            </FadeLeft>

            {/* Direct Contact (WhatsApp) */}
            <FadeRight className="flex flex-col justify-center space-y-8 z-10">
              <div>
                <h2 className="text-4xl font-extrabold mb-4">Habla directamente con nosotros</h2>
                <p className="text-[var(--text-secondary)] text-lg">
                  Si prefieres una atención inmediata o tienes preguntas técnicas, estamos disponibles en WhatsApp en este momento.
                </p>
              </div>
              
              <div className="flex flex-col gap-6">
                <a 
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-4 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-light)] text-white px-8 py-4 rounded-2xl shadow-glow transition-all transform hover:-translate-y-1 w-full sm:w-max font-bold text-lg"
                >
                  <WhatsAppIcon className="w-7 h-7" />
                  Chatear por WhatsApp
                </a>

                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Síguenos en nuestras redes</p>
                  <div className="flex items-center gap-4">
                    <a 
                      href="https://www.facebook.com/menntunmx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-secondary)]/10 hover:bg-[var(--accent-secondary)]/20 border border-[var(--accent-secondary)]/30 transition-all transform hover:-translate-y-1 group"
                    >
                      <FacebookIcon className="w-8 h-8 text-[var(--accent-secondary)] dark:text-white transition-all" />
                    </a>
                    <a 
                      href="https://www.instagram.com/menntun.mx/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--accent-secondary)]/10 hover:bg-[var(--accent-secondary)]/20 border border-[var(--accent-secondary)]/30 transition-all transform hover:-translate-y-1 group"
                    >
                      <InstagramIcon className="w-8 h-8 text-[var(--accent-secondary)] dark:text-white transition-all" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Decorative Image */}
              <div className="relative w-full h-[250px] rounded-2xl overflow-hidden mt-8 opacity-80 border border-[var(--border-glass)]">
                <Image src="/images/contact-support.jpg" alt="Soporte Menntun" fill className="object-cover" unoptimized />
              </div>
            </FadeRight>
          </div>
        </StaggerContainer>

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
            <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacidad</Link>
            <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Términos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
