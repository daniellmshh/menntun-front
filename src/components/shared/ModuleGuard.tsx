"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    if (isModulesLoading) return;

    let authorized = false;

    // 1. SUPER_ADMIN bypass
    if (user.role === UserRole.SUPER_ADMIN) {
      authorized = true;
    }
    // 2. Check Independent context
    else if (requireSchoolContext && user.isIndependent) {
      authorized = false;
    }
    // 3. Module check
    else {
      const normalizedModules = modules.map((m) => m.toLowerCase());
      authorized = normalizedModules.includes(moduleKey.toLowerCase());
    }

    setIsAuthorized(authorized);
  }, [user, modules, isModulesLoading, moduleKey, requireSchoolContext]);

  if (isAuthorized === null || isModulesLoading) {
    return <Loader />;
  }

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
