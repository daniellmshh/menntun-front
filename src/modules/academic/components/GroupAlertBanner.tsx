"use client";

import { useEffect } from "react";
import { CheckCircle, X, XCircle } from "lucide-react";
import type { AlertType } from "../types";

interface GroupAlertBannerProps {
  message: string;
  type: AlertType;
  onClose: () => void;
}

export default function GroupAlertBanner({
  message,
  type,
  onClose,
}: GroupAlertBannerProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-main text-sm font-medium transition-all duration-300 ${
        type === "success"
          ? "bg-[hsla(142,72%,45%,0.12)] border-[hsla(142,72%,45%,0.25)] text-[hsl(142,72%,60%)]"
          : "bg-[hsla(354,85%,56%,0.12)] border-[hsla(354,85%,56%,0.25)] text-[hsl(354,85%,70%)]"
      }`}
    >
      {type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <X size={14} />
      </button>
    </div>
  );
}
