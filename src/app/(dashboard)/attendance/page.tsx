"use client";

import ModuleGuard from "@/components/shared/ModuleGuard";
import AttendancePageContent from "@/modules/attendance/components/AttendancePageContent";

export default function AttendancePage() {
  return <ModuleGuard moduleKey="attendance"><AttendancePageContent /></ModuleGuard>;
}
