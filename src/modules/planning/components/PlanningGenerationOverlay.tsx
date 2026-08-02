"use client";

import { Sparkles } from "lucide-react";

interface PlanningGenerationOverlayProps {
  content: string;
  status: string;
  progress: number;
}

export default function PlanningGenerationOverlay({ content, status, progress }: PlanningGenerationOverlayProps) {

    // Extrae fragmentos legibles del JSON parcial acumulado
    const extractPreview = (raw: string) => {
      const items: { tipo: "titulo" | "momento" | "actividad"; texto: string }[] = [];

      // Título
      const titleMatch = raw.match(/"title"\s*:\s*"([^"]{3,})"/);
      if (titleMatch) items.push({ tipo: "titulo", texto: titleMatch[1] });

      // Momentos
      const momentoMatches = [...raw.matchAll(/"momento"\s*:\s*"([^"]{3,})"/g)];
      momentoMatches.forEach((m) => items.push({ tipo: "momento", texto: m[1] }));

      // Actividades (primera línea de cada actividad)
      const actMatches = [...raw.matchAll(/"actividades"\s*:\s*"((?:[^"\\]|\\.)*)"/g)];
      actMatches.forEach((m) => {
        const firstLine = m[1]
          .replace(/\\n/g, "\n")
          .split("\n")
          .find((l) => l.trim().length > 10);
        if (firstLine) items.push({ tipo: "actividad", texto: firstLine.replace(/^-\s*/, "").trim() });
      });

      return items;
    };

    const previewItems = extractPreview(content);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        {/* Blobs de fondo — siempre sutiles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-[0.07] animate-pulse"
            style={{ background: "var(--accent-primary)" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-[0.07] animate-pulse"
            style={{ background: "var(--accent-secondary)", animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-4">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse"
              style={{
                background: "color-mix(in srgb, var(--accent-primary) 15%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent-primary) 35%, transparent)",
              }}
            >
              <Sparkles size={28} style={{ color: "var(--accent-primary)" }} />
            </div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Generando tu planeación</h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              La IA está construyendo la Matriz Didáctica completa…
            </p>
          </div>

          {/* Barra de progreso */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                {status}
              </span>
              <span className="text-xs font-bold" style={{ color: "var(--accent-primary-light)" }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full"
              style={{ background: "var(--border-glass)" }}
            >
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))",
                  boxShadow: progress > 10 ? "var(--shadow-glow)" : "none",
                }}
              />
            </div>
          </div>

          {/* Preview humanizada */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-glass)",
              minHeight: "220px",
              maxHeight: "260px",
              overflowY: "auto",
            }}
          >
            {previewItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 gap-3">
                <div
                  className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "var(--accent-primary)", borderTopColor: "transparent" }}
                />
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Esperando respuesta de la IA…
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {previewItems.map((item, i) => {
                  if (item.tipo === "titulo") {
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-lg leading-none mt-0.5">📋</span>
                        <div>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider mb-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            Título del proyecto
                          </p>
                          <p
                            className="text-sm font-semibold leading-snug"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {item.texto}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  if (item.tipo === "momento") {
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{
                          background: "color-mix(in srgb, var(--accent-primary) 10%, transparent)",
                          border: "1px solid color-mix(in srgb, var(--accent-primary) 20%, transparent)",
                        }}
                      >
                        <span className="text-sm">🔷</span>
                        <p
                          className="text-xs font-semibold"
                          style={{ color: "var(--accent-primary-light)" }}
                        >
                          {item.texto}
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="flex items-start gap-2 pl-2">
                      <span
                        className="text-xs mt-1 shrink-0"
                        style={{ color: "var(--accent-success)" }}
                      >
                        ✓
                      </span>
                      <p
                        className="text-xs leading-relaxed line-clamp-2"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {item.texto}
                      </p>
                    </div>
                  );
                })}
                {/* Cursor parpadeante al final */}
                <span
                  className="inline-block w-2 h-3.5 align-middle animate-pulse rounded-sm"
                  style={{ background: "var(--accent-primary)" }}
                />
              </div>
            )}
          </div>

          {/* Nota inferior */}
          <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
            Esto puede tomar entre 20 y 40 segundos &mdash; no cierres esta ventana
          </p>
        </div>
      </div>
    );

}

