import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacidad | Menntun",
  description: "Aviso de privacidad de Menntun School Management."
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] font-sans py-24">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8">
          <ArrowLeft size={16} /> Volver al inicio
        </Link>
        <div className="glass-panel p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-6">Aviso de Privacidad</h1>
          <p className="text-[var(--text-secondary)] mb-8 text-sm">Última actualización: {new Date().toLocaleDateString()}</p>
          
          <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">1. Introducción</h2>
            <p>
              Este documento es un texto provisional. Aquí se detallarán las políticas de recolección, uso y protección de datos personales de los usuarios de la plataforma Menntun, en cumplimiento con las leyes de protección de datos aplicables.
            </p>
            
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">2. Información Recopilada</h2>
            <p>
              [Texto Placeholder] Menntun recopila información de contacto y datos académicos necesarios para el funcionamiento de los módulos contratados por la institución educativa.
            </p>
            
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">3. Uso de la Información</h2>
            <p>
              [Texto Placeholder] Los datos son utilizados exclusivamente para la prestación de los servicios educativos, la generación de planeaciones mediante IA y el control administrativo de la escuela.
            </p>

            <h2 className="text-2xl font-bold text-[var(--text-primary)]">4. Seguridad y Retención</h2>
            <p>
              [Texto Placeholder] Todos los datos están protegidos por encriptación en tránsito y en reposo (Row-Level Security en la base de datos).
            </p>

            <h2 className="text-2xl font-bold text-[var(--text-primary)]">5. Contacto</h2>
            <p>
              Para ejercer sus derechos ARCO, puede contactarnos a través de los canales oficiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
