export type AttendanceEventType = "CHECK_IN" | "CHECK_OUT" | "EARLY_RELEASE" | "RE_ENTRY";
export type ClassStatus = "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
export type ClassSessionMode = "GROUP" | "SUBJECT";

export interface Group { id: string; name: string; grade?: { name: string } }
export interface Subject { id: string; name: string; assigned?: boolean }
export interface Student { studentProfileId: string; firstName: string; lastName: string; enrollmentNumber?: string | null }
export interface ClassGroup extends Group { sessionMode: ClassSessionMode; subjects: Subject[] }
export interface ClassGroupContext {
  group: Group;
  sessionMode: ClassSessionMode;
  subjects: Subject[];
  students: Student[];
}
export interface PickupContact { id: string; name: string; relationship: string; requiresIdCheck: boolean; active?: boolean; photoPath?: string | null }
export interface ResolvedStudent { id: string; firstName: string; lastName: string; avatarUrl?: string | null; group: { name: string; grade?: { name: string } }; }
export interface Credential { credentialId: string; qrPayload: string }
