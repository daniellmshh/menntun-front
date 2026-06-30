export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  SCHOOL_ADMIN = "SCHOOL_ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
  PARENT = "PARENT",
  TUTOR = "TUTOR",
}

export interface RequestUser {
  id: string;
  supabaseUid: string;
  email: string;
  role: UserRole;
  schoolId: string;
  firstName: string;
  lastName: string;
  teacherProfile?: {
    id: string;
    userId: string;
    employeeNumber?: string | null;
    specialty?: string | null;
    hireDate?: string | null;
    allowedModules?: string[];
  } | null;
}

export interface ApiResponse<T> {
  data: T;
  meta: any | null;
  error: string | null;
}
