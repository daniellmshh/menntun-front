"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalShellProps {
  children: ReactNode;
  className?: string;
}

export default function ModalShell({
  children,
  className = "items-center justify-center p-4",
}: ModalShellProps) {
  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex ${className}`}
      style={{ backdropFilter: "blur(8px)", background: "rgba(0,0,0,0.5)" }}
    >
      {children}
    </div>,
    document.body,
  );
}
