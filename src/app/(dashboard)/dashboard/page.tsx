"use client";

import React from "react";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types";
import Loader from "@/components/shared/Loader";
import IndependentDashboard from "./components/IndependentDashboard";
import SchoolAdminDashboard from "./components/SchoolAdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading || !user) return <Loader />;

  const firstName = user.firstName || "Usuario";

  // SUPER_ADMIN
  if (user.role === UserRole.SUPER_ADMIN) {
    return <SuperAdminDashboard userName={firstName} />;
  }

  // SCHOOL_ADMIN — independent workspace
  if (user.role === UserRole.SCHOOL_ADMIN && user.isIndependent) {
    return <IndependentDashboard userName={firstName} />;
  }

  // SCHOOL_ADMIN — full school
  if (user.role === UserRole.SCHOOL_ADMIN) {
    return <SchoolAdminDashboard userName={firstName} />;
  }

  // TEACHER
  if (user.role === UserRole.TEACHER) {
    return <TeacherDashboard userName={firstName} />;
  }

  // STUDENT / PARENT / TUTOR — placeholder (futuro)
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="gradient-text text-3xl font-extrabold tracking-tight">
          Bienvenido, {firstName} 👋
        </h1>
        <p className="text-[var(--text-secondary)] text-sm mt-1">
          Tu panel personalizado está en construcción.
        </p>
      </div>
      <div className="glass-panel p-10 text-center text-[var(--text-muted)]">
        <p className="text-4xl mb-3">🚧</p>
        <p className="text-sm">Panel para el rol <strong>{user.role}</strong> próximamente.</p>
      </div>
    </div>
  );
}
