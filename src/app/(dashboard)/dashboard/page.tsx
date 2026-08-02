"use client";

import React from "react";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types";
import Loader from "@/components/shared/Loader";
import IndependentDashboard from "./components/IndependentDashboard";
import SchoolAdminDashboard from "./components/SchoolAdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import SuperAdminDashboard from "./components/SuperAdminDashboard";
import OrgAdminDashboard from "./components/OrgAdminDashboard";
import FamilyDashboard from "./components/FamilyDashboard";

export default function DashboardPage() {
  const { user, isLoading } = useAuthStore();

  if (isLoading || !user) return <Loader />;

  const firstName = user.firstName || "Usuario";

  // SUPER_ADMIN
  if (user.role === UserRole.SUPER_ADMIN) {
    return <SuperAdminDashboard userName={firstName} />;
  }

  // ORG_ADMIN
  if (user.role === UserRole.ORG_ADMIN) {
    return <OrgAdminDashboard />;
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

  return <FamilyDashboard userName={firstName} />;
}
