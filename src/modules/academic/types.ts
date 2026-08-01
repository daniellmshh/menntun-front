import { translations } from "@/lib/translations";

export interface School {
  id: string;
  name: string;
  code: string;
}

export interface Grade {
  id: string;
  schoolId: string;
  name: string;
  level: string | null;
}

export interface SchoolYear {
  id: string;
  schoolId: string;
  name: string;
  active: boolean;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  teacherProfile?: { id: string };
}

export interface GroupTeacher {
  teacherProfileId: string;
  isHomeroom: boolean;
  teacherProfile: {
    id: string;
    user: { firstName: string; lastName: string; email: string };
  };
}

export interface AcademicGroup {
  id: string;
  schoolId: string;
  gradeId: string;
  schoolYearId: string;
  name: string;
  maxStudents: number | null;
  grade?: { name: string; level: string | null };
  schoolYear?: { name: string; active: boolean };
  school?: { name: string; code: string };
  teachers?: GroupTeacher[];
  _count?: { enrollments: number; teachers?: number };
}

export interface SubjectRow {
  id: string;
  name: string;
  code: string | null;
  assigned: boolean;
  assignmentId: string | null;
  teacher: { id: string; user: { firstName: string; lastName: string } } | null;
}

export interface StudentRow {
  studentProfileId: string;
  enrollmentNumber: string | null;
  firstName: string;
  lastName: string;
  email: string;
}

export type GroupTranslations = (typeof translations)["es"]["groups"];
export type AlertType = "success" | "error";
