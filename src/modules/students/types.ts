import type { UserRole } from "@/types";

export interface Student {
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
  studentProfile?: {
    id: string;
    enrollmentNumber?: string;
    birthDate?: string;
    gender?: string;
    bloodType?: string;
    address?: string;
    enrollments?: Array<{ id: string; status: string; enrolledAt: string; group: { id: string; name: string; grade: { name: string }; schoolYear: { name: string; active: boolean } } }>;
  };
}

export interface StudentGroup { id: string; name: string; grade: { name: string }; schoolYear: { name: string; active: boolean }; }
export interface SchoolOption { id: string; name: string; code: string; }
export type StudentDetailTab = "general" | "enrollments";
