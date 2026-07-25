import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones | Menntun",
  description: "Términos y Condiciones de Uso de Menntun School Management."
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans py-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
        <div className="glass-panel p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Términos y Condiciones</h1>
          <p className="text-[var(--text-secondary)] mb-8 text-sm">Última actualización: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">1. Aceptación de los Términos</h2>
            <p>
              Este documento es un texto provisional. Al utilizar Menntun, usted acepta estar sujeto a estos Términos y Condiciones. Si no está de acuerdo con alguna parte, no podrá utilizar el servicio.
            </p>
            
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">2. Servicios y Módulos</h2>
            <p>
              [Texto Placeholder] Menntun se ofrece como Software as a Service (SaaS). El acceso a módulos específicos depende de su suscripción o la de su institución educativa.
            </p>
            
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">3. Responsabilidad del Usuario</h2>
            <p>
              [Texto Placeholder] El usuario es responsable de mantener la confidencialidad de su cuenta y de toda actividad que ocurra bajo la misma.
            </p>

            <h2 className="text-2xl font-bold text-[var(--text-primary)]">4. Limitación de Responsabilidad</h2>
            <p>
              [Texto Placeholder] Menntun provee herramientas para facilitar el trabajo educativo, pero la exactitud y aplicación pedagógica recae sobre la institución.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
