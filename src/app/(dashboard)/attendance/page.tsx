"use client";

import ModuleGuard from "@/components/shared/ModuleGuard";
import AttendancePageContent from "@/modules/attendance/components/AttendancePageContent";
import FamilyAttendancePage from "./family/page";
import { useAuthStore } from "@/store/auth.store";
import { UserRole } from "@/types";

export default function AttendancePage() {
  const user = useAuthStore((state) => state.user);
  if (user?.role === UserRole.PARENT || user?.role === UserRole.TUTOR || user?.role === UserRole.STUDENT) return <FamilyAttendancePage />;
  return <ModuleGuard moduleKey="attendance"><AttendancePageContent /></ModuleGuard>;
}
