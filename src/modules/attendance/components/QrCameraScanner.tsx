"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, IScannerControls } from "@zxing/browser";

export default function QrCameraScanner({ onDetected }: { onDetected: (payload: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const reader = new BrowserQRCodeReader();
    if (!videoRef.current) return;
    reader.decodeFromConstraints({ video: { facingMode: { ideal: "environment" } } }, videoRef.current, (result, scanError, nextControls) => {
      controls.current = nextControls;
      if (result) { onDetected(result.getText()); nextControls.stop(); }
      if (scanError && scanError.name === "NotAllowedError") setError("Autoriza la cámara para escanear el QR.");
    }).catch(() => setError("No fue posible iniciar la cámara. Usa el lector físico o pega el código."));
    return () => controls.current?.stop();
  }, [onDetected]);

  return <div className="space-y-2"><video ref={videoRef} muted playsInline className="w-full max-h-60 rounded-xl border border-[var(--border-glass)] bg-black object-cover" />{error && <p className="text-xs text-[var(--danger)]">{error}</p>}<p className="text-xs text-[var(--text-secondary)]">La cámara sólo lee el QR; Menntun valida el contenido en el servidor.</p></div>;
}
