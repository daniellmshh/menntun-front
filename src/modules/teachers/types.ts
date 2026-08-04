import type { UserRole } from "@/types";

export interface Teacher {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  active: boolean;
  createdAt: string;
  schoolId: string;
  school?: { name: string; code: string };
  teacherProfile?: {
    employeeNumber?: string;
    specialty?: string;
    hireDate?: string;
    allowedModules?: string[];
    groupAssignments?: Array<{ id: string; group: { id: string; name: string; section?: string | null; grade?: { name: string } | null; schoolYear?: { name: string } | null } }>;
    subjectAssignments?: Array<{ id: string; subject: { name: string }; group?: { id: string; name: string; section?: string | null; grade?: { name: string } | null; schoolYear?: { name: string } | null } | null }>;
  };
}

export interface SchoolOption { id: string; name: string; code: string; }
export interface SchoolModule { module: string; active: boolean; isCore: boolean; }
export type TeacherDetailTab = "general" | "permissions" | "assignments";
