"use client";

import React from "react";
import { useAuthStore } from "@/store/auth.store";
import { useActiveModules } from "@/hooks/useActiveModules";
import { UserRole } from "@/types";
import Loader from "./Loader";
import { Lock } from "lucide-react";
import Link from "next/link";

interface ModuleGuardProps {
  moduleKey: string;
  children: React.ReactNode;
  requireSchoolContext?: boolean; // Set to true if the page cannot be viewed by INDEPENDENT workspaces
}

export default function ModuleGuard({
  moduleKey,
  children,
  requireSchoolContext = false,
}: ModuleGuardProps) {
  const { user } = useAuthStore();
  const { modules, isLoading: isModulesLoading } = useActiveModules();

  if (!user || isModulesLoading) {
    return <Loader />;
  }

  const isAuthorized =
    user.role === UserRole.SUPER_ADMIN ||
    (!requireSchoolContext || !user.isIndependent) &&
      modules.some((module) => module.toLowerCase() === moduleKey.toLowerCase());

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-fade-in px-4">
        <div className="w-20 h-20 rounded-3xl bg-[var(--accent-danger)]/10 border border-[var(--accent-danger)]/20 flex items-center justify-center text-[var(--accent-danger)] shadow-glow">
          <Lock size={40} />
        </div>
        <div className="text-center space-y-2 max-w-md">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Acceso Denegado</h2>
          <p className="text-[var(--text-secondary)] text-sm">
            Este módulo no está activo para tu cuenta o no cuentas con los permisos necesarios para visualizarlo.
          </p>
        </div>
        <Link href="/dashboard" className="glass-button">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
